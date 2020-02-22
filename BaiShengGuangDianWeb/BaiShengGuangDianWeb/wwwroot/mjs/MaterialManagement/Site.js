function pageReady() {
    getCargoSiteList();
}

//获取位置信息
function getCargoSiteList() {
    var opType = 847;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    _siteIdData = [];
    _siteNameData = [];
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function(ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var isEnable = function(data) {
            return `<input type="checkbox" class="icb_minimal isEnable" value=${data}>`;
        }
        var site = function(data) {
            return `<span class="textOn siteOld">${data}</span><input type="text" class="form-control text-center textIn site hidden" maxlength="20" style="width:120px" value=${data}>`;
        }
        var remark = function (data) {
            return (data.length > tdShowLength
                    ? `<span title = "${data}" class="textOn" onclick = "showAllContent('${escape(data)}')">${data.substring(0, tdShowLength)}...</span>`
                    : `<span title = "${data}" class="textOn">${data}</span>`)
                + `<textarea class="form-control textIn remark hidden" maxlength = "500" style = "resize: vertical;width:250px;margin:auto"></textarea>`;
        }
        var number = 0;
        var order = function() {
            return ++number;
        }
        $("#cargoSiteList")
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
                    { "data": "Site", "title": "位置", "render": site },
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
                    $('#cargoSiteList .isEnable').on('ifChanged', function () {
                        var tr = $(this).parents('tr');
                        var id = $(this).val();
                        var name = tr.find('.siteOld').text();
                        if ($(this).is(':checked')) {
                            _siteIdData.push(id);
                            _siteNameData.push(name);
                            tr.find('.textIn').removeClass('hidden').siblings('.textOn').addClass('hidden');
                            var textOn = tr.find('.textOn');
                            var siteName = textOn.eq(0).text();
                            var remarkName = textOn.eq(1).attr("title");
                            tr.find('.site').val(siteName);
                            tr.find('.remark').val(remarkName);
                        } else {
                            _siteIdData.splice(_siteIdData.indexOf(id), 1);
                            _siteNameData.splice(_siteNameData.indexOf(name), 1);
                            tr.find('.textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
                        }
                    });
                }
            });
    });
}

//保存位置信息
function updateSite() {
    var opType = 848;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var trs = $('#cargoSiteList tbody').find('tr');
    var siteData = [];
    var i = 0, len = trs.length;
    for (; i < len; i++) {
        var tr = trs.eq(i);
        var isEnable = tr.find('.isEnable');
        if (isEnable.is(':checked')) {
            var id = isEnable.val();
            var site = tr.find('.site').val().trim();
            if (isStrEmptyOrUndefined(site)) {
                layer.msg("位置不能为空");
                return;
            }
            var remark = tr.find('.remark').val().trim();
            siteData.push({
                Site: site,
                Remark: remark,
                Id: id
            });
        }
    }
    if (!siteData.length) {
        layer.msg("请选择要保存的数据");
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(siteData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getCargoSiteList();
                }
            });
    }
    showConfirm("保存", doSth);
}

//添加货品位置模态框
function addSiteModal() {
    $('#addSite').val('');
    $('#addRemark').val('');
    $('#addSiteModal').modal('show');
}

//添加货品位置信息
function addSite() {
    var opType = 849;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var site = $('#addSite').val().trim();
    if (isStrEmptyOrUndefined(site)) {
        layer.msg("新位置不能为空");
        return;
    }
    var remark = $('#addRemark').val().trim();
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            Site: site,
            Remark: remark
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                $("#addSiteModal").modal("hide");
                if (ret.errno == 0) {
                    getCargoSiteList();
                }
            });
    }
    showConfirm("添加", doSth);
}

var _siteIdData = [];
var _siteNameData = [];
//删除货品位置
function delSite() {
    var opType = 850;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    if (!_siteIdData.length) {
        layer.msg("请选择要删除的货品位置");
        return;
    }
    var name = _siteNameData.join('<br>');
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            ids: _siteIdData
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getCargoSiteList();
                }
            });
    }
    showConfirm(`删除以下货品位置：<pre style="color:red">${name}</pre>`, doSth);
}