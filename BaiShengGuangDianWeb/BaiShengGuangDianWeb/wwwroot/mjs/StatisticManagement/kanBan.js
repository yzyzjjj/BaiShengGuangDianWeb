function pageReady() {
    getBoardData();
    //setInterval("getBoardData()",1000);
}
var deviceSum = [];
var deviceSums = [];
function getBoardData() {
    var opType = 504;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {};
    data.opType = opType;
    ajaxPost("/Relay/Post",
        data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            //总设备
            var allDevice = ret.data.AllDevice + ",总设备";
            deviceSum.push(allDevice);
            //正常运行
            var normalDevice = ret.data.NormalDevice + ",正常运行";
            deviceSum.push(normalDevice);
            //加工中
            var processDevice = ret.data.ProcessDevice + ",加工中";
            deviceSum.push(processDevice);
            //闲置
            var idleDevice = ret.data.IdleDevice + ",闲置中";
            deviceSum.push(idleDevice);
            //故障
            var faultDevice = ret.data.FaultDevice + ",故障中";
            deviceSum.push(faultDevice);
            //连接异常
            var connectErrorDevice = ret.data.ConnectErrorDevice + ",连接异常";
            deviceSum.push(connectErrorDevice);
            var colors = ["green", "blue", "#9f62ac", "#5ec8c0", "red", "pink"];
            $("#deviceChart").empty();
            for (var i = 0; i < deviceSum.length; i++) {
                $("#deviceChart").append('<div class="col-sm-2" style="width: 32%; height: 146px; display: -webkit-inline-box; margin: 0; padding: 0;" id="deviceChart' + i + '"></div>');
                deviceSums[i] = { value: deviceSum[i].slice(0, deviceSum[i].indexOf(",")), name: deviceSum[i].slice(deviceSum[i].indexOf(",") + 1) };
                var myChart = echarts.init(document.getElementById("deviceChart" + i));
                var option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a}<br/>{b} : {c}台 ({d}%)"
                    },
                    color: ["#9f9f9f", colors[i]],
                    series: [{
                        name: '设备状态',
                        type: 'pie',
                        radius: ['60%', '90%'],
                        center: ['50%', '50%'],
                        animationDuration:0,
                        label: {
                            normal: {
                                show: true,
                                position: "center",
                                formatter: deviceSums[i]["name"] + "\n" + deviceSums[i]["value"] + "台",
                                textStyle: {    //图例文字的样式
                                    color: colors[i],  //文字颜色
                                    fontSize: 12    //文字大小
                                }
                            }
                        },
                        data: [{ value: ret.data.AllDevice - parseInt(deviceSum[i].slice(0, deviceSum[i].indexOf(","))), name: "其他台数" }, deviceSums[i]]
                    }]
                };
                myChart.setOption(option, true);
            }

            var singleProcessRateData = ret.data.SingleProcessRate;
            singleProcessRateData.sort(function (a, b) {
                return a.Id > b.Id ? 1 : -1;
            });
            //单台利用率
            var code = [];
            var codeRate = [];
            $.each(singleProcessRateData, function (i, e) {
                code.push(e["Code"]);
                codeRate.push((e["Rate"] * 100).toFixed(2));
            });
            //所有利用率
            var allProcessRate = ret.data.AllProcessRate;
            $("#codeRateChart").empty();
            $("#codeRateChart").append('<div style="width: 100%; height: 495px" id="codeRate"></div>');
            var myChart1 = echarts.init(document.getElementById("codeRate"));
            var option1 = {
                title: {
                    text: "单台加工利用率"
                },
                tooltip: {
                    trigger: "axis",
                    formatter: "{a}<br/>{b} : {c}%"
                },
                xAxis: {
                    data: code,
                    axisLine: {
                        onZero: false
                    }
                },
                yAxis: {},
                legend: {
                    data: ["利用率"]
                },
                series: [{
                    name: "利用率",
                    type: "line",
                    animationDuration: 0,
                    data: codeRate
                }, {
                    name: "总利用率",
                    type: "pie",
                    color: ["#9f9f9f", "blue"],
                    center: ['75%', '35%'],
                    radius: ['21%', '30%'],
                    hoverAnimation: false,
                    animation: false,
                    silent: true,
                    label: {
                        normal: {
                            show: true,
                            position: "center",
                            formatter: "所有利用率" + "\n" + (allProcessRate * 100).toFixed(2) + "%",
                            textStyle: {    //图例文字的样式
                                color: "blue",  //文字颜色
                                fontSize: 12    //文字大小
                            }
                        }
                    },
                    data: [{ value: (1 - allProcessRate), name: "其他利用率" }, { value: allProcessRate, name: "所有利用率" }]
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
                        dataView: { readOnly: false }, //数据视图
                        restore: {},
                        magicType: {
                            type: ['line', 'bar']
                        }
                    }
                }
            };
            myChart1.setOption(option1, true);

            $("#codeTimeList").empty();
            $("#codeTimeList").append('<pre id="codeTime" style="font-size: 15px; color: blue; line-height: 30px; font-weight: bold; margin-left: 20px; margin-right: 20px;font-family:"微软雅黑""></pre>');
            //运行时间
            $("#codeTime").empty();
            var runTime = "运行时间：" + codeTime(ret.data.RunTime);
            $("#codeTime").append("<div>" + runTime + "</div>");
            //加工时间
            var processTime = "加工时间：" + codeTime(ret.data.ProcessTime);
            $("#codeTime").append("<div>" + processTime + "</div>");
            //闲置时间
            var idleTime = "闲置时间：" + codeTime(ret.data.IdleTime);
            $("#codeTime").append("<div>" + idleTime + "</div>");

            $("#maxList").empty();
            $("#maxList").append('<div id="maxChart" style="float: left;width: 40%;height: 150px;"></div>' +
                '<pre id = "maxDevice" style = "width: 60%; float: left;font-size: 15px; color: blue; line-height: 40px; margin-top: 5px; font-weight: bold;font-family:"微软雅黑""></pre>');
            //日最大同时使用台数
            $("#maxDevice").empty();
            var maxSimultaneousUseRate = ret.data.MaxSimultaneousUseRate;
            $("#maxDevice").append("<div>" + "日最大同时使用台数：" + maxSimultaneousUseRate + "台" + "</div>");
            //日最大使用台数
            var maxUse = ret.data.MaxUse;
            $("#maxDevice").append("<div>" + "日最大使用台数：" + maxUse + "台" + "</div>");
            //日最大使用率
            var maxUseRate = ret.data.MaxUseRate;
            $("#maxDevice").append("<div>" + "日最大使用率：" + (maxUseRate * 100).toFixed(2) + "%" + "</div>");
            var maxChart = echarts.init(document.getElementById("maxChart"));
            var maxOption = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{a}<br/>{b} : {c}台 ({d}%)"
                },
                color: ["#9f9f9f", "#9f62ac"],
                series: [{
                    name: '设备状态',
                    type: 'pie',
                    radius: ['60%', '90%'],
                    center: ['50%', '50%'],
                    animationDuration: 0,
                    label: {
                        normal: {
                            show: true,
                            position: "center",
                            formatter: "Max" + "\n" + maxUse + "台",
                            textStyle: {    //图例文字的样式
                                color: "#9f62ac",  //文字颜色
                                fontSize: 12    //文字大小
                            }
                        }
                    },
                    data: [{ value: ret.data.AllDevice - maxUse, name: "其他台数" }, { value: maxUse, name: "日最大使用台数" }]
                }]
            };
            maxChart.setOption(maxOption, true);

            $("#minList").empty();
            $("#minList").append('<div id="minChart" style="float: left;width: 40%;height: 150px;"></div>' +
                '<pre id = "minDevice" style = "width: 60%; float: left;font-size: 15px; color: blue; line-height: 40px; margin-top: 5px; font-weight: bold;font-family:"微软雅黑""></pre>');
            $("pre").css("backgroundColor", "white").css("border", 0);
            //日最小同时使用台数
            $("#minDevice").empty();
            var minSimultaneousUseRate = ret.data.MinSimultaneousUseRate;
            $("#minDevice").append("<div>" + "日最小同时使用台数：" + minSimultaneousUseRate + "台" + "</div>");
            //日最小使用台数
            var minUse = ret.data.MinUse;
            $("#minDevice").append("<div>" + "日最小使用台数：" + minUse + "台" + "</div>");
            //日最小使用率
            var minUseRate = ret.data.MaxUseRate;
            $("#minDevice").append("<div>" + "日最小使用率：" + (minUseRate * 100).toFixed(2) + "%" + "</div>");
            var minChart = echarts.init(document.getElementById("minChart"));
            var minOption = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{a}<br/>{b} : {c}台 ({d}%)"
                },
                color: ["#9f9f9f", "#9f62ac"],
                series: [{
                    name: '设备状态',
                    type: 'pie',
                    radius: ['60%', '90%'],
                    center: ['50%', '50%'],
                    animationDuration: 0,
                    label: {
                        normal: {
                            show: true,
                            position: "center",
                            formatter: "Min" + "\n" + minUse + "台",
                            textStyle: {    //图例文字的样式
                                color: "#9f62ac",  //文字颜色
                                fontSize: 12    //文字大小
                            }
                        }
                    },
                    data: [{ value: ret.data.AllDevice - minUse, name: "其他台数" }, { value: minUse, name: "日最小使用台数" }]
                }]
            };
            minChart.setOption(minOption, true);
            $("section").resize(function () {
                for (var j = 0; j < deviceSum.length; j++) {
                    echarts.init(document.getElementById("deviceChart" + j)).resize();
                }
                myChart1.resize();
                maxChart.resize();
                minChart.resize();
            });
        });
}

