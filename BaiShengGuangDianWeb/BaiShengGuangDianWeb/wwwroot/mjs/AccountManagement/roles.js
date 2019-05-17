function pageReady() {
    getRoleList();
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
                    '<button type = "button" class="btn btn-default" > <i class="fa fa-asterisk"></i>操作</button >' +
                    '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                    '        <span class="caret"></span>' +
                    '        <span class="sr-only">Toggle Dropdown</span>' +
                    '    </button>' +
                    '    <ul class="dropdown-menu" role="menu">' +
                    '<li><a onclick="showUpdateRole({0}, \'{1}\', \'{2}\')">修改</a></li>'.format(data.id, escape(data.name), escape(data.permissions)) +
                    '<li><a onclick="deleteRole({0}, \'{1}\')">删除</a></li>'.format(data.id, escape(data.name)) +
                    '</ul>' +
                    '</div>';

                return html;
            }
            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            $("#rolesList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aLengthMenu": [10, 20, 30], //更改显示记录数选项  
                    "iDisplayLength": 10, //默认显示的记录数  
                    "columns": [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "id", "title": "Id", "bVisible": false },
                        { "data": "name", "title": "角色名称" },
                        { "data": null, "title": "操作", "render": op },
                    ]
                });
        });
}

function showAddRoles() {
    $("#add_protoDiv").click();
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
    var roleNames = $("#addRoleName").val();

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

function showPermissions(uiName, datas) {
    var mOptionStr1 = '<div class="box box-solid noShadow" style="margin-bottom: 0;">' +
        '    <div class="box-header no-padding">' +
        '        <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="on_i fa fa-minus"></i></button>' +
        '        <input type="checkbox" class="on_cb" style="width: 15px;"/>' +
        '        <h3 class="box-title" style="vertical-align: middle;font-size: 16px;"></h3>' +
        '    </div>' +
        '    <div class="box-body no-padding">' +
        '        <ul class="on_ul nav nav-pills nav-stacked mli" style="margin-left: 20px"></ul>' +
        '    </div>' +
        '</div>';
    var mOptionStr2 = '<div class="box box-solid noShadow" style="margin-bottom: 0;">' +
        '    <div class="box-header no-padding">' +
        '        <a type="button" class="btn btn-box-tool disabled" data-widget="collapse" style="opacity:0;"><i class="on_i fa fa-minus"></i></a>' +
        '        <input type="checkbox" class="on_cb" style="width: 15px;"/>' +
        '        <h3 class="box-title" style="vertical-align: middle;font-size: 16px;"></h3>' +
        '    </div>' +
        '    <div class="box-body no-padding">' +
        '        <ul class="on_ul nav nav-pills nav-stacked mli" style="margin-left: 20px"></ul>' +
        '    </div>' +
        '</div>';

    var mNameStr = '<li>' +
        '<div class="box box-solid noShadow" style="margin-bottom: 0;">' +
        '    <div class="box-header no-padding">' +
        '        <a type="button" class="btn btn-box-tool disabled" data-widget="collapse"><i class="fa fa-chevron-right"></i></a>' +
        '        <input type="checkbox" class="on_cb" style="width: 15px;" />' +
        '        <h3 class="box-title" style="vertical-align: middle;font-size: 16px;"></h3>' +
        '    </div>' +
        '    </div>' +
        '</li>';


    var pages = [{ id: -1, name: "网页", isPage: true }, { id: -2, name: "接口", isPage: false }];
    var types = {}
    types[1] = { id: -3, name: "页面管理" };
    types[2] = { id: -4, name: "组织管理" };
    types[3] = { id: -5, name: "设备管理" };
    types[4] = { id: -6, name: "流程卡管理" };
    types[5] = { id: -7, name: "工艺管理" };
    types[6] = { id: -8, name: "维修管理" };
    var lbI = -9;
    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var pageData = getPageData(datas, page.isPage);

        var option = $(mOptionStr1).clone();
        option.find("h3").text(page.name);
        option.find(".on_cb").attr("value", page.id);
        option.find(".on_cb").attr("lvl", 1);
        option.find(".on_cb").addClass("1");
        option.find(".on_ul").attr("id", "ul" + page.id);
        $("#" + uiName).append(option);
        var dTypes = getTypes(pageData);
        for (var j = 0; j < dTypes.length; j++) {
            var dType = dTypes[j];
            var type = types[dType];
            var typeData = getTypeData(pageData, dType);

            option = $("<li>" + mOptionStr1 + "<li>").clone();
            option.find("h3").text(type.name);
            option.find(".on_cb").attr("value", type.id);
            option.find(".on_cb").attr("pid", page.id);
            option.find(".on_cb").addClass("2");
            option.find(".on_ul").attr("id", "ul" + type.id);
            $("#" + uiName).find("[id=ul" + page.id + "]").append(option);

            var dLabels = getLabels(typeData);
            for (var k = 0; k < dLabels.length; k++) {
                var dLabel = dLabels[k];
                var labelData = getLabelData(pageData, dLabel);
                if (page.isPage) {
                    var firstData = labelData.shift();
                    option = $(labelData.length > 1 ? ("<li>" + mOptionStr1 + "<li>") : ("<li>" + mOptionStr2 + "<li>"))
                        .clone();
                    option.find("h3").text(dLabel);
                    option.find(".on_cb").attr("value", firstData.id);
                    option.find(".on_cb").attr("pid", type.id);
                    option.find(".on_cb").addClass("3");
                    option.find(".on_ul").attr("id", "ul" + firstData.id);
                    option.find("div:first").addClass("collapsed-box");
                    option.find(".on_i").removeClass("fa-minus");
                    option.find(".on_i").addClass("fa-plus");

                    $("#" + uiName).find("[id=ul" + type.id + "]").append(option);
                    for (var l = 0; l < labelData.length; l++) {
                        var lData = labelData[l];

                        option = $(mNameStr).clone();
                        option.find("h3").text(lData.name);
                        option.find(".on_cb").attr("value", lData.id);
                        option.find(".on_cb").attr("pid", firstData.id);
                        option.find(".on_cb").addClass("4");
                        $("#" + uiName).find("[id=ul" + firstData.id + "]").append(option);
                    }

                } else {
                    option = $("<li>" + mOptionStr1 + "<li>").clone();
                    option.find("h3").text(dLabel);
                    option.find(".on_cb").attr("value", lbI);
                    option.find(".on_cb").attr("pid", type.id);
                    option.find(".on_cb").addClass("3");
                    option.find(".on_ul").attr("id", "ul" + lbI);
                    option.find("div:first").addClass("collapsed-box");
                    option.find(".on_i").removeClass("fa-minus");
                    option.find(".on_i").addClass("fa-plus");
                    $("#" + uiName).find("[id=ul" + type.id + "]").append(option);
                    for (var l = 0; l < labelData.length; l++) {
                        var lData = labelData[l];
                        option = $(mNameStr).clone();
                        option.find("h3").text(lData.name);
                        option.find(".on_cb").attr("value", lData.id);
                        option.find(".on_cb").attr("pid", lbI);
                        option.find(".on_cb").addClass("4");
                        $("#" + uiName).find("[id=ul" + lbI + "]").append(option);
                    }
                    lbI--;
                }
            }
        }
    }

    $(".on_cb").iCheck({
        checkboxClass: 'icheckbox_minimal',
        radioClass: 'iradio_minimal',
        increaseArea: '20%' // optional
    });

    $(".on_cb").on('ifClicked', function (event) {
        var f = $(this).is(":checked");
        $(this).parents(".box-solid:first").find(".on_cb").iCheck(f ? "uncheck" : "check");
        updateCheckBoxState(uiName, this, f);
    });
}

function getPageData(datas, isPage) {
    var res = new Array();
    for (var i = 0; i < datas.length; i++) {
        var data = datas[i];
        if (data.isPage == isPage) {
            res.push(data);
        }
    }
    return res;
}

function getTypes(datas) {
    var res = new Array();
    for (var i = 0; i < datas.length; i++) {
        var data = datas[i];
        if (res.indexOf(data.type) < 0) {
            res.push(data.type);
        }
    }
    return res.sort();
}

function getTypeData(datas, type) {
    var res = new Array();
    for (var i = 0; i < datas.length; i++) {
        var data = datas[i];
        if (data.type == type) {
            res.push(data);
        }
    }
    return res;
}

function getLabels(datas) {
    var res = new Array();
    for (var i = 0; i < datas.length; i++) {
        var data = datas[i];
        if (res.indexOf(data.label) < 0) {
            res.push(data.label);
        }
    }
    return res;
}

function rule(a, b) {
    return a.id > b.id ? 1 : -1;
}

function getLabelData(datas, label) {
    var res = new Array();
    for (var i = 0; i < datas.length; i++) {
        var data = datas[i];
        if (data.label == label) {
            res.push(data);
        }
    }
    return res.sort(rule);
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
