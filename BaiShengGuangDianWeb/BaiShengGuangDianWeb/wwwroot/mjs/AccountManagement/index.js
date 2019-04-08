function pageReady() {
    getOrganizationUnits()
}

function getOrganizationUnits() {
    ajaxGet("/OrganizationUnitManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            $("#organizationUnits").empty();
           
            var mMenuStr = '<div class="box box-solid" style="margin-bottom: 0;">' +
                '  <div class="box-header with-border" onclick="onClick(\'onId\',\'onCnt\')">' +
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
                '  </div>' +
                '</div>'

            var datas = ret.datas
            var parents = getOrganizationUnitsParent(datas)
            for (var i = 0; i < parents.length; i++) {
                var childs = getOrganizationUnitsChild(datas, parents[i])
                for (var j = 0; j < childs.length; j++) {
                    var child = childs[j]
                    var mMenu = mMenuStr.replace('onId', child.id).replace('onCnt', child.memberCount)
                    var option = $(mMenu).clone()
                    option.find('h3').text(child.name + "(" + child.memberCount + ")")
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
    var html = '<button type="button" class="btn btn-primary" data-toggle="modal" onclick="showDevice(\'' +
        row.Id + '\',\'' + row.Name + '\',\'' + row.RoleName +
        '\')">删除</button>';
    return html;
}

function getMemberList(id) {
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
                        { "data": null, "title": "操作", "render": op },
                        { "data": "Name", "title": "姓名" },
                        { "data": "RoleName", "title": "角色" },
                    ],
                });
        });
}

function onClick(id, cnt) {
    $("#memberListTable").empty();
    if (cnt == 0)
        return;
    getMemberList(id)
}

function rule(a, b) {
    return a.id > b.id
}

function getOrganizationUnitsParent(list) {
    var parents = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if ($.inArray(data.parentId, parents) < 0) {
            parents.push(data.parentId)
        }
    }
    return parents
}

function getOrganizationUnitsChild(list, parentId) {
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (data.parentId == parentId) {
            result.push(data)
        }
    }

    return result.sort(rule)
}

function addOrganizationUnits() {

}

function delOrganizationUnits() {

}

function updateOrganizationUnits() {

}

function moveOrganizationUnits() {

}

function delMember() {

}

function addMember() {

}

function updateMember() {

}




