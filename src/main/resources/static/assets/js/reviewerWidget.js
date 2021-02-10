$.widget("forecast.reviewerWidget", {
    options: {
        viewOnly: undefined,
        reviewer: undefined,
        reviewCompleted: undefined,
        bindNamePrefix: undefined,
        moduleName: undefined,
        messages: undefined,
        widgetBaseElement: undefined,
        submitForReviewButtonElement: undefined,
        acceptRejectDivElement: undefined,
        reviewerCommentElement: undefined,
        id: undefined,
        reviewerList: undefined,
        formToBind: undefined
    },
    _create: function () {
        console.log("SMNLOG :: ---------- reviewer widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};

        // UI element Initialization
        self.el.widgetBaseElement = self.options.widgetBaseElement;
        self.el.submitForReviewButtonElement = self.options.submitForReviewButtonElement;
        self.el.acceptRejectDivElement = self.options.acceptRejectDivElement;
        console.log("SMNLOG widgetBaseElement id::" + self.el.widgetBaseElement.attr('id'));
        console.log("SMNLOG reviewerList::" + JSON.stringify(self.options.reviewerList));
        console.log("SMNLOG bindNamePrefix::" + JSON.stringify(self.options.bindNamePrefix));
    },
    _init: function () {
        console.log("SMNLOG :: ---------- reviewer widget init ----------");
        var options = this.options;
        var self = this;

        self.makeInitialHtmlDiv();
        self.uiEventInitialization();
        if (self.options.viewOnly) {
            self.disableForViewOnly();
        }
        console.log("SMNLOG self.options.reviewer::"+JSON.stringify(self.options.reviewer));
        console.log("SMNLOG self.options.viewOnly::"+JSON.stringify(self.options.viewOnly));

        if (self.options.reviewer && self.options.viewOnly && self.options.reviewCompleted === 'false') {
            self.makeAcceptRejectButton();
        }
        if (self.options.id != '' && self.options.reviewCompleted != ''){
            self.generateReviewComments();
        }
    },
    uiEventInitialization: function () {
        var self = this;

        $(document).on('click', 'i.removeReviewer', function () {
            console.log("SMNLOG :: ---------- remove reviewer ----------");
            $(this).parent().parent().remove();

            self.reIndexReviewers();

            if (self.el.submitForReviewButtonElement) {
                self.el.submitForReviewButtonElement.hide();
            }
        });

        $(document).on('change', "body", function () {
            console.log("SMNLOG :: ---------- form changed ----------")
            self.el.submitForReviewButtonElement.hide();
        });

        self.el.submitForReviewButtonElement.on('click', function () {
            var reviewNumber = self.el.widgetBaseElement.find('table.reviewerTable > tbody > tr').length;
            if (reviewNumber > 0) {
                Forecast.APP.startLoading();
                var url = '/admin/submitForReview?';
                url += 'moduleName=' + self.options.moduleName;
                url += '&moduleId=' + self.options.id;
                $(location).attr('href', url);
            }
            else {
                alert(self.options.messages.reviewerNotSelectedMessage);
                return false;
            }
        });

        self.el.acceptRejectDivElement.on('click', 'button.reviewer-accept-reject-button', function () {
            var accept = $(this).attr("accept");
            self.processReviewAction(accept);
        })
    },
    reIndexReviewers: function () {
        var self = this;
        var index = 0;
        var bindNamePrefix = self.options.bindNamePrefix;
        var name = '';

        self.el.widgetBaseElement.find('table.reviewerTable > tbody > tr').each(function () {
            name = bindNamePrefix + '[' + index + ']';
            $(this).find('input.reviewer-id').attr("name", name + ".id");
            $(this).find('input.reviewer-user-id').attr("name", name + ".reviewer.id");
            $(this).find('span.reviewer-serial-number').html(index + 1);

            index++;
        });
    },
    makeInitialHtmlDiv: function () {
        var self = this;
        var html = '<div class="row card py-2 rounded" style="background-color: #F7F7F7;">'
            + '<div class="col-md-12 px-3 pb-3 pt-2">'
            + '<div class="row">'
            + '<div class="innerTableHeader">'
            + '<label style="margin-bottom: 0px;">' + self.options.messages.reviewerHeader + '</label>'
            + '</div>'
            + '</div>'
            + ' </div>'
            + '<div class="col-md-12 px-3 py-1">'
            + '<div class="row">'
            + '<div class="col-md-12 px-3">'
            + '<input type="text" class="form-control searchReviewer" id="searchReviewer" placeholder="Search"/>'
            + '</div>'
            + '<div class="col-md-12 px-3">'
            + self.populateExistingReviewer()
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';
        self.el.widgetBaseElement.html(html);
        self.populateAutoCompleteForReviewer();
    },
    populateExistingReviewer: function () {
        var self = this;
        var html = '<table class="reviewerTable">';
        html += '<tbody>';
        $.each(self.options.reviewerList, function (index, item) {
            html += self.generateReviewerTableRow(index, item);
        });

        html += '</tbody>';
        html += '</table>';
        return html;
    },
    generateReviewComments: function() {
        var self=this;
        var html='<div class="row card my-2 py-2 rounded" style="background-color: #F7F7F7;">';
        html+='<div class="col-md-12 px-3 pb-3 pt-2">'
            +'<div class="row">'
            +'<div class="innerTableHeader">'
            +'<label>'+ self.options.messages.commentsHeader + '</label>'
            +'</div>'
            +'</div>'
            +'<div class="row" id="reviewer-comment-row-div">';

        $.each(self.options.reviewerList, function (index, item) {
            if(item.isAccepted!=''){
                html += self.generateReviewerCommentCard(index, item);
            }
        });

        html+='</div>'
            +'</div>'
            +'</div>';

        self.options.reviewerCommentElement.html(html);
        // console.log(reviewerList);
    },
    generateReviewerCommentCard: function(index, item){
        var html='';

        html+='<div class="card col-md-12 mb-1">'
            +'<div class="card-header py-0 pr-0" >'
            +'<i class="fa fa-user-alt fa-1x px-2" style="color: darkblue" aria-hidden="true"></i>&nbsp;'
            +item.reviewerName;

        if(item.isAccepted == 'true'){
            html += '<i class="fa fa-check px-2" style="color: darkgreen" aria-hidden="true"></i>';
        }
        else if (item.isAccepted == 'false') {
            html += '<i class="fa fa-ban px-2" style="color: darkred" aria-hidden="true"></i>';
        }

        html +='</div>'
        +'<div class="card-body">'
        +'<blockquote class="blockquote mb-0" style="font-size:12px">'
        +'<p>'
        +item.comments
        +'</p>'
        +'</blockquote>'
        +'</div>'
        +'</div>';

        return html;
    },
    generateReviewerTableRow: function (index, item) {
        var self = this;
        var html = '';
        html += '<tr>';

        html += '<td>';
        html += '<input form="' + self.options.formToBind + '" class="reviewer-id" name="' + self.options.bindNamePrefix + '[' + index + '].id" value="' + item.id + '" style="display: none">';
        html += '<input form="' + self.options.formToBind + '" class="reviewer-user-id" name="' + self.options.bindNamePrefix + '[' + index + '].reviewer.id" value="' + item.reviewerId + '" style="display: none">';
        html += '<span class="reviewer-serial-number">' + (index + 1) + '</span>. ' + item.reviewerName;
        html += '</td>';

        html += '<td class="text-right">';
        if (item.isAccepted == 'true') {
            html += '<i class="fa fa-check px-2" style="color: darkgreen" aria-hidden="true"></i>';
        }
        else if (item.isAccepted == 'false') {
            html += '<i class="fa fa-ban px-2" style="color: darkred" aria-hidden="true"></i>';
        }
        else {
            html += '<i class="fa fa-question-circle px-2" style="color: dimgray" aria-hidden="true"></i><i class="fa fa-trash-alt removeReviewer" style="color: #c80d24" aria-hidden="true"></i>'
        }
        html += '</td>';

        html += '</tr>';

        return html;
    },
    populateAutoCompleteForReviewer: function () {
        var self = this;
        $.get('/admin/getAllReviewerForAutocomplete', {}, function (result) {
            var list = [];
            $.each(result, function (index, item) {
                list.push({
                    label: item.name,
                    value: item.id
                })
            });

            console.log("SMNLOG list::" + JSON.stringify(list));

            self.el.widgetBaseElement.find('.searchReviewer').autocomplete({
                classes: {
                    "ui-autocomplete": "highlight"
                },
                source: function (request, response) {
                    var results = $.ui.autocomplete.filter(list, request.term);
                    response(results.slice(0, Forecast.APP.MAX_AUTOCOMPLETE_RESULT_SIZE));
                },
                select: function (event, ui) {
                    console.log("SMNLOG autocomplete selected value::" + JSON.stringify(ui.item));
                    event.preventDefault();
                    var isUnique = true;
                    self.el.widgetBaseElement.find('input.reviewer-user-id').each(function () {
                        if ($(this).val() == ui.item.value) isUnique = false;
                    });
                    if (isUnique) {
                        var index = self.el.widgetBaseElement.find('table.reviewerTable > tbody > tr').length;
                        var item = {
                            id: '',
                            reviewerId: ui.item.value,
                            reviewerName: ui.item.label,
                            isAccepted: ''
                        };
                        var htmlToAppend = self.generateReviewerTableRow(index, item);
                        self.el.widgetBaseElement.find('table.reviewerTable > tbody').append(htmlToAppend);
                        self.el.widgetBaseElement.find('input#searchReviewer').val('');
                        if (self.el.submitForReviewButtonElement) {
                            self.el.submitForReviewButtonElement.hide();
                        }
                    }
                    else {
                        alert(self.options.messages.reviewerNotUniqueMessage);
                        self.el.widgetBaseElement.find('input#searchReviewer').val('');
                    }
                    return false;
                }
            });
        });
    },
    disableForViewOnly: function () {
        var self = this;
        self.el.widgetBaseElement.find('input#searchReviewer').hide();
        self.el.widgetBaseElement.find('i.removeReviewer').hide();
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
                +'<label class="col-md-3 pl-0">Comment</label>'
                +'<div class="col-md-9">'
                +'<textarea class="form-control" name="reviewComment" id="reviewComment"></textarea>'
                +'</div>'
                +'</div>'
                +'<div class="row px-0 pt-3">'
                +'<label class="col-md-3">Amount</label>'
                +'<div class="col-md-4">'
                +'<input class="form-control" name="reviewAmount" id="reviewAmount"/>'
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
                    var amount = +$(document).find('div.bootbox-body input#reviewAmount').val();
                    var url = '/admin/submitReview?';
                    url += 'reviewComment=' + comment;
                    url += '&reviewAmount=' + amount;
                    url += '&moduleName=' + self.options.moduleName;
                    url += '&moduleId=' + self.options.id;
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
            },
            reviewAmount: {
                required: true,
                digits: true
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
