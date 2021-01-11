var _permissionList = [];
function pageReady() {
    _permissionList[689] = { uIds: ['createChartBtn0'] };
    _permissionList[690] = { uIds: ['createChartBtn1'] };
    _permissionList = checkPermissionUi(_permissionList);
    $(".ms2").select2();
    getDeviceChart();
    getDevicePar();
    $("#selectDevice").select2();
    $("#selectStartDate").val(getDate()).datepicker('update');
    $("#selectEndDate").val(getDate()).datepicker('update');
    $("#device").click(function () {
        time = null;
        v = null;
        $("#main").empty();
        $("#selectDevice").val($("#selectDevice option").eq(0).val()).trigger("change");
        $("#selectStartDate").val(getDate()).datepicker('update');
        $("#selectEndDate").val(getDate()).datepicker('update');
        $("#selectStartTime").val(getTime()).timepicker('setTime', getTime());
        $("#selectEndTime").val(getTime()).timepicker('setTime', getTime());
        $("#selectPar .icb_minimal").iCheck('uncheck');
        $("#deviceCode").text("趋势图");
        $("#body").css("display", "none");
        $("#body").slideDown();
        $("#body2").addClass("hidden");
        $("#body1").removeClass("hidden");
        $("#button2").addClass("hidden");
        $("#button1").removeClass("hidden");
    });
    $("#flowCard").click(function () {
        time = null;
        v = null;
        $("#main").empty();
        $("#inputFlowCard").val("");
        $("#selectProcess").empty();
        $("#selectProcess").parent().addClass("hidden");
        $("#selectPar .icb_minimal").iCheck('uncheck');
        $("#deviceCode").text("趋势图");
        $("#body1").addClass("hidden");
        $("#body2").removeClass("hidden");
        $("#button1").addClass("hidden");
        $("#button2").removeClass("hidden");
        $("#body").css("display", "none");
        $("#body").slideDown();
    });
    $("#flowCardEmpty").click(function () {
        $("#inputFlowCard").val("");
    });
    $("#inputFlowCard").on("input", function () {
        $("#main").empty();
        $("#deviceCode").text("趋势图");
        $("#selectProcess").empty();
        $("#selectProcess").parent().addClass("hidden");
        $("#selectPar .icb_minimal").iCheck('uncheck');
    });
}

function getDeviceChart() {
    var data = {}
    data.opType = 100;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            ret.datas.sort((a, b) => a.Code - b.Code);
            $("#selectDevice").empty();
            var option1 = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#selectDevice").append(option1.format(data.Id, data.Code));
            }
        });
}

var parList = null;
function getDevicePar() {
    parList = [];
    var data = {}
    data.opType = 500;
    ajaxPost("/Relay/Post",
        data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var option2 = '<div class="form-inline" style="margin:10px 0 0 20px">' +
                '<input type="checkbox" value="{0},{1}"class="icb_minimal">' +
                '<label class="control-label" style="margin-left:5px">{1}</label>' +
                '</div>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#selectPar").append(option2.format(data.Id, data.VariableName));
            }
            $("#selectPar .icb_minimal").iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_minimal-blue',
                radioClass: 'iradio_minimal-blue',
                increaseArea: '20%'
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
function createChart(type) {
    time = new Array();
    v = new Object();
    if (type == 0) {
        var device = $("#selectDevice").val();
        var start = $("#selectStartDate").val() + " " + $("#selectStartTime").val();
        var end = $("#selectEndDate").val() + " " + $("#selectEndTime").val();
        if (exceedTime(start)) {
            layer.msg("开始时间不能大于当前时间");
            return;
        }
        if (compareDate(start, end)) {
            layer.msg("结束时间不能小于开始时间");
            return;
        }
        //时间间隔1天
        var leadTimeDay = 86400000;
        //时间间隔1月
        var leadTimeMonth = 2592000000;
        var endStart = new Date(end) - new Date(start);
        if (endStart > leadTimeDay) {
            layer.msg("时间范围不能超过一天");
            return;
        }
        var dataTime = 0;
        if (leadTimeMonth > endStart && endStart >= leadTimeDay) {
            dataTime = 1;
        }
        if (endStart >= leadTimeMonth) {
            dataTime = 2;
        }
        parList.sort(function (x, y) {
            return parseInt(x.slice(0, x.indexOf(","))) > parseInt(y.slice(0, y.indexOf(","))) ? 1 : -1;
        });
        var list = parList.join();
        if (isStrEmptyOrUndefined(list)) {
            layer.msg("请选择参数");
            $("#deviceCode").text("趋势图");
            return;
        }
        var newList = list.split(",");
        var listId = [], listName = [];
        for (var j = 0; j < newList.length; j++) {
            if (j % 2 == 0) {
                listId.push(newList[j]);
            } else {
                listName.push(newList[j]);
            }
        }
        var parId = listId.join(",");
        var code = $("#selectDevice").find("option:selected").text();
        $("#deviceCode").text(code);

        var data = {}
        data.opType = 501;
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
                var len = listId.length;
                for (var i = 0, lens = ret.datas.length; i < lens; i++) {
                    var dt = ret.datas[i];
                    if (dataTime == 2) {
                        time.push(dt.time.split(" ")[0]);
                    }
                    if (dataTime == 1) {
                        time.push(dt.time);
                    }
                    if (dataTime == 0) {
                        var firstTime = dt.time.split(" ")[1];
                        if (firstTime.slice(0, 1) == 0) {
                            time.push(firstTime.slice(1, firstTime.length));
                        } else {
                            time.push(firstTime);
                        }
                    }
                    for (var d = 0; d < len; d++) {
                        var key = "v" + listId[d];
                        if (isStrEmptyOrUndefined(v[key])) {
                            v[key] = [];
                        }
                        var par = listName[d];
                        if (par.indexOf('转速') != -1) {
                            v[key].push(Math.round(dt[key] / 100));
                        } else {
                            v[key].push(dt[key]);
                        }
                    }
                }
                $("#main").empty();
                for (var s = 0; s < listName.length; s++) {
                    var charts = '<div id="chart' + s + '" style="width: 100%; height: 500px">' + '</div>';
                    if (s > 0) {
                        $("#main").append('<div class="box-footer">' + charts + "</div>");
                    } else {
                        $("#main").append(charts);
                    }
                    var parName = listName[s];
                    var myChart = echarts.init(document.getElementById("chart" + s));
                    var option = {
                        title: {
                            text: parName
                        },
                        tooltip: {
                            trigger: "axis"
                        },
                        xAxis: {
                            type: "category",
                            data: time
                        },
                        yAxis: {
                            type: "value"
                        },
                        series: [{
                            name: parName,
                            type: "line",
                            data: v[Object.keys(v)[s]],
                            showSymbol: false,
                            sampling: 'average',
                            showAllSymbol: false
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
                                restore: {}
                            }
                        }
                    };
                    myChart.setOption(option, true);
                }
                $("#main").resize(function () {
                    var len = $("#main").children().length;
                    for (var k = 0; k < len; k++) {
                        echarts.init(document.getElementById("chart" + k)).resize();
                    }
                });
            });
    }
    if (type == 1) {
        if (isStrEmptyOrUndefined($("#selectProcess").val())) {
            layer.msg("请先输入流程卡号查询选择工序");
            return;
        }
        var flowCardId = $("#selectProcess").val().trim();
        var order = $("#selectProcess option:selected").attr("order");
        parList.sort(function (x, y) {
            return parseInt(x.slice(0, x.indexOf(","))) > parseInt(y.slice(0, y.indexOf(","))) ? 1 : -1;
        });
        var list1 = parList.join();
        if (isStrEmptyOrUndefined(list1)) {
            layer.msg("请选择参数");
            $("#deviceCode").text("趋势图");
            return;
        }
        var newList1 = list1.split(",");
        var listId1 = [], listName2 = [];
        for (var i = 0; i < newList1.length; i++) {
            if (i % 2 == 0) {
                listId1.push(newList1[i]);
            } else {
                listName2.push(newList1[i]);
            }
        }
        var parId1 = listId1.join(",");
        var code1 = $("#selectProcess option:selected").attr("device");
        isStrEmptyOrUndefined(code1) ? $("#deviceCode").text("趋势图") : $("#deviceCode").text(code1);

        var data1 = {}
        data1.opType = 503;
        data1.opData = JSON.stringify({
            FlowCardId: flowCardId,
            Order: order,
            Field: parId1
        });
        ajaxPost("/Relay/Post", data1,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }
                for (var i = 0; i < ret.datas.length; i++) {
                    time[i] = ret.datas[i].time;
                    for (var j = 0; j < listId1.length; j++) {
                        var key = "v" + listId1[j];
                        if (isStrEmptyOrUndefined(v[key])) {
                            v[key] = [];
                        }
                        v[key].push(ret.datas[i][key]);
                    }
                }
                $("#main").empty();
                for (var i = 0; i < listName2.length; i++) {
                    var charts = '<div id="chart' + i + '" style="width: 100%; height: 500px">' + '</div>';
                    if (i > 0) {
                        $("#main").append('<div class="box-footer">' + charts + "</div>");
                    } else {
                        $("#main").append(charts);
                    }
                    var parName = listName2[i];
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
                        series: [{
                            name: parName,
                            type: "line",
                            data: v[Object.keys(v)[i]]
                        }],
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
                            top: 18,
                            left: "center",
                            feature: {
                                dataZoom: {
                                    yAxisIndex: "none"
                                },
                                restore: {}
                            }
                        }
                    };
                    myChart.setOption(option, true);
                }
                $("#main").resize(function () {
                    for (var k = 0; k < listName2.length; k++) {
                        echarts.init(document.getElementById("chart" + k)).resize();
                    }
                });
            });
    }
}

function queryFlowCard() {
    var flowCard = $("#inputFlowCard").val().trim();
    if (isStrEmptyOrUndefined(flowCard)) {
        showTip("inputFlowCardTip", "流程卡号不能为空");
        $("#inputFlowCardTip").removeClass("hidden");
        return;
    }
    var data = {}
    data.opType = 202;
    data.opData = JSON.stringify({
        FlowCard: flowCard
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            $("#selectProcess").empty();
            var option = '<option value="{0}" order="{1}" device="{3}">{2}</option>';
            for (var i = 0; i < ret.processSteps.length; i++) {
                var data = ret.processSteps[i];
                $("#selectProcess").append(option.format(data.FlowCardId, data.ProcessStepOrder, data.CategoryName + "-" + data.StepName, data.Code));
            }
            if (ret.processSteps.length == 0) {
                layer.msg("该流程卡号没有工序");
                $("#selectProcess").parent().addClass("hidden");
                return;
            }
            $("#selectProcess").parent().removeClass("hidden");
        });
}
