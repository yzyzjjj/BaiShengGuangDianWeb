function pageReady() {
    $(".ms2").select2();
    $(".ms3").select2();
    $("#selectDevice,#selectDeviceDev").select2({
        allowClear: true,
        placeholder: "请选择"
    });
    $("#selectWorkShop1").select2({
        allowClear: true,
        placeholder: "请选择"
    });
    getWorkShopList();
    getDeviceList(1);
    getDeviceList(2);
    $("#startDate,#endDate").val(getDate()).datepicker('update');
    $("#selectDay,#conDay").val(getDate()).datepicker('update');
    $("#startDate1,#endDate1").val(getDate()).datepicker('update');
    $("#startDateDev,#endDateDev").val(getDate()).datepicker('update');
    $("#startDayTime,#endDayTime").val(getDate()).datepicker('update');
    var hourTime = new Date().format("hh-00-00");
    $("#startTime").val(hourTime).timepicker('setTime', hourTime);
    $("#endTime").val(hourTime).timepicker('setTime', hourTime);
    $("#startTime").one("focus", function () {
        var timeTop = $(".bootstrap-timepicker-widget")[0];
        var time = $(timeTop).find("table tbody tr");
        $(time[0]).find("td")[2].remove();
        $(time[0]).find("td")[3].remove();
        $(time[1]).find("td input")[1].setAttribute("disabled", "disabled");
        $(time[1]).find("td input")[2].setAttribute("disabled", "disabled");
        $(time[2]).find("td")[2].remove();
        $(time[2]).find("td")[3].remove();
    });
    $("#endTime").one("focus", function () {
        var timeTop = $(".bootstrap-timepicker-widget")[0];
        var time = $(timeTop).find("table tbody tr");
        $(time[0]).find("td")[2].remove();
        $(time[0]).find("td")[3].remove();
        $(time[1]).find("td input")[1].setAttribute("disabled", "disabled");
        $(time[1]).find("td input")[2].setAttribute("disabled", "disabled");
        $(time[2]).find("td")[2].remove();
        $(time[2]).find("td")[3].remove();
    });
    $(".form_month").val(getNowMonth()).datepicker("update");
    $(".week").val(getWeek()).datepicker({
        format: "yyyy-mm-dd",
        language: "zh-CN",
        calendarWeeks: true,
        autoclose: true,
        todayBtn: "linked",
        onSelect: getWeeks
    }).on('hide', getWeeks);
    var tf = true;
    $(".week").on("focus", function () {
        $(".cw").eq(1).text("周数");
        $(".datepicker .datepicker-days .active").siblings(".cw").css("backgroundColor", "#ffff00");
        $(".datepicker .datepicker-days .active").siblings(".day").css("color", "blue");
    });
    $("#selectWorkShop").on("select2:select", function () {
        getWorkShopDeviceList();
        $("#par .parCk").removeClass("hidden");
        tf = true;
    });
    $("#selectWorkShopDev").on("select2:select", function () {
        getWorkShopDevList();
    });
    $(".icb_minimal").iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '20%' // optional
    });
    $("#par input,#par span").css("verticalAlign", "middle");
    $("#shopPar input,#shopPar span").css("verticalAlign", "middle");
    $("#devPar input,#devPar span").css("verticalAlign", "middle");
    $("#selectDevice").on("change", function () {
        var v = $(this).val();
        if (!isStrEmptyOrUndefined(v)) {
            $("#par .parCk").addClass("hidden");
            if (tf) {
                tf = false;
                $("#par label").find(".icb_minimal").iCheck('uncheck');
            }
        } else {
            tf = true;
            $("#par .parCk").removeClass("hidden");
            $("#par label").find(".icb_minimal").iCheck('uncheck');
        }
    });
    $("#dayFaultAppearType").on("select2:select", function () {
        dayAppChart();
    });
    //$("#dayFaultServiceType").on("select2:select", function () {
    //    daySerChart();
    //});
    $("#weekFaultAppearType").on("select2:select", function () {
        weekAppChart();
    });
    //$("#weekFaultServiceType").on("select2:select", function () {
    //    weekSerChart();
    //});
    $("#monthFaultAppearType").on("select2:select", function () {
        monthAppChart();
    });
    //$("#monthFaultServiceType").on("select2:select", function () {
    //    monthSerChart();
    //});
    $("#shopFaultAppearType").on("select2:select", function () {
        shopAppChart();
    });
    //$("#shopFaultServiceType").on("select2:select", function () {
    //    shopSerChart();
    //});
    $("#devFaultAppearType").on("select2:select", function () {
        devAppChart();
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
        $("#selectWorkShop,#selectWorkShopDay,#selectWorkShopWeek,#selectWorkShopMonth,#selectWorkShop1,#selectWorkShopDev,#selectWorkShopTime").empty();
        var option = '<option value = "{0}">{1}</option>';
        $("#selectWorkShop,#selectWorkShopDay,#selectWorkShopWeek,#selectWorkShopMonth,#selectWorkShopDev,#selectWorkShopTime").append(option.format("所有车间", "所有车间"));
        for (var i = 0; i < ret.datas.length; i++) {
            var d = ret.datas[i];
            $("#selectWorkShop,#selectWorkShopDay,#selectWorkShopWeek,#selectWorkShopMonth,#selectWorkShop1,#selectWorkShopDev,#selectWorkShopTime").append(option.format(d.SiteName, d.SiteName));
        }
    });
}

function getWorkShopDeviceList() {
    var workShop = $("#selectWorkShop").val();
    if (workShop == "所有车间") {
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
        var option = '<option value="{0}">{0}</option>';
        $("#selectDevice").append('<option></option>');
        for (var i = 0; i < ret.datas.length; i++) {
            var d = ret.datas[i];
            $("#selectDevice").append(option.format(d.Code));
        }
    });
}

function getWorkShopDevList() {
    var workShop = $("#selectWorkShopDev").val();
    if (workShop == "所有车间") {
        $("#selectDeviceDev").empty();
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
        $("#selectDeviceDev").empty();
        var option = '<option value="{0}">{0}</option>';
        $("#selectDeviceDev").append('<option></option>');
        for (var i = 0; i < ret.datas.length; i++) {
            var d = ret.datas[i];
            $("#selectDeviceDev").append(option.format(d.Code));
        }
    });
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
            var option, i, d, len = ret.datas.length;
            if (par == 1) {
                $("#selectDevice").empty();
                option = '<option value="{0}">{0}</option>';
                $("#selectDevice").append('<option></option>');
                for (i = 0; i < len; i++) {
                    d = ret.datas[i];
                    $("#selectDevice").append(option.format(d.Code));
                }
            } else {
                $("#selectDeviceDev").empty();
                option = '<option value="{0}">{0}</option>';
                $("#selectDeviceDev").append('<option></option>');
                for (i = 0; i < len; i++) {
                    d = ret.datas[i];
                    $("#selectDeviceDev").append(option.format(d.Code));
                }
            }
        });
}

var FaultsData;
function getFaultChart() {
    var opType = 505;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    if (!$("#par label").find(".icb_minimal").is(":checked")) {
        layer.msg("请选择参数");
        return;
    }
    var workShopName = $("#selectWorkShop").val();
    if (workShopName == "所有车间") {
        workShopName = "";
    }
    var compare = 0;
    var startTime = $("#startDate").val();
    var endTime = $("#endDate").val();
    if (exceedTime(startTime) || exceedTime(endTime)) {
        layer.msg("所选时间不能大于当前时间");
        return;
    }
    if (compareDate(startTime, endTime)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }
    var workDeviceName = $("#selectDevice").val();
    if (!isStrEmptyOrUndefined(workDeviceName)) {
        compare = 2;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        WorkshopName: workShopName,
        DeviceId: workDeviceName,
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
            FaultsData = ret.datas;
            var i, len = $("#par label").find(".icb_minimal").length;
            var count = -1;
            $("#faultChart").empty();
            for (i = 0; i < len; i++) {
                var ick = $("#par label").find(".icb_minimal")[i];
                var span = $("#par label")[i];
                if ($(ick).is(":checked")) {
                    count++;
                    var time = [];
                    var rData = [];
                    var data = [];
                    var key;
                    var j;
                    var timeData;
                    var parData;
                    var listName = [];
                    var legend;
                    listName[$(span).text()] = $(ick).val();
                    legend = $(span).text();

                    for (key in listName) {
                        if (listName.hasOwnProperty(key)) {
                            data[key] = [];
                        }
                    }
                    for (j = 0; j < ret.datas.length; j++) {
                        timeData = ret.datas[j].Date.split(" ")[0];
                        time.push(timeData);
                        parData = ret.datas[j];
                        for (key in listName) {
                            if (listName.hasOwnProperty(key)) {
                                data[key].push(parData[listName[key]]);
                            }
                        }
                    }
                    var num = 0;
                    for (key in listName) {
                        if (listName.hasOwnProperty(key)) {
                            rData.push({
                                name: key,
                                type: "line",
                                data: data[key]
                            });
                            if (key == "上报故障总次数") {
                                $.each(data[key], function (index, item) {
                                    return num += item;
                                });
                                legend = legend + "(总:" + num + "次)";
                            }
                        }
                    }
                    var charts = '<div id="chart' + count + '" style="width: 100%; height: 500px"></div>';
                    $("#faultChart").append(charts);
                    var myChart = echarts.init(document.getElementById("chart" + count));
                    var option = {
                        title: {
                            text: legend
                        },
                        tooltip: {
                            trigger: "axis",
                            formatter: function (params, ticket, callback) {
                                var formatter1 = "{0}: {1}<br/>";
                                var formatter = "";
                                for (var p = 0, l = params.length; p < l; p++) {
                                    var xName = params[p].name;
                                    formatter += formatter1.format(
                                        params[p].seriesName,
                                        params[p].seriesName == "上报故障故障率" && typeof (params[p].value) == "number"
                                            ? ((params[p].value) * 100).toFixed(2) + "%"
                                            : params[p].value);

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
                        yAxis: {
                            type: "value"
                        },
                        color: ["green"],
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
                                restore: {},
                                magicType: {
                                    type: ['line', 'bar']
                                }
                            }
                        }
                    };
                    myChart.setOption(option, true);
                }
            }
            $("#faultChart").resize(function () {
                len = $("#faultChart").children().length;
                for (i = 0; i < len; i++) {
                    echarts.init(document.getElementById("chart" + i)).resize();
                }
            });
            $("#appSer").css("display", "none");
            $("#appSer").fadeIn(1000);
            getFaultAppChart();
            //myChart.getZr().on('click', function (params) {
            //    var pointInPixel = [params.offsetX, params.offsetY];
            //    if (myChart.containPixel('grid', pointInPixel)) {
            //        var xIndex = myChart.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsetY])[0];
            //        /*事件处理代码书写位置*/
            //        var optionData = myChart.getOption();
            //        var xTime = optionData.xAxis[0].data[xIndex];
            //        $("#timeTitle").text(xTime);
            //        var o, len = ret.datas.length;
            //        var appear = [], service = [];
            //        for (o = 0; o < len; o++) {
            //            var reData = ret.datas[o];
            //            if (reData.Date.indexOf(xTime) > -1) {
            //                appear.push(reData.ReportSingleFaultType);
            //                service.push(reData.RepairSingleFaultType);
            //            }
            //        }
            //        var s, html;
            //        var i, lens;
            //        var tf1 = true;
            //        var num;
            //        var order = function (data, type, row) {
            //            return ++num;
            //        }
            //        $("#reportSingleFaultType").empty();
            //        $("#repairSingleFaultType").empty();
            //        len = appear.length;
            //        for (o = 0; o < len; o++) {
            //            if (appear[o].length > 0) {
            //                tf1 = false;
            //                for (s = 0; s < appear[o].length; s++) {
            //                    html = '<div class="panel panel-primary" style="margin-top: 10px">' +
            //                        '<div class="panel-heading">' +
            //                        '<h3 class="panel-title">' +
            //                        '<span id="faultTitle' + o + s + '">' +
            //                        '</span>' +
            //                        '<span class="badge" id="faultEm' + o + s + '" style="margin-left:10px">' +
            //                        '</span>' +
            //                        '</h3 >' +
            //                        '</div>' +
            //                        '<div class="row" style="text-align:center">' +
            //                        '<div class="col-md-6">' +
            //                        '<label class="control-label faultCss">设备故障详情</label>' +
            //                        '<div class="table-responsive mailbox-messages" style="padding:10px">' +
            //                        '<table class="table table-hover table-striped" id="codeName' + o + s + '">' +
            //                        '</table>' +
            //                        '</div>' +
            //                        '</div>' +
            //                        '<div class="col-md-6">' +
            //                        '<label class="control-label faultCss">员工上报详情</label>' +
            //                        '<div class="table-responsive mailbox-messages" style="padding:10px">' +
            //                        '<table class="table table-hover table-striped" id="people' + o + s + '">' +
            //                        '</table>' +
            //                        '</div>' +
            //                        '</div>' +
            //                        '</div>' +
            //                        '</div>';
            //                    $("#reportSingleFaultType").append(html);
            //                    $("#faultTitle" + o + s).text(appear[o][s].FaultName);
            //                    num = 0;
            //                    $("#codeName" + o + s).DataTable({
            //                        "destroy": true,
            //                        "paging": true,
            //                        "deferRender": false,
            //                        "bLengthChange": false,
            //                        "searching": false,
            //                        "language": { "url": "/content/datatables_language.json" },
            //                        "data": appear[o][s].DeviceFaultTypes,
            //                        "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
            //                        "iDisplayLength": 5, //默认显示的记录数  
            //                        "columns": [
            //                            { "data": null, "title": "序号", "render": order },
            //                            { "data": "Code", "title": "机台号" },
            //                            { "data": "Count", "title": "故障次数" }
            //                        ]
            //                    });
            //                    num = 0;
            //                    $("#people" + o + s).DataTable({
            //                        "destroy": true,
            //                        "paging": true,
            //                        "deferRender": false,
            //                        "bLengthChange": false,
            //                        "searching": false,
            //                        "language": { "url": "/content/datatables_language.json" },
            //                        "data": appear[o][s].Operators,
            //                        "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
            //                        "iDisplayLength": 5, //默认显示的记录数  
            //                        "columns": [
            //                            { "data": null, "title": "序号", "render": order },
            //                            { "data": "Name", "title": "上报人" },
            //                            { "data": "Count", "title": "上报次数" }
            //                        ]
            //                    });
            //                    lens = appear[o][s].Operators.length;
            //                    var faultCount = 0;
            //                    for (i = 0; i < lens; i++) {
            //                        var operator = appear[o][s].Operators[i];
            //                        faultCount += operator.Count;
            //                    }
            //                    $("#faultEm" + o + s).text(faultCount);
            //                }
            //            }
            //        }
            //        if (tf1) {
            //            $("#reportSingleFaultType")
            //                .html('<div style="padding: 15px; color: red; font-size: 18px;font-weight:bold">当天无故障记录</div>');
            //        }
            //        tf1 = true;
            //        len = service.length;
            //        for (o = 0; o < len; o++) {
            //            if (service[o].length > 0) {
            //                tf1 = false;
            //                for (s = 0; s < service[o].length; s++) {
            //                    html = '<div class="panel panel-primary" style="margin-top: 10px">' +
            //                        '<div class="panel-heading">' +
            //                        '<h3 class="panel-title">' +
            //                        '<span id="serviceTitle' + o + s + '">' +
            //                        '</span>' +
            //                        '<span class="badge" id="serviceEm' + o + s + '" style="margin-left:10px">' +
            //                        '</span>' +
            //                        '</h3 >' +
            //                        '</div>' +
            //                        '<div class="row" style="text-align:center">' +
            //                        '<div class="col-md-6">' +
            //                        '<label class="control-label faultCss">设备故障详情</label>' +
            //                        '<div class="table-responsive mailbox-messages" style="padding:10px">' +
            //                        '<table class="table table-hover table-striped" id="serviceName' + o + s + '">' +
            //                        '</table>' +
            //                        '</div>' +
            //                        '</div>' +
            //                        '<div class="col-md-6">' +
            //                        '<label class="control-label faultCss">维修工详情</label>' +
            //                        '<div class="table-responsive mailbox-messages" style="padding:10px">' +
            //                        '<table class="table table-hover table-striped" id="servicePeople' + o + s + '">' +
            //                        '</table>' +
            //                        '</div>' +
            //                        '</div>' +
            //                        '</div>' +
            //                        '</div>';
            //                    $("#repairSingleFaultType").append(html);
            //                    $("#serviceTitle" + o + s).text(service[o][s].FaultName);
            //                    num = 0;
            //                    $("#serviceName" + o + s).DataTable({
            //                        "destroy": true,
            //                        "paging": true,
            //                        "deferRender": false,
            //                        "bLengthChange": false,
            //                        "searching": false,
            //                        "language": { "url": "/content/datatables_language.json" },
            //                        "data": service[o][s].DeviceFaultTypes,
            //                        "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
            //                        "iDisplayLength": 5, //默认显示的记录数  
            //                        "columns": [
            //                            { "data": null, "title": "序号", "render": order },
            //                            { "data": "Code", "title": "机台号" },
            //                            { "data": "Count", "title": "故障次数" }
            //                        ]
            //                    });
            //                    num = 0;
            //                    var serviceTime = function (data, type, row) {
            //                        return codeTime(data.Time);
            //                    }
            //                    $("#servicePeople" + o + s).DataTable({
            //                        "destroy": true,
            //                        "paging": true,
            //                        "deferRender": false,
            //                        "bLengthChange": false,
            //                        "searching": false,
            //                        "language": { "url": "/content/datatables_language.json" },
            //                        "data": service[o][s].Operators,
            //                        "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
            //                        "iDisplayLength": 5, //默认显示的记录数  
            //                        "columns": [
            //                            { "data": null, "title": "序号", "render": order },
            //                            { "data": "Name", "title": "维修人" },
            //                            { "data": "Count", "title": "维修次数" },
            //                            { "data": null, "title": "维修时间", "render": serviceTime }
            //                        ]
            //                    });
            //                    lens = service[o][s].Operators.length;
            //                    var serviceCount = 0;
            //                    for (i = 0; i < lens; i++) {
            //                        var operators = service[o][s].Operators[i];
            //                        serviceCount += operators.Count;
            //                    }
            //                    $("#serviceEm" + o + s).text(serviceCount);
            //                }
            //            }
            //        }
            //        if (tf1) {
            //            $("#repairSingleFaultType")
            //                .html('<div style="padding: 15px; color: red; font-size: 18px;font-weight:bold">当天无维修记录</div>');
            //        }
            //        $("#first").trigger("click");
            //        $(".faultCss").css("color", "#337ab7").css("fontSize", 15).css("marginTop", 10);
            //        $("#faultModel").modal("show");
            //    }
            //});
        });
}

function getFaultAppChart() {
    var data = FaultsData;
    var i, len = data.length;
    var time = [];
    var app = [];
    for (i = 0; i < len; i++) {
        var timeData = FaultsData[i].Date.split(" ")[0];
        time.push(timeData);
        var report = data[i].ReportSingleFaultType;
        if (report.length != 0) {
            $.each(report, function (index, item) {
                app.push(item.FaultName);
            });
        }
    }
    if (app.length == 0) {
        $("#faults").addClass("hidden").siblings().removeClass("hidden");
    } else {
        $("#faults").removeClass("hidden").siblings().addClass("hidden");
        app = app.filter(function (item, index) {
            return app.indexOf(item) == index;
        });
        var rData = [];
        var tf = true;
        $.each(app, function (index, item) {
            var appCount = [];
            for (i = 0; i < len; i++) {
                var appList = data[i].ReportSingleFaultType;
                if (appList.length != 0) {
                    $.each(appList, function (x, e) {
                        if (item == e.FaultName) {
                            appCount.push(e.Count);
                            tf = false;
                        }
                    });
                    if (tf) {
                        appCount.push(0);
                    }
                    tf = true;
                } else {
                    appCount.push(0);
                }
            }
            rData.push({
                name: item,
                type: "line",
                data: appCount
            });
        });
        $("#faultAppChart").empty();
        var charts = '<div id="appChart" style="width: 100%; height: 500px"></div>';
        $("#faultAppChart").append(charts);
        var myChart = echarts.init(document.getElementById("appChart"));
        var option = {
            tooltip: {
                trigger: "axis"
            },
            xAxis: {
                data: time,
                axisLine: {
                    onZero: false
                }
            },
            yAxis: {
                name: "故障次数",
                type: "value"
            },
            legend: {
                data: app
            },
            color: ["green", "red", "#ff00ff", "#cc3300", "#ff9900", "#9933ff", "blue", "#0099ff", "#660066"],
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
                    restore: {},
                    magicType: {
                        type: ['line', 'bar']
                    }
                }
            }
        };
        myChart.setOption(option, true);
        $("#faultAppChart").resize(function () {
            myChart.resize();
        });
    }
}

//function getFaultSerChart() {
//    var serLegend = $("#faultSer").val();
//    var i, len = FaultsData.length;
//    var time = [];
//    var serCount = [];
//    var tf = true;
//    for (i = 0; i < len; i++) {
//        var timeData = FaultsData[i].Date.split(" ")[0];
//        time.push(timeData);
//        var serList = FaultsData[i].RepairSingleFaultType;
//        if (serList.length != 0) {
//            $.each(serList, function (index, item) {
//                if (item.FaultName == serLegend) {
//                    serCount.push(item.Count);
//                    tf = false;
//                }
//            });
//            if (tf) {
//                serCount.push(0);
//            }
//            tf = true;
//        } else {
//            serCount.push(0);
//        }
//    }
//    $("#faultSerChart").empty();
//    var charts = '<div id="serChart" style="width: 100%; height: 500px"></div>';
//    $("#faultSerChart").append(charts);
//    var myChart = echarts.init(document.getElementById("serChart"));
//    var option = {
//        title: {
//            text: serLegend
//        },
//        tooltip: {
//            trigger: "axis"
//        },
//        xAxis: {
//            data: time,
//            axisLine: {
//                onZero: false
//            }
//        },
//        yAxis: {
//            name: "维修次数",
//            type: "value"
//        },
//        legend: {
//            data: [serLegend]
//        },
//        series: {
//            name: serLegend,
//            type: "line",
//            data: serCount
//        },
//        dataZoom: [{
//            type: "slider",
//            start: 0,
//            end: 100
//        },
//        {
//            type: "inside",
//            start: 0,
//            end: 100
//        }],
//        toolbox: {
//            top: 20,
//            left: "center",
//            feature: {
//                dataZoom: {
//                    yAxisIndex: "none"
//                },
//                restore: {},
//                magicType: {
//                    type: ['line', 'bar']
//                }
//            }
//        }
//    };
//    myChart.setOption(option, true);
//    $("#faultSerChart").resize(function () {
//        myChart.resize();
//    });
//}
var dayData;
function dayChart() {
    var opType = 505;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var workShopName = $("#selectWorkShop1").val();
    if (workShopName == "所有车间") {
        workShopName = "";
    }
    var oneTime = $("#selectDay").val();
    var twoTime = $("#conDay").val();
    if (exceedTime(oneTime) || exceedTime(twoTime)) {
        layer.msg("所选时间不能大于当前时间");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        WorkshopName: workShopName,
        StartTime: oneTime,
        EndTime: twoTime,
        Compare: 3
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        dayData = ret.datas;
        var time = [], yData = [];
        var i, len = ret.datas.length;
        for (i = 0; i < len; i++) {
            var timeData = ret.datas[i].Date.split(" ")[0];
            time.push(timeData);
            var data = ret.datas[i];
            var yList = {
                name: timeData,
                type: 'bar',
                data: [data.RepairCount, data.RepairFaultType, data.ReportFaultRate, data.ReportCount, data.ReportFaultType, data.FaultDevice]
            }
            yData.push(yList);
            if (len == 2 && ret.datas[0].Date == ret.datas[1].Date) {
                break;
            }
        }
        $("#dayConChart").empty();
        var charts = '<div id="dayChart" style="width: 100%; height: 550px">' + '</div>';
        $("#dayConChart").append(charts);
        var myChart = echarts.init(document.getElementById("dayChart"));
        var option = {
            title: {
                text: "日数据对比"
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
                data: ["维修故障总次数", "维修故障类型数量", "上报故障故障率", "上报故障总次数", "上报故障类型数量", "上报故障设备数量"]
            },
            color: ["#9900ff", "#3333ff"],
            series: yData
        };
        myChart.setOption(option, true);
        $("#dayConChart").resize(function () {
            myChart.resize();
        });
        $("#dayRight").css("display", "none");
        $("#dayRight").fadeIn(1000);
        dayDataDetails();
        //$("#dayFirst").click();
    });
}

function dayDataDetails() {
    $("#dayFaultAppearType").empty();
    //$("#dayFaultServiceType").empty();
    var dayFaultAppearType = '<option value="{0}">{0}</option>';
    //var dayFaultServiceType = '<option value="{0}">{0}</option>';
    var i, len = dayData.length;
    var dayApp = [];
    //var daySer = [];
    for (i = 0; i < len; i++) {
        var appearData = dayData[i].ReportSingleFaultType;
        //var serviceData = dayData[i].RepairSingleFaultType;
        if (appearData.length != 0) {
            $.each(appearData, function (index, item) {
                dayApp.push(item.FaultName);
            });
        }
        //if (serviceData.length != 0) {
        //    $.each(serviceData, function (index, item) {
        //        daySer.push(item.FaultName);
        //    });
        //}
        if (len == 2 && dayData[0].Date == dayData[1].Date) {
            break;
        }
    }
    if (dayApp.length != 0) {
        dayApp = dayApp.filter(function (item, index) {
            return dayApp.indexOf(item) == index;
        });
        $.each(dayApp, function (index, item) {
            $("#dayFaultAppearType").append(dayFaultAppearType.format(item));
        });
        $("#dayApp").removeClass("hidden").siblings().addClass("hidden");
        dayAppChart();
    } else {
        $("#dayApp").addClass("hidden").siblings().removeClass("hidden");
    }
    //if (daySer.length != 0) {
    //    daySer = daySer.filter(function (item, index) {
    //        return daySer.indexOf(item) == index;
    //    });
    //    $.each(daySer, function (index, item) {
    //        $("#dayFaultServiceType").append(dayFaultServiceType.format(item));
    //    });
    //    $("#daySer").removeClass("hidden").siblings().addClass("hidden");
    //    daySerChart();
    //} else {
    //    $("#daySer").addClass("hidden").siblings().removeClass("hidden");
    //}
}

function dayAppChart() {
    var appType = $("#dayFaultAppearType").val();
    var i, len = dayData.length;
    var time = [];
    var appCount = [];
    var tf = true;
    for (i = 0; i < len; i++) {
        var timeData = dayData[i].Date.split(" ")[0];
        time.push(timeData);
        var appList = dayData[i].ReportSingleFaultType;
        if (appList.length != 0) {
            $.each(appList, function (index, item) {
                if (item.FaultName == appType) {
                    appCount.push(item.Count);
                    tf = false;
                }
            });
            if (tf) {
                appCount.push(0);
            }
            tf = true;
        } else {
            appCount.push(0);
        }
        if (len == 2 && dayData[0].Date == dayData[1].Date) {
            break;
        }
    }
    $("#dayFaultAppearTypeChart").empty();
    var charts = '<div id="dayAppChart" style="width: 100%; height: 470px"></div>';
    $("#dayFaultAppearTypeChart").append(charts);
    var myChart = echarts.init(document.getElementById("dayAppChart"));
    var option = {
        title: {
            text: appType
        },
        tooltip: {
            trigger: "axis"
        },
        xAxis: {
            data: time,
            axisLine: {
                onZero: false
            }
        },
        yAxis: {
            name: '故障次数',
            type: "value"
        },
        series: {
            name: appType,
            type: "bar",
            data: appCount
        }
    };
    myChart.setOption(option, true);
    $("#dayFaultAppearTypeChart").resize(function () {
        myChart.resize();
    });
}

//function daySerChart() {
//    var serType = $("#dayFaultServiceType").val();
//    var i, len = dayData.length;
//    var time = [];
//    var serCount = [];
//    var tf = true;
//    for (i = 0; i < len; i++) {
//        var timeData = dayData[i].Date.split(" ")[0];
//        time.push(timeData);
//        var serList = dayData[i].RepairSingleFaultType;
//        if (serList.length != 0) {
//            $.each(serList, function (index, item) {
//                if (item.FaultName == serType) {
//                    serCount.push(item.Count);
//                    tf = false;
//                }
//            });
//            if (tf) {
//                serCount.push(0);
//            }
//            tf = true;
//        } else {
//            serCount.push(0);
//        }
//        if (len == 2 && dayData[0].Date == dayData[1].Date) {
//            break;
//        }
//    }
//    $("#dayFaultServiceTypeChart").empty();
//    var charts = '<div id="daySerChart" style="width: 100%; height: 470px"></div>';
//    $("#dayFaultServiceTypeChart").append(charts);
//    var myChart = echarts.init(document.getElementById("daySerChart"));
//    var option = {
//        title: {
//            text: serType
//        },
//        tooltip: {
//            trigger: "axis"
//        },
//        xAxis: {
//            data: time,
//            axisLine: {
//                onZero: false
//            }
//        },
//        yAxis: {
//            name: '维修次数',
//            type: "value"
//        },
//        series: {
//            name: serType,
//            type: "bar",
//            data: serCount
//        }
//    };
//    myChart.setOption(option, true);
//    $("#dayFaultServiceTypeChart").resize(function () {
//        myChart.resize();
//    });
//}

var weekData;
function weekChart() {
    var opType = 505;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var workShopName = $("#selectWorkShop1").val();
    if (workShopName == "所有车间") {
        workShopName = "";
    }
    var oneTime = weekTimeOne;
    var twoTime = weekTimeTwo;
    if (exceedTime(oneTime) || exceedTime(twoTime)) {
        layer.msg("所选时间不能大于当前时间");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        WorkshopName: workShopName,
        StartTime: oneTime,
        EndTime: twoTime,
        Compare: 4
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        weekData = ret.datas;
        var time = [], yData = [];
        var i, len = ret.datas.length;
        for (i = 0; i < len; i++) {
            var timeData = $(".week").eq(i).val();
            time.push(timeData);
            var data = ret.datas[i];
            var yList = {
                name: timeData,
                type: 'bar',
                data: [data.RepairCount, data.RepairFaultType, data.ReportFaultRate, data.ReportCount, data.ReportFaultType, data.FaultDevice]
            }
            yData.push(yList);
            if (len == 2 && ret.datas[0].Date == ret.datas[1].Date) {
                break;
            }
        }
        $("#weekConChart").empty();
        var charts = '<div id="weekChart" style="width: 100%; height: 550px">' + '</div>';
        $("#weekConChart").append(charts);
        var myChart = echarts.init(document.getElementById("weekChart"));
        var option = {
            title: {
                text: "周数据对比"
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
                data: ["维修故障总次数", "维修故障类型数量", "上报故障故障率", "上报故障总次数", "上报故障类型数量", "上报故障设备数量"]
            },
            color: ["#9900ff", "#3333ff"],
            series: yData
        };
        myChart.setOption(option, true);
        $("#weekConChart").resize(function () {
            myChart.resize();
        });
        $("#weekRight").css("display", "none");
        $("#weekRight").fadeIn(1000);
        weekDataDetails();
        //$("#weekFirst").click();
    });
}

function weekDataDetails() {
    $("#weekFaultAppearType").empty();
    //$("#weekFaultServiceType").empty();
    var weekFaultAppearType = '<option value="{0}">{0}</option>';
    //var weekFaultServiceType = '<option value="{0}">{0}</option>';
    var i, len = weekData.length;
    var weekApp = [];
    //var weekSer = [];
    for (i = 0; i < len; i++) {
        var appearData = weekData[i].ReportSingleFaultType;
        //var serviceData = weekData[i].RepairSingleFaultType;
        if (appearData.length != 0) {
            $.each(appearData, function (index, item) {
                weekApp.push(item.FaultName);
            });
        }
        //if (serviceData.length != 0) {
        //    $.each(serviceData, function (index, item) {
        //        weekSer.push(item.FaultName);
        //    });
        //}
        if (len == 2 && weekData[0].Date == weekData[1].Date) {
            break;
        }
    }
    if (weekApp.length != 0) {
        weekApp = weekApp.filter(function (item, index) {
            return weekApp.indexOf(item) == index;
        });
        $.each(weekApp, function (index, item) {
            $("#weekFaultAppearType").append(weekFaultAppearType.format(item));
        });
        $("#weekApp").removeClass("hidden").siblings().addClass("hidden");
        weekAppChart();
    } else {
        $("#weekApp").addClass("hidden").siblings().removeClass("hidden");
    }
    //if (weekSer.length != 0) {
    //    weekSer = weekSer.filter(function (item, index) {
    //        return weekSer.indexOf(item) == index;
    //    });
    //    $.each(weekSer, function (index, item) {
    //        $("#weekFaultServiceType").append(weekFaultServiceType.format(item));
    //    });
    //    $("#weekSer").removeClass("hidden").siblings().addClass("hidden");
    //    weekSerChart();
    //} else {
    //    $("#weekSer").addClass("hidden").siblings().removeClass("hidden");
    //}
}

function weekAppChart() {
    var appType = $("#weekFaultAppearType").val();
    var i, len = weekData.length;
    var time = [];
    var appCount = [];
    var tf = true;
    for (i = 0; i < len; i++) {
        var timeData = $(".week").eq(i).val();
        time.push(timeData);
        var appList = weekData[i].ReportSingleFaultType;
        if (appList.length != 0) {
            $.each(appList, function (index, item) {
                if (item.FaultName == appType) {
                    appCount.push(item.Count);
                    tf = false;
                }
            });
            if (tf) {
                appCount.push(0);
            }
            tf = true;
        } else {
            appCount.push(0);
        }
        if (len == 2 && weekData[0].Date == weekData[1].Date) {
            break;
        }
    }
    $("#weekFaultAppearTypeChart").empty();
    var charts = '<div id="weekAppChart" style="width: 100%; height: 470px"></div>';
    $("#weekFaultAppearTypeChart").append(charts);
    var myChart = echarts.init(document.getElementById("weekAppChart"));
    var option = {
        title: {
            text: appType
        },
        tooltip: {
            trigger: "axis"
        },
        xAxis: {
            data: time,
            axisLine: {
                onZero: false
            }
        },
        yAxis: {
            name: '故障次数',
            type: "value"
        },
        series: {
            name: appType,
            type: "bar",
            data: appCount
        }
    };
    myChart.setOption(option, true);
    $("#weekFaultAppearTypeChart").resize(function () {
        myChart.resize();
    });
}

//function weekSerChart() {
//    var serType = $("#weekFaultServiceType").val();
//    var i, len = weekData.length;
//    var time = [];
//    var serCount = [];
//    var tf = true;
//    for (i = 0; i < len; i++) {
//        var timeData = $(".week").eq(i).val();
//        time.push(timeData);
//        var serList = weekData[i].RepairSingleFaultType;
//        if (serList.length != 0) {
//            $.each(serList, function (index, item) {
//                if (item.FaultName == serType) {
//                    serCount.push(item.Count);
//                    tf = false;
//                }
//            });
//            if (tf) {
//                serCount.push(0);
//            }
//            tf = true;
//        } else {
//            serCount.push(0);
//        }
//        if (len == 2 && weekData[0].Date == weekData[1].Date) {
//            break;
//        }
//    }
//    $("#weekFaultServiceTypeChart").empty();
//    var charts = '<div id="weekSerChart" style="width: 100%; height: 470px"></div>';
//    $("#weekFaultServiceTypeChart").append(charts);
//    var myChart = echarts.init(document.getElementById("weekSerChart"));
//    var option = {
//        title: {
//            text: serType
//        },
//        tooltip: {
//            trigger: "axis"
//        },
//        xAxis: {
//            data: time,
//            axisLine: {
//                onZero: false
//            }
//        },
//        yAxis: {
//            name: '维修次数',
//            type: "value"
//        },
//        series: {
//            name: serType,
//            type: "bar",
//            data: serCount
//        }
//    };
//    myChart.setOption(option, true);
//    $("#weekFaultServiceTypeChart").resize(function () {
//        myChart.resize();
//    });
//}

var monthData;
function monthChart() {
    var opType = 505;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var workShopName = $("#selectWorkShopMonth").val();
    if (workShopName == "所有车间") {
        workShopName = "";
    }
    var oneTime = $("#selectMonth").val();
    var twoTime = $("#conMonth").val();
    if (exceedTime(oneTime) || exceedTime(twoTime)) {
        layer.msg("所选时间不能大于当前时间");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        WorkshopName: workShopName,
        StartTime: oneTime,
        EndTime: twoTime,
        Compare: 5
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        monthData = ret.datas;
        var time = [], yData = [];
        var i, len = ret.datas.length;
        for (i = 0; i < len; i++) {
            var timeData = ret.datas[i].Date.split(" ")[0];
            timeData = timeData.slice(0, timeData.indexOf("-") + 3);
            time.push(timeData);
            var data = ret.datas[i];
            var yList = {
                name: timeData,
                type: 'bar',
                data: [data.RepairCount, data.RepairFaultType, data.ReportFaultRate, data.ReportCount, data.ReportFaultType, data.FaultDevice]
            }
            yData.push(yList);
            if (len == 2 && ret.datas[0].Date == ret.datas[1].Date) {
                break;
            }
        }
        $("#monthConChart").empty();
        var charts = '<div id="monthChart" style="width: 100%; height: 550px">' + '</div>';
        $("#monthConChart").append(charts);
        var myChart = echarts.init(document.getElementById("monthChart"));
        var option = {
            title: {
                text: "月数据对比"
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
                data: ["维修故障总次数", "维修故障类型数量", "上报故障故障率", "上报故障总次数", "上报故障类型数量", "上报故障设备数量"]
            },
            color: ["#9900ff", "#3333ff"],
            series: yData
        };
        myChart.setOption(option, true);
        $("#monthConChart").resize(function () {
            myChart.resize();
        });
        $("#monthRight").css("display", "none");
        $("#monthRight").fadeIn(1000);
        monthDataDetails();
        //$("#monthFirst").click();
    });
}

function monthDataDetails() {
    $("#monthFaultAppearType").empty();
    //$("#monthFaultServiceType").empty();
    var monthFaultAppearType = '<option value="{0}">{0}</option>';
    //var monthFaultServiceType = '<option value="{0}">{0}</option>';
    var i, len = monthData.length;
    var monthApp = [];
    //var monthSer = [];
    for (i = 0; i < len; i++) {
        var appearData = monthData[i].ReportSingleFaultType;
        //var serviceData = monthData[i].RepairSingleFaultType;
        if (appearData.length != 0) {
            $.each(appearData, function (index, item) {
                monthApp.push(item.FaultName);
            });
        }
        //if (serviceData.length != 0) {
        //    $.each(serviceData, function (index, item) {
        //        monthSer.push(item.FaultName);
        //    });
        //}
        if (len == 2 && monthData[0].Date == monthData[1].Date) {
            break;
        }
    }
    if (monthApp.length != 0) {
        monthApp = monthApp.filter(function (item, index) {
            return monthApp.indexOf(item) == index;
        });
        $.each(monthApp, function (index, item) {
            $("#monthFaultAppearType").append(monthFaultAppearType.format(item));
        });
        $("#monthApp").removeClass("hidden").siblings().addClass("hidden");
        monthAppChart();
    } else {
        $("#monthApp").addClass("hidden").siblings().removeClass("hidden");
    }
    //if (monthSer.length != 0) {
    //    monthSer = monthSer.filter(function (item, index) {
    //        return monthSer.indexOf(item) == index;
    //    });
    //    $.each(monthSer, function (index, item) {
    //        $("#monthFaultServiceType").append(monthFaultServiceType.format(item));
    //    });
    //    $("#monthSer").removeClass("hidden").siblings().addClass("hidden");
    //    monthSerChart();
    //} else {
    //    $("#monthSer").addClass("hidden").siblings().removeClass("hidden");
    //}
}

function monthAppChart() {
    var appType = $("#monthFaultAppearType").val();
    var i, len = monthData.length;
    var time = [];
    var appCount = [];
    var tf = true;
    for (i = 0; i < len; i++) {
        var timeData = monthData[i].Date.split(" ")[0];
        timeData = timeData.slice(0, timeData.indexOf("-") + 3);
        time.push(timeData);
        var appList = monthData[i].ReportSingleFaultType;
        if (appList.length != 0) {
            $.each(appList, function (index, item) {
                if (item.FaultName == appType) {
                    appCount.push(item.Count);
                    tf = false;
                }
            });
            if (tf) {
                appCount.push(0);
            }
            tf = true;
        } else {
            appCount.push(0);
        }
        if (len == 2 && monthData[0].Date == monthData[1].Date) {
            break;
        }
    }
    $("#monthFaultAppearTypeChart").empty();
    var charts = '<div id="monthAppChart" style="width: 100%; height: 470px"></div>';
    $("#monthFaultAppearTypeChart").append(charts);
    var myChart = echarts.init(document.getElementById("monthAppChart"));
    var option = {
        title: {
            text: appType
        },
        tooltip: {
            trigger: "axis"
        },
        xAxis: {
            data: time,
            axisLine: {
                onZero: false
            }
        },
        yAxis: {
            name: '故障次数',
            type: "value"
        },
        series: {
            name: appType,
            type: "bar",
            data: appCount
        }
    };
    myChart.setOption(option, true);
    $("#monthFaultAppearTypeChart").resize(function () {
        myChart.resize();
    });
}

//function monthSerChart() {
//    var serType = $("#monthFaultServiceType").val();
//    var i, len = monthData.length;
//    var time = [];
//    var serCount = [];
//    var tf = true;
//    for (i = 0; i < len; i++) {
//        var timeData = monthData[i].Date.split(" ")[0];
//        timeData = timeData.slice(0, timeData.indexOf("-") + 3);
//        time.push(timeData);
//        var serList = monthData[i].RepairSingleFaultType;
//        if (serList.length != 0) {
//            $.each(serList, function (index, item) {
//                if (item.FaultName == serType) {
//                    serCount.push(item.Count);
//                    tf = false;
//                }
//            });
//            if (tf) {
//                serCount.push(0);
//            }
//            tf = true;
//        } else {
//            serCount.push(0);
//        }
//        if (len == 2 && monthData[0].Date == monthData[1].Date) {
//            break;
//        }
//    }
//    $("#monthFaultServiceTypeChart").empty();
//    var charts = '<div id="monthSerChart" style="width: 100%; height: 470px"></div>';
//    $("#monthFaultServiceTypeChart").append(charts);
//    var myChart = echarts.init(document.getElementById("monthSerChart"));
//    var option = {
//        title: {
//            text: serType
//        },
//        tooltip: {
//            trigger: "axis"
//        },
//        xAxis: {
//            data: time,
//            axisLine: {
//                onZero: false
//            }
//        },
//        yAxis: {
//            name: '维修次数',
//            type: "value"
//        },
//        series: {
//            name: serType,
//            type: "bar",
//            data: serCount
//        }
//    };
//    myChart.setOption(option, true);
//    $("#monthFaultServiceTypeChart").resize(function () {
//        myChart.resize();
//    });
//}

var shopData, shopTime;
function shopChart() {
    var opType = 505;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var workShopName = $("#selectWorkShop1").val();
    if (isStrEmptyOrUndefined(workShopName) || workShopName.length < 2) {
        layer.msg("请选择两个及以上的车间");
        return;
    }
    workShopName = workShopName.join(",");
    if (!$("#shopPar label").find(".icb_minimal").is(":checked")) {
        layer.msg("请选择参数");
        return;
    }
    var startTime = $("#startDate1").val();
    var endTime = $("#endDate1").val();
    if (exceedTime(startTime) || exceedTime(endTime)) {
        layer.msg("所选时间不能大于当前时间");
        return;
    }
    if (compareDate(startTime, endTime)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        WorkshopName: workShopName,
        StartTime: startTime,
        EndTime: endTime,
        Compare: 1
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        shopData = ret.datas;
        var workShop = $("#selectWorkShop1").val();
        $("#shopConChart").empty();
        var i, len = $("#shopPar label").find(".icb_minimal").length;
        var count = -1;
        for (i = 0; i < len; i++) {
            var ick = $("#shopPar label").find(".icb_minimal")[i];
            var span = $("#shopPar label")[i];
            var listName = [];
            var legend = [];
            var data = [];
            var j, a, q, k;
            if ($(ick).is(":checked")) {
                count++;
                listName[$(span).text()] = $(ick).val();
                legend.push($(span).text());
                var key;
                for (key in listName) {
                    if (listName.hasOwnProperty(key)) {
                        data[key] = [];
                    }
                }
                objectSort(ret.datas, "Workshop");
                objectSort(ret.datas, "Date");
                var time = [];
                for (j = 0; j < ret.datas.length; j++) {
                    var timeData = ret.datas[j].Date.split(" ")[0];
                    time.push(timeData);
                    var parData = ret.datas[j];
                    for (key in listName) {
                        if (listName.hasOwnProperty(key)) {
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
                                    if (key == legend[legend.length - 1] && a == workShop.length - 1) {
                                        j--;
                                    }
                                }
                            }
                        }
                    }
                }
                time = distinct(time);
                shopTime = time;
                var rData = [];
                for (key in listName) {
                    if (listName.hasOwnProperty(key)) {
                        for (k = 0; k < workShop.length; k++) {
                            rData.push({
                                name: workShop[k],
                                type: "line",
                                data: data[key].filter(function (item, index, array) {
                                    return index % workShop.length == k;
                                })
                            });
                        }
                    }
                }
                var charts = '<div id="shopChart' + count + '" style="width: 100%; height: 500px">' + '</div>';
                $("#shopConChart").append(charts);
                var myChart = echarts.init(document.getElementById("shopChart" + count));
                var option = {
                    title: {
                        text: legend[0]
                    },
                    tooltip: {
                        trigger: "axis",
                        formatter: function (params, ticket, callback) {
                            var formatter1 = "{0}: {1}<br/>";
                            var formatter = "";
                            for (var i = 0, l = params.length; i < l; i++) {
                                var xName = params[i].name;
                                formatter += formatter1.format(
                                    params[i].seriesName,
                                    params[i].seriesName == "上报故障故障率" && typeof (params[i].value) == "number"
                                        ? ((params[i].value) * 100).toFixed(2) + "%"
                                        : params[i].value);
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
                    yAxis: {
                        type: "value"
                    },
                    legend: {
                        data: workShop
                    },
                    color: ["green", "red", "#ff00ff", "#cc3300", "#ff9900", "#9933ff", "blue", "#0099ff", "#660066"],
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
                            restore: {},
                            magicType: {
                                type: ['line', 'bar']
                            }
                        }
                    }
                };
                myChart.setOption(option, true);
            }
        }
        $("#shopConChart").resize(function () {
            len = $("#shopConChart").children().length;
            for (i = 0; i < len; i++) {
                echarts.init(document.getElementById("shopChart" + i)).resize();
            }
        });
        $("#shopRight").css("display", "none");
        $("#shopRight").fadeIn(1000);
        shopDataDetails();
        //$("#shopFirst").click();
    });
}

function shopDataDetails() {
    $("#shopFaultAppearType").empty();
    //$("#shopFaultServiceType").empty();
    var shopFaultAppearType = '<option value="{0}">{0}</option>';
    //var shopFaultServiceType = '<option value="{0}">{0}</option>';
    var i, len = shopData.length;
    var shopApp = [];
    //var shopSer = [];
    for (i = 0; i < len; i++) {
        var appearData = shopData[i].ReportSingleFaultType;
        //var serviceData = shopData[i].RepairSingleFaultType;
        if (appearData.length != 0) {
            $.each(appearData, function (index, item) {
                shopApp.push(item.FaultName);
            });
        }
        //if (serviceData.length != 0) {
        //    $.each(serviceData, function (index, item) {
        //        shopSer.push(item.FaultName);
        //    });
        //}
    }
    if (shopApp.length != 0) {
        shopApp = shopApp.filter(function (item, index) {
            return shopApp.indexOf(item) == index;
        });
        $.each(shopApp, function (index, item) {
            $("#shopFaultAppearType").append(shopFaultAppearType.format(item));
        });
        $("#shopApp").removeClass("hidden").siblings().addClass("hidden");
        shopAppChart();
    } else {
        $("#shopApp").addClass("hidden").siblings().removeClass("hidden");
    }
    //if (shopSer.length != 0) {
    //    shopSer = shopSer.filter(function (item, index) {
    //        return shopSer.indexOf(item) == index;
    //    });
    //    $.each(shopSer, function (index, item) {
    //        $("#shopFaultServiceType").append(shopFaultServiceType.format(item));
    //    });
    //    $("#shopSer").removeClass("hidden").siblings().addClass("hidden");
    //    shopSerChart();
    //} else {
    //    $("#shopSer").addClass("hidden").siblings().removeClass("hidden");
    //}
}

function shopAppChart() {
    var appType = $("#shopFaultAppearType").val();
    var legend = $("#selectWorkShop1").val();
    var i, len = shopData.length;
    var appData = [];
    var tf = true;
    var num = 0;
    for (i = 0; i < len; i++) {
        var workShop = shopData[i].Workshop;
        var appList = shopData[i].ReportSingleFaultType;
        if (workShop == legend[num++ % legend.length]) {
            if (appList.length != 0) {
                $.each(appList, function (index, item) {
                    if (item.FaultName == appType) {
                        appData.push(item.Count);
                        tf = false;
                    }
                });
                if (tf) {
                    appData.push(0);
                }
                tf = true;
            } else {
                appData.push(0);
            }
        } else {
            appData.push(0);
            i--;
        }
        if (i == len - 1 && appData.length % legend.length != 0) {
            for (var q = 0; q < appData.length % legend.length; q++) {
                appData.push(0);
            }
        }
    }
    var rData = [];
    len = legend.length;
    for (i = 0; i < len; i++) {
        rData.push({
            name: legend[i],
            type: "line",
            data: appData.filter(function (item, index, array) {
                return index % len == i;
            })
        });
    }
    $("#shopFaultAppearTypeChart").empty();
    var charts = '<div id="shopAppChart" style="width: 100%; height: 500px"></div>';
    $("#shopFaultAppearTypeChart").append(charts);
    var myChart = echarts.init(document.getElementById("shopAppChart"));
    var option = {
        title: {
            text: appType
        },
        tooltip: {
            trigger: "axis"
        },
        xAxis: {
            data: shopTime,
            axisLine: {
                onZero: false
            }
        },
        yAxis: {
            name: "故障次数",
            type: "value"
        },
        legend: {
            data: legend
        },
        color: ["green", "red", "#ff00ff", "#cc3300", "#ff9900", "#9933ff", "blue", "#0099ff", "#660066"],
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
                restore: {},
                magicType: {
                    type: ['line', 'bar']
                }
            }
        }
    };
    myChart.setOption(option, true);
    $("#shopFaultAppearTypeChart").resize(function () {
        myChart.resize();
    });
}

//function shopSerChart() {
//    var serType = $("#shopFaultServiceType").val();
//    var legend = $("#selectWorkShop1").val();
//    var i, len = shopData.length;
//    var serData = [];
//    var tf = true;
//    var num = 0;
//    for (i = 0; i < len; i++) {
//        var workShop = shopData[i].Workshop;
//        var serList = shopData[i].RepairSingleFaultType;
//        if (workShop == legend[num++ % legend.length]) {
//            if (serList.length != 0) {
//                $.each(serList, function (index, item) {
//                    if (item.FaultName == serType) {
//                        serData.push(item.Count);
//                        tf = false;
//                    }
//                });
//                if (tf) {
//                    serData.push(0);
//                }
//                tf = true;
//            } else {
//                serData.push(0);
//            }
//        } else {
//            serData.push(0);
//            i--;
//        }
//        if (i == len - 1 && serData.length % legend.length != 0) {
//            for (var q = 0; q < serData.length % legend.length; q++) {
//                serData.push(0);
//            }
//        }
//    }
//    var rData = [];
//    len = legend.length;
//    for (i = 0; i < len; i++) {
//        rData.push({
//            name: legend[i],
//            type: "line",
//            data: serData.filter(function (item, index, array) {
//                return index % len == i;
//            })
//        });
//    }
//    $("#shopFaultServiceTypeChart").empty();
//    var charts = '<div id="shopSerChart" style="width: 100%; height: 500px"></div>';
//    $("#shopFaultServiceTypeChart").append(charts);
//    var myChart = echarts.init(document.getElementById("shopSerChart"));
//    var option = {
//        title: {
//            text: serType
//        },
//        tooltip: {
//            trigger: "axis"
//        },
//        xAxis: {
//            data: shopTime,
//            axisLine: {
//                onZero: false
//            }
//        },
//        yAxis: {
//            name: "维修次数",
//            type: "value"
//        },
//        legend: {
//            data: legend
//        },
//        color: ["green", "red", "#ff00ff", "#cc3300", "#ff9900", "#9933ff", "blue", "#0099ff", "#660066"],
//        series: rData,
//        dataZoom: [{
//            type: "slider",
//            start: 0,
//            end: 100
//        },
//        {
//            type: "inside",
//            start: 0,
//            end: 100
//        }],
//        toolbox: {
//            top: 20,
//            left: "center",
//            feature: {
//                dataZoom: {
//                    yAxisIndex: "none"
//                },
//                restore: {},
//                magicType: {
//                    type: ['line', 'bar']
//                }
//            }
//        }
//    };
//    myChart.setOption(option, true);
//    $("#shopFaultServiceTypeChart").resize(function () {
//        myChart.resize();
//    });
//}

var devData, devTime;
function devChart() {
    var opType = 505;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var workShopName = $("#selectWorkShopDev").val();
    if (workShopName == "所有车间") {
        workShopName = "";
    }
    var deviceName = $("#selectDeviceDev").val();
    if (isStrEmptyOrUndefined(deviceName) || deviceName.length < 2) {
        layer.msg("请选择两个及以上的设备");
        return;
    }
    deviceName = deviceName.join(",");
    if (!$("#devPar label").find(".icb_minimal").is(":checked")) {
        layer.msg("请选择参数");
        return;
    }
    var startTime = $("#startDateDev").val();
    var endTime = $("#endDateDev").val();
    if (exceedTime(startTime) || exceedTime(endTime)) {
        layer.msg("所选时间不能大于当前时间");
        return;
    }
    if (compareDate(startTime, endTime)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        WorkshopName: workShopName,
        DeviceId: deviceName,
        StartTime: startTime,
        EndTime: endTime,
        Compare: 2
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        devData = ret.datas;
        var device = $("#selectDeviceDev").val();
        $("#devConChart").empty();
        var i, len = $("#devPar label").find(".icb_minimal").length;
        var count = -1;
        for (i = 0; i < len; i++) {
            var ick = $("#devPar label").find(".icb_minimal")[i];
            var span = $("#devPar label")[i];
            var listName = [];
            var legend = [];
            var data = [];
            var j, a, q, k;
            if ($(ick).is(":checked")) {
                count++;
                listName[$(span).text()] = $(ick).val();
                legend.push($(span).text());
                var key;
                for (key in listName) {
                    if (listName.hasOwnProperty(key)) {
                        data[key] = [];
                    }
                }
                var time = [];
                for (j = 0; j < ret.datas.length; j++) {
                    var timeData = ret.datas[j].Date.split(" ")[0];
                    time.push(timeData);
                    var parData = ret.datas[j];
                    for (key in listName) {
                        if (listName.hasOwnProperty(key)) {
                            for (a = data[key].length % device.length; a < device.length; a++) {
                                if (device[a] == parData.Code) {
                                    data[key].push(parData[listName[key]]);
                                    if (j == ret.datas.length - 1 && data[key].length % device.length != 0) {
                                        for (q = 0; q < data[key].length % device.length; q++) {
                                            data[key].push("x");
                                        }
                                        break;
                                    } else {
                                        break;
                                    }
                                } else {
                                    data[key].push("x");
                                    if (key == legend[legend.length - 1] && a == device.length - 1) {
                                        j--;
                                    }
                                }
                            }
                        }
                    }
                }
                time = distinct(time);
                devTime = time;
                var rData = [];
                for (key in listName) {
                    if (listName.hasOwnProperty(key)) {
                        for (k = 0; k < device.length; k++) {
                            rData.push({
                                name: device[k],
                                type: "line",
                                data: data[key].filter(function (item, index, array) {
                                    return index % device.length == k;
                                })
                            });
                        }
                    }
                }
                var charts = '<div id="devChart' + count + '" style="width: 100%; height: 500px">' + '</div>';
                $("#devConChart").append(charts);
                var myChart = echarts.init(document.getElementById("devChart" + count));
                var option = {
                    title: {
                        text: legend[0]
                    },
                    tooltip: {
                        trigger: "axis",
                        formatter: function (params, ticket, callback) {
                            var formatter1 = "{0}: {1}<br/>";
                            var formatter = "";
                            for (var i = 0, l = params.length; i < l; i++) {
                                var xName = params[i].name;
                                formatter += formatter1.format(
                                    params[i].seriesName,
                                    params[i].seriesName == "上报故障故障率" && typeof (params[i].value) == "number"
                                        ? ((params[i].value) * 100).toFixed(2) + "%"
                                        : params[i].value);
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
                    yAxis: {
                        type: "value"
                    },
                    legend: {
                        data: device
                    },
                    color: ["green", "red", "#ff00ff", "#cc3300", "#ff9900", "#9933ff", "blue", "#0099ff", "#660066"],
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
                            restore: {},
                            magicType: {
                                type: ['line', 'bar']
                            }
                        }
                    }
                };
                myChart.setOption(option, true);
            }
        }
        $("#devConChart").resize(function () {
            len = $("#devConChart").children().length;
            for (i = 0; i < len; i++) {
                echarts.init(document.getElementById("devChart" + i)).resize();
            }
        });
        $("#devRight").css("display", "none");
        $("#devRight").fadeIn(1000);
        devDataDetails();
    });
}

function devDataDetails() {
    $("#devFaultAppearType").empty();
    var devFaultAppearType = '<option value="{0}">{0}</option>';
    var i, len = devData.length;
    var devApp = [];
    for (i = 0; i < len; i++) {
        var appearData = devData[i].ReportSingleFaultType;
        if (appearData.length != 0) {
            $.each(appearData, function (index, item) {
                devApp.push(item.FaultName);
            });
        }
    }
    if (devApp.length != 0) {
        devApp = devApp.filter(function (item, index) {
            return devApp.indexOf(item) == index;
        });
        $.each(devApp, function (index, item) {
            $("#devFaultAppearType").append(devFaultAppearType.format(item));
        });
        $("#devApp").removeClass("hidden").siblings().addClass("hidden");
        devAppChart();
    } else {
        $("#devApp").addClass("hidden").siblings().removeClass("hidden");
    }
}

function devAppChart() {
    var appType = $("#devFaultAppearType").val();
    var legend = $("#selectDeviceDev").val();
    var i, len = devData.length;
    var appData = [];
    var tf = true;
    var num = 0;
    for (i = 0; i < len; i++) {
        var device = devData[i].Code;
        var appList = devData[i].ReportSingleFaultType;
        if (device == legend[num++ % legend.length]) {
            if (appList.length != 0) {
                $.each(appList, function (index, item) {
                    if (item.FaultName == appType) {
                        appData.push(item.Count);
                        tf = false;
                    }
                });
                if (tf) {
                    appData.push(0);
                }
                tf = true;
            } else {
                appData.push(0);
            }
        } else {
            appData.push(0);
            i--;
        }
        if (i == len - 1 && appData.length % legend.length != 0) {
            for (var q = 0; q < appData.length % legend.length; q++) {
                appData.push(0);
            }
        }
    }
    var rData = [];
    len = legend.length;
    for (i = 0; i < len; i++) {
        rData.push({
            name: legend[i],
            type: "line",
            data: appData.filter(function (item, index, array) {
                return index % len == i;
            })
        });
    }
    $("#devFaultAppearTypeChart").empty();
    var charts = '<div id="devAppChart" style="width: 100%; height: 500px"></div>';
    $("#devFaultAppearTypeChart").append(charts);
    var myChart = echarts.init(document.getElementById("devAppChart"));
    var option = {
        title: {
            text: appType
        },
        tooltip: {
            trigger: "axis"
        },
        xAxis: {
            data: devTime,
            axisLine: {
                onZero: false
            }
        },
        yAxis: {
            name: "故障次数",
            type: "value"
        },
        legend: {
            data: legend
        },
        color: ["green", "red", "#ff00ff", "#cc3300", "#ff9900", "#9933ff", "blue", "#0099ff", "#660066"],
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
                restore: {},
                magicType: {
                    type: ['line', 'bar']
                }
            }
        }
    };
    myChart.setOption(option, true);
    $("#devFaultAppearTypeChart").resize(function () {
        myChart.resize();
    });
}

var hourData, hourTime;
function getFaultTimeChart() {
    var opType = 505;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var workShop = $("#selectWorkShopTime").val();
    if (workShop == "所有车间") {
        workShop = "";
    }
    var startDay = $("#startDayTime").val();
    var endDay = $("#endDayTime").val();
    if (exceedTime(startDay) || exceedTime(endDay)) {
        layer.msg("所选时间不能大于当前时间");
        return;
    }
    if (compareDate(startDay, endDay)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }
    var startTime = $("#startTime").val();
    var endTime = $("#endTime").val();
    if (exceedTime(startDay + " " + startTime) || exceedTime(endDay + " " + endTime)) {
        layer.msg("所选时间区间大于当前时间");
        return;
    }
    var startHour = startTime.slice(0, startTime.indexOf(":"));
    var endHour = endTime.slice(0, endTime.indexOf(":"));
    if (parseInt(startHour) > parseInt(endHour)) {
        layer.msg("结束区间不能小于开始区间");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        WorkshopName: workShop,
        StartTime: startDay,
        EndTime: endDay,
        StartHour: startHour,
        EndHour: endHour,
        Compare: 6
    });
    ajaxPost("/Relay/Post",
        data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            hourData = ret.datas;
            var i, len = ret.datas.length;
            var xData = [], yData = [];
            for (i = 0; i < len - 1; i++) {
                var time = ret.datas[i].Date.split(" ")[1];
                xData.push(time);
                var faultCount = ret.datas[i].ReportCount;
                yData.push(faultCount);
            }
            var num = "(总:" + ret.datas[len - 1].ReportCount + "次)";
            hourTime = xData;
            var yDataCount = [];
            yDataCount.push({
                name: "上报故障次数",
                type: "line",
                data: yData
            });
            $("#faultTimeChart").empty();
            var charts = '<div id="timeChart" style="width: 100%; height: 500px">' + '</div>';
            $("#faultTimeChart").append(charts);
            var myChart = echarts.init(document.getElementById("timeChart"));
            var option = {
                title: {
                    text: "上报故障次数" + num
                },
                tooltip: {
                    trigger: "axis"
                },
                xAxis: {
                    data: xData,
                    axisLine: {
                        onZero: false
                    }
                },
                yAxis: {
                    name: "故障次数",
                    type: "value"
                },
                legend: {
                    data: ["上报故障次数"]
                },
                color: ["red"],
                series: yDataCount,
                dataZoom: [{
                    type: "slider",
                    start: 0,
                    end: 100
                }, {
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
                        restore: {},
                        magicType: {
                            type: ["line", "bar"]
                        }
                    }
                }
            };
            myChart.setOption(option, true);
            $("#faultTimeChart").resize(function () {
                myChart.resize();
            });
            $("#timeRight").css("display", "none");
            $("#timeRight").fadeIn(1000);
            timeAppChart();
        });
}

function timeAppChart() {
    var data = hourData;
    var i, len = data.length - 1;
    var app = [];
    for (i = 0; i < len; i++) {
        var report = data[i].ReportSingleFaultType;
        if (report.length != 0) {
            $.each(report, function (index, item) {
                app.push(item.FaultName);
            });
        }
    }
    if (app.length == 0) {
        $("#timeApp").addClass("hidden").siblings().removeClass("hidden");
    } else {
        $("#timeApp").removeClass("hidden").siblings().addClass("hidden");
        app = app.filter(function (item, index) {
            return app.indexOf(item) == index;
        });
        var rData = [];
        var tf = true;
        $.each(app, function (index, item) {
            var appCount = [];
            for (i = 0; i < len; i++) {
                var appList = data[i].ReportSingleFaultType;
                if (appList.length != 0) {
                    $.each(appList, function (x, e) {
                        if (item == e.FaultName) {
                            appCount.push(e.Count);
                            tf = false;
                        }
                    });
                    if (tf) {
                        appCount.push(0);
                    }
                    tf = true;
                } else {
                    appCount.push(0);
                }
            }
            rData.push({
                name: item,
                type: "line",
                data: appCount
            });
        });
        $("#timeFaultAppearTypeChart").empty();
        var charts = '<div id="timeAppChart" style="width: 100%; height: 500px"></div>';
        $("#timeFaultAppearTypeChart").append(charts);
        var myChart = echarts.init(document.getElementById("timeAppChart"));
        var option = {
            tooltip: {
                trigger: "axis"
            },
            xAxis: {
                data: hourTime,
                axisLine: {
                    onZero: false
                }
            },
            yAxis: {
                name: "故障次数",
                type: "value"
            },
            legend: {
                data: app
            },
            color: ["green", "red", "#ff00ff", "#cc3300", "#ff9900", "#9933ff", "blue", "#0099ff", "#660066"],
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
                    restore: {},
                    magicType: {
                        type: ['line', 'bar']
                    }
                }
            }
        };
        myChart.setOption(option, true);
        $("#timeFaultAppearTypeChart").resize(function () {
            myChart.resize();
        });
    }
}
//function appearDataList(appearData) {
//    var num;
//    var order = function (data, type, row) {
//        return ++num;
//    }
//    var i, len = appearData.length;
//    var name = $("#faultAppearType").val();
//    for (i = 0; i < len; i++) {
//        if (appearData[i].FaultName == name) {
//            num = 0;
//            $("#faultAppear1").DataTable({
//                "destroy": true,
//                "paging": true,
//                "deferRender": false,
//                "bLengthChange": false,
//                "searching": false,
//                "language": { "url": "/content/datatables_language.json" },
//                "data": appearData[i].DeviceFaultTypes,
//                "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
//                "iDisplayLength": 5, //默认显示的记录数  
//                "columns": [
//                    { "data": null, "title": "序号", "render": order },
//                    { "data": "Code", "title": "机台号" },
//                    { "data": "Count", "title": "故障次数" }
//                ]
//            });
//            num = 0;
//            $("#faultAppear2").DataTable({
//                "destroy": true,
//                "paging": true,
//                "deferRender": false,
//                "bLengthChange": false,
//                "searching": false,
//                "language": { "url": "/content/datatables_language.json" },
//                "data": appearData[i].Operators,
//                "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
//                "iDisplayLength": 5, //默认显示的记录数  
//                "columns": [
//                    { "data": null, "title": "序号", "render": order },
//                    { "data": "Name", "title": "上报人" },
//                    { "data": "Count", "title": "上报次数" }
//                ]
//            });
//        }
//    }
//}

//function serviceDataList(serviceData) {
//    var num;
//    var order = function (data, type, row) {
//        return ++num;
//    }
//    var i, len = serviceData.length;
//    var name = $("#faultServiceType").val();
//    for (i = 0; i < len; i++) {
//        if (serviceData[i].FaultName == name) {
//            num = 0;
//            $("#faultService1").DataTable({
//                "destroy": true,
//                "paging": true,
//                "deferRender": false,
//                "bLengthChange": false,
//                "searching": false,
//                "language": { "url": "/content/datatables_language.json" },
//                "data": serviceData[i].DeviceFaultTypes,
//                "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
//                "iDisplayLength": 5, //默认显示的记录数  
//                "columns": [
//                    { "data": null, "title": "序号", "render": order },
//                    { "data": "Code", "title": "机台号" },
//                    { "data": "Count", "title": "故障次数" }
//                ]
//            });
//            num = 0;
//            var serviceTime = function (data, type, row) {
//                return codeTime(data.Time);
//            }
//            $("#faultService2").DataTable({
//                "destroy": true,
//                "paging": true,
//                "deferRender": false,
//                "bLengthChange": false,
//                "searching": false,
//                "language": { "url": "/content/datatables_language.json" },
//                "data": serviceData[i].Operators,
//                "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
//                "iDisplayLength": 5, //默认显示的记录数  
//                "columns": [
//                    { "data": null, "title": "序号", "render": order },
//                    { "data": "Name", "title": "维修人" },
//                    { "data": "Count", "title": "维修次数" },
//                    { "data": null, "title": "维修时间", "render": serviceTime }
//                ]
//            });
//        }
//    }
//}