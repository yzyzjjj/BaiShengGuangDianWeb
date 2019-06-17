function pageReady() {
    var myTb = echarts.init(document.getElementById("main"));
    var option = {
        title: {
            text: "����ͳ��"
        },
        tooltip: {
            trigger: "axis"
        },
        xAxis: {
            data: ["��һ", "�ܶ�", "����", "����", "����", "����", "����"]
        },
        yAxis: {},
        legend: {
            data: ["�ɽ���", "�����", "������"]
        },
        series: [{
                name: "�ɽ���",
                type: "line",
                data: [10, 20, 10, 45, 30, 52, 31]
            },
            {
                name: "�����",
                type: "line",
                data: [20, 10, 20, 25, 40, 22, 41]
            },
            {
                name: "������",
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