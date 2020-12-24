function pageReady() {
    $('#sendCardSTime,#sendCardETime,#pmcChildSTime,#pmcChildETime,#pmcInStoreSTime,#pmcInStoreETime').val(getDate()).datepicker('update');
    getProductionLine();
    getNotArrangeTaskList();
    getArrangeTaskList();
    $('#personNavLi').one('click', getPersonList);
    $('#deviceNavLi').one('click', getDeviceList);
    $('#flowNavLi').one('click', getProcessCodeList);
    $('#processSetNavLi').one('click', getProcessOpList);
    $('#planNavLi').one('click', getPlanList);
    $('#workOrderNavLi').one('click', getWorkOrderList);
    $('#taskOrderNavLi').one('click', getTaskOrderList);
    $('#flowCardNavLi').one('click', () => {
        const taskOrderFn = myPromise(5090);
        const processCodeFn = myPromise(5040);
        const planFn = myPromise(5060);
        Promise.all([taskOrderFn, processCodeFn, planFn]).then(result => {
            const all = '<option value="0">所有</option>';
            $('#flowCardTaskOrderSelect').html(`${all}${setOptions(result[0].datas, 'TaskOrder')}`);
            $('#flowCardProcessCodeSelect').html(`${all}${setOptions(result[1].datas, 'Code')}`);
            $('#flowCardPlanSelect').html(`${all}${setOptions(result[2].datas, 'Product')}`);
            getFlowCardList();
        });
    });
    $('#pmcExpelProNavLi').one('click', () => {
        getNotArrangeTaskList();
        getArrangeTaskList();
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
    $('#addPlanCapacity').on('change', function () {
        const fn = data => {
            const tableConfig = _tablesConfig(false, data);
            const tableSet = _tableSet();
            tableConfig.columns = tableConfig.columns.concat([
                { data: 'Process', title: '流程' },
                { data: 'Category', title: '设备类型' },
                { data: null, title: '产能', render: d => `<button class="btn btn-info btn-sm capacity-btn" value="${d.Id}" process="${d.ProcessId}" p="${d.Process}">查看</button>` },
                { data: null, title: '合格率', render: tableSet.addInput.bind(null, 'rate', 'auto', 0) },
                { data: null, title: '工时', render: tableSet.hms }
            ]);
            $('#addPlanCapacityList').DataTable(tableConfig);
        }
        const capacityId = $(this).val();
        capacityId ? myPromise(5560, { capacityId }, true).then(e => fn(e.datas)) : fn([]);
    });
    $('#addPlanCapacityList').on('input', '.rate', function () {
        if (($(this).val() >> 0) > 100) $(this).val(100);
    });
    $('#addPlanCapacityList').on('input', '.minute,.second', function () {
        if (($(this).val() >> 0) > 59) $(this).val(59);
    });
    $('#addPlanProcess').on('change', function (e, callback) {
        const categoryId = $(this).val();
        const getCapacityFn = myPromise(5530, { categoryId, menu: true }, true);
        const getProcessCodeFn = myPromise(5040, { categoryId }, true);
        Promise.all([getCapacityFn, getProcessCodeFn]).then(result => {
            const processCode = result[1].datas;
            processCode.forEach(item => _planProcessCodeInfo[item.Id] = item);
            const temp = `<div class="temp form-group" style="border-bottom:1px solid #eee">
                            <div class="flexStyle form-group" style="justify-content:space-between;align-items:flex-start">
                                <div class="flexStyle" style="flex-wrap:wrap">
                                    <label class="control-label text-nowrap no-margin">流程编号：</label>
                                    <select class="form-control process-code-select" style="width:150px;margin-right:15px">${setOptions(processCode, 'Code')}</select>
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
            callback ? callback(result[0].datas) : $('#addPlanCapacity').html(setOptions(result[0].datas, 'Capacity')).trigger('change');
            $('#addPlanProcessList').prop('disabled', !processCode.length);
            $('#addPlanModel').modal('show');
        });
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
            { data: 'ProcessNumber', title: '单台加工数量', bVisible: false, render: tableSet.addInput.bind(null, 'processNumber', 'auto') },
            { data: null, title: '工艺数据', render: tableSet.setBtn }
        ]);
        $(this).closest('.temp').find('.process-table').DataTable(tableConfig);
        disabledProcessCode();
    });
    $('#planProcessCodeList').on('click', '.browse-btn', function () {
        myPromise(5040).then(data => {
            const tableConfig = _tablesConfig(false, data.datas, 0);
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
    $('#setCraftList,#planProcessCodeList,#addFlowCardProcessList,#addPlanCapacityList,#notArrangeTaskProcessBox').on('input', 'input', function () {
        onInput(this, 8, 0);
    });
    $('#setCraftList,#planProcessCodeList,#addFlowCardProcessList,#devCapacitySetList,#personCapacitySetList,#addPlanCapacityList,#notArrangeTaskProcessBox').on('focus', 'input', function () {
        if ($(this).val().trim() == 0) $(this).val('');
    });
    $('#setCraftList,#planProcessCodeList,#addFlowCardProcessList,#devCapacitySetList,#personCapacitySetList,#addPlanCapacityList,#notArrangeTaskProcessBox').on('blur', 'input', function () {
        if (isStrEmptyOrUndefined($(this).val().trim())) $(this).val(0);
    });
    $('#workOrderList,#addWorkOrderList,#taskOrderList,#addTaskOrderList').on('input', '.target', function () {
        onInput(this, 8, 0);
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
            const d = data.datas[0];
            $(this).closest('td').next().text(d.Target).next().text(d.Left).next().text(d.Doing).nextAll().find('.deliveryTime').val(d.DeliveryTime.split(' ')[0]).datepicker('update');
        });
    });
    $('#taskOrderSelect').on('change', function () {
        const qId = $(this).val();
        myPromise(5090, { qId }, true).then(data => {
            const d = data.datas[0];
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
        myPromise(5090, { qId }, true).then(e => selectTaskOrder(e.datas[0]));
    });
    $('#addFlowCardProcessCodeSelect').on('change', function () {
        const qId = $(this).val();
        if (qId) {
            myPromise(5040, { qId }, true).then(e => {
                const processData = e.datas[0];
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
            const tableConfig = _tablesConfig(false, data.datas);
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
                processWarningDangerTemp('warning', `报警工单（${e.datas.length}）`);
                $('#warningLineBox .refresh').on('click', warningLineBox);
                $('#warningLineBox table').DataTable(tableFn(e, '报警时间', '报警信息'));
            });
        }
        const dangerLineBox = () => {
            myPromise(5205, { workOrderId: qId }, true).then(e => {
                processWarningDangerTemp('danger', `中断工单（${e.datas.length}）`);
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
                e = e.datas;
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
                e = e.datas;
                processWarningDangerTemp('warning', `报警工单（${e.length}）`);
                $('#warningLineBox .refresh').on('click', warningLineBox);
                $('#warningLineBox table').DataTable(tableFn(e, '报警时间', '报警信息'));
            });
        }
        const dangerLineBox = () => {
            myPromise(5255, { taskOrderId: qId }, true).then(e => {
                e = e.datas;
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
                e = e.datas;
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
                e = e.datas;
                processWarningDangerTemp('warning', `报警工单（${e.length}）`);
                $('#warningLineBox .refresh').on('click', warningLineBox);
                $('#warningLineBox table').DataTable(tableFn(e, '报警时间', '报警信息'));
            });
        }
        const dangerLineBox = () => {
            myPromise(5305, { flowCardId: qId }, true).then(e => {
                e = e.datas;
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
            const tableConfig = _tablesConfig(false, data.datas);
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
    $('#pmcPersonQueryMode').on('change', function () {
        const v = $(this).val();
        const fn = ops => {
            $('#pmcPersonQuerySelect').html(ops).removeClass('hidden');
            $('#pmcPersonQueryInput').addClass('hidden');
        };
        switch (v) {
            case 'state':
                fn(_tableSet().stateOps);
                break;
            case 'levelId':
                myPromise(5510, { menu: true }, true, 0).then(e => fn(setOptions(e.datas, 'Level')));
                break;
            case 'processId':
                myPromise(5030, { menu: true }, true, 0).then(e => fn(setOptions(e.datas, 'Process')));
                break;
            default:
                $('#pmcPersonQueryInput').val('').removeClass('hidden');
                $('#pmcPersonQuerySelect').addClass('hidden');
        }
    });
    $('#pmcGradeList,#addPmcGradeList').on('input', '.order', function () {
        onInput(this, 8, 0);
    });
    $('#addPmcPersonList').on('change', '.name', disabledPmcPerson);
    $('#addPmcPersonList').on('click', '.del-btn', function () {
        delDataTableTr.call(this);
        disabledPmcPerson();
        $('#addPmcPersonListBtn').prop('disabled', false);
    });
    $('#addDeviceList,#deviceList').on('change', '.category', function () {
        const categoryId = $(this).val();
        const tr = $(this).closest('tr');
        myPromise(5024, { categoryId, menu: true }, true, 0).then(e => tr.find('.model').html(setOptions(e.datas, 'Model')));
    });
    $('#addCapacityProcess,#updateCapacityProcess').on('change', function () {
        const categoryId = $(this).val();
        myPromise(5560, { categoryId }, true).then(e => {
            const tableConfig = _tablesConfig(false, e.datas);
            const tableSet = _tableSet();
            tableConfig.columns = tableConfig.columns.concat([
                { data: 'Process', title: '流程' },
                { data: 'Category', title: '设备类型' },
                { data: null, title: '产能', render: d => `<button class="btn btn-primary btn-sm set-btn" value="${d.ProcessId}" p="${d.Process}">设置</button>` },
                { data: null, title: '是否设置', render: tableSet.isFinish }
            ]);
            const table = $(this).attr('table');
            $(table).DataTable(tableConfig);
        });
    });
    $('#addCapacityList,#updateCapacityList').on('click', '.set-btn', function () {
        showCapacitySetModal.call(this);
        $('#addCapacitySetBtn').removeClass('hidden');
    });
    $('#devCapacitySetList,#personCapacitySetList').on('input', '.single', function () {
        onInput(this, 8, 0);
        const tr = $(this).closest('tr');
        const single = $(this).val() >> 0;
        const sCount = tr.find('.sCount').val() >> 0;
        const count = tr.find('.count').text() >> 0;
        const number = single * sCount;
        tr.find('.number').text(number);
        tr.find('.total').text(count * number);
    });
    $('#devCapacitySetList,#personCapacitySetList').on('input', '.sCount', function () {
        onInput(this, 8, 0);
        const tr = $(this).closest('tr');
        const single = tr.find('.single').val() >> 0;
        const sCount = $(this).val() >> 0;
        const count = tr.find('.count').text() >> 0;
        const number = single * sCount;
        tr.find('.number').text(number);
        tr.find('.total').text(count * number);
    });
    //$('#devCapacitySetList,#personCapacitySetList').on('input', '.number', function () {
    //    onInput(this, 8, 0);
    //    const tr = $(this).closest('tr');
    //    const count = tr.find('.count').text() >> 0;
    //    const number = $(this).val() >> 0;
    //    tr.find('.total').text(count * number);
    //});
    $('#capacityList').on('click', '.look-btn', function () {
        showCapacityDetailModal.call(this);
    });
    $('#capacityDetailList').on('click', '.capacity-btn', function () {
        let prop = 'qId', val = $(this).val();
        if (!val || val == 0) {
            prop = 'processId';
            val = $(this).attr('process');
        }

        var process = $(this).attr("p");
        const t = {};
        t[prop] = val;
        //myPromise(5564, { [prop]: val }, true).then(e => {
        myPromise(5564, t, true).then(e => {
            e.Process = process;
            devicesOperatorsTable(e, true);
        });
        $('#addCapacitySetBtn').addClass('hidden');
    });
    $('#addPlanCapacityList').on('click', '.capacity-btn', function () {
        let prop = 'qId', val = $(this).attr('list');
        if (!val || val == 0) {
            prop = 'processId';
            val = $(this).attr('process');
        }

        var process = $(this).attr("p");
        const t = {};
        t[prop] = val;
        //myPromise(5564, { [prop]: val }, true).then(e => {
        myPromise(5564, t, true).then(e => {
            e.Process = process;
            devicesOperatorsTable(e, true);
        });
        $('#addCapacitySetBtn').addClass('hidden');
    });
    $('#capacityList').on('click', '.update-btn', function () {
        showUpdateCapacityModal.call(this);
    });
    $('#addProcessCodeCategoryName').on('change', function () {
        const categoryId = $(this).val();
        $('#addProcessCodeBody').empty();
        myPromise(5056, { CategoryId: categoryId }, true).then(e => {
            const tableConfig = _tablesConfig(false, e.datas);
            const tableSet = _tableSet();
            tableConfig.columns.unshift({ data: null, title: '', render: tableSet.addBtn.bind(null, 'addProcessOpToCode'), orderable: false, sWidth: '80px' });
            tableConfig.columns = tableConfig.columns.concat([
                { data: 'Process', title: '流程' },
                { data: 'Remark', title: '备注' }
            ]);
            $('#addProcessCodeOpList').DataTable(tableConfig);
        });
    });
    $('#notArrangeTaskList').on('click', '.del-btn', function () {
        const tr = $(this).closest('tr');
        tr.find('.taskOrder option').prop('disabled', false);
        const taskOrderId = tr.find('.taskOrder').val();
        if (!isStrEmptyOrUndefined(taskOrderId)) {
            delete _pmcPreviewParams[taskOrderId];
        }
        delDataTableTr.call(this);
        disabledPmcTask();
        $('#addNotArrangeTaskListBtn').prop('disabled', false);
    });
}

//异步获取数据
function myPromise(opType, opData, isParGet = false, isLoad = 1, func = undefined) {
    const data = { opType };
    opData && (data.opData = JSON.stringify(opData));
    isParGet && (opData = !opData);
    return new Promise(resolve => {
        ajaxPost('/Relay/Post', data, ret => {
            if (opData) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    if (func != undefined)
                        func();
                    resolve(ret);
                }
            } else {
                if (ret.errno != 0) {
                    var t = "";
                    if (ret.datas) {
                        t = ret.datas.join();
                        t += ",";
                    }
                    return layer.msg(t + ret.errmsg);
                }
                if (func != undefined)
                    func();
                resolve(ret);
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
        ],
        //表头固定
        //fixedHeader: true,
        //scrollX: "500px",
        //scrollY: "400px",
        //scrollCollapse: true,
        ////固定首列，需要引入相应 dataTables.fixedColumns.min.js
        //fixedColumns: {
        //    leftColumns: 2
        //}
    };
    isList && obj.columns.unshift({ data: null, title: '', render: _tableSet().isEnable, orderable: false, sWidth: '80px' });
    return obj;
}
//----------------------------------------生产线----------------------------------------------------

//排程弹窗
function showScheduleModal() {
    myPromise(5401).then(data => {
        const tableConfig = _tablesConfig(false, data.datas);
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
        const tableConfig = _tablesConfig(false, data.datas, 0);
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
        const d = warningDangerCount(data.datas, 'WorkOrder');
        warningDangerTemp('warning', `报警工单（${d.count}）`, '<th>工单</th><th>报警次数</th>', d.tbody, 'workWarningList');
    });
}

//中断工单
function workDangerList() {
    myPromise(5203).then(data => {
        const d = warningDangerCount(data.datas, 'WorkOrder');
        warningDangerTemp('danger', `中断工单（${d.count}）`, '<th>工单</th><th>中断次数</th>', d.tbody, 'workDangerList');
    });
}

//报警任务单
function taskWarningList() {
    myPromise(5252).then(data => {
        const d = warningDangerCount(data.datas, 'TaskOrder');
        warningDangerTemp('warning', `报警任务单（${d.count}）`, '<th>任务单</th><th>报警次数</th>', d.tbody, 'taskWarningList');
    });
}

//中断任务单
function taskDangerList() {
    myPromise(5253).then(data => {
        const d = warningDangerCount(data.datas, 'TaskOrder');
        warningDangerTemp('danger', `中断任务单（${d.count}）`, '<th>任务单</th><th>中断次数</th>', d.tbody, 'taskDangerList');
    });
}

//报警流程卡
function flowWarningList() {
    myPromise(5302).then(data => {
        const d = warningDangerCount(data.datas, 'FlowCard');
        warningDangerTemp('warning', `报警流程卡（${d.count}）`, '<th>流程卡</th><th>报警次数</th>', d.tbody, 'flowWarningList');
    });
}

//中断流程卡
function flowDangerList() {
    myPromise(5303).then(data => {
        const d = warningDangerCount(data.datas, 'FlowCard');
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
            const temp = data.datas.reduce((a, b) => `${a}<div style="width:100%;position: relative;overflow-x:scroll;height:133px"><div class="line">
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
        e = e.datas;
        const one = '<tr class="text-bold"><td>工单</td><td class="text-blue">交货数量</td><td class="text-red">交货日期</td><td>任务单数量</td><td>已完成任务单数量</td><td class="text-info">已完成</td><td class="text-green">已交货</td><td class="text-orange">未完成</td><td>已耗时</td><td>按时率</td><td>风险等级</td></tr>';
        const d = e[0];
        const two = `<tr><td>${d.WorkOrder}</td><td>${d.Target}</td><td>${d.DeliveryTime.split(' ')[0]}</td><td>${d.IssueCount}</td><td>${d.DoneCount}</td><td>${d.Done}</td><td>${d.Delivery}</td><td>${d.Left}</td><td>${codeTime(d.Consume)}</td><td>${d.OnTimeRate}%</td><td>${d.RiskLevelStr}</td></tr>`;
        $('#productionLineHead').html(`${one}${two}`);
    });
}

//获取任务单生产线信息
function getTaskLine(qId) {
    myPromise(5090, { qId }, true, 0).then(e => {
        e = e.datas;
        const one = '<tr class="text-bold"><td>任务单</td><td>计划号</td><td class="text-blue">交货数量</td><td class="text-red">交货日期</td><td>已发流程卡</td><td>以完成流程卡</td><td class="text-info">已完成</td><td class="text-green">已交货</td><td class="text-orange">未完成</td><td>已耗时</td><td>按时率</td><td>风险等级</td></tr>';
        const d = e[0];
        const two = `<tr><td>${d.TaskOrder}</td><td>${d.Product}</td><td>${d.Target}</td><td>${d.DeliveryTime.split(' ')[0]}</td><td>${d.IssueCount}</td><td>${d.DoneCount}</td><td>${d.Done}</td><td>${d.Delivery}</td><td>${d.Left}</td><td>${codeTime(d.Consume)}</td><td>${d.OnTimeRate}%</td><td>${d.RiskLevelStr}</td></tr>`;
        $('#productionLineHead').html(`${one}${two}`);
    });
}

//获取流程卡生产线信息
function getFlowCardLine(qId) {
    myPromise(5110, { qId }, true, 0).then(e => {
        e = e.datas;
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
        const tableConfig = _tablesConfig(true, data.datas);
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
//----------------------------------------设备列表----------------------------------------------------
let _deviceTrs = null;

//获取设备列表
function getDeviceList() {
    const deviceTypeFn = myPromise(5020);
    const deviceFn = myPromise(5010);
    Promise.all([deviceTypeFn, deviceFn]).then(result => {
        _deviceTrs = [];
        const tableConfig = _tablesConfig(true, result[1].datas);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'StateStr', title: '状态', render: tableSet.select.bind(null, tableSet.DevStateOps, 'state') },
            { data: 'Code', title: '机台号', render: tableSet.input.bind(null, 'code') },
            { data: 'Category', title: '类型', render: tableSet.select.bind(null, setOptions(result[0].datas, 'Category'), 'category') },
            { data: 'Model', title: '型号', render: tableSet.select.bind(null, '', 'model') },
            { data: 'Priority', title: '优先级', render: tableSet.input.bind(null, 'priority') },
            { data: 'Remark', title: '备注', render: tableSet.input.bind(null, 'remark') }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _deviceTrs, (tr, d) => {
                tr.find('.state').val(d.State);
                tr.find('.code').val(d.Code);
                tr.find('.category').val(d.CategoryId);
                myPromise(5024, { categoryId: d.CategoryId, menu: true }, true, 0).then(e => tr.find('.model').html(setOptions(e.datas, 'Model')).val(d.ModelId));
                tr.find('.priority').val(d.Priority);
                tr.find('.remark').val(d.Remark);
            });
        }
        $('#deviceList').DataTable(tableConfig);
    });
}

//设备列表tr数据获取
function getDeviceTrInfo(el, isAdd) {
    const code = el.find('.code').val().trim();
    if (isStrEmptyOrUndefined(code)) return void layer.msg('机台号不能为空');
    const category = el.find('.category').val();
    if (isStrEmptyOrUndefined(category)) return void layer.msg('请选择设备类型');
    const model = el.find('.model').val();
    if (isStrEmptyOrUndefined(model)) return void layer.msg('请选择设备型号');
    const list = {
        Code: code,
        CategoryId: category,
        ModelId: model,
        Priority: el.find('.priority').val() >> 0,
        Remark: el.find('.remark').val(),
        State: isAdd ? 1 : el.find('.state').val()
    }
    isAdd || (list.Id = el.find('.isEnable').val() >> 0);
    return list;
}

//修改设备
function updateDevice() {
    updateTableRow(_deviceTrs, getDeviceTrInfo, 5011, getDeviceList);
}

//添加设备模态框
function showAddDeviceModel() {
    let category;
    myPromise(5020).then(e => {
        category = e.datas;
        return myPromise(5024, { categoryId: category.Id, menu: true }, true, 0);
    }).then(e => {
        const trData = {
            Code: '',
            Category: '',
            Model: '',
            Priority: 0,
            Remark: ''
        };
        const tableConfig = _tablesConfig(false, [trData]);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Code', title: '机台号', render: tableSet.addInput.bind(null, 'code', 'auto') },
            { data: 'Category', title: '设备类型', render: tableSet.addSelect.bind(null, setOptions(category, 'Category'), 'category') },
            { data: 'Model', title: '设备型号', render: tableSet.addSelect.bind(null, setOptions(e.datas, 'Model'), 'model') },
            { data: 'Priority', title: '优先级', render: tableSet.addInput.bind(null, 'priority', 'auto') },
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

//----------------------------------------设备类型----------------------------------------------------
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
        const tableConfig = _tablesConfig(true, data.datas);
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

//----------------------------------------设备型号----------------------------------------------------
//设备型号弹窗
function showDeviceModelModal() {
    getDeviceModelList();
    $('#showDeviceModelModal').modal('show');
}

let _deviceModelTrs = null;

//获取设备型号列表
function getDeviceModelList() {
    const getCategoryFn = myPromise(5020, { menu: true }, true);
    const getModelFn = myPromise(5024);
    Promise.all([getCategoryFn, getModelFn]).then(data => {
        _deviceModelTrs = [];
        const tableConfig = _tablesConfig(true, data[1].datas);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Category', title: '类型', render: tableSet.select.bind(null, setOptions(data[0].datas, 'Category'), 'category') },
            { data: 'Model', title: '型号', render: tableSet.input.bind(null, 'model') },
            { data: 'Remark', title: '备注', render: tableSet.input.bind(null, 'remark') }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _deviceModelTrs, (tr, d) => {
                tr.find('.category').val(d.CategoryId);
                tr.find('.model').val(d.Model);
                tr.find('.remark').val(d.Remark);
            });
        }
        $('#deviceModelList').DataTable(tableConfig);
    });
}

//设备型号列表tr数据获取
function getDeviceModelTrInfo(el, isAdd) {
    const category = el.find('.category').val();
    if (isStrEmptyOrUndefined(category)) return void layer.msg('请选择设备类型');
    const model = el.find('.model').val().trim();
    if (isStrEmptyOrUndefined(model)) return void layer.msg('设备型号不能为空');
    const list = {
        CategoryId: category,
        Model: model,
        Remark: el.find('.remark').val()
    }
    isAdd || (list.Id = el.find('.isEnable').val() >> 0);
    return list;
}

//修改设备型号
function updateDeviceModel() {
    updateTableRow(_deviceModelTrs, getDeviceModelTrInfo, 5025, () => {
        getDeviceModelList();
        getDeviceList();
    });
}

//添加设备型号模态框
function addDeviceModelModel() {
    myPromise(5020).then(e => {
        const trData = {
            Category: '',
            Model: '',
            Remark: ''
        }
        const tableConfig = _tablesConfig(false, [trData]);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Category', title: '类型', render: tableSet.addSelect.bind(null, setOptions(e.datas, 'Category'), 'category') },
            { data: 'Model', title: '型号', render: tableSet.addInput.bind(null, 'model', 'auto') },
            { data: 'Remark', title: '备注', render: tableSet.addInput.bind(null, 'remark', '100%') },
            { data: null, title: '删除', render: tableSet.delBtn }
        ]);
        $('#addDeviceModelList').DataTable(tableConfig);
        $('#addDeviceModelListBtn').off('click').on('click', () => addDataTableTr('#addDeviceModelList', trData));
        $('#addDeviceModelModel').modal('show');
    });
}

//添加设备型号
function addDeviceModel() {
    addTableRow('#addDeviceModelList', getDeviceModelTrInfo, 5026, () => {
        $('#addDeviceModelModel').modal('hide');
        getDeviceModelList();
        getDeviceList();
    });
}

//删除设备类型
function delDeviceModel() {
    delTableRow(_deviceModelTrs, 5027, () => {
        getDeviceModelList();
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
        const tableConfig = _tablesConfig(true, data.datas);
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
    myPromise(5050).then(e => {
        e = e.datas;
        $('#addProcessCodeCategoryName').html(setOptions(e, 'Category'));
        callback();
        $('#addProcessCodeModel').modal('show');
        return myPromise(5056, { CategoryId: e[0].Id }, true);
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
    //const processCodeTr = `<tr list="${d.Id}">
    //                         <td class="num"></td>
    //                         <td>${d.Process}</td>
    //                         <td><span class="glyphicon glyphicon-arrow-up pointer text-green upTr" aria-hidden="true" title="上移"></span></td>
    //                         <td><button class="btn btn-danger btn-xs delBtn"><i class="fa fa-minus"></i></button></td>
    //                       </tr>`;
    const processCodeTr = `<tr list="${d.Id}">
                             <td class="num"></td>
                             <td>${d.Process}</td>
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
        //i ? tr.find('.upTr').removeClass('hidden') : tr.find('.upTr').addClass('hidden');
    }
}

//添加流程编号模态框
function addProcessCodeModel() {
    addEditProcessCodeModel(() => {
        $('#addProcessCodeName,#addProcessCodeRemark').val('');
        $('#addProcessCodeCategoryName').trigger('change');
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
        $('#addProcessCodeCategoryName ').val(d.CategoryId).trigger('change');
        $('#addProcessCodeRemark').val(d.Remark);
        const listId = d.List ? d.List.split(',') : [];
        const processes = d.Processes ? d.Processes.split(',') : [];
        //const trs = listId.reduce((a, b, i) => `${a}<tr list="${b}">
        //                     <td class="num"></td>
        //                     <td>${processes[i]}</td>
        //                     <td><span class="glyphicon glyphicon-arrow-up pointer text-green upTr" aria-hidden="true" title="上移"></span></td>
        //                     <td><button class="btn btn-danger btn-xs delBtn"><i class="fa fa-minus"></i></button></td>
        //                   </tr>`, '');
        const trs = listId.reduce((a, b, i) => `${a}<tr list="${b}">
                             <td class="num"></td>
                             <td>${processes[i]}</td>
                             <td><button class="btn btn-danger btn-xs delBtn"><i class="fa fa-minus"></i></button></td>
                           </tr>`, '');
        $('#addProcessCodeBody').html(trs);
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
        const tableConfig = _tablesConfig(true, data.datas);
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
        const tableConfig = _tablesConfig(false, e.datas);
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
            //const trs = data.datas.reduce((a, b) => `${a}<tr list="${b.ProcessId}" processid="${b.Id}">
            //                 <td class="num"></td>
            //                 <td>${b.Process}</td>
            //                 <td><span class="glyphicon glyphicon-arrow-up pointer text-green upTr" aria-hidden="true" title="上移"></span></td>
            //                 <td><button class="btn btn-danger btn-xs delBtn"><i class="fa fa-minus"></i></button></td>
            //               </tr>`, '');
            const trs = data.datas.reduce((a, b) => `${a}<tr list="${b.ProcessId}" processid="${b.Id}">
                             <td class="num"></td>
                             <td>${b.Process}</td>
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
        const tableConfig = _tablesConfig(true, result[1].datas);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Process', title: '流程', render: tableSet.input.bind(null, 'process') },
            { data: 'DeviceCategory', title: '设备类型', render: tableSet.select.bind(null, setOptions(result[0].datas, 'Category'), 'category') },
            { data: 'Order', title: '顺序', render: tableSet.input.bind(null, 'order') },
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
        Order: el.find('.order').val() >> 0,
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
            Order: '',
            Remark: ''
        }
        e.datas.unshift({
            Category: "无",
            Id: 0
        });
        const tableConfig = _tablesConfig(false, [trData]);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Process', title: '流程', render: tableSet.addInput.bind(null, 'process', 'auto') },
            { data: 'DeviceCategory', title: '设备类型', render: tableSet.addSelect.bind(null, setOptions(e.datas, 'Category'), 'category') },
            { data: 'Remark', title: '备注', render: tableSet.addInput.bind(null, 'remark', '100%') },
            { data: 'Order', title: '顺序', render: tableSet.addInput.bind(null, 'order', 'auto') },
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
        const tableConfig = _tablesConfig(true, data.datas);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Product', title: '计划号' },
            { data: 'Number', title: '日产能' },
            { data: 'Category', title: '流程编号类型' },
            { data: 'Capacity', title: '产能类型' },
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
function addEditPlanModel(callback, codeId) {
    _planProcessCodeInfo = {};
    myPromise(5050, { menu: true }, true).then(e => $('#addPlanProcess').html(setOptions(e.datas, 'Category')).val(codeId || e.datas[0].Id).trigger('change', callback));
}

//添加修改计划号
function addUpPlan(isAdd) {
    const categoryId = $('#addPlanProcess').val() >> 0
    if (isStrEmptyOrUndefined(categoryId)) return layer.msg('请选择流程编号类型');
    const capacityId = $('#addPlanCapacity').val() >> 0;
    if (isStrEmptyOrUndefined(capacityId)) return layer.msg('请选择产能类型');
    const product = $('#addPlanName').val().trim();
    if (isStrEmptyOrUndefined(product)) return layer.msg('计划号不能为空');
    const remark = $('#addPlanRemark').val().trim();
    const list = {
        CategoryId: categoryId,
        CapacityId: capacityId,
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
    //产能清单
    const productCapacities = [];
    let trs = getDataTableRow('#addPlanCapacityList');
    for (let i = 0, len = trs.length; i < len; i++) {
        const tr = $(trs[i]);
        const rate = tr.find('.rate').val().trim() >> 0;
        if (isStrEmptyOrUndefined(rate)) return layer.msg('请输入合格率');
        const hour = tr.find('.hour').val().trim() >> 0;
        const minute = tr.find('.minute').val().trim() >> 0;
        const second = tr.find('.second').val().trim() >> 0;
        if (isStrEmptyOrUndefined(hour) && isStrEmptyOrUndefined(minute) && isStrEmptyOrUndefined(second)) return layer.msg('请输入工时');
        const o = {
            Rate: rate,
            Day: 0,
            Hour: hour,
            Min: minute,
            Sec: second
        }
        const capacityBtn = tr.find('.capacity-btn');
        const updateId = capacityBtn.val();
        const listId = capacityBtn.attr('list') >> 0;
        if (isStrEmptyOrUndefined(listId)) return layer.msg('请先配置工序产能');
        !isAdd && updateId != 0 ? (o.Id = updateId) : (o.ProcessId = capacityBtn.attr('process'));
        productCapacities[i] = o;
    }
    list.ProductCapacities = productCapacities;
    //流程编号清单
    trs = [];
    $('#planProcessCodeList .process-table').each((i, item) => {
        Array.from(getDataTableRow(item)).forEach(d => trs.push(d));
        //trs.push(...Array.from(getDataTableRow(item))))
    });
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
    addEditPlanModel(capacityData => {
        $('#addPlanCapacity').html(setOptions(capacityData, 'Capacity')).trigger('change');
        $('#addEditPlanTitle').text('添加计划号');
        $('#addPlanName,#addPlanRemark').val('');
        $('#addEditPlanBtn').text('添加').val(0).off('click').on('click', addUpPlan.bind(null, true));
    });
}

//修改计划号弹窗
function showUpdatePlanModel() {
    const qId = $(this).val();
    myPromise(5060, { qId }, true).then(data => {
        const d = data.datas[0];
        addEditPlanModel(capacityData => {
            $('#addPlanCapacity').html(setOptions(capacityData, 'Capacity')).val(d.CapacityId);
            $('#addEditPlanTitle').text('修改计划号');
            $('#addPlanName').val(d.Product);
            $('#addPlanRemark').val(d.Remark);
            //产能清单
            const productCapacities = d.ProductCapacities;
            const tableConfig = _tablesConfig(false, productCapacities);
            const tableSet = _tableSet();
            tableConfig.columns = tableConfig.columns.concat([
                { data: 'Process', title: '流程' },
                { data: 'Category', title: '设备类型' },
                { data: null, title: '产能', render: d => `<button class="btn btn-info btn-sm capacity-btn" value="${d.Id}" list="${d.ListId}" process="${d.ProcessId}" pid="${d.PId}" p="${d.Process}">查看</button>` },
                { data: 'Rate', title: '合格率', render: tableSet.addInput.bind(null, 'rate', 'auto') },
                { data: null, title: '工时', render: tableSet.hms }
            ]);
            $('#addPlanCapacityList').DataTable(tableConfig);
            //流程编号清单
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
                    { data: 'ProcessNumber', title: '单台加工数量', bVisible: false, render: tableSet.addInput.bind(null, 'processNumber', 'auto') },
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
        }, d.CategoryId);
    });
}

//删除计划号
function delPlan() {
    delTableRow(_planTrs, 5063, getPlanList);
}

//----------------------------------------产能管理----------------------------------------------------

let _capacityTrs = null;
//产能类型弹窗
function showCapacityModel() {
    getCapacityList();
    $('#showCapacityModel').modal('show');
}

//获取产能类型列表
function getCapacityList() {
    myPromise(5530).then(e => {
        _capacityTrs = [];
        const tableConfig = _tablesConfig(true, e.datas);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Capacity', title: '类型', render: tableSet.input.bind(null, 'capacity') },
            { data: 'Category', title: '流程编号类型' },
            //{ data: 'Number', title: '日产能' },
            { data: null, title: '产能清单', render: d => `<button class="btn btn-info btn-sm look-btn look-update-btn" value="${d.Id}" categoryid="${d.CategoryId}" category="${d.Category}">查看</button>` },
            { data: 'Remark', title: '备注', render: tableSet.input.bind(null, 'remark') }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _capacityTrs, (tr, d) => {
                tr.find('.capacity').val(d.Capacity);
                tr.find('.look-update-btn').addClass('update-btn btn-success').removeClass('btn-info look-btn').text('修改');
                tr.find('.remark').val(d.Remark);
            }, tr => {
                tr.find('.look-update-btn').removeClass('update-btn btn-success').addClass('btn-info look-btn').text('查看');
            });
        }
        $('#capacityList').DataTable(tableConfig);
    });
}

//修改产能类型
function updateCapacity() {
    const fn = el => {
        const capacity = el.find('.capacity').val().trim();
        if (isStrEmptyOrUndefined(capacity)) return void layer.msg('产能类型不能为空');
        return {
            Capacity: capacity,
            Remark: el.find('.remark').val(),
            Id: el.find('.isEnable').val() >> 0
        }
    };
    updateTableRow(_capacityTrs, fn, 5531, getCapacityList);
}

//添加产能类型弹窗
function showAddCapacityCategoryModel() {
    $('#addCapacityCategory,#addCapacityRemark').val('');
    myPromise(5050).then(e => {
        $('#addCapacityProcess').html(setOptions(e.datas, 'Category')).trigger('change');
        $('#showAddCapacityCategoryModel').modal('show');
    });
}

//设备&人员产能表格设置
function devicesOperatorsTable(d, isLook = false) {
    const process = d.Process;
    var t = `产能${(isLook ? "查看" : "设置")}-${process}`;
    $('#showCapacitySetModal').find('.modal-title').text(t);
    const devices = d.Devices;
    const tableSet = _tableSet();
    const devTableConfig = _tablesConfig(false, devices);
    devTableConfig.columns = devTableConfig.columns.concat([
        { data: 'Category', title: '设备类型' },
        { data: 'Model', title: '设备型号' },
        { data: 'Count', title: '设备数量', sClass: 'count' },
        { data: 'Single', title: '单次数量', render: isLook ? d => d : tableSet.addInput.bind(null, 'single', 'auto') },
        { data: 'SingleCount', title: '日加工次数', render: isLook ? d => d : tableSet.addInput.bind(null, 'sCount', 'auto') },
        { data: 'Number', title: '单台日产能', sClass: 'number' },
        //{ data: 'Number', title: '单台日产能', render: isLook ? d => d : tableSet.addInput.bind(null, 'number', 'auto') },
        { data: 'Total', title: '日总产能', sClass: 'total' }
    ]);
    $('#devCapacitySetList').DataTable(devTableConfig);
    devices.length ? $('#devCapacitySetBox').removeClass('hidden') : $('#devCapacitySetBox').addClass('hidden');
    const operators = d.Operators;
    const perTableConfig = _tablesConfig(false, operators);
    perTableConfig.columns = perTableConfig.columns.concat([
        { data: 'Level', title: '等级' },
        { data: 'Count', title: '员工数量', sClass: 'count' },
        { data: 'Single', title: '单次数量', render: isLook ? d => d : tableSet.addInput.bind(null, 'single', 'auto') },
        { data: 'SingleCount', title: '日加工次数', render: isLook ? d => d : tableSet.addInput.bind(null, 'sCount', 'auto') },
        { data: 'Number', title: '单台日产能', sClass: 'number' },
        //{ data: 'Number', title: '单人日产能', render: isLook ? d => d : tableSet.addInput.bind(null, 'number', 'auto') },
        { data: 'Total', title: '日总产能', sClass: 'total' }
    ]);
    $('#personCapacitySetList').DataTable(perTableConfig);
    $('#showCapacitySetModal').modal('show');
}

//设备&人员产能设置弹窗
function showCapacitySetModal() {
    let prop = 'processId', val = $(this).val();
    if (this.exist) {
        prop = 'qId';
        if (val == 0) {
            prop = 'processId';
            val = $(this).attr('process');
        }
    }
    var process = $(this).attr("p");
    const t = {};
    t[prop] = val;
    this.Devices
        ? devicesOperatorsTable(this)
        : myPromise(5564, t, true).then(e => {
        //: myPromise(5564, { [prop]: val }, true).then(e => {
            e.Process = process;
            devicesOperatorsTable(e);
        });
    //设备&人员产能设置确定
    $('#addCapacitySetBtn').off('click').on('click', () => {
        const fn = (table, prop) => {
            const oldData = Array.from($(table).DataTable().data());
            const devTrs = Array.from(getDataTableRow(table));
            this[prop] = oldData.map((item, i) => {
                const tr = $(devTrs[i]);
                item.Single = tr.find('.single').val() >> 0;
                item.SingleCount = tr.find('.sCount').val() >> 0;
                item.Number = tr.find('.number').text() >> 0;
                item.Total = tr.find('.total').text() >> 0;
                return item;
            });
        }
        fn('#devCapacitySetList', 'Devices');
        fn('#personCapacitySetList', 'Operators');
        layer.msg('产能设置成功');
        $(this).closest('tr').find('.glyphicon').addClass('glyphicon-ok text-green').removeClass('glyphicon-remove text-red');
        $('#showCapacitySetModal').modal('hide');
    });
}

//添加产能类型
function addCapacity() {
    const capacity = $('#addCapacityCategory').val().trim();
    if (isStrEmptyOrUndefined(capacity)) return void layer.msg('产能类型不能为空');
    const remark = $('#addCapacityRemark').val().trim();
    const categoryId = $('#addCapacityProcess').val();
    if (isStrEmptyOrUndefined(categoryId)) return void layer.msg('请选择流程编号');
    const btnAll = $(getDataTableRow('#addCapacityList')).find('.set-btn');
    const list = [];
    for (let i = 0, len = btnAll.length; i < len; i++) {
        const item = btnAll[i];
        if (!item.Devices) return void layer.msg('请设置产能');
        let deviceModel = [], deviceSingle = [], deviceSingleCount = [], deviceNumber = [], operatorLevel = [], operatorSingle = [], operatorSingleCount = [], operatorNumber = [];
        item.Devices && item.Devices.forEach(item => {
            deviceModel.push(item.ModelId);
            deviceNumber.push(item.Number);
            deviceSingle.push(item.Single);
            deviceSingleCount.push(item.SingleCount);
        });
        item.Operators && item.Operators.forEach(item => {
            operatorLevel.push(item.LevelId);
            operatorNumber.push(item.Number);
            operatorSingle.push(item.Single);
            operatorSingleCount.push(item.SingleCount);
        });
        list[i] = {
            ProcessId: $(item).val(),
            DeviceModel: deviceModel.join(),
            DeviceNumber: deviceNumber.join(),
            DeviceSingle: deviceSingle.join(),
            DeviceSingleCount: deviceSingleCount.join(),

            OperatorLevel: operatorLevel.join(),
            OperatorNumber: operatorNumber.join(),
            OperatorSingle: operatorSingle.join(),
            OperatorSingleCount: operatorSingleCount.join()
        };
    }
    const opData = [{
        Capacity: capacity,
        CategoryId: categoryId,
        Remark: remark,
        List: list
    }];
    myPromise(5532, opData).then(() => {
        $('#showAddCapacityCategoryModel').modal('hide');
        getCapacityList();
    });
}

//修改产能类型
function updateCapacityCategory() {
    const capacityId = $(this).val();
    const categoryId = $('#updateCapacityProcess').val();
    if (isStrEmptyOrUndefined(categoryId)) return void layer.msg('请选择流程编号');
    const btnAll = $(getDataTableRow('#updateCapacityList')).find('.set-btn');
    const list = [];
    for (let i = 0, len = btnAll.length; i < len; i++) {
        const item = btnAll[i];
        if (!item.Devices && !item.exist) return void layer.msg('请设置产能');
        let deviceModel, deviceSingle, deviceSingleCount, deviceNumber, operatorLevel, operatorSingle, operatorSingleCount, operatorNumber;
        if (item.Devices) {
            const a = [], b = [], c = [], e = [], f = [], g = [], h = [], i = [];
            item.Devices.forEach(d => {
                a.push(d.ModelId);
                b.push(d.Number);
                f.push(d.Single);
                h.push(d.SingleCount);
            });
            item.Operators.forEach(d => {
                c.push(d.LevelId);
                e.push(d.Number);
                g.push(d.Single);
                i.push(d.SingleCount);
            });
            deviceModel = a.join(), deviceNumber = b.join(), operatorLevel = c.join(), operatorNumber = e.join(),
                deviceSingle = f.join(), operatorSingle = g.join(), deviceSingleCount = h.join(), operatorSingleCount = i.join();
        } else {
            deviceModel = item.DeviceModel, deviceNumber = item.DeviceNumber, operatorLevel = item.OperatorLevel, operatorNumber = item.OperatorNumber,
                deviceSingle = item.DeviceSingle, operatorSingle = item.OperatorSingle, deviceSingleCount = item.DeviceSingleCount, operatorSingleCount = item.OperatorSingleCount;
        }
        list[i] = {
            CapacityId: capacityId,
            ProcessId: item.exist ? $(item).attr('process') : $(item).val(),
            DeviceModel: deviceModel,
            DeviceNumber: deviceNumber,
            DeviceSingle: deviceSingle,
            DeviceSingleCount: deviceSingleCount,
            OperatorLevel: operatorLevel,
            OperatorNumber: operatorNumber,
            OperatorSingle: operatorSingle,
            OperatorSingleCount: operatorSingleCount,
            Id: item.exist ? $(item).val() : 0
        };
    }
    const opData = {
        Id: capacityId,
        CategoryId: categoryId,
        List: list
    };
    myPromise(5561, opData).then(() => {
        $('#showUpdateCapacityCategoryModel').modal('hide');
        getCapacityList();
    });
}

//删除产能类型
function delCapacity() {
    delTableRow(_capacityTrs, 5533, getCapacityList);
}

//查看产能清单
function showCapacityDetailModal() {
    myPromise(5560, { capacityId: $(this).val() }, true).then(e => {
        $('#capacityDetailCode').text($(this).attr('category'));
        const tableConfig = _tablesConfig(false, e.datas);
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Process', title: '流程' },
            { data: 'Category', title: '设备类型' },
            { data: null, title: '产能', render: d => `<button class="btn btn-info btn-sm capacity-btn" value="${d.Id}" process="${d.ProcessId}" p="${d.Process}">查看</button>` }
        ]);
        $('#capacityDetailList').DataTable(tableConfig);
        $('#showCapacityDetailModal').modal('show');
    });
}

//修改产能清单
function showUpdateCapacityModal() {
    const categoryId = $(this).attr('categoryid');
    const capacityId = $(this).val();
    const getProcessCodeFn = myPromise(5050);
    const getCapacityListFn = myPromise(5560, { capacityId, categoryId }, true);
    $('#updateCapacityCategoryBtn').val(capacityId);
    Promise.all([getProcessCodeFn, getCapacityListFn]).then(e => {
        $('#updateCapacityProcess').html(setOptions(e[0].datas, 'Category')).val(categoryId);
        const tableConfig = _tablesConfig(false, e[1].datas);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Process', title: '流程' },
            { data: 'Category', title: '设备类型' },
            { data: null, title: '产能', render: d => `<button class="btn btn-info btn-sm set-btn" value="${d.Id}" process="${d.ProcessId}" p="${d.Process}">查看</button>` },
            { data: null, title: '是否设置', render: tableSet.isFinish }
        ]);
        tableConfig.createdRow = (tr, d) => {
            const btn = $(tr).find('.set-btn')[0];
            btn.Process = d.Process;
            btn.DeviceModel = d.DeviceModel;
            btn.DeviceNumber = d.DeviceNumber;
            btn.DeviceSingle = d.DeviceSingle;
            btn.DeviceSingleCount = d.DeviceSingleCount;
            btn.OperatorLevel = d.OperatorLevel;
            btn.OperatorNumber = d.OperatorNumber;
            btn.OperatorSingle = d.OperatorSingle;
            btn.OperatorSingleCount = d.OperatorSingleCount;
            btn.exist = true;
        };
        $('#updateCapacityList').DataTable(tableConfig);
        $('#showUpdateCapacityCategoryModel').modal('show');
    });
}

//----------------------------------------工单管理----------------------------------------------------

let _workOrderTrs = null;

//获取工单列表
function getWorkOrderList() {
    myPromise(5070).then(data => {
        _workOrderTrs = [];
        const tableConfig = _tablesConfig(true, data.datas);
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
        const tableConfig = _tablesConfig(true, result[2].datas);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'TaskOrder', title: '任务单', render: tableSet.input.bind(null, 'taskOrder') },
            { data: 'StateStr', title: '状态' },
            { data: 'Target', title: '目标产量', render: tableSet.input.bind(null, 'target') },
            { data: 'Done', title: '已完成', sClass: 'text-green' },
            { data: 'Doing', title: '加工中', sClass: 'text-orange' },
            { data: 'WorkOrder', title: '工单', render: tableSet.select.bind(null, setOptions(result[1].datas, 'WorkOrder'), 'workOrder') },
            { data: 'Product', title: '计划号', render: tableSet.select.bind(null, setOptions(result[0].datas, 'Product'), 'product') },
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
        $('#taskOrderSelect').html(setOptions(data.datas, 'TaskOrder')).val(qId).trigger('change');
        $('#taskOrderDetailModel').modal('show');
    });
}

//任务单列表tr数据获取
function getTaskOrderTrInfo(el, isAdd) {
    const taskOrder = el.find('.taskOrder').val().trim();
    if (isStrEmptyOrUndefined(taskOrder)) return void layer.msg('任务单不能为空');
    const target = el.find('.target').val().trim();
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
        const firstWorkOrder = result[1].datas[0];
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
            { data: 'WorkOrderId', title: '工单', render: tableSet.addSelect.bind(null, setOptions(result[1].datas, 'WorkOrder'), 'workOrder') },
            { data: 'TargetWork', title: '目标产量' },
            { data: 'Left', title: '未完成', sClass: 'text-red' },
            { data: 'Doing', title: '加工中', sClass: 'text-orange' },
            { data: 'ProductId', title: '计划号', render: tableSet.addSelect.bind(null, setOptions(result[0].datas, 'Product'), 'product') },
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

//----------------------------------------PMC排程----------------------------------------------------
//排程入库表格生成
function pmcChildInStoreCreate(data, plan, actual, el, opType) {
    const temps = data.reduce((a, b) => {
        const timeData = b.Data[0].Data;
        const time = timeData.reduce((a, b) => {
            const monthDay = time => {
                time = time.split(' ')[0].split('-');
                return `${time[1]}月${time[2]}日`;
            }
            return `${a}<th colspan="2">${monthDay(b.ProcessTime)}</th>`;
        }, '');
        const putArr = [], havePutArr = [];
        const tbody = b.Data.reduce((c, d, i) => {
            const params = d.Data.reduce((e, f, i) => {
                const put = f[plan], havePut = f[actual];
                putArr[i] = (putArr[i] >> 0) + put, havePutArr[i] = (havePutArr[i]) >> 0 + havePut;
                return `${e}<td class="bg-green"><a href="javascript:showPmcChildPlanModal('${f.ProcessTime}',${d.ProductId},${b.PId},'${d.Product}','${b.Process}',${opType})" style="color:black">${put}</a></td>
                            <td ${havePut > put ? 'class="text-red"' : ''}>${havePut}</td>`;
            }, '');
            return `${c}<tr>
                            <td>${i + 1}</td>
                            <td>${d.Product}</td>${params}
                        </tr>`;
        }, '');
        const total = putArr.reduce((a, b, i) => `${a}<td class="bg-green">${b}</td><td ${havePutArr[i] > b ? 'class="text-red"' : ''}>${havePutArr[i]}</td>`, '');
        return `${a}<div class="form-group">
                        <label class="control-label">${b.Process}：</label>
                        <div class="table-responsive">
                            <table class="table table-hover table-striped table-bordered">
                                <thead class="flat-thead">
                                    <tr>
                                        <th rowspan="2">序号</th>
                                        <th rowspan="2">计划号</th>${time}
                                    </tr>
                                    <tr>${'<th class="bg-green">计划</th><th>实际</th>'.repeat(timeData.length)}</tr>
                                </thead>
                                <tbody>
                                    ${tbody}
                                    <tr>
                                        <td>总计</td><td></td>${total}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                     </div>`;
    }, '');
    $(el).html(temps);
}

//获取排程列表
function getPmcChildList() {
    const startTime = $('#pmcChildSTime').val();
    if (isStrEmptyOrUndefined(startTime)) return layer.msg('请选择开始时间');
    const endTime = $('#pmcChildETime').val();
    if (isStrEmptyOrUndefined(endTime)) return layer.msg('请选择结束时间');
    if (comTimeDay(startTime, endTime)) return;
    myPromise(5606, { startTime, endTime }, true).then(ret => pmcChildInStoreCreate(ret.datas, 'Put', 'HavePut', '#pmcChildList', 5607));
}

//获取入库列表
function getPmcInStoreList() {
    const startTime = $('#pmcInStoreSTime').val();
    if (isStrEmptyOrUndefined(startTime)) return layer.msg('请选择开始时间');
    const endTime = $('#pmcInStoreETime').val();
    if (isStrEmptyOrUndefined(endTime)) return layer.msg('请选择结束时间');
    if (comTimeDay(startTime, endTime)) return;
    myPromise(5608, { startTime, endTime }, true).then(ret => pmcChildInStoreCreate(ret.datas, 'Target', 'DoneTarget', '#pmcInStoreList', 5609));
}

//计划号详情弹窗
function showPmcChildPlanModal(time, productId, pId, product, process, opType) {
    const monthDay = time => {
        time = time.split(' ')[0].split('-');
        return `${time[1]}月${time[2]}日`;
    }
    $('#pmcChildPlanTime').text(monthDay(time));
    $('#pmcChildPlanCode').text(product);
    $('#pmcChildPlanProcess').text(process);
    let a = 'Put', b = 'HavePut';
    if (opType === 5609) {
        a = 'Target';
        b = 'DoneTarget';
    }
    myPromise(opType, { time, productId, pId }, true).then(ret => {
        const data = ret.datas;
        const tableConfig = _tablesConfig(false, data);
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'TaskOrder', title: '任务单' },
            { data: a, title: '计划', sClass: 'bg-green' },
            { data: b, title: '实际' }
        ]);
        tableConfig.initComplete = function () {
            this.find('tfoot').remove();
            if (!data.length) return;
            let c = 0, d = 0;
            data.forEach(item => {
                c += item[a];
                d += item[b];
            });
            const tFoot = `<tfoot>
                              <tr>
                                <th>总计</th>
                                <th></th>
                                <th>${c}</th>
                                <th>${d}</th>
                              </tr>
                           </tfoot>`;
            this.append(tFoot).find('tfoot tr:last th').css('borderTop', 0);
        }
        $('#pmcChildPlanList').DataTable(tableConfig);
        $('#showPmcChildPlanModal').modal('show');
    });
}

//----------------------------------------PMC入库----------------------------------------------------
//----------------------------------------PMC排产----------------------------------------------------
//刷新未安排任务单
function getNotArrangeTaskListReset() {
    getNotArrangeTaskList();
    $('#notArrangeTaskProcessBox,#pmcPreviewBox,#pmcPreviewProcessSelect,#pmcPreviewProcessNew,#pmcPreviewProcessLater,#pmcPreviewProcessBtn').html('');
    _pmcPreviewParams = {};
}

//获取未安排任务单
function getNotArrangeTaskList() {
    myPromise(5601).then(data => {
        data = data.datas;
        const o = {};
        data.forEach(item => o[item.Id] = item);
        const trData = {
            Product: '',
            Target: '',
            DeliveryTime: '',
            StartTime: '',
            EndTime: '',
            EstimatedTime: ''
        };
        const tableConfig = _tablesConfig(false, []);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: null, title: '任务单', render: tableSet.addSelect.bind(null, setOptions(data, 'TaskOrder'), 'taskOrder') },
            { data: 'Product', title: '计划号' },
            { data: 'Target', title: '数量' },
            { data: 'DeliveryTime', title: '交货时间', render: d => d.split(' ')[0] },
            { data: 'StartTime', title: '开始时间', render: tableSet.addDay.bind(null, 'startTime') },
            { data: 'EndTime', title: '截止时间', render: tableSet.addDay.bind(null, 'endTime') },
            { data: null, title: '工期', render: d => '', sClass: 'workDay' },
            { data: null, title: '删除', render: () => `<button class="btn btn-danger btn-xs del-btn"><i class="fa fa-minus"></i></button>` }
        ]);
        tableConfig.createdRow = tr => {
            $(tr).find('.taskOrder').val(0);
            initDayTime(tr);
        };
        $('#notArrangeTaskList').DataTable(tableConfig);
        $('#addNotArrangeTaskListBtn').off('click').on('click', function () {
            addDataTableTr('#notArrangeTaskList', trData);
            disabledPmcTask();
            if (data.length === $('#notArrangeTaskList').DataTable().column(1).nodes().length) $(this).prop('disabled', true);
        }).prop('disabled', !data.length);
        $('#notArrangeTaskList').off('change').on('change', '.taskOrder', function () {
            const v = $(this).val();
            const selects = $($('#notArrangeTaskList').DataTable().columns(1).nodes()[0]).find('.taskOrder');
            const arr = {};
            for (let i = 0, len = selects.length; i < len; i++) {
                const select = selects.eq(i);
                const disabledOp = select.find('option[disabled]');
                disabledOp.prop('disabled', false);
                const id = select.val();
                disabledOp.prop('disabled', true);
                if (!isStrEmptyOrUndefined(id)) {
                    arr[id] = _pmcPreviewParams[id] || { Id: +id }
                }
            }
            _pmcPreviewParams = arr;
            const d = o[v];
            const tr = $(this).closest('tr');
            tr.find('td').eq(2).text(d.Product);
            tr.find('td').eq(3).text(d.Target);
            tr.find('td').eq(4).text(d.DeliveryTime.split(' ')[0]);
            tr.find('.startTime').val(d.StartTime && d.StartTime != '0001-01-01 00:00:00' ? d.StartTime.split(' ')[0] : '').datepicker('update');
            tr.find('.endTime').val(d.EndTime && d.EndTime != '0001-01-01 00:00:00' ? d.EndTime.split(' ')[0] : '').datepicker('update');
            disabledPmcTask();
            setNotArrangeTaskWork($(this).closest('tr'));
        });
        $('#notArrangeTaskList').off('changeDate').on('changeDate', '.form_date', function () {
            setNotArrangeTaskWork($(this).closest('tr'));
        });
    });
}

//排产工期设置
function setNotArrangeTaskWork(tr) {
    const startTime = tr.find('.startTime').val().trim();
    const endTime = tr.find('.endTime').val().trim();
    if (!startTime || !endTime) return;
    const day = (new Date(endTime) - new Date(startTime)) / 86400000;
    tr.find('.workDay').text(day + 1);
}

//PMC任务单选择禁用
function disabledPmcTask() {
    const selects = $($('#notArrangeTaskList').DataTable().columns(1).nodes()[0]).find('.taskOrder');
    disabledProcessCodeCommon(selects);
}

let _taskOrders = [];
//获取待排程任务单各工序数量
function getNotArrangeTaskProcessList() {
    const trs = getDataTableRow('#notArrangeTaskList');
    for (let i = 0, len = trs.length; i < len; i++) {
        const tr = $(trs[i]);
        const select = tr.find('.taskOrder');
        const disabledOp = select.find('option[disabled]');
        disabledOp.prop('disabled', false);
        const id = select.val();
        disabledOp.prop('disabled', true);
        if (isStrEmptyOrUndefined(id)) return layer.msg('请选择任务单');
        const startTime = tr.find('.startTime').val().trim();
        const endTime = tr.find('.endTime').val().trim();
        if (startTime) {
            _pmcPreviewParams[id].StartTime = startTime;
        } else {
            delete _pmcPreviewParams[id].StartTime;
        }
        if (endTime) {
            _pmcPreviewParams[id].EndTime = endTime;
        } else {
            delete _pmcPreviewParams[id].EndTime;
        }
        if (startTime && endTime) {
            if (compareDate(startTime, endTime))
                return layer.msg('截止时间不能小于开始时间');
        }
    }
    const arr = Object.values(_pmcPreviewParams);
    if (!arr.length) return layer.msg('请选择任务单');
    const setTable = ret => {
        const fn = (headTr, n, tbody) => {
            return `<div class="form-group">
                        <label class="control-label">待排程任务单各工序数量：</label>
                        <div class="table-responsive">
                            <table class="table table-hover table-striped table-bordered">
                                <thead class="flat-thead">
                                    <tr>
                                        <th rowspan="2">序号</th>
                                        <th rowspan="2">任务单</th>
                                        <th rowspan="2">计划号</th>${headTr}
                                    </tr>
                                    <tr>${'<th class="bg-blue">总计</th><th class="bg-green">已有</th><th class="bg-yellow">剩余</th><th>投料</th>'.repeat(n)}</tr>
                                </thead>
                                <tbody>${tbody}</tbody>
                            </table>
                        </div>
                        <div class="text-center">
                            <button class="btn btn-primary btn-sm" id="setNotArrangeTaskProcessBtn">确定</button>
                        </div>
                      </div>`;
        };
        const orders = ret.Orders.sort((a, b) => a.Order - b.Order);
        const headTr = orders.reduce((a, b, i) => `${a}<th colspan="4" ${i % 2 ? '' : 'class="bg-gray"'}>${b.Process}</th>`, '');
        const data = ret.datas;
        _pmcPreviewParams = {};
        const tbody = data.reduce((a, b, i) => {
            const id = b.Id;
            _pmcPreviewParams[id] = { Id: id, Needs: [] };
            const needs = b.Needs.sort((a, b) => a.Order - b.Order);
            const o = {}, pmcPreviewParamsArr = _pmcPreviewParams[id].Needs;
            needs.forEach(item => {
                o[item.Order] = item;
                pmcPreviewParamsArr.push({
                    Order: item.Order,
                    TaskOrderId: item.TaskOrderId,
                    ProcessId: item.ProcessId,
                    PId: item.PId,
                    ProductId: item.ProductId,
                    Target: item.Target,
                    Put: item.Put,
                    Stock: item.Stock
                });
            });
            const tds = orders.reduce((a, b) => {
                const d = o[b.Order];
                return d
                    ? `${a}
                          <td style="padding:4px" class="bg-blue">${d.Target + d.Stock}</td>
                          <td style="padding:4px" class="bg-green">
                             <input type="text" class="form-control text-center stock" value="${d.Stock}" style="width:50px;margin:auto;padding:inherit">
                          </td>
                          <td class="bg-yellow">${d.Target}</td>
                          <td style="padding:4px"><strong class="text-red">${d.Put}</strong> (${d.Rate}%)</td>`
                    : `${a}<td style="padding:4px" class="short-slab"><i></td><td style="padding:4px" class="short-slab"><i></td><td style="padding:4px" class="short-slab"><i></td><td style="padding:4px" class="short-slab"><i></td>`;
            }, '');
            return `${a}<tr>
                        <td>${i + 1}</td>
                        <td>${b.TaskOrder}</td>
                        <td>${b.Product}</td>${tds}
                    </tr>`;
        }, '');
        const temp = fn(headTr, orders.length, tbody);
        $('#notArrangeTaskProcessBox').html(temp).find('th,td').css('border', '1px solid black').end().find('tbody .bg-green').css('padding', 0);
        $('#setNotArrangeTaskProcessBtn').off('click').on('click', () => {
            const stockEls = $('#notArrangeTaskProcessBox .stock');
            let i = 0;
            //const opData = data.map(item => ({
            //    Id: item.Id,
            //    Needs: item.Needs.map(item => ({
            //        Order: item.Order,
            //        TaskOrderId: item.TaskOrderId,
            //        ProcessId: item.ProcessId,
            //        PId: item.PId,
            //        ProductId: item.ProductId,
            //        Target: item.Target,
            //        Put: item.Put,
            //        Stock: stockEls.eq(i++).val() >> 0
            //    }))
            //}));
            const opData = data.map(item => ({
                Id: item.Id,
                Needs: item.Needs.map(item => ({
                    Order: item.Order,
                    TaskOrderId: item.TaskOrderId,
                    ProcessId: item.ProcessId,
                    PId: item.PId,
                    ProductId: item.ProductId,
                    Target: item.Target,
                    Put: item.Put,
                    Stock: stockEls.eq(i++).val() >> 0
                }))
            }));
            //_taskOrders = [];
            //myPromise(5602, opData).then(ret => {
            myPromise(5602, _taskOrders).then(ret => {
                setTable(ret);
                ret.datas.forEach(item => {
                    const o = {
                        Id: item.Id,
                        Needs: item.Needs.map(item => ({
                            Order: item.Order,
                            TaskOrderId: item.TaskOrderId,
                            ProcessId: item.ProcessId,
                            PId: item.PId,
                            ProductId: item.ProductId,
                            Target: item.Target,
                            Put: item.Put,
                            Stock: item.Stock
                        }))
                    }
                    if (item.StartTime != "0001-01-01 00:00:00")
                        o.StartTime = item.StartTime;
                    if (item.EndTime != "0001-01-01 00:00:00")
                        o.EndTime = item.EndTime;
                    //_taskOrders.push(o);
                    _pmcPreviewParams[item.Id] = o;
                });
                _taskOrders = Object.values(_pmcPreviewParams);
            });
        });

        _taskOrders = [];
        data.forEach(item => {
            const o = {
                Id: item.Id,
                Needs: item.Needs.map(item => ({
                    Order: item.Order,
                    TaskOrderId: item.TaskOrderId,
                    ProcessId: item.ProcessId,
                    PId: item.PId,
                    ProductId: item.ProductId,
                    Target: item.Target,
                    Put: item.Put,
                    Stock: item.Stock
                }))
            }
            if (item.StartTime != "0001-01-01 00:00:00")
                o.StartTime = item.StartTime;
            if (item.EndTime != "0001-01-01 00:00:00")
                o.EndTime = item.EndTime;
            //_taskOrders.push(o);
            _pmcPreviewParams[item.Id] = o;
        });
        _taskOrders = Object.values(_pmcPreviewParams);
    }
    myPromise(5602, arr, true).then(setTable);
}

let _arrangeTask = null;
//获取已安排任务单
function getArrangeTaskList() {
    const getLevelFn = myPromise(5590);
    const getArrangeTaskFn = myPromise(5600);
    Promise.all([getLevelFn, getArrangeTaskFn]).then(res => {
        _arrangeTask = [];
        const tableConfig = _tablesConfig(false, res[1].datas);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: null, title: '等级', render: tableSet.addSelect.bind(null, setOptions(res[0].datas, 'Level'), 'level') },
            { data: 'StateStr', title: '状态' },
            { data: 'TaskOrder', title: '任务单' },
            { data: 'Product', title: '计划号' },
            { data: 'Target', title: '数量' },
            { data: 'DoneTarget', title: '已完成' },
            { data: 'DeliveryTime', title: '交货时间', render: tableSet.showTime },
            { data: 'StartTime', title: '开始时间', render: tableSet.addDay.bind(null, 'startTime') },
            { data: 'EndTime', title: '截止时间', render: tableSet.addDay.bind(null, 'endTime') },
            { data: 'CostDay', title: '工期', render: d => d || '', sClass: 'workDay' },

            //{ data: 'StartTime', title: '开始时间', render: tableSet.showTime },
            //{ data: 'EndTime', title: '截止时间', render: tableSet.showTime },
            //{ data: 'CostDay', title: '工期', render: d => d || '' }
        ]);
        tableConfig.createdRow = (tr, d) => {
            $(tr).find('.level').val(d.LevelId);
            initDayTime(tr);
        }
        //tableConfig.drawCallback = function () {
        //    initCheckboxAddEvent.call(this, _arrangeTask, (tr, d) => {
        //        tr.find('.startTime').val(d.StartTime && d.StartTime != '0001-01-01 00:00:00' ? d.StartTime.split(' ')[0] : '').datepicker('update');
        //        tr.find('.endTime').val(d.EndTime && d.EndTime != '0001-01-01 00:00:00' ? d.EndTime.split(' ')[0] : '').datepicker('update');
        //    });
        //}
        $('#arrangeTaskList').DataTable(tableConfig);
        $('#arrangeTaskList').off('changeDate').on('changeDate', '.form_date', function () {
            setNotArrangeTaskWork($(this).closest('tr'));
        });
    });
}

//设置已安排任务单
function setArrangeTaskList() {
    const trs = Array.from(getDataTableRow('#arrangeTaskList'));
    const instance = $('#arrangeTaskList').DataTable();
    const list = [];
    for (let i = 0, len = trs.length; i < len; i++) {
        const tr = trs[i];
        const d = instance.row(tr).data();
        const levelId = $(tr).find('.level').val();
        if (isStrEmptyOrUndefined(levelId)) return void layer.msg('请选择等级');
        const startTime = $(tr).find('.startTime').val();
        if (isStrEmptyOrUndefined(startTime)) return layer.msg('请选择开始时间');
        const endTime = $(tr).find('.endTime').val();
        if (isStrEmptyOrUndefined(endTime)) return layer.msg('请选择结束时间');
        //if (comTimeDay(endTime, startTime)) return;
        list[i] = {
            StartTime: startTime,
            EndTime: endTime,
            LevelId: levelId,
            Id: d.Id
        }
    }
    if (!list.length) return layer.msg('请设置任务单');
    myPromise(5603, list);
}

let _pmcPreviewParams = {};
//预览
function getPmcPreviewList() {
    myPromise(5604, !!$('#notArrangeTaskProcessBox').html() ? Object.values(_pmcPreviewParams) : [], true).then(data => {
        const fn = (headTr, tbody) => {
            return `<div class="form-group">
                        <label class="control-label">开始时间：${data.StartTime.split(' ')[0]}</label><br />
                        <label class="control-label">产能指数：</label>
                        <div class="table-responsive">
                            <table class="table table-hover table-striped table-bordered">
                                <thead class="flat-thead">
                                    <tr>
                                        <th rowspan="2" style="width: 40px">序号</th>
                                        <th rowspan="2" style="width: 82px">任务单</th>
                                        <th rowspan="2" style="width: 82px">计划号</th>
                                        <th rowspan="2" style="width: 82px">开始时间</th>
                                        <th rowspan="2" style="width: 82px">结束时间</th>
                                        <th rowspan="2" style="width: 50px">耗时</th>
                                        <th rowspan="2" style="width: 50px">逾期</th>
                                        <th rowspan="2" style="width: 50px">当前最优</th>${headTr}
                                    </tr>
                                    <tr>${'<th class="bg-yellow">设备</th><th>人员</th>'.repeat(data.Orders.length)}</tr>
                                </thead>
                                <tbody>${tbody}</tbody>
                            </table>
                        </div>
                      </div>`;
        };
        const orders = data.Orders.sort((a, b) => a.Order - b.Order);
        const headTr = orders.reduce((a, b) => `${a}<th colspan="2">${b.Process}</th>`, '');
        const tbody = data.Cost.reduce((a, b, i) => {
            const id = b.Id;
            const costDays = b.CostDays.sort((a, b) => a.Order - b.Order);
            const o = {};
            costDays.forEach(item => {
                o[item.Order] = item;
            });
            const tds = orders.reduce((c, d) => {
                const e = o[d.Order];
                return e
                    ? `${c}<td class="bg-yellow">${e.DeviceDay}</td><td>${e.OperatorDay}</td>`
                    : `${c}<td style="padding:4px" class="short-slab"><i></td><td style="padding:4px" class="short-slab"><i></td>`;
            }, '');
            const estimatedStartTime = b.EstimatedStartTime.split(' ')[0];
            const estimatedCompleteTime = b.EstimatedCompleteTime.split(' ')[0];
            const trs = Array.from(getDataTableRow('#notArrangeTaskList'));
            const tId = b.Id;
            trs.forEach(el => {
                el = $(el);
                const select = el.find('.taskOrder option[disabled]');
                select.prop('disabled', false);
                const taskOrderId = el.find('.taskOrder').val();
                select.prop('disabled', true);
                if (taskOrderId == tId) {
                    if (isStrEmptyOrUndefined(el.find('.startTime').val())) {
                        el.find('.startTime').val(estimatedStartTime).datepicker('update');
                        if (_pmcPreviewParams[id]) _pmcPreviewParams[tId].StartTime = estimatedStartTime;
                    }
                    if (isStrEmptyOrUndefined(el.find('.endTime').val())) {
                        el.find('.endTime').val(estimatedCompleteTime).datepicker('update');
                        if (_pmcPreviewParams[id]) _pmcPreviewParams[tId].EndTime = estimatedCompleteTime;
                    }
                }
            });
            return `${a}<tr>
                        <td>${i + 1}</td>
                        <td>${b.TaskOrder}</td>
                        <td>${b.Product}</td>
                        <td>${estimatedStartTime}</td>
                        <td>${estimatedCompleteTime}</td>
                        <td>${b.CostDay}</td>
                        <td>${b.OverdueDay}</td>
                        <td>${b.Best ? '人员' : '设备'}</td>${tds}
                    </tr>`;
        }, '');
        const temp = fn(headTr, tbody);
        $('#pmcPreviewBox').html(temp);
        getPresentSchedule(data);
    });
}

//查看当前排程&安排后
function getPresentSchedule(data) {
    const select = `<div class="form-group flexStyle">
                        <label class="control-label no-margin">工序：</label>
                        <select class="form-control" id="pmcScheduleSelect" style="width:120px;margin-right:3px">${setOptions(data.Orders, 'Process')}</select>
                        <button class="btn btn-primary btn-sm" id="pmcScheduleBtn">查看</button>
                    </div>`;
    $('#pmcPreviewProcessSelect').html(select);
    const o = {};
    data.Put.forEach(item => o[item.PId] = item);
    var f = function () {
        const pid = $('#pmcScheduleSelect').val();
        if (isStrEmptyOrUndefined(pid)) return;
        const opData = {
            startTime: data.StartTime,
            endTime: data.CompleteTime,
            pid
        };
        const fn = (title, headTr, tbody, total) => {
            return `<div class="form-group">
                    <label class="control-label">${title}：</label>
                    <div class="table-responsive">
                        <table class="table table-hover table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>序号</th>
                                    <th>计划号</th>${headTr}
                                </tr>
                            </thead>
                            <tbody>
                            ${tbody}
                            <tr><td>总计</td><td></td>${total}</tr>
                            </tbody>
                        </table>
                    </div>
                  </div>`;
        };
        const monthDay = time => {
            time = time.split(' ')[0].split('-');
            return `${time[1]}月${time[2]}日`;
        }

        const createTable = (title, data) => {
            const headTr = data.Data[0].Data.reduce((a, b) => `${a}<th>${monthDay(b.ProcessTime)}</th>`, '');
            const putArr = [];
            const tbody = data.Data.reduce((a, b, i) => {
                const params = b.Data.reduce((c, d, i) => {
                    const put = d.Put;
                    putArr[i] = (putArr[i] >> 0) + put;
                    return `${c}<td><a href="javascript:showPmcProcessPlanModal('${d.ProcessTime}',${b.ProductId
                        },${
                        data.PId},'${b.Product}','${data.Process}')">${put}</a></td>`;
                },
                    '');
                return `${a}<tr>
                            <td>${i + 1}</td>
                            <td>${b.Product}</td>${params}
                        </tr>`;
            },
                '');
            const total = putArr.reduce((a, b) => `${a}<td>${b}</td>`, '');
            return fn(title, headTr, tbody, total);
        }
        //当前排程
        myPromise(5606, opData, true).then(ret => {
            const d = ret.datas[0];
            if (!d) return $('#pmcPreviewProcessNew').html('<label class="control-label">当前排程：</label>');
            $('#pmcPreviewProcessNew').html(createTable('当前排程', d));
        });
        //安排后
        const headTr = o[pid].Data[0].Data.reduce((a, b) => `${a}<th>${monthDay(b.ProcessTime)}</th>`, '');
        const putArr = [];
        const oldData = [];
        let index = 0;
        const tbody = o[pid].Data.reduce((a, b, i) => {
            const params = b.Data.reduce((c, d, i) => {
                const put = d.Put;
                putArr[i] = (putArr[i] >> 0) + put;
                oldData.push(d.Data);
                return `${c}<td><a href="javascript:;" class="old-data" index="${index++}" product="${b.Product
                    }" process="${o[pid].Process}">${put}</a></td>`;
            },
                '');
            return `${a}<tr>
                            <td>${i + 1}</td>
                            <td>${b.Product}</td>${params}
                        </tr>`;
        }, '');
        const total = putArr.reduce((a, b) => `${a}<td>${b}</td>`, '');
        $('#pmcPreviewProcessLater').html(fn('安排后', headTr, tbody, total)).find('.old-data').on('click',
            function () {
                const index = $(this).attr('index');
                $('#pmcProcessPlanCode').text($(this).attr('product'));
                $('#pmcProcessPlanProcess').text($(this).attr('process'));
                const tableConfig = _tablesConfig(false, oldData[index]);
                tableConfig.columns = tableConfig.columns.concat([
                    { data: 'TaskOrder', title: '任务单' },
                    { data: 'Put', title: '数量' },
                    { data: null, title: '安排', render: (d) => Object.values(d.Arranges).map((a) => ("{0}:{1}次".format(a.Item1, a.Item2))).join() }
                ]);
                tableConfig.initComplete = function () {
                    this.find('tfoot').remove();
                    if (!data.length) return;
                    const tFoot = `<tfoot>
                              <tr>
                                <th>总计</th>
                                <th></th>
                                <th>${data.reduce((a, b) => a + b.Put, 0)}</th>
                              </tr>
                           </tfoot>`;
                    this.append(tFoot).find('tfoot tr:last th').css('borderTop', 0);
                }
                $('#pmcProcessPlanList').DataTable(tableConfig);
                $('#showPmcProcessPlanModal').modal('show');
            });
        //排产
        $('#pmcPreviewProcessBtn').html('<button class="btn btn-primary btn-sm">排产</button>').find('button').on('click',
            () => {
                if (!_taskOrders.length) return layer.msg('请先设置待排程任务单各工序数量');
                const opData = {
                    TaskOrders: _taskOrders,
                    Schedule: data.Schedule
                };
                myPromise(5605, opData, false, 1, getArrangeTaskList);
            });
    };
    $('#pmcScheduleBtn').off('click').on('click', f);
    $('#pmcScheduleBtn').click();
    $('#pmcScheduleSelect').off('change').on('change', f);
}

//预览计划详情
function showPmcProcessPlanModal(time, productId, pId, product, process) {
    $('#pmcProcessPlanCode').text(product);
    $('#pmcProcessPlanProcess').text(process);
    myPromise(5607, { time, productId, pId }, true).then(ret => {
        const data = ret.datas;
        const tableConfig = _tablesConfig(false, data);
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'TaskOrder', title: '任务单' },
            { data: 'Put', title: '数量' },
            { data: null, title: '安排', render: (d) => Object.values(d.Arranges).map((a) => ("{0}:{1}次".format(a.Item1, a.Item2))).join() }
        ]);
        tableConfig.initComplete = function () {
            this.find('tfoot').remove();
            if (!data.length) return;
            const tFoot = `<tfoot>
                              <tr>
                                <th>总计</th>
                                <th></th>
                                <th>${data.reduce((a, b) => a + b.Put, 0)}</th>
                              </tr>
                           </tfoot>`;
            this.append(tFoot).find('tfoot tr:last th').css('borderTop', 0);
        }
        $('#pmcProcessPlanList').DataTable(tableConfig);
        $('#showPmcProcessPlanModal').modal('show');
    });
}

//任务单等级弹窗
function showTaskLevelModel() {
    getTaskLevelList();
    $('#showTaskLevelModel').modal('show');
}

let _pmcTaskLevelTrs = null;

//获取任务单等级
function getTaskLevelList() {
    _pmcTaskLevelTrs = [];
    myPromise(5590).then(data => {
        const tableConfig = _tablesConfig(true, data.datas);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Level', title: '等级', render: tableSet.input.bind(null, 'level') },
            { data: 'Order', title: '顺序', render: tableSet.input.bind(null, 'order') },
            { data: 'Remark', title: '备注', render: tableSet.input.bind(null, 'remark') }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _pmcTaskLevelTrs, (tr, d) => {
                tr.find('.level').val(d.Level);
                tr.find('.order').val(d.Order);
                tr.find('.remark').val(d.Remark);
            });
        }
        $('#pmcTaskLevelList').DataTable(tableConfig);
    });
}

//任务单等级列表tr数据获取
function getTaskLevelTrInfo(el, isAdd) {
    const level = el.find('.level').val().trim();
    if (isStrEmptyOrUndefined(level)) return void layer.msg('等级不能为空');
    const order = el.find('.order').val().trim().trim();
    if (isStrEmptyOrUndefined(order)) return void layer.msg('顺序不能为空');
    const list = {
        Level: level,
        Order: order,
        Remark: el.find('.remark').val()
    }
    isAdd || (list.Id = el.find('.isEnable').val() >> 0);
    return list;
}

//修改任务单等级
function updateTaskLevel() {
    updateTableRow(_pmcTaskLevelTrs, getTaskLevelTrInfo, 5591, getTaskLevelList);
}

//添加任务单等级等级模态框
function showAddTaskLevelModel() {
    const trData = {
        Level: '',
        Order: '',
        Remark: ''
    }
    const tableConfig = _tablesConfig(false, [trData]);
    const tableSet = _tableSet();
    tableConfig.columns = tableConfig.columns.concat([
        { data: 'Level', title: '等级', render: tableSet.addInput.bind(null, 'level', 'auto') },
        { data: 'Order', title: '顺序', render: tableSet.addInput.bind(null, 'order', 'auto') },
        { data: 'Remark', title: '备注', render: tableSet.addInput.bind(null, 'remark', '100%') },
        { data: null, title: '删除', render: tableSet.delBtn }
    ]);
    tableConfig.createdRow = tr => initDayTime(tr);
    $('#addTaskLevelList').DataTable(tableConfig);
    $('#addTaskLevelListBtn').off('click').on('click', () => addDataTableTr('#addTaskLevelList', trData));
    $('#showAddTaskLevelModel').modal('show');
}

//添加任务单等级
function addTaskLevel() {
    addTableRow('#addTaskLevelList', getTaskLevelTrInfo, 5592, () => {
        $('#showAddTaskLevelModel').modal('hide');
        getTaskLevelList();
    });
}

//删除任务单等级
function delTaskLevel() {
    delTableRow(_pmcTaskLevelTrs, 5593, getTaskLevelList);
}

//----------------------------------------PMC排程人员----------------------------------------------------
let _pmcPersonTrs = null;

//获取人员
function getPmcPersonList() {
    const opData = {
        condition: $('#pmcPersonQueryTF').val()
    }
    const mode = $('#pmcPersonQueryMode').val();
    opData[mode] = ['number', 'name'].includes(mode)
        ? $('#pmcPersonQueryInput').val().trim()
        : $('#pmcPersonQuerySelect').val();
    const getPmcPersonFn = myPromise(5500, opData, true);
    const getGradeFn = myPromise(5510, { menu: true }, true);
    const getProcessFn = myPromise(5030, { menu: true }, true);
    Promise.all([getPmcPersonFn, getGradeFn, getProcessFn]).then(data => {
        _pmcPersonTrs = [];
        const tableConfig = _tablesConfig(true, data[0].datas);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'StateStr', title: '状态', render: tableSet.select.bind(null, tableSet.stateOps, 'state') },
            { data: 'Number', title: '编号' },
            { data: 'Name', title: '姓名' },
            { data: 'Level', title: '等级', render: tableSet.select.bind(null, setOptions(data[1].datas, 'Level'), 'level') },
            { data: 'Process', title: '工序', render: tableSet.select.bind(null, setOptions(data[2].datas, 'Process'), 'process') },
            { data: 'Priority', title: '优先级', render: tableSet.input.bind(null, 'priority') },
            { data: 'Remark', title: '备注', render: tableSet.input.bind(null, 'remark') }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _pmcPersonTrs, (tr, d) => {
                tr.find('.state').val(d.State);
                tr.find('.level').val(d.LevelId);
                tr.find('.process').val(d.ProcessId);
                tr.find('.priority').val(d.Priority);
                tr.find('.remark').val(d.Remark);
            });
        }
        $('#pmcPersonList').DataTable(tableConfig);
    });
}

//人员列表tr数据获取
function getPmcPersonTrInfo(el, isAdd) {
    let list;
    if (isAdd) {
        const nameEl = el.find('.name');
        const disabledName = nameEl.find('option[disabled]');
        disabledName.prop('disabled', false);
        const name = nameEl.val();
        disabledName.prop('disabled', true);
        if (isStrEmptyOrUndefined(name)) return void layer.msg('请选择员工');
        list = {
            UserId: name,
            State: 1
        }
    } else {
        const state = el.find('.state').val();
        if (isStrEmptyOrUndefined(state)) return void layer.msg('请选择状态');
        list = {
            State: state,
            Id: el.find('.isEnable').val() >> 0
        }
    }
    const level = el.find('.level').val();
    if (isStrEmptyOrUndefined(level)) return void layer.msg('请选择等级');
    list.LevelId = level;
    const process = el.find('.process').val();
    if (isStrEmptyOrUndefined(process)) return void layer.msg('请选择工序');
    list.ProcessId = process;
    list.Priority = el.find('.priority').val() >> 0;
    list.Remark = el.find('.remark').val();
    return list;
}

//修改人员
function updatePmcPerson() {
    updateTableRow(_pmcPersonTrs, getPmcPersonTrInfo, 5501, getPmcPersonList);
}

//添加人员模态框
function showAddPmcPersonModel() {
    const getPmcPersonFn = myPromise(5500, { menu: true, add: true }, true);
    const getLevelFn = myPromise(5510, { menu: true }, true);
    const getProcessFn = myPromise(5030, { menu: true }, true);
    Promise.all([getPmcPersonFn, getLevelFn, getProcessFn]).then(data => {
        const trData = {
            Name: '',
            Level: '',
            Process: '',
            Priority: 0,
            Remark: ''
        }
        const tableConfig = _tablesConfig(false, [trData]);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Name', title: '员工姓名', render: tableSet.addSelect.bind(null, setOptions(data[0].datas, 'Name'), 'name') },
            { data: 'Level', title: '等级', render: tableSet.addSelect.bind(null, setOptions(data[1].datas, 'Level'), 'level') },
            { data: 'Process', title: '工序', render: tableSet.addSelect.bind(null, setOptions(data[2].datas, 'Process'), 'process') },
            { data: 'Priority', title: '优先级', render: tableSet.addInput.bind(null, 'priority', 'auto') },
            { data: 'Remark', title: '备注', render: tableSet.addInput.bind(null, 'remark', '100%') },
            { data: null, title: '删除', render: () => '<button class="btn btn-danger btn-xs del-btn"><i class="fa fa-minus"></i></button>' }
        ]);
        tableConfig.createdRow = tr => $(tr).find('.name').val(0);
        $('#addPmcPersonList').DataTable(tableConfig);
        $('#addPmcPersonListBtn').prop('disabled', data[0].datas.length <= $('#addPmcPersonList').DataTable().column(1).nodes().length);
        $('#addPmcPersonListBtn').off('click').on('click', function () {
            addDataTableTr('#addPmcPersonList', trData);
            disabledPmcPerson();
            if (data[0].datas.length === $('#addPmcPersonList').DataTable().column(1).nodes().length) $(this).prop('disabled', true);
        });
        $('#showAddPmcPersonModel').modal('show');
    });
}

//PMC添加员工选择禁用
function disabledPmcPerson() {
    const selects = $($('#addPmcPersonList').DataTable().columns(1).nodes()[0]).find('.name');
    disabledProcessCodeCommon(selects);
}

//添加人员
function addPmcPerson() {
    addTableRow('#addPmcPersonList', getPmcPersonTrInfo, 5502, () => {
        $('#showAddPmcPersonModel').modal('hide');
        getPmcPersonList();
    });
}

//删除人员
function delPmcPerson() {
    delTableRow(_pmcPersonTrs, 5503, getPmcPersonList);
}


//----------------------------------------PMC排程等级----------------------------------------------------

//等级弹窗
function showPmcGradeModal() {
    getPmcGradeList();
    $('#showPmcGradeModal').modal('show');
}

let _pmcGradeTrs = null;

//获取等级列表
function getPmcGradeList() {
    myPromise(5510).then(data => {
        _pmcGradeTrs = [];
        const tableConfig = _tablesConfig(true, data.datas);
        const tableSet = _tableSet();
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Level', title: '等级', render: tableSet.input.bind(null, 'level') },
            { data: 'Order', title: '顺序', render: tableSet.input.bind(null, 'order') },
            { data: 'Remark', title: '备注', render: tableSet.input.bind(null, 'remark') }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _pmcGradeTrs, (tr, d) => {
                tr.find('.level').val(d.Level);
                tr.find('.remark').val(d.Remark);
            });
        }
        $('#pmcGradeList').DataTable(tableConfig);
    });
}

//等级列表tr数据获取
function getPmcGradeTrInfo(el, isAdd) {
    const level = el.find('.level').val().trim();
    if (isStrEmptyOrUndefined(level)) return void layer.msg('等级不能为空');
    const order = el.find('.order').val().trim();
    if (isStrEmptyOrUndefined(order)) return void layer.msg('顺序不能为空');
    const list = {
        Level: level,
        Order: order >> 0,
        Remark: el.find('.remark').val()
    }
    isAdd || (list.Id = el.find('.isEnable').val() >> 0);
    return list;
}

//修改等级
function updatePmcGrade() {
    updateTableRow(_pmcGradeTrs, getPmcGradeTrInfo, 5511, getPmcGradeList);
}

//添加等级模态框
function addPmcGradeModel() {
    const trData = {
        Level: '',
        Order: '',
        Remark: ''
    }
    const tableConfig = _tablesConfig(false, [trData]);
    const tableSet = _tableSet();
    tableConfig.columns = tableConfig.columns.concat([
        { data: 'Level', title: '等级', render: tableSet.addInput.bind(null, 'level', 'auto') },
        { data: 'Order', title: '顺序', render: tableSet.addInput.bind(null, 'order', 'auto') },
        { data: 'Remark', title: '备注', render: tableSet.addInput.bind(null, 'remark', '100%') },
        { data: null, title: '删除', render: tableSet.delBtn }
    ]);
    $('#addPmcGradeList').DataTable(tableConfig);
    $('#addPmcGradeListBtn').off('click').on('click', () => addDataTableTr('#addPmcGradeList', trData));
    $('#addPmcGradeModel').modal('show');
}

//添加等级
function addPmcGrade() {
    addTableRow('#addPmcGradeList', getPmcGradeTrInfo, 5512, () => {
        $('#addPmcGradeModel').modal('hide');
        getPmcGradeList();
        getPmcPersonList();
    });
}

//删除等级
function delPmcGrade() {
    delTableRow(_pmcGradeTrs, 5513, () => {
        getPmcGradeList();
        getPmcPersonList();
    });
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
        const tableConfig = _tablesConfig(true, data.datas);
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
        const tableConfig = _tablesConfig(false, data.datas);
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
        const d = e.datas[0];
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
    myPromise(5060, { qId: planId }, true).then(e => $('#addFlowCardProcessCodeSelect').html(getPlanToProcessCodeOps(e.datas[0])).trigger('change'));
}

//添加流程卡弹窗
function addFlowCardModel() {
    const taskOrderFn = myPromise(5090);
    const personFn = myPromise(5000);
    Promise.all([taskOrderFn, personFn]).then(result => {
        const taskOrder = result[0].datas;
        $('#addFlowCardTaskOrderSelect').html(setOptions(taskOrder, 'TaskOrder'));
        $('#addFlowCardPersonSelect').html(setOptions(result[1].datas, 'Account'));
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
        if (isStrEmptyOrUndefined(processorId)) return layer.msg('请选择加工人');
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