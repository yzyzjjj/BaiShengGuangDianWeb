var _permissionList = [];
function pageReady() {
    _permissionList[169] = { uIds: [] };
    _permissionList = checkPermissionUi(_permissionList);
    $('.ms2').select2();
    const getDeviceFn = new Promise(resolve => getDevice(resolve));
    const getFirmware = new Promise(resolve => getUpgrade(resolve, 130, 'FilePath', 'FirmwareName'));
    const getHardware = new Promise(resolve => getUpgrade(resolve, 135, 'FilePath', 'HardwareName'));
    const getApplication = new Promise(resolve => getUpgrade(resolve, 145, 'FilePath', 'ApplicationName'));
    Promise.all([getDeviceFn, getFirmware, getHardware, getApplication]).then(e => {
        $('#detailFirmware').append(e[1]);
        $('#detailHardware').append(e[2]);
        $('#detailApplication').append(e[3]);
        getAssignDevice(getQueryString('id') || e[0]);
    });
    $('#detailCode1,#detailCode2,#detailCode3').on('select2:select', function () {
        const id = $(this).val();
        getAssignDevice(id);
    });
}

//刷新
function resetTable() {
    const id = $('#detailCode1').val();
    if (isStrEmptyOrUndefined(id)) {
        layer.msg('请选择机台号');
        return;
    }
    getAssignDevice(id);
}

//获取所有机台号
function getDevice(resolve) {
    ajaxPost('/Relay/Post', { opType: 100 }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        rData.sort((a, b) => a.Code - b.Code);
        const op = '<option value="{0}">{1}</option>';
        let ops = '';
        for (let i = 0, len = rData.length; i < len; i++) {
            const d = rData[i];
            ops += op.format(d.Id, d.Code);
        }
        $('#detailCode1,#detailCode2,#detailCode3').empty().append(ops);
        resolve(rData[0].Id);
    });
}

//获取指定机台号
function getAssignDevice(id) {
    $('#detailCode1,#detailCode2,#detailCode3').val(id).trigger('change');
    ajaxPost('/Relay/Post', { opType: 100, opData: JSON.stringify({ ids: id, detail: true, other: true, state: true }) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const d = ret.datas[0];
        getDeviceState(id, d.DeviceStateStr);
        $('#detailScript').empty();
        new Promise(resolve => getUpgrade(resolve, 113, 'ScriptFile', 'ScriptName', d.DeviceModelId)).then(e => $("#detailScript").append(e).val(d.ScriptId).trigger('change'));
        $('#detailDeviceName').val(d.DeviceName);
        $('#detailClass').val(d.Class);
        $('#detailMacAddress').val(d.MacAddress);
        $('#detailIp').val(d.Ip);
        $('#detailPort').val(d.Port);
        $('#detailIdentifier').val(d.Identifier);
        $('#detailDeviceModel').val(d.ModelName);
        $('#detailFirmware').val(d.FirmwareId).trigger("change");
        $('#detailHardware').val(d.HardwareId).trigger("change");
        $('#detailApplication').val(d.ApplicationId).trigger("change");
        $('#detailSite').val(`${d.SiteName}${d.RegionDescription}`);
        $('#detailAdministrator').val(d.Administrator);
        $('#detailRemark').val(d.Remark);
    });
}

//获取设备状态信息
function getDeviceState(qId, str) {
    $('#StateBox input').val("无数据");
    ajaxPost('/Relay/Post', { opType: 109, opData: JSON.stringify({ qId }) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#name1').val(str);
        var rData = ret.datas;
        for (let i = 0, len = rData.length; i < len; i++) {
            const d = rData[i];
            const key = d.Item1;
            $(`#name${key}`).val(key === 1 ? str : d.Item2);
        };
    });
}

//获取升级相关选项
function getUpgrade(resolve, opType, path, name, modelId) {
    const data = {}
    data.opType = opType;
    if (modelId) {
        data.opData = JSON.stringify({
            deviceModelId: modelId
        });
    }
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const list = ret.datas;
        const op = '<option value="{0}" path="{1}">{2}</option>';
        let ops = '';
        for (let i = 0, len = list.length; i < len; i++) {
            const d = list[i];
            ops += op.format(d.Id, d[path], d[name]);
        }
        resolve(ops);
    }, 0);
}

//设备升级
function deviceUpgrade(type = 0) {
    var codeId = $('#detailCode2').val();
    if (isStrEmptyOrUndefined(codeId)) {
        layer.msg('请选择机台号');
        return;
    }
    if ($('#name1').val().trim() != '待机') {
        layer.msg('非待机设备不能升级');
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
    const doSth = () => {
        var data = {
            type: fileType,
            files: JSON.stringify([fileName])
        };
        data.dir = "";
        for (var k in fileEnum) {
            if (fileEnum[k] == data.type) {
                data.dir = k;
                break;
            }
        }
        if (isStrEmptyOrUndefined(data.dir)) {
            return void layer.msg("文件类型不存在！");
        }

        getFilePath(data, paths => {
            const pLen = paths.length;
            if (pLen <= 0)
                return;
            data = {};
            data.opType = 108;
            data.opData = JSON.stringify({
                Type: type,
                Infos: [{
                    Type: 1,
                    FileId: fileId,
                    FileUrl: `${location.origin}${paths[0].path}`,
                    DeviceId: codeId
                }]
            });
            var progress = addFakeProgress();
            ajaxPost('/Relay/Post', data, ret => {
                progress();
                progress = null;
                var d = ret.datas[0];
                layer.msg(d.errmsg);
                if (d.errno == 0) {
                    getAssignDevice(codeId);
                }
            });
        }, 0);
    }
    showConfirm(`升级${hintText}`, doSth);
}