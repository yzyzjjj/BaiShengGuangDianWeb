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
    $("#faultCode").select2({
        allowClear: true,
        placeholder: "请选择"
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
            var option = '<option value="{0}" id="{2}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                var state = data.DeviceStateStr;
                if (state == '待加工' || state == '加工中') {
                    $("#processCode").append(option.format(data.Id, data.Code, ''));
                    $("#faultCode").append(option.format(data.Code, data.Code, data.AdministratorUser));
                }
            }

        });
}

function queryFlowCard() {
    var opType = 260;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
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
    data.opType = opType;
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
            html += '<p><b>工艺编号：</b>{0}<button type="button" class="btn btn-primary btn-sm pull-right" onclick="queryProcessData(\'{0}\')">工艺数据</button></p>'.format(flowCard.ProcessId);
            $("#info").append(html);

            id = deviceId;
            processId = flowCard.ProcessId;
            flowCardId = flowCard.flowCardId;
            $("#run").removeClass("disabled");
        });
}

function queryProcessData(processNumber) {
    var opType = 300;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    //工艺编号
    if (isStrEmptyOrUndefined(processNumber)) {
        layer.msg("工艺编号不存在");
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        id: processNumber
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            //加压时间(M:S)
            var pressurizeTime = function (data, type, row) {
                return data.PressurizeMinute + " : " + data.PressurizeSecond;
            }
            //工序时间(M:S)
            var processTime = function (data, type, row) {
                return data.ProcessMinute + " : " + data.ProcessSecond;
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
                        { "data": null, "title": "加压时间(分:秒)", "render": pressurizeTime },
                        { "data": null, "title": "工序时间(分:秒)", "render": processTime },
                        { "data": "Pressure", "title": "设定压力(Kg)" },
                        { "data": "Speed", "title": "下盘速度(rpm)" }
                    ]
                });

            $("#dataModel").modal("show");
        });
}

var id = null;
var processId = null;
var flowCardId = null;
function setProcessData() {
    //机台号
    if (isStrEmptyOrUndefined(id)) {
        return;
    }

    //流程卡
    if (isStrEmptyOrUndefined(flowCardId)) {
        return;
    }

    //工艺
    if (isStrEmptyOrUndefined(processId)) {
        return;
    }

    var opType = 110;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            //设备id
            DeviceId: id,
            //程序文件的位置及名称
            ProcessId: processId,
            //描述
            FlowCardId: flowCardId
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    //getDeviceList();
                }
            });
    }
    showConfirm("运行", doSth);
}

function showFaultModel() {

    $("#faultDate").val(getDate()).datepicker('update');
    $("#faultTime").val(getTime());
    var info = getCookieTokenInfo();
    $("#proposer").val(info.name);
    hideClassTip('adt');
    $("#faultModel").modal("show");
}

function reportFault() {
    var opType = 422;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var report = true;
    var codes = $("#faultCode").val();
    //机台号
    if (codes == null || codes.length <= 0) {
        showTip($("#faultCodeTip"), "请选择设备");
        report = false;
    }

    var proposer = $("#proposer").val();
    //报修人
    if (isStrEmptyOrUndefined(proposer)) {
        showTip($("#proposerTip"), "报修人不能为空");
        report = false;
    }
    var faultDate = $("#faultDate").val();
    var faultTime = $("#faultTime").val();

    var faultDesc = $("#faultDesc").val();
    //故障描述
    if (isStrEmptyOrUndefined(faultDesc)) {
        showTip($("#faultDescTip"), "故障描述不能为空");
        report = false;
    }
    if (!report)
        return;
    $("#faultModel").modal("hide");
    var time = "{0} {1}".format(faultDate, faultTime);
    var faults = new Array();
    var admins = new Array();
    for (var i = 0; i < codes.length; i++) {
        var code = codes[i];
        faults.push({
            //机台号
            DeviceCode: code,
            //故障时间
            FaultTime: time,
            //报修人
            Proposer: proposer,
            //故障描述
            FaultDescription: faultDesc,
            //优先级
            Priority: 0
        });
        var admin = $("#faultCode").find("[value=" + code + "]").attr("id");
        if (!isStrEmptyOrUndefined(admin)) {
            admins.push({
                Code: code,
                Admin: admin
            });
        }
    }

    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(faults);
    ajaxPost("/Relay/Post", data,
        function (ret) {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                getDeviceList();
                for (var i = 0; i < admins.length; i++) {
                    var admin = admins[i];
                    var info = {
                        ChatEnum: chatEnum.FaultDevice,
                        Message: {
                            Admin: admin.Admin,
                            Code: admin.Code
                        }
                    }
                    //调用服务器方法
                    hubConnection.invoke('SendMsg', info);

                }
            }
        });

}

function getUsuallyFaultList() {
    var opType = 400;
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
            $("#usuallyFaultList")
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
                        { "data": "Id", "title": "序号" },
                        { "data": "UsuallyFaultDesc", "title": "常见故障" },
                        { "data": "SolverPlan", "title": "解决方法" }
                    ],
                    "columnDefs": [
                        {
                            "targets": [2],
                            "render": function (data, type, full, meta) {

                                if (full.SolverPlan) {
                                    if (full.SolverPlan.length > tdShowLength) {
                                        return full.SolverPlan.substr(0, tdShowLength) + ' . . .<a href = \"javascript:void(0);\" onclick = \"showUsuallyFaultDetailModel({0})\" >全部显示</a> '.format(full.Id);
                                    } else {
                                        return full.SolverPlan;
                                    }
                                } else {
                                    return "";
                                }
                            }
                        }
                    ]
                });
            $("#usuallyFaultModel").modal("show");

        });
}

function showUsuallyFaultDetailModel(id) {
    var opType = 401;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        id: id
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            if (ret.datas.length > 0)
                $("#usuallyFaultDetail").html(ret.datas[0].SolverPlan);

            $("#usuallyFaultDetailModel").modal("show");

        });
}