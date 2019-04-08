function pageReady() {
    getSiteList();
}

var op = function (data, type, row) {
    var html = '<button type="button" class="btn btn-primary" data-toggle="modal" onclick="showUpdateModel(\'' +
        row.Id + '\',\'' + row.DeviceCategoryId + '\',\'' + row.ModelName + '\',\'' + row.Description + '\')">修改</button>';
    html += '<button type="button" class="btn btn-primary" data-toggle="modal" onclick="DeleteDeviceModel(' + row.Id + ',\'' + row.ModelName + '\')">删除</button>';
    return html;
}

function getSiteList() {
    ajaxPost("/Relay/Post",
        {
            opType: 125
        },
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
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
                        { "data": "Id", "title": "Id" },
                        { "data": "ModelName", "title": "设备型号" },
                        { "data": "CategoryName", "title": "设备类型" },
                        { "data": "Description", "title": "备注" },
                        { "data": null, "title": "操作", "render": op },
                    ],
                });
        });
}

function showAddModel() {
    var data = {}
    data.opType = 140;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            $("#addSelect").empty();
            var option = '<option value="{value}">{option}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#addSelect").append(option.format({ "value": data.Id, "option": data.CategoryName }));
            }
            $("#addModel").modal("show");
        });
}

function addModel() {
    var doSth = function () {
        var deviceCategoryId = $("#addSelect").val();
        var modelName = $("#addModelName").val();
        if (modelName == "") {
            layer.msg("型号不能为空");
            return;
        }
        var description = $("#addDesc").val();

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

function DeleteDeviceModel(id, modelName) {
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
    var data = {}
    data.opType = 140;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            $("#updateSelect").empty();
            var option = '<option value="{value}">{option}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#updateSelect").append(option.format({ "value": data.Id, "option": data.CategoryName }));
            }

            $("#updateId").html(id);
            $("#updateSelect").val(deviceCategoryId);
            $("#updateModelName").val(modelName);
            $("#updateDesc").val(description);
            $("#updateModel").modal("show");
        });
}

function UpdateModel() {

    var doSth = function () {
        var id = parseInt($("#updateId").html());
        var deviceCategoryId = $("#updateSelect").val();
        var modelName = $("#updateModelName").val();
        if (modelName == "") {
            layer.msg("型号不能为空");
            return;
        }
        var description = $("#updateDesc").val();

        $("#updateModel").modal("hide");
        var data = {}
        data.opType = 122
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
    showConfirm("添加", doSth);

}

