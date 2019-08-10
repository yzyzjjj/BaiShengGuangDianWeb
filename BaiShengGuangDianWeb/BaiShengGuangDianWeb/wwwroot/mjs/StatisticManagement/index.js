function pageReady() {
    $(".ms2").select2();
    $("#selectDevice").select2({
        allowClear: true,
        placeholder: "请选择"
    });

    $("#selectDevice").on("select2:select", function (e) {
        var v = $("#selectDevice").val();
        if (v.indexOf("0,所有") > -1) {
            $("#selectDevice").val("0,所有").trigger("change");
        }
    });
    //$("#selectDevice").on("select2:unselect", function (e) {
    //    var v = $("#selectDevice").val();
    //});
    //getDeviceChart();
    //getStatisticList();
    getDeviceList();
    getWorkShopList();
    $("#selectStartDate").val(getDate()).datepicker('update');
    $("#selectEndDate").val(getDate()).datepicker('update');
    $("#selectWorkShop").on("change", function (e) {
        $("#recordChart").empty();
        getWorkShopDeviceList();
    });
}

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
            var option = '<option value="{0},{1}">{1}</option>';
            $("#selectDevice").append(option.format(0, "所有"));
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#selectDevice").append(option.format(data.Id, data.Code));
            }
        });
}

var time = null;
function createChart() {
    $("#recordChart").empty();
    time = new Array();
    var opType = 502;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var device = $("#selectDevice").val();
    if (isStrEmptyOrUndefined(device)) {
        layer.msg("请选择设备");
        return;
    }
    var workShop = $("#selectWorkShop").val();
    var list = device.join();
    var newList = list.split(",");
    var deviceId = [], deviceName = [];
    for (var i = 0; i < newList.length; i++) {
        if (i % 2 == 0) {
            deviceId.push(newList[i]);
        } else {
            deviceName.push(newList[i]);
        }
    }
    var start = $("#selectStartDate").val() + " " + $("#selectStartTime").val();
    if (start.slice(start.indexOf(" ") + 1, start.indexOf(":")) % 10 == start.slice(start.indexOf(" ") + 1, start.indexOf(":"))) {
        start = $("#selectStartDate").val() + " " + "0" + $("#selectStartTime").val();
    }
    var end = $("#selectEndDate").val() + " " + $("#selectEndTime").val();
    if (end.slice(end.indexOf(" ") + 1, end.indexOf(":")) % 10 == end.slice(end.indexOf(" ") + 1, end.indexOf(":"))) {
        end = $("#selectEndDate").val() + " " + "0" + $("#selectEndTime").val();
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

    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        WorkshopName: workShop,
        DeviceId: deviceId.join(","),
        StartTime: start,
        EndTime: end,
        DataType: dataTime,
        Compare: deviceId.length == 1 ? 0 : 1
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            //var dataDeviceId = [];
            var time = [];
            var timeS = [];
            var listName = [];
            var comName = [];
            listName["每日加工次数"] = "ProcessCount";
            listName["每日加工时间"] = "ProcessTime";
            listName["总加工次数"] = "TotalProcessCount";
            listName["总加工时间"] = "TotalProcessTime";
            comName["同时加工台数"] = "Use";
            comName["总台数"] = "Total";
            comName["使用率"] = "Rate";
            var legend = ["每日加工次数", "每日加工时间", "总加工次数", "总加工时间", "同时加工台数", "总台数", "使用率"];
            var data = [];
            var dataCom = [];
            var key;
            for (key in listName) {
                if (listName.hasOwnProperty(key)) {
                    data[key] = [];
                }
            }
            var keyCom;
            for (keyCom in comName) {
                if (comName.hasOwnProperty(keyCom)) {
                    dataCom[keyCom] = [];
                }
            }
            ret.datas.sort(function (x, y) {
                return x.DeviceId < y.DeviceId ? 1 : -1;
            });
            ret.datas.sort(function (x, y) {
                return x.Time > y.Time ? 1 : -1;
            });

            //for (var m = 0; m < ret.datas.length; m++) {
            //    if (ret.datas[m].DeviceId == deviceId[m % deviceId.length]) {
            //        aa.push(ret.datas[m]);
            //    } else {
            //        aa.push({});
            //        //for (var n = m % deviceId.length; n < deviceId.length; n++) {
            //        //    if (deviceId[aa.length % deviceId.length] != ret.datas[m].DeviceId) {
            //        //        aa.push({});
            //        //    } else {
            //        //        aa.push(ret.datas[m]);
            //        //    }
            //        //}
            //        if (deviceId[aa.length % deviceId.length] != ret.datas[m].DeviceId) {
            //            aa.push({});
            //        } else {
            //            aa.push(ret.datas[m]);
            //        }
            //    }
            //}

            //for (var k = 0; k < ret.datas.length; k++) {
            //    dataDeviceId[k] = ret.datas[k].DeviceId;
            //}
            //dataDeviceId = dataDeviceId.filter(function (item, index, array) {
            //    return dataDeviceId.indexOf(item) === index;
            //});
            var i;
            for (i = 0; i < ret.datas.length; i++) {
                if (dataTime == 2) {
                    time[i] = ret.datas[i].Time.split(" ")[0];
                }
                if (dataTime == 1) {
                    time[i] = ret.datas[i].Time.split(":")[0] + ":00:00";
                }
                if (dataTime == 0) {
                    if ((ret.datas[i].Time.split(" ")[1]).slice(0, 1) == 0) {
                        time[i] = (ret.datas[i].Time.split(" ")[1]).replace(0, "");
                    } else {
                        time[i] = ret.datas[i].Time.split(" ")[1];
                    }
                }
                timeS[i] = ret.datas[i].Time;
                var d = ret.datas[i];
                for (key in listName) {
                    //if (listName.hasOwnProperty(key) && deviceId[i % deviceId.length] == d.DeviceId) {
                    //    data[key].push(d[listName[key]]);
                    //} else {
                    //    data[key].push("");
                    //}
                    if (listName.hasOwnProperty(key)) {
                        //if (deviceId.length != dataDeviceId.length) {
                        for (var j = data[key].length % deviceId.length; j < deviceId.length; j++) {
                            if (deviceId[j] == d.DeviceId) {
                                data[key].push(d[listName[key]]);
                                //break;
                                if (i == ret.datas.length - 1 && data[key].length % deviceId.length != 0) {
                                    //data[key].push("");
                                    //break;
                                    for (var q = 0; q < data[key].length % deviceId.length; q++) {
                                        data[key].push("x");
                                    }
                                    break;
                                } else {
                                    break;
                                }
                            } else {
                                //if (deviceId.indexOf(deviceId[j]) + 1 == deviceId.length) {
                                //    data[key].push("");
                                //    data[key].push(d[listName[key]]);
                                //    //if (i == ret.datas.length - 1 && data[key].length % deviceId.length != 0) {
                                //    //    data[key].push("");
                                //    //}
                                //} else {
                                data[key].push("x");
                                if (key == "总加工时间" && j == deviceId.length - 1) {
                                    i--;
                                }
                                //}
                            }
                        }
                    }
                }
            }
            time = time.filter(function (item, index, array) {
                return time.indexOf(item) === index;
            });
            timeS = timeS.filter(function (item, index, array) {
                return timeS.indexOf(item) === index;
            });
            var times = 0;
            for (var m = 0; m < ret.datas.length; m++) {
                var s = ret.datas[m];
                if (ret.datas[m].Time == timeS[times]) {
                    for (keyCom in comName) {
                        if (comName.hasOwnProperty(keyCom)) {
                            dataCom[keyCom].push(s[comName[keyCom]]);
                        }
                    }
                    times++;
                }
            }
            var rData = [];
            i = 0;

            var deviceIds;
            for (key in listName) {
                if (listName.hasOwnProperty(key)) {
                    for (deviceIds = 0; deviceIds < deviceId.length; deviceIds++) {
                        rData.push({
                            name: key,
                            type: "line",
                            data: data[key].filter(function (item, index, array) {
                                return index % deviceId.length == deviceIds;
                            })
                        });
                    }
                }
            }
            var uData = [];
            for (keyCom in comName) {
                if (comName.hasOwnProperty(keyCom)) {
                    uData.push({
                        name: keyCom,
                        type: "line",
                        data: dataCom[keyCom]
                    });
                }
            }
            rData = rData.concat(uData);
            var charts = '<div id="chart" style="width: 100%; height: 500px">' + '</div>';
            $("#recordChart").append(charts);
            var myChart = echarts.init(document.getElementById("chart"));
            var option = {
                tooltip: {
                    trigger: "axis",
                    formatter: function (params, ticket, callback) {
                        var formatter1 = "{0}: {1}<br/>";
                        var formatter2 = "{0}: {1}%<br/>";
                        var formatter = "";
                        for (var i = 0, l = params.length; i < l; i++) {
                            var xName = params[i].name;
                            if (deviceId.length > 1) {
                                formatter += (params[i].seriesName == "使用率" ? formatter2 : formatter1).format(
                                    params[i].seriesName == "同时加工台数" ||
                                        params[i].seriesName == "总台数" ||
                                        params[i].seriesName == "使用率"
                                        ? params[i].seriesName
                                        : deviceName[i % deviceName.length] + params[i].seriesName,
                                    params[i].value);
                            } else {
                                formatter += (params[i].seriesName == "使用率" ? formatter2 : formatter1).format(
                                    params[i].seriesName,
                                    params[i].value);
                            }
                        }
                        return xName + "<br/>" + formatter;
                    }
                },
                xAxis: {
                    data: time,
                    axisLine: {
                        onZero: false
                    }
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
                    top: 20,
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
            $("section").resize(function () {
                myChart.resize();
            });
        });
}

function getWorkShopList() {
    var opType = 162;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var option = '<option value = "{0}">{1}</option>';
        $("#selectWorkShop").append(option.format("", "所有车间"));
        for (var i = 0; i < ret.datas.length; i++) {
            var data = ret.datas[i];
            $("#selectWorkShop").append(option.format(data.SiteName, data.SiteName));
        }
    });
}

function getWorkShopDeviceList() {
    var workShop = $("#selectWorkShop").val();
    if (isStrEmptyOrUndefined(workShop)) {
        $("#selectDevice").empty();
        getDeviceList();
        return;
    }
    var opType = 163;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        workshopName: workShop
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $("#selectDevice").empty();
        var option = '<option value = "{0},{1}">{1}</option>';
        if (ret.datas.length > 1) {
            $("#selectDevice").append(option.format(0, "所有"));
        }
        for (var i = 0; i < ret.datas.length; i++) {
            var data = ret.datas[i];
            $("#selectDevice").append(option.format(data.Id, data.Code));
        }
    });
}