/**
 * Created by habib on 4/9/20.
 */

Forecast = window.Forecast || {}

Forecast.APP = {
    PAGE_SIZE: 10,
    ROW_DISPLAY_GLOBAL:5,
    GLOBAL_DATE_FORMAT: 'MMM dd, yyyy hh:mm tt',
    GLOBAL_DATE_FORMAT_FOR_JAVA: 'dd/MM/yyyy',
    GLOBAL_DATE_FORMAT_US: 'MM/DD/YYYY',
    EMAIL_REPORT_DATE_FORMAT: 'MMMM dd yyyy',
    MAX_AUTOCOMPLETE_RESULT_SIZE: 10,
    DEFAULT_CURRENCY_FORMAT_LOCAL: 'en-IN',
    CSV_DOWNLOAD_ENABLED: true,
    MAX_FRACTION_DIGITS: 2,
    DATERANGE_PICKER_FROM_YEAR:1901,
    DATERANGE_PICKER_TO_YEAR:2100,
    init: function (opts) {
        this.contextRoot = opts.contextRoot;
    },
    _blockUI: function (msg, $cnt) {
        //var $el = $cnt ? $cnt : $('body', document);
        var $el = $('body', document);
        // $el.block({
        //     forceIframe: true,
        //     css: {border: '1px solid #222', padding: '8px 12px'},
        //     message: '<img src="' + '/images/spinner.gif" style="width:24px;height:24px;vertical-align:middle"/>' +
        //     '<span style="margin-left:1em;">' + (msg != undefined ? msg : 'Please wait...') + '</span>'
        // });
    },
    _unblockUI: function ($cnt) {
        var $el = $('body', document);
        //var $el = $cnt ? $cnt : $('body', document);
        // $el.unblock();
    },
    openSubMenu: function(menuClassName, submenuClassName){
        var selector = '#sidebar-menu';

        $.each(menuClassName, function(index, item){
            selector += ' ul li.'+item;
            $(selector).find('a:first').trigger('click');
        });
        $('#sidebar-menu ul li.'+submenuClassName).addClass('submenu-selected');
    },
    getServiceTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.serialNo, "mData": "serialNo", "bSortable": true},
            {"sTitle": columnNames.serviceName, "mData": "name", "bSortable": true},
            {
                "sTitle": columnNames.internalFlag, "mData": null, "bSortable": true, "render": function (data) {
                return data.isInternal ? '<i class="fas fa-check-square themeColor" title="Priority" aria-hidden="true"></i>' : '<i class="fas fa-square inactiveColor" title="Priority" aria-hidden="true"></i>';
            }
            },
            {
                "sTitle": columnNames.vendorFlag, "mData": null, "bSortable": true, "render": function (data) {
                return data.isVendor ? '<i class="fas fa-check-square themeColor" title="Priority" aria-hidden="true"></i>' : '<i class="fas fa-square inactiveColor" title="Priority" aria-hidden="true"></i>';
            }
            },
            {
                "sTitle": columnNames.finishedGoodFlag, "mData": null, "bSortable": true, "render": function (data) {
                return data.isFinishedGood ? '<i class="fas fa-check-square themeColor" title="Priority" aria-hidden="true"></i>' : '<i class="fas fa-square inactiveColor" title="Priority" aria-hidden="true"></i>';
            }
            }
            /*{
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                var actionHtml ='';
                actionHtml += '<a href="#"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                actionHtml += '<a href="/admin/service?serviceId='+ data.id +'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                actionHtml += '<a href="#"><i class="fas fa-ban actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                return actionHtml;
            }
            }*/
        ];
    },
    getWaferTypeTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.movandiName, "mData": "movandiName", "bSortable": true},
            {"sTitle": columnNames.vendorName, "mData": "vendorName", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/waferType?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" title="View" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/waferType?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getUserResourceAllocationColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.employeeName, "mData": "employeeName", "bSortable": true},
            {"sTitle": columnNames.month, "mData": "month", "bSortable": true},
            {"sTitle": columnNames.year, "mData": "year", "bSortable": true},
            {"sTitle": columnNames.ccDepartment, "mData": "ccDepartment", "bSortable": true},
            /*{"sTitle": columnNames.projects, "mData": "projects", "bSortable": true},*/
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                var actionHtml ='';
                actionHtml += '<a href="/admin/userResourceAllocation?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" title="View" aria-hidden="true"></i></a>';
                actionHtml += '<a href="/admin/userResourceAllocation?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                return actionHtml;
            }
            }
        ];
    },
    getUserResourceReportTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.employeeName, "mData": "employeeName", "bSortable": true},
            {"sTitle": columnNames.costCenterNumber, "mData": "costCenterNumber", "bSortable": true},
            {"sTitle": columnNames.department, "mData": "department", "bSortable": true},
            {
                "sTitle": columnNames.averageOperation, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.averageOperation).toFixed(2)
                }
            },
            {"sTitle": columnNames.operationProjects, "mData": "operationProjects", "bSortable": true},
            {
                "sTitle": columnNames.averageDevelopment, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.averageDevelopment).toFixed(2)
                }
            },
            {"sTitle": columnNames.developmentProjects, "mData": "developmentProjects", "bSortable": true},
        ];
    },
    getProductionPlanTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.name, "mData": "name", "bSortable": true},
            {"sTitle": columnNames.totalDays, "mData": "totalDays", "bSortable": true},
            {
                "sTitle": columnNames.totalWeeks, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalWeeks).toFixed(2)
                }
            },
            {"sTitle": columnNames.serviceNames, "mData": "serviceNames", "bSortable": true},
            {"sTitle": columnNames.serviceCodes, "mData": "serviceCodes", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/productionPlan?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" title="View" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/productionPlan?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    // actionHtml += '<a href="#"><i class="fas fa-ban actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getFabPOTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.PONumber, "mData": "PONumber", "bSortable": true},
            //{"sTitle": columnNames.type, "mData": "type", "bSortable": true},
            {
                "sTitle": columnNames.orderDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.orderDate);
                }
            },
            {
                "sTitle": columnNames.totalQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalQuantity).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.totalCost, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalCost).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.status, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='<span ';
                    if(data.isCompleted == true){
                        actionHtml += ' class="closed">';
                        actionHtml += 'CLOSED';
                    }
                    else if(data.isReleased == true){
                        actionHtml += ' class="release">';
                        actionHtml += 'RELEASE';
                    }
                    else{
                        actionHtml += ' class="not-release">';
                        actionHtml += 'NOT RELEASE';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/fabPO?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/fabPO/pdf?id='+data.id+'"><i class="fas fa-file-pdf actionIcon" title="Pdf"  aria-hidden="true"></i></a>';
                    if(data.reviewCompleted && data.isReleased){
                        actionHtml += '<a href="#"><i class="fas fa-sync actionIcon" title="Update" aria-hidden="true"></i></a>';
                        actionHtml += '<a href="/admin/fabReceiveDetails?id='+data.id+'"><i class="fas fa-info-circle fa-list" title="Receive Details" aria-hidden="true"></i></a>';
                    }
                    else if (data.reviewCompleted == null){ actionHtml += '<a href="/admin/fabPO?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>'; }
                    return actionHtml;
                }
            }
        ];
    },

    getFabReceiveTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.poName, "mData": "poName", "bSortable": true},
            {
                "sTitle": columnNames.receivedDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.receivedDate);
                }
            },
            {"sTitle": columnNames.itemName, "mData": "itemName", "bSortable": true},

            {
                "sTitle": columnNames.totalQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalQuantity).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.receivedQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.receivedQuantity).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/fabReceive?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },

    getFabWOTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.WONumber, "mData": "WONumber", "bSortable": true},
            {"sTitle": columnNames.lotTracker, "mData": "lotTracker", "bSortable": true},
            {
                "sTitle": columnNames.totalQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalQuantity).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.totalCost, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalCost).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.status, "mData": null, "bSortable": false, "render": function (data) {

                    var actionHtml ='<span ';
                    if(data.isReleased == true){
                        actionHtml += ' class="release">';
                        actionHtml += 'RELEASE';
                    }
                    else{
                        actionHtml += ' class="not-release">';
                        actionHtml += 'NOT RELEASE';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/fabWO?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    if(data.reviewCompleted && data.isReleased){ actionHtml += '<a href="#"><i class="fas fa-sync actionIcon" title="Update" aria-hidden="true"></i></a>'; }
                    else if (data.reviewCompleted == null){actionHtml += '<a href="/admin/fabWO?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>'; }
                    return actionHtml;
                }
            }
        ];
    },
    getBumpPOTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.PONumber, "mData": "PONumber", "bSortable": true},
            {"sTitle": columnNames.type, "mData": "type", "bSortable": true},
            {
                "sTitle": columnNames.orderDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.orderDate);
                }
            },
            {
                "sTitle": columnNames.totalQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalQuantity).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.totalCost, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalCost).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.status, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='<span ';
                    if(data.isReleased == true){
                        actionHtml += ' class="release">';
                        actionHtml += 'RELEASE';
                    }
                    else{
                        actionHtml += ' class="not-release">';
                        actionHtml += 'NOT RELEASE';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/bumpPO?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    if(data.reviewCompleted && data.isReleased){ actionHtml += '<a href="#"><i class="fas fa-sync actionIcon" title="Update" aria-hidden="true"></i></a>'; }
                    else if (data.reviewCompleted == null){ actionHtml += '<a href="/admin/bumpPO?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>'; }
                    return actionHtml;
                }
            }
        ];
    },
    getBumpWOTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.WONumber, "mData": "WONumber", "bSortable": true},
            {"sTitle": columnNames.lotTracker, "mData": "lotTracker", "bSortable": true},
            {
                "sTitle": columnNames.totalQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalQuantity).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.totalCost, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalCost).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.status, "mData": null, "bSortable": false, "render": function (data) {

                    var actionHtml ='<span ';
                    if(data.isReleased == true){
                        actionHtml += ' class="release">';
                        actionHtml += 'RELEASE';
                    }
                    else{
                        actionHtml += ' class="not-release">';
                        actionHtml += 'NOT RELEASE';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/bumpWO?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    if(data.reviewCompleted && data.isReleased){ actionHtml += '<a href="#"><i class="fas fa-sync actionIcon" title="Update" aria-hidden="true"></i></a>'; }
                    else if (data.reviewCompleted == null){actionHtml += '<a href="/admin/bumpWO?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>'; }
                    return actionHtml;
                }
            }
        ];
    },
    getProbePOTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.PONumber, "mData": "PONumber", "bSortable": true},
            {"sTitle": columnNames.type, "mData": "type", "bSortable": true},
            {
                "sTitle": columnNames.orderDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.orderDate);
                }
            },
            {"sTitle": columnNames.email, "mData": "vendorEmail", "bSortable": true},
            {"sTitle": columnNames.phone, "mData": "vendorPhone", "bSortable": true},
            {
                "sTitle": columnNames.totalQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalQuantity).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.totalCost, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalCost).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.status, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='<span ';
                    if(data.isReleased == true){
                        actionHtml += ' class="release">';
                        actionHtml += 'RELEASE';
                    }
                    else{
                        actionHtml += ' class="not-release">';
                        actionHtml += 'NOT RELEASE';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/probePO?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    if(data.reviewCompleted && data.isReleased){ actionHtml += '<a href="#"><i class="fas fa-sync actionIcon" title="Update" aria-hidden="true"></i></a>'; }
                    else if (data.reviewCompleted == null){ actionHtml += '<a href="/admin/probePO?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>'; }
                    return actionHtml;
                }
            }
        ];
    },
    getProbeWOTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.WONumber, "mData": "WONumber", "bSortable": true},
            {"sTitle": columnNames.lotTracker, "mData": "lotTracker", "bSortable": true},
            {
                "sTitle": columnNames.totalQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalQuantity).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.totalCost, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalCost).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.status, "mData": null, "bSortable": false, "render": function (data) {

                    var actionHtml ='<span ';
                    if(data.isReleased == true){
                        actionHtml += ' class="release">';
                        actionHtml += 'RELEASE';
                    }
                    else{
                        actionHtml += ' class="not-release">';
                        actionHtml += 'NOT RELEASE';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/probeWO?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    if(data.reviewCompleted && data.isReleased){ actionHtml += '<a href="#"><i class="fas fa-sync actionIcon" title="Update" aria-hidden="true"></i></a>'; }
                    else if (data.reviewCompleted == null){actionHtml += '<a href="/admin/probeWO?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>'; }
                    return actionHtml;
                }
            }
        ];
    },
    getAssemblyPOTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.PONumber, "mData": "PONumber", "bSortable": true},
            {"sTitle": columnNames.type, "mData": "type", "bSortable": true},
            {
                "sTitle": columnNames.orderDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.orderDate);
                }
            },
            {"sTitle": columnNames.email, "mData": "vendorEmail", "bSortable": true},
            {"sTitle": columnNames.phone, "mData": "vendorPhone", "bSortable": true},
            {
                "sTitle": columnNames.totalQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalQuantity).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.totalCost, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalCost).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.status, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='<span ';
                    if(data.isReleased == true){
                        actionHtml += ' class="release">';
                        actionHtml += 'RELEASE';
                    }
                    else{
                        actionHtml += ' class="not-release">';
                        actionHtml += 'NOT RELEASE';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/assemblyPO?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    if(data.reviewCompleted && data.isReleased){ actionHtml += '<a href="#"><i class="fas fa-sync actionIcon" title="Update" aria-hidden="true"></i></a>'; }
                    else if (data.reviewCompleted == null){ actionHtml += '<a href="/admin/assemblyPO?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>'; }
                    return actionHtml;
                }
            }
        ];
    },
    getAssemblyWOTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.WONumber, "mData": "WONumber", "bSortable": true},
            {"sTitle": columnNames.lotTracker, "mData": "lotTracker", "bSortable": true},
            {
                "sTitle": columnNames.totalQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalQuantity).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.totalCost, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalCost).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.status, "mData": null, "bSortable": false, "render": function (data) {

                    var actionHtml ='<span ';
                    if(data.isReleased == true){
                        actionHtml += ' class="release">';
                        actionHtml += 'RELEASE';
                    }
                    else{
                        actionHtml += ' class="not-release">';
                        actionHtml += 'NOT RELEASE';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/assemblyWO?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    if(data.reviewCompleted && data.isReleased){ actionHtml += '<a href="#"><i class="fas fa-sync actionIcon" title="Update" aria-hidden="true"></i></a>'; }
                    else if (data.reviewCompleted == null){actionHtml += '<a href="/admin/assemblyWO?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>'; }
                    return actionHtml;
                }
            }
        ];
    },
    getTestPOTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.PONumber, "mData": "PONumber", "bSortable": true},
            {"sTitle": columnNames.type, "mData": "type", "bSortable": true},
            {
                "sTitle": columnNames.orderDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.orderDate);
                }
            },
            {
                "sTitle": columnNames.totalQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalQuantity).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.totalCost, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalCost).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.status, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='<span ';
                    if(data.isReleased == true){
                        actionHtml += ' class="release">';
                        actionHtml += 'RELEASE';
                    }
                    else{
                        actionHtml += ' class="not-release">';
                        actionHtml += 'NOT RELEASE';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/testPO?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    if(data.reviewCompleted && data.isReleased){ actionHtml += '<a href="#"><i class="fas fa-sync actionIcon" title="Update" aria-hidden="true"></i></a>'; }
                    else if (data.reviewCompleted == null){ actionHtml += '<a href="/admin/testPO?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>'; }
                    return actionHtml;
                }
            }
        ];
    },
    getTestWOTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.WONumber, "mData": "WONumber", "bSortable": true},
            {"sTitle": columnNames.lotTracker, "mData": "lotTracker", "bSortable": true},
            {
                "sTitle": columnNames.totalQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalQuantity).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.totalCost, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.totalCost).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.status, "mData": null, "bSortable": false, "render": function (data) {

                    var actionHtml ='<span ';
                    if(data.isReleased == true){
                        actionHtml += ' class="release">';
                        actionHtml += 'RELEASE';
                    }
                    else{
                        actionHtml += ' class="not-release">';
                        actionHtml += 'NOT RELEASE';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/testWO?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    if(data.reviewCompleted && data.isReleased){ actionHtml += '<a href="#"><i class="fas fa-sync actionIcon" title="Update" aria-hidden="true"></i></a>'; }
                    else if (data.reviewCompleted == null){actionHtml += '<a href="/admin/testWO?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>'; }
                    return actionHtml;
                }
            }
        ];
    },
    getClientPOTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.PONumber, "mData": "PONumber", "bSortable": true},
            {"sTitle": columnNames.type, "mData": "type", "bSortable": true},
            {"sTitle": columnNames.email, "mData": "customerEmail", "bSortable": true},
            {"sTitle": columnNames.phone, "mData": "customerPhone", "bSortable": true},
            {
                "sTitle": columnNames.totalQuantity, "mData": null, "bSortable": true, "render": function (data) {
                return (+data.totalQuantity).toFixed(2)
            }
            },
            {
                "sTitle": columnNames.totalCost, "mData": null, "bSortable": true, "render": function (data) {
                return (+data.totalCost).toFixed(2)
            }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/clientPO?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" title="View" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/clientPO?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    // actionHtml += '<a href="#"><i class="fas fa-ban actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getAddressBookTypeTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.value, "mData": "value", "bSortable": true},
            {"sTitle": columnNames.label, "mData": "label", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/addressBookType?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" title="View" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/addressBookType?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    // actionHtml += '<a href="#"><i class="fas fa-ban actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getCostCenterDepartmentTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.name, "mData": "name", "bSortable": true},
            {"sTitle": columnNames.parentDepartment, "mData": "parentDepartmentName", "bSortable": true},
            {"sTitle": columnNames.organization, "mData": "costCenterOrganizationName", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/costCenterDepartment?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" title="View" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/costCenterDepartment?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    // actionHtml += '<a href="#"><i class="fas fa-ban actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getCostCenterOrganizationTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.name, "mData": "name", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/costCenterOrganization?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" title="View" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/costCenterOrganization?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    // actionHtml += '<a href="#"><i class="fas fa-ban actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getGLAccountCategoryTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.name, "mData": "name", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/gLAccountCategory?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" title="View" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/gLAccountCategory?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    // actionHtml += '<a href="#"><i class="fas fa-ban actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getGLAccountTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.gLAccountNumber, "mData": "gLAccountNumber", "bSortable": true},
            {"sTitle": columnNames.gLAccountCategory, "mData": "gLAccountCategory", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/gLAccount?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" title="View" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/gLAccount?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    // actionHtml += '<a href="#"><i class="fas fa-ban actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getContactBookTypeTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.value, "mData": "value", "bSortable": true},
            {"sTitle": columnNames.label, "mData": "label", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/contactBookType?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" title="View" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/contactBookType?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    // actionHtml += '<a href="#"><i class="fas fa-ban actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },

    getCostCenterProjectTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.name, "mData": "name", "bSortable": true},
            {"sTitle": columnNames.details, "mData": "details", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/costCenterProject?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/costCenterProject?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    // actionHtml += '<a href="#"><i class="fas fa-ban actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getRFITableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.RFINumber, "mData": "RFINumber", "bSortable": true},
            {"sTitle": columnNames.crd, "mData": "crd", "bSortable": true},
            {"sTitle": columnNames.status, "mData": "status", "bSortable": true},
            {"sTitle": columnNames.created, "mData": "last_modified", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/rfi?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" title="View" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/rfi?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/rfi?id='+data.id+'&revise=true'+'"><i class="fas fa-sync actionIcon" title="Revise" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/rfi?id='+data.id+'&clone=true'+'"><i class="fas fa-clone actionIcon" title="Clone" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="#"><i class="fas fa-ban actionIcon banIcon" title="Disable" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getVendorTableColumnDefinition: function(columnNames){

        return [
            {
                "sTitle": columnNames.companyName, "mData": null, "bSortable": true, "render": function(data){
                    return data.hasPriority ? data.companyName+'<i class="fas fa-check-circle themeColor" title="Priority" aria-hidden="true"></i>' : data.companyName;
                }
            },
            {"sTitle": columnNames.phone, "mData": "phoneNumber", "bSortable": true},
            {
                "sTitle": columnNames.faxNumber, "mData": null, "bSortable": true, "render": function (data) {
                    return data.faxNumber == "" ? 'N/A' : data.faxNumber;
                }
            },
            // {"sTitle": columnNames.faxNumber, "mData": "faxNumber", "bSortable": true},
            {"sTitle": columnNames.email, "mData": "email", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/vendor?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/vendor?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    // actionHtml += '<a href="#"><i class="fas fa-ban actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getOrganizationTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.name, "mData": "name", "bSortable": true},
            {"sTitle": columnNames.code, "mData": "code", "bSortable": true},
            {
                "sTitle": columnNames.parentOrganization, "mData": null, "bSortable": true, "render": function(data){
                    return data.parentOrganization != null ? data.parentOrganization : "";
                }
            },
            {
                "sTitle": columnNames.isCustomer, "mData": null, "bSortable": true, "render": function(data){
                    return data.isCustomer ? '<i class="fas fa-check-square themeColor" title="Customer" aria-hidden="true"></i>' : '<i class="fas fa-square inactiveColor" title="Customer" aria-hidden="true"></i>';
                }
            },
            {
                "sTitle": columnNames.isSupplier, "mData": null, "bSortable": true, "render": function(data){
                    return data.isSupplier ? '<i class="fas fa-check-square themeColor" title="Supplier" aria-hidden="true"></i>' : '<i class="fas fa-square inactiveColor" title="Supplier" aria-hidden="true"></i>';
                }
            },
            {
                "sTitle": columnNames.hasPriority, "mData": null, "bSortable": true, "render": function(data){
                    return data.hasPriority ? '<i class="fas fa-check-square themeColor" title="Priority" aria-hidden="true"></i>' : '<i class="fas fa-square inactiveColor" title="Priority" aria-hidden="true"></i>';
                }
            },
            {
                "sTitle": columnNames.faxNumber, "mData": null, "bSortable": true, "render": function (data) {
                    return data.faxNumber == "" ? 'N/A' : data.faxNumber;
                }
            },
            {"sTitle": columnNames.email, "mData": "email", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/organization?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/organization?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    // actionHtml += '<a href="#"><i class="fas fa-ban actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getAddressBookTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.organizationName, "mData": "organizationName", "bSortable": true},
            {"sTitle": columnNames.addressType, "mData": "addressType", "bSortable": false},
            {"sTitle": columnNames.addressName, "mData": "name", "bSortable": false},
            {"sTitle": columnNames.email, "mData": "email", "bSortable": false},
            {"sTitle": columnNames.phoneNumber, "mData": "phoneNumber", "bSortable": false},
            {"sTitle": columnNames.faxNumber, "mData": "faxNumber", "bSortable": false},
            {"sTitle": columnNames.address, "mData": "address", "bSortable": false},
            {
                "sTitle": columnNames.active, "mData": null, "bSortable": true, "render": function (data) {
                return data.active ? '<i class="fas fa-check-square themeColor" title="Priority" aria-hidden="true"></i>' : '<i class="fas fa-square inactiveColor" title="Priority" aria-hidden="true"></i>';
            }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                var actionHtml ='';
                actionHtml += '<a href="/admin/addressBook?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                actionHtml += '<a href="/admin/addressBook?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                actionHtml += '<a href="#"><i class="fas fa-trash actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                return actionHtml;
            }
            }
        ];
    },
    getContactBookTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.organizationName, "mData": "organizationName", "bSortable": true},
            {"sTitle": columnNames.contactType, "mData": "contactType", "bSortable": false},
            {"sTitle": columnNames.contactName, "mData": "personName", "bSortable": false},
            {"sTitle": columnNames.email, "mData": "email", "bSortable": false},
            {"sTitle": columnNames.phoneNumber, "mData": "phoneNumber", "bSortable": false},
            {"sTitle": columnNames.faxNumber, "mData": "faxNumber", "bSortable": false},
            {"sTitle": columnNames.address, "mData": "address", "bSortable": false},
            {
                "sTitle": columnNames.active, "mData": null, "bSortable": true, "render": function (data) {
                return data.active ? '<i class="fas fa-check-square themeColor" title="Priority" aria-hidden="true"></i>' : '<i class="fas fa-square inactiveColor" title="Priority" aria-hidden="true"></i>';
            }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                var actionHtml ='';
                actionHtml += '<a href="/admin/contactBook?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                actionHtml += '<a href="/admin/contactBook?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                actionHtml += '<a href="#"><i class="fas fa-trash actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                return actionHtml;
            }
            }
        ];
    },
    getSupplierProductTableColumnDefinition: function(columnNames){

        return [
            {"sTitle": columnNames.productName, "mData": "productName", "bSortable": true},
            {"sTitle": columnNames.category, "mData": "category", "bSortable": true},
            {"sTitle": columnNames.type, "mData": "type", "bSortable": true},
            {
                "sTitle": columnNames.waferName, "mData": null, "bSortable": true, "render": function (data) {
                    return data.waferName == null ? 'N/A' : data.waferName;
                }
            },
            {
                "sTitle": columnNames.deviceNumber, "mData": null, "bSortable": true, "render": function (data) {
                    return data.deviceNumber == null ? 'N/A' : data.deviceNumber;
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/supplierProduct?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" title="View" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/supplierProduct?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getDemandRequestTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.DANumber, "mData": "DANumber", "bSortable": true},
            {
                "sTitle": columnNames.forecastDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.forecastDate);
                }
            },
            {
                "sTitle": columnNames.crd, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.crd);
                }
            },
            {
                "sTitle": columnNames.fromDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.fromDate);
                }
            },
            {
                "sTitle": columnNames.toDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.toDate);
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/demandRequest?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/demandRequest?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getDemandAssessmentTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.DANumber, "mData": "DANumber", "bSortable": true},
            {
                "sTitle": columnNames.forecastDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.forecastDate);
                }
            },
            {
                "sTitle": columnNames.crd, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.crd);
                }
            },
            {
                "sTitle": columnNames.fromDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.fromDate);
                }
            },
            {
                "sTitle": columnNames.toDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.toDate);
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/demandAssessment?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/demandAssessment?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getASPTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.ASPNumber, "mData": "ASPNumber", "bSortable": true},
            {
                "sTitle": columnNames.fromDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.fromDate);
                }
            },
            {
                "sTitle": columnNames.toDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.toDate);
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/ASP?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/ASP?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getSCTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.SCNumber, "mData": "SCNumber", "bSortable": true},
            {
                "sTitle": columnNames.fromDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.fromDate);
                }
            },
            {
                "sTitle": columnNames.toDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.toDate);
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/standardCost?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/standardCost?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getEmailTemplateTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.type, "mData": "type", "bSortable": true},
            {"sTitle": columnNames.subject, "mData": "subject", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/emailTemplate?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getParametersTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.name, "mData": "parameterName", "bSortable": true},
            {"sTitle": columnNames.preparedBy, "mData": "preparedBy", "bSortable": true},
            {
                "sTitle": columnNames.entryDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.entryDate);
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/parameter?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" title="View" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/parameter?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    globalDataTableInitialization: function (tableIdOrCss, url, columns, sortArr, pageLength, callBack, rowsGroup, csvBtnLabel){
        // rowsGroup = [0, 5]
        var self = this;
        var json = {
            "dom":'<"row" <"col-sm-12 col-md-6" l><"col-sm-12 col-md-6"f>><"row"<"col-md-12" t>><"row" <"col-sm-12 col-md-6" i><"col-sm-12 col-md-6"p>>',
            "responsive": true,
            "columnDefs": [
                {responsivePriority: 1, targets: -1},
                {responsivePriority: 2, targets: 0}
            ],
            "aLengthMenu": [[5, 10, 20, -1], [5, 10, 20, 'All']],
            "pageLength": pageLength || Forecast.APP.ROW_DISPLAY_GLOBAL,
            "iDisplayLength": Forecast.APP.ROW_DISPLAY_GLOBAL,
            // "dom": '<"top">rt<"bottom"ip><"clear">',
            "language": { search: "" },
            "sPaginationType": "simple_numbers", // you can also give here 'simple','simple_numbers','full','full_numbers'
            "oLanguage": {
                "sSearch": "Search:"
            },
            // "ajax": url,
            "ajax": $.fn.dataTable.pipeline( {
                url: url,
                pages: 6 // number of pages to cache
            }),
            "processing": true,
            "serverSide": true,
            "searching": true,
            "fnDrawCallback":function(){
                if(typeof callBack == 'function'){
                    callBack();
                }
            },
            "aoColumns": columns,
            "aaSorting": sortArr //[[ 0, "asc" ],[ 1, "desc" ]] // Sort by first column descending
        };
        if(typeof rowsGroup != 'undefined'){
            json['rowsGroup'] = rowsGroup;
        }

        if(Forecast.APP.CSV_DOWNLOAD_ENABLED){
            json['dom'] = '<"row" <"col-sm-12 col-md-6" l><"col-sm-12 col-md-5"f><"col-sm-12 col-md-1"B>><"row"<"col-md-12" t>><"row" <"col-sm-12 col-md-6" i><"col-sm-12 col-md-6"p>>';
            json["buttons"] = self.getCsvDownloadButton(csvBtnLabel, ['email']);
        }

        console.log("SMNLOG json::"+JSON.stringify(json));
        var table = $(tableIdOrCss).DataTable(json);
        return table;
    },
    checkOverlappingDate: function(fromDate,toDate,checkDate) {

        var d1 = fromDate.split("/");
        var d2 = toDate.split("/");
        var c = checkDate.split("/");

        //mm/dd/year format
        var from = new Date(d1[2], parseInt(d1[0])-1, 1);  // -1 because months are from 0 to 11
        var to   = new Date(d2[2], parseInt(d2[0]), 0);
        var check = new Date(c[2], parseInt(c[0])-1, c[1]);

        if(check < from || check > to) {
            return false;
        } else return true;
    },
    getCsvDownloadButton: function(csvBtnLabel, excludeColumnListFromUser){
        var excludeColumnList = ['id','actions'];

        if(typeof excludeColumnListFromUser != ''){
            excludeColumnList = excludeColumnList.concat(excludeColumnListFromUser)
        }

        console.log("SMNLOG excludeColumnList::"+JSON.stringify(excludeColumnList));
        return [{
            text: (typeof csvBtnLabel != 'undefined' ? csvBtnLabel : 'csv'),
            className: "btn btn-sm btn-block btn-bordered-secondary",
            init: function(api, node, config) {
                $(node).removeClass('dt-button');
                $(node).removeClass('btn-default');
                $(node).prepend('&nbsp;&nbsp;<i class="fa fa-download"><i>&nbsp;&nbsp;');
            },
            action: function (e, dt, node, config) {

                dt.ajax.reload();
                console.log('params:'+ JSON.stringify(dt.ajax.params()));
                console.log('Url: ------->'+dt.ajax.url());

                $.ajax({
                    "url": dt.ajax.url(),
                    "data": dt.ajax.params(),
                    "success": function(res, status, xhr) {
                        console.log("SMNLOG res::"+JSON.stringify(res));
                        var csvFinalData = [];
                        var csvAllData = [];
                        var csvColumnData = [];
                        var csvHeader = [];
                        var headerPushed = false;

                        $.each(res.aaData, function(index, item){
                            csvHeader = [];
                            csvColumnData = [];
                            $.each(item, function(prop, value){
                                if(prop != '' && !excludeColumnList.includes(prop)){
                                    csvHeader.push(prop);
                                    csvColumnData.push('"'+value+'"');
                                }
                            });

                            if(!headerPushed){
                                csvAllData.push(csvHeader);
                                headerPushed = true;
                            }
                            csvAllData.push(csvColumnData.join(','));
                        });
                        csvFinalData.push(csvAllData.join('\n'));

                        var csvData = new Blob([csvFinalData[0]], {type: 'text/csv;charset=utf-8;'});
                        var csvURL = window.URL.createObjectURL(csvData);
                        var tempLink = document.createElement('a');
                        tempLink.href = csvURL;
                        tempLink.setAttribute('download', 'data.csv');
                        tempLink.click();
                    }
                });
            }
        }];
    },
    addDynamicFieldValidationByClassNameSelector: function(className, validationObject){
        jQuery.validator.addClassRules(className, validationObject);
    },
    getFabWipInventoryTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            // {"sTitle": columnNames.serialNo, "mData": "serialNo", "bSortable": true},
            {"sTitle": columnNames.workOrder, "mData": "workOrderId", "bSortable": true},
            {"sTitle": columnNames.waferCode, "mData": "waferCode", "bSortable": true},
            {"sTitle": columnNames.quantity, "mData": "inProgressQuantity", "bSortable": true},
            {
                "sTitle": columnNames.startDate, "mData": null, "bSortable": true, "render": function (data) {
                return self.convertDate(data.execStartDate);
            }
            },
            {
                "sTitle": columnNames.endDate, "mData": null, "bSortable": true, "render": function (data) {
                return self.convertDate(data.estimatedCompleteDate);
            }
            },
            {
                "sTitle": columnNames.status, "mData": "execStatus", "bSortable": true, "render": function (data) {

                    var actionHtml ='<span ';
                    if(data == 'IN_PROGRESS'){
                        actionHtml += ' class="in-progress">';
                        actionHtml += 'IN PROGRESS';
                    }
                    else if(data == 'COMPLETED'){
                        actionHtml += ' class="completed">';
                        actionHtml += 'COMPLETED';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
             "sTitle": columnNames.action, "mData": "id", "bSortable": false, "render": function (data, type, row) {
                var actionHtml ='';
                     if(row.execStatus == 'IN_PROGRESS'){
                         actionHtml += '<a href="/admin/singleFabWipReconciliation?fabWoId='+ row.id +'" class="btn btn-sm btn-danger">Reconcile</a>';
                     }
                return actionHtml;
                }
             }
        ];
    },
    getBumpWipInventoryTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            // {"sTitle": columnNames.serialNo, "mData": "serialNo", "bSortable": true},
            {"sTitle": columnNames.workOrder, "mData": "workOrderId", "bSortable": true},
            {"sTitle": columnNames.waferCode, "mData": "waferCode", "bSortable": true},
            {"sTitle": columnNames.quantity, "mData": "inProgressQuantity", "bSortable": true},
            {
                "sTitle": columnNames.startDate, "mData": null, "bSortable": true, "render": function (data) {
                return self.convertDate(data.execStartDate);
            }
            },
            {
                "sTitle": columnNames.endDate, "mData": null, "bSortable": true, "render": function (data) {
                return self.convertDate(data.estimatedCompleteDate);
            }
            },
            {
                "sTitle": columnNames.status, "mData": "execStatus", "bSortable": true, "render": function (data) {

                    var actionHtml ='<span ';
                    if(data == 'IN_PROGRESS'){
                        actionHtml += ' class="in-progress">';
                        actionHtml += 'IN PROGRESS';
                    }
                    else if(data == 'COMPLETED'){
                        actionHtml += ' class="completed">';
                        actionHtml += 'COMPLETED';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
                "sTitle": columnNames.action, "mData": "id", "bSortable": false, "render": function (data, type, row) {
                var actionHtml ='';

                if(row.execStatus == 'IN_PROGRESS'){
                    actionHtml += '<a href="/admin/singleBumpWipReconciliation?bumpWoId='+ row.id +'" class="btn btn-sm btn-danger">Reconcile</a>';
                }
                return actionHtml;
            }
            }
        ];
    },
    getProbeWipInventoryTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            // {"sTitle": columnNames.serialNo, "mData": "serialNo", "bSortable": true},
            {"sTitle": columnNames.workOrder, "mData": "workOrderId", "bSortable": true},
            {"sTitle": columnNames.waferCode, "mData": "waferCode", "bSortable": true},
            {"sTitle": columnNames.quantity, "mData": "inProgressQuantity", "bSortable": true},
            {
                "sTitle": columnNames.startDate, "mData": null, "bSortable": true, "render": function (data) {
                return self.convertDate(data.execStartDate);
            }
            },
            {
                "sTitle": columnNames.endDate, "mData": null, "bSortable": true, "render": function (data) {
                return self.convertDate(data.estimatedCompleteDate);
            }
            },
            {
                "sTitle": columnNames.status, "mData": "execStatus", "bSortable": true, "render": function (data) {

                    var actionHtml ='<span ';
                    if(data == 'IN_PROGRESS'){
                        actionHtml += ' class="in-progress">';
                        actionHtml += 'IN PROGRESS';
                    }
                    else if(data == 'COMPLETED'){
                        actionHtml += ' class="completed">';
                        actionHtml += 'COMPLETED';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
                "sTitle": columnNames.action, "mData": "id", "bSortable": false, "render": function (data, type, row) {
                var actionHtml ='';

                if(row.execStatus == 'IN_PROGRESS'){
                    actionHtml += '<a href="/admin/singleProbeWipReconciliation?probeWoId='+ row.id +'" class="btn btn-sm btn-danger">Reconcile</a>';
                }
                return actionHtml;
            }
            }
        ];
    },
    getAssemblyWipInventoryTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            // {"sTitle": columnNames.serialNo, "mData": "serialNo", "bSortable": true},
            {"sTitle": columnNames.workOrder, "mData": "workOrderId", "bSortable": true},
            {"sTitle": columnNames.waferCode, "mData": "waferCode", "bSortable": true},
            {"sTitle": columnNames.deviceNumber, "mData": "deviceCode", "bSortable": true},
            {"sTitle": columnNames.quantity, "mData": "inProgressQuantity", "bSortable": true},
            {
                "sTitle": columnNames.startDate, "mData": null, "bSortable": true, "render": function (data) {
                return self.convertDate(data.execStartDate);
            }
            },
            {
                "sTitle": columnNames.endDate, "mData": null, "bSortable": true, "render": function (data) {
                return self.convertDate(data.estimatedCompleteDate);
            }
            },
            {
                "sTitle": columnNames.status, "mData": "execStatus", "bSortable": true, "render": function (data) {

                    var actionHtml ='<span ';
                    if(data == 'IN_PROGRESS'){
                        actionHtml += ' class="in-progress">';
                        actionHtml += 'IN PROGRESS';
                    }
                    else if(data == 'COMPLETED'){
                        actionHtml += ' class="completed">';
                        actionHtml += 'COMPLETED';
                    }
                    actionHtml += '</span>';

                    return actionHtml;
                }
            },
            {
                "sTitle": columnNames.action, "mData": "id", "bSortable": false, "render": function (data, type, row) {
                var actionHtml ='';

                if(row.execStatus == 'IN_PROGRESS'){
                    actionHtml += '<a href="/admin/singleAssemblyWipReconciliation?assemblyWoId='+ row.id +'" class="btn btn-sm btn-danger">Reconcile</a>';
                }
                return actionHtml;
            }
            }
        ];
    },
    getRfqTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            // {"sTitle": columnNames.serialNo, "mData": "serialNo", "bSortable": true},
            {"sTitle": columnNames.rfqNumber, "mData": "rfqNumber", "bSortable": true},
            {"sTitle": columnNames.revisionNumber, "mData": "revisionNumber", "bSortable": true},
            {"sTitle": columnNames.project, "mData": "project", "bSortable": true},
            {"sTitle": columnNames.totalSupplierCount, "mData": "totalSupplierCount", "bSortable": true},
            {
                "sTitle": columnNames.createdDate, "mData": null, "bSortable": true, "render": function (data) {
                return self.convertDate(data.created);
            }
            },
            {
                "sTitle": columnNames.dueDate, "mData": null, "bSortable": true, "render": function (data) {
                return self.convertDate(data.dueDate);
            }
            },
            {"sTitle": columnNames.preparedBy, "mData": "userFullName", "bSortable": true},
            {
                "sTitle": columnNames.status, "mData": null, "bSortable": false, "render": function (data) {
                var actionHtml ='<span ';
                if(data.isReleased == true){
                    actionHtml += ' class="release">';
                    actionHtml += 'RELEASE';
                }
                else{
                    actionHtml += ' class="not-release">';
                    actionHtml += 'NOT RELEASE';
                }
                actionHtml += '</span>';

                return actionHtml;
            }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                var actionHtml ='';
                actionHtml += '<a href="/admin/rfq?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                if(data.submittedForQuotation && data.isReleased){
                actionHtml += '<a href="#"><i class="fas fa-sync actionIcon" title="Update" aria-hidden="true"></i></a>';
                actionHtml += '<a href="/admin/rfqDetails?id='+data.id+'&type='+data.rfqType+'"><i class="fa fa-list actionIcon banIcon" title="Details" aria-hidden="true"></i></a>';
                }
                else if (data.submittedForQuotation == false){ actionHtml += '<a href="/admin/rfq?id='+data.id+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>'; }
                actionHtml += '<a href="#"><i class="fas fa-trash actionIcon banIcon" title="Delete" aria-hidden="true"></i></a>';
                return actionHtml;
            }
            }
        ];
    },
    getFabQuotationTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {
                "sTitle": columnNames.rfqNumber, "mData": "rfqNumber", "bSortable": true, "render": function (data, type, row) {
                    return '<a class="rfqDetails" href="#" data-rfqId="'+row.rfqId+'">'+row.rfqNumber+'</a>';
                }
            },
            {
                "sTitle": columnNames.createdDate, "mData": "rfqNumber", "bSortable": true, "render": function (data, type, row) {
                    return self.convertDate(row.createdDate);
                }
            },
            {
                "sTitle": columnNames.dueDate, "mData": "rfqNumber", "bSortable": true, "render": function (data, type, row) {
                    return self.convertDate(row.dueDate);
                }
            },
            {"sTitle": columnNames.supplierName, "mData": "supplierName", "bSortable": true},
            {"sTitle": columnNames.status, "mData": "status", "bSortable": true},
            {
                "sTitle": columnNames.lateSubmitDay, "mData": null, "bSortable": true, "render": function (data) {
                        return (data.lateSubmitDay > 0 ? data.lateSubmitDay+" Days": data.lateSubmitDay +' Day');
               }
            },{
                "sTitle": columnNames.openDate, "mData": null, "bSortable": true, "render": function (data) {
                    if(data.openDate != null){
                        return self.convertDate(data.openDate);
                    }else{
                        return "N/A";
                    }
                }
            },
            {
                "sTitle": columnNames.submittedDate, "mData": null, "bSortable": true, "render": function (data) {
                    if(data.submittedDate != null){
                        return self.convertDate(data.submittedDate);
                    }else{
                        return "N/A";
                    }
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='<a href="/admin/';
                    if(data.rfqType == 'FAB_CT'){
                        actionHtml += 'fabQuotation';
                    }else if(data.rfqType == 'BUMP_CT'){
                        actionHtml += 'bumpQuotation';
                    }else if(data.rfqType == 'ASSEMBLY'){
                        actionHtml += 'assemblyQuotation';
                    }else if(data.rfqType == 'TEST_PO'){
                        actionHtml += 'testQuotation';
                    }
                    actionHtml += '?id='+data.quotationId+'&viewOnly=true"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getBumpQuotationTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.rfqNumber, "mData": "rfqNumber", "bSortable": true},
            {
                "sTitle": columnNames.createdDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.createdDate);
                }
            },
            {
                "sTitle": columnNames.dueDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.dueDate);
                }
            },
            {"sTitle": columnNames.supplierName, "mData": "supplierName", "bSortable": true},
            {"sTitle": columnNames.status, "mData": "status", "bSortable": true},
            {
                "sTitle": columnNames.openDate, "mData": null, "bSortable": true, "render": function (data) {
                    if(data.openDate != null){
                        return self.convertDate(data.openDate);
                    }else{
                        return "N/A";
                    }
                }
            },
            {
                "sTitle": columnNames.submittedDate, "mData": null, "bSortable": true, "render": function (data) {
                    if(data.submittedDate != null){
                        return self.convertDate(data.submittedDate);
                    }else{
                        return "N/A";
                    }
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/bumpQuotation?id='+data.quotationId+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getAssemblyQuotationTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.rfqNumber, "mData": "rfqNumber", "bSortable": true},
            {
                "sTitle": columnNames.createdDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.createdDate);
                }
            },
            {
                "sTitle": columnNames.dueDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.dueDate);
                }
            },
            {"sTitle": columnNames.supplierName, "mData": "supplierName", "bSortable": true},
            {"sTitle": columnNames.status, "mData": "status", "bSortable": true},
            {
                "sTitle": columnNames.openDate, "mData": null, "bSortable": true, "render": function (data) {
                    if(data.openDate != null){
                        return self.convertDate(data.openDate);
                    }else{
                        return "N/A";
                    }
                }
            },
            {
                "sTitle": columnNames.submittedDate, "mData": null, "bSortable": true, "render": function (data) {
                    if(data.submittedDate != null){
                        return self.convertDate(data.submittedDate);
                    }else{
                        return "N/A";
                    }
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/assemblyQuotation?id='+data.quotationId+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getTestQuotationTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.rfqNumber, "mData": "rfqNumber", "bSortable": true},
            {
                "sTitle": columnNames.createdDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.createdDate);
                }
            },
            {
                "sTitle": columnNames.dueDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.dueDate);
                }
            },
            {"sTitle": columnNames.supplierName, "mData": "supplierName", "bSortable": true},
            {"sTitle": columnNames.status, "mData": "status", "bSortable": true},
            {
                "sTitle": columnNames.openDate, "mData": null, "bSortable": true, "render": function (data) {
                    if(data.openDate != null){
                        return self.convertDate(data.openDate);
                    }else{
                        return "N/A";
                    }
                }
            },
            {
                "sTitle": columnNames.submittedDate, "mData": null, "bSortable": true, "render": function (data) {
                    if(data.submittedDate != null){
                        return self.convertDate(data.submittedDate);
                    }else{
                        return "N/A";
                    }
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/testQuotation?id='+data.quotationId+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getShipViaTableColumnDefinition: function(columnNames){
        return [
            {"sTitle": columnNames.companyName, "mData": "companyName", "bSortable": true},
            {"sTitle": columnNames.companyShortName, "mData": "companyShortName", "bSortable": true},
            {"sTitle": columnNames.accountNumber, "mData": "accountNumber", "bSortable": true},
            {"sTitle": columnNames.name, "mData": "name", "bSortable": true},
            {"sTitle": columnNames.phoneNumber, "mData": "phoneNumber", "bSortable": true},
            {"sTitle": columnNames.email, "mData": "email", "bSortable": true},
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml = '';
                    actionHtml += '<a href="/admin/shipVia?id=' + data.id + '&viewOnly=true' + '"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/shipVia?id=' + data.id + '"><i class="fas fa-edit actionIcon" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getCostCenterTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.costCenterNumber, "mData": "costCenterNumber", "bSortable": true},
            {"sTitle": columnNames.department, "mData": "department", "bSortable": true},
            {
                "sTitle": columnNames.profitCenter, "mData": null, "bSortable": true, "render": function (data) {
                    if(data.profitCenter != null){
                        return data.profitCenter;
                    }else{
                        return "N/A";
                    }
                }
            },
            {
                "sTitle": columnNames.parentCostCenter, "mData": null, "bSortable": true, "render": function (data) {
                    if(data.parentCostCenter != null){
                        return data.parentCostCenter;
                    }else{
                        return "N/A";
                    }
                }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                    var actionHtml ='';
                    actionHtml += '<a href="/admin/costCenter?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                    actionHtml += '<a href="/admin/costCenter?id='+data.id+'"><i class="fas fa-edit actionIcon" aria-hidden="true"></i></a>';
                    return actionHtml;
                }
            }
        ];
    },
    getEmpCostCenterTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.name, "mData": "name", "bSortable": true},
            {"sTitle": columnNames.email, "mData": "email", "bSortable": true},
            {
                "sTitle": columnNames.costCenterNumber, "mData": null, "bSortable": true, "render": function (data) {
                if(data.costCenterNumber != null){
                    return data.costCenterNumber;
                }else{
                    return "N/A";
                }
            }
            },
            {
                "sTitle": columnNames.department, "mData": null, "bSortable": true, "render": function (data) {
                if(data.department != null){
                    return data.department;
                }else{
                    return "N/A";
                }
            }
            },
            {
                "sTitle": columnNames.profitCenter, "mData": null, "bSortable": true, "render": function (data) {
                if(data.profitCenter != null){
                    return data.profitCenter;
                }else{
                    return "N/A";
                }
            }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                var actionHtml ='';
                actionHtml += '<a href="/admin/tagEmpCostCenter?id='+data.id+''+'"><i class="fas fa-edit actionIcon" title="Edit" aria-hidden="true"></i></a>';
                return actionHtml;
            }
            }
        ];
    },
    getReviewProcessTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.name, "mData": "name", "bSortable": true},
            {"sTitle": columnNames.description, "mData": "description", "bSortable": true},
            // {"sTitle": columnNames.moduleName, "mData": "moduleName", "bSortable": true},
            {
                "sTitle": columnNames.created, "mData": null, "bSortable": true, "render": function (data) {
                return self.convertDate(data.created);
            }
            },
            {"sTitle": columnNames.createdBy, "mData": "createdBy", "bSortable": true},
            {
                "sTitle": columnNames.active, "mData": null, "bSortable": true, "render": function (data) {
                return data.isActive ? '<i class="fas fa-check-square themeColor" title="Active" aria-hidden="true"></i>' : '<i class="fas fa-square inactiveColor" title="Active" aria-hidden="true"></i>';
            }
            },
            {
                "sTitle": columnNames.action, "mData": null, "bSortable": false, "render": function (data) {
                var actionHtml ='';
                actionHtml += '<a href="/admin/reviewProcess?id='+data.id+'&viewOnly=true'+'"><i class="fas fa-eye actionIcon" aria-hidden="true"></i></a>';
                actionHtml += '<a href="/admin/reviewProcess?id='+data.id+''+'"><i class="fas fa-edit actionIcon" aria-hidden="true"></i></a>';
                return actionHtml;
            }
            }
        ];
    },
    getFabPOReceiveDetailsTableColumnDefinition: function(columnNames){
        var self = this;
        return [
            {"sTitle": columnNames.receiveNumber, "mData": "fabReceiveNumber", "bSortable": true},
            {"sTitle": columnNames.productName, "mData": "productName", "bSortable": true},
            {
                "sTitle": columnNames.receivedQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.receivedQuantity).toFixed(2)
                }
            },
            {
                "sTitle": columnNames.restQuantity, "mData": null, "bSortable": true, "render": function (data) {
                    return (+data.restQuantity).toFixed(2)
                }
            },
/*            {
                "sTitle": columnNames.workDonePercentage, "mData": null, "bSortable": true, "render": function (data) {
                    return '27%'
                }
            },*/
            {
                "sTitle": columnNames.receivedDate, "mData": null, "bSortable": true, "render": function (data) {
                    return self.convertDate(data.receivedDate);
                }
            },
            {"sTitle": columnNames.receivedBy, "mData": "receivedBy", "bSortable": true},
            {"sTitle": columnNames.fabLotNumber, "mData": "fabLotNumber", "bSortable": true}

        ];
    },
    wrapMessageToErrorLabel: function(message){
        return '<label style="color: #DB0000; font-weight: 600;">'+message+'</label>';
    },
    startLoading: function(){
        $(".overlay").show();
    },
    stopLoading: function(){
        $(".overlay").hide();
    },
    convertDate: function(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        return [pad(d.getMonth()+1), pad(d.getDate()), d.getFullYear()].join('/')
    },
    isDigits: function(number){
        return /^[0-9]+$/.test(number);
    },
    padDigits: function(input, numberOfDigits){
        return Array(Math.max(numberOfDigits - String(input).length + 1, 0)).join(0) + input;
    },
    nextSequenceNumber: function(currentSequenceNumber, next, skipArray){
        var parsedIntegerString = (parseInt(currentSequenceNumber, 36) + next).toString(36);
        $.each(skipArray, function (index, item) {
            parsedIntegerString = parsedIntegerString.replace(new RegExp(item, "g"), Forecast.APP.nextSequenceNumber(item, 1, []));
        });
        return parsedIntegerString.toUpperCase();
    },
    // currencyFormatted: function(number){
    //     return new Intl.NumberFormat(Forecast.APP.DEFAULT_CURRENCY_FORMAT_LOCAL, { maximumFractionDigits: Forecast.APP.MAX_FRACTION_DIGITS }).format(number)
    // },
    removeCurrencyFormat: function(currency){
        if(typeof currency == 'undefined') {
            currency = '0';
        }

        // var group = new Intl.NumberFormat(Forecast.APP.DEFAULT_CURRENCY_FORMAT_LOCAL).format(1111).replace(/1/g, '');
        // var decimal = new Intl.NumberFormat(Forecast.APP.DEFAULT_CURRENCY_FORMAT_LOCAL).format(1.1).replace(/1/g, '');
        // var reversedVal = number.replace(new RegExp('\\' + group, 'g'), '');
        // reversedVal = reversedVal.replace(new RegExp('\\' + decimal, 'g'), '.');
        // return Number.isNaN(reversedVal)? 0 : reversedVal;
        return Number(currency.toString().replace(/[^0-9\.-]+/g,""));
    },
    formatNumber: function(n) {
    // format number 1000000 to 1,234,567
        if(typeof n == 'undefined') return '0';
        return n.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    formatCurrency: function(input){
        var self = this;
        var input_val = input.val();
        input_val = self.currencyFormatted(input_val);
        input.val(input_val);
        input.attr('data-value', self.removeCurrencyFormat(input_val));
    },
    currencyFormatted: function(input_val){
        var self = this;
        if (typeof input_val == 'undefined' || input_val === "") { return; }

        input_val = input_val.toString();

        if (input_val.indexOf(".") >= 0) {
            var decimal_pos = input_val.indexOf(".");
            var left_side = input_val.substring(0, decimal_pos);
            var right_side = input_val.substring(decimal_pos);

            left_side = self.formatNumber(left_side);
            right_side = right_side.substring(0, 2);
            input_val = left_side + right_side;

        } else {
            input_val = self.formatNumber(input_val);
        }
        return input_val;
    },
    getFileIconByExtension: function(ext){
        console.log("SMNLOG ext::"+JSON.stringify(ext));
        var className = '';
        var colorCode = '';
        var colorBank = ['#00b33c','#e62e00','#2f77c3','#9999ff','#5c8a8a','#e68a00','#ad33ff','#70e312','#d65198'];
        switch(ext.toLowerCase()) {
            case 'jpg':
                className = 'fa-file-image';
                colorCode = colorBank[2];
                break;
            case 'png':
                className = 'fa-file-image';
                colorCode = colorBank[1];
                break;
            case 'gif':
                className = 'fa-file-image';
                colorCode = colorBank[5];
                break;
            case 'zip':
                className = 'fa-file-archive';
                colorCode = colorBank[4];
                break;
            case 'xls':
            case 'xlsx':
                className = 'fa-file-excel';
                colorCode = colorBank[0];
                break;
            case 'pdf':
                className = 'fa-file-pdf';
                colorCode = colorBank[1];
                break;
            case 'csv':
                className = 'fa-file-csv';
                colorCode = colorBank[7];
                break;
             case 'pptx':
                 className = 'fa-file-powerpoint';
                 colorCode = colorBank[8];
                 break;
             case 'docx':
                className = 'fa-file-word';
                colorCode = colorBank[8];
                break;
            default:
                className = 'unknown';
                colorCode = colorBank[6];
        }
        console.log("SMNLOG className::"+JSON.stringify(className));
        return  '<i class="fileListTableIcon fa '+className+'" style="color: '+ colorCode +'"></i>';
    },
    addAsteriskByRequiredFieldLabel: function($document){
        $.each($document.find("input"), function(index, element) {
            var rule =  $(element).rules() ;
               if(rule && rule.required){
                    $(element).closest(":has(label)").find('label').addClass('asterisk');
            }
        });
    },
    valueOf: function(val){
        return typeof val != 'undefined' ? val : ''
    }
};