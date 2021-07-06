var _permissionList = [];
const tableSet = tableDefault();
function pageReady() {
    _permissionList[230] = { uIds: ['upWorkshopBtn'] };
    _permissionList[229] = { uIds: ['addWorkshopModalBtn'] };
    _permissionList[231] = { uIds: ['delWorkshopBtn'] };
    _permissionList[233] = { uIds: ['upSiteBtn'] };
    _permissionList[232] = { uIds: ['addSiteModalBtn'] };
    _permissionList[234] = { uIds: ['delSiteBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
    getListNoCover(getWorkshopList);

    $("#workshopList").on("input", ".shifts", function () {
        const tr = $(this).closest('tr');
        const shifts = tr.find('.shifts').val() >> 0;
        $(tr).find('.shiftNames').attr("placeholder", getTip(0, shifts));
        $(tr).find('.shiftTimes').attr("placeholder", getTip(1, shifts));
    })

    $("#addWorkshopList").on("input", ".shifts", function () {
        const tr = $(this).closest('tr');
        const shifts = tr.find('.shifts').val() >> 0;
        $(tr).find('.shiftNames').attr("placeholder", getTip(0, shifts));
        $(tr).find('.shiftTimes').attr("placeholder", getTip(1, shifts));
    })
}

function getCount(type, shifts) {
    var st = 0;
    if (shifts == 1)
        st = type == 0 ? 1 : 2;
    else if (shifts >= 2)
        st = shifts;
    return st;
}

function getTip(type, shifts) {
    var st = getCount(type, shifts);
    var sd = "";
    if (st > 0) {
        sd = `${st}个${(type == 0 ? "名称" : "时间")}`;
        if (st > 1) {
            sd += `,${(type == 0 ? "以英文逗号隔开" : "格式:00:00:00,以英文逗号隔开")}`;
        }
    } else
        sd= "班次应大于0";
    return sd;
}

//----------------------------------------车间管理----------------------------------------------------
let _workshopId = 0;
let _workshopTrs = null;
let _workshopListTable = null;
//获取车间列表
function getWorkshopList(_, menu = false, callBack = null, cover = 1, table = true, qId = 0) {
    myPromise(162, { menu, qId }, cover).then(ret => {
        const rData = ret.datas;
        if (table) {
            _workshopTrs = [];
            if (_workshopListTable == null) {
                const tableConfig = dataTableConfig(rData, _permissionList[230].have);
                tableConfig.addColumns([
                    { data: "Name", title: "车间", render: tableSet.input.bind(null, "name") },
                    { data: "Abbrev", title: "缩写", render: tableSet.input.bind(null, "abbrev") },
                    { data: "Shifts", title: "班次", render: tableSet.numberInput.bind(null, "shifts", "") },
                    { data: "ShiftNames", title: "班次名称", render: tableSet.input.bind(null, "shiftNames") },
                    { data: "ShiftTimes", title: "班次时间", render: tableSet.input.bind(null, "shiftTimes") },
                    { data: "Remark", title: "备注", render: tableSet.input.bind(null, "remark") },
                    { data: "Id", title: "位置", render: tableSet.detailBtn.bind(null, "clickWorkshopTr") }
                ]);
                tableConfig.drawCallback = function () {
                    initCheckboxAddEvent.call(this, _workshopTrs,
                        (tr, d) => {
                            tr.find('.name').val(d.Name);
                            tr.find('.abbrev').val(d.Abbrev);
                            tr.find('.shifts').val(d.Shifts);
                            tr.find('.shiftNames').val(d.ShiftNames);
                            tr.find('.shiftTimes').val(d.ShiftTimes);
                            tr.find('.remark').val(d.Remark);
                        });
                }
                tableConfig.createdRow = function (tr, d) {
                    const shifts = d.Shifts;
                    $(tr).find('.shiftNames').attr("placeholder", getTip(0, shifts));
                    $(tr).find('.shiftTimes').attr("placeholder", getTip(1, shifts));
                }
                _workshopListTable = $("#workshopList").DataTable(tableConfig);
            } else {
                updateTable(_workshopListTable, rData);
            }
        }
        callBack && callBack(rData);
    });
}

//车间列表点击
function clickWorkshopTr(wId) {
    _workshopId = wId;
    getListNoCover(getSiteList);
}

//车间列表tr数据获取
function getWorkshopTrInfo(el, isAdd) {
    const name = el.find('.name').val().trim();
    if (isStrEmptyOrUndefined(name)) return void layer.msg("车间名不能为空");
    const abbrev = el.find('.abbrev').val().trim();
    const shifts = el.find('.shifts').val() >> 0;
    const shiftTimes = el.find('.shiftTimes').val().trim();
    const shiftNames = el.find('.shiftNames').val().trim();
    if (shifts <= 0)
        return void layer.msg("班次设置错误");
    else if (isStrEmptyOrUndefined(shiftNames) || getCount(0, shifts) != shiftNames.split(",").length)
        return void layer.msg("班次与班次名称数量不符");
    else if (isStrEmptyOrUndefined(shiftTimes) || getCount(1, shifts) != shiftTimes.split(",").length)
        return void layer.msg("班次与班次时间数量不符");
    const remark = el.find('.remark').val().trim();
    const list = {
        Name: name,
        Abbrev: abbrev,
        Shifts: shifts,
        ShiftNames: shiftNames,
        ShiftTimes: shiftTimes,
        Remark: remark
    }
    isAdd || (list.Id = el.find('.isEnable').val() >> 0);
    return list;
}

//添加车间模态框
function addWorkshopModel() {
    const trData = {
        Name: "",
        Abbrev: "",
        Shifts: 0,
        ShiftNames: "",
        ShiftTimes: "",
        Remark: ""
    }
    const tableConfig = dataTableConfig([trData]);
    tableConfig.addColumns([
        { data: "Name", title: "车间", render: tableSet.addInput.bind(null, "name", "100%") },
        { data: "Abbrev", title: "缩写", render: tableSet.addInput.bind(null, "abbrev", "100%") },
        { data: "Shifts", title: "班次", render: tableSet.addNumberInput.bind(null, "shifts", "60px") },
        { data: "ShiftNames", title: "班次名称", render: tableSet.addInput.bind(null, "shiftNames", "100%") },
        { data: "ShiftTimes", title: "班次时间", render: tableSet.addInput.bind(null, "shiftTimes", "100%") },
        { data: "Remark", title: "备注", render: tableSet.addInput.bind(null, "remark", "100%") },
        { data: null, title: "删除", render: tableSet.delBtn }
    ]);
    tableConfig.createdRow = function (tr, d) {
        const tip = `班次应大于0`;
        $(tr).find('.shiftNames').attr("placeholder", tip);
        $(tr).find('.shiftTimes').attr("placeholder", tip);
    }
    $('#addWorkshopList').DataTable(tableConfig);
    $('#addWorkshopListBtn').off('click').on('click', () => addDataTableTr('#addWorkshopList', trData));
    $('#addWorkshopModel').modal('show');
}

//添加车间
function addWorkshop(close) {
    addTableRow('#addWorkshopList', getWorkshopTrInfo, 96, () => {
        getListNoCover(getWorkshopList);
        close && $('#addWorkshopModel').modal('hide');
    });
}

//修改车间
function updateWorkshop() {
    updateTableRow(_workshopTrs, getWorkshopTrInfo, 95, () => { getListNoCover(getWorkshopList); });
}

//删除车间
function delWorkshop() {
    delTableRow(_workshopTrs, 97, () => { getListNoCover(getWorkshopList); });
}

//----------------------------------------车间位置----------------------------------------------------

let _siteTrs = null;
let _siteListTable = null;
//获取位置列表
function getSiteList(_, menu = false, callBack = null, cover = 1, table = true, qId = 0) {
    if (_workshopId == 0)
        return;
    myPromise(125, { menu, qId, wId: _workshopId }, cover).then(data => {
        var rData = data.datas;
        if (table) {
            _siteTrs = [];
            if (_siteListTable == null) {
                const tableConfig = dataTableConfig(rData, true);
                tableConfig.addColumns([
                    { data: "Region", title: "位置", render: tableSet.input.bind(null, "region") },
                    { data: "Remark", title: "备注", render: tableSet.input.bind(null, "remark") }
                ]);
                tableConfig.drawCallback = function () {
                    initCheckboxAddEvent.call(this, _siteTrs, (tr, d) => {
                        tr.find('.region').val(d.Region);
                        tr.find('.remark').val(d.Remark);
                    });
                }
                _siteListTable = $('#siteList').DataTable(tableConfig);
            } else {
                updateTable(_siteListTable, rData);
            }
        }
        callBack && callBack(rData);
    });
}

//位置列表tr数据获取
function getSiteTrInfo(el, isAdd) {
    const region = el.find('.region').val().trim();
    if (isStrEmptyOrUndefined(site)) return void layer.msg("位置不能为空");
    const list = {
        Region: region,
        WorkshopId: _workshopId,
        Remark: el.find('.remark').val()
    }
    isAdd || (list.Id = el.find('.isEnable').val() >> 0);
    return list;
}

//添加位置模态框
function addSiteModel() {
    if (_workshopId == 0)
        return;
    const trData = {
        Region: "",
        Remark: ""
    }
    const tableConfig = dataTableConfig([trData]);
    tableConfig.addColumns([
        { data: "Region", title: "位置", render: tableSet.addInput.bind(null, "region", "auto") },
        { data: "Remark", title: "备注", render: tableSet.addInput.bind(null, "remark", "100%") },
        { data: null, title: "删除", render: tableSet.delBtn }
    ]);
    $('#addSiteList').DataTable(tableConfig);
    $('#addSiteListBtn').off('click').on('click', () => addDataTableTr('#addSiteList', trData));
    $('#addSiteModel').modal('show');
}

//添加位置
function addSite(close) {
    if (_workshopId == 0)
        return;
    addTableRow('#addSiteList', getSiteTrInfo, 128, () => {
        getListNoCover(getSiteList);
        close && $('#addSiteModel').modal('hide');
    });
}

//修改位置
function updateSite() {
    if (_workshopId == 0)
        return;
    updateTableRow(_siteTrs, getSiteTrInfo, 127, () => { getListNoCover(getSiteList); });
}

//删除位置
function delSite() {
    if (_workshopId == 0)
        return;
    delTableRow(_siteTrs, 129, () => { getListNoCover(getSiteList); });
}
