$.widget("forecast.productionPlan", {
    options: {
        serviceList: undefined,
        serviceItemList: undefined,
        messages: undefined,
        viewOnly :undefined,
        serviceItem : {
            id: '',
            code: '',
            days: '',
            yield: '',
            service: {
                id: '',
                code: ''
            }
        }
    },
    _create: function () {
        console.log("SMNLOG :: ---------- productionPlan widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        self.data.serviceMap = {};

        if (self.options.serviceItemList != 'undefined') {
            self.options.serviceItemListSize = self.options.serviceItemList.length;
        }

        if (self.options.serviceList != 'undefined') {
            $.each(self.options.serviceList, function(index, service){
                self.data.serviceMap[service.id] = service;
            });
        }

        // UI element Initialization
        self.el.productionPlanForm = $("#production_plan_form");
        self.el.serviceLineItemDiv = $(".service-line-item-div");
        self.el.productionPlanTotalDays = $("#productionPlanTotalDays");
        self.el.productionPlanTotalWeeks = $("#productionPlanTotalWeeks");
        self.el.customSelect = $(".custom-select");
        self.el.customServiceSelect = $(".customServiceSelect");
        self.el.submitButton = $("#submitButton");
        self.el.endToEndYield = $("#endToEndYield");

        self.el.gobackButton = '<a href="/admin/productionPlanList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<a type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.removeButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';

    },
    _init: function () {
        console.log("SMNLOG :: ---------- productionPlan widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.serviceItemListSize > 0) {
            $.each(self.options.serviceItemList, function (index, serviceItem) {
                self.addLineItemForService(true, serviceItem);
            });
            self.addPlusIconForTheLastItem();
        } else {
            self.addLineItemForService(true, self.options.serviceItem);
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
                name: {
                    required: true,
                    maxlength: 25
                },
                totalDays: {
                    required: true,
                    number: true
                },
                totalWeeks: {
                    required: true,
                    number: true
                },
                endToEndYield: {
                    required: true,
                    number: true,
                    min: 0,
                    max: 100
                }
            },
            messages: {
            },
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };
        self.el.productionPlanForm.validate(validateJson);

        // Add dynamic validation for newly added line items
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("customServiceSelect", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("serviceItemDays", {required: true, number:true, min: 0});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("serviceItemYield", {required: true, number:true, min: 0, max: 100, step: ".01"});
    },
    uiEventInitialization: function () {
        var self = this;
        $(document).on('click', 'a.itemAddButton', function () {
            self.addLineItemForService(true, self.options.serviceItem);

            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'a.itemRemoveButton', function () {
            $(this).parent().parent().remove();

            self.addPlusIconForTheLastItem();

            // RE-INDEX the list items, user can remove an item from middle of the list, reindex will sync the index from 0-n.
            self.reIndexServiceItems();

            //Updating total days and total weeks on remove of service line item
            self.updateTotalDaysAndWeeks();
        });

        $(document).on('keyup', '.serviceItemYield', function () {
           var totalYield = 0.0;
           var count = 0;
           $(document).find('.serviceItemYield').each(function () {
              if($(this).val() != "") {
                  totalYield += parseFloat($(this).val());
                  count++;
              }
           });
           if(count>0) {
               totalYield/=count;
           }
           self.el.endToEndYield.val(totalYield);
        });

        self.el.serviceLineItemDiv.on('keyup mouseup', '.serviceItemDays', function () {
            self.updateTotalDaysAndWeeks();
        });

        self.el.serviceLineItemDiv.on('change', '.customServiceSelect' ,function(){
            var serviceId = +$(this).val();
            var selectedElement = $(this);
            console.log("SMNLOG :: changed...."+serviceId);

            if(self.isServiceUnique(serviceId, selectedElement)){
                self.populateServiceFields(serviceId, selectedElement);
            }
            else{
                $(this).val("");
                alert("You can not select this service. It's already been selected.");
            }
        });
    },
    isServiceUnique: function(selectedServiceId, selectedElement){
        var self = this;
        var isUnique = true;
        self.el.serviceLineItemDiv.find('select.customServiceSelect').not(selectedElement).each(function () {
            var serviceId = +$(this).val();
            if(serviceId === selectedServiceId){
                isUnique = false;
            }
        });
        return isUnique;
    },
    populateServiceFields: function(serviceId, selectedElement){
        var self = this;
        var selectedService = self.data.serviceMap[serviceId];

        console.log("SMNLOG selectedService::"+JSON.stringify(selectedService));

        if(typeof selectedService != 'undefined'){
            selectedElement.parent().next().find(".serviceItemCode").val(selectedService.code || '');
        }
    },
    reIndexServiceItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.serviceLineItemDiv.find('div.form-group').each(function(){
            name = 'serviceItemList[' + index + ']';
            $(this).find('div').find('input.serviceItemId').attr("name", name + ".id");
            $(this).find('div').find('select.customServiceSelect').attr("name", name + ".service.id");
            $(this).find('div').find('input.serviceItemCode').attr("name", name + ".service.code");
            $(this).find('div').find('input.serviceItemDays').attr("name", name + ".days");
            $(this).find('div').find('input.serviceItemYield').attr("name", name + ".yield");

            index++;
        });
    },
    getServiceSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="serviceItemList[' + index + '].service.id" class="custom-select customServiceSelect" placeholder="Service">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.serviceList, function (index, item) {
            if (selectedValue == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.name + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.name + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    addLineItemForService: function (isPlusIcon, serviceItem) {
        var self = this;
        //dynamic row creation
        var index = self.el.serviceLineItemDiv.find('div.form-group').length;

        var $rowToAppend = '<div class="form-group row">'
            + '<div class="col-md-3">'
            + '<input name="serviceItemList['+index+'].id" style="display: none;" value="'+serviceItem.id+'" class="serviceItemId"/>'
            +  self.getServiceSelectBoxHtml(index, serviceItem.service.id)
            + '</div>'
            + '<div class="col-md-2">'
            + '<input name="serviceItemList['+index+'].service.code" value="'+serviceItem.service.code+'" class="form-control serviceItemCode" readonly="true"/>'
            + '</div>'
            + '<div class="col-md-3">'
            + '<input type="number" name="serviceItemList['+index+'].days"  value="'+serviceItem.days+'" class="form-control serviceItemDays"/>'
            + '</div>'
            + '<div class="col-md-3">'
            + '<input type="number" step="any" name="serviceItemList['+index+'].yield"  value="'+serviceItem.yield+'" class="form-control serviceItemYield"/>'
            + '</div>'
            + '<div class="col-md-1 itemAddRemoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.serviceLineItemDiv.append($rowToAppend);
        self.el.serviceLineItemDiv.find('div.form-group:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.removeButton);
    },
    addPlusIconForTheLastItem: function () {
        var self = this;
        if(self.el.serviceLineItemDiv.children().length == 1){
            self.el.serviceLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.addButton);
        }
        else{
            self.el.serviceLineItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.removeButton + self.el.addButton);
        }
    },
    updateTotalDaysAndWeeks: function () {
        var self = this;
        var totalDays = 0;

        self.el.serviceLineItemDiv.find('input.serviceItemDays').each(function () {
            totalDays += +$(this).val();
        });

        var totalWeeks = (totalDays/7).toFixed(2);

        self.el.productionPlanTotalDays.val(totalDays);
        self.el.productionPlanTotalWeeks.val(totalWeeks);
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.productionPlanForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.productionPlanForm.find('select').attr("disabled", true);
        self.el.productionPlanForm.find('a[type="button"]').hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.productionPlanForm.attr("href", "#");
    },
    destroy: function () {
    }
});
