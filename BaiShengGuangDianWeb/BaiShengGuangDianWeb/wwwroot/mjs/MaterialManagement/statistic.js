function pageReady() {
    $('.ms2').select2({ matcher });
    $('#materialMonth').val(getNowMonth()).datepicker('update');
    $('#materialDate1').val(getDate()).datepicker('update');
    $('#materialDate2').val(getDate()).datepicker('update');
    new Promise(resolve => getAllSelect(resolve)).then(e => allCodeSelect(e, 0));
    $('#materialCategory').on('select2:select', function () {
        new Promise(resolve => getAllSelect(resolve, {
            categoryId: $(this).val(),
            siteId: -1
        })).then(e => allCodeSelect(e, 1));
    });
    $('#materialName').on('select2:select', function () {
        new Promise(resolve => getAllSelect(resolve, {
            categoryId: $('#materialCategory').val(),
            nameId: $(this).val(),
            siteId: -1
        })).then(e => allCodeSelect(e, 2));
    });
    $('#materialSupplier').on('select2:select', function () {
        new Promise(resolve => getAllSelect(resolve, {
            categoryId: $('#materialCategory').val(),
            nameId: $('#materialName').val(),
            supplierId: $(this).val(),
            siteId: -1
        })).then(e => allCodeSelect(e, 3));
    });
    $('#materialSpecification,#materialSite').on('select2:select', () => getMaterialList());
    $('#materialMonth').on('changeDate', () => getMaterialList());

    const tableConfig = dataTableConfig();
    tableConfig.dom = '<"pull-left"l><"pull-right"B><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>';
    tableConfig.buttons = [{
        extend: 'excel',
        text: '导出Excel',
        className: 'btn-primary btn-sm',
        filename: `月度物料结存表_${getDate()}`
    }];
    tableConfig.addColumns([
        { data: 'Code', title: '物料编码' },
        { data: 'Category', title: '类别' },
        { data: 'Name', title: '名称' },
        { data: 'Supplier', title: '供应商' },
        { data: 'Specification', title: '规格' },
        { data: 'Site', title: '位置' },
        { data: 'Unit', title: '单位' },
        { data: 'TodayPrice', title: '价格' },
        { data: 'Stock', title: '最低库存' },
        { data: 'LastNumber', title: '月初数量' },
        { data: 'LastAmount', title: '月初金额' },
        { data: 'Increase', title: '本月入库数量' },
        { data: 'IncreaseAmount', title: '本月入库金额' },
        { data: 'Consume', title: '本月领用数量' },
        { data: 'ConsumeAmount', title: '本月领用金额' },
        { data: 'TodayNumber', title: '本月结存数量' },
        { data: 'TodayAmount', title: '本月结存金额' }
    ]);
    _materialTable = $('#materialList').DataTable(tableConfig);
    _materialQueryTable = $('#materialQueryList').DataTable(tableConfig);
    $('#materialList').closest('.dataTables_wrapper').addClass('hidden');
    $('#materialQueryList').closest('.dataTables_wrapper').addClass('hidden');
}
//报表table
let _materialTable = null;
//报表table
let _materialQueryTable = null;

//获取物料相关选项
function getAllSelect(resolve, opData) {
    const data = {}
    data.opType = 805;
    opData && (data.opData = JSON.stringify(opData));
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        resolve && resolve(ret);
    });
}

//物料选项设置
function allCodeSelect(ret, n) {
    switch (n) {
        case 0:
            $('.materialCategory').empty().append(`<option value="0">所有类别</option>${setOptions(ret.Categories, 'Category')}`);
            $('.materialSite').empty().append(`<option value="0">所有位置</option>${setOptions(ret.Sites, 'Site')}`);
        case 1:
            $('.materialName').empty().append(`<option value="0">所有名称</option>${setOptions(ret.Names, 'Name')}`);
        case 2:
            $('.materialSupplier').empty().append(`<option value="0">所有供应商</option>${setOptions(ret.Suppliers, 'Supplier')}`);
        case 3:
            $('.materialSpecification').empty().append(`<option value="0">所有规格</option>${setOptions(ret.Specifications, 'Specification')}`);
    }
    //getMaterialList();
}

//获取物料结存表
function getMaterialList() {
    $('#materialBox').find('materialInfo').addClass('hidden');
    let time1 = $('#materialMonth').val();
    if (isStrEmptyOrUndefined(time1)) {
        layer.msg('请选择月份');
        return;
    }
    time1 += '-01';
    const categoryId = $('#materialBox').find('.materialCategory').val();
    if (isStrEmptyOrUndefined(categoryId)) {
        layer.msg('请选择类别');
        return;
    }
    const nameId = $('#materialBox').find('.materialName').val();
    if (isStrEmptyOrUndefined(nameId)) {
        layer.msg('请选择名称');
        return;
    }
    const supplierId = $('#materialBox').find('.materialSupplier').val();
    if (isStrEmptyOrUndefined(supplierId)) {
        layer.msg('请选择供应商');
        return;
    }
    const specificationId = $('#materialBox').find('.materialSpecification').val();
    if (isStrEmptyOrUndefined(specificationId)) {
        layer.msg('请选择规格');
        return;
    }
    const siteId = $('#materialBox').find('.materialSite').val();
    if (isStrEmptyOrUndefined(siteId)) {
        layer.msg('请选择位置');
        return;
    }
    const data = {}
    data.opType = 891;
    data.opData = JSON.stringify({
        time1,
        interval: 3,
        categoryId,
        nameId,
        supplierId,
        specificationId,
        siteId
    });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        let entryMoney = 0, consumeMoney = 0, cashMoney = 0;
        for (let i = 0, len = rData.length; i < len; i++) {
            const d = rData[i];
            entryMoney += d.IncreaseAmount;
            consumeMoney += d.ConsumeAmount;
            cashMoney += d.TodayAmount;
        }
        $('#materialBox').find('.entryMoney').text(parseFloat(entryMoney.toFixed(6)));
        $('#materialBox').find('.consumeMoney').text(parseFloat(consumeMoney.toFixed(6)));
        $('#materialBox').find('.cashMoney').text(parseFloat(cashMoney.toFixed(6)));
        $('#materialBox').find('.materialInfo').removeClass('hidden');
        $('#materialList').closest('.dataTables_wrapper').removeClass('hidden');
        updateTable(_materialTable, rData);
    });
}


//获取物料结存表
function getMaterialQueryList() {
    $('#materialBox').find('materialInfo').addClass('hidden');
    let time1 = $('#materialDate1').val();
    if (isStrEmptyOrUndefined(time1)) {
        layer.msg('请选择日期');
        return;
    }
    let time2 = $('#materialDate2').val();
    if (isStrEmptyOrUndefined(time2)) {
        layer.msg('请选择日期');
        return;
    }
    const categoryId = $('#materialQueryBox').find('.materialCategory').val();
    if (isStrEmptyOrUndefined(categoryId)) {
        layer.msg('请选择类别');
        return;
    }
    const nameId = $('#materialQueryBox').find('.materialName').val();
    if (isStrEmptyOrUndefined(nameId)) {
        layer.msg('请选择名称');
        return;
    }
    const supplierId = $('#materialQueryBox').find('.materialSupplier').val();
    if (isStrEmptyOrUndefined(supplierId)) {
        layer.msg('请选择供应商');
        return;
    }
    const specificationId = $('#materialQueryBox').find('.materialSpecification').val();
    if (isStrEmptyOrUndefined(specificationId)) {
        layer.msg('请选择规格');
        return;
    }
    const siteId = $('#materialQueryBox').find('.materialSite').val();
    if (isStrEmptyOrUndefined(siteId)) {
        layer.msg('请选择位置');
        return;
    }
    const data = {}
    data.opType = 891;
    data.opData = JSON.stringify({
        time1,
        time2,
        interval: 1,
        categoryId,
        nameId,
        supplierId,
        specificationId,
        siteId
    });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        let entryMoney = 0, consumeMoney = 0, cashMoney = 0;
        for (let i = 0, len = rData.length; i < len; i++) {
            const d = rData[i];
            entryMoney += d.IncreaseAmount;
            consumeMoney += d.ConsumeAmount;
            cashMoney += d.TodayAmount;
        }
        $('#materialQueryBox').find('.entryMoney').text(parseFloat(entryMoney.toFixed(6)));
        $('#materialQueryBox').find('.consumeMoney').text(parseFloat(consumeMoney.toFixed(6)));
        $('#materialQueryBox').find('.cashMoney').text(parseFloat(cashMoney.toFixed(6)));
        $('#materialQueryBox').find('.materialInfo').removeClass('hidden');
        $('#materialQueryList').closest('.dataTables_wrapper').removeClass('hidden');
        updateTable(_materialQueryTable, rData);
    });
}