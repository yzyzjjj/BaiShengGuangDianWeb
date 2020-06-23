var _permissionList = [];
function pageReady() {
    _permissionList[280] = { uIds: ['delDevicePlanModalBtn'] };
    _permissionList[281] = { uIds: ['setDeviceCheckBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
    $(".ms2").select2();
    $('ul .setTitle').on('click', function () {
        var title = $(this).text();
        $('#pageTitle').text(`设备点检${title}`);
    });
    getWorkShop();
    surveyor();
    $('#selectWorkShop').on('select2:select', function () {
        _isConfigPage = true;
        var workShopName = $(this).val();
        getWorkShopDevice(workShopName, $('#selectWorkShopDevice'));
    });
    $('#selectWorkShopDevice').on('select2:select', function () {
        getDeviceCheckPlan();
    });
    $('#selectSpotPlan').on('select2:select', function () {
        getSpotPlanCheckList(0, $("#spotPlanCheckList"));
    });
    $('#selectWorkShopSet').on('select2:select', function () {
        var workShopName = $(this).val();
        getWorkShopDevice(workShopName, $('#selectWorkShopDeviceSet'));
    });
    $('#selectSpotPlanSet').on('select2:select', function () {
        getSpotPlanCheckList(1, $("#spotPlanCheckListSet"));
    });
    $("#selectWorkShopDeviceSet, #selectWorkShopDeviceDel").select2({
        allowClear: true,
        placeholder: "请选择"
    });
    $('#selectWorkShopDel').on('select2:select', function () {
        var workShopName = $(this).val();
        getWorkShopDevice(workShopName, $('#selectWorkShopDeviceDel'));
    });
}

//获取车间
function getWorkShop() {
    var data = {}
    data.opType = 162;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $(".selectWorkShop").empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{0}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.SiteName);
        }
        $('.selectWorkShop').append(options);
        getWorkShopDevice();
    });
}

var _pageRead = true;
var _isConfigPage = true;
//获取车间设备
function getWorkShopDevice(workShopName, el) {
    if (isStrEmptyOrUndefined(workShopName)) {
        workShopName = $('#selectWorkShop').val();
        if (isStrEmptyOrUndefined(workShopName)) {
            layer.msg('请选择车间');
            return;
        }
    }
    var data = {}
    data.opType = 163;
    data.opData = JSON.stringify({
        workshopName: workShopName
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        isStrEmptyOrUndefined(el) ? $('.selectWorkShopDevice').empty() : el.empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Code);
        }
        isStrEmptyOrUndefined(el) ? $('.selectWorkShopDevice').append(options) : el.append(options);
        if (_isConfigPage) {
            _isConfigPage = false;
            getDeviceCheckPlan();
        }
        if (_pageRead) {
            _pageRead = false;
            getSpotPlan();
        }
    });
}

//获取设备绑定计划
function getDeviceCheckPlan() {
    var deviceId = $('#selectWorkShopDevice').val();
    if (isStrEmptyOrUndefined(deviceId)) {
        layer.msg("请选择设备");
        $('#selectSpotPlan').empty();
        return;
    }
    var data = {}
    data.opType = 609;
    data.opData = JSON.stringify({
        id: deviceId
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#selectSpotPlan').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value="{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Plan);
        }
        $('#selectSpotPlan').append(options);
        getSpotPlanCheckList(0, $("#spotPlanCheckList"));
    });
}

//获取点检计划
function getSpotPlan() {
    var data = {}
    data.opType = 600;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('.selectSpotPlan').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value="{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Plan);
        }
        $('.selectSpotPlan').append(options);
        getSpotPlanCheckList(1, $("#spotPlanCheckListSet"));
    });
}

var _surveyorSelect = null;
//负责人选项
function surveyor() {
    var data = {}
    data.opType = 254;
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
            options += option.format(d.Id, d.SurveyorName);
        }
        _surveyorSelect = `<select class="form-control surveyor" item={0}>${options}</select>`;
    });
}

//获取设备点检项/计划点检项Data
function getSpotPlanCheckList(e, el) {
    var opType, planId, jsonData = {};
    if (e) {
        opType = 605;
        planId = $('#selectSpotPlanSet').val();
        if (isStrEmptyOrUndefined(planId)) {
            return;
        }
        jsonData.qId = planId;
    } else {
        opType = 610;
        var deviceId = $('#selectWorkShopDevice').val();
        if (isStrEmptyOrUndefined(deviceId)) {
            layer.msg('请选择设备');
            return;
        }
        jsonData.deviceId = deviceId;
        planId = $('#selectSpotPlan').val();
        if (isStrEmptyOrUndefined(planId)) {
            return;
        }
        jsonData.planId = planId;
    }
    var data = {};
    data.opType = opType;
    data.opData = JSON.stringify(jsonData);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var i, len = rData.length, enable = [];
        for (i = 0; i < len; i++) {
            if (rData[i].Enable) {
                enable.push(rData[i]);
            }
        }
        rData = enable;
        var o = 0;
        var op = function () {
            return ++o;
        }
        var interval = function (data) {
            var setOp = data.Interval;
            var intervalData = '';
            switch (setOp) {
                case 1:
                    var day = data.Day;
                    var month = data.Month;
                    var hour = data.NormalHour;
                    if (!day && !month) {
                        intervalData = `每日${hour}点`;
                    } else {
                        if (day) {
                            intervalData = day == 1 ? `每日${hour}点` : `每${day}日${hour}点`;
                        }
                        if (month) {
                            intervalData = month == 1 ? `每月${hour}点` : `每${month}月${hour}点`;
                        }
                    }
                    break;
                case 2:
                    var weeks = '日一二三四五六';
                    intervalData = `每周${weeks[data.Week]}${data.WeekHour}点`;
                    break;
                default:
                    intervalData = '';
            }
            return intervalData;
        }
        var surveyorName = function (data) {
            return _surveyorSelect.format(data.Id);
        }
        var column = e
            ? [
                { "data": null, "title": "序号", "render": op },
                { "data": "Item", "title": "点检名称" },
                { "data": "Min", "title": "下限" },
                { "data": "Max", "title": "上限" },
                { "data": "Unit", "title": "单位" },
                { "data": "Reference", "title": "参考标准" },
                { "data": "Remarks", "title": "备注" },
                { "data": null, "title": "提醒间隔", "render": interval },
                { "data": null, "title": "负责人", "render": surveyorName }
            ]
            : [
                { "data": null, "title": "序号", "render": op },
                { "data": "Item", "title": "点检名称" },
                { "data": "Min", "title": "下限" },
                { "data": "Max", "title": "上限" },
                { "data": "Unit", "title": "单位" },
                { "data": "Reference", "title": "参考标准" },
                { "data": "Remarks", "title": "备注" },
                { "data": null, "title": "提醒间隔", "render": interval },
                { "data": "SurveyorName", "title": "负责人" }
            ];
        el.DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": rData,
            "aaSorting": [[0, "asc"]],
            "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 20, //默认显示的记录数
            "columns": column
        });
    });
}

//设备点检项刷新
function spotPlanCheckReload() {
    getSpotPlanCheckList(0, $("#spotPlanCheckList"));
}
//计划设置刷新
function planItemReload() {
    getSpotPlanCheckList(1, $("#spotPlanCheckListSet"));
}

//设置设备点检项
function setDeviceCheck() {
    var planId = $('#selectSpotPlanSet').val();
    if (isStrEmptyOrUndefined(planId)) {
        layer.msg('请选择点检计划');
        return;
    }
    var deviceId = $('#selectWorkShopDeviceSet').val();
    if (isStrEmptyOrUndefined(deviceId)) {
        layer.msg('请选择设备');
        return;
    }
    deviceId = deviceId.join();
    var spotCheckDevices = [];
    var trs = $('#spotPlanCheckListSet tbody').find('tr');
    var i, len = trs.length;
    for (i = 0; i < len; i++) {
        var op = trs.eq(i).find('.surveyor');
        var itemId = op.attr('item');
        if (isStrEmptyOrUndefined(itemId)) {
            layer.msg('未检测到点检项数据');
            return;
        }
        var surveyorId = op.val();
        spotCheckDevices.push({
            ItemId: itemId,
            SurveyorId: surveyorId
        });
    }
    var doSth = function () {
        var data = {}
        data.opType = 611;
        data.opData = JSON.stringify({
            PlanId: planId,
            DeviceId: deviceId,
            SpotCheckDevices: spotCheckDevices
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    $('#selectWorkShopDeviceSet').val(null).trigger("change");
                    getSpotPlanCheckList(1, $("#spotPlanCheckListSet"));
                }
            });
    }
    showConfirm("设置设备点检", doSth);
}

//删除设备计划模态框
function delDevicePlanModal() {
    $('#selectWorkShopDeviceDel').val(null).trigger("change");
    var planId = $("#selectSpotPlanDel").find('option').eq(0).val();
    $('#selectSpotPlanDel').val(planId).trigger("change");
    $('#delDevicePlanModal').modal("show");
}

//删除设备计划
function delDevicePlan() {
    var deviceId = $('#selectWorkShopDeviceDel').val();
    if (isStrEmptyOrUndefined(deviceId)) {
        layer.msg('请选择设备');
        return;
    }
    deviceId = deviceId.join();
    var planId = $('#selectSpotPlanDel').val();
    if (isStrEmptyOrUndefined(planId)) {
        layer.msg('请选择点检计划');
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = 612;
        data.opData = JSON.stringify({
            DeviceId: deviceId,
            PlanId: planId
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                $('#delDevicePlanModal').modal("hide");
            });
    }
    showConfirm("删除设备计划：", doSth);
}