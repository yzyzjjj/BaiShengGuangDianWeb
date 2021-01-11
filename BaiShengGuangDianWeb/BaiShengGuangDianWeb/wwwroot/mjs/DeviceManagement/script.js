﻿var _permissionList = [];
function pageReady() {
    _permissionList[200] = { uIds: ['showManageModelBtn'] };
    _permissionList[236] = { uIds: ['showAddScriptVersionModel'] };
    _permissionList[237] = { uIds: [] };
    _permissionList[238] = { uIds: [] };
    _permissionList[201] = { uIds: ['showUsuallyDictionaryTypeModelBtn'] };
    _permissionList[202] = { uIds: ['showUsuallyVariableTypeModelBtn'] };
    _permissionList[241] = { uIds: ['showAddUsuallyVariableTypeModel'] };
    _permissionList[242] = { uIds: [] };
    _permissionList[243] = { uIds: [] };
    _permissionList[203] = { uIds: ['showAddModel'] };
    _permissionList[204] = { uIds: [] };
    _permissionList[205] = { uIds: ['showScriptSetBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
    $(".ads").css('width', '100%').select2();
    $('.ms2').select2();
    getDataTypeList();
    getDeviceModelList();
    $("#fScriptVersion").change(function () {
        $(".sd ").addClass("hidden");
        var v = $("#fScriptVersion").val();
        $("#div" + v).removeClass("hidden");
    });

    $("#sScriptVersion").on("select2:select", function (e) {
        sScrId = parseInt($("#sScriptVersion").val());
        if (sScrId == 0)
            return;
        getScriptVersionDetailList();
    });

    $("#sDeviceModel").on("select2:select", function (e) {
        deModel = parseInt($("#sDeviceModel").val());
        getScriptVersionList();
    });
    $("#aDeviceModel").on("select2:select", function (e) {
        adeModel = parseInt($("#aDeviceModel").val());
        getScriptVersionList1();
    });
    $("#aScriptVersion").on("select2:select", function (e) {
        asScrId = parseInt($("#aScriptVersion").val());
    });
    $("#jScriptVersion").on("select2:select", function (e) {
        var name = $("#jScriptVersion").val();
        $("#jsonName").val(name);
    });
    $("#aDataType").on("select2:select", function (e) {
        var fScriptVersion = $("#fScriptVersion").val();
        if (fScriptVersion == 1) {
            $("#jsonFile").val("");
            initDiv1();
        }
        $('#siteCount').text($(this).val() == 1 ? 700 : 100);
    });
    $("#jsonFile").change(function (e) {
        initDiv1();
        var file = e.target.files[0];
        if (isStrEmptyOrUndefined(file)) {
            return;
        }
        if (window.FileReader) {
            var fr = new FileReader();
            fr.onloadend = function (f) {
                var datasStr = f.target.result;
                try {
                    var datas = JSON.parse(datasStr);
                    var v = $("#fScriptVersion").val();
                    var dType = parseInt($("#aDataType").val());
                    jsonData = new Array();
                    var keyData = new Array();
                    for (var i = 0; i < datas.length; i++) {
                        var data = datas[i];
                        var variableName = null;
                        var pointerAddress = null;
                        switch (dType) {
                            case 1:
                                variableName = data[2];
                                pointerAddress = data[0];
                                break;
                            case 2:
                            case 3:
                                variableName = data[1];
                                pointerAddress = data[4];
                                break;
                            default:
                        }
                        if (isStrEmptyOrUndefined(variableName) || isStrEmptyOrUndefined(pointerAddress)) {
                            continue;
                        }
                        if (dType == 2) {
                            if (pointerAddress.indexOf("输入") < 0)
                                continue;
                            pointerAddress = pointerAddress.replace("输入", "");
                        }
                        if (dType == 3) {
                            if (pointerAddress.indexOf("输出") < 0)
                                continue;
                            pointerAddress = pointerAddress.replace("输出", "");
                        }
                        if (keyData.indexOf(pointerAddress) >= 0)
                            continue;
                        keyData.push(pointerAddress);
                        jsonData.push({
                            Id: jsonData.length + 1,
                            ScriptId: v,
                            VariableName: variableName,
                            PointerAddress: pointerAddress
                        });
                    }
                    $("#jsonList")
                        .DataTable({
                            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                            "destroy": true,
                            "paging": true,
                            "searching": true,
                            "language": oLanguage,
                            "data": jsonData,
                            "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                            "iDisplayLength": 20, //默认显示的记录数  
                            "columns": [
                                { "data": "Id", "title": "序号" },
                                { "data": "VariableName", "title": "名称" },
                                { "data": "PointerAddress", "title": "地址" }
                            ]
                        });

                } catch (e) {
                    layer.msg("json数据格式有误");
                }
            };
            fr.readAsText(file, 'gb2312');  //也是利用将图片作为url读出
        }
    });
    $("#addScriptVersionDeviceModel").select2({
        allowClear: true,
        placeholder: "请选择"
    });
    $("#updateScriptVersionDeviceModel").select2({
        allowClear: true,
        placeholder: "请选择"
    });
    var data = {}
    data.opType = 113;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        scriptData = ret.datas;
    });
    ajaxPost("/Relay/Post",
        {
            opType: 112
        },
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            valueType = ret.datas;
        });
    $("#udtScriptVersion").on("select2:select", function (e) {
        showUsuallyDictionaryTypeModel(true);
    });
    $('#scriptModel').on('select2:select', () => getScriptType(false));
    $('#showScriptSetModel').on('focus', '.precision', function () {
        if ($(this).val() == 0) {
            $(this).val('');
        }
    });
    $('#showScriptSetModel').on('blur', '.precision', function () {
        if (isStrEmptyOrUndefined($(this).val())) {
            $(this).val(0);
        }
    });
}

var jsonData = null;
var scriptData = null;
function getScriptVersionAllList(type) {
    var data = {}
    data.opType = 113;
    ajaxPost("/Relay/Post",
        data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            scriptData = ret.datas;
            var per237 = _permissionList[237].have;
            var per238 = _permissionList[238].have;
            var order = function (a, b, c, d) {
                return ++d.row;
            }
            var op = function (data, type, row) {
                var html = '<div class="btn-group">{0}{1}</div>';
                var changeBtn =
                    '<button type="button" class="btn btn-primary mbtn-group" onclick="showUpdateScriptVersionModel({0}, \'{1}\', \'{2}\',\'{3}\')">修改</button>'
                        .format(data.Id, escape(data.DeviceModelId), escape(data.ScriptName), escape(data.ScriptFile));
                var delBtn =
                    '<button type="button" class="btn btn-danger mbtn-group" onclick="deleteScriptVersion({0}, \'{1}\')">删除</button>'
                        .format(data.Id, escape(data.ScriptName));
                return html.format(per237 ? changeBtn : "", per238 ? delBtn : "");
            };
            var columns = [
                { "data": null, "title": "序号", "render": order },
                { "data": "Id", "title": "Id", "bVisible": false },
                { "data": "ScriptName", "title": "脚本名称" },
                { "data": "ValueNumber", "title": "变量数" },
                { "data": "InputNumber", "title": "输入口数" },
                { "data": "OutputNumber", "title": "输出口数" },
                { "data": 'ScriptFile', "title": "脚本文件", "render": d => d ? `<span style="vertical-align:middle;padding-right:5px">${d.slice(d.indexOf('_') + 1)}</span><button type="button" class="btn btn-success btn-xs" onclick="fileDownload(\'${escape(d)}\')" title="下载脚本文件"><span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span></button>` : '' }
            ];
            if (per237 || per238) {
                columns.push({ "data": null, "title": "操作", "render": op, "orderable": false });
            }
            $("#scriptVersionList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "columns": columns
                });
            if (type == 1)
                $("#scriptVersionModel").modal("show");
        });
}

//下载文件
function fileDownload(fileName) {
    fileName = unescape(fileName);
    var data = {
        type: fileEnum.Script,
        files: JSON.stringify([fileName])
    };
    ajaxPost("/Upload/Path", data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        downLoad(ret.data[0].path, fileName.slice(fileName.indexOf('_') + 1));
    });
}

function showManageModel() {
    getScriptVersionAllList(1);
}

var _addFirmwareUpload = null;
function showAddScriptVersionModel() {
    if (_addFirmwareUpload == null) {
        _addFirmwareUpload = initFileInput("addFile", fileEnum.Script);
    }
    $("#addFile").fileinput('clear');
    $('#addFileBox').find('.file-caption-name').attr('readonly', true).attr('placeholder', '请选择.npc文件...');
    hideClassTip("adt");
    $('#addScriptVersionDeviceModel').val('').trigger('change');
    $('#addScriptVersionName').val('');
    $("#addScriptVersionModel").modal("show");
}

function addScriptVersion() {
    var addScriptVersionDeviceModel = $("#addScriptVersionDeviceModel").val();
    var addScriptVersionName = $("#addScriptVersionName").val().trim();
    var addFile = $('#addFile').val();
    var addScriptVersionDeviceModelList = addScriptVersionDeviceModel == null ? "" : addScriptVersionDeviceModel.join(",");
    if (addScriptVersionDeviceModelList.length == 0) {
        layer.msg("请选择设备型号");
        return;
    }
    if (isStrEmptyOrUndefined(addScriptVersionName)) {
        showTip($("#addScriptVersionNameTip"), "脚本名称不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addFile)) {
        layer.msg('请选择.npc文件');
        return;
    }
    fileCallBack[fileEnum.Script] = function (fileRet) {
        if (fileRet.errno == 0) {
            $("#addScriptVersionModel").modal("hide");
            var data = {}
            data.opType = 114;
            data.opData = JSON.stringify({
                DeviceModelId: addScriptVersionDeviceModelList,
                ScriptName: addScriptVersionName,
                ScriptFile: fileRet.data
            });
            ajaxPost("/Relay/Post", data,
                function (ret) {
                    layer.msg(ret.errmsg);
                    if (ret.errno == 0) {
                        getScriptVersionAllList(0);
                    }
                });
        } else {
            layer.msg(fileRet.errmsg);
        }
    };
    var doSth = function () {
        $('#addFile').fileinput("upload");
    }
    showConfirm("添加", doSth);
}

function deleteScriptVersion(id, name) {
    var doSth = function () {
        var data = {}
        data.opType = 116;
        data.opData = JSON.stringify({
            id: id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getScriptVersionAllList(0);
                }
            });
    }
    showConfirm("删除脚本：" + unescape(name), doSth);
}

var _updateFirmwareUpload = null;
function showUpdateScriptVersionModel(id, deviceModel, name, scriptFile) {
    deviceModel = unescape(deviceModel);
    name = unescape(name);
    scriptFile = unescape(scriptFile);
    $("#updateId").html(id);
    hideClassTip("adt");
    var deviceModelList = [];
    if (!isStrEmptyOrUndefined(deviceModel))
        deviceModelList = deviceModel.split(",").map(Number);
    $("#updateScriptVersionDeviceModel").val(deviceModelList).trigger("change");
    $("#updateScriptVersionName").val(name);
    if (_updateFirmwareUpload == null)
        _updateFirmwareUpload = initFileInput("updateFile", fileEnum.Script);
    $("#updateFile").fileinput('clear');
    $('#updateFileBox').find('.file-caption-name').attr('readonly', true).attr('placeholder', '请选择.npc文件...').val(scriptFile.slice(scriptFile.indexOf('_') + 1));
    $('#oldUpdateFile').val(scriptFile);
    $("#updateScriptVersionModel").modal("show");
}

function updateScriptVersion() {
    var updateScriptVersionDeviceModel = $("#updateScriptVersionDeviceModel").val();
    var updateScriptVersionName = $("#updateScriptVersionName").val().trim();
    if (isStrEmptyOrUndefined(updateScriptVersionName)) {
        showTip($("#updateScriptVersionNameTip"), "脚本名称不能为空");
        return;
    }
    var updateScriptVersionDeviceModelList = updateScriptVersionDeviceModel == null ? "" : updateScriptVersionDeviceModel.join(",");
    if (updateScriptVersionDeviceModelList.length == 0) {
        layer.msg("请选择设备型号");
        return;
    }
    var fn = name => {
        $("#updateScriptVersionModel").modal("hide");
        var data = {}
        data.opType = 115;
        data.opData = JSON.stringify({
            id: $("#updateId").text() >> 0,
            DeviceModelId: updateScriptVersionDeviceModelList,
            ScriptName: updateScriptVersionName,
            ScriptFile: name
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getScriptVersionAllList(0);
                }
            });
    }
    var doSth;
    var upFile = $('#updateFile').val();
    if (isStrEmptyOrUndefined(upFile)) {
        doSth = () => fn($('#oldUpdateFile').val());
    } else {
        fileCallBack[fileEnum.Script] = fileRet => fileRet.errno == 0 ? fn(fileRet.data) : layer.msg(fileRet.errmsg);
        doSth = () => $('#updateFile').fileinput("upload");
    }
    showConfirm("修改", doSth);
}

var valueType = null;
var deModel = 0;
var sScrId = 0;
function getDataTypeList() {
    ajaxPost("/Relay/Post", { opType: 112 }, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        valueType = ret.datas;
        $("#aDataType").empty();
        var option = '<option value="{0}">{1}</option>';
        for (var i = 0; i < ret.datas.length; i++) {
            var data = ret.datas[i];
            $("#aDataType").append(option.format(data.Id, data.TypeName));
        }
        $("#addDataType").empty();
        var option1 = '<option value="{0}">{1}</option>';
        for (var i = 0; i < ret.datas.length; i++) {
            var data1 = ret.datas[i];
            $("#addDataType").append(option1.format(data1.Id, data1.TypeName));
        }
    });
}

function getDeviceModelList() {
    $("#valList_wrapper").parent().empty()
        .append('<table class="table table-hover table-striped" id="valList"></table>');
    $("#inList_wrapper").parent().empty()
        .append('<table class="table table-hover table-striped" id="inList"></table>');
    $("#outList_wrapper").parent().empty()
        .append('<table class="table table-hover table-striped" id="outList"></table>');
    deModel = 0;
    ajaxPost("/Relay/Post", { opType: 120 }, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $("#sDeviceModel").empty();
        $("#addScriptVersionDeviceModel").empty();
        $("#updateScriptVersionDeviceModel").empty();
        var option = '<option value="{0}">{1}</option>';
        for (var i = 0; i < ret.datas.length; i++) {
            var data = ret.datas[i];
            if (deModel == 0)
                deModel = data.Id;
            $("#sDeviceModel").append(option.format(data.Id, data.CategoryName + "-" + data.ModelName));
            $("#addScriptVersionDeviceModel").append(option.format(data.Id, data.CategoryName + "-" + data.ModelName));
            $("#updateScriptVersionDeviceModel").append(option.format(data.Id, data.CategoryName + "-" + data.ModelName));
        }
        getScriptVersionList();
    });
}

function getScriptVersionList() {
    sScrId = 0;
    var data = {}
    data.opType = 113;
    data.opData = JSON.stringify({
        //设备类型
        deviceModelId: deModel
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $("#sScriptVersion").empty();
        var option = '<option value="{0}">{1}</option>';
        for (var i = 0; i < ret.datas.length; i++) {
            var data = ret.datas[i];
            //if (sScrId == 0)
            //    sScrId = data.Id;
            $("#sScriptVersion").append(option.format(data.Id, data.ScriptName));
        }
        $("#sScriptVersion").val(0).trigger("update");
        //getScriptVersionDetailList();
    });
}

function getScriptVersionDetailList() {
    if (sScrId == 0) {
        return;
    }
    var data = {}
    data.opType = 106;
    data.opData = JSON.stringify({
        id: sScrId
    });
    $("#valList,#inList,#outList").empty();
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var scriptData = { 1: [], 2: [], 3: [] };
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            scriptData[d.VariableTypeId].push(d);
        }
        var per204 = _permissionList[204].have;
        var tablesConfig = {
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-0"i><"col-sm-12"p>',
            "pagingType": "full",
            "destroy": true,
            "paging": true,
            "deferRender": false,
            "bLengthChange": false,
            "info": false,
            "searching": true,
            "autoWidth": true,
            "language": oLanguage,
            "iDisplayLength": 20, //默认显示的记录数  
            "columns": [
                { "data": null, "title": "序号", "render": (a, b, c, d) => ++d.row },
                { "data": "Id", "title": "Id", "bVisible": false },
                { "data": "VariableName", "title": "名称" },
                { "data": "PointerAddress", "title": "地址" },
                { "data": "Remark", "title": "备注", "bVisible": false },
                { "data": null, "title": "删除", "render": d => `<button type="button" class="btn btn-danger btn-xs" onclick="delVar(${d.Id},\'${escape(d.VariableName)}\')">删除</button>`, "orderable": false, "bVisible": per204 }
            ]
        };
        //变量
        var valConfig = $.extend(true, {}, tablesConfig);
        valConfig.data = scriptData[1];
        $("#valList").DataTable(valConfig);
        //输入
        var insConfig = $.extend(true, {}, tablesConfig);
        insConfig.data = scriptData[2];
        $("#inList").DataTable(insConfig);
        //输出
        var outConfig = $.extend(true, {}, tablesConfig);
        outConfig.data = scriptData[3];
        $("#outList").DataTable(outConfig);
    });
}

//删除变量
function delVar(id, name) {
    name = unescape(name);
    var doSth = function () {
        var data = {}
        data.opType = 105;
        data.opData = JSON.stringify({ id });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getScriptVersionDetailList();
                }
            });
    }
    showConfirm(`删除：${name}`, doSth);
}


var adeModel = 0;
var asScrId = 0;
function getDeviceModelList1(type) {
    adeModel = 0;
    ajaxPost("/Relay/Post", { opType: 120 }, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }

        $("#aDeviceModel").empty();
        var option = '<option value="{0}">{1}</option>';
        for (var i = 0; i < ret.datas.length; i++) {
            var data = ret.datas[i];
            if (adeModel == 0)
                adeModel = data.Id;
            $("#aDeviceModel").append(option.format(data.Id, data.CategoryName + "-" + data.ModelName));
        }
        getScriptVersionList1(type);
    });
}

function getScriptVersionList1(type) {
    asScrId = 0;
    var data = {}
    data.opType = 113;
    data.opData = JSON.stringify({
        //设备类型
        deviceModelId: deModel
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }

        $("#aScriptVersion").empty();
        $("#jScriptVersion").empty();
        var option = '<option value="{0}">{1}</option>';
        for (var i = 0; i < ret.datas.length; i++) {
            var data = ret.datas[i];
            if (asScrId == 0)
                asScrId = data.Id;
            $("#aScriptVersion").append(option.format(data.Id, data.ScriptName));
            $("#jScriptVersion").append(option.format(data.ScriptName, data.ScriptName));
        }

        if (type == 1)
            $("#addModel").modal("show");

    });
}

function showAddModel() {
    reset();
    getDeviceModelList1(1);
}

function reset() {
    var v = $("#fScriptVersion").val();
    switch (v) {
        case "0":
            $("#avBody").empty();
            var tr = ('<tr id="av{0}">' +
                '<td><label class="control-label" id="avx{0}">{0}</label></td>' +
                '<td><input class="form-control" id="avb{0}" maxlength="20"></td>' +
                '<td><input class="form-control" oninput="onInput(this, 5, 0)" onblur="onInputEnd(this)" id="avd{0}"></td>' +
                '<td><button type="button" class="btn btn-default btn-sm" onclick="delSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
                '</tr>').format(1);
            $("#avBody").append(tr);
            max = maxV = 2;
        case "1":
            $("#jsonFile").val("");
            initDiv1();
        case "2":
        case "3":
        default:
    }
}

function initDiv1() {
    jsonData = null;
    $("#jsonList_wrapper").remove();
    $("#jsonList").remove();

    var h = '<table class="table table-hover table-striped" id="jsonList">' +
        '<thead>        ' +
        '<tr>           ' +
        '<td>序号</td>  ' +
        '<td>变量名</td>' +
        '<td>地址</td>  ' +
        '</tr>          ' +
        '</thead>       ' +
        '</table>       ';
    $("#div1").append(h);
}

var max = 2;
var maxV = 2;
function addOther() {
    //avBody
    var tr = ('<tr id="av{0}">' +
        '<td><label class="control-label" id="avx{0}">{1}</label></td>' +
        '<td><input class="form-control" id="avb{0}" maxlength="20"></td>' +
        '<td><input class="form-control" oninput="value=value.replace(/[^\\d]/g,\'\')" id="avd{0}" maxlength="5"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="delSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(max, maxV);
    $("#avBody").append(tr);
    max++;
    maxV++;
}

function delSelf(id) {
    $("#avBody").find("[id=av" + id + "]").remove();
    max--;
    maxV--;
    var o = 1;
    var childs = $("#avBody").find("label");
    for (var i = 0; i < childs.length; i++) {
        childs[i].textContent = o;
        o++;
    }
}

function addValues() {
    var v = $("#fScriptVersion").val();
    var sDeviceModel = $("#sDeviceModel").val();
    var aDataType = $("#aDataType").val();
    var postData = null;
    switch (v) {
        case "0":
            var aScriptVersion = $("#aScriptVersion").val();
            var inputData = new Array();
            var siteCount = $('#siteCount').text();
            for (var i = 1; i < max; i++) {
                if ($("#av" + i).length > 0) {
                    var variableName = $("#avb" + i).val();
                    if (isStrEmptyOrUndefined(variableName)) {
                        layer.msg("名称不能为空");
                        return;
                    }
                    var pointerAddress = $("#avd" + i).val();
                    if (isStrEmptyOrUndefined(pointerAddress)) {
                        layer.msg("地址不能为空");
                        return;
                    }
                    if (pointerAddress >> 0 > siteCount >> 0) {
                        layer.msg(`${variableName}：地址不能超过${siteCount}`);
                        return;
                    }
                    inputData.push({
                        PointerAddress: pointerAddress,
                        VariableName: variableName
                    });
                }
            }
            postData = {
                Type: v,
                DeviceModelId: sDeviceModel,
                VariableType: aDataType,
                ScriptId: aScriptVersion,
                DataNameDictionaries: inputData
            };
            break;
        case "1":
            var jsonName = $("#jsonName").val();
            if (isStrEmptyOrUndefined(jsonName)) {
                layer.msg("脚本名称不能为空");
                return;
            }
            if (jsonData == null || jsonData.length == 0) {
                layer.msg("请选择正确的json文件");
                return;
            }

            postData = {
                Type: v,
                DeviceModelId: sDeviceModel,
                VariableType: aDataType,
                ScriptName: jsonName,
                DataNameDictionaries: jsonData
            };
            break;
        case "2":
            return;
            break;
        case "3":
            return;
            break;
        default:
            return;
    }
    if (postData.DataNameDictionaries.length == 0) {
        layer.msg("请输入数据");
        return;
    }
    var doSth = function () {
        $("#addModel").modal("hide");
        var data = {}
        data.opType = 111;
        data.opData = JSON.stringify(postData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getDeviceModelList();
                }
            });
    }
    showConfirm("添加", doSth);
}

function tableToExcel() {
    //todo
    layer.msg("待完善");
}

//常用变量设置
function showUsuallyDictionaryTypeModel(refresh = false) {
    if (scriptData != null && scriptData.length > 0) {
        if (!refresh) {
            $("#udtScriptVersion").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < scriptData.length; i++) {
                var d = scriptData[i];
                $("#udtScriptVersion").append(option.format(d.Id, d.ScriptName));
                //if (d.Id == scriptId)
                //    $("#udtScriptVersion").val(scriptId).trigger("update");
            }
        }
        var data = {}
        data.opType = 118;
        data.opData = JSON.stringify({
            id: $("#udtScriptVersion").val()
        });
        ajaxPost("/Relay/Post",
            data,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }

                //if (ret.datas.length > 0) {
                usData = ret.datas;
                showUsuallyDictionary();
                //} else {
                //    if (!refresh) {
                $("#usuallyDictionaryTypeModel").modal("show");
                //    }
                //}
            });
    } else {
        if (!refresh) {
            $("#usuallyDictionaryTypeModel").modal("show");
        }
    }
}
var usData = null;
function showUsuallyDictionary() {
    var data = {}
    data.opType = 106;
    data.opData = JSON.stringify({
        id: $("#udtScriptVersion").val()
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }

        function getData(results, type) {
            var res = new Array();
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                if (result.VariableTypeId == type)
                    res.push(result);
            }
            return res;
        }

        var vData = [];
        vData["1"] = getData(ret.datas, 1);
        vData["2"] = getData(ret.datas, 2);
        vData["3"] = getData(ret.datas, 3);
        var o = 0;
        var order = function (data, type, row) {
            return ++o;
        }
        var op = function (data, type, row) {
            var html = '<div class="form-group">{0}{1}</div>';
            var sel1 = '<select class="mSel mSel1 form-control" v="{0}" id="val{0}" ov="{1}" did="{2}" vid="vid1_{3}"></select>'.format(o, data.VariableTypeId, data.Id, data.VariableNameId);
            var sel2 = '<select class="mSel mSel2 form-control" v="{0}" id="dic{0}" ov="{1}" vid="vid2_{2}"></select>'.format(o, data.DictionaryId, data.VariableNameId);

            html = html.format(sel1, sel2);
            return html;
        };
        $("#udtList")
            .DataTable({
                dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": oLanguage,
                "data": usData,
                "aLengthMenu": [35, 70, 105], //更改显示记录数选项  
                "iDisplayLength": 35, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "VariableName", "title": "变量用途" },
                    { "data": null, "title": "变量地址", "render": op, "sClass": "text-left" }
                ],
                "drawCallback": function (settings, json) {
                    var msl = $(".mSel");
                    var init = true;
                    for (var i = 0; i < msl.length; i++) {
                        if (!$(msl[i]).hasClass("done")) {
                            init = false;
                            break;
                        }
                    }
                    if (init)
                        return;
                    $(".mSel2").select2();
                    $(".mSel1").empty();
                    var option = '<option value="{0}">{1}</option>';
                    var list = $(".mSel1");
                    if (list.length > 0) {
                        for (var i = 0; i < valueType.length; i++) {
                            var d = valueType[i];
                            $(".mSel1").append(option.format(d.Id, d.TypeName));
                        }
                        var sel1s = [];
                        for (var j = 0; j < list.length; j++) {
                            var mSel1 = $(list[j]);
                            var v = mSel1.attr("v");
                            var ov = mSel1.attr("ov");
                            mSel1.val(ov).trigger("change");
                            $("#dic" + v).addClass("vt" + ov);
                            if (sel1s.indexOf(ov) == -1)
                                sel1s.push(ov);
                        }
                        for (var va in sel1s) {
                            var val = sel1s[va];
                            $(".vt" + val).empty();
                            //$(".vt" + val).append(option.format(0, "未设置"));
                            for (var i = 0; i < vData[val].length; i++) {
                                var d = vData[val][i];
                                $(".vt" + val).append(option.format(d.PointerAddress, d.PointerAddress + "-" + d.VariableName));
                            }
                        }
                        for (var j = 0; j < list.length; j++) {
                            var mSel1 = $(list[j]);
                            var v = mSel1.attr("v");
                            var ov = $("#dic" + v).attr("ov");
                            $("#dic" + v).val(ov).trigger("update");
                        }
                        $(".mSel1").addClass("done");
                        $(".mSel2").addClass("done");
                        $(".mSel1").removeClass("mSel1");
                        $(".mSel2").removeClass("mSel2");

                    }
                }
            });
        $("#usuallyDictionaryTypeModel").modal("show");
    });
}

function updateUdt() {
    var scrId = $("#udtScriptVersion").val();
    if (scrId == null)
        return;
    if (usData.length > 0) {
        var change = false;
        var postData = [];
        for (var d in usData) {
            var dt = usData[d];
            var val = $("#udtList").find(".mSel").filter("[vid=vid1_" + dt.VariableNameId + "]");
            var dic = $("#udtList").find(".mSel").filter("[vid=vid2_" + dt.VariableNameId + "]");
            if (val.length > 0) {
                var dictionaryId = $(dic).val();
                var variableTypeId = $(val).val();
                if (dictionaryId == null)
                    dictionaryId = "0";

                if (parseInt(variableTypeId) != dt.VariableTypeId || parseInt(dictionaryId) != dt.DictionaryId) {
                    change = true;
                }
                postData.push({
                    Id: dt.Id,
                    ScriptId: scrId,
                    VariableNameId: dt.VariableNameId,
                    DictionaryId: dictionaryId,
                    VariableTypeId: variableTypeId
                });
            } else {
                postData.push({
                    Id: dt.Id,
                    ScriptId: scrId,
                    VariableNameId: dt.VariableNameId,
                    DictionaryId: dt.DictionaryId,
                    VariableTypeId: dt.VariableTypeId
                });
            }
        }

        if (!change)
            return;

        var doSth = function () {
            var data = {}
            data.opType = 119;
            data.opData = JSON.stringify(postData);
            ajaxPost("/Relay/Post", data, function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0)
                    showUsuallyDictionaryTypeModel(true);
            });
        }
        showConfirm("修改", doSth);
    }
}

var statisticTypeName;
var dataStatisticType;
function showUsuallyVariableTypeModel() {
    dataStatisticType = new Array();
    var data = {}
    data.opType = 157;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var per242 = _permissionList[242].have;
            var per243 = _permissionList[243].have;
            var op = function (data, type, row) {
                var html = '<div class="btn-group">{0}{1}</div>';
                var changeBtn =
                    '<button type="button" class="btn btn-primary mbtn-group" onclick="showUpdateVariableTypeModel({0}, \'{1}\',\'{2}\')">修改</button>'
                        .format(data.Id, escape(data.VariableName), data.StatisticType);
                var delBtn =
                    '<button type="button" class="btn btn-danger mbtn-group" onclick="deleteVariableType({0}, \'{1}\')">删除</button>'
                        .format(data.Id, escape(data.VariableName));

                return html.format(per242 ? changeBtn : '', per243 ? delBtn : '');
            };
            var order = function (a, b, c, d) {
                return ++d.row;
            }
            var statistic = function (data, type, full, meta) {
                if (full.StatisticType == 0) {
                    return "";
                }
                if (full.StatisticType == 1) {
                    return "趋势图";
                }
                if (full.StatisticType == 2) {
                    return "加工记录";
                }
            }
            var yesNo = function (data, type, full, meta) {
                return full.IsDetail == true ? "是" : "否";
            }
            var columns = per242 || per243
                ? [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "VariableName", "title": "变量名称" },
                    { "data": "IsDetail", "title": "是否为设备详情", "render": yesNo },
                    { "data": "StatisticType", "title": "统计字段", "render": statistic },
                    { "data": null, "title": "操作", "render": op, "orderable": false }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "VariableName", "title": "变量名称" },
                    { "data": "IsDetail", "title": "是否为设备详情", "render": yesNo },
                    { "data": "StatisticType", "title": "统计字段", "render": statistic }
                ];
            $("#usuallyVariableTypeList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aaSorting": [0, "asc"],
                    "aLengthMenu": [15, 30, 60], //更改显示记录数选项  
                    "iDisplayLength": 15, //默认显示的记录数
                    "columns": columns
                });
            $("#usuallyVariableTypeModel").modal("show");

            for (var i = 0; i < ret.datas.length; i++) {
                dataStatisticType[i] = ret.datas[i].StatisticType;
            }

            dataStatisticType = dataStatisticType.filter(function (item, index, array) {
                return dataStatisticType.indexOf(item) === index;
            });

            dataStatisticType = dataStatisticType.sort(function (a, b) {
                return a > b ? 1 : -1;
            });

            $("#updateStatisticType").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var j = 0; j < dataStatisticType.length; j++) {
                if (dataStatisticType[j] == 0) {
                    statisticTypeName = "无";
                }
                if (dataStatisticType[j] == 1) {
                    statisticTypeName = "趋势图";
                }
                if (dataStatisticType[j] == 2) {
                    statisticTypeName = "加工记录";
                }
                $("#updateStatisticType").append(option.format(dataStatisticType[j], statisticTypeName));
            }
        });
}

function deleteVariableType(id, name) {
    var doSth = function () {
        var data = {}
        data.opType = 161;
        data.opData = JSON.stringify({
            id: id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    showUsuallyVariableTypeModel();
                }
            });
    }
    showConfirm("删除变量：" + unescape(name), doSth);
}

function showAddUsuallyVariableTypeModel() {
    $("#addVariableName").val("");
    $("#addVariableSite").val("");
    $("#addDataType").val($("#addDataType option").eq(0).val()).trigger("change");
    $("#addUsuallyVariableTypeModel").modal("show");
}

function addVariableType() {
    var variableName = $("#addVariableName").val().trim();
    var dataType = $("#addDataType").val();
    var variableSite = $("#addVariableSite").val().replace(/\b(0+)/gi, "");
    if (isStrEmptyOrUndefined(variableName)) {
        showTip($("#addVariableNameTip"), "变量名称不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(variableSite)) {
        showTip($("#addVariableSiteTip"), "变量名称不能为空");
        return;
    }
    var doSth = function () {
        $("#addUsuallyVariableTypeModel").modal("hide");
        var data = {}
        data.opType = 159;
        data.opData = JSON.stringify({
            VariableTypeId: dataType,
            DictionaryId: variableSite,
            VariableName: variableName
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    showUsuallyVariableTypeModel();
                }
            });
    }
    showConfirm("添加", doSth);
}

function showUpdateVariableTypeModel(id, variableName, statisticType) {
    $("#updateVariableId").html(id);
    variableName = unescape(variableName);
    $("#updateVariableName").val(variableName);
    $("#updateStatisticType").val(statisticType).trigger("change");
    $("#updateUsuallyVariableTypeModel").modal("show");
}

function updateVariableType() {
    var updateVariableName = $("#updateVariableName").val().trim();
    var updateStatisticType = $("#updateStatisticType").val().trim();
    if (isStrEmptyOrUndefined(updateVariableName)) {
        showTip($("#updateVariableNameTip"), "变量名称不能为空");
        return;
    }
    var id = parseInt($("#updateVariableId").html());
    var doSth = function () {
        $("#updateUsuallyVariableTypeModel").modal("hide");
        var data = {};
        data.opType = 160;
        data.opData = JSON.stringify({
            id: id,
            VariableName: updateVariableName,
            StatisticType: updateStatisticType
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    showUsuallyVariableTypeModel();
                }
            });
    }
    showConfirm("修改", doSth);
}

//脚本脚本版本
function getScriptType(isShow) {
    const data = {}
    data.opType = 113;
    data.opData = JSON.stringify({
        deviceModelId: $('#scriptModel').val()
    });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const list = ret.datas;
        const op = '<option value="{0}">{1}</option>';
        let ops = '';
        for (let i = 0, len = list.length; i < len; i++) {
            const d = ret.datas[i];
            ops += op.format(d.Id, d.ScriptName);
        }
        $('#scriptType').empty().append(ops);
        if (isShow) {
            getScriptDecimals();
        }
    }, 0);
}

//脚本小数位设置弹窗
function showScriptSetModel() {
    ajaxPost("/Relay/Post", { opType: 120 }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const list = ret.datas;
        const op = '<option value="{0}">{1}</option>';
        let ops = '';
        for (let i = 0, len = list.length; i < len; i++) {
            const d = ret.datas[i];
            ops += op.format(d.Id, `${d.CategoryName}-${d.ModelName}`);
        }
        $('#scriptModel').empty().append(ops);
        getScriptType(true);
    });
    $('#showScriptSetModel').modal('show');
}

//脚本小数位查询
function getScriptDecimals() {
    const id = $('#scriptType').val();
    if (isStrEmptyOrUndefined(id)) {
        layer.msg('请选择脚本版本');
        return;
    }
    const data = {};
    data.opType = 106;
    data.opData = JSON.stringify({ id });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#scriptVarBox,#scriptInBox,#scriptOutBox').addClass('hidden');
        const rData = ret.datas;
        const scriptData = { 1: [], 2: [], 3: [] };
        for (let i = 0, len = rData.length; i < len; i++) {
            const d = rData[i];
            scriptData[d.VariableTypeId].push(d);
        }
        _scriptPrecision = [];
        const isEnable = d => `<input type="checkbox" class="icb_minimal isEnable" value=${d}>`;
        const precision = d => `<span class="precisionText">${d}</span><input type="text" class="form-control text-center precision hidden" oninput="onInput(this, 1, 0)" onblur="onInputEnd(this)" style="min-width:100px">`;
        const tablesConfig = {
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-0"i><"col-sm-12"p>',
            pagingType: "full",
            destroy: true,
            paging: true,
            deferRender: false,
            bLengthChange: false,
            info: false,
            searching: true,
            autoWidth: true,
            language: oLanguage,
            aaSorting: [[1, 'asc']],
            iDisplayLength: 20,
            columns: [
                { data: 'Id', title: '选择', render: isEnable, orderable: false },
                { data: null, title: '序号', render: (a, b, c, d) => ++d.row },
                { data: 'VariableName', title: '名称' },
                { data: 'Precision', title: '小数位', render: precision }
            ],
            drawCallback: function () {
                $(this).find('.icb_minimal').iCheck({
                    labelHover: false,
                    cursor: true,
                    checkboxClass: 'icheckbox_minimal-blue',
                    radioClass: 'iradio_minimal-blue',
                    increaseArea: '20%'
                }).on('ifChanged', function () {
                    const tr = $(this).parents('tr');
                    if ($(this).is(':checked')) {
                        _scriptPrecision.push(tr);
                        tr.find('.precision').removeClass('hidden').val(tr.find('.precisionText').addClass('hidden').text());
                    } else {
                        _scriptPrecision.splice(_scriptPrecision.indexOf(tr), 1);
                        tr.find('.precisionText').removeClass('hidden').siblings('.precision').addClass('hidden');
                    }
                });
            }
        };
        const scriptConfig = $('#scriptConfig').val();
        switch (scriptConfig) {
            case '0':
                $('#scriptVarBox,#scriptInBox,#scriptOutBox').removeClass('hidden');
                $('#scriptVarList').DataTable(Object.assign({ data: scriptData[1] }, tablesConfig));
                $('#scriptInList').DataTable(Object.assign({ data: scriptData[2] }, tablesConfig));
                $('#scriptOutList').DataTable(Object.assign({ data: scriptData[3] }, tablesConfig));
                //$('#scriptVarList').DataTable({ ...tablesConfig, data: scriptData[1] });
                //$('#scriptInList').DataTable({ ...tablesConfig, data: scriptData[2] });
                //$('#scriptOutList').DataTable({ ...tablesConfig, data: scriptData[3] });
                break;
            case '1':
                $('#scriptVarBox').removeClass('hidden');
                $('#scriptVarList').DataTable(Object.assign({ data: scriptData[1] }, tablesConfig));
                //$('#scriptVarList').DataTable({ ...tablesConfig, data: scriptData[1] });
                break;
            case '2':
                $('#scriptInBox').removeClass('hidden');
                $('#scriptInList').DataTable(Object.assign({ data: scriptData[2] }, tablesConfig));
                //$('#scriptInList').DataTable({ ...tablesConfig, data: scriptData[2] });
                break;
            case '3':
                $('#scriptOutBox').removeClass('hidden');
                $('#scriptOutList').DataTable(Object.assign({ data: scriptData[3] }, tablesConfig));
                //$('#scriptOutList').DataTable({ ...tablesConfig, data: scriptData[3] });
                break;
            //case '0':
            //    $('#scriptVarBox,#scriptInBox,#scriptOutBox').removeClass('hidden');
            //    $('#scriptVarList').DataTable({ ...tablesConfig, data: scriptData[1] });
            //    $('#scriptInList').DataTable({ ...tablesConfig, data: scriptData[2] });
            //    $('#scriptOutList').DataTable({ ...tablesConfig, data: scriptData[3] });
            //    break;
            //case '1':
            //    $('#scriptVarBox').removeClass('hidden');
            //    $('#scriptVarList').DataTable({ ...tablesConfig, data: scriptData[1] });
            //    break;
            //case '2':
            //    $('#scriptInBox').removeClass('hidden');
            //    $('#scriptInList').DataTable({ ...tablesConfig, data: scriptData[2] });
            //    break;
            //case '3':
            //    $('#scriptOutBox').removeClass('hidden');
            //    $('#scriptOutList').DataTable({ ...tablesConfig, data: scriptData[3] });
            //    break;
        }
    });
}

let _scriptPrecision = null;

//小数位保存
function updateScriptPrecision() {
    const len = _scriptPrecision.length;
    if (!len) {
        layer.msg('请先设置小数位');
        return;
    }
    const list = [];
    for (let i = 0; i < len; i++) {
        const tr = _scriptPrecision[i];
        const pre = tr.find('.precision').val().trim() >> 0;
        if (pre > 4) {
            layer.msg('小数最多设置4位');
            return;
        }
        list.push({
            id: tr.find('.isEnable').val(),
            Precision: pre
        });
    }
    const data = {};
    data.opType = 167;
    data.opData = JSON.stringify(list);
    ajaxPost('/Relay/Post', data, ret => {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            getScriptDecimals();
        }
    });
}