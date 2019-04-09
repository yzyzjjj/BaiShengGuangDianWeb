function pageReady() {

    var id = getQueryString("id");
    console.log(id)

    getDeviceList();
}

function getDeviceList() {
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
                    '    <ul class="dropdown-menu" role="menu">{0}{1}{2}{3}{4}' +
                    '    </ul>' +
                    '</div>';

                var controlLi = '<li><a onclick="showControlModel({0})">控制</a></li>'.format(data.Id);
                var detailLi = '<li><a onclick="showDetailModel({0})">详情</a></li>'.format(data.Id);
                var updateLi = '<li><a onclick="showUpdateModel({0}, \'{1}\', \'{2}\', \'{3}\', \'{4}\', \'{5}\', \'{6}\', \'{7}\', \'{8}\', \'{9}\', \'{10}\', \'{11}\', \'{12}\', \'{13}\', \'{14}\')">修改</a></li>'
                    .format(data.Id, data.DeviceName, data.Code, data.MacAddress, data.Ip, data.Port, data.Identifier, data.DeviceModelId,
                        data.FirmwareId, data.ProcessId, data.HardwareId, data.SiteId, data.AdministratorUser, data.Remark);
                var upgradeLi = '<li><a onclick="showUpgradeModel({0})">升级</a></li>'.format(data.Id);
                var deleteLi = '<li><a onclick="DeleteDevice({0}, \'{1}\')">删除</a></li>'.format(data.Id, data.Code);

                html = html.format(
                    controlLi,
                    checkPermission(101) ? detailLi : "",
                    checkPermission(102) ? updateLi : "",
                    checkPermission(107) ? upgradeLi : "",
                    checkPermission(104) ? deleteLi : "");

                return html;
            }
            var ip = function (data, type, row) {
                return data.Ip + ':' + data.Port;
            }

            var state = function (data, type, row) {
                if (data.StateStr == '连接正常')
                    return '<span class="text-green">' + data.StateStr + '</span>';
                return '<span class="text-red">' + data.StateStr + '</span>';
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