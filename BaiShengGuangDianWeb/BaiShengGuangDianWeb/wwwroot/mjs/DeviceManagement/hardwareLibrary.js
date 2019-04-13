
function pageReady() {
    getHardWareList();
}

var op = function (data, type, row) {
    var html = '<div class="btn-group">' +
        '<button type = "button" class="btn btn-default" > <i class="fa fa-asterisk"></i>操作</button >' +
        '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
        '        <span class="caret"></span>' +
        '        <span class="sr-only">Toggle Dropdown</span>' +
        '    </button>' +
        '    <ul class="dropdown-menu" role="menu">{0}{1}' +
        '    </ul>' +
        '</div>';
    var updateLi = '<li><a onclick="showUpdateHard({0}, \'{1}\', \'{2}\', \'{3}\', \'{4}\', \'{5}\', \'{6}\', \'{7}\', \'{8}\')">修改</a></li>'.format(data.Id, data.HardwareName, data.InputNumber, data.OutputNumber,data.DacNumber,data.AdcNumber,data.AxisNumber,data.ComNumber,data.Description);
    var deleteLi = '<li><a onclick="DeleteHard({0}, \'{1}\')">删除</a></li>'.format(data.Id, data.HardwareName);
    html = html.format(
        checkPermission(137) ? updateLi : "",
        checkPermission(139) ? deleteLi : "");
    return html;
}

function getHardWareList() {
    var opType = 135;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    ajaxPost("/Relay/Post",
        {
            opType: opType
        },
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            $("#hardwareList")
                .DataTable({
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": { "url": "/content/datatables_language.json" },
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "columns": [
                        { "data": "Id", "title": "序号" },
                        { "data": "HardwareName", "title": "版本名称" },
                        { "data": "InputNumber", "title": "输入口数量" },
                        { "data": "OutputNumber", "title": "输出口数量" },
                        { "data": "DacNumber", "title": "数模转换数量" },
                        { "data": "AdcNumber", "title": "模数转换数量" },
                        { "data": "AxisNumber", "title": "主轴数量" },
                        { "data": "ComNumber", "title": "通用串口数量" },
                        { "data": "Description", "title": "描述" },
                        { "data": null, "title": "操作", "render": op },
                    ],
                });
        });
}


function showHardWare() {
    var opType = 135;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var data = {}
    data.opType = opType

    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            $("#addHardName").empty();

            $("#addModel").modal("show");
        });
}

function addHardWare() {
    var opType = 138;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var hardName = $("#addHardName").val();
    var inputNumber = $("#addInputNumber").val();
    var outputNumber = $("#addOutputNumber").val();
    var dacNumber = $("#addDacNumber").val();
    var adcNumber = $("#addAdcNumber").val();
    var axisNumber = $("#addAxisNumber").val();
    var comNumber = $("#addComNumber").val();
    var description = $("#addDescription").val();
    if (isStrEmptyOrUndefined(hardName)) {
        showTip($("#updateHardNameTip"), "版本名称不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(inputNumber)) {
        showTip($("#updateInputNumberTip"), "输入口数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(outputNumber)) {
        showTip($("#updateOutputNumberTip"), "输出口数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(dacNumber)) {
        showTip($("#updateDacNumberTip"), "数模转换数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(adcNumber)) {
        showTip($("#updateAdcNumberTip"), "模数转换数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(axisNumber)) {
        showTip($("#updateAxisNumberTip"), "主轴数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(comNumber)) {
        showTip($("#updateComNumberTip"), "通用串口数量不能为空");
        return;
    }
    
    var doSth = function () {
        $("#addModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            //硬件版本名称
            HardwareName: hardName,
            //输入口数量
            InputNumber: inputNumber,
            //输出口数量
            OutputNumber: outputNumber,
            //数模转换数量
            DacNumber: dacNumber,
            //模数转换数量
            AdcNumber: adcNumber,
            //主轴数量
            AxisNumber: axisNumber,
            //通用串口数量
            ComNumber: comNumber,
            //描述
            Description: description,
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getHardWareList();
                }
            });
    }
    showConfirm("添加", doSth);
}

function DeleteHard(id, hardName) {
    var opType = 139;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }

    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getHardWareList();
                }
            });
    }
    showConfirm("删除硬件：" + hardName, doSth);
}

function showUpdateHard(id, hardName, inputNumber, outputNumber, dacNumber, adcNumber, axisNumber, comNumber, description) {
    var opType = 136;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            };
            $("#addHardName").empty();

            var option = '<option value="{0}">{1}</option>';
            for (var i = 0; i < ret.datas.length; i++) {
                var data = ret.datas[i];
                $("#addHardName").append(option.format(data.Id, data.HardwareName, data.InputNumber, data.OutputNumber, data.DacNumber, data.AdcNumber, data.AxisNumber, data.ComNumber, data.Description));
            }
            $("#updateId").html(id);
            $("#updateHardName").val(hardName);
            $("#updateInputNumber").val(inputNumber);
            $("#updateOutputNumber").val(outputNumber);
            $("#updateDacNumber").val(dacNumber);
            $("#updateAdcNumber").val(adcNumber);
            $("#updateAxisNumber").val(axisNumber);
            $("#updateComNumber").val(comNumber);
            $("#updateDescription").val(description);
            $("#updateHard").modal("show");
        });
}

function updateHard() {
    var opType = 137;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var id = parseInt($("#updateId").html());

    var libraryName = $("#updateHardName").val();
    var libraryInput= $("#updateInputNumber").val();
    var libraryOutput = $("#updateOutputNumber").val();
    var libraryDac = $("#updateDacNumber").val();
    var libraryAdc = $("#updateAdcNumber").val();
    var libraryAxis = $("#updateAxisNumber").val();
    var libraryCom = $("#updateComNumber").val();
    var libraryDescr = $("#updateDescription").val();
    var doSth = function () {
        $("#updateHard").modal("hide");

        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id,
            //硬件版本名称
            HardwareName: libraryName,
            //输入口数量
            InputNumber: libraryInput,
            //输出口数量
            OutputNumber: libraryOutput,
            //数模转换数量
            DacNumber: libraryDac,
            //模数转换数量
            AdcNumber: libraryAdc,
            //主轴数量
            AxisNumber: libraryAxis,
            //通用串口数量
            ComNumber: libraryCom,
            //描述
            Description: libraryDescr,
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getHardWareList();
                }
            });
    }
    showConfirm("修改", doSth);

}


