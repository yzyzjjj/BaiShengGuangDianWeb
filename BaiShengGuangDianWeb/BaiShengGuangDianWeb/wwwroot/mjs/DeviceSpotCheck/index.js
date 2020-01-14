function pageReady() {
    $(".ms2").select2();
    getWorkShop();
    $('#workShop').on('select2:select', function () {
        var workShopName = $(this).val();
        getWorkShopDevice(workShopName, $('#workShopDevice'), 0);
        $('#workShopDetail').val(workShopName).trigger("change");
        getWorkShopDevice(workShopName, $('#workShopDeviceDetail'), true);
    });
    $('#workShopDevice, #spotPlan').on('select2:select', function () {
        getThisCheckList();
    });
    $('#workShopDetail').on('select2:select', function () {
        var workShopName = $(this).val();
        getWorkShopDevice(workShopName, $('#workShopDeviceDetail'), 1);
    });
    $('#workShopDeviceDetail, #spotPlanDetail').on('select2:select', function () {
        detailPage();
    });
    $('#imgOldList').on('click', '.delImg', function () {
        $(this).parents('.imgOption').remove();
        var e = $(this).val();
        _imgNameData.splice(_imgNameData.indexOf(e), 1);
    });
}

//获取车间
function getWorkShop() {
    var opType = 162;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $(".workShop").empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{0}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.SiteName);
        }
        $('.workShop').append(options);
        getWorkShopDevice();
    });
}

var _pageRead = true;
//获取车间设备
function getWorkShopDevice(workShopName, el, all) {
    var opType = 163;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    if (isStrEmptyOrUndefined(workShopName)) {
        workShopName = $('#workShop').val();
        if (isStrEmptyOrUndefined(workShopName)) {
            layer.msg('请选择车间');
            return;
        }
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        workshopName: workShopName
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        isStrEmptyOrUndefined(el) ? $('.workShopDevice').empty() : el.empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        var deviceId = [];
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Code);
            deviceId.push(d.Id);
        }
        if (len && !all) {
            $('#workShopDevice').prepend(option.format(deviceId, '所有设备'));
        }
        isStrEmptyOrUndefined(el) ? $('.workShopDevice').append(options) : el.append(options);
        if (_pageRead) {
            _pageRead = false;
            getSpotPlan();
        } else {
            switch (all) {
                case 0:
                    getThisCheckList();
                    break;
                case 1:
                    detailPage();
                    break;
            }
        }
    });
}

//获取点检计划
function getSpotPlan() {
    var opType = 600;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('.spotPlan').empty();
        var list = ret.datas;
        var i, len = list.length;
        var option = '<option value="{0}">{1}</option>';
        var options = '';
        if (len) {
            $('#spotPlan').append(option.format(0, '所有计划'));
        }
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Plan);
        }
        $('.spotPlan').append(options);
        getThisCheckList();
    });
}

//获取设备点检情况
function getThisCheckList() {
    var opType = 613;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    $('#devicePlan').empty();
    var list = {};
    var deviceId = $('#workShopDevice').val();
    if (isStrEmptyOrUndefined(deviceId)) {
        layer.msg("请选择设备");
        return;
    }
    if (deviceId != 0) {
        list.ids = deviceId;
    }
    var planId = $('#spotPlan').val();
    if (isStrEmptyOrUndefined(planId)) {
        layer.msg("请选择点检计划");
        return;
    }
    if (planId != 0) {
        list.plans = planId;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var op = '<div style="flex-basis: 150px; height: 110px; background:#dcdcdc; margin: 5px;text-align: center;cursor:pointer;box-shadow:2px 2px 3px black" onclick="detailPage({0},{3})">' +
            '<div style="width: 100%; height: 26%;position: relative">' +
            '<label class="control-label" style="margin-top: 5px">{0}</label>' +
            '<div style="width: 30px; height: 100%; background: {1}; position: absolute; top: 0;right: 0"></div>' +
            '</div>' +
            '<div style="width: 100%; height: 74%">{2}</div>' +
            '</div>';
        var ops = '';
        var i = 0, len = rData.length;
        if (!len) {
            $('#devicePlan').append('<div style="font:bold 25px/35px 微软雅黑;color:red">无数据</div>');
        }
        for (; i < len; i++) {
            var d = rData[i];
            var planData = d.Data;
            var deviceName = d.DeviceId;
            var plan = planData[0].PlanId;
            var j = 0, planLen = planData.length;
            //已检验,不合格总数,计划数据
            var done = null, notPass = null, planDetails = '';
            for (; j < planLen; j++) {
                var pd = planData[j];
                done += pd.Done;
                notPass += pd.NotPass;
                if (j === 3) {
                    planDetails += '...';
                    break;
                }
                planDetails += pd.Total == pd.Done
                    ? `${pd.Plan}：${pd.Total}/<font style="color: green">${pd.Done}</font>/<font style="color: red">${pd.NotPass}</font><br>`
                    : `${pd.Plan}：${pd.Total}/${pd.Done}/<font style="color: red">${pd.NotPass}</font><br>`;
            }
            var rightTopColor = '';
            if (done) {
                if (done > 0 && notPass > 0) {
                    rightTopColor = '#FF0000';
                }
                if (done > 0 && notPass === 0) {
                    rightTopColor = '#008000';
                }
            } else {
                rightTopColor = '#FFCC33';
            }
            ops += op.format(deviceName, rightTopColor, planDetails, plan);
        }
        $('#devicePlan').append(ops);
    });
}

//获取设备点检详情
function detailPage(deviceId, planId) {
    var opType = 614;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var list = {};
    if (isStrEmptyOrUndefined(deviceId) || isStrEmptyOrUndefined(planId)) {
        deviceId = $('#workShopDeviceDetail').val();
        if (isStrEmptyOrUndefined(deviceId)) {
            layer.msg("请选择设备");
            return;
        }
        planId = $('#spotPlanDetail').val();
        if (isStrEmptyOrUndefined(planId)) {
            layer.msg("请选择点检计划");
            return;
        }
    } else {
        var workShopName = $('#workShop').val();
        if (isStrEmptyOrUndefined(workShopName)) {
            layer.msg("请选择车间");
            return;
        }
        $('#workShopDeviceDetail').val(deviceId).trigger("change");
        $('#spotPlanDetail').val(planId).trigger("change");
    }
    list.deviceId = deviceId;
    list.planId = planId;
    var account = getCookieTokenInfo().account;
    list.account = account;
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#updateDetailModal').modal('show');
        var rData = ret.datas;
        var isEnable = function (data) {
            return `<input type="checkbox" class="icb_minimal isEnable" id=${data.Id} surveyorId=${data.SurveyorId}>`;
        }
        var number = 0;
        var order = function () {
            return ++number;
        }
        var plannedTime = function (data) {
            return data.slice(0, data.indexOf(' '));
        }
        var actualTime = function (data) {
            var time = data.slice(0, data.indexOf(' '));
            if (time == '0001-01-01') {
                time = '';
            }
            return `<span class="textOn">${time}</span><input type="text" class="form_date form-control text-center textIn actualTime hidden" style="width:120px;cursor: pointer">`;
        }
        var actual = function (data) {
            return `<span class="textOn">${data}</span><input type="text" class="form-control text-center textIn actual hidden" maxlength="10" oninput="value=value.replace(/[^\\d]/g,\'\')" style="width:80px" value=${data}>`;
        }
        var desc = function (data) {
            if (data === null) {
                data = '';
            }
            return `<span class="textOn">${data}</span><textarea class="form-control textIn desc hidden" maxlength="500" style="resize: vertical;width:180px">${data}</textarea>`;
        }
        var lookImg = function (data) {
            var op = '<span class="glyphicon glyphicon-{0}" aria-hidden="true" style="color:{1};font-size:25px;vertical-align:middle;margin-right:5px"></span>' +
                '<button type="button" class="btn btn-info btn-sm" style="vertical-align:middle" onclick="showImgModel({2},\'{3}\',\'{4}\')">查看</button>';
            return data.ImageList.length ? op.format('ok', 'green', data.Id, escape(data.Item), escape(data.ImageList)) : op.format('remove', 'red', data.Id, escape(data.Item), escape(data.ImageList));
        }
        $('#devicePlanDetailList').DataTable({
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": { "url": "/content/datatables_language.json" },
            "data": rData,
            "aaSorting": [[1, "asc"]],
            "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 20, //默认显示的记录数
            "columns": [
                { "data": null, "title": "选择", "render": isEnable },
                { "data": null, "title": "序号", "render": order },
                { "data": "Item", "title": "名称" },
                { "data": "Max", "title": "上限" },
                { "data": "Min", "title": "下限" },
                { "data": "Unit", "title": "单位" },
                { "data": "Reference", "title": "参考标准" },
                { "data": "PlannedTime", "title": "计划时间", "render": plannedTime },
                { "data": "CheckTime", "title": "实际时间", "render": actualTime },
                { "data": "Actual", "title": "实际", "render": actual },
                { "data": "Desc", "title": "简述", "render": desc },
                { "data": null, "title": "图片", "render": lookImg }
            ],
            "columnDefs": [
                { "orderable": false, "targets": 0 }
            ],
            "createdRow": function (row, data, index) {
                var time = data.CheckTime.slice(0, data.PlannedTime.indexOf(' '));
                var date = $(row).find('.form_date');
                date.attr("readonly", true).datepicker({
                    language: 'zh-CN',
                    format: 'yyyy-mm-dd',
                    maxViewMode: 2,
                    todayBtn: "linked",
                    autoclose: true
                });
                date.val(time).datepicker('update');
            },
            "drawCallback": function (settings, json) {
                $(this).find('.icb_minimal').iCheck({
                    labelHover: false,
                    cursor: true,
                    checkboxClass: 'icheckbox_minimal-blue',
                    radioClass: 'iradio_minimal-blue',
                    increaseArea: '20%'
                });
                $(this).find('td').css("verticalAlign", "middle");
                $(this).find('.isEnable').on('ifChanged',
                    function () {
                        var tr = $(this).parents('tr');
                        if ($(this).is(':checked')) {
                            tr.find('.textIn').removeClass('hidden').siblings('.textOn').addClass('hidden');
                            var textOn = tr.find('.textOn');
                            var actualTimeOn = textOn.eq(0).text();
                            var actualOn = textOn.eq(1).text();
                            var descOn = textOn.eq(2).text();
                            tr.find('.actualTime').val(actualTimeOn).datepicker('update');
                            tr.find('.actual').val(actualOn);
                            tr.find('.desc').val(descOn);
                        } else {
                            tr.find('.textOn').removeClass('hidden').siblings('.textIn').addClass('hidden');
                        }
                    });
            }
        });
    });
}

//更新设备点检项
function updateDeviceCheck() {
    var opType = 616;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var trs = $('#devicePlanDetailList tbody').find('tr');
    var checkData = [];
    var i = 0, len = trs.length;
    for (; i < len; i++) {
        var tr = trs.eq(i);
        var isEnable = tr.find('.isEnable');
        if (isEnable.is(':checked')) {
            var id = isEnable.attr('id');
            var surveyorId = isEnable.attr('surveyorId');
            var checkTime = tr.find('.actualTime').val();
            if (isStrEmptyOrUndefined(checkTime)) {
                layer.msg("实际时间不能为空");
                return;
            }
            if (exceedTime(checkTime)) {
                layer.msg("实际时间不能大于当前时间");
                return;
            }
            checkTime = `${checkTime} 00:00:00`;
            var actual = tr.find('.actual').val().trim();
            if (isStrEmptyOrUndefined(actual)) {
                layer.msg("实际不能为空");
                return;
            }
            var desc = tr.find('.desc').val().trim();
            checkData.push({
                CheckTime: checkTime,
                Actual: parseInt(actual),
                Desc: desc,
                SurveyorId: surveyorId,
                Id: id
            });
        }
    }
    if (!checkData.length) {
        layer.msg("请选择需要修改的数据");
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(checkData);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    detailPage();
                }
            });
    }
    showConfirm("修改", doSth);
}

var _updateFirmwareUpload = null;
var _imgNameData = null;
//图片详情模态框
function showImgModel(id, item, img) {
    if (_updateFirmwareUpload == null) {
        _updateFirmwareUpload = initFileInputMultiple("addImg", fileEnum.SpotCheck);
    }
    $("#addImg").fileinput('clear');
    $('#checkId').text(id);
    item = unescape(item);
    $('#checkName').val(item);
    img = unescape(img);
    $('#imgOld').empty();
    $("#imgOldList").empty();
    _imgNameData = [];
    if (isStrEmptyOrUndefined(img)) {
        $('#imgOld').append('图片：<font style="color:red" size=5>无</font>');
    } else {
        $('#imgOld').append('图片：');
        img = img.split(",");
        _imgNameData = img;
        var data = {
            type: fileEnum.SpotCheck,
            files: JSON.stringify(img)
        };
        ajaxPost("/Upload/Path", data,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }
                var imgOp = '<div class="imgOption col-lg-2 col-md-3 col-sm-4 col-xs-6">' +
                    '<div class="thumbnail">' +
                    '<img src={0} style="height:200px">' +
                    '<div class="caption text-center">' +
                    '<button type="button" class="btn btn-default glyphicon glyphicon-trash delImg" value="{1}"></button>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                var imgOps = "";
                for (var i = 0; i < ret.data.length; i++) {
                    imgOps += imgOp.format(ret.data[i].path, img[i]);
                }
                $("#imgOldList").append(imgOps);
            });
    }
    $('#addImgBox').find('.file-caption-name').attr('readonly', true).attr('placeholder', '选择 张图片...');
    $('#showImgModel').modal('show');
}

//修改图片
function updateImg() {
    var opType = 617;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    //if (!hasPre()) {
    //    layer.msg("请先上传图片");
    //    return;
    //}
    fileCallBack[fileEnum.SpotCheck] = function (fileRet) {
        if (fileRet.errno == 0) {
            var img = [];
            for (var key in fileRet.data) {
                img.push(fileRet.data[key].newName);
            }
            var imgNew = _imgNameData.concat(img);
            imgNew = JSON.stringify(imgNew);
            var id = $('#checkId').text();
            var data = {}
            data.opType = opType;
            data.opData = JSON.stringify({
                Images: imgNew,
                Id: id
            });
            ajaxPost("/Relay/Post", data,
                function (ret) {
                    layer.msg(ret.errmsg);
                    $('#showImgModel').modal('hide');
                    if (ret.errno == 0) {
                        detailPage(null, null, true);
                    }
                });
        }
    };
    var doSth = function () {
        $('#addImg').fileinput("upload");
    }
    showConfirm("操作", doSth);
}