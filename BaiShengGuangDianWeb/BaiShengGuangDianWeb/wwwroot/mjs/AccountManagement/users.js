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

            //var doact = '<div class="dropdown">' +
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
               
                
            //var datas = ret.datas

            //for (var i = 0; i < datas.length; i++) {
            //    var Users = '<td>' + datas[i].id + '</td>' + '<td>' + datas[i].account + '</td> '+ '<td> ' + datas[i].name + '</td> ' + '<td>' + datas[i].roleName + '</td> ' + '<td>' + datas[i].emailAddress + '</td> '+ '<td>' + doact + '</td> '
            //    $("#usersman").append('<tr>' + Users + '</tr>')


            //}
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
                        { "data": null, "title": "操作", "render": op },
                        { "data": "id", "title": "序号" },
                        { "data": "account", "title": "用户名" },
                        { "data": "name", "title": "姓名" },
                        { "data": "roleName", "title": "角色" },
                        { "data": "emailAddress", "title": "邮箱" },
                      
                        
                    ],
                });

        });
}
