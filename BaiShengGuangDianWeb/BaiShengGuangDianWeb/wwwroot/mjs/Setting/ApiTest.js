function pageReady() {
}

//设备管理
function GetDeviceLibrary() {
    var data = {}
    data.opType = 100
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetSingleDeviceLibrary() {
    var data = {}
    data.opType = 101
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
function UpdateDeviceLibrary() {
    var data = {}
    data.opType = 102
    data.opData = JSON.stringify({
        id: 20,
        //机台号
        Code: "测试",
        //设备名
        DeviceName: "测试",
        //设备MAC地址
        MacAddress: "测试",
        //IP
        Ip: "192.168.1.10",
        //端口
        Port: 60000,
        //端口
        Identifier: "测试",
        //设备型号编号
        DeviceModelId: 2,
        //设备固件版本编号
        FirmwareId: 2,
        //设备流程版本编号
        ProcessId: 2,
        //设备硬件版本编号
        HardwareId: 2,
        //设备所在场地编号
        SiteId: 1,
        //设备管理员用户
        AdministratorUser: "测试1",
        //备注
        Remark: "测试1"
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
function AddDeviceLibrary() {
    var data = {}
    data.opType = 103
    data.opData = JSON.stringify({
        //机台号
        Code: "测试1",
        //设备名
        DeviceName: "测试1",
        //设备MAC地址
        MacAddress: "测试1",
        //IP
        Ip: "192.168.1.10",
        //端口
        Port: 60000,
        //端口
        Identifier: "测试1",
        //设备型号编号
        DeviceModelId: 1,
        //设备固件版本编号
        FirmwareId: 1,
        //设备流程版本编号
        ProcessId: 1,
        //设备硬件版本编号
        HardwareId: 1,
        //设备所在场地编号
        SiteId: 1,
        //设备管理员用户
        AdministratorUser: "测试1",
        //备注
        Remark: "测试1"
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
function DeleteDeviceLibrary() {
    var data = {}
    data.opType = 104
    data.opData = JSON.stringify({
        id: 20
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

function GetScriptVersion() {
    var data = {}
    data.opType = 105
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
function GetDataNameDictionary() {
    var data = {}
    data.opType = 106
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

//流程卡
function GetFlowCardLibrary() {
    var data = {}
    data.opType = 200
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetFlowcardLibraryById() {
    var data = {}
    data.opType = 201
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
function GetFlowcardLibraryByFlowCardName() {
    var data = {}
    data.opType = 202
    data.opData = JSON.stringify({
        id: "180407001"
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
function GetFlowcardLibraryByProductionProcessName() {
    var data = {}
    data.opType = 203
    data.opData = JSON.stringify({
        id: "gl888888"
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
function GetFlowcardLibraryByRawMateriaName() {
    var data = {}
    data.opType = 204
    data.opData = JSON.stringify({
        id: "BG66-1048"
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
function GetFlowcardLibraryByProcessorName() {
    var data = {}
    data.opType = 205
    data.opData = JSON.stringify({
        id: "processor"
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
function GetFlowcardLibraryBySurveyorName() {
    var data = {}
    data.opType = 206
    data.opData = JSON.stringify({
        id: "surveyor"
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
function PutFlowcardLibraryById() {
    var data = {}
    data.opType = 207
    data.opData = JSON.stringify({
        id: 3,
        //流程卡号
        FlowCardName: "测试",
        //计划号
        ProductionProcessId: 1,
        //原料批号
        RawMateriaId: 1,
        //原料数量
        RawMaterialQuantity: 1,
        //发片人
        Sender: "测试",
        //入库序号
        InboundNum: "测试",
        //备注
        Remarks: "测试",
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
function PutFlowcardLibraryByFlowCardName() {
    var data = {}
    data.opType = 208
    data.opData = JSON.stringify({
        id: "180407001",
        //流程卡号
        FlowCardName: "180407001",
        //计划号
        ProductionProcessId: 1,
        //原料批号
        RawMateriaId: 1,
        //原料数量
        RawMaterialQuantity: 1,
        //发片人
        Sender: "测试",
        //入库序号
        InboundNum: "测试",
        //备注
        Remarks: "测试",
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
function PostFlowcardLibrary() {
    var data = {}
    data.opType = 209
    data.opData = JSON.stringify({
        //流程卡号
        FlowCardName: "测试1",
        //计划号
        ProductionProcessId: 1,
        //原料批号
        RawMateriaId: 1,
        //原料数量
        RawMaterialQuantity: 1,
        //发片人
        Sender: "测试1",
        //入库序号
        InboundNum: "测试1",
        //备注
        Remarks: "测试1",
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
function PostFlowcardLibraries() {
    var data = {}
    data.opType = 210
    data.opData = JSON.stringify([
        {
            //流程卡号
            FlowCardName: "测试2",
            //计划号
            ProductionProcessId: 1,
            //原料批号
            RawMateriaId: 1,
            //原料数量
            RawMaterialQuantity: 1,
            //发片人
            Sender: "测试2",
            //入库序号
            InboundNum: "测试2",
            //备注
            Remarks: "测试2",
        }, {
            //流程卡号
            FlowCardName: "测试3",
            //计划号
            ProductionProcessId: 1,
            //原料批号
            RawMateriaId: 1,
            //原料数量
            RawMaterialQuantity: 1,
            //发片人
            Sender: "测试3",
            //入库序号
            InboundNum: "测试3",
            //备注
            Remarks: "测试3",
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
function DeleteFlowcardLibraryById() {
    var data = {}
    data.opType = 211
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
function DeleteFlowcardLibraryByFlowCardName() {
    var data = {}
    data.opType = 212
    data.opData = JSON.stringify({
        id: "180407001"
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
function DeleteFlowcardLibraryByProductionProcessName() {
    var data = {}
    data.opType = 213
    data.opData = JSON.stringify({
        id: "gl888888"
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
function DeleteFlowcardLibraryByRawMateriaName() {
    var data = {}
    data.opType = 214
    data.opData = JSON.stringify({
        id: "BG66-1048"
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

//计划号
function GetProductionProcessLibrary() {
    var data = {}
    data.opType = 215
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetProductionProcessLibraryById() {
    var data = {}
    data.opType = 216
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
function GetProductionProcessLibraryByProductionProcessName() {
    var data = {}
    data.opType = 217
    data.opData = JSON.stringify({
        id: "gl888888"
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
function PutProductionProcessLibraryById() {
    var data = {}
    data.opType = 218
    data.opData = JSON.stringify({
        id: 4,
        //计划号
        ProductionProcessName: "测试",
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
function PutProductionProcessLibraryByProductionProcessName() {
    var data = {}
    data.opType = 219
    data.opData = JSON.stringify({
        id: "测试1",
        //计划号
        ProductionProcessName: "测试",
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
function PostProductionProcessLibrary() {
    var data = {}
    data.opType = 220
    data.opData = JSON.stringify({
        //计划号
        ProductionProcessName: "测试",
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
function DeleteProductionProcessLibraryById() {
    var data = {}
    data.opType = 221
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
function DeleteProductionProcessLibraryByProductionProcessName() {
    var data = {}
    data.opType = 222
    data.opData = JSON.stringify({
        id: "测试1",
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

//工序
function GetProcessStepByProductionProcessName() {
    var data = {}
    data.opType = 223
    data.opData = JSON.stringify({
        id: "gl888888"
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
function GetProcessStepByProcessorName() {
    var data = {}
    data.opType = 224
    data.opData = JSON.stringify({
        id: "processor"
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
function GetProcessStepBySurveyorName() {
    var data = {}
    data.opType = 225
    data.opData = JSON.stringify({
        id: "surveyor"
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
function GetProcessStepByCode() {
    var data = {}
    data.opType = 226
    data.opData = JSON.stringify({
        id: "1号机"
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
function PutProcessStepById() {
    var data = {}
    data.opType = 227
    data.opData = JSON.stringify({
        id: 6,
        //计划号(自增Id)
        ProductionProcessId: 1,
        //工艺顺序
        ProcessStepOrder: 1,
        //工序名称
        ProcessStepName: "测试",
        //工艺加工要求
        ProcessStepRequirements: "测试",
        //加工人ID（自增id）  为0不指定加工人
        ProcessorId: 1,
        //加工日期 
        ProcessorTime: null,
        //检验员Id（自增id）  为0不指定检验员
        SurveyorId: 1,
        //检验日期
        SurveyTime: null,
        //合格数
        QualifiedNumber: 1,
        //不合格数
        UnqualifiedNumber: 1,
        //机台号（自增Id）
        DeviceId: 1,
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
function PostProcessStep() {
    var data = {}
    data.opType = 228
    data.opData = JSON.stringify({
        //计划号(自增Id)
        ProductionProcessId: 1,
        //工艺顺序
        ProcessStepOrder: 1,
        //工序名称
        ProcessStepName: "测试1",
        //工艺加工要求
        ProcessStepRequirements: "测试1",
        //加工人ID（自增id）  为0不指定加工人
        ProcessorId: 1,
        //加工日期 
        ProcessorTime: "2019-4-3 17:00:41",
        //检验员Id（自增id）  为0不指定检验员
        SurveyorId: 1,
        //检验日期
        SurveyTime: "2019-4-3 17:00:41",
        //合格数
        QualifiedNumber: 1,
        //不合格数
        UnqualifiedNumber: 1,
        //机台号（自增Id）
        DeviceId: 1,
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
function PostProcessSteps() {
    var data = {}
    data.opType = 229
    data.opData = JSON.stringify([{
        //计划号(自增Id)
        ProductionProcessId: 1,
        //工艺顺序
        ProcessStepOrder: 1,
        //工序名称
        ProcessStepName: "测试1",
        //工艺加工要求
        ProcessStepRequirements: "测试1",
        //合格数
        QualifiedNumber: 1,
        //不合格数
        UnqualifiedNumber: 1,
        //机台号（自增Id）
        DeviceId: 0
    }, {
        //计划号(自增Id)
        ProductionProcessId: 1,
        //工艺顺序
        ProcessStepOrder: 1,
        //工序名称
        ProcessStepName: "测试2",
        //工艺加工要求
        ProcessStepRequirements: "测试2",
        //合格数
        QualifiedNumber: 1,
        //不合格数
        UnqualifiedNumber: 1,
        //机台号（自增Id）
        DeviceId: 0
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
function DeleteProcessStepById() {
    var data = {}
    data.opType = 230
    data.opData = JSON.stringify({
        id: 6
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
function DeleteProcessStepByProductionProcessName() {
    var data = {}
    data.opType = 231
    data.opData = JSON.stringify({
        id: "gl888888"
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

//原料
function GetRawMateria() {
    var data = {}
    data.opType = 232
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetRawMateriaByById() {
    var data = {}
    data.opType = 233
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
function GetRawMateriaByRawMateriaName() {
    var data = {}
    data.opType = 234
    data.opData = JSON.stringify({
        id: "BG66-1048"
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
function PutRawMateriaById() {
    var data = {}
    data.opType = 235
    data.opData = JSON.stringify({
        id: 5,
        //名称
        RawMateriaName: "测试",
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
function PutRawMateriaByRawMateriaName() {
    var data = {}
    data.opType = 236
    data.opData = JSON.stringify({
        id: "测试1",
        //名称
        RawMateriaName: "测试",
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
function PostRawMateria() {
    var data = {}
    data.opType = 237
    data.opData = JSON.stringify({
        //名称
        RawMateriaName: "测试1",
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
function PostRawMaterias() {
    var data = {}
    data.opType = 238
    data.opData = JSON.stringify([{
        //名称
        RawMateriaName: "测试2",
    }, {
        //名称
        RawMateriaName: "测试3",
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
function DeleteRawMateriaById() {
    var data = {}
    data.opType = 239
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
function DeleteRawMateriaByRawMateriaName() {
    var data = {}
    data.opType = 240
    data.opData = JSON.stringify({
        id: "BG66-1048"
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

//原料规格
function GetRawMateriaSpecificationById() {
    var data = {}
    data.opType = 241
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
function GetRawMateriaSpecificationByRawMateriaName() {
    var data = {}
    data.opType = 242
    data.opData = JSON.stringify({
        id: "BG66-1048"
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
function PutRawMateriaSpecification() {
    var data = {}
    data.opType = 243
    data.opData = JSON.stringify({
        id: 3,
        //原料批号(自增Id)
        RawMateriaId: 1,
        //规格名
        SpecificationName: "测试",
        //规格值
        SpecificationValue: "测试",
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
function PostRawMateriaSpecification() {
    var data = {}
    data.opType = 244
    data.opData = JSON.stringify({
        //原料批号(自增Id)
        RawMateriaId: 1,
        //规格名
        SpecificationName: "测试1",
        //规格值
        SpecificationValue: "测试1",
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
function PostRawMateriaSpecifications() {
    var data = {}
    data.opType = 245
    data.opData = JSON.stringify([{
        //原料批号(自增Id)
        RawMateriaId: 1,
        //规格名
        SpecificationName: "测试2",
        //规格值
        SpecificationValue: "测试2",
    }, {
        //原料批号(自增Id)
        RawMateriaId: 2,
        //规格名
        SpecificationName: "测试3",
        //规格值
        SpecificationValue: "测试3",
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
function DeleteRawMateriaSpecificationById() {
    var data = {}
    data.opType = 246
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
function DeleteRawMateriaSpecificationByRawMateriaName() {
    var data = {}
    data.opType = 247
    data.opData = JSON.stringify({
        id: "BG66-1048"
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

//加工人
function GetProcessor() {
    var data = {}
    data.opType = 248
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetSingleProcessor() {
    var data = {}
    data.opType = 249
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
function PutProcessor() {
    var data = {}
    data.opType = 250
    data.opData = JSON.stringify({
        id: 3,
        //名称
        ProcessorName: "测试",
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
function PostProcessor() {
    var data = {}
    data.opType = 251
    data.opData = JSON.stringify({
        //名称
        ProcessorName: "测试1"
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
function PostProcessors() {
    var data = {}
    data.opType = 252
    data.opData = JSON.stringify([{
        //名称
        ProcessorName: "测试2",
    }, {
        //名称
        ProcessorName: "测试3",
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
function DeleteProcessor() {
    var data = {}
    data.opType = 253
    data.opData = JSON.stringify({
        id: 2
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

//检验员
function GetSurveyor() {
    var data = {}
    data.opType = 254
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetSingleSurveyor() {
    var data = {}
    data.opType = 255
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
function PutSurveyor() {
    var data = {}
    data.opType = 256
    data.opData = JSON.stringify({
        id: 3,
        //名称
        SurveyorName: "测试",
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
function PostSurveyor() {
    var data = {}
    data.opType = 257
    data.opData = JSON.stringify({
        //名称
        SurveyorName: "测试1",
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
function PostSurveyors() {
    var data = {}
    data.opType = 258
    data.opData = JSON.stringify([{
        //名称
        SurveyorName: "测试2",
    }, {
        //名称
        SurveyorName: "测试3",
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
function DeleteSurveyor() {
    var data = {}
    data.opType = 259
    data.opData = JSON.stringify({
        id: 2
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

