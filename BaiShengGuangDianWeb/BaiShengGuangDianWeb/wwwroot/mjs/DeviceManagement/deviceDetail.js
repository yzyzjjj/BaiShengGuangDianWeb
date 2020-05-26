var _permissionList = [];
function pageReady() {
    _permissionList[169] = { uIds: [] };
    _permissionList = checkPermissionUi(_permissionList);
    $(".ads,.ms2").select2();
    var idStr = getQueryString("id");
    if (idStr != null) {
        id = parseInt(idStr);
    }
    getFirmwareList(function () {
        getControlList();
        getStateList();
    });
}

var id = 1;
var _deviceData = null;
function getControlList() {
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
            rData.sort((a, b) => a.Code - b.Code);
            $(".ms2").empty();
            var exit = false;
            var option = '<option value="{0}">{1}</option>';
            var options = '';
            _deviceData = {};
            for (var i = 0, len = rData.length; i < len; i++) {
                var d = rData[i];
                _deviceData[d.Id] = d;
                options += option.format(d.Id, d.Code);
                if (d.Id == id) {
                    firstData = d;
                    exit = true;
                }
            }
            $(".ms2").append(options);
            if (!exit && rData.length > 0) {
                firstData = rData[0];
                id = 1;
            }
            selectChange(rData);
            $(".ms2").on("select2:select", function (e) {
                id = parseInt($(`#${e.currentTarget.id} :selected`).val());
                selectChange(rData);
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
        $("#detailScript").empty();
        new Promise(resolve => getUpgrade(resolve, 113, 'ScriptFile', 'ScriptName', firstData.DeviceModelId)).then(e => $("#detailScript").append(e).val(firstData.ScriptId).trigger("change"));
        $(".ms2").val(id).trigger("change");
        $("#detailDeviceName").val(firstData.DeviceName);
        $("#detailMacAddress").val(firstData.MacAddress);
        $("#detailIp").val(firstData.Ip);
        $("#detailPort").val(firstData.Port);
        $("#detailIdentifier").val(firstData.Identifier);
        $("#detailDeviceModel").val(firstData.ModelName);
        $("#detailFirmware").val(firstData.FirmwareId).trigger("change");
        $("#detailHardware").val(firstData.HardwareId).trigger("change");
        $("#detailApplication").val(firstData.ApplicationId).trigger("change");
        $("#detailSite").val(firstData.SiteName + firstData.RegionDescription);
        $("#detailAdministrator").val(firstData.Administrator);
        $("#detailRemark").val(firstData.Remark);
    }
    getStateList();
}

//状态信息
function getStateList() {
    $("#StateBox input").val("无数据");
    var data = {}
    data.opType = 109;
    data.opData = JSON.stringify({
        qId: id
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
                        //if (val == 0) {
                        info = firstData.DeviceStateStr;
                        //}
                        break;
                    default:
                        info = val;
                }
                $("#StateBox").find("[name=" + key + "]").val(info);
            };
        });
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

function getFirmwareList(func) {
    var getFirmware = new Promise(resolve => getUpgrade(resolve, 130, 'FilePath', 'FirmwareName'));
    var getHardware = new Promise(resolve => getUpgrade(resolve, 135, 'FilePath', 'HardwareName'));
    var getApplication = new Promise(resolve => getUpgrade(resolve, 145, 'FilePath', 'ApplicationName'));
    $('#detailFirmware,#detailHardware,#detailApplication').empty();
    Promise.all([getFirmware, getHardware, getApplication]).then(e => {
        $('#detailFirmware').append(e[0]);
        $('#detailHardware').append(e[1]);
        $('#detailApplication').append(e[2]);
        func();
    });
}

//设备升级
function deviceUpgrade(type = 0) {
    var codeId = $('#detailCode2').val();
    if (isStrEmptyOrUndefined(codeId)) {
        layer.msg('请选择机台号');
        return;
    }
    if (_deviceData[codeId].DeviceStateStr != '待加工') {
        layer.msg('非待加工设备不能升级');
        return;
    }
    var fileId = null, fileType = null, fileName = null, hintText = '';
    switch (type) {
        case 1:
            fileId = $('#detailScript').val();
            fileType = fileEnum.Script;
            fileName = $('#detailScript :selected').attr('path');
            hintText = '流程脚本版本';
            break;
        case 2:
            fileId = $('#detailFirmware').val();
            fileType = fileEnum.FirmwareLibrary;
            fileName = $('#detailFirmware :selected').attr('path');
            hintText = '固件版本';
            break;
        case 3:
            fileId = $('#detailHardware').val();
            fileType = fileEnum.Hardware;
            fileName = $('#detailHardware :selected').attr('path');
            hintText = '硬件版本';
            break;
        case 4:
            fileId = $('#detailApplication').val();
            fileType = fileEnum.ApplicationLibrary;
            fileName = $('#detailApplication :selected').attr('path');
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
                    getControlList();
                }
            });
        }, 0);
    }
    showConfirm(`升级${hintText}`, doSth);
}