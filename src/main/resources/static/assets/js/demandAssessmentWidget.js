$.widget("forecast.demandAssessment", {
    options: {
        originalDataEntryType: undefined,
        dataEntryType: undefined,
        timelineFrom: undefined,
        timelineTo: undefined,
        chipsetAndDeviceList: undefined,
        chipsetList: undefined,
        lineItemList: undefined,
        deviceList: undefined,
        messages: undefined,
        viewOnly: undefined,
        chipsetItem: {
            id: '',
            upside: '',
            nominal: '',
            chipsetNumber: '',
            bufferQuantity: '',
            probabilityFactor: '',
            customerId: ''
        },
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
        quarters: ["Q1", "Q2", "Q3", "Q4"],
        tableRowsName: ["Nominal", "Upside Quantity", "Upside (%)", "Upside Probability Factor (%)", "Buffer Quantity", "Buffer (%)", "Total", "Backlog"],
        colorBank: ['#33cccc', '#c44dff', '#e60000', '#1a1aff', '#00cc44', '#ff6600', '#1ac6ff'],
        tableHeaders: [],
        lineItemHeight: 420,
        asp: {},
        customerList: undefined,
        weekMap: undefined,
        weeklyTimeLineUnitMap: undefined,
        quarterWithMonthMap: undefined
    },
    _create: function () {
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        self.data.lineItemDetailsMap = {};
        self.data.chipsetMap = {};
        self.data.deviceMap = {};
        self.data.chipsetLineItemData = {};
        self.data.deviceLineItemData = {};
        self.data.aspDeviceAndChipsetPricingMap = {};
        self.data.ruleMap = {};
        self.data.afterRulePricingMap = {};
        self.data.tableTdColorMap = {};

        console.log("SMNLOG weekMap 1 ::"+JSON.stringify(self.options.weekMap));
        console.log("SMNLOG weeklyTimeLineUnitMap 1 ::"+JSON.stringify(self.options.weeklyTimeLineUnitMap));
        console.log("SMNLOG quarterWithMonthMap 1 ::"+JSON.stringify(self.options.quarterWithMonthMap));

        self.initiateAspItemMapData();

        if (self.options.chipsetAndDeviceList != undefined) {

            $.each(self.options.chipsetAndDeviceList, function (index, item) {
                if (item.chipsetOrDevice === 'CHIPSET') {
                    self.data.chipsetMap[item.chipsetId] = {
                        id: item.chipsetId,
                        chipsetNumber: item.chipsetNumber,
                        description: item.description
                    };
                } else if (item.chipsetOrDevice === 'RFIC') {
                    self.data.deviceMap[item.deviceId] = {id: item.deviceId, deviceNumber: item.deviceNumber};
                }
            });
        }

        // UI element Initialization
        self.el.demandAssessmentForm = $("#demand_assessment_form");
        self.el.id = $(document).find("#id");
        self.el.demandRequestId = $(document).find("#demandRequestId");
        self.el.dynamicRowDiv = $("#dynamicRowDiv");
        self.el.currentASP = $("#currentASP");
        self.el.reportPreviewDiv = $("#reportPreviewDiv");
        self.el.chipsetLineItemDiv = $(".chipset-line-item-div");
        self.el.dataEntryType = $("#dataEntryType");
        self.el.entryTypeConversion = $(".entryTypeConversion");
        self.el.daGridTable = $(".da-grid-table");
        self.el.fromDate = $("#fromDate");
        self.el.toDate = $("#toDate");
        self.el.mobile_btn_top = $("#mobile_btn_top");
        self.el.chipsetTableCreation = $(".chipsetTableCreation");
        self.el.submitButton = $("#submitButton");
        self.el.exportCsvBtn = $("i.exportCsvBtn");
        self.el.refreshReport = $("i.refreshReport");
        self.el.notificationModalWrapper = $(".notificationModalWrapper");
        self.el.aspSelect = $(".aspSelect");

        self.el.gobackButton = '<a href="/admin/demandAssessmentList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<button type="button" class="btn btn-primary lineItemAddButton" style="margin-left: 5px;"><i class="fa fa-plus"></i> Add</button>';
        self.el.removeButton = '<button type="button" class="btn btn-danger lineItemRemoveButton"><i class="fa fa-minus"></i> Remove</button>';
        var reportHtml = '<div class="row lineItemBorder" style="padding-right: 10px; padding-left: 10px;">'
            + '<a class="" style="margin-left: 5px; position: absolute; top: 15px; right: 31px;z-index: 2;">'
            + '<i title="Download CSV" style="color: green; font-size: 17px !important; cursor: pointer;" class="fa fa-file-excel exportCsvBtn"></i>'
            + '&nbsp;&nbsp;<i title="Refresh report" style="color: blue; font-size: 15px !important; cursor: pointer;" class="fa fa-sync refreshReport"></i>'
            + '</a>'
            + '<div class="row col-md-12" style="text-align: center; padding: 10px;">'
            + '<div class="row col-md-4" style="text-align: left;">'
            + '<div class="col-md-6 form-check radio-green">'
            + '<input type="radio" class="form-check-input" id="radioGreen2" name="reportTypeRadio" value="revenue" checked>'
            + '<label class="form-check-label" for="radioGreen2" style="margin-left: 16px;">Revenue (ASP * Qty)</label>'
            + '</div>'
            + '<div class="col-md-6 form-check radio-green">'
            + '<input type="radio" class="form-check-input" id="radioGreen1" name="reportTypeRadio" value="quantity">'
            + '<label class="form-check-label" for="radioGreen1"  style="margin-left: 16px;">Quantity</label>'
            + '</div>'

            + '</div>'
            + '<div class="col-md-8"  style="text-align: left;">'
            + '<label class="da-report-checkbox-label"><input type="checkbox" class="allCheckboxFilter" checked="checked"/> All </label>'
            + '<label class="da-report-checkbox-label" style="pointer-events: none;"><input type="checkbox" class="nominalCheckboxFilter" checked="checked"/> Nominal </label>'
            + '<label class="da-report-checkbox-label"><input type="checkbox" class="upsideQtyCheckboxFilter" checked="checked"/> Include Upside Qty </label>'
            + '<label class="da-report-checkbox-label"><input type="checkbox" class="bufferQtyCheckboxFilter" checked="checked"/> Include Buffer Qty </label>'
            + '<label class="da-report-checkbox-label"><input type="checkbox" class="backlogCheckboxFilter" checked="checked"/> Include Backlog </label>'
            + '</div>'
            + '</div>'
            + '<div class="col-md-12 reportHeader" style="text-align: center; padding: 10px; background-color: #dddddd40; margin-bottom: 20px;">Revenue Report</div>'
            + '<div class="col-md-12 reportTableDiv" style="text-align: center;">'
            + '</div>'
            + '</div>';
        self.el.reportPreviewDiv.html(reportHtml);

        self.el.mobile_btn_top.trigger('click');
    },
    _init: function () {
        var options = this.options;
        var self = this;
        self.initiateFormValidation();
        self.el.entryTypeConversion.val(self.options.dataEntryType);

        if (self.options.demandAssessmentId > 0) {
            self.reloadUiMatrixByConvertionDataEntryType(self.options.dataEntryType);
        } else {
            self.populateUi();
        }

        self.uiEventInitialization();

    },
    reloadUiMatrixByConvertionDataEntryType: function (entryType) {
        var self = this;

        Forecast.APP.startLoading();
        $.get('/admin/getDemandAssessmentLineItems',
            {
                demandAssessmentId: self.options.demandAssessmentId,
                convertTo: entryType
            },
            function (data) {
                var jsonResult = JSON.parse(data);
                self.data.lineItemDetailsMap = {};
                self.data.chipsetLineItemData = {};
                self.data.deviceLineItemData = {};

                self.options.lineItemList = jsonResult.lineItemList;

                if (self.options.lineItemList != 'undefined') {
                    self.options.lineItemListSize = self.options.lineItemList.length;

                    $.each(self.options.lineItemList, function (index, lineItem) {

                        var chipsetOrDeviceId = lineItem.chipsetId != '' ? lineItem.chipsetId : lineItem.deviceId;
                        var customerId = Forecast.APP.valueOf(lineItem.customerId);

                        $.each(lineItem.lineItemDetailsList, function (index, itemDetails) {

                            // For local cash and runtime report calculation we need two Map a.'self.data.chipsetLineItemData' and b. 'self.data.deviceLineItemData'
                            if (lineItem.chipsetOrDevice == 'CHIPSET') {
                                self.data.chipsetLineItemData[self.getChipsetOrDeviceMapKey(lineItem.chipsetOrDevice, chipsetOrDeviceId, customerId, itemDetails.timeLineUnit)] = itemDetails;
                            } else {
                                self.data.deviceLineItemData[self.getChipsetOrDeviceMapKey(lineItem.chipsetOrDevice, chipsetOrDeviceId, customerId, itemDetails.timeLineUnit)] = itemDetails;
                            }

                            self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(lineItem.chipsetOrDevice, chipsetOrDeviceId, customerId, itemDetails.timeLineUnit, 'lineItemDetailsId')] = itemDetails.lineItemDetailsId;
                            self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(lineItem.chipsetOrDevice, chipsetOrDeviceId, customerId, itemDetails.timeLineUnit, 'nominal')] = itemDetails.nominal;
                            self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(lineItem.chipsetOrDevice, chipsetOrDeviceId, customerId, itemDetails.timeLineUnit, 'upsideQty')] = itemDetails.upsideQty;
                            self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(lineItem.chipsetOrDevice, chipsetOrDeviceId, customerId, itemDetails.timeLineUnit, 'upsidePercentage')] = itemDetails.upsidePercentage;
                            self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(lineItem.chipsetOrDevice, chipsetOrDeviceId, customerId, itemDetails.timeLineUnit, 'bufferQty')] = itemDetails.bufferQty;
                            self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(lineItem.chipsetOrDevice, chipsetOrDeviceId, customerId, itemDetails.timeLineUnit, 'bufferPercentage')] = itemDetails.bufferPercentage;
                            self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(lineItem.chipsetOrDevice, chipsetOrDeviceId, customerId, itemDetails.timeLineUnit, 'upsideProbFactor')] = itemDetails.upsideProbFactor;
                            self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(lineItem.chipsetOrDevice, chipsetOrDeviceId, customerId, itemDetails.timeLineUnit, 'backlog')] = itemDetails.backlog;
                            self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(lineItem.chipsetOrDevice, chipsetOrDeviceId, customerId, itemDetails.timeLineUnit, 'total')] = itemDetails.total;
                        });
                    });
                }
                console.log("SMNLOG self.data.lineItemDetailsMap::"+JSON.stringify(self.data.lineItemDetailsMap));
            }).then(function () {

            self.options.dataEntryType = entryType;

            self.populateUi();

            if (self.options.originalDataEntryType !== self.el.entryTypeConversion.val()) {
                self.enableAndDisabledLineItemElements(true); // need to disabled
            } else {
                self.enableAndDisabledLineItemElements(false); // need undo disabled
            }

        }).then(function () {
            if (self.options.viewOnly == true) {
                self.disableForViewOnly();
            }
        }).always(function () {
            Forecast.APP.stopLoading();
        });
    },
    enableAndDisabledLineItemElements: function (isDisabled) {
        var self = this;
        self.el.submitButton.attr("disabled", isDisabled);
        // self.el.demandAssessmentForm.find('input[type!="hidden"]').attr("disabled", isDisabled);
        self.el.demandAssessmentForm.find('input.countInput').attr("disabled", isDisabled);
        self.el.demandAssessmentForm.find('select.chipsetOrDeviceSelect').attr("disabled", isDisabled);
        self.el.demandAssessmentForm.find('select.device').attr("disabled", isDisabled);
        self.el.demandAssessmentForm.find('select.line-item-customer').attr("disabled", isDisabled);
    },
    populateUi: function () {
        var self = this;

        self.el.dynamicRowDiv.empty();

        if (self.options.lineItemListSize > 0) {
            $.each(self.options.lineItemList, function (index, lineItem) {
                self.addLineItemForChipsetOrDevice(true, lineItem);
            });
            self.addPlusIconForTheLastItem();
            self.runtimeReportPreviewHtml();

            $(document).find('input.countInput').each(function () {
                Forecast.APP.formatCurrency($(this));
            });
        } else {
            if (self.options.dataEntryType) {
                self.createLineItem();
                self.runtimeReportPreviewHtml();
            }
        }
    },
    initiateAspItemMapData: function () {
        var self = this;
        var priceAfterRule = 0;

        // console.log("SMNLOG self.options.asp::"+JSON.stringify(self.options.asp));

        if (self.options.asp != 'undefined') {
            $.each(self.options.asp.lineItemList, function (index, lineItem) {

                var chipsetOrDeviceId = lineItem.chipsetId != '' ? lineItem.chipsetId : lineItem.deviceId;

                $.each(lineItem.lineItemDetailList, function (index, itemDetails) {
                    console.log("SMNLOG itemDetails::"+JSON.stringify(itemDetails));

                    self.data.aspDeviceAndChipsetPricingMap[self.getAspMapKey(lineItem.type, chipsetOrDeviceId, lineItem.customer, itemDetails.timelineUnit)] = itemDetails;
                    // self.fillAspValuesForAllEntryType(lineItem.type, chipsetOrDeviceId, lineItem.customer, itemDetails.timelineUnit);

                    $.each(itemDetails.lineItemRuleList, function (idx, rule) {
                        if (typeof self.data.ruleMap[rule.id] == 'undefined') {
                            rule.timelineUnit = itemDetails.timelineUnit;
                            rule.defaultPrice = itemDetails.netPrice;
                            self.data.ruleMap[rule.id] = rule;
                        }
                    });
                });
            });
        }
        console.log("SMNLOG self.data.aspDeviceAndChipsetPricingMap::"+JSON.stringify(self.data.aspDeviceAndChipsetPricingMap));
    },
    getAspMapKey: function (chipsetOrDevice, chipsetOrDeviceId, customerId, timelineUnit) {
        return chipsetOrDevice + '_' + chipsetOrDeviceId + '_' + customerId + '_' + timelineUnit;
    },
    getUpdatedAspPriceByApplyingRules: function (chipsetOrDevice, deviceOrChipsetId, customerId, totalQty, timeUnit, ruleList, defaultPrice) {
        var self = this;
        var priceAfterRule = defaultPrice;
        var ruleAppliedResult = {};

        console.log("SMNLOG Price before rules::"+ defaultPrice);

        if (typeof ruleList != 'undefined' && ruleList.length > 0) {

            $.each(ruleList, function (index, rule) {
                ruleAppliedResult = self.isRuleApplied(totalQty, rule);

                if (ruleAppliedResult.ruleApplied) {
                    priceAfterRule = ruleAppliedResult.newPrice;
                }
            });
        }
        console.log("SMNLOG Price after rules::"+ priceAfterRule);
        self.data.afterRulePricingMap[self.getAspMapKey(chipsetOrDevice, deviceOrChipsetId, customerId, timeUnit)] = priceAfterRule;
    },
    fillAspValuesForAllEntryType: function(type, chipsetOrDeviceId, customerId, timeUnit){
        var self = this;
            // weekMap: undefined,
            // weeklyTimeLineUnitMap: undefined,
            // quarterWithMonthMap: undefined

        var timeUnit = timeUnit.split('-')[0];
        var year = timeUnit.split('-')[1];
        console.log("SMNLOG ASP::"+JSON.stringify(timeUnit) +" year : "+year);
        console.log("SMNLOG timeUnit::"+JSON.stringify(timeUnit) +" year : "+year);

        if(typeof self.options.weekMap[timeUnit] != 'undefined'){
            console.log("SMNLOG FOUND in weekMap :"+self.options.weekMap[timeUnit]);
        }else if(typeof self.options.weeklyTimeLineUnitMap[timeUnit] != 'undefined'){
            console.log("SMNLOG FOUND in weeklyTimeLineUnitMap timeUnit:"+self.options.weeklyTimeLineUnitMap[timeUnit]);

            $.each(self.options.weeklyTimeLineUnitMap[timeUnit], function(index, week){

            });

        }else if(typeof self.options.quarterWithMonthMap[timeUnit] != 'undefined'){
            console.log("SMNLOG FOUND in quarterWithMonthMap timeUnit:"+self.options.quarterWithMonthMap[timeUnit]);
        }



    },
    initiateFormValidation: function () {
        var self = this;

        var validateJson = {
            rules: {
                entryDate: {
                    required: true
                },
                forecastDate: {
                    required: true
                }
            },
            messages: {},
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };

        self.el.formValidator = self.el.demandAssessmentForm.validate(validateJson);

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("chip-set", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("countInput", {number: true});
    },
    reloadAspFromDb: function (aspId) {
        var self = this;

        Forecast.APP.startLoading();
        $.get('/admin/getAspById', {aspId: aspId}, function (asp) {
            self.options.asp = JSON.parse(asp);
        }).then(function () {
            self.initiateAspItemMapData();
            Forecast.APP.stopLoading();
        });
    },
    uiEventInitialization: function () {
        var self = this;
        $(document).on('click', 'button.lineItemAddButton', function () {
            self.addLineItemForChipsetOrDevice(true, self.options.chipsetItem);
            self.addPlusIconForTheLastItem();
            self.runtimeReportPreviewHtml();

            var index = self.el.dynamicRowDiv.find('div.line-item-dynamic-row').length;
            self.el.dynamicRowDiv.animate({scrollTop: self.options.lineItemHeight * index}, "slow");
        });

        $(document).on('keyup', ".nominal, .upsideQty, .bufferQty, .backlog", function () {
            Forecast.APP.formatCurrency($(this));
        });

        $(document).on('keyup', '.countInput', function () {
            var index = $(this).attr('index');
            self.runtimeReportPreviewHtml();
        });

        $(document).on('keyup', '.nominal', function () {
            var index = $(this).attr('index');
            var that = $(this).closest('tr').next('tr').find('td').eq(index).find('input.upsideQty');
            self.upsideQtyAction(self.getInputValue(that), index, that);
        });

        $(document).on('keyup', '.upsideQty', function () {
            self.upsideQtyAction(self.getInputValue(this), +$(this).attr('index'), this);
        });

        $(document).on('click', '.ruleBadge', function () {
            self.makeModalForNotification(this);
            $('#ruleNotificationModal').modal({show: true});
        });

        $(document).on('keyup', '.upsidePercentage', function () {
            self.upsidePercentageAction(this);
        });

        $(document).on('keyup', '.bufferQty', function () {
            var index = +$(this).attr('index');
            var bufferQty = self.getInputValue(this);
            var nominal = self.getInputValue($(this).closest('tr').prev('tr').prev('tr').prev('tr').prev('tr').find('td').eq(index).find('input.nominal'));
            var value = isFinite(bufferQty * 100 / nominal) ? bufferQty * 100 / nominal : 0;

            $(this).closest('tr').next('tr').find('td').eq(index).find('input.bufferPercentage').val(value.toFixed(Forecast.APP.MAX_FRACTION_DIGITS));
        });

        $(document).on('keyup', '.bufferPercentage', function () {
            var bufferPercentage = +$(this).val();
            var index = +$(this).attr('index');
            var nominal = self.getInputValue($(this).closest('tr').prev('tr').prev('tr').prev('tr').prev('tr').prev('tr').find('td').eq(index).find('input.nominal'));
            $(this).closest('tr').prev('tr').find('td').eq(index).find('input.bufferQty').val(bufferPercentage * nominal / 100);
            Forecast.APP.formatCurrency($(this).closest('tr').prev('tr').find('td').eq(index).find('input.bufferQty')); // to make data-value updated
        });

        $(document).on('keyup', '#currentASP', function () {
            self.runtimeReportPreviewHtml();
        });

        $(document).on('click', 'button.lineItemRemoveButton', function () {
            $(this).parent().parent().parent().parent().remove();
            self.runtimeReportPreviewHtml();
            self.addPlusIconForTheLastItem();
            self.reIndexDaItems();
        });

        $(document).on('click', 'i.exportCsvBtn', function () {
            self.exportTableToCsv("table.csv");
        });

        $(document).on('click', 'i.refreshReport', function () {
            // update all ASP values
            // self.calculateFinalAspForAllLineItemEachTimeUnit();
            self.runtimeReportPreviewHtml();
        });

        /*        self.el.dataEntryType.on("change", function () {
         self.createLineItem();
         self.runtimeReportPreviewHtml();
         });*/

        $(document).on("change", '.allCheckboxFilter', function () {
            if (this.checked) {
                $(this).closest('div').find('input[type="checkbox"]').prop('checked', true);
            } else {
                $(this).closest('div').find('input[type="checkbox"]').not('input.nominalCheckboxFilter').prop('checked', false);
            }
            self.runtimeReportPreviewHtml();
        });

        $(document).on("change", '.upsideQtyCheckboxFilter,.bufferQtyCheckboxFilter,.backlogCheckboxFilter', function () {
            if ($(this).closest('div').find('input.nominalCheckboxFilter').prop('checked') && $(this).closest('div').find('input.upsideQtyCheckboxFilter').prop('checked')
                && $(this).closest('div').find('input.bufferQtyCheckboxFilter').prop('checked') && $(this).closest('div').find('input.backlogCheckboxFilter').prop('checked')) {
                $(this).closest('div').find('input.allCheckboxFilter').prop('checked', true);
            } else {
                $(this).closest('div').find('input.allCheckboxFilter').prop('checked', false);
            }
            self.runtimeReportPreviewHtml();
        });

        $(document).on("changed.bs.select", 'select.chip-set', function () {
            if ($(this).val() != '') {
                $(this).closest('div.line-item-dynamic-row').find('table.da-grid-table').find('input.nominal').keyup();
                $(this).closest('div.line-item-dynamic-row').attr('data-cs-rfic', $(this).val() + '_CHIPSET_lineItemDiv');

                if (typeof self.data.chipsetMap[$(this).val()] != 'undefined') {
                    $(this).closest('div.form-group').find('div.customerDiv').html('<input type="text" class="form-control" value="'
                        + (self.data.chipsetMap[$(this).val()].description || '') + '" disabled>');
                }
                self.runtimeReportPreviewHtml();
            } else {
                $(this).closest('div.form-group').find('div.customerDiv').html('<input type="text" class="form-control" value="" disabled>');
            }
        });

        self.el.aspSelect.change(function () {
            var aspId = +$(this).val();

            if (aspId > 0) {
                self.reloadAspFromDb(aspId);
            }
        });

        $(document).on("changed.bs.select", 'select.device', function () {
            if ($(this).val() != '') {
                $(this).closest('div.line-item-dynamic-row').find('table.da-grid-table').find('input.nominal').keyup();
                $(this).closest('div.line-item-dynamic-row').attr('data-cs-rfic', $(this).val() + '_RFIC_lineItemDiv');
                self.runtimeReportPreviewHtml();
            }

        });

        $(document).on("change", 'select.line-item-customer', function () {
            if ($(this).val() != '') {
                self.runtimeReportPreviewHtml();
            }
        });

        self.el.entryTypeConversion.change(function () {
            if ($(this).val() != '') {
                self.reloadUiMatrixByConvertionDataEntryType($(this).val());
            }
        });

        $(document).on("click", 'table.da-report-grid-table tbody tr', function () {
            var dataCsRfic = $(this).attr('data-cs-rfic');
            var timeUnit = $(this).attr('data-time');
            var $selectedLineItemDiv = $('[data-cs-rfic=' + dataCsRfic + '_lineItemDiv]');

            $(document).find('table.da-report-grid-table tbody tr').removeClass('trSelected');
            $(this).addClass('trSelected');

            if (dataCsRfic != '') {
                var scrollTopPosition = 0;
                var index = +$selectedLineItemDiv.attr('index');

                self.el.dynamicRowDiv.find('div.line-item-dynamic-row').each(function () {
                    if (+$(this).attr('index') < index) {
                        scrollTopPosition += $(this).outerHeight(true) - 10;
                    }
                });

                self.el.dynamicRowDiv.find('div.line-item-dynamic-row').removeClass('selectFromReport');
                $selectedLineItemDiv.addClass('selectFromReport');
                self.el.dynamicRowDiv.animate({scrollTop: scrollTopPosition}, "slow");

                if ($selectedLineItemDiv.find('i.expandCollapseIcon').hasClass('fa-plus')) {
                    $selectedLineItemDiv.find('i.expandCollapseIcon').trigger('click');
                }
            }
        });

        $(document).on('click', 'a.accordionToggleBtn', function () {
            if ($(this).find('i.expandCollapseIcon').hasClass('fa-plus')) { // Expand
                $(this).find('i.expandCollapseIcon').removeClass('fa-plus').addClass('fa-minus');
                $(document).find('a.daLineItemHeaderIcon').find('i.expandCollapseAll').removeClass('fa-plus-circle').addClass('fa-minus-circle');
            } else if ($(this).find('i.expandCollapseIcon').hasClass('fa-minus')) { // Collapse
                $(this).find('i.expandCollapseIcon').removeClass('fa-minus').addClass('fa-plus');
                $(document).find('a.daLineItemHeaderIcon').find('i.expandCollapseAll').removeClass('fa-minus-circle').addClass('fa-plus-circle');
            }
        });

        $('.expandCollapseAll').click(function () {
            if ($(this).hasClass('fa-plus-circle')) { // Expand All
                $(this).removeClass('fa-plus-circle').addClass('fa-minus-circle');
                $(document).find('i.expandCollapseIcon.fa-plus').trigger('click');
            } else if ($(this).hasClass('fa-minus-circle')) { // Collapse All
                $(this).removeClass('fa-minus-circle').addClass('fa-plus-circle');
                $(document).find('i.expandCollapseIcon.fa-minus').trigger('click');
            }
        });

        $(document).on("change", '.chipsetOrDeviceSelect', function () {
            var labelName = '';
            var selectHtml = '';
            var customerHtml = '';
            var customerLabel = '';
            var index = $(this).attr('index');
            // $(this).closest('div.line-item-dynamic-row').find('table.da-grid-table').show();

            if ($(this).val() == 'CHIPSET') {
                labelName = self.options.messages.chipSetNumber;
                selectHtml += self.getChipsetSelectBoxHtml(index, '');
                $(this).closest('div.form-group').find('label.customerLabel').text(self.options.messages.description);
                $(this).closest('div.form-group').find('div.customerDiv').html('<input type="text" class="form-control" value="" disabled>');
            } else if ($(this).val() == 'RFIC') {
                labelName = self.options.messages.device;
                selectHtml += self.getDeviceSelectBoxHtml(index, '');
                $(this).closest('div.form-group').find('label.customerLabel').text(self.options.messages.customer);
                $(this).closest('div.form-group').find('div.customerDiv').html(self.getCustomerSelectBoxHtml(index, ''));
            } else if ($(this).val() == '') {
                // $(this).closest('div.line-item-dynamic-row').find('table.da-grid-table').hide();
            }

            $(this).closest('div.form-group').find('label.deviceOrChipsetLabel').text(labelName);
            $(this).closest('div.form-group').find('div.deviceOrChipsetSelectDiv').html(selectHtml);
            $(this).closest('div.line-item-dynamic-row').find('table.da-grid-table').find('input.nominal').keyup();

            self.reRenderAllSelectPicker();
            self.runtimeReportPreviewHtml();
        });

        /*        self.el.fromDate.datetimepicker().on('dp.change', function (event) {
         self.createLineItem();
         });

         self.el.toDate.datetimepicker().on('dp.change', function (event) {
         self.createLineItem();
         self.data.chipsetLineItemData = {};
         self.data.deviceLineItemData = {};
         });*/

        $('input[type=radio][name=reportTypeRadio]').change(function () {
            var reportType = $(document).find("input[name='reportTypeRadio']:checked").val();
            self.runtimeReportPreviewHtml();
        });

        self.el.submitButton.click(function () {
            if (self.el.formValidator.numberOfInvalids() == 0) {
                $(document).find('input.countInput').each(function () {
                    $(this).val($(this).val().replace(/,/g, ''));
                });
                self.el.demandAssessmentForm.submit();
            }
        });
    },
    getInputValue: function (input) {
        return +$(input).attr('data-value');
    },
    getCustomerSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '';

        html += '<select name="demandAssessmentLineItemList[' + index + '].customer.id" class="custom-select line-item-customer" placeholder="Customer">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.customerList, function (index, item) {
            if (selectedValue == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.name + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.name + '</option>';
            }
        });
        html += '</select>';
        return html;
    },
    addLineItemValuesToCache: function (index, that) {
        var self = this;
        var timeUnit = $(that).attr('attr-time');
        var $totalInputObject;
        var deviceOrChipset = $(that).closest('div.line-item-dynamic-row').find('select.chipsetOrDeviceSelect').val();
        var deviceId = $(that).closest('div.line-item-dynamic-row').find('div.deviceOrChipsetSelectDiv').find('select.device').val();
        var chipsetId = $(that).closest('div.line-item-dynamic-row').find('div.deviceOrChipsetSelectDiv').find('select.chip-set').val();
        var customerId = $(that).closest('div.line-item-dynamic-row').find('select.line-item-customer').val();
        var key = '';

        if (deviceOrChipset !== '') {
            var lineTotal = 0;
            var columnObject = {};

            $(that).closest('table').find('tbody tr td input[index="' + index + '"]').each(function (idx, item) {
                var attrClass = $(item).attr('data-class');
                if (attrClass !== '') {
                    if (attrClass !== 'total') {
                        columnObject[attrClass] = self.getInputValue(item);

                        if (attrClass != 'upsidePercentage' && attrClass != 'upsideProbFactor' && attrClass != 'bufferPercentage') {
                            lineTotal += self.getInputValue(item);
                        }
                    } else {
                        columnObject[attrClass] = lineTotal;
                        $totalInputObject = $(item);
                    }
                }
            });

            columnObject['total'] = lineTotal;
            $totalInputObject.val(lineTotal);
            Forecast.APP.formatCurrency($totalInputObject);

            if (deviceOrChipset == 'CHIPSET') {
                self.data.chipsetLineItemData[self.getChipsetOrDeviceMapKey(deviceOrChipset, chipsetId, customerId, timeUnit)] = columnObject;
                self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(deviceOrChipset, chipsetId, customerId, timeUnit, 'total')] = lineTotal;
            } else if (deviceOrChipset == 'RFIC') {
                self.data.deviceLineItemData[self.getChipsetOrDeviceMapKey(deviceOrChipset, deviceId, customerId, timeUnit)] = columnObject;
                self.data.lineItemDetailsMap[self.getLineItemDetailMapKey(deviceOrChipset, deviceId, customerId, timeUnit, 'total')] = lineTotal;
            }

            key = self.getAspMapKey(deviceOrChipset, deviceId, customerId, timeUnit);
            var aspItems = self.data.aspDeviceAndChipsetPricingMap[key];

            if (typeof aspItems != 'undefined') {
                // Calculate  final ASP price for each timeLineUnit cell and pushing into local cache
                self.getUpdatedAspPriceByApplyingRules(
                    deviceOrChipset,
                    (deviceOrChipset == 'RFIC' ? deviceId : chipsetId),
                    customerId, lineTotal, timeUnit,
                    aspItems.lineItemRuleList,
                    aspItems.netPrice);
            }
            self.applyRuleAndUpdateRuleNotification(that.closest('table'),
                deviceOrChipset,
                (deviceOrChipset == 'RFIC' ? deviceId : chipsetId), customerId);

        }
    },
    calculateFinalAspForAllLineItemEachTimeUnit: function(){
        var self = this;
        self.el.dynamicRowDiv.find('div.line-item-dynamic-row').each(function () {
            $(this).find('table.da-grid-table tbody tr:first td').each(function () {
                self.addLineItemValuesToCache(+$(this).attr('index'), $(this).find('input.countInput'));
            });
        });
    },
    upsideQtyAction: function (upsideQty, index, that) {
        var self = this;
        var nominal = self.getInputValue($(that).closest('tr').prev('tr').find('td').eq(index).find('input.nominal'));
        var value = isFinite(upsideQty * 100 / nominal) ? upsideQty * 100 / nominal : 0;
        $(that).closest('tr').next('tr').find('td').eq(index).find('input.upsidePercentage').val(value.toFixed(Forecast.APP.MAX_FRACTION_DIGITS));
    },
    upsidePercentageAction: function (that) {
        var self = this;
        var upsidePercentage = +$(that).val();
        var index = +$(that).attr('index');
        var nominal = self.getInputValue($(that).closest('tr').prev('tr').prev('tr').find('td').eq(index).find('input.nominal'));
        $(that).closest('tr').prev('tr').find('td').eq(index).find('input.upsideQty').val(upsidePercentage * nominal / 100);
        Forecast.APP.formatCurrency($(that).closest('tr').prev('tr').find('td').eq(index).find('input.upsideQty'));// to make data-value updated
    },
    getChipsetOrDeviceSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="demandAssessmentLineItemList[' + index + '].chipsetOrDevice" class="custom-select chipsetOrDeviceSelect" placeholder="" index="' + index + '">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        html += '<option value="CHIPSET" ' + (selectedValue === 'CHIPSET' ? 'selected' : '') + '>Chipset</option>';
        html += '<option value="RFIC" ' + (selectedValue === 'RFIC' ? 'selected' : '') + '>Device</option>';
        html += '</select>';
        return html;
    },
    getChipsetSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="demandAssessmentLineItemList[' + index + '].chipset.id" class="custom-select selectpicker show-tick chip-set" data-live-search="true" placeholder="Chip Set">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.data.chipsetMap, function (index, item) {
            if (item.id > 0) {
                if (selectedValue == item.id) {
                    html += '<option value="' + item.id + '" selected>' + item.chipsetNumber + '</option>';
                } else {
                    html += '<option value="' + item.id + '">' + item.chipsetNumber + '</option>';
                }
            }
        });

        html += '</select>';
        return html;
    },
    getDeviceSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="demandAssessmentLineItemList[' + index + '].device.id" class="custom-select selectpicker show-tick device" data-live-search="true" placeholder="Device">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.data.deviceMap, function (index, item) {
            if (item.id > 0) {
                if (selectedValue == item.deviceNumber) {
                    html += '<option value="' + item.id + '" selected>' + item.deviceNumber + '</option>';
                } else {
                    html += '<option value="' + item.id + '">' + item.deviceNumber + '</option>';
                }
            }
        });

        html += '</select>';
        return html;
    },
    getWeeklyTableHeaders: function (fromDate, toDate) {
        var self = this;
        fromDate = '2021-01-01';
        toDate = '2021-04-07';
        var totalWeeks = 0;

        console.log("SMNLOG fromDate::"+JSON.stringify(fromDate));
        console.log("SMNLOG toDate::"+JSON.stringify(toDate));

        var startDate = moment(fromDate);
        var endDate = moment(toDate);

        var diff = moment.duration(endDate.diff(startDate));

        console.log(diff.months() + " months, " + diff.weeks() + " weeks, " + diff.days()%7 + " days.");

        console.log(Math.floor(diff.asWeeks()) + " weeks, " + diff.days()%7 + " days.");

        totalWeeks = diff.months() * 4;
        totalWeeks += diff.weeks();
        console.log("SMNLOG totalWeeks::"+JSON.stringify(totalWeeks));

        for(var i = 1; i< totalWeeks; i++){
                self.options.tableHeaders.push('W'+ i + "-21");
        }
    },
    getMonthlyTableHeaders: function (fromDate, toDate) {
        var self = this;
        var startDate = moment(fromDate);
        var endDate = moment(toDate);
        while (startDate.isBefore(endDate)) {
            self.options.tableHeaders.push(self.options.months[startDate.format('M') - 1] + "-" + startDate.format('YY'));
            startDate.add(1, 'month');
        }
    },
    runtimeReportPreviewHtml: function () {
        var self = this;
        var tableHtml = "";
        var asp = 0;
        var chipsetId = '';
        var tableHeader = ['SL#', 'CS', 'Customer', 'Segment', 'Project', 'End Customer', 'Description'];
        var tableHead = '';
        var tableBody = '';
        var itemObj = {};
        var deviceId = '';
        var columnName = '';
        var chipsetOrDeviceSelect;
        var total = 0;
        var reportLineTotalMap = {};
        var reportType = $(document).find("input[name='reportTypeRadio']:checked").val();
        tableHead += '<thead>';
        tableHead += '<tr>';
        $.each(tableHeader, function (index, item) {
            tableHead += '<th>' + item + '</th>';
        });

        // For ASP
        $.each(self.options.tableHeaders, function (index, item) {
            tableHead += '<th>' + item + ' ASP</th>';
        });

        $.each(self.options.tableHeaders, function (index, item) {
            tableHead += '<th>' + item + '</th>';
        });

        tableHead += '</tr>';
        tableHead += '</thead>';


        // tbody making part
        tableBody += '<tbody>';
        self.el.dynamicRowDiv.find('div.line-item-dynamic-row').each(function (index, item) {
            chipsetOrDeviceSelect = $(item).find('select.chipsetOrDeviceSelect').val();

            if (chipsetOrDeviceSelect == 'CHIPSET') {
                var customerId = $(item).find('select.line-item-customer').val();
                chipsetId = $(item).find('select.chip-set').val();

                if (chipsetId != '') {
                    itemObj = self.data.chipsetMap[chipsetId];
                    if (typeof itemObj !== 'undefined') {
                        tableBody += '<tr data-cs-rfic="' + itemObj.id + '_CHIPSET">';
                        tableBody += '<td>' + (index + 1) + '</td>';
                        tableBody += '<td>' + itemObj.chipsetNumber + '</td>';
                        tableBody += '<td>' + Forecast.APP.valueOf(itemObj.customer) + '</td>';
                        tableBody += '<td>' + Forecast.APP.valueOf(itemObj.productSegment) + '</td>';
                        tableBody += '<td>' + Forecast.APP.valueOf(itemObj.projectNumber) + '</td>';
                        tableBody += '<td></td>';
                        tableBody += '<td>' + Forecast.APP.valueOf(itemObj.description) + '</td>';
                        // tableBody += '<td>' + asp + '</td>';

                        tableBody = self.getAspTdValues(tableBody, chipsetOrDeviceSelect, itemObj.id, customerId);

                        $(item).find('table tbody tr.totalTr td').each(function (idx, td) {
                            // Updating after Rule Map to get updated ASP values for each cell
                            self.addLineItemValuesToCache(+$(this).attr('index'), $(this).find('input.countInput:first-child'));
                            total = 0;
                            columnName = $(td).find('input').attr('attr-time');
                            tableBody += '<td data-time="' + columnName + '" data-cs-rfic="' + itemObj.chipsetId + '_CHIPSET">';
                            total = self.getTotalCountForDeviceOrChipset(self.data.chipsetLineItemData, chipsetOrDeviceSelect, itemObj.id, customerId, columnName);
                            tableBody += self.getRuntimeReportCellValue(asp, total, reportType, chipsetOrDeviceSelect, itemObj.id, customerId, columnName, true);

                            if (typeof reportLineTotalMap[columnName] == 'undefined') {
                                reportLineTotalMap[columnName] = self.getRuntimeReportCellValue(asp, total, reportType, chipsetOrDeviceSelect, itemObj.id, customerId, columnName, false);
                            } else {
                                reportLineTotalMap[columnName] += self.getRuntimeReportCellValue(asp, total, reportType, chipsetOrDeviceSelect, itemObj.id, customerId, columnName, false);
                            }

                            // tableBody += (asp * self.getColumnValue());
                            tableBody += '</td>';
                        });
                        tableBody += '</tr>';
                    }
                }
            } else if (chipsetOrDeviceSelect == 'RFIC') {
                deviceId = $(item).find('select.device').val();
                var customerId = $(item).find('select.line-item-customer').val();
                var customer = $(item).find('select.line-item-customer option:selected').text();
                if (deviceId != '') {
                    itemObj = self.data.deviceMap[deviceId];
                    if (typeof itemObj !== 'undefined') {
                        tableBody += '<tr data-cs-rfic="' + itemObj.id + '_RFIC">';
                        tableBody += '<td>' + (index + 1) + '</td>';
                        tableBody += '<td>' + itemObj.deviceNumber + '</td>';
                        tableBody += '<td>' + Forecast.APP.valueOf(customer) + '</td>';
                        tableBody += '<td></td>';
                        tableBody += '<td></td>';
                        tableBody += '<td></td>';
                        tableBody += '<td>' + Forecast.APP.valueOf(itemObj.deviceDescription) + '</td>';
                        // tableBody += '<td>' + asp + '</td>';

                        tableBody = self.getAspTdValues(tableBody, chipsetOrDeviceSelect, itemObj.id, customerId);

                        $(item).find('table tbody tr.totalTr td').each(function (idx, td) {
                            // Updating after Rule Map to get updated ASP values for each cell
                            self.addLineItemValuesToCache(+$(this).attr('index'), $(this).find('input.countInput:first-child'));

                            total = 0;
                            columnName = $(td).find('input').attr('attr-time');
                            tableBody += '<td data-time="' + columnName + '" data-cs-rfic="' + itemObj.id + '_RFIC">';
                            total = self.getTotalCountForDeviceOrChipset(self.data.deviceLineItemData, chipsetOrDeviceSelect, itemObj.id, customerId, columnName);

                            tableBody += self.getRuntimeReportCellValue(asp, total, reportType, chipsetOrDeviceSelect, itemObj.id, customerId, columnName, true);

                            if (typeof reportLineTotalMap[columnName] == 'undefined') {
                                reportLineTotalMap[columnName] = self.getRuntimeReportCellValue(asp, total, reportType, chipsetOrDeviceSelect, itemObj.id, customerId, columnName, false);
                            } else {
                                reportLineTotalMap[columnName] += self.getRuntimeReportCellValue(asp, total, reportType, chipsetOrDeviceSelect, itemObj.id, customerId, columnName, false);
                            }
                            // tableBody += (asp * self.getColumnValue());
                            tableBody += '</td>';
                        });
                        tableBody += '</tr>';
                    }
                }
            }
        });

        // Adding total row
        var colspan = tableHeader.length + self.options.tableHeaders.length;
        tableBody += '<tr class="totalTr" style="background-color: #dddddd82;">';
        tableBody += '<td colspan="' + colspan + '" style="text-align: right; font-weight: 600;">Total</td>';
        $.each(self.options.tableHeaders, function (index, columnName) {
            tableBody += '<td style="font-weight: 600;">';
            tableBody += Forecast.APP.currencyFormatted(reportLineTotalMap[columnName]);
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
    getAspTdValues: function (html, chipsetOrDevice, chipsetOrDeviceId, customerId) {
        var self = this;

        // For ASP valu
        $.each(self.options.tableHeaders, function (index, timeUnit) {
            html += '<td>' + (typeof self.data.afterRulePricingMap[self.getAspMapKey(chipsetOrDevice, chipsetOrDeviceId, customerId, timeUnit)] != 'undefined' ?
                    self.data.afterRulePricingMap[self.getAspMapKey(chipsetOrDevice, chipsetOrDeviceId, customerId, timeUnit)] : 0) + '</td>';
        });
        return html;
    },
    getRuntimeReportCellValue: function (asp, lineTotal, reportType, chipsetOrDevice, chipsetOrDeviceId, customerId, timeUnit, formatted) {
        var self = this;
        var total = 0;

        if (reportType == 'quantity') { // we don't need to multiply by asp, so making the value of ASP=1
            total = lineTotal;
        } else {
            console.log("SMNLOG asp key-->::"+JSON.stringify(self.getAspMapKey(chipsetOrDevice, chipsetOrDeviceId, customerId, timeUnit)));
            asp = +self.data.afterRulePricingMap[self.getAspMapKey(chipsetOrDevice, chipsetOrDeviceId, customerId, timeUnit)] > -1 ? +self.data.afterRulePricingMap[self.getAspMapKey(chipsetOrDevice, chipsetOrDeviceId, customerId, timeUnit)] : asp;
            total = asp * lineTotal;
        }
        return formatted ? Forecast.APP.currencyFormatted(total) : total;
    },
    getTotalCountForDeviceOrChipset: function (lineItemData, chipsetOrDevice, deviceOrChipsetId, customerId, timeLineUnit) {
        var self = this;
        var total = 0;
        var allCheckboxFilter = self.el.reportPreviewDiv.find('input.allCheckboxFilter').prop('checked');
        var nominalCheckboxFilter = self.el.reportPreviewDiv.find('input.nominalCheckboxFilter').prop('checked');
        var upsideQtyCheckboxFilter = self.el.reportPreviewDiv.find('input.upsideQtyCheckboxFilter').prop('checked');
        var bufferQtyCheckboxFilter = self.el.reportPreviewDiv.find('input.bufferQtyCheckboxFilter').prop('checked');
        var backlogCheckboxFilter = self.el.reportPreviewDiv.find('input.backlogCheckboxFilter').prop('checked');

        if (typeof lineItemData[self.getChipsetOrDeviceMapKey(chipsetOrDevice, deviceOrChipsetId, customerId, timeLineUnit)] != 'undefined') {
            if (nominalCheckboxFilter) {
                total += +lineItemData[self.getChipsetOrDeviceMapKey(chipsetOrDevice, deviceOrChipsetId, customerId, timeLineUnit)]['nominal'];
            }

            if (upsideQtyCheckboxFilter) {
                total += +lineItemData[self.getChipsetOrDeviceMapKey(chipsetOrDevice, deviceOrChipsetId, customerId, timeLineUnit)]['upsideQty'];
            }

            if (bufferQtyCheckboxFilter) {
                total += +lineItemData[self.getChipsetOrDeviceMapKey(chipsetOrDevice, deviceOrChipsetId, customerId, timeLineUnit)]['bufferQty'];
            }

            if (backlogCheckboxFilter) {
                total += +lineItemData[self.getChipsetOrDeviceMapKey(chipsetOrDevice, deviceOrChipsetId, customerId, timeLineUnit)]['backlog'];
            }

            if (allCheckboxFilter) {
                total = +lineItemData[self.getChipsetOrDeviceMapKey(chipsetOrDevice, deviceOrChipsetId, customerId, timeLineUnit)]['total'];
            }
        }
        return total;
    },
    getQuarterlyTableHeaders: function (fromDate, toDate) {
        var self = this;
        var startDate = moment(fromDate);
        var endDate = moment(toDate);
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
    getYearlyTableHeaders: function (fromDate, toDate) {
        var self = this;
        var startYear = moment(fromDate).format('YY');
        var endYear = moment(toDate).format('YY');
        while (startYear <= endYear) {
            self.options.tableHeaders.push('Y-' + startYear);
            startYear++;
        }
    },
    getTableHeaderHtml: function (chipsetOrDevice, chipsetOrDeviceId) {
        var self = this;
        var html = "";
        var dataEntryType = self.options.dataEntryType;
        var fromDate = self.options.timelineFrom;
        var toDate = self.options.timelineTo;

        self.options.tableHeaders = [];
        var colorIndex = -1;
        var lastItem = '';
        var currentItem = '';
        var index = 0;

        if (dataEntryType == 'WEEKLY') {
            self.getWeeklyTableHeaders(fromDate, toDate);
        }else if (dataEntryType == 'MONTHLY') {
            self.getMonthlyTableHeaders(fromDate, toDate);
        } else if (dataEntryType == "QUARTERLY") {
            self.getQuarterlyTableHeaders(fromDate, toDate);
        } else if (dataEntryType == "YEARLY") {
            self.getYearlyTableHeaders(fromDate, toDate);
        }

        $.each(self.options.tableHeaders, function (index, item) {
            currentItem = item.split('-')[1];

            if (currentItem != lastItem) {
                colorIndex += 1;
            }

            html += '<th index="' + index + '" data-time-unit="' + item + '" style="text-align: center; color: '
                 + self.options.colorBank[colorIndex] + '">' + item + '</th>';
            self.data.tableTdColorMap[item] = self.options.colorBank[colorIndex];
            lastItem = currentItem;
            index++;
        });
        return html;
    },
    applyRuleAndUpdateRuleNotification: function (table, chipsetOrDevice, chipsetOrDeviceId, customerId) {
        var self = this;
        var cumulativeTotal = 0;
        var key = '';
        var cumulativeTotalKey = '';
        var timeUnit = '';

        if (chipsetOrDeviceId == '') return;

        $(table).find('thead tr th').each(function (index, th) {
            key = self.getLineItemDetailMapKey(chipsetOrDevice, chipsetOrDeviceId, customerId, $(th).attr('data-time-unit'), 'total');
            cumulativeTotalKey = self.getLineItemDetailMapKey(chipsetOrDevice, chipsetOrDeviceId, customerId, timeUnit, 'cumulativeTotal');

            if (+$(th).attr('index') >= 0) {
                cumulativeTotal += self.data.lineItemDetailsMap[key];
                timeUnit = $(th).attr('data-time-unit');

                if (typeof self.data.lineItemDetailsMap[cumulativeTotalKey] == 'undefined') {
                    self.data.lineItemDetailsMap[cumulativeTotalKey] = 0;
                }

                if (typeof self.data.lineItemDetailsMap[key] != 'undefined') {
                    self.data.lineItemDetailsMap[cumulativeTotalKey] = cumulativeTotal;
                }
                self.getRuleNotificationHtml(chipsetOrDevice, chipsetOrDeviceId, customerId, timeUnit, cumulativeTotal, self.data.lineItemDetailsMap[key], $(th).attr('index'), table);
            }
        });
    },
    getRuleNotificationHtml: function (chipsetOrDevice, chipsetOrDeviceId, customerId, dateTimeUnit, cumulativeTotalQty, lineTotal, thIndex, table) {
        var self = this;
        var html = '';
        var aspData = self.data.aspDeviceAndChipsetPricingMap[self.getAspMapKey(chipsetOrDevice, chipsetOrDeviceId, customerId, dateTimeUnit)];
        var ruleAppliedCount = 0;
        var ruleAppliedResult = {};
        var ruleAppliedIds = [];

        if (typeof aspData != 'undefined') {
            $.each(aspData.lineItemRuleList, function (index, rule) {
                ruleAppliedResult = self.isRuleApplied(cumulativeTotalQty, rule);
                if (ruleAppliedResult.ruleApplied) {
                    ruleAppliedIds.push(ruleAppliedResult.ruleId);
                    ruleAppliedCount++;
                }
            });
        }

        if (ruleAppliedCount > 0 && lineTotal > 0) { // Rule will be visible if 'lineTotal' > 0
            html += dateTimeUnit + '<span class="badge ruleBadge" chipset-or-device-id="' + chipsetOrDeviceId + '" attr-time="' + dateTimeUnit + '" rule-applied-ids="'
                + ruleAppliedIds.join(',') + '">' + ruleAppliedCount + '</span>';
            $(table).find('thead tr th[index="' + thIndex + '"]').attr('data-time-unit', dateTimeUnit).html(html);
        } else {
            $(table).find('thead tr th[index="' + thIndex + '"]').find('span.ruleBadge').remove();
        }
    },
    isRuleApplied: function (totalQty, rule) {
        var result = {ruleApplied: false, newPrice: 0};

        if (typeof rule != 'undefined') {
            if (rule.operator === 'EQUAL') {
                if (totalQty == rule.saturatedQuantity) {
                    result.ruleApplied = true;
                    result.newPrice = rule.newPrice;
                    result.ruleId = rule.id;
                }
            } else if (rule.operator === 'MORETHAN') {
                if (totalQty > rule.saturatedQuantity) {
                    result.ruleApplied = true;
                    result.newPrice = rule.newPrice;
                    result.ruleId = rule.id;
                }
            }
        }
        return result;
    },
    makeRuleToWords: function (rule) {
        var words = 'Rule nof defined';

        if (typeof rule != 'undefined') {
            words = 'If total quantity is ';
            words += '<b style="color: #48c599;">' + rule.operator + '</b> ';
            words += '<b style="color: #f90933;">' + rule.saturatedQuantity + '</b> ';
            words += ', New price should be ';
            words += '<b style="color: #2229e0;">' + rule.newPrice + '</b> ';
            words += ' at <b>' + rule.timelineUnit + '</b>';
        }
        return words;

    },
    makeModalForNotification: function (that) {
        var self = this;
        var defaultPrice = 0;
        var newPrice = 0;
        var summaryHtml = '';
        var timeUnit = $(that).attr('attr-time');
        var chipsetOrDeviceNumber = $(that).attr('chipset-or-device-number');
        var chipsetOrDeviceId = $(that).attr('chipset-or-device-id');
        var totalQty = self.data.lineItemDetailsMap[chipsetOrDeviceId + '_' + chipsetOrDeviceId + '_' + timeUnit + '_total'];
        var cumulativeQty = self.data.lineItemDetailsMap[chipsetOrDeviceId + '_' + chipsetOrDeviceId + '_' + chipsetOrDeviceId + '_' + timeUnit + '_cumulativeTotal'];
        var cumulativeQtyForLastTimeUnit = cumulativeQty - totalQty;
        var ruleBreakdownHtml = '';
        var multiRuleApplied = false;

        var ruleIdList = $(that).attr('rule-applied-ids').split(',');
        var ruleListHtml = '<div style="margin-bottom: 20px; padding: 5px;">';
        ruleListHtml += '<table class="table table-striped ruleListTable">';
        ruleListHtml += '<thead>';
        ruleListHtml += '<tr>';
        ruleListHtml += '<th>Sl#</th>';
        ruleListHtml += '<th>Rule details</th>';
        ruleListHtml += '<th>Applied</th>';
        ruleListHtml += '</tr>';
        ruleListHtml += '</thead>';

        ruleListHtml += '<tbody>';
        $.each(ruleIdList, function (index, ruleId) {
            ruleListHtml += '<tr>';
            ruleListHtml += '<td>' + (index + 1) + '</td>';

            ruleListHtml += '<td>';
            ruleListHtml += self.makeRuleToWords(self.data.ruleMap[ruleId]);
            ruleListHtml += '</br>';
            ruleListHtml += self.getCalculationBreakDetails(ruleBreakdownHtml, cumulativeQty, totalQty,
                self.data.ruleMap[ruleId].saturatedQuantity, self.data.ruleMap[ruleId].newPrice, self.data.ruleMap[ruleId].defaultPrice, multiRuleApplied);
            ruleListHtml += '</td>';


            ruleListHtml += '<td><i style="font-size: 16px; color: green;" class="far fa-check-circle"></i></td>';
            ruleListHtml += '</tr>';
            defaultPrice = +self.data.ruleMap[ruleId].defaultPrice;
            newPrice = +self.data.ruleMap[ruleId].newPrice;

            multiRuleApplied = true;
        });

        ruleListHtml += '</tbody>';
        ruleListHtml += '</table>';
        ruleListHtml += '</div>';

        summaryHtml += '<div style="margin-bottom: 15px; text-align: center">';
        summaryHtml += '<table class="table table-striped ruleListTable" style=" margin: 0 auto; width: 50%">';
        summaryHtml += '<tbody>';
        summaryHtml += '<tr>';
        summaryHtml += '<td>Item Number</td>';
        summaryHtml += '<td><b>' + chipsetOrDeviceNumber + '</b></td>';
        summaryHtml += '</tr>';
        summaryHtml += '<tr>';
        summaryHtml += '<td>Time Unit</td>';
        summaryHtml += '<td><b>' + timeUnit + '</b></td>';
        summaryHtml += '</tr>';
        summaryHtml += '<tr>';
        summaryHtml += '<td>Total Quantity</td>';
        summaryHtml += '<td><b>' + totalQty + '</b></td>';
        summaryHtml += '</tr>';
        summaryHtml += '<tr>';
        summaryHtml += '<td>Cumulative Quantity</td>';
        summaryHtml += '<td><b>' + cumulativeQty + '</b></td>';
        summaryHtml += '</tr>';
        summaryHtml += '<tr>';
        summaryHtml += '<td>Price before Rule</td>';
        summaryHtml += '<td><b>' + defaultPrice + '</b></td>';
        summaryHtml += '</tr>';
        summaryHtml += '</tbody>';
        summaryHtml += '</table>';
        summaryHtml += '</div>';

        var modalHtml = '<div id="ruleNotificationModal" class="modal fade" role="dialog">'
            + '<div class="modal-dialog">'
            + '<div class="modal-content">'
            + '<div class="modal-header">'
            + '<h5 class="modal-title"><b>Applied Rules</b></h5>'
            + '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'
            + '<span aria-hidden="true">&times;</span>'
            + '</button>'
            + '</div>'
            + '<div class="modal-body">'
            + summaryHtml
            + ruleListHtml
            + '</div>'
            + '<div class="modal-footer">'
            + '<button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';
        self.el.notificationModalWrapper.html(modalHtml);
    },
    getCalculationBreakDetails: function (html, cumulativeQty, itemTotal, saturatedQty, newPrice, defaultPrice, multiRuleApplied, ruleIdList) {
        var self = this;

        // $.each(ruleIdList, function(index, ruleId){
        //     self.data.ruleMap[ruleId];
        // });

        var diff = Math.abs(cumulativeQty - saturatedQty);
        html += diff + ' * ' + newPrice + ' = ' + diff * newPrice;

        // if(!multiRuleApplied){
        html += '<br>';
        html += Math.abs(diff - itemTotal) + ' * ' + defaultPrice + ' = ' + Math.abs(diff - itemTotal) * defaultPrice;
        // }

        return html;

    },
    getTableBodyHtml: function (parentListNamePrefix, chipsetOrDevice, chipsetOrDeviceId, lineItem) {
        var self = this;
        var html = "";
        var numberOfColumn = self.options.tableHeaders.length;
        var lastItem = '';
        var currentItem = '';
        var colorIndex = -1;

        $.each(self.options.tableRowsName, function (index, item) {

            var i = 0;
            if (item === 'Total') {
                html += '<tr class="totalTr">';
            } else {
                html += '<tr>';
            }
            html += '<th data-time-unit="' + item + '" style="min-width: 200px;">' + item + '</th>';

            while (i < numberOfColumn) {

                currentItem = self.options.tableHeaders[i].split('-')[1];
                if (currentItem != lastItem) {
                    colorIndex += 1;
                }

                html += '<td index="' + i + '">';

                if (item == 'Nominal') {
                    html += '<input type="text" name="' + parentListNamePrefix + '.demandAssessmentLineItemDetailsList[' + i + '].id" value="'
                        + self.getCellDataFromMap(self.getLineItemDetailMapKey(chipsetOrDevice, chipsetOrDeviceId, lineItem.customerId, self.options.tableHeaders[i], 'lineItemDetailsId'))
                        + '" style="display: none;"/>';
                    html += '<input type="text" name="' + parentListNamePrefix + '.demandAssessmentLineItemDetailsList[' + i + '].timeLineUnit'
                        + '" value="' + self.options.tableHeaders[i] + '" style="display: none;"/>';
                }

                var cellValue = self.getCellDataFromMap(self.getLineItemDetailMapKey(chipsetOrDevice, chipsetOrDeviceId, lineItem.customerId, self.options.tableHeaders[i], self.getInputClassName(item)));

                html += '<input type="text" attr-header="' + item + '" attr-time="' + self.options.tableHeaders[i] + '" ';
                html += 'name="' + self.getInputBindingName(item, parentListNamePrefix, i) + '" ';
                html += 'value="' + (cellValue != '' ? Forecast.APP.currencyFormatted(cellValue) : '') + '" ';
                html += 'data-class="' + self.getInputClassName(item) + '" ';
                html += 'data-value="' + cellValue +  '" ';
                html += 'class="form-control countInput ' + (self.getInputClassName(item) == 'total' ? 'disabled ' : '');
                html += self.getInputClassName(item) + '" ';
                html += 'autocomplete="off" index="' + i + '" style="width: 130px; color: ' + self.data.tableTdColorMap[self.options.tableHeaders[i]] + '"/></td>';
                i++;
                lastItem = currentItem;
            }
            colorIndex = -1;
            html += '</tr>';
        });
        return html;
    },
    getCellDataFromMap: function (key) {
        var self = this;
        if (+self.data.lineItemDetailsMap[key] >= 0) {
            return +self.data.lineItemDetailsMap[key];
        } else {
            return '';
        }

    },
    getChipsetOrDeviceMapKey: function (chipsetOrDevice, chipsetOrDeviceId, customerId, timeLine) {
        return chipsetOrDevice + '_' + chipsetOrDeviceId + '_' + customerId + '_' + timeLine;
    },
    getLineItemDetailMapKey: function (chipsetOrDevice, chipsetOrDeviceId, customerId, timeLine, prop) {
        return chipsetOrDevice + '_' + chipsetOrDeviceId + '_' + customerId + '_' + timeLine + '_' + prop;
    },
    getInputClassName: function (item) {
        var className = '';

        if (item == 'Nominal') {
            className += 'nominal';
        } else if (item == 'Upside Quantity') {
            className += 'upsideQty';
        } else if (item == 'Upside (%)') {
            className += 'upsidePercentage';
        } else if (item == 'Upside Probability Factor (%)') {
            className += 'upsideProbFactor';
        } else if (item == 'Buffer Quantity') {
            className += 'bufferQty';
        } else if (item == 'Buffer (%)') {
            className += 'bufferPercentage';
        } else if (item == 'Total') {
            className += 'total';
        } else if (item == 'Backlog') {
            className += 'backlog';
        }
        return className;
    },
    getInputBindingName: function (item, parentListNamePrefix, index) {
        var name = parentListNamePrefix + '.demandAssessmentLineItemDetailsList[' + index + ']';

        if (item == 'Nominal') {
            name += '.nominal';
        } else if (item == 'Upside Quantity') {
            name += '.upside';
        } else if (item == 'Upside (%)') {
            name += '.upsidePercentage';
        } else if (item == 'Upside Probability Factor (%)') {
            name += '.probabilityFactor';
        } else if (item == 'Buffer Quantity') {
            name += '.bufferQuantity';
        } else if (item == 'Buffer (%)') {
            name += '.bufferPercentage';
        } else if (item == 'Total') {
            name += '.total';
        } else if (item == 'Backlog') {
            name += '.backlog';
        }
        return name;
    },
    updateColumnTotal: function (table, index) {
        var self = this;
        var lineTotal = 0;

        $(table).find('tbody tr td input[index="' + index + '"]').each(function (idx, item) {
            if ($(item).attr('attr-header') == 'Total') {
                $(item).val(lineTotal);
            } else {
                lineTotal += +$(item).val();
            }
        });
    },
    getDataEntryTableHtml: function (parentListNamePrefix, chipsetOrDevice, chipsetOrDeviceId, lineItem) {
        var self = this;

        var html = '<table class="table table-striped custom-table da-grid-table" style="display: block; overflow-x: auto;">';
        html += '<thead>';
        html += '<tr>';
        html += '<th></th>';
        html += self.getTableHeaderHtml(chipsetOrDevice, chipsetOrDeviceId);
        html += '</tr>';
        html += '</thead>';
        html += '<tbody style="overflow: auto;">';
        html += self.getTableBodyHtml(parentListNamePrefix, chipsetOrDevice, chipsetOrDeviceId, lineItem);
        html += '</tbody>';
        html += '</table>';

        return html;
    },
    addLineItemForChipsetOrDevice: function (isPlusIcon, lineItem) {
        var self = this;
        var index = self.el.dynamicRowDiv.find('div.line-item-dynamic-row').length;
        var chipsetOrDeviceLabel = '';
        var chipsetOrDeviceSelectBox = '';
        var customerorDescriptionLabel = '';
        var customerOrDescriptionHtml = '';

        if (lineItem.chipsetOrDevice == 'CHIPSET') {
            chipsetOrDeviceSelectBox = self.getChipsetSelectBoxHtml(index, lineItem.chipsetId);
            customerorDescriptionLabel = self.options.messages.description;
            chipsetOrDeviceLabel = self.options.messages.chipSetNumber;
            customerOrDescriptionHtml = '<input type="text" class="form-control" value="'
                + Forecast.APP.valueOf(self.data.chipsetMap[lineItem.chipsetId].description) + '" disabled>';
        } else if (lineItem.chipsetOrDevice == 'RFIC') {
            chipsetOrDeviceSelectBox = self.getDeviceSelectBoxHtml(index, lineItem.deviceNumber);
            chipsetOrDeviceLabel = self.options.messages.device;
            customerorDescriptionLabel = self.options.messages.customer;
            customerOrDescriptionHtml = self.getCustomerSelectBoxHtml(index, lineItem.customerId);
        }

        var $rowToAppend = '<div class="row line-item-dynamic-row lineItemBorder accordion" style="padding-right: 0px; padding-left: 0px;" data-cs-rfic="' + (lineItem.chipsetOrDevice == 'CHIPSET' ? lineItem.chipsetId + '_CHIPSET' : lineItem.deviceId + '_RFIC') + '_lineItemDiv" index="' + index + '">'
            + '<div class="col-lg-12">'
            + '<a class="btn accordionToggleBtn btn-link"  style="position: absolute; right: 12px; z-index: 2;" type="button" data-toggle="collapse" data-target="#collapse_' + index + '" aria-expanded="true" aria-controls="collapseOne">'
            + '<i class="expandCollapseIcon fa fa-minus"></i>'
            + '</a>'
            + '<div class="form-group row " style="padding-right: 65px;">'
            + '<input type="text" name="demandAssessmentLineItemList[' + index + '].id" class="chip-set-line-item-id" style="display: none;" value="' + (lineItem.lineItemId || '') + '"/>'
            + '<label class="col-md-2 col-form-label">' + self.options.messages.chipsetOrDevice + '</label>'
            + '<div class="col-md-2">'
            + self.getChipsetOrDeviceSelectBoxHtml(index, lineItem.chipsetOrDevice)
            + '</div>'
            + '<label class="col-md-2 col-form-label deviceOrChipsetLabel">' + chipsetOrDeviceLabel + '</label>'
            + '<div class="col-md-2 deviceOrChipsetSelectDiv">'
            + chipsetOrDeviceSelectBox
            + '</div>'
            + '<label class="col-md-2 col-form-label customerLabel">' + customerorDescriptionLabel + '</label>'
            + '<div class="col-md-2 customerDiv">'
            + customerOrDescriptionHtml
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div id="collapse_' + index + '" class="col-md-12 collapse show">'
            + self.getDataEntryTableHtml('demandAssessmentLineItemList[' + index + ']', lineItem.chipsetOrDevice, (lineItem.chipsetOrDevice == 'CHIPSET' ? lineItem.chipsetId : lineItem.deviceId), lineItem)
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
        // self.el.dynamicRowDiv.find('table.da-grid-table').hide();
        self.reRenderAllSelectPicker();
        self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.removeButton);
    },
    reRenderAllSelectPicker: function () {
        // $('.selectpicker').selectpicker('destroy');
        // $('.selectpicker').selectpicker('render');
        $('.selectpicker').selectpicker('refresh');
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
    reIndexDaItems: function () {
        var self = this;
        var name = '';
        var inputNameArr = '';

        self.el.dynamicRowDiv.find('div.line-item-dynamic-row').each(function (idx, div) {
            name = 'demandAssessmentLineItemList[' + idx + ']';
            $(div).attr('index', idx);
            $(div).find('input.chip-set-line-item-id').attr("name", name + ".id");
            $(div).find('select.chipsetOrDeviceSelect').attr("name", name + ".chipsetOrDevice");
            $(div).find('select.chip-set').attr("name", name + ".chipset.id");
            $(div).find('select.device').attr("name", name + ".device.id");

            $(div).find('table.da-grid-table tbody tr td').each(function (idxx, td) {
                $(td).find('input, select').each(function (idxxx, input) {
                    inputNameArr = $(input).attr('name').split('.');
                    inputNameArr[0] = 'demandAssessmentLineItemList[' + idx + ']';
                    $(input).attr('name', inputNameArr.join('.'));
                });
            });
        });
    },
    createLineItem: function () {
        var self = this;
        var allDataInput = true;
        self.el.chipsetTableCreation.each(function () {
            if ($(this).val() == "") {
                allDataInput = false;
            }
        });
        if (allDataInput) {
            self.el.dynamicRowDiv.html("");
            self.addLineItemForChipsetOrDevice(true, self.options.chipsetItem);
            self.addPlusIconForTheLastItem();
        }
    },
    disableForViewOnly: function () {
        var self = this;

        self.el.demandAssessmentForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.demandAssessmentForm.find('select').attr("disabled", true);
        self.el.demandAssessmentForm.find('textarea').attr("disabled", true);
        self.el.demandAssessmentForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.demandAssessmentForm.attr("href", "#");
    },
    exportTableToCsv: function (filename) {
        var self = this;
        var csv = [];

        $(document).find('table.da-report-grid-table tr').each(function (index, tr) {
            var row = [];
            $(tr).find('th').each(function (idx, th) {
                row.push("'" + $(th).text() + "'");
            });

            if (row.length > 0) {
                csv.push(row.join(","));
            }

            row = [];
            $(tr).find('td').each(function (idx, td) {

                if (+$(td).attr('colspan') > 0) {
                    for (var i = 0; i < +$(td).attr('colspan') - 1; i++) {
                        row.push('');
                    }
                    row.push('' + $(td).text().replace(/,/g, ''));
                } else {
                    row.push('' + $(td).text().replace(/,/g, ''));
                }
            });

            if (row.length > 0) {
                csv.push(row.join(","));
            }
        });
        self.downloadCsv(csv.join("\n"), filename);
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
