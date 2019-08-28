$(function () {
    $('input').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
    });
    $("#loginBtn").click(function () {
        var account = $("#account").val();
        var password = $("#password").val();

        if (isStrEmptyOrUndefined(account)) {
            showTip($("#accountTip"),"账号不能为空");
            return;
        }
        if (isStrEmptyOrUndefined(password)) {
            showTip($("#passwordTip"),"密码不能为空");
            return;
        }

        //var pwdMd5 = password;
        var pwdMd5 = window.md5(password);
        //var pwdMd5 = window.md5(window.md5(password));
        
        var data = {}
        data.account = account;
        data.password = pwdMd5;

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
                window.location.href = indexUrl;
            });
    });

    var acc = getQueryString("acc");
    var pwd = getQueryString("pwd");
    if (!isStrEmptyOrUndefined(acc) && !isStrEmptyOrUndefined(acc)) {
        $("#account").val(acc);
        $("#password").val(pwd);
        $("#loginBtn").click();
    }
    $(document).keydown(function (event) {
        if (event.keyCode === 13) {
            $("#loginBtn").click();
        }
    });
});