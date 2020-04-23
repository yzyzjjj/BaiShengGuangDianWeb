function pageReady() {
    getRoleList();
    //if (!checkPermission(78)) {
    //    $("#showAddRoles").addClass("hidden");
    //}
    $("#add_per_body,#update_per_body").on('ifClicked', '.on_cb', function (event) {
        var f = !$(this).is(":checked");
        var solid = $(this).parents(".box-solid");
        solid.eq(0).find(".on_cb").iCheck(f ? "check" : 'uncheck');
        if (f) {
            solid.find('.on_cb:first').iCheck("check");
        } else {
            for (var i = 1, len = solid.length; i < len; i++) {
                var el = solid.eq(i);
                if (!el.find('ul:first > li').find('.on_cb:first').is(":checked")) {
                    el.find('.on_cb:first').iCheck("uncheck");
                };
            }
        }
    });
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
                //html = html.format(
                //    checkPermission(80) ? upRole : "",
                //    checkPermission(79) ? delRole : "");
                html = html.format(upRole, delRole);
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
    var pId = [];
    var cbs = $("#add_per_body .on_cb");
    for (var i = 0, len = cbs.length; i < len; i++) {
        var el = cbs.eq(i);
        var v = el.val();
        if (el.is(":checked") && v > 0)
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
            id: id
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
                var el = $("#update_per_body .on_cb");
                el.filter('[value=0]').iCheck("check");
                for (var i = 0, len = dataPermissions.length; i < len; i++) {
                    el.filter(`[value=${dataPermissions[i]}]`).iCheck("check");
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
    var pId = [];
    var cbs = $("#update_per_body .on_cb");
    for (var i = 0, len = cbs.length; i < len; i++) {
        var el = cbs.eq(i);
        var v = el.val();
        if (el.is(":checked") && v > 0)
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
    var permissionTypes = `<div class="box box-solid noShadow" style="margin-bottom: 0;">
                            <div class="box-header no-padding">
                                <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="on_i fa fa-minus"></i></button>
                                <label class="pointer" style="margin:0;font-weight:inherit">
                                    <input type="checkbox" class="on_cb" style="width: 15px" value="0">
                                    <span class="textOverTop" style="vertical-align: middle;font-size: 16px">权限管理</span>
                                </label>
                            </div>
                            <div class="box-body no-padding">
                                <ul class="on_ul nav nav-pills nav-stacked mli" style="margin-left: 20px">{0}</ul>
                            </div>
                        </div>`;
    var mOptionStr = `<li><div class="box box-solid noShadow collapsed-box" style="margin-bottom: 0;">
                        <div class="box-header no-padding">
                            <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="on_i fa fa-plus"></i></button>
                            <label class="pointer" style="margin:0;font-weight:inherit">
                                <input type="checkbox" class="on_cb" style="width: 15px" value="{0}">
                                <span class="textOverTop" style="vertical-align: middle;font-size: 16px">{1}</span>
                            </label>
                        </div>
                        <div class="box-body no-padding">
                            <ul class="on_ul nav nav-pills nav-stacked mli" style="margin-left: 20px">{2}</ul>
                        </div>
                    </div></li>`;
    var mNameStr = `<li><div class="box box-solid noShadow" style="margin-bottom: 0;">
                            <div class="box-header no-padding">
                                <a type="button" class="btn btn-box-tool disabled" data-widget="collapse"><i class="fa fa-chevron-right"></i></a>
                                <label class="pointer" style="margin:0;font-weight:inherit">
                                    <input type="checkbox" class="on_cb" style="width: 15px" value="{0}">
                                    <span class="textOverTop" style="vertical-align: middle;font-size: 16px">{1}</span>
                                </label>
                            </div>
                        </div></li>`;
    var opObj = { parent: [] };
    for (var i = 0, len = list.length; i < len; i++) {
        var d = list[i];
        var par = d.parent;
        par == 0 ? opObj.parent.push(d) : opObj[par] ? opObj[par].push(d) : opObj[par] = [d];
    }
    var childTree = arr => {
        arr.sort((a, b) => a.order - b.order);
        return arr.map(item => {
            var obj = '';
            obj += opObj[item.id]
                ? mOptionStr.format(item.id, item.name, childTree(opObj[item.id]))
                : mNameStr.format(item.id, item.name);
            return obj;
        }).join('');
    }
    $(`#${uiName}`).empty().append(opObj.parent.length ? permissionTypes.format(childTree(opObj.parent)) : '');
    $(".on_cb").iCheck({
        checkboxClass: 'icheckbox_minimal',
        increaseArea: '20%'
    });
}
