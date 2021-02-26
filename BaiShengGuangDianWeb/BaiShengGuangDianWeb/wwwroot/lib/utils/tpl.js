//初始化表
var commonfunc = function () {
    if (!isTokenValid()) {
        window.location.href = loginUrl;
        return;
    }

    const tkInfo = getCookieTokenInfo();
    $("#nuser_name").text(tkInfo.name);
    $("#nuser_role").text(tkInfo.role.length > 10 ? tkInfo.role.substring(0, 10) + "..." : tkInfo.role);
    $("#nuser_role").attr("title", tkInfo.role);
    //$("#user_name").prepend(tkInfo.name);
    $("#user_name").prepend(tkInfo.role.length > 10 ? tkInfo.role.substring(0, 10) + "..." : tkInfo.role);
    $("#user_name").attr("title", tkInfo.role);
    $("#user_email").prepend(tkInfo.email);

    $("#logoutBtn").click(function () {
        const info = {
            ChatEnum: chatEnum.Logout,
            Message: tkInfo.id
        }
        //调用服务器方法
        hubConnection.invoke("SendMsg", info);

        ajaxPost("/Account/Logout",
            null,
            function (ret) {
                DelCookie("token");
                window.location.href = loginUrl;
            });
    });
    $("#search-select").select2({
        allowClear: true,
        placeholder: ""
    });
    $("#search-select").on('select2:select', function () {
        $("#search-text").val($(this).find("option:selected").text());
        $("#search-text").css('backgroundColor', 'white');
    });
    //控制左侧菜单栏的权限控制
    $(".sidebar-menu li.mli").remove();
    ajaxGet("/Account/Pages",
        null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.msg);
                return;
            }
            var mMenu1 = '<li class="mli">' +
                '   <a class="menuitem" id="{0}" href="{1}">' +
                '       <i class="mi fa {2}"></i><span class="mt">{3}</span>' +
                '   </a>' +
                '</li>';

            var mMenu2 = '<li class="mli treeview">' +
                '    <a href="#">' +
                '        <i class="mi fa {1}"></i><span class="mt">{2}</span>' +
                '        <span class="pull-right-container">' +
                '           <i class="fa fa-angle-left pull-right"></i>' +
                '        </span>' +
                '    </a>' +
                '    <ul class="treeview-menu" id="{0}">{3}</ul>' +
                '</li>';

            var mMenu3 = '<li>' +
                '   <a class="menuitem" href="{0}"><i class="fa fa-circle-o"></i><span>{1}</span></a>' +
                '</li >';
            var select = '<option value="{0}">{1}</option>';
            var selectOps = '', liOps = '';
            var childrenLi = { parent: [] };
            var rData = ret.datas;
            rData.sort((a, b) => a.order - b.order);
            $.each(rData, (index, item) => {
                if (!isStrEmptyOrUndefined(item.url)) {
                    selectOps += select.format(item.url, item.name.trim());
                }
                var par = item.parent;
                par == 0 ? childrenLi.parent.push(item) : childrenLi[par] ? childrenLi[par].push(item) : childrenLi[par] = [item];
            });
            $("#search-select").empty().append(`<option></option>${selectOps}`);
            var local = window.location.pathname;
            var canSee = false;
            var first = null;
            var i = 0, parLi = childrenLi.parent, len = parLi.length;
            for (; i < len; i++) {
                var d = parLi[i];
                var childLi = childrenLi[d.id];
                if (childLi) {
                    var childLis = '';
                    childLi.sort((a, b) => a.order - b.order);
                    $.each(childLi, (index, item) => {
                        childLis += mMenu3.format(item.url, item.name);
                        if (item.url == local)
                            canSee = true;
                        if (!first)
                            first = item.url;
                    });
                    liOps += mMenu2.format(`main${d.id}`, d.icon, d.name, childLis);
                } else {
                    liOps += mMenu1.format(`main${d.id}`, d.url, d.icon, d.name);
                    if (d.url == local)
                        canSee = true;
                    if (!first)
                        first = d.url;
                }
            }
            $(".sidebar-menu").empty().append(liOps);
            //var local = window.location.pathname;
            //var canSee = false;
            //var first = null;
            //var parents = getParent(rData);
            //for (i = 0; i < parents.length; i++) {
            //    var parent = parents[i];
            //    var childs = getChild(rData, parent);
            //    var option = null;
            //    var child = null;
            //    if (parent.noChild) {
            //        child = childs[0];
            //        if (child.url == local)
            //            canSee = true;
            //        if (!first)
            //            first = child.url;
            //        option = $(mMenu1).clone();
            //        option.find('.menuitem').attr('id', "main" + parent.id);
            //        option.find('.menuitem').attr('href', child.url);
            //        option.find('i.mi').addClass(parent.icon);
            //        option.find('span.mt').text(parent.name);
            //        $(".sidebar-menu").append(option);
            //    } else {
            //        option = $(mMenu2).clone();
            //        option.find('.treeview-menu').attr('id', "main" + parent.id);
            //        option.find('i.mi').addClass(parent.icon);
            //        option.find('span.mt').text(parent.name);
            //        $(".sidebar-menu").append(option);
            //        for (var j = 0; j < childs.length; j++) {
            //            child = childs[j];
            //            if (child.url == local)
            //                canSee = true;
            //            if (!first)
            //                first = child.url;
            //            option = $(mMenu3).clone();
            //            option.find('.treeview-menu').attr('id', "main" + child.id);
            //            option.find('a').attr('href', child.url);
            //            option.find('span').text(child.name.trim());
            //            $(".sidebar-menu").find('[id=main' + child.parent + ']').append(option);
            //        }
            //    }
            //}
            if (!first)
                first = "/";
            if (!canSee) {
                window.location = first;
                return;
            }
            var url = window.location.pathname;
            $("a.menuitem[href]").filter(function () {
                return this.pathname === url;
            }).parent().addClass("active").parent().parent().addClass("active");

            if (url != window.location.pathname) {
                window.location = url;
            }
        });

    //服务地址
    initHub();

}
//搜索栏
function searchPage() {
    var url = $("#search-select").val();
    if (!isStrEmptyOrUndefined(url)) {
        window.location = url;
    }
}

function sortRule(a, b) {
    if (typeof a == "object") {
        if (a.order == b.order) {
            return a.id > b.id ? 1 : -1;
        } else {
            return a.order > b.order ? 1 : -1;
        }
    } else {
        return a > b ? 1 : -1;
    }
}

function getParent(list) {
    var result = new Array();
    var id = 0;
    for (var i = 0; i < PermissionPageTypes.length; i++) {
        var parent = PermissionPageTypes[i];
        for (var j = 0; j < list.length; j++) {
            var data = list[j];
            if (data.label == parent.name) {
                var d = clone(parent);
                d.id = id--;
                result.push(d);
                break;
            }
        }
    }

    return result;
}

function getChild(list, parent) {
    var result = new Array();
    for (var j = 0; j < list.length; j++) {
        var data = list[j];
        if (data.label == parent.name) {
            var d = clone(data);
            d.parent = parent.id;
            result.push(d);
        }
    }

    return result.sort(sortRule);
}

var join = null;
var check = null;
var check1 = null;
var check2 = null;
function initHub() {
    if (hubConnection == null) {
        hubConnection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
        hubConnection.SendMsg = (m, d, callBack) => {
            var type = typeof m;
            if (type != "string" && type != "number")
                return;
            if (type == "string" && !chatEnum[m])
                return;
            if (type == "number") {
                for (var key in chatEnum) {
                    if (chatEnum[key] == m) {
                        m = key;
                        break;
                    }
                }
            }

            //删除已有回调方法
            callBack && hubConnection.off(m);
            //服务器回调方法
            hubConnection.on(m, res => {
                console.log(`${m} Back Success`);
                callBack && callBack(res);
            });

            //调用服务器方法
            hubConnection.invoke("SendMsg", {
                ChatEnum: chatEnum[m],
                Message: d
            });
        }
        initHubCallBack();
    }
    if (hubConnection.connection.connectionState !== 1) {
        check && clearInterval(check);
        //服务地址
        hubConnection.start()
            .then(() => {
                const tkInfo = getCookieTokenInfo();
                //调用服务器方法
                hubConnection.invoke('SendMsg', {
                    ChatEnum: chatEnum.Connect,
                    Message: tkInfo.id
                });
                checkFunc();
            })
            .catch(err => {
                console.log(err.toString());
                initHub();
            });
    }
}

function checkFunc() {
    check = setInterval(function () {
        //console.log(`check, ${hubConnection.connection.connectionState}`);
        if (hubConnection.connection.connectionState !== 1) {
            //console.log("Reconnect");
            initHub();
        }
    }, 10000);
}

function initHubCallBack() {
    //服务器回调方法
    hubConnection.on("Back", res => {
        console.log(res);
    });

    //服务器回调方法
    hubConnection.on("Connect", res => {
        console.log("Connect Success");
        var oldCId = GetCookie("cid");
        if (oldCId) {
            const tkInfo = getCookieTokenInfo();
            //调用服务器方法
            hubConnection.invoke("SendMsg", {
                ChatEnum: chatEnum.RefreshId,
                Message: {
                    Id: tkInfo.id,
                    CId: oldCId
                }
            });
        }
        const r = res.split(",");
        if (r.length > 1) {
            if (r[0] === "Success") {
                SetCookie("cid", r[1]);
            }
        }
    });

    //服务器回调方法
    hubConnection.on("RefreshId", res => {
        console.log("Refresh Success");
    });

    //服务器故障方法
    hubConnection.on('FaultDevice', res => {
        var cnt = parseInt($(".rCnt").html());
        $(".rCnt").html(++cnt);
        var faultDevice =
            `<li>
                <a href="/RepairManagement">
                <h3>
                    <strong class="text-red">{0}</strong> 于<strong class="text-info">{1}</strong>发生故障
                </h3>
                </a>
            </li>`;
        $("#errLi .menu").append(faultDevice.format(res.Code, getFullTime()));
    });
}

$(function () {
    $('.content').on("keydown", '.form_date', function (e) {
        if (e.keyCode == 13) {
            $(this).blur();
        };
    });

    $(document).on("keydown", function (e) {
        if (e.keyCode == 27) {
            $('.content').find(".fullScreenBtn.fsb").click();
        };
    });
    $('.form_date').datepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd',
        //endDate:getDayAfter(1),
        maxViewMode: 2,
        todayBtn: "linked",
        autoclose: true
    });
    $('.form_time').on("click", function () {
        var val = $(this).val();
        $(this).val(val).timepicker("setTime", val);
        $('.bootstrap-timepicker-widget').find('input').off('input').on('input', function () {
            var v = $(this).val().replace(/[^\d]/g, '');
            $(this).val(v);
        });
    });
    $('.form_month').on("keydown", function (e) {
        if (e.keyCode == 13) {
            $(this).blur();
        };
        $('.form_month').on("change", function () {
            if (isStrEmptyOrUndefined($(this).val())) {
                $(this).val(getNowMonth());
            }
        });
    });
    $('.form_month').datepicker({
        language: 'zh-CN',
        format: 'yyyy-mm',
        startView: 1,
        minViewMode: 1,
        maxViewMode: 2,
        autoclose: true
    });
    $('.form_time').timepicker({
        format: "HH:mm:ss",
        language: 'zh-CN',
        showMeridian: false,
        minuteStep: 1,
        showSeconds: true,
        secondStep: 1
    });
    $('.icb_minimal').iCheck({
        checkboxClass: 'icheckbox_minimal',
        radioClass: 'iradio_minimal',
        increaseArea: '20%' // optional
    });
    commonfunc();
    if (typeof (pageReady) != "undefined") {
        pageReady();
        $(".form_date,.form_month,.form_time").attr("readonly", true);
    }
    $('.modal').on('hidden.bs.modal',
        function () {
            if ($('.modal.in').size() >= 1) {
                $('body').addClass('modal-open');
            }
        });
    //$("input").attr("onkeyup", "this.value=this.value.replace(/[\\/\\\\\"\']/g,'');");
    //$("input").attr("onpaste", "this.value=this.value.replace(/[\\/\\\\\"\']/g,'');");
    $.fn.modal.Constructor.prototype.enforceFocus = function () { };
    $.fn.select2.defaults.set('width', '100%');
    //$('input[name="datePicker"]').daterangepicker({
    //    timePicker: true, //显示时间
    //    timePicker24Hour: true, //时间制
    //    timePickerSeconds: true, //时间显示到秒
    //    startDate: moment().hours(0).minutes(0).seconds(0), //设置开始日期
    //    endDate: moment(new Date()), //设置结束器日期
    //    maxDate: moment(new Date()), //设置最大日期
    //    opens: 'right',
    //    ranges: {
    //        '今天': [moment().hours(0).minutes(0).seconds(0), moment()],
    //        '昨天': [moment().subtract(1, 'days').hours(0).minutes(0).seconds(0), moment().subtract(1, 'days').hours(23).minutes(59).seconds(59)],
    //        '上周': [moment().subtract(6, 'days'), moment()],
    //        '前30天': [moment().subtract(29, 'days'), moment()],
    //        '本月': [moment().startOf('month'), moment().endOf('month')],
    //        '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    //    },
    //    locale: {
    //        format: 'YYYY-MM-DD HH:mm:ss', //设置显示格式
    //        separator: ' 至 ',
    //        applyLabel: '确定', //确定按钮文本
    //        cancelLabel: '取消', //取消按钮文本
    //        customRangeLabel: '自定义',
    //        daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
    //        monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    //        firstDay: 1
    //    }
    //});
});
//datatables自定义排序
jQuery.extend(jQuery.fn.dataTableExt.oSort, {
    "html-percent-pre": function (a) {
        var x = String(a).replace(/<[\s\S]*?>/g, "");    //去除html标记
        x = x.replace(/&amp;nbsp;/ig, "");                   //去除空格
        x = x.replace(/%/, "");                          //去除百分号
        return parseFloat(x) ? parseFloat(x) : 0;
    },
    "html-percent-asc": function (a, b) {                //正序排序引用方法
        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
    },
    "html-percent-desc": function (a, b) {                //倒序排序引用方法
        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
    }
});