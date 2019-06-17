function pageReady() {
    var myTb = echarts.init(document.getElementById("main"));
    var option = {
        title: {
            text: "生产统计"
        },
        tooltip: {
            trigger: "axis"
        },
        xAxis: {
            data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
        },
        yAxis: {},
        legend: {
            data: ["成交量", "库存量", "破损量"]
        },
        series: [{
                name: "成交量",
                type: "line",
                data: [10, 20, 10, 45, 30, 52, 31]
            },
            {
                name: "库存量",
                type: "line",
                data: [20, 10, 20, 25, 40, 22, 41]
            },
            {
                name: "破损量",
                type: "line",
                data: [30, 15, 30, 20, 25, 20, 11]
            }],
        dataZoom: [{
                type: "slider",
                start: 0,
                end: 60
            },
            {
                type: "inside",
                start: 0,
                end: 60
            }],
        toolbox: {
            top: 18,
            left: "center",
            feature: {
                dataZoom: {
                    yAxisIndex: "none"
                },
                restore: {},
                saveAsImage: {}
            }
        }
    };
    myTb.setOption(option);
}