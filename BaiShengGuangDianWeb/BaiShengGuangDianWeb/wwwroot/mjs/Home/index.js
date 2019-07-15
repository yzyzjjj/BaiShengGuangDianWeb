function pageReady() {

    $(".ms2").select2();
    $("#run").addClass("disabled");
    getDeviceList();
    getWorkshopList();
    $("#flowCard").change(function () {
        $("#run").addClass("disabled");
    });
    $("#workshopCode").change(function () {
        $("#run").addClass("disabled");
    });
    $("#processCode").on("select2:select", function (e) {
        $("#run").addClass("disabled");
    });
    $("#faultType").on("select2:select", function (e) {
        var desc = "";
        for (var i = 0; i < faultData.length; i++) {
            if (faultData[i].Id == $("#faultType").val()) {
                desc = faultData[i].FaultDescription;
                break;
            }
        }
        $("#faultDefaultDesc").val(desc);
        $("#faultDefaultDesc").attr("disabled", "disabled");
    });
    $("#faultCode").select2({
        allowClear: true,
        placeholder: "请选择"
    });
    $("#isChange").on('ifChanged', function (event) {
        var ui = $(this);
        showProcessData(ui.is(":checked"));
    });
    $("#flowCardEmpty").click(function () {
        $("#flowCard").val("");
    });
}

var x = 0;
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
                    "pagingType": "full",
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
                        { "data": null, "title": "流程卡号", "render": function (data, type, row) { return data.FlowCard.substring(2); } },
                        { "data": "ProcessTime", "title": "加工时间" },
                        { "data": "LeftTime", "title": "剩余时间" },
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
                }
                $("#faultCode").append(option.format(data.Code, data.Code, data.AdministratorUser));
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

var processData = null;
function queryFlowCard() {
    hideTip("processCodeTip");
    var opType = 260;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    $("#fcBody").addClass("hidden");
    $("#isChangeDiv").addClass("hidden");
    $("#processSteps").empty();
    $("#info").empty();
    $("#pData").empty();
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
        layer.msg("流程卡号不能为空");
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
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            if (checkPermission(156))
                $("#isChangeDiv").removeClass("hidden");


            $("#fcBody").removeClass("hidden");

            if (checkPermission(323)) {
                var head =
                    '<div class="form-group border-left">' +
                    '<label for="isDifference" class="text-danger">是否微调：</label>' +
                    '<input type="checkbox" id="isDifference" class="icb_minimal">' +
                    '</div>' +
                    '<div class="form-group form-inline hidden" id="differenceDiv">' +
                    '<label class="control-label" for="difference">当前厚度：</label>' +
                    '<input class="form-control" id="difference" placeholder="请输入当前厚度" onfocusin="focusIn($(this))" maxlength="9" onkeyup="onInput(this)" onblur="onInputEnd(this); queryProcessData();">' +
                    '<label class="label-danger hidden" id="differenceTip"></label>' +
                    '</div>';

                $("#info").append(head);
            }
            $("#isDifference").iCheck({
                checkboxClass: 'icheckbox_minimal',
                radioClass: 'iradio_minimal',
                increaseArea: '20%' // optional
            });

            $("#isDifference").on('ifChanged', function (event) {
                var ui = $(this);
                if (ui.is(":checked")) {
                    $("#differenceDiv").removeClass("hidden");
                } else {
                    $("#differenceDiv").addClass("hidden");
                }
                showProcessData();
            });
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
            html += '<p><b>工艺编号：</b>{0}</p>'.format(flowCard.ProcessNumber);
            $("#info").append(html);

            id = deviceId;
            processId = flowCard.ProcessId;
            flowCardId = flowCard.flowCardId;

            processData = flowCard.processData.sort(function (a, b) {
                return a.ProcessOrder > b.ProcessOrder ? 1 : -1;
            });
            showProcessData();

            var processSteps = flowCard.processSteps.sort(function (a, b) {
                return a.ProcessStepOrder > b.ProcessStepOrder ? 1 : -1;
            });
            if (processSteps.length > 0) {
                var tr = '<tr><td>{0}</td><td>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td></tr>';
                for (var j = 0; j < processSteps.length; j++) {
                    var ps = processSteps[j];
                    $("#processSteps").append(tr.format(ps.ProcessStepOrderName, ps.StepName, ps.ProcessStepRequirements, ps.QualifiedRange, ps.QualifiedMode == 0 ? "" : ps.QualifiedMode));
                }
                if (processSteps.length == 2) {
                    LastLand = processSteps[0].QualifiedMode != 0
                        ? processSteps[0].QualifiedMode
                        : processSteps[0].ProcessStepRequirementMid;
                    TarLand = processSteps[1].ProcessStepRequirementMid;
                }
            }
        });
}

var newProcessData = null;
var LastLand = 0;
var TarLand = 0;
function queryProcessData() {
    if (!$("#isDifference").is(":checked"))
        return;
    var opType = 323;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    newProcessData = null;

    //当前厚度
    var difference = $("#difference").val().trim();
    if (isStrEmptyOrUndefined(difference)) {
        showTip("differenceTip", "当前厚度不能为空");
        return;
    }
    difference = parseFloat(difference);
    if (difference <= 0) {
        showTip("differenceTip", "当前厚度必须大于0");
        return;
    }
    if (LastLand == 0) {
        layer.msg("上道工序厚度缺失");
        return;
    }
    if (TarLand == 0) {
        layer.msg("当前工序加工厚度缺失");
        return;
    }
    if (difference < TarLand) {
        layer.msg("当前厚度必须大于加工要求");
        return;
    }
    var pd = {
        // 工艺编号
        Id: processId,
        CurLand: difference,
        LastLand: LastLand,
        TarLand: TarLand
    }

    $("#pData").empty();
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(pd);
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            newProcessData = ret.datas.sort(function (a, b) {
                return a.ProcessOrder > b.ProcessOrder ? 1 : -1;
            });
            showProcessData();
        });
}

function showProcessData(canChange = false) {
    if (!canChange)
        canChange = $("#isChange").is(":checked");
    var pds = !$("#isDifference").is(":checked") ? processData : newProcessData;
    var tr1 = '<tr><td>{0}</td><td>{1}&nbsp;:&nbsp;{2}</td><td>{3}&nbsp;:&nbsp;{4}</td><td>{5}</td><td>{6}</td></tr>';
    var tr2 =
        '<tr>' +
        '    <td style="vertical-align: middle;"><span>{0}</span></td>' +
        '    <td class="form-inline">' +
        '        <input class="text-center" style="width: 45%;" oninput="value=value.replace(/[^\\d]/g,\'\')" value="{1}" />' +
        '        <span style="width: 10%;">:</span>' +
        '        <input class="text-center" style="width: 45%;" oninput="value=value.replace(/[^\\d]/g,\'\')" value="{2}" />' +
        '    </td>' +
        '    <td class="form-inline">' +
        '        <input class="text-center" style="width: 45%;" oninput="value=value.replace(/[^\\d]/g,\'\')" value="{3}" />' +
        '        <span style="width: 10%;">:</span>' +
        '        <input class="text-center" style="width: 45%;" oninput="value=value.replace(/[^\\d]/g,\'\')" value="{4}" />' +
        '    </td>' +
        '    <td><input class="text-center" style="width: 80%;" oninput="value=value.replace(/[^\\d]/g,\'\')" value="{5}" /></td>' +
        '    <td><input class="text-center" style="width: 80%;" oninput="value=value.replace(/[^\\d]/g,\'\')" value="{6}" /></td>' +
        '</tr>';
    if (pds != null && pds.length > 0) {
        $("#pData").empty();
        var tr = !canChange ? tr1 : tr2;
        $("#run").removeClass("disabled");
        for (var j = 0; j < pds.length; j++) {
            var pd = pds[j];
            $("#pData").append(tr.format(pd.ProcessOrder, pd.PressurizeMinute, pd.PressurizeSecond, pd.ProcessMinute, pd.ProcessSecond, pd.Pressure, pd.Speed));
        }
    }
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

    var da = {
        //设备id
        DeviceId: id,
        //程序文件的位置及名称
        ProcessId: processId,
        //描述
        FlowCardId: flowCardId
    };
    var opType = 110;
    if ($("#isDifference").is(":checked")) {
        opType = 155;
        if (newProcessData == null || newProcessData.length == 0) {
            layer.msg("缺少工艺数据");
            return;
        }
        da.ProcessDatas = newProcessData;
    }

    if ($("#isChange").is(":checked")) {
        opType = 156;
        var pd = new Array();
        var pdInput = $("#pData input");
        //$("#pData").append(tr.format(pd.ProcessOrder, pd.PressurizeMinute, pd.PressurizeSecond, pd.ProcessMinute, pd.ProcessSecond, pd.Pressure, pd.Speed));
        var valN = 6;
        if (pdInput.length > 0) {
            for (var j = 0; j < pdInput.length; j++) {
                if (!isStrEmptyOrUndefined(pdInput[j].value) && isNumber(pdInput[j].value)) {
                    if ((j + 1) % valN == 0) {
                        pd.push({
                            ProcessOrder: parseInt(j / valN) + 1,
                            PressurizeMinute: pdInput[j - 5].value,
                            PressurizeSecond: pdInput[j - 4].value,
                            ProcessMinute: pdInput[j - 3].value,
                            ProcessSecond: pdInput[j - 2].value,
                            Pressure: pdInput[j - 1].value,
                            Speed: pdInput[j].value
                        });
                    }
                } else {
                    layer.msg("工艺数据错误");
                    return;
                }
            }
        } else {
            layer.msg("缺少工艺数据");
            return;
        }
        da.ProcessDatas = pd;
    }
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(da);

        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    //getDeviceList();
                }
            });
    }
    showConfirm("设置", doSth);
}

function showFaultModel() {
    var opType = 406;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    hideClassTip('adt');
    $("#faultCode").val("").trigger("change");
    $("#faultOther").val("");
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
            faultData = ret.datas;

            $("#faultType").empty();
            var option = '<option value="{0}">{1}</option>';
            var t = 0;
            for (var i = 0; i < ret.datas.length; i++) {
                var d = ret.datas[i];
                if (t == 0)
                    t = d.Id;
                $("#faultType").append(option.format(d.Id, d.FaultTypeName));
            }
            $("#faultType").val(t).trigger("select2:select");
            $("#faultModel").modal("show");
        });
}

var codes = null;
function reportFault() {
    var opType = 422;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var report = true;
    var faultCode = $("#faultCode").val();
    var faultOther = $("#faultOther").val().split(",");
    //机台号
    if (!isStrEmptyOrUndefined(faultCode) && !isStrEmptyOrUndefined(faultOther)) {
        codes = faultCode.concat(faultOther);
        for (var i = 0; i < faultCode.length; i++) {
            if (faultOther == faultCode[i]) {
                showTip($("#faultOtherTip"), "该机台号已选择，请重新输入");
                report = false;
            }
        }
    } else if (!isStrEmptyOrUndefined(faultCode) && isStrEmptyOrUndefined(faultOther)) {
        codes = faultCode;
    } else if (isStrEmptyOrUndefined(faultCode) && !isStrEmptyOrUndefined(faultOther)) {
        codes = faultOther;
    } else {
        layer.msg('请选择或输入机台号');
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
    //if (isStrEmptyOrUndefined(faultDesc) && faultType == 1) {
    //    showTip($("#faultDescTip"), "故障描述不能为空");
    //    report = false;
    //}
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
                                full.SolverPlan = full.SolverPlan ? full.SolverPlan : "";
                                return full.SolverPlan.length > tdShowContentLength
                                    ? full.SolverPlan.substr(0, tdShowContentLength) +
                                    ' <a href = \"javascript:showUsuallyFaultDetailModel({0})\">. . .</a> '.format(
                                        full.Id)
                                    : full.SolverPlan;
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
    clearRpFlowCard();
    $("#rpFlowCardTip").addClass("hidden");
    $("#tableFlowCard").addClass("hidden");
    var p = info.proleList.indexOf(0) == -1;
    var s = info.proleList.indexOf(1) == -1;

    $("#reportFlowCard").addClass("hidden");
    if (!p || !s)
        $("#reportFlowCard").removeClass("hidden");
    $("#inputReportModel").modal("show");
}

function queryRpFlowCard() {
    $("#gxList").empty();
    $("#tableFlowCard").removeClass("hidden");
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
        $("#tableFlowCard").addClass("hidden");
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
                        return '<input class="form-control" id="c6f{0}" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')">'.format(o, data.QualifiedNumber);
                    }

                } else {
                    if (pIndex == data.ProcessStepOrder && !data.IsReport) {
                        return '<input class="form-control" id="c6f{0}" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')">'.format(o, data.QualifiedNumber);
                    }
                }
                return '<input class="form-control" id="c6f{0}" disabled="disabled" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')">'.format(o, data.QualifiedNumber);
            }
            //不合格数
            var unqualifiedNumber = function (data, type, row) {
                if (data.IsSurvey) {
                    if (sIndex == data.ProcessStepOrder && !data.IsReport) {
                        return '<input class="form-control" id="c7f{0}" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')">'.format(o, data.UnqualifiedNumber);
                    }

                } else {
                    if (pIndex == data.ProcessStepOrder && !data.IsReport) {
                        return '<input class="form-control" id="c7f{0}" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')">'.format(o, data.UnqualifiedNumber);
                    }
                }
                return '<input class="form-control" id="c7f{0}" disabled="disabled" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')">'.format(o, data.UnqualifiedNumber);
            }
            //机台号
            var deviceId = function (data, type, row) {
                return '<span id="c8f{0}" oValue="{2}">{1}</span>'.format(o, data.Code, data.DeviceId);
            }

            //成厚范围
            var qualifiedRange = function (data, type, row) {
                if (data.IsSurvey) {
                    if (sIndex == data.ProcessStepOrder && !data.IsReport) {
                        return '<input class="form-control" id="c9f{0}" style="width:100%" value="{1}" oValue="{1}" onblur="autoCal(this, \'c10f{0}\')" maxlength="20">'.format(o, data.QualifiedRange);
                    }

                } else {
                    if (pIndex == data.ProcessStepOrder && !data.IsReport) {
                        return '<input class="form-control" id="c9f{0}" style="width:100%" value="{1}" oValue="{1}" onblur="autoCal(this, \'c10f{0}\')" maxlength="20">'.format(o, data.QualifiedRange);
                    }
                }
                return '<input class="form-control" id="c9f{0}" disabled="disabled" style="width:100%" value="{1}" oValue="{1}" onblur="autoCal(this, \'c10f{0}\')" maxlength="20">'.format(o, data.QualifiedRange);
            }
            //成厚均值
            var qualifiedMode = function (data, type, row) {
                if (data.IsSurvey) {
                    if (sIndex == data.ProcessStepOrder && !data.IsReport) {
                        return '<input class="form-control" id="c10f{0}" style="width:100%" value="{1}" oValue="{1}" onkeyup="onInput(this)" onblur="onInputEnd(this)" maxlength="10">'.format(o, data.QualifiedMode);
                    }

                } else {
                    if (pIndex == data.ProcessStepOrder && !data.IsReport) {
                        return '<input class="form-control" id="c10f{0}" style="width:100%" value="{1}" oValue="{1}" onkeyup="onInput(this)" onblur="onInputEnd(this)" maxlength="10">'.format(o, data.QualifiedMode);
                    }
                }
                return '<input class="form-control" id="c10f{0}" disabled="disabled" style="width:100%" value="{1}" oValue="{1}" onblur="autoCal(this, \'c10f{0}\')" maxlength="20">'.format(o, data.QualifiedMode);
            }
            $("#gxList")
                .DataTable({
                    "destroy": true,
                    "bSort": false,
                    "paging": false,// 是否显示分页
                    "deferRender": false,
                    "bLengthChange": false,
                    "info": false,
                    "searching": false,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": datas,
                    "aaSorting": [[0, "asc"]],
                    "columns": [
                        { "data": null, "title": "序号", "render": order },
                        //{ "data": "MarkedDateTime", "title": "修改时间" },
                        { "data": null, "title": "工序名称", "render": processStepName },
                        { "data": "ProcessStepRequirements", "title": "加工要求" },
                        { "data": null, "title": "加工人", "render": processorId },
                        { "data": null, "title": "加工时间", "render": processTime },
                        { "data": null, "title": "机台号", "render": deviceId },
                        { "data": null, "title": "检验人", "render": surveyorId },
                        { "data": null, "title": "检验时间", "render": surveyTime },
                        { "data": null, "title": "合格数", "render": qualifiedNumber },
                        { "data": null, "title": "不合格数", "render": unqualifiedNumber },
                        { "data": null, "title": "成厚范围(<span class=\"text-info\">例:0.2～0.3mm</span>)", "render": qualifiedRange },
                        { "data": null, "title": "成厚均值(<span class=\"text-info\">例:0.25</span>)", "render": qualifiedMode },
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
    var canSave = false;
    for (var i = 1; i <= oData.length; i++) {
        var id;
        var processorId;
        var processTime;
        var surveyorId;
        var surveyTime;
        var qualifiedNumber;
        var unqualifiedNumber;
        var deviceId;
        var qualifiedRange;
        var qualifiedMode;
        for (var j = 1; j <= 10; j++) {
            var key = $("#c{1}f{0}".format(i, j));
            var v = key.attr("ovalue");
            var key1;
            var key2;
            switch (j) {
                case 1:
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
                case 9:
                    //成厚范围
                    v = key.val();
                    qualifiedRange = v;
                    break;
                case 10:
                    //成厚均值
                    v = key.val();
                    qualifiedMode = v;
                    if (isStrEmptyOrUndefined($("#c10f{0}".format(i)).attr("disabled"))) {
                        canSave = true;
                        if ((isStrEmptyOrUndefined(qualifiedMode) || parseFloat(qualifiedMode) <= 0)) {
                            layer.msg("成厚均值必须大于0");
                            return;
                        }
                    }
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
            DeviceId: deviceId,
            //成厚范围
            QualifiedRange: qualifiedRange,
            //成厚均值
            QualifiedMode: qualifiedMode
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
    if (!canSave)
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
    $("#tableFlowCard").addClass("hidden");
}

var canImg;
function scanning() {
    //访问用户媒体设备的兼容方法
    var getUserMedia = function (constraints, success, error) {
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
    if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
        //调用用户媒体设备, 访问摄像头
        getUserMedia({ video: { width: 290, height: 290, facingMode: "environment" } }, success, error);
    } else {
        alert('不支持访问用户媒体');
    }
    $("#video").removeClass("hidden");
    canImg = setInterval("capture()", 1000);
    qrcode.callback = function (e) {
        //结果回调
        if (e != "error decoding QR Code" && typeof (Number(e.split(",")[2])) == "number") {
            $("#video").addClass("hidden");
            $("#flowCard").val(e.split(",")[2]);
            clearInterval(canImg);
        }
    }
} 
function capture() {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, 290, 290);
    qrcode.decode(canvas.toDataURL('image/png'));
}
function success(stream) {
    var video = document.getElementById('video');
    //兼容webkit核心浏览器
    //var CompatibleURL = window.URL || window.webkitURL;
    //将视频流设置为video元素的源
    console.log(stream);
    //video.src = CompatibleURL.createObjectURL(stream);
    video.srcObject = stream;
    video.play();
}
function error() {
    $("#video").addClass("hidden");
    layer.msg("访问用户媒体设备失败");
    clearInterval(canImg);
}