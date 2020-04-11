function pageReady() {
    $('.ms2').select2();
    surveyor();
    $('#categorySelect').on('select2:select', function () {
        getNameList();
    });
}

var _categorySelect = null;
//类别选项
function surveyor() {
    var opType = 816;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#categorySelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Category);
        }
        if (len) {
            $('#categorySelect').append(option.format(0, '所有类别'));
        }
        $('#categorySelect').append(options); 
        $('#addCategorySelect').append(options);
        _categorySelect = `<select class="form-control textIn category hidden" style="width:100px">${options}</select>`;
        getNameList();
    });
}

//获取名称信息
function getNameList() {
    var opType = 824;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    _nameIdData = [];
    _nameNameData = [];
    var list = {};
    var categoryId = $('#categorySelect').val();
    if (isStrEmptyOrUndefined(categoryId)) {
        layer.msg('请选择货品类别');
        return;
    }
    if (categoryId != 0) {
        list.categoryId = categoryId;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
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
            return `<span class="textOn" id=${data.CategoryId}>${data.Category}</span>${_categorySelect}`;
        }
        var name = function (data) {
            return `<span class="textOn nameOld">${data}</span><input type="text" class="form-control text-center textIn name hidden" maxlength="20" style="width:120px" value=${data}>`;
        }
        var remark = function (data) {
            return (data.length > tdShowLength
                    ? `<span title = "${data}" class="textOn" onclick = "showAllContent('${escape(data)}')">${data.substring(0, tdShowLength)}...</span>`
                    : `<span title = "${data}" class="textOn">${data}</span>`)
                + `<textarea class="form-control textIn remark hidden" maxlength = "500" style = "resize: vertical;width:250px;margin:auto"></textarea>`;
        }
        $("#nameList")
            .DataTable({
                dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": oLanguage,
                "data": rData,
                "aaSorting": [[1, "asc"]],
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数
                "columns": [
                    { "data": "Id", "title": "选择", "render": isEnable, "orderable": false},
                    { "data": null, "title": "序号", "render": order },
                    { "data": null, "title": "类别", "render": category },
                    { "data": "Name", "title": "名称", "render": name },
                    { "data": "Remark", "title": "备注", "render": remark }
                ],
                "drawCallback": function (settings, json) {
                    $(this).find('.icb_minimal').iCheck({
                        labelHover: false,
                        cursor: true,
                        checkboxClass: 'icheckbox_minimal-blue',
                        radioClass: 'iradio_minimal-blue',
                        increaseArea: '20%'
                    });
                    $('#nameList .isEnable').on('ifChanged', function () {
                        var tr = $(this).parents('tr');
                        var id = $(this).val();
                        var n = tr.find('.nameOld').text();
                        if ($(this).is(':checked')) {
                            _nameIdData.push(id);
                            _nameNameData.push(n);
                            tr.find('.textIn').removeClass('hidden').siblings('.textOn').addClass('hidden');
                            var textOn = tr.find('.textOn');
                            var categoryName = textOn.eq(0).attr('id');
                            var nameName = textOn.eq(1).text();
                            var remarkName = textOn.eq(2).attr("title");
                            tr.find('.category').val(categoryName);
                            tr.find('.name').val(nameName);
                            tr.find('.remark').val(remarkName);
                        } else {
                            _nameIdData.splice(_nameIdData.indexOf(id), 1);
                            _nameNameData.splice(_nameNameData.indexOf(n), 1);
                            tr.find('.textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
                        }
                    });
                }
            });
    });
}

//保存名称信息
function updateName() {
    var opType = 825;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var trs = $('#nameList tbody').find('tr');
    var nameData = [];
    var i = 0, len = trs.length;
    for (; i < len; i++) {
        var tr = trs.eq(i);
        var isEnable = tr.find('.isEnable');
        if (isEnable.is(':checked')) {
            var id = isEnable.val();
            var category = tr.find('.category').val();
            if (isStrEmptyOrUndefined(category)) {
                layer.msg("请选择货品类别");
                return;
            }
            var nameName = tr.find('.name').val().trim();
            if (isStrEmptyOrUndefined(nameName)) {
                layer.msg("名称不能为空");
                return;
            }
            var remark = tr.find('.remark').val().trim();
            nameData.push({
                CategoryId: category,
                Name: nameName,
                Remark: remark,
                Id: id
            });
        }
    }
    if (!nameData.length) {
        layer.msg("请选择要保存的数据");
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(nameData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getNameList();
                }
            });
    }
    showConfirm("保存", doSth);
}

//添加货品名称模态框
function addNameModal() {
    var id = $('#categorySelect').val();
    if (id == 0) {
        var firstId = $('#addCategorySelect option').eq(0).val();
        $('#addCategorySelect').val(firstId).trigger("change");
    } else {
        $('#addCategorySelect').val(id).trigger("change");
    }
    $('#addName').val('');
    $('#addRemark').val('');
    $('#addNameModal').modal('show');
}

//添加货品名称信息
function addCategory() {
    var opType = 826;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var categoryId = $('#addCategorySelect').val();
    if (isStrEmptyOrUndefined(categoryId)) {
        layer.msg("请选择类别");
        return;
    }
    var nameName = $('#addName').val().trim();
    if (isStrEmptyOrUndefined(nameName)) {
        layer.msg("新名称不能为空");
        return;
    }
    var remark = $('#addRemark').val().trim();
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            CategoryId: categoryId,
            Name: nameName,
            Remark: remark
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                $("#addNameModal").modal("hide");
                if (ret.errno == 0) {
                    var id = $('#categorySelect').val();
                    if (id == 0 || id == categoryId) {
                        getNameList();
                    }
                }
            });
    }
    showConfirm("添加", doSth);
}

var _nameIdData = [];
var _nameNameData = [];
//删除货品名称
function delName() {
    var opType = 827;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    if (!_nameIdData.length) {
        layer.msg("请选择要删除的货品名称");
        return;
    }
    var name = _nameNameData.join('<br>');
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            ids: _nameIdData
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getNameList();
                }
            });
    }
    showConfirm(`删除以下货品名称：<pre style="color:red">${name}</pre>`, doSth);
}