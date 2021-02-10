$.widget("forecast.fabReceiveDetails", {
    options: {
        fabPOReceiveList: undefined,
        closePoBtn: undefined,
        fabPOTotalCompletedPercentage: undefined,
        fabPOId: undefined
    },
    _create: function () {
        console.log("AFRILOG :: ---------- fabPOReceive Details widget create ----------");
        var options = this.options;
        var self = this;
        self.el = {};
        self.el.closePoBtn = $("#close-po");
        self.data = {};
        self.el.fabPOReceiveListTable = $("#fabPOReceiveListTable");
     },
    _init: function () {
        console.log("AFRILOG :: ---------- fabPOReceive Details widget init ----------");
        var options = this.options;
        var self = this;

        self.createFabReceiveDetailDataTable();
        self.uiEventInitialization();
    },

    uiEventInitialization: function () {
        var self = this;

        if(self.options.fabPOTotalCompletedPercentage === 100){
            $(document).find('#close-po').attr('disabled', false);
        } else {
            $(document).find('#close-po').attr('disabled', true);
        }


        self.el.closePoBtn.on('click', function(){
            bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("This PO has successfullty been closed."));


            $.ajax({
                type: "GET",
                url: "/admin/fabPOClosing?fabPOId="+self.options.fabPOId,
                success: function (response) {
                    console.log(response);
                },
                //async: false
            });
        });
    },

    createFabReceiveDetailDataTable: function (){
        var self =  this;
        console.log("AFRILOG:: Fab Receive Data table created.......");
        var getUrl = "/getFabPOReceiveDetails?poId="+self.options.fabPOId;

        Forecast.APP.globalDataTableInitialization(self.el.fabPOReceiveListTable, getUrl,
            Forecast.APP.getFabPOReceiveDetailsTableColumnDefinition(self.options.columnNames), [[1, "asc"]], null,
            function () {
                $('.dataTables_filter input')
                    .attr('title', self.options.columnNames.searchTooltip);
            }, [0]
        );
    },

    destroy: function () {
    }
});
