function pageReady() {
    getOrganizationUnits();  
    $("#addMember").addClass('addMember');
}

var doAction = '<div class="btn-group" style="position:absolute;right:30px;top:-0.5px;">' +
    '<button type = "button" class="btn btn-default" > <i class="fa fa-asterisk"></i>操作</button >' +
    '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
    '        <span class="caret"></span>' +
    '        <span class="sr-only">Toggle Dropdown</span>' +
    '    </button>' +
    '    <ul class="dropdown-menu" role="menu">' +
    '       <li><a id="showOrganizat" onclick="showUpdateOrganizationUnits({0}, \'{1}\')">修改</a></li>' +
    '       <li><a onclick="DeleteOrganizat({0}, \'{1}\')">删除</a></li>' +
    '    </ul>' +
    '</div>';

//var template1 = "我是{0}，今年{1}了";
//var result1 = template1.format("loogn", 22)
function getOrganizationUnits() {
    
    ajaxGet("/OrganizationUnitManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            $("#organizationUnits").empty();



            var mMenuStr = '<div class="box box-solid" style="margin-bottom: 0;">' +
                '  <div class="box-header with-border" onclick="onClick(\'onId\',\'onCnt\',\'onName\')">' +
                '      <div class="box-tools" style="left: 0">' +
                '          <button type="button" class="btn btn-box-tool" data-widget="collapse">' +
                '              <i class="fa fa-minus"></i>' +
                '          </button>' +
                '      </div>' +
                '      <h3 class="box-title" style="margin-left: 10px"></h3>' +
                '  </div>' +
                '  <div class="box-body no-padding">' +
                '      <ul class="on_ul nav nav-pills nav-stacked" style="margin-left: 20px">' +
                '      </ul>' +
                ' </div>' +
                '</div>'

            var datas = ret.datas;
            var parents = getOrganizationUnitsParent(datas)
            for (var i = 0; i < parents.length; i++) {
                var childs = getOrganizationUnitsChild(datas, parents[i])
               for (var j = 0; j < childs.length; j++) {
                    var child = childs[j]
                   var mMenu = mMenuStr.replace('onId', child.id).replace('onCnt', child.memberCount).replace('onName', child.name)
                    var option = $(mMenu).clone()
                    option.find('h3').text(child.name + "(" + child.memberCount + ")")
                    option.find('h3').after(doAction.format(child.id, child.name))
                    option.find('.on_ul').attr('id', "on" + child.id)
                    if (child.parentId == 0) {
                        $("#organizationUnits").append(option)
                    } else {
                        $("#organizationUnits").find('[id=' + "on" + child.parentId + ']').append(option)

                    }
                }
            }

        });
}

var op = function (data, type, row) {
    var html = '<button type="button" class="btn btn-primary" data-toggle="modal" onclick="DeletMerber(\'' +
        data.Id + '\',\'' + data.Name + '\')">删除</button>';
    return html;
}

function getMemberList(id,name) {
    $(".merberName").text(name);
     $(".merberName").attr('id', id)
    ajaxGet("/OrganizationUnitManagement/MemberList",
        {
            organizationUnitId: id
        },
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            $("#memberListTable")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "columns": [
                        { "data": "Id", "title": "序号" },
                        { "data": "Name", "title": "姓名" },
                        { "data": "RoleName", "title": "角色" },
                        { "data": null, "title": "操作", "render": op },
                    ],
                });

        });
}

function onClick(id, cnt,name) {
    $("#memberListTable").empty();
    $("#addMember").removeClass('addMember');
    getMemberList(id, name);
   
}

function rule(a, b) {
    return a.id > b.id;
}

function getOrganizationUnitsParent(list) {
    var parents = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i];
        if (parents.indexOf(data.parentId) < 0) {
            parents.push(data.parentId);
        }
    }
    return parents.sort();
}

function getOrganizationUnitsChild(list, parentId) {
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i];
        if (data.parentId == parentId) {
            result.push(data);
        }
    }

    return result.sort(rule)
}

function showAddOrganizationUnits() {
    var data_firstDepart = $("input[name=isDepart1]:checked").val();
    if (data_firstDepart == "1") {
        $(".firstDepart1").show();
        $(".firstDepart2").hide();

    }
    if (data_firstDepart == "2") {
        $(".firstDepart1").show();
        $(".firstDepart2").show();

    }
    var data = {}
    //分类判断
    $("input[name=isDepart1]").change(
        function () {
            var data_depart1 = $(this).val();
            if (data_depart1 == "1") {
                $(".firstDepart1").show();
                $(".firstDepart2").hide();

            }
            if (data_depart1 == "2") {
                $(".firstDepart1").show();
                $(".firstDepart2").show();

            }
        });
    ajaxGet("/OrganizationUnitManagement/List", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            $("#firstPart1").val("");
            $("#firstPart2").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#firstPart2").append(option.format(data.id, data.name));
            }

            $("#addStruct").modal("show");

        });
}

function addOrganizationUnits() {
    var data = {}
    //选择
    var data_firstDepart1 = $("input[name=isDepart1]:checked").val();
    //获取
    var data_firstAdd1 = $("#firstPart1").val();
    var data_pcid = $("#firstPart2").val();

    //一级部门
    if (data_firstDepart1 == "1") {
        data.parentId = 0
        data.name = data_firstAdd1;
    }
    if (data_firstDepart1 == "2") {
        data.parentId = data_pcid;
        data.name = data_firstAdd1;
    }

    var doSth = function () {

        $("#addStruct").modal("hide");

        ajaxPost("/OrganizationUnitManagement/Add", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getOrganizationUnits();
                }
            });
    }
    showConfirm("添加", doSth);
}

function delOrganizationUnits() {

}

function showUpdateOrganizationUnits(id, name) {
    var data = {}
    ajaxGet("/OrganizationUnitManagement/List", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            $("#firstPart1").empty();
            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#firstPart1").append(option.format(data.Id, data.Name));
            }
            $("#updateId").html(id);
            $("#showOrganizationName").val(name);

            $("#showUpdateOrganizationUnits").modal("show");
        });

}

function updateOrganizationUnits() {

    var id = parseInt($("#updateId").html());
    var updataOrganizatName = $("#showOrganizationName").val();
    var doSth = function () {
        $("#showUpdateOrganizationUnits").modal("hide");
        var data = {
            id: id,
            name: updataOrganizatName
        }
        ajaxPost("/OrganizationUnitManagement/Update", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getOrganizationUnits();
                }
            });
    }
    showConfirm("修改", doSth);
}

function DeleteOrganizat(id, OrganizName) {

    var doSth = function () {
        var data = {
            id: id,
        }

        ajaxPost("/OrganizationUnitManagement/Delete", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getOrganizationUnits();
                }
            });
    }
    showConfirm("删除组织：" + OrganizName, doSth);
}
function moveOrganizationUnits() {

}

function delMember() {

}

function addMember() {

}

function updateMember() {

}

function getAccountName(list) {
    var parents = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i];
        if (parents.indexOf(data.account) < 0) {
            parents.push(data.account);
        }
    }
    return parents.sort(rule);
}
function getAccountData(list, account) {
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i];
        if (data.account == account) {
            result.push(data);
        }
    }

    return result.sort(rule)
}
function showAddMan() {
    $("#addMan").modal("show");
    $(".checkMerber").empty();
    ajaxGet("/AccountManagement/List", null,
        function(ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var mMenuStr = '<div class="box box-solid" style="margin-bottom: 0;">' +
                '  <div class="box-header with-border">' +
                '      <h3 class="box-title" style="margin-left: 10px"></h3>' +
                '  </div>' +
                '</div>'
            var rolesChoice = '<input type="checkbox" class="selectCodes" name="codes" /> '
            var datas = ret.datas;
            var parents = getAccountName(datas)
            console.log(parents);
            for (var i = 0; i < parents.length; i++) {
                var childs = getAccountData(datas, parents[i])
                for (var j = 0; j < childs.length; j++) {
                    var child = childs[j]
                    var mMenu = mMenuStr
                    var option = $(mMenu).clone()
                    option.find('h3').text(child.account)
                    option.find('.box-title').before(rolesChoice)
                    option.find('.selectCodes').attr('value', child.id)
                   $(".checkMerber").append(option)
                }
            }
        })
}
function addMerbers() {
    var id = $(".merberName").attr("id");
    var name = $(".merberName").text();
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

 
    var doSth = function () {
        $("#addMan").modal("hide");
        var data = {
            organizationUnitId: id,
            memberId: codeId
        }
  ajaxPost("/OrganizationUnitManagement/AddMember", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getMemberList(id, name);
                    getOrganizationUnits();  
                }
            });
    }

    showConfirm("添加", doSth);

}
function closeStruct() {


}
function DeletMerber(id,Name) {
    var organizatId = $(".merberName").attr("id");
    var name = $(".merberName").text();
    var doSth = function () {
        var data = {
            organizationUnitId: organizatId,
            memberId: id
        }

        ajaxPost("/OrganizationUnitManagement/DeleteMember", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getMemberList(organizatId, name);
                    getOrganizationUnits();  
                }
            });
    }
    showConfirm("删除成员：" + Name, doSth);

}



