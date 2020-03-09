function pageReady() {
    $('.ms2').select2();
    getScoreList();
}

function getScoreList() {
    var opType = 1003;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost('/Relay/Post', data, function(ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $("#scoreList")
            .DataTable({
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": oLanguage,
                "data": ret.datas,
                "aaSorting": [[0, "asc"]],
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "名次"},
                    { "data": "Plan", "title": "姓名" },
                    { "data": "Remark", "title": "绩效" }
                ]
            });
    });
}