
const weekNames = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const conOptions = ["大于", "大于等于", "等于", "小于", "小于等于", "不等于"].reduce((a, b, i) => `${a}<option value="${i}">${b}</option>`, '');
//const itemShowOptions = ["表格", "折线图", "柱状图", "饼图"].reduce((a, b, i) => `${a}<option value="${i}">${b}</option>`, '');
const itemShowOptions = ["折线图", "柱状图", "饼图"].reduce((a, b, i) => `${a}<option value="${i}">${b}</option>`, '');
const dataGroups = ["设备", "计划号", "操作工"];
const dataGroupOptions = dataGroups.reduce((a, b, i) => `${a}<option value="${i}">${b}</option>`, '');
//const timeRangeTypes = ["前多少时间", "指定时间", "时间范围"];
//const timeRangeTypes = ["前", "指定时间", "时间范围"];
const timeRangeTypes = ["前", "指定"];
const timeRangeOptions = timeRangeTypes.reduce((a, b, i) => `${a}<option value="${i}">${b}</option>`, '');
const timeTypes = ["小时", "天", "周", "月", "年"];
const timeOptions = timeTypes.reduce((a, b, i) => `${a}<option value="${i}">${b}</option>`, '');
function timeUnderTypes(timeType) {
    return timeTypes.filter((_, i) => i < timeType);
}
function timeUnderOptions(timeType) {
    return timeUnderTypes(timeType).reduce((a, b, i) => i == 2 ? a : `${a}<option value="${i}">${b}</option>`, '');
}

function timeRanges(timeType, cTimeType, t1 = 0, t2 = 0) {
    var res = [];
    switch (cTimeType) {
        //小时
        case 0:
            for (var i = 0; i < 24; i++) {
                if (t1 && t2 && i < t1 && i > t2)
                    continue;
                res.push(`${i}点`);
            }
            break;
        //天
        case 1:
            switch (timeType) {
                //周
                case 2:
                    for (var i = 0; i < 7; i++) {
                        if (t1 && t2 && i < t1 && i > t2)
                            continue;
                        res.push(weekNames[i]);
                    }
                    break;
                //月
                case 3:
                    for (var i = 1; i < 32; i++) {
                        if (t1 && t2 && i < t1 && i > t2)
                            continue;
                        res.push(`${i}日`);
                    }
                    break;
                //年
                case 4:
                    var first = new Date(2020, 0, 1);
                    var end = new Date(2021, 0, 1);
                    while (first < end) {
                        if (t1 && t2 && first < t1 && first > t2)
                            continue;
                        res.push(monthDay(first, 1));
                        addDays(first, 1);
                    }
                    break;
            }
            break;
        //周
        case 2:
            switch (timeType) {
                //月
                case 3:
                    for (var i = 1; i < 5; i++) {
                        if (t1 && t2 && i < t1 && i > t2)
                            continue;
                        res.push(`第${i}周`);
                    }
                    break;
                //年
                case 4:
                    for (var i = 1; i < 54; i++) {
                        if (t1 && t2 && i < t1 && i > t2)
                            continue;
                        res.push(`第${i}周`);
                    }
                    break;
            }
            break;
        //月
        case 3:
            switch (timeType) {
                //年
                case 4:
                    for (var i = 1; i < 13; i++) {
                        if (t1 && t2 && i < t1 && i > t2)
                            continue;
                        res.push(`${i}月`);
                    }
                    break;
            }
            break;
    }
    return res;
}

//function timeRanges(timeType, t1 = 0, t2 = 0) {
//    var res = [];
//    switch (timeType) {
//        //小时返回分
//        case 0:
//            for (var i = 0; i < 60; i++) {
//                if (t1 && t2 && i < t1 && i > t2)
//                    continue;
//                res.push(`${i}分`);
//            }
//            break;
//        //天返回小时
//        case 1:
//            for (var i = 0; i < 24; i++) {
//                if (t1 && t2 && i < t1 && i > t2)
//                    continue;
//                res.push(`${i}点`);
//            }
//            break;
//        //周返回周几
//        case 2:
//            for (var i = 0; i < 7; i++) {
//                if (t1 && t2 && i < t1 && i > t2)
//                    continue;
//                res.push(weekNames[i]);
//            }
//            break;
//        //月返回天
//        case 3:
//            for (var i = 1; i < 32; i++) {
//                if (t1 && t2 && i < t1 && i > t2)
//                    continue;
//                res.push(`${i}日`);
//            }
//            break;
//        //年返回月
//        case 4:
//            for (var i = 1; i < 24; i++) {
//                if (t1 && t2 && i < t1 && i > t2)
//                    continue;
//                res.push(`${i}月`);
//            }
//            break;
//    }
//    return res;
//}

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

//获取几小时前的时间
function getHourAgo(n = 1) {
    var now = new Date();
    now.setMinutes(now.getMinutes() - 60 * n);
    return now.format("yyyy-MM-dd hh:mm:ss");
}

//获得今日日期
function getDate(date = undefined) {
    return (date ? new Date(date) : new Date()).format("yyyy-MM-dd");
    var nowTime = new Date();
    var year = nowTime.getFullYear();
    //var month = padLeft0(nowTime.getMonth() + 1);
    //var day = padLeft0(nowTime.getDate());
    var month = nowTime.getMonth() + 1;
    var day = nowTime.getDate();
    return year + "-" + month + "-" + day;
}

//获得今日日期
function getDay(date = undefined, type = 0) {
    var t = (date ? new Date(date) : new Date());
    switch (type) {
        case 0: t = t.getDate(); break;
        case 1: t = `${t.getDate()}日`; break;
        case 2: t = padLeft0(t.getDate()); break;
    }
    return t;
}

function getHour(time, type = 0) {
    var t = (time ? new Date(time) : new Date()).getHours();
    switch (type) {
        case 0: break;
        case 1: t += "点"; break;
    }
    return t;
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
function getNowWeekRange(weekDay = 1) {
    return {
        start: new Date(new Date().setDate(new Date().getDate() - (weekDay - 1))).format("yyyy-MM-dd"),
        end: new Date(new Date().setDate(new Date().getDate() + (7 - weekDay))).format("yyyy-MM-dd")
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
function getNowMonth(time, type = 0) {
    var t = (time ? new Date(time) : new Date());
    var year = t.getFullYear();
    var month = t.getMonth() + 1;
    switch (type) {
        case 0: t = `${year}年${month}月`; break;
        case 1: t = `${month}月`; break;
        case 2: ; break;
    }
    return t;
}

//获得当前年份
function getNowYear(time, type = 0) {
    var t = (time ? new Date(time) : new Date()).getFullYear();
    switch (type) {
        case 0: break;
        case 1: t += "年"; break;
    }
    return t;
}

////获得当前年第几周
//function getWeek(time, type = 0) {
//    var t = (time ? new Date(time) : new Date()).getFullYear();
//    switch (type) {
//        case 0: t = !time ? `${getNowYear()}第${$.datepicker.iso8601Week(new Date())}周`
//            : `${getNowYear(time)}第${$.datepicker.iso8601Week(new Date(time))}周`; break;
//        case 1: t = !time ? `第${$.datepicker.iso8601Week(new Date())}周`
//            : `第${$.datepicker.iso8601Week(new Date(time))}周`; break;
//    }
//    return t;
//}
function getWeekInMonth(time, type = 0) {
    var t = (time ? new Date(time) : new Date());
    var date = t,
        w = date.getDay(),
        d = date.getDate(),
        week = Math.ceil((d + 6 - w) / 7);
    if (w == 0) {
        w = 7;
    }
    switch (type) {
        case 0: t = {
            getMonth: t.getMonth() + 1,
            getYear: t.getFullYear(),
            getWeek: week,
        }; break;
        case 1: t = `第${week}周`; break;
        case 2: t = week; break;
    }
    return t;
}

//获得当前年第几周
function getWeek(time, type = 0) {
    var t = (time ? new Date(time) : new Date()).getFullYear();
    switch (type) {
        case 0: t = !time ? `${getNowYear()}第${$.datepicker.iso8601Week(new Date())}周`
            : `${getNowYear(time)}第${$.datepicker.iso8601Week(new Date(time))}周`; break;
        case 1: t = !time ? `第${$.datepicker.iso8601Week(new Date())}周`
            : `第${$.datepicker.iso8601Week(new Date(time))}周`; break;
    }
    return t;
}

//获得周几
function getWeekNames(time, type = 0) {
    return weekNames[(time ? new Date(time) : new Date()).getDay() - 1];
}

//计算两个日期天数差的函数，返回相差秒
function dateDiffSec(date1, date2) {
    var dt1 = new Date(Date.parse(date1));
    var dt2 = new Date(Date.parse(date2));
    //结果是天数
    var diff = parseInt((dt1.getTime() - dt2.getTime()) / (1000));
    //返回相差天数
    return diff;
}
//计算两个日期天数差的函数，返回相差分
function dateDiffMin(date1, date2) {
    var dt1 = new Date(Date.parse(date1));
    var dt2 = new Date(Date.parse(date2));
    //结果是天数
    var diff = parseInt((dt1.getTime() - dt2.getTime()) / (1000 * 60));
    //返回相差天数
    return diff;
}
//计算两个日期天数差的函数，返回相差时
function dateDiffHour(date1, date2) {
    var dt1 = new Date(Date.parse(date1));
    var dt2 = new Date(Date.parse(date2));
    //结果是天数
    var diff = parseInt((dt1.getTime() - dt2.getTime()) / (1000 * 60 * 60));
    //返回相差天数
    return diff;
}
//计算两个日期天数差的函数，返回相差天
function dateDiff(date1, date2) {
    var dt1 = new Date(Date.parse(date1));
    var dt2 = new Date(Date.parse(date2));
    //结果是天数
    var diff = parseInt((dt1.getTime() - dt2.getTime()) / (1000 * 60 * 60 * 24));
    //返回相差天数
    return diff;
}
//时间比较
function compareDate(date1, date2) {
    var oDate1 = new Date(date1);
    var oDate2 = new Date(date2);
    return oDate1.getTime() > oDate2.getTime();
}

//时间转化数组 0 年  1 月  2 日 3 周 4 小时
function exchangeDateArray(date1, date2, type = 0) {
    var dates = [];
    if (compareDate(date1, date2))
        return dates;
    var days = dateDiff(date2, date1) + 1;
    for (var i = 0; i < days; i++) {
        var t = new Date(date1);
        t.setDate(t.getDate() + i);
        dates.push(t.format("yyyy-MM-dd hh:mm:ss"));
    }
    return dates;
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

//秒换算成时间
function codeTime0(second) {
    var t = "";
    const d = Math.floor(second / 86400);
    d && (t += `${d}天`);
    second -= d * 86400;
    const h = Math.floor(second / 3600);
    h && (t += `${h}小时`);
    second -= h * 3600;
    const m = Math.floor(second / 60);
    m && (t += `${m}分`);
    second -= m * 60;
    second && (t += `${second}秒`);
    return t;
}

//秒换算成时间
function convertTime(d, hIf = true, mIf = true, sIf = true) {
    const h = hIf ? Math.floor(d / 3600) : 0;
    const m = mIf ? Math.floor((d - (h * 3600)) / 60) : 0;
    const s = sIf ? d - (h * 3600) - (m * 60) : 0;
    return { h, m, s };
}

//时间换算成秒
function convertSecond(h, m, s) {
    return h * 3600 + m * 60 + s;
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

//时间验证
function validTime(time) {
    return time != '0001-01-01 00:00:00' && time != '0001-01-01' && time != '00:00:00';
}

//时间不显示秒
function convertTime0(time) {
    return time == '0001-01-01 00:00:00' ? "" : time;
}

//时间显示日期
function convertTimeDay(time) {
    return time == '0001-01-01 00:00:00' ? "" : time.split(' ')[0];
}

//时间显示时分秒
function convertTimeHMS(time) {
    return time == '0001-01-01 00:00:00' ? "" : time.split(' ')[1];
}

//时间格式转换 mon月day日
function monthDay(time, type = 0) {
    time = new Date(time);
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    var day = time.getDate();
    switch (type) {
        case 0: return `${month}-${day}`;
        case 1: return `${month}月${day}日`;
        case 2: return `${month}/${day}`;
    }
    return ``;
}

/*
 *   参数:number,数值表达式，表示要添加的时间间隔的个数.
 *   参数:date,时间对象.
 *   参数:interval,字符串表达式，表示要添加的时间间隔.
 *   返回:新的时间对象.
 *   var now = new Date();
 *   var newDate = DateAdd(now, 5, "d");
 *---------------   DateAdd(date, number, interval)   -----------------
 */
function dateAdd(date, number, interval = "") {
    switch (interval) {
        //年
        case "y":
        case "year": {
            date.setFullYear(date.getFullYear() + number);
            return date;
            break;
        }
        //季度
        case "q":
        case "quarter": {
            date.setMonth(date.getMonth() + number * 3);
            return date;
            break;
        }
        //月
        case "mon":
        case "month": {
            date.setMonth(date.getMonth() + number);
            return date;
            break;
        }
        //周
        case "week": {
            date.setDate(date.getDate() + number * 7);
            return date;
            break;
        }
        //天
        case "d":
        case "day": {
            date.setDate(date.getDate() + number);
            return date;
            break;
        }
        //小时
        case "hour": {
            date.setHours(date.getHours() + number);
            return date;
            break;
        }
        //分
        case "minute":
        case "min": {
            date.setMinutes(date.getMinutes() + number);
            return date;
            break;
        }
        //秒
        case "second":
        case "sec": {
            date.setSeconds(date.getSeconds() + number);
            return date;
            break;
        }
        default: {
            date.setDate(date.getDate() + number);
            return date;
            break;
        }
    }
}

function addDays(date, n) {
    return dateAdd(date, n, "day");
}

function addWeeks(date, n) {
    return dateAdd(date, n, "week");
}

function addMonths(date, n) {
    return dateAdd(date, n, "month");
}

function addYears(date, n) {
    return dateAdd(date, n, "year");
}
