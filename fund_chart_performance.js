function renderChartPerformance(seriesOptions, locale, contentSelector) {
  Highcharts.setOptions({
      lang:{
      rangeSelectorZoom:''
      }
  });

  $(contentSelector).highcharts('StockChart', {

      rangeSelector : {
          selected: 4,
          inputDateFormat: '%d-%m-%Y',
          buttons: [{
              type: 'month',
              count: 1,
              text: locale == 'vi' ? '1 tháng' : '1 month',
              id: 0
          }, {
              type: 'month',
              count: 3,
              text: locale == 'vi' ? '3 tháng' : '3 months',
              id: 1
          }, {
              type: 'month',
              count: 6,
              text: locale == 'vi' ? '6 tháng' : '6 months',
              id: 2
          }, {
              type: 'custom-ytd',
              text: 'YTD',
              id: 3
          }, {
              type: 'year',
              count: 1,
              text: locale == 'vi' ? '1 năm' : '1 year',
              id: 4
          }, {
              type: 'all',
              text: locale == 'vi' ? 'tất cả' : 'All',
              id: 5
          }],
          buttonTheme: {
              width: 50
          },
      },
      chart: {
          marginRight: 40
      },

      yAxis: {
          labels: {
              formatter: function () {
                  return (this.value > 0 ? ' + ' : '') + this.value + '%';
              },
              x: 35
          },
          plotLines: [{
              value: 0,
              width: 2,
              color: 'silver'
          }]
      },

      xAxis: {
          events: {
              afterSetExtremes: function(e) {
                  var NumOfChart = Highcharts.charts && Highcharts.charts.length ? Highcharts.charts.length : 0;
                  if (e.trigger == "rangeSelectorButton") {
                      var datetime = [];
                      var startdateYTD = 0;
                      if(e.rangeSelectorButton.text == "YTD") {
                          for(var i = 0; i < NumOfChart; i++ ) {
                              if( Highcharts.charts[i] ) {
                                      var endDate = Highcharts.charts[i].xAxis[0].dataMax;
                                      var date = new Date(endDate);
                                      var year = date.getFullYear() - 1;
                                      startdateYTD = Date.UTC(year, 11, 31, 0, 0, 0);
                              }
                          }
                      }
                      datetime.push(startdateYTD);
                      for(var i = 0; i < this.series.length; i++) {
                          if(this.series[i]) {
                              var data = this.series[i].data;
                              data.forEach(function(entry) {
                                  if(entry.change == 0) {
                                      return datetime.push(entry.x);
                                  }
                              });
                          }
                      }

                      var maxDateHaveValue = Math.max(...datetime);
                      setTimeout(function(){
                          for(var i = 0; i < NumOfChart; i++ ) {
                              if( Highcharts.charts[i] ) {
                                      var endDate = Highcharts.charts[i].xAxis[0].dataMax;
                                      Highcharts.charts[i].xAxis[0].setExtremes(maxDateHaveValue, endDate);
                                      Highcharts.charts[i].rangeSelector.clickButton(e.rangeSelectorButton.id, false);
                              }
                          }
                      }, 20);
                  }
                  else if(e.trigger) {
                      var datetime = [];
                      var startdateYTD = 0;

                      datetime.push(startdateYTD);
                      for(var i = 0; i < this.series.length; i++) {
                          if(this.series[i]) {
                              var data = this.series[i].data;
                              data.forEach(function(entry) {
                                  if(entry.change == 0) {
                                      return datetime.push(entry.x);
                                  }
                              });
                          }
                      }

                      var maxDateHaveValue = Math.max(...datetime);
                      setTimeout(function(){
                          for(var i = 0; i < NumOfChart; i++ ) {
                              if( Highcharts.charts[i] ) {
                                      var endDate = Highcharts.charts[i].xAxis[0].dataMax;
                                      Highcharts.charts[i].xAxis[0].setExtremes(maxDateHaveValue, endDate);
                              }
                          }
                      }, 20);
                  }
              },
          },
          type: 'datetime',
          dateTimeLabelFormats: {
              month: '%m/%Y'
          },
      },

      credits: {
          enabled: false
      },

      exporting: {
          enabled: true
      },
      navigation: {
          buttonOptions: {
              x: 5,
              y: -10
          }
      },
      legend: {
          enabled: true,
          align: 'center',
          layout: 'horizontal',
          verticalAlign: 'bottom',
          y: 0
      },

      plotOptions: {
          series: {
              compare: 'percent'
          },

          line: {
              events : {
                  legendItemClick: function(e){
                  // e.preventDefault();
                      return false;
                  }
              }
          }
      },

      colors:[
          '#3CAFD7', '#EBB033', '#8A447E', '#BF6259', '#9AC896', '#EA862D', '#C0262D', '#F9EC32'
      ],

      tooltip: {
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
          valueDecimals: 2
      },

      series: seriesOptions
  }
  );
};

function renderAllIndexInChartPerformance(listChartData, mappingIndexLabel, locale, contentSelector) {
  var seriesOptions = [];

  $.each(listChartData, function (index_code, chart_data) {
      var indexCodeLower = index_code.toLowerCase();
      seriesOptions.push({
          name: mappingIndexLabel[indexCodeLower],
          data: chart_data
      });
  });

  renderChartPerformance(seriesOptions, locale, contentSelector);
}

function renderAllIndexInChartPerformanceAjax(mappingIndexLabel, listIndexToDisplayChart, VFMAPIUrl, locale, contentSelector) {
  var listIndexToDisplayChartString = listIndexToDisplayChart.join(',');
  const vfm_api = VFMAPIUrl + `?list_index=` + listIndexToDisplayChartString;

  $.ajax({
      url: vfm_api,
      type: "GET",
      async: true,
      success: function(results) {
          var listChartData = JSON.parse(results);

          renderAllIndexInChartPerformance(listChartData, mappingIndexLabel, locale, contentSelector);
          jQuery(contentSelector).removeAttr('style');
      },
      error: function() {
          console.log('Cannot retrieve data.');
      }
  });
}

function renderFFSPerformanceAjax(tradeCode, VFMAPIUrl, locale, contentSelector, date_upload = '') {
    var vfm_api = VFMAPIUrl + `?trade_code=` + tradeCode;
    if (date_upload != '') {
        vfm_api = VFMAPIUrl + `?trade_code=` + tradeCode + '&date_upload=' + date_upload;
    }

    if (locale == 'vi') {
        decimalPoint = ",";
        separator = ".";
    }
    else {
        decimalPoint = ".";
        separator = ",";
    }

    $.ajax({
        url: vfm_api,
        data: {},
        success: function(data) {
            var response = JSON.parse(data);
            var response_html = `
            <tr>
                <th></th>
                <th style="text-align:right">NAV/đvq &amp; Index</th>
                <th style="text-align:right">${locale == 'vi' ? '1 tháng': '1 month'}</th>
                <th style="text-align:right">${locale == 'vi' ? '3 tháng': '3 months'}</th>
                <th style="text-align:right">${locale == 'vi' ? 'Kể từ đầu năm': 'YTD'}</th>
                <th style="text-align:right">${locale == 'vi' ? '12 tháng': '12 months'}</th>
                <th style="text-align:right">${locale == 'vi' ? 'Kể từ khi thành lập': 'Since Inception'}&nbsp;<span class="inception-date"></span></th>
            </tr>
            `;

            var ffs_date_html = '';
            var inception_date_html = '';

            var rows = Object.keys(response);
            rows.map(function renderData(row) {
                const objectLabel = response[row]['object'];
                var navIndex = response[row]['nav_index'];
                var navIndexLabel = navIndex != null ? number_format(navIndex, 2, decimalPoint, separator) : 'N/A';

                var month1 = response[row]['month_1'];
                var month1Label = month1 != null ? number_format(month1, 2, decimalPoint, separator) : 'N/A';

                var month3 = response[row]['month_3'];
                var month3Label = month3 != null ? number_format(month3, 2, decimalPoint, separator) : 'N/A';

                var ytd = response[row]['ytd'];
                var ytdLabel = ytd != null ? number_format(ytd, 2, decimalPoint, separator) : 'N/A';

                var month12 = response[row]['month_12'];
                var month12Label = month12 != null ? number_format(month12, 2, decimalPoint, separator) : 'N/A';

                var sinceInception = response[row]['since_inception'];
                var sinceInceptionLabel = sinceInception != null ? number_format(sinceInception, 2, decimalPoint, separator) : 'N/A';

                var html = `
                    <tr>
                        <td><strong>${objectLabel}</strong></td>
                        <td align='right'>${navIndexLabel}</td>
                        <td align='right'>${month1Label}</td>
                        <td align='right'>${month3Label}</td>
                        <td align='right'>${ytdLabel}</td>
                        <td align='right'>${month12Label}</td>
                        <td align='right'>${sinceInceptionLabel}</td>
                    </tr>
                `;

                if (!ffs_date_html) {
                    ffs_date_html = moment(response[row]['date_upload'], 'YYYY-MM-DD').format('DD/MM/YYYY');
                }
                if (!inception_date_html) {
                    inception_date_html = moment(response[row]['inception_date'], 'YYYY-MM-DD').format('DD/MM/YYYY');
                }
                response_html += html;
            });

            jQuery(contentSelector + ' .table-content').html(response_html);
            jQuery(contentSelector + ' .inception-date').html(inception_date_html);
            jQuery(contentSelector + ' .latest-date').html(ffs_date_html);
        },
        error: function(error) {
            console.log(error);
        }
    });
}
