function pageReady() {
    $(".ms2").select2();
    $("#run").addClass("disabled");
    getDeviceList();
    $("#flowCard").change(function () {
        $("#run").addClass("disabled");
    });
    $(".ms2").on("select2:select", function (e) {
        $("#run").addClass("disabled");
    });
}

function getDeviceList() {
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

            var deviceState = function (data, type, row) {
                var state = data.DeviceStateStr;
                if (state == '待加工')
                    return '<span class="text-success">' + state + '</span>';
                if (state == '加工中')
                    return '<span class="text-success">' + state + '</span>';
                if (state == '已确认')
                    return '<span class="text-warning">' + state + '</span>';
                if (state == '维修中')
                    return '<span class="text-info">' + state + '</span>';
                return '<span class="text-red">' + state + '</span>';
            }
            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            $("#deviceList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "Id", "title": "Id", "bVisible": false },
                        { "data": "Code", "title": "机台号" },
                        { "data": null, "title": "设备状态", "render": deviceState },
                        { "data": "ModelName", "title": "流程卡号" },
                        { "data": "SiteName", "title": "加工时间" },
                        { "data": "SiteName", "title": "剩余时间" },
                    ]
                });


            $(".ms2").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $(".ms2").append(option.format(data.Id, data.Code));
            }

        });
}

function queryFlowCard() {
    $("#run").addClass("disabled");
    var query = true;
    //机台号
    var deviceId = $("#processCode").val();
    if (isStrEmptyOrUndefined(deviceId)) {
        showTip("processCodeTip", "请选择设备");
        query = false;
    }

    //流程卡
    var flowCard = $("#flowCard").val();
    if (isStrEmptyOrUndefined(flowCard)) {
        showTip("flowCardTip", "流程卡号不能为空");
        query = false;
    }
    if (!query)
        return;
    var data = {}
    data.opType = 260
    data.opData = JSON.stringify({
        Id: deviceId,
        FlowCardName: flowCard
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            $("#info").empty();
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var flowCard = ret.flowCard;
            var html = '<p><b>计划号：</b>{0}</p>' +
                '<p><b>紧急程度：</b>{1}</p>';
            var p = '<p><b>{0}：</b>{1}</p> ';

            html = html.format(flowCard.ProductionProcessName,
                flowCard.Priority == 0 ? "低" : (flowCard.Priority == 1 ? "中" : "高"));
            for (var i = 0; i < flowCard.RawMateriaSpecifications.length; i++) {
                var data = flowCard.RawMateriaSpecifications[i];
                html += p.format(data.SpecificationName, data.SpecificationValue);
            }
            html += '<p><b>工艺编号：</b>{0}<button type="button" class="btn btn-primary btn-sm pull-right" onclick="queryProcessData(\'{0}\')">工艺数据</button></p>'.format(flowCard.ProcessNumber);
            $("#info").append(html);

            id = deviceId;
            proNum = flowCard.ProcessNumber;
            $("#run").removeClass("disabled");
        });
}

function queryProcessData(processNumber) {
    //工艺编号
    if (isStrEmptyOrUndefined(processNumber)) {
        layer.msg("工艺编号不存在");
    }

    var data = {}
    data.opType = 300
    data.opData = JSON.stringify({
        id: processNumber
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var time1 = function (data, type, row) {
                return data.PressurizeMinute + ":" + data.PressurizeSecond;
            }
            var time2 = function (data, type, row) {
                return data.ProcessMinute + ":" + data.ProcessSecond;
            }
            $("#processDataList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": false,
                    "bSort": false,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aLengthMenu": [10, 15, 20], //更改显示记录数选项  
                    "iDisplayLength": 10, //默认显示的记录数  
                    "columns": [
                        { "data": "ProcessOrder", "title": "工序" },
                        { "data": null, "title": "加压时间(分:秒)", "render": time1 },
                        { "data": null, "title": "工序时间(分:秒)", "render": time2 },
                        { "data": "Pressure", "title": "设定压力(Kg)" },
                        { "data": "Speed", "title": "下盘速度(rpm)" }
                    ]
                });

            $("#dataModel").modal("show");
        });


}


var id = null;
var proNum = null;
function setProcessData() {
    //机台号
    if (isStrEmptyOrUndefined(id)) {
        return;
    }

    //流程卡
    if (isStrEmptyOrUndefined(proNum)) {
        return;
    }


    layer.msg("发送成功");
}

