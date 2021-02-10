$.widget("forecast.assemblyQuotation", {
    options: {
        assemblyQuotationCategoryItemList: undefined,
        assemblyQuotationLineItemList: undefined,
        messages: undefined,
        viewOnly: undefined,
        quotationStatus: undefined,
        dueDate: undefined,
        categoryItem: {
            id: '',
            categoryName: '',
            description: '',
            amount: 0,
            comments: ''
        },
        assemblyQuotationItem: {
            id: '',
            ptp: '',
            engOrProd: '',
            device: '',
            packageType: '',
            bodySize: 0,
            ballCount: 0,
            ballPitch: 0,
            discreates: '',
            substrate: '',
            handling: '',
            assembly: '',
            price: 0,
            specialAdders: '',
            remark: '',
            comments: ''
        }
    },
    _create: function () {
        console.log("AFRILOG :: ---------- assembly quotation widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};

        // UI element Initialization
        self.el.quotationForm = $("#assembly_quotation_form");
        self.el.categoryLineItemDiv = $('#categoryDynamicRowDiv');
        self.el.assemblyQuotationLineItemDiv = $('#secondDynamicRowDiv');
        self.el.statusSubmitted = $("#statusSubmitted");
        self.el.submissionCount = $("#submissionCount");
        self.el.lateSubmitDay = $("#lateSubmitDay");
        self.el.submittedDate = $("#submittedDate");
        self.el.submitButton = $("#submitButton");
        self.el.saveButton = $("#saveButton");
        self.el.tabNextButton = $(".next-button");

        $("#mobile_btn_top").trigger('click');

        if (self.options.assemblyQuotationCategoryItemList != 'undefined') {
            self.options.assemblyQuotationCategoryItemListSize = self.options.assemblyQuotationCategoryItemList.length;
        }

        if (self.options.assemblyQuotationLineItemList != 'undefined') {
            self.options.assemblyQuotationLineItemListSize = self.options.assemblyQuotationLineItemList.length;
        }

        self.el.gobackButton = '<a href="/admin/rfqDashboard" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.categoryLineItemAddButton = '<button type="button" class="btn btn-primary categoryItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.categoryLineItemRemoveButton = '<button type="button" class="btn btn-danger categoryItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';
        self.el.assemblyLineItemAddButton = '<button type="button" class="btn btn-primary assemblyItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.assemblyLineItemRemoveButton = '<button type="button" class="btn btn-danger assemblyItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';

    },
    _init: function () {
        console.log("AFRILOG :: ---------- assembly quotation widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.assemblyQuotationCategoryItemListSize > 0) {
            $.each(self.options.assemblyQuotationCategoryItemList, function (index, categoryItem) {
                self.addLineItemForCategory(true, categoryItem);
            });
        } else {
            self.addLineItemForCategory(true, self.options.categoryItem);
        }
        self.addPlusIconForTheLastCategoryItem();

        if (self.options.assemblyQuotationLineItemListSize > 0) {
            $.each(self.options.assemblyQuotationLineItemList, function (index, assemblyQuotationItem) {
                self.addLineItemForAssemblyQuotation(true, assemblyQuotationItem);
            });
        } else {
            self.addLineItemForAssemblyQuotation(true, self.options.assemblyQuotationItem);
        }
        self.addPlusIconForTheLastAssemblyQuotationItem();

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
                ptp: {
                    required: true,
                    number: true
                },
                device: {
                    required: true,
                },
                engOrProd: {
                    required: true,
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

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("ptp", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("engOrProd", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("device", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("packageType", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("bodySize", {maxlength: 25});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("ballCount", {maxlength: 25});

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("ballPitch", {maxlength: 25});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("discreates", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("substrate", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("handling", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("waferCost", {maxlength: 64});
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

        $(document).on('click', 'button.assemblyItemAddButton', function () {
            self.addLineItemForAssemblyQuotation(true, self.options.assemblyQuotationItem);
            self.addPlusIconForTheLastAssemblyQuotationItem();
        });

        $(document).on('click', 'button.assemblyItemRemoveButton', function () {
            $(this).closest('div.quotation-dynamic-row').remove();
            self.addPlusIconForTheLastAssemblyQuotationItem();
            self.reIndexAssemblyQuotationItems();
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
            name = 'assemblyQuotationCategoryItemList[' + index + ']';
            $(this).find('div').find('input.categoryLineItemId').attr("name", name + ".id");
            $(this).find('div').find('input.categoryName').attr("name", name + ".categoryName");
            $(this).find('div').find('textarea.description').attr("name", name + ".description");
            $(this).find('div').find('input.amount').attr("name", name + ".amount");
            $(this).find('div').find('textarea.comments').attr("name", name + ".comments");

            index++;
        });
    },
    reIndexAssemblyQuotationItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.categoryLineItemDiv.find('div.quotation-dynamic-row').each(function(){
            name = 'assemblyQuotationItemList[' + index + ']';
            $(this).find('div').find('input.quotationLineItemId').attr("name", name + ".id");
            $(this).find('div').find('input.ptp').attr("name", name + ".ptp");
            $(this).find('div').find('input.engOrProd').attr("name", name + ".engOrProd");
            $(this).find('div').find('input.device').attr("name", name + ".device");
            $(this).find('div').find('input.packageType').attr("name", name + ".packageType");
            $(this).find('div').find('input.bodySize').attr("name", name + ".bodySize");
            $(this).find('div').find('input.ballCount').attr("name", name + ".ballCount");
            $(this).find('div').find('input.ballPitch').attr("name", name + ".ballPitch");
            $(this).find('div').find('input.discreates').attr("name", name + ".discreates");
            $(this).find('div').find('input.substrate').attr("name", name + ".substrate");
            $(this).find('div').find('input.handling').attr("name", name + ".handling");
            $(this).find('div').find('input.assembly').attr("name", name + ".assembly");
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
            + '<input name="assemblyQuotationCategoryItemList[' + index + '].id" class="categoryLineItemId" style="display: none;" value="' + categoryItem.id + '" />'
            + '<label class="col-md-3 col-form-label">Category</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationCategoryItemList[' + index + '].categoryName" class="form-control categoryName" placeholder="Name" value="' + categoryItem.categoryName + '"  />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Description</label>'
            + '<div class="col-md-9">'
            + '<textarea name="assemblyQuotationCategoryItemList[' + index + '].description" class="form-control description" placeholder="Description">'+categoryItem.description+'</textarea>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-6 px-5">'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Amount</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationCategoryItemList[' + index + '].amount" class="form-control amount"  placeholder="Amount" value="' + categoryItem.amount + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Comments</label>'
            + '<div class="col-md-9">'
            + '<textarea name="assemblyQuotationCategoryItemList[' + index + '].comments" class="form-control comments" placeholder="Comments">'+categoryItem.comments+'</textarea>'
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
    addLineItemForAssemblyQuotation: function (isPlusIcon, quotationItem) {
        var self = this;
        var index = self.el.assemblyQuotationLineItemDiv.find('div.quotation-dynamic-row').length;
        var $rowToAppend = '<div class="row quotation-dynamic-row lineItemBorder">'
            + '<div class="col-lg-4 px-5">'
            + '<div class="form-group row ">'
            + '<input name="assemblyQuotationItemList[' + index + '].id" class="quotationLineItemId" style="display: none;" value="' + quotationItem.id + '" />'
            + '<label class="col-md-3 col-form-label">PtP, Consign or TK</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationItemList[' + index + '].ptp" class="form-control ptp" value="' + quotationItem.ptp + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Eng. / Prod</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationItemList[' + index + '].engOrProd" class="form-control engOrProd" value="' + quotationItem.engOrProd + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Device</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationItemList[' + index + '].device" class="form-control device" placeholder="Device" value="' + quotationItem.device + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Package Type</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationItemList[' + index + '].packageType" class="form-control packageType" placeholder="Package Type" value="' + quotationItem.packageType + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Body Size</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationItemList[' + index + '].bodySize" class="form-control bodySize" placeholder="Body Size" value="' + quotationItem.bodySize + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Ball Count</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationItemList[' + index + '].ballCount" class="form-control ballCount"  placeholder="Ball Count" value="' + quotationItem.ballCount+ '" />'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-4 px-5">'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Ball Pitch</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationItemList[' + index + '].ballPitch" class="form-control ballPitch"  placeholder="Ball Pitch" value="' + quotationItem.ballPitch + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Discreates</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationItemList[' + index + '].discreates" class="form-control discreates"  value="' + quotationItem.discreates + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Substrate</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationItemList[' + index + '].substrate" class="form-control substrate"  value="' + quotationItem.substrate + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Handling</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationItemList[' + index + '].handling" class="form-control handling"  placeholder="Handling" value="' + quotationItem.handling + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Assembly</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationItemList[' + index + '].assembly" class="form-control waferCost"  placeholder="Assembly" value="' + quotationItem.assembly + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Price</label>'
            + '<div class="col-md-9">'
            + '<input name="assemblyQuotationItemList[' + index + '].price" class="form-control price"  placeholder="Price" value="' + quotationItem.price + '" />'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-4 px-5">'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Special Adders</label>'
            + '<div class="col-md-9">'
            + '<textarea name="assemblyQuotationItemList[' + index + '].specialAdders" class="form-control specialAdders" placeholder="Special Adders">'+quotationItem.specialAdders+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Remark</label>'
            + '<div class="col-md-9">'
            + '<textarea name="assemblyQuotationItemList[' + index + '].remark" class="form-control remark" placeholder="Remark">'+quotationItem.remark+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Comments</label>'
            + '<div class="col-md-9">'
            + '<textarea name="assemblyQuotationItemList[' + index + '].comments" class="form-control comments" placeholder="Comments">'+quotationItem.comments+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row">'
            + '<div class="col-md-12 quotationItemAddRemoveButtonDiv" style="text-align:right">';

        if (isPlusIcon) {
            $rowToAppend += self.el.assemblyLineItemAddButton;
        } else {
            $rowToAppend += self.el.assemblyLineItemRemoveButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.assemblyQuotationLineItemDiv.append($rowToAppend);
        self.el.assemblyQuotationLineItemDiv.find('div.quotation-dynamic-row:last').prev().find('div.quotationItemAddRemoveButtonDiv').html(self.el.assemblyLineItemRemoveButton);
    },
    addPlusIconForTheLastAssemblyQuotationItem: function () {
        var self = this;
        if (self.el.assemblyQuotationLineItemDiv.children().length == 1) {
            self.el.assemblyQuotationLineItemDiv.find('div.quotation-dynamic-row:last').find('div.quotationItemAddRemoveButtonDiv').html(self.el.assemblyLineItemAddButton);
        }
        else {
            self.el.assemblyQuotationLineItemDiv.find('div.quotation-dynamic-row:last').find('div.quotationItemAddRemoveButtonDiv').html(self.el.assemblyLineItemRemoveButton + self.el.assemblyLineItemAddButton);
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
