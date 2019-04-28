function pageReady() {
    $(".ads").css("width", "100%");
    $(".ads").select2();
    getDataTypeList();
    getDeviceModelList();
    //showAddModel();
    $("#fScriptVersion").change(function () {
        $(".sd ").addClass("hidden");
        var v = $("#fScriptVersion").val();
        $("#div" + v).removeClass("hidden");
    });

    $("#sScriptVersion").on("select2:select", function (e) {
        sScrId = parseInt($("#sScriptVersion").val());
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
    $("#jsonFile").change(function (e) {
        initDiv1();
        var file = e.target.files[0];
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
                            Id: i + 1,
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
                            "language": { "url": "/content/datatables_language.json" },
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
}
var jsonData = null;

function getScriptVersionAllList(type) {
    var opType = 113;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }

        var o = 0;
        var order = function (data, type, row) {
            return ++o;
        }
        var op = function (data, type, row) {
            var html = '<div class="btn-group">{0}{1}</div>';
            var changeBtn = '<button type="button" class="btn btn-primary" onclick="showUpdateScriptVersionModel({0}, {1}, \'{2}\')">修改</button>'.format(data.Id, data.DeviceModelId, data.ScriptName);
            var delBtn = '<button type="button" class="btn btn-danger" onclick="DeleteScriptVersion({0}, \'{1}\')">删除</button>'.format(data.Id, data.ScriptName);

            html = html.format(
                checkPermission(115) ? changeBtn : "",
                checkPermission(116) ? delBtn : "");
            return html;
        };
        $("#scriptVersionList")
            .DataTable({
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": { "url": "/content/datatables_language.json" },
                "data": ret.datas,
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数  
                "columns": [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "ScriptName", "title": "脚本名称" },
                    { "data": "ModelName", "title": "设备型号" },
                    { "data": "ValueNumber", "title": "变量数" },
                    { "data": "InputNumber", "title": "输入口数" },
                    { "data": "OutputNumber", "title": "输出口数" },
                    { "data": null, "title": "操作", "render": op },
                ]
            });
        if (type == 1)
            $("#scriptVersionModel").modal("show");
    });
}

function showManageModel() {
    getScriptVersionAllList(1);
}

function showAddScriptVersionModel() {
    $("#addScriptVersionModel").modal("show");
}

function addScriptVersion() {
    var opType = 114;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var addScriptVersionDeviceModel = $("#addScriptVersionDeviceModel").val();
    var addScriptVersionName = $("#addScriptVersionName").val();
    if (isStrEmptyOrUndefined(addScriptVersionName)) {
        showTip($("#addScriptVersionNameTip"), "脚本名称不能为空");
        return;
    }
    var doSth = function () {
        $("#addScriptVersionModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            //类型名称
            DeviceModelId: addScriptVersionDeviceModel,
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

function DeleteScriptVersion(id, name) {
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
    showConfirm("删除脚本：" + name, doSth);
}

function showUpdateScriptVersionModel(id, deviceModle, name) {
    $("#updateId").html(id);
    $("#updateScriptVersionDeviceModel").val(deviceModle);
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
    var updateScriptVersionName = $("#updateScriptVersionName").val();
    if (isStrEmptyOrUndefined(updateScriptVersionName)) {
        showTip($("#updateScriptVersionNameTip"), "脚本名称不能为空");
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
            DeviceModelId: updateScriptVersionDeviceModel,
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

            $("#aDataType").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#aDataType").append(option.format(data.Id, data.TypeName));
            }
        });
}

function getDeviceModelList() {
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
                $("#sDeviceModel").append(option.format(data.Id, data.ModelName));
                $("#addScriptVersionDeviceModel").append(option.format(data.Id, data.ModelName));
                $("#updateScriptVersionDeviceModel").append(option.format(data.Id, data.ModelName));
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
            if (sScrId == 0)
                sScrId = data.Id;
            $("#sScriptVersion").append(option.format(data.Id, data.ScriptName));
        }

        getScriptVersionDetailList();


    });
}

function getScriptVersionDetailList() {
    var opType = 106;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    if (sScrId == 0) {

    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        //设备类型
        id: sScrId
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

        var data1 = getData(ret.datas, 1);
        var o1 = 0;
        var order1 = function (data, type, row) {
            return ++o1;
        }
        $("#valList").empty();
        $("#valList")
            .DataTable({
                "destroy": true,
                "paging": true,
                "searching": true,
                "autoWidth": true,
                "language": { "url": "/content/datatables_language.json" },
                "data": data1,
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数  
                "columns": [
                    { "data": null, "title": "序号", "render": order1 },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "VariableName", "title": "名称" },
                    { "data": "PointerAddress", "title": "地址" },
                    { "data": "Remark", "title": "备注" },
                ]
            });
        var data2 = getData(ret.datas, 2);
        var o2 = 0;
        var order2 = function (data, type, row) {
            return ++o2;
        }
        $("#inList")
            .DataTable({
                "destroy": true,
                "paging": true,
                "searching": true,
                "autoWidth": true,
                "language": { "url": "/content/datatables_language.json" },
                "data": data2,
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数  
                "columns": [
                    { "data": null, "title": "序号", "render": order2 },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "VariableName", "title": "名称" },
                    { "data": "PointerAddress", "title": "地址" },
                    { "data": "Remark", "title": "备注" },
                ]
            });
        var data3 = getData(ret.datas, 3);
        var o3 = 0;
        var order3 = function (data, type, row) {
            return ++o3;
        }
        $("#outList")
            .DataTable({
                "destroy": true,
                "paging": true,
                "searching": true,
                "autoWidth": true,
                "language": { "url": "/content/datatables_language.json" },
                "data": data3,
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数  
                "columns": [
                    { "data": null, "title": "序号", "render": order3 },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "VariableName", "title": "名称" },
                    { "data": "PointerAddress", "title": "地址" },
                    { "data": "Remark", "title": "备注" },
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
                $("#aDeviceModel").append(option.format(data.Id, data.ModelName));
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
    getDeviceModelList1(1);
}

function reset() {
    var v = $("#fScriptVersion").val();
    switch (v) {
        case "0":
            $("#avBody").empty();
            var tr = ('<tr id="av{0}">' +
                '<td><label class="control-label" id="avx{0}">{0}</label></td>' +
                '<td><input class="form-control" id="avb{0}"></td>' +
                '<td><input class="form-control" oninput="value=value.replace(/[^\\d]/g,\'\')" id="avd{0}"></td>' +
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
        '<td><input class="form-control" id="avb{0}"></td>' +
        '<td><input class="form-control" oninput="value=value.replace(/[^\\d]/g,\'\')" id="avd{0}"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="delSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(max, maxV);
    $("#avBody").append(tr);
    max++;
    maxV++;
}

function delSelf(id) {
    $("#avBody").find("[id=av" + id + "]").remove();
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
    var postData;
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
            break;
        case "3":
            break;
        default:
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
