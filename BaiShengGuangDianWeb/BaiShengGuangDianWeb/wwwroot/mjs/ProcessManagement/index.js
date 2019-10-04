function pageReady() {

    $(".ms2").select2();
    getProcessList();

    $("#pdProcess1").on("select2:select", function (e) {
        var id = $("#pdProcess1").val();
        showProcessDetailModel(id);
    });
    $("#pdProductionProcessName2").on("select2:select", function (e) {
        var id = $("#pdProductionProcessName2").val();
        showProcessDetailModel(id);
    });
    $("#pdDeviceModel3").on("select2:select", function (e) {
        var id = $("#pdDeviceModel3").val();
        showProcessDetailModel(id);
    });
    $("#pdCode4").on("select2:select", function (e) {
        var id = $("#pdCode4").val();
        showProcessDetailModel(id);
    });
    $(".ms3").select2({
        allowClear: true,
        placeholder: "请选择"
    });

    $("#apDeviceModel").on("select2:select", function (e) {
        getDeviceList(-1);
    });
    $("#apDeviceModel").on("select2:unselect", function (e) {
        getDeviceList(-1);
    });
    $("#apProductionProcessName").on("select2:select", function (e) {
        getDeviceList(-1);
    });
    $("#apProductionProcessName").on("select2:unselect", function (e) {
        getDeviceList(-1);
    });
    if (!checkPermission(316)) {
        $("#showAddModel").addClass("hidden");
    }
    $("#apBody").off("focusin").on("focusin", "input", function () {
        var v = $(this).val();
        if (v == 0) {
            $(this).val("");
        }
    });
    $("#apBody").off("focusout").on("focusout", "input", function () {
        var v = $(this).val();
        if (isStrEmptyOrUndefined(v)) {
            $(this).val("0");
        }
    });
}

var lastData = null;
var lastType = 0;
var cData = null;
function getProcessList(type = 307) {
    var opType = type;
    if (type == -1)
        if (lastType == 0)
            return;
        else
            opType = lastType;

    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    if (type != -1)
        lastType = type;
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            lastData = ret.datas;
            var op = function (data, type, row) {
                var html = "{0}{1}{2}{3}";
                var detailBtn = '<button type="button" class="btn btn-primary" onclick="showProcessDetailModel({0})">详情</button>'.format(data.Id);
                var updateBtn = '<button type="button" class="btn btn-warning" onclick="showUpdateProcessModel({0})">修改</button>'.format(data.Id);
                var copyBtn = '<button type="button" class="btn btn-info" onclick="showAddModel({0})">拷贝</button>'.format(data.Id);
                var delBtn = '<button type="button" class="btn btn-danger" onclick="deleteProcess({0}, \'{1}\')">删除</button>'.format(data.Id, escape(data.ProcessNumber));

                html = html.format(
                    checkPermission(313) ? detailBtn : "",
                    checkPermission(313) && lastType == 307 ? updateBtn : "",
                    checkPermission(316) && lastType == 307 ? copyBtn : "",
                    checkPermission(317) && lastType == 307 ? delBtn : "");
                return html;
            }
            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var columns = checkPermission(313) || ((checkPermission(316) || checkPermission(317)) && lastType == 307)
                ? [
                    { "data": null, "title": "操作", "render": op },
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "MarkedDateTime", "title": "修改时间" },
                    { "data": "ProcessNumber", "title": "工艺编号" },
                    { "data": "ModelName", "title": "设备型号" },
                    { "data": "ProductionProcessName", "title": "产品型号" },
                    { "data": "Code", "title": "机台号" }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "MarkedDateTime", "title": "修改时间" },
                    { "data": "ProcessNumber", "title": "工艺编号" },
                    { "data": "ModelName", "title": "设备型号" },
                    { "data": "ProductionProcessName", "title": "产品型号" },
                    { "data": "Code", "title": "机台号" }
                ];
            var rProcessNumber = function (data, type, full, meta) {
                if (full.ProcessNumber) {
                    if (full.ProcessNumber.length > tdShowContentLength) {
                        return full.ProcessNumber.substr(0, tdShowContentLength) +
                            '<a href = \"javascript:showDetailModel(\'{0}\', \'{1}\')\">...</a> '
                                .format(escape(full.ProcessNumber), escape('工艺编号'));
                    } else {
                        return full.ProcessNumber;
                    }
                } else {
                    return "";
                }
            };
            var rModelName = function (data, type, full, meta) {
                if (full.ModelName) {
                    if (full.ModelName.length > tdShowContentLength) {
                        return full.ModelName.substr(0, tdShowContentLength) +
                            '<a href = \"javascript:showDetailModel(\'{0}\', \'{1}\')\">...</a> '
                                .format(escape(full.ModelName), escape('设备型号'));
                    } else {
                        return full.ModelName;
                    }
                } else {
                    return "";
                }
            };
            var rProductionProcessName = function (data, type, full, meta) {
                if (full.ProductionProcessName) {
                    if (full.ProductionProcessName.length > tdShowContentLength) {
                        return full.ProductionProcessName.substr(0, tdShowContentLength) +
                            '<a href = \"javascript:showDetailModel(\'{0}\', \'{1}\')\">...</a> '
                                .format(escape(full.ProductionProcessName), escape('产品型号'));
                    } else {
                        return full.ProductionProcessName;
                    }
                } else {
                    return "";
                }
            };
            var rCode = function (data, type, full, meta) {
                if (full.Code) {
                    if (full.Code.length > tdShowContentLength) {
                        return full.Code.substr(0, tdShowContentLength) +
                            '<a href = \"javascript:showDetailModel(\'{0}\', \'{1}\')\">...</a> '
                                .format(escape(full.Code), escape('机台号'));
                    } else {
                        return full.Code;
                    }
                } else {
                    return "";
                }
            };
            var defs = checkPermission(313) || ((checkPermission(316) || checkPermission(317)) && lastType == 307)
                ? [
                    { "orderable": false, "targets": 0 },
                    {
                        "targets": [4],
                        "render": rProcessNumber
                    },
                    {
                        "targets": [5],
                        "render": rModelName
                    },
                    {
                        "targets": [6],
                        "render": rProductionProcessName
                    },
                    {
                        "targets": [7],
                        "render": rCode,
                        "type": "html-percent"
                    }
                ]
                : [
                    {
                        "targets": [3],
                        "render": rProcessNumber
                    },
                    {
                        "targets": [4],
                        "render": rModelName
                    },
                    {
                        "targets": [5],
                        "render": rProductionProcessName
                    },
                    {
                        "targets": [6],
                        "render": rCode,
                        "type": "html-percent"
                    }
                ];
            $("#processList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aaSorting": [[1, "asc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": columns,
                    "columnDefs": defs
                });
        });
}

function showDetailModel(content, title) {
    content = unescape(content);
    title = unescape(title);
    $("#detailTitle").text(title);
    $("#detail").text(content);
    $("#detailModel").modal("show");
}

function deleteProcess(id, name) {
    name = unescape(name);

    var opType = 317;
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
                    getProcessList(lastType);
                }
            });
    }
    showConfirm("删除工艺编号：" + name, doSth);
}

function showProcessDetailModel(id) {
    $(".dd").addClass("hidden");
    $("." + lastType).removeClass("hidden");
    var option;
    var f;
    var i;
    var d;
    var data;
    switch (lastType) {
        case 307:
            $("#pdProcess1").empty();
            $("#pdDeviceModel1").html("");
            $("#pdProductionProcessName1").html("");
            $("#pdCode1").html("");
            $("#pdProcessDataList1").empty();

            if (lastData.length > 0) {
                f = false;
                option = '<option value="{0}">{1}</option>';
                for (i = 0; i < lastData.length; i++) {
                    d = lastData[i];
                    $("#pdProcess1").append(option.format(d.Id, d.ProcessNumber));
                    if (d.Id == id) {
                        f = true;
                        $("#pdDeviceModel1").html(d.ModelName);
                        $("#pdProductionProcessName1").html(d.ProductionProcessName);
                        $("#pdCode1").html(d.Code);
                    }
                }
                id = f ? id : lastData[0].Id;
                $("#pdProcess1").val(id).trigger("change");
                data = {};
                data.opType = 300;
                data.opData = JSON.stringify({
                    // 工艺编号
                    Id: id
                });
                ajaxPost("/Relay/Post",
                    data,
                    function (ret) {
                        if (ret.errno != 0) {
                            layer.msg(ret.errmsg);
                            return;
                        }

                        //加压时间(M:S)
                        var pressurizeTime = function (data, type, row) {
                            return data.PressurizeMinute + " : " + data.PressurizeSecond;
                        }
                        //工序时间(M:S)
                        var processTime = function (data, type, row) {
                            return data.ProcessMinute + " : " + data.ProcessSecond;
                        }
                        $("#pdProcessDataList1")
                            .DataTable({
                                "destroy": true,
                                "bSort": false,
                                "language": { "url": "/content/datatables_language.json" },
                                "data": ret.datas,
                                "aaSorting": [[0, "asc"]],
                                "columns": [
                                    { "data": "ProcessOrder", "title": "NO" },
                                    { "data": null, "title": "加压时间(M:S)", "render": pressurizeTime },
                                    { "data": null, "title": "工序时间(M:S)", "render": processTime },
                                    { "data": "Pressure", "title": "设定压力(Kg)" },
                                    { "data": "Speed", "title": "下盘速度(rpm)" }
                                ]
                            });

                        $("#processDetailModel").modal("show");
                    });
            } else {
                $("#processDetailModel").modal("show");
            }
            break;
        case 308:
            $("#pdProductionProcessName2").empty();
            $("#pdProcessList2").empty();
            if (lastData.length > 0) {
                f = false;
                option = '<option value="{0}">{1}</option>';
                for (i = 0; i < lastData.length; i++) {
                    d = lastData[i];
                    if (d.Id == id) {
                        f = true;
                    }
                    $("#pdProductionProcessName2").append(option.format(d.Id, d.ProductionProcessName));
                }
                id = f ? id : lastData[0].Id;
                $("#pdProductionProcessName2").val(id).trigger("change");

                data = {};
                data.opType = 320;
                data.opData = JSON.stringify({
                    id: id
                });
                ajaxPost("/Relay/Post",
                    data,
                    function (ret) {
                        if (ret.errno != 0) {
                            layer.msg(ret.errmsg);
                            return;
                        }

                        var o = 0;
                        var order = function (data, type, row) {
                            return ++o;
                        }
                        $("#pdProcessList2")
                            .DataTable({
                                "destroy": true,
                                "bSort": true,
                                "language": { "url": "/content/datatables_language.json" },
                                "data": ret.datas,
                                "aaSorting": [[0, "asc"]],
                                "columns": [
                                    { "data": null, "title": "序号", "render": order },
                                    { "data": "Id", "title": "Id", "bVisible": false },
                                    { "data": "ProcessNumber", "title": "工艺编号" },
                                    { "data": "Code", "title": "适用机台号" }
                                ],
                                "columnDefs": [
                                    {
                                        "targets": [3],
                                        "render": function (data, type, full, meta) {
                                            if (full.Code) {
                                                if (full.Code.length > tdShowContentLength) {
                                                    return full.Code.substr(0, tdShowContentLength) +
                                                        '<a href = \"javascript:showDetailModel(\'{0}\',\'{1}\')\">...</a> '
                                                            .format(escape(full.Code), escape("适用机台号"));
                                                } else {
                                                    return full.Code;
                                                }
                                            } else {
                                                return "";
                                            }
                                        }
                                    }
                                ]
                            });

                        $("#processDetailModel").modal("show");
                    });
            } else {
                $("#processDetailModel").modal("show");
            }
            break;
        case 309:
            $("#pdDeviceModel3").empty();
            $("#pdProcessList3").empty();
            if (lastData.length > 0) {
                f = false;
                option = '<option value="{0}">{1}</option>';
                for (i = 0; i < lastData.length; i++) {
                    d = lastData[i];
                    if (d.Id == id) {
                        f = true;
                    }
                    $("#pdDeviceModel3").append(option.format(d.Id, d.ModelName));
                }
                id = f ? id : lastData[0].Id;
                $("#pdDeviceModel3").val(id).trigger("change");

                data = {};
                data.opType = 321;
                data.opData = JSON.stringify({
                    id: id
                });
                ajaxPost("/Relay/Post",
                    data,
                    function (ret) {
                        if (ret.errno != 0) {
                            layer.msg(ret.errmsg);
                            return;
                        }

                        var o = 0;
                        var order = function (data, type, row) {
                            return ++o;
                        }
                        $("#pdProcessList3")
                            .DataTable({
                                "destroy": true,
                                "bSort": true,
                                "language": { "url": "/content/datatables_language.json" },
                                "data": ret.datas,
                                "aaSorting": [[0, "asc"]],
                                "columns": [
                                    { "data": null, "title": "序号", "render": order },
                                    { "data": "Id", "title": "Id", "bVisible": false },
                                    { "data": "Code", "title": "机台号" },
                                    { "data": "ProcessNumber", "title": "所用工艺编号" }
                                ],
                                "columnDefs": [
                                    { "type": "html-percent", "targets": [2] },
                                    {
                                        "targets": [3],
                                        "render": function (data, type, full, meta) {
                                            if (full.ProcessNumber) {
                                                if (full.ProcessNumber.length > tdShowContentLength) {
                                                    return full.ProcessNumber.substr(0, tdShowContentLength) +
                                                        '<a href = \"javascript:showDetailModel(\'{0}\',\'{1}\')\">...</a> '
                                                            .format(escape(full.ProcessNumber), escape("所用工艺编号"));
                                                } else {
                                                    return full.ProcessNumber;
                                                }
                                            } else {
                                                return "";
                                            }
                                        }
                                    }
                                ]
                            });

                        $("#processDetailModel").modal("show");
                    });
            } else {
                $("#processDetailModel").modal("show");
            }
            break;
        case 310:
            $("#pdCode4").empty();
            $("#pdDeviceModel4").html("");
            $("#pdProcessList4").empty();
            if (lastData.length > 0) {
                f = false;
                option = '<option value="{0}">{1}</option>';
                for (i = 0; i < lastData.length; i++) {
                    d = lastData[i];
                    if (d.Id == id) {
                        f = true;
                    }
                    $("#pdCode4").append(option.format(d.Id, d.Code));
                }
                id = f ? id : lastData[0].Id;
                $("#pdCode4").val(id).trigger("change");

                data = {};
                data.opType = 322;
                data.opData = JSON.stringify({
                    id: id
                });
                ajaxPost("/Relay/Post",
                    data,
                    function (ret) {
                        if (ret.errno != 0) {
                            layer.msg(ret.errmsg);
                            return;
                        }

                        if (ret.datas.length > 0)
                            $("#pdDeviceModel4").html(ret.datas[0].ModelName);

                        var o = 0;
                        var order = function (data, type, row) {
                            return ++o;
                        }
                        $("#pdProcessList4")
                            .DataTable({
                                "destroy": true,
                                "bSort": true,
                                "language": { "url": "/content/datatables_language.json" },
                                "data": ret.datas,
                                "aaSorting": [[0, "asc"]],
                                "columns": [
                                    { "data": null, "title": "序号", "render": order },
                                    { "data": "Id", "title": "Id", "bVisible": false },
                                    { "data": "ProductionProcessName", "title": "产品型号" },
                                    { "data": "ProcessNumber", "title": "工艺编号" },
                                ]
                            });

                        $("#processDetailModel").modal("show");
                    });
            } else {
                $("#processDetailModel").modal("show");
            }
            break;
    }

}

//添加
function showAddModel(id) {
    $(".opb").addClass("hidden");
    $("#addProcess").removeClass("hidden");
    cData = null;
    hideClassTip("adt");
    $("#apProcess").val("");
    if (id == null) {
        apReset();
        getDeviceModelList();
    } else {
        $("#apBody").empty();
        $("#addOtherBtn").removeClass("hidden");
        max = maxV = 1;
        var data = {};
        data.opType = 300;
        data.opData = JSON.stringify({
            // 工艺编号
            Id: id
        });
        ajaxPost("/Relay/Post",
            data,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }

                var tr = '<tr id="ap{0}" value="{2}">' +
                    '<td><label class="control-label" id="apx{0}">{1}</label></td>' +
                    '<td><input type="tel" class="form-control text-center" id="apJy1{0}" value="{3}" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
                    '<td><input type="tel" class="form-control text-center" id="apJy2{0}" value="{4}" oninput="value=value.replace(/[^\\d]/g,\'\')" onblur="value=isStrEmptyOrUndefined(value)?\'\':(parseInt(value)>59?59:parseInt(value))" maxlength="9"></td>' +
                    '<td><input type="tel" class="form-control text-center" id="apGx1{0}" value="{5}" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
                    '<td><input type="tel" class="form-control text-center" id="apGx2{0}" value="{6}" oninput="value=value.replace(/[^\\d]/g,\'\')" onblur="value=isStrEmptyOrUndefined(value)?\'\':(parseInt(value)>59?59:parseInt(value))" maxlength="9"></td>' +
                    '<td><input type="tel" class="form-control text-center" id="apYl{0}"  value="{7}" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
                    '<td><input type="tel" class="form-control text-center" id="apSd{0}"  value="{8}" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
                    '<td><button type="button" class="btn btn-default btn-sm" onclick="delSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
                    '</tr>';
                for (var j = 0; j < ret.datas.length; j++) {
                    var processData = ret.datas[j];
                    $("#apBody").append(tr.format(max, maxV, processData.Id,
                        processData.PressurizeMinute, processData.PressurizeSecond,
                        processData.ProcessMinute, processData.ProcessSecond,
                        processData.Pressure, processData.Speed));
                    max++;
                    maxV++;
                }
                if (ret.datas.length == maxProcessData) {
                    $("#addOtherBtn").addClass("hidden");
                }
                getDeviceModelList();
            });
    }
}

function getDeviceModelList() {
    $("#apDeviceModel").empty();
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

            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#apDeviceModel").append(option.format(data.Id, data.CategoryName + "-" + data.ModelName));
            }
            if (cData != null)
                $("#apDeviceModel").val(cData.DeviceModels.split(",")).trigger("change");

            getProductionProcessList();
        });
}

function getProductionProcessList() {
    $("#apProductionProcessName").empty();
    var opType = 215;
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

            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#apProductionProcessName").append(option.format(data.Id, data.ProductionProcessName));
            }
            if (cData != null)
                $("#apProductionProcessName").val(cData.ProductModels).trigger("change");
            else
                $("#apProductionProcessName").val(0).trigger("change");
            getDeviceList();
        });
}

function getDeviceList(type = 0) {
    $("#apCode").empty();
    var opType = 319;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var deviceModelIds = $("#apDeviceModel").val();
    var productionProcessIds = $("#apProductionProcessName").val();
    if (deviceModelIds == null ||
        deviceModelIds.length <= 0 ||
        productionProcessIds == null) {
        $("#addProcessModel").modal("show");
        return;
    }

    var data = {}
    data.opType = opType;
    var d = {
        DeviceModelIds: deviceModelIds.join(","),
        ProductionProcessIds: productionProcessIds
    }
    if (cData != null)
        d.Pid = cData.Id;
    data.opData = JSON.stringify(d);
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#apCode").append(option.format(data.Id, data.Code));
            }

            if (cData != null)
                $("#apCode").val(cData.DeviceIds.split(",")).trigger("change");
            if (type != -1) {
                $("#addProcessModel").modal("show");
            }
        });
}

function apReset() {
    $("#apBody").empty();
    var tr = ('<tr id="ap{0}" value="0">' +
        '<td><label class="control-label" id="apx{0}">{0}</label></td>' +
        '<td><input type="tel" class="form-control text-center" id="apJy1{0}" value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
        '<td><input type="tel" class="form-control text-center" id="apJy2{0}" value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" onblur="value=isStrEmptyOrUndefined(value)?\'\':(parseInt(value)>59?59:parseInt(value))" maxlength="9"></td>' +
        '<td><input type="tel" class="form-control text-center" id="apGx1{0}" value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
        '<td><input type="tel" class="form-control text-center" id="apGx2{0}" value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" onblur="value=isStrEmptyOrUndefined(value)?\'\':(parseInt(value)>59?59:parseInt(value))" maxlength="9"></td>' +
        '<td><input type="tel" class="form-control text-center" id="apYl{0}"  value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
        '<td><input type="tel" class="form-control text-center" id="apSd{0}"  value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="delSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(1);
    $("#apBody").append(tr);
    max = maxV = 2;
    $("#addOtherBtn").removeClass("hidden");
}

var max = 2;
var maxV = 2;
function addOther() {
    if (maxV > maxProcessData)
        return;
    //arBody
    var tr = ('<tr id="ap{0}" value="0">' +
        '<td><label class="control-label" id="apx{0}">{1}</label></td>' +
        '<td><input type="tel" class="form-control text-center" id="apJy1{0}" value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
        '<td><input type="tel" class="form-control text-center" id="apJy2{0}" value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" onblur="value=isStrEmptyOrUndefined(value)?\'\':(parseInt(value)>59?59:parseInt(value))" maxlength="9"></td>' +
        '<td><input type="tel" class="form-control text-center" id="apGx1{0}" value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
        '<td><input type="tel" class="form-control text-center" id="apGx2{0}" value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" onblur="value=isStrEmptyOrUndefined(value)?\'\':(parseInt(value)>59?59:parseInt(value))" maxlength="9"></td>' +
        '<td><input type="tel" class="form-control text-center" id="apYl{0}"  value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
        '<td><input type="tel" class="form-control text-center" id="apSd{0}"  value="0" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
        '<td><button type="button" class="btn btn-default btn-sm" onclick="delSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
        '</tr>').format(max, maxV);
    $("#apBody").append(tr);
    max++;
    maxV++;
    if (maxV > maxProcessData) {
        $("#addOtherBtn").addClass("hidden");
    }
}

function delSelf(id) {
    $("#apBody").find("[id=ap" + id + "]").remove();
    maxV--;
    var o = 1;
    var childs = $("#apBody").find("label");
    for (var i = 0; i < childs.length; i++) {
        childs[i].textContent = o;
        o++;
    }
    if (maxV <= maxProcessData) {
        $("#addOtherBtn").removeClass("hidden");
    }
}

function addProcess() {
    var opType = 316;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var apProcess = $("#apProcess").val().trim();
    if (isStrEmptyOrUndefined(apProcess)) {
        showTip($("#apProcessTip"), "工艺编号不能为空");
        return;
    }
    var deviceModels = $("#apDeviceModel").val();
    if (isStrEmptyOrUndefined(deviceModels)) {
        layer.msg("请选择适用设备型号");
        return;
    }
    var productModels = $("#apProductionProcessName").val();
    if (isStrEmptyOrUndefined(productModels)) {
        layer.msg("请选择适用产品型号");
        return;
    }
    var deviceIds = $("#apCode").val();
    if (isStrEmptyOrUndefined(deviceIds)) {
        layer.msg("请选择适用机台号");
        return;
    }
    var inputData = new Array();
    var l = 1;
    for (var i = 1; i < max; i++) {
        if ($("#ap" + i).length > 0) {
            var pressurizeMinute = $("#apJy1" + i).val().trim();
            if (isStrEmptyOrUndefined(pressurizeMinute)) {
                layer.msg("加压时间(M)不能为空");
                return;
            }
            var pressurizeSecond = $("#apJy2" + i).val().trim();
            if (isStrEmptyOrUndefined(pressurizeSecond)) {
                layer.msg("加压时间(S)不能为空");
                return;
            }
            var processMinute = $("#apGx1" + i).val().trim();
            if (isStrEmptyOrUndefined(processMinute)) {
                layer.msg("工序时间(M)不能为空");
                return;
            }
            var processSecond = $("#apGx2" + i).val().trim();
            if (isStrEmptyOrUndefined(processSecond)) {
                layer.msg("工序时间(S)不能为空");
                return;
            }
            var pressure = $("#apYl" + i).val().trim();
            if (isStrEmptyOrUndefined(pressure)) {
                layer.msg("设定压力(Kg)不能为空");
                return;
            }
            var speed = $("#apSd" + i).val().trim();
            if (isStrEmptyOrUndefined(speed)) {
                layer.msg("下盘速度(rpm)不能为空");
                return;
            }
            inputData.push({
                ProcessOrder: l++,
                PressurizeMinute: pressurizeMinute,
                PressurizeSecond: pressurizeSecond,
                ProcessMinute: processMinute,
                ProcessSecond: processSecond,
                Pressure: pressure,
                Speed: speed
            });
        }
    }
    if (inputData.length <= 0) {
        layer.msg("请填写工艺数据");
        return;
    }
    var postData = {
        ProcessNumber: apProcess,
        DeviceModels: deviceModels.join(","),
        ProductModels: productModels,
        DeviceIds: deviceIds.join(","),
        ProcessDatas: inputData
    };

    var doSth = function () {
        $("#addProcessModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(postData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getProcessList();
                }
            });
    }
    showConfirm("添加", doSth);
}

function showUpdateProcessModel(id) {
    $(".opb").addClass("hidden");
    $("#updateProcess").removeClass("hidden");

    hideClassTip("adt");
    $("#apProcess").val("");

    $("#apBody").empty();
    $("#addOtherBtn").removeClass("hidden");
    max = maxV = 1;
    var data = {};
    data.opType = 300;
    data.opData = JSON.stringify({
        // 工艺编号
        Id: id
    });
    var f = false;
    for (var i = 0; i < lastData.length; i++) {
        var d = lastData[i];
        if (d.Id == id) {
            f = true;
            cData = d;
            $("#apProcess").val(d.ProcessNumber);
        }
    }
    if (!f)
        return;
    ajaxPost("/Relay/Post",
        data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var tr = '<tr id="ap{0}" value="{2}">' +
                '<td><label class="control-label" id="apx{0}">{1}</label></td>' +
                '<td><input type="tel" class="form-control text-center" id="apJy1{0}" value="{3}" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
                '<td><input type="tel" class="form-control text-center" id="apJy2{0}" value="{4}" oninput="value=value.replace(/[^\\d]/g,\'\')" onblur="value=isStrEmptyOrUndefined(value)?\'\':(parseInt(value)>59?59:parseInt(value))" maxlength="9"></td>' +
                '<td><input type="tel" class="form-control text-center" id="apGx1{0}" value="{5}" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
                '<td><input type="tel" class="form-control text-center" id="apGx2{0}" value="{6}" oninput="value=value.replace(/[^\\d]/g,\'\')" onblur="value=isStrEmptyOrUndefined(value)?\'\':(parseInt(value)>59?59:parseInt(value))" maxlength="9"></td>' +
                '<td><input type="tel" class="form-control text-center" id="apYl{0}"  value="{7}" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
                '<td><input type="tel" class="form-control text-center" id="apSd{0}"  value="{8}" oninput="value=value.replace(/[^\\d]/g,\'\')" maxlength="9"></td>' +
                '<td><button type="button" class="btn btn-default btn-sm" onclick="delSelf({0})"><i class="fa fa-minus"></i> 删除</button></td>' +
                '</tr>';
            for (var j = 0; j < ret.datas.length; j++) {
                var processData = ret.datas[j];
                $("#apBody").append(tr.format(max, maxV, processData.Id,
                    processData.PressurizeMinute, processData.PressurizeSecond,
                    processData.ProcessMinute, processData.ProcessSecond,
                    processData.Pressure, processData.Speed));
                max++;
                maxV++;
            }
            if (ret.datas.length == maxProcessData) {
                $("#addOtherBtn").addClass("hidden");
            }
            getDeviceModelList();
        });
}

function updateProcess() {
    var opType = 313;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var apProcess = $("#apProcess").val().trim();
    if (isStrEmptyOrUndefined(apProcess)) {
        showTip($("#apProcessTip"), "工艺编号不能为空");
        return;
    }
    var deviceModels = $("#apDeviceModel").val();
    if (isStrEmptyOrUndefined(deviceModels)) {
        layer.msg("请选择适用设备型号");
        return;
    }
    var productModels = $("#apProductionProcessName").val();
    if (isStrEmptyOrUndefined(productModels)) {
        layer.msg("请选择适用产品型号");
        return;
    }
    var deviceIds = $("#apCode").val();
    if (isStrEmptyOrUndefined(deviceIds)) {
        layer.msg("请选择适用机台号");
        return;
    }
    var inputData = new Array();
    var l = 1;
    for (var i = 1; i < max; i++) {
        if ($("#ap" + i).length > 0) {
            var pressurizeMinute = $("#apJy1" + i).val().trim();
            if (isStrEmptyOrUndefined(pressurizeMinute)) {
                layer.msg("加压时间(M)不能为空");
                return;
            }
            var pressurizeSecond = $("#apJy2" + i).val().trim();
            if (isStrEmptyOrUndefined(pressurizeSecond)) {
                layer.msg("加压时间(S)不能为空");
                return;
            }
            var processMinute = $("#apGx1" + i).val().trim();
            if (isStrEmptyOrUndefined(processMinute)) {
                layer.msg("工序时间(M)不能为空");
                return;
            }
            var processSecond = $("#apGx2" + i).val().trim();
            if (isStrEmptyOrUndefined(processSecond)) {
                layer.msg("工序时间(S)不能为空");
                return;
            }
            var pressure = $("#apYl" + i).val().trim();
            if (isStrEmptyOrUndefined(pressure)) {
                layer.msg("设定压力(Kg)不能为空");
                return;
            }
            var speed = $("#apSd" + i).val().trim();
            if (isStrEmptyOrUndefined(speed)) {
                layer.msg("下盘速度(rpm)不能为空");
                return;
            }
            var id = $("#ap" + i).attr("value");
            inputData.push({
                Id: id,
                ProcessOrder: l++,
                PressurizeMinute: pressurizeMinute,
                PressurizeSecond: pressurizeSecond,
                ProcessMinute: processMinute,
                ProcessSecond: processSecond,
                Pressure: pressure,
                Speed: speed
            });
        }
    }
    if (inputData.length <= 0) {
        layer.msg("请填写工艺数据");
        return;
    }
    var postData = {
        Id: cData.Id,
        ProcessNumber: apProcess,
        DeviceModels: deviceModels.join(","),
        ProductModels: productModels,
        DeviceIds: deviceIds.join(","),
        ProcessDatas: inputData
    };

    var doSth = function () {
        $("#addProcessModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(postData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getProcessList();
                }
            });
    }
    showConfirm("修改", doSth);
}
