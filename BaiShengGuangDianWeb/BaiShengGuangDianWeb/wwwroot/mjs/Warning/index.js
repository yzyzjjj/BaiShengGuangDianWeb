function pageReady() {
    $('.ms2').select2();
    $('.form_date').val(getDate()).datepicker('update');
    //设备数据
    new Promise(resolve => getWarnSet(resolve, 1, '.device-warn')).then(() => getDeviceData(false));
    $('#deviceSTime,#deviceETime').on('changeDate', () => getDeviceData(false));
    $('#deviceWarn').on('select2:select', () => getDeviceData(false));
    $('#devCurrentLi').one('click', () => getDeviceData(true));
    $('#deviceWarnCurrent').on('select2:select', () => getDeviceData(true));
    //生产数据
    $('#productionBox').one('click', () => new Promise(resolve => getWarnSet(resolve, 2, '.production-warn')).then(() => getProductionData(false)));
    $('#productionSTime,#productionETime').on('changeDate', () => getProductionData(false));
    $('#productionWarn').on('select2:select', () => getProductionData(false));
    $('#productionCurrentLi').one('click', () => getProductionData(true));
    $('#productionWarnCurrent').on('select2:select', () => getProductionData(true));
}

//获取设备数据记录&当前
function getDeviceData(isCurrent) {
    isCurrent ? getCurrentWarnLogList('device', 1) : getWarnLogList('device', 1);
}

//获取生产数据记录&当前
function getProductionData(isCurrent) {
    isCurrent ? getCurrentWarnLogList('production', 2) : getWarnLogList('production', 2);
}

//获取所有设备预警
function getWarnSet(resolve, dataType, el) {
    ajaxPost('/Relay/Post', { opType: 1200, opData: JSON.stringify({ first: false, type: 1, dataType }) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $(el).empty().append(`<option value="0">全部</option>${setOptions(ret.datas, 'Name')}`);
        resolve();
    });
}

//获取指定设备预警
function getAppointWarnSet(qId, dataType, flag, isCurrent) {
    ajaxPost('/Relay/Post', { opType: 1200, opData: JSON.stringify({ first: false, type: 1, dataType, qId }) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $(`#${flag}Info${isCurrent}`).removeClass('hidden');
        const d = ret.datas[0];
        $(`#${flag}WarnType${isCurrent}`).text(d.Class);
        if (dataType === 1) {
            $(`#${flag}WarnScript${isCurrent}`).text(d.Script);
        } else if (dataType === 2) {
            $(`#${flag}WarnCategory${isCurrent}`).text(d.CategoryName);
        }
        $(`#${flag}WarnDevice${isCurrent}`).text(d.Code);
    });
}

//获取预计记录
function getWarnLogList(el, dataType) {
    const sId = $(`#${el}Warn`).val();
    if (isStrEmptyOrUndefined(sId)) {
        layer.msg('请选择预警名');
        return;
    }
    let startTime = $(`#${el}STime`).val().trim();
    if (isStrEmptyOrUndefined(startTime)) {
        layer.msg('请选择开始时间');
        return;
    }
    let endTime = $(`#${el}ETime`).val().trim();
    if (isStrEmptyOrUndefined(endTime)) {
        layer.msg('请选择结束时间');
        return;
    }
    if (compareDate(startTime, endTime)) {
        layer.msg('开始时间不能大于结束时间');
        return;
    }
    startTime += ' 00:00:00';
    endTime += ' 23:59:59';
    const data = {}
    data.opType = 1206;
    data.opData = JSON.stringify({ sId, startTime, endTime, type: 1, dataType });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        sId == 0 ? $(`#${el}Info`).addClass('hidden') : getAppointWarnSet(sId, dataType, el, '');
        setWarnLogList(`#${el}List`, ret.datas, false, tableNameSet(dataType));
    });
}

//获取当前预警记录
function getCurrentWarnLogList(el, dataType) {
    const sId = $(`#${el}WarnCurrent`).val();
    if (isStrEmptyOrUndefined(sId)) {
        layer.msg('请选择预警名');
        return;
    }
    const data = {}
    data.opType = 1205;
    data.opData = JSON.stringify({ sId, type: 1, dataType });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        sId == 0 ? $(`#${el}InfoCurrent`).addClass('hidden') : getAppointWarnSet(sId, dataType, el, 'Current');
        setWarnLogList(`#${el}ListCurrent`, ret.datas, true, tableNameSet(dataType));
    });
}

//表格字段名称显示
function tableNameSet(dataType) {
    if (dataType === 1) {
        return 'VariableName';
    } else if (dataType === 2) {
        return 'Item';
    }
    return null;
}

//预警记录表格设置
function setWarnLogList(el, data, isCurrent, name) {
    const isWarning = d => d ? '是' : '否';
    const time = d => `${d.StartTime}至${d.EndTime}`;
    const frequency = d => {
        const arr = ['', '秒', '分', '小时', '天', '周', '月', '年'];
        return `<span>${d.Frequency}${arr[d.Interval]}${d.Count}次</span>`;
    };
    const condition = d => {
        const arr = ['', '大于', '大于等于', '小于', '小于等于'];
        return `<span>${arr[d]}</span>`;
    };
    const logic = d => {
        const arr = ['', '并且', '或者'];
        return `<span>${arr[d]}</span>`;
    };
    const value2 = d => d.Condition2 ? d.Value2 : '';
    const detailBtn = d => {
        return `<button class="btn btn-info btn-sm" onclick='showDetailModel(${d})'>查看</button>`;
    };
    const arr1 = [
        { data: null, title: '序号', render: (a, b, c, d) => ++d.row },
        { data: 'SetName', title: '预警名' },
        { data: 'Code', title: '机台号' },
        { data: name, title: '名称' },
        { data: 'CurrentTime', title: '出现时间', sClass: 'text-danger' },
        { data: 'Current', title: '出现次数', sClass: 'text-danger' }
    ];
    const arr2 = [
        { data: 'IsWarning', title: '是否预警', sClass: 'text-danger', render: isWarning },
        { data: 'WarningTime', title: '预警时间', sClass: 'text-danger' }
    ];
    const arr3 = [
        { data: null, title: '时间段', sClass: 'text-danger', render: time },
        { data: null, title: '出现频率', render: frequency },
        { data: 'Condition1', title: '条件1', render: condition },
        { data: 'Value1', title: '数值' },
        { data: 'Logic', title: '逻辑', render: logic },
        { data: 'Condition2', title: '条件2', render: condition },
        { data: null, title: '数值', render: value2 },
        { data: 'Values', title: '详情', render: detailBtn }
    ];
    const columns = isCurrent ? [...arr1, ...arr3] : [...arr1, ...arr2, ...arr3];
    $(el).DataTable({
        dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
        destroy: true,
        paging: true,
        searching: true,
        deferRender: true,
        data: data,
        language: oLanguage,
        aaSorting: [[0, 'asc']],
        aLengthMenu: [20, 40, 60],
        iDisplayLength: 20,
        columns: columns
    });
}

//预警记录详情弹窗
function showDetailModel(data) {
    $('#warnLogDetailList').DataTable({
        dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
        destroy: true,
        paging: true,
        searching: true,
        data: data,
        language: oLanguage,
        aaSorting: [[0, 'asc']],
        aLengthMenu: [20, 40, 60],
        iDisplayLength: 20,
        columns: [
            { data: null, title: '序号', render: (a, b, c, d) => ++d.row },
            { data: 'DT', title: '时间' },
            { data: 'V', title: '数值' }
        ]
    });
    $('#showDetailModel').modal('show');
}