function pageReady() {
    $('.ms2').select2();
    getWorkGroup();
    var nowMonth = getMonthScope();
    $('#sTime,#plansTime').val(nowMonth.start).datepicker('update');
    $('#eTime,#planeTime').val(nowMonth.end).datepicker('update');
    var throttle = () => {
        var begin = new Date();
        return () => {
            var current = new Date();
            if (current - begin >= 200) {
                echarts.init($('#performance_chart')[0]).resize();
                begin = current;
            }
        }
    };
    $('#performance_chart').on("resize", throttle());
    $('#plan_li').one('click', () => getPlan());
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
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Group);
        }
        $('.work-group').append(options);
    });
}

//获取计划号
function getPlan() {
    var data = {}
    data.opType = 1039;
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#planItem').empty();
        var list = ret.datas;
        var option = '<label class="flexStyle pointer"><input type="checkbox" class="icb_minimal" value="{0}"><span class="textOverTop" style="margin-left: 5px" title="{1}">{1}</span></label>';
        var options = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            options += option.format(d.Id, d.Plan);
        }
        $('#planItem').append(options);
        $('#planItem .icb_minimal').iCheck({
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
        var rData = ret.datas;
        var xData = [], yData = [];
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            xData.push(d.Processor);
            yData.push(d.Score);
        }
        var option = {
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
                type: 'category',
                data: xData
            },
            yAxis: {
                type: 'value'
            },
            series: {
                name: '绩效',
                type: 'bar',
                barWidth: '60%',
                label: {
                    show: true,
                    position: 'top'
                },
                data: yData
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
        echarts.init($('#performance_chart')[0]).setOption(option);
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
    var eTime = $("#plansTime").val().trim();
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
    });
}

//获取任务平均用时统计表
function getTaskTimeChart() {

}