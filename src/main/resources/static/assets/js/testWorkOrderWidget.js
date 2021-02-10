$.widget("forecast.testWo", {
    options: {
        poList: undefined,
        deviceItemList: undefined,
        messages: undefined,
        viewOnly :undefined,
        appSettingsJson: undefined,
        workOrderCount: 0,
        purchaseOrderId: 0,
        deviceItem: {
            id: '',
            cost: '',
            count: '',
            waferType: '',
            deviceNumber: ''
        },
        tabHeaderValueMap:{
            'basic-information-tab':'Basic Information',
            'shipping-information-tab':'Shipping Information',
            'applicable-spec-tab':'Applicable Specs/Documents',
            'contact-information-tab':'Contact Information'
        }
    },
    _create: function () {
        console.log("SMNLOG :: ---------- testWo widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        self.data.poMap = {};
        self.data.poSelect = {};
        self.data.tabWiseErrorCountMap = {};
        self.data.waferTypeSelect = {};
        self.data.waferTypeDeviceMap = {};

        if (self.options.deviceItemList != 'undefined') {
            self.options.deviceItemListSize = self.options.deviceItemList.length;
        }

        if (self.options.waferTypeList != 'undefined') {
            $.each(self.options.waferTypeList, function(index, waferType){

                var items = {};
                items["id"] = waferType.id;
                items["waferType"] = waferType.waferType;
                items["waferTypeVendorName"] = waferType.waferTypeVendorName;
                self.data.waferTypeSelect[waferType.id] = items;

                var deviceDataList = self.data.waferTypeDeviceMap.hasOwnProperty(waferType.id) ? self.data.waferTypeDeviceMap[waferType.id] : [];
                var deviceData = {};
                deviceData["deviceNumber"] = waferType.deviceNumber;
                deviceData["deviceGDPW"] = waferType.deviceGDPW;
                deviceDataList.push(deviceData);
                self.data.waferTypeDeviceMap[waferType.id] = deviceDataList;
            });
        }

        if (self.options.poList != 'undefined') {
            $.each(self.options.poList, function(index, po){

                var items = {};
                items["id"] = po.id;
                items["poNumber"] = po.poNumber;
                self.data.poSelect[po.id] = items;

                var waferTypeData = {};
                var sameWaferType = false;
                var waferTypeDataList = self.data.poMap.hasOwnProperty(po.id) ? self.data.poMap[po.id] : [];

                if(waferTypeDataList.length !== 0){
                    $.each(waferTypeDataList, function (index, waferTypeData) {
                        if(waferTypeData["waferTypeId"] == po.tapeOutItemId){
                            sameWaferType = true;
                            waferTypeData["deviceList"].push({deviceNumber: po.deviceNumber, deviceCount: po.deviceCount, deviceCost: po.deviceCost});
                            return;
                        }
                    });
                }

                if(waferTypeDataList.length === 0 || !sameWaferType){
                    waferTypeData["waferTypeId"] = po.tapeOutItemId;
                    waferTypeData["waferTypeName"] = po.tapeOutName;
                    waferTypeData["deviceList"] = [{deviceNumber: po.deviceNumber, deviceCount: po.deviceCount, deviceCost: po.deviceCost}];

                    waferTypeDataList.push(waferTypeData);
                    self.data.poMap[po.id] = waferTypeDataList;
                }
            });
        }

        // UI element Initialization
        self.el.testWoForm = $("#test_wo_form");
        self.el.id = $(document).find("#id");
        self.el.workOrderName = $("#testWorkOrderName");
        self.el.workOrderType = $("#type");
        self.el.issueDate = $("#issueDate");
        self.el.revisionNumber = $("#revisionNumber");
        self.el.woNomenclatureFields = $(".woNomenclatureFields");
        self.el.lotTracker = $("#lotTracker");
        self.el.errorMessageBox = $("#errorMessageBox");
        self.el.tabNextButton = $(".next-button");
        self.el.purChaseOrderDiv = $("#purchaseOrderDiv");
        self.el.dynamicRowDiv = $("#dynamicRowDiv");
        self.el.deviceLineItemDiv = $(".device-line-item-div");
        self.el.totalCost = $("#cost");
        self.el.totalQuantity = $("#buildQuantity");
        self.el.submitButton = $("#submitButton");

        self.el.gobackButton = '<a href="/admin/testWOList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<a type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.removeButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';

        self.createPurchaseOrderSelectBox();

    },
    _init: function () {
        console.log("SMNLOG :: ---------- testWo widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.deviceItemListSize > 0) {
            $.each(self.options.deviceItemList, function (index, deviceItem) {
                self.addLineItemForDevice(true, deviceItem, self.options.purchaseOrderId);
                self.el.deviceLineItemDiv.find('div.form-group:last').find('select.device-number').html(self.getDeviceOptionHtml(deviceItem.waferType, deviceItem.deviceNumber, self.options.purchaseOrderId));
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
                testWorkOrderName: {
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
                    isTestAvailableInProductionPlan: true
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
        $.validator.addMethod("checkDeviceCount", function (value, element) {
            errorMsg = '', $valid = false;
            var poId = $('select.purchase-order').val();
            var waferTypeId = $(element).parent().prev().prev().find('select.wafer-type').val();
            var deviceNumber = $(element).parent().prev().find('select.device-number').val();
            var currentWorkOrderId = self.el.id.val();

            $.ajax({
                type: "GET",
                url: "/testWO/deviceCount/check?poId="+poId+"&waferTypeId="+waferTypeId+"&deviceNumber="+deviceNumber+"&currentWorkOrderId="+currentWorkOrderId,
                success: function (response) {
                    var remaining = parseFloat(response);
                    if(parseFloat(value) <= remaining) {
                        $valid = true;
                    }
                    else{
                        $valid = false;
                        errorMsg = "There's only " + remaining + " devices left in the PO.";
                    }
                },
                async: false
            });
            $.validator.messages["checkDeviceCount"] = errorMsg;
            return $valid;
        }, '');

        $.validator.addMethod("checkDeviceCost", function (value, element) {
            errorMsg = '', $valid = false;
            var poId = $('select.purchase-order').val();
            var waferTypeId = $(element).parent().prev().prev().prev().find('select.wafer-type').val();
            var deviceNumber = $(element).parent().prev().prev().find('select.device-number').val();
            var currentWorkOrderId = self.el.id.val();

            $.ajax({
                type: "GET",
                url: "/testWO/deviceCost/check?poId="+poId+"&waferTypeId="+waferTypeId+"&deviceNumber="+deviceNumber+"&currentWorkOrderId="+currentWorkOrderId,
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
            $.validator.messages["checkDeviceCost"] = errorMsg;
            return $valid;
        }, '');

        $.validator.addMethod("isTestAvailableInProductionPlan", function (value, element) {
            errorMsg = '', $valid = false;
            $.ajax({
                type: "GET",
                url: "/isTestAvailable?productionPlanId="+value,
                success: function (response) {
                    $valid = response;
                    if(response === false){
                        errorMsg = "Test Service is not available in this production plan."
                    }
                },
                async: false
            });
            $.validator.messages["isTestAvailableInProductionPlan"] = errorMsg;
            return $valid;
        }, '');

        self.el.testWoForm.validate(validateJson);

        // Add dynamic validation for newly added line items
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("wafer-type", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("device-number", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("device-number-count", {required: true, number: true, checkDeviceCount: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("device-number-cost", {required: true, number: true, checkDeviceCost: true});
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
            self.addLineItemForDevice(true, self.options.deviceItem, selectedPurchaseOrder);
            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'a.itemRemoveButton', function () {
            $(this).parent().parent().remove();
            self.addPlusIconForTheLastItem();

            self.reIndexDeviceItems();
            self.updateTotalQuantity();
            self.updateTotalCost();
        });

        self.el.purChaseOrderDiv.on('change', 'select.purchase-order', function () {
            var selectedPurchaseOrder = +$(this).val();
            self.clearDeviceLineItemDiv();
            self.addLineItemForDevice(true, self.options.deviceItem, selectedPurchaseOrder);
            self.addPlusIconForTheLastItem();
        });

        $(document).on('change', 'select.wafer-type', function () {
            var waferTypeId = +$(this).val();
            var selectedPurchaseOrder = +$('#purchaseOrderDiv .purchase-order').val();
            console.log("SMNLOG :: changed...."+waferTypeId);

            $(this).parent().next().find('.device-number').html(self.getDeviceOptionHtml(waferTypeId, '', selectedPurchaseOrder));
        });

        $(document).on('change', '.device-number', function () {
            var deviceNumber = $(this).val();
            var waferTypeId = +$(this).parent().prev().find('.wafer-type').val();
            var selectedElement = $(this);
            console.log("SMNLOG :: changed...."+deviceNumber);

            if(!self.isDeviceUnique(deviceNumber, waferTypeId, selectedElement)){
                $(this).val("");
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("You can not select this device. It's already been selected."));
            }
        });

        $(document).on('keyup', '.device-number-cost', function () {
            self.updateTotalCost();
        });

        $(document).on('keyup', '.device-number-count', function () {
            self.updateTotalQuantity();
        });

        self.el.submitButton.on('click', function(){
            self.el.testWoForm.trigger('submit');
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
                + "40";
            self.el.workOrderName.val(woName);

            self.el.lotTracker.val(woName.split("-").pop().split(".")[0] + "-" + 'C');
        }
    },
    isDeviceUnique: function(selectedDeviceNumber, selectedWaferTypeId, selectedElement){
        var self = this;
        var isUnique = true;
        self.el.deviceLineItemDiv.find('select.device-number').not(selectedElement).each(function () {
            var deviceNumber = $(this).val();
            var waferTypeId = +$(this).parent().prev().find('.wafer-type').val();
            if(waferTypeId === selectedWaferTypeId && deviceNumber === selectedDeviceNumber){
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
    clearDeviceLineItemDiv: function(){
        this.el.deviceLineItemDiv.empty();
    },
    reIndexDeviceItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.deviceLineItemDiv.find('div.form-group').each(function(){
            name = 'deviceItemList[' + index + ']';
            $(this).find('div').find('input.device-line-id').attr("name", name + ".id");
            $(this).find('div').find('select.wafer-type').attr("name", name + ".waferType.id");
            $(this).find('div').find('select.device-number').attr("name", name + ".deviceNumber");
            $(this).find('div').find('input.device-number-count').attr("name", name + ".count");
            $(this).find('div').find('input.device-number-cost').attr("name", name + ".cost");
            index++;
        });
    },
    getWaferTypeSelectBoxHtml: function (index, selectedValue, selectedPurchaseOrder) {
        var self = this;
        var html = '<select name="deviceItemList[' + index + '].waferType.id" class="custom-select wafer-type" placeholder="Wafer Type">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.data.poMap[selectedPurchaseOrder], function (index, item) {
            if (selectedValue == item.waferTypeId) {
                html += '<option value="' + item.waferTypeId + '" selected>' + item.waferTypeName + '</option>';
            } else {
                html += '<option value="' + item.waferTypeId + '">' + item.waferTypeName + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    getDeviceSelectBoxHtml: function (index) {
        var self = this;
        var html = '<select name="deviceItemList[' + index + '].deviceNumber" class="custom-select device-number" placeholder="Device Number">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        html += '</select>';
        return html;
    },
    getDeviceOptionHtml: function(waferTypeId, selectedValue, selectedPurchaseOrder){
        var self = this;
        var html = '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(self.data.poMap[selectedPurchaseOrder], function (index, waferTypeItem) {
            if(waferTypeItem.waferTypeId === waferTypeId){
                $.each(waferTypeItem["deviceList"], function (index, item) {
                    if (selectedValue == item.deviceNumber) {
                        html += '<option value="' + item.deviceNumber + '" selected>' + item.deviceNumber + '</option>';
                    } else {
                        html += '<option value="' + item.deviceNumber + '">' + item.deviceNumber + '</option>';
                    }
                });
            }
        });

        return html;
    },
    addLineItemForDevice: function (isPlusIcon, deviceItem, selectedPurchaseOrder) {
        var self = this;
        var index = self.el.deviceLineItemDiv.find('div.form-group').length;

        var $rowToAppend = '<div class="form-group row">'
            + '<div class="col-md-3">'
            + '<input type="text" name="deviceItemList[' + index + '].id" class="device-line-id" style="display: none;" value="' + deviceItem.id + '"/>'
            + self.getWaferTypeSelectBoxHtml(index, deviceItem.waferType, selectedPurchaseOrder)
            + '</div>'
            + '<div class="col-md-3">'
            + self.getDeviceSelectBoxHtml(index)
            + '</div>'
            + '<div class="col-md-3">'
            + '<input type="text" name="deviceItemList[' + index + '].count" value="' + deviceItem.count + '" class="form-control device-number-count" placeholder="Count" />'
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="deviceItemList[' + index + '].cost" value="' + deviceItem.cost + '" class="form-control device-number-cost" placeholder="Cost" />'
            + '</div>'
            + '<div class="col-md-1 itemAddRemoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.deviceLineItemDiv.append($rowToAppend);
        self.el.deviceLineItemDiv.find('div.form-group:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.removeButton);
    },
    addPlusIconForTheLastItem: function () {
        var self = this;
        if(self.el.deviceLineItemDiv.children().length == 1){
            self.el.deviceLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.addButton);
        }
        else{
            self.el.deviceLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.removeButton + self.el.addButton);
        }
    },
    updateTotalCost: function () {
        var self = this;
        var totalCost = 0;

        self.el.deviceLineItemDiv.find('input.device-number-cost').each(function () {
            totalCost += +$(this).val();
        });
        self.el.totalCost.val(totalCost);
    },
    updateTotalQuantity: function () {
        var self = this;
        var totalQty = 0;

        self.el.deviceLineItemDiv.find('div.form-group').each(function () {
            totalQty += +$(this).find('input.device-number-count').val();
        });
        self.el.totalQuantity.val(totalQty);
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.testWoForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.testWoForm.find('select').attr("disabled", true);
        self.el.testWoForm.find('textarea').attr("disabled", true);
        // self.el.searchBoxReviewer.attr("disabled", true);
        self.el.testWoForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.testWoForm.attr("href", "#");
    },
    showErrorCountInTabHeader: function(errorMap, errorList){
        var self = this;
        self.data.tabWiseErrorCountMap = {};
        self.el.testWoForm.find("div.tab-content").find('.tab-pane').find(".error:not(label)").each(function(){
            var parentTabId = $(this).closest("div.tab-pane").attr("id");
            if(typeof self.data.tabWiseErrorCountMap[parentTabId] != 'undefined'){
                self.data.tabWiseErrorCountMap[parentTabId]++;
            }else{
                self.data.tabWiseErrorCountMap[parentTabId] = 1;
            }

        });
        self.keepDefaultValueForTabHeader();

        $.each(self.data.tabWiseErrorCountMap, function(key, value){
            self.el.testWoForm.find("ul.nav-tabs").find("#"+key+"-tab").html(self.options.tabHeaderValueMap[key+'-tab']+"&nbsp;<font style='color: #dd0000;'>("+ value +")</font>")
        });
    },
    keepDefaultValueForTabHeader: function(){
        var self = this;
        $.each(self.options.tabHeaderValueMap, function(key, value){
            self.el.testWoForm.find("ul.nav-tabs").find("#"+key).html(self.options.tabHeaderValueMap[key]);
        });
    },
    destroy: function () {
    }
});
