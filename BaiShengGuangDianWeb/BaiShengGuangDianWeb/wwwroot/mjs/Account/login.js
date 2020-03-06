$(function () {
    $('input').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
    });
    $("#loginBtn").click(function () {
        var account = $("#account").val();
        var password = $("#password").val();
        var rememberMe = $("#rememberMe").is(':checked');

        if (isStrEmptyOrUndefined(account)) {
            showTip($("#accountTip"), "账号不能为空");
            return;
        }
        if (isStrEmptyOrUndefined(password)) {
            showTip($("#passwordTip"), "密码不能为空");
            return;
        }

        var p = GetCookie("p");
        //var pwdMd5 = password;
        var pwdMd5 = p != password  ? window.md5(password) : password;
        //var pwdMd5 = window.md5(window.md5(password));

        var data = {}
        data.account = account;
        data.password = pwdMd5;
        data.rememberMe = rememberMe;

        ajaxPost("/Account/Login", data,
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
        var n = GetCookie("n");
        var p = GetCookie("p");
        if (!isStrEmptyOrUndefined(n) && !isStrEmptyOrUndefined(p)) {
            $("#account").attr("value",n);
            $("#password").attr("value", p);
            $("#rememberMe").iCheck('check');
        }
    }
    $(document).keydown(function (event) {
        if (event.keyCode === 13) {
            $("#loginBtn").click();
        }
    });
});