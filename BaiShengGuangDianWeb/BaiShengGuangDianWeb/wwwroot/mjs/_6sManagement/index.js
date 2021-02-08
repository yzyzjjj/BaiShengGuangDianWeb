var _permissionList = [];
function pageReady() {
    _permissionList[621] = { uIds: ['reportBtn'] };
    _permissionList[622] = { uIds: ['updateImgBtn'] };
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
    $('#6sGroupSelect').on('select2:select', function () {
        getItemList();
    });

    $('#_6sItemPerson').on('select2:select', function () {
        showItem();
    });
    init();

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
    Promise.all([groupFunc])
        .then((result) => {
            getItemList();
        });
}

var _groups = null;
//获取6s分组
function getGroupList(resolve) {
    var data = {}
    data.opType = 900;
    data.opData = JSON.stringify({
        account: getCookieTokenInfo().account
    });
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
    if (!isStrEmptyOrUndefined(gId)) {
        var data = {}
        data.opType = 910;
        data.opData = JSON.stringify({
            gId: gId
        });
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            items = ret.datas;
            showItems = items;
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
            className = "PlannedTime";
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
            if (className == "PlannedTime") {
                v = v.split(' ')[0];
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
        var number = 0;
        var order = function (data, type, row, meta) {
            number = meta.row + 1;
            return number;
        }
        var reference = function (data, type, row, meta) {
            var xh = meta.row;
            return data.length > tdShowLength
                ? `<span title="${data}" class="chose1" onclick = "showAllContent('${escape(data)}', '要求及目标')">${data.substring(0, tdShowLength)}...</span>`
                : `<span title="${data}" class="chose1">${data}</span>`;
        }
        var interval = function (data) {
            return `<span>${(data.Interval == 0 ? "" : (data.Interval == 1 ? `${data.Day}天/次` : `${data.Week}周/次`))}</span>`;
        }
        var plannedTime = function (data) {
            return data.PlannedTime.slice(0, data.PlannedTime.indexOf(' '));
        }
        var checkTime = function (data, type, row, meta) {
            var xh = meta.row;
            return data.Check ? data.CheckTime.slice(0, data.CheckTime.indexOf(' ')) :
                `<input type="text" itemId="${data.Id}" itemName="${data.Item}" itemCheck="${data.Check}" id="itemCheckTime${xh}" class="form_date form-control text-center" style="width:120px;cursor: pointer">`;
        }
        var score = function (data, type, row, meta) {
            var xh = meta.row;
            return data.Check ? `<span>${data.Score}</span>` :
                `<input class="form-control text-center" id="itemScore${xh}" style="width:80px;" type="tel" onkeyup="onInput(this, 8, 0)" onblur="onInputEnd(this)" maxlength="10">`;
        }
        var desc = function (data, type, row, meta) {
            var xh = meta.row;
            return data.Check ? (data.Desc.length > tdShowLength
                ? `<span title="${data.Desc}" class="chose1" onclick = "showAllContent('${escape(data.Desc)}', '评语')">${data.Desc.substring(0, tdShowLength)}...</span>`
                : `<span title="${data.Desc}" class="chose1">${data.Desc}</span>`) :
                `<textarea class="form-control" id="itemDesc${xh}" maxlength = "500" style="resize: vertical;width:100%;margin:auto"></textarea>`;
        }
        var lookImg = function (data) {
            var op = '<span id="imgFlag{2}" class="glyphicon glyphicon-{0}" aria-hidden="true" style="color:{1};font-size:25px;vertical-align:middle;margin-right:5px"></span>' +
                '<button id="imgBtn{2}" type="button" class="btn btn-info btn-sm" style="vertical-align:middle" onclick="showImgModel({2},\'{3}\',\'{4}\')">查看</button>';
            return data.ImageList.length ? op.format('ok', 'green', data.Id, escape(data.Item), escape(data.ImageList))
                : op.format('remove', 'red', data.Id, escape(data.Item), escape(data.ImageList));
        }
        $("#itemList")
            .DataTable({
                dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": oLanguage,
                "data": showItems,
                "bAutoWidth": false,
                "aaSorting": [[0, "asc"]],
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "序号", "render": order, "sWidth": "20px" },
                    { "data": "PersonName", "title": "负责人" },
                    { "data": "Item", "title": "检查项目" },
                    { "data": "Standard", "title": "标准分", "sWidth": "20px" },
                    { "data": null, "title": "评分", "render": score },
                    { "data": null, "title": "评语", "render": desc, "sClass": "no-padding" },
                    { "data": null, "title": "图片", "render": lookImg },
                    { "data": "Reference", "title": "要求及目标", "render": reference },
                    { "data": null, "title": "频次", "render": interval },
                    { "data": null, "title": "截止日期", "render": plannedTime, "sClass": "text-red" },
                    { "data": null, "title": "检查日期", "render": checkTime }
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
    if (showItems == null) {
        return;
    }
    for (var i = 0; i < showItems.length; i++) {
        var itemCheck = $("#itemCheckTime" + i).attr("itemCheck");
        var itemId = $("#itemCheckTime" + i).attr("itemId");
        var itemName = $("#itemCheckTime" + i).attr("itemName");
        var itemCheckTime = $("#itemCheckTime" + i).val();
        var itemScore = $("#itemScore" + i).val();
        var itemDesc = $("#itemDesc" + i).val();
        if (itemCheck && itemCheck == "false") {
            if (isStrEmptyOrUndefined(itemScore) && !isStrEmptyOrUndefined(itemDesc)) {
                layer.msg('请输入评分');
                return;
            }
            if (!isStrEmptyOrUndefined(itemScore)) {
                if (isStrEmptyOrUndefined(itemCheckTime)) {
                    layer.msg('请选择检查时间');
                    return;
                }
                itemNames.push(itemName);
                list.push({
                    Id: itemId,
                    SurveyorAccount: getCookieTokenInfo().account,
                    CheckTime: itemCheckTime,
                    Score: itemScore,
                    Desc: itemDesc
                });
            }
        }
    }
    if (list.length == 0) {
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = 911;
        data.opData = JSON.stringify(list);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getItemList();
                }
            });
    }
    showConfirm("保存以下检查项:</br>" + itemNames.join(",</br>"), doSth);
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
        ajaxPost("/Upload/Path", data,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }
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
                for (var i = 0; i < ret.data.length; i++) {
                    imgOps += imgOp.format(ret.data[i].path, img[i]);
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
            data.opType = 911;
            data.opData = JSON.stringify([{
                UpdateImage: true,
                Images: imgNew,
                Id: id
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

                        //getItemList();
                    }
                });
        }
    };
    var doSth = function () {
        $('#addImg').fileinput("upload");
    }
    showConfirm("操作", doSth);
}


