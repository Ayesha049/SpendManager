$.widget("forecast.rfqDashboardWidget", {
    options: {
        widgetBaseElement: undefined,
        messages: undefined,
        fabQuotationListTableElement: undefined,
        bumpQuotationListTableElement: undefined,
        assemblyQuotationListTableElement: undefined,
        testQuotationListTableElement: undefined,
        supplierWiseQuotationCountList: undefined,
        statusWiseQuotationCountList: undefined,
        pieReportHeight: 320
    },
    _create: function () {
        console.log("SMNLOG :: ---------- RFQ dashboard widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        self.data.organizationCountWisePieReportData = [];
        self.data.quotationStatusCountWisePieReportData = [];

        // UI element Initialization
        self.el.widgetBaseElement = self.options.widgetBaseElement;
        self.el.organizationCountWisePieReportDiv = $('#organizationCountWisePieReportDiv');
        self.el.statusCountWisePieReportDiv = $('#statusCountWisePieReportDiv');
        self.el.rfqNumberSelect = $('.rfqNumberSelect');
        self.el.supplierSelect = $('.supplierSelect');
        self.el.statusSelect = $('.statusSelect');
        self.el.agingFrom = $('.agingFrom');
        self.el.agingTo = $('.agingTo');
        self.el.search = $('.search');
        self.el.searchDiv = $('.searchDiv');
        self.el.nextBtn = $('.next-button');
        self.el.createdDateRange = $('.createdDateRange');
        self.el.dueDateRange = $('.dueDateRange');

        self.el.searchDiv.css({'height': self.options.pieReportHeight+2+'px'}); // 2= offset
    },
    _init: function () {
        console.log("SMNLOG :: ---------- RFQ dashboard widget init ----------");
        var options = this.options;
        var self = this;

        self.initializeUiEvents();

        console.log("SMNLOG supplierWiseQuotationCount-->::" + JSON.stringify(self.options.supplierWiseQuotationCountList));
        self.initializeTable('FAB_CT', false);
        self.initializeTable('BUMP_CT', false);
        self.initializeTable('ASSEMBLY', false);
        self.initializeTable('TEST_PO', false);

        self.drawPieChartForOrganizationWiseQuotationCount();
        self.drawPieChartForQuotationStatusWise();
    },
    initializeUiEvents: function () {
        var self = this;

        self.el.rfqNumberSelect.select2({minimumResultsForSearch: -1, width: '100%'});
        self.el.supplierSelect.select2({minimumResultsForSearch: -1, width: '100%'});
        self.el.statusSelect.select2({minimumResultsForSearch: -1, width: '100%'});

        self.el.nextBtn.on('click', function () {
            $('.nav-link.active').parent().next().find('a').tab('show');
        });

        $(document).on('click', '.rfqDetails', function (e) {
            e.preventDefault();

            var rfqId = +$(this).attr('data-rfqId');
            console.log("SMNLOG rfqId::"+JSON.stringify(rfqId));
        });

        self.el.search.click(function () {
            console.log("SMNLOG :: Searching .....");
            self.initializeTable('FAB_CT', true);
            self.initializeTable('BUMP_CT', true);
            self.initializeTable('ASSEMBLY', true);
            self.initializeTable('TEST_PO', true);
        });

        self.el.createdDateRange.daterangepicker({
            // singleDatePicker: true,
            showDropdowns: true,
            minYear: Forecast.APP.DATERANGE_PICKER_FROM_YEAR,
            maxYear: Forecast.APP.DATERANGE_PICKER_TO_YEAR,
            autoUpdateInput: false,
            autoApply:true,
            locale: {
                cancelLabel: 'Clear'
            }
        });

        self.el.createdDateRange.on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format(Forecast.APP.GLOBAL_DATE_FORMAT_US) + ' - ' + picker.endDate.format(Forecast.APP.GLOBAL_DATE_FORMAT_US));
        });

        self.el.dueDateRange.daterangepicker({
            // singleDatePicker: true,
            showDropdowns: true,
            minYear: Forecast.APP.DATERANGE_PICKER_FROM_YEAR,
            maxYear: Forecast.APP.DATERANGE_PICKER_TO_YEAR,
            autoUpdateInput: false,
            autoApply:true,
            locale: {
                cancelLabel: 'Clear'
            }
        });

        self.el.dueDateRange.on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format(Forecast.APP.GLOBAL_DATE_FORMAT_US) + ' - ' + picker.endDate.format(Forecast.APP.GLOBAL_DATE_FORMAT_US));
        });
    },
    processSupplierCountWisePieReportData: function () {
        var self = this;
        self.data.organizationCountWisePieReportData = [];

        $.each(self.options.supplierWiseQuotationCountList, function (index, item) {
            self.data.organizationCountWisePieReportData.push({
                name: item.suppliername,
                custom: {id: item.supplierid, name: item.suppliername},
                y: item.quotationcount
            })
        });
    },
    processQuotationStatusCountWisePieReportData: function () {
        var self = this;
        self.data.quotationStatusCountWisePieReportData = [];

        $.each(self.options.statusWiseQuotationCountList, function (index, item) {
            self.data.quotationStatusCountWisePieReportData.push({
                name: item.status,
                y: item.count
            })
        });
    },
    drawPieChartForOrganizationWiseQuotationCount: function () {
        var self = this;
        self.processSupplierCountWisePieReportData();

        console.log("SMNLOG self.data.organizationCountWisePieReportData::" + JSON.stringify(self.data.organizationCountWisePieReportData));

        Highcharts.chart(self.el.organizationCountWisePieReportDiv.attr('id'), {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                height: self.options.pieReportHeight
            },
            colors: ['#aa80ff', '#ff9999', '#b3ffe6', '#80699B', '#3D96AE',
                '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'],
            title: {
                text: '<b>' + self.options.messages.organizationWiseChartHeader + '</b>',
                style:{
                    fontSize:'15px !important'
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            legend: {
                itemStyle: {
                    fontWeight: 'normal',
                    // fontSize:'12px !important'
                }
            },
            plotOptions: {
                pie: {
                    innerSize: '65%',
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '{point.name} <br> {point.percentage:.1f} %',
                        style:{
                            color: '#595959',
                            fontWeight: '600',
                            fontStyle:'italic',
                            // fontSize:'12px !important'
                        }
                    },
                    point: {
                        events: {
                            click: function (event) {
                                console.log("SMNLOG ::" + JSON.stringify(this.custom));
                                self.el.supplierSelect.val(this.custom.id).trigger('change');
                                self.el.search.trigger('click');
                            }
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Quotation Count',
                colorByPoint: true,
                data: self.data.organizationCountWisePieReportData,
                showInLegend: true
            }]
        });
    },
    drawPieChartForQuotationStatusWise: function () {
        var self = this;
        self.processQuotationStatusCountWisePieReportData();

        console.log("SMNLOG self.data.quotationStatusCountWisePieReportData::" + JSON.stringify(self.data.quotationStatusCountWisePieReportData));

        Highcharts.chart(self.el.statusCountWisePieReportDiv.attr('id'), {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                height: self.options.pieReportHeight
            },
            colors: ['#ffe680', '#85adad','#8080ff','#ff9999','#b366ff','#80ffaa','#ff1a66'],
            title: {
                text: '<b>' + self.options.messages.statusWiseChartHeader + '</b>',
                style:{
                    fontSize:'15px !important'
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            legend: {
                itemStyle: {
                    fontWeight: 'normal',
                    fontSize:'11px !important'
                }
            },
            plotOptions: {
                pie: {
                    // innerSize: '65%',
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '{point.name} <br> {point.percentage:.1f} %',
                        style:{
                            color: '#595959',
                            fontWeight: '600',
                            fontStyle:'italic',
                            fontSize:'11px !important'
                        }
                    },
                    point: {
                        events: {
                            click: function (event) {
                                self.el.statusSelect.val(this.name).trigger('change');
                                self.el.search.trigger('click');
                            }
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            series: [{
                name: '',
                colorByPoint: true,
                data: self.data.quotationStatusCountWisePieReportData,
                showInLegend: true
            }]
        });
    },
    initializeTable: function (quotationType, reDraw) {
        var self = this;
        var url = self.getTableUrl(quotationType);

        var details = self.options[quotationType];
        console.log(details);
        console.log(details.listTableElement);

        if (typeof details != 'undefined') {
            if (reDraw) {
                console.log("SMNLOG :: Redrawing.......");
                var tableObject = details.listTableElement.DataTable();
                tableObject.ajax.url(url).load();
            } else {
                Forecast.APP.globalDataTableInitialization(details.listTableElement, url,
                    Forecast.APP.getFabQuotationTableColumnDefinition(self.options.columnNames), [[1, "asc"]], null,
                    function () {
                        $('.dataTables_filter input')
                            .attr('title', self.options.columnNames.searchTooltip);
                    }
                );
            }
        }
    },
    getTableUrl: function (quotationType) {
        var self = this;
        var rfqIds = self.el.rfqNumberSelect.val();
        var organizationIds = self.el.supplierSelect.val();
        var status = self.el.statusSelect.val();
        var agingFrom = +self.el.agingFrom.val();
        var agingTo = +self.el.agingTo.val();

        return '/admin/getQuotations?quotationType='
            + quotationType
            + '&organizationIds=' + organizationIds
            + '&rfqIds=' + rfqIds
            + '&status=' + status
            + '&agingFrom=' + agingFrom
            + '&agingTo=' + agingTo;
    },
    destroy: function () {
    }
});
