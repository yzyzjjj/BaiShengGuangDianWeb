function pageReady() {
    $('.ms2').select2();
    $('#deviceSelect,#productionDeviceSelect').select2({
        allowClear: true,
        placeholder: '请选择',
        multiple: true,
        width: '100%'
    });
    const getWarnSetFn = new Promise(resolve => getWarnSet(resolve, '#deviceWarn', 1));
    const getClassFn = new Promise(resolve => getClass(resolve));
    const getScriptDeviceFn = new Promise(resolve => getScript(resolve));
    Promise.all([getWarnSetFn, getClassFn, getScriptDeviceFn]).then(result => {
        if (result[0].length) {
            showAppointWarnSet(result[0][0]);
        } else {
            getDevice(null, { scriptId: result[2] }, '#deviceSelect');
            getScriptItem();
        }
    });
    $('#deviceSelect,#productionDeviceSelect').on('select2:select', function () {
        const v = $(this).val();
        if (~v.indexOf('0')) {
            const el = $(this).find('option');
            const arr = [];
            for (let i = 0, len = el.length; i < len; i++) {
                arr.push(el.eq(i).val());
            }
            arr.splice(arr.indexOf('0'), 1);
            $(this).val(arr).trigger('change');
        }
    });
    $('#npcVarList,#npcInsList,#npcOutList,#productionList,#productionCollectList').on('focus', '.zeroNum', function () {
        if ($(this).val() == 0) {
            $(this).val('');
        }
    });
    $('#npcVarList,#npcInsList,#npcOutList,#productionList,#productionCollectList').on('blur', '.zeroNum', function () {
        if (isStrEmptyOrUndefined($(this).val())) {
            $(this).val(0);
        }
    });
    //设备数据
    $('#deviceWarn').on('select2:select', () => getDeviceWarnSet());
    $('#scriptSelect').on('select2:select', function () {
        getDevice(null, { scriptId: $(this).val() }, '#deviceSelect');
        getScriptItem();
    });
    //生产数据
    $('#productionLi').one('click', function () {
        const p1 = new Promise(resolve => getWarnSet(resolve, '#productionWarn', 2));
        const p2 = new Promise(resolve => getDeviceType(resolve));
        Promise.all([p1, p2]).then(result => {
            if (result[0].length) {
                showProductionWarnSet(result[0][0]);
            } else {
                getDevice(null, { categoryId: result[1] }, '#productionDeviceSelect');
                getProductionItem();
            }
        });
    });
    $('#productionDeviceType').on('select2:select', function () {
        getDevice(null, { categoryId: $(this).val() }, '#productionDeviceSelect');
    });
    $('#productionIsCollect').on('ifChanged', function () {
        _productionCollectTrData = [];
        if ($(this).is(':checked')) {
            $('#collectBox').removeClass('hidden');
            setDataTable('#productionCollectList', _productionCollect, !$('#productionWarn').val(), 'Item', _productionCollectTrData);
        } else {
            $('#collectBox').addClass('hidden');
        }
    });
    $('#productionWarn').on('select2:select', () => getProductionWarnSet());
}

let _productionCollectTrData = null;

//获取预警设置
function getWarnSet(resolve, el, dataType) {
    const type = $('#typeBox li.active').val();
    ajaxPost('/Relay/Post', { opType: 1200, opData: JSON.stringify({ first: true, dataType, type }) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        $(el).empty().append(setOptions(rData, 'Name'));
        resolve(rData);
    });
}

//获取设备数据预警设置
function getDeviceWarnSet() {
    _scriptTrData = [];
    const qId = $('#deviceWarn').val();
    if (isStrEmptyOrUndefined(qId)) {
        layer.msg('请选择预警名');
        return;
    }
    getAppointWarnSet(qId, data => showAppointWarnSet(data));
}

//获取生产数据预警设置
function getProductionWarnSet() {
    _productionCollect = [];
    _productionTrData = [];
    const qId = $('#productionWarn').val();
    if (isStrEmptyOrUndefined(qId)) {
        layer.msg('请选择预警名');
        return;
    }
    getAppointWarnSet(qId, data => showProductionWarnSet(data));
}

//获取指定预警设置
function getAppointWarnSet(qId, callback) {
    const type = $('#typeBox li.active').val();
    const dataType = $('#navUl li.active').val();
    ajaxPost('/Relay/Post', { opType: 1200, opData: JSON.stringify({ qId, first: true, dataType, type }) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        callback(ret.datas[0]);
    });
}

//显示设备数据预警信息
function showAppointWarnSet(rData) {
    setThreeTable(rData.Items, false);
    $('#warnName').val(rData.Name);
    $('#isStart').iCheck(rData.Enable ? 'check' : 'uncheck');
    $('#deviceType').val(rData.ClassId).trigger('change');
    $('#scriptSelect').val(rData.ScriptId).trigger('change');
    new Promise(resolve => getDevice(resolve, { scriptId: rData.ScriptId }, '#deviceSelect')).then(() => $('#deviceSelect').val(rData.DeviceList).trigger('change'));
}

//显示生产数据预警信息
function showProductionWarnSet(rData) {
    setProductionSum(rData.Items, false);
    $('#productionWarnName').val(rData.Name);
    $('#productionIsStart').iCheck(rData.Enable ? 'check' : 'uncheck');
    $('#productionIsCollect').iCheck(rData.IsSum ? 'check' : 'uncheck').trigger('ifChanged');
    $('#productionDeviceClass').val(rData.ClassId).trigger('change');
    $('#productionDeviceType').val(rData.CategoryId).trigger('change');
    new Promise(resolve => getDevice(resolve, { categoryId: rData.CategoryId }, '#productionDeviceSelect')).then(() => $('#productionDeviceSelect').val(rData.DeviceList).trigger('change'));
}

//设备数据刷新
function deviceRefreshTable() {
    $('#deviceWarn').val() ? getDeviceWarnSet() : getScriptItem();
}

//生产数据刷新
function productionRefreshTable() {
    $('#productionWarn').val() ? getProductionWarnSet() : getProductionItem();
}

//生产数据汇总重置
function productionSumRefreshTable() {
    $('#productionIsCollect').trigger('ifChanged');
}

//获取分类
function getClass(resolve) {
    ajaxPost('/Relay/Post', { opType: 168 }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#deviceType,#productionDeviceClass').empty().append(setOptions(ret.datas, 'Class'));
        resolve();
    });
}

//获取脚本
function getScript(resolve) {
    ajaxPost('/Relay/Post', { opType: 113 }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#scriptSelect').empty().append(setOptions(ret.datas, 'ScriptName'));
        resolve(ret.datas[0].Id);
    });
}

//获取设备类型
function getDeviceType(resolve) {
    ajaxPost('/Relay/Post', { opType: 140 }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#productionDeviceType').empty().append(setOptions(ret.datas, 'CategoryName'));
        resolve(ret.datas[0].Id);
    });
}

//获取设备
function getDevice(resolve, opData, el) {
    ajaxPost('/Relay/Post', { opType: 100, opData: JSON.stringify(opData) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        let all = '';
        if (rData.length > 1) {
            all = '<option value="0">全部</option>';
        }
        $(el).empty().append(`${all}${setOptions(rData, 'Code')}`);
        if (resolve) {
            resolve();
        }
    });
}

//获取脚本item
function getScriptItem() {
    const sId = $('#scriptSelect').val();
    if (isStrEmptyOrUndefined(sId)) {
        layer.msg('请选择脚本');
        return;
    }
    getWarnAllItem({ sId, isNew: true, dataType: 1 }, data => setThreeTable(data, true));
}

let _productionCollect = null;
let _productionTrData = null;
//获取生产数据item
function getProductionItem() {
    _productionCollect = [];
    _productionTrData = [];
    getWarnAllItem({ isNew: true, dataType: 2 }, data => setProductionSum(data, true));
}

//生产数据是否汇总
function setProductionSum(data, isNew) {
    _productionCollect = [];
    _productionTrData = [];
    const arr = [];
    for (let i = 0, len = data.length; i < len; i++) {
        const d = data[i];
        !d.IsSum ? arr.push(d) : _productionCollect.push(d);
    }
    setDataTable('#productionList', arr, isNew, 'Item', _productionTrData);
}

//获取预警配置项
function getWarnAllItem(obj, callback) {
    ajaxPost('/Relay/Post', { opType: 1204, opData: JSON.stringify(obj) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        callback(ret.datas);
    });
}

//dadaTable设置
function setDataTable(el, data, isNew, name, arr) {
    const frequencyFn = d => {
        const frequency = d.Frequency;
        const count = d.Count;
        let text = '';
        if (!isNew && frequency && count) {
            const arr = ['', '秒', '分', '小时', '天', '周', '月', '年'];
            text = `<span class="textOn">${frequency}${arr[d.Interval]}${count}次</span>`;
        }
        const template = `${text}<div class="flexStyle hidden textIn" style="justify-content:center">
                                <input class="form-control text-center zeroNum frequency" style="min-width:80px" oninput="onInput(this, 4, 0)" value=${frequency}>
                                <select class="form-control interval" style="min-width:70px">
                                    <option value="1">秒</option>
                                    <option value="2">分</option>
                                    <option value="3">小时</option>
                                    <option value="4">天</option>
                                    <option value="5">周</option>
                                    <option value="6">月</option>
                                    <option value="7">年</option>
                                </select>
                                <span class="flexStyle">
                                    <input class="form-control text-center zeroNum count" style="min-width:80px" oninput="onInput(this, 4, 0)" value=${count}>
                                    <label style="margin:0 0 0 3px">次</label>
                                </span>
                            </div>`;
        return template;
    };
    const condition = (n, d) => {
        let text = '';
        if (!isNew && d) {
            const arr = ['', '大于', '大于等于', '小于', '小于等于'];
            text = `<span class="textOn">${arr[d]}</span>`;
        }
        const template = `${text}<select class="form-control hidden textIn condition${n}" style="min-width:90px">
                                  ${n === 2 ? '<option value="0">不设置</option>' : ''}
                                  <option value="1">大于</option>
                                  <option value="2">大于等于</option>
                                  <option value="3">小于</option>
                                  <option value="4">小于等于</option>
                              </select>`;
        return template;
    };
    const value = (n, d) => {
        const v = d[`Value${n}`];
        const text = !isNew && !((n === 2 && !d.Condition2) || (n === 1 && !d.Condition1)) ? `<span class="textOn">${v}</span>` : '';
        return `${text}<input class="form-control text-center textIn zeroNum hidden value${n}" style="min-width:80px" oninput="onInput(this, 4, 4)" value=${v}>`;
    };
    const logic = d => {
        let text = '';
        if (!isNew && d) {
            const arr = ['', '并且', '或者'];
            text = `<span class="textOn">${arr[d]}</span>`;
        }
        const template = `${text}<select class="form-control hidden textIn logic" style="min-width:70px">
                                  <option value="0">不设置</option>
                                  <option value="1">并且</option>
                                  <option value="2">或者</option>
                              </select>`;
        return template;
    };
    $(el).DataTable({
        dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
        destroy: true,
        paging: true,
        searching: true,
        language: oLanguage,
        data: data,
        aaSorting: [[1, 'asc']],
        aLengthMenu: [20, 40, 60],
        iDisplayLength: 20,
        columns: [
            { data: null, title: '选择', render: d => `<input type="checkbox" class="icb_minimal isEnable" value=${d.Id} dictionary=${d.DictionaryId}>`, orderable: false },
            { data: null, title: '序号', render: (a, b, c, d) => ++d.row },
            { data: name, title: '名称' },
            { data: null, title: '出现频率', render: frequencyFn },
            { data: 'Condition1', title: '条件1', render: condition.bind(null, 1) },
            { data: null, title: '数值', render: value.bind(null, 1) },
            { data: 'Logic', title: '逻辑', render: logic },
            { data: 'Condition2', title: '条件2', render: condition.bind(null, 2) },
            { data: null, title: '数值', render: value.bind(null, 2) }
        ],
        drawCallback: function () {
            const dataTable = this.api();
            $(this).find('.isEnable').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_minimal-blue',
                increaseArea: '20%'
            }).on('ifChanged', function () {
                const tr = $(this).parents('tr');
                const domTr = tr[0];
                if ($(this).is(':checked')) {
                    arr.push(domTr);
                    tr.find('.textIn').removeClass('hidden').siblings('.textOn').addClass('hidden');
                    const d = dataTable.row(domTr).data();
                    tr.find('.frequency').val(d.Frequency);
                    tr.find('.interval').val(d.Interval || 1);
                    tr.find('.count').val(d.Count);
                    tr.find('.condition1').val(d.Condition1 || 1);
                    tr.find('.value1').val(d.Value1);
                    tr.find('.logic').val(d.Logic);
                    tr.find('.condition2').val(d.Condition2);
                    tr.find('.value2').val(d.Value2);
                } else {
                    arr.splice(arr.indexOf(domTr), 1);
                    tr.find('.textIn').addClass('hidden').siblings('.textOn').removeClass('hidden');
                }
            });
        }
    });
}

let _scriptTrData = null;
//变量/输出/输入表格设置
function setThreeTable(arr, isNew) {
    _scriptTrData = [];
    const scriptItem = { 1: [], 2: [], 3: [] };
    for (let i = 0, len = arr.length; i < len; i++) {
        const d = arr[i];
        scriptItem[d.VariableTypeId].push(d);
    }
    const name = 'VariableName';
    //变量
    setDataTable('#npcVarList', scriptItem[1], isNew, name, _scriptTrData);
    //输入
    setDataTable('#npcInsList', scriptItem[2], isNew, name, _scriptTrData);
    //输出
    setDataTable('#npcOutList', scriptItem[3], isNew, name, _scriptTrData);
}

//保存添加
function addUpWarn(isUp) {
    const dataType = $('#navUl li.active').val();
    const arr = [addUpDeviceWarning, addUpProductionWarning];
    arr[dataType - 1](isUp, dataType);
}


//参数items提取
function getItems(arr) {
    const items = [];
    for (let i = 0, len = arr.length; i < len; i++) {
        const tr = $(arr[i]);
        const xh = tr.find('td:nth-child(2)').text();
        const frequency = tr.find('.frequency').val();
        const interval = tr.find('.interval').val();
        const count = tr.find('.count').val();
        if (frequency == 0 || count == 0) {
            layer.msg(`序号${xh}：出现频率数值都必须大于0`);
            return false;
        }
        const condition1 = tr.find('.condition1').val();
        const value1 = tr.find('.value1').val();
        const logic = tr.find('.logic').val();
        const condition2 = tr.find('.condition2').val();
        if (condition2 != 0 && logic == 0) {
            layer.msg(`序号${xh}：两个条件必须选择逻辑`);
            return false;
        }
        const value2 = tr.find('.value2').val();
        items.push({
            Frequency: frequency,
            Interval: interval,
            Count: count,
            Condition1: condition1,
            Value1: value1,
            Logic: logic,
            Condition2: condition2,
            Value2: value2
        });
    }
    return items;
}

//现有items获取
function currentItemFn(table, arr, n, isUp, sum) {
    const checksEl = table.columns(0).nodes()[0];
    for (let i = 0, len = checksEl.length; i < len; i++) {
        const checkEl = $(checksEl[i]);
        const checkbox = checkEl.find('.isEnable');
        if (!checkbox.is(':checked') && checkbox.val() != 0) {
            const d = table.row(checkEl.parents('tr')[0]).data();
            const obj = {
                Frequency: d.Frequency,
                Interval: d.Interval,
                Count: d.Count,
                Condition1: d.Condition1,
                Value1: d.Value1,
                Logic: d.Logic,
                Condition2: d.Condition2,
                Value2: d.Value2,
                Id: isUp ? d.Id : 0
            };
            switch (n) {
                case 1:
                    obj.DictionaryId = d.DictionaryId;
                    break;
                case 2:
                    obj.Item = d.Item;
                    sum && (obj.IsSum = true);
                    break;
            }
            arr.push(obj);
        }
    }
};

//设备数据添加保存设备预警
function addUpDeviceWarning(isUp, dataType) {
    const name = $('#warnName').val().trim();
    if (isStrEmptyOrUndefined(name)) {
        layer.msg('请输入预警名');
        return;
    }
    const isEnable = $('#isStart').is(':checked');
    const classId = $('#deviceType').val();
    if (isStrEmptyOrUndefined(classId)) {
        layer.msg('请选择设备分类');
        return;
    }
    const scriptId = $('#scriptSelect').val();
    if (isStrEmptyOrUndefined(scriptId)) {
        layer.msg('请选择脚本');
        return;
    }
    let deviceIds = $('#deviceSelect').val();
    if (isStrEmptyOrUndefined(deviceIds)) {
        layer.msg('请选择设备');
        return;
    }
    deviceIds = deviceIds.join();
    const type = $('#typeBox li.active').val();
    const list = {
        Type: type,
        DataType: dataType,
        Name: name,
        Enable: isEnable,
        ClassId: classId,
        ScriptId: scriptId,
        DeviceIds: deviceIds
    }
    let opType, message;
    if (isUp) {
        const warnId = $('#deviceWarn').val();
        if (isStrEmptyOrUndefined(warnId)) {
            layer.msg('请选择预警名');
            return;
        }
        list.Id = warnId;
        opType = 1201;
        message = '保存';
    } else {
        opType = 1202;
        message = '添加';
    }
    const items = getItems(_scriptTrData);
    if (!items) {
        return;
    }
    for (let i = 0, len = _scriptTrData.length; i < len; i++) {
        const checkBox = $(_scriptTrData[i]).find('.isEnable');
        const dictionaryId = checkBox.attr('dictionary');
        const id = isUp ? checkBox.val() : 0;
        items[i].DictionaryId = dictionaryId >> 0;
        items[i].Id = id >> 0;
    }
    currentItemFn($('#npcVarList').DataTable(), items, 1, isUp);
    currentItemFn($('#npcInsList').DataTable(), items, 1, isUp);
    currentItemFn($('#npcOutList').DataTable(), items, 1, isUp);
    items.length && (list.Items = items);
    const doSth = () => {
        const data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost('/Relay/Post', data, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                new Promise(resolve => getWarnSet(resolve, '#deviceWarn', 1)).then(result => {
                    if (isUp) {
                        $('#deviceWarn').val(list.Id).trigger('change');
                        getDeviceWarnSet();
                    } else {
                        showAppointWarnSet(result[0]);
                    }
                });
            }
        });
    }
    showConfirm(message, doSth);
}

//生产数据添加
function addUpProductionWarning(isUp, dataType) {
    const name = $('#productionWarnName').val().trim();
    if (isStrEmptyOrUndefined(name)) {
        layer.msg('请输入预警名');
        return;
    }
    const isEnable = $('#productionIsStart').is(':checked');
    const classId = $('#productionDeviceClass').val();
    if (isStrEmptyOrUndefined(classId)) {
        layer.msg('请选择设备分类');
        return;
    }
    const deviceTypeId = $('#productionDeviceType').val();
    if (isStrEmptyOrUndefined(deviceTypeId)) {
        layer.msg('请选择设备类型');
        return;
    }
    let deviceIds = $('#productionDeviceSelect').val();
    if (isStrEmptyOrUndefined(deviceIds)) {
        layer.msg('请选择设备');
        return;
    }
    deviceIds = deviceIds.join();
    const type = $('#typeBox li.active').val();
    const isSum = $('#productionIsCollect').is(':checked');
    const list = {
        Type: type,
        DataType: dataType,
        Name: name,
        Enable: isEnable,
        ClassId: classId,
        CategoryId: deviceTypeId,
        DeviceIds: deviceIds,
        IsSum: isSum
    }
    let opType, message;
    if (isUp) {
        const warnId = $('#productionWarn').val();
        if (isStrEmptyOrUndefined(warnId)) {
            layer.msg('请选择预警名');
            return;
        }
        list.Id = warnId;
        opType = 1201;
        message = '保存';
    } else {
        opType = 1202;
        message = '添加';
    }
    const itemFn = (arrData, itemArr, sum) => {
        for (let i = 0, len = arrData.length; i < len; i++) {
            const tr = $(arrData[i]);
            const itemName = tr.find('td:nth-child(3)').text();
            const id = isUp ? tr.find('.isEnable').val() : 0;
            itemArr[i].Item = itemName;
            itemArr[i].Id = id >> 0;
            sum && (itemArr[i].IsSum = true);
        }
    };
    const items1 = getItems(_productionTrData);
    if (!items1) {
        return;
    }
    itemFn(_productionTrData, items1, false);
    currentItemFn($('#productionList').DataTable(), items1, 2, isUp, false);
    let items2 = [];
    if (isSum) {
        items2 = getItems(_productionCollectTrData);
        if (!items2) {
            return;
        }
        itemFn(_productionCollectTrData, items2, true);
        currentItemFn($('#productionCollectList').DataTable(), items2, 2, isUp, true);
    }
    const items = items1.concat(items2);
    items.length && (list.Items = items);
    const doSth = () => {
        const data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost('/Relay/Post', data, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                new Promise(resolve => getWarnSet(resolve, '#productionWarn', 2)).then(result => {
                    if (isUp) {
                        $('#productionWarn').val(list.Id).trigger('change');
                        getProductionWarnSet();
                    } else {
                        showProductionWarnSet(result[0]);
                    }
                });
            }
        });
    }
    showConfirm(message, doSth);
}