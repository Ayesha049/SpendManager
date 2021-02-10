$.widget("ui.graphRenderWidget", {
    options: {
        wizardDataList: undefined,
        organizationList: undefined,
        childToggleTime: 600, //in milliseconds
        uiElement: {},
        cursorPointerClassname: 'cursorPointer',
        permissions: {},
        nodeLabel: "name",
        graphRenderFailedCallbackFn: undefined,
        graphRenderSuccessCallbackFn: undefined,
        graphDeleteCallbackFn: undefined,
        nodeClickCallbackFn: undefined,
        maxNodeTextSize:30,
        rootNodeId:-99999
    },
    _create: function () {
        console.log("SMNLOG ::Creating......");
        var self = this;
        self.element = $(self.element[0]);
        self.data = [];
        self.threadMap = {};
    },
    _init: function () {
        var self = this;
        console.log("SMNLOG ::Init......"+self.options.threadId);

        console.log("SMNLOG ::"+JSON.stringify(self.options.wizardDataList));
        console.log("SMNLOG self.options.nodeLabel::"+JSON.stringify(self.options.nodeLabel));

        self.element = $(self.element[0]);
        self.threadNodeClassName = 'threadNode';
        self.expandSignClassName = 'expandSign';
        self.threadNode = $('<div>').addClass('threadNode');
        self.expandIconName = 'fa fa-angle-double-right';
        self.collapseIconName = 'fa fa-angle-double-left';
        self.plusIconName = 'fa fa-plus-circle';
        self.plusIcon = $(' <i>').addClass(self.expandIconName+ ' addModule').css({'color':'grey','font-size':'18px !important','position':'absolute','right':'1px','top':'0px'});
        self.minusIcon = '<i class="'+ self.collapseIconName +' expandSign minusSign" style="color: grey; font-size: 18px !important; position: absolute; right: 1px; top: 0px;"></i>';
        self.addNode = '<i class="'+ self.plusIconName +' addNode" style="color: grey; font-size: 18px !important; position: absolute; right: 1px; bottom: 0px;"></i>';
        self.deleteIcon = $('<img>').attr('src','/assets/img/delete-icon.png').addClass('cursorPointer').css({'height':'20px','position':'absolute','right':'5px','top':'5px'});
        self.threadViewWrapperDiv = $('<div>').addClass('threadViewWrapperDiv '+self.options.threadId).attr('data-threadid', self.options.threadId).css({
            'padding': '15px',
            // 'margin': '10px',
            'position': 'relative',
            // 'border':'2px dashed #dddddd',
            // 'border-left-width':'0',
            // 'border-right-width':'0',
            // 'border-bottom-width':'0',
            'min-height':'100px',
            'overflow-x':'auto'
        });
        self.element.css({
            'border': '1px solid #dddddd',
            'padding-top': '10px',
            'padding-left': '10px',
            'min-height': '100px'
        });


        if(self.element.find('div.'+self.options.threadId).length > 0){
            bootbox.alert('Duplicate graph.')
        }else{
            self.deleteIcon.bind("click", function(){
                console.log("SMNLOG :: Delete is Clicked....");
                var threadId = $(this).closest('div.threadViewWrapperDiv').attr('data-threadid');
                $(this).parent('div').parent('div').fadeOut('slow', function(){
                    $(this).remove();

                    if(typeof self.options.graphDeleteCallbackFn == 'function'){
                        self.options.graphDeleteCallbackFn(threadId);
                    }
                });
                self.data = [];
                self.threadMap = {};
                self.parentNode = undefined;
            });

            self.drawThreadGraph();
        }
    },
    _destroy: function () {
        var self = this;
        console.log("SMNLOG :: Destroying ......");
    },
    initiateTheGraphEvent: function () {
        var self = this;

        self.threadViewWrapperDiv.find('.node').on("click",function (e) {
            var that = $(e.target);
            var expandSignClicked = that.hasClass('expandSign');
            var addNodeClicked = that.hasClass('addNode');

            if(expandSignClicked){ // Expand or Collapse is clicked
                self.expandSignClickEvent(that);
            }else if(addNodeClicked) {
                self.addNodeModuleOpen(that);
            }else if (that.hasClass('attachmentIcon')){ // Click on attachment icon

            }else{ // Node is clicked
                self.nodeClickEvent(that);
            }
        });
    },
    nodeClickEvent:function(that){
        console.log("SMNLOG :: Node is clicked....");
        var self = this;
        var docId = that.attr('data-docid');
        var threadId = that.attr('data-threadId');
        var inclusive = that.attr('data-inclusive');
        var inclusiveReason = that.attr('data-inclusive-reason');

        console.log("SMNLOG inclusive::"+JSON.stringify(inclusive));
        console.log("SMNLOG inclusiveReason::"+JSON.stringify(inclusiveReason));

        if(docId != ''){
            $.get('/tar/emailThreading/getEmailDetails', {projectId: self.options.projectId, docId: docId}, function(document){
                console.log("SMNLOG document::"+JSON.stringify(document));
                if(document.error){
                    bootbox.alert(document.msg)
                }else{
                    self.options.nodeClickCallbackFn(document, threadId, inclusive, inclusiveReason);
                    self.element.find('.node').removeClass('selectedNode');
                    that.addClass('selectedNode');
                }
            }).always(function () {
            });
        }else{
            bootbox.alert('Document ID not found.')
        }
    },
    expandSignClickEvent: function(that){
        var self = this;
        var hasPlusSign = that.hasClass('plusSign');
        var tht = $(that.parent());

        if(hasPlusSign){
            that.removeClass(self.expandIconName).removeClass('plusSign')
                .addClass(self.collapseIconName).addClass('minusSign')
        }else{
            that.removeClass(self.collapseIconName).removeClass('minusSign')
                .addClass(self.expandIconName).addClass('plusSign')
        }

        if (tht.siblings()) {
            var next_branch = $(tht).nextAll(self.threadNode);
            next_branch.toggle(self.options.childToggleTime);
            $(tht).toggleClass("hasMore");
            if ($(tht).attr('id') == 'root') {
                if ($(tht).css("margin-top") == "25px") {
                    $(tht).css("margin-top", "-7px");
                } else {
                    $(tht).css("margin-top", "25px");
                }
            }
        }
    },
    addNodeModuleOpen: function (that) {
        var self = this;
        var tht = $(that.parent());
        var deptId = tht.attr('data-threadid');
        console.log(deptId);
        self.generateAddNodeFormHtml(deptId);
    },
    drawThreadGraph: function () {
        var self = this;
        self.fetchEmailsByThreadId();
    },
    fetchEmailsByThreadId: function () {
        var self = this;

        var testData = [{
            "id": 1,
            "parentId": null,
            "threadId": 1851,
            "name": "MBSTU"
        }, {
            "id": 2,
            "parentId": 1,
            "threadId": 1851,
            "name": "Child-MBSTU-01"
        }, {
            "id": 3,
            "parentId": 1,
            "threadId": 1851,
            "name": "Child-MBSTU-02"
        }, {
            "id": 4,
            "parentId": 2,
            "threadId": 1851,
            "name": "Child-MBSTU-03"
        }, {
            "id": 5,
            "parentId": 3,
            "threadId": 1851,
            "name": "Child-MBSTU-04"
        }];


        // Draw using static data for testing

		// self.data = self.options.wizardDataList;


		//Adding root node
        var rootNode = {
            id: self.options.rootNodeId,
            parentId:null,
            name:'ROOT'
        };
        self.data.push(rootNode);

        $.each(self.options.wizardDataList, function(index, item){

            if (!_.isUndefined(item.parentId) && (item.parentId == null || item.parentId == 0)) { //root node
                item.parentId = self.options.rootNodeId;
            }
            self.data.push(item);
        });

        self.processDataForGraph();
    },
    renderGraph: function (threadMap, parentNode) {
        var self = this;
        var html = self.threadViewWrapperDiv;

        if(_.isUndefined(parentNode)){
            html.append($('<div>')
                .css({'text-align':'center','font-size':'16px','font-weight':'600','color':'RED'})
                .html('Parent node not found. Data is not valid.')
                // .append(self.deleteIcon)data
            );
            self.element.append(html);
            // call success callbackFn
            if(typeof self.options.graphRenderFailedCallbackFn == 'function'){
                self.options.graphRenderFailedCallbackFn();
            }
        }else{
            html.append($('<div style="font-size: 16px !important">')
                .css({'text-align':'center','font-weight':'600'})
                .html('Graphical representation of Departments')
                // .append(self.deleteIcon)
            );

            var nodeName = 'Dept name not found';
            var threadId = parentNode['id'];
            var docId = parentNode['documentId'];

            if(!_.isUndefined(parentNode[self.options.nodeLabel]) && parentNode[self.options.nodeLabel] != ''){
                nodeName = parentNode[self.options.nodeLabel];
            }
            var rootNode = $('<span>').addClass('label node toggleable rootNode')
                .addClass(self.options.cursorPointerClassname)
                .attr('data-threadid', threadId)
                .attr('data-docid', docId)
                .html(self.wrapNodeText(nodeName));

            rootNode.append(self.minusIcon);

            if (!_.isUndefined(parentNode.attachmentsCount) && parentNode.attachmentsCount > 0) {
                rootNode = self.getAttachment(rootNode, parentNode.attachmentsCount);
            }

            if (!_.isUndefined(parentNode.inclusive) && +parentNode.inclusive == 1) {
                rootNode.addClass('inclusive').attr('data-inclusive', true).attr('data-inclusive-reason', parentNode.inclusiveReason);
            }

            html.append(rootNode);

            if (_.isArray(self.threadMap[parentNode.id])) { // Has childNode call self fn
                var isSole = false;
                if (self.threadMap[parentNode.id].length == 1) {// No sibling here
                    isSole = true;
                }

                html.append(self.addSubNodes(html, self.threadMap[parentNode.id], isSole));
            }
            self.element.append(html);
            self.initiateTheGraphEvent();

            // call success callbackFn
            if(typeof self.options.graphRenderSuccessCallbackFn == 'function'){
                self.options.graphRenderSuccessCallbackFn();
            }
        }

    },
    processDataForGraph: function () {
        var self = this;
        self.parentNode = undefined;

        $.each(self.data, function (index, item) {
            if (!_.isUndefined(item.parentId) && (item.parentId == null || item.parentId == 0)) { //root node
                self.parentNode = item;
                if (_.isUndefined(self.threadMap[item.id])) {
                    self.threadMap[item.id] = [];
                } else {
                    if(+item.parentId != item.id){
                        // self.threadMap[item.id].push(item);
                    }
                }
            } else { //other node

                // if (_.isUndefined(self.threadMap[item.parentId])) {
                //     self.threadMap[item.parentId] = [item];
                // } else {
                //     self.threadMap[item.parentId].push(item);
                // }
                if (_.isUndefined(self.threadMap[item.parentId])) {
                    self.threadMap[item.parentId] = [item];
                } else {
                    if(+item.parentId != item.id){
                        self.threadMap[item.parentId].push(item);
                    }
                }
            }
        });

        self.renderGraph(self.threadMap, self.parentNode);
    },
    generateAddNodeFormHtml: function(deptId){
        var self = this;
        var html='<form id="departmentForm">'
            +'<div class="row px-0 pt-3">'
            +'<label class="col-md-3">Name</label>'
            +'<div class="col-md-6">'
            +'<input class="form-control" name="name" id="name" />'
            +'</div>'
            +'</div>'
            +'<div class="row px-0 pt-3">'
            +'<label class="col-md-3">Parent Department</label>'
            +'<div class="col-md-6">'
            +self.getSelectBox(self.options.wizardDataList,'',deptId,'parentId','parentId',true)
            +'</div>'
            +'</div>'
            +'<div class="row px-0 pt-3">'
            +'<label class="col-md-3">Organization</label>'
            +'<div class="col-md-6">'
            +self.getSelectBox(self.options.organizationList,'Select Organization','','organizationId','organizationId',false)
            +'</div>'
            +'</div>'
            +'</form>';
        bootbox.confirm({
            message: '<b>Create New Department:</b>'+html,
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
                if (result) {
                    var name = $(document).find('div.bootbox-body input#name').val();
                    var parentDeptId = $(document).find('div.bootbox-body select.parentId').val();
                    var selectedOrgId = $(document).find('div.bootbox-body select.organizationId').val();
                    Forecast.APP.startLoading();
                    $.post('/admin/costCenterDepartment',
                        {
                            name: name,
                            parentDepartment: parentDeptId,
                            costCenterOrganization: selectedOrgId
                        },
                        function (response) {
                            Forecast.APP.stopLoading();
                            location.reload(true);
                        }
                    );
                }

            }
        });

    },
    getSelectBox: function (list, title, selectedItem, name, cls, isdisable) {
        var self = this;
        var html = '';
        if(isdisable) {
            html+='<select name="'+name+'" class="form-control '+cls+'"'+'disabled'+'>';
        } else {
            html+='<select name="'+name+'" class="form-control '+cls+'">';
        }
        html += '<option value="">'+title+'</option>';
        $.each(list, function (index, item) {
            if (selectedItem == item.id) {
                html += '<option value="' + item.id + '" selected>' + item.name + '</option>';
            } else {
                html += '<option value="' + item.id + '">' + item.name + '</option>';
            }
        });
        html +='</select>';
        return html;
    },
    getAttachment: function (node, attachmentCount) {
        if (attachmentCount > 0) {
            // node.append($('<label>').addClass('attachmentIcon').attr('title', 'Total Attachments: ' + attachmentCount).html(attachmentCount)
            //     .css({
            //         'background-color': 'rgba(238, 0, 0, 0.57)',
            //         'color': 'white',
            //         'position': 'absolute',
            //         'min-height': '18px',
            //         'min-width': '23px',
            //         'border-radius': '50%',
            //         'padding': '2px',
            //         'font-size': '11px',
            //         'bottom': '0px',
            //         'line-height': '2',
            //         'margin-bottom': '-13px',
            //         'left':'-5px'
            //     }))
        }
        return node;

    },
    wrapNodeText: function(text){
        var self = this;

        if(!_.isUndefined(text)){
            if(text.length >= self.options.maxNodeTextSize){
                return text.substr(0, self.options.maxNodeTextSize)+"...";
            }
        }
        return text;
    },
    addSubNodes: function ($html, list, isSoleFromParentCall) {
        var self = this;
        var childNode = "";
        var isChildNodeAdded = false;

        childNode = $('<div>').addClass(self.threadNodeClassName);
        $.each(list, function (index, item) {

            var branchNode = $('<div>').addClass('entry').addClass((isSoleFromParentCall == true ? 'sole' : ''));

            var nodeName = 'Missing';
            var threadId = item['id'];
            var docId = item['documentId'];

            if(!_.isUndefined(item[self.options.nodeLabel]) && item[self.options.nodeLabel] != ''){
                nodeName = item[self.options.nodeLabel];
            }

            var span = $('<span>').addClass('label node').addClass(self.options.cursorPointerClassname)
                .attr('data-threadid', threadId)
                .attr('data-docid', docId)
                .html(self.wrapNodeText(nodeName));

            if (_.isArray(self.threadMap[item.id])) { // Has childNode call self fn
                var isSole = false;
                if (self.threadMap[item.id].length == 1) {// No sibling here
                    isSole = true;
                }
                span.addClass('toggleable');
                span.append(self.minusIcon);
                span.append(self.addNode);

                if (!_.isUndefined(item.attachmentsCount) && item.attachmentsCount > 0) { // Adding attachmentsCount
                    span = self.getAttachment(span, item.attachmentsCount);
                }

                if (!_.isUndefined(item.inclusive) && +item.inclusive == 1) {
                    span.addClass('inclusive').attr('data-inclusive', true).attr('data-inclusive-reason', item.inclusiveReason);
                }

                branchNode.append(span);
                branchNode.append(self.addSubNodes(branchNode, self.threadMap[item.id], isSole));
            } else {
                if (!_.isUndefined(item.attachmentsCount) && item.attachmentsCount > 0) { // Adding attachmentsCount
                    span = self.getAttachment(span, item.attachmentsCount);
                }
                if (!_.isUndefined(item.inclusive) && +item.inclusive == 1) {
                    span.addClass('inclusive').attr('data-inclusive', true).attr('data-inclusive-reason', item.inclusiveReason);
                }

                span.append(self.addNode);
                branchNode.append(span);
            }
            childNode.append(branchNode);
            isChildNodeAdded = true;
        });

        if (isChildNodeAdded) {
            $html.append(childNode);
        }
        return $html;
    }
});


