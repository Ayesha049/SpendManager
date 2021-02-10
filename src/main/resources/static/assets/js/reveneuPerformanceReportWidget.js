$.widget("forecast.reveneuPerformanceReport", {
    options: {
        messages: undefined,
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
        quarters: ["Q1", "Q2", "Q3", "Q4"],
        tableRowsName: ["Nominal", "Upside Quantity", "Upside (%)", "Upside Probability Factor (%)", "Buffer Quantity","Buffer (%)", "Total", "Backlog"],
        colorBank: ['#33cccc', '#c44dff', '#e60000', '#1a1aff', '#00cc44', '#ff6600', '#1ac6ff'],
        tableHeaders: []
    },
    _create: function () {
        console.log("SMNLOG :: ---------- revenue performance report create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        self.data.reportData = {};
        self.data.timeLineList = [];
        self.data.lineItemDetailsMap = {};
        self.data.chipsetLineItemData = {};
        self.data.deviceLineItemData = {};
        self.fromDate = '';
        self.toDate = '';
        self.options.tableHeaders = [];
        self.data.dataEntryType = 'QUARTERLY';
        self.data.itemMap = {};
        self.data.reportTableItems = [];

        self.el.reportPreviewDiv = $("#reportPreviewDiv");
        self.el.demandAssessmentSelect = $(".demandAssessmentSelect");
        self.el.generateReportBtn = $(".generateReportBtn");
        self.el.exportCsvBtn = $(".exportCsvBtn");

        var reportHtml = '<div class="row lineItemBorder" style="padding-right: 10px; padding-left: 10px;">'
            + '<button type="button" class="btn btn-warning exportCsvBtn" style="margin-left: 5px; position: absolute; top: 13px; right: 38px;z-index: 2;"><i class="fa fa-export"></i> Export as CSV</button>'
            + '<div class="col-md-12" style="text-align: center; padding: 10px;">'
            + '</div>'
            + '<div class="col-md-12 reportHeader" style="text-align: center; padding: 10px; background-color: #dddddd40; margin-bottom: 20px;">Revenue Performance Report</div>'
            + '<div class="col-md-12 reportTableDiv" style="text-align: center;">'
            + '</div>'
            + '</div>';
        self.el.reportPreviewDiv.html(reportHtml);
    },
    _init: function () {
        console.log("SMNLOG :: ---------- revenue performance report init ----------");
        var options = this.options;
        var self = this;
        self.initUiEvent();
    },
    initUiEvent: function(){
        var self = this;
        self.el.demandAssessmentSelect.selectpicker('render');
        // self.el.demandAssessmentSelect.select2({minimumResultsForSearch: -1, width: '100%'});

        self.el.generateReportBtn.click(function(){
           console.log("SMNLOG :: -----------  Generate Report ------------");
            self.createRuntimeReport();
        });

        $('input[type=radio][name=reportTypeRadio]').change(function() {
            var reportType = $(document).find("input[name='reportTypeRadio']:checked").val();
            console.log("SMNLOG reportType 11::"+reportType);
            self.runtimeReportPreviewHtml();
        });

        $(document).on('click', 'button.exportCsvBtn', function () {
            self.exportTableToCsv("table.csv");
        });
    },
    createRuntimeReport: function(){
        console.log("SMNLOG :: -----------  Create Runtime Report ------------");
        var self = this;
        // var selectedDemandAssessmentList = self.el.demandAssessmentSelect.val();
        var selectedDemandAssessmentList = self.el.demandAssessmentSelect.selectpicker('val');

        console.log("SMNLOG selectedDemandAssessmentList::"+JSON.stringify(selectedDemandAssessmentList));
        self.fetchAndMakeDataForReport(selectedDemandAssessmentList);
    },
    fetchAndMakeDataForReport: function(selectedDemandAssessmentList){
        var self = this;
        var daList = [];
        var chipsetOrDeviceNumber = '';
        self.data.lineItemDetailsMap = {};
        self.data.chipsetLineItemData = [];
        self.data.deviceLineItemData = [];
        self.options.tableHeaders = [];
        self.data.dataEntryType = 'QUARTERLY';
        self.data.itemMap = {};
        self.data.reportTableItems = [];

        // converting string array to int array
        $.each(selectedDemandAssessmentList, function(index, item){
            daList.push(+item);
        });

        $.post('/admin/getDaForReport', { daList:daList }, function(result){
            var result = JSON.parse(result);
            self.data.reportData = result;
            self.data.fromDate = result.fromDate;
            self.data.toDate = result.toDate;

                $.each(self.data.reportData.daList, function (index, daObject) {

                    $.each(daObject.daItemList, function (index, daItem) {

                        $.each(daItem.lineItemDetailsList, function (index, itemDetails) {

                            chipsetOrDeviceNumber = daItem.chipsetNumber != null ? daItem.chipsetNumber: daItem.deviceNumber;
                            self.data.itemMap[chipsetOrDeviceNumber] = daItem;

                            console.log("SMNLOG daItem 22222::"+JSON.stringify(daItem));

                            if(!self.data.reportTableItems.includes(chipsetOrDeviceNumber)){
                                self.data.reportTableItems.push(chipsetOrDeviceNumber);
                            }

                            // For local cash and runtime report calculation we need two Map a.'self.data.chipsetLineItemData' and b. 'self.data.deviceLineItemData'
                            if(daItem.chipsetOrDevice == 'Chipset'){
                                self.data.chipsetLineItemData[chipsetOrDeviceNumber+'_'+itemDetails.timeLineUnit] = itemDetails;
                            }else{
                                self.data.deviceLineItemData[chipsetOrDeviceNumber+'_'+itemDetails.timeLineUnit] = itemDetails;
                            }

                            if(typeof self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(chipsetOrDeviceNumber, itemDetails.timeLineUnit, 'total')] == 'undefined'){
                                self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(chipsetOrDeviceNumber, itemDetails.timeLineUnit, 'total')] = daItem.currentASP * itemDetails.total;
                            }else{
                                self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(chipsetOrDeviceNumber, itemDetails.timeLineUnit, 'total')] += daItem.currentASP * itemDetails.total;
                            }
                        });
                    });

                });
            }).then(function(){
            if (self.data.dataEntryType == 'MONTHLY') {
                self.getMonthlyTableHeaders();
            } else if (self.data.dataEntryType == "QUARTERLY") {
                self.getQuarterlyTableHeaders();
            } else if (self.data.dataEntryType == "YEARLY") {
                self.getYearlyTableHeaders();
            }
            self.runtimeReportPreviewHtml();
        });
    },
    getLineItemDetailMapKey: function(chipsetOrDeviceNumber, timeLine, prop){
        return chipsetOrDeviceNumber + '_' + timeLine + '_' + prop;
    },
    exportTableToCsv: function (filename) {
        var self = this;
        var csv = [];

        $(document).find('table.da-report-grid-table tr').each(function(index, tr){
            var row = [];
            $(tr).find('th').each(function(idx, th){
                row.push("'"+$(th).text()+"'");
            });

            if(row.length > 0){
                csv.push(row.join(","));
            }

            row = [];
            $(tr).find('td').each(function(idx, td){

                if(+$(td).attr('colspan') > 0){
                    for(var i=0; i< +$(td).attr('colspan')-1; i++){
                        row.push('');
                    }
                    row.push(''+$(td).text());
                }else{
                    row.push(''+$(td).text());
                }
            });

            if(row.length > 0){
                csv.push(row.join(","));
            }
        });
        self.downloadCsv(csv.join("\n"), filename);
    },
    getMonthlyTableHeaders: function () {
        var self = this;
        var startDate = moment(self.data.fromDate);
        var endDate = moment(self.data.toDate);
        while (startDate.isBefore(endDate)) {
            self.options.tableHeaders.push(self.options.months[startDate.format('M') - 1] + "-" + startDate.format('YY'));
            startDate.add(1, 'month');
        }
    },
    getQuarterlyTableHeaders: function () {
        var self = this;
        console.log("SMNLOG self.data.fromDate::"+JSON.stringify(self.data.fromDate));
        console.log("SMNLOG self.data.toDate::"+JSON.stringify(self.data.toDate));
        var startDate = moment(self.data.fromDate);
        var endDate = moment(self.data.toDate);
        while (startDate.isBefore(endDate)) {
            self.options.tableHeaders.push(self.options.quarters[Math.floor((startDate.format('M') - 1) / 3)] + "-" + startDate.format('YY'));
            if ((startDate.format('M') - 1) % 3 == 1) {
                startDate.add(2, 'month');
            } else if ((startDate.format('M') - 1) % 3 == 2) {
                startDate.add(1, 'month');
            } else {
                startDate.add(3, 'month');
            }
        }
    },
    runtimeReportPreviewHtml: function () {
        var self = this;
        var tableHtml = "";
        var asp = 10;
        var chipset = '';
        var tableHeader = ['SL#', 'CS', 'Customer', 'Segment', 'Project', 'End Customer', 'Description', 'Current ASP'];
        var tableHead = '';
        var tableBody = '';
        var itemObj = {};
        var device = '';
        var columnName = '';
        var chipsetOrDevice;
        var total = 0;
        var lineTotalMap = {};
        var reportType = $(document).find("input[name='reportTypeRadio']:checked").val();

        console.log("SMNLOG tableHeaders::"+JSON.stringify(self.options.tableHeaders));

        tableHead += '<thead>';
        tableHead += '<tr>';
        $.each(tableHeader, function (index, item) {
            tableHead += '<th>' + item + '</th>';
        });
        $.each(self.options.tableHeaders, function (index, item) {
            tableHead += '<th>' + item + '</th>';
        });
        tableHead += '</tr>';
        tableHead += '</thead>';

        // tbody making part
        tableBody += '<tbody>';

        console.log("SMNLOG self.data.reportTableItems-------->::"+JSON.stringify(self.data.reportTableItems));
        $.each(self.data.reportTableItems, function (index, item) {
            chipsetOrDevice = self.data.itemMap[item].chipsetOrDevice;

            console.log("SMNLOG item::"+JSON.stringify(item));
            console.log("SMNLOG self.data.lineItemDetailsMap::"+JSON.stringify(self.data.lineItemDetailsMap));
            console.log("SMNLOG itemObject::"+JSON.stringify(self.data.itemMap[item]));
            asp = self.data.itemMap[item].currentASP;

            if(chipsetOrDevice == 'Chipset'){
                console.log("SMNLOG :: CHIPSET=============>");
                chipset = item;
                if (chipset != '') {
                    itemObj = self.data.itemMap[item];
                    if(typeof itemObj !== 'undefined') {
                        tableBody += '<tr>';
                        tableBody += '<td>' + (index + 1) + '</td>';
                        tableBody += '<td>' + item + '</td>';
                        tableBody += '<td></td>';
                        tableBody += '<td></td>';
                        tableBody += '<td></td>';
                        tableBody += '<td></td>';
                        tableBody += '<td></td>';
                        tableBody += '<td>' + asp + '</td>';

                        $.each(self.options.tableHeaders, function (index, columnName) {
                            total = 0;
                            tableBody += '<td>';
                            total = self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(item, columnName, 'total')];
                            tableBody += total;

                            if(typeof lineTotalMap[columnName] == 'undefined'){
                                lineTotalMap[columnName] = total;
                            }else{
                                lineTotalMap[columnName] += total;
                            }
                            tableBody += '</td>';
                        });
                        tableBody += '</tr>';
                    }
                }
            }else if(chipsetOrDevice == 'Device'){
                console.log("SMNLOG :: DEVICE =============>");
                device = item;
                if (device != '') {
                    itemObj = self.data.itemMap[item];
                    if(typeof itemObj !== 'undefined') {
                        tableBody += '<tr>';
                        tableBody += '<td>' + (index + 1) + '</td>';
                        tableBody += '<td>' + item + '</td>';
                        tableBody += '<td></td>';
                        tableBody += '<td></td>';
                        tableBody += '<td></td>';
                        tableBody += '<td></td>';
                        tableBody += '<td></td>';
                        tableBody += '<td>' + asp + '</td>';

                        $.each(self.options.tableHeaders, function (index, columnName) {
                            total = 0;
                            tableBody += '<td>';
                            total = self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(item, columnName, 'total')];
                            tableBody += total;

                            if(typeof lineTotalMap[columnName] == 'undefined'){
                                lineTotalMap[columnName] = total;
                            }else{
                                lineTotalMap[columnName] += total;
                            }
                            tableBody += '</td>';
                        });
                        tableBody += '</tr>';
                    }
                }
            }
        });

        // Adding total row
        tableBody += '<tr class="totalTr" style="background-color: #dddddd82;">';
        tableBody += '<td colspan="8" style="text-align: right; font-weight: 600;">Total</td>';
        $.each(self.options.tableHeaders, function (index, columnName) {
            tableBody += '<td style="font-weight: 600;">';
            total = lineTotalMap[columnName];
            tableBody += total;
            tableBody += '</td>';
        });
        tableBody += '</tr>';
        tableBody += '</tbody>';

        tableHtml += '<table class="table da-report-grid-table">';
        tableHtml += tableHead;
        tableHtml += tableBody;
        tableHtml += '</table>';

        self.el.reportPreviewDiv.find('div.reportTableDiv').html(tableHtml);
    },
    getTotalCountForDeviceOrChipset: function(lineItemData, deviceOrChipsetNumber, columnName){
        var self = this;
        var total = 0;
        // var allCheckboxFilter = self.el.reportPreviewDiv.find('input.allCheckboxFilter').prop('checked');
        var allCheckboxFilter = true;
        var nominalCheckboxFilter = self.el.reportPreviewDiv.find('input.nominalCheckboxFilter').prop('checked');
        var upsideQtyCheckboxFilter = self.el.reportPreviewDiv.find('input.upsideQtyCheckboxFilter').prop('checked');
        var bufferQtyCheckboxFilter = self.el.reportPreviewDiv.find('input.bufferQtyCheckboxFilter').prop('checked');
        var backlogCheckboxFilter = self.el.reportPreviewDiv.find('input.backlogCheckboxFilter').prop('checked');

        console.log("SMNLOG lineItemData::"+JSON.stringify(lineItemData));

        if(typeof lineItemData[deviceOrChipsetNumber+'_'+columnName] != 'undefined'){
            // if(nominalCheckboxFilter){
            //     total += +lineItemData[deviceOrChipsetNumber+'_'+columnName]['nominal'];
            // }
            //
            // if(upsideQtyCheckboxFilter){
            //     total += +lineItemData[deviceOrChipsetNumber+'_'+columnName]['upsideQty'];
            // }
            //
            // if(bufferQtyCheckboxFilter){
            //     total += +lineItemData[deviceOrChipsetNumber+'_'+columnName]['bufferQty'];
            // }
            //
            // if(backlogCheckboxFilter){
            //     total += +lineItemData[deviceOrChipsetNumber+'_'+columnName]['backlog'];
            // }

            if(allCheckboxFilter){
                total = +lineItemData[deviceOrChipsetNumber+'_'+columnName]['total'];
            }
        }
        return total;
    },
    getRuntimeReportCellValue: function(asp, lineTotal, reportType){
        var total = 0;
        if(reportType == 'quantity'){ // we don't need to multiply by asp, so making the value of ASP=1
            total = lineTotal;
        }else{
            total = asp * lineTotal;
        }
        return total;
    },
    downloadCsv: function (csv, filename) {
        var csvFile;
        var downloadLink;

        // CSV FILE
        csvFile = new Blob([csv], {type: "text/csv"});

        // Download link
        downloadLink = document.createElement("a");

        // File name
        downloadLink.download = filename;

        // We have to create a link to the file
        downloadLink.href = window.URL.createObjectURL(csvFile);

        // Make sure that the link is not displayed
        downloadLink.style.display = "none";

        // Add the link to your DOM
        document.body.appendChild(downloadLink);

        // Lanzamos
        downloadLink.click();
    },
    destroy: function () {
    }
});
