var _permissionList = [];
var tableTmp = [];
function pageReady() {
    $(".sidebar-mini").addClass("sidebar-collapse");
    _permissionList[738] = { uIds: ['permissionGroupLi', 'permissionGroupTab'] };
    _permissionList[739] = { uIds: ['permissionsLi', 'permissionsTab'] };
    _permissionList[745] = { uIds: ['updateAdministrator'] };
    _permissionList[747] = { uIds: ['upPermissionGroup'] };
    _permissionList[746] = { uIds: ['delPermissionGroup'] };
    _permissionList[744] = { uIds: ['delPermission'] };
    _permissionList = checkPermissionUi(_permissionList);
    getPermissionsList();

    var getPListFunc = new Promise(resolve => getPermissionsList(resolve));
    var getPGroupFunc = new Promise(resolve => getPermissionsGroup(resolve));
    Promise.all([getPListFunc, getPGroupFunc]).then(ret => {
        if (!_permissionList[738].have && _permissionList[739].have) {
            $("#permissionsLi a").click();
            return;
        }
    });
}

function getPermissionsGroup(resolve) {
    if (!_permissionList[738].have) {
        resolve && (resolve("success"));
        return;
    }
    $("#permissionGroupList").empty();
    ajaxPost("/Relay/Post", {
        opType: 55
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            resolve && (resolve("success"));
            return;
        };
        if (ret.datas.length > 0) {
            showPermissionsGroups("permissionGroupList", ret.datas);
        }
        resolve && (resolve("success"));
    });
}

function showPermissionsGroups(uiName, list) {
    var permissionTypes = `<div class="box box-solid noShadow" style="margin-bottom: 0;">
                            <div class="box-header no-padding">
                                <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="on_i fa fa-minus"></i></button>
                                <label class="pointer" style="margin:0;font-weight:inherit">
                                    <input type="checkbox" class="on_cb" style="width: 15px" value="0">
                                    <span class="textOverTop" style="vertical-align: middle;font-size: 16px">权限管理</span>
                                </label>
                            </div>
                            <div class="box-body no-padding">
                                <ul class="on_ul nav nav-pills nav-stacked mli" style="margin-left: 20px">{0}</ul>
                            </div>
                        </div>`;
    var mOptionStr = `<li>
                        <div class="box box-solid noShadow collapsed-box" style="margin-bottom: 0;">
                            <div class="box-header no-padding form-inline">
                                <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="on_i fa fa-plus"></i></button>
                                <label class="pointer" style="margin:0;font-weight:inherit">
                                    <input type="checkbox" class="on_cb" style="width: 15px" value="{0}">
                                    <span class="textOverTop" style="vertical-align: middle;font-size: 16px">{1}</span>
                                </label>
                                <span class="textOn text-red text-bold">{2}</span>
                                <input type="text" class="form-control text-center textIn hidden text-red text-bold" style="min-width:250px;width:auto;" placeholder="权限Id,多个以英文逗号隔开" value={2}>
                            </div>
                            <div class="box-body no-padding">
                                <ul class="on_ul nav nav-pills nav-stacked mli" style="margin-left: 20px">{3}</ul>
                            </div>
                        </div>
                    </li>`;
    var mNameStr = `<li>
                        <div class="box box-solid noShadow" style="margin-bottom: 0;">
                            <div class="box-header no-padding form-inline">
                                <a type="button" class="btn btn-box-tool disabled" data-widget="collapse"><i class="fa fa-chevron-right"></i></a>
                                <label class="pointer" style="margin:0;font-weight:inherit">
                                    <input type="checkbox" class="on_cb" style="width: 15px" value="{0}">
                                    <span class="textOverTop" style="vertical-align: middle;font-size: 16px">{1}</span>
                                </label>
                                <span class="textOn text-red text-bold">{2}</span>
                                <input type="text" class="form-control text-center textIn hidden text-red text-bold" style="min-width:250px;width:auto;" placeholder="权限Id,多个以英文逗号隔开" value={2}>
                            </div>
                        </div>
                    </li>`;
    list.sort(sortOrder);
    var opObj = { parent: [] };
    for (var i = 0, len = list.length; i < len; i++) {
        var d = list[i];
        var par = d.Parent;
        par == 0 ? opObj.parent.push(d) : opObj[par] ? opObj[par].push(d) : opObj[par] = [d];
    }
    var childTree = arr => {
        return arr.map(item => {
            var obj = '';
            obj += opObj[item.Id]
                ? mOptionStr.format(item.Id, item.Name, item.List, childTree(opObj[item.Id]))
                : mNameStr.format(item.Id, item.Name, item.List);
            return obj;
        }).join('');
    }
    const tableId = "permissionGroupList";
    const tableData = `${tableId}Data`;
    tableTmp[tableData] = [];
    $(`#${uiName}`).html(opObj.parent.length ? permissionTypes.format(childTree(opObj.parent)) : '')
        .find(".on_cb").iCheck({
            checkboxClass: 'icheckbox_minimal',
            increaseArea: '20%'
        }).off("ifChanged").on("ifChanged",
            function () {
                const tr = $(this).closest(".box-header");
                var id = $(this).val() >> 0;
                var name = tr.find(".textOverTop").text();
                var list = tr.find(".textOn").text();
                if ($(this).is(":checked")) {
                    tr.find(".textIn").val(list);
                    tableTmp[tableData][id] = {
                        Id: id,
                        Name: name,
                        List: list
                    };
                    tr.find(".textOn").addClass("hidden").siblings(".textIn").removeClass("hidden");
                } else {
                    delete tableTmp[tableData][id];
                    tr.find(".textIn").addClass('hidden').siblings(".textOn").removeClass("hidden");
                }
            });
    $(`#${uiName}`).find(".textIn").off("change").on("change", function () {
        const list = $(this).val();
        if (!/^\d+(,\d+)*$/g.test(list)) {
            onInputDouHao(this);
            return void layer.msg("只能输入数字或英文逗号");
        }
        const tr = $(this).closest(".box-header");
        var id = tr.find(".on_cb").val() >> 0;
        tableTmp[tableData][id].List = list;
    });
}

function upPermissionGroup() {
    const tableId = "permissionGroupList";
    const tableData = `${tableId}Data`;
    const data = Object.values(tableTmp[tableData]);
    const delId = data.map(t => t.Id);
    const delName = data.map(t => t.Name).join("<br>");
    isStrEmptyOrUndefined(delId) ? layer.msg('请选择要修改的数据')
        : showConfirm(`修改以下权限:<pre style='color:red'>${delName}</pre>`, () => {
            ajaxPost("/Relay/Post", {
                opType: 56,
                opData: JSON.stringify(data)
            }, ret => {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getPermissionsGroup();

                    $("a.menuitem[href]").filter(function () {
                        return this.pathname === url;
                    }).parent().addClass("active").parent().parent().addClass("active");
                }
            });
        });
}

function delPermissionGroup() {
    const tableId = "permissionGroupList";
    const tableData = `${tableId}Data`;
    const data = Object.values(tableTmp[tableData]);
    const delId = data.map(t => t.Id);
    const delName = data.map(t => t.Name).join("<br>");
    isStrEmptyOrUndefined(delId) ? layer.msg('请选择要删除的数据')
        : showConfirm(`删除以下权限:<pre style='color:red'>${delName}</pre>`, () => {
            ajaxPost("/Relay/Post", {
                opType: 58,
                opData: JSON.stringify({
                    ids: delId
                })
            }, ret => {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getPermissionsGroup();
                }
            });
        });
}

function updatePermissionGroup() {
    ajaxPost("/Relay/Post", { opType: 92 }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
    });
}

//权限列表
function getPermissionsList(resolve) {
    if (!_permissionList[739].have) {
        resolve && (resolve("success"));
        return;
    }
    const tableId = "permissionsList";
    const tableEl = `#${tableId}`;
    const tableArr = `${tableId}Arr`;
    const tableData = `${tableId}Data`;
    tableTmp[tableArr] = [];
    tableTmp[tableData] = [];
    ajaxPost("/Relay/Post", {
        opType: 59
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            resolve && (resolve("success"));
            return;
        }
        const rData = ret.datas;
        if (!tableTmp[tableId]) {
            const per744 = _permissionList[744].have;
            const tableConfig = dataTableConfig(rData, per744);

            tableConfig.addColumns([
                { data: "Id", title: "权限Id", Class: "text-red" },
                { data: "Name", title: "名称" },
                { data: "Type", title: "类型" },
                { data: "Label", title: "分类" }
            ]);
            tableConfig.drawCallback = function () {
                initCheckboxAddEvent.call(this, tableTmp[tableArr],
                    (tr, d) => {
                        tableTmp[tableData].push(d);
                    },
                    (tr, d) => {
                        removeArray(tableTmp[tableData], "Id", d.Id);
                    });
            }
            tableTmp[tableId] = $(tableEl).DataTable(tableConfig);
        } else {
            updateTable(tableTmp[tableId], rData);
        }
        resolve && (resolve("success"));
    });
}

function delPermission() {
    const tableId = "permissionsList";
    const tableData = `${tableId}Data`;
    const delId = tableTmp[tableData].map(t => t.id).join(",");
    const delName = tableTmp[tableData].map(t => t.name).join("<br>");
    isStrEmptyOrUndefined(delId) ? layer.msg('请选择要删除的数据')
        : showConfirm(`删除以下权限:<pre style='color:red'>${delName}</pre>`, () => {
            ajaxPost("/Relay/Post", {
                opType: 62,
                opData: JSON.stringify({
                    ids: delId
                })
            }, ret => {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getPermissionsList();
                }
            });
        });
}

function updateAdministrator() {
    ajaxPost("/Relay/Post", {
        opType: 63
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
    });
}