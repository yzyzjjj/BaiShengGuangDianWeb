$(function () {
    $('input').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
    });

    $("#loginBtn").click(function () {
        var acc = $("#account").val();
        var pwd = $("#password").val();

        if (acc == "") {
            $("#tipinfo").show();
            $("#tipinfo").text("账号不能为空");
            return;
        }
        if (pwd == "") {
            $("#tipinfo").show();
            $("#tipinfo").text("密码不能为空");
            return;
        }


        var pwdMd5 = window.md5(window.md5(pwd));

        var data = {}
        data.account = acc;
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
                window.location.href = const_indexurl;
            });
    });
});