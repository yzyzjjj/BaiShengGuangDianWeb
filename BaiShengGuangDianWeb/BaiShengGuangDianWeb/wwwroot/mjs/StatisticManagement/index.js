﻿function pageReady() {
    $(".ms2").select2();
    //getDeviceChart();
    //getStatisticList();
    getDeviceList();
    $("#selectStartDate").val(getDate()).datepicker('update');
    $("#selectEndDate").val(getDate()).datepicker('update');
}

var aaa = null;
var aa1 = null;
var aa2 = null;
var aa3 = null;
function getDeviceChart() {
    var aaa = new Array();
    var aa1 = new Array();
    var aa2 = new Array();
    var aa3 = new Array();
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
            for (var k in ret.datas) {
                aaa.push(ret.datas[k].DeviceStateStr.toString());
            }
            for (var i = 0; i < aaa.length; i++) {
                if (aaa[i] == "已报修") {
                    aa1.push(aaa[i]);
                }
                if (aaa[i] == "加工中") {
                    aa2.push(aaa[i]);
                }
                if (aaa[i] == "连接异常") {
                    aa3.push(aaa[i]);
                }
            }
            var myChart = echarts.init(document.getElementById("deviceState"));
            window.addEventListener('resize', function () {
                myChart.resize();
            });
            var option = {
                title: {
                    left: 'center',
                    top: 20,
                    textStyle: {
                        color: 'blue'
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a}<br/>{b} : {c}台 ({d}%)"
                },
                series: [{
                    name: '设备状态',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '50%'],
                    data: [
                        { value: aa1.length, name: '已报修' },
                        { value: aa2.length, name: '加工中' },
                        { value: aa3.length, name: '连接异常' }
                    ].sort(function (a, b) { return a.value - b.value; })
                }]
            };
            myChart.setOption(option, true);
        });
}

var aa = null;
var bb = null;
var cc = null;
function getStatisticList() {
    aa = new Array();
    bb = new Array();
    cc = new Array();
    var opType = 125;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post",
        {
            opType: opType
        },
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            for (var k in ret.datas) {
                aa.push(ret.datas[k].Id.toString());
                bb.push(ret.datas[k].MarkedDateTime.toString());
            }
            for (var i = aa.length - 1; i >= 0; i--) {
                cc.push(aa[i]);
            }
            var myChart = echarts.init(document.getElementById('main'));
            var option = {
                title: {
                    text: "123"
                },
                tooltip: {
                    trigger: "axis"
                },
                xAxis: {
                    data: bb
                },
                yAxis: {},
                legend: {
                    left: "right",
                    top: 280,
                    data: ["abc", "abc1"],
                    orient: 'vertical'//纵向布局
                },
                series: [{
                    name: "abc",
                    type: "line",
                    data: aa
                },
                {
                    name: "abc1",
                    type: "line",
                    data: cc
                }],
                dataZoom: [{
                    type: "slider",
                    start: 0,
                    end: 40
                },
                {
                    type: "inside",
                    start: 0,
                    end: 40
                }],
                toolbox: {
                    left: "center",
                    feature: {
                        dataZoom: {
                            yAxisIndex: "none"
                        },
                        dataView: { readOnly: false },//数据视图
                        restore: {},
                        saveAsImage: {}
                    }
                }
            };
            myChart.setOption(option, true);
            window.addEventListener('resize', function () {
                myChart.resize();
            });
        });
}

//2019-7-3 15:40:38

function getDeviceList() {
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
            var option = '<option value="{0}">{1}</option>';
            $("#selectDevice").append(option.format(0, "所有"));
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#selectDevice").append(option.format(data.Id, data.Code));
            }
        });
}

var time = null;
var v = null;
function createChart() {
    $("#recordChart").empty();
    time = new Array();
    v = new Object();
    var opType = 502;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var device = $("#selectDevice").val();
    var start = $("#selectStartDate").val() + " " + $("#selectStartTime").val();
    var end = $("#selectEndDate").val() + " " + $("#selectEndTime").val();

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

    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        DeviceId: device,
        StartTime: start,
        EndTime: end,
        DataType: dataTime
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var time = [];
            var listName = [];
            listName["每日加工次数"] = "ProcessCount";
            listName["每日加工时间"] = "ProcessTime";
            listName["总加工次数"] = "TotalProcessCount";
            listName["总加工时间"] = "TotalProcessTime";
            listName["同时加工台数"] = "Use";
            listName["总台数"] = "Total";
            listName["使用率"] = "Rate";
            var legend = ["每日加工次数", "每日加工时间", "总加工次数", "总加工时间", "同时加工台数", "总台数", "使用率"];
            var data = [];
            var key;
            for (key in listName) {
                if (listName.hasOwnProperty(key)) {
                    data[key] = [];
                }
            }
            var i;
            for (i = 0; i < ret.datas.length; i++) {
                if (dataTime == 2) {
                    time[i] = ret.datas[i].Time.split(" ")[0];
                }
                if (dataTime == 1) {
                    time[i] = ret.datas[i].Time.split(":")[0]+"00:00";
                }
                if (dataTime == 0) {
                    time[i] = ret.datas[i].Time.split(" ")[1];
                }
                var d = ret.datas[i];
                for (key in listName) {
                    if (listName.hasOwnProperty(key)) {
                        data[key].push(d[listName[key]]);
                    }
                }
            }
            var rData = [];
            i = 0;

            for (key in listName) {
                if (listName.hasOwnProperty(key)) {
                    rData.push({
                        name: key,
                        type: "line",
                        data: data[key]
                    });
                }
            }
            var charts = '<div id="chart' + i + '" style="width: 100%; height: 500px">' + '</div>';
            $("#recordChart").append(charts);
            var parName = listName[i];
            var myChart = echarts.init(document.getElementById("chart" + i));
            var option = {
                title: {
                    text: parName
                },
                tooltip: {
                    trigger: "axis",
                    formatter: function (params, ticket, callback) {
                        var formatter1 = "{0}: {1}<br/>";
                        var formatter2 = "{0}: {1}%<br/>";
                        var formatter = "";
                        for (var i = 0, l = params.length; i < l; i++) {
                            formatter += (params[i].seriesName == "使用率" ? formatter2 : formatter1).format(params[i].seriesName, params[i].value);
                        }
                        return formatter;
                    }
                },
                xAxis: {
                    data: time
                },
                yAxis: {},
                legend: {
                    data: legend
                },
                series: rData,
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
        });
}
