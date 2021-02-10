$.widget("forecast.reviewProcessModuleWidget", {
    options: {
        moduleList: undefined,
        messages: undefined,
        reviewProcessList : [{'id':'1','value':'rp-1'},{'id':'2','value':'rp-2'},{'id':'3','value':'rp-3'}]
    },
    _create: function () {
        console.log("ASLOG :: ---------- review process module widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};

        if (self.options.moduleList != 'undefined') {
            self.options.moduleListSize = self.options.moduleList.length;
        }

        // UI element Initialization
        self.el.reviewerProcessLineItemDiv = $("#reviewProcessModuleDiv");
        self.el.submitButton = $("#submitButton");
        self.el.rpmForm = $("#rpm_form");

        self.el.addButton = '<a type="button" class="itemAddButtonRPM"><i class="fa fa-plus fa-xs"></i></a>';
        self.el.removeButton = '<a type="button" class="itemRemoveButtonRPM"><i class="fa fa-minus fa-xs"></i></a>';
    },
    _init: function () {
        console.log("ASLOG :: ---------- review process module init ----------");
        var options = this.options;
        var self = this;

        if (self.options.moduleListSize > 0) {
            self.tableCreate();
        }

        self.el.submitButton.on('click', function(){
            self.el.rpmForm.trigger('submit');
        });

        $(document).on('click', 'a.itemAddButtonRPM', function () {

            var lineItemDiv = $(this).parent().parent().find('div.dynamicLineItemElements');
            var index1 = $(this).closest('tr').attr('data-attr-index');
            var clickIndex = $(this).parent().parent().parent().find('td.moduleIndex').html();
            var reviewProcessModuleId = self.options.moduleList[index1].id;

            var index2 = $(this).closest('tr').find('div.dynamicLineItemElements').children().length;

            var item = {
                id : '',
                isDefault : false,
                reviewProcess : '',
                reviewProcessModule : reviewProcessModuleId
            };
            if(lineItemDiv.children().length == 0) {
                $(this).parent().parent().find('div.dynamicLineItemDivHeader').html(self.addLineItemHeader());
                item.isDefault = true;
            }
            lineItemDiv.append(self.addLineItem(index1,index2,item));
        });

        $(document).on('click', 'a.itemRemoveButtonRPM', function () {
            if($(this).closest('tr').find('div.dynamicLineItemElements').children().length  == 1) {
                $(this).closest('tr').find('div.dynamicLineItemDivHeader').empty();
            }
            var baseIndex = $(this).closest('tr').attr('data-attr-index');
            var parent = $(this).closest('tr');
            $(this).parent().parent().remove();

            self.reIndexLineItems(parent,baseIndex);
        });

        $(document).on("change", '.allCheckboxFilter', function () {

            if(this.checked){
                $(this).closest('tr').find('.allCheckboxFilter').not($(this)).prop("checked", false);
            }
        });

    },
    reIndexLineItems : function (parent,baseIndex) {
        var self = this;
        var index = 0;
        var name = '';

        $(parent).find('div.dynamicLineItemDiv').each(function () {
            name = 'reviewProcessModuleList[' + baseIndex + '].reviewProcessItemList[' + index +']';
            $(this).find('input.reviewProcessModuleItemId').attr("name", name + ".id");
            $(this).find('input.reviewProcessModule').attr("name", name + ".reviewProcessModule.id");
            $(this).find('select.reviewProcess').attr("name", name + ".reviewProcess");
            $(this).find('input.allCheckboxFilter').attr("name", name + ".isDefault");

            index++;
        });
    },
    getSelectBoxForReviewProcess: function (list, selectedItem, name, cls) {
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
    addLineItem: function (index1,index2,item) {
        var self = this;
        var rowToAppend = '<div class="pt-1 row dynamicLineItemDiv">'
            + '<div class="col-md-4">'
            + '<input type="text" name="reviewProcessModuleList[' + index1 + '].reviewProcessItemList[' + index2 +'].id" class="reviewProcessModuleItemId" style="display: none;" value="' + item.id + '"/>'
            + '<input type="text" name="reviewProcessModuleList[' + index1 + '].reviewProcessItemList[' + index2 +'].reviewProcessModule.id" class="reviewProcessModule" style="display: none;" value="' + item.reviewProcessModule + '"/>'
            + self.getSelectBoxForReviewProcess(self.options.reviewProcessList,item.reviewProcess,'reviewProcessModuleList[' + index1 + '].reviewProcessItemList[' + index2 +'].reviewProcess'  ,'reviewProcess')
            + '</div>'
            + '<div class="col-md-4 text-center pt-1">';

        if(item.isDefault) {
            rowToAppend += '<input type="checkbox" name="reviewProcessModuleList[' + index1 + '].reviewProcessItemList[' + index2 +'].isDefault" class="allCheckboxFilter" checked="checked"/>'
        } else {
            rowToAppend += '<input type="checkbox" name="reviewProcessModuleList[' + index1 + '].reviewProcessItemList[' + index2 +'].isDefault" class="allCheckboxFilter"/>'
        }

        rowToAppend += '</div>';
        rowToAppend+= '<div class="col-md-4 itemAddRemoveButtonDiv">';

        rowToAppend +=self.el.removeButton;
        rowToAppend += '</div>';
        rowToAppend += '</div>';
        return rowToAppend;
    },
    addLineItemHeader : function () {
        var html = '';
        html += '<div class="row">'
            + '<div class="col-md-4 text-center">'
            + 'Review Process'
            + '</div>'
            + '<div class="col-md-4 text-center">'
            + 'Default'
            + '</div>'
            + '<div class="col-md-4 text-center">'
            + ''
            + '</div>';
        html += '</div>';
        return html;
    },
    tableCreate: function () {
        var self = this;
        var tableHtml = "";
        var tableHead = '';
        var tableBody = '';
        var tableHeader= ['SL#','Module Name','Review Process'];
        tableHead += '<thead>';
        tableHead += '<tr>';
        $.each(tableHeader, function (index, item) {
            tableHead += '<th>' + item + '</th>';
        });

        tableHead += '</tr>';
        tableHead += '</thead>';
        tableBody += '<tbody>';
        $.each(self.options.moduleList, function (index, item) {
            tableBody += '<tr data-attr-index="'+index+'" id="'+index+'">';
            tableBody += '<td class="moduleIndex">' + (index+1) + '</td>';
            tableBody += '<td>' + '<div>' + item.reviewProcessModuleName + '</div>'
                       + '<input type="text" name="reviewProcessModuleList[' + index + '].id" class="reviewProcessModuleId" style="display: none;" value="' + item.id + '"/>'
                       + '<input type="text" name="reviewProcessModuleList[' + index + '].reviewProcessModuleName" class="reviewProcessModuleName" style="display: none;" value="' + item.reviewProcessModuleName + '"/>'
                       + '</td>';
            tableBody += '<td>';
            tableBody += '<div class="p-2 text-right">';
            tableBody +=  self.el.addButton;
            tableBody += '</div>';
            tableBody += '<div class="pl-3 dynamicLineItemDivHeader">';
            if(item.reviewProcessItemList.length > 0) {
                tableBody += self.addLineItemHeader();
            }
            tableBody += '</div>';
            tableBody += '<div class="pl-3 dynamicLineItemElements">';
            $.each(item.reviewProcessItemList, function (index2, it) {
                tableBody+=self.addLineItem(index,index2,it);
            });
            tableBody += '</div>';
            tableBody += '</td>';
            tableBody += '</tr>';
         });
        tableBody += '</tbody>';


        tableHtml += '<table class="table da-report-grid-table">';
        tableHtml += tableHead;
        tableHtml += tableBody;
        tableHtml += '</table>';

        self.el.reviewerProcessLineItemDiv.html(tableHtml);
    },
    destroy: function () {
    }
});
