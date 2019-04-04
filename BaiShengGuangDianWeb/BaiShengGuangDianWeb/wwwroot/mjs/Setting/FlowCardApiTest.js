
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
