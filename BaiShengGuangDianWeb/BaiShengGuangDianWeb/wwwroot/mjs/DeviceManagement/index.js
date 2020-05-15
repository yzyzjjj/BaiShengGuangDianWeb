var _permissionList = [];
function pageReady() {
    _permissionList[161] = { uIds: ['showAddModel'] };
    _permissionList[162] = { uIds: [] };
    _permissionList[163] = { uIds: [] };
    _permissionList[164] = { uIds: [] };
    _permissionList[148] = { uIds: [] };
    _permissionList[147] = { uIds: [] };
    _permissionList = checkPermissionUi(_permissionList);
    getDeviceList();
    $(".ads").css("width", "100%").select2();;
    $(".col-sm-2").addClass("mcolsm2");
    $("#addIp").inputmask("ip");
    $("#updateIp").inputmask("ip");
    $("#addDeviceCategory").on("select2:select", function (e) {
        hideTip("addDeviceModelTip");
        hideTip("addScriptTip");
        var categoryId = parseInt($("#addDeviceCategory option:checked").val());
        $("#addDeviceModel").empty();

        var modelId = 0;
        var data;
        var i;
        for (i = 0; i < models.length; i++) {
            data = models[i];
            if (data.DeviceCategoryId == categoryId) {
                modelId = modelId == 0 ? data.Id : modelId;
                $("#addDeviceModel").append(option.format(data.Id, data.ModelName));
            }
        }
        $("#addScript").empty();
        for (i = 0; i < scripts.length; i++) {
            data = scripts[i];
            if (!isStrEmptyOrUndefined(data.DeviceModelId) && data.DeviceModelId.indexOf(modelId) > -1) {
                $("#addScript").append(option.format(data.Id, data.ScriptName));
            }
        }
    });
    $("#addDeviceModel").on("select2:select", function (e) {
        hideTip("addScriptTip");
        var modelId = parseInt($("#addDeviceModel option:checked").val());
        $("#addScript").empty();
        for (var i = 0; i < scripts.length; i++) {
            var data = scripts[i];
            if (!isStrEmptyOrUndefined(data.DeviceModelId) && data.DeviceModelId.indexOf(modelId) > -1) {
                $("#addScript").append(option.format(data.Id, data.ScriptName));
            }
        }
    });
    $("#updateDeviceCategory").on("select2:select", function (e) {
        hideTip("updateDeviceModelTip");
        hideTip("updateScriptTip");
        var categoryId = parseInt($("#updateDeviceCategory option:checked").val());
        $("#updateDeviceModel").empty();

        var modelId = 0;
        var data;
        var i;
        for (i = 0; i < models.length; i++) {
            data = models[i];
            if (data.DeviceCategoryId == categoryId) {
                modelId = modelId == 0 ? data.Id : modelId;
                $("#updateDeviceModel").append(option.format(data.Id, data.ModelName));
            }
        }
        $("#updateScript").empty();
        for (i = 0; i < scripts.length; i++) {
            data = scripts[i];
            if (!isStrEmptyOrUndefined(data.DeviceModelId) && data.DeviceModelId.indexOf(modelId) > -1) {
                $("#updateScript").append(option.format(data.Id, data.ScriptName));
            }
        }
    });
    $("#updateDeviceModel").on("select2:select", function (e) {
        var modelId = parseInt($("#updateDeviceModel option:checked").val());
        $("#updateScript").empty();
        for (var i = 0; i < scripts.length; i++) {
            var data = scripts[i];
            if (!isStrEmptyOrUndefined(data.DeviceModelId) && data.DeviceModelId.indexOf(modelId) > -1) {
                hideTip("updateScriptTip");
                $("#updateScript").append(option.format(data.Id, data.ScriptName));
            }
        }
    });
    $('#scriptList').on('select2:select', '.code', function () {
        var id = $(this).val();
        _codeSelect.push(id);
        var oldVal = $(this).data("last");
        $(this).data("last", id);
        if (!isStrEmptyOrUndefined(oldVal)) {
            _codeSelect.splice(_codeSelect.indexOf(oldVal), 1);
            $(`#scriptList .code option[value=${oldVal}]`).prop('disabled', false);
        }
        for (var i = 0, len = _codeSelect.length; i < len; i++) {
            $(`#scriptList .code option[value=${_codeSelect[i]}]`).prop('disabled', true);
        }
        $('#scriptList .code').select2();
        var tr = $(this).parents('tr');
        tr.find('.delTr').val(id);
        var d = _deviceData[id];
        var state = d.DeviceStateStr;
        var stateClass;
        switch (state) {
            case '待加工':
                stateClass = 'success';
                break;
            case '加工中':
                stateClass = 'success';
                break;
            case '已确认':
                stateClass = 'warning';
                break;
            case '维修中':
                stateClass = 'info';
                break;
            default:
                stateClass = 'red';
        }
        tr.find('.devState').html(`<span class="text-${stateClass}">${state}</span>`);
        tr.find('.devModel').text(`${d.CategoryName}-${d.ModelName}`);
        new Promise(resolve => getUpgrade(resolve, 113, 'ScriptFile', 'ScriptName', d.DeviceModelId)).then(e => {
            tr.find('.script').empty().append(e).val(d.ScriptId).trigger('change');
        });
    });
    $('#script_nav_table').css('maxHeight', innerHeight * 0.7);
}

var _deviceData = null;
function getDeviceList(resolve) {
    var data = {}
    data.opType = 100;
    data.opData = JSON.stringify({
        hard: true
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var rData = ret.datas;
            _deviceData = {};
            for (var i = 0, len = rData.length; i < len; i++) {
                var d = rData[i];
                _deviceData[d.Id] = d;
            }
            if (!isStrEmptyOrUndefined(resolve)) {
                resolve('success');
                return;
            }
            var per148 = _permissionList[148].have;
            var per147 = _permissionList[147].have;
            var per162 = _permissionList[162].have;
            var per164 = _permissionList[164].have;
            var per163 = _permissionList[163].have;
            var op = function (data, type, row) {
                var html = '<div class="btn-group">' +
                    '<button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >' +
                    '<button type = "button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                    '   <span class="caret"></span>' +
                    '   <span class="sr-only">Toggle Dropdown</span>' +
                    '</button>' +
                    '<ul class="dropdown-menu pointer" role="menu">{0}{1}{2}{3}{4}' +
                    '</ul>' +
                    '</div>';
                var controlLi = '<li><a onclick="showControl({0},\'{1}\')">控制</a></li>'.format(data.Id, escape(data.DeviceStateStr));
                var detailLi = '<li><a onclick="showDetail({0})">详情</a></li>'.format(data.Id);
                var updateLi = '<li><a onclick="showUpdateModel({0}, \'{1}\', \'{2}\', \'{3}\', \'{4}\', \'{5}\', \'{6}\', {7}, {8}, {9}, {10}, {11}, {12}, \'{13}\', \'{14}\', {15})">修改</a></li>'
                    .format(data.Id, escape(data.DeviceName), escape(data.Code), escape(data.MacAddress), escape(data.Ip), escape(data.Port), escape(data.Identifier), escape(data.DeviceModelId), escape(data.ScriptId),
                        escape(data.FirmwareId), escape(data.ApplicationId), escape(data.HardwareId), escape(data.SiteId), escape(data.Administrator), escape(data.Remark), escape(data.DeviceCategoryId));
                var upgradeLi = '<li><a onclick="showUpgrade({0})">升级</a></li>'.format(data.Id);
                var deleteLi = '<li><a onclick="deleteDevice({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.Code));
                html = html.format(
                    per148 ? controlLi : '',
                    per147 ? detailLi : '',
                    per162 ? updateLi : '',
                    per164 ? upgradeLi : '',
                    per163 ? deleteLi : '');
                return html;
            }
            var ip = function (data, type, row) {
                return `${data.Ip}:${data.Port}`;
            }
            var state = function (data, type, row) {
                var state = data.StateStr;
                if (state == '连接正常')
                    return '<span class="text-success">' + state + '</span>';
                return '<span class="text-danger">' + state + '</span>';
            }
            var deviceState = function (data, type, row) {
                var state = data.DeviceStateStr;
                if (state == '待加工')
                    return '<span class="text-success">' + state + '</span>';
                if (state == '加工中')
                    return '<span class="text-success">' + state + '</span>';
                if (state == '已确认')
                    return '<span class="text-warning">' + state + '</span>';
                if (state == '维修中')
                    return '<span class="text-info">' + state + '</span>';
                return '<span class="text-red">' + state + '</span>';
            }
            var modelName = function (data, type, row) {
                return data.CategoryName + "-" + data.ModelName;
            }
            var order = function (data, type, row, meta) {
                return meta.row + 1;
            }
            var rModal = function (data, type, meta) {
                var placeName = data.SiteName + data.RegionDescription;
                return ("" + placeName).length > tdShowContentLength
                    ? placeName.substr(0, tdShowContentLength) +
                    ' <a href = \"javascript:showPlaceNameModel({0})\">...</a> '
                        .format(data.Id)
                    : placeName;
            };
            $("#deviceList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": rData,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "Code", "title": "机台号", "type": "html-percent" },
                        { "data": null, "title": "设备型号", "render": modelName },
                        { "data": null, "title": "摆放位置", "render": rModal },
                        { "data": null, "title": "IP地址", "render": ip },
                        { "data": "AdministratorName", "title": "管理员" },
                        { "data": null, "title": "运行状态", "render": state },
                        { "data": null, "title": "设备状态", "render": deviceState },
                        { "data": null, "title": "操作", "render": op, "orderable": false, "visible": per148 || per147 || per162 || per164 || per163 }
                    ]
                });
        });
}

function showPlaceNameModel(id) {
    var data = {}
    data.opType = 100;
    data.opData = JSON.stringify({
        id: id
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            if (ret.datas.length > 0) {
                $("#siteName").html(ret.datas[0].SiteName);
                $("#regionDescription").html(ret.datas[0].RegionDescription);
            }
            $("#placeNameModel").modal("show");
        });
}

var categories, models, scripts;
var option = '<option value="{0}">{1}</option>';
function initAddSelect() {
    //if (categories.length == 0 || models.length == 0 || scripts.length == 0)
    //    return;var categories, models, scripts;
    var i;
    var data;
    for (i = 0; i < categories.length; i++) {
        data = categories[i];
        $("#addDeviceCategory").append(option.format(data.Id, data.CategoryName));
    }
    var categoryId = categories[0].Id;
    var modelId = 0;
    for (i = 0; i < models.length; i++) {
        data = models[i];
        if (data.DeviceCategoryId == categoryId) {
            if (modelId == 0)
                modelId = data.Id;
            $("#addDeviceModel").append(option.format(data.Id, data.ModelName));
        }
    }
    if (modelId != 0) {
        for (i = 0; i < scripts.length; i++) {
            data = scripts[i];
            if (data.DeviceModelId.indexOf(modelId) != -1)
                $("#addScript").append(option.format(data.Id, data.ScriptName));
        }
    }
}

function showAddModel() {
    var data = {}
    data.opType = 107;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            $("#addModel .ads").empty();
            $("#addCode").val("");
            $("#addDeviceName").val("");
            $("#addMacAddress").val("");
            $("#addIp").val("");
            $("#addPort").val("60000");
            $("#addIdentifier").val("");
            $("#addAdministrator").val("");
            $("#addRemark").val("");
            var i;
            var data;
            var html = "";
            for (i = 0; i < ret.firmwareLibraries.length; i++) {
                data = ret.firmwareLibraries[i];
                html += option.format(data.Id, data.FirmwareName);
                $("#addFirmware").append(option.format(data.Id, data.FirmwareName));
            }
            $("#addFirmware").append(html);
            html = "";
            for (i = 0; i < ret.applicationLibraries.length; i++) {
                data = ret.applicationLibraries[i];
                html += option.format(data.Id, data.ApplicationName);
                $("#addApplication").append(option.format(data.Id, data.ApplicationName));
            }
            $("#addApplication").append(html);
            html = "";
            for (i = 0; i < ret.hardwareLibraries.length; i++) {
                data = ret.hardwareLibraries[i];
                html += option.format(data.Id, data.HardwareName);
                $("#addHardware").append(option.format(data.Id, data.HardwareName));
            }
            $("#addHardware").append(html);
            html = "";
            for (i = 0; i < ret.sites.length; i++) {
                data = ret.sites[i];
                html += option.format(data.Id, data.SiteName + data.RegionDescription);
                $("#addSite").append(option.format(data.Id, data.SiteName + data.RegionDescription));
            }
            $("#addSite").append(html);
            html = "";
            for (i = 0; i < ret.maintainers.length; i++) {
                data = ret.maintainers[i];
                html += option.format(data.Account, data.Name);
            }
            $("#addAdministrator").append(html);

            categories = ret.deviceCategories;
            models = ret.deviceModels;
            scripts = ret.scriptVersions;
            initAddSelect();
            hideClassTip("adt");
            $("#addModel").modal("show");
        });
}

function addDevice() {
    var add = true;
    //机台号
    var code = $("#addCode").val().trim();
    if (isStrEmptyOrUndefined(code)) {
        showTip("addCodeTip", "机台号不能为空");
        add = false;
    }
    //设备名
    var deviceName = $("#addDeviceName").val().trim();
    if (isStrEmptyOrUndefined(deviceName)) {
        showTip("addDeviceNameTip", "设备名不能为空");
        add = false;
    }
    //设备MAC地址
    var macAddress = $("#addMacAddress").val().trim();
    if (!isMac(macAddress) && !isStrEmptyOrUndefined(macAddress)) {
        showTip("addMacAddressTip", "MAC地址格式不正确，请以xx:xx:xx:xx:xx:xx或xx-xx-xx-xx-xx-xx的形式输入，x为数字或字母（A-F大小写均可）");
        add = false;
    }
    //IP
    var ip = $("#addIp").val().trim().replace("_", "");
    if (!isIp(ip)) {
        showTip("addIpTip", "IP非法");
        add = false;
    }
    //端口
    var port = $("#addPort").val().trim();
    if (!isPort(port)) {
        showTip("addPortTip", "端口非法");
        add = false;
    }
    //识别码
    var identifier = $("#addIdentifier").val();
    //设备类型
    var deviceCategoryId = $("#addDeviceCategory").val();
    if (isStrEmptyOrUndefined(deviceCategoryId)) {
        showTip("addDeviceCategoryTip", "设备类型错误");
        add = false;
    }

    //设备型号编号
    var deviceModelId = $("#addDeviceModel").val();
    if (isStrEmptyOrUndefined(deviceModelId)) {
        showTip("addDeviceModelTip", "设备型号错误");
        add = false;
    }

    //流程脚本版本
    var scriptId = $("#addScript").val();
    if (isStrEmptyOrUndefined(scriptId)) {
        showTip("addScriptTip", "流程脚本版本错误");
        add = false;
    }

    //设备固件版本编号
    var firmwareId = $("#addFirmware").val();
    if (isStrEmptyOrUndefined(firmwareId)) {
        showTip("addFirmwareTip", "固件版本错误");
        add = false;
    }
    //设备应用层版本编号
    var applicationId = $("#addApplication").val();
    if (isStrEmptyOrUndefined(applicationId)) {
        showTip("addApplicationTip", "应用层版本错误");
        add = false;
    }
    //设备硬件版本编号
    var hardwareId = $("#addHardware").val();
    if (isStrEmptyOrUndefined(hardwareId)) {
        showTip("addHardwareTip", "硬件版本错误");
        add = false;
    }
    //设备所在场地编号
    var siteId = $("#addSite").val();
    if (isStrEmptyOrUndefined(siteId)) {
        showTip("addSiteTip", "场地错误");
        add = false;
    }
    //设备管理员
    var administrator = $("#addAdministrator").val();
    //备注
    var remark = $("#addRemark").val();
    if (!add)
        return;
    var doSth = function () {
        $("#addModel").modal("hide");

        var data = {}
        data.opType = 103;
        data.opData = JSON.stringify({
            //机台号
            Code: code,
            //设备名
            DeviceName: deviceName,
            //设备MAC地址
            MacAddress: macAddress,
            //IP
            Ip: ip,
            //端口
            Port: port,
            //识别码
            Identifier: identifier,
            //设备型号编号
            DeviceModelId: deviceModelId,
            //设备流程脚本版本编号
            ScriptId: scriptId,
            //设备固件版本编号
            FirmwareId: firmwareId,
            //设备应用层版本编号
            ApplicationId: applicationId,
            //设备硬件版本编号
            HardwareId: hardwareId,
            //设备所在场地编号
            SiteId: siteId,
            //设备管理员
            Administrator: administrator,
            //备注
            Remark: remark
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getDeviceList();
                }
            });
    }
    showConfirm("添加机台号：" + code, doSth);
}

function initUpdateSelect(categoryId, modelId, scriptId) {
    var i;
    var data;
    for (i = 0; i < categories.length; i++) {
        data = categories[i];
        $("#updateDeviceCategory").append(option.format(data.Id, data.CategoryName));
    }
    $("#updateDeviceCategory").val(categoryId);
    for (i = 0; i < models.length; i++) {
        data = models[i];
        if (data.DeviceCategoryId == categoryId)
            $("#updateDeviceModel").append(option.format(data.Id, data.ModelName));
    }
    $("#updateDeviceModel").val(modelId);
    for (i = 0; i < scripts.length; i++) {
        data = scripts[i];
        if (data.DeviceModelId.indexOf(modelId) != -1)
            $("#updateScript").append(option.format(data.Id, data.ScriptName));
    }
    $("#updateScript").val(scriptId);
}

function showUpdateModel(id, deviceName, code, macAddress, ip, port, identifier, deviceModelId, scriptId, firmwareId, applicationId, hardwareId, siteId, administrator, remark, categoryId) {
    deviceName = unescape(deviceName);
    code = unescape(code);
    macAddress = unescape(macAddress);
    ip = unescape(ip);
    port = unescape(port);
    identifier = unescape(identifier);
    deviceModelId = unescape(deviceModelId);
    scriptId = unescape(scriptId);
    firmwareId = unescape(firmwareId);
    applicationId = unescape(applicationId);
    siteId = unescape(siteId);
    administrator = unescape(administrator);
    remark = unescape(remark);
    categoryId = unescape(categoryId);
    var data = {}
    data.opType = 107;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };

            $("#updateModel .ads").empty();
            var i;
            var data;
            var html = "";
            for (i = 0; i < ret.firmwareLibraries.length; i++) {
                data = ret.firmwareLibraries[i];
                html += option.format(data.Id, data.FirmwareName);
            }
            $("#updateFirmware").append(html);
            html = "";
            for (i = 0; i < ret.applicationLibraries.length; i++) {
                data = ret.applicationLibraries[i];
                html += option.format(data.Id, data.ApplicationName);
            }
            $("#updateApplication").append(html);
            html = "";
            for (i = 0; i < ret.hardwareLibraries.length; i++) {
                data = ret.hardwareLibraries[i];
                html += option.format(data.Id, data.HardwareName);
            }
            $("#updateHardware").append(html);
            html = "";
            for (i = 0; i < ret.sites.length; i++) {
                data = ret.sites[i];
                html += option.format(data.Id, data.SiteName + data.RegionDescription);
            }
            $("#updateSite").append(html);
            html = "";
            for (i = 0; i < ret.maintainers.length; i++) {
                data = ret.maintainers[i];
                html += option.format(data.Account, data.Name);
            }
            $("#updateAdministrator").append(html);
            html = "";
            categories = ret.deviceCategories;
            models = ret.deviceModels;
            scripts = ret.scriptVersions;
            initUpdateSelect(categoryId, deviceModelId, scriptId);
            hideClassTip("adt");

            $("#updateId").html(id);
            $("#updateDeviceName").val(deviceName);
            $("#updateCode").val(code);
            $("#updateMacAddress").val(macAddress);
            $("#updateIp").val(ip);
            $("#updatePort").val(port);
            $("#updateIdentifier").val(identifier);
            $("#updateDeviceModel").val(deviceModelId);
            $("#updateScript").val(scriptId);
            $("#updateFirmware").val(firmwareId);
            $("#updateHardware").val(hardwareId);
            $("#updateApplication").val(applicationId);
            $("#updateSite").val(siteId);
            $("#updateAdministrator").val(administrator);
            $("#updateRemark").val(remark);

            $("#updateModel").modal("show");
        });
}

function updateDevice() {
    var id = parseInt($("#updateId").html());
    var update = true;
    //机台号
    var code = $("#updateCode").val().trim();
    if (isStrEmptyOrUndefined(code)) {
        showTip("updateCodeTip", "机台号不能为空");
        update = false;
    }
    //设备名
    var deviceName = $("#updateDeviceName").val().trim();
    if (isStrEmptyOrUndefined(deviceName)) {
        showTip("updateDeviceNameTip", "设备名不能为空");
        update = false;
    }
    //设备MAC地址
    var macAddress = $("#updateMacAddress").val().trim();
    if (!isMac(macAddress) && !isStrEmptyOrUndefined(macAddress)) {
        showTip("updateMacAddressTip", "MAC地址格式不正确，请以xx:xx:xx:xx:xx:xx或xx-xx-xx-xx-xx-xx的形式输入，x为数字或字母（A-F大小写均可）");
        update = false;
    }
    //IP
    var ip = $("#updateIp").val().trim().replace("_", "");
    if (!isIp(ip)) {
        showTip("updateIpTip", "IP非法");
        update = false;
    }
    //端口
    var port = $("#updatePort").val().trim();
    if (!isPort(port)) {
        showTip("updatePortTip", "端口非法");
        update = false;
    }
    //识别码
    var identifier = $("#updateIdentifier").val();
    //设备类型
    var deviceCategoryId = $("#updateDeviceCategory").val();
    if (isStrEmptyOrUndefined(deviceCategoryId)) {
        showTip("updateDeviceCategoryTip", "设备类型错误");
        update = false;
    }

    //设备型号编号
    var deviceModelId = $("#updateDeviceModel").val();
    if (isStrEmptyOrUndefined(deviceModelId)) {
        showTip("updateDeviceModelTip", "设备型号错误");
        update = false;
    }

    //流程脚本版本
    var scriptId = $("#updateScript").val()
    if (isStrEmptyOrUndefined(scriptId)) {
        showTip("updateScriptTip", "流程脚本版本错误");
        update = false;
    }

    //设备固件版本编号
    var firmwareId = $("#updateFirmware").val();
    if (isStrEmptyOrUndefined(firmwareId)) {
        showTip("updateFirmwareTip", "固件版本错误");
        update = false;
    }
    //设备应用层版本编号
    var applicationId = $("#updateApplication").val();
    if (isStrEmptyOrUndefined(applicationId)) {
        showTip("updateApplicationTip", "应用层版本错误");
        update = false;
    }
    //设备硬件版本编号
    var hardwareId = $("#updateHardware").val();
    if (isStrEmptyOrUndefined(hardwareId)) {
        showTip("updateHardwareTip", "硬件版本错误");
        update = false;
    }
    //设备所在场地编号
    var siteId = $("#updateSite").val();
    if (isStrEmptyOrUndefined(siteId)) {
        showTip("updateSiteTip", "场地错误");
        update = false;
    }
    //设备管理员
    var administrator = $("#updateAdministrator").val();
    //备注
    var remark = $("#updateRemark").val();
    if (!update)
        return;
    var doSth = function () {
        $("#updateModel").modal("hide");

        var data = {}
        data.opType = 102;
        data.opData = JSON.stringify({
            id: id,
            //机台号
            Code: code,
            //设备名
            DeviceName: deviceName,
            //设备MAC地址
            MacAddress: macAddress,
            //IP
            Ip: ip,
            //端口
            Port: port,
            //识别码
            Identifier: identifier,
            //设备型号编号
            DeviceModelId: deviceModelId,
            //设备流程脚本版本编号
            ScriptId: scriptId,
            //设备固件版本编号
            FirmwareId: firmwareId,
            //设备应用层版本编号
            ApplicationId: applicationId,
            //设备硬件版本编号
            HardwareId: hardwareId,
            //设备所在场地编号
            SiteId: siteId,
            //设备管理员
            Administrator: administrator,
            //备注
            Remark: remark
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getDeviceList();
                }
            });
    }
    showConfirm("修改", doSth);
}

function showDetail(id) {
    window.location = '/DeviceManagement/Detail?id=' + id;
}

function showControl(id, str) {
    str = unescape(str);
    if (str == "待加工" || str == "加工中") {
        window.location = '/DeviceManagement/Control?id=' + id;
    } else {
        layer.msg("该设备" + str);
    }
}

//获取升级相关选项
function getUpgrade(resolve, opType, path, name, modelId) {
    var data = {}
    data.opType = opType;
    if (modelId) {
        data.opData = JSON.stringify({
            deviceModelId: modelId
        });
    }
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        var option = '<option value="{0}" path="{1}">{2}</option>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d[path], d[name]);
        }
        resolve(options);
    }, 0);
}

//设备升级弹窗
function showUpgrade(id) {
    var d = _deviceData[id];
    $('#upgradeModel .upgrade-btn').val(id);
    $('#upgradeCode').val(d.Code);
    $('#upgradeDeviceName').val(d.DeviceName);
    $('#upgradeDeviceState').val(d.DeviceStateStr);
    $('#upgradeMacAddress').val(d.MacAddress);
    $('#upgradeIp').val(d.Ip);
    $('#upgradePort').val(d.Port);
    $('#upgradeIdentifier').val(d.Identifier);
    $('#upgradeDeviceCategory').val(d.CategoryName);
    $('#upgradeDeviceModel').val(d.ModelName);
    var getScript = new Promise(resolve => getUpgrade(resolve, 113, 'ScriptFile', 'ScriptName', d.DeviceModelId));
    var getFirmware = new Promise(resolve => getUpgrade(resolve, 130, 'FilePath', 'FirmwareName'));
    var getHardware = new Promise(resolve => getUpgrade(resolve, 135, 'FilePath', 'HardwareName'));
    var getApplication = new Promise(resolve => getUpgrade(resolve, 145, 'FilePath', 'ApplicationName'));
    $('#upgradeScript,#upgradeFirmware,#upgradeHardware,#upgradeApplication').empty();
    Promise.all([getScript, getFirmware, getHardware, getApplication]).then(e => {
        $('#upgradeScript').append(e[0]).val(d.ScriptId).trigger('change');
        $('#upgradeFirmware').append(e[1]).val(d.FirmwareId).trigger('change');
        $('#upgradeHardware').append(e[2]).val(d.HardwareId).trigger('change');
        $('#upgradeApplication').append(e[3]).val(d.ApplicationId).trigger('change');
    });
    $('#upgradeSite').val(d.SiteName);
    $('#upgradeAdministrator').val(d.AdministratorName);
    $('#upgradeRemark').val(d.Remark);
    $('#upgradeModel').modal('show');
}

//设备升级
function deviceUpgrade(type = 0) {
    var codeId = $(this).val();
    if (_deviceData[codeId].DeviceStateStr != '待加工') {
        layer.msg('非待加工设备不能升级');
        return;
    }
    var fileId = null, fileType = null, fileName = null, hintText = '';
    switch (type) {
        case 1:
            fileId = $('#upgradeScript').val();
            fileType = fileEnum.Script;
            fileName = $('#upgradeScript :selected').attr('path');
            hintText = '流程脚本版本';
            break;
        case 2:
            fileId = $('#upgradeFirmware').val();
            fileType = fileEnum.Firmware;
            fileName = $('#upgradeFirmware :selected').attr('path');
            hintText = '固件版本';
            break;
        case 3:
            fileId = $('#upgradeHardware').val();
            fileType = fileEnum.Hardware;
            fileName = $('#upgradeHardware :selected').attr('path');
            hintText = '硬件版本';
            break;
        case 4:
            fileId = $('#upgradeApplication').val();
            fileType = fileEnum.Application;
            fileName = $('#upgradeApplication :selected').attr('path');
            hintText = '应用层版本';
            break;
    }
    if (isStrEmptyOrUndefined(fileId)) {
        layer.msg(`请选择：<span style="font-weight:bold">${hintText}</span>`);
        return;
    }
    var doSth = () => {
        var data = {
            type: fileType,
            files: JSON.stringify([fileName])
        };
        ajaxPost("/Upload/Path", data, ret => {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            data = {};
            data.opType = 108;
            data.opData = JSON.stringify({
                Type: type,
                Infos: [{
                    Type: 1,
                    FileId: fileId,
                    FileUrl: `${location.origin}${ret.data[0].path}`,
                    DeviceId: codeId
                }]
            });
            ajaxPost("/Relay/Post", data, ret => {
                var d = ret.datas[0];
                layer.msg(d.errmsg);
                if (d.errno == 0) {
                    $('#upgradeModel').modal('hide');
                    getDeviceList();
                }
            });
        }, 0);
    }
    showConfirm(`升级${hintText}`, doSth);
}

//批量升级弹窗
function showBatchUpgradeModel() {
    new Promise(resolve => getDeviceList(resolve)).then(() => $('#addScriptListBtn').removeAttr('disabled'));
    _codeSelect = [];
    $('#scriptList').empty();
    $('#batchUpgradeModel').modal('show');
}

var _codeSelect = null;
//批量升级添加新项
function addBatchUpgradeTr() {
    var op = '<option value="{0}" {2}>{1}</option>';
    var ops = '';
    for (var key in _deviceData) {
        var d = _deviceData[key];
        ops += op.format(key, d.Code, _codeSelect.indexOf(key) == -1 ? '' : 'disabled');
    }
    var tr = `<tr>
                <td class="num"></td>
                <td style="width:100px"><select class="ms2 form-control code">${ops}</select></td>
                <td class="devState"></td>
                <td class="devModel"></td>
                <td style="min-width:120px"><select class="ms2 form-control script"></select></td>
                <td class="result"></td>
                <td><button type="button" class="btn btn-danger btn-sm delTr" onclick="delBatchUpgradeTr.call(this)"><i class="fa fa-minus"></i></button></td>
              </tr>`;
    $('#scriptList').append(tr).find('.ms2').select2();
    batchUpgradeSort();
    $('#scriptList .code:last').trigger('select2:select');
    if (Object.keys(_deviceData).length == _codeSelect.length) {
        $('#addScriptListBtn').attr('disabled', true);
    }
    $('#script_nav_table').scrollTop($('#script_nav_table')[0].scrollHeight);
}

//批量升级tr排序
function batchUpgradeSort() {
    var trs = $('#scriptList tr');
    for (var i = 0, len = trs.length; i < len; i++) {
        trs.eq(i).find('.num').text(i + 1);
    }
}

//批量升级删除tr
function delBatchUpgradeTr() {
    var tr = $(this).parents('tr');
    tr.remove();
    batchUpgradeSort();
    var v = $(this).val();
    _codeSelect.splice(_codeSelect.indexOf(v), 1);
    $(`#scriptList .code option[value=${v}]`).prop('disabled', false);
    $('#addScriptListBtn').attr('disabled', false);
    $('#scriptList .code').select2();
}

//批量升级
function batchUpgrade() {
    var trs = $('#scriptList tr');
    var info = { codeId: [], fileId: [], filePath: [] };
    var i, len;
    for (i = 0, len = trs.length; i < len; i++) {
        var tr = trs.eq(i);
        var codeId = tr.find('.delTr').val();
        if (_deviceData[codeId].DeviceStateStr != '待加工') {
            layer.msg(`序列${i + 1}：非待加工设备不能升级`);
            return;
        }
        var scriptEl = tr.find('.script');
        var fileId = scriptEl.val();
        var filePath = scriptEl.find(':selected').attr('path');
        if (isStrEmptyOrUndefined(filePath)) {
            layer.msg(`序列${i + 1}：请选择流程脚本版本`);
            return;
        }
        info.codeId.push(codeId);
        info.fileId.push(fileId);
        info.filePath.push(filePath);
    }
    var doSth = () => {
        var data = {
            type: fileEnum.Script,
            files: JSON.stringify(info.filePath)
        };
        ajaxPost("/Upload/Path", data, ret => {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var paths = ret.data;
            len = paths.length;
            var infos = [];
            var origin = location.origin;
            for (i = 0; i < len; i++) {
                var path = `${origin}${paths[i].path}`;
                infos.push({
                    Type: 1,
                    FileId: info.fileId[i],
                    FileUrl: path,
                    DeviceId: info.codeId[i]
                });
            }
            data = {};
            data.opType = 108;
            data.opData = JSON.stringify({
                Type: 1,
                Infos: infos
            });
            ajaxPost("/Relay/Post", data, ret => {
                var results = ret.datas;
                len = results.length;
                var resultEl = $('#scriptList .result');
                for (i = 0; i < len; i++) {
                    var result = results[i];
                    var color = result.errno == 0 ? 'success' : 'red';
                    resultEl.eq(i).html(`<span class="text-${color}">升级${result.errmsg}</span>`);
                }
            });
        }, 0);
    }
    showConfirm('升级流程脚本版本', doSth);
}

function deleteDevice(id, code) {
    code = unescape(code);
    var doSth = function () {
        var data = {}
        data.opType = 104;
        data.opData = JSON.stringify({
            id: id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getDeviceList();
                }
            });
    }
    showConfirm("删除机台号：" + code, doSth);
}
