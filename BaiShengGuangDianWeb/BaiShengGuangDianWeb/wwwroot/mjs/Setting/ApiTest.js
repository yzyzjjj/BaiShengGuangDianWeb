function pageReady() {
}

//设备管理





//设备型号库
function GetDeviceModel() {
    var data = {}
    data.opType = 120
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetSingleDeviceModel() {
    var data = {}
    data.opType = 121
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
function UpdateDeviceModel() {
    var data = {}
    data.opType = 122
    data.opData = JSON.stringify({
        id: 3,
        //设备类型
        DeviceCategoryId: 1,
        //设备型号
        ModelName: "测试",
        //描述
        Description: "测试",
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
function AddDeviceModel() {
    var data = {}
    data.opType = 123
    data.opData = JSON.stringify({
        //设备类型
        DeviceCategoryId: 1,
        //设备型号
        ModelName: "测试",
        //描述
        Description: "测试",
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
function DeleteDeviceModel() {
    var data = {}
    data.opType = 124
    data.opData = JSON.stringify({
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

//场地库
function GetSite() {
    var data = {}
    data.opType = 125
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetSingleSite() {
    var data = {}
    data.opType = 126
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
function UpdateSite() {
    var data = {}
    data.opType = 127
    data.opData = JSON.stringify({
        id: 5,
        //场地名
        SiteName: "测试",
        //具体位置
        RegionDescription: "测试",
        //管理人
        Manager: "测试",
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
function AddSite() {
    var data = {}
    data.opType = 128
    data.opData = JSON.stringify({
        //场地名
        SiteName: "测试",
        //具体位置
        RegionDescription: "测试",
        //管理人
        Manager: "测试",
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
function DeleteSite() {
    var data = {}
    data.opType = 129
    data.opData = JSON.stringify({
        id: 5
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

//固件库
function GetFirmwareLibrary() {
    var data = {}
    data.opType = 130
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetSingleFirmwareLibrary() {
    var data = {}
    data.opType = 131
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
function UpdateFirmwareLibrary() {
    var data = {}
    data.opType = 132
    data.opData = JSON.stringify({
        id: 3,
        //固件版本名称
        FirmwareName: "测试",
        //变量数量
        VarNumber: 1,
        //通信协议
        CommunicationProtocol: "测试",
        //程序文件的位置及名称
        FilePath: "测试",
        //描述
        Description: "测试",
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
function AddFirmwareLibrary() {
    var data = {}
    data.opType = 133
    data.opData = JSON.stringify({
        //固件版本名称
        FirmwareName: "测试1",
        //变量数量
        VarNumber: 0,
        //通信协议
        CommunicationProtocol: "测试",
        //程序文件的位置及名称
        FilePath: "测试",
        //描述
        Description: "测试",
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
function DeleteFirmwareLibrary() {
    var data = {}
    data.opType = 134
    data.opData = JSON.stringify({
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

//硬件库
function GetHardwareLibrary() {
    var data = {}
    data.opType = 135
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetSingleHardwareLibrary() {
    var data = {}
    data.opType = 136
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
function UpdateHardwareLibrary() {
    var data = {}
    data.opType = 137
    data.opData = JSON.stringify({
        id: 3,
        //硬件版本名称
        HardwareName: "测试",
        //输入口数量
        InputNumber: 1,
        //输出口数量
        OutputNumber: 1,
        //数模转换数量
        DacNumber: 1,
        //模数转换数量
        AdcNumber: 1,
        //主轴数量
        AxisNumber: 1,
        //通用串口数量
        ComNumber: 1,
        //描述
        Description: "测试",
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
function AddHardwareLibrary() {
    var data = {}
    data.opType = 138
    data.opData = JSON.stringify({
        //硬件版本名称
        HardwareName: "测试1",
        //输入口数量
        InputNumber: 0,
        //输出口数量
        OutputNumber: 0,
        //数模转换数量
        DacNumber: 0,
        //模数转换数量
        AdcNumber: 0,
        //主轴数量
        AxisNumber: 0,
        //通用串口数量
        ComNumber: 0,
        //描述
        Description: "测试1",
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
function DeleteHardwareLibrary() {
    var data = {}
    data.opType = 139
    data.opData = JSON.stringify({
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

//设备类型
function GetDeviceCategory() {
    var data = {}
    data.opType = 140
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetSingleDeviceCategory() {
    var data = {}
    data.opType = 141
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
function UpdateDeviceCategory() {
    var data = {}
    data.opType = 142
    data.opData = JSON.stringify({
        id: 5,
        //更新后类型名
        CategoryName: "测试",
        //更新后描述
        Description: "测试",
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
function AddDeviceCategory() {
    var data = {}
    data.opType = 143
    data.opData = JSON.stringify({
        //类型名
        CategoryName: "测试",
        //描述
        Description: "测试",
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
function DeleteDeviceCategory() {
    var data = {}
    data.opType = 144
    data.opData = JSON.stringify({
        id: 5
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

//流程类型
function GetProcessLibrary() {
    var data = {}
    data.opType = 145
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetSingleProcessLibrary() {
    var data = {}
    data.opType = 146
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
function UpdateProcessLibrary() {
    var data = {}
    data.opType = 147
    data.opData = JSON.stringify({
        id: 3,
        //名称
        ProcessName: "测试",
        //程序文件的位置及名称
        FilePath: "测试",
        //描述
        Description: "测试",
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
function AddProcessLibrary() {
    var data = {}
    data.opType = 148
    data.opData = JSON.stringify({
        //名称
        ProcessName: "测试1",
        //程序文件的位置及名称
        FilePath: "测试1",
        //描述
        Description: "测试1",
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
function DeleteProcessLibrary() {
    var data = {}
    data.opType = 149
    data.opData = JSON.stringify({
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
