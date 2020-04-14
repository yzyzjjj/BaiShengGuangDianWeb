function pageReady() {
    $('.ms2').select2();
    $('.table-bordered td').css('border', '1px solid');
    $("#startTime,#endTime").val(getDate()).datepicker('update');
    window.onload = () => {
        $("#startTime,#endTime").removeAttr("readonly");
    }
    getPlan();
    getGroup();
    getState();
    $('#groupSelect').on('select2:select', function () {
        getProcessor();
    });
    $('#updateTask').on('click', function () {
        _isClick = !_isClick;
        if (_isClick) {
            $('#taskEstimatedTime .textOn').addClass('hidden').siblings('.textIn').removeClass('hidden');
            $('#taskScore .textOn').addClass('hidden').siblings('.textIn').removeClass('hidden');
            $('#taskEstimatedTime .hour').val(_taskDetailData.EstimatedHour);
            $('#taskEstimatedTime .minute').val(_taskDetailData.EstimatedMin);
            $('#taskScore .score').val(_taskDetailData.Score);
            var v = $(this).val();
            if (v == 3) {
                $('#taskActualTime .textOn').addClass('hidden').siblings('.textIn').removeClass('hidden');
                $('#taskActualScore .textOn').addClass('hidden').siblings('.textIn').removeClass('hidden');
                $('#taskActualTime .hour').val(_taskDetailData.ActualHour);
                $('#taskActualTime .minute').val(_taskDetailData.ActualMin);
                $('#taskActualScore .score').val(_taskDetailData.ActualScore);
            }
        } else {
            $('#taskDesc').val(_taskDetailData.Desc);
            $('#taskDetailTable .textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
        }
        $('#taskDesc').prop('disabled', !_isClick);
    });
    $('#updateCheck').on('click', function () {
        _isClick = !_isClick;
        if (_isClick) {
            $('#checkDetailTable .textOn').addClass('hidden').siblings('.textIn').removeClass('hidden');
            $('#checkEstimatedTime .hour').val(_taskDetailData.EstimatedHour);
            $('#checkEstimatedTime .minute').val(_taskDetailData.EstimatedMin);
            $('#checkScore .score').val(_taskDetailData.Score);
            var v = $(this).val();
            if (v == 3) {
                $('#checkActualTime .hour').val(_taskDetailData.ActualHour);
                $('#checkActualTime .minute').val(_taskDetailData.ActualMin);
                $('#checkActualScore .score').val(_taskDetailData.ActualScore);
                $('#checkResult').val(_taskDetailData.CheckResult);
            } else {
                $('#checkActualTime .textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
                $('#checkActualScore .textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
                $('#checkResultDesc .textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
            }
        } else {
            $('#checkDesc').val(_taskDetailData.Desc);
            $('#checkDetailTable .textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
        }
        $('#checkDesc').prop('disabled', !_isClick);
    });
    $('.minute').on('input', function () {
        var v = $(this).val();
        if (parseInt(v) > 59) {
            $(this).val(59);
        }
    });
    $('.toZero').on('focus', function () {
        var v = $(this).val();
        if (v == 0) {
            $(this).val('');
        }
    });
    $('.toZero').on('blur', function () {
        var v = $(this).val();
        if (isStrEmptyOrUndefined(v)) {
            $(this).val('0');
        }
    });
    $('#taskList').on('click', '.delAddTask', function () {
        var tr = $(this).parents('tr');
        setNumTotalOrder(tr, -1);
        $('#taskList .addTask').prop('disabled', false);
        tr.remove();
    });
    $('#taskList').on('input','.minute', function () {
        var v = $(this).val();
        if (parseInt(v) > 59) {
            $(this).val(59);
        }
    });
    $('#taskList').on('focus','.toZero', function () {
        var v = $(this).val();
        if (v == 0) {
            $(this).val('');
        }
    });
    $('#taskList').on('blur','.toZero', function () {
        var v = $(this).val();
        if (isStrEmptyOrUndefined(v)) {
            $(this).val('0');
        }
    });
    $('#taskList').on('select2:select', '.group', function () {
        var v = $(this).val();
        var processorEl = $(this).parents('tr').find('.processor');
        setProcessorSelect(v, processorEl);
    });
    $('#taskList').on('select2:select', '.module', function () {
        var module = $(this).find('option:selected').attr('isCheck');
        var tr = $(this).parents('tr');
        parseInt(module) ? tr.find('.taskName').addClass('hidden').siblings().removeClass('hidden') : tr.find('.taskNameSelect').parent().addClass('hidden').siblings().removeClass('hidden');
    });
    $('#taskList').on('input', '.relation', function () {
        var v = $(this).val();
        v = parseInt(v);
        var tr = $(this).parents('tr');
        var num = tr.find('.order').text();
        num = parseInt(num) - 1;
        if (v > num) {
            $(this).val(num);
        }
    });
    $('#taskTable').css('maxHeight', innerHeight * 0.7);
}

//设置操作员选项
function setProcessorSelect(groupId, el) {
    el.empty();
    var op = '<option value = "{0}">{1}</option>';
    var ops = '';
    for (var i = 0, len = _processor.length; i < len; i++) {
        var d = _processor[i];
        if (groupId == d.GroupId) {
            ops += op.format(d.ProcessorId, d.Processor);
        }
    }
    el.append(ops);
}

//是否点击修改/取消
var _isClick = false;

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
        var options = '<option value="0" task=0>所有计划</option>';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Plan, d.TaskId);
        }
        $('#planSelect').append(options);
    });
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
        var option = '<option value="{0}">{1}</option>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Group);
        }
        if (resolve == null) {
            $('#groupSelect').empty();
            $('#groupSelect').append('<option value="0">所有分组</option>');
            $('#groupSelect').append(options);
            getProcessor();
        } else {
            resolve(options);
        }

    });
}

var _processor = null;
//获取操作员
function getProcessor(resolve) {
    var opType = 1081;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var groupId = resolve == null ? $('#groupSelect').val() : 0;
    if (groupId == null) {
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
        _processor = ret.datas;
        var len = _processor.length;
        if (!len) {
            return;
        }
        var option = '<option value="{0}">{1}</option>';
        var options = '';
        for (var i = 0; i < len; i++) {
            var d = _processor[i];
            options += option.format(d.Id, d.Processor);
        }
        if (resolve == null) {
            $('#processorSelect').empty();
            $('#processorSelect').append('<option value="0">所有人</option>');
            $('#processorSelect').append(options);
        } else {
            resolve(options);
        }
    }, 0);
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
        var options = '<option value="-1">所有进度</option>';
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

var _taskData = null;
//获取任务管理列表
function getTaskList() {
    var opType = 1026;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    _taskData = {};
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
    var list = { planId, pId, state}
    var sTime = $('#startTime').val();
    if (!isStrEmptyOrUndefined(sTime)) {
        list.sTime = `${sTime} 00:00:00`;
    }
    var eTime = $('#endTime').val();
    if (!isStrEmptyOrUndefined(eTime)) {
        list.eTime = `${eTime} 23:59:59`;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
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
            var id = d.Id;
            _taskData[id] = d;
            var fromOrder = d.TotalOrder;
            var tr = `<tr>
                    <td class="num">${i + 1}</td>
                    <td>${d.Processor}</td>
                    <td>${d.Plan}</td>
                    <td>${d.StateDesc}</td>
                    <td>${d.Module}</td>
                    <td>${d.Item}</td>
                    <td class="totalOrder">${fromOrder}</td>
                    <td>${d.Order}</td>
                    <td>${d.Relation}</td>
                    <td>${state == 0 && i != 0 ? '<button type="button" class="btn btn-primary btn-sm" onclick="upTask({0},{1},{2},{3})">上移</button>'.format(fromOrder, rData[i - 1].TotalOrder, id, rData[i - 1].Id) : ''}</td>
                    <td>${d.EstimatedTime}</td>
                    <td>${d.Score}</td>
                    <td>${noShowSecond(d.ActualStartTime)}</td>
                    <td>${d.ActualTime}</td>
                    <td>${d.ActualScore}</td>
                    <td><button type="button" class="btn btn-info btn-sm" onclick="showDetailModal(${id})">详情</button></td>
                    <td>
                        <button type="button" class="btn btn-success btn-sm addTask" onclick="addTask.call(this,${id})"><i class="fa fa-plus"></i></button>
                        <button type="button" class="btn btn-danger btn-sm" onclick="delTask(${id},\'${d.Item}\')"><i class="fa fa-minus"></i></button>
                        ${state == 3 ? '' : state == 4 ? '<button type="button" class="btn btn-primary btn-sm" onclick="taskStartStop(1,{0},\'{1}\')">启动</button>'.format(id, d.Item) : '<button type="button" class="btn btn-warning btn-sm" onclick="taskStartStop(0,{0},\'{1}\')">停止</button>'.format(id, d.Item)}
                    </td>
                </tr>`;
            ops += tr;
        }
        $('#taskList').append(ops);
        $('#taskTable').removeClass('hidden');
    });
}

var _taskDetailData = null;
var _taskDetailId = null;
//详情查看
function showDetailModal(tId) {
    var opType = 1027;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({ tId });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        _isClick = false;
        var d = ret.datas[0];
        _taskDetailData = d;
        _taskDetailId = tId;
        if (d.IsCheck) {
            $('#checkDesc').prop('disabled', true);
            $('#checkDetailTable .textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
            var state = d.State;
            $('#updateCheck').val(state);
            $('#checkName').text(d.Check);
            $('#checkPlan').text(d.Plan);
            $('#checkTaskName').text(d.Item);
            $('#checkTaskProcessor').text(d.Processor);
            $('#checkRedo').text(d.IsRedo ? '已返工' : '未返工');
            $('#checkResultDesc .textOn').text(d.CheckResultDesc);
            $('#checkProcessor').text(d.CheckProcessor);
            $('#checkAssignor').text(d.Assignor);
            $('#checkEstimatedTime .textOn').text(d.EstimatedTime);
            $('#checkScore .textOn').text(d.Score);
            $('#checkActualStartTime').text(noShowSecond(d.ActualStartTime));
            $('#checkActualEndTime').text(noShowSecond(d.ActualEndTime));
            $('#checkActualTime .textOn').text(d.ActualTime);
            $('#checkActualScore .textOn').text(d.ActualScore);
            $('#checkDesc').val(d.Desc);
            var isEnable = function (data) {
                return `<input type="checkbox" class="icb_minimal isEnable" value=${data}>`;
            }
            var order = function (a, b, c, d) {
                return d.row + 1;
            }
            var desc = function (data) {
                return `<span class="textOn">${data == null ? '' : data}</span><textarea class="form-control desc textIn hidden" style="resize: vertical;margin:auto;width:200px"></textarea>`;
            }
            var checkTime = function (data) {
                return `<span class="textOn">${data == '0001-01-01 00:00:00' ? '' : data.slice(0, data.indexOf(" "))}</span><input type="text" class="form_date form-control text-center checkTime textIn hidden" style="width:120px;cursor: pointer">`;
            }
            var result = function (data) {
                var res = data.Result;
                var op = '<button type="button" class="btn btn-primary btn-{1} btn-sm result" onclick="updateCheckTask.call(this,{0},1)" disabled>通过</button>' +
                    '<button type="button" class="btn btn-primary btn-{2} btn-sm result" onclick = "updateCheckTask.call(this,{0},2)" disabled>不通过</button>';
                return op.format(data.Id, res == 1 ? 'success' : 'info', res == 2 ? 'danger' : 'info');
            }
            var img = function (data) {
                return `<button type="button" class="btn btn-primary btn-sm" onclick="showImgModel(\'${data.ImageList}\')"}>查看</button>`;
            }
            var rData = d.Items;
            var checkItems = {};
            for (var i = 0, len = rData.length; i < len; i++) {
                d = rData[i];
                checkItems[d.Id] = d;
            }
            $('#checkDetailList').DataTable({
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
                    { "data": "Id", "title": "选择", "render": isEnable },
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Item", "title": "检验流程" },
                    { "data": "Method", "title": "检验方法" },
                    { "data": "Desc", "title": "检验说明", "render": desc },
                    { "data": "CheckTime", "title": "检验时间", "render": checkTime },
                    { "data": null, "title": "检验结果", "render": result },
                    { "data": null, "title": "图片", "render": img }
                ],
                "drawCallback": function (settings, json) {
                    $(this).find('.isEnable').iCheck({
                        handle: 'checkbox',
                        checkboxClass: 'icheckbox_minimal-blue',
                        increaseArea: '20%'
                    });
                    if (state != 3) {
                        $(this).find('.isEnable').iCheck('disable');
                    }
                    $(this).find('.form_date').attr("readonly", true).datepicker({
                        language: 'zh-CN',
                        format: 'yyyy-mm-dd',
                        maxViewMode: 2,
                        todayBtn: "linked",
                        autoclose: true
                    });
                    $(this).find('.desc').parents('td').addClass('no-padding');
                    $('#checkDetailList .isEnable').on('ifChanged', function () {
                        var tr = $(this).parents('tr');
                        var isChecked = $(this).is(':checked');
                        if (isChecked) {
                            var v = $(this).val();
                            var item = checkItems[v];
                            tr.find('.textIn').removeClass('hidden').siblings('.textOn').addClass('hidden');
                            tr.find('.desc').val(item.Desc);
                            var time = item.CheckTime;
                            time = time == '0001-01-01 00:00:00' ? '' : time.slice(0, time.indexOf(' '));
                            tr.find('.checkTime').val(time).datepicker('update');
                        } else {
                            tr.find('.textIn').addClass('hidden').siblings('.textOn').removeClass('hidden');
                        }
                        tr.find('.result').prop('disabled', !isChecked);
                    });
                }
            });
            $('#showCheckModal').modal('show');
        } else {
            $('#taskDesc').prop('disabled', true);
            $('#taskDetailTable .textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
            $('#updateTask').val(d.State);
            $('#taskName').text(d.Item);
            $('#taskPlan').text(d.Plan);
            $('#taskProcessor').text(d.Processor);
            $('#taskAssignor').text(d.Assignor);
            $('#taskState').text(d.StateDesc);
            $('#taskRedo').text(d.IsRedo ? '已返工' : '未返工');
            $('#taskEstimatedTime .textOn').text(d.EstimatedTime);
            $('#taskScore .textOn').text(d.Score);
            $('#taskActualStartTime').text(noShowSecond(d.ActualStartTime));
            $('#taskActualEndTime').text(noShowSecond(d.ActualEndTime));
            $('#taskActualTime .textOn').text(d.ActualTime);
            $('#taskActualScore .textOn').text(d.ActualScore);
            $('#taskDesc').val(d.Desc);
            $('#showTaskModal').modal('show');
        }
    });
}

//检验项通过不通过更新
function updateCheckTask(id, result) {
    var opType = 1028;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var tr = $(this).parents('tr');
    var desc = tr.find('.desc').val();
    var checkTime = tr.find('.checkTime').val();
    checkTime = isStrEmptyOrUndefined(checkTime) ? getFullTime() : `${checkTime} 00:00:00`;
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        Id: _taskDetailId,
        Items: [{
            CheckTime: checkTime,
            Desc: desc,
            Result: result,
            Id: id
        }]
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            showDetailModal(_taskDetailId);
        }
    });
}

//图片详情模态框
function showImgModel(img) {
    $('#imgOld').empty();
    $("#imgOldList").empty();
    if (isStrEmptyOrUndefined(img)) {
        $('#imgOld').append('图片：<font style="color:red" size=5>无</font>');
    } else {
        $('#imgOld').append('图片：');
        img = img.split(",");
        var data = {
            type: fileEnum.Manufacture,
            files: JSON.stringify(img)
        };
        ajaxPost("/Upload/Path", data,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }
                var imgOps = "";
                for (var i = 0; i < ret.data.length; i++) {
                    imgOps += `<div class="imgOption col-lg-2 col-md-3 col-sm-4 col-xs-6">
                    <div class="thumbnail">
                    <img src=${ret.data[i].path} style="height:200px">
                    </div>
                    </div>`;
                }
                $("#imgOldList").append(imgOps);
            });
    }
    $('#showImgModel').modal('show');
}

//任务详情保存修改
function updateTaskDetail() {
    var opType = 1028;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    if (!_isClick) {
        layer.msg('请先修改数据');
        return;
    }
    var desc = $('#taskDesc').val();
    var estimatedHour = $('#taskEstimatedTime .hour').val();
    if (isStrEmptyOrUndefined(estimatedHour)) {
        estimatedHour = 0;
    }
    var estimatedMin = $('#taskEstimatedTime .minute').val();
    if (isStrEmptyOrUndefined(estimatedMin)) {
        estimatedMin = 0;
    }
    var score = $('#taskScore .score').val();
    if (isStrEmptyOrUndefined(score)) {
        score = 0;
    }
    var list = {
        Id: _taskDetailId,
        EstimatedHour: estimatedHour,
        EstimatedMin: estimatedMin,
        Score: score,
        Desc: desc
    }
    var state = $('#updateTask').val();
    if (state == 3) {
        var actualHour = $('#taskActualTime .hour').val();
        if (isStrEmptyOrUndefined(actualHour)) {
            actualHour = 0;
        }
        var actualMin = $('#taskActualTime .minute').val();
        if (isStrEmptyOrUndefined(actualMin)) {
            actualMin = 0;
        }
        var actualScore = $('#taskActualScore .score').val();
        if (isStrEmptyOrUndefined(actualScore)) {
            actualScore = 0;
        }
        list.ActualHour = actualHour;
        list.ActualMin = actualMin;
        list.ActualScore = actualScore;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    showDetailModal(_taskDetailId);
                }
            });
    }
    showConfirm("保存", doSth);
}

//检验详情保存修改
function updateCheckDetail() {
    var opType = 1028;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    if (!_isClick) {
        layer.msg('请先修改数据');
        return;
    }
    var desc = $('#checkDesc').val();
    var estimatedHour = $('#checkEstimatedTime .hour').val();
    if (isStrEmptyOrUndefined(estimatedHour)) {
        estimatedHour = 0;
    }
    var estimatedMin = $('#checkEstimatedTime .minute').val();
    if (isStrEmptyOrUndefined(estimatedMin)) {
        estimatedMin = 0;
    }
    var score = $('#checkScore .score').val();
    if (isStrEmptyOrUndefined(score)) {
        score = 0;
    }
    var list = {
        Id: _taskDetailId,
        EstimatedHour: estimatedHour,
        EstimatedMin: estimatedMin,
        Score: score,
        Desc: desc
    }
    var state = $('#updateCheck').val();
    if (state == 3) {
        var actualHour = $('#checkActualTime .hour').val();
        if (isStrEmptyOrUndefined(actualHour)) {
            actualHour = 0;
        }
        var actualMin = $('#checkActualTime .minute').val();
        if (isStrEmptyOrUndefined(actualMin)) {
            actualMin = 0;
        }
        var actualScore = $('#checkActualScore .score').val();
        if (isStrEmptyOrUndefined(actualScore)) {
            actualScore = 0;
        }
        var checkResult = $('#checkResult').val();
        if (isStrEmptyOrUndefined(checkResult)) {
            layer.msg('请选择检验情况');
            return;
        }
        list.ActualHour = actualHour;
        list.ActualMin = actualMin;
        list.ActualScore = actualScore;
        list.CheckResult = checkResult;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    showDetailModal(_taskDetailId);
                }
            });
    }
    showConfirm("保存", doSth);
}

//任务启动停止
function taskStartStop(isStart, tId, itemName) {
    var opType = isStart ? 1032 : 1033;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({ tId });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getTaskList();
                }
            });
    }
    showConfirm(`${isStart ? '启动' : '停止'}任务：${itemName}`, doSth);
}

//删除任务
function delTask(tId, itemName) {
    var opType = 1030;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({ tId });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getTaskList();
                }
            });
    }
    showConfirm(`删除任务：${itemName}`, doSth);
}

//上移任务
function upTask(fromOrder, toOrder, fromId, toId) {
    var opType = 1034;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var fromData = _taskData[fromId];
    var toData = _taskData[toId];
    if (fromData.Processor == toData.Processor && toData.State == 1) {
        layer.msg('不能上移到该操作工进行中的任务之前');
        return;
    }
    if (fromData.Plan == toData.Plan && fromData.Relation == toData.Order) {
        layer.msg('不能上移到同计划下的关联任务之前');
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            FromOrder: fromOrder,
            ToOrder: toOrder
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getTaskList();
                }
            });
    }
    showConfirm(`上移任务：${fromData.Item}`, doSth);
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

//获取检验单
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

//添加任务
function addTask(id) {
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
    Promise.all([groupSelect, processorSelect, moduleSelect, taskNameSelect]).then((results) => {
        var trData = _taskData[id];
        var trEl = $(this).parents('tr');
        var num = parseInt(trEl.find('.num').text());
        var tr = `<tr>
                <td class="num">${num + 1}</td>
                <td>
                    <div class="flexStyle" style="width: 240px;margin:auto">
                        <select class="ms2 form-control group">${results[0]}</select>
                        <select class="ms2 form-control processor">${results[1]}</select>
                    </div>
                </td>
                <td>${trData.Plan}</td>
                <td>等待中</td>
                <td>
                    <div style="width: 120px;margin:auto">
                        <select class="ms2 form-control module">${results[2]}</select>
                    </div>
                </td>
                <td>
                    <div style="width: 120px;margin:auto">
                        <input type="text" class="form-control text-center taskName" maxlength="20"><div class="taskNameTwo">${results[3]}</div>
                    </div>
                </td>
                <td class="totalOrder">${trData.TotalOrder + 1}</td>
                <td class="order">${trData.Order + 1}</td>
                <td><input type="text" class="form-control text-center relation toZero" oninput="onInput(this, 10, 0)" onblur="onInputEnd(this)" style="width:80px;margin:auto" value="0"></td>
                <td></td>
                <td>
                    <div class="flexStyle" style="width:140px;margin:auto">
                        <input type="text" class="form-control text-center hour toZero" oninput="onInput(this, 3, 0)" onblur="onInputEnd(this)" value="0">
                        <label class="control-label" style="white-space: nowrap; margin: 0">小时</label>
                        <input type="text" class="form-control text-center minute toZero" oninput="onInput(this, 3, 0)" onblur="onInputEnd(this)" value="0">
                        <label class="control-label" style="white-space: nowrap; margin: 0">分</label>
                    </div>
                </td>
                <td><input type="text" class="form-control text-center score toZero" oninput="onInput(this, 3, 0)" onblur="onInputEnd(this)" style="width:80px;margin:auto" value="0"></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm delAddTask"><i class="fa fa-minus"></i></button>
                    <button type="button" class="btn btn-primary btn-sm" onclick="updateAddTask.call(this,${trData.PlanId},${trData.TotalOrder})">保存</button>
                </td>
            </tr>`;
        trEl.after(tr);
        var addTr = trEl.next();
        addTr.find('.ms2').select2();
        var isCheck = parseInt(addTr.find('.module option:selected').attr('ischeck'));
        addTr.find(isCheck ? '.taskName' : '.taskNameTwo').addClass('hidden');
        setNumTotalOrder(addTr, 1);
        $('#taskList .addTask').prop('disabled', true);
    });
}

//序号 总顺序设置
function setNumTotalOrder(tr, count) {
    var trs = tr.nextAll();
    for (var i = 0, len = trs.length; i < len; i++) {
        var trNext = trs.eq(i);
        var numEl = trNext.find('.num');
        numEl.text(parseInt(numEl.text()) + count);
        var totalOrder = trNext.find('.totalOrder');
        totalOrder.text(parseInt(totalOrder.text()) + count);
    }
}

//保存添加的任务项
function updateAddTask(planId, totalOrder) {
    var opType = 1029;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var tr = $(this).parents('tr');
    var person = tr.find('.processor').val();
    if (isStrEmptyOrUndefined(person)) {
        layer.msg('请选择操作员');
        return;
    }
    var moduleId = tr.find('.module').val();
    if (isStrEmptyOrUndefined(moduleId)) {
        layer.msg('请选择模块名');
        return;
    }
    var isCheck = !!parseInt(tr.find('.module').find(`option[value=${moduleId}]`).attr('isCheck'));
    var checkId, item;
    if (isCheck) {
        checkId = tr.find('.taskNameSelect').val();
        if (isStrEmptyOrUndefined(checkId)) {
            layer.msg('请选择检验任务');
            return;
        }
        checkId = parseInt(checkId);
        item = tr.find(`.taskNameSelect option[value=${checkId}]`).text();
    } else {
        checkId = 0;
        item = tr.find('.taskName').val();
        if (isStrEmptyOrUndefined(item)) {
            layer.msg('任务名不能为空');
            return;
        }
    }
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
    var score = tr.find('.score').val();
    if (isStrEmptyOrUndefined(score)) {
        score = 0;
    }
    score = parseInt(score);
    var relation = tr.find('.relation').val();
    if (isStrEmptyOrUndefined(relation)) {
        relation = 0;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            Person: person,
            PlanId: planId,
            ModuleId: moduleId,
            IsCheck: isCheck,
            CheckId: checkId,
            Item: item,
            TotalOrder: totalOrder,
            EstimatedHour: hour,
            EstimatedMin: minute,
            Score: score,
            Relation: relation
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getTaskList();
                }
            });
    }
    showConfirm("保存", doSth);
}
