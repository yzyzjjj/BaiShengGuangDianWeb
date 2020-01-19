function pageReady() {
    $('.ms2').select2();
    var categoryId, nameId;
    new Promise(function (resolve, reject) {
        categorySelect(resolve);
    }).then(function (nameSelect) {
        categoryId = $('#categorySelect').val();
        return new Promise(function (resolve, reject) {
            nameSelect(resolve, categoryId, false);
        });
    }).then(function (supplierSelect) {
        nameId = $('#nameSelect').val();
        return new Promise(function (resolve, reject) {
            supplierSelect(resolve, categoryId, nameId, false);
        });
    }).then(function (getSpecificationList) {
        getSpecificationList();
    });
    //页面
    $('#categorySelect').on('select2:select', function () {
        categoryId = $(this).val();
        new Promise(function (resolve, reject) {
            nameSelect(resolve, categoryId, false);
        }).then(function (supplierSelect) {
            nameId = $('#nameSelect').val();
            if (isStrEmptyOrUndefined(nameId)) {
                $('#supplierSelect').empty();
            }
            return new Promise(function (resolve, reject) {
                supplierSelect(resolve, categoryId, nameId, false);
            });
        }).then(function (getSpecificationList) {
            getSpecificationList();
        });
    });
    $('#nameSelect').on('select2:select', function () {
        categoryId = $('#categorySelect').val();
        nameId = $(this).val();
        new Promise(function (resolve, reject) {
            supplierSelect(resolve, categoryId, nameId, false);
        }).then(function (getSpecificationList) {
            getSpecificationList();
        });
    });
    $('#supplierSelect').on('select2:select', function () {
        getSpecificationList();
    });
    //表格
    $('#specificationList').on('change', '.category', function () {
        var tr = $(this).parents('tr');
        categoryId = $(this).val();
        new Promise(function (resolve, reject) {
            nameSelect(resolve, categoryId, true);
        }).then(function (e) {
            tr.find('.name').empty();
            tr.find('.name').append(e);
            nameId = tr.find('.name').val();
            if (isStrEmptyOrUndefined(e)) {
                tr.find('.supplier').empty();
            }
            return new Promise(function (resolve, reject) {
                supplierSelect(resolve, categoryId, nameId, true);
            });
        }).then(function (e) {
            tr.find('.supplier').empty();
            tr.find('.supplier').append(e);
        });
    });
    $('#specificationList').on('change', '.name', function () {
        var tr = $(this).parents('tr');
        categoryId = tr.find('.category').val();
        nameId = $(this).val();
        new Promise(function (resolve, reject) {
            supplierSelect(resolve, categoryId, nameId, true);
        }).then(function (e) {
            tr.find('.supplier').empty();
            tr.find('.supplier').append(e);
        });
    });
    //模态框
    $('#addCategorySelect').on('select2:select', function () {
        categoryId = $(this).val();
        new Promise(function (resolve, reject) {
            nameSelect(resolve, categoryId, true);
        }).then(function (e) {
            $('#addNameSelect').empty();
            $('#addNameSelect').append(e);
            nameId = $('#addNameSelect').val();
            if (isStrEmptyOrUndefined(e)) {
                $('#addSupplierSelect').empty();
            }
            return new Promise(function (resolve, reject) {
                supplierSelect(resolve, categoryId, nameId, true);
            });
        }).then(function (e) {
            $('#addSupplierSelect').empty();
            $('#addSupplierSelect').append(e);
        });
    });
    $('#addNameSelect').on('select2:select', function () {
        categoryId = $('#addCategorySelect').val();
        nameId = $(this).val();
        new Promise(function (resolve, reject) {
            supplierSelect(resolve, categoryId, nameId, true);
        }).then(function (e) {
            $('#addSupplierSelect').empty();
            $('#addSupplierSelect').append(e);
        });
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
        _categorySelect = `<select class="form-control textIn category hidden" style="width:100px">${options}</select>`;
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(nameSelect);
        }
    });
}

//名称选项
function nameSelect(resolve, categoryId, isTable) {
    var opType = 824;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var list = {};
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
        var listData = ret.datas;
        var i, len = listData.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = listData[i];
            options += option.format(d.Id, d.Name);
        }
        if (!isTable) {
            $('#nameSelect').empty();
            if (len) {
                $('#nameSelect').append(option.format(0, '所有名称'));
            }
            $('#nameSelect').append(options);
        }
        if (!isStrEmptyOrUndefined(resolve)) {
            isTable ? resolve(options) : resolve(supplierSelect);
        }
    }, !isTable);
}

//供应商选项
function supplierSelect(resolve, categoryId, nameId, isTable) {
    var opType = 831;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var list = {};
    if (isStrEmptyOrUndefined(categoryId)) {
        layer.msg('请选择货品类别');
        return;
    }
    if (categoryId != 0) {
        list.categoryId = categoryId;
    }
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
        var listData = ret.datas;
        var i, len = listData.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = listData[i];
            options += option.format(d.Id, d.Supplier);
        }
        if (!isTable) {
            $('#supplierSelect').empty();
            if (len) {
                $('#supplierSelect').append(option.format(0, '所有供应商'));
            }
            $('#supplierSelect').append(options);
        }
        if (!isStrEmptyOrUndefined(resolve)) {
            isTable ? resolve(options) : resolve(getSpecificationList);
        }
    }, !isTable);
}

//获取规格信息
function getSpecificationList() {
    var opType = 839;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    _specificationIdData = [];
    _specificationNameData = [];
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
    var supplierId = $('#supplierSelect').val();
    if (isStrEmptyOrUndefined(supplierId)) {
        layer.msg('请选择货品供应商');
        return;
    }
    if (supplierId != 0) {
        list.supplierId = supplierId;
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
            return `<span class="textOn" id=${data.NameId}>${data.Name}</span><select class="form-control textIn name hidden" style="width:100px"></select>`;
        }
        var supplier = function (data) {
            return `<span class="textOn" id=${data.SupplierId}>${data.Supplier}</span><select class="form-control textIn supplier hidden" style="width:100px"></select>`;
        }
        var specification = function (data) {
            return `<span class="textOn specificationOld">${data}</span><input type="text" class="form-control text-center textIn specification hidden" maxlength="20" style="width:120px" value=${data}>`;
        }
        var remark = function (data) {
            return `<span class="textOn">${data}</span><textarea class="form-control textIn remark hidden" maxlength="500" style="resize: vertical;width:250px;margin:auto">${data}</textarea>`;
        }
        $("#specificationList")
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
                    { "data": null, "title": "供应商", "render": supplier },
                    { "data": "Specification", "title": "规格", "render": specification },
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
                    $('#specificationList .isEnable').on('ifChanged', function () {
                        var tr = $(this).parents('tr');
                        var id = $(this).val();
                        var n = tr.find('.specificationOld').text();
                        if ($(this).is(':checked')) {
                            _specificationIdData.push(id);
                            _specificationNameData.push(n);
                            var textOn = tr.find('.textOn');
                            var categoryName = textOn.eq(0).attr('id');
                            var nameName;
                            new Promise(function (resolve, reject) {
                                nameSelect(resolve, categoryName, true);
                            }).then(function (e) {
                                tr.find('.name').empty();
                                tr.find('.name').append(e);
                                nameName = textOn.eq(1).attr('id');
                                return new Promise(function (resolve, reject) {
                                    supplierSelect(resolve, categoryName, nameName, true);
                                });
                            }).then(function (e) {
                                tr.find('.supplier').empty();
                                tr.find('.supplier').append(e);
                                var supplierName = textOn.eq(2).attr('id');
                                var specificationName = textOn.eq(3).text();
                                var remarkName = textOn.eq(4).text();
                                tr.find('.category').val(categoryName);
                                tr.find('.name').val(nameName);
                                tr.find('.supplier').val(supplierName);
                                tr.find('.specification').val(specificationName);
                                tr.find('.remark').val(remarkName);
                                tr.find('.textIn').removeClass('hidden').siblings('.textOn').addClass('hidden');
                            });
                        } else {
                            _specificationIdData.splice(_specificationIdData.indexOf(id), 1);
                            _specificationNameData.splice(_specificationNameData.indexOf(n), 1);
                            tr.find('.textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
                        }
                    });
                }
            });
    });
}

//保存规格信息
function updateSpecification() {
    var opType = 840;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var trs = $('#specificationList tbody').find('tr');
    var nameData = [];
    var i = 0, len = trs.length;
    for (; i < len; i++) {
        var tr = trs.eq(i);
        var isEnable = tr.find('.isEnable');
        if (isEnable.is(':checked')) {
            var id = isEnable.val();
            var supplierId = tr.find('.supplier').val();
            if (isStrEmptyOrUndefined(supplierId)) {
                layer.msg("请选择供应商");
                return;
            }
            var specification = tr.find('.specification').val().trim();
            if (isStrEmptyOrUndefined(specification)) {
                layer.msg("规格不能为空");
                return;
            }
            var remark = tr.find('.remark').val().trim();
            nameData.push({
                SupplierId: supplierId,
                Specification: specification,
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
                    getSpecificationList();
                }
            });
    }
    showConfirm("保存", doSth);
}

//添加货品规格模态框
function addSpecificationModal() {
    var categoryId = $('#categorySelect').val();
    if (categoryId == 0) {
        categoryId = $('#addCategorySelect option').eq(0).val();
    }
    $('#addCategorySelect').val(categoryId).trigger("change");
    new Promise(function (resolve, reject) {
        nameSelect(resolve, categoryId, true);
    }).then(function (e) {
        $('#addNameSelect').empty();
        $('#addNameSelect').append(e);
        var nameId = $('#addNameSelect').val();
        return new Promise(function (resolve, reject) {
            supplierSelect(resolve, categoryId, nameId, true);
        });
    }).then(function (e) {
        $('#addSupplierSelect').empty();
        $('#addSupplierSelect').append(e);
    });
    $('#addSpecification').val('');
    $('#addRemark').val('');
    $('#addSpecificationModal').modal('show');
}

//添加货品规格信息
function addSpecification() {
    var opType = 841;
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
    var supplierId = $('#addSupplierSelect').val();
    if (isStrEmptyOrUndefined(supplierId)) {
        layer.msg("请选择供应商");
        return;
    }
    var specification = $('#addSpecification').val().trim();
    if (isStrEmptyOrUndefined(specification)) {
        layer.msg("请输入新规格");
        return;
    }
    var remark = $('#addRemark').val().trim();
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            SupplierId: supplierId,
            Specification: specification,
            Remark: remark
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                $("#addSpecificationModal").modal("hide");
                if (ret.errno == 0) {
                    getSpecificationList();
                }
            });
    }
    showConfirm("添加", doSth);
}

var _specificationIdData = [];
var _specificationNameData = [];
//删除货品规格
function delSpecification() {
    var opType = 842;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    if (!_specificationIdData.length) {
        layer.msg("请选择要删除的货品规格");
        return;
    }
    var name = _specificationNameData.join('<br>');
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            ids: _specificationIdData
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getSpecificationList();
                }
            });
    }
    showConfirm(`删除以下货品规格：<pre style="color:red">${name}</pre>`, doSth);
}