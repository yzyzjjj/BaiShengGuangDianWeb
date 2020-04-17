$(function () {
    $('input').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
    });
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
        ajaxPost(url, data,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }

                var lastUrl = GetCookie(lastLocation);
                if (!isStrEmptyOrUndefined(lastUrl)) {
                    DelCookie(lastLocation);
                    window.location.href = lastUrl;
                    return;
                }
                var first = indexUrl;
                var find = false;
                for (var i = 0; i < PermissionPageTypes.length; i++) {
                    if (find) break;
                    const parent = PermissionPageTypes[i];
                    for (var j = 0; j < ret.datas.length; j++) {
                        if (find) break;
                        var data = ret.datas[j];
                        if (data.label == parent.name) {
                            first = data.url;
                            find = true;
                        }
                    }
                }
                window.location.href = first;
            });
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
});