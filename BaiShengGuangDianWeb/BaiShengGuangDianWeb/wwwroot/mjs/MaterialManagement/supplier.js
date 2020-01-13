function pageReady() {
    $('.ms2').select2();
    //categorySelect();
    //nameSelect();
    //getSupplierList();

    var one = new Promise(function (resolve, reject) {
        categorySelect();
        resolve('one');
        console.log('one');
    });
    var two = new Promise(function (resolve, reject) {
        nameSelect();
        resolve('two');
        console.log('two');
    });
    Promise.all([one, two])
        .then((result) => {
            console.log('准备工作完毕');
            getSupplierList();
            console.log(result);
        });
}

var _categorySelect = null;
//类别选项
function categorySelect() {
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
        $('#categorySelect').append(option.format(0, '所有类别'));
        $('#categorySelect').append(options);
        _categorySelect = `<select class="form-control textIn category hidden">${options}</select>`;
    });
}

var _nameSelect = null;
//名称选项
function nameSelect() {
    var opType = 824;
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
        $('#nameSelect').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Name);
        }
        $('#nameSelect').append(option.format(0, '所有名称'));
        $('#nameSelect').append(options);
        _nameSelect = `<select class="form-control textIn name hidden">${options}</select>`;
    });
}

//获取供应商信息
function getSupplierList() {
    var opType = 831;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var list = {};
    var categoryId = $('#categorySelect').val();
    if (isStrEmptyOrUndefined(categoryId)) {
        layer.msg('请选择货品类别');
        return;
    }
    if (categoryId != 0) {
        list.categoryId = categoryId;
    }
    var nameId = $('#nameSelect').val();
    if (isStrEmptyOrUndefined(nameId)) {
        layer.msg('请选择货品名称');
        return;
    }
    if (nameId != 0) {
        list.nameId = nameId;
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
        var category = function (data) {
            return `<span class="textOn" id=${data.CategoryId}>${data.Category}</span>${_categorySelect}`;
        }
        var name = function (data) {
            return `<span class="textOn" id=${data.NameId}>${data.Name}</span>${_nameSelect}`;
        }
        var supplier = function (data) {
            return `<span class="textOn supplierOld">${data}</span><input type="text" class="form-control text-center textIn supplier hidden" maxlength="20" value=${data}>`;
        }
        var remark = function (data) {
            return `<span class="textOn">${data}</span><textarea class="form-control textIn remark hidden" maxlength="500" style="resize: vertical">${data}</textarea>`;
        }
        $("#supplierList")
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
                    { "data": null, "title": "类别", "render": category },
                    { "data": null, "title": "名称", "render": name },
                    { "data": "Supplier", "title": "供应商", "render": supplier },
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
                    $(this).find('td').css("verticalAlign", "middle");
                    $('#supplierList .isEnable').on('ifChanged', function () {
                        var tr = $(this).parents('tr');
                        //var id = $(this).val();
                        //var n = tr.find('.nameOld').text();
                        if ($(this).is(':checked')) {
                            //_nameIdData.push(id);
                            //_nameNameData.push(n);
                            tr.find('.textIn').removeClass('hidden').siblings('.textOn').addClass('hidden');
                            var textOn = tr.find('.textOn');
                            var categoryName = textOn.eq(0).attr('id');
                            var nameName = textOn.eq(1).attr('id');
                            var supplierName = textOn.eq(2).text();
                            var remarkName = textOn.eq(3).text();
                            tr.find('.category').val(categoryName);
                            tr.find('.name').val(nameName);
                            tr.find('.supplier').val(supplierName);
                            tr.find('.remark').val(remarkName);
                        } else {
                            //_nameIdData.splice(_nameIdData.indexOf(id), 1);
                            //_nameNameData.splice(_nameNameData.indexOf(n), 1);
                            tr.find('.textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
                        }
                    });
                }
            });
    });
}