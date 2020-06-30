function pageReady() {
    $('.ms2').select2();
    $('#cgTime').val(getDate()).datepicker('update');
    getGroup();
    $('#groupSelect').on('select2:select', () => getProcessor());
}

//options设置
function setOptions(data, name) {
    const op = '<option value="{0}">{1}</option>';
    let ops = '';
    for (let i = 0, len = data.length; i < len; i++) {
        const d = data[i];
        ops += op.format(d.Id, d[name]);
    }
    return ops;
}

//获取分组
function getGroup() {
    const data = {};
    data.opType = 1077;
    data.opData = JSON.stringify({
        menu: true
    });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#groupSelect').empty().append(setOptions(ret.datas, 'Group'));
        getProcessor();
    });
}

//获取请购人
function getProcessor() {
    const groupId = $('#groupSelect').val();
    const data = {};
    data.opType = 1081;
    data.opData = JSON.stringify({
        groupId: groupId,
        menu: true
    });
    ajaxPost('/Relay/Post', data, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#qgProcessor').empty().append(setOptions(ret.datas, 'Processor'));
    });
}