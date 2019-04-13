
function pageReady() {
    getFirmList();
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
    var updateLi = '<li><a onclick="showUpdateFirm({0}, \'{1}\', \'{2}\', \'{3}\', \'{4}\', \'{5}\')">修改</a></li>'.format(data.Id, data.FirmwareName, data.VarNumber, data.CommunicationProtocol, data.FilePath, data.Description);
    var deleteLi = '<li><a onclick="DeleteFireLibrary({0}, \'{1}\')">删除</a></li>'.format(data.Id, data.FirmwareName);
    html = html.format(
        checkPermission(132) ? updateLi : "",
        checkPermission(134) ? deleteLi : "");
    return html;
}

function getFirmList() {
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

            $("#firmlibraryList")
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
                        { "data": "FirmwareName", "title": "固件版本名称" },
                        { "data": "VarNumber", "title": "变量数量" },
                        { "data": "CommunicationProtocol", "title": "通信协议" },
                        { "data": "FilePath", "title": "程序文件的位置及名称" },
                        { "data": "Description", "title": "描述" },
                        { "data": null, "title": "操作", "render": op },
                    ],
                });
        });
}


function showAddFireLibrary() {
    var opType = 130 ;
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
            $("#addFireName").empty();

            $("#addModel").modal("show");
        });
}

function addFirmLibrary() {
    var opType = 133;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var fireWareName = $("#addFireName").val();
    var fireWareNumber = $("#addFireNumber").val();
    var fireWareCommunication = $("#addCommunication").val();
    var fireWareLocationName = $("#addLocationName").val();
    var fireWareDescript = $("#addDescr").val();
    if (isStrEmptyOrUndefined(fireWareName)) {
        showTip($("#updateFireNameTip"), "版本名称不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(fireWareNumber)) {
        showTip($("#updateFireNumberTip"), "变量数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(fireWareCommunication)) {
        showTip($("#updateCommunicationTip"), "通信协议不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(fireWareLocationName)) {
        showTip($("#updateLocationNameTip"), "程序文件的位置及名称不能为空");
        return;
    }
   
    var doSth = function () {
        $("#addModel").modal("hide");
        var data = {};
        data.opType = opType;
        data.opData = JSON.stringify({
            //固件版本名称
            FirmwareName: fireWareName ,
            //变量数量
            VarNumber: fireWareNumber,
            //通信协议
            CommunicationProtocol: fireWareCommunication,
            //程序文件的位置及名称
            FilePath: fireWareLocationName,
            //描述
            Description: fireWareDescript,
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFirmList();
                }
            });
    }
    showConfirm("添加", doSth);
}

function DeleteFireLibrary(id, fireWareName) {
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
                    getFirmList();
                }
            });
    }
    showConfirm("删除场地：" + fireWareName, doSth);
}

function showUpdateFirm(id, fireWareName, fireWareNumber, fireWareCommunication, fireWareLocationName, fireWareDescript) {
    var opType = 131;
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
           
            $("#addFireName").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#addFireName").append(option.format(data.Id, data.FirmwareName, data.VarNumber, data.CommunicationProtocol, data.FilePath, data.Description));
            }
            $("#updateId").html(id);
            $("#updateFirmName").val(fireWareName);
            $("#updateFirmNumber").val(fireWareNumber);
            $("#updateFireCommunication").val(fireWareCommunication);
            $("#pdateFirePath").val(fireWareLocationName);
            $("#updateFireDes").val(fireWareDescript);
            $("#updateFirm").modal("show");
        });
}

function updateFirm() {
    var opType = 132;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var id = parseInt($("#updateId").html());

    var fireWareName = $("#updateFirmName").val();
    var fireWareNumber = $("#updateFirmNumber").val();
    var fireWareCommunication = $("#updateFireCommunication").val();
    var fireWareLocationName = $("#updateFirePath").val();
    var fireWareDescript = $("#updateFireDes").val();


    var doSth = function () {
        $("#updateFirm").modal("hide");
        
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id,
            //固件版本名称
            FirmwareName: fireWareName,
            //变量数量
            VarNumber: fireWareNumber,
            //通信协议
            CommunicationProtocol: fireWareCommunication,
            //程序文件的位置及名称
            FilePath: fireWareLocationName,
            //描述
            Description: fireWareDescript,
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFirmList();
                }
            });
    }
    showConfirm("修改", doSth);

}


