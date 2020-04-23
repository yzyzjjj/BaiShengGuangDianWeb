var _permissionList = [];
function pageReady() {
    _permissionList[208] = { uIds: ['showAddFirmwareModal'] };
    _permissionList[209] = { uIds: [] };
    _permissionList[210] = { uIds: [] };
    _permissionList = checkPermissionUi(_permissionList);
    getFirmwareList();
}

function getFirmwareList() {
    ajaxPost("/Relay/Post",
        {
            opType: 130
        },
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var per209 = _permissionList[209].have;
            var per210 = _permissionList[210].have;
            var order = function (a, b, c, d) {
                return ++d.row;
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
                    '<button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >' +
                    '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                    '        <span class="caret"></span>' +
                    '        <span class="sr-only">Toggle Dropdown</span>' +
                    '    </button>' +
                    '    <ul class="dropdown-menu" role="menu" style="cursor:pointer">{0}{1}' +
                    '    </ul>' +
                    '</div>';
                var updateLi = '<li><a onclick="showUpdateFirmwareModal({0}, \'{1}\', \'{2}\', \'{3}\', \'{4}\', \'{5}\')">修改</a></li>'.format(data.Id, escape(data.FirmwareName), escape(data.VarNumber), escape(data.CommunicationProtocol), escape(data.FilePath), escape(data.Description));
                var deleteLi = '<li><a onclick="deleteFirmware({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.FirmwareName));
                return html.format(per209 ? updateLi : '', per210 ? deleteLi : '');
            }
            var columns = per209 || per210
                ? [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "FirmwareName", "title": "固件版本名称" },
                    { "data": "VarNumber", "title": "变量数量" },
                    { "data": "FilePath", "title": "程序文件的位置及名称" },
                    { "data": "Description", "title": "描述", "render": rModel },
                    { "data": null, "title": "操作", "render": op, "orderable": false }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "FirmwareName", "title": "固件版本名称" },
                    { "data": "VarNumber", "title": "变量数量" },
                    { "data": "FilePath", "title": "程序文件的位置及名称" },
                    { "data": "Description", "title": "描述", "render": rModel }
                ];
            $("#firmLibraryList")
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

function showFilePathModel(id) {
    var data = {}
    data.opType = 130;
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
                $("#filePath").html(ret.datas[0].FilePath);
            }
            $("#filePathModel").modal("show");
        });
}

function showDescriptionModel(id) {
    var data = {}
    data.opType = 130;
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

var addFirmwareUpload = null;
function showAddFirmwareModal() {
    if (addFirmwareUpload == null)
        addFirmwareUpload = initFileInput("addFilePath", fileEnum.FirmwareLibrary);
    $("#addFilePath").fileinput('clear');
    $(".file-caption-name").prop("disabled", true);
    hideClassTip('adt');
    $(".dd").val("");
    $("#addModel").modal("show");
}

function addFirmware() {
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
        showTip($("#addFilePathTip"), "请选择程序文件");
        return;
    }
    fileCallBack[fileEnum.FirmwareLibrary] = function (fileRet) {
        if (fileRet.errno == 0) {
            $("#addModel").modal("hide");
            var data = {};
            data.opType = 133;
            data.opData = JSON.stringify({
                //固件版本名称
                FirmwareName: addName,
                //变量数量
                VarNumber: addNumber,
                //通信协议
                CommunicationProtocol: addCommunication,
                //程序文件的位置及名称
                FilePath: fileRet.data,
                //描述
                Description: addDesc
            });

            ajaxPost("/Relay/Post",
                data,
                function (ret) {
                    layer.msg(ret.errmsg);
                    if (ret.errno == 0) {
                        getFirmwareList();
                    }
                });

        } else {
            layer.msg(fileRet.errmsg);
        }
    };
    var doSth = function () {
        $('#addFilePath').fileinput("upload");
    }
    showConfirm("添加", doSth);
}

function deleteFirmware(id, firmwareName) {
    firmwareName = unescape(firmwareName);
    var doSth = function () {
        var data = {}
        data.opType = 134;
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

var updateFirmwareUpload = null;
function showUpdateFirmwareModal(id, firmwareName, firmwareNumber, firmwareCommunication, firmwareLocationName, firmwareDescription) {
    firmwareName = unescape(firmwareName);
    firmwareNumber = unescape(firmwareNumber);
    firmwareCommunication = unescape(firmwareCommunication);
    firmwareLocationName = unescape(firmwareLocationName);
    firmwareDescription = unescape(firmwareDescription);

    if (updateFirmwareUpload == null)
        updateFirmwareUpload = initFileInput("updateFilePath", fileEnum.FirmwareLibrary);
    $("#updateFilePath").fileinput('clear');

    hideClassTip('adt');
    $(".dd").val("");
    $("#updateId").html(id);
    $("#updateName").val(firmwareName);
    $("#updateNumber").val(firmwareNumber);
    $("#updateCommunication").val(firmwareCommunication);
    $(".file-caption-name").val(firmwareLocationName);
    $(".file-caption-name").prop("disabled", true);
    $("#oldUpdateFilePath").val(firmwareLocationName);
    $("#updateDesc").val(firmwareDescription);
    $("#updateFirm").modal("show");
}

function updateFirmware() {
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
    var doSth;
    if (isStrEmptyOrUndefined(updateFilePath)) {
        doSth = function () {
            $("#updateFirm").modal("hide");
            var data = {}
            data.opType = 132;
            data.opData = JSON.stringify({
                id: id,
                //固件版本名称
                FirmwareName: updateName,
                //变量数量
                VarNumber: updateNumber,
                //通信协议
                CommunicationProtocol: updateCommunication,
                //程序文件的位置及名称
                FilePath: $("#oldUpdateFilePath").val(),
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
        };
        showConfirm("修改", doSth);
    } else {
        fileCallBack[fileEnum.FirmwareLibrary] = function (fileRet) {
            if (fileRet.errno == 0) {
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
                    FilePath: fileRet.data,
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
            } else {
                layer.msg(fileRet.errmsg);
            }
        };
        doSth = function () {
            $('#updateFilePath').fileinput("upload");
        };
        showConfirm("修改", doSth);
    }
}
