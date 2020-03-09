function pageReady() {
    $(".ms2").select2();
    $('#CheckListSelect').on('select2:select', function () {
        $('#CheckListName').val($(this).find("option:checked").text());
    });

    $("#CopyCheckListChoose").on("ifChanged", function (event) {
        if ($(this).is(":checked")) {
            $("#updateCheckListBtn").attr("disabled", "disabled");
        } else {
            $("#updateCheckListBtn").removeAttr("disabled");
        }
    });

    $('#CheckSelect').on('select2:select', function () {
        var checkId = $(this).val();
        initCheckConfig(checkId);
    });

    $("#selectAll").on("ifChanged", function (event) {
        if ($(this).is(":checked")) {
            $("#checkConfig .chose").iCheck("check");
        } else {
            $("#checkConfig .chose").iCheck("uncheck");
        }
    });
    init();
}
var option = '<option value = "{0}">{1}</option>';
//checkId!=0 修改
function init(checkId = 0) {
    if (checkId == -1) {
        checkId = $("#CheckSelect").val();
        if (isStrEmptyOrUndefined(checkId)) {
            return;
        }
    }
    $('#CheckSelect').empty();
    var checkFunc = new Promise(function (resolve, reject) {
        getCheckList(resolve);
    });
    var checkConfigFunc = new Promise(function (resolve, reject) {
        initCheckConfig(checkId, resolve);
    });

    var func = [checkFunc];
    if (checkId != 0) {
        func.push(checkConfigFunc);
    }
    Promise.all(func)
        .then((result) => {
            if (_checks && _checks.length > 0) {
                var options = '';
                for (var i = 0; i < _checks.length; i++) {
                    var d = _checks[i];
                    options += option.format(d.Id, d.Check);
                }
                $('#CheckSelect').append(options);
            }
            $('#CheckSelect').val(checkId).trigger("change");
        });
}

var _checks = null;
//获取检验

function showCheckListModel(checkId = 0, show = true) {
    if (show) {
        $("#CopyCheckListChoose").iCheck('uncheck');
        $("#updateCheckListBtn").removeAttr("enabled");
        $('#CheckListName').val('');
    }
    $('#CheckListSelect').empty();
    var checkListFunc = new Promise(function (resolve, reject) {
        getCheckList(resolve);
    });
    Promise.all([checkListFunc])
        .then((result) => {
            if (_checks && _checks.length > 0) {
                var options = '';
                for (var i = 0; i < _checks.length; i++) {
                    var d = _checks[i];
                    options += option.format(d.Id, d.Check);
                }
                $('#CheckListSelect').append(options);
            }
            $('#CheckListSelect').val(checkId).trigger("change");
            if (show)
                $('#checkListModel').modal('show');
        });
}

function getCheckList(resolve) {
    var opType = 1066;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }

    var data = {}
    data.opType = opType;
    data.opData = JSON.stringify({
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
        _checks = list;
    });
}

//删除配置
function deleteCheckList() {
    var opType = 1069;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }

    var checkId = $("#CheckListSelect").val();
    if (isStrEmptyOrUndefined(checkId)) {
        return;
    }

    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            id: checkId
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    showCheckListModel(0, false);
                }
            });
    }
    showConfirm("删除配置：" + $("#CheckListSelect option:selected").text(), doSth);
}

//修改配置名
function updateCheckList() {
    var opType = 1067;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }

    var checkName = $("#CheckListName").val();
    var oldCheckName = $("#CheckListSelect option:selected").text();
    var checkId = $("#CheckListSelect").val();
    if (isStrEmptyOrUndefined(checkId)) {
        layer.msg("请选择配置");
        return;
    }
    if (isStrEmptyOrUndefined(checkName)) {
        layer.msg("名称不能为空");
        return;
    }
    if (checkName == oldCheckName) {
        return;
    }

    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            Id: checkId,
            Check: checkName
        });

        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    showCheckListModel(checkId, false);
                }
            });
    }
    showConfirm("修改配置：" + $("#CheckListSelect option:selected").text(), doSth);
}

//添加配置
function addCheckList() {
    var opType = 1068;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }

    var checkName = $("#CheckListName").val();
    var oldCheckName = $("#CheckListSelect option:selected").text();
    if (isStrEmptyOrUndefined(checkName)) {
        layer.msg("名称不能为空");
        return;
    }
    var checkId = $("#CheckListSelect").val();
    if ($("#CopyCheckListChoose").is(":checked") && isStrEmptyOrUndefined(checkId)) {
        layer.msg("请选择配置");
        return;
    }
    if (checkName == oldCheckName) {
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            Check: checkName,
            CopyId: $("#CopyCheckListChoose").is(":checked") ? checkId : 0
        });

        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    var checkId = $("#CheckListSelect").val();
                    if (isStrEmptyOrUndefined(checkId)) {
                        checkId = 0;
                    }
                    showCheckListModel(checkId, false);
                }
            });
    }
    showConfirm("新增配置：" + checkName, doSth);
}

var checkConfig = null;
var checkConfigMax = 0;
var checkConfigMaxV = 0;
function initCheckConfig(checkId, resolve = null) {
    $("#selectAll").iCheck("uncheck");
    $('#checkConfig').empty();
    if (!isStrEmptyOrUndefined(checkId)) {
        var opType = 1070;
        if (!checkPermission(opType)) {
            layer.msg('没有权限');
            return;
        }

        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({
            checkId: checkId,
            menu: true
        });
        ajaxPost("/Relay/Post", data, function (ret) {
            if (resolve != null)
                resolve('success');
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            checkConfig = ret.datas;

            if (checkConfig.length > 0) {
                var trs = "";
                for (var j = 0; j < checkConfig.length; j++) {
                    var xh = j + 1;
                    var data = checkConfig[j];
                    var tr =
                        `<tr id="item${xh}" value="${xh}" xh="${xh}" itemId="${data.Id}">
                        <td style="width:50px;">
                           <input id="itemChose${xh}" type="checkbox" class="icb_minimal chose">
                        </td>
                        <td style="width:50px;" id="itemXh${xh}">
                            ${xh}
                        </td>
                        <td class="no-padding">
                        ${(data.Item.length > tdShowLength ?
                            `<span id="itemItem1${xh}" title="${data.Item}" class="chose1" onclick = "showAllContent('${escape(data.Item)}', '检验流程')">${data.Item.substring(0, tdShowLength)}...</span>` :
                            `<span id="itemItem1${xh}" title="${data.Item}" class="chose1">${data.Item}</span>`) +
                        `<textarea id="itemItem2${xh}" old="${data.Item}" class="chose2 hidden form-control" maxlength = "500" style = "resize: vertical;margin:auto" ></textarea>`}
                        </td>
                        <td style="width:100px;">
                            <span class="chose1" id ="itemMethod1${xh}">${data.Method}</span >
                            <input class="chose2 hidden form-control text-center" old="${data.Method}" id="itemMethod2${xh}" maxlength="100">
                        </td>
                    </tr>`;
                    trs += tr;
                }
                $("#checkConfig").append(trs);
                checkConfigMax = checkConfig.length;
                checkConfigMaxV = checkConfig.length;

                $("#checkConfig .chose").iCheck({
                    handle: 'checkbox',
                    checkboxClass: 'icheckbox_minimal-red',
                    increaseArea: '20%'
                });
                $("#checkConfig .chose").on("ifChanged", function (event) {
                    var tr = $(this).parents("tr:first");
                    var v = tr.attr("value");
                    if ($(this).is(":checked")) {
                        tr.find(".chose1").addClass("hidden");
                        tr.find(".chose2").removeClass("hidden");
                        $("#itemMethod2" + v).val($("#itemMethod2" + v).attr("old"));
                        $("#itemItem2" + v).val($("#itemItem2" + v).attr("old"));
                    } else {
                        tr.find(".chose1").removeClass("hidden");
                        tr.find(".chose2").addClass("hidden");
                    }
                });
            }
        });
    }
}

//添加一行
function addOneCheckConfig() {
    var checkId = $("#CheckSelect").val();
    if (isStrEmptyOrUndefined(checkId))
        return;
    //itemList
    checkConfigMax++;
    checkConfigMaxV++;
    var xh = checkConfigMax;
    var tr =
        `<tr id="item${xh}" value="${xh}" xh="${checkConfigMaxV}" itemId="0">
            <td style="width:50px;">
               <input id="itemChose${xh}" type="checkbox" class="icb_minimal chose">
            </td>
            <td style="width:50px;" id="itemXh${xh}">
                ${checkConfigMaxV}
            </td>
            <td class="no-padding">
                <textarea id="itemItem2${xh}" class="chose2 form-control" maxlength = "500" style = "resize: vertical;margin:auto" ></textarea>
            </td>
            <td style="width:100px;">
                <input class="chose2 form-control text-center" id="itemMethod2${xh}" maxlength="100">
            </td>
        </tr>`;
    $("#checkConfig").append(tr);
    var selector = "#item" + xh;
    $(selector).find(".ms2").select2({
        width: "120px"
    });
    $(selector).find(".icb_minimal").iCheck({
        handle: 'checkbox',
        checkboxClass: 'icheckbox_minimal-red',
        increaseArea: '20%'
    }).iCheck('check');

    $(selector).find(".icb_minimal").on("ifChanged", function (event) {
        $(this).parents("tr:first").remove();
        checkConfigMaxV--;
        var o = 1;
        var child = $("#checkConfig tr");;
        for (var i = 0; i < child.length; i++) {
            $(child[i]).attr("xh", o);
            var v = $(child[i]).attr("value");
            $("#itemXh" + v).html(o);
            o++;
        }
    });
}

//删除一行
function delCheckConfig() {
    var checkId = $("#CheckSelect").val();
    if (isStrEmptyOrUndefined(checkId))
        return;
    var child = $("#checkConfig tr");
    var xhs = [];
    for (var i = 0; i < child.length; i++) {
        var v = $(child[i]).attr("value");
        var xh = $(child[i]).attr("xh");
        if ($("#itemChose" + v).is(":checked")) {
            xhs.push(xh);
        }
    }
    if (xhs.length == 0)
        return;
    var doSth = function () {
        var o = 1;
        for (var i = 0; i < child.length; i++) {
            $(child[i]).attr("xh", o);
            var v = $(child[i]).attr("value");
            $("#itemXh" + v).html(o);
            if ($("#itemChose" + v).is(":checked")) {
                checkConfigMaxV--;
                $("#itemChose" + v).parents("tr:first").remove();
            } else {
                o++;
            }
        }
    }
    showConfirm("删除序号：" + xhs.join(), doSth);
}

//保存和修改
function saveCheckConfig() {
    var opType = 1071;
    if (!checkPermission(opType)) {
        layer.msg('没有权限');
        return;
    }
    var checkId = $("#CheckSelect").val();
    if (isStrEmptyOrUndefined(checkId)) {
        layer.msg("请选择配置");
        return;
    }
    var child = $("#checkConfig tr");
    var change = 0;
    var list = new Array();
    for (var i = 0; i < child.length; i++) {
        var v = $(child[i]).attr("value");
        var xh = $(child[i]).attr("xh");
        var item, method;
        var itemId = $("#item" + v).attr("itemId");
        if (!$("#itemChose" + v).is(":checked")) {
            item = $("#itemItem1" + v).attr("title");
            method = $("#itemMethod1" + v).html();
        } else {
            item = $("#itemItem2" + v).val();
            method = $("#itemMethod2" + v).val();
            change++;
        }

        if (isStrEmptyOrUndefined(item)) {
            layer.msg("请输入检验流程");
            return;
        }
        if (isStrEmptyOrUndefined(method)) {
            layer.msg("请输入检验方法");
            return;
        }

        list.push({
            CheckId: checkId,
            Id: itemId,
            Item: item,
            Method: method
        });
    }
    if (change <= 0 && list.length == checkConfig.length)
        return;
    var doSth = function () {
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    initCheckConfig(checkId);
                }
            });
    }
    showConfirm("保存", doSth);
}

