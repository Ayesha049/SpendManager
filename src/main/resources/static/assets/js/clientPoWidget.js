/**
 * Created by habib on 14/04/20.
 */
$.widget("forecast.clientPo", {
    options: {
        selectedCustomer: undefined,
        customerList: undefined,
        chipsetList: undefined,
        chipsetItemList: undefined,
        messages: undefined, // All static messages came from message_x.properties, will be passed here through this properties
        viewOnly :undefined,
        chipsetItem: {
            id: '',
            nominal: '',
            upside: '',
            cost: '',
            chipsetNumber: ''
        }
    },
    _create: function () {
        console.log("SMNLOG :: ---------- clientPo widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {}; // this object is to keep all ui element.
        self.data = {}; // this object is to keep all local data.
        self.data.customerMap = {};

        if (self.options.chipsetItemList != 'undefined') {
            self.options.chipsetItemListSize = self.options.chipsetItemList.length;
        }

        if (self.options.customerList != 'undefined') {
            $.each(self.options.customerList, function(index, customer){
                if (self.data.customerMap[customer.id] == undefined){
                    self.data.customerMap[customer.id]={
                        customerId: customer.id,
                        customerName: customer.name,
                        email: customer.email,
                        phone: customer.phone,
                        fax: customer.fax,
                        billingAddressArray:[customer.billingAddress],
                        shippingAddressArray:[customer.shippingAddress]
                    }
                }
                else{
                    if (!self.data.customerMap[customer.id].billingAddressArray.includes(customer.billingAddress)){self.data.customerMap[customer.id].billingAddressArray.push(customer.billingAddress);}
                    if (!self.data.customerMap[customer.id].shippingAddressArray.includes(customer.shippingAddress)){self.data.customerMap[customer.id].shippingAddressArray.push(customer.shippingAddress);}
                }
            });
        }

        console.log("Complete Customer Map ");
        console.log(self.data.customerMap);

        // UI element Initialization
        self.el.clientPoForm = $("#client_po_form");
        self.el.id = $(document).find("#id");
        self.el.dynamicRowDiv = $("#dynamicRowDiv");
        self.el.totalCost = $("#totalCost");
        self.el.totalQuantity = $("#totalQuantity");
        self.el.customSelect = $(".custom-select");
        self.el.customSelectCustomer = $("select#customerProfileSelect");
        self.el.chipsetLineItemDiv = $(".chipset-line-item-div");
        self.el.customerEmail = $("#customerEmail");
        self.el.customerPhone = $("#customerPhone");
        self.el.customerFaxNumber = $("#customerFaxNumber");
        self.el.customerShippingAddress = $("#customerShippingAddress");
        self.el.customerBillingAddress = $("#customerBillingAddress");
        self.el.searchBoxReviewer = $('#searchReviewer');
        self.el.submitButton = $("#submitButton");

        self.el.gobackButton = '<a href="/admin/clientPOList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<a type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.removeButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';

    },
    _init: function () {
        console.log("SMNLOG :: ---------- clientPo widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.chipsetItemListSize > 0) { // if update
            $.each(self.options.chipsetItemList, function (index, chipsetItem) {
                self.addLineItemForChipset(true, chipsetItem);
            });
            self.addPlusIconForTheLastItem();
        } else { // By default one row
            self.addLineItemForChipset(true, self.options.chipsetItem);

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastItem();
        }

        console.log("selected customer id:::"+ self.options.selectedCustomer);

        self.generateCustomerSelectBoxHtml(self.options.selectedCustomer);
        self.generateCustomerShippingAddressSelectBoxHtml(self.options.selectedCustomer);
        self.generateCustomerBillingAddressSelectBoxHtml(self.options.selectedCustomer);

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
                PONumber: {
                    required: true,
                    maxlength: 25,
                    isClientPOUnique: true
                },
                type: {
                    required: true
                },
                movandiRepresentative: {
                    required: true
                },
                supplierCode: {
                    required: true,
                    maxlength: 32
                },
                orderDate: {
                    required: true
                },
                'customer.id': {
                    required: true
                },
                'preparedBy.username': {
                    required: true
                },
                totalQuantity: {
                    required: true,
                    number: true
                },
                totalCost: {
                    required: true,
                    number: true
                }
            },
            messages: {
            },
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };
        $.validator.addMethod("isClientPOUnique", function (value, element) {
            errorMsg = '', $valid = false;

            var clientPONumber = $(element).val();
            var clientPOId = self.el.id.val();

            $.ajax({
                type: "GET",
                url: "/clientPO/check?clientPONumber="+clientPONumber+"&clientPOId="+clientPOId,
                success: function (response) {
                    if(response == true) {
                        $valid = true;
                    }
                    else{
                        $valid = false;
                        errorMsg = "There's already an existing client po associated with this po number.";
                    }
                },
                async: false
            });
            $.validator.messages["isClientPOUnique"] = errorMsg;
            return $valid;
        }, '');

        self.el.clientPoForm.validate(validateJson);

        // Add dynamic validation for newly added line items
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("chip-set", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("chip-set-nominal-count", {required: true, number:true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("chip-set-upside-count", {required: true, number:true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("chip-set-cost", {required: true, number:true});
    },
    uiEventInitialization: function () {
        var self = this;
        $(document).on('click', 'a.itemAddButton', function () {
            self.addLineItemForChipset(true, self.options.chipsetItem);

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'a.itemRemoveButton', function () {
            $(this).parent().parent().remove();

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastItem();

            // RE-INDEX the list items, user can remove an item from middle of the list, reindex will sync the index from 0-n.
            self.reIndexChipsetItems();

            //Updating total cost and total quantity on remove of chipset line item
            self.updateTotalCost();
            self.updateTotalQuantity();
        });

        $(document).on('keyup', '.chip-set-cost', function () {
            self.updateTotalCost();
        });

        $(document).on('keyup', '.chip-set-nominal-count,.chip-set-upside-count', function () {
            self.updateTotalQuantity();
        });

        $(document).on('change', 'select#customerProfileSelect', function(){
            var customerId = +$(this).val();
            console.log("SMNLOG :: changed customer profile...."+customerId);
            self.populateCustomerFields(customerId);
        });

        $(document).on('change', 'select#customerShippingAddressSelect', function(){
            var shippingAddress = $(this).val();
            console.log("SMNLOG :: changed shipping address...."+shippingAddress);
            self.el.customerShippingAddress.val(shippingAddress);
        });

        $(document).on('change', 'select#customerBillingAddressSelect', function(){
            var billingAddress = $(this).val();
            console.log("SMNLOG :: changed billing address...."+billingAddress);
            self.el.customerBillingAddress.val(billingAddress);
        });

        $(".sortable").sortable({
            update: function(event, ui) {
                self.addRemoveButtonInAllLineItems();
                self.addPlusIconForTheLastItem();
                self.reIndexChipsetItems();
            }
        });
    },
    generateCustomerSelectBoxHtml: function(selectedCustomer){
        var self = this;
        selectedCustomer = parseInt(selectedCustomer);
        var html = '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.data.customerMap, function (index, item) {
            if (selectedCustomer == item.customerId) {
                html += '<option value="' + item.customerId + '" selected>' + item.customerName + '</option>';
            } else {
                html += '<option value="' + item.customerId + '">' + item.customerName + '</option>';
            }
        });

        self.el.customSelectCustomer.html(html);
    },
    generateCustomerShippingAddressSelectBoxHtml: function(selectedCustomer){
        var self = this;
        selectedCustomer = parseInt(selectedCustomer);
        var selectedShippingAddress = self.el.customerShippingAddress.val();
        var html = '<option value="">' + self.options.messages.selectAny + '</option>';
        if (selectedCustomer !=0){
            $.each(self.data.customerMap[selectedCustomer].shippingAddressArray, function (index, item) {
                if (selectedShippingAddress == item) {
                    html += '<option value="' + item + '" selected>' + item + '</option>';
                } else {
                    html += '<option value="' + item + '">' + item + '</option>';
                }
            });
        }
        $(document).find('select#customerShippingAddressSelect').html(html);
    },
    generateCustomerBillingAddressSelectBoxHtml: function(selectedCustomer){
        var self = this;
        selectedCustomer = parseInt(selectedCustomer);
        var selectedBillingAddress = self.el.customerBillingAddress.val();
        var html = '<option value="">' + self.options.messages.selectAny + '</option>';
        if (selectedCustomer !=0){
            $.each(self.data.customerMap[selectedCustomer].billingAddressArray, function (index, item) {
                if (selectedBillingAddress == item) {
                    html += '<option value="' + item + '" selected>' + item + '</option>';
                } else {
                    html += '<option value="' + item + '">' + item + '</option>';
                }
            });
        }
        $(document).find('select#customerBillingAddressSelect').html(html);
    },
    populateCustomerFields: function(customerId){
        var self = this;
        var selectedCustomer = self.data.customerMap[customerId];

        console.log("SMNLOG selectedCustomer::"+JSON.stringify(selectedCustomer));

        if(typeof selectedCustomer != 'undefined'){
            self.el.customerEmail.val(selectedCustomer.email || '');
            self.el.customerPhone.val(selectedCustomer.phone || '');
            self.el.customerFaxNumber.val(selectedCustomer.fax || '');
            self.el.customerShippingAddress.val('');
            self.generateCustomerShippingAddressSelectBoxHtml(customerId);
            self.el.customerBillingAddress.val('');
            self.generateCustomerBillingAddressSelectBoxHtml(customerId);
        }
        else{
            self.el.customerEmail.val('');
            self.el.customerPhone.val('');
            self.el.customerFaxNumber.val('');
            self.el.customerShippingAddress.val('');
            self.generateCustomerShippingAddressSelectBoxHtml(0);
            self.el.customerBillingAddress.val('');
            self.generateCustomerBillingAddressSelectBoxHtml(0);
        }
    },
    reIndexChipsetItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.chipsetLineItemDiv.find('div.form-group').each(function(){
            name = 'chipsetItemList[' + index + ']';
            $(this).find('div').find('input.chipsetId').attr("name", name + ".id");
            $(this).find('div').find('select.chip-set').attr("name", name + ".chipsetNumber");
            $(this).find('div').find('input.chip-set-nominal-count').attr("name", name + ".nominal");
            $(this).find('div').find('input.chip-set-upside-count').attr("name", name + ".upside");
            $(this).find('div').find('input.chip-set-cost').attr("name", name + ".cost");

            index++;
        });
    },
    getChipsetSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="chipsetItemList[' + index + '].chipsetNumber" class="custom-select chip-set" placeholder="Chip Set">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.chipsetList, function (index, item) {
            if (selectedValue == item.chipsetNumber) {
                html += '<option value="' + item.chipsetNumber + '" selected>' + item.chipsetNumber + '</option>';
            } else {
                html += '<option value="' + item.chipsetNumber + '">' + item.chipsetNumber + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    addLineItemForChipset: function (isPlusIcon, chipsetItem) {
        var self = this;
        //dynamic row creation
        var index = self.el.chipsetLineItemDiv.find('div.form-group').length;

        var $rowToAppend = '<div class="form-group row">'
            + '<div class="col-md-3">'
            + '<input type="text" name="chipsetItemList[' + index + '].id" class="chipsetId" style="display: none;" value="' + chipsetItem.id + '"/>'
            + self.getChipsetSelectBoxHtml(index, chipsetItem.chipsetNumber)
            + '</div>'
            + '<div class="col-md-3">'
            + '<input type="text" name="chipsetItemList[' + index + '].nominal" value="' + chipsetItem.nominal + '" class="form-control chip-set-nominal-count" placeholder="Count" />'
            + '</div>'
            + '<div class="col-md-3">'
            + '<input type="text" name="chipsetItemList[' + index + '].upside" value="' + chipsetItem.upside + '" class="form-control chip-set-upside-count" placeholder="Count" />'
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="chipsetItemList[' + index + '].cost" value="' + chipsetItem.cost + '" class="form-control chip-set-cost" placeholder="Cost" />'
            + '</div>'
            + '<div class="col-md-1 itemAddremoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.chipsetLineItemDiv.append($rowToAppend);
        self.el.chipsetLineItemDiv.find('div.form-group:last').prev().find('div.itemAddremoveButtonDiv').html(self.el.removeButton);
    },
    addPlusIconForTheLastItem: function () {
        var self = this;
        if(self.el.chipsetLineItemDiv.children().length == 1){
            self.el.chipsetLineItemDiv.find('div.form-group:last').find('div.itemAddremoveButtonDiv').html(self.el.addButton);
        }
        else{
            self.el.chipsetLineItemDiv.find('div.form-group:last').find('div.itemAddremoveButtonDiv').html(self.el.removeButton + self.el.addButton);
        }
    },
    addRemoveButtonInAllLineItems: function(){
        var self = this;
        self.el.chipsetLineItemDiv.find('div.form-group').each(function(){
            $(this).find('div.itemAddremoveButtonDiv').html(self.el.removeButton);
        });
    },
    updateTotalCost: function () {
        var self = this;
        var totalCost = 0;

        self.el.chipsetLineItemDiv.find('input.chip-set-cost').each(function () {
            totalCost += +$(this).val();
        });
        self.el.totalCost.val(totalCost);
    },
    updateTotalQuantity: function () {
        var self = this;
        var totalQty = 0;

        self.el.chipsetLineItemDiv.find('div.form-group').each(function () {
            totalQty += +$(this).find('input.chip-set-nominal-count').val();
            totalQty += +$(this).find('input.chip-set-upside-count').val();
        });
        self.el.totalQuantity.val(totalQty);
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.clientPoForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.clientPoForm.find('select').attr("disabled", true);
        self.el.clientPoForm.find('textarea').attr("disabled", true);
        self.el.searchBoxReviewer.attr("disabled", true);
        self.el.clientPoForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.clientPoForm.attr("href", "#");
    },
    destroy: function () {
    }
});
