function pageReady() {
    getRoleList()
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
    var updateLi = '<li><a onclick="showUpdateSite({0}, \'{1}\', \'{2}\', \'{3}\')">修改</a></li>'.format(data.Id, data.SiteName, data.RegionDescription, data.Manager);
    var deleteLi = '<li><a onclick="DeleteSite({0}, \'{1}\')">删除</a></li>'.format(data.Id, data.SiteName);
    html = html.format();
    return html;
}

function getRoleList() {
    ajaxGet("/RoleManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
           $("#rolesList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aLengthMenu": [5, 10, 50], //更改显示记录数选项  
                    "iDisplayLength": 5, //默认显示的记录数  
                    "columns": [
                        { "data": "id", "title": "序号" },
                        { "data": "name", "title": "角色名称" },
                        { "data": null, "title": "操作", "render": op },
                    ]
                });
        });
}



function addModel() {
    var doSth = function () {
        
    }
    showConfirm("添加", doSth);
}
function showAddRoles() {
    var data = {}
    ajaxGet("/RoleManagement/List", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            $("#addRoleName").empty();

            $("#addRoles").modal("show");
        });
}

function addRoles() {
    
    var rolesNames = $("#addRoleName").val();
    if (isStrEmptyOrUndefined(rolesNames)) {
        showTip($("#updateSiteNameTip"), "角色不能为空");
        return;
    }
    var doSth = function () {
        $("#addRoles").modal("hide");
        var data = {}
         data.opData = JSON.stringify({
            //角色名称
             Name: rolesNames
        });
        ajaxPost("/RoleManagement/Add", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getRoleList();
                }
            });
    }
    showConfirm("添加", doSth);
}

function DeleteSite(id, siteName) {
    var opType = 129;
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
                    getSiteList();
                }
            });
    }
    showConfirm("删除场地：" + siteName, doSth);
}

function showUpdateSite(id, adSiteNames, locationsReg, manergerMan) {
    var opType = 126;
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
            $("#addSiteName").empty();

            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#addSiteName").append(option.format(data.Id, data.SiteName, data.RegionDescription, data.Manager));
            }
            $("#updateId").html(id);
            $("#updateSiteName").val(adSiteNames);
            $("#updateRegions").val(locationsReg);
            $("#updateManager").val(manergerMan);
            $("#updateSite").modal("show");
        });
}

function updateSite() {
    var opType = 127;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var id = parseInt($("#updateId").html());

    var siteLocation = $("#updateRegions").val();
    var siteManger = $("#updateManager").val();
    var siteName = $("#updateSiteName").val();


    var doSth = function () {
        $("#updateSite").modal("hide");

        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id,
            //场地名称
            SiteName: siteName,
            //场地地址
            RegionDescription: siteLocation,
            //管理人
            Manager: siteManger,
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getSiteList();
                }
            });
    }
    showConfirm("修改", doSth);

}
