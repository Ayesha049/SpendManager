$.widget("forecast.fabReceive", {
    options: {
        fabPoReceiveItemList: undefined,
        fabReceiveDropDownList: undefined,
        fabReceiveItemRestQuantityList: undefined,
        submitButton: undefined,
        fabPoReceiveItemListSize: 0,
        messages: undefined,
        viewOnly :undefined,
        fabPoReceiveItem: {
            id: '',
            lotNumber: '',
            unitPrice: 0,
            totalQuantity: 0,
            receivedQuantity: 0,
            restQuantity: 0,
            fabReceiveItem: 0,
        },
    },
    _create: function () {
        console.log("FALOG :: ---------- fab receive widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.el.fabReceiveNumber = $("#fabReceiveNumber");
        self.data = {};
        self.data.selectedLot = [{}];
        self.data.restQuantity = 0;
        self.data.uniqueProducts = [];
        self.data.receivedQuantityMap = {};
        self.data.itemMap = {};
        self.data.productMap = {},
        self.data.totalQuantityMap = {};
        self.data.restQuantityMap = {};
        self.data.totalPrice = 0;
        self.data.targetPrice = 2500;

        // UI element Initialization
        self.el.fabReceiveForm = $("#fab_receive_form");
        self.el.fabReceiveDynamicRowDiv = $("#fabReceiveDynamicRowDiv");
        self.el.fabReceiveHeader = $(".fab-receive-header");
        self.el.fabPoReceiveItemDiv = $('.fab-po-receive-item-div');
        self.el.searchBoxReviewer = $('#searchReviewer');
        self.el.submitButton = $("#submitButton");
        self.el.receivedDate = $('#receivedDate');

        self.el.gobackButton = '<a href="/admin/fabReceive" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<a type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.removeButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';
        self.el.fileViewButton = '<a type="button" target="_blank" id="fileViewButton" class="btn save-button next-button">View File</a>';

        if (self.options.fabPoReceiveItemList !== 'undefined') {
            self.options.fabPoReceiveItemListSize = self.options.fabPoReceiveItemList.length;
        }

        if (self.options.fabReceiveDropDownList !== 'undefined') {
            self.options.fabReceiveDropDownListSize = self.options.fabReceiveDropDownList.length;
        }

        if (self.options.fabReceiveItemRestQuantityList !== 'undefined') {
            self.options.fabReceiveItemRestQuantityListSize = self.options.fabReceiveItemRestQuantityList.length;
        }

        if(self.options.fabReceiveDropDownList !== 'undefined'){
            $.each(self.options.fabReceiveDropDownList, function (index, item){
                if(self.data.productMap[item.id] === undefined) {
                    self.data.productMap[item.id] = [{
                        itemId: item.itemId,
                        itemName: item.itemName
                    }];
                } else {
                    self.data.productMap[item.id].push({
                        itemId: item.itemId,
                        itemName: item.itemName
                    });
                }

                if(self.data.itemMap[item.itemId] === undefined) {
                    self.data.itemMap[item.itemId] = [{
                        category: item.category,
                        lotNumber: item.lotNumber,
                        totalQuantity: item.itemTotalQuantity,
                        unitPrice: item.unitPrice,
                    }];
                } else {
                    self.data.itemMap[item.itemId].push({
                        category: item.category,
                        lotNumber: item.lotNumber,
                        totalQuantity: item.itemTotalQuantity,
                        unitPrice: item.unitPrice,
                    });
                }
                if(self.data.receivedQuantityMap[item.lotNumber] === undefined) {
                    self.data.receivedQuantityMap[item.lotNumber] = {
                        receivedQuantity: item.receivedQuantity
                    };
                }
            });
        }

        if(self.options.fabReceiveItemRestQuantityList !== 'undefined') {
            $.each(self.options.fabReceiveItemRestQuantityList, function (index, item) {
                self.data.restQuantityMap[item.id] = item.itemRestQuantity;
            });
        }
    },
    _init: function () {
        console.log("SMNLOG :: ---------- fabReceive widget init ----------");
        var options = this.options;
        var self = this;
        self.initiateFormValidation();

        if (self.options.LotNumberList > 0) {
            $.each(self.options.LotNumberList, function (index, item) {
                self.data.selectedLot.push(item.id);
            });
        }

        //self.createLotNumberSelectHtml(self.data.selectedServiceList);


        if (self.options.fabPoReceiveItemListSize > 0) { // if update
            $.each(self.options.fabPoReceiveItemList, function (index, fabPoReceiveItem) {
                self.addLineItemForSupplier(true, fabPoReceiveItem);
            });
            self.addPlusIconForTheLastItem();
        }

        self.uiEventInitialization();

        if (self.options.viewOnly === true){
            self.disableForViewOnly();
        }
    },
    initiateFormValidation: function () {
        var self = this;
        var validateJson = {
            rules: {
                fabReceiveNumber: {
                    required: true,
                    maxlength: 25
                },
                receivedDate: {
                    required: true
                },
                receivedQuantity: {
                    required: true
                },
                fabReceiveItem: {
                    required: true
                },
                'preparedBy.username': {
                    required: true
                }
            }
        };
        self.el.fabReceiveForm.validate(validateJson);

        Forecast.APP.addDynamicFieldValidationByClassNameSelector("select-item-order", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("select-lot-number", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("received-qty", {required: true});
    },

    uiEventInitialization: function () {
        var self = this;

        self.el.submitButton.on('click', function(){
            self.el.fabReceiveForm.trigger('submit');
        });

        self.el.receivedDate.datetimepicker({
            format: Forecast.APP.GLOBAL_DATE_FORMAT_US,
            maxDate: moment()
        });

        $(document).on('click', 'a.itemAddButton', function () {
            self.addLineItemForSupplier(true, self.options.fabPoReceiveItem);

            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', '.button-success', function () {
            console.log('Nice life');
        });

        $(document).on('click', 'a.itemRemoveButton', function () {
            $(this).parent().parent().remove();
            self.addPlusIconForTheLastItem();
            self.reIndexfabPoReceiveItems();
        });

        $(document).on('change', '#select-purchase-order', function (fabPoReceiveItem) {
            var index = self.el.fabPoReceiveItemDiv.find('div.form-group').length;
            $(document).find('.fabReceiveHeader').detach();
            $(document).find('.fabReceiveItem').detach();

            var fabReceiveNumber = self.el.fabReceiveNumber.val();
            self.el.fabReceiveNumber.val(fabReceiveNumber);

            $rowToAppend = self.addHeader();

            self.el.fabReceiveHeader.append($rowToAppend);

            self.addLineItemForSupplier(true, self.options.fabPoReceiveItem);
            self.addPlusIconForTheLastItem();

            var selectedPurchaseOrder = +$(this).val();
        });


        $(document).on('change', 'select.select-work-order', function () {
            var index = self.el.fabPoReceiveItemDiv.find('div.form-group').length;
            var selectedElement = $(this);
            var selectedWorkOrder = +$(this).val();

            if((!self.isWorkOrderUnique(selectedWorkOrder, selectedElement)) && (self.data.itemMap[selectedItem][0].category === 'SERVICE' || self.data.itemMap[selectedItem][0].category === 'NRE')){
                $(this).val("");
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("You can not select this work order. It's already been selected."));
            }else{
                $(document).find('select:last.select-item-order').html(self.getSelectBoxForItems(self.data.itemMap[selectedWorkOrder]));
            }
        });

        $(document).on('change', '.select-item-order', function () {
            var selectedElement = $(this);
            var selectedItem = $(this).val();

            if((!self.isServiceItemUnique(selectedItem, selectedElement)) && (self.data.itemMap[selectedItem][0].category === 'SERVICE' || self.data.itemMap[selectedItem][0].category === 'NRE')){
                $(this).val("");
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("You can not select this Service Item. It's already been selected."));
            }

            var index = self.el.fabPoReceiveItemDiv.find('div.form-group').length;
            var rowItem = $(document).find('div.fabReceiveItem').last();

            var itemObj = self.data.itemMap[selectedItem][0];
            var totalQuantityValue = itemObj.totalQuantity;
            var unitPrice = itemObj.unitPrice;

            if(self.data.restQuantityMap[selectedItem] === undefined) {
                rowItem.attr("restQuantityValue", totalQuantityValue);
            }
            else {
                rowItem.attr("restQuantityValue", self.data.restQuantityMap[selectedItem]);
            }

            var restQuantityValue = rowItem.attr("restQuantityValue");

            $(this).closest('.fabReceiveItem').find('.total-qty').attr("totalQuantityValue", totalQuantityValue);
            $(this).closest('.fabReceiveItem').find('.rest-qty').attr("restQuantityValue", restQuantityValue);
            $(this).closest('.fabReceiveItem').find('.unit-price').attr("unitPrice", unitPrice);


            $(this).closest('.fabReceiveItem').find('.total-qty').val(totalQuantityValue);
            $(this).closest('.fabReceiveItem').find('.rest-qty').val(restQuantityValue);
            $(this).closest('.fabReceiveItem').find('.unit-price').val(unitPrice);


            if(self.data.itemMap[selectedItem][0].category === 'SERVICE' || self.data.itemMap[selectedItem][0].category === 'NRE'){
                $(this).closest('div.fabReceiveItem').find('select:last.select-lot-number').attr('disabled', true);
            }
            else {
                $(this).closest('div.fabReceiveItem').find("select:last.select-lot-number").attr('disabled', false);
            }

            $(this).closest('.fabReceiveItem').find('.select-lot-number').html(self.createLotNumberSelectHtml(self.data.itemMap[selectedItem], index));
            //$(document).find('select:last.select-lot-number').html(self.createLotNumberSelectHtml(self.data.itemMap[selectedItem], index));
        });

        $(document).on('change', '.select-lot-number', function (){
            var selectedElement = $(this);
            var selectedItem = $(this).val();

            if(!self.isLotUnique(selectedItem, selectedElement)){
                $(this).val("");
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("You can not select this Lot. It's already been selected."));
            }
            else {
                var selectedLot = $(this).val();
                var receivedQuantity = self.data.receivedQuantityMap[selectedLot].receivedQuantity;
                $(this).closest('.fabReceiveItem').find('.received-qty').attr("receivedQuantity", receivedQuantity);
                $(this).closest('.fabReceiveItem').find('.received-qty').val(receivedQuantity).trigger('change');
            }

            if(selectedItem) {
                $(this).closest('div.fabReceiveItem').find(".select-lot-number").addClass("disabled");
            }
        });

        $(document).on('change', '.received-qty', function () {
            var receivedQuantity = +$(this).val();
            var restQuantity = +$(this).closest('.fabReceiveItem').find('.rest-qty').attr("restQuantityValue");


            if(receivedQuantity > restQuantity) {
                bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("Received quantity can not be greater than rest quantity"));
                $(this).val(0);
                var restQuantityVal = $(document).find('div.fabReceiveItem').last().attr("restQuantityValue");
                $(this).closest('.fabReceiveItem').find('.rest-qty').val(restQuantityVal);
            }

            else {
                receivedQuantity = +$(this).val();

                $(this).closest('.fabReceiveItem').find('.received-qty').attr("receivedQuantity", receivedQuantity);
                //$(this).closest('.fabReceiveItem').find('.received-qty').val(receivedQuantity).trigger('change');

                var unitPrice = $(this).closest('.fabReceiveItem').find('.unit-price').attr("unitPrice");
                self.data.totalPrice += unitPrice * receivedQuantity;

                $(document).find('#total-price').val(self.data.totalPrice);

                var restQuantityVal = $(document).find('div.fabReceiveItem').last().attr("restQuantityValue");

                var newRestQuantity = restQuantityVal - receivedQuantity;

                $(this).closest('.fabReceiveItem').find('.rest-qty').val(newRestQuantity);
                $(this).closest('.fabReceiveItem').find('.rest-qty').attr("restQuantityVal", newRestQuantity);

            }

            if(receivedQuantity) {
                $(this).closest('div.fabReceiveItem').find(".received-qty").addClass("disabled");
            }
        });
    },

    addHeader: function () {
        var $rowToAppend = '<div class="col-md-12 form-group row fabReceiveHeader">'
            + '<div class="col-md-2 text-center">'
            + 'Product Name'
            + '</div>'
            + '<div class="col-md-2 text-center">'
            + 'Lot Number'
            + '</div>'
            + '<div class="col-md-2 text-center">'
            + 'Total Quantity'
            + '</div>'
            + '<div class="col-md-2 text-center">'
            + 'Received Quantity'
            + '</div>'
            + '<div class="col-md-2 text-center">'
            + 'Unit Price'
            + '</div>'
            + '<div class="col-md-1 text-center">'
            + 'Balance'
            + '</div>'

        $rowToAppend += '</div>';
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        return $rowToAppend;
    },

    isLotUnique: function(selectedItemId, selectedElement){
        var self = this;
        var isUnique = true;
        self.el.fabPoReceiveItemDiv.find('select.select-lot-number').not(selectedElement).each(function () {
            var itemId = $(this).val();
            if(itemId === selectedItemId){
                isUnique = false;
            }
        });
        return isUnique;
    },

    isServiceItemUnique: function(selectedItemId, selectedElement){
        var self = this;
        var isUnique = true;
        self.el.fabPoReceiveItemDiv.find('select.select-item-order').not(selectedElement).each(function () {
            var itemId = $(this).val();
            if(itemId === selectedItemId){
                isUnique = false;
            }
        });
        return isUnique;
    },

    reIndexfabPoReceiveItems: function(){
        var self = this;
        var index = 0;
        var name = '';
        self.data.totalPrice = 0;

        self.el.fabPoReceiveItemDiv.find('div.form-group').each(function(){
            name = 'fabPoReceiveItemList[' + index + ']';
            $(this).find('div').find('select.select-lot-number').attr("name", name + ".select-lot-number");
            $(this).find('div').find('select.select-item-order').attr("name", name + ".select-item-order");
            $(this).find('div').find('input.total-qty').attr("name", name + ".total-qty");
            $(this).find('div').find('input.received-qty').attr("name", name + ".received-qty");
            $(this).find('div').find('input.rest-qty').attr("name", name + ".rest-qty");
            $(this).find('div').find('input.unit-price').attr("name", name + ".unit-price");

            var receivedQuantity = $(this).find('div').find('input.received-qty').attr("receivedQuantity");
            //var receivedQuantity = $(this).closest('.fabReceiveItem').find('.received-qty').attr("receivedQuantity", receivedQuantity);

            var unitPrice = $(this).find('div').find('input.unit-price').attr("unitPrice");

            console.log(receivedQuantity, "this is the received quantity");
            console.log(unitPrice, "this is the unit price");

            if(receivedQuantity && unitPrice) self.data.totalPrice += receivedQuantity * unitPrice;

            $(document).find('#total-price').val(self.data.totalPrice);

            index++;
        });
    },

    addLineItemForSupplier: function (isPlusIcon, fabPoReceiveItem) {
        var self = this;

        //dynamic row creation
        var index = self.el.fabPoReceiveItemDiv.find('div.form-group').length;
        var selectedPurchaseOrder = +$(document).find('#select-purchase-order').val();
        var selectedItem = +$(document).find('.select-item-order').val();


        const products = self.data.productMap[selectedPurchaseOrder];

        self.data.uniqueProducts = Array.from(new Set(products.map(a => a.itemId)))
            .map(itemId => {
                return products.find(a => a.itemId === itemId)
            })

        self.data.productMap[selectedPurchaseOrder] = self.data.uniqueProducts;

        console.log("FALOG fabPoReceiveItem::"+JSON.stringify(fabPoReceiveItem));
        var $rowToAppend = '<div class="form-group row fabReceiveItem" data-attr-index="'+index+'">'
            + '<div class="col-md-2">'
            + '<input name="fabPoReceiveItemList[' + index + '].id" class="fab-receive-item-id" style="display: none;" value="' + fabPoReceiveItem.id + '" />'
            + self.getSelectBoxForItems(self.data.productMap[selectedPurchaseOrder], index)
            + '</div>'
            + '<div class="col-md-2">'
            + self.createLotNumberSelectHtml(self.data.itemMap[selectedItem], index)
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="fabPoReceiveItemList[' + index + '].totalQuantity" class="form-control total-qty disabled" value="' + fabPoReceiveItem.totalQuantity + '"/>'
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="fabPoReceiveItemList[' + index + '].receivedQuantity" class="form-control received-qty" value="' + fabPoReceiveItem.receivedQuantity + '"/>'
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="fabPoReceiveItemList[' + index + '].unitPrice" class="form-control unit-price disabled" value="' + fabPoReceiveItem.unitPrice + '"/>'
            + '</div>'
            + '<div class="col-md-1">'
            + '<input type="text" name="fabPoReceiveItemList[' + index + '].restQuantity" class="form-control rest-qty disabled" value="' + fabPoReceiveItem.restQuantity + '"/>'
            + '</div>'
            + '<div class="col-md-1 itemAddRemoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }

        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.fabPoReceiveItemDiv.append($rowToAppend);
        //$(document).find('.select-lot-number').select2({minimumResultsForSearch: -1, width: '100%'});
        //$(document).find('select:last.select-lot-number').val(self.data.selectedLot).trigger('change');
        self.el.fabPoReceiveItemDiv.find('div.form-group:last').prev().find('div.itemAddRemoveButtonDiv').html(self.el.removeButton);
    },

    // createLotNumberSelectHtml: function(selectedValues, index) {
    //     var self = this;
    //     var html = '<select class="custom-select select select-lot-number" placeholder="Lot Number" multiple="multiple">';
    //
    //     $.each(self.options.LotNumberList, function (index, item) {
    //         html += '<option value="' + item.id + '">' + item.name + '</option>';
    //     });
    //
    //     html += '</select>';
    //
    //     return html;
    // },

    createLotNumberSelectHtml: function(list, index) {
        var self = this;
        var html = '<select name="fabPoReceiveItemList[' + index + '].lotNumber"  class="form-control select-lot-number">';

        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(list, function (index, item) {
            html += '<option value="' + item.lotNumber + '">' + item.lotNumber + '</option>';
        });
        html +='</select>';
        return html;
    },

    // getSelectBoxForWorkOrder: function (list, index) {
    //     var self = this;
    //     //var html = '<select name="'+name+'" class="form-control '+cls+'" id="select-work-order">';
    //     var html = '<select name="fabPoReceiveItemList[' + index + '].fabWorkOrder"  class="form-control select-work-order" placeholder="Work orders">';
    //
    //     html += '<option value="">' + self.options.messages.selectAny + '</option>';
    //     $.each(list, function (index, item) {
    //         html += '<option value="' + item.workOrderId + '">' + item.workOrderName + '</option>';
    //     });
    //     html +='</select>';
    //     return html;
    // },

    getSelectBoxForItems: function (list, index) {
        var self = this;
        var html = '<select name="fabPoReceiveItemList[' + index + '].fabReceiveItem" class="form-control select-item-order" >';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';
        $.each(list, function (index, item) {
            //self.data.totalQuantityMap[item.itemId] = item.itemTotalQuantity;
            html += '<option value="' + item.itemId + '">' + item.itemName + '</option>';
        });
        html +='</select>';
        return html;
    },

    addPlusIconForTheLastItem: function () {
        var self = this;
        if(self.el.fabPoReceiveItemDiv.children().length == 1){
            self.el.fabPoReceiveItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.addButton);
        }
        else{
            self.el.fabPoReceiveItemDiv.find('div.form-group:last').find('div.itemAddRemoveButtonDiv').html(self.el.removeButton + self.el.addButton);
        }
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.fabReceiveForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.fabReceiveForm.find('select').attr("disabled", true);
        self.el.fabReceiveForm.find('textarea').attr("disabled", true);
        self.el.searchBoxReviewer.attr("disabled", true);
        self.el.fabReceiveForm.find('a[type="button"]').not("#submitButton , #fileViewButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.fabReceiveForm.attr("href", "#");
    },
    destroy: function () {
    }
});
