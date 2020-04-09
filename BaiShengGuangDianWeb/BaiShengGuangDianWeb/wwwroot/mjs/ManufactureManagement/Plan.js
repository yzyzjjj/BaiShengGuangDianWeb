function pageReady() {
    $('.ms2').select2();
    getTaskConfig();
    getTaskState();
    var nowMonth = getMonthScope();
    $("#startTime").val(nowMonth.start).datepicker('update');
    $("#endTime").val(nowMonth.end).datepicker('update');
    $('#planConfigList').on('ifChanged', '.isEnable', function () {
        var tr = $(this).parents('tr');
        var v = $(this).val();
        if ($(this).is(':checked')) {
            _planIdData.push(v);
            var d = _planConfigData[v];
            tr.find('.planName').val(d.Plan);
            var sTime = d.PlannedStartTime;
            sTime = sTime.slice(0, sTime.indexOf(' '));
            if (sTime == '0001-01-01') {
                sTime = '';
            }
            var eTime = d.PlannedEndTime;
            eTime = eTime.slice(0, eTime.indexOf(' '));
            if (eTime == '0001-01-01') {
                eTime = '';
            }
            tr.find('.sTime').val(sTime).datepicker('update');
            tr.find('.eTime').val(eTime).datepicker('update');
            tr.find('.hour').val(d.EstimatedHour);
            tr.find('.minute').val(d.EstimatedMin);
            tr.find('.taskConfig').val(d.TaskId).trigger('change');
            tr.find('.textIn').removeClass('hidden').siblings('.textOn').addClass('hidden');
        } else {
            _planIdData.splice(_planIdData.indexOf(v), 1);
            tr.find('.textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
        }
    });
    $('#planConfigList,#planItemList,#addPlanTaskList,#planTime').on('focus', '.toZero', function () {
        var v = $(this).val();
        if (v == 0) {
            $(this).val('');
        }
    });
    $('#planConfigList,#planItemList,#addPlanTaskList,#planTime').on('blur', '.toZero', function () {
        var v = $(this).val();
        if (isStrEmptyOrUndefined(v)) {
            $(this).val('0');
        }
    });
    $('#planConfigList,#planItemList,#addPlanTaskList,#planTime').on('input', '.minute', function () {
        var v = $(this).val();
        if (parseInt(v) > 59) {
            $(this).val(59);
        }
    });
    $('#planItemList,#addPlanTaskList').on('ifChanged', '.isEnable', function () {
        var tr = $(this).parents('tr');
        var v = $(this).val();
        var data = $('#showPlanModal').is(':hidden') ? _planTaskItem[v] : _reusePlanTaskItem[v];
        if ($(this).is(':checked')) {
            tr.find('.textIn').removeClass('hidden').siblings('.textOn').addClass('hidden');
            var groupId = data.GroupId;
            tr.find('.group').val(groupId).trigger('change');
            var processorEl = tr.find('.processor');
            setProcessorSelect(groupId, processorEl);
            processorEl.val(data.Person).trigger('change');
            tr.find('.module').val(data.ModuleId).trigger('change');
            if (data.IsCheck) {
                tr.find('.taskName').addClass('hidden').siblings().removeClass('hidden');
                tr.find('.taskNameSelect').val(data.CheckId).trigger('change');
            } else {
                tr.find('.taskNameSelect').parent().addClass('hidden').siblings().removeClass('hidden');
            }
            tr.find('.taskName').val(data.Item);
            tr.find('.hour').val(data.EstimatedHour);
            tr.find('.minute').val(data.EstimatedMin);
            tr.find('.score').val(data.Score);
            tr.find('.desc').val(data.Desc);
            tr.find('.relation').val(tr.find('.relationText').text());
        } else {
            tr.find('.textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
        }
    });
    $('#planItemList,#addPlanTaskList').on('select2:select', '.group', function () {
        var v = $(this).val();
        var processorEl = $(this).parents('tr').find('.processor');
        setProcessorSelect(v, processorEl);
    });
    $('#planItemList,#addPlanTaskList').on('select2:select', '.module', function () {
        var module = $(this).find('option:selected').attr('isCheck');
        var tr = $(this).parents('tr');
        parseInt(module) ? tr.find('.taskName').addClass('hidden').siblings().removeClass('hidden') : tr.find('.taskNameSelect').parent().addClass('hidden').siblings().removeClass('hidden');
    });
    $('#planItemList,#addPlanTaskList').on('click', '.moveUp', function () {
        _isUpMove = false;
        var bodyIdName = $(this).parents('tbody').prop('id');
        var tr = $(this).parents('tr');
        var relationEl = tr.find('.relation');
        var isHidden = relationEl.is(':hidden');
        var trOrder = isHidden ? tr.find('.relationText').text() : relationEl.val();
        trOrder = parseInt(trOrder);
        var trNum = tr.find('.num').text();
        trNum = parseInt(trNum);
        if (trOrder + 1 == trNum) {
            layer.msg('不能上移到关联任务前');
            return;
        }
        var trs = tr.nextAll();
        for (var i = 0, len = trs.length; i < len; i++) {
            var trEl = trs.eq(i);
            var spanEl = trEl.find('.relationText');
            var inputEl = trEl.find('.relation');
            var upTrNum = trNum - 1;
            switch (parseInt(spanEl.text())) {
                case trNum:
                    spanEl.text(upTrNum);
                    break;
                case upTrNum:
                    spanEl.text(trNum);
                    break;
            }
            switch (parseInt(inputEl.val())) {
                case trNum:
                    inputEl.val(upTrNum);
                    break;
                case upTrNum:
                    inputEl.val(trNum);
                    break;
            }
        }
        var upTr = tr.prev();
        upTr.before(tr);
        setTableStyle(`#${bodyIdName}`);
    });
    $('#planItemList,#addPlanTaskList').on('input', '.relation', function () {
        var v = $(this).val();
        v = parseInt(v);
        var tr = $(this).parents('tr');
        var num = tr.find('.num').text();
        num = parseInt(num) - 1;
        if (v > num) {
            $(this).val(num);
        }
    });
    $('#planItemList,#addPlanTaskList').on('click', '.delPlanItem', function () {
        var bodyIdName = $(this).parents('tbody').prop('id');
        var tr = $(this).parents('tr');
        var trNum = tr.find('.num').text();
        var trs = tr.nextAll();
        for (var i = 0, len = trs.length; i < len; i++) {
            var trEl = trs.eq(i);
            var spanEl = trEl.find('.relationText');
            var inputEl = trEl.find('.relation');
            if (spanEl.text() == trNum) {
                spanEl.text(0);
            }
            if (inputEl.val() == trNum) {
                inputEl.val(0);
            }
        }
        tr.remove();
        setTableStyle(`#${bodyIdName}`);
    });
    $("#planReuse").on("click", function () {
        var planId = $("#planSelect").val();
        if (isStrEmptyOrUndefined(planId)) {
            layer.msg("请选择计划再复用");
            return;
        }
        var planName = $("#planSelect option:selected").text();
        var doSth = function () {
            reusePlanTask(planId);
        }
        showConfirm(`复用计划：${planName}`, doSth);
    });
    $('#planSelect').on('change', function () {
        $('#newPlan').val($(this).find("option:checked").text());
        $('#taskConfig').val($(this).find("option:checked").attr('taskid')).trigger('change');
    });
    $('#taskConfig').on('change', function () {
        var v = $(this).val();
        isStrEmptyOrUndefined(v) ? $('#addPlanTaskList').empty() : getTaskConfigItem(v);
    });
    $('#planConfigList').on('input', '.minute,.hour', function () {
        var tr = $(this).parents('tr');
        planEndTimeCount(tr);
    });
    $('#planConfigList').on('changeDate', '.sTime', function () {
        var tr = $(this).parents('tr');
        planEndTimeCount(tr);
    });
    $('#planTime .toZero').on('input', function () {
        planEndTimeCount($('#planTime'));
    });
    $('#planStartTime').on('changeDate', function () {
        planEndTimeCount($('#planTime'));
    });
    $('#addPlanTaskList').on('input', '.minute,.hour', function () {
        getTotalTime();
        planEndTimeCount($('#planTime'));
    });
    $('#addPlanTaskList').on('click', '.delPlanItem', function () {
        getTotalTime();
        planEndTimeCount($('#planTime'));
    });
    $('.maxHeight').css('maxHeight', innerHeight * 0.7);
}

//添加计划计算总预计时间
function getTotalTime() {
    var trs = $('#addPlanTaskList tr');
    var hours = 0, minutes = 0;
    for (var i = 0, len = trs.length; i < len; i++) {
        var tr = trs.eq(i);
        var id = tr.find('.isEnable').val();
        var hourEl = tr.find('.hour');
        var hour = hourEl.is(':hidden') ? _reusePlanTaskItem[id].EstimatedHour : hourEl.val();
        if (isStrEmptyOrUndefined(hour)) {
            hour = 0;
        }
        hour = parseInt(hour);
        hours += hour;
        var minuteEl = tr.find('.minute');
        var minute = minuteEl.is(':hidden') ? _reusePlanTaskItem[id].EstimatedMin : minuteEl.val();
        if (isStrEmptyOrUndefined(minute)) {
            minute = 0;
        }
        minute = parseInt(minute);
        minutes += minute;
    }
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
    $('#planHour').val(hours);
    $('#planMinute').val(minutes);
}

//结束时间计算
function planEndTimeCount(tr) {
    var hour = tr.find('.hour').val();
    if (isStrEmptyOrUndefined(hour)) {
        hour = 0;
    }
    hour = parseInt(hour);
    var minute = tr.find('.minute').val();
    if (isStrEmptyOrUndefined(minute)) {
        minute = 0;
    }
    minute = parseInt(minute);
    var sTime = new Date(tr.find('.sTime').val());
    var day = Math.ceil(hour / 8);
    if (hour % 8 == 0 && minute != 0) {
        day += 1;
    }
    var eTime = new Date(sTime.setDate(sTime.getDate() + day)).format("yyyy-MM-dd");
    tr.find('.eTime').val(eTime).datepicker('update');
}

var _reusePlanTaskItem = null;
//计划管理复用
function reusePlanTask(planId) {
    var opType = 1040;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    _isUpMove = true;
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        qId: planId
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        $('#addPlanTaskList').empty();
        _reusePlanTaskItem = {};
        var ops = '';
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            _reusePlanTaskItem[d.Id] = d;
            ops += _planTaskTr.format(d.Id, d.Processor, d.Module, d.Item, d.EstimatedTime, d.Score, d.Desc, d.Relation);
        }
        $('#addPlanTaskList').append(ops);
        setTableStyle('#addPlanTaskList');
        getTotalTime();
        planEndTimeCount($('#planTime'));
    });
}

//设置操作员选项
function setProcessorSelect(groupId, el) {
    el.empty();
    var op = '<option value = "{0}">{1}</option>';
    var ops = '';
    for (var i = 0, len = _processor.length; i < len; i++) {
        var d = _processor[i];
        if (groupId == d.GroupId) {
            ops += op.format(d.Id, d.Processor);
        }
    }
    el.append(ops);
}

//任务状态选项
function getTaskState() {
    var opType = 1038;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#selectState').empty();
        var list = ret.datas;
        var option = '<option value="{0}">{1}</option>';
        var options = '<option value=0>所有状态</option>';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.State);
        }
        $('#selectState').append(options);
        getPlanConfig();
    });
}

var _taskConfigOp = null;
//获取任务配置
function getTaskConfig() {
    var opType = 1051;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        var option = '<option value = "{0}">{1}</option>';
        _taskConfigOp = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            _taskConfigOp += option.format(d.Id, d.Task);
        }
    });
}

//获取任务配置项Tr
function getTaskConfigItem(taskId) {
    var opType = 1055;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    _isUpMove = true;
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({ taskId });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        $('#addPlanTaskList').empty();
        _reusePlanTaskItem = {};
        var ops = '';
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            _reusePlanTaskItem[d.Id] = d;
            ops += _planTaskTr.format(d.Id, d.Processor, d.Module, d.Item, d.EstimatedTime, d.Score, d.Desc, d.Relation);
        }
        $('#addPlanTaskList').append(ops);
        setTableStyle('#addPlanTaskList');
        getTotalTime();
        planEndTimeCount($('#planTime'));
    });
}

var _planConfigData = null;
var _planConfigTab = null;
//计划配置项
function getPlanConfig() {
    var opType = 1039;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    _planIdData = [];
    var stateId = $('#selectState').val();
    if (isStrEmptyOrUndefined(stateId)) {
        layer.msg('请选择状态');
        return;
    }
    var startTime = $('#startTime').val();
    if (isStrEmptyOrUndefined(startTime)) {
        layer.msg("请选择开始时间");
        return;
    }
    var endTime = $('#endTime').val();
    if (isStrEmptyOrUndefined(endTime)) {
        layer.msg("请选择结束时间");
        return;
    }
    if (comTimeDay(startTime, endTime)) {
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        state: stateId,
        sTime: startTime,
        eTime: endTime,
        menu: false
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        _planConfigData = {};
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            _planConfigData[d.Id] = d;
        }
        var isEnable = function (data) {
            return `<input type="checkbox" class="icb_minimal isEnable" value=${data.Id}>`;
        }
        var order = function (a, b, c, d) {
            return d.row + 1;
        }
        var planName = function (data) {
            return `<span class="textOn">${data}</span><input type="text" class="form-control text-center textIn planName hidden" maxlength="20" style="width:120px">`;
        }
        var sTime = function (data) {
            var time = data.slice(0, data.indexOf(' '));
            if (time == '0001-01-01') {
                time = '';
            }
            return `<span class="textOn">${time}</span><input type="text" class="form_date form-control text-center textIn sTime hidden" style="width:120px;cursor: pointer">`;
        }
        var eTime = function (data) {
            var time = data.slice(0, data.indexOf(' '));
            if (time == '0001-01-01') {
                time = '';
            }
            return `<span class="textOn">${time}</span><input type="text" class="form_date form-control text-center textIn eTime hidden" style="width:120px;cursor: pointer">`;
        }
        var predictTime = function (data) {
            return `<span class="textOn">${data.EstimatedTime}</span>
            <div class="flexStyle textIn hidden" style="justify-content:center">
            <input type="text" class="form-control text-center hour toZero" maxlength="3" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:50px">
            <label class="control-label" style="white-space: nowrap; margin: 0">小时</label>
            <input type="text" class="form-control text-center minute toZero" maxlength="3" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:50px">
            <label class="control-label" style="white-space: nowrap; margin: 0">分</label>
            </div>`;
        }
        var taskConfig = function (data) {
            return `<span class="textOn">${data}</span><div class="textIn hidden" style="width:120px;margin:auto"><select class="ms2 form-control taskConfig">${_taskConfigOp}</select></div>`;

        }
        var carryBtn = function (data) {
            return data.State == 1 ? `<button type="button" class="btn btn-info btn-sm" onclick="issuePlan(${data.Id})">下发</button>` : '';
        }
        var detailBtn = function (data) {
            return `<button type="button" class="btn btn-primary btn-sm" onclick="planTaskDetail(${data.Id},\'${data.Plan}\')">查看任务</button>`;
        }
        var logBtn = function (data) {
            return `<button type="button" class="btn btn-success btn-sm" onclick="showLogModel(${data.Id})">查看</button>`;
        }
        _planConfigTab = $('#planConfigList').DataTable({
            dom: '<"pull-left"l><"pull-right"f>rtip',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": rData,
            "aaSorting": [[1, "asc"]],
            "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 20, //默认显示的记录数
            "columns": [
                { "data": null, "title": "选择", "render": isEnable, "orderable": false },
                { "data": null, "title": "序号", "render": order },
                { "data": "Plan", "title": "计划号", "render": planName },
                { "data": "PlannedStartTime", "title": "开始时间", "render": sTime },
                { "data": "PlannedEndTime", "title": "结束时间", "render": eTime },
                { "data": null, "title": "预计用时", "render": predictTime },
                { "data": "Task", "title": "任务配置", "render": taskConfig },
                { "data": null, "title": "实施", "render": carryBtn },
                { "data": "StateDesc", "title": "状态" },
                { "data": null, "title": "详情", "render": detailBtn, "orderable": false },
                { "data": null, "title": "日志", "render": logBtn, "orderable": false }
            ],
            "drawCallback": function (settings, json) {
                $(this).find('.isEnable').iCheck({
                    handle: 'checkbox',
                    checkboxClass: 'icheckbox_minimal-blue',
                    increaseArea: '20%'
                });
                $(this).find('.form_date').attr("readonly", true).datepicker({
                    language: 'zh-CN',
                    format: 'yyyy-mm-dd',
                    maxViewMode: 2,
                    todayBtn: "linked",
                    autoclose: true
                });
                $(this).find('.ms2').select2();
            }
        });
    });
}

//下发计划
function issuePlan(planId) {
    var opType = 1041;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var planName = _planConfigData[planId].Plan;
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: planId
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getPlanConfig();
                }
            });
    }
    showConfirm(`下发计划：${planName}`, doSth);
}

//获取分组
function getGroup(resolve) {
    var opType = 1077;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        menu: true
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Group);
        }
        if (resolve != null) {
            resolve(options);
        }
    }, 0);
}

var _processor = null;
//获取操作员
function getProcessor(resolve) {
    var opType = 1081;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        groupId: 0,
        menu: true
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        _processor = ret.datas;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (var i = 0, len = _processor.length; i < len; i++) {
            var d = _processor[i];
            options += option.format(d.Id, d.Processor);
        }
        if (resolve != null) {
            resolve(options);
        }
    }, 0);
}
//获取模块名
function getModule(resolve) {
    var opType = 1058;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        menu: true
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        var option = '<option value = "{0}" isCheck = "{2}">{1}</option>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Module, d.IsCheck);
        }
        if (resolve != null) {
            resolve(options);
        }
    }, 0);
}
//获取任务名
function getTaskName(resolve) {
    var opType = 1066;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        menu: true
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Check);
        }
        options = `<select class="ms2 form-control taskNameSelect">${options}</select>`;
        if (resolve != null) {
            resolve(options);
        }
    }, 0);
}

//计划任务Tr
function planTaskTr(resolve,isAdd) {
    var groupSelect = new Promise(function (resolve) {
        getGroup(resolve);
    });
    var processorSelect = new Promise(function (resolve) {
        getProcessor(resolve);
    });
    var moduleSelect = new Promise(function (resolve) {
        getModule(resolve);
    });
    var taskNameSelect = new Promise(function (resolve) {
        getTaskName(resolve);
    });
    Promise.all([groupSelect, processorSelect, moduleSelect, taskNameSelect]).then(function (results) {
        _planTaskTr = `<tr>
            <td class="isIssue"><input type="checkbox" class="icb_minimal isEnable" value={0}></td>
            <td class="num"></td>
            <td>
            <span class="textOn">{1}</span>
            <div class="flexStyle textIn hidden" style="width: 240px;margin:auto"><select class="ms2 form-control group">${results[0]}</select><select class="ms2 form-control processor">${results[1]}</select></div>
            </td>
            <td><span class="textOn">{2}</span><div class="textIn hidden" style="width: 120px;margin:auto"><select class="ms2 form-control module">${results[2]}</select></div></td>
            <td><span class="textOn">{3}</span><div class="textIn hidden" style="width: 120px;margin:auto"><input type="text" class="form-control text-center taskName" maxlength="10"><div>${results[3]}</div></div></td>
            <td><span class="textOn">{4}</span>
            <div class="flexStyle textIn hidden" style="width:140px;margin:auto">
            <input type="text" class="form-control text-center hour toZero" maxlength="3" oninput="value=value.replace(/[^\\d]/g,\'\')">
            <label class="control-label" style="white-space: nowrap; margin: 0">小时</label>
            <input type="text" class="form-control text-center minute toZero" maxlength="3" oninput="value=value.replace(/[^\\d]/g,\'\')">
            <label class="control-label" style="white-space: nowrap; margin: 0">分</label>
            </div>
            </td>
            <td><span class="textOn">{5}</span><input type="text" class="form-control text-center textIn hidden score toZero" maxlength="3" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:80px;margin:auto"></td>
            <td class="no-padding"><span class="textOn">{6}</span><textarea class="form-control textIn hidden desc" maxlength="500" style="resize: vertical;width:180px;margin:auto"></textarea></td>
            <td><span class="textOn relationText">{7}</span><input type="text" class="form-control text-center textIn hidden relation toZero" maxlength="10" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:80px;margin:auto"></td>
            <td class="isIssue"><button type="button" class="btn btn-primary btn-sm moveUp">上移</button></td>
            ${isAdd ? '' : '<td><button type="button" class="btn btn-success btn-sm" onclick="showLogModel({8},{0})">日志</button></td>'}
            <td class="isIssue"><button type="button" class="btn btn-danger btn-sm delPlanItem"><i class="fa fa-minus"></i></button></td>
            </tr>`;
        _addPlanTaskTr = `<tr>
            <td></td>
            <td class="num"></td>
            <td>
            <div class="flexStyle" style="width: 240px;margin:auto"><select class="ms2 form-control group">${results[0]}</select><select class="ms2 form-control processor">${results[1]}</select></div>
            </td>
            <td><div style="width: 120px;margin:auto"><select class="ms2 form-control module">${results[2]}</select></div></td>
            <td><div style="width: 120px;margin:auto"><input type="text" class="form-control text-center taskName" maxlength="10"><div class="hidden">${results[3]}</div></div></td>
            <td>
            <div class="flexStyle" style="width:140px;margin:auto">
            <input type="text" class="form-control text-center hour toZero" maxlength="3" oninput="value=value.replace(/[^\\d]/g,\'\')" value="0">
            <label class="control-label" style="white-space: nowrap; margin: 0">小时</label>
            <input type="text" class="form-control text-center minute toZero" maxlength="3" oninput="value=value.replace(/[^\\d]/g,\'\')" value="0">
            <label class="control-label" style="white-space: nowrap; margin: 0">分</label>
            </div>
            </td>
            <td><input type="text" class="form-control text-center score toZero" maxlength="3" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:80px;margin:auto" value="0"></td>
            <td class="no-padding"><textarea class="form-control desc" maxlength="500" style="resize: vertical;width:180px;margin:auto"></textarea></td>
            <td><input type="text" class="form-control text-center relation toZero" maxlength="10" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:80px;margin:auto" value="0"></td>
            <td><button type="button" class="btn btn-primary btn-sm moveUp">上移</button></td>
            <td></td>
            <td><button type="button" class="btn btn-danger btn-sm delPlanItem"><i class="fa fa-minus"></i></button></td>
            </tr>`;
        resolve('success');
    });
}

var _planTaskTr = null;
var _planTaskItem = null;
//计划任务详情
function planTaskDetail(planId, planName) {
    var opType = 1040;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    _isUpMove = true;
    $('#planText').text(planName);
    $('#planText').attr('planid', planId);
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        qId: planId
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        new Promise(function (resolve) {
            planTaskTr(resolve,0);
        }).then(() => {
            var rData = ret.datas;
            $('#planItemList').empty();
            _planTaskItem = {};
            var ops = '';
            for (var i = 0, len = rData.length; i < len; i++) {
                var d = rData[i];
                _planTaskItem[d.Id] = d;
                ops += _planTaskTr.format(d.Id, d.Processor, d.Module, d.Item, d.EstimatedTime, d.Score, d.Desc, d.Relation, d.PlanId);
            }
            $('#planItemList').append(ops);
            setTableStyle('#planItemList');
            _planConfigData[planId].State != 1
                ? $('#planItem .isIssue').addClass('hidden')
                : $('#planItem .isIssue').removeClass('hidden');
            $('#planItem').removeClass('hidden');
        });
    });
}

//重置计划详情任务
function resetPlanItemList() {
    var planId = $('#planText').attr('planid');
    planTaskDetail(planId, $('#planText').text());
}

var _addPlanTaskTr = null;
//新增任务行
function addPlanTaskTr() {
    $('#planItemList').append(_addPlanTaskTr);
    var lastEl = $('#planItemList tr:last');
    var isCheckout = lastEl.find('.module option:selected').attr('ischeck');
    parseInt(isCheckout) ? lastEl.find('.taskName').addClass('hidden').siblings().removeClass('hidden') : lastEl.find('.taskName').removeClass('hidden').siblings().addClass('hidden');
    setTableStyle('#planItemList');
    $('#planItemTable').scrollTop($('#planItemTable')[0].scrollHeight);
}

//计划详情update add数据
function planTaskData(el, isUp) {
    var list = [];
    var i, len = $(`${el} tr`).length;
    var isChecked = $(`${el} .isEnable`).is(':checked');
    var isEnableBox = $(`${el} .isEnable`).length;
    if (isUp) {
        var planTaskTrs = Object.keys(_planTaskItem).length;
        if ((!len && len == planTaskTrs) || (isEnableBox == len && !isChecked && _isUpMove && len == planTaskTrs)) {
            layer.msg('请先修改数据');
            return 1;
        }
    }
    for (i = 0; i < len; i++) {
        var tr = $(`${el} tr`).eq(i);
        var isEnableEl = tr.find('.isEnable');
        var id = isEnableEl.val();
        if (isStrEmptyOrUndefined(id)) {
            id = 0;
        }
        //  操作员id  操作员名字    模块名    是否检验 检验单   任务名 小时 分钟    绩效   描述  关联
        var personId, personName, moduleId, isCheck, checkId, item, hour, minute, score, desc, relation;
        if (isEnableEl.is(':checked') || id == 0) {
            var personEl = tr.find('.processor');
            personId = personEl.val();
            if (isStrEmptyOrUndefined(personId)) {
                layer.msg(`序列${i + 1}：请选择操作员`);
                return 1;
            }
            personName = personEl.find('option:selected').text();
            moduleId = tr.find('.module').val();
            if (isStrEmptyOrUndefined(moduleId)) {
                layer.msg(`序列${i + 1}：请选择模块名`);
                return 1;
            }
            isCheck = !!parseInt(tr.find('.module').find(`option[value=${moduleId}]`).attr('isCheck'));
            if (isCheck) {
                checkId = tr.find('.taskNameSelect').val();
                if (isStrEmptyOrUndefined(checkId)) {
                    layer.msg(`序列${i + 1}：请选择检验任务`);
                    return 1;
                }
                item = tr.find(`.taskNameSelect option[value=${checkId}]`).text();
                checkId = parseInt(checkId);
            } else {
                checkId = 0;
                item = tr.find('.taskName').val();
                if (isStrEmptyOrUndefined(item)) {
                    layer.msg(`序列${i + 1}：任务名不能为空`);
                    return 1;
                }
            }
            hour = tr.find('.hour').val();
            if (isStrEmptyOrUndefined(hour)) {
                hour = 0;
            }
            hour = parseInt(hour);
            minute = tr.find('.minute').val();
            if (isStrEmptyOrUndefined(minute)) {
                minute = 0;
            }
            minute = parseInt(minute);
            score = tr.find('.score').val();
            if (isStrEmptyOrUndefined(score)) {
                score = 0;
            }
            score = parseInt(score);
            desc = tr.find('.desc').val();
            relation = tr.find('.relation').val();
        } else {
            var d = isUp ? _planTaskItem[id] : _reusePlanTaskItem[id];
            personId = d.Person;
            personName = d.Processor;
            moduleId = d.ModuleId;
            isCheck = d.IsCheck;
            checkId = d.CheckId;
            item = d.Item;
            hour = d.EstimatedHour;
            minute = d.EstimatedMin;
            score = d.Score;
            desc = d.Desc;
            relation = tr.find('.relationText').text();
        }
        if (isStrEmptyOrUndefined(relation)) {
            relation = 0;
        }
        if (!isUp) {
            id = 0;
        }
        relation = parseInt(relation);
        list.push({
            Order: i + 1,
            Person: personId,
            Processor: personName,
            ModuleId: moduleId,
            IsCheck: isCheck,
            CheckId: checkId,
            Item: item,
            EstimatedHour: hour,
            EstimatedMin: minute,
            Score: score,
            Desc: desc,
            Relation: relation,
            Id: id
        });
    }
    return list;
}

var _isUpMove = true;
//计划任务项保存
function updatePlanTaskItem() {
    var opType = 1042;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var planId = $('#planText').attr('planid');
    var taskId = _planConfigData[planId].TaskId;
    var list = {
        Id: planId,
        TaskId: taskId
    };
    var items = planTaskData('#planItemList', true);
    if (items === 1) {
        return;
    } else {
        if (items.length) {
            list.Items = items;
        }
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify([list]);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    planTaskDetail(planId, $('#planText').text());
                }
            });
    }
    showConfirm("保存", doSth);
}

//表格设置
function setTableStyle(el) {
    var trs = $(`${el} tr .num`);
    for (var i = 0, len = trs.length; i < len; i++) {
        trs.eq(i).text(i + 1);
    }
    $(el).find('.isEnable').iCheck({
        handle: 'checkbox',
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '20%'
    });
    $(el).find('.ms2').select2();
    $(`${el} .moveUp`).removeClass('hidden');
    $(`${el} .moveUp`).eq(0).addClass('hidden');
}

//计划日志弹窗
function showLogModel(planId, itemId) {
    var opType = 1088;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var list = { planId };
    if (!isStrEmptyOrUndefined(itemId)) {
        list.itemId = itemId;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#planTaskLog').empty();
        var rData = ret.datas;
        var ops = '';
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            var items = d.Items.length;
            var itemLi = '';
            if (items) {
                for (var j = 0; j < items; j++) {
                    itemLi += `<li>${d.Items[j]}</li>`;
                }
            }
            ops += `<div class="box box-solid noShadow collapsed-box" style="margin-bottom: 0;">
            <div class="box-header no-padding">
                <span><font style="font-weight:bold">${i + 1}</font>.${d.Log}</span>
                <button type="button" style="padding:0;border:1px solid;width:18px;background:#E5E5E5" class="btn btn-box-tool ${(itemLi == '' ? 'hidden' : '')}" data-widget="collapse"><i class="on_i fa fa-plus"></i></button>
            </div>
            <div class="box-body no-padding">
                <ul class="on_ul nav nav-pills nav-stacked mli" style="text-indent: 2em">${itemLi}</ul>
            </div>
        </div>`;
        }
        $('#planTaskLog').append(ops);
        $('#showLogModal').modal('show');
    });
}

var _planIdData = [];
//删除计划配置
function delPlanConfig() {
    var opType = 1044;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var len = _planIdData.length;
    if (!len) {
        layer.msg('请选择需要删除的数据');
        return;
    }
    var trsData = _planConfigTab.context[0].aoData;
    var i;
    var trs = trsData.length;
    for (i = 0; i < trs; i++) {
        var tr = trsData[i].nTr;
        var enableEl = $(tr).find('.isEnable');
        if (enableEl.is(':checked')) {
            var stateStr = trsData[i]._aData.State;
            if (stateStr != 1) {
                layer.msg(`序号${i + 1}：${stateStr}的计划不能删除`);
                return;
            }
        }
    }
    var planName = [];
    for (i = 0; i < len; i++) {
        planName.push(_planConfigData[_planIdData[i]].Plan);
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            ids: _planIdData
        });
        ajaxPost("/Relay/Post", data, function (ret) {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                getPlanConfig();
            }
        });
    }
    showConfirm(`删除以下计划:<pre style='color:red'>${planName.join('<br>')}</pre>`, doSth);
}

//修改计划
function updatePlanConfig() {
    var opType = 1042;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var len = _planIdData.length;
    if (!len) {
        layer.msg('请选择需要修改的数据');
        return;
    }
    var trsData = _planConfigTab.context[0].aoData;
    len = trsData.length;
    var list = [];
    for (var i = 0; i < len; i++) {
        var tr = trsData[i].nTr;
        var enableEl = $(tr).find('.isEnable');
        if (enableEl.is(':checked')) {
            var state = trsData[i]._aData.State;
            if (state != 1) {
                layer.msg(`序号${i + 1}：非待下发计划不能修改`);
                return;
            }
            var id = enableEl.val();
            var plan = $(tr).find('.planName').val();
            if (isStrEmptyOrUndefined(plan)) {
                layer.msg(`序号${i + 1}：计划号不能为空`);
                return;
            }
            var sTime = $(tr).find('.sTime').val();
            if (isStrEmptyOrUndefined(sTime)) {
                layer.msg(`序号${i + 1}：请选择开始时间`);
                return;
            }
            var eTime = $(tr).find('.eTime').val();
            if (isStrEmptyOrUndefined(eTime)) {
                layer.msg(`序号${i + 1}：请选择结束时间`);
                return;
            }
            if (compareDate(sTime, eTime)) {
                layer.msg(`序号${i + 1}：开始时间不能大于结束时间`);
                return;
            }
            var hour = $(tr).find('.hour').val();
            if (isStrEmptyOrUndefined(hour)) {
                hour = 0;
            }
            var minute = $(tr).find('.minute').val();
            if (isStrEmptyOrUndefined(minute)) {
                minute = 0;
            }
            var taskId = $(tr).find('.taskConfig').val();
            if (isStrEmptyOrUndefined(taskId)) {
                layer.msg(`序号${i + 1}：请选择人物配置`);
                return;
            }
            list.push({
                Id: id,
                Plan: plan,
                PlannedStartTime: sTime,
                PlannedEndTime: eTime,
                EstimatedHour: hour,
                EstimatedMin: minute,
                TaskId: taskId
            });
        }
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getPlanConfig();
                }
            });
    }
    showConfirm("保存", doSth);
}

var _planName = null;
//获取计划选项
function getPlanSelect() {
    var opType = 1039;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        menu: true
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#planSelect').empty();
        var list = ret.datas;
        var option = '<option value = "{0}" taskid = "{2}" state="{3}">{1}</option>';
        var options = '';
        _planName = [];
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            _planName.push(d.Plan);
            options += option.format(d.Id, d.Plan, d.TaskId, d.State);
        }
        $('#planSelect').append(options);
        $('#planSelect').val(0);
    }, 0);
}

//计划管理弹窗
function showPlanModal() {
    getPlanSelect();
    $('#taskConfig').empty();
    $('#taskConfig').append(_taskConfigOp);
    $('#taskConfig').val(0);
    $('#newPlan').val('');
    $("#planStartTime").val(getDate()).datepicker('update');
    $("#planEndTime").val(getDate()).datepicker('update');
    $('#planHour').val(0);
    $('#planMinute').val(0);
    $('#addPlanTaskList').empty();
    new Promise(resolve => planTaskTr(resolve,1)).then(() => $('#showPlanModal').modal('show'));
}

//删除所选计划
function delPlanSelect() {
    var opType = 1044;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var planSelectEl = $('#planSelect');
    var planId = planSelectEl.val();
    if (isStrEmptyOrUndefined(planId)) {
        layer.msg('请选择计划');
        return;
    }
    var state = planSelectEl.find('option:selected').attr('state');
    if (state != 1) {
        layer.msg('非待下发计划不能删除');
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            ids: [planId]
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getPlanSelect();
                }
            });
    }
    showConfirm(`删除计划：${planSelectEl.find('option:selected').text()}`, doSth);
}

//计划管理新增行
function addPlanTaskConTr() {
    $('#addPlanTaskList').append(_addPlanTaskTr);
    var lastEl = $('#addPlanTaskList tr:last');
    var isCheckout = lastEl.find('.module option:selected').attr('ischeck');
    parseInt(isCheckout) ? lastEl.find('.taskName').addClass('hidden').siblings().removeClass('hidden') : lastEl.find('.taskName').removeClass('hidden').siblings().addClass('hidden');
    setTableStyle('#addPlanTaskList');
    $('#addPlanTaskTable').scrollTop($('#addPlanTaskTable')[0].scrollHeight);
}

//新增修改计划
function addPlan() {
    var opType = 1043;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var newPlan = $("#newPlan").val().trim();
    if (isStrEmptyOrUndefined(newPlan)) {
        layer.msg("新计划不能为空");
        return;
    }
    if (_planName.includes(newPlan)) {
        layer.msg("新计划已存在");
        return;
    }
    var taskId = $('#taskConfig').val();
    if (isStrEmptyOrUndefined(taskId)) {
        layer.msg("请选择任务配置");
        return;
    }
    var sTime = $('#planStartTime').val();
    if (isStrEmptyOrUndefined(sTime)) {
        layer.msg("请选择开始时间");
        return;
    }
    var eTime = $('#planEndTime').val();
    if (isStrEmptyOrUndefined(eTime)) {
        layer.msg("请选择结束时间");
        return;
    }
    if (comTimeDay(sTime, eTime)) {
        return;
    }
    var hour = $('#planHour').val();
    if (isStrEmptyOrUndefined(hour)) {
        hour = 0;
    }
    var minute = $('#planMinute').val();
    if (isStrEmptyOrUndefined(minute)) {
        minute = 0;
    }
    var list = {
        Plan: newPlan,
        TaskId: taskId,
        PlannedStartTime: sTime,
        PlannedEndTime: eTime,
        EstimatedHour: hour,
        EstimatedMin: minute
    }
    var items = planTaskData('#addPlanTaskList', false);
    if (items === 1) {
        return;
    } else {
        if (items.length) {
            list.Items = items;
        }
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    $('#showPlanModal').modal('hide');
                    getPlanConfig();
                }
            });
    }
    showConfirm(`新增计划：${newPlan}`, doSth);
}
