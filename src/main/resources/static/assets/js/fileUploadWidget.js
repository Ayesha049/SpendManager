$.widget("forecast.fileUploadWidget", {
    options: {
        messages: undefined,
        module: '',
        moduleId: null,
        bindNamePrefix: undefined,
        fileObject:{
            id: null,
            fileName:'',
            fileType:'',
            fileSize:'',
            created:''
        },
        fileList: [],
        wrapperBorder: false,
        viewOnly: false,
        allowRemoveButton: true,
        allowNewAttachment: true,
        maxHeight: '250px', // max height for file list view table
        allowMultipleUpload: true // To upload multiple files
    },
    _create: function () {
        console.log("SMNLOG :: ---------- File upload widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        var css = {'margin':'10px'};

        if(self.options.wrapperBorder){
            css['border'] = '1px solid #dddddd';
            css['border-radius'] = '10px';
        }
        // UI element Initialization
        self.options.formElement.append('<div class="modal fade" id="fileModal" role="dialog">'
            + '<div class="modal-dialog file-modal-dialog">'
            + '<div class="modal-content">'
            + '<div class="modal-body">'
            + '<div id="fileUploadDiv">'
            + '</div>'
            + '<div class="modal-footer">'
            + '<button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>');

        self.el.widgetBaseElement = self.options.formElement.find('#fileUploadDiv');
        self.el.widgetBaseElement.css(css);

        console.log("SMNLOG MODULE::" + self.options.module);
    },
    _init: function () {
        console.log("SMNLOG :: ---------- File upload widget init ----------");
        var options = this.options;
        var self = this;

        // Populate existing files
        self.fetchExistingFilesAndRenderHtml();
        self.uiEventInitialization();
    },
    fetchExistingFilesAndRenderHtml: function () {
        var self = this;
        self.makeInitialHtmlDiv();
    },
    renderExistingFileList: function () {
        console.log("SMNLOG :: ---------- Populating existing files----------");
        var self = this;
        var html = '<table class="table table-striped fileListTable">';

        html += '<thead>';
        html += '<tr>';
        html += '<th>'+ self.options.messages.slNo +'</th>';
        html += '<th>'+ self.options.messages.fileName +'</th>';
        html += '<th>'+ self.options.messages.fileType +'</th>';
        html += '<th>'+ self.options.messages.fileUploaded +'</th>';
        html += '<th>'+ self.options.messages.fileSize +'</th>';
        html += '<th></th>';
        html += '</tr>';
        html += '</thead>';

        html += '<tbody>';
        $.each(self.options.fileList, function (index, file) {
            html += self.getFileListTableRow(index, file, false);
        });
        html += '</tbody>';

        html += '</table>';
        return html;
    },
    getFileListTableRow: function(index, file, isNew){
        var self = this;
        var name = self.options.bindNamePrefix + '[' + index + ']';
        var html = '';

        html += '<tr>';
        html += '<td>' + (index + 1)
            + '<input type="text" name="'+ name +'.id" class="id" style="display: none;" value="'+ (file.id > 0 ? file.id : '')+'">'
            + '<input type="text" name="'+ name +'.fileName" class="fileName" style="display: none;" value="'+ file.fileName +'">'
            + (isNew ? '' : '<input type="text" name="'+ name +'.filePath" class="filePath" style="display: none;" value="'+ file.filePath +'">')
            + (isNew ? '' : '<input type="text" name="'+ name +'.fileType" class="fileType" style="display: none;" value="'+ file.fileType +'">')
            + (isNew ? '' : '<input type="text" name="'+ name +'.fileSize" class="fileSize" style="display: none;" value="'+ file.fileSize +'">')
            + (isNew ? '' : '<input type="text" name="'+ name +'.created" class="created" style="display: none;" value="'+ file.created +'">')
            + '</td>';
        html += '<td>' +  (isNew ? '<input type="file" class="form-control attachments" name="'+ name +'.file"/>' : file.fileName )+ '</td>';
        html += '<td>' + Forecast.APP.getFileIconByExtension(file.fileType) + '</td>';
        html += '<td>' + (file.created != '' ? Forecast.APP.convertDate(file.created) : '')+ '</td>';
        html += '<td>' + file.fileSize + '</td>';
        html += '<td>';
        if(!isNew){
            html += '<a target="_blank" href="'+  file.filePath +'"><i style="color: #48c599;" class="fa fa-download fa-1g downloadFile" title="Download file"></i></a>&nbsp;';
            if(self.options.allowRemoveButton && !self.options.viewOnly){
                html += '<i style="color: #da0000;" class="fa fa-minus-circle fa-1g removeFile" title="Remove file"></i>';
            }
        }
        html += '</td>';
        html += '</tr>';
        return html;
    },
    makeInitialHtmlDiv: function () {
        var self = this;
        var html ='<div class="innerTableHeaderFile">'
            +'<label class="">Attachments</label>'
            + '</div>'
            + '<div class="row col-md-12" style="margin: 0px;">'
            + '<div class="tableWrapperDiv" style="width: 100%; max-height: '+self.options.maxHeight+'; overflow-y: auto; text-align: center; padding-top: 20px; padding-bottom: 5px;">'
            + (self.options.moduleId > 0 ? self.renderExistingFileList(): '<label style="font-weight: 600; color: #0000008c">No Attachments Found</label>')
            + '</div>';

        console.log("SMNLOG self.options.viewOnly::"+JSON.stringify(self.options.viewOnly));

        if(self.options.allowNewAttachment && !self.options.viewOnly){
            html += '<div class="col-md-12 lineItemWrapper">'
                + '<div class="form-group row" style="margin-bottom: 0px;">'
                + '<div class="col-md-4"></div>'
                + '<div class="col-md-4" style="text-align: right; padding-right: 0px;">'
                + '<button type="submit" class="btn btn-block btn-primary fileUploadButton">'
                + '<i class="fa fa-plus-circle"></i> New Attachment'
                + '</button>'
                + '</div>'
                + '<div class="col-md-4"></div>'
                + '</div>';
        }

        html += '</div>'
                + '</div>';
        console.log("SMNLOG ::"+JSON.stringify(html));
        self.el.widgetBaseElement.html(html);
    },
    reIndexFileList: function () {
        var self = this;
        var index = 0;
        var bindNamePrefix = self.options.bindNamePrefix;
        var name = '';

        self.el.widgetBaseElement.find('table.fileListTable > tbody > tr').each(function () {
            name = bindNamePrefix + '[' + index + ']';
            $(this).find('input.id').attr("name", name + ".id");
            $(this).find('input.fileName').attr("name", name + ".fileName");
            $(this).find('input.filePath').attr("name", name + ".filePath");
            $(this).find('input.fileType').attr("name", name + ".fileType");
            $(this).find('input.fileSize').attr("name", name + ".fileSize");
            $(this).find('input.attachments').attr("name", name + ".file");
            $(this).find('input.created').attr("name", name + ".created");
            index++;
        });
    },
    uiEventInitialization: function () {
        var self = this;

        self.options.attachmentBtn.click(function () {
            console.log("SMNLOG :: ----------attachment btn clicked----------");
            self.options.formElement.find("#fileModal").modal('show');
        });

        $(document).on('click', 'i.removeFile', function () {
            console.log("SMNLOG :: ---------- remove file ----------");
            $(this).closest('tr').remove();
            self.reIndexFileList();
        });

        $(document).on('change', '.attachments', function (e) {
            console.log("SMNLOG :: ---------- attachments file ----------");
            var size = $(this)[0].files[0].size;
            var name = $(this)[0].files[0].name;
            var extension = $(this).val().split('.').pop();
            var action = '<i style="color: #da0000;" class="fa fa-minus-circle fa-1g removeFile" title="Remove file"></i>';

            console.log("SMNLOG size::"+JSON.stringify(size));
            $(this).closest('tr').find('td').eq(0).find('input.fileName').val(name);
            $(this).closest('tr').find('td').eq(4).html(size);
            $(this).closest('tr').find('td').eq(3).html(Forecast.APP.convertDate(new Date()));
            $(this).closest('tr').find('td').eq(2).html(Forecast.APP.getFileIconByExtension(extension));
            $(this).closest('tr').find('td').eq(5).html(action);
        });

        $(document).on('click', 'button.fileUploadButton', function (e) {
            console.log("SMNLOG :: ---------- add file ----------");
            e.preventDefault();

            var index = self.el.widgetBaseElement.find('table.fileListTable > tbody > tr').length;

            if(index == 0){
                self.el.widgetBaseElement.find('div.tableWrapperDiv').html(self.renderExistingFileList());
            }

            var file = {
                fileName: '',
                fileType: '',
                fileSize: '',
                created: ''
            };
            self.el.widgetBaseElement.find('table.fileListTable > tbody').append(self.getFileListTableRow(index, file, true));
        });
    },
    destroy: function () {
    }
});
