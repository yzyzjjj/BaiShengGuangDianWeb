function pageReady() {
    getRoleList()
}

var op = function (data, type, row) {
    var html = '<div class="btn-group">' +
        '<button type = "button" class="btn btn-default" > <i class="fa fa-asterisk"></i>操作</button >' +
        '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
        '        <span class="caret"></span>' +
        '        <span class="sr-only">Toggle Dropdown</span>' +
        '    </button>' +
        '    <ul class="dropdown-menu" role="menu">{0}{1}' +
        '    </ul>' +
        '</div>';
    var updateLi = '<li><a onclick="showUpdateSite({0}, \'{1}\', \'{2}\', \'{3}\')">修改</a></li>'.format(data.Id, data.SiteName, data.RegionDescription, data.Manager);
    var deleteLi = '<li><a onclick="DeleteSite({0}, \'{1}\')">删除</a></li>'.format(data.Id, data.SiteName);
    html = html.format();
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
                    "aLengthMenu": [5, 10, 50], //更改显示记录数选项  
                    "iDisplayLength": 5, //默认显示的记录数  
                    "columns": [
                        { "data": "id", "title": "序号" },
                        { "data": "name", "title": "角色名称" },
                        { "data": null, "title": "操作", "render": op },
                    ]
                });
        });
}



function addModel() {
    var doSth = function () {

    }
    showConfirm("添加", doSth);
}
function showAddRoles() {
    var data = {}
    $("#addRoles").modal("show");
    $("#addRoleName").empty();

    $(".jolesAdd").click(function () {
        $(this).addClass('skins_roles');
        $(".powerList").removeClass('skins_roles');
        $(".powerChoice").addClass('appear_d');
        $(".addRoles").removeClass('appear_d');
    });

    $("#powerChoice").empty();
    $(".powerList").click(function () {

        $(this).addClass('skins_roles');
        $(".jolesAdd").removeClass('skins_roles');
        $(".addRoles").addClass('appear_d');
        $(".powerChoice").removeClass('appear_d');
        ajaxGet("/Account/Permissions", data,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                };
                var mMenuStr = '<div class="box box-solid" style="margin-bottom: 0;">' +
                    '  <div class="box-header with-border" onclick="onClick(\'onId\')">' +
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

                var datas = ret.datas
                var parents = getRolesParent(datas)
                for (var i = 0; i < parents.length; i++) {
                    var childs = getRolesChild(datas, parents[i].isPage, parents[i].name)
                    for (var j = 0; j < childs.length; j++) {
                        var child = childs[j]
                        var mMenu = mMenuStr.replace('onId', child.id)
                        var option = $(mMenu).clone()
                        option.find('h3').text()
                        option.find('.on_ul').attr('id', "on" + child.id)
                        if (child.type == 1) {
                            $(".powerChoice").append(option)
                        } else {
                            $(".powerChoice").find('[id=' + "on" + child.type + ']').append(option)

                        }
                    }
                }

            });



    });
}

function addRoles() {

    var rolesNames = $("#addRoleName").val();
    if (isStrEmptyOrUndefined(rolesNames)) {
        showTip($("#updateSiteNameTip"), "角色不能为空");
        return;
    }
    var doSth = function () {
        $("#addRoles").modal("hide");
        var data = {}
        data.opData = JSON.stringify({
            //角色名称
            Name: rolesNames
        });
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
function rule(a, b) {
    return a.id > b.id
}

function getRolesParent(list) {
    var parents = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (data.isPage == true) {

            parents.push(data.isPage, data.name)
        }
    }
    return parents.sort(rule)


}


function getRolesChild(list, isPage, name) {
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (data.isPage == isPage && data.name == name) {
            result.push(data)
        }
    }

    return result.sort(rule)
}
