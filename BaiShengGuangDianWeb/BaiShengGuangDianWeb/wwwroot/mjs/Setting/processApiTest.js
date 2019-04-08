
//工艺数据
function GetProcessDataByProcessNumber() {
    var data = {}
    data.opType = 300
    data.opData = JSON.stringify({
        id: "wh"
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetProcessDataById() {
    var data = {}
    data.opType = 301
    data.opData = JSON.stringify({
        id: 1
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function PutProcessData() {
    var data = {}
    data.opType = 302
    data.opData = JSON.stringify({
        id: 4,
        //工艺编号(自增Id)
        ProcessManagementId: 1,
        //工艺步骤  
        ProcessOrder: 1,
        //压力时间-分
        PressurizeMinute: 1,
        //压力时间-秒，取值范围0-59
        PressurizeSecond: 1,
        //压力
        Pressure: 1,
        //工序旋转速度时间-分
        ProcessMinute: 1,
        //工序旋转速度时间-秒，取值范围0-59
        ProcessSecond: 1,
        //旋转速度
        Speed: 1
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function PostProcessData() {
    var data = {}
    data.opType = 303
    data.opData = JSON.stringify({
        //工艺编号(自增Id)
        ProcessManagementId: 1,
        //工艺步骤  
        ProcessOrder: 1,
        //压力时间-分
        PressurizeMinute: 1,
        //压力时间-秒，取值范围0-59
        PressurizeSecond: 1,
        //压力
        Pressure: 1,
        //工序旋转速度时间-分
        ProcessMinute: 1,
        //工序旋转速度时间-秒，取值范围0-59
        ProcessSecond: 1,
        //旋转速度
        Speed: 1
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function PostProcessDatas() {
    var data = {}
    data.opType = 304
    data.opData = JSON.stringify([{
        //工艺编号(自增Id)
        ProcessManagementId: 1,
        //工艺步骤  
        ProcessOrder: 1,
        //压力时间-分
        PressurizeMinute: 1,
        //压力时间-秒，取值范围0-59
        PressurizeSecond: 1,
        //压力
        Pressure: 1,
        //工序旋转速度时间-分
        ProcessMinute: 1,
        //工序旋转速度时间-秒，取值范围0-59
        ProcessSecond: 1,
        //旋转速度
        Speed: 1
    }, {
        //工艺编号(自增Id)
        ProcessManagementId: 1,
        //工艺步骤  
        ProcessOrder: 1,
        //压力时间-分
        PressurizeMinute: 1,
        //压力时间-秒，取值范围0-59
        PressurizeSecond: 1,
        //压力
        Pressure: 1,
        //工序旋转速度时间-分
        ProcessMinute: 1,
        //工序旋转速度时间-秒，取值范围0-59
        ProcessSecond: 1,
        //旋转速度
        Speed: 1
    }])
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function DeleteProcessDataByProcessNumber() {
    var data = {}
    data.opType = 305
    data.opData = JSON.stringify({
        //工艺编号
        id: "wh"
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function DeleteProcessDataById() {
    var data = {}
    data.opType = 306
    data.opData = JSON.stringify({
        id: 4
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}

//工艺编号
function GetProcessManagementOrderProcessNumber() {
    var data = {}
    data.opType = 307
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetProcessManagementOrderProductionProcessName() {
    var data = {}
    data.opType = 308
    data.opData = JSON.stringify({
        //0是所有 计划号的ID
        id: 0
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetProcessManagementOrderModelName() {
    var data = {}
    data.opType = 309
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetProcessManagementOrderCode() {
    var data = {}
    data.opType = 310
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetProcessManagementById() {
    var data = {}
    data.opType = 311
    data.opData = JSON.stringify({
        id: 1
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetProcessManagementByProcessNumber() {
    var data = {}
    data.opType = 312
    data.opData = JSON.stringify({
        id: "wh"
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}

function PutProcessManagementById() {
    var data = {}
    data.opType = 313
    data.opData = JSON.stringify({
        id: 4,
        // 工艺编号 名称
        ProcessNumber: "wh",
        // 适用设备型号（自增Id, 英文逗号隔开）
        DeviceModels: "wh",
        // 适用产品型号（计划号）（自增Id, 英文逗号隔开）
        ProductModels: "wh",
        // 适用机台号（自增Id, 英文逗号隔开）
        DeviceIds: "wh"
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function PutProcessManagementByProcessNumber() {
    var data = {}
    data.opType = 314
    data.opData = JSON.stringify({
        id: 4,
        // 工艺编号 名称
        ProcessNumber: "wh",
        // 适用设备型号（自增Id, 英文逗号隔开）
        DeviceModels: "wh",
        // 适用产品型号（计划号）（自增Id, 英文逗号隔开）
        ProductModels: "wh",
        // 适用机台号（自增Id, 英文逗号隔开）
        DeviceIds: "wh"
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}

function PutProcessManagementDeviceId() {
    var data = {}
    data.opType = 315
    data.opData = JSON.stringify([{
        // 工艺编号Id
        Id: 1,
        // 待添加机台号（自增Id）
        DeviceIds: "4"
    }, {
        // 工艺编号Id
        Id: 2,
        // 待添加机台号（自增Id）
        DeviceIds: "4"
    }])
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}

function PostProcessManagement() {
    var data = {}
    data.opType = 316
    data.opData = JSON.stringify({
        // 工艺编号 名称
        ProcessNumber: "wh2",
        // 适用设备型号（自增Id, 英文逗号隔开）
        DeviceModels: "1,2",
        // 适用产品型号（计划号）（自增Id, 英文逗号隔开）
        ProductModels: "1,2",
        // 适用机台号（自增Id, 英文逗号隔开）
        DeviceIds: "3"
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}

function DeleteProcessManagementById() {
    var data = {}
    data.opType = 317
    data.opData = JSON.stringify({
        //工艺编号
        id: 3
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function DeleteProcessManagementByProcessNumber() {
    var data = {}
    data.opType = 318
    data.opData = JSON.stringify({
        id: "wh"
    })
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
 