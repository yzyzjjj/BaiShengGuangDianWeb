function pageReady() {
    $('.ms2').select2();
    $('#cgTime').val(getDate()).datepicker('update');
    new Promise(resolve => getValuer(resolve)).then(() => {
        getGroup();
    });
    $('#groupSelect').on('select2:select', () => getProcessor());
    $('#qgProcessor,#formState,#cgProcessor').on('select2:select', () => getPurchase());
    $('#inWareList,#purchaseList').on('focus', '.zeroNum', function () {
        if ($(this).val() == 0) {
            $(this).val('');
        }
    });
    $('#inWareList,#purchaseList').on('blur', '.zeroNum', function () {
        if (isStrEmptyOrUndefined($(this).val())) {
            $(this).val(0);
        }
    });
    $('#purchaseList').on('input', '.taxTate', function () {
        onInput(this, 2, 2);
        const numArr = _purchaseDataTable.columns(5).data()[0];
        const priceArr = _purchaseDataTable.columns(6).data()[0];
        const taxTateArr = _purchaseDataTable.columns(9).nodes()[0];
        let amount = 0, tax = 0;
        for (let i = 0, len = taxTateArr.length; i < len; i++) {
            const taxTate = parseFloat($(taxTateArr[i]).find('.taxTate').val().trim() || 0) / 100;
            const price = priceArr[i];
            const num = numArr[i];
            const v = price * taxTate * num;
            tax += v;
            amount += v + price * num;
        }
        $('#purchaseAmount').text(amount ? amount.toFixed(2) : 0);
        $('#purchaseTax').text(tax ? tax.toFixed(2) : 0);
    });
    $('#purchaseList').on('paste', e => {
        if (!(e.originalEvent.clipboardData && e.originalEvent.clipboardData.items)) {
            return;
        }
        if (e.target.localName != 'input') {
            const paste = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
            const data = paste.split('\n');
            const arr = [];
            if (!_pasteData) {
                _pasteData = [];
                for (let i = 0, len = data.length; i < len; i++) {
                    let d = data[i];
                    if (!isStrEmptyOrUndefined(d)) {
                        d = d.split('	');
                        _pasteData[i] = d;
                        arr.push({
                            Code: d[0] || '',
                            Name: d[1] || '',
                            Specification: d[2] || '',
                            Unit: d[3] || '',
                            Number: d[4] || '',
                            Price: d[5] || '',
                            TaxPrice: d[6] || '',
                            TaxAmount: d[7] || '',
                            TaxTate: d[8] || 0
                        });
                    }
                }
            } else {
                for (let i = 0, len = _pasteData.length; i < len; i++) {
                    const d = _pasteData[i];
                    if (data[i]) {
                        d.push(...(data[i].split('	')));
                    } else {
                        d.push(...new Array(data[0].split('	').length).fill(''));
                    }
                    arr.push({
                        Code: d[0] || '',
                        Name: d[1] || '',
                        Specification: d[2] || '',
                        Unit: d[3] || '',
                        Number: d[4] || '',
                        Price: d[5] || '',
                        TaxPrice: d[6] || '',
                        TaxAmount: d[7] || '',
                        TaxTate: d[8] || 0
                    });
                }
            }
            setPurchaseList(arr);
            for (let i = 0, len = _pasteData.length; i < len; i++) {
                if (_pasteData[i].length > 8) {
                    _pasteData = null;
                    break;
                }
            }
        }
        e.stopPropagation();
        e.preventDefault();
    });
    $('#departmentAll').on('ifChanged', function () {
        if ($(this).is(':checked')) {
            $('#departmentItem .icb_minimal').iCheck('check');
        } else {
            if (_departmentItem.length == $('#departmentItem').children().length) {
                $('#departmentItem .icb_minimal').iCheck('uncheck');
            }
        }
    });
    $('#departmentItem').on('ifChanged', '.icb_minimal', function () {
        const el = $(this).parents('.departmentLi')[0];
        if ($(this).is(':checked')) {
            _departmentItem.push(el);
            //const name = $(el).find('.departmentText').prop('title');
            //$(el).find('.departmentName').val(name).removeClass('hidden').end().find('.departmentText').addClass('hidden');
            if (_departmentItem.length == $('#departmentItem').children().length) {
                $('#departmentAll').iCheck('check');
            }
        } else {
            _departmentItem.splice(_departmentItem.indexOf(el), 1);
            //$(el).find('.departmentName').addClass('hidden').end().find('.departmentText').removeClass('hidden');
            if (_departmentItem.length == $('#departmentItem').children().length - 1) {
                $('#departmentAll').iCheck('uncheck');
            }
        }
    });
}

var _pasteData = null;

//options设置
function setOptions(data, name) {
    const op = '<option value="{0}">{1}</option>';
    let ops = '';
    for (let i = 0, len = data.length; i < len; i++) {
        const d = data[i];
        ops += op.format(d.Id, d[name]);
    }
    return ops;
}

let _departmentItem = null;
//获取请购部门
function getGroup(group) {
    _departmentItem = [];
    const data = {};
    data.opType = 871;
    data.opData = JSON.stringify({
        menu: true
    });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const list = ret.datas;
        const checkOp = `<div class="flexStyle departmentLi">
                        <label class="flexStyle pointer">
                            <input type="checkbox" class="icb_minimal {2}" value="{0}">
                            <span class="textOverTop departmentText" style="margin-left: 5px" title="{1}">{1}</span>
                        </label>
                        <input class="form-control hidden departmentName" maxlength="20" style="flex-basis:150px;margin-left:5px">
                      </div>`;
        const selectOp = '<option value="{0}">{1}</option>';
        let checkOps = '',selectOps = '';
        for (let i = 0, len = list.length; i < len; i++) {
            const d = list[i];
            checkOps += checkOp.format(d.Id, d.Department, d.Get ? 'isget' : '');
            if (d.Get) {
                selectOps += selectOp.format(d.Id, d.Department);
            }
        }
        $('#departmentItem').empty().append(checkOps);
        $('#departmentItem .icb_minimal').iCheck({
            handle: 'checkbox',
            checkboxClass: 'icheckbox_minimal-green',
            increaseArea: '20%'
        });
        $('#departmentItem .isget').iCheck('check');
        $('#groupSelect').empty().append(selectOps);
        group ? $('#groupSelect').val(group).trigger('change') : getProcessor();
    });
}

//部门修改
function updateDepartment() {
    const list = [];
    const lis = $('#departmentItem .departmentLi');
    const group = $('#groupSelect').val();
    let flag = false;
    for (let i = 0, len = lis.length; i < len; i++) {
        const el = lis.eq(i);
        const checkEl = el.find('.icb_minimal');
        const id = checkEl.val();
        const isChecked = checkEl.is(':checked');
        if (group == id && isChecked) {
            flag = true;
        }
        list.push({
            Id: id,
            Get: isChecked,
            Department: el.find('.departmentText').prop('title')
        });
    }
    const data = {};
    data.opType = 872;
    data.opData = JSON.stringify(list);
    ajaxPost('/Relay/Post', data, ret => {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            getGroup(flag ? group : null);
        }
    });
}

//获取请购人
function getProcessor() {
    const dId = $('#groupSelect').val();
    const data = {};
    data.opType = 879;
    data.opData = JSON.stringify({ dId });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#qgProcessor').empty().append(setOptions(ret.datas, 'Member'));
        getPurchase();
    });
}

//获取核价人
function getValuer(resolve) {
    const data = {};
    data.opType = 887;
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#cgProcessor').empty().append(setOptions(ret.datas, 'Valuer'));
        resolve('success');
    });
}

//获取请购单状态
function getPurchase() {
    const dId = $('#groupSelect').val();
    if (isStrEmptyOrUndefined(dId)) {
        layer.msg('请选择请购部门');
        return;
    }
    let name = $('#qgProcessor').val();
    if (isStrEmptyOrUndefined(name)) {
        layer.msg('请选择请购人');
        return;
    }
    name = $('#qgProcessor :selected').text();
    const state = $('#formState').val();
    let valuer = $('#cgProcessor').val();
    if (isStrEmptyOrUndefined(valuer)) {
        layer.msg('请选择核价人');
        return;
    }
    valuer = $('#cgProcessor :selected').text();
    const data = {};
    data.opType = 855;
    data.opData = JSON.stringify({ dId, name, state, valuer });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        _stateDataTable = $('#stateList').DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"text-center"i><"table-flex"p>',
            destroy: true,
            paging: true,
            searching: true,
            language: oLanguage,
            data: rData,
            aaSorting: [[0, 'asc']],
            aLengthMenu: [10, 40, 60],
            iDisplayLength: 10,
            columns: [
                { data: null, title: '序号', render: (a, b, c, d) => ++d.row },
                { data: 'ErpId', title: '编号' },
                { data: 'Purchase', title: '名称' },
                { data: 'Name', title: '请购人' },
                { data: 'Valuer', title: '核价人' },
                { data: 'StateStr', title: '状态' }
            ],
            drawCallback: settings => {
                if (settings.aoData.length) {
                    const trs = $(settings.nTBody).find('tr');
                    trs.addClass('pointer').off('click').on('click', function () {
                        const trAll = settings.aoData;
                        for (let i = 0, len = trAll.length; i < len; i++) {
                            const tr = trAll[i].nTr;
                            $(tr).css('background', '');
                            if (tr == this) {
                                const d = trAll[i]._aData;
                                _Purchase = {
                                    Id: d.Id,
                                    ErpId: d.ErpId,
                                    State: d.State,
                                    isShow: [3, 4].includes(d.State)
                                };
                            }
                        }
                        $(this).css('background', '#d9edf7').siblings('tr').css('background', '');
                        getPurchaseMaterial();
                    });
                }
            }
        });
    });
}

let _stateDataTable = null;
let _Purchase = null;
//获取请购单物料
function getPurchaseMaterial() {
    _trChangeData = [];
    const data = {};
    data.opType = 863;
    data.opData = JSON.stringify({ pId: _Purchase.Id });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#inWareListSaveBtn,#finishInWareListBtn').prop('disabled', !_Purchase.isShow);
        const rData = ret.datas;
        const count = d => `<input class="form-control text-center count zeroNum" oninput="onInput(this, 8, 0)" onblur="onInputEnd(this)" onchange="inWareListChange.call(this)" style="width:80px" value=${d.Count} wid=${d.Id}>`;
        $('#inWareList').DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            destroy: true,
            paging: true,
            searching: true,
            language: oLanguage,
            data: rData,
            aaSorting: [[0, 'asc']],
            aLengthMenu: [10, 40, 60],
            iDisplayLength: 10,
            columns: [
                { data: null, title: '序号', render: (a, b, c, d) => ++d.row },
                { data: 'Code', title: '物料编码' },
                { data: 'Name', title: '物料名称' },
                { data: 'Specification', title: '规格' },
                { data: 'Unit', title: '单位' },
                { data: 'Number', title: '数量', sClass: 'text-red' },
                { data: 'Purchaser', title: '采购人' },
                { data: 'TaxPrice', title: '税后单价' },
                { data: 'TaxAmount', title: '税后总价' },
                { data: 'TaxTate', title: '税率（%)' },
                { data: 'Price', title: '税前单价' },
                { data: 'Stock', title: '已入库', sClass: 'text-red' },
                { data: null, title: '本次入库', render: count, visible: _Purchase.isShow }
            ]
        });
    });
}

let _trChangeData = null;
//请购单入库数据填写
function inWareListChange() {
    const tr = $(this).parents('tr')[0];
    if (!_trChangeData.includes(tr)) {
        _trChangeData.push(tr);
    }
}

//入库
function inWareListSave() {
    if (!_trChangeData) {
        layer.msg('请购单为空');
        return;
    }
    if (!_Purchase.isShow) {
        layer.msg('开始采购和仓库到货才能入库');
        return;
    }
    const pId = _Purchase.Id;
    const list = [];
    for (let i = 0, len = _trChangeData.length; i < len; i++) {
        const el = $(_trChangeData[i]).find('.count');
        list.push({
            Id: el.attr('wid') >> 0,
            Count: el.val() >> 0,
            PurchaseId: pId
        });
    }
    const data = {};
    data.opType = 867;
    data.opData = JSON.stringify(list);
    ajaxPost('/Relay/Post', data, ret => {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            getPurchaseMaterial();
        }
    });
}

//完成采购订单
function finishInWareList() {
    if (!_trChangeData) {
        layer.msg('请购单为空');
        return;
    }
    if (!_Purchase.isShow) {
        layer.msg('开始采购和仓库到货才能完成采购');
        return;
    }
    const doSth = function () {
        let data = {};
        data.opType = 859;
        data.opData = JSON.stringify([{ Id: _Purchase.Id }]);
        ajaxPost('/Relay/Post', data, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                data = _stateDataTable.context[0].aoData;
                for (let i = 0, len = data.length; i < len; i++) {
                    const id = data[i]._aData.Id;
                    if (id == _Purchase.Id) {
                        const tr = data[i].nTr;
                        $(tr).find('td:last').text('订单完成');
                        data[i]._aData.State = 5;
                        _Purchase.State = 5;
                        _Purchase.isShow = false;
                        getPurchaseMaterial();
                        break;
                    }
                }
            }
        });
    }
    showConfirm('完成采购订单', doSth);
}

let _purchaseDataTable = null;
//引用请购单
function citePurchaseList() {
    if (!_Purchase) {
        layer.msg('请购单为空');
        return;
    }
    const pId = _Purchase.Id;
    $('#purchaseCode').val(_Purchase.ErpId);
    const data = {};
    data.opType = 863;
    data.opData = JSON.stringify({ pId });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        setPurchaseList(ret.datas);
    });
}

//入库单
function setPurchaseList(arr) {
    const taxTate = d => `<input class="form-control text-center taxTate zeroNum" onblur="onInputEnd(this)" style="width:80px" value=${parseFloat(d) || 0}>`;
    _purchaseDataTable = $('#purchaseList').DataTable({
        dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
        destroy: true,
        paging: true,
        searching: true,
        language: oLanguage,
        data: arr,
        aaSorting: [[0, 'asc']],
        aLengthMenu: [10, 40, 60],
        iDisplayLength: 10,
        columns: [
            { data: null, title: '序号', render: (a, b, c, d) => ++d.row },
            { data: 'Code', title: '物料编码' },
            { data: 'Name', title: '物料名称' },
            { data: 'Specification', title: '规格' },
            { data: 'Unit', title: '单位' },
            { data: 'Number', title: '数量' },
            { data: 'Price', title: '税前单价' },
            { data: 'TaxPrice', title: '税后单价' },
            { data: 'TaxAmount', title: '合计' },
            { data: 'TaxTate', title: '税率（%)', render: taxTate }
        ],
        initComplete: function () {
            let amount = 0, tax = 0;
            for (let i = 0, len = arr.length; i < len; i++) {
                const d = arr[i];
                const all = parseFloat(d.TaxAmount);
                amount += all;
                tax += all - parseFloat(d.Number) * parseFloat(d.Price);
            }
            const tFoot = `<tfoot>
                                  <tr>
                                    <th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th>
                                    <th>合计：</th>
                                    <th id="purchaseAmount">${amount ? amount.toFixed(2) : 0}</th>
                                  </tr>
                                    <tr>
                                    <th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th>
                                    <th>税额：</th>
                                    <th id="purchaseTax">${tax ? tax.toFixed(2) : 0}</th>
                                  </tr>
                               </tfoot>`;
            this.find('tfoot').remove();
            this.append(tFoot);
            this.find('tfoot tr:last th').css('borderTop', 0);
        }
    });
}

//入库单重置
function resetPurchaseList() {
    $('#purchaseCode').val('');
    if (_purchaseDataTable) {
        _pasteData = null;
        setPurchaseList([]);
    }
}

//订单打印
function printPurchaseList() {
    if (!_purchaseDataTable) {
        layer.msg('入库单为空');
        return;
    }
    const thead = '<thead><tr><th>序号</th><th>物料编码</th><th>物料名称</th><th>规格</th><th>单位</th><th>数量</th><th>税前单价</th><th>税后单价</th><th>合计</th><th>税率（%)</th></tr></thead>';
    const tFoot = $('#purchaseList tfoot').prop('outerHTML');
    let tbodyTrs = '';
    const data = _purchaseDataTable.context[0].aoData;
    for (let i = 0, len = data.length; i < len; i++) {
        const d = data[i];
        const taxTate = $(d.nTr).find('.taxTate').val().trim();
        const other = d._aFilterData;
        let td = '';
        for (let j = 0, len2 = other.length - 1; j < len2; j++) {
            td += `<td>${other[j]}</td>`;
        }
        tbodyTrs += `<tr>${td}<td>${taxTate}</td></tr>`;
    }
    const table = `<table border="1" style="width:100%;text-align:center;border-collapse:collapse">${thead}<tbody>${tbodyTrs}</tbody>${tFoot}</table>`;
    const code = $('#purchaseCode').val().trim();
    const time = $('#cgTime').val().trim();
    const tableTop = `<label>订单编号：${code}</label><label style="float:right">日期：${time}</label>`;
    const printContent = `<div>${tableTop}${table}</div>`;
    printCode(printContent);
}
