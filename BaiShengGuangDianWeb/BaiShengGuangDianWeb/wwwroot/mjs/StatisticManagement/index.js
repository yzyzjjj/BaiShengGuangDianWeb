function pageReady() {
    $(".ms2").select2();
    $("#selectDevice").select2({
        allowClear: true,
        placeholder: "请选择"
    });
    $("#selectDevice1").select2({
        allowClear: true,
        placeholder: "请选择"
    });
    $(".icb_minimal").iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '20%'
    });
    $("#selectDevice").on("select2:select", function (e) {
        var v = $("#selectDevice").val();
        if (v.indexOf("0,所有") > -1) {
            $("#selectDevice").val("0,所有").trigger("change");
        }
    });
    getDeviceList(1);
    getDeviceList(2);
    getWorkShopList();
    $("#selectStartDate").val(getDate()).datepicker('update');
    $("#selectEndDate").val(getDate()).datepicker('update');
    $("#selectDayDate").val(getDate()).datepicker('update');
    $("#selectWorkShop").on("select2:select", function (e) {
        $("#recordChart").empty();
        getWorkShopDeviceList();
    });
    var tf = true;
    $("#selectWorkShop1").on("select2:select", function (e) {
        $("#processDetailList").empty();
        getWorkShopDevList();
        $("#checkAll").iCheck("uncheck");
    });
    $("#checkAll").on("ifChanged", function () {
        var i, len = $("#selectDevice1").find("option").length;
        if ($(this).is(":checked")) {
            var v = [];
            for (i = 0; i < len; i++) {
                var option = $("#selectDevice1").find("option").eq(i).val();
                v.push(option);
            }
            $("#selectDevice1").val(v).trigger("change");
            tf = true;
            $(".select2-selection__clear").css("marginTop", "9px");
        } else {
            if (tf) {
                $("#selectDevice1").val([]).trigger("change");
            }
        }
    });
    $("#selectDevice1").on("select2:unselect", function () {
        tf = false;
        $("#checkAll").iCheck("uncheck");
    });
    $("#selectDevice1").on("select2:select", function () {
        $(".select2-selection__clear").css("marginTop", "9px");
        var op = $("#selectDevice1").find("option").length;
        var v = $("#selectDevice1").val().length;
        if (op == v) {
            $("#checkAll").iCheck("check");
        }
    });
    $("#selectDevice1").next(".select2-container").css("maxHeight", "37px").css("overflowY", "auto");
}

function getDeviceList(par) {
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
            var option;
            var i, d, len = ret.datas.length;
            if (par == 1) {
                $("#selectDevice").empty();
                option = '<option value="{0},{1}">{1}</option>';
                $("#selectDevice").append(option.format(0, "所有"));
                for (i = 0; i < len; i++) {
                    d = ret.datas[i];
                    $("#selectDevice").append(option.format(d.Id, d.Code));
                }
            } else {
                $("#selectDevice1").empty();
                option = '<option value="{0}">{1}</option>';
                for (i = 0; i < len; i++) {
                    d = ret.datas[i];
                    $("#selectDevice1").append(option.format(d.Id, d.Code));
                }
            }
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
        $("#selectWorkShop,#selectWorkShop1").empty();
        var option = '<option value = "{0}">{1}</option>';
        $("#selectWorkShop,#selectWorkShop1").append(option.format("", "所有车间"));
        for (var i = 0; i < ret.datas.length; i++) {
            var data = ret.datas[i];
            $("#selectWorkShop,#selectWorkShop1").append(option.format(data.SiteName, data.SiteName));
        }
    });
}

function getWorkShopDeviceList() {
    var workShop = $("#selectWorkShop").val();
    if (isStrEmptyOrUndefined(workShop)) {
        $("#selectDevice").empty();
        getDeviceList(1);
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

function getWorkShopDevList() {
    var workShop = $("#selectWorkShop1").val();
    if (isStrEmptyOrUndefined(workShop)) {
        $("#selectDevice1").empty();
        getDeviceList(2);
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
        $("#selectDevice1").empty();
        var option = '<option value = "{0}">{1}</option>';
        for (var i = 0; i < ret.datas.length; i++) {
            var data = ret.datas[i];
            $("#selectDevice1").append(option.format(data.Id, data.Code));
        }
    });
}

var time = null;
function createChart(start1, end1) {
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
    var start;
    if (isStrEmptyOrUndefined(start1)) {
        start = $("#selectStartDate").val() + " " + $("#selectStartTime").val();
    } else {
        start = start1;
        $("#selectStartDate").val(start1.split(" ")[0]).datepicker('update');
        $("#selectStartTime").val(start1.split(" ")[1]).timepicker('setTime', start1.split(" ")[1]);
    }
    if (start.slice(start.indexOf(" ") + 1, start.indexOf(":")).length == 1 && isStrEmptyOrUndefined(start1)) {
        start = $("#selectStartDate").val() + " " + "0" + $("#selectStartTime").val();
    }
    var end;
    if (isStrEmptyOrUndefined(end1)) {
        end = $("#selectEndDate").val() + " " + $("#selectEndTime").val();
    } else {
        end = end1;
        $("#selectEndDate").val(end.split(" ")[0]).datepicker('update');
        $("#selectEndTime").val(end.split(" ")[1]).timepicker('setTime', end.split(" ")[1]);
    }
    if (end.slice(end.indexOf(" ") + 1, end.indexOf(":")).length == 1 && isStrEmptyOrUndefined(end1)) {
        end = $("#selectEndDate").val() + " " + "0" + $("#selectEndTime").val();
    }
    if (exceedTime(start) || exceedTime(end)) {
        layer.msg("所选时间不能大于当前时间");
        return;
    }
    if (compareDate(start, end)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }
    var dataTime = 0;
    var endStart = end.replace(/[^0-9]+/g, "") - start.replace(/[^0-9]+/g, "");
    if (100000000 > endStart && endStart >= 1000000) {
        dataTime = 1;
    }
    if (endStart >= 100000000) {
        dataTime = 2;
    }
    if ((endStart >= 10000 && endStart < 1000000) || endStart == 770000) {
        dataTime = 3;
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
            objectSort(ret.datas, "DeviceId");
            objectSort(ret.datas, "Time");
            var i, j;
            for (i = 0; i < ret.datas.length; i++) {
                time[i] = ret.datas[i].Time;
                if (dataTime == 2) {
                    time[i] = ret.datas[i].Time.split(" ")[0];
                }
                timeS[i] = ret.datas[i].Time;
                var d = ret.datas[i];
                for (key in listName) {
                    if (listName.hasOwnProperty(key)) {
                        for (j = data[key].length % deviceId.length; j < deviceId.length; j++) {
                            if (deviceId[j] == d.DeviceId) {
                                data[key].push(d[listName[key]]);
                                if (i == ret.datas.length - 1 && data[key].length % deviceId.length != 0) {
                                    for (var q = 0; q < data[key].length % deviceId.length; q++) {
                                        data[key].push("x");
                                    }
                                    break;
                                } else {
                                    break;
                                }
                            } else {
                                data[key].push("x");
                                if (key == "总加工时间" && j == deviceId.length - 1) {
                                    i--;
                                }
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
            $("#recordChart").empty();
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
                                        : "<span style='color:#99ff00'>" + deviceName[i % deviceName.length] + "</span>" + "-" + params[i].seriesName,
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
                    end: 100
                },
                {
                    type: "inside",
                    start: 0,
                    end: 100
                }],
                toolbox: {
                    top: 20,
                    left: "center",
                    feature: {
                        dataZoom: {
                            yAxisIndex: "none"
                        },
                        dataView: {
                            show: true, title: '数据视图', readOnly: true, optionToContent: function (opt) {
                                var axisData = opt.xAxis[0].data;//坐标数据
                                var series = opt.series;//折线图数据
                                var tdHead = '<td style="padding:0 10px">时间</td>';//表头
                                var tdBody = '';//数据
                                series.forEach(function (item, index) {
                                    //组装表头
                                    if (deviceName.length > 1) {
                                        var len = deviceName.length;
                                        var devName = '<font color="blue">' + deviceName[index % len] + '</font>';
                                        if (item.name == "同时加工台数" || item.name == "总台数" || item.name == "使用率") {
                                            tdHead += '<td style="padding: 0 10px">' + item.name + '</td>';
                                        } else {
                                            tdHead += '<td style="padding: 0 10px">' + devName + item.name + '</td>';
                                        }
                                    } else {
                                        tdHead += '<td style="padding: 0 10px">' + item.name + '</td>';
                                    }
                                });
                                var table = '<table border="1" style="margin-left:20px;border-collapse:collapse;font-size:14px;text-align:center"><tbody><tr>' + tdHead + '</tr>';
                                for (var i = 0, l = axisData.length; i < l; i++) {
                                    for (var j = 0; j < series.length; j++) {
                                        //组装表数据
                                        if (series[j].name == "使用率") {
                                            tdBody += '<td>' + series[j].data[i] + '%' + '</td>';
                                        } else {
                                            tdBody += '<td>' + series[j].data[i] + '</td>';
                                        }
                                    }
                                    table += '<tr><td style="padding: 0 10px">' + axisData[i] + '</td>' + tdBody + '</tr>';
                                    tdBody = '';
                                }
                                table += '</tbody></table>';
                                return table;
                            }
                        },
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
            var tf = true;
            myChart.on('dataZoom', function (params) {
                if (time.length == 0) {
                    return;
                }
                var chartData = myChart.getOption();
                var chartZoom = chartData.dataZoom[0];
                var starts = chartData.xAxis[0].data[chartZoom.startValue];
                var ends = chartData.xAxis[0].data[chartZoom.endValue];
                var timeX = ends.replace(/[^0-9]+/g, "") - starts.replace(/[^0-9]+/g, "");
                var timeY = time[time.length - 1].replace(/[^0-9]+/g, "") - time[0].replace(/[^0-9]+/g, "");
                if (timeX == 1 && timeY != 1 && tf && ends.length == 10) {
                    tf = false;
                    starts = starts + " 00:00:00";
                    ends = ends + " 00:00:00";
                    setTimeout(function () {
                        createChart(starts, ends);
                        tf = true;
                    }, 1000);
                }
                if ((timeX == 10000 || timeX == 770000) && timeY != 10000 && tf) {
                    tf = false;
                    setTimeout(function () {
                        createChart(starts, ends);
                        tf = true;
                    }, 1000);
                }
                if (timeX == 100 && timeY != 100 && tf) {
                    tf = false;
                    setTimeout(function () {
                        createChart(starts, ends);
                        tf = true;
                    }, 1000);
                }
            });
        });
}

function hourChart() {
    var endTime = getFullTime();
    var hour = new Date().format(" hh");;
    var day = new Date().format("dd ");
    var startTime;
    if ((hour - 1).toString().length == 1) {
        startTime = endTime.replace(hour, " 0" + (hour - 1));
    } else {
        startTime = endTime.replace(hour, " " + (hour - 1));
    }
    if (hour == " 00") {
        startTime = endTime.replace(hour, " 23").replace(day, (day - 1) + " ");
        if ((day - 1).toString().length != 1) {
            startTime = endTime.replace(hour, " 23").replace(day, "0" + (day - 1) + " ");
        }
    }
    createChart(startTime, endTime);
}

function dayChart() {
    var endTime = getFullTime();
    var startTime = getDayAgo(1) + " " + getTime();
    createChart(startTime, endTime);
}

function monthChart() {
    var endTime = getFullTime();
    var mouth = new Date().format("-MM");
    var mouthSum = new Date().format("MM");;
    var startTime;
    if ((mouthSum - 1).toString().length == 1) {
        startTime = endTime.replace(mouth, "-0" + (mouthSum - 1));
    } else {
        startTime = endTime.replace(mouth, "-" + (mouthSum - 1));
    }
    createChart(startTime, endTime);
}

function getProcessDetail() {
    var opType = 506;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var deviceId = $("#selectDevice1").val();
    if (isStrEmptyOrUndefined(deviceId)) {
        layer.msg("请选择车间设备");
        return;
    }
    var j, lens = deviceId.length, deviceName = [];
    for (j = 0; j < lens; j++) {
        var num = deviceId[j];
        deviceName.push($("#selectDevice1").find("option[value=" + num + "]").text());
    }
    var dayDate = $("#selectDayDate").val();
    if (exceedTime(dayDate)) {
        layer.msg("所选时间不能大于当前时间");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        DeviceId: deviceId.join(","),
        StartTime: dayDate
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var rows = '<div class="row" id="row{0}"></div>';
            var panel = '<div class="col-md-6">' +
                '<div class="panel panel-primary">' +
                '<div class="panel-heading">' +
                '<h3 class="panel-title badge" id="code{0}" style="color:green">' +
                '</h3>' +
                '<h3 class="panel-title pull-right badge" style="cursor:pointer" onclick="rateList({0},{1},\'{2}\')">' + '刷新' +
                '</h3>' +
                '<h3 class="panel-title pull-right badge" id="num{0}">' +
                '</h3>' +
                '</div>' +
                '<div class="table-responsive mailbox-messages" style="padding:10px">' +
                '<table class="table table-hover table-striped" id="processList{0}">' +
                '</table>' +
                '</div>' +
                '</div>' +
                '</div>';
            var i, len = ret.datas.length;
            $("#processDetailData").empty();
            var op = function (data, type, row) {
                return data.OpName == "加工"
                    ? '<button type="button" class="btn btn-info btn-xs" onclick="showProcessDetailModel(\'{0}\')">详情</button>'
                        .format(escape(data.ProcessData))
                    : "";
            }
            var o;
            var order = function (data, type, row) {
                return ++o;
            }
            var time = function (data, type, row) {
                return data.EndTime == "0001-01-01 00:00:00" ? "加工中" : data.EndTime;
            }
            var totalTime = function (data, type, row) {
                return codeTime(data.TotalTime);
            }
            var actualThickness = function (data, type, row) {
                return data.ActualThickness == "0" ? "" : data.ActualThickness;
            }
            var requirementMid = function (data, type, row) {
                return data.RequirementMid == "0" ? "" : data.RequirementMid;
            }
            var n = 0;
            var code = [];
            var row = $(rows.format(n)).clone();
            $("#processDetailData").append(row);
            for (i = 0; i < len; i++) {
                var processData = ret.datas[i];
                if (processData.ProcessLog.length != 0) {
                    if ($(row).children().length == 2) {
                        n++;
                        row = $(rows.format(n)).clone();
                        $("#processDetailData").append(row);
                    }
                    var option = $(panel.format(i, processData.DeviceId, escape(dayDate))).clone();
                    $("#row" + n).append(option);
                    var codeName = processData.ProcessLog[0].Code;
                    code.push(codeName);
                    $("#code" + i).prepend(codeName);
                    $("#num" + i).text("每日加工次数：" + processData.ProcessCount + "次");
                    o = 0;
                    $("#processList" + i).DataTable({
                        "destroy": true,
                        "paging": true,
                        "deferRender": false,
                        "bLengthChange": false,
                        "searching": false,
                        "language": { "url": "/content/datatables_language.json" },
                        "data": processData.ProcessLog,
                        "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
                        "iDisplayLength": 5, //默认显示的记录数  
                        "columns": [
                            { "data": null, "title": "序号", "render": order },
                            { "data": "OpName", "title": "操作" },
                            { "data": "StartTime", "title": "开始时间" },
                            { "data": null, "title": "结束时间", "render": time },
                            { "data": null, "title": "加工时间", "render": totalTime },
                            { "data": "ProductionProcessName", "title": "计划号" },
                            { "data": "FlowCardName", "title": "流程卡号" },
                            { "data": null, "title": "片厚", "render": actualThickness },
                            { "data": null, "title": "要求", "render": requirementMid },
                            { "data": "ProcessorName", "title": "加工人" },
                            { "data": null, "title": "工艺", "render": op }
                        ]
                    });
                }
            }
            var noProcess = deviceName.filter(function (item) {
                return code.indexOf(item) === -1;
            });
            $("#noProcessDetailData").empty();
            if (noProcess.length > 0) {
                $("#noProcessDetailData").removeClass("hidden");
                $("#noProcessDetailData").append('<label class="control-label">无加工详情设备:</label>');
                $.each(noProcess, function (index, item) {
                    $("#noProcessDetailData").append('<span style="margin-left:5px;color:red;font-weight:bold">' + item + '</span>');
                });
            } else {
                $("#noProcessDetailData").addClass("hidden");
            }

        });
}

function rateList(i, deviceId, time) {
    var opType = 506;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        DeviceId: deviceId,
        StartTime: time
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var processCount = ret.datas[0].ProcessCount + "次";
        var rData = ret.datas[0].ProcessLog;
        $("#num" + i).text("每日加工次数：" + processCount);
        var o = 0;
        var order = function (data, type, row) {
            return ++o;
        }
        var time = function (data, type, row) {
            return data.EndTime == "0001-01-01 00:00:00" ? "加工中" : data.EndTime;
        }
        var totalTime = function (data, type, row) {
            return codeTime(data.TotalTime);
        }
        var op = function (data, type, row) {
            return data.OpName == "加工"
                ? '<button type="button" class="btn btn-info btn-xs" onclick="showProcessDetailModel(\'{0}\')">详情</button>'
                .format(escape(data.ProcessData))
                : "";
        }
        var actualThickness = function (data, type, row) {
            return data.ActualThickness == "0" ? "" : data.ActualThickness;
        }
        var requirementMid = function (data, type, row) {
            return data.RequirementMid == "0" ? "" : data.RequirementMid;
        }
        $("#processList" + i).empty();
        $("#processList" + i).DataTable({
            "destroy": true,
            "paging": true,
            "deferRender": false,
            "bLengthChange": false,
            "searching": false,
            "language": { "url": "/content/datatables_language.json" },
            "data": rData,
            "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
            "iDisplayLength": 5, //默认显示的记录数  
            "columns": [
                { "data": null, "title": "序号", "render": order },
                { "data": "OpName", "title": "操作" },
                { "data": "StartTime", "title": "开始时间" },
                { "data": null, "title": "结束时间", "render": time },
                { "data": null, "title": "加工时间", "render": totalTime },
                { "data": "ProductionProcessName", "title": "计划号" },
                { "data": "FlowCardName", "title": "流程卡号" },
                { "data": null, "title": "片厚", "render": actualThickness },
                { "data": null, "title": "要求", "render": requirementMid },
                { "data": "ProcessorName", "title": "加工人" },
                { "data": null, "title": "工艺", "render": op }
            ]
        });
    });
}

function showProcessDetailModel(data) {
    data = unescape(data);
    data = JSON.parse(data);
    var rData = [];
    var i, len = Object.keys(data).length;
    for (i = 0; i < len; i++) {
        var v = Object.keys(data)[i];
        rData.push({
            forcing: data[v][0] + " : " + data[v][1],
            process: data[v][2] + " : " + data[v][3],
            stress: data[v][4],
            rotate: data[v][5]
        });
    }
    var o = 0;
    var order = function (data, type, row) {
        return ++o;
    }
    $("#processList").DataTable({
        "destroy": true,
        "paging": false,
        "deferRender": false,
        "bLengthChange": false,
        "info": false,
        "searching": false,
        "bSort": false,
        "language": { "url": "/content/datatables_language.json" },
        "data": rData,
        "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
        "iDisplayLength": 20, //默认显示的记录数  
        "columns": [
            { "data": null, "title": "NO", "render": order },
            { "data": "forcing", "title": "加压时间(分:秒)" },
            { "data": "process", "title": "工序时间(分:秒)" },
            { "data": "stress", "title": "设定压力(Kg)" },
            { "data": "rotate", "title": "下盘速度(rpm)" }
        ]
    });
    $("#processModel").modal("show");
}