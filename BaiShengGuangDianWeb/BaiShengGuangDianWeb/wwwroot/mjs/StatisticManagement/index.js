function pageReady() {
    getStatisticList();
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
            myChart.setOption(option);
            window.addEventListener('resize', function () {
                myChart.resize();
            });
        });
}