
function pageReady() {
    getHardwareList();
    var opType = 138;
    if (!checkPermission(opType)) {
        $("#showAddHardwareModal").addClass("hidden");
    }
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
    var updateLi = '<li><a onclick="showUpdateHardware({0}, \'{1}\', \'{2}\', \'{3}\', \'{4}\', \'{5}\', \'{6}\', \'{7}\', \'{8}\')">修改</a></li>'.format(data.Id, escape(data.HardwareName), data.InputNumber, data.OutputNumber, data.DacNumber, data.AdcNumber, data.AxisNumber, data.ComNumber, escape(data.Description));
    var deleteLi = '<li><a onclick="deleteHardware({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.HardwareName));
    html = html.format(
        checkPermission(137) ? updateLi : "",
        checkPermission(139) ? deleteLi : "");
    return html;
}

function getHardwareList() {
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

            var o = 0;
            var order = function (data, type, row) {
                return ++o;
            }
            var opType1 = 137;
            var opType2 = 139;
            if (checkPermission(opType1) || checkPermission(opType2)) {
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
                            { "data": null, "title": "序号", "render": order },
                            { "data": "Id", "title": "Id", "bVisible": false },
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
                        "columnDefs": [
                            { "orderable": false, "targets": 10 }
                        ],
                    });
            } else {
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
                            { "data": null, "title": "序号", "render": order },
                            { "data": "Id", "title": "Id", "bVisible": false },
                            { "data": "HardwareName", "title": "版本名称" },
                            { "data": "InputNumber", "title": "输入口数量" },
                            { "data": "OutputNumber", "title": "输出口数量" },
                            { "data": "DacNumber", "title": "数模转换数量" },
                            { "data": "AdcNumber", "title": "模数转换数量" },
                            { "data": "AxisNumber", "title": "主轴数量" },
                            { "data": "ComNumber", "title": "通用串口数量" },
                            { "data": "Description", "title": "描述" },
                        ]
                    });
            }
        });
}

function showAddHardwareModal() {
    hideClassTip('adt');
    $(".dd").val("");
    $("#addModel").modal("show");
}

function addHardware() {
    var opType = 138;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var addHardwareName = $("#addHardwareName").val().trim();
    var addInputNumber = $("#addInputNumber").val().trim();
    var addOutputNumber = $("#addOutputNumber").val().trim();
    var addDacNumber = $("#addDacNumber").val().trim();
    var addAdcNumber = $("#addAdcNumber").val().trim();
    var addAxisNumber = $("#addAxisNumber").val().trim();
    var addComNumber = $("#addComNumber").val().trim();
    var addDescription = $("#addDescription").val();
    if (isStrEmptyOrUndefined(addHardwareName)) {
        showTip($("#addHardwareNameTip"), "名称不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addInputNumber)) {
        showTip($("#addInputNumberTip"), "输入口数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addOutputNumber)) {
        showTip($("#addOutputNumberTip"), "输出口数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addDacNumber)) {
        showTip($("#addDacNumberTip"), "数模转换数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addAdcNumber)) {
        showTip($("#addAdcNumberTip"), "模数转换数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addAxisNumber)) {
        showTip($("#addAxisNumberTip"), "主轴数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(addComNumber)) {
        showTip($("#addComNumberTip"), "通用串口数量不能为空");
        return;
    }

    var doSth = function () {
        $("#addModel").modal("hide");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            //硬件版本名称
            HardwareName: addHardwareName,
            //输入口数量
            InputNumber: addInputNumber,
            //输出口数量
            OutputNumber: addOutputNumber,
            //数模转换数量
            DacNumber: addDacNumber,
            //模数转换数量
            AdcNumber: addAdcNumber,
            //主轴数量
            AxisNumber: addAxisNumber,
            //通用串口数量
            ComNumber: addComNumber,
            //描述
            Description: addDescription,
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getHardwareList();
                }
            });
    }
    showConfirm("添加", doSth);
}

function deleteHardware(id, hardName) {
    hardName = unescape(hardName);
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
                    getHardwareList();
                }
            });
    }
    showConfirm("删除硬件：" + hardName, doSth);
}

function showUpdateHardware(id, hardName, inputNumber, outputNumber, dacNumber, adcNumber, axisNumber, comNumber, description) {
    hardName = unescape(hardName);
    description = unescape(description);
    hideClassTip('adt');
    $(".dd").val("");
    $("#updateId").html(id);
    $("#updateHardwareName").val(hardName);
    $("#updateInputNumber").val(inputNumber);
    $("#updateOutputNumber").val(outputNumber);
    $("#updateDacNumber").val(dacNumber);
    $("#updateAdcNumber").val(adcNumber);
    $("#updateAxisNumber").val(axisNumber);
    $("#updateComNumber").val(comNumber);
    $("#updateDescription").val(description);
    $("#updateHardwareModal").modal("show");
}

function updateHardware() {
    var opType = 137;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var id = parseInt($("#updateId").html());

    var updateHardwareName = $("#updateHardwareName").val().trim();
    var updateInputNumber = $("#updateInputNumber").val().trim();
    var updateOutputNumber = $("#updateOutputNumber").val().trim();
    var updateDacNumber = $("#updateDacNumber").val().trim();
    var updateAdcNumber = $("#updateAdcNumber").val().trim();
    var updateAxisNumber = $("#updateAxisNumber").val().trim();
    var updateComNumber = $("#updateComNumber").val().trim();
    var updateDescription = $("#updateDescription").val();
    if (isStrEmptyOrUndefined(updateHardwareName)) {
        showTip($("#updateHardwareNameTip"), "名称不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(updateInputNumber)) {
        showTip($("#updateInputNumberTip"), "输入口数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(updateOutputNumber)) {
        showTip($("#updateOutputNumberTip"), "输出口数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(updateDacNumber)) {
        showTip($("#updateDacNumberTip"), "数模转换数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(updateAdcNumber)) {
        showTip($("#updateAdcNumberTip"), "模数转换数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(updateAxisNumber)) {
        showTip($("#updateAxisNumberTip"), "主轴数量不能为空");
        return;
    }
    if (isStrEmptyOrUndefined(updateComNumber)) {
        showTip($("#updateComNumberTip"), "通用串口数量不能为空");
        return;
    }

    var doSth = function () {
        $("#updateHardwareModal").modal("hide");

        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: id,
            //硬件版本名称
            HardwareName: updateHardwareName,
            //输入口数量
            InputNumber: updateInputNumber,
            //输出口数量
            OutputNumber: updateOutputNumber,
            //数模转换数量
            DacNumber: updateDacNumber,
            //模数转换数量
            AdcNumber: updateAdcNumber,
            //主轴数量
            AxisNumber: updateAxisNumber,
            //通用串口数量
            ComNumber: updateComNumber,
            //描述
            Description: updateDescription,
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getHardwareList();
                }
            });
    }
    showConfirm("修改", doSth);

}


