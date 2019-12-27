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
PermissionTypes[8] = { id: -10, name: "设备点检" };
PermissionTypes[9] = { id: -11, name: "计划管理" };
PermissionTypes[10] = { id: -12, name: "物料管理" };

//2 组织管理；3 设备管理；4 流程卡管理；5 工艺管理；6 维修管理 7 数据统计 8 设备点检 9 计划管理 10 物料管理
var PermissionTypesOrder = [];
PermissionTypesOrder[2] = 1;
PermissionTypesOrder[3] = 2;
PermissionTypesOrder[4] = 4;
PermissionTypesOrder[5] = 5;
PermissionTypesOrder[6] = 8;
PermissionTypesOrder[7] = 9;
PermissionTypesOrder[8] = 3;
PermissionTypesOrder[9] = 6;
PermissionTypesOrder[10] = 7;

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
    SpotCheck: 3,
    // 物料图片
    Material: 4,
}

//文件Accept
var fileAccept = [];
//文件扩展名
var fileExt = [];
//文件上传回调
var fileCallBack = [];

fileAccept[fileEnum.Default] = [];
fileExt[fileEnum.Default] = [];

// 固件
fileAccept[fileEnum.FirmwareLibrary] = ".bin";
fileExt[fileEnum.FirmwareLibrary] = ["bin"];
fileCallBack[fileEnum.FirmwareLibrary] = function () { };

// 应用层
fileAccept[fileEnum.ApplicationLibrary] = "";
fileExt[fileEnum.ApplicationLibrary] = [];
fileCallBack[fileEnum.ApplicationLibrary] = function () { };

// 点检图片
fileAccept[fileEnum.SpotCheck] = "image/*";
fileExt[fileEnum.SpotCheck] = ["bmp", "jpg", "jpeg", "png", "gif"];
fileCallBack[fileEnum.SpotCheck] = function () { };

// 物料图片
fileAccept[fileEnum.Material] = "image/*";
fileExt[fileEnum.Material] = ["bmp", "jpg", "jpeg", "png", "gif"];
fileCallBack[fileEnum.Material] = function () { };
