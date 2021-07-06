var _permissionList = [];
function pageReady() {
    _permissionList[392] = { uIds: ['getAccountTaskBtn'] };
    _permissionList[393] = { uIds: ['startBtn'] };
    _permissionList[394] = { uIds: ['pauseBtn'] };
    _permissionList[395] = { uIds: ['finishBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
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
    var data = {}
    data.opType = 1077;
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
    }, 0);
}

//获取操作员
function getProcessor() {
    var groupId = $('#groupSelect').val();
    var data = {}
    data.opType = 1081;
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
            options += option.format(d.Id, d.Processor, d.Account);
        }
        $('#processorSelect').append(options);
    }, 0);
}

//任务绩效表
function getScoreList() {
    var groupId = $('#groupSelect').val();
    if (isStrEmptyOrUndefined(groupId)) {
        layer.msg('请选择工作组');
        return;
    }
    var data = {}
    data.opType = 1003;
    data.opData = JSON.stringify({
        gId: groupId
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#scoreTime').text(`${ret.sTime.split(' ')[0]} ~ ${ret.eTime.split(' ')[0]}`);
        $('#scoreList').empty();
        var rData = ret.datas;
        var trs = '';
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            trs += `<tr><td>${i + 1}</td><td>${d.Processor}</td><td>${d.Score}</td></tr>`;
        }
        $('#scoreList').append(trs);
    }, 0);
}

var _taskData = null;
//获取任务
function getAccountTask() {
    var account = $('#processorSelect option:selected').attr('account');
    if (isStrEmptyOrUndefined(account)) {
        layer.msg('请选择操作员');
        return;
    }
    var gId = $('#groupSelect').val() || 0;
    _taskData = {
        Account: account,
        GId: gId
    };
    var data = {}
    data.opType = 1000;
    data.opData = JSON.stringify({ gId, account });
    ajaxPost('/Relay/Post', data, function (ret) {
        getUnFinishedList(0, '#unFinishEdList');
        getUnFinishedList(1, '#finishEdList');
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            $('#taskDetail').addClass('hidden');
            return;
        }
        var d = ret.datas[0];
        _taskData.TaskId = d.Id;
        d.IsRedo ? $('#redo').removeClass('hidden') : $('#redo').addClass('hidden');
        var state = d.State;
        $('#startBtn').prop('disabled', !(state == 0 || state == 2 || state == 5));
        $('.finish').prop('disabled', state != 1);
        $('#taskName').text(d.Item);
        $('#planName').text(d.Plan);
        $('#actualStartTime').text(noShowSecond(d.ActualStartTime));
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
    });
}

//任务开始 暂停 完成
function taskHandle(num) {
    var opType = null;
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
    var account = _taskData.Account;
    if (limit == null) {
        limit = 10;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({ account, gId: _taskData.GId, limit });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        if (rData[0] == null) {
            rData = [];
        }
        $(el).DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": rData,
            "aaSorting": [[0, "asc"]],
            "aLengthMenu": [10, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 10, //默认显示的记录数
            "columns": [
                { "data": null, "title": "序号", "render": (a, b, c, d) => ++d.row },
                { "data": "Item", "title": "任务名称" },
                { "data": "Plan", "title": "所属计划号" },
                { "data": "EstimatedTime", "title": "预计用时" },
                { "data": "Score", "title": "任务绩效" },
                { "data": "ActualTime", "title": "实际工时", "visible": limit !== 10, "sClass": "text-info" },
                { "data": "ActualScore", "title": "实际绩效", "visible": limit !== 10, "sClass": "text-info" }
            ]
        });
        $('#finishList').removeClass('hidden');
    });
}
