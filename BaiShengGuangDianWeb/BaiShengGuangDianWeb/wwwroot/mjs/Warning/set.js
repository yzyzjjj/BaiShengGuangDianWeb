function pageReady() {
    $('.ms2').select2();
    $('#deviceSelect').select2({
        allowClear: true,
        placeholder: '请选择',
        multiple: true,
        width: '100%'
    });
    const getWarnSetFn = new Promise(resolve => getWarnSet(resolve));
    const getClassFn = new Promise(resolve => getClass(resolve));
    const getScriptDeviceFn = new Promise(resolve => getScript(resolve));
    Promise.all([getWarnSetFn, getClassFn, getScriptDeviceFn]).then(result => {
        if (result[0].length) {
            showAppointWarnSet(result[0][0]);
        } else {
            getDevice();
            getScriptItem();
        }
    });
    $('#deviceWarn').on('select2:select', () => getAppointWarnSet());
    $('#scriptSelect').on('select2:select', () => {
        getDevice();
        getScriptItem();
    });
    $('#deviceSelect').on('select2:select', function () {
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
    $('#npcVarList,#npcInsList,#npcOutList').on('focus', '.zeroNum', function () {
        if ($(this).val() == 0) {
            $(this).val('');
        }
    });
    $('#npcVarList,#npcInsList,#npcOutList').on('blur', '.zeroNum', function () {
        if (isStrEmptyOrUndefined($(this).val())) {
            $(this).val(0);
        }
    });
}

//获取预警设置
function getWarnSet(resolve) {
    const dataType = $('#navUl li.active').val();
    const type = dataType === 1 ? 1 : 2;
    ajaxPost('/Relay/Post', { opType: 1200, opData: JSON.stringify({ first: true, dataType, type }) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        $('#deviceWarn').empty().append(setOptions(rData, 'Name'));
        resolve(rData);
    });
}

//获取指定预警设置
function getAppointWarnSet() {
    _scriptTrData = [];
    const qId = $('#deviceWarn').val();
    if (isStrEmptyOrUndefined(qId)) {
        layer.msg('请选择预警名');
        return;
    }
    const dataType = $('#navUl li.active').val();
    const type = dataType === 1 ? 1 : 2;
    ajaxPost('/Relay/Post', { opType: 1200, opData: JSON.stringify({ qId, first: true, dataType, type }) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas[0];
        showAppointWarnSet(rData);
    });
}

//显示预警信息
function showAppointWarnSet(rData) {
    setThreeTable(rData.Items, false);
    $('#warnName').val(rData.Name);
    $('#isStart').iCheck(rData.Enable ? 'check' : 'uncheck');
    $('#deviceType').val(rData.ClassId).trigger('change');
    $('#scriptSelect').val(rData.ScriptId).trigger('change');
    new Promise(resolve => getDevice(resolve)).then(() => $('#deviceSelect').val(rData.DeviceList).trigger('change'));
}

//重置
function resetTable() {
    $('#deviceWarn').val() ? getAppointWarnSet() : getScriptItem();
}

//获取分类
function getClass(resolve) {
    ajaxPost('/Relay/Post', { opType: 168 }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#deviceType').empty().append(setOptions(ret.datas, 'Class'));
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
        resolve();
    });
}

//获取设备
function getDevice(resolve) {
    const scriptId = $('#scriptSelect').val();
    if (isStrEmptyOrUndefined(scriptId)) {
        layer.msg('请选择脚本');
        return;
    }
    ajaxPost('/Relay/Post', { opType: 100, opData: JSON.stringify({ scriptId }) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        let all = '';
        if (rData.length > 1) {
            all = '<option value="0">全部</option>';
        }
        $('#deviceSelect').empty().append(`${all}${setOptions(rData, 'Code')}`);
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
    const dataType = $('#navUl li.active').val();
    ajaxPost('/Relay/Post', { opType: 1204, opData: JSON.stringify({ sId, isNew: true, dataType }) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        setThreeTable(rData, true);
    });
}

//变量/输出/输入表格设置
function setThreeTable(arr, isNew) {
    _scriptTrData = [];
    const scriptItem = { 1: [], 2: [], 3: [] };
    for (let i = 0, len = arr.length; i < len; i++) {
        const d = arr[i];
        scriptItem[d.VariableTypeId].push(d);
    }
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
        let text = '';
        if (!isNew) {
            text = `<span class="textOn">${v}</span>`;
            if (n === 2 && !d.Condition2) {
                text = '';
            }
        }
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
    const tablesConfig = {
        dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
        destroy: true,
        paging: true,
        searching: true,
        language: oLanguage,
        aaSorting: [[1, 'asc']],
        aLengthMenu: [20, 40, 60],
        iDisplayLength: 20,
        columns: [
            { data: null, title: '选择', render: d => `<input type="checkbox" class="icb_minimal isEnable" value=${d.Id} dictionary=${d.DictionaryId}>`, orderable: false },
            { data: null, title: '序号', render: (a, b, c, d) => ++d.row },
            { data: 'VariableName', title: '名称' },
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
                    _scriptTrData.push(domTr);
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
                    _scriptTrData.splice(_scriptTrData.indexOf(domTr), 1);
                    tr.find('.textIn').addClass('hidden').siblings('.textOn').removeClass('hidden');
                }
            });
        }
    };
    //变量
    tablesConfig.data = scriptItem[1];
    $('#npcVarList').DataTable(tablesConfig);
    //输入
    tablesConfig.data = scriptItem[2];
    $('#npcInsList').DataTable(tablesConfig);
    //输出
    tablesConfig.data = scriptItem[3];
    $('#npcOutList').DataTable(tablesConfig);
}

let _scriptTrData = null;
//添加保存设备预警
function addUpDeviceWarning(isUp) {
    const name = $('#warnName').val().trim();
    if (isStrEmptyOrUndefined(name)) {
        layer.msg('请选择脚本');
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
    deviceIds = deviceIds.toString();
    const dataType = $('#navUl li.active').val();
    const type = dataType === 1 ? 1 : 2;
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
    if (!_scriptTrData.length && !isUp) {
        layer.msg('请设置变量/输入/输出，至少一项');
        return;
    }
    const items = [];
    const dataTypeItem = $('#navChildUl li.active').val();
    for (let i = 0, len = _scriptTrData.length; i < len; i++) {
        const tr = $(_scriptTrData[i]);
        const xh = tr.find('td:nth-child(2)').text();
        const frequency = tr.find('.frequency').val();
        const interval = tr.find('.interval').val();
        const count = tr.find('.count').val();
        if (frequency == 0 || count == 0) {
            layer.msg(`序号${xh}：出现频率数值都必须大于0`);
            return;
        }
        const condition1 = tr.find('.condition1').val();
        const value1 = tr.find('.value1').val();
        const logic = tr.find('.logic').val();
        const condition2 = tr.find('.condition2').val();
        if (condition2 != 0 && logic == 0) {
            layer.msg(`序号${xh}：两个条件必须选择逻辑`);
            return;
        }
        const value2 = tr.find('.value2').val();
        const checkBox = tr.find('.isEnable');
        const dictionaryId = checkBox.attr('dictionary');
        const id = isUp ? checkBox.val() : 0;
        items.push({
            DataType: dataTypeItem,
            Frequency: frequency,
            Interval: interval,
            Count: count,
            Condition1: condition1,
            Value1: value1,
            Logic: logic,
            Condition2: condition2,
            Value2: value2,
            DictionaryId: dictionaryId >> 0,
            Id: id >> 0
        });
    }
    items.length && (list.Items = items);
    const doSth = () => {
        const data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost('/Relay/Post', data, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                new Promise(resolve => getWarnSet(resolve)).then(result => {
                    if (isUp) {
                        $('#deviceWarn').val(list.Id).trigger('change');
                        getAppointWarnSet();
                    } else {
                        showAppointWarnSet(result[0]);
                    }
                });
            }
        });
    }
    showConfirm(message, doSth);
}