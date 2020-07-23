function pageReady() {
    $('.ms2').select2();
    $('#sTime,#eTime').val(getDate()).datepicker('update').on('changeDate', () => getWarnLogList());
    new Promise(resolve => getWarnSet(resolve)).then(() => getWarnLogList());
    $('#deviceWarn').on('select2:select', () => getWarnLogList());
    $('#currentDeviceWarn').on('select2:select', () => getCurrentWarnLogList());
    $('#currentLi').one('click', () => getCurrentWarnLogList());
}

//获取所有设备预警
function getWarnSet(resolve) {
    ajaxPost('/Relay/Post', { opType: 1200, opData: JSON.stringify({ first: false, type: 1 }) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#deviceWarn,#currentDeviceWarn').empty().append(`<option value="0">全部</option>${setOptions(ret.datas, 'Name')}`);
        resolve();
    });
}

//获取指定设备预警
function getAppointWarnSet(qId, flag) {
    ajaxPost('/Relay/Post', { opType: 1200, opData: JSON.stringify({ first: false, type: 1, qId }) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $(`#warnLogInfo${flag}`).removeClass('hidden');
        const d = ret.datas[0];
        $(`#warnType${flag}`).text(d.Class);
        $(`#warnScript${flag}`).text(d.Script);
        $(`#warnDevice${flag}`).text(d.Code);
    });
}

//获取预计记录
function getWarnLogList() {
    const sId = $('#deviceWarn').val();
    if (isStrEmptyOrUndefined(sId)) {
        layer.msg('请选择预警名');
        return;
    }
    let startTime = $('#sTime').val().trim();
    if (isStrEmptyOrUndefined(startTime)) {
        layer.msg('请选择开始时间');
        return;
    }
    let endTime = $('#eTime').val().trim();
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
    data.opData = JSON.stringify({ sId, startTime, endTime, type: 1 });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        sId == 0 ? $('#warnLogInfo').addClass('hidden') : getAppointWarnSet(sId, '');
        setWarnLogList('#warnLogList', ret.datas, false);
    });
}


//获取当前预警记录
function getCurrentWarnLogList() {
    const sId = $('#currentDeviceWarn').val();
    if (isStrEmptyOrUndefined(sId)) {
        layer.msg('请选择预警名');
        return;
    }
    const data = {}
    data.opType = 1205;
    data.opData = JSON.stringify({ sId, type: 1 });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        sId == 0 ? $('#warnLogInfoCurrent').addClass('hidden') : getAppointWarnSet(sId, 'Current');
        setWarnLogList('#currentWarnLogList', ret.datas, true);
    });
}

//预警记录表格设置
function setWarnLogList(el, data, isCurrent) {
    const type = d => d === 1 ? '设备数据' : '生产数据';
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
        { data: 'Type', title: '数据类型', render: type },
        { data: 'Code', title: '机台号' },
        { data: 'VariableName', title: '名称' },
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
        deferRender:true,
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