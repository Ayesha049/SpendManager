$.widget("forecast.testPOQuotation", {
    options: {
        testPOQuotationCategoryItemList: undefined,
        testPOQuotationLineItemList: undefined,
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
        testPOQuotationItem: {
            id: '',
            testOperation: '',
            engOrProd: '',
            device: '',
            testProgram: '',
            packageType: '',
            bodySize: 0,
            ballCount: 0,
            ballPitch: 0,
            platform: '',
            siteCount: 0,
            hourlyRate: 0,
            indexTime: '',
            totalTest: 0,
            testCostPerSec: 0,
            tempGradeAdder: '',
            testCostPerUnit: 0,
            remark: '',
            comments: ''
        }
    },
    _create: function () {
        console.log("AFRILOG :: ---------- testPO quotation widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};

        // UI element Initialization
        self.el.quotationForm = $("#test_po_quotation_form");
        self.el.categoryLineItemDiv = $('#categoryDynamicRowDiv');
        self.el.testPOQuotationLineItemDiv = $('#secondDynamicRowDiv');
        self.el.statusSubmitted = $("#statusSubmitted");
        self.el.submissionCount = $("#submissionCount");
        self.el.lateSubmitDay = $("#lateSubmitDay");
        self.el.submitButton = $("#submitButton");
        self.el.saveButton = $("#saveButton");
        self.el.tabNextButton = $(".next-button");

        $("#mobile_btn_top").trigger('click');

        if (self.options.testPOQuotationCategoryItemList != 'undefined') {
            self.options.testPOQuotationCategoryItemListSize = self.options.testPOQuotationCategoryItemList.length;
        }

        if (self.options.testPOQuotationLineItemList != 'undefined') {
            self.options.testPOQuotationLineItemListSize = self.options.testPOQuotationLineItemList.length;
        }

        self.el.gobackButton = '<a href="/admin/rfqDashboard" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.categoryLineItemAddButton = '<button type="button" class="btn btn-primary categoryItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.categoryLineItemRemoveButton = '<button type="button" class="btn btn-danger categoryItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';
        self.el.testPOLineItemAddButton = '<button type="button" class="btn btn-primary testPOItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.testPOLineItemRemoveButton = '<button type="button" class="btn btn-danger testPOItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';

    },
    _init: function () {
        console.log("AFRILOG :: ---------- testPO quotation widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.testPOQuotationCategoryItemListSize > 0) {
            $.each(self.options.testPOQuotationCategoryItemList, function (index, categoryItem) {
                self.addLineItemForCategory(true, categoryItem);
            });
        } else {
            self.addLineItemForCategory(true, self.options.categoryItem);
        }
        self.addPlusIconForTheLastCategoryItem();

        if (self.options.testPOQuotationLineItemListSize > 0) {
            $.each(self.options.testPOQuotationLineItemList, function (index, testPOQuotationItem) {
                self.addLineItemForTestPOQuotation(true, testPOQuotationItem);
            });
        } else {
            self.addLineItemForTestPOQuotation(true, self.options.testPOQuotationItem);
        }
        self.addPlusIconForTheLastTestPOQuotationItem();

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
                hourlyRate: {
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

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("testOperation", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("engOrProd", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("device", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("testProgram", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("packageType", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("bodySize", {maxlength: 25});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("ballCount", {maxlength: 25});

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("ballPitch", {maxlength: 25});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("platform", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("siteCount", {maxlength: 25});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("hourlyRate", {maxlength: 25});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("indexTime", {maxlength: 64});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("totalTest", {maxlength: 25});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("testCostPerSec", {maxlength: 25});

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("tempGradeAdder", {maxlength: 250});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("testCostPerUnit", {maxlength: 25});
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

        $(document).on('click', 'button.testPOItemAddButton', function () {
            self.addLineItemForTestPOQuotation(true, self.options.testPOQuotationItem);
            self.addPlusIconForTheLastTestPOQuotationItem();
        });

        $(document).on('click', 'button.testPOItemRemoveButton', function () {
            $(this).closest('div.quotation-dynamic-row').remove();
            self.addPlusIconForTheLastTestPOQuotationItem();
            self.reIndexTestPOQuotationItems();
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
            name = 'testPOQuotationCategoryItemList[' + index + ']';
            $(this).find('div').find('input.categoryLineItemId').attr("name", name + ".id");
            $(this).find('div').find('input.categoryName').attr("name", name + ".categoryName");
            $(this).find('div').find('textarea.description').attr("name", name + ".description");
            $(this).find('div').find('input.amount').attr("name", name + ".amount");
            $(this).find('div').find('textarea.comments').attr("name", name + ".comments");

            index++;
        });
    },
    reIndexTestPOQuotationItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.categoryLineItemDiv.find('div.quotation-dynamic-row').each(function(){
            name = 'testPOQuotationItemList[' + index + ']';
            $(this).find('div').find('input.quotationLineItemId').attr("name", name + ".id");
            $(this).find('div').find('input.testOperation').attr("name", name + ".testOperation");
            $(this).find('div').find('input.engOrProd').attr("name", name + ".engOrProd");
            $(this).find('div').find('input.device').attr("name", name + ".device");
            $(this).find('div').find('input.testProgram').attr("name", name + ".testProgram");
            $(this).find('div').find('input.packageType').attr("name", name + ".packageType");
            $(this).find('div').find('input.bodySize').attr("name", name + ".bodySize");
            $(this).find('div').find('input.ballCount').attr("name", name + ".ballCount");
            $(this).find('div').find('input.ballPitch').attr("name", name + ".ballPitch");
            $(this).find('div').find('input.platform').attr("name", name + ".platform");
            $(this).find('div').find('input.siteCount').attr("name", name + ".siteCount");
            $(this).find('div').find('input.hourlyRate').attr("name", name + ".hourlyRate");
            $(this).find('div').find('input.indexTime').attr("name", name + ".indexTime");
            $(this).find('div').find('input.totalTest').attr("name", name + ".totalTest");
            $(this).find('div').find('input.testCostPerSec').attr("name", name + ".testCostPerSec");
            $(this).find('div').find('input.tempGradeAdder').attr("name", name + ".tempGradeAdder");
            $(this).find('div').find('input.testCostPerUnit').attr("name", name + ".testCostPerUnit");
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
            + '<input name="testPOQuotationCategoryItemList[' + index + '].id" class="categoryLineItemId" style="display: none;" value="' + categoryItem.id + '" />'
            + '<label class="col-md-3 col-form-label">Category</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationCategoryItemList[' + index + '].categoryName" class="form-control categoryName" placeholder="Name" value="' + categoryItem.categoryName + '"  />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Description</label>'
            + '<div class="col-md-9">'
            + '<textarea name="testPOQuotationCategoryItemList[' + index + '].description" class="form-control description" placeholder="Description">'+categoryItem.description+'</textarea>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-6 px-5">'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Amount</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationCategoryItemList[' + index + '].amount" class="form-control amount"  placeholder="Amount" value="' + categoryItem.amount + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Comments</label>'
            + '<div class="col-md-9">'
            + '<textarea name="testPOQuotationCategoryItemList[' + index + '].comments" class="form-control comments" placeholder="Comments">'+categoryItem.comments+'</textarea>'
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
    addLineItemForTestPOQuotation: function (isPlusIcon, quotationItem) {
        var self = this;
        var index = self.el.testPOQuotationLineItemDiv.find('div.quotation-dynamic-row').length;
        var $rowToAppend = '<div class="row quotation-dynamic-row lineItemBorder">'
            + '<div class="col-lg-4 px-5">'
            + '<div class="form-group row ">'
            + '<input name="testPOQuotationItemList[' + index + '].id" class="quotationLineItemId" style="display: none;" value="' + quotationItem.id + '" />'
            + '<label class="col-md-3 col-form-label">Test Operation</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].testOperation" class="form-control testOperation" value="' + quotationItem.testOperation + '"  />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Eng. / Prod</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].engOrProd" class="form-control engOrProd" value="' + quotationItem.engOrProd + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Device</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].device" class="form-control device" placeholder="Device" value="' + quotationItem.device + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Test Program</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].testProgram" class="form-control testProgram" placeholder="Test Program" value="' + quotationItem.testProgram + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Package Type</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].packageType" class="form-control packageType" placeholder="Package Type" value="' + quotationItem.packageType + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Body Size</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].bodySize" class="form-control bodySize" placeholder="Body Size" value="' + quotationItem.bodySize + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Ball Count</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].ballCount" class="form-control ballCount" placeholder="Ball Count" value="' + quotationItem.ballCount + '" />'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-4 px-5">'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Ball Pitch</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].ballPitch" class="form-control ballPitch"  placeholder="Ball Pitch" value="' + quotationItem.ballPitch + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Platform</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].platform" class="form-control platform"  placeholder="Platform" value="' + quotationItem.platform + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Site Count</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].siteCount" class="form-control siteCount"  value="' + quotationItem.siteCount + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Hourly Rate</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].hourlyRate" class="form-control hourlyRate"  value="' + quotationItem.hourlyRate + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Index Time</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].indexTime" class="form-control indexTime"  placeholder="Index Time" value="' + quotationItem.indexTime + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Total Test</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].totalTest" class="form-control totalTest"  placeholder="Total Test" value="' + quotationItem.totalTest + '" />'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Test Cost Per Sec</label>'
            + '<div class="col-md-9">'
            + '<input name="testPOQuotationItemList[' + index + '].testCostPerSec" class="form-control testCostPerSec"  placeholder="Test Cost Per Sec" value="' + quotationItem.testCostPerSec + '" />'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-4 px-5">'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Temp Grade Adder</label>'
            + '<div class="col-md-9">'
            + '<textarea name="testPOQuotationItemList[' + index + '].tempGradeAdder" class="form-control tempGradeAdder" placeholder="Temp Grade Adder">'+quotationItem.tempGradeAdder+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Test Cost Per Unit</label>'
            + '<div class="col-md-9">'
            + '<textarea name="testPOQuotationItemList[' + index + '].testCostPerUnit" class="form-control testCostPerUnit" placeholder="Test Cost Per Unit">'+quotationItem.testCostPerUnit+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Remark</label>'
            + '<div class="col-md-9">'
            + '<textarea name="testPOQuotationItemList[' + index + '].remark" class="form-control remark" placeholder="Remark">'+quotationItem.remark+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row ">'
            + '<label class="col-md-3 col-form-label">Comments</label>'
            + '<div class="col-md-9">'
            + '<textarea name="testPOQuotationItemList[' + index + '].comments" class="form-control comments" placeholder="Comments">'+quotationItem.comments+'</textarea>'
            + '</div>'
            + '</div>'
            + '<div class="form-group row">'
            + '<div class="col-md-12 quotationItemAddRemoveButtonDiv" style="text-align:right">';

        if (isPlusIcon) {
            $rowToAppend += self.el.testPOLineItemAddButton;
        } else {
            $rowToAppend += self.el.testPOLineItemRemoveButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.testPOQuotationLineItemDiv.append($rowToAppend);
        self.el.testPOQuotationLineItemDiv.find('div.quotation-dynamic-row:last').prev().find('div.quotationItemAddRemoveButtonDiv').html(self.el.testPOLineItemRemoveButton);
    },
    addPlusIconForTheLastTestPOQuotationItem: function () {
        var self = this;
        if (self.el.testPOQuotationLineItemDiv.children().length == 1) {
            self.el.testPOQuotationLineItemDiv.find('div.quotation-dynamic-row:last').find('div.quotationItemAddRemoveButtonDiv').html(self.el.testPOLineItemAddButton);
        }
        else {
            self.el.testPOQuotationLineItemDiv.find('div.quotation-dynamic-row:last').find('div.quotationItemAddRemoveButtonDiv').html(self.el.testPOLineItemRemoveButton + self.el.testPOLineItemAddButton);
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
        self.el.quotationForm.find('button[type="button"]').not(".next-button").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.quotationForm.attr("href", "#");
    },
    destroy: function () {
    }
});
