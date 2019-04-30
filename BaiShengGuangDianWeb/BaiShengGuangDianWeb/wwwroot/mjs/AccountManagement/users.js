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
        '<li><a onclick="showUpdateUsers({0}, \'{1}\', \'{2}\', \'{3}\', \'{4}\', \'{5}\')">修改</a></li>'.format(data.id, data.account, data.emailAddress, data.name,data.roleName, data.permissions) +
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
                    "aLengthMenu": [1, 2, 3], //更改显示记录数选项  
                    "iDisplayLength": 1, //默认显示的记录数  
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
     
    });
    
    $(".usersList").click(function () {

        $(this).addClass('skins_roles');
        $(".usersAdd").removeClass('skins_roles');
        $(".addUsers").addClass('appear_d');
        $(".usersChoice").removeClass('appear_d');
        //persions开始
        ajaxGet("/Account/Permissions", data,
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
                var rolesChoice = '<input type="checkbox" class="selectCheck" name="privilegeIds"  /> '

                var datas = ret.datas
                //获取isPage第一层为true
                var parents = getRolesParent(datas, true)
                //获取type值
                var rolesType = getRolesTypes(parents)
                var pages = { name: "网页", parentID: 0 }
                var mMenu = mMenuStr.replace('onId', pages.parentID)
                var option = $(mMenu).clone()
                option.find('h3').text(pages.name)
                option.find('.box-tools').before(rolesChoice)
                option.find('.selectCheck').attr('id', "checks" + pages.parentID)
                option.find('.on_ul').attr('id', "cont" + pages.parentID)
                $(".usersChoice").append(option)
                var type_d = [{ name: " 页面相关", Pid: 1 }, { name: " 组织管理", Pid: 2 }, { name: "设备管理", Pid: 3 }, { name: "流程卡管理", Pid: 4 }, { name: "工艺管理", Pid: 5 }, { name: "维修管理", Pid: 6 }]

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
                            if ($(".usersChoice").find('[id=' + "cont" + pages.parentID + ']')) {
                                $(".usersChoice").find('[id=' + "cont" + pages.parentID + ']').append(option)
                                //复选框
                                $(".usersChoice").find('[id=' + "checks" + types.Pid + ']').click(function () {
                                    $(".usersChoice").find('[id=' + "checks" + pages.parentID + ']').prop("checked", true)
                                })

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
                                if ($(".usersChoice").find('[id=' + "on" + types.Pid + ']')) {
                                    $(".usersChoice").find('[id=' + "on" + types.Pid + ']').append(option)
                                    //复选框
                                    $(".usersChoice").find('[id=' + "la_d" + lable_D.labelID + ']').click(function () {
                                        $(".usersChoice").find('[id=' + "checks" + 1 + ']').prop("checked", true)
                                    })
                                    $(".usersChoice").find('[id=' + "la_d" + lable_D.labelID + ']').click(function () {
                                        $(this).find('input[name="privilegeIds"]:checkbox').prop("checked", true)
                                    })

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
                                    option.find('.on_ul').attr('id', "name" + labelchild.id)
                                    if (labelchild.label == lable_D.label && labelchild.label != labelchild.name) {
                                        $(".usersChoice").find('[id=' + "la" + lable_D.labelID + ']').append(option)
                                        //复选框
                                        $(".usersChoice").find('[id=' + "la_d" + lable_D.labelID + ']').click(function () {
                                            $(".usersChoice").find('[id=' + "checks" + 1 + ']').prop("checked", true)
                                        })
                                    }

                                }


                            }

                        }

                    }


                }

                //选择                   
                $(".selectCheck:first").click(function () {
                    if (this.checked) {
                        $("input[name='privilegeIds']:checkbox").each(function () {
                            $(this).prop("checked", true);
                        });
                    } else {
                        $("input[name='privilegeIds']:checkbox").each(function () {
                            $(this).prop("checked", false);
                        });
                    }

                });


            });
        //persions结束

    });
}
function addUsers() {

    var usersNames = $("#addUsersName").val();
    var personNames = $("#addPersonName").val();
    var email = $("#addEmail").val();
    var Password = $("#addPassword").val();
    var roles= $("input[name=usersName]:checked").val();
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
            account:usersNames,
            password:Password,
            name: personNames,
            email: email,
            role: roles,
            permissions: roleId
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
function showUpdateUsers(id, account, email, name,rolename, permissions) {
    $("#updataUsers").modal("show");
    $(".updataChoice").addClass('appear_d');
    var dataPermissions = []
    var dataPermissions = permissions.split(",");
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
                    if (joles.name == rolename) {

                        $(".jolesChoice").find('.selectUsers').prop("checked", true)
                    } 
                }

            }

        })
    console.log(dataPermissions)
    $("#updateId").html(id);
    $("#updataUsersName").val(account);
    $("#updataPersonName").val(name);
    $("#updataEmail").val(email);

    $(".usersAdd").addClass('skins_roles');
    $(".upUsers").removeClass('appear_d');
    $(".updataChoice").addClass('appear_d');
    $(".usersList").removeClass('skins_roles');
    $(".usersAdd").click(function () {

        $(this).addClass('skins_roles');
        $(".usersList").removeClass('skins_roles');
        $(".updataChoice").addClass('appear_d');
        $(".upUsers").removeClass('appear_d');
    });
    
    $(".usersList").click(function () {
        data = {}
        $(this).addClass('skins_roles');
        $(".usersAdd").removeClass('skins_roles');
        $(".upUsers").addClass('appear_d');
        $(".updataChoice").removeClass('appear_d');
        ajaxGet("/Account/Permissions", data,
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
                var rolesChoice = '<input type="checkbox" class="selectCheck" name="privilegeIds" /> '

                var datas = ret.datas
                //获取isPage第一层为true
                var parents = getRolesParent(datas, true)
                //获取type值
                var rolesType = getRolesTypes(parents)
                var pages = { name: "网页", parentID: 0 }
                var mMenu = mMenuStr.replace('onId', pages.parentID)
                var option = $(mMenu).clone()
                option.find('h3').text(pages.name)
                option.find('.box-tools').before(rolesChoice)
                option.find('.selectCheck').attr('id', "checks" + pages.parentID)
                option.find('.on_ul').attr('id', "cont" + pages.parentID)
                $(".updataChoice").append(option)
                var type_d = [{ name: " 页面相关", Pid: 1 }, { name: " 组织管理", Pid: 2 }, { name: "设备管理", Pid: 3 }, { name: "流程卡管理", Pid: 4 }, { name: "工艺管理", Pid: 5 }, { name: "维修管理", Pid: 6 }]

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
                            if ($(".updataChoice").find('[id=' + "cont" + pages.parentID + ']')) {
                                $(".updataChoice").find('[id=' + "cont" + pages.parentID + ']').append(option)
                                //复选框
                                $(".updataChoice").find('[id=' + "checks" + types.Pid + ']').click(function () {
                                    $(".updataChoice").find('[id=' + "checks" + pages.parentID + ']').prop("checked", true)
                                })

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
                                    //复选框
                                    $(".updataChoice").find('[id=' + "la_d" + lable_D.labelID + ']').click(function () {
                                        $(".updataChoice").find('[id=' + "checks" + 1 + ']').prop("checked", true)
                                    })
                                    $(".updataChoice").find('[id=' + "la_d" + lable_D.labelID + ']').click(function () {
                                        $(this).find('input[name="privilegeIds"]:checkbox').prop("checked", true)
                                    })

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
                                    option.find('.on_ul').attr('id', "name" + labelchild.id)
                                    if (labelchild.label == lable_D.label && labelchild.label != labelchild.name) {
                                        $(".updataChoice").find('[id=' + "la" + lable_D.labelID + ']').append(option)
                                        //复选框

                                        $(".updataChoice").find('[id=' + "la_d" + lable_D.labelID + ']').click(function () {
                                            $(".updataChoice").find('[id=' + "checks" + 1 + ']').prop("checked", true)
                                        })
                                    }

                                }


                            }

                        }

                    }


                }
                
            });


    });

}
function updataUsers() {
    var id = parseInt($("#updateId").html());
    var upUserName = $("#updataPersonName").val();
    var password = $("#updataPassword").val();
    var email = $("#updataEmail").val();
    var roles = $("input[name=usersName]:checked").val();
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
            password: password,
            name: upUserName,
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
