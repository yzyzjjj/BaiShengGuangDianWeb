$(function () {
    if (!pcAndroid()) {
        $("#scanning").addClass("hidden");
        $('.glyphicon-user').css({
            right: 0,
            top: 0
        });
    }
    $('input').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
    });
    var ajaxFn = ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var lastUrl = GetCookie(lastLocation);
        if (!isStrEmptyOrUndefined(lastUrl)) {
            window.location.href = lastUrl;
            return;
        }
        var first = indexUrl;
        var find = false;
        var permissionPageTypes = ['工作台', '维修管理', '系统管理', '设备管理', '设备点检', '流程卡管理', '工艺管理', '生产管理', '计划管理', '物料管理', '6s检查', '数据统计', '权限管理'];
        for (var i = 0; i < permissionPageTypes.length; i++) {
            if (find) break;
            for (var j = 0; j < rData.length; j++) {
                if (find && !isStrEmptyOrUndefined(first)) break;
                var d = rData[j];
                if (d.label == permissionPageTypes[i]) {
                    first = d.url;
                    find = true;
                }
            }
        }
        window.location.href = first;
    };
    $("#loginBtn").click(function () {
        var account = $("#account").val();
        if (isStrEmptyOrUndefined(account)) {
            showTip($("#accountTip"), "账号不能为空");
            return;
        }
        var data = {};
        var url = '';
        if (account.substr(-2) == ',,') {
            data.number = account.slice(0, -2);
            url = '/Account/NumberLogin';
        } else {
            var password = $("#password").val();
            if (isStrEmptyOrUndefined(password)) {
                showTip($("#passwordTip"), "密码不能为空");
                return;
            }
            var rememberMe = $("#rememberMe").is(':checked');
            var p = GetCookie("p");
            var pwdMd5 = p != password ? window.md5(password) : password;
            data.account = account;
            data.password = pwdMd5;
            data.rememberMe = rememberMe;
            url = '/Account/Login';
        }
        ajaxPost(url, data, ajaxFn);
    });

    var acc = getQueryString("acc");
    var pwd = getQueryString("pwd");
    if (!isStrEmptyOrUndefined(acc) && !isStrEmptyOrUndefined(acc)) {
        $("#account").val(acc);
        $("#password").val(pwd);
        $("#loginBtn").click();
    } else {
        //var n = GetCookie("n");
        //var p = GetCookie("p");
        //if (!isStrEmptyOrUndefined(n) && !isStrEmptyOrUndefined(p)) {
        //    $("#account").attr("value",n);
        //    $("#password").attr("value", p);
        //    $("#rememberMe").iCheck('check');
        //}
    }
    $(document).keydown(function (event) {
        if (event.keyCode === 13) {
            $("#loginBtn").click();
        } else {
            if (!$("#password").is(':focus')) {
                $("#account").trigger('focus');
            } else {
                var password = $("#password").val();
                if (password.indexOf(',') != -1) {
                    $("#account").val(`${password},`);
                }
            }
        }
    });
    $('#account').on('input', function () {
        $(this).trigger('blur').trigger('focus');
    });
    $('#scanning').on('click', () => {
        new Promise(resolve => {
            showPrintModal(resolve);
        }).then(result => {
            if (result) {
                ajaxPost('/Account/NumberLogin', { number: result.slice(0, -2) }, ajaxFn);
            }
        });
    });
});