$.widget("forecast.quotationReview", {
    options: {
        viewOnly: undefined,
        reviewCompleted: undefined,
        moduleName: undefined,
        messages: undefined,
        acceptRejectDivElement: undefined,
        quotationId: undefined,
        isReviewer: undefined
    },
    _create: function () {
        console.log("SMNLOG :: ---------- quotation review widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};

        self.el.acceptRejectDivElement = self.options.acceptRejectDivElement;
    },
    _init: function () {
        console.log("SMNLOG :: ---------- quotation review widget init ----------");
        var options = this.options;
        var self = this;

        self.uiEventInitialization();
        if (self.options.isReviewer && self.options.viewOnly && !self.options.reviewCompleted) {
            self.makeAcceptRejectButton();
        }
    },
    uiEventInitialization: function () {
        var self = this;

        self.el.acceptRejectDivElement.on('click', 'button.reviewer-accept-reject-button', function () {
            var accept = $(this).attr("accept");
            self.processReviewAction(accept);
        })
    },
    makeAcceptRejectButton: function () {
        var self = this;
        var html = '';

        html += '<button type="button" class="btn reviewer-accept-reject-button btn-primary mr-2" accept="true" ><i class="fa fa-check"></i> ' + self.options.messages.accept + '</button>';
        html += '<button type="button" class="btn reviewer-accept-reject-button btn-danger mr-2" accept="false"  ><i class="fa fa-ban"></i> ' + self.options.messages.reject + '</button>';

        self.el.acceptRejectDivElement.html(html);
    },
    processReviewAction: function (accept) {
        var self = this;
        var html='<form id="reviewForm">'
            +'<div class="row px-0 pt-3">'
            +'<label class="col-md-2 pl-1">Comment</label>'
            +'<div class="col-md-10">'
            +'<textarea class="form-control" name="reviewComment" id="reviewComment"></textarea>'
            +'</div>'
            +'</div>'
            +'</form>';
        bootbox.confirm({
            message: '<b>'+(accept == "true" ? self.options.messages.acceptConfirm.replace("*", "Accept") : self.options.messages.acceptConfirm.replace("*", "Reject"))+'</b>'+html,
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
                var isReviewFormValid = $('form#reviewForm').valid();
                if (result && !isReviewFormValid){ return false; }
                if (result && isReviewFormValid) {
                    var comment = $(document).find('div.bootbox-body textarea#reviewComment').val();
                    var url = '/admin/submitQuotationReview?';
                    url += 'reviewComment=' + comment;
                    url += '&moduleName=' + self.options.moduleName;
                    url += '&moduleId=' + self.options.quotationId;
                    url += '&accept=' + accept;
                    $(location).attr('href', url);
                }
            }
        });
        self.initiateReviewFormValidation();

    },
    initiateReviewFormValidation: function(){
        var self=this;
        var validateJson = {
            rules: {
                reviewComment: {
                    required: true,
                    maxlength: 120,
                    alphanumeric: true
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

        $(document).find('form#reviewForm').validate(validateJson);
    },
    destroy: function () {
    }
});
