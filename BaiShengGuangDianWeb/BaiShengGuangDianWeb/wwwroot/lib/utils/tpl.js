//初始化表
var commonfunc = function () {
    if (!isTokenValid()) {
        window.location.href = loginUrl;
        return;
    }

    var tkinfo = getCookieTokenInfo();
    $("#nuser_name").text(tkinfo.name);
    $("#nuser_role").text(tkinfo.role.length > 10 ? tkinfo.role.substring(0, 10) + "..." : tkinfo.role);
    $("#nuser_role").attr("title", tkinfo.role);
    $("#user_name").prepend(tkinfo.name);
    $("#user_email").text(tkinfo.email);

    $("#logoutBtn").click(function () {
        var tkinfo = getCookieTokenInfo();
        var info = {
            ChatEnum: chatEnum.Logout,
            Message: {
                Id: tkinfo.id
            }
        }
        //调用服务器方法
        hubConnection.invoke('SendMsg', info);

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
                '   <a class="menuitem">' +
                '       <i class="mi fa"></i> <span class="mt"></span>' +
                '   </a>' +
                '</li>';

            var mMenu2 = '<li class="mli treeview">' +
                '    <a href="#">' +
                '        <i class="mi fa"></i> <span class="mt"></span>' +
                '        <span class="pull-right-container">' +
                '           <i class="fa fa-angle-left pull-right"></i>' +
                '        </span>' +
                '    </a>' +
                '    <ul class="treeview-menu">' +
                '    </ul>' +
                '</li>';

            var mMenu3 = '<li>' +
                '   <a class="menuitem" > <i class="fa fa-circle-o"></i><span></span></a>' +
                '</li >';
            var select = '<option value="{0}">{1}</option>';
            var datas = ret.datas;
            $("#search-select").empty();
            $("#search-select").append('<option></option>');
            $.each(datas, function (index, item) {
                if (!isStrEmptyOrUndefined(item.url)) {
                    $("#search-select").append(select.format(item.url, item.name.trim()));
                }
            });
            var local = window.location.pathname;
            var canSee = false;
            var parents = getParent(datas);
            var first = null;
            for (var i = 0; i < parents.length; i++) {
                var parent = parents[i];
                var childs = getChild(datas, parent);
                var option = null;
                var child = null;
                if (parent.noChild) {
                    child = childs[0];
                    if (child.url == local)
                        canSee = true;
                    if (!first)
                        first = child.url;
                    option = $(mMenu1).clone();
                    option.find('.menuitem').attr('id', "main" + parent.id);
                    option.find('.menuitem').attr('href', child.url);
                    option.find('i.mi').addClass(parent.icon);
                    option.find('span.mt').text(parent.name);
                    $(".sidebar-menu").append(option);
                } else {
                    option = $(mMenu2).clone();
                    option.find('.treeview-menu').attr('id', "main" + parent.id);
                    option.find('i.mi').addClass(parent.icon);
                    option.find('span.mt').text(parent.name);
                    $(".sidebar-menu").append(option);
                    for (var j = 0; j < childs.length; j++) {
                        child = childs[j];
                        if (child.url == local)
                            canSee = true;
                        if (!first)
                            first = child.url;
                        option = $(mMenu3).clone();
                        option.find('.treeview-menu').attr('id', "main" + child.id);
                        option.find('a').attr('href', child.url);
                        option.find('span').text(child.name.trim());
                        $(".sidebar-menu").find('[id=main' + child.parent + ']').append(option);
                    }
                }
            }

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
var check1 = null;
var check2 = null;
function initHub() {
    if (hubConnection == null) {
        hubConnection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
        initHubCallBack();
    }
    if (hubConnection.connection.connectionState != 1) {
        //服务地址
        hubConnection.start();

        joinFunc();
    }
}

function joinFunc() {
    if (join == null) {
        join = setInterval(function () {
            if (hubConnection.connection.connectionState == 1) {
                var tkinfo = getCookieTokenInfo();
                var info = {
                    ChatEnum: chatEnum.Connect,
                    Message: {
                        Id: tkinfo.id
                    }
                }
                //调用服务器方法
                hubConnection.invoke('SendMsg', info);
                clearInterval(join);
                join = null;
                check1Func();
            }
        }, 1000);
    }
}

function check1Func() {
    if (check1 == null) {
        check1 = setInterval(function () {
            if (hubConnection.connection.connectionState == 2) {
                clearInterval(check1);
                check1 = null;
                check2Func();
            }
        }, 1000);
    }
}
function check2Func() {
    if (check2 == null) {
        check2 = setInterval(function () {
            if (hubConnection.connection.connectionState == 1) {
                clearInterval(check2);
                check2 = null;
            }
            initHub();
        }, 10000);
    }
}

function initHubCallBack() {

    //服务器回调方法
    hubConnection.on('Default', () => {
        console.log("connect success");
    });

    hubConnection.on('FaultDevice', data => {
        var cnt = parseInt($(".rCnt").html());
        $(".rCnt").html(++cnt);
        var faultDevice = '<li>' +
            '<a href="/RepairManagement">' +
            '<h3><strong class="text-red">{0}</strong>于<strong class="text-info">{1}</strong>发生故障</h3>' +
            '</a>' +
            '</li> ';
        $("#errLi .menu").append(faultDevice.format(data.Code, getFullTime()));
    });
}

$(function () {
    $('.content').on("keydown", '.form_date', function (e) {
        if (e.keyCode == 13) {
            $(this).blur();
        };
        $('.content').on("change", '.form_date', function () {
            if (isStrEmptyOrUndefined($(this).val())) {
                $(this).val(getDate());
            }
        });
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
        todayBtn: "linked",
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