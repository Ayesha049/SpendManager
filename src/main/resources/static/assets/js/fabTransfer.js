$.widget("forecast.fabTransfer", {
    options: {
        messages: undefined
    },
    _create: function () {
        console.log("SMNLOG :: ---------- Fab Transfer widget create ----------");
        var self = this;
        self.el = {};
        self.data = {};

        // UI element Initialization
        self.el.fabTransferForm = $("#transferForm");
        self.el.workOrderSelect = $(".workOrderSelect");
        self.el.wipTransferDetailsTable = $(".wipTransferDetailsTable");
        self.el.transferStatusDetailsTable = $(".transferStatusDetailsTable");
        self.el.transferBtn = '<button type="button" class="btn btn-block btn-danger transferProductItem">'+self.options.messages.transferBtn+'</button>';
        self.el.transitBtn = '<button type="button" class="btn btn-danger statusChangeTransferProductItem" status="transit">'+self.options.messages.moveToTransit+'</button>';
        self.el.nextReceivedBtn = '<button type="button" class="btn btn-danger statusChangeTransferProductItem" status="nextReceived">'+self.options.messages.moveToNextReceived+'</button>';

        self.el.workOrderSelect.change(function () {
            var fabWorkOrderId = +$(this).val();
            console.log("select fabWorkOrderId :::: " + fabWorkOrderId);
            self.makeWipTransferDetailsTable(fabWorkOrderId);
        });

        $(document).on('click', '.transferProductItem', function(){
            console.log("SMNLOG :: btn is clicked");
            self.transferProductItemBtnEvent($(this).closest('tr'));
        });
        $(document).on('click', '.statusChangeTransferProductItem', function(){
            console.log("SMNLOG :: status btn is clicked SMNLOG :: new status:::: "+ $(this).attr('status'));
            self.changeStatusTransferProductItemBtnEvent($(this).closest('tr'), $(this).attr('status'));
        });
        
    },
    _init: function () {
        console.log("SMNLOG :: ---------- Fab WIP Transfer init ----------");
        var self = this;

    },
    makeWipTransferDetailsTable: function (fabWorkOrderId) {
        var self = this;
        var listSize = 0;

        if (fabWorkOrderId > 0) {
            var html = '<table class="table table-striped custom-table">';
            html += '<thead>';
            html += '<tr>';
            html += '<th>SL#</th>';
            html += '<th>' + self.options.messages.fabTapeOutNumber + '</th>';
            html += '<th>' + self.options.messages.totalQuantity + '</th>';
            html += '<th>' + self.options.messages.inProgressQuantity + '</th>';
            html += '<th>' + self.options.messages.completedQuantity + '</th>';
            html += '<th>' + self.options.messages.availableForTransfer + '</th>';
            html += '<th>'+ self.options.messages.transferAction+'</th>';
            html += '</tr>';
            html += '</thead>';

            html += '<tbody>';

            $.get('/admin/getFabWipInventoryForTransfer', {fabWorkOrderId: fabWorkOrderId}, function (list) {

            }).then(function(list){
                console.log("SMNLOG list 22::"+JSON.stringify(list));
                listSize = list.length;

                $.each(list, function (index, item) {
                    html += self.getTableRowHtmlByProductItem(item, index);
                });
                html += '</tbody>';
                html += '</table>';
            }).always(function(){
                self.el.wipTransferDetailsTable.html(html);
                self.generateTransferStatusTable(fabWorkOrderId, listSize);

                // if(listSize > 0){
                //     self.initiateFormValidation(listSize);
                // }
            });
        }
    },
    getTableRowHtmlByProductItem: function(item, index){
        var self = this;
        var html = '';
        html += '<tr';
        html += ' data-product-item-id="'+item.id
            + '" data-max-quantity-to-transfer="'+item.availableForTransfer
            + '" data-name-attr="transferQuantity_'+(index)+'">';

        html += '<td class="slNo">'+ (index+1) +'</td>';
        html += '<td>'+ item.deviceCode +'</td>';
        html += '<td>'+ item.inQuantity +'</td>';
        html += '<td>'+ item.inProgressQuantity +'</td>';
        html += '<td>'+ item.outQuantity +'</td>';
        html += '<td>'+ item.availableForTransfer +'</td>';

        if(item.availableForTransfer == 0){
            html += '<td colspan="2" style="text-align: left;"><label style="color: darkgreen; font-weight: bold;">' + self.options.messages.nothingToTransfer + '</label></td>';
        }else{
            html += '<td><input type="text" class="form-control transferQuantity" name="transferQuantity_'+index+'" style="width: 150px;"/></td>';
            html += '<td>'+ self.el.transferBtn +'</td>';
        }

        html += '</tr>';
        return html;
    },
    generateTransferStatusTable: function(fabWorkOrderId, transferTableDetailsSize){
        var self=this;
        var html = '<table class="table table-striped custom-table">';
        html += '<thead>';
        html += '<tr colspan="6">'+self.options.messages.transferTableColspanHeader+'</tr>';
        html += '<tr>';
        html += '<th>SL#</th>';
        html += '<th>' + self.options.messages.transferTableFabTapeOutNumber + '</th>';
        html += '<th>' + self.options.messages.transferTableTransferredQuantity + '</th>';
        html += '<th>' + self.options.messages.transferTableWastedQuantity + '</th>';
        html += '<th>' + self.options.messages.transferTableTransferDate + '</th>';
        html += '<th>' + self.options.messages.transferTableAction + '</th>';
        html += '</tr>';
        html += '</thead>';

        html += '<tbody>';

        $.get('/admin/getFabWipInventoryStatusForTransfer', {fabWorkOrderId: fabWorkOrderId}, function (list) {

        }).then(function(list){
            console.log("SMNLOG list 22::"+JSON.stringify(list));
            listSize = list.length;

            $.each(list, function (index, item) {
                html+=self.getTransferStatusTableRowByProductTransferItem(item, index);
            });
            html += '</tbody>';
            html += '</table>';
        }).always(function(){
            if(listSize > 0){
                self.el.transferStatusDetailsTable.html(html);
            }
            else{
                self.el.transferStatusDetailsTable.html('');
            }
            self.initiateFormValidation(transferTableDetailsSize, listSize);
        });
    },
    getTransferStatusTableRowByProductTransferItem: function(item, index){
        var self = this;
        var html = '';
        // sl = (sl+1);
        html += '<tr ';
        html += ' product-item-id="'+item.productItemId+'" ';
        html += ' product-transfer-item-id="'+item.productTransferItemId+'" ';
        html += ' product-transfer-item-transferred-quantity="'+item.transferQuantity+'" ';
        html += ' data-name-attr="transferredQuantity_'+(index)+'">';
        html += '<td class="slNo">'+ (index+1) + '</td>';
        html += '<td>'+ item.fabTapeOutNumber+'</td>';
        html += '<td>'+item.transferQuantity+'</td>';
        html += '<td>'+item.wasteQuantity+'</td>';
        html += '<td>'+item.created+'</td>';

        if(item.status === "SERVICE_COMPLETE"){
            html += '<td colspan="2">';
            html += self.el.transitBtn;
            html += '</td>';
        }
        else if (item.status === "TRANSIT"){
            html += '<td>';
            html += '<input type="text" class="form-control transferredQuantity" name="transferredQuantity_'+index+'" style="width: 150px;"/>';
            html += '</td>';
            html += '<td>';
            html += self.el.nextReceivedBtn;
            html += '</td>';

        }
        else if(item.status === "NEXT_RECEIVED"){
            html += '<td colspan="2">';
            html += self.options.messages.transferTableTransferredToNextService;
            html += '</td>';
        }
        html += '</tr>'

        return html;
    },
    changeStatusTransferProductItemBtnEvent: function(trObject, status){
        var self=this;
        var productItemId = trObject.attr('product-item-id');
        var productTransferItemId = trObject.attr('product-transfer-item-id');
        var transferredQuantity = parseInt(trObject.attr('product-transfer-item-transferred-quantity'));
        var requestedTransferredQuantity = trObject.find('.transferredQuantity').val();
        var transferredQuantityInputName = trObject.attr('data-name-attr');
        var wasteQuantity = transferredQuantity - parseInt(requestedTransferredQuantity);
        var errorMessageObject = {};
        var validator = self.el.fabTransferForm.validate();
        var errorMessage = "";

        if(status === 'transit'){
            self.recordStatusChange(trObject, productItemId, productTransferItemId, status, transferredQuantity, wasteQuantity);
        }
        else if(status === 'nextReceived' && (isNaN(parseInt(requestedTransferredQuantity)) || parseInt(requestedTransferredQuantity) == 0) || !Forecast.APP.isDigits(requestedTransferredQuantity)){
            errorMessage = self.options.messages.invalidQty;
            bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(errorMessage));
            errorMessageObject[transferredQuantityInputName] = errorMessage;
            validator.showErrors(errorMessageObject);
        }else if(status === 'nextReceived' && parseInt(requestedTransferredQuantity) > 0 && parseInt(requestedTransferredQuantity) > transferredQuantity) {
            errorMessage = self.options.messages.qtyLimitExceed.replace('*', transferredQuantity);
            bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(errorMessage));
            errorMessageObject[transferredQuantityInputName] = errorMessage;
            validator.showErrors(errorMessageObject);
        }else if(status === 'nextReceived' && parseInt(requestedTransferredQuantity) > 0 && parseInt(requestedTransferredQuantity) < transferredQuantity) {
            errorMessage = self.options.messages.transferStatusWasteRecord.replace('*', transferredQuantity).replace('**', ''+requestedTransferredQuantity).replace('***', ''+wasteQuantity);
            bootbox.confirm({
                message: errorMessage,
                buttons: {
                    confirm: {
                        label: 'Yes',
                        className: 'btn-primary'
                    },
                    cancel: {
                        label: 'No',
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        self.recordStatusChange(trObject, productItemId, productTransferItemId, status, parseInt(requestedTransferredQuantity), wasteQuantity);
                    }
                }
            });
            // bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(errorMessage));
            // errorMessageObject[transferredQuantityInputName] = errorMessage;
            // validator.showErrors(errorMessageObject);
        }else{
            self.recordStatusChange(trObject, productItemId, productTransferItemId, status, transferredQuantity, wasteQuantity);
        }
    },
    recordStatusChange:function(trObject, productItemId, productTransferItemId, status, transferredQuantity, wasteQuantity){
        var self=this;
        var index= +trObject.find('td.slNo').text() - 1;
        var html='';
        Forecast.APP.startLoading();
        $.get('/admin/transferFabServiceChangeProductTransferItemStatus',
            {
                productItemId: productItemId,
                productTransferItemId: productTransferItemId,
                changedStatus: status,
                transferredQuantity: transferredQuantity,
                wasteQuantity: wasteQuantity
            },
            function(response){
                console.log("SMNLOG status changed::"+JSON.stringify(response));
                html += self.getTransferStatusTableRowByProductTransferItem(response, index);
                trObject.replaceWith(html);
                self.el.fabTransferForm.validate();
                // self.el.workOrderSelect.trigger('change');
            }).always(function(){
            Forecast.APP.stopLoading();
        });
    },
    transferProductItem: function(trObject, productItemId, transferQty){
        var self = this;
        var validator = self.el.fabTransferForm.validate();
        var activeWorkOrderId = +self.el.workOrderSelect.val();
        var transferWIPListSize = self.el.wipTransferDetailsTable.find('tbody tr').length;
        var index = +trObject.find('td.slNo').text() - 1;
        var html = '';
        Forecast.APP.startLoading();

        $.get('/admin/transferFabService',
            {
                productItemId: productItemId,
                transferQty: transferQty
            },
            function(data){
                // console.log(data);
                html += self.getTableRowHtmlByProductItem(data, index);
                trObject.replaceWith(html);

                console.log("transfer wip list size :::: " + transferWIPListSize);
                self.generateTransferStatusTable(activeWorkOrderId, transferWIPListSize);
                // self.el.workOrderSelect.trigger('change');
            }).always(function(){
            Forecast.APP.stopLoading();
        });

    },
    initiateFormValidation: function (transferTableDetailsSize, transferStatusTableSize) {
        console.log("SMNLOG length::"+JSON.stringify(transferTableDetailsSize));
        var self = this;
        var rulesJson = {};

        for(var i=0; i< transferTableDetailsSize; i++){
            rulesJson['transferQuantity_'+i] = {
                required: true,
                digits: true
            }
        }
        for(var i=0; i< transferStatusTableSize; i++){
            rulesJson['transferredQuantity_'+i] = {
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
        self.el.fabTransferForm.validate(validateJson);
    },
    transferProductItemBtnEvent: function(trObject){
        var self = this;
        var productItemId = +trObject.attr('data-product-item-id');
        var maxAllowedQuantity = +trObject.attr('data-max-quantity-to-transfer');
        var transferQuantity = trObject.find('.transferQuantity').val();
        var transferQtyInputName = trObject.attr('data-name-attr');
        var errorMessageObject = {};
        var validator = self.el.fabTransferForm.validate();
        var errorMessage = "";

        if(isNaN(parseInt(transferQuantity)) || parseInt(transferQuantity) == 0 || !Forecast.APP.isDigits(transferQuantity)){
            errorMessage = self.options.messages.invalidQty;
            bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(errorMessage));
            errorMessageObject[transferQtyInputName] = errorMessage;
            validator.showErrors(errorMessageObject);
        }else if(parseInt(transferQuantity) > 0 && parseInt(transferQuantity) > maxAllowedQuantity) {
            errorMessage = self.options.messages.qtyLimitExceed.replace('*', maxAllowedQuantity);
            bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(errorMessage));
            errorMessageObject[transferQtyInputName] = errorMessage;
            validator.showErrors(errorMessageObject);
        }else if(productItemId == 0){
            errorMessage = self.options.messages.invalidData;
            bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(errorMessage));
            errorMessageObject[transferQtyInputName] = errorMessage;
            validator.showErrors(errorMessageObject);

        }else{
            self.transferProductItem(trObject, productItemId, parseInt(transferQuantity));
        }
    },
    destroy: function () {
    }
});
