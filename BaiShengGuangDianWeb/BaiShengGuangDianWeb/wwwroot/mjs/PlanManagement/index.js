var _permissionList = [];
function pageReady() {
    _permissionList[497] = { uIds: ['logModalBtn'] };
    _permissionList[498] = { uIds: ['addPlanModalBtn'] };
    _permissionList[499] = { uIds: ['reuse'] };
    _permissionList[500] = { uIds: [] };
    _permissionList[501] = { uIds: [] };
    _permissionList = checkPermissionUi(_permissionList);
    $('.ms2').select2();
    getPlanList(false);
    $('#addPlanTableBtn').on('click', function () {
        $(this).addClass('hidden');
        _planTrCount++;
        $('#addPlanBody').append(_planTr);
        setTableTrCount($("#addPlanBody"), _planTrCount);
        setDefaultCode($('#addPlanBody tr'));
        $('#addPlanTable').removeClass('hidden');
    });
    $('#addPlanBody').on('click', '.addPlanTr', function () {
        _planTrCount++;
        var tr = $(this).parents('tr');
        tr.after(_planTr);
        var trNew = tr.next();
        setTableTrCount($("#addPlanBody"), _planTrCount);
        setDefaultCode(trNew);
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
    $('#addPlanBody').on('select2:select', '.code select', function () {
        var tr = $(this).parents('tr');
        setTableSelect(tr);
    });
    $('#addPlanBody').on('select2:select', '.category select', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 1);
    });
    $('#addPlanBody').on('select2:select', '.name select', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 2);
    });
    $('#addPlanBody').on('select2:select', '.supplier select', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 3);
    });
    $('#addPlanBody').on('select2:select', '.specification select', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 4);
    });
    $('#addPlanBody').on('select2:select', '.site select', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 5);
    });
    $('#addPlanBody').on('select2:select', '.price select', function () {
        var tr = $(this).parents('tr');
        setTrSelect(tr, 6);
    });
    $('#reuse').on('click', function () {
        var planId = $('#addPlanSelect').val();
        if (isStrEmptyOrUndefined(planId)) {
            layer.msg('请选择要复用的计划号');
            return;
        }
        var plan = $('#addPlanSelect').find(`[value=${planId}]`).text();
        var doSth = function () {
            $('#addPlanBody').empty();
            addUpPlanTable(planId, false);
        }
        showConfirm(`复用生产计划：${plan}`, doSth);
    });
    $('#addPlanBody').on('ifChanged', '.isEnable', function () {
        var tr = $(this).parents('tr');
        if ($(this).is(':checked')) {
            var codeEl = tr.find('.code');
            if (codeEl.children().length == 1) {
                var html = '<div class="textOn" style="width:140px;margin:auto"><select class="ms2 form-control">{0}</select></div>';
                var input = '<input type="text" class="form-control text-center textOn" value={0} onkeyup="onInput(this, 8, 1)" onblur="onInputEnd(this)" maxlength="10" style="width:140px;margin:auto">';
                codeEl.append(html.format(_codeOp));
                tr.find('.category').append(html.format(_categoryOp));
                tr.find('.name').append(html.format(_nameOp));
                tr.find('.supplier').append(html.format(_supplierOp));
                tr.find('.specification').append(html.format(_specificationOp));
                tr.find('.price').append(html.format(_priceOp));
                tr.find('.site').append(html.format(_siteOp));
                var plannedConsumption = tr.find('.plannedConsumption span').text();
                tr.find('.plannedConsumption').append(input.format(plannedConsumption));
                $(' #addPlanBody .ms2').select2();
                setDefaultCode(tr);
                var codeId = tr.find('.num').attr('bill');
                codeEl.find('select').val(codeId).trigger('change').trigger('select2:select');
            }
            tr.find('.textIn').addClass('hidden').siblings('.textOn').removeClass('hidden');
        } else {
            tr.find('.textIn').removeClass('hidden').siblings('.textOn').addClass('hidden');
        }
        getPriceSum();
    });
    $('#addPlanBody').on('focusin', '.plannedConsumption input', function () {
        var v = $(this).val();
        if (v == 0) {
            $(this).val("");
        }
    });
    $('#addPlanBody').on('focusout', '.plannedConsumption input', function () {
        var v = $(this).val();
        if (isStrEmptyOrUndefined(v)) {
            $(this).val("0");
        }
    });
    $('#addPlanBody').on('input', '.plannedConsumption input', function () {
        getPriceSum();
    });
    $('#PlanDetailSelect').on('select2:select', function () {
        var id = $(this).val();
        planDetailModalData(id);
    });
    $('#addPlanBody').on('click', '.pdModal', function () {
        var tr = $(this).parents('tr');
        var category = tr.find('.category :selected').text();
        var name = tr.find('.name :selected').text();
        var supplier = tr.find('.supplier :selected').text();
        var specification = tr.find('.specification :selected').text();
        var site = tr.find('.site :selected').text();
        var codeSelect = tr.find('.code :selected');
        var code = codeSelect.text();
        var stock = codeSelect.attr('stock');
        var price = tr.find('.price').text();
        var remark = codeSelect.attr('remark');
        var img = codeSelect.attr('img');
        productDetailModal(escape(category), escape(name), supplier, specification, site, code, stock, price, remark, img);
    });
    $('#updatePlanSelect').on('select2:select', function () {
        var id = $(this).val();
        addUpPlanTable(id, true);
    });
    $('#logPlanSelect,#logBillSelect').on('select2:select', () => getLogList());
    $("#logStartDate").val(getDate());
    $("#logEndDate").val(getDate());
    $("#logStartDate,#logEndDate").datepicker('update').on('changeDate', () => getLogList());
    $('#logPlanType').on('change', () => getLogList());
}

//默认货品编号选择
function setDefaultCode(el) {
    el.find('.category select').val(_firstCode.CategoryId).trigger('change');
    el.find('.name select').val(_firstCode.NameId).trigger('change');
    el.find('.supplier select').val(_firstCode.SupplierId).trigger('change');
    el.find('.specification select').val(_firstCode.SpecificationId).trigger('change');
    el.find('.price select').val(_firstCode.Price).trigger('change');
    el.find('.site select').val(_firstCode.SiteId).trigger('change');
}

//设置表格复选框
function setTableStyle() {
    $('#addPlanBody').find('.isEnable').iCheck({
        handle: 'checkbox',
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '20%'
    });
}

//添加修改计划列表
function addUpPlanTable(planId, isUp) {
    new Promise(resolve => {
        getPlanList(true, resolve, planId, true);
    }).then(e => {
        var data = e[0];
        $('#addPlan').val(data.Plan);
        $('#addRemark').val(data.Remark);
        var planData = data.FirstBill;
        var i, len = planData.length;
        _planTrCount = 0;
        if (len) {
            $('#addPlanTableBtn').addClass('hidden');
            $('#addPlanTable').removeClass('hidden');
            var trInfo = '<tr style="color:{12}">' +
                '<td><input type="checkbox" class="icb_minimal isEnable {14}"></td>' +
                '<td class="num" style="font-weight:bold" list={15} bill={16}></td>' +
                '<td class="code"><span class="textIn">{5}</span></td>' +
                '<td class="category"><span class="textIn">{0}</span></td>' +
                '<td class="name"><span class="textIn">{1}</span></td>' +
                '<td class="supplier"><span class="textIn">{2}</span></td>' +
                '<td class="specification"><span class="textIn">{3}</span></td>' +
                '<td class="price"><span class="textIn">{7}</span></td>' +
                '<td class="site"><span class="textIn">{4}</span></td>' +
                '<td><button type="button" class="btn btn-info btn-sm" onclick="productDetailModal(\'{0}\',\'{1}\',\'{2}\',\'{3}\',\'{4}\',\'{5}\',{6},\'{7}\',\'{8}\',\'{9}\')">详情</button></td>' +
                '<td class="plannedConsumption"><span class="textIn">{10}</span></td>' +
                '<td class="actualConsumption">{11}</td>' +
                '<td>' +
                '<button type="button" class="btn btn-danger btn-sm delPlanTr {13}"><i class="fa fa-minus"></i></button>' +
                '<button type="button" class="btn btn-success btn-sm addPlanTr {14}" style="margin-left:5px"><i class="fa fa-plus"></i></button></td>' +
                '</tr>';
            var ops = '';
            for (i = 0; i < len; i++) {
                var d = planData[i];
                _planTrCount++;
                var tf = !!_codeData[d.BillId];
                if (tf || isUp) {
                    ops += trInfo.format(d.Category,
                        d.Name,
                        d.Supplier,
                        d.Specification,
                        d.Site,
                        d.Code,
                        d.Stock,
                        d.Price,
                        d.Remark,
                        d.ImageList,
                        isUp ? d.PlannedConsumption : d.ActualConsumption,
                        d.ActualConsumption,
                        tf ? 'black' : 'red',
                        tf && isUp && d.ActualConsumption != 0 ? 'hidden' : '',
                        tf ? '' : 'hidden',
                        d.Id,
                        d.BillId);
                }
            }
            $('#addPlanBody').append(ops);
            setTableStyle();
            getPriceSum();
            setTableTrCount($("#addPlanBody"), _planTrCount);
        }
        $('#addPlanTableBtn').attr('disabled', false);
    });
}

var _planTr = null;
//操作清单表格行数序号设置
function setTableTrCount(el, count) {
    for (var i = 0; i < count; i++) {
        el.find('.num').eq(i).text(i + 1);
    }
    $(' #addPlanBody .ms2').select2();
    $('#addPlanSelect').is(':hidden') ? $(' #addPlanTable .actualConsumption').removeClass('hidden') : $(' #addPlanTable .actualConsumption').addClass('hidden');
}

//清单表格选项加载
function setTableSelect(el) {
    var codeId = el.find('.code select').val();
    var data = _codeData[codeId];
    var categoryId = data.CategoryId;
    var nameId = data.NameId;
    var supplierId = data.SupplierId;
    var specificationId = data.SpecificationId;
    var siteId = data.SiteId;
    var price = data.Price;
    el.find('.category select').val(categoryId).trigger('change');
    var nameData = _nameData[categoryId];
    var i, d, len = nameData.length;
    var option = '<option value = "{0}">{1}</option>';
    var options = '';
    for (i = 0; i < len; i++) {
        d = nameData[i];
        options += option.format(d.Id, d.Name);
    }
    el.find('.name select').empty().append(options).val(nameId).trigger('change');
    options = '';
    var supplierData = _supplierData[nameId];
    len = supplierData.length;
    for (i = 0; i < len; i++) {
        d = supplierData[i];
        options += option.format(d.Id, d.Supplier);
    }
    el.find('.supplier select').empty().append(options).val(supplierId).trigger('change');
    options = '';
    var specificationData = _specificationData[supplierId];
    len = specificationData.length;
    for (i = 0; i < len; i++) {
        d = specificationData[i];
        options += option.format(d.Id, d.Specification);
    }
    el.find('.specification select').empty().append(options).val(specificationId).trigger('change');
    options = '';
    len = _siteData.length;
    for (i = 0; i < len; i++) {
        var siteVal = _siteData[i].Id;
        var siteName = _siteData[i].Site;
        if (_cond[`${specificationId}${siteVal}`]) {
            options += option.format(siteVal, siteName);
        }
    }
    el.find('.site select').empty().append(options).val(siteId).trigger('change');
    options = '';
    var pData = _priceData[`${specificationId}${siteId}`];
    len = pData.length;
    for (i = 0; i < len; i++) {
        options += option.format(pData[i].Price, pData[i].Price);
    }
    el.find('.price select').empty().append(options).val(price).trigger('change');
    setTableTrCount($("#addPlanBody"), _planTrCount);
    getPriceSum();
}

//清单表格选项设置
function setTrSelect(tr, e) {
    var i, d, len;
    var option = '<option value = "{0}">{1}</option>';
    var options;
    var nameEl = tr.find('.name select');
    var supplierEl = tr.find('.supplier select');
    var specificationEl = tr.find('.specification select');
    var priceEl = tr.find('.price select');
    var siteEl = tr.find('.site select');
    if (e === 1) {
        options = '';
        var categoryId = tr.find('.category select').val();
        var nameData = _nameData[categoryId];
        len = nameData.length;
        for (i = 0; i < len; i++) {
            d = nameData[i];
            options += option.format(d.Id, d.Name);
        }
        nameEl.empty().append(options);
    }
    if (e === 1 || e === 2) {
        options = '';
        var nameId = nameEl.val();
        var supplierData = _supplierData[nameId];
        len = supplierData.length;
        for (i = 0; i < len; i++) {
            d = supplierData[i];
            options += option.format(d.Id, d.Supplier);
        }
        supplierEl.empty().append(options);
    }
    if (e === 1 || e === 2 || e === 3) {
        options = '';
        var supplierId = tr.find('.supplier select').val();
        var specificationData = _specificationData[supplierId];
        len = specificationData.length;
        for (i = 0; i < len; i++) {
            d = specificationData[i];
            options += option.format(d.Id, d.Specification);
        }
        specificationEl.empty().append(options);
    }
    if (e === 1 || e === 2 || e === 3 || e === 4) {
        options = '';
        var specificationId = specificationEl.val();
        len = _siteData.length;
        for (i = 0; i < len; i++) {
            var siteId = _siteData[i].Id;
            var siteName = _siteData[i].Site;
            if (_cond[`${specificationId}${siteId}`]) {
                options += option.format(siteId, siteName);
            }
        }
        siteEl.empty().append(options);
    }
    if (e === 1 || e === 2 || e === 3 || e === 4 || e === 5) {
        options = '';
        var specificationVal = specificationEl.val();
        var siteVal = siteEl.val();
        var cond = `${specificationVal}${siteVal}`;
        var pData = _priceData[cond];
        len = pData.length;
        for (i = 0; i < len; i++) {
            options += option.format(pData[i].Price, pData[i].Price);
        }
        priceEl.empty().append(options);
    }
    if (e === 1 || e === 2 || e === 3 || e === 4 || e === 5 || e === 6) {
        for (var k in _codeData) {
            d = _codeData[k];
            if (d.SpecificationId == specificationEl.val() && d.SiteId == siteEl.val() && d.Price == priceEl.val()) {
                tr.find('.code select').val(k).trigger('change');
                break;
            }
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
        var price, plannedConsumption;
        if (tr.find('.textIn').is(':hidden')) {
            price = tr.find('.price select').val();
            plannedConsumption = tr.find('.plannedConsumption input').val();
        } else {
            price = tr.find('.price span').text();
            plannedConsumption = tr.find('.plannedConsumption span').text();
        }
        if (isStrEmptyOrUndefined(price)) {
            price = 0;
        }
        if (isStrEmptyOrUndefined(plannedConsumption)) {
            plannedConsumption = 0;
        }
        priceSum += (price >> 0) * (plannedConsumption >> 0);
    }
    $('#planCost').text(priceSum.toFixed(2));
}

//计划列表
function getPlanList(isSelect, resolve, planId, isAll) {
    var data = {}
    data.opType = 700;
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
            var per497 = _permissionList[497].have;
            var per500 = _permissionList[500].have;
            var operation = function (data) {
                var op = `<button type="button" class="btn btn-info btn-sm" onclick="planDetailModal({0})">详情</button>
                    ${per500 ? '<button type="button" class="btn btn-primary btn-sm" style="margin-left:2px" onclick="updatePlanModal({0})">修改</button>' : ''}
                    ${per497 ? '<button type="button" class="btn btn-success btn-sm" style="margin-left:2px" onclick="logModal(false,{0})">日志</button>' : ''}`;
                return op.format(data.Id);
            }
            var per501 = _permissionList[501].have;
            var del = function (data) {
                return per501
                    ? '<i class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red;font-size:25px;cursor:pointer;text-shadow:2px 2px 2px black" onclick="delPlan({0},\'{1}\')"></i>'
                        .format(data.Id, escape(data.Plan))
                    : '';
            }
            $("#planList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": rData,
                    "aaSorting": [[per501 ? 1 : 0, "asc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": [
                        { "data": null, "title": "删除", "render": del, "visible": per501, "orderable": false },
                        { "data": null, "title": "序号", "render": order },
                        { "data": "Plan", "title": "计划" },
                        { "data": null, "title": "领料状态(<font style='color:green'>已</font>/<font style='color:blue'>总</font>/<font style='color:red'>超</font>)", "render": status },
                        { "data": "Remark", "title": "备注" },
                        { "data": "PlannedCost", "title": "计划造价" },
                        { "data": "ActualCost", "title": "实际造价" },
                        { "data": null, "title": "操作", "render": operation, "orderable": false }
                    ]
                });
        } else {
            resolve(rData);
        }
    });
}

//删除生产计划
function delPlan(id, plan) {
    plan = unescape(plan);
    var doSth = function () {
        var data = {}
        data.opType = 703;
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
var _firstCode = null;
//货品编号选项
function codeSelect(resolve) {
    var data = {}
    data.opType = 808;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        _firstCode = list[0];
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
    var data = {}
    data.opType = 816;
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
    var data = {}
    data.opType = 847;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        var i, len = list.length;
        _siteData = [];
        for (i = 0; i < len; i++) {
            var d = list[i];
            _siteData.push({
                Id: d.Id,
                Site: d.Site
            });
        }
        resolve('success');
    }, 0);
}

var _nameData = null;
//名称选项
function nameSelect(resolve) {
    var data = {}
    data.opType = 824;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var listData = ret.datas;
        var i, len = listData.length;
        _nameData = {};
        for (i = 0; i < len; i++) {
            var d = listData[i];
            if (!_nameData[d.CategoryId]) {
                _nameData[d.CategoryId] = [];
            }
            _nameData[d.CategoryId].push({
                Id: d.Id,
                Name: d.Name
            });
        }
        resolve('success');
    }, 0);
}

var _supplierData = null;
//供应商选项
function supplierSelect(resolve) {
    var data = {}
    data.opType = 831;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var listData = ret.datas;
        var i, len = listData.length;
        _supplierData = {};
        for (i = 0; i < len; i++) {
            var d = listData[i];
            if (!_supplierData[d.NameId]) {
                _supplierData[d.NameId] = [];
            }
            _supplierData[d.NameId].push({
                Id: d.Id,
                Supplier: d.Supplier
            });
        }
        resolve('success');
    }, 0);
}

var _specificationData = null;
//规格选项
function specificationSelect(resolve) {
    var data = {}
    data.opType = 839;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var listData = ret.datas;
        var i, len = listData.length;
        _specificationData = {};
        for (i = 0; i < len; i++) {
            var d = listData[i];
            if (!_specificationData[d.SupplierId]) {
                _specificationData[d.SupplierId] = [];
            }
            _specificationData[d.SupplierId].push({
                Id: d.Id,
                Specification: d.Specification
            });
        }
        resolve('success');
    }, 0);
}

var _priceData = null;
//单价选项
function priceSelect(resolve) {
    var data = {}
    data.opType = 852;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        _priceData = {};
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            var flag = `${d.SpecificationId}${d.SiteId}`;
            _priceData[flag] ? _priceData[flag].push(d) : _priceData[flag] = [d];
        }
        resolve('success');
    }, 0);
}

var _codeOp, _categoryOp, _nameOp, _supplierOp, _specificationOp, _priceOp, _siteOp;
//清单tr
function addPlanTr(resolve) {
    var bodyTr = '<tr><td></td>' +
        '<td class="num" style="font-weight:bold"></td>' +
        '<td class="code"><span class="textIn hidden"></span><div style="width:140px;margin:auto"><select class="ms2 form-control">{0}</select></div></td>' +
        '<td class="category"><span class="textIn hidden"></span><div style="width:140px;margin:auto"><select class="ms2 form-control">{1}</select></div></td>' +
        '<td class="name"><span class="textIn hidden"></span><div style="width:140px;margin:auto"><select class="ms2 form-control">{2}</select></div></td>' +
        '<td class="supplier"><span class="textIn hidden"></span><div style="width:140px;margin:auto"><select class="ms2 form-control">{3}</select></div></td>' +
        '<td class="specification"><span class="textIn hidden"></span><div style="width:140px;margin:auto"><select class="ms2 form-control">{4}</select></div></td>' +
        '<td class="price"><span class="textIn hidden"></span><div style="width:140px;margin:auto"><select class="ms2 form-control">{6}</select></div></td>' +
        '<td class="site"><span class="textIn hidden"></span><div style="width:140px;margin:auto"><select class="ms2 form-control">{5}</select></div></td>' +
        '<td><button type="button" class="btn btn-info btn-sm pdModal">详情</button></td>' +
        '<td class="plannedConsumption"><span class="textIn hidden"></span><input type="text" class="form-control text-center" value="0" onkeyup="onInput(this, 8, 1)" onblur="onInputEnd(this)" maxlength="10" style="width:140px;margin:auto"></td>' +
        '<td class="actualConsumption"></td>' +
        '<td style="width:100px">' +
        '<button type="button" class="btn btn-danger btn-sm delPlanTr"><i class="fa fa-minus"></i></button>' +
        '<button type="button" class="btn btn-success btn-sm addPlanTr" style="margin-left:5px"><i class="fa fa-plus"></i></button>' +
        '</td>' +
        '</tr>';
    var code = new Promise(resolve => codeSelect(resolve));
    var category = new Promise(resolve => categorySelect(resolve));
    var name = new Promise(resolve => nameSelect(resolve));
    var supplier = new Promise(resolve => supplierSelect(resolve));
    var specification = new Promise(resolve => specificationSelect(resolve));
    var site = new Promise(resolve => siteSelect(resolve));
    var price = new Promise(resolve => priceSelect(resolve));

    Promise.all([code, category, name, supplier, specification, site, price]).then(results => {
        _codeOp = results[0];
        _categoryOp = results[1];
        _nameOp = '', _supplierOp = '', _specificationOp = '', _priceOp = '', _siteOp = '';
        var op = '<option value = "{0}">{1}</option>';
        var nameData = _nameData[_firstCode.CategoryId];
        var i, d, len = nameData.length;
        for (i = 0; i < len; i++) {
            d = nameData[i];
            _nameOp += op.format(d.Id, d.Name);
        }
        var supplierData = _supplierData[_firstCode.NameId];
        len = supplierData.length;
        for (i = 0; i < len; i++) {
            d = supplierData[i];
            _supplierOp += op.format(d.Id, d.Supplier);
        }
        var specificationData = _specificationData[_firstCode.SupplierId];
        len = specificationData.length;
        for (i = 0; i < len; i++) {
            d = specificationData[i];
            _specificationOp += op.format(d.Id, d.Specification);
        }
        var specificationId = _firstCode.SpecificationId;
        var firstSite = _firstCode.SiteId;
        len = _siteData.length;
        for (i = 0; i < len; i++) {
            d = _siteData[i];
            var siteId = d.Id;
            if (_cond[`${specificationId}${siteId}`]) {
                _siteOp += op.format(siteId, d.Site);
            }
        }
        var pData = _priceData[`${specificationId}${firstSite}`];
        len = pData.length;
        for (i = 0; i < len; i++) {
            _priceOp += op.format(pData[i].Price, pData[i].Price);
        }
        var option = bodyTr.format(_codeOp, _categoryOp, _nameOp, _supplierOp, _specificationOp, _siteOp, _priceOp);
        resolve(option);
    });
}

var _planTrCount = 0;
//添加计划模态框
function addPlanModal() {
    $("#addPlanTableBtn").attr('disabled', true);
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
    $('#addPlanBody').empty();
    _planTrCount = 0;
    $('#addRemark').val('');
    $('#planCost').text('0.00');
    $('#addPlanTableBtn').removeClass('hidden');
    $('#addPlanTable').addClass('hidden');
    new Promise(function (resolve, reject) {
        addPlanTr(resolve);
    }).then(function (e) {
        _planTr = e;
        isUp ? addUpPlanTable(id, isUp) : $("#addPlanTableBtn").attr('disabled', false);
    });
}

//添加新计划
function addPlan() {
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
        var codeId, plannedConsumption;
        if (tr.find('.textIn').is(':hidden')) {
            codeId = tr.find('.code select').val();
            if (isStrEmptyOrUndefined(codeId)) {
                layer.msg(`序列${i + 1}：请选择货品编号`);
                return;
            }
            plannedConsumption = tr.find('.plannedConsumption input').val();
        } else {
            codeId = tr.find('.num').attr('bill');
            plannedConsumption = tr.find('.plannedConsumption span').text();
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
        data.opType = 702;
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
        var excelColumns = [0, 1, 2, 3, 4, 5, 6, 8, 9];
        $("#planDetailList").DataTable({
            dom: '<"pull-left"l><"pull-right"B><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            buttons: [
                {
                    extend: 'excel',
                    text: '导出Excel',
                    className: 'btn-primary btn-sm', //按钮的class样式
                    exportOptions: {
                        columns: excelColumns
                    }
                }
            ],
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
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
                { "data": "Price", "title": "价格" },
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
    $('#addPlanTableBtn').attr('disabled', true);
    $('#addPlanModal .addPlan').addClass('hidden');
    $('#addPlanModal .updatePlan').removeClass('hidden');
    addUpPlanClass(true, id);
    $('#updatePlanSelect').val(id).trigger('change');
    $('#addPlanModal .modal-title').text('修改计划');
    $('#addPlanModal').modal('show');
}

//修改计划
function updatePlan() {
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
        if (tr.find('.textIn').is(':hidden')) {
            codeId = tr.find('.code select').val();
            if (isStrEmptyOrUndefined(codeId)) {
                layer.msg(`序列${i + 1}：请选择货品编号`);
                return;
            }
            plannedConsumption = tr.find('.plannedConsumption input').val();
        } else {
            codeId = tr.find('.num').attr('bill');
            plannedConsumption = tr.find('.plannedConsumption span').text();
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
        data.opType = 701;
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
    var data = {}
    data.opType = 700;
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
    var planSt = new Promise(resolve => logPlanSelect(resolve));
    var codeSt = new Promise(resolve => codeSelect(resolve));
    Promise.all([planSt, codeSt]).then(results => {
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
    data.opType = 803;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var type = $('#logPlanType').val();
        if (type == 0 || type == 1) {
            for (var i = 0, len = rData.length; i < len; i++) {
                if (rData[i].Mode != type) {
                    rData.splice(i, 1);
                    i--;
                    len--;
                }
            }
        }
        $("#logList")
            .DataTable({
                dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": oLanguage,
                "data": rData,
                "aaSorting": [[0, "asc"]],
                "aLengthMenu": [40, 80, 120], //更改显示记录数选项  
                "iDisplayLength": 40, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "序号", "render": (a, b, c, d) => ++d.row },
                    { "data": "Time", "title": "时间" },
                    { "data": "Mode", "title": "类型", "render": a => a == 0 ? '<span style="color:red">退回</span>' : '<span style="color:green">领用</span>'},
                    { "data": "Purpose", "title": "计划号" },
                    { "data": "Code", "title": "货品编号" },
                    { "data": "Category", "title": "类别" },
                    { "data": "Name", "title": "名称" },
                    { "data": "Supplier", "title": "供应商" },
                    { "data": "Specification", "title": "规格型号" },
                    { "data": "Price", "title": "单价" },
                    { "data": "Number", "title": "数量" },
                    { "data": "RelatedPerson", "title": "领用人" },
                    { "data": "Manager", "title": "物管员" }
                ]
            });
    });
}