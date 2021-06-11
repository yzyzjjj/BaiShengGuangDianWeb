var def = 175;
var curId = -1;
var t = 0;
var uiTime = 0;
var dataTime = 0;
var run = false;
var page = [];
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
//脚本变量选择
var scriptTmp = [];
var kanBans = [];
var kanBanItems = [];
var shifts = [];
var kanBanItemsTmp = [];
var trFlag = "XvHao";
$(document).on("keydown", function (e) {
    if (e.keyCode == 27) {
        $('.content').find(".fullScreenBtn.fsb").click();
        cancelFullScreenCarousel && cancelFullScreenCarousel();
    };
});

//异常报警 = 1,
//异常统计 = 2,
//设备状态反馈 = 3,
//设备预警状态 = 4,
//计划号日进度表 = 5,
//设备日进度表 = 6,
//操作工日进度表 = 7
var kanBanProductItemsEl = [];
var kanBanProductItemsTables = [];

var tableSet = tableDefault();
var _permissionList = [];
function pageReady() {
    $(".sidebar-mini").addClass("sidebar-collapse");
    _permissionList[675] = { uIds: [] };
    _permissionList[676] = { uIds: ["firstNavLi", "setKanBan"] };
    _permissionList[722] = { uIds: ["setTab", "setTabLi"] };
    _permissionList[723] = { uIds: ["carouselTab", "carouselTabLi"] };
    _permissionList = checkPermissionUi(_permissionList);
    if (!_permissionList[722].have && _permissionList[723].have)
        $('#carouselTabLi a').click();
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
            kanBanProductItemsEl.forEach(el => {
                for (var key in el) {
                    if (~key.indexOf("_timer")) {
                        stopScrollTable(el, key, key.replace("_timer", ""));
                        //delete el[key];
                    }
                }
            })
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
        if (!isShow) {
            kanBanProductItemsEl.forEach(el => {
                for (var key in el) {
                    if (~key.indexOf("_timer")) {
                        stopScrollTable(el, key, key.replace("_timer", ""));
                        //delete el[key];
                    }
                }
            })
        }
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
        let col = $(this).val() >> 0;
        col == 0 && (col = 1, $(this).val(col));
        col > 15 && (col = 15, $(this).val(col));
        const type = $('#kanBanType').val() >> 0;
        type == 3 && initColSet(false);
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

    $('#kanBanList').on('select2:select', function () {
        var id = $(this).val();
        if (!id) return;
        var d = kanBans[id];
        $('#kanBanName').val(d.Name);
        $('#kanBanOrder').val(d.Order);
        $('#isShow').iCheck(d.IsShow ? 'check' : 'uncheck');
        $("#setKanBan .stateEl").addClass("hidden");
        $("#setKanBan .stateEl1").addClass("hidden");
        $("#setKanBan .productEl").addClass("hidden");
        $("#kanBanUI").val(d.UI);
        $("#kanBanSecond").val(d.Second);
        if (d.Type == 2) {
            $("#kanBanRow").val(d.Row);
            $("#kanBanCol").val(d.Col);
            $("#kanBanContentCol").val(d.ContentCol);
            $("#kanBanLength").val(d.Length);
            $("#setKanBan .stateEl").removeClass("hidden");
            scriptIndexTmp = [];
            scriptTmp = [];
            if (d.ContentCol > 2) {
                $("#kanBanItemColNameDiv").removeClass("hidden");
                var fOs = getFirstOrders(d.ContentCol);
                var desc = `（首列：${fOs.join()},不为空的列名）`;
                $("#kanBanContentColDesc").text(desc);
                initColName(true);
            }
            $('#kanBanScript').html("");
        } else if (d.Type == 3) {
            $("#kanBanRow").val(d.Row);
            $("#kanBanCol").val(d.Col);
            $("#setKanBan .productEl").removeClass("hidden");
            initColSet(true);
            initProduct(d.Type);
            showPreProduct();
        }
        $('#deviceSelect').val(d.DeviceIdList).trigger('change');
    });

    $('#deviceSelect')
        .on("select2:select", function () {
            var v = $(this).val();
            if (~v.indexOf('0')) {
                $(this).val(0).trigger('change');
            }
        })
        .on("change", function () {
            let deviceId = $(this).val();
            if (isStrEmptyOrUndefined(deviceId)) {
                scriptIndexTmp = [];
                scriptTmp = [];
                $('#kanBanScript').html("");
                return;
            }

            var tmp = [];
            if (deviceId.length == 1 && ~deviceId.indexOf('0'))
                deviceId = deviceTmp.map(x => x.Id).filter(x => x);

            const type = $('#kanBanType').val() >> 0;
            if (type == 2) {
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

                getScriptList();
            }
        });

    $('#kanBanType').on('change', function () {
        const type = $(this).val();
        const color = $(this).find(`[value=${type}]`).css("color");
        $(this).css("color", color);
        $("#setKanBan .stateEl").addClass("hidden");
        $("#setKanBan .productEl").addClass("hidden");
        const opData = kanBans.filter(x => x.Type == type && x.Id != 0);
        let j = 0;
        const ops = opData.reduce((a, d, i) => d.Id !== 0 && d.Type == type ? `${a}<option value=${d.Id}>${++j}-${d.Name}</option>` : "", "");
        $('#kanBanList').html(ops);
        if (opData.length > 0) {
            const d = opData[0];
            $('#kanBanList').val(d.Id).trigger("select2:select");
        }
    });

    $('#kanBanItemColSet').on('input', ".kb_item_col2", function () {
        let v = $(this).val() >> 0;
        const id = $(this).attr("id");
        const max = 100;
        let nw = 0;
        $('#kanBanItemColSet .kb_item_col2').each((_, el) => {
            let elId = $(el).attr("id");
            id != elId && (nw += $(el).val() >> 0);
        });
        const left = max - nw;
        v > left && (v = left, $(this).val(v));
        initColSet(false);
    });

    $('#kanBanContentCol').on('input', function () {
        const cCol = $(this).val();
        let desc = "";
        if (cCol > 2) {
            var fOs = getFirstOrders(cCol);
            desc = `（首列顺序：${fOs.join()}）`;
            $("#kanBanItemColNameDiv").removeClass("hidden");
            initColName(false);
        } else {
            //$("#kanBanItemColNameDiv .kb_item_col2").each((_, el) => $(el).val(""));
            $("#kanBanItemColNameDiv").addClass("hidden");
        }
        $("#kanBanContentColDesc").text(desc);
    });

    $('#kanBanScript')
        .on('input', '.order', function () {
            const tr = $(this).closest('tr');
            const cCol = $("#kanBanContentCol").val() >> 0;
            const maxSet = getMaxSet(cCol);
            onInput(this, 5, 2, 1, maxSet);
        });

    $('#kanBanScript')
        .on('input', '.subOrder', function () {
            const tr = $(this).closest('tr');
            //const o = $(tr).find('.order').val >> 0;

            //const cCol = $("#kanBanContentCol").val() >> 0;
            //const maxSet = getMaxSet(cCol);
            onInput(this, 5, 2, 1, 5);
        });

    $('#kanBanItems')
        .on('click', '.itemAddBtn', function () {
            const el = $(this);
            const id = $(el).attr("value").trim() >> 0;
            const name = el.attr("name");
            const order = colSet[0].chose.length;
            const kid = $('#kanBanList').val();
            const kanBan = kanBans[kid];
            const items = kanBanItems[kanBan.Type] ? kanBanItems[kanBan.Type] : [];
            const its = items.filter(x => x.Item == id);
            if (its.length > 0) {
                const it = its[0];
                addOrderData(it.FieldList);
                kanBanItemsTmp.push({
                    Item: id,
                    Col: 0,
                    Order: order,
                    Shifts: 0,
                    Hour: 0,
                    Min: 0,
                    FieldList: it.FieldList
                });

                colSet[0].chose.push({
                    name,
                    //isTable: it.Display,
                    val: id,
                    col: 0,
                    order: order,
                    height: 100,
                    dOrder: 0,
                    dField: it.FieldList.length ? it.FieldList[0].Field : "",
                });

                //if (el.is(':checked') && !existArray(kanBanItemsTmp, id)) {
                //    kanBanItemsTmp.push(id);
                //    const order = colSet[0].chose.length;
                //    colSet[0].chose.push({
                //        name,
                //        val: id,
                //        col: 0,
                //        order: order,
                //        height: -1
                //    });
                //} else if (!el.is(':checked') && existArray(kanBanItemsTmp, id)) {
                //    kanBanItemsTmp = kanBanItemsTmp.filter(x => x != id);
                //    colSet.forEach(d => {
                //        var t = [], i = 0;
                //        d.chose.forEach(c => {
                //            if (c.val !== id) {
                //                c.order = i++;
                //                t.push(c);
                //            }
                //        });
                //        d.chose = t;
                //    });
                //}
                showPreProduct();
            }
        });

    $('#kanBanProductDetail')
        .on('click', '.itemDelBtn', function () {
            const el = $(this).closest('.kb_div1');
            const id = $(el).attr("value") >> 0;
            var col = ($(el).find(`.C_${id}`).val() >> 0) - 1;
            var order = ($(el).find(`.O_${id}`).val() >> 0) - 1;
            removeArray(kanBanItemsTmp, "Col", col, "Order", order);
            kanBanItemsTmp.forEach(d => {
                if (d.Col == col && d.Order >= order) {
                    d.Order--;
                }
            })
            removeArray(colSet[col].chose, "col", col, "order", order);
            colSet[col].chose = colSet[col].chose.sort(sortOrder);
            for (let i = 0, len = colSet[col].chose.length; i < len; i++) {
                colSet[col].chose[i].order = i;
            }
            showPreProduct();
        });

    $('#kanBanProductDetail')
        .on('click', '.upTr', function () {
            const el = $(this).closest(".kb_div1");
            const id = $(el).attr("value") >> 0;
            const col = ($(el).find(`.C_${id}`).val() >> 0) - 1;
            const order = ($(el).find(`.O_${id}`).val() >> 0) - 1;
            if (colSet[col] && colSet[col].chose) {
                colSet[col].chose[order].order = order - 1;
                colSet[col].chose[order - 1].order = order;
                colSet[col].chose = colSet[col].chose.sort(sortOrder);
            }
            var d1 = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
            var d2 = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order - 1);

            kanBanItemsTmp.forEach(d => {
                if (d == d1[0]) {
                    d.Order = order - 1;
                }
                if (d == d2[0]) {
                    d.Order = order;
                }
            })

            kanBanItemsTmp = kanBanItemsTmp.sort(firstBy("Col").thenBy("Order"));
            showPreProduct();
        });

    $('#kanBanProductDetail')
        .on('click', '.downTr', function () {
            const el = $(this).closest(".kb_div1");
            const id = $(el).attr("value") >> 0;
            const col = ($(el).find(`.C_${id}`).val() >> 0) - 1;
            const order = ($(el).find(`.O_${id}`).val() >> 0) - 1;
            if (colSet[col] && colSet[col].chose) {
                colSet[col].chose[order].order = order + 1;
                colSet[col].chose[order + 1].order = order;
                colSet[col].chose = colSet[col].chose.sort(sortOrder);
            }
            var d1 = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
            var d2 = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order + 1);
            kanBanItemsTmp.forEach(d => {
                if (d == d1[0]) {
                    d.Order = order + 1;
                }
                if (d == d2[0]) {
                    d.Order = order;
                }
            })

            kanBanItemsTmp = kanBanItemsTmp.sort(firstBy("Col").thenBy("Order"));
            showPreProduct();
        });

    $('#kanBanProductDetail')
        .on('change', '.colSet', function () {
            const el = $(this).closest(".kb_div1");
            const id = $(el).attr("value") >> 0;
            const oldCol = ($(el).find(`.C_${id}`).attr("old") >> 0) - 1;
            const oldOrder = ($(el).find(`.O_${id}`).attr("old") >> 0) - 1;
            const col = ($(el).find(`.C_${id}`).val() >> 0) - 1;
            const order = ($(el).find(`.O_${id}`).val() >> 0) - 1;
            const name = $(el).find(`.N_${id}`).val().trim();
            const height = $(el).find(`.H_${id}`).val();

            const dField = $(el).find(`.DF_${id}`).val();
            const dOrder = $(el).find(`.DO_${id}`).val();

            const timeType = $(el).find(`.Time_${id}`).val() >> 0;
            const range = $(el).find(`.Range_${id}`).val() >> 0;
            const step = $(el).find(`.Step_${id}`).val() >> 0;
            const isSum = $(el).find(`.IsSum_${id}`).is(':checked');
            var gItems = $(el).find(`.GroupItems_${id}`).val();
            isStrEmptyOrUndefined(gItems) && (gItems = []);

            const shift = $(el).find(`.Shift_${id}`).val() >> 0;
            const hour = $(el).find(`.Hour_${id}`).val() >> 0;
            const min = $(el).find(`.Min_${id}`).val() >> 0;
            if (oldCol == col) {
                colSet[col].chose.forEach(d => {
                    if (d.order == order) {
                        d.name = name;
                        d.dField = dField;
                        d.dOrder = dOrder;
                        d.height = isStrEmptyOrUndefined(height) ? -1 : (height >> 0);
                    }
                })

                var n = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
                kanBanItemsTmp.forEach(d => {
                    if (d == n[0]) {
                        if (~its.indexOf(d.Item)) {
                            !d.ConfigList && (d.ConfigList = []);
                            /// 工序推移图  [0][0] 班制 [0][1]数据类型 [0][2]时间范围 [0][3]合计
                            var index = 0;
                            !d.ConfigList[index] && (d.ConfigList[index] = []);
                            d.ConfigList[index][0] = shift;
                            d.ConfigList[index][1] = timeType;
                            d.ConfigList[index][2] = range;
                            d.ConfigList[index][3] = isSum ? 1 : 0;
                            //[1][...]工序;
                            index = 1;
                            !d.ConfigList[index] && (d.ConfigList[index] = []);
                            d.ConfigList[index][0] = step;
                            //[2][...] 计划号
                            index = 2;
                            !d.ConfigList[index] && (d.ConfigList[index] = []);
                            if (d.Item == 9)
                                d.ConfigList[index] = gItems;
                            //[3][...] 操作工
                            index = 3;
                            !d.ConfigList[index] && (d.ConfigList[index] = []);
                            if (d.Item == 11)
                                d.ConfigList[index] = gItems;

                            var special = "";
                            if (timeType == 0)
                                special = "hour";
                            else if (timeType == 1)
                                special = "mDate";
                            else if (timeType == 2)
                                special = "week";
                            else if (timeType == 3)
                                special = "month";
                            else if (timeType == 4)
                                special = "year";
                            d.FieldList.forEach((f, i) => {
                                if (f.XvHao == 0) {
                                    f.Func = JSON.stringify({
                                        special,
                                    });
                                }
                            })
                        } else {
                            d.Shifts = shift;
                            d.Hour = hour;
                            d.Min = min;
                        }
                    }
                })
            } else {
                var n = colSet[oldCol].chose.filter(x => x.order == order);
                var kn = kanBanItemsTmp.filter(x => x.Col == oldCol && x.Order == order);
                var newCol = col;
                var newOrder = order;
                if (n.length && kn.length) {
                    removeArray(colSet[oldCol].chose, "order", order);
                    removeArray(kanBanItemsTmp, "Col", oldCol, "Order", order);
                    n[0].col = col;
                    n[0].order = colSet[col].chose.length;
                    colSet[col].chose.push(n[0]);
                    newCol = n[0].col;
                    newOrder = n[0].order;

                    kn[0].Col = newCol;
                    kn[0].Order = newOrder;
                    kanBanItemsTmp.push(kn[0]);

                    colSet[oldCol].chose.forEach((d, i) => {
                        if (d.order != i) {
                            var n = kanBanItemsTmp.filter(x => x.Col == oldCol && x.Order == d.order);
                            kanBanItemsTmp.forEach(d => {
                                if (d == n[0]) {
                                    d.Order = i;
                                }
                            })
                            d.order = i;
                        }
                    })
                }
            }

            kanBanItemsTmp = kanBanItemsTmp.sort(firstBy("Col").thenBy("Order"));

            showPreProduct();
        });

    $('#kanBanProductDetail')
        .on('change', '.ms2', function () {
            const el = $(this).closest(".kb_div1");
            const id = $(el).attr("value") >> 0;
            const oldCol = ($(el).find(`.C_${id}`).attr("old") >> 0) - 1;
            const col = ($(el).find(`.C_${id}`).val() >> 0) - 1;
            const order = ($(el).find(`.O_${id}`).val() >> 0) - 1;

            const timeType = $(el).find(`.Time_${id}`).val() >> 0;
            const range = $(el).find(`.Range_${id}`).val() >> 0;
            const step = $(el).find(`.Step_${id}`).val() >> 0;
            const isSum = $(el).find(`.IsSum_${id}`).is(':checked');
            var gItems = $(el).find(`.GroupItems_${id}`).val();
            isStrEmptyOrUndefined(gItems) && (gItems = []);

            const shift = $(el).find(`.Shift_${id}`).val() >> 0;
            if (oldCol == col) {
                var n = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
                kanBanItemsTmp.forEach(d => {
                    if (d == n[0]) {
                        !d.ConfigList && (d.ConfigList = []);
                        /// 工序推移图  [0][0] 班制 [0][1]数据类型 [0][2]时间范围 [0][3]合计
                        var index = 0;
                        !d.ConfigList[index] && (d.ConfigList[index] = []);
                        d.ConfigList[index][0] = shift;
                        d.ConfigList[index][1] = timeType;
                        d.ConfigList[index][2] = range;
                        d.ConfigList[index][3] = isSum ? 1 : 0;
                        //[1][...]工序;
                        index = 1;
                        !d.ConfigList[index] && (d.ConfigList[index] = []);
                        d.ConfigList[index][0] = step;
                        //[2][...] 计划号
                        index = 2;
                        !d.ConfigList[index] && (d.ConfigList[index] = []);
                        if (d.Item == 9)
                            d.ConfigList[index] = gItems;
                        //[3][...] 操作工
                        index = 3;
                        !d.ConfigList[index] && (d.ConfigList[index] = []);
                        if (d.Item == 11)
                            d.ConfigList[index] = gItems;
                    }
                })
            }
        });

    $('#kanBanProductDetail')
        .on('change', '.ms2m', function () {
            const el = $(this).closest(".kb_div1");
            const id = $(el).attr("value") >> 0;
            const oldCol = ($(el).find(`.C_${id}`).attr("old") >> 0) - 1;
            const col = ($(el).find(`.C_${id}`).val() >> 0) - 1;
            const order = ($(el).find(`.O_${id}`).val() >> 0) - 1;

            const timeType = $(el).find(`.Time_${id}`).val() >> 0;
            const range = $(el).find(`.Range_${id}`).val() >> 0;
            const step = $(el).find(`.Step_${id}`).val() >> 0;
            const isSum = $(el).find(`.IsSum_${id}`).is(':checked');
            var gItems = $(el).find(`.GroupItems_${id}`).val();
            isStrEmptyOrUndefined(gItems) && (gItems = []);

            const shift = $(el).find(`.Shift_${id}`).val() >> 0;
            if (oldCol == col) {
                var n = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
                kanBanItemsTmp.forEach(d => {
                    if (d == n[0]) {
                        !d.ConfigList && (d.ConfigList = []);
                        /// 工序推移图  [0][0] 班制 [0][1]数据类型 [0][2]时间范围 [0][3]合计
                        var index = 0;
                        !d.ConfigList[index] && (d.ConfigList[index] = []);
                        d.ConfigList[index][0] = shift;
                        d.ConfigList[index][1] = timeType;
                        d.ConfigList[index][2] = range;
                        d.ConfigList[index][3] = isSum ? 1 : 0;
                        //[1][...]工序;
                        index = 1;
                        !d.ConfigList[index] && (d.ConfigList[index] = []);
                        d.ConfigList[index][0] = step;
                        //[2][...] 计划号
                        index = 2;
                        !d.ConfigList[index] && (d.ConfigList[index] = []);
                        if (d.Item == 9)
                            d.ConfigList[index] = gItems;
                        //[3][...] 操作工
                        index = 3;
                        !d.ConfigList[index] && (d.ConfigList[index] = []);
                        if (d.Item == 11)
                            d.ConfigList[index] = gItems;
                    }
                })
            }
        });

    $('#kanBanProductDetail')
        .on('ifChanged', '.cbs', function () {
            const el = $(this).closest(".kb_div1");
            const id = $(el).attr("value") >> 0;
            const oldCol = ($(el).find(`.C_${id}`).attr("old") >> 0) - 1;
            const col = ($(el).find(`.C_${id}`).val() >> 0) - 1;
            const order = ($(el).find(`.O_${id}`).val() >> 0) - 1;

            const timeType = $(el).find(`.Time_${id}`).val() >> 0;
            const range = $(el).find(`.Range_${id}`).val() >> 0;
            const step = $(el).find(`.Step_${id}`).val() >> 0;
            const isSum = $(el).find(`.IsSum_${id}`).is(':checked');
            var gItems = $(el).find(`.GroupItems_${id}`).val();
            isStrEmptyOrUndefined(gItems) && (gItems = []);

            const shift = $(el).find(`.Shift_${id}`).val() >> 0;
            if (oldCol == col) {
                var n = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
                kanBanItemsTmp.forEach(d => {
                    if (d == n[0]) {
                        !d.ConfigList && (d.ConfigList = []);
                        /// 工序推移图  [0][0] 班制 [0][1]数据类型 [0][2]时间范围 [0][3]合计
                        var index = 0;
                        !d.ConfigList[index] && (d.ConfigList[index] = []);
                        d.ConfigList[index][0] = shift;
                        d.ConfigList[index][1] = timeType;
                        d.ConfigList[index][2] = range;
                        d.ConfigList[index][3] = isSum ? 1 : 0;
                        //[1][...]工序;
                        index = 1;
                        !d.ConfigList[index] && (d.ConfigList[index] = []);
                        d.ConfigList[index][0] = step;
                        //[2][...] 计划号
                        index = 2;
                        !d.ConfigList[index] && (d.ConfigList[index] = []);
                        if (d.Item == 9)
                            d.ConfigList[index] = gItems;
                        //[3][...] 操作工
                        index = 3;
                        !d.ConfigList[index] && (d.ConfigList[index] = []);
                        if (d.Item == 11)
                            d.ConfigList[index] = gItems;
                    }
                })
            }
        });

    $('#kanBanProductDetail')
        .on('click', '.sUpTr', function () {
            const el = $(this).closest(".kb_div1");
            const id = $(el).attr("value") >> 0;
            const col = ($(el).find(`.C_${id}`).val() >> 0) - 1;
            const order = ($(el).find(`.O_${id}`).val() >> 0) - 1;

            const tr = $(this).closest("tr");
            const trXvHao = $(tr).attr("value") >> 0;
            const trOrder = ($(tr).find(`.Or_${trXvHao}`).attr("value") >> 0);

            var d = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
            kanBanItemsTmp.forEach(dt => {
                if (dt == d[0]) {
                    dt.FieldList.forEach((f, i) => {
                        if (f.XvHao == trXvHao) {
                            f.Order = trOrder - 1;
                        }
                        if (f.XvHao == trXvHao - 1) {
                            f.Order = trOrder;
                        }
                    })
                    var tfl = dt.FieldList.filter(t => t.Order).sort(firstBy("Order"));
                    var nfl = dt.FieldList.filter(t => !t.Order).sort(firstBy("XvHao"));
                    dt.FieldList = tfl.concat(nfl);
                    dt.FieldList.forEach((f, i) => {
                        f.XvHao = i;
                    })
                }
            })
            showPreProduct();
        });

    $('#kanBanProductDetail')
        .on('click', '.sDownTr', function () {
            const el = $(this).closest(".kb_div1");
            const id = $(el).attr("value") >> 0;
            const col = ($(el).find(`.C_${id}`).val() >> 0) - 1;
            const order = ($(el).find(`.O_${id}`).val() >> 0) - 1;

            const tr = $(this).closest("tr");
            const trXvHao = $(tr).attr("value") >> 0;
            const trOrder = ($(tr).find(`.Or_${trXvHao}`).attr("value") >> 0);

            var d = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
            kanBanItemsTmp.forEach(dt => {
                if (dt == d[0]) {
                    dt.FieldList.forEach((f, i) => {
                        if (f.XvHao == trXvHao) {
                            f.Order = trOrder + 1;
                        }
                        if (f.XvHao == trXvHao + 1) {
                            f.Order = trOrder;
                        }
                    })
                    var tfl = dt.FieldList.filter(t => t.Order).sort(firstBy("Order"));
                    var nfl = dt.FieldList.filter(t => !t.Order).sort(firstBy("XvHao"));
                    dt.FieldList = tfl.concat(nfl);
                    dt.FieldList.forEach((f, i) => {
                        f.XvHao = i;
                    })
                }
            })
            showPreProduct();
        });

    $('#kanBanProductDetail')
        .on('change', '.cb', function () {
            const el = $(this).closest(".kb_div1");
            const display = $(el).attr("display") >> 0;
            if (display == 0) {
                var check = $(this).prop("checked");
                const el = $(this).closest(".kb_div1");
                const id = $(el).attr("value") >> 0;
                const col = ($(el).find(`.C_${id}`).val() >> 0) - 1;
                const order = ($(el).find(`.O_${id}`).val() >> 0) - 1;

                const tr = $(this).closest("tr");
                const trXvHao = $(tr).attr("value") >> 0;

                var d = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
                kanBanItemsTmp.forEach(dt => {
                    if (dt == d[0]) {
                        var length = dt.FieldList.length;
                        dt.FieldList.forEach((f, i) => {
                            if (f.XvHao == trXvHao) {
                                if (!check)
                                    f.Order = 0;
                                else
                                    f.Order = length + 1;
                            }
                        })
                        var tfl = dt.FieldList.filter(t => t.Order).sort(firstBy("Order"));
                        tfl.forEach((f, i) => {
                            f.Order = i + 1;
                        })
                        var nfl = dt.FieldList.filter(t => !t.Order).sort(firstBy("XvHao"));
                        dt.FieldList = tfl.concat(nfl);
                        dt.FieldList.forEach((f, i) => {
                            f.XvHao = i;
                        })
                    }
                })
            } else if (display == 1) {
                const el = $(this).closest(".kb_div1");
                const id = $(el).attr("value") >> 0;
                const col = ($(el).find(`.C_${id}`).val() >> 0) - 1;
                const order = ($(el).find(`.O_${id}`).val() >> 0) - 1;

                const tr = $(this).closest("tr");
                const trXvHao = $(tr).attr("value") >> 0;

                var d = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
                kanBanItemsTmp.forEach(dt => {
                    if (dt == d[0]) {
                        dt.FieldList.forEach((f, i) => {
                            f.Order = f.XvHao == trXvHao ? 1 : 0;
                            //const color = f.XvHao == trXvHao ? "#d2d6de" : "#f9f9f9"
                            //$(el).find(`tr[value=${f.XvHao}]`).css("background-color", color);
                        })
                    }
                })
            }
            showPreProduct();
        });

    $('#kanBanProductDetail')
        .on('change', '.fieldSet', function () {
            const el = $(this).closest(".kb_div1");
            const id = $(el).attr("value") >> 0;
            const col = ($(el).find(`.C_${id}`).val() >> 0) - 1;
            const order = ($(el).find(`.O_${id}`).val() >> 0) - 1;

            const tr = $(this).closest("tr");
            const trXvHao = $(tr).attr("value") >> 0;
            const com = $(el).find(`.Com_${trXvHao}`).val();
            const wid = $(el).find(`.Wid_${trXvHao}`).val();
            const func = $(el).find(`.Func_${trXvHao}`).val();
            const pre = $(el).find(`.Pre_${trXvHao}`).val();
            const suf = $(el).find(`.Suf_${trXvHao}`).val();

            var d = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
            kanBanItemsTmp.forEach(dt => {
                if (dt == d[0]) {
                    dt.FieldList.forEach((f, i) => {
                        if (f.XvHao == trXvHao) {
                            f.Column = com;
                            f.Width = wid;
                            f.Func = unescape(func);
                            f.Pre = pre;
                            f.Suffix = suf;
                        }
                    })
                }
            })
            //showPreProduct();
        });

    var getWorkshopFunc = new Promise(resolve => getWorkshop(resolve));
    var getStepFunc = new Promise(resolve => getStep(resolve));
    var getProductionFunc = new Promise(resolve => getProduction(resolve));
    var getDeviceFunc = new Promise(resolve => getDevice(resolve));
    var getProcessorFunc = new Promise(resolve => getProcessor(resolve));
    //var getKanBanListFunc = new Promise(resolve => getKanBanList(resolve));
    getWorkshopFunc.then(ret => {
        Promise.all([getStepFunc, getProductionFunc, getDeviceFunc, getProcessorFunc]).then(ret => {
            new Promise(resolve => getKanBanList(resolve)).then(ret => {
                const deviceIds = ret[0];
                const kbs = ret[1];
                if (kbs.length > 0) {
                    $('#kanBanList').trigger('select2:select');
                }
            });
        });
    })
}

let colName = [];
function initColName(init = true) {
    let col = $('#kanBanContentCol').val() >> 0;

    const id = $('#kanBanList').val();
    const kanBan = kanBans[id];
    if (kanBan) {
        init && (col = kanBan.ContentCol);
        init && (colName = kanBan.ColName ? kanBan.ColName.split(",") : []);
    }

    let len = colName.length;
    if (col > len) {
        for (let i = colName.length, len = col; i < len; i++) {
            if (!colName[i]) {
                colName[i] = "";
            }
        }
    } else {
        colName = sliceArray(colName, col);
    }

    var name = Array.from($('#kanBanItemColName .kb_item_col2').map((_, a) => (a.value)));
    for (let i = 0, len = colName.length; i < len; i++) {
        const d = name[i];
        if (d) {
            colName[i] = d;
        }
    }

    if (init) {
        let colNames = "";
        for (let i = 0; i < col; i++) {
            const d = colName[i];
            colNames +=
                `<div class="input-group kb_item_div1">
                    <span class="text-bold input-group-addon kb_item_col1">列${i + 1}：</span>
                    <input class="form-control kb_item_col2" id="kanBanItemColName${i}" value=${d}>
                </div>`;
        }
        $('#kanBanItemColName').html(colNames);
        return;
    }
    len = $('#kanBanItemColName .kb_item_col2').length;
    if (col > len) {
        let colNames = "";
        for (let i = 0, j = col; i < j; i++) {
            if (!$(`#kanBanItemColName${i}`).length) {
                colNames +=
                    `<div class="input-group kb_item_div1">
                        <span class="text-bold input-group-addon kb_item_col1">列${i + 1}：</span>
                        <input class="form-control kb_item_col2" id="kanBanItemColName${i}">
                    </div>`;
            }
        }
        $('#kanBanItemColName').append(colNames);
    } else {
        for (let i = len - 1; i >= col; i--) {
            $(`#kanBanItemColName${i}`).closest(".kb_item_div1").addClass("rm");
        }
        $('#kanBanItemColName .rm').remove();
    }
}

let colSet = [];
function initColSet(init = true) {
    let col = $('#kanBanCol').val() >> 0;

    const id = $('#kanBanList').val();
    const kanBan = kanBans[id];
    if (kanBan && init) {
        col = kanBan.Col;
        colSet = kanBan.ColSet ? JSON.parse(kanBan.ColSet) : [];
        kanBanItemsTmp = kanBan.ItemList ? kanBan.ItemList : [];
        var col0 = kanBanItemsTmp.filter(x => x.Col == 0);
        if (col0.length) {
            //var cols = selectMany(colSet, "chose");
            kanBanItemsTmp.forEach(d => {
                //if (d.Col == 0) {
                //    var t = cols.filter(x => x.val == d.Item);
                //    if (t.length) {
                //        d.Col = t[0].col;
                //        d.Order = t[0].order;
                //    }
                //}
                d.FieldList.forEach((f, i) => {
                    f.XvHao = i;
                })
                if (!~its.indexOf(d.Item)) {
                    var tfl = d.FieldList.filter(t => t.Order).sort(firstBy("Order"));
                    var nfl = d.FieldList.filter(t => !t.Order).sort(firstBy("XvHao"));
                    d.FieldList = tfl.concat(nfl);
                }
            })
            kanBanItemsTmp = kanBanItemsTmp.sort(firstBy("Col").thenBy("Order"));
        }
    }

    let len = colSet.length;
    if (col > len) {
        for (let i = colSet.length, len = col; i < len; i++) {
            if (!colSet[i]) {
                colSet[i] = { width: 0, chose: [] };
            }
        }
    } else {
        for (let i = len - 1; i >= col; i--) {
            let l = colSet[0].chose.length;
            if (l) {
                for (var j = 0, jLen = colSet[i].chose.length; j < jLen; j++) {
                    const d = colSet[i].chose[j];
                    var c = d.col;
                    var o = d.order;
                    d.col = 0;
                    d.order = l++;
                    colSet[0].chose.push(d);
                    var n = kanBanItemsTmp.filter(x => x.Col == c && x.Order == o);
                    kanBanItemsTmp.forEach(kd => {
                        if (kd == n[0]) {
                            kd.Col = d.col;
                            kd.Order = d.order;
                        }
                    })
                }
            }
        }
        colSet = sliceArray(colSet, col);
        kanBanItemsTmp = kanBanItemsTmp.sort(firstBy("Col").thenBy("Order"));
    }
    if (!init) {
        var colWidth = Array.from($('#kanBanItemColSet .kb_item_col2').map((_, a) => ({ width: a.value >> 0 })));
        for (let i = 0, len = colSet.length; i < len; i++) {
            const d = colWidth[i];
            if (d) {
                colSet[i].width = d.width;
            }
        }
    }

    if (init) {
        let colSets = "";
        for (let i = 0; i < col; i++) {
            const d = colSet[i];
            colSets +=
                `<div class="input-group kb_item_div1">
                    <span class="text-bold input-group-addon kb_item_col1">列${i + 1}：</span>
                    <input class="form-control kb_item_col2" id="kanBanItemCol${i}" value=${d.width} oninput="onInput(this, 3, 0);">
                    <span class="input-group-addon kb_item_col3">%</span>
                </div>`;
        }
        $('#kanBanItemColSet').html(colSets);
        return;
    }
    len = $('#kanBanItemColSet .kb_item_col2').length;
    if (col > len) {
        let colSets = "";
        for (let i = 0, j = col; i < j; i++) {
            if (!$(`#kanBanItemCol${i}`).length) {
                colSets +=
                    `<div class="input-group kb_item_div1">
                        <span class="text-bold input-group-addon kb_item_col1">列${i + 1}：</span>
                        <input class="form-control kb_item_col2" id="kanBanItemCol${i}" value=0 oninput="onInput(this, 3, 0);">
                        <span class="input-group-addon kb_item_col3">%</span>
                    </div>`;
            }
        }
        $('#kanBanItemColSet').append(colSets);
    } else {
        for (let i = len - 1; i >= col; i--) {
            $(`#kanBanItemCol${i}`).closest(".kb_item_div1").addClass("rm");
        }
        $('#kanBanItemColSet .rm').remove();
    }
    showPreProduct();
}

function initProduct(type) {
    const id = $('#kanBanList').val();
    const kanBan = kanBans[id];
    kanBanItemsTmp = [];
    if (kanBan && kanBan.ItemList) {
        kanBanItemsTmp = kanBan.ItemList;
    }

    const items = kanBanItems[type] ? kanBanItems[type] : [];
    const ops = items.reduce((a, b, i) => {
        return `${a}<div class="flexStyle mPadding">
                        <button type="button" class="btn btn-success btn-xs itemAddBtn" value="${b.Item}" type="${type}" name="${b.Name}"><i class="fa fa-plus"></i></button>
                        <span class="textOverTop mPadding">${b.Name}</span>
                    </div>`;
    }, "");
    $('#kanBanItems').html(ops);

    //const items = kanBanItems[type] ? kanBanItems[type] : [];
    //const ops = items.reduce((a, b, i) => {
    //    return `${a}<div class="flexStyle pointer choseBox">
    //                    <label class="flexStyle pointer">
    //                        <input type="checkbox" class="icb_minimal" ${(~kanBanItemsTmp.indexOf(b.Id) ? 'checked="checked"' : '')} value="${b.Id}" type="${type}" name="${b.Type}">
    //                        <span class="textOverTop mPadding">${b.Type}</span>
    //                    </label>
    //                </div>`;
    //}, "");
    //$('#kanBanItems').empty().append(ops);
    //$(`#kanBanItems .icb_minimal`).iCheck({
    //    handle: 'checkbox',
    //    checkboxClass: 'icheckbox_minimal-green',
    //    increaseArea: '20%'
    //});
}
var its = [9, 10, 11];
//生产相关配置预览
function showPreProduct() {
    //return;
    $("#kanBanProduct h3").text($("#kanBanName").val());
    const type = $('#kanBanType').val();
    const items = kanBanItems[type] ? kanBanItems[type] : [];
    const col = colSet.length;
    const ops = colSet.reduce((a, d, i) => {
        d.chose = d.chose.sort(sortOrder);
        const oMax = d.chose.length;
        const colspan = oMax > 1 ? 5 : 4;
        const tdShow = oMax > 1 ? "" : " hidden";
        const chose = d.chose.reduce((a, b, i) => {
            const item = items.filter(x => x.Item == b.val);
            const itemSet = kanBanItemsTmp.filter(x => x.Col == b.col && x.Order == b.order);
            if (!item.length || !itemSet.length)
                return a;
            const cItem = item[0];
            const sItem = itemSet[0];
            //const isTable = b.isTable ? b.isTable : 0;
            const cFieldList = cItem.FieldList;
            const sFieldList = sItem.FieldList;
            const sMax = sFieldList.filter(x => x.Order).length;
            const sTdShow = sMax > 1


            var shift = 0;
            var timeType = 0;
            var range = 10;
            var isSum = false;
            var step = 0;
            var productionIds = [];
            var processorIds = [];
            let stepOptions = "";
            let groupItems = "";
            if (~its.indexOf(cItem.Item)) {
                if (sItem.ConfigList) {
                    //item.ConfigList 工序推移图[0][0] 班制[0][1]数据类型[0][2]时间范围[0][3]合计;[1][...]工序
                    var index = 0;
                    if (sItem.ConfigList.length > index) {
                        //班制
                        shift = sItem.ConfigList[index].length > 0 ? sItem.ConfigList[index][0] : shift;
                        //时间类型
                        timeType = sItem.ConfigList[index].length > 1 ? sItem.ConfigList[index][1] : timeType;
                        //时间范围
                        range = sItem.ConfigList[index].length > 2 ? sItem.ConfigList[index][2] : range;
                        //是否是合计
                        isSum = sItem.ConfigList[index].length > 3 ? sItem.ConfigList[index][3] : isSum;
                    }
                    //工序
                    index = 1;
                    if (sItem.ConfigList.length > index && sItem.ConfigList[index].length > 0) {
                        step = sItem.ConfigList[index][0];
                    }
                    //计划号
                    index = 2;
                    if (sItem.ConfigList.length > index && sItem.ConfigList[index].length > 0) {
                        productionIds = sItem.ConfigList[index] ? sItem.ConfigList[index] : [];
                    }
                    //操作工
                    index = 3;
                    if (sItem.ConfigList.length > index && sItem.ConfigList[index].length > 0) {
                        processorIds = sItem.ConfigList[index] ? sItem.ConfigList[index] : [];
                    }
                }

                stepOptions = setOptions(stepTmp, "StepName");
                groupItems +=
                    `</br>
                    <label class="control-label">工序</label>
                    <select class="form-control ms2m Step_${b.val}" value="${step}">${stepOptions}</select>`;
                if (cItem.Item != 10) {
                    let gItems = "";
                    if (cItem.Item == 9) {
                        gItems = setOptions(productionTmp, "ProductionProcessName");
                        groupItems +=
                            `计划号<select class="form-control ms2 GroupItems_${b.val}" value="${(productionIds.join())}">${gItems}</select>`;
                    } else if (cItem.Item == 11) {
                        gItems = setOptions(processorTmp, "Name");
                        groupItems +=
                            `操作工<select class="form-control ms2m GroupItems_${b.val}" value="${(processorIds.join())}">${gItems}</select>`;
                    }
                }
                groupItems +=
                    `<label class="control-label text-red">合计
                        <input type="checkbox" class="icb_minimal cbs IsSum_${b.val}" value="${isSum}">
                    </label>`;
            }
            else {
                shift = itemSet.length ? sItem.Shifts : 0;
            }

            const fields = sFieldList.reduce((fs, fl, fi) => {
                const bConfig = cFieldList.filter(x => x.Field == fl.Field);
                const bColumn = bConfig.length ? bConfig[0].Column : "";
                const bAxis = bConfig.length ? bConfig[0].Axis : 0;
                const bDeal = bConfig.length ? bConfig[0].DataType : "";
                const bDeal1 = !!FieldFunc[bDeal];
                const bSpecial = bConfig.length ? bConfig[0].Special : "";
                const bSpecial1 = bDeal1 && !!FieldFunc[bDeal][bSpecial];

                const sColumn = fl.Column ? fl.Column : "";
                const sColor = fl.Color ? fl.Color : "";
                const sWidth = fl.Width ? fl.Width : "";
                const sPre = fl.Pre ? fl.Pre : "";
                const sSuffix = fl.Suffix ? fl.Suffix : "";
                const sFunc = fl.Func ? fl.Func : "";

                return fs +=
                    `<tr role="row" style="background-color: #f9f9f9;" value=${fl.XvHao}>
                        <td style="padding: 4px; border: 1px solid gray;">
                            ${(cItem.Display == 1 && bAxis == 0 ? `` : (cItem.Display == 1 && bAxis == 1 ?
                        `<input type="radio" name="Radio_${b.col}_${b.order}" class="cb Cho_${fi}" ${(fl.Order ? "checked" : "")} value="0">` :
                        `<input type="checkbox" class="cb Cho_${fi}" ${(fl.Order ? "checked" : "")} value="0">`))}
                        </td>
                        <td style="padding: 4px; border: 1px solid gray;">${fi + 1}</td>
                        <td style="padding: 4px; border: 1px solid gray;">
                            ${bColumn}
                        </td>
                        ${(cItem.Display == 1 ? `` :
                        `<td style="padding: 4px; border: 1px solid gray;" class="form-inline">
                            <input style="width: auto;${(sColor ? `color:${sColor};` : "")}" class="form-control text-center no-padding fieldSet Com_${fi}" old=${sColumn} value=${(sColumn ? sColumn : "")}>
                            <img class="mColorpicker Color_${fi}"><i style="cursor: pointer;" class="CClear_${fi}">清除</i>
                        </td>
                        <td style="padding: 4px; border: 1px solid gray;">
                            <input class="form-control text-center no-padding fieldSet Wid_${fi}" placeholder="自动" old=${sWidth} value=${sWidth}>
                        </td>
                        <td style="padding: 4px; border: 1px solid gray;">
                            <button class="btn btn-primary btn-sm Func_${fi}" old="${escape(sFunc)}" value="${escape(sFunc)}" onclick="showFunc(this, \'${bColumn}\', \'${bDeal}\', ${b.col}, ${b.order}, ${fl.XvHao})">设置</button>
                        </td>
                        <td style="padding: 4px; border: 1px solid gray;">
                            <input class="form-control text-center no-padding fieldSet Pre_${fi}" old=${sPre} value=${sPre}>
                        </td>
                        <td style="padding: 4px; border: 1px solid gray;">
                            <input class="form-control text-center no-padding fieldSet Suf_${fi}" old=${sSuffix} value=${sSuffix}>
                        </td>
                        <td style="padding: 4px; border: 1px solid gray;" class="form-inline Or_${fi}" value=${fl.Order}>
                            <span class="glyphicon glyphicon-arrow-up pointer text-green${(fi == 0 ? " hidden" : "")} ${((sTdShow && fl.Order) ? "" : " hidden")} sUpTr" aria-hidden="true" title="上移"></span>
                            <span class="glyphicon glyphicon-arrow-down pointer text-red${((fi + 1) == sMax ? " hidden" : "")} ${((sTdShow && fl.Order) ? "" : " hidden")}   sDownTr" aria-hidden="true" title="下移"></span>
                        </td>`)}
                    </tr>`;
            }, '');

            let ops = "";

            if (~its.indexOf(cItem.Item))
                ops = workshopTmp[workshopId].ShiftNameList.reduce((a, b, i) => `${a}<option value="${i + 1}">${b}</option>`, '<option value="0">全天</option>');
            else
                ops = setOptions(shifts, "Type");
            return `${a}<div class="kb_div1" style="height: ${(b.height == -1 ? "auto" : `${b.height}%`)}" col="${b.col}" order="${b.order}" value="${b.val}" display="${cItem.Display}" >
                    <div class="kb_border1">
                        <div class="kb_border3" style="padding: 5px;">
                            <table class="table table-striped no-margin">
                                <thead>
                                    <tr role="row">
                                        <th colspan="${colspan}" class="bg-green" style="padding: 4px; border: 1px solid gray; width: auto;">
                                            ${cItem.Name}
                                            <input class="form-control text-center colSet N_${b.val}" style="width: 50%;display: inline;" value=${b.name} length="30">
                                            <button type="button" class="btn btn-danger btn-xs itemDelBtn" value=${b.val} style="float: right;"><i class="fa fa-minus"></i></button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr role="row" class="odd">
                                        <td style="padding: 4px; border: 1px solid gray;" class="form-inline">
                                            列
                                            <input class="form-control text-center no-padding colSet C_${b.val}" style="width: 40px;" old=${b.col + 1} value=${b.col + 1} oninput="onInput(this, 3, 0, 1, ${col});">
                                        </td>
                                        <td style="padding: 4px; border: 1px solid gray;" class="form-inline">
                                            顺序
                                            <input class="form-control text-center no-padding colSet O_${b.val}" readonly="readonly" style="width: 40px;" old=${b.order + 1} value=${b.order + 1} oninput="onInput(this, 3, 0, 1);">
                                        </td>
                                        <td style="padding: 4px; border: 1px solid gray;" class="form-inline">
                                            排序
                                            <select class="form-control colSet DF_${b.val}" value=${(b.dField ? b.dField : "")} style="width: auto;">
                                                ${setOptionsWithKey(sFieldList, "Field", "Column")}
                                            </select>
                                            <select class="form-control colSet DO_${b.val}" value=${(b.dOrder ? b.dOrder : 0)} style="width: auto;">
                                                <option value="0">正序</option>
                                                <option value="1">倒序</option>
                                            </select>
                                        </td>
                                        <td style="padding: 4px; border: 1px solid gray;" class="form-inline">
                                            高度
                                            <input class="form-control text-center no-padding colSet H_${b.val}" style="width: 40px;" value="${(b.height == -1 ? "" : b.height)}" oninput="onInput(this, 3, 0, 0, 100);">%
                                        </td>
                                        <td style="padding: 4px; border: 1px solid gray;" class="form-inline ${tdShow}">
                                            <span class="glyphicon glyphicon-arrow-up pointer text-green${(i == 0 ? " hidden" : "")} upTr" aria-hidden="true" title="上移"></span>
                                            <span class="glyphicon glyphicon-arrow-down pointer text-red${((i + 1) == oMax ? " hidden" : "")} downTr" aria-hidden="true" title="下移"></span>
                                        </td>
                                    </tr>
                                        ${(!item[0].BShifts && !item[0].BDuration ? "" :
                    `<tr role="row" style="background-color: #f9f9f9;">
                                        <td style="padding: 4px; border: 1px solid gray;" class="form-inline" colspan="${colspan}" >
                                            <div class="form-group form-inline">
                                            ${(!item[0].BShifts ? "" :
                        `<label class="control-label">班制</label>
                                                <select class="form-control colSet Shift_${b.val}" value=${shift}>${ops}</select>`)}
                                            ${(!item[0].BDuration ? "" :
                        (~its.indexOf(cItem.Item) ?
                            `<label class="control-label">时间类型</label>
                                                <select class="form-control colSet Time_${b.val}" value=${timeType}>${timeOptions}</select>
                                                <label class="control-label">时间范围</label>
                                                <div class="input-group">
                                                    <input class="form-control text-center colSet Range_${b.val}" style="width: 70px;" value=${range} oninput="onInput(this, 3, 0, 0, 24);">
                                                    <div class="input-group-addon">${timeTypes[timeType]}</div>
                                                </div>
                                                ${groupItems}` :
                            `<label class="control-label">显示最近</label>
                                                <input class="form-control text-center colSet Hour_${b.val}" style="width: 70px;" value=${(itemSet.length ? sItem.Hour : 24)} oninput="onInput(this, 3, 0, 0, 24);">
                                                <label class="control-label">小时</label>
                                                <input class="form-control text-center colSet Min_${b.val}" style="width: 70px;" value=${(itemSet.length ? sItem.Min : 0)} oninput="onTimeLimitInput(this);">
                                                <label class="control-label">分</label>`))}
                                            </div>
                                        </td>
                                    </tr>`)}
                                </tbody>
                            </table>
                            <br>
                            ${(!sFieldList.length ? `` :
                    `<table class="table table-striped no-margin">
                                <thead>
                                    <tr role="row">
                                        <th colspan="9" class="bg-gray" style="padding: 4px; border: 1px solid gray; width: auto;">
                                            列配置
                                        </th>
                                    </tr>
                                    <tr role="row" style="background-color: #f9f9f9;">
                                        <th style="padding: 4px; border: 1px solid gray; width: 80px;">
                                            选择
                                        </th>
                                        <th style="padding: 4px; border: 1px solid gray; width: 80px;">
                                            序号
                                        </th>
                                        <th style="padding: 4px; border: 1px solid gray; width: auto;">
                                            列名
                                        </th>
                                        ${(cItem.Display == 1 ? `` :
                        `<th style="padding: 4px; border: 1px solid gray; width: auto;">
                                            自定义及颜色
                                        </th>
                                        <th style="padding: 4px; border: 1px solid gray; width: auto;">
                                            列宽(px)
                                        </th>
                                        <th style="padding: 4px; border: 1px solid gray; width: auto;">
                                            处理
                                        </th>
                                        <th style="padding: 4px; border: 1px solid gray; width: auto;">
                                            前缀
                                        </th>
                                        <th style="padding: 4px; border: 1px solid gray; width: auto;">
                                            后缀
                                        </th>
                                        <th style="padding: 4px; border: 1px solid gray; width: auto;">
                                            顺序
                                        </th>`)}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${fields}
                                </tbody>
                            </table>`)}
                        </div>
                    </div>
                </div>`;
        }, '');

        return `${a}<div class="kb_item_pre_div3" style="width: ${d.width}%; overflow-y: auto;">
                    ${chose}
                 </div>`;
    }, '');

    $("#kanBanProductDetail").html(ops).find("select").each((_, el) => {
        var id = $(el).attr("value");
        if ($(el).hasClass("ms2m")) {
            if (~id.indexOf(",")) {
                $(el).select2({
                    allowClear: true,
                    placeholder: '请选择',
                    multiple: true,
                    width: '55%',
                    matcher,
                });
                id = id.split(",");
            } else {
                $(el).select2({
                    matcher,
                    width: '120px',
                });
            }
            $(el).val(id).trigger("change");
        } else if ($(el).hasClass("ms2")) {
            $(el).select2({
                allowClear: true,
                placeholder: '请选择',
                multiple: true,
                width: '55%',
            });
            var vs = "";
            if (!isStrEmptyOrUndefined(id))
                vs = id.split(",");

            $(el).val(vs).trigger("change");
        } else
            $(el).val(id);
    }).end().find(".icb_minimal").each((_, el) => {
        var st = $(el).attr("value");
        $(el).iCheck({
            handle: 'checkbox',
            checkboxClass: 'icheckbox_minimal-red',
            increaseArea: '20%'
        }).iCheck(st == 1 ? "check" : "unckeck");
    }).end().find(".kb_border3").each((_, el) => {
        const ekb = $(el).closest(".kb_div1");
        const id = $(ekb).attr("value") >> 0;
        const col = ($(ekb).find(`.C_${id}`).val() >> 0) - 1;
        const order = ($(ekb).find(`.O_${id}`).val() >> 0) - 1;
        const dOrder = colSet[col].chose[order].dOrder ? colSet[col].chose[order].dOrder : 0;
        const dField = colSet[col].chose[order].dField ? colSet[col].chose[order].dField : "";
        $(el).find(`.DO_${id}`).val(dOrder);
        $(el).find(`.DF_${id}`).val(dField);

        var d = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
        kanBanItemsTmp.forEach((dt, i) => {
            if (dt == d[0]) {
                dt.Top && $(el).scrollTop(dt.Top);
                dt.Left && $(el).scrollLeft(dt.Left);
                dt.FieldList.forEach((field, i) => {
                    const color = field.Color ? field.Color : defColor;
                    $(ekb).find(`.Color_${i}`).colorpicker({
                        allowEmpty: true,//允许为空,显示清楚颜色按钮    
                        color,//初始化颜色
                        format: 'rgb'
                    })
                    $(ekb).find(`.CClear_${i}`).on("click", function () {
                        $(this).siblings(`.Color_${i}`).colorpicker('setValue', "");
                    })
                });
            }
        });

        //div滚动至当前位置
        $(el).scroll(e => {
            const ell = $(e.target).closest(".kb_div1");
            const id = $(ell).attr("value") >> 0;
            const col = ($(ell).find(`.C_${id}`).val() >> 0) - 1;
            const order = ($(ell).find(`.O_${id}`).val() >> 0) - 1;

            var top = $(e.target).scrollTop();
            var left = $(e.target).scrollLeft();
            var d = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
            kanBanItemsTmp.forEach(dt => {
                if (dt == d[0]) {
                    dt.Top = top;
                    dt.Left = left;
                }
            })
        })
    }).end().find(".mColorpicker").on('changeColor', function (event) {
        //$(this).siblings('input').css("color", event.color.toHex());
        var color = event.color.toHex();
        if (color == "#ffffff")
            return;
        if (color == "#aN")
            color = "";
        $(this).siblings('input').css("color", color);

        const el = $(this).closest(".kb_div1");
        const id = $(el).attr("value") >> 0;
        const col = ($(el).find(`.C_${id}`).val() >> 0) - 1;
        const order = ($(el).find(`.O_${id}`).val() >> 0) - 1;

        const tr = $(this).closest("tr");
        const trXvHao = $(tr).attr("value") >> 0;
        var d = kanBanItemsTmp.filter(x => x.Col == col && x.Order == order);
        kanBanItemsTmp.forEach(dt => {
            if (dt == d[0]) {
                dt.FieldList.forEach((f, i) => {
                    if (f.XvHao == trXvHao) {
                        f.Color = color;
                    }
                })
            }
        })
    });
}

//显示处理逻辑
function showFunc(el, column, func, col, order, pxh) {
    const sFunc = $(el).attr("value") ? $(el).attr("value") : "[]";
    const sObj = JSON.parse(unescape(sFunc));
    $('#showFuncModal .modal-title').text(`${column}-逻辑处理`).attr("func", func).attr("c", col).attr("o", order).attr("pxh", pxh);
    var sf = sObj.special ? sObj.special : "";
    $('#showFunc').html(setFieldOptions(func)).val("");
    $('#showFunc').val(sf);
    var sb = sObj.bold ? sObj.bold : 0;
    $('#boldFunc').val(sb);
    var cf = sObj.color ? sObj.color : 0;
    $('#conFunc').empty()
    $('#colorFunc').val(0).off("change").on("change", function () {
        var cfv = $(this).val();
        if (cfv == 2) {
            $('#conFunc').closest(".conDiv").removeClass("hidden");
        } else {
            $('#conFunc').closest(".conDiv").addClass("hidden");
        }
    });
    $('#colorFunc').val(cf).trigger("change");
    if (sObj && sObj.cons && sObj.cons.length) {
        sObj.cons.forEach((con, i) => {
            addConTr();
            const xh = i + 1;
            const tr = $(`#conFunc .ctr_${xh}`);
            $(tr).find(`.con_${xh}`).val(con.con);
            $(tr).find(`.conv_${xh}`).val(con.conv);
            $(tr).find(`.tcolor_${xh}`).val(con.color);
            $(tr).find(`.ccolor_${xh}`).css("background-color", con.color);
        })
    }
    $('#showFuncModal').modal('show');
}

function addConTr() {
    const length = $('#conFunc tr').length;
    const xh = length + 1;
    var tr =
        `<tr class="ctr_${xh}">
            <td class="xh xh_${xh}">
                ${xh}
            </td>
            <td class="form-inline">
                <select class="form-control con_${xh}" style="width: auto;">
                    ${conOptions}
                </select>
                <input type="text" class="form-control text-center conv_${xh}" style="width: auto;">
            </td>
            <td>
                <div class="input-group color_${xh}">
                  <input type="text" class="form-control hidden tcolor_${xh}" style="width: auto;" readonly value="${defColor}">
                  <div class="input-group-addon" style="border-left: 1px solid #ccc;">
                    <i class="ccolor_${xh}" style="background-color: ${defColor};"></i>
                  </div>
                </div>
            </td>
            <td>
                <button type="button" class="btn btn-danger btn-sm" onclick="delConTr(this)"><i class="fa fa-minus"></i></button>
            </td>
        </tr>`;
    $('#conFunc').append(tr)
    $(`#conFunc .color_${xh}`).colorpicker({
        color: defColor,//初始化颜色
        format: 'rgb'
    }).on('changeColor', function (event) {
        //$(this).siblings('input').css("color", event.color.toHex());
        const color = event.color.toHex();
        if (color == "#ffffff")
            return;
        $(this).children("input").val(color);
    })
    const today = getDate();
    const func = $('#showFuncModal .modal-title').attr("func");
    const conv = $(`#conFunc .conv_${xh}`);
    if (func === "int") {
        $(conv).on('input', function () {
            onInput(this, 8, 0);
        });
    } else if (func === "decimal") {
        $(conv).on('input', function () {
            onInput(this, 8, 4);
        });
    } else if (func === "datetime") {
        $(conv).addClass("form_date").val(today);
        initDayTime($(conv).closest("td"))
    } else if (func === "date") {
        $(conv).addClass("form_date");
        initDayTime($(conv).closest("td"))
    }
}

function delConTr(el) {
    const tr = $(el).closest("tr")
    tr && tr.remove();
    const trs = $('#conFunc tr');
    trs.each((i, tr) => {
        $(tr).find(`.xh`).text(i + 1);
    })
}

function saveCons(close = false) {
    var ds = [];
    const special = $("#showFunc").val();
    const bold = $("#boldFunc").val() >> 0;
    const color = $("#colorFunc").val() >> 0;
    if (color) {
        const trs = $('#conFunc tr');
        if (!trs.length)
            return void layer.msg("缺少条件配置!");
        trs.each((i, tr) => {
            const xh = i + 1;
            const con = $(tr).find(`.con_${xh}`).val() >> 0;
            const conv = $(tr).find(`.conv_${xh}`).val();
            const color = $(tr).find(`.tcolor_${xh}`).val();
            ds.push({
                xh,
                con,
                conv,
                color,
            })
        })
    }
    const d = JSON.stringify({
        special,
        bold,
        color,
        cons: ds
    })
    const c = $('#showFuncModal .modal-title').attr("c") >> 0;
    const o = $('#showFuncModal .modal-title').attr("o") >> 0;
    const pxh = $('#showFuncModal .modal-title').attr("pxh") >> 0;
    $(`#kanBanProductDetail .kb_div1[col=${c}][order=${o}] .Func_${pxh}`).attr("value", d);
    var dd = kanBanItemsTmp.filter(x => x.Col == c && x.Order == o);
    kanBanItemsTmp.forEach(dt => {
        if (dt == dd[0]) {
            dt.FieldList.forEach((f, i) => {
                if (f.XvHao == pxh) {
                    f.Func = d;
                }
            })
        }
    })
    close && $('#showFuncModal').modal('hide');
}

var workshopId = 0;
var workshopTmp = [];
//获取车间
function getWorkshop(resolve) {
    ajaxPost('/Relay/Post', {
        opType: 162
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        workshopTmp = ret.datas.sort(firstBy("Id"));
        workshopId = ret.datas.length ? workshopTmp[0].Id : 0;
        resolve && resolve(workshopTmp);
    }, 0);
}

var stepTmp = [];
//获取工序
function getStep(resolve) {
    ajaxPost('/Relay/Post', {
        opType: 150,
        opData: JSON.stringify({
            wId: workshopId,
            menu: true
        })
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        stepTmp = ret.datas;
        resolve && resolve(stepTmp);
    }, 0);
}

var processorTmp = [];
//获取计划号
function getProduction(resolve) {
    ajaxPost('/Relay/Post', {
        opType: 215,
        opData: JSON.stringify({
            wId: workshopId,
            menu: true
        })
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        productionTmp = ret.datas;
        resolve && resolve(productionTmp);
    }, 0);
}

var deviceTmp = [];
//获取机台号
function getDevice(resolve) {
    if (!_permissionList[676].have)
        return;
    var data = {
        opType: 100,
        opData: JSON.stringify({
            wId: workshopId,
            script: true,
            detail: false,
            //other: true,
            //state: false
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

var processorTmp = [];
//获取操作工
function getProcessor(resolve) {
    ajaxPost('/Relay/Post', {
        opType: 248,
        opData: JSON.stringify({
            wId: workshopId,
            menu: true
        })
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        processorTmp = ret.datas;
        resolve && resolve(processorTmp);
    }, 0);
}
var _carouselBox;
//获取看板列表
function getKanBanList(resolve) {
    //return;
    ajaxPost('/Relay/Post', {
        opType: 509,
        opData: JSON.stringify({
            wId: workshopId,
            init: true
        })
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
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
        //设备状态div
        const state =
            `<div class="kb_div1">
                <div class="kb_border1">
                <div class="kb_border2">
                <div class="form-group no-margin ttDiv">
                    <label class="control-label textOverTop no-margin middle kb_time1">时间信息：<span id="{0}_time"></span></label>
                    <h3 class="text-bold kb_title1" style="color: cyan; padding: 10px;">监控平台</h3>
                    <span class="glyphicon glyphicon-fullscreen pointer kb_fullscreen1 fullScreenBtn {1}" target="{0}" title="全屏放大" aria-hidden="true"></span>
                    <div class="form-group no-margin mPadding">
                        <label class="control-label text-bold no-margin bg-green mPadding text-center" style="width: 15%; font-size: 17px;">
                            加工：<label class="control-label no-margin" id="{0}_jg" style="font-size: 17px;">0</label>
                        </label>
                        <label class="control-label text-bold no-margin mPadding text-center" style="width: 15%; font-size: 17px; background: #ffd400; color:white;">
                            准备：<label class="control-label no-margin" id="{0}_zb" style="font-size: 17px;">0</label>
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

        const product =
            `<div class="form-group no-margin">
                        <div class="form-group text-center no-margin">
                <label class="control-label textOverTop no-margin middle kb_time1" style="transform: translateY(-50%);">时间信息：<span id="{0}_time"></span></label>
                <h3 class="text-bold kb_title1" style="color: cyan; padding: 10px;">{1}</h3>
                <span class="glyphicon glyphicon-fullscreen pointer kb_fullscreen2 fullScreenBtn {2}" target="{0}" title="全屏放大" aria-hidden="true"></span>
                        </div>
                <div class="box box-primary kb_body no-border-top no-margin">
                    <div class="box-body kb_item_pre_div2" id="{0}_productDiv">{3}
                    </div>
                </div>
            </div>`;

        //异常报警 = 1,异常统计 = 2,设备状态反馈 = 3,设备预警状态 = 4,
        //计划号日进度表 = 5,设备日进度表 = 6,操作工日进度表 = 7

        var defaultItem =
            `<div class="kb_div1" style="height: {2}" val="{3}">
                <div class="kb_border1">
                    <div class="kb_border2">
                        <div class="form-group text-center no-margin" style="">
                            <h4 class="text-bold kb_title2"><span class="tt1">{1}</span><span class="tt2"></span></h4>
                        </div>
                        <div class="table-responsive mailbox-messages no-margin" style="width:100%">
                            {0}
                        </div>
                    </div>
                </div>
            </div>`;

        var tabOp = `<div class="tab-pane {2} {3}" id="{0}">{1}</div>`;
        const carouselOp = `<div class="item kb_body" id="{0}">{1}<div class="carousel-caption text-primary"><h3 class="text-primary isShow hidden">{2}</h3></div></div>`;
        let firstNav = !_permissionList[676].have;
        //rData.sort((a, b) => a.Order - b.Order);

        var type = $('#kanBanType').val();
        $('#kanBanType').html(setOptions(ret.menu, "Type", true));
        type ? $('#kanBanType').val(type) : $('#kanBanType').trigger("change");
        type = $('#kanBanType').val();

        const id = $('#kanBanList').val() >> 0;
        const opData = rData.filter(x => x.Type == type && x.Id != 0);
        let j = 0;
        const ops = opData.reduce((a, d, i) => d.Id !== 0 && d.Type == type ? `${a}<option value=${d.Id}>${++j}-${d.Name}</option>` : "", "");
        $('#kanBanList').html(ops);
        if (id) $('#kanBanList').val(id);
        else if (opData.length > 0) {
            const d = opData[0];
            $('#kanBanList').val(d.Id);
        }

        for (var itemG in ret.item) {
            kanBanItems[itemG] = [];
            ret.item[itemG].forEach(k => {
                kanBanItems[itemG][k.Item] = k;
            })
        }
        shifts = ret.shift;

        var cops = '', lis = '', tabs = '', cOp = '';
        carouselTmp = [];
        var carouselIndex = 0;
        for (let i = 0; i < len; i++) {
            const d = rData[i];
            kanBans[d.Id] = d;
            const color = $('#kanBanType').find(`[value=${d.Type}]`).css("color");
            cops += `<div class="flexStyle pointer choseBox mPadding">
                        <label class="flexStyle pointer">
                            <input type="checkbox" class="icb_minimal" value=${d.Id}>
                            <span style="margin-left: 5px">${d.Name}</span>
                        </label>
                    </div>`;
            if (d.IsShow) {
                var liSt = (firstNav && i == 0) ? ' class="active"' : '';
                var flag = `kanBan_${d.Id}`;
                //lis += `<li${liSt}><a href="#${flag}" class="kanBan" data-toggle="tab" aria-expanded="false" style="${(i % 2 === 1 ? "border-color: red;" : "")}${(color ? `color: ${color};`:"")}">${d.Name}(${d.Order})</a></li>`;
                lis += `<li${liSt}><a href="#${flag}" class="kanBan text-bold" data-toggle="tab" aria-expanded="false" style="${(color ? `color: ${color};` : "")}">${d.Name}(${d.Order})</a></li>`;
                const cFlag = `carousel_${flag}`;
                var tabSt = (firstNav && i == 0) ? " active" : " fade in";
                switch (d.Type) {
                    case 1:
                        tabs += tabOp.format(flag, op.format(flag, ""), "", tabSt);
                        cOp = carouselOp.format(cFlag, op.format(cFlag, "hidden"), d.Name);
                        break;
                    case 2:
                        tabs += tabOp.format(flag, state.format(flag, ""), "kb_body", tabSt);
                        cOp = carouselOp.format(cFlag, state.format(cFlag, "hidden"), d.Name);
                        break;
                    case 3:
                        !d.ColSet && (d.ColSet = "[]");
                        var colSet = JSON.parse(d.ColSet);
                        const sItemList = [];
                        d.ItemList && d.ItemList.forEach(il => {
                            sItemList[il.Item] = il;
                        })
                        function pItems(ff) {
                            return colSet.reduce((a, cs, i) => {
                                var chose = cs.chose.reduce((a, b, i) => {
                                    var pItem = "";
                                    const el = sItemList[b.val];
                                    if (el) {
                                        const fieldList = el.FieldList ? el.FieldList.filter(x => x.Order) : [];
                                        const itemConfig = kanBanItems[d.Type][b.val];
                                        if (itemConfig.Display == 0) {
                                            pItem = defaultItem.format(
                                                getTableW(`${ff}_${b.col}_${b.order}`, fieldList, 3),
                                                //getTable(`${ff}_${el.div}`, el.cols.map(d => d.title), 3),
                                                b.name ? b.name : itemConfig.Name, b.height == -1 ? "auto" : `${b.height}%`, b.val);
                                        } else if (itemConfig.Display == 1) {
                                            pItem = defaultItem.format(
                                                getChartW(`${ff}_${b.col}_${b.order}`, fieldList, 3),
                                                //getTable(`${ff}_${el.div}`, el.cols.map(d => d.title), 3),
                                                b.name ? b.name : itemConfig.Name, b.height == -1 ? "auto" : `${b.height}%`, b.val);
                                        }
                                    }
                                    return a + pItem;
                                }, '');
                                return `${a}<div class="" style="width: ${cs.width}%; height: 100%;">
                                            ${chose}
                                        </div>`;
                            }, '');
                        }

                        tabs += tabOp.format(flag, product.format(flag, d.Name, "", pItems(flag)), "kb_body", tabSt);
                        cOp = carouselOp.format(cFlag, product.format(cFlag, d.Name, "hidden", pItems(cFlag)), d.Name);
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
        //return;
        $('#carouselDiv').empty().append(cops).find(`.icb_minimal`).iCheck({
            handle: 'checkbox',
            checkboxClass: 'icheckbox_minimal-green',
            increaseArea: '20%'
        }).on('ifChanged', function () {
            const id = $(this).val();
            if ($(this).is(':checked')) {
                carouselChose.push({ id, Order: kanBans[id].Order });
            } else {
                removeArray(carouselChose, "id", id);
            }
            carouselChose.sort(sortOrder);
        });

        $('#firstNavLi').nextAll().remove().end().after(lis).end();
        firstNav && $('#tabBox a:not(:first)').first().click();
        $('#setKanBan').nextAll().remove().end().after(tabs);
        //todo
        //$('#kanBanType').val(3).trigger("change");
        //$('#kanBanList').val(16).trigger("select2:select");
        rData = rData.filter(d => d.Id !== 0);
        //$('[href="#kanBan_6"]').click();
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
    const cCol = $('#kanBanContentCol').val() >> 0;
    const cColName = Array.from($('#kanBanItemColName .kb_item_col2').map((_, a) => (a.value)));
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
        ContentCol: cCol,
        ColName: "",
        ColSet: "[]",
        Variables: "[]",
        Items: "[]",
    };
    if (type == 2) {
        list.ColName = cColName.join();
        const maxSet = getMaxSet(cCol);
        list.Variables = JSON.stringify(vs.filter(x => x.Order <= maxSet));
    }
    else if (type == 3) {
        //kanBanItemsTmp.forEach(d => {
        //    d = getFieldList(d);
        //    d.
        //});
        for (var k in kanBanItemsTmp) {
            const t = kanBanItemsTmp[k];
            if (!t.FieldList || !t.FieldList.length || !t.FieldList.filter(x => x.Order).length) {
                return void layer.msg('请选择列');
            }
        }
        list.Items = JSON.stringify(kanBanItemsTmp);
        list.ColSet = JSON.stringify(colSet);
    }

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
            pTableOrChart = [];
            getKanBanList();
        }
    });
}

function getFieldList(obj) {
    var f = "[]";
    if (obj.FieldList && obj.FieldList.length) {
        obj.FieldList.forEach(d => getFieldList(d));
        f = JSON.stringify(obj.FieldList);
    }
    obj.Fields = f;
    return obj;
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

function getMaxSet(col) {
    return col == 2 ? 6 : ((col - 3) * 5 + 10);
}

function getFirstOrders(col) {
    if (col > 2) {
        const tCol = col - 1;
        const maxSet = getMaxSet(col);
        const cRow = Math.floor(maxSet / tCol);
        var inds = [];
        for (var i = 0; i < cRow; i++) {
            var ind = 1 + tCol * i;
            inds.push(ind);
        }
    }
    return inds;
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
                    <h4>
                        <lable class="text-red text-bold">已选:<lable class="text-blue text-bold chosed"></lable></lable>
                    </h4>
                </div>
                <div class="box-body">
                    <div class="nav-tabs-custom">
                        <ul class="nav nav-tabs ui-sortable-handle">
                            <li class="active"><a href="#{0}_kanBanDeviceDataDiv" data-toggle="tab" aria-expanded="true">设备数据</a></li>
                            <li><a href="#{0}_kanBanProductDataDiv" data-toggle="tab" aria-expanded="true">生产数据</a></li>
                            <li><a href="#{0}_kanBanPreDiv" data-toggle="tab" aria-expanded="true">内容预览</a></li>
                        </ul>
                        <div class="tab-content no-padding" style="position: relative">
                            <div class="tab-pane active" id="{0}_kanBanDeviceDataDiv">
                                <div class="form-group">
                                    <div class="col-md-4">
                                        <label class="control-label">变量：</label>
                                        <div class="flexStyle" style="justify-content: flex-end">
                                            <select class="form-control thText" style="max-width: 80px" onchange="dataTableSearch.call(this, '{4}')">
                                                <option value="1">名称</option>
                                                <option value="2">地址</option>
                                                <option value="0">序号</option>
                                            </select>
                                            <select class="form-control sym" style="max-width: 100px" onchange="dataTableSearch.call(this, '{4}')">
                                                <option value="2">包含</option>
                                                <option value="0">等于</option>
                                                <option value="1">不等于</option>
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
                                                <option value="1">名称</option>
                                                <option value="2">地址</option>
                                                <option value="0">序号</option>
                                            </select>
                                            <select class="form-control sym" style="max-width: 100px" onchange="dataTableSearch.call(this, '{5}')">
                                                <option value="2">包含</option>
                                                <option value="0">等于</option>
                                                <option value="1">不等于</option>
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
                                                <option value="1">名称</option>
                                                <option value="2">地址</option>
                                                <option value="0">序号</option>
                                            </select>
                                            <select class="form-control sym" style="max-width: 100px" onchange="dataTableSearch.call(this, '{6}')">
                                                <option value="2">包含</option>
                                                <option value="0">等于</option>
                                                <option value="1">不等于</option>
                                            </select>
                                            <input type="text" class="form-control val" placeholder="搜索" style="max-width: 150px" oninput="dataTableSearch.call(this, '{6}')">
                                        </div>
                                        <div class="table-responsive mailbox-messages">
                                            <table class="table table-hover table-striped table-condensed" id="{6}"></table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="tab-pane fade in" id="{0}_kanBanProductDataDiv">
                                <div class="table-responsive mailbox-messages">
                                    <table class="table table-hover table-striped table-condensed" id="{7}"></table>
                                </div>
                            </div>
                            <div class="tab-pane fade in" id="{0}_kanBanPreDiv">
                                <div class="kb_device_div1" id="{0}_kanBanContentPre">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        const id = $('#kanBanList').val();
        const kanBan = kanBans[id];
        const rData = ret.datas;
        //1 变量
        //2 输入
        //3 输出
        scriptIndexTmp.forEach(sid => {
            if (scriptTmp[sid]) {
                const sc = scriptTmp[sid];
                const scName = sc.sName;
                let codes = SortNumberString(sc.ds, "code").map(d => d.code).join();
                let sCodes = `${(codes.length > tdShowLengthLong ? `${codes.substring(0, tdShowLengthLong)}...` : codes)}`;
                var vals = rData.filter(d => d.ScriptId == sid && d.VariableTypeId == 1);
                var ins = rData.filter(d => d.ScriptId == sid && d.VariableTypeId == 2);
                var outs = rData.filter(d => d.ScriptId == sid && d.VariableTypeId == 3);
                var products = kanBanItems[kanBan.Type] ? Object.values(kanBanItems[kanBan.Type]) : [];
                sc.divVal = `valList_${sid}`;
                sc.divIn = `insList_${sid}`;
                sc.divOut = `outList_${sid}`;
                sc.divProduct = `productList_${sid}`;

                const data1 = `${sc.divVal}Data`;
                const data2 = `${sc.divIn}Data`;
                const data3 = `${sc.divOut}Data`;
                const data4 = `${sc.divProduct}Data`;
                const divArray = [sc.divVal, sc.divIn, sc.divOut, sc.divProduct];
                const dataArray = [data1, data2, data3, data4];
                if (!sc.div) {
                    sc.div = `sc_${sid}`;
                    sc[`${sc.divVal}Trs`] = [];
                    sc[`${sc.divIn}Trs`] = [];
                    sc[`${sc.divOut}Trs`] = [];
                    sc[`${sc.divProduct}Trs`] = [];

                    sc[`${sc.divVal}Data`] = [];
                    sc[`${sc.divIn}Data`] = [];
                    sc[`${sc.divOut}Data`] = [];
                    sc[`${sc.divProduct}Data`] = [];
                    //codes = codes.repeat(5);
                    $('#kanBanScript').append(div.format(sc.div, scName, codes, sCodes, sc.divVal, sc.divIn, sc.divOut, sc.divProduct));

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
                                const type = 0;
                                var t = kanBan.VariableList.filter(v => v.Type == type && v.ScriptId == d.ScriptId &&
                                    v.VariableTypeId == d.VariableTypeId &&
                                    v.PointerAddress == d.PointerAddress);
                                var v = t.length > 0 ? t[0].VariableName : "";
                                return tableSet.emptyInput("name no-padding", v);
                            }

                        },
                        {
                            data: null,
                            title: '显示顺序',
                            render: d => {
                                const type = 0;
                                var t = kanBan.VariableList.filter(v => v.Type == type && v.ScriptId == d.ScriptId &&
                                    v.VariableTypeId == d.VariableTypeId &&
                                    v.PointerAddress == d.PointerAddress);
                                var v = t.length > 0 && t[0].Order > 0 ? t[0].Order : "1";
                                return tableSet.numberInput("order", `50px,5,2,1,99999,0`, v);
                            }
                        },
                        {
                            data: null,
                            title: '子顺序',
                            render: d => {
                                const type = 0;
                                var t = kanBan.VariableList.filter(v => v.Type == type && v.ScriptId == d.ScriptId &&
                                    v.VariableTypeId == d.VariableTypeId &&
                                    v.PointerAddress == d.PointerAddress);
                                var v = t.length > 0 && t[0].SubOrder > 0 ? t[0].SubOrder : "1";
                                return tableSet.numberInput("subOrder", `50px,5,2,1,99999,0`, v);
                            }
                        },
                        {
                            data: null,
                            title: '分隔符',
                            render: d => {
                                const type = 0;
                                var t = kanBan.VariableList.filter(v => v.Type == type && v.ScriptId == d.ScriptId &&
                                    v.VariableTypeId == d.VariableTypeId &&
                                    v.PointerAddress == d.PointerAddress);
                                var v = t.length > 0 && !isStrEmptyOrUndefined(t[0].Delimiter) ? t[0].Delimiter : "";
                                return tableSet.emptyInput("delimiter no-padding", `30,30`, v);
                            }
                        }
                    ]);

                    //变量
                    tableConfig.updateData(vals);
                    tableConfig.drawCallback = function () {
                        const trs = `${sc.divVal}Trs`;
                        const data = data1;
                        const type = 0;
                        initCheckboxAddEvent.call(this, sc[trs],
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                const so = $(tr).find(".subOrder").val() >> 0;
                                const de = $(tr).find(".delimiter").val();
                                sc[data].push({
                                    Type: type,
                                    Id: d.Id,
                                    ScriptId: sid,
                                    VariableTypeId: 1,
                                    PointerAddress: d.PointerAddress,
                                    VariableName: v ? v : "",
                                    VName: d.VariableName,
                                    Order: o ? o : 1,
                                    SubOrder: so ? so : 1,
                                    Delimiter: de ? de : ""
                                });
                            },
                            (tr, d) => {
                                removeArray(sc[data], "Id", d.Id, "Type", type);
                            },
                            false, "Checked");

                        initInputChangeEvent.call(this,
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                const so = $(tr).find(".subOrder").val() >> 0;
                                const de = $(tr).find(".delimiter").val();
                                sc[data].length > 0 &&
                                    sc[data].every(vv => {
                                        if (vv.Id == d.Id && vv.Type == type) {
                                            vv.VariableName = v;
                                            vv.Order = o;
                                            vv.SubOrder = so;
                                            vv.Delimiter = de;
                                            return false;
                                        }
                                        return true;
                                    });
                                updateChoseTitle(sc, dataArray);
                            });
                    }
                    tableConfig.createdRow = function (tr, d) {
                        var t = false;
                        const type = 0;
                        kanBan.VariableList.every(v => {
                            if (v.Type == type &&
                                d.ScriptId == v.ScriptId &&
                                d.VariableTypeId == v.VariableTypeId &&
                                d.PointerAddress == v.PointerAddress) {
                                t = true;
                                sc[data1].push({
                                    Type: type,
                                    Id: d.Id,
                                    ScriptId: sid,
                                    VariableTypeId: 1,
                                    VariableName: v.VariableName,
                                    VName: d.VariableName,
                                    PointerAddress: d.PointerAddress,
                                    Order: v.Order,
                                    SubOrder: v.SubOrder,
                                    Delimiter: v.Delimiter
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
                        const type = 0;
                        initCheckboxAddEvent.call(this, sc[trs],
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                const so = $(tr).find(".subOrder").val() >> 0;
                                const de = $(tr).find(".delimiter").val();
                                sc[data].push({
                                    Type: type,
                                    Id: d.Id,
                                    ScriptId: sid,
                                    VariableTypeId: 2,
                                    PointerAddress: d.PointerAddress,
                                    VariableName: v ? v : "",
                                    VName: d.VariableName,
                                    Order: o ? o : 1,
                                    SubOrder: so ? so : 1,
                                    Delimiter: de ? de : ""
                                });
                            },
                            (tr, d) => {
                                removeArray(sc[data], "Id", d.Id, "Type", type);
                            },
                            false, "Checked");

                        initInputChangeEvent.call(this,
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                const so = $(tr).find(".subOrder").val() >> 0;
                                const de = $(tr).find(".delimiter").val();
                                sc[data].length > 0 &&
                                    sc[data].every(vv => {
                                        if (vv.Id == d.Id && vv.Type == type) {
                                            vv.VariableName = v;
                                            vv.Order = o;
                                            vv.SubOrder = so;
                                            vv.Delimiter = de;
                                            return false;
                                        }
                                        return true;
                                    });
                                updateChoseTitle(sc, dataArray);
                            });
                    }
                    tableConfig.createdRow = function (tr, d) {
                        var t = false;
                        const type = 0;
                        kanBan.VariableList.every(v => {
                            if (v.Type == type &&
                                d.ScriptId == v.ScriptId &&
                                d.VariableTypeId == v.VariableTypeId &&
                                d.PointerAddress == v.PointerAddress) {
                                t = true;
                                sc[data2].push({
                                    Id: d.Id,
                                    ScriptId: sid,
                                    VariableTypeId: 2,
                                    VariableName: v.VariableName,
                                    VName: d.VariableName,
                                    PointerAddress: v.PointerAddress,
                                    Order: v.Order,
                                    SubOrder: v.SubOrder,
                                    Delimiter: v.Delimiter
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
                        const type = 0;
                        initCheckboxAddEvent.call(this, sc[trs],
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                const so = $(tr).find(".subOrder").val() >> 0;
                                const de = $(tr).find(".delimiter").val();
                                sc[data].push({
                                    Type: type,
                                    Id: d.Id,
                                    ScriptId: sid,
                                    VariableTypeId: 3,
                                    PointerAddress: d.PointerAddress,
                                    VariableName: v ? v : "",
                                    VName: d.VariableName,
                                    Order: o ? o : 1,
                                    SubOrder: so ? so : 1,
                                    Delimiter: de ? de : ""
                                });
                            },
                            (tr, d) => {
                                removeArray(sc[data], "Id", d.Id, "Type", type);
                            },
                            false, "Checked");

                        initInputChangeEvent.call(this,
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                const so = $(tr).find(".subOrder").val() >> 0;
                                const de = $(tr).find(".delimiter").val();
                                sc[data].length > 0 &&
                                    sc[data].every(vv => {
                                        if (vv.Id == d.Id && vv.Type == type) {
                                            vv.VariableName = v;
                                            vv.Order = o;
                                            vv.SubOrder = so;
                                            vv.Delimiter = de;
                                            return false;
                                        }
                                        return true;
                                    });
                                updateChoseTitle(sc, dataArray);
                            });
                    }
                    tableConfig.createdRow = function (tr, d) {
                        var t = false;
                        const type = 0;
                        kanBan.VariableList.every(v => {
                            if (v.Type == type &&
                                d.ScriptId == v.ScriptId &&
                                d.VariableTypeId == v.VariableTypeId &&
                                d.PointerAddress == v.PointerAddress) {
                                t = true;
                                sc[data3].push({
                                    Id: d.Id,
                                    ScriptId: sid,
                                    VariableTypeId: 3,
                                    VariableName: v.VariableName,
                                    VName: d.VariableName,
                                    PointerAddress: v.PointerAddress,
                                    Order: v.Order,
                                    SubOrder: v.SubOrder,
                                    Delimiter: v.Delimiter
                                });
                                return false;
                            }
                            return true;
                        });
                        $(tr).find('.isEnable').iCheck((t ? 'check' : 'uncheck'));
                        t && $(tr).find(".textOn").addClass("hidden").siblings(".textIn").removeClass("hidden");
                    }
                    _dataTableData[sc.divOut] = $(`#${sc.divOut}`).DataTable(tableConfig);

                    //生产
                    tableConfig.modifyColumns([
                        { data: 'Type', title: '名称' },
                        {
                            data: null,
                            title: '自定义名称',
                            render: d => {
                                const type = 0;
                                var t = kanBan.VariableList.filter(v => v.Type == type && v.ItemType == d.Id);
                                var v = t.length > 0 ? t[0].Type : "";
                                return tableSet.input("name", v);
                            }
                        },
                        {
                            data: null,
                            title: '显示顺序',
                            render: d => {
                                const type = 0;
                                var t = kanBan.VariableList.filter(v => v.Type == type && v.ItemType == d.Id);
                                var v = t.length > 0 && t[0].Order > 0 ? t[0].Order : "1";
                                return tableSet.numberInput("order", `50px,5,2,1,99999,0`, v);
                            }
                        }
                    ]);
                    tableConfig.updateData(products);
                    tableConfig.drawCallback = function () {
                        const trs = `${sc.divProduct}Trs`;
                        const data = data4;
                        const type = 0;
                        initCheckboxAddEvent.call(this, sc[trs],
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                const so = $(tr).find(".subOrder").val() >> 0;
                                const de = $(tr).find(".delimiter").val();
                                sc[data].push({
                                    Type: type,
                                    Id: d.Id,
                                    ScriptId: sid,
                                    ItemType: d.Id,
                                    VariableName: v ? v : "",
                                    VName: d.Type,
                                    Order: o ? o : 1,
                                    SubOrder: so ? so : 1,
                                    Delimiter: de ? de : ""
                                });
                            },
                            (tr, d) => {
                                removeArray(sc[data], "Id", d.Id, "Type", type);
                            },
                            false, "Checked");

                        initInputChangeEvent.call(this,
                            (tr, d) => {
                                const v = $(tr).find(".name").val();
                                const o = $(tr).find(".order").val() >> 0;
                                const so = $(tr).find(".subOrder").val() >> 0;
                                const de = $(tr).find(".delimiter").val();
                                sc[data].length > 0 &&
                                    sc[data].every(vv => {
                                        if (vv.Id == d.Id && vv.Type == type) {
                                            vv.VariableName = v;
                                            vv.Order = o;
                                            vv.SubOrder = so;
                                            vv.Delimiter = de;
                                            return false;
                                        }
                                        return true;
                                    });
                                updateChoseTitle(sc, dataArray);
                            });
                    }
                    tableConfig.createdRow = function (tr, d) {
                        var t = false;
                        const type = 1;
                        kanBan.VariableList.every(v => {
                            if (v.Type == type &&
                                d.Id == v.Id &&
                                d.ItemType == v.ItemType) {
                                t = true;
                                sc[data3].push({
                                    Type: type,
                                    Id: d.Id,
                                    ScriptId: sid,
                                    ItemType: d.Id,
                                    VariableName: v.VariableName,
                                    VName: d.Type,
                                    Order: v.Order,
                                    SubOrder: v.SubOrder,
                                    Delimiter: v.Delimiter
                                });
                                return false;
                            }
                            return true;
                        });
                        $(tr).find('.isEnable').iCheck((t ? 'check' : 'uncheck'));
                        t && $(tr).find(".textOn").addClass("hidden").siblings(".textIn").removeClass("hidden");
                    }
                    _dataTableData[sc.divProduct] = $(`#${sc.divProduct}`).DataTable(tableConfig);
                } else {
                    $(`#${sc.div}>.box-header .name`).text(scName);
                    $(`#${sc.div}>.box-header .code`).text(codes);
                    $(`#${sc.div} .val`).text("");

                    updateTable(_dataTableData[sc.divVal], vals);
                    updateTable(_dataTableData[sc.divIn], ins);
                    updateTable(_dataTableData[sc.divOut], outs);
                    updateTable(_dataTableData[sc.divProduct], products);
                }
                updateChoseTitle(sc, dataArray);
            }
        });
    }, 0);
}

function changeContentColPre(data, cCol, cName) {
    let ps = "";
    if (cCol == 2) {
        ps = data.reduce((a, b) =>
            `${a}<div class="form-group no-margin" style="height:calc(100%/6);">
                    <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 no-margin text-blue no-padding kb_param1">
                        <label class=" control-label no-margin text-blue no-padding">${b.VName}</label>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 no-margin text-blue no-padding kb_param1">
                        <label class="control-label no-margin text-blue no-padding">${b.V}</label>
                    </div>
                </div>`, '');
    } else if (cCol > 2) {
        const tCol = cCol - 1;
        let content = "";
        if (data.length > 0) {
            const maxSet = Math.max.apply(null, data.map(x => x.Order)) + 1;
            const cRow = Math.floor(maxSet / tCol);
            for (var i = 0; i < cRow; i++) {
                let tds = "";
                var cNameI = tCol * i + 1;
                let n = "";
                var j;
                for (j = 0; j < tCol; j++) {
                    const d = data.filter(x => x.Order == cNameI + j);
                    if (d.length > 0 && !isStrEmptyOrUndefined(d[0].VName)) {
                        n = d[0].VName;
                        tds += `<td><label class="control-label no-margin text-blue no-padding">${n}</label></td>`;
                        break;
                    }
                }
                if (n === "") {
                    tds += `<td><label class="control-label no-margin text-blue no-padding">${n}</label></td>`;
                }
                for (j = 0; j < tCol; j++) {
                    const d = data.filter(x => x.Order == cNameI + j);
                    let v = "";
                    if (d.length > 0) {
                        v = d[0].V;
                    }
                    tds += `<td><label class="control-label no-margin text-blue no-padding">${v}</label></td>`;
                }
                content += `<tr>${tds}</tr>`;
            }
        }
        //${cName.reduce((a, b) => `${a}<th style="width:calc(100%/${cCol})">${b}</th>`, '')}
        ps =
            `<table border="0" cellspacing="0" cellpadding="0" style="width:100%;">
                <thead>
                    <tr>
                        ${cName.reduce((a, b) => `${a}<th style="width:calc(100%/${cCol})"><label class="control-label no-margin no-padding">${b}</label></th>`, '')}
                    </tr>
                </thead>
                    ${content}
                <tbody>
                </tbody>
            </table>`;
    }
    return ps;
}

function getChoseLength(sc, dataArray) {
    return dataArray.reduce((a, b) => a + sc[b].length, 0);
}

function updateChoseTitle(sc, dataArray) {
    const t = dataArray.reduce((a, b, i) => a.concat(sc[b]), []).sort(sortOrder).map(d => `[${d.VName} (<span class="text-orange">${d.Order},${d.SubOrder},${d.Delimiter}</span>)]`);
    $(`#${sc.div} .chosed`).html(t.join());
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

let checkMouseMove;
//全屏轮播
function fullScreenCarousel() {
    //var carousel =
    //    `<div class="box box-primary">
    //        <div class="box-header with-border hidden">
    //            <h3 class="box-title" style="margin-top:8px">看板轮播<span class="ftitle"></span></h3>
    //            <button class="btn btn-primary pull-right" onclick="cancelFullScreenCarousel()">取消轮播</button>
    //        </div>
    //        <div class="box-body">
    //            <div id="carousel-example-generic" class="carousel slide" data-ride="carousel">
    //                <ol class="carousel-indicators isShow hidden">{0}</ol>
    //                <div class="carousel-inner">{1}</div>
    //                <a class="left carousel-control isShow hidden" href="#carousel-example-generic" data-slide="prev">
    //                    <span class="glyphicon glyphicon-chevron-left text-primary" aria-hidden="true"></span>
    //                </a>
    //                <a class="right carousel-control isShow hidden" href="#carousel-example-generic" data-slide="next">
    //                    <span class="glyphicon glyphicon-chevron-right text-primary" aria-hidden="true"></span>
    //                </a>
    //            </div>
    //        </div>
    //    </div>`;
    var carousel =
        `<div class="">
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
            if ($(`#fullScreenCarousel .ftitle`).length)
                $(`#fullScreenCarousel .ftitle`).text(` - ${kanBans[carouselId].Name}`);
            if (carouselFlag == "")
                return;
            setChart(carouselFlag, carouselId, kanBans[carouselId].Type, true);
        }
    })
        .on('mouseenter', () => $('#carousel-example-generic .isShow').removeClass('hidden'))
        .on('mouseleave', () => $('#carousel-example-generic .isShow').addClass('hidden'))
        .on('mousemove', () => {
            $('html').css({ cursor: 'default' });
            checkMouseMove && clearTimeout(checkMouseMove);
            checkMouseMove = setTimeout(function () {
                console.log('hide');
                $('html').css({ cursor: 'none' });
                $('#carousel-example-generic').trigger("mouseleave");
            }, 5000);
        });
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
    kanBanProductItemsEl.forEach(el => {
        for (var key in el) {
            if (~key.indexOf("_timer")) {
                stopScrollTable(el, key, key.replace("_timer", ""));
                //delete el[key];
            }
        }
    })
    checkMouseMove && clearTimeout(checkMouseMove);
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
var tt, tn;
var pTableOrChart = [];
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
        var n = new Date();
        if (!tt) {
            tt = ret.time;
            tn = n;
        }
        if (tt != ret.time) {
            //console.log(dateDiffSec(n, tn), dateDiffSec(ret.time, tt))
            tt = ret.time;
            tn = n;
        }
        if (ret.errno == 0) {
            var t1 = $(`${flag}_time`).text();
            var t2 = ret.time;
            //时间信息
            if (Math.abs(dateDiffSec(t2, t1)) > 60) {
                $(`${flag}_time`).toggleClass(color1);
                $(`${flag}_time`).toggleClass(color2) && ($(`${flag}_time`).removeClass(color2));
            } else {
                $(`${flag}_time`).toggleClass(color2);
                $(`${flag}_time`).hasClass(color1) && ($(`${flag}_time`).removeClass(color1));
            }
        } else {
            !$(`${flag}_time`).hasClass(color1) && ($(`${flag}_time`).addClass(color1));
            $(`${flag}_time`).hasClass(color2) && ($(`${flag}_time`).removeClass(color2));
            run = false;
        }
        rData = ret.data;
        if (type == 1) {
            //设备详情
            if (ret.errno != 0) {
                //layer.msg(ret.errmsg);
                return;
            }
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
            const devOps = pData.reduce((a, b) => `${a}<td class="text-blue">${b.Code}</td>`, '');
            const proOps = pData.reduce((a, b) => `${a}<td>${b.DayTotal}</td>`, '');
            const heGeOps = pData.reduce((a, b) => `${a}<td>${b.DayQualified}</td>`, '');
            const liePianOps = pData.reduce((a, b) => `${a}<td>${b.DayUnqualified}</td>`, '');
            const rateOps = pData.reduce((a, b) => `${a}<td>${b.DayQualifiedRate}%</td>`, '');

            const processedDevice = pData ? pData.filter(x => x.DayTotal > 0).length : 0;
            $(`${flag}_devs`).text(processedDevice);
            $(`${flag}_pros`).text(rData.DayTotal);
            $(`${flag}_heGes`).text(rData.DayQualified);
            $(`${flag}_liePians`).text(rData.DayUnqualified);
            $(`${flag}_rates`).text(`${rData.DayQualifiedRate}%`);
            $(`${flag}_devOps`).find('td:not(:first)').remove().end().append(devOps);
            $(`${flag}_proOps`).find('td:not(:first)').remove().end().append(proOps);
            $(`${flag}_heGeOps`).find('td:not(:first)').remove().end().append(heGeOps);
            $(`${flag}_liePianOps`).find('td:not(:first)').remove().end().append(liePianOps);
            $(`${flag}_rateOps`).find('td:not(:first)').remove().end().append(rateOps);
        } else if (type == 2) {
            //设备状态
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

                function getContentCol(data, cCol, cName) {
                    let ps = "";
                    var i;
                    const tCol = cCol - 1;
                    if (data.length > 0) {
                        const maxSet = Math.max.apply(null, data.map(x => x.Order)) + 1;
                        const cRow = Math.floor(maxSet / tCol);
                        if (cCol == 2) {
                            for (i = 0; i < cRow; i++) {
                                let n = "";
                                const d = data.filter(x => x.Order == i + 1);
                                if (d.length) {
                                    for (var j = 0; j < tCol; j++) {
                                        if (!isStrEmptyOrUndefined(d[j].VName)) {
                                            n = d[j].VName;
                                            break;
                                        }
                                    }
                                    //v = d[0].V;
                                    let bV = false;
                                    const v = d.reduce((a, b, i) => {
                                        !isStrEmptyOrUndefined(b.V) && (bV = true);
                                        return i == 0 ? `${a}${b.V}` : `${a}${(bV ? b.Delimiter : "")}${b.V}`;
                                    }, '');
                                    ps +=
                                        `<div class="form-group no-margin" style="height:calc(100%/6);">
                                            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 no-margin text-blue no-padding kb_param1">
                                                <label class=" control-label no-margin text-blue no-padding">${n}</label>
                                            </div>
                                            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 no-margin text-blue no-padding kb_param1">
                                                <label class="control-label no-margin text-blue no-padding">${v}</label>
                                            </div>
                                        </div>`;
                                }
                            }
                        } else if (cCol > 2) {
                            let content = "";
                            for (i = 0; i < cRow; i++) {
                                let tds = "";
                                var cNameI = tCol * i + 1;
                                let n = "";
                                for (var j = 0; j < tCol; j++) {
                                    const d = data.filter(x => x.Order == cNameI + j);
                                    if (d.length > 0 && !isStrEmptyOrUndefined(d[0].VName)) {
                                        n = d[0].VName;
                                        tds += `<td><label class="control-label no-margin text-blue no-padding">${n}</label></td>`;
                                        break;
                                    }
                                }
                                if (n === "") {
                                    tds += `<td><label class="control-label no-margin text-blue no-padding">${n}</label></td>`;
                                }
                                for (j = 0; j < tCol; j++) {
                                    const d = data.filter(x => x.Order == cNameI + j);
                                    let v = "";
                                    if (d.length > 0) {
                                        //v = d[0].V;
                                        let bV = false;
                                        v = d.reduce((a, b, i) => {
                                            !isStrEmptyOrUndefined(b.V) && (bV = true);
                                            return i == 0 ? `${a}${b.V}` : `${a}${(bV ? b.Delimiter : "")}${b.V}`;
                                        }, '');
                                    }
                                    tds += `<td><label class="control-label no-margin text-blue no-padding">${v}</label></td>`;
                                }
                                content +=
                                    `<tr>
                                    ${tds}
                                </tr>`;
                            }
                            //${cName.reduce((a, b) => `${a}<th style="width:calc(100%/${cCol})">${b}</th>`, '')}
                            ps =
                                `<table border="0" cellspacing="0" cellpadding="0" style="width:100%;">
                                <thead>
                                    <tr>
                                        ${cName.reduce((a, b) => `${a}<th style="width:calc(100%/${cCol})"><label class="control-label no-margin no-padding">${b}</label></th>`, '')}
                                    </tr>
                                </thead>
                                    ${content}
                                <tbody>
                                </tbody>
                            </table>`;
                        }
                    }
                    return ps;
                }

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
                            case '准备中':
                                color = '#ffd400';
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
                        const ps = getContentCol(d.Data, ret.cCol, ret.cName);
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
                $(`${flag}_zb`).text(ret.zb);
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
                    var col = Math.floor(tw / (def + margin));
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
        } else if (type == 3) {
            //加工相关
            if (ret.errno != 0) {
                return;
            }
            //加工相关
            if (!ret.data) {
                return;
            }

            var rData = ret.data;
            var rColSet = ret.colSet ? JSON.parse(ret.colSet) : [];
            var ps = `${flag}_productDiv`;
            var windowH = $(window).height();//获取当前窗口高度
            var tittleHeight = $(`${flag} .kb_title1`).closest('div').height() >> 0;
            $(`${ps}`).css("height", `${windowH - tittleHeight}px`);
            for (var ii = 0, iLen = ret.items.length; ii < iLen; ii++) {
                const itemSet = ret.items[ii];
                const item = itemSet.Item;
                const itemConfig = kanBanItems[type][item];
                const colSet = rColSet[itemSet.Col].chose[itemSet.Order];
                if (!itemSet || !itemConfig || !colSet)
                    continue;

                //配置
                const cFieldList = itemConfig.FieldList ? itemConfig.FieldList : [];
                //配置
                const ccFieldList = [];
                cFieldList.forEach(d => {
                    ccFieldList[d.Field] = d;
                })
                const sFieldList = itemSet.FieldList ? itemSet.FieldList : [];
                const vFieldList = sFieldList.filter(x => x.Order).sort(firstBy("Order"));
                if (vFieldList && vFieldList.length) {
                    const dataKey = `${itemSet.Item}_${itemSet.Col}_${itemSet.Order}`;
                    const tabN = `${flag}_${itemSet.Col}_${itemSet.Order}`;

                    const divHeight = $(`${tabN}`).closest('.kb_border2').height();
                    const titleHeight = $(`${tabN}`).closest('.kb_border2').find('h4').height();
                    const leftHeight = divHeight - titleHeight;
                    //$(`${tabN}`).closest('.kb_border2').find('h4').css("height", `${titleHeight / divHeight}%`);
                    $(`${tabN}`).closest('.table-responsive').css("height", `${Math.floor(leftHeight * 100 / divHeight)}%`);
                    $(`${tabN}`).closest('.kb_border2').find('.tt1').text(colSet.name);

                    if (!rData.hasOwnProperty(dataKey))
                        continue;
                    var dataSource = rData[dataKey];
                    if (itemConfig.Display == 0) {
                        const sWay = colSet.dOrder == "0" ? "asc" : "desc";
                        dataSource = dataSource.sort(firstBy(colSet.dField, sWay));
                        $(`${tabN}`).closest('.kb_border2').find('.tt2').text(`(${dataSource.length})`);
                        addOrderData(dataSource);
                        let trs = $(`${tabN} tbody tr`);
                        //if (dataSource.length == 0) continue;
                        if (!trs.length) {
                            if (dataSource.length) {
                                $(`${tabN} tbody`).html(getItemTrs(dataSource, itemConfig, itemSet, sWay));
                            }
                        } else {
                            const maxTr = $(`${tabN} tr[class='max']`);
                            const maxOrder = $(maxTr).attr("order") >> 0;
                            let remove = false;

                            trs.each((_, tr) => {
                                const tF = $(tr).attr(trFlag);
                                const removeData = dataSource.filter(x => x[trFlag] == tF);
                                if (!removeData.length) {
                                    $(tr).remove();
                                    remove = true;
                                }
                            });
                            if (remove && trs.length > 0) {
                                trs = $(`${tabN} tbody tr`);
                                var tTtrs = [];
                                trs.each((i, tr) => {
                                    var xvhao = $(tr).attr(trFlag) >> 0;
                                    tTtrs[xvhao] = tr;
                                });
                                var tt = Object.values(tTtrs);
                                tt.forEach((tr, i) => {
                                    $(tr).attr("order", i + 1);
                                    $(tr).attr(trFlag, i + 1);
                                    var maxClass = "";
                                    if ((sWay == "asc" && dataSource.length == i + 1) ||
                                        (sWay == "desc" && i == 0)) {
                                        maxClass = `max`;
                                        $(tr).addClass(maxClass);
                                    }
                                });
                            }
                            //if (maxOrder == 0)
                            //    remove = true;
                            //if (remove && trs.length > 0) {
                            //    $(`${tabN} tbody`).html(getItemTrs(dataSource, itemConfig, itemSet, sWay));
                            //    trs = $(`${tabN} tbody tr`);
                            //}
                            if (!remove) {
                                let oldData = [];
                                if (sWay == "asc") {
                                    oldData = dataSource.filter(x => x.XvHao <= maxOrder);
                                } else {
                                    oldData = sliceArray(dataSource, trs.length, 0);
                                }
                                oldData.length && oldData.forEach(od => {
                                    const mTr = $(`${tabN} tr[${trFlag}=${od[trFlag]}]`);
                                    //设置
                                    const xvHao = vFieldList.filter(x => x.Field == "XvHao");
                                    if (!xvHao.length)
                                        vFieldList.unshift({
                                            Order: 0,
                                            Column: "序号",
                                            Field: "XvHao",
                                            Width: "60"
                                        })
                                    for (var i = 0, len = vFieldList.length; i < len; i++) {
                                        const col = vFieldList[i];
                                        var d = od[col.Field];
                                        var pre = col.Pre ? col.Pre : "";
                                        var suffix = col.Suffix ? col.Suffix : "";
                                        var width = col.Width && col.Width !== "auto" ? `width: ${col.Width}px;` : `width: auto;`;
                                        var bold = "";
                                        var color = "";
                                        if (ccFieldList[col.Field] && col.Func) {
                                            const func = JSON.parse(col.Func);
                                            if (func.color == 1)
                                                color = col.Color;
                                            else if (func.color == 2) {
                                                func.cons.every(x => {
                                                    if (meetCondition(d, x.con, x.conv)) {
                                                        color = x.color;
                                                        return false;
                                                    }
                                                    return true;
                                                })
                                            }
                                            if (func.special) {
                                                const dType = ccFieldList[col.Field].DataType;
                                                d = FieldFunc[dType][func.special].func(d);
                                            }
                                            if (func.bold) {
                                                bold = "text-bold";
                                            }
                                        }
                                        color = color ? `color: ${color};` : `color: "";`;

                                        //新值
                                        const tV = `${pre}${d}${suffix}`;
                                        const tO = od.XvHao;
                                        //旧值
                                        const nV = $(mTr.find('td')[i]).text();
                                        const nO = $(mTr).attr("order") >> 0;
                                        if (nV != tV) {
                                            $(mTr.find('td')[i]).html(tV);
                                        }
                                        if (nO != tO) {
                                            $(mTr).attr("order", tO);
                                        }
                                        var hBold = $(mTr.find('td')[i]).hasClass("text-bold");
                                        if (bold && !hBold) {
                                            $(mTr.find('td')[i]).addClass(bold)
                                        } else if (!bold && hBold) {
                                            $(mTr.find('td')[i]).removeClass(bold)
                                        }
                                        $(mTr.find('td')[i]).attr("style", width);
                                        $(mTr.find('td')[i]).attr("style", color);
                                    }
                                });

                                if (dataSource.length > trs.length) {
                                    maxTr.removeClass("max");
                                    let addData = [];
                                    if (sWay == "asc") {
                                        addData = dataSource.filter(x => x.XvHao > maxOrder);
                                    } else {
                                        const tLen = dataSource.length - trs.length;
                                        addData = sliceArray(dataSource, tLen);
                                    }
                                    
                                    const addTrs = getItemTrs(addData, itemConfig, itemSet, sWay);;
                                    if (sWay == "asc") {
                                        maxTr.after(addTrs);
                                    } else {
                                        maxTr.before(addTrs);
                                    }
                                } else if (dataSource.length < trs.length) {
                                    $(`${tabN} tbody`).html(getItemTrs(dataSource, itemConfig, itemSet, sWay));
                                }
                            }
                        }

                        var trHeight = $(`${tabN} tr`).height();
                        var tBodyHeight = leftHeight
                            - $(`${tabN} tbody`).closest('.kb_item_tablebox').css("padding").replace("px", '') * 2;
                        trs = $(`${tabN} tbody tr`);
                        var showTr = Math.floor(tBodyHeight / trHeight);
                        const timer = `${elId}_${itemSet.Col}_${itemSet.Order}_timer`;

                        if (trs.length > showTr && !kanBanProductItemsEl[timer]) {
                            scrollTable(kanBanProductItemsEl, timer, `${elId}_${itemSet.Col}_${itemSet.Order}`);
                        } else if (trs.length <= showTr && kanBanProductItemsEl[timer]) {
                            $(`${tabN} tbody`).html(getItemTrs(dataSource, itemConfig, itemSet, sWay));
                            stopScrollTable(kanBanProductItemsEl, timer, `${elId}_${itemSet.Col}_${itemSet.Order}`);
                        }
                    }
                    else if (itemConfig.Display == 1) {
                        if (!dataSource.length)
                            continue;
                        if (!vFieldList.length)
                            continue;
                        var vField = vFieldList[0];
                        var sType = "";
                        switch (itemConfig.DisplayType) {
                            case 0: sType = "line"; break;
                            case 1: sType = "bar"; break;
                            case 2: sType = "pie"; break;
                        }
                        if (isStrEmptyOrUndefined(sType))
                            continue;
                        var cFields = cFieldList.filter(x => x.Axis == 0);
                        if (!cFields.length)
                            continue;
                        var cField = cFields[0];
                        var field = cField.Field;
                        const sWay = colSet.dOrder == "0" ? "asc" : "desc";
                        dataSource = dataSource.sort(firstBy(colSet.dField, sWay));

                        var sFields = sFieldList.filter(x => x.Field == field);
                        if (!sFields.length)
                            continue;
                        var sField = sFields[0];
                        var func = null;
                        var param = null;
                        var xName = null;
                        if (~its.indexOf(item)) {
                            if (sField.Func) {
                                const fc = JSON.parse(sField.Func);
                                if (fc.special) {
                                    func = FieldFunc[cField.DataType][fc.special].func;
                                    //if (fc.special == "hour")
                                    param = 1;
                                    if (itemSet.ConfigList) {
                                        //item.ConfigList 工序推移图[0][0] 班制[0][1]数据类型[0][2]时间范围[0][3]合计;[1][...]工序
                                        var index = 0;
                                        if (itemSet.ConfigList.length > index) {
                                            //时间类型
                                            timeType = itemSet.ConfigList[index].length > 1 ? itemSet.ConfigList[index][1] : timeType;
                                            xName = timeTypes[timeType];
                                        }
                                    }
                                }
                            }
                        }
                        var xData = distinct(dataSource.map(x => func ? func(x[field], param) : x[field]));

                        var series = [];
                        var key = "";
                        switch (itemConfig.Item) {
                            case 9: key = "Production"; break;
                            case 10: key = "Code"; break;
                            case 11: key = "Processor"; break;
                        }

                        if (isStrEmptyOrUndefined(key))
                            continue;
                        var lData = distinct(dataSource.map(x => x[key]).filter(x => x));
                        if (!lData.length) {
                            var ldd = dataSource.map(x => x[vField.Field]);
                            series.push({
                                type: sType,
                                label: {
                                    show: true,
                                    position: 'top',
                                    fontWeight: "bold",
                                    fontSize: 14,
                                },
                                //symbol: 'none',
                                lineStyle: {
                                    width: 3
                                },
                                data: ldd
                            })
                        } else {
                            lData.forEach(ld => {
                                var ldd = dataSource.filter(x => x[key] == ld).map(x => x[vField.Field]);
                                series.push({
                                    name: ld,
                                    type: sType,
                                    label: {
                                        show: true,
                                        position: 'top',
                                        fontWeight: "bold",
                                        fontSize: 14,
                                    },
                                    //symbol: 'none',
                                    lineStyle: {
                                        width: 3
                                    },
                                    data: ldd
                                })
                            })
                        }

                        if (!pTableOrChart[tabN]) {
                            pTableOrChart[tabN] = {
                                lData: lData,
                                xData: xData,
                                series: series,
                                chart: echarts.init($(tabN)[0]),
                            };
                            pTableOrChart[tabN].chart.setOption({
                                tooltip: {
                                    trigger: 'axis'
                                },
                                grid: {
                                    left: '3%',
                                    right: '6%',
                                    bottom: '3%',
                                    containLabel: true
                                },
                                color: ["#00a65a", "red", "#ff00ff", "#cc3300", "#ff9900", "#9933ff", "blue", "#0099ff", "#660066"],
                                xAxis: {
                                    name: xName ? xName : cField.Field,
                                    nameTextStyle: {
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: 14,
                                    },
                                    type: 'category',
                                    boundaryGap: false,
                                    data: xData,
                                    axisLine: {
                                        lineStyle: {
                                            color: "white",
                                            fontWeight: "bold",
                                            fontSize: 19,
                                        }
                                    },
                                },
                                yAxis: {
                                    name: vField ? vField.Column : "",
                                    nameTextStyle: {
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: 14,
                                    },
                                    //boundaryGap: [0, '20%'],
                                    type: 'value',
                                    axisLine: {
                                        lineStyle: {
                                            color: "white",
                                            fontWeight: "bold",
                                            fontSize: 16,
                                        }
                                    },
                                },
                                legend: {
                                    data: lData,
                                    textStyle: {
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: 16,
                                    }
                                },
                                series: series
                            }, true);

                            $(tabN).resize(function () {
                                for (var k in pTableOrChart) {
                                    const p = pTableOrChart[k];
                                    p.chart && p.chart.resize();
                                }
                            });
                        } else {
                            var option = {};
                            var update = false;
                            if (!isEqual(pTableOrChart[tabN].lData, lData)) {
                                update = true;
                                option.legend = lData;
                            }
                            if (!isEqual(pTableOrChart[tabN].xData, xData)) {
                                update = true;
                                option.xAxis = { data: xData };
                            }
                            if (!isEqual(pTableOrChart[tabN].series, series)) {
                                update = true;
                                option.series = series;
                            }
                            if (update) {
                                pTableOrChart[tabN].chart.setOption(option);
                                pTableOrChart[tabN].lData = lData;
                                pTableOrChart[tabN].xData = xData;
                                pTableOrChart[tabN].series = series;
                            }
                        }
                    }
                }
            }
        }
    }, 0);
}

function getItemTrs(dataSource, itemConfig, itemSet, sWay) {
    //配置
    const cFieldList = [];
    itemConfig.FieldList && itemConfig.FieldList.forEach(d => {
        cFieldList[d.Field] = d;
    })
    //设置
    const sFieldList = itemSet.FieldList ? itemSet.FieldList.filter(x => x.Order) : [];
    const xvHao = sFieldList.filter(x => x.Field == "XvHao");
    if (!xvHao.length)
        sFieldList.unshift({
            Order: 0,
            Column: "序号",
            Field: "XvHao",
            Width: "60"
        })
    return dataSource.reduce((r, ds, i) => {
        const tds = sFieldList.reduce((a, col, i) => {
            var d = ds[col.Field];
            var pre = col.Pre ? col.Pre : "";
            var suffix = col.Suffix ? col.Suffix : "";
            var width = col.Width && col.Width !== "auto" ? `width: ${col.Width}px;` : `width: auto;`;
            var bold = "";
            var color = "";
            if (cFieldList[col.Field] && col.Func) {
                const func = JSON.parse(col.Func);
                if (func.color == 1)
                    color = col.Color;
                else if (func.color == 2) {
                    for (var i = 0, l = func.cons.length; i < l; i++) {
                        const x = func.cons[i];
                        if (meetCondition(d, x.con, x.conv)) {
                            color = x.color;
                            break;
                        }
                    }
                }
                if (func.special) {
                    const dType = cFieldList[col.Field].DataType;
                    d = FieldFunc[dType][func.special].func(d);
                }
                if (func.bold) {
                    bold = "text-bold";
                }
            }
            color = color ? `color: ${color};` : ``;
            return a + `<td class="${bold}" style='${width}${color}'>${pre}${d}${suffix}</td>`;
        }, '');
        var maxClass = "";
        if ((sWay == "asc" && dataSource.length == i + 1) ||
            (sWay == "desc" && i == 0)) {
            maxClass = ` class="max"`;
        }
        return r + `<tr${maxClass} order=${ds.XvHao} ${trFlag}=${ds[trFlag]}>${tds}</tr>`;
    }, '');
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
