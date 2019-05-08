function pageReady() {
    getUsersList()
}
var op = function (data, type, row) {
    var html = '<div class="btn-group">' +
        '<button type = "button" class="btn btn-default" > <i class="fa fa-asterisk"></i>操作</button >' +
        '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
        '        <span class="caret"></span>' +
        '        <span class="sr-only">Toggle Dropdown</span>' +
        '    </button>' +
        '    <ul class="dropdown-menu" role="menu">' +
        '<li><a onclick="showUpdateUsers({0}, \'{1}\', \'{2}\', \'{3}\', \'{4}\', \'{5}\', \'{6}\')">修改</a></li>'.format(data.id, data.account, data.emailAddress, data.name, data.roleName, data.permissions, data.deviceIds) +
        '<li><a onclick="DeleteUsers({0}, \'{1}\')">删除</a></li>'.format(data.id, data.account) +
        '</ul>' +
        '</div>';

    return html;
}
function getUsersList() {
    ajaxGet("/AccountManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            $("#userTable")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aLengthMenu": [8, 16, 24], //更改显示记录数选项  
                    "iDisplayLength": 8, //默认显示的记录数  
                    "columns": [
                        { "data": "id", "title": "序号" },
                        { "data": "account", "title": "用户名" },
                        { "data": "name", "title": "姓名" },
                        { "data": "roleName", "title": "角色" },
                        { "data": "emailAddress", "title": "邮箱" },
                        { "data": null, "title": "操作", "render": op },
                    ],
                });

        });
}
function showAddUsers() {
    $("#addUsers").modal("show");
    $("#addUsersName").empty();
    $(".usersChoice").addClass('appear_d');
    $(".joinworker").addClass('appear_d');
    $(".usersAdd").addClass('skins_roles');
    $(".workman").removeClass('skins_roles');
    $(".workman").hide();
    var data = {}
    ajaxGet("/RoleManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            $(".jolesChoice").empty();
            var userJoles = '<div class="box box-solid userRoles" style="margin-bottom: 0;">' +
                '       <input type="radio" style="font-size:20px;" class="selectUsers" name="usersName"  /> ' +
                '       <h3 class="box-title" style="margin-left: 30px;font-size:18px;display:inline-block;"></h3>' +
                '</div>'
            var datas = ret.datas;
            var usersName = getUsersName(datas);
            console.log(usersName)
            for (var i = 0; i < usersName.length; i++) {
                var userdata = getUsersData(datas, usersName[i])
                for (var j = 0; j < userdata.length; j++) {
                    var joles = userdata[j]
                    var option = $(userJoles).clone()
                    option.find('h3').text(joles.name)
                    option.find('.selectUsers').attr('value', joles.id)
                    $(".jolesChoice").append(option)
                    $("input[name=usersName]:first").prop("checked",true)
                }
            }
        })
    $("#addUsersName").empty();
    $(".usersAdd").addClass('skins_roles');
    $(".addUsers").removeClass('appear_d');
    $(".usersList").removeClass('skins_roles');
   
    $(".usersAdd").click(function () {
        $(this).addClass('skins_roles');
        $(".usersList").removeClass('skins_roles');
        $(".usersChoice").addClass('appear_d');
        $(".addUsers").removeClass('appear_d');
        $(".workman").removeClass('skins_roles');
        $(".joinworker").addClass('appear_d');
    });
   
       
    $(".usersList").click(function () {
        $(this).addClass('skins_roles');
        $(".usersAdd").removeClass('skins_roles');
        $(".addUsers").addClass('appear_d');
        $(".usersChoice").removeClass('appear_d');
        $(".workman").removeClass('skins_roles');
        $(".joinworker").addClass('appear_d');
        var roels = $(".selectUsers:checked").val();
        data = {
            role: roels,
        }
        //persions开始
        ajaxGet("/Account/OtherPermissions", data,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                };

                $(".usersChoice").empty();

                var mMenuStr = '<div class="box box-solid" style="margin-bottom: 0;">' +
                    '  <div class="box-header with-border" onclick="onClick(\'onId\')">' +
                    '      <div class="box-tools" style="left: 28px">' +
                    '          <button type="button" class="btn btn-box-tool" data-widget="collapse">' +
                    '              <i class="fa fa-minus" style="margin-left:1px;"></i>' +
                    '          </button>' +
                    '      </div>' +
                    '      <h3 class="box-title" style="margin-left: 30px"></h3>' +
                    '  </div>' +
                    '  <div class="box-body no-padding">' +
                    '      <ul class="on_ul nav nav-pills nav-stacked" style="margin-left: 20px">' +
                    '      </ul>' +
                    ' </div>' +
                    '</div>'
                var mMenus = '<div class="box box-solid collapsed-box" style="margin-bottom: 0;">' +
                    '  <div class="box-header with-border" onclick="onClick(\'onId\')">' +
                    '      <div class="box-tools" style="left: 28px">' +
                    '          <button type="button" class="btn btn-box-tool" data-widget="collapse">' +
                    '              <i class="fa fa-minus" style="margin-left:1px;"></i>' +
                    '          </button>' +
                    '      </div>' +
                    '      <h3 class="box-title" style="margin-left: 30px"></h3>' +
                    '  </div>' +
                    '  <div class="box-body no-padding">' +
                    '      <ul class="on_ul nav nav-pills nav-stacked" style="margin-left: 20px">' +
                    '      </ul>' +
                    ' </div>' +
                    '</div>'
                var rolesChoice = '<input type="checkbox" class="selectCheck" name="privilegeIds" value="" /> '
                var datas = ret.datas;
                var pages = [{ name: "网页", parentID: 0 }, { name: "接口", parentID: 1 }]
                for (var t = 0; t < pages.length; t++) {
                    var mMenu = mMenuStr.replace('onId', pages[t].parentID)
                    var option = $(mMenu).clone()
                    option.find('h3').text(pages[t].name)
                    option.find('.box-tools').before(rolesChoice)
                    option.find('.selectCheck').attr('id', "checkd" + pages[t].parentID)
                    option.find('.on_ul').attr('id', "cont" + pages[t].parentID)
                    $(".usersChoice").append(option)
                    checkeds(pages[t].parentID);
                }
                var falseParent = getRolesParent(datas, false)
                var type_d = [{ name: " 页面管理", Pid: 1 }, { name: " 组织管理", Pid: 2 }, { name: "设备管理", Pid: 3 }, { name: "流程卡管理", Pid: 4 }, { name: "工艺管理", Pid: 5 }, { name: "维修管理", Pid: 6 }]
                //获取isPage第一层为true
                var parents = getRolesParent(datas, true)
                //获取type值
                var rolesType = getRolesTypes(parents)
                for (var i = 0; i < rolesType.length; i++) {
                    //获取当type=1时的data
                    var childs = getChildRolesTypes(parents, rolesType[i])
                    for (var n = 0; n < type_d.length; n++) {
                        var types = type_d[n]
                        if (types.Pid == rolesType[i]) {
                            var mMenu = mMenuStr.replace('onId', rolesType[i])
                            var option = $(mMenu).clone()
                            option.find('h3').text(types.name)
                            option.find('.box-tools').before(rolesChoice)
                            option.find('.selectCheck').attr('id', "checks" + types.Pid)
                            option.find('.on_ul').attr('id', "on" + types.Pid)
                            if ($(".usersChoice").find('[id=' + "cont" + 0 + ']')) {
                                $(".usersChoice").find('[id=' + "cont" + 0 + ']').append(option)
                                //复选框
                                type(types.Pid);
                                //选择结束
                            }
                            //获取label值的数组
                            var label = getRolesLabel(childs)
                            for (var j = 0; j < label.length; j++) {
                                var labels = label[j]
                                var lable_D = { label: label[j], labelID: j }
                                var mMenu = mMenus.replace('onId', lable_D.labelID)
                                var option = $(mMenu).clone()
                                option.find('h3').text(lable_D.label)
                                option.find('.box-tools').before(rolesChoice)
                                option.find('.selectCheck').attr('id', "la_d" + lable_D.labelID)
                                option.find('.fa').attr('class', "fa fa-plus")
                                option.find('.on_ul').attr('id', "la" + lable_D.labelID)
                                if ($(".usersChoice").find('[id=' + "on" + types.Pid + ']')) {
                                    $(".usersChoice").find('[id=' + "on" + types.Pid + ']').append(option)
                                    chioce(j);
                                }
                                //获取lable相同时的data
                                var childLabel = getChildRolesLabel(childs, label[j])
                                for (var m = 0; m < childLabel.length; m++) {
                                    var labelchild = childLabel[m]
                                    var mMenu = mMenuStr.replace('onId', labelchild.id)
                                    var option = $(mMenu).clone()
                                    option.find('h3').text(labelchild.name)
                                    option.find('.box-tools').before(rolesChoice)
                                    option.find('.selectCheck').attr('id', "name_d" + labelchild.id)
                                    option.find('.selectCheck').attr('value', labelchild.id)
                                    if (labelchild.label != labelchild.name) {
                                        $(".usersChoice").find('[id=' + "la" + lable_D.labelID + ']').append(option);
                                    } else {
                                        $(".usersChoice").find('[id=' + "la_d" + lable_D.labelID + ']').attr('value', labelchild.id);

                                    }

                                }
                            }
                        }
                    }
                }



                //接口
                var falseParent = getRolesParent(datas, false)
                //获取type值
                var rolesTypefalse = getRolesTypes(falseParent)
                for (var i = 0; i < rolesTypefalse.length; i++) {
                    //获取type的data
                    var childsfalse = getChildRolesTypes(falseParent, rolesTypefalse[i])
                    for (var n = 0; n < type_d.length; n++) {
                        var types = type_d[n]
                        if (types.Pid == rolesTypefalse[i]) {
                            var mMenu = mMenuStr.replace('onId', rolesTypefalse[i])
                            var option = $(mMenu).clone()
                            option.find('h3').text(types.name)
                            option.find('.box-tools').before(rolesChoice)
                            option.find('.selectCheck').attr('id', "false" + types.Pid)
                            option.find('.on_ul').attr('id', "onfalse" + types.Pid)
                            if ($(".usersChoice").find('[id=' + "cont" + 1 + ']')) {
                                $(".usersChoice").find('[id=' + "cont" + 1 + ']').append(option)
                                //复选框
                                falseType(types.Pid)
                                //选择结束
                            }
                            //获取label值的数组
                            var labelfalse = getRolesLabel(childsfalse)
                            for (var j = 0; j < labelfalse.length; j++) {
                                var labels = labelfalse[j]
                                var lable_D = { label: labelfalse[j], labelID: j }
                                var mMenu = mMenus.replace('onId', lable_D.labelID)
                                var option = $(mMenu).clone()
                                option.find('h3').text(lable_D.label)
                                option.find('.box-tools').before(rolesChoice)
                                option.find('.selectCheck').attr('id', "la_dfalse" + lable_D.labelID)
                                option.find('.on_ul').attr('id', "lafalse" + lable_D.labelID)
                                option.find('.fa').attr('class', "fa fa-plus")
                                if ($(".usersChoice").find('[id=' + "onfalse" + types.Pid + ']')) {
                                    $(".usersChoice").find('[id=' + "onfalse" + types.Pid + ']').append(option);
                                    falsechioce(lable_D.labelID)
                                }
                                //获取lable相同时的data
                                var childLabels = getChildRolesLabel(childsfalse, labelfalse[j])
                                for (var m = 0; m < childLabels.length; m++) {
                                    var labelchild = childLabels[m]
                                    var mMenu = mMenuStr.replace('onId', labelchild.id)
                                    var option = $(mMenu).clone()
                                    option.find('h3').text(labelchild.name)
                                    option.find('.box-tools').before(rolesChoice)
                                    option.find('.selectCheck').attr('id', "name_dfalse" + labelchild.id)
                                    option.find('.selectCheck').attr('value', labelchild.id)
                                    if (labelchild.label != labelchild.name) {
                                        $(".usersChoice").find('[id=' + "lafalse" + lable_D.labelID + ']').append(option)

                                    } else {
                                        $(".usersChoice").find('[id=' + "la_dfalse" + lable_D.labelID + ']').attr('value', labelchild.id);

                                    }
                                }
                            }
                        }
                    }
                }


            });
        //persions结束
    });
    $("input[name=joinwork]").change(
        function () {
            var data_depart1 = $(this).val();
            if (data_depart1 == "0") {
                $(".workman").show();
               
            }
            if (data_depart1 == "1") {
                $(".workman").hide();
            }
        });
    $(".workman").click(function() {
        $(this).addClass('skins_roles');
        $(".usersAdd").removeClass('skins_roles');
        $(".usersList").removeClass('skins_roles');
        $(".addUsers").addClass('appear_d');
        $(".usersChoice").addClass('appear_d');
        $(".joinworker").removeClass('appear_d');
        var opType = 100;
        if (!checkPermission(opType)) {
            layer.msg("没有权限");
            return;
        }
        var data = {}
        data.opType = opType;
        ajaxPost("/Relay/Post", data,
            function(ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }
                
                var mMenuStr = '<div class="box box-solid" style="margin-bottom: 0;">' +
                    '  <div class="box-header with-border" onclick="onClick(\'onId\')">' +
                    '      <h3 class="box-title" style="margin-left: 10px"></h3>' +
                    '  </div>' +
                    '  <div class="box-body no-padding">' +
                    '      <ul class="on_ul nav nav-pills nav-stacked" style="margin-left: 20px">' +
                    '      </ul>' +
                    ' </div>' +
                    '</div>'
                var rolesChoice = '<input type="checkbox" class="selectCodes" name="codes" /> '
               var datas = ret.datas;
                var parents = getmadeCode(datas)
                console.log(parents);
                for (var i = 0; i < parents.length; i++) {
                    var childs = getCodeData(datas, parents[i])
                    for (var j = 0; j < childs.length; j++) {
                        var child = childs[j]
                        var mMenu = mMenuStr.replace('onId', child.Id)
                        var option = $(mMenu).clone()
                        option.find('h3').text(child.Code)
                        option.find('.box-title').before(rolesChoice)
                        option.find('.selectCodes').attr('value', child.Id)
                        option.find('.on_ul').attr('id', "on" + child.Id)
                        $(".joinworker").append(option)
                     }
                }
               
            })
    })
}
function addUsers() {

    var usersNames = $("#addUsersName").val();
    var personNames = $("#addPersonName").val();
    var email = $("#addEmail").val();
    var Password = $("#addPassword").val();
    var joinswork = $("input[name=joinwork]:checked").val();
    var joincheck = $("input[name=checker]:checked").val();
    var accountArray = new Array();
    if (joinswork == 0 && joincheck == 1) {
        accountArray.push(joinswork);
        accountArray.push(joincheck);
    }
    if (joinswork == 0 && joincheck == 2) {
        accountArray.push(joinswork);
    }
    if (joinswork == 1 && joincheck == 1) {
        accountArray.push(joincheck);
    }
    if (joinswork == 1 && joincheck == 2) {
                  return
    }
    joinsWorkId = accountArray.join(",");
    var roles = $("input[name=usersName]:checked").val();
    if (roles == "") {
        alert("你还未选择角色！")
    }
    var chk_value = [];
    $('input[name="privilegeIds"]:checked').each(function () { //遍历每一个名字为privilegeIds的复选框，其中选中的执行函数
        if ($(this).val() != "") {
            chk_value.push({ id: $(this).val() })
            return chk_value
        }
    });
    //console.log(chk_value)
    var roleArray = new Array();

    for (i = 0; i < chk_value.length; i++) {
        roleArray.push(chk_value[i].id);
    }

    roleId = roleArray.join(",");
    var Code_value = [];
    $('input[name="codes"]:checked').each(function () { //遍历每一个名字为privilegeIds的复选框，其中选中的执行函数
        if ($(this).val() != "") {
            Code_value.push({ id: $(this).val() })
            return Code_value
        }
    });
    //console.log(chk_value)
    var codeArray = new Array();

    for (i = 0; i < Code_value.length; i++) {
        codeArray.push(Code_value[i].id);
    }

    codeId = codeArray.join(",");

    if (isStrEmptyOrUndefined(addUsersName)) {
        showTip($("#usersNameTip"), "用户名不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addPersonName)) {
        showTip($("#personNameTip"), "姓名不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addEmail)) {
        showTip($("#emailNameTip"), "邮箱不能为空");
        return;
    }


    var doSth = function () {
        $("#addUsers").modal("hide");
        var data = {
            account: usersNames,
            password: Password,
            name: personNames,
            email: email,
            role: roles,
            permissions: roleId,
            isProcessor: joinsWorkId,
            deviceIds: codeId
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
function showUpdateUsers(id, account, email, name, rolename, permissions, deviceIds) {
    $("#updataUsers").modal("show");
    $(".updataChoice").addClass('appear_d');
    $(".updataworker").addClass('appear_d');
   $(".usersAdd").addClass('skins_roles');
    $(".workman").removeClass('skins_roles');
    $(".usersList").removeClass('skins_roles');
    $(".upUsers").removeClass('appear_d');
    $(".workman").hide();
    var dataPermissions = []
    var dataPermissions = permissions.split(",");
    var dataDevices = []
    var dataDevices = deviceIds.split(",");
    console.log(dataDevices)
    var data = {}
    ajaxGet("/RoleManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            $(".upjolesChoice").empty();
            var userJoles = '<div class="box box-solid userRoles" style="margin-bottom: 0;">' +
                '       <input type="radio" style="font-size:20px;" class="selectUsersd" name="Namechoice"  /> ' +
                '       <h3 class="box-title" style="margin-left: 30px;font-size:18px;display:inline-block;"></h3>' +
                '</div>'
            var datas = ret.datas;
            var usersName = getUsersName(datas);
            var subscript = usersName.indexOf(rolename)
            
             for (var i = 0; i < usersName.length; i++) {

                var userdata = getUsersData(datas, usersName[i])
                for (var j = 0; j < userdata.length; j++) {
                    var joles = userdata[j]
                    var option = $(userJoles).clone()
                    option.find('h3').text(joles.name)
                    option.find('.selectUsersd').attr('value', joles.id)
                    $(".upjolesChoice").append(option)
                    $("input[name=Namechoice]").eq(subscript).prop("checked", true);
                }

            }
           
        })
    //if (joles.name == rolename) {
    //    $(".jolesChoice").find('.selectUsers').prop("checked", true)
    //}
    $("#updateId").html(id);
    $("#updataUsersName").val(account);
    $("#updataPersonName").val(name);
    $("#updataEmail").val(email);
    $(".usersAdd").click(function () {
        $(this).addClass('skins_roles');
        $(".usersList").removeClass('skins_roles');
        $(".updataChoice").addClass('appear_d');
        $(".upUsers").removeClass('appear_d');
        $(".updataworker").addClass('appear_d');
        $(".workman").removeClass('skins_roles');
    });

    $(".usersList").click(function () {
        $(this).addClass('skins_roles');
        $(".usersAdd").removeClass('skins_roles');
        $(".upUsers").addClass('appear_d');
        $(".updataChoice").removeClass('appear_d');
        $(".workman").removeClass('skins_roles');
        $(".updataworker").addClass('appear_d');
        var roels = $(".selectUsersd:checked").val();
        data = {
            role: roels,
        }
        //persions开始
        ajaxGet("/Account/OtherPermissions", data,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                };

                $(".updataChoice").empty();
                var mMenuStr = '<div class="box box-solid" style="margin-bottom: 0;">' +
                    '  <div class="box-header with-border" onclick="onClick(\'onId\')">' +
                    '      <div class="box-tools" style="left: 28px">' +
                    '          <button type="button" class="btn btn-box-tool" data-widget="collapse">' +
                    '              <i class="fa fa-minus" style="margin-left:1px;"></i>' +
                    '          </button>' +
                    '      </div>' +
                    '      <h3 class="box-title" style="margin-left: 30px"></h3>' +
                    '  </div>' +
                    '  <div class="box-body no-padding">' +
                    '      <ul class="on_ul nav nav-pills nav-stacked" style="margin-left: 20px">' +
                    '      </ul>' +
                    ' </div>' +
                    '</div>'
                var rolesChoice = '<input type="checkbox" class="selectCheck" name="privilegeIds" value="" /> '
                var datas = ret.datas;
                var pages = [{ name: "网页", parentID: 0 }, { name: "接口", parentID: 1 }]
                for (var t = 0; t < pages.length; t++) {
                    var mMenu = mMenuStr.replace('onId', pages[t].parentID)
                    var option = $(mMenu).clone()
                    option.find('h3').text(pages[t].name)
                    option.find('.box-tools').before(rolesChoice)
                    option.find('.selectCheck').attr('id', "checkd" + pages[t].parentID)
                    option.find('.on_ul').attr('id', "cont" + pages[t].parentID)
                    $(".updataChoice").append(option)
                    checkeds(pages[t].parentID);
                }
                var falseParent = getRolesParent(datas, false)
                var type_d = [{ name: " 页面管理", Pid: 1 }, { name: " 组织管理", Pid: 2 }, { name: "设备管理", Pid: 3 }, { name: "流程卡管理", Pid: 4 }, { name: "工艺管理", Pid: 5 }, { name: "维修管理", Pid: 6 }]
                //获取isPage第一层为true
                var parents = getRolesParent(datas, true)
                //获取type值
                var rolesType = getRolesTypes(parents)
                for (var i = 0; i < rolesType.length; i++) {
                    //获取当type=1时的data
                    var childs = getChildRolesTypes(parents, rolesType[i])
                    for (var n = 0; n < type_d.length; n++) {
                        var types = type_d[n]
                        if (types.Pid == rolesType[i]) {
                            var mMenu = mMenuStr.replace('onId', rolesType[i])
                            var option = $(mMenu).clone()
                            option.find('h3').text(types.name)
                            option.find('.box-tools').before(rolesChoice)
                            option.find('.selectCheck').attr('id', "checks" + types.Pid)
                            option.find('.on_ul').attr('id', "on" + types.Pid)
                            if ($(".updataChoice").find('[id=' + "cont" + 0 + ']')) {
                                $(".updataChoice").find('[id=' + "cont" + 0 + ']').append(option)
                                //复选框
                                type(types.Pid);
                                //选择结束
                            }
                            //获取label值的数组
                            var label = getRolesLabel(childs)
                            for (var j = 0; j < label.length; j++) {
                                var labels = label[j]
                                var lable_D = { label: label[j], labelID: j }
                                var mMenu = mMenuStr.replace('onId', lable_D.labelID)
                                var option = $(mMenu).clone()
                                option.find('h3').text(lable_D.label)
                                option.find('.box-tools').before(rolesChoice)
                                option.find('.selectCheck').attr('id', "la_d" + lable_D.labelID)
                                option.find('.on_ul').attr('id', "la" + lable_D.labelID)
                                if ($(".updataChoice").find('[id=' + "on" + types.Pid + ']')) {
                                    $(".updataChoice").find('[id=' + "on" + types.Pid + ']').append(option)
                                    chioce(j);
                                }
                                //获取lable相同时的data
                                var childLabel = getChildRolesLabel(childs, label[j])
                                for (var m = 0; m < childLabel.length; m++) {
                                    var labelchild = childLabel[m]
                                    var mMenu = mMenuStr.replace('onId', labelchild.id)
                                    var option = $(mMenu).clone()
                                    option.find('h3').text(labelchild.name)
                                    option.find('.box-tools').before(rolesChoice)
                                    option.find('.selectCheck').attr('id', "name_d" + labelchild.id)
                                    option.find('.selectCheck').attr('value', labelchild.id)
                                    if (labelchild.label != labelchild.name) {
                                        $(".updataChoice").find('[id=' + "la" + lable_D.labelID + ']').append(option)

                                    } else {
                                        $(".updataChoice").find('[id=' + "la_d" + lable_D.labelID + ']').attr('value', labelchild.id);

                                    }
                                }
                            }
                        }
                    }
                }
                //接口
                var falseParent = getRolesParent(datas, false)
                //获取type值
                var rolesTypefalse = getRolesTypes(falseParent)
                for (var i = 0; i < rolesTypefalse.length; i++) {
                    //获取type的data
                    var childsfalse = getChildRolesTypes(falseParent, rolesTypefalse[i])
                    for (var n = 0; n < type_d.length; n++) {
                        var types = type_d[n]
                        if (types.Pid == rolesTypefalse[i]) {
                            var mMenu = mMenuStr.replace('onId', rolesTypefalse[i])
                            var option = $(mMenu).clone()
                            option.find('h3').text(types.name)
                            option.find('.box-tools').before(rolesChoice)
                            option.find('.selectCheck').attr('id', "false" + types.Pid)
                            option.find('.on_ul').attr('id', "onfalse" + types.Pid)
                            if ($(".updataChoice").find('[id=' + "cont" + 1 + ']')) {
                                $(".updataChoice").find('[id=' + "cont" + 1 + ']').append(option)
                                //复选框
                                falseType(types.Pid)
                                //选择结束
                            }
                            //获取label值的数组
                            var labelfalse = getRolesLabel(childsfalse)
                            for (var j = 0; j < labelfalse.length; j++) {
                                var labels = labelfalse[j]
                                var lable_D = { label: labelfalse[j], labelID: j }
                                var mMenu = mMenuStr.replace('onId', lable_D.labelID)
                                var option = $(mMenu).clone()
                                option.find('h3').text(lable_D.label)
                                option.find('.box-tools').before(rolesChoice)
                                option.find('.selectCheck').attr('id', "la_dfalse" + lable_D.labelID)
                                option.find('.on_ul').attr('id', "lafalse" + lable_D.labelID)
                                if ($(".updataChoice").find('[id=' + "onfalse" + types.Pid + ']')) {
                                    $(".updataChoice").find('[id=' + "onfalse" + types.Pid + ']').append(option);
                                    falsechioce(lable_D.labelID)
                                }
                                //获取lable相同时的data
                                var childLabels = getChildRolesLabel(childsfalse, labelfalse[j])
                                for (var m = 0; m < childLabels.length; m++) {
                                    var labelchild = childLabels[m]
                                    var mMenu = mMenuStr.replace('onId', labelchild.id)
                                    var option = $(mMenu).clone()
                                    option.find('h3').text(labelchild.name)
                                    option.find('.box-tools').before(rolesChoice)
                                    option.find('.selectCheck').attr('id', "name_dfalse" + labelchild.id)
                                    option.find('.selectCheck').attr('value', labelchild.id)
                                    if (labelchild.label != labelchild.name) {
                                        $(".updataChoice").find('[id=' + "lafalse" + lable_D.labelID + ']').append(option)

                                    } else {
                                        $(".updataChoice").find('[id=' + "la_dfalse" + lable_D.labelID + ']').attr('value', labelchild.id);

                                    }
                                }
                            }
                        }
                    }
                }
                //复选框设置

                $('input[name="privilegeIds"]:checkbox').each(function () { //遍历每一个名字为privilegeIds的复选框，其中选中的执行函数
                    for (var i = 0; i < dataPermissions.length; i++) {
                        if ($(this).val() == dataPermissions[i]) {
                            $(this).prop("checked", true);
                        }
                    }

                });
                //复选框设置结束
            });
        //persions结束
    });
    $("input[name=upjoinwork]").change(
        function () {
            var data_depart1 = $(this).val();
            if (data_depart1 == "0") {
                $(".workman").show();

            }
            if (data_depart1 == "1") {
                $(".workman").hide();
            }
            
        });
    if (deviceIds != "") {
        $("input[name=upjoinwork]").eq(0).prop("checked", true);
        $(".workman").show();

    }
    $(".workman").click(function () {
        $(this).addClass('skins_roles');
        $(".usersAdd").removeClass('skins_roles');
        $(".usersList").removeClass('skins_roles');
        $(".upUsers").addClass('appear_d');
        $(".updataChoice").addClass('appear_d');
        $(".updataworker").removeClass('appear_d');
        var opType = 100;
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
                }

                var mMenuStr = '<div class="box box-solid" style="margin-bottom: 0;">' +
                    '  <div class="box-header with-border" onclick="onClick(\'onId\')">' +
                    '      <h3 class="box-title" style="margin-left: 10px"></h3>' +
                    '  </div>' +
                    '  <div class="box-body no-padding">' +
                    '      <ul class="on_ul nav nav-pills nav-stacked" style="margin-left: 20px">' +
                    '      </ul>' +
                    ' </div>' +
                    '</div>'
                var rolesChoice = '<input type="checkbox" class="selectCodes" name="codes" /> '
                var datas = ret.datas;
                var parents = getmadeCode(datas)
                console.log(parents);
                for (var i = 0; i < parents.length; i++) {
                    var childs = getCodeData(datas, parents[i])
                    for (var j = 0; j < childs.length; j++) {
                        var child = childs[j]
                        var mMenu = mMenuStr.replace('onId', child.Id)
                        var option = $(mMenu).clone()
                        option.find('h3').text(child.Code)
                        option.find('.box-title').before(rolesChoice)
                        option.find('.selectCodes').attr('value', child.Id)
                        option.find('.on_ul').attr('id', "on" + child.Id)
                        $(".updataworker").append(option)
                    }
                }
                //选择框设置
                $('input[name="codes"]:checkbox').each(function () { //遍历每一个名字为privilegeIds的复选框，其中选中的执行函数
                    for (var i = 0; i < dataDevices.length; i++) {
                        if ($(this).val() == dataDevices[i]) {
                            $(this).prop("checked", true);
                        }
                    }

                });
                //复选框设置结束
            })
       
    })

}
function updataUsers() {
    var id = parseInt($("#updateId").html());
    var upUserName = $("#updataUsersName").val();
    var upPersonName = $("#updataPersonName").val();
    var password = $("#updataPassword").val();
    var email = $("#updataEmail").val();
    var roles = $("input[name=Namechoice]:checked").val();
    var chk_value = [];
    $('input[name="privilegeIds"]:checked').each(function () { //遍历每一个名字为privilegeIds的复选框，其中选中的执行函数
        if ($(this).val() != "") {
            chk_value.push({ id: $(this).val() })
            return chk_value
        }
    });
    //console.log(chk_value)
    var roleArray = new Array();

    for (i = 0; i < chk_value.length; i++) {
        roleArray.push(chk_value[i].id);
    }

    roleId = roleArray.join(",");

    var doSth = function () {
        $("#updataUsers").modal("hide");

        var data = {
            id: id,
            account: upUserName,
            password: password,
            name: upPersonName,
            email: email,
            role: roles,
            permissions: roleId
        }

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
function DeleteUsers(id, account) {

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
function rule(a, b) {
    return a.id > b.id
}
function onClick(id) {


}
function getUsersName(list) {
    var parents = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (parents.indexOf(data.name) < 0) {
            parents.push(data.name)
        }
    }
    return parents.sort(rule)
}
function getUsersData(list, name) {
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (data.name == name) {
            result.push(data)
        }
    }

    return result.sort(rule)
}
function getRolesParent(list, choice) {
    var parents = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (data.isPage == choice) {
            parents.push(data)
        }
    }
    return parents.sort(rule)
}
function getRolesTypes(list) {
    var types = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (types.indexOf(data.type) < 0) {
            types.push(data.type)
        }
    }
    return types.sort()
}
function getRolesLabel(list) {
    var label = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]


        if (label.indexOf(data.label) < 0) {

            label.push(data.label)
        }

    }

    return label.sort(rule)
}
function getChildRolesLabel(list, label) {
    var childLabel = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (data.label == label) {
            childLabel.push(data)
        }
    }
    return childLabel.sort(rule)
}
function getChildRolesTypes(list, type) {
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (data.type == type) {
            result.push(data)
        }
    }
    return result.sort(rule)
}
function getmadeCode(list) {
    var parents = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (parents.indexOf(data.Code) < 0) {
            parents.push(data.Code)
        }
    }
    return parents.sort(rule)
}
function getCodeData(list, code) {
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (data.Code == code) {
            result.push(data)
        }
    }

    return result.sort(rule)
}
function checkeds(t) {
    $("#checkd" + t).click(function () {
        if (this.checked) {
            $("#checkd" + t).parent().parent().find(".selectCheck").prop("checked", true);
        } else {
            $("#checkd" + t).parent().parent().find(".selectCheck").prop("checked", false);
        }
    })
}
function type(i) {
    $("#checks" + i).click(function () {
        if (this.checked) {
            $("#checks" + i).parent().parent().find(".selectCheck").prop("checked", true);
            $("#checks" + i).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", true);
        } else {
            $("#checks" + i).parent().parent().find(".selectCheck").prop("checked", false);
            $("#checks" + i).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", false);
        }

    })
}
function chioce(i) {
    $("#la_d" + i).click(function () {
        if (this.checked) {
            $("#la_d" + i).parent().parent().find(".selectCheck").prop("checked", true);
            $("#la_d" + i).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", true);
        } else {
            $("#la_d" + i).parent().parent().find(".selectCheck").prop("checked", false);
            $("#la_d" + i).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", false);
        }
    })
}
function falseType(m) {
    $("#false" + m).click(function () {
        if (this.checked) {
            $("#false" + m).parent().parent().find(".selectCheck").prop("checked", true);
            $("#false" + m).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", true);
        } else {
            $("#false" + m).parent().parent().find(".selectCheck").prop("checked", false);
            $("#false" + m).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", false);
        }
    })
}
function falsechioce(i) {
    $("#la_dfalse" + i).click(function () {
        if (this.checked) {
            $("#la_dfalse" + i).parent().parent().find(".selectCheck").prop("checked", true);
            $("#la_dfalse" + i).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", true);
        } else {
            $("#la_dfalse" + i).parent().parent().find(".selectCheck").prop("checked", false);
            $("#la_dfalse" + i).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", false);
        }
    })
}