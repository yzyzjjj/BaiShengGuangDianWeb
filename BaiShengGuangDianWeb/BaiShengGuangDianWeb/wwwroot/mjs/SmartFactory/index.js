function pageReady() {
    //getPersonList();
    //getDeviceList();
    //getProcessCodeList();
    //getProcessOpList();
    //getPlanList();
    //getWorkOrderList();
    getTaskOrderList();
    $('#addProcessCodeBody').on('click', '.upTr', function () {
        const tr = $(this).parents('tr');
        const upTr = tr.prev();
        upTr.before(tr);
        setAddProcessOpList();
    });
    $('#addProcessCodeBody').on('click', '.delBtn', function () {
        $(this).parents('tr').remove();
        setAddProcessOpList();
    });
    $('#planProcessCodeList').on('change', '.process-code-select', function () {
        const id = $(this).val();
        const d = _planProcessCodeInfo[id];
        $(this).siblings('.process-code-category').text(`类型：${d.Category}`);
        const processId = d.List.split(',');
        const processes = d.Processes.split(',');
        const arr = processId.map((item, i) => ({ ProcessId: item, Process: processes[i], ProcessNumber: 0, ProcessCodeId: d.Id }));
        const tableConfig = _tablesConfig(false);
        const tableSet = _tableSet();
        tableConfig.data = arr;
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
            const tableConfig = _tablesConfig(true, 0);
            const tableSet = _tableSet();
            tableConfig.data = data;
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
        const tableConfig = _tablesConfig(false);
        const tableSet = _tableSet();
        tableConfig.data = this.ProcessData ? this.ProcessData.map(item => ({
            addPressM: item[0],
            addPressS: item[1],
            workM: item[2],
            workS: item[3],
            setPress: item[4],
            rotate: item[5]
        })) : [];
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'addPressM', title: '加压时间（M）', render: tableSet.addInput.bind(null, 'addPressM', 'auto') },
            { data: 'addPressS', title: '加压时间（S）', render: tableSet.addInput.bind(null, 'addPressS', 'auto') },
            { data: 'workM', title: '工序时间（M）', render: tableSet.addInput.bind(null, 'workM', 'auto') },
            { data: 'workS', title: '工序时间（S）', render: tableSet.addInput.bind(null, 'workS', 'auto') },
            { data: 'setPress', title: '设定压力（Kg）', render: tableSet.addInput.bind(null, 'setPress', 'auto') },
            { data: 'rotate', title: '下盘速度（rpm）', render: tableSet.addInput.bind(null, 'rotate', 'auto') },
            { data: null, title: '删除', render: tableSet.delBtn }
        ]);
        $('#setCraftList').DataTable(tableConfig);
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
    $('#addCraftTrBtn').on('click', () => {
        const trData = {
            addPressM: 0,
            addPressS: 0,
            workM: 0,
            workS: 0,
            setPress: 0,
            rotate: 0
        }
        addDataTableTr('#setCraftList', trData);
    });
    $('#setCraftList,#planProcessCodeList').on('input', 'input', function () {
        onInput(this, 3, 0);
    });
    $('#setCraftList,#planProcessCodeList').on('focus', 'input', function () {
        if ($(this).val().trim() == 0) $(this).val('');
    });
    $('#setCraftList,#planProcessCodeList').on('blur', 'input', function () {
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
}

//异步获取数据
function myPromise(opType, opData, isParGet = false) {
    const data = { opType };
    opData && (data.opData = JSON.stringify(opData));
    isParGet && (opData = !opData);
    return new Promise(resolve => {
        ajaxPost('/Relay/Post', data, ret => {
            if (opData) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) resolve();
            } else {
                if (ret.errno != 0) return layer.msg(ret.errmsg);
                resolve(ret.datas);
            }
        });
    });
}

//dataTable基本参数
function _tablesConfig(isList, order = 1) {
    return {
        dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
        bAutoWidth: false,
        destroy: true,
        paging: true,
        searching: isList,
        ordering: isList,
        aaSorting: [[order, 'asc']],
        aLengthMenu: [20, 40, 60],
        iDisplayLength: 20,
        language: oLanguage,
        columns: [
            { data: null, title: '序号', render: _tableSet().order, sWidth: '80px' }
        ]
    }
}

//dataTable渲染标签
function _tableSet() {
    return {
        order: (a, b, c, d) => d.row + 1,
        isEnable: d => `<input type="checkbox" class="icb_minimal isEnable" value="${d.Id}">`,
        input: (className, d) => `<span class="textOn">${d}</span><input type="text" class="form-control text-center textIn ${className} hidden" maxlength="20" style="min-width:120px;width:${className === 'remark' ? '100%' : 'auto'}" value=${d}>`,
        addInput: (className, width, d) => `<input type="text" class="form-control text-center ${className}" style="min-width:120px;width:${width}", value="${d}">`,
        select: (ops, className, d) => `<span class="textOn">${d}</span><select class="form-control hidden textIn ${className}" style="min-width:120px">${ops}</select>`,
        addSelect: (ops, className) => `<select class="form-control ${className}" style="min-width:120px">${ops}</select>`,
        updateBtn: (fn, d) => `<button class="btn btn-success btn-xs" onclick="${fn}.call(this)" value="${d}">修改</button>`,
        delBtn: () => `<button class="btn btn-danger btn-xs" onclick="delDataTableTr.call(this)"><i class="fa fa-minus"></i></button>`,
        addBtn: fn => `<button class="btn btn-success btn-xs" onclick="${fn}.call(this)"><i class="fa fa-plus"></i></button>`,
        setBtn: () => '<button class="btn btn-primary btn-sm set-btn">设置</button>',
        detailBtn: (fn, d) => `<button class="btn btn-info btn-sm" onclick="${fn}.call(this)" value="${d}">查看</button>`,
        processDetail: d => d.replace(/,/g, ' > '),
        isRework: () => '<select class="form-control isRework" style="width:100px"><option value="0">否</option><option value="1">是</option></select>',
        day: (className, d) => `<span class="textOn">${d.split(' ')[0]}</span><input type="text" class="pointer textIn hidden form_date form-control text-center ${className}" style="min-width: 100px">`,
        addDay: (className, d) => `<input type="text" class="pointer form_date form-control text-center ${className}" value="${d.split(' ')[0]}" style="min-width: 100px">`
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
    const arr = [];
    trs.forEach(item => {
        const el = $(item);
        arr.push(el.find('.isEnable').val() >> 0);
    });
    myPromise(opType, { ids: arr.join() }).then(callback);
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

//----------------------------------------人员管理----------------------------------------------------
let _personTrs = null;

//获取人员列表
function getPersonList() {
    myPromise(5000).then(data => {
        _personTrs = [];
        const tableConfig = _tablesConfig(true);
        const tableSet = _tableSet();
        tableConfig.data = data;
        tableConfig.columns.unshift({ data: null, title: '', render: tableSet.isEnable, orderable: false, sWidth: '80px' });
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
    const tableConfig = _tablesConfig(false);
    const tableSet = _tableSet();
    tableConfig.data = [trData];
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
        const tableConfig = _tablesConfig(true);
        const tableSet = _tableSet();
        tableConfig.data = result[1];
        tableConfig.columns.unshift({ data: null, title: '', render: tableSet.isEnable, orderable: false, sWidth: '80px' });
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
        const tableConfig = _tablesConfig(false);
        const tableSet = _tableSet();
        tableConfig.data = [trData];
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
        const tableConfig = _tablesConfig(true);
        const tableSet = _tableSet();
        tableConfig.data = data;
        tableConfig.columns.unshift({ data: null, title: '', render: tableSet.isEnable, orderable: false, sWidth: '80px' });
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
    const tableConfig = _tablesConfig(false);
    const tableSet = _tableSet();
    tableConfig.data = [trData];
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

let _processCodeTrs = null;

//获取流程编号列表
function getProcessCodeList() {
    myPromise(5040).then(data => {
        _processCodeTrs = [];
        const tableConfig = _tablesConfig(true);
        const tableSet = _tableSet();
        tableConfig.data = data;
        tableConfig.columns.unshift({ data: null, title: '', render: tableSet.isEnable, orderable: false, sWidth: '80px' });
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
        const tableConfig = _tablesConfig(true);
        const tableSet = _tableSet();
        tableConfig.data = result[1];
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
function addProcessOpToCode() {
    const tr = $(this).parents('tr')[0];
    const d = $('#addProcessCodeOpList').DataTable().row(tr).data();
    const processCodeTr = `<tr list="${d.Id}">
                             <td class="num"></td>
                             <td>${d.Process}</td>
                             <td><span class="glyphicon glyphicon-arrow-up pointer text-green upTr" aria-hidden="true" title="上移"></span></td>
                             <td><button class="btn btn-danger btn-xs delBtn"><i class="fa fa-minus"></i></button></td>
                           </tr>`;
    $('#addProcessCodeBody').append(processCodeTr);
    setAddProcessOpList();
}

//流程表格设置
function setAddProcessOpList() {
    const trs = $('#addProcessCodeBody tr');
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
        const listId = d.List.split(',');
        const processes = d.Processes.split(',');
        const trs = listId.reduce((a, b, i) => `${a}<tr list="${b}">
                             <td class="num"></td>
                             <td>${processes[i]}</td>
                             <td><span class="glyphicon glyphicon-arrow-up pointer text-green upTr" aria-hidden="true" title="上移"></span></td>
                             <td><button class="btn btn-danger btn-xs delBtn"><i class="fa fa-minus"></i></button></td>
                           </tr>`, '');
        $('#addProcessCodeBody').append(trs);
        $('#addEditTitle').text('修改流程编号');
        $('#addEditBtn').text('修改').val(d.Id).off('click').on('click', addUpProcessCode.bind(null, false));
        setAddProcessOpList();
    });
}

//删除流程编号
function delProcessCode() {
    delTableRow(_processCodeTrs, 5043, getProcessCodeList);
}

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
        const tableConfig = _tablesConfig(true);
        const tableSet = _tableSet();
        tableConfig.data = data;
        tableConfig.columns.unshift({ data: null, title: '', render: tableSet.isEnable, orderable: false, sWidth: '80px' });
        tableConfig.columns = tableConfig.columns.concat([
            { data: 'Category', title: '类型', render: tableSet.input.bind(null, 'category') },
            { data: 'Remark', title: '备注', render: tableSet.input.bind(null, 'remark') }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, _processCodeCategoryTrs, (tr, d) => {
                tr.find('.category').val(d.Category);
                tr.find('.remark').val(d.Remark);
            });
        }
        $('#processCodeCategoryList').DataTable(tableConfig);
    });
}

//流程编号类型列表tr数据获取
function getProcessCodeCategoryTrInfo(el, isAdd) {
    const category = el.find('.category').val().trim();
    if (isStrEmptyOrUndefined(category)) return void layer.msg('流程编号类型不能为空');
    const list = {
        Category: category,
        Remark: el.find('.remark').val()
    }
    isAdd || (list.Id = el.find('.isEnable').val() >> 0);
    return list;
}

//修改流程编号类型
function updateProcessCodeCategory() {
    updateTableRow(_processCodeCategoryTrs, getProcessCodeCategoryTrInfo, 5051, getProcessCodeCategoryList);
}

//添加流程编号类型模态框
function addProcessCodeCategoryModel() {
    const trData = {
        Category: '',
        Remark: ''
    }
    const tableConfig = _tablesConfig(false);
    const tableSet = _tableSet();
    tableConfig.data = [trData];
    tableConfig.columns = tableConfig.columns.concat([
        { data: 'Category', title: '类型', render: tableSet.addInput.bind(null, 'category', 'auto') },
        { data: 'Remark', title: '备注', render: tableSet.addInput.bind(null, 'remark', '100%') },
        { data: null, title: '删除', render: tableSet.delBtn }
    ]);
    $('#addProcessCodeCategoryList').DataTable(tableConfig);
    $('#addProcessCodeCategoryListBtn').off('click').on('click', () => addDataTableTr('#addProcessCodeCategoryList', trData));
    $('#addProcessCodeCategoryModel').modal('show');
}

//添加流程编号类型
function addProcessCodeCategory() {
    addTableRow('#addProcessCodeCategoryList', getProcessCodeCategoryTrInfo, 5052, () => {
        $('#addProcessCodeCategoryModel').modal('hide');
        getProcessCodeCategoryList();
    });
}

//删除流程编号类型
function delProcessCodeCategory() {
    delTableRow(_processCodeCategoryTrs, 5053, getProcessCodeCategoryList);
}

let _processOpTrs = null;

//获取流程设置列表
function getProcessOpList() {
    const deviceTypeFn = myPromise(5020);
    const processOpFn = myPromise(5030);
    Promise.all([deviceTypeFn, processOpFn]).then(result => {
        _processOpTrs = [];
        const tableConfig = _tablesConfig(true);
        const tableSet = _tableSet();
        tableConfig.data = result[1];
        tableConfig.columns.unshift({ data: null, title: '', render: tableSet.isEnable, orderable: false, sWidth: '80px' });
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
        const tableConfig = _tablesConfig(false);
        const tableSet = _tableSet();
        tableConfig.data = [trData];
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
        const tableConfig = _tablesConfig(true);
        const tableSet = _tableSet();
        tableConfig.data = data;
        tableConfig.columns.unshift({ data: null, title: '', render: tableSet.isEnable, orderable: false, sWidth: '80px' });
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

//流程编号选择禁用
function disabledProcessCode() {
    const ids = [];
    const selects = $('#planProcessCodeList .process-code-select');
    const selectOps = selects.find('option');
    selectOps.prop('disabled', false);
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
                const tableConfig = _tablesConfig(false);
                const tableSet = _tableSet();
                tableConfig.data = processCodeObj[key];
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

//----------------------------------------工单管理----------------------------------------------------

let _workOrderTrs = null;

//获取工单列表
function getWorkOrderList() {
    myPromise(5070).then(data => {
        _workOrderTrs = [];
        const tableConfig = _tablesConfig(true);
        const tableSet = _tableSet();
        tableConfig.data = data;
        tableConfig.columns.unshift({ data: null, title: '', render: tableSet.isEnable, orderable: false, sWidth: '80px' });
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
    const tableConfig = _tablesConfig(false);
    const tableSet = _tableSet();
    tableConfig.data = [trData];
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
        const tableConfig = _tablesConfig(true);
        const tableSet = _tableSet();
        tableConfig.data = result[2];
        tableConfig.columns.unshift({ data: null, title: '', render: tableSet.isEnable, orderable: false, sWidth: '80px' });
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
        const tableConfig = _tablesConfig(false);
        const tableSet = _tableSet();
        tableConfig.data = [trData];
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
