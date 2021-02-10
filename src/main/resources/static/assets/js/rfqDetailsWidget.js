$.widget("forecast.rfqDetails", {
    options: {
        quotationCardItem: undefined,
        quotationCardItemSize: 0,
        rfqSupplierList: undefined,
        rfqType: undefined,
        categoryItemList: undefined,
        quotationItemList: undefined,
        messages: undefined,
        supplierWiseCategoryItem: undefined
    },
    _create: function () {
        console.log("AFRILOG :: ---------- rfq details widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.data = {};
        self.el.gobackButton = $("#gobackButton");
        // UI element Initialization
        self.el.supplierCardDynamicRowDiv = $('#supplierCardDynamicRowDiv');
        self.el.acceptedButton = $("#acceptedButton");

        if (self.options.quotationCardItem != 'undefined') {
            self.options.quotationCardItemSize = self.options.quotationCardItem.length;
        }

        self.el.button = '<a href="/admin/rfqList" type="button" class="btn btn-primary float-right" ><i class="fa fa-arrow-left"></i>&nbsp;' + self.options.messages.goBack + '</a>';

    },
    _init: function () {
        console.log("AFRILOG :: ---------- rfq details widget init ----------");
        var options = this.options;
        var self = this;

        self.uiEventInitialization();

        if (self.options.quotationCardItemSize > 0) {
            self.addLineItemForSupplier();
        }
        self.el.gobackButton.parent().html(self.el.button);

        console.log("SMNLOG self.options.supplierWiseCategoryItem::" + JSON.stringify(self.options.supplierWiseCategoryItem));
    },
    uiEventInitialization: function () {
        var self = this;

        self.el.supplierCardDynamicRowDiv.on("change", "input.quotationStatus", function () {
            var quotationId = $(this).closest("div.quotationCard").attr("data-quotation-id");
            var isChecked = $(this).is(":checked");

            $.ajax({
                type: "GET",
                url: "/admin/quotationStatusUpdate",
                data: {
                    rfqType: self.options.rfqType,
                    quotationId: quotationId,
                    isWinner: isChecked
                },
                success: function (response) {
                   $('div[data-quotation-id="'+quotationId+'"] .table tr:nth-child(2) td:eq(1)').html(response);
                },
            });
        });

        $(document).on('click', '.collapseExpandIcon', function () {
            $(this).toggleClass("fa-plus-circle fa-minus-circle")
        });
        // $(function(){ $('.quotationStatus').bootstrapToggle() });

    },

    addLineItemForSupplier: function () {
        var self = this;
        var index = self.el.supplierCardDynamicRowDiv.find('div.form-group').length;
        var acceptedDate, submissionDate;
        var quotationUrl = '';
        var $rowToAppend = '<div class="row" data-attr-index="' + index + '">';

        if (self.options.rfqType === 'FAB_CT') {
            quotationUrl = '/admin/fabQuotation?viewOnly=true&id=';
        } else if (self.options.rfqType === 'BUMP_CT') {
            quotationUrl = '/admin/bumpQuotation?viewOnly=true&id=';
        } else if (self.options.rfqType === 'ASSEMBLY') {
            quotationUrl = '/admin/assemblyQuotation?viewOnly=true&id=';
        } else if (self.options.rfqType === 'TEST_PO') {
            quotationUrl = '/admin/testQuotation?viewOnly=true&id=';
        }

        $.each(self.options.quotationCardItem, function (idx, supplierItem) {
            acceptedDate = supplierItem.acceptedDate ? moment(supplierItem.acceptedDate).format("DD/MM/YYYY") : 'N/A';
            submissionDate = supplierItem.submittedDate ? moment(supplierItem.submittedDate).format("DD/MM/YYYY") : 'N/A';
            quotationStatus = supplierItem.status;
            if (quotationStatus === 'ACCEPTED' || quotationStatus === 'WINNER' || quotationStatus === 'LOSER') {
                showWinLose = true;
            } else {
                showWinLose = false;
            }
            var $supplierItemRow = '<div class="col-md-4 quotationCard" data-quotation-id="' + supplierItem.id + '">'
                + '<div class="dash-widget dash-widget5">'
                + '<div class="dash-widget-info">'
                + '<div class="innerTableHeaderFile"><label class="">' + supplierItem.supplierName + '</label></div>'
                + '<table class="dashboard-widget-table table">'
                + '<tbody>'
                + '<tr>'
                + '<td>Supplier Name:</td>'
                + '<td>' + supplierItem.supplierName + '</td>'
                + '</tr>'
                + '<tr>'
                + '<td>Quotation Status:</td>'
                + '<td>' + supplierItem.status + '</td>'
                + '</tr>'
                + '<tr>'
                + '<td>Late Day Count:</td>'
                + '<td>' + supplierItem.lateSubmitDay + '</td>'
                + '</tr>'
                + '<tr>'
                + '<tr>'
                + '<td>Total Submission:</td>'
                + '<td>' + supplierItem.submissionCount + '</td>'
                + '</tr>'
                + '<tr>'
                + '<td>Submission Date:</td>'
                + '<td>' + submissionDate + '</td>'
                + '</tr>'
                + '<tr>'
                + '<td>Accepted Date:</td>'
                + '<td>' + acceptedDate + '</td>'
                + '</tr>';
            // $supplierItemRow += showWinLose == true ? self.addWinnerOrLoserRow(quotationStatus) : ''
            $supplierItemRow += self.addWinnerOrLoserRow(quotationStatus, showWinLose)
            $supplierItemRow += '</tbody>'
                + '</tbody>'
                + '</table>'
                + '</div>'
                + self.addCategoryItemList(supplierItem.supplierId)
                + self.addQuotationItemList(supplierItem.supplierId)
                + '<div class="col-md-12" style="margin-top: 10px;">'
                // + '<div class="col-md-8"></div>'
                + '<div style="text-align: center; padding: 0px 90px;">'
                + '<a class="btn btn-primary btn-block" href="'+quotationUrl+supplierItem.id+'">Details</a>'
                + '</div>'
                + '</div>'

                + '</div>'
                + '</div>';
            $rowToAppend = $rowToAppend + $supplierItemRow
        });
        $rowToAppend = $rowToAppend + '</div>';
        self.el.supplierCardDynamicRowDiv.append($rowToAppend);
    },
    addWinnerOrLoserRow: function (status, showWinLose) {
        var self = this;
        var html = '';
        html += '<tr>';

        if (showWinLose) {
            html += '<td>Winner/Loser:</td>';
            html += '<td>';
            html += '<label class="switch">';
            html += '<input id = "quotationStatus" class = "quotationStatus" type="checkbox" ';
            html += status == "WINNER" ? 'checked >' : '> ';
            html += '<span class="slider round"></span>';
        }else{
            html += '<td></td>';
            html += '<td>';
            html += '<label class="switch">';
            html += '';
        }

        html += '</label>';
        html += '</tr>';
        return html;
    },
    addCategoryItemList: function (supplierId) {
        var self = this;
        var html = '<div class="catItemWrapperDiv" style="border: 1px solid #dddddd; padding: 5px;">';

        if (typeof self.options.supplierWiseCategoryItem[supplierId] != 'undefined') {

            html += '<div>';
            html += '<label >Category Items:</label>';
            html += '<i class="fa fa-plus-circle collapseExpandIcon" style="margin-top:7px; position: absolute; right: 28px; cursor: pointer;" data-toggle="collapse" data-target="#catCollapse_' + supplierId + '"></i>';
            html += '</div>';
            html += '<div id="catCollapse_' + supplierId + '" class="collapse">';
            html += '<table class="table table-bordered quotationCatTable">';
            html += '<thead>';
            html += '<tr>';
            html += '<th>Category Name</th>';
            html += '<th>Amount</th>';
            html += '</tr>';
            html += '</thead>';

            html += '<tbody>';

            $.each(self.options.supplierWiseCategoryItem[supplierId], function (idx, categoryItem) {
                html += '<tr>';
                html += '<td>' + categoryItem.categoryName + '</td>';
                html += '<td>' + categoryItem.amount + '</td>';
                html += '</tr>';
            });
            html += '</tbody>';
            html += '</table>';
            html += '</div>';

        } else {
            html += '<div id="catCollapse_' + supplierId + '" class="collapse show">';
            html += '<div style="text-align: center; font-style: normal;font-weight: 600;background-color: #d3d3d340; padding: 4px;">Category item not found</div>';
            html += '</div>';
        }
        html += '</div>';
        return html;
    },
    addQuotationItemList: function (supplierId) {
        var self = this;
        var rfqType = self.options.rfqType;
        var productName, waferCost;

        var html = '<div class="quoteItemWrapperDiv" style="border: 1px solid #dddddd; padding: 5px; margin-top: 5px;">';

        if (typeof self.options.supplierWiseQuotationItem[supplierId] != 'undefined') {

            html += '<div>';
            html += '<label >Quotation Items:</label>';
            html += '<i class="fa fa-plus-circle collapseExpandIcon" style="margin-top:7px; position: absolute; right: 28px; cursor: pointer;" data-toggle="collapse" data-target="#quoteCollapse_' + supplierId + '"></i>';
            html += '</div>';
            html += '<div id="quoteCollapse_' + supplierId + '" class="collapse">';
            html += '<table class="table table-bordered quotationCatTable">';
            html += '<thead>';
            html += '<tr>';
            html += '<th>Product Name</th>';
            html += '<th>Wafer Price</th>';
            html += '</tr>';
            html += '</thead>';

            html += '<tbody>';

            $.each(self.options.supplierWiseQuotationItem[supplierId], function (idx, quotationItem) {
                if (rfqType === 'ASSEMBLY') {
                    productName = quotationItem.device;
                    waferCost = quotationItem.price;
                } else if (rfqType === 'FAB_CT') {
                    productName = quotationItem.fabReticalNumber;
                    waferCost = quotationItem.waferCost;
                } else if (rfqType === 'TEST_PO') {
                    productName = quotationItem.device;
                    waferCost = quotationItem.testCostPerUnit;
                } else if (rfqType === 'BUMP_CT') {
                    productName = quotationItem.bumpMaskNumber;
                    waferCost = quotationItem.price;
                }
                html += '<tr>';
                html += '<td>' + productName + '</td>';
                html += '<td>' + waferCost + '</td>';
                html += '</tr>';
            });
            html += '</tbody>';
            html += '</table>';
            html += '</div>';

        } else {
            html += '<div id="catCollapse_' + supplierId + '" class="collapse show">';
            html += '<div style="text-align: center; font-style: normal;font-weight: 600;background-color: #d3d3d340; padding: 4px;">Quotation item not found</div>';
            html += '</div>';
        }
        html += '</div>';
        return html;
    },

    destroy: function () {
    }
});
