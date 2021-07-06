var _permissionList = [];
function pageReady() {
    _permissionList[568] = { uIds: ['updateSupplierBtn'] };
    _permissionList[569] = { uIds: ['addSupplierModalBtn'] };
    _permissionList[570] = { uIds: ['delSupplierBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
    $('.ms2').select2({ matcher });
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
            tr.find('.name').empty().append(e);
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
    var data = {}
    data.opType = 816;
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
        _categorySelect = `<select class="ms2 form-control category">${options}</select>`;
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(nameSelect);
        }
    });
}

//名称选项
function nameSelect(resolve) {
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
    data.opType = 824;
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
    var data = {}
    data.opType = 824;
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
    data.opType = 831;
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
        var order = function (a, b, c, d) {
            return ++d.row;
        }
        var category = function (data) {
            return `<span class="textOn" id=${data.CategoryId}>${data.Category}</span><div class="textIn hidden">${_categorySelect}</div>`;
        }
        var name = function (data) {
            return `<span class="textOn" id=${data.NameId}>${data.Name}</span><div class="textIn hidden"><select class="ms2 form-control name"></select></div>`;
        }
        var supplier = function (data) {
            return `<span class="textOn supplierOld">${data}</span><input type="text" class="form-control text-center textIn supplier hidden" maxlength="20" style="width:120px" value=${data}>`;
        }
        var remark = function (data) {
            return (data.length > tdShowLength
                ? `<span title = "${data}" class="textOn" onclick = "showAllContent('${escape(data)}')">${data.substring(0, tdShowLength)}...</span>`
                : `<span title = "${data}" class="textOn">${data}</span>`)
                + '<textarea class="form-control textIn remark hidden" maxlength = "500" style = "resize: vertical;width:250px;margin:auto"></textarea>';
        }
        var tf = _permissionList[568].have || _permissionList[570].have;
        $("#supplierList")
            .DataTable({
                dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": oLanguage,
                "data": rData,
                "aaSorting": [[1, "asc"]],
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数
                "columns": [
                    { "data": "Id", "title": "选择", "render": isEnable, "orderable": false, "visible": tf },
                    { "data": null, "title": "序号", "render": order },
                    { "data": null, "title": "类别", "render": category },
                    { "data": null, "title": "名称", "render": name },
                    { "data": "Supplier", "title": "供应商", "render": supplier },
                    { "data": "Remark", "title": "备注", "render": remark }
                ],
                "drawCallback": function (settings, json) {
                    $(this).find('.icb_minimal').iCheck({
                        labelHover: false,
                        cursor: true,
                        checkboxClass: 'icheckbox_minimal-blue',
                        radioClass: 'iradio_minimal-blue',
                        increaseArea: '20%'
                    });
                    $(this).find('.ms2').select2({ width: '120px', matcher });
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
                                var remarkName = textOn.eq(3).attr("title");
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
    var trs = $('#supplierList tbody').find('tr');
    var nameData = [];
    var i = 0, len = trs.length;
    for (; i < len; i++) {
        var tr = trs.eq(i);
        var isEnable = tr.find('.isEnable');
        if (isEnable.is(':checked')) {
            var id = isEnable.val();
            var nameId = tr.find('.name').val();
            if (isStrEmptyOrUndefined(nameId)) {
                layer.msg("请选择名称");
                return;
            }
            var supplier = tr.find('.supplier').val().trim();
            if (isStrEmptyOrUndefined(supplier)) {
                layer.msg("供应商不能为空");
                return;
            }
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
        data.opType = 832;
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
    tableNameSelect(null, categoryId, $('#addNameSelect'), 0);
    $('#addSupplier').val('');
    $('#addRemark').val('');
    $('#addSupplierModal').modal('show');
}

//添加货品供应商信息
function addSupplier() {
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
        data.opType = 833;
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
    if (!_supplierIdData.length) {
        layer.msg("请选择要删除的货品供应商");
        return;
    }
    var name = _supplierNameData.join('<br>');
    var doSth = function () {
        var data = {}
        data.opType = 834;
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