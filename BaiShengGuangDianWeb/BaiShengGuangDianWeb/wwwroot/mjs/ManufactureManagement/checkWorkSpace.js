﻿var _admin = getCookieTokenInfo().account;
var _permissionList = [];
var _have404 = null;
function pageReady() {
    _permissionList[400] = { uIds: ['getCheckTaskBtn'] };
    _permissionList[401] = { uIds: ['startBtn'] };
    _permissionList[402] = { uIds: ['pauseBtn'] };
    _permissionList[403] = { uIds: [] };
    _permissionList[404] = { uIds: ['getAccountCheckTaskBox'] };
    _permissionList = checkPermissionUi(_permissionList);
    _have404 = _permissionList[404].have;
    $('.ms2').select2();
    $('.table-bordered td').css('border', '1px solid');
    _have404 ? getGroup() : getCheckTask();
    $('#imgOldList').on('click', '.delImg', function () {
        $(this).parents('.imgOption').remove();
        var e = $(this).val();
        _imgNameData.splice(_imgNameData.indexOf(e), 1);
    });
    $('#groupSelect').on('select2:select', function () {
        getProcessor(false);
    });
}

//获取分组
function getGroup() {
    var data = {}
    data.opType = 1077;
    data.opData = JSON.stringify({
        menu: true
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#groupSelect').empty();
        var list = ret.datas;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Group);
        }
        $('#groupSelect').append(options);
        getProcessor(true);
    }, 0);
}

//获取操作员
function getProcessor(isFirst) {
    var groupId = $('#groupSelect').val();
    var data = {}
    data.opType = 1081;
    data.opData = JSON.stringify({
        groupId: groupId,
        menu: true
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#processorSelect').empty();
        var list = ret.datas;
        var option = '<option value="{0}">{1}</option>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Account, d.Processor);
        }
        $('#processorSelect').append(options);
        if (isFirst) {
            getCheckTask();
        }
    }, 0);
}

//获取检验任务
function getCheckTask() {
    var account, gId;
    if (_have404) {
        account = $('#processorSelect').val();
        if (isStrEmptyOrUndefined(account)) {
            layer.msg('请选择操作员');
            return;
        }
        gId = $('#groupSelect').val() || 0;
    } else {
        account = _admin;
        gId = 0;
    }
    _taskData = {
        Account: account,
        GId: gId
    }
    var data = {}
    data.opType = 1012;
    data.opData = JSON.stringify({ account, gId });
    ajaxPost('/Relay/Post', data, function (ret) {
        getCheckList(0, '#waitCheckList', 0);
        getCheckList(1, '#passCheckList', 0);
        getCheckList(2, '#redoCheckList', 0);
        getCheckList(3, '#blockCheckList', 0);
        $('#checkDetailBox').removeClass('hidden');
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            $('#startBtn,#pauseBtn,#boxContext').addClass('hidden');
            return;
        }
        $('#startBtn,#pauseBtn,#boxContext').removeClass('hidden');
        if (!ret.datas.length)
            return;
        var rData = ret.datas[0];
        _taskData.TaskId = rData.Id;
        var state = rData.State;
        $('#startBtn').prop('disabled', !(state == 2 || state == 7));
        $('#pauseBtn').prop('disabled', state != 8);
        state == 8 && _permissionList[403].have ? $('.finish').removeClass('hidden') : $('.finish').addClass('hidden');
        $('#check').text(rData.Check);
        $('#plan').text(rData.Plan);
        $('#item').text(rData.Item);
        $('#processor').text(rData.Processor);
        $('#checkProcessor').text(rData.CheckProcessor);
        $('#estimatedTime').text(rData.EstimatedTime);
        $('#actualStartTime').text(noShowSecond(rData.ActualStartTime));
        $('#actualEndTime').text(noShowSecond(rData.ActualEndTime));
        $('#score').text(rData.Score);
        $('#actualTime').text(rData.ActualTime);
        var order = function (a, b, c, d) {
            return d.row + 1;
        }
        var desc = function (data) {
            return `<textarea class="form-control desc" style="resize: vertical;margin:auto;width:200px" ${state != 8 ? 'disabled' : ''}>${data == null ? '' : data}</textarea>`;
        }
        var result = function (data) {
            var res = data.Result;
            var op = '<button type="button" class="btn btn-primary btn-{1} btn-sm" onclick="updateCheckTask.call(this,{0},1)" {3}>通过</button>' +
                '<button type="button" class="btn btn-primary btn-{2} btn-sm" onclick = "updateCheckTask.call(this,{0},2)" {3}>不通过</button>';
            return op.format(data.Id, res == 1 ? 'success' : 'info', res == 2 ? 'danger' : 'info', state != 8 ? 'disabled' : '');
        }
        var checkTime = function () {
            return `<input type="text" class="form_date form-control text-center checkTime" style="width:120px;cursor: pointer" ${state != 8 ? 'disabled' : ''}>`;
        }
        var img = function (data) {
            return `<button type="button" class="btn btn-primary btn-sm" onclick="showImgModel(\'${data.ImageList}\',${data.Id})" ${state != 8 ? 'disabled' : ''}>查看</button>`;
        }
        $('#checkTaskList').DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": rData.Items,
            "aaSorting": [[0, "asc"]],
            "aLengthMenu": [10, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 10, //默认显示的记录数
            "columns": [
                { "data": null, "title": "序号", "render": order },
                { "data": "Item", "title": "检验流程" },
                { "data": "Method", "title": "检验要求" },
                { "data": "Desc", "title": "检验说明", "render": desc, "sClass": "no-padding" },
                { "data": null, "title": "检验时间", "render": checkTime },
                { "data": null, "title": "检验结果", "render": result },
                { "data": null, "title": "图片", "render": img }
            ],
            "createdRow": function (row, data, index) {
                var time = data.CheckTime;
                time = time.slice(0, time.indexOf(' '));
                $(row).find('.form_date').attr("readonly", true).val(time == '0001-01-01' ? '' : time).datepicker({
                    language: 'zh-CN',
                    format: 'yyyy-mm-dd',
                    maxViewMode: 2,
                    todayBtn: "linked",
                    autoclose: true
                });
            }
        });
    });
}

var _taskData = null;
//检验任务开始 暂停 完成
function checkTaskHandle(apId, finishId) {
    var opType = null;
    switch (apId) {
        case 0:
            opType = 1017;
            break;
        case 1:
            opType = 1018;
            break;
        case 2:
            opType = 1019;
            _taskData.CheckResult = finishId;
            break;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify(_taskData);
    ajaxPost('/Relay/Post', data, function (ret) {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            getCheckTask();
        }
    });
}

//检验任务更新
function updateCheckTask(id, result) {
    var tr = $(this).parents('tr');
    var desc = tr.find('.desc').val();
    var checkTime = tr.find('.checkTime').val();
    checkTime = isStrEmptyOrUndefined(checkTime) ? getFullTime() : `${checkTime} 00:00:00`;
    var data = {}
    data.opType = 1020;
    data.opData = JSON.stringify({
        CheckTime: checkTime,
        Desc: desc,
        Result: result,
        Id: id,
        ItemId: _taskData.TaskId
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            getCheckTask();
        }
    });
}

var _updateFirmwareUpload = null;
var _imgNameData = null;
//图片详情模态框
function showImgModel(img, id) {
    if (_updateFirmwareUpload == null) {
        _updateFirmwareUpload = initFileInputMultiple("addImg", fileEnum.Manufacture);
    }
    $("#addImg").fileinput('clear');
    if (id != null) {
        $('#checkId').text(id);
        $('.noDetail').removeClass('hidden');
    } else {
        $('.noDetail').addClass('hidden');
    }
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
            type: fileEnum.Manufacture,
            files: JSON.stringify(img)
        };
        data.dir = "";
        for (var k in fileEnum) {
            if (fileEnum[k] == data.type) {
                data.dir = k;
                break;
            }
        }
        if (isStrEmptyOrUndefined(data.dir)) {
            return void layer.msg("文件类型不存在！");
        }

        getFilePath(data, paths => {
            const pLen = paths.length;
            if (pLen <= 0)
                return;
            var imgOp = `<div class="imgOption col-lg-2 col-md-3 col-sm-4 col-xs-6">
                    <div class="thumbnail">
                    <img src={0} style="height:200px">
                    <div class="caption text-center ${id == null ? 'hidden' : ''}">
                    <button type="button" class="btn btn-default glyphicon glyphicon-trash delImg" value="{1}"></button>
                    </div>
                    </div>
                    </div>`;
            var imgOps = "";
            for (let i = 0; i < pLen; i++) {
                imgOps += imgOp.format(paths[i].path, img[i]);
            }
            $("#imgOldList").append(imgOps);
        });
    }
    $('#addImgBox').find('.file-caption-name').attr('readonly', true).attr('placeholder', '请选择图片...');
    $('#showImgModel').modal('show');
}

//修改图片
function updateImg() {
    fileCallBack[fileEnum.Manufacture] = function (fileRet) {
        if (fileRet.errno == 0) {
            var img = [];
            for (var key in fileRet.data) {
                img.push(fileRet.data[key].newName);
            }
            var imgNew = _imgNameData.concat(img);
            imgNew = JSON.stringify(imgNew);
            var id = $('#checkId').text();
            var data = {}
            data.opType = 1020;
            data.opData = JSON.stringify({
                Images: imgNew,
                Id: id,
                ItemId: _taskData.TaskId
            });
            ajaxPost("/Relay/Post", data,
                function (ret) {
                    layer.msg(ret.errmsg);
                    $('#showImgModel').modal('hide');
                    if (ret.errno == 0) {
                        getCheckTask();
                    }
                });
        }
    };
    var doSth = function () {
        $('#addImg').fileinput("upload");
    }
    showConfirm("操作", doSth);
}

//获取待检验 检验通过 检验返工 阻塞表格数据
function getCheckList(num, el, cover = 1) {
    var opType = null;
    switch (num) {
        case 0:
            opType = 1013;
            break;
        case 1:
            opType = 1014;
            break;
        case 2:
            opType = 1015;
            break;
        case 3:
            opType = 1016;
            break;
    }
    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
        account: _taskData.Account,
        limit: 10,
        gId: _taskData.GId
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var order = function (a, b, c, d) {
            return d.row + 1;
        }
        var detail = function (data) {
            return `<button type="button" class="btn btn-primary btn-sm" onclick="showDetailModel(${data})">查看</button>`;
        }
        $(el).DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": rData,
            "aaSorting": [[0, "asc"]],
            "aLengthMenu": [10, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 10, //默认显示的记录数
            "columns": [
                { "data": null, "title": "序号", "render": order },
                { "data": "Item", "title": "检验单名称" },
                { "data": "Plan", "title": "所属计划号" },
                { "data": "Score", "title": "任务绩效分" },
                { "data": "Surveyor", "title": "任务完成人" },
                { "data": "Id", "title": "任务流程", "render": detail }
            ]
        });
    }, cover);
}

//检验详情
function showDetailModel(id) {
    var data = {}
    data.opType = 1021;
    data.opData = JSON.stringify({
        qId: id
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var order = function (a, b, c, d) {
            return d.row + 1;
        }
        var checkTime = function (data) {
            return noShowSecond(data);
        }
        var result = function (d) {
            return d.Result == 0 ? d.ResultDesc : d.Result == 1 ? '通过' : '不通过';
        }
        var img = function (data) {
            return `<button type="button" class="btn btn-primary btn-sm" onclick="showImgModel(\'${data}\')">查看</button>`;
        }
        $('#showDetailList').DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": rData,
            "aaSorting": [[0, "asc"]],
            "aLengthMenu": [10, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 10, //默认显示的记录数
            "columns": [
                { "data": null, "title": "序号", "render": order },
                { "data": "Item", "title": "检验流程" },
                { "data": "Method", "title": "检验要求" },
                { "data": "Desc", "title": "检验说明" },
                { "data": "CheckTime", "title": "检验时间", "render": checkTime },
                { "data": null, "title": "检验结果", "render": result },
                { "data": "ImageList", "title": "图片", "render": img }
            ]
        });
        $('#showDetailModel').modal('show');
    });
}