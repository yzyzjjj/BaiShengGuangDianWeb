function pageReady() {
    $(".ms2").select2();
    getDeviceChart();
    getDevicePar();
    $("#selectDevice").select2();
    $("#selectStartDate").val(getDate()).datepicker('update');
    $("#selectEndDate").val(getDate()).datepicker('update');
}

function getDeviceChart() {
    var opType = 100;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var option1 = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#selectDevice").append(option1.format(data.Id, data.Code));
            }
        });
}

var parList = null;
function getDevicePar() {
    parList = new Array();
    var opType = 500;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var option2 = '<div class="form-inline" style="margin:10px 0 0 20px">' +
                '<input type="checkbox" value="{0},{1}"class="icb_minimal">' +
                '<label style="margin-left:10px">{1}</label>' +
                '</div>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#selectPar").append(option2.format(data.Id, data.VariableName));
            }
            $("#selectPar .icb_minimal").iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_minimal-blue',
                radioClass: 'iradio_minimal-blue',
                increaseArea: '20%' // optional
            });
            $("#selectPar .icb_minimal").on('ifChanged',
                function (event) {
                    var ui = $(this);
                    var v = ui.attr("value");
                    if (ui.is(":checked")) {
                        parList.push(v);
                    } else {
                        parList.splice(parList.indexOf(v), 1);
                    }
                });
        });
}

var time = null;
var v = null;
function createChart() {
    $("#main").empty();
    time = new Array();
    v = new Object();
    var opType = 501;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var device = $("#selectDevice").val();
    var start = $("#selectStartDate").val() + "T" + $("#selectStartTime").val();
    if (start.slice(start.indexOf("T") + 1, start.indexOf(":")) % 10 == start.slice(start.indexOf("T") + 1, start.indexOf(":"))) {
        start = $("#selectStartDate").val() + "T" + "0" + $("#selectStartTime").val();
    }
    var end = $("#selectEndDate").val() + "T" + $("#selectEndTime").val();
    if (end.slice(end.indexOf("T") + 1, end.indexOf(":")) % 10 == end.slice(end.indexOf("T") + 1, end.indexOf(":"))) {
        end = $("#selectEndDate").val() + "T" + "0" + $("#selectEndTime").val();
    }
    if (compareDate(start, end)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }
    var dataTime = 0;
    if (100000000 > (end.replace(/[^0-9]+/g, "") - start.replace(/[^0-9]+/g, "")) && (end.replace(/[^0-9]+/g, "") - start.replace(/[^0-9]+/g, "")) >= 1000000) {
        dataTime = 1;
    }
    if ((end.replace(/[^0-9]+/g, "") - start.replace(/[^0-9]+/g, "")) >= 100000000) {
        dataTime = 2;
    }
    var list = parList.join();
    if (isStrEmptyOrUndefined(list)) {
        return;
    }
    var newList = list.split(",");
    var listId = [], listName = [];
    for (var i = 0; i < newList.length; i++) {
        if (i % 2 == 0) {
            listId.push(newList[i]);
        } else {
            listName.push(newList[i]);
        }
    }
    var parId = listId.join(",");
    var code = $("#selectDevice").find("option:selected").text();
    $("#deviceCode").text(code);

    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        DeviceId: device,
        StartTime: start,
        EndTime: end,
        Field: parId,
        DataType: dataTime
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            for (var i = 0; i < ret.datas.length; i++) {
                if (dataTime == 2) {
                    time[i] = (ret.datas[i].time).slice(0, (ret.datas[i].time).indexOf(" "));
                }
                if (dataTime == 1) {
                    time[i] = ret.datas[i].time;
                }
                if (dataTime == 0) {
                    time[i] = (ret.datas[i].time).slice((ret.datas[i].time).indexOf(" "), (ret.datas[i].time).length);
                }
                for (var j = 0; j < listId.length; j++) {
                    var key = "v" + listId[j];
                    if (isStrEmptyOrUndefined(v[key])) {
                        v[key] = [];
                    }
                    v[key].push(ret.datas[i][key]);
                }
            }
            for (var i = 0; i < listName.length; i++) {
                var charts = '<div class="box-footer">' + '<div id="chart' + i + '" style="width: 100%; height: 500px">' + '</div>' + '</div>';
                $("#main").append(charts);
                var parName = listName[i];
                var myChart = echarts.init(document.getElementById("chart" + i));
                var option = {
                    title: {
                        text: parName
                    },
                    tooltip: {
                        trigger: "axis"
                    },
                    xAxis: {
                        data: time
                    },
                    yAxis: {},
                    legend: {
                        data: [parName]
                    },
                    series: [{
                        name: parName,
                        type: "line",
                        data: v[Object.keys(v)[i]]
                    }],
                    dataZoom: [{
                        type: "slider",
                        start: 0,
                        end: 20
                    },
                    {
                        type: "inside",
                        start: 0,
                        end: 20
                    }],
                    toolbox: {
                        top: 18,
                        left: "center",
                        feature: {
                            dataZoom: {
                                yAxisIndex: "none"
                            },
                            dataView: { readOnly: false },//数据视图
                            restore: {},
                            magicType: {
                                type: ['line', 'bar']
                            }
                        }
                    }
                };
                myChart.setOption(option, true);
                window.addEventListener('resize', function () {
                    myChart.resize();
                });
            }
        });
}