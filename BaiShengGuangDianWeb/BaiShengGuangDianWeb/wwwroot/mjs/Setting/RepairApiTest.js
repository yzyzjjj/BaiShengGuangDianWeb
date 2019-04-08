//常见故障
function GetUsuallyFault() {
    var data = {}
    data.opType = 400
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetSingleUsuallyFault() {
    var data = {}
    data.opType = 401
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
function PutUsuallyFault() {
    var data = {}
    data.opType = 402
    data.opData = JSON.stringify({
        //(自增Id)
        id: 3,
        //故障类型描述
        UsuallyFaultDesc: "测试",
        //故障类型解决方案
        SolverPlan: "测试",
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
function PostUsuallyFault() {
    var data = {}
    data.opType = 403
    data.opData = JSON.stringify({
        //故障类型描述
        UsuallyFaultDesc: "测试",
        //故障类型解决方案
        SolverPlan: "测试",
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
function PostUsuallyFaults() {
    var data = {}
    data.opType = 404
    data.opData = JSON.stringify([{
        //故障类型描述
        UsuallyFaultDesc: "测试2",
        //故障类型解决方案
        SolverPlan: "测试2",
    }, {
        //故障类型描述
        UsuallyFaultDesc: "测试3",
        //故障类型解决方案
        SolverPlan: "测试3",
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
function DeleteUsuallyFault() {
    var data = {}
    data.opType = 405
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

//故障类型
function GetFaultType() {
    var data = {}
    data.opType = 406
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetSingleFaultType() {
    var data = {}
    data.opType = 407
    data.opData = JSON.stringify({
        id: 1
    })
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
function PutFaultType() {
    var data = {}
    data.opType = 408
    data.opData = JSON.stringify({
        //(自增Id)
        id: 3,
        //故障类型
        FaultTypeName: "测试",
        //故障类型描述
        FaultDescription: "测试",
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
function PostFaultType() {
    var data = {}
    data.opType = 409
    data.opData = JSON.stringify({
        //故障类型
        FaultTypeName: "测试1",
        //故障类型描述
        FaultDescription: "测试1",
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
function PostFaultTypes() {
    var data = {}
    data.opType = 410
    data.opData = JSON.stringify([{
        //故障类型
        FaultTypeName: "测试2",
        //故障类型描述
        FaultDescription: "测试2",
    }, {
        //故障类型
        FaultTypeName: "测试3",
        //故障类型描述
        FaultDescription: "测试3",
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
function DeleteFaultType() {
    var data = {}
    data.opType = 411
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

//故障记录
function GetRepairRecord() {
    var data = {}
    data.opType = 412
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetSingleRepairRecord() {
    var data = {}
    data.opType = 413
    data.opData = JSON.stringify({
        id: 1
    })
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
function PutRepairRecord() {
    var data = {}
    data.opType = 414
    data.opData = JSON.stringify({
        //(自增Id)
        id: 3,
        //机台号
        DeviceCode: "1号机",
        //故障时间
        FaultTime: "2019-4-7 09:24:56",
        //报修人
        Proposer: "测试",
        //故障描述
        FaultDescription: "测试",
        //优先级
        Priority: 1,
        //故障解决者
        FaultSolver: "测试",
        //故障解决时间
        SolveTime: "2019-4-7 09:24:56",
        //故障解决方案
        SolvePlan: "测试",
        //故障类型表Id
        FaultTypeId: 1

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
function PostRepairRecord() {
    var data = {}
    data.opType = 415
    data.opData = JSON.stringify({
        //机台号
        DeviceCode: "1号机",
        //故障时间
        FaultTime: "2019-4-7 09:24:56",
        //报修人
        Proposer: "测试1",
        //故障描述
        FaultDescription: "测试1",
        //优先级
        Priority: 1,
        //故障解决者
        FaultSolver: "测试1",
        //故障解决时间
        SolveTime: "2019-4-7 09:24:56",
        //故障解决方案
        SolvePlan: "测试1",
        //故障类型表Id
        FaultTypeId: 1
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
function DeleteRepairRecord() {
    var data = {}
    data.opType = 416
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

//故障设备
function GetFaultDevice() {
    var data = {}
    data.opType = 417
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            console.log(ret);
        });
}
function GetFaultDeviceById() {
    var data = {}
    data.opType = 418
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
function GetFaultDeviceByCode() {
    var data = {}
    data.opType = 419
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
function PutFaultDevice() {
    var data = {}
    data.opType = 420
    data.opData = JSON.stringify({
        //(自增Id)
        id: 3,
        //机台号
        DeviceCode: "1号机",
        //故障时间
        FaultTime: "2019-4-7 09:34:42",
        //报修人
        Proposer: "测试",
        //故障描述
        FaultDescription: "测试",
        //优先级
        Priority: 1

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
function PostFaultDevice() {
    var data = {}
    data.opType = 421
    data.opData = JSON.stringify({
        //机台号
        DeviceCode: "1号机",
        //故障时间
        FaultTime: "2019-4-7 09:34:42",
        //报修人
        Proposer: "测试",
        //故障描述
        FaultDescription: "测试",
        //优先级
        Priority: 1
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
function PostFaultDevices() {
    var data = {}
    data.opType = 422
    data.opData = JSON.stringify([{
        //机台号
        DeviceCode: "1号机",
        //故障时间
        FaultTime: "2019-4-7 09:34:42",
        //报修人
        Proposer: "测试2",
        //故障描述
        FaultDescription: "测试2",
        //优先级
        Priority: 1
    }, {
        //机台号
        DeviceCode: "2号机",
        //故障时间
        FaultTime: "2019-4-7 09:34:42",
        //报修人
        Proposer: "测试3",
        //故障描述
        FaultDescription: "测试3",
        //优先级
        Priority: 1
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
function DeleteFaultDevice() {
    var data = {}
    data.opType = 423
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
 