function pageReady() {
    getPermissionsList();
}

function getPermissionsList() {

    ajaxGet("/Account/Permissions", {},
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            $("#permissionsList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": [
                        { "data": "id", "title": "Id"},
                        { "data": "name", "title": "Name" },
                        { "data": "isPage", "title": "IsPage" },
                        { "data": "type", "title": "Type" },
                        { "data": "label", "title": "Label" }
                    ]
                });
        });
}