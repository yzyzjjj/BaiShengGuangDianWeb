function pageReady() {
    getDeviceModelList();
}

var op = function (data, type, row) {
    var html = '<div class="btn-group">' +
        '<button type = "button" class="btn btn-default" > <i class="fa fa-asterisk"></i>操作</button >' +
        '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
        '        <span class="caret"></span>' +
        '        <span class="sr-only">Toggle Dropdown</span>' +
        '    </button>' +
        '    <ul class="dropdown-menu" role="menu">{0}{1}' +
        '    </ul>' +
        '</div>';

    var updateLi = '<li><a onclick="showUpdateModel({0}, \'{1}\', \'{2}\', \'{3}\')">修改</a></li>'.format(data.Id, data.DeviceCategoryId, escape(data.ModelName), escape(data.Description));
    var deleteLi = '<li><a onclick="deleteDeviceModel({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.ModelName));

    html = html.format(
        checkPermission(122) ? updateLi : "",
        checkPermission(124) ? deleteLi : "");

    return html;
}

function getDeviceModelList() {
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

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            $("#deviceModelList")
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
                        { "data": "ModelName", "title": "设备型号" },
                        { "data": "CategoryName", "title": "设备类型" },
                        { "data": "Description", "title": "备注" },
                        { "data": null, "title": "操作", "render": op },
                    ],
                });
        });
}

function showAddModel() {
    $("#addModelName").val("");
    $("#addDesc").val("");
    hideTip($("#addModelNameTip"));
    var opType = 140;
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
            };
            $("#addSelect").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#addSelect").append(option.format(data.Id, data.CategoryName));
            }
            $("#addModel").modal("show");
        });
}

function addModel() {
    var opType = 123;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var deviceCategoryId = $("#addSelect").val();
    var modelName = $("#addModelName").val().trim();
    if (isStrEmptyOrUndefined(modelName)) {
        showTip($("#addModelNameTip"), "型号不能为空");
        return;
    }
    var description = $("#addDesc").val();

    var doSth = function () {
        $("#addModel").modal("hide");

        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            //设备类型
            DeviceCategoryId: deviceCategoryId,
            //设备型号
            ModelName: modelName,
            //描述
            Description: description
        });
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

function deleteDeviceModel(id, modelName) {
    modelName = unescape(modelName);
    var opType = 124;
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
                    getDeviceModelList();
                }
            });
    }
    showConfirm("删除设备型号：" + modelName, doSth);
}

function showUpdateModel(id, deviceCategoryId, modelName, description) {
    modelName = unescape(modelName);
    description = unescape(description);
    var opType = 140;
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
            };
            $("#updateSelect").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#updateSelect").append(option.format(data.Id, data.CategoryName));
            }

            hideTip($("#updateModelNameTip"));
            $("#updateId").html(id);
            $("#updateSelect").val(deviceCategoryId);
            $("#updateModelName").val(modelName);
            $("#updateDesc").val(description);
            $("#updateModel").modal("show");
        });
}

function updateModel() {
    var opType = 122;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var id = parseInt($("#updateId").html());
    var deviceCategoryId = $("#updateSelect").val();
    var modelName = $("#updateModelName").val().trim();
    if (isStrEmptyOrUndefined(modelName)) {
        showTip($("#updateModelNameTip"), "型号不能为空");
        return;
    }
    var description = $("#updateDesc").val();

    var doSth = function () {
        $("#updateModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id,
            //设备类型
            DeviceCategoryId: deviceCategoryId,
            //设备型号
            ModelName: modelName,
            //描述
            Description: description
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getDeviceModelList();
                }
            });
    }
    showConfirm("修改", doSth);
} 
