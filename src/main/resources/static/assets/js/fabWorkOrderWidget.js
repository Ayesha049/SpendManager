$.widget("forecast.fabWo", {
    options: {
        poList: undefined,
        tapeOutItemList: undefined,
        messages: undefined,
        viewOnly: undefined,
        appSettingsJson: undefined,
        lineItemWaferIdList: [{'name' : 'Wafer ID 1','label': 'Wafer ID 1'},{'name' : 'Wafer ID 2','label': 'Wafer ID 2'},{'name' : 'Wafer ID 3','label': 'Wafer ID 3'}],
        lineItemWaferLotList: [{'name' : 'Wafer Lot 1','label': 'Wafer Lot 1'},{'name' : 'Wafer Lot 2','label': 'Wafer Lot 2'},{'name' : 'Wafer Lot 3','label': 'Wafer Lot 3'}],
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
        console.log("SMNLOG :: ---------- fabWo widget create ----------");
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
        self.el.fabWoForm = $("#fab_wo_form");
        self.el.id = $(document).find("#id");
        self.el.workOrderName = $("#fabWorkOrderName");
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

        self.el.gobackButton = '<a href="/admin/fabWOList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';

        self.createPurchaseOrderSelectBox();

    },
    _init: function () {
        console.log("SMNLOG :: ---------- fabWo widget init ----------");
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
                fabWorkOrderName: {
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
                    isFabAvailableInProductionPlan: true
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
                url: "/tapeOutCount/check?poId="+poId+"&waferTypeId="+waferTypeId+"&currentWorkOrderId="+currentWorkOrderId,
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
                url: "/tapeOutCost/check?poId="+poId+"&waferTypeId="+waferTypeId+"&currentWorkOrderId="+currentWorkOrderId,
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

        $.validator.addMethod("isFabAvailableInProductionPlan", function (value, element) {
            errorMsg = '', $valid = false;
            $.ajax({
                type: "GET",
                url: "/isFabAvailable?productionPlanId="+value,
                success: function (response) {
                    $valid = response;
                    if(response === false){
                        errorMsg = "Fab Service is not available in this production plan."
                    }
                },
                async: false
            });
            $.validator.messages["isFabAvailableInProductionPlan"] = errorMsg;
            return $valid;
        }, '');

        self.el.fabWoForm.validate(validateJson);

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
            self.el.fabWoForm.trigger('submit');
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
                    + "00";
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
    getLineItemWaferIdSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="tapeOutItemList[' + index + '].waferId" class="custom-select waferId" placeholder="Wafer ID">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.lineItemWaferIdList, function (index, item) {
            if (selectedValue == item.name) {
                html += '<option value="' + item.name + '" selected>' + item.label + '</option>';
            } else {
                html += '<option value="' + item.name + '">' + item.label + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    getLineItemWaferLotSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="tapeOutItemList[' + index + '].waferLot" class="custom-select waferLot" placeholder="Wafer Lot">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.lineItemWaferLotList, function (index, item) {
            if (selectedValue == item.name) {
                html += '<option value="' + item.name + '" selected>' + item.label + '</option>';
            } else {
                html += '<option value="' + item.name + '">' + item.label + '</option>';
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
            + '<div class="col-md-3">'
            + '<input type="text" name="tapeOutItemList[' + index + '].id" class="tape-out-line-id" style="display: none;" value="' + tapeOutItem.id + '"/>'
            + self.getTapeOutSelectBoxHtml(index, tapeOutItem.waferType, selectedPurchaseOrder)
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="tapeOutItemList[' + index + '].quantity" value="' + tapeOutItem.quantity + '" class="form-control tape-out-quantity" placeholder="Count" />'
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="tapeOutItemList[' + index + '].cost" value="' + tapeOutItem.cost + '" class="form-control tape-out-cost" placeholder="Cost" />'
            + '</div>'
            + '<div class="col-md-2">'
            + self.getLineItemWaferIdSelectBoxHtml(index, tapeOutItem.waferId)
            + '</div>'
            + '<div class="col-md-3">'
            + self.getLineItemWaferLotSelectBoxHtml(index, tapeOutItem.waferLot)
            + '</div>'

        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.tapeOutLineItemDiv.append($rowToAppend);
        self.el.tapeOutLineItemDiv.find('div.form-group:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.removeButton);
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

        self.el.fabWoForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.fabWoForm.find('select').attr("disabled", true);
        self.el.fabWoForm.find('textarea').attr("disabled", true);
        // self.el.searchBoxReviewer.attr("disabled", true);
        self.el.fabWoForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.fabWoForm.attr("href", "#");
    },
    showErrorCountInTabHeader: function(errorMap, errorList){
        var self = this;
        self.data.tabWiseErrorCountMap = {};
        self.el.fabWoForm.find("div.tab-content").find('.tab-pane').find(".error:not(label)").each(function(){
            var parentTabId = $(this).closest("div.tab-pane").attr("id");
            if(typeof self.data.tabWiseErrorCountMap[parentTabId] != 'undefined'){
                self.data.tabWiseErrorCountMap[parentTabId]++;
            }else{
                self.data.tabWiseErrorCountMap[parentTabId] = 1;
            }

        });
        self.keepDefaultValueForTabHeader();

        $.each(self.data.tabWiseErrorCountMap, function(key, value){
            self.el.fabWoForm.find("ul.nav-tabs").find("#"+key+"-tab").html(self.options.tabHeaderValueMap[key+'-tab']+"&nbsp;<font style='color: #dd0000;'>("+ value +")</font>")
        });
    },
    keepDefaultValueForTabHeader: function(){
        var self = this;
        $.each(self.options.tabHeaderValueMap, function(key, value){
            self.el.fabWoForm.find("ul.nav-tabs").find("#"+key).html(self.options.tabHeaderValueMap[key]);
        });
    },
    destroy: function () {
    }
});
