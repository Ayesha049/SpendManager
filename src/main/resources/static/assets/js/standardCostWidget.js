$.widget("forecast.standardCost", {
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
        lineItem: {
            id: '',
            type:'',
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
        },
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
        quarters: ["Q1", "Q2", "Q3", "Q4"],
        tableRowsName: [],
        colorBank: ['#33cccc','#c44dff','#e60000','#1a1aff','#00cc44','#ff6600','#1ac6ff'],
        tableHeaders: []
    },
    _create: function () {
        console.log("ASLOG :: ---------- sc widget create ----------");

        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        self.data.deviceMap = {};
        self.data.chipsetMap = {};
        self.data.chipsetLineItemData = {};
        self.data.deviceLineItemData = {};

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
            });
        }

        if(self.options.chipsetList != undefined){
            $.each(self.options.chipsetList, function(index, item){
                var items = {};
                items["id"] = item.id;
                items["chipsetNumber"] = item.chipsetNumber;
                items["deviceList"] = item.deviceList;
                self.data.chipsetMap[item.id] = items;
            });
        }

        // UI element Initialization
        self.el.aspForm = $("#standardCost_form");
        self.el.id = $(document).find("#id");
        self.el.dynamicRowDiv = $("#dynamicRowDiv");
        self.el.dataEntryType = $("#dataEntryType");
        self.el.fromDate = $("#fromDate");
        self.el.toDate = $("#toDate");
        self.el.chipsetTableCreation = $(".chipsetTableCreation");
        self.el.submitButton = $("#submitButton");

        self.el.gobackButton = '<a href="/admin/standardCostList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<button type="button" class="btn btn-primary lineItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.removeButton = '<button type="button" class="btn btn-danger lineItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';
        self.el.rulesAddButton = '<a type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.rulesRemoveButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';

    },
    _init: function () {
        console.log("ASLOG :: ---------- sc widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();
        self.uiEventInitialization();

        if (self.options.lineItemListSize > 0) {
            self.createLineItemMapForUpdate();
            $.each(self.options.lineItemList, function (index, lineItem) {
                self.addLineItemForProduct(true, lineItem);
                var selectedElement = self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last');
                self.createLineItemHtmlExceptTable(lineItem.type, index, selectedElement, lineItem);
                self.setTableHtml(selectedElement, lineItem.chipsetId, lineItem.deviceId, lineItem.lineItemDetailList,lineItem.iPartNumberId);
                $(document).find(".devicePriceInput").trigger("keyup"); //to count the total
            });
            self.addPlusIconForTheLastItem();
        }
        if (self.options.viewOnly == true){
            self.disableForViewOnly();
        }
    },
    createLineItemMapForUpdate: function () {
        var self = this;
        $.each(self.options.lineItemList, function (index, lineItem) {
            var chipsetOrDeviceNumber = lineItem.chipsetId != "" ? lineItem.chipsetId: lineItem.deviceId;
            $.each(lineItem.lineItemDetailList, function (index, itemDetails) {

                if(lineItem.chipsetId != ""){ //chipset
                    self.data.chipsetLineItemData[chipsetOrDeviceNumber+'_'+itemDetails.timelineUnit+'_'+itemDetails.deviceId+'_netPrice'] = itemDetails.netPrice;
                    self.data.chipsetLineItemData[chipsetOrDeviceNumber+'_'+itemDetails.timelineUnit+'_'+itemDetails.deviceId+'_id'] = itemDetails.id;
                }else{ //device
                    self.data.deviceLineItemData[chipsetOrDeviceNumber+'_'+itemDetails.timelineUnit+'_'+lineItem.iPartNumberId+'_netPrice'] = itemDetails.netPrice;
                    self.data.deviceLineItemData[chipsetOrDeviceNumber+'_'+itemDetails.timelineUnit+'_'+lineItem.iPartNumberId+'_id'] = itemDetails.id;
                }
            });
        });

        console.log("ASLOG self.data.lineItemDetailsMapForChipset::"+JSON.stringify(self.data.chipsetLineItemData));
        console.log("ASLOG self.data.lineItemDetailsMapForDevice::"+JSON.stringify(self.data.deviceLineItemData));
    },
    initiateFormValidation: function () {
        var self = this;

        var validateJson = {
            rules: {
                SCNumber: {
                    required: true
                },
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
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("line-item-iPartNumber", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("priceInput", {required: true, number: true});
    },
    uiEventInitialization: function () {
        var self = this;

        $(document).on('click', 'button.lineItemAddButton', function () {
            self.addLineItemForProduct(true, self.options.lineItem);
            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'button.lineItemRemoveButton', function () {
            $(this).parent().parent().parent().parent().remove();
            self.addPlusIconForTheLastItem();

            self.reIndexLineItems();
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

            if(self.isChipsetUnique(chipsetId, $(this))){
                var selectedElement = $(this).parent().parent().parent().parent();
                self.setTableHtml(selectedElement, chipsetId, "", []);
            }else{
                $(this).val("");
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("Standard Cost related to this chip set has already been entered."));
            }
        });

        $(document).on('change', 'select.line-item-device', function () {
            var deviceId = $(this).val();
            var selectedElement = $(this).parent().parent().parent().parent();
            var iPartNumberId = selectedElement.find('div select.line-item-iPartNumber').val();
            if(self.isDeviceUnique(deviceId, iPartNumberId, $(this).parent().parent().parent().parent())){
                self.setTableHtml(selectedElement, "", deviceId, [],iPartNumberId);
                var index = $(selectedElement).attr("attr-index");
                $(selectedElement).find('div.line-item-iPartNumber-div').html(self.getiPartNumberSelectBoxHtml(index, '', selectedElement));
            }else{
                $(this).val("");
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("Standard Cost for this RFIC has already been entered."));
            }
        });

        $(document).on('change', 'select.line-item-iPartNumber', function () {
            var iPartNumberId = $(this).val();
            var selectedElement = $(this).parent().parent().parent().parent();
            var deviceId = selectedElement.find('div select.line-item-device').val();

            if(!self.isDeviceUnique(deviceId, iPartNumberId, selectedElement)){
                $(this).val("");
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("Standard Cost for this RFIC has already been entered."));
            }
        });

        $(document).on('keyup', '.devicePriceInput', function () {
            self.updateColumnTotal($(this).closest('table'), $(this).attr('index'));
        });

        $(document).on('keyup', '.chipsetPriceInput', function () {
            self.checkChipsetTotal($(this).closest('table'), $(this).attr('index'));
        });
        
        self.el.dataEntryType.on("change", function (){
            self.createLineItem();
        });

        self.el.fromDate.datetimepicker({ useCurrent: false, format: Forecast.APP.GLOBAL_DATE_FORMAT_US }).on('dp.change', function (event) {
            var fromDate = Forecast.APP.convertDate(event.date.toDate());
            self.checkValidDate(fromDate,self.el.fromDate)
            self.isDateRangeValid();
            self.createLineItem();
        });

        self.el.toDate.datetimepicker({ useCurrent: false, format: Forecast.APP.GLOBAL_DATE_FORMAT_US }).on('dp.change', function (event) {
            var toDate = Forecast.APP.convertDate(event.date.toDate());
            self.checkValidDate(toDate,self.el.toDate);
            self.isDateRangeValid();
            self.createLineItem();
        });
    },
    checkValidDate: function (date,element) {
        var self = this;
        $.each(self.options.SCList, function (index, item) {
            if(Forecast.APP.checkOverlappingDate(item.fromDate,item.toDate,date)) {
                element.val("");
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("This date is already been used in SC Number : " + item.SCNumber));
                return false;
            }
        });
        return true;
    },
    isDateRangeValid: function(){
        var self = this;
        var fromDate = self.el.fromDate.val();
        var toDate = self.el.toDate.val();
        if(fromDate == "" || toDate == "") {
            return false;
        } else{
            $.each(self.options.SCList, function (index, item) {
                if(Forecast.APP.checkOverlappingDate(fromDate,toDate,item.fromDate)) {
                    self.el.fromDate.val("");
                    self.el.toDate.val("");
                    bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("This date range overlaps SC Number : " + item.SCNumber));
                    return false;
                } else if(Forecast.APP.checkOverlappingDate(fromDate,toDate,item.toDate)) {
                    self.el.fromDate.val("");
                    self.el.toDate.val("");
                    bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("This date range overlaps SC Number : " + item.SCNumber));
                    return false;
                }
            });
        }
    },
    isChipsetUnique: function(chipsetId, selectedElement){
        var self = this;
        var isUnique = true;

        self.el.dynamicRowDiv.find('div select.line-item-chip-set').not(selectedElement).each(function(){
            if($(this).val() == chipsetId) isUnique = false;
        });

        return isUnique;
    },
    isDeviceUnique: function(deviceId, iPartNumberId, selectedDiv){
        var self = this;
        var isUnique = true;

        self.el.dynamicRowDiv.find('div.line-item-dynamic-row').not(selectedDiv).each(function(){
            if($(this).find('div select.line-item-device').val() == deviceId &&
                $(this).find('div select.line-item-iPartNumber').val() == iPartNumberId) isUnique = false
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

            self.reIndexLineItemDetails(lineItemIndex, $(this));

            lineItemIndex++;
        });
    },
    reIndexLineItemDetails: function(lineItemIndex, selectedDiv){
        var self = this;
        $(selectedDiv).find('table tbody tr td').each(function(){
            if(!$(this).hasClass('deviceCountColumn')){
                if($(this).find('input.netPrice').length > 0) {
                    var currentNameArray = $(this).find('input.netPrice').attr('name').split(".");
                    var updatedName = 'lineItemList[' + lineItemIndex + '].' + currentNameArray[1];

                    $(this).find('input.netPrice').attr('name', updatedName+'.netPrice');
                    $(this).find('div input.line-item-detail-id').attr('name', updatedName+'.id');
                    $(this).find('div input.line-item-detail-check_box').attr('name', updatedName+'.ownPrice');
                    $(this).find('div input.line-item-detail-device-number').attr('name', updatedName+'.device.id');
                    $(this).find('div input.line-item-detail-chip-set').attr('name', updatedName+'.chipset.id');
                    $(this).find('div input.line-item-detail-timeline').attr('name', updatedName+'.timelineUnit');
                }
            }
        });
    },
    createLineItem: function(){
        var self = this;

        var allDataInput = true;
        self.el.chipsetTableCreation.each(function (){
            if($(this).val() == "") {
                allDataInput = false;
            }
        });
        if(allDataInput){
            self.el.dynamicRowDiv.html("");
            self.addLineItemForProduct(true, self.options.lineItem);
            self.addPlusIconForTheLastItem();
        }
    },
    createLineItemHtmlExceptTable: function(type, index, selectedElement, lineItem) {
        var self = this;
        console.log("SMNLOG:: type = " + type);
        if(type == ""){
            $(selectedElement).find('div.line-item-product-div').html("");
        }else{
            if(type == "RFIC"){
                $(selectedElement).find('div.line-item-product-div').html(self.getDeviceSelectBoxHtml(index, lineItem.deviceId));
                if(lineItem.iPartNumberId != '') {
                    $(selectedElement).find('div.line-item-iPartNumber-div').html(self.getiPartNumberSelectBoxHtml(index, lineItem.iPartNumberId, selectedElement));
                }
            }else if(type == "CHIPSET"){
                $(selectedElement).find('div.line-item-product-div').html(self.getChipsetSelectBoxHtml(index, lineItem.chipsetId));
            }
        }
    },
    setTableHtml: function(selectedElement, chipsetId, deviceId, lineItemDetailList,iPartNumberId){
        var self = this;
        if(chipsetId != ""){
            self.getTableRowsNameByChipset(chipsetId);
        }else if(deviceId != ""){
            self.getTableRowsNameByDevice(deviceId);
        }
        var index = $(selectedElement).attr("attr-index");
        $(selectedElement).find("div.line-item-table-div").html(self.getDataEntryTableHtml(index, chipsetId, deviceId, lineItemDetailList,iPartNumberId));
    },
    getTableRowsNameByChipset: function (chipsetId){
        var self = this;
        var chipsetNumber = self.data.chipsetMap[chipsetId].chipsetNumber;
        self.options.tableRowsName = [];
        self.options.tableRowsName.push(chipsetNumber);
        $.each(self.data.chipsetMap[chipsetId].deviceList, function (index, item) {
            self.options.tableRowsName.push(item);
        });
    },
    getTableRowsNameByDevice: function (deviceId){
        var self = this;
        self.options.tableRowsName = [];
        self.options.tableRowsName.push(self.data.deviceMap[deviceId].deviceNumber);
    },
    getDataEntryTableHtml: function(lineItemIndex, chipsetId, deviceId, lineItemDetailList,iPartNumberId){
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
        if(chipsetId != ""){
            html += self.getTableBodyHtmlForChipset(lineItemIndex, chipsetId, lineItemDetailList);
        }else{
            html += self.getTableBodyHtmlForDevice(lineItemIndex, deviceId, lineItemDetailList,iPartNumberId);
        }
        html += '</tbody>';
        html += '</table>';

        return html;
    },
    getLineItemDetailListForCreation: function(isDevice){
        var self = this;
        var numberOfColumn = self.options.tableHeaders.length;
        var lineItemDetailIndex = 0;
        var lineItemDetailList = [];

        if(isDevice){
            var i = 0;
            while(i < numberOfColumn){
                    var lineItemDetail = {
                        id: '',
                        netPrice: '',
                        endDate: self.getEndDateByTimeLineUnit(self.options.tableHeaders[i]),
                        startDate: self.getStartDateByTimeLineUnit(self.options.tableHeaders[i]),
                        timelineUnit: self.options.tableHeaders[i],
                        deviceId: '',
                        chipsetId: '',
                    };

                    lineItemDetailList[lineItemDetailIndex] = lineItemDetail;
                    lineItemDetailIndex++;
                i++;
            }
        }else{
            $.each(self.options.tableRowsName, function (index, item){
                var i = 0;
                while(i < numberOfColumn){
                    if(i != 0){
                        var lineItemDetail = {
                            id: '',
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
        }

        return lineItemDetailList;
    },
    getTableHeaderHtml: function(isDevice){
        var self = this;
        var html = "";
        var index = 0;
        var dataEntryType = self.el.dataEntryType.val();
        var fromDate = self.el.fromDate.val();
        var toDate = self.el.toDate.val();
        self.options.tableHeaders = [];
        if(!isDevice) self.options.tableHeaders.push("Device Count");
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
    getTableBodyHtmlForChipset: function (lineItemIndex, chipsetId, lineItemDetailList){
        var self = this;
        var chipsetNumber = self.data.chipsetMap[chipsetId].chipsetNumber;
        var html = "";
        var numberOfColumn = self.options.tableHeaders.length;
        var lastItem = '';
        var currentItem = '';
        var colorIndex = -1;
        var lineItemDetailIndex = 0;

        $.each(self.options.tableRowsName, function (index, item) {
            var i = 0;
            html += '<tr attr-tableRowIndex="'+ index +'">';
            if(index == 0) {
                html += '<th style="min-width: 200px;" attr-item="'+ item +'" >' + item + '</th>';
            } else {
                html += '<th style="min-width: 200px;" attr-item="'+ item.deviceNumber +'" >' + item.deviceNumber + '</th>';
            }
            while(i < numberOfColumn){
                if(self.options.tableHeaders[i].split('-')[1] == undefined){
                    currentItem = self.options.tableHeaders[i];
                }else{
                    currentItem = self.options.tableHeaders[i].split('-')[1];
                }

                if(currentItem != lastItem){
                    colorIndex += 1;
                }

                if(i == 0){
                    html += '<td index="'+i+'" class="deviceCountColumn">';

                    if(index != 0){
                        html += '<span attr-header="'+item.deviceNumber+'" attr-colorIndex="'+ colorIndex +'" style="width: 130px; color: '+self.options.colorBank[colorIndex]+'">';
                        html += item.deviceCount;
                    }else{
                        html += '<span attr-header="'+item+'" attr-colorIndex="'+ colorIndex +'" style="width: 130px; color: '+self.options.colorBank[colorIndex]+'">';
                        html += "--";
                    }
                    html += '</span>'
                    html += '</td>';
                } else{
                    if(index == 0){
                        html += '<td index="'+i+'" attr-time="'+self.options.tableHeaders[i]+'" attr-lineItemDetailIndex="'+lineItemDetailIndex+'">';
                        html += '<input type="text" attr-header="Total Device Price" attr-time="'+self.options.tableHeaders[i]+'" ';
                        html += 'class="form-control ';
                        html += ' devicePriceInput totalDevicePrice netPrice"';
                        html += ' name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].netPrice"';
                        html += 'index="'+i+'" style="width: 130px; color: '+self.options.colorBank[colorIndex]+'"readonly/>';

                    }else {
                        var key = chipsetId+'_'+self.options.tableHeaders[i] + '_' + item.id+'_netPrice';
                        html += '<td index="'+i+'" attr-time="'+self.options.tableHeaders[i]+'" attr-lineItemDetailIndex="'+lineItemDetailIndex+'">';
                        html += '<input type="text" attr-header="'+item.deviceNumber+'" attr-time="'+self.options.tableHeaders[i]+'" ';
                        html += 'class="form-control ';
                        html += ' devicePriceInput priceInput netPrice"';
                        html += 'name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].netPrice"';
                        html += 'value="'+self.getCellDataFromMap(key,false)+'"';
                        html += 'index="'+i+'" style="width: 130px; color: '+self.options.colorBank[colorIndex]+'"/>';
                    }
                    html += self.getHiddenInputBinding(index, item, lineItemIndex, lineItemDetailIndex, lineItemDetailList, false,self.options.tableHeaders[i],chipsetNumber,chipsetId, item.id);
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
    getTableBodyHtmlForDevice: function (lineItemIndex, deviceId, lineItemDetailList,iPartNumberId) {
        var self = this;
        var html = "";
        var numberOfColumn = self.options.tableHeaders.length;
        var lastItem = '';
        var currentItem = '';
        var colorIndex = -1;
        var deviceNumber = self.data.deviceMap[deviceId].deviceNumber;

        $.each(self.options.tableRowsName, function (index, item) {
            var i = 0;
            var lineItemDetailIndex = 0;
            html += '<tr attr-tableRowIndex="'+ index +'">';
            html += '<th style="min-width: 200px;" attr-item="'+ deviceNumber +'" >' + item + '</th>';
            while (i < numberOfColumn) {
                currentItem = self.options.tableHeaders[i].split('-')[1];
                if (currentItem != lastItem) {
                    colorIndex += 1;
                }
                var key = deviceId+'_'+self.options.tableHeaders[i]+'_'+iPartNumberId+'_netPrice' ;
                html += '<td index="'+i+'" attr-time="'+self.options.tableHeaders[i]+'" attr-lineItemDetailIndex="'+lineItemDetailIndex+'" >';
                html += '<input type="text" attr-header="'+item+'" attr-time="'+self.options.tableHeaders[i]+'" class="form-control ';
                html += 'netPrice priceInput"';
                html += 'name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].netPrice"';
                html += 'value="'+self.getCellDataFromMap(key,true)+'"';
                html += 'index="'+i+'" style="width: 130px; color: '+self.options.colorBank[colorIndex]+'"/>';
                html += self.getHiddenInputBinding(index, deviceNumber, lineItemIndex, lineItemDetailIndex, lineItemDetailList, true,self.options.tableHeaders[i],'','', deviceId,iPartNumberId );
                html += '</td>';
                lineItemDetailIndex++;
                i++;
                lastItem = currentItem;

            }
            colorIndex = -1;
            html += '</tr>';
        });

        return html;
    },
    getHiddenInputBinding: function(index, item, lineItemIndex, lineItemDetailIndex, lineItemDetailList, isDevice, timelineUnit, chipsetNumber, chipsetId, deviceId,iPartNumberId){

        var self = this;

        var key = '';
        if(isDevice) {
            key += deviceId+'_'+timelineUnit+'_'+iPartNumberId+'_id' ;
        } else {
            if(index == 0) {
                key +=chipsetId+'_'+timelineUnit+'__id';
            } else key +=chipsetId+'_'+timelineUnit+ '_' + deviceId+'_id';
        }
        var html = '<div class="columnHiddenDiv" style="display: none">';
        html += '<input class="line-item-detail-id" name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].id" style="display: none;" value="'+self.getCellDataFromMap(key,isDevice)+'"/>';
        if(isDevice || index == 0) {
            html += '<input type="checkbox" class="line-item-detail-check_box" name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].ownPrice" checked style="display: none;" />';
        } else {
            html += '<input type="checkbox" class="line-item-detail-check_box" name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].ownPrice" style="display: none;" />';
        }
        html += '<input name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + ']';
        if(isDevice){
            html += '.device.id"';
            html += 'class="line-item-detail-device-number"';
            html += 'style="display: none;" value="'+deviceId+'"/>';
        }else{
            if(index == 0){
                html += '.chipset.id"';
                html += 'class="line-item-detail-chip-set"';
                html += 'style="display: none;" value="'+chipsetId+'"/>';
            }else{
                html += '.device.id"';
                html += 'class="line-item-detail-device-number"';
                html += 'style="display: none;" value="'+deviceId+'"/>';
            }
        }
        html += '<input class="line-item-detail-timeline" name="lineItemList[' + lineItemIndex + '].lineItemDetailList[' + lineItemDetailIndex + '].timelineUnit" style="display: none;" value="'+timelineUnit+'"/>';
        html += '<div class="ruleHiddenDiv" style="display: none">';

        html += '</div>';
        html += '</div>';

        return html;
    },
    getCellDataFromMap: function(key,isDevice){
        var self = this;
        if(!isDevice) {
            if(self.data.chipsetLineItemData[key] != undefined){
                return self.data.chipsetLineItemData[key];
            }else{
                return '';
            }
        } else {
            if(self.data.deviceLineItemData[key] != undefined){
                return self.data.deviceLineItemData[key];
            }else{
                return '';
            }
        }

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
        var html = '<div class="form-group row ">';
        html += '<label class="col-md-3 col-form-label">' + self.options.messages.chipSetNumber + '</label>';
        html += '<div class="col-md-9">';
        html += '<select name="lineItemList[' + index + '].chipset.id" class="custom-select line-item-chip-set" placeholder="Chip Set">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.data.chipsetMap, function (index, item) {
            if (selectedValue == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.chipsetNumber + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.chipsetNumber + '</option>';
            }
        });
        html += '</select>';
        html += '</div>';
        html += '</div>';
        return html;
    },
    getDeviceSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<div class="form-group row ">';
        html += '<label class="col-md-3 col-form-label">RFIC</label>';
        html += '<div class="col-md-9">';
        html += '<select name="lineItemList[' + index + '].device.id" class="custom-select line-item-device" placeholder="RFIC">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.data.deviceMap, function (index, item) {
            if (selectedValue == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.deviceNumber + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.deviceNumber + '</option>';
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
                    html += '<option value="' + item.id + '">' + item.iPartNumber + '</option>';
                }
            });
        }
        html += '</select>';
        html += '</div>';
        html += '</div>';
        return html;
    },
    addLineItemForProduct: function (isPlusIcon, lineItem) {
        var self = this;
        var index = self.el.dynamicRowDiv.find('div.line-item-dynamic-row').length;
        var $rowToAppend = '<div class="row line-item-dynamic-row lineItemBorder" attr-index="' + index + '" style="padding-right: 0px; padding-left: 0px;">'
            + '<div class="col-lg-4 px-5">'
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
        var totalItem;

        $(table).find('tbody tr td input[index="'+index+'"]').each(function(idx, item){
            if($(item).hasClass("totalDevicePrice")){
                totalItem = item;
            } else if($(item).hasClass("devicePriceInput")){
                var price = +$(item).val();
                var count = +$(item).parent().parent().find('.deviceCountColumn').find('span').html();
                lineTotal += parseFloat(price * count);
            }
        });

        $(totalItem).val(lineTotal.toFixed(2));
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
        var dataEntryType = self.el.dataEntryType.val();
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
        var dataEntryType = self.el.dataEntryType.val();
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
