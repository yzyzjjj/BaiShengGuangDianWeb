
﻿function pageReady() {
    getSiteList();
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
    html = html.format(
        checkPermission(127) ? updateLi : "",
        checkPermission(129) ? deleteLi : "");
    return html;
}

function getSiteList() {
    var opType = 125;
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
            $("#siteList")
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
                        { "data": "SiteName", "title": "场地名" },
                        { "data": "RegionDescription", "title": "场地位置" },
                        { "data": "Manager", "title": "管理人" },
                        { "data": null, "title": "操作", "render": op },
                    ],
                });
        });
}

﻿
function showAddSite() {
    var opType = 125;
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
            $("#addSiteName").empty();
            
            $("#addModel").modal("show");
        });
}

function addSite() {
    var opType = 128;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var adSiteNames = $("#addSiteName").val();
    var locationsReg = $("#addLocations").val();
    var manergerMan = $("#addManager").val();
    if (isStrEmptyOrUndefined(adSiteNames)) {
        showTip($("#updateSiteNameTip"), "场地名不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(locationsReg)) {
        showTip($("#updateSiteLocationTip"), "场地位置不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(manergerMan)) {
        showTip($("#updateSiteManergerTip"), "管理人不能为空");
        return;
    }
    var doSth = function () {
         $("#addModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            //场地名称
            SiteName: adSiteNames,
            //场地位置
            RegionDescription: locationsReg,
            //管理人
            Manager: manergerMan
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getSiteList();
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

