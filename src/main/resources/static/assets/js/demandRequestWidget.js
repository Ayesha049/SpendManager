$.widget("forecast.demandRequest", {
    options: {
        dataEntryType: undefined,
        timelineFrom: undefined,
        timelineTo: undefined,
        userList: undefined,
        chipsetList: undefined,
        lineItemList: undefined,
        deviceList: undefined,
        messages: undefined,
        viewOnly: undefined,
        lineItem: {
            id: '',
            userId: '',
            lineItemDetailsList: [{
                deviceNumber: '',
                chipsetNumber: '',
            }],
        },
    },
    _create: function () {
        console.log("SMNLOG :: ---------- demandRequest widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        self.data.lineItemDetailsMap = {};
        self.data.chipsetMap = {};
        self.data.deviceMap = {};
        self.data.userMap = {};
        self.data.chipsetLineItemData = {};
        self.data.deviceLineItemData = {};
        self.data.userLineItemData = {};

        if (self.options.lineItemList != 'undefined') {
            self.options.lineItemListSize = self.options.lineItemList.length;
        }

        if (self.options.chipsetList != undefined) {
            $.each(self.options.chipsetList, function (index, item) {
                var items = {};
                items["id"] = item.id;
                items["chipsetNumber"] = item.chipsetNumber;
                self.data.chipsetMap[item.id] = item;
            });
        }

        if (self.options.deviceList != undefined) {
            $.each(self.options.deviceList, function (index, item) {
                var items = {};
                items["id"] = item.id;
                items["deviceNumber"] = item.deviceNumber;
                self.data.deviceMap[item.id] = item;

            });
        }

        if (self.options.userList != undefined) {
            $.each(self.options.userList, function (index, item) {
                var items = {};
                items["id"] = item.id;
                items["userId"] = item.userId;
                self.data.userMap[item.userId] = item;
            });
        }
        // UI element Initialization
        self.el.demandRequestForm = $("#demand_request_form");
        self.el.id = $(document).find("#id");
        self.el.dynamicRowDiv = $(".dynamicRowDiv");
        self.el.dataEntryType = $("#dataEntryType");
        self.el.fromDate = $("#fromDate");
        self.el.toDate = $("#toDate");
        self.el.chipsetTableCreation = $(".chipsetTableCreation");
        self.el.submitButton = $("#submitButton");

        self.el.gobackButton = '<a href="/admin/demandRequestList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<button type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></button>';
        self.el.removeButton = '<button type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></button>';
    },
    _init: function () {
        console.log("SMNLOG :: ---------- demandRequest widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.lineItemListSize > 0) {
            $.each(self.options.lineItemList, function (index, lineItem) {
                self.addLineItemForAll(true, lineItem);
                var deviceHtml = '';
                var chipsetHtml = '';
                var selectedDevices = [];
                var selectedChipsets = [];
                var lineIdx = [];
                $.each(lineItem.lineItemDetailsList, function (idx, lineItemDetail) {
                    if (lineItemDetail.deviceId != null) {
                        selectedDevices.push(lineItemDetail.deviceId);
                        lineIdx.push(lineItemDetail.lineItemDetailsId);
                    }
                    if (lineItemDetail.chipsetId != null) {
                        selectedChipsets.push(lineItemDetail.chipsetId);
                        lineIdx.push(lineItemDetail.lineItemDetailsId);
                    }
                });

                self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last').find('select.deviceSelect').val(selectedDevices).trigger("change");
                self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last').find('select.chipsetSelect').val(selectedChipsets).trigger("change");
                self.createHiddenLineItemForDeviceAndChipset(self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last'));

            });
            self.addPlusIconForTheLastItem();
        } else {
            self.addLineItemForAll(true, self.options.lineItem)
            self.addPlusIconForTheLastItem();
        }
        self.uiEventInitialization();
        if (self.options.viewOnly == true) {
            self.disableForViewOnly();
        }
    },
    initiateFormValidation: function () {
        var self = this;

        var validateJson = {
            rules: {
                daNumber: {
                    required: true
                },
                entryDate: {
                    required: true
                },
                forecastDate: {
                    required: true
                },
                crd: {
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
            },
            messages: {},
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };

        self.el.demandRequestForm.validate(validateJson);

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("chip-set", {required: true});
        // Forecast.APP.addDynamicFieldValidationByClassNameSelector("chipsetSelect", {required: true});
    },

    uiEventInitialization: function () {
        var self = this;

        $(document).on('click', 'button.itemAddButton', function () {
            self.addLineItemForAll(true, self.options.lineItem)
            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'button.itemRemoveButton', function () {
            $(this).parent().parent().remove();
            self.addPlusIconForTheLastItem();
            self.reIndexDaItems();
        });

        $(document).on('change', 'select.deviceSelect', function () {
            self.createHiddenLineItemForDeviceAndChipset($(this).parent().parent());
        });

        $(document).on('change', 'select.chipsetSelect', function () {
            self.createHiddenLineItemForDeviceAndChipset($(this).parent().parent());
        });
    },

    createHiddenLineItemForDeviceAndChipset: function (selectedElement) {
        console.log("SMNLOG ::createHiddenLineItemForDeviceAndChipset ");
        var self = this;
        var devices = $(selectedElement).find('select.deviceSelect').val();
        var chipsets = $(selectedElement).find('select.chipsetSelect').val();

        var deviceHtml = '';
        var chipsetHtml = '';
        var lineItemIndex = $(selectedElement).attr('attr-index');
        var lineItemDetailIndex = 0;

        $.each(devices, function (index, item) {
            //console.log(item)
            var deviceItem = {
                deviceId: item
            };
            deviceHtml += self.createHiddenInput(lineItemIndex, lineItemDetailIndex, deviceItem, true);
            lineItemDetailIndex++;
        });

        $.each(chipsets, function (index, item) {
            var chipsetItem = {
                chipsetId: item
            };
            chipsetHtml += self.createHiddenInput(lineItemIndex, lineItemDetailIndex, chipsetItem, false);
            lineItemDetailIndex++;
        });
        $(selectedElement).find('div.hiddenInputParentDeviceDiv').html(deviceHtml);
        $(selectedElement).find('div.hiddenInputParentChipsetDiv').html(chipsetHtml);
    },
    addLineItemForAll: function (isPlusIcon, lineItem) {
        var self = this;
        var index = self.el.dynamicRowDiv.find('div.line-item-dynamic-row').length;
        var $rowToAppend = '<div class="form-group row line-item-dynamic-row" attr-index = "' + index + '" >'
            + '<div class="col-md-2">'
            + '<input type="text" name="demandRequestLineItemList[' + index + '].id" class="chip-set-line-item-id" style="display: none;" value="' + lineItem.id + '"/>'
            + self.getUserSelectBoxHtml(index, lineItem.userId)
            + '</div>'
            + '<div class="col-md-3">'
            + self.getDeviceSelectBoxHtml(index)
            + '</div>'
            + '<div class="col-md-3">'
            + self.getChipsetSelectBoxHtml(index)
            + '</div>'
            + '<div class="hiddenInputParentChipsetDiv">'
            + '</div>'
            + '<div class="hiddenInputParentDeviceDiv">'
            + '</div>'
            + '<div class="col-md-1 itemAddremoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.dynamicRowDiv.append($rowToAppend);
        self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last').find('select.chipsetSelect').select2({
            minimumResultsForSearch: -1,
            width: '100%'
        });
        self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last').find('select.deviceSelect').select2({
            minimumResultsForSearch: -1,
            width: '100%'
        });
        self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last').prev().find('div.itemAddremoveButtonDiv').html(self.el.removeButton);
    },

    createHiddenInput: function (lineItemIndex, lineItemDetailIndex, item, isDevice) {
        console.log("SMNLOG item::" + JSON.stringify(item));
        var self = this;
        console.log(lineItemIndex);
        console.log(lineItemDetailIndex);
        var html = '<div class="hiddenInputDivClass" style="display: none;>';
        html += '<input type="text" name="demandRequestLineItemList[' + lineItemIndex + '].demandRequestLineItemDetailsList[' + lineItemDetailIndex + '].id" class="chip-set-line-item-id" style="display: none;" value="' + Forecast.APP.valueOf(item.id) + '"/>';
        html += '<input type="text" name="demandRequestLineItemList[' + lineItemIndex + '].demandRequestLineItemDetailsList[' + lineItemDetailIndex + '].chipsetOrDevice" class="chipset-or-device" style="display: none;" value="' + (isDevice ? 'RFIC' : 'CHIPSET') + '"/>';
        if (isDevice) {
            html += '<input type="text" name="demandRequestLineItemList[' + lineItemIndex + '].demandRequestLineItemDetailsList[' + lineItemDetailIndex + '].device.id" class="chip-set-line-item-id" style="display: none;" value="' + item.deviceId + '"/>';
        } else {
            html += '<input type="text" name="demandRequestLineItemList[' + lineItemIndex + '].demandRequestLineItemDetailsList[' + lineItemDetailIndex + '].chipset.id" class="chip-set-line-item-id" style="display: none;" value="' + item.chipsetId + '"/>';
        }
        html += '</div>';
        return html;
    },

    addPlusIconForTheLastItem: function () {
        var self = this;
        if (self.el.dynamicRowDiv.children().length == 1) {
            self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last').find('div.itemAddremoveButtonDiv').html(self.el.addButton);
        }
        else {
            self.el.dynamicRowDiv.find('div.line-item-dynamic-row:last').find('div.itemAddremoveButtonDiv').html(self.el.removeButton + self.el.addButton);
        }
    },
    getChipsetSelectBoxHtml: function (index) {
        var self = this;
        var html = '<select class="custom-select select chipsetSelect" multiple="multiple" placeholder="" index="' + index + '">';
        // html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.chipsetList, function (index, item) {
            html += '<option value="' + item.id + '">' + item.chipsetNumber + '</option>';
        });
        html += '</select>';
        return html;
    },

    getDeviceSelectBoxHtml: function (index) {
        var self = this;
        var html = '<select  class="custom-select select deviceSelect" multiple="multiple" placeholder="" index="' + index + '">';
        // html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.deviceList, function (index, item) {
            html += '<option value="' + item.id + '">' + item.deviceNumber + '</option>';
        });
        html += '</select>';
        return html;
    },
    getUserSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="demandRequestLineItemList[' + index + '].user.id" class="custom-select userSelect" placeholder="" index="' + index + '" required >';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.userList, function (index, item) {
            if (selectedValue == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.username + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.username + '</option>';
            }
        });
        html += '</select>';
        return html;
    },
    reIndexDaItems: function () {
        var self = this;
        var name = '';
        var inputNameArr = '';

        self.el.dynamicRowDiv.find('div.line-item-dynamic-row').each(function (index, div) {
            name = 'demandRequestLineItemList[' + index + ']';
            $(div).find('input.chip-set-line-item-id').attr("name", name + ".id");
            $(div).find('input.chipset-or-device').attr("name", name + ".chipsetOrDevice");
            $(div).find('select.chip-set').attr("name", name + ".chipsetId");
            $(div).find('select.device').attr("name", name + ".deviceId");
            index++;
        });
    },

    disableForViewOnly: function () {
        var self = this;
        self.el.demandRequestForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.demandRequestForm.find('select').attr("disabled", true);
        self.el.demandRequestForm.find('textarea').attr("disabled", true);
        self.el.demandRequestForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.demandRequestForm.attr("href", "#");
    },
    destroy: function () {
    }
});
