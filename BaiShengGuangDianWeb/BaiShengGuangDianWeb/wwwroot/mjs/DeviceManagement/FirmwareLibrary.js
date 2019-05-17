
function pageReady() {
    getFirmwareList();
    //initFileInput("addLocationName", fileEnum.FirmwareLibrary);
    //showAddFireLibrary();
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
    var updateLi = '<li><a onclick="showUpdateFirmwareModal({0}, \'{1}\', \'{2}\', \'{3}\', \'{4}\', \'{5}\')">修改</a></li>'.format(data.Id, escape(data.FirmwareName), escape(data.VarNumber), escape(data.CommunicationProtocol), escape(data.FilePath), escape(data.Description));
    var deleteLi = '<li><a onclick="deleteFirmware({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.FirmwareName));
    html = html.format(
        checkPermission(132) ? updateLi : "",
        checkPermission(134) ? deleteLi : "");
    return html;
}

function getFirmwareList() {
    var opType = 130;
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
            $("#firmLibraryList")
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
                        { "data": "FirmwareName", "title": "固件版本名称" },
                        { "data": "VarNumber", "title": "变量数量" },
                        //{ "data": "CommunicationProtocol", "title": "通信协议" },
                        { "data": "FilePath", "title": "程序文件的位置及名称" },
                        { "data": "Description", "title": "描述" },
                        { "data": null, "title": "操作", "render": op },
                    ],
                });
        });
}

function showAddFirmwareModal() {
    hideClassTip('adt');
    $(".dd").val("");
    $("#addModel").modal("show");
}

function addFirmware() {
    //$('#addLocationName').fileinput("upload");
    //return;
    var opType = 133;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var addName = $("#addName").val();
    var addNumber = $("#addNumber").val();
    var addCommunication = $("#addCommunication").val();
    var addFilePath = $("#addFilePath").val();
    var addDesc = $("#addDesc").val();
    if (isStrEmptyOrUndefined(addName)) {
        showTip($("#addNameTip"), "名称不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addNumber)) {
        showTip($("#addNumberTip"), "变量数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addCommunication)) {
        addCommunication = "";
        //showTip($("#updateCommunicationTip"), "通信协议不能为空");
        //return;
    }
    if (isStrEmptyOrUndefined(addFilePath)) {
        showTip($("#addFilePathTip"), "程序文件的位置及名称不能为空");
        return;
    }

    var doSth = function () {
        $("#addModel").modal("hide");
        var data = {};
        data.opType = opType;
        data.opData = JSON.stringify({
            //固件版本名称
            FirmwareName: addName,
            //变量数量
            VarNumber: addNumber,
            //通信协议
            CommunicationProtocol: addCommunication,
            //程序文件的位置及名称
            FilePath: addFilePath,
            //描述
            Description: addDesc
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFirmwareList();
                }
            });
    }
    showConfirm("添加", doSth);
}

function deleteFirmware(id, firmwareName) {
    firmwareName = unescape(firmwareName);

    var opType = 134;
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
                    getFirmwareList();
                }
            });
    }
    showConfirm("删除固件：" + firmwareName, doSth);
}

function showUpdateFirmwareModal(id, firmwareName, firmwareNumber, firmwareCommunication, firmwareLocationName, firmwareDescription) {
    firmwareName = unescape(firmwareName);
    firmwareNumber = unescape(firmwareNumber);
    firmwareCommunication = unescape(firmwareCommunication);
    firmwareLocationName = unescape(firmwareLocationName);
    firmwareDescription = unescape(firmwareDescription);

    hideClassTip('adt');
    $(".dd").val("");
    $("#updateId").html(id);
    $("#updateName").val(firmwareName);
    $("#updateNumber").val(firmwareNumber);
    $("#updateCommunication").val(firmwareCommunication);
    $("#updateFilePath").val(firmwareLocationName);
    $("#updateDesc").val(firmwareDescription);
    $("#updateFirm").modal("show");
}

function updateFirmware() {
    var opType = 132;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var id = parseInt($("#updateId").html());

    var updateName = $("#updateName").val().trim();
    var updateNumber = $("#updateNumber").val().trim();
    var updateCommunication = $("#updateCommunication").val().trim();
    var updateFilePath = $("#updateFilePath").val().trim();
    var updateDesc = $("#updateDesc").val();
    if (isStrEmptyOrUndefined(updateName)) {
        showTip($("#updateNameTip"), "名称不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(updateNumber)) {
        showTip($("#updateNumberTip"), "变量数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(updateCommunication)) {
        updateCommunication = "";
        //showTip($("#updateCommunicationTip"), "通信协议不能为空");
        //return;
    }
    if (isStrEmptyOrUndefined(updateFilePath)) {
        showTip($("#updateFilePathTip"), "程序文件的位置及名称不能为空");
        return;
    }
    var doSth = function () {
        $("#updateFirm").modal("hide");

        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id,
            //固件版本名称
            FirmwareName: updateName,
            //变量数量
            VarNumber: updateNumber,
            //通信协议
            CommunicationProtocol: updateCommunication,
            //程序文件的位置及名称
            FilePath: updateFilePath,
            //描述
            Description: updateDesc,
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFirmwareList();
                }
            });
    }
    showConfirm("修改", doSth);

}


