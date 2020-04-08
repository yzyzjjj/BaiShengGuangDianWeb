﻿var permissionList = [];
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
    permissionList[415] = { uIds: ["addServiceLogBtn"] };
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
    permissionList[444] = { uIds: [] };
    permissionList[445] = { uIds: [] };
    permissionList[446] = { uIds: [] };
    permissionList[447] = { uIds: [] };
    permissionList = checkPermissionUi(permissionList);
    var li = $("#tabs li:not(.hidden)").first();
    if (li) {
        li.addClass("active");
        $(li.find("a").attr("href")).addClass("active");
    }
    $(".ms2").select2();
    $("#serLogFaultType").on("change", function () {
        var v = $(this).val();
        $("#serLogFaultDesc").val(_faultTypeData[v].FaultDescription);
    });
    getWorkerSelect();
    getFaultTypeSelect();
    var nowMonth = getMonthScope();
    $("#faultSTime,#serviceLogSTime,#delFSTime,#delRepairSTime,#statSTime").val(nowMonth.start).datepicker('update');
    $("#faultETime,#serviceLogETime,#delFETime,#delRepairETime,#statETime").val(nowMonth.end).datepicker('update');
    $('#faultDevicePro').on('change', function () {
        var v = $(this).val();
        var parentEl = '#faultQuery';
        var attrEl = 'faultDeviceAttr';
        var selectEl = '#faultDeviceAttrSelect';
        switch (v) {
            case 'code':
                setFaultDeviceGet(parentEl, attrEl, '#faultDeviceInput');
                break;
            case 'faultType':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _faultType);
                break;
            case 'priority':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _priority);
                break;
            case 'grade':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _grade);
                break;
            case 'state':
                setFaultDeviceGet(parentEl, attrEl, selectEl, '<option value="0">未确认</option><option value="1">已确认</option><option value="2">维修中</option>');
                break;
            case 'maintainer':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _worker);
                break;
            case 'solveTime':
                $('#solveSTime,#solveETime').removeAttr("readonly");
                setFaultDeviceGet(parentEl, attrEl, '#faultDeviceTime');
                break;
        }
    });
    $('#serviceLogPro').on('change', function () {
        var v = $(this).val();
        var parentEl = '#serviceLogQuery';
        var attrEl = 'serviceAttr';
        var selectEl = '#serviceAttrSelect';
        switch (v) {
            case 'code':
                setFaultDeviceGet(parentEl, attrEl, '#serviceInput');
                break;
            case 'faultType':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _faultType);
                break;
            case 'priority':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _priority);
                break;
            case 'grade':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _grade);
                break;
            case 'maintainer':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _worker);
                break;
            default:
                $('#serSTime,#serETime').removeAttr("readonly");
                setFaultDeviceGet(parentEl, attrEl, '#solveTime');
        }
    });
    $('#delFPro').on('change', function () {
        var v = $(this).val();
        var parentEl = '#delFQuery';
        var attrEl = 'delFAttr';
        var selectEl = '#delFAttrSelect';
        switch (v) {
            case 'code':
                setFaultDeviceGet(parentEl, attrEl, '#delFInput');
                break;
            case 'faultType':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _faultType);
                break;
            case 'priority':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _priority);
                break;
            case 'grade':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _grade);
                break;
            case 'state':
                setFaultDeviceGet(parentEl, attrEl, selectEl, '<option value="0">未确认</option><option value="1">已确认</option><option value="2">维修中</option>');
                break;
            case 'maintainer':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _worker);
                break;
            case 'solveTime':
                $('#delFSolveSTime,#delFSolveETime').removeAttr("readonly");
                setFaultDeviceGet(parentEl, attrEl, '#delFTime');
                break;
        }
    });
    $('#delRepairPro').on('change', function () {
        var v = $(this).val();
        var parentEl = '#delRepairQuery';
        var attrEl = 'delRepairAttr';
        var selectEl = '#delRepairAttrSelect';
        switch (v) {
            case 'code':
                setFaultDeviceGet(parentEl, attrEl, '#delRepairInput');
                break;
            case 'faultType':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _faultType);
                break;
            case 'priority':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _priority);
                break;
            case 'grade':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _grade);
                break;
            case 'maintainer':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _worker);
                break;
            default:
                $('#delRepSTime,#delRepETime').removeAttr("readonly");
                setFaultDeviceGet(parentEl, attrEl, '#delRepairTime');
        }
    });
    getFaultDeviceList();
    setTimeout(() => getServiceLogList(0), 2000);
    $("#batchAssignList").on('change', '.serviceName', function() {
        if ($(this).val() == '同上') {
            $(this).val($(this).parents('tr').prev().find('.serviceName').val());
        }
    });
    $("#serLogDevSite").select2({
        allowClear: true,
        placeholder: "请选择(可不选)"
    });
    $("#serLogWorkshop").on("change", function (e) {
        setWorkSiteSelect();
    });
}

//查询条件
function setFaultDeviceGet(parentEl, attrEl, el, ops) {
    $(`${parentEl} .${attrEl}`).addClass('hidden');
    $(el).removeClass('hidden');
    if (ops) {
        $(`#${attrEl}`).empty();
        $(`#${attrEl}`).append(`<option value="-1">所有</option>${ops}`);
    }
}

//优先级
var _priority = '<option value="0">低</option><option value="1">中</option><option value="2">高</option>';

//故障等级
var _grade = '<option value="0">小修</option><option value="1">大修</option>';

var _worker = null;
//维修工选项
function getWorkerSelect() {
    var opType = 430;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        menu: true
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#designateName,#servicePro').empty();
        var list = ret.datas;
        var op = '<option value="{0}" wname="{1}">{1}</option>';
        _worker = '<option value="0" wname="0">未指派</option>';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            _worker += op.format(d.Account, d.Name);
        }
        $('#designateName,#servicePro').append(_worker);
    }, 0);
}

var _faultType = null;
var _faultTypeData = null;
//故障类型选项
function getFaultTypeSelect() {
    var opType = 406;
    if (!permissionList[opType].have) {
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
        $('#serviceFaultType').empty();
        var list = ret.datas;
        var op = '<option value="{0}">{1}</option>';
        _faultType = '';
        _faultTypeData = {};
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            _faultTypeData[d.Id] = d;
            _faultType += op.format(d.Id, d.FaultTypeName);
        }
        $('#serviceFaultType').append(_faultType);
    }, 0);
} 

//列表参数设置
function setTable() {
    return {
        isEnable: d => `<input type="checkbox" class="icb_minimal isEnable" value=${d.Id} fName=${d.DeviceCode}>`,
        order: (a, b, c, d) => d.row + 1,
        grade: d => d ? '<span class="text-red">大修</span>' : '小修',
        setTime: d => d == '0001-01-01 00:00:00' ? '' : d.slice(0, d.lastIndexOf(':')),
        rState: d => d.State == 0 ? '<span class="text-red">未确认</span>' : d.State == 1 ? '<span class="text-warning">已确认</span>' : '<span class="text-success">维修中</span>',
        priority: d => d.Priority == 0 ? '低' : d.Priority == 1 ? '<span class="text-warning">中</span>' : '<span class="text-red">高</span>',
        remark: d => d == '' || d.length < tdShowLength ? d : `<span title = "${d}" onclick="showAllContent('${escape(d)}', '维修备注')">${d.substring(0, tdShowLength) + "..."}</span>`,
        rDesc: d => {
            var data = d.FaultDescription;
            return `<span title = "${data}" onclick = "showFaultTypeDetailModel(${d.FaultTypeId}, '${escape(data.trim())}')">${data.length > tdShowLength ? data.substring(0, tdShowLength) : data}...</span>`;
        },
        imgBtn: d => {
            var op = `<span class="glyphicon glyphicon-{0}" aria-hidden="true" style="color:{1};font-size:25px;vertical-align:middle;margin-right:5px"></span>
                      <button type="button" class="btn btn-info btn-sm" style="vertical-align:middle" onclick="showImgModel(${d.Id},\'${d.FaultTypeName}\',\'${d.ImageList}\')">查看</button>`;
            return d.ImageList.length ? op.format('ok', 'green') : op.format('remove', 'red');
        },
        serIsEnable: d => {
            var text = `机台号-${d.DeviceCode}：${d.FaultTypeName}`;
            return `<input type="checkbox" class="icb_minimal isEnable" value=${d.Id} fName=${text}>`;
        },
        upServiceLog: (isLook, id) => `<button type="button" class="btn btn-primary btn-sm" onclick="showServiceLogModal(${id},${isLook})">查看</button>`,
        serviceName: d => d == '' ? '未指派' : d,
        detailBtn: d => `<button type="button" class="btn btn-info btn-sm" onclick="showLogDetailModel(${d.FaultTypeId},\'${d.DeviceCode}\',\'${d.Proposer}\',\'${d.FaultTime}\',\'${d.FaultDescription}\',${d.Priority},${d.Grade})">查看</button>`
    }
}

var _faultDevData = null;
//故障设备查询
function getFaultDeviceList() {
    var opType = 417;
    if (!permissionList[opType].have) {
        return;
    }
    _faultDevData = {};
    _faultDevData.Id = [];
    _faultDevData.Name = [];
    _faultDevData.data = {};
    var startTime = $('#faultSTime').val();
    var endTime = $('#faultETime').val();
    if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
        layer.msg('请选择故障时间');
        return;
    }
    if (comTimeDay(startTime, endTime)) {
        return;
    }
    startTime = `${startTime} 00:00:00`;
    endTime = `${endTime} 23:59:59`;
    var condition = $('#faultDeviceCond').val();
    var list = { startTime, endTime, condition }
    var faultDevicePro = $('#faultDevicePro').val();
    var faultDeviceAttr;
    switch (faultDevicePro) {
        case 'code':
            faultDeviceAttr = $('#faultDeviceInput').val().trim();
            if (!isStrEmptyOrUndefined(faultDeviceAttr)) {
                list[faultDevicePro] = faultDeviceAttr;
            }
            break;
        case 'solveTime':
            var solveSTime = $('#solveSTime').val();
            if (!isStrEmptyOrUndefined(solveSTime)) {
                list.eStartTime = solveSTime;
            }
            var solveETime = $('#solveETime').val();
            if (!isStrEmptyOrUndefined(solveETime)) {
                list.eEndTime = solveETime;
            }
            break;
        default:
            faultDeviceAttr = $('#faultDeviceAttr').val();
            if (!isStrEmptyOrUndefined(faultDeviceAttr)) {
                list[faultDevicePro] = faultDeviceAttr;
            }
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            _faultDevData.data[d.Id] = d;
        }
        //删除
        var per423 = permissionList[423].have;
        //维修
        var per420 = permissionList[420].have;
        //指派
        var per445 = permissionList[445].have;
        //批量指派
        var per446 = permissionList[446].have;
        per423 ? $('#delChangeBtn').removeClass('hidden') : $('#delChangeBtn').addClass('hidden');
        per446 ? $('#showBatchAssignModalBtn').removeClass('hidden') : $('#showBatchAssignModalBtn').addClass('hidden');
        var service = function (d) {
            var state = d.State;
            var btn = '<button type="button" class="btn btn-{0} btn-xs" onclick="{1}">{2}</button>';
            var attr = '', text = '', click = '';
            switch (state) {
                case 0:
                    attr = 'danger';
                    text = '确认故障';
                    click = `showConfirmModel(${d.Id}, 0,\'${d.EstimatedTime}\',\'${d.Remark}\')`;
                    break;
                case 1:
                    attr = 'info';
                    text = '开始维修';
                    click = `showConfirmModel(${d.Id}, 1,\'${d.EstimatedTime}\',\'${d.Remark}\')`;
                    break;
                case 2:
                    attr = 'success';
                    text = '维修完成';
                    click = `showServiceModel(${d.Id},\'${d.Maintainer}\',\'${d.EstimatedTime}\',${d.FaultTypeId})`;
                    break;
            }
            return btn.format(attr, click, text);
        }
        var serviceName = function (d) {
            var name = d.Name == '' ? '未指派' : d.Name;
            return per445 ? `<a href="javascript:showDesignateModal(${d.Id},${d.Priority},\'${d.Maintainer ? d.Maintainer : 0}\',${d.Grade})" style="padding:3px" class="designate"><i class="glyphicon glyphicon-hand-right"></i><span class="text-black">${name}</span></a>` : name;
        }
        $("#faultDeviceList")
            .DataTable({
                dom: '<"pull-left"l><"pull-right"f>rtip',
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": oLanguage,
                "data": rData,
                "aaSorting": [[per423 ? 1 : 0, "asc"]],
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "", "render": setTable().isEnable, "visible": per423, "orderable": !per423 },
                    { "data": null, "title": "序号", "render": setTable().order },
                    { "data": "DeviceCode", "title": "机台号" },
                    { "data": "FaultTime", "title": "故障时间", "render": setTable().setTime },
                    { "data": null, "title": "状态", "render": setTable().rState },
                    { "data": null, "title": "优先级", "render": setTable().priority },
                    { "data": "Grade", "title": "故障等级", "render": setTable().grade },
                    { "data": null, "title": "维修", "render": service, "visible": per420 },
                    { "data": null, "title": "指派给", "render": serviceName },
                    { "data": "Phone", "title": "联系方式" },
                    { "data": "EstimatedTime", "title": "预计解决时间", "render": setTable().setTime },
                    { "data": "Remark", "title": "维修备注", "render": setTable().remark },
                    { "data": "Proposer", "title": "报修人" },
                    { "data": "FaultTypeName", "title": "故障类型" },
                    { "data": null, "title": "故障描述", "render": setTable().rDesc },
                    { "data": null, "title": "故障详情", "render": setTable().detailBtn }
                ],
                "drawCallback": function (settings, json) {
                    if (per423) {
                        $(this).find('.isEnable').iCheck({
                            handle: 'checkbox',
                            checkboxClass: 'icheckbox_minimal-blue',
                            increaseArea: '20%'
                        }).on('ifChanged', function () {
                            var v = $(this).val();
                            var name = $(this).attr('fName');
                            if ($(this).is(':checked')) {
                                _faultDevData.Id.push(v);
                                _faultDevData.Name.push(name);
                            } else {
                                _faultDevData.Id.splice(_faultDevData.Id.indexOf(v), 1);
                                _faultDevData.Name.splice(_faultDevData.Name.indexOf(name), 1);
                            }
                        });
                    }
                }
            });
    });
}

var _batchAssignTable = null;
//批量指派弹窗
function showBatchAssignModal() {
    var faultIds = _faultDevData.Id;
    var len = faultIds.length;
    if (!len) {
        layer.msg('请选择需要指派的故障设备');
        return;
    }
    var rData = [];
    for (var i = 0; i < len; i++) {
        rData.push(_faultDevData.data[faultIds[i]]);
    }
    var priority = function () {
        return `<div style="width:100%;min-width:80px;margin:auto"><select class="form-control priority" style="width: 100%">${_priority}</select></div>`;
    }
    var grade = function () {
        return `<div style="width:100%;min-width:80px;margin:auto"><select class="form-control grade" style="width: 100%">${_grade}</select></div>`;
    }
    var serviceName = function (a,b,c,d) {
        return `<div style="width:100%;min-width:120px;margin:auto"><select class="form-control serviceName" style="width: 100%">${d.row == 0 ? '' : '<option value="同上">同上</option>'}${_worker}</select></div>`;
    }
    _batchAssignTable = $("#batchAssignList")
        .DataTable({
            dom: '<"pull-left"l><"pull-right"f>rtip',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": rData,
            "aaSorting": [[0, "asc"]],
            "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 20, //默认显示的记录数
            "columns": [
                { "data": null, "title": "序号", "render": setTable().order },
                { "data": "DeviceCode", "title": "机台号" },
                { "data": "FaultTime", "title": "故障时间", "render": setTable().setTime },
                { "data": null, "title": "状态", "render": setTable().rState },
                { "data": null, "title": "优先级", "render": priority },
                { "data": null, "title": "故障等级", "render": grade },
                { "data": null, "title": "指派给", "render": serviceName },
                { "data": "Phone", "title": "联系方式" },
                { "data": "Proposer", "title": "报修人" },
                { "data": "FaultTypeName", "title": "故障类型" },
                { "data": null, "title": "故障描述", "render": setTable().rDesc },
                { "data": null, "title": "故障详情", "render": setTable().detailBtn }
            ],
            "createdRow": function (row, d,) {
                var pri = d.Priority;
                var main = d.Maintainer;
                var gra = d.Grade;
                if (isStrEmptyOrUndefined(main)) {
                    main = 0;
                }
                $(row).find('.priority').val(pri).end().find('.grade').val(gra).end().find('.serviceName').val(main);
            }
        });
    $('#showBatchAssignModal').modal('show');
}

//批量指派
function batchAssign() {
    var opType = 446;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    var trsData = _batchAssignTable.context[0].aoData;
    var trs = trsData.length;
    var list = [];
    for (var i = 0; i < trs; i++) {
        var tr = trsData[i].nTr;
        var priority = $(tr).find('.priority').val();
        var grade = $(tr).find('.grade').val();
        var serviceName = $(tr).find('.serviceName').val();
        list.push({
            Id: _faultDevData.Id[i] >> 0,
            Maintainer: serviceName,
            Priority: priority >> 0,
            Grade: grade >> 0
        });
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            $('#showBatchAssignModal').modal('hide');
            getFaultDeviceList();
        }
    });
}

//确认故障/开始维修弹窗
function showConfirmModel(id, state, time, remark) {
    $('#confirmTitle').text(state ? '开始维修' : '确认故障');
    if (state) {
        $('#confirmTitle').text('开始维修');
        $('#confirmFaultBtn').addClass('hidden');
        $('#confirmStartBtn').val(id);
    } else {
        $('#confirmTitle').text('确认故障');
        $('#confirmFaultBtn').removeClass('hidden');
        $('#confirmFaultBtn,#confirmStartBtn').val(id);
    }
    time = time == '0001-01-01 00:00:00' ? getDate() : time.slice(0, time.indexOf(' '));
    $('#confirmTime').val(time).datepicker('update');
    $("#confirmHms").timepicker('setTime', getTime());
    $('#confirmDesc').val(remark);
    $('#showConfirmModel').modal('show');
}

//确认故障/开始维修
function confirmFault(state) {
    var opType = 444;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    var id = $(this).val();
    var confirmTime = $('#confirmTime').val();
    var confirmHms = $('#confirmHms').val();
    if (isStrEmptyOrUndefined(confirmTime) || isStrEmptyOrUndefined(confirmHms)) {
        layer.msg("请选择预计解决时间");
        return;
    }
    var time = `${confirmTime} ${confirmHms}`;
    var remark = $('#confirmDesc').val();
    var data = {};
    data.opType = opType;
    data.opData = JSON.stringify([{
        Id: id,
        EstimatedTime: time,
        Remark: remark,
        State: state
    }]);
    ajaxPost("/Relay/Post", data, function (ret) {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            $('#showConfirmModel').modal('hide');
            getFaultDeviceList();
        }
    });
}

//维修完成弹窗
function showServiceModel(id, maintainer, time, faultTypeId) {
    $('#serviceBtn').val(id);
    $('#servicePro').val(maintainer).trigger('change');
    time = time == '0001-01-01 00:00:00' ? getDate() : time.slice(0, time.indexOf(' '));
    $('#serviceTime').val(time).datepicker('update');
    $("#serviceHms").timepicker('setTime', getTime());
    $('#serviceFaultType').val(faultTypeId).trigger('change');
    $('#showServiceModel').modal('show');
}

//维修完成
function service() {
    var opType = 444;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    var id = $(this).val();
    var maintainer = $('#servicePro option:selected').attr('wname');
    if (isStrEmptyOrUndefined(maintainer)) {
        layer.msg("请选择解决人");
        return;
    }
    var serviceTime = $('#serviceTime').val();
    var serviceHms = $('#serviceHms').val();
    if (isStrEmptyOrUndefined(serviceTime) || isStrEmptyOrUndefined(serviceHms)) {
        layer.msg("请选择解决时间");
        return;
    }
    var time = `${serviceTime} ${serviceHms}`;
    var faultTypeId = $('#serviceFaultType').val();
    if (isStrEmptyOrUndefined(faultTypeId)) {
        layer.msg("请选择故障类型");
        return;
    }
    var solvePlan = $('#serviceDesc').val();
    var data = {};
    data.opType = opType;
    data.opData = JSON.stringify([{
        FaultSolver: maintainer,
        SolveTime: time,
        SolvePlan: solvePlan,
        FaultTypeId1: faultTypeId,
        State: 3,
        Id: id
    }]);
    ajaxPost("/Relay/Post", data, function (ret) {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            $('#showServiceModel').modal('hide');
            getFaultDeviceList();
        }
    });
}

//指派弹窗
function showDesignateModal(id, priority, name, grade) {
    $('#designateBtn').val(id);
    $('#designateName').val(name);
    $('#designatePro').val(priority);
    $('#designateGrade').val(grade);
    $('#showDesignateModal').modal('show');
}

//指派
function designate() {
    var opType = 445;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    var name = $('#designateName').val();
    if (isStrEmptyOrUndefined(name)) {
        layer.msg("请选择指派人");
        return;
    }
    var priority = $('#designatePro').val();
    if (isStrEmptyOrUndefined(priority)) {
        layer.msg("请选择优先级");
        return;
    }

    var grade = $('#designateGrade').val();
    if (isStrEmptyOrUndefined(grade)) {
        layer.msg("请选择故障等级");
        return;
    }
    var id = $(this).val();
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify([{
        Id: id >> 0,
        Maintainer: name,
        Priority: priority >> 0,
        Grade: grade >> 0
    }]);
    ajaxPost("/Relay/Post", data,
        function (ret) {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                $('#showDesignateModal').modal('hide');
                getFaultDeviceList();
            }
        });
}

//故障详情弹窗
function showLogDetailModel(id, deviceCode, proposer, faultTime, faultDescription, priority, grade) {
    var opType = 406;
    if (!permissionList[opType].have) {
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        qId: id,
        menu: true
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var d = ret.datas[0];
        $('#logDevName').text(deviceCode);
        $('#logPerson').text(proposer);
        $('#logFaultTime').text(faultTime);
        $('#logFaultType').text(d.FaultTypeName);
        $('#logFaultTypeDesc').val(d.FaultDescription);
        $('#logFaultSup').val(faultDescription);
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
        $('#logPriority').text(str).css('color', color);
        $('#logGrade').text(grade == 0 ? '小修' : '大修').css('color', grade == 0 ? 'black' : 'red');
        $('#showLogDetailModel').modal('show');
    });
}

//删除故障设备
function delChange() {
    var opType = 423;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    if (!_faultDevData.Id.length) {
        layer.msg("请选择需要删除的数据");
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            ids: _faultDevData.Id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFaultDeviceList();
                }
            });
    }
    showConfirm(`删除以下故障设备：<pre style='color:red'>${_faultDevData.Name.join('<br>')}</pre>`, doSth);
}

var _serviceLogData = null;
var _statisticsParData = null;
//获取维修记录
function getServiceLogList(isLoad, name, sTime, eTime, score) {
    var opType = 412;
    if (!permissionList[opType].have) {
        return;
    }
    var list = null;
    if (name) {
        list = {
            startTime: sTime,
            endTime: eTime,
            condition: 0,
            maintainer: name
        }
        _statisticsParData = { name, sTime, eTime, score };
    } else {
        _serviceLogData = {};
        _serviceLogData.Id = [];
        _serviceLogData.Name = [];
        var startTime = $('#serviceLogSTime').val();
        var endTime = $('#serviceLogETime').val();
        if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
            layer.msg('请选择解决时间');
            return;
        }
        if (comTimeDay(startTime, endTime)) {
            return;
        }
        startTime = `${startTime} 00:00:00`;
        endTime = `${endTime} 23:59:59`;
        var condition = $('#serviceLogCond').val();
        list = { startTime, endTime, condition }
        var serviceLogPro = $('#serviceLogPro').val();
        var serviceAttr;
        switch (serviceLogPro) {
            case 'code':
                serviceAttr = $('#serviceInput').val().trim();
                if (!isStrEmptyOrUndefined(serviceAttr)) {
                    list[serviceLogPro] = serviceAttr;
                }
                break;
            case 'faultTime':
                var serSTime = $('#serSTime').val();
                if (!isStrEmptyOrUndefined(serSTime)) {
                    list.fStartTime = serSTime;
                }
                var serETime = $('#serETime').val();
                if (!isStrEmptyOrUndefined(serETime)) {
                    list.fEndTime = serETime;
                }
                break;
            case 'solveTime':
                var serSTime1 = $('#serSTime').val();
                if (!isStrEmptyOrUndefined(serSTime1)) {
                    list.eStartTime = serSTime1;
                }
                var serETime1 = $('#serETime').val();
                if (!isStrEmptyOrUndefined(serETime1)) {
                    list.eEndTime = serETime1;
                }
                break;
            default:
                serviceAttr = $('#serviceAttr').val();
                if (!isStrEmptyOrUndefined(serviceAttr)) {
                    list[serviceLogPro] = serviceAttr;
                }
        }
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        //删除
        var per416 = permissionList[416].have;
        per416 ? $('#delServiceLogBtn').removeClass('hidden') : $('#delServiceLogBtn').addClass('hidden');
        var excelColumns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        var titleColumns = [6, 9];
        var el = name ? $('#statisticsDetailList') : $("#repairRecordList");
        el.DataTable({
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
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": ret.datas,
            "aaSorting": [[per416 && !name ? 1 : 0, "asc"]],
            "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 20, //默认显示的记录数
            "columns": [
                { "data": null, "title": "", "render": setTable().serIsEnable, "visible": per416 && !name, "orderable": !per416 && name },
                { "data": null, "title": "序号", "render": setTable().order },
                { "data": "DeviceCode", "title": "机台号" },
                { "data": "FaultTime", "title": "故障时间", "render": setTable().setTime },
                { "data": "SolveTime", "title": "解决时间", "sClass": "text-primary", "render": setTable().setTime },
                { "data": "CostTime", "title": "用时", "sClass": "text-primary" },
                { "data": null, "title": "优先级", "render": setTable().priority },
                { "data": "Grade", "title": "故障等级", "render": setTable().grade },
                { "data": "Score", "title": "评分", "sClass": "text-primary" },
                { "data": "FaultSolver", "title": "解决人" },
                { "data": "Name", "title": "指派给", "render": setTable().serviceName},
                { "data": "EstimatedTime", "title": "预计解决时间", "render": setTable().setTime },
                { "data": "Remark", "title": "维修备注", "render": setTable().remark },
                { "data": "Proposer", "title": "报修人" },
                { "data": "FaultTypeName", "title": "故障类型" },
                { "data": null, "title": "故障描述", "render": setTable().rDesc },
                { "data": null, "title": "故障图片", "render": setTable().imgBtn },
                { "data": "Id", "title": "详情", "render": setTable().upServiceLog.bind(null,0) }
            ],
            "drawCallback": function (settings, json) {
                if (per416 && !name) {
                    $(this).find('.isEnable').iCheck({
                        handle: 'checkbox',
                        checkboxClass: 'icheckbox_minimal-blue',
                        increaseArea: '20%'
                    }).on('ifChanged', function () {
                        var v = $(this).val();
                        var name = $(this).attr('fName');
                        if ($(this).is(':checked')) {
                            _serviceLogData.Id.push(v);
                            _serviceLogData.Name.push(name);
                        } else {
                            _serviceLogData.Id.splice(_serviceLogData.Id.indexOf(v), 1);
                            _serviceLogData.Name.splice(_serviceLogData.Name.indexOf(name), 1);
                        }
                    });
                }
            }
        });
        if (name) {
            $('#score').text(score);
            $('#showStatisticsDetailModel').modal('show');
        }
    }, isLoad);
}

//统计弹窗
function showStatisticsModel() {
    getStatisticsList();
    $('#showStatisticsModel').modal('show');
}

//获取统计列表
function getStatisticsList() {
    var opType = 447;
    if (!permissionList[opType].have) {
        return;
    }
    var startTime = $('#statSTime').val();
    var endTime = $('#statETime').val();
    if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
        layer.msg('请选择解决时间');
        return;
    }
    if (comTimeDay(startTime, endTime)) {
        return;
    }
    startTime = `${startTime} 00:00:00`;
    endTime = `${endTime} 23:59:59`;
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({ startTime, endTime });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var order = function (a, b, c, d) {
            return d.row + 1;
        }
        var detail = function (d) {
            return `<button type="button" class="btn btn-primary btn-sm" onclick="getServiceLogList(1,\'${d.Account}\',\'${startTime}\',\'${endTime}\',\'${d.Score}\')">查看</button>`;
        }
        $("#statisticsList")
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
                "columns": [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Name", "title": "维修工" },
                    { "data": "Score", "title": "评分" },
                    { "data": null, "title": "详情", "render": detail }
                ]
            });
    });
}

//故障图片查看
function showImgModel(id, faultType, img) {
    $('#FaultImgName').text(faultType);
    $("#faultImgList").empty();
    if (!isStrEmptyOrUndefined(img)) {
        img = img.split(",");
        var data = {
            type: fileEnum.FaultDevice,
            files: JSON.stringify(img)
        };
        ajaxPost("/Upload/Path", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var imgOps = "";
            for (var i = 0; i < ret.data.length; i++) {
                imgOps += `<div class="col-lg-2 col-md-3 col-sm-4 col-xs-6">
                <div class="thumbnail">
                <img src=${ret.data[i].path} style="height:200px">
                </div>
                </div>`;
            }
            $("#faultImgList").append(imgOps);
        });
    }
    $("#showFaultImgModel").modal('show');
}

//删除维修记录
function delServiceLog() {
    var opType = 416;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    if (!_serviceLogData.Id.length) {
        layer.msg("请选择需要删除的数据");
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            ids: _serviceLogData.Id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getServiceLogList(1);
                }
            });
    }
    showConfirm(`删除以下维修记录：<pre style='color:red'>${_serviceLogData.Name.join('<br>')}</pre>`, doSth);
}

//获取机台号
function getDeviceCode(resolve) {
    var opType = 100;
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
        var list = ret.datas;
        var op = '<option value="{0}">{1}</option>';
        var ops = '';
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            ops += op.format(d.Id, d.Code);
        }
        if (resolve != null) {
            resolve(ops);
        }
    }, 0);
}

//获取车间
function getWorkShop(resolve) {
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
        var list = ret.datas;
        var op = '<option value = "{0}">{0}</option>';
        var ops = '';
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            ops += op.format(d.SiteName);
        }
        if (resolve != null) {
            resolve(ops);
        }
    }, 0);
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
    },0);
}

//车间对应场地
function setWorkSiteSelect() {
    $('#serLogDevSite').empty();
    var workshop = $("#serLogWorkshop").val();
    if (isStrEmptyOrUndefined(workshop)) {
        return;
    }
    var sData = _siteData[workshop];
    var ops = '';
    for (var i = 0, len = sData.length; i < len; i++) {
        var d = sData[i];
        ops += `<option value=${d}>${d}</option>`;
    }
    $('#serLogDevSite').append(ops);
    $("#serLogDevSite").val(0).trigger('change');
}

//添加修改维修记录弹窗
function showServiceLogModal(id, isDel) {
    var opType = id ? isDel ? 425 : 412 : 415;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    $('#serLogFaultSup').prop('disabled', !!id);
    $('#serviceLogTitle').text(id ? '维修记录详情' : '添加维修记录');
    if (id) {
        $('#showServiceLogModal .isText').removeClass('hidden');
        $('#showServiceLogModal .noText').addClass('hidden');
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({ qId: id });
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var d = ret.datas[0];
            $('#serLogCodeText').text(d.DeviceCode);
            $('#serLogProposerText').text(d.Proposer);
            $('#serLogFaultTimeText').text(d.FaultTime);
            $('#serLogFaultTypeText').text(d.FaultTypeName);
            $("#serLogFaultDesc").val(_faultTypeData[d.FaultTypeId].FaultDescription);
            $("#serLogFaultSup").val(d.FaultDescription);
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
            $('#serLogPriorityText').text(str).css('color', color);
            var grade = d.Grade;
            $('#serLogGradeText').text(grade == 0 ? '小修' : '大修').css('color', grade == 0 ? 'black' : 'red');
            $('#serLogMaintainerText').text(d.Name == '' ? '未指派' : d.Name);
            var solveTime = d.SolveTime;
            $("#serLogFaultType1").empty();
            $("#serLogFaultType1").append(_faultType);
            if (isDel) {
                $('#upServiceLogBox .isText').removeClass('hidden');
                $('#upServiceLogBox .noText').addClass('hidden');
                $('#serLogFaultSolverText').text(d.FaultSolver);
                $('#serLogSolveTimeText').text(solveTime == '0001-01-01 00:00:00' ? '' : solveTime.slice(0, solveTime.lastIndexOf(':')));
                var faultType1 = $(`#serLogFaultType1 option[value=${d.FaultTypeId1}]`).text();
                $('#serLogFaultType1Text').text(faultType1);
                $("#serLogSolvePlan").prop('disabled', true);
                $('#updateServiceLogBtn').addClass('hidden');
            } else {
                $('#upServiceLogBox .isText').addClass('hidden');
                $('#upServiceLogBox .noText').removeClass('hidden');
                $("#serLogFaultSolver").empty();
                $("#serLogFaultSolver").append(_worker);
                var faultSolver = $(`#serLogFaultSolver option[wname=${d.FaultSolver}]`).val();
                $('#serLogFaultSolver').val(faultSolver ? faultSolver : 0);
                if (solveTime == '0001-01-01 00:00:00') {
                    $('#serLogSolveDate').val(getDate()).datepicker('update');
                    $("#serLogSolveTime").timepicker('setTime', getTime());
                } else {
                    $('#serLogSolveDate').val(solveTime.split(' ')[0]).datepicker('update');
                    $("#serLogSolveTime").timepicker('setTime', solveTime.split(' ')[1]);
                }
                $("#serLogFaultType1").val(d.FaultTypeId1).trigger('change');
                if (permissionList[414].have) {
                    $('#updateServiceLogBtn').removeClass('hidden');
                    $('#updateServiceLogBtn').val(id);
                    $("#serLogSolvePlan").prop('disabled', false);
                } else {
                    $('#updateServiceLogBtn').addClass('hidden');
                    $("#serLogSolvePlan").prop('disabled', true);
                }
            }
            $("#serLogSolvePlan").val(d.SolvePlan);
        });
    } else {
        $('#showServiceLogModal .isText').addClass('hidden');
        $('#showServiceLogModal .noText').removeClass('hidden');
        $("#serLogSolvePlan").prop('disabled', false);
        $('#serLogCodeOther,#serLogFaultSup,#serLogSolvePlan').val('');
        $('#serLogPriority').val(0);
        $('#serLogGrade').val(0);
        $('#serLogProposer').val(getCookieTokenInfo().name);
        $('#serLogFaultDate,#serLogSolveDate').val(getDate()).datepicker('update');
        $("#serLogFaultTime,#serLogSolveTime").timepicker('setTime', getTime());
        $("#serLogFaultType,#serLogFaultType1,#serLogMaintainer,#serLogFaultSolver").empty();
        $("#serLogFaultType,#serLogFaultType1").append(_faultType);
        $("#serLogMaintainer,#serLogFaultSolver").append(_worker);
        var v = $('#serLogFaultType').val();
        $("#serLogFaultDesc").val(_faultTypeData[v].FaultDescription);
        var deviceCode = new Promise(resolve => getDeviceCode(resolve));
        var workShop = new Promise(resolve => getWorkShop(resolve));
        Promise.all([deviceCode, workShop]).then(e => {
            $("#serLogCode,#serLogWorkshop").empty();
            $("#serLogCode").append(e[0]);
            $("#serLogCode").val(0).trigger('change');
            $("#serLogCode").select2({
                allowClear: true,
                placeholder: "请选择"
            });
            $("#serLogWorkshop").append(e[1]);
            getSite();
        });
    }
    $('#showServiceLogModal').modal('show');
}

//添加修改维修记录
function addUpServiceLog(isAdd) {
    var opType = isAdd ? 415 : 414;
    if (!permissionList[opType].have) {
        layer.msg("没有权限");
        return;
    }
    var list = {};
    if (isAdd) {
        var serLogCode = $('#serLogCode').val();
        var serLogWorkshop = $('#serLogWorkshop').val();
        var serLogCodeOther = $('#serLogCodeOther').val().trim();
        var isCode = isStrEmptyOrUndefined(serLogCode);
        var isOther = isStrEmptyOrUndefined(serLogCodeOther);
        if (isCode && isOther) {
            layer.msg('请选择或输入一台机台号');
            return;
        }
        if (!isCode && !isOther) {
            layer.msg('只能选择或输入一台机台号');
            return;
        }
        if (!isOther) {
            var site = $('#serLogDevSite').val();
            serLogCodeOther = `${serLogWorkshop}-${site ? site + '-' : ''}${serLogCodeOther}`;
            serLogCode = 0;
        }
        var serLogProposer = $('#serLogProposer').val().trim();
        if (isStrEmptyOrUndefined(serLogProposer)) {
            layer.msg('报修人不能为空');
            return;
        }
        var serLogFaultDate = $('#serLogFaultDate').val();
        var serLogFaultTime = $('#serLogFaultTime').val();
        if (isStrEmptyOrUndefined(serLogFaultDate) || isStrEmptyOrUndefined(serLogFaultTime)) {
            layer.msg('请选择故障时间');
            return;
        }
        var faultTime = `${serLogFaultDate} ${serLogFaultTime}`;
        var serLogFaultType = $('#serLogFaultType').val();
        if (isStrEmptyOrUndefined(serLogFaultType)) {
            layer.msg('请选择故障类型');
            return;
        }
        var serLogFaultSup = $('#serLogFaultSup').val().trim();
        var serLogPriority = $('#serLogPriority').val();
        if (isStrEmptyOrUndefined(serLogPriority)) {
            layer.msg('请选择优先级');
            return;
        }

        var serLogGrade = $('#serLogGrade').val();
        if (isStrEmptyOrUndefined(serLogGrade)) {
            layer.msg('请选择故障等级');
            return;
        }
        var serLogMaintainer = $('#serLogMaintainer').val();
        if (serLogMaintainer == 0) {
            serLogMaintainer = '';
        }
        list = {
            DeviceId: serLogCode,
            DeviceCode: serLogCodeOther,
            Proposer: serLogProposer,
            FaultTime: faultTime,
            FaultTypeId: serLogFaultType,
            FaultDescription: serLogFaultSup,
            Priority: serLogPriority,
            Grade: serLogGrade,
            Maintainer: serLogMaintainer
        }
    } else {
        list.Id = $(this).val();
    }
    var serLogFaultSolver = $('#serLogFaultSolver option:selected').attr('wname');
    if (isStrEmptyOrUndefined(serLogFaultSolver)) {
        layer.msg('请选择解决人');
        return;
    }
    if (serLogFaultSolver == 0) {
        serLogFaultSolver = '未指派';
    }
    var serLogSolveDate = $('#serLogSolveDate').val();
    var serLogSolveTime = $('#serLogSolveTime').val();
    if (isStrEmptyOrUndefined(serLogSolveDate) || isStrEmptyOrUndefined(serLogSolveTime)) {
        layer.msg('请选择解决时间');
        return;
    }
    var solveTime = `${serLogSolveDate} ${serLogSolveTime}`;
    var serLogFaultType1 = $('#serLogFaultType1').val();
    if (isStrEmptyOrUndefined(serLogFaultType1)) {
        layer.msg('请选择实际故障类型');
        return;
    }
    var serLogSolvePlan = $('#serLogSolvePlan').val().trim();
    var listAll = $.extend(list, {
        FaultSolver: serLogFaultSolver,
        SolveTime: solveTime,
        FaultTypeId1: serLogFaultType1,
        SolvePlan: serLogSolvePlan
    });
    var data = {};
    data.opType = opType;
    data.opData = JSON.stringify(isAdd ? listAll : [listAll]);
    ajaxPost("/Relay/Post", data, function (ret) {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            $('#showServiceLogModal').modal('hide');
            $('#showStatisticsDetailModel').is(':hidden')
                ? getServiceLogList(1)
                : getServiceLogList(1, _statisticsParData.name,
                    _statisticsParData.sTime,
                    _statisticsParData.eTime,
                    _statisticsParData.score);
        }
    });
}

var _delFaultDevData = null;
//获取已删除故障设备
function getDelFaultDeviceList() {
    var opType = 424;
    if (!permissionList[opType].have) {
        return;
    }
    _delFaultDevData = {};
    _delFaultDevData.Id = [];
    _delFaultDevData.Name = [];
    var startTime = $('#delFSTime').val();
    var endTime = $('#delFETime').val();
    if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
        layer.msg('请选择故障时间');
        return;
    }
    if (comTimeDay(startTime, endTime)) {
        return;
    }
    startTime = `${startTime} 00:00:00`;
    endTime = `${endTime} 23:59:59`;
    var condition = $('#delFCond').val();
    var list = { startTime, endTime, condition }
    var delFPro = $('#delFPro').val();
    var delFAttr;
    switch (delFPro) {
        case 'code':
            delFAttr = $('#delFInput').val().trim();
            if (!isStrEmptyOrUndefined(delFAttr)) {
                list[delFPro] = delFAttr;
            }
            break;
        case 'solveTime':
            var delFSolveSTime = $('#delFSolveSTime').val();
            if (!isStrEmptyOrUndefined(delFSolveSTime)) {
                list.eStartTime = delFSolveSTime;
            }
            var delFSolveETime = $('#delFSolveETime').val();
            if (!isStrEmptyOrUndefined(delFSolveETime)) {
                list.eEndTime = delFSolveETime;
            }
            break;
        default:
            delFAttr = $('#delFAttr').val();
            if (!isStrEmptyOrUndefined(delFAttr)) {
                list[delFPro] = delFAttr;
            }
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
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
                "aaSorting": [[1, "asc"]],
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "", "render": setTable().isEnable, "orderable": false, "visible": false },
                    { "data": null, "title": "序号", "render": setTable().order },
                    { "data": "DeviceCode", "title": "机台号" },
                    { "data": "FaultTime", "title": "故障时间", "render": setTable().setTime },
                    { "data": null, "title": "优先级", "render": setTable().priority },
                    { "data": "Grade", "title": "故障等级", "render": setTable().grade },
                    { "data": null, "title": "状态", "render": setTable().rState },
                    { "data": "Name", "title": "指派给", "render": setTable().serviceName },
                    { "data": "Phone", "title": "联系方式" },
                    { "data": "Remark", "title": "维修备注", "render": setTable().remark },
                    { "data": "EstimatedTime", "title": "预计解决时间", "render": setTable().setTime },
                    { "data": "FaultTypeName", "title": "故障类型" },
                    { "data": null, "title": "故障描述", "render": setTable().rDesc },
                    { "data": null, "title": "故障图片", "render": setTable().imgBtn }
                ],
                "drawCallback": function (settings, json) {
                    $(this).find('.isEnable').iCheck({
                        handle: 'checkbox',
                        checkboxClass: 'icheckbox_minimal-blue',
                        increaseArea: '20%'
                    }).on('ifChanged', function () {
                        var v = $(this).val();
                        var name = $(this).attr('fName');
                        if ($(this).is(':checked')) {
                            _delFaultDevData.Id.push(v);
                            _delFaultDevData.Name.push(name);
                        } else {
                            _delFaultDevData.Id.splice(_delFaultDevData.Id.indexOf(v), 1);
                            _delFaultDevData.Name.splice(_delFaultDevData.Name.indexOf(name), 1);
                        }
                    });
                }
            });
    });
}

var _delServiceLogData = null;
//获取已删除维修记录
function getDelServiceLogList() {
    var opType = 425;
    if (!permissionList[opType].have) {
        return;
    }
    _delServiceLogData = {};
    _delServiceLogData.Id = [];
    _delServiceLogData.Name = [];
    var startTime = $('#delRepairSTime').val();
    var endTime = $('#delRepairETime').val();
    if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
        layer.msg('请选择解决时间');
        return;
    }
    if (comTimeDay(startTime, endTime)) {
        return;
    }
    startTime = `${startTime} 00:00:00`;
    endTime = `${endTime} 23:59:59`;
    var condition = $('#delRepairCond').val();
    var list = { startTime, endTime, condition }
    var delRepairPro = $('#delRepairPro').val();
    var delRepairAttr;
    switch (delRepairPro) {
        case 'code':
            delRepairAttr = $('#delRepairInput').val().trim();
            if (!isStrEmptyOrUndefined(delRepairAttr)) {
                list[delRepairPro] = delRepairAttr;
            }
            break;
        case 'faultTime':
            var delRepSTime = $('#delRepSTime').val();
            if (!isStrEmptyOrUndefined(delRepSTime)) {
                list.fStartTime = delRepSTime;
            }
            var delRepETime = $('#delRepETime').val();
            if (!isStrEmptyOrUndefined(delRepETime)) {
                list.fEndTime = delRepETime;
            }
            break;
        case 'solveTime':
            var delRepSTime1 = $('#delRepSTime').val();
            if (!isStrEmptyOrUndefined(delRepSTime1)) {
                list.eStartTime = delRepSTime1;
            }
            var delRepETime1 = $('#delRepETime').val();
            if (!isStrEmptyOrUndefined(delRepETime1)) {
                list.eEndTime = delRepETime1;
            }
            break;
        default:
            delRepairAttr = $('#delRepairAttr').val();
            if (!isStrEmptyOrUndefined(delRepairAttr)) {
                list[delRepairPro] = delRepairAttr;
            }
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $("#delRepairList")
            .DataTable({
                dom: '<"pull-left"l><"pull-right"f>rtip',
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": oLanguage,
                "data": ret.datas,
                "aaSorting": [[1, "asc"]],
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "", "render": setTable().serIsEnable, "orderable": false, "visible": false },
                    { "data": null, "title": "序号", "render": setTable().order },
                    { "data": "DeviceCode", "title": "机台号" },
                    { "data": "FaultTime", "title": "故障时间", "render": setTable().setTime },
                    { "data": "SolveTime", "title": "解决时间", "sClass": "text-primary", "render": setTable().setTime },
                    { "data": "CostTime", "title": "用时", "sClass": "text-primary" },
                    { "data": null, "title": "优先级", "render": setTable().priority },
                    { "data": "Grade", "title": "故障等级", "render": setTable().grade },
                    { "data": "Score", "title": "评分", "sClass": "text-primary" },
                    { "data": "FaultSolver", "title": "解决人" },
                    { "data": "Name", "title": "指派给", "render": setTable().serviceName() },
                    { "data": "EstimatedTime", "title": "预计解决时间", "render": setTable().setTime },
                    { "data": "Remark", "title": "维修备注", "render": setTable().remark },
                    { "data": "Proposer", "title": "报修人" },
                    { "data": "FaultTypeName", "title": "故障类型" },
                    { "data": null, "title": "故障描述", "render": setTable().rDesc },
                    { "data": null, "title": "故障图片", "render": setTable().imgBtn },
                    { "data": "Id", "title": "详情", "render": setTable().upServiceLog.bind(null, 1) }
                ],
                "drawCallback": function (settings, json) {
                    $(this).find('.isEnable').iCheck({
                        handle: 'checkbox',
                        checkboxClass: 'icheckbox_minimal-blue',
                        increaseArea: '20%'
                    }).on('ifChanged', function () {
                        var v = $(this).val();
                        var name = $(this).attr('fName');
                        if ($(this).is(':checked')) {
                            _delServiceLogData.Id.push(v);
                            _delServiceLogData.Name.push(name);
                        } else {
                            _delServiceLogData.Id.splice(_delServiceLogData.Id.indexOf(v), 1);
                            _delServiceLogData.Name.splice(_delServiceLogData.Name.indexOf(name), 1);
                        }
                    });
                }
            });
    });
}

//获取常见故障
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

//删除常见故障
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

//添加常见故障弹窗
function showAddUsuallyFaultModel() {
    hideClassTip('adt');
    $("#addUsuallyFaultDesc").val("");
    $("#addSolvePlan").val("");
    $("#addUsuallyFaultModel").modal("show");
}

//添加常见故障
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

//修改常见故障弹窗
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

//修改常见故障
function updateUsuallyFault() {
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

//获取故障类型
function getFaultTypeList() {
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
                var updateLi = '<li><a onclick="showUpdateFaultTypeModel({0})">修改</a></li>'.format(data.Id);
                var deleteLi = '<li><a onclick="deleteFaultType({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.FaultTypeName));
                return html.format(permissionList[408].have ? updateLi : "", permissionList[411].have ? deleteLi : "");;
            }

            var columns = [
                { "data": null, "title": "序号", "render": setTable().order },
                { "data": "Id", "title": "Id", "bVisible": false },
                { "data": "FaultTypeName", "title": "故障类型" },
                { "data": null, "title": "故障类型描述", "render": setTable().rDesc }
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
            $("#faultTypeModel").modal("show");
        });
}

//故障类型详情弹窗
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
            var d = ret.datas[0];
            if (ret.datas.length > 0) {
                $("#faultTypeNameDetail").html(d.FaultTypeName);
                $("#faultTypeDetail").html(d.FaultDescription);
            }
            $("#faultTypeDetailModel").modal("show");
        });
}

//删除故障类型
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

//添加故障类型弹窗
function showAddFaultTypeModel() {
    hideClassTip('adt');
    $("#addFaultTypeName").val("");
    $("#addFaultTypeDesc").val("");
    $("#addFaultTypeModel").modal("show");
}

//添加故障类型
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

//修改故障类型弹窗
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
        qId: id
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

//修改故障类型
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
                    getFaultTypeSelect();
                }
            });
    }
    showConfirm("修改", doSth);
}

//获取维修工
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
                { "data": "Id", "title": "序号", "render": setTable().order, "sWidth": "80px" },
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
        //if (isStrEmptyOrUndefined(phone)) {
        //    layer.msg("请输入手机号");
        //    return;
        //} else if (!isPhone(phone)) {
        //    layer.msg("手机号错误");
        //    return;
        //}

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
            //if (isStrEmptyOrUndefined(maintainer.Phone)) {
            //    layer.msg("请输入手机号");
            //    return;
            //} else if (!isPhone(maintainer.Phone)) {
            //    layer.msg("手机号错误");
            //    return;
            //}
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
