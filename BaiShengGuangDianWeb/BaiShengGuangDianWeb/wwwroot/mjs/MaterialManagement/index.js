var _permissionList = [];
function pageReady() {
    _permissionList[534] = { uIds: ['createQrModalBtn'] };
    _permissionList[535] = { uIds: [] };
    _permissionList[536] = { uIds: ['showConsumeModelBtn'] };
    _permissionList[537] = { uIds: ['showReversalModelBtn'] };
    _permissionList[538] = { uIds: ['putLogBtn'] };
    _permissionList[539] = { uIds: ['receiveLogBtn'] };
    _permissionList[540] = { uIds: ['handleLogBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
    if (!_permissionList[535].have) {
        $('.fastIncreaseModelBtn').addClass('hidden');
    }
    $('.ms2').select2({ matcher });
    var categoryFunc = new Promise(resolve => categorySelect(resolve));
    var nameFunc = new Promise(resolve => nameSelect(resolve, true, 'Select'));
    var supplierFunc = new Promise(resolve => supplierSelect(resolve, true, 'Select'));
    var specificationFunc = new Promise(resolve => specificationSelect(resolve, true, 'Select'));
    var siteFunc = new Promise(resolve => siteSelect(resolve));
    Promise.all([categoryFunc, nameFunc, supplierFunc, specificationFunc, siteFunc])
        .then((result) => {
            getMaterialList('Select');
        });

    $('#categorySelect').on('select2:select', function () {
        var nameFunc = new Promise(function (resolve, reject) {
            nameSelect(resolve, false, 'Select');
        });
        var supplierFunc = new Promise(function (resolve, reject) {
            supplierSelect(resolve, false, 'Select');
        });
        var specificationFunc = new Promise(function (resolve, reject) {
            specificationSelect(resolve, false, 'Select');
        });
        Promise.all([nameFunc, supplierFunc, specificationFunc])
            .then((result) => {
                getMaterialList('Select');
            });
    });
    $('#nameSelect').on('select2:select', function () {
        var supplierFunc = new Promise(function (resolve, reject) {
            supplierSelect(resolve, false, 'Select');
        });
        var specificationFunc = new Promise(function (resolve, reject) {
            specificationSelect(resolve, false, 'Select');
        });
        Promise.all([supplierFunc, specificationFunc])
            .then((result) => {
                getMaterialList('Select');
                qrSiteSet('Select');
            });
    });
    $('#supplierSelect').on('select2:select', function () {
        var specificationFunc = new Promise(function (resolve, reject) {
            specificationSelect(resolve, false, 'Select');
        });
        Promise.all([specificationFunc])
            .then((result) => {
                getMaterialList('Select');
                qrSiteSet('Select');
            });
    });
    $('#specificationSelect').on('select2:select', function () {
        getMaterialList('Select');
        qrSiteSet('Select');
    });
    $('#siteSelect').on('select2:select', function () {
        getMaterialList('Select');
    });

    $('#categoryQr').on('select2:select', function () {
        nameSelect(null, false, 'Qr');
        supplierSelect(null, false, 'Qr');
        specificationSelect(null, false, 'Qr');
        qrSiteSet('Qr');
    });
    $('#nameQr').on('select2:select', function () {
        supplierSelect(null, false, 'Qr');
        specificationSelect(null, false, 'Qr');
        qrSiteSet('Qr');
    });
    $('#supplierQr').on('select2:select', function () {
        specificationSelect(null, false, 'Qr');
        qrSiteSet('Qr');
    });
    $('#qrCodeList').on('click', '.delQrCode', function () {
        $(this).parent().parent().remove();
        var printBox = $('#qrCodeList .printBox');
        printBox.prop('style', 'float:left');
        var printBoxCount = printBox.length;
        for (var i = 0; i < printBoxCount; i++) {
            if (!((i + 1) % 24)) {
                printBox.eq(i).prop('style', 'page-break-after:always');
            }
        }
    });
    //公共事件
    $('#increaseList,#consumePlanList,#consumeOtherList,#reversalList,#fastIncreaseList').on('click', '.scanPrint', function () {
        new Promise(resolve => showPrintModal(resolve)).then(result => {
            if (result) {
                var codeId = result.split(',')[0];
                $(this).next().val(codeId).trigger('change').trigger('select2:select');
            }
        });
    });
    $('#increaseList,#consumePlanList,#consumeOtherList,#reversalList,#fastIncreaseList').on('focus', '.zeroNum', function () {
        var v = $(this).val();
        if (v == 0) {
            $(this).val("");
        }
    });
    $('#increaseList,#consumePlanList,#consumeOtherList,#reversalList,#fastIncreaseList').on('blur', '.zeroNum', function () {
        var v = $(this).val();
        if (isStrEmptyOrUndefined(v)) {
            $(this).val("0");
        }
    });
    $('#increaseList,#consumePlanList,#consumeOtherList,#reversalList,#fastIncreaseList').on('select2:select', '.category,.name,.supplier,.specification,.site,.price,.code', function (e) {
        var typeIndex = $(e.delegateTarget).data('index');
        var elFlag = $(e.target).data('flag');
        typeof elFlag == 'undefined' ? codeGanged.call(this, typeIndex) : codeNoGanged.call(this, elFlag, typeIndex);
        if (typeIndex == 0) {
            $('#copyBtn,#exportBtn').attr('disabled', true);
        } else if (typeIndex == 4) {
            $('#fastCopyBtn,#fastExportBtn').attr('disabled', true);
        }
    });
    //入库事件
    $('#increaseList').on('change', '.source', function () {
        var v = $(this).val();
        var tr = $(this).parents('tr');
        if (v == '计划退回') {
            $(this).next().removeClass('hidden');
            tr.find('.planList').trigger('change').trigger('select2:select');
        } else {
            $(this).next().addClass('hidden');
            var codeOp = selectOp(_codeAllData, 'Id', 'Code');
            tr.find('.code').empty().append(codeOp).trigger('select2:select');
            tr.find('.stockNum').prop('placeholder', '');
        }
        if (v == '采购') {
            tr.find('.ms2').select2({
                width: "120px",
                tags: true,
                createTag,
                matcher
            });
        } else {
            tr.find('.ms2').select2({
                width: "120px",
                matcher
            });
        }
    });
    $('#increaseList').on('select2:select', '.planList', function () {
        var planId = $(this).val();
        var tr = $(this).parents('tr');
        new Promise(resolve => planSend(resolve, planId)).then(e => {
            var codeEl = tr.find('.code');
            codeEl.empty().append(e).trigger('select2:select');
            var actual = codeEl.find(':selected').attr('actual');
            tr.find('.stockNum').prop('placeholder', `货品领用数量：${actual}`);
        });
    });
    $('#increaseList').on('input', '.stockNum', function () {
        var v = $(this).val();
        var tr = $(this).parents('tr');
        var actual = tr.find('.code :selected').attr('actual');
        if (!!actual && parseFloat(v) > parseFloat(actual)) {
            layer.msg('入库数量大于货品领用数量');
        }
    });
    //计划领用事件
    $('#consumePlanSelect').on('select2:select', function () {
        $('#consumePlanList').empty();
        $("#consumePlanCondition").val('');
        getPlanCode();
    });
    $('#planInto,#otherInto').on('change', function (e) {
        var files = e.target.files;
        var fileReader = new FileReader();
        fileReader.readAsBinaryString(files[0]);// 以二进制方式打开文件
        $(this).val('');
        var index = $(this).data('index');
        fileReader.onload = ev => {
            var workbook;
            try {
                workbook = XLSX.read(ev.target.result, { type: 'binary' }); // 以二进制流方式读取得到整份excel表格对象
            } catch (e) {
                layer.msg('文件类型不正确');
                return;
            }
            var persons = []; // 存储获取到的数据
            for (var sheet in workbook.Sheets) {// 遍历每张表读取
                if (workbook.Sheets.hasOwnProperty(sheet)) {
                    workbook.Sheets[sheet]['!ref'] = workbook.Sheets[sheet]['!ref'].replace('A1', 'A2');//表格范围设置
                    persons = persons.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                    /*使用XLSX.utils.sheet_to_json方法解析表格对象返回相应的JSON数据 */
                    // break; // 如果只取第一张表，就取消注释这行
                }
            }
            for (var i = 0, len = persons.length; i < len; i++) {
                var codeId = _codeNameData[persons[i]['货品编号']];
                if (codeId) {
                    addListTr(index, codeId);
                }
            }
        };
    });
    //日志事件
    $('#logPlanSelect').on('select2:select', function (e, codeId) {
        var planId = $(this).val();
        myPromise({
            opType: 704,
            opData: JSON.stringify({
                planId,
                stock: true
            })
        }).then(result => {
            var ops = selectOp(result, 'BillId', 'Code');
            $('#logBillSelect').append(`<option value="0">所有</option>${ops}`);
            if (codeId) {
                $('#logBillSelect').val(codeId).trigger('change');
            }
            getLogList();
        });
    });
    $('#logBillSelect').on('select2:select', () => getLogList());
    //初始化
    if (!pcAndroid()) {
        $(".icon-saoyisao").addClass('hidden');
    }
    $('#fastIncreaseModal,#increaseModal').on('hidden.bs.modal', () => $('#increaseBtn,#fastIncreaseBtn').attr('disabled', false));
    $('.maxHeight').css('maxHeight', innerHeight * 0.7);
}

//扫描添加
function scanAdd(e) {
    new Promise(resolve => showPrintModal(resolve)).then(result => {
        if (result) {
            var codeId = result.split(',')[0];
            addListTr(e, codeId);
        }
    });
}

//物料管理表格刷新
function refresh() {
    $('#siteSelect').val(0).trigger('change');
    $('#categorySelect').val(0).trigger('change').trigger('select2:select');
}

//计划退回选项
function planSend(resolve, planId) {
    var data = {}
    data.opType = 700;
    data.opData = JSON.stringify({
        qId: planId,
        first: true,
        simple: false
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas[0].FirstBill;
        var i, len = list.length;
        var option = '<option value = "{0}" actual = "{2}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.BillId, d.Code, d.ActualConsumption);
        }
        if (!isStrEmptyOrUndefined(resolve)) {
            resolve(options);
        }
    }, 0);
}

var _qrCode = null;
//位置设置
function qrSiteSet(el) {
    new Promise(function (resolve) {
        getMaterialList(el, resolve);
    }).then((result) => {
        var siteData = {};
        var option = '<option value = "{0}">{1}</option>';
        var options = '<option value = "0">所有位置</option>';
        var i, len = result.length;
        for (i = 0; i < len; i++) {
            var d = result[i];
            var siteId = d.SiteId;
            if (!siteData[siteId]) {
                siteData[siteId] = 1;
                options += option.format(siteId, d.Site);
            }
        }
        $(`#site${el}`).empty();
        $(`#site${el}`).append(options);
    });
}

var _logConsumePlanBill = null;
//类别选项
function categorySelect(resolve) {
    var data = {}
    data.opType = 816;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#categorySelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '<option value = "0">所有类别</option>';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Category);
        }
        $('#categorySelect').append(options);
        if (resolve != null)
            resolve(options);
    });
}

//名称选项
function nameSelect(resolve, first = false, el) {
    var list = {};
    if (!first) {
        var categoryId = $(`#category${el}`).val();
        if (isStrEmptyOrUndefined(categoryId)) {
            layer.msg('请选择货品类别');
            return;
        }
        if (categoryId != 0) {
            list.categoryId = categoryId;
        }
    }

    var data = {}
    data.opType = 824;
    data.opData = JSON.stringify(list);
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '<option value = "0">所有名称</option>';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Name);
        }
        $(`#name${el}`).empty();
        $(`#name${el}`).append(options);
        if (resolve != null)
            resolve(options);
    });
}

//供应商选项
function supplierSelect(resolve, first = false, el) {
    var list = {};
    if (!first) {
        var categoryId = $(`#category${el}`).val();
        if (isStrEmptyOrUndefined(categoryId)) {
            layer.msg('请选择货品类别');
            return;
        }
        if (categoryId != 0) {
            list.categoryId = categoryId;
        }

        var nameId = $(`#name${el}`).val();
        if (isStrEmptyOrUndefined(nameId)) {
            layer.msg('请选择货品名称');
            return;
        }
        if (nameId != 0) {
            list.nameId = nameId;
        }
    }

    var data = {}
    data.opType = 831;
    data.opData = JSON.stringify(list);
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '<option value = "0">所有供应商</option>';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Supplier);
        }
        $(`#supplier${el}`).empty();
        $(`#supplier${el}`).append(options);
        if (resolve != null)
            resolve(options);
    });
}

//规格选项
function specificationSelect(resolve, first = false, el) {
    var list = {};
    if (!first) {
        var categoryId = $(`#category${el}`).val();
        if (isStrEmptyOrUndefined(categoryId)) {
            layer.msg('请选择货品类别');
            return;
        }
        if (categoryId != 0) {
            list.categoryId = categoryId;
        }

        var nameId = $(`#name${el}`).val();
        if (isStrEmptyOrUndefined(nameId)) {
            layer.msg('请选择货品名称');
            return;
        }
        if (nameId != 0) {
            list.nameId = nameId;
        }

        var supplierId = $(`#supplier${el}`).val();
        if (isStrEmptyOrUndefined(supplierId)) {
            layer.msg('请选择供应商名称');
            return;
        }
        if (supplierId != 0) {
            list.supplierId = supplierId;
        }
    }
    var data = {}
    data.opType = 839;
    data.opData = JSON.stringify(list);
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '<option value = "0">所有规格</option>';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Specification);
        }
        $(`#specification${el}`).empty();
        $(`#specification${el}`).append(options);
        if (resolve != null)
            resolve(options);
    });
}

//场地选项
function siteSelect(resolve) {
    var data = {}
    data.opType = 847;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#siteSelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '<option value = "0">所有位置</option>';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Site);
        }
        $('#siteSelect').append(options);
        if (resolve != null)
            resolve(options);
    });
}

//获取物料信息
function getMaterialList(el, resolve) {
    var list = {};
    var categoryId = $(`#category${el}`).val();
    if (isStrEmptyOrUndefined(categoryId)) {
        layer.msg('请选择货品类别');
        return;
    }
    if (categoryId != 0) {
        list.categoryId = categoryId;
    }

    var nameId = $(`#name${el}`).val();
    if (isStrEmptyOrUndefined(nameId)) {
        layer.msg('请选择货品名称');
        return;
    }
    if (nameId != 0) {
        list.nameId = nameId;
    }

    var supplierId = $(`#supplier${el}`).val();
    if (isStrEmptyOrUndefined(supplierId)) {
        layer.msg('请选择供应商名称');
        return;
    }
    if (supplierId != 0) {
        list.supplierId = supplierId;
    }

    var specificationId = $(`#specification${el}`).val();
    if (isStrEmptyOrUndefined(specificationId)) {
        layer.msg('请选择规格名称');
        return;
    }
    if (specificationId != 0) {
        list.specificationId = specificationId;
    }

    var siteId = $(`#site${el}`).val();
    if (isStrEmptyOrUndefined(siteId)) {
        layer.msg('请选择位置');
        return;
    }
    if (siteId != 0) {
        list.siteId = siteId;
    }
    var data = {}
    data.opType = 800;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        if (resolve != null && el == 'Qr') {
            resolve(ret.datas);
            return;
        }
        _codeIdData = {};
        var rData = ret.datas;
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            _codeIdData[d.Id] = d;
        }
        $('#codeCount').text(ret.Count);
        $('#codeSum').text(ret.Sum);
        var detail = function (data) {
            return `<button type="button" class="btn btn-info btn-sm" onclick="showDetailModel(${data})">查看</button>`;
        }
        var number = function (data) {
            return data.Number < data.Stock ? `<strong class="text-red">${data.Number}</strong>` : `<span>${data.Number}</span>`;
        }
        var inTime = function (data) {
            var time = data.slice(0, data.indexOf(' '));
            return time == "0001-01-01" ? "" : time;
        }
        var outTime = function (data) {
            var time = data.slice(0, data.indexOf(' '));
            return time == "0001-01-01" ? "" : time;
        }
        var remark = function (data) {
            return data.length > tdShowLength ? `<span title="${data}" onclick="showAllContent('${escape(data)}')">${data.substring(0, tdShowLength)}...</span>`
                : `<span title="${data}">${data}</span>`;
        }
        var per538 = _permissionList[538].have;
        var per539 = _permissionList[539].have;
        var log = function (data) {
            var op = `${per538 ? '<button type="button" class="btn btn-success btn-sm" onclick="showLogModel(1, {0})">入库</button>' : ''}
                    ${per539 ? '<button type="button" class="btn btn-success btn-sm" onclick="showLogModel(2, {0})">领用</button>' : ''}`;
            return op.format(data.Id);
        }
        $("#materialList")
            .DataTable({
                dom: '<"pull-left"l><"pull-right"B><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                buttons: [{
                    extend: 'excel',
                    text: '导出Excel',
                    className: 'btn-primary btn-sm',
                    filename: `物料详情_${getDate()}`,
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                    }
                }],
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": oLanguage,
                "data": ret.datas,
                "aaSorting": [[0, "asc"]],
                "aLengthMenu": [50, 100, 150, 200], //更改显示记录数选项  
                "iDisplayLength": 50, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "序号", "render": (a, b, c, d) => ++d.row },
                    { "data": "Code", "title": "货品编号" },
                    { "data": "Category", "title": "类别" },
                    { "data": "Name", "title": "名称" },
                    { "data": null, "title": "库存数量", "render": number },
                    { "data": "Supplier", "title": "供应商" },
                    { "data": "Specification", "title": "规格" },
                    { "data": "Site", "title": "位置" },
                    { "data": "Unit", "title": "单位" },
                    { "data": "Price", "title": "价格" },
                    { "data": "Stock", "title": "最低库存", "sClass": "text-blue" },
                    { "data": "InTime", "title": "上次入库", "render": inTime },
                    { "data": "OutTime", "title": "上次领用", "render": outTime },
                    { "data": "Remark", "title": "备注", "render": remark },
                    { "data": "Id", "title": "详情", "render": detail, "orderable": false },
                    { "data": null, "title": "日志", "render": log, "orderable": false, "visible": per538 || per539 }
                ]
            });
    });
}

/////////////////////////////////////////////公共函数////////////////////////////////////////////

//联动下拉框数据
function gangedSelect(data, resolve) {
    ajaxPost("/Relay/Post", data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        resolve(ret.datas);
    }, 0);
}

//promise
function myPromise(data) {
    return new Promise(resolve => gangedSelect(data, resolve));
}

//联动下拉框数据转化对象
function gangedObj(arr, pro) {
    var obj = {};
    for (var i = 0, len = arr.length; i < len; i++) {
        var d = arr[i];
        var name = d[pro];
        obj[name] ? obj[name].push(d) : obj[name] = [d];
    }
    return obj;
}

//下拉框选项
function selectOp(arr, val, name) {
    arr = arr || [];
    var op = '<option value="{0}">{1}</option>';
    var ops = '';
    for (var i = 0, len = arr.length; i < len; i++) {
        var d = arr[i];
        ops += op.format(d[val], d[name]);
    }
    return ops;
}

//设置表格参数
function setTableTr(el) {
    var trs = $(`${el} tr`);
    for (var i = 0, len = trs.length; i < len; i++) {
        trs.eq(i).find('.num').text(i + 1);
    }
}

//重置表格
function resetList(el, isIncrease) {
    $(el).empty();
    if (isIncrease == 0) {
        $('#copyBtn,#exportBtn').attr('disabled', true);
    } else if (isIncrease == 4) {
        $('#fastCopyBtn,#fastExportBtn').attr('disabled', true);
    }
}

//添加一行
function addListTr(e, codeId, upTr) {
    var el = '', tr = '';
    var selectConfig = {
        width: "120px",
        matcher
    }
    switch (e) {
        case 0:
            el = '#increaseList';
            tr = _gangedTr;
            selectConfig.tags = true;
            selectConfig.createTag = createTag;
            $('#copyBtn,#exportBtn').attr('disabled', true);
            break;
        case 1:
            el = '#consumePlanList';
            tr = _gangedPlanTr;
            consumePlanDittoAuto(el);
            break;
        case 2:
            el = '#consumeOtherList';
            tr = _gangedOtherTr;
            consumePlanDittoAuto(el);
            break;
        case 3:
            el = '#reversalList';
            tr = _reversalTr;
            break;
        case 4:
            el = '#fastIncreaseList';
            tr = _gangedFastTr;
            selectConfig.tags = true;
            selectConfig.createTag = createTag;
            $('#fastCopyBtn,#fastExportBtn').attr('disabled', true);
            break;
    }
    var addOp;
    if (upTr) {
        upTr.after(tr);
        addOp = upTr.next();
    } else {
        $(el).append(tr);
        addOp = $(`${el} tr:last`);
        codeId ? addOp.find('.code').val(codeId).trigger('change').trigger('select2:select') : addOp.find('.code').trigger('select2:select');
        $(`${el}Table`).scrollTop($(`${el}Table`)[0].scrollHeight);
    }
    if (!pcAndroid()) {
        addOp.find('.scanPrint').addClass('hidden');
    }
    addOp.find('.ms2').select2(selectConfig);
    setTableTr(el);
}

//删除一行
function delTr(el) {
    var tr = $(this).parents('tr');
    tr.remove();
    setTableTr(el);
    if (el != '#increaseList') {
        consumePlanDittoAuto(el);
    }
}

var _codeAllData = null;
var _codeData = null;
var _codeIdData = null;
var _nameData = null;
var _supplierData = null;
var _specificationData = null;
var _siteData = null;
var _siteObj = null;
var _priceData = null;
//联动下拉框数据初始化
function initGangedData(resolve) {
    _codeData = {};
    _codeIdData = {};
    _siteObj = {};
    _priceData = {};
    var codeFunc = myPromise({ opType: 800 });
    var categoryFunc = myPromise({ opType: 816 });
    var nameFunc = myPromise({ opType: 824 });
    var supplierFunc = myPromise({ opType: 831 });
    var specificationFunc = myPromise({ opType: 839 });
    var siteFunc = myPromise({ opType: 847 });
    var priceFunc = myPromise({ opType: 852 });
    var planFunc = myPromise({ opType: 700 });
    Promise.all([codeFunc, categoryFunc, nameFunc, supplierFunc, specificationFunc, siteFunc, priceFunc, planFunc])
        .then(result => {
            _nameData = gangedObj(result[2], 'CategoryId');
            _supplierData = gangedObj(result[3], 'NameId');
            _specificationData = gangedObj(result[4], 'SupplierId');
            _siteData = result[5];
            var siteData = gangedObj(_siteData, 'Id');
            var i, d, len;
            _codeAllData = result[0];
            for (i = 0, len = _codeAllData.length; i < len; i++) {
                d = _codeAllData[i];
                var specId = d.SpecificationId;
                var siteId = d.SiteId;
                _codeData[`${specId}${siteId}${d.Price}`] = d;
                _codeIdData[d.Id] = d;
                _siteObj[specId] ? _siteObj[specId].push(siteData[siteId][0]) : _siteObj[specId] = siteData[siteId];
                _siteObj[specId] = [...new Set(_siteObj[specId])];
            }
            var price = result[6];
            for (i = 0, len = price.length; i < len; i++) {
                d = price[i];
                var flag = `${d.SpecificationId}${d.SiteId}`;
                _priceData[flag] ? _priceData[flag].push(d) : _priceData[flag] = [d];
            }
            var planOp = selectOp(result[7], 'Id', 'Plan');
            var codeOp = selectOp(_codeAllData, 'Id', 'Code');
            var categoryOp = selectOp(result[1], 'Id', 'Category');
            resolve({ planOp, codeOp, categoryOp });
        });
}

//编号联动
function codeGanged(e) {
    var v = $(this).val();
    var tr = $(this).parents('tr');
    var d = _codeIdData[v] || '';
    var categoryId = d.CategoryId || '';
    var nameId = d.NameId || '';
    var supplierId = d.SupplierId || '';
    var specificationId = d.SpecificationId || '';
    var siteId = d.SiteId || '';
    var nameEl = tr.find('.name');
    var supplierEl = tr.find('.supplier');
    var specificationEl = tr.find('.specification');
    //if (!nameEl.find(':selected').data('select2Tag') || !supplierEl.find(':selected').data('select2Tag') || !specificationEl.find(':selected').data('select2Tag')) { }
    var nullOp = '<option></option>';
    tr.find('.category').val(categoryId).trigger('change');
    var nameOp = selectOp(_nameData[categoryId], 'Id', 'Name');
    nameEl.empty().append(nameOp || nullOp).val(nameId).trigger('change');
    var supplierOp = selectOp(_supplierData[nameId], 'Id', 'Supplier');
    supplierEl.empty().append(supplierOp || nullOp).val(supplierId).trigger('change');
    var specificationOp = selectOp(_specificationData[supplierId], 'Id', 'Specification');
    specificationEl.empty().append(specificationOp || nullOp).val(specificationId).trigger('change');
    var siteOp = selectOp(specificationId == '' ? _siteData : _siteObj[specificationId], 'Id', 'Site');
    tr.find('.site').empty().append(siteOp).val(siteId).trigger('change');
    var priceOp = selectOp(_priceData[`${specificationId}${siteId}`], 'Price', 'Price');
    tr.find('.price').empty().append(priceOp || nullOp).val(d.Price || 0).trigger('change');
    TrNoEqual(e, tr, d);
}

//表格tr的不同点
function TrNoEqual(e, tr, d) {
    switch (e) {
        case 0://入库
            tr.find('.unit label').text(d.Unit || '');
            tr.find('.number label').text(d.Number || 0);
            d == ''
                ? tr.find('.textIn').addClass('hidden').siblings('.textOn').removeClass('hidden')
                : tr.find('.textOn').addClass('hidden').siblings('.textIn').removeClass('hidden');
            var actual = $(this).find(':selected').attr('actual');
            if (actual) {
                tr.find('.stockNum').prop('placeholder', `货品领用数量：${actual}`);
            }
            break;
        case 1://计划领用
            var planId = $('#consumePlanSelect').val();
            var billData = _planBillData[d.Id] || '';
            tr.find('.planConsume').text(billData.PlannedConsumption || 0);
            tr.find('.actualConsume').text(billData.ActualConsumption || 0);
            tr.find('.refresh-btn').attr('onclick', `refreshNumber(${d.Id || 0},'#consumePlanList')`);
            var logBtn = tr.find('.log-btn');
            logBtn.attr('onclick', `showLogModel(2,${d.Id},${planId})`);
            billData ? logBtn.removeClass('hidden') : logBtn.addClass('hidden');
            break;
        case 2://其他领用
            tr.find('.refresh-btn').attr('onclick', `refreshNumber(${d.Id || 0},'#consumeOtherList')`);
            tr.find('.log-btn').attr('onclick', `showLogModel(2,${d.Id || 0})`);
            break;
        case 3://冲正
            tr.find('.unit').text(d.Unit || '');
            tr.find('.refresh-btn').attr('onclick', `refreshNumber(${d.Id || 0},'#reversalList')`);
            tr.find('.log-btn').attr('onclick', `showLogModel(3,${d.Id || 0})`);
            tr.find('.remark').val(d.Remark || '');
            break;
        case 4://快捷入库
            tr.find('.unit label').text(d.Unit || '');
            d == ''
                ? tr.find('.textIn').addClass('hidden').siblings('.textOn').removeClass('hidden')
                : tr.find('.textOn').addClass('hidden').siblings('.textIn').removeClass('hidden');
            break;
    }
    if (e != 0 && e != 4) {
        tr.find('.number').text(d.Number || 0);
    }
    tr.find('.show-btn').attr('onclick', `showDetailModel(${d.Id || 0})`);
}

//编号外选项联动
function codeNoGanged(e, type) {
    var tr = $(this).parents('tr');
    var tagTf = tr.find('.code :selected').data('select2Tag');
    var nameEl = tr.find('.name');
    var supplierEl = tr.find('.supplier');
    var specificationEl = tr.find('.specification');
    var siteEl = tr.find('.site');
    var priceEl = tr.find('.price');
    var specificationId = specificationEl.val() || '';
    var siteId = siteEl.val() || '';
    var codeId = tr.find('.code').val();
    var nullOp = '<option></option>';
    switch (e) {
        case 0:
            var categoryId = tr.find('.category').val() || '';
            var nameOp = selectOp(_nameData[categoryId], 'Id', 'Name');
            nameEl.empty().append(nameOp || nullOp);
        case 1:
            var nameId = nameEl.val() || '';
            var supplierOp = selectOp(_supplierData[nameId], 'Id', 'Supplier');
            supplierEl.empty().append(supplierOp || nullOp);
        case 2:
            var supplierId = supplierEl.val() || '';
            var specificationOp = selectOp(_specificationData[supplierId], 'Id', 'Specification');
            specificationEl.empty().append(specificationOp || nullOp);
        case 3:
            specificationId = specificationEl.val() || '';
            var siteOp = tagTf || !codeId
                ? selectOp(_siteData, 'Id', 'Site')
                : selectOp(_siteObj[specificationId] ? _siteObj[specificationId] : _siteData, 'Id', 'Site');
            siteEl.empty().append(siteOp);
        case 4:
            if (!priceEl.find(':selected').data('select2Tag')) {
                siteId = siteEl.val() || '';
                var priceOp = tagTf ? '' : selectOp(_priceData[`${specificationId}${siteId}`], 'Price', 'Price');
                priceEl.empty().append(priceOp || nullOp);
            }
        case 5:
            var price = priceEl.val() || '';
            price = price.replace('tag', '');
            var codeData = _codeData[`${specificationId}${siteId}${price}`] || '';
            if (tagTf) {
                if (codeData != '') {
                    tr.find('.code').val(codeData.Id).trigger('change');
                    tr.find('.textOn').addClass('hidden').siblings('.textIn').removeClass('hidden');
                }
            } else {
                tr.find('.code').val(codeData.Id || '').trigger('change');
            }
            if (!codeData.Id) {
                var name = tr.find('.name :selected').text();
                var supplier = tr.find('.supplier :selected').text();
                var specification = tr.find('.specification :selected').text();
                if (!isStrEmptyOrUndefined(name) && !isStrEmptyOrUndefined(supplier) && !isStrEmptyOrUndefined(specification)) {
                    specification = specification.replace(/[&\|\\\*^%$#@\-]/g, '');
                    var newCode = `${name.toPinYin()}${supplier.toPinYin()}${specification.toPinYin()}`;
                    var codeArr = {}, codeEl;
                    if (type == 0) {
                        codeEl = $('#increaseList .code :selected');
                    } else if (type == 4) {
                        codeEl = $('#fastIncreaseList .code :selected');
                    }
                    for (var i = 0, len = codeEl.length; i < len; i++) {
                        var d = codeEl.eq(i);
                        var codeText = d.text();
                        if (d.data('select2Tag') && tr.find('.code :selected').text() != codeText) {
                            codeArr[codeText] = 1;
                        }
                    }
                    var codeNameObj = $.extend(true, {}, codeArr, _codeNameData);
                    var flag = 0, newCodeFlag = newCode;
                    while (codeNameObj[newCodeFlag]) {
                        flag++;
                        newCodeFlag = `${newCode}${flag}`;
                    }
                    var op = `<option value="tag${newCodeFlag}" data-select2-tag="true">${newCodeFlag}</option>`;
                    tr.find('.code').append(op).val(`tag${newCodeFlag}`).trigger('change');
                }
            }
            TrNoEqual(type, tr, codeData);
    }
}

//货品相关编号外下拉框
var _noCodeTds = `<td><select class="ms2 form-control category" data-flag="0">{0}</select></td>
    <td><select class="ms2 form-control name" data-flag="1"></select></td>
    <td><select class="ms2 form-control supplier" data-flag="2"></select></td>
    <td><select class="ms2 form-control specification" data-flag="3"></select></td>
    <td><select class="ms2 form-control price" data-flag="5"></select></td>
    <td><select class="ms2 form-control site" data-flag="4"></select></td>`;

//入库相同处
var _increaseEqualTds = `<td><input class="form-control text-center stockNum zeroNum" type="tel" value="0" onkeyup="onInput(this, 8, 1)" onblur="onInputEnd(this)" style="width:140px;margin:auto"></td>
            <td class="unit"><label class="control-label textIn"></label><input class="form-control text-center hidden textOn" maxlength="4" style="min-width:70px"></td>
            <td>
               <div class="flexStyle" style="width:160px">
                   <input class="form-control text-center purchase" maxlength="64">
                   <button class="btn btn-primary btn-sm pull-right" type="button" onclick="copyTr.call(this,{1})" style="margin-left:3px" title="复制"><i class="fa fa-copy"></i></button>
               </div>
            </td>
            <td>
                <span class="iconfont icon-saoyisao scanPrint" style="font-size:30px;cursor:pointer;vertical-align:middle"></span>
                <select class="ms2 form-control code">{0}</select>
            </td>`;

//获取编号名字
function getCodeName() {
    _codeNameData = {};
    for (var i = 0, len = _codeAllData.length; i < len; i++) {
        var d = _codeAllData[i];
        _codeNameData[d.Code] = d.Id;
    }
}

/////////////////////////////////////////////入库////////////////////////////////////////////
var _gangedTr = null;
//入库弹窗
function showIncreaseModel() {
    $('#addIncreaseListBtn,#copyBtn,#exportBtn').attr('disabled', true);
    $("#increaseList").empty();
    new Promise(resolve => initGangedData(resolve)).then(e => {
        getCodeName();
        _gangedTr = `<tr>
            <td class="num"></td>
            <td>
                <div class="flexStyle" style="justify-content:center">
                    <select class="form-control source" style="width:110px">
                        <option>采购</option>
                        <option>退回</option>
                        <option>计划退回</option>
                    </select>
                    <div class="hidden" style="width:110px"><select class="ms2 form-control planList">${e.planOp}</select></div>
                </div>
            </td>
            ${_noCodeTds.format(e.categoryOp)}${_increaseEqualTds.format(e.codeOp, 0)}
            <td class="number"><label class="control-label textIn"></label><input type="tel" value="0" class="form-control text-center zeroNum hidden textOn" onkeyup="onInput(this, 8, 1)" onblur="onInputEnd(this)" style="min-width:70px"></td>
            <td><button class="btn btn-info btn-sm show-btn" type="button" onclick="showDetailModel()">查看</button></td>
            <td><button type="button" class="btn btn-danger btn-sm" onclick="delTr.call(this,'#increaseList')"><i class="fa fa-minus"></i></button></td>
            </tr>`;
        $('#addIncreaseListBtn').attr('disabled', false);
    });
    $('#increaseModal').modal('show');
}

/////////////////////////////////////////////快捷入库////////////////////////////////////////////
var _gangedFastTr = null;
//快捷入库弹窗
function showFastIncreaseModel() {
    $('#addFastIncreaseListBtn,#fastCopyBtn,#fastExportBtn').attr('disabled', true);
    $("#fastIncreaseList").empty();
    new Promise(resolve => initGangedData(resolve)).then(e => {
        getCodeName();
        _gangedFastTr = `<tr>
            <td class="num"></td>
            ${_noCodeTds.format(e.categoryOp)}${_increaseEqualTds.format(e.codeOp, 4)}
            <td><button type="button" class="btn btn-danger btn-sm" onclick="delTr.call(this,'#fastIncreaseList')"><i class="fa fa-minus"></i></button></td>
            </tr>`;
        $('#addFastIncreaseListBtn').attr('disabled', false);
    });
    $('#fastIncreaseModal').modal('show');
}

//点击入库复制
function copyTr(e) {
    var tr = $(this).parents('tr');
    addListTr(e, null, tr);
    var downTr = tr.next();
    var stockNum = tr.find('.stockNum').val().trim();
    var purchase = tr.find('.purchase').val().trim();
    downTr.find('.stockNum').val(stockNum);
    downTr.find('.purchase').val(purchase);
    //入库复制变动
    var copyTrChange = (selectEl, downSelectEl) => downSelectEl.empty().append(selectEl.html()).val(selectEl.val()).trigger('change');
    if (e === 0) {
        var source = tr.find('.source').val();
        downTr.find('.source').val(source);
        if (source == '计划退回') {
            downTr.find('.planList').parent().removeClass('hidden');
            downTr.find('.planList').val(tr.find('.planList').val()).trigger('change');
            copyTrChange(tr.find('.code'), downTr.find('.code'));
        }
        downTr.find('.number').replaceWith(tr.find('.number').clone(true));
        downTr.find('.show-btn').replaceWith(tr.find('.show-btn').clone(true));
    }
    var codeId = tr.find('.code').val();
    var codeTags = tr.find('.code :selected').data('select2Tag');
    if (!codeTags && codeId) {
        downTr.find('.code').val(codeId).trigger('change').trigger('select2:select');
        return;
    }
    copyTrChange(tr.find('.code'), downTr.find('.code'));
    copyTrChange(tr.find('.category'), downTr.find('.category'));
    copyTrChange(tr.find('.name'), downTr.find('.name'));
    copyTrChange(tr.find('.supplier'), downTr.find('.supplier'));
    copyTrChange(tr.find('.specification'), downTr.find('.specification'));
    copyTrChange(tr.find('.price'), downTr.find('.price'));
    copyTrChange(tr.find('.site'), downTr.find('.site'));
    downTr.find('.unit').replaceWith(tr.find('.unit').clone(true));
}

//入库
function increase(isFast) {
    var bill = new Array();
    var el = isFast ? '#fastIncrease' : '#increase';
    var trs = $(`${el}List tr`);
    for (var i = 0, len = trs.length; i < len; i++) {
        var xh = i + 1;
        var tr = trs.eq(i);
        var codeEl = tr.find('.code :selected');
        var codeId = codeEl.val();
        if (isStrEmptyOrUndefined(codeId)) {
            layer.msg(`序列${xh}：货品编号不能为空`);
            return;
        }
        var tagTf = codeEl.data('select2Tag');
        codeId = tagTf ? '0' : codeId;
        var code = codeEl.text();
        var categoryEl = tr.find('.category :selected');
        var categoryId = categoryEl.val();
        if (isStrEmptyOrUndefined(categoryId)) {
            layer.msg(`序列${xh}：请选择类别`);
            return;
        }
        categoryId = categoryEl.data('select2Tag') ? '0' : categoryId;
        var nameEl = tr.find('.name :selected');
        var nameId = nameEl.val();
        if (isStrEmptyOrUndefined(nameId)) {
            layer.msg(`序列${xh}：请选择名称`);
            return;
        }
        nameId = nameEl.data('select2Tag') ? '0' : nameId;
        var supplierEl = tr.find('.supplier :selected');
        var supplierId = supplierEl.val();
        if (isStrEmptyOrUndefined(supplierId)) {
            layer.msg(`序列${xh}：请选择供应商`);
            return;
        }
        supplierId = supplierEl.data('select2Tag') ? '0' : supplierId;
        var specificationEl = tr.find('.specification :selected');
        var specificationId = specificationEl.val();
        if (isStrEmptyOrUndefined(specificationId)) {
            layer.msg(`序列${xh}：请选择规格`);
            return;
        }
        specificationId = specificationEl.data('select2Tag') ? '0' : specificationId;
        var price = tr.find('.price :selected').text();
        if (isStrEmptyOrUndefined(price)) {
            layer.msg(`序列${xh}：请选择单价`);
            return;
        }
        if (parseFloat(price) != price) {
            layer.msg(`序列${xh}：单价不合法`);
            return;
        }
        var siteEl = tr.find('.site :selected');
        var siteId = siteEl.val();
        if (isStrEmptyOrUndefined(siteId)) {
            layer.msg(`序列${xh}：请选择位置`);
            return;
        }
        siteId = siteEl.data('select2Tag') ? '0' : siteId;
        var unit, stock;
        if (tagTf) {
            unit = tr.find('.unit input').val().trim();
            if (isStrEmptyOrUndefined(unit)) {
                layer.msg(`序列${xh}：请输入单位`);
                return;
            }
            stock = isFast ? 0 : tr.find('.number input').val().trim();
        } else {

            unit = tr.find('.unit label').text();
            stock = isFast ? _codeIdData[codeId].Stock : tr.find('.number label').text();
        }
        var inRk = tr.find('.stockNum').val();
        if (isStrEmptyOrUndefined(inRk)) {
            layer.msg(`序列${xh}：${code}: 入库数量不能为空`);
            return;
        }
        if (parseFloat(inRk) <= 0) {
            layer.msg(`序列${xh}：${code}: 入库数量需大于0`);
            return;
        }
        if (!isFast) {
            var actual = codeEl.attr('actual');
            if (!!actual && parseFloat(inRk) > parseFloat(actual)) {
                layer.msg(`序列${xh}：入库数量大于货品领用数量`);
                return;
            }
        }
        var inCg = tr.find('.purchase').val().trim();
        if (isStrEmptyOrUndefined(inCg)) {
            layer.msg(`序列${xh}：采购/退回人不能为空`);
            return;
        }
        var sourceEl = tr.find('.source');
        var inLy = isFast ? '采购' : sourceEl.val();
        var list = {
            CategoryId: categoryId,
            Category: categoryEl.text(),
            NameId: nameId,
            Name: nameEl.text(),
            SupplierId: supplierId,
            Supplier: supplierEl.text(),
            SpecificationId: specificationId,
            Specification: specificationEl.text(),
            SiteId: siteId,
            Site: siteEl.text(),
            Code: code,
            Unit: unit,
            Price: price,
            Stock: stock,
            Purpose: inLy,
            RelatedPerson: inCg,
            BillId: codeId,
            Number: inRk
        };
        if (!isFast && inLy == '计划退回') {
            list.PlanId = sourceEl.next().find('.planList').val();
        }
        bill.push(list);
    }
    if (bill.length <= 0) {
        layer.msg("请输入货品");
        return;
    }
    var doSth = () => {
        var data = {}
        data.opType = 801;
        data.opData = JSON.stringify({
            Bill: bill
        });
        ajaxPost("/Relay/Post", data, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                isFast ? $('#fastCopyBtn,#fastExportBtn').attr('disabled', false) : $('#copyBtn,#exportBtn').attr('disabled', false);
                $(this).attr('disabled', true);
                setTimeout(() => $(this).attr('disabled', false),10000);
                getMaterialList('Select');
            }
        });
    }
    showConfirm('入库', doSth);
}

//导出
function exportExcel(el) {
    var trs = $(`${el} tr`);
    var data = [];
    for (var i = 0, len = trs.length; i < len; i++) {
        var tr = trs.eq(i);
        var codeEl = tr.find('.code :selected');
        var tagTf = codeEl.data('select2Tag');
        data.push({
            Code: codeEl.text(),
            Category: tr.find('.category :selected').text(),
            Name: tr.find('.name :selected').text(),
            Supplier: tr.find('.supplier :selected').text(),
            Specification: tr.find('.specification :selected').text(),
            Price: tr.find('.price :selected').text(),
            Site: tr.find('.site :selected').text(),
            Unit: tagTf ? tr.find('.unit input').val().trim() : tr.find('.unit label').text()
        });
    }
    if (!data.length) {
        layer.msg('请先添加货品');
        return;
    }
    $('<table></table>').DataTable({
        dom: 'B',
        buttons: [{
            extend: 'excel',
            filename: `入库日志_${getDate()}`
        }],
        destroy: true,
        data,
        columns: [
            { data: null, title: '序号', render: (a, b, c, d) => ++d.row },
            { data: 'Code', title: '货品编号' },
            { data: 'Category', title: '类别' },
            { data: 'Name', title: '名称' },
            { data: 'Supplier', title: '供应商' },
            { data: 'Specification', title: '规格型号' },
            { data: 'Price', title: '单价' },
            { data: 'Site', title: '位置' },
            { data: 'Unit', title: '单位' }
        ]
    }).buttons('.buttons-excel').trigger();
}

var _copyData = [];
//拷贝
function copyTable(el) {
    var trs = $(`${el} tr`);
    _copyData = [];
    for (var i = 0, len = trs.length; i < len; i++) {
        var codeName = trs.eq(i).find('.code :selected').text().trim();
        _copyData.push(codeName);
    }
    layer.msg(_copyData.length ? '拷贝成功' : '请先添加货品');
}

/////////////////////////////////////////////领用/////////////////////////////////////////////
var _planBillData = null;
//获取计划下货品信息
function getPlanCode() {
    $('#addConsumePlanListBtn').attr('disabled', true);
    var planId = $('#consumePlanSelect').val();
    _planBillData = {};
    if (!isStrEmptyOrUndefined(planId)) {
        myPromise({
            opType: 704,
            opData: JSON.stringify({
                planId,
                stock: true
            })
        }).then(result => {
            for (var i = 0, len = result.length; i < len; i++) {
                var d = result[i];
                _planBillData[d.BillId] = d;
            }
            $('#addConsumePlanListBtn').attr('disabled', false);
        });
    }
}

var _gangedPlanTr = null;
var _gangedOtherTr = null;
var _codeNameData = null;
//领用弹窗
function showConsumeModel() {
    $('#addConsumePlanListBtn,#addConsumeOtherListBtn').attr('disabled', true);
    if ($('#planConsumeLi').attr('aria-expanded') == 'false') {
        $('#planConsumeLi').click();
    }
    $("#consumePlanCondition,#consumeOther,#consumeOtherCondition").val('');
    $('#consumePlanSelect,#consumePlanList,#consumeOtherList,#logPlanSelect').empty();
    new Promise(resolve => initGangedData(resolve)).then(e => {
        $('#consumePlanSelect').append(e.planOp);
        $('#logPlanSelect').append(`<option value="0">所有</option>${e.planOp}`);
        getPlanCode();
        getCodeName();
        var addTr = `<tr>
            <td class="num"></td>
            <td>
                <span class="iconfont icon-saoyisao scanPrint" style="font-size:30px;cursor:pointer;vertical-align:middle"></span>
                <select class="ms2 form-control code">${e.codeOp}</select>
            </td>
            ${_noCodeTds.format(e.categoryOp)}
            <td><input class="form-control text-center receive zeroNum" type="tel" value="0" onkeyup="onInput(this, 8, 1)" onblur="onInputEnd(this)" style="width:140px;margin:auto"></td>
            {0}
            <td class="form-inline">
                <span class="number"></span>
                <button type="button" class="btn btn-danger btn-xs pull-right refresh-btn" onclick="refreshNumber()"><i class="fa fa-refresh"></i></button>
            </td>
            <td>
                <div class="flexStyle" style="width:150px">
                    <input class="form-control text-center recipient" type="tel" maxlength="64">
                    <button class="btn btn-primary btn-sm conPlanDitto" style="margin-left:3px" onclick="consumePlanDitto.call(this)">同上</button>
                </div>
            </td>
            <td><button class="btn btn-info btn-sm show-btn" type="button" onclick="showDetailModel()">详情</button></td>
            <td><button class="btn btn-success btn-sm log-btn" type="button" onclick="showLogConsumeModel()">查看</button></td>
            <td><button type="button" class="btn btn-danger btn-sm" onclick="delTr.call(this,'{1}')"><i class="fa fa-minus"></i></button></td>
            </tr>`;
        _gangedPlanTr = addTr.format('<td class="planConsume"></td><td class="actualConsume"></td>', '#consumePlanList');
        _gangedOtherTr = addTr.format('', '#consumeOtherList');
        $('#addConsumeOtherListBtn').attr('disabled', false);
    });
    $('#consumeModal').modal('show');
}

//领用刷新库存
function refreshNumber(id, el) {
    var data = {}
    data.opType = 800;
    data.opData = JSON.stringify({
        qId: id
    });
    ajaxPost("/Relay/Post", data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var number = ret.datas[0].Number;
        var trs = $(`${el} tr`);
        var i, len;
        for (i = 0, len = trs.length; i < len; i++) {
            var tr = trs.eq(i);
            var codeId = tr.find('.code :selected').val();
            if (id == codeId) {
                tr.find('.number').text(number);
            }
        }
        for (i = 0, len = _codeAllData.length; i < len; i++) {
            var old = _codeAllData[i];
            if (old.Id == id) {
                old.Number = number;
                _codeData[`${old.SpecificationId}${old.SiteId}${old.Price}`].Number = number;
                _codeIdData[id].Number = number;
                break;
            }
        }
    });
}

//隐藏领用同上
function consumePlanDittoAuto(el) {
    $(el).find('.conPlanDitto').css('visibility', 'visible');
    $(`${el} tr:not(.hidden):first .conPlanDitto`).css('visibility', 'hidden');
}

//领用表格tr搜索
function searchTr(table) {
    var parent = $(this).parent();
    var val = parent.find('.val').val().trim();
    var trs = $(`${table} tr`);
    if (isStrEmptyOrUndefined(val)) {
        trs.removeClass('hidden');
    } else {
        var fn = new Function();
        var sym = parent.find('.sym').val();
        switch (sym) {
            case '0':
                fn = (a, b) => a == b;
                break;
            case '1':
                fn = (a, b) => a != b;
                break;
            case '2':
                fn = (a, b) => a.indexOf(b) != -1;
                break;
        }
        var th = parent.find('.thText').val();
        for (var i = 0, len = trs.length; i < len; i++) {
            var tr = trs.eq(i);
            var tdText = tr.find(`.${th} :selected`).text();
            fn(tdText, val) ? tr.removeClass('hidden') : tr.addClass('hidden');
        }
    }
    consumePlanDittoAuto(table);
}

//点击领用同上按钮
function consumePlanDitto() {
    var tr = $(this).parents('tr');
    var upTr = tr.prevAll(':not(.hidden):first');
    var upRecipient = upTr.find('.recipient').val().trim();
    tr.find('.recipient').val(upRecipient);
}

var _consumeConfirmData = null;
//领用确认弹窗
function consumeConfirm() {
    var el, purpose;
    var isPlanModal = $('#planConsumeLi').attr('aria-expanded') == 'true';
    if (isPlanModal) {
        el = '#consumePlanList';
        purpose = $('#consumePlanSelect :selected').text();
        if (isStrEmptyOrUndefined(purpose)) {
            layer.msg('请选择计划号');
            return;
        }
    } else {
        el = '#consumeOtherList';
        purpose = $('#consumeOther').val().trim();
        if (isStrEmptyOrUndefined(purpose)) {
            layer.msg('请输入用途');
            return;
        }
    }
    var data = [];
    _consumeConfirmData = [];
    var trs = $(`${el} tr`);
    for (var i = 0, len = trs.length; i < len; i++) {
        var xh = i + 1;
        var tr = trs.eq(i);
        var codeId = tr.find('.code').val();
        if (isStrEmptyOrUndefined(codeId)) {
            layer.msg(`序列${xh}：请选择货品编号`);
            return;
        }
        var d = _codeIdData[codeId];
        if (isStrEmptyOrUndefined(d)) {
            layer.msg(`序列${xh}：货品编号不存在, 无法领用`);
            return;
        }
        var number = tr.find('.receive').val().trim();
        if (number >> 0 <= 0) {
            layer.msg(`序列${xh}：领用数量必须大于0`);
            return;
        }
        var relatedPerson = tr.find('.recipient').val().trim();
        if (isStrEmptyOrUndefined(relatedPerson)) {
            layer.msg(`序列${xh}：请输入领用人`);
            return;
        }
        var obj = {
            RelatedPerson: relatedPerson,
            BillId: codeId,
            Number: number
        };
        if (!isPlanModal) {
            obj.Purpose = purpose;
        }
        _consumeConfirmData.push(obj);
        data.push({
            Code: d.Code,
            Category: d.Category,
            Name: d.Name,
            Supplier: d.Supplier,
            Specification: d.Specification,
            Price: d.Price,
            Site: d.Site,
            Number: number,
            RelatedPerson: relatedPerson,
        });
    }
    if (!data.length) {
        layer.msg('请先添加货品');
        return;
    }
    $('#consumePurpose').text(purpose);
    $("#consumeConfirmList")
        .DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": data,
            "aaSorting": [[0, "asc"]],
            "aLengthMenu": [40, 80, 120], //更改显示记录数选项  
            "iDisplayLength": 40, //默认显示的记录数
            "columns": [
                { "data": null, "title": "序号", "render": (a, b, c, d) => ++d.row },
                { "data": "Code", "title": "货品编号" },
                { "data": "Category", "title": "货品类别" },
                { "data": "Name", "title": "货品名称" },
                { "data": "Supplier", "title": "供应商" },
                { "data": "Specification", "title": "规格型号" },
                { "data": "Price", "title": "单价" },
                { "data": "Site", "title": "位置" },
                { "data": "Number", "title": "领用数量" },
                { "data": "RelatedPerson", "title": "领用人" }
            ]
        });

    $("#consumeConfirmModal").modal("show");
}

//领用
function consume() {
    var opType = 802;
    var doSth = function () {
        var data = {}
        data.opType = opType;
        var opData = {
            Bill: _consumeConfirmData
        };
        if ($('#planConsumeLi').attr('aria-expanded') == 'true') {
            opData.PlanId = $('#consumePlanSelect').val();
        }
        data.opData = JSON.stringify(opData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    $("#consumeConfirmModal,#consumeModal").modal("hide");
                    getMaterialList('Select');
                }
            });
    }
    showConfirm('领用', doSth);
}

//领用粘贴
function receiveStick(e) {
    var len = _copyData.length;
    if (!len) {
        layer.msg('请先拷贝入库数据');
        return;
    }
    for (var i = 0; i < len; i++) {
        var codeId = _codeNameData[_copyData[i]];
        if (codeId) {
            addListTr(e, codeId);
        }
    }
}

/////////////////////////////////////////////冲正/////////////////////////////////////////////
var _reversalTr = null;
//冲正弹窗
function showReversalModel() {
    $("#addReversalListBtn").attr('disabled', true);
    $('#reversalList').empty();
    new Promise(resolve => initGangedData(resolve)).then(e => {
        _reversalTr = `<tr>
            <td class="num"></td>
            <td>
                <span class="iconfont icon-saoyisao scanPrint" style="font-size:30px;cursor:pointer;vertical-align:middle"></span>
                <select class="ms2 form-control code">${e.codeOp}</select>
            </td>
            ${_noCodeTds.format(e.categoryOp)}
            <td class="unit"></td>
            <td class="form-inline">
                <span class="number"></span>
                <button type="button" class="btn btn-danger btn-xs pull-right refresh-btn" onclick="refreshNumber()"><i class="fa fa-refresh"></i></button>
            </td>
            <td><input type="tel" class="form-control text-center upNumber zeroNum" value="0" onkeyup="onInput(this, 8, 1)" onblur="onInputEnd(this)" style="width:140px;margin:auto"></td>
            <td class="no-padding"><textarea class="form-control remark" maxlength="500" style="resize: vertical;width:150px;margin:auto"></textarea></td>
            <td><button class="btn btn-info btn-sm show-btn" type="button" onclick="showDetailModel()">详情</button></td>
            <td><button class="btn btn-success btn-sm log-btn" type="button" onclick="showLogConsumeModel()">查看</button></td>
            <td><button type="button" class="btn btn-danger btn-sm" onclick="delTr.call(this,'#reversalList')"><i class="fa fa-minus"></i></button></td>
            </tr>`;
        $("#addReversalListBtn").attr('disabled', false);
    });
    $("#reversalModal").modal("show");
}

var _reversalConList = null;
//冲正确认弹窗
function reversalConModal() {
    var trs = $('#reversalList tr');
    var i, len = trs.length;
    if (!len) {
        layer.msg('请添加货品');
        return;
    }
    var reversalConList = [];
    _reversalConList = [];
    var user = getCookieTokenInfo().name;
    for (i = 0; i < len; i++) {
        var xh = i + 1;
        var tr = trs.eq(i);
        var codeId = tr.find('.code').val();
        if (isStrEmptyOrUndefined(codeId)) {
            layer.msg('请选择货品编号');
            return;
        }
        var d = _codeIdData[codeId];
        if (isStrEmptyOrUndefined(d)) {
            layer.msg(`序列${xh}：货品编号不存在, 请重新选择`);
            return;
        }
        var number = tr.find('.upNumber').val().trim();
        var remark = tr.find('.remark').val().trim();
        reversalConList.push({
            code: d.Code,
            category: d.Category,
            name: d.Name,
            supplier: d.Supplier,
            specification: d.Specification,
            price: d.Price,
            site: d.Site,
            number,
            remark
        });
        _reversalConList.push({
            BillId: codeId,
            Number: number,
            Remark: remark,
            RelatedPerson: user
        });
    }
    $("#reversalConList")
        .DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": reversalConList,
            "aaSorting": [[0, "asc"]],
            "aLengthMenu": [40, 80, 120], //更改显示记录数选项  
            "iDisplayLength": 40, //默认显示的记录数
            "columns": [
                { "data": null, "title": "序号", "render": (a, b, c, d) => ++d.row },
                { "data": "code", "title": "货品编号" },
                { "data": "category", "title": "货品类别" },
                { "data": "name", "title": "货品名称" },
                { "data": "supplier", "title": "供应商" },
                { "data": "specification", "title": "规格型号" },
                { "data": "price", "title": "单价" },
                { "data": "site", "title": "位置" },
                { "data": "number", "title": "库存修改", 'sClass': 'text-info' },
                { "data": "remark", "title": "备注", 'sClass': 'text-info' }
            ]
        });
    $('#reversalConModal').modal('show');
}

//冲正
function reversalCon() {
    var doSth = () => {
        var data = {}
        data.opType = 804;
        var opData = {
            Bill: _reversalConList
        };
        data.opData = JSON.stringify(opData);
        ajaxPost("/Relay/Post", data, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                $('#reversalConModal,#reversalModal').modal("hide");
                getMaterialList('Select');
            }
        });
    }
    showConfirm('冲正', doSth);
}

/////////////////////////////////////////////日志////////////////////////////////////////////
var _logType = null;
//日志弹窗
function showLogModel(type, codeId, planId) {
    _logType = type;
    $('#logStartDate,#logEndDate').off('changeDate').val(getDate()).datepicker('update').on('changeDate', () => getLogList());
    $('#logBillSelect').empty();
    $('#logPlanBox,#billInfo').addClass('hidden');
    $('#billInfo .spanStyle').text('');
    var title = '';
    switch (type) {
        case 0:
            title = '操作日志';
            break;
        case 1:
            title = '入库日志';
            break;
        case 2:
            title = '领用日志';
            break;
        case 3:
            title = '冲正日志';
            break;
    }
    $('#logTitle').text(title);
    if (planId) {
        $('#logPlanBox').removeClass('hidden');
        if (isStrEmptyOrUndefined(codeId) || !_planBillData[codeId]) {
            layer.msg('计划中不存在该货品编号或货品编号不存在');
            return;
        }
        $('#logPlanSelect').val(planId).trigger('change').trigger('select2:select', codeId);
    } else {
        myPromise({ opType: 800 }).then(result => {
            var ops = selectOp(result, 'Id', 'Code');
            $('#logBillSelect').append(`<option value="0">所有编号</option>${ops}`);
            if (codeId) {
                $('#logBillSelect').val(codeId).trigger('change');
                $('#billInfo').removeClass('hidden');
            }
            getLogList();
        });
    }
}

//日志数据
function getLogList() {
    var startTime = $('#logStartDate').val();
    var endTime = $('#logEndDate').val();
    if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
        return;
    }
    startTime += ' 00:00:00';
    endTime += ' 23:59:59';
    if (compareDate(startTime, endTime)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }
    var list = { startTime, endTime };
    if (_logType) {
        list.type = _logType;
        if (_logType == 2 && !$('#consumeModal').is(':hidden')) {
            list.purposeId = $('#planConsumeLi').attr('aria-expanded') == 'true' ? 1 : 2;
            if (!$('#logPlanBox').is(':hidden')) {
                var planId = $('#logPlanSelect').val();
                if (!isStrEmptyOrUndefined(planId) && planId != 0) {
                    list.planId = planId;
                }
            }
        }
    }
    var codeId = $('#logBillSelect').val();
    if (isStrEmptyOrUndefined(codeId)) {
        layer.msg('请选择货品编号');
        return;
    }
    if (codeId != 0) {
        list.billId = codeId;
        var d = _codeIdData[codeId];
        $('#logCategory').html(d.Category);
        $('#logName').html(d.Name);
        $('#logSupplier').html(d.Supplier);
        $('#logSpecification').html(d.Specification);
        $('#logPrice').html(d.Price);
        $('#billInfo').removeClass('hidden');
    } else {
        $('#billInfo').addClass('hidden');
    }
    var data = {};
    data.opType = 803;
    data.opData = JSON.stringify(list);
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        //状态 1 入库; 2 出库;
        var dType = d => d == 1 ? '<span class="text-success">入库</span>' : '<span class="text-danger">领用</span>';
        var number = d => d.Type == 1 ? `<span class="text-success">+${d.Number}</span>` : `<span class="text-danger">-${d.Number}</span>`;
        var update = d => `<span class="text-${d.Number > d.OldNumber ? 'success' : 'danger'}">${d.Number}</span>`;
        var col1 = [
            { data: null, title: '序号', render: (a, b, c, d) => ++d.row },
            { data: 'Time', title: '时间' }
        ];
        var col2 = [
            { data: 'Category', title: '类别' },
            { data: 'Name', title: '名称' },
            { data: 'Supplier', title: '供应商' },
            { data: 'Specification', title: '规格型号' },
            { data: 'Price', title: '单价' },
            { data: 'Site', title: '位置', bVisible: false },
            { data: 'Unit', title: '单位', bVisible: false }
        ];
        var columns = null, excelColumns = null;
        switch (_logType) {
            case 0:
                columns = [
                    ...col1,
                    { data: 'Code', title: '货品编号' },
                    { data: 'Type', title: '入/出', render: dType },
                    { data: 'Purpose', title: '来源/用途' },
                    ...col2,
                    { data: null, title: '数量', render: number },
                    { data: 'OldNumber', title: '旧值', bVisible: false },
                    { data: 'RelatedPerson', title: '相关人' },
                    { data: 'Manager', title: '物管员' }
                ];
                excelColumns = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
                break;
            case 1:
                columns = [
                    ...col1,
                    { data: 'Code', title: '货品编号' },
                    ...col2,
                    { data: null, title: '数量', render: number },
                    { data: 'OldNumber', title: '旧值', bVisible: false },
                    { data: 'Purpose', title: '货品来源' },
                    { data: 'RelatedPerson', title: '采购/退回人' },
                    { data: 'Manager', title: '物管员' },
                    { data: null, title: '', bVisible: false }
                ];
                excelColumns = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
                break;
            case 2:
                columns = [
                    ...col1,
                    { data: 'Purpose', title: '用途' },
                    { data: 'Code', title: '货品编号' },
                    ...col2,
                    { data: null, title: '数量', render: number },
                    { data: 'OldNumber', title: '旧值', bVisible: false },
                    { data: 'RelatedPerson', title: '领用人' },
                    { data: 'Manager', title: '物管员' },
                    { data: null, title: '', bVisible: false }
                ];
                excelColumns = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
                break;
            case 3:
                columns = [
                    ...col1,
                    { data: 'Code', title: '货品编号' },
                    ...col2,
                    { data: 'OldNumber', title: '修改前' },
                    { data: null, title: '修改后', render: update },
                    { data: 'Remark', title: '备注' },
                    { data: 'Manager', title: '物管员' },
                    { data: null, title: '', bVisible: false },
                    { data: null, title: '', bVisible: false }
                ];
                excelColumns = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
                break;
        }
        $('#logList').DataTable({
            dom: '<"pull-left"l><"pull-right"B><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            buttons: [{
                extend: 'excel',
                text: '导出Excel',
                className: 'btn-primary btn-sm',
                filename: `${$('#logTitle').text().trim()}_${getDate()}`,
                exportOptions: {
                    columns: excelColumns
                }
            }],
            destroy: true,
            paging: true,
            searching: true,
            language: oLanguage,
            data: ret.datas,
            aaSorting: [[0, "asc"]],
            aLengthMenu: [40, 80, 120],
            iDisplayLength: 40,
            columns: columns
        });
    });
    $('#logModal').modal('show');
}

/////////////////////////////////////////////////////////////////////////////////////////////
//详情
function showDetailModel(id) {
    if (id == 0) {
        return;
    }
    var data = {}
    data.opType = 800;
    data.opData = JSON.stringify({
        qId: id
    });
    ajaxPost("/Relay/Post", data, ret => {
        if (ret.errno == 0) {
            var d = ret.datas[0];
            $("#detailCode").text(d.Code);
            $("#detailCategory").text(d.Category);
            $("#detailName").text(d.Name);
            $("#detailSupplier").text(d.Supplier);
            $("#detailSpecification").text(d.Specification);
            $("#detailSite").text(d.Site);
            $("#detailImgList").empty();
            if (d.ImageList.length > 0) {
                data = {
                    type: fileEnum.Material,
                    files: d.Images
                };
                ajaxPost("/Upload/Path", data, ret => {
                    if (ret.errno != 0) {
                        layer.msg(ret.errmsg);
                        return;
                    }
                    var imgOp = '<div class="imgOption col-lg-2 col-md-3 col-sm-4 col-xs-6">' +
                        '<div class="thumbnail">' +
                        '<img src={0} style="height:200px">' +
                        '<div class="caption text-center">' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    var imgOps = "";
                    for (var i = 0; i < ret.data.length; i++) {
                        imgOps += imgOp.format(ret.data[i].path);
                    }
                    $("#detailImgList").append(imgOps);
                });
            }
            $('#showDetailModel').modal('show');
        } else {
            layer.msg(ret.errmsg);
        }
    });
}

//生成二维码弹窗
function createQrModal() {
    $('#qrCodeList').empty();
    var categoryFunc = new Promise(resolve => categorySelect(resolve));
    var nameFunc = new Promise(resolve => nameSelect(resolve, true, 'Qr'));
    var supplierFunc = new Promise(resolve => supplierSelect(resolve, true, 'Qr'));
    var specificationFunc = new Promise(resolve => specificationSelect(resolve, true, 'Qr'));
    var siteFunc = new Promise(resolve => siteSelect(resolve, true));
    Promise.all([categoryFunc, nameFunc, supplierFunc, specificationFunc, siteFunc])
        .then((result) => {
            $('#categoryQr').empty().append(result[0]);
            $('#nameQr').empty().append(result[1]);
            $('#supplierQr').empty().append(result[2]);
            $('#specificationQr').empty().append(result[3]);
            $('#siteQr').empty().append(result[4]);
        });
    $('#createQrModal').modal('show');
}

//生成二维码
function getQrList() {
    new Promise(function (resolve) {
        getMaterialList('Qr', resolve);
    }).then((result) => {
        var option = '<div class="printBox" style={6}><div style="width: 230px; height: 115px; border: 1px solid; display: flex;position:relative">' +
            '<div style="width: 50%; height: 100%">' +
            '<div class="createQrCode" style="margin: 4px"></div>' +
            '</div>' +
            '<span class="glyphicon glyphicon-remove delQrCode pointer" aria-hidden="true" style="position:absolute;right:3px;top:3px;font-size:20px;color:red"></span>' +
            '<div style="width: 50%; height: 100%; text-align: center;display:flex;flex-direction:column;justify-content:center;font-size:12px">' +
            '<span class="textOverTop">{0}</span>' +
            '<span class="textOverTop">{1}</span>' +
            '<span class="textOverTop">{2}</span>' +
            '<span class="textOverTop">{3}</span>' +
            '<span class="textOverTop">{4}</span>' +
            '<span class="textOverTop">{5}</span>' +
            '</div>' +
            '</div>' +
            '</div>';
        var i, len = result.length;
        var options = '';
        var codeData = [];
        var flag = 0;
        for (i = 0; i < len; i++) {
            flag++;
            if (flag == 24) {
                flag = 0;
            }
            var d = result[i];
            options += option.format(d.Code, d.Category, d.Name, d.Supplier, d.Specification, d.Site, flag ? 'float:left' : 'page-break-after:always');
            codeData.push(`${d.BillId},${d.Code}`);
        }
        $('#qrCodeList').empty().append(options);
        for (i = 0; i < len; i++) {
            new QRCode($('#qrCodeList .createQrCode')[i],
                {
                    text: codeData[i],
                    width: 105,
                    height: 105,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
        }
        $('#qrCodeList .createQrCode').prop('title', '');
    });
}