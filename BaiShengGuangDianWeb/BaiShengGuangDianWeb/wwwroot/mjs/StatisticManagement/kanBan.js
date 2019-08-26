function pageReady() {
    getBoardData();
}

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
            if (isStrEmptyOrUndefined(ret.data)) {
                return;
            }

            var deviceSum = [];
            var deviceSums = [];
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
            $("#deviceChart").empty();
            var colors = ["green", "blue", "#0099ff", "#cc33ff", "red", "#ff00cc"];
            for (var i = 0; i < deviceSum.length; i++) {
                $("#deviceChart").append('<div class="col-sm-2" style="width: 32%; height: 170px; display: -webkit-inline-box; margin: 0; padding: 0;" id="deviceChart' + i + '"></div>');
                deviceSums[i] = { value: deviceSum[i].slice(0, deviceSum[i].indexOf(",")), name: deviceSum[i].slice(deviceSum[i].indexOf(",") + 1) };
                var myChart = echarts.init(document.getElementById("deviceChart" + i));
                var option = {
                    title: {
                        text: deviceSums[i]["name"],
                        left: "center",
                        textStyle: {
                            color: colors[i],
                            fontSize: 16
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a}<br/>{b} : {c}台 ({d}%)"
                    },
                    color: ["#cdcdcd", colors[i]],
                    series: [{
                        name: '设备状态',
                        type: 'pie',
                        radius: ['57%', '85%'],
                        center: ['50%', '57%'],
                        animationDuration: 0,
                        hoverAnimation: false,
                        silent: true,
                        label: {
                            normal: {
                                show: true,
                                position: "center",
                                formatter: deviceSums[i]["value"] + "台" + "\n" + ((deviceSums[i]["value"] / ret.data.AllDevice) * 100).toFixed(2) + "%",
                                textStyle: {    //图例文字的样式
                                    color: colors[i],  //文字颜色
                                    fontSize: 18,    //文字大小
                                    fontWeight: 700
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
            $.each(singleProcessRateData, function (index, e) {
                code.push(e["Code"]);
                codeRate.push((e["Rate"] * 100).toFixed(2));
            });
            //for (var k = 1; k < 108; k++) {
            //    code.push(k + "号机");
            //    codeRate.push(parseInt(Math.random() * 100));
            //}
            $("#codeRateChart").empty();
            $("#codeRateChart").append('<div style="width: 100%; height: 488px" id="codeRate"></div>');
            var myChart1 = echarts.init(document.getElementById("codeRate"));
            var res1 = -1;
            var res2 = -1;
            var option1 = {
                title: {
                    text: "单台加工利用率"
                },
                tooltip: {
                    trigger: "axis",
                    formatter: "{a}<br/>{b} : {c}%"
                },
                xAxis: {
                    type: 'category',
                    axisLabel: {
                        //间隔为0
                        //interval: 0,
                        rotate: 40,
                        textStyle: {
                            fontSize: 12
                        }
                    },
                    axisLine: {
                        onZero: false
                    },
                    data: (function () {
                        if (code.length - res1 == 20) {
                            res1 = 0;
                        }
                        res1++;
                        var res = [];
                        for (var j = res1; j < code.length; j++) {
                            if (res.length != 20) {
                                res.push(code[j]);
                            } else {
                                break;
                            }
                        }
                        return res;
                    })()
                },
                yAxis: {
                    name: '百分比',
                    type: 'value',
                    scale: true,
                    axisLabel: {
                        show: true,
                        formatter: '{value} %'
                    }
                },
                legend: {
                    data: ["利用率"]
                },
                series: [{
                    name: "利用率",
                    type: "bar",
                    areaStyle: { normal: {} },
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            formatter: "{c}%"
                        }
                    },
                    itemStyle: {
                        normal: {
                            // 定制显示
                            color: function (params) {
                                return params.data < 30 ? "red" : "green";
                            }
                        }
                    },
                    data: (function () {
                        if (codeRate.length - res2 == 20) {
                            res2 = 0;
                        }
                        res2++;
                        var res = [];
                        for (var j = res2; j < codeRate.length; j++) {
                            if (res.length != 20) {
                                res.push(codeRate[j]);
                            } else {
                                break;
                            }
                        }
                        return res;
                    })()
                }],
                dataZoom: {
                    type: "inside",
                    start: 0,
                    end: 100
                },
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
            var setRate;
            if (code.length > 20) {
                var yIndex = 19;
                var xIndex = 19;
                setRate = setInterval(function () {
                    var yData = option1.series[0].data;
                    for (var y = 0; y < 20; y++) {
                        yData.shift();
                        yIndex++;
                        if (!isStrEmptyOrUndefined(codeRate[yIndex]) || codeRate[yIndex] == 0) {
                            yData.push(codeRate[yIndex]);
                        } else {
                            yData.push("");
                        }
                    }
                    var xData = option1.xAxis.data;
                    for (var x = 0; x < 20; x++) {
                        xData.shift();
                        xIndex++;
                        if (!isStrEmptyOrUndefined(code[xIndex])) {
                            xData.push(code[xIndex]);
                        } else {
                            xData.push("");
                        }
                    }
                    myChart1.setOption(option1, true);
                    if (xData[xData.length - 1] == code[code.length - 1] || isStrEmptyOrUndefined(xData[xData.length - 1])) {
                        clearInterval(setRate);
                        setTimeout("getBoardData()", 4000);
                    }
                }, 5000);
            }
            if (code.length <= 20) {
                clearInterval(setRate);
                setTimeout("getBoardData()", 4000);
            }
            //当前加工设备
            var useCodeList = ret.data.UseCodeList;
            $("#codeRateChart").append('<div style="width:100%;height:77px"><span style="font-size:18px;font-weight:bold;margin-left:5px">当前加工设备：</span><br><pre id="useList" style="font-size:18px;font-weight:bold;color:blue;""></pre></div>');
            $.each(useCodeList, function (i, e) {
                $("#useList").append("<span style='margin-left:10px'>"+e+"</span>");
            }); 
            //所有利用率
            var allProcessRate = ret.data.AllProcessRate;
            $("#codeTimeList").empty();
            $("#codeTimeList").append('<div id="codeRates" style="float: left;width: 40%;height: 140px;"></div>' +
                '<pre id = "codeTime" style = "width: 60%; float: left;font-size: 15px;line-height: 25px;font-weight:bold;font-family:"微软雅黑""></pre>');
            var codeRatesChart = echarts.init(document.getElementById("codeRates"));
            var codeRatesOption = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{a}<br/>{b} : {c}台 ({d}%)"
                },
                color: ["#cdcdcd", "#0099ff"],
                series: [{
                    name: "总利用率",
                    type: "pie",
                    center: ['50%', '50%'],
                    radius: ['65%', '98%'],
                    hoverAnimation: false,
                    animation: false,
                    silent: true,
                    label: {
                        normal: {
                            show: true,
                            position: "center",
                            formatter: "Rate" + "\n" + (allProcessRate * 100).toFixed(2) + "%",
                            textStyle: {    //图例文字的样式
                                color: "#0099ff",  //文字颜色
                                fontSize: 18,    //文字大小
                                fontWeight: 700
                            }
                        }
                    },
                    data: [{ value: (1 - allProcessRate), name: "其他利用率" }, { value: allProcessRate, name: "所有利用率" }]
                }]
            }
            codeRatesChart.setOption(codeRatesOption, true);
            //运行时间
            $("#codeTime").empty();
            $("#codeTime").append("<div>" + "运行时间：" + "<span class='par'>" + codeTime(ret.data.RunTime) + "</span>" + "</div>");
            //加工时间
            $("#codeTime").append("<div>" + "加工时间：" + "<span class='par'>" + codeTime(ret.data.ProcessTime) + "</span>" + "</div>");
            //闲置时间
            $("#codeTime").append("<div>" + "闲置时间：" + "<span class='par'>" + codeTime(ret.data.IdleTime) + "</span>" + "</div>");
            //所有利用率
            $("#codeTime").append("<div>" + "所有利用率：" + "<span class='par'>" + (allProcessRate * 100).toFixed(2) + "%" + "</span>" + "</div>");
            $("#maxList").empty();
            $("#maxList").append('<div id="maxChart" style="float: left;width: 40%;height: 140px;"></div>' +
                '<pre id = "maxDevice" style = "width: 60%; float: left;font-size: 15px;line-height: 40px;font-weight:bold;margin-top:-3px;font-family:"微软雅黑""></pre>');
            //日最大同时使用台数
            $("#maxDevice").empty();
            var maxSimultaneousUseRate = ret.data.MaxSimultaneousUseRate;
            $("#maxDevice").append("<div>" + "日最大同时使用台数：" + "<span class='par'>" + maxSimultaneousUseRate + "台" + "</span>" + "</div>");
            //日最大使用台数
            var maxUse = ret.data.MaxUse;
            $("#maxDevice").append("<div>" + "日最大使用台数：" + "<span class='par'>" + maxUse + "台" + "</span>" + "</div>");
            //日最大使用率
            var maxUseRate = ret.data.MaxUseRate;
            $("#maxDevice").append("<div>" + "日最大使用率：" + "<span class='par'>" + (maxUseRate * 100).toFixed(2) + "%" + "</span>" + "</div>");
            var maxChart = echarts.init(document.getElementById("maxChart"));
            var maxOption = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{a}<br/>{b} : {c}台 ({d}%)"
                },
                color: ["#cdcdcd", "#0099ff"],
                series: [{
                    name: '设备状态',
                    type: 'pie',
                    radius: ['67%', '100%'],
                    center: ['50%', '50%'],
                    animationDuration: 0,
                    hoverAnimation: false,
                    silent: true,
                    label: {
                        normal: {
                            show: true,
                            position: "center",
                            formatter: "Max" + "\n" + maxUse + "台" + "\n" + (maxUseRate * 100).toFixed(2) + "%",
                            textStyle: {    //图例文字的样式
                                color: "#0099ff",  //文字颜色
                                fontSize: 13    //文字大小
                            }
                        }
                    },
                    data: [{ value: ret.data.AllDevice - maxUse, name: "其他台数" }, { value: maxUse, name: "日最大使用台数" }]
                }]
            };
            maxChart.setOption(maxOption, true);

            $("#minList").empty();
            $("#minList").append('<div id="minChart" style="float: left;width: 40%;height: 140px;"></div>' +
                '<pre id = "minDevice" style = "width: 60%; float: left;font-size: 15px;line-height: 40px;font-weight:bold;margin-top:-3px;font-family:"微软雅黑""></pre>');
            $("pre").css("backgroundColor", "white").css("border", 0);
            //日最小同时使用台数
            $("#minDevice").empty();
            var minSimultaneousUseRate = ret.data.MinSimultaneousUseRate;
            $("#minDevice").append("<div>" + "日最小同时使用台数：" + "<span class='par'>" + minSimultaneousUseRate + "台" + "</span>" + "</div>");
            //日最小使用台数
            var minUse = ret.data.MinUse;
            $("#minDevice").append("<div>" + "日最小使用台数：" + "<span class='par'>" + minUse + "台" + "</span>" + "</div>");
            //日最小使用率
            var minUseRate = ret.data.MinUseRate;
            $("#minDevice").append("<div>" + "日最小使用率：" + "<span class='par'>" + (minUseRate * 100).toFixed(2) + "%" + "</span>" + "</div>");
            $(".par").css("fontSize", 24).css("color", "blue");
            var minChart = echarts.init(document.getElementById("minChart"));
            var minOption = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{a}<br/>{b} : {c}台 ({d}%)"
                },
                color: ["#cdcdcd", "#0099ff"],
                series: [{
                    name: '设备状态',
                    type: 'pie',
                    radius: ['67%', '100%'],
                    center: ['50%', '50%'],
                    animationDuration: 0,
                    hoverAnimation: false,
                    silent: true,
                    label: {
                        normal: {
                            show: true,
                            position: "center",
                            formatter: "Min" + "\n" + minUse + "台" + "\n" + (minUseRate * 100).toFixed(2) + "%",
                            textStyle: {    //图例文字的样式
                                color: "#0099ff",  //文字颜色
                                fontSize: 13    //文字大小
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
                codeRatesChart.resize();
                maxChart.resize();
                minChart.resize();
            });
        },0);
}
