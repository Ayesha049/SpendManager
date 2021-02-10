
$.widget("forecast.rfi", {
    options: {
        userList: undefined,
        chipsetList: undefined,
        userItemList: undefined,
        chipsetItemList: undefined,
        messages: undefined, // All static messages came from message_x.properties, will be passed here through this properties
        viewOnly : undefined,
        revise : undefined,
        clone : undefined,
        title: undefined,
        chipsetItem: {
            id: '',
            qty: '',
            cost: '',
            chipsetNumber: ''
        },
        userItem: {
           id: '',
           username: ''
        }
    },
    _create: function () {
        console.log("SMNLOG :: ---------- rfi widget create ----------");
        var options = this.options;
        var html = [];
        var self = this;
        self.el = {}; // this object is to keep all ui element.
        self.data = {}; // this object is to keep all local data.
        self.data.userMap = {};

        if (self.options.chipsetItemList != 'undefined') {
            self.options.chipsetItemListSize = self.options.chipsetItemList.length;
        }

        if (self.options.userItemList != 'undefined') {
            self.options.userItemListSize = self.options.userItemList.length;
        }

        // UI element Initialization
        self.el.rfiForm = $("#rfi_form");
        self.el.userRowDiv = $("#userRowDiv");
        self.el.userItemDiv = $(".user-item-div");
        self.el.dynamicRowDiv = $("#dynamicRowDiv");
        self.el.selectpicker = $(".selectpicker");
        self.el.chipsetLineItemDiv = $(".chipset-line-item-div");
        self.el.searchBoxReviewer = $('#searchReviewer');
        self.el.submitButton = $("#submitButton");

        self.el.gobackButton = '<a href="/admin/rfiList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';
        self.el.addButton = '<a type="button" class="itemAddButton"><i class="fa fa-plus fa-1g"></i></a>';
        self.el.removeButton = '<a type="button" class="itemRemoveButton"><i class="fa fa-minus fa-1g"></i></a>';

    },
    _init: function () {
        console.log("SMNLOG :: ---------- rfi widget init ----------");
        var options = this.options;
        var self = this;
        var revisionVersion1, revisionVersion2;

        self.initiateFormValidation();
        revisionVersion1 = $('#rfiNumber').val().substring(14, $('#rfiNumber').val().length-1);
        revisionVersion2 = $('#rfiNumber').val().substring(15, $('#rfiNumber').val().length);
        //user list row
        if (self.options.userItemListSize > 0 && (!self.options.revise || !self.options.clone) ) { // if update
            $.each(self.options.userItemList, function (index, userItem) {
                //console.log(userItem.username);
                self.addLineItemForUser(userItem);
            });
        } else {
               self.addLineItemForUser(self.options.userItem);
        }

        if (self.options.chipsetItemListSize > 0 && (!self.options.revise || !self.options.clone) ) { // if update
            $.each(self.options.chipsetItemList, function (index, chipsetItem) {
                self.addLineItemForChipset(true, chipsetItem);
            });
            self.addPlusIconForTheLastItem();
        } else { // By default one row
            self.addLineItemForChipset(true, self.options.chipsetItem);

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastItem();
        }
        self.uiEventInitialization();
        var fileName = $("#rfiNumber").val();

        if(fileName){
                $("#rand1").val(fileName[3]);
                $("#rand2").val(fileName[4]);
                $("#rand3").val(fileName[5]);
                $("#rand4").val(fileName[6]);
                $("#rand5").val(fileName[7]);
                $("#rand6").val(fileName[8]);
                $("#rand7").val(fileName[9]);
                $("#rand8").val(fileName[10]);
                $("#rev4").val(fileName[14]);
                $("#rev5").val(fileName[15]);
        } else {
                //for rfi create mode
                self.systemGeneratedRfiNumber();
        }
        if (self.options.viewOnly == true){
            self.disableForViewOnly();
        }
        if (self.options.clone == true){
             self.systemGeneratedRfiNumber();
        }
        if (self.options.revise == true){
            var $fileId = $(document).find('input#rfiNumber');
            var self = this;
            $fileId.val("0");

            if(revisionVersion2 === "9"){
                revisionVersion1 = (parseInt(revisionVersion1) + 1).toString();
                revisionVersion2 = "0";
             }
            else {
                revisionVersion2 = (parseInt(revisionVersion2) + 1).toString();
            }
            self.generateFileName(fileName.substring(3, 11), revisionVersion1, revisionVersion2 );

            var $rfiNumber = $("#rfiNumber");
            var RFINumber = '';
            var valueArray = $('.rfi_number_box').map(function() {
                return this.value;
            }).get();
            for(var i = 0; i < valueArray.length; i++){
                RFINumber += valueArray[i];
            }
            $rfiNumber.val(RFINumber);
        }
    },
    initiateFormValidation: function () {
        var self = this;

        var validateJson = {
            rules: {
                RFINumber: {
                    required: true,
                    maxlength: 16
                },
                userItem: {
                    required: true
                },
                crd: {
                    required: true
                },
            },
            messages: {},
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };
        self.el.rfiForm.validate(validateJson);
        // Add dynamic validation for newly added line items
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("chip-set", {required: true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("chip-set-qty", {required: true, number:true});
        Forecast.APP.addDynamicFieldValidationByClassNameSelector("chip-set-cost", {required: true, number:true});
    },

    systemGeneratedRfiNumber: function () {
         var self = this;
         var $rfiNumber = $("#rfiNumber");
         var randomString  = self.generateRandomNumberString(8);
             $("#rand1").val(randomString[0]);
             $("#rand2").val(randomString[1]);
             $("#rand3").val(randomString[2]);
             $("#rand4").val(randomString[3]);
             $("#rand5").val(randomString[4]);
             $("#rand6").val(randomString[5]);
             $("#rand7").val(randomString[6]);
             $("#rand8").val(randomString[7]);
             $("#rev4").val("0");
             $("#rev5").val("1");

           var RFINumber = '';
           var valueArray = $('.rfi_number_box').map(function() {
               return this.value;
           }).get();
           for(var i = 0; i < valueArray.length; i++){
               RFINumber += valueArray[i];
           }
           $rfiNumber.val(RFINumber);
    },
    uiEventInitialization: function () {
        var self = this;
        $(document).on('click', 'a.itemAddButton', function () {
            self.addLineItemForChipset(true, self.options.chipsetItem);

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastItem();
        });

        $(document).on('click', 'a.itemRemoveButton', function () {
            $(this).parent().parent().remove();

            // Add plus Icon at the last row for add new item or delete new item
            self.addPlusIconForTheLastItem();

            // RE-INDEX the list items, user can remove an item from middle of the list, reindex will sync the index from 0-n.
            self.reIndexChipsetItems();

            //Updating total cost and total quantity on remove of chipset line item
            // self.updateTotalCost();
            // self.updateTotalQuantity();
        });

        // $(document).on('keyup', '.chip-set-cost', function () {
        //     self.updateTotalCost();
        // });
        //
        // $(document).on('keyup', '.chip-set-qty', function () {
        //     self.updateTotalQuantity();
        // });

    },

    reIndexChipsetItems: function(){
        var self = this;
        var index = 0;
        var name = '';

        self.el.chipsetLineItemDiv.find('div.form-group').each(function(){
            name = 'chipsetItemList[' + index + ']';
            $(this).find('div').find('input.chipsetId').attr("name", name + ".id");
            $(this).find('div').find('select.chip-set').attr("name", name + ".chipsetNumber");
            $(this).find('div').find('input.chip-set-qty').attr("name", name + ".qty");
            $(this).find('div').find('input.chip-set-cost').attr("name", name + ".cost");

            index++;
        });
    },
    getChipsetSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="chipsetItemList[' + index + '].chipsetNumber" class="custom-select chip-set" placeholder="Chip Set">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.chipsetList, function (index, item) {
            if (selectedValue == item.chipsetNumber) {
                html += '<option value="' + item.chipsetNumber + '" selected>' + item.chipsetNumber + '</option>';
            } else {
                html += '<option value="' + item.chipsetNumber + '">' + item.chipsetNumber + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    getUserSelectBoxHtml: function (index, selectedValue) {
        var self = this;
        var html = '<select name="userItemList[' + index + '].username" class="selectpicker" multiple="multiple" placeholder="User">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.userList, function (index, item) {
       // console.log(selectedValue)
            if (selectedValue == item.username) {
                html += '<option value="' + item.username + '" selected>' + item.username+ '</option>';
            }
            else if (selectedValue !== item.username && selectedValue.includes(',')) {
                html += '<option value="' + item.username + '" selected>' + item.username+ '</option>';
            }
             else {
                html += '<option value="' + item.username + '">' + item.username + '</option>';
            }
        });

        html += '</select>';
        return html;
    },
    addLineItemForUser: function (userItem) {
        var self = this;
        var index = self.el.userItemDiv.find('div.form-group').length;

        var $rowToAppend = '<input type="text" name="userItemList[' + index + '].id" class="userId" style="display: none;" value="' + userItem.id + '"/>'
            + self.getUserSelectBoxHtml(index, userItem.username);

        self.el.userItemDiv.append($rowToAppend);
       // self.el.userItemDiv.find('div.form-group:last').prev().find('div.itemAddremoveButtonDiv').html(self.el.removeButton);
    },

    addLineItemForChipset: function (isPlusIcon, chipsetItem) {
        var self = this;
        //dynamic row creation
        var index = self.el.chipsetLineItemDiv.find('div.form-group').length;

        var $rowToAppend = '<div class="form-group row">'
            + '<div class="col-md-3">'
            + '<input type="text" name="chipsetItemList[' + index + '].id" class="chipsetId" style="display: none;" value="' + chipsetItem.id + '"/>'
            + self.getChipsetSelectBoxHtml(index, chipsetItem.chipsetNumber)
            + '</div>'
            + '<div class="col-md-3">'
            + '<input type="text" name="chipsetItemList[' + index + '].qty" value="' + chipsetItem.qty + '" class="form-control chip-set-qty" placeholder="Quantity" />'
            + '</div>'
            + '<div class="col-md-2">'
            + '<input type="text" name="chipsetItemList[' + index + '].cost" value="' + chipsetItem.cost + '" class="form-control chip-set-cost" placeholder="Cost" />'
            + '</div>'
            + '<div class="col-md-1 itemAddremoveButtonDiv">';

        if (isPlusIcon) {
            $rowToAppend += self.el.addButton;
        } else {
            $rowToAppend += self.el.removeButton;
        }
        $rowToAppend += '</div>';
        $rowToAppend += '</div>';

        self.el.chipsetLineItemDiv.append($rowToAppend);
        self.el.chipsetLineItemDiv.find('div.form-group:last').prev().find('div.itemAddremoveButtonDiv').html(self.el.removeButton);
    },
    addPlusIconForTheLastItem: function () {
        var self = this;
        if(self.el.chipsetLineItemDiv.children().length == 1){
            self.el.chipsetLineItemDiv.find('div.form-group:last').find('div.itemAddremoveButtonDiv').html(self.el.addButton);
        }
        else{
            self.el.chipsetLineItemDiv.find('div.form-group:last').find('div.itemAddremoveButtonDiv').html(self.el.removeButton + self.el.addButton);
        }
    },
    updateTotalCost: function () {
        var self = this;
        var totalCost = 0;

        self.el.chipsetLineItemDiv.find('input.chip-set-cost').each(function () {
            totalCost += +$(this).val();
        });
        self.el.totalCost.val(totalCost);
    },
    updateTotalQuantity: function () {
        var self = this;
        var totalQty = 0;

        self.el.chipsetLineItemDiv.find('div.form-group').each(function () {
            totalQty += +$(this).find('input.chip-set-qty').val();
        });
        self.el.totalQuantity.val(totalQty);
    },
    disableForViewOnly: function(){
        var self = this;

        self.el.rfiForm.find('input[type!="hidden"]').attr("disabled", true);
        self.el.rfiForm.find('select').attr("disabled", true);
        self.el.rfiForm.find('textarea').attr("disabled", true);
        self.el.searchBoxReviewer.attr("disabled", true);
        self.el.rfiForm.find('a[type="button"]').not("#submitButton").hide();
        self.el.submitButton.parent().html(self.el.gobackButton);
        self.el.rfiForm.attr("href", "#");
    },
    destroy: function () {
    },
    generateRandomNumberString: function (length) {
        var add = 1, max = 12 - add;
        if ( length > max ) {
            return generate(max) + generate(length - max);
        }
        max = Math.pow(10, length+add);
        var min = max/10;
        var number = Math.floor( Math.random() * (max - min + 1) ) + min;
        return ("" + number).substring(add);
    },
    generateFileName: function (randomString, revisionVersion1, revisionVersion2) {
        $("#rand1").val(randomString[0]);
        $("#rand2").val(randomString[1]);
        $("#rand3").val(randomString[2]);
        $("#rand4").val(randomString[3]);
        $("#rand5").val(randomString[4]);
        $("#rand6").val(randomString[5]);
        $("#rand7").val(randomString[6]);
        $("#rand8").val(randomString[7]);

        $("#rev1").val("R");
        $("#rev2").val("E");
        $("#rev3").val("V");
        $("#rev4").val(revisionVersion1);
        $("#rev5").val(revisionVersion2);
    }
});
