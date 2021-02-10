$.widget("forecast.shipVia", {
    options: {
        shipViaList: undefined,
        selectedShipVia: undefined,
        messages: undefined,
        widgetBaseElement: undefined,
        shipViaElement: undefined,
        shipViaAddElement: undefined
    },
    _create: function () {
        console.log("IMNLOG :: ---------- shipVia widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
    },
    _init: function () {
        console.log("IMNLOG :: ---------- shipVia widget init ----------");
        var options = this.options;
        var self = this;

        self.generateShipViaSelectBoxHtml(self.options.selectedShipVia);
        console.log(self.options.selectedShipVia)

        self.uiEventInitialization();
    },
    uiEventInitialization: function () {
        var self = this;
        self.options.shipViaAddElement.on('click', function(){
            var selectedShipVia = +self.options.shipViaElement.val();
            self.generateNewShipViaFormHtml(selectedShipVia);
        });
    },
    generateShipViaSelectBoxHtml: function(selectedShipVia){
        var self = this;
        var html = '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(self.options.shipViaList, function (index, item) {
            if (selectedShipVia == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.companyName + '(' + item.accountNumber + ')</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.companyName + '(' + item.accountNumber + ')</option>';
            }
        });

        self.options.shipViaElement.html(html);
    },
    generateNewShipViaFormHtml: function(selectedShipVia){
        var self = this;
        var html='<form id="shipViaForm">'
            +'<div class="row px-0 pt-3">'
            +'<label class="col-md-3">Company Name</label>'
            +'<div class="col-md-6">'
            +'<input class="form-control" name="companyName" id="companyName" />'
            +'</div>'
            +'</div>'
            +'<div class="row px-0 pt-3">'
            +'<label class="col-md-3">Account Number</label>'
            +'<div class="col-md-6">'
            +'<input class="form-control" name="accountNumber" id="accountNumber"/>'
            +'</div>'
            +'</div>'
            +'</form>';
        bootbox.confirm({
            message: '<b>Create New Ship Via:</b>'+html,
            buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-primary'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                var isShipViaFormValid = $('form#shipViaForm').valid();
                if (result && !isShipViaFormValid){ return false; }
                if (result && isShipViaFormValid) {
                    var companyName = $(document).find('div.bootbox-body input#companyName').val();
                    var accountNumber = $(document).find('div.bootbox-body input#accountNumber').val();
                    Forecast.APP.startLoading();
                    $.get('/admin/saveShipVia',
                        {
                            companyName: companyName,
                            accountNumber: accountNumber
                        },
                        function (response) {
                            if(response.status == "SUCCESS"){
                                console.log("IMNLOG:: ship via saved successfully. "+ JSON.stringify(response.data));
                                self.options.shipViaList.push(response.data);
                                self.generateShipViaSelectBoxHtml(selectedShipVia);
                            }
                            Forecast.APP.stopLoading();
                        }
                    );
                }
            }
        });
        self.initiateShipViaFormValidation();
    },
    initiateShipViaFormValidation: function(){
        var self=this;
        var validateJson = {
            rules: {
                companyName: {
                    required: true,
                    maxlength: 25,
                    alphanumeric: true,
                    isUnique: true
                },
                accountNumber: {
                    required: true,
                    maxlength: 25,
                    alphanumeric: true,
                    isUnique: true
                }
            },
            messages: {

            },
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            }
        };

        $.validator.addMethod("alphanumeric", function(value, element) {
            return /^[a-z0-9\-\s]+$/i.test(value);
        }, "Must contain only letters, numbers, or dashes.");

        $.validator.addMethod("isUnique", function(value, element) {
            var companyName = $(document).find('div.bootbox-body input#companyName').val();
            var accountNumber = $(document).find('div.bootbox-body input#accountNumber').val();
            var isInfoUnique = true;
            $.each(self.options.shipViaList, function (index, item){
                if(item.accountNumber == accountNumber && item.companyName == companyName) isInfoUnique = false;
            });
            return isInfoUnique;
        }, "This information already exists.");

        $(document).find('form#shipViaForm').validate(validateJson);
    },
    destroy: function () {
    }
});
