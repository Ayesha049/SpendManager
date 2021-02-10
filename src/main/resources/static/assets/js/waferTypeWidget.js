$.widget("forecast.waferType", {
    options: {
        tapeOutList: undefined,
        deviceList: undefined,
        deviceItemList: undefined,
        messages: undefined,
        viewOnly :undefined,
        deviceItem:
            {   id: '',
                deviceNumber: '',
                deviceGDPW: ''
            }
    },
    _create: function () {
        console.log("SMNLOG :: ---------- Wafer Type widget create ----------");
        var self = this;
        self.el = {};
        self.data = {};
        self.data.tapeOutMap = {};
        self.data.deviceMap = {};
        self.data.filteredTapeOut = [];

        if (self.options.deviceItemList != 'undefined') {
            self.options.deviceItemListSize = self.options.deviceItemList.length;
        }

        if (self.options.deviceList != 'undefined') {
            $.each(self.options.deviceList, function (index, device) {
                self.data.deviceMap[device.id] = {
                    id: device.id,
                    deviceNumber: device.deviceNumber,
                    gdpw: device.gdpwActual,
                    fabTapeOutNumber: device.fabTapeOutNumber
                }
            })
        }

        if (self.options.tapeOutList != 'undefined') {
            $.each(self.options.tapeOutList, function (index, tapeOut) {
                self.data.tapeOutMap[tapeOut.fabProductNumber]= {
                    fabTapeOutNumber: tapeOut.fabTapeOutNumber,
                    fabProductNumber: tapeOut.fabProductNumber,
                    tapeOutNumber: tapeOut.tapeOutNumber,
                    deviceList: []
                }
                $.each(tapeOut.referenceDevices, function (index, device) {
                    self.data.tapeOutMap[tapeOut.fabProductNumber].deviceList.push(device);
                })
            });
        }

        // UI element Initialization
        self.el.waferTypeForm = $("#wafer_type_form");
        self.el.dynamicRowDiv = $("#dynamicRowDiv");
        self.el.vendorName = $("#vendorName");
        self.el.movandiName = $("#movandiName");
        self.el.deviceLineItemDiv = $(".device-line-item-div");
        self.el.tapeOutSelect = $("select#tapeOutNumber");
        self.el.submitButton = $("#submitButton");

        self.el.gobackButton = '<a href="/admin/waferTypeList" id="submitButton" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';

    },
    _init: function () {
        console.log("SMNLOG :: ---------- Wafer Type widget init ----------");
        var self = this;
        self.initiateFormValidation();

        if (self.options.deviceItemListSize > 0) {
            self.showDeviceListPanel();
            $.each(self.options.deviceItemList, function (index, deviceItem) {
                self.addLineItemForDevice(deviceItem);
            });
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
            rules: {
                tapeOutNumber: {
                    required: true,
                    isWaferTypeUnique: true
                }
            },
            messages: {
            },
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };
        $.validator.addMethod("isWaferTypeUnique", function (value, element) {
            errorMsg = '', $valid = false;
            var tapeOutNumber = $(element).val();
            var waferId = id.value.length;
            //console.log(!waferId);
            if(!waferId){
                waferId = id.value.length;
            } else {
                waferId = id.value;
            }

            $.ajax({
                type: "GET",
                url: "/waferType/check?tapeOutNumber="+tapeOutNumber+"&waferId="+waferId,
                success: function (response) {
                    if(response == true) {
                        $valid = true;
                    }
                    else{
                        $valid = false;
                        errorMsg = "There's already a wafer type associated with this product number.";
                    }
                },
                async: false
            });
            $.validator.messages["isWaferTypeUnique"] = errorMsg;
            return $valid;
        }, '');

        self.el.waferTypeForm.validate(validateJson);

    },
    uiEventInitialization: function () {
        var self = this;

        self.el.tapeOutSelect.on('change', function(){
            var selectedTapeOutNumber = $(this).val();
            if(selectedTapeOutNumber == ""){
                self.populateNames("", "");
                self.clearDeviceLineItemDiv();
                self.hideDeviceListPanel();
            }
            else{
                self.populateNames(self.data.tapeOutMap[selectedTapeOutNumber].tapeOutNumber, self.data.tapeOutMap[selectedTapeOutNumber].fabProductNumber);
                self.showDeviceListPanel();
                self.clearDeviceLineItemDiv();
                $.each(self.data.tapeOutMap[selectedTapeOutNumber].deviceList, function (index, device) {
                    var deviceItem = { id: '', deviceNumber: '', deviceGDPW: ''};
                    deviceItem.deviceNumber = self.data.deviceMap[device].deviceNumber;
                    deviceItem.deviceGDPW = self.data.deviceMap[device].gdpw;
                    self.addLineItemForDevice(deviceItem);
                });
            }
        });

    },
    showDeviceListPanel: function(){
        this.el.dynamicRowDiv.show();
    },
    hideDeviceListPanel: function(){
        this.el.dynamicRowDiv.hide();
    },
    clearDeviceLineItemDiv: function(){
        this.el.deviceLineItemDiv.empty();
    },
    populateNames: function(movandiName, vendorName){
        this.el.vendorName.val(vendorName);
        this.el.movandiName.val(movandiName);
    },
    addLineItemForDevice: function (deviceItem) {
        var self = this;
        //dynamic row creation
        var index = self.el.deviceLineItemDiv.find('div.form-group').length;

        var $rowToAppend = '<div class="form-group row">'
            + '<div class="col-md-3">'
            + '<input type="text" name="deviceItemList[' + index + '].id" class="deviceId" style="display: none;" value="' + deviceItem.id + '"/>'
            + '<input type="text" name="deviceItemList[' + index + '].deviceNumber" value="' + deviceItem.deviceNumber + '" class="form-control device-number" placeholder="Device" readonly="true" />'
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="deviceItemList[' + index + '].deviceGDPW" value="' + deviceItem.deviceGDPW + '" class="form-control device-gdpw" placeholder="GDPW" readonly="true" />'
            + '</div>'
            + '</div>';

        self.el.deviceLineItemDiv.append($rowToAppend);
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.waferTypeForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.waferTypeForm.find('select').attr("disabled", true);
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.waferTypeForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.waferTypeForm.attr("href", "#");
    },
    destroy: function () {
    }
});
