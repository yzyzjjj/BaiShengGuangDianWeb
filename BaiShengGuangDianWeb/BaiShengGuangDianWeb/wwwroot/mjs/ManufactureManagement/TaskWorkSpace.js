function pageReady() {
    $('.ms2').select2();
    $('.table-bordered td').css('border', '1px solid');
    getGroup();
    $('#groupSelect').on('select2:select', function () {
        getProcessor();
        getScoreList();
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
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Group);
        }
        $('#groupSelect').append(options);
        getProcessor();
        getScoreList();
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
        var option = '<option value = "{0}" account="{2}">{1}</option>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.ProcessorId, d.Processor, d.Account);
        }
        $('#processorSelect').append(options);
    });
}

//任务绩效表
function getScoreList() {
    var opType = 1003;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var groupId = $('#groupSelect').val();
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        gId: groupId
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#scoreList').empty();
        var rData = ret.datas;
        var trs = '';
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            trs += `<tr><td>${i + 1}</td><td>${d.Processor}</td><td>${d.Score}</td></tr>`;
        }
        $('#scoreList').append(trs);
    });
}

var _taskData = null;
//获取任务
function getAccountTask() {
    var opType = 1000;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    _taskData = {};
    var account = $('#processorSelect option:selected').attr('account');
    if (isStrEmptyOrUndefined(account)) {
        layer.msg('请选择操作员');
        return;
    }
    _taskData.Account = account;
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({ account });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            $('#taskDetail').addClass('hidden');
            $('#finishList').addClass('hidden');
            return;
        }
        var d = ret.datas[0];
        _taskData.TaskId = d.Id;
        d.IsRedo ? $('#redo').removeClass('hidden') : $('#redo').addClass('hidden');
        var state = d.State;
        $('#startBtn').prop('disabled', !(state == 0 || state == 2));
        $('.finish').prop('disabled', state != 1);
        $('#taskName').text(d.Item);
        $('#planName').text(d.Plan);
        $('#actualStartTime').text(d.ActualStartTime);
        $('#actualTime').text(d.ActualTime);
        $('#taskDesc').val(d.Desc);
        $('#estimatedTime').text(d.EstimatedTime);
        $('#score').text(d.Score);
        $('#processor').text(d.Processor);
        $('#assignor').text(d.Assignor);
        $('#nextTask').text(d.NextTask);
        var checkProcessor = d.CheckProcessor;
        if (isStrEmptyOrUndefined(checkProcessor)) {
            $('#checkProcessor').addClass('hidden');
            $('#checkProcessor').prev().addClass('hidden');
        } else {
            $('#checkProcessor').text(checkProcessor);
        }
        $('#taskDetail').removeClass('hidden');
        getUnFinishedList(0, '#unFinishEdList');
        getUnFinishedList(1, '#finishEdList');
    });
}

//任务开始 暂停 完成
function taskHandle(num) {
    var opType;
    switch (num) {
        case 0:
            opType = 1004;
            break;
        case 1:
            opType = 1005;
            break;
        case 2:
            opType = 1006;
            break;
    }
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(_taskData);
    ajaxPost('/Relay/Post', data, function (ret) {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            getAccountTask();
        }
    });
}

//待完成 已完成任务
function getUnFinishedList(isFinish, el, limit) {
    var opType = isFinish ? 1002 : 1001;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var account = _taskData.Account;
    if (limit == null) {
        limit = 10;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({ account, limit });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var order = function (a, b, c, d) {
            return d.row + 1;
        }
        $(el).DataTable({
            dom: '<"pull-left"l><"pull-right"f>rtip',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": rData,
            "aaSorting": [[0, "asc"]],
            "aLengthMenu": [10, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 10, //默认显示的记录数
            "columns": [
                { "data": null, "title": "序号", "render": order },
                { "data": "Item", "title": "任务名称" },
                { "data": "Plan", "title": "所属计划号" },
                { "data": "EstimatedTime", "title": "预计用时" },
                { "data": "Score", "title": "任务绩效" },
                { "data": "ActualTime", "title": "实际工时", "visible": limit !== 10 },
                { "data": "ActualScore", "title": "实际绩效", "visible": limit !== 10 }
            ]
        });
        $('#finishList').removeClass('hidden');
    });
}
