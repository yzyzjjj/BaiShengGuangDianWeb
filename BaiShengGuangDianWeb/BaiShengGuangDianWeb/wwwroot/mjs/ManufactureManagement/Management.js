function pageReady() {
    $('.ms2').select2();
    $("#startTime").val(getDate()).datepicker('update');
    $("#endTime").val(getDate()).datepicker('update');
    getPlan();
    getGroup();
    getState();
    $('#groupSelect').on('select2:select', function () {
        getProcessor();
    });
    $('#taskTable').css('maxHeight', innerHeight * 0.7);
}

//获取计划号
function getPlan() {
    var opType = 1025;
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
        $('#planSelect').empty();
        var list = ret.datas;
        var option = '<option value="{0}" task="{2}">{1}</option>';
        var options = '<option value=0 task=0>所有计划</option>';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Plan, d.TaskId);
        }
        $('#planSelect').append(options);
    });
}

//获取分组
function getGroup() {
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
        $('#groupSelect').empty();
        var list = ret.datas;
        var option = '<option value="{0}">{1}</option>';
        var options = '<option value=0>所有分组</option>';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Group);
        }
        $('#groupSelect').append(options);
        getProcessor();
    });
}

//获取操作员
function getProcessor() {
    var opType = 1081;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var groupId = $('#groupSelect').val();
    if (isStrEmptyOrUndefined(groupId)) {
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        groupId: groupId,
        menu: true
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#processorSelect').empty();
        var list = ret.datas;
        var len = list.length;
        if (!len) {
            return;
        }
        var option = '<option value="{0}">{1}</option>';
        var options = '<option value=0>所有人</option>';
        for (var i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.ProcessorId, d.Processor);
        }
        $('#processorSelect').append(options);
    });
}

//获取任务状态
function getState() {
    var opType = 1024;
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
        $('#stateSelect').empty();
        var list = ret.datas;
        var option = '<option value="{0}">{1}</option>';
        var options = '<option value=0>所有进度</option>';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.State);
        }
        $('#stateSelect').append(options);
    });
}

//计划日志弹窗
function showLogModel() {
    var opType = 1088;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var planId = $('#planSelect').val();
    if (isStrEmptyOrUndefined(planId)) {
        layer.msg('请选择计划号');
        return;
    }
    $('#planName').text($('#planSelect option:selected').text());
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({ planId });
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

//获取任务管理列表
function getTaskList() {
    var opType = 1026;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var planId = $('#planSelect').val();
    if (isStrEmptyOrUndefined(planId)) {
        layer.msg('请选择计划号');
        return;
    }
    var pId = $('#processorSelect').val();
    if (isStrEmptyOrUndefined(pId)) {
        layer.msg('请选择操作员');
        return;
    }
    var state = $('#stateSelect').val();
    if (isStrEmptyOrUndefined(state)) {
        layer.msg('请选择进度');
        return;
    }
    var sTime = $('#startTime').val();
    var eTime = $('#endTime').val();
    if (isStrEmptyOrUndefined(eTime) || isStrEmptyOrUndefined(sTime)) {
        layer.msg('请选择实际开始时间');
        return;
    }
    if (comTimeDay(sTime, eTime)) {
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({ planId, pId, state, sTime, eTime });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#taskList').empty();
        var rData = ret.datas;
        var i, len = rData.length;
        if (!len) {
            $('#taskTable').addClass('hidden');
            layer.msg('无数据');
            return;
        }
        var ops = '';
        for (i = 0; i < len; i++) {
            var d = rData[i];
            state = d.State;
            var tr = `<tr>
                    <td class="num">${i+1}</td>
                    <td>${d.Processor}</td>
                    <td>${d.Plan}</td>
                    <td>${d.StateDesc}</td>
                    <td>${d.Module}</td>
                    <td>${d.Item}</td>
                    <td>${d.TotalOrder}</td>
                    <td>${d.Order}</td>
                    <td>${d.Relation}</td>
                    <td>${state == 0 && i != 0 ? '<button type="button" class="btn btn-primary btn-sm" onclick="">上移</button>' : ''}</td>
                    <td>${d.EstimatedTime}</td>
                    <td>${d.Score}</td>
                    <td>${d.ActualStartTime}</td>
                    <td>${d.ActualTime}</td>
                    <td>${d.ActualScore}</td>
                    <td><button type="button" class="btn btn-info btn-sm" onclick="">详情</button></td>
                    <td>
                        <button type="button" class="btn btn-success btn-sm"><i class="fa fa-plus"></i></button>
                        <button type="button" class="btn btn-danger btn-sm"><i class="fa fa-minus"></i></button>
                        ${state == 3 ? '' : state == 4 ? '<button type="button" class="btn btn-primary btn-sm" onclick="">启动</button>' : '<button type="button" class="btn btn-warning btn-sm" onclick="">停止</button>' }
                    </td>
                </tr>`;
            ops += tr;
        }
        $('#taskList').append(ops);
        $('#taskTable').removeClass('hidden');
    });
}