function pageReady() {
    $(".ms2").select2();
    $(".ms3").select2({
        allowClear: true,
        placeholder: "请选择",
        multiple: true
    });
    $("#6sGroupChangeCheck").iCheck('uncheck');

    $("#6sGroupChangeCheck").on("ifChanged", function (event) {
        if ($(this).is(":checked")) {
            $("#6sGroupChangeDiv").removeClass("hidden");
        } else {
            $("#6sGroupChangeDiv").addClass("hidden");
        }
    });

    $('#6sGroupSelect').on('select2:select', function () {
        initSurveyorSelect();
        getItemList();
    });

    init();
}

//groupId!=0 修改
function init(groupId = 0) {
    var groupFunc = new Promise(function (resolve, reject) {
        getGroupList(resolve, groupId);
    });
    var surveyorFunc = new Promise(function (resolve, reject) {
        getSurveyorList(resolve);
    });
    Promise.all([groupFunc, surveyorFunc])
        .then((result) => {
            //console.log('准备工作完毕');
            //console.log(result);
            initSurveyorSelect();
            getItemList();
        });
}

var _groups = null;
var _surveyors = null;
var _surveyorOptions = "";
function _6sGroupChangeLabel() {
    var new6sGroup = $("#new6sGroupTxt").val();
    if (isStrEmptyOrUndefined(new6sGroup)) {
        $("#6sGroupChangeCheck").iCheck($("#6sGroupChangeCheck").is(":checked") ? 'uncheck' : 'check');
    }
}

function new6sGroupTxt() {
    var new6sGroup = $("#new6sGroupTxt").val();
    if (!isStrEmptyOrUndefined(new6sGroup)) {
        $("#6sGroupChangeCheck").iCheck('uncheck');
        $("#6sGroupChangeDiv").addClass("hidden");
        $("#6sGroupSelect").attr("disabled", "disabled");
        $("#6sGroupChangeCheck").attr("disabled", "disabled");
        $("#6sGroupChangeCheckLbl").attr("disabled", "disabled");
        //$("#surveyorSelect").val('').trigger("change");
    } else {
        $("#6sGroupSelect").removeAttr("disabled");
        $("#6sGroupChangeCheck").removeAttr("disabled");
        $("#6sGroupChangeCheckLbl").removeAttr("disabled");
        //initSurveyorSelect();
    }
}

//获取6s分组
function getGroupList(resolve, groupId = 0) {
    var opType = 900;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }

    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (resolve != null)
            resolve('success');

        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#6sGroupSelect').empty();
        var list = ret.datas;
        _groups = list;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Group);
        }
        $('#6sGroupSelect').append(options);
        $('#6sGroupSelect').val(groupId).trigger("change");
    });
}

//获取检查员
function getSurveyorList(resolve) {
    var opType = 254;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }

    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (resolve != null)
            resolve('success');

        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#surveyorSelect').empty();
        var list = ret.datas;
        _surveyors = list;
        var i, len = list.length;
        var option = '<option value = "{0}">{1}</option>';
        var options = '';
        for (i = 0; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.SurveyorName);
        }
        _surveyorOptions = options;
        $('#surveyorSelect').append(options);
    });
}

function initSurveyorSelect() {
    $("#surveyorSelect").val('').trigger("change");
    var groupId = $("#6sGroupSelect").val();
    if (!isStrEmptyOrUndefined(groupId)) {
        if (_groups && _groups.length > 0) {
            for (var i = 0; i < _groups.length; i++) {
                var group = _groups[i];
                if (group.Id == groupId) {
                    $("#surveyorSelect").attr("old", group.SurveyorId);
                    $("#surveyorSelect").val(group.SurveyorId.split(",")).trigger("change");
                }
            }
        }
    }
}

var itemMax = 0;
var itemMaxV = 0;
var item = null;
//获取6s检查项
function getItemList() {
    $("#itemList").empty();
    var opType = 904;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var qId = $("#6sGroupSelect").val();
    if (!isStrEmptyOrUndefined(qId)) {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            qId: qId
        });
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            item = ret.datas;
            initItemList();
        });
    }
}

function initItemList() {
    $("#6sGroupChangeCheck").iCheck('uncheck');
    $("#6sGroupChangeDiv").addClass("hidden");
    $("#6sGroupChangeTxt").val('');
    $("#itemList").empty();
    itemMax = itemMaxV = 0;
    if (item && item.length > 0) {
        itemMax = itemMaxV = item.length;
        var trs = "";
        for (var j = 0; j < item.length; j++) {
            var xh = j + 1;
            var data = item[j];
            var tr =
                `<tr id="item${xh}" value="${xh}" xh="${xh}" itemId="${data.Id}">
                    <td style="width:50px;">
                       <input id="itemChose${xh}" type="checkbox" class="icb_minimal chose">
                    </td>
                    <td style="width:50px;" id="itemXh${xh}">
                        ${xh}
                    </td>
                    <td style="width:80px;">
                        <span class="chose1" id ="itemOrder1${xh}">${data.Order}</span >
                        <input class="chose2 hidden form-control text-center" old="${data.Order}" id="itemOrder2${xh}" style="width:80px;" type="tel" value="0" onkeyup="onInput(this, 8, 0)" onblur="onInputEnd(this)" maxlength="10">
                    </td>
                    <td style="width:200px;">
                        <span class="chose1" id ="itemName1${xh}">${data.Item}</span >
                        <input class="chose2 hidden form-control text-center" old="${data.Item}" id="itemName2${xh}" maxlength="100">
                    </td>
                    <td style="width:80px;">
                        <input id="itemEnable${xh}" old="${data.Enable}" type="checkbox" class="icb_minimal enable">
                    </td>
                    <td style="width:80px;">
                        <span class="chose1" id ="itemStandard1${xh}">${data.Standard}</span >
                        <input class="chose2 hidden form-control text-center" old="${data.Standard}" id="itemStandard2${xh}" style="width:80px;" type="tel" value="0" onkeyup="onInput(this, 8, 0)" onblur="onInputEnd(this)" maxlength="10">
                    </td>
                    <td class="no-padding">
                    ${(data.Reference.length > tdShowLength ?
                        `<span id="itemReference1${xh}" title="${data.Reference}" class="chose1" onclick = "showAllContent('${escape(data.Reference)}', '要求及目标')">${data.Reference.substring(0, tdShowLength)}...</span>` :
                        `<span id="itemReference1${xh}" title="${data.Reference}" class="chose1">${data.Reference}</span>`) +
                        `<textarea id="itemReference2${xh}" old="${data.Reference}" class="chose2 hidden form-control" maxlength = "500" style = "resize: vertical;margin:auto" ></textarea>`}
                    </td>
                    <td style="width:100px;">
                        <span class="chose1" id ="itemInterval1${xh}" interval="${data.Interval}" day="${data.Day}" week="${data.Week}">${(data.Interval == 0 ? "" : (data.Interval == 1 ? `${data.Day}天/次` : `${data.Week}周/次`))}</span >
                        <div class="chose2 hidden form-inline" interval="${data.Interval}" day="${data.Day}" week="${data.Week}">
                            <input class="form-control" id ="itemInterval21${xh}" maxlength="3" onkeyup="onInput(this, 8, 0)" onblur="onInputEnd(this)" style="width:50px" value="1">
                            <select class="form-control" id ="itemInterval22${xh}">
                               <option value="1">天</option>
                               <option value="2">周</option>
                            </select>
                        </div>
                    </td>
                    <td style="width:100px;">
                        <span class="chose1" id="itemPerson1${xh}" old="${data.Person}">${data.SurveyorName}</span>
                        <div class="chose2 hidden">
                            <select class="ms2 form-control" id ="itemPerson2${xh}" old="${data.Person}">
                               ${_surveyorOptions}
                            </select>
                        </div>
                    </td>
                    <td style="width:50px;">
                        <button type="button" class="btn btn-danger btn-sm" id="delItemList${xh}" onclick="delItemList(${xh})"><i class="fa fa-minus"></i></button>
                    </td>
                </tr>`;
            trs += tr;
        }
        $("#itemList").append(trs);

        $("#itemList .ms2").select2({
            width: "120px"
        });
        $("#itemList .chose").iCheck({
            handle: 'checkbox',
            checkboxClass: 'icheckbox_minimal-red',
            increaseArea: '20%'
        });
        $("#itemList .enable").iCheck({
            handle: 'checkbox',
            checkboxClass: 'icheckbox_polaris',
            increaseArea: '20%'
        }).iCheck('disable');
        $("#itemList .enable[old='true']").iCheck('check');
        //$("#itemList .enabled").iCheck("disable");
        $("#itemList .chose").on("ifChanged", function (event) {
            var tr = $(this).parents("tr:first");
            var v = tr.attr("value");
            if ($(this).is(":checked")) {
                tr.find(".chose1").addClass("hidden");
                tr.find(".chose2").removeClass("hidden");
                $("#itemEnable" + v).iCheck($("#itemEnable" + v).attr("old") == "true" ? 'check' : 'uncheck').iCheck('enable');
                $("#itemOrder2" + v).val($("#itemOrder2" + v).attr("old"));
                $("#itemName2" + v).val($("#itemName2" + v).attr("old"));
                $("#itemStandard2" + v).val($("#itemStandard2" + v).attr("old"));
                $("#itemReference2" + v).val($("#itemReference2" + v).attr("old"));
                var td = $("#itemInterval21" + v).parents("div:first");
                var interval = $(td).attr("interval");
                var num = interval == 0 ? "" : (interval == 1 ? $(td).attr("day") : $(td).attr("week"));
                $("#itemInterval21" + v).val(num);
                $("#itemInterval22" + v).val(interval);
                $("#itemPerson2" + v).val($("#itemPerson2" + v).attr("old")).trigger("change");
            } else {
                tr.find(".chose1").removeClass("hidden");
                tr.find(".chose2").addClass("hidden");
                tr.find(".enable").iCheck('disable');
                $("#itemEnable" + v).iCheck($("#itemEnable" + v).attr("old") == "true" ? 'check' : 'uncheck').iCheck('disable');
            }
        });
    }
}

var itemLength = 0;
//重置
function resetItemList() {
    var new6sGroupTxt = $("#new6sGroupTxt").val();
    if (!isStrEmptyOrUndefined(new6sGroupTxt)) {
        $("#6sGroupSelect").val(0).trigger("change");
        item = null;
    }
    itemMax = itemMaxV = 0;
    initItemList();
}

//添加一行
function addOneItemList() {
    //itemList
    itemMax++;
    itemMaxV++;
    var xh = itemMax;
    var tr = `
            <tr id="item${xh}" value="${xh}" xh="${itemMaxV}" itemId="0">
                <td style="width:50px;">
                </td>
                <td style="width:50px;" id="itemXh${xh}">
                    ${itemMaxV}
                </td>
                <td style="width:50px;">
                    <input class="form-control text-center" type="tel" id="itemOrder2${xh}" value="${itemMaxV}" onkeyup="onInput(this, 8, 0)" onblur="onInputEnd(this)" maxlength="10">
                </td>
                <td style="width:200px;">
                    <input class="form-control text-center" id="itemName2${xh}" maxlength="100">
                </td>
                <td style="width:50px;">
                    <input id="itemEnable${xh}" type="checkbox" class="icb_minimal enable">
                </td>
                <td style="width:100px;">
                    <input class="form-control text-center" id="itemStandard2${xh}" value="0" onkeyup="onInput(this, 8, 0)" onblur="onInputEnd(this)" maxlength="10" style="width:100px;">
                </td>
                <td class="no-padding">
                    <textarea id="itemReference2${xh}" class= "form-control" maxlength = "500" style = "resize: vertical;margin:auto"></textarea >
                </td>
                <td style="width:100px;">
                    <div class="form-inline">
                        <input class="form-control" id ="itemInterval21${xh}" maxlength="3" onkeyup="onInput(this, 8, 0)" onblur="onInputEnd(this)" style="width:50px" value="1">
                        <select class="form-control" id ="itemInterval22${xh}">
                           <option value="1">天</option>
                           <option value="2">周</option>
                        </select>
                    </div>
                </td>
                <td style="width:100px;">
                    <select class="ms2 form-control" id ="itemPerson2${xh}" style="width:60px">
                       ${_surveyorOptions}
                    </select>
                </td>
                <td style="width:50px;">
                    <button type="button" class="btn btn-danger btn-sm" id="delItemList${xh}" onclick="delItemList(${xh})"><i class="fa fa-minus"></i></button>
                </td>
            </tr>`;
    $("#itemList").append(tr);
    var selector = "#item" + xh;
    $(selector).find(".ms2").select2({
        width: "120px"
    });
    $(selector).find(".enable").iCheck({
        handle: 'checkbox',
        checkboxClass: 'icheckbox_polaris',
        increaseArea: '20%'
    }).iCheck('check');
}

//删除一行
function delItemList(id) {
    $("#itemList").find(`tr[value=${id}]:first`).remove();
    itemMaxV--;
    var o = 1;
    var child = $("#itemList tr");;
    for (var i = 0; i < child.length; i++) {
        $(child[i]).attr("xh", o);
        var v = $(child[i]).attr("value");
        $("#itemXh" + v).html(o);
        o++;
    }
}

//保存和修改
function saveItemList() {
    var new6sGroupTxt = $("#new6sGroupTxt").val();
    var _6sGroupChangeTxt = $("#6sGroupChangeTxt").val();
    var surveyorIds = $("#surveyorSelect").val();
    var group = {};
    var groupId = 0;
    var opType = 0;
    var change = false;
    if (isStrEmptyOrUndefined(new6sGroupTxt)) {
        //更新
        opType = 901;
        groupId = $("#6sGroupSelect").val();
        if (isStrEmptyOrUndefined(groupId)) {
            layer.msg("请选择分组");
            return;
        }
        group.Id = groupId;
        if ($("#6sGroupChangeCheck").is(":checked")) {
            if ($("#6sGroupSelect option:selected").text() != _6sGroupChangeTxt) {
                change = true;
                group.Group = _6sGroupChangeTxt;
            }
        }
    } else if (!isStrEmptyOrUndefined(new6sGroupTxt)) {
        //新增
        opType = 902;
        change = true;
        group.Group = new6sGroupTxt;
    } else {
        return;
    }

    var oldSurveyorId = isStrEmptyOrUndefined($("#surveyorSelect").attr("old")) ? "" : $("#surveyorSelect").attr("old");
    var newSurveyorId = surveyorIds == null ? "" : surveyorIds.join();
    if (opType == 901 && oldSurveyorId != newSurveyorId) {
        change = true;
    }
    group.SurveyorId = newSurveyorId;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }

    var list = new Array();
    var i;
    //已存在
    var l = 0;
    //新增
    var al = 0;
    for (i = 1; i <= itemMax; i++) {
        if ($("#item" + i).length > 0) {
            var itemId = $("#item" + i).attr("itemId");
            var itemOrder, itemName, itemEnable, itemStandard, itemReference, itemInterval, itemDay, itemWeek, itemPerson;
            var t = 0;
            if (itemId == 0) {
                t = 2;
                al++;
            } else {
                l++;
                if ($("#itemChose" + i).is(":checked")) {
                    t = 2;
                    change = true;
                } else {
                    t = 1;
                }
            }

            if (t == 1) {
                itemOrder = $("#itemOrder1" + i).html();
                itemName = $("#itemName1" + i).html();
                itemEnable = $("#itemEnable" + i).is(":checked");
                itemStandard = $("#itemStandard1" + i).html();
                itemReference = $("#itemReference1" + i).attr("title");
                itemInterval = $("#itemInterval1" + i).attr("interval");
                itemDay = $("#itemInterval1" + i).attr("day");
                itemWeek = $("#itemInterval1" + i).attr("week");
                itemPerson = $("#itemPerson1" + i).attr("old");
            } else if (t == 2) {
                itemOrder = $("#itemOrder2" + i).val();
                itemName = $("#itemName2" + i).val();
                itemEnable = $("#itemEnable" + i).is(":checked");
                itemStandard = $("#itemStandard2" + i).val().trim();
                itemReference = $("#itemReference2" + i).val().trim();
                itemInterval = $("#itemInterval22" + i).val().trim();
                if (itemInterval == 1) {
                    itemDay = $("#itemInterval21" + i).val().trim();
                    itemWeek = 0;
                } else {
                    itemDay = 0;
                    itemWeek = $("#itemInterval21" + i).val().trim();
                }
                itemPerson = $("#itemPerson2" + i).val();
            } else {
                return;
            }
            if (isStrEmptyOrUndefined(itemOrder)) {
                layer.msg("请输入顺序");
                return;
            }
            if (isStrEmptyOrUndefined(itemName)) {
                layer.msg("请输入检查项目");
                return;
            }
            if (isStrEmptyOrUndefined(itemStandard)) {
                layer.msg("请输入标准分");
                return;
            }
            if (itemDay + itemWeek <= 0) {
                layer.msg("请输入频次");
                return;
            }

            list.push({
                Id: itemId,
                Order: itemOrder,
                Item: itemName,
                GroupId: groupId,
                Enable: itemEnable,
                Standard: itemStandard,
                Reference: itemReference,
                Interval: itemInterval,
                Day: itemDay,
                Week: itemWeek,
                Person: itemPerson
            });
        }
    }
    group.Items = list;
    if (al > 0 || (opType == 901 && l != item.length))
        change = true;
    if (!change)
        return;
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(group);

        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    init(groupId);
                }
            });
    }
    showConfirm("保存", doSth);
}

//删除一行
function delGroup() {
    var opType = 903;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }

    var groupId = $("#6sGroupSelect").val();
    if (isStrEmptyOrUndefined(groupId)) {
        layer.msg("请选择分组");
        return;
    }

    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            ids: [groupId]
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    init();
                }
            });
    }
    showConfirm("删除分组：" + $("#6sGroupSelect option:selected").text(), doSth);
}

