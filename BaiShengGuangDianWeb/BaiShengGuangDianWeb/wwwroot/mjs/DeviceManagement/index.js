function pageReady() {
    getDeviceModelList();
}

function getDeviceModelList() {
    var opType = 100;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    ajaxPost("/Relay/Post",
        {
            opType: 100
        },
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var op = function (data, type, row) {


                var html = '<div class="btn-group">' +
                    '<button type = "button" class="btn btn-default" > <i class="fa fa-asterisk"></i>操作</button >' +
                    '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                    '        <span class="caret"></span>' +
                    '        <span class="sr-only">Toggle Dropdown</span>' +
                    '    </button>' +
                    '    <ul class="dropdown-menu" role="menu">{detail}{update}{upgrade}{delete}' +
                    '    </ul>' +
                    '</div>';
                var detailLi = '<li><a onclick="showDetail({id})">详情</a></li>';
                html = html.format(checkPermission(101) ? { "detail": detailLi } : { "detail": '' });
                var updateLi = '<li><a onclick="showUpdate({id})">修改</a></li>';
                html = html.format(checkPermission(102) ? { "update": updateLi } : { "update": "" });
                var upgradeLi = '<li><a onclick="showUpgrade({id})">升级</a></li>';
                html = html.format(checkPermission(107) ? { "upgrade": upgradeLi } : { "upgrade": "" });
                var deleteLi = '<li><a onclick="DeleteDevice({id})">删除</a></li>';
                html = html.format(checkPermission(104) ? { "delete": deleteLi } : { "delete": "" });
                return html;
            }
            var ip = function (data, type, row) {
                return row.Ip + ':' + row.Port;
            }

            var state = function (data, type, row) {
                if (row.StateStr == '连接正常')
                    return '<span class="text-green">' + row.StateStr + '</span>';
                return '<span class="text-red">' + row.StateStr + '</span>';
            }
            $("#deviceList")
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
                        { "data": "Code", "title": "机台号" },
                        { "data": "ModelName", "title": "设备型号" },
                        { "data": "SiteName", "title": "摆放位置" },
                        { "data": null, "title": "IP地址", "render": ip },
                        { "data": "AdministratorUser", "title": "管理员" },
                        { "data": null, "title": "运行状态", "render": state },
                        { "data": null, "title": "操作", "render": op }
                    ]
                });
        });
}

function showDetailModel(parameters) {

}

function showControlModel(parameters) {

}

function showUpdateModel(parameters) {

}

function showUpdateModel(parameters) {

}


function showUpgradeModel(parameters) {

}

function DeleteDevice(id, code) {
    var opType = 104;
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
    showConfirm("删除设备：" + code, doSth);
}



