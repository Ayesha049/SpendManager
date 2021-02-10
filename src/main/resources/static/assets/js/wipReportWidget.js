$.widget("forecast.wipReport", {
    options: {
        uploadedJson: undefined,
        labelName: undefined
    },
    _create: function () {
        console.log("AFRILOG :: ---------- WIP Report widget create ----------");
        var self = this;
        self.el = {};

        self.el.wipTableDiv = $('#wipTableDiv');
        self.el.wipDate = $('#wipDate');
    },
    _init: function () {
        console.log("AFRILOG :: ---------- WIP Report init ----------");
        var self = this;
        self.uiEventInitialization();
    },
    uiEventInitialization: function(){
        var self = this;
        self.el.wipDate.datetimepicker({ useCurrent: false, format: Forecast.APP.GLOBAL_DATE_FORMAT_US }).on('dp.change', function (e) {
        Forecast.APP.startLoading();
            $.ajax({
                type: "GET",
                url: "/admin/wipReport",
                data: {
                   wipDate: e.date.toDate()
                },
                success: function (response) {
                     self.el.wipTableDiv.html("");
                     if(response[0] !== null){
                         self.constructWipReportTable(JSON.parse(response[0].uploadedJson));
                     } else {
                        bootbox.alert(Forecast.APP.wrapMessageToErrorLabel("No data available in selected date period"));
                     }
                },
            }).always(function(){
                 Forecast.APP.stopLoading();
            });
        });
    },
    constructWipReportTable: function(reportData){
        console.log("AFRILOG :: WIP Report table Generated .......");
        var cols = [];
        var self =  this;
        var $reportTableDiv = '<table id="wipReport" class="table table-responsive table-striped custom-table" width="100%" style="table-layout:fixed;overflow-x:auto;white-space:"nowrap" >';
                     + '<tbody>';
        var $columnRow ='<tr>';
        $.each(reportData, function (i, item){
            for(var prop in reportData[i]){
                  if (cols.indexOf(prop) === -1) {
                        cols.push(prop);
                  }
            }
          });
         $.each(cols, function (j, item){
               // setting the label value in column row
               $columnRow += '<th class="table-primary" style="text-align:center;"> ' + self.options.labelName[j] + '</th>'
         });
         $columnRow  = $columnRow  + '</tr>'
         $reportTableDiv += $columnRow;
        var itemValue;
        $.each(reportData, function (i, item){
             var $valueRow ='<tr>';
              $.each(cols, function (j, item){
                   if(reportData[i][cols[j]] || reportData[i][cols[j]] !== null ){
                        itemValue = reportData[i][cols[j]]
                   } else {
                        itemValue = "-";
                   }
                   $valueRow += '<td style="padding:10px;word-wrap:break-word;max-width:200px;overflow:hidden;text-align:center;">' + itemValue + '</td>'
              });
              $valueRow  = $valueRow  + '</tr>'
              $reportTableDiv += $valueRow;
           });
        $reportTableDiv += '</tbody>';
        $reportTableDiv += '</table>'
        self.el.wipTableDiv.append($reportTableDiv);
    },
    destroy: function () {
    }
});