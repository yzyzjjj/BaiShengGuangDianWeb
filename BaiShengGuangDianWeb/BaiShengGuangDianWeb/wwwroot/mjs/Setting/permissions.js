var _permissionList = [];
function pageReady() {
    _permissionList[744] = { uIds: ['delPermission'] };
    _permissionList = checkPermissionUi(_permissionList);
    getPermissionsList();
}

var delList = null;
function getPermissionsList() {
    delList = new Array();
    $("#permissionsList").empty();
    ajaxGet("/Account/Permissions", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var op = function (data, type, row) {
                return '<input type="checkbox" value="{0},{1}" name="chkItem" class="icb_minimal" onclick="">'.format(data.id, data.name);
            }
            var order = function (a, b, c,d) {
                return ++d.row;
            }
            var per744 = _permissionList[744].have;
            var columns = per744
                ? [
                    { "data": null, "title": "请选择", "render": op, "orderable": false },
                    { "data": null, "title": "序号", "render": order },
                    { "data": "name", "title": "Name" },
                    { "data": "isPage", "title": "IsPage" },
                    { "data": "type", "title": "Type" },
                    { "data": "label", "title": "Label" }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "name", "title": "Name" },
                    { "data": "isPage", "title": "IsPage" },
                    { "data": "type", "title": "Type" },
                    { "data": "label", "title": "Label" }
                ];
            $("#permissionsList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aaSorting": [[per744 ? 1 : 0, "asc"]],
                    "aLengthMenu": [15, 30, 60], //更改显示记录数选项  
                    "iDisplayLength": 15, //默认显示的记录数
                    "columns": columns,
                    "drawCallback": function () {
                        $("#permissionsList .icb_minimal").iCheck({
                            handle: 'checkbox',
                            checkboxClass: 'icheckbox_minimal-red',
                            radioClass: 'iradio_minimal-red',
                            increaseArea: '20%' // optional
                        });
                        $("#permissionsList .icb_minimal").on('ifChanged',
                            function (event) {
                                var ui = $(this);
                                var v = ui.attr("value");
                                if (ui.is(":checked")) {
                                    delList.push(v);
                                } else {
                                    if (ui.parents("tr:first").hasClass("odd"));
                                    delList.splice(delList.indexOf(v), 1);
                                }
                            });
                    }
                });
        });
}

function delPermission() {
    var list = delList.join();
    var newList = list.split(",");
    var listId = [], listName = [];
    for (var i = 0; i < newList.length; i++) {
        i % 2 == 0 ? listId.push(newList[i]) : listName.push(newList[i].trim());
    }
    var delId = listId.join(",");
    var delName = listName.join("<br>");
    var doSth = function () {
        var data = {}
        data.permission = delId;
        ajaxPost("/Account/DeletePermission", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getPermissionsList();
                }
            });
    }
    isStrEmptyOrUndefined(delId) ? layer.msg('请选择要删除的数据') : showConfirm(`删除以下权限:<pre style='color:red'>${delName}</pre>`, doSth);
}