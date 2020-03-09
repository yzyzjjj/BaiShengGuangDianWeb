function pageReady() {
    $('.ms2').select2();
    getTaskConfig();
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
        getTaskConfigItem();
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
        menu:true
    });
    ajaxPost('/Relay/Post', data, function(ret) {
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
//获取操作员
function getProcessor(resolve,id) {
    var opType = 1081;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        groupId: id,
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
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Module);
        }
        if (resolve != null) {
            resolve(options);
        }
    });
}
//获取任务名

//表格设置
function setTableStyle() {
    $('#configItem').find('.isEnable').iCheck({
        handle: 'checkbox',
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '20%'
    });
}

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
        data = ret.datas;
        var groupSelect = new Promise(function (resolve) {
            getGroup(resolve);
        });
        var processorSelect = new Promise(function (resolve) {
            getProcessor(resolve,0);
        });
        var moduleSelect = new Promise(function (resolve) {
            getModule(resolve);
        });
        Promise.all([groupSelect, processorSelect, moduleSelect]).then(function (results) {
            var op = `<tr>
            <td><input type="checkbox" class="icb_minimal isEnable"></td>
            <td class="num">{0}</td>
            <td>
            <span class="textOn">{1}</span>
            <div class="flexStyle textIn hidden"><select class="ms2 form-control" style="width: 120px">${results[0]}</select><select class="ms2 form-control" style="width: 120px;margin-left:3px">${results[1]}</select></div>
            </td>
            <td><span class="textOn">{2}</span><select class="ms2 form-control textIn hidden" style="width: 120px">${results[2]}</select></td>
            <td><span class="textOn">{3}</span></td>
            <td><span class="textOn">{4}</span><input type="text" class="form-control text-center textIn hidden" maxlength="10" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:80px"></td>
            <td><span class="textOn">{5}</span><input type="text" class="form-control text-center textIn hidden" maxlength="10" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:80px"></td>
            <td><span class="textOn">{6}</span><textarea class="form-control textIn hidden" maxlength="500" style="resize: vertical;width:180px"></textarea></td>
            <td><span class="textOn">{7}</span><input type="text" class="form-control text-center textIn hidden" maxlength="10" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:80px"></td>
            <td><button type="button" class="btn btn-primary btn-sm">上移</button></td>
            </tr>`;
            var ops = '';
            for (var i = 0, len = data.length; i < len; i++) {
                var d = data[i];
                ops += op.format(i + 1, d.Processor, d.Module, d.Item, d.EstimatedTime, d.Score, d.Desc, d.Relation);
            }
            $('#configItem').empty();
            $('#configItem').append(ops);
            setTableStyle();
        });
    });
}