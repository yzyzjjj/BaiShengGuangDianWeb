﻿var _permissionList = [];
function pageReady() {
    _permissionList[545] = { uIds: ['updateMaterialBtn'] };
    _permissionList[546] = { uIds: ['addMaterialModalBtn'] };
    _permissionList[547] = { uIds: ['batchAddMaterialModalBtn'] };
    _permissionList[548] = { uIds: ['delMaterialBtn'] };
    _permissionList[549] = { uIds: ['updateImgBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
    $('.ms2').select2({ matcher });
    $('.msTag2').select2({
        tags: true,
        createTag: params => {
            return {
                id: `tag${params.term}`,
                text: params.term
            }
        },
        matcher
    });
    siteSelect();
    var categoryId, nameId, supplierId;
    var categoryFunc = new Promise(function (resolve) {
        categorySelect(resolve);
    });
    var nameFunc = new Promise(function (resolve) {
        nameSelect(resolve, '0', false);
    });
    var supplierFunc = new Promise(function (resolve) {
        supplierSelect(resolve, '0', '0', false);
    });
    var specificationFunc = new Promise(function (resolve) {
        specificationSelect(resolve, '0', '0', '0', false);
    });
    var siteFunc = new Promise(function (resolve) {
        siteSelect(resolve);
    });
    Promise.all([categoryFunc, nameFunc, supplierFunc, specificationFunc, siteFunc])
        .then((result) => {
            getMaterialList();
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
                $('#specificationSelect').empty();
            }
            return new Promise(function (resolve, reject) {
                supplierSelect(resolve, categoryId, nameId, false);
            });
        }).then(function (specificationSelect) {
            supplierId = $('#supplierSelect').val();
            if (isStrEmptyOrUndefined(supplierId)) {
                $('#specificationSelect').empty();
            }
            return new Promise(function (resolve, reject) {
                specificationSelect(resolve, categoryId, nameId, supplierId, false);
            });
        }).then(function (getMaterialList) {
            getMaterialList();
        });
    });
    $('#nameSelect').on('select2:select', function () {
        categoryId = $('#categorySelect').val();
        nameId = $(this).val();
        new Promise(function (resolve, reject) {
            supplierSelect(resolve, categoryId, nameId, false);
        }).then(function (specificationSelect) {
            supplierId = $('#supplierSelect').val();
            if (isStrEmptyOrUndefined(supplierId)) {
                $('#specificationSelect').empty();
            }
            return new Promise(function (resolve, reject) {
                specificationSelect(resolve, categoryId, nameId, supplierId, false);
            });
        }).then(function (getMaterialList) {
            getMaterialList();
        });
    });
    $('#supplierSelect').on('select2:select', function () {
        categoryId = $('#categorySelect').val();
        nameId = $('#nameSelect').val();
        supplierId = $(this).val();
        new Promise(function (resolve, reject) {
            specificationSelect(resolve, categoryId, nameId, supplierId, false);
        }).then(function (getMaterialList) {
            getMaterialList();
        });
    });
    $('#specificationSelect').on('select2:select', function () {
        getMaterialList();
    });
    $('#siteSelect').on('select2:select', function () {
        getMaterialList();
    });
    //表格
    $('#MaterialList').on('select2:select', '.category', function () {
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
                tr.find('.specification').empty();
            }
            return new Promise(function (resolve, reject) {
                supplierSelect(resolve, categoryId, nameId, true);
            });
        }).then(function (e) {
            tr.find('.supplier').empty();
            tr.find('.supplier').append(e);
            supplierId = tr.find('.supplier').val();
            if (isStrEmptyOrUndefined(e)) {
                tr.find('.specification').empty();
            }
            return new Promise(function (resolve, reject) {
                specificationSelect(resolve, categoryId, nameId, supplierId, true);
            });
        }).then(function (e) {
            tr.find('.specification').empty();
            tr.find('.specification').append(e);
        });
    });
    $('#MaterialList').on('select2:select', '.name', function () {
        var tr = $(this).parents('tr');
        categoryId = tr.find('.category').val();
        nameId = $(this).val();
        new Promise(function (resolve, reject) {
            supplierSelect(resolve, categoryId, nameId, true);
        }).then(function (e) {
            tr.find('.supplier').empty();
            tr.find('.supplier').append(e);
            supplierId = tr.find('.supplier').val();
            if (isStrEmptyOrUndefined(e)) {
                tr.find('.specification').empty();
            }
            return new Promise(function (resolve, reject) {
                specificationSelect(resolve, categoryId, nameId, supplierId, true);
            });
        }).then(function (e) {
            tr.find('.specification').empty();
            tr.find('.specification').append(e);
        });
    });
    $('#MaterialList').on('select2:select', '.supplier', function () {
        categoryId = tr.find('.category').val();
        nameId = tr.find('.name').val();
        supplierId = $(this).val();
        new Promise(function (resolve, reject) {
            specificationSelect(resolve, categoryId, nameId, supplierId, true);
        }).then(function (e) {
            tr.find('.specification').empty();
            tr.find('.specification').append(e);
        });
    });
    //模态框
    $('#addCategorySelect').on('select2:select', function () {
        categoryId = $(this).val();
        new Promise((resolve, reject) => {
            nameSelect(resolve, categoryId, true, reject);
        }).then(e => {
            $('#addNameSelect').empty().append(e);
            nameId = $('#addNameSelect').val();
            if (isStrEmptyOrUndefined(e)) {
                $('#addSupplierSelect,#addSpecificationSelect').empty();
            }
            return new Promise((resolve, reject) => {
                supplierSelect(resolve, categoryId, nameId, true);
            });
        }, () => {
            $('#addNameSelect,#addSupplierSelect,#addSpecificationSelect').empty();
            return Promise.reject();
        }).then(e => {
            $('#addSupplierSelect').empty().append(e);
            supplierId = $('#addSupplierSelect').val();
            if (isStrEmptyOrUndefined(e)) {
                $('#addSpecificationSelect').empty();
            }
            return new Promise((resolve, reject) => {
                specificationSelect(resolve, categoryId, nameId, supplierId, true);
            });
        }, () => Promise.reject()).then(e => {
            $('#addSpecificationSelect').empty().append(e);
        }, () => { });
    });
    $('#addNameSelect').on('select2:select', function () {
        categoryId = $('#addCategorySelect').val();
        nameId = $(this).val();
        new Promise((resolve, reject) => {
            supplierSelect(resolve, categoryId, nameId, true, reject);
        }).then(e => {
            $('#addSupplierSelect').empty().append(e);
            supplierId = $('#addSupplierSelect').val();
            if (isStrEmptyOrUndefined(e)) {
                $('#addSpecificationSelect').empty();
            }
            return new Promise(function (resolve, reject) {
                specificationSelect(resolve, categoryId, nameId, supplierId, true);
            });
        }, () => {
            $('#addSupplierSelect,#addSpecificationSelect').empty();
            return Promise.reject();
        }).then(e => {
            $('#addSpecificationSelect').empty().append(e);
        }, () => { });
    });
    $('#addSupplierSelect').on('select2:select', function () {
        categoryId = $('#addCategorySelect').val();
        nameId = $('#addNameSelect').val();
        supplierId = $(this).val();
        new Promise((resolve, reject) => {
            specificationSelect(resolve, categoryId, nameId, supplierId, true, reject);
        }).then(e => $('#addSpecificationSelect').empty().append(e), () => $('#addSpecificationSelect').empty());
    });
    $('#imgOldList').on('click', '.delImg', function () {
        $(this).parents('.imgOption').remove();
        var e = $(this).val();
        _imgNameData.splice(_imgNameData.indexOf(e), 1);
    });
    $('#batchAddMaterialModal').attr("data-backdrop", "static");
}

//刷新
function refresh() {
    $('#siteSelect').val(0).trigger('change');
    $('#categorySelect').val(0).trigger('change').trigger('select2:select');
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
        //if (len) {
        $('#categorySelect').append(option.format(0, '所有类别'));
        //}
        $('.categorySelect').append(options);
        _categorySelect = `<select class="ms2 form-control category">${options}</select>`;
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(nameSelect);
        }
    });
}

//名称选项
function nameSelect(resolve, categoryId, isTable, reject) {
    var list = {};
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
            reject('error');
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
            //if (len) {
            $('#nameSelect').append(option.format(0, '所有名称'));
            //}
            $('#nameSelect').append(options);
        }
        if (!isStrEmptyOrUndefined(resolve)) {
            isTable ? resolve(options) : resolve(supplierSelect);
        }
    }, !isTable);
}

//供应商选项
function supplierSelect(resolve, categoryId, nameId, isTable, reject) {
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
    data.opType = 831;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            reject('error');
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
            //if (len) {
            $('#supplierSelect').append(option.format(0, '所有供应商'));
            //}
            $('#supplierSelect').append(options);
        }
        if (!isStrEmptyOrUndefined(resolve)) {
            isTable ? resolve(options) : resolve(specificationSelect);
        }
    }, !isTable);
}

//规格选项
function specificationSelect(resolve, categoryId, nameId, supplierId, isTable, reject) {
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
    if (isStrEmptyOrUndefined(supplierId)) {
        layer.msg('请选择货品供应商');
        return;
    }
    if (supplierId != 0) {
        list.supplierId = supplierId;
    }
    var data = {}
    data.opType = 839;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            reject('error');
            return;
        }
        var listData = ret.datas;
        var i, len = listData.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = listData[i];
            options += option.format(d.Id, d.Specification);
        }
        if (!isTable) {
            $('#specificationSelect').empty();
            //if (len) {
            $('#specificationSelect').append(option.format(0, '所有规格'));
            //}
            $('#specificationSelect').append(options);
        }
        if (!isStrEmptyOrUndefined(resolve)) {
            isTable ? resolve(options) : resolve(getMaterialList);
        }
    }, !isTable);
}

var _siteSelect = null;
//位置选项
function siteSelect(resolve) {
    var data = {}
    data.opType = 847;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#addSiteSelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Site);
        }
        $('#addSiteSelect').append(options);
        $('#siteSelect').empty();
        $('#siteSelect').append(option.format(0, '所有位置'));
        $('#siteSelect').append(options);
        _siteSelect = `<select class="ms2 form-control site">${options}</select>`;
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve('success');
        }
    });
}

var _codeData = null;
//货品管理列表
function getMaterialList() {
    _materialIdData = [];
    _materialNameData = [];
    _codeData = {};
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
    var specificationId = $('#specificationSelect').val();
    if (isStrEmptyOrUndefined(specificationId)) {
        layer.msg('请选择货品规格');
        return;
    }
    if (specificationId != 0) {
        list.specificationId = specificationId;
    }

    var siteId = $('#siteSelect').val();
    if (isStrEmptyOrUndefined(siteId)) {
        layer.msg('请选择位置');
        return;
    }
    if (siteId != 0) {
        list.siteId = siteId;
    }
    var data = {}
    data.opType = 808;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            _codeData[d.Id] = d;
        }
        var isEnable = d => `<input type="checkbox" class="icb_minimal isEnable" value=${d}>`;
        var code = d => `<span class="textOn codeOld">${d}</span><input type="text" class="form-control text-center textIn code hidden" maxlength="20" style="width:120px">`;
        var category = d => `<span class="textOn">${d}</span><div class="hidden textIn">${_categorySelect}</div>`;
        var name = d => `<span class="textOn">${d}</span><div class="hidden textIn"><select class="ms2 form-control name"></select></div>`;
        var supplier = d => `<span class="textOn">${d}</span><div class="hidden textIn"><select class="ms2 form-control supplier"></select></div>`;
        var specification = d => `<span class="textOn">${d}</span><div class="hidden textIn"><select class="ms2 form-control specification"></select></div>`;
        var unit = d => `<span class="textOn">${d}</span><input type="text" class="form-control text-center textIn unit hidden" maxlength="20" style="width:80px">`;
        var site = d => `<span class="textOn">${d}</span><div class="hidden textIn">${_siteSelect}</div>`;
        var materialImg = d => `<button type="button" class="btn btn-info btn-sm" style="vertical-align:middle" onclick="showImgModel(${d.Id},\'${escape(d.Code)}\',\'${escape(d.Category)}\',\'${escape(d.Name)}\',\'${escape(d.Supplier)}\',\'${escape(d.Specification)}\',\'${escape(d.ImageList)}\',\'${escape(d.Site)}\')">查看</button>`;
        var price = d => `<span class="textOn">${d}</span><input type="text" class="form-control text-center textIn price hidden" onkeyup="onInput(this, 8, 4)" onblur="onInputEnd(this)" style="width:80px">`;
        var stock = d => `<span class="textOn">${d}</span><input type="text" class="form-control text-center textIn stock hidden" maxlength="10" style="width:80px">`;
        var remark = d => {
            d = d || '';
            return (d.length > tdShowLength
                ? `<span title = "${d}" class="textOn" onclick = "showAllContent('${escape(d)}')">${d.substring(0, tdShowLength)}...</span>`
                : `<span title = "${d}" class="textOn">${d}</span>`)
                + '<textarea class="form-control textIn remark hidden" maxlength = "500" style = "resize: vertical;width:250px;margin:auto"></textarea>';
        }
        $("#MaterialList").DataTable({
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
                { "data": "Id", "title": "选择", "render": isEnable, "orderable": false },
                { "data": null, "title": "序号", "render": (a, b, c, d) => ++d.row },
                { "data": "Code", "title": "货品编号", "render": code },
                { "data": "Category", "title": "类别", "render": category },
                { "data": "Name", "title": "名称", "render": name },
                { "data": "Supplier", "title": "供应商", "render": supplier },
                { "data": "Specification", "title": "规格", "render": specification },
                { "data": "Unit", "title": "单位", "render": unit },
                { "data": "Site", "title": "位置", "render": site },
                { "data": null, "title": "货品图片", "render": materialImg },
                { "data": "Price", "title": "参考价格", "render": price },
                { "data": "Stock", "title": "最低库存", "render": stock },
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
                $('#MaterialList .isEnable').on('ifChanged', function () {
                    var tr = $(this).parents('tr');
                    var id = $(this).val();
                    var n = tr.find('.codeOld').text();
                    if ($(this).is(':checked')) {
                        _materialIdData.push(id);
                        _materialNameData.push(n);
                        var codeData = _codeData[id];
                        var codeName = codeData.Code;
                        var categoryName = codeData.CategoryId;
                        var nameName, supplierName;
                        new Promise(resolve => nameSelect(resolve, categoryName, true)).then(e => {
                            tr.find('.name').empty().append(e);
                            nameName = codeData.NameId;
                            return new Promise(resolve => supplierSelect(resolve, categoryName, nameName, true));
                        }).then(e => {
                            tr.find('.supplier').empty().append(e);
                            supplierName = codeData.SupplierId;
                            return new Promise(resolve => specificationSelect(resolve, categoryName, nameName, supplierName, true));
                        }).then(e => {
                            tr.find('.specification').empty().append(e);
                            tr.find('.code').val(codeName);
                            tr.find('.category').val(categoryName).trigger('change');
                            tr.find('.name').val(nameName).trigger('change');
                            tr.find('.supplier').val(supplierName).trigger('change');
                            tr.find('.specification').val(codeData.SpecificationId).trigger('change');
                            tr.find('.unit').val(codeData.Unit);
                            tr.find('.site').val(codeData.SiteId).trigger('change');
                            tr.find('.price').val(codeData.Price);
                            tr.find('.stock').val(codeData.Stock);
                            tr.find('.remark').val(codeData.Remark);
                            tr.find('.textIn').removeClass('hidden').siblings('.textOn').addClass('hidden');
                        });
                    } else {
                        _materialIdData.splice(_materialIdData.indexOf(id), 1);
                        _materialNameData.splice(_materialNameData.indexOf(n), 1);
                        tr.find('.textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
                    }
                });
            }
        });
    });
}

//保存货品信息
function updateMaterial() {
    var trs = $('#MaterialList tbody').find('tr');
    var nameData = [];
    var i = 0, len = trs.length;
    for (; i < len; i++) {
        var tr = trs.eq(i);
        var isEnable = tr.find('.isEnable');
        if (isEnable.is(':checked')) {
            var id = isEnable.val();
            var code = tr.find('.code').val().trim();
            if (isStrEmptyOrUndefined(code)) {
                layer.msg("货品编号不能为空");
                return;
            }
            var specificationId = tr.find('.specification').val();
            if (isStrEmptyOrUndefined(specificationId)) {
                layer.msg("请选择货品规格");
                return;
            }
            var unit = tr.find('.unit').val().trim();
            if (isStrEmptyOrUndefined(unit)) {
                layer.msg("单位不能为空");
                return;
            }
            var siteId = tr.find('.site').val();
            if (isStrEmptyOrUndefined(siteId)) {
                layer.msg("请选择货品场地");
                return;
            }
            var price = tr.find('.price').val().trim();
            if (isStrEmptyOrUndefined(price)) {
                layer.msg("参考价格不能为空");
                return;
            }
            var stock = tr.find('.stock').val().trim();
            if (isStrEmptyOrUndefined(stock)) {
                layer.msg("最低库存不能为空");
                return;
            }
            var remark = tr.find('.remark').val().trim();
            nameData.push({
                SpecificationId: specificationId,
                SiteId: siteId,
                Code: code,
                Unit: unit,
                Price: price,
                Stock: stock,
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
        data.opType = 809;
        data.opData = JSON.stringify(nameData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getMaterialList();
                }
            });
    }
    showConfirm("保存", doSth);
}

var _addFirmwareUpload = null;
//添加货品模态框
function addMaterialModal() {
    if (_addFirmwareUpload == null) {
        _addFirmwareUpload = initFileInputMultiple("addImg", fileEnum.Material);
    }
    $("#addImg").fileinput('clear');
    $('#addImgBox').find('.file-caption-name').attr('readonly', true).attr('placeholder', '请选择图片...');
    var categoryId = $('#categorySelect').val();
    if (categoryId == 0) {
        categoryId = $('#addCategorySelect option').eq(0).val();
    }
    $('#addCategorySelect').val(categoryId).trigger("change");
    var nameId, supplierId;
    new Promise(function (resolve, reject) {
        nameSelect(resolve, categoryId, true);
    }).then(function (e) {
        $('#addNameSelect').empty();
        $('#addNameSelect').append(e);
        nameId = $('#addNameSelect').val();
        return new Promise(function (resolve, reject) {
            supplierSelect(resolve, categoryId, nameId, true);
        });
    }).then(function (e) {
        $('#addSupplierSelect').empty();
        $('#addSupplierSelect').append(e);
        supplierId = $('#addSupplierSelect').val();
        return new Promise(function (resolve, reject) {
            specificationSelect(resolve, categoryId, nameId, supplierId, true);
        });
    }).then(function (e) {
        $('#addSpecificationSelect').empty();
        $('#addSpecificationSelect').append(e);
    });
    var siteId = $('#addSiteSelect option').eq(0).val();
    $('#addSiteSelect').val(siteId).trigger("change");
    $('#addCode').val('');
    $('#addStock').val('');
    $('#addUnit').val('');
    $('#addPrice').val('');
    $('#addRemark').val('');
    $('#addMaterialModal').modal('show');
}

//添加货品信息
function addMaterial() {
    var categoryId = $('#addCategorySelect').val();
    if (isStrEmptyOrUndefined(categoryId)) {
        layer.msg("请选择类别");
        return;
    }
    categoryId = $('#addCategorySelect :selected').data('select2Tag') ? '0' : categoryId;
    var nameId = $('#addNameSelect').val();
    if (isStrEmptyOrUndefined(nameId)) {
        layer.msg("请选择名称");
        return;
    }
    nameId = $('#addNameSelect :selected').data('select2Tag') ? '0' : nameId;
    var supplierId = $('#addSupplierSelect').val();
    if (isStrEmptyOrUndefined(supplierId)) {
        layer.msg("请选择供应商");
        return;
    }
    supplierId = $('#addSupplierSelect :selected').data('select2Tag') ? '0' : supplierId;
    var specificationId = $('#addSpecificationSelect').val();
    if (isStrEmptyOrUndefined(specificationId)) {
        layer.msg("请选择规格");
        return;
    }
    specificationId = $('#addSpecificationSelect :selected').data('select2Tag') ? '0' : specificationId;
    var siteId = $('#addSiteSelect').val();
    if (isStrEmptyOrUndefined(siteId)) {
        layer.msg("请选择位置");
        return;
    }
    siteId = $('#addSiteSelect :selected').data('select2Tag') ? '0' : siteId;
    var code = $('#addCode').val().trim();
    if (isStrEmptyOrUndefined(code)) {
        layer.msg("请输入编号");
        return;
    }
    var stock = $('#addStock').val().trim();
    if (isStrEmptyOrUndefined(stock)) {
        layer.msg("请输入最低库存");
        return;
    }
    var unit = $('#addUnit').val().trim();
    if (isStrEmptyOrUndefined(unit)) {
        layer.msg("请输入单位");
        return;
    }
    var price = $('#addPrice').val().trim();
    if (isStrEmptyOrUndefined(price)) {
        price = 0;
    }
    var remark = $('#addRemark').val().trim();
    fileCallBack[fileEnum.Material] = function (fileRet) {
        if (fileRet.errno == 0) {
            var img = [];
            for (var key in fileRet.data) {
                img.push(fileRet.data[key].newName);
            }
            img = JSON.stringify(img);
            var data = {}
            data.opType = 810;
            data.opData = JSON.stringify([{
                CategoryId: categoryId,
                Category: $('#addCategorySelect :selected').text(),
                NameId: nameId,
                Name: $('#addNameSelect :selected').text(),
                SupplierId: supplierId,
                Supplier: $('#addSupplierSelect :selected').text(),
                SpecificationId: specificationId,
                Specification: $('#addSpecificationSelect :selected').text(),
                SiteId: siteId,
                Site: $('#addSiteSelect :selected').text(),
                Code: code,
                Unit: unit,
                Price: price,
                Stock: stock,
                Images: img,
                Remark: remark
            }]);
            ajaxPost("/Relay/Post", data,
                function (ret) {
                    layer.msg(ret.errmsg);
                    if (ret.errno == 0) {
                        $("#addMaterialModal").modal("hide");
                        getMaterialList();
                    }
                });
        }
    };
    var doSth = function () {
        $('#addImg').fileinput("upload");
    }
    showConfirm("添加", doSth);
}

var _materialIdData = [];
var _materialNameData = [];
//删除货品
function delMaterial() {
    if (!_materialIdData.length) {
        layer.msg("请选择要删除的货品编号");
        return;
    }
    var name = _materialNameData.join('<br>');
    var doSth = function () {
        var data = {}
        data.opType = 811;
        data.opData = JSON.stringify({
            ids: _materialIdData
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getMaterialList();
                }
            });
    }
    showConfirm(`删除以下货品编号：<pre style="color:red">${name}</pre>`, doSth);
}

var _updateFirmwareUpload = null;
var _imgNameData = null;
//查看图片模态框
function showImgModel(id, code, category, name, supplier, specification, img, site) {
    if (_updateFirmwareUpload == null) {
        _updateFirmwareUpload = initFileInputMultiple("updateImg", fileEnum.Material);
    }
    $("#updateImg").fileinput('clear');
    $('#updateImgBox').find('.file-caption-name').attr('readonly', true).attr('placeholder', '请选择张图片...');
    $('#checkId').text(id);
    code = unescape(code);
    $('#codeName').text(code);
    category = unescape(category);
    $('#categoryName').text(category);
    name = unescape(name);
    $('#nameName').text(name);
    supplier = unescape(supplier);
    $('#supplierName').text(supplier);
    specification = unescape(specification);
    $('#specificationName').text(specification);
    site = unescape(site);
    $('#siteName').text(site);
    img = unescape(img);
    $('#imgOld').empty();
    $("#imgOldList").empty();
    _imgNameData = [];
    if (isStrEmptyOrUndefined(img)) {
        $('#imgOld').append('图片：<font style="color:red" size=5>无</font>');
    } else {
        $('#imgOld').append('图片：');
        img = img.split(",");
        _imgNameData = img;
        var data = {
            type: fileEnum.Material,
            files: JSON.stringify(img)
        };
        ajaxPost("/Upload/Path", data,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }
                var imgOp = '<div class="imgOption col-lg-2 col-md-3 col-sm-4 col-xs-6">' +
                    '<div class="thumbnail">' +
                    '<img src={0} style="height:200px">' +
                    '<div class="caption text-center">' +
                    '<button type="button" class="btn btn-default glyphicon glyphicon-trash delImg" value="{1}"></button>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                var imgOps = "";
                for (var i = 0; i < ret.data.length; i++) {
                    imgOps += imgOp.format(ret.data[i].path, img[i]);
                }
                $("#imgOldList").append(imgOps);
            });
    }
    $('#showImgModel').modal('show');
}

//修改图片
function updateImg() {
    fileCallBack[fileEnum.Material] = function (fileRet) {
        if (fileRet.errno == 0) {
            var img = [];
            for (var key in fileRet.data) {
                img.push(fileRet.data[key].newName);
            }
            var imgNew = _imgNameData.concat(img);
            imgNew = JSON.stringify(imgNew);
            var id = $('#checkId').text();
            var data = {}
            data.opType = 809;
            data.opData = JSON.stringify([{
                UpdateImage: true,
                Images: imgNew,
                Id: id
            }]);
            ajaxPost("/Relay/Post", data,
                function (ret) {
                    layer.msg(ret.errmsg);
                    $('#showImgModel').modal('hide');
                    if (ret.errno == 0) {
                        getMaterialList();
                    }
                });
        }
    };
    var doSth = function () {
        $('#updateImg').fileinput("upload");
    }
    showConfirm("操作", doSth);
}

var _categoryData = null, _nameData = null, _supplierData = null, _specificationData = null, _siteData = null;
var batchAddMax = 0, batchAddMaxV = 0;

//批量添加货品模态框
function batchAddMaterialModal() {
    $('#batchAddMaterial').removeAttr("disabled");
    $('.batchAddBtn').attr("disabled", "disabled");
    resetBatchAddList();

    var categoryFunc = new Promise(function (resolve, reject) {
        var data = {}
        data.opType = 816;
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            _categoryData = ret.datas;
            resolve('success');
        }, 0);
    });

    var nameFunc = new Promise(function (resolve, reject) {
        var data = {}
        data.opType = 824;
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            _nameData = ret.datas;
            resolve('success');
        }, 0);
    });

    var supplierFunc = new Promise(function (resolve, reject) {
        var data = {}
        data.opType = 831;
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            _supplierData = ret.datas;
            resolve('success');
        }, 0);
    });

    var specificationFunc = new Promise(function (resolve, reject) {
        var data = {}
        data.opType = 839;
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            _specificationData = ret.datas;
            resolve('success');
        }, 0);
    });

    var siteFunc = new Promise(function (resolve, reject) {
        var data = {}
        data.opType = 847;
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            _siteData = ret.datas;
            resolve('success');
        }, 0);
    });

    Promise.all([categoryFunc, nameFunc, supplierFunc, specificationFunc, siteFunc])
        .then((result) => {
            //console.log(result);
            $('.batchAddBtn').removeAttr("disabled");
        });
    $('#batchAddMaterialModal').modal('show');
}

//批量添加重置
function resetBatchAddList() {
    batchAddMax = batchAddMaxV = 0;
    $('#batchAddList').empty();
}

//批量添加 添加一行
function addOneBatchAddList(categoryId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0) {
    //consumePlanList
    batchAddMax++;
    batchAddMaxV++;
    var xh = batchAddMax;
    var tr = `
        <tr id="batchAdd${xh}" value="${xh}" xh="${batchAddMaxV}">
            <td style="vertical-align: inherit;"><span class="control-label xh" id="batchAddXh${xh}">${batchAddMaxV}</span></td>
            <td><select class="ms2 form-control" id="batchAddLb${xh}"></select></td>
            <td><select class="ms2 form-control" id="batchAddMc${xh}"></select></td>
            <td><select class="ms2 form-control" id="batchAddGys${xh}"></select></td>
            <td><select class="ms2 form-control" id="batchAddGg${xh}"></select></td>
            <td><select class="ms2 form-control" id="batchAddWz${xh}"></select></td>
            <td><input class="form-control text-center" id="batchAddBh${xh}" maxlength="50" style="min-width:130px"></td>
            <td><input class="form-control text-center" id="batchAddKc${xh}" value="0" onkeyup="onInput(this, 8, 0)" onblur="onInputEnd(this)" style="min-width:80px"></td>
            <td><input class="form-control text-center" id="batchAddDw${xh}" maxlength="50" style="min-width:80px"></td>
            <td><input class="form-control text-center" id="batchAddJg${xh}" value="0" onkeyup="onInput(this, 8, 2)" onblur="onInputEnd(this)" style="min-width:80px"></td>
            <td>
                <button type="button" class="btn btn-primary btn-sm" id="copyBatchAddList${xh}" onclick="copyBatchAddList(${xh})"><i class="fa fa-copy"></i></button>
                <button type="button" class="btn btn-danger btn-sm" id="delBatchAddList${xh}" onclick="delBatchAddList(${xh})"><i class="fa fa-minus"></i></button>
            </td>
        </tr>`;

    $("#batchAddList").append(tr);

    /////////////////添加option
    ////货品类别
    //var _categoryData = [];
    var selector = "#batchAddLb" + xh;
    if (_categoryData && _categoryData.length > 0) {
        if (categoryId == 0) {
            categoryId = _categoryData[0].Id;
        }

        updateBatchAddSelect(selector, categoryId, _categoryData, "Category");
        $(selector).on('select2:select', function () {
            categoryId = $(this).find(':selected').data('select2Tag') ? 0 : $(this).val();
            var xh = $(this).parents('tr:first').attr("value");

            ////货品名称
            //var _nameData = [];
            for (var i = 0; i < _nameData.length; i++) {
                var d = _nameData[i];
                if (d.CategoryId == categoryId) {
                    nameId = d.Id;
                    break;
                }
            }
            selector = "#batchAddMc" + xh;
            nameId = updateBatchAddSelect(selector, nameId, _nameData, "Name", "CategoryId", categoryId);

            ////供应商
            //var _supplierData = [];
            for (var i = 0; i < _supplierData.length; i++) {
                var d = _supplierData[i];
                if (d.NameId == nameId) {
                    supplierId = d.Id;
                    break;
                }
            }
            selector = "#batchAddGys" + xh;
            supplierId = updateBatchAddSelect(selector, supplierId, _supplierData, "Supplier", "NameId", nameId);

            ////规格型号
            //var _specificationData = [];
            for (var i = 0; i < _specificationData.length; i++) {
                var d = _specificationData[i];
                if (d.SupplierId == supplierId) {
                    specificationId = d.Id;
                    break;
                }
            }
            selector = "#batchAddGg" + xh;
            updateBatchAddSelect(selector, specificationId, _specificationData, "Specification", "SupplierId", supplierId);
        });

        ////货品名称
        //var _nameData = [];
        selector = "#batchAddMc" + xh;
        if (nameId == 0) {
            nameId = updateBatchAddSelect(selector, nameId, _nameData, "Name", "CategoryId", categoryId);
        } else {
            updateBatchAddSelect(selector, nameId, _nameData, "Name", "CategoryId", categoryId);
        }
        $(selector).on('select2:select', function () {
            nameId = $(this).find(':selected').data('select2Tag') ? 0 : $(this).val();
            var xh = $(this).parents('tr:first').attr("value");

            ////供应商
            //var _supplierData = [];
            for (var i = 0; i < _supplierData.length; i++) {
                var d = _supplierData[i];
                if (d.NameId == nameId) {
                    supplierId = d.Id;
                    break;
                }
            }
            selector = "#batchAddGys" + xh;
            supplierId = updateBatchAddSelect(selector, supplierId, _supplierData, "Supplier", "NameId", nameId);

            ////规格型号
            //var _specificationData = [];
            for (var i = 0; i < _specificationData.length; i++) {
                var d = _specificationData[i];
                if (d.SupplierId == supplierId) {
                    specificationId = d.Id;
                    break;
                }
            }
            selector = "#batchAddGg" + xh;
            updateBatchAddSelect(selector, specificationId, _specificationData, "Specification", "SupplierId", supplierId);
        });

        ////供应商
        //var _supplierData = [];
        selector = "#batchAddGys" + xh;
        if (supplierId == 0) {
            supplierId = updateBatchAddSelect(selector, supplierId, _supplierData, "Supplier", "NameId", nameId);
        } else {
            updateBatchAddSelect(selector, supplierId, _supplierData, "Supplier", "NameId", nameId);
        }
        $(selector).on('select2:select', function () {
            supplierId = $(this).find(':selected').data('select2Tag') ? 0 : $(this).val();
            var xh = $(this).parents('tr:first').attr("value");

            ////规格型号
            //var _specificationData = [];
            for (var i = 0; i < _specificationData.length; i++) {
                var d = _specificationData[i];
                if (d.SupplierId == supplierId) {
                    specificationId = d.Id;
                    break;
                }
            }
            selector = "#batchAddGg" + xh;
            updateBatchAddSelect(selector, specificationId, _specificationData, "Specification", "SupplierId", supplierId);
        });

        ////规格型号
        //var _specificationData = [];
        selector = "#batchAddGg" + xh;
        updateBatchAddSelect(selector, specificationId, _specificationData, "Specification", "SupplierId", supplierId);

        ////位置
        //var _siteData = [];
        selector = "#batchAddWz" + xh;
        updateBatchAddSelect(selector, siteId, _siteData, "Site");

        $("#batchAdd" + xh).find(".ms2").css("width", "100%");
        $("#batchAdd" + xh).find(".ms2").select2({
            width: "120px",
            tags: true,
            createTag: params => {
                return {
                    id: `tag${params.term}`,
                    text: params.term
                }
            },
            matcher
        });
    }
}

function updateBatchAddSelect(ele, id, res, field, parentField = "", parentId = -1) {
    var firstId = 0;
    $(ele).empty();
    var html = "";
    for (var i = 0; i < res.length; i++) {
        var d = res[i];
        if (parentId != -1) {
            if (parentId != 0) {
                if (d[parentField] == parentId) {
                    html += `<option value="${d.Id}">${d[field]}</option>`;
                    if (firstId == 0) {
                        firstId = d.Id;
                    }
                }
            }
        } else {
            html += `<option value="${d.Id}">${d[field]}</option>`;
        }
    }

    $(ele).append(html);
    if (id != 0) {
        $(ele).val(id).trigger("change");
    }
    return firstId;
}

//批量添加删除一行
function delBatchAddList(id) {
    $("#batchAddList").find(`tr[value=${id}]:first`).remove();
    batchAddMaxV--;
    var o = 1;
    var child = $("#batchAddList tr");
    for (var i = 0; i < child.length; i++) {
        $(child[i]).attr("xh", o);
        var v = $(child[i]).attr("value");
        $("#batchAddXh" + v).html(o);
        o++;
    }
}

//点击复制按钮
function copyBatchAddList(id) {
    var categoryId = $(`#batchAddLb${id}`).val();
    var nameId = $(`#batchAddMc${id}`).val();
    var supplierId = $(`#batchAddGys${id}`).val();
    var specificationId = $(`#batchAddGg${id}`).val();
    var siteId = $(`#batchAddWz${id}`).val();
    addOneBatchAddList(categoryId, nameId, supplierId, specificationId, siteId);
}

//批量添加货品信息
function batchAddMaterial() {
    var opType = 810;
    var bill = new Array();
    var i;
    for (i = 1; i <= batchAddMax; i++) {
        if ($(`#batchAddBh${i}`).length > 0) {
            var batchAddLb = $(`#batchAddLb${i} :selected`).data('select2Tag') ? '0' : $(`#batchAddLb${i}`).val();
            var batchAddMc = $(`#batchAddMc${i} :selected`).data('select2Tag') ? '0' : $(`#batchAddMc${i}`).val();
            var batchAddGys = $(`#batchAddGys${i} :selected`).data('select2Tag') ? '0' : $(`#batchAddGys${i}`).val();
            var batchAddGg = $(`#batchAddGg${i} :selected`).data('select2Tag') ? '0' : $(`#batchAddGg${i}`).val();
            var batchAddWz = $(`#batchAddWz${i} :selected`).data('select2Tag') ? '0' : $(`#batchAddWz${i}`).val();
            var batchAddBh = $(`#batchAddBh${i}`).val().trim();
            var batchAddKc = $(`#batchAddKc${i}`).val().trim();
            var batchAddDw = $(`#batchAddDw${i}`).val().trim();
            var batchAddJg = $(`#batchAddJg${i}`).val().trim();
            if (isStrEmptyOrUndefined(batchAddMc)) {
                layer.msg("请选择名称");
                return;
            }
            if (isStrEmptyOrUndefined(batchAddGys)) {
                layer.msg("请选择供应商");
                return;
            }
            if (isStrEmptyOrUndefined(batchAddGg)) {
                layer.msg("请选择规格");
                return;
            }
            if (isStrEmptyOrUndefined(batchAddWz)) {
                layer.msg("请选择位置");
                return;
            }
            if (isStrEmptyOrUndefined(batchAddBh)) {
                layer.msg("货品编号不能为空");
                return;
            }
            if (isStrEmptyOrUndefined(batchAddKc)) {
                layer.msg("请输入最低库存");
                return;
            }
            if (isStrEmptyOrUndefined(batchAddDw)) {
                layer.msg("请输入单位");
                return;
            }
            if (isStrEmptyOrUndefined(batchAddJg)) {
                layer.msg("请输入价格");
                return;
            }
            bill.push({
                CategoryId: batchAddLb,
                Category: $(`#batchAddLb${i} :selected`).text(),
                NameId: batchAddMc,
                Name: $(`#batchAddMc${i} :selected`).text(),
                SupplierId: batchAddGys,
                Supplier: $(`#batchAddGys${i} :selected`).text(),
                SpecificationId: batchAddGg,
                Specification: $(`#batchAddGg${i} :selected`).text(),
                SiteId: batchAddWz,
                Site: $(`#batchAddWz${i} :selected`).text(),
                Code: batchAddBh,
                Stock: batchAddKc,
                Unit: batchAddDw,
                Price: batchAddJg
            });
        }
    }
    if (bill.length <= 0) {
        layer.msg("请输入货品");
        return;
    }
    var doSth = function () {
        $('#batchAddMaterial').attr("disabled", "disabled");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(bill);

        ajaxPost("/Relay/Post", data,
            function (ret) {
                var msg = ret.errmsg;
                if (ret.errno == 0) {
                    $("#batchAddMaterialModal").modal("hide");
                    getMaterialList();
                } else {
                    if (ret.datas.length > 0) {
                        var str = `[{0},{1}]`;
                        var err = new Array();
                        for (var j = 0; j < ret.datas.length; j++) {
                            var d = ret.datas[j];
                            if (typeof (d) === 'string') {
                                err.push(d);
                            } else {
                                var specification = "", site = "";
                                for (var k = 0; k < _specificationData.length; k++) {
                                    if (_specificationData[k].Id == d.SpecificationId) {
                                        specification = _specificationData[k].Specification;
                                    }
                                }
                                for (var k = 0; k < _siteData.length; k++) {
                                    if (_siteData[k].Id == d.SiteId) {
                                        site = _siteData[k].Site;
                                    }
                                }
                                if (specification != "" && site != "") {
                                    err.push(str.format(specification, site));
                                }
                            }
                        }
                        var errMsg = `<span class='text-red'>${err.join(", ")}</span></br>`;
                        msg = errMsg + msg;
                    }
                }
                layer.msg(msg);
                $('#batchAddMaterial').removeAttr("disabled");
            });
        function removeAttr() {
            $('#batchAddMaterial').removeAttr("disabled");
        }
        setTimeout(removeAttr, 10000);
    }
    showConfirm("添加", doSth);
}