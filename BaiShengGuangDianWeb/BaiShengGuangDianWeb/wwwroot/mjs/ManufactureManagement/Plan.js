function pageReady() {
    $('.ms2').select2();
    $("#startTime").val(getDate()).datepicker('update');
    $("#endTime").val(getDate()).datepicker('update');
    getTaskState();
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
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.State);
        }
        $('#selectState').append(options);
    });
}

//计划配置项
function getPlanConfig() {
    var opType = 1039;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
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
}