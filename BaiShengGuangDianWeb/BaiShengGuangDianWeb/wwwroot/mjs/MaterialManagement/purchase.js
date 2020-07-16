var _permissionList = [];
function pageReady() {
    _permissionList[589] = { uIds: ['updateDepartmentBtn'] };
    _permissionList[590] = { uIds: ['finishInWareListBtn'] };
    _permissionList[591] = { uIds: ['citePurchaseListBtn'] };
    _permissionList[592] = { uIds: ['printPurchaseListBtn'] };
    _permissionList[593] = { uIds: ['inWareListSaveBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
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
        tFootCount();
    });
    $('#purchaseList').on('focus', '.numZero', function () {
        if ($(this).text().trim() == 0) {
            $(this).text('');
        }
    });
    $('#purchaseList').on('blur', '.numZero', function () {
        if (isStrEmptyOrUndefined($(this).text().trim())) {
            $(this).text(0);
        }
    });
    $('#purchaseList').on('input', '.numZero', () => tFootCount());
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

//入库单页脚计算
function tFootCount() {
    const numArr = _purchaseDataTable.columns(5).nodes()[0].map(item => $(item).text());
    const priceArr = _purchaseDataTable.columns(6).nodes()[0].map(item => $(item).text());
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
    $('#purchaseAmount').text(amount ? parseFloat(amount.toFixed(5)) : 0);
    $('#purchaseTax').text(tax ? parseFloat(tax.toFixed(5)) : 0);
}

//paste
function pasteTable(e) {
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
                        Id: 0,
                        ItemId: 0,
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
                    Id: 0,
                    ItemId: 0,
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
}

var _pasteData = null;
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
        let checkOps = '', selectOps = '';
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
        $('#qgProcessor').empty().append(`<option value="-1">全部</option>${setOptions(ret.datas, 'Member')}`);
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
        $('#cgProcessor').empty().append(`<option value="-1">全部</option>${setOptions(ret.datas, 'Valuer')}`);
        resolve('success');
    });
}

//获取请购单状态
function getPurchase() {
    if (_inWareDataTable) {
        _inWareDataTable.destroy();
        _inWareDataTable.clear();
        _inWareDataTable = null;
        $('#inWareList').empty();
    }
    resetPurchaseList();
    $('#inWareListSaveBtn,#finishInWareListBtn,#citePurchaseListBtn').prop('disabled', true);
    const dId = $('#groupSelect').val();
    if (isStrEmptyOrUndefined(dId)) {
        layer.msg('请选择请购部门');
        return;
    }
    const list = { dId };
    const name = $('#qgProcessor').val();
    if (isStrEmptyOrUndefined(name)) {
        layer.msg('请选择请购人');
        return;
    }
    if (~name) {
        list.name = $('#qgProcessor :selected').text();
    }
    const state = $('#formState').val();
    if (~state) {
        list.state = state;
    }
    const valuer = $('#cgProcessor').val();
    if (isStrEmptyOrUndefined(valuer)) {
        layer.msg('请选择核价人');
        return;
    }
    if (~valuer) {
        list.valuer = $('#cgProcessor :selected').text();
    }
    const data = {};
    data.opType = 855;
    data.opData = JSON.stringify(list);
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        const state = d => {
            let color = '';
            switch (d.State) {
                case 1:
                    color = '#C9C9C9';
                    break;
                case 2:
                    color = '#1890FF';
                    break;
                case 3:
                    color = '#f00';
                    break;
                case 4:
                    color = '#f90';
                    break;
                case 5:
                    color = '#008000';
                    break;
            }
            return `<span style="color:${color}">${d.StateStr}</span>`;
        };
        const purchase = d => d.length > 6 ? `<span title="${d}">${d.slice(0, 6)}...</span>` : d;
        _stateDataTable = $('#stateList').DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"text-center"i><"table-flex"p>',
            bAutoWidth: false,
            destroy: true,
            paging: true,
            searching: true,
            language: oLanguage,
            data: rData,
            aaSorting: [[0, 'asc']],
            aLengthMenu: [20, 40, 60],
            iDisplayLength: 20,
            columns: [
                { data: null, title: '序号', sWidth: '20px', render: (a, b, c, d) => ++d.row },
                { data: 'ErpId', title: '编号', sWidth: '20px' },
                { data: 'Purchase', title: '名称', sWidth: '100px', render: purchase },
                { data: 'Name', title: '请购人', sWidth: '20px' },
                { data: 'Valuer', title: '核价人', sWidth: '20px' },
                { data: null, title: '状态', sWidth: '20px', render: state }
            ],
            drawCallback: function (settings) {
                if (settings.aoData.length) {
                    const trs = $(settings.nTBody).find('tr');
                    trs.addClass('pointer').off('click').on('click', function () {
                        resetPurchaseList();
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
                                $('#citePurchaseListBtn').prop('disabled', d.State != 5);
                                if (d.IsQuote) {
                                    getQuoteList(true);
                                    $('#addPurchaseListBtn').removeClass('hidden');
                                } else {
                                    $('#addPurchaseListBtn').addClass('hidden');
                                }
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

//获取入库单
function getQuoteList(isQuote) {
    const data = {};
    data.opType = 860;
    data.opData = JSON.stringify({ pId: _Purchase.Id });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        if (rData.length) {
            $('#purchaseCode').val(rData[0].Purchase);
            $('#cgTime').val(rData[0].Time.split(' ')[0]).datepicker('update');
        } else {
            $('#purchaseCode').val('');
            $('#cgTime').val(getDate()).datepicker('update');
        }
        setPurchaseList(rData, isQuote);
    });
}

//保存入库单
function updatePurchaseList() {
    if (!_purchaseDataTable) {
        layer.msg('入库单为空');
        return;
    }
    let time = $('#cgTime').val();
    if (isStrEmptyOrUndefined(time)) {
        layer.msg('请选择入库日期');
        return;
    }
    time += ` ${getTime()}`;
    if (exceedTime(time)) {
        layer.msg('入库日期大于当前时间');
        return;
    }
    const purchase = $('#purchaseCode').val().trim();
    if (isStrEmptyOrUndefined(purchase)) {
        layer.msg('订单编号不能为空');
        return;
    }
    const trs = _purchaseDataTable.rows().nodes();
    const itemArr = _purchaseDataTable.columns(0).data()[0];
    const items = [];
    for (let i = 0, len = trs.length; i < len; i++) {
        const tr = trs[i];
        const tds = $(tr).find('td');
        const d = itemArr[i];
        const xh = i + 1;
        const name = tds.eq(2).text().trim();
        if (isStrEmptyOrUndefined(name)) {
            layer.msg(`序列${xh}：物料名称不能为空`);
            return;
        }
        const specification = tds.eq(3).text().trim();
        if (isStrEmptyOrUndefined(specification)) {
            layer.msg(`序列${xh}：规格不能为空`);
            return;
        }
        const number = tds.eq(5).text().trim();
        if (number != parseFloat(number)) {
            layer.msg(`序列${xh}：数量不合法`);
            return;
        }
        const price = tds.eq(6).text().trim();
        if (price != parseFloat(price)) {
            layer.msg(`序列${xh}：税前单价不合法`);
            return;
        }
        const taxPrice = tds.eq(7).text().trim();
        if (taxPrice != parseFloat(taxPrice)) {
            layer.msg(`序列${xh}：税后单价不合法`);
            return;
        }
        const taxAmount = tds.eq(8).text().trim();
        if (taxAmount != parseFloat(taxAmount)) {
            layer.msg(`序列${xh}：合计不合法`);
            return;
        }
        items[i] = {
            Purchase: purchase,
            Time: time,
            ItemId: d.ItemId,
            Id: d.Id,
            PurchaseId: _Purchase.Id,
            Code: tds.eq(1).text().trim(),
            Name: name,
            Specification: specification,
            Unit: tds.eq(4).text().trim(),
            Number: number,
            Price: price,
            TaxPrice: taxPrice,
            TaxAmount: taxAmount,
            Tax: $(tr).find('.taxTate').val().trim()
        }
    }
    const list = {
        Id: _Purchase.Id,
        Items: items
    }
    const doSth = function () {
        let data = {};
        data.opType = 861;
        data.opData = JSON.stringify(list);
        ajaxPost('/Relay/Post', data, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                data = _stateDataTable.context[0].aoData;
                for (let i = 0, len = data.length; i < len; i++) {
                    const id = data[i]._aData.Id;
                    if (id == _Purchase.Id) {
                        data[i]._aData.IsQuote = true;
                        getQuoteList(true);
                        break;
                    }
                }
            }
        });
    }
    showConfirm('保存', doSth);
}

let _stateDataTable = null;
let _Purchase = null;
let _inWareDataTable = null;
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
        const rData = ret.datas;
        $('#inWareListSaveBtn').prop('disabled', !(rData.some(item => item.ErpId !== 0) && _Purchase.isShow));
        $('#finishInWareListBtn').prop('disabled', !_Purchase.isShow);
        const count = d => `<input class="form-control text-center count zeroNum" oninput="onInput(this, 8, 0)" onblur="onInputEnd(this)" onchange="inWareListChange.call(this)" style="width:80px" value=${d.Count} wid=${d.Id} bill=${d.BillId}>`;
        _inWareDataTable = $('#inWareList').DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            destroy: true,
            paging: true,
            searching: true,
            language: oLanguage,
            data: rData,
            aaSorting: [[0, 'asc']],
            aLengthMenu: [20, 40, 60],
            iDisplayLength: 20,
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
        const v = el.val() >> 0;
        if (v) {
            list.push({
                Id: el.attr('wid') >> 0,
                Count: v,
                PurchaseId: pId,
                BillId: el.attr('bill') >> 0
            });
        }
    }
    if (!list.length) {
        return;
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
                        if (~$('#formState').val()) {
                            const xh = $(tr).find('td:first').text() >> 0;
                            _stateDataTable.row(tr).remove().draw(false);
                            _stateDataTable.column(0).nodes().each(cell => {
                                const flag = $(cell).text() >> 0;
                                if (flag > xh) {
                                    $(cell).text(flag - 1);
                                }
                            });
                        } else {
                            $(tr).find('td:last').text('订单完成');
                            data[i]._aData.State = 5;
                        }
                        _Purchase.State = 5;
                        _Purchase.isShow = false;
                        getPurchaseMaterial();
                        break;
                    }
                }
                $('#citePurchaseListBtn').prop('disabled', false);
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
        const rData = ret.datas;
        for (let i = 0, len = rData.length; i < len; i++) {
            rData[i].ItemId = rData[i].Id;
            rData[i].Id = 0;
        }
        setPurchaseList(rData);
    });
}

//入库单
function setPurchaseList(arr, isQuote) {
    isQuote ? $('#addPurchaseListBtn').removeClass('hidden') : $('#addPurchaseListBtn').addClass('hidden');
    const taxTate = d => `<input class="form-control text-center taxTate zeroNum" onblur="onInputEnd(this)" style="width:80px" value=${parseFloat(d) || 0}>`;
    const deBtn = () => `<button type="button" class="btn btn-danger btn-sm" onclick="delPurchaseTr.call(this)"><i class="fa fa-minus"></i></button>`;
    _purchaseDataTable = $('#purchaseList').DataTable({
        dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
        destroy: true,
        paging: true,
        searching: true,
        language: oLanguage,
        data: arr,
        aaSorting: [[0, 'asc']],
        aLengthMenu: [20, 40, 60],
        iDisplayLength: 20,
        columns: [
            { data: null, title: '序号', render: (a, b, c, d) => ++d.row },
            { data: 'Code', title: '物料编码' },
            { data: 'Name', title: '物料名称' },
            { data: 'Specification', title: '规格' },
            { data: 'Unit', title: '单位' },
            { data: 'Number', title: '数量', sClass: 'numZero' },
            { data: 'Price', title: '税前单价', sClass: 'numZero' },
            { data: 'TaxPrice', title: '税后单价', sClass: 'numZero' },
            { data: 'TaxAmount', title: '合计', sClass: 'numZero' },
            { data: isQuote ? 'Tax' : 'TaxTate', title: '税率（%)', render: taxTate },
            { data: null, title: '删除', render: deBtn, visible: !!isQuote }
        ],
        drawCallback: function () {
            if (isQuote) {
                $('#purchaseList tbody tr td:not(:nth-child(1),:nth-child(10),:nth-child(11))').prop('contenteditable', true);
            }
        },
        initComplete: function () {
            isQuote ? $('#purchaseList').off('paste') : $('#purchaseList').off('paste').on('paste', pasteTable);
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
                                    <th id="purchaseAmount">${amount ? parseFloat(amount.toFixed(5)) : 0}</th>
                                  </tr>
                                    <tr>
                                    <th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th>
                                    <th>税额：</th>
                                    <th id="purchaseTax">${tax ? parseFloat(tax.toFixed(5)) : 0}</th>
                                  </tr>
                               </tfoot>`;
            this.find('tfoot').remove();
            this.append(tFoot);
            this.find('tfoot tr:last th').css('borderTop', 0);
        }
    });
}

//添加入库单tr
function addPurchaseTr() {
    _purchaseDataTable.row.add({
        Id: 0,
        ItemId: 0,
        Code: '',
        Name: '',
        Specification: '',
        Unit: '',
        Number: 0,
        Price: 0,
        TaxPrice: 0,
        TaxAmount: 0,
        TaxTate: 0
    }).draw(false);
}

//删除入库单tr
function delPurchaseTr() {
    const tr = $(this).parents('tr')[0];
    const xh = $(tr).find('td:first').text() >> 0;
    _purchaseDataTable.row(tr).remove().draw(false);
    _purchaseDataTable.column(0).nodes().each(cell => {
        const flag = $(cell).text() >> 0;
        if (flag > xh) {
            $(cell).text(flag - 1);
        }
    });
    tFootCount();
}

//入库单重置
function resetPurchaseList() {
    $('#purchaseCode').val('');
    $('#addPurchaseListBtn').addClass('hidden');
    if (_purchaseDataTable) {
        _pasteData = null;
        _purchaseDataTable.destroy();
        _purchaseDataTable.clear();
        _purchaseDataTable = null;
        $('#purchaseList').empty();
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
    const trs = _purchaseDataTable.rows().nodes();
    for (let i = 0, len = trs.length; i < len; i++) {
        const tr = $(trs[i]);
        const taxTate = tr.find('.taxTate').val().trim();
        const tds = tr.find('td');
        let td = '';
        for (let j = 0; j < 9; j++) {
            td += tds.eq(j).prop('outerHTML');
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
