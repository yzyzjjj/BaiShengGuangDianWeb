var def = 180;
var curId = -1;
var t = 0;
var uiTime = 0;
var dataTime = 0;
var run = false;
var page = [];
var maxSet = 6;
var timeEl = "";
let dsDivs = [];
let dsPaths = [];
let carouselTmp = [];
let carouselChose = [];
let carouselIndex = 0;
let carouselId = 0;
var carouselTime = 0;
var carouselFlag = "";

var scriptIndexTmp = [];
var scriptTmp = [];
var kanBans = [];
var tableSet = tableDefault();
function pageReady() {
    $(".sidebar-mini").addClass("sidebar-collapse");
    $('#kanBanList').select2();
    $('#deviceSelect').select2({
        allowClear: true,
        placeholder: '请选择',
        multiple: true
    });
    $('#navUl').on('click', 'a', function () {
        var flag = $(this).attr('href').replace("#", "");
        var ps = flag.replace("kanBan_", "");
        const id = parseInt(ps);
        if (curId == id)
            return;

        curId = id;
        let type = -1;
        const kb = kanBans[curId];
        if (kb) {
            type = kb.Type;
        }
        //timeEl = "";
        timeEl = flag;
        if (type == 2) {
            $(`#${flag}_deviceState`).empty();
        }
        if (curId > -1) {
            dsDivs[curId] = [];
            dsPaths[curId] = [];
            page[curId] = 0;
            setChart(flag, curId, type);
            clearInterval(uiTime);
            clearInterval(dataTime);
            t = (kb.UI < 1 ? 1 : kb.UI) * 1000;
            uiTime = setInterval(() => {
                if (run) return;
                //console.log(getTime(), 1);
                setChart(flag, curId, type, true);
            }, t);
            t = (kb.Second < 1 ? 1 : kb.Second) * 1000;
            dataTime = setInterval(() => {
                if (run) return;
                //console.log(getTime(), 2);
                setChart(flag, curId, type);
            }, t);
        } else {
            clearInterval(uiTime);
            clearInterval(dataTime);
        }
    });
    $('.content').on('click', '.fullScreenBtn', function () {
        var target = `#${$(this).attr('target')}`;
        $(target).toggleClass("panel-fullscreen");
        var isShow = $(target).hasClass("panel-fullscreen");
        $(this).toggleClass("glyphicon-fullscreen glyphicon-repeat").prop("title", isShow ? "还原" : "全屏放大");
        isShow ? $(this).addClass("fsb") : $(this).removeClass("fsb");
        //isShow ? $('#firstNavLi').addClass('hidden') : $('#firstNavLi').removeClass('hidden');
        fullScreen(isShow);
    });
    //$('#firstNavLi').on('click', function () {
    //    clearInterval(time);
    //    //$('.fullScreenBtn').addClass('hidden');
    //});
    //$('#kanBan-1NavLi a').click();
    setInterval(() => {
        $(`#${timeEl}_time`).length > 0 && $(`#${timeEl}_time`).text(getFullTime());
        $(`#${carouselFlag}_time`).length > 0 && $(`#${carouselFlag}_time`).text(getFullTime());
    }, 1000);

    var func = function () {
        $('#kanBanLength').val(($('#kanBanRow').val() >> 0) * ($('#kanBanCol').val() >> 0));
    }
    $('#kanBanRow').on("input", func);
    $('#kanBanCol').on("input", func);
    //$('#kanBanRow').on("input", func).on("change", func);
    //$('#kanBanCol').on("input", func).on("change", func);

    //$('#kanBanScript').on("change", "textIn", function () {
    //    var 
    //    var target = `#${$(this).attr('target')}`;
    //    $(target).toggleClass("panel-fullscreen");
    //    var isShow = $(target).hasClass("panel-fullscreen");
    //    $(this).toggleClass("glyphicon-fullscreen glyphicon-repeat").prop("title", isShow ? "还原" : "全屏放大");
    //    isShow ? $(this).addClass("fsb") : $(this).removeClass("fsb");
    //    //isShow ? $('#firstNavLi').addClass('hidden') : $('#firstNavLi').removeClass('hidden');
    //    fullScreen(isShow);
    //});
    var getDeviceFunc = new Promise(resolve => getDevice(resolve));
    var getKanBanListFunc = new Promise(resolve => getKanBanList(resolve));
    Promise.all([getDeviceFunc, getKanBanListFunc]).then(ret => {
        const deviceIds = ret[0];
        const kbs = ret[1];
        $('#kanBanList').off('select2:select').on('select2:select', function () {
            var id = $(this).val();
            if (!id) return;
            var d = kanBans[id];
            $('#kanBanName').val(d.Name);
            $('#kanBanOrder').val(d.Order);
            $('#isShow').iCheck(d.IsShow ? 'check' : 'uncheck');
            $("#setKanBan .stateEl").addClass("hidden");
            $('#kanBanType').val(d.Type).off('change').on('change', function () {
                var type = $(this).val();
                $("#setKanBan .stateEl").addClass("hidden");
                if (type == 2) {
                    $("#kanBanLength").val(d.Length);
                    $("#setKanBan .stateEl").removeClass("hidden");
                    getScriptList();
                }
            });
            $("#kanBanUI").val(d.UI);
            $("#kanBanSecond").val(d.Second);
            if (d.Type == 2) {
                $("#kanBanRow").val(d.Row);
                $("#kanBanCol").val(d.Col);
                $("#kanBanLength").val(d.Length);
                $("#setKanBan .stateEl").removeClass("hidden");
                //getScriptList();
                scriptIndexTmp = [];
                scriptTmp = [];
                $('#kanBanScript').html("");
            }
            $('#deviceSelect').val(d.DeviceIdList).trigger('change');
        });

        $('#deviceSelect')
            .on("select2:select", function () {
                var v = $(this).val();
                if (~v.indexOf('0')) {
                    $(this).val(deviceIds).trigger('change');
                }
            })
            .on("change", function () {
                const deviceId = $(this).val();
                if (isStrEmptyOrUndefined(deviceId)) {
                    scriptIndexTmp = [];
                    scriptTmp = [];
                    $('#kanBanScript').html("");
                    return;
                }
                var tmp = [];
                deviceId.forEach(d => {
                    if (d != 0) {
                        var sId = deviceTmp[d].ScriptId;
                        if (!~tmp.indexOf(sId)) {
                            tmp.push(sId);
                        }
                        if (!~scriptIndexTmp.indexOf(sId)) {
                            scriptIndexTmp.push(sId);
                            scriptTmp[sId] = {
                                sId,
                                sName: deviceTmp[d].ScriptName,
                                ds: [{ id: d, code: deviceTmp[d].Code }]
                            };
                        } else {
                            if (!existArrayObj(scriptTmp[sId].ds, "id", d))
                                scriptTmp[sId].ds.push({ id: d, code: deviceTmp[d].Code });
                        }
                    }
                });
                scriptIndexTmp = tmp;
                scriptTmp.forEach(s => {
                    const t = s.sId;
                    if (!~scriptIndexTmp.indexOf(t)) {
                        if (scriptTmp[t].div) {
                            $(`#${scriptTmp[t].div}`).remove();
                        }
                        delete scriptTmp[t];
                    } else {
                        const old = scriptTmp[t].ds.map(d => d.id);
                        old.forEach(d => {
                            if (!~deviceId.indexOf(d)) {
                                removeArray(scriptTmp[t].ds, "id", d);
                            }
                        });
                        if (scriptTmp[t].ds.length == 0)
                            delete scriptTmp[t];
                    }
                });

                const type = $('#kanBanType').val();
                type == 2 && getScriptList();
            });

        if (kbs.length > 0) {
            $('#kanBanList').val(kbs[0].Id).trigger('select2:select');
        }
    });
}

var deviceTmp = [];
//获取机台号
function getDevice(resolve) {
    var data = {
        opType: 100,
        opData: JSON.stringify({
            detail : true,
            state: false
        })
    };
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = SortNumberString(ret.datas, "Code");
        var ops = '<option value="0">全部</option>';
        var arr = [];
        for (var i = 0, len = rData.length; i < len; i++) {
            const d = rData[i];
            deviceTmp[d.Id] = d;
            ops += `<option value=${d.Id}>${d.Code}</option>`;
            arr.push(d.Id);
        }
        $('#deviceSelect').empty().append(ops);
        resolve(arr);
    }, 0);
}

var _carouselBox;
//获取看板列表
function getKanBanList(resolve) {
    const id = $('#kanBanList').val();
    //return;
    var data = {
        opType: 509,
        opData: JSON.stringify({ init: true })
    };
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }

        $('#kanBanType').html(`${setOptions(ret.menu, "Type")}`);

        var rData = ret.data;
        const len = rData.length;
        if (len <= 0)
            return;
        var op = `<div class="box box-primary">
                    <div class="box-header with-border">
                        <label class="control-label textOverTop no-margin middle">时间信息：<span id="{0}_time"></span></label>
                        <span class="glyphicon glyphicon-fullscreen pointer fullScreenBtn {1}" target="{0}"
                            style="position: absolute; right: 15px; top: 15px; font-size: 20px;z-index:1" title="全屏放大" aria-hidden="true"></span>
                    </div>
                    <div>
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
                        <div class="box box-success">
                            <div class="box-header with-border">
                                <h3 class="box-title">生产数据</h3>
                            </div>
                            <div class="box-body">
                                <div>
                                    <label class="control-label textOverTop"><span class="text-red">加工设备数：</span><span class="spanStyle" id="{0}_devs"></span></label>
                                    <label class="control-label textOverTop"><span class="text-red">加工数：</span><span class="spanStyle" id="{0}_pros"></span></label>
                                    <label class="control-label textOverTop"><span class="text-red">合格数：</span><span class="spanStyle" id="{0}_heGes"></span></label>
                                    <label class="control-label textOverTop"><span class="text-red">裂片数：</span><span class="spanStyle" id="{0}_liePians"></span></label>
                                    <label class="control-label textOverTop"><span class="text-red">合格率：</span><span class="spanStyle" id="{0}_rates"></span></label>
                                </div>
                                <div style="overflow-y: auto">
                                    <table border="1" class="table-td">
                                        <tbody>
                                            <tr id="{0}_devOps">
                                                <td class="text-red bg-info">机台号</td>
                                            </tr>
                                            <tr id="{0}_proOps">
                                                <td class="text-red bg-info">加工数</td>
                                            </tr>
                                            <tr id="{0}_heGeOps">
                                                <td class="text-red bg-info">合格数</td>
                                            </tr>
                                            <tr id="{0}_liePianOps">
                                                <td class="text-red bg-info">裂片数</td>
                                            </tr>
                                            <tr id="{0}_rateOps">
                                                <td class="text-red bg-info">合格率</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        var tabOp = `<div class="tab-pane fade in" id="{0}">${op}</div>`;
        //设备状态div
        const state =
            `<div class="kb_div1">
                <div class="kb_border1">
                <div class="kb_border2">
                <div class="form-group no-margin ttDiv">
                    <label class="control-label textOverTop no-margin middle kb_time1">时间信息：<span id="{0}_time"></span></label>
                    <h3 class="text-center text-bold kb_title1" style="color: cyan; padding: 10px;">监控平台</h3>
                    <span class="glyphicon glyphicon-fullscreen pointer kb_fullscreen1 fullScreenBtn {1}" target="{0}" title="全屏放大" aria-hidden="true"></span>
                    <div class="form-group no-margin mPadding">
                        <label class="control-label text-bold no-margin bg-green mPadding text-center" style="width: 15%; font-size: 17px;">
                            加工：<label class="control-label no-margin" id="{0}_jg" style="font-size: 17px;">0</label>
                        </label>
                        <label class="control-label text-bold no-margin mPadding text-center" style="width: 15%; font-size: 17px; background: #f47920; color:white;">
                            闲置：<label class="control-label no-margin" id="{0}_xz" style="font-size: 17px;">0</label>
                        </label>
                        <label class="control-label text-bold no-margin bg-blue mPadding text-center" style="width: 15%; font-size: 17px;">
                            正常：<label class="control-label no-margin" id="{0}_zc" style="font-size: 17px;">0</label>
                        </label>
                        <label class="control-label text-bold no-margin bg-red mPadding text-center" style="width: 15%; font-size: 17px;">
                            故障：<label class="control-label no-margin" id="{0}_gz" style="font-size: 17px;">0</label>
                        </label>
                        <label class="control-label text-bold no-margin mPadding text-center" style="width: 15%; font-size: 17px; background: gray; color:white;">
                            未连接：<label class="control-label no-margin" id="{0}_wlj" style="font-size: 17px;">0</label>
                        </label>
                        <label class="control-label text-bold no-margin mPadding text-center" style="width: 15%; color: cyan; font-size: 17px;">
                            共：<label class="control-label no-margin" id="{0}_sum" style="font-size: 17px;">0</label>台
                        </label>
                    </div>
                </div>
                <div class="box box-primary no-box-shadow no-margin kb_div2 dsDiv">
                    <div class="box-header no-padding">
                    </div>
                    <div class="box-body no-padding">
                        <div class="kb_flex_div1" id="{0}_deviceState">
                        </div>
                    </div>
                </div>
                </div>
                </div>
            </div>`;
        const stateTab = `<div class="tab-pane kb_body fade in" id="{0}">${state}</div>`;
        const carouselOp = `<div class="item kb_body" id="{0}">{1}<div class="carousel-caption text-primary"><h3 class="text-primary isShow hidden">{2}</h3></div></div>`;

        //rData.sort((a, b) => a.Order - b.Order);
        var ops = '', cops = '', lis = '', tabs = '', cOp = '';
        carouselTmp = [];
        var carouselIndex = 0;
        for (let i = 0; i < len; i++) {
            const d = rData[i];
            kanBans[d.Id] = d;
            const name = `${i + 1}-${d.Name}`;
            cops += `<div class="flexStyle pointer choseBox mPadding">
                        <label class="flexStyle pointer">
                            <input type="checkbox" class="icb_minimal" value=${d.Id}>
                            <span style="margin-left: 5px">${d.Name}</span>
                        </label>
                    </div>`;
            if (d.Id !== 0) {
                ops += `<option value=${d.Id} order=${d.Order}>${name}</option>`;
            }
            if (d.IsShow) {
                var flag = `kanBan_${d.Id}`;
                lis += `<li><a href="#${flag}" class="kanBan" data-toggle="tab" aria-expanded="false">${d.Name}</a></li>`;
                const cFlag = `carousel_${flag}`;
                switch (d.Type) {
                    case 1:
                        tabs += tabOp.format(flag, "");
                        cOp = carouselOp.format(cFlag, op.format(cFlag, "hidden"), d.Name);
                        break;
                    case 2:
                        tabs += stateTab.format(flag, "");
                        cOp = carouselOp.format(cFlag, state.format(cFlag, "hidden"), d.Name);
                        break;
                    default: break;
                }
                !carouselTmp[d.Id] && (carouselTmp[d.Id] = {});
                carouselTmp[d.Id] = {
                    carouselLi: `<li data-target="#carousel-example-generic" data-slide-to=${carouselIndex++}></li>`,
                    carouselTab: cOp
                }
            }
        }

        $('#carouselDiv').empty().append(cops).find(`.icb_minimal`).iCheck({
            handle: 'checkbox',
            checkboxClass: 'icheckbox_minimal-green',
            increaseArea: '20%'
        }).on('ifChanged', function () {
            var id = $(this).val();
            if ($(this).is(':checked')) {
                carouselChose.push({ id, Order: kanBans[id].Order });
            } else {
                removeArray(carouselChose, "id", id);
            }
            carouselChose.sort(sortOrder);
        });
        $('#kanBanList').empty().append(ops);
        id && $('#kanBanList').val(id).trigger("select2:select");
        $('#firstNavLi').nextAll().remove().end().after(lis);
        $('#setKanBan').nextAll().remove().end().after(tabs);

        rData = rData.filter(d => d.Id !== 0);
        resolve && resolve(rData);
    }, 0);
}

//设置添加看板
function setAddKanBan(isAdd) {
    //var order = isAdd ? ($('#kanBanList option:last').attr('order') >> 0) + 1 : $('#kanBanList :selected').attr('order');
    const name = $('#kanBanName').val().trim();
    if (isStrEmptyOrUndefined(name)) {
        return void layer.msg('看板名称不能为空');
    }
    const type = $('#kanBanType').val() >> 0;
    if (isStrEmptyOrUndefined(type)) {
        return void layer.msg('看板类型错误');
    }
    const order = $('#kanBanOrder').val() >> 0;
    const deviceId = $('#deviceSelect').val();
    if (isStrEmptyOrUndefined(deviceId)) {
        return void layer.msg('请选择设备');
    }
    const ui = $('#kanBanUI').val() >> 0;
    const sec = $('#kanBanSecond').val() >> 0;
    const row = $('#kanBanRow').val() >> 0;
    const col = $('#kanBanCol').val() >> 0;
    const isShow = $('#isShow').is(':checked');
    let vs = [];

    scriptIndexTmp.forEach(sid => {
        var sc = scriptTmp[sid];
        const val = `${sc.divVal}Data`;
        const ins = `${sc.divIn}Data`;
        const outs = `${sc.divOut}Data`;
        sc && sc[val] && sc[ins] && sc[outs] && (vs = vs.concat(sc[val], sc[ins], sc[outs]));
    });
    const list = {
        Type: type,
        IsShow: isShow,
        Name: name,
        DeviceIds: deviceId.join(","),
        Order: order,
        UI: ui,
        Second: sec,
        Row: row,
        Col: col,
        Variables: JSON.stringify(vs)
    };
    if (!isAdd) {
        const id = $('#kanBanList').val();
        if (isStrEmptyOrUndefined(id)) {
            return void layer.msg('请选择需要修改的看板');
        }
        list.Id = id >> 0;
    }
    const data = {
        opType: isAdd ? 510 : 511,
        opData: JSON.stringify(list)
    }
    ajaxPost('/Relay/Post', data, ret => {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            getKanBanList();
        }
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
                getKanBanList();
            }
        });
    }
    showConfirm(`删除：${$('#kanBanList :selected').text()}`, doSth);
}

//获取脚本
function getScriptList() {
    var data = {
        opType: 106,
        opData: JSON.stringify({ sIds: scriptIndexTmp.join() })
    };
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }

        var div =
            `<div class="box box-info" id="{0}">
                <div class="box-header with-border">
                    <h3 class="box-title"><lable class="text-red text-bold name">{1}</lable> - <lable class="text-blue text-bold code" title="{2}">{3}</lable></h3>
                    <div class="box-tools pull-right">
                        <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
                    </div>
                </div>
                <div class="box-body">
                    <div class="col-md-4">
                        <label class="control-label">变量：</label>
                        <div class="flexStyle" style="justify-content: flex-end">
                            <select class="form-control thText" style="max-width: 80px" onchange="dataTableSearch.call(this, '{4}')">
                                <option value="0">序号</option>
                                <option value="1">名称</option>
                                <option value="2">地址</option>
                            </select>
                            <select class="form-control sym" style="max-width: 100px" onchange="dataTableSearch.call(this, '{4}')">
                                <option value="0">等于</option>
                                <option value="1">不等于</option>
                                <option value="2">包含</option>
                            </select>
                            <input type="text" class="form-control val" placeholder="搜索" style="max-width: 150px" oninput="dataTableSearch.call(this, '{4}')">
                        </div>
                        <div class="table-responsive mailbox-messages">
                            <table class="table table-hover table-striped table-condensed" id="{4}"></table>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <label class="control-label">输入：</label>
                        <div class="flexStyle" style="justify-content: flex-end">
                            <select class="form-control thText" style="max-width: 80px" onchange="dataTableSearch.call(this, '{5})'">
                                <option value="0">序号</option>
                                <option value="1">名称</option>
                                <option value="2">地址</option>
                            </select>
                            <select class="form-control sym" style="max-width: 100px" onchange="dataTableSearch.call(this, '{5}')">
                                <option value="0">等于</option>
                                <option value="1">不等于</option>
                                <option value="2">包含</option>
                            </select>
                            <input type="text" class="form-control val" placeholder="搜索" style="max-width: 150px" oninput="dataTableSearch.call(this, '{5}')">
                        </div>
                        <div class="table-responsive mailbox-messages">
                            <table class="table table-hover table-striped table-condensed" id="{5}"></table>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <label class="control-label">输出：</label>
                        <div class="flexStyle" style="justify-content: flex-end">
                            <select class="form-control thText" style="max-width: 80px" onchange="dataTableSearch.call(this, '{6}')">
                                <option value="0">序号</option>
                                <option value="1">名称</option>
                                <option value="2">地址</option>
                            </select>
                            <select class="form-control sym" style="max-width: 100px" onchange="dataTableSearch.call(this, '{6}')">
                                <option value="0">等于</option>
                                <option value="1">不等于</option>
                                <option value="2">包含</option>
                            </select>
                            <input type="text" class="form-control val" placeholder="搜索" style="max-width: 150px" oninput="dataTableSearch.call(this, '{6}')">
                        </div>
                        <div class="table-responsive mailbox-messages">
                            <table class="table table-hover table-striped table-condensed" id="{6}"></table>
                        </div>
                    </div>
                </div>
            </div>`;

        const id = $('#kanBanList').val();
        const kanBan = kanBans[id];
        const rData = ret.datas;
        //1	变量
        //2	输入
        //3	输出
        scriptIndexTmp.forEach(sid => {
            if (scriptTmp[sid]) {
                const sc = scriptTmp[sid];
                const scName = sc.sName;
                let codes = SortNumberString(sc.ds, "code").map(d => d.code).join();
                let sCodes = `${(codes.length > tdShowLengthLong ? `${codes.substring(0, tdShowLengthLong)}...` : codes)}`;
                var vals = rData.filter(d => d.ScriptId == sid && d.VariableTypeId == 1);
                var ins = rData.filter(d => d.ScriptId == sid && d.VariableTypeId == 2);
                var outs = rData.filter(d => d.ScriptId == sid && d.VariableTypeId == 3);
                sc.divVal = `valList_${sid}`;
                sc.divIn = `insList_${sid}`;
                sc.divOut = `outList_${sid}`;
                if (!sc.div) {
                    sc.div = `sc_${sid}`;
                    sc[`${sc.divVal}Trs`] = [];
                    sc[`${sc.divIn}Trs`] = [];
                    sc[`${sc.divOut}Trs`] = [];

                    sc[`${sc.divVal}Data`] = [];
                    sc[`${sc.divIn}Data`] = [];
                    sc[`${sc.divOut}Data`] = [];
                    codes = codes.repeat(5);
                    $('#kanBanScript').append(div.format(sc.div, scName, codes, sCodes, sc.divVal, sc.divIn, sc.divOut));

                    let tableConfig = dataTableConfig(0, true);
                    tableConfig.bLengthChange = false;
                    tableConfig.iDisplayLength = 20;
                    tableConfig.dom = '<"pull-left"l><"pull-right hidden"f>rt<"text-center"i><"table-flex"p>';
                    tableConfig.addColumns([
                        { data: 'VariableName', title: '名称' },
                        { data: 'PointerAddress', title: '地址', sClass: "add" },
                        {
                            data: null,
                            title: '自定义名称',
                            render: d => {
                                var t = kanBan.VariableList.filter(v => v.ScriptId == d.ScriptId &&
                                    v.VariableTypeId == d.VariableTypeId &&
                                    v.PointerAddress == d.PointerAddress);
                                var v = t.length > 0 ? t[0].VariableName : "";
                                return tableSet.input("name", v);
                            }

                        },
                        {
                            data: null,
                            title: '显示顺序',
                            render: d => {
                                var t = kanBan.VariableList.filter(v => v.ScriptId == d.ScriptId &&
                                    v.VariableTypeId == d.VariableTypeId &&
                                    v.PointerAddress == d.PointerAddress);
                                var v = t.length > 0 ? t[0].Order : "";
                                return tableSet.numberInput("order", '50px', v);
                            }
                        }
                    ]);

                    const data1 = `${sc.divVal}Data`;
                    const data2 = `${sc.divIn}Data`;
                    const data3 = `${sc.divOut}Data`;
                    //变量
                    tableConfig.updateData(vals);
                    tableConfig.drawCallback = function () {
                        const trs = `${sc.divVal}Trs`;
                        const data = data1;
                        initCheckboxAddEvent.call(this, sc[trs],
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                sc[data].push({
                                    Id: d.Id,
                                    ScriptId: sid,
                                    VariableTypeId: 1,
                                    PointerAddress: d.PointerAddress,
                                    VariableName: v ? v : "",
                                    Order: o ? o : 0
                                });
                                disabledChose(sc, data1, data2, data3);
                            },
                            (tr, d) => {
                                removeArray(sc[data], "Id", d.Id);
                                enableChose(sc.divVal, sc.divIn, sc.divOut);
                            },
                            false, "Checked");

                        initInputChangeEvent.call(this,
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                sc[data].length > 0 &&
                                    sc[data].every(vv => {
                                        if (vv.Id == d.Id) {
                                            vv.VariableName = v;
                                            vv.Order = o;
                                            return false;
                                        }
                                        return true;
                                    });
                            });
                        if (sc[data1].length + sc[data2].length + sc[data3].length >= maxSet)
                            disabledChose(sc, data1, data2, data3);
                        else
                            enableChose(sc.divVal, sc.divIn, sc.divOut);
                    }
                    tableConfig.createdRow = function (tr, d) {
                        var t = false;
                        kanBan.VariableList.every(v => {
                            if (d.ScriptId == v.ScriptId &&
                                d.VariableTypeId == v.VariableTypeId &&
                                d.PointerAddress == v.PointerAddress) {
                                t = true;
                                sc[data1].push({
                                    Id: d.Id,
                                    ScriptId: sid,
                                    VariableTypeId: 1,
                                    VariableName: v.VariableName,
                                    PointerAddress: v.PointerAddress,
                                    Order: v.Order
                                });
                                return false;
                            }
                            return true;
                        });
                        $(tr).find('.isEnable').iCheck((t ? 'check' : 'uncheck'));
                        t && $(tr).find(".textOn").text("").addClass("hidden").siblings(".textIn").removeClass("hidden");
                    }
                    _dataTableData[sc.divVal] = $(`#${sc.divVal}`).DataTable(tableConfig);
                    //输入
                    tableConfig.updateData(ins);
                    tableConfig.drawCallback = function () {
                        const trs = `${sc.divIn}Trs`;
                        const data = data2;
                        initCheckboxAddEvent.call(this, sc[trs],
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                sc[data].push({
                                    Id: d.Id,
                                    ScriptId: sid,
                                    VariableTypeId: 2,
                                    PointerAddress: d.PointerAddress,
                                    VariableName: v ? v : "",
                                    Order: o ? o : 0
                                });
                                disabledChose(sc, data1, data2, data3);
                            },
                            (tr, d) => {
                                removeArray(sc[data], "Id", d.Id);
                                enableChose(sc.divVal, sc.divIn, sc.divOut);
                            },
                            false, "Checked");

                        initInputChangeEvent.call(this,
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                sc[data].length > 0 &&
                                    sc[data].every(vv => {
                                        if (vv.Id == d.Id) {
                                            vv.VariableName = v;
                                            vv.Order = o;
                                            return false;
                                        }
                                        return true;
                                    });
                            });
                        if (sc[data1].length + sc[data2].length + sc[data3].length >= maxSet)
                            disabledChose(sc, data1, data2, data3);
                        else
                            enableChose(sc.divVal, sc.divIn, sc.divOut);
                    }
                    tableConfig.createdRow = function (tr, d) {
                        var t = false;
                        kanBan.VariableList.every(v => {
                            if (d.ScriptId == v.ScriptId &&
                                d.VariableTypeId == v.VariableTypeId &&
                                d.PointerAddress == v.PointerAddress) {
                                t = true;
                                sc[data2].push({
                                    Id: d.Id,
                                    ScriptId: sid,
                                    VariableTypeId: 2,
                                    VariableName: v.VariableName,
                                    PointerAddress: v.PointerAddress,
                                    Order: v.Order
                                });
                                return false;
                            }
                            return true;
                        });
                        $(tr).find('.isEnable').iCheck((t ? 'check' : 'uncheck'));
                        t && $(tr).find(".textOn").addClass("hidden").siblings(".textIn").removeClass("hidden");
                    }
                    _dataTableData[sc.divIn] = $(`#${sc.divIn}`).DataTable(tableConfig);
                    //输出
                    tableConfig.updateData(outs);
                    tableConfig.drawCallback = function () {
                        const trs = `${sc.divOut}Trs`;
                        const data = data3;
                        initCheckboxAddEvent.call(this, sc[trs],
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                sc[data].push({
                                    Id: d.Id,
                                    ScriptId: sid,
                                    VariableTypeId: 3,
                                    PointerAddress: d.PointerAddress,
                                    VariableName: v ? v : "",
                                    Order: o ? o : 0
                                });
                                disabledChose(sc, data1, data2, data3);
                            },
                            (tr, d) => {
                                removeArray(sc[data], "Id", d.Id);
                                enableChose(sc.divVal, sc.divIn, sc.divOut);
                            },
                            false, "Checked");

                        initInputChangeEvent.call(this,
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                sc[data].length > 0 &&
                                    sc[data].every(vv => {
                                        if (vv.Id == d.Id) {
                                            vv.VariableName = v;
                                            vv.Order = o;
                                            return false;
                                        }
                                        return true;
                                    });
                            });
                        if (sc[data1].length + sc[data2].length + sc[data3].length >= maxSet)
                            disabledChose(sc, data1, data2, data3);
                        else
                            enableChose(sc.divVal, sc.divIn, sc.divOut);
                    }
                    tableConfig.createdRow = function (tr, d) {
                        var t = false;
                        kanBan.VariableList.every(v => {
                            if (d.ScriptId == v.ScriptId &&
                                d.VariableTypeId == v.VariableTypeId &&
                                d.PointerAddress == v.PointerAddress) {
                                t = true;
                                sc[data3].push({
                                    Id: d.Id,
                                    ScriptId: sid,
                                    VariableTypeId: 3,
                                    VariableName: v.VariableName,
                                    PointerAddress: v.PointerAddress,
                                    Order: v.Order
                                });
                                return false;
                            }
                            return true;
                        });
                        $(tr).find('.isEnable').iCheck((t ? 'check' : 'uncheck'));
                        t && $(tr).find(".textOn").addClass("hidden").siblings(".textIn").removeClass("hidden");
                    }
                    _dataTableData[sc.divOut] = $(`#${sc.divOut}`).DataTable(tableConfig);
                } else {
                    $(`#${sc.div}>.box-header .name`).text(scName);
                    $(`#${sc.div}>.box-header .code`).text(codes);
                    $(`#${sc.div} .val`).text("");

                    updateTable(_dataTableData[sc.divVal], vals);
                    updateTable(_dataTableData[sc.divIn], ins);
                    updateTable(_dataTableData[sc.divOut], outs);
                }
            }
        });
    }, 0);
}

function disabledChose(sc, data1, data2, data3) {
    if (sc[data1].length + sc[data2].length + sc[data3].length >= maxSet) {
        disabledTableCheck(sc.divVal, sc[data1].map(x => x.Id));
        disabledTableCheck(sc.divIn, sc[data2].map(x => x.Id));
        disabledTableCheck(sc.divOut, sc[data3].map(x => x.Id));
    }
}

function enableChose(table1, table2, table3) {
    enableTableCheck(table1);
    enableTableCheck(table2);
    enableTableCheck(table3);
}

var _dataTableData = {};
//自定义datatables搜索
function dataTableSearch(type) {
    const table = _dataTableData[type];
    const parent = $(this).parent();
    var val = parent.find('.val').val().trim();
    table.columns([0, 1, 2, 3]).search('').draw();
    if (!isStrEmptyOrUndefined(val)) {
        const sym = parent.find('.sym').val();
        if (sym == 0) {
            val = `^${val}$`;
        } else if (sym == 1) {
            val = `^(?!${val}$).+$`;
        }
        const colText = (parent.find('.thText').val() >> 0) + 1;
        table.columns(colText).search(val, true, false).draw();
    }
}

//全屏轮播
function fullScreenCarousel() {
    var carousel =
        `<div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title" style="margin-top:8px">看板轮播<span class="ftitle"></span></h3>
                <button class="btn btn-primary pull-right" onclick="cancelFullScreenCarousel()">取消轮播</button>
            </div>
            <div class="box-body">
                <div id="carousel-example-generic" class="carousel slide" data-ride="carousel">
                    <ol class="carousel-indicators isShow hidden">{0}</ol>
                    <div class="carousel-inner">{1}</div>
                    <a class="left carousel-control isShow hidden" href="#carousel-example-generic" data-slide="prev">
                        <span class="glyphicon glyphicon-chevron-left text-primary" aria-hidden="true"></span>
                    </a>
                    <a class="right carousel-control isShow hidden" href="#carousel-example-generic" data-slide="next">
                        <span class="glyphicon glyphicon-chevron-right text-primary" aria-hidden="true"></span>
                    </a>
                </div>
            </div>
        </div>`;
    if (!carouselChose.length) {
        return;
    }
    const carouselLis = carouselChose.reduce((a, b) => `${a}${carouselTmp[b.id].carouselLi}`, "");
    const carouselTabs = carouselChose.reduce((a, b) => `${a}${carouselTmp[b.id].carouselTab}`, "");
    _carouselBox = carousel.format(carouselLis, carouselTabs);
    carouselChose.forEach(d => {
        page[d.id] = 0;
        dsDivs[d.id] = [];
        dsPaths[d.id] = [];
    });
    carouselId = 0;
    carouselIndex = 0;
    $('#fullScreenCarousel').empty().append(_carouselBox);
    $('#fullScreenCarousel').find("ol li:first").addClass("active");
    $('#fullScreenCarousel').find(".item:first").addClass("active");
    $('#fullScreenCarousel').animate({
        top: 0,
        opacity: 1
    }, 1000, 'linear', () => {
        //$(`#fullScreenBtn  .fullScreenBtn`).click();
        //fullScreen(true);
    });
    carouselFlag = $('#fullScreenCarousel .item:first').attr('id');
    setFullScreenCarousel(carouselFlag);
    $('#carousel-example-generic').carousel({
        interval: 10000
    }).off('slide.bs.carousel').on('slide.bs.carousel', e => {
        carouselFlag = e.relatedTarget.id;

        //$(`#${carouselFlag}  .fullScreenBtn`).click();
        carouselId = carouselFlag.replace('carousel_kanBan_', '');
        if (kanBans[carouselId]) {
            $(`#fullScreenCarousel .ftitle`).text(` - ${kanBans[carouselId].Name}`);
            if (carouselFlag == "")
                return;
            setChart(carouselFlag, carouselId, kanBans[carouselId].Type, true);
        }
    })
        .on('mouseenter', () => $('#carousel-example-generic .isShow').removeClass('hidden'))
        .on('mouseleave', () => $('#carousel-example-generic .isShow').addClass('hidden'));
}

//轮播图设置
function setFullScreenCarousel() {
    clearInterval(carouselTime);
    if (carouselFlag == "")
        return;
    carouselTime = setInterval(() => {
        //$(`#${carouselFlag}  .fullScreenBtn`).click();
        carouselId = carouselFlag.replace('carousel_kanBan_', '');
        if (kanBans[carouselId]) {
            $(`#fullScreenCarousel .ftitle`).text(` - ${kanBans[carouselId].Name}`);
            if (carouselFlag == "")
                return;
            setChart(carouselFlag, carouselId, kanBans[carouselId].Type, true);
        }
        //console.log(getTime(), 1);
        //setChart(flag, curId, type, true);
    }, 5000);
    //$(`#${elId}  .fullScreenBtn`).click();
    //const id = elId.replace('carousel_kanBan_', '');
    //if (kanBans[id]) {
    //    $(`#fullScreenCarousel .ftitle`).text(`-${kanBans[id].Name}`);
    //    setChart(elId, id, kanBans[id].Type, true);
    //}
}

//取消轮播
function cancelFullScreenCarousel() {
    clearInterval(carouselTime);
    carouselFlag = "";
    $('#carousel-example-generic').carousel('pause').off('slide.bs.carousel mouseenter mouseleave');
    $('#fullScreenCarousel').animate({
        top: '-100%',
        opacity: 0
    }, 1000, 'linear', function () {
        $(this).empty();
        fullScreen(false);
    });
}

//图表设置
function setChart(elId, kbId, type, next = false) {
    if (run) return;
    run = true;
    var flag = `#${elId}`;
    //return;
    const p = page[kbId] ? page[kbId] : 0;
    var data = {
        opType: 509,
        opData: JSON.stringify({ qId: kbId, page: p })
    };
    ajaxPost('/Relay/Post', data, ret => {
        run = false;
        var i;
        var ops;
        var rData;
        const color1 = "text-red";
        const color2 = "text-gray";
        if (ret.errno == 0) {
            var t1 = $(`${flag}_time`).text();
            var t2 = ret.time;
            //时间信息
            if (Math.abs(dateDiffSec(t2, t1)) > 10) {
                $(`${flag}_time`).toggleClass(color1);
                $(`${flag}_time`).toggleClass(color2) && ($(`${flag}_time`).removeClass(color2));
            } else {
                $(`${flag}_time`).toggleClass(color2);
                $(`${flag}_time`).hasClass(color1) && ($(`${flag}_time`).removeClass(color1));
            }
        } else {
            !$(`${flag}_time`).hasClass(color1) && ($(`${flag}_time`).addClass(color1));
            $(`${flag}_time`).hasClass(color2) && ($(`${flag}_time`).removeClass(color2));
        }
        rData = ret.data;
        if (type == 1) {
            if (ret.errno != 0) {
                //layer.msg(ret.errmsg);
                return;
            }
            //设备详情
            var allRateScale = setPieChart(`${flag}_detail`, 'Rate', rData.AllProcessRate, '#0099ff');
            $(`${flag}_yxTime`).text(codeTime(rData.RunTime));
            $(`${flag}_jgTime`).text(codeTime(rData.ProcessTime));
            $(`${flag}_xzTime`).text(codeTime(rData.IdleTime));
            $(`${flag}_lly`).text(allRateScale);
            //日最大使用率
            var maxUse = `${rData.MaxUse}台`;
            var maxRateScale = setPieChart(`${flag}_max`, `Max\n${maxUse}`, rData.MaxUseRate, '#00a65a');
            $(`${flag}_maxTs`).text(`${rData.MaxSimultaneousUseRate}台`);
            $(`${flag}_maxTNum`).text(maxUse);
            $(`${flag}_maxSyl`).text(maxRateScale);
            //日最小使用率
            var minUse = `${rData.MinUse}台`;
            var minRateScale = setPieChart(`${flag}_min`, `Min\n${minUse}`, rData.MinUseRate, '#f39c12');
            $(`${flag}_minTs`).text(`${rData.MinSimultaneousUseRate}台`);
            $(`${flag}_minTNum`).text(minUse);
            $(`${flag}_minSyl`).text(minRateScale);
            //设备状态
            var allDevice = rData.AllDevice;
            var normalDevice = rData.NormalDevice;
            var processDevice = rData.ProcessDevice;
            var idleDevice = rData.IdleDevice;
            var faultDevice = rData.FaultDevice;
            var errorDevice = rData.ConnectErrorDevice;
            setPieChart(`${flag}_state_all`, `${allDevice}台`, allDevice / allDevice, 'green', '总设备');
            setPieChart(`${flag}_state_normal`, `${normalDevice}台`, normalDevice / allDevice, 'blue', '正常运行');
            setPieChart(`${flag}_state_process`, `${processDevice}台`, processDevice / allDevice, '#0099ff', '加工中');
            setPieChart(`${flag}_state_idle`, `${idleDevice}台`, idleDevice / allDevice, '#cc33ff', '闲置中');
            setPieChart(`${flag}_state_fault`, `${faultDevice}台`, faultDevice / allDevice, 'red', '故障中');
            setPieChart(`${flag}_state_error`, `${errorDevice}台`, errorDevice / allDevice, '#ff00cc', '连接异常');
            //当前加工设备
            var len;
            var useCodeList = rData.UseCodeList || [];
            ops = '';
            for (i = 0, len = useCodeList.length; i < len; i++) {
                ops += `<div style="border:1px solid;padding:5px 10px;margin:3px;border-radius:20%;background:#bfa;font-weight:bold">${useCodeList[i]}</div>`;
            }
            $(`${flag}_dev`).empty().append(ops || '<label style="color:red;font-size:18px">无</label>');
            //利用率
            var oddRate = rData.SingleProcessRate;
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
            $(flag).off('resize').on('resize', function () {
                clearTimeout(this.time);
                this.time = setTimeout(() => {
                    var charts = $(this).find('.chart');
                    for (var i = 0, len = charts.length; i < len; i++) {
                        echarts.init(charts[i]).resize();
                    }
                }, 200);
            });
            //生产数据
            var pData = rData.ProductionList;
            var devOps = '', proOps = '', heGeOps = '', liePianOps = '', rateOps = '';
            for (i = 0, len = pData.length; i < len; i++) {
                const pd = pData[i];
                devOps += `<td class="text-blue">${pd.Code}</td>`;
                proOps += `<td>${pd.FaChu}</td>`;
                heGeOps += `<td>${pd.HeGe}</td>`;
                liePianOps += `<td>${pd.LiePian}</td>`;
                rateOps += `<td>${(pd.Rate * 100).toFixed(2)}%</td>`;
            }
            $(`${flag}_devs`).text(processDevice);
            $(`${flag}_pros`).text(rData.FaChu);
            $(`${flag}_heGes`).text(rData.HeGe);
            $(`${flag}_liePians`).text(rData.LiePian);
            $(`${flag}_rates`).text(`${(rData.Rate * 100).toFixed(2)}%`);
            $(`${flag}_devOps`).find('td:not(:first)').remove().end().append(devOps);
            $(`${flag}_proOps`).find('td:not(:first)').remove().end().append(proOps);
            $(`${flag}_heGeOps`).find('td:not(:first)').remove().end().append(heGeOps);
            $(`${flag}_liePianOps`).find('td:not(:first)').remove().end().append(liePianOps);
            $(`${flag}_rateOps`).find('td:not(:first)').remove().end().append(rateOps);
        } else if (type == 2) {
            var ds = `${flag}_deviceState`;
            if (ret.errno != 0) {
                dsDivs[kbId].forEach(dd => {
                    $(`#${dd}`).addClass("hi");
                });
                $(`${ds} .hi`).css("display", "none").removeClass("hi");
                //layer.msg(ret.errmsg);
                return;
            }
            //return;
            var op =
                `<div id="{0}" class="kb_device_div1 ds" style="display:none;">
                    <div style="height: 33%;position: relative;display: flex;">
                        <div style="width: 35%;position: relative;">
                            <img id="{0}_img" class="kb_img1" src="">
                        </div>
                        <div style="width: 50%;position: relative;">
                            <label id="{0}_code" class="text-blue" style="margin: 0;font-size: 16px;"></label>
                            <br>
                            <label id="{0}_mc" class="" style="margin: 0;white-space: nowrap;color: #f15a22;"></label>
                            <br>
                            <label id="{0}_ws" class="" style="margin: 0;white-space: nowrap;color: #005831;"></label>
                        </div>
                        <div id="{0}_state" style="width: 23px;height: 23px;position: absolute;top: 0;right: 0;/* float: right; */"></div>
                    </div>
                    <div style="top: 2%; height: 65%; position: relative;" id="{0}_detail"></div>
                </div>`;
            var params =
                `<div class="form-group no-margin" style="height:calc(100%/6);">
                    <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 no-margin text-blue no-padding kb_param1">
                        <label class=" control-label no-margin text-blue no-padding">{0}</label>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 no-margin text-blue no-padding kb_param1">
                        <label class="control-label no-margin text-blue no-padding">{1}</label>
                    </div>
                </div>`;

            //var params =
            //    `<div class="form-group no-margin ">
            //    <div class="form-group no-margin col-md-6">
            //        <label class="col-md-6 col-sm-6control-label no-margin text-blue" style="white-space: nowrap;">{0}</label>
            //    </div>
            //    <div class="form-group no-margin col-md-6">
            //        <label class="control-label no-margin text-blue" style="white-space: nowrap;">{1}</label>
            //    </div>
            //    </div>`;
            var left;
            const dLen = dsDivs[kbId].length;
            if (dLen !== ret.len) {
                ops = "";
                left = Math.abs(ret.len - dLen);
                for (let i = 0; i < left; i++) {
                    const divName = `${elId}_ds${(dLen + i)}`;
                    if (dLen < ret.len) {
                        dsDivs[kbId].push(divName);
                        ops += op.format(divName);
                    } else if (dLen > ret.len) {
                        removeArray(dsDivs[kbId], divName);
                    }
                }
                if (dLen < ret.len) {
                    $(`${ds}`).append(ops);
                } else if (dLen > ret.len) {
                    $(`${ds} .rm`).remove();
                }
            }

            const dsDiv = $(`${flag} .dsDiv`);
            if (dsDiv.length > 0) {
                var windowH = $(window).height();//获取当前窗口高度
                $(`${flag}`).css("height", `${windowH}px`);

                //var windowH = $(`${flag} .kb_border2`).height() >> 0;
                windowH = $(`${flag} .kb_border2`).height() >> 0;
                //$(`${flag} .dsDiv`).css("height", `${windowH - th}px`);
                var th = $(`${flag} .ttDiv`).height() >> 0;
                $(`${flag} .dsDiv`).css("height", `${windowH - th}px`);
            }
            //return;
            const devices = SortNumberString(rData, "Code");
            let len = devices.length;
            if (!len) {
                dsDivs[kbId].forEach(dd => {
                    $(`#${dd}`).addClass("hi");
                });
                $(`${ds} .hi`).css("display", "none").removeClass("hi");
                $(ds).append('<div class="no-data" style="font:bold 25px/35px 微软雅黑;color:red">无数据</div>');
                return;
            }
            const nd = `${ds} .no-data`;
            $(nd).length > 0 && $(nd).remove();

            var back = paths => {
                if (paths) {
                    len = paths.length;
                    for (i = 0; i < len; i++) {
                        var p = paths[i];
                        !dsPaths[kbId][p.name] && (dsPaths[kbId][p.name] = p.path);
                    }
                }
                const pLen = Object.keys(dsPaths[kbId]).length;
                if (pLen <= 0)
                    return;

                var shows = [];
                devices.forEach(d => shows[d.Id] = 1);
                for (i = 0; i < dLen; i++) {
                    const divName = `${flag}_ds${i}`;
                    var d = devices[i];
                    if (d) {
                        var color = "red";
                        switch (d.DeviceStateStr) {
                            case '加工中':
                                color = '#00A65C';
                                break;
                            case '待机':
                            case '流程升级中':
                            case '固件升级中':
                            case '设备重启中':
                            case '连接正常':
                                color = '#f47920';
                                break;

                            case '已报修':
                            case '已确认':
                            case '维修中':
                                color = 'red';
                                break;

                            default:
                                color = 'gray';
                                break;
                        }
                        const ps = d.Data.reduce((a, b) => a + params.format(b.VName, b.V), '');
                        $(`${divName}_img`).attr("src", dsPaths[kbId][d.Icon]);
                        $(`${divName}_code`).text(d.Code);
                        $(`${divName}_mc`).text(`${d.CategoryName}-${d.ModelName}`);
                        $(`${divName}_ws`).text(d.SiteName);
                        $(`${divName}_state`).css("background", color);
                        $(`${divName}_detail`).html(ps);
                        $(`${divName}`).addClass("sh");
                    } else {
                        $(`${divName}`).addClass("hi");
                    }
                }

                $(`${ds} .sh`).css("display", "block").removeClass("sh");
                $(`${ds} .hi`).css("display", "none").removeClass("hi");
                $(`${flag}_jg`).text(ret.jg);
                $(`${flag}_xz`).text(ret.xz);
                $(`${flag}_zc`).text(ret.zc);
                $(`${flag}_gz`).text(ret.gz);
                $(`${flag}_wlj`).text(ret.wlj);
                $(`${flag}_sum`).text(ret.sum);
                var els = $(".ds");
                var margin = els.length > 0 ? ($(els[0]).css("margin").replace("px", "") >> 0) * 2 : 5;
                var padding = ($(ds).css("padding").replace("px", "") >> 0) * 2;
                if (ret.row > 0) {
                    var tw = $(ds).width();
                    var col = Math.floor(tw / def);
                    var tCol = ret.col > col ? col : ret.col;
                    var nWidth = Math.floor(tw / tCol) - margin;

                    var windowH = $(window).height();//获取当前窗口高度
                    $(`${flag}`).css("height", `${windowH}px`);
                    var th = $(ds).closest(".dsDiv").height();
                    var row = Math.floor(th / def);
                    var tRow = ret.row > row ? row : ret.row;
                    var nHeight = Math.floor(th / tRow) - padding;
                    $(".ds").css("flex-basis", `${(nWidth < def ? def : nWidth)}px`).css("height", `${(nHeight < def ? def : nHeight)}px`);
                }
                next && (page[kbId] = ++ret.cp);
            }

            const images = [];
            for (i = 0; i < len; i++) {
                var d = devices[i];
                if (!dsPaths[kbId][d.Icon] && !~images.lastIndexOf(d.Icon))
                    images.push(d.Icon);
            }

            if (images.length > 0) {
                data = {
                    type: fileEnum.Device,
                    files: JSON.stringify(images)
                };
                data.dir = "";
                for (var k in fileEnum) {
                    if (fileEnum[k] == data.type) {
                        data.dir = k;
                        break;
                    }
                }
                if (isStrEmptyOrUndefined(data.dir)) {
                    return void layer.msg("文件类型不存在！");
                }

                getFilePath(data, back, 0);
            }
            else
                back();
        }
    }, 0);
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
