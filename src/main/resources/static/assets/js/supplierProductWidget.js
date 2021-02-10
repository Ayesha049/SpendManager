$.widget("forecast.supplierProduct", {
    options: {
        selectedType: '',
        selectedWafer: 0,
        selectedDevice: 0,
        serviceList: undefined,
        serviceItemList: undefined,
        waferItemList: undefined,
        messages: undefined,
        viewOnly :undefined
    },
    _create: function () {
        console.log("IMNLOG :: ---------- Supplier Product widget create ----------");
        var self = this;
        self.el = {};
        self.data = {};
        self.data.waferMap = {};
        self.data.selectedServiceList = [];

        $.each(self.options.waferItemList, function (index, item){
            self.data.waferMap[item.id] = {
                id: item.id,
                waferName: item.waferName,
                deviceList: item.deviceList
            }
        });

        if (self.options.serviceItemList != 'undefined') {
            self.options.serviceItemListSize = self.options.serviceItemList.length;
        }

        self.el.supplierProductForm = $("#supplier_product_form");
        self.el.waferSelect = $("#waferSelect");
        self.el.deviceSelect = $("#deviceSelect");
        self.el.serviceSelectDiv = $("#serviceSelectDiv");
        self.el.productType = $("#type");
        self.el.submitButton = $("#submitButton");

        self.el.gobackButton = '<a href="/admin/supplierProductList" id="submitButton" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';

    },
    _init: function () {
        console.log("IMNLOG :: ---------- Supplier Product widget init ----------");
        var self = this;

        self.initiateFormValidation();
        self.uiEventInitialization();

        self.actionOnProductType(self.options.selectedType);
        self.actionOnWaferChange(self.options.selectedType, self.options.selectedWafer);
        if (self.options.serviceItemListSize > 0) {
            $.each(self.options.serviceItemList, function (index, serviceItem) {
                self.data.selectedServiceList.push(serviceItem.serviceId);
            });
        }
        self.createServiceSelectHtml(self.data.selectedServiceList);

        if (self.options.viewOnly == true){
            self.disableForViewOnly();
        }
    },
    initiateFormValidation: function () {
        var self = this;
        var validateJson = {
            rules: {
                productName: {
                    required: true,
                    maxlength: 100
                },
                category: {
                    required: true
                },
                type: {
                    required: true
                },
                description: {
                    maxlength: 250
                },
                description: {
                    maxlength: 250
                },
                comments: {
                    maxlength: 250
                }
            },
            messages: {
            },
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };
        self.el.supplierProductForm.validate(validateJson);
    },
    uiEventInitialization: function () {
        var self = this;

        self.el.productType.on('change', function(){
            var selectedType = $(this).val();
            self.actionOnProductType(selectedType);
        });

        self.el.waferSelect.on('change', function (){
            var type = self.el.productType.val();
            var waferId = $(this).val();
            self.actionOnWaferChange(type, waferId);
        });

        $(document).on('change', 'select.service-select', function (){
            var services = $(this).val();
            var html = '';
            $.each(services, function (index, item){
                html += '<input name="supplierProductServiceList[' + index + '].id" style="display: none;" value=""/>';
                html += '<input name="supplierProductServiceList[' + index + '].service.id" style="display: none;" value="'+item+'"/>';
            });
            self.el.serviceSelectDiv.find('div.serviceHiddenDiv').html(html);
        });

    },
    actionOnProductType: function(selectedType){
        var self = this;
        if(selectedType == "WAFER"){
            self.el.waferSelect.removeAttr('disabled');
            self.el.deviceSelect.attr('disabled', true);
            self.createWaferOptions(self.options.selectedWafer, self.data.waferMap);

        }else if(selectedType == "DEVICE"){
            self.el.waferSelect.removeAttr('disabled');
            self.el.deviceSelect.removeAttr('disabled');
            self.createWaferOptions(self.options.selectedWafer, self.data.waferMap);

        } else if(selectedType == "OTHER"){
            self.createWaferOptions('', []);
            self.createDeviceOptions('', []);
            self.el.waferSelect.attr('disabled', true);
            self.el.deviceSelect.attr('disabled', true);

        }else{
            self.createWaferOptions('', []);
            self.createDeviceOptions('', []);
        }
    },
    actionOnWaferChange: function (type, waferId){
        var self = this;
        if(type == "DEVICE"){
            self.createDeviceOptions(self.options.selectedDevice, self.data.waferMap[waferId].deviceList);
        }
    },
    createWaferOptions: function(selectedValue, waferList){
        var self =  this;
        var html = '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(waferList, function (index, item){
            if (selectedValue == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.waferName + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.waferName + '</option>';
            }
        });
        self.el.waferSelect.html(html);
    },
    createDeviceOptions: function(selectedValue, deviceList){
        var self =  this;
        var html = '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(deviceList, function (index, item){
            if (selectedValue == item.deviceId) {
                html += '<option value="' + item.deviceId + '" selected>' + item.deviceNumber + '</option>';
            } else {
                html += '<option value="' + item.deviceId + '">' + item.deviceNumber + '</option>';
            }
        });
        self.el.deviceSelect.html(html);
    },
    createServiceSelectHtml: function(selectedValues){
        var self = this;
        var html = '<div class="form-group row">';
        html += '<label class="col-md-3 col-form-label">Service</label>';
        html += '<div class="col-md-9">';
        html += '<select class="custom-select select service-select" placeholder="Service" multiple="multiple">';
        $.each(self.options.serviceList, function (index, item) {
            html += '<option value="' + item.id + '">' + item.name + '</option>';
        });
        html += '</select>';
        html += '</div>';
        html += '<div class="serviceHiddenDiv"></div>';
        html += '</div>';
        self.el.serviceSelectDiv.html(html);
        $(document).find('.service-select').select2({minimumResultsForSearch: -1, width: '100%'});
        $(document).find('.service-select').val(selectedValues).trigger('change');
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.supplierProductForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.supplierProductForm.find('select').attr("disabled", true);
        self.el.supplierProductForm.find('textarea').attr("disabled", true);
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.supplierProductForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.supplierProductForm.attr("href", "#");
    },
    destroy: function () {
    }
});
