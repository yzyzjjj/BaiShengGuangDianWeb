﻿function pageReady() {
    $(".ms2").css("width", "100%");
    $(".ms2").select2();
    getDeviceProcessStepList();
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

    var updateLi = '<li><a onclick="showUpdateModel({0}, \'{1}\', \'{2}\', \'{3}\')">修改</a></li>'.format(data.Id, data.DeviceCategoryId, data.StepName, data.Description);
    var deleteLi = '<li><a onclick="DeleteDeviceProcessStep({0}, \'{1}\')">删除</a></li>'.format(data.Id, data.StepName);

    html = html.format(
        checkPermission(152) ? updateLi : "",
        checkPermission(154) ? deleteLi : "");

    return html;
}

function getDeviceProcessStepList() {
    var opType = 150;
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
            $("#deviceProcessStepList")
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
                        { "data": "CategoryName", "title": "设备类型" },
                        { "data": "StepName", "title": "工序名" },
                        { "data": "Description", "title": "备注" },
                        { "data": null, "title": "操作", "render": op },
                    ],
                });
        });
}

function showAddModel() {
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
            hideTip($("#addStepNameTip"));
            $("#addModel").modal("show");
        });
}

function addStepNameCheck() {
    var v = $("#addStepName").val();
    $("#addIsSurvey").iCheck(v.indexOf("检验") > -1 ? "check" : "uncheck");
}

function addModel() {
    var opType = 153;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var modelId = $("#addSelect").val();
    var stepName = $("#addStepName").val();
    if (isStrEmptyOrUndefined(stepName)) {
        showTip($("#addStepNameTip"), "工序名不能为空");
        return;
    }
    var description = $("#addDesc").val();

    var doSth = function () {
        $("#addModel").modal("hide");

        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            //设备类型
            DeviceCategoryId: modelId,
            //设备工序
            StepName: stepName,
            //是否是检验
            IsSurvey: $("#addIsSurvey").is(':checked') == true,
            //描述
            Description: description
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getDeviceProcessStepList();
                }
            });
    }
    showConfirm("添加", doSth);
}

function DeleteDeviceProcessStep(id, stepName) {
    var opType = 154;
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
                    getDeviceProcessStepList();
                }
            });
    }
    showConfirm("删除设备工序：" + stepName, doSth);
}

function showUpdateModel(id, deviceCategoryId, stepName, description) {
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
                var d = ret.datas[i];
                $("#updateSelect").append(option.format(d.Id, d.CategoryName));
            }

            hideTip($("#updateStepNameTip"));
            $("#updateId").html(id);
            $("#updateSelect").val(deviceCategoryId);
            $("#updateStepName").val(stepName);
            $("#updateDesc").val(description);
            updateStepNameCheck();
            $("#updateModel").modal("show");
        });
}

function updateStepNameCheck() {
    var v = $("#updateStepName").val();
    $("#updateIsSurvey").iCheck(v.indexOf("检验") > -1 ? "check" : "uncheck");
}

function updateModel() {
    var opType = 152;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var id = parseInt($("#updateId").html());
    var categoryId = $("#updateSelect").val();
    var stepName = $("#updateStepName").val();
    if (isStrEmptyOrUndefined(stepName)) {
        showTip($("#updateStepNameTip"), "工序名不能为空");
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
            DeviceCategoryId: categoryId,
            //工序名
            StepName: stepName,
            //是否是检验
            IsSurvey: $("#updateIsSurvey").is(':checked') == true,
            //描述
            Description: description
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getDeviceProcessStepList();
                }
            });
    }
    showConfirm("修改", doSth);
} 