function pageReady() {
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
    $("#inputFlowCard")[0].addEventListener("input", function () {
        $("#main").empty();
        $("#deviceCode").text("趋势图");
        $("#selectProcess").empty();
        $("#selectProcess").parent().addClass("hidden");
        $("#selectPar .icb_minimal").iCheck('uncheck');
    });
    $("#scanning").click(function () {
        videos++;
        if (videos % 2 == 0) {
            closeVideo.stop();
            clearInterval(canImg);
            $("#video").addClass("hidden");
            return;
        }
        if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
            //调用用户媒体设备, 访问摄像头
            getUserMedia({
                video: {
                    width: 290,
                    height: 290,
                    facingMode: "environment"
                }
            },
                success,
                error);
        } else {
            layer.msg('不支持访问用户媒体');
        }
        $("#video").removeClass("hidden");
        canImg = setInterval("capture()", 500);
    });
    $("#upload").click(function () {
        if (videos % 2 != 0) {
            closeVideo.stop();
        }
        clearInterval(canImg);
        $("#video").addClass("hidden");
        var uploadImg = setInterval($("#file").click(), 1000);
        clearInterval(uploadImg);
        videos = 0;
    });
    $("#file").change(function () {
        addCover();
        fileImg = setInterval("fileUp()", 1000);
    });
    if (!pcAndroid()) {
        $("#scanning").addClass("hidden");
    }
}

var videos = 0;
var canImg;
var fileImg;
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
        var opType = 501;
        if (!checkPermission(opType)) {
            layer.msg("没有权限");
            return;
        }
        var device = $("#selectDevice").val();
        var start = $("#selectStartDate").val() + " " + $("#selectStartTime").val();
        if (start.slice(start.indexOf(" ") + 1, start.indexOf(":")) % 10 == start.slice(start.indexOf(" ") + 1, start.indexOf(":"))) {
            start = $("#selectStartDate").val() + " " + "0" + $("#selectStartTime").val();
        }
        var end = $("#selectEndDate").val() + " " + $("#selectEndTime").val();
        if (end.slice(end.indexOf(" ") + 1, end.indexOf(":")) % 10 == end.slice(end.indexOf(" ") + 1, end.indexOf(":"))) {
            end = $("#selectEndDate").val() + " " + "0" + $("#selectEndTime").val();
        }
        var endStart = end.replace(/[^0-9]+/g, "") - start.replace(/[^0-9]+/g, "");
        if (exceedTime(start) || exceedTime(end)) {
            layer.msg("所选时间不能大于当前时间");
            return;
        }
        if (compareDate(start, end)) {
            layer.msg("结束时间不能小于开始时间");
            return;
        }
        //if (endStart > 20000 || (endStart > 764042 && endStart <780000)) {
        //    layer.msg("时间范围不能超过两小时");
        //    return;
        //}
        var dataTime = 0;
        if (100000000 > endStart && endStart >= 1000000) {
            dataTime = 1;
        }
        if (endStart >= 100000000) {
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
                        var firstTime = (ret.datas[i].time).slice((ret.datas[i].time).indexOf(" ") + 1, (ret.datas[i].time).length);
                        if (firstTime.slice(0, 1) == 0) {
                            time[i] = firstTime.replace(firstTime.slice(0, 1), "");
                        } else {
                            time[i] = firstTime;
                        }
                    }
                    for (var d = 0; d < listId.length; d++) {
                        var key = "v" + listId[d];
                        if (isStrEmptyOrUndefined(v[key])) {
                            v[key] = [];
                        }
                        v[key].push(ret.datas[i][key]);
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
                            data: time
                        },
                        yAxis: {},
                        legend: {
                            data: [parName]
                        },
                        series: [{
                            name: parName,
                            type: "line",
                            data: v[Object.keys(v)[s]]
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
                }
                $("#main").resize(function() {
                    for (var k = 0; k < listName.length; k++) {
                        echarts.init(document.getElementById("chart" + k)).resize();
                    }
                });
            });
    }
    if (type == 1) {
        var opType1 = 503;
        if (!checkPermission(opType1)) {
            layer.msg("没有权限");
            return;
        }
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
        data1.opType = opType1;
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
                                dataView: { readOnly: false },//数据视图
                                restore: {},
                                magicType: {
                                    type: ['line', 'bar']
                                }
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
    var opType = 202;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var flowCard = $("#inputFlowCard").val().trim();
    if (isStrEmptyOrUndefined(flowCard)) {
        showTip("inputFlowCardTip", "流程卡号不能为空");
        $("#inputFlowCardTip").removeClass("hidden");
        return;
    }
    var data = {}
    data.opType = opType;
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
//访问用户媒体设备的兼容方法
function getUserMedia(constraints, success, error) {
    if (navigator.mediaDevices.getUserMedia) {
        //最新的标准API
        navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
    } else if (navigator.webkitGetUserMedia) {
        //webkit核心浏览器
        navigator.webkitGetUserMedia(constraints).then(success).catch(error);
    } else if (navigator.mozGetUserMedia) {
        //firfox浏览器
        navigator.mozGetUserMedia(constraints).then(success).catch(error);
    } else if (navigator.getUserMedia) {
        //旧版API
        navigator.getUserMedia(constraints).then(success).catch(error);
    }
};

function capture() {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, 290, 290);
    qrcode.decode(canvas.toDataURL('image/png'));
    qrcode.callback = function (e) {
        //结果回调
        if (e != "error decoding QR Code" && typeof (Number(e.split(",")[2])) == "number") {
            addCover();
            $("#video").addClass("hidden");
            $("#inputFlowCard").val(e.split(",")[2]);
            clearInterval(canImg);
            removeCover();
            clearCanvas();
            closeVideo.stop();
            videos = 0;
        }
    }
}

var closeVideo;
function success(stream) {
    var video = document.getElementById('video');
    video.srcObject = stream;
    video.play();
    closeVideo = stream.getTracks()[0];
}

function error() {
    $("#video").addClass("hidden");
    layer.msg("访问用户媒体设备失败");
    clearInterval(canImg);
    videos = 0;
}

function clearCanvas() {
    var c = document.getElementById("canvas");
    var cxt = c.getContext("2d");
    cxt.clearRect(0, 0, c.width, c.height);
}

function getObjectURL(file) {
    var url = null;
    if (window.createObjectURL != undefined) {          // basic
        url = window.createObjectURL(file);
    } else if (window.URL != undefined) {               // mozilla(firefox)
        url = window.URL.createObjectURL(file);
    } else if (window.webkitURL != undefined) {         // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
    }
    return url;
}

//上传图片识别二维码
function fileUp() {
    var newFile = document.getElementById('file');
    //   console.log(newfile[0]);
    //console.log(getObjectURL(this.files[0]));           // newfile[0]是通过input file上传的二维码图片文件
    qrcode.decode(getObjectURL(newFile.files[0]));
    qrcode.callback = function (e) {
        //结果回调
        if (e != "error decoding QR Code" && typeof (Number(e.split(",")[2])) == "number") {
            $("#video").addClass("hidden");
            $("#inputFlowCard").val(e.split(",")[2]);
            clearInterval(fileImg);
            $("#file").val("");
            removeCover();
        } else {
            clearInterval(fileImg);
            layer.msg("请上传正确的二维码图片");
            $("#file").val("");
            $("#inputFlowCard").val("");
            removeCover();
        }
    }
}