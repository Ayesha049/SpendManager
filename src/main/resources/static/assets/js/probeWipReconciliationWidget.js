$.widget("forecast.probeWipReconciliation", {
    options: {
        messages: undefined,
        probeWoId: 0
    },
    _create: function () {
        console.log("SMNLOG :: ---------- Probe WIP Reconciliation widget create ----------");
        var self = this;
        self.el = {};
        self.data = {};
        self.data.singleReconcileQtyError = false;
        self.data.singleMaxQtyError = false;

        // UI element Initialization
        self.el.singleReconcileForm = $("#singleReconcileForm");
        self.el.workOrderSelect = $(".workOrderSelect");
        self.el.wipReconciliationDetailsTable = $(".wipReconciliationDetailsTable");
        self.el.allReconcileBtn = $(".allReconcile");
        self.el.reconcileSingleBtn = '<button type="button" class="btn btn-block btn-danger singleReconcile">'+self.options.messages.reconcileBtnSingle+'</button>';
        // self.el.reconcileAllBtn = '<button class="btn btn-block btn-danger allReconcile">'+self.options.messages.reconcileBtnAll+'</button>';

        self.el.workOrderSelect.change(function () {
            var probeWorkOrderId = +$(this).val();
            self.makeWipReconciliationDetailsTable(probeWorkOrderId);
        });

        $(document).on('click', '.singleReconcile', function(){
            console.log("SMNLOG :: btn is clicked");
            self.singleReconcileBtnEvent($(this).closest('tr'), false);
        });

        self.el.allReconcileBtn.click(function(){
            self.data.singleReconcileQtyError = false;
            self.data.singleMaxQtyError = false;
            self.el.wipReconciliationDetailsTable.find('table tbody tr').each(function(){
                var trRow = $(this);
                var buttonExist = $(this).find('.singleReconcile').length;
                console.log("SMNLOG buttonExist::"+JSON.stringify(buttonExist));

                if(buttonExist > 0){
                    setTimeout(function(){
                        self.singleReconcileBtnEvent(trRow, true);
                    },500);
                }
            });
        });

        if(self.options.probeWoId > 0){
            console.log("SMNLOG probeWoId::"+self.options.probeWoId);
            self.el.workOrderSelect.val(self.options.probeWoId).trigger('change');
        }
    },
    _init: function () {
        console.log("SMNLOG :: ---------- Probe WIP Reconciliation init ----------");
        var self = this;

    },
    makeWipReconciliationDetailsTable: function (probeWorkOrderId) {
        var self = this;
        var listSize = 0;

        if (probeWorkOrderId > 0) {
            var html = '<table class="table table-striped custom-table">';
            html += '<thead>';
            html += '<tr>';
            html += '<th>SL#</th>';
            html += '<th>' + self.options.messages.tapeOutNumber + '</th>';
            html += '<th>' + self.options.messages.totalQuantity + '</th>';
            html += '<th>' + self.options.messages.inProgressQuantity + '</th>';
            html += '<th>' + self.options.messages.completedQuantity + '</th>';
            html += '<th>' + self.options.messages.quantityToBeCompleted + '</th>';
            html += '<th></th>';
            html += '</tr>';
            html += '</thead>';

            html += '<tbody>';

            $.get('/admin/getProbeWipInventoryForReconciliation', {probeWorkOrderId: probeWorkOrderId}, function (list) {

            }).then(function(list){
                console.log("SMNLOG list 22::"+JSON.stringify(list));
                listSize = list.length;

                $.each(list, function (index, item) {
                    html += self.getTableRowHtmlByProductItem(item, index);
                });
                html += '</tbody>';
                html += '</table>';
            }).always(function(){
                self.el.wipReconciliationDetailsTable.html(html);

                if(listSize > 0){
                    self.initiateFormValidation(listSize);
                }
            });
        }
    },
    getTableRowHtmlByProductItem: function(item, index, recincileSuccess){
        var self = this;
        var html = '';
        html += '<tr';
        if(item.completed == true){
            html += ' class="successBackground"';
        }
        html += ' data-product-item-id="'+item.id+'" data-service-execution-plan-id="'+item.serviceExecutionPlanId+'" '
            + ' data-in-progress-qty="'+item.inProgressQuantity+'" data-probeWorkorder-id="'+item.probeWorkOrderId+'" '
            + ' data-name-attr="reconcileQuantity_'+(index)+'">';

        html += '<td>'+ (index+1) +'</td>';
        html += '<td>'+ item.deviceCode +'</td>';
        html += '<td>'+ item.inQuantity +'</td>';
        html += '<td>'+ item.inProgressQuantity +'</td>';
        // html += '<td>'+ item.outQuantity +'</td>';
        html += '<td>'+ item.outQuantity;

        if(recincileSuccess){
            html += '<div class="alert alert-success tempMessage" style="padding:3px; text-align: center;">Reconciliation successful</div>';
        }
        html += '</td>';

        if(item.completed == true){
            html += '<td colspan="2" style="text-align: left;"><label style="color: darkgreen; font-weight: bold;">' + self.options.messages.allAreCompleted + '</label></td>';
        }else{
            html += '<td><input type="text" class="form-control reconcileQuantity" name="reconcileQuantity_'+index+'" style="width: 150px;"/></td>';
            html += '<td>'+ self.el.reconcileSingleBtn +'</td>';
        }

        html += '</tr>';
        return html;
    },
    singleReconcile: function(probeWorkOrderId, productItemId, serviceExecutionId, reconcileQty, rowObject){
        var self = this;
        var validator = self.el.singleReconcileForm.validate();
        Forecast.APP.startLoading();

        $.get('/admin/reconcileProbeService',
            {
                probeWorkOrderId: probeWorkOrderId,
                productItemId: productItemId,
                serviceExecutionId: serviceExecutionId,
                reconcileQty: reconcileQty
            },
        function(updatedProductItem){
            console.log("SMNLOG updatedProductItem::"+JSON.stringify(updatedProductItem));
            var updatedRow = self.getTableRowHtmlByProductItem(updatedProductItem, rowObject.length, true);
            $(rowObject).replaceWith(updatedRow);
        }).always(function(){
            Forecast.APP.stopLoading();

            var initialHideTime = 5000;// in miliseconds
            self.el.wipReconciliationDetailsTable.find('table tbody tr td div.tempMessage').each(function(){
                var that = this;
                initialHideTime += 1000;
                setTimeout(function(){
                    $(that).hide(500);
                },initialHideTime);
            });
        });

    },
    initiateFormValidation: function (length) {
        console.log("SMNLOG length::"+JSON.stringify(length));
        var self = this;
        var rulesJson = {};

        for(var i=0; i< length; i++){
            rulesJson['reconcileQuantity_'+i] = {
                required: true,
                digits: true
            }
        }

        console.log("SMNLOG rulesJson::"+JSON.stringify(rulesJson));
        var validateJson = {
            rules: rulesJson,
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };
        self.el.singleReconcileForm.validate(validateJson);
    },
    singleReconcileBtnEvent: function(trObject, reconcileAllBtn){
        var self = this;
        var probeWorkOrderId = +trObject.attr('data-probeWorkorder-id');
        var serviceExecutionPlanId = +trObject.attr('data-service-execution-plan-id');
        var productItemId = +trObject.attr('data-product-item-id');
        var maxAllowedQuantity = +trObject.attr('data-in-progress-qty');
        var reconcileQty = trObject.find('.reconcileQuantity').val();
        var reconcileQtyInputName = trObject.attr('data-name-attr');
        var errorMessageObject = {};
        var validator = self.el.singleReconcileForm.validate();
        var errorMessage = "";

        if(isNaN(parseInt(reconcileQty)) || parseInt(reconcileQty) == 0 || !Forecast.APP.isDigits(reconcileQty)){
            errorMessage = self.options.messages.invalidQty;
            if(reconcileAllBtn){
                if(!self.data.singleReconcileQtyError){
                    bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(errorMessage));
                    self.data.singleReconcileQtyError = true;
                }
            }else{
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(errorMessage));
            }
            errorMessageObject[reconcileQtyInputName] = errorMessage;
            validator.showErrors(errorMessageObject);
        }else if(parseInt(reconcileQty) > 0 && parseInt(reconcileQty) > maxAllowedQuantity) {
            errorMessage = self.options.messages.qtyLimitExceed.replace('*', maxAllowedQuantity);
            if(reconcileAllBtn){
                if(!self.data.singleMaxQtyError){
                    bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(errorMessage));
                    self.data.singleMaxQtyError = true;
                }
            }else{
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(errorMessage));
            }
            errorMessageObject[reconcileQtyInputName] = errorMessage;
            validator.showErrors(errorMessageObject);
        }else if(serviceExecutionPlanId == 0 || productItemId == 0){
            errorMessage = self.options.messages.invalidData;
            bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(errorMessage));
            errorMessageObject[reconcileQtyInputName] = errorMessage;
            validator.showErrors(errorMessageObject);

        }else{
            self.singleReconcile(probeWorkOrderId, productItemId, serviceExecutionPlanId, parseInt(reconcileQty), trObject)
        }
    },
    destroy: function () {
    }
});
