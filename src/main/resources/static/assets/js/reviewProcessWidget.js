$.widget("forecast.reviewProcessWidget", {
    options: {
        viewOnly: undefined,
        reviewProcessItemList: undefined,
        reviewerList: undefined,
        reviewerLevelList: undefined,
        bindNamePrefix: undefined,
        reviewProcessItem: {
            id: '',
            orderNo: '',
            description: '',
            reviewProcessLevelName: '',
            isCurrentState: '',
            reviewProcessReviewerItemList: []
        }
    },
    _create: function () {
        console.log("SMNLOG :: ---------- review process widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        self.data.autoCompleteDataList = [];

        console.log("SMNLOG reviewProcessItemList::"+JSON.stringify(self.options.reviewProcessItemList));

        console.log("SMNLOG reviewerList::" + JSON.stringify(self.options.reviewerList));
        if (self.options.reviewProcessItemList != 'undefined') {
            self.options.reviewProcessItemListSize = self.options.reviewProcessItemList.length;
        }

        // UI element Initialization
        self.el.widgetBaseElement = self.options.widgetBaseElement;
        self.el.submitForReviewButtonElement = self.options.submitForReviewButtonElement;
        self.el.acceptRejectDivElement = self.options.acceptRejectDivElement;
        self.el.reviewerLevelLineItemDiv = $(".reviewer-level-line-item-div");
        // self.el.moduleName = $("#moduleName");

        self.el.addButton = '<a type="" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.removeButton = '<a type="" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';
    },
    _init: function () {
        console.log("SMNLOG :: ---------- review process init ----------");
        var options = this.options;
        var self = this;

        self.getAutoCompleteData();

        // self.el.moduleName.select2({minimumResultsForSearch: -1, width: '100%'});
        self.uiEventInitialization();

        if (self.options.reviewProcessItemListSize > 0) {
            $.each(self.options.reviewProcessItemList, function (index, item) {
                self.addLineItem(true, item);
            });
            self.addPlusIconForTheLastItem();
        } else {
            self.addLineItem(true, self.options.reviewProcessItem);
            self.addPlusIconForTheLastItem();
        }

        if (self.options.viewOnly) {
        }

    },
    uiEventInitialization: function () {
        var self = this;
        $(document).on('click', 'a.itemAddButton', function () {
            self.addLineItem(true, self.options.reviewProcessItem);
            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'a.itemRemoveButton', function () {
            console.log("SMNLOG :: ---------- remove reviewer ----------");
            $(this).parent().parent().remove();
            self.addPlusIconForTheLastItem();
            self.reIndexItems();
        });

        $(document).on('click', 'i.removeReviewer', function () {
            console.log("SMNLOG :: ---------- remove reviewer ----------");
            var $table = $(this).closest('table.reviewerTable');
            $(this).closest('tr').remove();
            self.reIndexItemChilds($(this).attr('parent-index'), $table);
        });
    },
    getAutoCompleteData: function () {
        var self = this;
        $.get('/admin/getAllReviewerForAutocomplete', {}, function (result) {
            $.each(result, function (index, item) {
                self.data.autoCompleteDataList.push({
                    label: item.name,
                    value: item.id
                })
            });
        });
    },
    populateAutoCompleteBoxForReviewer: function ($mainDiv, parentIndex) {
        var self = this;

        console.log("SMNLOG self.data.autoCompleteDataList::" + JSON.stringify(self.data.autoCompleteDataList));

        // $('.reviewer-level-line-item-div').find('div.form-group:last').find('input.searchReviewer');

        $mainDiv.find('input.searchReviewer').autocomplete({
            classes: {
                "ui-autocomplete": "highlight"
            },
            source: function (request, response) {
                var results = $.ui.autocomplete.filter(self.data.autoCompleteDataList, request.term);
                response(results.slice(0, Forecast.APP.MAX_AUTOCOMPLETE_RESULT_SIZE));
            },
            select: function (event, ui) {
                console.log("SMNLOG autocomplete selected value::" + JSON.stringify(ui.item));
                event.preventDefault();
                var isUnique = true;
                $mainDiv.find('input.reviewer-user-id').each(function () {
                    if ($(this).val() == ui.item.value) isUnique = false;
                });
                if (isUnique) {
                    var index = $mainDiv.find('table.reviewerTable > tbody > tr').length;
                    var item = {
                        id: '',
                        reviewerId: ui.item.value,
                        reviewerName: ui.item.label,
                        orderNo:0,
                        isAccepted: ''
                    };
                    console.log("SMNLOG parentIndex::"+parentIndex + " index:"+index);
                    var htmlToAppend = self.generateReviewerTableRow(parentIndex, index, item);
                    $mainDiv.find('table.reviewerTable > tbody').append(htmlToAppend);
                    $mainDiv.find('input#searchReviewer').val('');
                }
                else {
                    alert(self.options.messages.reviewerNotUniqueMessage);
                    $mainDiv.find('input#searchReviewer').val('');
                }
                return false;
            }
        });
    },
    reIndexItems: function () {
        var self = this;
        var index = 0;
        var name = '';

        self.el.reviewerLevelLineItemDiv.find('div.lineItem').each(function() {
            name = self.options.bindNamePrefix + '[' + index + ']';

            $(this).find('input.reviewer-line-id').attr("name", name + ".id");
            $(this).find('input.item-order-no').attr("name", name + ".orderNo");
            $(this).find('select.review-process-level-name').attr("name", name + ".reviewProcessLevelName");
            $(this).find('input.can-add-reviewer').attr("name", name + ".canAddReviewer");
            $(this).find('input.is-sequential-review').attr("name", name + ".isSequentialReview");

            self.reIndexItemChilds(index, $(this).find('table.reviewerTable'));
            index++;
        });
    },
    reIndexItemChilds: function (parentIndex, $table) {
        console.log("SMNLOG reIndexItemChilds::" +parentIndex);
        var self = this;
        var index = 0;
        var name = '';

        $table.find('tbody tr').each(function() {
            console.log("SMNLOG :: tr -----------");
            name = self.options.bindNamePrefix+'['+parentIndex+'].reviewProcessReviewerItemList['+index+']';

            console.log("SMNLOG ::"+JSON.stringify($(this).find('td').eq(0).find('input.reviewer-id').val()));

            $(this).find('td').eq(0).find('input.reviewer-id').attr("name", name + ".id");
            $(this).find('td').eq(0).find('input.reviewer-order-no').attr("name", name + ".orderNo");
            $(this).find('td').eq(0).find('input.reviewer-userId').attr("name", name + ".reviewer.id");
            index++;
        });
    },
    generateReviewerTableRow: function (parentIndex, index, item) {
        var self = this;
        var html = '';
        var bindName = self.options.bindNamePrefix + '[' + parentIndex + '].reviewProcessReviewerItemList['+ index +']';
        html += '<tr style="background-color: #d3d3d340; border: 1px solid white;">';

        html += '<td>';
        html += '<input class="reviewer-id" name="' + bindName + '.id" value="' + item.id + '" style="display: none">';
        html += '<input class="reviewer-order-no" name="' + bindName + '.orderNo" value="' + (item.orderNo == 0 ? (index + 1) : item.orderNo) + '" style="display: none">';
        html += '<input class="reviewer-userId" name="' + bindName +'.reviewer.id" value="' + item.reviewerId + '" style="display: none">';
        html += '<span class="reviewer-serial-number">' + (index + 1) + '</span>. ' + item.reviewerName;
        html += '</td>';

        html += '<td class="text-right">';
        html += '<i class="fa fa-trash-alt removeReviewer" parent-index="'+parentIndex+'" style="color: #c80d24" aria-hidden="true"></i>';
        html += '</td>';

        html += '</tr>';
        return html;
    },
    getReviewerTableByList: function(parentIndex, list){
        var self = this;
        var html = '';


        $.each(list, function(index, item){
            html += self.generateReviewerTableRow(parentIndex, index, item);
        });
        return html;
    },
    addLineItem: function (isPlusIcon, item) {
        var self = this;
        var index = self.el.reviewerLevelLineItemDiv.find('div.lineItem').length;


        var $rowToAppend = '<div class="form-group row lineItem">'
            + '<div class="col-md-3">'
            + '<input type="text" name="'+ self.options.bindNamePrefix +'[' + index + '].id" class="reviewer-line-id" style="display: none;" value="' + item.id + '"/>'
            + '<input type="text" name="'+ self.options.bindNamePrefix +'[' + index + '].orderNo" class="item-order-no" style="display: none;" value="' + item.orderNo + '"/>'
            + self.getReviewerLevelSelectBoxHtml(index, item.reviewProcessLevelName)
            + '</div>'
            + '<div class="col-md-3" style="text-align: center;">'
            + '<input type="checkbox" name="'+ self.options.bindNamePrefix +'[' + index + '].canAddReviewer" class="can-add-reviewer" '+(item.canAddReviewer ? 'checked':'')+'/>'
            + '</div>'
            + '<div class="col-md-3">'

            + '<div class="col-md-12 px-3 py-1">'
            + '<div class="row">'
            + '<div class="col-md-12 px-3">'
            + '<input type="text" class="form-control searchReviewer" placeholder="Search"/>'
            + '</div>'
            + '<div class="col-md-12 innerTableDiv">'
            + '<table class="reviewerTable">'
            + '<tbody>'
            +  self.getReviewerTableByList(index, item.reviewProcessReviewerItemList)
            + '</tbody>'
            + '</table>'
            + '</div>'
            + '</div>'
            + '</div>'

            // + self.getReviewerSelectBoxHtml(index, item.defaultReviewerList)
            + '</div>'
            + '<div class="col-md-2" style="text-align: center;">'
            + '<input type="checkbox" name="'+ self.options.bindNamePrefix +'[' + index + '].isSequentialReview" class="is-sequential-review" '+(item.isSequentialReview ? 'checked':'')+'/>'
            + '</div>'
            + '<div class="col-md-1 itemAddRemoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.reviewerLevelLineItemDiv.append($rowToAppend);
        self.el.reviewerLevelLineItemDiv.find('div.form-group:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.removeButton);
        $(document).find('.default-reviewer').select2({minimumResultsForSearch: -1, width: '100%'});
        self.populateAutoCompleteBoxForReviewer(self.el.reviewerLevelLineItemDiv.find('div.form-group:last'), index);
    },
    getReviewerLevelSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="reviewProcessItemList[' + index + '].reviewProcessLevelName" class="form-control custom-select review-process-level-name" placeholder="Review Process Level Name">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.reviewerLevelList, function (index, item) {
            if (selectedValue == item) {
                html += '<option value="' + item + '" selected>' + item + '</option>';
            } else {
                html += '<option value="' + item + '">' + item + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    getReviewerSelectBoxHtml: function (index, selectedValues) {
        var self = this;
        var html = '<select class="form-control custom-select default-reviewer" multiple data-parent-index="' + index + '">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.reviewerList, function (index, item) {
            html += '<option value="' + item.id + '">' + item.username + '</option>';
        });

        html += '</select>';
        return html;
    },
    addPlusIconForTheLastItem: function () {
        var self = this;
        if (self.el.reviewerLevelLineItemDiv.children().length == 1) {
            self.el.reviewerLevelLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.addButton);
        }
        else {
            self.el.reviewerLevelLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.removeButton + self.el.addButton);
        }
    },
    destroy: function () {
    }
});
