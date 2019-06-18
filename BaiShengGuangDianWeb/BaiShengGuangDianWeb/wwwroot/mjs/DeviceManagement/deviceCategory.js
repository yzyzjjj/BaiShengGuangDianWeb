
function pageReady() {
    getCategoryList();
    if (!checkPermission(143)) {
        $("#showAddCategory").addClass("hidden");
    }
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
    var updateLi = '<li><a onclick="showUpdateCategory({0}, \'{1}\', \'{2}\')">修改</a></li>'.format(data.Id, escape(data.CategoryName), escape(data.Description));
    var deleteLi = '<li><a onclick="deleteCategory({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.CategoryName));
    html = html.format(
        checkPermission(142) ? updateLi : "",
        checkPermission(144) ? deleteLi : "");
    return html;
}

function getCategoryList() {
    var opType = 140;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    ajaxPost("/Relay/Post",
        {
            opType: opType
        },
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var columns = checkPermission(142) || checkPermission(144)
                ? [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "CategoryName", "title": "类型名" },
                    { "data": "Description", "title": "描述" },
                    { "data": null, "title": "操作", "render": op }
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "CategoryName", "title": "类型名" },
                    { "data": "Description", "title": "描述" }
                ];
            var rModel = function (data, type, full, meta) {
                full.Description = full.Description ? full.Description : "";
                return full.Description.length > tdShowContentLength
                    ? full.Description.substr(0, tdShowContentLength) +
                    '<a href = \"javascript:showDescriptionModel({0})\">...全部显示</a> '
                        .format(full.Id)
                    : full.Description;
            }
            var defs = checkPermission(142) || checkPermission(144)
                ? [
                    { "orderable": false, "targets": 4 },
                    {
                        "targets": [3],
                        "render": rModel
                    }
                ]
                : [
                    {
                        "targets": [3],
                        "render": rModel
                    }
                ];
            $("#categoryList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "columns": columns,
                    "columnDefs": defs
                });
        });
}

function showDescriptionModel(id) {
    var opType = 140;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        id: id
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            if (ret.datas.length > 0) {
                $("#description").html(ret.datas[0].Description);
            }
            $("#descriptionModel").modal("show");
        });
}

function showAddCategory() {
    hideClassTip('adt');
    $("#addCategoryName").val("");
    $("#addCategoryDesc").val("");
    $("#addModel").modal("show");
}

function addCategory() {
    var opType = 143;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var categoryName = $("#addCategoryName").val().trim();
    var categoryDesc = $("#addCategoryDesc").val();
    if (isStrEmptyOrUndefined(categoryName)) {
        showTip($("#addCategoryNameTip"), "类型名不能为空");
        return;
    }
    var doSth = function () {
        $("#addModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            //类型名称
            CategoryName: categoryName,
            //描述
            Description: categoryDesc,

        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getCategoryList();
                }
            });
    }
    showConfirm("添加", doSth);

}

function deleteCategory(id, categoryName) {
    categoryName = unescape(categoryName);
    var opType = 144;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getCategoryList();
                }
            });
    }
    showConfirm("删除类型：" + categoryName, doSth);
}

function showUpdateCategory(id, categoryName, categoryDesc) {
    categoryName = unescape(categoryName);
    categoryDesc = unescape(categoryDesc);
    hideClassTip('adt');
    $("#updateId").html(id);
    $("#updateCategoryName").val(categoryName);
    $("#updateCategoryDesc").val(categoryDesc);
    $("#updateCategory").modal("show");
}

function updateCategory() {
    var opType = 142;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var id = parseInt($("#updateId").html());

    var categoryName = $("#updateCategoryName").val().trim();
    var categoryDesc = $("#updateCategoryDesc").val();

    if (isStrEmptyOrUndefined(categoryName)) {
        showTip($("#updateCategoryNameTip"), "类型名不能为空");
        return;
    }

    var doSth = function () {
        $("#updateCategory").modal("hide");

        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id,
            //更新后类型名称
            CategoryName: categoryName,
            //更新后描述
            Description: categoryDesc,

        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getCategoryList();
                }
            });
    }
    showConfirm("修改", doSth);

}


