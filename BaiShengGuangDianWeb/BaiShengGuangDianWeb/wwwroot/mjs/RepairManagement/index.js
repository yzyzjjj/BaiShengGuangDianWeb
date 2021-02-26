var _permissionList = [];
const setRow = setTable();
function pageReady() {
    $(".sidebar-mini").addClass("sidebar-collapse");
    _permissionList[41] = { uIds: ['showFaultModelBtn'] };
    _permissionList[34] = { uIds: ['showMaintainerModel'] };
    _permissionList[45] = { uIds: ['showAddMaintainerModelBtn'] };
    _permissionList[46] = { uIds: ['updateMaintainerBtn'] };
    _permissionList[47] = { uIds: ['delMaintainerBtn'] };
    _permissionList[35] = { uIds: ['getFaultTypeList'] };
    _permissionList[52] = { uIds: ['showAddFaultTypeModel'] };
    _permissionList[53] = { uIds: [] };
    _permissionList[54] = { uIds: [] };
    _permissionList[36] = { uIds: ['getUsuallyFaultList'] };
    _permissionList[59] = { uIds: ['showAddUsuallyFaultModel'] };
    _permissionList[60] = { uIds: [] };
    _permissionList[61] = { uIds: [] };
    _permissionList[37] = { uIds: ['getFaultDeviceListBtn'] };
    _permissionList[66] = { uIds: [] };
    _permissionList[67] = { uIds: ['showBatchAssignModalBtn'] };
    _permissionList[68] = { uIds: [] };
    _permissionList[69] = { uIds: [] };
    _permissionList[70] = { uIds: [] };
    _permissionList[71] = { uIds: ['delChangeBtn'] };
    _permissionList[38] = { uIds: ['getServiceLogListBtn'] };
    _permissionList[76] = { uIds: ['showStatisticsModelBtn'] };
    _permissionList[77] = { uIds: ['addServiceLogBtn'] };
    _permissionList[78] = { uIds: ['updateServiceLogBtn'] };
    _permissionList[79] = { uIds: ['delServiceLogBtn'] };
    _permissionList[39] = { uIds: ['getDelFaultDeviceListBtn'] };
    _permissionList[40] = { uIds: ['getDelServiceLogListBtn'] };
    //_permissionList[80] = { uIds: ['updateScoreBtn'] };
    _permissionList = checkPermissionUi(_permissionList);
    var li = $("#tabs li:not(.hidden)").first();
    if (li) {
        li.addClass("active");
        $(li.find("a").attr("href")).addClass("active");
    }
    $(".ms2").select2();
    $("#serLogFaultType").on("change", function () {
        var v = $(this).val();
        $("#serLogFaultDesc").val(_faultTypeData[v].FaultDescription);
    });
    $("#faultType").on("change", function () {
        var v = $(this).val();
        $("#faultDefaultDesc").val(_faultTypeData[v].FaultDescription);
    });
    getWorkerSelect();
    getFaultTypeSelect();
    var nowMonth = getMonthScope();
    $("#faultSTime,#serviceLogSTime,#delFSTime,#delRepairSTime,#statSTime").val(nowMonth.start).datepicker('update');
    $("#faultETime,#serviceLogETime,#delFETime,#delRepairETime,#statETime").val(nowMonth.end).datepicker('update');
    $('#faultDevicePro').on('change', function () {
        var v = $(this).val();
        var parentEl = '#faultQuery';
        var attrEl = 'faultDeviceAttr';
        var selectEl = '#faultDeviceAttrSelect';
        switch (v) {
            case 'code':
                setFaultDeviceGet(parentEl, attrEl, '#faultDeviceInput');
                break;
            case 'faultType':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _faultType);
                break;
            case 'priority':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _priority);
                break;
            case 'grade':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _grade);
                break;
            case 'state':
                setFaultDeviceGet(parentEl, attrEl, selectEl, '<option value="0">未确认</option><option value="1">已确认</option><option value="2">维修中</option>');
                break;
            case 'maintainer':
                setFaultDeviceGet(parentEl, attrEl, selectEl, `<option value="0" wname="0">未指派</option>${_worker}`);
                break;
            case 'solveTime':
                $('#solveSTime,#solveETime').removeAttr("readonly");
                setFaultDeviceGet(parentEl, attrEl, '#faultDeviceTime');
                break;
        }
    });
    $('#serviceLogPro').on('change', function () {
        var v = $(this).val();
        var parentEl = '#serviceLogQuery';
        var attrEl = 'serviceAttr';
        var selectEl = '#serviceAttrSelect';
        switch (v) {
            case 'code':
                setFaultDeviceGet(parentEl, attrEl, '#serviceInput');
                break;
            case 'faultType':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _faultType);
                break;
            case 'priority':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _priority);
                break;
            case 'grade':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _grade);
                break;
            case 'maintainer':
                setFaultDeviceGet(parentEl, attrEl, selectEl, `<option value="0" wname="0">未指派</option>${_worker}`);
                break;
            case 'faultSolver':
                setFaultDeviceGet(parentEl, attrEl, selectEl, `${_workerName}`);
                break;
            default:
                $('#serSTime,#serETime').removeAttr("readonly");
                setFaultDeviceGet(parentEl, attrEl, '#solveTime');
        }
    });
    $('#delFPro').on('change', function () {
        var v = $(this).val();
        var parentEl = '#delFQuery';
        var attrEl = 'delFAttr';
        var selectEl = '#delFAttrSelect';
        switch (v) {
            case 'code':
                setFaultDeviceGet(parentEl, attrEl, '#delFInput');
                break;
            case 'faultType':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _faultType);
                break;
            case 'priority':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _priority);
                break;
            case 'grade':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _grade);
                break;
            case 'state':
                setFaultDeviceGet(parentEl, attrEl, selectEl, '<option value="0">未确认</option><option value="1">已确认</option><option value="2">维修中</option>');
                break;
            case 'maintainer':
                setFaultDeviceGet(parentEl, attrEl, selectEl, `<option value="0" wname="0">未指派</option>${_worker}`);
                break;
            case 'solveTime':
                $('#delFSolveSTime,#delFSolveETime').removeAttr("readonly");
                setFaultDeviceGet(parentEl, attrEl, '#delFTime');
                break;
        }
    });
    $('#delRepairPro').on('change', function () {
        var v = $(this).val();
        var parentEl = '#delRepairQuery';
        var attrEl = 'delRepairAttr';
        var selectEl = '#delRepairAttrSelect';
        switch (v) {
            case 'code':
                setFaultDeviceGet(parentEl, attrEl, '#delRepairInput');
                break;
            case 'faultType':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _faultType);
                break;
            case 'priority':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _priority);
                break;
            case 'grade':
                setFaultDeviceGet(parentEl, attrEl, selectEl, _grade);
                break;
            case 'maintainer':
                setFaultDeviceGet(parentEl, attrEl, selectEl, `<option value="0" wname="0">未指派</option>${_worker}`);
                break;
            default:
                $('#delRepSTime,#delRepETime').removeAttr("readonly");
                setFaultDeviceGet(parentEl, attrEl, '#delRepairTime');
        }
    });
    getFaultDeviceList();
    setTimeout(() => getServiceLogList(0), 2000);
    $('#batchAssignList').on('select2:select', '.serviceName', function () {
        $(this).val().includes('同上') && $(this).val($(this).parents('tr').prev().find('.serviceName').val()).trigger('change');
        $(this).parents('td').next().text(Array.from($(this).find('option:selected')).map(item => $(item).attr('phone')).join());
    });
    $('#batchAssignList').on('select2:unselect', '.serviceName', function () {
        $(this).parents('td').next().text(Array.from($(this).find('option:selected')).map(item => $(item).attr('phone')).join());
    });
    $("#serLogDevSite,#devSite").select2({
        allowClear: true,
        placeholder: "请选择(可不选)"
    });
    $('#faultCode').select2({
        allowClear: true,
        placeholder: "请选择"
    });
    $('#designateName,#servicePro,#serLogFaultSolver,#serLogMaintainer').select2({
        allowClear: true,
        placeholder: "请选择",
        matcher
    });
    $("#serLogWorkshop").on("change", function (e) {
        setWorkSiteSelect('#serLogWorkshop', '#serLogDevSite');
    });
    $("#workshop").on("change", function (e) {
        setWorkSiteSelect('#workshop', '#devSite');
    });
    $('#maintainerModel').on('show.bs.modal', function () {
        const fn = () => $('#currentTime').text(getFullTime());
        fn();
        this.time = setInterval(fn, 1000);
    });
    $('#maintainerModel').on('hidden.bs.modal', function () {
        clearInterval(this.time);
    });

    if (!_faultDeviceListTable) {
        const table = "#faultDeviceList";
        $(table).closest(".table-responsive").addClass("hidden");
        //删除
        var per423 = _permissionList[71].have;
        //维修
        var per420 = _permissionList[68].have || _permissionList[69].have || _permissionList[70].have;
        //指派
        var per445 = _permissionList[66].have;
        var service = function (d) {
            var state = d.State;
            var btn = '<button type="button" class="btn btn-{0} btn-xs" onclick="{1}" {3}>{2}</button>';
            var attr = '', text = '', click = '', isDisabled = '';
            switch (state) {
                case 0:
                    attr = 'danger';
                    text = '确认故障';
                    click = `showConfirmModel(${d.Id}, 0,\'${d.EstimatedTime}\',\'${d.Remark}\')`;
                    if (!_permissionList[68].have) {
                        isDisabled = 'disabled';
                    }
                    break;
                case 1:
                    attr = 'info';
                    text = '开始维修';
                    click = `showConfirmModel(${d.Id}, 1,\'${d.EstimatedTime}\',\'${d.Remark}\')`;
                    if (!_permissionList[69].have) {
                        isDisabled = 'disabled';
                    }
                    break;
                case 2:
                    attr = 'success';
                    text = '维修完成';
                    click = `showServiceModel(${d.Id},\'${d.Maintainer}\',\'${d.EstimatedTime}\',${d.FaultTypeId})`;
                    if (!_permissionList[70].have) {
                        isDisabled = 'disabled';
                    }
                    break;
            }
            return btn.format(attr, click, text, isDisabled);
        }
        var serviceName = function (d) {
            var name = d.Name == '' ? '未指派' : d.Name;
            return per445 ? `<a href="javascript:showDesignateModal(${d.Id},${d.Priority},\'${d.Maintainer ? d.Maintainer : 0}\',${d.Grade})" style="padding:3px" class="designate"><i class="glyphicon glyphicon-hand-right"></i><span class="text-black">${name}</span></a>` : name;
        }

        _faultDeviceListTable = $(table).DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": [],
            "aaSorting": [[per423 ? 1 : 0, "asc"]],
            "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 20, //默认显示的记录数
            "columns": [
                { "data": null, "title": "", "render": setRow.isEnable, "visible": per423, "orderable": !per423 },
                { "data": null, "title": "序号", "render": setRow.order },
                { "data": "DeviceCode", "title": "机台号" },
                { "data": "FaultTime", "title": "故障时间", "render": setRow.setTime },
                { "data": null, "title": "状态", "render": setRow.rState },
                { "data": null, "title": "优先级", "render": setRow.priority },
                { "data": "Grade", "title": "故障等级", "render": setRow.grade },
                { "data": null, "title": "维修", "render": service, "visible": per420 },
                { "data": null, "title": "指派给", "render": serviceName },
                { "data": "Phone", "title": "联系方式" },
                { "data": "EstimatedTime", "title": "预计解决时间", "render": setRow.setTime },
                { "data": "Remark", "title": "维修备注", "render": setRow.remark },
                { "data": "Proposer", "title": "报修人" },
                { "data": "FaultTypeName", "title": "故障类型" },
                { "data": null, "title": "故障补充", "render": setRow.rSup },
                { "data": null, "title": "故障详情", "render": setRow.detailBtn }
            ],
            "drawCallback": function (settings, json) {
                if (per423) {
                    $(this).find('.isEnable').iCheck({
                        handle: 'checkbox',
                        checkboxClass: 'icheckbox_minimal-blue',
                        increaseArea: '20%'
                    }).on('ifChanged', function () {
                        var v = $(this).val();
                        var name = $(this).attr('fName');
                        if ($(this).is(':checked')) {
                            _faultDevData.Id.push(v);
                            _faultDevData.Name.push(name);
                        } else {
                            _faultDevData.Id.splice(_faultDevData.Id.indexOf(v), 1);
                            _faultDevData.Name.splice(_faultDevData.Name.indexOf(name), 1);
                        }
                    });
                }
            }
        });
    }

    //删除
    var per79 = _permissionList[79].have;
    //修改
    var per78 = _permissionList[78].have;
    var excelColumns = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    var titleColumns = [11, 18];
    var buttonColumns = [7];
    var buttonColumnsDefault = [];
    buttonColumnsDefault[7] = "评分";
    if (!_repairRecordListTable) {
        const table = "#repairRecordList";
        $(table).closest(".table-responsive").addClass("hidden");

        _repairRecordListTable = $(table).DataTable({
            dom: '<"pull-left"l><"pull-right"B><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            buttons: [
                {
                    extend: 'excel',
                    text: '导出Excel',
                    className: 'btn-primary btn-sm',
                    exportOptions: {
                        columns: excelColumns,
                        format: {
                            body: (data, row, column, node) => titleColumns.indexOf(column) > -1 ?
                                $(node).find("span").attr("title") :
                                ((buttonColumns.indexOf(column) > -1 && node.textContent == buttonColumnsDefault[column]) ? "" : node.textContent)
                        }
                    }
                }
            ],
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": [],
            "aaSorting": [[per79 && !name ? 1 : 0, "asc"]],
            "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 20, //默认显示的记录数
            "columns": [
                { "data": null, "title": "", "render": setRow.serIsEnable, "visible": per79 && !name, "orderable": !per79 && name },
                { "data": null, "title": "序号", "render": setRow.order },
                { "data": "DeviceCode", "title": "机台号" },
                { "data": "FaultTime", "title": "故障时间", "render": setRow.setTime },
                { "data": "SolveTime", "title": "解决时间", "sClass": "text-primary", "render": setRow.setTime },
                { "data": "CostTime", "title": "用时", "sClass": "text-primary" },
                { "data": null, "title": "优先级", "render": setRow.priority },
                { "data": "Grade", "title": "故障等级", "render": setRow.grade },
                {
                    "data": null, "title": "评分", "sClass": "text-primary", render: (d, a, b, index) => {
                        let scoreInfo;
                        if (per78 && !(d.FaultSolvers.length === d.Scores.length)) {
                            scoreInfo = `<button class="btn btn-primary btn-sm" onclick="showScoreModel(${index.row})">评分</button>`;
                        } else {
                            const solver = d.FaultSolver.split(',');
                            if (solver.length === 1) {
                                scoreInfo = d.Score;
                            } else {
                                const scores = d.Scores;
                                scoreInfo = solver.reduce((a, b, i) => `${a},${b}-${scores[i] || 0}`, '').slice(1);
                            }
                        }
                        return scoreInfo;
                    }
                },
                { "data": "Id", "title": "详情", "render": setRow.upServiceLog.bind(null, 0, !!name) },
                { "data": "FaultSolver", "title": "解决人" },
                { "data": "Name", "title": "指派给", "render": setRow.serviceName },
                { "data": "EstimatedTime", "title": "预计解决时间", "render": setRow.setTime },
                { "data": "Remark", "title": "维修备注", "render": setRow.remark },
                { "data": "Proposer", "title": "报修人" },
                { "data": "FaultTypeName1", "title": "故障类型" },
                { "data": "FaultDescription1", "title": "故障类型描述", "visible": false },
                { "data": "SolvePlan", "title": "解决方案", "visible": false },
                { "data": "FaultTypeName", "title": "报修故障类型", "visible": false },
                { "data": "FaultDescription", "title": "报修故障类型描述", "visible": false },
                { "data": "Supplement", "title": "故障补充", "render": setRow.remark },
                { "data": "Comment", "title": "评论", "visible": false },
                { "data": null, "title": "故障图片", "render": setRow.imgBtn }
            ],
            "drawCallback": function (settings, json) {
                if (per79 && !name) {
                    $(this).find('.isEnable').iCheck({
                        handle: 'checkbox',
                        checkboxClass: 'icheckbox_minimal-blue',
                        increaseArea: '20%'
                    }).on('ifChanged', function () {
                        var v = $(this).val();
                        var name = $(this).attr('fName');
                        if ($(this).is(':checked')) {
                            _serviceLogData.Id.push(v);
                            _serviceLogData.Name.push(name);
                        } else {
                            _serviceLogData.Id.splice(_serviceLogData.Id.indexOf(v), 1);
                            _serviceLogData.Name.splice(_serviceLogData.Name.indexOf(name), 1);
                        }
                    });
                }
            }
        });
    }

    if (!_statisticsDetailListTable) {
        const table = "#statisticsDetailList";
        $(table).closest(".table-responsive").addClass("hidden");

        _statisticsDetailListTable = $(table).DataTable({
            dom: '<"pull-left"l><"pull-right"B><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            buttons: [
                {
                    extend: 'excel',
                    text: '导出Excel',
                    className: 'btn-primary btn-sm',
                    exportOptions: {
                        columns: excelColumns,
                        format: {
                            body: (data, row, column, node) => titleColumns.indexOf(column) > -1 ?
                                $(node).find("span").attr("title") :
                                ((buttonColumns.indexOf(column) > -1 && node.textContent == buttonColumnsDefault[column]) ? "" : node.textContent)
                        }
                    }
                }
            ],
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": [],
            "aaSorting": [[per79 && !name ? 1 : 0, "asc"]],
            "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 20, //默认显示的记录数
            "columns": [
                { "data": null, "title": "", "render": setRow.serIsEnable, "visible": per79 && !name, "orderable": !per79 && name },
                { "data": null, "title": "序号", "render": setRow.order },
                { "data": "DeviceCode", "title": "机台号" },
                { "data": "FaultTime", "title": "故障时间", "render": setRow.setTime },
                { "data": "SolveTime", "title": "解决时间", "sClass": "text-primary", "render": setRow.setTime },
                { "data": "CostTime", "title": "用时", "sClass": "text-primary" },
                { "data": null, "title": "优先级", "render": setRow.priority },
                { "data": "Grade", "title": "故障等级", "render": setRow.grade },
                {
                    "data": null, "title": "评分", "sClass": "text-primary", render: (d, a, b, index) => {
                        let scoreInfo;
                        if (per78 && !(d.FaultSolvers.length === d.Scores.length)) {
                            scoreInfo = `<button class="btn btn-primary btn-sm" onclick="showScoreModel(${index.row})">评分</button>`;
                        } else {
                            const solver = d.FaultSolver.split(',');
                            if (solver.length === 1) {
                                scoreInfo = d.Score;
                            } else {
                                const scores = d.Scores;
                                scoreInfo = solver.reduce((a, b, i) => `${a},${b}-${scores[i] || 0}`, '').slice(1);
                            }
                        }
                        return scoreInfo;
                    }
                },
                { "data": "Id", "title": "详情", "render": setRow.upServiceLog.bind(null, 0, !!name) },
                { "data": "FaultSolver", "title": "解决人" },
                { "data": "Name", "title": "指派给", "render": setRow.serviceName },
                { "data": "EstimatedTime", "title": "预计解决时间", "render": setRow.setTime },
                { "data": "Remark", "title": "维修备注", "render": setRow.remark },
                { "data": "Proposer", "title": "报修人" },
                { "data": "FaultTypeName1", "title": "故障类型" },
                { "data": "FaultDescription1", "title": "故障类型描述", "visible": false },
                { "data": "SolvePlan", "title": "解决方案", "visible": false },
                { "data": "FaultTypeName", "title": "报修故障类型", "visible": false },
                { "data": "FaultDescription", "title": "报修故障类型描述", "visible": false },
                { "data": "Supplement", "title": "故障补充", "render": setRow.remark },
                { "data": "Comment", "title": "评论", "visible": false },
                { "data": null, "title": "故障图片", "render": setRow.imgBtn }
            ],
            "drawCallback": function (settings, json) {
                if (per79 && !name) {
                    $(this).find('.isEnable').iCheck({
                        handle: 'checkbox',
                        checkboxClass: 'icheckbox_minimal-blue',
                        increaseArea: '20%'
                    }).on('ifChanged', function () {
                        var v = $(this).val();
                        var name = $(this).attr('fName');
                        if ($(this).is(':checked')) {
                            _serviceLogData.Id.push(v);
                            _serviceLogData.Name.push(name);
                        } else {
                            _serviceLogData.Id.splice(_serviceLogData.Id.indexOf(v), 1);
                            _serviceLogData.Name.splice(_serviceLogData.Name.indexOf(name), 1);
                        }
                    });
                }
            }
        });
    }

    if (!_delFaultDeviceListTable) {
        const table = "#delFaultDeviceList";
        $(table).closest(".table-responsive").addClass("hidden");

        _delFaultDeviceListTable = $(table).DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            "destroy": true,
            "paging": true,
            "searching": true,
            "autoWidth": true,
            "language": oLanguage,
            "data": [],
            "aaSorting": [[1, "asc"]],
            "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 20, //默认显示的记录数
            "columns": [
                { "data": null, "title": "", "render": setRow.isEnable, "orderable": false, "visible": false },
                { "data": null, "title": "序号", "render": setRow.order },
                { "data": "DeviceCode", "title": "机台号" },
                { "data": "FaultTime", "title": "故障时间", "render": setRow.setTime },
                { "data": null, "title": "优先级", "render": setRow.priority },
                { "data": "Grade", "title": "故障等级", "render": setRow.grade },
                { "data": null, "title": "状态", "render": setRow.rState },
                { "data": "Name", "title": "指派给", "render": setRow.serviceName },
                { "data": "Phone", "title": "联系方式" },
                { "data": "Remark", "title": "维修备注", "render": setRow.remark },
                { "data": "EstimatedTime", "title": "预计解决时间", "render": setRow.setTime },
                { "data": "FaultTypeName", "title": "故障类型" },
                { "data": null, "title": "故障描述", "render": setRow.rDesc },
                { "data": null, "title": "故障图片", "render": setRow.imgBtn }
            ],
            "drawCallback": function (settings, json) {
                $(this).find('.isEnable').iCheck({
                    handle: 'checkbox',
                    checkboxClass: 'icheckbox_minimal-blue',
                    increaseArea: '20%'
                }).on('ifChanged', function () {
                    var v = $(this).val();
                    var name = $(this).attr('fName');
                    if ($(this).is(':checked')) {
                        _delFaultDevData.Id.push(v);
                        _delFaultDevData.Name.push(name);
                    } else {
                        _delFaultDevData.Id.splice(_delFaultDevData.Id.indexOf(v), 1);
                        _delFaultDevData.Name.splice(_delFaultDevData.Name.indexOf(name), 1);
                    }
                });
            }
        });
    }

    if (!_delRepairListTable) {
        const table = "#delRepairList";
        $(table).closest(".table-responsive").addClass("hidden");

        _delRepairListTable = $(table).DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": [],
            "aaSorting": [[1, "asc"]],
            "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 20, //默认显示的记录数
            "columns": [
                { "data": null, "title": "", "render": setRow.serIsEnable, "orderable": false, "visible": false },
                { "data": null, "title": "序号", "render": setRow.order },
                { "data": "DeviceCode", "title": "机台号" },
                { "data": "FaultTime", "title": "故障时间", "render": setRow.setTime },
                { "data": "SolveTime", "title": "解决时间", "sClass": "text-primary", "render": setRow.setTime },
                { "data": "CostTime", "title": "用时", "sClass": "text-primary" },
                { "data": null, "title": "优先级", "render": setRow.priority },
                { "data": "Grade", "title": "故障等级", "render": setRow.grade },
                { "data": "Score", "title": "评分", "sClass": "text-primary" },
                { "data": "FaultSolver", "title": "解决人" },
                { "data": "Name", "title": "指派给", "render": setRow.serviceName() },
                { "data": "EstimatedTime", "title": "预计解决时间", "render": setRow.setTime },
                { "data": "Remark", "title": "维修备注", "render": setRow.remark },
                { "data": "Proposer", "title": "报修人" },
                { "data": "FaultTypeName", "title": "故障类型" },
                { "data": null, "title": "故障描述", "render": setRow.rDesc },
                { "data": null, "title": "故障图片", "render": setRow.imgBtn },
                { "data": "Id", "title": "详情", "render": setRow.upServiceLog.bind(null, 1, false) }
            ],
            "drawCallback": function (settings, json) {
                $(this).find('.isEnable').iCheck({
                    handle: 'checkbox',
                    checkboxClass: 'icheckbox_minimal-blue',
                    increaseArea: '20%'
                }).on('ifChanged', function () {
                    var v = $(this).val();
                    var name = $(this).attr('fName');
                    if ($(this).is(':checked')) {
                        _delServiceLogData.Id.push(v);
                        _delServiceLogData.Name.push(name);
                    } else {
                        _delServiceLogData.Id.splice(_delServiceLogData.Id.indexOf(v), 1);
                        _delServiceLogData.Name.splice(_delServiceLogData.Name.indexOf(name), 1);
                    }
                });
            }
        });
    }
}
let _faultDeviceListTable = null;
let _repairRecordListTable = null;
let _statisticsDetailListTable = null;
let _delFaultDeviceListTable = null;
let _delRepairListTable = null;

//查询条件
function setFaultDeviceGet(parentEl, attrEl, el, ops, all = true) {
    $(`${parentEl} .${attrEl}`).addClass('hidden');
    $(el).removeClass('hidden');
    if (ops) {
        $(`#${attrEl}`).empty();
        if (all)
            $(`#${attrEl}`).append(`<option value="-1">所有</option>${ops}`);
        else
            $(`#${attrEl}`).append(ops);
    }
}

//优先级
var _priority = '<option value="0">低</option><option value="1">中</option><option value="2">高</option>';

//故障等级
var _grade = '<option value="0">小修</option><option value="1">大修</option>';

var _worker = null;
var _workerName = null;
//维修工选项
function getWorkerSelect() {
    var data = {}
    data.opType = 430;
    data.opData = JSON.stringify({
        menu: true
    });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var op = '<option value="{0}" wname="{1}" phone="{2}">{1}</option>';
        _worker = ret.datas.reduce((total, d) => `${total}${op.format(d.Account, d.Name, d.Phone)}`, '');
        _workerName = ret.datas.reduce((total, d) => `${total}${op.format(d.Name, d.Name, d.Phone)}`, '');
        $('#designateName,#servicePro').empty().append(_worker);
    }, 0);
}

var _faultType = null;
var _faultTypeData = null;
//故障类型选项
function getFaultTypeSelect() {
    var data = {}
    data.opType = 406;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#serviceFaultType').empty();
        var list = ret.datas;
        var op = '<option value="{0}">{1}</option>';
        _faultType = '';
        _faultTypeData = {};
        for (var i = 0, len = list.length; i < len; i++) {
            var d = list[i];
            _faultTypeData[d.Id] = d;
            _faultType += op.format(d.Id, d.FaultTypeName);
        }
        $('#serviceFaultType').append(_faultType);
    }, 0);
}

//列表参数设置
function setTable() {
    return {
        isEnable: d => `<input type="checkbox" class="icb_minimal isEnable" value=${d.Id} fName=${d.DeviceCode}>`,
        order: (a, b, c, d) => d.row + 1,
        grade: d => d ? '<span class="text-red">大修</span>' : '小修',
        setTime: d => d == '0001-01-01 00:00:00' ? '' : d.slice(0, d.lastIndexOf(':')),
        rState: d => d.State == 0 ? '<span class="text-red">未确认</span>' : d.State == 1 ? '<span class="text-warning">已确认</span>' : '<span class="text-success">维修中</span>',
        priority: d => d.Priority == 0 ? '低' : d.Priority == 1 ? '<span class="text-warning">中</span>' : '<span class="text-red">高</span>',
        remark: d => d == '' || d.length < tdShowLength ? d : `<span title = "${d}" class="pointer" onclick="showAllContent('${escape(d)}', '维修备注')">${d.substring(0, tdShowLength) + "..."}</span>`,
        rDesc: d => {
            var data = d.FaultDescription;
            return `<span title = "${data}" onclick = "showFaultTypeDetailModel(${d.FaultTypeId}, '${escape(data.trim())}')">${data.length > tdShowLength ? data.substring(0, tdShowLength) + '...' : data}</span>`;
        },
        rSup: d => {
            var data = d.Supplement;
            return `<span title = "${data}" onclick = "showFaultTypeDetailModel(${d.FaultTypeId}, '${escape(data.trim())}')">${data.length > tdShowLength ? data.substring(0, tdShowLength) + '...' : data}</span>`;
        },
        imgBtn: d => {
            var op = `<span class="glyphicon glyphicon-{0}" aria-hidden="true" style="color:{1};font-size:25px;vertical-align:middle;margin-right:5px"></span>
                      <button type="button" class="btn btn-info btn-sm" style="vertical-align:middle" onclick="showImgModel(\'${escape(d.FaultTypeName)}\',\'${escape(d.ImageList)}\')">查看</button>`;
            return d.ImageList.length ? op.format('ok', 'green') : op.format('remove', 'red');
        },
        serIsEnable: d => {
            var text = `机台号-${d.DeviceCode}：${d.FaultTypeName}`;
            return `<input type="checkbox" class="icb_minimal isEnable" value=${d.Id} fName=${text}>`;
        },
        upServiceLog: (isLook, isStatistics, id) => `<button type="button" class="btn btn-primary btn-sm" onclick="showServiceLogModal(${id},${isLook},${isStatistics})">查看</button>`,
        serviceName: d => d == '' ? '未指派' : d,
        detailBtn: d => `<button type="button" class="btn btn-info btn-sm" onclick="showLogDetailModel(${d.FaultTypeId},\'${d.DeviceCode}\',\'${d.Proposer}\',\'${d.FaultTime}\',\'${escape(d.Supplement)}\',${d.Priority},${d.Grade},\'${d.ImageList}\')">查看</button>`
    }
}

var _faultDevData = null;
//故障设备查询
function getFaultDeviceList() {
    _faultDevData = {};
    _faultDevData.Id = [];
    _faultDevData.Name = [];
    _faultDevData.data = {};
    var startTime = $('#faultSTime').val();
    var endTime = $('#faultETime').val();
    if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
        layer.msg('请选择故障时间');
        return;
    }
    if (comTimeDay(startTime, endTime)) {
        return;
    }
    startTime = `${startTime} 00:00:00`;
    endTime = `${endTime} 23:59:59`;
    var condition = $('#faultDeviceCond').val();
    var list = { startTime, endTime, condition }
    var faultDevicePro = $('#faultDevicePro').val();
    var faultDeviceAttr;
    switch (faultDevicePro) {
        case 'code':
            faultDeviceAttr = $('#faultDeviceInput').val().trim();
            if (!isStrEmptyOrUndefined(faultDeviceAttr)) {
                list[faultDevicePro] = faultDeviceAttr;
            }
            break;
        case 'solveTime':
            var solveSTime = $('#solveSTime').val();
            if (!isStrEmptyOrUndefined(solveSTime)) {
                list.eStartTime = solveSTime;
            }
            var solveETime = $('#solveETime').val();
            if (!isStrEmptyOrUndefined(solveETime)) {
                list.eEndTime = solveETime;
            }
            break;
        default:
            faultDeviceAttr = $('#faultDeviceAttr').val();
            if (!isStrEmptyOrUndefined(faultDeviceAttr)) {
                list[faultDevicePro] = faultDeviceAttr;
            }
    }
    var data = {}
    data.opType = 417;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var rData = ret.datas;
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            _faultDevData.data[d.Id] = d;
        }
        updateTable(_faultDeviceListTable, rData);
        $("#faultDeviceList").closest(".table-responsive").removeClass("hidden");
    });
}

var _batchAssignTable = null;
//批量指派弹窗
function showBatchAssignModal() {
    var faultIds = _faultDevData.Id;
    var len = faultIds.length;
    if (!len) {
        layer.msg('请选择需要指派的故障设备');
        return;
    }
    var rData = [];
    for (var i = 0; i < len; i++) {
        rData.push(_faultDevData.data[faultIds[i]]);
    }
    var priority = function () {
        return `<div style="width:100%;min-width:80px;margin:auto"><select class="form-control priority" style="width: 100%">${_priority}</select></div>`;
    }
    var grade = function () {
        return `<div style="width:100%;min-width:80px;margin:auto"><select class="form-control grade" style="width: 100%">${_grade}</select></div>`;
    }
    var serviceName = function (a, b, c, d) {
        return `<div style="width:100%;min-width:120px;margin:auto"><select class="form-control serviceName" style="width: 100%" multiple="multiple">${d.row == 0 ? '' : '<option value="同上">同上</option>'}${_worker}</select></div>`;
    }
    _batchAssignTable = $("#batchAssignList")
        .DataTable({
            dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
            "destroy": true,
            "paging": true,
            "searching": true,
            "language": oLanguage,
            "data": rData,
            "aaSorting": [[0, "asc"]],
            "ordering": false,
            "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
            "iDisplayLength": 20, //默认显示的记录数
            "columns": [
                { "data": null, "title": "序号", "render": setRow.order },
                { "data": "DeviceCode", "title": "机台号" },
                { "data": "FaultTime", "title": "故障时间", "render": setRow.setTime },
                { "data": null, "title": "状态", "render": setRow.rState },
                { "data": null, "title": "优先级", "render": priority },
                { "data": null, "title": "故障等级", "render": grade },
                { "data": null, "title": "指派给", "render": serviceName },
                { "data": "Phone", "title": "联系方式" },
                { "data": "Proposer", "title": "报修人" },
                { "data": "FaultTypeName", "title": "故障类型" },
                { "data": null, "title": "故障描述", "render": setRow.rDesc },
                { "data": null, "title": "故障详情", "render": setRow.detailBtn }
            ],
            "createdRow": function (row, d) {
                $(row).find('.priority').val(d.Priority).end().find('.grade').val(d.Grade).end().find('.serviceName').select2({
                    allowClear: true,
                    placeholder: '请选择',
                    matcher
                }).val(d.Maintainers).trigger('change');
            }
        });
    $('#showBatchAssignModal').modal('show');
}

//批量指派
function batchAssign() {
    var trsData = _batchAssignTable.context[0].aoData;
    var trs = trsData.length;
    var list = [];
    for (var i = 0; i < trs; i++) {
        var tr = trsData[i].nTr;
        var priority = $(tr).find('.priority').val();
        var grade = $(tr).find('.grade').val();
        var serviceName = $(tr).find('.serviceName').val() || [];
        list.push({
            Id: _faultDevData.Id[i] >> 0,
            Maintainer: serviceName.join(),
            Priority: priority >> 0,
            Grade: grade >> 0
        });
    }
    var data = {}
    data.opType = 446;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            $('#showBatchAssignModal').modal('hide');
            getFaultDeviceList();
        }
    });
}

//确认故障/开始维修弹窗
function showConfirmModel(id, state, time, remark) {
    $('#confirmTitle').text(state ? '开始维修' : '确认故障');
    if (state) {
        $('#confirmTitle').text('开始维修');
        $('#confirmFaultBtn').addClass('hidden');
        $('#confirmStartBtn').val(id);
    } else {
        $('#confirmTitle').text('确认故障');
        $('#confirmFaultBtn').removeClass('hidden');
        $('#confirmFaultBtn,#confirmStartBtn').val(id);
    }
    time = time == '0001-01-01 00:00:00' ? getDate() : time.slice(0, time.indexOf(' '));
    $('#confirmTime').val(time).datepicker('update');
    $("#confirmHms").timepicker('setTime', getTime());
    $('#confirmDesc').val(remark);
    $('#showConfirmModel').modal('show');
}

//确认故障/开始维修
function confirmFault(state) {
    var id = $(this).val();
    var confirmTime = $('#confirmTime').val();
    var confirmHms = $('#confirmHms').val();
    if (isStrEmptyOrUndefined(confirmTime) || isStrEmptyOrUndefined(confirmHms)) {
        layer.msg("请选择预计解决时间");
        return;
    }
    var time = `${confirmTime} ${confirmHms}`;
    var remark = $('#confirmDesc').val();
    var data = {};
    data.opType = 444;
    data.opData = JSON.stringify([{
        Id: id,
        EstimatedTime: time,
        Remark: remark,
        State: state
    }]);
    ajaxPost("/Relay/Post", data, function (ret) {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            $('#showConfirmModel').modal('hide');
            getFaultDeviceList();
        }
    });
}

//维修完成弹窗
function showServiceModel(id, maintainer, time, faultTypeId) {
    $('#serviceBtn').val(id);
    maintainer = maintainer.split(',');
    $('#servicePro').val(maintainer).trigger('change');
    time = time == '0001-01-01 00:00:00' ? getDate() : time.slice(0, time.indexOf(' '));
    $('#serviceTime').val(time).datepicker('update');
    $("#serviceHms").timepicker('setTime', getTime());
    $('#serviceFaultType').val(faultTypeId).trigger('change');
    $('#serviceDesc').val('');
    $('#showServiceModel').modal('show');
}

//维修完成
function service() {
    var id = $(this).val();
    var maintainer = Array.from($('#servicePro :selected')).map(item => $(item).text()).join();
    if (isStrEmptyOrUndefined(maintainer)) {
        layer.msg("请选择解决人");
        return;
    }
    var serviceTime = $('#serviceTime').val();
    var serviceHms = $('#serviceHms').val();
    if (isStrEmptyOrUndefined(serviceTime) || isStrEmptyOrUndefined(serviceHms)) {
        layer.msg("请选择解决时间");
        return;
    }
    var time = `${serviceTime} ${serviceHms}`;
    var faultTypeId = $('#serviceFaultType').val();
    if (isStrEmptyOrUndefined(faultTypeId)) {
        layer.msg("请选择故障类型");
        return;
    }
    var solvePlan = $('#serviceDesc').val();
    var data = {};
    data.opType = 444;
    data.opData = JSON.stringify([{
        FaultSolver: maintainer,
        SolveTime: time,
        SolvePlan: solvePlan,
        FaultTypeId1: faultTypeId,
        State: 3,
        Id: id
    }]);
    ajaxPost("/Relay/Post", data, function (ret) {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            $('#showServiceModel').modal('hide');
            getFaultDeviceList();
        }
    });
}

//指派弹窗
function showDesignateModal(id, priority, name, grade) {
    $('#designateBtn').val(id);
    name = name.split(',');
    $('#designateName').val(name).trigger('change');
    $('#designatePro').val(priority);
    $('#designateGrade').val(grade);
    $('#showDesignateModal').modal('show');
}

//指派
function designate() {
    var name = $('#designateName').val();
    if (isStrEmptyOrUndefined(name)) {
        layer.msg("请选择指派人");
        return;
    }
    var priority = $('#designatePro').val();
    if (isStrEmptyOrUndefined(priority)) {
        layer.msg("请选择优先级");
        return;
    }

    var grade = $('#designateGrade').val();
    if (isStrEmptyOrUndefined(grade)) {
        layer.msg("请选择故障等级");
        return;
    }
    var id = $(this).val();
    var data = {}
    data.opType = 445;
    data.opData = JSON.stringify([{
        Id: id >> 0,
        Maintainer: name.join(),
        Priority: priority >> 0,
        Grade: grade >> 0
    }]);
    ajaxPost("/Relay/Post", data,
        function (ret) {
            layer.msg(ret.errmsg);
            if (ret.errno == 0) {
                $('#showDesignateModal').modal('hide');
                getFaultDeviceList();
            }
        });
}

//故障详情弹窗
function showLogDetailModel(id, deviceCode, proposer, faultTime, faultDescription, priority, grade, img) {
    var data = {}
    data.opType = 406;
    data.opData = JSON.stringify({
        qId: id,
        menu: true
    });
    getImg('#faultDetailImgList', img);
    ajaxPost('/Relay/Post', data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var d = ret.datas[0];
        $('#logDevName').text(deviceCode);
        $('#logPerson').text(proposer);
        $('#logFaultTime').text(faultTime);
        $('#logFaultType').text(d.FaultTypeName);
        $('#logFaultTypeDesc').val(d.FaultDescription);
        faultDescription = unescape(faultDescription);
        $('#logFaultSup').val(faultDescription);
        var str = '', color = '';
        switch (priority) {
            case 0:
                str = '低';
                color = 'black';
                break;
            case 1:
                str = '中';
                color = '#CC6600';
                break;
            case 2:
                str = '高';
                color = 'red';
                break;
        }
        $('#logPriority').text(str).css('color', color);
        $('#logGrade').text(grade == 0 ? '小修' : '大修').css('color', grade == 0 ? 'black' : 'red');
        $('#showLogDetailModel').modal('show');
    });
}

//删除故障设备
function delChange() {
    if (!_faultDevData.Id.length) {
        layer.msg("请选择需要删除的数据");
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = 423;
        data.opData = JSON.stringify({
            ids: _faultDevData.Id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFaultDeviceList();
                }
            });
    }
    showConfirm(`删除以下故障设备：<pre style='color:red'>${_faultDevData.Name.join('<br>')}</pre>`, doSth);
}

var _serviceLogData = null;
var _statisticsParData = null;
//获取维修记录
function getServiceLogList(isLoad, name, sTime, eTime, score) {
    var list = null;
    if (name) {
        list = {
            startTime: sTime,
            endTime: eTime,
            condition: 0,
            maintainer: name
        }
        _statisticsParData = { name, sTime, eTime, score };
    } else {
        _serviceLogData = {};
        _serviceLogData.Id = [];
        _serviceLogData.Name = [];
        var startTime = $('#serviceLogSTime').val();
        var endTime = $('#serviceLogETime').val();
        if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
            layer.msg('请选择解决时间');
            return;
        }
        if (comTimeDay(startTime, endTime)) {
            return;
        }
        startTime = `${startTime} 00:00:00`;
        endTime = `${endTime} 23:59:59`;
        var condition = $('#serviceLogCond').val();
        list = { startTime, endTime, condition }
        var serviceLogPro = $('#serviceLogPro').val();
        var serviceAttr;
        switch (serviceLogPro) {
            case 'code':
                serviceAttr = $('#serviceInput').val().trim();
                if (!isStrEmptyOrUndefined(serviceAttr)) {
                    list[serviceLogPro] = serviceAttr;
                }
                break;
            case 'faultTime':
                var serSTime = $('#serSTime').val();
                if (!isStrEmptyOrUndefined(serSTime)) {
                    list.fStartTime = serSTime;
                }
                var serETime = $('#serETime').val();
                if (!isStrEmptyOrUndefined(serETime)) {
                    list.fEndTime = serETime;
                }
                break;
            case 'solveTime':
                var serSTime1 = $('#serSTime').val();
                if (!isStrEmptyOrUndefined(serSTime1)) {
                    list.eStartTime = serSTime1;
                }
                var serETime1 = $('#serETime').val();
                if (!isStrEmptyOrUndefined(serETime1)) {
                    list.eEndTime = serETime1;
                }
                break;
            default:
                serviceAttr = $('#serviceAttr').val();
                if (!isStrEmptyOrUndefined(serviceAttr)) {
                    list[serviceLogPro] = serviceAttr;
                }
        }
    }
    var data = {}
    data.opType = 412;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var el;
        if (name) {
            updateTable(_statisticsDetailListTable, ret.datas);
            $("#statisticsDetailList").closest(".table-responsive").removeClass("hidden");
        }
        else {
            updateTable(_repairRecordListTable, ret.datas);
            $("#repairRecordList").closest(".table-responsive").removeClass("hidden");
        }
        if (name) {
            $('#score').text(score);
            $('#showStatisticsDetailModel').modal('show');
        }
    }, isLoad);
}

//评分弹窗
function showScoreModel(index) {
    const d = $('#repairRecordList').DataTable().row(index).data();
    $('#updateScoreBtn').val(d.Id);
    const solver = d.FaultSolver.split(',');
    const scores = d.Scores;
    const data = solver.map((item, i) => ({ name: item, score: scores[i] }));
    const scoreInput = d => `<input type="text" class="form-control text-center score" style="min-width:100px" oninput="onInput(this, 3, 0)" value=${d || ''}>`;
    $('#scoreList').DataTable({
        dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
        destroy: true,
        paging: true,
        searching: true,
        language: oLanguage,
        data,
        aaSorting: [[0, 'asc']],
        aLengthMenu: [20, 40, 60],
        iDisplayLength: 20,
        columns: [
            { data: null, title: '序号', render: (a, b, c, d) => d.row + 1 },
            { data: 'name', title: '维修工' },
            { data: 'score', title: '评分', render: scoreInput }
        ]
    });
    $('#showScoreModel').modal('show');
}

//修改评分
function updateScore() {
    const tableInfo = $('#scoreList').DataTable();
    const len = tableInfo.data().length;
    const arr = [];
    for (let i = 0; i < len; i++) {
        const tr = tableInfo.row(i).nodes()[0];
        const score = $(tr).find('.score').val().trim();
        if (isStrEmptyOrUndefined(score)) {
            layer.msg(`序号${i + 1}：评分不能为空`);
            return;
        }
        arr.push(score);
    }
    var data = {};
    data.opType = 440;
    data.opData = JSON.stringify([{
        Id: $(this).val(),
        Score: arr.join()
    }]);
    ajaxPost("/Relay/Post", data, function (ret) {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            $('#showScoreModel').modal('hide');
            $('#showStatisticsDetailModel').is(':hidden')
                ? getServiceLogList(1)
                : getServiceLogList(1, _statisticsParData.name,
                    _statisticsParData.sTime,
                    _statisticsParData.eTime,
                    _statisticsParData.score);
        }
    });
}

//统计弹窗
function showStatisticsModel() {
    getStatisticsList();
    $('#showStatisticsModel').modal('show');
}

//获取统计列表
function getStatisticsList() {
    var startTime = $('#statSTime').val();
    var endTime = $('#statETime').val();
    if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
        layer.msg('请选择解决时间');
        return;
    }
    if (comTimeDay(startTime, endTime)) {
        return;
    }
    startTime = `${startTime} 00:00:00`;
    endTime = `${endTime} 23:59:59`;
    var data = {}
    data.opType = 447;
    data.opData = JSON.stringify({ startTime, endTime });
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var order = function (a, b, c, d) {
            return d.row + 1;
        }
        var detail = function (d) {
            return `<button type="button" class="btn btn-primary btn-sm" onclick="getServiceLogList(1,\'${d.Name}\',\'${startTime}\',\'${endTime}\',\'${d.Score}\')">查看</button>`;
        }
        $("#statisticsList")
            .DataTable({
                dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                "destroy": true,
                "paging": true,
                "searching": true,
                "language": oLanguage,
                "data": ret.datas,
                "aaSorting": [[0, "asc"]],
                "aLengthMenu": [20, 40, 60], //更改显示记录数选项  
                "iDisplayLength": 20, //默认显示的记录数
                "columns": [
                    { "data": null, "title": "序号", "render": order },
                    { "data": "Name", "title": "维修工" },
                    { "data": "Score", "title": "评分" },
                    { "data": null, "title": "详情", "render": detail }
                ]
            });
    });
}

//获取图片
function getImg(el, img) {
    $(el).empty();
    if (!isStrEmptyOrUndefined(img)) {
        img = img.split(",");
        var data = {
            type: fileEnum.FaultDevice,
            files: JSON.stringify(img)
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
        getFilePath(data, paths => {
            const pLen = paths.length;
            if (pLen <= 0)
                return;
            var imgOps = '';
            for (var i = 0; i < pLen; i++) {
                imgOps +=
                    `<div class="col-lg-2 col-md-3 col-sm-4 col-xs-6">
                        <div class="thumbnail">
                        <img src=${paths[i].path} style="height:200px" onclick=showBigImg(\'${escape(paths[i].path)}\')>
                        </div>
                    </div>`;
            }
            $(el).append(imgOps);
        });
    }
}

//故障图片查看
function showImgModel(faultType, img) {
    faultType = unescape(faultType);
    img = unescape(img);
    $('#FaultImgName').text(faultType);
    getImg('#faultImgList', img);
    $("#showFaultImgModel").modal('show');
}

//删除维修记录
function delServiceLog() {
    if (!_serviceLogData.Id.length) {
        layer.msg("请选择需要删除的数据");
        return;
    }
    var doSth = function () {
        var data = {}
        data.opType = 416;
        data.opData = JSON.stringify({
            ids: _serviceLogData.Id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getServiceLogList(1);
                }
            });
    }
    showConfirm(`删除以下维修记录：<pre style='color:red'>${_serviceLogData.Name.join('<br>')}</pre>`, doSth);
}

//获取机台号
function getDeviceCode(resolve) {
    var data = {}
    data.opType = 100;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        list.sort((a, b) => a.Code - b.Code);
        var op = '<option value="{0}" admin="{2}">{1}</option>';
        var ops = '';
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            ops += op.format(d.Id, d.Code, d.Administrator);
        }
        if (resolve != null) {
            resolve(ops);
        }
    }, 0);
}

//获取车间
function getWorkShop(resolve) {
    var data = {}
    data.opType = 162;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        var list = ret.datas;
        var op = '<option value = "{0}">{0}</option>';
        var ops = '';
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            ops += op.format(d.SiteName);
        }
        if (resolve != null) {
            resolve(ops);
        }
    }, 0);
}

var _siteData = null;
//获取场地
function getSite(workEl, siteEl) {
    var data = {}
    data.opType = 125;
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        _siteData = {};
        var rData = ret.datas;
        for (var i = 0, len = rData.length; i < len; i++) {
            var d = rData[i];
            _siteData[d.SiteName]
                ? _siteData[d.SiteName].push(d.RegionDescription)
                : _siteData[d.SiteName] = [d.RegionDescription];
        }
        setWorkSiteSelect(workEl, siteEl);
    }, 0);
}

//车间对应场地
function setWorkSiteSelect(workEl, siteEl) {
    $(siteEl).empty();
    var workshop = $(workEl).val();
    if (isStrEmptyOrUndefined(workshop)) {
        return;
    }
    var sData = _siteData[workshop];
    var ops = '';
    for (var i = 0, len = sData.length; i < len; i++) {
        var d = sData[i];
        ops += `<option value=${d}>${d}</option>`;
    }
    $(siteEl).append(ops);
    $(siteEl).val('').trigger('change');
}

//添加修改维修记录弹窗
function showServiceLogModal(id, isDel, isStatistics) {
    var opType = id ? isDel ? 425 : 412 : 415;
    $('#serLogFaultSup').prop('disabled', !!id);
    $('#serviceLogTitle').text(id ? '维修记录详情' : '添加维修记录');
    if (id) {
        $('#showServiceLogModal .isText').removeClass('hidden');
        $('#showServiceLogModal .evaluate').removeClass('hidden');
        $('#showServiceLogModal .noText').addClass('hidden');
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify({ qId: id });
        ajaxPost("/Relay/Post", data, function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var d = ret.datas[0];
            if (isStrEmptyOrUndefined(d.Comment)) {
                $('#showServiceLogModal .evaluate').eq(1).addClass('hidden');
            }
            $('#serLogCodeText').text(d.DeviceCode);
            $('#serLogProposerText').text(d.Proposer);
            $('#serLogFaultTimeText').text(d.FaultTime);
            $('#serLogFaultTypeText').text(d.FaultTypeName);
            $('#serLogFaultDesc').val(_faultTypeData[d.FaultTypeId].FaultDescription);
            $('#serLogFaultSup').val(d.Supplement);
            $('#serLogScore').text(d.Score);
            $('#serLogComment').val(d.Comment);
            var priority = d.Priority;
            var str = '', color = '';
            switch (priority) {
                case 0:
                    str = '低';
                    color = 'black';
                    break;
                case 1:
                    str = '中';
                    color = '#CC6600';
                    break;
                case 2:
                    str = '高';
                    color = 'red';
                    break;
            }
            $('#serLogPriorityText').text(str).css('color', color);
            var grade = d.Grade;
            $('#serLogGradeText').text(grade == 0 ? '小修' : '大修').css('color', grade == 0 ? 'black' : 'red');
            $('#serLogMaintainerText').text(d.Name == '' ? '未指派' : d.Name);
            var solveTime = d.SolveTime;
            $("#serLogFaultType1").empty();
            $("#serLogFaultType1").append(_faultType);
            if (isDel || isStatistics) {
                $('#upServiceLogBox .isText').removeClass('hidden');
                $('#upServiceLogBox .noText').addClass('hidden');
                $('#serLogFaultSolverText').text(d.FaultSolver);
                $('#serLogSolveTimeText').text(solveTime == '0001-01-01 00:00:00' ? '' : solveTime.slice(0, solveTime.lastIndexOf(':')));
                var faultType1 = $(`#serLogFaultType1 option[value=${d.FaultTypeId1}]`).text();
                $('#serLogFaultType1Text').text(faultType1);
                $("#serLogSolvePlan").prop('disabled', true);
                $('#updateServiceLogBtn').addClass('hidden');
            } else {
                $('#upServiceLogBox .isText').addClass('hidden');
                $('#upServiceLogBox .noText').removeClass('hidden');
                $('#serLogFaultSolver').empty().append(_worker);
                let solver = d.FaultSolver.split(',');
                const solver1 = [];
                $('#serLogFaultSolver option').each((i, el) => void (solver.includes($(el).attr('wname')) && solver1.push($(el).val())));
                $('#serLogFaultSolver').val(solver1).trigger('change');
                if (solveTime == '0001-01-01 00:00:00') {
                    $('#serLogSolveDate').val(getDate()).datepicker('update');
                    $("#serLogSolveTime").timepicker('setTime', getTime());
                } else {
                    $('#serLogSolveDate').val(solveTime.split(' ')[0]).datepicker('update');
                    $("#serLogSolveTime").timepicker('setTime', solveTime.split(' ')[1]);
                }
                $("#serLogFaultType1").val(d.FaultTypeId1).trigger('change');
                if (_permissionList[78].have) {
                    $('#updateServiceLogBtn').removeClass('hidden');
                    $('#updateServiceLogBtn').val(id);
                    $("#serLogSolvePlan").prop('disabled', false);
                } else {
                    $('#updateServiceLogBtn').addClass('hidden');
                    $("#serLogSolvePlan").prop('disabled', true);
                }
            }
            $("#serLogSolvePlan").val(d.SolvePlan);
        });
    } else {
        $('#updateServiceLogBtn').addClass('hidden');
        $('#showServiceLogModal .isText').addClass('hidden');
        $('#showServiceLogModal .evaluate').addClass('hidden');
        $('#showServiceLogModal .noText').removeClass('hidden');
        $("#serLogSolvePlan").prop('disabled', false);
        $('#serLogCodeOther,#serLogFaultSup,#serLogSolvePlan').val('');
        $('#serLogPriority').val(0);
        $('#serLogGrade').val(0);
        $('#serLogProposer').val(getCookieTokenInfo().name);
        $('#serLogFaultDate,#serLogSolveDate').val(getDate()).datepicker('update');
        $("#serLogFaultTime,#serLogSolveTime").timepicker('setTime', getTime());
        $("#serLogFaultType,#serLogFaultType1,#serLogMaintainer,#serLogFaultSolver").empty();
        $("#serLogFaultType,#serLogFaultType1").append(_faultType);
        $("#serLogMaintainer,#serLogFaultSolver").append(_worker);
        var v = $('#serLogFaultType').val();
        $("#serLogFaultDesc").val(_faultTypeData[v].FaultDescription);
        var deviceCode = new Promise(resolve => getDeviceCode(resolve));
        var workShop = new Promise(resolve => getWorkShop(resolve));
        Promise.all([deviceCode, workShop]).then(e => {
            $("#serLogCode,#serLogWorkshop").empty();
            $("#serLogCode").append(e[0]);
            $("#serLogCode").val(0).trigger('change');
            $("#serLogCode").select2({
                allowClear: true,
                placeholder: "请选择"
            });
            $("#serLogWorkshop").append(e[1]);
            getSite('#serLogWorkshop', '#serLogDevSite');
        });
    }
    $('#showServiceLogModal').modal('show');
}

//故障报修弹窗
var _updateFirmwareUpload = null;
function showFaultModel() {
    var deviceCode = new Promise(resolve => getDeviceCode(resolve));
    var workShop = new Promise(resolve => getWorkShop(resolve));
    Promise.all([deviceCode, workShop]).then(e => {
        $("#faultCode,#workshop").empty();
        $("#faultCode").append(e[0]);
        $("#faultCode").val("").trigger("change");
        $("#workshop").append(e[1]);
        getSite('#workshop', '#devSite');
    });
    $('#faultType').empty().append(_faultType).trigger('change');
    $("#faultOther").val("");
    $("#proposer").val(getCookieTokenInfo().name);
    $("#faultDate").val(getDate()).datepicker('update');
    $("#faultTime").val(getTime()).timepicker('setTime', getTime());
    if (_updateFirmwareUpload == null) {
        _updateFirmwareUpload = initFileInputMultiple("addImg", fileEnum.FaultDevice);
    }
    $("#addImg").fileinput('clear');
    $('#addImgBox').find('.file-caption-name').attr('readonly', true).attr('placeholder', '请选择图片...');
    $("#faultDesc").val("");
    $("#faultModel").modal("show");
}

//故障上报
function reportFault() {
    var faultCode = $("#faultCode").val();
    var faultOther = $("#faultOther").val().trim();
    if (isStrEmptyOrUndefined(faultCode) && isStrEmptyOrUndefined(faultOther)) {
        layer.msg('请选择或输入设备');
        return;
    }
    var i, len;
    //机台号
    if (!isStrEmptyOrUndefined(faultCode) && !isStrEmptyOrUndefined(faultOther)) {
        for (i = 0, len = faultCode.length; i < len; i++) {
            if (faultOther == faultCode[i]) {
                layer.msg('其他机台号已选择，请重新输入');
                return;
            }
        }
    }
    if (!isStrEmptyOrUndefined(faultOther)) {
        var workshop = $('#workshop').val();
        if (isStrEmptyOrUndefined(workshop)) {
            layer.msg('请选择车间');
            return;
        } else {
            var site = $('#devSite').val();
            faultOther = `${workshop}-${site ? site + '-' : ''}${faultOther}`;
        }
    }
    //报修人
    var proposer = $("#proposer").val().trim();
    if (isStrEmptyOrUndefined(proposer)) {
        layer.msg('报修人不能为空');
        return;
    }
    //故障时间
    var faultDate = $("#faultDate").val();
    var faultTime = $("#faultTime").val();
    var time = `${faultDate} ${faultTime}`;
    if (exceedTime(time)) {
        layer.msg("所选时间不能大于当前时间");
        return;
    }
    //故障类型
    var faultType = $("#faultType").val();
    if (isStrEmptyOrUndefined(faultType)) {
        layer.msg("请选择故障类型");
        return;
    }
    var faultDesc = $("#faultDesc").val().trim();
    var faults = [];
    var admins = [];
    var list = {
        //故障时间
        FaultTime: time,
        //报修人
        Proposer: proposer,
        //故障补充
        Supplement: faultDesc,
        //故障类型
        FaultTypeId: faultType
    }
    if (!isStrEmptyOrUndefined(faultOther)) {
        var other = $.extend({}, list);
        other.DeviceCode = faultOther;
        faults.push(other);
    }
    if (faultCode != null) {
        for (i = 0, len = faultCode.length; i < len; i++) {
            var code = faultCode[i];
            list.DeviceId = faultCode[i];
            faults.push($.extend({}, list));
            var admin = $("#faultCode option:selected").attr("admin");
            admins.push({
                Code: code,
                Admin: admin
            });
        }
    }
    var imgJson = function (resolve) {
        var imgData = $('#addImg').val();
        if (!isStrEmptyOrUndefined(imgData)) {
            $('#addImg').fileinput("upload");
            fileCallBack[fileEnum.FaultDevice] = (fileRet) => {
                if (fileRet.errno == 0) {
                    var img = [];
                    for (var key in fileRet.data) {
                        img.push(fileRet.data[key].newName);
                    }
                    img = JSON.stringify(img);
                    for (i = 0, len = faults.length; i < len; i++) {
                        var d = faults[i];
                        d.Images = img;
                    }
                    resolve('success');
                }
            };
        } else {
            resolve('success');
        }
    }
    new Promise(function (resolve) {
        imgJson(resolve);
    }).then(function () {
        var data = {}
        data.opType = 422;
        data.opData = JSON.stringify(faults);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                $("#faultModel").modal("hide");
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFaultDeviceList();
                    for (i = 0, len = admins.length; i < len; i++) {
                        var admin = admins[i];
                        var info = {
                            ChatEnum: chatEnum.FaultDevice,
                            Message: {
                                Admin: admin.Admin,
                                Code: admin.Code
                            }
                        }
                        //调用服务器方法
                        hubConnection.invoke('SendMsg', info);
                    }
                }
            });
    });
}

//添加修改维修记录
function addUpServiceLog(isAdd) {
    var opType = isAdd ? 415 : 414;
    var list = {};
    if (isAdd) {
        var serLogCode = $('#serLogCode').val();
        var serLogWorkshop = $('#serLogWorkshop').val();
        var serLogCodeOther = $('#serLogCodeOther').val().trim();
        var isCode = isStrEmptyOrUndefined(serLogCode);
        var isOther = isStrEmptyOrUndefined(serLogCodeOther);
        if (isCode && isOther) {
            layer.msg('请选择或输入一台机台号');
            return;
        }
        if (!isCode && !isOther) {
            layer.msg('只能选择或输入一台机台号');
            return;
        }
        if (!isOther) {
            var site = $('#serLogDevSite').val();
            serLogCodeOther = `${serLogWorkshop}-${site ? site + '-' : ''}${serLogCodeOther}`;
            serLogCode = 0;
        }
        var serLogProposer = $('#serLogProposer').val().trim();
        if (isStrEmptyOrUndefined(serLogProposer)) {
            layer.msg('报修人不能为空');
            return;
        }
        var serLogFaultDate = $('#serLogFaultDate').val();
        var serLogFaultTime = $('#serLogFaultTime').val();
        if (isStrEmptyOrUndefined(serLogFaultDate) || isStrEmptyOrUndefined(serLogFaultTime)) {
            layer.msg('请选择故障时间');
            return;
        }
        var faultTime = `${serLogFaultDate} ${serLogFaultTime}`;
        var serLogFaultType = $('#serLogFaultType').val();
        if (isStrEmptyOrUndefined(serLogFaultType)) {
            layer.msg('请选择故障类型');
            return;
        }
        var serLogFaultSup = $('#serLogFaultSup').val().trim();
        var serLogPriority = $('#serLogPriority').val();
        if (isStrEmptyOrUndefined(serLogPriority)) {
            layer.msg('请选择优先级');
            return;
        }

        var serLogGrade = $('#serLogGrade').val();
        if (isStrEmptyOrUndefined(serLogGrade)) {
            layer.msg('请选择故障等级');
            return;
        }
        var serLogMaintainer = $('#serLogMaintainer').val() || [];
        list = {
            DeviceId: serLogCode,
            DeviceCode: serLogCodeOther,
            Proposer: serLogProposer,
            FaultTime: faultTime,
            FaultTypeId: serLogFaultType,
            Supplement: serLogFaultSup,
            Priority: serLogPriority,
            Grade: serLogGrade,
            Maintainer: serLogMaintainer.join()
        }
    } else {
        list.Id = $(this).val();
    }
    var serLogFaultSolver = Array.from($('#serLogFaultSolver :selected')).map(item => $(item).text()).join();
    if (isStrEmptyOrUndefined(serLogFaultSolver)) {
        layer.msg('请选择解决人');
        return;
    }
    var serLogSolveDate = $('#serLogSolveDate').val();
    var serLogSolveTime = $('#serLogSolveTime').val();
    if (isStrEmptyOrUndefined(serLogSolveDate) || isStrEmptyOrUndefined(serLogSolveTime)) {
        layer.msg('请选择解决时间');
        return;
    }
    var solveTime = `${serLogSolveDate} ${serLogSolveTime}`;
    var serLogFaultType1 = $('#serLogFaultType1').val();
    if (isStrEmptyOrUndefined(serLogFaultType1)) {
        layer.msg('请选择实际故障类型');
        return;
    }
    var serLogSolvePlan = $('#serLogSolvePlan').val().trim();
    var listAll = $.extend(list, {
        FaultSolver: serLogFaultSolver,
        SolveTime: solveTime,
        FaultTypeId1: serLogFaultType1,
        SolvePlan: serLogSolvePlan
    });
    var data = {};
    data.opType = opType;
    data.opData = JSON.stringify(isAdd ? listAll : [listAll]);
    ajaxPost("/Relay/Post", data, function (ret) {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            $('#showServiceLogModal').modal('hide');
            $('#showStatisticsDetailModel').is(':hidden')
                ? getServiceLogList(1)
                : getServiceLogList(1, _statisticsParData.name,
                    _statisticsParData.sTime,
                    _statisticsParData.eTime,
                    _statisticsParData.score);
        }
    });
}

var _delFaultDevData = null;
//获取已删除故障设备
function getDelFaultDeviceList() {
    _delFaultDevData = {};
    _delFaultDevData.Id = [];
    _delFaultDevData.Name = [];
    var startTime = $('#delFSTime').val();
    var endTime = $('#delFETime').val();
    if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
        layer.msg('请选择故障时间');
        return;
    }
    if (comTimeDay(startTime, endTime)) {
        return;
    }
    startTime = `${startTime} 00:00:00`;
    endTime = `${endTime} 23:59:59`;
    var condition = $('#delFCond').val();
    var list = { startTime, endTime, condition }
    var delFPro = $('#delFPro').val();
    var delFAttr;
    switch (delFPro) {
        case 'code':
            delFAttr = $('#delFInput').val().trim();
            if (!isStrEmptyOrUndefined(delFAttr)) {
                list[delFPro] = delFAttr;
            }
            break;
        case 'solveTime':
            var delFSolveSTime = $('#delFSolveSTime').val();
            if (!isStrEmptyOrUndefined(delFSolveSTime)) {
                list.eStartTime = delFSolveSTime;
            }
            var delFSolveETime = $('#delFSolveETime').val();
            if (!isStrEmptyOrUndefined(delFSolveETime)) {
                list.eEndTime = delFSolveETime;
            }
            break;
        default:
            delFAttr = $('#delFAttr').val();
            if (!isStrEmptyOrUndefined(delFAttr)) {
                list[delFPro] = delFAttr;
            }
    }
    var data = {}
    data.opType = 424;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }

        updateTable(_delFaultDeviceListTable, ret.datas);
        $("#delFaultDeviceList").closest(".table-responsive").removeClass("hidden");
    });
}

var _delServiceLogData = null;
//获取已删除维修记录
function getDelServiceLogList() {
    _delServiceLogData = {};
    _delServiceLogData.Id = [];
    _delServiceLogData.Name = [];
    var startTime = $('#delRepairSTime').val();
    var endTime = $('#delRepairETime').val();
    if (isStrEmptyOrUndefined(startTime) || isStrEmptyOrUndefined(endTime)) {
        layer.msg('请选择解决时间');
        return;
    }
    if (comTimeDay(startTime, endTime)) {
        return;
    }
    startTime = `${startTime} 00:00:00`;
    endTime = `${endTime} 23:59:59`;
    var condition = $('#delRepairCond').val();
    var list = { startTime, endTime, condition }
    var delRepairPro = $('#delRepairPro').val();
    var delRepairAttr;
    switch (delRepairPro) {
        case 'code':
            delRepairAttr = $('#delRepairInput').val().trim();
            if (!isStrEmptyOrUndefined(delRepairAttr)) {
                list[delRepairPro] = delRepairAttr;
            }
            break;
        case 'faultTime':
            var delRepSTime = $('#delRepSTime').val();
            if (!isStrEmptyOrUndefined(delRepSTime)) {
                list.fStartTime = delRepSTime;
            }
            var delRepETime = $('#delRepETime').val();
            if (!isStrEmptyOrUndefined(delRepETime)) {
                list.fEndTime = delRepETime;
            }
            break;
        case 'solveTime':
            var delRepSTime1 = $('#delRepSTime').val();
            if (!isStrEmptyOrUndefined(delRepSTime1)) {
                list.eStartTime = delRepSTime1;
            }
            var delRepETime1 = $('#delRepETime').val();
            if (!isStrEmptyOrUndefined(delRepETime1)) {
                list.eEndTime = delRepETime1;
            }
            break;
        default:
            delRepairAttr = $('#delRepairAttr').val();
            if (!isStrEmptyOrUndefined(delRepairAttr)) {
                list[delRepairPro] = delRepairAttr;
            }
    }
    var data = {}
    data.opType = 425;
    data.opData = JSON.stringify(list);
    ajaxPost("/Relay/Post", data, function (ret) {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }

        updateTable(_delRepairListTable, ret.datas);
        $("#delRepairList").closest(".table-responsive").removeClass("hidden");
    });
}

//获取常见故障
function getUsuallyFaultList() {
    $("#usuallyFaultList").empty();
    var data = {}
    data.opType = 400;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var html = '<div class="btn-group">' +
                '<button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >' +
                '<button type = "button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                '   <span class="caret"></span>' +
                '   <span class="sr-only">Toggle Dropdown</span>' +
                '</button>' +
                '<ul class="dropdown-menu" role="menu" style="cursor:pointer">{0}{1}' +
                '</ul>' +
                '</div>';

            var op = function (data, type, row) {
                var updateLi = '<li><a onclick="showUpdateUsuallyFaultModel({0})">修改</a></li>'.format(data.Id);
                var deleteLi = '<li><a onclick="deleteUsuallyFault({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.UsuallyFaultDesc));
                return html.format(
                    _permissionList[60].have ? updateLi : "",
                    _permissionList[61].have ? deleteLi : "");
            }
            var rSolvePlan = function (d, type, row, meta) {
                var data = d.SolvePlan;
                return `<span title = "${data}" onclick = "showAllContent('${escape(data)}', '解决方案')">${data.length > tdShowLength ? data.substring(0, tdShowLength) + "..." : data}</span>`;
            }

            var columns = [
                { "data": "Id", "title": "序号" },
                { "data": "UsuallyFaultDesc", "title": "常见故障" },
                { "data": null, "title": "解决方案", "render": rSolvePlan }
            ];

            if (_permissionList[60].have || _permissionList[61].have) {
                columns.push({ "data": null, "title": "操作", "render": op, "orderable": false });
            };

            $("#usuallyFaultList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [10, 20, 30], //更改显示记录数选项  
                    "iDisplayLength": 10, //默认显示的记录数
                    "columns": columns,
                    "bAutoWidth": true
                });
            $("#usuallyFaultModel").modal("show");
        });
}

//删除常见故障
function deleteUsuallyFault(id, usuallyFaultDesc) {
    usuallyFaultDesc = unescape(usuallyFaultDesc);
    var doSth = function () {
        var data = {}
        data.opType = 405;
        data.opData = JSON.stringify({
            id: id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getUsuallyFaultList();
                }
            });
    }
    showConfirm("删除常见故障：" + usuallyFaultDesc, doSth);
}

//添加常见故障弹窗
function showAddUsuallyFaultModel() {
    hideClassTip('adt');
    $("#addUsuallyFaultDesc").val("");
    $("#addSolvePlan").val("");
    $("#addUsuallyFaultModel").modal("show");
}

//添加常见故障
function addUsuallyFault() {
    var add = true;
    var addUsuallyFaultDesc = $("#addUsuallyFaultDesc").val().trim();
    if (isStrEmptyOrUndefined(addUsuallyFaultDesc)) {
        showTip("addUsuallyFaultDescTip", "故障描述不能为空");
        add = false;
    }
    var addSolvePlan = $("#addSolvePlan").val().trim();
    if (isStrEmptyOrUndefined(addSolvePlan)) {
        showTip("addSolvePlanTip", "解决方案不能为空");
        add = false;
    }
    if (!add)
        return;
    var doSth = function () {
        $("#addUsuallyFaultModel").modal("hide");
        var data = {};
        data.opType = 403;
        data.opData = JSON.stringify({
            //故障类型描述
            UsuallyFaultDesc: addUsuallyFaultDesc,
            //故障类型解决方案
            SolvePlan: addSolvePlan
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getUsuallyFaultList();
                }
            });
    }
    showConfirm("添加", doSth);
}

//修改常见故障弹窗
function showUpdateUsuallyFaultModel(id) {
    $("#updateId").html(id);
    var data = {}
    data.opType = 400;
    data.opData = JSON.stringify({
        qId: id
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            if (ret.datas.length > 0) {
                $("#updateUsuallyFaultDesc").val(ret.datas[0].UsuallyFaultDesc);
                $("#updateSolvePlan").val(ret.datas[0].SolvePlan);
            }
            hideClassTip('adt');
            $("#updateUsuallyFaultModel").modal("show");
        });
}

//修改常见故障
function updateUsuallyFault() {
    var update = true;
    var updateUsuallyFaultDesc = $("#updateUsuallyFaultDesc").val().trim();
    if (isStrEmptyOrUndefined(updateUsuallyFaultDesc)) {
        showTip($("#updateUsuallyFaultDescTip"), "故障描述不能为空");
        update = false;
    }
    var updateSolvePlan = $("#updateSolvePlan").val().trim();
    if (isStrEmptyOrUndefined(updateSolvePlan)) {
        showTip($("#updateSolvePlanTip"), "解决方案不能为空");
        update = false;
    }
    if (!update)
        return;
    var id = parseInt($("#updateId").html());

    var doSth = function () {
        $("#updateUsuallyFaultModel").modal("hide");
        var data = {};
        data.opType = 402;
        data.opData = JSON.stringify({
            id: id,
            //故障类型描述
            UsuallyFaultDesc: updateUsuallyFaultDesc,
            //故障类型解决方案
            SolvePlan: updateSolvePlan
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getUsuallyFaultList();
                }
            });
    }
    showConfirm("修改", doSth);
}

//获取故障类型
function getFaultTypeList() {
    $("#faultTypeList").empty();
    var data = {}
    data.opType = 406;
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            var html = '<div class="btn-group">' +
                '<button type = "button" class="btn btn-default" data-toggle="dropdown" aria-expanded="false"> <i class="fa fa-asterisk"></i>操作</button >' +
                '<button type = "button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                '   <span class="caret"></span>' +
                '   <span class="sr-only">Toggle Dropdown</span>' +
                '</button>' +
                '<ul class="dropdown-menu" role="menu" style="cursor:pointer">{0}{1}' +
                '</ul>' +
                '</div>';
            var op = function (data, type, row) {
                var updateLi = '<li><a onclick="showUpdateFaultTypeModel({0})">修改</a></li>'.format(data.Id);
                var deleteLi = '<li><a onclick="deleteFaultType({0}, \'{1}\')">删除</a></li>'.format(data.Id, escape(data.FaultTypeName));
                return html.format(_permissionList[53].have ? updateLi : "", _permissionList[54].have ? deleteLi : "");;
            }
            var faultDescription = d => d.length > tdShowLength ? `<span title="${d}" class="pointer" onclick="showAllContent(\'${escape(d)}\',\'故障类型描述\')">${d.substring(0, tdShowLength)}...</span>` : d;
            var columns = [
                { "data": null, "title": "序号", "render": setRow.order },
                { "data": "Id", "title": "Id", "bVisible": false },
                { "data": "FaultTypeName", "title": "故障类型" },
                { "data": "FaultDescription", "title": "故障类型描述", "render": faultDescription }
            ];
            if (_permissionList[53].have || _permissionList[54].have) {
                columns.push({ "data": null, "title": "操作", "render": op, "orderable": false });
            };
            $("#faultTypeList")
                .DataTable({
                    dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
                    "destroy": true,
                    "paging": true,
                    "searching": true,
                    "language": oLanguage,
                    "data": ret.datas,
                    "aaSorting": [[0, "asc"]],
                    "aLengthMenu": [10, 20, 30], //更改显示记录数选项  
                    "iDisplayLength": 10, //默认显示的记录数
                    "columns": columns
                });
            $("#faultTypeModel").modal("show");
        });
}

//故障类型详情弹窗
function showFaultTypeDetailModel(id, desc = "") {
    desc = unescape(desc);
    $("#faultTypeDetail1Div").addClass("hidden");
    if (!isStrEmptyOrUndefined(desc)) {
        $("#faultTypeDetail1Div").removeClass("hidden");
        $("#faultTypeDetail1").html(desc);
    }

    var data = {}
    data.opType = 406;
    data.opData = JSON.stringify({
        qId: id,
        menu: true
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var d = ret.datas[0];
            if (ret.datas.length > 0) {
                $("#faultTypeNameDetail").html(d.FaultTypeName);
                $("#faultTypeDetail").html(d.FaultDescription);
            }
            $("#faultTypeDetailModel").modal("show");
        });
}

//删除故障类型
function deleteFaultType(id, faultTypeDesc) {
    faultTypeDesc = unescape(faultTypeDesc);
    var doSth = function () {
        var data = {}
        data.opType = 411;
        data.opData = JSON.stringify({
            id: id
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFaultTypeList();
                    getFaultTypeSelect();
                }
            });
    }
    showConfirm("删除故障类型：" + faultTypeDesc, doSth);
}

//添加故障类型弹窗
function showAddFaultTypeModel() {
    hideClassTip('adt');
    $("#addFaultTypeName").val("");
    $("#addFaultTypeDesc").val("");
    $("#addFaultTypeModel").modal("show");
}

//添加故障类型
function addFaultType() {
    var add = true;
    var addFaultTypeName = $("#addFaultTypeName").val().trim();
    if (isStrEmptyOrUndefined(addFaultTypeName)) {
        showTip("addFaultTypeNameTip", "故障类型不能为空");
        add = false;
    }
    var addFaultTypeDesc = $("#addFaultTypeDesc").val();

    if (!add)
        return;

    var doSth = function () {
        $("#addFaultTypeModel").modal("hide");
        var data = {};
        data.opType = 410;
        data.opData = JSON.stringify([{
            //故障类型
            FaultTypeName: addFaultTypeName,
            //故障类型描述
            FaultDescription: addFaultTypeDesc
        }]);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFaultTypeList();
                    getFaultTypeSelect();
                }
            });
    }
    showConfirm("添加", doSth);
}

//修改故障类型弹窗
function showUpdateFaultTypeModel(id) {
    $("#updateTypeId").html(id);
    var data = {}
    data.opType = 406;
    data.opData = JSON.stringify({
        qId: id
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            if (ret.datas.length > 0) {
                $("#updateFaultTypeName").val(ret.datas[0].FaultTypeName);
                $("#updateFaultTypeDesc").val(ret.datas[0].FaultDescription);
            }
            hideClassTip('adt');
            $("#updateFaultTypeModel").modal("show");
        });
}

//修改故障类型
function updateFaultType() {
    var update = true;
    var updateFaultTypeName = $("#updateFaultTypeName").val().trim();
    if (isStrEmptyOrUndefined(updateFaultTypeName)) {
        showTip("updateFaultTypeNameTip", "故障类型不能为空");
        update = false;
    }
    var updateFaultTypeDesc = $("#updateFaultTypeDesc").val();
    if (!update)
        return;
    var id = parseInt($("#updateTypeId").html());

    var doSth = function () {
        $("#updateFaultTypeModel").modal("hide");
        var data = {};
        data.opType = 408;
        data.opData = JSON.stringify({
            id: id,
            //故障类型
            FaultTypeName: updateFaultTypeName,
            //故障类型描述
            FaultDescription: updateFaultTypeDesc
        });
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    getFaultTypeList();
                    getFaultTypeSelect();
                }
            });
    }
    showConfirm("修改", doSth);
}

//获取维修工
var maintainers = null;
var _maintainerListTrs = null;
function showMaintainerModel(cover = 1, show = true) {
    $('#maintainerTable').css('maxHeight', innerHeight * 0.7);
    maintainers = [];
    _maintainerListTrs = [];
    var data = {}
    data.opType = 430;
    data.opData = JSON.stringify({
        menu: true
    });
    ajaxPost("/Relay/Post", data,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }
            var rData = ret.datas;
            const isCheckShow = _permissionList[46].have || _permissionList[47].have;
            const isUpdate = _permissionList[46].have;
            const head = `<tr>${isCheckShow ? '<th>选择</th>' : ''}<th>序号</th><th>姓名</th><th>手机号</th><th>是否排班</th><th>顺序</th><th>备注</th></tr>`;
            $('#maintainerHead').html(head);
            let trs = '';
            rData.forEach(item => {
                maintainers[item.Id] = item;
                trs += `<tr>
                            ${isCheckShow ? '<td><input type="checkbox" class="icb_minimal isEnabled" value=' + item.Id + '></td>' : ''}
                            <td class="num"></td>
                            <td>${item.Name}</td>
                            <td><span class="textIn">${item.Phone}</span><input class="textOn hidden form-control text-center phone" onkeyup="onInput(this, 11, 0)"></td>
                            <td><input type="checkbox" class="icb_minimal isWork" work=${!!item.Order}></td>
                            <td><span class="order">${item.Order || ''}${isUpdate ? '</span><span class="glyphicon glyphicon-arrow-up pointer text-green upTr" aria-hidden="true" onclick="upMaintainers.call(this)" title="上移"></span>' : ''}</td>
                            <td>
                                ${data.length > tdShowLength ? '<span class="textIn" onclick="showAllContent(' + item.Remark + ')">' + item.Remark.substring(0, tdShowLength) + '...</span>' : '<span class="textIn">' + item.Remark + '</span>'}
                                <input class="textOn hidden form-control remark" style="width: 100%"></td>
                        </tr>`;
            });
            $('#maintainerList').html(trs);
            $('#maintainerList .isEnabled').iCheck({
                labelHover: false,
                cursor: true,
                checkboxClass: 'icheckbox_minimal-blue',
                radioClass: 'iradio_minimal-blue',
                increaseArea: '20%'
            }).on('ifChanged', function () {
                const tr = $(this).parents('tr');
                const id = $(this).val();
                const isChecked = $(this).is(':checked');
                if (isChecked) {
                    tr.find('.textIn').addClass('hidden').end().find('.textOn').removeClass('hidden');
                    tr.find('.phone').val(maintainers[id].Phone);
                    tr.find('.remark').val(maintainers[id].Remark);
                } else {
                    tr.find('.textIn').removeClass('hidden').end().find('.textOn').addClass('hidden');
                }
                operationMaintainerListTrs(tr[0], isChecked);
            });
            $('#maintainerList .isWork[work=true]').iCheck('check');
            isUpdate || $('#maintainerList .isWork').iCheck('disable');
            $('#maintainerList .isWork').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_polaris',
                increaseArea: '20%'
            }).on('ifChanged', function () {
                const tr = $(this).parents('tr');
                operationMaintainerListTrs(tr[0], true);
                setOrder();
            });
            setMaintainerList();
            cover && getScheduleInfo(show);
        }, cover);
}

//顺序设置
function setOrder() {
    const workEls = $('#maintainerList .isWork');
    let index = 0;
    for (let i = 0, len = workEls.length; i < len; i++) {
        const checkEl = workEls.eq(i);
        const tr = checkEl.parents('tr');
        if (checkEl.is(':checked')) {
            tr.find('.order').text(++index);
            i && tr.find('.upTr').removeClass('hidden');
            operationMaintainerListTrs(tr[0], true);
        } else {
            tr.find('.order').text('');
            tr.find('.upTr').addClass('hidden');
        }
    }
}

//导出
function outputTable() {
    const data = [];
    maintainers.forEach(item => void data.push(item));
    $('<table></table>').DataTable({
        dom: 'B',
        buttons: [{
            extend: 'excel',
            filename: `维修工名单`
        }],
        destroy: true,
        data,
        columns: [
            { data: null, title: '序号', render: (a, b, c, d) => d.row + 1 },
            { data: 'Name', title: '姓名' },
            { data: 'Phone', title: '手机号' },
            { data: 'Remark', title: '备注' }
        ]
    }).buttons('.buttons-excel').trigger();
}

//上移
function upMaintainers() {
    const tr = $(this).parents('tr');
    const upTr = tr.prev();
    upTr.before(tr);
    setMaintainerList();
    setOrder();
}

//维修工表格设置
function setMaintainerList() {
    const trs = $('#maintainerList tr');
    for (let i = 0, len = trs.length; i < len; i++) {
        const tr = trs.eq(i);
        tr.find('.num').text(i + 1);
        const isWork = tr.find('.isWork').is(':checked');
        if (i && isWork) {
            tr.find('.upTr').removeClass('hidden');
        } else {
            tr.find('.upTr').addClass('hidden');
        }
    }
}

//获取维修工信息
function operationMaintainerListTrs(tr, isAdd) {
    const index = _maintainerListTrs.indexOf(tr);
    isAdd ? ~index || _maintainerListTrs.push(tr) : _maintainerListTrs.splice(index, 1);
}

let _scheduleSelectEl = null;
//显示排班
function getScheduleInfo(show) {
    _scheduleSelectEl = [];
    var ops = '';
    maintainers.forEach(item => {
        ops += `<option value=${item.Id}>${item.Name}</option>`;
    });
    ajaxPost("/Relay/Post", { opType: 434 }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        let index = 0;
        const headArr = ['一', '二', '三', '四', '五', '六', '日'];
        let headEl = '';
        const rData = ret.datas;
        const timeFn = time => {
            time = new Date(time);
            return {
                m: time.getMonth() + 1,
                d: time.getDate()
            }
        }
        let trs = [], nameArr = [];
        const today = getDate();
        rData.forEach((item, i) => {
            let names = item.Maintainers.map(item => {
                const name = item.Name;
                nameArr.includes(name) || nameArr.push(name);
                return name;
            });
            if (i < 4) {
                trs[i] = `<td style="font-weight:bold;border:1px solid">${parseInt(item.StartTime.split(' ')[1])}点 ~ ${parseInt(item.EndTime.split(' ')[1])}点</td>`;
            }
            const rem = i % 4;
            const info = names.join(names.length > 1 ? '<br>' : '') || '未排班';
            const infoId = item.Maintainers[0] ? item.Maintainers[0].Id : 0;
            const nameText = rem === 1 ? info : `<div class="schedule-name">${info}</div><div class="select-ops hidden"><select class="ms2 form-control" infoid="${infoId}">${ops}</select></div>`;
            const currentTime = new Date();
            const border = new Date(item.StartTime) < currentTime && currentTime <= new Date(item.EndTime)
                ? '3px solid red'
                : '1px solid black';
            names = `<td style="border:${border}">${nameText}</td>`;
            trs[rem] += names;
            if (!rem) {
                const time = timeFn(item.StartTime);
                const color = today === item.StartTime.split(' ')[0] ? 'text-red' : '';
                headEl += `<th class=${color}>周${headArr[index++]}(${time.m}/${time.d})</th>`;
            }
        });
        trs = trs.reduce((a, b) => `${a}<tr>${b}</tr>`, '');
        $('#scheduleTime').text(`${rData[0].StartTime.split(' ')[0]} 至 ${rData[rData.length - 1].StartTime.split(' ')[0]}`);
        $('#scheduleHead').empty().append(`<tr><th></th>${headEl}</tr>`);
        $('#scheduleHead th').css('border', '1px solid black');
        $('#scheduleBody').empty().append(trs).find('.ms2').select2();
        $('#scheduleBody .schedule-name').on('dblclick', function () {
            $('#scheduleBody .select-ops').addClass('hidden');
            $('#scheduleBody .schedule-name').removeClass('hidden');
            const name = $(this).text();
            const selectEl = $(this).addClass('hidden').siblings('.select-ops').removeClass('hidden').find('select');
            let v;
            Array.from(selectEl.find('option')).some(item => {
                if ($(item).text() === name) {
                    v = $(item).val();
                    return true;
                }
            });
            selectEl.val(v).trigger('change');
            const dom = selectEl[0];
            _scheduleSelectEl.includes(dom) || _scheduleSelectEl.push(dom);
        });
        $('#scheduleBody .ms2').on('select2:select', function () {
            const name = $(this).find(':selected').text();
            const td = $(this).parents('td');
            td.find('.schedule-name').text(name);
        });
        show && $('#maintainerModel').modal('show');
    });
}

//修改排班
function updateSchedule() {
    if (!_scheduleSelectEl.length) {
        layer.msg('请先进行修改');
        return;
    }
    const arr = _scheduleSelectEl.map(item => {
        const el = $(item);
        return {
            Id: el.attr('infoid') >> 0 || 0,
            MaintainerId: el.val() >> 0 || 0
        }
    });
    var data = {}
    data.opType = 435;
    data.opData = JSON.stringify(arr);
    ajaxPost('/Relay/Post', data, ret => {
        layer.msg(ret.errmsg);
        if (ret.errno == 0) {
            getScheduleInfo(false);
        }
    });
}

var addMax = 0;
var addMaxV = 0;
//重置
function initList() {
    $("#addList").empty();
    addMax = addMaxV = 0;
}

var users = null;
function showAddMaintainerModel(cover = 1) {
    initList();
    $("#addOneBtn").attr("disabled", "disabled");
    $("#addMaintainerBtn").attr("disabled", "disabled");
    ajaxGet("/AccountManagement/List", null,
        function (ret) {
            if (ret.errno != 0) {
                layer.msg(ret.errmsg);
                return;
            }

            $("#addOneBtn").removeAttr("disabled");
            $("#addMaintainerBtn").removeAttr("disabled");
            users = ret.datas;
            $('#addMaintainerModel').modal('show');

        }, cover);
}

//添加一行
function addOne() {
    //increaseList
    addMax++;
    addMaxV++;
    var tr =
        (`<tr id="add{0}" value="{0}" xh="{1}">
            <td style="vertical-align: addherit;" id="addXh{0}">{1}</td>
            <td><select class="ms2 form-control" id="addUser{0}"></select></td>
            <td><input class="form-control" type="tel" id="addPhone{0}" onkeyup="onInput(this, 11, 0)" onblur="onInputEnd(this)" maxlength="11"></td>
            <td><input class="form-control" id="addRk{0}" maxlength="100"></td>
            <td><button type="button" class="btn btn-danger btn-sm" onclick="delOne({0})"><i class="fa fa-minus"></i></button></td>
        </tr>`).format(addMax, addMaxV);
    $("#addList").append(tr);
    var xh = addMax;
    var selector = "#addUser" + xh;
    $(selector).empty();
    if (users && users.length > 0) {
        var html = "";
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            html += `<option value="${user.account}" title="${user.account}">${user.name}</option>`;
        }
        $(selector).append(html);
        $("#addPhone" + xh).val(users[0].phone);
        $(selector).on('select2:select', function () {
            var acc = $(this).val();
            var xh = $(this).parents('tr:first').attr("value");
            $("#addPhone" + xh).val('');
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (acc == user.account) {
                    $("#addPhone" + xh).val(user.phone);
                    break;
                }
            }
        });
    }

    selector = "#add" + xh;
    $(selector).find(".ms2").css("width", "100%");
    $(selector).find(".ms2").select2({
        width: "120px"
    });
    $('#addTable').scrollTop($('#addTable')[0].scrollHeight);
}

//删除一行
function delOne(id) {
    $("#addList").find(`tr[value=${id}]:first`).remove();
    addMaxV--;
    var o = 1;
    var child = $("#addList tr");
    for (var i = 0; i < child.length; i++) {
        $(child[i]).attr("xh", o);
        var v = $(child[i]).attr("value");
        $("#addXh" + v).html(o);
        o++;
    }
}

//添加
function addMaintainer() {
    var opType = 432;
    var child = $("#addList tr");
    var list = new Array();
    for (var i = 0; i < child.length; i++) {
        var v = $(child[i]).attr("value");
        var xh = $(child[i]).attr("xh");
        var name = $("#addUser" + v).find("option:checked").text();
        var acc = $("#addUser" + v).find("option:checked").val();
        var phone = $("#addPhone" + v).val();
        var remark = $("#addRk" + v).val();
        if (isStrEmptyOrUndefined(name)) {
            layer.msg(`序列${xh}：请输入姓名`);
            return;
        }
        if (isStrEmptyOrUndefined(acc)) {
            return;
        }
        if (!isStrEmptyOrUndefined(phone) && !isPhone(phone)) {
            layer.msg(`序列${xh}：手机号格式不正确`);
            return;
        }
        list.push({
            Name: name,
            Account: acc,
            Phone: phone,
            Remark: remark
        });
    }
    if (list.length <= 0)
        return;

    var addMaintainerBtnTime = null;
    var doSth = function () {
        $("#addMaintainerBtn").attr("disabled", "disabled");
        var data = {}
        data.opType = opType;
        data.opData = JSON.stringify(list);
        ajaxPost("/Relay/Post", data,
            function (ret) {
                if (addMaintainerBtnTime)
                    clearTimeout(addMaintainerBtnTime);
                $("#addMaintainerBtn").removeAttr("disabled");
                layer.msg(ret.errmsg);
                if (ret.errno == 0) {
                    showMaintainerModel(1, false);
                    getWorkerSelect();
                    $("#addMaintainerModel").modal("hide");
                }
            });
        addMaintainerBtnTime = setTimeout(function () {
            $("#addMaintainerBtn").removeAttr("disabled");
        }, 5000);
    }
    showConfirm("添加", doSth);
}

//修改维修工信息
function updateMaintainer() {
    const list = [];
    const len = _maintainerListTrs.length;
    if (!len) {
        layer.msg('请先修改数据');
        return;
    }
    for (let i = 0; i < len; i++) {
        const tr = $(_maintainerListTrs[i]);
        const checkEl = tr.find('.isEnabled');
        const id = checkEl.val();
        const otherInfo = maintainers[id];
        let phone, remark;
        if (checkEl.is(':checked')) {
            phone = tr.find('.phone').val().trim();
            remark = tr.find('.remark').val().trim();
        } else {
            phone = otherInfo.Phone;
            remark = otherInfo.Remark;
        }
        if (!isStrEmptyOrUndefined(phone) && !isPhone(phone)) {
            layer.msg('手机号格式不正确');
            return;
        }
        list.push({
            Id: id,
            Name: otherInfo.Name,
            Account: otherInfo.Account,
            Phone: phone,
            Remark: remark,
            Order: tr.find('.order').text().trim() || 0
        });
    }
    var doSth = function () {
        var data = {}
        data.opType = 431;
        data.opData = JSON.stringify(list);
        var updateMaintainerTime = null;
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (updateMaintainerTime)
                    clearTimeout(updateMaintainerTime);
                $("#updateMaintainerBtn").removeAttr("disabled");
                if (ret.errno == 0) {
                    showMaintainerModel(0, false);
                    getWorkerSelect();
                }
            });
        updateMaintainerTime = setTimeout(function () {
            $("#delMaintainerBtn").removeAttr("disabled");
        }, 5000);
    }
    showConfirm('保存', doSth);
}

//删除配置
function delMaintainer() {
    const ids = [], names = [];
    $('#maintainerList .isEnabled:checked').each((i, item) => {
        const id = $(item).val();
        ids.push(id);
        names.push(maintainers[id].Name);
    });
    if (!ids.length) {
        layer.msg('请选择需要删除的数据');
        return;
    }
    var doSth = function () {
        $('#delMaintainerBtn').attr('disabled', 'disabled');
        var data = {}
        data.opType = 433;
        data.opData = JSON.stringify({
            ids: ids
        });
        var delMaintainerBtnTime = null;
        ajaxPost("/Relay/Post", data,
            function (ret) {
                layer.msg(ret.errmsg);
                if (delMaintainerBtnTime)
                    clearTimeout(delMaintainerBtnTime);
                $("#delMaintainerBtn").removeAttr('disabled');
                if (ret.errno == 0) {
                    showMaintainerModel(1, false);
                    getWorkerSelect();
                }
            });
        delMaintainerBtnTime = setTimeout(function () {
            $('#delMaintainerBtn').removeAttr('disabled');
        }, 5000);
    }
    showConfirm(`删除以下维修工：<pre style='color:red'>${names.join('<br>')}</pre>`, doSth);
}
