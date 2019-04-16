﻿function pageReady() {

    $(".ms2").select2();
    $("#singleFaultType").select2();
    getFaultDeviceList();
    getRepairRecordList();
}

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
                        { "data": "FaultDescription", "title": "故障描述" },
                        { "data": null, "title": "操作", "render": op },
                    ]
                });


            $(".ms2").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $(".ms2").append(option.format(data.Id, data.DeviceCode));
            }
        });
}

function sChange(id, type) {
    $(".dd").attr("disabled", "disabled");
    $(".db").addClass("hidden");
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
                var d = data.FaultTime.split(' ');
                $("#singleFaultDate").val(d[0]);
                var t = d[1].split(':');
                $("#singleFaultTime").val("{0}:{1}".format(t[0], t[1]));
                $("#singleFaultDesc").html(data.FaultDescription);
                $("#singleFaultPriority").val(data.Priority);
                if (type == 0) {
                    $("#singleFaultPriority").removeAttr("disabled");
                    $("#singleChange").removeClass("hidden");
                }
                if (type == 1) {
                    $("#singleSure").removeClass("hidden");
                }
                if (type == 2) {
                    $("#singleRepairing").removeClass("hidden");
                }
                if (type == 3) {
                    $("#solveDiv").removeClass("hidden");
                    $("#singleRepaired").removeClass("hidden");
                }
            }
            if (type == 3) {
                data = {};
                data.opType = 406;
                ajaxPost("/Relay/Post", data,
                    function (ret) {
                        if (ret.errno != 0) {
                            layer.msg(ret.errmsg);
                            return;
                        }
                        $("#singleSolveDate").val(getNow());
                        $("#singleSolveDate").datepicker('update');
                        $("#singleSolveTime").val(getNowTime());
                        var info = getCookieTokenInfo();
                        $("#singleFaultSolver").val(info.name);
                        $(".ms2").empty();
                        var option = '<option value="{0}">{1}</option>';
                        for (var i = 0; i < ret.datas.length; i++) {
                            var data = ret.datas[i];
                            $("#singleFaultType").append(option.format(data.Id, data.FaultTypeName));
                        }
                    });
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

    var proposer = $("#singleProposer").val();
    //报修人
    if (isStrEmptyOrUndefined(proposer)) {
        return;
    }
    var faultDate = $("#singleFaultDate").val();
    var faultTime = $("#singleFaultTime").val();
    var time = "{0} {1}:00".format(faultDate, faultTime);

    var faultDesc = $("#singleFaultDesc").val();
    var priority = $("#singleFaultPriority").val();

    $("#singleFaultModel").modal("hide");

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
        var solveTime = "{0} {1}:00".format(singleSolveDate, singleSolveTime);

        var singleFaultType = $("#singleFaultType").val();

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
                FaultTypeId: singleFaultType
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
                var changeBtn = '<button type="button" class="btn btn-primary" onclick="sChange({0}, 0)">修改</button>'.format(data.Id);

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
            var remarkShowLength = 120;//默认现实的字符串长度
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
                var deleteLi = '<li><a onclick="DeleteUsuallyFault({0}, \'{1}\')">删除</a></li>'.format(data.Id, data.UsuallyFaultDesc);

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
                                    if (full.SolverPlan.length > remarkShowLength) {
                                        return full.SolverPlan.substr(0, remarkShowLength) + ' . . .<a href = \"javascript:void(0);\" onclick = \"showUsuallyFaultDetailModel({0})\" >全部显示</a> '.format(full.Id);
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

function DeleteUsuallyFault(id, usuallyFaultDesc) {
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
    var addUsuallyFaultDesc = $("#addUsuallyFaultDesc").val();
    if (isStrEmptyOrUndefined(addUsuallyFaultDesc)) {
        showTip($("addUsuallyFaultDescTip"), "故障描述不能为空");
        add = false;
    }
    var addSolverPlan = $("#addSolverPlan").val();
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
    var updateUsuallyFaultDesc = $("#updateUsuallyFaultDesc").val();
    if (isStrEmptyOrUndefined(updateUsuallyFaultDesc)) {
        showTip($("updateUsuallyFaultDescTip"), "故障描述不能为空");
        update = false;
    }
    var updateSolverPlan = $("#updateSolverPlan").val();
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
