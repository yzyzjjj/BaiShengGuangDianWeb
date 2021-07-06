var _permissionList = [];
var defId;
function pageReady() {
    _permissionList[174] = { uIds: ['setCodeVarParBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
    $(".ms2").select2({ matcher });
    defId = getQueryString("id");
    getCodeList();
    $("#selectCode").on("select2:select", function () {
        getVarTypeList();
    });
}

function getCodeList() {
    var data = {};
    data.opType = 100;
    data.opData = JSON.stringify({
        detail: true,
        state: true,
        valid: true
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        $("#selectCode").html(setOptions(rData, "Code"));

        ret.datas.sort((a, b) => a.Code - b.Code);
        if (defId != null) {
            $("#selectCode").val(defId).trigger("change");
        }
        getVarTypeList();
    });
}

function getVarTypeList() {
    var deviceId = $("#selectCode").val();
    if (isStrEmptyOrUndefined(deviceId)) {
        return;
    }
    var data = {};
    data.opType = 164;
    data.opData = JSON.stringify({
        DeviceId: deviceId
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $("#selectVarType").html(setOptions(ret.datas, "VariableName"));
    });
}

function setCodeVarPar() {
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
    if (parseInt(resetValue) != resetValue) {
        layer.msg("请输入正确的数值");
        return;
    }
    var data = {};
    data.opType = 165;
    data.opData = JSON.stringify({
        DeviceId: deviceId,
        UsuallyDictionaryId: codeVarId,
        Value: resetValue
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            layer.msg(ret.errmsg);
        });
}

//加工数据
function getDataList() { }

function openDevice() { }

function closeDevice() { }

function lockDevice() { }

function unlockDevice() { }