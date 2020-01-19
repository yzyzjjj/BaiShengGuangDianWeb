function pageReady() {
    $('.ms2').select2();
    siteSelect();
    var categoryId, nameId, supplierId;
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
    }).then(function (specificationSelect) {
        supplierId = $('#supplierSelect').val();
        return new Promise(function (resolve, reject) {
            specificationSelect(resolve, categoryId, nameId, supplierId, false);
        });
    }).then(function (getMaterialList) {
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
    //表格
    $('#MaterialList').on('change', '.category', function () {
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
    $('#MaterialList').on('change', '.name', function () {
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
    $('#MaterialList').on('change', '.supplier', function () {
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
        new Promise(function (resolve, reject) {
            nameSelect(resolve, categoryId, true);
        }).then(function (e) {
            $('#addNameSelect').empty();
            $('#addNameSelect').append(e);
            nameId = $('#addNameSelect').val();
            if (isStrEmptyOrUndefined(e)) {
                $('#addSupplierSelect').empty();
                $('#addSpecificationSelect').empty();
            }
            return new Promise(function (resolve, reject) {
                supplierSelect(resolve, categoryId, nameId, true);
            });
        }).then(function (e) {
            $('#addSupplierSelect').empty();
            $('#addSupplierSelect').append(e);
            supplierId = $('#addSupplierSelect').val();
            if (isStrEmptyOrUndefined(e)) {
                $('#addSpecificationSelect').empty();
            }
            return new Promise(function (resolve, reject) {
                specificationSelect(resolve, categoryId, nameId, supplierId, true);
            });
        }).then(function (e) {
            $('#addSpecificationSelect').empty();
            $('#addSpecificationSelect').append(e);
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
            supplierId = $('#addSupplierSelect').val();
            if (isStrEmptyOrUndefined(e)) {
                $('#addSpecificationSelect').empty();
            }
            return new Promise(function (resolve, reject) {
                specificationSelect(resolve, categoryId, nameId, supplierId, true);
            });
        }).then(function (e) {
            $('#addSpecificationSelect').empty();
            $('#addSpecificationSelect').append(e);
        });
    });
    $('#addSupplierSelect').on('select2:select', function () {
        categoryId = $('#addCategorySelect').val();
        nameId = $('#addNameSelect').val();
        supplierId = $(this).val();
        new Promise(function (resolve, reject) {
            specificationSelect(resolve, categoryId, nameId, supplierId, true);
        }).then(function (e) {
            $('#addSpecificationSelect').empty();
            $('#addSpecificationSelect').append(e);
        });
    });
    $('#imgOldList').on('click', '.delImg', function () {
        $(this).parents('.imgOption').remove();
        var e = $(this).val();
        _imgNameData.splice(_imgNameData.indexOf(e), 1);
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
            isTable ? resolve(options) : resolve(specificationSelect);
        }
    }, !isTable);
}

//规格选项
function specificationSelect(resolve, categoryId, nameId, supplierId, isTable) {
    var opType = 839;
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
            if (len) {
                $('#specificationSelect').append(option.format(0, '所有规格'));
            }
            $('#specificationSelect').append(options);
        }
        if (!isStrEmptyOrUndefined(resolve)) {
            isTable ? resolve(options) : resolve(getMaterialList);
        }
    }, !isTable);
}

var _siteSelect = null;
//位置选项
function siteSelect() {
    var opType = 847;
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
        _siteSelect = `<select class="form-control textIn site hidden" style="width:100px">${options}</select>`;
    });
}

//货品管理列表
function getMaterialList() {
    var opType = 808;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    _materialIdData = [];
    _materialNameData = [];
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
        var code = function (data) {
            return `<span class="textOn codeOld">${data}</span><input type="text" class="form-control text-center textIn code hidden" maxlength="20" style="width:120px" value=${data}>`;
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
            return `<span class="textOn" id=${data.SpecificationId}>${data.Specification}</span><select class="form-control textIn specification hidden" style="width:100px"></select>`;
        }
        var unit = function (data) {
            return `<span class="textOn">${data}</span><input type="text" class="form-control text-center textIn unit hidden" maxlength="20" style="width:80px" value=${data}>`;
        }
        var site = function (data) {
            return `<span class="textOn" id=${data.SiteId}>${data.Site}</span>${_siteSelect}`;
        }
        var materialImg = function (data) {
            var op = '<button type="button" class="btn btn-info btn-sm" style="vertical-align:middle" onclick="showImgModel({0},\'{1}\',\'{2}\',\'{3}\',\'{4}\',\'{5}\',\'{6}\',\'{7}\')">查看</button>';
            return op.format(data.Id, escape(data.Code), escape(data.Category), escape(data.Name), escape(data.Supplier), escape(data.Specification), escape(data.ImageList), escape(data.Site));
        }
        var price = function (data) {
            return `<span class="textOn">${data}</span><input type="text" class="form-control text-center textIn price hidden" maxlength="10" style="width:80px" value=${data}>`;
        }
        var stock = function (data) {
            return `<span class="textOn">${data}</span><input type="text" class="form-control text-center textIn stock hidden" maxlength="10" style="width:80px" value=${data}>`;
        }
        var remark = function (data) {
            return `<span class="textOn">${data}</span><textarea class="form-control textIn remark hidden" maxlength="500" style="resize: vertical;width:250px;margin:auto">${data}</textarea>`;
        }
        $("#MaterialList")
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
                    { "data": "Code", "title": "货品编号", "render": code },
                    { "data": null, "title": "类别", "render": category },
                    { "data": null, "title": "名称", "render": name },
                    { "data": null, "title": "供应商", "render": supplier },
                    { "data": null, "title": "规格", "render": specification },
                    { "data": "Unit", "title": "单位", "render": unit },
                    { "data": null, "title": "位置", "render": site },
                    { "data": null, "title": "货品图片", "render": materialImg },
                    { "data": "Price", "title": "参考价格", "render": price },
                    { "data": "Stock", "title": "最低库存", "render": stock },
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
                    $('#MaterialList .isEnable').on('ifChanged', function () {
                        var tr = $(this).parents('tr');
                        var id = $(this).val();
                        var n = tr.find('.codeOld').text();
                        if ($(this).is(':checked')) {
                            _materialIdData.push(id);
                            _materialNameData.push(n);
                            var textOn = tr.find('.textOn');
                            var codeName = textOn.eq(0).text();
                            var categoryName = textOn.eq(1).attr('id');
                            var nameName, supplierName;
                            new Promise(function (resolve, reject) {
                                nameSelect(resolve, categoryName, true);
                            }).then(function (e) {
                                tr.find('.name').empty();
                                tr.find('.name').append(e);
                                nameName = textOn.eq(2).attr('id');
                                return new Promise(function (resolve, reject) {
                                    supplierSelect(resolve, categoryName, nameName, true);
                                });
                            }).then(function (e) {
                                tr.find('.supplier').empty();
                                tr.find('.supplier').append(e);
                                supplierName = textOn.eq(3).attr('id');
                                return new Promise(function (resolve, reject) {
                                    specificationSelect(resolve, categoryName, nameName, supplierName, true);
                                });
                            }).then(function (e) {
                                tr.find('.specification').empty();
                                tr.find('.specification').append(e);
                                var specificationName = textOn.eq(4).attr('id');
                                var unitName = textOn.eq(5).text();
                                var siteName = textOn.eq(6).attr('id');
                                var priceName = textOn.eq(7).text();
                                var stockName = textOn.eq(8).text();
                                var remarkName = textOn.eq(9).text();
                                tr.find('.code').val(codeName);
                                tr.find('.category').val(categoryName);
                                tr.find('.name').val(nameName);
                                tr.find('.supplier').val(supplierName);
                                tr.find('.specification').val(specificationName);
                                tr.find('.unit').val(unitName);
                                tr.find('.site').val(siteName);
                                tr.find('.price').val(priceName);
                                tr.find('.stock').val(stockName);
                                tr.find('.remark').val(remarkName);
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
    var opType = 809;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
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
        data.opType = opType;
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
    $('#addImgBox').find('.file-caption-name').attr('readonly', true).attr('placeholder', '请选择张图片...');
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
    var opType = 810;
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
    var specificationId = $('#addSpecificationSelect').val();
    if (isStrEmptyOrUndefined(specificationId)) {
        layer.msg("请选择规格");
        return;
    }
    var siteId = $('#addSiteSelect').val();
    if (isStrEmptyOrUndefined(siteId)) {
        layer.msg("请选择位置");
        return;
    }
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
            data.opType = opType;
            data.opData = JSON.stringify({
                SpecificationId: specificationId,
                SiteId: siteId,
                Code: code,
                Unit: unit,
                Price: price,
                Stock: stock,
                Images: img,
                Remark: remark
            });
            ajaxPost("/Relay/Post", data,
                function (ret) {
                    layer.msg(ret.errmsg);
                    $("#addMaterialModal").modal("hide");
                    if (ret.errno == 0) {
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
    var opType = 811;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    if (!_materialIdData.length) {
        layer.msg("请选择要删除的货品编号");
        return;
    }
    var name = _materialNameData.join('<br>');
    var doSth = function () {
        var data = {}
        data.opType = opType;
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
    var opType = 809;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
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
            data.opType = opType;
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