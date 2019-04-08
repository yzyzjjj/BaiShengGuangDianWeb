function pageReady() {
    getRolemanager()
}
function getRolemanager() {
    ajaxGet("/RoleManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            //var act = '<div class="dropdown">' +
            //    '<button type="button" class="btn dropdown-toggle" id="dropdownMenu1" data-toggle="dropdown">' +
            //'操作<span class="caret"></span>' +
            //   '</button>'+
            //  ' <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">' + 
            //    '<li role="presentation">'+
            //   '<a role="menuitem" tabindex="-1" href="#">修改</a>'+
            //    '</li>' +
            //    '<li role="presentation" class="divider"></li>' +
            //    '<li role="presentation">'+
            //    '<a role="menuitem" tabindex="-1" href="#">删除</a>'+
            //    '</li>' +
                
            //    ' </ul>' +
            //    '</div>'
               
                //< table class="table table-bordered" >
                //<caption></caption>
                //<thead>
                //<tr>
                //<th>序号</th>
                //<th>角色名称</th>
                //<th>操作</th>
                //</tr>
                //</thead>
                //<tbody id="rolemanages">

                //</tbody>

            //var datas = ret.datas

            //for (var i = 0; i < datas.length; i++) {
            //    var roletr = '<td>' + datas[i].id + '</td>' + '<td>' + datas[i].name + '</td> ' + '<td>' + act + '</td> '
            //    $("#rolemanages").append('<tr>' + roletr + '</tr>')


            //}
            var op1 = function (data, type, row) {
                var html = '<button type="button" class="btn btn-primary" data-toggle="modal" onclick="showDevice(\'' +
                    row.id + '\',\'' + row.name + '\',\'' + row.roleName +
                    '\')">删除</button>'; 
                return html;
            }
            var op2 = function (data, type, row) {
                var html = '<button type="button" class="btn btn-primary" data-toggle="modal" onclick="showDevice(\'' +
                    row.id + '\',\'' + row.name + '\',\'' + row.roleName +
                    '\')">操作</button>';
                return html;
            }
            $("#rolesmanagers")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aLengthMenu": [5, 10, 50], //更改显示记录数选项  
                    "iDisplayLength": 5, //默认显示的记录数  
                    "columns": [
                        { "data": null, "title": "操作", "render": op1 },
                        { "data": "id", "title": "序号" },
                        { "data": "name", "title": "角色名称" },
                        { "data": null, "title": "编辑", "render": op2},
                       
                    ],
                });

        });
}