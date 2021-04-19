var _permissionList = [];
var tableTmp = [];
function pageReady() {
    _permissionList[116] = { uIds: ['showAddUserModal'] };
    _permissionList[117] = { uIds: [] };
    _permissionList[118] = { uIds: [] };
    _permissionList = checkPermissionUi(_permissionList);
    getUsersList();
    $(".ms2").select2();
    $("#add_perDiv").on("click", function () {
        var addRole = $("#addRole").val();
        addRole = addRole == null ? "" : addRole.join();
        getOtherPermission("add_per_body", addRole, null);
    });
    $("#update_perDiv").on("click", function () {
        var updateRole = $("#updateRole").val();
        updateRole = updateRole == null ? "" : updateRole.join();
        getOtherPermission("update_per_body", updateRole, permission, 1);
    });

    $("#updatePassword").on("ifChanged", function (event) {
        if (!$(this).is(":checked")) {
            $("#updateNewPassword").attr("disabled", "disabled").val("");
        } else {
            $("#updateNewPassword").removeAttr("disabled");
        }
    });
    $("#addEmail,#updateEmail").on("input", function () {
        $(this)[0].value = $(this)[0].value.replace(/[^\w\@\.\-]+/g, "");
    });
    $("#add_per_body,#update_per_body").on('ifClicked', '.on_cb', function (event) {
        var f = !$(this).is(":checked");
        var solid = $(this).parents(".box-solid");
        solid.eq(0).find(".on_cb").iCheck(f ? "check" : 'uncheck');
        if (f) {
            solid.find('.on_cb:first').iCheck("check");
        }
        //else {
        //    solid.eq(0).find(".on_cb").iCheck('uncheck');
        //    for (var i = 1, len = solid.length; i < len; i++) {
        //        var el = solid.eq(i);
        //        if (!el.find('ul:first > li').find('.on_cb:first').is(":checked")) {
        //            el.find('.on_cb:first').iCheck("uncheck");
        //        };
        //    }
        //}
    });
    $('#updateAccount,#addAccount').on('input', function () {
        $(this).val($(this).val().replace(/\W/g, ''));
    });
}

function getUsersList() {
    var getUsersListFunc = new Promise(function (resolve) {
        ajaxPost("/Relay/Post", {
            opType: 75,
            opData: JSON.stringify({
                all: true
            })
        }, ret => {
            resolve('success');
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            const rData = ret.datas;
            const tableId = "userTable";
            const tableEl = `#${tableId}`;
            const tableArr = `${tableId}Arr`;
            const tableData = `${tableId}Data`;
            tableTmp[tableArr] = [];
            tableTmp[tableData] = [];

            if (!tableTmp[tableId]) {
                const tableConfig = dataTableConfig(rData);
                var per117 = _permissionList[117].have;
                var per118 = _permissionList[118].have;
                var del = function (data, type, row) {
                    return data.MarkedDelete ? "<span class='text-red'>是</span>" : "否";
                }
                tableConfig.addColumns([
                    { data: "Account", title: "用户名" },
                    { data: "Number", title: "编号" },
                    { data: "Name", title: "姓名" },
                    { data: "RoleName", title: "角色" },
                    { data: "Phone", title: "手机号" },
                    { data: "EmailAddress", title: "邮箱" },
                    { data: null, title: "删除", "render": del }
                ]);
                if (per117 || per118) {
                    const op = function (data, type, row) {
                        const upUsers = `<li><a onclick="showUpdateUserModal(${data.Id}, \'${data.Role}\', \'${escape(data.Account)}\', 
                                            \'${escape(data.Name)}\', \'${escape(data.Phone)}\', \'${escape(data.EmailAddress)}\', 
                                            \'${escape(data.SelfPermissions)}\', \'${escape(data.DeviceIds)}\',\'${escape(data.ProductionRole)}\',\'${escape(data.EmailType)}\',\'${escape(data.AllDevice)}\')">修改</a></li>`;
                        const delUsers = `<li><a onclick="deleteUser(${data.Id}, \'${escape(data.Account)}\')">删除</a></li>`;

                        return data.MarkedDelete || (!per117 && !per118) ? "" : `<div class="btn-group">
                                <button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >
                                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                        <span class="caret"></span>
                                        <span class="sr-only">Toggle Dropdown</span>
                                    </button>
                                    <ul class="dropdown-menu" role="menu" style="cursor:pointer">${per117 ? upUsers : ""}${per118 ? delUsers : ""}
                                    </ul>
                                </div>`;
                    }

                    tableConfig.addColumns([
                        { data: null, title: "操作", render: op, orderable: false }
                    ]);
                }
                tableTmp[tableId] = $(tableEl).DataTable(tableConfig);
            } else {
                updateTable(tableTmp[tableId], rData);
            }
        });
    });
    Promise.all([getUsersListFunc])
        .then((result) => {
        });
}

function deleteUser(id, account) {
    account = unescape(account);
    showConfirm(`删除用户：${account}`, () => {
        ajaxPost("/Relay/Post", {
            opType: 78,
            opData: JSON.stringify({
                ids: [id]
            })
        }, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                getUsersList();
            }
        });
    });
}

function roleRule(a, b) {
    return a.Id < b.Id ? 1 : -1;
}

function addReset() {
    addList = new Array();
    $(".dd").val("");
    $("#addProcessor").iCheck('uncheck');
    $("#addSurveyor").iCheck('uncheck');
    lastAddRole = "";
    addList = new Array();
    showAddUserModal(-1);
}

var addList = null;
var deviceId = null;
function showAddUserModal(type = 0) {
    lastAddRole = "";
    emailType();
    addList = new Array();
    $("#add_protoDiv").click();
    $(".dd").val("");
    $("#addProcessor").iCheck('uncheck');
    $("#addSurveyor").iCheck('uncheck');
    $("#addRole").empty();
    var func1 = new Promise(function (resolve) {
        ajaxPost("/Relay/Post", {
            opType: 81
        }, ret => {
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
                html += option.format(d.Id, d.Name);
            }
            $("#addRole").append(html);
        });
    });
    var func2 = new Promise(function (resolve) {
        deviceId = new Array();
        ajaxPost("/Relay/Post", {
            opType: 100
        }, ret => {
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
    ajaxPost("/Relay/Post", {
        opType: 79
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $("#addEmailType").empty();
        if (tf) {
            tf = false;
            $("#addEmailType").before('<label class="control-label">邮件类型：</label>');
        }

        $("#addEmailType").append(ret.datas.reduce((a, b, _) => `${a}<label class="control-label" style="margin-left:10px">${b.Name}：</label><input type="checkbox" value=${b.Type} class="icb_minimal">`, ''))
            .iCheck({
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

function addUser(close) {
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

    showConfirm("添加", () => {
        ajaxPost("/Relay/Post", {
            opType: 77,
            opData: JSON.stringify([{
                Account: addAccount,
                Password: addPassword,
                Name: addName,
                Phone: addPhone,
                EmailAddress: addEmail,
                EmailType: addEmailType,
                Role: addRole,
                Permissions: roleIds,
                ProductionRole: pRoles,
                AllDevice: $("#checkAll").is(":checked"),
                DeviceIds: deviceIds
            }])
        }, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno != 0) {
                return;
            }
            close && $("#addUserModal").modal("hide");
            getUsersList();
        });
    });
}

var updateList = new Array();
var permission = null;
var tf1 = true;
function showUpdateUserModal(id, role, account, name, phone, emailAddress, permissions, deviceIds, productionRole, emailType, allDevice) {
    lastUpdateRole = "";
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
        ajaxPost("/Relay/Post", {
            opType: 79
        }, ret => {
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

            $("#upEmailType").html(ret.datas.reduce((a, b, _) => `${a}<label class="control-label" style="margin-left:10px">${b.Name}：</label><input type="checkbox" value=${b.Type} class="icb_minimal">`, ''))
                .iCheck({
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
        ajaxPost("/Relay/Post", {
            opType: 81
        }, ret => {
            resolve('success');
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var datas = ret.datas.sort(roleRule);
            $("#updateRole").html(setOptions(datas, 'Name'));
            $("#updateRole").val(role).trigger("update");

            getOtherPermission("update_per_body", role, permissions, 1);
        });
    });
    var func3 = new Promise(function (resolve) {
        deviceId = new Array();
        var data = {}
        data.opType = 100;
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

function updateUser(close) {
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

    if (!isEmail(updateEmail) && !isStrEmptyOrUndefined(updateEmail)) {
        showTip("updateEmailTip", "邮箱格式不正确，请输入：登录名@主机名.域名的格式");
        return;
    }
    var data = {
        Id: id,
        Name: updateName,
        Phone: updatePhone,
        EmailAddress: updateEmail,
        EmailType: updateEmailType,
        Role: updateRole,
        Permissions: roleIds,
        ProductionRole: pRoles,
        AllDevice: $("#checkAll").is(":checked"),
        DeviceIds: deviceIds

    };
    if ($("#updatePassword").is(":checked")) {
        var updateNewPassword = $("#updateNewPassword").val();
        if (isStrEmptyOrUndefined(updateNewPassword)) {
            layer.msg("密码不能为空");
            return;
        }
        data.NewPassword = updateNewPassword;
    }
    if (isStrEmptyOrUndefined(updateEmail) && !isStrEmptyOrUndefined(updateEmailType)) {
        layer.msg("选择邮件类型邮箱不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addRole)) {
        layer.msg("请选择角色");
        return;
    }
    showConfirm("修改", () => {
        ajaxPost("/Relay/Post", {
            opType: 76,
            opData: JSON.stringify([data])
        }, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno != 0) {
                return;
            }
            close && $("#updateUserModal").modal("hide");
            getUsersList();
        });
    });
}

var lastAddRole = 0;
var lastUpdateRole = 0;
function getOtherPermission(ui, role, permissions, type = 0) {
    if (type == 0) {
        if (lastAddRole === role)
            return;
        $('#add_per_body').empty();
        lastAddRole = role;
    } else {
        if (lastUpdateRole === role)
            return;
        $('#update_per_body').empty();
        lastUpdateRole = role;
    }
    var permissionList = null;
    if (!isStrEmptyOrUndefined(permissions))
        permissionList = permissions.split(",").map(Number);

    $(`#${ui}`).empty();
    ajaxPost("/Relay/Post", {
        opType: 53,
        opData: JSON.stringify({
            role
        })
    }, ret => {
        var rData = ret.datas;
        var data = [];
        if (permissionList != null) {
            $.each(rData, (index, item) => {
                if (permissionList.indexOf(item.Id) > -1)
                    data.push(item.Id);
            });
        }
        showPermissions(ui, rData);
        var el = $("#update_per_body .on_cb");
        if (data.length) {
            el.filter('[value=0]').iCheck("check");
        }
        for (var i = 0, len = data.length; i < len; i++) {
            el.filter(`[value = ${data[i]}]`).iCheck("check");
        }
    });
}

