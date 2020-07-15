function pageReady() {
    $('.ms2').select2();
    $('#deviceSelect').select2({
        allowClear: true,
        placeholder: '请选择',
        multiple: true
    });
    getClass();
    (async function () {
        await new Promise(resolve => getScript(resolve));
        await getDevice();
    })();
    $('#scriptSelect').on('select2:select', () => getDevice());
    $('#deviceSelect').on('select2:select', function () {
        const v = $(this).val();
        if (~v.indexOf('0')) {
            const el = $(this).find('option');
            const arr = [];
            for (let i = 0, len = el.length; i < len; i++) {
                arr.push(el.eq(i).val());
            }
            arr.splice(arr.indexOf('0'), 1);
            $(this).val(arr).trigger('change');
        }
    });
}

//获取分类
function getClass() {
    ajaxPost('/Relay/Post', { opType: 168 }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#deviceType').empty().append(setOptions(ret.datas, 'Class'));
    });
}

//获取脚本
function getScript(resolve) {
    ajaxPost('/Relay/Post', { opType: 113 }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        $('#scriptSelect').empty().append(setOptions(ret.datas, 'ScriptName'));
        resolve();
    });
}

//获取设备
function getDevice() {
    const scriptId = $('#scriptSelect').val();
    if (isStrEmptyOrUndefined(scriptId)) {
        layer.msg('请选择脚本');
        return;
    }
    ajaxPost('/Relay/Post', { opType: 100, opData: JSON.stringify({ scriptId }) }, ret => {
        if (ret.errno != 0) {
            layer.msg(ret.errmsg);
            return;
        }
        const rData = ret.datas;
        let all = '';
        if (rData.length > 1) {
            all = '<option value="0">全部</option>';
        }
        $('#deviceSelect').empty().append(`${all}${setOptions(rData, 'Code')}`);
    });
}

//