function pageReady() {
    $(".ads").css("width", "100%");
    $(".ads").select2();
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
    $("#aDataType").change(function (e) {
        var aDataType = $("#aDataType").val();
        var fScriptVersion = $("#fScriptVersion").val();
        switch (fScriptVersion) {
            case "1":
                $("#jsonFile").val("");
                initDiv1();
            default:
        }

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
    var opType = 113;
    if (!checkPermission(opType)) {
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        scriptData = ret.datas;
    });
    opType = 112;
    if (!checkPermission(opType)) {
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
            valueType = ret.datas;
        });
    $("#udtScriptVersion").on("select2:select", function (e) {
        showUsuallyDictionaryTypeModel(true);
    });
    if (!checkPermission(111)) {
        $("#showAddModel").addClass("hidden");
    }
    if (!checkPermission(114)) {
        $("#showAddScriptVersionModel").addClass("hidden");
    }
}
var jsonData = null;
var scriptData = null;
function getScriptVersionAllList(type) {
    var opType = 113;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post",
        data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            scriptData = ret.datas;
            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var op = function (data, type, row) {
                var html = '<div class="btn-group">{0}{1}</div>';
                var changeBtn =
                    '<button type="button" class="btn btn-primary mbtn-group" onclick="showUpdateScriptVersionModel({0}, \'{1}\', \'{2}\')">修改</button>'
                        .format(data.Id, escape(data.DeviceModelId), escape(data.ScriptName));
                var delBtn =
                    '<button type="button" class="btn btn-danger mbtn-group" onclick="deleteScriptVersion({0}, \'{1}\')">删除</button>'
                        .format(data.Id, escape(data.ScriptName));

                html = html.format(
                    checkPermission(115) ? changeBtn : "",
                    checkPermission(116) ? delBtn : "");
                return html;
            };
            var columns = checkPermission(115) || checkPermission(116)
                ? [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "ScriptName", "title": "脚本名称" },
                    { "data": "ValueNumber", "title": "变量数" },
                    { "data": "InputNumber", "title": "输入口数" },
                    { "data": "OutputNumber", "title": "输出口数" },
                    { "data": null, "title": "操作", "render": op }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "ScriptName", "title": "脚本名称" },
                    { "data": "ValueNumber", "title": "变量数" },
                    { "data": "InputNumber", "title": "输入口数" },
                    { "data": "OutputNumber", "title": "输出口数" }
                ];
            $("#scriptVersionList")
                .DataTable({
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

function showManageModel() {
    getScriptVersionAllList(1);
}

function showAddScriptVersionModel() {
    hideClassTip("adt");
    $("#addScriptVersionModel").modal("show");
}

function addScriptVersion() {
    var opType = 114;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var addScriptVersionDeviceModel = $("#addScriptVersionDeviceModel").val();
    var addScriptVersionName = $("#addScriptVersionName").val().trim();
    if (isStrEmptyOrUndefined(addScriptVersionName)) {
        showTip($("#addScriptVersionNameTip"), "脚本名称不能为空");
        return;
    }
    var addScriptVersionDeviceModelList = addScriptVersionDeviceModel == null ? "" : addScriptVersionDeviceModel.join(",");
    if (addScriptVersionDeviceModelList.length == 0) {
        layer.msg("请选择设备型号");
        return;
    }
    var doSth = function () {
        $("#addScriptVersionModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            //类型名称
            DeviceModelId: addScriptVersionDeviceModelList,
            //描述
            ScriptName: addScriptVersionName,
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getScriptVersionAllList(0);
                }
            });
    }
    showConfirm("添加", doSth);
}

function deleteScriptVersion(id, name) {
    var opType = 116;
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
                    getScriptVersionAllList(0);
                }
            });
    }
    showConfirm("删除脚本：" + unescape(name), doSth);
}

function showUpdateScriptVersionModel(id, deviceModel, name) {
    deviceModel = unescape(deviceModel);
    name = unescape(name);
    $("#updateId").html(id);
    hideClassTip("adt");
    var deviceModelList = [];
    if (!isStrEmptyOrUndefined(deviceModel))
        deviceModelList = deviceModel.split(",").map(Number);

    $("#updateScriptVersionDeviceModel").val(deviceModelList).trigger("change");
    $("#updateScriptVersionName").val(name);
    $("#updateScriptVersionModel").modal("show");
}

function updateScriptVersion() {
    var opType = 115;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
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
    var id = parseInt($("#updateId").html());
    var doSth = function () {
        $("#updateScriptVersionModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id,
            //类型名称
            DeviceModelId: updateScriptVersionDeviceModelList,
            //描述
            ScriptName: updateScriptVersionName,
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getScriptVersionAllList(0);
                }
            });
    }
    showConfirm("修改", doSth);
}

var valueType = null;
var deModel = 0;
var sScrId = 0;
function getDataTypeList() {
    var opType = 112;
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
    var opType = 120;
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
    var opType = 105;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        //设备类型
        id: deModel
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
    var opType = 106;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    if (sScrId == 0) {
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        //设备类型
        id: sScrId
    });

    $("#valList").empty();
    $("#inList").empty();
    $("#outList").empty();
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

        var data1 = getData(ret.datas, 1);
        var o1 = 0;
        var order1 = function (data, type, row) {
            return ++o1;
        }
        $("#valList")
            .DataTable({
                "pagingType": "full",
                "destroy": true,
                "paging": true,
                "deferRender": false,
                "bLengthChange": false,
                "info": false,
                "searching": true,
                "autoWidth": true,
                "language": oLanguage,
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数  
                "data": data1,
                "columns": [
                    { "data": null, "title": "序号", "render": order1 },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "VariableName", "title": "名称" },
                    { "data": "PointerAddress", "title": "地址" },
                    { "data": "Remark", "title": "备注", "bVisible": false}
                ]
            });
        var data2 = getData(ret.datas, 2);
        var o2 = 0;
        var order2 = function (data, type, row) {
            return ++o2;
        }
        $("#inList")
            .DataTable({
                "pagingType": "full",
                "destroy": true,
                "paging": true,
                "deferRender": false,
                "bLengthChange": false,
                "info": false,
                "searching": true,
                "autoWidth": true,
                "language": oLanguage,
                "data": data2,
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数  
                "columns": [
                    { "data": null, "title": "序号", "render": order2 },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "VariableName", "title": "名称" },
                    { "data": "PointerAddress", "title": "地址" },
                    { "data": "Remark", "title": "备注", "bVisible": false}
                ]
            });
        var data3 = getData(ret.datas, 3);
        var o3 = 0;
        var order3 = function (data, type, row) {
            return ++o3;
        }
        $("#outList")
            .DataTable({
                "pagingType": "full",
                "destroy": true,
                "paging": true,
                "deferRender": false,
                "bLengthChange": false,
                "info": false,
                "searching": true,
                "autoWidth": true,
                "language": oLanguage,
                "data": data3,
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数  
                "columns": [
                    { "data": null, "title": "序号", "render": order3 },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "VariableName", "title": "名称" },
                    { "data": "PointerAddress", "title": "地址" },
                    { "data": "Remark", "title": "备注", "bVisible": false}
                ]
            });
    });
}


var adeModel = 0;
var asScrId = 0;
function getDeviceModelList1(type) {
    adeModel = 0;
    var opType = 120;
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
    var opType = 105;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        //设备类型
        id: adeModel
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
    //$("#fScriptVersion").val(0).trigger("change");
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
                '<td><input class="form-control" oninput="value=value.replace(/[^\\d]/g,\'\')" id="avd{0}" maxlength="5"></td>' +
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
    var opType = 111;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var v = $("#fScriptVersion").val();
    var sDeviceModel = $("#sDeviceModel").val();
    var aDataType = $("#aDataType").val();
    var postData = null;
    switch (v) {
        case "0":
            var aScriptVersion = $("#aScriptVersion").val();
            var inputData = new Array();
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
        data.opType = opType;
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

        var opType = 118;
        if (!checkPermission(opType)) {
            layer.msg("没有权限");
            return;
        }
        var data = {}
        data.opType = opType;
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
    var opType = 106;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var data = {}
    data.opType = opType;
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
                    { "data": null, "title": "变量地址", "render": op, "sClass": "text-left" },
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
        var opType = 119;
        if (!checkPermission(opType)) {
            layer.msg("没有权限");
            return;
        }
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
            data.opType = opType;
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
    var opType = 157;
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
                var html = '<div class="btn-group">{0}{1}</div>';
                var changeBtn =
                    '<button type="button" class="btn btn-primary mbtn-group" onclick="showUpdateVariableTypeModel({0}, \'{1}\',\'{2}\')">修改</button>'
                        .format(data.Id, escape(data.VariableName), data.StatisticType);
                var delBtn =
                    '<button type="button" class="btn btn-danger mbtn-group" onclick="deleteVariableType({0}, \'{1}\')">删除</button>'
                        .format(data.Id, escape(data.VariableName));

                html = html.format(
                    checkPermission(160) ? changeBtn : "",
                    checkPermission(161) ? delBtn : "");
                return html;
            };
            var o = 0;
            var order = function (data, type, row) {
                return ++o;
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
            var columns = checkPermission(160) || checkPermission(161)
                ? [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "VariableName", "title": "变量名称" },
                    { "data": "IsDetail", "title": "是否为设备详情", "render": yesNo },
                    { "data": "StatisticType", "title": "统计字段", "render": statistic },
                    { "data": null, "title": "操作", "render": op }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "VariableName", "title": "变量名称" },
                    { "data": "IsDetail", "title": "是否为设备详情", "render": yesNo },
                    { "data": "StatisticType", "title": "统计字段", "render": statistic }
                ];
            var defs = checkPermission(160) || checkPermission(161)
                ? [
                    { "orderable": false, "targets": 4 }
                ]
                : [];
            $("#usuallyVariableTypeList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aaSorting": [0, "asc"],
                    "aLengthMenu": [15, 30, 60], //更改显示记录数选项  
                    "iDisplayLength": 15, //默认显示的记录数
                    "columns": columns,
                    "columnDefs": defs
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
    var opType = 161;
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
    var opType = 159;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
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
        data.opType = opType;
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
    var opType = 160;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
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
        data.opType = opType;
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