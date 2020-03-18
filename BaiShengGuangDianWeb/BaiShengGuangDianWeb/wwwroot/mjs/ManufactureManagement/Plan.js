function pageReady() {
    $('.ms2').select2();
    getTaskConfig();
    getTaskState();
    $("#startTime").val(getDate()).datepicker('update');
    $("#endTime").val(getDate()).datepicker('update');
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
            _planIdData.splice(_planIdData.indexOf(v),1);
            tr.find('.textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
        }
    });
    $("#planReuse").on("ifChanged", function (event) {
        if ($(this).is(":checked")) {
            $("#updatePlanBtn").attr("disabled", "disabled");
        } else {
            $("#updatePlanBtn").removeAttr("disabled");
        }
    });
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

var _planConfigData = null;
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
            <div class="flexStyle textIn hidden">
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
            return data.State == '待下发' ? `<button type="button" class="btn btn-info btn-sm" onclick="issue(${data.Id})">下发</button>` : '';
        }
        var detailBtn = function (data) {
            return `<button type="button" class="btn btn-primary btn-sm" onclick="planTaskDetail(${data.TaskId})">查看任务</button>`;
        }
        var logBtn = function (data) {
            return `<button type="button" class="btn btn-success btn-sm" onclick="showLogModel(${data.Id})">查看</button>`;
        }
        $('#planConfigList').DataTable({
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
                { "data": "State", "title": "状态" },
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

//计划任务详情
function planTaskDetail() {

}

//计划日志弹窗
function showLogModel() {

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
    var planName = [];
    for (var i = 0; i < len; i++) {
        planName.push(_planConfigData[_planIdData[i]].Plan);
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            ids: _planIdData
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
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
}

//计划管理弹窗
function showPlanModal() {
    $('#showPlanModal').modal('show');
}