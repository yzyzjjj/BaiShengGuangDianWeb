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
function getDate() {
    return new Date().format("yyyy-MM-dd");
    var nowTime = new Date();
    var year = nowTime.getFullYear();
    var month = padLeft0(nowTime.getMonth() + 1);
    var day = padLeft0(nowTime.getDate());
    return year + "-" + month + "-" + day;
}

function getTime() {
    return new Date().format("hh:mm:ss");
    var nowTime = new Date();
    return nowTime.format("hh:mm:ss");
}

function getFullTime() {
    return new Date().format("yyyy-MM-dd hh:mm:ss");
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

//获得当前星期 范围  1 <= weekDay <= 7
function getNowWeekRange(weekDay = 0) {
    return {
        start: new Date(new Date().setDate(new Date().getDate() - (weekDay - 1))).format("yyyy-MM-dd"),
        end: new Date(new Date().setDate(new Date().getDate() + (weekDay - 7))).format("yyyy-MM-dd")
    };
}

//获得当前月份 范围  1 <= day <= 28
function getNowMonthRange(day = 0) {
    var nowTime = new Date();
    var startDay;
    var endDay;
    if (day <= nowTime.getDate()) {
        startDay = new Date(nowTime.getFullYear(), nowTime.getMonth(), day);
        endDay = new Date(nowTime.getFullYear(), nowTime.getMonth() + 1, day - 1);
    } else {
        startDay = new Date(nowTime.getFullYear(), nowTime.getMonth() - 1, day);
        endDay = new Date(nowTime.getFullYear(), nowTime.getMonth(), day - 1);
    }
    return {
        start: startDay.format("yyyy-MM-dd"),
        end: endDay.format("yyyy-MM-dd")
    };
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

function compareDate(date1, date2) {
    var oDate1 = new Date(date1);
    var oDate2 = new Date(date2);
    return oDate1.getTime() > oDate2.getTime();
}
//获得当前第几周
function getWeek() {
    return getNowYear() + "第" + $.datepicker.iso8601Week(new Date()) + "周";
}

//秒换算成时间
function codeTime(second) {
    if (second < 60) {
        return second + "秒";
    }
    if (second < 3600) {
        return (second - (second % 60)) / 60 + "分" + (second % 60) + "秒";
    }
    if (second < 86400) {
        return (second - (second % 3600)) / 3600 +
            "小时" +
            ((second - (second % 60)) / 60) % 60 +
            "分" +
            (second % 60) +
            "秒";
    } else {
        return (second - (second % 86400)) / 86400 +
            "天" +
            ((second - (second % 3600)) / 3600) % 24 +
            "小时" +
            ((second - (second % 60)) / 60) % 60 +
            "分" +
            (second % 60) +
            "秒";
    }
}

//选择时间是否超过当前时间
function exceedTime(date) {
    if (date.indexOf(" ") > -1) {
        return new Date(date).getTime() > new Date(getFullTime()).getTime();
    } else if (date.indexOf("-") > -1) {
        return new Date(date).getTime() > new Date(getDate()).getTime();
    } else {
        return new Date(getDate() + " " + date).getTime() > new Date(getFullTime()).getTime();
    }
}

//获取当前月份范围
function getMonthScope() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    return {
        start: `${year}-${padLeft0(month)}-01`,
        end: `${year}-${padLeft0(month)}-${new Date(year, month, 0).getDate()}`
    }
}

//时间不显示秒
function noShowSecond(time) {
    return time == '0001-01-01 00:00:00' || time == '' ? '' : time.slice(0, time.lastIndexOf(':'));
}