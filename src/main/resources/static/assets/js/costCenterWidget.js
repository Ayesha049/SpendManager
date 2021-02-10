$.widget("forecast.costCenter", {
    options: {
        lineItemList: undefined,
        costCenterDepartmentList: undefined,
        costCenterOrganizationJsonArray: undefined,
        messages: undefined,
        viewOnly :undefined,
        selectedDepartment: undefined,
        selectedOrganization: undefined,
        departmentElement: undefined,
        organizationElement: undefined,
        addCostCenterDepartment: undefined,
        addCostCenterOrganization: undefined,
        lineItem:
            {   id: '',
                fromAmount: '',
                toAmount: '',
                reviewerList: []
            }
    },
    _create: function () {
        console.log("IMNLOG :: ---------- Cost Center widget create ----------");
        var self = this;
        self.el = {};
        self.data = {};

        console.log(self.options.costCenterOrganizationJsonArray);

        if(self.option.lineItemList != 'undefined'){
            self.options.lineItemListSize = self.options.lineItemList.length;
        }

        // UI element Initialization
        self.el.costCenterForm = $("#cost_center_form");
        self.el.addRuleButton = $("#addRuleButton");
        self.el.dynamicRowDiv = $("#dynamicRowDiv");
        self.el.submitButton = $("#submitButton");
        self.el.departmentElement = $(".ccDeptSelect");
        self.el.organizationElement = $(".ccOrgSelect");
        self.el.gobackButton = '<a href="/admin/costCenterList" id="submitButton" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';

    },
    _init: function () {
        console.log("IMNLOG :: ---------- Cost Center widget init ----------");
        var self = this;
        self.initiateFormValidation();
        self.generateCostCenterDepartmentSelectBoxHtml(self.options.selectedDepartment);
        self.generateCostCenterOrganizationSelectBoxHtml(self.options.selectedOrganization);

        if (self.options.lineItemListSize > 0) {
            $.each(self.options.lineItemList, function (index, lineItem) {
                self.addLineItemForReviewer(lineItem);
            });
        }else{
            self.addLineItemForReviewer(self.options.lineItem);
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
                costCenterNumber: {
                    required: true,
                    maxlength: 25
                },
                department: {
                    required: true
                }
            },
            messages: {
            },
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };
        self.el.costCenterForm.validate(validateJson);

    },
    uiEventInitialization: function () {
        var self = this;

        self.options.addCostCenterDepartment.on('click', function(){
            var selectedDepartment = +self.el.departmentElement.val();
            self.generateNewDepartmentFormHtml(selectedDepartment);
        });

        self.options.addCostCenterOrganization.on('click', function(){
            var selectedOrganization = +self.el.organizationElement.val();
            self.generateNewOrganizationFormHtml(selectedOrganization);
        });

        self.el.addRuleButton.on('click', function (){
            self.addLineItemForReviewer(self.options.lineItem);
        });

        $(document).on('click', 'i.removeReviewer', function () {
            console.log("IMNLOG :: ---------- remove reviewer ----------");
            var parentElement = $(this).closest('div.line-item-div');
            $(this).closest('tr.reviewerRow').remove();
            self.reIndexReviewers(parentElement, true);
        });

        $(document).on('click', 'i.removeLineItem', function () {
            console.log("IMNLOG :: ---------- remove Line Item ----------");
            $(this).closest('div.line-item-div').remove();
            self.reIndexLineItems();
        });


    },
    initializeSortable: function(){
        var self = this;
        $(document).find("tbody.sortable").sortable({
            update: function(event, ui) {
                self.reIndexReviewers($(event.target).closest('div.line-item-div'), true);
            }
        });
    },
    reIndexLineItems: function () {
        var self = this;
        var lineItemIndex = 0;
        var name = '';
        $(document).find('div.line-item-div').each(function () {
            name = 'costCenterLineItemList[' + lineItemIndex + ']';
            $(this).attr("attr-index", lineItemIndex);
            $(this).find('input.line-item-id').attr("name", name + ".id");
            $(this).find('input.from-amount').attr("name", name + ".fromAmount");
            $(this).find('input.to-amount').attr("name", name + ".toAmount");

            self.reIndexReviewers($(this), false);
            lineItemIndex++;
        });
    },
    reIndexReviewers: function (selectedElement, positionChange) {
        var self = this;
        var reviewerIndex = 0;
        var lineItemIndex = $(selectedElement).attr('attr-index');
        var bindNamePrefix = 'costCenterLineItemList[' + lineItemIndex + '].costCenterReviewerList';
        var name = '';
        $(selectedElement).find('table.reviewerTable > tbody > tr').each(function () {
            name = bindNamePrefix + '[' + reviewerIndex + ']';
            $(this).find('input.reviewer-id').attr("name", name + ".id");
            $(this).find('input.reviewer-user-id').attr("name", name + ".reviewer.id");
            $(this).find('input.reviewer-position').attr("name", name + ".position");
            if(positionChange){
                $(this).find('input.reviewer-position').val(reviewerIndex + 1);
            }
            $(this).find('span.reviewer-serial-number').html(reviewerIndex + 1);

            reviewerIndex++;
        });
    },
    generateCostCenterDepartmentSelectBoxHtml: function(selectedDepartment){
        var self = this;
        var html = '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.costCenterDepartmentList, function (index, item) {
            if (selectedDepartment == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.costCenterDepartment + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.costCenterDepartment + '</option>';
            }
        });

        console.log('html: '+html);

        self.el.departmentElement.empty().append(html);
    },

    generateCostCenterOrganizationSelectBoxHtml: function(selectedOrganization){
        var self = this;
        var html = '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.costCenterOrganizationJsonArray, function (index, item) {
            if (selectedOrganization == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.name+ '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.name + '</option>';
            }
        });

        console.log('html: '+html);

        self.el.organizationElement.empty().append(html);
    },

    getSelectBoxForParentDepartment: function (list, cls) {
        var self = this;
        var html = '<select  class="form-control '+cls+'">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(list, function (index, item) {
            html += '<option value="' + item.id + '">' + item.costCenterDepartment + '</option>';
        });
        html +='</select>';
        return html;
    },
    getSelectBoxForOrganization: function (list, cls) {
        var self = this;
        var html = '<select name class="form-control '+cls+'">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(list, function (index, item) {
            html += '<option value="' + item.id + '">' + item.name + '</option>';
        });
        html +='</select>';
        return html;
    },
    generateNewOrganizationFormHtml: function(selectedDepartment){
        var self = this;
        var html='<form id="costCenterDepartmentForm">'
            +'<div class="row px-0 pt-3">'
            +'<label class="col-md-3">Organization</label>'
            +'<div class="col-md-6">'
            +'<input class="form-control" id="name" />'
            +'</div>'
            +'</div>'
            +'</form>';
        bootbox.confirm({
            message: '<b>Create New Organization:</b>'+html,
            buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-primary'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                //var isCostCenterOrganizationFormValid = $('form#costCenterOrganizationForm').valid();                if (result && !isCostCenterOrganizationFormValid){ return false; }
                //if (result && isCostCenterOrganizationFormValid) {
                    var organization = $(document).find('div.bootbox-body input#name').val();

                    Forecast.APP.startLoading();
                    $.get('/admin/saveCostCenterOrganization',
                        {
                            costCenterOrganizationName: organization,
                        },
                        function (response) {
                            if(response.status == "SUCCESS"){
                                console.log("IMNLOG:: cost center organization saved successfully. "+ JSON.stringify(response.data));
                                self.options.costCenterOrganizationJsonArray.push({
                                    id: (response.orgId).toString(),
                                    name: response.orgName,
                                });
                                self.generateCostCenterOrganizationSelectBoxHtml(selectedDepartment);
                            }
                            Forecast.APP.stopLoading();
                        }
                    );
                //}
            }
        });
        self.initiateDepartmentFormValidation();
    },
    generateNewDepartmentFormHtml: function(selectedDepartment){
        var self = this;
        var html='<form id="costCenterDepartmentForm">'
            +'<div class="row px-0 pt-3">'
            +'<label class="col-md-3">Department</label>'
            +'<div class="col-md-6">'
            +'<input class="form-control" id="name" />'
            +'</div>'
            +'</div>'
            +'<div class="row px-0 pt-3">'
            +'<label class="col-md-3">Parent Department</label>'
            +'<div class="col-md-6">'
            + self.getSelectBoxForParentDepartment(self.options.costCenterDepartmentList, "deptCls")
            +'</div>'
            +'</div>'
            +'<div class="row px-0 pt-3">'
            +'<label class="col-md-3">Organization</label>'
            +'<div class="col-md-6">'
            + self.getSelectBoxForOrganization(self.options.costCenterOrganizationJsonArray, "orgCls")
            +'</div>'
            +'</div>'
            +'</form>';
        bootbox.confirm({
            message: '<b>Create New Cost Center Department:</b>'+html,
            buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-primary'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                var isCostCenterDepartmentFormValid = $('form#costCenterDepartmentForm').valid();
                if (result && !isCostCenterDepartmentFormValid){ return false; }
                if (result && isCostCenterDepartmentFormValid) {
                    var name = $(document).find('div.bootbox-body input#name').val();
                    var parentDepartment = $(document).find('div.bootbox-body select.deptCls').val();
                    var organization = $(document).find('div.bootbox-body select.orgCls').val();

                    Forecast.APP.startLoading();
                    $.get('/admin/saveCostCenterDepartment',
                        {
                            name: name,
                            parentDepartmentId: +parentDepartment,
                            costCenterOrganizationId: +organization,
                        },
                        function (response) {
                            if(response.status == "SUCCESS"){
                                console.log("IMNLOG:: cost center department saved successfully. "+ JSON.stringify(response.data));
                                self.options.costCenterDepartmentList.push({
                                    id: response.deptId,
                                    costCenterDepartment: response.deptName,
                                });
                                self.generateCostCenterDepartmentSelectBoxHtml(selectedDepartment);
                            }
                            Forecast.APP.stopLoading();
                        }
                    );
                }
            }
        });
        self.initiateDepartmentFormValidation();
    },
    initiateDepartmentFormValidation: function(){
        var self=this;
        var validateJson = {
            rules: {
                name: {
                    required: true,
                    maxlength: 25,
                    alphanumeric: true,
                    isUnique: true
                },
                parentDepartment: {
                    required: true,
                    maxlength: 25,
                    alphanumeric: true,
                    isUnique: true
                },
                organization: {
                    required: true,
                    maxlength: 25,
                    alphanumeric: true,
                    isUnique: true
                }
            },
            messages: {

            },
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };

        $.validator.addMethod("alphanumeric", function(value, element) {
            return /^[a-z0-9\-\s]+$/i.test(value);
        }, "Must contain only letters, numbers, or dashes.");

        $.validator.addMethod("isUnique", function(value, element) {
            var name = $(document).find('div.bootbox-body input#name').val();
            var parentDepartment = $(document).find('div.bootbox-body select#parentDepartment').val();
            var organization = $(document).find('div.bootbox-body select#organization').val();

            var isInfoUnique = true;
            $.each(self.options.costCenterDepartmentList, function (index, item){
                if(item.name == name && item.parentDepartment == parentDepartment && item.organization == organization) isInfoUnique = false;
            });
            return isInfoUnique;
        }, "This information already exists.");

        $(document).find('form#costCenterDepartmentForm').validate(validateJson);
    },
    generateReviewerTableRow: function (lineItemIndex, reviewerIndex, item) {
        var self = this;
        var html = '';
        html += '<tr class="reviewerRow" style="cursor: pointer">';

        html += '<td>';
        html += '<input class="reviewer-id" name="costCenterLineItemList[' + lineItemIndex + '].costCenterReviewerList[' + reviewerIndex + '].id" value="' + item.id + '" style="display: none">';
        html += '<input class="reviewer-user-id" name="costCenterLineItemList[' + lineItemIndex + '].costCenterReviewerList[' + reviewerIndex + '].reviewer.id" value="' + item.userId + '" style="display: none">';
        html += '<input class="reviewer-position" name="costCenterLineItemList[' + lineItemIndex + '].costCenterReviewerList[' + reviewerIndex + '].position" value="' + item.position + '" style="display: none">';
        html += '<span class="reviewer-serial-number">' + (reviewerIndex + 1) + '</span>. ' + item.userName;
        html += '</td>';

        html += '<td class="text-right">';
        html += '<i class="fa fa-trash-alt removeReviewer" style="color: #c80d24" aria-hidden="true"></i>';
        html += '</td>';
        html += '</tr>';

        return html;
    },
    populateExistingReviewer: function (lineItemIndex, reviewerList) {
        var self = this;
        var html = '<table class="reviewerTable">';
        html += '<tbody class="sortable">';
        $.each(reviewerList, function (index, item) {
            html += self.generateReviewerTableRow(lineItemIndex, index, item);
        });

        html += '</tbody>';
        html += '</table>';
        return html;
    },
    makeInitialReviewerHtmlDiv: function (lineItemIndex, reviewerList) {
        var self = this;
        var html = '<div class="row card py-2 rounded" style="background-color: #F7F7F7;">'
            + '<div class="col-md-12 px-3 pb-3 pt-2">'
            + '<div class="row">'
            + '<div class="innerTableHeader">'
            + '<label style="margin-bottom: 0px;">' + self.options.messages.reviewerHeader + '</label>'
            + '</div>'
            + '</div>'
            + ' </div>'
            + '<div class="col-md-12 px-3 py-1">'
            + '<div class="row">'
            + '<div class="col-md-12 px-3">'
            + '<input type="text" class="form-control searchReviewer" id="searchReviewer" placeholder="Search"/>'
            + '</div>'
            + '<div class="col-md-12 px-3">'
            + self.populateExistingReviewer(lineItemIndex, reviewerList)
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';

        return html;
    },
    addLineItemForReviewer: function (lineItem) {
        var self = this;
        var index = self.el.dynamicRowDiv.find('div.line-item-div').length;
        var $rowToAppend = '';

        $rowToAppend += '<div class="col-md-3 lineItemBorder line-item-div" attr-index="'+ index+ '">';
        $rowToAppend += '<div class="text-right" style="position: absolute; top: 2px; right: 2px">';
        $rowToAppend += '<span><i class="fa fa-times removeLineItem" style="color: #c80d24; cursor: pointer; font-size: 20px !important" aria-hidden="true"></i></span>';
        $rowToAppend += '</div>';
        $rowToAppend += '<div class="row">';
        $rowToAppend += '<div class="col-md-2 text-left pl-0">';
        $rowToAppend += '<label class="col-form-label"><b>Amount:</b></label>';
        $rowToAppend += '</div>';
        $rowToAppend += '<div class="col-md-5 pr-0">';
        $rowToAppend += '<div class="form-group row">';
        $rowToAppend += '<label class="col-md-3 col-form-label">From</label>';
        $rowToAppend += '<div class="col-md-7 pr-0">';
        $rowToAppend += '<input class="line-item-id" name="costCenterLineItemList[' + index + '].id" value="' + lineItem.id + '" style="display: none">';
        $rowToAppend += '<input name="costCenterLineItemList[' + index + '].fromAmount" value="' + lineItem.fromAmount + '" class="form-control from-amount" />';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '<div class="col-md-5 pr-0">';
        $rowToAppend += '<div class="form-group row">';
        $rowToAppend += '<label class="col-md-3 col-form-label">To</label>';
        $rowToAppend += '<div class="col-md-7 pr-0">';
        $rowToAppend += '<input name="costCenterLineItemList[' + index + '].toAmount" value="' + lineItem.toAmount + '" class="form-control to-amount" />';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += self.makeInitialReviewerHtmlDiv(index, lineItem.reviewerList);
        $rowToAppend += '</div>';

        self.el.dynamicRowDiv.append($rowToAppend);

        self.populateAutoCompleteForReviewer();
        self.initializeSortable();
    },
    populateAutoCompleteForReviewer: function () {
        var self = this;
        var list = [];
        $.get('/admin/getAllReviewerForAutocomplete', {}, function (result) {
            $.each(result, function (index, item) {
                list.push({
                    label: item.name,
                    value: item.id
                })
            });
        });
        console.log("IMNLOG list::" + JSON.stringify(list));

        self.el.costCenterForm.find('.searchReviewer').autocomplete({
            classes: {
                "ui-autocomplete": "highlight"
            },
            source: function (request, response) {
                var results = $.ui.autocomplete.filter(list, request.term);
                response(results.slice(0, Forecast.APP.MAX_AUTOCOMPLETE_RESULT_SIZE));
            },
            select: function (event, ui) {
                console.log("IMNLOG autocomplete selected value::" + JSON.stringify(ui.item));
                var parentElement = $(event.target).closest('div.line-item-div');
                event.preventDefault();
                var isUnique = true;
                parentElement.find('input.reviewer-user-id').each(function () {
                    if ($(this).val() == ui.item.value) isUnique = false;
                });
                if (isUnique) {
                    var index = parentElement.find('table.reviewerTable > tbody > tr').length;
                    var item = {
                        id: '',
                        userId: ui.item.value,
                        userName: ui.item.label,
                        position: index + 1
                    };
                    var htmlToAppend = self.generateReviewerTableRow(parentElement.attr('attr-index') , index, item);
                    parentElement.find('table.reviewerTable > tbody').append(htmlToAppend);
                    parentElement.find('input#searchReviewer').val('');
                }
                else {
                    bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(self.options.messages.reviewerNotUniqueMessage))
                    parentElement.find('input#searchReviewer').val('');
                }
                return false;
            }
        });
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.costCenterForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.costCenterForm.find('select').attr("disabled", true);
        self.el.costCenterForm.find('#addCostCenterOrganization').hide();
        self.el.costCenterForm.find('#addCostCenterDepartment').hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.costCenterForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.costCenterForm.attr("href", "#");
    },

    destroy: function () {
    }
});
