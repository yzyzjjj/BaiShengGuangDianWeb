function pageReady() {
    getSpotPlan();
}
//获取点检计划
function getSpotPlan() {
    var opType = 600;
    if (!checkPermission(opType)) {
        layer.msg("没有权限");
        return;
    }
    var data = {}
    data.opType = opType;
    ajaxPost("/Relay/Post", data, function(ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        console.log(ret);
    });
}