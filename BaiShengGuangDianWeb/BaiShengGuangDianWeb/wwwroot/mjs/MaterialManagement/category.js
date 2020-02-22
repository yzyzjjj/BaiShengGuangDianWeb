function pageReady() {
    getCategoryList();
}

//获取类别信息
function getCategoryList() {
    var opType = 816;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    _categoryIdData = [];
    _categoryNameData = [];
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var isEnable = function (data) {
            return `<input type="checkbox" class="icb_minimal isEnable" value=${data}>`;
        }
        var number = 0;
        var order = function () {
            return ++number;
        }
        var category = function (data) {
            return `<span class="textOn categoryOld">${data}</span><input type="text" class="form-control text-center textIn category hidden" maxlength="20" style="width:120px" value=${data}>`;
        }
        var remark = function (data) {
            return (data.length > tdShowLength
                    ? `<span title = "${data}" class="textOn" onclick = "showAllContent('${escape(data)}')">${data.substring(0, tdShowLength)}...</span>`
                    : `<span title = "${data}" class="textOn">${data}</span>`)
                + `<textarea class="form-control textIn remark hidden" maxlength = "500" style = "resize: vertical;width:250px;margin:auto"></textarea>`;
        }
        $("#categoryList")
            .DataTable({
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": { "url": "/content/datatables_language.json" },
                "data": rData,
                "aaSorting": [[1, "asc"]],
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数
                "columns": [
                    { "data": "Id", "title": "选择", "render": isEnable },
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Category", "title": "类别", "render": category },
                    { "data": "Remark", "title": "备注", "render": remark }
                ],
                "columnDefs": [
                    { "orderable": false, "targets": 0 }
                ],
                "drawCallback": function (settings, json) {
                    $(this).find('.icb_minimal').iCheck({
                        labelHover: false,
                        cursor: true,
                        checkboxClass: 'icheckbox_minimal-blue',
                        radioClass: 'iradio_minimal-blue',
                        increaseArea: '20%'
                    });
                    $('#categoryList .isEnable').on('ifChanged', function () {
                        var tr = $(this).parents('tr');
                        var id = $(this).val();
                        var name = tr.find('.categoryOld').text();
                        if ($(this).is(':checked')) {
                            _categoryIdData.push(id);
                            _categoryNameData.push(name);
                            tr.find('.textIn').removeClass('hidden').siblings('.textOn').addClass('hidden');
                            var textOn = tr.find('.textOn');
                            var categoryName = textOn.eq(0).text();
                            var remarkName = textOn.eq(1).attr("title");
                            tr.find('.category').val(categoryName);
                            tr.find('.remark').val(remarkName);
                        } else {
                            _categoryIdData.splice(_categoryIdData.indexOf(id), 1);
                            _categoryNameData.splice(_categoryNameData.indexOf(name), 1);
                            tr.find('.textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
                        }
                    });
                }
            });
    });
}

//保存类别信息
function updateCategory() {
    var opType = 817;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var trs = $('#categoryList tbody').find('tr');
    var categoryData = [];
    var i = 0, len = trs.length;
    for (; i < len; i++) {
        var tr = trs.eq(i);
        var isEnable = tr.find('.isEnable');
        if (isEnable.is(':checked')) {
            var id = isEnable.val();
            var category = tr.find('.category').val().trim();
            if (isStrEmptyOrUndefined(category)) {
                layer.msg("类别不能为空");
                return;
            }
            var remark = tr.find('.remark').val().trim();
            categoryData.push({
                Category: category,
                Remark: remark,
                Id: id
            });
        }
    }
    if (!categoryData.length) {
        layer.msg("请选择要保存的数据");
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(categoryData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getCategoryList();
                }
            });
    }
    showConfirm("保存", doSth);
}

//添加货品类别模态框
function addCategoryModal() {
    $('#addCategory').val('');
    $('#addRemark').val('');
    $('#addCategoryModal').modal('show');
}

//添加货品类别信息
function addCategory() {
    var opType = 818;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var category = $('#addCategory').val().trim();
    if (isStrEmptyOrUndefined(category)) {
        layer.msg("新类别不能为空");
        return;
    }
    var remark = $('#addRemark').val().trim();
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            Category: category,
            Remark: remark
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                $("#addCategoryModal").modal("hide");
                if (ret.errno == 0) {
                    getCategoryList();
                }
            });
    }
    showConfirm("添加", doSth);
}

var _categoryIdData = [];
var _categoryNameData = [];
//删除货品类别
function delCategory() {
    var opType = 819;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    if (!_categoryIdData.length) {
        layer.msg("请选择要删除的货品类别");
        return;
    }
    var name = _categoryNameData.join('<br>');
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            ids: _categoryIdData
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getCategoryList();
                }
            });
    }
    showConfirm(`删除以下货品类别：<pre style="color:red">${name}</pre>`, doSth);
}