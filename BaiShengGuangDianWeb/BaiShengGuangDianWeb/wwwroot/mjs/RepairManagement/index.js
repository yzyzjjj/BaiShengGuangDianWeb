function pageReady() {

    $(".ms2").select2();
    $("#singleFaultType").select2();
    getFaultDeviceList();
    getRepairRecordList();
    getFaultType();


    $("#singleFaultType1").on("select2:select", function (e) {
        if ($("#singleFaultType1").val() != "1") {
            var desc = "";
            for (var i = 0; i < faultData.length; i++) {
                if (faultData[i].Id == $("#singleFaultType1").val()) {
                    desc = faultData[i].FaultDescription;
                    break;
                }
            }
            $("#singleFaultDesc").val(desc);
            $("#singleFaultDesc").attr("disabled", "disabled");

        } else {
            $("#singleFaultDesc").val("");

            $("#singleFaultDesc").removeAttr("disabled");
        }
    });
}
var faultData = null;
function getFaultType() {
    var data = {};
    data.opType = 406;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            faultData = ret.datas;
            $("#singleFaultType").empty();
            $("#singleFaultType1").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                if (i == 0)
                    fType = data.Id;
                $("#singleFaultType").append(option.format(data.Id, data.FaultTypeName));
                $("#singleFaultType1").append(option.format(data.Id, data.FaultTypeName));
            }
        });
}

var fType = 0;
function getFaultDeviceList() {
    var opType = 417;
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

            var priority = function (data, type, row) {
                var state = data.Priority;
                if (state == 2)
                    return '<span class="text-red"><span class="hidden">2</span>高</span>';
                if (state == 1)
                    return '<span class="text-warning"><span class="hidden">1</span>中</span>';
                return '<span class="text-success"><span class="hidden">0</span>低</span>';
            }
            var op = function (data, type, row) {
                var html = "{0}{1}{2}{3}";
                var changeBtn = '<button type="button" class="btn btn-primary" onclick="sChange({0}, 0)">修改</button>'.format(data.Id);
                var sureBtn = '<button type="button" class="btn btn-danger" onclick="sChange({0}, 1)">确认故障</button>'.format(data.Id);
                var repairingBtn = '<button type="button" class="btn btn-info" onclick="sChange({0}, 2)">开始维修</button>'.format(data.Id);
                var repairedBtn = '<button type="button" class="btn btn-success" onclick="sChange({0}, 3)">维修完成</button>'.format(data.Id);

                html = html.format(
                    checkPermission(420) ? changeBtn : "",
                    checkPermission(420) && data.State == 0 ? sureBtn : "",
                    checkPermission(420) && data.State == 1 ? repairingBtn : "",
                    checkPermission(420) && data.State == 2 ? repairedBtn : "");
                return html;
            }
            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var rState = function (data, type, row) {
                //状态 0 已报修 1 已确认 2 维修中
                var state = data.State;
                if (state == 0)
                    return '<span class="text-red"><span class="hidden">0</span>未确认</span>';
                if (state == 1)
                    return '<span class="text-warning"><span class="hidden">1</span>已确认</span>';
                return '<span class="text-success"><span class="hidden">2</span>维修中</span>';
            }
            $("#faultDeviceList")
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
                        { "data": "DeviceCode", "title": "机台号" },
                        { "data": "FaultTime", "title": "故障时间" },
                        { "data": null, "title": "状态", "render": rState },
                        { "data": null, "title": "优先级", "render": priority },
                        { "data": "Proposer", "title": "报修人" },
                        { "data": "FaultTypeName", "title": "故障类型" },
                        { "data": "FaultDescription", "title": "故障描述" },
                        { "data": null, "title": "操作", "render": op },
                    ]
                });


            $("#singleFaultCode").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#singleFaultCode").append(option.format(data.Id, data.DeviceCode));
            }
        });
}

function sChange(id, type) {
    hideClassTip('adt');
    $(".dd").attr("disabled", "disabled");
    $(".db").addClass("hidden");
    $("#solveDiv").addClass("hidden");
    $("#singleFaultType").val(fType).trigger("change");

    $("#rFaultCodeDiv").addClass("hidden");
    $("#singleFaultCode").removeClass("hidden");
    var opType = 418;
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
            var data;
            if (ret.datas.length > 0) {
                data = ret.datas[0];
                $("#singleUpdateId").html(id);
                $("#singleUpdateState").html(data.State);
                $("#singleFaultCode").val(data.DeviceCode);
                $("#singleProposer").val(data.Proposer);
                $("#singleFaultType1").val(data.FaultTypeId).trigger("change");
                var d = data.FaultTime.split(' ');
                $("#singleFaultDate").val(d[0]);
                var t = d[1].split(':');
                $("#singleFaultTime").val(d[1]);
                $("#singleFaultDesc").html(data.FaultDescription);
                $("#singleFaultPriority").val(data.Priority);
                if (type == 0) {
                    $("#singleFaultPriority").removeAttr("disabled");
                    $("#singleChange").removeClass("hidden");
                }
                //确认故障
                if (type == 1) {
                    $("#singleSure").removeClass("hidden");
                }
                //来说维修
                if (type == 2) {
                    $("#singleRepairing").removeClass("hidden");
                }
                //维修完成
                if (type == 3) {
                    $("#solveDiv").removeClass("hidden");
                    $("#singleRepaired").removeClass("hidden");
                    $("#singleFaultType").val(data.FaultTypeId).trigger("change");
                }
            }
            //维修完成
            if (type == 3) {
                $("#singleSolveDate").val(getDate());
                $("#singleSolveDate").datepicker('update');


                $("#singleSolveTime").val(getTime());
                var info = getCookieTokenInfo();
                $("#singleFaultSolver").val(info.name);
                $("#singleSolvePlan").val("");
            }
            $("#singleFaultModel").modal("show");
        });
}

function singleChange(type) {
    var id = parseInt($("#singleUpdateId").html());
    var state = parseInt($("#singleUpdateState").html());

    var code = $("#singleFaultCode").val();
    //机台号
    if (isStrEmptyOrUndefined(code)) {
        return;
    }

    var proposer = $("#singleProposer").val().trim();
    //报修人
    if (isStrEmptyOrUndefined(proposer)) {
        return;
    }
    var faultDate = $("#singleFaultDate").val();
    var faultTime = $("#singleFaultTime").val();
    var time = "{0} {1}".format(faultDate, faultTime);

    var faultDesc = $("#singleFaultDesc").val();
    var priority = $("#singleFaultPriority").val();


    var opType;
    var data;
    if (type < 3) {
        opType = 420;
        if (!checkPermission(opType)) {
            layer.msg("没有权限");
            return;
        }
        data = {};
        data.opType = opType;
        data.opData = JSON.stringify([
            {
                //(自增Id)
                id: id,
                //机台号
                DeviceCode: code,
                //故障时间
                FaultTime: time,
                //报修人
                Proposer: proposer,
                //故障描述
                FaultDescription: faultDesc,
                //优先级
                Priority: priority,
                //状态
                State: type == 0 ? state : type
            }
        ]);
        $("#singleFaultModel").modal("hide");
        ajaxPost("/Relay/Post",
            data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFaultDeviceList();
                }
            });
    } else {
        var singleFaultSolver = $("#singleFaultSolver").val();
        var singleSolvePlan = $("#singleSolvePlan").val();

        var singleSolveDate = $("#singleSolveDate").val();
        var singleSolveTime = $("#singleSolveTime").val();
        var solveTime = "{0} {1}".format(singleSolveDate, singleSolveTime);

        var singleFaultType = $("#singleFaultType").val();
        var singleFaultType1 = $("#singleFaultType1").val();

        if (compareDate(time, solveTime)) {
            layer.msg("解决时间不能小于故障时间");
            return;
        }
        //删除
        opType = 423;
        if (!checkPermission(opType)) {
            layer.msg("没有权限");
            return;
        }
        data = {};
        data.opType = opType;
        data.opData = JSON.stringify(
            {
                //(自增Id)
                id: id
            });
        $("#singleFaultModel").modal("hide");
        ajaxPost("/Relay/Post",
            data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFaultDeviceList();
                }
            });

        opType = 415;
        if (!checkPermission(opType)) {
            layer.msg("没有权限");
            return;
        }
        data = {};
        data.opType = opType;
        data.opData = JSON.stringify(
            {
                //机台号
                DeviceCode: code,
                //故障时间
                FaultTime: time,
                //报修人
                Proposer: proposer,
                //故障描述
                FaultDescription: faultDesc,
                //优先级
                Priority: priority,
                //故障解决者
                FaultSolver: singleFaultSolver,
                //故障解决时间
                SolveTime: solveTime,
                //故障解决方案
                SolvePlan: singleSolvePlan,
                //故障类型表Id
                FaultTypeId: singleFaultType,
                //故障类型表Id
                FaultTypeId1: singleFaultType1
            });
        ajaxPost("/Relay/Post",
            data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getRepairRecordList();
                }
            });
    }
}

function getRepairRecordList() {
    var opType = 412;
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

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var op = function (data, type, row) {
                var html = "{0}";
                var changeBtn = '<button type="button" class="btn btn-primary" onclick="rChange({0}, 0)">修改</button>'.format(data.Id);

                html = html.format(checkPermission(414) ? changeBtn : "");
                return html;
            }
            $("#repairRecordList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aaSorting": [[0, "desc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "Id", "title": "Id", "bVisible": false },
                        { "data": "DeviceCode", "title": "机台号" },
                        { "data": "FaultTime", "title": "故障时间" },
                        { "data": "Proposer", "title": "报修人" },
                        { "data": "FaultSolver", "title": "解决人员" },
                        { "data": "FaultDescription", "title": "故障描述" },
                        { "data": "SolveTime", "title": "解决时间" },
                        { "data": "FaultTypeName", "title": "故障类型" },
                        { "data": null, "title": "操作", "render": op },
                    ]
                });
        });
}

function rChange(id, type) {
    hideClassTip('adt');
    $(".db").addClass("hidden");
    $(".dd").attr("disabled", "disabled");
    $("#rFaultCodeDiv").addClass("hidden");
    $("#singleFaultType").val(fType).trigger("change");

    var opType;
    var data;
    if (type == 0) {
        opType = 413;
        if (!checkPermission(opType)) {
            layer.msg("没有权限");
            return;
        }
        data = {};
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id
        });
        ajaxPost("/Relay/Post",
            data,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }
                var data;
                if (ret.datas.length > 0) {
                    data = ret.datas[0];

                    $("#rFaultCodeDiv").addClass("hidden");
                    $("#singleFaultCode").removeClass("hidden");
                    $("#singleUpdateId").html(id);
                    $("#singleUpdateState").html(data.State);
                    $("#singleFaultCode").val(data.DeviceCode);
                    $("#singleProposer").val(data.Proposer);
                    var d = data.FaultTime.split(' ');
                    $("#singleFaultDate").val(d[0]);
                    $("#singleFaultTime").val(d[1]);
                    $("#singleFaultDesc").html(data.FaultDescription);
                    $("#singleFaultPriority").val(data.Priority);

                    $("#singleFaultSolver").val(data.FaultSolver);
                    var d = data.SolveTime.split(' ');
                    $("#singleSolveDate").val(d[0]);
                    $("#singleSolveTime").val(d[1]);

                    $("#singleFaultType").val(data.FaultTypeId).trigger("change");
                    $("#solveDiv").removeClass("hidden");
                    $("#recordChange").removeClass("hidden");
                }

                $("#singleFaultModel").modal("show");
            });
    } else {

        opType = 100;
        if (!checkPermission(opType)) {
            layer.msg("没有权限");
            return;
        }
        data = {}
        data.opType = opType;
        ajaxPost("/Relay/Post", data,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }
                $("#singleSolveDate").val(getDate());
                $("#singleSolveDate").datepicker('update');
                $("#singleSolveTime").val(getTime());
                var info = getCookieTokenInfo();
                $("#singleFaultSolver").val(info.name);

                $("#singleFaultCode").addClass("hidden");
                $("#rFaultCodeDiv").removeClass("hidden");
                $("#singleProposer").val("");
                $("#singleFaultDesc").html("");

                $("#singleFaultDate").val(getDate());
                $("#singleFaultDate").datepicker('update');
                $("#singleFaultTime").val(getTime());
                $(".dd").removeAttr("disabled");
                $("#solveDiv").removeClass("hidden");

                $("#rFaultCode").empty();
                $("#rFaultCode").select2();
                var option = '<option value="{0}">{1}</option>';
                for (var i = 0; i < ret.datas.length; i++) {
                    var data = ret.datas[i];
                    $("#rFaultCode").append(option.format(data.Code, data.Code));
                }
                $("#recordAdd").removeClass("hidden");
                $("#singleFaultModel").modal("show");

            });


    }
}

function recordChange(type) {
    var id = parseInt($("#singleUpdateId").html());

    var code;
    code = type == 0 ? $("#singleFaultCode").val() : $("#rFaultCode").val();
    //机台号
    if (isStrEmptyOrUndefined(code)) {
        if (type != 0)
            showTip($("#rFaultCodeTip"), "请选择设备");
        return;
    }

    var proposer = $("#singleProposer").val().trim();
    //报修人
    if (isStrEmptyOrUndefined(proposer)) {
        if (type != 0)
            showTip($("#singleProposerTip"), "报修人不能为空");
        return;
    }
    var faultDate = $("#singleFaultDate").val();
    var faultTime = $("#singleFaultTime").val();
    var time = "{0} {1}".format(faultDate, faultTime);

    var faultDesc = $("#singleFaultDesc").val();
    var priority = $("#singleFaultPriority").val();

    var singleFaultSolver = $("#singleFaultSolver").val();
    var singleSolvePlan = $("#singleSolvePlan").val();

    var singleSolveDate = $("#singleSolveDate").val();
    var singleSolveTime = $("#singleSolveTime").val();
    var solveTime = "{0} {1}".format(singleSolveDate, singleSolveTime);

    var singleFaultType = $("#singleFaultType").val();

    $("#singleFaultModel").modal("hide");
    var opType = type == 0 ? 414 : 415;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {};
    data.opType = opType;
    var record = {
        //机台号
        DeviceCode: code,
        //故障时间
        FaultTime: time,
        //报修人
        Proposer: proposer,
        //故障描述
        FaultDescription: faultDesc,
        //优先级
        Priority: priority,
        //故障解决者
        FaultSolver: singleFaultSolver,
        //故障解决时间
        SolveTime: solveTime,
        //故障解决方案
        SolvePlan: singleSolvePlan,
        //故障类型表Id
        FaultTypeId: singleFaultType
    }
    if (type == 0)
        record.id = id;
    data.opData = JSON.stringify(record);
    ajaxPost("/Relay/Post",
        data,
        function (ret) {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                getRepairRecordList();
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
            var op = function (data, type, row) {
                var html = '<div class="btn-group">' +
                    '<button type = "button" class="btn btn-default" > <i class="fa fa-asterisk"></i>操作</button >' +
                    '<button type = "button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                    '   <span class="caret"></span>' +
                    '   <span class="sr-only">Toggle Dropdown</span>' +
                    '</button>' +
                    '<ul class="dropdown-menu" role="menu">{0}{1}' +
                    '</ul>' +
                    '</div>';

                var updateLi = '<li><a onclick="showUpdateUsuallyFaultModel({0})">修改</a></li>'.format(data.Id);
                var deleteLi = '<li><a onclick="deleteUsuallyFault({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.UsuallyFaultDesc));

                html = html.format(
                    checkPermission(402) ? updateLi : "",
                    checkPermission(405) ? deleteLi : "");

                return html;
            }
            $("#usuallyFaultList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [10, 20, 30], //更改显示记录数选项  
                    "iDisplayLength": 10, //默认显示的记录数
                    "columns": [
                        { "data": "Id", "title": "序号" },
                        { "data": "UsuallyFaultDesc", "title": "常见故障" },
                        { "data": "SolverPlan", "title": "解决方法" },
                        { "data": null, "title": "操作", "render": op }
                    ],
                    "bAutoWidth": true,
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

function deleteUsuallyFault(id, usuallyFaultDesc) {
    usuallyFaultDesc = unescape(usuallyFaultDesc);
    var opType = 405;
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
                    getUsuallyFaultList();
                }
            });
    }
    showConfirm("删除常见故障：" + usuallyFaultDesc, doSth);
}

function showAddUsuallyFaultModel() {
    hideClassTip('adt');
    $("#addUsuallyFaultModel").modal("show");
}

function addUsuallyFault() {
    var opType = 403;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var add = true;
    var addUsuallyFaultDesc = $("#addUsuallyFaultDesc").val().trim();
    if (isStrEmptyOrUndefined(addUsuallyFaultDesc)) {
        showTip("addUsuallyFaultDescTip", "故障描述不能为空");
        add = false;
    }
    var addSolverPlan = $("#addSolverPlan").val().trim();
    if (isStrEmptyOrUndefined(addSolverPlan)) {
        showTip($("#addSolverPlanTip"), "解决方案不能为空");
        add = false;
    }
    if (!add)
        return;

    var doSth = function () {
        $("#addUsuallyFaultModel").modal("hide");
        var data = {};
        data.opType = opType;
        data.opData = JSON.stringify({
            //故障类型描述
            UsuallyFaultDesc: addUsuallyFaultDesc,
            //故障类型解决方案
            SolverPlan: addSolverPlan
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getUsuallyFaultList();
                }
            });
    }
    showConfirm("添加", doSth);
}

function showUpdateUsuallyFaultModel(id) {
    var opType = 401;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    $("#updateId").html(id);
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
            if (ret.datas.length > 0) {
                $("#updateUsuallyFaultDesc").val(ret.datas[0].UsuallyFaultDesc);
                $("#updateSolverPlan").val(ret.datas[0].SolverPlan);
            }
            hideClassTip('adt');
            $("#updateUsuallyFaultModel").modal("show");
        });
}

function updateUsuallyFault() {
    var opType = 402;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var update = true;
    var updateUsuallyFaultDesc = $("#updateUsuallyFaultDesc").val().trim();
    if (isStrEmptyOrUndefined(updateUsuallyFaultDesc)) {
        showTip($("#updateUsuallyFaultDescTip"), "故障描述不能为空");
        update = false;
    }
    var updateSolverPlan = $("#updateSolverPlan").val().trim();
    if (isStrEmptyOrUndefined(updateSolverPlan)) {
        showTip($("#updateSolverPlanTip"), "解决方案不能为空");
        update = false;
    }
    if (!update)
        return;
    var id = parseInt($("#updateId").html());

    var doSth = function () {
        $("#updateUsuallyFaultModel").modal("hide");
        var data = {};
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id,
            //故障类型描述
            UsuallyFaultDesc: updateUsuallyFaultDesc,
            //故障类型解决方案
            SolverPlan: updateSolverPlan
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getUsuallyFaultList();
                }
            });
    }
    showConfirm("修改", doSth);
}

function getFaultTypeList() {
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

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var op = function (data, type, row) {
                var html = '<div class="btn-group">' +
                    '<button type = "button" class="btn btn-default" > <i class="fa fa-asterisk"></i>操作</button >' +
                    '<button type = "button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                    '   <span class="caret"></span>' +
                    '   <span class="sr-only">Toggle Dropdown</span>' +
                    '</button>' +
                    '<ul class="dropdown-menu" role="menu">{0}{1}' +
                    '</ul>' +
                    '</div>';

                var updateLi = '<li><a onclick="showUpdateFaultTypeModel({0})">修改</a></li>'.format(data.Id);
                var deleteLi = '<li><a onclick="deleteFaultType({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.FaultTypeName));

                html = html.format(
                    checkPermission(408) ? updateLi : "",
                    checkPermission(411) ? deleteLi : "");

                return html;
            }
            $("#faultTypeList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [10, 20, 30], //更改显示记录数选项  
                    "iDisplayLength": 10, //默认显示的记录数
                    "columns": [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "Id", "title": "Id", "bVisible": false },
                        { "data": "FaultTypeName", "title": "故障类型" },
                        { "data": "FaultDescription", "title": "故障类型描述" },
                        { "data": null, "title": "操作", "render": op }
                    ],
                    "columnDefs": [
                        {
                            "targets": [3],
                            "render": function (data, type, full, meta) {
                                if (full.FaultDescription) {
                                    if (full.FaultDescription.length > tdShowLength) {
                                        return full.FaultDescription.substr(0, tdShowLength) + ' . . .<a href = \"javascript:void(0);\" onclick = \"showFaultTypeDetailModel({0})\" >全部显示</a> '.format(full.Id);
                                    } else {
                                        return full.FaultDescription;
                                    }
                                } else {
                                    return "";
                                }
                            }
                        }
                    ]
                });

            $("#singleFaultType").empty();
            $("#singleFaultType1").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                if (i == 0)
                    fType = data.Id;
                $("#singleFaultType").append(option.format(data.Id, data.FaultTypeName));
                $("#singleFaultType1").append(option.format(data.Id, data.FaultTypeName));
            }

            $("#faultTypeModel").modal("show");
        });
}

function showFaultTypeDetailModel(id) {
    var opType = 407;
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
                $("#faultTypeDetail").html(ret.datas[0].FaultDescription);

            $("#faultTypeDetailModel").modal("show");

        });
}

function deleteFaultType(id, faultTypeDesc) {
    faultTypeDesc = unescape(faultTypeDesc);
    var opType = 411;
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
                    getFaultTypeList();
                }
            });
    }
    showConfirm("删除故障类型：" + faultTypeDesc, doSth);
}

function showAddFaultTypeModel() {
    hideClassTip('adt');
    $("#addFaultTypeName").val("");
    $("#addFaultTypeDesc").val("");
    $("#addFaultTypeModel").modal("show");
}

function addFaultType() {
    var opType = 410;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var add = true;
    var addFaultTypeName = $("#addFaultTypeName").val().trim();
    if (isStrEmptyOrUndefined(addFaultTypeName)) {
        showTip("addFaultTypeNameTip", "故障类型不能为空");
        add = false;
    }
    var addFaultTypeDesc = $("#addFaultTypeDesc").val();

    if (!add)
        return;

    var doSth = function () {
        $("#addFaultTypeModel").modal("hide");
        var data = {};
        data.opType = opType;
        data.opData = JSON.stringify([{
            //故障类型
            FaultTypeName: addFaultTypeName,
            //故障类型描述
            FaultDescription: addFaultTypeDesc
        }]);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFaultTypeList();
                }
            });
    }
    showConfirm("添加", doSth);
}

function showUpdateFaultTypeModel(id) {
    var opType = 407;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    $("#updateTypeId").html(id);
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
            if (ret.datas.length > 0) {
                $("#updateFaultTypeName").val(ret.datas[0].FaultTypeName);
                $("#updateFaultTypeDesc").val(ret.datas[0].FaultDescription);
            }
            hideClassTip('adt');
            $("#updateFaultTypeModel").modal("show");
        });
}

function updateFaultType() {
    var opType = 408;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var update = true;
    var updateFaultTypeName = $("#updateFaultTypeName").val().trim();
    if (isStrEmptyOrUndefined(updateFaultTypeName)) {
        showTip("updateFaultTypeNameTip", "故障类型不能为空");
        update = false;
    }
    var updateFaultTypeDesc = $("#updateFaultTypeDesc").val();
    if (!update)
        return;
    var id = parseInt($("#updateTypeId").html());

    var doSth = function () {
        $("#updateFaultTypeModel").modal("hide");
        var data = {};
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id,
            //故障类型
            FaultTypeName: updateFaultTypeName,
            //故障类型描述
            FaultDescription: updateFaultTypeDesc
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFaultTypeList();
                }
            });
    }
    showConfirm("修改", doSth);
}