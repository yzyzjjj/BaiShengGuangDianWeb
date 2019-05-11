const_loginurl = "/Account/Login";
const_indexurl = "/Home";
var hubConnection = null;

var tdShowLength = 20;
var oLanguage = {
    "sLengthMenu": "每页显示 _MENU_ 条记录",
    "sZeroRecords": "对不起，查询不到任何相关数据",
    "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_条记录",
    "sInfoEmtpy": "找不到相关数据",
    "sInfoFiltered": "数据表中共为 _MAX_ 条记录)",
    "sProcessing": "正在加载中...",
    "sSearch": "搜索",
    "oPaginate": {
        "sFirst": "第一页",
        "sPrevious": " 上一页 ",
        "sNext": " 下一页 ",
        "sLast": " 最后一页 "
    }
}

var chatEnum = {
    Default: 0,
    //连接
    Connect: 1,
    // 故障设备
    FaultDevice: 2
}

var maxProcessData = 8;
var lastLocation = "lastLocation";