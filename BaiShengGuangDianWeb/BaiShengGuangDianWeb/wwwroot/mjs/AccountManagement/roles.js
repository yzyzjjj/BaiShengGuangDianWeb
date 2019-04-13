function pageReady() {
    getRoleList()
}
function getRoleList() {
    ajaxGet("/RoleManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var op = function (data, type, row) {
                var html = '<button type="button" class="btn btn-primary" data-toggle="modal" onclick="showDevice(\'' +
                    row.id + '\',\'' + row.name + '\',\'' + row.roleName +
                    '\')">修改</button>';
                html += '<button type="button" class="btn btn-primary" data-toggle="modal" onclick="showDevice(\'' +
                    row.id + '\',\'' + row.name + '\',\'' + row.roleName +
                    '\')">删除</button>';
                return html;
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

function showAddModel() {
    
}

function addModel() {
    var doSth = function () {
        
    }
    showConfirm("添加", doSth);
}