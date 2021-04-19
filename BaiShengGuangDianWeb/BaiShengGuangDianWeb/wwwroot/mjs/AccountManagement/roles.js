var _permissionList = [];
var tableTmp = [];
function pageReady() {
    _permissionList[123] = { uIds: ['showAddRoles'] };
    _permissionList[124] = { uIds: [] };
    _permissionList[125] = { uIds: [] };
    _permissionList = checkPermissionUi(_permissionList);
    getRoleList();
    $("#add_per_body,#update_per_body").on('ifClicked', '.on_cb', function (event) {
        var f = !$(this).is(":checked");
        var solid = $(this).parents(".box-solid");
        solid.eq(0).find(".on_cb").iCheck(f ? "check" : 'uncheck');
        if (f) {
            solid.find('.on_cb:first').iCheck("check");
        }
        //else {
        //    //solid.eq(0).find(".on_cb").iCheck('uncheck');
        //    //for (var i = 1, len = solid.length; i < len; i++) {
        //    //    var el = solid.eq(i);
        //    //    if (!el.find('ul:first > li').find('.on_cb:first').is(":checked")) {
        //    //        el.find('.on_cb:first').iCheck("uncheck");
        //    //    };
        //    //}
        //}
    });
}

function getRoleList() {
    ajaxPost("/Relay/Post", {
        opType: 81
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }

        const rData = ret.datas;
        const tableId = "rolesList";
        const tableEl = `#${tableId}`;
        const tableArr = `${tableId}Arr`;
        const tableData = `${tableId}Data`;
        tableTmp[tableArr] = [];
        tableTmp[tableData] = [];

        if (!tableTmp[tableId]) {
            const tableConfig = dataTableConfig(rData);
            tableConfig.addColumns([
                { data: "Name", title: "角色名称" },
            ]);
            var per124 = _permissionList[124].have;
            var per125 = _permissionList[125].have;
            const op = function (data, type, row) {
                const upRole = `<li><a onclick="showUpdateRole(${data.Id}, \'${escape(data.Name)}\', \'${escape(data.Permissions)}\')">修改</a></li>`;
                const delRole = `<li><a onclick="deleteRole(${data.Id}, \'${escape(data.Name)}\')">删除</a></li>`;
                return `<div class="btn-group">
                            <button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <span class="caret"></span>
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu" role="menu" style="cursor:pointer">${(per124 ? upRole : "")}${(per125 ? delRole : "")}
                            </ul>
                        </div>`;
            }
            if (per124 || per125) {
                tableConfig.addColumns([
                    { data: null, title: "操作", render: op, orderable: false }
                ]);
            }
            tableTmp[tableId] = $(tableEl).DataTable(tableConfig);
        } else {
            updateTable(tableTmp[tableId], rData);
        }
    });
}

function showAddRoles() {
    $("#addRoleName").val("");
    $("#add_per_body").empty();
    ajaxPost("/Relay/Post", {
        opType: 55
    }, ret => {
        if (ret.errno != 0) {
            return;
        };
        if (ret.datas.length > 0) {
            showPermissions("add_per_body", ret.datas);
        }
        $("#addRoleModel").modal("show");
    });
}

function addRole(close) {
    var roleName = $("#addRoleName").val().trim();
    if (isStrEmptyOrUndefined(roleName)) {
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
    showConfirm("添加", () => {
        ajaxPost("/Relay/Post", {
            opType: 83,
            opData: JSON.stringify([{
                //角色名称
                Name: roleName,
                Permissions: roleId
            }])
        }, ret => {
            close && $("#addRoleModel").modal("hide");
            layer.msg(ret.errmsg);
            if (ret.errno != 0)
                return;
            getRoleList();
        });
    });
}

function deleteRole(id, name) {
    name = unescape(name);
    showConfirm(`删除角色：${name}`, () => {
        ajaxPost("/Relay/Post", {
            opType: 84,
            opData: JSON.stringify({
                ids: [id]
            })
        }, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                getRoleList();
            }
        });
    });
}

function showUpdateRole(id, name, permissions) {
    name = unescape(name);
    permissions = unescape(permissions);
    var dataPermissions = permissions.split(",");
    $("#update_protoDiv").click();
    $("#updateRoleName").val(name);
    $("#update_per_body").empty();
    $("#updateId").html(id);
    ajaxPost("/Relay/Post", {
        opType: 55
    }, ret => {
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

function updateRole(close) {
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
    showConfirm("修改", () => {
        ajaxPost("/Relay/Post", {
            opType: 82,
            opData: JSON.stringify([{
                Id: id,
                //角色名称
                Name: roleName,
                Permissions: roleId
            }])
        }, ret => {
            close && $("#updateRoleModal").modal("hide");
            layer.msg(ret.errmsg);
            if (ret.errno != 0)
                return;
            getRoleList();
        });
    });
}

