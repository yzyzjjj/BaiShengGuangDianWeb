function pageReady() {
    document.documentElement.style.fontSize = document.documentElement.clientWidth / 768 * 100 + 'px';
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
    var sTime = getHourAgo().split(' ');
    var eTime = getFullTime().split(' ');
    $('#sDate').val(sTime[0]).datepicker('update');
    $('#sTime').timepicker('setTime', sTime[1]);
    $('#eDate').val(eTime[0]).datepicker('update');
    $('#eTime').timepicker('setTime', eTime[1]);
    $(window).on('scroll', () => $(document).scrollTop() > 900 ? $("#backTop").fadeIn() : $("#backTop").fadeOut());
    $("#backTop").on('click', () => {
        $("html,body").stop().animate({
            scrollTop: 0
        });
    });
    let time = 0;
    $('#kanBanData').on('resize', () => {
        clearTimeout(time);
        time = setTimeout(() => {
            echarts.init($('#chartmain')[0]).resize();
            echarts.init($('#chartmain_bing')[0]).resize();
            echarts.init($('#chartmain_zhe')[0]).resize();
        }, 200);
    });
}

var _dataTableData = {};
//自定义datatables搜索
function dataTableSearch(type) {
    var table = _dataTableData[type];
    var parent = $(this).parent();
    var val = parent.find('.val').val().trim();
    table.columns([0, 1, 2, 3]).search('').draw();
    if (!isStrEmptyOrUndefined(val)) {
        var sym = parent.find('.sym').val();
        if (sym == 0) {
            val = `^${val}$`;
        } else if (sym == 1) {
            val = `^(?!${val}$).+$`;
        }
        var colText = parent.find('.thText').val();
        table.columns(colText).search(val, true, false).draw();
    }
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
        list.sort((a, b) => a.Code - b.Code);
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

var _tablesConfig = {
    dom: '<"pull-left"l><"pull-right hidden"f>rt<"text-center"i><"table-flex"p>',
    destroy: true,
    paging: true,
    deferRender: false,
    bLengthChange: false,
    sort: true,
    searching: true,
    autoWidth: true,
    language: oLanguage,
    columns: [
        { data: null, title: '序号', render: (a, b, c, d) => ++d.row },
        { data: 'VariableName', title: '名称' },
        { data: 'PointerAddress', title: '地址' }
    ]
};
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
        var valueFn = (arr, a, b, c, d) => toNonExponential(arr[d.row]);
        var tablesConfig = $.extend(true, {}, _tablesConfig);
        tablesConfig.iDisplayLength = 20;
        tablesConfig.columns[3] = { "data": null, "title": "值" };
        //变量
        var valConfig = $.extend(true, {}, tablesConfig);
        valConfig.data = _codeDetailObj[1];
        valConfig.columns[3].render = valueFn.bind(null, valData);
        _dataTableData.valList = $("#valList").DataTable(valConfig);
        //输入
        var insConfig = $.extend(true, {}, tablesConfig);
        insConfig.data = _codeDetailObj[2];
        insConfig.columns[3].render = valueFn.bind(null, insData);
        _dataTableData.insList = $("#insList").DataTable(insConfig);
        //输出
        var outConfig = $.extend(true, {}, tablesConfig);
        outConfig.data = _codeDetailObj[3];
        outConfig.columns[3].render = valueFn.bind(null, outData);
        _dataTableData.outList = $("#outList").DataTable(outConfig);
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
            _historyData[d.Id] = d;
        }
        var addVar = (type, d) => `<button type="button" class="btn btn-success btn-xs" onclick="addVar(\'${type}\',${d.Id})"><i class="fa fa-plus"></i></button>`;
        var tablesConfig = $.extend(true, {}, _tablesConfig);
        tablesConfig.iDisplayLength = 10;
        tablesConfig.columns[3] = { "data": null, "title": "添加", "orderable": false };
        //变量
        var valConfig = $.extend(true, {}, tablesConfig);
        valConfig.data = scriptData[1];
        valConfig.columns[3].render = addVar.bind(null, 'vals');
        _dataTableData.historyValList = $("#historyValList").DataTable(valConfig);
        //输入
        var insConfig = $.extend(true, {}, tablesConfig);
        insConfig.data = scriptData[2];
        insConfig.columns[3].render = addVar.bind(null, 'ins');
        _dataTableData.historyInsList = $("#historyInsList").DataTable(insConfig);
        //输出
        var outConfig = $.extend(true, {}, tablesConfig);
        outConfig.data = scriptData[3];
        outConfig.columns[3].render = addVar.bind(null, 'outs');
        _dataTableData.historyOutList = $("#historyOutList").DataTable(outConfig);
    });
}

//查询历史数据
function getHistoryData() {
    var codeId = $('#selectCodeHistory').val();
    if (isStrEmptyOrUndefined(codeId)) {
        layer.msg('请选择设备');
        return;
    }
    var sDate = $('#sDate').val().trim();
    var sTime = $('#sTime').val().trim();
    var eDate = $('#eDate').val().trim();
    var eTime = $('#eTime').val().trim();
    if (isStrEmptyOrUndefined(sDate) ||
        isStrEmptyOrUndefined(sTime) ||
        isStrEmptyOrUndefined(eDate) ||
        isStrEmptyOrUndefined(eTime)) {
        layer.msg('请选择时间');
        return;
    }
    sTime = `${sDate} ${sTime}`;
    eTime = `${eDate} ${eTime}`;
    if (compareDate(sTime, eTime)) {
        layer.msg('开始时间不能大于结束时间');
        return;
    }
    if (new Date(eTime) - new Date(sTime) > 3600000) {
        layer.msg('时间不能超过一小时');
        return;
    }
    var resData = { vals: [], ins: [], outs: [] };
    var tableData = Object.values(_tableType).flat();
    var key, i, len;
    for (i = 0, len = tableData.length; i < len; i++) {
        const d = tableData[i];
        switch (d.VariableTypeId) {
            case 1:
                resData.vals.push(d.PointerAddress);
                break;
            case 2:
                resData.ins.push(d.PointerAddress);
                break;
            case 3:
                resData.outs.push(d.PointerAddress);
                break;
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
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.data;
        var xAxis = [];
        var yData = {};
        for (key in rData) {
            xAxis.push(key.replace(' ', '\n'));
            const v = rData[key];
            $.each(resData.vals, (index, item) => {
                yData[`vals${item}`] ? yData[item].push(v.vals[index]) : yData[item] = [v.vals[index]];
            });
            $.each(resData.ins, (index, item) => {
                yData[`ins${item}`] ? yData[item].push(v.ins[index]) : yData[item] = [v.ins[index]];
            });
            $.each(resData.outs, (index, item) => {
                yData[`outs${item}`] ? yData[item].push(v.outs[index]) : yData[item] = [v.outs[index]];
            });
        }
        for (key in _tableType) {
            data = _tableType[key];
            var legend = [];
            var series = [];
            for (i = 0, len = data.length; i < len; i++) {
                const d = data[i];
                const name = d.VariableName;
                legend.push(name);
                let flag = '';
                switch (d.VariableTypeId) {
                    case 1:
                        flag = 'vals';
                        break;
                    case 2:
                        flag = 'ins';
                        break;
                    case 3:
                        flag = 'outs';
                        break;
                }
                series.push({
                    name: name,
                    type: 'line',
                    data: yData[`${flag}${d.PointerAddress}`],
                    showSymbol: false,
                    sampling: 'average',
                    showAllSymbol: false
                });
            }
            var option = {
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '3%',
                    top: '6%',
                    bottom: '8%',
                    containLabel: true
                },
                legend: {
                    data: legend
                },
                xAxis: {
                    type: 'category',
                    data: xAxis
                },
                yAxis: {
                    type: 'value'
                },
                series: series,
                dataZoom: [{
                    type: 'slider',
                    start: 0,
                    end: 20,
                    bottom: 0
                },
                {
                    type: 'inside',
                    start: 0,
                    end: 20
                }],
                toolbox: {
                    top: 20,
                    left: 'center',
                    feature: {
                        dataZoom: {
                            yAxisIndex: 'none'
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
                if (current - begin >= 200) {
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
function addVar(type, id) {
    var tableCon = `<div class="flexStyle box-header" style="justify-content: flex-end">
                        <select class="form-control thText" style="max-width:80px" onchange="searchTr.call(this,\'{0}\',\'{1}\')">
                            <option value="num">序号</option>
                            <option value="name">名称</option>
                            <option value="res">地址</option>
                        </select>
                        <select class="form-control sym" style="max-width:100px" onchange="searchTr.call(this,\'{0}\',\'{1}\')">
                            <option value="0">等于</option>
                            <option value="1">不等于</option>
                            <option value="2">包含</option>
                        </select>
                        <input type="text" class="form-control val" placeholder="搜索" style="max-width:150px" oninput="searchTr.call(this,\'{0}\',\'{1}\')">
                    </div>
                    <div style="overflow: auto;max-height:300px">
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
    var tBodyTr = '<tr><td class="num">1</td><td class="name">{0}</td><td class="res">{4}</td><td><button type="button" class="btn btn-danger btn-xs" onclick="delVarTr.call(this,{1},\'{2}\',\'{3}\')"><i class="fa fa-minus"></i></button></td></tr>';
    var table;
    var tableType = $('#chartTypeSelect').val();
    var d = _historyData[id];
    switch (tableType) {
        case '0':
            firstChart(`table${_flag + 1}`, d, tableCon, tBodyTr, type);
            if (_flag != 1) {
                $('#chartSelect').append(`<option value=${_flag}>表${_flag}</option>`);
            }
            break;
        case '1':
            var tableNum = $('#chartSelect').val();
            if (!isStrEmptyOrUndefined(tableNum)) {
                table = `table${tableNum}`;
                var arr = _tableType[table];
                if (arr) {
                    if (arr.includes(d)) {
                        layer.msg(`${$('#chartSelect :selected').text()}已存在名称：<span style="font-weight:bold">${d.VariableName}</span>`);
                    } else {
                        arr.push(d);
                        $(`#${table}_${type}_tbody`).append(tBodyTr.format(d.VariableName, d.Id, type, table, d.PointerAddress));
                        setNumTotalOrder(`${table}_${type}_tbody`);
                        $(`#${table}_${type}_li`).removeClass('hidden');
                    }
                } else {
                    firstChart(table, d, tableCon, tBodyTr, type);
                }
            } else {
                layer.msg('目前未存在相关表');
            }
            break;
    }
}

//默认表一
function firstChart(table, d, tableCon, tBodyTr, type) {
    _flag++;
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
    _tableType[table] = [d];
    $('#tableChart').append(box.format(table, tableCon.format(table, 'vals'), tableCon.format(table, 'ins'), tableCon.format(table, 'outs')));
    $(`#${table}_${type}_tbody`).append(tBodyTr.format(d.VariableName, d.Id, type, table, d.PointerAddress));
    $(`#${table}_${type}_li`).removeClass('hidden').find('a').click();
}

//表格tr搜索
function searchTr(table, type) {
    var parent = $(this).parent();
    var val = parent.find('.val').val().trim();
    var trs = $(`#${table}_${type}_tbody tr`);
    if (isStrEmptyOrUndefined(val)) {
        trs.removeClass('hidden');
    } else {
        var fn = new Function();
        var sym = parent.find('.sym').val();
        switch (sym) {
            case '0':
                fn = (a, b) => a == b;
                break;
            case '1':
                fn = (a, b) => a != b;
                break;
            case '2':
                fn = (a, b) => a.indexOf(b) != -1;
                break;
        }
        var th = parent.find('.thText').val();
        for (var i = 0, len = trs.length; i < len; i++) {
            var tr = trs.eq(i);
            var tdText = tr.find(`.${th}`).text();
            fn(tdText, val) ? tr.removeClass('hidden') : tr.addClass('hidden');
        }
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
function delVarTr(id, type, table) {
    $(this).parents('tr').remove();
    var arr = _tableType[table];
    arr.splice(arr.indexOf(_historyData[id]), 1);
    setNumTotalOrder(`${table}_${type}_tbody`);
}