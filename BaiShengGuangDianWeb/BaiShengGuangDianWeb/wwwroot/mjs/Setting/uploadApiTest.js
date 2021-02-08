﻿var updateFirmwareUpload = null;
function pageReady() {
    if (updateFirmwareUpload == null)
        updateFirmwareUpload = initFileInputMultiple("addFile", fileEnum.SpotCheck);
    $("#addFile").fileinput('clear');
}

function addFile() {
    if (!hasPre())
        return;

    fileCallBack[fileEnum.SpotCheck] = function (fileRet) {
        console.log(fileRet);
        if (fileRet.errno == 0) {
            var imgs = [];
            for (var key in fileRet.data) {
                imgs.push(fileRet.data[key].newName);
            }

            //显示图片方法
            var data = {
                type: fileEnum.SpotCheck,
                files: JSON.stringify(imgs)
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
            ajaxPost("/Upload/Path", data,
                function (ret) {
                    if (ret.errno != 0) {
                        layer.msg(ret.errmsg);
                        return;
                    }

                    console.log(ret);

                    $("#showImg").empty();
                    var img = '<img height="200px" src="{0}"/>';
                    var html = "";
                    for (var i = 0; i < ret.data.length; i++) {
                        html += img.format(ret.data[i].path);
                    }
                    $("#showImg").append(html);
                });
        }
    };

    var doSth = function () {
        $('#addImage').fileinput("upload");
    }
    showConfirm("操作", doSth);
}

function addImage() {
    if (!hasPre())
        return;

    fileCallBack[fileEnum.SpotCheck] = function (fileRet) {
        console.log(fileRet);
        if (fileRet.errno == 0) {
            var imgs = [];
            for (var key in fileRet.data) {
                imgs.push(fileRet.data[key].newName);
            }

            //显示图片方法
            var data = {
                type: fileEnum.SpotCheck,
                files: JSON.stringify(imgs)
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
            ajaxPost("/Upload/Path", data,
                function (ret) {
                    if (ret.errno != 0) {
                        layer.msg(ret.errmsg);
                        return;
                    }

                    console.log(ret);

                    $("#showImg").empty();
                    var img = '<img height="200px" src="{0}"/>';
                    var html = "";
                    for (var i = 0; i < ret.data.length; i++) {
                        html += img.format(ret.data[i].path);
                    }
                    $("#showImg").append(html);
                });
        }
    };

    var doSth = function () {
        $('#addImage').fileinput("upload");
    }
    showConfirm("操作", doSth);
}

