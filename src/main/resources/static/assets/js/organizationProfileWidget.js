$.widget("forecast.organization", {
    options: {
        addressBookList: undefined,
        addressTypeList: undefined,
        contactBookList: undefined,
        contactTypeList: undefined,
        bankingInformationList: undefined,
        messages: undefined, // All static messages came from message_x.properties, will be passed here through this properties
        viewOnly: undefined,
        addressItem: {
            id: '',
            addressName: '',
            email: '',
            address: '',
            phoneNumber: '',
            faxNumber: '',
            active: '',
            isSameHqAddress: '',
            addressType: '',
            organizationId:0
        },
        contactItem: {
            id: '',
            personName: '',
            email: '',
            address: '',
            phoneNumber: '',
            faxNumber: '',
            active: '',
            contactType: '',
            organizationId: 0
        },
        bankingItem: {
            id: '',
            bankName: '',
            city: '',
            country: '',
            branch: '',
            accountName: '',
            swiftCode: '',
            routingNumber: '',
            creditCardNumber: '',
            cardHolderName: '',
            legalEntity: '',
            expirationDate: '',
            code: '',
            formattedAddress: '',
            organizationId: 0
        },
        tabHeaderValueMap: {
            'basic-information-tab': 'Basic Information',
            'address-information-tab': 'Address Information',
            'contact-information-tab': 'Contact Information',
            'banking-information-tab': 'Banking Information'
        }
    },
    _create: function () {
        console.log("SMNLOG :: ---------- organization profile widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {}; // this object is to keep all ui element.
        self.data = {}; // this object is to keep all local data.
        self.data.tabWiseErrorCountMap = {};

        console.log("SMNLOG options::" + JSON.stringify(self.options));

        if (self.options.addressBookList != 'undefined') {
            self.options.addressBookListSize = self.options.addressBookList.length;
        }

        if (self.options.contactBookList != 'undefined') {
            self.options.contactBookListSize = self.options.contactBookList.length;
        }

        if (self.options.bankingInformationList != 'undefined') {
            self.options.bankingInformationListSize = self.options.bankingInformationList.length;
        }

        // UI element Initialization
        self.el.organizationForm = $("#organization_form");
        self.el.addressBookDynamicRowDiv = $("#addressBookDynamicRowDiv");
        self.el.contactBookDynamicRowDiv = $("#contactBookDynamicRowDiv");
        self.el.bankingInformationDynamicRowDiv = $("#bankingInformationDynamicRowDiv");
        self.el.errorMessageBox = $("#errorMessageBox");
        self.el.organizationAddress = $("#address");

        self.el.submitButton = $("#submitButton");
        self.el.tabNextButton = $(".next-button");
        self.el.gobackButton = '<a href="/admin/organizationList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addressAddButton = '<button type="button" class="btn btn-primary contactItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.addressRemoveButton = '<button type="button" class="btn btn-danger contactItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';
        self.el.contactAddButton = '<button type="button" class="btn btn-primary addressItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.contactRemoveButton = '<button type="button" class="btn btn-danger addressItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';
        self.el.bankingAddButton = '<button type="button" class="btn btn-primary bankingItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.bankingRemoveButton = '<button type="button" class="btn btn-danger bankingItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';

    },
    _init: function () {
        console.log("SMNLOG :: ---------- organization profile widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.bankingInformationListSize > 0) { // if update
            $.each(self.options.bankingInformationList, function (index, bankingItem) {
                if(bankingItem.expirationDate != null){
                    bankingItem["expirationDate"] = Forecast.APP.convertDate(bankingItem.expirationDate.time);
                }
                self.addLineItemForBankingInformation(true, bankingItem);
            });

            self.addPlusIconForTheLastBankingItem();
        } else {
            self.addLineItemForBankingInformation(true, self.options.bankingItem);
            self.addPlusIconForTheLastBankingItem();
        }

        if (self.options.addressBookListSize > 0) { // if update
            $.each(self.options.addressBookList, function (index, addressItem) {
                self.addLineItemForAddressBook(true, addressItem);
            });

            self.addPlusIconForTheLastContactItem();
        } else {
            self.addLineItemForAddressBook(true, self.options.addressItem);

            self.addPlusIconForTheLastContactItem();
        }

        if (self.options.contactBookListSize > 0) { // if update
            $.each(self.options.contactBookList, function (index, contactItem) {
                self.addLineItemForContactBook(true, contactItem);
            });
            self.addPlusIconForTheLastAddressItem();
        } else {
            self.addLineItemForContactBook(true, self.options.contactItem);

            self.addPlusIconForTheLastAddressItem();
        }
        self.uiEventInitialization();
        if (self.options.viewOnly == true) {
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
                    maxlength: 50
                },
                hasPriority: {
                    required: false
                },
                isCustomer: {
                    required: false
                },
                isSupplier: {
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
                'user.id': {
                    required: true
                },
                'organization.id': {
                    required: true
                }
            },
            messages: {},
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            },
            showErrors: function (errorMap, errorList) {
                self.el.errorMessageBox.html("Your form contains "
                    + this.numberOfInvalids()
                    + " errors, see details below.");
                this.defaultShowErrors();
                self.el.errorMessageBox.show();

                if (this.numberOfInvalids() == 0) {
                    self.el.errorMessageBox.hide();
                }
                self.showErrorCountInTabHeader();
            }
        };
        self.el.organizationForm.validate(validateJson);

        // Add dynamic validation for newly added line items
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("addressType", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("addressName", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("addressPhone", {required: true, number: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("addressEmail", {required: true, email: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("addressFax", {required: false, number: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("addressAddress", {required: true});

/*      Forecast.APP.addDynamicFieldValidationByClassNameSelector("contactType", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("contactName", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("contactPhone", {required: true, number: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("contactEmail", {required: true, email: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("contactFax", {required: false, number: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("contactAddress", {required: true});*/

    },
    uiEventInitialization: function () {
        var self = this;

        $(document).on('click', 'button.bankingItemAddButton', function () {
            self.addLineItemForBankingInformation(true, self.options.bankingItem);

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastBankingItem();
        });

        Forecast.APP.addAsteriskByRequiredFieldLabel($(document));

        $(document).on('click', 'button.bankingItemRemoveButton', function () {
            $(this).parent().parent().parent().parent().remove();

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastBankingItem();

            // RE-INDEX the list items, user can remove an item from middle of the list, reindex will sync the index from 0-n.
            self.reIndexBankingInformationItems();
        });


        $(document).on('click', 'button.contactItemAddButton', function () {
            self.addLineItemForAddressBook(true, self.options.addressItem);

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastContactItem();
        });

        $(document).on('click', 'button.contactItemRemoveButton', function () {
            $(this).parent().parent().parent().parent().remove();

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastContactItem();

            // RE-INDEX the list items, user can remove an item from middle of the list, reindex will sync the index from 0-n.
            self.reIndexAddressBookItems();
        });

        $(document).on('click', 'button.addressItemAddButton', function () {
            self.addLineItemForContactBook(true, self.options.contactItem);

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastAddressItem();
        });

        $(document).on('click', 'button.addressItemRemoveButton', function () {
            $(this).parent().parent().parent().parent().remove();

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastAddressItem();

            // RE-INDEX the list items, user can remove an item from middle of the list, reindex will sync the index from 0-n.
            self.reIndexContactBookItems();
        });

        self.el.submitButton.on("click", function () {
            self.el.organizationForm.trigger("submit");
        });

        self.el.tabNextButton.on('click', function () {
            $('.nav-link.active').parent().next().find('a').tab('show');
        });

        self.el.addressBookDynamicRowDiv.on("change", "input.isSameHqAddress", function () {
            var $addressDivRow = $(this).closest("div.contact-dynamic-row").find('.addressAddress');
            var isChecked = $(this).is(":checked");
            if(isChecked){
                    $addressDivRow.val(self.el.organizationAddress.val());
                    $addressDivRow.attr('readonly', true);
            } else {
                    $addressDivRow.val("");
                    $addressDivRow.attr('readonly', false);
            }
          //  console.log(isChecked);
            //$(this).closest("div.contact-dynamic-row").find('.isSameHqAddress').val(isChecked);
           // console.log( $(this).closest("div.contact-dynamic-row").find('.isSameHqAddress').val());
        });

    },
    reIndexAddressBookItems: function () {
        var self = this;
        var index = 0;
        var name = '';

        self.el.addressBookDynamicRowDiv.find('div.contact-dynamic-row').each(function () {
            name = 'organizationAddressBookList[' + index + ']';
            $(this).find('div').find('input.organizationId').attr("name", name + ".organization.id");
            $(this).find('div').find('input.addressId').attr("name", name + ".id");
            $(this).find('div').find('select.addressType').attr("name", name + ".addressBookType.id");
            $(this).find('div').find('input.addressName').attr("name", name + ".name");
            $(this).find('div').find('input.addressEmail').attr("name", name + ".email");
            $(this).find('div').find('textarea.addressAddress').attr("name", name + ".address");
            $(this).find('div').find('input.addressPhone').attr("name", name + ".phoneNumber");
            $(this).find('div').find('input.addressFax').attr("name", name + ".faxNumber");
            $(this).find('div').find('input.active').attr("name", name + ".active");
            $(this).find('div').find('input.isSameHqAddress').attr("name", name + ".isSameHqAddress");

            index++;
        });
    },
    reIndexContactBookItems: function () {
        var self = this;
        var index = 0;
        var name = '';

        self.el.contactBookDynamicRowDiv.find('div.address-dynamic-row').each(function () {
            name = 'organizationContactBookList[' + index + ']';
            $(this).find('div').find('input.organizationId').attr("name", name + ".organization.id");
            $(this).find('div').find('input.contactId').attr("name", name + ".id");
            $(this).find('div').find('input.personName').attr("name", name + ".personName");
            $(this).find('div').find('select.contactType').attr("name", name + ".contactBookType.id");
            $(this).find('div').find('input.contactEmail').attr("name", name + ".email");
            $(this).find('div').find('textarea.contactAddress').attr("name", name + ".address");
            $(this).find('div').find('input.contactPhone').attr("name", name + ".phoneNumber");
            $(this).find('div').find('input.contactFax').attr("name", name + ".faxNumber");
            $(this).find('div').find('input.active').attr("name", name + ".active");

            index++;
        });
    },
    reIndexBankingInformationItems: function () {
        var self = this;
        var index = 0;
        var name = '';

        self.el.addressBookDynamicRowDiv.find('div.banking-dynamic-row').each(function () {
            name = 'organizationBankingInformationList[' + index + ']';
            $(this).find('div').find('input.organizationId').attr("name", name + ".organization.id");
            $(this).find('div').find('input.bankingId').attr("name", name + ".id");
            $(this).find('div').find('input.bankName').attr("name", name + ".bankName");
            $(this).find('div').find('input.city').attr("name", name + ".city");
            $(this).find('div').find('textarea.formattedAddress').attr("name", name + ".formattedAddress");
            $(this).find('div').find('input.country').attr("name", name + ".country");
            $(this).find('div').find('input.branch').attr("name", name + ".branch");
            $(this).find('div').find('input.accountName').attr("name", name + ".accountName");
            $(this).find('div').find('input.swiftCode').attr("name", name + ".swiftCode");
            $(this).find('div').find('input.routingNumber').attr("name", name + ".routingNumber");
            $(this).find('div').find('input.creditCardNumber').attr("name", name + ".creditCardNumber");
            $(this).find('div').find('input.cardHolderName').attr("name", name + ".cardHolderName");
            $(this).find('div').find('input.legalEntity').attr("name", name + ".legalEntity");
            $(this).find('div').find('input.expirationDate').attr("name", name + ".expirationDate");
            $(this).find('div').find('input.code').attr("name", name + ".code");

            index++;
        });
    },
    addLineItemForAddressBook: function (isPlusIcon, addressItem) {
        var self = this;
        //dynamic row creation
        var index = self.el.addressBookDynamicRowDiv.find('div.contact-dynamic-row').length;
        console.log("SMNLOG addressItem::"+JSON.stringify(addressItem));
        var $rowToAppend = '<div class="row contact-dynamic-row lineItemBorder">'
            + '<div class="col-lg-6 px-5">'
            + '<div class="form-group row ">'
            + '<input type="text" name="organizationAddressBookList[' + index + '].organization.id" class="organizationId" style="display: none;" value="' + addressItem.organizationId + '" />'
            //+ '<input type="text" name="organizationAddressBookList[' + index + '].organization.isSameHqAddress" class="isSameHqAddress" style="display: none;" value="' + addressItem.isSameHqAddress + '" />'
            + '<input type="text" name="organizationAddressBookList[' + index + '].id" class="addressId" style="display: none;" value="' + addressItem.id + '" />'
            + '<label htmlFor="addressName" class="col-md-3 col-form-label">' + self.options.messages.addressType + '</label>'
            + '<div class="col-md-9">'
            + self.getAddressOrContactTypeSelectBox(self.options.addressTypeList, addressItem.addressType, 'organizationAddressBookList[' + index + '].addressBookType.id', 'addressType')
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<input type="text" name="organizationAddressBookList[' + index + '].id" class="addressId" style="display: none;" value="' + addressItem.id + '"/>'
            + '<label htmlFor="addressName" class="col-md-3 col-form-label">' + self.options.messages.addressName + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationAddressBookList[' + index + '].name" class="form-control addressName" placeholder="Name" value="' + addressItem.addressName + '"  />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="addressEmail" class="col-md-3 col-form-label">' + self.options.messages.email + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationAddressBookList[' + index + '].email" class="form-control addressEmail" placeholder="Email" value="' + addressItem.email + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="addressPhone" class="col-md-3 col-form-label">' + self.options.messages.phone + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationAddressBookList[' + index + '].phoneNumber" class="form-control addressPhone" placeholder="Phone" value="' + addressItem.phoneNumber + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="addressFax" class="col-md-3 col-form-label">' + self.options.messages.fax + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationAddressBookList[' + index + '].faxNumber" class="form-control addressFax"  placeholder="Fax Number" value="' + addressItem.faxNumber + '" />'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-6 px-5">'
            + '<div class="form-group row ">'
            + '<label htmlFor="addressAddress" class="col-md-3 col-form-label">' + self.options.messages.address + '</label>'
            + '<div class="col-md-9">'
            + '<textarea class="form-control addressAddress" name="organizationAddressBookList[' + index + '].address" rows="3" placeholder="Contact Address">' + addressItem.address + '</textarea>'
            + '<br>'
            + '<label class="checkbox-hqAddress">'
            + '<input type="checkbox" name="organizationAddressBookList[' + index + '].isSameHqAddress" class="isSameHqAddress" '+ (addressItem.isSameHqAddress ? 'checked':'') +'/> '+ self.options.messages.hqAddress + '</label>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="active" class="col-md-3 col-form-label">' + self.options.messages.isActive + '</label>'
            + '<div class="col-md-9">'
            + '<input type="checkbox" class="active" name="organizationAddressBookList[' + index + '].active" style="margin-top: 8px" '+ (addressItem.active ? 'checked':'') +'/>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row">'
            + '<div class="col-md-12 contactItemAddRemoveButtonDiv" style="text-align:right">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addressAddButton;
        } else {
            $rowToAppend += self.el.addressRemoveButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.addressBookDynamicRowDiv.append($rowToAppend);
        self.el.addressBookDynamicRowDiv.find('div.contact-dynamic-row:last').prev().find('div.contactItemAddRemoveButtonDiv').html(self.el.addressRemoveButton);
    },
    addPlusIconForTheLastContactItem: function () {
        var self = this;
        if (self.el.addressBookDynamicRowDiv.children().length == 1) {
            self.el.addressBookDynamicRowDiv.find('div.contact-dynamic-row:last').find('div.contactItemAddRemoveButtonDiv').html(self.el.addressAddButton);
        }
        else {
            self.el.addressBookDynamicRowDiv.find('div.contact-dynamic-row:last').find('div.contactItemAddRemoveButtonDiv').html(self.el.addressRemoveButton + self.el.addressAddButton);
        }
    },
    addPlusIconForTheLastBankingItem: function () {
        var self = this;
        if (self.el.bankingInformationDynamicRowDiv.children().length == 1) {
            self.el.bankingInformationDynamicRowDiv.find('div.banking-dynamic-row:last').find('div.bankingItemAddRemoveButtonDiv').html(self.el.bankingAddButton);
        }
        else {
            self.el.bankingInformationDynamicRowDiv.find('div.banking-dynamic-row:last').find('div.bankingItemAddRemoveButtonDiv').html(self.el.bankingRemoveButton + self.el.bankingAddButton);
        }
    },
    addLineItemForBankingInformation: function (isPlusIcon, bankingItem) {
        var self = this;
        //dynamic row creation
        var index = self.el.bankingInformationDynamicRowDiv.find('div.banking-dynamic-row').length;

        var $rowToAppend = '<div class="row banking-dynamic-row lineItemBorder">'
            + '<div class="col-lg-6 px-5">'
            + '<input type="text" name="organizationBankingInformationList[' + index + '].organization.id" class="organizationId" style="display: none;" value="' + bankingItem.organizationId + '" />'
            + '<input type="text" name="organizationBankingInformationList[' + index + '].id" class="bankingId" style="display: none;" value="' + bankingItem.id + '" />'
            + '<div class="form-group row ">'
            + '<label htmlFor="bankName" class="col-md-3 col-form-label">' + self.options.messages.bankName + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationBankingInformationList[' + index + '].bankName" class="form-control bankName" placeholder="Bank Name" value="' + bankingItem.bankName + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="city" class="col-md-3 col-form-label">' + self.options.messages.city + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationBankingInformationList[' + index + '].city" class="form-control city" placeholder="City" value="' + bankingItem.city + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="country" class="col-md-3 col-form-label">' + self.options.messages.country + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationBankingInformationList[' + index + '].country" class="form-control country" placeholder="Country" value="' + bankingItem.country + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="branch" class="col-md-3 col-form-label">' + self.options.messages.branch + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationBankingInformationList[' + index + '].branch" class="form-control branch" placeholder="Branch" value="' + bankingItem.branch + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="accountName" class="col-md-3 col-form-label">' + self.options.messages.accountName + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationBankingInformationList[' + index + '].accountName" class="form-control accountName" placeholder="Account Name" value="' +  bankingItem.accountName + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="swiftCode" class="col-md-3 col-form-label">' + self.options.messages.swiftCode + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationBankingInformationList[' + index + '].swiftCode" class="form-control swiftCode" placeholder="Swift Code" value="' + bankingItem.swiftCode + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="routingNumber" class="col-md-3 col-form-label">' + self.options.messages.routingNumber + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationBankingInformationList[' + index + '].routingNumber" class="form-control routingNumber"  placeholder="Routing Number" value="' + bankingItem.routingNumber + '" />'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-6 px-5">'
            + '<div class="form-group row ">'
            + '<label htmlFor="creditCardNumber" class="col-md-3 col-form-label">' + self.options.messages.creditCard + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationBankingInformationList[' + index + '].creditCardNumber" class="form-control creditCardNumber"  placeholder="Credit Card Number" value="' + bankingItem.creditCardNumber + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="cardHolderName" class="col-md-3 col-form-label">' + self.options.messages.cardHolderName + '</label>'
            + '<div class="col-md-9">'
             + '<input type="text" name="organizationBankingInformationList[' + index + '].cardHolderName" class="form-control cardHolderName"  placeholder="Name on card" value="' + bankingItem.cardHolderName+ '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="expirationDate" class="col-md-3 col-form-label">' + self.options.messages.expirationDate + '</label>'
            + '<div class="col-md-9">'
            + '<input name="organizationBankingInformationList[' + index + '].expirationDate" class="form-control datetimepicker expirationDate"  placeholder="Expiration Date" value="' + bankingItem.expirationDate + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="cardCode" class="col-md-3 col-form-label">' + self.options.messages.cardCode + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationBankingInformationList[' + index + '].code" class="form-control cardCode"  placeholder="Code" value="' + bankingItem.code + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="legalEntity" class="col-md-3 col-form-label">' + self.options.messages.legalEntity + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationBankingInformationList[' + index + '].legalEntity" class="form-control legalEntity"  placeholder="Legal Entity" value="' + bankingItem.legalEntity + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="formattedAddress" class="col-md-3 col-form-label">' + self.options.messages.formattedAddress + '</label>'
            + '<div class="col-md-9">'
            + '<textarea class="form-control formattedAddress" name="organizationBankingInformationList[' + index + '].formattedAddress" rows="3" placeholder="Formatted Address">' + bankingItem.formattedAddress + '</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<div class="col-md-12 bankingItemAddRemoveButtonDiv" style="text-align:right">';

        if (isPlusIcon) {
            $rowToAppend += self.el.bankingAddButton;
        } else {
            $rowToAppend += self.el.bankingRemoveButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.bankingInformationDynamicRowDiv.append($rowToAppend);
        $('.expirationDate').datetimepicker({
            format: Forecast.APP.GLOBAL_DATE_FORMAT_US
        });
        self.el.bankingInformationDynamicRowDiv.find('div.banking-dynamic-row:last').prev().find('div.bankingItemAddRemoveButtonDiv').html(self.el.bankingRemoveButton);
    },
    addLineItemForContactBook: function (isPlusIcon, contactItem) {
        var self = this;
        //dynamic row creation
        var index = self.el.contactBookDynamicRowDiv.find('div.address-dynamic-row').length;

        var $rowToAppend = '<div class="row address-dynamic-row lineItemBorder">'
            + '<div class="col-lg-6 px-5">'
            + '<div class="form-group row ">'
            + '<input type="text" name="organizationContactBookList[' + index + '].organization.id" class="organizationId" style="display: none;" value="' + contactItem.organizationId + '" />'
            + '<label htmlFor="contactName" class="col-md-3 col-form-label">' + self.options.messages.contactType + '</label>'
            + '<div class="col-md-9">'
            + self.getAddressOrContactTypeSelectBox(self.options.contactTypeList, contactItem.contactType, 'organizationContactBookList[' + index + '].contactBookType.id', 'contactType')
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<input type="text" name="organizationContactBookList[' + index + '].id" class="contactId" style="display: none;" value="' + contactItem.id + '" />'
            + '<label htmlFor="contactName" class="col-md-3 col-form-label">' + self.options.messages.name + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationContactBookList[' + index + '].personName" class="form-control personName" placeholder="Name" value="' + contactItem.personName + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="contactEmail" class="col-md-3 col-form-label">' + self.options.messages.email + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationContactBookList[' + index + '].email" class="form-control contactEmail" placeholder="Email" value="' + contactItem.email + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="contactPhone" class="col-md-3 col-form-label">' + self.options.messages.phone + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationContactBookList[' + index + '].phoneNumber" class="form-control contactPhone" placeholder="Phone" value="' + contactItem.phoneNumber + '" />'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-6 px-5">'
            + '<div class="form-group row ">'
            + '<label htmlFor="contactFax" class="col-md-3 col-form-label">' + self.options.messages.fax + '</label>'
            + '<div class="col-md-9">'
            + '<input type="text" name="organizationContactBookList[' + index + '].faxNumber" class="form-control contactFax"  placeholder="Fax Number" value="' + contactItem.faxNumber + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="contactAddress" class="col-md-3 col-form-label">' + self.options.messages.address + '</label>'
            + '<div class="col-md-9">'
            + '<textarea class="form-control contactAddress" name="organizationContactBookList[' + index + '].address" rows="3" placeholder="Address">' + contactItem.address + '</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label htmlFor="active" class="col-md-3 col-form-label">' + self.options.messages.isActive + '</label>'
            + '<div class="col-md-9">'
            + '<input type="checkbox" class="active" name="organizationContactBookList[' + index + '].active" style="margin-top: 8px" '+ (contactItem.active? 'checked':'') +'/>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<div class="col-md-12 addressItemAddRemoveButtonDiv" style="text-align:right">';

        if (isPlusIcon) {
            $rowToAppend += self.el.contactAddButton;
        } else {
            $rowToAppend += self.el.contactRemoveButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.contactBookDynamicRowDiv.append($rowToAppend);
        self.el.contactBookDynamicRowDiv.find('div.address-dynamic-row:last').prev().find('div.addressItemAddRemoveButtonDiv').html(self.el.contactRemoveButton);
    },
    getAddressOrContactTypeSelectBox: function (list, selectedItem, name, cls) {
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
    getSelectBox: function (list, selectedItem, name, cls) {
        var self = this;
        var html = '<select name="'+name+'" class="form-control '+cls+'">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(list, function (index, item) {
            if (selectedItem == item) {
                html += '<option value="' + item + '" selected>' + item + '</option>';
            } else {
                html += '<option value="' + item + '">' + item + '</option>';
            }
        });
        html +='</select>';
        return html;
    },
    addPlusIconForTheLastAddressItem: function () {
        var self = this;
        if (self.el.contactBookDynamicRowDiv.children().length == 1) {
            self.el.contactBookDynamicRowDiv.find('div.address-dynamic-row:last').find('div.addressItemAddRemoveButtonDiv').html(self.el.contactAddButton);
        }
        else {
            self.el.contactBookDynamicRowDiv.find('div.address-dynamic-row:last').find('div.addressItemAddRemoveButtonDiv').html(self.el.contactRemoveButton + self.el.contactAddButton);
        }
    },
    disableForViewOnly: function () {
        var self = this;

        self.el.organizationForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.organizationForm.find('select').attr("disabled", true);
        self.el.organizationForm.find('textarea').attr("disabled", true);
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.organizationForm.find('a[type="button"]').hide();
        self.el.organizationForm.find('button[type="button"]').not(".next-button").hide();
        self.el.organizationForm.attr("href", "#");
    },
    showErrorCountInTabHeader: function (errorMap, errorList) {
        var self = this;
        self.data.tabWiseErrorCountMap = {};
        self.el.organizationForm.find("div.tab-content").find('.tab-pane').find(".error:not(label)").each(function () {
            var parentTabId = $(this).closest("div.tab-pane").attr("id");
            if (typeof self.data.tabWiseErrorCountMap[parentTabId] != 'undefined') {
                self.data.tabWiseErrorCountMap[parentTabId]++;
            } else {
                self.data.tabWiseErrorCountMap[parentTabId] = 1;
            }

        });
        self.keepDefaultValueForTabHeader();

        $.each(self.data.tabWiseErrorCountMap, function (key, value) {
            self.el.organizationForm.find("ul.nav-tabs").find("#" + key + "-tab").html(self.options.tabHeaderValueMap[key + '-tab'] + "&nbsp;<font style='color: #dd0000;'>(" + value + ")</font>")
        });
    },
    keepDefaultValueForTabHeader: function () {
        var self = this;
        $.each(self.options.tabHeaderValueMap, function (key, value) {
            self.el.organizationForm.find("ul.nav-tabs").find("#" + key).html(self.options.tabHeaderValueMap[key]);
        });
    },
    destroy: function () {
    }
});