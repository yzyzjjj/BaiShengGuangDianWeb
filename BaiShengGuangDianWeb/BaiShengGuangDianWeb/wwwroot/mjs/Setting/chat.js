function pageReady() {

    var ops = "";
    for (let key in chatEnum) {
        ops += `<option value="${chatEnum[key]}">${key}</option>`;
    }
    $('#selectType').html(ops);
    $("#btnSend").click(function () {
        $('#text').val("");
        var val = $('#selectType').val() >> 0;
        switch (val) {
            case chatEnum.Unknown: break;
            //回复
            case chatEnum.Back: break;
            // 连接
            case chatEnum.Connect: break;
            // 登出
            case chatEnum.Logout: break;
            // 测试
            case chatEnum.Test:
                hubConnection.SendMsg(val,
                    getFullTime(),
                    (res) => {
                        $('#text').val(res);
                    });
                break;
            // 故障设备
            case chatEnum.FaultDevice:
                var admins = new Array();
                admins.push({
                    Admin: "百盛光电",
                    Code: "1号机"
                });
                admins.push({
                    Admin: "百盛光电",
                    Code: "2号机"
                });

                for (var i = 0; i < admins.length; i++) {
                    var admin = admins[i];
                    //调用服务器方法
                    hubConnection.SendMsg(val,
                    {
                        Admin: admin.Admin,
                        Code: admin.Code
                    });
                }
                break;
            // 更新连接
            case chatEnum.RefreshId: break;

            default:
        }

    });
}

