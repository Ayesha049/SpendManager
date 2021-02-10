$.widget("forecast.waferRequired", {
    options: {
        messages: undefined,
        productionPlanList: undefined,
        deviceList: undefined,
        chipsetList: undefined,
        viewOnly :undefined,
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
        colorBank: ['#33cccc','#c44dff','#e60000','#1a1aff','#00cc44','#ff6600','#1ac6ff'],
        tableHeaders: []
    },
    _create: function () {
        console.log("SMNLOG :: ---------- wafer required widget create ----------");
        var self = this;
        self.el = {};
        self.data = {};
        self.data.demandAssessment = {};
        self.data.devicetoTapeoutMap = {};
        self.data.chipsetDeviceListmap = {};
        self.data.productionPlanMap = {};
        self.data.daDetailsMap = {};
        self.data.waferRequiredMap = {};
        self.data.tapeOutToWaferRequiredMap = {};
        self.data.deviceQtyMap = {};
        self.data.chipsetToTapeOutMap = {};

        if(self.options.productionPlanList != undefined) {
            $.each(self.options.productionPlanList, function (index, productionPlan) {
                self.data.productionPlanMap[productionPlan.id] = productionPlan;
            });
        }

        if(self.options.deviceList != undefined) {
            $.each(self.options.deviceList, function (index, device) {
                self.data.devicetoTapeoutMap[device.id] = device;
            })
        }

        if(self.options.chipsetList != undefined) {
            $.each(self.options.chipsetList, function (index, chipset) {
                self.data.chipsetDeviceListmap[chipset.id] = chipset.deviceList;
                var uniqueTapeOutList = [];
                $.each(chipset.deviceList, function (index,device) {
                    var tapeOut = self.data.devicetoTapeoutMap[device.id].tapeOutNumber;
                    if(!uniqueTapeOutList.includes(tapeOut)) {
                        uniqueTapeOutList.push(tapeOut);
                    }
                })
                self.data.chipsetToTapeOutMap[chipset.id] = uniqueTapeOutList;
            })
        }

        console.log(self.data.chipsetDeviceListmap);
        console.log(self.data.devicetoTapeoutMap);
        console.log(self.data.chipsetToTapeOutMap);

        self.el.waferRequiredForm = $("#wafer_required_form");
        self.el.daSelect = $("#daSelect");
        self.el.fromDate = $("#fromDate");
        self.el.toDate = $("#toDate");
        self.el.dynamicRowDiv = $("#dynamicRowDiv");


        self.el.gobackButton = '<a href="/admin/parameterList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<a type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.removeButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';

    },
    _init: function () {
        console.log("SMNLOG :: ---------- wafer required widget init ----------");
        var options = this.options;
        var self = this;

        self.initiateFormValidation();
        self.uiEventInitialization();
    },
    initiateFormValidation: function () {
        var self = this;
        var validateJson = {
            rules: {
                daSelect: {
                    required: true,
                }
            },
            messages: {
            },
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };
        self.el.waferRequiredForm.validate(validateJson);

    },
    uiEventInitialization: function () {
        var self = this;

        self.el.daSelect.on("change", function () {
           var daId = $(this).val();

           $.get('/admin/getDemandAssessment', {id: daId}, function (da) {

                self.data.demandAssessment = JSON.parse(da);
                self.fillDataFromDA();
                console.log(self.data.demandAssessment);

           }).always(function () {
                console.log('loading successful');
           });

        });

        $(document).on('change', '.productionPlanSelect', function () {
            var PPId = $(this).val();
            var gdpw = $(this).closest('tr.deviceTr').find('.gdpw').html();
            var productionPlan = self.data.productionPlanMap[PPId];
            var endToendYeild = parseFloat(productionPlan.endToEndYield).toFixed(2);

            var ufgDie = parseFloat(parseFloat(gdpw) * (endToendYeild/100)).toFixed(2);
            var chipsetId = $(this).closest('tr.deviceTr').attr('attr-chipset');
            var tapeOutNumber = $(this).closest('tr.deviceTr').attr('attr-tapeOut');
            var deviceId = $(this).closest('tr.deviceTr').attr('attr-device');

            self.data.waferRequiredMap[chipsetId+'_'+tapeOutNumber+'_'+deviceId] = ufgDie;

            $(this).closest('tr.deviceTr').find('.ufg-die').html(ufgDie);
            $(this).closest('tr.deviceTr').find('.fab-ct').html(productionPlan.FAB_CT);
            $(this).closest('tr.deviceTr').find('.bump').html(productionPlan.BUMP_CT);
            $(this).closest('tr.deviceTr').find('.assy').html(productionPlan.ASSEMBLY);
            $(this).closest('tr.deviceTr').find('.test').html(productionPlan.TEST_PO);
            $(this).closest('tr.deviceTr').find('.module').html(productionPlan.MODULE);
            $(this).closest('tr.deviceTr').find('.end-to-end-yield').html(endToendYeild);

            $(this).closest('div.product-item-div').find('table.waferRequiredTable').
            find('tr[attr-tapeOutDevice = "'+tapeOutNumber+'_'+deviceId+'"]').find('td.waferRequiredTimeLineTd').each(function () {
                var timelineUnit = $(this).attr('attr-timeLine');
                var key = chipsetId + '_' + deviceId+ '_' + timelineUnit;
                var deviceQty = parseFloat(self.data.deviceQtyMap[key]);
                if(ufgDie > 0) {
                    var waferRequired = parseFloat(deviceQty/ufgDie).toFixed(2);
                    $(this).html(waferRequired);
                }
            })

            var selectedDiv = $(this).closest('div.product-item-div');
            self.updateTapeOutTable(selectedDiv);
        })

        $(document).on('change', '.productionPlanSelectAll', function () {
            var PPId = $(this).val();

            $(this).closest('div.product-item-div').find('table.product-table tr').each(function () {
                $(this).find('select.productionPlanSelect').val(PPId).trigger('change');
            })
        })

    },
    updateTapeOutTable(selectedDiv) {
        var self = this;
        self.data.tapeOutToWaferRequiredMap = {};
        selectedDiv.find('table.waferRequiredTable').find('td.waferRequiredTimeLineTd').each(function () {
            var tapeOutNumber = $(this).attr('attr-tapeout')
            var value = $(this).html();
            console.log(tapeOutNumber + ' ' + value);
        })
    },
    fillDataFromDA: function () {
        var self = this;
        self.el.fromDate.val(self.data.demandAssessment.fromDate);
        self.el.toDate.val(self.data.demandAssessment.toDate);
        //TODO: need to add promise
        self.createDADetailsMap();

        $.each(self.data.demandAssessment.lineItemList, function (index, lineItem) {
            self.addLineItem(lineItem);
        })
    },
    createDADetailsMap: function() {
        var self = this;
        $.each(self.data.demandAssessment.lineItemList, function (index, lineItem) {
            var chipsetOrDeviceNumber = lineItem.chipsetOrDevice == 'CHIPSET'? lineItem.chipsetId: lineItem.deviceId;
            $.each(lineItem.lineItemDetailsList, function(index, lineItemDetails) {
                self.data.daDetailsMap[lineItem.chipsetOrDevice+'_'+chipsetOrDeviceNumber + '_' + lineItemDetails.timeLineUnit] = lineItemDetails.total;
            });
        })
        console.log(self.data.daDetailsMap);
    },
    getDataFromMap: function(map,key) {
        var self = this;
        //console.log(key);
        if(map[key] == undefined) {
            return '';
        }else return map[key];
    },
    addLineItem: function (lineItem) {
        var self = this;
        var html = '';
        if(lineItem.chipsetOrDevice == "CHIPSET") {
            html += '<div class="row lineItemBorder product-item-div" attr-productType="CHIPSET" attr-productId="' + lineItem.chipsetId + '" style="padding-right: 0px; padding-left: 0px;">'
            html += self.addChipsetTable(lineItem.chipsetNumber,lineItem.chipsetId);
            html += '<div class="col-md-12 text-center"><h3 style="font-weight: bold; margin-top: 10px;">Chip Set Qty</h3></div>'
            html += self.addChipsetQuantityTable(lineItem.chipsetNumber,lineItem.chipsetId);
            html += '<div class="col-md-12 text-center"><h3 style="font-weight: bold; margin-top: 10px;">Device Qty</h3></div>'
            html += self.addDeviceQuantityTable(lineItem.chipsetNumber,lineItem.chipsetId);
            html += '<div class="col-md-12 text-center"><h3 style="font-weight: bold; margin-top: 10px;">Wafer Required</h3></div>'
            html += self.addWaferRequiredTable(lineItem.chipsetNumber,lineItem.chipsetId);
            html += '<div class="col-md-12 text-center"><h3 style="font-weight: bold; margin-top: 10px;">Wafer Required for Tape out</h3></div>'
            html += self.addWaferRequiredTapeOutTable(lineItem.chipsetNumber,lineItem.chipsetId);
            html += '</div>';
        } else {

        }
        self.el.dynamicRowDiv.append(html);
    },
    addChipsetTable: function (chipsetNumber,chipsetId) {
        var self = this;
        var html = '';
        /*html += '<div class="row lineItemBorder product-item-div" attr-product="' + chipsetNumber + '" style="padding-right: 0px; padding-left: 0px;">'*/

        html += '<div class="col-md-4">'
        html += '<div class="form-group row">'
        html += '<label class="col-md-3 col-form-label">Chip Set</label>'
        html += '<div class="col-md-9">'
        html += '<input class="form-control" value="'+chipsetNumber+'" readonly/>'
        html += '</div>'
        html += '</div>'
        html += '</div>'
        html += '<div class="col-md-4">'
        html += '<div class="form-group row">'
        html += '<label class="col-md-3 col-form-label">Production Plan</label>'
        html += '<div class="col-md-9">'
        html += self.getSelectBoxHtml('productionPlanSelectAll')
        html += '</div>'
        html += '</div>'
        html += '</div>'

        html += '<div class="col-md-12">'
        html += '<table class="table table-striped custom-table da-grid-table product-table" style="margin: 2px;">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>SL#</th>';
        html += '<th>Reticule</th>';
        html += '<th>Device Number</th>';
        html += '<th>GDPW</th>';
        html += '<th>UFG Die</th>';
        html += '<th>production Plan</th>';
        html += '<th>Fab</th>';
        html += '<th>Bump</th>';
        html += '<th>Assy</th>';
        html += '<th>Test</th>';
        html += '<th>Module</th>';
        html += '<th>End to end</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';

        $.each(self.data.chipsetDeviceListmap[chipsetId], function (index, item){

            var device = self.data.devicetoTapeoutMap[item.id];

            html += '<tr class="deviceTr" attr-chipset="'+chipsetId+'" attr-device="'+device.id+'" attr-tapeOut="'+device.tapeOutNumber+'">';
            html += '<th>'+(index+1)+'</th>';
            html += '<td>'+device.tapeOutNumber+'</td>';
            html += '<td>'+device.deviceNumber+'</td>';
            html += '<td class="gdpw">'+device.gdpw+'</td>';
            html += '<td class="ufg-die">'+"N/A"+'</td>';
            html += '<td style="width: 200px;">'+self.getSelectBoxHtml('productionPlanSelect')+'</td>';
            html += '<td class="fab-ct">'+"N/A"+'</td>';
            html += '<td class="bump">'+"N/A"+'</td>';
            html += '<td class="assy">'+"N/A"+'</td>';
            html += '<td class="test">'+"N/A"+'</td>';
            html += '<td class="module">'+"N/A"+'</td>';
            html += '<td class="end-to-end-yield">'+"N/A"+'</td>';
            html += '</tr>';
        });

        html += '</tbody>';
        html += '</table>';
        html += '</div>';

        /*html += '</div>';*/
        return html;
    },
    addChipsetQuantityTable: function(chipsetNumber,chipsetId) {
        var self = this;
        var html = '';

        html += '<div class="col-md-12">'
        html += '<table class="table table-striped custom-table da-grid-table" style="display: block; overflow-x: auto;">';
        html += '<thead>';
        html += '<tr>';
        html += '<th></th>';

        html += self.getTableHeaderHtml();
        html += '</tr>';
        html += '</thead>';
        html += '<tbody style="overflow: auto;">';
        html += '<tr>';
        html += '<th style="min-width: 200px;" >' + chipsetNumber + '</th>';

        $.each(self.options.tableHeaders, function (index, timelineUnit) {
            var key = "CHIPSET_" + chipsetId + '_' + timelineUnit;
            html += '<td>'+self.getDataFromMap(self.data.daDetailsMap,key)+'</td>';
        });

        html += '</tr>';
        html += '</tbody>';
        html += '</table>';
        html += '</div>';

        return html;
    },
    addDeviceQuantityTable: function(chipsetNumber,chipsetId) {
        var self = this;
        var html = '';

        html += '<div class="col-md-12">'
        html += '<table class="table table-striped custom-table da-grid-table" style="display: block; overflow-x: auto;">';
        html += '<thead>';
        html += '<tr>';
        html += '<th></th>';
        html += '<th style="min-width: 110px;">Device Count</th>';
        html += self.getTableHeaderHtml();
        html += '</tr>';
        html += '</thead>';
        html += '<tbody style="overflow: auto;">';

        $.each(self.data.chipsetDeviceListmap[chipsetId], function (index, device) {
            html += '<tr>';
            html += '<th style="min-width: 200px;" >' + device.deviceNumber + '</th>';
            html += '<td>'+device.deviceCount+'</td>';
            $.each(self.options.tableHeaders, function (index, timelineUnit) {
                var key = "CHIPSET_" + chipsetId + '_' + timelineUnit;
                var csQty = +self.getDataFromMap(self.data.daDetailsMap,key);
                var deviceQty = (+device.deviceCount) * csQty;
                self.data.deviceQtyMap[chipsetId+'_'+device.id+'_'+timelineUnit] = deviceQty;
                html += '<td>'+deviceQty+'</td>';
            });
            html += '</tr>';
        });

        html += '</tbody>';
        html += '</table>';
        html += '</div>';

        return html;
    },
    addWaferRequiredTable: function (chipsetNumber,chipsetId) {
        var self = this;
        var html = '';

        html += '<div class="col-md-12">'
        html += '<table class="table table-striped custom-table da-grid-table waferRequiredTable" style="display: block; overflow-x: auto;">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Reticule</th>';
        html += '<th style="min-width: 110px;">Device Number</th>';
        html += self.getTableHeaderHtml();
        html += '</tr>';
        html += '</thead>';
        html += '<tbody style="overflow: auto;">';

        $.each(self.data.chipsetDeviceListmap[chipsetId], function (index, device) {
            var deviceNumber = device.deviceNumber;
            var tapeoutNumber = self.data.devicetoTapeoutMap[device.id].tapeOutNumber;
            html += '<tr attr-tapeOutDevice="'+tapeoutNumber+'_'+device.id+'">';
            html += '<th style="min-width: 200px;" >' + tapeoutNumber + '</th>';
            html += '<td>'+deviceNumber+'</td>';
            $.each(self.options.tableHeaders, function (index, timelineUnit) {
                /*var key = chipsetNumber + '_' + timelineUnit;
                var csQty = +self.getDataFromMap(self.data.daDetailsMap,key);
                var deviceQty = (+device.deviceCount) * csQty;*/
                var waferRequired = 'N/A';
                /*if(ufgDie != 'N/A' && ufgDie > 0) {
                    waferRequired = parseFloat(deviceQty/ufgDie).toFixed(2);
                }*/
                html += '<td class="waferRequiredTimeLineTd" attr-tapeout="'+tapeoutNumber+'" attr-timeLine="'+timelineUnit+'">'+waferRequired+'</td>';
            });
            html += '</tr>';
        });

        html += '</tbody>';
        html += '</table>';
        html += '</div>';

        return html;
    },
    addWaferRequiredTapeOutTable: function (chipsetNumber,chipsetId) {
        var self = this;
        var html = '';

        html += '<div class="col-md-12">'
        html += '<table class="table table-striped custom-table da-grid-table waferRequiredTapeOutTable" style="display: block; overflow-x: auto;">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Reticule</th>';
        html += self.getTableHeaderHtml();
        html += '</tr>';
        html += '</thead>';
        html += '<tbody style="overflow: auto;">';

        $.each(self.data.chipsetToTapeOutMap[chipsetId], function (index, tapeOutNumber) {

            html += '<tr>';
            html += '<th style="min-width: 200px;" >' + tapeOutNumber + '</th>';

            $.each(self.options.tableHeaders, function (index, timelineUnit) {
                var waferRequired = 'N/A';
                html += '<td class="waferRequiredTimeLineTd" attr-timeLine="'+timelineUnit+'">'+waferRequired+'</td>';
            });
            html += '</tr>';
        });

        html += '</tbody>';
        html += '</table>';
        html += '</div>';

        return html;
    },
    getSelectBoxHtml: function (cls) {
        var self = this;
        var html = '<select class="form-control '+cls+'">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(self.options.productionPlanList, function (index, item) {
            /*if (selectedItem == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.name + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.name + '</option>';
            }*/
            html += '<option value="' + item.id + '">' + item.name + '</option>';
        });
        html +='</select>';
        return html;
    },
    getTableHeaderHtml: function(){
        var self = this;
        var html = "";
        var index = 0;
        /*//var dataEntryType = $(document).find("#dataEntryType").val();
        var dataEntryType = 'MONTHLY';*/
        var fromDate = self.el.fromDate.val();
        var toDate = self.el.toDate.val();
        self.options.tableHeaders = [];
        var colorIndex = -1;
        var lastItem = '';
        var currentItem = '';
        self.getMonthlyTableHeaders(fromDate, toDate);

        /*if(dataEntryType == 'MONTHLY'){

        }else if(dataEntryType == "QUARTERLY"){
            self.getQuarterlyTableHeaders(fromDate, toDate);
        }else if(dataEntryType == "YEARLY"){
            self.getYearlyTableHeaders(fromDate, toDate);
        }*/

        $.each(self.options.tableHeaders, function (index, item) {

            if(item.split('-')[1] == undefined){
                currentItem = item;
            }else{
                currentItem = item.split('-')[1];
            }

            if(currentItem != lastItem){
                colorIndex += 1;
            }

            html += '<th index="'+index+'" attr-header="'+item+'" style="min-width: 110px; color: '+self.options.colorBank[colorIndex]+'">' + item + '</th>';
            lastItem = currentItem;
        });
        return html;
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
    disableForViewOnly: function(){
        var self = this;

        self.el.waferRequiredForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.waferRequiredForm.find('select').attr("disabled", true);
        self.el.waferRequiredForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.waferRequiredForm.attr("href", "#");
    },
    destroy: function () {
    }
});
