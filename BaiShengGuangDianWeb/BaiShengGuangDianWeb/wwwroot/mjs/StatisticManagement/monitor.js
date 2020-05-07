function pageReady() {
    $('.ms2').select2();
    getDevice();
    $('#chartTypeSelect').on('change', () => $('#chartTypeSelect').val() == 0 ? $('#chartSelect').addClass('hidden') : $('#chartSelect').removeClass('hidden'));
    $('#selectCodeHistory').on('select2:select', () => getHistoryScript());
    $('#historyPage').one('click', () => getHistoryScript());
}

var _codeData = null;
//获取设备
function getDevice() {
    var data = {}
    data.opType = 100;
    data.opData = JSON.stringify({
        hard: true
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        _codeData = {};
        var list = ret.datas;
        var op = '<option value="{0}" script="{1}">{2}</option>';
        var ops = '';
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            _codeData[d.Id] = d;
            ops += op.format(d.Id, d.ScriptId, d.Code);
        }
        $('#selectCode,#selectCodeHistory').empty().append(ops);
        getCodeDetail();
    });
}

var _codeDetailObj = null;
//获取脚本详情
function getCodeDetail() {
    $('#script').text(_codeData[$('#selectCode').val()].ScriptName);
    var id = $('#selectCode :selected').attr('script');
    if (isStrEmptyOrUndefined(id)) {
        layer.msg('请选择设备');
        return;
    }
    var data = {}
    data.opType = 106;
    data.opData = JSON.stringify({
        id: id
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        _codeDetailObj = { 1: [], 2: [], 3: [] };
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            _codeDetailObj[d.VariableTypeId].push(d);
        }
        getScriptValue();
    });
}

//获取脚本值
function getScriptValue() {
    var id = $('#selectCode').val();
    if (isStrEmptyOrUndefined(id)) {
        layer.msg('请选择设备');
        return;
    }
    var data = {}
    data.opType = 109;
    data.opData = JSON.stringify({
        all: true,
        qId: id
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas[0] || [];
        var valData = rData['vals'] || [];
        var insData = rData['ins'] || [];
        var outData = rData['outs'] || [];
        var valueFn = (arr, a, b, c, d) => arr[d.row] || '';
        var tablesConfig = {
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-0"i><"col-sm-12"p>',
            "pagingType": "full",
            "destroy": true,
            "paging": true,
            "deferRender": false,
            "bLengthChange": false,
            "sort": true,
            "info": false,
            "searching": true,
            "autoWidth": true,
            "language": oLanguage,
            //"aLengthMenu": [20, 40, 60],
            "iDisplayLength": 20,
            "columns": [
                { "data": null, "title": "序号", "render": (a, b, c, d) => ++d.row },
                { "data": "VariableName", "title": "名称" },
                { "data": "PointerAddress", "title": "地址" },
                { "data": null, "title": "值" }
            ]
        };
        //变量
        var valConfig = $.extend(true, {}, tablesConfig);
        valConfig.data = _codeDetailObj[1];
        valConfig.columns[3].render = valueFn.bind(null, valData);
        $("#valList").DataTable(valConfig);
        //输入
        var insConfig = $.extend(true, {}, tablesConfig);
        insConfig.data = _codeDetailObj[2];
        insConfig.columns[3].render = valueFn.bind(null, insData);
        $("#insList").DataTable(insConfig);
        //输出
        var outConfig = $.extend(true, {}, tablesConfig);
        outConfig.data = _codeDetailObj[3];
        outConfig.columns[3].render = valueFn.bind(null, outData);
        $("#outList").DataTable(outConfig);
    });
}

//历史数据脚本
function getHistoryScript() {
    $('#historyScript').text(_codeData[$('#selectCodeHistory').val()].ScriptName);
    var id = $('#selectCodeHistory :selected').attr('script');
    if (isStrEmptyOrUndefined(id)) {
        layer.msg('请选择设备');
        return;
    }
    var data = {}
    data.opType = 106;
    data.opData = JSON.stringify({
        id: id
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var scriptData = { 1: [], 2: [], 3: [], id: {} };
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            var typeId = d.VariableTypeId;
            scriptData[typeId].push(d);
            scriptData.id[d.Id] = d;
        }
        var addVar = (type, d) => `<button type="button" class="btn btn-success btn-xs" onclick="addVar(\'${type}\',${d})"><i class="fa fa-plus"></i></button>`;
        var tablesConfig = {
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-0"i><"col-sm-12"p>',
            "pagingType": "full",
            "destroy": true,
            "paging": true,
            "deferRender": false,
            "bLengthChange": false,
            "sort": true,
            "info": false,
            "searching": true,
            "autoWidth": true,
            "language": oLanguage,
            //"aLengthMenu": [20, 40, 60],
            "iDisplayLength": 10,
            "columns": [
                { "data": null, "title": "序号", "render": (a, b, c, d) => ++d.row },
                { "data": 'VariableName', "title": "名称" },
                { "data": 'PointerAddress', "title": "地址" },
                { "data": 'Id', "title": "添加", "orderable": false }
            ]
        };
        //变量
        var valConfig = $.extend(true, {}, tablesConfig);
        valConfig.data = scriptData[1];
        valConfig.columns[3].render = addVar.bind(null, 'vals');
        $("#historyValList").DataTable(valConfig);
        //输入
        var insConfig = $.extend(true, {}, tablesConfig);
        insConfig.data = scriptData[2];
        insConfig.columns[3].render = addVar.bind(null, 'ins');
        $("#historyInsList").DataTable(insConfig);
        //输出
        var outConfig = $.extend(true, {}, tablesConfig);
        outConfig.data = scriptData[3];
        outConfig.columns[3].render = addVar.bind(null, 'outs');
        $("#historyOutList").DataTable(outConfig);
    });
}

//查询历史数据
function getHistoryData() {
    var codeId = $('#selectCodeHistory').val();
    if (isStrEmptyOrUndefined(codeId)) {
        layer.msg('请选择设备');
        return;
    }
    var time = $('#reservationTime').val();
    if (isStrEmptyOrUndefined(time)) {
        layer.msg('请选择时间');
        return;
    }
    time = time.split(' 至 ');
    var sTime = time[0];
    var eTime = time[1];
    var data = {}
    data.opType = 507;
    data.opData = JSON.stringify({
        StartTime: sTime,
        EndTime: eTime,
        DeviceId: codeId,
        DeviceData: _deviceData
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
    });
}

var _deviceData = { vals: [], ins: [], outs: [] };
var _flag = 0;
//历史数据添加变量
function addVar(type, id) {
    if (_deviceData[type].indexOf(id) == -1) {
        _deviceData[type].push(id);
    }
}