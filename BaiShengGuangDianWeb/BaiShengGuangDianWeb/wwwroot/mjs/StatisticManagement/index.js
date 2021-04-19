var _permissionList = [];
function pageReady() {
    _permissionList[700] = { uIds: [] };
    _permissionList[701] = { uIds: ['getProcessDetailBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
    if (!_permissionList[700].have) {
        $('.createChart').addClass('hidden');
    }
    $('.ms2').select2();
    $('#selectDevice,#selectDevice1').select2({
        allowClear: true,
        placeholder: "请选择"
    });
    $(".icb_minimal").iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        radioClass: 'iradio_minimal-blue',
        increaseArea: '20%'
    });
    $("#selectDevice").on("select2:select", function () {
        const v = $(this).val();
        if (v.indexOf("0,所有设备") > -1) {
            $(this).val("0,所有设备").trigger("change");
        }
    });
    getWorkShopList();
    getDeviceList();
    $(".form_date").val(getDate()).datepicker('update');
    $("#selectWorkShop").on("select2:select", function () {
        $("#recordChart").empty();
        var v = $(this).val();
        new Promise(resolve => v == '所有车间' ? getDeviceList(resolve) : getWorkShopDevice(resolve, v)).then(e => $('#selectDevice').empty().append(`<option value="0">所有设备</option>${e}`));
    });
    var tf = true;
    $("#selectWorkShop1").on("select2:select", function () {
        $("#processDetailList").empty();
        $("#checkAll").iCheck("uncheck");
        var v = $(this).val();
        new Promise(resolve => v == '所有车间' ? getDeviceList(resolve) : getWorkShopDevice(resolve, v)).then(e => $('#selectDevice1').empty().append(e));
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
    $("#parTime input,#parTime span,#par input,#par span").css("verticalAlign", "middle");
    radioTime();
    $("#selectStartDate,#selectStartTime,#selectEndDate,#selectEndTime").on("change", function () {
        radioTime();
    });
    $("#selectJhList").select2();
    selectPlan();
    $(".planHead").on("ifChanged", function () {
        if ($(this).is(":checked")) {
            $(".planBody").removeClass("hidden");
        } else {
            $(".planBody").addClass("hidden");
            $("#selectJhList").val($("#selectJhList").find("option:first").val()).trigger("change");
        }
    });
    $('#productionWorkShop').on('select2:select', function () {
        var v = $(this).val();
        new Promise(resolve => v == '所有车间' ? getDeviceList(resolve) : getWorkShopDevice(resolve, v)).then(e => $('#productionDevice').empty().append(e).trigger('select2:select'));
    });
    $('#productionDevice').on('select2:select', function () {
        $('#deviceType').text(_deviceType[$(this).val()]);
    });
    var time = 0;
    $('#production_chart').on('resize', function () {
        clearTimeout(time);
        time = setTimeout(() => echarts.init($(this)[0]).resize(), 200);
    });
}

function radioTime() {
    var start = $("#selectStartDate").val() + " " + $("#selectStartTime").val();
    if (start.slice(start.indexOf(" ") + 1, start.indexOf(":")).length == 1) {
        start = $("#selectStartDate").val() + " " + "0" + $("#selectStartTime").val();
    }
    var end = $("#selectEndDate").val() + " " + $("#selectEndTime").val();
    if (end.slice(end.indexOf(" ") + 1, end.indexOf(":")).length == 1) {
        end = $("#selectEndDate").val() + " " + "0" + $("#selectEndTime").val();
    }
    if (!(exceedTime(start) || exceedTime(end)) && !compareDate(start, end)) {
        $("#parTime label").removeClass("hidden");
        var leadTime = new Date(end) - new Date(start);
        if (leadTime > leadTimeDay) {
            $("#parTime label").eq(0).addClass("hidden");
            $("#parTime label").eq(0).iCheck("uncheck");
            if (leadTime > leadTimeMonth) {
                $("#parTime label").eq(1).addClass("hidden");
                $("#parTime label").eq(1).iCheck("uncheck");
            }
        } else {
            $("#parTime label").eq(3).addClass("hidden");
            $("#parTime label").eq(3).iCheck("uncheck");
            if (leadTime <= leadTimeHour) {
                $("#parTime label").eq(2).addClass("hidden");
                $("#parTime label").eq(2).iCheck("uncheck");
                if (leadTime <= leadTimeMinute) {
                    $("#parTime label").eq(1).addClass("hidden");
                    $("#parTime label").eq(1).iCheck("uncheck");
                }
            }
        }
    } else {
        $("#parTime label").removeClass("hidden");
    }
}
//时差1分钟
var leadTimeMinute = 60000;
//时差1小时
var leadTimeHour = 3600000;
//时差1天
var leadTimeDay = 86400000;
//时差1月
var leadTimeMonth = 2592000000;

//获取车间
function getWorkShopList() {
    var data = {}
    data.opType = 162;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        var op = '<option value = "{0}">{0}</option>';
        var ops = '<option value = "所有车间">所有车间</option>';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            ops += op.format(d.Name);
        }
        $("#selectWorkShop,#selectWorkShop1,#productionWorkShop").empty().append(ops);
    });
}

var _deviceType = null;
//获取所有设备
function getDeviceList(resolve) {
    var data = {}
    data.opType = 100;
    data.opData = JSON.stringify({ detail: true, work: true });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            _deviceType = {};
            var rData = ret.datas;
            rData.sort((a, b) => a.Code - b.Code);
            var op = '<option value="{0}">{1}</option>';
            var ops = '';
            for (var i = 0, len = rData.length; i < len; i++) {
                var d = rData[i];
                ops += op.format(d.Id, d.Code);
                _deviceType[d.Id] = d.CategoryName;
            }
            if (resolve) {
                resolve(ops);
            } else {
                $('#selectDevice').empty().append(`<option value="0">所有设备</option>${ops}`);
                $('#selectDevice1,#productionDevice').empty().append(ops);
                $('#deviceType').text(_deviceType[$('#productionDevice').val()]);
            }
        });
}

//获取车间设备
function getWorkShopDevice(resolve, workShop) {
    var data = {}
    data.opType = 163;
    data.opData = JSON.stringify({
        workshopName: workShop
    });
    ajaxPost("/Relay/Post", data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var op = '<option value="{0}">{1}</option>';
        var ops = '';
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            ops += op.format(d.Id, d.Code);
        }
        resolve(ops);
    });
}

var dataTime;
function createChart(start1, end1) {
    var deviceId = $("#selectDevice").val();
    if (isStrEmptyOrUndefined(deviceId)) {
        layer.msg("请选择设备");
        return;
    }
    if (!$("#par label").find(".icb_minimal").is(":checked")) {
        layer.msg("请选择参数");
        return;
    }
    var workShop = $("#selectWorkShop").val();
    if (isStrEmptyOrUndefined(workShop)) {
        layer.msg('请选择车间');
        return;
    }
    var devEl = $('#selectDevice :selected');
    var deviceName = [];
    for (var i = 0, len = devEl.length; i < len; i++) {
        deviceName.push(devEl.eq(i).text());
    }
    var start;
    if (isStrEmptyOrUndefined(start1)) {
        start = $("#selectStartDate").val() + " " + $("#selectStartTime").val();
    } else {
        start = start1;
        $("#selectStartDate").val(start1.split(" ")[0]).datepicker('update');
        $("#selectStartTime").val(start1.split(" ")[1]).timepicker('setTime', start1.split(" ")[1]);
    }
    var end;
    if (isStrEmptyOrUndefined(end1)) {
        end = $("#selectEndDate").val() + " " + $("#selectEndTime").val();
    } else {
        end = end1;
        $("#selectEndDate").val(end.split(" ")[0]).datepicker('update');
        $("#selectEndTime").val(end.split(" ")[1]).timepicker('setTime', end.split(" ")[1]);
    }
    if (exceedTime(start)) {
        layer.msg("开始时间不能大于当前时间");
        return;
    }
    if (compareDate(start, end)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }
    //秒
    dataTime = 0;
    var endStart = new Date(end) - new Date(start);
    if (leadTimeMonth > endStart && endStart >= leadTimeDay) {
        //小时
        dataTime = 1;
    }
    if (endStart >= leadTimeMonth) {
        //天
        dataTime = 2;
    }
    if (endStart >= leadTimeHour && endStart < leadTimeDay) {
        //分钟
        dataTime = 3;
    }
    if ($("#parTime .icb_minimal").is(":checked")) {
        dataTime = $("#parTime").find("input:checked").val();
    }
    var data = {}
    data.opType = 502;
    data.opData = JSON.stringify({
        WorkshopName: workShop == '所有车间' ? '' : workShop,
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
            $("#recordChart").empty();
            var i, len = $("#par label").find(".icb_minimal").length;
            var count = -1;
            var formatter = function (params, ticket, callback) {
                var formatter1 = "{0}: {1}<br/>";
                var formatter2 = "";
                for (var i = 0, l = params.length; i < l; i++) {
                    var xName = params[i].name;
                    formatter2 += formatter1.format(
                        params[i].seriesName,
                        params[i].seriesName == "使用率"
                            ? params[i].value + "%"
                            : params[i].value);
                }
                return xName + "<br/>" + formatter2;
            }
            var time = [];
            for (i = 0; i < len; i++) {
                var ick = $("#par label").find(".icb_minimal")[i];
                var span = $("#par label")[i];
                var listName = [];
                var legend;
                var data = [];
                var j, a, q, k;
                if ($(ick).is(":checked")) {
                    count++;
                    listName[$(span).text()] = $(ick).val();
                    legend = $(span).text();
                    var legendTf = (legend == "同时加工台数" || legend == "总台数" || legend == "使用率" ? true : false);
                    var key;
                    for (key in listName) {
                        if (listName.hasOwnProperty(key)) {
                            data[key] = [];
                        }
                    }
                    objectSort(ret.datas, "DeviceId");
                    objectSort(ret.datas, "Time");
                    for (j = 0; j < ret.datas.length; j++) {
                        if (count == 0) {
                            var timeData = ret.datas[j].Time;
                            dataTime == 2 ? time.push(timeData.split(" ")[0]) : time.push(timeData.replace(" ", "\n"));
                        }
                        var parData = ret.datas[j];
                        for (key in listName) {
                            if (listName.hasOwnProperty(key)) {
                                if (legendTf) {
                                    data[key].push(parData[listName[key]]);
                                } else {
                                    for (a = data[key].length % deviceId.length; a < deviceId.length; a++) {
                                        if (deviceId[a] == parData.DeviceId) {
                                            data[key].push(parData[listName[key]]);
                                            if (j == ret.datas.length - 1 && data[key].length % deviceId.length != 0) {
                                                for (q = 0; q < data[key].length % deviceId.length; q++) {
                                                    data[key].push("x");
                                                }
                                                break;
                                            } else {
                                                break;
                                            }
                                        } else {
                                            data[key].push("x");
                                            if (key == legend && a == deviceId.length - 1) {
                                                j--;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (count == 0) {
                        time = distinct(time);
                    }
                    var rData = [];
                    for (key in listName) {
                        if (listName.hasOwnProperty(key)) {
                            if (legendTf) {
                                rData.push({
                                    name: legend,
                                    type: "line",
                                    data: data[key],
                                    showSymbol: false,
                                    sampling: 'average',
                                    showAllSymbol: false
                                });
                            } else {
                                for (k = 0; k < deviceName.length; k++) {
                                    rData.push({
                                        name: deviceName[k],
                                        type: "line",
                                        data: data[key].filter(function (item, index, array) {
                                            return index % deviceName.length == k;
                                        }),
                                        showSymbol: false,
                                        sampling: 'average',
                                        showAllSymbol: false
                                    });
                                }
                            }
                        }
                    }
                    var charts = '<div id="chart' + count + '" style="width: 100%; height: 500px">' + '</div>';
                    $("#recordChart").append(charts);
                    var myChart = echarts.init(document.getElementById("chart" + count));
                    var option = {
                        title: {
                            text: legend
                        },
                        tooltip: {
                            trigger: "axis",
                            formatter: formatter
                        },
                        grid: {
                            bottom: 70
                        },
                        xAxis: {
                            type: "category",
                            data: time,
                            axisLine: {
                                onZero: false
                            }
                        },
                        yAxis: {
                            type: "value"
                        },
                        legend: {
                            data: legendTf ? [legend] : deviceName
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
            $("#recordChart").resize(function () {
                len = $("#recordChart").children().length;
                for (i = 0; i < len; i++) {
                    echarts.init(document.getElementById("chart" + i)).resize();
                }
            });
            //var option = {
            //    tooltip: {
            //        trigger: "axis",
            //        formatter: function (params, ticket, callback) {
            //            var formatter1 = "{0}: {1}<br/>";
            //            var formatter2 = "{0}: {1}%<br/>";
            //            var formatter = "";
            //            for (var i = 0, l = params.length; i < l; i++) {
            //                var xName = params[i].name;
            //                if (deviceId.length > 1) {
            //                    formatter += (params[i].seriesName == "使用率" ? formatter2 : formatter1).format(
            //                        params[i].seriesName == "同时加工台数" ||
            //                            params[i].seriesName == "总台数" ||
            //                            params[i].seriesName == "使用率"
            //                            ? params[i].seriesName
            //                            : "<span style='color:#99ff00'>" + deviceName[i % deviceName.length] + "</span>" + "-" + params[i].seriesName,
            //                        params[i].value);
            //                } else {
            //                    formatter += (params[i].seriesName == "使用率" ? formatter2 : formatter1).format(
            //                        params[i].seriesName,
            //                        params[i].value);
            //                }
            //            }
            //            return xName + "<br/>" + formatter;
            //        }
            //    },
            //    xAxis: {
            //        data: time,
            //        axisLine: {
            //            onZero: false
            //        }
            //    },
            //    yAxis: {},
            //    legend: {
            //        data: legend
            //    },
            //    series: rData,
            //    dataZoom: [{
            //        type: "slider",
            //        start: 0,
            //        end: 100
            //    },
            //    {
            //        type: "inside",
            //        start: 0,
            //        end: 100
            //    }],
            //    toolbox: {
            //        top: 20,
            //        left: "center",
            //        feature: {
            //            dataZoom: {
            //                yAxisIndex: "none"
            //            },
            //            dataView: {
            //                show: true, title: '数据视图', readOnly: true, optionToContent: function (opt) {
            //                    var axisData = opt.xAxis[0].data;//坐标数据
            //                    var series = opt.series;//折线图数据
            //                    var tdHead = '<td style="padding:0 10px">时间</td>';//表头
            //                    var tdBody = '';//数据
            //                    series.forEach(function (item, index) {
            //                        //组装表头
            //                        if (deviceName.length > 1) {
            //                            var len = deviceName.length;
            //                            var devName = '<font color="blue">' + deviceName[index % len] + '</font>';
            //                            if (item.name == "同时加工台数" || item.name == "总台数" || item.name == "使用率") {
            //                                tdHead += '<td style="padding: 0 10px">' + item.name + '</td>';
            //                            } else {
            //                                tdHead += '<td style="padding: 0 10px">' + devName + item.name + '</td>';
            //                            }
            //                        } else {
            //                            tdHead += '<td style="padding: 0 10px">' + item.name + '</td>';
            //                        }
            //                    });
            //                    var table = '<table border="1" style="margin-left:20px;border-collapse:collapse;font-size:14px;text-align:center"><tbody><tr>' + tdHead + '</tr>';
            //                    for (var i = 0, l = axisData.length; i < l; i++) {
            //                        for (var j = 0; j < series.length; j++) {
            //                            //组装表数据
            //                            if (series[j].name == "使用率") {
            //                                tdBody += '<td>' + series[j].data[i] + '%' + '</td>';
            //                            } else {
            //                                tdBody += '<td>' + series[j].data[i] + '</td>';
            //                            }
            //                        }
            //                        table += '<tr><td style="padding: 0 10px">' + axisData[i] + '</td>' + tdBody + '</tr>';
            //                        tdBody = '';
            //                    }
            //                    table += '</tbody></table>';
            //                    return table;
            //                }
            //            },
            //            restore: {},
            //            magicType: {
            //                type: ['line', 'bar']
            //            }
            //        }
            //    }
            //};
            //myChart.setOption(option, true);
            //$("section").resize(function () {
            //    myChart.resize();
            //});
            //var tf = true;
            //myChart.on('dataZoom', function (params) {
            //    if (time.length == 0) {
            //        return;
            //    }
            //    var chartData = myChart.getOption();
            //    var chartZoom = chartData.dataZoom[0];
            //    var starts = chartData.xAxis[0].data[chartZoom.startValue];
            //    var ends = chartData.xAxis[0].data[chartZoom.endValue];
            //    //var timeX = ends.replace(/[^0-9]+/g, "") - starts.replace(/[^0-9]+/g, "");
            //    var timeX = new Date(ends) - new Date(starts);
            //    //var timeY = time[time.length - 1].replace(/[^0-9]+/g, "") - time[0].replace(/[^0-9]+/g, "");
            //    var timeY = new Date(time[time.length - 1]) - new Date(time[0]);
            //    if (timeX == 86400000 && timeY != 86400000 && tf && ends.length == 10) {
            //        tf = false;
            //        starts = starts + " 00:00:00";
            //        ends = ends + " 00:00:00";
            //        setTimeout(function () {
            //            createChart(starts, ends);
            //            tf = true;
            //        }, 1000);
            //    }
            //    if (timeX == 3600000 && timeY != 3600000 && tf) {
            //        tf = false;
            //        setTimeout(function () {
            //            createChart(starts, ends);
            //            tf = true;
            //        }, 1000);
            //    }
            //    if (timeX == 60000 && timeY != 60000 && tf) {
            //        tf = false;
            //        setTimeout(function () {
            //            createChart(starts, ends);
            //            tf = true;
            //        }, 1000);
            //    }
            //});
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

function selectPlan() {
    const data = {
        opType: 215,
        opData: JSON.stringify({ menu: true })
    };
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var rData = ret.datas;
            var op = "<option value='{0}'>{1}</option>";
            var ops = '';
            for (var i = 0, len = rData.length; i < len; i++) {
                var d = rData[i];
                ops += op.format(d.Id, d.ProductionProcessName);
            }
            $('#selectJhList').empty().append(ops);
        });
}

function getProcessDetail() {
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
    var day2Date = $("#selectDay2Date").val();
    if (compareDate(dayDate, day2Date)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }
    if (exceedTime(dayDate) || exceedTime(day2Date)) {
        layer.msg("所选时间不能大于当前时间");
        return;
    }
    var list = {
        DeviceId: deviceId.join(","),
        StartTime: dayDate,
        EndTime: day2Date
    }
    var plan = 0;
    if ($(".planHead").is(":checked")) {
        plan = $("#selectJhList").val();
        list["ProductionId"] = plan;
    }
    var data = {}
    data.opType = 506;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var panel =
                `<div class="panel panel-primary">
                    <div class="panel-heading flexStyle" style="justify-content:space-between;flex-wrap:wrap">
                    <div>
                        <h3 class="panel-title badge" id="code{0}" style="color:green"></h3>
                        <h3 class="panel-title badge" id="time1_{0}"></h3>
                        <h3 class="panel-title badge" id="time2_{0}"></h3>
                    </div>
                    <div>
                        <h3 class="panel-title badge" id="num1_{0}"></h3>
                        <h3 class="panel-title badge" id="num2_{0}"></h3>
                        <h3 class="panel-title badge pointer" onclick="rateList({0},{1},\'{2}\',\'{3}\', \'{4}\')">刷新</h3>
                    </div>
                </div>
                <div class="table-responsive mailbox-messages" style="padding:10px">
                    <table class="table table-hover table-striped" id="processList{0}"></table>
                </div>`;
            var i, len = ret.datas.length;
            $("#processDetailData").empty();
            var op = function (data, type, row) {
                return data.OpName == "加工"
                    ? '<button type="button" class="btn btn-info btn-xs" onclick="showProcessDetailModel(\'{0}\')">详情</button>'
                        .format(escape(data.ProcessData))
                    : "";
            }
            var order = function (data, type, row, meta) {
                return ++meta.row;
            }
            var opName = function (data, type, row, meta) {
                return data.ProcessType == 0 ? `<span class="text-red">${data.OpName}</span>` : data.OpName;
            }
            var time = function (data, type, row) {
                return data.EndTime == "0001-01-01 00:00:00" ? `${data.OpName}中` : data.EndTime;
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
            var code = [];
            for (i = 0; i < len; i++) {
                var processData = ret.datas[i];
                if (processData.Logs.length > 0) {
                    var option = $(panel.format(i, processData.DeviceId, escape(dayDate), escape(day2Date), escape(plan))).clone();
                    $("#processDetailData").append(option);
                    var codeName = processData.Logs[0].Code;
                    code.push(codeName);
                    $("#code" + i).prepend(codeName);
                    $(`#num1_${i}`).text(`总加工次数：${processData.Count}次`);
                    $(`#num2_${i}`).text(`日均加工次数：${processData.CountAvg}次`);
                    //var meanTime = 0;
                    //var k, timeLen = processData.Logs.length;
                    //var arr = [];
                    //for (k = 0; k < timeLen; k++) {
                    //    var d = processData.Logs[k];
                    //    if (d.OpName == "加工") {
                    //        var t = d.TotalTime;
                    //        meanTime += t;
                    //        arr.push(d.FlowCardName);
                    //    }
                    //}
                    //timeLen = distinct(arr).length;
                    //if (timeLen) {
                    //    meanTime = Math.round(meanTime / timeLen);
                    //}
                    $(`#time1_${i}`).text("总加工时间：" + codeTime(processData.Time));
                    $(`#time2_${i}`).text("单次加工时间：" + codeTime(processData.TimeAvg));
                    $("#processList" + i).DataTable({
                        dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                        "destroy": true,
                        "paging": true,
                        "deferRender": false,
                        "bLengthChange": false,
                        "searching": false,
                        "language": oLanguage,
                        "data": processData.Logs,
                        "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
                        "iDisplayLength": 5, //默认显示的记录数  
                        "columns": [
                            { "data": null, "title": "序号", "render": order },
                            { "data": null, "title": "操作", "render": opName },
                            { "data": "StartTime", "title": "开始时间" },
                            { "data": null, "title": "结束时间", "render": time },
                            { "data": null, "title": "加工时间", "render": totalTime },
                            { "data": "ProductionProcessName", "title": "计划号" },
                            { "data": "FlowCardName", "title": "流程卡号" },
                            { "data": null, "title": "工艺", "render": op },
                            { "data": null, "title": "片厚", "render": actualThickness },
                            { "data": null, "title": "要求", "render": requirementMid },
                            { "data": "ProcessorName", "title": "加工人" }
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
                $("#noProcessDetailData").append('<label class="control-label">无加工记录设备:</label>');
                $.each(noProcess, function (index, item) {
                    $("#noProcessDetailData").append('<span style="margin-left:5px;color:red;font-weight:bold">' + item + '</span>');
                });
            } else {
                $("#noProcessDetailData").addClass("hidden");
            }
        });
}

function rateList(i, deviceId, startTime, endTime, plan) {
    var data = {}
    var list = {
        DeviceId: deviceId,
        StartTime: startTime,
        EndTime: endTime
    }
    if (plan != 0) {
        list["ProductionId"] = plan;
    }
    data.opType = 506;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var processCount = ret.datas[0].Count + "次";
        var rData = ret.datas[0].Logs;
        $("#num" + i).text("每日加工次数：" + processCount);
        var order = function (data, type, row, meta) {
            return ++meta.row;
        }
        var opName = function (data, type, row, meta) {
            return data == "闲置" ? `<span class="text-red">${data}</span>` : data;
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
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            "destroy": true,
            "paging": true,
            "deferRender": false,
            "bLengthChange": false,
            "searching": false,
            "language": oLanguage,
            "data": rData,
            "aLengthMenu": [5, 10, 15], //更改显示记录数选项  
            "iDisplayLength": 5, //默认显示的记录数  
            "columns": [
                { "data": null, "title": "序号", "render": order },
                { "data": "OpName", "title": "操作", "render": opName },
                { "data": "StartTime", "title": "开始时间" },
                { "data": null, "title": "结束时间", "render": time },
                { "data": null, "title": "加工时间", "render": totalTime },
                { "data": "ProductionProcessName", "title": "计划号" },
                { "data": "FlowCardName", "title": "流程卡号" },
                { "data": null, "title": "工艺", "render": op },
                { "data": null, "title": "片厚", "render": actualThickness },
                { "data": null, "title": "要求", "render": requirementMid },
                { "data": "ProcessorName", "title": "加工人" }
            ]
        });
        var meanTime = 0;
        var k, timeLen = rData.length;
        var arr = [];
        for (k = 0; k < timeLen; k++) {
            var d = rData[k];
            if (d.OpName == "加工") {
                var t = d.TotalTime;
                meanTime += t;
                arr.push(d.FlowCardName);
            }
        }
        timeLen = distinct(arr).length;
        if (timeLen) {
            meanTime = Math.round(meanTime / timeLen);
        }
        $("#meanTime" + i).text("平均加工时间：" + codeTime(meanTime));
    });
}

function showProcessDetailModel(data) {
    data = unescape(data);
    data = JSON.parse(data);
    var rData = [];
    var forcing = 0, process = 0;
    var i, len = Object.keys(data).length;
    for (i = 0; i < len; i++) {
        var v = Object.keys(data)[i];
        forcing += data[v][0] * 60 + data[v][1];
        process += data[v][2] * 60 + data[v][3];
        rData.push({
            forcing: data[v][0] + " : " + data[v][1],
            process: data[v][2] + " : " + data[v][3],
            stress: data[v][4],
            rotate: data[v][5]
        });
    }
    var forcingM = Math.floor(forcing / 60) + " : " + forcing % 60;
    var processM = Math.floor(process / 60) + " : " + process % 60;
    rData.push({
        forcing: forcingM,
        process: processM,
        stress: "",
        rotate: ""
    });
    var o = 0;
    var order = function (data, type, row) {
        if (o == rData.length - 1) {
            return "总计";
        }
        return ++o;
    }
    $("#processList").DataTable({
        dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
        "destroy": true,
        "paging": false,
        "deferRender": false,
        "bLengthChange": false,
        "info": false,
        "searching": false,
        "bSort": false,
        "language": oLanguage,
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

//生产数据
function getProductionChart() {
    var deviceId = $('#productionDevice').val();
    if (isStrEmptyOrUndefined(deviceId)) {
        layer.msg('请选择设备');
        return;
    }
    var sTime = $('#productionSTime').val();
    if (isStrEmptyOrUndefined(sTime)) {
        layer.msg('请选择开始时间');
        return;
    }
    var eTime = $('#productionETime').val();
    if (isStrEmptyOrUndefined(eTime)) {
        layer.msg('请选择结束时间');
        return;
    }
    if (compareDate(sTime, eTime)) {
        layer.msg('结束时间不能小于开始时间');
        return;
    }
    sTime += ' 00:00:00';
    eTime += ' 23:59:59';
    var pars = $('#production_par input');
    if (!pars.is(':checked')) {
        layer.msg('请选择参数');
        return;
    }
    var data = {}
    data.opType = 508;
    data.opData = JSON.stringify({
        DeviceId: deviceId,
        StartTime: sTime,
        EndTime: eTime
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            $('#production_chart').removeClass('hidden');
            var rData = ret.datas;
            var i, len, d;
            var chartData = {
                Time: [],
                FaChu: [],
                HeGe: [],
                LiePian: [],
                Rate: [],
                ProcessTime: []
            };
            for (i = 0, len = rData.length; i < len; i++) {
                d = rData[i];
                chartData.Time.push(d.Time.replace(' ', '\n'));
                chartData.FaChu.push(d.FaChu);
                chartData.HeGe.push(d.HeGe);
                chartData.LiePian.push(d.LiePian);
                chartData.Rate.push(d.Rate);
                chartData.ProcessTime.push(d.ProcessTime);
            }
            var seriesData = [], legendData = [];
            var parNames = $('#production_par span');
            for (i = 0, len = pars.length; i < len; i++) {
                var par = pars.eq(i);
                if (par.is(':checked')) {
                    var v = par.val();
                    var legName = parNames.eq(i).text();
                    legendData.push(legName);
                    seriesData.push({
                        name: legName,
                        type: 'line',
                        data: chartData[v]
                    });
                }
            }
            var option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: params => {
                        var formatter = '';
                        for (i = 0, len = params.length; i < len; i++) {
                            d = params[i];
                            var seriesName = d.seriesName;
                            formatter += `${d.marker}${seriesName}：${seriesName == '合格率' ? (d.value * 100) + '%' : d.value}<br>`;
                        }
                        return `${params[0].name}<br>${formatter}`;
                    }
                },
                legend: {
                    data: legendData
                },
                grid: {
                    left: '3%',
                    right: '3%',
                    top: '10%',
                    bottom: '8%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: chartData.Time
                },
                yAxis: {
                    type: 'value'
                },
                series: seriesData,
                dataZoom: [{
                    type: 'inside'
                }, {
                    handleIcon: _handleIcon,
                    handleSize: '80%',
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                }],
                toolbox: {
                    left: 'center',
                    top: '3%',
                    feature: {
                        dataZoom: {
                            yAxisIndex: "none"
                        },
                        restore: {}
                    }
                }
            };
            echarts.init($('#production_chart')[0]).setOption(option, true);
        });
}