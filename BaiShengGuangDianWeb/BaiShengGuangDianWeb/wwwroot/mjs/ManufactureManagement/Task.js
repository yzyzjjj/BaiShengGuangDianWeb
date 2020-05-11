var _permissionList = [];
function pageReady() {
    _permissionList[429] = { uIds: ['taskConfigModalBtn'] };
    _permissionList[460] = { uIds: ['addConfigBtn'] };
    _permissionList[461] = { uIds: ['updateConfigBtn'] };
    _permissionList[462] = { uIds: ['delConfigBtn'] };
    _permissionList[430] = { uIds: ['taskModuleModalBtn'] };
    _permissionList[467] = { uIds: ['addUpModuleBtn'] };
    _permissionList[468] = { uIds: ['updateModuleBtn'] };
    _permissionList[469] = { uIds: ['delModuleBtn'] };
    _permissionList[431] = { uIds: ['delTaskItemBtn'] };
    _permissionList[432] = { uIds: ['resetTaskBtn'] };
    _permissionList[433] = { uIds: ['updateTaskBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
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
            tr.find('.relation').val(tr.find('.relationText').text());
            _taskItemId.push(v);
        } else {
            tr.find('.textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
            _taskItemId.splice(_taskItemId.indexOf(v), 1);
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
    $('#selectConfig').on('select2:select', function () {
        getTaskConfigItem();
    });
    $('#configItem').on('input', '.minute', function () {
        var v = $(this).val();
        if (parseInt(v) > 59) {
            $(this).val(59);
        }
    });
    $('#configItem').on('focus', '.toZero', function () {
        var v = $(this).val();
        if (v == 0) {
            $(this).val('');
        }
    });
    $('#configItem').on('blur', '.toZero', function () {
        var v = $(this).val();
        if (isStrEmptyOrUndefined(v)) {
            $(this).val('0');
        }
    });
    $('#configItem').on('click', '.moveUp', function () {
        _isUpMove = false;
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
        setTableStyle();
    });
    $('#configItem').on('input', '.relation', function () {
        var v = $(this).val();
        v = parseInt(v);
        var tr = $(this).parents('tr');
        var num = tr.find('.num').text();
        num = parseInt(num) - 1;
        if (v > num) {
            $(this).val(num);
        }
    });
    $('#configSelect').on('select2:select', function () {
        $('#newConfig').val($(this).find("option:checked").text());
    });
    $("#configReuse").on("ifChanged", function (event) {
        if ($(this).is(":checked")) {
            $("#updateConfigBtn").attr("disabled", "disabled");
        } else {
            $("#updateConfigBtn").removeAttr("disabled");
        }
    });
    $('#moduleSelect').on('select2:select', function () {
        $('#newModule').val($(this).find("option:checked").text());
    });
    $('.maxHeight').css('maxHeight', innerHeight * 0.7);
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

var _taskConfigName = null;
//获取任务配置
function getTaskConfig() {
    var data = {}
    data.opType = 1051;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        _taskConfigName = [];
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            _taskConfigName.push(d.Task);
            options += option.format(d.Id, d.Task);
        }
        $('.selectConfig').empty();
        $('.selectConfig').append(options);
        $('#configSelect').val(0).trigger('change');
        taskTrData();
    });
}

//获取分组
function getGroup(resolve) {
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
    var data = {}
    data.opType = 1081;
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
    });
}

var _moduleName = null;
//获取模块名
function getModule(resolve) {
    var data = {}
    data.opType = 1058;
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
        _moduleName = [];
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            _moduleName.push(d.Module);
            options += option.format(d.Id, d.Module, d.IsCheck);
        }
        if (resolve != null) {
            resolve(options);
        }
    });
}
//获取任务名
function getTaskName(resolve) {
    var data = {}
    data.opType = 1066;
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
    var trs = $('#configItem tr .num');
    for (var i = 0, len = trs.length; i < len; i++) {
        trs.eq(i).text(i + 1);
    }
    $('#configItem').find('.isEnable').iCheck({
        handle: 'checkbox',
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '20%'
    });
    $('#configItem').find('.ms2').select2();
    $('#configItem .moveUp').removeClass('hidden');
    $('#configItem .moveUp').eq(0).addClass('hidden');
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
            <td><input type="checkbox" class="icb_minimal isEnable" value={0}></td>
            <td class="num"></td>
            <td>
            <span class="textOn">{1}</span>
            <div class="flexStyle textIn hidden" style="width: 240px;margin:auto"><select class="ms2 form-control group">${results[0]}</select><select class="ms2 form-control processor">${results[1]}</select></div>
            </td>
            <td><span class="textOn">{2}</span><div class="textIn hidden" style="width: 120px;margin:auto"><select class="ms2 form-control module">${results[2]}</select></div></td>
            <td><span class="textOn">{3}</span><div class="textIn hidden" style="width: 120px;margin:auto"><input type="text" class="form-control text-center taskName" maxlength="20"><div>${results[3]}</div></div></td>
            <td><span class="textOn">{4}</span>
            <div class="flexStyle textIn hidden" style="width:140px;margin:auto">
            <input type="text" class="form-control text-center hour toZero" maxlength="3" onkeyup="onInput(this, 3, 0)" onblur="onInputEnd(this)">
            <label class="control-label" style="white-space: nowrap; margin: 0">小时</label>
            <input type="text" class="form-control text-center minute toZero" maxlength="3" onkeyup="onInput(this, 2, 0)" onblur="onInputEnd(this)">
            <label class="control-label" style="white-space: nowrap; margin: 0">分</label>
            </div>
            </td>
            <td><span class="textOn">{5}</span><input type="text" class="form-control text-center textIn hidden score toZero" maxlength="3" onkeyup="onInput(this, 3, 0)" onblur="onInputEnd(this)" style="width:80px;margin:auto"></td>
            <td class="no-padding"><span class="textOn">{6}</span><textarea class="form-control textIn hidden desc" maxlength="500" style="resize: vertical;width:180px;margin:auto"></textarea></td>
            <td><span class="textOn relationText">{7}</span><input type="text" class="form-control text-center textIn hidden relation toZero" maxlength="10" onkeyup="onInput(this, 3, 0)" onblur="onInputEnd(this)" style="width:80px;margin:auto"></td>
            <td><button type="button" class="btn btn-primary btn-sm moveUp">上移</button></td>
            </tr>`;
        _addTaskTr = `<tr>
            <td></td>
            <td class="num"></td>
            <td>
            <div class="flexStyle" style="width: 240px;margin:auto"><select class="ms2 form-control group">${results[0]}</select><select class="ms2 form-control processor">${results[1]}</select></div>
            </td>
            <td><div style="width: 120px;margin:auto"><select class="ms2 form-control module">${results[2]}</select></div></td>
            <td><div style="width: 120px;margin:auto"><input type="text" class="form-control text-center taskName" maxlength="20"><div class="hidden">${results[3]}</div></div></td>
            <td>
            <div class="flexStyle" style="width:140px;margin:auto">
            <input type="text" class="form-control text-center hour toZero" maxlength="3" onkeyup="onInput(this, 3, 0)" onblur="onInputEnd(this)" value="0">
            <label class="control-label" style="white-space: nowrap; margin: 0">小时</label>
            <input type="text" class="form-control text-center minute toZero" maxlength="3" onkeyup="onInput(this, 2, 0)" onblur="onInputEnd(this)" value="0">
            <label class="control-label" style="white-space: nowrap; margin: 0">分</label>
            </div>
            </td>
            <td><input type="text" class="form-control text-center score toZero" maxlength="3" onkeyup="onInput(this, 3, 0)" onblur="onInputEnd(this)" style="width:80px;margin:auto" value="0"></td>
            <td class="no-padding"><textarea class="form-control desc" maxlength="500" style="resize: vertical;width:180px;margin:auto"></textarea></td>
            <td><input type="text" class="form-control text-center relation toZero" maxlength="10" onkeyup="onInput(this, 3, 0)" onblur="onInputEnd(this)" style="width:80px;margin:auto" value="0"></td>
            <td><button type="button" class="btn btn-primary btn-sm moveUp">上移</button></td>
            </tr>`;
        getTaskConfigItem();
    });
}

var _taskItem = null;
//获取任务配置项
function getTaskConfigItem() {
    _taskItemId = [];
    var taskId = $('#selectConfig').val();
    if (isStrEmptyOrUndefined(taskId)) {
        return;
    }
    var data = {}
    data.opType = 1055;
    data.opData = JSON.stringify({ taskId });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#configItem').empty();
        data = ret.datas;
        _taskItem = {};
        var ops = '';
        for (var i = 0, len = data.length; i < len; i++) {
            var d = data[i];
            _taskItem[d.Id] = d;
            ops += _taskTrData.format(d.Id, d.Processor, d.Module, d.Item, d.EstimatedTime, d.Score, d.Desc, d.Relation == 0 ? '' : d.Relation);
        }
        $('#configItem').append(ops);
        setTableStyle();
    });
}

var _isUpMove = true;
//保存任务配置
function updateTask() {
    var taskId = $('#selectConfig').val();
    if (isStrEmptyOrUndefined(taskId)) {
        layer.msg('请选择配置');
        return;
    }
    var list = [];
    var i, len = $('#configItem tr').length;
    var isChecked = $('#configItem .isEnable').is(':checked');
    var isEnableBox = $('#configItem .isEnable').length;
    if (!len || (isEnableBox == len && !isChecked && _isUpMove)) {
        layer.msg('请先修改数据');
        return;
    }
    for (i = 0; i < len; i++) {
        var tr = $('#configItem tr').eq(i);
        var isEnableEl = tr.find('.isEnable');
        var id = isEnableEl.val();
        if (isStrEmptyOrUndefined(id)) {
            id = 0;
        }
        //  操作员Id 操作员Name    模块名    是否检验 检验单   任务名 小时 分钟    绩效   描述  关联
        var personId, personName, moduleId, isCheck, checkId, item, hour, minute, score, desc, relation;
        if (isEnableEl.is(':checked') || id == 0) {
            var processorEl = tr.find('.processor');
            personId = processorEl.val();
            if (isStrEmptyOrUndefined(personId)) {
                layer.msg(`序列${i + 1}：请选择操作员`);
                return;
            }
            personName = processorEl.find('option:selected').text();
            moduleId = tr.find('.module').val();
            if (isStrEmptyOrUndefined(moduleId)) {
                layer.msg(`序列${i + 1}：请选择模块名`);
                return;
            }
            isCheck = !!parseInt(tr.find('.module').find(`option[value=${moduleId}]`).attr('isCheck'));
            if (isCheck) {
                checkId = tr.find('.taskNameSelect').val();
                if (isStrEmptyOrUndefined(checkId)) {
                    layer.msg(`序列${i + 1}：请选择检验任务`);
                    return;
                }
                item = tr.find(`.taskNameSelect option[value=${checkId}]`).text();
                checkId = parseInt(checkId);
            } else {
                checkId = 0;
                item = tr.find('.taskName').val();
                if (isStrEmptyOrUndefined(item)) {
                    layer.msg(`序列${i + 1}：任务名不能为空`);
                    return;
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
            var d = _taskItem[id];
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
        relation = parseInt(relation);
        list.push({
            TaskId: taskId,
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
    var doSth = function () {
        var data = {}
        data.opType = 1056;
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

var _addTaskTr = null;
//新增任务行
function addTask() {
    $('#configItem').append(_addTaskTr);
    var lastEl = $('#configItem tr:last');
    var isCheckout = lastEl.find('.module option:selected').attr('ischeck');
    parseInt(isCheckout) ? lastEl.find('.taskName').addClass('hidden').siblings().removeClass('hidden') : lastEl.find('.taskName').removeClass('hidden').siblings().addClass('hidden');
    setTableStyle();
    lastEl.find('.group').trigger('select2:select');
    $('#configTable').scrollTop($('#configTable')[0].scrollHeight);
}

var _taskItemId = [];
//删除任务配置
function delTaskItem() {
    var len = _taskItemId.length;
    if (!len) {
        layer.msg('请选择需要删除的数据');
        return;
    }
    var taskItemName = [];
    for (var i = 0; i < len; i++) {
        taskItemName.push(_taskItem[_taskItemId[i]].Item);
    }
    var doSth = function () {
        var data = {}
        data.opType = 1057;
        data.opData = JSON.stringify({
            ids: _taskItemId
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getTaskConfigItem();
                }
            });
    }
    showConfirm(`删除以下任务配置项:<pre style='color:red'>${taskItemName.join('<br>')}</pre>`, doSth);
}

//重置任务配置单
function resetTask() {
    getTaskConfigItem();
}

//配置管理弹窗
function taskConfigModal() {
    $('#configSelect').val(0).trigger('change');
    $('#newConfig').val('');
    $('#configReuse').iCheck("uncheck");
    $('#taskConfigModal').modal('show');
}

//删除配置
function delConfig() {
    var configId = $('#configSelect').val();
    if (isStrEmptyOrUndefined(configId)) {
        layer.msg('请选择配置');
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = 1054;
        data.opData = JSON.stringify({
            id: configId
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getTaskConfig();
                }
            });
    }
    showConfirm("删除配置：" + $("#configSelect option:selected").text(), doSth);
}

//新增配置
function addConfig() {
    var newConfig = $("#newConfig").val().trim();
    if (isStrEmptyOrUndefined(newConfig)) {
        layer.msg("新配置不能为空");
        return;
    }
    var configId = $("#configSelect").val();
    var isChecked = $("#configReuse").is(":checked");
    if (isChecked && isStrEmptyOrUndefined(configId)) {
        layer.msg("请选择配置");
        return;
    }
    if (_taskConfigName.includes(newConfig)) {
        layer.msg("新配置已存在");
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = 1053;
        data.opData = JSON.stringify({
            Task: newConfig,
            CopyId: isChecked ? configId : 0
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getTaskConfig();
                    $('#newConfig').val('');
                    $('#configReuse').iCheck("uncheck");
                }
            });
    }
    showConfirm("新增配置：" + newConfig, doSth);
}

//修改配置
function updateConfig() {
    var newConfig = $("#newConfig").val().trim();
    var oldConfig = $("#configSelect option:selected").text();
    var configId = $("#configSelect").val();
    if (isStrEmptyOrUndefined(configId)) {
        layer.msg("请选择配置");
        return;
    }
    if (isStrEmptyOrUndefined(newConfig)) {
        layer.msg("新配置不能为空");
        return;
    }
    if (_taskConfigName.includes(newConfig)) {
        layer.msg("新配置已存在");
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = 1052;
        data.opData = JSON.stringify({
            Id: configId,
            Task: newConfig
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getTaskConfig();
                    $('#newConfig').val('');
                    $('#configReuse').iCheck("uncheck");
                }
            });
    }
    showConfirm("修改配置：" + oldConfig, doSth);
}

//模块弹窗
function taskModuleModal() {
    $('#moduleSelect').empty();
    new Promise(function (resolve) {
        getModule(resolve);
    }).then((e) => {
        $('#moduleSelect').append(e);
        $('#moduleSelect').val(0).trigger('change');
    });
    $('#newModule').val('');
    $('#isCheckout').iCheck("uncheck");
    $('#taskModuleModal').modal('show');
}

//删除模块
function delModule() {
    var moduleId = $('#moduleSelect').val();
    if (isStrEmptyOrUndefined(moduleId)) {
        layer.msg('请选择模块');
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = 1061;
        data.opData = JSON.stringify({
            id: moduleId
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    taskModuleModal();
                    taskTrData();
                }
            });
    }
    showConfirm("删除模块：" + $("#moduleSelect option:selected").text(), doSth);
}

//新增修改模块
function addUpModule(isUp) {
    var opType = isUp ? 1059 : 1060;
    var newModuleName = $('#newModule').val().trim();
    var moduleId = $('#moduleSelect').val();
    var olModuleName = $("#moduleSelect option:selected").text();
    var isCheckout = $('#isCheckout').is(":checked");
    if (isUp && isStrEmptyOrUndefined(moduleId)) {
        layer.msg("请选择模块");
        return;
    }
    if (isStrEmptyOrUndefined(newModuleName)) {
        layer.msg("新模块不能为空");
        return;
    }
    if (_moduleName.includes(newModuleName)) {
        layer.msg("新模块已存在");
        return;
    }
    var list = {
        Module: newModuleName,
        IsCheck: isCheckout
    }
    if (isUp) {
        list.Id = moduleId;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    taskModuleModal();
                    taskTrData();
                }
            });
    }
    showConfirm(`${isUp ? '修改' : '新增'}配置：${isUp ? olModuleName : newModuleName}`, doSth);
}