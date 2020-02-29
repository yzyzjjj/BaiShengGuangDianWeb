function pageReady() {
    $('.ms2').select2();
    getPlanList(false);
    $('#addPlanTableBtn').on('click', function () {
        $(this).addClass('hidden');
        _planTrCount++;
        $('#addPlanBody').append(_planTr);
        setTableSelect($('#addPlanBody'));
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
            getPriceSum();
        } else {
            $('#addPlanTableBtn').removeClass('hidden');
            $('#addPlanTable').addClass('hidden');
            $('#planCost').text('0.00');
        }
    });
    $('#addPlanBody').on('change', '.code', function () {
        var tr = $(this).parents('tr');
        setTableSelect(tr);
    });
    $('#addPlanBody').on('change', '.category', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 1);
    });
    $('#addPlanBody').on('change', '.name', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 2);
    });
    $('#addPlanBody').on('change', '.supplier', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 3);
    });
    $('#addPlanBody').on('change', '.specification,.site', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 4);
    });
    $('#reuse').on('click', function () {
        var planId = $('#addPlanSelect').val();
        if (isStrEmptyOrUndefined(planId)) {
            layer.msg('请选择要复用的计划号');
            return;
        }
        var plan = $('#addPlanSelect').find(`[value=${planId}]`).text();
        var doSth = function () {
            addUpPlanTable(planId, false);
        }
        showConfirm(`复用生产计划：${plan}`, doSth);
    });
    $('#addPlanBody').on('focusin', '.plannedConsumption', function () {
        var v = $(this).val();
        if (v == 0) {
            $(this).val("");
        }
    });
    $('#addPlanBody').on('focusout', '.plannedConsumption', function () {
        var v = $(this).val();
        if (isStrEmptyOrUndefined(v)) {
            $(this).val("0");
        }
    });
    $('#addPlanBody').on('input', '.plannedConsumption', function () {
        getPriceSum();
    });
    $('#PlanDetailSelect').on('select2:select', function () {
        var id = $(this).val();
        planDetailModalData(id);
    });
    $('#addPlanBody').on('click', '.pdModal', function () {
        var tr = $(this).parents('tr');
        var category = tr.find('.category').val();
        category = tr.find('.category').find(`option[value=${category}]`).text();
        var name = tr.find('.name').val();
        name = tr.find('.name').find(`option[value=${name}]`).text();
        var supplier = tr.find('.supplier').val();
        supplier = tr.find('.supplier').find(`option[value=${supplier}]`).text();
        var specification = tr.find('.specification').val();
        specification = tr.find('.specification').find(`option[value=${specification}]`).text();
        var site = tr.find('.site').val();
        site = tr.find('.site').find(`option[value=${site}]`).text();
        var codeSelect = tr.find('.code');
        var code = codeSelect.val();
        var stock = codeSelect.find(`option[value=${code}]`).attr('stock');
        var remark = codeSelect.find(`option[value=${code}]`).attr('remark');
        var img = codeSelect.find(`option[value=${code}]`).attr('img');
        code = codeSelect.find(`option[value=${code}]`).text();
        productDetailModal(escape(category), escape(name), supplier, specification, site, code, stock, remark, img);
    });
    $('#updatePlanSelect').on('select2:select', function () {
        var id = $(this).val();
        addUpPlanTable(id, true);
    });
}

//添加修改计划列表
function addUpPlanTable(planId, isUp) {
    new Promise(function (resolve, reject) {
        getPlanList(true, resolve, planId, true);
    }).then(function (e) {
        var data = e[0];
        $('#addPlan').val(data.Plan);
        $('#addRemark').val(data.Remark);
        var planData = data.FirstBill;
        var i, len = planData.length;
        $('#addPlanTableBtn').removeClass('hidden');
        $('#addPlanBody').empty();
        $('#addPlanTable').addClass('hidden');
        _planTrCount = 0;
        if (len) {
            $('#addPlanTableBtn').addClass('hidden');
            $('#addPlanTable').removeClass('hidden');
            var flag = -1;
            for (i = 0; i < len; i++) {
                var d = planData[i];
                if (_codeData[d.BillId]) {
                    $('#addPlanBody').append(_planTr);
                    _planTrCount++;
                    flag++;
                    $('#addPlanBody').find('.code').eq(flag).val(d.BillId);
                    $('#addPlanBody').find('.num').eq(flag).attr('list', d.Id);
                    $('#addPlanBody').find('.plannedConsumption').eq(flag).val(d.PlannedConsumption);
                    if (d.ActualConsumption != 0 && isUp) {
                        $('#addPlanBody').find('.delPlanTr').addClass('hidden');
                    }
                    var tr = $('#addPlanBody').find('tr').eq(flag);
                    setTableSelect(tr);
                }
            }
            getPriceSum();
            setTableTrCount($("#addPlanBody"), _planTrCount);
        }
    });
}

var _planTr = null;
//操作清单表格行数序号设置
function setTableTrCount(el, count) {
    for (var i = 0; i < count; i++) {
        el.find('.num').eq(i).text(i + 1);
    }
}

//清单表格选项加载
function setTableSelect(el) {
    var codeId = el.find('.code').val();
    var data = _codeData[codeId];
    var categoryId = data.CategoryId;
    var nameId = data.NameId;
    var supplierId = data.SupplierId;
    var specificationId = data.SpecificationId;
    var siteId = data.SiteId;
    var price = data.Price;
    el.find('.category').val(categoryId);
    var i, len = _nameData.length;
    var option = '<option value = "{0}">{1}</option>';
    var options = '';
    el.find('.name').empty();
    for (i = 0; i < len; i++) {
        var nameData = _nameData[i];
        if (categoryId == nameData.CategoryId) {
            options += option.format(nameData.Id, nameData.Name);
        }
    }
    el.find('.name').append(options);
    el.find('.name').val(nameId);
    el.find('.supplier').empty();
    options = '';
    len = _supplierData.length;
    for (i = 0; i < len; i++) {
        var supplierData = _supplierData[i];
        if (nameId == supplierData.NameId) {
            options += option.format(supplierData.Id, supplierData.Supplier);
        }
    }
    el.find('.supplier').append(options);
    el.find('.supplier').val(supplierId);
    el.find('.specification').empty();
    options = '';
    len = _specificationData.length;
    for (i = 0; i < len; i++) {
        var specificationData = _specificationData[i];
        if (supplierId == specificationData.SupplierId) {
            options += option.format(specificationData.Id, specificationData.Specification);
        }
    }
    el.find('.specification').append(options);
    el.find('.specification').val(specificationId);
    el.find('.site').val(siteId);
    el.find('.price').text(price);
    setTableTrCount($("#addPlanBody"), _planTrCount);
    getPriceSum();
}

//清单表格选项设置
function setTrSelect(tr, e) {
    var i, len;
    var option = '<option value = "{0}">{1}</option>';
    var options;
    if (e === 1) {
        options = '';
        var categoryId = tr.find('.category').val();
        tr.find('.name').empty();
        len = _nameData.length;
        for (i = 0; i < len; i++) {
            var nameData = _nameData[i];
            if (categoryId == nameData.CategoryId) {
                options += option.format(nameData.Id, nameData.Name);
            }
        }
        tr.find('.name').append(options);
    }
    if (e === 1 || e === 2) {
        options = '';
        var nameId = tr.find('.name').val();
        tr.find('.supplier').empty();
        len = _supplierData.length;
        for (i = 0; i < len; i++) {
            var supplierData = _supplierData[i];
            if (nameId == supplierData.NameId) {
                options += option.format(supplierData.Id, supplierData.Supplier);
            }
        }
        tr.find('.supplier').append(options);
    }
    if (e === 1 || e === 2 || e === 3) {
        options = '';
        var supplierId = tr.find('.supplier').val();
        tr.find('.specification').empty();
        len = _specificationData.length;
        for (i = 0; i < len; i++) {
            var specificationData = _specificationData[i];
            if (supplierId == specificationData.SupplierId) {
                options += option.format(specificationData.Id, specificationData.Specification);
            }
        }
        tr.find('.specification').append(options);
    }
    if (e === 1 || e === 2 || e === 3 || e === 4) {
        var specificationId = tr.find('.specification').val();
        var siteId = tr.find('.site').val();
        var cond = `${specificationId}${siteId}`;
        var codeEl = tr.find('.code');
        var codeId = codeEl.find(`[cond=${cond}]`).val();
        codeEl.val(codeId);
        if (isStrEmptyOrUndefined(codeId)) {
            tr.find('.price').text('');
        } else {
            var price = _codeData[codeId].Price;
            tr.find('.price').text(price);
        }
        getPriceSum();
    }
}

//计划造价总和
function getPriceSum() {
    var trs = $('#addPlanBody').find('tr');
    var i = 0, len = trs.length;
    var priceSum = 0;
    for (; i < len; i++) {
        var tr = trs.eq(i);
        var price = tr.find('.price').text();
        if (isStrEmptyOrUndefined(price)) {
            price = 0;
        }
        var plannedConsumption = tr.find('.plannedConsumption').val();
        if (isStrEmptyOrUndefined(plannedConsumption)) {
            plannedConsumption = 0;
        }
        priceSum += parseInt(price) * parseInt(plannedConsumption);
    }
    $('#planCost').text(priceSum.toFixed(2));
}

//计划列表
function getPlanList(isSelect, resolve, planId, isAll) {
    var opType = 700;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    if (isSelect) {
        data.opData = JSON.stringify({
            qId: planId,
            first: true,
            simple: isAll
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
            $('.planSelect').empty();
            $('.planSelect').append(options);
            var number = 0;
            var order = function () {
                return ++number;
            }
            var status = function (data) {
                //已/总/超-ActualConsumption/PlannedConsumption/ExtraConsumption
                var actual = data.ActualConsumption;
                var planned = data.PlannedConsumption;
                var extra = data.ExtraConsumption;
                var op = `<font style="color:{0}">${actual}</font>/<font style="color:blue">${planned}</font>/<font style="color:{1}">${extra}</font>`;
                return op.format(actual == planned ? 'blue' : 'green', extra > 0 ? 'red' : 'black');
            }
            var operation = function (data) {
                var op = '<button type="button" class="btn btn-info btn-sm" onclick="planDetailModal({0})">详情</button>' +
                    '<button type="button" class="btn btn-primary btn-sm" style="margin-left:2px" onclick="updatePlanModal({0})">修改</button>' +
                    '<button type="button" class="btn btn-success btn-sm" style="margin-left:2px" onclick="logModal(false)">日志</button>';
                return op.format(data.Id);
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
        var option = '<option value="{0}" cond="{2}" remark=\"{3}\" img=\"{4}\" stock="{5}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            var cond = `${d.SpecificationId}${d.SiteId}`;
            options += option.format(d.Id, d.Code, cond, d.Remark, d.ImageList, d.Stock);
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

var _nameData = null;
//名称选项
function nameSelect(resolve) {
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
        var listData = ret.datas;
        var i, len = listData.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        _nameData = [];
        for (i = 0; i < len; i++) {
            var d = listData[i];
            options += option.format(d.Id, d.Name);
            _nameData.push({
                Id: d.Id,
                CategoryId: d.CategoryId,
                Name: d.Name
            });
        }
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(options);
        }
    }, 0);
}

var _supplierData = null;
//供应商选项
function supplierSelect(resolve) {
    var opType = 831;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var listData = ret.datas;
        var i, len = listData.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        _supplierData = [];
        for (i = 0; i < len; i++) {
            var d = listData[i];
            options += option.format(d.Id, d.Supplier);
            _supplierData.push({
                Id: d.Id,
                NameId: d.NameId,
                Supplier: d.Supplier
            });
        }
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(options);
        }
    }, 0);
}

var _specificationData = null;
//规格选项
function specificationSelect(resolve) {
    var opType = 839;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var listData = ret.datas;
        var i, len = listData.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        _specificationData = [];
        for (i = 0; i < len; i++) {
            var d = listData[i];
            options += option.format(d.Id, d.Specification);
            _specificationData.push({
                Id: d.Id,
                SupplierId: d.SupplierId,
                Specification: d.Specification
            });
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
        '<td><button type="button" class="btn btn-info btn-sm pdModal">详情</button></td>' +
        '<td class="price"></td>' +
        '<td><input type="text" class="form-control text-center plannedConsumption" maxlength="10" style="width:140px;margin:auto" value="0" oninput="value=value.replace(/[^\\d]/g,\'\')"></td>' +
        '<td style="width:100px">' +
        '<button type="button" class="btn btn-danger btn-sm delPlanTr"><i class="fa fa-minus"></i></button>' +
        '<button type="button" class="btn btn-success btn-sm addPlanTr" style="margin-left:5px"><i class="fa fa-plus"></i></button>' +
        '</td>' +
        '</tr>';
    var codeOp, categoryOp, nameOp, supplierOp, specificationOp, siteOp;
    var code = new Promise(function (resolve, reject) {
        codeSelect(resolve);
    });
    var category = new Promise(function (resolve, reject) {
        categorySelect(resolve);
    });
    var name = new Promise(function (resolve, reject) {
        nameSelect(resolve);
    });
    var supplier = new Promise(function (resolve, reject) {
        supplierSelect(resolve);
    });
    var specification = new Promise(function (resolve, reject) {
        specificationSelect(resolve);
    });
    var site = new Promise(function (resolve, reject) {
        siteSelect(resolve);
    });
    Promise.all([code, category, name, supplier, specification, site]).then(function (results) {
        codeOp = results[0];
        categoryOp = results[1];
        nameOp = results[2];
        supplierOp = results[3];
        specificationOp = results[4];
        siteOp = results[5];
        var op = bodyTr.format(codeOp, categoryOp, nameOp, supplierOp, specificationOp, siteOp);
        resolve(op);
    });
}

var _planTrCount = 0;
//添加计划模态框
function addPlanModal() {
    $('#addPlanModal .addPlan').removeClass('hidden');
    $('#addPlanModal .updatePlan').addClass('hidden');
    $('#addPlan').val('');
    var planId = $('#addPlanSelect').find('option').eq(0).val();
    $('#addPlanSelect').val(planId).trigger('change');
    addUpPlanClass();
    $('#addPlanModal .modal-title').text('添加新计划');
    $('#addPlanModal').modal('show');
}

//添加修改计划弹窗相同部分
function addUpPlanClass(isUp, id) {
    _planTrCount = 0;
    $('#addRemark').val('');
    $('#planCost').text('0.00');
    $('#addPlanTableBtn').removeClass('hidden');
    $('#addPlanTable').addClass('hidden');
    $('#addPlanBody').empty();
    new Promise(function (resolve, reject) {
        addPlanTr(resolve);
    }).then(function (e) {
        _planTr = e;
        if (isUp) {
            addUpPlanTable(id, isUp);
        }
    });
}

//添加新计划
function addPlan() {
    var opType = 702;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var plan = $('#addPlan').val().trim();
    if (isStrEmptyOrUndefined(plan)) {
        layer.msg('请输入新计划');
        return;
    }
    var remark = $('#addRemark').val().trim();
    var list = {
        Plan: plan,
        Remark: remark
    };
    var bill = [];
    var trs = $('#addPlanBody').find('tr');
    var i = 0, len = trs.length;
    for (; i < len; i++) {
        var tr = trs.eq(i);
        var codeId = tr.find('.code').val();
        if (isStrEmptyOrUndefined(codeId)) {
            layer.msg('请选择货品编号');
            return;
        }
        var plannedConsumption = tr.find('.plannedConsumption').val();
        if (plannedConsumption == 0) {
            layer.msg('计划用量不能为零');
            return;
        }
        bill.push({
            BillId: codeId,
            PlannedConsumption: plannedConsumption
        });
    }
    if (bill.length) {
        list.Bill = bill;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                $("#addPlanModal").modal("hide");
                if (ret.errno == 0) {
                    getPlanList(false);
                }
            });
    }
    showConfirm("添加", doSth);
}

//计划详情模态框数据
function planDetailModalData(id) {
    new Promise(function (resolve, reject) {
        getPlanList(true, resolve, id, false);
    }).then(function (e) {
        var data = e[0];
        $('#remarkName').text(data.Remark);
        $('#plannedCostName').text(data.PlannedCost.toFixed(2));
        $('#actualCostName').text(data.ActualCost.toFixed(2));
        var rData = data.FirstBill;
        var number = 0;
        var order = function (data) {
            var op = `<span style="color:{0}">${++number}</span>`;
            return op.format(data.Extra ? 'red' : 'black');
        }
        var code = function (data) {
            var op = `<span style="color:{0}">${data.Code}</span>`;
            return op.format(data.Extra ? 'red' : 'black');
        }
        var detailBtn = function (data) {
            var op = '<button type="button" class="btn btn-info btn-sm" onclick="productDetailModal(\'{0}\',\'{1}\',\'{2}\',\'{3}\',\'{4}\',\'{5}\',{6},\'{7}\',\'{8}\')">详情</button>';
            return op.format(escape(data.Category), escape(data.Name), escape(data.Supplier), escape(data.Specification), escape(data.Site), escape(data.Code), data.Stock, escape(data.Remark), escape(data.ImageList));
        }
        var actualConsumption = function (data) {
            var actual = data.ActualConsumption;
            var planed = data.PlannedConsumption;
            var op = `<span style="color:{0}">${actual}</span>`;
            return op.format(actual === 0 ? 'black' : actual > planed ? 'red' : 'green');
        }
        $("#planDetailList").DataTable({
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
                { "data": null, "title": "货品编号", "render": code },
                { "data": "Category", "title": "货品类别" },
                { "data": "Name", "title": "货品名称" },
                { "data": "Supplier", "title": "供应商" },
                { "data": "Specification", "title": "规格型号" },
                { "data": null, "title": "货品详情", "render": detailBtn },
                { "data": "PlannedConsumption", "title": "计划用量" },
                { "data": null, "title": "实际用量", "render": actualConsumption }
            ]
        });
    });
}

//计划详情模态框
function planDetailModal(id) {
    $('#PlanDetailSelect').val(id).trigger('change');
    planDetailModalData(id);
    $('#planDetailModal').modal('show');
}

//货品详情模态框
function productDetailModal(category, name, supplier, specification, site, code, stock, remark, img) {
    category = unescape(category);
    name = unescape(name);
    supplier = unescape(supplier);
    specification = unescape(specification);
    site = unescape(site);
    code = unescape(code);
    remark = unescape(remark);
    $('#productCategory').text(category);
    $('#productName').text(name);
    $('#productSupplier').text(supplier);
    $('#productSpecification').text(specification);
    $('#productSite').text(site);
    $('#productCode').text(code);
    $('#productStock').text(stock);
    $('#productRemark').text(remark);
    img = unescape(img);
    $('#imgLabel').empty();
    $("#productImg").empty();
    if (isStrEmptyOrUndefined(img)) {
        $('#imgLabel').append('图片：<font style="color:red" size=5>无</font>');
    } else {
        $('#imgLabel').append('图片：');
        img = img.split(",");
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
                $("#productImg").append(imgOps);
            });
    }

    $('#productDetailModal').modal('show');
}

//修改计划弹窗
function updatePlanModal(id) {
    $('#addPlanModal .addPlan').addClass('hidden');
    $('#addPlanModal .updatePlan').removeClass('hidden');
    addUpPlanClass(true, id);
    $('#updatePlanSelect').val(id).trigger('change');
    $('#addPlanModal .modal-title').text('修改计划');
    $('#addPlanModal').modal('show');
}

//修改计划
function updatePlan() {
    var opType = 701;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var planId = $('#updatePlanSelect').val();
    var plan = $('#updatePlanSelect').find(`option[value=${planId}]`).text();
    var remark = $('#addRemark').val().trim();
    var list = {
        id: planId,
        Plan: plan,
        Remark: remark
    };
    var bill = [];
    var trs = $('#addPlanBody').find('tr');
    var i = 0, len = trs.length;
    for (; i < len; i++) {
        var tr = trs.eq(i);
        var codeId = tr.find('.code').val();
        if (isStrEmptyOrUndefined(codeId)) {
            layer.msg('请选择货品编号');
            return;
        }
        var plannedConsumption = tr.find('.plannedConsumption').val();
        if (plannedConsumption == 0) {
            layer.msg('计划用量不能为零');
            return;
        }
        var billData = {
            BillId: codeId,
            PlannedConsumption: plannedConsumption
        };
        var id = tr.find('.num').attr('list');
        if (id) {
            billData.Id = parseInt(id);
        }
        bill.push(billData);
    }
    if (bill.length) {
        list.Bill = bill;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                $("#addPlanModal").modal("hide");
                if (ret.errno == 0) {
                    getPlanList(false);
                }
            });
    }
    showConfirm("修改", doSth);
}

//日志弹窗
function logModal(isAll) {
    $("#logStartDate").val(getDate()).datepicker('update');
    $("#logEndDate").val(getDate()).datepicker('update');
    if (isAll) {
        $('#logPlanSelect').prepend('<option value="0">所有</option>');
        $('#logPlanSelect').val('0').trigger('change');
    }
    $('#logBillSelect').append('<option value="0">所有</option>');
    new Promise(function (resolve) {
        codeSelect(resolve);
    }).then(function(e) {
        $('#logBillSelect').append(e);
    });
    $('#logModal').modal('show');
}