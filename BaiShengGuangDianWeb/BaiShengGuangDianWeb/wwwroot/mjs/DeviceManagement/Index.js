function pageReady() {
    getDeviceList();
}

function getDeviceList() {
    var opType = 100;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    ajaxPost("/Relay/Post",
        {
            opType: 100
        },
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
                    '    <ul class="dropdown-menu" role="menu">{0}{1}{2}{3}' +
                    '    </ul>' +
                    '</div>';

                var detailLi = '<li><a onclick="showDetailModel({0})">详情</a></li>'.format(data.Id);
                var updateLi = '<li><a onclick="showUpdateModel({0})">修改</a></li>'.format(data.Id);
                var upgradeLi = '<li><a onclick="showUpgradeModel({0})">升级</a></li>'.format(data.Id);
                var deleteLi = '<li><a onclick="DeleteDevice({0}, \'{1}\')">删除</a></li>'.format(data.Id, data.Code);

                html = html.format(
                    checkPermission(101) ? detailLi : "",
                    checkPermission(102) ? updateLi : "",
                    checkPermission(107) ? upgradeLi : "",
                    checkPermission(104) ? deleteLi : "");

                return html;
            }
            var ip = function (data, type, row) {
                return row.Ip + ':' + row.Port;
            }

            var state = function (data, type, row) {
                if (row.StateStr == '连接正常')
                    return '<span class="text-green">' + row.StateStr + '</span>';
                return '<span class="text-red">' + row.StateStr + '</span>';
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
            for (var i = 0; i < ret.deviceModels.length; i++) {
                var data = ret.deviceModels[i];
                $("#addDeviceModel").append(option.format(data.Id, data.ModelName));
            }
            $("#addFirmware").empty();
            for (var i = 0; i < ret.firmwareLibraries.length; i++) {
                var data = ret.firmwareLibraries[i];
                $("#addFirmware").append(option.format(data.Id, data.FirmwareName));
            }
            $("#addProcess").empty();
            for (var i = 0; i < ret.processLibraries.length; i++) {
                var data = ret.processLibraries[i];
                $("#addProcess").append(option.format(data.Id, data.ProcessName));
            }
            $("#addHardware").empty();
            for (var i = 0; i < ret.hardwareLibraries.length; i++) {
                var data = ret.hardwareLibraries[i];
                $("#addHardware").append(option.format(data.Id, data.HardwareName));
            }
            $("#addSite").empty();
            for (var i = 0; i < ret.sites.length; i++) {
                var data = ret.sites[i];
                $("#addSite").append(option.format(data.Id, data.SiteName));
            }
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
    hideTip($("#addCodeTip"));
    if (isStrEmptyOrUndefined(code)) {
        showTip($("#addCodeTip"), "机台号不能为空");
        add = false;
    }
    //设备名
    var deviceName = $("#addDeviceName").val();
    hideTip($("#addDeviceNameTip"));
    if (isStrEmptyOrUndefined(deviceName)) {
        showTip($("#addDeviceNameTip"), "设备名不能为空");
        add = false;
    }
    //设备MAC地址
    var macAddress = $("#addMacAddress").val();
    hideTip($("#addMacAddressTip"));
    if (isStrEmptyOrUndefined(macAddress)) {
        showTip($("#addMacAddressTip"), "MAC地址不能为空");
        add = false;
    }
    //IP
    var ip = $("#addIp").val();
    hideTip($("#addIpTip"));
    if (!isIp(ip)) {
        showTip($("#addIpTip"), "IP非法");
        add = false;
    }
    //端口
    var port = $("#addPort").val();
    hideTip($("#addPortTip"));
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
function showDetailModel(parameters) {

}

function showControlModel(parameters) {

}

function showUpdateModel(parameters) {

}

function showUpgradeModel(parameters) {

}


function showUpgradeModel(parameters) {

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



