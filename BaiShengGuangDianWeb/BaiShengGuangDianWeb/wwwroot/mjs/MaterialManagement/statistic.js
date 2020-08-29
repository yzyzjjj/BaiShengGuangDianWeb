function pageReady() {
    $('.ms2').select2({ matcher });
    $('#materialMonth').val(getNowMonth()).datepicker('update');
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
}

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
            $('#materialCategory').empty().append(`<option value="0">所有类别</option>${setOptions(ret.Categories, 'Category')}`);
            $('#materialSite').empty().append(`<option value="0">所有位置</option>${setOptions(ret.Sites, 'Site')}`);
        case 1:
            $('#materialName').empty().append(`<option value="0">所有名称</option>${setOptions(ret.Names, 'Name')}`);
        case 2:
            $('#materialSupplier').empty().append(`<option value="0">所有供应商</option>${setOptions(ret.Suppliers, 'Supplier')}`);
        case 3:
            $('#materialSpecification').empty().append(`<option value="0">所有规格</option>${setOptions(ret.Specifications, 'Specification')}`);
    }
    getMaterialList();
}

//获取物料结存表
function getMaterialList() {
    $('#materialInfo').addClass('hidden');
    let time = $('#materialMonth').val();
    if (isStrEmptyOrUndefined(time)) {
        layer.msg('请选择月份');
        return;
    }
    time += '-01';
    const categoryId = $('#materialCategory').val();
    if (isStrEmptyOrUndefined(categoryId)) {
        layer.msg('请选择类别');
        return;
    }
    const nameId = $('#materialName').val();
    if (isStrEmptyOrUndefined(nameId)) {
        layer.msg('请选择名称');
        return;
    }
    const supplierId = $('#materialSupplier').val();
    if (isStrEmptyOrUndefined(supplierId)) {
        layer.msg('请选择供应商');
        return;
    }
    const specificationId = $('#materialSpecification').val();
    if (isStrEmptyOrUndefined(specificationId)) {
        layer.msg('请选择规格');
        return;
    }
    const siteId = $('#materialSite').val();
    if (isStrEmptyOrUndefined(siteId)) {
        layer.msg('请选择位置');
        return;
    }
    const data = {}
    data.opType = 891;
    data.opData = JSON.stringify({
        day: time,
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
        $('#entryMoney').text(parseFloat(entryMoney.toFixed(5)));
        $('#consumeMoney').text(parseFloat(consumeMoney.toFixed(5)));
        $('#cashMoney').text(parseFloat(cashMoney.toFixed(5)));
        $('#materialInfo').removeClass('hidden');
        $('#materialList').DataTable({
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
            ]
        });
    });
}