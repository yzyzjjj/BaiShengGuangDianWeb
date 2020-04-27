function pageReady() {
    $('.ms2').select2();
    getDevice();
}

//获取设备
function getDevice() {
    var data = {}
    data.opType = 100;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        var op = '<option value="{0}">{1}</option>';
        var ops = '';
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            ops += op.format(d.Id, d.Code, d.Administrator);
        }
    });
}