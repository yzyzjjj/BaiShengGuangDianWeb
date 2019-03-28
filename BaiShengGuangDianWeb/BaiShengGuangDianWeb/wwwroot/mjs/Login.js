$(function () {
    $('input').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' // optional
    });

    var token = GetCookie("token")
    //if ( isTokenValid())  {
    //    $("#tipinfo").show();
    //    $("#tipinfo").text("已有账号登录，重登会覆盖。")
    //}

    $("#loginBtn").click(function () {
        var acc = $("#Account").val();
        var pwd = $("#Password").val();

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
        data.Account = acc;
        data.Password = pwdMd5;

        ajaxPost("/Account/Login", data,
            function (ret) {
                if (ret.errno != 0) {
                    layer.msg(ret.errmsg);
                    return;
                }

                window.location.href = const_indexurl;
            });
    });
});