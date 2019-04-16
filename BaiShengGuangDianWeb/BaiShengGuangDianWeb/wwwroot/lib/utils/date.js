//定义一点时间的帮助方法
$('.form_date').datepicker({
    language: 'zh-CN',
    format: 'yyyy-mm-dd',
    //endDate:getDayAfter(1),
    maxViewMode: 2,
    todayBtn: "linked",
    autoclose: true

});
$('.form_month').datepicker({
    language: 'zh-CN',
    format: 'yyyy-mm',
    startView: 2,
    minViewMode: 1,
    maxViewMode: 2,
    todayBtn: "linked",
    autoclose: true

});
$('.form_time').timepicker({
    language: 'zh-CN'
});
function padLeft0(obj) {
    return obj.toString().replace(/^[0-9]{1}$/, "0" + obj);
}

Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}
//获得今日日期
function getNow() {
    var nowTime = new Date();
    var year = nowTime.getFullYear();
    var month = padLeft0(nowTime.getMonth() + 1);
    var day = padLeft0(nowTime.getDate());
    return year + "-" + month + "-" + day;
}

function getNowTime() {
    var nowTime = new Date();
    return nowTime.format('hh:mm');
}

function getFullTime() {
    var nowTime = new Date();
    var year = nowTime.getFullYear();
    var month = padLeft0(nowTime.getMonth() + 1);
    var day = padLeft0(nowTime.getDate());
    var hour = nowTime.getHours();
    var min = nowTime.getMinutes();
    var sec = nowTime.getSeconds();
    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}

//获得x天后日期
function getDayAfter(number) {
    var nowTime = new Date();
    nowTime.setDate(nowTime.getDate() + number);
    var year = nowTime.getFullYear();
    var month = padLeft0(nowTime.getMonth() + 1);
    var day = padLeft0(nowTime.getDate());

    return year + "-" + month + "-" + day;
}


//获得x天前日期
function getDayAgo(daysAgo) {
    var nowTime = new Date();
    nowTime.setDate(nowTime.getDate() - daysAgo);
    var year = nowTime.getFullYear();
    var month = padLeft0(nowTime.getMonth() + 1);
    var day = padLeft0(nowTime.getDate());

    return year + "-" + month + "-" + day;
}

//获得当前月份
function getNowMonth() {
    var nowTime = new Date();
    var year = nowTime.getFullYear();
    var month = padLeft0(nowTime.getMonth() + 1);

    return year + "-" + month;
}
//获得当前年份
function getNowYear() {
    var nowTime = new Date();
    var year = nowTime.getFullYear();

    return year;
}