var _permissionList = [];
function pageReady() {
    _permissionList[627] = { uIds: ['reportBtn'] };
    _permissionList[628] = { uIds: ['updateImgBtn'] };
    _permissionList[629] = { uIds: ['groupRankBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
    $(".ms2").select2();
    $('#_6sCondition1').on('change', function () {
        $('#_6sCondition2').empty();
        var v = $(this).val();
        var options = "";
        if (v == 0) {
            options =
                `<option value="0">等于</option>`;
        } else if (v == 1) {
            options =
                `<option value="0">等于</option>
                <option value="1">包含</option>`;
        } else if (v == 2) {
            options =
                `<option value="0">等于</option>
                <option value="1">大于</option>
                <option value="2">小于</option>`;
        } else if (v == 3) {
            options =
                `<option value="0">等于</option>
                <option value="1">大于</option>
                <option value="2">小于</option>`;
        }
        $('#_6sCondition2').append(options);
        $('#_6sConditionDiv div').addClass(" hidden");
        $('#_6sConditionDiv .' + v).removeClass(" hidden");
    });

    $("#_6sItemTime").val(getDate());
    $("#_6sItemTime").datepicker('update').on('changeDate', function (ev) {
        showItem();
    });
    $("#_6sItemCheckTime1").val(getDate());
    $("#_6sItemCheckTime1").datepicker('update').on('changeDate', function (ev) {
        getItemList();
    });
    $("#_6sItemCheckTime2").val(getDate());
    $("#_6sItemCheckTime2").datepicker('update').on('changeDate', function (ev) {
        getItemList();
    });
    $('#6sGroupSelect').on('select2:select', function () {
        getItemList();
    });

    $('#_6sItemPerson').on('select2:select', function () {
        showItem();
    });

    init();


    $("#_6sGroupRankTime1").val(getDate());
    $("#_6sGroupRankTime1").datepicker('update').on('changeDate', function (ev) {
        groupRank(false, false);
    });

    $("#_6sGroupRankTime2").val(getDate());
    $("#_6sGroupRankTime2").datepicker('update').on('changeDate', function (ev) {
        groupRank(false, false);
    });

    $("#_6sGroupPersonRankTime1").val(getDate());
    $("#_6sGroupPersonRankTime1").datepicker('update').on('changeDate', function (ev) {
        var groupId = $("#_6sGroupGroupId").html();
        var group = $("#_6sGroupGroup").html();
        groupPersonRank(groupId, group, false, false);
    });
    $("#_6sGroupPersonRankTime2").val(getDate());
    $("#_6sGroupPersonRankTime2").datepicker('update').on('changeDate', function (ev) {
        var groupId = $("#_6sGroupGroupId").html();
        var group = $("#_6sGroupGroup").html();
        groupPersonRank(groupId, group, false, false);
    });

    $("#_6sGroupPersonItemRankTime1").val(getDate());
    $("#_6sGroupPersonItemRankTime1").datepicker('update').on('changeDate', function (ev) {
        var groupId = $("#_6sGroupGroupId").html();
        var person = $("#_6sGroupPersonId").html();
        groupPersonItemRank(groupId, person, false, false);
    });
    $("#_6sGroupPersonItemRankTime2").val(getDate());
    $("#_6sGroupPersonItemRankTime2").datepicker('update').on('changeDate', function (ev) {
        var groupId = $("#_6sGroupGroupId").html();
        var person = $("#_6sGroupPersonId").html();
        groupPersonItemRank(groupId, person, false, false);
    });

    $('#imgOldList').on('click', '.delImg', function () {
        $(this).parents('.imgOption').remove();
        var e = $(this).val();
        _imgNameData.splice(_imgNameData.indexOf(e), 1);
    });
}

function init() {
    var groupFunc = new Promise(function (resolve, reject) {
        getGroupList(resolve);
    });
    var surveyorFunc = new Promise(function (resolve, reject) {
        getSurveyorList(resolve);
    });
    Promise.all([groupFunc, surveyorFunc])
        .then((result) => {
            //console.log('准备工作完毕');
            //console.log(result);
            getItemList();
        });
}

var _groups = null;
//获取6s分组
function getGroupList(resolve) {
    var data = {}
    data.opType = 900;
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
    });
}

var _surveyors = null;
var _surveyorOptions = "";
//获取检查员
function getSurveyorList(resolve) {
    var data = {}
    data.opType = 254;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (resolve != null)
            resolve('success');

        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
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
    });
}

var lastGroupId = 0;
var items = null;
var showItems = null;
//获取6s检查项
function getItemList() {
    $("#6sGroupScore").html(0);
    $("#6sGroupAll").html(0);
    $("#6sGroupCount").html(0);
    $("#itemList").empty();
    var gId = $("#6sGroupSelect").val();
    var sTime = $("#_6sItemCheckTime1").val();
    var eTime = $("#_6sItemCheckTime2").val();
    if (!isStrEmptyOrUndefined(gId) && !isStrEmptyOrUndefined(sTime) && !isStrEmptyOrUndefined(eTime)) {
        var data = {}
        data.opType = 920;
        data.opData = JSON.stringify({
            gId: gId,
            sTime: sTime,
            eTime: eTime
        });
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            items = ret.datas;
            if (lastGroupId != gId) {
                $("#_6sItemPerson").empty();
                var persons = new Array();
                var option = '<option value="{0}">{0}</option>';
                var options = option.format("所有");
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var person = item.PersonName;
                    if (persons.indexOf(person) == -1) {
                        persons.push(person);
                        options += option.format(person);
                    }
                }
                $("#_6sItemPerson").append(options);
            }

            lastGroupId = gId;
            showItem();
        });
    }
}

function showItem() {
    //<option value="0">负责人</option>等于
    //<option value="1">检查项目</option>等于、包含
    //<option value="2">截止时间</option>等于、大于、小于
    //<option value="3">评分</option>等于、大于、小于
    var _6sCondition1 = $("#_6sCondition1").val();
    var _6sCondition2 = $("#_6sCondition2").val();

    var className = "";
    var condition = "";
    switch (_6sCondition1) {
        case "0":
            className = "PersonName";
            condition = $("#_6sItemPerson").val();
            break;
        case "1":
            className = "Item";
            condition = $("#_6sItemName").val();
            break;
        case "2":
            className = "CheckTime";
            condition = $("#_6sItemTime").val();
            if (condition == "")
                return;
            break;
        case "3":
            className = "Score";
            condition = $("#_6sItemScore").val();
            break;
    }
    if (items) {
        showItems = new Array();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var v = item[className];
            if (className == "CheckTime") {
                if (v.Check)
                    v = v.split(' ')[0];
                else
                    v = "";
            }
            if (_6sCondition2 == 0) {//等于
                if (_6sCondition1 != 0) {
                    if (condition == "") {
                        showItems.push(item);
                        continue;
                    }
                    if (v == condition) {
                        showItems.push(item);
                    }
                } else {
                    if (condition != "所有") {
                        if (v == condition) {
                            showItems.push(item);
                        }
                    } else {
                        showItems.push(item);
                    }
                }
            } else if (_6sCondition2 == 1) {
                if (_6sCondition1 != 1) {
                    if (v > condition) {//大于
                        showItems.push(item);
                    }
                } else {//包含
                    if (v.indexOf(condition) > -1) {
                        showItems.push(item);
                    }
                }
            } else if (_6sCondition2 == 2) {
                if (v < condition) {//小于
                    showItems.push(item);
                }
            }
        }
        initItemList();
    }
}

function initItemList() {
    $("#itemList").empty();

    var totalScore = 0;
    var all = 0;
    var count = 0;
    if (showItems && showItems.length > 0) {
        all = showItems.length;
        for (var i = 0; i < showItems.length; i++) {
            var item = showItems[i];
            if (item.Check) {
                totalScore += item.Score;
                count++;
            }
        }
        var isEnable = function (data, type, row, meta) {
            var xh = meta.row;
            return `<input type="checkbox" value="${xh}" class="icb_minimal chose" id="itemChose${xh}">`;
        }
        var order = function (a, b, c, d) {
            return ++d.row;
        }
        var reference = function (data) {
            return data.length > tdShowLength
                ? `<span title="${data}" onclick = "showAllContent('${escape(data)}', '要求及目标')">${data.substring(0, tdShowLength)}...</span>`
                : `<span title="${data}">${data}</span>`;
        }
        var interval = function (data) {
            return `<span>${(data.Interval == 0 ? "" : (data.Interval == 1 ? `${data.Day}天/次` : `${data.Week}周/次`))}</span>`;
        }
        var plannedTime = function (data) {
            return data.PlannedTime.slice(0, data.PlannedTime.indexOf(' '));
        }
        var surveyor = function (data, type, row, meta) {
            var xh = meta.row;
            return `<span title="${data.SurveyorName}" class="chose1">${data.SurveyorName}</span>
                    <div class="chose2 hidden">
                        <select class="ms2 form-control" id="itemSurveyor${xh}" old="${data.SurveyorId}" style="width:60px">
                            ${_surveyorOptions}
                        </select>
                    </div>`;
        }
        var checkTime = function (data, type, row, meta) {
            var xh = meta.row;
            return `<span class="chose1">${(data.Check ? data.CheckTime.slice(0, data.CheckTime.indexOf(' ')) : "")}</span>` +
                `<input class="chose2 hidden form_date form-control text-center" type="text" itemId="${data.Id}" itemName="${data.Item}" id="itemCheckTime${xh}" style="width:120px;cursor: pointer">`;
        }
        var score = function (data, type, row, meta) {
            var xh = meta.row;
            return `<span class="chose1">${data.Score}</span>` +
                `<input class="chose2 hidden form-control text-center" id="itemScore${xh}" old="${data.Score}" style="width:80px;" type="tel" onkeyup="onInput(this, 8, 0)" onblur="onInputEnd(this)" maxlength="10">`;
        }
        var desc = function (data, type, row, meta) {
            var xh = meta.row;
            return (data.Desc.length > tdShowLength
                ? `<span title="${data.Desc}" class="chose1" onclick = "showAllContent('${escape(data.Desc)}', '评语')">${data.Desc.substring(0, tdShowLength)}...</span>`
                : `<span title="${data.Desc}" class="chose1">${data.Desc}</span>`) +
                `<textarea class="chose2 hidden form-control" id="itemDesc${xh}" old="${data.Desc}" maxlength = "500" style="resize: vertical;width:100%;margin:auto"></textarea>`;
        }
        var lookImg = function (data) {
            var op = '<span id="imgFlag{2}" class="glyphicon glyphicon-{0}" aria-hidden="true" style="color:{1};font-size:25px;vertical-align:middle;margin-right:5px"></span>' +
                '<button id="imgBtn{2}" type="button" class="btn btn-info btn-sm" style="vertical-align:middle" onclick="showImgModel({2},\'{3}\',\'{4}\')">查看</button>';
            return data.ImageList.length ? op.format('ok', 'green', data.Id, escape(data.Item), escape(data.ImageList))
                : op.format('remove', 'red', data.Id, escape(data.Item), escape(data.ImageList));
        }
        var excelColumns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13];
        var titleColumns = [4, 10];
        $("#itemList")
            .DataTable({
                dom: '<"pull-left"l><"pull-right"B><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                buttons: [
                    {
                        extend: 'excel',
                        text: '导出Excel',
                        className: 'btn-primary btn-sm',
                        exportOptions: {
                            columns: excelColumns,
                            format: {
                                body: (data, row, column, node) => titleColumns.indexOf(column) > -1 ? $(node).find("span").attr("title") : node.textContent
                            }
                        }
                    }
                ],
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": oLanguage,
                "data": items,
                "bAutoWidth": false,
                "aaSorting": [[1, "asc"]],
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "选择", "render": isEnable },
                    { "data": null, "title": "序号", "render": order, "sWidth": "20px" },
                    { "data": "Item", "title": "检查项目" },
                    { "data": "Standard", "title": "标准分", "sWidth": "20px" },
                    { "data": "Reference", "title": "要求及目标", "render": reference },
                    { "data": null, "title": "频次", "render": interval },
                    { "data": "PersonName", "title": "负责人" },
                    { "data": null, "title": "截止日期", "render": plannedTime },
                    { "data": null, "title": "检验员", "render": surveyor },
                    { "data": null, "title": "检查日期", "render": checkTime },
                    { "data": null, "title": "评分", "render": score },
                    { "data": null, "title": "评语", "render": desc, "sClass": "no-padding" },
                    { "data": null, "title": "图片", "render": lookImg },
                    { "data": "ModifyName", "title": "修改人" }
                ],
                "createdRow": function (row, data, index) {
                    var date = $(row).find('.form_date');
                    date.attr("readonly", true).datepicker({
                        language: 'zh-CN',
                        format: 'yyyy-mm-dd',
                        maxViewMode: 2,
                        todayBtn: "linked",
                        autoclose: true
                    });
                    date.val(getDate()).datepicker('update');
                },
                "drawCallback": function (settings, json) {
                    $(this).find(".ms2").select2({
                        width: "120px"
                    });
                    $(this).find('.chose').iCheck({
                        labelHover: false,
                        cursor: true,
                        checkboxClass: 'icheckbox_minimal-red',
                        increaseArea: '20%'
                    });

                    $(this).find('.chose').on('ifChanged', function () {
                        var tr = $(this).parents("tr:first");
                        var v = $(this).attr("value");
                        if ($(this).is(":checked")) {
                            tr.find(".chose1").addClass("hidden");
                            tr.find(".chose2").removeClass("hidden");
                            var surveyorId = $("#itemSurveyor" + v).attr("old");
                            $("#itemSurveyor" + v).val(surveyorId).trigger("change");
                            $("#itemScore" + v).val($("#itemScore" + v).attr("old"));
                            $("#itemDesc" + v).html($("#itemDesc" + v).attr("old"));
                        } else {
                            tr.find(".chose1").removeClass("hidden");
                            tr.find(".chose2").addClass("hidden");
                        }
                    });
                }
            });
    }
    $("#6sGroupAll").html(all);
    $("#6sGroupCount").html(count);
    $("#6sGroupScore").html(totalScore);
}

function report() {
    var list = new Array();
    var itemNames = new Array();
    for (var i = 0; i < showItems.length; i++) {
        if ($("#itemChose" + i).length > 0 && $("#itemChose" + i).is(":checked")) {
            var itemSurveyor = $("#itemSurveyor" + i).val();
            var itemId = $("#itemCheckTime" + i).attr("itemId");
            var itemName = $("#itemCheckTime" + i).attr("itemName");
            var itemCheckTime = $("#itemCheckTime" + i).val();
            var itemScore = $("#itemScore" + i).val();
            var itemDesc = $("#itemDesc" + i).val();
            if (isStrEmptyOrUndefined(itemScore) && !isStrEmptyOrUndefined(itemDesc)) {
                layer.msg('请输入评分');
                return;
            }

            if (isStrEmptyOrUndefined(itemScore) && !isStrEmptyOrUndefined(itemSurveyor)) {
                layer.msg('请输入评分');
                return;
            }
            if (!isStrEmptyOrUndefined(itemScore)) {
                if (isStrEmptyOrUndefined(itemCheckTime)) {
                    layer.msg('请选择检查时间');
                    return;
                }
                if (isStrEmptyOrUndefined(itemSurveyor)) {
                    layer.msg('请选择检验员');
                    return;
                }
                itemNames.push(itemName);
                list.push({
                    Id: itemId,
                    SurveyorId: itemSurveyor,
                    CheckTime: itemCheckTime,
                    Score: itemScore,
                    Desc: itemDesc,
                    ModifyName: getCookieTokenInfo().name,
                    ModifyAccount: getCookieTokenInfo().account
                });
            }
        }
    }
    if (list.length == 0) {
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = 921;
        data.opData = JSON.stringify(list);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getItemList();
                }
            });
    }
    showConfirm("修改以下检查项:</br>" + itemNames.join(",</br>"), doSth);
}

var _imgNameData = null;
var _imgUpload = null;
var tid, titem, timg;
//图片详情模态框
function showImgModel(id, item, img) {
    tid = id;
    titem = item;
    timg = img;
    if (_imgUpload == null) {
        _imgUpload = initFileInputMultiple("addImg", fileEnum._6s);
    }
    $("#addImg").fileinput('clear');
    $('#checkId').text(id);
    item = unescape(item);
    $('#checkName').text(item);
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
            type: fileEnum._6s,
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
            var imgOp =
                `<div class="imgOption col-lg-2 col-md-3 col-sm-4 col-xs-6">
                        <div class="thumbnail">
                        <img src={0} style="height:200px" onclick="showBigImg(\'{0}\')">
                        <div class="caption text-center">
                            <button type="button" class="btn btn-default glyphicon glyphicon-trash delImg" value="{1}"></button>
                        </div>
                        </div>
                    </div>`;
            var imgOps = "";
            for (var i = 0; i < pLen; i++) {
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
    fileCallBack[fileEnum._6s] = function (fileRet) {
        if (fileRet.errno == 0) {
            var img = [];
            for (var key in fileRet.data) {
                img.push(fileRet.data[key].newName);
            }
            var imgNameData = _imgNameData.concat(img);
            var len = imgNameData.length;
            var imgNew = JSON.stringify(imgNameData);
            var id = $('#checkId').text();
            var data = {}
            data.opType = 921;
            data.opData = JSON.stringify([{
                UpdateImage: true,
                Images: imgNew,
                Id: id,
                ModifyName: getCookieTokenInfo().name,
                ModifyAccount: getCookieTokenInfo().account
            }]);
            ajaxPost("/Relay/Post", data,
                function (ret) {
                    layer.msg(ret.errmsg);
                    $('#showImgModel').modal('hide');
                    if (ret.errno == 0) {
                        _imgNameData = imgNameData;
                        if (len > 0) {
                            $("#imgFlag" + id).removeClass("glyphicon-remove");
                            $("#imgFlag" + id).addClass("glyphicon-ok");
                            $("#imgFlag" + id).css("color", "green");
                            $("#imgBtn" + id).attr("onclick", "showImgModel({0},\'{1}\',\'{2}\')".format(tid, titem, escape(_imgNameData)));
                        } else {
                            $("#imgFlag" + id).removeClass("glyphicon-ok");
                            $("#imgFlag" + id).addClass("glyphicon-remove");
                            $("#imgFlag" + id).css("color", "red");
                            $("#imgBtn" + id).attr("onclick", "showImgModel({0},\'{1}\',\'{2}\')".format(tid, titem, ''));
                        }
                    }
                });
        }
    };
    var doSth = function () {
        $('#addImg').fileinput("upload");
    }
    showConfirm("操作", doSth);
}

function groupRank(show = true, time = true) {
    if (time) {
        $("#_6sGroupRankTime1").val($("#_6sItemCheckTime1").val());
        $("#_6sGroupRankTime1").datepicker('update');
        $("#_6sGroupRankTime2").val($("#_6sItemCheckTime2").val());
        $("#_6sGroupRankTime2").datepicker('update');
    }
    $("#_6sGroupRankList").empty();
    var sTime = $("#_6sGroupRankTime1").val();
    var eTime = $("#_6sGroupRankTime2").val();
    if (!isStrEmptyOrUndefined(sTime) && !isStrEmptyOrUndefined(eTime)) {
        var data = {}
        data.opType = 930;
        data.opData = JSON.stringify({
            sTime: sTime,
            eTime: eTime
        });
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var order = function (a, b, c, d) {
                return ++d.row;
            }
            var detail = function (data) {
                return `<button type="button" class="btn btn-info btn-sm" style="vertical-align:middle" onclick="groupPersonRank(${data.Id}, \'${data.Group}\')">查看</button>`;
            }
            $("#_6sGroupRankList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "bAutoWidth": false,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": [
                        { "data": null, "title": "排名", "render": order, "sWidth": "20px" },
                        { "data": "Group", "title": "分组" },
                        { "data": "Score", "title": "评分" },
                        { "data": null, "title": "详情", "render": detail }
                    ]
                });

            if (show) {
                $('#_6sGroupRankModel').modal('show');
            }
        });
    }
}

function groupPersonRank(groupId, group, show = true, time = true) {
    if (time) {
        $("#_6sGroupPersonRankTime1").val($("#_6sGroupRankTime1").val());
        $("#_6sGroupPersonRankTime1").datepicker('update');
        $("#_6sGroupPersonRankTime2").val($("#_6sGroupRankTime2").val());
        $("#_6sGroupPersonRankTime2").datepicker('update');
    }
    $("#_6sGroupGroup").html(group);
    $("#_6sGroupGroupId").html(groupId);
    $("#_6sGroupPersonRankList").empty();
    var sTime = $("#_6sGroupPersonRankTime1").val();
    var eTime = $("#_6sGroupPersonRankTime2").val();
    if (!isStrEmptyOrUndefined(groupId) && !isStrEmptyOrUndefined(sTime) && !isStrEmptyOrUndefined(eTime)) {
        var data = {}
        data.opType = 931;
        data.opData = JSON.stringify({
            gId: groupId,
            sTime: sTime,
            eTime: eTime
        });
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var order = function (a, b, c, d) {
                return ++d.row;
            }
            var detail = function (data) {
                return `<button type="button" class="btn btn-info btn-sm" style="vertical-align:middle" onclick="groupPersonItemRank(${groupId}, ${data.Id})">查看</button>`;
            }
            $("#_6sGroupPersonRankList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "bAutoWidth": false,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": [
                        { "data": null, "title": "排名", "render": order, "sWidth": "20px" },
                        { "data": "SurveyorName", "title": "员工" },
                        { "data": "Score", "title": "评分" },
                        { "data": null, "title": "详情", "render": detail }
                    ]
                });

            if (show) {
                $('#_6sGroupPersonRankModel').modal('show');
            }
        });
    }
}

function groupPersonItemRank(groupId, person, show = true, time = true) {
    if (time) {
        $("#_6sGroupPersonItemRankTime1").val($("#_6sGroupPersonRankTime1").val());
        $("#_6sGroupPersonItemRankTime1").datepicker('update');
        $("#_6sGroupPersonItemRankTime2").val($("#_6sGroupPersonRankTime2").val());
        $("#_6sGroupPersonItemRankTime2").datepicker('update');
    }
    $("#_6sGroupPersonId").html(person);
    $("#_6sGroupPersonItemList").empty();
    var sTime = $("#_6sGroupPersonItemRankTime1").val();
    var eTime = $("#_6sGroupPersonItemRankTime2").val();
    if (!isStrEmptyOrUndefined(groupId) && !isStrEmptyOrUndefined(sTime) && !isStrEmptyOrUndefined(eTime)) {
        var data = {}
        data.opType = 920;
        data.opData = JSON.stringify({
            gId: groupId,
            pId: person,
            sTime: sTime,
            eTime: eTime
        });
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var order = function (a, b, c, d) {
                return ++d.row;
            }
            var reference = function (data) {
                return data.length > tdShowLength
                    ? `<span title="${data}" onclick = "showAllContent('${escape(data)}', '要求及目标')">${data.substring(0, tdShowLength)}...</span>`
                    : `<span title="${data}">${data}</span>`;
            }
            var interval = function (data) {
                return `<span>${(data.Interval == 0 ? "" : (data.Interval == 1 ? `${data.Day}天/次` : `${data.Week}周/次`))}</span>`;
            }
            var plannedTime = function (data) {
                return `<span>${data.PlannedTime.slice(0, data.PlannedTime.indexOf(' '))}</span>`;
            }

            var checkTime = function (data) {
                return `<span>${(data.Check ? data.CheckTime.slice(0, data.CheckTime.indexOf(' ')) : "")}</span>`;
            }

            var desc = function (data) {
                return (data.length > tdShowLength
                    ? `<span title="${data}" onclick = "showAllContent('${escape(data)}', '评语')">${data.substring(0, tdShowLength)}...</span>`
                    : `<span title="${data}">${data}</span>`);
            }
            var lookImg = function (data) {
                var op = '<span class="glyphicon glyphicon-{0}" aria-hidden="true" style="color:{1};font-size:25px;vertical-align:middle;margin-right:5px"></span>' +
                    '<button type="button" class="btn btn-info btn-sm" style="vertical-align:middle" onclick="showImgModel({2},\'{3}\',\'{4}\', {5})">查看</button>';
                return data.ImageList.length ? op.format('ok', 'green', data.Id, escape(data.Item), escape(data.ImageList), true)
                    : op.format('remove', 'red', data.Id, escape(data.Item), escape(data.ImageList), true);
            }

            var excelColumns = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
            var titleColumns = [3, 10];
            $("#_6sGroupPersonItemList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"B><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    buttons: [
                        {
                            extend: 'excel',
                            text: '导出Excel',
                            className: 'btn-primary btn-sm',
                            exportOptions: {
                                columns: excelColumns,
                                format: {
                                    body: (data, row, column, node) => titleColumns.indexOf(column) > -1 ? $(node).find("span").attr("title") : node.textContent
                                }
                            }
                        }
                    ],
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "bAutoWidth": false,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                    "iDisplayLength": 20, //默认显示的记录数
                    "columns": [
                        { "data": null, "title": "序号", "render": order, "sWidth": "20px" },
                        { "data": "Item", "title": "检查项目" },
                        { "data": "Standard", "title": "标准分", "sWidth": "20px" },
                        { "data": "Reference", "title": "要求及目标", "render": reference },
                        { "data": null, "title": "频次", "render": interval },
                        { "data": "PersonName", "title": "负责人" },
                        { "data": null, "title": "截止日期", "render": plannedTime },
                        { "data": "SurveyorName", "title": "检验员" },
                        { "data": null, "title": "检查日期", "render": checkTime },
                        { "data": "Score", "title": "评分" },
                        { "data": "Desc", "title": "评语", "render": desc, "sClass": "no-padding" },
                        { "data": null, "title": "图片", "render": lookImg },
                        { "data": "ModifyName", "title": "修改人" }
                    ]
                });

            if (show) {
                $('#_6sGroupPersonItemRankModel').modal('show');
            }
        });
    }
}



