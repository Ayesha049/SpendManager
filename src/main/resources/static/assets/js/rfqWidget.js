$.widget("forecast.rfq", {
    options: {
        rfqSupplierList: undefined,
        organizationList: undefined,
        organizationAddressList: undefined,
        submitForQuotationButtonElement: undefined,
        rfqSupplierListSize: 0,
        messages: undefined,
        viewOnly :undefined,
        addressTypeList:undefined,
        addressNameList:undefined,
        supplierItem: {
            id: '',
            addressBookType: '',
            email: '',
            address: '',
            phoneNumber: '',
            faxNumber: '',
            active: '',
            organizationId:0
        }
    },
    _create: function () {
        console.log("SMNLOG :: ---------- rfq widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};

        // UI element Initialization
        self.el.rfqForm = $("#rfq_form");
        self.el.dynamicRowDiv = $("#dynamicRowDiv");
        self.el.supplierLineItemDiv = $('.supplier-line-item-div');
        self.el.searchBoxReviewer = $('#searchReviewer');
        self.el.submitButton = $("#submitButton");
        self.el.tabNextButton = $(".next-button");
        self.el.submitForQuotationButtonElement = self.options.submitForQuotationButtonElement;

        console.log(self.options.rfqSupplierList);

        if (self.options.rfqSupplierList != 'undefined') {
            self.options.rfqSupplierListSize = self.options.rfqSupplierList.length;
        }

        self.el.gobackButton = '<a href="/admin/rfqList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<a type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.removeButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';
        self.el.fileViewButton = '<a type="button" target="_blank" id="fileViewButton" class="btn save-button next-button">View File</a>';

    },
    _init: function () {
        console.log("SMNLOG :: ---------- rfq widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.rfqSupplierListSize > 0) { // if update
            $.each(self.options.rfqSupplierList, function (index, supplierItem) {
                self.addLineItemForSupplier(true, supplierItem);
            });
            self.addPlusIconForTheLastItem();
        } else {
            self.addLineItemForSupplier(true, self.options.supplierItem);
            self.addPlusIconForTheLastItem();
        }

        self.uiEventInitialization();

        if (self.options.viewOnly == true){
            self.disableForViewOnly();
        }
        console.log("adress object list... ");
        console.log(self.options.organizationAddressList);

    },
    initiateFormValidation: function () {
        var self = this;
        var validateJson = {
            rules: {
                rfqNumber: {
                    required: true,
                    maxlength: 25
                },
                rfqType: {
                    required: true
                },
                dueDate: {
                    required: true
                },
                project: {
                    maxlength: 64
                },
                comments: {
                    maxlength: 250
                },
                'preparedBy.username': {
                    required: true
                }
            }
        };
        self.el.rfqForm.validate(validateJson);

        // Add dynamic validation for newly added line items
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("organizationId", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("addressType", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("addressName", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("email", {email:true, required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("address", {required: true});
    },
    uiEventInitialization: function () {
        var self = this;

        self.el.submitButton.on('click', function(){
            self.el.rfqForm.trigger('submit');
        });

        $(document).on('change', "body", function () {
            console.log("AFRILOG :: ---------- form changed ----------")
            self.el.submitForQuotationButtonElement.hide();
        });

        $(document).on('click', 'a.itemAddButton', function () {
            self.addLineItemForSupplier(true, self.options.supplierItem);

            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'a.itemRemoveButton', function () {
            $(this).parent().parent().remove();
            self.addPlusIconForTheLastItem();
            self.reIndexSupplierItems();
        });

        $(document).on('change', '.organizationId', function () {
            var organization = +$(this).val();
             var selectedElement = $(this);

             if(!self.isOrganizationUnique(organization, selectedElement)){
                 $(this).val("");
                 alert("You can not select this organization. It's already been selected.");
             } else {
                 var that = this;
                 $(that).closest('div.form-group').find('div').eq(1).find('select').val('');
                 $(that).closest('div.form-group').find('div').eq(2).find('select').val('');
                 $(that).closest('div.form-group').find('div').eq(3).find('input').val('');
                 $(that).closest('div.form-group').find('div').eq(4).find('input').val('');
                 self.refreshSelectBoxForAddressType(that);
             }

        });


        $(document).on('change', '.addressType', function () {
            var that = this;
            $(that).closest('div.form-group').find('div').eq(3).find('input').val('');
            // console.log($(that).closest('div.form-group').find('div').eq(3).find('input'));
            $(that).closest('div.form-group').find('div').eq(4).find('input').val('');
            self.refreshSelectBoxForAddress(that);
        });

        $(document).on('change', '.addressName', function () {
            var that = this;
            var addressId = +$(that).val();
            var organizationId = $(that).closest('div.form-group').find('select.organizationId').val();
            var addressType = $(that).closest('div.form-group').find('select.addressType').val();
            console.log("SMNLOG addressId::"+addressId);

            $.each(self.getFilteredSupplierItemList(organizationId, addressType), function(index, item){
                if(+item.id == addressId){
                    $(that).closest('div.form-group').find('div').eq(3).find('input').val(item.email).valid();
                    $(that).closest('div.form-group').find('div').eq(4).find('input').val(item.address).valid();
                }
            });
        });
    },
    isOrganizationUnique: function(selectedOrganizationId, selectedElement){
        var self = this;
        var isUnique = true;
        self.el.supplierLineItemDiv.find('select.organizationId').not(selectedElement).each(function () {
            var organization = +$(this).val();
            if(organization === selectedOrganizationId){
                isUnique = false;
            }
        });
        return isUnique;
    },
    refreshSelectBoxForAddress: function(that){
        var self = this;
        var list = [];
        var index = +$(that).closest('div.form-group').attr('data-attr-index');
        var organizationId = $(that).closest('div.form-group').find('select.organizationId').val();
        var addressType = $(that).closest('div.form-group').find('select.addressType').val();

        console.log($(that).closest('div.form-group').find('div').eq(2));
        console.log(index);
        console.log(organizationId);
        console.log(addressType);
        console.log(self.getFilteredSupplierItemList(organizationId, addressType));
        $(that).closest('div.form-group').find('div').eq(2).html(self.makeSelectBoxForAddressName(self.getFilteredSupplierItemList(organizationId, addressType), '',
            'rfqSupplierList[' + index + '].addressName', 'addressName'));
    },
    refreshSelectBoxForAddressType: function(that){
        var self = this;
        var organizationId = $(that).closest('div.form-group').find('select.organizationId').val();
        var index = +$(that).closest('div.form-group').attr('data-attr-index');
        console.log('filtered addressTypes.... ')
        console.log(self.getFilteredAddressTypeList(organizationId));
        $(that).closest('div.form-group').find('div').eq(1).html(self.getSelectBox(self.getFilteredAddressTypeList(organizationId), '', 'rfqSupplierList[' + index + '].addressBookType.id', 'addressType'));

    },
    reIndexSupplierItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.supplierLineItemDiv.find('div.form-group').each(function(){
            name = 'rfqSupplierList[' + index + ']';
            $(this).find('div').find('input.rfqSupplierId').attr("name", name + ".id");
            $(this).find('div').find('select.organizationId').attr("name", name + ".organization.id");
            $(this).find('div').find('select.addressType').attr("name", name + ".addressType");
            $(this).find('div').find('select.addressName').attr("name", name + ".addressName");
            $(this).find('div').find('input.email').attr("name", name + ".email");
            $(this).find('div').find('input.phoneNumber').attr("name", name + ".phoneNumber");
            $(this).find('div').find('input.address').attr("name", name + ".address");
            $(this).find('div').find('input.faxNumber').attr("name", name + ".faxNumber");

            index++;
        });
    },
    addLineItemForSupplier: function (isPlusIcon, supplierItem) {
        var self = this;
        //dynamic row creation
        var index = self.el.supplierLineItemDiv.find('div.form-group').length;
        console.log("SMNLOG supplierItem::"+JSON.stringify(supplierItem));
        var $rowToAppend = '<div class="form-group row" data-attr-index="'+index+'">'
            + '<div class="col-md-3">'
            + '<input type="text" name="rfqSupplierList[' + index + '].id" class="rfqSupplierId" style="display: none;" value="' + supplierItem.id + '"/>'
            + '<input type="text" name="rfqSupplierList[' + index + '].faxNumber" class="faxNumber" style="display: none;" value="' + supplierItem.faxNumber + '"/>'
            + self.getSelectBoxForOrganization(self.options.organizationList, supplierItem.organizationId, 'rfqSupplierList[' + index + '].organization.id', 'organizationId')
            + '</div>'
            + '<div class="col-md-2">'
            + self.getSelectBox(self.options.addressTypeList, supplierItem.addressBookType, 'rfqSupplierList[' + index + '].addressBookType.id', 'addressType')
            + '</div>'
            + '<div class="col-md-2">'
            + self.makeSelectBoxForAddressName(self.getFilteredSupplierItemList(supplierItem.organizationId, supplierItem.addressBookType), supplierItem.addressName, 'rfqSupplierList[' + index + '].addressName', 'addressName')
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="rfqSupplierList[' + index + '].email" value="' + supplierItem.email + '" class="form-control email disabled" placeholder="Email "/>'
            + '</div>'
            // + '<div class="col-md-2">'
            // + '<input type="text" name="rfqSupplierList[' + index + '].phoneNumber" value="' + supplierItem.phoneNumber + '" class="form-control phoneNumber" placeholder="Phone Number" />'
            // + '</div>'
            // + '<div class="col-md-2">'
            // + '<input type="text" name="rfqSupplierList[' + index + '].faxNumber" value="' + supplierItem.faxNumber + '" class="form-control cost" placeholder="Fax Number" />'
            // + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="rfqSupplierList[' + index + '].address" value="' + supplierItem.address + '" class="form-control address disabled" placeholder="Address"/>'
            + '</div>'
            + '<div class="col-md-1 itemAddRemoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.supplierLineItemDiv.append($rowToAppend);
        self.el.supplierLineItemDiv.find('div.form-group:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.removeButton);
    },
    getFilteredSupplierItemList: function(organizationId, addressType){
        var self = this;
        var list = [];
        console.log(self.options.organizationAddressList);
        $.each(self.options.organizationAddressList, function(index, item){
            if(+item.organizationId == organizationId && +item.addressType == addressType){
                list.push(item);
            }
        });
        return list;
    },
    getFilteredAddressTypeList: function(organizationId){
        var self = this;
        var list = [];
        $.each(self.options.organizationAddressList, function(index, item){
            if(+item.organizationId == organizationId){
                list.push(+item.addressType);
            }
        });
        var filteredList = [];
        $.each(self.options.addressTypeList, function(index, item){
            if(list.includes(+item.id)){
                filteredList.push(item);
            }
        });
        return filteredList;
    },
    getSelectBoxForOrganization: function (list, selectedItem, name, cls) {
        var self = this;
        var html = '<select name="'+name+'" class="form-control '+cls+'">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(list, function (index, item) {
            if (selectedItem == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.value + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.value + '</option>';
            }
        });
        html +='</select>';
        return html;
    },
    getSelectBox: function (list, selectedItem, name, cls) {
        var self = this;
        var html = '<select name="'+name+'" class="form-control '+cls+'">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(list, function (index, item) {
            if (selectedItem == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.label + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.label + '</option>';
            }
        });
        html +='</select>';
        return html;
    },
    makeSelectBoxForAddressName: function (list, selectedItem, name, cls) {
        console.log('addressname list ');
        console.log(list);
        console.log(selectedItem);
        var self = this;
        var html = '<select name="'+name+'" class="form-control '+cls+'">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(list, function (index, item) {
            if (selectedItem == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.name + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.name + '</option>';
            }
        });
        html +='</select>';
        return html;
    },
    addPlusIconForTheLastItem: function () {
        var self = this;
        if(self.el.supplierLineItemDiv.children().length == 1){
            self.el.supplierLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.addButton);
        }
        else{
            self.el.supplierLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.removeButton + self.el.addButton);
        }
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.rfqForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.rfqForm.find('select').attr("disabled", true);
        self.el.rfqForm.find('textarea').attr("disabled", true);
        self.el.searchBoxReviewer.attr("disabled", true);
        self.el.rfqForm.find('a[type="button"]').not("#submitButton , #fileViewButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.rfqForm.attr("href", "#");
    },
    destroy: function () {
    }
});
