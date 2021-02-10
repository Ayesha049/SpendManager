$.widget("forecast.asp", {
    options: {
        dataEntryType: undefined,
        timelineFrom: undefined,
        timelineTo: undefined,
        chipsetList: undefined,
        deviceList: undefined,
        lineItemList: undefined,
        operandList: undefined,
        productType: undefined,
        SCList: undefined,
        messages: undefined,
        viewOnly :undefined,
        selectedSC : '',
        dataEntryTypeList: undefined,
        selectedDataEntryType: '',
        lineItem: {
            id: '',
            type:'',
            customer: '',
            customerName: '',
            description: '',
            deviceId: '',
            chipsetId: '',
            iPartNumberId: ''
        },
        lineItemDetail: {
            id: '',
            endDate: '',
            startDate: '',
            netPrice: '',
            timelineUnit: '',
            deviceId: '',
            chipsetId: '',
            marketingPrice: '',
            discountPrice: '',
            discountPercentage: ''
        },
        ruleItem: {
            id: '',
            operator: '',
            saturatedQuantity: '',
            newPrice: '',
            uniqueKey: '',
            quarters: [],
        },
        customer: ["WNC", "Verizon", "Movandi", "SKT", "QOR"],
        customerList: undefined,
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
        quarters: ["Q1", "Q2", "Q3", "Q4"],
        tableRowsName: [],
        colorBank: ['#33cccc','#c44dff','#e60000','#1a1aff','#00cc44','#ff6600','#1ac6ff'],
        tableHeaders: []
    },
    _create: function () {
        console.log("SMNLOG :: ---------- asp widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        self.data.deviceMap = {};
        self.data.deviceCostMap = {};
        self.data.chipsetMap = {};
        self.data.rulesPerRow = {};
        self.data.deviceChipsetMap = {};
        self.data.chipsetMapForTotalDevicePrice = {};
        self.data.chipsetLineItemData = {};
        self.data.lineItemDataMap = {};
        self.data.SCMap = {};
        self.data.SCmissingChipsetMap = {};
        self.data.SCmissingDeviceMap = {};
        self.data.SCDataMap = {};
        self.data.devicetoIpartMap = {};
        self.data.previousCustomer = '';
        self.data.missingDataEntryTypeMap = {
            'MONTHLY' : ['QUARTERLY','YEARLY'],
            'QUARTERLY' : ['YEARLY'],
            'YEARLY' : []
        };

        if(self.options.SCList != undefined) {
            $.each(self.options.SCList, function(index, item){
                self.data.SCMap[item.id] = item;
                var chipsetList = [];
                var deviceList = [];
                $.each(item.lineItemList, function(index, lineItem ) {
                    if(lineItem.chipsetId == "") {
                        deviceList.push(lineItem.deviceId);
                    } else chipsetList.push(lineItem.chipsetId);
                });
                var missingChipset = [];

                $.each(self.options.chipsetList, function(index, chipset) {
                    if(!chipsetList.includes(chipset.id)) {
                        missingChipset.push(chipset.id);
                    }
                })

                var missingDevice = [];

                $.each(self.options.deviceList, function(index, device) {
                    if(!deviceList.includes(device.id)) {
                        missingDevice.push(device.id);
                    }
                })
                self.data.SCmissingChipsetMap[item.id] = missingChipset;
                self.data.SCmissingDeviceMap[item.id] = missingDevice;
            });

        }


        console.log("SMNLOG self.options.lineItemList::"+JSON.stringify(self.options.lineItemList));
        if (self.options.lineItemList != 'undefined') {
            self.options.lineItemListSize = self.options.lineItemList.length;
        }

        if(self.options.deviceList != undefined){
            $.each(self.options.deviceList, function(index, item){
                self.data.deviceMap[item.id] = {
                    id: item.id,
                    deviceNumber: item.deviceNumber,
                    iPartNumberList: item.iPartNumberList
                }
                self.data.deviceCostMap[item.deviceNumber] = {
                    id: item.id,
                    deviceNumber: item.deviceNumber
                }
            });
        }

        if(self.options.chipsetList != undefined){
            $.each(self.options.chipsetList, function(index, item){

                var items = {};
                items["id"] = item.id;
                items["chipsetNumber"] = item.chipsetNumber;
                items["customer"] = item.customer;
                items["customerName"] = item.customerName;
                items["description"] = item.chipsetDescription;
                $.each(item.deviceList, function(index, device){
                   if(self.data.deviceChipsetMap[device.deviceNumber] == undefined) {
                       self.data.deviceChipsetMap[device.deviceNumber] = [];
                   }
                   self.data.deviceChipsetMap[device.deviceNumber].push({'chipsetNumber' : item.chipsetNumber, 'customer' : item.customer});
                });
                items["deviceList"] = item.deviceList;
                self.data.chipsetMap[item.id] = items;
            });
            //console.log("ASLOG self.data.lineItemDetailsMapForDevice::"+JSON.stringify(self.data.chipsetMap));
        }


        // UI element Initialization
        self.el.aspForm = $("#asp_form");
        self.el.id = $(document).find("#id");
        self.el.dynamicRowDiv = $("#dynamicRowDiv");
        self.el.currentASP = $("#currentASP");
        self.el.reportPreviewDiv = $("#reportPreviewDiv");
        self.el.chipsetLineItemDiv = $(".chipset-line-item-div");
        self.el.dataEntryType = $("#dataEntryType");
        self.el.daGridTable = $(".da-grid-table");
        self.el.fromDate = $("#fromDate");
        self.el.toDate = $("#toDate");
        self.el.chipsetTableCreation = $(".chipsetTableCreation");
        self.el.submitButton = $("#submitButton");
        self.el.scNumber = $("#scNumber");
        self.el.dataEntryDiv = $("#dataEntryDiv");
        self.el.scMessage = $("#scMessage");
        self.el.scMessage.hide();
        self.el.deviceCount = $("#deviceCount");
        self.el.chipsetCount = $("#chipsetCount");
        self.el.scCountinfo = $("#scCountIcon");
        self.el.missingDataModalWrapper = $(".missingDataModalWrapper");
        self.el.grossMarginPercentage = $("#grossMarginPercentage");

        self.el.gobackButton = '<a href="/admin/ASPList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<button type="button" class="btn btn-primary lineItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.removeButton = '<button type="button" class="btn btn-danger lineItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';
        self.el.rulesAddButton = '<a type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.rulesRemoveButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';

    },
    _init: function () {
        console.log("SMNLOG :: ---------- asp widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();
        self.uiEventInitialization();
        self.el.scNumber.html(self.getSelectBoxForStandardCost(self.options.selectedSC));
        self.el.dataEntryDiv.html(self.getSelectBoxForDataEntryType(self.options.dataEntryType));

        if (self.options.lineItemListSize > 0) {
            self.createLineItemMapForUpdate();
            self.data.SCDataMap = self.createSCDataMap(self.options.dataEntryType,self.data.SCMap[self.options.selectedSC]);
            $.each(self.options.lineItemList, function (index, lineItem) {
                self.addLineItemForProduct(true, lineItem);
                var selectedElement = self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last');
                self.createLineItemHtmlExceptTable(lineItem.type, index, selectedElement, lineItem);
                self.setTableHtml(selectedElement, lineItem.chipsetId, lineItem.deviceId, lineItem.lineItemDetailList,lineItem.customer);
                self.ruleItemsNumberForEdit(selectedElement);
                $(document).find(".devicePriceInput").trigger("keyup"); //to count the total
            });
            self.addPlusIconForTheLastItem();
        }
        if (self.options.viewOnly == true){
            self.disableForViewOnly();
        }
    },
    initiateFormValidation: function () {
        var self = this;

        var validateJson = {
            rules: {
                entryDate: {
                    required: true
                },
                fromDate: {
                    required: true
                },
                toDate: {
                    required: true
                },
                dataEntryType: {
                    required: true
                },
                grossMarginPercentage: {
                    required: true,
                    number: true,
                    min: 0
                }
            },
            messages: {
            },
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };

        self.el.aspForm.validate(validateJson);

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("line-item-type", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("line-item-chip-set", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("line-item-device", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("line-item-customer", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("priceInput", {required: true, number: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("dateValidationCheck", {required: true});
    },

    uiEventInitialization: function () {
        var self = this;

        $(document).on('click', 'button.lineItemAddButton', function () {
            self.addLineItemForProduct(true, self.options.lineItem);
            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'button.lineItemRemoveButton', function () {
            var lineItemDiv = $(this).parent().parent().parent().parent();
            var type = lineItemDiv.find('select.line-item-type').val();
            var isRemoveItem = true;
            if(type=='RFIC') {
                var deviceNumber = lineItemDiv.attr('attr-product');
                var customer = lineItemDiv.attr('attr-customer');
                var chipsetList = self.isChipsetForDeviceAdded(deviceNumber,customer);
                if(chipsetList.length > 0) {
                    isRemoveItem = false;
                    var message = "You can not remove this device. <br/> First remove The chipsets : "
                    $.each(chipsetList, function(index, chipset) {
                        message += chipset;
                        if(index != chipsetList.length-1) {
                            message += ', ';
                        } else message += '<br/> ';
                    });
                    bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(message));
                }
            }
            if(isRemoveItem) {
                lineItemDiv.remove();
                self.addPlusIconForTheLastItem();
                self.reIndexLineItems();
            }
        });

        $(document).on('click', 'a.itemAddButton', function () {
            self.addLineItemForRules(true, self.options.ruleItem);
            self.addPlusIconForTheLastRuleItem();
        });

        $(document).on('click', 'a.itemRemoveButton', function () {
            $(this).parent().parent().remove();
            self.addPlusIconForTheLastRuleItem();
        });

        $(document).on('change', 'select.line-item-type', function () {
            var type = $(this).val();
            var selectedItem = $(this).parent().parent().parent().parent();

            $(selectedItem).find('div.line-item-table-div').html(""); //emptying the table div

            var index = $(selectedItem).attr("attr-index");
            self.createLineItemHtmlExceptTable(type, index, selectedItem, self.options.lineItem);
        });

        $(document).on('change', 'select.line-item-chip-set', function () {
            var chipsetId = $(this).val();

            var isUnique = self.isChipsetUnique(chipsetId, $(this));
            var missingDevices = self.isAllDivicePriceGiven(chipsetId)
            if(isUnique && missingDevices.length == 0){
                $(this).parent().parent().parent().next().find("input.line-item-customer").val(self.data.chipsetMap[chipsetId].customer);
                $(this).parent().parent().parent().next().find("input.line-item-customer-name").val(self.data.chipsetMap[chipsetId].customerName);
                $(this).parent().parent().parent().next().next().find("input.line-item-description").val(self.data.chipsetMap[chipsetId].description);

                $(this).closest('div.line-item-dynamic-row').attr("attr-product", self.data.chipsetMap[chipsetId].chipsetNumber);

                var selectedElement = $(this).parent().parent().parent().parent();
                self.setTableHtml(selectedElement, chipsetId, "", [],self.data.chipsetMap[chipsetId].customer);
            }else{
                $(this).val("");
                if(!isUnique) {
                    bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("ASP related to this chip set has already been entered."));
                } else {
                    var message = "Please enter all the device price related to this chipset.<br/> Missing devices are : "
                    $.each(missingDevices, function(index, device) {
                        message += device;
                        if(index != missingDevices.length-1) {
                            message += ', ';
                        } else message += '<br/> ';
                    });
                    message += "Chipset customer : " + self.data.chipsetMap[chipsetId].customerName;
                    bootbox.alert(Forecast.APP.wrapMessageToErrorLabel(message));
                }
            }
        });

        $(document).on('change', 'select.line-item-device', function () {
            var deviceId = $(this).val();
            var selectedElement = $(this).parent().parent().parent().parent();
            var customer = $(this).parent().parent().parent().next().find('select.line-item-customer').val();
            if(self.isDeviceUnique(deviceId, customer, selectedElement)){
                $(this).closest('div.line-item-dynamic-row').attr("attr-product", self.data.deviceMap[deviceId].deviceNumber);
                var index = $(selectedElement).attr("attr-index");
                $(selectedElement).find('div.line-item-iPartNumber-div').html(self.getiPartNumberSelectBoxHtml(index, '', selectedElement));
                self.setTableHtml(selectedElement, "", deviceId, [],customer);
            }else{
                $(this).val("");
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("ASP for this RFIC and customer combination has already been entered."));
            }
        });

        $(document).on('change', 'select.line-item-iPartNumber', function () {
            var iPartNumberId = $(this).val();
            $(this).closest('div.line-item-dynamic-row').attr("attr-ipartnumber", iPartNumberId);
            var selectedElement = $(this).parent().parent().parent().parent();
            var deviceId = selectedElement.find('select.line-item-device').val();
            selectedElement.find('.grossMargin').each(function() {
                var quarter = $(this).attr("attr-time");

                var key = 'device_'+deviceId + '_' + iPartNumberId+ '_' +quarter
                var scPrice = 0;
                if(self.data.SCDataMap[key+'_netPrice'] != undefined) scPrice = self.data.SCDataMap[key+'_netPrice'];
                $(this).val(self.calculateGrossMarginValue(scPrice));
                self.checkPriceAgainstCost($(this).closest('table'), $(this).attr('attr-time'), $(this).attr('index'));
            })
        });

        $(document).on('change', 'select.line-item-customer', function () {
            var customer = $(this).val();
            console.log(self.data.previousCustomer);
            var deviceNumber = $(this).parent().parent().parent().prev().find('select.line-item-device').val();
            if(!self.isDeviceUnique(deviceNumber, customer, $(this).parent().parent().parent().parent())){
                $(this).val("");
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("ASP for this RFIC and customer combination has already been entered."));
            }else{
                $(this).closest('div.line-item-dynamic-row').attr("attr-customer", customer);
            }
        });

        /*$(document).on('focus', 'select.line-item-customer', function () {
            // Store the current value on focus and on change
            self.data.previousCustomer = $(this).find('option:selected').val();
            console.log(self.data.previousCustomer);
        })*/

        $(document).on("click", 'td.rulesColumn', function(){
            var lineItemIndex = $(this).parent().parent().parent().parent().parent().parent().attr("attr-index");
            var tableRowIndex = $(this).parent().attr("attr-tableRowIndex");
            var item = $(this).closest('tr').find('th').attr("attr-item");
            var selectedElement = $(this);
            self.createRulesDynamicRow(item, lineItemIndex, tableRowIndex, selectedElement);
        });

        $(document).on('keyup', '.devicePriceInput', function () {
            self.updateColumnTotal($(this).closest('table'), $(this).attr('index'));
        });

        $(document).on('change', '.totalDevicePrice', function () {
            self.checkChipsetTotal($(this).closest('table'), $(this).attr('index'));
        });

        $(document).on('click', '.grossErrorIcon', function () {
            var grossMargin =  $(this).attr('attr-gross');
            var grossMarginPercentage =  $(this).attr('attr-gross-percentage');
            bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("Marketing Price cannot be less than "+ grossMarginPercentage +"% gross margin which is "+ grossMargin));
        });

        $(document).on('click', '.chipsetInfoIcon', function (){
            var item = $(this).attr('attr-item');
            self.createChipsetDeviceTableAlert(item);
        });

        $(document).on('keyup', '.chipsetPriceInput', function () {
            self.checkChipsetTotal($(this).closest('table'), $(this).attr('index'));
        });

        $(document).on('keyup', '.discountPercentage', function () {
            self.updateDiscountPrice($(this).closest('table'), $(this).attr('index'));
        });

        $(document).on('keyup', '.discountPrice', function () {
            self.updateDiscountPercentage($(this).closest('table'), $(this).attr('index'));
            self.updateNetPrice($(this).closest('table'), $(this).attr('index'));
        });

        $(document).on('keyup', '.marketingPrice', function () {
            var quarter = $(this).attr("attr-time");
            self.totalDevicePriceCalculate($(this).closest('div.line-item-dynamic-row'), quarter);
            if($(this).closest('div.line-item-dynamic-row').find('select.line-item-type').val() == "RFIC"){
                self.checkPriceAgainstCost($(this).closest('table'), $(this).attr('attr-time'), $(this).attr('index'));
            }

            self.updateDiscountPrice($(this).closest('table'), $(this).attr('index'));
            self.updateDiscountPercentage($(this).closest('table'), $(this).attr('index'));
            self.updateNetPrice($(this).closest('table'), $(this).attr('index'));
        });

        self.el.grossMarginPercentage.on("change", function() {
            $(document).find('div.line-item-dynamic-row').each(function() {
                var chipsetOrDevice = '';
                var iPartNumber = '';
                if($(this).find('select.line-item-type').val() == "RFIC") {
                    chipsetOrDevice = $(this).find('select.line-item-device').val();
                    iPartNumber = $(this).find('select.line-item-iPartNumber').val();
                    $(this).find('.grossMargin').each(function() {
                        var quarter = $(this).attr("attr-time");

                        var key = 'device_'+chipsetOrDevice + '_' + iPartNumber+ '_' +quarter
                        var scPrice = 0;
                        if(self.data.SCDataMap[key+'_netPrice'] != undefined) scPrice = self.data.SCDataMap[key+'_netPrice'];
                        $(this).val(self.calculateGrossMarginValue(scPrice));
                        self.checkPriceAgainstCost($(this).closest('table'), $(this).attr('attr-time'), $(this).attr('index'));
                    })
                } else {
                    //chipsetOrDevice = $(this).find('select.line-item-chip-set').val();
                }
               /*$(this).find('.grossMargin').each(function() {
                   var quarter = $(this).attr("attr-time");

                   var key = 'chipset_'+chipsetOrDevice + '_' + iPartNumber+ '_' +quarter
                   var scPrice = 0;
                   if(self.data.SCDataMap[key+'_netPrice'] != undefined) scPrice = self.data.SCDataMap[key+'_netPrice'];
                   $(this).val(self.calculateGrossMarginValue(scPrice));
                   self.checkPriceAgainstCost($(this).closest('table'), $(this).attr('attr-time'), $(this).attr('index'));
               })*/
            });
        });
        
        $(document).on("change", "#dataEntryType" ,function (){
            self.createLineItem();
        });

        self.el.fromDate.datetimepicker({ useCurrent: false, format: Forecast.APP.GLOBAL_DATE_FORMAT_US }).on('dp.change', function (event) {
            self.isDateRangeValid();
            self.createLineItem();
        });

        self.el.toDate.datetimepicker({ useCurrent: false, format: Forecast.APP.GLOBAL_DATE_FORMAT_US }).on('dp.change', function (event) {
            self.isDateRangeValid();
            self.createLineItem();
        });

        $(document).on('change', '#standardCost', function () {
            var scId = $(this).val();
            self.fillDateFromSC(scId);
            self.el.dataEntryDiv.html(self.getSelectBoxForDataEntryType(self.options.dataEntryType));
            self.isDateRangeValid();
            self.createLineItem();
            self.showMessageforSCCount(scId);
            self.makeModalForMissingData(scId);
            $(document).find("#missingdataTable").dataTable();
        });

        self.el.scCountinfo.on("click", function (){
            $('#missingDataModal').modal({show:true});
        });

        $(document).on('click', '#misingDataButton', function() {
            var scId = $(document).find("#standardCost").val();
            window.location.href = "/admin/standardCost?id=" + scId;
        });

    },
    showMessageforSCCount: function(scId) {
        var self = this;
        var chipsetList = self.data.SCmissingChipsetMap[scId];
        var deviceList = self.data.SCmissingDeviceMap[scId];
        if(chipsetList.length > 0) {
           self.el.chipsetCount.html('Total Missing Chip Set: <b style="color: darkred; font-weight: 600;">' +chipsetList.length + '</b> ');
            self.el.chipsetCount.show();
        } else self.el.chipsetCount.hide();
        if(deviceList.length > 0) {
            self.el.deviceCount.html('Total Missing Device: <b style="color: darkred; font-weight: 600;">' + deviceList.length + ' </b>');
            self.el.deviceCount.show();
        } else self.el.deviceCount.hide();
        self.el.scMessage.show();
    },
    makeModalForMissingData: function(scId){
        var self = this;

        var chipsetList = self.data.SCmissingChipsetMap[scId];
        var deviceList = self.data.SCmissingDeviceMap[scId];

        var modalbody = '<div style="margin-bottom: 20px; padding: 5px;">';
        if(chipsetList.length > 0) {
            modalbody += '<label>Total Missing Chip Set: <b style="color: darkred; font-weight: 600;">' +chipsetList.length + '</b></label>';
            modalbody += '<br/>'
        }
        if(deviceList.length > 0) {
            modalbody += '<label>Total Missing Device: <b style="color: darkred; font-weight: 600;">' + deviceList.length + ' </b></label>';
            modalbody += '<br/>'
        }

        modalbody += '<table id="missingdataTable" class="table table-striped ruleListTable">';
        modalbody += '<thead>';
        modalbody += '<tr>';
        modalbody += '<th>Sl#</th>';
        modalbody += '<th>Chipset/Device NUmber</th>';
        modalbody += '<th>Type</th>';
        modalbody += '</tr>';
        modalbody += '</thead>';

        modalbody += '<tbody>';

        var slNo = 1;

        $.each(chipsetList, function(index, chipsetId){
            modalbody += '<tr>';
            modalbody += '<td>'+ slNo +'</td>';
            modalbody += '<td>';
            modalbody += self.data.chipsetMap[chipsetId].chipsetNumber;
            modalbody += '</td>';
            modalbody += '<td>Chip Set</td>';
            modalbody += '</tr>';
            slNo++;
        });

        $.each(deviceList, function(index, deviceId){
            modalbody += '<tr>';
            modalbody += '<td>'+ slNo +'</td>';
            modalbody += '<td>';
            modalbody += self.data.deviceMap[deviceId].deviceNumber;
            modalbody += '</td>';
            modalbody += '<td>RFIC</td>';
            modalbody += '</tr>';
            slNo++;
        });

        modalbody += '</tbody>';
        modalbody += '</table>';
        modalbody += '</div>';

        var modalHtml =  '<div id="missingDataModal" class="modal fade" role="dialog">'
            + '<div class="modal-dialog">'
            + '<div class="modal-content" style="width: 700px;">'
            + '<div class="modal-header">'
            + '<h5 class="modal-title"><b>Missing Chip Set And Device Info</b></h5>'
            + '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'
            + '<span aria-hidden="true">&times;</span>'
            + '</button>'
            + '</div>'
            + '<div class="modal-body">'
            + modalbody
            + '</div>'
            + '<div class="modal-footer">'
            + '<button type="button" id="misingDataButton" class="btn btn-primary">Add Misssing Data</button>'
            + '<button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';
        self.el.missingDataModalWrapper.html(modalHtml);
    },
    getSelectBoxForStandardCost: function (selectedItem) {
        var self = this;
        var html = '<select name="standardCost" id="standardCost" class="form-control chipsetTableCreation dateValidationCheck ">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(self.options.SCList, function (index, item) {
            if (selectedItem == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.SCNumber + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.SCNumber + '</option>';
            }
        });
        html +='</select>';
        return html;
    },
    getSelectBoxForDataEntryType: function (selectedItem) {
        var self = this;
        var html = '<select name="dataEntryType" id="dataEntryType" class="form-control chipsetTableCreation ">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(self.options.dataEntryTypeList, function (index, item) {
            if (selectedItem == item) {
                html += '<option value="' + item + '" selected>' + item + '</option>';
            } else {
                var scId = $(document).find("#standardCost").val();
                if(self.data.SCMap[scId] !=undefined) {
                    var missingList = self.data.missingDataEntryTypeMap[self.data.SCMap[scId].dataEntryType];
                    if(missingList.includes(item)) {
                        html += '<option style="background-color: #f2dce3;" value="' + item + '">' + item + '</option>';
                    } else {
                        html += '<option value="' + item + '">' + item + '</option>';
                    }

                } else {
                    html += '<option value="' + item + '">' + item + '</option>';
                }
            }
        });
        html +='</select>';
        return html;
    },
    fillDateFromSC: function(scId) {
        var self = this;

        if(scId != "") {
            var item = self.data.SCMap[scId];
            self.el.fromDate.val(item.fromDate);
            self.el.toDate.val(item.toDate);
        }
    },
    isDateRangeValid: function(){
        var self = this;

        var allDataInput = true;
        $(document).find(".dateValidationCheck").each(function (){
            if($(this).val() == "") {
                allDataInput = false;
            }
        });
        if(allDataInput){
            var fromDate = self.el.fromDate.val();
            var toDate = self.el.toDate.val();
            var scId = $(document).find("#standardCost").val();
            var item = self.data.SCMap[scId];

            if(!Forecast.APP.checkOverlappingDate(item.fromDate,item.toDate,fromDate)) {
                self.el.fromDate.val(item.fromDate);
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("This date range is out of bound " + "valid date range " + item.fromDate + " to " + item.toDate));
                return false;
            }
            if(!Forecast.APP.checkOverlappingDate(item.fromDate,item.toDate,toDate)) {
                self.el.toDate.val(item.toDate);
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("This date range is out of bound " + "valid date range " + item.fromDate + " to " + item.toDate));
                return false;
            }
        }
    },
    createLineItemMapForUpdate: function () {
        var self = this;
        $.each(self.options.lineItemList, function (index, lineItem) {

            $.each(lineItem.lineItemDetailList, function (index, itemDetails) {

                var chipsetOrDeviceNumber = lineItem.chipsetId != "" ? lineItem.chipsetId: lineItem.deviceId;
                var chipsetOrDevice = lineItem.chipsetId != "" ? 'chipset': 'device';
                var customer = lineItem.customer;

                self.data.lineItemDataMap[chipsetOrDevice+'_'+chipsetOrDeviceNumber+'_'+customer+'_'+itemDetails.timelineUnit+'_netPrice'] = itemDetails.netPrice;
                self.data.lineItemDataMap[chipsetOrDevice+'_'+chipsetOrDeviceNumber+'_'+customer+'_'+itemDetails.timelineUnit+'_id'] = itemDetails.id;
                self.data.lineItemDataMap[chipsetOrDevice+'_'+chipsetOrDeviceNumber+'_'+customer+'_'+itemDetails.timelineUnit+'_discountPrice'] = itemDetails.discountPrice;
                self.data.lineItemDataMap[chipsetOrDevice+'_'+chipsetOrDeviceNumber+'_'+customer+'_'+itemDetails.timelineUnit+'_discountPercentage'] = itemDetails.discountPercentage;
                self.data.lineItemDataMap[chipsetOrDevice+'_'+chipsetOrDeviceNumber+'_'+customer+'_'+itemDetails.timelineUnit+'_marketingPrice'] = itemDetails.marketingPrice;
                self.data.lineItemDataMap[chipsetOrDevice+'_'+chipsetOrDeviceNumber+'_'+customer+'_'+itemDetails.timelineUnit+'_rules'] = itemDetails.lineItemRuleList;
            });
        });

        console.log("ASLOG self.data.lineItemDetailsMapForDevice::"+JSON.stringify(self.data.lineItemDataMap));
    },
    getCellDataFromMap: function(key){
        var self = this;
        if(self.data.lineItemDataMap[key] != undefined){
            return self.data.lineItemDataMap[key];
        } else{
            return '';
        }
    },
    totalDevicePriceCalculate: function (selectedElement, quarter){
        var self = this;
        var type = $(selectedElement).find('select.line-item-type').val();
        var chipsetNumber = "";
        var totalDevicePrice = 0;
        var chipsetPrice = 0;
        if(type == "RFIC"){
            var deviceNumber = $(selectedElement).find('select.line-item-device').val();
            var customer = $(selectedElement).find('select.line-item-customer').val();
            $.each(self.data.deviceChipsetMap[deviceNumber], function (index, item){
                chipsetNumber = item.chipsetNumber;
                if(item.customer == customer){
                    if($(document).find('div.line-item-dynamic-row[attr-product="'+chipsetNumber+'"]').length > 0){
                        if($(document).find('div.line-item-dynamic-row[attr-product="'+chipsetNumber+'"]').find('table tbody tr td input.marketingPrice[attr-time="'+quarter+'"]').val() != "") {

                            $(document).find('div.line-item-dynamic-row[attr-product="'+chipsetNumber+'"]').find('table tbody tr td input.marketingPrice[attr-time="'+quarter+'"]').trigger('keyup');
                        }
                    }
                }
            });

        }else{
            chipsetId = $(selectedElement).find('select.line-item-chip-set').val();

            var chipsetNumber = self.data.chipsetMap[chipsetId].chipsetNumber;
            self.data.chipsetMapForTotalDevicePrice[chipsetNumber+"_"+quarter] = {chipsetId: chipsetId, chipsetNumber: chipsetNumber, chipsetPrice: '', quarter: quarter};
            if($(document).find('div.line-item-dynamic-row[attr-product="'+chipsetNumber+'"]').length > 0){
                var customer = self.data.chipsetMap[chipsetId].customer;
                chipsetPrice = $(document).find('div.line-item-dynamic-row[attr-product="'+chipsetNumber+'"]').find('table tbody tr td input.marketingPrice[attr-time="'+quarter+'"]').val();
                self.data.chipsetMapForTotalDevicePrice[chipsetNumber+"_"+quarter].chipsetPrice = chipsetPrice;

                $.each(self.data.chipsetMap[chipsetId].deviceList, function (index, item){
                    if($(document).find('div.line-item-dynamic-row[attr-product="'+item.deviceNumber+'"][attr-customer="'+customer+'"]').length > 0){
                        var price = $(document).find('div.line-item-dynamic-row[attr-product="'+item.deviceNumber+'"][attr-customer="'+customer+'"]')
                            .find('table tbody tr td input.marketingPrice[attr-time="'+quarter+'"]').val();

                        totalDevicePrice += parseFloat(price);

                        self.data.chipsetMapForTotalDevicePrice[chipsetNumber+"_"+quarter][item.deviceNumber] = {
                            deviceNumber: item.deviceNumber,
                            devicePrice: price == '' ? '0' : price
                            //devicePrice: price
                        };
                    }
                });

            }
            var html = quarter + '<i class="fas fa-exclamation-triangle chipsetInfoIcon" attr-item="'+chipsetNumber+'_'+quarter+'"></i>';
            $(document).find('div.line-item-dynamic-row[attr-product="'+chipsetNumber+'"]').find('thead tr th[attr-header="'+quarter+'"]').html(html);
        }
    },
    isChipsetForDeviceAdded: function(deviceNumber,customer) {
        var self = this;
        var addedChipsetList = [];
        if(self.data.deviceChipsetMap[deviceNumber] != undefined) {
            $.each(self.data.deviceChipsetMap[deviceNumber], function (index, chipset) {
                if(chipset.customer == customer) {
                    if($(document).find('div.line-item-dynamic-row[attr-product="'+chipset.chipsetNumber+'"]').length > 0){
                        if(!addedChipsetList.includes(chipset.chipsetNumber)) {
                            addedChipsetList.push(chipset.chipsetNumber);
                        }

                    }
                }
            })
        }
        return addedChipsetList;
    },
    isAllDivicePriceGiven: function(chipsetId) {
        var self = this;

        var customer = self.data.chipsetMap[chipsetId].customer;
        var missingDevices = [];
        $.each(self.data.chipsetMap[chipsetId].deviceList, function (index, item){

            if($(document).find('div.line-item-dynamic-row[attr-product="'+item.deviceNumber+'"][attr-customer="'+customer+'"]').length == 0){
                missingDevices.push(item.deviceNumber);
            }
        });
        return missingDevices;

    },
    createChipsetDeviceTableAlert: function(item){
        var self = this;
        var chipsetData = self.data.chipsetMapForTotalDevicePrice[item];
        var totalDevicePrice = 0;
        var html = '<b>The Chipset price is: '+ chipsetData.chipsetPrice+'.</b>';
        html += '<div>';
        html += '<table class="table table-striped custom-table da-grid-table">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>RFIC</th>';
        html += '<th>Count</th>';
        html += '<th>unit Price ($)</th>';
        html += '<th>Total Price ($)</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        $.each(self.data.chipsetMap[chipsetData.chipsetId].deviceList, function (index, item){
            var productValue = (parseFloat(chipsetData[item.deviceNumber].devicePrice) * parseFloat(item.deviceCount)).toFixed(2);
            totalDevicePrice += parseFloat(productValue);
            html += '<tr>';
            html += '<th>'+item.deviceNumber+'</th>';
            html += '<td>'+item.deviceCount+'</td>';
            html += '<td>'+chipsetData[item.deviceNumber].devicePrice+'</td>';
            html += '<td>'+productValue+'</td>';
            html += '</tr>';
        });
        html += '<tr>';
        html += '<th>Total Device Price</th>';
        html += '<td colspan="3" class="text-right">'+totalDevicePrice+'</td>';
        html += '</tr>';
        html += '</tbody>';
        html += '</table>';
        html += '</div>';

        bootbox.alert(html);
    },
    createDeviceCost: function (){
        var self = this;
        $.each(self.data.deviceCostMap, function (deviceIndex, deviceItem) {
            deviceItem["costList"] = {};
            $.each(self.options.tableHeaders, function (index, item) {
                if(item != "Rules" && item != "Device Count"){
                    var cost = 50 - index;
                    deviceItem["costList"   ][item] = {"cost" : cost};
                }
            });
        });
    },
    isChipsetUnique: function(chipsetId, selectedElement){
        var self = this;
        var isUnique = true;

        self.el.dynamicRowDiv.find('div select.line-item-chip-set').not(selectedElement).each(function(){
            if($(this).val() == chipsetId) isUnique = false;
        });

        return isUnique;
    },
    isDeviceUnique: function(deviceId, customer, selectedDiv){
        var self = this;
        var isUnique = true;

        self.el.dynamicRowDiv.find('div.line-item-dynamic-row').not(selectedDiv).each(function(){
            if($(this).find('div select.line-item-device').val() == deviceId &&
                $(this).find('div select.line-item-customer').val() == customer) isUnique = false
        });

        return isUnique;
    },
    reIndexLineItems: function(){
        var self = this;
        var lineItemIndex = 0;
        var name = '';

        self.el.dynamicRowDiv.find('div.line-item-dynamic-row').each(function(index, item){
            $(item).attr("attr-index", lineItemIndex);
            name = 'lineItemList[' + lineItemIndex + ']';
            $(this).find('div input.line-item-id').attr("name", name + ".id");
            $(this).find('div select.line-item-type').attr("name", name + ".type");
            $(this).find('div select.line-item-device').attr("name", name + ".device.id");
            $(this).find('div select.line-item-chip-set').attr("name", name + ".chipset.id");
            $(this).find('div select.line-item-iPartNumber').attr("name", name + ".iPartNumber.id");
            $(this).find('div input.line-item-customer').attr("name", name + ".customer");
            $(this).find('div select.line-item-customer').attr("name", name + ".customer");
            $(this).find('div input.line-item-description').attr("name", name + ".description");

            self.reIndexLineItemDetails(lineItemIndex, $(this));

            lineItemIndex++;
        });
    },
    reIndexLineItemDetails: function(lineItemIndex, selectedDiv){
        var self = this;
        $(selectedDiv).find('div table tbody tr td').each(function(){
            if(!$(this).hasClass('rulesColumn') && !$(this).hasClass('deviceCountColumn')){
                if($(this).find('input.reIndexName').length > 0) {
                    var currentNameArray = $(this).find('input.reIndexName').attr('name').split(".");
                    var updatedName = 'lineItemList[' + lineItemIndex + '].' + currentNameArray[1];

                    $(this).find('input.netPrice').attr('name', updatedName+'.netPrice');
                    $(this).find('input.marketingPrice').attr('name', updatedName+'.marketingPrice');
                    $(this).find('input.discountPrice').attr('name', updatedName+'.discountPrice');
                    $(this).find('input.discountPercentage').attr('name', updatedName+'.discountPercentage');
                    $(this).find('div input.line-item-detail-id').attr('name', updatedName+'.id');
                    $(this).find('div input.line-item-detail-device-number').attr('name', updatedName+'.device.id');
                    $(this).find('div input.line-item-detail-chip-set').attr('name', updatedName+'.chipset.id');
                    $(this).find('div input.line-item-detail-timeline').attr('name', updatedName+'.timelineUnit');

                    self.reIndexLineItemRules(lineItemIndex, $(this).find('div.columnHiddenDiv'));
                }
            }
        });
    },
    reIndexLineItemRules: function(lineItemIndex, selectedDiv){
        var self = this;
        $(selectedDiv).find('div.perRuleItemHiddenDiv').each(function(){
            var currentNameArray = $(this).find('input.ruleItemHiddenId').attr('name').split(".");
            var updatedName = 'lineItemList[' + lineItemIndex + '].' + currentNameArray[1] + '.' + currentNameArray[2];

            $(this).find('input.ruleItemHiddenId').attr('name', updatedName+'.id');
            $(this).find('input.ruleItemHiddenOperator').attr('name', updatedName+'.operator');
            $(this).find('input.ruleItemHiddenSaturatedQuantity').attr('name', updatedName+'.saturatedQuantity');
            $(this).find('input.ruleItemHiddenNewPrice').attr('name', updatedName+'.newPrice');
            $(this).find('input.ruleItemHiddenUniqueKey').attr('name', updatedName+'.uniqueKey');
        });
    },
    createLineItem: function(){
        var self = this;

        var allDataInput = true;
        $(document).find(".chipsetTableCreation").each(function (){
            if($(this).val() == "") {
                allDataInput = false;
            }
        });
        self.el.dynamicRowDiv.html("");
        if(allDataInput){
            var dataEntryType = $(document).find("#dataEntryType").val();
            var scId = $(document).find("#standardCost").val();
            var item = self.data.SCMap[scId];

            self.data.SCDataMap = self.createSCDataMap(dataEntryType,item);

            self.addLineItemForProduct(true, self.options.lineItem);
            self.addPlusIconForTheLastItem();
        }
    },
    createSCDataMap: function(dataEntryType,scItem) {
        var self = this;
        var map = {};
        var quarterToMonthMap = {
            "Q1" : ["Jan", "Feb", "Mar"],
            "Q2" : ["Apr", "May", "Jun"],
            "Q3" : ["Jul", "Aug", "Sept"],
            "Q4" : ["Oct", "Nov", "Dec"]
        }

        $.each(scItem.lineItemList, function (index, item) {
            $.each(item.lineItemDetailList, function (index, itemDetails) {
                var chipsetOrDeviceNumber = item.chipsetId != "" ? item.chipsetId: item.deviceId;
                var chipsetOrDevice = item.chipsetId != "" ? 'chipset': 'device';

                if(item.iPartNumberId != "") {
                    if(self.data.devicetoIpartMap[chipsetOrDeviceNumber] == undefined) {
                        self.data.devicetoIpartMap[chipsetOrDeviceNumber] = [item.iPartNumberId];
                    } else {
                        self.data.devicetoIpartMap[chipsetOrDeviceNumber].push(item.iPartNumberId);
                    }
                }

                if(itemDetails.ownPrice == true) {
                    if(scItem.dataEntryType == dataEntryType) {
                        map[chipsetOrDevice+'_'+chipsetOrDeviceNumber+'_'+item.iPartNumberId+'_'+itemDetails.timelineUnit+'_netPrice'] = itemDetails.netPrice;
                    } else {

                        if(scItem.dataEntryType == 'MONTHLY') {

                            if(dataEntryType == "QUARTERLY") {

                            } else if(dataEntryType == "YEARLY") {

                            }
                        } else if(scItem.dataEntryType == "QUARTERLY") {

                            var splitArray = itemDetails.timelineUnit.split("-");

                            if(dataEntryType == "MONTHLY") {
                                var q = splitArray[0];
                                var y = splitArray[1];

                                $.each(quarterToMonthMap[q], function(index, month) {
                                    var newtimeLineUnit = month+'-'+y;
                                    map[chipsetOrDevice+'_'+chipsetOrDeviceNumber+itemDetails.iPartNumberId+'_'+'_'+newtimeLineUnit+'_netPrice'] = itemDetails.netPrice;
                                });

                            } else if(dataEntryType == "YEARLY") {

                            }
                        } else if(scItem.dataEntryType == "YEARLY"){
                            var y = itemDetails.timelineUnit.substring(2);
                            if(dataEntryType == "QUARTERLY") {
                                $.each(self.options.quarters, function(index, quar) {
                                    var newtimeLineUnit = quar+'-'+y;
                                    map[chipsetOrDevice+'_'+chipsetOrDeviceNumber+itemDetails.iPartNumberId+'_'+'_'+newtimeLineUnit+'_netPrice'] = itemDetails.netPrice;
                                });
                            } else if(dataEntryType == "MONTHLY") {
                                $.each(self.options.months, function(index, month) {
                                    var newtimeLineUnit = month+'-'+y;
                                    map[chipsetOrDevice+'_'+chipsetOrDeviceNumber+itemDetails.iPartNumberId+'_'+'_'+newtimeLineUnit+'_netPrice'] = itemDetails.netPrice;
                                });
                            }
                        }
                    }
                }
            });
        });
        return map;
    },
    createLineItemHtmlExceptTable: function(type, index, selectedElement, lineItem) {
        var self = this;
        console.log("SMNLOG:: type = " + type);
        if(type == ""){
            $(selectedElement).find('div.line-item-product-div').html("");
            $(selectedElement).find('div.line-item-customer-div').html("");
            $(selectedElement).find('div.line-item-description-div').html("");
        }else{
            var isReadOnly;
            if(type == "RFIC"){
                isReadOnly = false;
                $(selectedElement).find('div.line-item-product-div').html(self.getDeviceSelectBoxHtml(index, lineItem.deviceId));
                if(lineItem.iPartNumberId != '') {
                    $(selectedElement).find('div.line-item-iPartNumber-div').html(self.getiPartNumberSelectBoxHtml(index, lineItem.iPartNumberId, selectedElement));
                }
            }else if(type == "CHIPSET"){
                isReadOnly = true;
                $(selectedElement).find('div.line-item-product-div').html(self.getChipsetSelectBoxHtml(index, lineItem.chipsetId));
            }
            $(selectedElement).find('div.line-item-customer-div').html(self.getCustomerSelectBoxHtml(index, lineItem.customer, isReadOnly, lineItem.customerName));
            $(selectedElement).find('div.line-item-description-div').html(self.getDescriptionInputBoxHtml(index, lineItem.description, isReadOnly));
        }

    },
    setTableHtml: function(selectedElement, chipsetId, deviceId, lineItemDetailList,customer){
        var self = this;
        self.getTableRowsName();
        var index = $(selectedElement).attr("attr-index");
        var iPartNumber = $(selectedElement).attr("attr-ipartnumber");
        $(selectedElement).find("div.line-item-table-div").html(self.getDataEntryTableHtml(index, chipsetId, deviceId, lineItemDetailList,iPartNumber,customer));
    },
    getTableRowsName: function (){
        var self = this;
        self.options.tableRowsName = [];
        self.options.tableRowsName.push("Gross Margin Value");
        self.options.tableRowsName.push("Net Price");
        self.options.tableRowsName.push("Marketing Price");
        self.options.tableRowsName.push("Discount (%)");
        self.options.tableRowsName.push("Discount ($)");
    },
    getDataEntryTableHtml: function(lineItemIndex, chipsetId, deviceId, lineItemDetailList,iPartNumber,customer){
        var self = this;

        var html = '<table class="table table-striped custom-table da-grid-table" style="display: block; overflow-x: auto;">';
        html += '<thead>';
        html += '<tr>';
        html += '<th></th>';
        if(chipsetId != ""){
            html += self.getTableHeaderHtml(false);
            if(lineItemDetailList.length == 0){
                lineItemDetailList = self.getLineItemDetailListForCreation(false);
            }
        }else{
            html += self.getTableHeaderHtml(true);
            if(lineItemDetailList.length == 0){
                lineItemDetailList = self.getLineItemDetailListForCreation(true);
            }
        }
        html += '</tr>';
        html += '</thead>';
        html += '<tbody style="overflow: auto;">';
        if(chipsetId!="") {
            html += self.getTableBodyHtmlForProduct(lineItemIndex, chipsetId, lineItemDetailList,false,iPartNumber,customer);
        } else {
            html += self.getTableBodyHtmlForProduct(lineItemIndex, deviceId, lineItemDetailList,true,iPartNumber,customer);
        }
        html += '</tbody>';
        html += '</table>';

        if(lineItemIndex == 0){
            self.createDeviceCost();
        }

        return html;
    },
    getLineItemDetailListForCreation: function(isDevice){
        var self = this;
        var numberOfColumn = self.options.tableHeaders.length;
        var lineItemDetailIndex = 0;
        var lineItemDetailList = [];

        $.each(self.options.tableRowsName, function (index, item){
            var i = 0;
            while(i < numberOfColumn){
                if(i != 0 ){
                    var lineItemDetail = {
                        id: '',
                        grossMargin: '',
                        netPrice: '',
                        endDate: self.getEndDateByTimeLineUnit(self.options.tableHeaders[i]),
                        startDate: self.getStartDateByTimeLineUnit(self.options.tableHeaders[i]),
                        timelineUnit: self.options.tableHeaders[i],
                        deviceId: '',
                        chipsetId: '',
                        marketingPrice: '',
                        discountPrice: '',
                        discountPercentage: ''
                    };
                    lineItemDetailList[lineItemDetailIndex] = lineItemDetail;
                    lineItemDetailIndex++;
                }
                i++;
            }
        });

        return lineItemDetailList;
    },
    getTableHeaderHtml: function(isDevice){
        var self = this;
        var html = "";
        var index = 0;
        var dataEntryType = $(document).find("#dataEntryType").val();
        var fromDate = self.el.fromDate.val();
        var toDate = self.el.toDate.val();
        self.options.tableHeaders = [];
        self.options.tableHeaders.push("Rules");
        var colorIndex = -1;
        var lastItem = '';
        var currentItem = '';

        if(dataEntryType == 'MONTHLY'){
            self.getMonthlyTableHeaders(fromDate, toDate);
        }else if(dataEntryType == "QUARTERLY"){
            self.getQuarterlyTableHeaders(fromDate, toDate);
        }else if(dataEntryType == "YEARLY"){
            self.getYearlyTableHeaders(fromDate, toDate);
        }

        $.each(self.options.tableHeaders, function (index, item) {

            if(item.split('-')[1] == undefined){
                currentItem = item;
            }else{
                currentItem = item.split('-')[1];
            }

            if(currentItem != lastItem){
                colorIndex += 1;
            }

            html += '<th index="'+index+'" attr-header="'+item+'" style="text-align: center; color: '+self.options.colorBank[colorIndex]+'">' + item + '</th>';
            lastItem = currentItem;
        });
        return html;
    },
    getTableBodyHtmlForProduct: function (lineItemIndex, productId, lineItemDetailList, isDevice,iPartNumber,customer) {
        var self = this;
        var html = "";
        var numberOfColumn = self.options.tableHeaders.length;
        var lastItem = '';
        var currentItem = '';
        var colorIndex = -1;
        var productNumber = isDevice? self.data.deviceMap[productId].deviceNumber : self.data.chipsetMap[productId].chipsetNumber;

        $.each(self.options.tableRowsName, function (index, item) {
            var i = 0;
            var lineItemDetailIndex = 0;
            html += '<tr attr-tableRowIndex="'+ index +'">';
            html += '<th style="min-width: 200px;" attr-item="'+ productNumber +'" >' + item + '</th>';
            while (i < numberOfColumn) {
                currentItem = self.options.tableHeaders[i].split('-')[1];
                if (currentItem != lastItem) {
                    colorIndex += 1;
                }
                if(i == 0){
                    var spanText = '';
                    html += '<td index="'+i+'"';
                    if(item == 'Marketing Price'){
                        html += 'class="rulesColumn">';
                        spanText = '0 Rule';
                    }else{
                        html += '>';
                        spanText = '--';
                    }
                    html += '<span attr-header="'+item+'" attr-colorIndex="'+ colorIndex +'" style="width: 130px; color: '+self.options.colorBank[colorIndex]+'">';
                    html += spanText;
                    html += '</span>'
                    html += '</td>';
                }else{
                    var key = '';
                    var scKey = ''
                    if(isDevice) {
                        key += 'device_'
                        scKey += 'device_'
                    } else {
                        key += 'chipset_'
                        scKey += 'chipset_'
                    }
                    key += productId + '_' +customer+'_'+ self.options.tableHeaders[i];
                    html += '<td index="'+i+'" attr-time="'+self.options.tableHeaders[i]+'" attr-lineItemDetailIndex="'+lineItemDetailIndex+'" attr-numberOfHiddenRule="0">';
                    html += '<input type="text" attr-header="'+item+'" attr-time="'+self.options.tableHeaders[i]+'" class="form-control ';
                    if(item == 'Gross Margin Value'){
                        var scPrice = 0;
                        scKey += productId + '_' +iPartNumber+ '_' + self.options.tableHeaders[i];
                        if(self.data.SCDataMap[scKey+'_netPrice'] != undefined) scPrice = self.data.SCDataMap[scKey+'_netPrice'];
                        html += 'grossMargin"';
                        html += 'value="'+self.calculateGrossMarginValue(scPrice)+'"';
                        html += ' readonly ';
                    } else if(item == 'Net Price'){
                        html += 'netPrice reIndexName"';
                        html += 'name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].netPrice"';
                        html += 'value="'+self.getCellDataFromMap(key+'_netPrice')+'"';
                        html += ' readonly ';
                    }else if(item == 'Marketing Price'){
                        html += 'marketingPrice priceInput reIndexName"';
                        html += 'name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].marketingPrice"';
                        html += 'value="'+self.getCellDataFromMap(key+'_marketingPrice')+'"';
                    }else if(item == 'Discount (%)'){
                        html += 'discountPercentage reIndexName"';
                        html += 'name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].discountPercentage"';
                        html += 'value="'+self.getCellDataFromMap(key+'_discountPercentage')+'"';
                    }else if(item == 'Discount ($)'){
                        html += 'discountPrice reIndexName"';
                        html += 'name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].discountPrice"';
                        html += 'value="'+self.getCellDataFromMap(key+'_discountPrice')+'"';
                    }
                    html += 'index="'+i+'" style="width: 130px; color: '+self.options.colorBank[colorIndex]+'"/>';
                    if(item == 'Marketing Price'){
                        html += self.getHiddenInputBinding(index, productId, lineItemIndex, lineItemDetailIndex, lineItemDetailList, isDevice,key,self.options.tableHeaders[i]);
                    }
                    html += '</td>';

                    lineItemDetailIndex++;
                }
                i++;
                lastItem = currentItem;
            }
            colorIndex = -1;
            html += '</tr>';
        });

        return html;
    },
    calculateGrossMarginValue: function(value) {
        var self = this;
        var percentage = self.el.grossMarginPercentage.val();
        if(parseFloat(percentage) > 0) {
            var margin = parseFloat(parseFloat(value) + parseFloat(parseFloat(value) * (parseFloat(percentage)/100))).toFixed(2);
            return margin;
        }
        return value;
    },
    getHiddenInputBinding: function(index, productId, lineItemIndex, lineItemDetailIndex, lineItemDetailList, isDevice,key,timeLineUnit){
        var self = this;
        var html = '<div class="columnHiddenDiv" style="display: none">';
        html += '<input class="line-item-detail-id" name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].id" style="display: none;" value="'+self.getCellDataFromMap(key+'_id')+'"/>';
        html += '<input name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + ']';
        if(isDevice){
            html += '.device.id"';
            html += 'class="line-item-detail-device-number"';
        }else{
            html += '.chipset.id"';
            html += 'class="line-item-detail-chip-set"';
        }
        html += 'style="display: none;" value="'+productId+'"/>';
        html += '<input class="line-item-detail-timeline" name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].timelineUnit" style="display: none;" value="'+timeLineUnit+'"/>';
        html += '<div class="ruleHiddenDiv" style="display: none">';
        if(key+'_rules' in self.data.lineItemDataMap) {
            $.each(self.data.lineItemDataMap[key+'_rules'], function (ruleIndex, ruleItem) {
                html += self.createHiddenInputForRules(lineItemIndex, lineItemDetailIndex, ruleIndex, ruleItem, ruleItem.uniqueKey);
            });
        } else {
            if(lineItemDetailList[lineItemDetailIndex] != undefined) {
                $.each(lineItemDetailList[lineItemDetailIndex].lineItemRuleList, function (ruleIndex, ruleItem) {
                    html += self.createHiddenInputForRules(lineItemIndex, lineItemDetailIndex, ruleIndex, ruleItem, ruleItem.uniqueKey);
                });
            }
        }

        html += '</div>';
        html += '</div>';

        return html;
    },
    getTypeSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="lineItemList[' + index + '].type" class="custom-select line-item-type" placeholder="Type">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.productType, function (index, item) {
            if (selectedValue == item.name) {
                html += '<option value="' + item.name + '" selected>' + item.label + '</option>';
            } else {
                html += '<option value="' + item.name + '">' + item.label + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    getChipsetSelectBoxHtml: function (index, selectedValue) {
        var self = this;

        var scId = $(document).find("#standardCost").val();
        var missingchipsetList = self.data.SCmissingChipsetMap[scId];

        var html = '<div class="form-group row ">';
        html += '<label class="col-md-3 col-form-label">' + self.options.messages.chipSetNumber + '</label>';
        html += '<div class="col-md-9">';
        html += '<select name="lineItemList[' + index + '].chipset.id" class="custom-select line-item-chip-set" placeholder="Chip Set">'; //data-live-search="true"
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.data.chipsetMap, function (index, item) {
            if (selectedValue == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.chipsetNumber + '</option>';
            } else {
                if(missingchipsetList.includes(item.id)) {
                    html += '<option style="background-color: #f2dce3;" value="' + item.id + '">' + item.chipsetNumber + '</option>';
                } else {
                    html += '<option value="' + item.id + '">' + item.chipsetNumber + '</option>';
                }

            }
        });
        html += '</select>';
        html += '</div>';
        html += '</div>';
        return html;
    },
    getDeviceSelectBoxHtml: function (index, selectedValue) {
        var self = this;

        var scId = $(document).find("#standardCost").val();
        var missingDeviceList = self.data.SCmissingDeviceMap[scId];

        var html = '<div class="form-group row ">';
        html += '<label class="col-md-3 col-form-label">RFIC</label>';
        html += '<div class="col-md-9">';
        html += '<select name="lineItemList[' + index + '].device.id" class="custom-select line-item-device" placeholder="RFIC" >'; //data-live-search="true"
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.data.deviceMap, function (index, item) {
            if (selectedValue == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.deviceNumber + '</option>';
            } else {
                if(missingDeviceList.includes(item.id)) {
                    html += '<option style="background-color: #f2dce3;" value="' + item.id + '">' + item.deviceNumber + '</option>';
                } else {
                    html += '<option value="' + item.id + '">' + item.deviceNumber + '</option>';
                }
            }
        });
        html += '</select>';
        html += '</div>';
        html += '</div>';
        return html;
    },
    getiPartNumberSelectBoxHtml: function (index, selectedValue, selectedElement) {
        var self = this;
        var html = '<div class="form-group row ">';
        html += '<label class="col-md-3 col-form-label">I Part Number</label>';
        html += '<div class="col-md-9">';
        html += '<select name="lineItemList[' + index + '].iPartNumber.id" class="custom-select line-item-iPartNumber" placeholder="I part Number">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        var deviceId = selectedElement.find('div select.line-item-device').val();
        if(self.data.deviceMap[deviceId] != undefined) {
            $.each(self.data.deviceMap[deviceId].iPartNumberList, function (index, item) {
                if (selectedValue == item.id) {
                    html += '<option value="' + item.id + '" selected>' + item.iPartNumber + '</option>';
                } else {
                    if(self.data.devicetoIpartMap[deviceId] != undefined) {
                        if(self.data.devicetoIpartMap[deviceId].includes(item.id)) {
                            html += '<option value="' + item.id + '">' + item.iPartNumber + '</option>';
                        } else {
                            html += '<option style="background-color: #f2dce3;" value="' + item.id + '">' + item.iPartNumber + '</option>';
                        }
                    } else {
                        html += '<option style="background-color: #f2dce3;" value="' + item.id + '">' + item.iPartNumber + '</option>';
                    }
                }
            });
        }
        html += '</select>';
        html += '</div>';
        html += '</div>';
        return html;
    },
    getCustomerSelectBoxHtml: function (index, selectedValue, isReadOnly, customerName) {
        var self = this;
        var html = '<div class="form-group row ">';
        html += '<label class="col-md-3 col-form-label">Customer</label>';
        html += '<div class="col-md-9">';
        if(isReadOnly){
            html += '<input name="lineItemList[' + index + '].customer" class="form-control line-item-customer" style="display: none;" placeholder="Customer" value="'+selectedValue+'" />';
            html += '<input class="form-control line-item-customer-name" placeholder="Customer" value="'+customerName+'" readonly />';
        } else{
            html += '<select name="lineItemList[' + index + '].customer" class="custom-select line-item-customer" placeholder="Customer">';
            html += '<option value="">' + self.options.messages.selectAny + '</option>';

            $.each(self.options.customerList, function (index, item) {
                if (selectedValue == item.id) {
                    html += '<option value="' + item.id + '" selected>' + item.name + '</option>';
                } else {
                    html += '<option value="' + item.id + '">' + item.name + '</option>';
                }
            });
            html += '</select>';
        }
        html += '</div>';
        html += '</div>';
        return html;
    },
    getDescriptionInputBoxHtml: function (index, selectedValue, isReadOnly) {
        var self = this;
        var html = '<div class="form-group row ">';
        html += '<label class="col-md-3 col-form-label">Description</label>';
        html += '<div class="col-md-9">';
        html += '<input name="lineItemList[' + index + '].description" class="form-control line-item-description" placeholder="Description" ';
        html += 'value="'+selectedValue+'"';
        if(isReadOnly){
            html += 'readonly/>';
        }else{
            html += '/>';
        }
        html += '</div>';
        html += '</div>';
        return html;
    },
    addLineItemForProduct: function (isPlusIcon, lineItem) {
        var self = this;
        var productNumber = '';
        var customer = lineItem.customer;
        var iPartNumber = lineItem.iPartNumberId;
        if(lineItem.id != '') {
            productNumber = lineItem.chipsetId != '' ? self.data.chipsetMap[lineItem.chipsetId].chipsetNumber: self.data.deviceMap[lineItem.deviceId].deviceNumber;
        }
        var index = self.el.dynamicRowDiv.find('div.line-item-dynamic-row').length;
        var $rowToAppend = '<div class="row line-item-dynamic-row lineItemBorder" attr-index="' + index + '" attr-product="'+productNumber+'" attr-customer="'+customer+'" attr-ipartnumber="'+iPartNumber+'" style="padding-right: 0px; padding-left: 0px;">'
            + '<div class="col-lg-4 ">'
            + '<div class="form-group row ">'
            + '<input name="lineItemList[' + index + '].id" class="line-item-id" style="display: none;" value="'+lineItem.id+'"/>'
            + '<label class="col-md-3 col-form-label">Type</label>'
            + '<div class="col-md-9">'
            + self.getTypeSelectBoxHtml(index, lineItem.type)
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="col-lg-4 line-item-product-div">'
            + '</div>'
            + '<div class="col-lg-4 line-item-customer-div">'
            + '</div>'
            + '<div class="col-lg-4 line-item-description-div">'
            + '</div>'
            + '<div class="col-lg-4 line-item-iPartNumber-div">'
            + '</div>'
            + '<div class="col-md-12">'
            + '<div class="line-item-table-div">'
            + '</div>'
            + '<div class="form-group row">'
            + '<div class="col-md-12 pt-2 itemAddRemoveButtonDiv" style="text-align:right">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.dynamicRowDiv.append($rowToAppend);
        self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.removeButton);
    },
    addPlusIconForTheLastItem: function () {
        var self = this;
        if (self.el.dynamicRowDiv.children().length == 1) {
            self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last').find('div.itemAddRemoveButtonDiv').html(self.el.addButton);
        }
        else {
            self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last').find('div.itemAddRemoveButtonDiv').html(self.el.removeButton + self.el.addButton);
        }
    },
    updateColumnTotal: function(table, index){
        var self = this;
        var lineTotal = 0;

        $(table).find('tbody tr td input[index="'+index+'"]').each(function(idx, item){
            if($(item).hasClass("totalDevicePrice")){
                $(item).val(lineTotal.toFixed(2)).trigger("change");
            }else if($(item).hasClass("devicePriceInput")){
                var price = +$(item).val();
                var count = +$(item).parent().parent().find('.deviceCountColumn').find('span').html();

                lineTotal += parseFloat(price * count);
            }
        });
    },
    checkChipsetTotal: function(table, index){
        var self = this;
        var chipsetPrice = 0;
        var totalDevicePrice = 0;

        $(table).find('tbody tr td input[index="'+index+'"]').each(function(idx, item){
            if($(item).hasClass("totalDevicePrice")){
                totalDevicePrice = +$(item).val();
            }else if($(item).hasClass("chipsetPriceInput")){
                chipsetPrice = +$(item).val();
            }
        });

        if(chipsetPrice > 0 && totalDevicePrice > 0){
            $(table).find('thead tr th[index="'+index+'"]').each(function(idx, item){
                if(chipsetPrice < totalDevicePrice){
                    var html = $(item).attr("attr-header") + '<i class="fas fa-exclamation-triangle"></i>';
                    $(item).html(html);
                }else{
                    var html = $(item).attr("attr-header");
                    $(item).html(html);
                }
            });
        }
    },
    checkPriceAgainstCost: function (table, quarter, index){
        var self = this;
        var marketingPrice = parseFloat($(table).find('tbody tr td input.marketingPrice[index="'+index+'"]').val());
        var grossMargin = parseFloat($(table).find('tbody tr td input.grossMargin[index="'+index+'"]').val());
        var grossMarginPercentage = self.el.grossMarginPercentage.val();

        if(marketingPrice < grossMargin){
            var html = $(table).find('thead tr th[index="'+index+'"]').attr("attr-header")
                    + '<i class="fas fa-exclamation-triangle grossErrorIcon" attr-gross-percentage="'+grossMarginPercentage+'" attr-gross="'+grossMargin+'" attr-marketing="'+marketingPrice+'"></i>';
            $(table).find('thead tr th[index="'+index+'"]').html(html);
        }else{
            var html = $(table).find('thead tr th[index="'+index+'"]').attr("attr-header");
            $(table).find('thead tr th[index="'+index+'"]').html(html);
        }
    },
    updateDiscountPrice: function(table, index){
        var marketingPrice = $(table).find('tbody tr td input.marketingPrice[index="'+index+'"]').val();
        var discountPercentage = $(table).find('tbody tr td input.discountPercentage[index="'+index+'"]').val();
        if(marketingPrice != "" && discountPercentage != ""){
            $(table).find('tbody tr td input.discountPrice[index="'+index+'"]').val((marketingPrice * (discountPercentage / 100)).toFixed(2)).trigger('keyup');
        }else{
            $(table).find('tbody tr td input.discountPrice[index="'+index+'"]').val('');
        }
    },
    updateDiscountPercentage: function(table, index){
        var marketingPrice = $(table).find('tbody tr td input.marketingPrice[index="'+index+'"]').val();
        var discountPrice = $(table).find('tbody tr td input.discountPrice[index="'+index+'"]').val();
        var $focused = $(':focus');
        if(!$(table).find('tbody tr td input.discountPercentage[index="'+index+'"]').is($focused)){
            if(marketingPrice != "" && discountPrice != ""){
                $(table).find('tbody tr td input.discountPercentage[index="'+index+'"]').val(((discountPrice / marketingPrice) * 100).toFixed(2));
            }else{
                $(table).find('tbody tr td input.discountPercentage[index="'+index+'"]').val('');
            }
        }
    },
    updateNetPrice: function(table, index){
        var marketingPrice = $(table).find('tbody tr td input.marketingPrice[index="'+index+'"]').val();
        var discountPrice = $(table).find('tbody tr td input.discountPrice[index="'+index+'"]').val();
        if(marketingPrice != ""){
            $(table).find('tbody tr td input.netPrice[index="'+index+'"]').val(marketingPrice - (discountPrice != "" ? discountPrice : 0 ));
        }else{
            $(table).find('tbody tr td input.netPrice[index="'+index+'"]').val('');
        }
    },
    createRulesDynamicRow: function(product, lineItemIndex, tableRowIndex, selectedElement){
        var self = this;
        var html = '<div class="text-center">';
        html += '<h3>Rules For '+ product +'</h3>';
        html += '</div>';
        html += self.getRuleLineItemHeader();
        html +='<div class="rule-line-item-div ml-3">';
        html += '</div>';
        bootbox.confirm({
            message: html,
            size: 'extra-large',
            buttons: {
                confirm: {
                    label: 'Save',
                    className: 'btn-primary'
                },
                cancel: {
                    label: 'Cancel',
                    className: 'btn-danger'
                }
            },
            onShow: function(e){
                self.getRuleItemsInMapPerRow($(selectedElement).closest('tr'));
                if(Object.getOwnPropertyNames(self.data.rulesPerRow).length > 0){
                    $.each(self.data.rulesPerRow, function (index, ruleItem) {
                        self.addLineItemForRules(true, ruleItem);
                    });
                }else{
                    self.addLineItemForRules(true, self.options.ruleItem);
                }
                self.addPlusIconForTheLastRuleItem();
            },
            callback: function (result) {
                if (result) {
                    self.data.rulesPerRow = {};
                    $.each($(document).find('div.rule-line-item-dynamic-row'), function (index, item) {
                        var currentTimeMillis = new Date().getTime();
                        var operator = $(this).find("select.rule-operand").val();
                        var saturatedQuantity = $(this).find("input.rule-highest-quantity").val();
                        var newPrice = $(this).find("input.rule-new-price").val();
                        var uniqueKey = $(this).find("input.rule-unique-key").val();
                        var quarters = $(this).find("select.rule-quarters").val();
                        if(operator != "" && saturatedQuantity != "" && newPrice != "" && quarters.length > 0){
                            if(uniqueKey != ""){
                                self.data.rulesPerRow[uniqueKey] = {id: '', operator: operator, saturatedQuantity: saturatedQuantity, newPrice: newPrice, uniqueKey: uniqueKey, quarters: quarters};
                            }else{
                                self.data.rulesPerRow[currentTimeMillis] = {id: '', operator: operator, saturatedQuantity: saturatedQuantity, newPrice: newPrice, uniqueKey: currentTimeMillis, quarters: quarters};
                            }
                        }
                    });

                    self.setNumberOfRulesInCell(selectedElement);

                    $.each($(selectedElement).closest('tr').find('td'), function (index, item) { //emptying all the td of the row
                        if(!$(item).hasClass('deviceCountColumn') && !$(item).hasClass('rulesColumn')){
                            $(item).attr("attr-numberOfHiddenRule", "0");
                            $(item).find("div.columnHiddenDiv").find("div.ruleHiddenDiv").html("");
                        }
                    });

                    $.each(self.data.rulesPerRow, function (index, item) {
                        $.each(item.quarters, function (quarterIndex, quarterItem) {
                            var affectedCell = $(selectedElement).closest('tr').find('td[attr-time="'+quarterItem+'"]');
                            var lineItemDetailIndex = $(affectedCell).attr("attr-lineItemDetailIndex");
                            var ruleIndex = +$(affectedCell).attr("attr-numberOfHiddenRule");
                            var html = self.createHiddenInputForRules(lineItemIndex, lineItemDetailIndex, ruleIndex, item, index);
                            $(affectedCell).find("div.columnHiddenDiv").find("div.ruleHiddenDiv").append(html);
                            $(affectedCell).attr("attr-numberOfHiddenRule", ruleIndex+1);
                        });
                    });
                }
            }
        });
    },
    ruleItemsNumberForEdit: function (selectedElement){
        var self = this;
        $.each($(selectedElement).find('table tbody tr'), function (index, item) {
            self.getRuleItemsInMapPerRow(item);
            var ruleCell = $(item).find('td.rulesColumn');
            self.setNumberOfRulesInCell(ruleCell);
        });
    },
    getRuleItemsInMapPerRow: function(trElement){
        var self = this;
        self.data.rulesPerRow = {};
        $.each($(trElement).find('td div.columnHiddenDiv div.ruleHiddenDiv div.perRuleItemHiddenDiv'), function (index, item) {
            var id = $(item).find('input.ruleItemHiddenId').val();
            var operator = $(item).find('input.ruleItemHiddenOperator').val();
            var saturatedQuantity = $(item).find('input.ruleItemHiddenSaturatedQuantity').val();
            var newPrice = $(item).find('input.ruleItemHiddenNewPrice').val();
            var uniqueKey = $(item).find('input.ruleItemHiddenUniqueKey').val();
            var timePeriod = $(item).closest('td').attr('attr-time');

            if(self.data.rulesPerRow.hasOwnProperty(uniqueKey)){
                self.data.rulesPerRow[uniqueKey].quarters.push(timePeriod);
            }else{
                self.data.rulesPerRow[uniqueKey] = {id: '', operator: operator, saturatedQuantity: saturatedQuantity, newPrice: newPrice, uniqueKey: uniqueKey, quarters: [""+timePeriod]}
            }
        });
    },
    setNumberOfRulesInCell: function(selectedElement){
        var self = this;
        var colorIndex = $(selectedElement).find('span').attr("attr-colorIndex");
        var header = $(selectedElement).find('span').attr("attr-header");
        var tdHtml = '<span attr-header="'+header+'" attr-colorIndex="'+ colorIndex +'" style="width: 130px; color: '+self.options.colorBank[colorIndex]+'">'+ Object.getOwnPropertyNames(self.data.rulesPerRow).length;
        tdHtml += Object.getOwnPropertyNames(self.data.rulesPerRow).length > 1 ? ' Rules' : ' Rule';
        tdHtml += '</span>';
        $(selectedElement).html(tdHtml);
    },
    createHiddenInputForRules: function(lineItemIndex, lineItemDetailIndex, ruleIndex, ruleItem, uniqueKey){
        var self = this;
        var html = '<div class="perRuleItemHiddenDiv">';
        html += '<input name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].lineItemRuleList[' + ruleIndex + '].id" style="display: none;" class="ruleItemHiddenId" value="'+ruleItem.id+'"/>';
        html += '<input name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].lineItemRuleList[' + ruleIndex + '].operator" style="display: none;" class="ruleItemHiddenOperator" value="'+ruleItem.operator+'"/>';
        html += '<input name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].lineItemRuleList[' + ruleIndex + '].saturatedQuantity" style="display: none;" class="ruleItemHiddenSaturatedQuantity" value="'+ruleItem.saturatedQuantity+'"/>';
        html += '<input name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].lineItemRuleList[' + ruleIndex + '].newPrice" style="display: none;" class="ruleItemHiddenNewPrice" value="'+ruleItem.newPrice+'"/>';
        html += '<input name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].lineItemRuleList[' + ruleIndex + '].uniqueKey" style="display: none;" class="ruleItemHiddenUniqueKey" value="'+uniqueKey+'"/>';
        html += '</div>';

        return html;
    },
    getRuleLineItemHeader: function(){
        var self = this;
        var html = '<div class="form-group row rule-line-item-header">';
        html += '<div class="col-md-1 text-center"><span></span></div>';
        html += '<div class="col-md-2 text-center">Comparison</div>';
        html += '<div class="col-md-2 text-center">Saturated Quantity</div>';
        html += '<div class="col-md-2 text-center">New Price</div>';
        html += '<div class="col-md-3 text-center">Quarters</div>';
        html += '</div>';
        return html;
    },
    getOperatorSelectBoxHtml: function (selectedValue) {
        var self = this;
        var html = '<select class="custom-select rule-operand" placeholder="Operand">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.operandList, function (index, item) {
            if (selectedValue == item.name) {
                html += '<option value="' + item.name + '" selected>' + item.label + '</option>';
            } else {
                html += '<option value="' + item.name + '">' + item.label + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    getQuartersSelectBoxHtml: function () {
        var self = this;
        var html = '<select class="custom-select select rule-quarters" placeholder="Quarters" multiple="multiple">';
        $.each(self.options.tableHeaders, function (index, item) {
            if(item != 'Device Count' && item != 'Rules'){
                html += '<option value="' + item + '">' + item + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    quarterSelectInitializationAndValueSelection: function(selectedElement, quarters){
        var self = this;
        $(selectedElement).select2({minimumResultsForSearch: -1, width: '100%'});
        if(quarters.length > 0){
            $(selectedElement).val(quarters).trigger('change');
        }else{
            $(selectedElement).find('option').prop("selected","selected");
            $(selectedElement).trigger("change");
        }
    },
    addLineItemForRules: function(isPlusIcon, ruleItem){
        var self = this;
        var $rowToAppend = '<div class="form-group row rule-line-item-dynamic-row">'
            + '<div class="col-md-1 mt-2">'
            + '<span style="font-weight: bold">Quantity</span>'
            + '</div>'
            + '<div class="col-md-2">'
            + '<input class="rule-unique-key" style="display: none;" value="' + ruleItem.uniqueKey + '"/>'
            + self.getOperatorSelectBoxHtml(ruleItem.operator)
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" value="' + ruleItem.saturatedQuantity + '" class="form-control rule-highest-quantity" placeholder="Saturated Quantity" />'
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" value="' + ruleItem.newPrice + '" class="form-control rule-new-price" placeholder="New Price" />'
            + '</div>'
            + '<div class="col-md-4">'
            + self.getQuartersSelectBoxHtml()
            + '</div>'
            + '<div class="col-md-1 itemAddRemoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.rulesAddButton;
        } else {
            $rowToAppend += self.el.rulesRemoveButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $(document).find('div.rule-line-item-div').append($rowToAppend);
        $(document).find('div.rule-line-item-div').find('div.rule-line-item-dynamic-row:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.rulesRemoveButton);

        self.quarterSelectInitializationAndValueSelection($(document).find('div.rule-line-item-div').find('div.rule-line-item-dynamic-row:last').find('.select'), ruleItem.quarters);
    },
    addPlusIconForTheLastRuleItem: function () {
        var self = this;
        if ($(document).find('div.rule-line-item-div').find('div.rule-line-item-dynamic-row').length == 1) {
            $(document).find('div.rule-line-item-div').find('div.rule-line-item-dynamic-row:last').find('div.itemAddRemoveButtonDiv').html(self.el.rulesAddButton);
        }
        else {
            $(document).find('div.rule-line-item-div').find('div.rule-line-item-dynamic-row:last').find('div.itemAddRemoveButtonDiv').html(self.el.rulesRemoveButton + self.el.rulesAddButton);
        }
    },
    getMonthlyTableHeaders: function(fromDate, toDate){
        var self = this;
        var startDate = moment(fromDate);
        var endDate = moment(toDate);
        while (startDate.isBefore(endDate)) {
            self.options.tableHeaders.push(self.options.months[startDate.format('M') - 1] + "-" + startDate.format('YY'));
            startDate.add(1, 'month');
        }
    },
    getQuarterlyTableHeaders: function(fromDate, toDate){
        var self = this;
        var startDate = moment(fromDate);
        var endDate = moment(toDate);
        while (startDate.isBefore(endDate)) {
            self.options.tableHeaders.push(self.options.quarters[Math.floor((startDate.format('M') - 1) / 3)] + "-" + startDate.format('YY'));
            if((startDate.format('M') - 1) % 3 == 1){
                startDate.add(2, 'month');
            }else if((startDate.format('M') - 1) % 3 == 2){
                startDate.add(1, 'month');
            }else{
                startDate.add(3, 'month');
            }
        }
    },
    getYearlyTableHeaders: function(fromDate, toDate){
        var self = this;
        var startYear = moment(fromDate).format('YYYY');
        var endYear = moment(toDate).format('YYYY');
        while (startYear <= endYear) {
            self.options.tableHeaders.push(startYear.toString());
            startYear++;
        }
    },
    getStartDateByTimeLineUnit: function(timelineUnit){
        var self = this;
        var dataEntryType = $(document).find("#dataEntryType").val();
        if(dataEntryType == "MONTHLY"){
            var year = parseInt("20"+timelineUnit.split("-")[1]);
            var month = self.options.months.indexOf(timelineUnit.split("-")[0]);
            var newDate = moment();
            newDate.set('year', year);
            newDate.set('month', month);
            return newDate.startOf("month").format("MM/DD/YYYY");
        }else if(dataEntryType == "QUARTERLY"){
            var year = parseInt("20"+timelineUnit.split("-")[1]);
            var quarter = parseInt(timelineUnit.split("-")[0].charAt(1));
            var newDate = moment();
            newDate.set('year', year);
            newDate.set('quarter', quarter);
            return newDate.startOf("quarter").format("MM/DD/YYYY");
        }else if(dataEntryType == "YEARLY"){
            var year = parseInt(timelineUnit);
            var newDate = moment();
            newDate.set('year', year);
            return newDate.startOf("year").format("MM/DD/YYYY");
        }
    },
    getEndDateByTimeLineUnit: function(timelineUnit){
        var self = this;
        var dataEntryType = $(document).find("#dataEntryType").val();
        if(dataEntryType == "MONTHLY"){
            var year = parseInt("20"+timelineUnit.split("-")[1]);
            var month = self.options.months.indexOf(timelineUnit.split("-")[0]);
            var newDate = moment();
            newDate.set('year', year);
            newDate.set('month', month);
            return newDate.endOf("month").format("MM/DD/YYYY");
        }else if(dataEntryType == "QUARTERLY"){
            var year = parseInt("20"+timelineUnit.split("-")[1]);
            var quarter = parseInt(timelineUnit.split("-")[0].charAt(1));
            var newDate = moment();
            newDate.set('year', year);
            newDate.set('quarter', quarter);
            return newDate.endOf("quarter").format("MM/DD/YYYY");
        }else if(dataEntryType == "YEARLY"){
            var year = parseInt(timelineUnit);
            var newDate = moment();
            newDate.set('year', year);
            return newDate.endOf("year").format("MM/DD/YYYY");
        }
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.aspForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.aspForm.find('select').attr("disabled", true);
        self.el.aspForm.find('textarea').attr("disabled", true);
        self.el.aspForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.aspForm.find('button[type="button"]').not("#submitButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.aspForm.attr("href", "#");
    },
    destroy: function () {
    }
});
