var _permissionList = [];
var tableTmp = [];
function pageReady() {
    _permissionList[107] = { uIds: ['addOrganizationUnitBtn'] };
    _permissionList[108] = { uIds: [] };
    _permissionList[109] = { uIds: [] };
    _permissionList[110] = { uIds: ['addMemberBtn'] };
    _permissionList[111] = { uIds: [] };
    _permissionList = checkPermissionUi(_permissionList);
    $(".ms2").select2();
    getOrganizationUnits();
    $("#rdo1").on("ifChanged", function (event) {
        if (!$(this).is(":checked")) {
            $("#cbDiv").removeClass("hidden");
        } else {
            $("#cbDiv").addClass("hidden");
        }
    });
}

function getOrganizationUnits() {
    $("#organizationUnits").empty();
    ajaxPost("/Relay/Post", {
        opType: 65
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var doAction = '<div class="btn-group pull-right">' +
            '<button type = "button" class="btn btn-default btn-sm" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >' +
            '    <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
            '        <span class="caret"></span>' +
            '        <span class="sr-only">Toggle Dropdown</span>' +
            '    </button>' +
            '    <ul class="dropdown-menu" role="menu" style="cursor:pointer">{0}{1}' +
            '    </ul>' +
            '</div>';

        var mMenuStr = '<div class="box box-solid noShadow"  style="margin-bottom: 0;">' +
            '    <div class="box-header" style="padding: 2px;">' +
            '        <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="on_i fa fa-minus"></i></button>' +
            '        <h3 class="box-title pointer" style="vertical-align: middle;font-size: 16px;" onclick="onClick(\'{0}\',\'{1}\')"></h3>' +
            '    </div>' +
            '    <div class="box-body no-padding">' +
            '        <ul class="on_ul nav nav-pills nav-stacked mli" style="margin-left: 20px"></ul>' +
            '    </div>' +
            '</div>';

        var datas = ret.datas;
        var parents = getOrganizationUnitsParent(datas);
        for (var i = 0; i < parents.length; i++) {
            var children = getOrganizationUnitsChild(datas, parents[i]);
            for (var j = 0; j < children.length; j++) {
                var child = children[j];
                var mMenu;
                var option;

                var upUnit = '<li><a onclick="showUpdateOrganizationUnit({0}, \'{1}\')">修改</a></li>'.format(child.Id, escape(child.Name));
                var delUnit = '<li><a onclick="deleteOrganizationUnit({0}, \'{1}\')">删除</a></li>'.format(child.Id, escape(child.Name));
                var da = "";
                if (_permissionList[108].have || _permissionList[109].have) {
                    da = doAction.format(
                        _permissionList[108].have ? upUnit : "",
                        _permissionList[109].have ? delUnit : "");
                }
                if (child.ParentId == 0) {
                    mMenu = mMenuStr.format(child.Id, escape(child.Name));
                    option = $(mMenu).clone();
                    option.find('h3').text(child.Name).append("(<span>" + child.MemberCount + "</span>)");
                    option.find('h3').after(da);
                    option.find('.on_ul').attr('id', "on" + child.Id);
                    $("#organizationUnits").append(option);
                } else {
                    mMenu = "<li>" + mMenuStr.format(child.Id, escape(child.Name)) + "</li>";
                    option = $(mMenu).clone();
                    option.find('h3').text(child.Name).append("(<span>" + child.MemberCount + "</span>)");
                    option.find('h3').after(da);
                    option.find('.on_ul').attr('id', "on" + child.Id);
                    $("#organizationUnits").find('[id=' + "on" + child.ParentId + ']').append(option);
                }
            }
        }
    });
}

function rule(a, b) {
    return a.Id > b.Id;
}

function getOrganizationUnitsParent(list) {
    //var parents = new Array();
    //for (var i = 0; i < list.length; i++) {
    //    var data = list[i];
    //    if (parents.indexOf(data.ParentId) < 0) {
    //        parents.push(data.ParentId);
    //    }
    //}
    //return parents.sort(function (a, b) { return a > b ? 1 : -1 });
    return distinct(list.map(x => x.ParentId)).sort(function (a, b) { return a > b ? 1 : -1 });
}

function getOrganizationUnitsChild(list, parentId) {
    //var result = new Array();
    //for (var i = 0; i < list.length; i++) {
    //    var data = list[i];
    //    if (data.ParentId == parentId) {
    //        result.push(data);
    //    }
    //}

    //return result.sort(rule);
    return list.filter(x => x.ParentId == parentId).sort(rule);
}

function showAddOrganizationUnitModal(show = true) {
    if (show) {
        $("#rdo2").iCheck("check");
        $("#cbDiv").removeClass("hidden");
        $("#addName").val("");
    }
    ajaxPost("/Relay/Post", {
        opType: 65
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        };
        const pid = $("#addOrganizationUnit").val() >> 0;
        const dataS = OrganizationUnitSort(ret.datas);
        $('#addOrganizationUnit').html(setOptions(dataS, "Name"));
        pid && $('#addOrganizationUnit').val(pid);
        show && $("#addOrganizationUnitModal").modal("show");
    });
}

function OrganizationUnitSort(dataS) {
    var data = [];
    var depName;
    var parents = getOrganizationUnitsParent(dataS);
    for (var i = 0; i < parents.length; i++) {
        var children = getOrganizationUnitsChild(dataS, parents[i]);
        for (var j = 0; j < children.length; j++) {
            var child = children[j];
            var parent = child.ParentId;
            if (parent == 0) {
                data.push({
                    Id: child.Id,
                    Name: child.Name
                });
            } else {
                depName = child.Name;
                while (parent != 0) {
                    const p = dataS.filter(x => x.Id == parent);
                    if (p.length <= 0)
                        break;
                    const item = p[0];
                    depName = depName.replace("", item.Name + " - ");
                    parent = item.ParentId;
                }
                data.push({
                    Id: child.Id,
                    Name: depName
                });
            }
        }
    }
    return data;
}

function addOrganizationUnit(close) {
    const addName = $("#addName").val().trim();
    if (isStrEmptyOrUndefined(addName)) {
        layer.msg("部门名称不能为空");
        return;
    }
    showConfirm("添加", () => {
        const pid = $("#addOrganizationUnit").val() >> 0;
        const data = {
            Name: addName,
            ParentId: $("#rdo1").is(":checked") ? 0 : pid
        }

        ajaxPost('/Relay/Post', {
            opType: 67,
            opData: JSON.stringify([
                data
            ])
        }, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno != 0) {
                return;
            }
            getOrganizationUnits();
            showAddOrganizationUnitModal(false);
            close && $("#addOrganizationUnitModal").modal("hide");
        });
    });
}

function showUpdateOrganizationUnit(id, name) {
    name = unescape(name);
    $("#updateId").html(id);
    $("#organizationName").val(name);
    $("#updateOrganizationUnitModal").modal("show");
}

function updateOrganizationUnit(close) {
    var id = parseInt($("#updateId").html());
    var organizationName = $("#organizationName").val().trim();
    if (isStrEmptyOrUndefined(organizationName)) {
        layer.msg("部门名称不能为空");
        return;
    }

    showConfirm("修改", () => {
        var data = {
            Id: id,
            Name: organizationName
        }
        ajaxPost('/Relay/Post', {
            opType: 66,
            opData: JSON.stringify([
                data
            ])
        }, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno != 0) {
                return;
            }
            getOrganizationUnits();
            if (!$("#showAddMemberModal").is(":hidden") && $("#unName").attr("value") == id) {
                $("#unName").text(organizationName);
            }
            close && $("#updateOrganizationUnitModal").modal("hide");
        });
    });
}

function deleteOrganizationUnit(id, organizationUnitName) {
    organizationUnitName = unescape(organizationUnitName);
    showConfirm(`删除部门：${organizationUnitName}`, () => {
        ajaxPost('/Relay/Post', {
            opType: 69,
            opData: JSON.stringify({
                ids: [id]
            })
        }, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                //getOrganizationUnits();
                $("#on" + id).parents(".box-solid:first").remove();
                if (!$("#showAddMemberModal").is(":hidden") && $("#unName").attr("value") == id) {
                    const tableId = "memberListTable";
                    updateTable(tableTmp[tableId], []);
                    $("#showAddMemberModal,#showBolModal").addClass("hidden");
                    $("#unName").text("成员列表");
                    $("#unName").removeAttr("value");
                }
            }
        });
    });
}

function moveOrganizationUnits() {

}

function onClick(id, name) {
    name = unescape(name);
    $("#addMemberBtn").attr("uid", id);
    getMemberList(id, name);
}

var memberList = null;
function getMemberList(id, name) {
    const tableId = "memberListTable";
    const tableEl = `#${tableId}`;
    const tableArr = `${tableId}Arr`;
    const tableData = `${tableId}Data`;
    tableTmp[tableArr] = [];
    tableTmp[tableData] = [];

    $("#unName").text(name);
    $("#unName").attr("value", id);
    $("#showBolModal").removeClass("hidden");
    ajaxPost("/Relay/Post", {
        opType: 70,
        opData: JSON.stringify({
            unitId: id
        })
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        memberList = rData.map(x => x.AccountId);
        if (!tableTmp[tableId]) {
            const tableConfig = dataTableConfig(rData);
            tableConfig.addColumns([
                { data: "Name", title: "姓名" },
                { data: "RoleName", title: "角色" },
            ]);
            if (_permissionList[111].have) {
                const op = function (data, type, row) {
                    return `<button type="button" class="btn btn-primary btn-sm btn-danger" data-toggle="modal" onclick="deleteMember(${data.Id}, \'${escape(data.Name)}\')">删除</button>`;
                };
                tableConfig.addColumns([
                    { data: null, title: "操作", render: op, orderable: false }
                ]);
            }
            tableConfig.drawCallback = function () {
                $(tableEl).css("padding", "3px");
                initCheckboxAddEvent.call(this, tableTmp[tableArr],
                    (tr, d) => {
                        tableTmp[tableData].push(d);
                    },
                    (tr, d) => {
                        removeArray(tableTmp[tableData], "id", d.id);
                    });
            }
            tableTmp[tableId] = $(tableEl).DataTable(tableConfig);
        } else {
            updateTable(tableTmp[tableId], rData);
        }
    });
}

function showAddMemberModal() {
    if (!$("#addMemberBtn").attr("uid"))
        return;

    const tableId = "memberList";
    const tableEl = `#${tableId}`;
    const tableArr = `${tableId}Arr`;
    const tableData = `${tableId}Data`;
    tableTmp[tableArr] = [];
    tableTmp[tableData] = [];
    ajaxPost("/Relay/Post", {
        opType: 75,
        opData: JSON.stringify({
            all: false,
            eIds: memberList.join()
        })
    }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }

        const rData = ret.datas;
        if (!tableTmp[tableId]) {
            const tableConfig = dataTableConfig(rData, true);
            tableConfig.addColumns([
                { data: "Name", title: "姓名" },
                { data: "Account", title: "账号" },
                { data: "RoleName", title: "角色" },
            ]);

            tableConfig.drawCallback = function () {
                initCheckboxAddEvent.call(this, tableTmp[tableArr],
                    (tr, d) => {
                        $(tr).css("background-color", "gray");
                        tableTmp[tableData].push(d);
                    },
                    (tr, d) => {
                        if ($(tr).hasClass("odd"))
                            $(tr).css("background-color", "#f9f9f9");
                        else
                            $(tr).css("background-color", "");
                        removeArray(tableTmp[tableData], "Id", d.Id);
                    });
            }
            tableTmp[tableId] = $(tableEl).DataTable(tableConfig);
        } else {
            updateTable(tableTmp[tableId], rData);
        }
        $("#addMemberModal").modal("show");
    });
}

function addMember() {
    var unId = $("#unName").attr("value") >> 0;
    var unName = $("#unName").text();
    const tableId = "memberList";
    const tableData = `${tableId}Data`;
    if (tableTmp[tableData] == null || tableTmp[tableData].length == 0) {
        layer.msg("请选择成员");
        return;
    }
    var cnt = tableTmp[tableData].length;
    var data = tableTmp[tableData].map(x => ({ OrganizationUnitId: unId, AccountId: x.Id }));
    showConfirm("添加", () => {
        $("#addMemberModal").modal("hide");
        ajaxPost("/Relay/Post", {
            opType: 71,
            opData: JSON.stringify(data)
        }, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno != 0) {
                return;
            }
            getMemberList(unId, unName);

            var ui = $("#on" + unId).parents(".box-solid:first").find("span:first");
            ui.html(parseInt(ui.text()) + cnt);
        });
    });

}

function deleteMember(id, name) {
    name = unescape(name);
    var unId = $("#unName").attr("value");
    var unName = $("#unName").text();
    showConfirm(`删除成员：${name}`, () => {
        $("#addMemberModal").modal("hide");
        ajaxPost("/Relay/Post", {
            opType: 72,
            opData: JSON.stringify({
                ids: [id]
            })
        }, ret => {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                getMemberList(unId, unName);
                const ui = $("#on" + unId).parents(".box-solid:first").find("span:first");
                ui.html(parseInt(ui.text() - 1));
            }
        });
    });
}