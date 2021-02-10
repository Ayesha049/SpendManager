$.widget("forecast.fabQuotation", {
    options: {
        quotationCategoryItemList: undefined,
        fabQuotationLineItemList: undefined,
        messages: undefined,
        viewOnly :undefined,
        quotationStatus: undefined,
        dueDate: undefined,
        categoryItem: {
            id: '',
            categoryName: '',
            description: '',
            amount: 0,
            comments: ''
        },
        fabQuotationItem: {
            id: '',
            operationName: '',
            fabReticalNumber: '',
            maskLayer: '',
            metalLayer: '',
            waferSize: '',
            waferType: 0,
            pi: '',
            bump: '',
            bumpType: '',
            waferBuyOrDieBuy: '',
            fabDo: '',
            gdpw: 0,
            waferCost: 0,
            dieCost: 0,
            specialAddress: '',
            remark: '',
            comments: ''
        }
    },
    _create: function () {
        console.log("SMNLOG :: ---------- fab quotation widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};

        // UI element Initialization
        self.el.quotationForm = $("#quotation_form");
        self.el.categoryLineItemDiv = $('#categoryDynamicRowDiv');
        self.el.fabQuotationLineItemDiv = $('#secondDynamicRowDiv');
        self.el.statusSubmitted = $("#statusSubmitted");
        self.el.submissionCount = $("#submissionCount");
        self.el.lateSubmitDay = $("#lateSubmitDay");
        self.el.submitButton = $("#submitButton");
        self.el.saveButton = $("#saveButton");
        self.el.tabNextButton = $(".next-button");

        $("#mobile_btn_top").trigger('click');

        if (self.options.quotationCategoryItemList != 'undefined') {
            self.options.quotationCategoryItemListSize = self.options.quotationCategoryItemList.length;
        }

        if (self.options.fabQuotationLineItemList != 'undefined') {
            self.options.fabQuotationLineItemListSize = self.options.fabQuotationLineItemList.length;
        }

        self.el.gobackButton = '<a href="/admin/rfqDashboard" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.categoryLineItemAddButton = '<button type="button" class="btn btn-primary categoryItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.categoryLineItemRemoveButton = '<button type="button" class="btn btn-danger categoryItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';
        self.el.fabLineItemAddButton = '<button type="button" class="btn btn-primary fabItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.fabLineItemRemoveButton = '<button type="button" class="btn btn-danger fabItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';

    },
    _init: function () {
        console.log("SMNLOG :: ---------- fab quotation widget init ----------");
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

        if (self.options.fabQuotationLineItemListSize > 0) {
            $.each(self.options.fabQuotationLineItemList, function (index, fabQuotationItem) {
                self.addLineItemForFabQuotation(true, fabQuotationItem);
            });
        } else {
            self.addLineItemForFabQuotation(true, self.options.fabQuotationItem);
        }
        self.addPlusIconForTheLastFabQuotationItem();

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
                waferCost: {
                    required: true,
                    number: true
                },
                fabReticalNumber: {
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

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("operationName", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("fabReticalNumber", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("maskLayer", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("metalLayer", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("waferSize", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("waferType", {maxlength: 25});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("pi", {maxlength: 64});

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("bump", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("bumpType", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("waferBuyOrDieBuy", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("fabDo", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("gdpw", {maxlength: 25});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("waferCost", {maxlength: 25});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("dieCost", {maxlength: 25});

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("specialAddress", {maxlength: 250});
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
            //self
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

        $(document).on('click', 'button.fabItemAddButton', function () {
            self.addLineItemForFabQuotation(true, self.options.fabQuotationItem);
            self.addPlusIconForTheLastFabQuotationItem();
        });

        $(document).on('click', 'button.fabItemRemoveButton', function () {
            $(this).closest('div.quotation-dynamic-row').remove();
            self.addPlusIconForTheLastFabQuotationItem();
            self.reIndexFabQuotationItems();
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
            name = 'fabQuotationCategoryItemList[' + index + ']';
            $(this).find('div').find('input.categoryLineItemId').attr("name", name + ".id");
            $(this).find('div').find('input.categoryName').attr("name", name + ".categoryName");
            $(this).find('div').find('textarea.description').attr("name", name + ".description");
            $(this).find('div').find('input.amount').attr("name", name + ".amount");
            $(this).find('div').find('textarea.comments').attr("name", name + ".comments");

            index++;
        });
    },
    reIndexFabQuotationItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.categoryLineItemDiv.find('div.quotation-dynamic-row').each(function(){
            name = 'fabQuotationItemList[' + index + ']';
            $(this).find('div').find('input.quotationLineItemId').attr("name", name + ".id");
            $(this).find('div').find('input.operationName').attr("name", name + ".operationName");
            $(this).find('div').find('input.fabReticalNumber').attr("name", name + ".fabReticalNumber");
            $(this).find('div').find('input.maskLayer').attr("name", name + ".maskLayer");
            $(this).find('div').find('input.metalLayer').attr("name", name + ".metalLayer");
            $(this).find('div').find('input.waferSize').attr("name", name + ".waferSize");
            $(this).find('div').find('input.wafertype').attr("name", name + ".wafertype");
            $(this).find('div').find('input.pi').attr("name", name + ".pi");
            $(this).find('div').find('input.bump').attr("name", name + ".bump");
            $(this).find('div').find('input.bumpType').attr("name", name + ".bumpType");
            $(this).find('div').find('input.waferBuyOrDieBuy').attr("name", name + ".waferBuyOrDieBuy");
            $(this).find('div').find('input.fabDo').attr("name", name + ".fabDo");
            $(this).find('div').find('input.gdpw').attr("name", name + ".gdpw");
            $(this).find('div').find('input.waferCost').attr("name", name + ".waferCost");
            $(this).find('div').find('input.dieCost').attr("name", name + ".dieCost");
            $(this).find('div').find('textarea.specialAddress').attr("name", name + ".specialAddress");
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
            + '<input name="fabQuotationCategoryItemList[' + index + '].id" class="categoryLineItemId" style="display: none;" value="' + categoryItem.id + '" />'
            + '<label class="col-md-3 col-form-label">Category</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationCategoryItemList[' + index + '].categoryName" class="form-control categoryName" placeholder="Name" value="' + categoryItem.categoryName + '"  />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Description</label>'
            + '<div class="col-md-9">'
            + '<textarea name="fabQuotationCategoryItemList[' + index + '].description" class="form-control description" placeholder="Description">'+categoryItem.description+'</textarea>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-6 px-5">'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Amount</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationCategoryItemList[' + index + '].amount" class="form-control amount"  placeholder="Amount" value="' + categoryItem.amount + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Comments</label>'
            + '<div class="col-md-9">'
            + '<textarea name="fabQuotationCategoryItemList[' + index + '].comments" class="form-control comments" placeholder="Comments">'+categoryItem.comments+'</textarea>'
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
    addLineItemForFabQuotation: function (isPlusIcon, quotationItem) {
        var self = this;
        var index = self.el.fabQuotationLineItemDiv.find('div.quotation-dynamic-row').length;
        var $rowToAppend = '<div class="row quotation-dynamic-row lineItemBorder">'
            + '<div class="col-lg-4">'
            + '<div class="form-group row ">'
            + '<input name="fabQuotationItemList[' + index + '].id" class="quotationLineItemId" style="display: none;" value="' + quotationItem.id + '" />'
            + '<label class="col-md-3 col-form-label">Technology Node</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].operationName" class="form-control operationName" placeholder="Technology Node" value="' + quotationItem.operationName + '"  />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Fab Reticle Number</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].fabReticalNumber" class="form-control fabReticalNumber" placeholder="Fab Reticle Number" value="' + quotationItem.fabReticalNumber + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Mask Layer</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].maskLayer" class="form-control maskLayer" placeholder="Mask Layer" value="' + quotationItem.maskLayer + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Metal Layer</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].metalLayer" class="form-control metalLayer" placeholder="Metal Layer" value="' + quotationItem.metalLayer + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Wafer Size</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].waferSize" class="form-control waferSize" placeholder="Wafer Size" value="' + quotationItem.waferSize + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Wafer Type</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].waferType" class="form-control waferType" placeholder="Wafer Type" value="' + quotationItem.waferType + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">PI</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].pi" class="form-control pi" placeholder="PI" value="' + quotationItem.pi + '" />'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-4">'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Bump</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].bump" class="form-control bump"  placeholder="Bump" value="' + quotationItem.bump + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Type of Bump</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].bumpType" class="form-control bumpType"  placeholder="Type of Bump" value="' + quotationItem.bumpType + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Wafer Buy / Die Buy</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].waferBuyOrDieBuy" class="form-control waferBuyOrDieBuy"  value="' + quotationItem.waferBuyOrDieBuy + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">DO</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].fabDo" class="form-control fabDo"  value="' + quotationItem.fabDo + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">GDPW</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].gdpw" class="form-control gdpw"  placeholder="GDPW" value="' + quotationItem.gdpw + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Wafer Cost</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].waferCost" class="form-control waferCost"  placeholder="Wafer Cost" value="' + quotationItem.waferCost + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Die Cost</label>'
            + '<div class="col-md-9">'
            + '<input name="fabQuotationItemList[' + index + '].dieCost" class="form-control dieCost"  placeholder="Die Cost" value="' + quotationItem.dieCost + '" />'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-4">'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Special Address</label>'
            + '<div class="col-md-9">'
            + '<textarea name="fabQuotationItemList[' + index + '].specialAddress" class="form-control specialAddress" placeholder="Special Address">'+quotationItem.specialAddress+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Remark</label>'
            + '<div class="col-md-9">'
            + '<textarea name="fabQuotationItemList[' + index + '].remark" class="form-control remark" placeholder="Remark">'+quotationItem.remark+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Comments</label>'
            + '<div class="col-md-9">'
            + '<textarea name="fabQuotationItemList[' + index + '].comments" class="form-control comments" placeholder="Comments">'+quotationItem.comments+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row">'
            + '<div class="col-md-12 quotationItemAddRemoveButtonDiv" style="text-align:right">';

        if (isPlusIcon) {
            $rowToAppend += self.el.fabLineItemAddButton;
        } else {
            $rowToAppend += self.el.fabLineItemRemoveButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.fabQuotationLineItemDiv.append($rowToAppend);
        self.el.fabQuotationLineItemDiv.find('div.quotation-dynamic-row:last').prev().find('div.quotationItemAddRemoveButtonDiv').html(self.el.fabLineItemRemoveButton);
    },
    addPlusIconForTheLastFabQuotationItem: function () {
        var self = this;
        if (self.el.fabQuotationLineItemDiv.children().length == 1) {
            self.el.fabQuotationLineItemDiv.find('div.quotation-dynamic-row:last').find('div.quotationItemAddRemoveButtonDiv').html(self.el.fabLineItemAddButton);
        }
        else {
            self.el.fabQuotationLineItemDiv.find('div.quotation-dynamic-row:last').find('div.quotationItemAddRemoveButtonDiv').html(self.el.fabLineItemRemoveButton + self.el.fabLineItemAddButton);
        }
    },
    getLateSubmitDay: function (dueDate) {
        var currentDate = new Date().toLocaleDateString();
        console.log("AFRILOG currentDate::"+ currentDate);
        console.log("AFRILOG dueDate::"+ dueDate);
        currentDate = moment(currentDate);
        dueDate = moment(dueDate);
        var days = currentDate.diff(dueDate, 'days');
        if(days >0){
            return days;
        } else {
              days = 0;
              return days;
        }
    },
    disableForSubmitAndHold: function(){
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
