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
        var billId = trNew.find('.code').val();
        trNew.find('.num').attr('bill', billId);
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
    $('#addPlanBody').on('select2:select', '.code', function () {
        var tr = $(this).parents('tr');
        setTableSelect(tr);
    });
    $('#addPlanBody').on('select2:select', '.category', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 1);
    });
    $('#addPlanBody').on('select2:select', '.name', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 2);
    });
    $('#addPlanBody').on('select2:select', '.supplier', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 3);
    });
    $('#addPlanBody').on('select2:select', '.specification', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 4);
    });
    $('#addPlanBody').on('select2:select', '.site', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 5);
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
        var price = tr.find('.price').text();
        var remark = codeSelect.find(`option[value=${code}]`).attr('remark');
        var img = codeSelect.find(`option[value=${code}]`).attr('img');
        code = codeSelect.find(`option[value=${code}]`).text();
        productDetailModal(escape(category), escape(name), supplier, specification, site, code, stock, price, remark, img);
    });
    $('#updatePlanSelect').on('select2:select', function () {
        var id = $(this).val();
        addUpPlanTable(id, true);
    });
    $('#logPlanSelect,#logBillSelect').on('select2:select', function () {
        getLogList();
    });
    $("#logStartDate").val(getDate());
    $("#logEndDate").val(getDate());
    $("#logStartDate,#logEndDate").datepicker('update').on('changeDate', function (ev) {
        getLogList();
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
            var trInfo = '<tr style="color:red">' +
                '<td class="num" style="font-weight:bold"></td>' +
                '<td class="code">{5}</td>' +
                '<td>{0}</td>' +
                '<td>{1}</td>' +
                '<td>{2}</td>' +
                '<td>{3}</td>' +
                '<td>{4}</td>' +
                '<td><button type="button" class="btn btn-info btn-sm" onclick="productDetailModal(\'{0}\',\'{1}\',\'{2}\',\'{3}\',\'{4}\',\'{5}\',{6},\'{7}\',\'{8}\',\'{9}\')">详情</button></td>' +
                '<td>{7}</td>' +
                '<td class="plannedConsumption">{10}</td>' +
                '<td class="actualConsumption">{11}</td>' +
                '<td><button type="button" class="btn btn-danger btn-sm delPlanTr" style="margin-left:5px"><i class="fa fa-minus"></i></button></td>' +
                '</tr>';
            for (i = 0; i < len; i++) {
                var d = planData[i];
                _planTrCount++;
                flag++;
                if (_codeData[d.BillId]) {
                    $('#addPlanBody').append(_planTr);
                    $('#addPlanBody').find('.code').eq(flag).val(d.BillId);
                    $('#addPlanBody').find('.plannedConsumption').eq(flag).val(isUp ? d.PlannedConsumption : d.ActualConsumption);
                    $('#addPlanBody').find('.actualConsumption').eq(flag).text(d.ActualConsumption);
                    if (d.ActualConsumption != 0 && isUp) {
                        $('#addPlanBody').find('.delPlanTr').eq(flag).addClass('hidden');
                    }
                    var tr = $('#addPlanBody').find('tr').eq(flag);
                    setTableSelect(tr);
                } else {
                    if (isUp) {
                        $('#addPlanBody').append(trInfo.format(d.Category,
                            d.Name,
                            d.Supplier,
                            d.Specification,
                            d.Site,
                            d.Code,
                            d.Stock,
                            d.Price,
                            d.Remark,
                            d.ImageList,
                            d.PlannedConsumption,
                            d.ActualConsumption));
                    }
                }
                $('#addPlanBody').find('.num').eq(flag).attr('list', d.Id).attr('bill', d.BillId);
            }
            getPriceSum();
            setTableTrCount($("#addPlanBody"), _planTrCount, isUp);
        }
    });
}

var _planTr = null;
//操作清单表格行数序号设置
function setTableTrCount(el, count, isUp) {
    for (var i = 0; i < count; i++) {
        el.find('.num').eq(i).text(i + 1);
    }
    $(' #addPlanBody .ms2').select2();
    isUp = $('#addPlanSelect').is(':hidden');
    isUp ? $(' #addPlanTable .actualConsumption').removeClass('hidden') : $(' #addPlanTable .actualConsumption').addClass('hidden');
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
    el.find('.category').val(categoryId).trigger('change');
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
    el.find('.name').val(nameId).trigger('change');
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
    el.find('.supplier').val(supplierId).trigger('change');
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
    el.find('.specification').val(specificationId).trigger('change');
    el.find('.site').empty();
    options = '';
    len = _siteData.length;
    for (i = 0; i < len; i++) {
        var siteVal = _siteData[i].Id;
        var siteName = _siteData[i].Site;
        if (_cond[`${specificationId}${siteVal}`]) {
            options += option.format(siteVal, siteName);
        }
    }
    el.find('.site').append(options);
    el.find('.site').val(siteId).trigger('change');
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
        options = '';
        var specificationId = tr.find('.specification').val();
        tr.find('.site').empty();
        len = _siteData.length;
        for (i = 0; i < len; i++) {
            var siteId = _siteData[i].Id;
            var siteName = _siteData[i].Site;
            if (_cond[`${specificationId}${siteId}`]) {
                options += option.format(siteId, siteName);
            }
        }
        tr.find('.site').append(options);
    }
    if (e === 1 || e === 2 || e === 3 || e === 4 || e === 5) {
        var specificationVal = tr.find('.specification').val();
        var siteVal = tr.find('.site').val();
        var cond = `${specificationVal}${siteVal}`;
        var codeEl = tr.find('.code');
        var codeId = codeEl.find(`[cond=${cond}]`).val();
        codeEl.val(codeId).trigger('change');
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
                    '<button type="button" class="btn btn-success btn-sm" style="margin-left:2px" onclick="logModal(false,{0})">日志</button>';
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
var _cond = {};
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
            _cond[cond] = 1;
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

var _siteData = null;
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
        _siteData = [];
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Site);
            _siteData.push({
                Id: d.Id,
                Site: d.Site
            });
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
        '<td><div style="width:140px;margin:auto"><select class="ms2 form-control code">{0}</select></div></td>' +
        '<td><div style="width:140px;margin:auto"><select class="ms2 form-control category">{1}</select></div></td>' +
        '<td><div style="width:140px;margin:auto"><select class="ms2 form-control name">{2}</select></div></td>' +
        '<td><div style="width:140px;margin:auto"><select class="ms2 form-control supplier">{3}</select></div></td>' +
        '<td><div style="width:140px;margin:auto"><select class="ms2 form-control specification">{4}</select></div></td>' +
        '<td><div style="width:140px;margin:auto"><select class="ms2 form-control site">{5}</select></div></td>' +
        '<td><button type="button" class="btn btn-info btn-sm pdModal">详情</button></td>' +
        '<td class="price"></td>' +
        '<td><input type="text" class="form-control text-center plannedConsumption" maxlength="10" style="width:140px;margin:auto" value="0" oninput="value=value.replace(/[^\\d]/g,\'\')"></td>' +
        '<td class="actualConsumption"></td>' +
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
            var op = '<button type="button" class="btn btn-info btn-sm" onclick="productDetailModal(\'{0}\',\'{1}\',\'{2}\',\'{3}\',\'{4}\',\'{5}\',{6},\'{7}\',\'{8}\',\'{9}\')">详情</button>';
            return op.format(escape(data.Category), escape(data.Name), escape(data.Supplier), escape(data.Specification), escape(data.Site), escape(data.Code), data.Stock, escape(data.Price), escape(data.Remark), escape(data.ImageList));
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
function productDetailModal(category, name, supplier, specification, site, code, stock, price, remark, img) {
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
    $('#productPrice').text(price);
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
                    '</div>' +
                    '</div>';
                var imgOps = "";
                for (var i = 0; i < ret.data.length; i++) {
                    imgOps += imgOp.format(ret.data[i].path);
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
        var codeId, plannedConsumption;
        var billId = tr.find('.num').attr('bill');
        if (_codeData[billId]) {
            codeId = tr.find('.code').val();
            if (isStrEmptyOrUndefined(codeId)) {
                layer.msg('请选择货品编号');
                return;
            }
            plannedConsumption = tr.find('.plannedConsumption').val();
            if (plannedConsumption == 0) {
                layer.msg('计划用量不能为零');
                return;
            }
        } else {
            codeId = billId;
            plannedConsumption = tr.find('.plannedConsumption').text();
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

//日志计划选项
function logPlanSelect(resolve) {
    var opType = 700;
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
        for (i = 0; i < len; i++) {
            var d = listData[i];
            options += option.format(d.Id, d.Plan);
        }
        resolve(options);
    });
}

//日志弹窗
function logModal(isAll, id) {
    var planSt = new Promise(function (resolve) {
        logPlanSelect(resolve);
    });
    var codeSt = new Promise(function (resolve) {
        codeSelect(resolve);
    });
    Promise.all([planSt, codeSt]).then(function (results) {
        var planOp = results[0];
        var codeOp = results[1];
        $('#logPlanSelect').empty();
        $('#logBillSelect').empty();
        var allOp = '<option value="0">所有</option>';
        if (isAll) {
            $('#logPlanSelect').append(allOp);
        }
        $('#logPlanSelect').append(planOp);
        if (id) {
            $('#logPlanSelect').val(id).trigger('change');
        }
        $('#logBillSelect').append(allOp);
        $('#logBillSelect').append(codeOp);
        getLogList();
    });
    $('#logModal').modal('show');
}

//获取日志详情
function getLogList() {
    var opType = 803;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var startTime = $('#logStartDate').val();
    if (isStrEmptyOrUndefined(startTime)) {
        layer.msg("请选择开始时间");
        return;
    }
    var endTime = $('#logEndDate').val();
    if (isStrEmptyOrUndefined(endTime)) {
        layer.msg("请选择结束时间");
        return;
    }
    if (exceedTime(startTime)) {
        layer.msg("开始时间不能大于当前时间");
        return;
    }
    if (compareDate(startTime, endTime)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }
    startTime += " 00:00:00";
    endTime += " 23:59:59";
    var list = {
        startTime: startTime,
        endTime: endTime,
        isPlan: 1,
        type: 2
    }
    var planId = $('#logPlanSelect').val();
    if (isStrEmptyOrUndefined(planId)) {
        layer.msg("请选择计划号");
        return;
    }
    if (planId != 0) {
        list.planId = parseInt(planId);
    }
    var codeId = $('#logBillSelect').val();
    if (isStrEmptyOrUndefined(codeId)) {
        layer.msg("请选择货品编号");
        return;
    }
    if (codeId != 0) {
        list.billId = parseInt(codeId);
        var billData = _codeData[codeId];
        $('#logCategory').text(billData.Category);
        $('#logName').text(billData.Name);
        $('#logSpecification').text(billData.Specification);
        $('#logSupplier').text(billData.Supplier);
        $('#logPrice').text(billData.Price);
        $('#billInfo').removeClass('hidden');
    } else {
        $('#billInfo').addClass('hidden');
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var o = 0;
        var order = function () {
            return ++o;
        }
        $("#logList")
            .DataTable({
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": { "url": "/content/datatables_language.json" },
                "data": ret.datas,
                "aaSorting": [[0, "asc"]],
                "aLengthMenu": [40, 80, 120], //更改显示记录数选项  
                "iDisplayLength": 40, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Time", "title": "时间" },
                    { "data": "Purpose", "title": "计划号" },
                    { "data": "Code", "title": "货品编号" },
                    { "data": "Number", "title": "数量" },
                    { "data": "RelatedPerson", "title": "领用人" },
                    { "data": "Manager", "title": "物管员" }
                ]
            });
    });
}