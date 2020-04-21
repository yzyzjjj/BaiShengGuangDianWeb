function pageReady() {
    $('.ms2').select2();

    var categoryFunc = new Promise(function (resolve, reject) {
        categorySelect(resolve);
    });
    var nameFunc = new Promise(function (resolve, reject) {
        nameSelect(resolve, true, 'Select');
    });
    var supplierFunc = new Promise(function (resolve, reject) {
        supplierSelect(resolve, true, 'Select');
    });
    var specificationFunc = new Promise(function (resolve, reject) {
        specificationSelect(resolve, true, 'Select');
    });
    var siteFunc = new Promise(function (resolve, reject) {
        siteSelect(resolve);
    });
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

    $('#logBillSelect').on('select2:select', function () {
        var id = $("#logBillSelect").val();
        if (id == 0) {
            $('#billInfo').addClass('hidden');
            $('#logCategory').html('');
            $('#logName').html('');
            $('#logSupplier').html('');
            $('#logSpecification').html('');
            $('#logPrice').html('');
        } else {
            var i, len = _materialList.length;
            for (i = 0; i < len; i++) {
                var d = _materialList[i];
                if (id == d.Id) {
                    $('#billInfo').removeClass('hidden');
                    $('#logCategory').html(d.Category);
                    $('#logName').html(d.Name);
                    $('#logSupplier').html(d.Supplier);
                    $('#logSpecification').html(d.Specification);
                    $('#logPrice').html(d.Price);
                }
            }
        }

        getLogList();
    });

    $("#logStartDate").val(getDate());
    $("#logEndDate").val(getDate());
    $("#logStartDate").datepicker('update').on('changeDate', function (ev) {
        getLogList();
    });

    $("#logEndDate").datepicker('update').on('changeDate', function (ev) {
        getLogList();
    });

    $('#consumePlanSelect').on('select2:select', function () {
        resetConsumePlanList();
        $("#consumePlanCondition").val('');
        var planId = $(this).val();
        if (_consumePlan.length > 0) {
            var i, len = _consumePlan.length;
            for (i = 0; i < len; i++) {
                var d = _consumePlan[i];
                if (planId == d.Id) {
                    if (!isStrEmptyOrUndefined(d.Remark)) {
                        $('#consumePlanRemarkDiv').removeClass('hidden');
                        $('#consumePlanRemark').html(d.Remark);
                    } else {
                        $('#consumePlanRemarkDiv').addClass('hidden');
                        $('#consumePlanRemark').html('');
                    }
                    break;
                }
            }
            getPlanBill(true);
        }
        consumePlanActual();
    });

    $("#logConsumeStartDate").val(getDate());
    $("#logConsumeEndDate").val(getDate());
    $("#logConsumeStartDate").datepicker('update').on('changeDate', function (ev) {
        getLogConsumeList();
    });

    $("#logConsumeEndDate").datepicker('update').on('changeDate', function (ev) {
        getLogConsumeList();
    });

    $('#logConsumePlanSelect').on('select2:select', function () {
        $('#logConsumeBillSelect').empty();
        var list = {};
        var planId = $('#logConsumePlanSelect').val();
        list.planId = planId;
        list.stock = true;

        var data = {}
        data.opType = 704;
        data.opData = JSON.stringify(list);

        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            _logConsumePlanBill = ret.datas;
            var option = '<option value = "{0}">{1}</option>';

            var options = '';
            for (var i = 0; i < _logConsumePlanBill.length; i++) {
                var d = _logConsumePlanBill[i];
                options += option.format(d.BillId, d.Code);
            }

            $('#logConsumeBillSelect').append(option.format(0, '所有编号'));
            $('#logConsumeBillSelect').append(options);
            getLogConsumeList(false);
        });
    });

    $('#logConsumeBillSelect').on('select2:select', function () {
        $('#billInfoConsume').addClass('hidden');
        var id = $(this).val();
        for (var i = 0; i < _logConsumePlanBill.length; i++) {
            var d = _logConsumePlanBill[i];
            if (id == d.BillId) {
                $('#billInfoConsume').removeClass('hidden');
                $('#logConsumeCategory').html(d.Category);
                $('#logConsumeName').html(d.Name);
                $('#logConsumeSupplier').html(d.Supplier);
                $('#logConsumeSpecification').html(d.Specification);
                $('#logConsumePrice').html(d.Price);
            }
        }
        getLogConsumeList(false);
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
    $('#increaseList,#consumePlanList,#consumeOtherList').on('click', '.scanPrint', function () {
        new Promise(function (resolve) {
            showPrintModal(resolve);
        }).then((result) => {
            if (result) {
                var codeId = result.split(',')[0];
                $(this).next().val(codeId).trigger('change').trigger('select2:select');
            }
        });
    });
    $('#increaseList').on('change', '.source', function () {
        var v = $(this).val();
        var tr = $(this).parents('tr');
        var codeEl = tr.find('.code');
        var stockNumEl = tr.find('.stockNum');
        if (v == '计划退回') {
            $(this).next().removeClass('hidden');
            var planId = tr.find('.planList').val();
            new Promise(function (resolve) {
                planSend(resolve, planId);
            }).then(function (e) {
                codeEl.empty();
                codeEl.append(e);
                var codeId = codeEl.val();
                codeEl.val(codeId).trigger('change').trigger('select2:select');
                var actual = codeEl.find(`option[value=${codeId}]`).attr('actual');
                stockNumEl.prop('placeholder', `货品领用数量：${actual}`);
            });
        } else {
            $(this).next().addClass('hidden');
            var i, len = _materialList.length;
            var option = '<option value = "{0}">{1}</option>';
            var options = '';
            for (i = 0; i < len; i++) {
                var d = _materialList[i];
                options += option.format(d.Id, d.Code);
            }
            codeEl.empty();
            codeEl.append(options);
            codeEl.val(codeEl.val()).trigger('change').trigger('select2:select');
            stockNumEl.prop('placeholder', '');
        }
    });
    $('#increaseList').on('change', '.planList', function () {
        var planId = $(this).val();
        var tr = $(this).parents('tr');
        new Promise(function (resolve) {
            planSend(resolve, planId);
        }).then(function (e) {
            var codeEl = tr.find('.code');
            codeEl.empty();
            codeEl.append(e);
            var codeId = codeEl.val();
            codeEl.val(codeId).trigger('change').trigger('select2:select');
            var actual = codeEl.find(`option[value=${codeId}]`).attr('actual');
            tr.find('.stockNum').prop('placeholder', `货品领用数量：${actual}`);
        });
    });
    $('#increaseList').on('focusin', '.stockNum', function () {
        var v = $(this).val();
        if (v == 0) {
            $(this).val("");
        }
    });
    $('#increaseList').on('focusout', '.stockNum', function () {
        var v = $(this).val();
        if (isStrEmptyOrUndefined(v)) {
            $(this).val("0");
        }
    });
    $('#increaseList').on('input', '.stockNum', function () {
        var v = $(this).val();
        var tr = $(this).parents('tr');
        var codeEl = tr.find('.code');
        var codeId = codeEl.val();
        var actual = codeEl.find(`option[value=${codeId}]`).attr('actual');
        if (!!actual && parseFloat(v) > parseFloat(actual)) {
            layer.msg('入库数量大于货品领用数量');
        }
    });
    if (!pcAndroid()) {
        $(".icon-saoyisao").addClass('hidden');
    }
    $('#increaseAdd').on('click', function () {
        new Promise(function (resolve) {
            showPrintModal(resolve);
        }).then((result) => {
            if (result) {
                addIncreaseList();
                var codeId = result.split(',')[0];
                $('#increaseList tr:last').find('.code').val(codeId).trigger('change').trigger('select2:select');
            }
        });
    });
    $('#planConsumeAdd').on('click', function () {
        new Promise(function (resolve) {
            showPrintModal(resolve);
        }).then((result) => {
            if (result) {
                addConsumePlanList();
                var codeId = result.split(',')[0];
                $('#consumePlanList tr:last').find('.code').val(codeId).trigger('change').trigger('select2:select');
            }
        });
    });
    $('#otherConsumeAdd').on('click', function () {
        new Promise(function (resolve) {
            showPrintModal(resolve);
        }).then((result) => {
            if (result) {
                addConsumeOtherList();
                var codeId = result.split(',')[0];
                $('#consumeOtherList tr:last').find('.code').val(codeId).trigger('change').trigger('select2:select');
            }
        });
    });
    $('#addReversalListBtn').on('click', function () {
        $('#reversalList').append(_reversalTr);
        $('#reversalList tr:last .ms2').select2();
        setReversalList();
        var codeEl = $('#reversalList tr:last .code');
        var codeId = codeEl.val();
        codeEl.val(codeId).trigger('select2:select');
        $('#reversalTable').scrollTop($('#reversalTable')[0].scrollHeight);
        if (!pcAndroid()) {
            $("#reversalList").find('.scanPrint').addClass('hidden');
        }
    });
    $('#reversalList').on('click', '.delPlanTr', function () {
        var tr = $(this).parents('tr');
        tr.remove();
        setReversalList();
    });

    var categoryId, nameId, supplierId, specificationId, siteId;
    $('#reversalList').on('select2:select', '.code', function () {
        categoryId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
        var id = $(this).val();
        var tr = $(this).parents('tr');
        tr.find('.number').text('0');
        var i, d, len = _materialList.length;
        for (i = 0; i < len; i++) {
            d = _materialList[i];
            if (id == d.Id) {
                categoryId = d.CategoryId;
                nameId = d.NameId;
                supplierId = d.SupplierId;
                specificationId = d.SpecificationId;
                siteId = d.SiteId;
                tr.find('.number').text(d.Number);
                tr.find('.category').val(categoryId).trigger("change");
                ////货品名称
                updateConsumeSelect(tr.find('.name')[0], nameId, _consumeName, "Name", "CategoryId", categoryId);
                ////供应商
                updateConsumeSelect(tr.find('.supplier')[0], supplierId, _consumeSupplier, "Supplier", "NameId", nameId);
                ////规格型号
                updateConsumeSelect(tr.find('.specification')[0], specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);
                var consumeSiteArray = new Array();
                for (i = 0; i < _materialList.length; i++) {
                    d = _materialList[i];
                    if (d.SpecificationId == specificationId) {
                        if (_consumeSiteDict[d.SiteId])
                            consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                    }
                }
                if (consumeSiteArray.length > 0)
                    siteId = consumeSiteArray[0].Id;
                updateConsumeSelect(tr.find('.site')[0], siteId, consumeSiteArray, "Site");
                break;
            }
        }
    });
    $('#reversalList').on('select2:select', '.category', function () {
        categoryId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
        categoryId = $(this).val();
        var tr = $(this).parents('tr');
        siteId = tr.find('.site').val();
        tr.find('.number').text('0');
        ////货品名称
        var i, d;
        for (i = 0; i < _consumeName.length; i++) {
            d = _consumeName[i];
            if (d.CategoryId == categoryId) {
                nameId = d.Id;
                break;
            }
        }
        updateConsumeSelect(tr.find('.name')[0], nameId, _consumeName, "Name", "CategoryId", categoryId);
        ////供应商
        for (i = 0; i < _consumeSupplier.length; i++) {
            d = _consumeSupplier[i];
            if (d.NameId == nameId) {
                supplierId = d.Id;
                break;
            }
        }
        updateConsumeSelect(tr.find('.supplier')[0], supplierId, _consumeSupplier, "Supplier", "NameId", nameId);
        ////规格型号
        for (i = 0; i < _consumeSpecification.length; i++) {
            d = _consumeSpecification[i];
            if (d.SupplierId == supplierId) {
                specificationId = d.Id;
                break;
            }
        }
        updateConsumeSelect(tr.find('.specification')[0], specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);
        var consumeSiteArray = new Array();
        for (i = 0; i < _materialList.length; i++) {
            d = _materialList[i];
            if (d.SpecificationId == specificationId) {
                if (_consumeSiteDict[d.SiteId])
                    consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
            }
        }
        if (consumeSiteArray.length > 0)
            siteId = consumeSiteArray[0].Id;
        updateConsumeSelect(tr.find('.site')[0], siteId, consumeSiteArray, "Site");

        tr.find('.code').val(0).trigger("change");
        for (i = 0; i < _materialList.length; i++) {
            d = _materialList[i];
            if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                tr.find('.code').val(d.BillId).trigger("change");
                tr.find('.number').text(d.Number);
                break;
            }
        }
    });
    $('#reversalList').on('select2:select', '.name', function () {
        nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
        nameId = $(this).val();
        var tr = $(this).parents('tr');
        siteId = tr.find('.site').val();
        tr.find('.number').text('0');
        //供应商
        var i, d;
        for (i = 0; i < _consumeSupplier.length; i++) {
            d = _consumeSupplier[i];
            if (d.NameId == nameId) {
                supplierId = d.Id;
                break;
            }
        }
        updateConsumeSelect(tr.find('.supplier')[0], supplierId, _consumeSupplier, "Supplier", "NameId", nameId);
        ////规格型号
        for (i = 0; i < _consumeSpecification.length; i++) {
            d = _consumeSpecification[i];
            if (d.SupplierId == supplierId) {
                specificationId = d.Id;
                break;
            }
        }
        updateConsumeSelect(tr.find('.specification')[0], specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);
        var consumeSiteArray = new Array();
        for (i = 0; i < _materialList.length; i++) {
            d = _materialList[i];
            if (d.SpecificationId == specificationId) {
                if (_consumeSiteDict[d.SiteId])
                    consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
            }
        }
        if (consumeSiteArray.length > 0)
            siteId = consumeSiteArray[0].Id;
        updateConsumeSelect(tr.find('.site')[0], siteId, consumeSiteArray, "Site");
        tr.find('.code').val(0).trigger("change");
        for (i = 0; i < _materialList.length; i++) {
            d = _materialList[i];
            if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                tr.find('.code').val(d.BillId).trigger("change");
                tr.find('.number').text(d.Number);
                break;
            }
        }
    });
    $('#reversalList').on('select2:select', '.supplier', function () {
        supplierId = 0, specificationId = 0, siteId = 0;
        supplierId = $(this).val();
        var tr = $(this).parents('tr');
        siteId = tr.find('.site').val();
        tr.find('.number').text('0');
        ////规格型号
        var i, d;
        for (i = 0; i < _consumeSpecification.length; i++) {
            d = _consumeSpecification[i];
            if (d.SupplierId == supplierId) {
                specificationId = d.Id;
                break;
            }
        }
        updateConsumeSelect(tr.find('.specification')[0], specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);
        var consumeSiteArray = new Array();
        for (i = 0; i < _materialList.length; i++) {
            d = _materialList[i];
            if (d.SpecificationId == specificationId) {
                if (_consumeSiteDict[d.SiteId])
                    consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
            }
        }
        if (consumeSiteArray.length > 0)
            siteId = consumeSiteArray[0].Id;
        updateConsumeSelect(tr.find('.site')[0], siteId, consumeSiteArray, "Site");
        tr.find('.code').val(0).trigger("change");
        for (i = 0; i < _materialList.length; i++) {
            d = _materialList[i];
            if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                tr.find('.code').val(d.BillId).trigger("change");
                tr.find('.number').text(d.Number);
                break;
            }
        }
    });
    $('#reversalList').on('select2:select', '.specification', function () {
        specificationId = 0, siteId = 0;
        specificationId = $(this).val();
        var tr = $(this).parents('tr');
        tr.find('.number').text('0');
        var i, d;
        var consumeSiteArray = new Array();
        for (i = 0; i < _materialList.length; i++) {
            d = _materialList[i];
            if (d.SpecificationId == specificationId) {
                if (_consumeSiteDict[d.SiteId])
                    consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
            }
        }
        if (consumeSiteArray.length > 0)
            siteId = consumeSiteArray[0].Id;
        updateConsumeSelect(tr.find('.site')[0], siteId, consumeSiteArray, "Site");
        tr.find('.code').val(0).trigger("change");
        for (i = 0; i < _materialList.length; i++) {
            d = _materialList[i];
            if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                tr.find('.code').val(d.BillId).trigger("change");
                tr.find('.number').text(d.Number);
                break;
            }
        }
    });
    $('#reversalList').on('select2:select', '.site', function () {
        specificationId = 0, siteId = 0;
        siteId = $(this).val();
        var tr = $(this).parents('tr');
        specificationId = tr.find('.specification').val();
        tr.find('.number').text('0');
        tr.find('.code').val(0).trigger("change");
        for (var i = 0; i < _materialList.length; i++) {
            var d = _materialList[i];
            if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                tr.find('.code').val(d.BillId).trigger("change");
                tr.find('.number').text(d.Number);
                break;
            }
        }
    });
    $('#reversalList').on('change', '.code', function () {
        var v = $(this).val();
        if (v != null) {
            var tr = $(this).parents('tr');
            tr.find('.codeModal').attr('onclick', `showDetailModel(${v})`);
            tr.find('.codeLogModal').attr('onclick', `showLogModel(3,${v})`);
        }
    });
    $('#reversalList').on('click', '.loadNumber', function () {
        var tr = $(this).parents('tr');
        var codeId = tr.find('.code').val();
        var numberEl = tr.find('.number');
        var data = {}
        data.opType = 800;
        data.opData = JSON.stringify({
            qId: codeId
        });
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            numberEl.text(ret.datas[0].Number);
        });
    });
    $('#reversalList').on('focusin', '.upNumber', function () {
        var v = $(this).val();
        if (v == 0) {
            $(this).val("");
        }
    });
    $('#reversalList').on('focusout', '.upNumber', function () {
        var v = $(this).val();
        if (isStrEmptyOrUndefined(v)) {
            $(this).val("0");
        }
    });
    $('#reversalAdd').on('click', function () {
        new Promise(function (resolve) {
            showPrintModal(resolve);
        }).then((result) => {
            if (result) {
                $('#addReversalListBtn').trigger('click');
                var codeId = result.split(',')[0];
                $('#reversalList tr:last').find('.code').val(codeId).trigger('change').trigger('select2:select');
            }
        });
    });
    $('#reversalList').on('click', '.scanPrint', function () {
        new Promise(function (resolve) {
            showPrintModal(resolve);
        }).then((result) => {
            if (result) {
                var codeId = result.split(',')[0];
                $(this).next().find('.code').val(codeId).trigger('change').trigger('select2:select');
            }
        });
    });
    $('.maxHeight').css('maxHeight', innerHeight * 0.7);
}
//冲正相关
function setReversalList() {
    var trEl = $('#reversalList tr');
    var i = 0, len = trEl.length;
    for (; i < len; i++) {
        var d = trEl.eq(i);
        d.find('.num').text(i + 1);
    }
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
    var opType = 824;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
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
    data.opType = opType;
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
    var opType = 831;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
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
    data.opType = opType;
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
    var opType = 839;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
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
    data.opType = opType;
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
    var opType = 800;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
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
    data.opType = opType;
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
        _materialList = ret.datas;
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
        var log = function (data) {
            return `<button type="button" class="btn btn-success btn-sm" onclick="showLogModel(1, ${data.Id})">入库</button>` +
                `<button type="button" class="btn btn-success btn-sm" onclick="showLogModel(2, ${data.Id})">领用</button>`;
        }
        var o = 0;
        var order = function (data, type, row) {
            return ++o;
        }
        $("#materialList")
            .DataTable({
                dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": oLanguage,
                "data": ret.datas,
                "aaSorting": [[0, "asc"]],
                "aLengthMenu": [50, 100, 150, 200], //更改显示记录数选项  
                "iDisplayLength": 50, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Code", "title": "货品编号" },
                    { "data": "Category", "title": "类别" },
                    { "data": "Name", "title": "名称" },
                    { "data": null, "title": "库存数量", "render": number },
                    { "data": "Supplier", "title": "供应商" },
                    { "data": "Specification", "title": "规格" },
                    { "data": "Site", "title": "位置" },
                    { "data": "Unit", "title": "单位" },
                    { "data": "Id", "title": "详情", "render": detail },
                    { "data": "Price", "title": "价格" },
                    { "data": "Stock", "title": "最低库存", "sClass": "text-blue" },
                    { "data": "InTime", "title": "上次入库", "render": inTime },
                    { "data": "OutTime", "title": "上次领用", "render": outTime },
                    { "data": "Remark", "title": "备注", "render": remark },
                    { "data": null, "title": "日志", "render": log }
                ]
            });
    });
}

/////////////////////////////////////////////日志/////////////////////////////////////////////
var _type = 0;
//日志  1 入库; 2 出库;
function showLogModel(type = 0, id = 0) {
    $("#logStartDate").val(getDate());
    $("#logEndDate").val(getDate());
    if (_type != type) {
        $("#logStartDate").val(getDate());
        $("#logEndDate").val(getDate());
    }
    _type = type;
    var opType = 803;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var title = "";
    switch (type) {
        case 0:
            title = "操作日志";
            break;
        case 1:
            title = "入库日志";
            break;
        case 2:
            title = "领用日志";
            break;
        case 3:
            title = "冲正日志";
            break;
    }
    $("#logModal").find("h4").html(title);
    $('#billInfo').addClass('hidden');

    $('#logBillSelect').empty();
    var i, len = _materialList.length;
    var option = '<option value = "{0}">{1}</option>';
    var options = '';
    for (i = 0; i < len; i++) {
        var d = _materialList[i];
        options += option.format(d.Id, d.Code);
        if (id == d.Id) {
            $('#billInfo').removeClass('hidden');
            $('#logCategory').html(d.Category);
            $('#logName').html(d.Name);
            $('#logSupplier').html(d.Supplier);
            $('#logSpecification').html(d.Specification);
            $('#logPrice').html(d.Price);
        }
    }
    $('#logBillSelect').append(option.format(0, '所有编号'));
    $('#logBillSelect').append(options);
    $("#logBillSelect").val(id).trigger("change");
    getLogList(true);
}

//日志
function getLogList(show = false) {
    $("#logList").empty();
    var opType = 803;
    var list = {}

    var startTime = $("#logStartDate").val();
    var endTime = $("#logEndDate").val();
    if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
        return;
    }

    startTime += " 00:00:00";
    endTime += " 23:59:59";
    if (exceedTime(startTime)) {
        layer.msg("开始时间不能大于当前时间");
        return;
    }
    if (compareDate(startTime, endTime)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }
    var billId = $('#logBillSelect').val();
    if (isStrEmptyOrUndefined(billId)) {
        layer.msg('请选择货品编号');
        return;
    }
    if (billId != 0) {
        list.billId = billId;
    }
    list["startTime"] = startTime;
    list["endTime"] = endTime;

    if (_type != 0) {
        list.type = _type;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var dType = function (data, type, row) {
                //状态 1 入库; 2 出库;
                return data == 1 ? '<span class="text-success">入库</span>' : '<span class="text-danger">领用</span>';
            }
            var number = function (data, type, row) {
                //状态 1 入库; 2 出库;
                return data.Type == 1 ? `<span class="text-success">${data.Number}</span>` : `<span class="text-danger">${data.Number}</span>`;
            }
            var update = function (data) {
                return data.Number > data.OldNumber ? `<span class="text-success">${data.Number}</span>` : `<span class="text-danger">${data.Number}</span>`;
            }
            var columns = null;
            switch (_type) {
                case 0:
                    columns = [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "Time", "title": "时间" },
                        { "data": "Code", "title": "货品编号" },
                        { "data": "Name", "title": "货品名称" },
                        { "data": "Specification", "title": "规格型号" },
                        { "data": "Type", "title": "入/出", "render": dType },
                        { "data": null, "title": "数量", "render": number },
                        { "data": "Price", "title": "单价"},
                        { "data": "Purpose", "title": "来源/用途" },
                        { "data": "RelatedPerson", "title": "相关人" },
                        { "data": "Manager", "title": "物管员" }
                    ];
                    break;
                case 1:
                    columns = [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "Time", "title": "时间" },
                        { "data": "Code", "title": "货品编号" },
                        { "data": "Name", "title": "货品名称" },
                        { "data": "Specification", "title": "规格型号" },
                        { "data": null, "title": "数量", "render": number },
                        { "data": "Price", "title": "单价" },
                        { "data": "Purpose", "title": "货品来源" },
                        { "data": "RelatedPerson", "title": "采购/退回人" },
                        { "data": "Manager", "title": "物管员" },
                        { "data": null, "title": "Id", "bVisible": false }
                    ];
                    break;
                case 2:
                    columns = [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "Time", "title": "时间" },
                        { "data": "Code", "title": "货品编号" },
                        { "data": "Name", "title": "货品名称" },
                        { "data": "Specification", "title": "规格型号" },
                        { "data": null, "title": "数量", "render": number },
                        { "data": "Price", "title": "单价" },
                        { "data": "Purpose", "title": "货品用途" },
                        { "data": "RelatedPerson", "title": "领用人" },
                        { "data": "Manager", "title": "物管员" },
                        { "data": null, "title": "Id", "bVisible": false }
                    ];
                    break;
                case 3:
                    columns = [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "Time", "title": "时间" },
                        { "data": "Code", "title": "货品编号" },
                        { "data": "Name", "title": "货品名称" },
                        { "data": "Specification", "title": "规格型号" },
                        { "data": "OldNumber", "title": "修改前" },
                        { "data": null, "title": "修改后", "render": update },
                        { "data": "Purpose", "title": "备注" },
                        { "data": "Manager", "title": "物管员" },
                        { "data": null, "title": "Id", "bVisible": false }
                    ];
                    break;
            }
            var excelColumns = [0, 1, 2, 3, 4, 5, 6, 7, 8];
            var titleColumns = [6,7];
            $("#logList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"B><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    buttons: [
                        {
                            extend: 'excel',
                            text: '导出Excel',
                            className: 'btn-primary btn-sm', //按钮的class样式
                            exportOptions: {
                                columns: excelColumns,
                                format: {
                                    // format有三个子标签，header，body和foot
                                    body: function (data, row, column, node) {
                                        //操作需要导出excel的数据格式                        
                                        if (titleColumns.indexOf(column) > -1) {
                                            var a = $(node).find("span").attr("title");
                                            if (a != null) {
                                                return "\u200C" + unescape(a);
                                            }
                                        }
                                        return "\u200C" + node.textContent;
                                    }
                                }
                            }
                        }
                    ],
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [40, 80, 120], //更改显示记录数选项  
                    "iDisplayLength": 40, //默认显示的记录数
                    "columns": columns
                });
            if (show) {
                $("#logModal").modal("show");
            }
        });
}
/////////////////////////////////////////////领用界面 内嵌日志/////////////////////////////////////////////
var _purposeConsume = 0;
//日志 purpose 1 计划 2 其他;
function showLogConsumeModel(id, purpose, planId = 0) {
    $("#logConsumeStartDate").val(getDate());
    $("#logConsumeEndDate").val(getDate());
    if (purpose == 1) {
        $('#logConsumePlanSelectDiv').removeClass('hidden');
    } else {
        $('#logConsumePlanSelectDiv').addClass('hidden');
    }

    if (_purposeConsume != purpose) {
        $("#logConsumeStartDate").val(getDate());
        $("#logConsumeEndDate").val(getDate());
    }
    _purposeConsume = purpose;
    var opType = 803;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var title = "领用日志";
    $("#logConsumeModal").find("h4").html(title);
    $('#billInfoConsume').addClass('hidden');
    $('#logConsumePlanSelect').empty();
    $('#logConsumeBillSelect').empty();

    var option = '<option value = "{0}">{1}</option>';
    var options;
    if (purpose == 1) {
        _logConsumePlanBill = _consumePlanBill;
        options = '';
        for (var i = 0; i < _consumePlan.length; i++) {
            var d = _consumePlan[i];
            options += option.format(d.Id, d.Plan);
        }
        $('#logConsumePlanSelect').append(options);
        $("#logConsumePlanSelect").val(planId).trigger("change");

        options = '';
        for (var i = 0; i < _consumePlanBill.length; i++) {
            var d = _consumePlanBill[i];
            options += option.format(d.BillId, d.Code);
            if (id == d.BillId) {
                $('#billInfoConsume').removeClass('hidden');
                $('#logConsumeCategory').html(d.Category);
                $('#logConsumeName').html(d.Name);
                $('#logConsumeSupplier').html(d.Supplier);
                $('#logConsumeSpecification').html(d.Specification);
                $('#logConsumePrice').html(d.Price);
            }
        }
    }
    else if (purpose == 2) {
        _logConsumePlanBill = _materialList;
        options = '';
        for (var i = 0; i < _materialList.length; i++) {
            var d = _materialList[i];
            options += option.format(d.BillId, d.Code);
            if (id == d.BillId) {
                $('#billInfoConsume').removeClass('hidden');
                $('#logConsumeCategory').html(d.Category);
                $('#logConsumeName').html(d.Name);
                $('#logConsumeSupplier').html(d.Supplier);
                $('#logConsumeSpecification').html(d.Specification);
                $('#logConsumePrice').html(d.Price);
            }
        }
    }
    $('#logConsumeBillSelect').append(option.format(0, '所有编号'));
    $('#logConsumeBillSelect').append(options);
    $("#logConsumeBillSelect").val(id).trigger("change");
    getLogConsumeList(true);
}

//日志
function getLogConsumeList(show = false) {
    $("#logConsumeList").empty();
    var opType = 803;
    var list = {}

    var startTime = $("#logConsumeStartDate").val();
    var endTime = $("#logConsumeEndDate").val();
    if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
        return;
    }

    startTime += " 00:00:00";
    endTime += " 23:59:59";
    if (exceedTime(startTime)) {
        layer.msg("开始时间不能大于当前时间");
        return;
    }
    if (compareDate(startTime, endTime)) {
        layer.msg("结束时间不能小于开始时间");
        return;
    }
    var planId = $('#logConsumePlanSelect').val();
    if (!$('#logConsumePlanSelectDiv').is(":hidden")) {
        if (isStrEmptyOrUndefined(planId)) {
            layer.msg('请选择计划号');
            return;
        }
        if (planId != 0) {
            list.planId = planId;
        }
    }
    var billId = $('#logConsumeBillSelect').val();
    if (isStrEmptyOrUndefined(billId)) {
        layer.msg('计划中不存在该货品编号或货品编号不存在');
        return;
    }
    if (billId != 0) {
        list.billId = billId;
    }
    list["startTime"] = startTime;
    list["endTime"] = endTime;
    list.type = 2;
    list.purposeId = _purposeConsume;

    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }

            var columns = null;
            if (_purposeConsume == 1) {
                columns = [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Time", "title": "时间" },
                    { "data": "Purpose", "title": "计划号" },
                    { "data": "Code", "title": "货品编号" },
                    { "data": "Name", "title": "货品名称" },
                    { "data": "Specification", "title": "规格型号" },
                    { "data": "Number", "title": "数量" },
                    { "data": "RelatedPerson", "title": "领用人" },
                    { "data": "Manager", "title": "物管员" }
                ];
            } else {
                columns = [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Time", "title": "时间" },
                    { "data": "Purpose", "title": "用途" },
                    { "data": "Code", "title": "货品编号" },
                    { "data": "Name", "title": "货品名称" },
                    { "data": "Specification", "title": "规格型号" },
                    { "data": "Number", "title": "数量" },
                    { "data": "RelatedPerson", "title": "领用人" },
                    { "data": "Manager", "title": "物管员" }
                ];
            }

            $("#logConsumeList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [40, 80, 120], //更改显示记录数选项  
                    "iDisplayLength": 40, //默认显示的记录数
                    "columns": columns
                });

            if (show) {
                $("#logConsumeModal").modal("show");
            }
        });
}

/////////////////////////////////////////////入库/////////////////////////////////////////////
//入库弹窗
function showIncreaseModel() {
    var opType = 801;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    resetIncreaseList();

    var planListFunc = new Promise(function (resolve, reject) {
        var data = {}
        data.opType = 700;
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            _consumePlan = ret.datas;
            resolve('success');
        }, 0);
    });

    var materialListFunc = new Promise(function (resolve, reject) {
        var data = {}
        data.opType = 800;
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            _materialList = ret.datas;
            resolve('success');
        }, 0);
    });

    var categoryFunc = new Promise(function (resolve, reject) {
        var data = {}
        data.opType = 816;
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            _consumeCategory = ret.datas;
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

            _consumeName = ret.datas;
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

            _consumeSupplier = ret.datas;
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

            _consumeSpecification = ret.datas;
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

            _consumeSite = ret.datas;
            _consumeSiteDict = new Array();
            for (var i = 0; i < _consumeSite.length; i++) {
                _consumeSiteDict[_consumeSite[i].Id] = _consumeSite[i];
            }
            resolve('success');
        }, 0);
    });

    Promise.all([planListFunc, materialListFunc, categoryFunc, nameFunc, supplierFunc, specificationFunc, siteFunc])
        .then((result) => {
            //console.log(result);
            $("#addIncreaseListBtn").removeAttr("disabled");
        });
    $("#increaseModal").modal("show");
}

var increaseMax = 0;
var increaseMaxV = 0;

//入库重置
function resetIncreaseList() {
    $("#increaseList").empty();
    increaseMax = increaseMaxV = 0;
}

//入库添加一行
function addIncreaseList() {
    //increaseList
    increaseMax++;
    increaseMaxV++;
    var tr =
        (`<tr id="in{0}" value="{0}" xh="{1}">
            <td style="vertical-align: inherit;" id="inXh{0}">{1}</td>
            <td>
                <div class="flexStyle" style="justify-content:center">
                    <select class="form-control source" id="inLy{0}" style="width:110px">
                        <option>采购</option>
                        <option>退回</option>
                        <option>计划退回</option>
                    </select>
                    <div class="hidden" style="width:110px"><select class="ms2 form-control planList"></select></div>
                </div>
            </td>
            <td>
                <span class="iconfont icon-saoyisao scanPrint" style="font-size:30px;cursor:pointer;vertical-align:middle"></span>
                <select class="ms2 form-control code" id="inBh{0}"></select>
            </td>
            <td><select class="ms2 form-control" id="inLb{0}"></select></td>
            <td><select class="ms2 form-control" id="inMc{0}"></select></td>
            <td><select class="ms2 form-control" id="inGys{0}"></select></td>
            <td><select class="ms2 form-control" id="inGg{0}"></select></td>
            <td><select class="ms2 form-control" id="inWz{0}"></select></td>

            <td style="vertical-align: inherit;"><label class="control-label" id="inDw{0}"></label></td>
            <td style="vertical-align: inherit;"><label class="control-label" id="inJg{0}"></label></td>
            <td style="vertical-align: inherit;"><label class="control-label" id="inKc{0}"></label></td>
            <td><button class="btn btn-info btn-sm" type="button" id="inDetail{0}" onclick="showDetailModel({0})">详情</button></td>
            <td><input class="form-control text-center stockNum" type="tel" id="inRk{0}" value="0" onkeyup="onInput(this, 8, 1)" onblur="onInputEnd(this)" maxlength="10" style="width:140px;margin:auto"></td>
            <td>
               <div style="display:flex;width:160px">
                   <input class="form-control text-center" id="inCg{0}" maxlength="64" />
                   <button class="btn btn-primary btn-sm pull-right" type="button" id="inDitto{0}" onclick="inDitto({0})" style="margin-left:3px">同上</button>
               </div>
            </td>
            <td><button type="button" class="btn btn-danger btn-sm" onclick="delIncreaseList({0})"><i class="fa fa-minus"></i></button></td>
        </tr>`).format(increaseMax, increaseMaxV);
    $("#increaseList").append(tr);
    if (!pcAndroid()) {
        $("#increaseList").find('.scanPrint').addClass('hidden');
    }
    var xh = increaseMax;
    if (_materialList != null) {
        var option = '<option value="{0}">{1}</option>';
        ////货品编号
        //var _materialList = [];
        var ops = '';
        var planListEl = $('#increaseList .planList').eq(increaseMaxV - 1);
        for (var i = 0, len = _consumePlan.length; i < len; i++) {
            var d = _consumePlan[i];
            ops += option.format(d.Id, d.Plan);
        }
        planListEl.empty();
        planListEl.append(ops);
        var selector = "#inBh" + xh;
        $(selector).empty();
        var billId = 0, categoryId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
        for (var i = 0; i < _materialList.length; i++) {
            var d = _materialList[i];
            $(selector).append(option.format(d.Id, d.Code));
            if (i == 0) {
                billId = d.BillId;
                categoryId = d.CategoryId;
                nameId = d.NameId;
                supplierId = d.SupplierId;
                specificationId = d.SpecificationId;
                $("#inDw" + xh).html(d.Unit);
                $("#inJg" + increaseMax).html(d.Price);
                $("#inKc" + increaseMax).html(d.Number);
                $("#inRk" + increaseMax).val(0);
            }
        }
        $(selector).on('select2:select', function () {
            var billId = 0, categoryId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
            var id = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            var i, len = _materialList.length;
            $("#inDw" + xh).html('');
            $("#inJg" + xh).html(0);
            $("#inKc" + xh).html(0);
            for (i = 0; i < len; i++) {
                var d = _materialList[i];
                if (id == d.Id) {
                    billId = d.BillId;
                    categoryId = d.CategoryId;
                    nameId = d.NameId;
                    supplierId = d.SupplierId;
                    specificationId = d.SpecificationId;
                    siteId = d.SiteId;
                    $("#inWz" + xh).val(siteId).trigger("change");
                    $("#inLb" + xh).val(categoryId).trigger("change");
                    $("#inDw" + xh).html(d.Unit);
                    $("#inJg" + xh).html(d.Price);
                    $("#inKc" + xh).html(d.Number);

                    ////货品名称
                    //var _consumeName = [];
                    selector = "#inMc" + xh;
                    updateConsumeSelect(selector, nameId, _consumeName, "Name", "CategoryId", categoryId);

                    ////供应商
                    //var _consumeSupplier = [];
                    selector = "#inGys" + xh;
                    updateConsumeSelect(selector, supplierId, _consumeSupplier, "Supplier", "NameId", nameId);

                    ////规格型号
                    //var _consumeSpecification = [];
                    selector = "#inGg" + xh;
                    updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);

                    var consumeSiteArray = new Array();
                    for (var i = 0; i < _materialList.length; i++) {
                        var d = _materialList[i];
                        if (d.SpecificationId == specificationId) {
                            if (_consumeSiteDict[d.SiteId])
                                consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                        }
                    }
                    if (consumeSiteArray.length > 0)
                        siteId = consumeSiteArray[0].Id;
                    updateConsumeSelect("#inWz" + xh, siteId, consumeSiteArray, "Site");
                    break;
                }
            }
            $("#inDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
            var codeId = $(this).val();
            var actual = $(this).find(`option[value=${codeId}]`).attr('actual');
            if (actual) {
                $("#inRk" + increaseMax).prop('placeholder', `货品领用数量：${actual}`);
            }
        });

        /////////////////添加option
        ////货品类别
        //var _consumeCategory = [];
        selector = "#inLb" + xh;
        updateConsumeSelect(selector, categoryId, _consumeCategory, "Category");
        $(selector).on('select2:select', function () {
            var billId = 0, categoryId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
            categoryId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            siteId = $("#inWz" + xh).val();
            $("#inDw" + xh).html('');
            $("#inJg" + xh).html(0);
            $("#inKc" + xh).html(0);

            ////货品名称
            //var _consumeName = [];
            for (var i = 0; i < _consumeName.length; i++) {
                var d = _consumeName[i];
                if (d.CategoryId == categoryId) {
                    nameId = d.Id;
                    break;
                }
            }
            selector = "#inMc" + xh;
            updateConsumeSelect(selector, nameId, _consumeName, "Name", "CategoryId", categoryId);

            ////供应商
            //var _consumeSupplier = [];
            for (var i = 0; i < _consumeSupplier.length; i++) {
                var d = _consumeSupplier[i];
                if (d.NameId == nameId) {
                    supplierId = d.Id;
                    break;
                }
            }
            selector = "#inGys" + xh;
            updateConsumeSelect(selector, supplierId, _consumeSupplier, "Supplier", "NameId", nameId);

            ////规格型号
            //var _consumeSpecification = [];
            for (var i = 0; i < _consumeSpecification.length; i++) {
                var d = _consumeSpecification[i];
                if (d.SupplierId == supplierId) {
                    specificationId = d.Id;
                    break;
                }
            }
            selector = "#inGg" + xh;
            updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);

            var consumeSiteArray = new Array();
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId) {
                    if (_consumeSiteDict[d.SiteId])
                        consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                }
            }
            if (consumeSiteArray.length > 0)
                siteId = consumeSiteArray[0].Id;
            updateConsumeSelect("#inWz" + xh, siteId, consumeSiteArray, "Site");

            $("#inBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#in" + xh).attr("billId", billId);
                    $("#inBh" + xh).val(billId).trigger("change");
                    $("#inDw" + xh).html(d.Unit);
                    $("#inJg" + xh).html(d.Price);
                    $("#inKc" + xh).html(d.Number);
                    break;
                }
            }
            $("#inDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
        });

        ////货品名称
        //var _consumeName = [];
        selector = "#inMc" + xh;
        updateConsumeSelect(selector, nameId, _consumeName, "Name", "CategoryId", categoryId);
        $(selector).on('select2:select', function () {
            var billId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
            nameId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            siteId = $("#inWz" + xh).val();

            $("#inDw" + xh).html('');
            $("#inJg" + xh).html(0);
            $("#inKc" + xh).html(0);

            ////供应商
            //var _consumeSupplier = [];
            for (var i = 0; i < _consumeSupplier.length; i++) {
                var d = _consumeSupplier[i];
                if (d.NameId == nameId) {
                    supplierId = d.Id;
                    break;
                }
            }
            selector = "#inGys" + xh;
            updateConsumeSelect(selector, supplierId, _consumeSupplier, "Supplier", "NameId", nameId);

            ////规格型号
            //var _consumeSpecification = [];
            for (var i = 0; i < _consumeSpecification.length; i++) {
                var d = _consumeSpecification[i];
                if (d.SupplierId == supplierId) {
                    specificationId = d.Id;
                    break;
                }
            }
            selector = "#inGg" + xh;
            updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);

            var consumeSiteArray = new Array();
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId) {
                    if (_consumeSiteDict[d.SiteId])
                        consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                }
            }
            if (consumeSiteArray.length > 0)
                siteId = consumeSiteArray[0].Id;
            updateConsumeSelect("#inWz" + xh, siteId, consumeSiteArray, "Site");
            $("#in" + xh).attr("billId", 0);
            $("#inBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#in" + xh).attr("billId", billId);
                    $("#inBh" + xh).val(billId).trigger("change");
                    $("#inDw" + xh).html(d.Unit);
                    $("#inJg" + xh).html(d.Price);
                    $("#inKc" + xh).html(d.Number);
                    break;
                }
            }
            $("#inDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
        });

        ////供应商
        //var _consumeSupplier = [];
        selector = "#inGys" + xh;
        updateConsumeSelect(selector, supplierId, _consumeSupplier, "Supplier", "NameId", nameId);
        $(selector).on('select2:select', function () {
            var billId = 0, supplierId = 0, specificationId = 0, siteId = 0;
            supplierId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            siteId = $("#inWz" + xh).val();

            $("#inDw" + xh).html('');
            $("#inJg" + xh).html(0);
            $("#inKc" + xh).html(0);

            ////规格型号
            //var _consumeSpecification = [];
            for (var i = 0; i < _consumeSpecification.length; i++) {
                var d = _consumeSpecification[i];
                if (d.SupplierId == supplierId) {
                    specificationId = d.Id;
                    break;
                }
            }
            selector = "#inGg" + xh;
            updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);

            var consumeSiteArray = new Array();
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId) {
                    if (_consumeSiteDict[d.SiteId])
                        consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                }
            }
            if (consumeSiteArray.length > 0)
                siteId = consumeSiteArray[0].Id;
            updateConsumeSelect("#inWz" + xh, siteId, consumeSiteArray, "Site");
            $("#in" + xh).attr("billId", 0);
            $("#inBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#in" + xh).attr("billId", billId);
                    $("#inBh" + xh).val(billId).trigger("change");
                    $("#inDw" + xh).html(d.Unit);
                    $("#inJg" + xh).html(d.Price);
                    $("#inKc" + xh).html(d.Number);
                    break;
                }
            }
            $("#inDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
        });

        ////规格型号
        //var _consumeSpecification = [];
        selector = "#inGg" + xh;
        updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);
        $(selector).on('select2:select', function () {
            var billId = 0, specificationId = 0, siteId = 0;
            specificationId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            var consumeSiteArray = new Array();
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId) {
                    if (_consumeSiteDict[d.SiteId])
                        consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                }
            }
            if (consumeSiteArray.length > 0)
                siteId = consumeSiteArray[0].Id;
            updateConsumeSelect(selector, siteId, consumeSiteArray, "Site");

            $("#inDw" + xh).html('');
            $("#inJg" + xh).html(0);
            $("#inKc" + xh).html(0);

            $("#in" + xh).attr("billId", 0);
            $("#inBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#in" + xh).attr("billId", billId);
                    $("#inBh" + xh).val(billId).trigger("change");
                    $("#inDw" + xh).html(d.Unit);
                    $("#inJg" + xh).html(d.Price);
                    $("#inKc" + xh).html(d.Number);
                    break;
                }
            }
            $("#inDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
        });

        ////位置
        //var _consumeSite = [];
        selector = "#inWz" + xh;
        var consumeSiteArray = new Array();
        for (var i = 0; i < _materialList.length; i++) {
            var d = _materialList[i];
            if (d.SpecificationId == specificationId) {
                if (_consumeSiteDict[d.SiteId])
                    consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
            }
        }
        if (consumeSiteArray.length > 0)
            siteId = consumeSiteArray[0].Id;
        updateConsumeSelect(selector, siteId, consumeSiteArray, "Site");
        $(selector).on('select2:select', function () {
            var billId = 0, specificationId = 0, siteId = 0;
            siteId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            specificationId = $("#inGg" + xh).val();

            $("#inDw" + xh).html('');
            $("#inJg" + xh).html(0);
            $("#inKc" + xh).html(0);

            $("#in" + xh).attr("billId", 0);
            $("#inBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#in" + xh).attr("billId", billId);
                    $("#inBh" + xh).val(billId).trigger("change");
                    $("#inDw" + xh).html(d.Unit);
                    $("#inJg" + xh).html(d.Price);
                    $("#inKc" + xh).html(d.Number);
                    break;
                }
            }
            $("#inDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
        });

        $("#in" + xh).find(".ms2").css("width", "100%");
        $("#in" + xh).find(".ms2").select2({
            width: "120px"
        });

        $("#inDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
    }
    $('#increaseTable').scrollTop($('#increaseTable')[0].scrollHeight);
    ditto();
}

//入库删除一行
function delIncreaseList(id) {
    $("#increaseList").find(`tr[value=${id}]:first`).remove();
    increaseMaxV--;
    var o = 1;
    var child = $("#increaseList tr");;
    for (var i = 0; i < child.length; i++) {
        $(child[i]).attr("xh", o);
        var v = $(child[i]).attr("value");
        $("#inXh" + v).html(o);
        o++;
    }
    ditto();
}

//隐藏入库同上
function ditto() {
    var v = $("#increaseList").find(`tr[xh=1]:first`).attr("value");
    $("#inDitto" + v).css("opacity", "0");
}

//点击入库同上
function inDitto(v) {
    var xh1 = $("#inXh" + v).html();
    var xh2 = parseInt(xh1) - 1;
    var id = $("#increaseList").find(`tr[xh=${xh2}]:first`).attr("value");
    var name = $("#inCg" + id).val();
    $("#inCg" + v).val(name);
}

//入库
function increase() {
    var opType = 801;
    var bill = new Array();
    var i;
    for (i = 1; i <= increaseMax; i++) {
        if ($("#inBh" + i).length > 0) {
            var actualEl = $("#inRk" + i);
            var tr = actualEl.parents('tr');
            var codeEl = tr.find('.code');
            var codeId = codeEl.val();
            var actual = codeEl.find(`option[value=${codeId}]`).attr('actual');
            var inBh = $("#inBh" + i).val();
            var inLy = $("#inLy" + i).val();
            var inRk = actualEl.val();
            var inCg = $("#inCg" + i).val();

            if (isStrEmptyOrUndefined(inBh)) {
                layer.msg("货品编号不能为空");
                return;
            }
            if (isStrEmptyOrUndefined(inRk)) {
                layer.msg($(`#inXh${i}`).html() + ". " + $(`#inBh${i} option:checked`).text() + ": 入库数量不能为空");
                return;
            }
            if (parseFloat(inRk) <= 0) {
                layer.msg($(`#inXh${i}`).html() + ". " + $(`#inBh${i} option:checked`).text() + ": 入库数量需大于0");
                return;
            }
            if (!!actual && parseFloat(inRk) > parseFloat(actual)) {
                layer.msg('入库数量大于货品领用数量');
                return;
            }
            if (isStrEmptyOrUndefined(inCg)) {
                layer.msg("采购/退回人不能为空");
                return;
            }
            var list = {
                Purpose: inLy,
                RelatedPerson: inCg,
                BillId: inBh,
                Number: inRk
            };
            if (inLy == '计划退回') {
                var planId = $("#inLy" + i).next().find('.planList').val();
                list.PlanId = planId;
            }
            bill.push(list);
        }
    }
    if (bill.length <= 0) {
        layer.msg("请输入货品");
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            Bill: bill
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    $("#increaseModal").modal("hide");
                    getMaterialList('Select');
                }
            });
    }
    showConfirm("入库", doSth);
}

/////////////////////////////////////////////领用/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////计划/////////////////////////////////////////////
var _consumeType = 0;
//计划列表
var _consumePlan = null;
//计划使用物料
var _consumePlanBill = null;
//货品编号
var _materialList = null;
//货品类别
var _consumeCategory = null;
//货品名称
var _consumeName = null;
//供应商
var _consumeSupplier = null;
//规格型号
var _consumeSpecification = null;
//位置
var _consumeSite = null;
//位置
var _consumeSiteDict = null;
//录入列表
var _consumePlanList = null;
var _consumeOtherList = null;
//领用列表
var _consumeActualList = null;

//领用弹窗
function tabClick(type) {
    _consumeType = type;
    _consumeActualList = new Array();
    if (type == 0)
        consumePlanActual();
    else if (type == 0)
        consumeOtherActual();
}

//领用弹窗
function showConsumeModel() {
    var opType = 802;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    _consumePlanList = new Array();
    _consumeOtherList = new Array();
    _consumeActualList = new Array();
    if ($('#planConsumeLi').attr("aria-expanded") == "false")
        $('#planConsumeLi').click();
    $('#consumePlanRemarkDiv').addClass('hidden');
    $("#consumePlanCondition").val('');
    $('#consumePlanSelect').empty();
    $("#consumeOther").val('');
    resetConsumePlanList();
    resetConsumeOtherList();
    var list = {};
    list.first = true;
    list.simple = true;

    var data = {}
    data.opType = 700;
    data.opData = JSON.stringify(list);

    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }

        _consumePlan = ret.datas;
        if (_consumePlan.length > 0) {
            var i, len = _consumePlan.length;
            var option = '<option value = "{0}">{1}</option>';
            var options = '';
            for (i = 0; i < len; i++) {
                var d = _consumePlan[i];
                options += option.format(d.Id, d.Plan);
                if (i == 0) {
                    if (!isStrEmptyOrUndefined(d.Remark)) {
                        $('#consumePlanRemarkDiv').removeClass('hidden');
                        $('#consumePlanRemark').html(d.Remark);
                    } else {
                        $('#consumePlanRemarkDiv').addClass('hidden');
                        $('#consumePlanRemark').html('');
                    }
                    _consumePlanBill = d.FirstBill;
                }
            }
            $('#consumePlanSelect').append(options);
            getPlanBill();
        }

        var materialListFunc = new Promise(function (resolve, reject) {
            var data = {}
            data.opType = 800;
            ajaxPost("/Relay/Post", data, function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }

                _materialList = ret.datas;
                resolve('success');
            }, 0);
        });

        var categoryFunc = new Promise(function (resolve, reject) {
            var data = {}
            data.opType = 816;
            ajaxPost("/Relay/Post", data, function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }
                _consumeCategory = ret.datas;
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

                _consumeName = ret.datas;
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

                _consumeSupplier = ret.datas;
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

                _consumeSpecification = ret.datas;
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

                _consumeSite = ret.datas;
                _consumeSiteDict = new Array();
                for (var i = 0; i < _consumeSite.length; i++) {
                    _consumeSiteDict[_consumeSite[i].Id] = _consumeSite[i];
                }
                resolve('success');
            }, 0);
        });

        Promise.all([materialListFunc, categoryFunc, nameFunc, supplierFunc, specificationFunc, siteFunc])
            .then((result) => {
                //console.log(result);
                $("#addConsumePlanListBtn").removeAttr("disabled");
                $("#addConsumeOtherListBtn").removeAttr("disabled");
            });
    });
    $("#consumeModal").modal("show");
}

//获取计划使用物料
function getPlanBill(post = false) {
    if (post) {
        var list = {};
        var planId = $('#consumePlanSelect').val();
        list.planId = planId;
        list.stock = true;

        var data = {}
        data.opType = 704;
        data.opData = JSON.stringify(list);

        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            _consumePlanBill = ret.datas;
            showPlanBill();
        });
    } else {
        showPlanBill();
    }
}

//领用显示计划使用物料
function showPlanBill(find = false, el) {
    //var planId = $('#consumePlanSelect').val();
    if (find) {
        var con = $(`#consume${el}Condition`).val();
        var con1 = "", con2 = "0";
        if (!isStrEmptyOrUndefined(con)) {
            con1 = $(`#consume${el}Condition1`).val();
            var id = "";
            switch (con1) {
                case "Code":
                    id = `con${el}Bh`;
                    break;
                case "Category":
                    id = `con${el}Lb`;
                    break;
                case "Name":
                    id = `con${el}Mc`;
                    break;
                case "Supplier":
                    id = `con${el}Gys`;
                    break;
                case "Specification":
                    id = `con${el}Gg`;
                    break;
                case "Site":
                    id = `con${el}Wz`;
                    break;
                default:
                    return;
            }
            con2 = $(`#consume${el}Condition2`).val();
            var trs = $(`#consume${el}List tr`);
            for (var i = 0; i < trs.length; i++) {
                var tr = trs[i];
                var v = $(tr).attr("value");
                var bh = "";
                if ($(tr).hasClass("new")) {
                    bh = $(`#${id + v} option:checked`).text();
                } else {
                    bh = $(`#${id + v}`).html();
                }
                var enable = false;
                switch (con2) {
                    //等于
                    case "0":
                        if (bh == con) {
                            enable = true;
                        }
                        break;
                    //不等于
                    case "1":
                        if (bh != con) {
                            enable = true;
                        }
                        break;
                    //包含
                    case "2":
                        if (bh.indexOf(con) != -1) {
                            enable = true;
                        }
                        break;
                }
                if (enable) {
                    $(tr).removeClass("hidden");
                } else {
                    $(tr).addClass("hidden");
                }
            }
        } else {
            $(`#consume${el}List tr`).removeClass("hidden");
        }
        el == 'Plan' ? consumePlanDittoAuto() : consumeOtherDittoAuto();
    } else {
        //var data = _consumePlanBill;
        //$("#consumePlanList").empty();
        //if (data.length > 0) {
        //    var trs = "";
        //    for (var j = 0; j < data.length; j++) {
        //        var xh = j + 1;
        //        var d = data[j];
        //        var tr = `
        //        <tr id="conPlan${xh}" value="${xh}" xh="${xh}" billId="${d.BillId}">
        //            <td style="vertical-align: inherit;">${xh}</td>
        //            <td style="vertical-align: inherit;" id="conPlanBh${xh}" ${(d.Extra ? 'class="text-red"' : '')}>${d.Code}</td>
        //            <td style="vertical-align: inherit;" id="conPlanLb${xh}">${d.Category}</td>
        //            <td style="vertical-align: inherit;" id="conPlanMc${xh}">${d.Name}</td>
        //            <td style="vertical-align: inherit;" id="conPlanGys${xh}">${d.Supplier}</td>
        //            <td style="vertical-align: inherit;" id="conPlanGg${xh}">${d.Specification}</td>
        //            <td style="vertical-align: inherit;" id="conPlanWz${xh}">${d.Site}</td>
        //            <td style="vertical-align: inherit;">${d.Unit}</td>
        //            <td>
        //                <button type="button" class="btn btn-info btn-sm" id="conPlanDetail${xh}" onclick="showDetailModel(${d.BillId})">详情</button>
        //            </td>
        //            <td style="vertical-align: inherit;">${d.PlannedConsumption}</td>
        //            <td style="vertical-align: inherit;">${d.ActualConsumption}</td>
        //            <td style="vertical-align: inherit;" class="form-inline">
        //                <span id="conPlanNum${xh}">${d.Number}</span>
        //                <button type="button" class="btn btn-danger btn-xs pull-right" onclick="consumePlanUpdateNum(${d.BillId})"><i class="fa fa-refresh"></i></button>
        //            </td>
        //            <td>
        //                <input class="form-control text-center" type="tel" id="conPlanConsume${xh}" value="0" onkeyup="onInput(this, 8, 0)" onblur="onInputEnd(this)" onchange="consumePlanActual()" maxlength="10">
        //            </td>
        //            <td>
        //                <div style="display:flex;width:150px">
        //                    <input class="form-control text-center" id="conPlanLyr${xh}" maxlength="64" onchange="consumePlanActual()" />
        //                    <button class="btn btn-primary btn-sm conPlanDitto" ${(j == 0 ? 'style="opacity: 0;"' : '')} type="button" id="consumePlanDitto${xh}" style="margin-left:3px" onclick="consumePlanDitto(${xh})">同上</button>
        //                </div>
        //            </td>
        //            <td>
        //                <button type="button" class="btn btn-success btn-sm" onclick="showLogConsumeModel(${d.BillId}, 1, ${planId})">查看</button>
        //            </td>
        //            <td>
        //                <button type="button" class="btn btn-danger btn-sm hidden" id="delConsumePlanList${xh}" onclick="delConsumePlanList(${xh})"><i class="fa fa-minus"></i></button>
        //            </td>
        //        </tr>`;
        //        trs += tr;
        //    }
        //    $("#consumePlanList").append(trs);
        //    consumePlanMax = _consumePlanBill.length;
        //    consumePlanMaxV = _consumePlanBill.length;
        //}
    }
}

//领用刷新库存
function consumePlanUpdateNum(id) {
    var data = {}
    data.opType = 800;
    data.opData = JSON.stringify({
        qId: id
    });

    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var data = ret.datas[0];
        var child = $(`#consumePlanList [billId=${id}]`);
        for (var i = 0; i < child.length; i++) {
            var v = $(child[i]).attr("value");
            $("#conPlanNum" + v).html(data.Number);
        }
        for (var i = 0; i < _materialList.length; i++) {
            var d = _materialList[i];
            if (d.Id == id) {
                d.Number = data.Number;
                break;
            }
        }
    });
}

var consumePlanMax = 0;
var consumePlanMaxV = 0;

//领用重置
function resetConsumePlanList() {
    $("#consumePlanList").empty();
    addConsumePlanFrom = consumePlanMax = consumePlanMaxV = 0;
}

var addConsumePlanFrom = 0;
//领用添加一行
function addConsumePlanList() {
    if (_consumePlan && _consumePlan.length > 0) {

        //consumePlanList
        consumePlanMax++;
        consumePlanMaxV++;
        var xh = addConsumePlanFrom = consumePlanMax;
        var tr = `
        <tr id="conPlan${xh}" value="${xh}" xh="${consumePlanMaxV}" class="new">
            <td style="vertical-align: inherit;"><span class="control-label xh" id="conPlanXh${xh}">${consumePlanMaxV}</span></td>
            <td>
                <span class="iconfont icon-saoyisao scanPrint" style="font-size:30px;cursor:pointer;vertical-align:middle"></span>
                <select class="ms2 form-control code" id="conPlanBh${xh}"></select>
            </td>
            <td><select class="ms2 form-control" id="conPlanLb${xh}"></select></td>
            <td><select class="ms2 form-control" id="conPlanMc${xh}"></select></td>
            <td><select class="ms2 form-control" id="conPlanGys${xh}"></select></td>
            <td><select class="ms2 form-control" id="conPlanGg${xh}"></select></td>
            <td><select class="ms2 form-control" id="conPlanWz${xh}"></select></td>
            <td style="vertical-align: inherit;" id="conPlanDw${xh}"></td>
            <td>
                <button type="button" class="btn btn-info btn-sm" id="conPlanDetail${xh}" onclick="showDetailModel(0)">详情</button>
            </td>
            <td style="vertical-align: inherit;" id="conPlanJh${xh}"></td>
            <td style="vertical-align: inherit;" id="conPlanSj${xh}"></td>
            <td style="vertical-align: inherit;" class="form-inline">
                <span id="conPlanNum${xh}"></span>
                <button type="button" class="btn btn-danger btn-xs pull-right" id="conPlanUpdateNum${xh}" onclick="consumePlanUpdateNum(0)"><i class="fa fa-refresh"></i></button>
            </td>
            <td>
                <input class="form-control text-center" id="conPlanConsume${xh}" value="0" onkeyup="onInput(this, 8, 1)" onblur="onInputEnd(this)" onchange="consumePlanActual()" maxlength="10">
            </td>
            <td>
                <div style="display:flex;width:150px">
                    <input class="form-control text-center" type="tel" id="conPlanLyr${xh}" maxlength="64" onchange="consumePlanActual()" />
                    <button class="btn btn-primary btn-sm conPlanDitto" ${(xh == 1 ? 'style="opacity: 0;"' : '')} type="button" id="consumePlanDitto${xh}" style="margin-left:3px" onclick="consumePlanDitto(${xh})">同上</button>
                </div>
            </td>
            <td>
                <button type="button" class="btn btn-success btn-sm" id="conPlanLog${xh}" onclick="showLogConsumeModel(2, 0)">查看</button>
            </td>
            <td>
                <button type="button" class="btn btn-danger btn-sm" id="delConsumePlanList${xh}" onclick="delConsumePlanList(${xh})"><i class="fa fa-minus"></i></button>
            </td>
        </tr>`;

        $("#consumePlanList").append(tr);
        if (!pcAndroid()) {
            $("#consumePlanList").find('.scanPrint').addClass('hidden');
        }
        if (_materialList != null) {
            var option = '<option value="{0}">{1}</option>';
            ////货品编号
            //var _materialList = [];
            var selector = "#conPlanBh" + xh;
            $(selector).empty();
            var billId = 0, categoryId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                $(selector).append(option.format(d.Id, d.Code));
                if (i == 0) {
                    billId = d.BillId;
                    $("#conPlan" + xh).attr("billId", billId);
                    categoryId = d.CategoryId;
                    nameId = d.NameId;
                    supplierId = d.SupplierId;
                    specificationId = d.SpecificationId;
                    siteId = d.SiteId;
                    $("#conPlanDw" + xh).html(d.Unit);
                    $("#conPlanJh" + xh).html(0);
                    $("#conPlanSj" + xh).html(0);
                    for (var j = 0; j < _consumePlanBill.length; j++) {
                        var bill = _consumePlanBill[i];
                        if (bill.BillId == billId) {
                            $("#conPlanJh" + xh).html(bill.PlannedConsumption);
                            $("#conPlanSj" + xh).html(bill.ActualConsumption);
                            break;
                        }
                    }
                    $("#conPlanNum" + xh).html(d.Number);
                }
            }
            $(selector).on('select2:select', function () {
                var billId = 0, categoryId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
                var id = $(this).val();
                var xh = $(this).parents('tr:first').attr("value");
                var i, len = _materialList.length;
                $("#conPlanDw" + xh).html('');
                $("#conPlanNum" + xh).html(0);
                for (i = 0; i < len; i++) {
                    var d = _materialList[i];
                    if (id == d.Id) {
                        billId = d.BillId;
                        $("#conPlan" + xh).attr("billId", billId);
                        categoryId = d.CategoryId;
                        nameId = d.NameId;
                        supplierId = d.SupplierId;
                        specificationId = d.SpecificationId;
                        siteId = d.SiteId;
                        $("#conPlanWz" + xh).val(siteId).trigger("change");
                        $("#conPlanLb" + xh).val(categoryId).trigger("change");
                        $("#conPlanDw" + xh).html(d.Unit);
                        $("#conPlanJh" + xh).html(0);
                        $("#conPlanSj" + xh).html(0);
                        if (_consumePlanBill != null) {
                            for (var j = 0; j < _consumePlanBill.length; j++) {
                                var bill = _consumePlanBill[j];
                                if (bill.BillId == billId) {
                                    $("#conPlanJh" + xh).html(bill.PlannedConsumption);
                                    $("#conPlanSj" + xh).html(bill.ActualConsumption);
                                    break;
                                }
                            }
                        }
                        $("#conPlanNum" + xh).html(d.Number);

                        ////货品名称
                        //var _consumeName = [];
                        selector = "#conPlanMc" + xh;
                        updateConsumeSelect(selector, nameId, _consumeName, "Name", "CategoryId", categoryId);

                        ////供应商
                        //var _consumeSupplier = [];
                        selector = "#conPlanGys" + xh;
                        updateConsumeSelect(selector, supplierId, _consumeSupplier, "Supplier", "NameId", nameId);

                        ////规格型号
                        //var _consumeSpecification = [];
                        selector = "#conPlanGg" + xh;
                        updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);

                        var consumeSiteArray = new Array();
                        for (var i = 0; i < _materialList.length; i++) {
                            var d = _materialList[i];
                            if (d.SpecificationId == specificationId) {
                                if (_consumeSiteDict[d.SiteId])
                                    consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                            }
                        }
                        if (consumeSiteArray.length > 0)
                            siteId = consumeSiteArray[0].Id;
                        updateConsumeSelect($("#conPlanWz" + xh), siteId, consumeSiteArray, "Site");
                        break;
                    }
                }
                consumePlanActual();
                $("#conPlanDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
                var planId = $('#consumePlanSelect').val();
                if (_consumePlanBill.some((item) => item.BillId == id)) {
                    $("#conPlanLog" + xh).removeClass('hidden');
                } else {
                    $("#conPlanLog" + xh).addClass('hidden');
                }
                $("#conPlanLog" + xh).attr("onclick", `showLogConsumeModel(${id}, 1, ${planId})`);
            });

            /////////////////添加option
            ////货品类别
            //var _consumeCategory = [];
            selector = "#conPlanLb" + xh;
            updateConsumeSelect(selector, categoryId, _consumeCategory, "Category");
            $(selector).on('select2:select', function () {
                var billId = 0, categoryId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
                categoryId = $(this).val();
                var xh = $(this).parents('tr:first').attr("value");
                siteId = $("#conPlanWz" + xh).val();
                $("#conPlanDw" + xh).html('');
                $("#conPlanNum" + xh).html(0);

                ////货品名称
                //var _consumeName = [];
                for (var i = 0; i < _consumeName.length; i++) {
                    var d = _consumeName[i];
                    if (d.CategoryId == categoryId) {
                        nameId = d.Id;
                        break;
                    }
                }
                selector = "#conPlanMc" + xh;
                updateConsumeSelect(selector, nameId, _consumeName, "Name", "CategoryId", categoryId);

                ////供应商
                //var _consumeSupplier = [];
                for (var i = 0; i < _consumeSupplier.length; i++) {
                    var d = _consumeSupplier[i];
                    if (d.NameId == nameId) {
                        supplierId = d.Id;
                        break;
                    }
                }
                selector = "#conPlanGys" + xh;
                updateConsumeSelect(selector, supplierId, _consumeSupplier, "Supplier", "NameId", nameId);

                ////规格型号
                //var _consumeSpecification = [];
                for (var i = 0; i < _consumeSpecification.length; i++) {
                    var d = _consumeSpecification[i];
                    if (d.SupplierId == supplierId) {
                        specificationId = d.Id;
                        break;
                    }
                }
                selector = "#conPlanGg" + xh;
                updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);

                var consumeSiteArray = new Array();
                for (var i = 0; i < _materialList.length; i++) {
                    var d = _materialList[i];
                    if (d.SpecificationId == specificationId) {
                        if (_consumeSiteDict[d.SiteId])
                            consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                    }
                }
                if (consumeSiteArray.length > 0)
                    siteId = consumeSiteArray[0].Id;
                updateConsumeSelect($("#conPlanWz" + xh), siteId, consumeSiteArray, "Site");
                $("#conPlan" + xh).attr("billId", 0);
                $("#conPlanBh" + xh).val(0).trigger("change");
                for (var i = 0; i < _materialList.length; i++) {
                    var d = _materialList[i];
                    if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                        billId = d.BillId;
                        $("#conPlan" + xh).attr("billId", billId);
                        $("#conPlanBh" + xh).val(billId).trigger("change");
                        $("#conPlanDw" + xh).html(d.Unit);
                        $("#conPlanJh" + xh).html(0);
                        $("#conPlanSj" + xh).html(0);
                        for (var j = 0; j < _consumePlanBill.length; j++) {
                            var bill = _consumePlanBill[j];
                            if (bill.BillId == billId) {
                                $("#conPlanJh" + xh).html(bill.PlannedConsumption);
                                $("#conPlanSj" + xh).html(bill.ActualConsumption);
                                break;
                            }
                        }
                        $("#conPlanNum" + xh).html(d.Number);
                        break;
                    }
                }
                consumePlanActual();
                $("#conPlanDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
                var planId = $('#consumePlanSelect').val();
                $("#conPlanLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 1, ${planId})`);
            });

            ////货品名称
            //var _consumeName = [];
            selector = "#conPlanMc" + xh;
            updateConsumeSelect(selector, nameId, _consumeName, "Name", "CategoryId", categoryId);
            $(selector).on('select2:select', function () {
                var billId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
                nameId = $(this).val();
                var xh = $(this).parents('tr:first').attr("value");
                siteId = $("#conPlanWz" + xh).val();

                $("#conPlanDw" + xh).html('');
                $("#conPlanNum" + xh).html(0);

                ////供应商
                //var _consumeSupplier = [];
                for (var i = 0; i < _consumeSupplier.length; i++) {
                    var d = _consumeSupplier[i];
                    if (d.NameId == nameId) {
                        supplierId = d.Id;
                        break;
                    }
                }
                selector = "#conPlanGys" + xh;
                updateConsumeSelect(selector, supplierId, _consumeSupplier, "Supplier", "NameId", nameId);

                ////规格型号
                //var _consumeSpecification = [];
                for (var i = 0; i < _consumeSpecification.length; i++) {
                    var d = _consumeSpecification[i];
                    if (d.SupplierId == supplierId) {
                        specificationId = d.Id;
                        break;
                    }
                }
                selector = "#conPlanGg" + xh;
                updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);

                var consumeSiteArray = new Array();
                for (var i = 0; i < _materialList.length; i++) {
                    var d = _materialList[i];
                    if (d.SpecificationId == specificationId) {
                        if (_consumeSiteDict[d.SiteId])
                            consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                    }
                }
                if (consumeSiteArray.length > 0)
                    siteId = consumeSiteArray[0].Id;
                updateConsumeSelect($("#conPlanWz" + xh), siteId, consumeSiteArray, "Site");

                $("#conPlan" + xh).attr("billId", 0);
                $("#conPlanBh" + xh).val(0).trigger("change");
                for (var i = 0; i < _materialList.length; i++) {
                    var d = _materialList[i];
                    if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                        billId = d.BillId;
                        $("#conPlan" + xh).attr("billId", billId);
                        $("#conPlanBh" + xh).val(billId).trigger("change");
                        $("#conPlanDw" + xh).html(d.Unit);
                        $("#conPlanJh" + xh).html(0);
                        $("#conPlanSj" + xh).html(0);
                        for (var j = 0; j < _consumePlanBill.length; j++) {
                            var bill = _consumePlanBill[j];
                            if (bill.BillId == billId) {
                                $("#conPlanJh" + xh).html(bill.PlannedConsumption);
                                $("#conPlanSj" + xh).html(bill.ActualConsumption);
                                break;
                            }
                        }
                        $("#conPlanNum" + xh).html(d.Number);
                        break;
                    }
                }
                consumePlanActual();
                $("#conPlanDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
                var planId = $('#consumePlanSelect').val();
                $("#conPlanLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 1, ${planId})`);
            });

            ////供应商
            //var _consumeSupplier = [];
            selector = "#conPlanGys" + xh;
            updateConsumeSelect(selector, supplierId, _consumeSupplier, "Supplier", "NameId", nameId);
            $(selector).on('select2:select', function () {
                var billId = 0, supplierId = 0, specificationId = 0, siteId = 0;
                supplierId = $(this).val();
                var xh = $(this).parents('tr:first').attr("value");
                siteId = $("#conPlanWz" + xh).val();

                $("#conPlanDw" + xh).html('');
                $("#conPlanNum" + xh).html(0);

                ////规格型号
                //var _consumeSpecification = [];
                for (var i = 0; i < _consumeSpecification.length; i++) {
                    var d = _consumeSpecification[i];
                    if (d.SupplierId == supplierId) {
                        specificationId = d.Id;
                        break;
                    }
                }
                selector = "#conPlanGg" + xh;
                updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);

                var consumeSiteArray = new Array();
                for (var i = 0; i < _materialList.length; i++) {
                    var d = _materialList[i];
                    if (d.SupplierId == supplierId) {
                        if (_consumeSiteDict[d.SiteId])
                            consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                    }
                }
                if (consumeSiteArray.length > 0)
                    siteId = consumeSiteArray[0].Id;
                updateConsumeSelect($("#conPlanWz" + xh), siteId, consumeSiteArray, "Site");
                $("#conPlan" + xh).attr("billId", 0);
                $("#conPlanBh" + xh).val(0).trigger("change");
                for (var i = 0; i < _materialList.length; i++) {
                    var d = _materialList[i];
                    if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                        billId = d.BillId;
                        $("#conPlan" + xh).attr("billId", billId);
                        $("#conPlanBh" + xh).val(billId).trigger("change");
                        $("#conPlanDw" + xh).html(d.Unit);
                        $("#conPlanJh" + xh).html(0);
                        $("#conPlanSj" + xh).html(0);
                        for (var j = 0; j < _consumePlanBill.length; j++) {
                            var bill = _consumePlanBill[j];
                            if (bill.BillId == billId) {
                                $("#conPlanJh" + xh).html(bill.PlannedConsumption);
                                $("#conPlanSj" + xh).html(bill.ActualConsumption);
                                break;
                            }
                        }
                        $("#conPlanNum" + xh).html(d.Number);
                        break;
                    }
                }
                consumePlanActual();
                $("#conPlanDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
                var planId = $('#consumePlanSelect').val();
                $("#conPlanLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 1, ${planId})`);
            });

            ////规格型号
            //var _consumeSpecification = [];
            selector = "#conPlanGg" + xh;
            updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);
            $(selector).on('select2:select', function () {
                var billId = 0, specificationId = 0, siteId = 0;
                specificationId = $(this).val();
                var xh = $(this).parents('tr:first').attr("value");
                siteId = $("#conPlanWz" + xh).val();

                var consumeSiteArray = new Array();
                for (var i = 0; i < _materialList.length; i++) {
                    var d = _materialList[i];
                    if (d.SpecificationId == specificationId) {
                        if (_consumeSiteDict[d.SiteId])
                            consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                    }
                }
                if (consumeSiteArray.length > 0)
                    siteId = consumeSiteArray[0].Id;
                updateConsumeSelect($("#conPlanWz" + xh), siteId, consumeSiteArray, "Site");

                $("#conPlanDw" + xh).html('');
                $("#conPlanNum" + xh).html(0);

                $("#conPlan" + xh).attr("billId", 0);
                $("#conPlanBh" + xh).val(0).trigger("change");
                for (var i = 0; i < _materialList.length; i++) {
                    var d = _materialList[i];
                    if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                        billId = d.BillId;
                        $("#conPlan" + xh).attr("billId", billId);
                        $("#conPlanBh" + xh).val(billId).trigger("change");
                        $("#conPlanDw" + xh).html(d.Unit);
                        $("#conPlanJh" + xh).html(0);
                        $("#conPlanSj" + xh).html(0);
                        for (var j = 0; j < _consumePlanBill.length; j++) {
                            var bill = _consumePlanBill[j];
                            if (bill.BillId == billId) {
                                $("#conPlanJh" + xh).html(bill.PlannedConsumption);
                                $("#conPlanSj" + xh).html(bill.ActualConsumption);
                                break;
                            }
                        }
                        $("#conPlanNum" + xh).html(d.Number);
                        break;
                    }
                }
                consumePlanActual();
                $("#conPlanDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
                var planId = $('#consumePlanSelect').val();
                $("#conPlanLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 1, ${planId})`);
            });

            ////位置
            //var _consumeSite = [];
            selector = "#conPlanWz" + xh;
            var consumeSiteArray = new Array();
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId) {
                    if (_consumeSiteDict[d.SiteId])
                        consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                }
            }
            updateConsumeSelect(selector, siteId, consumeSiteArray, "Site");
            $(selector).on('select2:select', function () {
                var billId = 0, specificationId = 0, siteId = 0;
                siteId = $(this).val();
                var xh = $(this).parents('tr:first').attr("value");
                specificationId = $("#conPlanGg" + xh).val();

                $("#conPlanDw" + xh).html('');
                $("#conPlanNum" + xh).html(0);

                $("#conPlan" + xh).attr("billId", 0);
                $("#conPlanBh" + xh).val(0).trigger("change");
                for (var i = 0; i < _materialList.length; i++) {
                    var d = _materialList[i];
                    if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                        billId = d.BillId;
                        $("#conPlan" + xh).attr("billId", billId);
                        $("#conPlanBh" + xh).val(billId).trigger("change");
                        $("#conPlanDw" + xh).html(d.Unit);
                        $("#conPlanJh" + xh).html(0);
                        $("#conPlanSj" + xh).html(0);
                        for (var j = 0; j < _consumePlanBill.length; j++) {
                            var bill = _consumePlanBill[j];
                            if (bill.BillId == billId) {
                                $("#conPlanJh" + xh).html(bill.PlannedConsumption);
                                $("#conPlanSj" + xh).html(bill.ActualConsumption);
                                break;
                            }
                        }
                        $("#conPlanNum" + xh).html(d.Number);
                        break;
                    }
                }
                consumePlanActual();
                $("#conPlanDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
                var planId = $('#consumePlanSelect').val();
                $("#conPlanLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 1, ${planId})`);
            });

            $("#conPlan" + xh).find(".ms2").css("width", "100%");
            $("#conPlan" + xh).find(".ms2").select2({
                width: "120px"
            });

            $("#conPlanDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
            $("#conPlanUpdateNum" + xh).attr("onclick", `consumePlanUpdateNum(${billId})`);
            var planId = $('#consumePlanSelect').val();
            $("#conPlanLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 1, ${planId})`);

        }
        $('#consumePlanTable').scrollTop($('#consumePlanTable')[0].scrollHeight);
        consumePlanDittoAuto();
        consumePlanActual();
    }
}

function updateConsumeSelect(ele, id, res, field, parentField = "", parentId = -1) {
    $(ele).empty();
    var html = "";
    for (var i = 0; i < res.length; i++) {
        var d = res[i];
        if (parentId != -1) {
            if (parentId != 0) {
                if (d[parentField] == parentId) {
                    html += `<option value="${d.Id}">${d[field]}</option>`;
                }
            }
        } else {
            html += `<option value="${d.Id}">${d[field]}</option>`;
        }
    }
    $(ele).append(html);

    if (id && id != 0) {
        $(ele).val(id).trigger("change");
    }
}

//领用删除一行
function delConsumePlanList(id) {
    $("#consumePlanList").find(`tr[value=${id}]:first`).remove();
    consumePlanMaxV--;
    var o = 1;
    var child = $("#consumePlanList tr");
    for (var i = 0; i < child.length; i++) {
        $(child[i]).attr("xh", o);
        var v = $(child[i]).attr("value");
        $("#conPlanXh" + v).html(o);
        o++;
    }
    consumePlanDittoAuto();
}

//隐藏领用同上
function consumePlanDittoAuto() {
    $("#consumePlanList").find('.conPlanDitto').css("visibility", "visible");
    $("#consumePlanList tr").not(".hidden").first().find('.conPlanDitto').css("visibility", "hidden");
}

//点击领用同上按钮
function consumePlanDitto(v) {
    var trs = $("#consumePlanList tr").not(".hidden");
    if (trs.length <= 1) {
        return;
    }
    var preI = -1;
    for (var i = trs.length - 1; i >= 0; i--) {
        var tr = trs[i];
        var value = $(tr).attr("value");
        if (v == value) {
            preI = i - 1;
            break;
        }
    }

    if (preI > -1) {
        var name = $("#conPlanLyr" + $(trs[preI]).attr("xh")).val();
        $("#conPlanLyr" + v).val(name);
    }
}

//实际领用
function consumePlanActual() {
    var i;
    _consumePlanList = new Array();
    var plan = $("#consumePlanSelect option:checked").text();
    var trs = $("#consumePlanList tr");
    for (i = 0; i < trs.length; i++) {
        var tr = trs[i];
        var billId = $(tr).attr("billId");
        var v = $(tr).attr("value");
        var num = $("#conPlanConsume" + v).val();
        if (isStrEmptyOrUndefined(num)) {
            num = 0;
        }
        var person = $("#conPlanLyr" + v).val();
        if (isStrEmptyOrUndefined(person)) {
            person = "";
        }
        var bh = "";
        if ($(tr).hasClass("new")) {
            bh = $(`#conPlanBh${v} option:checked`).text();
        } else {
            bh = $(`#conPlanBh${v}`).html();
        }
        var data = {
            Code: bh,
            Purpose: plan,
            RelatedPerson: person,
            BillId: billId,
            Number: num,
            Exist: false
        };
        for (var j = 0; j < _materialList.length; j++) {
            var d = _materialList[j];
            if (d.BillId == billId) {
                data.Exist = true;
                data.Code = d.Code;
                data.Category = d.Category;
                data.Name = d.Name;
                data.Supplier = d.Supplier;
                data.Specification = d.Specification;
                data.Site = d.Site;
                break;
            }
        }
        _consumePlanList.push(data);
    }
}

/////////////////////////////////////////////其他/////////////////////////////////////////////
//领用刷新库存
function consumeOtherUpdateNum(id) {
    var data = {}
    data.opType = 800;
    data.opData = JSON.stringify({
        qId: id
    });

    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var data = ret.datas[0];
        var child = $(`#consumeOtherList [billId=${id}]`);
        for (var i = 0; i < child.length; i++) {
            var v = $(child[i]).attr("value");
            $("#consumeOtherNum" + v).html(data.Number);
        }
        for (var i = 0; i < _materialList.length; i++) {
            var d = _materialList[i];
            if (d.Id == id) {
                d.Number = data.Number;
                break;
            }
        }
    });
}

var consumeOtherMax = 0;
var consumeOtherMaxV = 0;

//领用重置
function resetConsumeOtherList() {
    $("#consumeOtherList").empty();
    addConsumeOtherFrom = consumeOtherMax = consumeOtherMaxV = 0;
}

var addConsumeOtherFrom = 0;
//领用添加一行
function addConsumeOtherList() {
    //consumeOtherList
    consumeOtherMax++;
    consumeOtherMaxV++;
    var xh = addConsumeOtherFrom = consumeOtherMax;
    var tr = `
        <tr id="conOther${xh}" value="${xh}" xh="${consumeOtherMaxV}" class="new">
            <td style="vertical-align: inherit;"><span class="control-label xh" id="conOtherXh${xh}">${consumeOtherMaxV}</span></td>
            <td>
                <span class="iconfont icon-saoyisao scanPrint" style="font-size:30px;cursor:pointer;vertical-align:middle"></span>
                <select class="ms2 form-control code" id="conOtherBh${xh}"></select>
            </td>
            <td><select class="ms2 form-control" id="conOtherLb${xh}"></select></td>
            <td><select class="ms2 form-control" id="conOtherMc${xh}"></select></td>
            <td><select class="ms2 form-control" id="conOtherGys${xh}"></select></td>
            <td><select class="ms2 form-control" id="conOtherGg${xh}"></select></td>
            <td><select class="ms2 form-control" id="conOtherWz${xh}"></select></td>
            <td style="vertical-align: inherit;" id="conOtherDw${xh}"></td>
            <td>
                <button type="button" class="btn btn-info btn-sm" id="conOtherDetail${xh}" onclick="showDetailModel(0)">详情</button>
            </td>
            <td style="vertical-align: inherit;" class="form-inline">
                <span id="consumeOtherNum${xh}"></span>
                <button type="button" class="btn btn-danger btn-xs pull-right" id="consumeOtherUpdateNum${xh}" onclick="consumeOtherUpdateNum(0)"><i class="fa fa-refresh"></i></button>
            </td>
            <td>
                <input class="form-control text-center" id="consumeOtherConsume${xh}" value="0" onkeyup="onInput(this, 8, 1)" onblur="onInputEnd(this)" onchange="consumeOtherActual()" maxlength="10">
            </td>
            <td>
                <div style="display:flex;width:150px">
                    <input class="form-control text-center" type="tel" id="consumeOtherLyr${xh}" maxlength="64" onchange="consumeOtherActual()" />
                    <button class="btn btn-primary btn-sm conOtherDitto" ${(xh == 1 ? 'style="opacity: 0;"' : '')} type="button" id="consumeOtherDitto${xh}" style="margin-left:3px" onclick="consumeOtherDitto(${xh})">同上</button>
                </div>
            </td>
            <td>
                <button type="button" class="btn btn-success btn-sm" id="consumeOtherLog${xh}" onclick="showLogConsumeModel(2, 0)">查看</button>
            </td>
            <td>
                <button type="button" class="btn btn-danger btn-sm" id="delConsumeOtherList${xh}" onclick="delConsumeOtherList(${xh})"><i class="fa fa-minus"></i></button>
            </td>
        </tr>`;

    $("#consumeOtherList").append(tr);
    if (!pcAndroid()) {
        $("#consumeOtherList").find('.scanPrint').addClass('hidden');
    }
    if (_materialList != null) {
        var option = '<option value="{0}">{1}</option>';
        ////货品编号
        //var _materialList = [];
        var selector = "#conOtherBh" + xh;
        $(selector).empty();
        var billId = 0, categoryId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
        for (var i = 0; i < _materialList.length; i++) {
            var d = _materialList[i];
            $(selector).append(option.format(d.Id, d.Code));
            if (i == 0) {
                billId = d.BillId;
                $("#conOther" + xh).attr("billId", billId);
                categoryId = d.CategoryId;
                nameId = d.NameId;
                supplierId = d.SupplierId;
                specificationId = d.SpecificationId;
                siteId = d.SiteId;
                $("#conOtherDw" + xh).html(d.Unit);
                $("#consumeOtherNum" + xh).html(d.Number);
            }
        }
        $(selector).on('select2:select', function () {
            var billId = 0, categoryId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
            var id = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            var i, len = _materialList.length;
            $("#conOtherDw" + xh).html('');
            $("#consumeOtherNum" + xh).html(0);
            for (i = 0; i < len; i++) {
                var d = _materialList[i];
                if (id == d.Id) {
                    billId = d.BillId;
                    $("#conOther" + xh).attr("billId", billId);
                    categoryId = d.CategoryId;
                    nameId = d.NameId;
                    supplierId = d.SupplierId;
                    specificationId = d.SpecificationId;
                    siteId = d.SiteId;
                    $("#conOtherWz" + xh).val(siteId).trigger("change");
                    $("#conOtherLb" + xh).val(categoryId).trigger("change");
                    $("#conOtherDw" + xh).html(d.Unit);
                    $("#consumeOtherNum" + xh).html(d.Number);

                    ////货品名称
                    //var _consumeName = [];
                    selector = "#conOtherMc" + xh;
                    updateConsumeSelect(selector, nameId, _consumeName, "Name", "CategoryId", categoryId);

                    ////供应商
                    //var _consumeSupplier = [];
                    selector = "#conOtherGys" + xh;
                    updateConsumeSelect(selector, supplierId, _consumeSupplier, "Supplier", "NameId", nameId);

                    ////规格型号
                    //var _consumeSpecification = [];
                    selector = "#conOtherGg" + xh;
                    updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);

                    var consumeSiteArray = new Array();
                    for (var i = 0; i < _materialList.length; i++) {
                        var d = _materialList[i];
                        if (d.SpecificationId == specificationId) {
                            if (_consumeSiteDict[d.SiteId])
                                consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                        }
                    }
                    if (consumeSiteArray.length > 0)
                        siteId = consumeSiteArray[0].Id;
                    updateConsumeSelect("#conOtherWz" + xh, siteId, consumeSiteArray, "Site");
                    break;
                }
            }
            $("#conOtherDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
            $("#consumeOtherLog" + xh).attr("onclick", `showLogConsumeModel(${id}, 2)`);
        });

        /////////////////添加option
        ////货品类别
        //var _consumeCategory = [];
        selector = "#conOtherLb" + xh;
        updateConsumeSelect(selector, categoryId, _consumeCategory, "Category");
        $(selector).on('select2:select', function () {
            var billId = 0, categoryId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
            categoryId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            $("#conOtherDw" + xh).html('');
            $("#consumeOtherNum" + xh).html(0);

            ////货品名称
            //var _consumeName = [];
            for (var i = 0; i < _consumeName.length; i++) {
                var d = _consumeName[i];
                if (d.CategoryId == categoryId) {
                    nameId = d.Id;
                    break;
                }
            }
            selector = "#conOtherMc" + xh;
            updateConsumeSelect(selector, nameId, _consumeName, "Name", "CategoryId", categoryId);

            ////供应商
            //var _consumeSupplier = [];
            for (var i = 0; i < _consumeSupplier.length; i++) {
                var d = _consumeSupplier[i];
                if (d.NameId == nameId) {
                    supplierId = d.Id;
                    break;
                }
            }
            selector = "#conOtherGys" + xh;
            updateConsumeSelect(selector, supplierId, _consumeSupplier, "Supplier", "NameId", nameId);

            ////规格型号
            //var _consumeSpecification = [];
            for (var i = 0; i < _consumeSpecification.length; i++) {
                var d = _consumeSpecification[i];
                if (d.SupplierId == supplierId) {
                    specificationId = d.Id;
                    break;
                }
            }
            selector = "#conOtherGg" + xh;
            updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);

            var consumeSiteArray = new Array();
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId) {
                    if (_consumeSiteDict[d.SiteId])
                        consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                }
            }
            if (consumeSiteArray.length > 0)
                siteId = consumeSiteArray[0].Id;
            updateConsumeSelect("#conOtherWz" + xh, siteId, consumeSiteArray, "Site");

            $("#conOther" + xh).attr("billId", 0);
            $("#conOtherBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#conOther" + xh).attr("billId", billId);
                    $("#conOtherBh" + xh).val(billId).trigger("change");
                    $("#conOtherDw" + xh).html(d.Unit);
                    $("#consumeOtherNum" + xh).html(d.Number);
                    break;
                }
            }
            consumeOtherActual();
            $("#conOtherDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
            $("#consumeOtherLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 2)`);
        });

        ////货品名称
        //var _consumeName = [];
        selector = "#conOtherMc" + xh;
        updateConsumeSelect(selector, nameId, _consumeName, "Name", "CategoryId", categoryId);
        $(selector).on('select2:select', function () {
            var billId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
            nameId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");

            $("#conOtherDw" + xh).html('');
            $("#consumeOtherNum" + xh).html(0);

            ////供应商
            //var _consumeSupplier = [];
            for (var i = 0; i < _consumeSupplier.length; i++) {
                var d = _consumeSupplier[i];
                if (d.NameId == nameId) {
                    supplierId = d.Id;
                    break;
                }
            }
            selector = "#conOtherGys" + xh;
            updateConsumeSelect(selector, supplierId, _consumeSupplier, "Supplier", "NameId", nameId);

            ////规格型号
            //var _consumeSpecification = [];
            for (var i = 0; i < _consumeSpecification.length; i++) {
                var d = _consumeSpecification[i];
                if (d.SupplierId == supplierId) {
                    specificationId = d.Id;
                    break;
                }
            }
            selector = "#conOtherGg" + xh;
            updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);

            var consumeSiteArray = new Array();
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId) {
                    if (_consumeSiteDict[d.SiteId])
                        consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                }
            }
            if (consumeSiteArray.length > 0)
                siteId = consumeSiteArray[0].Id;
            updateConsumeSelect("#conOtherWz" + xh, siteId, consumeSiteArray, "Site");
            $("#conOther" + xh).attr("billId", 0);
            $("#conOtherBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#conOther" + xh).attr("billId", billId);
                    $("#conOtherBh" + xh).val(billId).trigger("change");
                    $("#conOtherDw" + xh).html(d.Unit);
                    $("#consumeOtherNum" + xh).html(d.Number);
                    break;
                }
            }
            consumeOtherActual();
            $("#conOtherDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
            $("#consumeOtherLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 2)`);
        });

        ////供应商
        //var _consumeSupplier = [];
        selector = "#conOtherGys" + xh;
        updateConsumeSelect(selector, supplierId, _consumeSupplier, "Supplier", "NameId", nameId);
        $(selector).on('select2:select', function () {
            var billId = 0, supplierId = 0, specificationId = 0, siteId = 0;
            supplierId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");

            $("#conOtherDw" + xh).html('');
            $("#consumeOtherNum" + xh).html(0);

            ////规格型号
            //var _consumeSpecification = [];
            for (var i = 0; i < _consumeSpecification.length; i++) {
                var d = _consumeSpecification[i];
                if (d.SupplierId == supplierId) {
                    specificationId = d.Id;
                    break;
                }
            }
            selector = "#conOtherGg" + xh;
            updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);

            var consumeSiteArray = new Array();
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId) {
                    if (_consumeSiteDict[d.SiteId])
                        consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                }
            }
            if (consumeSiteArray.length > 0)
                siteId = consumeSiteArray[0].Id;
            updateConsumeSelect("#conOtherWz" + xh, siteId, consumeSiteArray, "Site");
            $("#conOther" + xh).attr("billId", 0);
            $("#conOtherBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#conOther" + xh).attr("billId", billId);
                    $("#conOtherBh" + xh).val(billId).trigger("change");
                    $("#conOtherDw" + xh).html(d.Unit);
                    $("#consumeOtherNum" + xh).html(d.Number);
                    break;
                }
            }
            consumeOtherActual();
            $("#conOtherDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
            $("#consumeOtherLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 2)`);
        });

        ////规格型号
        //var _consumeSpecification = [];
        selector = "#conOtherGg" + xh;
        updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);
        $(selector).on('select2:select', function () {
            var billId = 0, specificationId = 0, siteId = 0;
            specificationId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");

            var consumeSiteArray = new Array();
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId) {
                    if (_consumeSiteDict[d.SiteId])
                        consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
                }
            }
            if (consumeSiteArray.length > 0)
                siteId = consumeSiteArray[0].Id;
            updateConsumeSelect("#conOtherWz" + xh, siteId, consumeSiteArray, "Site");
            $("#conOtherDw" + xh).html('');
            $("#consumeOtherNum" + xh).html(0);

            $("#conOther" + xh).attr("billId", 0);
            $("#conOtherBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#conOther" + xh).attr("billId", billId);
                    $("#conOtherBh" + xh).val(billId).trigger("change");
                    $("#conOtherDw" + xh).html(d.Unit);
                    $("#consumeOtherNum" + xh).html(d.Number);
                    break;
                }
            }
            consumeOtherActual();
            $("#conOtherDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
            $("#consumeOtherLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 2)`);
        });

        ////位置
        //var _consumeSite = [];
        selector = "#conOtherWz" + xh;
        var consumeSiteArray = new Array();
        for (var i = 0; i < _materialList.length; i++) {
            var d = _materialList[i];
            if (d.SpecificationId == specificationId) {
                if (_consumeSiteDict[d.SiteId])
                    consumeSiteArray.push(_consumeSiteDict[d.SiteId]);
            }
        }
        if (consumeSiteArray.length > 0)
            siteId = consumeSiteArray[0].Id;
        updateConsumeSelect(selector, siteId, consumeSiteArray, "Site");
        $(selector).on('select2:select', function () {
            var billId = 0, specificationId = 0, siteId = 0;
            siteId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            specificationId = $("#conOtherGg" + xh).val();

            $("#conOtherDw" + xh).html('');
            $("#consumeOtherNum" + xh).html(0);

            $("#conOther" + xh).attr("billId", 0);
            $("#conOtherBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#conOther" + xh).attr("billId", billId);
                    $("#conOtherBh" + xh).val(billId).trigger("change");
                    $("#conOtherDw" + xh).html(d.Unit);
                    $("#consumeOtherNum" + xh).html(d.Number);
                    break;
                }
            }
            consumeOtherActual();
            $("#conOtherDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
            $("#consumeOtherLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 2)`);
        });

        $("#conOther" + xh).find(".ms2").css("width", "100%");
        $("#conOther" + xh).find(".ms2").select2({
            width: "120px"
        });

        $("#conOtherDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
        $("#consumeOtherUpdateNum" + xh).attr("onclick", `consumeOtherUpdateNum(${billId})`);
        $("#consumeOtherLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 2)`);
    }
    $('#consumeOtherTable').scrollTop($('#consumeOtherTable')[0].scrollHeight);
    consumeOtherActual();
    consumeOtherDittoAuto();
}

//领用删除一行
function delConsumeOtherList(id) {
    $("#consumeOtherList").find(`tr[value=${id}]:first`).remove();
    consumeOtherMaxV--;
    var o = 1;
    var child = $("#consumeOtherList tr");
    for (var i = 0; i < child.length; i++) {
        $(child[i]).attr("xh", o);
        var v = $(child[i]).attr("value");
        $("#conOtherXh" + v).html(o);
        o++;
    }
    consumeOtherDittoAuto();
}

//隐藏领用同上
function consumeOtherDittoAuto() {
    $("#consumeOtherList").find('.conOtherDitto').css("visibility", "visible");
    $("#consumeOtherList tr").not(".hidden").first().find('.conOtherDitto').css("visibility", "hidden");
}

//点击领用同上按钮
function consumeOtherDitto(v) {
    var xh1 = $("#consumeOtherList").find(`tr[value=${v}]:first`).attr("xh");
    var xh2 = parseInt(xh1) - 1;
    var id = $("#consumeOtherList").find(`tr[xh=${xh2}]:first`).attr("value");
    var name = $("#consumeOtherLyr" + id).val();
    $("#consumeOtherLyr" + v).val(name);
    consumeOtherActual();
}

//实际领用
function consumeOtherActual() {
    var i;
    var other = $("#consumeOther").val();
    _consumeOtherList = new Array();
    var trs = $("#consumeOtherList tr");
    for (i = 0; i < trs.length; i++) {
        var tr = trs[i];
        var billId = $(tr).attr("billId");
        var v = $(tr).attr("value");
        var num = $("#consumeOtherConsume" + v).val();
        if (isStrEmptyOrUndefined(num)) {
            num = 0;
        }
        var person = $("#consumeOtherLyr" + v).val();
        if (isStrEmptyOrUndefined(person)) {
            person = "";
        }
        var bh = $(`#conOtherBh${v} option:checked`).text();
        var data = {
            Code: bh,
            Purpose: other,
            RelatedPerson: person,
            BillId: billId,
            Number: num,
            Exist: false
        };
        for (var j = 0; j < _materialList.length; j++) {
            var d = _materialList[j];
            if (d.BillId == billId) {
                data.Exist = true;
                data.Code = d.Code;
                data.Category = d.Category;
                data.Name = d.Name;
                data.Supplier = d.Supplier;
                data.Specification = d.Specification;
                data.Site = d.Site;
                break;
            }
        }
        _consumeOtherList.push(data);
    }
}

var isPlan = false;
//显示领用
function consumeShow() {
    $("#consumePurpose").html('');
    isPlan = _consumeType == 0;
    var data = _consumeOtherList;
    var purpose = $("#consumeOther").val();
    if (isPlan) {
        data = _consumePlanList;
        purpose = $("#consumePlanSelect option:checked").text();
    }
    if (isStrEmptyOrUndefined(purpose)) {
        layer.msg("请输入用途");
        return;
    }
    $("#consumePurpose").html(purpose);
    if (data.length <= 0) {
        layer.msg("请添加货品");
        return;
    }

    _consumeActualList = new Array();
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (parseInt(d.BillId) > 0) {
            if (parseFloat(d.Number) > 0) {
                if (!d.Exist) {
                    layer.msg(`货品编号：${d.Code}不存在, 无法领用`);
                    return;
                }
                if (isStrEmptyOrUndefined(d.RelatedPerson)) {
                    layer.msg("请输入领用人");
                    return;
                }
            } else {
                layer.msg("领用数量必须大于0");
                return;
            }
            _consumeActualList.push(d);
        }
    }
    if (_consumeActualList.length <= 0) {
        layer.msg("请添加货品");
        return;
    }

    var o = 0;
    var order = function (data, type, row) {
        return ++o;
    }
    var columns = [
        { "data": null, "title": "序号", "render": order },
        { "data": "Code", "title": "货品编号" },
        { "data": "Category", "title": "货品类别" },
        { "data": "Name", "title": "货品名称" },
        { "data": "Supplier", "title": "供应商" },
        { "data": "Specification", "title": "规格型号" },
        { "data": "Site", "title": "位置" },
        { "data": "Purpose", "title": "用途" },
        { "data": "Number", "title": "领用数量" },
        { "data": "RelatedPerson", "title": "领用人" }
    ];

    $("#consumeConfirmList")
        .DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": _consumeActualList,
            "aaSorting": [[0, "asc"]],
            "aLengthMenu": [40, 80, 120], //更改显示记录数选项  
            "iDisplayLength": 40, //默认显示的记录数
            "columns": columns
        });

    $("#consumeConfirmModal").modal("show");
}

//领用
function consume() {
    var opType = 802;
    var doSth = function () {
        $("#consumeConfirmModal").modal("hide");
        $("#consumeModal").modal("hide");
        var data = {}
        data.opType = opType;
        var opData = {
            Bill: _consumeActualList
        };
        if (isPlan) {
            opData.PlanId = $('#consumePlanSelect').val();
        }
        data.opData = JSON.stringify(opData);

        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getMaterialList('Select');
                }
            });
    }
    showConfirm("领用", doSth);
}

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

    ajaxPost("/Relay/Post", data,
        function (ret) {
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
                    ajaxPost("/Upload/Path",
                        data,
                        function (ret) {
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
                            $('#showDetailModel').modal('show');
                        });
                } else {
                    $('#showDetailModel').modal('show');
                }
            } else {
                layer.msg(ret.errmsg);
            }
        });
}

//生成二维码弹窗
function createQrModal() {
    $('#qrCodeList').empty();
    var categoryFunc = new Promise(function (resolve) {
        categorySelect(resolve);
    });
    var nameFunc = new Promise(function (resolve) {
        nameSelect(resolve, true, 'Qr');
    });
    var supplierFunc = new Promise(function (resolve) {
        supplierSelect(resolve, true, 'Qr');
    });
    var specificationFunc = new Promise(function (resolve) {
        specificationSelect(resolve, true, 'Qr');
    });
    var siteFunc = new Promise(function (resolve) {
        siteSelect(resolve, true);
    });
    Promise.all([categoryFunc, nameFunc, supplierFunc, specificationFunc, siteFunc])
        .then((result) => {
            $('#categoryQr').empty();
            $('#categoryQr').append(result[0]);
            $('#nameQr').empty();
            $('#nameQr').append(result[1]);
            $('#supplierQr').empty();
            $('#supplierQr').append(result[2]);
            $('#specificationQr').empty();
            $('#specificationQr').append(result[3]);
            $('#siteQr').empty();
            $('#siteQr').append(result[4]);
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
            '<span class="glyphicon glyphicon-remove delQrCode" aria-hidden="true" style="position:absolute;right:3px;top:3px;font-size:20px;color:red;cursor:pointer"></span>' +
            '<div style="width: 50%; height: 100%; text-align: center;display:flex;flex-direction:column;justify-content:center;font-size:12px">' +
            '<span style="width:100%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis">{0}</span>' +
            '<span style="width:100%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis">{1}</span>' +
            '<span style="width:100%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis">{2}</span>' +
            '<span style="width:100%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis">{3}</span>' +
            '<span style="width:100%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis">{4}</span>' +
            '<span style="width:100%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis">{5}</span>' +
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
        $('#qrCodeList').empty();
        $('#qrCodeList').append(options);
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

var _reversalTr = null;
//冲正弹窗
function showReversalModel() {
    var opType = 804;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    $("#reversalList").empty();
    var materialListFunc = new Promise(function (resolve, reject) {
        var data = {}
        data.opType = 800;
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            _materialList = ret.datas;
            resolve('success');
        }, 0);
    });

    var categoryFunc = new Promise(function (resolve, reject) {
        var data = {}
        data.opType = 816;
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            _consumeCategory = ret.datas;
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

            _consumeName = ret.datas;
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

            _consumeSupplier = ret.datas;
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

            _consumeSpecification = ret.datas;
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
            _consumeSite = ret.datas;
            _consumeSiteDict = new Array();
            for (var i = 0; i < _consumeSite.length; i++) {
                _consumeSiteDict[_consumeSite[i].Id] = _consumeSite[i];
            }
            resolve('success');
        }, 0);
    });

    Promise.all([materialListFunc, categoryFunc, nameFunc, supplierFunc, specificationFunc, siteFunc])
        .then((result) => {
            $("#addReversalListBtn").removeAttr("disabled");
            var tr = '<tr>' +
                '<td class="num" style="font-weight:bold"></td>' +
                '<td>' +
                '<div class="flexStyle"><span class="iconfont icon-saoyisao scanPrint" style="font-size:30px;cursor:pointer;vertical-align:middle"></span>' +
                '<div style="width:120px;margin:auto"><select class="ms2 form-control code">{0}</select></div></div>' +
                '</td>' +
                '<td><div style="width:120px;margin:auto"><select class="ms2 form-control category">{1}</select></div></td>' +
                '<td><div style="width:120px;margin:auto"><select class="ms2 form-control name">{2}</select></div></td>' +
                '<td><div style="width:120px;margin:auto"><select class="ms2 form-control supplier">{3}</select></div></td>' +
                '<td><div style="width:120px;margin:auto"><select class="ms2 form-control specification">{4}</select></div></td>' +
                '<td><div style="width:120px;margin:auto"><select class="ms2 form-control site">{5}</select></div></td>' +
                '<td><div class="flexStyle" style="justify-content:center">' +
                '<span class="number" style="padding-right:3px">{6}</span><button type="button" class="btn btn-danger btn-xs loadNumber"> <i class="fa fa-refresh"></i></button >' +
                '</div></td>' +
                '<td><input type="text" class="form-control text-center upNumber" value="0" onkeyup="onInput(this, 8, 1)" onblur="onInputEnd(this)" maxlength="10"></td>' +
                '<td class="no-padding"><textarea class="form-control remark" maxlength="500" style="resize: vertical;width:150px;margin:auto"></textarea></td>' +
                '<td><button type="button" class="btn btn-info btn-sm codeModal" onclick="showDetailModel({7})">详情</button></td>' +
                '<td><button type="button" class="btn btn-success btn-sm codeLogModal" onclick="showLogModel(3,{7})">查看</button></td>' +
                '<td><button type="button" class="btn btn-danger btn-sm delPlanTr"><i class="fa fa-minus"></i></button></td>' +
                '</tr>';
            var codeOp = '', categoryOp = '', nameOp = '', supplierOp = '', specificationOp = '', siteOp = '';
            var op = '<option value = "{0}">{1}</option>';
            var i, d, len = _materialList.length;
            var firstCode = _materialList[0];
            for (i = 0; i < len; i++) {
                d = _materialList[i];
                codeOp += op.format(d.Id, d.Code);
                if (d.SpecificationId == firstCode.SpecificationId) {
                    var siteData = _consumeSiteDict[d.SiteId];
                    if (siteData) {
                        siteOp += op.format(siteData.Id, siteData.Site);
                    }
                }
            }
            len = _consumeCategory.length;
            for (i = 0; i < len; i++) {
                d = _consumeCategory[i];
                categoryOp += op.format(d.Id, d.Category);
            }
            len = _consumeName.length;
            for (i = 0; i < len; i++) {
                d = _consumeName[i];
                if (d.CategoryId == firstCode.CategoryId) {
                    nameOp += op.format(d.Id, d.Name);
                }
            }
            len = _consumeSupplier.length;
            for (i = 0; i < len; i++) {
                d = _consumeSupplier[i];
                if (d.NameId == firstCode.NameId) {
                    supplierOp += op.format(d.Id, d.Supplier);
                }
            }
            len = _consumeSpecification.length;
            for (i = 0; i < len; i++) {
                d = _consumeSpecification[i];
                if (d.SupplierId == firstCode.SupplierId) {
                    specificationOp += op.format(d.Id, d.Specification);
                }
            }
            _reversalTr = tr.format(codeOp, categoryOp, nameOp, supplierOp, specificationOp, siteOp, firstCode.Number, firstCode.Id);
        });
    $('#reversalModal').modal('show');
}

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
    for (i = 0; i < len; i++) {
        var tr = trs.eq(i);
        var code = tr.find('.code option:checked').text();
        var codeId = tr.find('.code').val();
        if (isStrEmptyOrUndefined(codeId)) {
            layer.msg('请选择货品编号');
            return;
        }
        var category = tr.find('.category option:checked').text();
        var name = tr.find('.name option:checked').text();
        var supplier = tr.find('.supplier option:checked').text();
        var specification = tr.find('.specification option:checked').text();
        var site = tr.find('.site option:checked').text();
        var number = tr.find('.upNumber').val();
        var remark = tr.find('.remark').val();
        reversalConList.push({ code, category, name, supplier, specification, site, number, remark });
        _reversalConList.push({
            BillId: codeId,
            Number: number,
            Remark: remark,
            RelatedPerson: getCookieTokenInfo().name
        });
    }
    var o = 0;
    var order = function () {
        return ++o;
    }
    var columns = [
        { "data": null, "title": "序号", "render": order },
        { "data": "code", "title": "货品编号" },
        { "data": "category", "title": "货品类别" },
        { "data": "name", "title": "货品名称" },
        { "data": "supplier", "title": "供应商" },
        { "data": "specification", "title": "规格型号" },
        { "data": "site", "title": "位置" },
        { "data": "number", "title": "库存修改" },
        { "data": "remark", "title": "备注" }
    ];

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
            "columns": columns
        });
    $('#reversalConModal').modal('show');
}

var _reversalConList = null;
//冲正
function reversalCon() {
    var opType = 804;
    var doSth = function () {
        var data = {}
        data.opType = opType;
        var opData = {
            Bill: _reversalConList
        };
        data.opData = JSON.stringify(opData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    $("#reversalConModal").modal("hide");
                    $("#reversalModal").modal("hide");
                    getMaterialList('Select');
                }
            });
    }
    showConfirm("冲正", doSth);
}