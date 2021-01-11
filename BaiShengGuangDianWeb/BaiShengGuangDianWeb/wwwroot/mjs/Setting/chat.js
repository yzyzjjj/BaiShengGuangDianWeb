function pageReady() {

    $("#btnSend").click(function () {
        $('#text').html("");
        ////新建对象
        //var obj = new Object();
        //obj.Time = getFullTime();
        //var info = {
        //    ChatEnum: chatEnum.Default,
        //    Message:obj
        //}
        ////调用服务器方法
        //hubConnection.invoke('SendMsg', info);
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
            var info = {
                ChatEnum: chatEnum.FaultDevice,
                Message: {
                    Admin: admin.Admin,
                    Code: admin.Code
                }
            }
            //调用服务器方法
            hubConnection.invoke('SendMsg', info);
        }

    });
}

