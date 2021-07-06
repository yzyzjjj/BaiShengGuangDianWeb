var _permissionList = [];
function pageReady() {
    $(".sidebar-mini").addClass("sidebar-collapse");
    _permissionList[589] = { uIds: ['updateDepartmentBtn'] };
    _permissionList[590] = { uIds: ['finishInWareListBtn'] };
    _permissionList[591] = { uIds: ['citePurchaseListBtn'] };
    _permissionList[592] = { uIds: ['printPurchaseListBtn'] };
    _permissionList[593] = { uIds: ['inWareListSaveBtn'] };
    _permissionList[594] = { uIds: ['changePurchaseBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
    $('.ms2').select2();
    $('#cgTime').val(getDate()).datepicker('update');
    var fc1 = new Promise(resolve => getValuer(resolve));
    var fc2 = new Promise(resolve => getGroup(resolve)).then(res => {
        getProcessor(res);
    })
    Promise.all([fc1, fc2]).then(res => {
        getPurchase();
    }).then(res => {
        getPurchase();
    });

    $('#groupSelect').on('select2:select', () => getProcessor());
    $('#qgProcessor,#formState,#cgProcessor').on('select2:select', () => getPurchase());
    $('#formState,#cgProcessor').on('change', () => getPurchase());
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
    $('#purchaseList').on('input', '.taxRate', function () {
        onInput(this, 2, 2);
        tFootTrCount.call(this);
    });
    $('#purchaseList').on('input', '.numZero', function () {
        onInput(this, 6, 6);
        tFootTrCount.call(this);
    });
    $('#purchaseList').on('input', '.tax-amount', function () {
        onInput(this, 6, 6);
        tFootTrCount.call(this, true);
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

    const tableConfig = dataTableConfig(0, true, _changePurchase);
    tableConfig.dom = '<"pull-left"l><"pull-right"f>rt<"text-center"i><"table-flex"p>';
    const state = d => {
        let color = '';
        switch (d.State) {
            case 1: color = '#C9C9C9'; break;
            case 2: color = '#1890FF'; break;
            case 3: color = '#f00'; break;
            case 4: color = '#f90'; break;
            case 5: color = '#008000'; break;
        }
        return `<span style="color:${color}">${d.StateStr}</span>`;
    };
    const purchase = d => {
        d = d || '';
        return d.length > 6 ? `<span title="${d}">${d.slice(0, 6)}...</span>` : d;
    };
    tableConfig.addColumns([
        { data: 'ErpId', title: '编号', sWidth: '20px' },
        { data: 'Purchase', title: '名称', sWidth: '100px', render: purchase },
        { data: 'Name', title: '请购人', sWidth: '20px' },
        { data: 'Valuer', title: '核价人', sWidth: '20px' },
        { data: null, title: '状态', sWidth: '20px', render: state }
    ]);
    tableConfig.createdRow = function (tr, d, i, tds) {
        $(tr).attr("id", d.Id);
    }
    tableConfig.drawCallback = function (settings) {
        initCheckboxAddEvent.call(this, _purchaseTrs);
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
                            isShow: [2, 3, 4, 7].includes(d.State),
                            name: d.Name
                        };
                        $('#citePurchaseListBtn').prop('disabled', d.State != 5);
                        if (d.IsQuote) {
                            getQuoteList(true);
                            $('#addPurchaseListBtn').removeClass('hidden');
                        } else {
                            $('#addPurchaseListBtn').addClass('hidden');
                        }
                        getPurchaseMaterial();
                    }
                }
                $(this).css('background', '#d9edf7').siblings('tr').css('background', '');
            });
        }
    }
    _stateDataTable = $('#stateList').DataTable(tableConfig);
    $('#stateList').addClass('hidden');
}
//请购单列表
let _stateDataTable = null;

//入库税后单价合计计算
function tFootTrCount(t) {
    const tr = $(this).parents('tr');
    const oldData = _purchaseDataTable.row(tr).data();
    if (!t) {
        const taxRate = parseFloat(tr.find('.taxRate').val()) || 0;
        //let price = parseFloat(tr.find('.price').text()) || 0;
        let price = oldData.Price;
        let taxPrice = oldData.TaxPrice;
        //let taxPrice = parseFloat(tr.find('.tax-price').text()) || 0;
        if (oldData.TaxRate == taxRate) {
            price = oldData.Price;
        } else {
            price = parseFloat((taxPrice * 100 / (100 + taxRate)).toFixed(6));
        }
        tr.find('.price').text(price);
        const number = parseFloat(tr.find('.number').text()) || 0;
        let taxAmount = parseFloat((number * taxPrice).toFixed(6));
        if (oldData.Number == number) {
            taxAmount = parseFloat((number * taxPrice).toFixed(6));
        }
        tr.find('.tax-amount').text(taxAmount);
    }
    tFootCount();
}

//入库单页脚计算
function tFootCount() {
    //const numArr = _purchaseDataTable.columns(8).nodes()[0].map(item => $(item).text());
    //const priceArr = _purchaseDataTable.columns(9).nodes()[0].map(item => $(item).text());
    //const taxAmountArr = _purchaseDataTable.columns(11).nodes()[0].map(item => $(item).text());
    const numArr = _purchaseDataTable.rows().nodes().map(tr => $(tr).find('.number').text() >> 0);
    const priceArr = _purchaseDataTable.rows().nodes().map(tr => $(tr).find('.price').text());
    const taxAmountArr = _purchaseDataTable.rows().nodes().map(tr => $(tr).find('.tax-amount').text());
    const taxArr = _purchaseDataTable.rows().nodes().map(tr => $(tr).find('.taxRate').val());

    const arr = [];
    for (let i = 0, len = numArr.length; i < len; i++) {
        arr[i] = {
            Number: numArr[i],
            Price: priceArr[i],
            TaxAmount: taxAmountArr[i],
            TaxRate: taxArr[i]
        }
    }
    computePrice(arr);
}

//paste
function pasteTable(e) {
    if (!(e.originalEvent.clipboardData && e.originalEvent.clipboardData.items)) {
        return;
    }
    if (e.target.localName != 'input' && $(e.target).prop('contenteditable') != 'true') {
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
                        Order: d[0] || '',
                        Code: d[1] || '',
                        Name: d[2] || '',
                        Specification: d[3] || '',
                        Class: d[4] || '',
                        Supplier: d[5] || '',
                        Unit: d[6] || '',
                        Number: d[7] || '',
                        Price: d[8] || '',
                        TaxPrice: d[9] || '',
                        TaxAmount: d[10] || '',
                        TaxRate: d[11] || 0
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
                    Order: d[0] || '',
                    Code: d[1] || '',
                    Name: d[2] || '',
                    Specification: d[3] || '',
                    Class: d[4] || '',
                    Supplier: d[5] || '',
                    Unit: d[6] || '',
                    Number: d[7] || '',
                    Price: d[8] || '',
                    TaxPrice: d[9] || '',
                    TaxAmount: d[10] || '',
                    TaxRate: d[11] || 0
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
function getGroup(resolve, group) {
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
        group && $('#groupSelect').val(group).trigger('change');
        resolve('success');
    }, 0);
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
            getGroup(null, flag ? group : null);
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
    }, 0);
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
    }, 0);
}

let _changePurchase = false;
let _purchaseTrs = [];
//选择要修改状态的请购单
function changePurchase(e) {
    _stateDataTable.columns(0).visible(!_changePurchase);
    if (!_changePurchase) {
        _stateDataTable.page(_stateDataTable.page()).draw(false);
        $(e).removeClass("btn-warning").addClass("btn-danger").text("取消");
        $(e).siblings(".update").removeClass("hidden");
    } else {
        _purchaseTrs = [];
        $(e).addClass("btn-warning").removeClass("btn-danger").text("状态");
        $(e).siblings(".update").addClass("hidden");
    }
    _changePurchase = !_changePurchase;
}

//修改请购单状态
function changePurchaseState(e) {
    if (_purchaseTrs.length == 0)
        return;
    const list = _purchaseTrs.map((a, b) => ({ Id: $(a).find("input").val() >> 0 }));
    const data = {};
    data.opType = 856;
    data.opData = JSON.stringify(list);
    ajaxPost('/Relay/Post', data, ret => {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            getPurchase();
        }
    });
}

//获取请购单
function getPurchase() {
    _purchaseTrs = [];
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
    var name = $('#qgProcessor').val();
    if (isStrEmptyOrUndefined(name)) {
        name = "-1";
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
    list.order = $('#cgOrder').val();
    const data = {};
    data.opType = 855;
    data.opData = JSON.stringify(list);
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        $('#stateList').removeClass('hidden');
        updateTable(_stateDataTable, rData);
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
        $('#cgTime').val(rData.length ? rData[0].Time.split(' ')[0] : getDate()).datepicker('update');
        setPurchaseList(rData, isQuote);
    }, 0);
}

//保存入库单
function updatePurchaseList() {
    if (!_purchaseDataTable || !_purchaseDataTable.data().length) {
        layer.msg('入库单为空');
        return;
    }
    const purchasingCompany = $('#purchasingCompany').val().trim();
    //if (isStrEmptyOrUndefined(purchasingCompany)) {
    //    layer.msg('采购公司不能为空');
    //    return;
    //}
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
    const trs = _purchaseDataTable.rows().nodes();
    const itemArr = _purchaseDataTable.columns(0).data()[0];
    const items = [];
    for (let i = 0, len = trs.length; i < len; i++) {
        const tr = trs[i];
        const tds = $(tr).find('td');
        const d = itemArr[i];
        const xh = i + 1;
        const t = 1;
        const order = tds.eq(t + 1).text().trim();
        if (isStrEmptyOrUndefined(order)) {
            layer.msg(`序列${xh}：订单编号不能为空`);
            return;
        }
        const code = tds.eq(t + 2).text().trim();
        if (isStrEmptyOrUndefined(code)) {
            layer.msg(`序列${xh}：物料编码不能为空`);
            return;
        }
        const name = tds.eq(t + 3).text().trim();
        if (isStrEmptyOrUndefined(name)) {
            layer.msg(`序列${xh}：物料名称不能为空`);
            return;
        }
        const specification = tds.eq(t + 4).text().trim();
        if (isStrEmptyOrUndefined(specification)) {
            layer.msg(`序列${xh}：规格不能为空`);
            return;
        }
        const category = tds.eq(t + 5).text().trim();
        if (isStrEmptyOrUndefined(category)) {
            layer.msg(`序列${xh}：类别不能为空`);
            return;
        }
        const supplier = tds.eq(t + 6).text().trim();
        if (isStrEmptyOrUndefined(supplier)) {
            layer.msg(`序列${xh}：供应商不能为空`);
            return;
        }
        const unit = tds.eq(t + 7).text().trim();
        if (isStrEmptyOrUndefined(unit)) {
            layer.msg(`序列${xh}：单位不能为空`);
            return;
        }
        const number = tds.eq(t + 8).text().trim();
        if (number != parseFloat(number)) {
            layer.msg(`序列${xh}：数量不合法`);
            return;
        }
        const price = tds.eq(t + 9).text().trim();
        if (price != parseFloat(price)) {
            layer.msg(`序列${xh}：税前单价不合法`);
            return;
        }
        const taxPrice = tds.eq(t + 10).text().trim();
        if (taxPrice != parseFloat(taxPrice)) {
            layer.msg(`序列${xh}：税后单价不合法`);
            return;
        }
        const taxAmount = tds.eq(t + 11).text().trim();
        if (taxAmount != parseFloat(taxAmount)) {
            layer.msg(`序列${xh}：合计不合法`);
            return;
        }
        const purchaser = tds.eq(t + 13).text().trim();
        if (isStrEmptyOrUndefined(purchaser)) {
            layer.msg(`序列${xh}：采购人不能为空`);
            return;
        }
        let purchasingCompany1 = tds.eq(t + 14).text().trim();
        if (purchasingCompany != '')
            purchasingCompany1 = purchasingCompany;
        if (isStrEmptyOrUndefined(purchasingCompany1)) {
            layer.msg(`序列${xh}：采购公司不能为空`);
            return;
        }

        items[i] = {
            Purchase: _Purchase.ErpId,
            Order: order,
            Time: time,
            ItemId: d.ItemId,
            Id: d.Id,
            PurchaseId: _Purchase.Id,
            Code: code,
            Name: name,
            Specification: specification,
            Class: category,
            Supplier: supplier,
            Unit: unit,
            Purchaser: purchaser,
            Number: number,
            Price: price,
            TaxPrice: taxPrice,
            TaxAmount: taxAmount,
            TaxRate: $(tr).find('.taxRate').val().trim(),
            PurchasingCompany: purchasingCompany1
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
                        break;
                    }
                }
                getQuoteList(true);
            }
        });
    }
    showConfirm('保存', doSth);
}

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
        const count = d => `<input class="form-control text-center count zeroNum" oninput="onInput(this, 10, 3)" onblur="onInputEnd(this)" onchange="inWareListChange.call(this)" style="width:80px" value=${d.Count} wid=${d.Id} bill=${d.BillId}>`;
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
                { data: 'Order', title: '订单编号' },
                { data: 'Code', title: '物料编码' },
                { data: 'Name', title: '物料名称' },
                { data: 'Specification', title: '规格' },
                { data: 'Supplier', title: '供应商' },
                { data: 'Unit', title: '单位' },
                { data: 'Purchaser', title: '采购人' },
                { data: 'Number', title: '数量', sClass: 'text-red' },
                { data: 'Stock', title: '已入库', sClass: 'text-blue' },
                { data: null, title: '本次入库', render: count, visible: _Purchase.isShow },
                { data: null, title: '入库编码', sClass: 'text-green', render: d => `<span class="${((!isStrEmptyOrUndefined(d.ThisCode) && d.ThisCode != d.Code) ? "text-red text-bold" : "text-green")}">${d.ThisCode}</span>` },
                { data: 'TaxPrice', title: '税后单价' },
                { data: 'TaxAmount', title: '税后总价' },
                { data: 'TaxRate', title: '税率（%)' },
                { data: 'Price', title: '税前单价' }
            ]
        });
    }, 0);
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
        layer.msg('审核完成,开始采购,已入库,仓库到货才能入库');
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
        layer.msg('审核完成,开始采购,已入库,仓库到货才能完成采购');
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
                            $(tr).find('td:last').text('订单完成').css('color', '#008000');
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
            const d = rData[i];
            d.ItemId = d.Id;
            d.Number = d.Stock;
            d.TaxPrice = d.TaxPrice;
            d.TaxAmount = (d.Number > 0 && d.Number == d.Stock) ? d.TaxAmount : parseFloat(floatObj.multiply(d.Stock, d.TaxPrice).toFixed(6));
            //d.TaxPrice = parseFloat(floatObj.multiply(d.Price, floatObj.add(1, floatObj.divide(d.TaxRate, 100))).toFixed(6));
            //d.TaxAmount = parseFloat(floatObj.multiply(d.Number, d.TaxPrice).toFixed(6));
            d.Id = 0;
        }
        _pasteData = null;
        setPurchaseList(rData);
    });
}

//入库单
function setPurchaseList(arr, isQuote) {
    isQuote ? $('#addPurchaseListBtn').removeClass('hidden') : $('#addPurchaseListBtn').addClass('hidden');
    const taxRate = d => `<input class="form-control text-center taxRate zeroNum" onblur="onInputEnd(this)" 
                            style="width:80px" value=${parseFloat(d.TaxRate) || 0} old=${parseFloat(d.TaxRate) || 0} taxAmount=${d.TaxAmount}>`;
    const deBtn = () => `<button type="button" class="btn btn-danger btn-sm" onclick="delPurchaseTr.call(this)"><i class="fa fa-minus"></i></button>`;
    $('#purchasingCompany').val('');
    var arrColor = distinct(arr.map(x => x.Order));
    //$('#purchasingCompany').val(arr[0].PurchasingCompany || '');
    var count = arr.length;
    var t = 0;
    _purchaseDataTable = $('#purchaseList').DataTable({
        dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
        destroy: true,
        paging: true,
        searching: true,
        language: oLanguage,
        data: arr,
        aaSorting: [[1, 'asc']],
        aLengthMenu: [20, 40, 60],
        iDisplayLength: 20,
        columns: [
            { data: null, title: "全选<input type='checkbox' class='icb_minimal' id='checkAll'>", render: d => `<input type="checkbox" class="icb_minimal isEnable">`, orderable: false },
            { data: null, title: '序号', render: (a, b, c, d) => ++d.row },
            { data: 'Order', title: '订单编号', sClass: 'order text-bold' },
            { data: 'Code', title: '物料编码' },
            { data: 'Name', title: '物料名称' },
            { data: 'Specification', title: '规格' },
            { data: 'Class', title: '类别' },
            { data: 'Supplier', title: '供应商' },
            { data: 'Unit', title: '单位' },
            { data: 'Number', title: '数量', sClass: 'numZero number' },
            { data: 'Price', title: '税前单价', sClass: 'numZero price' },
            { data: 'TaxPrice', title: '税后单价', sClass: 'tax-price' },
            { data: 'TaxAmount', title: '合计', sClass: 'tax-amount' },
            { data: null, title: '税率（%)', render: taxRate },
            { data: 'Purchaser', title: '采购人' },
            { data: 'PurchasingCompany', title: '采购公司' },
            { data: null, title: '删除', render: deBtn, visible: !!isQuote }
        ],
        drawCallback: function () {
            if (isQuote) {
                //$('#purchaseList tbody tr td:not(:nth-child(1),:nth-child(11),:nth-child(12),:nth-child(13),:nth-child(14))').prop('contenteditable', true);
                $('#purchaseList tbody tr td:not(:nth-child(1),:nth-child(11),:nth-child(12))').prop('contenteditable', true);
            } else {
                $('#purchaseList tbody tr td:nth-child(10)').prop('contenteditable', true);
            }
            $("#purchaseList td").css("padding", "3px");
            $("#purchaseList .icb_minimal").iCheck({
                checkboxClass: 'icheckbox_minimal-red',
                radioClass: 'iradio_minimal',
                increaseArea: '20%'
            }).on("ifChanged", function (event) {
                if ($(this).is(":checked")) {
                    t++;
                    //if (count == t)
                    //    $("#checkAll").iCheck('check');
                } else {
                    t--;
                    $("#checkAll").iCheck('uncheck');
                }
            });

            $("#checkAll").on("ifChanged", function (event) {
                if ($(this).is(":checked")) {
                    $("#purchaseList .icb_minimal").iCheck('check');
                } else {
                    if (count == t)
                        $("#purchaseList .icb_minimal").iCheck('uncheck');
                }
            });
            if ($("#checkAll").is(":checked")) {
                $("#purchaseList .icb_minimal").iCheck('check');
            }
        },
        initComplete: function () {
            isQuote ? $('#purchaseList').off('paste') : $('#purchaseList').off('paste').on('paste', pasteTable);
            const tFoot = `<tfoot>
                              <tr>
                                <th colspan="11"></th>
                                <th>合计：</th>
                                <th id="purchaseAmount"></th>
                              </tr>
                              <tr>
                                <th colspan="11"></th>
                                <th>税额：</th>
                                <th id="purchaseTax"></th>
                              </tr>
                           </tfoot>`;
            this.find('tfoot').remove();
            this.append(tFoot);
            computePrice(arr);
            this.find('tfoot tr:last th').css('borderTop', 0);
        },
        createdRow: function (tr, d) {
            const i = arrColor.indexOf(d.Order);
            $(tr).find(`.order`).css('color', optionColors[(i > optionColors.length ? (i % optionColors.length) : i)]);
        }
    });
}

//合计税额
function computePrice(data) {
    let amount = 0, tax = 0;
    for (let i = 0, len = data.length; i < len; i++) {
        const d = data[i];
        isStrEmptyOrUndefined(d.TaxRate) && (d.TaxRate = 0);
        amount = decimalObj.add(amount, d.TaxAmount);
        //tax = (d.Number > 0 && d.Number == d.Stock) ? floatObj.add(tax, floatObj.subtract(all, d.TaxAmount))
        //    : floatObj.add(tax, floatObj.subtract(all, floatObj.multiply(parseFloat(d.Number), parseFloat(d.Price))));
        tax = decimalObj.add(tax, decimalObj.divide(decimalObj.multiply(d.TaxAmount, d.TaxRate), decimalObj.add(100, d.TaxRate)));
    }
    $('#purchaseAmount').text(amount ? parseFloat(amount.toFixed(6)) : 0);
    $('#purchaseTax').text(tax ? parseFloat(tax.toFixed(6)) : 0);
}

//添加入库单tr
function addPurchaseTr() {
    _purchaseDataTable.row.add({
        Id: 0,
        ItemId: 0,
        Order: '',
        Code: '',
        Name: '',
        Specification: '',
        Class: '',
        Supplier: '',
        Unit: '',
        Number: 0,
        Price: 0,
        TaxPrice: 0,
        TaxAmount: 0,
        TaxRate: 0
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
    $('#purchasingCompany').val('');
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
    if (!_purchaseDataTable || !_purchaseDataTable.data().length) {
        layer.msg('入库单为空');
        return;
    }
    let purchasingCompany = $('#purchasingCompany').val().trim();
    let ops = '';
    const codes = [];
    const trs = _purchaseDataTable.rows().nodes();
    for (let i = 0, len = trs.length; i < len; i++) {
        const tr = $(trs[i]);
        const tds = tr.find('td');
        if (tds.eq(0).find('.isEnable').is(":checked")) {
            const purchaseCode = tds.eq(2).text().trim();
            ops.includes(purchaseCode) || (ops += `<option value=${purchaseCode}>${purchaseCode}</option>`);
            !codes.includes(purchaseCode) && codes.push(purchaseCode);
        }
    }
    //_purchaseDataTable.column(2).nodes().each(el => {
    //    const purchaseCode = $(el).text().trim();
    //    ops.includes(purchaseCode) || (ops += `<option value=${purchaseCode}>${purchaseCode}</option>`);
    //});

    const length = codes.length;
    if (length <= 0) {
        layer.msg('请选择订单号');
        return;
    }
    const all = $("#checkAll").is(":checked");
    let printContent = "";
    for (var c = 0; c < length; c++) {
        const code = codes[c];
        const thead = '<thead><tr><th>编号</th><th>物料编码</th><th>名称</th><th>类别</th><th>规格</th><th>单位</th><th>入库数量</th><th>单价</th><th>不含税金额</th><th>税额</th><th>合计金额</th><th>请购人</th></tr></thead>';
        let tbodyTrs = '';
        const colIndex = [3, 4, 5, 6, 8, 9, 10];
        let num = 0, allPrice = 0;
        //const supplier = $(_purchaseDataTable.column(6).nodes()[0]).text();
        let supplier = '';
        for (let i = 0, len = trs.length; i < len; i++) {
            const tr = $(trs[i]);
            const tds = tr.find('td');
            if ((all || tds.eq(0).find('.isEnable').is(":checked")) && tds.eq(2).text().trim() == code) {
                if (purchasingCompany == '') {
                    purchasingCompany = tds.eq(15).text().trim();
                }
                num++;
                let td = `<td>${num}</td>`;
                for (let j = 0, len1 = colIndex.length; j < len1; j++) {
                    td += tds.eq(colIndex[j]).prop('outerHTML');
                }
                const noTaxPrice = floatObj.multiply(parseFloat(tds.eq(9).text().trim()), parseFloat(tds.eq(10).text().trim())).toFixed(2);
                td += `<td>${noTaxPrice}</td>`;
                const taxAmount = parseFloat(tds.eq(12).text().trim());
                allPrice = floatObj.add(allPrice, taxAmount);
                td += `<td>${floatObj.subtract(taxAmount, noTaxPrice).toFixed(2)}</td>`;
                td += `<td>${taxAmount.toFixed(2)}</td>`;
                td += `<td>${_Purchase.name}</td>`;
                tbodyTrs += `<tr style="height:40px">${td}</tr>`;
                supplier = tds.eq(7).text().trim();
            }
        }
        if (isStrEmptyOrUndefined(purchasingCompany)) {
            layer.msg('采购公司不能为空');
            return;
        }
        tbodyTrs += '<tr style="height:40px"><td>备注：</td><td colspan="11"></td></tr>';
        allPrice = allPrice.toFixed(2);
        tbodyTrs += `<tr style="height:40px"><td colspan="8">合计金额：${convertCurrency(allPrice)}</td><td colspan="4">￥${allPrice}</td></tr>`;
        const table = `<table border="1" style="width:100%;text-align:center;border-collapse:collapse">${thead}<tbody>${tbodyTrs}</tbody></table>`;
        let time = $('#cgTime').val().trim();
        const arr = ['年', '月', '日'];
        time && (time = time.split('-').map((item, i) => `${item}${arr[i]}`).join(''));
        const title = `<div style="text-align:center">${purchasingCompany}</div><h3 style="text-align:center;margin:5px;letter-spacing:8px">采购入库单</h3>`;
        const tableTop1 = `<div style="text-align:right">订单号：${code}</div>`;
        const tableTop2 = `<div style="position:absolute;right:0">供应商：${supplier}</div><div style="text-align:center;width:100%">日期：${time}</div>`;
        const footer = `<div style="display:flex;margin:8px 0"><label style="flex:1">主管：</label><label style="flex:1">仓库：<span style="margin-left:20px">${getCookieTokenInfo().name}</span></label><label style="flex:1">记账：</label><label style="flex:1">采购人：<span style="margin-left:20px">${_purchaseDataTable.data()[0].Purchaser || ''}</span></label></div>`;
        printContent += `<div style="position:relative">${title}${tableTop1}${tableTop2}${table}${footer}</div>`;
    }
    printCode(printContent);

    //const selectOp = `<label class="control-label text-nowrap">订单号选择：</label><select class="form-control" id="purchaseCode">${ops}</select>`;
    //layer.confirm(selectOp, {
    //    btn: ['打印', '取消'],
    //    success: function () {
    //        this.enterEsc = function (event) {
    //            if (event.keyCode === 13) {
    //                $(".layui-layer-btn0").click();
    //                return false; //阻止系统默认回车事件
    //            } else if (event.keyCode == 27) {
    //                $(".layui-layer-btn1").click();
    //                return false;
    //            }
    //        };
    //        $(document).on('keydown', this.enterEsc); //监听键盘事件，关闭层
    //    },
    //    end: function () {
    //        $(document).off('keydown', this.enterEsc); //解除键盘关闭事件
    //    }
    //}, function (index) {
    //    const code = $('#purchaseCode').val();
    //    if (isStrEmptyOrUndefined(code)) {
    //        layer.msg('订单号不能为空');
    //        return;
    //    }
    //    layer.close(index);
    //    const thead = '<thead><tr><th>编号</th><th>物料编码</th><th>名称</th><th>类别</th><th>规格</th><th>单位</th><th>入库数量</th><th>单价</th><th>不含税金额</th><th>税额</th><th>合计金额</th><th>请购人</th></tr></thead>';
    //    let tbodyTrs = '';
    //    const colIndex = [3, 4, 5, 6, 8, 9, 10];
    //    let num = 0, allPrice = 0;
    //    //const supplier = $(_purchaseDataTable.column(6).nodes()[0]).text();
    //    let supplier = '';
    //    for (let i = 0, len = trs.length; i < len; i++) {
    //        const tr = $(trs[i]);
    //        const tds = tr.find('td');
    //        if (($("#checkAll").is(":checked") || tds.eq(0).find('.isEnable').is(":checked")) && tds.eq(2).text().trim() == code) {
    //            if (purchasingCompany == '') {
    //                purchasingCompany = tds.eq(15).text().trim();
    //            }
    //            num++;
    //            let td = `<td>${num}</td>`;
    //            for (let j = 0, len1 = colIndex.length; j < len1; j++) {
    //                td += tds.eq(colIndex[j]).prop('outerHTML');
    //            }
    //            const noTaxPrice = floatObj.multiply(parseFloat(tds.eq(9).text().trim()), parseFloat(tds.eq(10).text().trim())).toFixed(2);
    //            td += `<td>${noTaxPrice}</td>`;
    //            const taxAmount = parseFloat(tds.eq(12).text().trim());
    //            allPrice = floatObj.add(allPrice, taxAmount);
    //            td += `<td>${floatObj.subtract(taxAmount, noTaxPrice).toFixed(2)}</td>`;
    //            td += `<td>${taxAmount.toFixed(2)}</td>`;
    //            td += `<td>${_Purchase.name}</td>`;
    //            tbodyTrs += `<tr style="height:40px">${td}</tr>`;
    //            supplier = tds.eq(7).text().trim();
    //        }
    //    }
    //    if (isStrEmptyOrUndefined(purchasingCompany)) {
    //        layer.msg('采购公司不能为空');
    //        return;
    //    }
    //    tbodyTrs += '<tr style="height:40px"><td>备注：</td><td colspan="11"></td></tr>';
    //    allPrice = allPrice.toFixed(2);
    //    tbodyTrs += `<tr style="height:40px"><td colspan="8">合计金额：${convertCurrency(allPrice)}</td><td colspan="4">￥${allPrice}</td></tr>`;
    //    const table = `<table border="1" style="width:100%;text-align:center;border-collapse:collapse">${thead}<tbody>${tbodyTrs}</tbody></table>`;
    //    let time = $('#cgTime').val().trim();
    //    const arr = ['年', '月', '日'];
    //    time && (time = time.split('-').map((item, i) => `${item}${arr[i]}`).join(''));
    //    const title = `<div style="text-align:center">${purchasingCompany}</div><h3 style="text-align:center;margin:5px;letter-spacing:8px">采购入库单</h3>`;
    //    const tableTop1 = `<div style="text-align:right">订单号：${code}</div>`;
    //    const tableTop2 = `<div style="position:absolute;right:0">供应商：${supplier}</div><div style="text-align:center;width:100%">日期：${time}</div>`;
    //    const footer = `<div style="display:flex;margin:8px 0"><label style="flex:1">主管：</label><label style="flex:1">仓库：<span style="margin-left:20px">${getCookieTokenInfo().name}</span></label><label style="flex:1">记账：</label><label style="flex:1">采购人：<span style="margin-left:20px">${_purchaseDataTable.data()[0].Purchaser || ''}</span></label></div>`;
    //    const printContent = `<div style="position:relative">${title}${tableTop1}${tableTop2}${table}${footer}</div>`;
    //    printCode(printContent);
    //}, function (index) {
    //    layer.close(index);
    //});
}
