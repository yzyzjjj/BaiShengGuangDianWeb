function pageReady() {
    $(".ms2").select2();
    $(".ms3").select2();
    $(".ms2").select2({
        allowClear: true,
        placeholder: "请选择"
    });
    getWorkShopList();
    $("#startDate,#selectDay").val(getDate()).datepicker('update');
    $("#endDate,#conDay").val(getDate()).datepicker('update');
    $(".month-picker").val(getNowMonth()).datepicker({
        format: "yyyy-mm",
        language: "zh-CN",
        autoclose: true,
        startView: 1,
        minViewMode: 1,
        maxViewMode: 2
    });
    $("#selectWeek,#conWeek").val(getWeek()).datepicker({
        format: "yyyy-mm-dd",
        language: "zh-CN",
        calendarWeeks: true,
        autoclose: true,
        todayBtn: "linked",
        onSelect: getWeeks
    }).on('hide', getWeeks);
    $(".week").on("focus", function() {
        $(".cw").eq(1).text("周数");
        $(".datepicker .datepicker-days .active").siblings(".cw").css("backgroundColor", "#ffff00");
        $(".datepicker .datepicker-days .active").siblings(".day").css("color","blue");
    });
    var tf = true;
    $("#selectWorkShop").on("select2:select", function (e) {
        $("#faultChart").empty();
        var v = $("#selectWorkShop").val();
        if (v.indexOf("所有车间") > -1) {
            $("#selectWorkShop").val("所有车间").trigger("change");
            if (tf) {
                tf = false;
                getDeviceList();
                $("#selectDeviceList").show();
            }
        } else {
            if (v.length > 1) {
                $("#selectDevice").empty();
                $("#selectDeviceList").hide();
            } else {
                getWorkShopDeviceList();
            }
            tf = true;
        }
    });
    $("#selectWorkShop").on("select2:unselect", function () {
        $("#faultChart").empty();
        var v = $("#selectWorkShop").val();
        if (v && v.length == 1) {
            getWorkShopDeviceList();
            $("#selectDeviceList").show();
        } else {
            $("#selectDevice").empty();
        }
        tf = true;
    });
    $(".fcHead button").click(function () {
        $(this).css("background", "green").siblings().css("background", "");
        var e = $(this).index();
        $(".fcBody").eq(e).removeClass("hidden").siblings().addClass("hidden");
    });
    $("#time").on("select2:select", function() {
        dataDetails();
        $("#first0").click();
    });
    $("#faultAppearType").on("select2:select", function () {
        appearDataList();
    });
    $("#faultServiceType").on("select2:select", function () {
        serviceDataList();
    });
}

var weekTimeOne = getDate();
var weekTimeTwo = getDate();
function getWeeks(e) {
    if (!isStrEmptyOrUndefined(e.date)) {
        var week = $.datepicker.iso8601Week(e.date);
        if ($(this).prop("id") == "selectWeek") {
            weekTimeOne = $("#selectWeek").val();
            $("#selectWeek").val(weekTimeOne.slice(0, weekTimeOne.indexOf("-")) + "第" + week + "周");
        } else {
            weekTimeTwo = $("#conWeek").val();
            $("#conWeek").val(weekTimeTwo.slice(0, weekTimeTwo.indexOf("-")) + "第" + week + "周");
        }
    }
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
        ret.datas.sort(function (x, y) {
            return x.SiteName > y.SiteName ? 1 : -1;
        });
        $("#selectWorkShop,#selectWorkShop1").empty();
        var option = '<option value = "{0}">{1}</option>';
        $("#selectWorkShop,#selectWorkShop1").append(option.format("所有车间", "所有车间"));
        for (var i = 0; i < ret.datas.length; i++) {
            var d = ret.datas[i];
            $("#selectWorkShop,#selectWorkShop1").append(option.format(d.SiteName, d.SiteName));
        }
    });
}

function getWorkShopDeviceList() {
    var workShop = $("#selectWorkShop").val();
    if (workShop == "所有车间") {
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
        workshopName: workShop.join()
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $("#selectDevice").empty();
        var option = '<option value = "{0},{1}">{1}</option>';
        for (var i = 0; i < ret.datas.length; i++) {
            var d = ret.datas[i];
            $("#selectDevice").append(option.format(d.Id, d.Code));
        }
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
            $("#selectDevice").empty();
            var option = '<option value="{0},{1}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var d = ret.datas[i];
                $("#selectDevice").append(option.format(d.Id, d.Code));
            }
        });
}

function getFaultChart() {
    var opType = 505;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var workShopName = $("#selectWorkShop").val();
    if (!isStrEmptyOrUndefined(workShopName) && workShopName.join() == "所有车间") {
        workShopName = "";
    }
    if (isStrEmptyOrUndefined(workShopName)) {
        workShopName = "";
    }
    var startTime = $("#startDate").val();
    var endTime = $("#endDate").val();
    if (compareDate(startTime, endTime)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }
    var compare;
    workShopName.length > 1 ? compare = 1 : compare = 0;
    if (!isStrEmptyOrUndefined(workShopName)) {
        workShopName = workShopName.join();
    }
    var workDeviceName = $("#selectDevice").val();
    var codeId = null;
    var codeName;
    if (!isStrEmptyOrUndefined(workDeviceName)) {
        compare = 2;
        workDeviceName = workDeviceName.join().split(",");
        codeId = [];
        codeName = [];
        for (var i = 0; i < workDeviceName.length; i++) {
            if (i % 2 == 0) {
                codeId.push(workDeviceName[i]);
            } else {
                codeName.push(workDeviceName[i]);
            }
        }
        codeId = codeId.join();
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        WorkshopName: workShopName,
        DeviceId: codeId,
        StartTime: startTime,
        EndTime: endTime,
        Compare: compare
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var time = [];
            var legend;
            var colors;
            var rData = [];
            var listName = [];
            var data = [];
            var key;
            var j, a, q, k;
            var timeData;
            var parData;
            var workShop = $("#selectWorkShop").val();
            if (workShop == "所有车间") {
                workShop = "";
            }
            if (compare != 2) {
                listName["设备总数"] = "AllDevice";
                listName["上报故障设备数量"] = "FaultDevice";
                listName["上报故障类型数量"] = "ReportFaultType";
                listName["上报故障总次数"] = "ReportCount";
                listName["上报故障故障率"] = "ReportFaultRate";
                listName["已确认故障"] = "Confirmed";
                listName["维修中故障"] = "Repairing";
                listName["维修故障类型数量"] = "RepairFaultType";
                listName["维修故障总次数"] = "RepairCount";
                legend = ["设备总数", "上报故障设备数量", "上报故障类型数量", "上报故障总次数", "上报故障故障率", "已确认故障", "维修中故障", "维修故障类型数量", "维修故障总次数"];
                colors = ["green", "red", "#ff00ff", "#cc3300", "#ff9900", "#9933ff", "blue", "#0099ff", "#660066"];
                for (key in listName) {
                    if (listName.hasOwnProperty(key)) {
                        data[key] = [];
                    }
                }
                ret.datas.sort(function (x, y) {
                    return x.Workshop < y.Workshop ? 1 : -1;
                });
                ret.datas.sort(function (x, y) {
                    return x.Date > y.Date ? 1 : -1;
                });
                for (j = 0; j < ret.datas.length; j++) {
                    timeData = ret.datas[j].Date.split(" ")[0];
                    time.push(timeData);
                    parData = ret.datas[j];
                    for (key in listName) {
                        if (listName.hasOwnProperty(key)) {
                            if (!isStrEmptyOrUndefined(workShop)) {
                                for (a = data[key].length % workShop.length; a < workShop.length; a++) {
                                    if (workShop[a] == parData.Workshop) {
                                        data[key].push(parData[listName[key]]);
                                        if (j == ret.datas.length - 1 && data[key].length % workShop.length != 0) {
                                            for (q = 0; q < data[key].length % workShop.length; q++) {
                                                data[key].push("x");
                                            }
                                            break;
                                        } else {
                                            break;
                                        }
                                    } else {
                                        data[key].push("x");
                                        if (key == "维修故障总次数" && a == workShop.length - 1) {
                                            j--;
                                        }
                                    }
                                }
                            } else {
                                data[key].push(parData[listName[key]]);
                            }
                        }
                    }
                }
                time = time.filter(function (item, index, array) {
                    return time.indexOf(item) === index;
                });
                for (key in listName) {
                    if (listName.hasOwnProperty(key)) {
                        if (!isStrEmptyOrUndefined(workShop)) {
                            for (k = 0; k < workShop.length; k++) {
                                rData.push({
                                    name: key,
                                    type: "line",
                                    data: data[key].filter(function (item, index, array) {
                                        return index % workShop.length == k;
                                    })
                                });
                            }
                        } else {
                            rData.push({
                                name: key,
                                type: "line",
                                data: data[key]
                            });
                        }
                    }
                }
            } else {
                listName["上报故障类型数量"] = "ReportFaultType";
                listName["该机台号上报故障类型数量"] = "CodeReportFaultType";
                listName["今日上报故障总次数"] = "ReportCount";
                listName["上报故障故障率"] = "ReportFaultRate";
                listName["维修故障类型数量"] = "RepairFaultType";
                listName["维修故障总次数"] = "RepairCount";
                legend = ["上报故障类型数量", "该机台号上报故障类型数量", "今日上报故障总次数", "上报故障故障率", "维修故障类型数量", "维修故障总次数"];
                colors = ["red", "#ff00ff", "#cc3300", "#ff9900", "#0099ff", "#660066"];
                for (key in listName) {
                    if (listName.hasOwnProperty(key)) {
                        data[key] = [];
                    }
                }
                ret.datas.sort(function (x, y) {
                    return parseInt(x.Code) < parseInt(y.Code) ? 1 : -1;
                });
                ret.datas.sort(function (x, y) {
                    return x.Date > y.Date ? 1 : -1;
                });
                codeId = codeId.split(",");
                for (j = 0; j < ret.datas.length; j++) {
                    timeData = ret.datas[j].Date.split(" ")[0];
                    time.push(timeData);
                    parData = ret.datas[j];
                    for (key in listName) {
                        if (listName.hasOwnProperty(key)) {
                            for (a = data[key].length % codeId.length; a < codeId.length; a++) {
                                if (codeId[a] == parData.Code) {
                                    data[key].push(parData[listName[key]]);
                                    if (j == ret.datas.length - 1 && data[key].length % codeId.length != 0) {
                                        for (q = 0; q < data[key].length % codeId.length; q++) {
                                            data[key].push("x");
                                        }
                                        break;
                                    } else {
                                        break;
                                    }
                                } else {
                                    data[key].push("x");
                                    if (key == "维修故障总次数" && a == codeId.length - 1) {
                                        j--;
                                    }
                                }
                            }
                        }
                    }
                }
                time = time.filter(function (item, index, array) {
                    return time.indexOf(item) === index;
                });
                for (key in listName) {
                    if (listName.hasOwnProperty(key)) {
                        for (k = 0; k < codeName.length; k++) {
                            rData.push({
                                name: key,
                                type: "line",
                                data: data[key].filter(function (item, index, array) {
                                    return index % codeName.length == k;
                                })
                            });
                        }
                    }
                }
            }
            $("#faultChart").empty();
            var charts = '<div id="chart" style="width: 100%; height: 500px">' + '</div>';
            $("#faultChart").append(charts);
            var myChart = echarts.init(document.getElementById("chart"));
            var option = {
                tooltip: {
                    trigger: "axis",
                    formatter: function (params, ticket, callback) {
                        var formatter1 = "{0}: {1}<br/>";
                        //var formatter2 = "{0}: {1}%<br/>";
                        var formatter = "";
                        for (var i = 0, l = params.length; i < l; i++) {
                            var xName = params[i].name;
                            if (compare != 2) {
                                if (!isStrEmptyOrUndefined(workShop) && workShop.length > 1) {
                                    //formatter += (params[i].seriesName == "上报故障故障率" ? formatter2 : formatter1).format(
                                    //    "<span style='color:blue'>" + workShop[i % workShop.length] + "</span>" + params[i].seriesName,
                                    //    params[i].value);
                                    formatter += formatter1.format(
                                        "<span style='color:#99ff00'>" +
                                        workShop[i % workShop.length] +
                                        "</span>" +
                                        "-" +
                                        params[i].seriesName,
                                        params[i].seriesName == "上报故障故障率" && typeof (params[i].value) == "number"
                                            ? ((params[i].value) * 100).toFixed(2) + "%"
                                            : params[i].value);
                                } else {
                                    formatter += formatter1.format(
                                        params[i].seriesName,
                                        params[i].seriesName == "上报故障故障率" && typeof (params[i].value) == "number"
                                            ? ((params[i].value) * 100).toFixed(2) + "%"
                                            : params[i].value);
                                }
                            } else {
                                if (codeName.length > 1) {
                                    formatter += formatter1.format(
                                        "<span style='color:#99ff00'>" +
                                        codeName[i % codeName.length] +
                                        "</span>" +
                                        "-" +
                                        params[i].seriesName,
                                        params[i].seriesName == "上报故障故障率" && typeof (params[i].value) == "number"
                                            ? ((params[i].value) * 100).toFixed(2) + "%"
                                            : params[i].value);
                                } else {
                                    formatter += formatter1.format(
                                        params[i].seriesName,
                                        params[i].seriesName == "上报故障故障率" && typeof (params[i].value) == "number"
                                            ? ((params[i].value) * 100).toFixed(2) + "%"
                                            : params[i].value);
                                }
                            }

                        }
                        return xName + "<br/>" + formatter + "<span style='color:#33ffff'>点击查看详情</span>";
                    }
                },
                xAxis: {
                    //triggerEvent: true,
                    data: time,
                    axisLine: {
                        onZero: false
                    }
                },
                yAxis: {
                    type: "value"
                },
                legend: {
                    data: legend
                },
                color: colors,
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
                        dataView: { readOnly: false },//数据视图
                        restore: {},
                        magicType: {
                            type: ['line', 'bar']
                        }
                    }
                }
            };
            myChart.setOption(option, true);
            $("#faultChart").resize(function () {
                myChart.resize();
            });
            myChart.getZr().on('click', function (params) {
                var pointInPixel = [params.offsetX, params.offsetY];
                if (myChart.containPixel('grid', pointInPixel)) {
                    var xIndex = myChart.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsetY])[0];
                    /*事件处理代码书写位置*/
                    var optionData = myChart.getOption();
                    var xTime = optionData.xAxis[0].data[xIndex];
                    $("#timeTitle").text(xTime);
                    var o, len = ret.datas.length;
                    var appear = [], service = [];
                    for (o = 0; o < len; o++) {
                        var reData = ret.datas[o];
                        if (reData.Date.indexOf(xTime) > -1) {
                            appear.push(reData.ReportSingleFaultType);
                            service.push(reData.RepairSingleFaultType);
                        }
                    }
                    var s, html;
                    var i, lens;
                    var tf1 = true;
                    var num;
                    var order = function (data, type, row) {
                        return ++num;
                    }
                    $("#reportSingleFaultType").empty();
                    $("#repairSingleFaultType").empty();
                    len = appear.length;
                    for (o = 0; o < len; o++) {
                        if (appear[o].length > 0) {
                            tf1 = false;
                            for (s = 0; s < appear[o].length; s++) {
                                html = '<div class="panel panel-primary" style="margin-top: 10px">' +
                                    '<div class="panel-heading">' +
                                    '<h3 class="panel-title">' +
                                    '<span id="faultTitle' + o + s + '">' +
                                    '</span>' +
                                    '<span class="badge" id="faultEm' + o + s + '" style="margin-left:10px">' +
                                    '</span>' +
                                    '</h3 >' +
                                    '</div>' +
                                    '<div class="row" style="text-align:center">' +
                                    '<div class="col-md-6">' +
                                    '<label class="control-label faultCss">设备故障详情</label>' +
                                    '<div class="table-responsive mailbox-messages" style="padding:10px">' +
                                    '<table class="table table-hover table-striped" id="codeName' + o + s + '">' +
                                    '</table>' +
                                    '</div>' +
                                    '</div>' +
                                    '<div class="col-md-6">' +
                                    '<label class="control-label faultCss">员工上报详情</label>' +
                                    '<div class="table-responsive mailbox-messages" style="padding:10px">' +
                                    '<table class="table table-hover table-striped" id="people' + o + s + '">' +
                                    '</table>' +
                                    '</div>' +
                                    '</div>' +
                                    '</div>' +
                                    '</div>';
                                $("#reportSingleFaultType").append(html);
                                $("#faultTitle" + o + s).text(appear[o][s].FaultName);
                                num = 0;
                                $("#codeName" + o + s).DataTable({
                                    "destroy": true,
                                    "paging": true,
                                    "deferRender": false,
                                    "bLengthChange": false,
                                    "searching": false,
                                    "language": { "url": "/content/datatables_language.json" },
                                    "data": appear[o][s].DeviceFaultTypes,
                                    "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
                                    "iDisplayLength": 5, //默认显示的记录数  
                                    "columns": [
                                        { "data": null, "title": "序号", "render": order },
                                        { "data": "Code", "title": "机台号" },
                                        { "data": "Count", "title": "故障次数" }
                                    ]
                                });
                                num = 0;
                                $("#people" + o + s).DataTable({
                                    "destroy": true,
                                    "paging": true,
                                    "deferRender": false,
                                    "bLengthChange": false,
                                    "searching": false,
                                    "language": { "url": "/content/datatables_language.json" },
                                    "data": appear[o][s].Operators,
                                    "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
                                    "iDisplayLength": 5, //默认显示的记录数  
                                    "columns": [
                                        { "data": null, "title": "序号", "render": order },
                                        { "data": "Name", "title": "上报人" },
                                        { "data": "Count", "title": "上报次数" }
                                    ]
                                });
                                lens = appear[o][s].Operators.length;
                                var faultCount = 0;
                                for (i = 0; i < lens; i++) {
                                    var operator = appear[o][s].Operators[i];
                                    faultCount += operator.Count;
                                }
                                $("#faultEm" + o + s).text(faultCount);
                            }
                        }
                    }
                    if (tf1) {
                        $("#reportSingleFaultType")
                            .html('<div style="padding: 15px; color: red; font-size: 18px;font-weight:bold">当天无故障记录</div>');
                    }
                    tf1 = true;
                    len = service.length;
                    for (o = 0; o < len; o++) {
                        if (service[o].length > 0) {
                            tf1 = false;
                            for (s = 0; s < service[o].length; s++) {
                                html = '<div class="panel panel-primary" style="margin-top: 10px">' +
                                    '<div class="panel-heading">' +
                                    '<h3 class="panel-title">' +
                                    '<span id="serviceTitle' + o + s + '">' +
                                    '</span>' +
                                    '<span class="badge" id="serviceEm' + o + s + '" style="margin-left:10px">' +
                                    '</span>' +
                                    '</h3 >' +
                                    '</div>' +
                                    '<div class="row" style="text-align:center">' +
                                    '<div class="col-md-6">' +
                                    '<label class="control-label faultCss">设备故障详情</label>' +
                                    '<div class="table-responsive mailbox-messages" style="padding:10px">' +
                                    '<table class="table table-hover table-striped" id="serviceName' + o + s + '">' +
                                    '</table>' +
                                    '</div>' +
                                    '</div>' +
                                    '<div class="col-md-6">' +
                                    '<label class="control-label faultCss">维修工详情</label>' +
                                    '<div class="table-responsive mailbox-messages" style="padding:10px">' +
                                    '<table class="table table-hover table-striped" id="servicePeople' + o + s + '">' +
                                    '</table>' +
                                    '</div>' +
                                    '</div>' +
                                    '</div>' +
                                    '</div>';
                                $("#repairSingleFaultType").append(html);
                                $("#serviceTitle" + o + s).text(service[o][s].FaultName);
                                num = 0;
                                $("#serviceName" + o + s).DataTable({
                                    "destroy": true,
                                    "paging": true,
                                    "deferRender": false,
                                    "bLengthChange": false,
                                    "searching": false,
                                    "language": { "url": "/content/datatables_language.json" },
                                    "data": service[o][s].DeviceFaultTypes,
                                    "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
                                    "iDisplayLength": 5, //默认显示的记录数  
                                    "columns": [
                                        { "data": null, "title": "序号", "render": order },
                                        { "data": "Code", "title": "机台号" },
                                        { "data": "Count", "title": "故障次数" }
                                    ]
                                });
                                num = 0;
                                var serviceTime = function (data, type, row) {
                                    return codeTime(data.Time);
                                }
                                $("#servicePeople" + o + s).DataTable({
                                    "destroy": true,
                                    "paging": true,
                                    "deferRender": false,
                                    "bLengthChange": false,
                                    "searching": false,
                                    "language": { "url": "/content/datatables_language.json" },
                                    "data": service[o][s].Operators,
                                    "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
                                    "iDisplayLength": 5, //默认显示的记录数  
                                    "columns": [
                                        { "data": null, "title": "序号", "render": order },
                                        { "data": "Name", "title": "维修人" },
                                        { "data": "Count", "title": "维修次数" },
                                        { "data": null, "title": "维修时间", "render": serviceTime }
                                    ]
                                });
                                lens = service[o][s].Operators.length;
                                var serviceCount = 0;
                                for (i = 0; i < lens; i++) {
                                    var operators = service[o][s].Operators[i];
                                    serviceCount += operators.Count;
                                }
                                $("#serviceEm" + o + s).text(serviceCount);
                            }
                        }
                    }
                    if (tf1) {
                        $("#repairSingleFaultType")
                            .html('<div style="padding: 15px; color: red; font-size: 18px;font-weight:bold">当天无维修记录</div>');
                    }
                    $("#first").trigger("click");
                    $(".faultCss").css("color", "#337ab7").css("fontSize", 15).css("marginTop", 10);
                    $("#faultModel").modal("show");
                }
            });
        });
}

var faultData;
var compare;
function contrastChart(par) {
    var opType = 505;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var workShopName = $("#selectWorkShop1").val();
    if (workShopName == "所有车间") {
        workShopName = "";
    }
    var title;
    var oneTime, twoTime;
    switch (par) {
        case 0:
            compare = 3;
            title = "日数据对比";
            oneTime = $("#selectDay").val();
            twoTime = $("#conDay").val();
            break;
        case 1:
            compare = 4;
            title = "周数据对比";
            oneTime = weekTimeOne;
            twoTime = weekTimeTwo;
            break;
        case 2:
            compare = 5;
            title = "月数据对比";
            oneTime = $("#selectMonth").val();
            twoTime = $("#conMonth").val();
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        WorkshopName: workShopName,
        StartTime: oneTime,
        EndTime: twoTime,
        Compare: compare
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        faultData = ret.datas;
        var time = [], yData = [];
        var i, len = ret.datas.length;
        $("#time").empty();
        var timeOption = '<option value="{0}">{1}</option>';
        for (i = 0; i < len; i++) {
            var timeData = ret.datas[i].Date.split(" ")[0];
            switch (compare) {
                case 3:
                    time.push(timeData);
                    break;
                case 4:
                    timeData = $(".week").eq(i).val();
                    time.push(timeData);
                    break;
                case 5:
                    timeData = timeData.slice(0, timeData.indexOf("-") + 3);
                    time.push(timeData);
            }
            compare == 4
                ? $("#time").append(timeOption.format(ret.datas[i].Date.split(" ")[0], timeData))
                : $("#time").append(timeOption.format(timeData, timeData));
            var data = ret.datas[i];
            var yList = {
                name: timeData,
                type: 'bar',
                data: [data.RepairCount, data.RepairFaultType, data.Repairing, data.Confirmed, data.ReportFaultRate, data.ReportCount, data.ReportFaultType, data.FaultDevice, data.AllDevice]
            }
            yData.push(yList);
            if (len == 2 && ret.datas[0].Date == ret.datas[1].Date) {
                break;
            }
        }
        $("#contrastChart").empty();
        var charts = '<div id="chart1" style="width: 100%; height: 550px">' + '</div>';
        $("#contrastChart").append(charts);
        var myChart = echarts.init(document.getElementById("chart1"));
        var option = {
            title: {
                text: title
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params, ticket, callback) {
                    var formatter1 = "{0}: {1}<br/>";
                    var formatter = "";
                    for (var i = 0, l = params.length; i < l; i++) {
                        var xName = params[i].name;
                        formatter += formatter1.format(
                            params[i].seriesName,
                            params[i].name == "上报故障故障率" && typeof (params[i].value) == "number"
                                ? ((params[i].value) * 100).toFixed(2) + "%"
                                : params[i].value);
                    }
                    return xName + "<br/>" + formatter;
                },
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: time
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value'
            },
            yAxis: {
                type: 'category',
                data: ["维修故障总次数", "维修故障类型数量", "维修中故障", "已确认故障", "上报故障故障率", "上报故障总次数", "上报故障类型数量", "上报故障设备数量", "设备总数"]
            },
            color: ["#9900ff", "#3333ff"],
            series: yData
        };
        myChart.setOption(option, true);
        $("#contrastChart").resize(function () {
            myChart.resize();
        });
        $("#bodyRight").css("display","none");
        $("#bodyRight").fadeIn(1000);
        dataDetails();
        $("#first0").click();
    });
}

var appearData, serviceData;
function dataDetails() {
    $("#faultAppearType").empty();
    $("#faultServiceType").empty();
    var faultAppearType = '<option value="{0}">{0}</option>';
    var faultServiceType = '<option value="{0}">{0}</option>';
    var i, len = faultData.length;
    var time = $("#time").val();
    for (i = 0; i < len; i++) {
        if (faultData[i].Date.indexOf(time) > -1) {
            appearData = faultData[i].ReportSingleFaultType;
            serviceData = faultData[i].RepairSingleFaultType;
            if (appearData.length == 0) {
                $("#faultAppear0").addClass("hidden").siblings().removeClass("hidden");
            } else {
                $("#faultAppear0").removeClass("hidden").siblings().addClass("hidden");
                $.each(appearData, function (index, item) {
                    $("#faultAppearType").append(faultAppearType.format(item.FaultName));
                });
            }
            if (serviceData.length == 0) {
                $("#faultService0").addClass("hidden").siblings().removeClass("hidden");
            } else {
                $("#faultService0").removeClass("hidden").siblings().addClass("hidden");
                $.each(serviceData, function (index, item) {
                    $("#faultServiceType").append(faultServiceType.format(item.FaultName));
                });
            }
        }
        if (len == 2 && faultData[0].Date == faultData[1].Date) {
            break;
        }
    }
    appearDataList();
    serviceDataList();
}

function appearDataList() {
    var num;
    var order = function (data, type, row) {
        return ++num;
    }
    var i, len = appearData.length;
    var name = $("#faultAppearType").val();
    for (i = 0; i < len; i++) {
        if (appearData[i].FaultName == name) {
            num = 0;
            $("#faultAppear1").DataTable({
                "destroy": true,
                "paging": true,
                "deferRender": false,
                "bLengthChange": false,
                "searching": false,
                "language": { "url": "/content/datatables_language.json" },
                "data": appearData[i].DeviceFaultTypes,
                "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
                "iDisplayLength": 5, //默认显示的记录数  
                "columns": [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Code", "title": "机台号" },
                    { "data": "Count", "title": "故障次数" }
                ]
            });
            num = 0;
            $("#faultAppear2").DataTable({
                "destroy": true,
                "paging": true,
                "deferRender": false,
                "bLengthChange": false,
                "searching": false,
                "language": { "url": "/content/datatables_language.json" },
                "data": appearData[i].Operators,
                "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
                "iDisplayLength": 5, //默认显示的记录数  
                "columns": [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Name", "title": "上报人" },
                    { "data": "Count", "title": "上报次数" }
                ]
            });
        }
    }
}

function serviceDataList() {
    var num;
    var order = function (data, type, row) {
        return ++num;
    }
    var i, len = serviceData.length;
    var name = $("#faultServiceType").val();
    for (i = 0; i < len; i++) {
        if (serviceData[i].FaultName == name) {
            num = 0;
            $("#faultService1").DataTable({
                "destroy": true,
                "paging": true,
                "deferRender": false,
                "bLengthChange": false,
                "searching": false,
                "language": { "url": "/content/datatables_language.json" },
                "data": serviceData[i].DeviceFaultTypes,
                "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
                "iDisplayLength": 5, //默认显示的记录数  
                "columns": [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Code", "title": "机台号" },
                    { "data": "Count", "title": "故障次数" }
                ]
            });
            num = 0;
            var serviceTime = function (data, type, row) {
                return codeTime(data.Time);
            }
            $("#faultService2").DataTable({
                "destroy": true,
                "paging": true,
                "deferRender": false,
                "bLengthChange": false,
                "searching": false,
                "language": { "url": "/content/datatables_language.json" },
                "data": serviceData[i].Operators,
                "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
                "iDisplayLength": 5, //默认显示的记录数  
                "columns": [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Name", "title": "维修人" },
                    { "data": "Count", "title": "维修次数" },
                    { "data": null, "title": "维修时间", "render": serviceTime }
                ]
            });
        }
    }
}