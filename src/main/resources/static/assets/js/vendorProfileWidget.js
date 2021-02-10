$.widget("forecast.vendor", {
    options: {
        serviceList: undefined,
        serviceItemList: undefined,
        shippingInfoItemList: undefined,
        billingInfoItemList: undefined,
        messages: undefined, // All static messages came from message_x.properties, will be passed here through this properties,
        viewOnly :undefined,
        serviceItem:{
          id: '',
          service: '',
          yield: '',
          days: ''
        },
        shippingInfoItem: {
            id: '',
            name: '',
            email: '',
            shippingAddress: '',
            phoneNumber: '',
            faxNumber: ''
        },
        billingInfoItem: {
            id: '',
            name: '',
            email: '',
            billingAddress: '',
            phoneNumber: '',
            faxNumber: ''
        },
        tabHeaderValueMap:{
            'basic-information-tab':'Basic Information',
            'shipping-information-tab':'Shipping Information',
            'billing-information-tab':'Billing Information',
            'advanced-information-tab':'Advanced Information'
        }
    },
    _create: function () {
        console.log("SMNLOG :: ---------- vendor profile widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {}; // this object is to keep all ui element.
        self.data = {}; // this object is to keep all local data.
        self.data.tabWiseErrorCountMap = {}; // this object is to keep all local data.

        if (self.options.serviceItemList != 'undefined') {
            self.options.serviceItemListSize = self.options.serviceItemList.length;
        }

        if (self.options.shippingInfoItemList != 'undefined') {
            self.options.shippingInfoItemListSize = self.options.shippingInfoItemList.length;
        }

        if (self.options.billingInfoItemList != 'undefined') {
            self.options.billingInfoItemListSize = self.options.billingInfoItemList.length;
        }

        // UI element Initialization
        self.el.vendorForm = $("#vendor_form");
        self.el.serviceLineItemDiv = $(".service-line-item-div");
        self.el.shippingInfoDynamicRowDiv = $("#shippingInfoDynamicRowDiv");
        self.el.billingInfoDynamicRowDiv = $("#billingInfoDynamicRowDiv");
        self.el.errorMessageBox = $("#errorMessageBox");

        self.el.submitButton = $("#submitButton");
        self.el.tabNextButton = $(".next-button");
        self.el.gobackButton = '<a href="/admin/vendorList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;'+ self.options.messages.goBack +'</a>';
        self.el.serviceAddButton = '<a type="button" class="itemAddButton "><i class="fa fa-plus fa-1g"></i></a>';
        self.el.serviceRemoveButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';
        self.el.shippingInfoAddButton = '<button type="button" class="btn save-button shippingItemAddButton"><i class="fa fa-plus"></i> Add</button>';
        self.el.shippingInfoRemoveButton = '<button type="button" class="btn save-button shippingItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';
        self.el.billingInfoAddButton = '<button type="button" class="btn save-button billingItemAddButton"><i class="fa fa-plus"></i> Add</button>';
        self.el.billingInfoRemoveButton = '<button type="button" class="btn save-button billingItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';
    },
    _init: function () {
        console.log("SMNLOG :: ---------- vendor profile widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.serviceItemListSize > 0) { // if update
            $.each(self.options.serviceItemList, function (index, serviceItem) {
                self.addLineItemForService(true, serviceItem);
            });
            self.addPlusIconForTheLastItemInService();
        } else { // By default one row
            self.addLineItemForService(true, self.options.serviceItem);

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastItemInService();
        }

        if (self.options.shippingInfoItemListSize > 0) { // if update
            $.each(self.options.shippingInfoItemList, function (index, shippingInfoItem) {
                self.addLineItemForShippingInfo(true, shippingInfoItem);
            });
            self.addPlusIconForTheLastShippingItem();
        } else { // By default one row
            self.addLineItemForShippingInfo(true, self.options.shippingInfoItem);

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastShippingItem();
        }

        if (self.options.billingInfoItemListSize > 0) { // if update
            $.each(self.options.billingInfoItemList, function (index, billingInfoItem) {
                self.addLineItemForBillingInfo(true, billingInfoItem);
            });
            self.addPlusIconForTheLastBillingItem();
        } else { // By default one row
            self.addLineItemForBillingInfo(true, self.options.billingInfoItem);

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastBillingItem();
        }
        self.uiEventInitialization();
        if (self.options.viewOnly == true){
            self.disableForViewOnly();
        }
    },
    initiateFormValidation: function () {
        var self = this;

        var validateJson = {
            ignore: [],
            rules: {
                name: {
                    required: true,
                    maxlength: 25
                },
                hasPriority: {
                    required: false
                },
                phoneNumber: {
                    required: true,
                    number: true
                },
                faxNumber: {
                    required: false,
                    number: true
                },
                email: {
                    required: true,
                    email: true
                },
                address: {
                    required: true
                },
                'username.id': {
                    required: true
                },
                'vendor.id': {
                    required: true
                }
            },
            messages: {
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
        self.el.vendorForm.validate(validateJson);

        // Add dynamic validation for newly added line items
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("service", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("yield", {required: true, number:true, max:100});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("days", {required: true, number:true});

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("shippingInfoName", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("shippingInfoPhone", {required: true, number:true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("shippingInfoEmail", {required: true, email:true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("shippingInfoFax", {required: false, number:true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("shippingInfoAddress", {required: true});

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("billingInfoName", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("billingInfoPhone", {required: true, number:true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("billingInfoEmail", {required: true, email:true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("billingInfoFax", {required: false, number:true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("billingInfoAddress", {required: true});
    },
    uiEventInitialization: function () {
        var self = this;
        $(document).on('click', 'a.itemAddButton', function () {
            self.addLineItemForService(true, self.options.serviceItem);

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastItemInService();
        });

        $(document).on('click', 'a.itemRemoveButton', function () {
            $(this).parent().parent().remove();

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastItemInService();

            // RE-INDEX the list items, user can remove an item from middle of the list, reindex will sync the index from 0-n.
            self.reIndexServiceItems();
        });
        $(document).on('click', 'button.shippingItemAddButton', function () {
            self.addLineItemForShippingInfo(true, self.options.shippingInfoItem);

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastShippingItem();
        });

        $(document).on('click', 'button.shippingItemRemoveButton', function () {
            $(this).parent().parent().parent().parent().remove();

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastShippingItem();

            // RE-INDEX the list items, user can remove an item from middle of the list, reindex will sync the index from 0-n.
            self.reIndexShippingInfoItems();
        });

        $(document).on('click', 'button.billingItemAddButton', function () {
            self.addLineItemForBillingInfo(true, self.options.billingInfoItem);

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastBillingItem();
        });

        $(document).on('click', 'button.billingItemRemoveButton', function () {
            $(this).parent().parent().parent().parent().remove();

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastBillingItem();

            // RE-INDEX the list items, user can remove an item from middle of the list, reindex will sync the index from 0-n.
            self.reIndexBillingInfoItems();
        });

        self.el.submitButton.on("click", function () {
            self.el.vendorForm.trigger('submit');
        });

        self.el.tabNextButton.on('click', function () {
            $('.nav-link.active').parent().next().find('a').tab('show');
        });

        self.el.serviceLineItemDiv.on('change', '.service' ,function(){
            var serviceName = $(this).val();
            var selectedElement = $(this);
            console.log("SMNLOG :: changed...."+serviceName);

            if(!self.isServiceUnique(serviceName, selectedElement)){
                $(this).val("");
                alert("You can not select this service. It's already been selected.");
            }
        });

    },
    isServiceUnique: function(selectedServiceName, selectedElement){
        var self = this;
        var isUnique = true;
        self.el.serviceLineItemDiv.find('select.service').not(selectedElement).each(function () {
            var serviceName = $(this).val();
            if(serviceName === selectedServiceName){
                isUnique = false;
            }
        });
        return isUnique;
    },
    reIndexServiceItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.serviceLineItemDiv.find('div.form-group').each(function(){
            name = 'serviceItemList[' + index + ']';
            $(this).find('div').find('input.serviceId').attr("name", name + ".id");
            $(this).find('div').find('select.service').attr("name", name + ".service");
            $(this).find('div').find('input.yield').attr("name", name + ".yield");
            $(this).find('div').find('input.days').attr("name", name + ".days");

            index++;
        });
    },
    getServiceSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="serviceItemList[' + index + '].service" class="custom-select service" placeholder="Service">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.serviceList, function (index, item) {
            if (selectedValue == item.name) {
                html += '<option value="' + item.name + '" selected>' + item.name + '</option>';
            } else {
                html += '<option value="' + item.name + '">' + item.name + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    reIndexShippingInfoItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.shippingInfoDynamicRowDiv.find('div.shipping-dynamic-row').each(function(){
            name = 'vendorShippingInfoList[' + index + ']';
            $(this).find('div').find('input.shippingInfoId').attr("name", name + ".id");
            $(this).find('div').find('input.shippingInfoName').attr("name", name + ".name");
            $(this).find('div').find('input.shippingInfoEmail').attr("name", name + ".email");
            $(this).find('div').find('textarea.shippingInfoAddress').attr("name", name + ".shippingAddress");
            $(this).find('div').find('input.shippingInfoPhone').attr("name", name + ".phoneNumber");
            $(this).find('div').find('input.shippingInfoFax').attr("name", name + ".faxNumber");

            index++;
        });
    },
    reIndexBillingInfoItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.billingInfoDynamicRowDiv.find('div.billing-dynamic-row').each(function(){
            name = 'vendorBillingInfoList[' + index + ']';
            $(this).find('div').find('input.billingInfoId').attr("name", name + ".id");
            $(this).find('div').find('input.billingInfoName').attr("name", name + ".name");
            $(this).find('div').find('input.billingInfoEmail').attr("name", name + ".email");
            $(this).find('div').find('textarea.billingInfoAddress').attr("name", name + ".billingAddress");
            $(this).find('div').find('input.billingInfoPhone').attr("name", name + ".phoneNumber");
            $(this).find('div').find('input.billingInfoFax').attr("name", name + ".faxNumber");

            index++;
        });
    },
    addLineItemForService: function (isPlusIcon, serviceItem) {
        var self = this;
        //dynamic row creation
        var index = self.el.serviceLineItemDiv.find('div.form-group').length;

        var $rowToAppend = '<div class="form-group row">'
            + '<div class="col-md-4">'
            + '<input type="text" name="serviceItemList[' + index + '].id" class="serviceId" style="display: none;" value="' + serviceItem.id + '"/>'
            + self.getServiceSelectBoxHtml(index, serviceItem.service)
            + '</div>'
            + '<div class="col-md-3">'
            + '<input type="text" name="serviceItemList[' + index + '].yield" value="' + serviceItem.yield + '" class="form-control yield" placeholder="%" />'
            + '</div>'
            + '<div class="col-md-3">'
            + '<input type="text" name="serviceItemList[' + index + '].days" value="' + serviceItem.days + '" class="form-control days" placeholder="Days" />'
            + '</div>'
            + '<div class="col-md-2 pr-0 itemAddremoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.serviceAddButton;
        } else {
            $rowToAppend += self.el.serviceRemoveButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.serviceLineItemDiv.append($rowToAppend);
        self.el.serviceLineItemDiv.find('div.form-group:last').prev().find('div.itemAddremoveButtonDiv').html(self.el.serviceRemoveButton);
    },
    addPlusIconForTheLastItemInService: function () {
        var self = this;
        if(self.el.serviceLineItemDiv.children().length == 1){
            self.el.serviceLineItemDiv.find('div.form-group:last').find('div.itemAddremoveButtonDiv').html(self.el.serviceAddButton);
        }
        else{
            self.el.serviceLineItemDiv.find('div.form-group:last').find('div.itemAddremoveButtonDiv').html(self.el.serviceRemoveButton + self.el.serviceAddButton);
        }
    },
    addLineItemForShippingInfo: function (isPlusIcon, shippingInfoItem) {
        var self = this;
        //dynamic row creation
        var index = self.el.shippingInfoDynamicRowDiv.find('div.shipping-dynamic-row').length;

        var $rowToAppend = '<div class="row shipping-dynamic-row">'
            +'<div class="col-lg-6 px-5">'
            +'<div class="form-group row">'
            +'<input type="text" name="vendorShippingInfoList[' + index + '].id" class="shippingInfoId" style="display: none;" value="' + shippingInfoItem.id + '"/>'
            +'<label htmlFor="shippingInfoName" class="col-md-3 col-form-label">'+ self.options.messages.name +'</label>'
            +'<div class="col-md-9">'
            +'<input type="text" name="vendorShippingInfoList[' + index + '].name" class="form-control shippingInfoName" placeholder="Name" value="' + shippingInfoItem.name + '"  />'
            +'</div>'
            +'</div>'
            +'<div class="form-group row">'
            +'<label htmlFor="shippingInfoEmail" class="col-md-3 col-form-label">'+ self.options.messages.email +'</label>'
            +'<div class="col-md-9">'
            +'<input type="text" name="vendorShippingInfoList[' + index + '].email" class="form-control shippingInfoEmail" placeholder="Email" value="' + shippingInfoItem.email + '" />'
            +'</div>'
            +'</div>'
            +'<div class="form-group row">'
            +'<label htmlFor="shippingInfoPhone" class="col-md-3 col-form-label">'+ self.options.messages.phone +'</label>'
            +'<div class="col-md-9">'
            +'<input type="text" name="vendorShippingInfoList[' + index + '].phoneNumber" class="form-control shippingInfoPhone" placeholder="Phone" value="' + shippingInfoItem.phoneNumber + '" />'
            +'</div>'
            +'</div>'
            +'</div>'
            +'<div class="col-lg-6 px-5">'
            +'<div class="form-group row">'
            +'<label htmlFor="shippingInfoFax" class="col-md-3 col-form-label">'+ self.options.messages.fax +'</label>'
            +'<div class="col-md-9">'
            +'<input type="text" name="vendorShippingInfoList[' + index + '].faxNumber" class="form-control shippingInfoFax"  placeholder="Fax Number" value="' + shippingInfoItem.faxNumber + '" />'
            +'</div>'
            +'</div>'
            +'<div class="form-group row">'
            +'<label htmlFor="shippingInfoAddress" class="col-md-3 col-form-label">'+ self.options.messages.shippingAddress +'</label>'
            +'<div class="col-md-9">'
            +'<textarea class="form-control shippingInfoAddress" name="vendorShippingInfoList[' + index + '].shippingAddress" rows="3" placeholder="Shipping Address">'+ shippingInfoItem.shippingAddress +'</textarea>'
            +'</div>'
            +'</div>'
            +'<div class="form-group row">'
            +'<div class="col-md-12 shippingItemAddRemoveButtonDiv" style="text-align:right">';

        if (isPlusIcon) {
            $rowToAppend += self.el.shippingInfoAddButton;
        } else {
            $rowToAppend += self.el.shippingInfoRemoveButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.shippingInfoDynamicRowDiv.append($rowToAppend);
        self.el.shippingInfoDynamicRowDiv.find('div.shipping-dynamic-row:last').prev().find('div.shippingItemAddRemoveButtonDiv').html(self.el.shippingInfoRemoveButton);
    },
    addPlusIconForTheLastShippingItem: function () {
        var self = this;
        if(self.el.shippingInfoDynamicRowDiv.children().length == 1){
            self.el.shippingInfoDynamicRowDiv.find('div.shipping-dynamic-row:last').find('div.shippingItemAddRemoveButtonDiv').html(self.el.shippingInfoAddButton);
        }
        else{
            self.el.shippingInfoDynamicRowDiv.find('div.shipping-dynamic-row:last').find('div.shippingItemAddRemoveButtonDiv').html(self.el.shippingInfoRemoveButton + self.el.shippingInfoAddButton);
        }
    },
    addLineItemForBillingInfo: function (isPlusIcon, billingInfoItem) {
        var self = this;
        //dynamic row creation
        var index = self.el.billingInfoDynamicRowDiv.find('div.billing-dynamic-row').length;

        var $rowToAppend = '<div class="row billing-dynamic-row">'
            +'<div class="col-lg-6 px-5">'
            +'<div class="form-group row">'
            +'<input type="text" name="vendorBillingInfoList[' + index + '].id" class="billingInfoId" style="display: none;" value="' + billingInfoItem.id + '" />'
            +'<label htmlFor="billingInfoName" class="col-md-3 col-form-label">'+ self.options.messages.name +'</label>'
            +'<div class="col-md-9">'
            +'<input type="text" name="vendorBillingInfoList[' + index + '].name" class="form-control billingInfoName" placeholder="Name" value="' + billingInfoItem.name + '" />'
            +'</div>'
            +'</div>'
            +'<div class="form-group row">'
            +'<label htmlFor="billingInfoEmail" class="col-md-3 col-form-label">'+ self.options.messages.email +'</label>'
            +'<div class="col-md-9">'
            +'<input type="text" name="vendorBillingInfoList[' + index + '].email" class="form-control billingInfoEmail" placeholder="Email" value="' + billingInfoItem.email + '" />'
            +'</div>'
            +'</div>'
            +'<div class="form-group row">'
            +'<label htmlFor="billingInfoPhone" class="col-md-3 col-form-label">'+ self.options.messages.phone +'</label>'
            +'<div class="col-md-9">'
            +'<input type="text" name="vendorBillingInfoList[' + index + '].phoneNumber" class="form-control billingInfoPhone" placeholder="Phone" value="' + billingInfoItem.phoneNumber + '" />'
            +'</div>'
            +'</div>'
            +'</div>'
            +'<div class="col-lg-6 px-5">'
            +'<div class="form-group row">'
            +'<label htmlFor="billingInfoFax" class="col-md-3 col-form-label">'+ self.options.messages.fax +'</label>'
            +'<div class="col-md-9">'
            +'<input type="text" name="vendorBillingInfoList[' + index + '].faxNumber" class="form-control billingInfoFax"  placeholder="Fax Number" value="' + billingInfoItem.faxNumber + '" />'
            +'</div>'
            +'</div>'
            +'<div class="form-group row">'
            +'<label htmlFor="billingInfoAddress" class="col-md-3 col-form-label">'+ self.options.messages.billingAddress +'</label>'
            +'<div class="col-md-9">'
            +'<textarea class="form-control billingInfoAddress" name="vendorBillingInfoList[' + index + '].billingAddress" rows="3" placeholder="Billing Address">'+ billingInfoItem.billingAddress + '</textarea>'
            +'</div>'
            +'</div>'
            +'<div class="form-group row">'
            +'<div class="col-md-12 billingItemAddRemoveButtonDiv" style="text-align:right">';

        if (isPlusIcon) {
            $rowToAppend += self.el.billingInfoAddButton;
        } else {
            $rowToAppend += self.el.billingInfoRemoveButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.billingInfoDynamicRowDiv.append($rowToAppend);
        self.el.billingInfoDynamicRowDiv.find('div.billing-dynamic-row:last').prev().find('div.billingItemAddRemoveButtonDiv').html(self.el.billingInfoRemoveButton);
    },
    addPlusIconForTheLastBillingItem: function () {
        var self = this;
        if(self.el.billingInfoDynamicRowDiv.children().length == 1){
            self.el.billingInfoDynamicRowDiv.find('div.billing-dynamic-row:last').find('div.billingItemAddRemoveButtonDiv').html(self.el.billingInfoAddButton);
        }
        else{
            self.el.billingInfoDynamicRowDiv.find('div.billing-dynamic-row:last').find('div.billingItemAddRemoveButtonDiv').html(self.el.billingInfoRemoveButton + self.el.billingInfoAddButton);
        }
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.vendorForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.vendorForm.find('select').attr("disabled", true);
        self.el.vendorForm.find('textarea').attr("disabled", true);
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.vendorForm.find('a[type="button"]').hide();
        self.el.vendorForm.find('button[type="button"]').not(".next-button").hide();
        self.el.vendorForm.attr("href", "#");
    },
    showErrorCountInTabHeader: function(errorMap, errorList){
        var self = this;
        self.data.tabWiseErrorCountMap = {};
        self.el.vendorForm.find("div.tab-content").find('.tab-pane').find(".error:not(label)").each(function(){
            var parentTabId = $(this).closest("div.tab-pane").attr("id");
            if(typeof self.data.tabWiseErrorCountMap[parentTabId] != 'undefined'){
                self.data.tabWiseErrorCountMap[parentTabId]++;
            }else{
                self.data.tabWiseErrorCountMap[parentTabId] = 1;
            }

        });
        self.keepDefaultValueForTabHeader();

        $.each(self.data.tabWiseErrorCountMap, function(key, value){
            self.el.vendorForm.find("ul.nav-tabs").find("#"+key+"-tab").html(self.options.tabHeaderValueMap[key+'-tab']+"&nbsp;<font style='color: #dd0000;'>("+ value +")</font>")
        });
    },
    keepDefaultValueForTabHeader: function(){
        var self = this;
        $.each(self.options.tabHeaderValueMap, function(key, value){
            self.el.vendorForm.find("ul.nav-tabs").find("#"+key).html(self.options.tabHeaderValueMap[key]);
        });
    },
    destroy: function () {
    }
});