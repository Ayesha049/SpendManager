
$.widget("forecast.uraReport", {
    options: {
        monthList: undefined,
        yearList: undefined,
        quarterList: ['Q1','Q2','Q3','Q4'],
        messages: undefined
    },
    _create: function () {
        console.log("ASLOG :: ---------- uraReport widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};

        // UI element Initialization
        self.el.dynamicDiv = $("#dynamicDiv");

    },
    _init: function () {
        console.log("ASLOG :: ---------- uraReport widget init ----------");
        var options = this.options;
        var self = this;
        self.uiEventInitialization();
    },
    uiEventInitialization: function () {
        var self = this;

        $("input:checkbox").on('click', function() {
            var $box = $(this);
            if ($box.is(":checked")) {
                $(document).find('input:checkbox').not($(this)).each(function (){
                    $(this).prop("checked", false);
                });
                $box.prop("checked", true);
                if($box.val() === 'MONTHLY') {
                    self.el.dynamicDiv.html(self.getSelectBoxHtml(self.options.monthList,'month','month','Month') +
                        self.getSelectBoxHtml(self.options.yearList,'year','year','Year'));
                }
                if($box.val() === 'YEARLY') {
                    self.el.dynamicDiv.html(self.getSelectBoxHtml(self.options.yearList,'year','year','Year'));
                }
                if($box.val() === 'QUARTERLY') {
                    self.el.dynamicDiv.html(self.getSelectBoxHtml(self.options.quarterList,'quarter','quarter','Quarter') +
                        self.getSelectBoxHtml(self.options.yearList,'year','year','Year'));
                }
            } else {
                $box.prop("checked", false);
                self.el.dynamicDiv.empty();
            }
        });


    },
    getSelectBoxHtml: function (list,name,cls,title) {
        var self = this;
        var html = '<div class="row col-md-6">'
            +'<label class="col-md-3 col-form-label">'+title+'</label>'
            +'<div class="col-md-9">'
            + self.getSelectBox(list, '', name, cls)
            +'</div>'
            + '</div>';

        return html;
    },
    getSelectBox: function (list, selectedItem, name, cls) {
        var self = this;
        var html = '<select name="'+name+'" class="form-control '+cls+'">';
        html += '<option value="">' + self.options.messages.selectAny + '</option>';

        $.each(list, function (index, item) {
            if (selectedItem == item) {
                html += '<option value="' + item + '" selected>' + item + '</option>';
            } else {
                html += '<option value="' + item + '">' + item + '</option>';
            }
        });
        html +='</select>';
        return html;
    },
    destroy: function () {
    }
});
