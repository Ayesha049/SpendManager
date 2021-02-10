$.widget("forecast.quotation", {
    options: {
        quotationType: undefined,
        quotationCategoryItemList: undefined,
        fabQuotationLineItemList: undefined,
        quotationCategoryItemListSize: 0,
        fabQuotationLineItemListSize: 0,
        messages: undefined,
        viewOnly :undefined,
        categoryItem: {
            id: '',
            categoryName: '',
            description: '',
            amount: 0,
            comments: ''
        },
        fabQuotationItem: {
            id: '',
            categoryName: '',
            description: '',
            amount: 0,
            comments: ''
        }
    },
    _create: function () {
        console.log("SMNLOG :: ---------- quotation widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};

        // UI element Initialization
        self.el.quotationForm = $("#quotation_form");
        self.el.categoryLineItemDiv = $('.quotation-category-line-item-div');
        self.el.fabQuotationLineItemDiv = $('.fab-quotation-category-line-item-div');
        self.el.searchBoxReviewer = $('#searchReviewer');
        self.el.submitButton = $("#submitButton");
        self.el.tabNextButton = $(".next-button");

        $("#mobile_btn_top").trigger('click');

        if (self.options.quotationCategoryItemList != 'undefined') {
            self.options.quotationCategoryItemListSize = self.options.quotationCategoryItemList.length;
        }

        if (self.options.fabQuotationLineItemList != 'undefined') {
            self.options.fabQuotationLineItemListSize = self.options.fabQuotationLineItemList.length;
        }

        self.el.gobackButton = '<a href="/admin/fabPOList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<a type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.removeButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';
        self.el.fileViewButton = '<a type="button" target="_blank" id="fileViewButton" class="btn save-button next-button">View File</a>';

    },
    _init: function () {
        console.log("SMNLOG :: ---------- quotation widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.quotationCategoryItemListSize > 0) { // if update
            $.each(self.options.quotationCategoryItemList, function (index, categoryItem) {
                self.addLineItemForCategory(true, categoryItem);
            });
            self.addPlusIconForTheLastItem();
        } else {
            self.addLineItemForCategory(true, self.options.categoryItem);
            self.addPlusIconForTheLastItem();
        }

        self.uiEventInitialization();

        if (self.options.viewOnly == true){
            self.disableForViewOnly();
        }

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
                'preparedBy.username': {
                    required: true
                }
            }
        };
        self.el.quotationForm.validate(validateJson);

        // Add dynamic validation for newly added line items
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("categoryName", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("description", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("addressName", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("amount", {email:true, required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("comments", {required: true});
    },
    uiEventInitialization: function () {
        var self = this;

        self.el.submitButton.on('click', function(){
            self.el.rfqForm.trigger('submit');
        });

        $(document).on('click', 'a.itemAddButton', function () {
            self.addLineItemForCategory(true, self.options.supplierItem);

            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'a.itemRemoveButton', function () {
            $(this).parent().parent().remove();
            self.addPlusIconForTheLastItem();
            self.reIndexCategoryItems();
        });
    },
    reIndexCategoryItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.categoryLineItemDiv.find('div.form-group').each(function(){
            name = 'quotationCategoryItemList[' + index + ']';
            $(this).find('div').find('input.categoryId').attr("name", name + ".id");
            $(this).find('div').find('input.categoryName').attr("name", name + ".categoryName");
            $(this).find('div').find('input.description').attr("name", name + ".description");
            $(this).find('div').find('input.amount').attr("name", name + ".amount");
            $(this).find('div').find('input.comments').attr("name", name + ".comments");

            index++;
        });
    },
    addLineItemForCategory: function (isPlusIcon, item) {
        var self = this;
        //dynamic row creation
        var index = self.el.categoryLineItemDiv.find('div.form-group').length;

        var $rowToAppend = '<div class="form-group row" data-attr-index="'+index+'">'
            + '<div class="col-md-3">'
            + '<input type="text" name="quotationCategoryItemList[' + index + '].id" class="categoryId" style="display: none;" value="' + item.id + '"/>'
            + '<input type="text" name="quotationCategoryItemList[' + index + '].categoryName" value="' + item.categoryName + '" class="form-control categoryName" placeholder="Category Name"/>'
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="quotationCategoryItemList[' + index + '].description" value="' + item.description + '" class="form-control description" placeholder="Description"/>'
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="quotationCategoryItemList[' + index + '].amount" value="' + item.amount + '" class="form-control amount" placeholder="Amount"/>'
            + '</div>'
            + '<div class="col-md-2">'
            + '<textarea name="quotationCategoryItemList[' + index + '].comments" value="' + item.comments + '" class="form-control comments" placeholder="Comments"/>'
            + '</div>'
            + '<div class="col-md-1 itemAddRemoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.categoryLineItemDiv.append($rowToAppend);
        self.el.categoryLineItemDiv.find('div.form-group:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.removeButton);
    },
    addPlusIconForTheLastItem: function () {
        var self = this;
        if(self.el.categoryLineItemDiv.children().length == 1){
            self.el.categoryLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.addButton);
        }
        else{
            self.el.categoryLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.removeButton + self.el.addButton);
        }
    },
    addLineItemForFabQuotation: function (isPlusIcon, item) {
        var self = this;
        //dynamic row creation
        var index = self.el.fabQuotationLineItemDiv.find('div.form-group').length;

        var $rowToAppend = '<tr data-attr-index="'+index+'">'
            + '<td>'
            + '<input type="text" name="quotationCategoryItemList[' + index + '].id" class="categoryId" style="display: none;" value="' + item.id + '"/>'
            + '<input type="text" name="quotationCategoryItemList[' + index + '].categoryName" value="' + item.categoryName + '" class="form-control categoryName" placeholder="Category Name"/>'
            + '</td>'

            + '<div class="col-md-2">'
            + '<input type="text" name="quotationCategoryItemList[' + index + '].description" value="' + item.description + '" class="form-control description" placeholder="Description"/>'
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="quotationCategoryItemList[' + index + '].amount" value="' + item.amount + '" class="form-control amount" placeholder="Amount"/>'
            + '</div>'
            + '<div class="col-md-2">'
            + '<textarea name="quotationCategoryItemList[' + index + '].comments" value="' + item.comments + '" class="form-control comments" placeholder="Comments"/>'
            + '</div>'
            + '<div class="col-md-1 itemAddRemoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.fabQuotationLineItemDiv.append($rowToAppend);
        self.el.fabQuotationLineItemDiv.find('div.form-group:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.removeButton);
    },
    addPlusIconForTheLastFabQuotationItem: function () {
        var self = this;
        if(self.el.fabQuotationLineItemDiv.children().length == 1){
            self.el.fabQuotationLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.addButton);
        }
        else{
            self.el.fabQuotationLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.removeButton + self.el.addButton);
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
