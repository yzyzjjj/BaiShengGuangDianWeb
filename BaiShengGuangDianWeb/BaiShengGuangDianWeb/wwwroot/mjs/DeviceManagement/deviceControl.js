var _permissionList = [];
function pageReady() {
    _permissionList[174] = { uIds: ['setCodeVarParBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
    $(".ms2").select2();
    idStr = getQueryString("id");
    getCodeList();
    $("#selectCode").on("select2:select", function () {
        getVarTypeList();
    });
}

var idStr;
function getCodeList() {
    var data = {};
    data.opType = 100;
    data.opData = JSON.stringify({
        hard: true
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $("#selectCode").empty();
        var option = '<option value="{0}">{1}</option>';
        var i, len = ret.datas.length;
        var options = '';
        for (i = 0; i < len; i++) {
            var d = ret.datas[i];
            var state = d.DeviceStateStr;
            if (state == '待加工' || state == '加工中') {
                options += option.format(d.Id, d.Code);
            }
        }
        $("#selectCode").append(options);
        if (idStr != null) {
            $("#selectCode").val(idStr).trigger("change");
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
    ajaxPost("/Relay/Post",data,
        function(ret) {
            layer.msg(ret.errmsg);
        });
}

//加工数据
function getDataList() {}

function openDevice() {}

function closeDevice() {}

function lockDevice() {}

function unlockDevice() {}