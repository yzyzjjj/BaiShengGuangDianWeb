function pageReady() {
    $(".ms2").select2();
    $("#run").addClass("disabled");
    getDeviceList();
    $("#flowCard").change(function () {
        $("#run").addClass("disabled");
    });
    $("#processCode").on("select2:select", function (e) {
        $("#run").addClass("disabled");
    });
    $("#addCraftOp").change(function () {
        var selectValue = $("#addCraftOp").val();
        if (selectValue == "片厚") {
            $("#addCraftThickness").parent().removeAttr("hidden");
        } else {
            $("#addCraftThickness").parent().attr("hidden", "hidden");
        }
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
        //当前厚度
        var difference = $("#difference").val();
        if (difference || difference == "") {
            difference = $("#difference").val().trim();
        }
        if (isStrEmptyOrUndefined(difference)) {
            $("#isDifference").iCheck("uncheck");
        };
        ui.is(":checked") ? $("#refresh").removeClass("hidden") : $("#refresh").addClass("hidden");
        showProcessData(ui.is(":checked"));
    });
    $("#refresh").on("click", function () {
        $("#pData").find("input").val(0);
    });
    $("#flowCardEmpty").click(function () {
        $("#flowCard").val("");
    });
    $("#opUl").on("click", "a", function () {
        $(this).css("backgroundColor", "#d3d3d3").parent().siblings().find("a").css("backgroundColor", "");
        $("#addCraftDate").val(getDate()).datepicker('update');
        $("#addCraftTime").val(getTime()).timepicker('setTime', getTime());
        if ($(this).text() == "片厚") {
            $("#thick").removeClass("hidden");
        } else {
            $("#thick").addClass("hidden");
        }
    });
    if (!pcAndroid()) {
        $(".scanning").addClass("hidden");
    } else {
        $(".upload").addClass("hidden");
    }
    $('.upload').on('click', function () {
        $('#file').trigger('click');
    });
    $("#file").on('change', function () {
        addCover();
        new Promise(function (resolve) {
            printImgUp(resolve, this);
        }.bind(this)).then((result) => {
            removeCover();
            $(this).val("");
            if (result) {
                var f = result.split(",")[2];
                $('#inputReportModel').is(':hidden') ? $("#flowCard").val(f) : $("#rpFlowCard").val(f);
            }
        });
    });
    $("#stateSelect").on('change', function (e) {
        getLogList();
    });
    $("#workshop").on("change", function (e) {
        setWorkSiteSelect();
    });
    $("#devSite").select2({
        allowClear: true,
        placeholder: "请选择(可不选)"
    });
}

//扫描二维码
function scanning(el) {
    new Promise(function (resolve) {
        showPrintModal(resolve);
    }).then((result) => {
        if (result) {
            $(`#${el}`).val(result.split(",")[2]);
        }
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
    data.opData = JSON.stringify({
        hard: true,
        work: true
    });
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
            var order = function (data, type, row, meta) {
                return meta.row + 1;
            }
            var tdWidth = function () {
                $("#deviceList th").css("paddingRight", "22px").css("paddingLeft", 0);
            }
            $("#deviceList")
                .DataTable({
                    "pagingType": "full",
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "Id", "title": "Id", "bVisible": false },
                        { "data": "Code", "title": "机台号" },
                        { "data": "CategoryName", "title": "类型" },
                        { "data": null, "title": "设备状态", "render": deviceState },
                        { "data": "FlowCard", "title": "流程卡号" },
                        { "data": "ProcessTime", "title": "加工时间" },
                        { "data": "LeftTime", "title": "剩余时间" }
                    ],
                    "columnDefs": [
                        { "type": "html-percent", "targets": [2] }
                    ],
                    "drawCallback": tdWidth
                });
            $(".ms2").empty();
            var html = "";
            var option = '<option value="{0}" id="{2}" index="{3}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                var state = data.DeviceStateStr;
                if (state == '待加工' || state == '加工中') {
                    $("#processCode,#addCraftCode").append(option.format(data.Id, data.Code, ''));
                }
                html += option.format(data.Code, data.Code, data.Administrator, data.Id);
            }
            $("#faultCode").append(html);
        });
}

var oProcessData = null;
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
    $("#isChange").iCheck("uncheck");

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

    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        Id: deviceId,
        FlowCardName: flowCard
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
                    '<label class="control-label" for="difference">当前厚度(mm)：</label>' +
                    '<div class="from-group no-margin" style="display:-webkit-inline-box">' +
                    '<input type="tel" class="form-control" id="difference" autocomplete="off" placeholder="请输入当前厚度" style="width:150px" onfocusin="focusIn($(this))" maxlength="9" onkeyup="onInput(this)" oninput="value=value.replace(/[^\\d\\.]/g,\'\')" onblur="onInputEnd(this); queryProcessData();" maxlength="6">' +
                    '<label class="label-danger hidden" id="differenceTip" style="display:table-cell;height:34px;vertical-align:middle"></label>' +
                    '</div>' +
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
                    hideTip("differenceTip");
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
            newProcessData = null;
            showProcessData();

            var processSteps = flowCard.processSteps.sort(function (a, b) {
                return a.ProcessStepOrder > b.ProcessStepOrder ? 1 : -1;
            });
            if (processSteps.length > 0) {
                var tr = '<tr><td>{0}</td><td>{1}</td><td>{2}</td><td>{5}</td><td>{3}</td><td>{4}</td></tr>';
                for (var j = 0; j < processSteps.length; j++) {
                    var ps = processSteps[j];
                    $("#processSteps").append(tr.format(ps.ProcessStepOrderName, ps.StepName, ps.ProcessStepRequirements, ps.QualifiedRange, ps.QualifiedMode == 0 ? "" : ps.QualifiedMode, ps.ProcessStepRequirementMid));
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
    if (difference == 0 || difference > 20) {
        showTip("differenceTip", "当前厚度必须在0-20之间");
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
        '    <td style="vertical-align: middle;"><span class="num">{0}</span></td>' +
        '    <td class="form-inline">' +
        '        <input type="tel" class="text-center" style="width: 45%;" oninput="value=value.replace(/[^\\d]/g,\'\')" value="{1}" maxlength="9" />' +
        '        <span style="width: 10%;">:</span>' +
        '        <input type="tel" class="text-center" style="width: 45%;" oninput="value=value.replace(/[^\\d]/g,\'\')" value="{2}" onblur="value=isStrEmptyOrUndefined(value)?\'\':(parseInt(value)>59?59:parseInt(value))" maxlength="9" />' +
        '    </td>' +
        '    <td class="form-inline">' +
        '        <input type="tel" class="text-center" style="width: 45%;" oninput="value=value.replace(/[^\\d]/g,\'\')" value="{3}" maxlength="9" />' +
        '        <span style="width: 10%;">:</span>' +
        '        <input type="tel" class="text-center" style="width: 45%;" oninput="value=value.replace(/[^\\d]/g,\'\')" value="{4}" onblur="value=isStrEmptyOrUndefined(value)?\'\':(parseInt(value)>59?59:parseInt(value))" maxlength="9" />' +
        '    </td>' +
        '    <td><input type="tel" class="text-center" style="width: 80%;" oninput="value=value.replace(/[^\\d]/g,\'\')" value="{5}" maxlength="9" /></td>' +
        '    <td><input type="tel" class="text-center" style="width: 80%;" oninput="value=value.replace(/[^\\d]/g,\'\')" value="{6}" maxlength="9" /></td>' +
        '    <td><button type="button" class="minus btn btn-danger btn-xs"><i class="fa fa-minus"></i></button>' +
        '<button type="button" class="plus btn btn-success btn-xs"><i class="fa fa-plus"></i></button></td>' +
        '</tr>';
    if (pds != null && pds.length > 0) {
        $("#pData").empty();
        var tr = !canChange ? tr1 : tr2;
        $("#run").removeClass("disabled");
        for (var j = 0; j < pds.length; j++) {
            var pd = pds[j];
            $("#pData").append(tr.format(pd.ProcessOrder, pd.PressurizeMinute, pd.PressurizeSecond, pd.ProcessMinute, pd.ProcessSecond, pd.Pressure, pd.Speed));
        }
        $("#tableP td").css("padding", "2px");
        $("#tableP td").css("paddingTop", "8px").css("paddingBottom", "8px");
    }
    $("#pData").off("click").on("click", ".plus", function () {
        var op = $(this).parents("tr");
        op.after(tr2.format(0, 0, 0, 0, 0, 0, 0));
        $("#tableP td").css("padding", "2px");
        $("#tableP td").css("paddingTop", "8px").css("paddingBottom", "8px");
        var i, len = $("#pData .num").length;
        for (i = 0; i < len; i++) {
            $($("#pData .num")[i]).text(i + 1);
        }
        if (len == 8) {
            $(".plus").addClass("hidden");
        }
    });
    $("#pData").on("click", ".minus", function () {
        var op = $(this).parents("tr");
        op.remove();
        $(".plus").removeClass("hidden");
        var i, len = $("#pData .num").length;
        for (i = 0; i < len; i++) {
            $($("#pData .num")[i]).text(i + 1);
        }
    });
    $("#pData").off("focusin").on("focusin", "input", function (e) {
        var v = $(this).val();
        if (v == 0) {
            $(this).val("");
        }
    });
    $("#pData").off("focusout").on("focusout", "input", function (e) {
        var v = $(this).val();
        if (isStrEmptyOrUndefined(v)) {
            $(this).val("0");
        }
    });
}

function minus() {
    var tr = $(this).parents("tr");
    tr.remove();
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
        //当前厚度
        var difference = $("#difference").val().trim();
        if (isStrEmptyOrUndefined(difference)) {
            showTip("differenceTip", "当前厚度不能为空");
            return;
        }
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
                    addCraftModal();
                    if ($("#isDifference").is(":checked")) {
                        var difference = $("#difference").val().trim();
                        if (isStrEmptyOrUndefined(difference)) {
                            return;
                        }
                        difference = parseFloat(difference);
                        data = {}
                        data.opType = 166;
                        data.opData = JSON.stringify({
                            DeviceId: id,
                            Time: getFullTime(),
                            OpName: "微调",
                            Thickness: difference
                        });
                        ajaxPost("/Relay/Post", data,
                            function (ret) {
                                //layer.msg(ret.errmsg);
                            });
                    }
                }
            });
    }
    showConfirm("设置", doSth);
}

//获取故障类型
function getFaultType() {
    var opType = 406;
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
            faultData = ret.datas;
            $("#faultType").empty();
            var option = '<option value="{0}">{1}</option>';
            var options = '';
            for (var i = 0, len = faultData.length; i < len; i++) {
                var d = faultData[i];
                options += option.format(d.Id, d.FaultTypeName);
            }
            $("#faultType").append(options);
            $("#faultType").val($("#faultType").val()).trigger("select2:select");
        });
}

//获取车间
function getWorkShop() {
    var opType = 162;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $("#workshop").empty();
        var list = ret.datas;
        var op = '<option value = "{0}">{0}</option>';
        var ops = '';
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            ops += op.format(d.SiteName);
        }
        $("#workshop").append(ops);
        getSite();
    });
}

var _siteData = null;
//获取场地
function getSite() {
    var opType = 125;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        _siteData = {};
        var rData = ret.datas;
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            _siteData[d.SiteName]
                ? _siteData[d.SiteName].push(d.RegionDescription)
                : _siteData[d.SiteName] = [d.RegionDescription];
        }
        setWorkSiteSelect();
    });
}

//车间对应场地
function setWorkSiteSelect() {
    $('#devSite').empty();
    var workshop = $("#workshop").val();
    if (isStrEmptyOrUndefined(workshop)) {
        return;
    }
    var sData = _siteData[workshop];
    var ops = '';
    for (var i = 0, len = sData.length; i < len; i++) {
        var d = sData[i];
        ops += `<option value=${d}>${d}</option>`;
    }
    $('#devSite').append(ops);
    $("#devSite").val(0).trigger('change');
}

var _updateFirmwareUpload = null;
function showFaultModel() {
    getFaultType();
    getWorkShop();
    if (_updateFirmwareUpload == null) {
        _updateFirmwareUpload = initFileInputMultiple("addImg", fileEnum.FaultDevice);
    }
    $("#addImg").fileinput('clear');
    $('#addImgBox').find('.file-caption-name').attr('readonly', true).attr('placeholder', '请选择图片...');
    hideClassTip('adt');
    $("#faultCode").val("").trigger("change");
    $("#faultOther").val("");
    $("#faultDate").val(getDate()).datepicker('update');
    $("#faultTime").val(getTime()).timepicker('setTime', getTime());
    var info = getCookieTokenInfo();
    $("#proposer").val(info.name);
    $("#faultDesc").val("");
    $("#faultModel").modal("show");
}

function reportFault() {
    var opType = 422;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var faultCode = $("#faultCode").val();
    var faultOther = $("#faultOther").val().trim();
    if (isStrEmptyOrUndefined(faultCode) && isStrEmptyOrUndefined(faultOther)) {
        layer.msg('请选择或输入设备');
        return;
    }
    var i, len;
    //机台号
    if (!isStrEmptyOrUndefined(faultCode) && !isStrEmptyOrUndefined(faultOther)) {
        for (i = 0, len = faultCode.length; i < len; i++) {
            if (faultOther == faultCode[i]) {
                layer.msg('其他机台号已选择，请重新输入');
                return;
            }
        }
    }
    if (!isStrEmptyOrUndefined(faultOther)) {
        var workshop = $('#workshop').val();
        if (isStrEmptyOrUndefined(workshop)) {
            layer.msg('请选择车间');
            return;
        } else {
            var site = $('#devSite').val();
            faultOther = `${workshop}-${site ? site + '-' : ''}${faultOther}`;
        }
    }
    //报修人
    var proposer = $("#proposer").val().trim();
    if (isStrEmptyOrUndefined(proposer)) {
        layer.msg('报修人不能为空');
        return;
    }
    //故障时间
    var faultDate = $("#faultDate").val();
    var faultTime = $("#faultTime").val();
    var time = `${faultDate} ${faultTime}`;
    if (exceedTime(time)) {
        layer.msg("所选时间不能大于当前时间");
        return;
    }
    //故障类型
    var faultType = $("#faultType").val();
    if (isStrEmptyOrUndefined(faultType)) {
        layer.msg("请选择故障类型");
        return;
    }
    var faultDesc = $("#faultDesc").val().trim();
    var faults = [];
    var admins = [];
    var list = {
        //故障时间
        FaultTime: time,
        //报修人
        Proposer: proposer,
        //故障描述
        FaultDescription: faultDesc,
        //故障类型
        FaultTypeId: faultType
    }
    if (!isStrEmptyOrUndefined(faultOther)) {
        var other = $.extend({}, list);
        other.DeviceCode = faultOther;
        faults.push(other);
    }
    if (faultCode != null) {
        for (i = 0, len = faultCode.length; i < len; i++) {
            var code = faultCode[i];
            var op = $("#faultCode").find(`option[value=${code}]`);
            var codeId = op.attr("index");
            list.DeviceId = codeId;
            faults.push($.extend({}, list));
            var admin = op.attr("id");
            admins.push({
                Code: code,
                Admin: admin
            });
        }
    }
    var imgJson = function (resolve) {
        var imgData = $('#addImg').val();
        if (!isStrEmptyOrUndefined(imgData)) {
            $('#addImg').fileinput("upload");
            fileCallBack[fileEnum.FaultDevice] = (fileRet) => {
                if (fileRet.errno == 0) {
                    var img = [];
                    for (var key in fileRet.data) {
                        img.push(fileRet.data[key].newName);
                    }
                    img = JSON.stringify(img);
                    for (i = 0, len = faults.length; i < len; i++) {
                        var d = faults[i];
                        d.Images = img;
                    }
                    resolve('success');
                }
            };
        } else {
            resolve('success');
        }
    }
    new Promise(function (resolve) {
        imgJson(resolve);
    }).then(function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(faults);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                $("#faultModel").modal("hide");
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getDeviceList();
                    for (i = 0, len = admins.length; i < len; i++) {
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
    });
}

function getUsuallyFaultList() {
    var opType = 400;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    $("#usuallyFaultList").empty();
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var rSolvePlan = function (d, type, row, meta) {
                var data = d.SolvePlan;
                return `<span title = "${data}" onclick = "showAllContent('${escape(data)}', '解决方案')">${data.length > tdShowLength ? data.substring(0, tdShowLength) + "..." : data}</span>`;
            }

            $("#usuallyFaultList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": [
                        { "data": "Id", "title": "序号" },
                        { "data": "UsuallyFaultDesc", "title": "常见故障" },
                        { "data": null, "title": "解决方案", "render": rSolvePlan, "orderable": false }
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
                $("#usuallyFaultDetail").html(ret.datas[0].SolvePlan);

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

var rpFcId;
function queryRpFlowCard() {
    $("#gxList").empty();
    $("#tableFlowCard").removeClass("hidden");
    var opType = 202;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    //流程卡
    var flowCard = $("#rpFlowCard").val().trim();
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
                rpFcId = datas[0].FlowCardId;
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
                o++;
                return '<span id="c1f{0}" oValue="{1}">{2}</span>'.format(data.ProcessStepOrder, data.Id, o);
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
            var html =
                '<input type="text" id="c51f{0}" class="form_date form-control" value="{2}" style="width:90px;background-color:white;">' +
                '<input type="text" id="c52f{0}" class="form_time form-control" value="{3}" style="width:75px;background-color:white;">' +
                '<span id="c5f{0}" oValue="{1}" class="hidden">{1}</span>';
            //检验时间
            var surveyTime = function (data, type, row) {
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
                    "language": oLanguage,
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
    var flowCardId = parseInt(rpFcId);
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
            Id: id,
            //流程卡(自增Id)
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

function addCraftModal() {
    var v = $("#processCode").val();
    $("#addCraftCode").val(v).trigger("change");
    $("#addCraftDate").val(getDate()).datepicker('update');
    $("#addCraftTime").val(getTime()).timepicker('setTime', getTime());
    $("#addCraftThickness").val("");
    $("#op1").click();
    $("#addCraftModel").modal("show");
}

function addCraft() {
    var opType = 166;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var addCode = $("#addCraftCode").val();
    if (isStrEmptyOrUndefined(addCode)) {
        layer.msg("请选择设备");
        return;
    }
    if (isStrEmptyOrUndefined($("#addCraftDate").val())) {
        layer.msg("请选择完整的时间");
        return;
    }
    var time = $("#addCraftDate").val() + " " + $("#addCraftTime").val();
    if (exceedTime(time)) {
        layer.msg("操作时间不能大于当前时间");
        return;
    }
    var i, len = $("#opUl a").length, opName;
    for (i = 0; i < len; i++) {
        var op = $("#opUl a")[i];
        if ($(op).attr("aria-expanded") == "true") {
            opName = $(op).text();
        }
    }
    var h = 0;
    if (opName == "片厚") {
        var difference = $("#addCraftThickness").val().trim();
        if (isStrEmptyOrUndefined(difference)) {
            layer.msg("请输入片厚");
            return;
        };
        if (difference == parseFloat(difference)) {
            difference = parseFloat(difference);
        } else {
            layer.msg("请输入正确的数值");
            return;
        }
        if (difference == 0 || difference > 20) {
            layer.msg("片厚范围在0-20之间");
            return;
        }
        h = difference;
    }
    var doSth = function () {
        $("#addCraftModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            DeviceId: addCode,
            Time: time,
            OpName: opName,
            Thickness: h
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
            });
    }
    showConfirm("添加", doSth);
}

function showMaintainerModel() {
    var opType = 430;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    $("#maintainerList").empty();
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({ menu: true });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var order = function (data, type, row, meta) {
                return meta.row + 1;
            }
            var remark = function (data, type, row, meta) {
                return data.length > tdShowLength
                    ? `<span title = "${data}" onclick = "showAllContent('${escape(data)}')">${
                    data.substring(0, tdShowLength)}...</span>`
                    : `<span title = "${data}">${data}</span>`;
            }
            $("#maintainerList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rtip',
                    "bAutoWidth": false,
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "columns": [
                        { "data": "Id", "title": "序号", "render": order, "sWidth": "80px" },
                        { "data": "Name", "title": "姓名", "sWidth": "120px" },
                        { "data": "Phone", "title": "手机号", "sWidth": "130px" },
                        { "data": "Remark", "title": "备注", "render": remark }
                    ]
                });
            $("#maintainerModel").modal("show");
        });
}

//报修记录弹窗
function showLogModel() {
    var opType = 438;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var nowMonth = getMonthScope();
    $('#logSTime,#logETime').off('changeDate');
    $("#logSTime").val(nowMonth.start).datepicker('update');
    $("#logETime").val(nowMonth.end).datepicker('update');
    $('#logSTime,#logETime').on('changeDate', function () {
        getLogList();
    });
    $('#stateSelect').val(-1);
    getLogList();
    $('#showLogModel').modal('show');
}

//获取报修记录
function getLogList() {
    var opType = 438;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var startTime = $('#logSTime').val();
    var endTime = $('#logETime').val();
    if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
        layer.msg('请选择故障时间');
        return;
    }
    if (comTimeDay(startTime, endTime)) {
        return;
    }
    var state = $('#stateSelect').val();
    if (isStrEmptyOrUndefined(state)) {
        layer.msg('请选择状态');
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({ startTime, endTime, state });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var account = getCookieTokenInfo().account;
            var order = function (a, b, c, d) {
                return d.row + 1;
            }
            var priority = function (d) {
                var op = '<span style="color:{1}">{0}</span>';
                var str = '', color = '';
                switch (d) {
                    case 0:
                        str = '低';
                        color = 'black';
                        break;
                    case 1:
                        str = '中';
                        color = '#CC6600';
                        break;
                    case 2:
                        str = '高';
                        color = 'red';
                        break;
                }
                return op.format(str, color);
            }
            var stateDesc = function (d) {
                var op = `<span style="color:{0}">${d.StateDesc}</span>`;
                var color = '';
                switch (d.State) {
                    case 0:
                        color = 'red';
                        break;
                    case 1:
                        color = '#996600';
                        break;
                    case 2:
                        color = 'green';
                        break;
                    case 3:
                        color = 'blue';
                        break;
                }
                return op.format(color);
            }
            var remark = function (d) {
                return d == '' || d.length < tdShowLength ? d : `<span title = "${d}" onclick="showAllContent('${escape(d)}', '维修备注')">${d.substring(0, tdShowLength) + "..."}</span>`;
            }
            var solveTime = function (d) {
                return d == '0001-01-01 00:00:00' ? '' : d.slice(0, d.lastIndexOf(':'));
            }
            var detailBtn = function (d) {
                var op = '<button type="button" class="btn btn-{0} btn-sm" onclick="showLogDetailModel({2},{3})"}>{1}</button>';
                return d.State == 3 && d.Score == 0 && d.Account == account ? op.format('primary', '评价', d.Id, 0) : op.format('success', '查看', d.Id, 1);
            }
            $("#logList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rtip',
                    "bAutoWidth": false,
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "columns": [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "DeviceCode", "title": "机台号" },
                        { "data": "FaultTime", "title": "故障时间", "render": solveTime },
                        { "data": "Priority", "title": "优先级", "render": priority },
                        { "data": null, "title": "状态", "render": stateDesc },
                        { "data": "Score", "title": "评分", "sClass": "text-primary" },
                        { "data": "Maintainer", "title": "维修工" },
                        { "data": "Phone", "title": "联系方式" },
                        { "data": "Remark", "title": "维修备注", "render": remark },
                        { "data": "EstimatedTime", "title": "预计解决时间", "render": solveTime },
                        { "data": "SolveTime", "title": "解决时间", "render": solveTime },
                        { "data": null, "title": "详情", "render": detailBtn }
                    ]
                });
        });
}

//报修记录详情弹窗
function showLogDetailModel(logId, isLook) {
    var opType = 438;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        qId: logId
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var d = ret.datas[0];
        if (isLook) {
            $('#showLogDetailModel .lookFalse').addClass('hidden');
            $('#scoreText').removeClass('hidden');
            $('#scoreText').text(d.Score);
        } else {
            $('#showLogDetailModel .lookFalse').removeClass('hidden');
            $('#scoreText').addClass('hidden');
            $('#scoreInput').val('');
            $('#scoreText').text('');
        }
        $('#comment').prop('disabled', isLook);
        $('#comment').val(d.Comment);
        $('#updateCommentBtn').val(d.Id);
        $('#deviceText').text(d.DeviceCode);
        $('#proposerText').text(d.Proposer);
        $('#faultTypeText').text(d.FaultTypeName);
        $('#faultTimeText').text(d.FaultTime.slice(0, d.FaultTime.lastIndexOf(':')));
        $('#faultTypeDesc').text(d.FaultDescription);
        $('#faultSup').text(d.Fault1);
        var priority = d.Priority;
        var str = '', color = '';
        switch (priority) {
            case 0:
                str = '低';
                color = 'black';
                break;
            case 1:
                str = '中';
                color = '#CC6600';
                break;
            case 2:
                str = '高';
                color = 'red';
                break;
        }
        $('#priorityText').text(str).css('color', color);
        $('#solveProposerText').text(d.FaultSolver);
        $('#actualFaultTypeText').text(d.FaultTypeName1);
        var estimatedTime = d.EstimatedTime;
        $('#estimatedTimeText').text(estimatedTime == '0001-01-01 00:00:00' ? '' : estimatedTime.slice(0, estimatedTime.lastIndexOf(':')));
        var solveTime = d.SolveTime;
        $('#solveTimeText').text(solveTime == '0001-01-01 00:00:00' ? '' : solveTime.slice(0, solveTime.lastIndexOf(':')));
        $('#costTimeText').text(d.CostTime);
        $('#fault2').val(d.Fault2);
        $('#remark').text(d.Remark);
        $('#solvePlan').text(d.SolvePlan);
        $('#detailImgList').empty();
        if (d.ImageList > 0) {
            data = {
                type: fileEnum.FaultDevice,
                files: d.Images
            };
            ajaxPost("/Upload/Path", data, function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }
                var imgOp = '<div class="col-lg-2 col-md-3 col-sm-4 col-xs-6">' +
                    '<div class="thumbnail">' +
                    '<img src={0} style="height:200px">' +
                    '<div class="caption text-center">' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                var imgOps = "";
                for (var i = 0; i < ret.data.length; i++) {
                    imgOps += imgOp.format(ret.data[i].path);
                }
                $("#detailImgList").append(imgOps);
            });
        }
    });
    $('#showLogDetailModel').modal('show');
}

//保存报修记录评价
function updateComment() {
    var opType = 439;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var id = parseInt($(this).val());
    var score = $('#scoreInput').val().trim();
    if (isStrEmptyOrUndefined(score)) {
        layer.msg("请输入评分");
        return;
    }
    score = parseInt(score);
    var comment = $('#comment').val().trim();
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        Id: id,
        Score: score,
        Comment: comment,
        Account: getCookieTokenInfo().account
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        layer.msg(ret.errmsg);
        $('#showLogDetailModel').modal('hide');
        if (ret.errno == 0) {
            getLogList();
            showLogDetailModel(id, score);
        }
    });
}