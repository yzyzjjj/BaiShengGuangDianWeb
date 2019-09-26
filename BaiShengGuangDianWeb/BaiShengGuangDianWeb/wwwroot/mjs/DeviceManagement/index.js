function pageReady() {
    getDeviceList();
    $(".ads").css("width", "100%");
    $(".col-sm-2").addClass("mcolsm2");
    $("#addIp").inputmask("ip");
    $("#updateIp").inputmask("ip");
    if (!checkPermission(103)) {
        $("#showAddModel").addClass("hidden");
    }

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
}
function getDeviceList() {
    var opType = 100;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        hard: true
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var op = function (data, type, row) {
                var html = '<div class="btn-group">' +
                    '<button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >' +
                    '<button type = "button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                    '   <span class="caret"></span>' +
                    '   <span class="sr-only">Toggle Dropdown</span>' +
                    '</button>' +
                    '<ul class="dropdown-menu" role="menu" style="cursor:pointer">{0}{1}{2}{3}{4}' +
                    '</ul>' +
                    '</div>';

                var controlLi = '<li><a onclick="showControl({0},\'{1}\')">控制</a></li>'.format(data.Id, escape(data.DeviceStateStr));
                var detailLi = '<li><a onclick="showDetail({0})">详情</a></li>'.format(data.Id);
                var updateLi = '<li><a onclick="showUpdateModel({0}, \'{1}\', \'{2}\', \'{3}\', \'{4}\', \'{5}\', \'{6}\', {7}, {8}, {9}, {10}, {11}, {12}, \'{13}\', \'{14}\', {15})">修改</a></li>'
                    .format(data.Id, escape(data.DeviceName), escape(data.Code), escape(data.MacAddress), escape(data.Ip), escape(data.Port), escape(data.Identifier), escape(data.DeviceModelId), escape(data.ScriptId),
                        escape(data.FirmwareId), escape(data.ApplicationId), escape(data.HardwareId), escape(data.SiteId), escape(data.AdministratorUser), escape(data.Remark), escape(data.DeviceCategoryId));
                var upgradeLi = '<li><a onclick="showUpgrade({0})">升级</a></li>'.format(data.Id);
                var deleteLi = '<li><a onclick="deleteDevice({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.Code));

                html = html.format(
                    controlLi,
                    checkPermission(101) ? detailLi : "",
                    checkPermission(102) ? updateLi : "",
                    checkPermission(108) ? upgradeLi : "",
                    checkPermission(104) ? deleteLi : "");

                return html;
            }
            var ip = function (data, type, row) {
                return data.Ip + ':' + data.Port;
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
            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            $("#deviceList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "columns": [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "Id", "title": "Id", "bVisible": false },
                        { "data": "Code", "title": "机台号" },
                        { "data": null, "title": "设备型号", "render": modelName },
                        { "data": null, "title": "摆放位置" },
                        { "data": null, "title": "IP地址", "render": ip },
                        { "data": "AdministratorUser", "title": "管理员" },
                        { "data": null, "title": "运行状态", "render": state },
                        { "data": null, "title": "设备状态", "render": deviceState },
                        { "data": null, "title": "操作", "render": op }
                    ],
                    "columnDefs": [
                        { "orderable": false, "targets": 9 },
                        {
                            "targets": [4],
                            "render": function (data, type, meta) {
                                var placeName = data.SiteName + data.RegionDescription;
                                return ("" + placeName).length > tdShowContentLength
                                    ? placeName.substr(0, tdShowContentLength) +
                                    ' <a href = \"javascript:showPlaceNameModel({0})\">...</a> '
                                        .format(data.Id)
                                    : placeName;
                            }
                        },
                        { "type": "html-percent", "targets": [2] }
                    ]
                });
        });
}

function showPlaceNameModel(id) {
    var opType = 100;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var data = {}
    data.opType = opType;
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
    var opType = 107;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            $(".ads").empty();
            $(".ads").select2(); 
            $("#addCode").val("");
            $("#addDeviceName").val("");
            $("#addMacAddress").val("");
            $("#addIp").val("");
            $("#addPort").val("60000");
            $("#addIdentifier").val("");
            $("#addAdministratorUser").val("");
            $("#addRemark").val("");
            var i;
            var data;
            for (i = 0; i < ret.firmwareLibraries.length; i++) {
                data = ret.firmwareLibraries[i];
                $("#addFirmware").append(option.format(data.Id, data.FirmwareName));
            }
            for (i = 0; i < ret.applicationLibraries.length; i++) {
                data = ret.applicationLibraries[i];
                $("#addApplication").append(option.format(data.Id, data.ApplicationName));
            }
            for (i = 0; i < ret.hardwareLibraries.length; i++) {
                data = ret.hardwareLibraries[i];
                $("#addHardware").append(option.format(data.Id, data.HardwareName));
            }
            for (i = 0; i < ret.sites.length; i++) {
                data = ret.sites[i];
                $("#addSite").append(option.format(data.Id, data.SiteName + data.RegionDescription));
            }

            categories = ret.deviceCategories;
            models = ret.deviceModels;
            scripts = ret.scriptVersions;
            initAddSelect();
            hideClassTip("adt");
            $("#addModel").modal("show");
        });
}

function addDevice() {
    var opType = 103;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
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
    //设备管理员用户
    var administratorUser = $("#addAdministratorUser").val();
    //备注
    var remark = $("#addRemark").val();
    if (!add)
        return;
    var doSth = function () {
        $("#addModel").modal("hide");

        var data = {}
        data.opType = opType;
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
            //设备管理员用户
            AdministratorUser: administratorUser,
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

function showUpdateModel(id, deviceName, code, macAddress, ip, port, identifier, deviceModelId, scriptId, firmwareId, applicationId, hardwareId, siteId, administratorUser, remark, categoryId) {
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
    administratorUser = unescape(administratorUser);
    remark = unescape(remark);
    categoryId = unescape(categoryId);

    var opType = 107;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };

            $(".ads").empty();
            $(".ads").select2();
            var i;
            var data;
            for (i = 0; i < ret.firmwareLibraries.length; i++) {
                data = ret.firmwareLibraries[i];
                $("#updateFirmware").append(option.format(data.Id, data.FirmwareName));
            }
            for (i = 0; i < ret.applicationLibraries.length; i++) {
                data = ret.applicationLibraries[i];
                $("#updateApplication").append(option.format(data.Id, data.ApplicationName));
            }
            for (i = 0; i < ret.hardwareLibraries.length; i++) {
                data = ret.hardwareLibraries[i];
                $("#updateHardware").append(option.format(data.Id, data.HardwareName));
            }
            for (i = 0; i < ret.sites.length; i++) {
                data = ret.sites[i];
                $("#updateSite").append(option.format(data.Id, data.SiteName + data.RegionDescription));
            }

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
            $("#updateAdministratorUser").val(administratorUser);
            $("#updateRemark").val(remark);

            $("#updateModel").modal("show");
        });
}

function updateDevice() {
    var opType = 102;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
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
    //设备管理员用户
    var administratorUser = $("#updateAdministratorUser").val();
    //备注
    var remark = $("#updateRemark").val();
    if (!update)
        return;
    var doSth = function () {
        $("#updateModel").modal("hide");

        var data = {}
        data.opType = opType;
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
            //设备管理员用户
            AdministratorUser: administratorUser,
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

function showUpgrade(id) {
    window.location = '/DeviceManagement/Detail?id=' + id;
}

function deleteDevice(id, code) {
    code = unescape(code);

    var opType = 104;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
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
                    getDeviceList();
                }
            });
    }
    showConfirm("删除机台号：" + code, doSth);
}



