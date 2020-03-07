var loginUrl = "/Account/Login";
var indexUrl = "/Home";
var hubConnection = null;

var maxProcessData = 8;
var lastLocation = "lastLocation";
var tdShowLength = 20;
var tdShowContentLength = 10;

var oLanguage = {
    "sProcessing": "处理中...",
    "sLengthMenu": "显示 _MENU_ 项结果",
    "sZeroRecords": "没有匹配结果",
    "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
    "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
    "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
    "sInfoPostFix": "",
    "sSearch": "搜索:",
    "sUrl": "",
    "sEmptyTable": "表中数据为空",
    "sLoadingRecords": "载入中...",
    "sInfoThousands": ",",
    "oPaginate": {
        "sFirst": "首页",
        "sPrevious": "上页",
        "sNext": "下页",
        "sLast": "末页"
    },
    "oAria": {
        "sSortAscending": ": 以升序排列此列",
        "sSortDescending": ": 以降序排列此列"
    }
}

var PermissionTypes = [
    { name: "页面管理", isPage: true, id: -1 },
    { name: "接口管理", isPage: false, id: -2 }
];
//type : 1 设置；2 系统管理；3 设备管理；4 流程卡管理；5 工艺管理；6 维修管理 7 数据统计 8 设备点检 9 计划管理 10 物料管理 11 6s管理 12 生产管理
var PermissionPageTypes = [
    { name: "工作台", icon: "fa-windows", noChild: true, id: -3 },
    { name: "维修管理", icon: "fa-wrench", noChild: true, type: 6, id: -4 },
    { name: "系统管理", icon: "fa-laptop", type: 2, id: -5 },
    { name: "设备管理", icon: "fa-cubes", type: 3, id: -6 },
    { name: "设备点检", icon: "fa-calendar-check-o", type: 8, id: -7 },
    { name: "流程卡管理", icon: "fa-clone", noChild: true, type: 4, id: -8 },
    { name: "工艺管理", icon: "fa-edit", noChild: true, type: 5, id: -9 },
    { name: "生产管理", icon: " fa-object-group", type: 12, id: -10 },
    { name: "计划管理", icon: "fa-list-alt", noChild: true, type: 9, id: -11 },
    { name: "物料管理", icon: "fa-dropbox", type: 10, id: -12 },
    { name: "6s检查", icon: "fa-calendar-check-o", type: 11, id: -13 },
    { name: "数据统计", icon: "fa-bar-chart", type: 7, id: -14 },
    { name: "设置", icon: "fa-gear", type: 1, id: -15 }
];

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
    // 6s图片
    _6s: 5,
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

// 6s图片
fileAccept[fileEnum._6s] = "image/*";
fileExt[fileEnum._6s] = ["bmp", "jpg", "jpeg", "png", "gif"];
fileCallBack[fileEnum._6s] = function () { };
