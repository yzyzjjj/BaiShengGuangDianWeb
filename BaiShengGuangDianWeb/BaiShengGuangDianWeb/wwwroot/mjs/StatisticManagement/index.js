function pageReady() {
    getDeviceChart();
    getStatisticList();
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