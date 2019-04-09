function pageReady() {
    getDeviceList();
}

function getDeviceList() {
    var opType = 100;
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
            }

            var op = function (data, type, row) {
                var html = '<div class="btn-group">' +
                    '<button type = "button" class="btn btn-default" > <i class="fa fa-asterisk"></i>操作</button >' +
                    '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                    '        <span class="caret"></span>' +
                    '        <span class="sr-only">Toggle Dropdown</span>' +
                    '    </button>' +
                    '    <ul class="dropdown-menu" role="menu">{0}{1}{2}{3}{4}' +
                    '    </ul>' +
                    '</div>';

                var controlLi = '<li><a onclick="showControl({0})">控制</a></li>'.format(data.Id);
                var detailLi = '<li><a onclick="showDetail({0})">详情</a></li>'.format(data.Id);
                var updateLi = '<li><a onclick="showUpdateModel({0}, \'{1}\', \'{2}\', \'{3}\', \'{4}\', \'{5}\', \'{6}\', \'{7}\', \'{8}\', \'{9}\', \'{10}\', \'{11}\', \'{12}\', \'{13}\', \'{14}\')">修改</a></li>'
                    .format(data.Id, data.DeviceName, data.Code, data.MacAddress, data.Ip, data.Port, data.Identifier, data.DeviceModelId,
                        data.FirmwareId, data.ProcessId, data.HardwareId, data.SiteId, data.AdministratorUser, data.Remark);
                var upgradeLi = '<li><a onclick="showUpgrade({0})">升级</a></li>'.format(data.Id);
                var deleteLi = '<li><a onclick="DeleteDevice({0}, \'{1}\')">删除</a></li>'.format(data.Id, data.Code);

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
                if (data.StateStr == '连接正常')
                    return '<span class="text-green">' + data.StateStr + '</span>';
                return '<span class="text-red">' + data.StateStr + '</span>';
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
                        { "data": "Id", "title": "Id" },
                        { "data": "Code", "title": "机台号" },
                        { "data": "ModelName", "title": "设备型号" },
                        { "data": "SiteName", "title": "摆放位置" },
                        { "data": null, "title": "IP地址", "render": ip },
                        { "data": "AdministratorUser", "title": "管理员" },
                        { "data": null, "title": "运行状态", "render": state },
                        { "data": null, "title": "操作", "render": op }
                    ]
                });
        });
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
            $("#addDeviceModel").empty();
            var option = '<option value="{0}">{1}</option>';
            var i;
            var data;
            for (i = 0; i < ret.deviceModels.length; i++) {
                data = ret.deviceModels[i];
                $("#addDeviceModel").append(option.format(data.Id, data.ModelName));
            }
            $("#addFirmware").empty();
            for (i = 0; i < ret.firmwareLibraries.length; i++) {
                data = ret.firmwareLibraries[i];
                $("#addFirmware").append(option.format(data.Id, data.FirmwareName));
            }
            $("#addProcess").empty();
            for (i = 0; i < ret.processLibraries.length; i++) {
                data = ret.processLibraries[i];
                $("#addProcess").append(option.format(data.Id, data.ProcessName));
            }
            $("#addHardware").empty();
            for (i = 0; i < ret.hardwareLibraries.length; i++) {
                data = ret.hardwareLibraries[i];
                $("#addHardware").append(option.format(data.Id, data.HardwareName));
            }
            $("#addSite").empty();
            for (i = 0; i < ret.sites.length; i++) {
                data = ret.sites[i];
                $("#addSite").append(option.format(data.Id, data.SiteName));
            }

            hideTip($("#addCodeTip"));
            hideTip($("#addDeviceNameTip"));
            hideTip($("#addMacAddressTip"));
            hideTip($("#addIpTip"));
            hideTip($("#addPortTip"));
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
    var code = $("#addCode").val();
    if (isStrEmptyOrUndefined(code)) {
        showTip($("#addCodeTip"), "机台号不能为空");
        add = false;
    }
    //设备名
    var deviceName = $("#addDeviceName").val();
    if (isStrEmptyOrUndefined(deviceName)) {
        showTip($("#addDeviceNameTip"), "设备名不能为空");
        add = false;
    }
    //设备MAC地址
    var macAddress = $("#addMacAddress").val();
    if (isStrEmptyOrUndefined(macAddress)) {
        showTip($("#addMacAddressTip"), "MAC地址不能为空");
        add = false;
    }
    //IP
    var ip = $("#addIp").val();
    if (!isIp(ip)) {
        showTip($("#addIpTip"), "IP非法");
        add = false;
    }
    //端口
    var port = $("#addPort").val();
    if (!isPort(port)) {
        showTip($("#addPortTip"), "端口非法");
        add = false;
    }
    //识别码
    var identifier = $("#addIdentifier").val();
    //设备型号编号
    var deviceModelId = $("#addDeviceModel").val();
    //设备固件版本编号
    var firmwareId = $("#addFirmware").val();
    //设备流程版本编号
    var processId = $("#addProcess").val();
    //设备硬件版本编号
    var hardwareId = $("#addHardware").val();
    //设备所在场地编号
    var siteId = $("#addSite").val();
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
            //设备固件版本编号
            FirmwareId: firmwareId,
            //设备流程版本编号
            ProcessId: processId,
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

function showUpdateModel(id, deviceName, code, macAddress, ip, port, identifier, deviceModelId, firmwareId, processId, hardwareId, siteId, administratorUser, remark) {
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
            $("#updateDeviceModel").empty();
            var option = '<option value="{0}">{1}</option>';
            var i;
            var data;
            for (i = 0; i < ret.deviceModels.length; i++) {
                data = ret.deviceModels[i];
                $("#updateDeviceModel").append(option.format(data.Id, data.ModelName));
            }
            $("#updateFirmware").empty();
            for (i = 0; i < ret.firmwareLibraries.length; i++) {
                data = ret.firmwareLibraries[i];
                $("#updateFirmware").append(option.format(data.Id, data.FirmwareName));
            }
            $("#updateProcess").empty();
            for (i = 0; i < ret.processLibraries.length; i++) {
                data = ret.processLibraries[i];
                $("#updateProcess").append(option.format(data.Id, data.ProcessName));
            }
            $("#updateHardware").empty();
            for (i = 0; i < ret.hardwareLibraries.length; i++) {
                data = ret.hardwareLibraries[i];
                $("#updateHardware").append(option.format(data.Id, data.HardwareName));
            }
            $("#updateSite").empty();
            for (i = 0; i < ret.sites.length; i++) {
                data = ret.sites[i];
                $("#updateSite").append(option.format(data.Id, data.SiteName));
            }

            $("#updateId").html(id);
            $("#updateDeviceName").val(deviceName);
            $("#updateCode").val(code);
            $("#updateMacAddress").val(macAddress);
            $("#updateIp").val(ip);
            $("#updatePort").val(port);
            $("#updateIdentifier").val(identifier);
            $("#updateDeviceModel").val(deviceModelId);
            $("#updateFirmware").val(firmwareId);
            $("#updateProcess").val(processId);
            $("#updateHardware").val(hardwareId);
            $("#updateSite").val(siteId);
            $("#updateAdministratorUser").val(administratorUser);
            $("#updateRemark").val(remark);

            hideTip($("#updateCodeTip"));
            hideTip($("#updateDeviceNameTip"));
            hideTip($("#updateMacAddressTip"));
            hideTip($("#updateIpTip"));
            hideTip($("#updatePortTip"));
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
    var code = $("#updateCode").val();
    if (isStrEmptyOrUndefined(code)) {
        showTip($("#updateCodeTip"), "机台号不能为空");
        update = false;
    }
    //设备名
    var deviceName = $("#updateDeviceName").val();
    if (isStrEmptyOrUndefined(deviceName)) {
        showTip($("#updateDeviceNameTip"), "设备名不能为空");
        update = false;
    }
    //设备MAC地址
    var macAddress = $("#updateMacAddress").val();
    if (isStrEmptyOrUndefined(macAddress)) {
        showTip($("#updateMacAddressTip"), "MAC地址不能为空");
        update = false;
    }
    //IP
    var ip = $("#updateIp").val();
    if (!isIp(ip)) {
        showTip($("#updateIpTip"), "IP非法");
        update = false;
    }
    //端口
    var port = $("#updatePort").val();
    if (!isPort(port)) {
        showTip($("#updatePortTip"), "端口非法");
        update = false;
    }
    //识别码
    var identifier = $("#updateIdentifier").val();
    //设备型号编号
    var deviceModelId = $("#updateDeviceModel").val();
    //设备固件版本编号
    var firmwareId = $("#updateFirmware").val();
    //设备流程版本编号
    var processId = $("#updateProcess").val();
    //设备硬件版本编号
    var hardwareId = $("#updateHardware").val();
    //设备所在场地编号
    var siteId = $("#updateSite").val();
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
            //设备固件版本编号
            FirmwareId: firmwareId,
            //设备流程版本编号
            ProcessId: processId,
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

function showControl(id) {
    window.location = '/DeviceManagement/Control?id=' + id;
}

function showUpgrade(id) {
    window.location = '/DeviceManagement/Detail?id=' + id;
}

function DeleteDevice(id, code) {
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



