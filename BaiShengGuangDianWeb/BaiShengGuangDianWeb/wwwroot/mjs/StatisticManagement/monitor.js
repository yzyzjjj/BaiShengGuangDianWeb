function pageReady() {
    $('.ms2').select2();
    getDevice();
    $('#chartTypeSelect').on('change', () => $('#chartTypeSelect').val() == 0 ? $('#chartSelect').addClass('hidden') : $('#chartSelect').removeClass('hidden'));
    $('#selectCodeHistory').on('select2:select', () => {
        getHistoryScript();
        $('#tableChart,#chartSelect').empty();
        _tableType = {};
        _flag = 0;
        $('#tableChart').off('resize');
    });
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
        var valueFn = (arr, a, b, c, d) => arr[d.row] || 0;
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
    var codeId = $('#selectCodeHistory').val();
    if (isStrEmptyOrUndefined(codeId)) {
        return;
    }
    $('#historyScript').text(_codeData[codeId].ScriptName);
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
            _historyData[d.PointerAddress] = d;
        }
        var addVar = (type, d) => `<button type="button" class="btn btn-success btn-xs" onclick="addVar(\'${type}\',${d.PointerAddress})"><i class="fa fa-plus"></i></button>`;
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
                { "data": null, "title": "添加", "orderable": false }
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
    var resData = { vals: [], ins: [], outs: [] };
    var tableData = Object.values(_tableType);
    var key, i, len;
    for (i = 0, len = tableData.length; i < len; i++) {
        var d = tableData[i].data;
        for (key in d) {
            resData[key] = resData[key].concat(d[key]);
        }
    }
    for (key in resData) {
        resData[key] = [...new Set(resData[key])];
    }
    if (!resData.vals.length && !resData.ins.length && !resData.outs.length) {
        layer.msg('请先添加地址');
        return;
    }
    var data = {};
    data.opType = 507;
    data.opData = JSON.stringify({
        StartTime: sTime,
        EndTime: eTime,
        DeviceId: codeId,
        DeviceData: resData
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.data;
        var xAxis = [];
        var yData = {};
        for (key in rData) {
            xAxis.push(key);
            var v = rData[key];
            $.each(resData.vals, (index, item) => {
                yData[item] ? yData[item].push(v.vals[index]) : yData[item] = [v.vals[index]];
            });
            $.each(resData.ins, (index, item) => {
                yData[item] ? yData[item].push(v.ins[index]) : yData[item] = [v.ins[index]];
            });
            $.each(resData.outs, (index, item) => {
                yData[item] ? yData[item].push(v.outs[index]) : yData[item] = [v.outs[index]];
            });
        }
        for (key in _tableType) {
            var res = _tableType[key].res;
            var legend = [];
            var series = [];
            for (i = 0, len = res.length; i < len; i++) {
                var r = res[i];
                var name = _historyData[r].VariableName;
                legend.push(name);
                series.push({
                    name: name,
                    type: 'line',
                    data: yData[r],
                    showSymbol: false,
                    sampling: 'average',
                    showAllSymbol: false
                });
            }
            var option = {
                tooltip: {
                    trigger: "axis"
                },
                legend: {
                    data: legend
                },
                xAxis: {
                    type: "category",
                    data: xAxis
                },
                yAxis: {
                    type: "value"
                },
                series: series,
                dataZoom: [{
                    type: "slider",
                    start: 0,
                    end: 20
                },
                {
                    type: "inside",
                    start: 0,
                    end: 20
                }],
                toolbox: {
                    top: 18,
                    left: "center",
                    feature: {
                        dataZoom: {
                            yAxisIndex: "none"
                        },
                        restore: {}
                    }
                }
            };
            echarts.init($(`#${key}_chart`)[0]).setOption(option, true);
        }
        var throttle = () => {
            var begin = new Date();
            return () => {
                var current = new Date();
                if (current - begin >= 500) {
                    for (var chart in _tableType) {
                        echarts.init($(`#${chart}_chart`)[0]).resize();
                    }
                    begin = current;
                }
            }
        };
        $('#tableChart').off('resize').on("resize", throttle());
    });
}

var _tableType = {};
var _flag = 0;
//历史数据添加变量
function addVar(type, res) {
    var tableCon = `<div style="overflow: auto;max-height:360px">
                        <table class="table table-hover table-striped">
                            <thead>
                                <tr>
                                    <th>序号</th>
                                    <th>名称</th>
                                    <th>地址</th>
                                    <th>删除</th>
                                </tr>
                            </thead>
                            <tbody id="{0}_{1}_tbody"></tbody>
                        </table>
                    </div>`;
    var tBodyTr = '<tr><td class="num">1</td><td>{0}</td><td>{1}</td><td><button type="button" class="btn btn-danger btn-xs" onclick="delVarTr.call(this,{1},\'{2}\',\'{3}\')"><i class="fa fa-minus"></i></button></td></tr>';
    var table;
    var tableType = $('#chartTypeSelect').val();
    var d = _historyData[res];
    switch (tableType) {
        case '0':
            _flag++;
            table = `table${_flag}`;
            _tableType[table] = { res: [res], data: {} };
            _tableType[table].data[type] = [res];
            $('#chartSelect').append(`<option value=${_flag}>表${_flag}</option>`);
            var box = `<div class="box box-success {0}">
                        <div class="box-header with-border">
                            <h3 class="box-title">表${_flag}</h3>
                            <div class="box-tools pull-right">
                                <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                                <button type="button" class="btn btn-box-tool" data-widget="remove" data-toggle="tooltip" title="删除" onclick="delTableBox.call(this,\'{0}\')"><i class="fa fa-times"></i></button>
                            </div>
                        </div>
                        <div class="box-body">
                            <div class="row">
                                <div class="col-sm-4">
                                    <div class="nav-tabs-custom">
                                        <ul class="nav nav-tabs ui-sortable-handle">
                                            <li class="active hidden" id="{0}_vals_li"><a href="#{0}_vals" data-toggle="tab" aria-expanded="true">变量</a></li>
                                            <li class="hidden" id="{0}_ins_li"><a href="#{0}_ins" data-toggle="tab" aria-expanded="false">输入</a></li>
                                            <li class="hidden" id="{0}_outs_li"><a href="#{0}_outs" data-toggle="tab" aria-expanded="false">输出</a></li>
                                        </ul>
                                        <div class="tab-content no-padding">
                                            <div class="tab-pane active in" id="{0}_vals">{1}</div>
                                            <div class="tab-pane fade in" id="{0}_ins">{2}</div>
                                            <div class="tab-pane fade in" id="{0}_outs">{3}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-8">
                                    <div id="{0}_chart" style="width: 100%;height:400px"></div>
                                </div>
                            </div>
                        </div>
                     </div>`;
            $('#tableChart').append(box.format(table, tableCon.format(table, 'vals'), tableCon.format(table, 'ins'), tableCon.format(table, 'outs')));
            $(`#${table}_${type}_tbody`).append(tBodyTr.format(d.VariableName, d.PointerAddress, type, table));
            $(`#${table}_${type}_li`).removeClass('hidden').find('a').click();
            break;
        case '1':
            var tableNum = $('#chartSelect').val();
            if (!isStrEmptyOrUndefined(tableNum)) {
                table = `table${tableNum}`;
                var arr = _tableType[table];
                if (arr.res.indexOf(res) == -1) {
                    arr.res.push(res);
                    arr.data[type] ? arr.data[type].push(res) : arr.data[type] = [res];
                    $(`#${table}_${type}_tbody`).append(tBodyTr.format(d.VariableName, d.PointerAddress, type, table));
                    setNumTotalOrder(`${table}_${type}_tbody`);
                    $(`#${table}_${type}_li`).removeClass('hidden');
                } else {
                    layer.msg(`${$('#chartSelect :selected').text()}已存在名称：<span style="font-weight:bold">${d.VariableName}</span>`);
                }
            } else {
                layer.msg('目前未存在相关表');
            }
            break;
    }
}

//序号设置
function setNumTotalOrder(tbody) {
    var counts = $(`#${tbody}`).find('.num');
    for (var i = 0, len = counts.length; i < len; i++) {
        counts.eq(i).text(i + 1);
    }
}

//删除表组
function delTableBox(tableBox) {
    setTimeout(() => $(this).parents(`.${tableBox}`).remove(), 2000);
    $(`#chartSelect option[value=${tableBox.split('table')[1]}]`).remove();
    delete _tableType[tableBox];
}

//删除表组数据
function delVarTr(res, type, table) {
    $(this).parents('tr').remove();
    var d = _tableType[table];
    d.res.splice(d.res.indexOf(res), 1);
    d.data[type].splice(d.data[type].indexOf(res), 1);
    setNumTotalOrder(`${table}_${type}_tbody`);
}