function pageReady() {
    getUsers()
}
function getUsers() {
    ajaxGet("/AccountManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            
            var op = function (data, type, row) {
                var html = '<button type="button" class="btn btn-primary" data-toggle="modal" onclick="showDevice(\'' +
                    row.id + '\',\'' + row.name + '\',\'' + row.roleName +
                    '\')">删除</button>';
                return html;
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
