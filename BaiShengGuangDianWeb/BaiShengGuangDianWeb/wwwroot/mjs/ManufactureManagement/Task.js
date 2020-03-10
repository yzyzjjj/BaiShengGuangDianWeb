function pageReady() {
    $('.ms2').select2();
    getTaskConfig();
    $('#configItem').on('ifChanged', '.isEnable', function () {
        var tr = $(this).parents('tr');
        var v = $(this).val();
        var data = _taskItem[v];
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
            tr.find('.relation').val(data.Relation);
        } else {
            tr.find('.textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
        }
    });
    $('#configItem').on('select2:select', '.group', function () {
        var v = $(this).val();
        var processorEl = $(this).parents('tr').find('.processor');
        setProcessorSelect(v, processorEl);
    });
    $('#configItem').on('select2:select', '.module', function () {
        var v = $(this).val();
        var module = $(this).find(`option[value=${v}]`).attr('isCheck');
        var tr = $(this).parents('tr');
        parseInt(module) ? tr.find('.taskName').addClass('hidden').siblings().removeClass('hidden') : tr.find('.taskNameSelect').parent().addClass('hidden').siblings().removeClass('hidden');
    });
    $('#selectConfig').on('select2:select', function() {
        getTaskConfigItem();
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
            ops += op.format(d.ProcessorId, d.Processor);
        }
    }
    el.append(ops);
}

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
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Task);
        }
        $('#selectConfig').empty();
        $('#selectConfig').append(options);
        taskTrData();
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
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Group);
        }
        if (resolve != null) {
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
            options += option.format(d.ProcessorId, d.Processor);
        }
        if (resolve != null) {
            resolve(options);
        }
    });
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
    });
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
    });
}

//表格设置
function setTableStyle() {
    $('#configItem').find('.isEnable').iCheck({
        handle: 'checkbox',
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '20%'
    });
    $('#configItem').find('.ms2').select2();
}

var _taskTrData = null;
//tr数据
function taskTrData() {
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
        _taskTrData = `<tr>
            <td><input type="checkbox" class="icb_minimal isEnable" value={8} itemId={9}></td>
            <td class="num">{0}</td>
            <td>
            <span class="textOn">{1}</span>
            <div class="flexStyle textIn hidden" style="width: 240px;margin:auto"><select class="ms2 form-control group">${results[0]}</select><select class="ms2 form-control processor">${results[1]}</select></div>
            </td>
            <td><span class="textOn">{2}</span><div class="textIn hidden" style="width: 120px;margin:auto"><select class="ms2 form-control module">${results[2]}</select></div></td>
            <td><span class="textOn">{3}</span><div class="textIn hidden" style="width: 120px;margin:auto"><input type="text" class="form-control text-center taskName" maxlength="10"><div>${results[3]}</div></div></td>
            <td><span class="textOn">{4}</span>
            <div class="flexStyle textIn hidden" style="width:120px;margin:auto">
            <input type="text" class="form-control text-center hour" maxlength="2" oninput="value=value.replace(/[^\\d]/g,\'\')">
            <label class="control-label" style="white-space: nowrap; margin: 0">小时</label>
            <input type="text" class="form-control text-center minute" maxlength="2" oninput="value=value.replace(/[^\\d]/g,\'\')">
            <label class="control-label" style="white-space: nowrap; margin: 0">分</label>
            </div>
            </td>
            <td><span class="textOn">{5}</span><input type="text" class="form-control text-center textIn hidden score" maxlength="10" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:80px;margin:auto"></td>
            <td class="no-padding"><span class="textOn">{6}</span><textarea class="form-control textIn hidden desc" maxlength="500" style="resize: vertical;width:180px;margin:auto"></textarea></td>
            <td><span class="textOn">{7}</span><input type="text" class="form-control text-center textIn hidden relation" maxlength="10" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:80px;margin:auto"></td>
            <td><button type="button" class="btn btn-primary btn-sm">上移</button></td>
            </tr>`;
        getTaskConfigItem();
    });
}

var _taskItem = null;
//获取任务配置项
function getTaskConfigItem() {
    var opType = 1055;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var taskId = $('#selectConfig').val();
    if (isStrEmptyOrUndefined(taskId)) {
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({ taskId });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        _taskItem = ret.datas;
        var ops = '';
        for (var i = 0, len = _taskItem.length; i < len; i++) {
            var d = _taskItem[i];
            ops += _taskTrData.format(i + 1, d.Processor, d.Module, d.Item, d.EstimatedTime, d.Score, d.Desc, d.Relation, i, d.Id);
        }
        $('#configItem').empty();
        $('#configItem').append(ops);
        setTableStyle();
    });
}

//保存任务配置
function updateTask() {
    var opType = 1056;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var taskId = $('#selectConfig').val();
    if (isStrEmptyOrUndefined(taskId)) {
        layer.msg('请选择配置');
        return;
    }
    var list = [];
    for (var i = 0, len = $('#configItem tr').length; i < len; i++) {
        var tr = $('#configItem tr').eq(i);
        var id = tr.find('.isEnable').attr('itemId');
        if (id == null) {
            id = 0;
        }
        var personId = tr.find('.processor').val();
        if (isStrEmptyOrUndefined(personId)) {
            layer.msg(`序列${i + 1}：请选择操作员`);
            return;
        }
        var moduleId = tr.find('.module').val();
        if (isStrEmptyOrUndefined(moduleId)) {
            layer.msg(`序列${i + 1}：请选择模块名`);
            return;
        }
        var isCheck = !!parseInt(tr.find('.module').find(`option[value=${moduleId}]`).attr('isCheck'));
        var checkId, item;
        if (isCheck) {
            checkId = parseInt(tr.find('.taskNameSelect').val());
            item = tr.find(`.taskNameSelect option[value=${checkId}]`).text();
        } else {
            checkId = 0;
            item = tr.find('.taskName').val();
        }
        var hour = parseInt(tr.find('.hour').val());
        if (isStrEmptyOrUndefined(hour)) {
            hour = 0;
        }
        var minute = parseInt(tr.find('.minute').val());
        if (isStrEmptyOrUndefined(minute)) {
            minute = 0;
        }
        var score = parseInt(tr.find('.score').val());
        if (isStrEmptyOrUndefined(score)) {
            score = 0;
        }
        var desc = tr.find('.desc').val();
        var relation = parseInt(tr.find('.relation').val());
        if (isStrEmptyOrUndefined(relation)) {
            relation = 0;
        }
        list.push({
            TaskId: taskId,
            Order: i + 1,
            Person: personId,
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
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getTaskConfigItem();
                }
            });
    }
    showConfirm("保存", doSth);
}