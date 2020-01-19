function pageReady() {
    $('.ms2').select2();
    getPlanList(false);
    $('#addPlanTableBtn').on('click', function () {
        _planTrCount++;
        $(this).addClass('hidden');
        new Promise(function (resolve, reject) {
            addPlanTr(resolve);
        }).then(function (e) {
            _planTr = e;
            $('#addPlanBody').append(e);
            setTableSelect($('#addPlanBody'));
        });
        $('#addPlanTable').removeClass('hidden');
    });
    $('#addPlanBody').on('click', '.addPlanTr', function () {
        _planTrCount++;
        var tr = $(this).parents('tr');
        tr.after(_planTr);
        var trNew = tr.next();
        setTableSelect(trNew);
    });
    $('#addPlanBody').on('click', '.delPlanTr', function () {
        _planTrCount--;
        var tr = $(this).parents('tr');
        tr.remove();
        if (_planTrCount) {
            setTableTrCount($("#addPlanBody"), _planTrCount);
        } else {
            $('#addPlanTableBtn').removeClass('hidden');
            $('#addPlanTable').addClass('hidden');
        }
    });
    //清单选项Id值
    var codeId, categoryId, nameId, supplierId, specificationId, siteId;
    //需要加载选项
    var name, supplier, specification;
    //清单select元素
    var codeEl, nameEl, supplierEl, specificationEl, siteEl;
    $('#addPlanBody').on('change', '.code', function () {
        var tr = $(this).parents('tr');
        nameEl = tr.find('.name');
        supplierEl = tr.find('.supplier');
        specificationEl = tr.find('.specification');
        codeId = $(this).val();
        var data = _codeData[codeId];
        categoryId = data.CategoryId;
        nameId = data.NameId;
        supplierId = data.SupplierId;
        tr.find('.category').val(categoryId);
        name = new Promise(function (resolve, reject) {
            nameSelect(resolve, categoryId);
        });
        supplier = new Promise(function (resolve, reject) {
            supplierSelect(resolve, categoryId, nameId);
        });
        specification = new Promise(function (resolve, reject) {
            specificationSelect(resolve, categoryId, nameId, supplierId);
        });
        Promise.all([name, supplier, specification]).then(function (results) {
            nameEl.empty();
            nameEl.append(results[0]);
            nameEl.val(nameId);
            supplierEl.empty();
            supplierEl.append(results[1]);
            supplierEl.val(supplierId);
            specificationEl.empty();
            specificationEl.append(results[2]);
            specificationEl.val(data.SpecificationId);
            tr.find('.site').val(data.SiteId);
        });
    });
    $('#addPlanBody').on('change', '.category', function () {
        var tr = $(this).parents('tr');
        codeEl = tr.find('.code');
        nameEl = tr.find('.name');
        supplierEl = tr.find('.supplier');
        specificationEl = tr.find('.specification');
        siteEl = tr.find('.site');
        categoryId = $(this).val();
        new Promise(function (resolve, reject) {
            nameSelect(resolve, categoryId);
        }).then(function (e) {
            nameEl.empty();
            nameEl.append(e);
            nameId = nameEl.val();
            if (isStrEmptyOrUndefined(e)) {
                supplierEl.empty();
                specificationEl.empty();
                codeEl.val(0);
            }
            return new Promise(function (resolve, reject) {
                supplierSelect(resolve, categoryId, nameId);
            });
        }).then(function (e) {
            supplierEl.empty();
            supplierEl.append(e);
            supplierId = supplierEl.val();
            if (isStrEmptyOrUndefined(e)) {
                specificationEl.empty();
                codeEl.val(0);
            }
            return new Promise(function (resolve, reject) {
                specificationSelect(resolve, categoryId, nameId, supplierId);
            });
        }).then(function (e) {
            specificationEl.empty();
            specificationEl.append(e);
            specificationId = specificationEl.val();
            siteId = siteEl.val();
            var cond = `${specificationId}${siteId}`;
            codeId = codeEl.find(`[cond=${cond}]`).val();
            codeEl.val(codeId);
        });
    });
    $('#addPlanBody').on('change', '.name', function () {
        var tr = $(this).parents('tr');
        codeEl = tr.find('.code');
        supplierEl = tr.find('.supplier');
        specificationEl = tr.find('.specification');
        siteEl = tr.find('.site');
        categoryId = tr.find('.category').val();
        nameId = $(this).val();
        new Promise(function (resolve, reject) {
            supplierSelect(resolve, categoryId, nameId);
        }).then(function (e) {
            supplierEl.empty();
            supplierEl.append(e);
            supplierId = supplierEl.val();
            if (isStrEmptyOrUndefined(e)) {
                specificationEl.empty();
                codeEl.val(0);
            }
            return new Promise(function (resolve, reject) {
                specificationSelect(resolve, categoryId, nameId, supplierId);
            });
        }).then(function (e) {
            specificationEl.empty();
            specificationEl.append(e);
            specificationId = specificationEl.val();
            siteId = siteEl.val();
            var cond = `${specificationId}${siteId}`;
            codeId = codeEl.find(`[cond=${cond}]`).val();
            codeEl.val(codeId);
        });
    });
    $('#addPlanBody').on('change', '.supplier', function () {
        var tr = $(this).parents('tr');
        codeEl = tr.find('.code');
        specificationEl = tr.find('.specification');
        siteEl = tr.find('.site');
        categoryId = tr.find('.category').val();
        nameId = tr.find('.name').val();
        supplierId = $(this).val();
        new Promise(function (resolve, reject) {
            specificationSelect(resolve, categoryId, nameId, supplierId);
        }).then(function (e) {
            specificationEl.empty();
            specificationEl.append(e);
            specificationId = specificationEl.val();
            siteId = siteEl.val();
            var cond = `${specificationId}${siteId}`;
            codeId = codeEl.find(`[cond=${cond}]`).val();
            codeEl.val(codeId);
        });
    });
    $('#addPlanBody').on('change', '.specification,.site', function () {
        var tr = $(this).parents('tr');
        codeEl = tr.find('.code');
        specificationEl = tr.find('.specification');
        siteEl = tr.find('.site');
        specificationId = specificationEl.val();
        siteId = siteEl.val();
        var cond = `${specificationId}${siteId}`;
        codeId = codeEl.find(`[cond=${cond}]`).val();
        codeEl.val(codeId);
    });
    $('#reuse').on('click', function() {
        var planId = $('#addPlanSelect').val();
        if (isStrEmptyOrUndefined(planId)) {
            layer.msg('请选择要复用的计划号');
            return;
        }
        var doSth = function () {
            new Promise(function (resolve, reject) {
                getPlanList(true, resolve);
            }).then(function(e) {
                console.log(e);
            });
        }
        showConfirm(`复用生产计划：${plan}`, doSth);
    });
}

var _planTr = null;
//操作清单表格行数序号设置
function setTableTrCount(el, count) {
    for (var i = 0; i < count; i++) {
        el.find('.num').eq(i).text(i + 1);
    }
}

//清单表格选项设置
function setTableSelect(el) {
    var codeId = el.find('.code').val();
    var data = _codeData[codeId];
    el.find('.category').val(data.CategoryId);
    el.find('.name').val(data.NameId);
    el.find('.supplier').val(data.SupplierId);
    el.find('.specification').val(data.SpecificationId);
    el.find('.site').val(data.SiteId);
    setTableTrCount($("#addPlanBody"), _planTrCount);
}

//计划列表
function getPlanList(isSelect, resolve) {
    var opType = 700;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    if (isSelect) {
        var planId = $('#addPlanSelect').val();
        data.opData = JSON.stringify({
            qId: planId,
            first: true,
            simple: true
        });
    }
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        if (!isSelect) {
            var i, len = rData.length;
            var option = '<option value = "{0}">{1}</option>';
            var options = '';
            for (i = 0; i < len; i++) {
                var d = rData[i];
                options += option.format(d.Id, d.Plan);
            }
            $('#addPlanSelect').empty();
            $('#addPlanSelect').append(options);
            var number = 0;
            var order = function () {
                return ++number;
            }
            var status = function (data) {
                //已/总/超-PlannedConsumption/ActualConsumption/ExtraConsumption
                var planned = data.PlannedConsumption;
                var actual = data.ActualConsumption;
                var extra = data.ExtraConsumption;
                var op = `<font style="color:{0}">${planned}</font>/<font style="color:blue">${actual}</font>/<font style="color:{1}">${extra}</font>`;
                return op.format(planned == actual ? 'blue' : 'green', extra > 0 ? 'red' : 'black');
            }
            var operation = function () {
                return '<button type="button" class="btn btn-info btn-sm">详情</button>' +
                    '<button type="button" class="btn btn-primary btn-sm" style="margin-left:2px">修改</button>' +
                    '<button type="button" class="btn btn-success btn-sm" style="margin-left:2px">日志</button>';
            }
            var del = function (data) {
                var op = '<i class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red;font-size:25px;cursor:pointer;text-shadow:2px 2px 2px black" onclick="delPlan({0},\'{1}\')"></i>';
                return op.format(data.Id, escape(data.Plan));
            }
            $("#planList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": rData,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "Plan", "title": "计划" },
                        { "data": null, "title": "领料状态(<font style='color:green'>已</font>/<font style='color:blue'>总</font>/<font style='color:red'>超</font>)", "render": status },
                        { "data": "Remark", "title": "备注" },
                        { "data": "PlannedCost", "title": "计划造价" },
                        { "data": "ActualCost", "title": "实际造价" },
                        { "data": null, "title": "操作", "render": operation },
                        { "data": null, "title": "删除", "render": del }
                    ],
                    "columnDefs": [
                        { "orderable": false, "targets": [6, 7] }
                    ]
                });
        } else {
            resolve(rData);
        }
    });
}

//删除生产计划
function delPlan(id, plan) {
    var opType = 703;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    plan = unescape(plan);
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getPlanList(false);
                }
            });
    }
    showConfirm(`删除生产计划：${plan}`, doSth);
}

var _codeData = {};
//货品编号选项
function codeSelect(resolve) {
    var opType = 808;
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
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value="{0}" cond="{2}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            var cond = `${d.SpecificationId}${d.SiteId}`;
            options += option.format(d.Id, d.Code, cond);
            _codeData[d.Id] = d;
        }
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(options);
        }
    }, 0);
}

//货品类别选项
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
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Category);
        }
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(options);
        }
    }, 0);
}

//货品位置选项
function siteSelect(resolve) {
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
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Site);
        }
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(options);
        }
    }, 0);
}

//名称选项
function nameSelect(resolve, categoryId) {
    var opType = 824;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var list = {};
    if (isStrEmptyOrUndefined(categoryId)) {
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

        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(options);
        }
    }, 0);
}

//供应商选项
function supplierSelect(resolve, categoryId, nameId) {
    var opType = 831;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var list = {};
    if (isStrEmptyOrUndefined(categoryId)) {
        return;
    }
    if (categoryId != 0) {
        list.categoryId = categoryId;
    }
    if (isStrEmptyOrUndefined(nameId)) {
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
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(options);
        }
    }, 0);
}

//规格选项
function specificationSelect(resolve, categoryId, nameId, supplierId) {
    var opType = 839;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var list = {};
    if (isStrEmptyOrUndefined(categoryId)) {
        return;
    }
    if (categoryId != 0) {
        list.categoryId = categoryId;
    }
    if (isStrEmptyOrUndefined(nameId)) {
        return;
    }
    if (nameId != 0) {
        list.nameId = nameId;
    }
    if (isStrEmptyOrUndefined(supplierId)) {
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
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(options);
        }
    }, 0);
}

//清单tr
function addPlanTr(resolve) {
    var bodyTr = '<tr>' +
        '<td class="num" style="font-weight:bold"></td>' +
        '<td><select class="form-control code" style="width:140px;margin:auto">{0}</select></td>' +
        '<td><select class="form-control category" style="width:140px;margin:auto">{1}</select></td>' +
        '<td><select class="form-control name" style="width:140px;margin:auto">{2}</select></td>' +
        '<td><select class="form-control supplier" style="width:140px;margin:auto">{3}</select></td>' +
        '<td><select class="form-control specification" style="width:140px;margin:auto">{4}</select></td>' +
        '<td><select class="form-control site" style="width:140px;margin:auto">{5}</select></td>' +
        '<td><button type="button" class="btn btn-info btn-sm" onclick="materialDetailModal()">详情</button></td>' +
        '<td><input type="text" class="form-control text-center plannedConsumption" maxlength="10" style="width:140px;margin:auto" oninput="value=value.replace(/[^\\d]/g,\'\')"></td>' +
        '<td style="width:100px">' +
        '<button type="button" class="btn btn-danger btn-sm delPlanTr"><i class="fa fa-minus"></i></button>' +
        '<button type="button" class="btn btn-success btn-sm addPlanTr" style="margin-left:5px"><i class="fa fa-plus"></i></button>' +
        '</td>' +
        '</tr>';
    var codeTr, categoryId, nameId, supplierId;
    var codeOp, categoryOp, nameOp, supplierOp, specificationOp, siteOp;
    new Promise(function (resolve, reject) {
        codeSelect(resolve);
    }).then(function (e) {
        codeOp = e;
        codeTr = _codeData[Object.keys(_codeData)[0]];
        categoryId = codeTr.CategoryId;
        nameId = codeTr.NameId;
        supplierId = codeTr.SupplierId;
        var category = new Promise(function (resolve, reject) {
            categorySelect(resolve);
        });
        var name = new Promise(function (resolve, reject) {
            nameSelect(resolve, categoryId);
        });
        var supplier = new Promise(function (resolve, reject) {
            supplierSelect(resolve, categoryId, nameId);
        });
        var specification = new Promise(function (resolve, reject) {
            specificationSelect(resolve, categoryId, nameId, supplierId);
        });
        var site = new Promise(function (resolve, reject) {
            siteSelect(resolve);
        });
        Promise.all([category, name, supplier, specification, site]).then(function (results) {
            categoryOp = results[0];
            nameOp = results[1];
            supplierOp = results[2];
            specificationOp = results[3];
            siteOp = results[4];
            var op = bodyTr.format(codeOp, categoryOp, nameOp, supplierOp, specificationOp, siteOp);
            resolve(op);
        });
    });
}

var _planTrCount = 0;
//添加计划模态框
function addPlanModal() {
    _planTrCount = 0;
    $('#addPlan').val('');
    var planId = $('#addPlanSelect').find('option').eq(0).val();
    $('#addPlanSelect').val(planId).trigger('change');
    $('#addRemark').val('');
    $('#planCost').text('0.00');
    $('#addPlanTableBtn').removeClass('hidden');
    $('#addPlanTable').addClass('hidden');
    $('#addPlanBody').empty();
    $('#addPlanModal').modal('show');
}