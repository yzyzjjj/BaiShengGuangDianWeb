//初始化表
var commonfunc = function () {
    if (!isTokenValid()) {
        window.location.href = const_loginurl
        return
    }

    var tkinfo = getCookieTokenInfo()
    $("#nuser_name").text(tkinfo.name)
    $("#user_name").prepend(tkinfo.name)
    $("#user_email").text(tkinfo.email)

    $("#logoutBtn").click(function () {
        ajaxPost("/Account/Logout",
            null,
            function (ret) {
                DelCookie("token")
                window.location.href = const_loginurl
            })
    })

    //控制左侧菜单栏的权限控制
    $(".sidebar-menu li").empty().append('<li class="header">功能列表</li>')
    ajaxGet("/Account/Pages",
        null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.msg)
                return
            }
            //监听 treeview 打开事件
            /** add active class and stay opened when selected */

            //id
            //name
            //order
            //parent
            //url

            $(".sidebar-menu").append('<li>' +
                '<a class="menuitem" href="/RepairManagement">' +
                '    <i class="fa fa-edit"></i> <span>维修管理</span>' +
                '    <span class="pull-right-container"></span>' +
                '</a>')
            var html = ""
            var datas = ret.datas
            var parents = getParent(datas)
            for (var i = 0; i < parents.length; i++) {
                var childs = getChild(datas, parents[i])
                for (var j = 0; j < childs.length; j++) {
                    if (childs.url == "") {

                    } else {




                    }
                }
            }
            $(".sidebar-menu").append(html)

            var url = window.location

            $("a.menuitem[href]").filter(function () {
                var u = this.pathname
                return this.pathname === url.pathname
            }).parent().addClass("active").parent().parent().addClass("active")
        })
}
function getParent(list) {
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if ($.inArray(data.parent, result) < 0) {
            result.push(data.parent)
        }
    }

    function rule(a, b) {
        if (a.order == b.order) {
            return a.id > b.id
        }
        return a.order > b.order
    }
    return result.sort(rule)
}

function getChild(list, parentId) {
    var info = getCookieTokenInfo()
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (data.parent == parentId && $.inArray(data.id, info.permissionsList) >= 0) {
            result.push(data)
        }
    }

    function rule(a, b) {
        if (a.order == b.order) {
            return a.id > b.id
        }
        return a.order > b.order
    }
    return result.sort(rule)
}

$(function () {
    commonfunc()
    if (typeof (pageready) != "undefined") {
        pageready()
        $(".form_date,.form_month").attr("readonly", true)
    }
})