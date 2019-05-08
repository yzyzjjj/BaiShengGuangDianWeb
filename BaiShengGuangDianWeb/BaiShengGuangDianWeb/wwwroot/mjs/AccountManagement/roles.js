function pageReady() {
    getRoleList();
}
var op = function (data, type, row) {
    var html = '<div class="btn-group">' +
        '<button type = "button" class="btn btn-default" > <i class="fa fa-asterisk"></i>操作</button >' +
        '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
        '        <span class="caret"></span>' +
        '        <span class="sr-only">Toggle Dropdown</span>' +
        '    </button>' +
        '    <ul class="dropdown-menu" role="menu">' +
        '<li><a onclick="showUpdateRoles({0}, \'{1}\', \'{2}\')">修改</a></li>'.format(data.id, data.name, data.permissions) +
        '<li><a onclick="DeleteRoles({0}, \'{1}\')">删除</a></li>'.format(data.id, data.name) +
        '</ul>' +
        '</div>';

    return html;
}
function getRoleList() {
    ajaxGet("/RoleManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
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
                        { "data": "id", "title": "序号" },
                        { "data": "name", "title": "角色名称" },
                        { "data": null, "title": "操作", "render": op },
                    ]
                });
        });
}
function showAddRoles() {
    $(".powerChoice").addClass('appear_d');
    var data = {}
    $("#addRoles").modal("show");
    $(".powerChoice").empty();
    ajaxGet("/Account/Permissions", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
    $("#addRoleName").empty();
    $(".jolesAdd").addClass('skins_roles');
    $(".addRoles").removeClass('appear_d');
    $(".powerList").removeClass('skins_roles');
    $(".jolesAdd").click(function () {
        $(this).addClass('skins_roles');
        $(".powerList").removeClass('skins_roles');
        $(".powerChoice").addClass('appear_d');
        $(".addRoles").removeClass('appear_d');
    });
    $("#addRoleName").empty();
    $(".powerChoice").empty();
    $(".powerList").click(function () {
        $(".powerChoice").empty();
        $(this).addClass('skins_roles');
        $(".jolesAdd").removeClass('skins_roles');
        $(".addRoles").addClass('appear_d');
        $(".powerChoice").removeClass('appear_d');
                $(".powerChoice").empty();
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
                    '      <div class="box-tools" style="left: 29px">' +
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
                    $(".powerChoice").append(option)
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
                                if ($(".powerChoice").find('[id=' + "cont" + 0 + ']')) {
                                    $(".powerChoice").find('[id=' + "cont" + 0 + ']').append(option)
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
                                    option.find('.selectCheck').attr('id', "la_d" + [n] + [j])
                                    option.find('.fa').attr('class', "fa fa-plus")
                                    option.find('.on_ul').attr('id', "la" + [n] + [j])
                                    if ($(".powerChoice").find('[id=' + "on" + types.Pid + ']')) {
                                        $(".powerChoice").find('[id=' + "on" + types.Pid + ']').append(option)
                                        chioce(n,j);
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
                                           $(".powerChoice").find('[id=' + "la" + [n] + [j] + ']').append(option);
                                          
                                       } else {
                                           $(".powerChoice").find('[id=' + "la_d" + [n] + [j] + ']').attr('value', labelchild.id);
                                               
                                        }
                                        childID(n, j, labelchild.id)   
                                    }
                                }
                            }
                        }
                }
                //接口
                var falseParent = getRolesParent(datas, false);
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
                                if ($(".powerChoice").find('[id=' + "cont" + 1 + ']')) {
                                    $(".powerChoice").find('[id=' + "cont" + 1 + ']').append(option)
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
                                    option.find('.fa').attr('class', "fa fa-plus")
                                    option.find('.selectCheck').attr('id', "la_dfalse" + [n]+[j])
                                    option.find('.on_ul').attr('id', "lafalse" + [n]+[j] )
                                    if ($(".powerChoice").find('[id=' + "onfalse" + types.Pid + ']')) {
                                        $(".powerChoice").find('[id=' + "onfalse" + types.Pid + ']').append(option);
                                        falsechioce(n,j)
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
                                        $(".powerChoice").find('[id=' + "lafalse" + [n] + [j] + ']').append(option)
                                        falseChildID(n, j, labelchild.id)
                                    }
                                }
                            }
                        }
        }
        //$('input').iCheck({
        //    checkboxClass: 'icheckbox_flat-blue',  // 注意square和blue的对应关系
           
        //}); 
            });
    });
}
function onClick(id) {


}
function addRoles() {
    var rolesNames = $("#addRoleName").val();
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
    //console.log(roleId)
    //console.log(roleArray)
    if (isStrEmptyOrUndefined(rolesNames)) {
        showTip($("#updateSiteNameTip"), "角色名不能为空");
        return;
    }
    if (roleArray == "") {
        $("#tip_Power").modal("show");
       return
    }
    var doSth = function () {
        $("#addRoles").modal("hide");
        var data = {
            //角色名称
            name: rolesNames,
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
    chk_value.splice(0, chk_value.length);//清空数组 
    //console.log(chk_value);
}
function rule(a, b) {
    return a.id > b.id
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
function showUpdateRoles(id, name, permissions) {
    $("#updataRoles").modal("show");
    var dataPermissions = []
    var dataPermissions = permissions.split(",");
    var data = {};
    ajaxGet("/Account/Permissions", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
    $("#updateId").html(id);
    $("#updataRoleName").val(name);
    $(".jolesAdd").addClass('skins_roles');
    $(".upRoles").removeClass('appear_d');
    $(".updataChoice").addClass('appear_d');
    $(".uppowerList").removeClass('skins_roles');
    $(".jolesAdd").click(function () {
        $(this).addClass('skins_roles');
        $(".uppowerList").removeClass('skins_roles');
        $(".updataChoice").addClass('appear_d');
        $(".upRoles").removeClass('appear_d');
    });
    $("#updataChoice").empty();
    $(".uppowerList").click(function () {
        data = {}
        $(this).addClass('skins_roles');
        $(".jolesAdd").removeClass('skins_roles');
        $(".upRoles").addClass('appear_d');
        $(".updataChoice").removeClass('appear_d');
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
                             chioce(n,j);
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


    });

}
function updataRoles() {
    var id = parseInt($("#updateId").html());
    var upRoleName = $("#updataRoleName").val();
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
        $("#updataRoles").modal("hide");
        var data = {
            id: id,
            //角色名称
            name: upRoleName,
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
function DeleteRoles(id, name) {
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
            $("#checkd0").prop("checked", true);
            $("#checks" + i).parent().parent().find(".selectCheck").prop("checked", true);
            $("#checks" + i).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", true);
        } else {
            
            $("#checks" + i).parent().parent().find(".selectCheck").prop("checked", false);
            if ($("#checks" + i).parent().parent().find(".selectCheck").prop("checked", false)) {
                $("#checks" + i).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", false);
            }
            
        }

    })
}
function chioce(n,j) {
    $("#la_d" + [n] + [j]).click(function () {
        if (this.checked) {
            $("#checkd0").prop("checked", true);
            $("#la_d" + [n] + [j]).parent().parent().find(".selectCheck").prop("checked", true);
            $("#la_d" + [n] + [j]).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", true);
        } else {
            $("#la_d" + [n] + [j]).parent().parent().find(".selectCheck").prop("checked", false);
            $("#la_d" + [n] + [j]).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", true);
        }
    }) 
}
function childID(n, j, m) {
    $("#name_d" + m).click(function () {
        if (this.checked) {
            $("#checkd0").prop("checked", true);
            $("#la_d" + [n] + [j]).prop("checked", true);
            if ($("#la_d" + [n] + [j]).prop("checked", true)) {
                $("#la_d" + [n] + [j]).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", true);
            }
            
        } else {
            $("#la_d" + [n] + [j]).prop("checked", true);
        }
    })
}
function falseType(m) {
    $("#false" + m).click(function () {
        if (this.checked) {
            $("#checkd1").prop("checked", true);
            $("#false" + m).parent().parent().find(".selectCheck").prop("checked", true);
            $("#false" + m).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", true);
        } else {
            $("#false" + m).parent().parent().find(".selectCheck").prop("checked", false);
            if ($("#false" + m).parent().parent().find(".selectCheck").prop("checked", false)) {
                $("#false" + m).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", false);
            }
            
        }
    })
}
function falsechioce(n,j) {
    $("#la_dfalse" + [n]+[j]).click(function () {
        if (this.checked) {
            $("#checkd1").prop("checked", true);
            $("#la_dfalse" + [n] + [j]).parent().parent().find(".selectCheck").prop("checked", true);
            $("#la_dfalse" + [n] + [j]).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", true);
        } else {
            $("#la_dfalse" + [n] + [j]).parent().parent().find(".selectCheck").prop("checked", false);
            $("#la_dfalse" + [n] + [j]).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", true);
        }
    })
}
function falseChildID(n, j, m) {
    $("#name_dfalse" + m).click(function () {
        if (this.checked) {
            $("#checkd1").prop("checked", true);
            $("#la_dfalse" + [n] + [j]).prop("checked", true);
            if ($("#la_dfalse" + [n] + [j]).prop("checked", true)) {
                $("#la_dfalse" + [n] + [j]).parent().parent().parent().parent().prev().children(".selectCheck").prop("checked", true);
            }

        } else {
            $("#la_dfalse" + [n] + [j]).prop("checked", true);
        }
    })
}

