var _permissionList = [];
function pageReady() {
    _permissionList[229] = { uIds: ['showAddSite'] };
    _permissionList[230] = { uIds: [] };
    _permissionList[231] = { uIds: [] };
    _permissionList = checkPermissionUi(_permissionList);
    getSiteList();
}

function getSiteList() {
    ajaxPost("/Relay/Post",
        {
            opType: 125
        },
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var per230 = _permissionList[230].have;
            var per231 = _permissionList[231].have;
            var order = function (a, b, c, d) {
                return ++d.row;
            }
            var rModel = function (data, type, full, meta) {
                full.RegionDescription = full.RegionDescription ? full.RegionDescription : "";
                return full.RegionDescription.length > tdShowContentLength
                    ? full.RegionDescription.substr(0, tdShowContentLength) +
                    '<a href = \"javascript:showRegionDescriptionModel({0})\">...</a> '
                        .format(full.Id)
                    : full.RegionDescription;
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
                var updateLi = '<li><a onclick="showUpdateSite({0}, \'{1}\', \'{2}\', \'{3}\')">修改</a></li>'.format(data.Id, escape(data.SiteName), escape(data.RegionDescription), escape(data.Manager));
                var deleteLi = '<li><a onclick="deleteSite({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.SiteName + " " + data.RegionDescription));
                return html.format(per230 ? updateLi : '', per231 ? deleteLi : '');
            }
            var columns = per230 || per231
                ? [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "SiteName", "title": "车间名" },
                    { "data": "RegionDescription", "title": "场地位置", "type": "html-percent", "render": rModel },
                    { "data": "Manager", "title": "管理人", "type": "html-percent" },
                    { "data": null, "title": "操作", "render": op, "orderable": false }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "SiteName", "title": "车间名" },
                    { "data": "RegionDescription", "title": "场地位置", "type": "html-percent", "render": rModel },
                    { "data": "Manager", "title": "管理人", "type": "html-percent" }
                ];
            $("#siteList")
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

function showSiteNameModel(id) {
    var data = {}
    data.opType = 125;
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
    var data = {}
    data.opType = 125;
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
        data.opType = 128;
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
    var doSth = function () {
        var data = {}
        data.opType = 129;
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
    man = unescape(man);
    hideClassTip('adt');
    $("#updateId").html(id);
    $("#updateSiteName").val(adSiteNames);
    $("#updateRegions").val(locationsReg);
    $("#updateManager").val(man);
    $("#updateSiteModal").modal("show");
}

function updateSite() {
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
        data.opType = 127;
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