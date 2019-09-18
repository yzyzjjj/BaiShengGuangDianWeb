function pageReady() {
    getUsersList();
    $(".ms2").select2();
    $("#addProcessor").on("ifChanged", function (event) {
        if ($(this).is(":checked")) {
            $("#add_deviceDiv").removeClass("hidden");
        } else {
            $("#add_deviceDiv").addClass("hidden");
        }
    });

    $("#add_perDiv").click(function (e) {
        getOtherPermission("add_per_body", $("#addRole").val(), null);
    });


    $("#updateProcessor").on("ifChanged", function (event) {
        if ($(this).is(":checked")) {
            $("#update_deviceDiv").removeClass("hidden");
        } else {
            $("#update_deviceDiv").addClass("hidden");
        }
    });

    $("#update_perDiv").click(function (e) {
        getOtherPermission("update_per_body", $("#updateRole").val(), permission);
    });

    $("#updatePassword").on("ifChanged", function (event) {
        if (!$(this).is(":checked")) {
            $("#updateNewPassword").attr("disabled", "disabled");
            $("#updateNewPassword").val("");
        } else {
            $("#updateNewPassword").removeAttr("disabled");
        }
    });
    if (!checkPermission(74)) {
        $("#showAddUserModal").addClass("hidden");
    }
    $("#addEmail,#updateEmail").on("input", function () {
        $(this)[0].value = $(this)[0].value.replace(/[^\w\@\.\-]+/g, "");
    });
}

function getUsersList() {
    ajaxGet("/AccountManagement/List", null,
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
                var upUsers = '<li><a onclick="showUpdateUserModal({0}, {1}, \'{2}\', \'{3}\', \'{4}\', \'{5}\', \'{6}\', \'{7}\',\'{8}\')">修改</a></li>'.format(data.id, data.role, escape(data.account), escape(data.name), escape(data.emailAddress), escape(data.permissions), escape(data.deviceIds), escape(data.productionRole), escape(data.emailType));
                var delUsers = '<li><a onclick="deleteUser({0}, \'{1}\')">删除</a></li>'.format(data.id, escape(data.account));
                !checkPermission(76) && checkPermission(75) && data.isDeleted
                    ? html = ""
                    : html = html.format(
                        checkPermission(76) ? upUsers : "",
                        checkPermission(75) && !data.isDeleted ? delUsers : "");
                return html;
            }
            var del = function (data, type, row) {
                return data.isDeleted ? "<span class='text-red'>是</span>" : "否";
            }
            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var columns = checkPermission(76) || checkPermission(75)
                ? [
                    { "data": "id", "title": "id", "render": order },
                    { "data": "account", "title": "用户名" },
                    { "data": "name", "title": "姓名" },
                    { "data": "roleName", "title": "角色" },
                    { "data": "emailAddress", "title": "邮箱" },
                    { "data": null, "title": "删除", "render": del },
                    { "data": null, "title": "操作", "render": op }
                ]
                : [
                    { "data": "id", "title": "id", "render": order },
                    { "data": "account", "title": "用户名" },
                    { "data": "name", "title": "姓名" },
                    { "data": "roleName", "title": "角色" },
                    { "data": "emailAddress", "title": "邮箱" },
                    { "data": null, "title": "删除", "render": del }
                ];
            var defs = checkPermission(76) || checkPermission(75)
                ? [
                    { "orderable": false, "targets": 6 }
                ]
                : "";
            $("#userTable")
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

function deleteUser(id, account) {
    account = unescape(account);

    var doSth = function () {
        var data = {
            id: id,
            account: account
        }

        ajaxPost("/AccountManagement/Delete", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getUsersList();
                }
            });
    }
    showConfirm("删除用户：" + account, doSth);
}

function roleRule(a, b) {
    return a.id < b.id ? 1 : -1;
}

function addReset() {
    addList = new Array();
    $(".dd").val("");
    $("#addProcessor").iCheck('uncheck');
    $("#addSurveyor").iCheck('uncheck');
    lastAddRole = 0;
    addList = new Array();
    showAddUserModal(-1);
}

var addList = null;
var deviceId = null;
function showAddUserModal(type = 0) {
    emailType();
    addList = new Array();
    $("#add_protoDiv").click();
    $(".dd").val("");
    $("#addProcessor").iCheck('uncheck');
    $("#addSurveyor").iCheck('uncheck');


    var role = $("#addRole").val();
    //if (lastAddRole == role) {
    //    $("#addUserModal").modal("show");
    //    return;
    //}
    $("#addRole").empty();
    ajaxGet("/RoleManagement/List",
        null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var datas = ret.datas.sort(roleRule);
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < datas.length; i++) {
                var d = datas[i];
                $("#addRole").append(option.format(d.id, d.name));
            }
            if (type != -1)
                $("#addUserModal").modal("show");
            getOtherPermission("add_per_body", $("#addRole").val(), null);
        });

    var opType = 100;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    deviceId = new Array();
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post",
        data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            for (var d in ret.datas) {
                deviceId.push(ret.datas[d].Id.toString());
            }
            var op = function (data, type, row) {
                return '<input type="checkbox" value="{0}" class="icb_minimal" onclick="">'.format(data.Id);
            }

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }

            $("#addDeviceList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数 
                    "aaSorting": [[1, "asc"]],
                    "columns": [
                        { "data": null, "title": "全选<input type='checkbox' class='icb_minimal' id='checkAll'>", "render": op },
                        { "data": "Id", "title": "Id", "render": order },
                        { "data": "Code", "title": "机台号" },
                        { "data": "DeviceName", "title": "设备名" }
                    ],
                    //关闭第一列排序功能
                    "columnDefs": [
                        { "orderable": false, "targets": 0 }
                    ],
                    "drawCallback": function (settings, json) {
                        $("#addDeviceList td").css("padding", "3px");
                        $("#addDeviceList td").css("vertical-align", "middle");
                        $("#addDeviceList .icb_minimal").iCheck({
                            checkboxClass: 'icheckbox_minimal',
                            radioClass: 'iradio_minimal',
                            increaseArea: '20%' // optional
                        });

                        $("#addDeviceList .icb_minimal").on('ifChanged', function (event) {
                            var ui = $(this);
                            var v = ui.attr("value");
                            if (!isStrEmptyOrUndefined(v)) {
                                if (ui.is(":checked")) {
                                    ui.parents("tr:first").css("background-color", "gray");
                                    if (addList.indexOf(v) == -1) {
                                        addList.push(v);
                                    }
                                    if ($("#checkAll").is(":checked")) {
                                        addList = new Array();
                                    }
                                    if (addList.length == deviceId.length) {
                                        $("#checkAll").iCheck('check');
                                    }
                                } else {
                                    if (ui.parents("tr:first").hasClass("odd"))
                                        ui.parents("tr:first").css("background-color", "#f9f9f9");
                                    else
                                        ui.parents("tr:first").css("background-color", "");
                                    if (addList.indexOf(v) != -1)
                                        addList.splice(addList.indexOf(v), 1);
                                    if ($("#checkAll").is(":checked")) {
                                        for (var j = 0; j < deviceId.length; j++) {
                                            if (deviceId[j] != v)
                                                addList.push(deviceId[j]);
                                        }
                                        $("#checkAll").iCheck('uncheck');
                                    }
                                }
                            }
                        });
                        $("#checkAll").on("ifChanged", function (event) {
                            if ($(this).is(":checked")) {
                                $("#addDeviceList .icb_minimal").iCheck('check');
                                addList = new Array();
                            } else {
                                if (addList.length == 0)
                                    $("#addDeviceList .icb_minimal").iCheck('uncheck');
                            }
                        });
                        if ($("#checkAll").is(":checked")) {
                            addList = new Array();
                            $("#addDeviceList .icb_minimal").iCheck('check');
                        } else {
                            var iCks = $("#addDeviceList .icb_minimal");
                            for (var i = 0; i < iCks.length; i++) {
                                if (isNumber(iCks[i].value)) {
                                    if (addList.indexOf(iCks[i].value) == -1)
                                        $(iCks[i]).iCheck('uncheck');
                                    else
                                        $(iCks[i]).iCheck('check');
                                }
                            }
                        }
                    }
                });
        });
}

var emailTypeData = [];
var tf = true;
function emailType() {
    ajaxGet("/AccountManagement/EmailType", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            $("#addEmailType").empty();
            if (tf) {
                tf = false;
                $("#addEmailType").before('<label class="control-label">邮件类型：</label>');
            }
            var option = '<label class="control-label" style="margin-left:10px">{1}：</label><input type="checkbox" value="{0}" class="icb_minimal">';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#addEmailType").append(option.format(data.type, data.name));
            }
            $("#addEmailType .icb_minimal").iCheck({
                checkboxClass: 'icheckbox_minimal-blue',
                radioClass: 'iradio_minimal',
                increaseArea: '20%'
            });
            emailTypeData = [];
            $("#addEmailType .icb_minimal").on("ifChanged", function (event) {
                if ($(this).is(":checked")) {
                    emailTypeData.push($(this).val());
                } else {
                    emailTypeData.splice(emailTypeData.indexOf($(this).val()), 1);
                }
            });
        });
}

function addUser() {
    var addAccount = $("#addAccount").val();
    var addName = $("#addName").val();
    var addEmail = $("#addEmail").val();
    var addEmailType = emailTypeData.join();
    var addPassword = $("#addPassword").val();
    var addRole = $("#addRole").val();
    var pRole = new Array();
    if ($("#addProcessor").is(":checked"))
        pRole.push(0);
    if ($("#addSurveyor").is(":checked"))
        pRole.push(1);
    var pRoles = pRole.join(",");

    var pId = new Array();
    var cbs = $("#add_per_body .on_cb");
    for (var i = 0; i < cbs.length; i++) {
        var e = cbs[i];
        var v = parseInt($(e).attr("value"));
        if ($(e).is(":checked") && v > 0)
            pId.push(v);
    }
    var roleIds = pId.join(",");

    var deviceIds = "";
    if ($("#checkAll").is(":checked"))
        deviceIds = deviceId.join(",");
    else {
        if (pRole.indexOf(0) > -1)
            deviceIds = addList.join(",");
        else
            addList = new Array();
    }

    if (isStrEmptyOrUndefined(addAccount)) {
        layer.msg("用户名不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addName)) {
        layer.msg("姓名不能为空");
        return;
    }
    if (!isEmail(addEmail) && !isStrEmptyOrUndefined(addEmail)) {
        showTip("addEmailTip", "邮箱格式不正确，请输入：登录名@主机名.域名的格式");
        return;
    }
    if (isStrEmptyOrUndefined(addPassword)) {
        layer.msg("密码不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addEmail) && !isStrEmptyOrUndefined(addEmailType)) {
        layer.msg("选择邮件类型邮箱不能为空");
        return;
    }
    var doSth = function () {
        $("#addUserModal").modal("hide");
        var data = {
            account: addAccount,
            password: addPassword,
            name: addName,
            email: addEmail,
            emailType: addEmailType,
            role: addRole,
            permissions: roleIds,
            isProcessor: pRoles,
            deviceIds: deviceIds
        }
        ajaxPost("/AccountManagement/Add", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getUsersList();
                }
            });
    }

    showConfirm("添加", doSth);
}

var updateList = new Array();
var permission = null;
var tf1 = true;
function showUpdateUserModal(id, role, account, name, emailAddress, permissions, deviceIds, productionRole, emailType) {
    account = unescape(account);
    name = unescape(name);
    emailAddress = unescape(emailAddress);
    permissions = unescape(permissions);
    deviceIds = unescape(deviceIds);
    productionRole = unescape(productionRole);
    emailType = unescape(emailType);
    if (!isStrEmptyOrUndefined(deviceIds))
        updateList = deviceIds.split(",");
    $("#update_protoDiv").click();

    permission = permissions;
    $("#updateId").html(id);
    $("#updateAccount").val(account);
    $("#updateName").val(name);
    $("#updateEmail").val(emailAddress);
    $("#updatePassword").iCheck('uncheck');
    $("#updateNewPassword").val("");

    var productionRoleList = productionRole.split(",");

    $("#updateProcessor").iCheck(productionRoleList.indexOf("0") > -1 ? 'check' : 'uncheck');
    $("#updateSurveyor").iCheck(productionRoleList.indexOf("1") > -1 ? 'check' : 'uncheck');

    ajaxGet("/AccountManagement/EmailType", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            $("#upEmailType").empty();
            if (tf1) {
                tf1 = false;
                $("#upEmailType").before('<label class="control-label">邮件类型：</label>');
            }
            var option = '<label class="control-label" style="margin-left:10px">{1}：</label><input type="checkbox" value="{0}" class="icb_minimal">';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#upEmailType").append(option.format(data.type, data.name));
            }
            $("#upEmailType .icb_minimal").iCheck({
                checkboxClass: 'icheckbox_minimal-blue',
                radioClass: 'iradio_minimal',
                increaseArea: '20%'
            });
            var emailTypeList = emailType.split(",");
            var upCks = $("#upEmailType .icb_minimal");
            for (var j = 0; j < upCks.length; j++) {
                if (emailTypeList.indexOf(upCks[j].value) == -1) {
                    $(upCks[j]).iCheck('uncheck');
                } else {
                    $(upCks[j]).iCheck('check');
                }
            }
        });
    $("#updateRole").empty();
    ajaxGet("/RoleManagement/List",
        null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var datas = ret.datas.sort(roleRule);
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < datas.length; i++) {
                var d = datas[i];
                $("#updateRole").append(option.format(d.id, d.name));
            }
            $("#updateRole").val(role).trigger("update");

            $("#updateUserModal").modal("show");
            getOtherPermission("update_per_body", $("#updateRole").val(), permissions);
        });

    var opType = 100;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    deviceId = new Array();
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post",
        data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            for (var d in ret.datas) {
                deviceId.push(ret.datas[d].Id.toString());
            }
            var op = function (data, type, row) {
                return '<input type="checkbox" value="{0}" class="icb_minimal" onclick="">'.format(data.Id);
            }

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            $("#updateDeviceList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "aaSorting": [[1, "asc"]],
                    "columns": [
                        { "data": null, "title": "全选<input type='checkbox' class='icb_minimal' id='upCheckAll'>", "render": op },
                        { "data": "Id", "title": "Id", "render": order },
                        { "data": "Code", "title": "机台号" },
                        { "data": "DeviceName", "title": "设备名" }
                    ],
                    //关闭第一列排序功能
                    "columnDefs": [
                        { "orderable": false, "targets": 0 }
                    ],
                    "drawCallback": function (settings, json) {
                        $("#updateDeviceList td").css("pupdateing", "3px");
                        $("#updateDeviceList td").css("vertical-align", "middle");
                        $("#updateDeviceList .icb_minimal").iCheck({
                            checkboxClass: 'icheckbox_minimal',
                            radioClass: 'iradio_minimal',
                            increaseArea: '20%' // optional
                        });

                        if (updateList.length == deviceId.length) {
                            $("#upCheckAll").iCheck('check');
                        }
                        $("#updateDeviceList .icb_minimal").on('ifChanged', function (event) {
                            var ui = $(this);
                            var v = ui.attr("value");
                            if (!isStrEmptyOrUndefined(v)) {
                                if (ui.is(":checked")) {
                                    ui.parents("tr:first").css("background-color", "gray");
                                    if (updateList.indexOf(v) == -1) {
                                        updateList.push(v);
                                    }
                                    if ($("#upCheckAll").is(":checked")) {
                                        updateList = new Array();
                                    }
                                    if (updateList.length == deviceId.length) {
                                        $("#upCheckAll").iCheck('check');
                                    }
                                } else {
                                    if (ui.parents("tr:first").hasClass("odd"))
                                        ui.parents("tr:first").css("background-color", "#f9f9f9");
                                    else
                                        ui.parents("tr:first").css("background-color", "");
                                    if (updateList.indexOf(v) != -1)
                                        updateList.splice(updateList.indexOf(v), 1);
                                    if ($("#upCheckAll").is(":checked")) {
                                        for (var j = 0; j < deviceId.length; j++) {
                                            if (deviceId[j] != v)
                                                updateList.push(deviceId[j]);
                                        }
                                        $("#upCheckAll").iCheck('uncheck');
                                    }
                                }
                            }
                        });
                        $("#upCheckAll").on("ifChanged", function (event) {
                            if ($(this).is(":checked")) {
                                $("#updateDeviceList .icb_minimal").iCheck('check');
                                updateList = new Array();
                            } else {
                                if (updateList.length == 0)
                                    $("#updateDeviceList .icb_minimal").iCheck('uncheck');
                            }
                        });
                        if ($("#upCheckAll").is(":checked")) {
                            updateList = new Array();
                            $("#updateDeviceList .icb_minimal").iCheck('check');
                        } else {
                            var iCks = $("#updateDeviceList .icb_minimal");
                            for (var i = 0; i < iCks.length; i++) {
                                if (isNumber(iCks[i].value)) {
                                    if (updateList.indexOf(iCks[i].value) == -1)
                                        $(iCks[i]).iCheck('uncheck');
                                    else
                                        $(iCks[i]).iCheck('check');
                                }
                            }
                        }
                    }
                });
        });
}

function updateUser() {
    var id = parseInt($("#updateId").html());
    var updateName = $("#updateName").val();
    var updateEmail = $("#updateEmail").val();
    var upEmailTypeData = [];
    var cks = $("#upEmailType .icb_minimal");
    for (var j = 0; j < cks.length; j++) {
        var s = cks[j];
        if ($(s).is(":checked")) {
            upEmailTypeData.push(s.value);
        }
    }
    var updateEmailType = upEmailTypeData.join();
    var updateRole = $("#updateRole").val();
    var pRole = new Array();
    if ($("#updateProcessor").is(":checked"))
        pRole.push(0);
    if ($("#updateSurveyor").is(":checked"))
        pRole.push(1);
    var pRoles = pRole.join(",");

    var pId = new Array();
    var cbs = $("#update_per_body .on_cb");
    for (var i = 0; i < cbs.length; i++) {
        var e = cbs[i];
        var v = parseInt($(e).attr("value"));
        if ($(e).is(":checked") && v > 0)
            pId.push(v);
    }
    var roleIds = pId.join(",");
    var deviceIds = "";
    if ($("#upCheckAll").is(":checked"))
        deviceIds = deviceId.join(",");
    else {
        if (pRole.indexOf(0) > -1)
            deviceIds = updateList.join(",");
        else
            updateList = new Array();
    }

    if (isStrEmptyOrUndefined(updateName)) {
        layer.msg("姓名不能为空");
        return;
    }

    var data = {
        id: id,
        name: updateName,
        email: updateEmail,
        emailType: updateEmailType,
        role: updateRole,
        permissions: roleIds,
        isProcessor: pRoles,
        deviceIds: deviceIds
    }
    if (!isEmail(updateEmail) && !isStrEmptyOrUndefined(updateEmail)) {
        showTip("updateEmailTip", "邮箱格式不正确，请输入：登录名@主机名.域名的格式");
        return;
    }
    if ($("#updatePassword").is(":checked")) {
        var updateNewPassword = $("#updateNewPassword").val();
        if (isStrEmptyOrUndefined(updateNewPassword)) {
            layer.msg("密码不能为空");
            return;
        }
        data.password = updateNewPassword;
    }
    if (isStrEmptyOrUndefined(updateEmail) && !isStrEmptyOrUndefined(updateEmailType)) {
        layer.msg("选择邮件类型邮箱不能为空");
        return;
    }
    var doSth = function () {
        $("#updateUserModal").modal("hide");
        ajaxPost("/AccountManagement/Update", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getUsersList();
                }
            });
    }
    showConfirm("修改", doSth);
}

var lastAddRole = 0;
var lastUpdateRole = 0;
function getOtherPermission(ui, role, permissions, type = 0) {
    if (type == 0) {
        if (lastAddRole == role)
            return;
        lastAddRole = role;
    } else {
        if (lastUpdateRole == role)
            return;
        lastUpdateRole = role;
    }
    var permissionList = null;
    if (!isStrEmptyOrUndefined(permissions))
        permissionList = permissions.split(",").map(Number);

    $("#" + ui).empty();
    ajaxGet("/Account/OtherPermissions",
        {
            role: role
        },
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            var i;
            var d;
            var datas = new Array();
            if (permissionList != null) {
                for (i = 0; i < ret.datas.length; i++) {
                    d = ret.datas[i];
                    if (permissionList.indexOf(d.id) > -1)
                        datas.push(d.id);
                }
            }
            showPermissions(ui, ret.datas);

            for (i = 0; i < datas.length; i++) {
                $("#update_per_body .on_cb").filter("[value=" + datas[i] + "]").iCheck("check");
            }

            if (permissionList != null) {
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
        });

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



    var pages = PermissionPages;
    var types = PermissionTypes;
    var lbI = PermissionTypes[PermissionTypes.length - 1].id - 1;
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
            if (type == null) {
                continue;
            }
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
    if (a.order == b.order) {
        return a.id > b.id ? 1 : -1;
    } else {
        return a.order > b.order ? 1 : -1;
    }
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
