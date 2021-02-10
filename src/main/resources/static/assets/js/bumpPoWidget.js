$.widget("forecast.bumpPo", {
    options: {
        productList: undefined,
        addressItemList: undefined,
        filteredOrgList: undefined,
        addressTypeList:undefined,
        organizationAddressList: undefined,
        productItemList: undefined,
        lineItemTypeList: undefined,
        lineItemCostCentreList: undefined,
        isVendor: [true, false],
        isShipTo: [false, true],
        glAccountList: undefined,
        messages: undefined,
        viewOnly:undefined,
        labelName: ['Ship to Information', 'Vendor Information'],
        addressItem: {
            id: '',
            organization: '',
            addressBookType: '',
        },
        productItem: {
            id: '',
            cost: 0,
            amount: 0,
            description: '',
            crd: '',
            costCentreNumber: '',
            category: '',
            quantity: 0,
            otherItem: '',
            product: '',
            salesTaxes: 0,
            discount: 0,
            internalItemList: []
        },
    },
    _create: function () {
        console.log("SMNLOG :: ---------- bumpPo widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        self.data.productMap = {};
        self.data.addressTypeMap = {};
        self.data.productMapByCategory = {};
        self.data.addressTypeByOrganizationMap = {};
        self.data.addressByOrganizationAndTypeMap = {};
        self.data.filteredOrgList = [];
        self.data.shipToSelectMap = {};
        self.data.vendorSelectMap = {};

        if (self.options.productItemList != 'undefined') {
            self.options.productItemListSize = self.options.productItemList.length;
        }

        if (self.options.addressItemList != 'undefined') {
            self.options.addressItemListSize = self.options.addressItemList.length;
        }

        if(self.options.productList != 'undefined'){
            $.each(self.options.productList, function (index, product){
                self.data.productMap[product.id] = {
                    productName: product.productName,
                    description: product.description
                };

                if(self.data.productMapByCategory[product.category] == undefined){
                    self.data.productMapByCategory[product.category] = [{
                        id: product.id,
                        productName: product.productName
                    }]
                }else{
                    self.data.productMapByCategory[product.category].push({id: product.id, productName: product.productName});
                }
            });
        }

        if(self.options.addressTypeList != 'undefined'){
            $.each(self.options.addressTypeList, function (index, item){
                self.data.addressTypeMap[item.id] = {
                    id: item.id,
                    label: item.label
                }
            });
        }

        if(self.options.organizationAddressList != 'undefined'){
            $.each(self.options.organizationAddressList, function (index, item){
                self.data.addressByOrganizationAndTypeMap[item.organizationId +'_'+ item.addressType] = item;

                if(self.data.addressTypeByOrganizationMap[item.organizationId] == undefined){
                    if(item.addressType != null) {
                        self.data.addressTypeByOrganizationMap[item.organizationId] = [{
                            id: item.addressType,
                            label: self.data.addressTypeMap[item.addressType].label
                        }];
                    }

                }else{
                    if(item.addressType != null) {
                        self.data.addressTypeByOrganizationMap[item.organizationId].push({id: item.addressType, label: self.data.addressTypeMap[item.addressType].label});
                    }
                }
                if(item.isSupplier == true && item.isMovandi == false) {
                    self.data.vendorSelectMap[item.organizationId] = {
                        id: item.organizationId,
                        value: item.organizationName
                    };
                }
                if(item.isMovandi == false){
                    self.data.shipToSelectMap[item.organizationId] = {
                        id: item.organizationId,
                        value: item.organizationName
                    };
                }

            });
            self.data.filteredOrgList.push(self.data.shipToSelectMap);
            self.data.filteredOrgList.push(self.data.vendorSelectMap);

            console.log(self.data.filteredOrgList);
        }

        // UI element Initialization
        self.el.bumpPoForm = $("#bump_po_form");
        self.el.errorMessageBox = $("#errorMessageBox");
        self.el.PONumber = $("#PONumber");
        self.el.poType = $("#type");
        self.el.dynamicRowDiv = $("#dynamicRowDiv");
        self.el.totalCost = $("#totalCost");
        self.el.totalQuantity = $("#totalQuantity");
        self.el.discount = $("#discount");
        self.el.salesTaxes = $("#salesTaxes");
        self.el.productLineItemDiv = $(".product-line-item-div");
        self.el.submitButton = $("#submitButton");
        self.el.shipToAndVendorDiv = $('.shipToAndVendorDiv');
        self.el.costCenterListForOpenPO = $('#costCenterListForOpenPO');
        self.el.glAccountListForOpenPO = $('#glAccountListForOpenPO');

        self.el.gobackButton = '<a href="/admin/bumpPOList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<button type="button" class="btn btn-primary itemAddButtonFlat" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.removeButton = '<button type="button" class="btn btn-danger itemRemoveButtonFlat"><i class="fa fa-minus"></i> Remove</button>';
        self.el.rowAddButton = '<a type="button" class="rowItemAddButton"><i class="fa fa-plus-circle" style="margin-left: 5px; font-size: 150% !important; padding-top: .35rem; cursor: pointer;"></i></a>';
        self.el.rowRemoveButton = '<a type="button" class="rowItemRemoveButton"><i class="fa fa-minus-circle" style="margin-left: 5px; font-size: 150% !important; padding-top: .35rem; cursor: pointer;"></i></a>';

    },
    _init: function () {
        console.log("SMNLOG :: ---------- bumpPo widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();
        self.uiEventInitialization();
        //self.el.poType.val('CLOSE_PO').trigger('change');

        if (self.options.addressItemListSize > 0) {
            $.each(self.options.addressItemList, function (index, addressItem) {
                self.addAddressInformationRow(index, addressItem, self.options.labelName[index], self.options.isVendor[index], self.options.isShipTo[index] );
            });

        } else {
            $.each(self.data.filteredOrgList, function (idx) {
                self.addAddressInformationRow(idx, self.options.addressItem, self.options.labelName[idx], self.options.isVendor[idx], self.options.isShipTo[idx]);
            });
        }
        if (self.options.productItemListSize > 0) {
            //self.el.poType.val('CLOSE_PO').off('change');
            if(self.el.poType.val() === 'CLOSE_PO'){
                self.el.costCenterListForOpenPO.empty();
                self.el.glAccountListForOpenPO.empty();
            }
            $.each(self.options.productItemList, function (index, productItem) {
                productItem["crd"] = Forecast.APP.convertDate(productItem.crd.time);
                self.addLineItemForProduct(true, productItem);
                self.addPlusIconForTheLastTableRowItem(self.el.productLineItemDiv.find('div.product-dynamic-row:last'));
            });
        }
        self.reRenderAllSelectPicker();
        self.addPlusIconForTheLastItem();

        if (self.options.viewOnly == true){
            self.disableForViewOnly();
        }

    },
    initiateFormValidation: function () {
        var self = this;
        var validateJson = {
            rules: {
                PONumber: {
                    required: true,
                    maxlength: 25
                },
                type: {
                    required: true
                },
                orderDate: {
                    required: true
                },
                'preparedBy.username': {
                    required: true
                },
                'requestedBy.id': {
                    required: true
                },
                justification: {
                    required: true
                },
                totalQuantity: {
                    required: true,
                    number: true,
                    max: 1000000000
                },
                totalCost: {
                    required: true,
                    number: true
                },
                discount: {
                    number: true,
                    min: 0,
                    max: 100,
                    step: ".01"
                },
                crd: {
                    required: true
                }
            },
            messages: {

            },
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            },
        };

        $.validator.addMethod("isTotalCountSameToExternal", function(value, element) {
            var rowDiv = $(element).closest('div.product-dynamic-row');
            var totalExternal = +$(rowDiv).find('input.quantity').val();
            var totalInternal = 0;
            var isDataValid = true;

            $(rowDiv).find('tr.internalTableRow').each(function (){
                totalInternal += +$(this).find('td input.internal-quantity').val();
            });

            if(totalInternal != totalExternal) isDataValid = false;

            return isDataValid;
        }, "Total Internal count must be equal to External count.");

        self.el.bumpPoForm.validate(validateJson);

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("product", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("category", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("quantity", {number:true, max: 100000000});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("cost", {number:true, max: 100000000});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("amount", {required: true, number:true, max: 100000000});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("crd", {required: true});

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("internal-cost-center", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("internal-quantity", {required: true, number: true, min: 1, isTotalCountSameToExternal: true});

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("organizationId", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("addressType", {required: true});
    },
    uiEventInitialization: function () {
        var self = this;

        self.el.poType.on('change', function () {
            var poNumber = self.el.PONumber.val().substring(0, 17);
            var poType = $(this).val().split("_")[0];
            self.el.PONumber.val(poNumber+"/"+poType);

            if(poType === 'BLANKET'){
                self.el.productLineItemDiv.empty();
                self.el.totalCost.attr("readonly", false);
                self.el.costCenterListForOpenPO.show();
                self.el.glAccountListForOpenPO.show();
            } else {
                self.addLineItemForProduct(true, self.options.productItem);
                self.addPlusIconForTheLastTableRowItem(self.el.productLineItemDiv.find('div.product-dynamic-row:last'));
                self.el.totalCost.attr("readonly", true);
                self.el.costCenterListForOpenPO.empty();
                self.el.glAccountListForOpenPO.empty();
            }

        });

        self.el.discount.on('keyup', function (){
            var discount = $(this).val();
            $(document).find('input.discount').each(function (){
                $(this).val(discount).trigger('keyup');
            });
        });

        self.el.salesTaxes.on('keyup', function (){
            var salesTaxes = $(this).val();
            $(document).find('input.sales-taxes').each(function (){
                $(this).val(salesTaxes);
            });
        });

        $(document).on('change', 'select.organizationId', function () {
            var organizationId = $(this).val();
            var index = $(this).closest('div.organizationRow').attr('data-attr-index');

            $(this).closest('div.organizationRow').find('div.addressTypeSelectDiv').html(self.getSelectBoxForAddressType(index, organizationId, ''));
        });

        $(document).on('click', 'i.addressNameDetails', function () {
            var organizationId = +$(this).closest('div.organizationRow').find('select.organizationId').val();
            var addressType = +$(this).closest('div.organizationRow').find('select.addressType').val();

            if(organizationId == '' || addressType == ''){
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("Please select both organization and address type."));
            }else{
                self.showAddressBookData(self.data.addressByOrganizationAndTypeMap[organizationId + '_' + addressType]);
            }
        });

        $(document).on('click', 'button.itemAddButtonFlat', function () {
            self.addLineItemForProduct(true, self.options.productItem);
            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'button.itemRemoveButtonFlat', function () {
            $(this).parent().parent().parent().remove();
            self.addPlusIconForTheLastItem();
            self.reIndexProductItems();

            self.updateTotalCost();
            self.updateTotalQuantity();
        });

        $(document).on('click', 'a.rowItemAddButton', function (){
            self.addRowInInternalTable(true, $(this).closest('div.product-dynamic-row'));
        });

        $(document).on('click', 'a.rowItemRemoveButton', function (){
            var parentDiv = $(this).closest('div.product-dynamic-row');
            $(this).closest('tr').remove();
            self.reIndexProductItems();
            self.addPlusIconForTheLastTableRowItem(parentDiv);
        });

        $(document).on('change', 'select.category', function () {
            var category = $(this).val();
            var index = $(this).attr('name').substring($(this).attr('name').indexOf('[')+1,$(this).attr('name').indexOf(']'));
            $(this).closest('div.product-dynamic-row').find('div.productDiv').html(self.getProductSelectBoxHtml(index, '', category));

            self.addRowInInternalTable(false, $(this).closest('div.product-dynamic-row'));
        });

        $(document).on('change', 'select.product', function () {
            var productId = +$(this).val();
            var selectedElement = $(this);

            if(!self.isProductUnique(productId, selectedElement)){
                $(this).val("");
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("You can not select this product. It's already been selected."));
            }else{
                $(this).closest('div.product-dynamic-row').find('textarea.description').val(self.data.productMap[productId].description);
                self.updateInternalProduct($(this).closest('div.product-dynamic-row'), productId);
            }
        });

        $(document).on('keyup', 'input.quantity', function () {
            var quantity = +$(this).val();
            self.updateTotalQuantity();

            self.updateInternalQuantity($(this).closest('.product-dynamic-row'), quantity);
            self.updateAmount($(this).closest('.product-dynamic-row'));
        });

        $(document).on('keyup', 'input.cost', function () {
            var cost = $(this).val();
            self.updateAmount($(this).closest('.product-dynamic-row'));

            self.updateInternalCost($(this).closest('.product-dynamic-row'), cost);
        });

        $(document).on('keyup', 'input.amount', function () {
            self.updateTotalCost();
        });

        $(document).on('keyup', 'input.discount', function () {
            var discount = $(this).val();
            self.updateAmount($(this).closest('.product-dynamic-row'));

            self.updateInternalDiscount($(this).closest('.product-dynamic-row'), discount);
        });

        $(document).on('keyup', 'input.internal-quantity', function () {
            self.updateInternalAmount($(this).closest('tr.internalTableRow'));

            $(document).find('input.internal-quantity').each(function (){
                $(this).valid();
            });
        });

        $(document).on('keyup', 'input.internal-cost', function () {
            self.updateInternalAmount($(this).closest('tr.internalTableRow'));
        });

        $(document).on('keyup', 'input.internal-discount', function () {
            self.updateInternalAmount($(this).closest('tr.internalTableRow'));
        });

        self.el.submitButton.on('click', function(){
            self.el.bumpPoForm.trigger('submit');
        });
    },
    addAddressInformationRow: function (idx, addressItem, labelName, isVendor, isShipTo) {
        var self = this;
        var index = self.el.shipToAndVendorDiv.find('div.form-group').length;
        var $rowToAppend = '<div class="col-md-4">'
            + '<div class="form-group row organizationRow" data-attr-index="'+index+'">'
            + '<label class="col-md-3 col-form-label"> ' +labelName+ ' </label>'
            + '<input type="text" name="addressInformationList[' + index + '].id" class="addressInfoId" style="display: none;" value="' + addressItem.id + '"/>'
            + '<input type="text" name="addressInformationList[' + index + '].isVendor" class="addressIsVendor" style="display: none;" value="' + isVendor + '"/>'
            + '<input type="text" name="addressInformationList[' + index + '].isShipTo" class="addressIsShipTo" style="display: none;" value="' + isShipTo + '"/>'
            + '<div class="col-md-3">'
            + self.getSelectBoxForOrganization(index, idx, addressItem.organization)
            + '</div>'
            + '<div class="col-md-3 addressTypeSelectDiv">'
            + self.getSelectBoxForAddressType(index, addressItem.organization, addressItem.addressBookType)
            + '</div>'
            + '<div class="col-md-2">'
            + '<i class="fa fa-address-card addressNameDetails" style="cursor: pointer;" title="Address Details"></i>'
            + '</div>'
            + '</div>';
        self.el.shipToAndVendorDiv.append($rowToAppend);
    },
    getSelectBoxForOrganization: function (index, rowIndex, selectedItem) {
        var self = this;
        var html = '<select name="addressInformationList[' + index + '].organization.id" class="form-control organizationId">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(self.data.filteredOrgList[rowIndex], function (index, item) {
            if (selectedItem == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.value + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.value + '</option>';
            }
        });
        html +='</select>';
        return html;
    },
    getSelectBoxForAddressType: function (index, selectedOrganizationId, selectedAddressType) {
        var self = this;
        var html = '<select name="addressInformationList[' + index + '].addressBookType.id" class="form-control addressType">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(self.data.addressTypeByOrganizationMap[selectedOrganizationId], function (index, item) {
            if (selectedAddressType == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.label + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.label + '</option>';
            }
        });
        html +='</select>';
        return html;
    },
    showAddressBookData: function(item){
        var self = this;
        var html = '<b>Address Book for : ' + item.organizationName + '</b>';
        html += '<div>';
        html += '<table class="dashboard-widget-table table">';
        html += '<tbody>';
        html += '<tr>';
        html += '<td>Address Name:</td>';
        html += '<td>' + item.name + '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td>Email:</td>';
        html += '<td>' + item.email + '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td>Phone Number:</td>';
        html += '<td>' + item.phoneNumber + '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td>Fax Number:</td>';
        html += '<td>' + item.faxNumber + '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td>Address:</td>';
        html += '<td>' + item.address + '</td>';
        html += '</tr>';
        html += '</tbody>';
        html += '</table>';
        html += '</div>';

        bootbox.alert(html);
    },
    isProductUnique: function(selectedProductId, selectedElement){
        var self = this;
        var isUnique = true;
        self.el.productLineItemDiv.find('select.product').not(selectedElement).each(function () {
            var productId = +$(this).val();
            if(productId === selectedProductId){
                isUnique = false;
            }
        });
        return isUnique;
    },
    reIndexProductItems: function(){
        var self = this;
        var index = 0;
        var itemCount = 0;
        var name = '';

        self.el.productLineItemDiv.find('div.product-dynamic-row').each(function(){
            name = 'productItemList[' + index + ']';
            $(this).find('div').find('input.product-line-id').attr("name", name + ".id");
            $(this).find('div').find('input.secret-code').attr("name", name + ".secretCode");
            $(this).find('div').find('input.type').attr("name", name + ".type");
            $(this).find('div').find('select.category').attr("name", name + ".category");
            $(this).find('div').find('select.product').attr("name", name + ".product.id");
            $(this).find('div').find('input.quantity').attr("name", name + ".quantity");
            $(this).find('div').find('input.crd').attr("name", name + ".crd");
            $(this).find('div').find('input.cost').attr("name", name + ".cost");
            $(this).find('div').find('input.amount').attr("name", name + ".amount");
            $(this).find('div').find('input.discount').attr("name", name + ".discount");
            $(this).find('div').find('input.sales-taxes').attr("name", name + ".salesTaxes");

            index++;
            itemCount++;
            $(this).find('div').find('input.item-number').attr("value", itemCount);

            $(this).find('tr.internalTableRow').each(function(){
                name = 'productItemList[' + index + ']';
                $(this).find('td').find('input.internal-line-id').attr("name", name + ".id");
                $(this).find('td').find('input.internal-secret-code').attr("name", name + ".secretCode");
                $(this).find('td').find('input.internal-type').attr("name", name + ".type");
                $(this).find('td').find('input.internal-category').attr("name", name + ".category");
                $(this).find('td').find('input.internal-product').attr("name", name + ".product.id");
                $(this).find('td').find('input.internal-quantity').attr("name", name + ".quantity");
                $(this).find('td').find('input.internal-cost').attr("name", name + ".cost");
                $(this).find('td').find('input.internal-amount').attr("name", name + ".amount");
                $(this).find('td').find('input.internal-discount').attr("name", name + ".discount");
                $(this).find('td').find('select.internal-cost-center').attr("name", name + ".costCenter.id");
                $(this).find('td').find('select.internal-gl-account').attr("name", name + ".glAccount.id");

                index++;
            });
        });
    },
    getLineItemCategorySelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="productItemList[' + index + '].category" class="custom-select category" placeholder="Category">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.lineItemTypeList, function (index, item) {
            if (selectedValue == item.name) {
                html += '<option value="' + item.name + '" selected>' + item.label + '</option>';
            } else {
                html += '<option value="' + item.name + '">' + item.label + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    getCostCentreSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="productItemList[' + index + '].costCenter.id" class="custom-select selectpicker show-tick internal-cost-center" data-live-search="true" placeholder="Cost Center">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.lineItemCostCentreList, function (index, item) {
            if (selectedValue == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.costCenterNumber + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.costCenterNumber + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    getGLAccountSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="productItemList[' + index + '].glAccount.id" class="custom-select selectpicker show-tick internal-gl-account" data-live-search="true" placeholder="GL Account">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.glAccountList, function (index, item) {
            if (selectedValue == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.accountNumber + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.accountNumber + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    getProductSelectBoxHtml: function (index, selectedProductValue, selectedCategoryValue) {
        var self = this;
        var html = '<select name="productItemList[' + index + '].product.id" class="custom-select product" placeholder="Product">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.data.productMapByCategory[selectedCategoryValue], function (index, item) {
            if (selectedProductValue == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.productName + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.productName + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    getDescriptionHtml: function(index, selectedProductValue){
        var self = this;
        var html = '<div class="form-group row">';
        html += '<label class="col-md-5 col-form-label">' + 'Description' + '</label>';
        html += '<div class="col-md-7">';
        html += '<textarea class="form-control description" rows="3" placeholder="Description" readonly>';
        if(self.data.productMap[selectedProductValue] != undefined){
            html +=  self.data.productMap[selectedProductValue].description;
        }
        html += '</textarea>';
        html += '</div>';
        html += '</div>';

        return html;


    },
    addLineItemForProduct: function (isPlusIcon, productItem) {
        var self = this;
        var index = self.el.productLineItemDiv.find('div.product-dynamic-row').length + self.el.productLineItemDiv.find('tr.internalTableRow').length;
        var itemCount = self.el.productLineItemDiv.find('div.product-dynamic-row').length + 1;
        var secretCode = new Date().getMilliseconds();

        var $rowToAppend = '<div class="row product-dynamic-row lineItemBorder" attr-secretCode="'+secretCode+'">'
            + '<div class="col-lg-3">'
            + '<input name="productItemList[' + index + '].id" class="product-line-id" style="display: none;" value="' + productItem.id + '" />'
            + '<input name="productItemList[' + index + '].secretCode" class="secret-code" style="display: none;" value="' + secretCode + '" />'
            + '<input name="productItemList[' + index + '].type" class="type" style="display: none;" value="EXTERNAL" />'
            + '<div class="form-group row">'
            + '<label class="col-md-5 col-form-label">' + 'Item No' + '</label>'
            + '<div class="col-md-7">'
            + '<input class="form-control item-number" value="' + '' + itemCount + '" readonly="true"/>'
            + '</div>'
            + '</div>'
            + self.getDescriptionHtml(index, productItem.product)
            + '</div>'
            + '<div class="col-lg-3">'
            + '<div class="form-group row">'
            + '<label class="col-md-5 col-form-label">' + 'Category' + '</label>'
            + '<div class="col-md-7">'
            + self.getLineItemCategorySelectBoxHtml(index, productItem.category)
            + '</div>'
            + '</div>'
            + '<div class="form-group row">'
            + '<label class="col-md-5 col-form-label">' + 'Quantity' + '</label>'
            + '<div class="col-md-7">'
            + '<input name="productItemList[' + index + '].quantity" value="' + productItem.quantity + '" class="form-control quantity" placeholder="Quantity" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row">'
            + '<label class="col-md-5 col-form-label">' + 'Amount' + '</label>'
            + '<div class="col-md-7">'
            + '<input name="productItemList[' + index + '].amount" value="' + productItem.amount + '" class="form-control amount" placeholder="Amount" readonly="true"/>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-3">'
            + '<div class="form-group row">'
            + '<label class="col-md-5 col-form-label">' + 'Item' + '</label>'
            + '<div class="col-md-7 productDiv">'
            + self.getProductSelectBoxHtml(index, productItem.product, productItem.category)
            + '</div>'
            + '</div>'
            + '<div class="form-group row">'
            + '<label class="col-md-5 col-form-label">' + 'CRD' + '</label>'
            + '<div class="col-md-7">'
            + '<input name="productItemList[' + index + '].crd" value="' + productItem.crd + '" class="form-control datetimepicker crd" placeholder="CRD" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row">'
            + '<label class="col-md-5 col-form-label">' + 'Unit Price' + '</label>'
            + '<div class="col-md-7">'
            + '<input name="productItemList[' + index + '].cost" value="' + productItem.cost + '" class="form-control cost" placeholder="Cost" />'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-3">'
            + '<div class="form-group row">'
            + '<label class="col-md-5 col-form-label">' + 'Sales Taxes' + '</label>'
            + '<div class="col-md-7">'
            + '<input name="productItemList[' + index + '].salesTaxes" value="' + productItem.salesTaxes + '" class="form-control sales-taxes" placeholder="Sales Taxes" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row">'
            + '<label class="col-md-5 col-form-label">' + 'Discount (%)' + '</label>'
            + '<div class="col-md-7">'
            + '<input name="productItemList[' + index + '].discount" value="' + productItem.discount + '" class="form-control discount" placeholder="Discount" />'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-12 tableDiv">'
            + self.getInternalTableHtml(false, index, productItem.internalItemList, secretCode)
            + '</div>'
            + '<div class="col-lg-12 form-group row">'
            + '<div class="col-md-12 itemAddRemoveButtonDiv pt-2" style="text-align:right">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.productLineItemDiv.append($rowToAppend);
        $('.crd').datetimepicker({
            format: Forecast.APP.GLOBAL_DATE_FORMAT_US
        });
        self.el.productLineItemDiv.find('div.product-dynamic-row:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.removeButton);
    },
    addRowInInternalTable: function (isAddRow, selectedElement){
        var self = this;
        var rowIndex = self.el.productLineItemDiv.find('div.product-dynamic-row').length + self.el.productLineItemDiv.find('tr.internalTableRow').length;
        var secretCode = $(selectedElement).attr('attr-secretCode');
        var category = $(selectedElement).find('select.category').val();
        var product = $(selectedElement).find('select.product').val();
        var amount = $(selectedElement).find('input.amount').val();
        var discount = $(selectedElement).find('input.discount').val();
        var cost = $(selectedElement).find('input.cost').val();
        var item = {
            id: '',
            cost: cost,
            amount: amount,
            discount: discount,
            product: product,
            costCenterNumber: '',
            glAccountNumber: '',
            category: category,
            quantity: 0,
        }
        if(isAddRow){
            $(selectedElement).find('div.tableDiv table tbody').append(self.getInternalTableRowHtml(true, rowIndex, item, secretCode));
        }else{
            $(selectedElement).find('div.tableDiv table tbody').html(self.getInternalTableRowHtml(true, rowIndex, item, secretCode));
        }
        self.reRenderAllSelectPicker();
        $(selectedElement).find('div.tableDiv table tbody tr:last').prev().find('td.actionColumn').html(self.el.rowRemoveButton);
        self.addPlusIconForTheLastTableRowItem(selectedElement);
    },
    getInternalTableRowHtml: function(isPlusIcon, index, internalItem, secretCode){
        var self = this;
        var html = '<tr class="internalTableRow">';
        html += '<td>';
        html += '<input name="productItemList[' + index + '].id" class="internal-line-id" style="display: none;" value="' + internalItem.id + '" />';
        html += '<input name="productItemList[' + index + '].secretCode" class="internal-secret-code" style="display: none;" value="' + secretCode + '" />';
        html += '<input name="productItemList[' + index + '].type" class="internal-type" style="display: none;" value="INTERNAL" />';
        html += '<input name="productItemList[' + index + '].category" class="internal-category" style="display: none;" value="' + internalItem.category + '" />';
        html += '<input name="productItemList[' + index + '].product.id" class="internal-product" style="display: none;" value="' + internalItem.product + '" />';
        html += '<input name="productItemList[' + index + '].cost" class="internal-cost" style="display: none;" value="' + internalItem.cost + '" />';
        html += '<input name="productItemList[' + index + '].quantity" class="form-control internal-quantity" value="' + internalItem.quantity + '" />';
        html += '</td>';
        html += '<td class="text-center" style="vertical-align: middle">';
        html += '<input name="productItemList[' + index + '].amount" class="internal-amount" style="display: none;" value="' + internalItem.amount + '" />';
        html += '<input name="productItemList[' + index + '].discount" class="internal-discount" style="display: none;" value="' + internalItem.discount + '" />';
        html += '<span class="amountSpan">'+internalItem.amount+'</span>';
        html += '</td>';
        html += '<td>';
        html += self.getCostCentreSelectBoxHtml(index, internalItem.costCenterNumber);
        html += '</td>';
        html += '<td>';
        html += self.getGLAccountSelectBoxHtml(index, internalItem.glAccountNumber);
        html += '</td>';
        html += '<td class="actionColumn">';
        if (isPlusIcon) {
            html += self.el.rowAddButton;
        } else {
            html += self.el.rowRemoveButton;
        }
        html += '</td>';
        html += '</tr>';

        return html;

    },
    getInternalTableHtml: function(isPlusIcon, currentIndex, internalItemList, secretCode) {
        var self = this;
        var index = currentIndex;
        var html = '<table class="table table-bordered table-striped">';
        html += '<thead>';
        html += '<tr>';
        html += '<th class="text-center">Quantity</th>';
        html += '<th class="text-center">Amount</th>';
        html += '<th class="text-center">Cost Center</th>';
        html += '<th class="text-center">GL Account</th>';
        html += '<th class="text-center">Action</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        $.each(internalItemList, function (idx, item) {
            index += 1;
            html += self.getInternalTableRowHtml(isPlusIcon, index, item, secretCode);
        });
        html += '</tbody>';
        html += '</table>';

        return html;
    },
    addPlusIconForTheLastItem: function () {
        var self = this;
        if(self.el.productLineItemDiv.children().length == 1){
            self.el.productLineItemDiv.find('div.product-dynamic-row:last').find('div.itemAddRemoveButtonDiv').html(self.el.addButton);
        }
        else{
            self.el.productLineItemDiv.find('div.product-dynamic-row:last').find('div.itemAddRemoveButtonDiv').html(self.el.removeButton + self.el.addButton);
        }
    },
    addPlusIconForTheLastTableRowItem: function (selectedElement) {
        var self = this;
        if($(selectedElement).find('div.tableDiv table tbody tr').length == 1){
            $(selectedElement).find('div.tableDiv table tbody tr:last').find('td.actionColumn').html(self.el.rowAddButton);
        }
        else{
            $(selectedElement).find('div.tableDiv table tbody tr:last').find('td.actionColumn').html(self.el.rowRemoveButton + self.el.rowAddButton);
        }
    },
    updateTotalCost: function () {
        var self = this;
        var totalCost = 0;

        self.el.productLineItemDiv.find('input.amount').each(function () {
            totalCost += +$(this).val();
        });
        self.el.totalCost.val(totalCost);
    },
    updateTotalQuantity: function () {
        var self = this;
        var totalQty = 0;

        self.el.productLineItemDiv.find('div.product-dynamic-row').each(function () {
            totalQty += +$(this).find('input.quantity').val();
        });
        self.el.totalQuantity.val(totalQty);
    },
    updateAmount: function(parent){
        var cost = +$(parent).find("input.cost").val();
        var quantity = +$(parent).find("input.quantity").val();
        var discount = $(parent).find("input.discount").val() != '' ? parseFloat($(parent).find("input.discount").val()) : 0;
        var totalAmount = cost * quantity;
        var discountValue = (totalAmount) * (discount / 100);
        var amount = (totalAmount - discountValue).toFixed(2);

        $(parent).find("input.amount").val(amount).trigger('keyup');
    },
    updateInternalAmount: function(parentRow){
        var cost = +$(parentRow).find("input.internal-cost").val();
        var quantity = +$(parentRow).find("input.internal-quantity").val();
        var discount = $(parentRow).find("input.internal-discount").val() != '' ? parseFloat($(parentRow).find("input.internal-discount").val()) : 0;
        var totalAmount = cost * quantity;
        var discountValue = (totalAmount) * (discount / 100);
        var amount = (totalAmount - discountValue).toFixed(2);

        $(parentRow).find("input.internal-amount").val(amount);
        $(parentRow).find("span.amountSpan").html(amount);
    },
    updateInternalQuantity: function (selectedElement, updatedQuantity){
        $(selectedElement).find('input.internal-quantity').each(function (){
            $(this).val(updatedQuantity).trigger('keyup');
        });
    },
    updateInternalDiscount: function (selectedElement, updatedDiscount){
        $(selectedElement).find('input.internal-discount').each(function (){
            $(this).val(updatedDiscount).trigger('keyup');
        });
    },
    updateInternalCost: function (selectedElement, updatedCost){
        $(selectedElement).find('input.internal-cost').each(function (){
            $(this).val(updatedCost).trigger('keyup');
        });
    },
    updateInternalProduct: function (selectedElement, updatedProduct){
        $(selectedElement).find('input.internal-product').each(function (){
            $(this).val(updatedProduct);
        });
    },
    reRenderAllSelectPicker: function(){
        $('.selectpicker').selectpicker('render');
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.bumpPoForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.bumpPoForm.find('select').attr("disabled", true);
        self.el.bumpPoForm.find('textarea').attr("disabled", true);
        self.el.bumpPoForm.find('#shipViaAdd').hide();
        self.el.bumpPoForm.find('.itemAddButtonFlat').hide();
        self.el.bumpPoForm.find('.itemRemoveButtonFlat').hide();
        self.el.bumpPoForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.bumpPoForm.attr("href", "#");
    },
    destroy: function () {
    }
});
