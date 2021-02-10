$.widget("forecast.parameter", {
    options: {
        lineItemList: undefined,
        tapeOutList: undefined,
        productionPlanList: undefined,
        messages: undefined,
        viewOnly :undefined,
        lineItem: {
            id: '',
            tapeOut: '',
            productionPlan: ''
        }

    },
    _create: function () {
        console.log("SMNLOG :: ---------- Parameter widget create ----------");
        var self = this;
        self.el = {};
        self.data = {};
        self.data.tapeOutMap = {};
        self.data.productionPlanMap = {};

        if (self.options.lineItemList != 'undefined') {
            self.options.lineItemListSize = self.options.lineItemList.length;
        }

        console.log(self.options.productionPlanList);

        if(self.options.tapeOutList != undefined) {
            $.each(self.options.tapeOutList, function (index, tapeOut) {
                self.data.tapeOutMap[tapeOut.id] = tapeOut;
            });
        }

        if(self.options.productionPlanList != undefined) {
            $.each(self.options.productionPlanList, function (index, productionPlan) {
                self.data.productionPlanMap[productionPlan.id] = productionPlan;
            });
        }

        self.el.parameterForm = $("#parameter_form");
        self.el.parameterLineItemDiv = $(".parameter-line-item-div");
        self.el.submitButton = $("#submitButton");
        self.el.showButton = $(".showButton");

        self.el.gobackButton = '<a href="/admin/parameterList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<a type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.removeButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';

    },
    _init: function () {
        console.log("SMNLOG :: ---------- Parameter widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.lineItemListSize > 0) {//update
            $.each(self.options.lineItemList, function (index, lineItem) {
                self.addLineItem(true, lineItem);
            });
            self.addPlusIconForTheLastItem();
        } else {
            self.addLineItem(true, self.options.lineItem);
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
                entryDate: {
                    required: true,
                }
            },
            messages: {
            },
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };
        self.el.parameterForm.validate(validateJson);

        // Add dynamic validation for newly added line items
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("tapeOut", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("productionPlan", {required: true});
    },
    uiEventInitialization: function () {
        var self = this;
        $(document).on('click', 'a.itemAddButton', function () {
            self.addLineItem(true, self.options.lineItem);
            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'a.itemRemoveButton', function () {
            $(this).parent().parent().remove();
            self.addPlusIconForTheLastItem();
            self.reIndexLineItems();
        });

        $(document).on('change', '.tapeOut', function() {
            var selectedId = +$(this).val();
            var selectedElement = $(this);
            if(!self.isTapeOutUnique(selectedId,selectedElement)) {
                $(this).val("");
                alert("This Tape Out has already been selected.")
            } else {
                self.showInfoIcon($(this));
            }
        });

        $(document).on('change', '.productionPlan', function() {
            self.showInfoIcon($(this));
        });

        self.el.showButton.on('click', function () {
            var html = '';
            $(document).find('div.lineItemDiv').each(function () {
                if($(this).find('.infoIcon').length >0) {
                    var tapeOut = $(this).find('.infoIcon').attr('attr-tapeOut');
                    var productionPlan = $(this).find('.infoIcon').attr('attr-productionPlan');
                    html += self.createDeviceTableAlert(self.data.tapeOutMap[tapeOut],self.data.productionPlanMap[productionPlan]);
                    html += '<br/>'
                }
            })
            if(html == '') {
                html = "No tape out selected."
            }
            bootbox.alert({
                message: html,
                size: 'large'
            });
        })

        $(document).on('click', '.infoIcon', function () {
           var tapeOut = $(this).attr('attr-tapeOut');
           var productionPlan = $(this).attr('attr-productionPlan');
           var html = self.createDeviceTableAlert(self.data.tapeOutMap[tapeOut],self.data.productionPlanMap[productionPlan]);
            bootbox.alert({
                message: html,
                size: 'large'
            });
        });

    },
    showInfoIcon: function (element) {
      var self = this;

      var tapeOut = element.closest('div.lineItemDiv').find('select.tapeOut').val();
      var productionPlan = element.closest('div.lineItemDiv').find('select.productionPlan').val();

      if(tapeOut != "" && productionPlan!="") {
          var infoIcon = '<span attr-tapeOut="'+tapeOut+'" attr-productionPlan="'+productionPlan+'" <i class="fa fa-info-circle infoIcon" style="font-size: 20px !important;"></span>';
          element.closest('div.lineItemDiv').find('div.infoIconDiv').html(infoIcon);
      }
    },
    createDeviceTableAlert: function(item, productionPlan){
        var self = this;

        var endToendYeild = parseFloat(productionPlan.endToEndYield)
        var html = '<b>Device List of TapeOut: '+ item.name+'.</b>';
        html += '<div>';
        html += '<table class="table table-striped custom-table da-grid-table">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>SL#</th>';
        html += '<th>Device Number</th>';
        html += '<th>GDPW</th>';
        html += '<th>UFG Die</th>';
        html += '<th>Fab</th>';
        html += '<th>Bump</th>';
        html += '<th>Assy</th>';
        html += '<th>Test</th>';
        html += '<th>Module</th>';
        html += '<th>End to end</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';

        $.each(item.deviceList, function (index, device){
            var ufgDie = parseFloat(parseFloat(device.gdpw) * (endToendYeild/100)).toFixed(2);
            html += '<tr>';
            html += '<th>'+(index+1)+'</th>';
            html += '<td>'+device.deviceNumber+'</td>';
            html += '<td>'+device.gdpw+'</td>';
            html += '<td>'+ufgDie+'</td>';
            html += '<td>'+productionPlan.FAB_CT+'</td>';
            html += '<td>'+productionPlan.BUMP_CT+'</td>';
            html += '<td>'+productionPlan.ASSEMBLY+'</td>';
            html += '<td>'+productionPlan.TEST_PO+'</td>';
            html += '<td>'+productionPlan.MODULE+'</td>';
            html += '<td>'+endToendYeild+'</td>';
            html += '</tr>';
        });

        html += '</tbody>';
        html += '</table>';
        html += '</div>';

        return html;
    },
    isTapeOutUnique: function (selectedId,selectedElement) {
        var self = this;

        var isUnique = true;
        self.el.parameterLineItemDiv.find('select.tapeOut').not(selectedElement).each(function() {
           if(+$(this).val() == selectedId) {
               isUnique = false;
               return false;
           }
        });
        return isUnique;
    },
    reIndexLineItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.parameterLineItemDiv.find('>div.form-group').each(function(){

            name = 'lineItemList[' + index + ']';
            $(this).find('div').find('input.parameterId').attr("name", name + ".id");
            $(this).find('div').find('select.tapeOut').attr("name", name + ".tapeOut.id");
            $(this).find('div').find('select.tapeOut').attr("name", name + ".productionPlan.id");

            index++;
        });
    },
    getSelectBoxHtml: function (list, selectedItem, name, cls) {
        var self = this;
        var html = '<select name="'+name+'" class="form-control '+cls+'">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(list, function (index, item) {
            if (selectedItem == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.name + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.name + '</option>';
            }
        });
        html +='</select>';
        return html;
    },
    addLineItem: function (isPlusIcon, selectedItem) {
        var self = this;

        var index = self.el.parameterLineItemDiv.find('>div.form-group').length;
        var parentName = 'lineItemList[' + index + ']';

        var $rowToAppend = '<div class="form-group row lineItemDiv">'
            + '<div class="col-md-3">'
            + '<input type="text" name="lineItemList[' + index + '].id" class="parameterId" style="display: none;" value="' + selectedItem.id + '"/>'
            + self.getSelectBoxHtml(self.options.tapeOutList, selectedItem.tapeOut, parentName+'.tapeOut.id', 'tapeOut')
            + '</div>'
            + '<div class="col-md-3">'
            + self.getSelectBoxHtml(self.options.productionPlanList, selectedItem.productionPlan, parentName+'.productionPlan.id', 'productionPlan')
            + '</div>'
            + '<div class="col-md-1 pt-2 infoIconDiv">'
            + '</div>'
            + '<div class="col-md-1 itemAddRemoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.parameterLineItemDiv.append($rowToAppend);
        self.el.parameterLineItemDiv.find('>div.form-group:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.removeButton);
    },
    addPlusIconForTheLastItem: function () {
        var self = this;
        if(self.el.parameterLineItemDiv.children().length == 1){
            self.el.parameterLineItemDiv.find('>div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.addButton);
        }
        else{
            self.el.parameterLineItemDiv.find('>div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.removeButton + self.el.addButton);
        }
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.parameterForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.parameterForm.find('select').attr("disabled", true);
        self.el.parameterForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.parameterForm.attr("href", "#");
    },
    destroy: function () {
    }
});
