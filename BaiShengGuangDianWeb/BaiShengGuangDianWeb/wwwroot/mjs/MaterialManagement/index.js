function pageReady() {
    $('.ms2').select2();

    var categoryFunc = new Promise(function (resolve, reject) {
        categorySelect(resolve);
    });
    var nameFunc = new Promise(function (resolve, reject) {
        nameSelect(resolve, true);
    });
    var supplierFunc = new Promise(function (resolve, reject) {
        supplierSelect(resolve, true);
    });
    var specificationFunc = new Promise(function (resolve, reject) {
        specificationSelect(resolve, true);
    });
    Promise.all([categoryFunc, nameFunc, supplierFunc, specificationFunc])
        .then((result) => {
            //console.log('准备工作完毕');
            //console.log(result);
            getMaterialList();
        });

    $('#categorySelect').on('select2:select', function () {
        var nameFunc = new Promise(function (resolve, reject) {
            nameSelect(resolve);
        });
        var supplierFunc = new Promise(function (resolve, reject) {
            supplierSelect(resolve);
        });
        var specificationFunc = new Promise(function (resolve, reject) {
            specificationSelect(resolve);
        });
        Promise.all([nameFunc, supplierFunc, specificationFunc])
            .then((result) => {
                //console.log('准备工作完毕');
                //console.log(result);
                getMaterialList();
            });
    });
    $('#nameSelect').on('select2:select', function () {
        var supplierFunc = new Promise(function (resolve, reject) {
            supplierSelect(resolve);
        });
        var specificationFunc = new Promise(function (resolve, reject) {
            specificationSelect(resolve);
        });
        Promise.all([supplierFunc, specificationFunc])
            .then((result) => {
                //console.log('准备工作完毕');
                //console.log(result);
                getMaterialList();
            });
    });
    $('#supplierSelect').on('select2:select', function () {
        var specificationFunc = new Promise(function (resolve, reject) {
            specificationSelect(resolve);
        });
        Promise.all([specificationFunc])
            .then((result) => {
                //console.log('准备工作完毕');
                //console.log(result);
                getMaterialList();
            });
    });
    $('#specificationSelect').on('select2:select', function () {
        getMaterialList();
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
    $("#logStartDate").datepicker('update').on('changeDate', function (ev) {
        getLogList();
    });

    $("#logEndDate").val(getDate());
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
    $("#logConsumeStartDate").datepicker('update').on('changeDate', function (ev) {
        getLogConsumeList();
    });

    $("#logConsumeEndDate").val(getDate());
    $("#logConsumeEndDate").datepicker('update').on('changeDate', function (ev) {
        getLogConsumeList();
    });
}

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
        if (resolve != null)
            resolve('success');

        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#categorySelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Category);
        }
        $('#categorySelect').append(option.format(0, '所有类别'));
        $('#categorySelect').append(options);
    });
}

//名称选项
function nameSelect(resolve, first = false) {
    var opType = 824;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var list = {};
    if (!first) {
        var categoryId = $('#categorySelect').val();
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
        if (resolve != null)
            resolve('success');
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#nameSelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Name);
        }
        $('#nameSelect').append(option.format(0, '所有名称'));
        $('#nameSelect').append(options);
    });
}

//供应商选项
function supplierSelect(resolve, first = false) {
    var opType = 831;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var list = {};
    if (!first) {
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
    }

    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost('/Relay/Post', data, function (ret) {
        if (resolve != null)
            resolve('success');
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#supplierSelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Supplier);
        }
        $('#supplierSelect').append(option.format(0, '所有供应商'));
        $('#supplierSelect').append(options);
    });
}

//规格选项
function specificationSelect(resolve, first = false) {
    var opType = 839;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var list = {};
    if (!first) {
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
        if (resolve != null)
            resolve('success');
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#specificationSelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Name);
        }
        $('#specificationSelect').append(option.format(0, '所有规格'));
        $('#specificationSelect').append(options);
    });
}

//获取物料信息
function getMaterialList() {
    var opType = 800;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
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
        layer.msg('请选择供应商名称');
        return;
    }
    if (supplierId != 0) {
        list.supplierId = supplierId;
    }

    var specificationId = $('#specificationSelect').val();
    if (isStrEmptyOrUndefined(specificationId)) {
        layer.msg('请选择规格名称');
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
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": { "url": "/content/datatables_language.json" },
                "data": ret.datas,
                "aaSorting": [[0, "asc"]],
                "aLengthMenu": [50, 100, 150, 200], //更改显示记录数选项  
                "iDisplayLength": 50, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Code", "title": "货品编号" },
                    { "data": "Category", "title": "类别" },
                    { "data": "Name", "title": "名称" },
                    { "data": "Supplier", "title": "供应商" },
                    { "data": "Specification", "title": "规格" },
                    { "data": "Site", "title": "位置" },
                    { "data": "Unit", "title": "单位" },
                    { "data": "Id", "title": "详情", "render": detail },
                    { "data": "Price", "title": "价格" },
                    { "data": "Stock", "title": "最低库存", "sClass": "text-blue" },
                    { "data": null, "title": "库存数量", "render": number },
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
                return data == 1 ? `<span class="text-success">入库</span>` : `<span class="text-danger">领用</span>`;
            }
            var number = function (data, type, row) {
                //状态 1 入库; 2 出库;
                return data.Type == 1 ? `<span class="text-success">${data.Number}</span>` : `<span class="text-danger">${data.Number}</span>`;
            }

            var columns = null;
            switch (_type) {
                case 0:
                    columns = [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "Time", "title": "时间" },
                        { "data": "Code", "title": "货品编号" },
                        { "data": "Type", "title": "入/出", "render": dType },
                        { "data": null, "title": "数量", "render": number },
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
                        { "data": null, "title": "数量", "render": number },
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
                        { "data": null, "title": "数量", "render": number },
                        { "data": "Purpose", "title": "货品用途" },
                        { "data": "RelatedPerson", "title": "领用人" },
                        { "data": "Manager", "title": "物管员" },
                        { "data": null, "title": "Id", "bVisible": false }
                    ];
                    break;
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

    var option = '<option value = "{0}">{1}</option>';
    var options;
    if (purpose == 1) {
        $('#logConsumePlanSelect').empty();
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
            options += option.format(d.Id, d.Code);
            if (id == d.Id) {
                $('#billInfoConsume').removeClass('hidden');
                $('#logConsumeCategory').html(d.Category);
                $('#logConsumeName').html(d.Name);
                $('#logConsumeSupplier').html(d.Supplier);
                $('#logConsumeSpecification').html(d.Specification);
                $('#logConsumePrice').html(d.Price);
            }
        }
        $('#logConsumeBillSelect').append(option.format(0, '所有编号'));
        $('#logConsumeBillSelect').append(options);
        $("#logConsumeBillSelect").val(id).trigger("change");
    }
    else if (purpose == 2) {
        $('#logConsumeBillSelect').empty();
        options = '';
        for (var i = 0; i < _materialList.length; i++) {
            var d = _materialList[i];
            options += option.format(d.Id, d.Code);
            if (id == d.Id) {
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
    if ($('#logConsumePlanSelectDiv').attr("hidden") && isStrEmptyOrUndefined(planId)) {
        layer.msg('请选择计划号');
        return;
    } else {
        if (planId != 0) {
            list.planId = planId;
        }
    }
    var billId = $('#logConsumeBillSelect').val();
    if (isStrEmptyOrUndefined(billId)) {
        layer.msg('请选择货品编号');
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
                    { "data": "Number", "title": "数量" },
                    { "data": "RelatedPerson", "title": "领用人" },
                    { "data": "Manager", "title": "物管员" }
                ];
            }

            $("#logConsumeList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
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

    var data = {}
    data.opType = 800;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }

        _materialList = ret.datas;
        $("#increaseModal").modal("show");
    });
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
        ('<tr value="{0}" xh="{1}">' +
            '    <td style="vertical-align: inherit;"" id="inXh{0}">{1}</td>' +
            '    <td>' +
            '    <select class="ms2 form-control" id="inBh{0}"></select>' +
            '    </td>' +
            '    <td>' +
            '    <select class="form-control" id="inLy{0}">' +
            '    <option>采购</option>' +
            '    <option>退回</option>' +
            '    </select>' +
            '    </td>' +
            '    <td style="vertical-align: inherit;"><label class="control-label" id="inLb{0}"></label></td>' +
            '    <td style="vertical-align: inherit;"><label class="control-label" id="inMc{0}"></label></td>' +
            '    <td style="vertical-align: inherit;"><label class="control-label" id="inGys{0}"></label></td>' +
            '    <td style="vertical-align: inherit;"><label class="control-label" id="inGg{0}"></label></td>' +
            '    <td style="vertical-align: inherit;"><label class="control-label" id="inWz{0}"></label></td>' +
            '    <td style="vertical-align: inherit;"><label class="control-label" id="inDw{0}"></label></td>' +
            '    <td style="vertical-align: inherit;"><label class="control-label" id="inJg{0}"></label></td>' +
            '    <td style="vertical-align: inherit;"><label class="control-label" id="inKc{0}"></label></td>' +
            '    <td><button class="btn btn-info btn-sm" type="button" onclick="inDetail({0})">详情</button></td>' +
            '    <td><input class="form-control text-center" type="tel" id="inRk{0}" value="0" onkeyup="onInput(this)" onblur="onInputEnd(this)" maxlength="10"></td>' +
            '    <td class="form-inline">' +
            '       <input class="form-control text-center" id="inCg{0}" maxlength="64" />' +
            '       <button class="btn btn-primary btn-sm pull-right" type="button" id="inDitto{0}" onclick="inDitto({0})">同上</button>' +
            '    </td>' +
            '    <td><button type="button" class="btn btn-danger btn-sm" onclick="delIncreaseList({0})"><i class="fa fa-minus"></i></button></td>' +
            '</tr>').format(increaseMax, increaseMaxV);
    $("#increaseList").append(tr);

    if (_materialList != null) {
        var selector = "#inBh" + increaseMax;
        $(selector).empty();
        var option = '<option value="{0}">{1}</option>';
        for (var i = 0; i < _materialList.length; i++) {
            var d = _materialList[i];
            $(selector).append(option.format(d.Id, d.Code));
            if (i == 0) {
                $("#inLb" + increaseMax).html(d.Category);
                $("#inMc" + increaseMax).html(d.Name);
                $("#inGys" + increaseMax).html(d.Supplier);
                $("#inGg" + increaseMax).html(d.Specification);
                $("#inWz" + increaseMax).html(d.Site);
                $("#inDw" + increaseMax).html(d.Unit);
                $("#inJg" + increaseMax).html(d.Price);
                $("#inKc" + increaseMax).html(d.Number);
                $("#inRk" + increaseMax).val(0);
            }
        }
        $(selector).css("width", "100%");
        $(selector).select2();

        $('#inBh' + increaseMax).on('select2:select', function () {
            var id = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            var i, len = _materialList.length;
            for (i = 0; i < len; i++) {
                var d = _materialList[i];
                if (id == d.Id) {
                    $("#inLb" + xh).html(d.Category);
                    $("#inMc" + xh).html(d.Name);
                    $("#inGys" + xh).html(d.Supplier);
                    $("#inGg" + xh).html(d.Specification);
                    $("#inDw" + xh).html(d.Unit);
                    $("#inJg" + xh).html(d.Price);
                    $("#inKc" + xh).html(d.Number);
                }
            }
        });
    }

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
            var inBh = $("#inBh" + i).val();
            var inLy = $("#inLy" + i).val();
            var inRk = $("#inRk" + i).val();
            var inCg = $("#inCg" + i).val();

            if (isStrEmptyOrUndefined(inBh)) {
                layer.msg("货品编号不能为空");
                return;
            }
            if (isStrEmptyOrUndefined(inRk)) {
                layer.msg($(`#inXh${i}`).html() + ". " + $(`#inBh${i} option:checked`).text() + ": 入库数量不能为空");
                return;
            }
            if (parseInt(inRk) <= 0) {
                layer.msg($(`#inXh${i}`).html() + ". " + $(`#inBh${i} option:checked`).text() + ": 入库数量需大于0");
                return;
            }
            if (isStrEmptyOrUndefined(inCg)) {
                layer.msg("采购/退回人不能为空");
                return;
            }

            bill.push({
                BillId: inBh,
                Purpose: inLy,
                Number: inRk,
                RelatedPerson: inCg
            });
        }
    }
    if (bill.length <= 0) {
        layer.msg("请输入货品");
        return;
    }
    var doSth = function () {
        $("#increaseModal").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            Bill: bill
        });

        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getMaterialList();
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
function showPlanBill(find = false) {
    var planId = $('#consumePlanSelect').val();
    if (find) {
        var con = $("#consumePlanCondition").val();
        var con1 = "", con2 = "0";
        if (!isStrEmptyOrUndefined(con)) {
            con1 = $("#consumePlanCondition1").val();
            var id = "";
            switch (con1) {
            case "Code":
                id = "conPlanBh";
                break;
            case "Category":
                id = "conPlanLb";
                break;
            case "Name":
                id = "conPlanMc";
                break;
            case "Supplier":
                id = "conPlanGys";
                break;
            case "Specification":
                id = "conPlanGg";
                break;
            default:
                return;
            }
            con2 = $("#consumePlanCondition2").val();
            var trs = $("#consumePlanList tr");
            for (i = 0; i < trs.length; i++) {
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
            $("#consumePlanList tr").removeClass("hidden");
        }
    } else {
        var data = _consumePlanBill;
        $("#consumePlanList").empty();
        if (data.length > 0) {
            var trs = "";
            for (var j = 0; j < data.length; j++) {
                var xh = j + 1;
                var d = data[j];
                var tr = `
                <tr id="conPlan${xh}" value="${xh}" xh="${xh}" billId="${d.BillId}">
                    <td style="vertical-align: inherit;">${xh}</td>
                    <td style="vertical-align: inherit;" id="conPlanBh${xh}" ${(d.Extra ? 'class="text-red"' : '')}>${d.Code}</td>
                    <td style="vertical-align: inherit;" id="conPlanLb${xh}">${d.Category}</td>
                    <td style="vertical-align: inherit;" id="conPlanMc${xh}">${d.Name}</td>
                    <td style="vertical-align: inherit;" id="conPlanGys${xh}">${d.Supplier}</td>
                    <td style="vertical-align: inherit;" id="conPlanGg${xh}">${d.Specification}</td>
                    <td style="vertical-align: inherit;" id="conPlanWz${xh}">${d.Site}</td>
                    <td style="vertical-align: inherit;">${d.Unit}</td>
                    <td>
                        <button type="button" class="btn btn-info btn-sm" onclick="showDetailModel(${d.BillId})">详情</button>
                    </td>
                    <td style="vertical-align: inherit;">${d.PlannedConsumption}</td>
                    <td style="vertical-align: inherit;">${d.ActualConsumption}</td>
                    <td style="vertical-align: inherit;" class="form-inline">
                        <span id="conPlanNum${xh}">${d.Number}</span>
                        <button type="button" class="btn btn-danger btn-xs pull-right" onclick="consumePlanUpdateNum(${d.BillId})"><i class="fa fa-refresh"></i></button>
                    </td>
                    <td>
                        <input class="form-control text-center" type="tel" id="conPlanConsume${xh}" value="0" onkeyup="onInput(this)" onblur="onInputEnd(this)" onchange="consumePlanActual()" maxlength="10">
                    </td>
                    <td class="form-inline">
                        <input class="form-control text-center" id="conPlanLyr${xh}" maxlength="64" onchange="consumePlanActual()" />
                        <button class="btn btn-primary btn-sm" ${(j == 0 ? 'style="opacity: 0;"' : '')} type="button" id="consumePlanDitto${xh}" onclick="consumePlanDitto(${xh})">同上</button>
                    </td>
                    <td>
                        <button type="button" class="btn btn-success btn-sm" onclick="showLogConsumeModel(${d.BillId}, 1, ${planId})">查看</button>
                    </td>
                    <td>
                        <button type="button" class="btn btn-danger btn-sm hidden" id="delConsumePlanList${xh}" onclick="delConsumePlanList(${xh})"><i class="fa fa-minus"></i></button>
                    </td>
                </tr>`;
                trs += tr;
            }
            $("#consumePlanList").append(trs);
            consumePlanMax = _consumePlanBill.length;
            consumePlanMaxV = _consumePlanBill.length;
        }
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
    //consumePlanList
    consumePlanMax++;
    consumePlanMaxV++;
    var xh = addConsumePlanFrom = consumePlanMax;
    var tr = `
        <tr id="conPlan${xh}" value="${xh}" xh="${consumePlanMaxV}" class="new">
            <td style="vertical-align: inherit;"><span class="control-label xh" id="conPlanXh${xh}">${consumePlanMaxV}</span></td>
            <td><select class="ms2 form-control" id="conPlanBh${xh}"></select></td>
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
                <input class="form-control text-center" id="conPlanConsume${xh}" value="0" onkeyup="onInput(this)" onblur="onInputEnd(this)" onchange="consumePlanActual()" maxlength="10">
            </td>
            <td class="form-inline">
                <input class="form-control text-center" type="tel" id="conPlanLyr${xh}" maxlength="64" onchange="consumePlanActual()" />
                <button class="btn btn-primary btn-sm" ${(xh == 1 ? 'style="opacity: 0;"' : '')} type="button" id="consumePlanDitto${xh}" onclick="consumePlanDitto(${xh})">同上</button>
            </td>
            <td>
                <button type="button" class="btn btn-success btn-sm" id="conPlanLog${xh}" onclick="showLogConsumeModel(2, 0)">查看</button>
            </td>
            <td>
                <button type="button" class="btn btn-danger btn-sm ${(xh == 1 ? " hidden" : "")}" id="delConsumePlanList${xh}" onclick="delConsumePlanList(${xh})"><i class="fa fa-minus"></i></button>
            </td>
        </tr>`;

    $("#consumePlanList").append(tr);

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
                    for (var j = 0; j < _consumePlanBill.length; j++) {
                        var bill = _consumePlanBill[j];
                        if (bill.BillId == billId) {
                            $("#conPlanJh" + xh).html(bill.PlannedConsumption);
                            $("#conPlanSj" + xh).html(bill.ActualConsumption);
                            break;
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

                    break;
                }
            }
            consumePlanActual();
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
        });

        ////位置
        //var _consumeSite = [];
        selector = "#conPlanWz" + xh;
        updateConsumeSelect(selector, siteId, _consumeSite, "Site");
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
        });

        $("#conPlan" + xh).find(".ms2").css("width", "100%");
        $("#conPlan" + xh).find(".ms2").select2();

        $("#conPlanDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
        $("#conPlanUpdateNum" + xh).attr("onclick", `consumePlanUpdateNum(${billId})`);
        var planId = $('#consumePlanSelect').val();
        $("#conPlanLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 1, ${planId})`);

    }

    consumePlanDittoAuto();
}

function updateConsumeSelect(ele, id, res, field, parentField = "", parentId = -1) {
    $(ele).empty();
    for (var i = 0; i < res.length; i++) {
        var d = res[i];
        if (parentId != -1) {
            if (parentId != 0) {
                if (d[parentField] == parentId) {
                    $(ele).append(`<option value="${d.Id}">${d[field]}</option>`);
                }
            }
        } else {
            $(ele).append(`<option value="${d.Id}">${d[field]}</option>`);
        }
    }

    if (id != 0) {
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
    var v = $("#consumePlanList").find(`tr[xh=1]:first`).attr("value");
    $("#consumePlanDitto" + v).css("opacity", "0");
}

//点击领用同上按钮
function consumePlanDitto(v) {
    var xh1 = $("#consumePlanList").find(`tr[value=${v}]:first`).attr("xh");
    var xh2 = parseInt(xh1) - 1;
    var id = $("#consumePlanList").find(`tr[xh=${xh2}]:first`).attr("value");
    var name = $("#conPlanLyr" + id).val();
    $("#conPlanLyr" + v).val(name);
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
            <td><select class="ms2 form-control" id="conOtherBh${xh}"></select></td>
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
                <input class="form-control text-center" id="consumeOtherConsume${xh}" value="0" onkeyup="onInput(this)" onblur="onInputEnd(this)" onchange="consumeOtherActual()" maxlength="10">
            </td>
            <td class="form-inline">
                <input class="form-control text-center" type="tel" id="consumeOtherLyr${xh}" maxlength="64" onchange="consumeOtherActual()" />
                <button class="btn btn-primary btn-sm" ${(xh == 1 ? 'style="opacity: 0;"' : '')} type="button" id="consumeOtherDitto${xh}" onclick="consumeOtherDitto(${xh})">同上</button>
            </td>
            <td>
                <button type="button" class="btn btn-success btn-sm" id="consumeOtherLog${xh}" onclick="showLogConsumeModel(2, 0)">查看</button>
            </td>
            <td>
                <button type="button" class="btn btn-danger btn-sm" id="delConsumeOtherList${xh}" onclick="delConsumeOtherList(${xh})"><i class="fa fa-minus"></i></button>
            </td>
        </tr>`;

    $("#consumeOtherList").append(tr);

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
            $("#conOtherNum" + xh).html(0);
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
                    $("#conOtherJh" + xh).html(0);
                    $("#conOtherSj" + xh).html(0);
                    for (var j = 0; j < _consumePlanBill.length; j++) {
                        var bill = _consumePlanBill[j];
                        if (bill.BillId == billId) {
                            $("#conOtherJh" + xh).html(bill.PlannedConsumption);
                            $("#conOtherSj" + xh).html(bill.ActualConsumption);
                            break;
                        }
                    }
                    $("#conOtherNum" + xh).html(d.Number);

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

                    break;
                }
            }
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
            siteId = $("#conOtherWz" + xh).val();
            $("#conOtherDw" + xh).html('');
            $("#conOtherNum" + xh).html(0);

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

            $("#conOther" + xh).attr("billId", 0);
            $("#conOtherBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#conOther" + xh).attr("billId", billId);
                    $("#conOtherBh" + xh).val(billId).trigger("change");
                    $("#conOtherDw" + xh).html(d.Unit);
                    $("#conOtherJh" + xh).html(0);
                    $("#conOtherSj" + xh).html(0);
                    for (var j = 0; j < _consumePlanBill.length; j++) {
                        var bill = _consumePlanBill[j];
                        if (bill.BillId == billId) {
                            $("#conOtherJh" + xh).html(bill.PlannedConsumption);
                            $("#conOtherSj" + xh).html(bill.ActualConsumption);
                            break;
                        }
                    }
                    $("#conOtherNum" + xh).html(d.Number);
                    break;
                }
            }
            consumeOtherActual();
        });

        ////货品名称
        //var _consumeName = [];
        selector = "#conOtherMc" + xh;
        updateConsumeSelect(selector, nameId, _consumeName, "Name", "CategoryId", categoryId);
        $(selector).on('select2:select', function () {
            var billId = 0, nameId = 0, supplierId = 0, specificationId = 0, siteId = 0;
            nameId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            siteId = $("#conOtherWz" + xh).val();

            $("#conOtherDw" + xh).html('');
            $("#conOtherNum" + xh).html(0);

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

            $("#conOther" + xh).attr("billId", 0);
            $("#conOtherBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#conOther" + xh).attr("billId", billId);
                    $("#conOtherBh" + xh).val(billId).trigger("change");
                    $("#conOtherDw" + xh).html(d.Unit);
                    $("#conOtherJh" + xh).html(0);
                    $("#conOtherSj" + xh).html(0);
                    for (var j = 0; j < _consumePlanBill.length; j++) {
                        var bill = _consumePlanBill[j];
                        if (bill.BillId == billId) {
                            $("#conOtherJh" + xh).html(bill.PlannedConsumption);
                            $("#conOtherSj" + xh).html(bill.ActualConsumption);
                            break;
                        }
                    }
                    $("#conOtherNum" + xh).html(d.Number);
                    break;
                }
            }
            consumeOtherActual();
        });

        ////供应商
        //var _consumeSupplier = [];
        selector = "#conOtherGys" + xh;
        updateConsumeSelect(selector, supplierId, _consumeSupplier, "Supplier", "NameId", nameId);
        $(selector).on('select2:select', function () {
            var billId = 0, supplierId = 0, specificationId = 0, siteId = 0;
            supplierId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            siteId = $("#conOtherWz" + xh).val();

            $("#conOtherDw" + xh).html('');
            $("#conOtherNum" + xh).html(0);

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

            $("#conOther" + xh).attr("billId", 0);
            $("#conOtherBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#conOther" + xh).attr("billId", billId);
                    $("#conOtherBh" + xh).val(billId).trigger("change");
                    $("#conOtherDw" + xh).html(d.Unit);
                    $("#conOtherJh" + xh).html(0);
                    $("#conOtherSj" + xh).html(0);
                    for (var j = 0; j < _consumePlanBill.length; j++) {
                        var bill = _consumePlanBill[j];
                        if (bill.BillId == billId) {
                            $("#conOtherJh" + xh).html(bill.PlannedConsumption);
                            $("#conOtherSj" + xh).html(bill.ActualConsumption);
                            break;
                        }
                    }
                    $("#conOtherNum" + xh).html(d.Number);
                    break;
                }
            }
            consumeOtherActual();
        });

        ////规格型号
        //var _consumeSpecification = [];
        selector = "#conOtherGg" + xh;
        updateConsumeSelect(selector, specificationId, _consumeSpecification, "Specification", "SupplierId", supplierId);
        $(selector).on('select2:select', function () {
            var billId = 0, specificationId = 0, siteId = 0;
            specificationId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            siteId = $("#conOtherWz" + xh).val();

            $("#conOtherDw" + xh).html('');
            $("#conOtherNum" + xh).html(0);

            $("#conOther" + xh).attr("billId", 0);
            $("#conOtherBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#conOther" + xh).attr("billId", billId);
                    $("#conOtherBh" + xh).val(billId).trigger("change");
                    $("#conOtherDw" + xh).html(d.Unit);
                    $("#conOtherJh" + xh).html(0);
                    $("#conOtherSj" + xh).html(0);
                    for (var j = 0; j < _consumePlanBill.length; j++) {
                        var bill = _consumePlanBill[j];
                        if (bill.BillId == billId) {
                            $("#conOtherJh" + xh).html(bill.PlannedConsumption);
                            $("#conOtherSj" + xh).html(bill.ActualConsumption);
                            break;
                        }
                    }
                    $("#conOtherNum" + xh).html(d.Number);
                    break;
                }
            }
            consumeOtherActual();
        });

        ////位置
        //var _consumeSite = [];
        selector = "#conOtherWz" + xh;
        updateConsumeSelect(selector, siteId, _consumeSite, "Site");
        $(selector).on('select2:select', function () {
            var billId = 0, specificationId = 0, siteId = 0;
            siteId = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            specificationId = $("#conOtherGg" + xh).val();

            $("#conOtherDw" + xh).html('');
            $("#conOtherNum" + xh).html(0);

            $("#conOther" + xh).attr("billId", 0);
            $("#conOtherBh" + xh).val(0).trigger("change");
            for (var i = 0; i < _materialList.length; i++) {
                var d = _materialList[i];
                if (d.SpecificationId == specificationId && d.SiteId == siteId) {
                    billId = d.BillId;
                    $("#conOther" + xh).attr("billId", billId);
                    $("#conOtherBh" + xh).val(billId).trigger("change");
                    $("#conOtherDw" + xh).html(d.Unit);
                    $("#conOtherJh" + xh).html(0);
                    $("#conOtherSj" + xh).html(0);
                    for (var j = 0; j < _consumePlanBill.length; j++) {
                        var bill = _consumePlanBill[j];
                        if (bill.BillId == billId) {
                            $("#conOtherJh" + xh).html(bill.PlannedConsumption);
                            $("#conOtherSj" + xh).html(bill.ActualConsumption);
                            break;
                        }
                    }
                    $("#conOtherNum" + xh).html(d.Number);
                    break;
                }
            }
            consumeOtherActual();
        });

        $("#conOther" + xh).find(".ms2").css("width", "100%");
        $("#conOther" + xh).find(".ms2").select2();

        $("#conOtherDetail" + xh).attr("onclick", `showDetailModel(${billId})`);
        $("#consumeOtherUpdateNum" + xh).attr("onclick", `consumeOtherUpdateNum(${billId})`);
        $("#consumeOtherLog" + xh).attr("onclick", `showLogConsumeModel(${billId}, 2)`);
    }

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
    var v = $("#consumeOtherList").find(`tr[xh=1]:first`).attr("value");
    $("#consumeOtherDitto" + v).css("opacity", "0");
}

//点击领用同上按钮
function consumeOtherDitto(v) {
    var xh1 = $("#consumeOtherList").find(`tr[value=${v}]:first`).attr("xh");
    var xh2 = parseInt(xh1) - 1;
    var id = $("#consumeOtherList").find(`tr[xh=${xh2}]:first`).attr("value");
    var name = $("#consumeOtherLyr" + id).val();
    $("#consumeOtherLyr" + v).val(name);
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
        layer.msg("请选择货品");
        return;
    }

    _consumeActualList = new Array();
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (d.BillId > 0 && d.Number > 0) {
            if (!d.Exist) {
                layer.msg(`货品编号：${d.Code}不存在, 无法领用`);
                return;
            }
            if (isStrEmptyOrUndefined(d.RelatedPerson)) {
                layer.msg("请输入领用人");
                return;
            }
            if (isStrEmptyOrUndefined(d.RelatedPerson)) {
                layer.msg("请输入领用人");
                return;
            }
            _consumeActualList.push(d);
        }
    }
    if (_consumeActualList.length <= 0) {
        layer.msg("请选择货品");
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
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": { "url": "/content/datatables_language.json" },
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
                    getMaterialList();
                }
            });
    }
    showConfirm("领用", doSth);
}

