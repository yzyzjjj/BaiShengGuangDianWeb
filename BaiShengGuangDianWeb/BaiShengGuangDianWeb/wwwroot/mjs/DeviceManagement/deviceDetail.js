function pageReady() {
    $("#detailFirmware").select2();
    //检查设备升级权限
    if (checkPermission(108)) {
        $("#upgradeFirmwareBtn").removeClass("hidden");
    } else {
        $("#upgradeFirmwareBtn").addClass("hidden");
    }
    var idStr = getQueryString("id");
    if (idStr != null) {
        id = parseInt(idStr);
    }
    getFirmwareList(function () {
        getControlList();
        getStateList();
    });

    $("#detailFirmware").on("select2:select", function (e) {
        if ($("#detailFirmware").val() == $("#detailFirmware").attr("oval")) {
            $("#upgradeFirmwareBtn").attr("disabled", "disabled");
        } else {
            $("#upgradeFirmwareBtn").removeAttr("disabled");
        }
    });
    //$("#detailFirmware").select2({
    //    allowClear: true,
    //    placeholder: "请选择"
    //});
}

var id = 1;
function getControlList() {
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

            $(".ms2").empty();
            $(".ms2").select2();
            var exit = false;
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $(".ms2").append(option.format(data.Id, data.Code));
                if (data.Id == id) {
                    firstData = data;
                    exit = true;
                }
            }
            if (!exit && ret.datas.length > 0) {
                firstData = ret.datas[0];
                id = 1;
            }
            selectChange(ret.datas);

            $(".ms2").on("select2:select", function (e) {
                id = parseInt($("#" + e.currentTarget.id + " option:checked").val());
                selectChange(ret.datas);
            });
        });
}
var firstData = null;
function selectChange(datas) {
    for (var i = 0; i < datas.length; i++) {
        var data = datas[i];
        if (data.Id == id) {
            firstData = data;
        }
    }
    if (firstData == null && datas.length > 0) {
        firstData = datas[0];
        id = 1;
    }
    if (firstData != null) {
        $(".ms2").val(id).trigger("change");
        $("#detailDeviceName").val(firstData.DeviceName);
        $("#detailMacAddress").val(firstData.MacAddress);
        $("#detailIp").val(firstData.Ip);
        $("#detailPort").val(firstData.Port);
        $("#detailIdentifier").val(firstData.Identifier);
        $("#detailDeviceModel").val(firstData.ModelName);
        $("#detailScript").val(firstData.ScriptName);
        $("#detailFirmware").val(firstData.FirmwareId).trigger("change");
        $("#detailFirmware").attr("oval", firstData.FirmwareId);
        $("#detailHardware").val(firstData.HardwareName);
        $("#detailApplication").val(firstData.ApplicationName);
        $("#detailSite").val(firstData.SiteName + firstData.RegionDescription);
        $("#detailAdministrator").val(firstData.Administrator);
        $("#detailRemark").val(firstData.Remark);
    }
    getStateList();
}

//状态信息
function getStateList() {
    $("#StateBox input").val("无数据");
    var opType = 109;
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

            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                var info = "";
                var key = data.Item1;
                var val = data.Item2;
                switch (key) {
                    case 1:
                        if (val == 0) {
                            info = firstData.DeviceStateStr;
                        }
                        break;
                    default:
                        info = val;
                }
                $("#StateBox").find("[name=" + key + "]").val(info);
            };
        });
}

function getFirmwareList(func) {
    var opType = 130;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    ajaxPost("/Relay/Post",
        {
            opType: opType
        },
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            $("#detailFirmware").empty();
            var option = '<option value="{0}" path="{2}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#detailFirmware").append(option.format(data.Id, data.FirmwareName, data.FilePath));
            }
            func();
        });
}

//升级固件
function upgradeFirmware() {
    var opType = 108;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var v = $("#detailFirmware").val();
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        Type: fileEnum.FirmwareLibrary,
        DeviceId: $("#detailCode2").val(),
        FirmwareId: v,
        Path: $("#detailFirmware").children().filter("[value=" + v + "]").attr("path")
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                getControlList()
            }
        });
}