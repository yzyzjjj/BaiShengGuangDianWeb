var _permissionList = [];
function pageReady() {
    _permissionList[215] = { uIds: ['showAddHardwareModal'] };
    _permissionList[216] = { uIds: [] };
    _permissionList[217] = { uIds: [] };
    _permissionList = checkPermissionUi(_permissionList);
    getHardwareList();
}

function getHardwareList() {
    ajaxPost("/Relay/Post",
        {
            opType: 135
        },
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var per216 = _permissionList[216].have;
            var per217 = _permissionList[217].have;
            var order = function (a, b, c,d) {
                return ++d.row;
            }
            var rModel = function (data, type, full, meta) {
                full.Description = full.Description ? full.Description : "";
                return full.Description.length > tdShowContentLength
                    ? full.Description.substr(0, tdShowContentLength) +
                    '<a href = \"javascript:showDescriptionModel({0})\">...</a> '
                    .format(full.Id)
                    : full.Description;
            };
            var op = function (data, type, row) {
                var html = '<div class="btn-group">' +
                    '<button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >' +
                    '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                    '        <span class="caret"></span>' +
                    '        <span class="sr-only">Toggle Dropdown</span>' +
                    '    </button>' +
                    '    <ul class="dropdown-menu" role="menu" style="cursor:pointer">{0}{1}' +
                    '    </ul>' +
                    '</div>';
                var updateLi = '<li><a onclick="showUpdateHardware({0}, \'{1}\', \'{2}\', \'{3}\', \'{4}\', \'{5}\', \'{6}\', \'{7}\', \'{8}\')">修改</a></li>'.format(data.Id, escape(data.HardwareName), data.InputNumber, data.OutputNumber, data.DacNumber, data.AdcNumber, data.AxisNumber, data.ComNumber, escape(data.Description));
                var deleteLi = '<li><a onclick="deleteHardware({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.HardwareName));
                return html.format(per216 ? updateLi : '',per217 ? deleteLi : '');
            }
            var columns = per216 || per217
                ? [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "HardwareName", "title": "版本名称" },
                    { "data": "InputNumber", "title": "输入口数量" },
                    { "data": "OutputNumber", "title": "输出口数量" },
                    { "data": "DacNumber", "title": "数模转换数量" },
                    { "data": "AdcNumber", "title": "模数转换数量" },
                    { "data": "AxisNumber", "title": "主轴数量" },
                    { "data": "ComNumber", "title": "通用串口数量" },
                    { "data": "Description", "title": "描述", "render": rModel },
                    { "data": null, "title": "操作", "render": op, "orderable": false}
                ]
                : [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Id", "title": "Id", "bVisible": false },
                    { "data": "HardwareName", "title": "版本名称" },
                    { "data": "InputNumber", "title": "输入口数量" },
                    { "data": "OutputNumber", "title": "输出口数量" },
                    { "data": "DacNumber", "title": "数模转换数量" },
                    { "data": "AdcNumber", "title": "模数转换数量" },
                    { "data": "AxisNumber", "title": "主轴数量" },
                    { "data": "ComNumber", "title": "通用串口数量" },
                    { "data": "Description", "title": "描述", "render": rModel }
                ];
            $("#hardwareList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数  
                    "columns": columns
                });
        });
}

function showDescriptionModel(id) {
    var data = {}
    data.opType = 135;
    data.opData = JSON.stringify({
        id: id
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            if (ret.datas.length > 0) {
                $("#description").html(ret.datas[0].Description);
            }
            $("#descriptionModel").modal("show");
        });
}

function showAddHardwareModal() {
    hideClassTip('adt');
    $(".dd").val("");
    $("#addModel").modal("show");
}

function addHardware() {
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
        data.opType = 138;
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
    var doSth = function () {
        var data = {}
        data.opType = 139;
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
        data.opType = 137;
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
