$.widget("forecast.bumpQuotation", {
    options: {
        quotationCategoryItemList: undefined,
        bumpQuotationLineItemList: undefined,
        messages: undefined,
        viewOnly :undefined,
        dueDate: undefined,
        quotationStatus: undefined,
        categoryItem: {
            id: '',
            categoryName: '',
            description: '',
            amount: 0,
            comments: ''
        },
        bumpQuotationItem: {
            id: '',
            engOrProd: '',
            deviceOrWafer: '',
            bumpMaskNumber: '',
            waferDiameter: '',
            bumpType: '',
            layers: '',
            pi: '',
            bumpedDiePerWafer: 0,
            price: 0,
            specialAdders: '',
            remark: '',
            comments: ''
        }
    },
    _create: function () {
        console.log("SMNLOG :: ---------- bump quotation widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};

        // UI element Initialization
        self.el.quotationForm = $("#quotation_form");
        self.el.categoryLineItemDiv = $('#categoryDynamicRowDiv');
        self.el.bumpQuotationLineItemDiv = $('#secondDynamicRowDiv');
        self.el.submitButton = $("#submitButton");
        self.el.saveButton = $("#saveButton");
        self.el.statusSubmitted = $("#statusSubmitted");
        self.el.submissionCount = $("#submissionCount");
        self.el.lateSubmitDay = $("#lateSubmitDay");
        self.el.tabNextButton = $(".next-button");

        $("#mobile_btn_top").trigger('click');

        if (self.options.quotationCategoryItemList != 'undefined') {
            self.options.quotationCategoryItemListSize = self.options.quotationCategoryItemList.length;
        }

        if (self.options.bumpQuotationLineItemList != 'undefined') {
            self.options.bumpQuotationLineItemListSize = self.options.bumpQuotationLineItemList.length;
        }

        self.el.gobackButton = '<a href="/admin/rfqDashboard" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.categoryLineItemAddButton = '<button type="button" class="btn btn-primary categoryItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.categoryLineItemRemoveButton = '<button type="button" class="btn btn-danger categoryItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';
        self.el.bumpLineItemAddButton = '<button type="button" class="btn btn-primary bumpItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.bumpLineItemRemoveButton = '<button type="button" class="btn btn-danger bumpItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';

    },
    _init: function () {
        console.log("SMNLOG :: ---------- bump quotation widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.quotationCategoryItemListSize > 0) {
            $.each(self.options.quotationCategoryItemList, function (index, categoryItem) {
                self.addLineItemForCategory(true, categoryItem);
            });
        } else {
            self.addLineItemForCategory(true, self.options.categoryItem);
        }
        self.addPlusIconForTheLastCategoryItem();

        if (self.options.bumpQuotationLineItemListSize > 0) {
            $.each(self.options.bumpQuotationLineItemList, function (index, bumpQuotationItem) {
                self.addLineItemForBumpQuotation(true, bumpQuotationItem);
            });
        } else {
            self.addLineItemForBumpQuotation(true, self.options.bumpQuotationItem);
        }
        self.addPlusIconForTheLastBumpQuotationItem();

        self.uiEventInitialization();

        if (self.options.quotationStatus == 'SUBMITTED'
            || self.options.quotationStatus == 'HOLD'
            || self.options.viewOnly == 'true'){
            self.disableForSubmitAndHold();
        }

    },
    initiateFormValidation: function () {
        var self = this;
        var validateJson = {
            rules: {
                bumpMaskNumber: {
                    required: true,
                    number: true
                },
                device: {
                    required: true,
                },
                price: {
                    required: true,
                    number: true
                },
                engOrProd: {
                    required: true,
                    number: true
                },
                project: {
                    maxlength: 64
                },
                comments: {
                    maxlength: 250
                },
            }
        };
        self.el.quotationForm.validate(validateJson);

        // Add dynamic validation for newly added line items
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("categoryName", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("description", {maxlength: 250});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("amount", {maxlength: 25});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("comments", {maxlength: 250});

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("engOrProd", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("deviceOrWafer", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("bumpMaskNumber", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("waferDiameter", {maxlength: 64});


        Forecast.APP.addDynamicFieldValidationByClassNameSelector("bumpType", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("layers", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("pi", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("bumpedDiePerWafer", {maxlength: 25});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("price", {maxlength: 25});


        Forecast.APP.addDynamicFieldValidationByClassNameSelector("specialAdders", {maxlength: 250});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("remark", {maxlength: 250});

    },
    uiEventInitialization: function () {
        var self = this;

        self.el.submitButton.on('click', function(){
            self.initiateFormValidation();
            self.el.submissionCount.val(parseInt(self.el.submissionCount.val()) + 1);
            self.el.statusSubmitted.val(true);
            self.el.lateSubmitDay.val(self.getLateSubmitDay(self.options.dueDate));
            self.el.quotationForm.trigger('submit');
        });

        self.el.saveButton.on('click', function(){
            self.el.statusSubmitted.val(false);
            self.el.quotationForm.trigger('submit');
        });

        $(document).on('click', 'button.categoryItemAddButton', function () {
            self.addLineItemForCategory(true, self.options.categoryItem);
            self.addPlusIconForTheLastCategoryItem();
        });

        $(document).on('click', 'button.categoryItemRemoveButton', function () {
            $(this).closest('div.category-dynamic-row').remove();
            self.addPlusIconForTheLastCategoryItem();
            self.reIndexCategoryItems();
        });

        $(document).on('click', 'button.bumpItemAddButton', function () {
            self.addLineItemForBumpQuotation(true, self.options.bumpQuotationItem);
            self.addPlusIconForTheLastBumpQuotationItem();
        });

        $(document).on('click', 'button.bumpItemRemoveButton', function () {
            $(this).closest('div.quotation-dynamic-row').remove();
            self.addPlusIconForTheLastBumpQuotationItem();
            self.reIndexBumpQuotationItems();
        });

        self.el.tabNextButton.on('click', function () {
            $('.nav-link.active').parent().next().find('a').tab('show');
        });
    },
    reIndexCategoryItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.categoryLineItemDiv.find('div.category-dynamic-row').each(function(){
            name = 'bumpQuotationCategoryItemList[' + index + ']';
            $(this).find('div').find('input.categoryLineItemId').attr("name", name + ".id");
            $(this).find('div').find('input.categoryName').attr("name", name + ".categoryName");
            $(this).find('div').find('textarea.description').attr("name", name + ".description");
            $(this).find('div').find('input.amount').attr("name", name + ".amount");
            $(this).find('div').find('textarea.comments').attr("name", name + ".comments");

            index++;
        });
    },
    reIndexBumpQuotationItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.categoryLineItemDiv.find('div.quotation-dynamic-row').each(function(){
            name = 'fabQuotationItemList[' + index + ']';
            $(this).find('div').find('input.quotationLineItemId').attr("name", name + ".id");
            $(this).find('div').find('input.engOrProd').attr("name", name + ".engOrProd");
            $(this).find('div').find('input.deviceOrWafer').attr("name", name + ".deviceOrWafer");
            $(this).find('div').find('input.bumpMaskNumber').attr("name", name + ".bumpMaskNumber");
            $(this).find('div').find('input.waferDiameter').attr("name", name + ".waferDiameter");
            $(this).find('div').find('input.bumpType').attr("name", name + ".bumpType");
            $(this).find('div').find('input.layers').attr("name", name + ".layers");
            $(this).find('div').find('input.pi').attr("name", name + ".pi");
            $(this).find('div').find('input.bumpedDiePerWafer').attr("name", name + ".bumpedDiePerWafer");
            $(this).find('div').find('input.price').attr("name", name + ".price");
            $(this).find('div').find('textarea.specialAdders').attr("name", name + ".specialAdders");
            $(this).find('div').find('textarea.remark').attr("name", name + ".remark");
            $(this).find('div').find('textarea.comments').attr("name", name + ".comments");

            index++;
        });
    },
    addLineItemForCategory: function (isPlusIcon, categoryItem) {
        var self = this;
        var index = self.el.categoryLineItemDiv.find('div.category-dynamic-row').length;
        var $rowToAppend = '<div class="row category-dynamic-row lineItemBorder">'
            + '<div class="col-lg-6 px-5">'
            + '<div class="form-group row ">'
            + '<input name="bumpQuotationCategoryItemList[' + index + '].id" class="categoryLineItemId" style="display: none;" value="' + categoryItem.id + '" />'
            + '<label class="col-md-3 col-form-label">Category</label>'
            + '<div class="col-md-9">'
            + '<input name="bumpQuotationCategoryItemList[' + index + '].categoryName" class="form-control categoryName" placeholder="Name" value="' + categoryItem.categoryName + '"  />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Description</label>'
            + '<div class="col-md-9">'
            + '<textarea name="bumpQuotationCategoryItemList[' + index + '].description" class="form-control description" placeholder="Description">'+categoryItem.description+'</textarea>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-6 px-5">'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Amount</label>'
            + '<div class="col-md-9">'
            + '<input name="bumpQuotationCategoryItemList[' + index + '].amount" class="form-control amount"  placeholder="Amount" value="' + categoryItem.amount + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Comments</label>'
            + '<div class="col-md-9">'
            + '<textarea name="bumpQuotationCategoryItemList[' + index + '].comments" class="form-control comments" placeholder="Comments">'+categoryItem.comments+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row">'
            + '<div class="col-md-12 categoryItemAddRemoveButtonDiv" style="text-align:right">';

        if (isPlusIcon) {
            $rowToAppend += self.el.categoryLineItemAddButton;
        } else {
            $rowToAppend += self.el.categoryLineItemRemoveButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.categoryLineItemDiv.append($rowToAppend);
        self.el.categoryLineItemDiv.find('div.category-dynamic-row:last').prev().find('div.categoryItemAddRemoveButtonDiv').html(self.el.categoryLineItemRemoveButton);
    },
    addPlusIconForTheLastCategoryItem: function () {
        var self = this;
        if (self.el.categoryLineItemDiv.children().length == 1) {
            self.el.categoryLineItemDiv.find('div.category-dynamic-row:last').find('div.categoryItemAddRemoveButtonDiv').html(self.el.categoryLineItemAddButton);
        }
        else {
            self.el.categoryLineItemDiv.find('div.category-dynamic-row:last').find('div.categoryItemAddRemoveButtonDiv').html(self.el.categoryLineItemRemoveButton + self.el.categoryLineItemAddButton);
        }
    },
    addLineItemForBumpQuotation: function (isPlusIcon, quotationItem) {
        var self = this;
        var index = self.el.bumpQuotationLineItemDiv.find('div.quotation-dynamic-row').length;
        var $rowToAppend = '<div class="row quotation-dynamic-row lineItemBorder">'
            + '<div class="col-lg-4 px-5">'
            + '<div class="form-group row ">'
            + '<input name="bumpQuotationItemList[' + index + '].id" class="quotationLineItemId" style="display: none;" value="' + quotationItem.id + '" />'
            + '<label class="col-md-3 col-form-label">Eng. / Prod</label>'
            + '<div class="col-md-9">'
            + '<input name="bumpQuotationItemList[' + index + '].engOrProd" class="form-control engOrProd" value="' + quotationItem.engOrProd + '"  />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Device / Wafer</label>'
            + '<div class="col-md-9">'
            + '<input name="bumpQuotationItemList[' + index + '].deviceOrWafer" class="form-control deviceOrWafer" value="' + quotationItem.deviceOrWafer + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Bump Mask Number</label>'
            + '<div class="col-md-9">'
            + '<input name="bumpQuotationItemList[' + index + '].bumpMaskNumber" class="form-control bumpMaskNumber" placeholder="Bump Mask Number" value="' + quotationItem.bumpMaskNumber + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Wafer Diameter</label>'
            + '<div class="col-md-9">'
            + '<input name="bumpQuotationItemList[' + index + '].waferDiameter" class="form-control waferDiameter" placeholder="Wafer Diameter" value="' + quotationItem.waferDiameter + '" />'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-4 px-5">'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Bump Type</label>'
            + '<div class="col-md-9">'
            + '<input name="bumpQuotationItemList[' + index + '].bumpType" class="form-control bumpType" placeholder="Bump Type" value="' + quotationItem.bumpType + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Layers</label>'
            + '<div class="col-md-9">'
            + '<input name="bumpQuotationItemList[' + index + '].layers" class="form-control layers" placeholder="Layers" value="' + quotationItem.layers + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">PI</label>'
            + '<div class="col-md-9">'
            + '<input name="bumpQuotationItemList[' + index + '].pi" class="form-control pi" placeholder="PI" value="' + quotationItem.pi + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Bumped Die Per Wafer</label>'
            + '<div class="col-md-9">'
            + '<input name="bumpQuotationItemList[' + index + '].bumpedDiePerWafer" class="form-control bumpedDiePerWafer"  placeholder="Bumped Die Per Wafer" value="' + quotationItem.bumpedDiePerWafer + '" />'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-4 px-5">'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Price</label>'
            + '<div class="col-md-9">'
            + '<input name="bumpQuotationItemList[' + index + '].price" class="form-control price"  placeholder="Price" value="' + quotationItem.price + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Special Adders</label>'
            + '<div class="col-md-9">'
            + '<textarea name="bumpQuotationItemList[' + index + '].specialAdders" class="form-control specialAdders" placeholder="Special Adders">'+quotationItem.specialAdders+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Remark</label>'
            + '<div class="col-md-9">'
            + '<textarea name="bumpQuotationItemList[' + index + '].remark" class="form-control remark" placeholder="Remark">'+quotationItem.remark+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Comments</label>'
            + '<div class="col-md-9">'
            + '<textarea name="bumpQuotationItemList[' + index + '].comments" class="form-control comments" placeholder="Comments">'+quotationItem.comments+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row">'
            + '<div class="col-md-12 quotationItemAddRemoveButtonDiv" style="text-align:right">';

        if (isPlusIcon) {
            $rowToAppend += self.el.bumpLineItemAddButton;
        } else {
            $rowToAppend += self.el.bumpLineItemRemoveButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.bumpQuotationLineItemDiv.append($rowToAppend);
        self.el.bumpQuotationLineItemDiv.find('div.quotation-dynamic-row:last').prev().find('div.quotationItemAddRemoveButtonDiv').html(self.el.bumpLineItemRemoveButton);
    },
    addPlusIconForTheLastBumpQuotationItem: function () {
        var self = this;
        if (self.el.bumpQuotationLineItemDiv.children().length == 1) {
            self.el.bumpQuotationLineItemDiv.find('div.quotation-dynamic-row:last').find('div.quotationItemAddRemoveButtonDiv').html(self.el.bumpLineItemAddButton);
        }
        else {
            self.el.bumpQuotationLineItemDiv.find('div.quotation-dynamic-row:last').find('div.quotationItemAddRemoveButtonDiv').html(self.el.bumpLineItemRemoveButton + self.el.bumpLineItemAddButton);
        }
    },
    getLateSubmitDay: function (dueDate) {
        var currentDate = new Date().toLocaleDateString();
        console.log("AFRILOG currentDate::"+ currentDate);
        console.log("AFRILOG dueDate::"+ dueDate);
        currentDate = moment(currentDate);
        dueDate = moment(dueDate);
        var days = currentDate.diff(dueDate, 'days');
        if(days > 0){
            return days;
        } else {
            days = 0;
            return days;
        }
    },
    disableForSubmitAndHold: function(goBack){
        var self = this;

        self.el.quotationForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.quotationForm.find('select').attr("disabled", true);
        self.el.quotationForm.find('textarea').attr("disabled", true);
        self.el.quotationForm.find('button[type="button"]').not(".next-button #submitButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.quotationForm.attr("href", "#");
    },
    destroy: function () {
    }
});
