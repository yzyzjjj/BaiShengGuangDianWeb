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
    var data = {};
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
    var data = {};
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
    var data = {};
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

var _historyData = null;
//历史数据脚本
function getHistoryScript() {
    $('#historyScript').text(_codeData[$('#selectCodeHistory').val()].ScriptName);
    var id = $('#selectCodeHistory :selected').attr('script');
    if (isStrEmptyOrUndefined(id)) {
        layer.msg('请选择设备');
        return;
    }
    var data = {};
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
        var scriptData = { 1: [], 2: [], 3: [] };
        _historyData = {};
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            var typeId = d.VariableTypeId;
            scriptData[typeId].push(d);
            _historyData[d.Id] = d;
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
    var data = {};
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
var _tableType = {};
var _flag = 0;
//历史数据添加变量
function addVar(type, id) {
    if (_deviceData[type].indexOf(id) == -1) {
        _deviceData[type].push(id);
    }
    var tableType = $('#chartTypeSelect').val();
    switch (tableType) {
        case '0':
            _flag++;
            var table = `table${_flag}`;
            _tableType[table] = { id: [id], data: [_historyData[id]] };
            $('#chartSelect').append(`<option value=${_flag}>表${_flag}</option>`);
            var box = `<div class="box box-success">
                        <div class="box-header with-border">
                            <h3 class="box-title">表${_flag}</h3>
                            <div class="box-tools pull-right">
                                <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                                <button type="button" class="btn btn-box-tool" data-widget="remove" data-toggle="tooltip" title="删除"><i class="fa fa-times"></i></button>
                            </div>
                        </div>
                        <div class="box-body">
                            <div class="row">
                                <div class="col-sm-4">
                                    <div class="nav-tabs-custom">
                                        <ul class="nav nav-tabs ui-sortable-handle">
                                            <li class="active hidden"><a href="#${table}_val" data-toggle="tab" aria-expanded="true">变量</a></li>
                                            <li class="hidden"><a href="#${table}_ins" data-toggle="tab" aria-expanded="false">输入</a></li>
                                            <li class="hidden"><a href="#${table}_out" data-toggle="tab" aria-expanded="false">输出</a></li>
                                        </ul>
                                        <div class="tab-content no-padding">
                                            <div class="tab-pane active in" id="${table}_val"></div>
                                            <div class="tab-pane fade in" id="${table}_ins"></div>
                                            <div class="tab-pane fade in" id="${table}_out"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-8">
                                    <div class="chart" style="width: 100%;height:400px;"></div>
                                </div>
                            </div>
                        </div>
                     </div>`;
            $('#tableChart').append(box);

            break;
        case '1':
            var tableNum = $('#chartSelect').val();
            if (!isStrEmptyOrUndefined(tableNum)) {
                var arr = _tableType[`table${tableNum}`];
                if (arr.id.indexOf(id) == -1) {
                    arr.id.push(id);
                    arr.data.push(_historyData[id]);
                } else {
                    layer.msg(`${$('#chartSelect :selected').text()}已存在该名称`);
                }
            } else {
                layer.msg('目前未存在相关表');
            }
            break;
    }
}