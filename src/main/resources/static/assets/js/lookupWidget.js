$.widget("forecast.lookupWidget", {
    options: {
        messages: undefined
    },
    _create: function () {
        console.log("SMNLOG :: ---------- reviewer widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        self.data.isAutoSelected = false;

        // UI element Initialization
        self.el.lookupItemDiv=$("#lookupItem");
        self.el.lookupDropDown=$("#lookupDropDown");
        self.el.submitButton=$("#submitButton");
        self.el.lookupForm=$("#lookup_form");
    },
    _init: function () {
        console.log("SMNLOG :: ---------- reviewer widget init ----------");
        var options = this.options;
        var self = this;

        self.uiEventInitialization();
        // if (self.options.viewOnly){self.disableForViewOnly();}

    },
    uiEventInitialization: function(){
        var self = this;

        self.el.lookupDropDown.on("change", function () {
            var lookupValue = $(this).val();
            if(lookupValue == 1){
                self.createSuggestionBox();
            }
        });
        self.el.submitButton.on("click", function (){
            if(!self.data.isAutoSelected){
                alert(self.options.messages.emptyReviewerAlert);
                return false;
            }
            else{
                self.el.lookupForm.trigger("submit");
            }

        });
    },

    createSuggestionBox: function() {
        var self = this;
        var html = '<div class="form-group row">'
                + '<label htmlFor="addReviewer" class="col-md-3 col-form-label">'
                + self.options.messages.reviewerAdd
                + '</label>'
                + '<div class="col-md-9">'
                + '<input id="reviewerId" name="value" style="display:none"/>'
                + '<input id="reviewerName" name="label" class="form-control"/>'
                + '</div>';
        self.el.lookupItemDiv.html(html);
        self.populateAutoCompleteForReviewer();
        self.el.submitButton.show();
    },

    populateAutoCompleteForReviewer: function(){
        var self = this;
        $.get('/admin/getAllReviewerForAutocomplete', {}, function(result){
            var list = [];
            $.each(result, function(index, item){
                list.push({
                    label: item.name,
                    value: item.id
                })
            });

            console.log("SMNLOG list::"+JSON.stringify(list));

            self.el.lookupItemDiv.find('#reviewerName').autocomplete({
                classes: {
                    "ui-autocomplete": "highlight"
                },
                source: function (request, response) {
                    var results = $.ui.autocomplete.filter(list, request.term);
                    response(results.slice(0, Forecast.APP.MAX_AUTOCOMPLETE_RESULT_SIZE));
                },
                select: function (event, ui) {
                    console.log("SMNLOG autocomplete selected value::"+JSON.stringify(ui.item));
                    event.preventDefault();
                    self.el.lookupItemDiv.find("#reviewerName").val(ui.item.label);
                    self.el.lookupItemDiv.find("#reviewerId").val(ui.item.value);
                    self.data.isAutoSelected = true;
                }
            });
        });
    },
    destroy: function () {
    }
});
