function pageReady() {
    $(".sidebar-mini").addClass("sidebar-collapse");
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
    $('#productionWarn').on('select2:select', () => getProductionWarnSet());

    $("#devBox .dTable").on("change", ".interval", function () {
        var interval = $(this).val();
        $(this).siblings().removeClass("hidden");
        if (interval == 1) {
            $(this).siblings().addClass("hidden");
        }
    });
}

//获取预警设置
function getWarnSet(resolve, el, dataType) {
    const type = $('#typeBox li.active').val();
    ajaxPost('/Relay/Post', {
        opType: 1200,
        opData: JSON.stringify({ first: true, dataType, type })
    }, ret => {
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
    _trData[device] = [];
    const qId = $('#deviceWarn').val();
    if (isStrEmptyOrUndefined(qId)) {
        layer.msg('请选择预警名');
        return;
    }
    getAppointWarnSet(qId, data => showAppointWarnSet(data));
}

//获取生产数据预警设置
function getProductionWarnSet() {
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

const device = 1;
const production = 2;
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
    setProduction(rData.Items, false);
    $('#productionWarnName').val(rData.Name);
    $('#productionIsStart').iCheck(rData.Enable ? 'check' : 'uncheck');
    $('#productionDeviceClass').val(rData.ClassId).trigger('change');
    $('#productionDeviceType').val(rData.CategoryId).trigger('change');
    new Promise(resolve => getDevice(resolve, { categoryId: rData.CategoryId }, '#productionDeviceSelect')).then(() => $('#productionDeviceSelect').val(rData.DeviceList).trigger('change'));
}

//设备数据刷新
function deviceRefreshTable() {
    $('#deviceWarn').val() && $('#deviceWarn :selected').text() == $('#warnName').val().trim() ? getDeviceWarnSet() : getScriptItem();
}

//生产数据刷新
function productionRefreshTable() {
    $('#productionWarn').val() && $('#productionWarn :selected').text() == $('#productionWarnName').val().trim() ? getProductionWarnSet() : getProductionItem();
}

//生产数据汇总重置
function productionSumRefreshTable() {
    $('#productionIsCollect').trigger('ifChanged');
}

//获取分类
function getClass(resolve) {
    ajaxPost('/Relay/Post', {
        opType: 168,
        opData: JSON.stringify({ menu: true })
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#deviceType,#productionDeviceClass').empty().append(setOptions(ret.datas, 'Class'));
        resolve();
    }, 0);
}

//获取脚本
function getScript(resolve) {
    ajaxPost('/Relay/Post', {
        opType: 113,
        opData: JSON.stringify({ menu: true })
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#scriptSelect').empty().append(setOptions(ret.datas, 'ScriptName'));
        resolve(ret.datas[0].Id);
    }, 0);
}

//获取设备类型
function getDeviceType(resolve) {
    ajaxPost('/Relay/Post', {
        opType: 140,
        opData: JSON.stringify({ menu: true })
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#productionDeviceType').empty().append(setOptions(ret.datas, 'CategoryName'));
        resolve(ret.datas[0].Id);
    }, 0);
}

//获取设备
function getDevice(resolve, opData, el) {
    ajaxPost('/Relay/Post', {
        opType: 100,
        opData: JSON.stringify(opData)
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        //let all = '';
        //if (rData.length > 1) {
        //    all = '<option value="0">全部</option>';
        //}
        $(el).html(setOptions(rData, "Code"));
        //$(el).empty().append(`${all}${setOptions(rData, 'Code')}`);
        if (resolve) {
            resolve();
        }
    }, 0);
}

//获取预警配置项
function getWarnAllItem(obj, callback) {
    ajaxPost('/Relay/Post', {
        opType: 1204,
        opData: JSON.stringify(obj)
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        callback(ret.datas);
    }, 0);
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

let _choseData = [];
let _dataTable = [];
let _trData = [];
//变量/输出/输入表格设置
function setThreeTable(arr) {
    _choseData[device] = [];
    _trData[device] = [];
    _dataTable[device] = [];
    const scriptItem = { 1: [], 2: [], 3: [] };
    const scriptTables = { 1: 'npcVarList', 2: 'npcInsList', 3: 'npcOutList' };
    //for (let i = 0, len = arr.length; i < len; i++) {
    //    const d = arr[i];
    //    scriptItem[d.VariableTypeId].push(d);
    //}
    for (var d in scriptItem) {
        scriptItem[d] = arr.filter(a => a.VariableTypeId == d);
        setDataTable(device, scriptTables[d], scriptItem[d], _trData[device]);
    }
}

//获取生产数据item
function getProductionItem() {
    getWarnAllItem({ isNew: true, dataType: 2 }, data => setProduction(data, true));
}

//生产数据
function setProduction(data) {
    _choseData[production] = [];
    _trData[production] = [];
    _dataTable[production] = [];
    setDataTable(production, 'productionList', data, _trData[production]);
}

//dadaTable设置
function setDataTable(type, el, data, arr) {
    let idCol = "";
    if (type == device)
        idCol = "DictionaryId";
    else if (type == production)
        idCol = "ItemType";
    const table = el;
    el = `#${el}`;
    if (_dataTable[type][table]) {
        updateTable(_dataTable[type][table], data);
    } else {
        const frequencyFn = d => {
            const arr = ['不设置', '每次', '秒', '分', '小时', '天', '周', '月', '年'];
            const frequency = d.Frequency;
            const count = d.Count;
            return `<span class="textOn"></span>
                    <div class="flexStyle hidden textIn" style="justify-content:center">
                        <input class="form-control text-center no-padding zeroNum frequency" style="min-width:50px;width:50px" oninput="onInput(this, 5, 0)" value=${frequency}>
                        <select class="form-control interval" style="min-width:70px">
                            ${(arr.reduce((a, b, c) => a + (c != 0 ? `<option value="${c}">${b}</option>` : ``), ''))}
                        </select>
                        <span class="flexStyle">
                            <input class="form-control text-center no-padding zeroNum count" style="min-width:50px;width:50px;" oninput="onInput(this, 4, 0)" value=${count}>
                            <label style="margin:0 0 0 3px">次</label>
                        </span>
                    </div>`;
        };
        const condition = (n, d) => {
            const arr = ['不设置', '大于', '大于等于', '小于', '小于等于'];
            return `<span class="textOn"></span>
                    <select class="form-control hidden textIn condition${n}" style="min-width:80px;">
                        ${(arr.reduce((a, b, c) => a + (n == 1 && c == 0 ? `` : `<option value="${c}">${b}</option>`), ''))}
                    </select>`;
        };
        const value = (n, d) => {
            const v = d[`Value${n}`];
            return `<span class="textOn"></span>
                    <input class="form-control text-center textIn zeroNum hidden value${n}" style="min-width:60px;" oninput="onInput(this, 6, 4)" value=${v}>`;
        };
        const logic = d => {
            const arr = ['不设置', '并且', '或者'];
            return `<span class="textOn"></span>
                    <select class="form-control hidden textIn logic" style="min-width:70px">
                        ${(arr.reduce((a, b, c) => `${a}<option value="${c}">${b}</option>`, ''))}
                    </select>`;
        };
        const tableConfig = dataTableConfig(data, true);
        tableConfig.addColumns([
            { data: 'Item', title: '名称' },
            { data: null, title: '出现频率', render: frequencyFn },
            { data: 'Condition1', title: '条件1', render: condition.bind(null, 1) },
            { data: null, title: '数值', render: value.bind(null, 1) },
            { data: 'Logic', title: '逻辑', render: logic },
            { data: 'Condition2', title: '条件2', render: condition.bind(null, 2) },
            { data: null, title: '数值', render: value.bind(null, 2) }
        ]);
        tableConfig.drawCallback = function () {
            initCheckboxAddEvent.call(this, arr,
                (tr, d) => {
                    tr.find('.frequency').val(d.Frequency);
                    var interval = d.Interval || 1;
                    tr.find('.interval').val(interval);
                    tr.find('.count').val(d.Count);
                    tr.find('.condition1').val(d.Condition1 || 1);
                    tr.find('.value1').val(d.Value1);
                    tr.find('.logic').val(d.Logic);
                    tr.find('.condition2').val(d.Condition2);
                    tr.find('.value2').val(d.Value2);
                    if (interval == 1) {
                        tr.find('.interval').siblings().addClass("hidden");
                    } else {
                        tr.siblings().removeClass("hidden");
                    }
                    _choseData[type].push(d);
                },
                (tr, d) => {
                    removeArray(_choseData[type], idCol, d[idCol]);
                }, false, "Checked");

            initInputChangeEvent.call(this,
                (tr, d) => {
                    const fre = $(tr).find(".frequency").val() >> 0;
                    const int = $(tr).find(".interval").val() >> 0;
                    const c = $(tr).find(".count").val() >> 0;
                    const c1 = $(tr).find(".condition1").val() >> 0;
                    const v1 = $(tr).find(".value1").val();
                    const l = $(tr).find(".logic").val() >> 0;
                    const c2 = $(tr).find(".condition2").val() >> 0;
                    const v2 = $(tr).find(".value2").val();
                    _choseData[type].length > 0 &&
                        _choseData[type].every(vv => {
                            if (vv[idCol] == d[idCol]) {
                                vv.Frequency = fre;
                                vv.Interval = int;
                                vv.Count = c;
                                vv.Condition1 = c1;
                                vv.Value1 = v1;
                                vv.Logic = l;
                                vv.Condition2 = c2;
                                vv.Value2 = v2;
                                vv.Id = d.Id;
                                return false;
                            }
                            return true;
                        });
                });
        }
        tableConfig.createdRow = function (tr, d) {
            const t = d.Id > 0;
            t && _choseData[type].push(d);
            $(tr).find('.isEnable').iCheck((t ? 'check' : 'uncheck'));
            t && $(tr).find(".textOn").text("").addClass("hidden").siblings(".textIn").removeClass("hidden");
            t && $(tr).find('.frequency').val(d.Frequency);
            t && $(tr).find('.interval').val(d.Interval || 1);
            t && $(tr).find('.count').val(d.Count);
            t && $(tr).find('.condition1').val(d.Condition1 || 1);
            t && $(tr).find('.value1').val(d.Value1);
            t && $(tr).find('.logic').val(d.Logic);
            t && $(tr).find('.condition2').val(d.Condition2);
            t && $(tr).find('.value2').val(d.Value2);
            $(this).siblings().removeClass("hidden");
            if (d.Interval == 1) {
                $(tr).find('.interval').siblings().addClass("hidden");
            }
        }
        _dataTable[type][table] = $(el).DataTable(tableConfig);
    }
}

//保存添加
function addUpWarn(isUp) {
    const dataType = $('#navUl li.active').val();
    const arr = [addUpDeviceWarning, addUpProductionWarning];
    arr[dataType - 1](isUp, dataType);
}

//现有items获取并验证
function getItemFn(from, target, n) {
    for (let i = 0, len = from.length; i < len; i++) {
        const d = from[i];
        const xh = d.XvHao;
        const frequency = d.Frequency;
        const interval = d.Interval;
        const count = d.Count;
        if (interval != 1 && (frequency == 0 || count == 0)) {
            layer.msg(`序号${xh}：出现频率次数都必须大于0`);
            return false;
        }
        const condition1 = d.Condition1;
        const logic = d.Logic;
        const condition2 = d.Condition2;
        if (logic == 0 && condition1 != 0 && condition2 != 0) {
            layer.msg(`序号${xh}：两个条件时必须选择逻辑`);
            return false;
        }
        if (logic != 0 && (condition1 == 0 || condition2 == 0)) {
            layer.msg(`序号${xh}：选择逻辑时必须有两个条件`);
            return false;
        }
        const obj = {
            Id: d.Id,
            Frequency: d.Frequency,
            Interval: d.Interval,
            Count: d.Count,
            Condition1: d.Condition1,
            Value1: d.Value1,
            Logic: d.Logic,
            Condition2: d.Condition2,
            Value2: d.Value2
        };

        switch (n) {
            case device:
                obj.DictionaryId = d.DictionaryId;
                break;
            case production:
                obj.Item = d.Item;
                obj.ItemType = d.ItemType;
                break;
        }
        target.push(obj);
    }
    return true;
}

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
        WarningType: type,
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
    if (!_choseData[device].length) {
        return;
    }
    const items = [];
    if (!getItemFn(_choseData[device], items, device))
        return;
    list.Items = items;
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
    const classId = $('#productionDeviceClass').val();
    const isEnable = $('#productionIsStart').is(':checked');
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
    const list = {
        WarningType: type,
        DataType: dataType,
        Name: name,
        Enable: isEnable,
        ClassId: classId,
        CategoryId: deviceTypeId,
        DeviceIds: deviceIds
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

    if (!_choseData[production].length) {
        return;
    }
    const items = [];
    if (!getItemFn(_choseData[production], items, production))
        return;
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