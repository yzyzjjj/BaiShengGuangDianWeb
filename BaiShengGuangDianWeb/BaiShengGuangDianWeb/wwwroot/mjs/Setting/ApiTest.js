function pageReady() {
}

function GetDeviceCategory() {
    var data = {}
    data.opType = 106
    //data.opData = 106
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

        });

}

function GetDeviceCategory() {
    var data = {}
    data.opType = 107
    //data.opData = 106
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

        });

}