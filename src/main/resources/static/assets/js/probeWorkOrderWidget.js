$.widget("forecast.probeWo", {
    options: {
        poList: undefined,
        tapeOutItemList: undefined,
        messages: undefined,
        viewOnly :undefined,
        appSettingsJson: undefined,
        workOrderCount: 0,
        purchaseOrderId: 0,
        tapeOutItem: {
            id: '',
            quantity: '',
            cost: '',
            waferType: ''
        },
        tabHeaderValueMap:{
            'basic-information-tab':'Basic Information',
            'shipping-information-tab':'Shipping Information',
            'applicable-spec-tab':'Applicable Specs/Documents',
            'contact-information-tab':'Contact Information'
        }
    },
    _create: function () {
        console.log("SMNLOG :: ---------- probeWo widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        self.data.poMap = {};
        self.data.poSelect = {};
        self.data.tabWiseErrorCountMap = {};

        if (self.options.tapeOutItemList != 'undefined') {
            self.options.tapeOutItemListSize = self.options.tapeOutItemList.length;
        }

        if (self.options.poList != 'undefined') {
            $.each(self.options.poList, function(index, po){

                var items = {};
                items["id"] = po.id;
                items["poNumber"] = po.poNumber;
                self.data.poSelect[po.id] = items;

                var tapeOutDataList = self.data.poMap.hasOwnProperty(po.id) ? self.data.poMap[po.id] : [];
                var tapeOutData = {};
                tapeOutData["tapeOutId"] = po.tapeOutItemId;
                tapeOutData["tapeOutName"] = po.tapeOutName;
                tapeOutData["nominal"] = po.nominal;
                tapeOutData["upside"] = po.upside;
                tapeOutData["cost"] = po.cost;
                tapeOutDataList.push(tapeOutData);
                self.data.poMap[po.id] = tapeOutDataList;
            });
        }

        // UI element Initialization
        self.el.probeWoForm = $("#probe_wo_form");
        self.el.id = $(document).find("#id");
        self.el.workOrderName = $("#probeWorkOrderName");
        self.el.workOrderType = $("#type");
        self.el.issueDate = $("#issueDate");
        self.el.revisionNumber = $("#revisionNumber");
        self.el.woNomenclatureFields = $(".woNomenclatureFields");
        self.el.lotTracker = $("#lotTracker");
        self.el.errorMessageBox = $("#errorMessageBox");
        self.el.tabNextButton = $(".next-button");
        self.el.purChaseOrderDiv = $("#purchaseOrderDiv");
        self.el.dynamicRowDiv = $("#dynamicRowDiv");
        self.el.tapeOutLineItemDiv = $(".tape-out-line-item-div");
        self.el.totalCost = $("#cost");
        self.el.totalQuantity = $("#buildQuantity");
        self.el.submitButton = $("#submitButton");

        self.el.gobackButton = '<a href="/admin/probeWOList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<a type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.removeButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';

        self.createPurchaseOrderSelectBox();

    },
    _init: function () {
        console.log("SMNLOG :: ---------- probeWo widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.tapeOutItemListSize > 0) {
            $.each(self.options.tapeOutItemList, function (index, tapeOutItem) {
                self.addLineItemForTapeOut(true, tapeOutItem, self.options.purchaseOrderId);
            });
            self.addPlusIconForTheLastItem();
        }
        self.uiEventInitialization();
        if (self.options.viewOnly == true){
            self.disableForViewOnly();
        }
    },
    initiateFormValidation: function () {
        var self = this;
        var errorMsg = '', $valid = false;
        var validateJson = {
            ignore: [],
            rules: {
                probeWorkOrderName: {
                    required: true,
                    maxlength: 25
                },
                issueDate: {
                    required: true,
                },
                'purchaseOrder.id': {
                    required: true
                },
                'productionPlan.id': {
                    required: true,
                    isProbeAvailableInProductionPlan: true
                },
                manufacturingSite: {
                    required: true
                },
                revisionNumber: {
                    number: true,
                    maxlength: 2
                },
                cycleTimeRequest: {
                    number: true
                },
                remainingDieDispose: {
                    number: true
                },
                discount: {
                    number: true
                },
                dieShippingQuantity: {
                    number: true
                },
                waferShipOutDate: {
                    required: true
                },
                crd:{
                    required: true
                },
                'planningContactInformation.name': {
                    maxlength: 32
                },
                'planningContactInformation.email': {
                    email: true
                },
                'planningContactInformation.phone': {
                    number: true,
                    maxlength: 20
                },
                'productEngineeringContactInformation.name': {
                    maxlength: 32
                },
                'productEngineeringContactInformation.email': {
                    email: true
                },
                'productEngineeringContactInformation.phone': {
                    number: true,
                    maxlength: 20
                },
                'packageEngineeringContactInformation.name': {
                    maxlength: 32
                },
                'packageEngineeringContactInformation.email': {
                    email: true
                },
                'packageEngineeringContactInformation.phone': {
                    number: true,
                    maxlength: 20
                },
                'testEngineeringInformation.name': {
                    maxlength: 32
                },
                'testEngineeringInformation.email': {
                    email: true
                },
                'testEngineeringInformation.phone': {
                    number: true,
                    maxlength: 20
                }
            },
            messages: {
                'planningContactInformation.phone' : "Please enter a valid phone number.",
                'productEngineeringContactInformation.phone' : "Please enter a valid phone number.",
                'packageEngineeringContactInformation.phone' : "Please enter a valid phone number.",
                'testEngineeringInformation.phone' : "Please enter a valid phone number."
            },
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            },
            showErrors: function(errorMap, errorList) {
                self.el.errorMessageBox.html("Your form contains "
                    + this.numberOfInvalids()
                    + " errors, see details below.");
                this.defaultShowErrors();
                self.el.errorMessageBox.show();

                if(this.numberOfInvalids() == 0){
                    self.el.errorMessageBox.hide();
                }
                self.showErrorCountInTabHeader();

            }
        };
        $.validator.addMethod("checkTapeOutCount", function (value, element) {
            errorMsg = '', $valid = false;
            var poId = $('select.purchase-order').val();
            var waferTypeId = $(element).parent().prev().find('select.tape-out').val();
            var currentWorkOrderId = self.el.id.val();

            $.ajax({
                type: "GET",
                url: "/probeWO/tapeOutCount/check?poId="+poId+"&waferTypeId="+waferTypeId+"&currentWorkOrderId="+currentWorkOrderId,
                success: function (response) {
                    var remaining = parseFloat(response);
                    if(parseFloat(value) <= remaining) {
                        $valid = true;
                    }
                    else{
                        $valid = false;
                        errorMsg = "There's only " + remaining + " wafers left in the PO.";
                    }
                },
                async: false
            });
            $.validator.messages["checkTapeOutCount"] = errorMsg;
            return $valid;
        }, '');

        $.validator.addMethod("checkTapeOutCost", function (value, element) {
            errorMsg = '', $valid = false;
            var poId = $('select.purchase-order').val();
            var waferTypeId = $(element).parent().prev().prev().find('select.tape-out').val();
            var currentWorkOrderId = self.el.id.val();

            $.ajax({
                type: "GET",
                url: "/probeWO/tapeOutCost/check?poId="+poId+"&waferTypeId="+waferTypeId+"&currentWorkOrderId="+currentWorkOrderId,
                success: function (response) {
                    if(parseFloat(value) <= parseFloat(response)) {
                        $valid = true;
                    }
                    else{
                        $valid = false;
                        errorMsg = "There's only " + response + " dollars left in the PO.";
                    }
                },
                async: false
            });
            $.validator.messages["checkTapeOutCost"] = errorMsg;
            return $valid;
        }, '');

        $.validator.addMethod("isProbeAvailableInProductionPlan", function (value, element) {
            errorMsg = '', $valid = false;
            $.ajax({
                type: "GET",
                url: "/isProbeAvailable?productionPlanId="+value,
                success: function (response) {
                    $valid = response;
                    if(response === false){
                        errorMsg = "probe Service is not available in this production plan."
                    }
                },
                async: false
            });
            $.validator.messages["isProbeAvailableInProductionPlan"] = errorMsg;
            return $valid;
        }, '');

        self.el.probeWoForm.validate(validateJson);

        // Add dynamic validation for newly added line items
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("tape-out", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("tape-out-quantity", {required: true, number: true, checkTapeOutCount: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("tape-out-cost", {required: true, number: true, checkTapeOutCost: true});
    },
    uiEventInitialization: function () {
        var self = this;

        self.el.issueDate.datetimepicker().on('dp.change', function (event) {
            self.createWorkOrderName();
        });

        self.el.woNomenclatureFields.on('change', function () {
            self.createWorkOrderName();
        });

        $(document).on('click', 'a.itemAddButton', function () {
            var selectedPurchaseOrder = +$('#purchaseOrderDiv .purchase-order').val();
            self.addLineItemForTapeOut(true, self.options.tapeOutItem, selectedPurchaseOrder);
            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'a.itemRemoveButton', function () {
            $(this).parent().parent().remove();
            self.addPlusIconForTheLastItem();

            self.reIndexTapeOutItems();
            self.updateTotalQuantity();
            self.updateTotalCost();
        });

        self.el.purChaseOrderDiv.on('change', 'select.purchase-order', function () {
            var selectedPurchaseOrder = +$(this).val();
            self.clearTapeOutLineItemDiv();
            self.addLineItemForTapeOut(true, self.options.tapeOutItem, selectedPurchaseOrder);
            self.addPlusIconForTheLastItem();
        });

        $(document).on('change', '.tape-out', function () {
            var waferTypeId = +$(this).val();
            var selectedElement = $(this);
            console.log("SMNLOG :: changed...."+waferTypeId);

            if(!self.isWaferTypeUnique(waferTypeId, selectedElement)){
                $(this).val("");
                alert("You can not select this wafer. It's already been selected.");
            }
        });

        $(document).on('keyup', '.tape-out-cost', function () {
            self.updateTotalCost();
        });

        $(document).on('keyup', '.tape-out-quantity', function () {
            self.updateTotalQuantity();
        });

        self.el.submitButton.on('click', function(){
            self.el.probeWoForm.trigger('submit');
        });

        self.el.tabNextButton.on('click', function () {
            $('.nav-link.active').parent().next().find('a').tab('show');
        });

    },
    createWorkOrderName: function(){
        var self = this;
        var woType = self.el.workOrderType.val();
        var woIssueDate = self.el.issueDate.val();
        var woRevisionNumber = self.el.revisionNumber.val();

        if(woType === "" || woIssueDate === "" || woRevisionNumber === ""){
            return;
        }else{
            var skipArrayForSequence = self.options.appSettingsJson.workOrderSequenceSkipCharacter.split(",");
            var woName = self.options.appSettingsJson.workOrderPrefix
                + "-"
                + woType
                + Forecast.APP.nextSequenceNumber(self.options.appSettingsJson.workOrderInitialYearCode,
                    moment(woIssueDate, "MMDDYYYY").year() - self.options.appSettingsJson.workOrderInitialYear, [])
                + (+moment(woIssueDate, "MMDDYYYY").isoWeek())
                + Forecast.APP.padDigits(Forecast.APP.nextSequenceNumber(self.options.appSettingsJson.workOrderInitialSequence,
                    parseInt(self.options.workOrderCount) + 1, skipArrayForSequence), self.options.appSettingsJson.numberOfWOSequenceCharacter)
                + woRevisionNumber
                + "."
                + "20";
            self.el.workOrderName.val(woName);

            self.el.lotTracker.val(woName.split("-").pop().split(".")[0] + "-" + 'C');
        }
    },
    isWaferTypeUnique: function(selectedWaferTypeId, selectedElement){
        var self = this;
        var isUnique = true;
        self.el.tapeOutLineItemDiv.find('select.tape-out').not(selectedElement).each(function () {
            var waferTypeId = +$(this).val();
            if(waferTypeId === selectedWaferTypeId){
                isUnique = false;
            }
        });
        return isUnique;
    },
    createPurchaseOrderSelectBox: function(){
        var self = this;
        var html = '<label htmlFor="" class="col-md-3 col-form-label">' + self.options.messages.poNumber + '</label>';
        html += '<div class="col-md-9">';
        html += '<select name="purchaseOrder.id" class="custom-select purchase-order"  placeholder="Purchase Order">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.data.poSelect, function (index, item) {
            if (self.options.purchaseOrderId == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.poNumber + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.poNumber + '</option>';
            }
        });

        html += '</select>';
        html += '</div>';
        self.el.purChaseOrderDiv.html(html);
    },
    clearTapeOutLineItemDiv: function(){
        this.el.tapeOutLineItemDiv.empty();
    },
    reIndexTapeOutItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.tapeOutLineItemDiv.find('div.form-group').each(function(){
            name = 'tapeOutItemList[' + index + ']';
            $(this).find('div').find('input.tape-out-line-id').attr("name", name + ".id");
            $(this).find('div').find('select.tape-out').attr("name", name + ".waferType.id");
            $(this).find('div').find('input.tape-out-quantity').attr("name", name + ".quantity");
            $(this).find('div').find('input.tape-out-cost').attr("name", name + ".cost");

            index++;
        });
    },
    getTapeOutSelectBoxHtml: function (index, selectedValue, selectedPurchaseOrder) {
        var self = this;
        var html = '<select name="tapeOutItemList[' + index + '].waferType.id" class="custom-select tape-out" placeholder="Tape Out">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.data.poMap[selectedPurchaseOrder], function (index, item) {
            if (selectedValue == item.tapeOutId) {
                html += '<option value="' + item.tapeOutId + '" selected>' + item.tapeOutName + '</option>';
            } else {
                html += '<option value="' + item.tapeOutId + '">' + item.tapeOutName + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    addLineItemForTapeOut: function (isPlusIcon, tapeOutItem, selectedPurchaseOrder) {
        var self = this;
        //dynamic row creation
        var index = self.el.tapeOutLineItemDiv.find('div.form-group').length;

        var $rowToAppend = '<div class="form-group row">'
            + '<div class="col-md-4">'
            + '<input type="text" name="tapeOutItemList[' + index + '].id" class="tape-out-line-id" style="display: none;" value="' + tapeOutItem.id + '"/>'
            + self.getTapeOutSelectBoxHtml(index, tapeOutItem.waferType, selectedPurchaseOrder)
            + '</div>'
            + '<div class="col-md-4">'
            + '<input type="text" name="tapeOutItemList[' + index + '].quantity" value="' + tapeOutItem.quantity + '" class="form-control tape-out-quantity" placeholder="Count" />'
            + '</div>'
            + '<div class="col-md-3">'
            + '<input type="text" name="tapeOutItemList[' + index + '].cost" value="' + tapeOutItem.cost + '" class="form-control tape-out-cost" placeholder="Cost" />'
            + '</div>'
            + '<div class="col-md-1 itemAddRemoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.tapeOutLineItemDiv.append($rowToAppend);
        self.el.tapeOutLineItemDiv.find('div.form-group:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.removeButton);
    },
    addPlusIconForTheLastItem: function () {
        var self = this;
        if(self.el.tapeOutLineItemDiv.children().length == 1){
            self.el.tapeOutLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.addButton);
        }
        else{
            self.el.tapeOutLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.removeButton + self.el.addButton);
        }
    },
    updateTotalCost: function () {
        var self = this;
        var totalCost = 0;

        self.el.tapeOutLineItemDiv.find('input.tape-out-cost').each(function () {
            totalCost += +$(this).val();
        });
        self.el.totalCost.val(totalCost);
    },
    updateTotalQuantity: function () {
        var self = this;
        var totalQty = 0;

        self.el.tapeOutLineItemDiv.find('div.form-group').each(function () {
            totalQty += +$(this).find('input.tape-out-quantity').val();
        });
        self.el.totalQuantity.val(totalQty);
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.probeWoForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.probeWoForm.find('select').attr("disabled", true);
        self.el.probeWoForm.find('textarea').attr("disabled", true);
        // self.el.searchBoxReviewer.attr("disabled", true);
        self.el.probeWoForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.probeWoForm.attr("href", "#");
    },
    showErrorCountInTabHeader: function(errorMap, errorList){
        var self = this;
        self.data.tabWiseErrorCountMap = {};
        self.el.probeWoForm.find("div.tab-content").find('.tab-pane').find(".error:not(label)").each(function(){
            var parentTabId = $(this).closest("div.tab-pane").attr("id");
            if(typeof self.data.tabWiseErrorCountMap[parentTabId] != 'undefined'){
                self.data.tabWiseErrorCountMap[parentTabId]++;
            }else{
                self.data.tabWiseErrorCountMap[parentTabId] = 1;
            }

        });
        self.keepDefaultValueForTabHeader();

        $.each(self.data.tabWiseErrorCountMap, function(key, value){
            self.el.probeWoForm.find("ul.nav-tabs").find("#"+key+"-tab").html(self.options.tabHeaderValueMap[key+'-tab']+"&nbsp;<font style='color: #dd0000;'>("+ value +")</font>")
        });
    },
    keepDefaultValueForTabHeader: function(){
        var self = this;
        $.each(self.options.tabHeaderValueMap, function(key, value){
            self.el.probeWoForm.find("ul.nav-tabs").find("#"+key).html(self.options.tabHeaderValueMap[key]);
        });
    },
    destroy: function () {
    }
});
