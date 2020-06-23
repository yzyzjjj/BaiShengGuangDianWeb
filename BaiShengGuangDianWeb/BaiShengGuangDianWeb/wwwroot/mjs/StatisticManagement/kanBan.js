function pageReady() {
    $('#kanBanList').select2();
    $('#deviceSelect').select2({
        allowClear: true,
        placeholder: '请选择',
        multiple: true
    });
    new Promise(resolve => getDevice(resolve)).then(e => {
        $('#deviceSelect').on('select2:select', function () {
            var v = $(this).val();
            if (v.indexOf('0') != -1) {
                $(this).val(e).trigger('change');
            }
        });
        kanBanChange();
    });
    $('#navUl').on('click', '.kanBan', function () {
        var flag = $(this).attr('href');
        var id = flag.replace('kanBan', '');
        setChart(flag, id);
    });
    $('#fullScreenBtn').on('click', function() {
        $('#tabBox').toggleClass('panel-fullscreen');
        var isShow = $('#tabBox').hasClass('panel-fullscreen');
        $(this).toggleClass('glyphicon-fullscreen glyphicon-repeat').prop('title', isShow ? '还原' : '全屏放大');
        isShow ? $('#firstNavLi').addClass('hidden') : $('#firstNavLi').removeClass('hidden');
        fullScreen(isShow);
    });
    $('#firstNavLi').on('click', function() {
        $('#fullScreenBtn').addClass('hidden');
    });
}

//图表设置
function setChart(flag, id) {
    var data = {
        opType: 509,
        opData: JSON.stringify({ type: id })
    };
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#fullScreenBtn').removeClass('hidden');
        var d = ret.data;
        //设备详情
        var allRateScale = setPieChart(`${flag}_detail`, 'Rate', d.AllProcessRate, '#0099ff');
        $(`${flag}_yxTime`).text(codeTime(d.RunTime));
        $(`${flag}_jgTime`).text(codeTime(d.ProcessTime));
        $(`${flag}_xzTime`).text(codeTime(d.IdleTime));
        $(`${flag}_lly`).text(allRateScale);
        //日最大使用率
        var maxUse = `${d.MaxUse}台`;
        var maxRateScale = setPieChart(`${flag}_max`, `Max\n${maxUse}`, d.MaxUseRate, '#00a65a');
        $(`${flag}_maxTs`).text(`${d.MaxSimultaneousUseRate}台`);
        $(`${flag}_maxTNum`).text(maxUse);
        $(`${flag}_maxSyl`).text(maxRateScale);
        //日最小使用率
        var minUse = `${d.MinUse}台`;
        var minRateScale = setPieChart(`${flag}_min`, `Min\n${minUse}`, d.MinUseRate, '#f39c12');
        $(`${flag}_minTs`).text(`${d.MinSimultaneousUseRate}台`);
        $(`${flag}_minTNum`).text(minUse);
        $(`${flag}_minSyl`).text(minRateScale);
        //设备状态
        var allDevice = d.AllDevice;
        var normalDevice = d.NormalDevice;
        var processDevice = d.ProcessDevice;
        var idleDevice = d.IdleDevice;
        var faultDevice = d.FaultDevice;
        var errorDevice = d.ConnectErrorDevice;
        setPieChart(`${flag}_state_all`, `${allDevice}台`, allDevice / allDevice, 'green', '总设备');
        setPieChart(`${flag}_state_normal`, `${normalDevice}台`, normalDevice / allDevice, 'blue', '正常运行');
        setPieChart(`${flag}_state_process`, `${processDevice}台`, processDevice / allDevice, '#0099ff', '加工中');
        setPieChart(`${flag}_state_idle`, `${idleDevice}台`, idleDevice / allDevice, '#cc33ff', '闲置中');
        setPieChart(`${flag}_state_fault`, `${faultDevice}台`, faultDevice / allDevice, 'red', '故障中');
        setPieChart(`${flag}_state_error`, `${errorDevice}台`, errorDevice / allDevice, '#ff00cc', '连接异常');
        //当前加工设备
        var i, len;
        var useCodeList = d.UseCodeList || [];
        var ops = '';
        for (i = 0, len = useCodeList.length; i < len; i++) {
            ops += `<div style="border:1px solid;padding:5px 10px;margin:3px;border-radius:20%;background:#bfa;font-weight:bold">${useCodeList[i]}</div>`;
        }
        $(`${flag}_dev`).empty().append(ops || '<label style="color:red;font-size:18px">无</label>');
        //利用率
        var oddRate = d.SingleProcessRate;
        var xData = [], yData = [];
        for (i = 0, len = oddRate.length; i < len; i++) {
            var oddData = oddRate[i];
            xData.push(oddData.Code);
            yData.push((oddData.Rate * 100).toFixed(2));
        }
        var option = {
            tooltip: {
                trigger: 'axis',
                formatter: '{a}<br/>{b} : {c}%',
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
                axisLine: {
                    onZero: false
                },
                data: xData
            },
            yAxis: {
                name: '百分比',
                type: 'value',
                scale: true,
                axisLabel: {
                    show: true,
                    formatter: '{value}%'
                }
            },
            series: {
                name: "利用率",
                type: 'bar',
                areaStyle: { normal: {} },
                barWidth: '60%',
                label: {
                    show: true,
                    position: 'top',
                    formatter: "{c}%"
                },
                itemStyle: {
                    color: params => params.value < 30 ? 'red' : 'green'
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
            }]
        };
        echarts.init($(`${flag}_bar`)[0]).setOption(option, true);
        var time = 0;
        $(flag).off('resize').on('resize', function () {
            clearTimeout(time);
            time = setTimeout(() => {
                var charts = $(this).find('.chart');
                for (var i = 0, len = charts.length; i < len; i++) {
                    echarts.init(charts[i]).resize();
                }
            }, 200);
        });
    });
}

//环形图设置
function setPieChart(el, formatter, rate, color, text) {
    rate = rate || 0;
    var rateScale = `${(rate * 100).toFixed(2)}%`;
    var option = {
        color: ['#cdcdcd', color],
        series: {
            type: 'pie',
            center: ['50%', '50%'],
            radius: ['65%', '100%'],
            hoverAnimation: false,
            animation: false,
            silent: true,
            label: {
                show: true,
                position: 'center',
                formatter: `${formatter}\n${rateScale}`,
                textStyle: {
                    color: color,
                    fontSize: 18,
                    fontWeight: 700
                }
            },
            data: [1 - rate, rate]
        }
    };
    if (text) {
        option.title = {
            text: text,
            left: 'center',
            textStyle: {
                color: color,
                fontSize: 16
            }
        };
        option.series.center = ['50%', '57%'];
        option.series.radius = ['57%', '85%'];
    }
    echarts.init($(el)[0]).setOption(option, true);
    return rateScale;
}

//看板列表改变
function kanBanChange() {
    new Promise(resolve => getKanBanList(resolve)).then(e => {
        $('#kanBanList').off('select2:select').on('select2:select', function () {
            var id = $(this).val();
            var d = e[id];
            $('#kanBanName').val(d.Name);
            $('#deviceSelect').val(d.DeviceIdList).trigger('change');
            $('#isShow').iCheck(d.IsShow ? 'check' : 'uncheck');
        });
        $('#kanBanList').trigger('select2:select');
    });
}

//获取看板列表
function getKanBanList(resolve) {
    var data = {
        opType: 509,
        opData: JSON.stringify({ type: -1 })
    };
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var tabOp = `<div class="tab-pane fade in" id="{0}">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="box box-info">
                                <div class="box-header with-border">
                                    <h3 class="box-title">设备详情</h3>
                                </div>
                                <div class="box-body">
                                    <div class="flexStyle">
                                        <div id="{0}_detail" class="chart" style="width: 40%; height: 140px"></div>
                                        <div class="flexStyle" style="width: 60%;height: 150px;flex-flow: column;justify-content: space-around; align-items: flex-start;padding-left:5%">
                                            <label class="control-label textOverTop">运行时间：<span class="spanStyle" id="{0}_yxTime"></span></label>
                                            <label class="control-label textOverTop">加工时间：<span class="spanStyle" id="{0}_jgTime"></span></label>
                                            <label class="control-label textOverTop">闲置时间：<span class="spanStyle" id="{0}_xzTime"></span></label>
                                            <label class="control-label textOverTop">所有利用率：<span class="spanStyle" id="{0}_lly"></span></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="box box-warning">
                                <div class="box-header with-border">
                                    <h3 class="box-title">日最大使用率</h3>
                                </div>
                                <div class="box-body">
                                    <div class="flexStyle">
                                        <div id="{0}_max" class="chart" style="width: 40%; height: 140px"></div>
                                        <div class="flexStyle" style="width: 60%;height: 150px;flex-flow: column;justify-content: space-around; align-items: flex-start;padding-left:5%">
                                            <label class="control-label textOverTop">日最大同时使用台数：<span class="spanStyle" id="{0}_maxTs"></span></label>
                                            <label class="control-label textOverTop">日最大使用台数：<span class="spanStyle" id="{0}_maxTNum"></span></label>
                                            <label class="control-label textOverTop">日最大使用率：<span class="spanStyle" id="{0}_maxSyl"></span></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="box box-warning">
                                <div class="box-header with-border">
                                    <h3 class="box-title">日最小使用率</h3>
                                </div>
                                <div class="box-body">
                                    <div class="flexStyle">
                                        <div id="{0}_min" class="chart" style="width: 40%; height: 140px"></div>
                                        <div class="flexStyle" style="width: 60%;height: 150px;flex-flow: column;justify-content: space-around; align-items: flex-start;padding-left:5%">
                                            <label class="control-label textOverTop">日最小同时使用台数：<span class="spanStyle" id="{0}_minTs"></span></label>
                                            <label class="control-label textOverTop">日最小使用台数：<span class="spanStyle" id="{0}_minTNum"></span></label>
                                            <label class="control-label textOverTop">日最小使用率：<span class="spanStyle" id="{0}_minSyl"></span></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-4">
                            <div class="box box-info">
                                <div class="box-header with-border">
                                    <h3 class="box-title">设备状态</h3>
                                </div>
                                <div class="box-body">
                                    <div style="width: 100%;display:flex;flex-wrap:wrap">
                                        <div id="{0}_state_all" class="chart" style="height:180px;width:33.33%"></div>
                                        <div id="{0}_state_normal" class="chart" style="height:180px;width:33.33%"></div>
                                        <div id="{0}_state_process" class="chart" style="height:180px;width:33.33%"></div>
                                        <div id="{0}_state_idle" class="chart" style="height:180px;width:33.33%"></div>
                                        <div id="{0}_state_fault" class="chart" style="height:180px;width:33.33%"></div>
                                        <div id="{0}_state_error" class="chart" style="height:180px;width:33.33%"></div>
                                    </div>
                                    <label class="control-label textOverTop">当前加工设备：</label>
                                    <div id="{0}_dev" style="width: 100%;display:flex;flex-wrap:wrap"></div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8">
                            <div class="box box-success">
                                <div class="box-header with-border">
                                    <h3 class="box-title">单台加工利用率</h3>
                                </div>
                                <div class="box-body">
                                    <div id="{0}_bar" class="chart" style="width: 100%; height: 480px"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        var rData = ret.data;
        var ops = '', lis = '', tabs = '';
        var obj = {};
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            obj[d.Id] = d;
            var name = `${d.Order}-${d.Name}`;
            ops += `<option value=${d.Id} order=${d.Order}>${name}</option>`;
            if (d.IsShow) {
                var flag = `kanBan${d.Id}`;
                lis += `<li><a href="#${flag}" class="kanBan" data-toggle="tab" aria-expanded="false">${d.Name}</a></li>`;
                tabs += tabOp.format(flag);
            }
        }
        $('#kanBanList').empty().append(ops);
        $('#firstNavLi').nextAll().remove().end().after(lis);
        $('#setKanBan').nextAll().remove().end().after(tabs);
        resolve(obj);
    });
}

//浏览器全屏放大
function fullScreen(isShow) {
    if (isShow) {
        var main = document.body;
        if (main.requestFullscreen) {
            main.requestFullscreen();
        } else if (main.mozRequestFullScreen) {
            main.mozRequestFullScreen();
        } else if (main.webkitRequestFullScreen) {
            main.webkitRequestFullScreen();
        } else if (main.msRequestFullscreen) {
            main.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

//获取机台号
function getDevice(resolve) {
    var data = {
        opType: 100
    };
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        var ops = '<option value="0">全部</option>';
        var arr = [];
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            var id = d.Id;
            ops += `<option value=${id}>${d.DeviceName}</option>`;
            arr.push(id);
        }
        $('#deviceSelect').empty().append(ops);
        resolve(arr);
    });
}

//删除看板
function delKanBanList() {
    var id = $('#kanBanList').val();
    if (isStrEmptyOrUndefined(id)) {
        layer.msg('请选择需要删除的看板');
        return;
    }
    var doSth = () => {
        var data = {
            opType: 512,
            opData: JSON.stringify({ id })
        }
        ajaxPost('/Relay/Post', data, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                kanBanChange();
            }
        });
    }
    showConfirm(`删除：${$('#kanBanList :selected').text()}`, doSth);
}

//设置添加看板
function setAddKanBan(isAdd) {
    var order = isAdd ? ++$('#kanBanList').children().length : $('#kanBanList :selected').attr('order');
    var name = $('#kanBanName').val().trim();
    if (isStrEmptyOrUndefined(name)) {
        layer.msg('看板名称不能为空');
        return;
    }
    var deviceId = $('#deviceSelect').val();
    if (isStrEmptyOrUndefined(deviceId)) {
        layer.msg('请选择设备');
        return;
    }
    var isShow = $('#isShow').is(':checked');
    var list = {
        Name: name,
        DeviceIds: deviceId.join(','),
        Order: order >> 0,
        IsShow: isShow
    };
    if (!isAdd) {
        var id = $('#kanBanList').val();
        if (isStrEmptyOrUndefined(id)) {
            layer.msg('请选择需要设置的看板');
            return;
        }
        list.Id = id >> 0;
    }
    var data = {
        opType: isAdd ? 510 : 511,
        opData: JSON.stringify(list)
    }
    ajaxPost('/Relay/Post', data, ret => {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            kanBanChange();
        }
    });
}
