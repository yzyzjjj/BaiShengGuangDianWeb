function pageReady() {
    getRoleList();
    if (!checkPermission(78)) {
        $("#showAddRoles").addClass("hidden");
    }
}

function getRoleList() {
    ajaxGet("/RoleManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
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
                var upRole = '<li><a onclick="showUpdateRole({0}, \'{1}\', \'{2}\')">修改</a></li>'.format(data.id, escape(data.name), escape(data.permissions));
                var delRole = '<li><a onclick="deleteRole({0}, \'{1}\')">删除</a></li>'.format(data.id, escape(data.name));
                html = html.format(
                    checkPermission(80) ? upRole : "",
                    checkPermission(79) ? delRole : "");
                return html;
            }
            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var columns = checkPermission(80) || checkPermission(79)
                ? [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "id", "title": "Id", "bVisible": false },
                    { "data": "name", "title": "角色名称" },
                    { "data": null, "title": "操作", "render": op, "orderable": false }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "id", "title": "Id", "bVisible": false },
                    { "data": "name", "title": "角色名称" }
                ];
            $("#rolesList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aLengthMenu": [10, 20, 30], //更改显示记录数选项  
                    "iDisplayLength": 10, //默认显示的记录数  
                    "columns": columns
                });
        });
}

function showAddRoles() {
    //$("#add_protoDiv").click();
    $("#addRoleName").val("");
    $("#add_per_body").empty();
    ajaxGet("/Account/Permissions", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };

            if (ret.datas.length > 0) {
                showPermissions("add_per_body", ret.datas);
            }

            $("#addRoleModel").modal("show");
        });
}

function addRole() {
    var roleNames = $("#addRoleName").val().trim();

    if (isStrEmptyOrUndefined(roleNames)) {
        layer.msg("角色名不能为空");
        return;
    }
    var pId = new Array();
    var cbs = $("#add_per_body .on_cb");
    for (var i = 0; i < cbs.length; i++) {
        var e = cbs[i];
        var v = parseInt($(e).attr("value"));
        if ($(e).is(":checked") && v > 0)
            pId.push(v);
    }
    var roleId = pId.join(",");
    if (isStrEmptyOrUndefined(roleId)) {
        layer.msg("请选择权限");
        return;
    }
    var doSth = function () {
        $("#addRoleModel").modal("hide");
        var data = {
            //角色名称
            name: roleNames,
            permissions: roleId
        }
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

function deleteRole(id, name) {
    name = unescape(name);
    var doSth = function () {
        var data = {
            id: id,
        }

        ajaxPost("/RoleManagement/Delete", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getRoleList();
                }
            });
    }
    showConfirm("删除角色：" + name, doSth);
}

function showUpdateRole(id, name, permissions) {
    name = unescape(name);
    permissions = unescape(permissions);

    var dataPermissions = permissions.split(",");
    $("#update_protoDiv").click();
    $("#updateRoleName").val(name);
    $("#update_per_body").empty();
    $("#updateId").html(id);
    ajaxGet("/Account/Permissions", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            if (ret.datas.length > 0) {
                showPermissions("update_per_body", ret.datas);

                for (var n = 0; n < dataPermissions.length; n++) {
                    var pid = dataPermissions[n];
                    $("#update_per_body .on_cb").filter("[value=" + pid + "]").iCheck("check");
                }
                if (dataPermissions.length > 0) {
                    var names = $("#update_per_body .4");
                    for (var i = 0; i < names.length; i++) {
                        if ($(names[i]).is(":checked")) {
                            updateCheckBoxState("update_per_body", names[i], false);
                        }
                    }
                    var p3 = $("#update_per_body .3");
                    for (var i = 0; i < p3.length; i++) {
                        if ($(p3[i]).is(":checked")) {
                            updateCheckBoxState("update_per_body", p3[i], false);
                        }
                    }
                }
            }

            $("#updateRoleModal").modal("show");
        });
}

function updateRole() {
    var roleName = $("#updateRoleName").val();

    if (isStrEmptyOrUndefined(roleName)) {
        layer.msg("角色名不能为空");
        return;
    }
    var pId = new Array();
    var cbs = $("#update_per_body .on_cb");
    for (var i = 0; i < cbs.length; i++) {
        var e = cbs[i];
        var v = parseInt($(e).attr("value"));
        if ($(e).is(":checked") && v > 0)
            pId.push(v);
    }
    var roleId = pId.join(",");
    if (isStrEmptyOrUndefined(roleId)) {
        layer.msg("你还未选择权限");
        return;
    }
    var id = parseInt($("#updateId").html());
    var doSth = function () {
        $("#updateRoleModal").modal("hide");
        var data = {
            id: id,
            //角色名称
            name: roleName,
            permissions: roleId
        }
        ajaxPost("/RoleManagement/Update", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getRoleList();
                }
            });
    }
    showConfirm("修改", doSth);
}

function showPermissions(uiName, list) {
    var mOptionStr1 =
        `<div class="box box-solid noShadow" style="margin-bottom: 0;">
            <div class="box-header no-padding">
                <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="on_i fa fa-minus"></i></button>
                <input type="checkbox" class="on_cb" style="width: 15px;"/>
                <h3 class="box-title" style="vertical-align: middle;font-size: 16px;"></h3>
            </div>
            <div class="box-body no-padding">
                <ul class="on_ul nav nav-pills nav-stacked mli" style="margin-left: 20px"></ul>
            </div>
        </div>`;
    var mOptionStr2 =
        `<div class="box box-solid noShadow" style="margin-bottom: 0;">
            <div class="box-header no-padding">
                <a type="button" class="btn btn-box-tool disabled" data-widget="collapse" style="opacity:0;"><i class="on_i fa fa-minus"></i></a>
                <input type="checkbox" class="on_cb" style="width: 15px;"/>
                <h3 class="box-title" style="vertical-align: middle;font-size: 16px;"></h3>
            </div>
            <div class="box-body no-padding">
                <ul class="on_ul nav nav-pills nav-stacked mli" style="margin-left: 20px"></ul>
            </div>
        </div>`;

    var mNameStr =
        `<li>
            <div class="box box-solid noShadow" style="margin-bottom: 0;">
                <div class="box-header no-padding">
                    <a type="button" class="btn btn-box-tool disabled" data-widget="collapse"><i class="fa fa-chevron-right"></i></a>
                    <input type="checkbox" class="on_cb" style="width: 15px;" />
                    <h3 class="box-title" style="vertical-align: middle;font-size: 16px;"></h3>
                </div>
            </div>
         </li>`;

    var pageTypes = PermissionTypes;
    var option = null;
    for (var i = 0; i < pageTypes.length; i++) {
        var pageType = pageTypes[i];
        option = $(mOptionStr1).clone();
        option.find("h3").text(pageType.name);
        option.find(".on_cb").attr("value", pageType.id);
        option.find(".on_cb").addClass("1");
        option.find(".on_ul").attr("id", `${(pageType.isPage ? "t" : "f")}ul` + pageType.id);
        $("#" + uiName).append(option);
        var menus = getMenus(list, pageType);
        for (var j = 0; j < menus.length; j++) {
            var menu = menus[j];
            var menuData = getMenuData(list, menu);
            if (menuData.length > 0) {
                if (pageType.isPage && menu.noChild) {
                    var fData = menuData[0];
                    option = $(mNameStr).clone();
                    option.find("h3").text(fData.name);
                    option.find(".on_cb").attr("value", fData.id);
                    option.find(".on_cb").attr("pid", pageType.id);
                    option.find(".on_cb").addClass("1");
                    $("#" + uiName).find(`[id=${(pageType.isPage ? "t" : "f")}ul${menu.parent}]`).append(option);
                } else {
                    option = $("<li>" + mOptionStr1 + "<li>").clone();
                    option.find("h3").text(menu.name);
                    option.find(".on_cb").attr("value", menu.id);
                    option.find(".on_cb").attr("pid", menu.parent);
                    option.find(".on_cb").addClass("2");
                    option.find(".on_ul").attr("id", `${(pageType.isPage ? "t" : "f")}ul` + menu.id);
                    option.find("div:first").addClass("collapsed-box");
                    option.find(".on_i").removeClass("fa-minus");
                    option.find(".on_i").addClass("fa-plus");
                    $("#" + uiName).find(`[id=${(pageType.isPage ? "t" : "f")}ul${menu.parent}]`).append(option);
                    if (pageType.isPage) {
                        for (var k = 0; k < menuData.length; k++) {
                            var mData = menuData[k];
                            option = $(mNameStr).clone();
                            option.find("h3").text(mData.name);
                            option.find(".on_cb").attr("value", mData.id);
                            option.find(".on_cb").attr("pid", mData.parent);
                            option.find(".on_cb").addClass("3");
                            $("#" + uiName).find(`[id=${(pageType.isPage ? "t" : "f")}ul${mData.parent}]`).append(option);
                        }
                    } else {
                        var dLabels = getLabels(menuData, menu);
                        for (var k = 0; k < dLabels.length; k++) {
                            var dLabel = dLabels[k];
                            option = $("<li>" + mOptionStr1 + "<li>").clone();
                            option.find("h3").text(dLabel.name);
                            option.find(".on_cb").attr("value", dLabel.id);
                            option.find(".on_cb").attr("pid", dLabel.parent);
                            option.find(".on_cb").addClass("3");
                            option.find(".on_ul").attr("id", `${(pageType.isPage ? "t" : "f")}ul` + dLabel.id);
                            option.find("div:first").addClass("collapsed-box");
                            option.find(".on_i").removeClass("fa-minus");
                            option.find(".on_i").addClass("fa-plus");
                            $("#" + uiName).find(`[id=${(pageType.isPage ? "t" : "f")}ul${dLabel.parent}]`).append(option);
                            var labelData = getLabelData(menuData, dLabel);
                            for (var l = 0; l < labelData.length; l++) {
                                var lData = labelData[l];
                                option = $(mNameStr).clone();
                                option.find("h3").text(lData.name);
                                option.find(".on_cb").attr("value", lData.id);
                                option.find(".on_cb").attr("pid", lData.parent);
                                option.find(".on_cb").addClass("4");
                                $("#" + uiName).find(`[id=${(pageType.isPage ? "t" : "f")}ul${lData.parent}]`).append(option);
                            }
                        }

                    }
                }
            }
        }
    }

    $(".on_cb").iCheck({
        checkboxClass: 'icheckbox_minimal',
        increaseArea: '20%' // optional
    });

    $(".on_cb").on('ifClicked', function (event) {
        var f = $(this).is(":checked");
        $(this).parents(".box-solid:first").find(".on_cb").iCheck(f ? "uncheck" : "check");
        updateCheckBoxState(uiName, this, f);
    });
}

function rule(a, b) {
    if (a.parent != b.parent) {
        return a.parent > b.parent ? 1 : -1;
    }
    if (a.order != b.order) {
        return a.order > b.order ? 1 : -1;
    }
    return a.id > b.id ? 1 : -1;
}

var lid = -PermissionPageTypes.length;
function getMenus(list, page) {
    var result = new Array();
    for (var i = 0; i < PermissionPageTypes.length; i++) {
        var menu = PermissionPageTypes[i];
        for (var j = 0; j < list.length; j++) {
            var data = list[j];
            var add = false;
            if (page.isPage) {
                if (data.isPage == page.isPage && data.label == menu.name) {
                    add = true;
                }
            } else {
                if (data.isPage == page.isPage && data.type == menu.type) {
                    add = true;
                }
            }
            if (add) {
                var d = clone(menu);
                d.id = !page.isPage ? lid-- : menu.id;
                d.isPage = page.isPage;
                d.parent = page.id;
                result.push(d);
                break;
            }
        }
    }
    return result;
}

function getMenuData(list, menu) {
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i];
        var add = false;
        if (menu.isPage) {
            if (data.isPage == menu.isPage && data.label == menu.name) {
                add = true;
            }
        } else {
            if (data.isPage == menu.isPage && data.type == menu.type) {
                add = true;
            }
        }
        if (add) {
            var d = clone(data);
            d.isPage = menu.isPage;
            d.parent = menu.id;
            result.push(d);
        }
    }
    return result.sort(rule);
}

function getLabels(list, menu) {
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i];
        if (data.isPage == menu.isPage && data.type == menu.type && !existArrayObj(result, "name", data.label)) {
            var d = clone(data);
            d.id = lid--;
            d.name = data.label;
            d.parent = menu.id;
            result.push(d);
        }
    }
    return result.sort(rule);
}

function getLabelData(list, label) {
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i];
        if (data.isPage == label.isPage && data.type == label.type && data.label == label.name) {
            var d = clone(data);
            d.parent = label.id;
            result.push(d);
        }
    }
    return result.sort(rule);
}

function updateCheckBoxState(uiName, ui, f) {
    var pid = $(ui).attr("pid");
    if (!f) {
        $("#" + uiName).find(".on_cb").filter("[value=" + pid + "]").iCheck("check");
    } else {
        $("#" + uiName).find(".on_cb").filter("[value=" + pid + "]").iCheck("uncheck");
        var p2 = $("#" + uiName).find(".on_cb").filter("[pid=" + pid + "]");
        for (var i = 0; i < p2.length; i++) {
            if ($(p2[i]).is(":checked")) {
                $("#" + uiName).find(".on_cb").filter("[value=" + pid + "]").iCheck("check");
                break;
            }
        }
    }
    pid = $(ui).attr("pid");
    if (pid == null)
        return;
    ui = $("#" + uiName).find(".on_cb").filter("[value=" + pid + "]");
    updateCheckBoxState(uiName, ui, f);
}
