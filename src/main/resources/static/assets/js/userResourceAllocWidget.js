
$.widget("forecast.urallocation", {
    options: {
        projectList: undefined,
        opsOrDev: undefined,
        messages: undefined,
        lineItemList: undefined,
        viewOnly :undefined,
        lineItemListSize: 0,
        urallocItem: {
            id: '',
            costCenterProject: '',
            projectType: '',
            percentage: '',
            remarks: ''
        }
    },
    _create: function () {
        console.log("ASLOG :: ---------- urallocation widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};

        // UI element Initialization
        self.el.uraForm = $("#urallocation_form");
        self.el.saveButton = $("#saveButton");
        self.el.submitButton = $("#submitButton");
        self.el.supplierLineItemDiv = $('.project-line-item-div');
        self.el.totalPercentageInput = $('#totalPercentage');

        console.log(self.options.lineItemList);

        if (self.options.lineItemList != 'undefined') {
            self.options.lineItemListSize = self.options.lineItemList.length;
        }

        self.el.addButton = '<a type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.removeButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';
        self.el.gobackButton = '<a href="/admin/userResourceAllocationList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
    },
    _init: function () {
        console.log("ASLOG :: ---------- urallocation widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.lineItemListSize > 0) { // if update
            $.each(self.options.lineItemList, function (index, urallocItem) {
                self.addLineItemForSupplier(true, urallocItem);
            });
            self.addPlusIconForTheLastItem();
        } else {
            self.addLineItemForSupplier(true, self.options.urallocItem);
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
                totalPercentage: {
                    min: 100,
                    max: 100
                }
            },
            messages: {
                totalPercentage: 'Total percentage should be 100'
            }
        };
        self.el.uraForm.validate(validateJson);

        // Add dynamic validation for newly added line items
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("costCenterProjectId", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("projectType", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("percentage", {required: true, number: true, min: 1, max: 100});
    },
    uiEventInitialization: function () {
        var self = this;

        self.el.saveButton.on('click', function(){
            $(document).find('#status').val('IN_PROGRESS');
            self.el.uraForm.trigger('submit');
        });

        self.el.submitButton.on('click', function(){
            $(document).find('#status').val('SUBMITTED');
            self.el.uraForm.trigger('submit');
        });

        $(document).on('click', 'a.itemAddButton', function () {
            self.addLineItemForSupplier(true, self.options.urallocItem);

            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'a.itemRemoveButton', function () {
            $(this).parent().parent().remove();
            self.addPlusIconForTheLastItem();
            self.reIndexSupplierItems();
            self.validatePercentage();
        });

        $(document).on('keyup', 'input.percentage', function () {
            self.validatePercentage();
        });

    },
    validatePercentage: function() {
        var self = this;
        self.el.totalPercentageInput.val(self.totalPercentageFromLineItem());
    },
    totalPercentageFromLineItem: function() {
        var totalInternal = 0;

        $(document).find('input.percentage').each(function (){
            totalInternal += parseFloat($(this).val());
        });

        return totalInternal;
    },
    reIndexSupplierItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.supplierLineItemDiv.find('div.form-group').each(function(){
            name = 'userResourceAllocationItemList[' + index + ']';
            $(this).find('div').find('input.urallocItemId').attr("name", name + ".id");
            $(this).find('div').find('select.costCenterProjectId').attr("name", name + ".costCenterProject.id");
            $(this).find('div').find('select.projectType').attr("name", name + ".projectType");
            $(this).find('div').find('input.percentage').attr("name", name + ".percentage");
            $(this).find('div').find('textarea.remarks').attr("name", name + ".remarks");

            index++;
        });
    },
    addLineItemForSupplier: function (isPlusIcon, supplierItem) {
        var self = this;
        //dynamic row creation
        var index = self.el.supplierLineItemDiv.find('div.form-group').length;
        console.log("ASOG projectItem::"+JSON.stringify(supplierItem));
        var $rowToAppend = '<div class="form-group row" data-attr-index="'+index+'">'
            + '<div class="col-md-3">'
            + '<input type="text" name="userResourceAllocationItemList[' + index + '].id" class="urallocItemId" style="display: none;" value="' + supplierItem.id + '"/>'
            + self.getSelectBox(self.options.projectList, supplierItem.costCenterProject, 'userResourceAllocationItemList[' + index + '].costCenterProject.id', 'costCenterProjectId')
            + '</div>'
            + '<div class="col-md-2">'
            + self.makeSelectBoxforOpsOrdev(self.options.opsOrDev, supplierItem.projectType, 'userResourceAllocationItemList[' + index + '].projectType', 'projectType')
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="userResourceAllocationItemList[' + index + '].percentage" value="' + supplierItem.percentage + '" class="form-control percentage" placeholder="Percentage"/>'
            + '</div>'
            + '<div class="col-md-3">'
            + '<textarea rows="2" name="userResourceAllocationItemList[' + index + '].remarks" class="form-control remarks" placeholder="Remarks">'+ supplierItem.remarks + '</textarea>'
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
    getSelectBox: function (list, selectedItem, name, cls) {
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
    makeSelectBoxforOpsOrdev: function (list, selectedItem, name, cls) {
        var self = this;
        var html = '<select name="'+name+'" class="form-control '+cls+'">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(list, function (index, item) {
            if (selectedItem == item.name) {
                html += '<option value="' + item.name + '" selected>' + item.label + '</option>';
            } else {
                html += '<option value="' + item.name + '">' + item.label + '</option>';
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

        self.el.uraForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.uraForm.find('select').attr("disabled", true);
        self.el.uraForm.find('textarea').attr("disabled", true);
        self.el.uraForm.find('a[type="button"]').not("#saveButton").hide();
        self.el.saveButton.parent().html(self.el.gobackButton);
        self.el.uraForm.attr("href", "#");
    },
    destroy: function () {
    }
});
