function pageReady() {
    getUsersList();
    $(".ms2").select2();
    $("#add_perDiv").click(function (e) {
        var addRole = $("#addRole").val();
        addRole = addRole == null ? "" : addRole.join();
        $('#add_per_body').empty();
        if (!isStrEmptyOrUndefined(addRole)) {
            getOtherPermission("add_per_body", addRole, null);
        }
    });
    $("#update_perDiv").click(function (e) {
        var updateRole = $("#updateRole").val();
        updateRole = updateRole == null ? "" : updateRole.join();
        getOtherPermission("update_per_body", updateRole, permission);
    });

    $("#updatePassword").on("ifChanged", function (event) {
        if (!$(this).is(":checked")) {
            $("#updateNewPassword").attr("disabled", "disabled");
            $("#updateNewPassword").val("");
        } else {
            $("#updateNewPassword").removeAttr("disabled");
        }
    });
    //if (!checkPermission(74)) {
    //    $("#showAddUserModal").addClass("hidden");
    //}
    $("#addEmail,#updateEmail").on("input", function () {
        $(this)[0].value = $(this)[0].value.replace(/[^\w\@\.\-]+/g, "");
    });
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

function getUsersList() {
    $("#userTable").empty();
    var getUsersListFunc = new Promise(function (resolve) {
        ajaxGet("/AccountManagement/List", null,
            function (ret) {
                resolve('success');
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }
                var checkPermission76 = checkPermission(76);
                var checkPermission75 = checkPermission(75);
                var htmlFormat = '<div class="btn-group">' +
                    '<button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >' +
                    '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                    '        <span class="caret"></span>' +
                    '        <span class="sr-only">Toggle Dropdown</span>' +
                    '    </button>' +
                    '    <ul class="dropdown-menu" role="menu" style="cursor:pointer">{0}{1}' +
                    '    </ul>' +
                    '</div>';
                var upUsersFormat = '<li><a onclick="showUpdateUserModal({0}, \'{1}\', \'{2}\', \'{3}\', \'{4}\', \'{5}\', \'{6}\', \'{7}\',\'{8}\',\'{9}\',\'{10}\')">修改</a></li>';
                var delUsersFormat = '<li><a onclick="deleteUser({0}, \'{1}\')">删除</a></li>';

                var op = function (data, type, row) {
                    var upUsers = upUsersFormat.format(data.id, data.role, escape(data.account), escape(data.name), escape(data.phone), escape(data.emailAddress), escape(data.permissions), escape(data.deviceIds), escape(data.productionRole), escape(data.emailType), escape(data.allDevice))
                    var delUsers = delUsersFormat.format(data.id, escape(data.account));
                    return (!checkPermission76 && !checkPermission75) || data.isDeleted ? "" : htmlFormat.format(checkPermission76 ? upUsers : "", checkPermission75 ? delUsers : "");
                }
                var del = function (data, type, row) {
                    return data.isDeleted ? "<span class='text-red'>是</span>" : "否";
                }
                var order = function (data, type, row, meta) {
                    return meta.row + 1;
                }
                var columns = [
                    { "data": "id", "title": "id", "render": order },
                    { "data": "account", "title": "用户名" },
                    { "data": "number", "title": "编号" },
                    { "data": "name", "title": "姓名" },
                    { "data": "roleName", "title": "角色" },
                    { "data": "phone", "title": "手机号" },
                    { "data": "emailAddress", "title": "邮箱" },
                    { "data": null, "title": "删除", "render": del }
                ];

                if (checkPermission76 || checkPermission75) {
                    columns.push({ "data": null, "title": "操作", "render": op, "orderable": false });
                }

                $("#userTable")
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
    });
    Promise.all([getUsersListFunc])
        .then((result) => {
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
    $("#addRole").empty();
    var func1 = new Promise(function (resolve) {
        ajaxGet("/RoleManagement/List",
            null,
            function (ret) {
                resolve('success');
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }

                var datas = ret.datas.sort(roleRule);
                var option = '<option value="{0}">{1}</option>';
                var html = "";
                for (var i = 0; i < datas.length; i++) {
                    var d = datas[i];
                    html += option.format(d.id, d.name);
                }
                $("#addRole").append(html);
            });
    });
    var opType = 100;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var func2 = new Promise(function (resolve) {
        deviceId = new Array();
        var data = {}
        data.opType = opType;
        ajaxPost("/Relay/Post", data, function (ret) {
            resolve('success');
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            for (var d in ret.datas) {
                deviceId.push(ret.datas[d].Id.toString());
            }
            var op = function (data, type, row) {
                return '<input type="checkbox" value="{0}" class="icb_minimal">'.format(data.Id);
            }

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }

            $("#addDeviceList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数 
                    "aaSorting": [[1, "asc"]],
                    "columns": [
                        { "data": null, "title": "全选<input type='checkbox' class='icb_minimal' id='checkAll'>", "render": op, "orderable": false },
                        { "data": "Id", "title": "Id", "render": order },
                        { "data": "Code", "title": "机台号" },
                        { "data": "DeviceName", "title": "设备名" }
                    ],
                    "drawCallback": function (settings, json) {
                        $("#addDeviceList td").css("padding", "3px");
                        $("#addDeviceList .icb_minimal").iCheck({
                            checkboxClass: 'icheckbox_minimal',
                            radioClass: 'iradio_minimal',
                            increaseArea: '20%'
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
    });

    Promise.all([func1, func2])
        .then((result) => {
            if (type != -1)
                $("#addUserModal").modal("show");
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
            var html = "";
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                html += option.format(data.type, data.name);
            }
            $("#addEmailType").append(html);
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
    var addAccount = $("#addAccount").val().trim();
    var addName = $("#addName").val().trim();
    var addPhone = $("#addPhone").val().trim();
    var addEmail = $("#addEmail").val().trim();
    var addEmailType = emailTypeData.join();
    var addPassword = $("#addPassword").val().trim();
    var addRole = $("#addRole").val();
    addRole = addRole == null ? "" : addRole.join();
    var pRole = new Array();
    if ($("#addProcessor").is(":checked"))
        pRole.push(0);
    if ($("#addSurveyor").is(":checked"))
        pRole.push(1);
    var pRoles = pRole.join(",");

    var pId = [];
    var cbs = $("#add_per_body .on_cb");
    for (var i = 0, len = cbs.length; i < len; i++) {
        var el = cbs.eq(i);
        var v = el.val();
        if (el.is(":checked") && v > 0)
            pId.push(v);
    }
    var roleIds = pId.join(",");

    var deviceIds = "";
    if ($("#checkAll").is(":checked")) {
        //deviceIds = deviceId.join(",");
        deviceIds = deviceId.join(",");
    }
    else {
        deviceIds = addList.join(",");
        //if (pRole.indexOf(0) > -1)
        //    deviceIds = addList.join(",");
        //else
        //    addList = new Array();
    }

    if (isStrEmptyOrUndefined(addAccount)) {
        layer.msg("用户名不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addName)) {
        layer.msg("姓名不能为空");
        return;
    }
    if (!isStrEmptyOrUndefined(addPhone) && !isPhone(addPhone)) {
        layer.msg("手机号错误");
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

    if (isStrEmptyOrUndefined(addRole)) {
        layer.msg("请选择角色");
        return;
    }
    var doSth = function () {
        $("#addUserModal").modal("hide");
        var data = {
            account: addAccount,
            password: addPassword,
            name: addName,
            phone: addPhone,
            email: addEmail,
            emailType: addEmailType,
            role: addRole,
            permissions: roleIds,
            isProcessor: pRoles,
            allDevice: $("#checkAll").is(":checked") ? "1" : "0",
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
function showUpdateUserModal(id, role, account, name, phone, emailAddress, permissions, deviceIds, productionRole, emailType, allDevice) {
    role = role.split(",");
    account = unescape(account);
    name = unescape(name);
    phone = unescape(phone);
    emailAddress = unescape(emailAddress);
    permissions = unescape(permissions);
    deviceIds = unescape(deviceIds);
    productionRole = unescape(productionRole);
    emailType = unescape(emailType);
    allDevice = unescape(allDevice);
    if (!isStrEmptyOrUndefined(deviceIds))
        updateList = deviceIds.split(",");
    $("#update_protoDiv").click();

    permission = permissions;
    $("#updateId").html(id);
    $("#updateAccount").val(account);
    $("#updateName").val(name);
    $("#updatePhone").val(phone);
    $("#updateEmail").val(emailAddress);
    $("#updatePassword").iCheck('uncheck');
    $("#updateNewPassword").val("");

    var productionRoleList = productionRole.split(",");

    $("#updateProcessor").iCheck(productionRoleList.indexOf("0") > -1 ? 'check' : 'uncheck');
    $("#updateSurveyor").iCheck(productionRoleList.indexOf("1") > -1 ? 'check' : 'uncheck');

    var func1 = new Promise(function (resolve) {
        ajaxGet("/AccountManagement/EmailType", null,
            function (ret) {
                resolve('success');
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
                var html = "";
                for (var i = 0; i < ret.datas.length; i++) {
                    var data = ret.datas[i];
                    html += option.format(data.type, data.name);
                }
                $("#upEmailType").append(html);
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
    });


    $("#updateRole").empty();
    var func2 = new Promise(function (resolve) {
        ajaxGet("/RoleManagement/List", null, function (ret) {
            resolve('success');
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var datas = ret.datas.sort(roleRule);
            var option = '<option value="{0}">{1}</option>';
            var html = "";
            for (var i = 0; i < datas.length; i++) {
                var data = datas[i];
                html += option.format(data.id, data.name);
            }
            $("#updateRole").append(html);
            $("#updateRole").val(role).trigger("update");

            getOtherPermission("update_per_body", $("#updateRole").val(), permissions);
        });
    });

    var opType = 100;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var func3 = new Promise(function (resolve) {
        deviceId = new Array();
        var data = {}
        data.opType = opType;
        ajaxPost("/Relay/Post", data, function (ret) {
            resolve('success');
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            if (allDevice == "true") {
                updateList = new Array();
            }
            for (var d in ret.datas) {
                deviceId.push(ret.datas[d].Id.toString());
                if (allDevice == "true") {
                    updateList.push(ret.datas[d].Id);
                }
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
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "aaSorting": [[1, "asc"]],
                    "columns": [
                        { "data": null, "title": "全选<input type='checkbox' class='icb_minimal' id='upCheckAll'>", "render": op, "orderable": false },
                        { "data": "Id", "title": "Id", "render": order },
                        { "data": "Code", "title": "机台号" },
                        { "data": "DeviceName", "title": "设备名" }
                    ],
                    "drawCallback": function (settings, json) {
                        $("#updateDeviceList td").css("pupdateing", "3px");
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
    });

    Promise.all([func1, func2, func3])
        .then((result) => {
            $("#updateUserModal").modal("show");
        });
}

function updateUser() {
    var id = parseInt($("#updateId").html());
    var updateName = $("#updateName").val();
    var updateEmail = $("#updateEmail").val();
    var updatePhone = $("#updatePhone").val();
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
    updateRole = updateRole == null ? "" : updateRole.join();
    var pRole = new Array();
    if ($("#updateProcessor").is(":checked"))
        pRole.push(0);
    if ($("#updateSurveyor").is(":checked"))
        pRole.push(1);
    var pRoles = pRole.join(",");

    var pId = [];
    var cbs = $("#update_per_body .on_cb");
    for (var i = 0, len = cbs.length; i < len; i++) {
        var el = cbs.eq(i);
        var v = el.val();
        if (el.is(":checked") && v > 0)
            pId.push(v);
    }
    var roleIds = pId.join(",");
    var deviceIds = "";
    if ($("#upCheckAll").is(":checked")) {
        //deviceIds = deviceId.join(",");
        deviceIds = "";
    }
    else {
        deviceIds = updateList.join(",");
        //if (pRole.indexOf(0) > -1)
        //    deviceIds = updateList.join(",");
        //else
        //    updateList = new Array();
    }

    if (isStrEmptyOrUndefined(updateName)) {
        layer.msg("姓名不能为空");
        return;
    }

    if (!isStrEmptyOrUndefined(updatePhone) && !isPhone(updatePhone)) {
        layer.msg("手机号错误");
        return;
    }

    var data = {
        id: id,
        name: updateName,
        phone: updatePhone,
        email: updateEmail,
        emailType: updateEmailType,
        role: updateRole,
        permissions: roleIds,
        isProcessor: pRoles,
        allDevice: $("#upCheckAll").is(":checked") ? "1" : "0",
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
    if (isStrEmptyOrUndefined(addRole)) {
        layer.msg("请选择角色");
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

    $(`#${ui}`).empty();
    ajaxGet("/Account/OtherPermissions", { role }, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        };
        var rData = ret.datas;
        var data = [];
        if (permissionList != null) {
            $.each(rData, (index, item) => {
                if (permissionList.indexOf(item.id) > -1)
                    data.push(item.id);
            });
        }
        showPermissions(ui, rData);
        var el = $("#update_per_body .on_cb");
        if (data.length) {
            el.filter('[value=0]').iCheck("check");
        }
        for (var i = 0, len = data.length; i < len; i++) {
            el.filter(`[value=${data[i]}]`).iCheck("check");
        }
    });
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
