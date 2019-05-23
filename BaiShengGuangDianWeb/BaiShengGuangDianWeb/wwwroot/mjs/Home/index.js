function pageReady() {

    $(".ms2").select2();
    $("#run").addClass("disabled");
    getDeviceList();
    getWorkshopList();
    $("#flowCard").change(function () {
        $("#run").addClass("disabled");
    });
    $("#processCode").on("select2:select", function (e) {
        $("#run").addClass("disabled");
    });
    $("#faultType").on("select2:select", function (e) {
        if ($("#faultType").val() != "1") {
            var desc = "";
            for (var i = 0; i < faultData.length; i++) {
                if (faultData[i].Id == $("#faultType").val()) {
                    desc = faultData[i].FaultDescription;
                    break;
                }
            }
            $("#faultDesc").val(desc);
            $("#faultDesc").attr("disabled", "disabled");

        } else {
            $("#faultDesc").val("");

            $("#faultDesc").removeAttr("disabled");
        }
    });
    $("#faultCode").select2({
        allowClear: true,
        placeholder: "请选择"
    });
}

var faultData = null;
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


            $("#processCode").empty();
            $("#faultCode").empty();
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

function getWorkshopList() {
    var opType = 261;
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

            $("#workshopCode").empty();
            $("#RpWorkshopCode").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var d = ret.datas[i];
                $("#workshopCode").append(option.format(d.Id, d.WorkshopName));
                $("#RpWorkshopCode").append(option.format(d.Id, d.WorkshopName));
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
    var flowCard = $("#flowCard").val().trim();
    if (isStrEmptyOrUndefined(flowCard)) {
        showTip("flowCardTip", "流程卡号不能为空");
        query = false;
    }
    if (!query)
        return;
    var ws = parseIntStr($("#workshopCode").val(), 2);

    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        Id: deviceId,
        FlowCardName: ws + flowCard
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
            html += '<p><b>工艺编号：</b>{0}<button type="button" class="btn btn-primary btn-sm pull-right" onclick="queryProcessData(\'{1}\')">工艺数据</button></p>'
                .format(flowCard.ProcessNumber, flowCard.ProcessId);
            $("#info").append(html);

            id = deviceId;
            processId = flowCard.ProcessId;
            flowCardId = flowCard.flowCardId;
            $("#run").removeClass("disabled");
        });
}

function queryProcessData(processNumber) {
    processNumber = unescape(processNumber);
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
    var opType = 406;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    hideClassTip('adt');
    $("#faultDate").val(getDate()).datepicker('update');
    $("#faultTime").val(getTime());
    var info = getCookieTokenInfo();
    $("#proposer").val(info.name);
    $("#faultDesc").val("");

    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            $("#faultType").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var d = ret.datas[i];
                $("#faultType").append(option.format(d.Id, d.FaultTypeName));
            }
            faultData = ret.datas;
            $("#faultModel").modal("show");
        });
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

    var proposer = $("#proposer").val().trim();
    //报修人
    if (isStrEmptyOrUndefined(proposer)) {
        showTip($("#proposerTip"), "报修人不能为空");
        report = false;
    }
    var faultDate = $("#faultDate").val();
    var faultTime = $("#faultTime").val();
    var faultType = $("#faultType").val();

    var faultDesc = $("#faultDesc").val().trim();
    //故障描述
    if (isStrEmptyOrUndefined(faultDesc) && faultType == 1) {
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
            Priority: 0,
            //故障类型
            FaultTypeId: faultType
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

function showInputReport() {
    var info = getCookieTokenInfo();
    var p = info.proleList.indexOf(0) == -1;
    var s = info.proleList.indexOf(1) == -1;

    $("#reportFlowCard").addClass("hidden");
    if (!p || !s)
        $("#reportFlowCard").removeClass("hidden");
    $("#inputReportModel").modal("show");
}

function queryRpFlowCard() {
    $("#gxList").empty();
    var opType = 202;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    //流程卡

    var ws = parseIntStr($("#RpWorkshopCode").val(), 2);
    var flowCard = ws + $("#rpFlowCard").val().trim();
    if (isStrEmptyOrUndefined(flowCard)) {
        showTip("rpFlowCardTip", "流程卡号不能为空");
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
            };

            function processStepOrder(a, b) {
                return a.ProcessStepOrder > b.ProcessStepOrder;
            }

            var info = getCookieTokenInfo();
            info.proleList = [0, 1]
            var p = info.proleList.indexOf(0) > -1;
            var s = info.proleList.indexOf(1) > -1;
            var pIndex = -1;
            var sIndex = -1;
            var datas = ret.processSteps.sort(processStepOrder);
            if (datas.length > 0)
                $("#rpFCId").html(datas[0].FlowCardId);
            for (var j = 0; j < datas.length; j++) {
                var d = datas[j];
                if (d.IsReport)
                    continue;
                if (!d.IsSurvey && p && !(d.ProcessTime == '0001-01-01 00:00:00' || d.ProcessTime == null)) {
                    pIndex = d.ProcessStepOrder;
                } else if (d.IsSurvey && s && (d.SurveyTime == '0001-01-01 00:00:00' || d.SurveyTime == null)) {
                    if (sIndex == -1) {
                        sIndex = d.ProcessStepOrder;
                    }
                }
            }
            if (pIndex != -1 && sIndex != -1) {
                if ((pIndex < sIndex))
                    sIndex = -1;
                else
                    pIndex = -1;
            }

            var o = 0;
            var processStepName = function (data, type, row) {
                return data.CategoryName + "-" + data.StepName;
            }
            var order = function (data, type, row) {
                o = data.ProcessStepOrder;
                return '<span id="c1f{0}" oValue="{1}">{0}</span>'.format(o, data.Id);
            }
            //加工人
            var processorId = function (data, type, row) {
                return '<span id="c2f{0}" oValue="{2}">{1}</span>'.format(o, data.ProcessorName, data.ProcessorId);
            }
            //加工时间
            var processTime = function (data, type, row) {
                if (data.ProcessTime == '0001-01-01 00:00:00' || data.ProcessTime == null) {
                    return '<span id="c3f{0}" oValue="{1}"></span>'.format(o, data.ProcessTime);
                }
                return '<span id="c3f{0}" oValue="{1}">{1}</span>'.format(o, data.ProcessTime);
            }
            //检验人
            var surveyorId = function (data, type, row) {
                if (sIndex == data.ProcessStepOrder) {
                    var id = 0;
                    for (var i = 0; i < ret.surveyors.length; i++) {
                        var d = ret.surveyors[i];
                        if (d.SurveyorName == info.name) {
                            id = d.Id;
                            break;
                        }
                    }
                    return '<span id="c4f{0}" oValue="{2}">{1}</span>'.format(o, info.name, id);
                }
                return '<span id="c4f{0}" oValue="{2}">{1}</span>'.format(o, data.SurveyorName, data.SurveyorId);
            }
            //检验时间
            var surveyTime = function (data, type, row) {
                var html =
                    '<input type="text" id="c51f{0}" class="form_date form-control" value="{2}" style="width:90px;background-color:white;">' +
                    '<input type="text" id="c52f{0}" class="form_time form-control" value="{3}" style="width:75px;background-color:white;">' +
                    '<span id="c5f{0}" oValue="{1}" class="hidden">{1}</span>';
                if (sIndex != data.ProcessStepOrder) {
                    if (data.SurveyTime == '0001-01-01 00:00:00' || data.SurveyTime == null) {
                        return '<span id="c5f{0}" oValue="{1}"></span>'.format(o, data.SurveyTime);
                    }
                    return '<span id="c5f{0}" oValue="{1}">{1}</span>'.format(o, data.SurveyTime);
                }
                return html.format(o, data.SurveyTime, getDate(), getTime());
            }
            //合格数
            var qualifiedNumber = function (data, type, row) {
                if (data.IsSurvey) {
                    if (sIndex == data.ProcessStepOrder && !data.IsReport) {
                        return '<input class="form-control" id="c6f{0}" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')" {2}>'
                            .format(o, data.QualifiedNumber);
                    }

                } else {
                    if (pIndex == data.ProcessStepOrder && !data.IsReport) {
                        return '<input class="form-control" id="c6f{0}" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')" {2}>'
                            .format(o, data.QualifiedNumber);
                    }
                }
                return '<input class="form-control" id="c6f{0}" disabled="disabled" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')">'.format(o, data.QualifiedNumber);
            }
            //不合格数
            var unqualifiedNumber = function (data, type, row) {
                if (data.IsSurvey) {
                    if (sIndex == data.ProcessStepOrder && !data.IsReport) {
                        return '<input class="form-control" id="c7f{0}" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')" {2}>'
                            .format(o, data.UnqualifiedNumber);
                    }

                } else {
                    if (pIndex == data.ProcessStepOrder && !data.IsReport) {
                        return '<input class="form-control" id="c7f{0}" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')" {2}>'
                            .format(o, data.UnqualifiedNumber);
                    }
                }
                return '<input class="form-control" id="c7f{0}" disabled="disabled" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')">'.format(o, data.UnqualifiedNumber);
            }
            //机台号
            var deviceId = function (data, type, row) {
                return '<span id="c8f{0}" oValue="{2}">{1}</span>'.format(o, data.Code, data.DeviceId);
            }

            $("#gxList")
                .DataTable({
                    "destroy": true,
                    "bSort": false,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": datas,
                    "aaSorting": [[0, "asc"]],
                    "columns": [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "MarkedDateTime", "title": "修改时间" },
                        { "data": null, "title": "工序名称", "render": processStepName },
                        { "data": "ProcessStepRequirements", "title": "加工要求" },
                        { "data": null, "title": "加工人", "render": processorId },
                        { "data": null, "title": "加工时间", "render": processTime },
                        { "data": null, "title": "机台号", "render": deviceId },
                        { "data": null, "title": "检验人", "render": surveyorId },
                        { "data": null, "title": "检验时间", "render": surveyTime },
                        { "data": null, "title": "合格数", "render": qualifiedNumber },
                        { "data": null, "title": "不合格数", "render": unqualifiedNumber },
                    ],
                    "drawCallback": function (settings, json) {
                        $("#gxList th").css("padding-right", "8px");
                        initTime();
                    }
                });
        });
}

function initTime() {
    $("#gxList .form_date,.form_time").attr("readonly", true);
    $('#gxList .form_date').datepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd',
        //endDate:getDayAfter(1),
        maxViewMode: 2,
        todayBtn: "linked",
        autoclose: true
    });

    $('#gxList .form_time').timepicker({
        language: 'zh-CN',
        showMeridian: false,
        minuteStep: 1,
        showSeconds: true,
        secondStep: 1
    });

}

function reportFlowCard() {
    var opType = 208;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var ws = parseIntStr($("#RpWorkshopCode").val(), 2);
    var flowCardId = ws + $("#rpFCId").html();
    var oData = $("#gxList tbody").children();
    var postData = new Array();
    for (var i = 1; i <= oData.length; i++) {
        var id;
        var processorId;
        var processTime;
        var surveyorId;
        var surveyTime;
        var qualifiedNumber;
        var unqualifiedNumber;
        var deviceId;
        for (var j = 1; j <= 8; j++) {
            var key = $("#c{1}f{0}".format(i, j));
            var v = key.attr("ovalue");
            var key1;
            var key2;
            switch (j) {
                case 1:
                    v = $(key).attr("ovalue");
                    id = v;
                    break;
                case 2:
                    //加工人
                    processorId = v;
                    break;
                case 3:
                    //加工时间
                    processTime = isStrEmptyOrUndefined(v) ? null : v;
                    break;
                case 4:
                    //检验人
                    surveyorId = v;
                    break;
                case 5:
                    //检验时间
                    if (key.parent().find("input").length > 0) {
                        key1 = $("#c{1}1f{0}".format(i, j));
                        key2 = $("#c{1}2f{0}".format(i, j));
                        v = key1.hasClass("hidden") ? v : '{0} {1}'.format($(key1).val(), $(key2).val());
                    }
                    surveyTime = isStrEmptyOrUndefined(v) ? null : v;
                    break;
                case 6:
                    v = key.val();
                    //合格数
                    qualifiedNumber = v;
                    break;
                case 7:
                    v = key.val();
                    //不合格数
                    unqualifiedNumber = v;
                    break;
                case 8:
                    //机台号
                    deviceId = v;
                    break;
                default:
                    break;
            }
        }
        var d = {
            //流程卡(自增Id)
            Id: id,
            //流程卡
            FlowCardId: flowCardId,
            //加工人ID（自增id）  为0不指定加工人
            ProcessorId: processorId,
            //检验员Id（自增id）  为0不指定检验员
            SurveyorId: surveyorId,
            //合格数
            QualifiedNumber: qualifiedNumber,
            //不合格数
            UnqualifiedNumber: unqualifiedNumber,
            //机台号（自增Id）
            DeviceId: deviceId
        };
        //加工日期 
        if (processTime != null)
            d.ProcessTime = processTime;
        //检验日期
        if (surveyTime != null)
            d.SurveyTime = surveyTime;
        postData.push(d);
    }
    if (postData.length <= 0)
        return;

    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(postData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    queryRpFlowCard();
                }
            });
    }
    showConfirm("保存", doSth);
}

function clearRpFlowCard() {
    $("#rpFlowCard").val("");
    $("#gxList").empty();
}