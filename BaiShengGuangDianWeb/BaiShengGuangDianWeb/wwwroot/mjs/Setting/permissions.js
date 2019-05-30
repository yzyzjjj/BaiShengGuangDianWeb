function pageReady() {
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

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var opType = 81;
            if (!checkPermission(opType)) {
                $("#delPermission").addClass("hidden");
                $("#permissionsList")
                    .DataTable({
                        "destroy": true,
                        "paging": true,
                        "searching": true,
                        "language": { "url": "/content/datatables_language.json" },
                        "data": ret.datas,
                        "aaSorting": [[0, "asc"]],
                        "aLengthMenu": [15, 30, 60], //更改显示记录数选项  
                        "iDisplayLength": 15, //默认显示的记录数
                        "columns": [
                            { "data": null, "title": "序号", "render": order },
                            { "data": "name", "title": "Name" },
                            { "data": "isPage", "title": "IsPage" },
                            { "data": "type", "title": "Type" },
                            { "data": "label", "title": "Label" }
                        ],
                        "drawCallback": function() {
                            $("#permissionsList .icb_minimal").iCheck({
                                handle: 'checkbox',
                                checkboxClass: 'icheckbox_minimal-red',
                                radioClass: 'iradio_minimal-red',
                                increaseArea: '20%' // optional
                            });
                            $("#permissionsList .icb_minimal").on('ifChanged',
                                function(event) {
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
            } else {
                $("#permissionsList")
                    .DataTable({
                        "destroy": true,
                        "paging": true,
                        "searching": true,
                        "language": { "url": "/content/datatables_language.json" },
                        "data": ret.datas,
                        "aaSorting": [[1, "asc"]],
                        "aLengthMenu": [15, 30, 60], //更改显示记录数选项  
                        "iDisplayLength": 15, //默认显示的记录数
                        "columns": [
                            { "data": null, "title": "请选择", "render": op },
                            { "data": null, "title": "序号", "render": order },
                            { "data": "name", "title": "Name" },
                            { "data": "isPage", "title": "IsPage" },
                            { "data": "type", "title": "Type" },
                            { "data": "label", "title": "Label" }
                        ],
                        //关闭第一列排序功能
                        "columnDefs": [
                            { "orderable": false, "targets": 0 }
                        ],
                        "drawCallback": function () {
                            $("#permissionsList .icb_minimal").iCheck({
                                handle: 'checkbox',
                                checkboxClass: 'icheckbox_minimal-red',
                                radioClass: 'iradio_minimal-red',
                                increaseArea: '20%' // optional
                            });
                            $("#permissionsList .icb_minimal").on('ifChanged', function (event) {
                                var ui = $(this);
                                var v = ui.attr("value");
                                if (ui.is(":checked")) {
                                    delList.push(v);
                                }
                                else {
                                    if (ui.parents("tr:first").hasClass("odd"));
                                    delList.splice(delList.indexOf(v), 1);
                                }
                            });
                        }
                    });
            }
        });
}

function delPermission() {
    //数组转化成字符串
    var list = delList.join();
    //分割以","为界的字符串组成新的数组
    var newList = list.split(",");
    //定义两个新数组
    var listId = [], listName = [], newList;
    //根据数组ID下标奇偶数组成新的数组(delId偶数数组,delName奇数数组)
    for (var i = 0; i < newList.length; i++) {
        if (i % 2 == 0) {
            //向空数组添加新的元素
            listId.push(newList[i]);
        } else {
            listName.push(newList[i]);
        }
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

    if (isStrEmptyOrUndefined(delId)) {
        layer.msg('请选择要删除的数据');
    } else {
        showConfirm("删除以下权限:" + "<pre style='color:red'>" + delName + "</pre>", doSth);
    }
}