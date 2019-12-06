var loginUrl = "/Account/Login";
var indexUrl = "/Home";
var hubConnection = null;

var maxProcessData = 8;
var lastLocation = "lastLocation";
var tdShowLength = 20;
var tdShowContentLength = 10;
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

var PermissionPages = [{ id: -1, name: "网页", isPage: true }, { id: -2, name: "接口", isPage: false }];
var PermissionTypes = [];
PermissionTypes[0] = {};
PermissionTypes[1] = { id: -3, name: "页面管理" };
PermissionTypes[2] = { id: -4, name: "组织管理" };
PermissionTypes[3] = { id: -5, name: "设备管理" };
PermissionTypes[4] = { id: -6, name: "流程卡管理" };
PermissionTypes[5] = { id: -7, name: "工艺管理" };
PermissionTypes[6] = { id: -8, name: "维修管理" };
PermissionTypes[7] = { id: -9, name: "数据统计" };

var chatEnum = {
    Default: 0,
    //连接
    Connect: 1,
    // 故障设备
    FaultDevice: 2,
    // 登出
    Logout: 3
}

var fileEnum = {
    Default: 0,
    // 固件
    FirmwareLibrary: 1,
    // 应用层
    ApplicationLibrary: 2,
    // 点检图片
    SpotCheckImage: 3,
}

//文件Accept
var fileAccept = [];
fileAccept[fileEnum.Default] = [];
// 固件
fileAccept[fileEnum.FirmwareLibrary] = ".bin";
// 应用层
fileAccept[fileEnum.ApplicationLibrary] = "";
// 点检图片
fileAccept[fileEnum.SpotCheckImage] = "image/*";

//文件扩展名
var fileExt = [];
fileExt[fileEnum.Default] = [];
// 固件
fileExt[fileEnum.FirmwareLibrary] = ["bin"];
// 应用层
fileExt[fileEnum.ApplicationLibrary] = [];
// 点检图片
fileExt[fileEnum.SpotCheckImage] = ["bmp", "jpg", "jpeg", "png","gif"];

//文件上传回调
var fileCallBack = [];
fileCallBack[fileEnum.Default] = function () { };
// 固件
fileCallBack[fileEnum.FirmwareLibrary] = function () { };
// 应用层
fileCallBack[fileEnum.ApplicationLibrary] = function () { };
// 点检图片
fileCallBack[fileEnum.SpotCheckImage] = function () { };