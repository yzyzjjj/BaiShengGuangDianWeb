//初始化表
var commonfunc = function () {
    if (!isTokenValid()) {
        window.location.href = const_loginurl
        return
    }

    var tkinfo = getCookieTokenInfo()
    $("#nuser_name").text(tkinfo.name)
    $("#nuser_role").text(tkinfo.role)
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
    $(".sidebar-menu li.mli").remove()
    ajaxGet("/Account/Pages",
        null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.msg)
                return
            }

            var mMenu1 = '<li class="mli">' +
                '   <a class="menuitem">' +
                '       <i class="mi fa"></i> <span class="mt"></span>' +
                '   </a>' +
                '</li>'

            var mMenu2 = '<li class="mli treeview">' +
                '    <a href="#">' +
                '        <i class="mi fa"></i> <span class="mt"></span>' +
                '        <span class="pull-right-container">' +
                '           <i class="fa fa-angle-left pull-right"></i>' +
                '        </span>' +
                '    </a>' +
                '    <ul class="treeview-menu">' +
                '    </ul>' +
                '</li>'

            var mMenu3 = '<li>' +
                '   <a class="menuitem" > <i class="fa fa-circle-o"></i><span></span></a>' +
                '</li >'

            var datas = ret.datas
            var parents = getParent(datas)
            for (var i = 0; i < parents.length; i++) {
                var childs = getChild(datas, parents[i])
                for (var j = 0; j < childs.length; j++) {
                    var child = childs[j]
                    var option = null
                    if (child.parent == 0) {
                        if (child.url == "") {
                            option = $(mMenu2).clone()
                            option.find('.treeview-menu').attr('id', child.id)
                            option.find('i.mi').addClass(child.icon)
                            option.find('span.mt').text(child.name)
                            $(".sidebar-menu").append(option)
                        } else {
                            option = $(mMenu1).clone()
                            option.find('.menuitem').attr('id', child.id)
                            option.find('.menuitem').attr('href', child.url)
                            option.find('i.mi').addClass(child.icon)
                            option.find('span.mt').text(child.name)
                            $(".sidebar-menu").append(option)
                        }
                    } else {
                        option = $(mMenu3).clone()
                        option.find('.treeview-menu').attr('id', child.id)
                        option.find('a').attr('href', child.url)
                        option.find('span').text(child.name)
                        $(".sidebar-menu").find('[id=' + child.parent + ']').append(option)
                    }
                }
            }

            var url = window.location

            $("a.menuitem[href]").filter(function () {
                var u = this.pathname
                return this.pathname === url.pathname
            }).parent().addClass("active").parent().parent().addClass("active")
        })
}

function rule(a, b) {
    if (a.order == b.order) {
        return a.id > b.id
    }
    return a.order > b.order
}

function getParent(list) {
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (result.indexOf(data.parent) < 0) {
            result.push(data.parent)
        }
    }

    return result.sort(rule)
}

function getChild(list, parentId) {
    var info = getCookieTokenInfo()
    var result = new Array();
    for (var i = 0; i < list.length; i++) {
        var data = list[i]
        if (data.parent == parentId && info.permissionsList.indexOf(data.id) >= 0) {
            result.push(data)
        }
    }

    return result.sort(rule)
}

$(function () {
    commonfunc()
    if (typeof (pageReady) != "undefined") {
        pageReady()
        $(".form_date,.form_month").attr("readonly", true)
    }
    $('.modal').on('hidden.bs.modal', function () {
        if ($('.modal.in').size() >= 1) {
            $('body').addClass('modal-open')
        }
    })
})