function pageReady() {
    $('.ms2').select2();
    var one = new Promise(function (resolve, reject) {
        categorySelect(resolve);
    });
    one.then(function (fn) {
        return new Promise(function (resolve, reject) {
            fn(resolve);
        });
    }).then(function (fn) {
        fn();
    });
    $('#categorySelect').on('select2:select', function () {
        var two = new Promise(function (resolve, reject) {
            nameSelect(resolve);
        });
        two.then(function (fn) {
            fn();
        });
    });
    $('#nameSelect').on('select2:select', function () {
        getSupplierList();
    });
    $('#supplierList').on('change', '.category', function () {
        var tr = $(this).parents('tr');
        var categoryId = $(this).val();
        new Promise(function (resolve, reject) {
            tableNameSelect(resolve, categoryId, null, 0);
        }).then(function (e) {
            tr.find('.name').empty();
            tr.find('.name').append(e);
        });
    });
    $('#addCategorySelect').on('select2:select', function () {
        var categoryId = $(this).val();
        tableNameSelect(null, categoryId, $('#addNameSelect'), 1);
    });
}

var _categorySelect = null;
//类别选项
function categorySelect(resolve) {
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
        $('.categorySelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Category);
        }
        if (len) {
            $('#categorySelect').append(option.format(0, '所有类别'));
        }
        $('.categorySelect').append(options);
        _categorySelect = `<select class="form-control textIn category hidden">${options}</select>`;
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(nameSelect);
        }
    });
}

//名称选项
function nameSelect(resolve) {
    var opType = 824;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var list = {};
    var categoryId = $('#categorySelect').val();
    if (isStrEmptyOrUndefined(categoryId)) {
        layer.msg('请选择货品类别');
        return;
    }
    if (categoryId != 0) {
        list.categoryId = categoryId;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#nameSelect').empty();
        var listData = ret.datas;
        var i, len = listData.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = listData[i];
            options += option.format(d.Id, d.Name);
        }
        if (len) {
            $('#nameSelect').append(option.format(0, '所有名称'));
        }
        $('#nameSelect').append(options);
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(getSupplierList);
        }
    });
}

//表格名称选项
function tableNameSelect(resolve, categoryId, el, tf) {
    var opType = 824;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        categoryId: categoryId
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var listData = ret.datas;
        var i, len = listData.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = listData[i];
            options += option.format(d.Id, d.Name);
        }
        if (!isStrEmptyOrUndefined(el)) {
            el.empty();
            el.append(options);
        }
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(options);
        }
    }, tf);
}

//获取供应商信息
function getSupplierList() {
    var opType = 831;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    _supplierIdData = [];
    _supplierNameData = [];
    var list = {};
    var categoryId = $('#categorySelect').val();
    if (isStrEmptyOrUndefined(categoryId)) {
        layer.msg('请选择货品类别');
        return;
    }
    if (categoryId != 0) {
        list.categoryId = categoryId;
    }
    var nameId = $('#nameSelect').val();
    if (isStrEmptyOrUndefined(nameId)) {
        layer.msg('请选择货品名称');
        return;
    }
    if (nameId != 0) {
        list.nameId = nameId;
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
        var number = 0;
        var order = function () {
            return ++number;
        }
        var category = function (data) {
            return `<span class="textOn" id=${data.CategoryId}>${data.Category}</span>${_categorySelect}`;
        }
        var name = function (data) {
            return `<span class="textOn" id=${data.NameId}>${data.Name}</span><select class="form-control textIn name hidden"></select>`;
        }
        var supplier = function (data) {
            return `<span class="textOn supplierOld">${data}</span><input type="text" class="form-control text-center textIn supplier hidden" maxlength="20" value=${data}>`;
        }
        var remark = function (data) {
            return `<span class="textOn">${data}</span><textarea class="form-control textIn remark hidden" maxlength="500" style="resize: vertical;width:100%">${data}</textarea>`;
        }
        $("#supplierList")
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
                    { "data": "Id", "title": "选择", "render": isEnable },
                    { "data": null, "title": "序号", "render": order },
                    { "data": null, "title": "类别", "render": category },
                    { "data": null, "title": "名称", "render": name },
                    { "data": "Supplier", "title": "供应商", "render": supplier },
                    { "data": "Remark", "title": "备注", "render": remark }
                ],
                "columnDefs": [
                    { "orderable": false, "targets": 0 }
                ],
                "drawCallback": function (settings, json) {
                    $(this).find('.icb_minimal').iCheck({
                        labelHover: false,
                        cursor: true,
                        checkboxClass: 'icheckbox_minimal-blue',
                        radioClass: 'iradio_minimal-blue',
                        increaseArea: '20%'
                    });
                    $(this).find('td').css("verticalAlign", "middle");
                    $('#supplierList .isEnable').on('ifChanged', function () {
                        var tr = $(this).parents('tr');
                        var id = $(this).val();
                        var n = tr.find('.supplierOld').text();
                        if ($(this).is(':checked')) {
                            _supplierIdData.push(id);
                            _supplierNameData.push(n);
                            var textOn = tr.find('.textOn');
                            var categoryName = textOn.eq(0).attr('id');
                            new Promise(function (resolve, reject) {
                                tableNameSelect(resolve, categoryName, null, 0);
                            }).then(function (e) {
                                tr.find('.name').empty();
                                tr.find('.name').append(e);
                                var nameName = textOn.eq(1).attr('id');
                                var supplierName = textOn.eq(2).text();
                                var remarkName = textOn.eq(3).text();
                                tr.find('.category').val(categoryName);
                                tr.find('.name').val(nameName);
                                tr.find('.supplier').val(supplierName);
                                tr.find('.remark').val(remarkName);
                                tr.find('.textIn').removeClass('hidden').siblings('.textOn').addClass('hidden');
                            });
                        } else {
                            _supplierIdData.splice(_supplierIdData.indexOf(id), 1);
                            _supplierNameData.splice(_supplierNameData.indexOf(n), 1);
                            tr.find('.textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
                        }
                    });
                }
            });
    });
}

//保存供应商信息
function updateSupplier() {
    var opType = 832;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var trs = $('#supplierList tbody').find('tr');
    var nameData = [];
    var i = 0, len = trs.length;
    if (!len) {
        layer.msg("未检测到货品名称数据");
        return;
    }
    for (; i < len; i++) {
        var tr = trs.eq(i);
        var isEnable = tr.find('.isEnable');
        if (isEnable.is(':checked')) {
            var id = isEnable.val();
            var nameId = tr.find('.name').val();
            var supplier = tr.find('.supplier').val().trim();
            var remark = tr.find('.remark').val().trim();
            nameData.push({
                NameId: nameId,
                Supplier: supplier,
                Remark: remark,
                Id: id
            });
        }
    }
    if (!nameData.length) {
        layer.msg("请选择要保存的数据");
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(nameData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getSupplierList();
                }
            });
    }
    showConfirm("保存", doSth);
}

//添加货品名称模态框
function addSupplierModal() {
    var categoryId = $('#categorySelect').val();
    if (categoryId == 0) {
        categoryId = $('#addCategorySelect option').eq(0).val();
    }
    $('#addCategorySelect').val(categoryId).trigger("change");
    new Promise(function(resolve, reject) {
        tableNameSelect(resolve, categoryId, $('#addNameSelect'), 0);
    }).then(function() {
        var nameId = $('#nameSelect').val();
        if (nameId == 0) {
            nameId = $('#addNameSelect option').eq(0).val();
        }
        $('#addNameSelect').val(nameId).trigger("change");
    });
    $('#addSupplier').val('');
    $('#addRemark').val('');
    $('#addSupplierModal').modal('show');
}

//添加货品供应商信息
function addSupplier() {
    var opType = 833;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var categoryId = $('#addCategorySelect').val();
    if (isStrEmptyOrUndefined(categoryId)) {
        layer.msg("请选择类别");
        return;
    }
    var nameId = $('#addNameSelect').val();
    if (isStrEmptyOrUndefined(nameId)) {
        layer.msg("请选择名称");
        return;
    }
    var supplierName = $('#addSupplier').val().trim();
    if (isStrEmptyOrUndefined(supplierName)) {
        layer.msg("新供应商不能为空");
        return;
    }
    var remark = $('#addRemark').val().trim();
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            NameId: nameId,
            Supplier: supplierName,
            Remark: remark
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                $("#addSupplierModal").modal("hide");
                if (ret.errno == 0) {
                    getSupplierList();
                }
            });
    }
    showConfirm("添加", doSth);
}

var _supplierIdData = [];
var _supplierNameData = [];
//删除货品供应商
function delSupplier() {
    var opType = 834;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    if (!_supplierIdData.length) {
        layer.msg("请选择要删除的货品供应商");
        return;
    }
    var name = _supplierNameData.join('<br>');
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            ids: _supplierIdData
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getSupplierList();
                }
            });
    }
    showConfirm(`删除以下货品供应商：<pre style="color:red">${name}</pre>`, doSth);
}