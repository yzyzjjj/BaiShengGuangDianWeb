﻿function pageReady() {
    getProductionLine();
    $('#personNavLi').one('click', getPersonList);
    $('#deviceNavLi').one('click', getDeviceList);
    $('#flowNavLi').one('click', getProcessCodeList);
    $('#processSetNavLi').one('click', getProcessOpList);
    $('#planNavLi').one('click', getPlanList);
    $('#workOrderNavLi').one('click', getWorkOrderList);
    $('#taskOrderNavLi').one('click', getTaskOrderList);
    $('#flowCardNavLi').one('click', () => {
        $('#sendCardSTime,#sendCardETime').val(getDate()).datepicker('update');
        const taskOrderFn = myPromise(5090);
        const processCodeFn = myPromise(5040);
        const planFn = myPromise(5060);
        Promise.all([taskOrderFn, processCodeFn, planFn]).then(result => {
            const all = '<option value="0">所有</option>';
            $('#flowCardTaskOrderSelect').html(`${all}${setOptions(result[0], 'TaskOrder')}`);
            $('#flowCardProcessCodeSelect').html(`${all}${setOptions(result[1], 'Code')}`);
            $('#flowCardPlanSelect').html(`${all}${setOptions(result[2], 'Product')}`);
            getFlowCardList();
        });
    });
    $('#addProcessCodeBody,#addProcessCodeCategoryBody').on('click', '.upTr', function () {
        const tr = $(this).parents('tr');
        const tbody = '#' + $(this).parents('tbody').attr('id');
        const upTr = tr.prev();
        upTr.before(tr);
        setAddProcessOpList(tbody);
    });
    $('#addProcessCodeBody,#addProcessCodeCategoryBody').on('click', '.delBtn', function () {
        const tbody = '#' + $(this).parents('tbody').attr('id');
        $(this).parents('tr').remove();
        setAddProcessOpList(tbody);
    });
    $('#planProcessCodeList').on('change', '.process-code-select', function () {
        const id = $(this).val();
        const d = _planProcessCodeInfo[id];
        $(this).siblings('.process-code-category').text(`类型：${d.Category}`);
        const processId = d.List ? d.List.split(',') : [];
        const processes = d.Processes ? d.Processes.split(',') : [];
        const arr = processId.map((item, i) => ({ ProcessId: item, Process: processes[i], ProcessNumber: 0, ProcessCodeId: d.Id }));
        const tableConfig = _tablesConfig(false, arr);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Process', title: '流程' },
            { data: null, title: '可否返工', render: tableSet.isRework },
            { data: 'ProcessNumber', title: '单台加工数量', render: tableSet.addInput.bind(null, 'processNumber', 'auto') },
            { data: null, title: '工艺数据', render: tableSet.setBtn }
        ]);
        $(this).closest('.temp').find('.process-table').DataTable(tableConfig);
        disabledProcessCode();
    });
    $('#planProcessCodeList').on('click', '.browse-btn', function () {
        myPromise(5040).then(data => {
            const tableConfig = _tablesConfig(false, data, 0);
            const tableSet = _tableSet();
            tableConfig.columns = tableConfig.columns.concat([
                { data: 'Code', title: '编号' },
                { data: 'Category', title: '类型' },
                { data: 'Processes', title: '流程详情', render: tableSet.processDetail },
                { data: 'Remark', title: '备注' }
            ]);
            $('#browseProcessCodeList').DataTable(tableConfig);
            $('#browseProcessCodeModel').modal('show');
        });
    });
    $('#planProcessCodeList').on('click', '.del-btn', function () {
        $(this).closest('.temp').remove();
        disabledProcessCode();
        $('#addPlanProcessList').prop('disabled', false);
    });
    $('#planProcessCodeList').on('click', '.set-btn', function () {
        const data = this.ProcessData ? this.ProcessData.map(item => ({
            addPressM: item[0],
            addPressS: item[1],
            workM: item[2],
            workS: item[3],
            setPress: item[4],
            rotate: item[5]
        })) : [];
        const tableConfig = _tablesConfig(false, data);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'addPressM', title: '加压时间（M）', render: tableSet.addInput.bind(null, 'addPressM', 'auto') },
            { data: 'addPressS', title: '加压时间（S）', render: tableSet.addInput.bind(null, 'addPressS', 'auto') },
            { data: 'workM', title: '工序时间（M）', render: tableSet.addInput.bind(null, 'workM', 'auto') },
            { data: 'workS', title: '工序时间（S）', render: tableSet.addInput.bind(null, 'workS', 'auto') },
            { data: 'setPress', title: '设定压力（Kg）', render: tableSet.addInput.bind(null, 'setPress', 'auto') },
            { data: 'rotate', title: '下盘速度（rpm）', render: tableSet.addInput.bind(null, 'rotate', 'auto') },
            { data: null, title: '删除', render: () => '<button class="btn btn-danger btn-xs del-btn"><i class="fa fa-minus"></i></button>' }
        ]);
        $('#setCraftList').DataTable(tableConfig);
        $('#addCraftTrBtn').prop('disabled', getDataTableRow('#setCraftList').length === 8);
        $('#setCraftModel').modal('show');
        $('#addCraftBtn').off('click').on('click', () => {
            const trs = getDataTableRow('#setCraftList');
            if (!trs.length) {
                layer.msg('请先设置数据再添加');
                return;
            }
            const info = Array.from(trs).map(tr => {
                const el = $(tr);
                const addPressM = el.find('.addPressM').val() >> 0 || 0;
                const addPressS = el.find('.addPressS').val() >> 0 || 0;
                const workM = el.find('.workM').val() >> 0 || 0;
                const workS = el.find('.workS').val() >> 0 || 0;
                const setPress = el.find('.setPress').val() >> 0 || 0;
                const rotate = el.find('.rotate').val() >> 0 || 0;
                return [addPressM, addPressS, workM, workS, setPress, rotate];
            });
            this.ProcessData = info;
            layer.msg('工艺设置成功');
            $('#setCraftModel').modal('hide');
        });
    });
    $('#setCraftList').on('click', '.del-btn', function () {
        $('#addCraftTrBtn').prop('disabled', false);
        delDataTableTr.call(this);
    });
    $('#addCraftTrBtn').on('click', function () {
        const trData = {
            addPressM: 0,
            addPressS: 0,
            workM: 0,
            workS: 0,
            setPress: 0,
            rotate: 0
        }
        addDataTableTr('#setCraftList', trData);
        if (getDataTableRow('#setCraftList').length === 8) $(this).prop('disabled', true);
    });
    $('#setCraftList,#planProcessCodeList,#addFlowCardProcessList').on('input', 'input', function () {
        onInput(this, 3, 0);
    });
    $('#setCraftList,#planProcessCodeList,#addFlowCardProcessList').on('focus', 'input', function () {
        if ($(this).val().trim() == 0) $(this).val('');
    });
    $('#setCraftList,#planProcessCodeList,#addFlowCardProcessList').on('blur', 'input', function () {
        if (isStrEmptyOrUndefined($(this).val().trim())) $(this).val(0);
    });
    $('#workOrderList,#addWorkOrderList,#taskOrderList,#addTaskOrderList').on('input', '.target', function () {
        onInput(this, 3, 0);
    });
    $('#workOrderList,#addWorkOrderList,#taskOrderList,#addTaskOrderList').on('focus', '.target', function () {
        if ($(this).val().trim() == 0) $(this).val('');
    });
    $('#workOrderList,#addWorkOrderList,#taskOrderList,#addTaskOrderList').on('blur', '.target', function () {
        if (isStrEmptyOrUndefined($(this).val().trim())) $(this).val(0);
    });
    $('#addTaskOrderList').on('change', '.workOrder', function () {
        const qId = $(this).val();
        myPromise(5070, { qId }, true).then(data => {
            const d = data[0];
            $(this).closest('td').next().text(d.Target).next().text(d.Left).next().text(d.Doing).nextAll().find('.deliveryTime').val(d.DeliveryTime.split(' ')[0]).datepicker('update');
        });
    });
    $('#taskOrderSelect').on('change', function () {
        const qId = $(this).val();
        myPromise(5090, { qId }, true).then(data => {
            const d = data[0];
            $('#taskOrderTarget').text(d.Target);
            $('#taskOrderIssueCount').text(d.IssueCount);
            $('#taskOrderIssue').text(d.Issue);
            $('#taskOrderDoingCount').text(d.DoingCount);
            $('#taskOrderDoneCount').text(d.DoneCount);
        });
    });
    $('#processDetailList').on('click', '.look-btn', function () {
        const data = this.ProcessData.map(item => ({
            addPressM: item[0],
            addPressS: item[1],
            workM: item[2],
            workS: item[3],
            setPress: item[4],
            rotate: item[5]
        }));
        const tableConfig = _tablesConfig(false, data);
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'addPressM', title: '加压时间（M）' },
            { data: 'addPressS', title: '加压时间（S）' },
            { data: 'workM', title: '工序时间（M）' },
            { data: 'workS', title: '工序时间（S）' },
            { data: 'setPress', title: '设定压力（Kg）' },
            { data: 'rotate', title: '下盘速度（rpm）' }
        ]);
        $('#craftDetailList').DataTable(tableConfig);
        $('#showCraftDetailModal').modal('show');
    });
    $('#addFlowCardTaskOrderSelect').on('change', function () {
        const qId = $(this).val();
        myPromise(5090, { qId }, true).then(e => selectTaskOrder(e[0]));
    });
    $('#addFlowCardProcessCodeSelect').on('change', function () {
        const qId = $(this).val();
        if (qId) {
            myPromise(5040, { qId }, true).then(e => {
                const processData = e[0];
                $('#addFlowCardType').text(processData.Category);
                $('#addFlowCardProcessDetail').text(processData.Processes.replace(/,/g, ' > '));
            });
        } else {
            $('#addFlowCardType').text('');
            $('#addFlowCardProcessDetail').text('');
        }
    });
    $('#showMode').on('change', getProductionLine);
    $('#productionLineList').on('click', '.show-task-btn', function (e) {
        const workOrderId = $(this).val();
        myPromise(5250, { workOrderId }, true).then(data => {
            const tableConfig = _tablesConfig(false, data);
            const tableSet = _tableSet();
            tableConfig.columns = tableConfig.columns.concat([
                { data: 'TaskOrder', title: '任务单' },
                { data: 'Product', title: '计划号' },
                { data: null, title: '状态', render: tableSet.state },
                { data: 'DeliveryTime', title: '交货日期', render: tableSet.delivery },
                { data: 'Progress', title: '进度', render: tableSet.progress },
                { data: 'Id', title: '流程卡', render: d => `<button class="btn btn-info btn-sm show-flow-btn" value="${d}">查看</button>` }
            ]);
            $('#taskDetailList').DataTable(tableConfig);
            $('#showTaskDetailModal').modal('show');
        });
        e.stopPropagation();
    });
    $('#productionLineList').on('click', '.work-order', function () {
        getLineCommon.call(this, 5201, getWorkLine);
        const tableFn = (data, timeTitle, infoTitle) => {
            const tableConfig = _tablesConfig(false, data);
            tableConfig.columns = tableConfig.columns.concat([
                { data: 'FaultTime', title: timeTitle },
                { data: 'WorkOrder', title: '工单' },
                { data: 'FlowCard', title: '流程卡' },
                { data: 'Process', title: '工序' },
                { data: null, title: infoTitle, render: d => d.Remark || d.Fault }
            ]);
            return tableConfig;
        }
        const qId = $(this).attr('value');
        const warningLineBox = () => {
            myPromise(5204, { workOrderId: qId }, true).then(e => {
                processWarningDangerTemp('warning', `报警工单（${e.length}）`);
                $('#warningLineBox .refresh').on('click', warningLineBox);
                $('#warningLineBox table').DataTable(tableFn(e, '报警时间', '报警信息'));
            });
        }
        const dangerLineBox = () => {
            myPromise(5205, { workOrderId: qId }, true).then(e => {
                processWarningDangerTemp('danger', `中断工单（${e.length}）`);
                $('#dangerLineBox .refresh').on('click', dangerLineBox);
                $('#dangerLineBox table').DataTable(tableFn(e, '中断时间', '原因'));
            });
        }
        warningLineBox();
        dangerLineBox();
    });
    $('#productionLineList').on('click', '.task-order', function () {
        getLineCommon.call(this, 5251, getTaskLine);
        const tableFn = (data, timeTitle, infoTitle) => {
            const tableConfig = _tablesConfig(false, data);
            tableConfig.columns = tableConfig.columns.concat([
                { data: 'FaultTime', title: timeTitle },
                { data: 'TaskOrder', title: '任务单' },
                { data: 'FlowCard', title: '流程卡' },
                { data: 'Process', title: '工序' },
                { data: null, title: infoTitle, render: d => d.Remark || d.Fault }
            ]);
            return tableConfig;
        }
        const qId = $(this).attr('value');
        const workId = $(this).attr('work');
        const successLineBox = () => {
            myPromise(5251, { qId: workId }, true).then(e => {
                processWarningDangerTemp('success', `标准工序（${e.length ? e[0].Processes.length : 0}）`);
                $('#successLineBox .refresh').on('click', successLineBox);
                const tableConfig = _tablesConfig(false, e.length ? e[0].Processes : []);
                const tableSet = _tableSet();
                tableConfig.columns = tableConfig.columns.concat([
                    { data: 'Process', title: '工序' },
                    { data: null, title: '最后完成时间', render: tableSet.endFinishTime },
                    { data: 'Progress', title: '进度', render: tableSet.progress },
                    { data: 'Qualified', title: '加工次数' },
                    { data: 'Before', title: '产量' }
                ]);
                $('#successLineBox table').DataTable(tableConfig);
            });
        }
        const warningLineBox = () => {
            myPromise(5254, { taskOrderId: qId }, true).then(e => {
                processWarningDangerTemp('warning', `报警工单（${e.length}）`);
                $('#warningLineBox .refresh').on('click', warningLineBox);
                $('#warningLineBox table').DataTable(tableFn(e, '报警时间', '报警信息'));
            });
        }
        const dangerLineBox = () => {
            myPromise(5255, { taskOrderId: qId }, true).then(e => {
                processWarningDangerTemp('danger', `中断工单（${e.length}）`);
                $('#dangerLineBox .refresh').on('click', dangerLineBox);
                $('#dangerLineBox table').DataTable(tableFn(e, '中断时间', '原因'));
            });
        }
        successLineBox();
        warningLineBox();
        dangerLineBox();
    });
    $('#productionLineList').on('click', '.flow-card', function () {
        getLineCommon.call(this, 5301, getFlowCardLine);
        const tableFn = (data, timeTitle, infoTitle) => {
            const tableConfig = _tablesConfig(false, data);
            tableConfig.columns = tableConfig.columns.concat([
                { data: 'FaultTime', title: timeTitle },
                { data: 'FlowCard', title: '流程卡' },
                { data: 'Process', title: '工序' },
                { data: null, title: infoTitle, render: d => d.Remark || d.Fault }
            ]);
            return tableConfig;
        }
        const qId = $(this).attr('value');
        const successLineBox = () => {
            myPromise(5150, { flowCardId: qId }, true).then(e => {
                processWarningDangerTemp('success', `流程卡工序（${e.length}）`);
                $('#successLineBox .refresh').on('click', successLineBox);
                const tableConfig = _tablesConfig(false, e);
                const tableSet = _tableSet();
                tableConfig.columns = tableConfig.columns.concat([
                    { data: 'Process', title: '工序' },
                    { data: null, title: '最后完成时间', render: tableSet.endFinishTime },
                    { data: 'Progress', title: '进度', render: tableSet.progress },
                    { data: 'Count', title: '加工次数' },
                    { data: 'Before', title: '产量' }
                ]);
                $('#successLineBox table').DataTable(tableConfig);
            });
        }
        const warningLineBox = () => {
            myPromise(5304, { flowCardId: qId }, true).then(e => {
                processWarningDangerTemp('warning', `报警工单（${e.length}）`);
                $('#warningLineBox .refresh').on('click', warningLineBox);
                $('#warningLineBox table').DataTable(tableFn(e, '报警时间', '报警信息'));
            });
        }
        const dangerLineBox = () => {
            myPromise(5305, { flowCardId: qId }, true).then(e => {
                processWarningDangerTemp('danger', `中断工单（${e.length}）`);
                $('#dangerLineBox .refresh').on('click', dangerLineBox);
                $('#dangerLineBox table').DataTable(tableFn(e, '中断时间', '原因'));
            });
        }
        successLineBox();
        warningLineBox();
        dangerLineBox();
    });
    $('#taskDetailList,#productionLineList').on('click', '.show-flow-btn', function (e) {
        const taskOrderId = $(this).val();
        myPromise(5300, { taskOrderId }, true).then(data => {
            const tableConfig = _tablesConfig(false, data);
            const tableSet = _tableSet();
            tableConfig.columns = tableConfig.columns.concat([
                { data: 'CreateTime', title: '发出日期' },
                { data: 'FlowCard', title: '流程卡号' },
                { data: 'Process', title: '当前工序' },
                { data: null, title: '状态', render: tableSet.state },
                { data: 'Progress', title: '进度', render: tableSet.progress }
            ]);
            $('#flowDetailList').DataTable(tableConfig);
            $('#showFlowDetailModal').modal('show');
        });
        e.stopPropagation();
    });
    $('#addCapacityList').on('change', '.process', function () {
        const id = $(this).val();
        const d = _planProcessCodeInfo[id];
        $(this).parent().next().text(d.DeviceCategory);
    });
}

//异步获取数据
function myPromise(opType, opData, isParGet = false, isLoad = 1) {
    const data = { opType };
    opData && (data.opData = JSON.stringify(opData));
    isParGet && (opData = !opData);
    return new Promise(resolve => {
        ajaxPost('/Relay/Post', data, ret => {
            if (opData) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) resolve(ret);
            } else {
                if (ret.errno != 0) return layer.msg(ret.errmsg);
                resolve(ret.datas);
            }
        }, isLoad);
    });
}

//dataTable基本参数
function _tablesConfig(isList, data, order = 1) {
    const obj = {
        dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
        bAutoWidth: false,
        destroy: true,
        paging: true,
        searching: isList,
        ordering: isList,
        data: data,
        aaSorting: [[order, 'asc']],
        aLengthMenu: [20, 40, 60],
        iDisplayLength: 20,
        language: oLanguage,
        columns: [
            { data: null, title: '序号', render: _tableSet().order, sWidth: '25px' }
        ]
    };
    isList && obj.columns.unshift({ data: null, title: '', render: _tableSet().isEnable, orderable: false, sWidth: '80px' });
    return obj;
}

//dataTable渲染标签
function _tableSet() {
    return {
        order: (a, b, c, d) => d.row + 1,
        isEnable: d => `<input type="checkbox" class="icb_minimal isEnable" value="${d.Id}">`,
        input: (className, d) => `<span class="textOn">${d}</span><input type="text" class="form-control text-center textIn ${className} hidden" maxlength="20" style="min-width:120px;width:${className === 'remark' ? '100%' : 'auto'}" value=${d}>`,
        addInput: (className, width, d) => `<input type="text" class="form-control text-center ${className}" style="margin:auto;min-width:120px;width:${width}", value="${d}">`,
        select: (ops, className, d) => `<span class="textOn">${d}</span><select class="form-control hidden textIn ${className}" style="min-width:120px">${ops}</select>`,
        addSelect: (ops, className) => `<select class="form-control ${className}" style="min-width:120px">${ops}</select>`,
        updateBtn: (fn, d) => `<button class="btn btn-success btn-xs" onclick="${fn}.call(this)" value="${d}">修改</button>`,
        delBtn: () => `<button class="btn btn-danger btn-xs" onclick="delDataTableTr.call(this)"><i class="fa fa-minus"></i></button>`,
        addBtn: fn => `<button class="btn btn-success btn-xs" onclick="${fn}.call(this)"><i class="fa fa-plus"></i></button>`,
        setBtn: () => '<button class="btn btn-primary btn-sm set-btn">设置</button>',
        detailBtn: (fn, d) => `<button class="btn btn-info btn-sm" onclick="${fn}.call(this)" value="${d}">查看</button>`,
        processDetail: d => d.replace(/,/g, ' > '),
        isRework: () => '<select class="form-control isRework" style="width:100px"><option value="0">否</option><option value="1">是</option></select>',
        isReworkText: d => d ? '是' : '否',
        day: (className, d) => `<span class="textOn">${d.split(' ')[0]}</span><input type="text" class="pointer textIn hidden form_date form-control text-center ${className}" style="min-width: 100px">`,
        addDay: (className, d) => `<input type="text" class="pointer form_date form-control text-center ${className}" value="${d.split(' ')[0]}" style="min-width: 100px">`,
        state: d => {
            const colors = ['#CCCCCC', '#ff9933', '#ff33cc', 'black', 'black', '#FF0000'];
            return `<span style="color:${colors[d.State]}">${d.StateStr}</span>`;
        },
        delivery: d => {
            const threeDay = 259200000;
            let color = 'black';
            if (new Date(d) - new Date(getFullTime()) < threeDay) color = 'red';
            return `<span style="color:${color}">${d.split(' ')[0]}</span>`;
        },
        progress: d => `${d}%`,
        endFinishTime: d => d.State === 4 ? d.EndTime : _tableSet().state(d)
    }
}

//添加一行
function addDataTableTr(id, obj) {
    $(id).DataTable().row.add(obj).draw(false);
}

//删除一行
function delDataTableTr() {
    const tr = $(this).parents('tr')[0];
    const xh = $(tr).find('td:first').text() >> 0;
    const tableId = $(tr).parents('table').prop('id');
    const dataTable = $(`#${tableId}`).DataTable();
    dataTable.row(tr).remove().draw(false);
    dataTable.column(0).nodes().each(item => {
        const flag = $(item).text() >> 0;
        if (flag > xh) {
            $(item).text(flag - 1);
        }
    });
}

//获取dataTable所有row
function getDataTableRow(table) {
    return $(table).DataTable().rows().nodes();
}

//初始化iChick并添加事件
function initCheckboxAddEvent(arr, callback) {
    const api = this.api();
    $(this).find('.isEnable').iCheck({
        handle: 'checkbox',
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '20%'
    }).on('ifChanged', function () {
        const tr = $(this).parents('tr');
        const trDom = tr[0];
        if ($(this).is(':checked')) {
            arr.push(trDom);
            if (callback) {
                callback(tr, api.row(trDom).data());
                tr.find('.textOn').addClass('hidden').siblings('.textIn').removeClass('hidden');
            }
        } else {
            arr.splice(arr.indexOf(trDom), 1);
            callback && tr.find('.textIn').addClass('hidden').siblings('.textOn').removeClass('hidden');
        }
    });
}

//删除表格数据
function delTableRow(trs, opType, callback) {
    if (!trs.length) return layer.msg('请选择需要删除的数据');
    const ids = [];
    trs.forEach(item => {
        const el = $(item);
        ids.push(el.find('.isEnable').val() >> 0);
    });
    showConfirm('删除所选项', () => myPromise(opType, { ids }).then(callback));
}

//添加表格数据
function addTableRow(tableId, getTrInfo, opType, callback) {
    const arr = [];
    const trs = getDataTableRow(tableId);
    if (!trs.length) {
        layer.msg('请先设置数据再添加');
        return;
    }
    for (let i = 0, len = trs.length; i < len; i++) {
        const trInfo = getTrInfo($(trs[i]), true);
        if (!trInfo) return;
        arr.push(trInfo);
    }
    myPromise(opType, arr).then(callback);
}

//修改表格数据
function updateTableRow(trs, getTrInfo, opType, callback) {
    if (!trs.length) {
        layer.msg('请选择需要修改的数据');
        return;
    }
    const arr = [];
    for (let i = 0, len = trs.length; i < len; i++) {
        const trInfo = getTrInfo($(trs[i]), false);
        if (!trInfo) return;
        arr.push(trInfo);
    }
    myPromise(opType, arr).then(callback);
}

//初始化时间选择器
function initDayTime(el) {
    $(el).find('.form_date').attr('readonly', true).datepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd',
        maxViewMode: 2,
        todayBtn: 'linked',
        autoclose: true
    });
}

//----------------------------------------生产线----------------------------------------------------

//排程弹窗
function showScheduleModal() {
    myPromise(5401).then(data => {
        const tableConfig = _tablesConfig(false, data);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Code', title: '设备' },
            { data: 'FlowCard', title: '流程卡' },
            { data: null, title: '状态', render: tableSet.state },
            { data: 'DeliveryTime', title: '交货日期', render: tableSet.delivery },
            { data: 'Progress', title: '进度', render: tableSet.progress }
        ]);
        $('#scheduleList').DataTable(tableConfig);
        $('#showScheduleModal').modal('show');
    });
}

//根据显示方式获取表格
function getProductionLine() {
    clearInterval($('#productionLineList')[0].time);
    $('#lineBox,#productionLineHead,#warningBox,#dangerBox,#successLineBox,#warningLineBox,#dangerLineBox').empty();
    const mode = $('#showMode').val();
    const opType = [5200, 5250, 5300];
    [workWarningList, taskWarningList, flowWarningList][mode]();
    [workDangerList, taskDangerList, flowDangerList][mode]();
    myPromise(opType[mode]).then(data => {
        const tableConfig = _tablesConfig(false, data, 0);
        const tableSet = _tableSet();
        const workArr = [
            { data: 'WorkOrder', title: '工单' },
            { data: null, title: '状态', render: tableSet.state },
            { data: 'DeliveryTime', title: '交货日期', render: tableSet.delivery },
            { data: 'Progress', title: '进度', render: tableSet.progress },
            { data: 'Id', title: '任务单', render: d => `<button class="btn btn-info btn-sm show-task-btn" value="${d}">查看</button>` },
            { data: 'Id', title: '', visible: false }
        ];
        const taskArr = [
            { data: 'TaskOrder', title: '任务单' },
            { data: 'Product', title: '计划号' },
            { data: null, title: '状态', render: tableSet.state },
            { data: 'DeliveryTime', title: '交货日期', render: tableSet.delivery },
            { data: 'Progress', title: '进度', render: tableSet.progress },
            { data: 'Id', title: '流程卡', render: d => `<button class="btn btn-info btn-sm show-flow-btn" value="${d}">查看</button>` }
        ];
        const flowCardArr = [
            { data: 'CreateTime', title: '发出日期' },
            { data: 'FlowCard', title: '流程卡号' },
            { data: 'Process', title: '当前工序' },
            { data: null, title: '状态', render: tableSet.state },
            { data: 'Progress', title: '进度', render: tableSet.progress },
            { data: 'Id', title: '', visible: false }
        ];
        tableConfig.columns = tableConfig.columns.concat([workArr, taskArr, flowCardArr][mode]);
        const className = ['work-order', 'task-order', 'flow-card'][mode];
        tableConfig.createdRow = (tr, d) => {
            $(tr).addClass(`pointer ${className}`).attr('value', d.Id);
            if (mode == 1) $(tr).attr('work', d.WorkOrderId);
        };
        $('#productionLineList').DataTable(tableConfig);
    });
}

//报警工单
function workWarningList() {
    myPromise(5202).then(data => {
        const d = warningDangerCount(data, 'WorkOrder');
        warningDangerTemp('warning', `报警工单（${d.count}）`, '<th>工单</th><th>报警次数</th>', d.tbody, 'workWarningList');
    });
}

//中断工单
function workDangerList() {
    myPromise(5203).then(data => {
        const d = warningDangerCount(data, 'WorkOrder');
        warningDangerTemp('danger', `中断工单（${d.count}）`, '<th>工单</th><th>中断次数</th>', d.tbody, 'workDangerList');
    });
}

//报警任务单
function taskWarningList() {
    myPromise(5252).then(data => {
        const d = warningDangerCount(data, 'TaskOrder');
        warningDangerTemp('warning', `报警任务单（${d.count}）`, '<th>任务单</th><th>报警次数</th>', d.tbody, 'taskWarningList');
    });
}

//中断任务单
function taskDangerList() {
    myPromise(5253).then(data => {
        const d = warningDangerCount(data, 'TaskOrder');
        warningDangerTemp('danger', `中断任务单（${d.count}）`, '<th>任务单</th><th>中断次数</th>', d.tbody, 'taskDangerList');
    });
}

//报警流程卡
function flowWarningList() {
    myPromise(5302).then(data => {
        const d = warningDangerCount(data, 'FlowCard');
        warningDangerTemp('warning', `报警流程卡（${d.count}）`, '<th>流程卡</th><th>报警次数</th>', d.tbody, 'flowWarningList');
    });
}

//中断流程卡
function flowDangerList() {
    myPromise(5303).then(data => {
        const d = warningDangerCount(data, 'FlowCard');
        warningDangerTemp('danger', `中断流程卡（${d.count}）`, '<th>流程卡</th><th>中断次数</th>', d.tbody, 'flowDangerList');
    });
}

//报警中断面板公共数据处理
function warningDangerCount(data, name) {
    let count = 0, tbody = '';
    data.forEach(item => {
        count += item.Count;
        tbody += `<tr><td>${item[name]}</td><td>${item.Count}</td></tr>`;
    });
    return { count, tbody }
}

//报警中断面板生成
function warningDangerTemp(attr, title, thead, tbody, callback) {
    const temp = `<div class="panel panel-${attr}">
                        <div class="panel-heading">
                            <span class="glyphicon glyphicon-refresh pull-right pointer text-bold" aria-hidden="true" title="刷新" onclick="${callback}()"></span>
                            <h3 class="panel-title text-center">${title}</h3>
                        </div>
                        <div class="panel-body">
                            <div class="table-responsive">
                                <table class="table table-hover table-striped">
                                    <thead><tr>${thead}</tr></thead>
                                    <tbody>${tbody}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
    $(`#${attr}Box`).html(temp);
}

//工单、任务单、流程卡（工序、报警、中断）面板生成
function processWarningDangerTemp(attr, title) {
    const temp = `<div class="panel panel-${attr}">
                        <div class="panel-heading">
                            <span class="glyphicon glyphicon-refresh pull-right pointer text-bold refresh" aria-hidden="true" title="刷新"></span>
                            <h3 class="panel-title text-center">${title}</h3>
                        </div>
                        <div class="panel-body">
                            <div class="table-responsive mailbox-messages">
                                <table class="table table-hover table-striped"></table>
                            </div>
                        </div>
                    </div>`;
    $(`#${attr}LineBox`).html(temp);
}

//获取生产线公共函数
function getLineCommon(opType, callback) {
    const trs = getDataTableRow('#productionLineList');
    Array.from(trs).forEach(tr => $(tr).css('background', ''));
    $(this).css('background', '#d9edf7');
    const qId = $(this).attr('value');
    const fn = () => {
        callback(qId);
        myPromise(opType, { qId }, true, 0).then(data => {
            const colors = ['white', 'green', 'orange', 'gray', 'darkblue', '#00A9FC'];
            let index = 0;
            const arr = [];
            const temp = data.reduce((a, b) => `${a}<div style="width:100%;position: relative;overflow-x:scroll;height:133px"><div class="line">
                                ${b.Processes.reduce((a, b) => (arr.push(b.Faults), `${a}<div class="line-box">
                                    <div class="line-box-title">
                                        <span>${b.Process}</span>
                                        <span class="info" style="background:${colors[b.State]}">${b.StateStr}</span>
                                    </div>
                                    <div class="line-box-content">
                                        <p>进度：${b.Progress}%</p>
                                        <p>合格数：${b.Qualified}</p>
                                        <p>不合格数：${b.Unqualified}</p>
                                        <p>报警列表(${b.Faults.length})：<button class="btn btn-info btn-xs show-btn" value="${index++}">查看</button></p>
                                    </div>
                                </div>`), '')}
                            </div></div>`, '');
            $('#lineBox').html(temp).off('click').on('click', '.show-btn', function () {
                const tableConfig = _tablesConfig(false, arr[$(this).val()]);
                tableConfig.columns = tableConfig.columns.concat([
                    { data: 'FaultTime', title: '时间' },
                    { data: 'FlowCard', title: '流程卡' },
                    { data: null, title: '信息', render: d => d.Remark || d.Fault }
                ]);
                $('#WarningDetailList').DataTable(tableConfig);
                $('#showWarningDetailModal').modal('show');
            });
        });
    }
    fn();
    clearInterval($('#productionLineList')[0].time);
    $('#productionLineList')[0].time = setInterval(fn, 5000);
}

//获取工单生产线信息
function getWorkLine(qId) {
    myPromise(5070, { qId }, true, 0).then(e => {
        const one = '<tr class="text-bold"><td>工单</td><td class="text-blue">交货数量</td><td class="text-red">交货日期</td><td>任务单数量</td><td>已完成任务单数量</td><td class="text-info">已完成</td><td class="text-green">已交货</td><td class="text-orange">未完成</td><td>已耗时</td><td>按时率</td><td>风险等级</td></tr>';
        const d = e[0];
        const two = `<tr><td>${d.WorkOrder}</td><td>${d.Target}</td><td>${d.DeliveryTime.split(' ')[0]}</td><td>${d.IssueCount}</td><td>${d.DoneCount}</td><td>${d.Done}</td><td>${d.Delivery}</td><td>${d.Left}</td><td>${codeTime(d.Consume)}</td><td>${d.OnTimeRate}%</td><td>${d.RiskLevelStr}</td></tr>`;
        $('#productionLineHead').html(`${one}${two}`);
    });
}

//获取任务单生产线信息
function getTaskLine(qId) {
    myPromise(5090, { qId }, true, 0).then(e => {
        const one = '<tr class="text-bold"><td>任务单</td><td>计划号</td><td class="text-blue">交货数量</td><td class="text-red">交货日期</td><td>已发流程卡</td><td>以完成流程卡</td><td class="text-info">已完成</td><td class="text-green">已交货</td><td class="text-orange">未完成</td><td>已耗时</td><td>按时率</td><td>风险等级</td></tr>';
        const d = e[0];
        const two = `<tr><td>${d.TaskOrder}</td><td>${d.Product}</td><td>${d.Target}</td><td>${d.DeliveryTime.split(' ')[0]}</td><td>${d.IssueCount}</td><td>${d.DoneCount}</td><td>${d.Done}</td><td>${d.Delivery}</td><td>${d.Left}</td><td>${codeTime(d.Consume)}</td><td>${d.OnTimeRate}%</td><td>${d.RiskLevelStr}</td></tr>`;
        $('#productionLineHead').html(`${one}${two}`);
    });
}

//获取流程卡生产线信息
function getFlowCardLine(qId) {
    myPromise(5110, { qId }, true, 0).then(e => {
        const one = '<tr class="text-bold"><td>流程卡号</td><td>任务单</td><td>计划号</td><td>流程编号</td><td class="text-info">已完成</td><td class="text-orange">未完成</td><td>已耗时</td><td>按时率</td><td>风险等级</td></tr>';
        const d = e[0];
        const two = `<tr><td>${d.FlowCard}</td><td>${d.TaskOrder}</td><td>${d.Product}</td><td>${d.ProcessCode}</td><td>${d.Done}</td><td>${d.Left}</td><td>${codeTime(d.Consume)}</td><td>${d.OnTimeRate}%</td><td>${d.RiskLevelStr}</td></tr>`;
        $('#productionLineHead').html(`${one}${two}`);
    });
}

//----------------------------------------人员管理----------------------------------------------------
let _personTrs = null;

//获取人员列表
function getPersonList() {
    myPromise(5000).then(data => {
        _personTrs = [];
        const tableConfig = _tablesConfig(true, data);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Account', title: '用户名', render: tableSet.input.bind(null, 'account') },
            { data: 'Number', title: '编号', render: tableSet.input.bind(null, 'number') },
            { data: 'Name', title: '姓名', render: tableSet.input.bind(null, 'name') },
            { data: 'Remark', title: '备注', render: tableSet.input.bind(null, 'remark') }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _personTrs, (tr, d) => {
                tr.find('.account').val(d.Account);
                tr.find('.number').val(d.Number);
                tr.find('.name').val(d.Name);
                tr.find('.remark').val(d.Remark);
            });
        }
        $('#personList').DataTable(tableConfig);
    });
}

//人员列表tr数据获取
function getPersonTrInfo(el, isAdd) {
    const account = el.find('.account').val().trim();
    if (isStrEmptyOrUndefined(account)) return void layer.msg('用户名不能为空');
    const number = el.find('.number').val().trim();
    if (isStrEmptyOrUndefined(number)) return void layer.msg('编号不能为空');
    const name = el.find('.name').val().trim();
    if (isStrEmptyOrUndefined(name)) return void layer.msg('姓名不能为空');
    const list = {
        Account: account,
        Number: number,
        Name: name,
        Remark: el.find('.remark').val()
    }
    isAdd || (list.Id = el.find('.isEnable').val() >> 0);
    return list;
}

//修改人员
function updatePerson() {
    updateTableRow(_personTrs, getPersonTrInfo, 5001, getPersonList);
}

//添加人员模态框
function addPersonModel() {
    const trData = {
        Account: '',
        Number: '',
        Name: '',
        Remark: ''
    }
    const tableConfig = _tablesConfig(false, [trData]);
    const tableSet = _tableSet();
    tableConfig.columns = tableConfig.columns.concat([
        { data: 'Account', title: '用户名', render: tableSet.addInput.bind(null, 'account', 'auto') },
        { data: 'Number', title: '编号', render: tableSet.addInput.bind(null, 'number', 'auto') },
        { data: 'Name', title: '姓名', render: tableSet.addInput.bind(null, 'name', 'auto') },
        { data: 'Remark', title: '备注', render: tableSet.addInput.bind(null, 'remark', '100%') },
        { data: null, title: '删除', render: tableSet.delBtn }
    ]);
    $('#addPersonList').DataTable(tableConfig);
    $('#addPersonListBtn').off('click').on('click', () => addDataTableTr('#addPersonList', trData));
    $('#addPersonModel').modal('show');
}

//添加人员
function addPerson() {
    addTableRow('#addPersonList', getPersonTrInfo, 5002, () => {
        $('#addPersonModel').modal('hide');
        getPersonList();
    });
}

//删除人员
function delPerson() {
    delTableRow(_personTrs, 5003, getPersonList);
}

//----------------------------------------设备管理----------------------------------------------------
let _deviceTrs = null;

//获取设备列表
function getDeviceList() {
    const deviceTypeFn = myPromise(5020);
    const deviceFn = myPromise(5010);
    Promise.all([deviceTypeFn, deviceFn]).then(result => {
        _deviceTrs = [];
        const tableConfig = _tablesConfig(true, result[1]);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Category', title: '类型', render: tableSet.select.bind(null, setOptions(result[0], 'Category'), 'category') },
            { data: 'Code', title: '机台号', render: tableSet.input.bind(null, 'code') },
            { data: 'Remark', title: '备注', render: tableSet.input.bind(null, 'remark') }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _deviceTrs, (tr, d) => {
                tr.find('.category').val(d.CategoryId);
                tr.find('.code').val(d.Code);
                tr.find('.remark').val(d.Remark);
            });
        }
        $('#deviceList').DataTable(tableConfig);
    });
}

//设备列表tr数据获取
function getDeviceTrInfo(el, isAdd) {
    const category = el.find('.category').val();
    if (isStrEmptyOrUndefined(category)) return void layer.msg('请选择设备类型');
    const code = el.find('.code').val().trim();
    if (isStrEmptyOrUndefined(code)) return void layer.msg('机台号不能为空');
    const list = {
        CategoryId: category,
        Code: code,
        Remark: el.find('.remark').val()
    }
    isAdd || (list.Id = el.find('.isEnable').val() >> 0);
    return list;
}

//修改设备
function updateDevice() {
    updateTableRow(_deviceTrs, getDeviceTrInfo, 5011, getDeviceList);
}

//添加设备模态框
function addDeviceModel() {
    myPromise(5020).then(e => {
        const trData = {
            Category: '',
            Code: '',
            Remark: ''
        }
        const tableConfig = _tablesConfig(false, [trData]);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Category', title: '类型', render: tableSet.addSelect.bind(null, setOptions(e, 'Category'), 'category') },
            { data: 'Code', title: '机台号', render: tableSet.addInput.bind(null, 'code', 'auto') },
            { data: 'Remark', title: '备注', render: tableSet.addInput.bind(null, 'remark', '100%') },
            { data: null, title: '删除', render: tableSet.delBtn }
        ]);
        $('#addDeviceList').DataTable(tableConfig);
        $('#addDeviceListBtn').off('click').on('click', () => addDataTableTr('#addDeviceList', trData));
        $('#addDeviceModel').modal('show');
    });
}

//添加设备
function addDevice() {
    addTableRow('#addDeviceList', getDeviceTrInfo, 5012, () => {
        $('#addDeviceModel').modal('hide');
        getDeviceList();
    });
}

//删除设备
function delDevice() {
    delTableRow(_deviceTrs, 5013, getDeviceList);
}

//设备类型弹窗
function showDeviceCategoryModal() {
    getDeviceCategoryList();
    $('#deviceCategoryModal').modal('show');
}

let _deviceCategoryTrs = null;

//获取设备类型列表
function getDeviceCategoryList() {
    myPromise(5020).then(data => {
        _deviceCategoryTrs = [];
        const tableConfig = _tablesConfig(true, data);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Category', title: '类型', render: tableSet.input.bind(null, 'category') },
            { data: 'Remark', title: '备注', render: tableSet.input.bind(null, 'remark') }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _deviceCategoryTrs, (tr, d) => {
                tr.find('.category').val(d.Category);
                tr.find('.remark').val(d.Remark);
            });
        }
        $('#deviceCategoryList').DataTable(tableConfig);
    });
}

//设备类型列表tr数据获取
function getDeviceCategoryTrInfo(el, isAdd) {
    const category = el.find('.category').val().trim();
    if (isStrEmptyOrUndefined(category)) return void layer.msg('设备类型不能为空');
    const list = {
        Category: category,
        Remark: el.find('.remark').val()
    }
    isAdd || (list.Id = el.find('.isEnable').val() >> 0);
    return list;
}

//修改设备类型
function updateDeviceCategory() {
    updateTableRow(_deviceCategoryTrs, getDeviceCategoryTrInfo, 5021, () => {
        getDeviceCategoryList();
        getDeviceList();
    });
}

//添加设备类型模态框
function addDeviceCategoryModel() {
    const trData = {
        Category: '',
        Remark: ''
    }
    const tableConfig = _tablesConfig(false, [trData]);
    const tableSet = _tableSet();
    tableConfig.columns = tableConfig.columns.concat([
        { data: 'Category', title: '类型', render: tableSet.addInput.bind(null, 'category', 'auto') },
        { data: 'Remark', title: '备注', render: tableSet.addInput.bind(null, 'remark', '100%') },
        { data: null, title: '删除', render: tableSet.delBtn }
    ]);
    $('#addDeviceCategoryList').DataTable(tableConfig);
    $('#addDeviceCategoryListBtn').off('click').on('click', () => addDataTableTr('#addDeviceCategoryList', trData));
    $('#addDeviceCategoryModel').modal('show');
}

//添加设备类型
function addDeviceCategory() {
    addTableRow('#addDeviceCategoryList', getDeviceCategoryTrInfo, 5022, () => {
        $('#addDeviceCategoryModel').modal('hide');
        getDeviceCategoryList();
        getDeviceList();
    });
}

//删除设备类型
function delDeviceCategory() {
    delTableRow(_deviceCategoryTrs, 5023, () => {
        getDeviceCategoryList();
        getDeviceList();
    });
}

//----------------------------------------流程管理----------------------------------------------------
//----------------------------------------流程编号----------------------------------------------------

let _processCodeTrs = null;

//获取流程编号列表
function getProcessCodeList() {
    myPromise(5040).then(data => {
        _processCodeTrs = [];
        const tableConfig = _tablesConfig(true, data);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Code', title: '编号' },
            { data: 'Category', title: '类型' },
            { data: 'Processes', title: '流程详情', render: tableSet.processDetail },
            { data: 'Remark', title: '备注' },
            { data: 'Id', title: '修改', render: tableSet.updateBtn.bind(null, 'showUpdateProcessCodeModel'), sWidth: '80px' }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _processCodeTrs);
        }
        $('#processCodeList').DataTable(tableConfig);
    });
}

//添加修改流程编号模态框
function addEditProcessCodeModel(callback) {
    const getTypes = myPromise(5050);
    const getOps = myPromise(5030);
    Promise.all([getTypes, getOps]).then(result => {
        $('#addProcessCodeCategoryName').html(setOptions(result[0], 'Category'));
        const tableConfig = _tablesConfig(false, result[1]);
        const tableSet = _tableSet();
        tableConfig.columns.unshift({ data: null, title: '', render: tableSet.addBtn.bind(null, 'addProcessOpToCode'), orderable: false, sWidth: '80px' });
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Process', title: '流程' },
            { data: 'Remark', title: '备注' }
        ]);
        $('#addProcessCodeOpList').DataTable(tableConfig);
        $('#addProcessCodeBody').empty();
        callback();
        $('#addProcessCodeModel').modal('show');
    });
}

//添加修改流程编号
function addUpProcessCode(isAdd) {
    const code = $('#addProcessCodeName').val().trim();
    if (isStrEmptyOrUndefined(code)) return layer.msg('编号不能为空');
    const categoryId = $('#addProcessCodeCategoryName').val();
    if (isStrEmptyOrUndefined(categoryId)) return layer.msg('请选择类型');
    const arr = [];
    $('#addProcessCodeBody tr').each((i, item) => arr.push($(item).attr('list')));
    if (!arr.length) return layer.msg('请设置流程');
    const list = arr.join();
    const opType = isAdd ? 5042 : 5041;
    const opData = [{
        Code: code,
        CategoryId: categoryId,
        List: list,
        Remark: $('#addProcessCodeRemark').val().trim(),
        Id: isAdd ? 0 : $('#addEditBtn').val()
    }];
    myPromise(opType, opData).then(() => {
        $('#addProcessCodeModel').modal('hide');
        getProcessCodeList();
    });
}

//流程选项添加操作
function addProcessOpTo(table, tbody) {
    const tr = $(this).parents('tr')[0];
    const d = $(table).DataTable().row(tr).data();
    const processCodeTr = `<tr list="${d.Id}">
                             <td class="num"></td>
                             <td>${d.Process}</td>
                             <td><span class="glyphicon glyphicon-arrow-up pointer text-green upTr" aria-hidden="true" title="上移"></span></td>
                             <td><button class="btn btn-danger btn-xs delBtn"><i class="fa fa-minus"></i></button></td>
                           </tr>`;
    $(tbody).append(processCodeTr);
    setAddProcessOpList(tbody);
}

//添加流程编号流程选项添加操作
function addProcessOpToCode() {
    addProcessOpTo.call(this, '#addProcessCodeOpList', '#addProcessCodeBody');
}

//流程表格设置
function setAddProcessOpList(tbody) {
    const trs = $(`${tbody} tr`);
    for (let i = 0, len = trs.length; i < len; i++) {
        const tr = trs.eq(i);
        tr.find('.num').text(i + 1);
        i ? tr.find('.upTr').removeClass('hidden') : tr.find('.upTr').addClass('hidden');
    }
}

//添加流程编号模态框
function addProcessCodeModel() {
    addEditProcessCodeModel(() => {
        $('#addProcessCodeName').val('');
        $('#addProcessCodeCategoryName ').val($('#addProcessCodeCategoryName option:first').val());
        $('#addProcessCodeRemark').val('');
        $('#addEditTitle').text('添加流程编号');
        $('#addEditBtn').text('添加').val(0).off('click').on('click', addUpProcessCode.bind(null, true));
    });
}

//修改流程编号弹窗
function showUpdateProcessCodeModel() {
    const tr = $(this).parents('tr')[0];
    const d = $('#processCodeList').DataTable().row(tr).data();
    addEditProcessCodeModel(() => {
        $('#addProcessCodeName').val(d.Code);
        $('#addProcessCodeCategoryName ').val(d.CategoryId);
        $('#addProcessCodeRemark').val(d.Remark);
        const listId = d.List ? d.List.split(',') : [];
        const processes = d.Processes ? d.Processes.split(',') : [];
        const trs = listId.reduce((a, b, i) => `${a}<tr list="${b}">
                             <td class="num"></td>
                             <td>${processes[i]}</td>
                             <td><span class="glyphicon glyphicon-arrow-up pointer text-green upTr" aria-hidden="true" title="上移"></span></td>
                             <td><button class="btn btn-danger btn-xs delBtn"><i class="fa fa-minus"></i></button></td>
                           </tr>`, '');
        $('#addProcessCodeBody').append(trs);
        $('#addEditTitle').text('修改流程编号');
        $('#addEditBtn').text('修改').val(d.Id).off('click').on('click', addUpProcessCode.bind(null, false));
        setAddProcessOpList('#addProcessCodeBody');
    });
}

//删除流程编号
function delProcessCode() {
    delTableRow(_processCodeTrs, 5043, getProcessCodeList);
}

//----------------------------------------流程编号类型----------------------------------------------------

//流程编号类型弹窗
function showProcessCodeCategoryModal() {
    getProcessCodeCategoryList();
    $('#processCodeCategoryModal').modal('show');
}

let _processCodeCategoryTrs = null;

//获取流程编号类型列表
function getProcessCodeCategoryList() {
    myPromise(5050).then(data => {
        _processCodeCategoryTrs = [];
        const tableConfig = _tablesConfig(true, data);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Category', title: '类型' },
            { data: 'List', title: '标准流程', render: tableSet.processDetail },
            { data: 'Remark', title: '备注' },
            { data: 'Id', title: '修改', render: tableSet.updateBtn.bind(null, 'showUpdateProcessCodeCategoryModel'), sWidth: '80px' }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _processCodeCategoryTrs);
        }
        $('#processCodeCategoryList').DataTable(tableConfig);
    });
}

//添加修改流程编号类型模态框
function addEditProcessCodeCategoryModel(callback) {
    myPromise(5030).then(e => {
        const tableConfig = _tablesConfig(false, e);
        const tableSet = _tableSet();
        tableConfig.columns.unshift({ data: null, title: '', render: tableSet.addBtn.bind(null, 'addProcessOpToCodeCategory'), orderable: false, sWidth: '80px' });
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Process', title: '流程' },
            { data: 'Remark', title: '备注' }
        ]);
        $('#addProcessCodeCategoryOpList').DataTable(tableConfig);
        $('#addProcessCodeCategoryBody').empty();
        callback();
        $('#addProcessCodeCategoryModel').modal('show');
    });
}

//添加修改流程编号类型
function addUpProcessCodeCategory(isAdd) {
    const category = $('#addProcessCodeCategory').val().trim();
    if (isStrEmptyOrUndefined(category)) return layer.msg('类型不能为空');
    const list = {
        Category: category,
        Remark: $('#addProcessCodeCategoryRemark').val().trim()
    };
    isAdd || (list.Id = $('#addEditProcessCategoryBtn').val());
    const processes = Array.from($('#addProcessCodeCategoryBody tr')).map((item, i) => {
        const obj = {
            Order: i + 1,
            ProcessId: $(item).attr('list')
        }
        const processId = $(item).attr('processid');
        processId && (obj.Id = processId);
        return obj;
    });
    if (!processes.length) return layer.msg('请设置流程');
    list.Processes = processes;
    const opType = isAdd ? 5052 : 5051;
    myPromise(opType, [list]).then(() => {
        $('#addProcessCodeCategoryModel').modal('hide');
        getProcessCodeCategoryList();
    });
}

//流程选项添加操作
function addProcessOpToCodeCategory() {
    addProcessOpTo.call(this, '#addProcessCodeCategoryOpList', '#addProcessCodeCategoryBody');
}

//添加流程编号类型模态框
function addProcessCodeCategoryModel() {
    addEditProcessCodeCategoryModel(() => {
        $('#addProcessCodeCategory').val('');
        $('#addProcessCodeCategoryRemark').val('');
        $('#addEditProcessCategoryTitle').text('添加流程编号类型');
        $('#addEditProcessCategoryBtn').text('添加').val(0).off('click').on('click', addUpProcessCodeCategory.bind(null, true));
    });
}

//修改流程编号类型弹窗
function showUpdateProcessCodeCategoryModel() {
    const categoryId = $(this).val();
    myPromise(5056, { categoryId }, true).then(data => {
        addEditProcessCodeCategoryModel(() => {
            const tr = $(this).parents('tr')[0];
            const d = $('#processCodeCategoryList').DataTable().row(tr).data();
            $('#addProcessCodeCategory').val(d.Category);
            $('#addProcessCodeCategoryRemark').val(d.Remark);
            const trs = data.reduce((a, b) => `${a}<tr list="${b.ProcessId}" processid="${b.Id}">
                             <td class="num"></td>
                             <td>${b.Process}</td>
                             <td><span class="glyphicon glyphicon-arrow-up pointer text-green upTr" aria-hidden="true" title="上移"></span></td>
                             <td><button class="btn btn-danger btn-xs delBtn"><i class="fa fa-minus"></i></button></td>
                           </tr>`, '');
            $('#addProcessCodeCategoryBody').append(trs);
            $('#addEditProcessCategoryTitle').text('修改流程编号类型');
            $('#addEditProcessCategoryBtn').text('修改').val(categoryId).off('click').on('click', addUpProcessCodeCategory.bind(null, false));
            setAddProcessOpList('#addProcessCodeCategoryBody');
        });
    });
}

//删除流程编号类型
function delProcessCodeCategory() {
    delTableRow(_processCodeCategoryTrs, 5053, getProcessCodeCategoryList);
}

//----------------------------------------流程设置----------------------------------------------------

let _processOpTrs = null;

//获取流程设置列表
function getProcessOpList() {
    const deviceTypeFn = myPromise(5020);
    const processOpFn = myPromise(5030);
    Promise.all([deviceTypeFn, processOpFn]).then(result => {
        _processOpTrs = [];
        const tableConfig = _tablesConfig(true, result[1]);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Process', title: '流程', render: tableSet.input.bind(null, 'process') },
            { data: 'DeviceCategory', title: '设备类型', render: tableSet.select.bind(null, setOptions(result[0], 'Category'), 'category') },
            { data: 'Remark', title: '备注', render: tableSet.input.bind(null, 'remark') }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _processOpTrs, (tr, d) => {
                tr.find('.process').val(d.Process);
                tr.find('.category').val(d.DeviceCategoryId);
                tr.find('.remark').val(d.Remark);
            });
        }
        $('#processOpList').DataTable(tableConfig);
    });
}

//流程设置列表tr数据获取
function getProcessOpTrInfo(el, isAdd) {
    const process = el.find('.process').val().trim();
    if (isStrEmptyOrUndefined(process)) return void layer.msg('流程名称不能为空');
    const category = el.find('.category').val();
    if (isStrEmptyOrUndefined(category)) return void layer.msg('请选择设备类型');
    const list = {
        DeviceCategoryId: category,
        Process: process,
        Remark: el.find('.remark').val()
    }
    isAdd || (list.Id = el.find('.isEnable').val() >> 0);
    return list;
}

//修改流程设置
function updateProcessOp() {
    updateTableRow(_processOpTrs, getProcessOpTrInfo, 5031, getProcessOpList);
}

//添加流程设置模态框
function addProcessOpModel() {
    myPromise(5020).then(e => {
        const trData = {
            DeviceCategory: '',
            Process: '',
            Remark: ''
        }
        const tableConfig = _tablesConfig(false, [trData]);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Process', title: '流程', render: tableSet.addInput.bind(null, 'process', 'auto') },
            { data: 'DeviceCategory', title: '设备类型', render: tableSet.addSelect.bind(null, setOptions(e, 'Category'), 'category') },
            { data: 'Remark', title: '备注', render: tableSet.addInput.bind(null, 'remark', '100%') },
            { data: null, title: '删除', render: tableSet.delBtn }
        ]);
        $('#addProcessOpList').DataTable(tableConfig);
        $('#addProcessOpListBtn').off('click').on('click', () => addDataTableTr('#addProcessOpList', trData));
        $('#addProcessOpModel').modal('show');
    });
}

//添加流程设置
function addProcessOp() {
    addTableRow('#addProcessOpList', getProcessOpTrInfo, 5032, () => {
        $('#addProcessOpModel').modal('hide');
        getProcessOpList();
    });
}

//删除流程设置
function delProcessOp() {
    delTableRow(_processOpTrs, 5033, getProcessOpList);
}

//----------------------------------------计划号管理----------------------------------------------------

let _planTrs = null;

//获取计划号列表
function getPlanList() {
    myPromise(5060).then(data => {
        _planTrs = [];
        const tableConfig = _tablesConfig(true, data);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Product', title: '计划号' },
            { data: 'ProcessCodes', title: '流程编号清单' },
            { data: 'Remark', title: '备注' },
            { data: 'Id', title: '修改', render: tableSet.updateBtn.bind(null, 'showUpdatePlanModel'), sWidth: '80px' }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _planTrs);
        }
        $('#planList').DataTable(tableConfig);
    });
}

//添加计划号流程编号选择禁用
function disabledProcessCode() {
    const selects = $('#planProcessCodeList .process-code-select');
    disabledProcessCodeCommon(selects);
}

//流程编号选择禁用
function disabledProcessCodeCommon(selects) {
    const ids = [];
    selects.find('option').prop('disabled', false);
    selects.each((i, item) => {
        const id = $(item).val();
        if (id) ids.push(id);
    });
    if (!ids.length) return;
    selects.find('option').each((i, item) => {
        const el = $(item);
        if (~ids.indexOf(el.val())) el.prop('disabled', true);
    });
}

let _planProcessCodeInfo = null;

//添加修改计划号模态框
function addEditPlanModel(callback) {
    _planProcessCodeInfo = {};
    myPromise(5040).then(data => {
        data.forEach(item => _planProcessCodeInfo[item.Id] = item);
        const temp = `<div class="temp form-group" style="border-bottom:1px solid #eee">
                        <div class="flexStyle form-group" style="justify-content:space-between">
                            <div class="flexStyle">
                                <label class="control-label text-nowrap no-margin">流程编号：</label>
                                <select class="form-control process-code-select" style="width:150px;margin-right:15px">${setOptions(data, 'Code')}</select>
                                <button class="btn btn-info btn-sm browse-btn" style="margin-right:15px">浏览</button>
                                <label class="control-label text-nowrap no-margin process-code-category">类型：</label>
                            </div>
                            <button class="btn btn-danger btn-sm del-btn"><i class="fa fa-minus"></i></button>
                        </div>
                        <div class="table-responsive mailbox-messages">
                            <table class="table table-hover table-striped process-table"></table>
                        </div>
                    </div>`;
        $('#planProcessCodeList').empty();
        $('#addPlanProcessList').off('click').on('click', function () {
            $('#planProcessCodeList').append(temp).find('.process-code-select:last').val('');
            disabledProcessCode();
            if ($('#planProcessCodeList .process-code-select:first option').length === $('#planProcessCodeList .temp').length) $(this).prop('disabled', true);
        });
        callback();
        $('#addPlanModel').modal('show');
    });
}

//添加修改计划号
function addUpPlan(isAdd) {
    const product = $('#addPlanName').val().trim();
    if (isStrEmptyOrUndefined(product)) return layer.msg('计划号不能为空');
    const remark = $('#addPlanRemark').val().trim();
    const list = {
        Product: product,
        Remark: remark
    }
    let opType;
    if (isAdd) {
        opType = 5062;
    } else {
        opType = 5061;
        list.Id = $('#addEditPlanBtn').val();
    }
    const trs = [];
    $('#planProcessCodeList .process-table').each((i, item) => trs.push(...Array.from(getDataTableRow(item))));
    list.ProductProcesses = trs.map(item => {
        const tr = $(item);
        const trInfo = tr.closest('table').DataTable().row(tr[0]).data();
        const processData = tr.find('.set-btn')[0].ProcessData || [];
        const infoObj = {
            ProcessRepeat: tr.find('.isRework').val() >> 0,
            ProcessNumber: tr.find('.processNumber').val(),
            ProcessData: JSON.stringify(processData)
        }
        if (trInfo.Id) {
            infoObj.Id = trInfo.Id;
        } else {
            infoObj.ProcessCodeId = trInfo.ProcessCodeId;
            infoObj.ProcessId = trInfo.ProcessId;
        }
        return infoObj;
    });
    myPromise(opType, [list]).then(() => {
        $('#addPlanModel').modal('hide');
        getPlanList();
    });
}

//添加计划号弹窗
function addPlanModel() {
    addEditPlanModel(() => {
        $('#addEditPlanTitle').text('添加计划号');
        $('#addPlanName').val('');
        $('#addPlanRemark').val('');
        $('#addPlanProcessList').click();
        $('#addEditPlanBtn').text('添加').val(0).off('click').on('click', addUpPlan.bind(null, true));
    });
}

//修改计划号弹窗
function showUpdatePlanModel() {
    const qId = $(this).val();
    myPromise(5060, { qId }, true).then(data => {
        const d = data[0];
        addEditPlanModel(() => {
            $('#addEditPlanTitle').text('修改计划号');
            $('#addPlanName').val(d.Product);
            $('#addPlanRemark').val(d.Remark);
            const productProcesses = d.ProductProcesses;
            const processCodeObj = {}
            productProcesses.forEach(item => {
                const processCodeId = item.ProcessCodeId;
                processCodeObj[processCodeId]
                    ? processCodeObj[processCodeId].push(item)
                    : processCodeObj[processCodeId] = [item];
            });
            for (let key in processCodeObj) {
                $('#addPlanProcessList').click();
                $('#planProcessCodeList .process-code-select:last').val(key);
                $('#planProcessCodeList .process-code-category:last').text(`类型：${_planProcessCodeInfo[key].Category}`);
                const tableConfig = _tablesConfig(false, processCodeObj[key]);
                const tableSet = _tableSet();
                tableConfig.columns = tableConfig.columns.concat([
                    { data: 'Process', title: '流程' },
                    { data: null, title: '可否返工', render: tableSet.isRework },
                    { data: 'ProcessNumber', title: '单台加工数量', render: tableSet.addInput.bind(null, 'processNumber', 'auto') },
                    { data: null, title: '工艺数据', render: tableSet.setBtn }
                ]);
                tableConfig.createdRow = (tr, d) => {
                    tr = $(tr);
                    tr.find('.isRework').val(d.ProcessRepeat >> 0);
                    tr.find('.set-btn')[0].ProcessData = JSON.parse(d.ProcessData);
                };
                $('#planProcessCodeList .process-table:last').DataTable(tableConfig);
            }
            disabledProcessCode();
            $('#addEditPlanBtn').text('修改').val(d.Id).off('click').on('click', addUpPlan.bind(null, false));
        });
    });
}

//删除计划号
function delPlan() {
    delTableRow(_planTrs, 5063, getPlanList);
}

//产能弹窗
function showCapacityModel() {
    $('#showCapacityModel').modal('show');
}

//添加产能类型弹窗
function showAddCapacityCategoryModel() {
    _planProcessCodeInfo = {};
    myPromise(5030).then(e => {
        e.forEach(item => _planProcessCodeInfo[item.Id] = item);
        const firstProcess = e[0];
        const trData = {
            ProcessId: firstProcess.Id,
            DeviceCategory: firstProcess.DeviceCategory
        }
        const tableConfig = _tablesConfig(false, [trData]);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'ProcessId', title: '流程', render: tableSet.addSelect.bind(null, setOptions(e, 'Process'), 'process') },
            { data: 'DeviceCategory', title: '设备类型' },
            { data: null, title: '设备类型', render: tableSet.setBtn },
            { data: null, title: '删除', render: tableSet.delBtn }
        ]);
        $('#addCapacityList').DataTable(tableConfig);
        $('#addCapacityListBtn').off('click').on('click', () => {
            addDataTableTr('#addCapacityList', trData);
        });
    });
    $('#showAddCapacityCategoryModel').modal('show');
}

//----------------------------------------工单管理----------------------------------------------------

let _workOrderTrs = null;

//获取工单列表
function getWorkOrderList() {
    myPromise(5070).then(data => {
        _workOrderTrs = [];
        const tableConfig = _tablesConfig(true, data);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'WorkOrder', title: '工单', render: tableSet.input.bind(null, 'workOrder') },
            { data: 'StateStr', title: '状态' },
            { data: 'DeliveryTime', title: '交货日期', render: tableSet.day.bind(null, 'deliveryTime') },
            { data: 'Target', title: '目标产量', render: tableSet.input.bind(null, 'target') },
            { data: 'DoneTarget', title: '已完成', sClass: 'text-green' },
            { data: 'Doing', title: '加工中', sClass: 'text-orange' },
            { data: 'Remark', title: '备注', render: tableSet.input.bind(null, 'remark') }
        ]);
        tableConfig.createdRow = tr => initDayTime(tr);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _workOrderTrs, (tr, d) => {
                tr.find('.workOrder').val(d.WorkOrder);
                tr.find('.deliveryTime').val(d.DeliveryTime.split(' ')[0]).datepicker('update');
                tr.find('.target').val(d.Target);
                tr.find('.remark').val(d.Remark);
            });
        }
        $('#workOrderList').DataTable(tableConfig);
    });
}

//工单列表tr数据获取
function getWorkOrderTrInfo(el, isAdd) {
    const workOrder = el.find('.workOrder').val().trim();
    if (isStrEmptyOrUndefined(workOrder)) return void layer.msg('工单不能为空');
    const deliveryTime = el.find('.deliveryTime').val().trim();
    if (isStrEmptyOrUndefined(deliveryTime)) return void layer.msg('请选择交货日期');
    const target = el.find('.target').val().trim();
    if (isStrEmptyOrUndefined(target)) return void layer.msg('目标产量不能为0');
    const list = {
        WorkOrder: workOrder,
        DeliveryTime: deliveryTime,
        Target: target,
        Remark: el.find('.remark').val()
    }
    isAdd || (list.Id = el.find('.isEnable').val() >> 0);
    return list;
}

//修改工单
function updateWorkOrder() {
    updateTableRow(_workOrderTrs, getWorkOrderTrInfo, 5071, getWorkOrderList);
}

//添加工单模态框
function addWorkOrderModel() {
    const trData = {
        WorkOrder: '',
        DeliveryTime: getDate(),
        Target: 0,
        Remark: ''
    }
    const tableConfig = _tablesConfig(false, [trData]);
    const tableSet = _tableSet();
    tableConfig.columns = tableConfig.columns.concat([
        { data: 'WorkOrder', title: '工单', render: tableSet.addInput.bind(null, 'workOrder', 'auto') },
        { data: 'DeliveryTime', title: '交货日期', render: tableSet.addDay.bind(null, 'deliveryTime') },
        { data: 'Target', title: '目标产量', render: tableSet.addInput.bind(null, 'target', 'auto') },
        { data: 'Remark', title: '备注', render: tableSet.addInput.bind(null, 'remark', '100%') },
        { data: null, title: '删除', render: tableSet.delBtn }
    ]);
    tableConfig.createdRow = tr => initDayTime(tr);
    $('#addWorkOrderList').DataTable(tableConfig);
    $('#addWorkOrderListBtn').off('click').on('click', () => addDataTableTr('#addWorkOrderList', trData));
    $('#addWorkOrderModel').modal('show');
}

//添加工单
function addWorkOrder() {
    addTableRow('#addWorkOrderList', getWorkOrderTrInfo, 5072, () => {
        $('#addWorkOrderModel').modal('hide');
        getWorkOrderList();
    });
}

//删除工单
function delWorkOrder() {
    delTableRow(_workOrderTrs, 5073, getWorkOrderList);
}

//----------------------------------------任务单管理----------------------------------------------------

let _taskOrderTrs = null;

//获取任务单列表
function getTaskOrderList() {
    const planFn = myPromise(5060);
    const workOrderFn = myPromise(5070);
    const taskOrderFn = myPromise(5090);
    Promise.all([planFn, workOrderFn, taskOrderFn]).then(result => {
        _taskOrderTrs = [];
        const tableConfig = _tablesConfig(true, result[2]);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'TaskOrder', title: '任务单', render: tableSet.input.bind(null, 'taskOrder') },
            { data: 'StateStr', title: '状态' },
            { data: 'Target', title: '目标产量', render: tableSet.input.bind(null, 'target') },
            { data: 'Done', title: '已完成', sClass: 'text-green' },
            { data: 'Doing', title: '加工中', sClass: 'text-orange' },
            { data: 'WorkOrder', title: '工单', render: tableSet.select.bind(null, setOptions(result[1], 'WorkOrder'), 'workOrder') },
            { data: 'Product', title: '计划号', render: tableSet.select.bind(null, setOptions(result[0], 'Product'), 'product') },
            { data: 'DeliveryTime', title: '交货日期', render: tableSet.day.bind(null, 'deliveryTime') },
            { data: 'Id', title: '详情', render: tableSet.detailBtn.bind(null, 'showTaskOrderDetailModal') },
            { data: 'Remark', title: '备注', render: tableSet.input.bind(null, 'remark') }
        ]);
        tableConfig.createdRow = tr => initDayTime(tr);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _taskOrderTrs, (tr, d) => {
                tr.find('.taskOrder').val(d.TaskOrder);
                tr.find('.target').val(d.Target);
                tr.find('.workOrder').val(d.WorkOrderId);
                tr.find('.product').val(d.ProductId);
                tr.find('.deliveryTime').val(d.DeliveryTime.split(' ')[0]).datepicker('update');
                tr.find('.remark').val(d.Remark);
            });
        }
        $('#taskOrderList').DataTable(tableConfig);
    });
}

//详情弹窗
function showTaskOrderDetailModal() {
    myPromise(5090).then(data => {
        const qId = $(this).val();
        $('#taskOrderSelect').html(setOptions(data, 'TaskOrder')).val(qId).trigger('change');
        $('#taskOrderDetailModel').modal('show');
    });
}

//任务单列表tr数据获取
function getTaskOrderTrInfo(el, isAdd) {
    const taskOrder = el.find('.taskOrder').val().trim();
    if (isStrEmptyOrUndefined(taskOrder)) return void layer.msg('任务单不能为空');
    const target = el.find('.target').val().trim().trim();
    if (isStrEmptyOrUndefined(target)) return void layer.msg('目标产量不能为0');
    const workOrder = el.find('.workOrder').val();
    if (isStrEmptyOrUndefined(workOrder)) return void layer.msg('请选择工单');
    const product = el.find('.product').val();
    if (isStrEmptyOrUndefined(product)) return void layer.msg('请选择计划号');
    const deliveryTime = el.find('.deliveryTime').val().trim();
    if (isStrEmptyOrUndefined(deliveryTime)) return void layer.msg('请选择交货日期');
    const list = {
        TaskOrder: taskOrder,
        Target: target,
        WorkOrderId: workOrder,
        ProductId: product,
        DeliveryTime: deliveryTime,
        Remark: el.find('.remark').val()
    }
    isAdd || (list.Id = el.find('.isEnable').val() >> 0);
    return list;
}

//修改任务单
function updateTaskOrder() {
    updateTableRow(_taskOrderTrs, getTaskOrderTrInfo, 5091, getTaskOrderList);
}

//添加任务单模态框
function addTaskOrderModel() {
    const planFn = myPromise(5060);
    const workOrderFn = myPromise(5070);
    Promise.all([planFn, workOrderFn]).then(result => {
        const firstWorkOrder = result[1][0];
        const trData = {
            TaskOrder: '',
            WorkOrderId: '',
            TargetWork: firstWorkOrder.Target,
            Left: firstWorkOrder.Left,
            Doing: firstWorkOrder.Doing,
            ProductId: '',
            Target: 0,
            DeliveryTime: firstWorkOrder.DeliveryTime.split(' ')[0],
            Remark: ''
        }
        const tableConfig = _tablesConfig(false, [trData]);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'TaskOrder', title: '任务单', render: tableSet.addInput.bind(null, 'taskOrder', 'auto') },
            { data: 'WorkOrderId', title: '工单', render: tableSet.addSelect.bind(null, setOptions(result[1], 'WorkOrder'), 'workOrder') },
            { data: 'TargetWork', title: '目标产量' },
            { data: 'Left', title: '未完成', sClass: 'text-red' },
            { data: 'Doing', title: '加工中', sClass: 'text-orange' },
            { data: 'ProductId', title: '计划号', render: tableSet.addSelect.bind(null, setOptions(result[0], 'Product'), 'product') },
            { data: 'Target', title: '目标产量', render: tableSet.addInput.bind(null, 'target', 'auto') },
            { data: 'DeliveryTime', title: '交货日期', render: tableSet.addDay.bind(null, 'deliveryTime') },
            { data: 'Remark', title: '备注', render: tableSet.addInput.bind(null, 'remark', '100%') },
            { data: null, title: '删除', render: tableSet.delBtn }
        ]);
        tableConfig.createdRow = tr => initDayTime(tr);
        $('#addTaskOrderList').DataTable(tableConfig);
        $('#addTaskOrderListBtn').off('click').on('click', () => addDataTableTr('#addTaskOrderList', trData));
        $('#addTaskOrderModel').modal('show');
    });
}

//添加任务单
function addTaskOrder() {
    addTableRow('#addTaskOrderList', getTaskOrderTrInfo, 5092, () => {
        $('#addTaskOrderModel').modal('hide');
        getTaskOrderList();
    });
}

//删除任务单
function delTaskOrder() {
    delTableRow(_taskOrderTrs, 5093, getTaskOrderList);
}

//----------------------------------------流程卡管理----------------------------------------------------

let _flowCardTrs = null;

//获取流程卡列表
function getFlowCardList() {
    let startTime = $('#sendCardSTime').val().trim();
    if (isStrEmptyOrUndefined(startTime)) return layer.msg('请选择发卡开始时间');
    let endTime = $('#sendCardETime').val().trim();
    if (isStrEmptyOrUndefined(endTime)) return layer.msg('请选择发卡结束时间');
    if (compareDate(startTime, endTime)) return layer.msg('结束时间不能小于开始时间');
    startTime += ' 00:00:00';
    endTime += ' 23:59:59';
    const taskOrderId = $('#flowCardTaskOrderSelect').val();
    if (isStrEmptyOrUndefined(taskOrderId)) return layer.msg('请选择任务单');
    const productId = $('#flowCardPlanSelect').val();
    if (isStrEmptyOrUndefined(productId)) return layer.msg('请选择计划号');
    myPromise(5110, { startTime, endTime, taskOrderId, productId }, true).then(data => {
        _flowCardTrs = [];
        const tableConfig = _tablesConfig(true, data);
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'CreateTime', title: '发卡时间' },
            { data: 'FlowCard', title: '流程卡' },
            { data: 'ProcessCode', title: '流程编号' },
            { data: 'TaskOrder', title: '任务单' },
            { data: 'Product', title: '计划号' },
            { data: 'Batch', title: '预计工时' },
            { data: 'Id', title: '流程详情', render: d => `<button class="btn btn-info btn-sm" onclick="showProcessFlowCardIdModal(${d})">查看</button>` },
            { data: 'Remark', title: '备注' }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _flowCardTrs);
        }
        $('#flowCardList').DataTable(tableConfig);
    });
}

//流程详情弹窗
function showProcessFlowCardIdModal(flowCardId) {
    myPromise(5150, { flowCardId }, true).then(data => {
        const tableConfig = _tablesConfig(false, data);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Process', title: '工序' },
            { data: 'Processor', title: '加工人' },
            { data: 'DeviceCode', title: '加工设备' },
            { data: null, title: '最后完成时间', render: tableSet.endFinishTime },
            { data: 'Progress', title: '进度', render: tableSet.progress },
            { data: 'Count', title: '加工次数' },
            { data: 'Before', title: '加工前数量' },
            { data: 'Left', title: '剩余数量' },
            { data: 'Qualified', title: '合格数' },
            { data: 'Unqualified', title: '不合格数' },
            { data: 'Before', title: '产量' }
        ]);
        $('#processFlowCardIdList').DataTable(tableConfig);
        $('#showProcessFlowCardIdModal').modal('show');
    });
}

//流程编号查看弹窗
function showProcessDetail(qId) {
    myPromise(5060, { qId }, true).then(e => {
        const d = e[0];
        const productProcesses = d.ProductProcesses;
        const processCodeObj = {}
        productProcesses.forEach(item => {
            const processCodeId = item.ProcessCodeId;
            processCodeObj[processCodeId]
                ? processCodeObj[processCodeId].push(item)
                : processCodeObj[processCodeId] = [item];
        });
        $('#processDetailCodeSelect').off('change').on('change', function () {
            const id = $(this).val();
            const tableConfig = _tablesConfig(false, processCodeObj[id]);
            const tableSet = _tableSet();
            tableConfig.columns = tableConfig.columns.concat([
                { data: 'Process', title: '流程' },
                { data: 'ProcessRepeat', title: '可否返工', render: tableSet.isReworkText },
                { data: 'ProcessNumber', title: '单台加工数量' },
                { data: null, title: '工艺数据', render: () => '<button class="btn btn-info btn-sm look-btn">查看</button>' }
            ]);
            tableConfig.createdRow = (tr, d) => $(tr).find('.look-btn')[0].ProcessData = JSON.parse(d.ProcessData);
            $('#processDetailList').DataTable(tableConfig);
        });
        $('#processDetailCodeSelect').html(getPlanToProcessCodeOps(d)).trigger('change');
        $('#showProcessDetailModal').modal('show');
    });
}

//计划号下流程编号选项
function getPlanToProcessCodeOps(d) {
    const processCodeArr = d.ProcessCodes ? d.ProcessCodes.split(',') : [];
    const processCodeIdArr = d.ProcessCodeIds ? d.ProcessCodeIds.split(',') : [];
    const processCodes = processCodeIdArr.map((item, i) => ({ Id: item, ProcessCode: processCodeArr[i] }));
    return setOptions(processCodes, 'ProcessCode');
}

//选择任务单
function selectTaskOrder(d) {
    const table = $('#addFlowCardProcessList');
    if (table.html()) {
        table.DataTable().destroy().clear();
        table.empty();
    }
    $('#addFlowCardWorkNum').val('');
    $('#addFlowCardCardNum').val('');
    $('#addFlowCardTarget').text(d.Target);
    $('#addFlowCardLeft').text(d.Left);
    $('#addFlowCardDoing').text(d.Doing);
    $('#addFlowCardIssue').text(d.Issue);
    $('#addFlowCardPlan').text(d.Product);
    $('#addFlowCardTime').text(d.DeliveryTime.split(' ')[0]);
    $('#processCodeLookBtn').val(d.ProductId);
    const planId = d.ProductId;
    myPromise(5060, { qId: planId }, true).then(e => $('#addFlowCardProcessCodeSelect').html(getPlanToProcessCodeOps(e[0])).trigger('change'));
}

//添加流程卡弹窗
function addFlowCardModel() {
    const taskOrderFn = myPromise(5090);
    const personFn = myPromise(5000);
    Promise.all([taskOrderFn, personFn]).then(result => {
        const taskOrder = result[0];
        $('#addFlowCardTaskOrderSelect').html(setOptions(taskOrder, 'TaskOrder'));
        $('#addFlowCardPersonSelect').html(setOptions(result[1], 'Account'));
        selectTaskOrder(taskOrder[0]);
    });
    $('#addFlowCardModel').modal('show');
}

//流程编号查看
function addFlowCardProcessCodeLook() {
    const planId = $(this).val();
    showProcessDetail(planId);
}

//预览
function addFlowCardPreview() {
    let number = $('#addFlowCardWorkNum').val() >> 0;
    if (isStrEmptyOrUndefined(number)) return layer.msg('请输入加工数量');
    const flag = $('#addFlowCardCardNum').val() >> 0;
    if (isStrEmptyOrUndefined(flag)) return layer.msg('请输入单卡数量');
    const processCodeId = $('#addFlowCardProcessCodeSelect').val();
    if (isStrEmptyOrUndefined(processCodeId)) return layer.msg('请选择流程编号');
    const processCode = $('#addFlowCardProcessCodeSelect :selected').text();
    const personId = $('#addFlowCardPersonSelect').val();
    if (isStrEmptyOrUndefined(personId)) return layer.msg('请选择加个人');
    const personOps = $('#addFlowCardPersonSelect').html();
    const data = [];
    do {
        data.push({
            FlowCard: '',
            Number: number >= flag ? flag : number,
            ProcessCode: processCode,
            PersonId: personId
        });
    } while ((number -= flag) > 0);
    const tableConfig = _tablesConfig(false, data);
    const tableSet = _tableSet();
    tableConfig.columns = tableConfig.columns.concat([
        { data: 'FlowCard', title: '流程卡号' },
        { data: 'Number', title: '加工数量', render: tableSet.addInput.bind(null, 'number', 'auto') },
        { data: 'ProcessCode', title: '流程编号', render: d => `<span codeid="${processCodeId}">${d}</span>` },
        { data: 'PersonId', title: '加工人', render: tableSet.addSelect.bind(null, personOps, 'person') }
    ]);
    tableConfig.createdRow = tr => $(tr).find('.person').val(personId);
    $('#addFlowCardProcessList').DataTable(tableConfig);
}

//生成
function addFlowCard() {
    if (!$('#addFlowCardProcessList').html()) return layer.msg('请预览之后再生成');
    const taskOrderId = $('#addFlowCardTaskOrderSelect').val();
    if (isStrEmptyOrUndefined(taskOrderId)) return layer.msg('请选择任务单');
    const personArr = [];
    const getFlowCardTrInfo = el => {
        const processorId = el.find('.person').val();
        if (isStrEmptyOrUndefined(processorId)) return layer.msg('请选择加个人');
        personArr.push(el.find('.person :selected').text());
        const number = el.find('.number').val().trim() >> 0;
        if (isStrEmptyOrUndefined(number)) return layer.msg('请输入加工数量');
        const list = {
            TaskOrderId: taskOrderId,
            ProcessCodeId: el.find('[codeid]').attr('codeid'),
            ProcessorId: processorId,
            Number: number,
            Remark: 'string'
        }
        return list;
    };
    const processCode = $('#addFlowCardProcessList [codeid]:first').text();
    addTableRow('#addFlowCardProcessList', getFlowCardTrInfo, 5112, data => {
        const arr = data.FlowCards.map((item, i) => ({ FlowCard: item.FlowCard, Number: item.Number, ProcessCode: processCode, PersonId: personArr[i] }));
        const tableConfig = _tablesConfig(false, arr);
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'FlowCard', title: '流程卡号' },
            { data: 'Number', title: '加工数量' },
            { data: 'ProcessCode', title: '流程编号' },
            { data: 'PersonId', title: '加工人' }
        ]);
        $('#addFlowCardProcessList').DataTable(tableConfig);
    });
}

//打印
function flowCardPrint() {
    const table = $('#addFlowCardProcessList');
    if (!(table.html() && !table.find('input').length)) return layer.msg('生成成功后才能打印');
    const thead = '<thead><tr><th>序号</th><th>流程卡号</th><th>加工数量</th><th>流程编号</th><th>加工人</th></tr></thead>';
    const tbodyTrs = Array.from(getDataTableRow('#addFlowCardProcessList')).reduce((a, b) => `${a}${$(b).prop('outerHTML')}`, '');
    const printTable = `<table border="1" style="width:100%;text-align:center;border-collapse:collapse">${thead}<tbody>${tbodyTrs}</tbody></table>`;
    printCode(printTable);
}

//删除流程卡
function delFlowCard() {
    delTableRow(_flowCardTrs, 5113, getFlowCardList);
}