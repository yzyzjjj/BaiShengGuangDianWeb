function pageReady() {
    $(".ms2").select2();
    getCodeList();
    $("#selectCode").on("select2:select", function () {
        getVarTypeList();
    });
}

function getCodeList() {
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
    ajaxPost("/Relay/Post", data, function(ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $("#selectCode").empty();
        var option = '<option value="{0}">{1}</option>';
        var i, len = ret.datas.length;
        for (i = 0; i < len; i++) {
            var d = ret.datas[i];
            var state = d.DeviceStateStr;
            if (state == '待加工' || state == '加工中') {
                $("#selectCode").append(option.format(d.Id, d.Code));
            }
        }
        getVarTypeList();
    });
}

function getVarTypeList() {
    var opType = 164;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var deviceId = $("#selectCode").val();
    if (isStrEmptyOrUndefined(deviceId)) {
        layer.msg("请选择设备");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        DeviceId: deviceId
    });
    ajaxPost("/Relay/Post", data, function(ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $("#selectVarType").empty();
        var option = '<option value="{0}">{1}</option>';
        var i, len = ret.datas.length;
        for (i = 0; i < len; i++) {
            var d = ret.datas[i];
            $("#selectVarType").append(option.format(d.Id, d.VariableName));
        }
    });
}

function setCodeVarPar() {
    var opType = 165;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var deviceId = $("#selectCode").val();
    if (isStrEmptyOrUndefined(deviceId)) {
        layer.msg("请选择设备");
        return;
    }
    var codeVarId = $("#selectVarType").val();
    if (isStrEmptyOrUndefined(codeVarId)) {
        layer.msg("变量类型");
        return;
    }
    var resetValue = $("#resetValue").val().trim();
    if (isStrEmptyOrUndefined(resetValue)) {
        layer.msg("请输入重置值");
        return;
    }
}

//加工数据
function getDataList() {

}

function openDevice() {

}

function closeDevice() {

}

function lockDevice() {

}

function unlockDevice() {

}