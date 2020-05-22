function pageReady() {
    $('.ms2').select2();
    getWorkGroup();
    var nowMonth = getMonthScope();
    $('#sTime,#plansTime,#tasksTime').val(nowMonth.start).datepicker('update');
    $('#eTime,#planeTime,#taskeTime').val(nowMonth.end).datepicker('update');
    $('#monthTime').val(getNowMonth()).datepicker('update');
    var time = 0;
    $('#performance_chart,#plan_chart,#task_chart,#finish_chart').on("resize", e => {
        clearTimeout(time);
        time = setTimeout(() => echarts.init($(`#${e.target.id}`)[0]).resize(), 200);
    });
    $('#plan_li').one('click', () => getPlan('#planItem'));
    $('#planAll').on('ifChanged', function () {
        if ($(this).is(':checked')) {
            $('#planItem .icb_minimal').iCheck('check');
        } else {
            if (_planTime.length == $('#planItem').children().length) {
                $('#planItem .icb_minimal').iCheck('uncheck');
            }
        }
    });
    $('#planItem').on('ifChanged', '.icb_minimal', function () {
        var v = $(this).val();
        if ($(this).is(':checked')) {
            _planTime.push(v);
            if (_planTime.length == $('#planItem').children().length) {
                $('#planAll').iCheck('check');
            }
        } else {
            _planTime.splice(_planTime.indexOf(v), 1);
            if (_planTime.length == $('#planItem').children().length - 1) {
                $('#planAll').iCheck('uncheck');
            }
        }
    });
    $('#task_li').one('click', () => getPlan('#taskItem'));
    $('#taskAll').on('ifChanged', function () {
        if ($(this).is(':checked')) {
            $('#taskItem .icb_minimal').iCheck('check');
        } else {
            if (_taskTime.length == $('#taskItem').children().length) {
                $('#taskItem .icb_minimal').iCheck('uncheck');
            }
        }
    });
    $('#taskItem').on('ifChanged', '.icb_minimal', function () {
        var v = $(this).val();
        if ($(this).is(':checked')) {
            _taskTime.push(v);
            if (_taskTime.length == $('#taskItem').children().length) {
                $('#taskAll').iCheck('check');
            }
        } else {
            _taskTime.splice(_taskTime.indexOf(v), 1);
            if (_taskTime.length == $('#taskItem').children().length - 1) {
                $('#taskAll').iCheck('uncheck');
            }
        }
    });
    $('#finish_li').one('click', () => getProcessor());
    $('#finishGroupSelect').on('select2:select', () => getProcessor());
    //$('#finishAll').on('ifChanged', function () {
    //    if ($(this).is(':checked')) {
    //        $('#finishItem .icb_minimal').iCheck('check');
    //    } else {
    //        if (_finishStatus.length == $('#finishItem').children().length) {
    //            $('#finishItem .icb_minimal').iCheck('uncheck');
    //        }
    //    }
    //});
    //$('#finishItem').on('ifChanged', '.icb_minimal', function () {
    //    var v = $(this).val();
    //    if ($(this).is(':checked')) {
    //        _finishStatus.push(v);
    //        if (_finishStatus.length == $('#finishItem').children().length) {
    //            $('#finishAll').iCheck('check');
    //        }
    //    } else {
    //        _finishStatus.splice(_finishStatus.indexOf(v), 1);
    //        if (_finishStatus.length == $('#finishItem').children().length - 1) {
    //            $('#finishAll').iCheck('uncheck');
    //        }
    //    }
    //});
}

//柱状图
var _option = {
    color: ['#3398DB'],
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    grid: {
        left: '3%',
        right: '3%',
        top: '6%',
        bottom: '8%',
        containLabel: true
    },
    xAxis: {
        type: 'category'
    },
    yAxis: {
        type: 'value'
    },
    series: {
        type: 'bar',
        barWidth: '60%',
        label: {
            show: true,
            position: 'top'
        }
    },
    dataZoom: [{
        type: 'inside'
    }, {
        handleIcon: _handleIcon,
        handleSize: '80%',
        handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
        }
    }],
    toolbox: {
        left: 'center',
        feature: {
            dataZoom: {
                yAxisIndex: "none"
            },
            restore: {}
        }
    }
};

//图表设置
function setChart(arr, x, y, name, chartEl) {
    var xData = [], yData = [];
    for (var i = 0, len = arr.length; i < len; i++) {
        var d = arr[i];
        xData.push(d[x]);
        yData.push(d[y]);
    }
    var op = $.extend(true, {}, _option);
    op.xAxis.data = xData;
    op.series.data = yData;
    op.series.name = name;
    echarts.init($(chartEl)[0]).setOption(op);
}

//折叠复选框项
function foldList(el) {
    $(el).toggleClass('hidden');
    $(this).toggleClass('glyphicon-triangle-left glyphicon-triangle-right').prop('title', $(el).is(':hidden') ? '展开' : '收起');
}

//获取工作组
function getWorkGroup() {
    var data = {}
    data.opType = 1077;
    data.opData = JSON.stringify({
        menu: true
    });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('.work-group').empty();
        var list = ret.datas;
        var option = '<option value="{0}">{1}</option>';
        var options = '<option value="0">所有</option>';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Group);
        }
        $('.work-group').append(options);
    });
}

//获取操作员
function getProcessor() {
    var groupId = $('#finishGroupSelect').val();
    var data = {}
    data.opType = 1081;
    data.opData = JSON.stringify({
        groupId: groupId,
        menu: true
    });
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#finishItem').empty();
        var list = ret.datas;
        var option = '<label class="flexStyle pointer"><input type="radio" class="icb_minimal" name="radio" value="{0}"><span class="textOverTop" style="margin-left: 5px" title="{1}">{1}</span></label>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Account, d.Processor);
        }
        $('#finishItem').append(options);
        $('#finishItem .icb_minimal').iCheck({
            handle: 'radio',
            radioClass: 'iradio_minimal-green',
            increaseArea: '20%'
        });
    });
}

//获取计划号
function getPlan(el) {
    var data = {}
    data.opType = 1039;
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $(el).empty();
        var list = ret.datas;
        var option = '<label class="flexStyle pointer"><input type="checkbox" class="icb_minimal" value="{0}"><span class="textOverTop" style="margin-left: 5px" title="{1}">{1}</span></label>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Plan);
        }
        $(el).append(options);
        $(`${el} .icb_minimal`).iCheck({
            handle: 'checkbox',
            checkboxClass: 'icheckbox_minimal-green',
            increaseArea: '20%'
        });
    });
}

//获取绩效统计表
function getPerformanceChart() {
    var gId = $('#workGroupSelect').val();
    if (isStrEmptyOrUndefined(gId)) {
        layer.msg('请选择工作组');
        return;
    }
    var sTime = $("#sTime").val().trim();
    var eTime = $("#eTime").val().trim();
    if (isStrEmptyOrUndefined(sTime)) {
        layer.msg('请选择开始时间');
        return;
    }
    if (isStrEmptyOrUndefined(eTime)) {
        layer.msg('请选择结束时间');
        return;
    }
    if (compareDate(sTime, eTime)) {
        layer.msg('开始时间不能大于结束时间');
        return;
    }
    sTime = `${sTime} 00:00:00`;
    eTime = `${eTime} 23:59:59`;
    var data = {}
    data.opType = 1098;
    data.opData = JSON.stringify({ gId, sTime, eTime });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            $('#performance_chart').addClass('hidden');
            return;
        }
        $('#performance_chart').removeClass('hidden');
        setChart(ret.datas, 'Processor', 'Score', '绩效', '#performance_chart');
    });
}

var _planTime = [];
//获取计划实际用时统计表
function getPlanTimeChart() {
    var gId = $('#planGroupSelect').val();
    if (isStrEmptyOrUndefined(gId)) {
        layer.msg('请选择工作组');
        return;
    }
    var sTime = $("#plansTime").val().trim();
    var eTime = $("#planeTime").val().trim();
    if (isStrEmptyOrUndefined(sTime)) {
        layer.msg('请选择开始时间');
        return;
    }
    if (isStrEmptyOrUndefined(eTime)) {
        layer.msg('请选择结束时间');
        return;
    }
    if (compareDate(sTime, eTime)) {
        layer.msg('开始时间不能大于结束时间');
        return;
    }
    sTime = `${sTime} 00:00:00`;
    eTime = `${eTime} 23:59:59`;
    if (!_planTime.length) {
        layer.msg('请勾选计划号');
        return;
    }
    var planId = _planTime.join(',');
    var data = {}
    data.opType = 1099;
    data.opData = JSON.stringify({ gId, sTime, eTime, planId });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            $('#plan_chart').addClass('hidden');
            return;
        }
        $('#plan_chart').removeClass('hidden');
        setChart(ret.datas, 'Plan', 'Consume', '实际用时', '#plan_chart');
    });
}

var _taskTime = [];
//获取任务平均用时统计表
function getTaskTimeChart() {
    var gId = $('#taskGroupSelect').val();
    if (isStrEmptyOrUndefined(gId)) {
        layer.msg('请选择工作组');
        return;
    }
    var sTime = $("#tasksTime").val().trim();
    var eTime = $("#taskeTime").val().trim();
    if (isStrEmptyOrUndefined(sTime)) {
        layer.msg('请选择开始时间');
        return;
    }
    if (isStrEmptyOrUndefined(eTime)) {
        layer.msg('请选择结束时间');
        return;
    }
    if (compareDate(sTime, eTime)) {
        layer.msg('开始时间不能大于结束时间');
        return;
    }
    sTime = `${sTime} 00:00:00`;
    eTime = `${eTime} 23:59:59`;
    if (!_taskTime.length) {
        layer.msg('请勾选计划号');
        return;
    }
    var planId = _taskTime.join(',');
    var data = {}
    data.opType = 1100;
    data.opData = JSON.stringify({ gId, sTime, eTime, planId });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            $('#task_chart').addClass('hidden');
            return;
        }
        $('#task_chart').removeClass('hidden');
        setChart(ret.datas, 'Item', 'Avg', '平均用时', '#task_chart');
    });
}

//获取月份范围
function getMonthDay(monthTime) {
    var timeArr = monthTime.split('-');
    var year = timeArr[0] >> 0;
    var month = timeArr[1] >> 0;
    var day = new Date(year, month, 0).getDate();
    return {
        sTime: `${monthTime}-01`,
        eTime: `${monthTime}-${day}`
    }
}

//var _finishStatus = [];
//获取任务完成情况汇总表
function getTaskFinishChart() {
    var monthTime = $("#monthTime").val().trim();
    if (isStrEmptyOrUndefined(monthTime)) {
        layer.msg('请选择月份');
        return;
    }
    var time = getMonthDay(monthTime);
    var sTime = time.sTime;
    var eTime = time.eTime;
    var gId = $('#finishGroupSelect').val();
    if (isStrEmptyOrUndefined(gId)) {
        layer.msg('请选择工作组');
        return;
    }
    //if (!_finishStatus.length) {
    //    layer.msg('请勾选操作员');
    //    return;
    //}
    //var account = _finishStatus.join(',');
    var account = $('#finishItem .icb_minimal:checked').val();
    if (isStrEmptyOrUndefined(account)) {
        layer.msg('请选择操作员');
        return;
    }
    var data = {}
    data.opType = 1101;
    data.opData = JSON.stringify({
        gId,
        sTime: `${sTime} 00:00:00`,
        eTime: `${eTime} 23:59:59`,
        account
    });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            $('#finish_chart').addClass('hidden');
            return;
        }
        $('#finish_chart').removeClass('hidden');
        var rData = ret.datas;
        var obj = {};
        var i = 0, len = rData.length;
        for (; i < len; i++) {
            var time = rData[i].ActualEndTime.split(' ')[0];
            obj[time] ? obj[time].push(rData[i].Item) : obj[time] = [rData[i].Item];
        }
        var system = getChartData(monthTime, obj);
        var arr = [];
        var max = 1;
        for (var k in obj) {
            var objArr = obj[k];
            max = objArr.length > max ? objArr.length : max;
            objArr.unshift(k,1);
            arr.push(objArr);
        }
        var option = {
            tooltip: {
                formatter: function (params) {
                    var day = params.value[0];
                    var str = '完成任务：';
                    var d = obj[day];
                    if (d) {
                        for (i = 2, len = d.length; i < len; i++) {
                            str += `<br>&nbsp&nbsp${d[i]}`;
                        }
                    } else {
                        str += '<br>&nbsp&nbsp无';
                    }
                    return str;
                }
            },
            visualMap: {
                show: false,
                min: 0,
                max: max,
                inRange: {
                    color: ['#fff', '#00A9FC']
                }
            },
            calendar: {
                top: 40,
                left: 'center',
                cellSize: ['auto',100],
                range: monthTime,
                itemStyle: {
                    borderWidth: 1
                },
                yearLabel: { show: false },
                monthLabel: { show: false },
                orient: 'vertical',
                dayLabel: {
                    margin: 20,
                    firstDay: 1,
                    nameMap: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
                    fontSize: 15,
                    fontWeight: 700
                }
            },
            series: [{
                type: 'scatter',
                coordinateSystem: 'calendar',
                symbolSize: 1,
                label: {
                    show: true,
                    formatter: params => {
                        var arrData = params.value;
                        var str = '';
                        for (i = 2, len = arrData.length; i < len; i++) {
                            str += `\n${arrData[i]}`;
                            if (i == 6) {
                                str += '\n...';
                                break;
                            }
                        }
                        return str;
                    },
                    fontSize: 14,
                    color: '#000'
                },
                data: arr
            }, {
                type: 'heatmap',
                coordinateSystem: 'calendar',
                label: {
                    show: true,
                    formatter:  params => {
                        return echarts.number.parseDate(params.value[0]).getDate();
                    },
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#000',
                    position: 'insideTopRight'
                },
                data: system
            }]
        };
        echarts.init($('#finish_chart')[0]).setOption(option);
    });
}

//图表时间范围
function getChartData(monthTime, obj = {}) {
    var arr = monthTime.split('-');
    var date = +echarts.number.parseDate(monthTime);
    var end = +echarts.number.parseDate(`${arr[0]}-${(arr[1] >> 0) + 1}`);
    var dayTime = 3600 * 24 * 1000;
    var data = [];
    for (var time = date; time < end; time += dayTime) {
        var d = echarts.format.formatTime('yyyy-MM-dd', time);
        data.push([d, obj[d] ? obj[d].length : 0]);
    }
    return data;
}