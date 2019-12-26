function pageReady() {
    $(".ms2").select2();
    getSpotPlan();
    $('#spotPlanSelect').on('select2:select', function () {
        _planId = $(this).val();
        getSpotCheckList();
    });
    $('#addSpotPlanBody').on('click', '.delSpotCheckTr', function () {
        _spotCheckCount--;
        var tr = $(this).parents('tr');
        tr.remove();
        if (_spotCheckCount) {
            setTableTrCount($("#addSpotPlanBody"), _spotCheckCount);
        } else {
            $('#addSpotPlanCheckBtn').removeClass('hidden');
            $('#addSpotPlanCheckTable').addClass('hidden');
        }
    });
    $('#addSpotPlanBody').on('click', '.addSpotCheckTr', function () {
        _spotCheckCount++;
        var tr = $(this).parents('tr');
        var spotCheckTr = setSpotCheckOption(_spotCheckCount);
        tr.after(spotCheckTr);
        $('#addSpotPlanBody').find('.radio1').iCheck('check');
        setTableStyle($("#addSpotPlanBody"));
        setTableTrCount($("#addSpotPlanBody"), _spotCheckCount);
    });
    $('#addSpotPlanBody').on('ifChecked', '.radioSelect', function () {
        var td = $(this).parents('td');
        setStatus(td);
    });
    $('#addSpotPlanBody, #spotCheckList').on('focusin', '.numVal', function () {
        var v = $(this).val();
        if (v == 0) {
            $(this).val("");
        }
    });
    $('#addSpotPlanBody, #spotCheckList').on('focusout', '.numVal', function () {
        var v = $(this).val();
        if (isStrEmptyOrUndefined(v)) {
            $(this).val("0");
        }
    });
    $('#addSpotPlanCheckBtn').on('click', function() {
        $(this).addClass('hidden');
        $('#addSpotPlanCheckTable').removeClass('hidden');
        setOneSpotPlanCheckTr();
    });
}

var _planId = null;
//获取点检计划
function getSpotPlan() {
    var opType = 600;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('.spotPlanSelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value="{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Plan);
        }
        $('.spotPlanSelect').append(options);
        if (_planId) {
            $('#spotPlanSelect').val(_planId).trigger("change");
            return;
        }
        getSpotCheckList();
    });
}

//提醒间隔选项
function remindIntervalOption() {
    var op = '<div style="display:flex;justify-content:center;align-items:center">' +
        '<input type="radio" class="icb_minimal radio1 radioSelect icb_check" name="{2}">' +
        '<span>设置1：</span>' +
        '<input class="form-control numTime radioOp1 numVal" maxlength="2" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:50px" value="0">' +
        '<select class="form-control timeSelect radioOp1" style="width:60px"><option value="0">日</option><option value="1">月</option></select>' +
        '<select class="form-control normalHour radioOp1" style="width:80px">{0}</select></div>' +
        '<div style="display:flex;justify-content:center;align-items:center">' +
        '<input type="radio" class="icb_minimal radio2 radioSelect icb_check" name="{2}">' +
        '<span>设置2：</span>' +
        '<select class="form-control weekSelect radioOp2" style="width:110px">{1}</select>' +
        '<select class="form-control weekHour radioOp2" style="width:80px">{0}</select></div>';
    var weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    var i, hours = 24;
    var option = '<option value="{0}">{1}</option>';
    var weekOp = '';
    var hourOp = '';
    for (i = 0; i < hours; i++) {
        hourOp += option.format(i, `${i}:00`);
        if (weeks[i]) {
            weekOp += option.format(i, weeks[i]);
        }
    }
    return { weekOp: weekOp, hourOp: hourOp, op: op };
}

//获取已添加检点项列表
function getSpotCheckList() {
    _spotCheckIdData = [];
    _spotCheckNameData = [];
    var opType = 607;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    _planId = $('#spotPlanSelect').val();
    var data = {};
    data.opType = opType;
    data.opData = JSON.stringify({
        id: _planId
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var isEnable = function (data) {
            return `<input type="checkbox" class="icb_minimal isEnable" value=${data}>`;
        }
        var item = function (data) {
            return `<input type="text" class="form-control text-center textIn item" maxlength="10" value=${data} style="width:100px">`;
        };
        var using = function () {
            return '<input type="checkbox" class="icb_minimal using icb_check">';
        }
        var remind = function () {
            return '<input type="checkbox" class="icb_minimal remind icb_check">';
        }
        var min = function (data) {
            return `<input type="text" class="form-control text-center textIn min numVal" maxlength="10" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:80px" value=${data}>`;
        };
        var max = function (data) {
            return `<input type="text" class="form-control text-center textIn max numVal" maxlength="10" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:80px" value=${data}>`;
        };
        var unit = function (data) {
            return `<input type="text" class="form-control text-center textIn unit" maxlength="5" style="width:80px" value=${data}>`;
        };
        var reference = function (data) {
            return `<textarea class="form-control textIn reference" maxlength="500" style="resize: vertical;width:180px">${data}</textarea>`;
        };
        var remarks = function (data) {
            return `<textarea class="form-control textIn remarks" maxlength="500" style="resize: vertical;width:180px">${data}</textarea>`;
        };
        var op = remindIntervalOption();
        var o = 0;
        var remindInterval = function () {
            o++;
            return op.op.format(op.hourOp, op.weekOp, `spotCheck${o}`);
        }
        $("#spotCheckList")
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
                    { "data": "Id", "title": "  ", "render": isEnable },
                    { "data": "Item", "title": "名称", "render": item },
                    { "data": "Enable", "title": "启用", "render": using },
                    { "data": "Remind", "title": "提醒", "render": remind },
                    { "data": "Min", "title": "下限", "render": min },
                    { "data": "Max", "title": "上限", "render": max },
                    { "data": "Unit", "title": "单位", "render": unit },
                    { "data": "Reference", "title": "参考标准", "render": reference },
                    { "data": "Remarks", "title": "备注", "render": remarks },
                    { "data": "Interval", "title": "提醒间隔", "render": remindInterval }
                ],
                "columnDefs": [
                    { "orderable": false, "targets": 0 }
                ],
                "createdRow": function (row, data, index) {
                    _spotCheckBodyRow = 0;
                    _spotCheckBodyRow++;
                    data.Enable ? $(row).find('.using').iCheck('check') : $(row).find('.using').iCheck('uncheck');
                    data.Remind ? $(row).find('.remind').iCheck('check') : $(row).find('.remind').iCheck('uncheck');
                    switch (data.Interval) {
                        case 1:
                            $(row).find('.radio1').iCheck('check');
                            if (data.Day) {
                                $(row).find('.numTime').val(data.Day);
                                $(row).find('.timeSelect option[value="day"]').attr("selected", true);
                            }
                            if (data.Month) {
                                $(row).find('.numTime').val(data.Month);
                                $(row).find('.timeSelect option[value="month"]').attr("selected", true);
                            }
                            $(row).find('.normalHour option[value=' + data.NormalHour + ']').attr("selected", true);
                            break;
                        case 2:
                            $(row).find('.radio2').iCheck('check');
                            $(row).find('.weekSelect option[value=' + data.Week + ']').attr("selected", true);
                            $(row).find('.weekHour option[value=' + data.WeekHour + ']').attr("selected", true);
                            break;
                        default:
                            $(row).find('.radio1').iCheck('uncheck');
                            $(row).find('.radio2').iCheck('uncheck');
                    }
                },
                "drawCallback": function (settings, json) {
                    setTableStyle($('#spotCheckList'));
                    $('#spotCheckList .isEnable').on('ifChanged', function () {
                        var tyInputOp = $(this).parents('tr');
                        setUpdateStatus($(this), tyInputOp);
                        var v = $(this).val();
                        var name = tyInputOp.find('.item').val().trim();
                        if ($(this).is(':checked')) {
                            _spotCheckIdData.push(v);
                            _spotCheckNameData.push(name);
                        } else {
                            var indexId = _spotCheckIdData.indexOf(v);
                            var indexName = _spotCheckNameData.indexOf(name);
                            _spotCheckIdData.splice(indexId, 1);
                            _spotCheckNameData.splice(indexName, 1);
                        }
                    });
                    $('#spotCheckList .radioSelect').on('ifChecked', function () {
                        var td = $(this).parents('td');
                        setStatus(td);
                    });
                    var i, len = $('#spotCheckList .isEnable').length;
                    for (i = 0; i < len; i++) {
                        var trFirstIck = $('#spotCheckList .isEnable').eq(i);
                        var tr = trFirstIck.parents('tr');
                        setUpdateStatus(trFirstIck, tr);
                    }
                }
            });
    });
}

//提醒间隔禁用激活状态
function setStatus(el) {
    el.find('.icb_check').iCheck('enable');
    el.find('.textIn').attr('disabled', false);
    el.find('.radioOp1,.radioOp2').attr('disabled', true);
    if (el.find('.radio1').is(':checked')) {
        el.find('.radioOp1').attr('disabled', false);
    }
    if (el.find('.radio2').is(':checked')) {
        el.find('.radioOp2').attr('disabled', false);
    }
}

//是否能修改状态
function setUpdateStatus(el, remindEl) {
    if (el.is(':checked')) {
        setStatus(remindEl);
    } else {
        remindEl.find('.icb_check').iCheck('disable');
        remindEl.find('.radioOp1, .radioOp2, .textIn').attr('disabled', true);
    }
}

//修改计划模态框
function showUpdateSpotPlan() {
    if (_planId) {
        $('#updateSpotPlanSelect').val(_planId).trigger("change");
    }
    $('#updateSpotPlan').val('');
    $('#updateSpotPlanModal').modal("show");
}

//修改计划
function updateSpotPlan() {
    var opType = 602;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var planId = parseInt($("#updateSpotPlanSelect").val());
    if (isStrEmptyOrUndefined(planId)) {
        layer.msg('请选择点检计划');
        return;
    }
    var spotPlan = $('#updateSpotPlan').val().trim();
    if (isStrEmptyOrUndefined(spotPlan)) {
        layer.msg('计划名不能为空');
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: planId,
            Plan: spotPlan
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                $("#updateSpotPlanModal").modal("hide");
                if (ret.errno == 0) {
                    getSpotPlan();
                }
            });
    }
    showConfirm("修改", doSth);
}

//点检项option
function setSpotCheckOption(i) {
    var bodyTr = '<tr>' +
        '<td class="num" style="font-weight:bold"></td>' +
        '<td><input type="text" class="form-control text-center item" maxlength="10" style="width:170px"></td>' +
        '<td><input type="checkbox" class="icb_minimal using"></td>' +
        '<td><input type="checkbox" class="icb_minimal remind"></td>' +
        '<td><input type="text" class="form-control text-center min numVal" value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="10" style="width:80px"></td>' +
        '<td><input type="text" class="form-control text-center max numVal" value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="10" style="width:80px"></td>' +
        '<td><input type="text" class="form-control text-center unit" maxlength="5" style="width:80px"></td>' +
        '<td><textarea class="form-control reference" maxlength="500" style="resize:vertical;width:400px"></textarea></td>' +
        '<td><textarea class="form-control remarks" maxlength="500" style="resize:vertical;width:400px"></textarea></td>' +
        '<td>{0}</td>' +
        '<td style="width:100px">' +
        '<button type="button" class="btn btn-danger delSpotCheckTr"><i class="fa fa-minus"></i></button>' +
        '<button type="button" class="btn btn-success addSpotCheckTr" style="margin-left:5px"><i class="fa fa-plus"></i></button>' +
        '</td>' +
        '</tr>';
    var op = remindIntervalOption();
    op = op.op.format(op.hourOp, op.weekOp, `addSpotCheck${i}`);
    return bodyTr.format(op);
}

//添加点检项表格行数
function setTableTrCount(el, count) {
    for (var i = 0; i < count; i++) {
        el.find('.num').eq(i).text(i + 1);
    }
}

//表格设置
function setTableStyle(el) {
    el.find('.icb_minimal').iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        radioClass: 'iradio_minimal-blue',
        increaseArea: '20%'
    });
    el.find('td').css("verticalAlign", "middle");
}

//默认一列点检项
function setOneSpotPlanCheckTr() {
    _spotCheckCount++;
    $('#addSpotPlanBody').empty();
    var tr = setSpotCheckOption(_spotCheckCount);
    $('#addSpotPlanBody').append(tr);
    setTableTrCount($("#addSpotPlanBody"), _spotCheckCount);
    setTableStyle($('#addSpotPlanBody'));
    $('#addSpotPlanBody').find('.radio1').iCheck('check');
}

var _spotCheckCount = 0;
var _isPlanOP = null;
//添加计划/点检项模态框
function addSpotPlanCheckModal(e) {
    _spotCheckCount = 0;
    _isPlanOP = e;
    $('#addSpotPlan').val('');
    $('#addSpotPlanCheck').val(_planId).trigger("change");
    $('#addSpotPlanModal').find('.planCheckOp').eq(e).removeClass('hidden').siblings('.planCheckOp').addClass('hidden');
    if (e) {
        $('#addSpotPlanModalTitle').text('添加新点检项');
        $('#addSpotPlanCheckBtn').addClass('hidden');
        $('#addSpotPlanCheckTable').removeClass('hidden');
        setOneSpotPlanCheckTr();
    } else {
        $('#addSpotPlanModalTitle').text('添加新计划');
        $('#addSpotPlanCheckBtn').removeClass('hidden'); 
        $('#addSpotPlanCheckTable').addClass('hidden');
        $('#addSpotPlanBody').empty();
    }
    $('#addSpotPlanModal').modal("show");
}

//点检项数据
function getSpotCheckData(el, count) {
    var spotCheckItems = [];
    for (var i = 0; i < count; i++) {
        var tr = el.find('tr').eq(i);
        var item = tr.find('.item').val().trim();
        if (isStrEmptyOrUndefined(item)) {
            layer.msg('点检名称不能为空');
            return 1;
        }
        var using = tr.find('.using').is(':checked');
        var remind = tr.find('.remind').is(':checked');
        var min = tr.find('.min').val().trim();
        var max = tr.find('.max').val().trim();
        var unit = tr.find('.unit').val().trim();
        var reference = tr.find('.reference').val().trim();
        var remarks = tr.find('.remarks').val().trim();
        var interval, day = 0, month = 0, normalHour = 0, week = 0, weekHour = 0;
        if (tr.find('.radio1').is(':checked')) {
            interval = 1;
            tr.find('.timeSelect').val()
                ? month = tr.find('.numTime').val().trim()
                : day = tr.find('.numTime').val().trim();
            normalHour = tr.find('.normalHour').val();
        } else {
            interval = 2;
            week = tr.find('.weekSelect').val();
            weekHour = tr.find('.weekHour').val();
        }
        spotCheckItems.push({
            Item: item,
            Enable: using,
            Remind: remind,
            Min: min,
            Max: max,
            Unit: unit,
            Reference: reference,
            Remarks: remarks,
            Interval: interval,
            Day: day,
            Month: month,
            NormalHour: normalHour,
            Week: week,
            WeekHour: weekHour
        });
    }
    return spotCheckItems;
}

//添加计划/点检项
function addSpotPlan() {
    var opType, spotCheckItems, planCheck, spotPlanId;
    if (_isPlanOP) {
        opType = 609;
        if (!checkPermission(opType)) {
            layer.msg("没有权限");
            return;
        }
        spotPlanId = $('#addSpotPlanCheck').val();
        if (isStrEmptyOrUndefined(spotPlanId)) {
            layer.msg('请选择点检计划');
            return;
        }
        spotCheckItems = getSpotCheckData($('#addSpotPlanBody'), _spotCheckCount);
        if (spotCheckItems == 1) {
            return;
        }
        if (spotCheckItems.length) {
            var i = 0, len = spotCheckItems.length;
            for (; i < len; i++) {
                spotCheckItems[i].PlanId = spotPlanId;
            }
        } else {
            layer.msg('至少设置一条计划点检项');
            return;
        }
        planCheck = spotCheckItems;
    } else {
        opType = 603;
        if (!checkPermission(opType)) {
            layer.msg("没有权限");
            return;
        }
        planCheck = {};
        var spotPlanName = $('#addSpotPlan').val().trim();
        if (isStrEmptyOrUndefined(spotPlanName)) {
            layer.msg('新计划不能为空');
            return;
        }
        planCheck.Plan = spotPlanName;
        spotCheckItems = getSpotCheckData($('#addSpotPlanBody'), _spotCheckCount);
        if (spotCheckItems == 1) {
            return;
        }
        if (spotCheckItems.length) {
            planCheck.SpotCheckItems = spotCheckItems;
        }
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(planCheck);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                $("#addSpotPlanModal").modal("hide");
                if (ret.errno == 0) {
                    getSpotPlan();
                    if (_isPlanOP && _planId == spotPlanId) {
                        getSpotCheckList();
                    }
                }
            });
    }
    showConfirm("添加", doSth);
}

//删除计划
function delSpotPlan() {
    var opType = 604;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var planId = _planId;
    if (isStrEmptyOrUndefined(planId)) {
        layer.msg('请选择点检计划');
        return;
    }
    var planName = $('#spotPlanSelect').find(`[value=${planId}]`).text();
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: planId
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    _planId = null;
                    getSpotPlan();
                }
            });
    }
    showConfirm("删除点检计划：" + planName, doSth);
}

var _spotCheckBodyRow = 0;
//保存修改
function updateSportPlanCheck() {
    var opType = 608;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var planId = _planId;
    var planCheckBody = $('#spotCheckList tbody');
    if (!_spotCheckBodyRow) {
        layer.msg("未检测到点检项数据");
        return;
    }
    var spotCheckItems = getSpotCheckData(planCheckBody, _spotCheckBodyRow);
    if (spotCheckItems == 1) {
        return;
    }
    var planCheckBodyIsEnable = $('#spotCheckList tbody').find('.isEnable');
    for (var i = 0; i < _spotCheckBodyRow; i++) {
        spotCheckItems[i].PlanId = planId;
        var id = planCheckBodyIsEnable.eq(i).val();
        spotCheckItems[i].id = id;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(spotCheckItems);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getSpotCheckList();
                }
            });
    }
    showConfirm("修改", doSth);
}

var _spotCheckIdData = [];
var _spotCheckNameData = [];
//删除点检
function delSpotPlanCheck() {
    var opType = 610;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    if (!_spotCheckIdData.length) {
        layer.msg("请选择要删除的点检项");
        return;
    }
    var name = _spotCheckNameData.join('<br>');
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            ids: _spotCheckIdData
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getSpotCheckList();
                }
            });
    }
    showConfirm(`删除以下点检项：<pre style="color:red">${name}</pre>`, doSth);
}