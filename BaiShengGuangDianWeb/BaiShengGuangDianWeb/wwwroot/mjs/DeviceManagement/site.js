
function pageReady() {
    getSiteList();
    if (!checkPermission(128)) {
        $("#showAddSite").addClass("hidden");
    }
}

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
    var updateLi = '<li><a onclick="showUpdateSite({0}, \'{1}\', \'{2}\', \'{3}\')">修改</a></li>'.format(data.Id, escape(data.SiteName), escape(data.RegionDescription), escape(data.Manager));
    var deleteLi = '<li><a onclick="deleteSite({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.SiteName + " " + data.RegionDescription));
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
            var columns = checkPermission(127) || checkPermission(129)
                ? [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "SiteName", "title": "车间名" },
                    { "data": "RegionDescription", "title": "场地位置" },
                    { "data": "Manager", "title": "管理人" },
                    { "data": null, "title": "操作", "render": op }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "SiteName", "title": "车间名" },
                    { "data": "RegionDescription", "title": "场地位置" },
                    { "data": "Manager", "title": "管理人" }
                ];
            var rModel = function (data, type, full, meta) {
                full.RegionDescription = full.RegionDescription ? full.RegionDescription : "";
                return full.RegionDescription.length > tdShowContentLength
                    ? full.RegionDescription.substr(0, tdShowContentLength) +
                    '<a href = \"javascript:showRegionDescriptionModel({0})\">...</a> '
                        .format(full.Id)
                    : full.RegionDescription;
            };
            var defs = checkPermission(127) || checkPermission(129)
                ? [
                    { "orderable": false, "targets": 5 },
                    { "type": "html-percent", "targets": [4] },
                    {
                        "targets": [3],
                        "type": "html-percent",
                        "render": rModel
                    }
                ]
                : [
                    { "type": "html-percent", "targets": [4] },
                    {
                        "targets": [3],
                        "type": "html-percent",
                        "render": rModel
                    }
                ];
            $("#siteList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "columns": columns,
                    "columnDefs": defs
                });
        });
}

function showSiteNameModel(id) {
    var opType = 125;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var data = {}
    data.opType = opType;
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
                $("#siteName").html(ret.datas[0].SiteName);
            }
            $("#siteNameModel").modal("show");
        });
}

function showRegionDescriptionModel(id) {
    var opType = 125;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var data = {}
    data.opType = opType;
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
                $("#regionDescription").html(ret.datas[0].RegionDescription);
            }
            $("#regionDescriptionModel").modal("show");
        });
}

function showAddSite() {
    hideClassTip('adt');
    $("#addSiteName").val("");
    $("#addLocations").val("");
    $("#addManager").val("");
    $("#addModel").modal("show");
}

function addSite() {
    var opType = 128;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var addSiteName = $("#addSiteName").val().trim();
    var addLocations = $("#addLocations").val().trim();
    var manager = $("#addManager").val();
    if (isStrEmptyOrUndefined(addSiteName)) {
        showTip($("#addSiteNameTip"), "车间名不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addLocations)) {
        showTip($("#addLocationsTip"), "场地位置不能为空");
        return;
    }

    var doSth = function () {
        $("#addModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            //车间名称
            SiteName: addSiteName,
            //场地位置
            RegionDescription: addLocations,
            //管理人
            Manager: manager
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

function deleteSite(id, siteName) {
    siteName = unescape(siteName);
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

function showUpdateSite(id, adSiteNames, locationsReg, man) {
    adSiteNames = unescape(adSiteNames);
    locationsReg = unescape(locationsReg);

    hideClassTip('adt');
    $("#updateId").html(id);
    $("#updateSiteName").val(adSiteNames);
    $("#updateRegions").val(locationsReg);
    $("#updateManager").val(man);
    $("#updateSiteModal").modal("show");
}

function updateSite() {
    var opType = 127;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var id = parseInt($("#updateId").html());

    var updateSiteName = $("#updateSiteName").val().trim();
    var updateRegions = $("#updateRegions").val().trim();
    var manager = $("#updateManager").val();

    if (isStrEmptyOrUndefined(updateSiteName)) {
        showTip($("#updateSiteNameTip"), "车间名不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(updateRegions)) {
        showTip($("#updateRegionsTip"), "场地位置不能为空");
        return;
    }

    var doSth = function () {
        $("#updateSiteModal").modal("hide");

        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id,
            //车间名称
            SiteName: updateSiteName,
            //场地地址
            RegionDescription: updateRegions,
            //管理人
            Manager: manager,
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