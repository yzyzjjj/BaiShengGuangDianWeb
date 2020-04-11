function pageReady() {
    $(".ms2").select2();
    getOrganizationUnits();
    $("#rdo1").on("ifChanged", function (event) {
        if (!$(this).is(":checked")) {
            $("#cbDiv").removeClass("hidden");
        } else {
            $("#cbDiv").addClass("hidden");
        }
    });
    if (!checkPermission(66)) {
        $("#showAddOrganizationUnitModal").addClass("hidden");
    }
}

function getOrganizationUnits() {
    $("#organizationUnits").empty();
    ajaxGet("/OrganizationUnitManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var doAction = '<div class="btn-group pull-right">' +
                '<button type = "button" class="btn btn-default btn-sm" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >' +
                '    <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                '        <span class="caret"></span>' +
                '        <span class="sr-only">Toggle Dropdown</span>' +
                '    </button>' +
                '    <ul class="dropdown-menu" role="menu" style="cursor:pointer">{0}{1}' +
                '    </ul>' +
                '</div>';

            var mMenuStr = '<div class="box box-solid noShadow"  style="margin-bottom: 0;">' +
                '    <div class="box-header" style="padding: 2px;">' +
                '        <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="on_i fa fa-minus"></i></button>' +
                '        <h3 class="box-title" style="vertical-align: middle;font-size: 16px;" onclick="onClick(\'{0}\',\'{1}\')"></h3>' +
                '    </div>' +
                '    <div class="box-body no-padding">' +
                '        <ul class="on_ul nav nav-pills nav-stacked mli" style="margin-left: 20px"></ul>' +
                '    </div>' +
                '</div>';

            var datas = ret.datas;
            var parents = getOrganizationUnitsParent(datas);
            for (var i = 0; i < parents.length; i++) {
                var children = getOrganizationUnitsChild(datas, parents[i]);
                for (var j = 0; j < children.length; j++) {
                    var child = children[j];
                    var mMenu;
                    var option;

                    var upUnit = '<li><a onclick="showUpdateOrganizationUnit({0}, \'{1}\')">修改</a></li>'.format(child.id, escape(child.name));
                    var delUnit = '<li><a onclick="deleteOrganizationUnit({0}, \'{1}\')">删除</a></li>'.format(child.id, escape(child.name));
                    var da = "";
                    if (checkPermission(67) || checkPermission(68)) {
                        da = doAction.format(
                            checkPermission(67) ? upUnit : "",
                            checkPermission(68) ? delUnit : "");
                    }
                    if (child.parentId == 0) {
                        mMenu = mMenuStr.format(child.id, escape(child.name));
                        option = $(mMenu).clone();
                        option.find('h3').text(child.name).append("(<span>" + child.memberCount + "</span>)");
                        option.find('h3').after(da);
                        option.find('.on_ul').attr('id', "on" + child.id);
                        $("#organizationUnits").append(option);
                    } else {
                        mMenu = "<li>" + mMenuStr.format(child.id, escape(child.name)) + "</li>";
                        option = $(mMenu).clone();
                        option.find('h3').text(child.name).append("(<span>" + child.memberCount + "</span>)");
                        option.find('h3').after(da);
                        option.find('.on_ul').attr('id', "on" + child.id);
                        $("#organizationUnits").find('[id=' + "on" + child.parentId + ']').append(option);
                    }
                }
            }
        });
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
    return parents.sort(function (a, b) { return a > b ? 1 : -1 });
}

function getOrganizationUnitsChild(list, parentId) {
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i];
        if (data.parentId == parentId) {
            result.push(data);
        }
    }

    return result.sort(rule);
}

function showAddOrganizationUnitModal() {
    $("#rdo2").iCheck("check");
    $("#cbDiv").removeClass("hidden");
    $("#addOrganizationUnit").empty();
    $("#addName").val("");
    ajaxGet("/OrganizationUnitManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            var option = '<option value="{0}">{1}</option>';
            var dataS = OrganizationUnitSort(ret.datas);
            for (var i = 0; i < dataS.length; i++) {
                var data = dataS[i];
                $("#addOrganizationUnit").append(option.format(data.id, data.name));
            }
            $("#addOrganizationUnitModal").modal("show");
        });
}

function OrganizationUnitSort(dataS) {
    var data = [];
    var depName;
    var parents = getOrganizationUnitsParent(dataS);
    for (var i = 0; i < parents.length; i++) {
        var children = getOrganizationUnitsChild(dataS, parents[i]);
        for (var j = 0; j < children.length; j++) {
            var child = children[j];
            var parent = child.parentId;
            if (parent == 0) {
                data.push({
                    id: child.id,
                    name: child.name
                });
            } else {
                depName = child.name;
                while (parent != 0) {
                    $.each(dataS, function (index, item) {
                        if (item.id == parent) {
                            depName = depName.replace("", item.name + " - ");
                            parent = item.parentId;
                            return false;
                        }
                    });
                }
                data.push({
                    id: child.id,
                    name: depName
                });
            }
        }
    }
    return data;
}

function addOrganizationUnit() {
    var data = {}
    var addName = $("#addName").val().trim();
    if (isStrEmptyOrUndefined(addName)) {
        layer.msg("部门名称不能为空");
        return;
    }
    if ($("#rdo1").is(":checked")) {
        //一级部门
        data.parentId = 0;
        data.name = addName;
    } else {
        var pid = $("#addOrganizationUnit").val();
        data.parentId = pid;
        data.name = addName;
    }
    var doSth = function () {
        $("#addOrganizationUnitModal").modal("hide");
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

function showUpdateOrganizationUnit(id, name) {
    name = unescape(name);
    $("#updateId").html(id);
    $("#organizationName").val(name);
    $("#updateOrganizationUnitModal").modal("show");
}

function updateOrganizationUnit() {

    var id = parseInt($("#updateId").html());
    var organizationName = $("#organizationName").val().trim();
    if (isStrEmptyOrUndefined(organizationName)) {
        layer.msg("部门名称不能为空");
        return;
    }

    var doSth = function () {
        $("#updateOrganizationUnitModal").modal("hide");
        var data = {
            id: id,
            name: organizationName
        }
        ajaxPost("/OrganizationUnitManagement/Update", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getOrganizationUnits();
                    if (!$("#showAddMemberModal").is(":hidden") && $("#unName").attr("value") == id) {
                        $("#unName").text(organizationName);
                    }
                }
            });
    }
    showConfirm("修改", doSth);
}

function deleteOrganizationUnit(id, organizationUnitName) {
    organizationUnitName = unescape(organizationUnitName);

    var doSth = function () {
        var data = {
            id: id
        }

        ajaxPost("/OrganizationUnitManagement/Delete", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    //getOrganizationUnits();
                    $("#on" + id).parents(".box-solid:first").remove();
                    if (!$("#showAddMemberModal").is(":hidden") && $("#unName").attr("value") == id) {
                        $("#memberDataTable").empty();
                        $("#memberDataTable").append('<table class="table table-hover table-striped" id="memberListTable"></table>');
                        $("#showAddMemberModal,#showBolModal").addClass("hidden");
                        $("#unName").text("成员列表");
                        $("#unName").removeAttr("value");
                    }
                }
            });
    }
    showConfirm("删除部门：" + organizationUnitName, doSth);
}

function moveOrganizationUnits() {

}

function onClick(id, name) {
    name = unescape(name);
    $("#memberListTable").empty();
    getMemberList(id, name);
}

var memberList = null;
function getMemberList(id, name) {
    memberList = new Array();
    $("#unName").text(name);
    $("#unName").attr("value", id);
    $("#showAddMemberModal").removeClass("hidden");
    $("#showBolModal").removeClass("hidden");
    var opType = 71;
    if (!checkPermission(opType)) {
        $("#showAddMemberModal").addClass("hidden");
    }
    ajaxGet("/OrganizationUnitManagement/MemberList",
        {
            organizationUnitId: id
        },
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            for (var i = 0; i < ret.datas.length; i++) {
                memberList.push(ret.datas[i].Id);
            }
            var op = function (data, type, row) {
                var html = '<button type="button" class="btn btn-primary btn-sm btn-danger" data-toggle="modal" onclick="deleteMember({0},\'{1}\')">删除</button>'.format(data.Id, escape(data.Name));
                return html;
            }

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var columns = checkPermission(72)
                ? [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "Name", "title": "姓名" },
                    { "data": "RoleName", "title": "角色" },
                    { "data": null, "title": "操作", "render": op }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "Name", "title": "姓名" },
                    { "data": "RoleName", "title": "角色" }
                ];
            var defs = checkPermission(72)
                ? [
                    { "orderable": false, "targets": 4 }
                ]
                : "";

            $("#memberListTable")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "columns": columns,
                    "columnDefs": defs,
                    "drawCallback": function (settings, json) {
                        $("#memberListTable td").css("padding", "3px");
                    }
                });
        });
}

var addList = null;
function showAddMemberModal() {
    $("#memberList").empty();
    addList = new Array();
    ajaxGet("/AccountManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var data = new Array();
            for (var i = 0; i < ret.datas.length; i++) {
                if (memberList.indexOf(ret.datas[i].id) == -1 && !ret.datas[i].isDeleted)
                    data.push(ret.datas[i]);
            }
            var op = function (data, type, row) {
                return '<input type="checkbox" value="{0}" class="icb_minimal" onclick="">'.format(data.id);
            }

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            $("#memberList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": data,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "aaSorting": [[0, "asc"]],
                    "columns": [
                        { "data": null, "title": "序号", "render": order },
                        { "data": "id", "title": "id", "bVisible": false },
                        { "data": "name", "title": "姓名" },
                        { "data": "account", "title": "账号" },
                        { "data": "roleName", "title": "角色" },
                        { "data": null, "title": "选择", "sClass": "text-red", "render": op, "orderable": false }
                    ],
                    "drawCallback": function (settings, json) {
                        $("#memberList td").css("padding", "3px");
                        $("#memberList .icb_minimal").iCheck({
                            checkboxClass: 'icheckbox_minimal',
                            radioClass: 'iradio_minimal',
                            increaseArea: '20%' // optional
                        });
                        $("#memberList .icb_minimal").on('ifChanged', function (event) {
                            var ui = $(this);
                            var v = ui.attr("value");
                            if (ui.is(":checked")) {
                                ui.parents("tr:first").css("background-color", "gray");
                                addList.push(v);
                            } else {
                                if (ui.parents("tr:first").hasClass("odd"))
                                    ui.parents("tr:first").css("background-color", "#f9f9f9");
                                else
                                    ui.parents("tr:first").css("background-color", "");

                                addList.splice(addList.indexOf(v), 1);
                            }
                        });
                    }
                });
            $("#addMemberModal").modal("show");
        });
}

function addMember() {
    var unId = $("#unName").attr("value");
    var unName = $("#unName").text();
    if (addList == null || addList.length == 0) {
        layer.msg("请选择成员");
        return;
    }
    var codeId = addList.join(",");
    var cnt = addList.length;
    addList = new Array();
    var doSth = function () {
        $("#addMemberModal").modal("hide");
        var data = {
            organizationUnitId: unId,
            memberId: codeId
        }
        ajaxPost("/OrganizationUnitManagement/AddMember", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getMemberList(unId, unName);

                    var ui = $("#on" + unId).parents(".box-solid:first").find("span:first");
                    ui.html(parseInt(ui.text()) + cnt);
                }
            });
    }

    showConfirm("添加", doSth);

}

function deleteMember(id, name) {
    name = unescape(name);
    var unId = $("#unName").attr("value");
    var unName = $("#unName").text();
    var doSth = function () {
        var data = {
            organizationUnitId: unId,
            memberId: id
        }

        ajaxPost("/OrganizationUnitManagement/DeleteMember", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getMemberList(unId, unName);
                    var ui = $("#on" + unId).parents(".box-solid:first").find("span:first");
                    ui.html(parseInt(ui.text() - 1));
                }
            });
    }
    showConfirm("删除成员：" + name, doSth);

}
