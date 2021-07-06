var _permissionList = [];
function pageReady() {
    _permissionList[444] = { uIds: ['addGroupBtn'] };
    _permissionList[445] = { uIds: [] };
    _permissionList[446] = { uIds: ['deleteGroupBtn'] };
    _permissionList[447] = { uIds: ['addGroupProcessorBtn'] };
    _permissionList[448] = { uIds: ['deleteGroupProcessorBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
    if (!_permissionList[445].have) {
        $('.updateGroup').addClass('hidden');
    }
    $(".ms2").select2({ matcher });
    $(".ms3").select2({
        matcher,
        allowClear: true,
        placeholder: "请选择",
        multiple: true
    });
    $('#GroupName').val('');
    $('#DayViv').addClass("hidden");
    $('#Day1').html(getDate());
    $('#Day2').html(getDate());
    $('#Day').empty();
    var options = "";
    for (var i = 1; i < 29; i++) {
        options += option.format(i, i);
    }
    $('#Day').append(options);

    $('#DateTypeSelect').on('change', function () {
        initTime();
    });
    $('#Day').on('change', function () {
        initTime();
    });
    $('#GroupSelect').on('select2:select', function () {
        $('#GroupName').val($(this).find("option:checked").text());
        var groupId = $(this).val();
        var group = _groups[groupId];
        if (group) {
            $("#DateTypeSelect").val(group.Interval);
            $("#Day").val(group.ScoreTime);
            initTime();
        }
        initProcessorSelect(groupId);
    });

    init();
}
var option = '<option value = "{0}">{1}</option>';
//groupId!=0 修改
function init(groupId = 0, groupName = false) {
    if (groupId == -1) {
        groupId = $("#GroupSelect").val();
    }
    var groupFunc = new Promise(function (resolve, reject) {
        getGroupList(resolve, groupId);
    });
    var allProcessorFunc = new Promise(function (resolve, reject) {
        if (groupName) {
            resolve('success');
            return;
        }
        getAllProcessorList(resolve);
    });
    var surveyorFunc = new Promise(function (resolve, reject) {
        if (groupName) {
            resolve('success');
            return;
        }
        initProcessorSelect(groupId, resolve);
    });

    var func = [groupFunc, allProcessorFunc];
    if (groupId != 0) {
        func.push(surveyorFunc);
    }
    Promise.all(func)
        .then((result) => {
            var group = _groups[groupId];
            if (group) {
                $("#DateTypeSelect").val(group.Interval);
                $("#Day").val(group.ScoreTime);
            }
        });
}

function initTime() {
    var v = $('#DateTypeSelect').val();
    if (v == 2) {
        $('#DayViv').removeClass("hidden");
    } else {
        $('#DayViv').addClass("hidden");
    }
    switch (v) {
        case "0":
            $('#Day1').html(getDate());
            $('#Day2').html(getDate()); break;
        case "1":
            var week = getNowWeekRange(new Date().getDay() == 0 ? 7 : new Date().getDay());
            $('#Day1').html(week.start);
            $('#Day2').html(week.end); break;
        case "2":
            var month = getNowMonthRange($("#Day").val());
            $('#Day1').html(month.start);
            $('#Day2').html(month.end); break;
        default:
    }
}

var _groups = null;
var _allProcessors = null;
var _allProcessorOptions = "";
//获取分组
function getGroupList(resolve, groupId = 0) {
    var data = {}
    data.opType = 1077;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (resolve != null)
            resolve('success');

        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#GroupSelect').empty();
        var list = ret.datas;
        _groups = [];
        var i, len = list.length;
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Group);
            _groups[d.Id] = d;
        }
        $('#GroupSelect').append(options);
        $('#GroupSelect').val(groupId).trigger("change");
    });
}

//获取操作工
function getAllProcessorList(resolve) {
    ajaxPost("/Relay/Post", {
        opType: 248,
        opData: JSON.stringify({
            menu: true
        })
    }, ret => {
        if (resolve != null)
            resolve('success');

        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        _allProcessors = ret.datas;
    }, 0);
}

function initProcessorSelect(groupId, resolve = null) {
    $('#ProcessorSelect').empty();
    if (!isStrEmptyOrUndefined(groupId)) {
        var data = {}
        data.opType = 1081;
        data.opData = JSON.stringify({
            groupId: groupId,
            menu: true
        });
        ajaxPost("/Relay/Post", data, function (ret) {
            if (resolve != null)
                resolve('success');
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var list = ret.datas;
            $('#ProcessorSelect').html(setOptions(list, "Processor"));
            var newList = _allProcessors.filter(x => !list.filter(y => y.ProcessorId == x.Id).length);
            $('#AllProcessorSelect').html(setOptions(newList, "Name"));
        });
    }
}

//删除分组
function deleteGroup() {
    var groupId = $("#GroupSelect").val();
    if (isStrEmptyOrUndefined(groupId)) {
        return;
    }
    showConfirm("删除项目组：" + $("#GroupSelect option:selected").text(),
        () => {
            ajaxPost("/Relay/Post", {
                opType: 1080,
                opData: JSON.stringify({
                    ids: [groupId]
                })
            }, ret => {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    init();
                }
            });
        });
}

//添加分组
function addGroup() {
    var groupName = $("#GroupName").val();
    var oldGroupName = $("#GroupSelect option:selected").text();
    if (isStrEmptyOrUndefined(groupName)) {
        layer.msg("组名不能为空");
        return;
    }
    if (groupName == oldGroupName) {
        return;
    }

    showConfirm("新增项目组：" + groupName,
        () => {
            ajaxPost("/Relay/Post", {
                opType: 1079,
                opData: JSON.stringify({
                    Group: groupName
                })
            }, ret => {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    var groupId = $("#GroupSelect").val();
                    if (isStrEmptyOrUndefined(groupId)) {
                        groupId = 0;
                    }
                    init(groupId, true);
                }
            });
        });
}

//修改分组
function updateGroup() {
    var groupName = $("#GroupName").val();
    var oldGroupName = $("#GroupSelect option:selected").text();
    var groupId = $("#GroupSelect").val();
    if (isStrEmptyOrUndefined(groupId)) {
        layer.msg("请选择项目组");
        return;
    }
    if (isStrEmptyOrUndefined(groupName)) {
        layer.msg("组名不能为空");
        return;
    }
    if (groupName == oldGroupName) {
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = 1078;
        data.opData = JSON.stringify({
            Id: groupId,
            Group: groupName,
            IsName: true
        });

        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    init(groupId, true);
                }
            });
    }
    showConfirm("修改项目组：" + $("#GroupSelect option:selected").text(), doSth);
}

//修改排名时间
function updateGroupTime() {
    var dayType = $("#DateTypeSelect").val();
    var day = $("#Day").val();
    var groupId = $("#GroupSelect").val();
    if (isStrEmptyOrUndefined(groupId)) {
        layer.msg("请选择项目组");
        return;
    }
    if (isStrEmptyOrUndefined(dayType) || isStrEmptyOrUndefined(day)) {
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = 1078;
        data.opData = JSON.stringify({
            Id: groupId,
            Interval: dayType,
            ScoreTime: day,
            IsName: false
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    init(groupId, true);
                }
            });
    }
    showConfirm("修改项目组：" + $("#GroupSelect option:selected").text(), doSth);
}

//删除分组成员
function deleteGroupProcessor() {
    var groupId = $("#GroupSelect").val();
    if (isStrEmptyOrUndefined(groupId)) {
        layer.msg("请选择项目组");
        return;
    }
    var processorId = $("#ProcessorSelect").val();
    if (isStrEmptyOrUndefined(processorId)) {
        return;
    }

    var doSth = function () {
        var data = {}
        data.opType = 1083;
        data.opData = JSON.stringify({
            ids: [processorId]
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    initProcessorSelect(groupId);
                }
            });
    }
    showConfirm("删除成员：" + $("#ProcessorSelect option:selected").text(), doSth);
}

//添加分组成员
function addGroupProcessor() {
    var groupId = $("#GroupSelect").val();
    if (isStrEmptyOrUndefined(groupId)) {
        layer.msg("请选择项目组");
        return;
    }

    var processorId = $("#AllProcessorSelect").val();
    if (isStrEmptyOrUndefined(processorId)) {
        return;
    }
    if (processorId.length <= 0) {
        layer.msg("请选择成员");
        return;
    }
    var opData = new Array();
    for (var i = 0; i < processorId.length; i++) {
        opData.push({
            GroupId: groupId,
            ProcessorId: processorId[i]
        });
    }
    var doSth = function () {
        var data = {}
        data.opType = 1082;
        data.opData = JSON.stringify(opData);

        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    initProcessorSelect(groupId);
                }
            });
    }
    showConfirm("新增成员：" + $("#AllProcessorSelect option:selected").text(), doSth);
}