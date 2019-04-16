
function pageReady() {
    getApplicationList();
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
    var updateLi = '<li><a onclick="showUpdateApplication({0}, \'{1}\', \'{2}\', \'{3}\')">修改</a></li>'.format(data.Id, data.ApplicationName, data.FilePath, data.Description);
    var deleteLi = '<li><a onclick="DeleteApplication({0}, \'{1}\')">删除</a></li>'.format(data.Id, data.ApplicationName);
    html = html.format(
        checkPermission(147) ? updateLi : "",
        checkPermission(149) ? deleteLi : "");
    return html;
}

function getApplicationList() {
    var opType = 145;
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

            $("#applicationList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "columns": [
                        { "data": "Id", "title": "序号" },
                        { "data": "ApplicationName", "title": "名称" },
                        { "data": "FilePath", "title": "程序文件的位置及名称" },
                        { "data": "Description", "title": "描述" },
                        { "data": null, "title": "操作", "render": op },
                    ],
                });
        });
}


function showAddApplication() {
    var opType = 145;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var data = {}
    data.opType = opType

    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            $("#addApplicationName").empty();

            $("#addModel").modal("show");
        });
}

function addApplication() {
    var opType = 148;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var applicationName = $("#addApplicationName").val();
    var filePath= $("#addFilePath").val();
    var desc = $("#addDesc").val();
    if (isStrEmptyOrUndefined(applicationName)) {
        showTip($("#updateApplicationNameTip"), "场地名不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(filePath)) {
        showTip($("#updateFilePathTip"), "场地位置不能为空");
        return;
    }
    
    var doSth = function () {
        $("#addModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            //名称
            ApplicationName: applicationName,
            //程序文件的位置及名称
            FilePath: filePath,
            //描述
            Description: desc
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getApplicationList();
                }
            });
    }
    showConfirm("添加", doSth);
}

function DeleteApplication(id, applicationName) {
    var opType = 149;
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
                    getApplicationList();
                }
            });
    }
    showConfirm("删除应用层：" + applicationName, doSth);
}

function showUpdateApplication(id, applicationName, filePath, desc) {
    var opType = 146;
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
            $("#addApplicationName").empty();

            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#addApplicationName").append(option.format(data.Id, data.ApplicationName, data.FilePath, data.Description));
            }
            $("#updateId").html(id);
            $("#updateApplicationName").val(applicationName);
            $("#updateFilePath").val(filePath);
            $("#updateDesc").val(desc);
            $("#updateApplication").modal("show");
        });
}

function updateApplication() {
    var opType = 147;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var id = parseInt($("#updateId").html());

    var appName = $("#updateApplicationName").val();
    var appFilePath = $("#updateFilePath").val();
    var appDesc = $("#updateDesc").val();


    var doSth = function () {
        $("#updateApplication").modal("hide");

        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id,
            //名称
            ApplicationName: appName,
            //程序文件的位置及名称
            FilePath: appFilePath,
            //描述
            Description: appDesc,
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getApplicationList();
                }
            });
    }
    showConfirm("修改", doSth);

}


 