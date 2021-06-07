var _permissionList = [];
function pageReady() {
    _permissionList[179] = { uIds: ['showAddModel'] };
    _permissionList[180] = { uIds: [] };
    _permissionList[181] = { uIds: [] };
    _permissionList = checkPermissionUi(_permissionList);
    getDeviceModelList();
}

function getDeviceModelList() {
    ajaxPost("/Relay/Post", { opType: 120 }, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var per180 = _permissionList[180].have;
        var per181 = _permissionList[181].have;
        var order = function (a, b, c,d) {
            return d.row + 1;
        }
        var rModel = function (data, type, full, meta) {
            full.Description = full.Description ? full.Description : "";
            return full.Description.length > tdShowContentLength
                ? full.Description.substr(0, tdShowContentLength) +
                '<a href = \"javascript:showDescriptionModel({0})\">...</a> '
                    .format(full.Id)
                : full.Description;
        };
        var op = function (data, type, row) {
            var html = '<div class="btn-group">' +
                '<button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"><i class="fa fa-asterisk"></i>操作</button >' +
                '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                '        <span class="caret"></span>' +
                '        <span class="sr-only">Toggle Dropdown</span>' +
                '    </button>' +
                '    <ul class="dropdown-menu" role="menu" style="cursor:pointer">{0}{1}' +
                '    </ul>' +
                '</div>';
            var updateLi = '<li><a onclick="showUpdateModel({0}, \'{1}\', \'{2}\', \'{3}\')">修改</a></li>'.format(data.Id, data.DeviceCategoryId, escape(data.ModelName), escape(data.Description));
            var deleteLi = '<li><a onclick="deleteDeviceModel({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.ModelName));
            return html.format(per180 ? updateLi : '',per181 ? deleteLi : '');
        }
        var columns = per180 || per181
            ? [
                { "data": null, "title": "序号", "render": order },
                { "data": "Id", "title": "Id", "bVisible": false },
                { "data": "ModelName", "title": "设备型号" },
                { "data": "CategoryName", "title": "设备类型" },
                { "data": "Description", "title": "备注", "render": rModel },
                { "data": null, "title": "操作", "render": op, "orderable": false }
            ]
            : [
                { "data": null, "title": "序号", "render": order },
                { "data": "Id", "title": "Id", "bVisible": false },
                { "data": "ModelName", "title": "设备型号" },
                { "data": "CategoryName", "title": "设备类型" },
                { "data": "Description", "title": "备注", "render": rModel }
            ];
        $("#deviceModelList")
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
    });
}

function showDescriptionModel(id) {
    var data = {}
    data.opType = 120;
    data.opData = JSON.stringify({
        id: id
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            if (ret.datas.length > 0) {
                $("#description").html(ret.datas[0].Description);
            }
            $("#descriptionModel").modal("show");
        });
}

function showAddModel() {
    $("#addModelName").val("");
    $("#addDesc").val("");
    hideTip($("#addModelNameTip"));
    var data = {}
    data.opType = 140;
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
        data.opType = 123;
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
    var doSth = function () {
        var data = {}
        data.opType = 124;
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
    var data = {}
    data.opType = 140;
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
        data.opType = 122;
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
