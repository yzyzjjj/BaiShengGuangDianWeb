function pageReady() {
    getRoleList();



    showAddRoles();
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
                    '<li><a onclick="showUpdateRoles({0}, \'{1}\', \'{2}\')">修改</a></li>'.format(data.id, data.name, data.permissions) +
                    '<li><a onclick="DeleteRoles({0}, \'{1}\')">删除</a></li>'.format(data.id, data.name) +
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

    $("#addRoleName").empty();
    $("#div_per").empty();
    ajaxGet("/Account/Permissions", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            $("#addRoleModel").modal("show");

            var mOptionStr = '<div class="box box-solid" style="margin-bottom: 0;">' +
                '    <div class="box-header with-border no-padding">' +
                '        <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="on_i fa fa-minus"></i></button>' +
                '        <input type="checkbox" class="on_cb" style="width: 15px;"/>' +
                '        <h3 class="box-title" style="vertical-align: middle;font-size: 16px;"></h3>' +
                '    </div>' +
                '    <div class="box-body no-padding">' +
                '        <ul class="on_ul nav nav-pills nav-stacked" style="margin-left: 20px"></ul>' +
                '    </div>' +
                '</div>';
            var mNameStr = '<li>' +
                '    <div class="box-header with-border no-padding">' +
                '        <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa"></i></button>' +
                '        <input type="checkbox" class="on_cb" style="width: 15px;" />' +
                '        <h3 class="box-title" style="vertical-align: middle;font-size: 16px;"></h3>' +
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

            var datas = ret.datas;
            for (var i = 0; i < pages.length; i++) {
                var page = pages[i];
                var pageData = getPageData(datas, page.isPage);

                var option = $(mOptionStr).clone();
                option.find("h3").text(page.name);
                option.find(".icheckbox_minimal").attr("value", page.id);
                option.find(".on_ul").attr("id", "ul" + page.id);
                $("#div_per").append(option);
                var dTypes = getTypes(pageData);
                for (var j = 0; j < dTypes.length; j++) {
                    var dType = dTypes[j];
                    var type = types[dType];
                    var typeData = getTypeData(pageData, dType);

                    option = $(mOptionStr).clone();
                    option.find("h3").text(type.name);
                    option.find(".icheckbox_minimal").attr("value", type.id);
                    option.find(".on_ul").attr("id", "ul" + type.id);
                    $("#div_per").find("[id=ul" + page.id + "]").append(option);

                    var dLabels = getLabels(typeData);
                    for (var k = 0; k < dLabels.length; k++) {
                        var dLabel = dLabels[k];
                        var labelData = getLabelData(pageData, dLabel);
                        var firstData = labelData.shift();

                        option = $(mOptionStr).clone();
                        option.find("h3").text(dLabel);
                        option.find(".icheckbox_minimal").attr("value", firstData.id);
                        option.find(".on_ul").attr("id", "ul" + firstData.id);
                        option.addClass("collapsed-box");
                        option.find(".on_i").removeClass("fa-minus");
                        option.find(".on_i").addClass("fa-plus");

                        $("#div_per").find("[id=ul" + type.id + "]").append(option);
                        for (var l = 0; l < labelData.length; l++) {
                            var lData = labelData[l];

                            option = $(mNameStr).clone();
                            option.find("h3").text(lData.name);
                            option.find(".icheckbox_minimal").attr("value", lData.id);
                            $("#div_per").find("[id=ul" + firstData.id + "]").append(option);

                        }
                    }
                }
            }

            $(".on_cb").iCheck({
                checkboxClass: 'icheckbox_minimal',
                radioClass: 'iradio_minimal',
                increaseArea: '20%' // optional
            });

            $(".on_cb").on('ifChecked', function (event) {
                var checks = $(this).parents(".box-solid");
                if (checks.length > 1) {
                    for (var m = 0; m < checks.length; m++) {
                        var check = checks[m];
                        $(check).find(".on_cb").iCheck('check');
                    }

                }

            });
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

function getLabelData(datas, label) {
    var res = new Array();
    for (var i = 0; i < datas.length; i++) {
        var data = datas[i];
        if (data.label == label) {
            res.push(data);
        }
    }
    return res;
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
        showTip($("#addRoleNameTip"), "角色名不能为空");
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
                                    chioce(n, j);
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
function chioce(n, j) {
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
function falsechioce(n, j) {
    $("#la_dfalse" + [n] + [j]).click(function () {
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

