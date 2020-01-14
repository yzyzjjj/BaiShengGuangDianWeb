function pageReady() {
    $('.ms2').select2();
    //categorySelect();
    //nameSelect();
    //getSupplierList();

    var categoryFunc = new Promise(function (resolve, reject) {
        categorySelect();
        resolve('categoryFunc');
    });
    var nameFunc = new Promise(function (resolve, reject) {
        nameSelect();
        resolve('nameFunc');
    });
    var supplierFunc = new Promise(function (resolve, reject) {
        supplierSelect();
        resolve('supplierFunc');
    });
    var specificationFunc = new Promise(function (resolve, reject) {
        specificationSelect();
        resolve('specificationFunc');
    });
    Promise.all([categoryFunc, nameFunc, supplierFunc, specificationFunc])
        .then((result) => {
            //console.log('准备工作完毕');
            getMaterialList(true);
            //console.log(result);
        });
}

//类别选项
function categorySelect() {
    var opType = 816;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#categorySelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Category);
        }
        $('#categorySelect').append(option.format(0, '所有类别'));
        $('#categorySelect').append(options);
    });
}

//名称选项
function nameSelect() {
    var opType = 824;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#nameSelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Name);
        }
        $('#nameSelect').append(option.format(0, '所有名称'));
        $('#nameSelect').append(options);
    });
}

//供应商选项
function supplierSelect() {
    var opType = 831;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#supplierSelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Supplier);
        }
        $('#supplierSelect').append(option.format(0, '所有供应商'));
        $('#supplierSelect').append(options);
    });
}

//规格选项
function specificationSelect() {
    var opType = 839;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#specificationSelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Name);
        }
        $('#specificationSelect').append(option.format(0, '所有规格'));
        $('#specificationSelect').append(options);
    });
}

//获取物料信息
function getMaterialList(isFirst = false) {
    var opType = 800;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var list = {};
    var categoryId = $('#categorySelect').val();
    if (isFirst)
        categoryId = 0;
    if (isStrEmptyOrUndefined(categoryId)) {
        layer.msg('请选择货品类别');
        return;
    }
    if (categoryId != 0) {
        list.categoryId = categoryId;
    }

    var nameId = $('#nameSelect').val();
    if (isFirst)
        nameId = 0;
    if (isStrEmptyOrUndefined(nameId)) {
        layer.msg('请选择货品名称');
        return;
    }
    if (nameId != 0) {
        list.nameId = nameId;
    }

    var supplierId = $('#supplierSelect').val();
    if (isFirst)
        supplierId = 0;
    if (isStrEmptyOrUndefined(supplierId)) {
        layer.msg('请选择供应商名称');
        return;
    }
    if (supplierId != 0) {
        list.supplierId = supplierId;
    }

    var specificationId = $('#specificationSelect').val();
    if (isFirst)
        specificationId = 0;
    if (isStrEmptyOrUndefined(specificationId)) {
        layer.msg('请选择规格名称');
        return;
    }
    if (specificationId != 0) {
        list.specificationId = specificationId;
    }

    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var isEnable = function (data) {
            return `<input type="checkbox" class="icb_minimal isEnable" value=${data}>`;
        }
        var category = function (data) {
            return `<span class="textOn" id=${data.CategoryId}>${data.Category}</span>${_categorySelect}`;
        }
        var name = function (data) {
            return `<span class="textOn" id=${data.NameId}>${data.Name}</span>${_nameSelect}`;
        }
        var supplier = function (data) {
            return `<span class="textOn supplierOld">${data}</span><input type="text" class="form-control text-center textIn supplier hidden" maxlength="20" value=${data}>`;
        }
        var remark = function (data) {
            return `<span class="textOn">${data}</span><textarea class="form-control textIn remark hidden" maxlength="500" style="resize: vertical">${data}</textarea>`;
        }
        var o = 0;
        var order = function (data, type, row) {
            return ++o;
        }
        $("#materialList")
            .DataTable({
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": { "url": "/content/datatables_language.json" },
                "data": rData,
                "aaSorting": [[1, "asc"]],
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Code", "title": "货品编号" },
                    { "data": "Category", "title": "类别" },
                    { "data": "Name", "title": "名称" },
                    { "data": "Supplier", "title": "供应商" },
                    { "data": "Specification", "title": "规格" },
                    { "data": "Unit", "title": "单位" },
                    { "data": null, "title": "详情", "render": detail },
                    { "data": "Price", "title": "价格" },
                    { "data": "Stock", "title": "最低库存" },
                    { "data": "Number", "title": "库存数量", "render": remark },
                    { "data": "Remark", "title": "备注", "render": remark }
                ]
            });
    });
}