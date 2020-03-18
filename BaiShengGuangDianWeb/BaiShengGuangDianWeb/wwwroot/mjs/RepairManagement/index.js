var permissionList = [];
var getRepairRecordListFlag = false;
function pageReady() {
    permissionList[100] = { uIds: [] };
    permissionList[400] = { uIds: ["getUsuallyFaultList"] };
    permissionList[402] = { uIds: [] };
    permissionList[403] = { uIds: ["showAddUsuallyFaultModel"] };
    permissionList[404] = { uIds: [] };
    permissionList[405] = { uIds: [] };
    permissionList[406] = { uIds: ["getFaultTypeList"] };
    permissionList[408] = { uIds: ["updateFaultTypeModel"] };
    permissionList[410] = { uIds: ["showAddFaultTypeModel"] };
    permissionList[411] = { uIds: [] };
    permissionList[412] = { uIds: ["repairListLi"] };
    permissionList[414] = { uIds: [] };
    permissionList[415] = { uIds: ["rChange"] };
    permissionList[416] = { uIds: [] };
    permissionList[417] = { uIds: ["faultDeviceLi"] };
    permissionList[420] = { uIds: [] };
    permissionList[423] = { uIds: [] };
    permissionList[424] = { uIds: ["delFaultDeviceLi"] };
    permissionList[425] = { uIds: ["delRepairLi"] };
    permissionList[430] = { uIds: ["showMaintainerModel"] };
    permissionList[431] = { uIds: ["updateMaintainerBtn"] };
    permissionList[432] = { uIds: ["showAddMaintainerModelBtn"] };
    permissionList[433] = { uIds: ["delMaintainerBtn"] };
    permissionList = checkPermissionUi(permissionList);
    var li = $("#tabs li:not(.hidden)").first();
    if (li) {
        li.addClass("active");
        $(li.find("a").attr("href")).addClass("active");
    }
    $(".ms2").select2();
    $("#singleFaultType").select2();
    getFaultDeviceList();
    //getRepairRecordList();
    setTimeout(function () {
        getRepairRecordList(true, 0);
        getFaultType(0);
    }, 3000);
    $(".icb_minimal").iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '20%' // optional
    });
    $("#fStartDate").val(getDate()).datepicker('update');
    $("#fEndDate").val(getDate()).datepicker('update');
    $("#rStartDate").val(getDate()).datepicker('update');
    $("#rEndDate").val(getDate()).datepicker('update');
    $(".fHead input,.fHead span").css("verticalAlign", "middle");
    $(".rHead input,.rHead span").css("verticalAlign", "middle");
    $(".fHead label").on("ifChanged", function () {
        if (!$(".fHead .icb_minimal").is(":checked")) {
            $("#fBtn").removeClass("hidden");
            $("#fTime").addClass("hidden");
        } else {
            $("#fBtn").addClass("hidden");
            $("#fTime").removeClass("hidden");
            $("#fStartDate").val(getDate()).datepicker('update');
            $("#fStartTime").val(getTime()).timepicker("setTime", getTime());
            $("#fEndDate").val(getDate()).datepicker('update');
            $("#fEndTime").val(getTime()).timepicker("setTime", getTime());
        }
    });
    $(".rHead label").on("ifChanged", function () {
        if (!$(".rHead .icb_minimal").is(":checked")) {
            $("#rBtn").removeClass("hidden");
            $("#rTime").addClass("hidden");
        } else {
            $("#rBtn").addClass("hidden");
            $("#rTime").removeClass("hidden");
            $("#rStartDate").val(getDate()).datepicker('update');
            $("#rStartTime").val(getTime()).timepicker("setTime", getTime());
            $("#rEndDate").val(getDate()).datepicker('update');
            $("#rEndTime").val(getTime()).timepicker("setTime", getTime());
        }
    });
    $("#singleFaultType1").on("select2:select", function (e) {
        var desc = "";
        for (var i = 0; i < faultData.length; i++) {
            if (faultData[i].Id == $("#singleFaultType1").val()) {
                desc = faultData[i].FaultDescription;
                break;
            }
        }
        $("#singleFaultDefaultDesc").val(desc);
    });
    //定时器
    window.onload = function () {
        (function ($) {
            funObj = {
                timeUserFun: 'timeUserFun',
            }
            $[funObj.timeUserFun] = function (time) {
                var userTime = time * 60;
                var objTime = {
                    init: 0,
                    time: function () {
                        objTime.init += 1;
                        if (objTime.init == userTime) {
                            getFaultDeviceList(0); // 用户未操作任何事件,刷新故障设备列表
                            objTime.init = 0;
                        }
                    },
                    eventFun: function () {
                        clearInterval(testUser);
                        objTime.init = 0;
                        testUser = setInterval(objTime.time, 1000);
                    }
                }
                var testUser = setInterval(objTime.time, 1000);
                //添加事件语柄
                var body = document.querySelector('html');
                body.addEventListener("click", objTime.eventFun);
                body.addEventListener("keydown", objTime.eventFun);
                body.addEventListener("mousemove", objTime.eventFun);
                body.addEventListener("mousewheel", objTime.eventFun);
            }
        })(window)
        //   直接调用 参数代表分钟数,可以有一位小数;
        timeUserFun(1);
    }
    var focus = null;
    var currentTop = 0;
    var time, date;
    $("#singleFaultModel").on("scroll", function () {
        if (focus != document.activeElement) {
            focus = document.activeElement;
            currentTop = $(focus).offset().top;
            if ($(".bootstrap-timepicker-widget").length > 0) {
                time = $(".bootstrap-timepicker-widget").offset().top;
            }
            if ($(".datepicker").length > 0) {
                date = $(".datepicker").offset().top;
            }
        }
        var nowTop = $(focus).offset().top;
        var top = nowTop - currentTop;
        $(".bootstrap-timepicker-widget").css("top", (time + top) + "px");
        $(".datepicker").css("top", (date + top) + "px");
    });
}
var faultData = null;
function getFaultType(cover = 1) {
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
        }, cover);
}

var fType = 0;
function getFaultDeviceList(cover = 1) {
    var opType = 417;
    if (!permissionList[opType].have) {
        //layer.msg("没有权限");
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
            var upDel = '<div class="btn-group">' +
                '<button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >' +
                '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                '        <span class="caret"></span>' +
                '        <span class="sr-only">Toggle Dropdown</span>' +
                '    </button>' +
                '    <ul class="dropdown-menu" role="menu" style="cursor:pointer">{0}{1}' +
                '    </ul>' +
                '</div>';
            var op = function (data, type, row) {
                var html = "{0}{1}{2}{3}";
                var sureBtn = '<button type="button" class="btn btn-danger" onclick="sChange({0}, 1)">确认故障</button>'.format(data.Id);
                var repairingBtn = '<button type="button" class="btn btn-info" onclick="sChange({0}, 2)">开始维修</button>'.format(data.Id);
                var repairedBtn = '<button type="button" class="btn btn-success" onclick="sChange({0}, 3)">维修完成</button>'.format(data.Id);
                var changeBtn = '<li><a onclick="sChange({0}, 0)">修改</a></li>'.format(data.Id);
                var delBtn = '<li><a onclick="delChange({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.DeviceCode));

                return html.format(
                    upDel.format(permissionList[420].have ? changeBtn : "", permissionList[423].have ? delBtn : ""),
                    permissionList[420].have && data.State == 0 ? sureBtn : "",
                    permissionList[420].have && data.State == 1 ? repairingBtn : "",
                    permissionList[420].have && data.State == 2 ? repairedBtn : "");
            }
            var order = function (data, type, row, meta) {
                return meta.row + 1;
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

            var rDesc = function (d, type, row, meta) {
                var data = d.FaultDescription;
                var id = d.FaultTypeId;
                return `<span title = "${data}" onclick = "showFaultTypeDetailModel(${id}, '${escape(data.trim())}')">${data.length > tdShowLength ? data.substring(0, tdShowLength) : data}...</span>`;
            }

            var columns = [
                { "data": null, "title": "序号", "render": order },
                { "data": "DeviceCode", "title": "机台号" },
                { "data": "FaultTime", "title": "故障时间" },
                { "data": null, "title": "优先级", "render": priority },
                { "data": null, "title": "状态", "render": rState },
                { "data": "Name", "title": "维修工" },
                { "data": "Phone", "title": "联系方式" },
                { "data": "Proposer", "title": "报修人" },
                { "data": "FaultTypeName", "title": "故障类型" },
                { "data": null, "title": "故障描述", "render": rDesc }
            ];
            if (permissionList[420].have || permissionList[423].have) {
                columns.push({ "data": null, "title": "操作", "render": op, "orderable": false });
            }

            $("#faultDeviceList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rtip',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": columns
                });

            $("#singleFaultCode").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#singleFaultCode").append(option.format(data.Id, data.DeviceCode));
            }
        }, cover);
}

function sChange(id, type) {
    hideClassTip('adt');
    $(".dd").attr("disabled", "disabled");
    $(".db").addClass("hidden");
    $("#solveDiv").addClass("hidden");
    $("#faultOtherDiv").addClass("hidden");
    $("#singleFaultType").val(fType).trigger("change");

    $("#rFaultCodeDiv").addClass("hidden");
    $("#singleFaultCode").removeClass("hidden");
    var opType = 417;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        qId: id
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
                $("#singleUpdateCodeId").html(data.DeviceId);
                $("#singleFaultCode").val(data.DeviceCode);
                $("#singleProposer").val(data.Proposer);
                $("#singleFaultType1").val(data.FaultTypeId).trigger("change");
                var d = data.FaultTime.split(' ');
                $("#singleFaultDate").val(d[0]);
                $("#singleFaultTime").val(d[1]);

                var desc = "";
                for (var i = 0; i < faultData.length; i++) {
                    if (faultData[i].Id == $("#singleFaultType1").val()) {
                        desc = faultData[i].FaultDescription;
                        break;
                    }
                }
                $("#singleFaultDefaultDesc").val(desc);

                $("#singleFaultDesc").val(data.FaultDescription);
                $("#singleFaultPriority").val(data.Priority);
                if (type == 0) {
                    $("#singleFaultPriority").removeAttr("disabled");
                    $("#singleChange").removeClass("hidden");
                }
                //确认故障
                if (type == 1) {
                    $("#singleSure").removeClass("hidden");
                }
                //维修中
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

function delChange(id, code) {
    code = unescape(code);
    var opType = 423;
    if (!permissionList[opType].have) {
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
                    getFaultDeviceList();
                }
            });
    }
    showConfirm("删除故障设备：" + code, doSth);
}

function getDelFaultDeviceList() {
    var opType = 424;
    if (!permissionList[opType].have) {
        //layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    if ($(".fHead .icb_minimal").is(":checked")) {
        var startTime = $("#fStartDate").val() + " " + $("#fStartTime").val();
        var endTime = $("#fEndDate").val() + " " + $("#fEndTime").val();
        if (exceedTime(startTime) || exceedTime(endTime)) {
            layer.msg("所选时间不能大于当前时间");
            return;
        }
        if (compareDate(startTime, endTime)) {
            layer.msg("结束时间不能小于开始时间");
            return;
        }
        data.opData = JSON.stringify({
            StartTime: startTime,
            EndTime: endTime
        });
    }
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var o = 0;
        var order = function (data, type, row) {
            return ++o;
        }

        var rDesc = function (d, type, row, meta) {
            var data = d.FaultDescription;
            var id = d.FaultTypeId;
            return `<span title = "${data}" onclick = "showFaultTypeDetailModel(${id}, '${escape(data.trim())}')">${data.length > tdShowLength ? data.substring(0, tdShowLength) : data}...</span>`;
        }

        $("#delFaultDeviceList")
            .DataTable({
                dom: '<"pull-left"l><"pull-right"f>rtip',
                "destroy": true,
                "paging": true,
                "searching": true,
                "autoWidth": true,
                "language": oLanguage,
                "data": ret.datas,
                "aaSorting": [[0, "asc"]],
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "DeviceCode", "title": "机台号" },
                    { "data": "FaultTime", "title": "故障时间" },
                    { "data": "Name", "title": "维修工" },
                    { "data": "Phone", "title": "联系方式" },
                    { "data": "Proposer", "title": "报修人" },
                    { "data": "FaultTypeName", "title": "故障类型" },
                    { "data": null, "title": "故障描述", "render": rDesc }
                ]
            });
    });
}

function singleChange(type) {
    var id = parseInt($("#singleUpdateId").html());
    var state = parseInt($("#singleUpdateState").html());
    var codeId = parseInt($("#singleUpdateCodeId").html());

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

    var faultDesc = $("#singleFaultDesc").val().trim();
    var priority = $("#singleFaultPriority").val().trim();


    var opType;
    var data;
    if (type < 3) {
        opType = 420;
        if (!permissionList[opType].have) {
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
                //机台号Id
                DeviceId: codeId,
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
        opType = 420;
        if (!permissionList[opType].have) {
            layer.msg("没有权限");
            return;
        }
        data = {};
        data.opType = opType;
        data.opData = JSON.stringify([{
            //(自增Id)
            id: id,
            //机台号
            DeviceCode: code,
            //机台号Id
            DeviceId: codeId,
            //故障时间
            FaultTime: time,
            //报修人
            Proposer: proposer,
            //故障描述
            FaultDescription: faultDesc,
            //优先级
            Priority: priority,
            //状态
            State: state,
            FaultLogId: id,
            MarkedDelete: true
        }]);
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
        if (!permissionList[opType].have) {
            layer.msg("没有权限");
            return;
        }
        data = {};
        data.opType = opType;
        data.opData = JSON.stringify(
            {
                //机台号
                DeviceCode: code,
                //机台号Id
                DeviceId: codeId,
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
                FaultTypeId1: singleFaultType1,
                //故障记录Id
                FaultLogId: id
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

function getRepairRecordList(f = false, cover = 1) {
    if (f && getRepairRecordListFlag) {
        return;
    }
    getRepairRecordListFlag = true;
    var opType = 412;
    if (!permissionList[opType].have) {
        //layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    //data.opData = JSON.stringify({
    //    id: 1,
    //    startTime: '2019-05-09 10:23:36',
    //    endTime: '2019-05-09 10:23:36',
    //});
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
            var html = '<div class="btn-group">' +
                '<button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >' +
                '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                '        <span class="caret"></span>' +
                '        <span class="sr-only">Toggle Dropdown</span>' +
                '    </button>' +
                '    <ul class="dropdown-menu" role="menu" style="cursor:pointer">{0}{1}' +
                '    </ul>' +
                '</div>';
            var op = function (data, type, row) {
                var changeBtn = '<li><a onclick="rChange({0}, 0)">修改</a></li>'.format(data.Id);
                var deleteBtn = '<li><a onclick="deleteChange({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.FaultTypeName));
                return html.format(permissionList[414].have ? changeBtn : "", permissionList[416].have ? deleteBtn : "");
            }
            var rDesc = function (d, type, row, meta) {
                var data = d.FaultDescription;
                var id = d.FaultTypeId;
                return `<span title = "${data}" onclick = "showFaultTypeDetailModel(${id}, '${escape(data.trim())}')">${data.length > tdShowLength ? data.substring(0, tdShowLength) : data}...</span>`;
            }
            var rSolvePlan = function (d, type, row, meta) {
                var data = d.SolvePlan;
                return `<span title = "${data}" onclick = "showAllContent('${escape(data)}', '解决方案')">${data.substring(0, tdShowLength)}...</span>`;
            }
            var isAdd = function (data, type, row) {
                return data == false ? '否' : '是';
            }
            var columns = [
                { "data": "Id", "title": "序号", "render": order },
                { "data": "DeviceCode", "title": "机台号" },
                { "data": "FaultTime", "title": "故障时间" },
                { "data": "Name", "title": "维修工" },
                { "data": "Phone", "title": "联系方式" },
                { "data": "Proposer", "title": "报修人" },
                { "data": "FaultSolver", "title": "解决人员" },
                { "data": null, "title": "故障描述", "render": rDesc },
                { "data": "SolveTime", "title": "解决时间" },
                { "data": "FaultTypeName", "title": "故障类型" },
                { "data": null, "title": "解决方案", "render": rSolvePlan },
                { "data": "IsAdd", "title": "维修工添加", "render": isAdd }
            ];
            if (permissionList[414].have || permissionList[416].have) {
                columns.push({ "data": null, "title": "操作", "render": op, "orderable": false });
            }
            var excelColumns = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            var titleColumns = [5, 8];
            $("#repairRecordList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"B><"pull-right"f>rtip',
                    buttons: [
                        {
                            extend: 'excel',
                            text: '导出Excel',
                            className: 'btn-primary btn-sm', //按钮的class样式
                            exportOptions: {
                                columns: excelColumns,
                                format: {
                                    // format有三个子标签，header，body和foot
                                    body: function (data, row, column, node) {
                                        //操作需要导出excel的数据格式                        
                                        if (titleColumns.indexOf(column) > -1) {
                                            var a = $(node).find("span").attr("title");
                                            if (a != null) {
                                                return "\u200C" + unescape(a);
                                            }
                                        }
                                        return "\u200C" + node.textContent;
                                    }
                                }
                            }
                        }
                    ],
                    //"pagingType": "input",
                    //"serverSide": true,
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    //"aaSorting": [[0, "desc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": columns
                });
        }, cover);
}

function getDelRepairList() {
    var opType = 425;
    if (!permissionList[opType].have) {
        //layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    if ($(".rHead .icb_minimal").is(":checked")) {
        var startTime = $("#rStartDate").val() + " " + $("#rStartTime").val();
        var endTime = $("#rEndDate").val() + " " + $("#rEndTime").val();
        if (exceedTime(startTime) || exceedTime(endTime)) {
            layer.msg("所选时间不能大于当前时间");
            return;
        }
        if (compareDate(startTime, endTime)) {
            layer.msg("结束时间不能小于开始时间");
            return;
        }
        data.opData = JSON.stringify({
            StartTime: startTime,
            EndTime: endTime
        });
    }
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var o = 0;
        var order = function (data, type, row) {
            return ++o;
        }
        var rDesc = function (d, type, row, meta) {
            var data = d.FaultDescription;
            var id = d.FaultTypeId;
            return `<span title = "${data}" onclick = "showFaultTypeDetailModel(${id}, '${escape(data.trim())}')">${data.length > tdShowLength ? data.substring(0, tdShowLength) + "..." : data}</span>`;
        }
        var rSolvePlan = function (d, type, row, meta) {
            var data = d.SolvePlan;
            return `<span title = "${data}" onclick = "showAllContent('${escape(data)}', '解决方案')">${data.length > tdShowLength ? data.substring(0, tdShowLength) + "..." : data}</span>`;
        }
        var isAdd = function (data, type, row) {
            return data == false ? '否' : '是';
        }
        var columns = [
            { "data": "Id", "title": "序号", "render": order },
            { "data": "DeviceCode", "title": "机台号" },
            { "data": "FaultTime", "title": "故障时间" },
            { "data": "Name", "title": "维修工" },
            { "data": "Phone", "title": "联系方式" },
            { "data": "Proposer", "title": "报修人" },
            { "data": "FaultSolver", "title": "解决人员" },
            { "data": null, "title": "故障描述", "render": rDesc },
            { "data": "SolveTime", "title": "解决时间" },
            { "data": "FaultTypeName", "title": "故障类型" },
            { "data": null, "title": "解决方案", "render": rSolvePlan },
            { "data": "IsAdd", "title": "维修工添加", "render": isAdd }
        ];

        $("#delRepairList")
            .DataTable({
                dom: '<"pull-left"l><"pull-right"f>rtip',
                "destroy": true,
                "paging": true,
                "searching": true,
                "autoWidth": true,
                "language": oLanguage,
                "data": ret.datas,
                "aaSorting": [[0, "asc"]],
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数
                "columns": columns
            });
    });
}

function rChange(id, type) {
    hideClassTip('adt');
    $(".db").addClass("hidden");
    $(".dd").attr("disabled", "disabled");
    $("#rFaultCodeDiv").addClass("hidden");
    $("#faultOtherDiv").addClass("hidden");
    $("#singleFaultType").val(fType).trigger("change");

    var opType;
    var data;
    if (type == 0) {
        opType = 412;
        if (!permissionList[opType].have) {
            layer.msg("没有权限");
            return;
        }
        data = {};
        data.opType = opType;
        data.opData = JSON.stringify({
            qId: id
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
                    $("#faultOtherDiv").addClass("hidden");
                    $("#singleFaultCode").removeClass("hidden");
                    $("#singleUpdateId").html(id);
                    $("#singleUpdateState").html(data.State);
                    $("#singleFaultCode").val(data.DeviceCode);
                    $("#singleProposer").val(data.Proposer);
                    $("#singleFaultType1").val(data.FaultTypeId1).trigger("change");
                    var d = data.FaultTime.split(' ');
                    $("#singleFaultDate").val(d[0]);
                    $("#singleFaultTime").val(d[1]);
                    var desc = "";
                    for (var i = 0; i < faultData.length; i++) {
                        if (faultData[i].Id == $("#singleFaultType1").val()) {
                            desc = faultData[i].FaultDescription;
                            break;
                        }
                    }
                    $("#singleFaultDefaultDesc").val(desc);
                    $("#singleFaultDesc").val(data.FaultDescription.trim());
                    $("#singleFaultPriority").val(data.Priority);

                    $("#singleFaultSolver").val(data.FaultSolver);
                    var d = data.SolveTime.split(' ');
                    $("#singleSolveDate").val(d[0]).datepicker('update');
                    $("#singleSolveTime").val(d[1]).timepicker('setTime', d[1]);
                    $("#singleSolvePlan").val(data.SolvePlan.trim());

                    $("#singleFaultType").val(data.FaultTypeId).trigger("change");
                    $("#solveDiv").removeClass("hidden");
                    $("#recordChange").removeClass("hidden");
                }

                $("#singleFaultModel").modal("show");
            });
    } else {
        $("#singleUpdateId").html(0);
        opType = 100;
        if (!permissionList[opType].have) {
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
                $("#faultOtherDiv").removeClass("hidden");
                $("#singleSolveDate").val(getDate()).datepicker('update');
                $("#singleSolveTime").val(getTime()).timepicker('setTime', getTime());
                var info = getCookieTokenInfo();
                if (id == 0)
                    $("#singleFaultSolver").val(info.name);

                $("#singleFaultCode").addClass("hidden");
                $("#rFaultCodeDiv").removeClass("hidden");
                $("#singleProposer").val(info.name);
                $("#singleFaultType1").val(fType).trigger("change");
                $("#singleFaultDesc").val("");
                $("#singleSolvePlan").val("");
                $("#singleFaultPriority").val("0");
                $("#faultOther").val("");
                var desc = "";
                for (var i = 0; i < faultData.length; i++) {
                    if (faultData[i].Id == $("#singleFaultType1").val()) {
                        desc = faultData[i].FaultDescription;
                        break;
                    }
                }
                $("#singleFaultDefaultDesc").val(desc);
                $("#singleFaultDate").val(getDate()).datepicker('update');
                $("#singleFaultTime").val(getTime()).timepicker('setTime', getTime());
                $(".dd").removeAttr("disabled");
                $("#solveDiv").removeClass("hidden");

                $("#rFaultCode").empty();
                $("#rFaultCode").select2({
                    allowClear: true,
                    placeholder: "请选择"
                });
                var option = '<option value="{0}" id="{2}">{1}</option>';
                $("#rFaultCode").append('<option></option>');
                for (var i = 0; i < ret.datas.length; i++) {
                    var data = ret.datas[i];
                    $("#rFaultCode").append(option.format(data.Code, data.Code, data.Id));
                }
                $("#recordAdd").removeClass("hidden");
                $("#singleFaultModel").modal("show");

            });
    }
}

function deleteChange(id, faultTypeName) {
    faultTypeName = unescape(faultTypeName);
    var opType = 416;
    if (!permissionList[opType].have) {
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
                    getRepairRecordList();
                }
            });
    }
    showConfirm("删除维修记录：" + faultTypeName, doSth);
}

function recordChange(type) {
    var id = parseInt($("#singleUpdateId").html());
    //机台号
    var code;
    var rFaultCode = $("#rFaultCode").val();
    var faultOther = $("#faultOther").val().trim();
    if (type != 0) {
        if (isStrEmptyOrUndefined(rFaultCode) && isStrEmptyOrUndefined(faultOther)) {
            layer.msg('请选择或输入一台机台号');
            return;
        }
        if (!isStrEmptyOrUndefined(rFaultCode) && !isStrEmptyOrUndefined(faultOther)) {
            layer.msg('只能选择或输入一台机台号');
            return;
        }
        if (isStrEmptyOrUndefined(rFaultCode) && !isStrEmptyOrUndefined(faultOther)) {
            code = faultOther;
        }
        if (!isStrEmptyOrUndefined(rFaultCode) && isStrEmptyOrUndefined(faultOther)) {
            code = rFaultCode;
        }
    } else {
        code = $("#singleFaultCode").val();
    }
    var codeId = $("#rFaultCode").find("[value='" + code + "']").attr("id");
    codeId = isStrEmptyOrUndefined(codeId) || isStrEmptyOrUndefined(rFaultCode) ? 0 : parseInt(codeId);
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
    if (exceedTime(time)) {
        layer.msg("故障时间不能大于当前时间");
        return;
    }
    var faultDesc = $("#singleFaultDesc").val().trim();
    var priority = $("#singleFaultPriority").val();

    var singleFaultSolver = $("#singleFaultSolver").val();
    var singleSolvePlan = $("#singleSolvePlan").val().trim();

    var singleSolveDate = $("#singleSolveDate").val();
    var singleSolveTime = $("#singleSolveTime").val();
    var solveTime = "{0} {1}".format(singleSolveDate, singleSolveTime);
    if (exceedTime(solveTime)) {
        layer.msg("解决时间不能大于当前时间");
        return;
    }
    var singleFaultType1 = $("#singleFaultType1").val();
    var singleFaultType = $("#singleFaultType").val();

    $("#singleFaultModel").modal("hide");
    var opType = type == 0 ? 414 : 415;
    if (!permissionList[opType].have) {
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
        FaultTypeId: singleFaultType,
        //故障类型Id
        FaultTypeId1: singleFaultType1,
        //故障记录Id
        FaultLogId: id,
        //设备Id
        DeviceId: codeId,
        //添加维修记录
        IsAdd: true
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
    if (!permissionList[opType].have) {
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
            var html = '<div class="btn-group">' +
                '<button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >' +
                '<button type = "button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                '   <span class="caret"></span>' +
                '   <span class="sr-only">Toggle Dropdown</span>' +
                '</button>' +
                '<ul class="dropdown-menu" role="menu" style="cursor:pointer">{0}{1}' +
                '</ul>' +
                '</div>';

            var op = function (data, type, row) {
                var updateLi = '<li><a onclick="showUpdateUsuallyFaultModel({0})">修改</a></li>'.format(data.Id);
                var deleteLi = '<li><a onclick="deleteUsuallyFault({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.UsuallyFaultDesc));
                return html.format(
                    permissionList[402].have ? updateLi : "",
                    permissionList[405].have ? deleteLi : "");
            }
            var rSolvePlan = function (d, type, row, meta) {
                var data = d.SolvePlan;
                return `<span title = "${data}" onclick = "showAllContent('${escape(data)}', '解决方案')">${data.length > tdShowLength ? data.substring(0, tdShowLength) + "..." : data}</span>`;
            }

            var columns = [
                { "data": "Id", "title": "序号" },
                { "data": "UsuallyFaultDesc", "title": "常见故障" },
                { "data": null, "title": "解决方案", "render": rSolvePlan }
            ];

            if (permissionList[402].have || permissionList[405].have) {
                columns.push({ "data": null, "title": "操作", "render": op, "orderable": false });
            };

            $("#usuallyFaultList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rtip',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [10, 20, 30], //更改显示记录数选项  
                    "iDisplayLength": 10, //默认显示的记录数
                    "columns": columns,
                    "bAutoWidth": true
                });
            $("#usuallyFaultModel").modal("show");
        });
}

function deleteUsuallyFault(id, usuallyFaultDesc) {
    usuallyFaultDesc = unescape(usuallyFaultDesc);
    var opType = 405;
    if (!permissionList[opType].have) {
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
    $("#addUsuallyFaultDesc").val("");
    $("#addSolvePlan").val("");
    $("#addUsuallyFaultModel").modal("show");
}

function addUsuallyFault() {
    var opType = 403;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }

    var add = true;
    var addUsuallyFaultDesc = $("#addUsuallyFaultDesc").val().trim();
    if (isStrEmptyOrUndefined(addUsuallyFaultDesc)) {
        showTip("addUsuallyFaultDescTip", "故障描述不能为空");
        add = false;
    }
    var addSolvePlan = $("#addSolvePlan").val().trim();
    if (isStrEmptyOrUndefined(addSolvePlan)) {
        showTip("addSolvePlanTip", "解决方案不能为空");
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
            SolvePlan: addSolvePlan
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
    var opType = 400;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    $("#updateId").html(id);
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        qId: id
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            if (ret.datas.length > 0) {
                $("#updateUsuallyFaultDesc").val(ret.datas[0].UsuallyFaultDesc);
                $("#updateSolvePlan").val(ret.datas[0].SolvePlan);
            }
            hideClassTip('adt');
            $("#updateUsuallyFaultModel").modal("show");
        });
}

function updateUsuallyFault(resolve = null) {
    var opType = 402;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }

    var update = true;
    var updateUsuallyFaultDesc = $("#updateUsuallyFaultDesc").val().trim();
    if (isStrEmptyOrUndefined(updateUsuallyFaultDesc)) {
        showTip($("#updateUsuallyFaultDescTip"), "故障描述不能为空");
        update = false;
    }
    var updateSolvePlan = $("#updateSolvePlan").val().trim();
    if (isStrEmptyOrUndefined(updateSolvePlan)) {
        showTip($("#updateSolvePlanTip"), "解决方案不能为空");
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
            SolvePlan: updateSolvePlan
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

function getFaultTypeList(resolve = null) {
    var opType = 406;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    $("#faultTypeList").empty();
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (resolve != null) {
                resolve('success');
            }
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            faultData = ret.datas;
            var html = '<div class="btn-group">' +
                '<button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >' +
                '<button type = "button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                '   <span class="caret"></span>' +
                '   <span class="sr-only">Toggle Dropdown</span>' +
                '</button>' +
                '<ul class="dropdown-menu" role="menu" style="cursor:pointer">{0}{1}' +
                '</ul>' +
                '</div>';

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }

            var rDesc = function (d, type, row, meta) {
                var data = d.FaultDescription;
                return `<span title = "${data}" onclick = "showAllContent('${escape(data)}', '故障类型描述')">${data.length > tdShowLength ? data.substring(0, tdShowLength) + "..." : data}</span>`;
            }
            var op = function (data, type, row) {
                var updateLi = '<li><a onclick="showUpdateFaultTypeModel({0})">修改</a></li>'.format(data.Id);
                var deleteLi = '<li><a onclick="deleteFaultType({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.FaultTypeName));
                return html.format(permissionList[408].have ? updateLi : "", permissionList[411].have ? deleteLi : "");;
            }

            var columns = [
                { "data": null, "title": "序号", "render": order },
                { "data": "Id", "title": "Id", "bVisible": false },
                { "data": "FaultTypeName", "title": "故障类型" },
                { "data": null, "title": "故障类型描述", "render": rDesc }
            ];

            if (permissionList[408].have || permissionList[411].have) {
                columns.push({ "data": null, "title": "操作", "render": op, "orderable": false });
            };

            $("#faultTypeList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rtip',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [10, 20, 30], //更改显示记录数选项  
                    "iDisplayLength": 10, //默认显示的记录数
                    "columns": columns
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

function showFaultTypeDetailModel(id, desc = "") {
    var opType = 406;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    desc = unescape(desc);
    $("#faultTypeDetail1Div").addClass("hidden");
    if (!isStrEmptyOrUndefined(desc)) {
        $("#faultTypeDetail1Div").removeClass("hidden");
        $("#faultTypeDetail1").html(desc);
    }

    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        qId: id,
        menu: true
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
    if (!permissionList[411].have) {
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
    if (!permissionList[opType].have) {
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
    var opType = 406;
    if (!permissionList[opType].have) {
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
    if (!permissionList[opType].have) {
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

                    var func1 = new Promise(function (resolve, reject) {
                        getFaultTypeList(resolve);
                    });

                    Promise.all([func1])
                        .then((result) => {
                            getFaultDeviceList(0);
                            getRepairRecordList(false, 0);
                        });
                }
            });
    }
    showConfirm("修改", doSth);
}

var maintainers = null;
function showMaintainerModel(cover = 1, show = true) {
    var opType = 430;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    maintainers = [];
    choseMaintainer = [];
    $("#maintainerList").empty();
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        menu: true
    });

    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            for (var i = 0; i < ret.datas.length; i++) {
                var d = ret.datas[i];
                maintainers[d.Id] = d;
            }
            var chose = function (data, type, row, meta) {
                var xh = meta.row + 1;
                return `<input type="checkbox" class="icb_minimal chose" value="${xh}" id="${data}">`;
            }
            var order = function (data, type, row, meta) {
                return meta.row + 1;
            }

            var phone = function (data, type, row, meta) {
                var xh = meta.row + 1;
                return `<span class="chose1" id="userPhone1${xh}">${data}</span >
                        <input class="chose2 hidden form-control text-center" old="${data}" id="userPhone2${xh}" onkeyup="onInput(this, 11, 0)" onblur="onInputEnd(this)" maxlength="11" onchange="changeMaintainer(this, 'Phone')">`;
            }
            var rRemark = function (data, type, row, meta) {
                var xh = meta.row + 1;
                return `<span class="chose1" title="${data}" id ="userRemark1${xh}" onclick = "showAllContent('${escape(data)}')">${data.length > tdShowLength ? data.substring(0, tdShowLength) + "..." : data}</span>
                        <input class="chose2 hidden form-control" style="width: 100%;" old="${data}" id ="userRemark2${xh}" onchange="changeMaintainer(this, 'Remark')">`;
            }

            var columns = [
                { "data": "Id", "title": "序号", "render": order, "sWidth": "80px" },
                { "data": "Name", "title": "姓名", "sWidth": "120px" },
                { "data": "Phone", "title": "手机号", "render": phone, "sWidth": "130px" },
                { "data": "Remark", "title": "备注", "render": rRemark }
            ];
            if (permissionList[431].have || permissionList[433].have) {
                columns.unshift({ "data": "Id", "title": "选择", "render": chose, "sWidth": "80px", "orderable": false });
            }
            var excelColumns = [0, 1, 2, 3, 4];
            var titleColumns = [4];
            $("#maintainerList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"B><"pull-right"f>rtip',
                    buttons: [
                        {
                            extend: 'excel',
                            text: '导出Excel',
                            className: 'btn-primary btn-sm', //按钮的class样式
                            exportOptions: {
                                columns: excelColumns,
                                format: {
                                    // format有三个子标签，header，body和foot
                                    body: function (data, row, column, node) {
                                        //操作需要导出excel的数据格式                        
                                        if (titleColumns.indexOf(column) > -1) {
                                            var a = $(node).find("span").attr("title");
                                            if (a != null) {
                                                return "\u200C" + unescape(a);
                                            }
                                        }
                                        return "\u200C" + node.textContent;
                                    }
                                }
                            }
                        }
                    ],
                    //"pagingType": "input",
                    //"serverSide": true,
                    "bAutoWidth": false,
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aaSorting": [[1, "asc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": columns,
                    "createdRow": function (row, data, index) {
                    },
                    "drawCallback": function (settings, json) {
                        $(this).find('.icb_minimal').iCheck({
                            labelHover: false,
                            cursor: true,
                            checkboxClass: 'icheckbox_minimal-blue',
                            radioClass: 'iradio_minimal-blue',
                            increaseArea: '20%'
                        });

                        $(this).find('.chose').on('ifChanged', function () {
                            var tr = $(this).parents("tr:first");
                            var v = $(this).attr("value");
                            var id = $(this).attr("id");
                            if ($(this).is(":checked")) {
                                tr.find(".chose1").addClass("hidden");
                                tr.find(".chose2").removeClass("hidden");
                                $("#userPhone2" + v).val($("#userPhone2" + v).attr("old"));
                                $("#userRemark2" + v).val($("#userRemark2" + v).attr("old"));
                                choseMaintainer[id] = {
                                    Id: id,
                                    Phone: $("#userPhone2" + v).val(),
                                    Remark: $("#userRemark2" + v).val()
                                }
                            } else {
                                tr.find(".chose1").removeClass("hidden");
                                tr.find(".chose2").addClass("hidden");
                                choseMaintainer = removeArrayObj(choseMaintainer, id);
                            }
                        });
                    }
                });
            if (show)
                $('#maintainerModel').modal('show');
        }, cover);
}

function changeMaintainer(ele, type) {
    var tr = $(ele).parents("tr:first");
    var v = $(tr).find(".chose").attr("value");
    var id = $(tr).find(".chose").attr("id");
    if ($("#" + id).is(":checked")) {
        if (choseMaintainer[id]) {
            choseMaintainer[id][type] = $(`#user${type}2${v}`).val();
        } else {
            choseMaintainer[id] = {
                Id: id,
                Phone: $("#userPhone2" + v).val(),
                Remark: $("#userRemark2" + v).val()
            }
        }
    }
}

var addMax = 0;
var addMaxV = 0;
//重置
function initList() {
    $("#addList").empty();
    addMax = addMaxV = 0;
}

var choseMaintainer = null;
var users = null;
function showAddMaintainerModel(cover = 1) {
    initList();
    $("#addOneBtn").attr("disabled", "disabled");
    $("#addMaintainerBtn").attr("disabled", "disabled");
    ajaxGet("/AccountManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            $("#addOneBtn").removeAttr("disabled");
            $("#addMaintainerBtn").removeAttr("disabled");
            users = ret.datas;
            $('#addMaintainerModel').modal('show');

        }, cover);
}

//添加一行
function addOne() {
    //increaseList
    addMax++;
    addMaxV++;
    var tr =
        (`<tr id="add{0}" value="{0}" xh="{1}">
            <td style="vertical-align: addherit;" id="addXh{0}">{1}</td>
            <td><select class="ms2 form-control" id="addUser{0}"></select></td>
            <td><input class="form-control" type="tel" id="addPhone{0}" onkeyup="onInput(this, 11, 0)" onblur="onInputEnd(this)" maxlength="11"></td>
            <td><input class="form-control" id="addRk{0}" maxlength="100"></td>
            <td><button type="button" class="btn btn-danger btn-sm" onclick="delOne({0})"><i class="fa fa-minus"></i></button></td>
        </tr>`).format(addMax, addMaxV);
    $("#addList").append(tr);
    var xh = addMax;
    var selector = "#addUser" + xh;
    $(selector).empty();
    if (users && users.length > 0) {
        var html = "";
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            html += `<option value="${user.account}" title="${user.account}">${user.name}</option>`;
        }
        $(selector).append(html);
        $("#addPhone" + xh).val(users[0].phone);
        $(selector).on('select2:select', function () {
            var acc = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            $("#addPhone" + xh).val('');
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (acc == user.account) {
                    $("#addPhone" + xh).val(user.phone);
                    break;
                }
            }
        });
    }

    selector = "#add" + xh;
    $(selector).find(".ms2").css("width", "100%");
    $(selector).find(".ms2").select2({
        width: "120px"
    });
    $('#addTable').scrollTop($('#addTable')[0].scrollHeight);
}

//删除一行
function delOne(id) {
    $("#addList").find(`tr[value=${id}]:first`).remove();
    addMaxV--;
    var o = 1;
    var child = $("#addList tr");
    for (var i = 0; i < child.length; i++) {
        $(child[i]).attr("xh", o);
        var v = $(child[i]).attr("value");
        $("#addXh" + v).html(o);
        o++;
    }
}

//添加
function addMaintainer() {
    var opType = 432;
    var child = $("#addList tr");
    var list = new Array();
    for (var i = 0; i < child.length; i++) {
        var v = $(child[i]).attr("value");
        var xh = $(child[i]).attr("xh");
        var name = $("#addUser" + v).find("option:checked").text();
        var acc = $("#addUser" + v).find("option:checked").val();
        var phone = $("#addPhone" + v).val();
        var remark = $("#addRk" + v).val();

        if (isStrEmptyOrUndefined(name)) {
            layer.msg("请输入姓名");
            return;
        }
        if (isStrEmptyOrUndefined(acc)) {
            return;
        }
        if (isStrEmptyOrUndefined(phone)) {
            layer.msg("请输入手机号");
            return;
        } else if (!isPhone(phone)) {
            layer.msg("手机号错误");
            return;
        }

        list.push({
            Name: name,
            Account: acc,
            Phone: phone,
            Remark: remark
        });
    }
    if (list.length <= 0)
        return;

    var addMaintainerBtnTime = null;
    var doSth = function () {
        $("#addMaintainerBtn").attr("disabled", "disabled");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                if (addMaintainerBtnTime)
                    clearTimeout(addMaintainerBtnTime);
                $("#addMaintainerBtn").removeAttr("disabled");
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    showMaintainerModel(0, false);
                    $("#addMaintainerModel").modal("hide");
                }
            });
        addMaintainerBtnTime = setTimeout(function () {
            $("#addMaintainerBtn").removeAttr("disabled");
        }, 5000);
    }
    showConfirm("添加", doSth);
}

//修改维修工信息
function updateMaintainer() {
    var opType = 431;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }

    if (!choseMaintainer || choseMaintainer.length <= 0) {
        return;
    }
    var list = [];
    for (var key in choseMaintainer) {
        var maintainer = choseMaintainer[key];
        if (maintainers && maintainers[key] && (maintainers[key].Phone != maintainer.Phone || maintainers[key].Remark != maintainer.Remark)) {
            if (isStrEmptyOrUndefined(maintainer.Phone)) {
                layer.msg("请输入手机号");
                return;
            } else if (!isPhone(maintainer.Phone)) {
                layer.msg("手机号错误");
                return;
            }
            maintainer.Account = maintainers[key].Account;
            maintainer.Name = maintainers[key].Name;
            list.push(maintainer);
        }
    }
    if (!list.length) {
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        var updateMaintainerTime = null;
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (updateMaintainerTime)
                    clearTimeout(updateMaintainerTime);
                $("#updateMaintainerBtn").removeAttr("disabled");
                if (ret.errno == 0) {
                    showMaintainerModel(0, false);
                }
            });
        updateMaintainerTime = setTimeout(function () {
            $("#delMaintainerBtn").removeAttr("disabled");
        }, 5000);
    }
    showConfirm("保存", doSth);
}

//删除配置
function delMaintainer() {
    var opType = 433;
    if (!permissionList[opType].have) {
        layer.msg('没有权限');
        return;
    }

    if (!choseMaintainer || choseMaintainer.length <= 0) {
        return;
    }

    var names = [];
    var delMaintainers = [];
    if (choseMaintainer && choseMaintainer.length > 0) {
        for (var key in choseMaintainer) {
            if (maintainers && maintainers[key]) {
                delMaintainers.push(key);
            }
        }
        for (var i = 0; i < delMaintainers.length; i++) {
            var key = delMaintainers[i];
            if (maintainers && maintainers[key]) {
                names.push(maintainers[key].Name);
            }
        }

    }
    var doSth = function () {
        $("#delMaintainerBtn").attr("disabled", "disabled");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            ids: delMaintainers
        });
        var delMaintainerBtnTime = null;
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (delMaintainerBtnTime)
                    clearTimeout(delMaintainerBtnTime);
                $("#delMaintainerBtn").removeAttr("disabled");
                if (ret.errno == 0) {
                    showMaintainerModel(0, false);
                }
            });
        delMaintainerBtnTime = setTimeout(function () {
            $("#delMaintainerBtn").removeAttr("disabled");
        }, 5000);
    }
    showConfirm("删除维修工：" + names.join(","), doSth);
}
