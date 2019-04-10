function pageReady() {

    var idStr = getQueryString("id");
    if (idStr != null) {
        id = parseInt(idStr);
    }
    getControlList();

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
                    exit = true;
                }
            }
            if (!exit && ret.datas.length > 0) {
                id = 1;
            }
            selectChange(ret.datas);

            $(".ms2").on("select2:select", function (e) {
                id = parseInt($("#" + e.currentTarget.id + " option:checked").val());
                selectChange(ret.datas);
            });
        });
}

function selectChange(datas) {
    var firstData = null;
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
        $("#detailFirmware").val(firstData.FirmwareName);
        $("#detailHardware").val(firstData.HardwareName);
        $("#detailApplication").val(firstData.ApplicationName);
        $("#detailSite").val(firstData.SiteName);
        $("#detailAdministratorUser").val(firstData.AdministratorUser);
        $("#detailRemark").val(firstData.Remark);
    }
}