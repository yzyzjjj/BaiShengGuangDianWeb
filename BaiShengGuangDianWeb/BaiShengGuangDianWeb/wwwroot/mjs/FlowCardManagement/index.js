function pageReady() {
    $(".ms2").css("width", "100%");
    $(".ms2").select2();

    $("#flowCardStartDate").val(getDate()).datepicker('update');
    $("#flowCardEndDate").val(getDate()).datepicker('update');
    //getFlowCardList();
    //getProductionProcessList();
    //getRawMateriaList();
    if (!checkPermission(210)) {
        $("#showAddFlowCardModel").addClass("hidden");
    }
    if (!checkPermission(220)) {
        $("#showProductionProcessModel").addClass("hidden");
    }
    if (!checkPermission(237)) {
        $("#showAddRawMateriaModel").addClass("hidden");
    }
}

var fProductionProcessList = false;
var fRawMateriaList = false;
//流程卡
function showAddFlowCardModel() {
    hideClassTip("adt");
    $("#afRawMaterialQuantity").val("");
    $("#afStartFlowCard").val("");
    $("#afFlowCardNumber").val("1");
    $("#afSender").val("");
    $("#afInboundNum").val("");
    $("#afRemarks").val("");
    var opType = 215;
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
            };
            $("#afProductionProcess").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var opt = ret.datas[i];
                $("#afProductionProcess").append(option.format(opt.Id, opt.ProductionProcessName));
            }


            opType = 232;
            data = {}
            data.opType = opType;
            ajaxPost("/Relay/Post", data,
                function (ret) {
                    if (ret.errno != 0) {
                        layer.msg(ret.errmsg);
                        return;
                    };

                    $("#afRawMateria").empty();
                    var option = '<option value="{0}">{1}</option>';
                    for (var i = 0; i < ret.datas.length; i++) {
                        var opt = ret.datas[i];
                        $("#afRawMateria").append(option.format(opt.Id, opt.RawMateriaName));
                    }

                    $("#addFlowCardModel").modal("show");
                });
        });
}

function addFlowCard() {
    var opType = 210;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var afProductionProcess = $("#afProductionProcess").val().trim();
    var afRawMateria = $("#afRawMateria").val().trim();
    var afRawMaterialQuantity = $("#afRawMaterialQuantity").val().trim();
    var afPriority = $("#afPriority").val().trim();
    var afInboundNum = $("#afInboundNum").val().trim();
    var afRemarks = $("#afRemarks").val().trim();
    var afSender = $("#afSender").val().trim();

    var afStartFlowCard = $("#afStartFlowCard").val().trim();
    var afFlowCardNumber = $("#afFlowCardNumber").val().trim();

    if (isStrEmptyOrUndefined(afRawMaterialQuantity)) {
        showTip($("#afRawMaterialQuantityTip"), "原料数量不能为空");
        return;
    }
    var afRq = parseInt(afRawMaterialQuantity);
    if (afRq <= 0) {
        showTip($("#afRawMaterialQuantityTip"), "原料数量必须大于0");
        return;
    }

    if (isStrEmptyOrUndefined(afStartFlowCard)) {
        showTip($("#afStartFlowCardTip"), "起始流程卡号不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(afFlowCardNumber)) {
        showTip($("#afFlowCardNumberTip"), "流程卡数不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(afSender)) {
        showTip($("#afSenderTip"), "发片人不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(afInboundNum)) {
        showTip($("#afInboundNumTip"), "入库号不能为空");
        return;
    }
    var flowCard = parseInt(afStartFlowCard);
    var count = parseInt(afFlowCardNumber);
    var pData = new Array();
    for (var i = 0; i < count; i++) {
        pData.push({
            //流程卡号
            FlowCardName: flowCard + i,
            //计划号
            ProductionProcessId: afProductionProcess,
            //原料批号
            RawMateriaId: afRawMateria,
            //原料数量
            RawMaterialQuantity: afRawMaterialQuantity,
            //发片人
            Sender: afSender,
            //入库序号
            InboundNum: afInboundNum,
            //优先级
            Priority: afPriority,
            //备注
            Remarks: afRemarks
        });
    }

    var doSth = function () {
        $("#addFlowCardModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(pData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFlowCardList();
                }
            });
    }
    showConfirm("添加", doSth);
}

function getFlowCardList() {
    var opType = 200;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var start = $("#flowCardStartDate").val();
    var end = $("#flowCardEndDate").val();
    if (compareDate(start, end)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }

    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        StartTime: start,
        EndTime: end
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var op = function (data, type, row) {
                var html = "{0}{1}{2}";
                var changeBtn = '<button type="button" class="btn btn-primary" onclick="showUpdateFlowCard({0})">修改</button>'.format(data.Id);
                var updateBtn = '<button type="button" class="btn btn-info" onclick="showChangeFlowCard({0})">更新</button>'.format(data.Id);
                var delBtn = '<button type="button" class="btn btn-danger" onclick="deleteFlowCard({0}, \'{1}\')">删除</button>'.format(data.Id, escape(data.FlowCardName));

                html = html.format(
                    checkPermission(207) ? changeBtn : "",
                    checkPermission(208) ? updateBtn : "",
                    checkPermission(211) ? delBtn : "");
                return html;
            }
            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var processTime = function (data, type, row) {
                if (data.ProcessTime == '0001-01-01 00:00:00')
                    data.ProcessTime = "";
                return data.ProcessTime;
            }
            var processStepName = function (data, type, row) {
                if (isStrEmptyOrUndefined(data.StepName))
                    return '未开始加工';
                return data.CategoryName + "-" + data.StepName;
            }
            var priority = function (data, type, row) {
                var state = data.Priority;
                if (state == 2)
                    return '<span class="text-red"><span class="hidden">2</span>高</span>';
                if (state == 1)
                    return '<span class="text-warning"><span class="hidden">1</span>中</span>';
                return '<span class="text-success"><span class="hidden">0</span>低</span>';
            }
            var columns = checkPermission(207) || checkPermission(208) || checkPermission(211)
                ? [
                    { "data": null, "title": "操作", "render": op },
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "CreateTime", "title": "创建时间" },
                    { "data": "ProductionProcessName", "title": "计划号" },
                    { "data": "FlowCardName", "title": "流程卡号" },
                    { "data": "RawMateriaName", "title": "原料批次" },
                    { "data": null, "title": "优先级", "render": priority },
                    { "data": null, "title": "当前工序", "render": processStepName, "sClass": "text-info" },
                    { "data": null, "title": "加工时间", "render": processTime, "sClass": "text-info" },
                    { "data": "QualifiedNumber", "title": "当前合格数", "sClass": "text-info" },
                    { "data": "Code", "title": "当前机台号", "sClass": "text-info" }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "CreateTime", "title": "创建时间" },
                    { "data": "ProductionProcessName", "title": "计划号" },
                    { "data": "FlowCardName", "title": "流程卡号" },
                    { "data": "RawMateriaName", "title": "原料批次" },
                    { "data": null, "title": "优先级", "render": priority },
                    { "data": null, "title": "当前工序", "render": processStepName, "sClass": "text-info" },
                    { "data": null, "title": "加工时间", "render": processTime, "sClass": "text-info" },
                    { "data": "QualifiedNumber", "title": "当前合格数", "sClass": "text-info" },
                    { "data": "Code", "title": "当前机台号", "sClass": "text-info" }
                ];
            var aaSorting = checkPermission(207) || checkPermission(208) || checkPermission(211)
                ? [[1, "asc"]]
                : [[0, "asc"]];
            var defs = checkPermission(207) || checkPermission(208) || checkPermission(211)
                ? [
                    { "orderable": false, "targets": 0 }
                ]
                : "";
            $("#flowCardList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    //"deferRender": true,
                    "autoWidth": true,
                    //"paginationType": "full_numbers", 
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aaSorting": aaSorting,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": columns,
                    "columnDefs": defs
                });
        });
}

function deleteFlowCard(id, name) {
    name = unescape(name);

    var opType = 211;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFlowCardList();
                }
            });
    }
    showConfirm("删除流程卡：" + name, doSth);
}

var ufRecover = 0;
var ufGGmax = 1;
var ufGGmaxV = 1;
var ufGXmax = 1;
var ufGXmaxV = 1;
function showUpdateFlowCard(type) {
    var doSth = function () {
        hideClassTip("adt");
        $("#ufGGBody").empty();
        $("#ufGXBody").empty();
        ufGGmax = ufGGmaxV = ufGXmax = ufGXmaxV = 1;
        var opType = 201;
        if (!checkPermission(opType)) {
            layer.msg("没有权限");
            return;
        }
        if (type == -1 && ufRecover == 1)
            return;
        if (type == -1)
            ufRecover = 1;
        var id = type == -1 ? $("#updateFCId").html() : type;
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
                };

                var r = ret.datas[0];
                $("#updateFCId").html(id);
                $("#ufProductionProcess").val(r.ProductionProcessName);
                $("#ufRawMateria").val(r.RawMateriaName);
                $("#ufPriority").val(r.Priority);
                $("#ufRawMaterialQuantity").val(r.RawMaterialQuantity);
                $("#ufFlowCardName").val(r.FlowCardName);
                $("#ufSender").val(r.Sender);
                $("#ufInboundNum").val(r.InboundNum);
                $("#ufRemarks").val(r.Remarks);

                var tr;
                for (var j = 0; j < r.Specifications.length; j++) {
                    var productionProcessSpecification = r.Specifications[j];
                    tr = ('<tr id="ufGG{0}" value="{2}">' +
                        '<td><label class="control-label" id="ufGGx{0}">{1}</label></td>' +
                        '<td><input class="form-control" value="{3}" id="ufGGm{0}" maxlength="20"></td>' +
                        '<td><input class="form-control" value="{4}" id="ufGGz{0}" maxlength="20"></td>' +
                        '<td><button type="button" class="btn btn-default btn-sm" onclick="ufGGDelSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
                        '</tr>').format(ufGGmax, ufGGmaxV, productionProcessSpecification.Id, productionProcessSpecification.SpecificationName, productionProcessSpecification.SpecificationValue);
                    $("#ufGGBody").append(tr);
                    ufGGmax++;
                    ufGGmaxV++;
                }
                var processStep;
                for (var j = 0; j < r.ProcessSteps.length; j++) {
                    processStep = r.ProcessSteps[j];
                    tr = ('<tr id="ufGX{0}" value="{2}">' +
                        '<td><label class="control-label" id="ufGXx{0}">{1}</label></td>' +
                        '<td><select class="ms2 yc form-control" id="ufGXm{0}"></td>' +
                        '<td><input class="form-control" value="{3}" id="ufGXz{0}" onblur="autoCal(this, \'ufGXh{0}\')" maxlength="100"></td>' +
                        '<td><input class="form-control text-center" value="{4}" id="ufGXh{0}" onkeyup="onInput(this)" onblur="onInputEnd(this)" maxlength="10"></td>' +
                        '<td><button type="button" class="btn btn-default btn-sm" onclick="ufGXDelSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
                        '</tr>').format(ufGXmax, ufGXmaxV, processStep.Id, processStep.ProcessStepRequirements, processStep.ProcessStepRequirementMid);
                    $("#ufGXBody").append(tr);
                    ufGXmax++;
                    ufGXmaxV++;
                }

                if (DeviceProcessData != null) {
                    $(".yc").empty();
                    var option = '<option value="{0}">{1}-{2}</option>';
                    for (var i = 0; i < DeviceProcessData.length; i++) {
                        var opt = DeviceProcessData[i];
                        $(".yc").append(option.format(opt.Id, opt.CategoryName, opt.StepName));
                    }
                    $(".yc").css("width", "100%");
                    $(".yc").select2();

                    for (var j = 0; j < r.ProcessSteps.length; j++) {
                        processStep = r.ProcessSteps[j];
                        var selector = "#ufGXm" + (j + 1);
                        $(selector).val(processStep.ProcessStepId).trigger("change");
                    }
                }

                if (type != -1)
                    $("#updateFlowCardModel").modal("show");
                else
                    ufRecover = 0;
            });
    }
    checkDeviceProcessData(doSth);
}

function updateFlowCard() {
    var opType = 207;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var priority = $("#ufPriority").val().trim();
    var rawMaterialQuantity = $("#ufRawMaterialQuantity").val().trim();
    var sender = $("#ufSender").val().trim();
    var inboundNum = $("#ufInboundNum").val().trim();
    var remarks = $("#ufRemarks").val().trim();

    if (isStrEmptyOrUndefined(rawMaterialQuantity)) {
        showTip($("#ufRawMaterialQuantityTip"), "原料数量不能为空");
        return;
    }
    var afRq = parseInt(rawMaterialQuantity);
    if (afRq <= 0) {
        showTip($("#ufRawMaterialQuantityTip"), "原料数量必须大于0");
        return;
    }

    if (isStrEmptyOrUndefined(sender)) {
        showTip($("#ufSenderTip"), "发片人不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(inboundNum)) {
        showTip($("#ufInboundNumTip"), "入库号不能为空");
        return;
    }

    var ufGGdata = new Array();
    var i;
    var id;
    for (i = 1; i < ufGGmax; i++) {
        if ($("#ufGG" + i).length > 0) {
            var specificationName = $("#ufGGm" + i).val().trim();
            if (isStrEmptyOrUndefined(specificationName)) {
                layer.msg("规格名不能为空");
                return;
            }

            var specificationValue = $("#ufGGz" + i).val().trim();
            if (isStrEmptyOrUndefined(specificationValue)) {
                layer.msg("规格值不能为空");
                return;
            }
            id = $("#ufGG" + i).attr("value");
            ufGGdata.push({
                Id: id,
                SpecificationName: specificationName,
                SpecificationValue: specificationValue
            });
        }
    }
    if (ufGGdata.length <= 0) {
        layer.msg("请填写规格数据");
        return;
    }

    var ufGXdata = new Array();
    var l = 1;
    for (i = 1; i < ufGXmax; i++) {
        if ($("#ufGX" + i).length > 0) {
            var processStepId = $("#ufGXm" + i).val().trim();
            if (isStrEmptyOrUndefined(processStepId)) {
                layer.msg("工序名称不能为空");
                return;
            }

            var processStepRequirements = $("#ufGXz" + i).val().trim();
            var processStepRequirementMid = $("#ufGXh" + i).val().trim();

            if (isStrEmptyOrUndefined(processStepRequirementMid) || parseFloat(processStepRequirementMid) <= 0) {
                layer.msg("合格值必须大于0");
                return;
            }

            id = $("#ufGX" + i).attr("value");
            ufGXdata.push({
                Id: id,
                ProcessStepOrder: l++,
                ProcessStepId: processStepId,
                ProcessStepRequirements: processStepRequirements,
                ProcessStepRequirementMid: processStepRequirementMid
            });
        }
    }
    if (ufGXdata.length <= 0) {
        layer.msg("请填写工序");
        return;
    }

    var postData = {
        id: parseInt($("#updateFCId").html()),
        RawMaterialQuantity: afRq,
        Sender: sender,
        InboundNum: inboundNum,
        Remarks: remarks,
        Priority: priority,
        Specifications: ufGGdata,
        ProcessSteps: ufGXdata
    };

    var doSth = function () {
        $("#updateFlowCardModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(postData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFlowCardList();
                }
            });
    }
    showConfirm("修改", doSth);
}

function ufResetGG() {
    $("#ufGGBody").empty();
    var tr = ('<tr id="ufGG{0}">' +
        '<td><label class="control-label" id="ufGGx{0}">{0}</label></td>' +
        '<td><input class="form-control" id="ufGGm{0}" maxlength="20"></td>' +
        '<td><input class="form-control" id="ufGGz{0}" maxlength="20"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="ufGGDelSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(1);
    $("#ufGGBody").append(tr);
    ufGGmax = ufGGmaxV = 2;
}

function ufAddOtherGG() {
    //ufGGBody
    var tr = ('<tr id="ufGG{0}" value="0">' +
        '<td><label class="control-label" id="ufGGx{0}">{1}</label></td>' +
        '<td><input class="form-control" id="ufGGm{0}" maxlength="20"></td>' +
        '<td><input class="form-control" id="ufGGz{0}" maxlength="20"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="ufGGDelSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(ufGGmax, ufGGmaxV);
    $("#ufGGBody").append(tr);
    ufGGmax++;
    ufGGmaxV++;
}

function ufGGDelSelf(id) {
    $("#ufGGBody").find("[id=ufGG" + id + "]").remove();
    ufGGmaxV--;
    var o = 1;
    var childs = $("#ufGGBody").find("label");
    for (var i = 0; i < childs.length; i++) {
        childs[i].textContent = o;
        o++;
    }
}

function ufResetGX() {
    ufGXmax = ufGXmaxV = 1;
    $("#ufGXBody").empty();
    var tr = ('<tr id="ufGX{0}" value="0">' +
        '<td><label class="control-label" id="ufGXx{0}">{0}</label></td>' +
        '<td><select class="ms2 form-control" id="ufGXm{0}"></select> ' +
        '<td><input class="form-control" id="ufGXz{0}" onblur="autoCal(this, \'ufGXh{0}\')" maxlength="100"></td>' +
        '<td><input class="form-control text-center" id="ufGXh{0}" onkeyup="onInput(this)" onblur="onInputEnd(this)" maxlength="10"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="ufGXDelSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(ufGXmax);
    $("#ufGXBody").append(tr);
    if (DeviceProcessData != null) {
        var selector = "#ufGXm" + ufGXmax;
        $(selector).empty();
        var option = '<option value="{0}">{1}-{2}</option>';
        for (var i = 0; i < DeviceProcessData.length; i++) {
            var opt = DeviceProcessData[i];
            $(selector).append(option.format(opt.Id, opt.CategoryName, opt.StepName));
        }
        $(selector).css("width", "100%");
        $(selector).select2();
    }

    //if (lastType == 0) {
    //    $(".dd").removeClass("hidden");
    //} else {
    //    $(".dd").addClass("hidden");
    //}
    ufGXmax = ufGXmaxV = 2;
}

function ufAddOtherGX() {
    //ufGXBody
    var tr = ('<tr id="ufGX{0}" value="0">' +
        '<td><label class="control-label" id="ufGXx{0}">{1}</label></td>' +
        '<td><select class="ms2 form-control" id="ufGXm{0}"></select> ' +
        '<td><input class="form-control" id="ufGXz{0}" onblur="autoCal(this, \'ufGXh{0}\')" maxlength="100"></td>' +
        '<td><input class="form-control text-center" id="ufGXh{0}" onkeyup="onInput(this)" onblur="onInputEnd(this)" maxlength="10"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="ufGXDelSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(ufGXmax, ufGXmaxV);
    $("#ufGXBody").append(tr);
    if (DeviceProcessData != null) {
        var selector = "#ufGXm" + ufGXmax;
        $(selector).empty();
        var option = '<option value="{0}">{1}-{2}</option>';
        for (var i = 0; i < DeviceProcessData.length; i++) {
            var opt = DeviceProcessData[i];
            $(selector).append(option.format(opt.Id, opt.CategoryName, opt.StepName));
        }
        $(selector).css("width", "100%");
        $(selector).select2();
    }

    ufGXmax++;
    ufGXmaxV++;


}

function ufGXDelSelf(id) {
    $("#ufGXBody").find("[id=ufGX" + id + "]").remove();
    ufGXmaxV--;
    var o = 1;
    var childs = $("#ufGXBody").find("label");
    for (var i = 0; i < childs.length; i++) {
        childs[i].textContent = o;
        o++;
    }
}

var cfRecover = 0;
var gxLength = 1;
function showChangeFlowCard(type) {
    $("#cfGXBody").empty();
    gxLength = 1;
    var opType = 202;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    if (type == -1 && cfRecover == 1)
        return;
    if (type == -1)
        cfRecover = 1;
    var id = type == -1 ? $("#changeFCId").html() : type;
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        Id: id
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };

            $("#changeFCId").html(id);
            var option = '<option value="{0}">{1}</option>';
            var o = 0;

            var processStepName = function (data, type, row) {
                return data.CategoryName + "-" + data.StepName;
            }
            var order = function (data, type, row) {
                o = data.ProcessStepOrder;
                return '<span oValue="{1}" id="c1f{0}">{0}</span>'.format(o, data.Id);
            }
            //加工人
            var seProcessor = option.format(0, "无");
            var i;
            for (i = 0; i < ret.processors.length; i++) {
                var processor = ret.processors[i];
                seProcessor += option.format(processor.Id, processor.ProcessorName);
            }
            var processorId = function (data, type, row) {
                return '<select class="can1 ms2 form-control" id="c2f{0}" oValue="{2}">{1}</select>'.format(o, seProcessor, data.ProcessorId);
            }
            //加工时间
            var processTime = function (data, type, row) {
                var html =
                    '<input type="text" id="c31f{0}" class="can1 form_date form-control {4}" value="{2}" style="width:90px">' +
                    '<input type="text" id="c32f{0}" class="can1 form_time form-control {4}" value="{3}" style="width:75px">' +
                    '<input type="text" id="c3f{0}" value="{1}" oValue="{1}" class="hidden">';
                if (data.ProcessTime == '0001-01-01 00:00:00' || data.ProcessTime == null) {
                    data.ProcessTime = '';
                    return html.format(o, data.ProcessTime, "", "", "hidden");
                }
                var t = data.ProcessTime.split(' ');
                return html.format(o, data.ProcessTime, t[0], t[1], "");
            }
            //检验人
            var seSurveyor = option.format(0, "无");
            for (i = 0; i < ret.surveyors.length; i++) {
                var surveyor = ret.surveyors[i];
                seSurveyor += option.format(surveyor.Id, surveyor.SurveyorName);
            }
            var surveyorId = function (data, type, row) {
                return '<select class="can2 ms2 form-control" id="c4f{0}" oValue="{2}">{1}</select>'.format(o, seSurveyor, data.SurveyorId);
            }
            //检验时间
            var surveyTime = function (data, type, row) {
                var html =
                    '<input type="text" id="c51f{0}" class="can2 form_date form-control {4}" value="{2}" style="width:90px">' +
                    '<input type="text" id="c52f{0}" class="can2 form_time form-control {4}" value="{3}" style="width:75px">' +
                    '<input type="text" id="c5f{0}" value="{1}" oValue="{1}" class="hidden">';
                if (data.SurveyTime == '0001-01-01 00:00:00' || data.SurveyTime == null) {
                    data.SurveyTime = '';
                    return html.format(o, data.SurveyTime, "", "", "hidden");
                }
                var t = data.SurveyTime.split(' ');
                return html.format(o, data.SurveyTime, t[0], t[1], "");

            }
            //合格数
            var qualifiedNumber = function (data, type, row) {
                return '<input class="can1 can2 form-control" id="c6f{0}" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9">'.format(o, data.QualifiedNumber);
            }
            //不合格数
            var unqualifiedNumber = function (data, type, row) {
                return '<input class="can1 can2 form-control" id="c7f{0}" style="width:100%" value="{1}" oValue="{1}" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9">'.format(o, data.UnqualifiedNumber);
            }
            //机台号
            var seDeviceId = option.format(0, "无");
            for (i = 0; i < ret.deviceIds.length; i++) {
                var device = ret.deviceIds[i];
                seDeviceId += option.format(device.Id, device.Code);
            }
            var deviceId = function (data, type, row) {
                return '<select class="can1 ms2 form-control" id="c8f{0}" oValue="{2}">{1}</select>'.format(o, seDeviceId, data.DeviceId);
            }
            //成厚范围
            var qualifiedRange = function (data, type, row) {
                return '<input class="can1 can2 form-control" id="c9f{0}" style="width:100%" value="{1}" oValue="{1}" onblur="autoCal(this, \'c10f{0}\')" maxlength="20">'.format(o, data.QualifiedRange);
            }
            //成厚均值
            var qualifiedMode = function (data, type, row) {
                return '<input class="can1 can2 form-control" id="c10f{0}" style="width:100%" value="{1}" oValue="{1}" onkeyup="onInput(this)" onblur="onInputEnd(this)" maxlength="10">'.format(o, data.QualifiedMode);
            }
            //操作
            var op = function (data, type, row) {
                if (!data.IsSurvey)
                    return '<button class="btn btn-success edit1-btn" type="button" id="c11f{0}">加工</button>'.format(o);
                return '<button class="btn btn-info edit2-btn" type="button" id="c11f{0}">检验</button>'.format(o);
            }
            function processStepOrder(a, b) {
                return a.ProcessStepOrder > b.ProcessStepOrder ? 1 : -1;
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
                    "data": ret.processSteps.sort(processStepOrder),
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
                        { "data": null, "title": "成厚范围(<span class=\"text-info\">例:0.2～0.3mm</span>)", "render": qualifiedRange },
                        { "data": null, "title": "成厚均值(<span class=\"text-info\">例:0.25</span>)", "render": qualifiedMode },
                        { "data": null, "title": "操作", "render": op },
                    ],
                    "drawCallback": function (settings, json) {
                        $(".ms2").select2();
                        $(".can1").attr("disabled", "disabled");
                        $(".can2").attr("disabled", "disabled");
                        $("#gxList th").css("padding-right", "8px");
                        for (var j = 0; j < ret.processSteps.length; j++) {
                            var index = j + 1;
                            var uiEle = $("#c2f" + index);
                            var ov = uiEle.attr("ovalue");
                            uiEle.val(ov).trigger("change");

                            uiEle = $("#c4f" + index);
                            ov = uiEle.attr("ovalue");
                            uiEle.val(ov).trigger("change");

                            uiEle = $("#c8f" + index);
                            ov = uiEle.attr("ovalue");
                            uiEle.val(ov).trigger("change");
                        }

                        $("#gxList tbody").on("click", ".edit1-btn", function () {
                            var tds = $(this).parents("tr").children().find(".can1");
                            var index = $($(this).parents("tr").children()[0]).text();
                            var keyDate = $("#c31f" + index);
                            var keyTime = $("#c32f" + index);
                            var keyOri = $("#c3f" + index);
                            keyDate.removeClass("hidden");
                            keyTime.removeClass("hidden");
                            var ov = keyOri.attr("ovalue")
                            var t;
                            if (isStrEmptyOrUndefined(ov)) {
                                keyDate.val(getDate()).datepicker('update');
                                keyTime.val(getTime());
                            } else {
                                t = ov.split(' ');
                                keyDate.val(t[0]);
                                keyTime.val(t[1]);
                            }

                            tds.removeAttr("disabled");
                            tds.css("background-color", "white");
                            $(this).html("取消");
                            $(this).removeClass("edit1-btn");
                            $(this).addClass("cancel1-btn");
                            $(this).removeClass("btn-success");
                            $(this).addClass("btn-danger");
                        });

                        $("#gxList tbody").on("click", ".edit2-btn", function () {
                            var tds = $(this).parents("tr").children().find(".can2");
                            var index = $($(this).parents("tr").children()[0]).text();
                            var keyDate = $("#c51f" + index);
                            var keyTime = $("#c52f" + index);
                            var keyOri = $("#c5f" + index);
                            keyDate.removeClass("hidden");
                            keyTime.removeClass("hidden");
                            var ov = keyOri.attr("ovalue")
                            if (isStrEmptyOrUndefined(ov)) {
                                keyDate.val(getDate()).datepicker('update');
                                keyTime.val(getTime());
                            } else {
                                var t = ov.split(' ');
                                keyDate.val(t[0]);
                                keyTime.val(t[1]);
                            }

                            tds.removeAttr("disabled");
                            tds.css("background-color", "white");
                            $(this).html("取消");
                            $(this).removeClass("edit2-btn");
                            $(this).addClass("cancel2-btn");
                            $(this).removeClass("btn-info");
                            $(this).addClass("btn-danger");
                        });

                        $("#gxList tbody").on("click", ".cancel1-btn", function () {
                            var tds = $(this).parents("tr").children().find(".can1");
                            tds.attr("disabled", "disabled");
                            var inputs = tds.filter("input");
                            $.each(inputs, function (i, val) {
                                var ovalue = $(val).attr("ovalue");
                                $(val).val(ovalue);
                            });
                            var selects = tds.filter("select");
                            $.each(selects, function (i, val) {
                                var ovalue = $(val).attr("ovalue");
                                $(val).val(ovalue).trigger("change");
                            });
                            var index = $($(this).parents("tr").children()[0]).text();
                            var keyDate = $("#c31f" + index);
                            var keyTime = $("#c32f" + index);
                            var keyOri = $("#c3f" + index);
                            var ov = keyOri.attr("ovalue")
                            var t;
                            if (isStrEmptyOrUndefined(ov)) {
                                keyDate.addClass("hidden");
                                keyTime.addClass("hidden");
                            } else {
                                t = ov.split(' ');
                                keyDate.val(t[0]);
                                keyTime.val(t[1]);
                            }

                            tds.css("background-color", "#eee");
                            $(this).html("加工");
                            $(this).removeClass("cancel1-btn");
                            $(this).addClass("edit1-btn");
                            $(this).removeClass("btn-danger");
                            $(this).addClass("btn-success");
                        });

                        $("#gxList tbody").on("click", ".cancel2-btn", function () {
                            var tds = $(this).parents("tr").children().find(".can2");
                            tds.attr("disabled", "disabled");
                            var inputs = tds.filter("input");
                            $.each(inputs, function (i, val) {
                                var ovalue = $(val).attr("ovalue");
                                $(val).val(ovalue);
                            });
                            var selects = tds.filter("select");
                            $.each(selects, function (i, val) {
                                var ovalue = $(val).attr("ovalue");
                                $(val).val(ovalue).trigger("change");
                            });
                            var index = $($(this).parents("tr").children()[0]).text();
                            var keyDate = $("#c51f" + index);
                            var keyTime = $("#c52f" + index);
                            var keyOri = $("#c5f" + index);
                            var ov = keyOri.attr("ovalue")
                            if (isStrEmptyOrUndefined(ov)) {
                                keyDate.addClass("hidden");
                                keyTime.addClass("hidden");
                            } else {
                                var t = ov.split(' ');
                                keyDate.val(t[0]);
                                keyTime.val(t[1]);
                            }

                            tds.css("background-color", "#eee");
                            $(this).html("检验");
                            $(this).removeClass("cancel2-btn");
                            $(this).addClass("edit2-btn");
                            $(this).removeClass("btn-danger");
                            $(this).addClass("btn-info");
                        });

                        initTime();
                    }
                });
            if (type != -1)
                $("#changeFlowCardModel").modal("show");
            else
                cfRecover = 0;
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

function changeFlowCard() {
    var opType = 208;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var flowCardId = parseInt($("#changeFCId").html());
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
        var qualifiedRange;
        var qualifiedMode;
        for (var j = 1; j <= 10; j++) {
            var key = $("#c{1}f{0}".format(i, j));
            var v = key.val();
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
                    key1 = $("#c{1}1f{0}".format(i, j));
                    key2 = $("#c{1}2f{0}".format(i, j));
                    v = key1.hasClass("hidden") ? v : '{0} {1}'.format($(key1).val(), $(key2).val());
                    processTime = isStrEmptyOrUndefined(v) ? null : v;
                    break;
                case 4:
                    //检验人
                    surveyorId = v;
                    break;
                case 5:
                    //检验时间
                    key1 = $("#c{1}1f{0}".format(i, j));
                    key2 = $("#c{1}2f{0}".format(i, j));
                    v = key1.hasClass("hidden") ? v : '{0} {1}'.format($(key1).val(), $(key2).val());
                    surveyTime = isStrEmptyOrUndefined(v) ? null : v;
                    break;
                case 6:
                    //合格数
                    qualifiedNumber = v;
                    break;
                case 7:
                    //不合格数
                    unqualifiedNumber = v;
                    break;
                case 8:
                    //机台号
                    deviceId = v;
                    break;
                case 9:
                    //成厚范围
                    qualifiedRange = v;
                    break;
                case 10:
                    //成厚均值
                    qualifiedMode = v;
                    if (($("#c11f{0}".format(i)).hasClass("cancel1-btn") || $("#c11f{0}".format(i)).hasClass("cancel2-btn"))
                        && (isStrEmptyOrUndefined(qualifiedMode) || parseFloat(qualifiedMode) <= 0)) {
                        layer.msg("成厚均值必须大于0");
                        return;
                    }

                    break;
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
    if ($("#gxList").find(".cancel1-btn").length <= 0 && $("#gxList").find(".cancel2-btn").length <= 0)
        return;
    return;
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(postData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    showChangeFlowCard(-1);
                }
            });
    }
    showConfirm("修改", doSth);
}

//计划号
function getProductionProcessList(first = false) {
    if (first && fProductionProcessList)
        return;
    if (first)
        fProductionProcessList = true;
    var opType = 215;
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

            var op = function (data, type, row) {
                var html = "{0}{1}";
                var changeBtn = '<button type="button" class="btn btn-primary" onclick="showProductionProcessModel({0})">详情</button>'.format(data.Id);
                var delBtn = '<button type="button" class="btn btn-danger" onclick="deleteProductionProcess({0}, \'{1}\')">删除</button>'.format(data.Id, escape(data.ProductionProcessName));

                html = html.format(
                    checkPermission(218) ? changeBtn : "",
                    checkPermission(221) ? delBtn : "");
                return html;
            }
            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var columns = checkPermission(218) || checkPermission(221)
                ? [
                    { "data": null, "title": "操作", "render": op },
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "MarkedDateTime", "title": "修改时间" },
                    { "data": "ProductionProcessName", "title": "计划号" },
                    { "data": "FlowCardCount", "title": "总流程卡数", "sClass": "text-info" },
                    { "data": "AllRawMaterialQuantity", "title": "总原料数", "sClass": "text-info" },
                    { "data": "Complete", "title": "已完成流程卡数", "sClass": "text-success" },
                    { "data": "RawMaterialQuantity", "title": "已完成原料数", "sClass": "text-success" },
                    { "data": "QualifiedNumber", "title": "总产量", "sClass": "text-warning" },
                    { "data": "PassRate", "title": "总合格率", "sClass": "text-warning" }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "MarkedDateTime", "title": "修改时间" },
                    { "data": "ProductionProcessName", "title": "计划号" },
                    { "data": "FlowCardCount", "title": "总流程卡数", "sClass": "text-info" },
                    { "data": "AllRawMaterialQuantity", "title": "总原料数", "sClass": "text-info" },
                    { "data": "Complete", "title": "已完成流程卡数", "sClass": "text-success" },
                    { "data": "RawMaterialQuantity", "title": "已完成原料数", "sClass": "text-success" },
                    { "data": "QualifiedNumber", "title": "总产量", "sClass": "text-warning" },
                    { "data": "PassRate", "title": "总合格率", "sClass": "text-warning" },
                ];
            var aaSorting = checkPermission(218) || checkPermission(221) ? [[1, "asc"]] : [[0, "asc"]];
            var defs = checkPermission(218) || checkPermission(221)
                ? [
                    { "orderable": false, "targets": 0 }
                ]
                : "";
            $("#productionProcessList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "autoWidth": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aaSorting": aaSorting,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": columns,
                    "columnDefs": defs
                });
        });
}

function deleteProductionProcess(id, name) {
    name = unescape(name);
    var opType = 221;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getProductionProcessList();
                }
            });
    }
    showConfirm("删除计划号：" + name, doSth);
}

function showProductionProcess(id) {
    hideClassTip("adt");
    var opType = 216;
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
            };

            $("#addSiteName").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#addSiteName").append(option.format(data.Id, data.SiteName, data.RegionDescription, data.Manager));
            }
            $("#updateId").html(id);
            $("#updateSiteName").val(adSiteNames);
            $("#updateRegions").val(locationsReg);
            $("#updateManager").val(manergerMan);
            $("#updateSite").modal("show");
        });
}

var DeviceProcessData = null;
var recover = 0;
function showProductionProcessModel(type) {
    var doSth = function () {
        hideClassTip("adt");
        $(".pp").addClass("hidden");
        if (type != 0) {

            $("#uppBtn").removeClass("hidden");
            $("#ppReBtn").removeClass("hidden");
            $("#apGGBody").empty();
            $("#apGXBody").empty();
            apGGmax = apGGmaxV = apGXmax = apGXmaxV = 1;

            var opType = 216;
            if (!checkPermission(opType)) {
                layer.msg("没有权限");
                return;
            }
            if (type == -1 && recover == 1)
                return;
            if (type == -1)
                recover = 1;
            var data = {}
            data.opType = opType;
            var id = type == -1 ? $("#updateppId").html() : type;
            data.opData = JSON.stringify({
                id: id
            });
            ajaxPost("/Relay/Post", data,
                function (ret) {
                    if (ret.errno != 0) {
                        layer.msg(ret.errmsg);
                        return;
                    }
                    var r = ret.datas[0];
                    $("#updateppId").html(id);
                    $("#productionProcessName").val(r.ProductionProcessName);
                    for (var j = 0; j < r.Specifications.length; j++) {
                        var productionProcessSpecification = r.Specifications[j];
                        var tr = ('<tr id="apGG{0}" value="{2}">' +
                            '<td><label class="control-label" id="apGGx{0}">{1}</label></td>' +
                            '<td><input class="form-control" value="{3}" id="apGGm{0}" maxlength="20"></td>' +
                            '<td><input class="form-control" value="{4}" id="apGGz{0}" maxlength="20"></td>' +
                            '<td><button type="button" class="btn btn-default btn-sm" onclick="apGGDelSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
                            '</tr>').format(apGGmax, apGGmaxV, productionProcessSpecification.Id, productionProcessSpecification.SpecificationName, productionProcessSpecification.SpecificationValue);
                        $("#apGGBody").append(tr);
                        apGGmax++;
                        apGGmaxV++;
                    }
                    var processStep;
                    for (var j = 0; j < r.ProcessSteps.length; j++) {
                        processStep = r.ProcessSteps[j];
                        var tr = ('<tr id="apGX{0}" value="{2}">' +
                            '<td><label class="control-label" id="apGXx{0}">{1}</label></td>' +
                            '<td><select class="ms2 yc form-control" id="apGXm{0}"></td>' +
                            '<td><input class="form-control" value="{3}" id="apGXz{0}" onblur="autoCal(this, \'apGXh{0}\')" maxlength="100"></td>' +
                            '<td><input class="form-control text-center" value="{4}" id="apGXh{0}" onkeyup="onInput(this)" onblur="onInputEnd(this)" maxlength="10"></td>' +
                            '<td><button type="button" class="btn btn-default btn-sm" onclick="apGXDelSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
                            '</tr>').format(apGXmax, apGXmaxV, processStep.Id, processStep.ProcessStepRequirements, processStep.ProcessStepRequirementMid);
                        $("#apGXBody").append(tr);
                        apGXmax++;
                        apGXmaxV++;
                    }

                    if (DeviceProcessData != null) {
                        $(".yc").empty();
                        var option = '<option value="{0}">{1}-{2}</option>';
                        for (var i = 0; i < DeviceProcessData.length; i++) {
                            var opt = DeviceProcessData[i];
                            $(".yc").append(option.format(opt.Id, opt.CategoryName, opt.StepName));
                        }
                        $(".yc").css("width", "100%");
                        $(".yc").select2();

                        for (var j = 0; j < r.ProcessSteps.length; j++) {
                            processStep = r.ProcessSteps[j];
                            var selector = "#apGXm" + (j + 1);
                            $(selector).val(processStep.ProcessStepId).trigger("change");
                        }
                    }

                    $(".dd").addClass("hidden");

                    if (type != -1)
                        $("#productionProcessModel").modal("show");
                    else
                        recover = 0;
                });
        } else {
            $("#appBtn").removeClass("hidden");
            $("#productionProcessName").val("");
            addResetGG();
            addResetGX();
            if (lastType != type) {
                $("#productionProcessName").val("");
                $("#appBtn").removeClass("hidden");
                addResetGG();
                addResetGX();
                $(".dd").removeClass("hidden");
            }
            $("#productionProcessModel").modal("show");
        }
        lastType = type;
    }
    checkDeviceProcessData(doSth);
}

function checkDeviceProcessData(func) {
    if (DeviceProcessData == null) {
        var opType = 150;
        if (!checkPermission(opType)) {
            layer.msg("没有权限");
            return;
        }
        ajaxPost("/Relay/Post",
            {
                opType: opType
            },
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }
                DeviceProcessData = ret.datas;
                func();
            });
    } else
        func();
}

var lastType = -2;
function addResetGG() {
    $("#apGGBody").empty();
    var tr = ('<tr id="apGG{0}">' +
        '<td><label class="control-label" id="apGGx{0}">{0}</label></td>' +
        '<td><input class="form-control" id="apGGm{0}" maxlength="20"></td>' +
        '<td><input class="form-control" id="apGGz{0}" maxlength="20"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="apGGDelSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(1);
    $("#apGGBody").append(tr);
    if (lastType == 0) {
        $(".dd").removeClass("hidden");
    } else {
        $(".dd").addClass("hidden");
    }
    apGGmax = apGGmaxV = 2;
}

var apGGmax = 2;
var apGGmaxV = 2;
function addOtherGG() {
    //apGGBody
    var tr = ('<tr id="apGG{0}" value="0">' +
        '<td><label class="control-label" id="apGGx{0}">{1}</label></td>' +
        '<td><input class="form-control" id="apGGm{0}" maxlength="20"></td>' +
        '<td><input class="form-control" id="apGGz{0}" maxlength="20"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="apGGDelSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(apGGmax, apGGmaxV);
    $("#apGGBody").append(tr);
    apGGmax++;
    apGGmaxV++;
}

function apGGDelSelf(id) {
    $("#apGGBody").find("[id=apGG" + id + "]").remove();
    apGGmaxV--;
    var o = 1;
    var childs = $("#apGGBody").find("label");
    for (var i = 0; i < childs.length; i++) {
        childs[i].textContent = o;
        o++;
    }
}

function addResetGX() {
    apGXmax = apGXmaxV = 1;
    $("#apGXBody").empty();
    var tr = ('<tr id="apGX{0}" value="0">' +
        '<td><label class="control-label" id="apGXx{0}">{0}</label></td>' +
        '<td><select class="ms2 form-control" id="apGXm{0}"></select> ' +
        '<td><input class="form-control" id="apGXz{0}" onblur="autoCal(this, \'apGXh{0}\')" maxlength="100"></td>' +
        '<td><input class="form-control text-center" id="apGXh{0}" onkeyup="onInput(this)" onblur="onInputEnd(this)" maxlength="10"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="apGXDelSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(apGXmax);
    $("#apGXBody").append(tr);
    if (DeviceProcessData != null) {
        var selector = "#apGXm" + apGXmax;
        $(selector).empty();
        var option = '<option value="{0}">{1}-{2}</option>';
        for (var i = 0; i < DeviceProcessData.length; i++) {
            var opt = DeviceProcessData[i];
            $(selector).append(option.format(opt.Id, opt.CategoryName, opt.StepName));
        }
        $(selector).css("width", "100%");
        $(selector).select2();
    }
    if (lastType == 0) {
        $(".dd").removeClass("hidden");
    } else {
        $(".dd").addClass("hidden");
    }
    apGXmax++;
    apGXmaxV++;
}

var apGXmax = 2;
var apGXmaxV = 2;
function addOtherGX() {
    //apGXBody
    var tr = ('<tr id="apGX{0}" value="0">' +
        '<td><label class="control-label" id="apGXx{0}">{1}</label></td>' +
        '<td><select class="ms2 form-control" id="apGXm{0}"></select> ' +
        '<td><input class="form-control" id="apGXz{0}" onblur="autoCal(this, \'apGXh{0}\')" maxlength="100"></td>' +
        '<td><input class="form-control text-center" id="apGXh{0}" onkeyup="onInput(this)" onblur="onInputEnd(this)" maxlength="10"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="apGXDelSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(apGXmax, apGXmaxV);
    $("#apGXBody").append(tr);
    if (DeviceProcessData != null) {
        var selector = "#apGXm" + apGXmax;
        $(selector).empty();
        var option = '<option value="{0}">{1}-{2}</option>';
        for (var i = 0; i < DeviceProcessData.length; i++) {
            var opt = DeviceProcessData[i];
            $(selector).append(option.format(opt.Id, opt.CategoryName, opt.StepName));
        }
        $(selector).css("width", "100%");
        $(selector).select2();
    }
    apGXmax++;
    apGXmaxV++;
}

function apGXDelSelf(id) {
    $("#apGXBody").find("[id=apGX" + id + "]").remove();
    apGXmaxV--;
    var o = 1;
    var childs = $("#apGXBody").find("label");
    for (var i = 0; i < childs.length; i++) {
        childs[i].textContent = o;
        o++;
    }
}

function addProductionProcess() {
    var opType = 220;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var productionProcessName = $("#productionProcessName").val().trim();
    if (isStrEmptyOrUndefined(productionProcessName)) {
        showTip($("#productionProcessNameTip"), "计划号不能为空");
        return;
    }
    var apGGdata = new Array();
    var i;
    for (i = 1; i < apGGmax; i++) {
        if ($("#apGG" + i).length > 0) {
            var specificationName = $("#apGGm" + i).val().trim();
            if (isStrEmptyOrUndefined(specificationName)) {
                layer.msg("规格名不能为空");
                return;
            }

            var specificationValue = $("#apGGz" + i).val().trim();
            if (isStrEmptyOrUndefined(specificationValue)) {
                layer.msg("规格值不能为空");
                return;
            }
            apGGdata.push({
                SpecificationName: specificationName,
                SpecificationValue: specificationValue
            });
        }
    }
    if (apGGdata.length <= 0) {
        layer.msg("请填写规格数据");
        return;
    }

    var apGXdata = new Array();
    var l = 1;
    for (i = 1; i < apGXmax; i++) {
        if ($("#apGX" + i).length > 0) {
            var processStepId = $("#apGXm" + i).val().trim();
            if (isStrEmptyOrUndefined(processStepId)) {
                layer.msg("工序名称不能为空");
                return;
            }

            var processStepRequirements = $("#apGXz" + i).val().trim();
            var processStepRequirementMid = $("#apGXh" + i).val().trim();

            if (isStrEmptyOrUndefined(processStepRequirementMid) || parseFloat(processStepRequirementMid) <= 0) {
                layer.msg("合格值必须大于0");
                return;
            }

            apGXdata.push({
                ProcessStepOrder: l++,
                ProcessStepId: processStepId,
                ProcessStepRequirements: processStepRequirements,
                ProcessStepRequirementMid: processStepRequirementMid
            });
        }
    }
    if (apGXdata.length <= 0) {
        layer.msg("请填写工序");
        return;
    }

    var postData = {
        ProductionProcessName: productionProcessName,
        Specifications: apGGdata,
        ProcessSteps: apGXdata
    };

    var doSth = function () {
        $("#productionProcessModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(postData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getProductionProcessList();
                }
            });
    }
    showConfirm("添加", doSth);
}

function updateProductionProcess() {
    var opType = 218;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var productionProcessName = $("#productionProcessName").val().trim();
    if (isStrEmptyOrUndefined(productionProcessName)) {
        showTip($("#productionProcessNameTip"), "计划号不能为空");
        return;
    }
    var apGGdata = new Array();
    var i;
    var id;
    for (i = 1; i < apGGmax; i++) {
        if ($("#apGG" + i).length > 0) {
            var specificationName = $("#apGGm" + i).val().trim();
            if (isStrEmptyOrUndefined(specificationName)) {
                layer.msg("规格名不能为空");
                return;
            }

            var specificationValue = $("#apGGz" + i).val().trim();
            if (isStrEmptyOrUndefined(specificationValue)) {
                layer.msg("规格值不能为空");
                return;
            }
            id = $("#apGG" + i).attr("value");
            apGGdata.push({
                Id: id,
                SpecificationName: specificationName,
                SpecificationValue: specificationValue
            });
        }
    }
    if (apGGdata.length <= 0) {
        layer.msg("请填写规格数据");
        return;
    }

    var apGXdata = new Array();
    var l = 1;
    for (i = 1; i < apGXmax; i++) {
        if ($("#apGX" + i).length > 0) {
            var processStepId = $("#apGXm" + i).val().trim();
            if (isStrEmptyOrUndefined(processStepId)) {
                layer.msg("工序名称不能为空");
                return;
            }

            var processStepRequirements = $("#apGXz" + i).val().trim();
            var processStepRequirementMid = $("#apGXh" + i).val().trim();

            if (isStrEmptyOrUndefined(processStepRequirementMid) || parseFloat(processStepRequirementMid) <= 0) {
                layer.msg("合格值必须大于0");
                return;
            }

            id = $("#apGX" + i).attr("value");
            apGXdata.push({
                Id: id,
                ProcessStepOrder: l++,
                ProcessStepId: processStepId,
                ProcessStepRequirements: processStepRequirements,
                ProcessStepRequirementMid: processStepRequirementMid
            });
        }
    }
    if (apGXdata.length <= 0) {
        layer.msg("请填写工序");
        return;
    }

    var postData = {
        id: parseInt($("#updateppId").html()),
        ProductionProcessName: productionProcessName,
        Specifications: apGGdata,
        ProcessSteps: apGXdata
    };

    var doSth = function () {
        $("#productionProcessModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(postData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getProductionProcessList();
                }
            });
    }
    showConfirm("修改", doSth);
}

//原料
function getRawMateriaList(first = false) {
    if (first && fRawMateriaList)
        return;
    if (first)
        fRawMateriaList = true;
    var opType = 232;
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

            var op = function (data, type, row) {
                var html = "{0}{1}";
                var changeBtn = '<button type="button" class="btn btn-primary" onclick="showUpdateRawMateriaModel({0})">详情</button>'.format(data.Id);
                var delBtn = '<button type="button" class="btn btn-danger" onclick="deleteRawMateria({0}, \'{1}\')">删除</button>'.format(data.Id, escape(data.RawMateriaName));

                html = html.format(
                    checkPermission(235) ? changeBtn : "",
                    checkPermission(239) ? delBtn : "");
                return html;
            }
            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var columns = checkPermission(235) || checkPermission(239)
                ? [
                    { "data": null, "title": "操作", "render": op },
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "MarkedDateTime", "title": "修改时间" },
                    { "data": "RawMateriaName", "title": "原料批号" }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "MarkedDateTime", "title": "修改时间" },
                    { "data": "RawMateriaName", "title": "原料批号" },
                ];
            var aaSorting = checkPermission(235) || checkPermission(239) ? [[1, "asc"]] : [[0, "asc"]];
            var defs = checkPermission(235) || checkPermission(239)
                ? [
                    { "orderable": false, "targets": 0 }
                ]
                : "";
            $("#rawMateriaList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "autoWidth": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aaSorting": aaSorting,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": columns,
                    "columnDefs": defs
                });
        });
}

function deleteRawMateria(id, name) {
    name = unescape(name);
    var opType = 239;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getRawMateriaList();
                }
            });
    }
    showConfirm("删除原料：" + name, doSth);
}

var uMax = 1;
var uMaxV = 1;
var rec = 0;
function showUpdateRawMateriaModel(id, type = 0) {
    $("#urRawMateriaName").val("");
    $("#urBody").empty();
    uMax = uMaxV = 1;
    var opType = 233;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        id: id
    });
    if (type == 1 && rec == 1)
        return;
    if (type == 1)
        rec = 1;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };

            var r = ret.datas[0];
            $("#updateId").html(id);
            $("#urRawMateriaName").val(r.RawMateriaName);
            for (var j = 0; j < r.RawMateriaSpecifications.length; j++) {
                var rawMateriaSpecification = r.RawMateriaSpecifications[j];
                var tr = ('<tr id="ur{0}" value="{2}">' +
                    '<td><label class="control-label" id="urx{0}">{1}</label></td>' +
                    '<td><input class="form-control" value="{3}" id="urm{0}" maxlength="20"></td>' +
                    '<td><input class="form-control" value="{4}" id="urz{0}" maxlength="20"></td>' +
                    '<td><button type="button" class="btn btn-default btn-sm" onclick="delSelf1({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
                    '</tr>').format(uMax, uMaxV, rawMateriaSpecification.Id, rawMateriaSpecification.SpecificationName, rawMateriaSpecification.SpecificationValue);
                $("#urBody").append(tr);
                uMax++;
                uMaxV++;
            }

            if (type == 0)
                $("#updateRawMateriaModel").modal("show");
            else
                rec = 0;
        });
}

function updateRawMateria() {
    var opType = 235;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var urRawMateriaName = $("#urRawMateriaName").val().trim();
    if (isStrEmptyOrUndefined(urRawMateriaName)) {
        showTip($("#urRawMateriaNameTip"), "原料批次不能为空");
        return;
    }
    var inputData = new Array();
    for (var i = 1; i < uMax; i++) {
        if ($("#ur" + i).length > 0) {
            var id = $("#ur" + i).attr("value");
            var specificationName = $("#urm" + i).val().trim();
            if (isStrEmptyOrUndefined(specificationName)) {
                layer.msg("规格名不能为空");
                return;
            }

            var specificationValue = $("#urz" + i).val().trim();
            if (isStrEmptyOrUndefined(specificationValue)) {
                layer.msg("规格值不能为空");
                return;
            }
            inputData.push({
                Id: id,
                SpecificationName: specificationName,
                SpecificationValue: specificationValue
            });
        }
    }
    if (inputData.length <= 0) {
        layer.msg("请填写规格数据");
        return;
    }
    var postData = {
        id: parseInt($("#updateId").html()),
        RawMateriaName: urRawMateriaName,
        RawMateriaSpecifications: inputData
    };
    var doSth = function () {
        $("#updateRawMateriaModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(postData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getRawMateriaList();
                }
            });
    }
    showConfirm("修改", doSth);
}

function recovery() {
    var id = parseInt($("#updateId").html());
    showUpdateRawMateriaModel(id, 1);
}

function addOther1() {
    //arBody
    var tr = ('<tr id="ur{0}" value="0">' +
        '<td><label class="control-label" id="urx{0}">{1}</label></td>' +
        '<td><input class="form-control" id="urm{0}" maxlength="20"></td>' +
        '<td><input class="form-control" id="urz{0}" maxlength="20"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="delSelf1({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(uMax, uMaxV);
    $("#urBody").append(tr);
    uMax++;
    uMaxV++;
}

function delSelf1(id) {
    $("#urBody").find("[id=ur" + id + "]").remove();
    uMaxV--;
    var o = 1;
    var childs = $("#urBody").find("label");
    for (var i = 0; i < childs.length; i++) {
        childs[i].textContent = o;
        o++;
    }
}

function reset1() {
    $("#urBody").empty();
    uMax = uMaxV = 1;
}

function showAddRawMateriaModel() {
    hideClassTip("adt");
    $("#arRawMateriaName").val("");
    reset();
    $("#addRawMateriaModel").modal("show");
}

function reset() {
    $("#arBody").empty();
    var tr = ('<tr id="ar{0}">' +
        '<td><label class="control-label" id="arx{0}">{0}</label></td>' +
        '<td><input class="form-control" id="arm{0}" maxlength="20"></td>' +
        '<td><input class="form-control" id="arz{0}" maxlength="20"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="delSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(1);
    $("#arBody").append(tr);
    max = maxV = 2;
}

var max = 2;
var maxV = 2;
function addOther() {
    //arBody
    var tr = ('<tr id="ar{0}">' +
        '<td><label class="control-label" id="arx{0}">{1}</label></td>' +
        '<td><input class="form-control" id="arm{0}" maxlength="20"></td>' +
        '<td><input class="form-control" id="arz{0}" maxlength="20"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="delSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(max, maxV);
    $("#arBody").append(tr);
    max++;
    maxV++;
}

function delSelf(id) {
    $("#arBody").find("[id=ar" + id + "]").remove();
    maxV--;
    var o = 1;
    var childs = $("#arBody").find("label");
    for (var i = 0; i < childs.length; i++) {
        childs[i].textContent = o;
        o++;
    }
}

function addRawMateria() {
    var opType = 237;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var arRawMateriaName = $("#arRawMateriaName").val().trim();
    if (isStrEmptyOrUndefined(arRawMateriaName)) {
        showTip($("#arRawMateriaNameTip"), "原料批次不能为空");
        return;
    }
    var inputData = new Array();
    for (var i = 1; i < max; i++) {
        if ($("#ar" + i).length > 0) {
            var specificationName = $("#arm" + i).val().trim();
            if (isStrEmptyOrUndefined(specificationName)) {
                layer.msg("规格名不能为空");
                return;
            }

            var specificationValue = $("#arz" + i).val().trim();
            if (isStrEmptyOrUndefined(specificationValue)) {
                layer.msg("规格值不能为空");
                return;
            }
            inputData.push({
                SpecificationName: specificationName,
                SpecificationValue: specificationValue
            });
        }
    }
    if (inputData.length <= 0) {
        layer.msg("请填写规格数据");
        return;
    }
    var postData = {
        RawMateriaName: arRawMateriaName,
        RawMateriaSpecifications: inputData,
    };

    var doSth = function () {
        $("#addRawMateriaModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(postData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getRawMateriaList();
                }
            });
    }
    showConfirm("添加", doSth);
}
