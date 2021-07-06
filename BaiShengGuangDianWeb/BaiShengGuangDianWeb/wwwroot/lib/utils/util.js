function isPhone(phoneNum) {
    var res = false;
    //简单判断下是否是数字
    if (isNaN(phoneNum)) {
        return res;
    }
    res = /^[1][3,4,5,7,8,9][0-9]{9}$/g.test(phoneNum);
    return res;
}

function isEmail(mail) {
    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (filter.test(mail)) {
        return true;
    } else {
        return false;
    }
}

function isStrEmptyOrUndefined(val) {
    if (val == "") {
        return true;
    }
    if (val == undefined) {
        return true;
    }
    return false;
}

function isMac(mac) {
    var reg = /^[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}$/;
    var reg1 = /^[A-Fa-f\d]{2}-[A-Fa-f\d]{2}-[A-Fa-f\d]{2}-[A-Fa-f\d]{2}-[A-Fa-f\d]{2}-[A-Fa-f\d]{2}$/;
    if (reg.test(mac) || reg1.test(mac)) {
        return true;
    } else {
        return false;
    }
}

function isIp(ip) {
    var exp = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/;
    var reg = ip.match(exp);
    if (reg == null) {
        return false;
    } else {
        return true;
    }
}

function isPort(port) {
    if (port < 0 || port > 65536) {
        return false;
    } else {
        return true;
    }
}
//非负浮点数
function isNumber(value) {
    //判断是不是一个数字 或者 一个字符串里全是数字
    if (value === undefined || value === null || value === '') {
        return false;
    }

    if (typeof (value) === 'string') {
        //正整数
        var reNumber = /^\d+$/;
        //负整数
        var reNeNumber = /^-\d+$/;
        //正实数
        var reRealNumber1 = /^[1-9]\d*[.]\d+$/;  //非零开头
        var reRealNumber2 = /^0[.]\d+$/; //零开头
        //负实数
        var reNeRealNumber1 = /^-[1-9]\d*[.]\d+$/;  //非零开头
        var reNeRealNumber2 = /^-0[.]\d+$/; //零开头
        if (reNumber.test(value) || reNeNumber.test(value)
            || reRealNumber1.test(value) || reRealNumber2.test(value)
            || reNeRealNumber1.test(value) || reNeRealNumber2.test(value)) {
            return true;
        }
        else {
            return false;
        }
    }
    else if (typeof (value) === 'number') {
        return true;
    }
    else {
        return false;
    }
}

//获取jwt中的信息
function getJwtInfo(token) {
    if (isStrEmptyOrUndefined(token)) {
        return null;
    }

    var strArr = token.split(".");
    var info = strArr[1];

    var result2 = Base64.decode(info);
    var obj = JSON.parse(result2);
    var per = GetCookie("per");
    obj.permissionsList = isStrEmptyOrUndefined(per) ? new Array() : per.split(",").map(Number);
    obj.proleList = isStrEmptyOrUndefined(obj.prole) ? new Array() : obj.prole.split(",").map(Number);
    // console.log( obj )

    return obj;
}

//从token中获取jwt信息
function getCookieTokenInfo() {
    var token = GetCookie("token");
    var info = getJwtInfo(token);

    return info;
}

//检查token是否过期之类
function isTokenValid() {
    var tkInfo = getCookieTokenInfo();
    if (tkInfo == null) {
        return false;
    }

    var timestamp = new Date().getTime() / 1000;
    if (timestamp > tkInfo.exp) {
        return false;
    }

    return true;
}

//查看是否有角色是否有权限
function checkPermission(opType) {
    //permissionsList
    var info = getCookieTokenInfo();

    if (info == null || !isTokenValid()) {
        window.location.href = loginUrl;
        return -1;
    } else {
        return info.permissionsList.indexOf(opType) >= 0;
    }
}

//根据权限判断是否显示相应功能
function checkPermissionUi(pList) {
    for (var key in pList) {
        if (pList.hasOwnProperty(key) && isNumber(key)) {
            var id = parseInt(key);
            var p = pList[id];
            p.have = checkPermission(id);
            var uIdk;
            if (!p.have) {
                for (uIdk in p.uIds) {
                    if (p.uIds.hasOwnProperty(uIdk)) {
                        $(`#${p.uIds[uIdk]}`).addClass("hidden");
                    }
                }
            } else {
                for (uIdk in p.uIds) {
                    if (p.uIds.hasOwnProperty(uIdk)) {
                        $(`#${p.uIds[uIdk]}`).removeClass("hidden");
                    }
                }
            }
        }
    }
    return pList;
}

var isCover = false;
//添加菊花效果
function addCover() {
    var html = '<div id="body-cover"><div class="spinner"> <div class="spinner-container container1"><div class="circle1"></div><div class="circle2"></div> <div class="circle3"></div><div class="circle4"></div>  </div> <div class="spinner-container container2"><div class="circle1"></div> <div class="circle2"></div><div class="circle3"></div> <div class="circle4"></div> </div><div class="spinner-container container3"><div class="circle1"></div> <div class="circle2"></div>  <div class="circle3"></div> <div class="circle4"></div></div></div></div>'
    $('body').append(html);
}
//删除菊花效果
function removeCover() {
    $('#body-cover').remove();
}

function reLogin() {
    console.log("err");
    window.location.href = loginUrl
}

//ajax 包装 data 必须是张表，或者null,带token
function ajaxPost(url, data, func, tf) {
    if (tf != 0) {
        addCover();
    }
    if (data == null) {
        data = {}
    }

    //var token = GetCookie("token")
    //if (!isStrEmptyOrUndefined(token)) {
    //    data.token = token
    //}
    var funcC = function (e) {
        if (e == loginUrl) {
            reLogin();
            return;
        }
        if (tf != 0) {
            removeCover();
        }
        func(e);
    }
    $.post(url, data, funcC).error(reLogin);
}

//ajax 包装 data 必须是张表，或者null,带token
function ajaxGet(url, data, func) {
    //if (tf != 0) {
    //    addCover();
    //}
    if (data == null) {
        data = {}
    }

    //var token = GetCookie("token");
    //if (!isStrEmptyOrUndefined(token)) {
    //    data.token = token;
    //}

    var paramStr = "";
    for (var key in data) {
        if (paramStr == "") {
            paramStr = "?";
        }
        if (paramStr != "?") {
            paramStr = paramStr + "&";
        }
        paramStr = paramStr + key + "=" + data[key];
    }

    var funcC = function (e) {
        if (e == loginUrl) {
            reLogin();
            return;
        }
        removeCover();
        func(e);
    }
    url = url + paramStr;
    $.get(url, funcC).error(reLogin);
}

//在请求的表中添加token 信息
function addToken(data) {

    var token = GetCookie("token");
    if (!isStrEmptyOrUndefined(token)) {
        data.token = token;
    }

    return data;
}

//获取带token的表
function getTokenTable() {
    var token = GetCookie("token");
    if (isStrEmptyOrUndefined(token)) {
        return {}
    }
    return { "token": token }
}

//通用的ajax错误处理
function errorHandle(ret) {
    if (ret.errno == undefined || ret.errno == null) {
        return false;
    }
    if (ret.errno == 0) {
        return false;
    }

    layer.alert(ret.errmsg);

    ////token 有问题，重新登录
    //if (ret.errno == ErrorEnum.MissToken || ret.errno == ErrorEnum.TokenError || ret.errno == ErrorEnum.TokenInvalid) {
    //    window.location.href = loginUrl;
    //}
    return true;
}

/*
 功能：保存cookies函数
 参数：name，cookie名字；value，值
 */
function SetCookie(name, value) {
    var days = 30 * 12;  //cookie 将被保存一年
    var exp = new Date(); //获得当前时间
    exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000); //换成毫秒
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}
/*
功能：获取cookies函数
参数：name，cookie名字
*/
function GetCookie(name) {
    var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
    if (arr != null) {
        return unescape(arr[2]);
    } else {
        return null;
    }
}
/*
功能：删除cookies函数
参数：name，cookie名字 注意path
*/
function DelCookie(name) {
    var exp = new Date(); //当前时间
    exp.setTime(exp.getTime() - 1);
    var cval = GetCookie(name);
    if (cval != null) document.cookie = name + "=" + cval + "; path=/;expires=" + exp.toGMTString();
}

//两种调用方式
//var template1 = "我是{0}，今年{1}了";
//var template2 = "我是{name}，今年{age}了";
//var result1 = template1.format("loogn", 22);
//var result2 = template2.format({ name: "loogn", age: 22 });
String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}
String.format = function () {
    if (arguments.length == 0)
        return null;

    var str = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
}

//以图片类型为key的图片元素
function uploaderImg(initBrowseElement, callback, options) {
    var browseElement = {}
    for (var type in initBrowseElement) {
        browseElement[type] = initBrowseElement[type]
    }
    $(document.body).append($('<input id="hidden-uploader-btn" type="file" style="display:none"  hidden/>'))
    for (var type in initBrowseElement) {
        (function (type) {
            var jqInput = $('<input type="file" accept="image/*" style="display:none"  hidden/>').change(function () {
                var imgDiv = $(initBrowseElement[type])[0]
                var file = this.files[0]
                if (file) {
                    curType = type
                    curElement = initBrowseElement[type]
                    uploader.addFile(file)
                }
            })
            $(document.body).append(jqInput)
            $(initBrowseElement[type]).click(function () {
                jqInput.click()
            })
        })(type)
    }

    function getType(file) {
        for (var type in uploader.fileList) {
            for (var element in uploader.fileList[type]) {
                if (uploader.fileList[type][element] === file) {
                    return type
                }
            }
        }
    }

    function getPanel(file) {
        var type = getType(File)
        for (var element in uploader.fileList[type]) {
            if (uploader.fileList[type][element] === file) {
                return element
            }
        }

    }
    var curType
    var curElement
    uploader = new plupload.Uploader({
        browse_button: "hidden-uploader-btn",
        filters: {
            mime_types: [ //只允许上传图片
                {
                    title: "Image files",
                    extensions: "jpeg,jpg,png"
                },
            ],
            max_file_size: '10mb'
        },
        resize: {
            width: 2500,
            quality: 92,
            crop: false,
            preserve_headers: true
        },
        init: {

            'PostInit': function () { },
            'FilesAdded': function (up, files) {
                var file = files[0]
                if (curType && curElement) {
                    //删除原先的图片
                    if (!uploader.fileList[curType]) {
                        uploader.fileList[curType] = {}
                    }

                    if (uploader.fileList[curType][curElement]) {
                        uploader.removeFile(uploader.fileList[curType][curElement])
                    }
                    uploader.fileList[curType][curElement] = file
                    var freader = new FileReader()
                    freader.readAsDataURL(file.getNative())
                    freader.onload = function (e) {
                        $(curElement).css("background-image", "url(" + e.target.result + ")").addClass("bx-sz-img-loaded")
                        if (options && options.fileAdded) {
                            options.fileAdded($(curElement)[0].id, file.getNative(), e.target.result)
                        }
                    }
                } else {
                    uploader.removeFile(file)
                }
            },
            'BeforeUpload': function (up, file) {
                var type = getType(file)
                if (type) {
                    var auth = uploader.fileAuths[type]
                    var fileauth
                    if (auth instanceof Array) {
                        for (var i = 0; i < auth.length; i++) {
                            if (!auth[i].used) {
                                fileauth = auth[i]
                                uploader.fileAuths[type][i].used = true
                                break
                            }
                        }
                    } else {
                        fileauth = auth
                    }
                    if (fileauth) {
                        var new_multipart_params = {
                            'key': fileauth.objname,
                            'OSSAccessKeyId': fileauth.accessid,
                            'policy': fileauth.policy,
                            'signature': fileauth.signature,
                            'callback': fileauth.callback,
                            'success_action_status': '200'
                        }
                        up.setOption({
                            'url': fileauth.host,
                            'multipart_params': new_multipart_params
                        })
                        up._start()
                    } else {
                        up.removeFile(file)
                    }
                } else {
                    up.removeFile(file)
                }

            },
            'FileUploaded': function (up, file, info) {
                if (info.status === 200) {
                    var type = getType(file)
                    if (type) {
                        //不删除list, 可能会导致重复上传图片,注意
                        //uploader.fileList[type] = null
                    }
                    try {
                        var response = JSON.parse(info.response)
                        if (callback) {
                            callback(response)
                        }
                    } catch (e) {
                        //TODO handle the exception
                    }
                } else {
                    if (options && options.uploadedError) {
                        options.uploadedError(up, file, info)
                    } else {
                        var div = getPanel(file)
                        if (div) {
                            $(div).css("background-image", "none")
                            $(div).removeClass("bx-sz-img-loaded");
                            layer.msg('上传失败,请重新上传', { icon: 2 });
                        }
                    }
                }
            },
            'Error': function (up, err) {
                if (err.file) {
                    var div = getPanel(err.file)
                    if (div) {
                        $(div).css("background-image", "none")
                        $(div).removeClass("bx-sz-img-loaded")
                    }
                    switch (err.code) {
                        case plupload.FILE_SIZE_ERROR:
                            layer.msg('文件大小超出上传上限', { icon: 2 });
                            break;
                        case plupload.FILE_EXTENSION_ERROR:
                            layer.msg('文件格式错误', { icon: 2 });
                            break;
                        case plupload.FILE_DUPLICATE_ERROR:
                            layer.msg('不能上传同一张图片', { icon: 2 });
                            break;
                        case plupload.IMAGE_FORMAT_ERROR:
                            layer.msg('图片格式出错', { icon: 2 });
                            break;
                        default:
                            layer.msg('请重新上传', { icon: 2 });
                            break;
                    }
                } else {
                    layer.msg('上传失败,请重新上传..', { icon: 2 });
                }
                if (options && options.error) {
                    options.error(up, err)
                }
            }
        }
    })
    uploader.fileList = {}
    uploader.fileAuths = {}
    uploader.init()
    uploader._start = uploader.start
    uploader.start = function (fileAuths) {
        uploader.fileAuths = fileAuths
        uploader._start()
    }

    uploader.addImg = function (elementName, type) {
        if (browseElement[type] instanceof Array) {
            browseElement[type].push(elementName)
        } else {
            var oldele = browseElement[type]
            browseElement[type] = [oldele, elementName]
        }
        var jqInput = $('<input type="file" accept="image/*" style="display:none" hidden/>').change(function () {
            var file = this.files[0]
            if (file) {
                curType = type
                curElement = elementName
                uploader.addFile(file)
            }
        })
        $(document.body).append(jqInput)
        $(elementName).click(function () {
            jqInput.click()
        })
    }
    uploader.getPictures = function () {
        var pictures = []
        for (var type in browseElement) {
            var oneType = {
                UploadFileType: type,
                NewCount: 0,
                ModifyList: []
            }
            if (browseElement[type] instanceof Array) {
                for (var i = 0; i < browseElement[type].length; i++) {
                    var eleId = browseElement[type][i]
                    if ($(eleId).hasClass("bx-sz-img-loaded")) {
                        if (uploader.fileList[type] && uploader.fileList[type] && uploader.fileList[type][eleId]) {
                            var modId = parseInt($(eleId).attr("data-modify-idx"))
                            if (modId === 0 || modId) {
                                oneType.ModifyList.push(modId)
                            } else {
                                oneType.NewCount++
                            }
                        }
                    }
                }
            } else {
                var eleId = browseElement[type]
                if ($(eleId).hasClass("bx-sz-img-loaded") && uploader.fileList[type] && uploader.fileList[type][eleId]) {
                    var modId = parseInt($(eleId).attr("data-modify-idx"))
                    if (modId === 0 || modId) {
                        oneType.ModifyList.push(modId)
                    } else {
                        oneType.NewCount = 1
                    }
                }
            }
            if (oneType.NewCount > 0 || oneType.ModifyList.length > 0) {
                pictures.push(oneType)
            }
        }
        return pictures
    }

    uploader.removeAllImgs = function (elementName, type) {
        browseElement = {},
            uploader.fileList = {}
    }
    return uploader
}

function CreateImgsByMultyUrl(div, url) {
    $(div).html("");
    if (url) {
        var arr = url.split(',');
        for (var i = 0; i < arr.length; i++) {
            var img = document.createElement("img");
            img.setAttribute("src", arr[i]);
            img.setAttribute("style", "margin-top:5px");
            var viewer = new Viewer(img);
            $(div).append(img);
            $(div).append("<br />");
        }
    }
}
function CreateImgsByMultyUrlNew(div, url) {
    $(div).html("");
    if (url) {
        var arr = url.split(',');
        for (var i = 0; i < arr.length; i++) {
            var img = document.createElement("img");
            img.setAttribute("src", arr[i]);
            img.setAttribute("style", "margin-top:5px");

            $(div).append(img);
            $(div).append("<br />");
        }
    }
}
//生成发票图片
function CreateInvoiceImgs(div, invoiceInfo) {
    $(div).html("");
    if (invoiceInfo) {
        for (var i = 0; i < invoiceInfo.OurInvoiceUrlList.length; i++) {
            var url = invoiceInfo.OurInvoiceUrlList[i].m_Item2.URL;
            var imgdiv = document.createElement("imgDiv");
            $(imgdiv).append('<h4 style="color:#45B4FF; margin-top:5px;">第' + invoiceInfo.OurInvoiceUrlList[i].m_Item1 + '期</h4>');
            $(imgdiv).append('<p style="margin-top:5px;"><b style="margin-right:10px;">发票号:</b>' + invoiceInfo.OurInvoiceUrlList[i].m_Item2.Id + '</p>');
            $(imgdiv).append('<p style="margin-top:5px;"><b style="margin-right:10px;">开票时间:</b>' + invoiceInfo.OurInvoiceUrlList[i].m_Item2.Time + '</p>');
            var img = document.createElement("img");
            img.setAttribute("src", url);
            var viewer = new Viewer(img);
            $(imgdiv).append(img);
            $(div).append(imgdiv);
        }
    }
}


function CreateInvoiceImgsNew(div, invoiceInfo) {
    $(div).html("");
    if (invoiceInfo) {
        for (var i = 0; i < invoiceInfo.OurInvoiceUrlList.length; i++) {
            var url = invoiceInfo.OurInvoiceUrlList[i].m_Item2.URL;
            var imgdiv = document.createElement("imgDiv");
            $(imgdiv).append('<h4 style="color:#45B4FF; margin-top:5px;">第' + invoiceInfo.OurInvoiceUrlList[i].m_Item1 + '期</h4>');
            $(imgdiv).append('<p style="margin-top:5px;"><b style="margin-right:10px;">发票号:</b>' + invoiceInfo.OurInvoiceUrlList[i].m_Item2.Id + '</p>');
            $(imgdiv).append('<p style="margin-top:5px;"><b style="margin-right:10px;">开票时间:</b>' + invoiceInfo.OurInvoiceUrlList[i].m_Item2.Time + '</p>');
            var img = document.createElement("img");
            img.setAttribute("src", url);

            $(imgdiv).append(img);
            $(div).append(imgdiv);
        }
    }
}

/*created by wanglingfeng*/
//所有图片的入口
function ImgCreated(options) {
    this.id = options.id;
    this.url = options.url;
    this.dataType();
    this.create();

}
//判断数据是否正常
function dataType() {
    var gettype = Object.prototype.toString;
    var utility = {
        isStr: function (o) {
            return gettype.call(o) == "[object String]";
        },
        isObj: function (o) {
            return gettype.call(o) == "[object Object]";
        },
        isArr: function (o) {
            return gettype.call(o) == "[object Array]";
        },
        isNull: function (o) {
            return gettype.call(o) == "[object Null]";
        },
    }
    if (!utility.isArr(this.id)) throw 'ID  type must be an array';
    if (!utility.isArr(this.url)) throw 'URL  type must be an array';
    if (this.id.length !== this.url.length) throw 'The length of ID and URL must be the same';
}

//图片放大
function imgShowBig(id) {

    var viewer = new Viewer(document.getElementById(id), {
        ready: function () {
            viewer.update();
        },
        show: function () {
            viewer.update();

        },
        shown: function () {
            viewer.update();

        },
        hide: function () {
            viewer.update();
        }
    });

}

//创建img图片
function create() {
    var that = this;
    var type = [null, undefined, NaN]
    this.url.forEach(function (value, index, array) {
        var html = document.getElementById(that.id[index]);
        html.innerHTML = '';
        if (type.indexOf(value) >= 0) return false;
        value.split(',').forEach(function (val, ind, arr) {
            var img = document.createElement('img'); // 创建img标签
            img.className = 'idePhoto';
            img.setAttribute('src', val);
            html.appendChild(img);
        });
    });
}
ImgCreated.prototype.dataType = dataType;
ImgCreated.prototype.create = create;

//显示确认框
function showConfirm(text, func) {
    layer.confirm("是否确定" + text, {
        btn: ["确定", "取消"],
        success: function () {
            this.enterEsc = function (event) {
                if (event.keyCode === 13) {
                    $(".layui-layer-btn0").click();
                    return false; //阻止系统默认回车事件
                } else if (event.keyCode == 27) {
                    $(".layui-layer-btn1").click();
                    return false;
                }
            };
            $(document).on('keydown', this.enterEsc); //监听键盘事件，关闭层
        },
        end: function () {
            $(document).off('keydown', this.enterEsc); //解除键盘关闭事件

        }
    }, function (index) {
        layer.close(index);
        func();
    }, function (index) {
        layer.close(index);
    });
}

function focusIn(uiElement, className = "label-danger") {
    var ele = uiElement.parent().find("." + className + ":first");
    ele.html();
    ele.addClass("hidden");
}
function inputChange(uiElement, className) {
    var ele = uiElement.parents("." + className + ":first").find(".label-danger");
    ele.html();
    ele.addClass("hidden");
}
function hideTip(uiElement) {
    if (typeof (uiElement) == "string") {
        $("#" + uiElement).addClass("hidden");
        $("#" + uiElement).html();
    } else {
        uiElement.addClass("hidden");
        uiElement.html();
    }
}
function showTip(uiElement, text) {
    if (typeof (uiElement) == "string") {
        $("#" + uiElement).removeClass("hidden");
        $("#" + uiElement).html(text);
    } else {
        uiElement.removeClass("hidden");
        uiElement.html(text);
    }
}
function hideClassTip(hClass) {
    $("." + hClass).addClass("hidden");
    $("." + hClass).html();
}
function showClassTip(hClass, text) {
    $("." + hClass).removeClass("hidden");
    $("." + hClass).html(text);
}

//采用正则表达式获取地址栏参数
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

//异步获取数据
function getFilePath(opData, func = undefined, cover = 1, msg = undefined) {
    ajaxPost(filePathUrl, opData, ret => {
        const errMsg = ret.errmsg;
        if (ret.errno == 0) {
            if (func != undefined) {
                ret.data.forEach(d => {
                    d.path = fileUrl + d.path;
                });
                func(ret.data);
            }
        } else {
            return layer.msg(errMsg);
        }
    }, cover);
}

//异步获取数据
function getFilePathAsync(opData, func = undefined, cover = 1, msg = undefined) {
    return new Promise(resolve => {
        ajaxPost(filePathUrl, opData, ret => {
            const errMsg = ret.errmsg;
            if (ret.errno == 0) {
                if (func != undefined) {
                    ret.data.forEach(d => {
                        d.path = fileUrl + d.path;
                    });
                    func(ret.data);
                }
                resolve(ret);
            } else {
                return layer.msg(errMsg);
            }
        }, cover);
    });
}

//单个文件
function initFileInput(uiEle, type, func = null) {
    $("#" + uiEle).attr("accept", fileAccept[type]);
    var obj = $("#" + uiEle).fileinput({
        language: 'zh', //设置语言 
        uploadUrl: fileUploadUrl + "/File",
        //enctype: 'multipart/form-data',
        allowedFileExtensions: fileExt[type],//接收的文件后缀
        showUpload: false, //是否显示上传按钮
        showPreview: true, //展前预览
        showCaption: true,//是否显示标题
        //maxFileSize: 10000,//上传文件最大的尺寸
        minFileCount: 1,
        maxFileCount: 1,
        dropZoneEnabled: false,//是否显示拖拽区域
        browseClass: "btn btn-primary", //按钮样式
        uploadAsync: true,
        autoReplace: true,
        layoutTemplates: {
            actionDelete: '', //去除上传预览的缩略图中的删除图标  
            actionUpload: '',//去除上传预览缩略图中的上传图片；  
            actionZoom: ''   //去除上传预览缩略图中的查看详情预览的缩略图标。                
        },
        uploadExtraData: function () {
            //向后台传递type作为额外参数
            var obj = {};
            obj.type = type;
            obj.dir = "";
            for (var k in fileEnum) {
                if (fileEnum[k] == type) {
                    obj.dir = k;
                    break;
                }
            }
            obj.typeStr = type;
            return obj;
        }
    }).on("filebatchselected", function (event, files) {
        if (files.length > 1) {
            $("#" + uiEle).fileinput('clear');
        }
        switch (type) {
            case fileEnum.FirmwareLibrary:
            case fileEnum.ApplicationLibrary:
                if (files.length != undefined)
                    $("#" + uiEle).fileinput('clear');

                var name = "";
                for (var key in files) {
                    if (files.hasOwnProperty(key)) {
                        name = key;
                        break;
                    }
                }
                if (!checkFileExt(name, fileExt[type]))
                    $("#" + uiEle).fileinput('clear');
                break;
            default:
        }
    }).on('filepreupload', function (event, data, msg) {     //上传中
        var form = data.form, files = data.files, extra = data.extra,
            response = data.response, reader = data.reader;
        console.log('文件正在上传');
    }).on('fileerror', function (event, data, msg) {
        console.log('文件上传失败！' + msg);
        $(this).fileinput('clear');
    }).on("fileuploaded", function (event, fileRet, previewId, index) {
        console.log(`文件上传${fileRet.response.errmsg}！`);
        $(this).fileinput('clear');
        fileCallBack[type](fileRet.response);
    });

    return obj;
}

var prepareUpload = [];
//多个文件
function initFileInputMultiple(uiEle, type, func = null) {
    prepareUpload = [];
    $("#" + uiEle).attr("multiple", "");
    $("#" + uiEle).attr("accept", fileAccept[type]);

    var obj = $("#" + uiEle).fileinput({
        language: 'zh', //设置语言 
        uploadUrl: fileUploadUrl + "/FileMultiple",
        //enctype: 'multipart/form-data',
        allowedFileExtensions: fileExt[type],//接收的文件后缀
        showUpload: false, //是否显示上传按钮
        showPreview: true, //展前预览

        //resizeImage: true,
        //maxImageWidth: 200,
        //maxImageHeight: 200,
        //resizePreference: 'width',

        showCaption: true,//是否显示标题
        //maxFileSize: 10000,//上传文件最大的尺寸
        minFileCount: 0,//每次上传允许的最少文件数。如果设置为0，则表示文件数是可选的。默认为0
        maxFileCount: 0, //每次上传允许的最大文件数。如果设置为0，则表示允许的文件数是无限制的。默认为0
        dropZoneEnabled: false,//是否显示拖拽区域
        browseClass: "btn btn-primary", //按钮样式
        uploadAsync: true,
        autoReplace: false,
        layoutTemplates: {
            //actionDelete: '', //去除上传预览的缩略图中的删除图标
            actionUpload: '',//去除上传预览缩略图中的上传图片；  
            //actionZoom: ''   //去除上传预览缩略图中的查看详情预览的缩略图标。
        },
        uploadExtraData: function () {
            //向后台传递type作为额外参数
            var obj = {};
            obj.type = type;
            obj.dir = "";
            for (var k in fileEnum) {
                if (fileEnum[k] == type) {
                    obj.dir = k;
                    break;
                }
            }
            return obj;
        }
    }).on("filebatchselected", function (event, files) {
        var name = "";
        for (var key in files) {
            if (files.hasOwnProperty(key)) {
                name = key;
                if (!checkFileExt(name, fileExt[type])) {
                    $("#" + uiEle).fileinput('clear');
                    break;
                }
                var pre = $("#" + $(this).attr("parent"))
                    .find('[data-fileid="{0}"]'.format(name))
                    .filter('.file-preview-frame')
                    .first().attr("id");
                if (!prepareUpload[pre]) {
                    prepareUpload[pre] = {
                        pre: pre,
                        name: name,
                        done: false
                    };
                }
            }
        }
    }).on('fileclear', function (evt, file) {
        // 点击右上角叉叉执行
        //console.log('删除所有选择文件');
        prepareUpload = [];
    }).on('fileremoved', function (evt, file) {
        // 该事件钩子针对只选择不上传的情况
        console.log('删除选择文件');
        prepareUpload = removeArrayObj(prepareUpload, file);
    }).on('filepreupload', function (event, data, msg) {     //上传中
        console.log('文件正在上传');
        var form = data.form, files = data.files, extra = data.extra,
            response = data.response, reader = data.reader;
    }).on('fileerror', function (event, data, msg) {
        console.log('文件上传失败！' + msg);
        $(this).fileinput('clear');
        fileCallBack[type]({
            errno: 1,
            errmsg: "失败"
        });
    }).on("fileuploaded", function (event, fileRet, previewId, index) {
        var res = fileRet.response;
        if (res.errno == 0) {
            console.log("文件上传成功！");
            for (var j = 0; j < res.data.length; j++) {
                var file = res.data[j];
                prepareUpload[previewId].done = true;
                prepareUpload[previewId].newName = file.newName;
            }
        } else {
            console.log('文件上传失败！');
            layer.msg(res.errmsg);
        }
    }).on('filebatchuploadcomplete', function (event, fileRet, previewId, index) {
        console.log("文件全部上传成功！");
        var r = true;
        for (var key in prepareUpload) {
            if (prepareUpload.hasOwnProperty(key)) {
                if (!prepareUpload[key].done)
                    r = false;
            }
        }
        //$(this).fileinput('clear');
        if (r) {
            fileCallBack[type]({
                errno: 0,
                errmsg: "成功",
                data: prepareUpload
            });
        } else {
            fileCallBack[type]({
                errno: 1,
                errmsg: "失败"
            });
        }
        prepareUpload = [];

    });

    return obj;
}

function hasPre() {
    var r = false;
    for (var key in prepareUpload) {
        if (prepareUpload.hasOwnProperty(key)) {
            r = true;
        }
    }
    return r;
}

function checkFileExt(file, fileExt) {
    var str = file.toLowerCase().split(".");
    if (str.length > 1) {
        for (var i = 0; i < fileExt.length; i++) {
            if (str[str.length - 1] == fileExt[i])
                return true;
        }
    }
    return false;
}

//时间数值限制
function onTimeLimitInput(obj, number = 59, zs = 5) {
    obj.value = input(obj.value, zs, 0);
    obj.value = obj.value < 0 ? 0 : obj.value;
    obj.value = obj.value > number ? number : obj.value;
}

//整数5位  小数4位
function onInput(obj, zs = 5, xs = 4, min = undefined, max = undefined) {
    var v = "";
    if (obj.value)
        v = obj.value;
    else if ($(obj).val())
        v = $(obj).val();
    else if ($(obj).text())
        v = $(obj).text();

    v = input(v, zs, xs);
    if (min && parseFloat(v) < min)
        v = min;
    if (max && parseFloat(v) > max)
        v = max;

    if (obj.value)
        obj.value = v;
    else if ($(obj).val())
        $(obj).val(v);
    else if ($(obj).text())
        $(obj).text(v);
}

function input(s, zs = 5, xs = 4) {

    //修复第一个字符是小数点 的情况.
    if (s != '' && s.substr(0, 1) == '.') {
        s = "";
    }
    s = s.replace(/^0*(0\.|[1-9])/, '$1');//解决 粘贴不生效
    s = s.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
    s = s.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的     
    s = s.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    ///^(\-)*(\d+)\.(\d{4}).*$/
    var reg = eval("/^(\\-)*(\\d+)\\.(\\d{" + xs + "}).*$/")
    s = s.replace(reg, '$1$2.$3');//只能输入xs个小数     
    if (s.indexOf(".") < 0 && s != "") {
        //以上已经过滤，此处控制的是如果没有小数点，首位不能为0
        //if (s.substr(0, 1) == '0' && s.length == 2) {
        //    s = s.substr(1, s.length);
        //}
        while (s.substr(0, 2) == '00') {
            s = s.substr(1, s.length);
        }
    }

    if (s != '') {
        s = s.split(".");
        if (s.length > 0 && s[0].length >= zs) {
            s[0] = s[0].substr(0, zs);
        }
        if (s.length > 0 && s[1] && s[1].length >= xs) {
            s[1] = s[1].substr(0, xs);
        }
        if (xs > 0) {
            s = s.join(".");
        } else {
            s = s.join("");
        }
    }
    isStrEmptyOrUndefined(s) && (s = '0');
    return s;
}

function onInputEnd(obj) {
    obj.value = inputEnd(obj.value);
}

function inputEnd(s) {
    if (s.indexOf(".") > -1 && s != "") {
        s = s.split("").reverse().join("");
        while (s.substr(0, 1) == '0') {
            s = s.substr(1, s.length);
        }
        while (s.substr(0, 1) == '.') {
            s = s.substr(1, s.length);
        }
        return s.split("").reverse().join("");
    } else {
        return s;
    }
}


//整数,逗号隔开
function onInputDouHao(obj) {
    var v = "";
    if (obj.value)
        v = obj.value;
    else if ($(obj).val())
        v = $(obj).val();
    else if ($(obj).text())
        v = $(obj).text();

    v = inputDouHao(v);
    if (obj.value)
        obj.value = v;
    else if ($(obj).val())
        $(obj).val(v);
    else if ($(obj).text())
        $(obj).text(v);
}

function inputDouHao(s, zs = 5, xs = 4) {

    //修复第一个字符是逗号 的情况.
    if (s != '' && s.substr(0, 1) == ',') {
        s = "";
    }
    //修复最后一个字符是逗号 的情况.
    while (s != '' && s[s.length - 1] == ',') {
        s = s.substr(0, s.length - 1);
    }
    s = s.replace(/^0*(0\.|[1-9])/, '$1');//解决 粘贴不生效
    s = s.replace(/[^\d,]/g, "");  //清除“数字”和“,”以外的字符
    //s = s.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的     
    s = s.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");

    //修复最后一个字符是逗号 的情况.
    while (s != '' && s[s.length - 1] == ',') {
        s = s.substr(0, s.length - 1);
    }
    isStrEmptyOrUndefined(s) && (s = '');
    return s;
}


function autoCal(obj, ui) {
    if (obj.value == '')
        return;

    var t = 0;
    if (obj.value.indexOf("±") > -1)
        t = 1;
    else if (obj.value.indexOf("+") > -1 && obj.value.indexOf("/") > -1 && obj.value.indexOf("-") > -1)
        t = 3;
    else if (obj.value.indexOf("～") > -1 || obj.value.indexOf("~") > -1 || obj.value.indexOf("-") > -1)
        t = 2;

    ui = $("#" + ui);
    var num = [];
    var s = obj.value.replace(" ", "").split("");
    s.push(";");
    var n = "";
    for (var i = 0; i < s.length; i++) {
        if (t == 3) {
            if (isNumber(s[i]) || s[i] == '.' || s[i] == '-') {
                n += s[i];
            } else {
                if (isNumber(n))
                    num[num.length] = parseFloat(n);
                n = "";
            }
        } else {
            if (isNumber(s[i]) || s[i] == '.') {
                n += s[i];
            } else {
                if (isNumber(n))
                    num[num.length] = parseFloat(n);
                n = "";
            }
        }
    }

    var p;
    switch (t) {
        case 1:
            if (num.length >= 1) {
                p = num[0];
            }
            break;
        case 2:
            if (num.length == 1) {
                p = num[0];
            } else if (num.length >= 2) {
                p = (num[0] + num[1]) / 2.0;
            }
            break;
        case 3:
            if (num.length == 1) {
                p = num[0];
            }
            else if (num.length >= 3) {
                p = num[0] + (num[1] + num[2]) / 2;
            }
            break;
        default:
            if (num.length >= 1) {
                p = num[0];
            } else {
                p = 0;
            }
            break;
    }
    p = p.toFixed(4);
    p = input(p.toString());
    p = inputEnd(p.toString());
    ui.val(p);
}

//判断当前页面是pc端还是移动端
function pcAndroid() {
    return /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
}

//Array.prototype.selectMany = function (selector) {
//    return this.map(selector).reduce(function (a, b) {
//        return a.concat(b);
//    });
//};
function selectMany(t, key) {
    return t.map(x => x[key]).reduce((a, b, i) => a.concat(b));
}

//https://blog.csdn.net/weixin_33810006/article/details/88980650
//分组
//let list = [
//    { "name": "John", "Average": 15, "High": 10, "DtmStamp": 1358226000000 },
//    { "name": "Jane", "Average": 16, "High": 92, "DtmStamp": 1358226000000 },
//    { "name": "Jane", "Average": 17, "High": 45, "DtmStamp": 1358226000000 },
//    { "name": "John", "Average": 18, "High": 87, "DtmStamp": 1358226000000 },
//    { "name": "Jane", "Average": 15, "High": 10, "DtmStamp": 1358226060000 },
//    { "name": "John", "Average": 16, "High": 87, "DtmStamp": 1358226060000 },
//    { "name": "John", "Average": 17, "High": 45, "DtmStamp": 1358226060000 },
//    { "name": "Jane", "Average": 18, "High": 92, "DtmStamp": 1358226060000 }
//];

//let sorted = groupBy(list, function (item) {
//    return [item.name];
//});
function groupBy(array, f) {
    let groups = {};
    array.forEach(function (o) {
        let group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
        return groups[group];
    });
}

//数组对象实现字母、数字的混合排序：
function SortNumberString(array, par) {
    return array.sort(function (a, b) {
        return a[par].localeCompare(b[par], 'zh-CN', { numeric: true });
    });
}

//数组是否相等
function isEqual(arr1, arr2) {
    // if the other array is a falsy value, return
    if (!arr1 || !arr2)
        return false;

    // compare lengths - can save a lot of time
    if (arr1.length != arr2.length)
        return false;

    for (var i = 0, l = arr1.length; i < l; i++) {
        // Check if we have nested arrays
        if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!arr1[i].equals(arr2[i]))
                return false;
        }
        else if (arr1[i] != arr2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

//数组对象排序
function objectSort(array, par) {
    var i, j, tmp, len = array.length;
    for (i = 0; i < len - 1; i++) {
        //假设排序ok
        var isSort = true;
        for (j = 0; j < len - 1 - i; j++) {
            if (array[j][par] > array[j + 1][par]) {
                //没有排序好
                isSort = false;
                tmp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = tmp;
            }
        }
        if (isSort) {
            //如果排序好了
            break;
        }
    }
}
//高性能数组去重
//function distinct(a) {
//    return Array.from(new Set([...a]));
//}
function distinct(arr) {
    var result = [];
    var obj = {};
    var i, len = arr.length;
    for (i = 0; i < len; i++) {
        var d = arr[i];
        if (!obj[d]) {
            result.push(d);
            obj[d] = 1;
        }
    }
    return result;
}

// a[0] = {n1, n2, n3};
// a[1] = {n1, n4, n5};
// 参数 a  , n1,  1,  true/false
function removeArray(arr, value, all = false) {
    for (var key in arr) {
        if (key.hasOwnProperty(value)) {
            arr.splice(arr.indexOf(key), all ? arr.length : 1);
            break;
        }
    }
    return arr;
}

// a[0] = {n1 = 1, n2 = 2, n3 = 3};
// a[1] = {n1 = 1, n4 = 4, n5 = 5};
// 参数 a  , n1,  1,  true/false
function removeArray(arr, key, value, all = false) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i][key] == value) {
            arr.splice(arr.indexOf(arr[i]), all ? arr.length : 1);
            break;
        }
    }
    return arr;
}

function removeArray(arr, key1, value1, key2, value2, all = false) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i][key1] == value1 && arr[i][key2] == value2) {
            arr.splice(arr.indexOf(arr[i]), all ? arr.length : 1);
            break;
        }
    }
    return arr;
}

// a["1"] = obj;
function removeArrayObj(arr, key, all = false) {
    var res = [];
    for (var k in arr) {
        if (k != key) {
            if (!res[k] && !all) {
                res[k] = arr[k];
            }
        }
    }
    return res;
}

// [n1, n2, n3];
function existArray(arr, value) {
    for (var key in arr) {
        if (arr[key] == value)
            return true;
    }
    return false;
}

// [{key:value}, {key:value}];
function existArrayObj(arr, key, value) {
    for (var k in arr) {
        if (arr[k].hasOwnProperty(key)) {
            if (arr[k][key] == value)
                return true;
        }
    }
    return false;
}

// [n1, n2, n3];
function sliceArray(arr, len, start = 0) {
    !arr && (arr = []);
    return arr.slice(start, len);
}

function clone(obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(clone(obj[i]));
                }
            } else {
                o = {};
                for (var k in obj) {
                    o[k] = clone(obj[k]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
}

//备注模态框
function showAllContent(content, title = "备注", id = "") {
    content = unescape(content);
    if (id == "")
        id = "remarkModel";
    var html =
        `<div class="modal fade" id="${id}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
               <div class="modal-content">
                   <div class="modal-header">
                       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                       <h4 class="modal-title">${title}</h4>
                   </div>
                   <div class="modal-body">
                       <div class="form-group">
                           <textarea class="form-control" disabled="disabled" id="usuallyFaultDetail" style="resize: vertical; height: 200px; overflow-y: scroll;">${content}</textarea>
                       </div>
                   </div>
                   <div class="modal-footer">
                       <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                   </div>
                </div>
           </div>
        </div>`;

    var modal = $(html);
    $(".content").append(modal);

    modal.modal("show");

    modal.on('hidden.bs.modal',
        function () {
            modal.remove();
        });
}

//二维码扫描模态框
function showPrintModal(resolve) {
    var modalId = '_printModal';
    var html =
        `<div class="modal fade" id="${modalId}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
               <div class="modal-content">
                   <div class="modal-header">
                       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                       <h4 class="modal-title"></h4>
                   </div>
                   <div class="modal-body" style="position:relative">
                        <div class="qrcode-box" style="position:absolute;left:50%;transform:translateX(-50%);width:300px;height:300px">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <video style="width: 100%;height:300px"></video>
                        <canvas class="hidden" width="300" height="300"></canvas>
                   </div>
                   <div class="modal-footer">
                       <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                   </div>
               </div>
           </div>
        </div>`;
    var modal = $(html);
    $(".content").append(modal);
    var closeVideo, canvasImg, qrCode = null;
    var video = $('#_printModal video')[0];
    var canvas = $('#_printModal canvas')[0];
    var context = canvas.getContext('2d');
    modal.on('hidden.bs.modal',
        function () {
            if (closeVideo) {
                closeVideo.stop();
            }
            if (canvasImg) {
                clearInterval(canvasImg);
            }
            resolve(qrCode);
            modal.remove();
        });
    $(document).on("visibilitychange", function () {
        var page = this.visibilityState;
        if (page == "hidden") {
            modal.modal('hide');
        }
    });
    var getUserMedia = (constraints, success, error) => {
        if (navigator.mediaDevices.getUserMedia) {
            //最新的标准API
            navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
        } else if (navigator.webkitGetUserMedia) {
            //webkit核心浏览器
            navigator.webkitGetUserMedia(constraints).then(success).catch(error);
        } else if (navigator.mozGetUserMedia) {
            //firfox浏览器
            navigator.mozGetUserMedia(constraints).then(success).catch(error);
        } else if (navigator.getUserMedia) {
            //旧版API
            navigator.getUserMedia(constraints).then(success).catch(error);
        }
    }
    var capture = () => {
        context.drawImage(video, 0, 0, 300, 300);
        qrcode.decode(canvas.toDataURL('image/png'));
        qrcode.callback = (e) => {
            //结果回调
            if (e != "error decoding QR Code") {
                if (/,/.test(e)) {
                    qrCode = e;
                    clearInterval(canvasImg);
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    modal.modal('hide');
                } else {
                    alert(e);
                }
            }
        }
    }
    if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
        //调用用户媒体设备, 访问摄像头
        getUserMedia({
            video: {
                width: 500,
                height: 500,
                //user前置摄像头
                facingMode: { exact: "environment" }
            }
        }, (stream) => {
            modal.modal("show");
            video.srcObject = stream;
            video.play();
            closeVideo = stream.getTracks()[0];
            canvasImg = setInterval(capture, 500);
        }, () => {
            modal.modal('hide');
            layer.msg("访问用户媒体设备失败");
        });
    } else {
        modal.modal('hide');
        layer.msg('不支持访问用户媒体');
    }
}

function getObjectURL(file) {
    var url = null;
    if (window.createObjectURL != undefined) {          // basic
        url = window.createObjectURL(file);
    } else if (window.URL != undefined) {               // mozilla(firefox)
        url = window.URL.createObjectURL(file);
    } else if (window.webkitURL != undefined) {         // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
    }
    return url;
}

//上传图片识别二维码
function printImgUp(resolve, fileId) {
    var file = getObjectURL(fileId.files[0]);
    qrcode.decode(file);
    qrcode.callback = function (e) {
        //结果回调
        URL.revokeObjectURL(file);
        if (e != "error decoding QR Code") {
            if (/,/.test(e)) {
                resolve(e);
            } else {
                layer.msg('请上传集中控制相关的二维码图片');
                resolve(null);
            }
        } else {
            layer.msg('识别失败');
            resolve(null);
        }
    }
}

function showBigImg(url) {
    url = unescape(url);
    const html = `<div id="outerDiv" class="hidden" style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:10000;width:100%;height:100%;">
                    <div id="innerDiv" style="position:absolute;">
                        <img id="bigImg" style="border:5px solid #fff;" src="" />
                    </div>
                </div>`;
    var modal = $(html);
    $(".content").append(modal);
    var outerDiv = "#outerDiv";
    var innerDiv = "#innerDiv";
    var bigImg = "#bigImg";
    $(bigImg).attr("src", url);//设置#bigImg元素的src属性

    /*获取当前点击图片的真实大小，并显示弹出层及大图*/
    $("<img/>").attr("src", url).load(function () {
        var windowW = $(window).width();//获取当前窗口宽度
        var windowH = $(window).height();//获取当前窗口高度
        var realWidth = this.width;//获取图片真实宽度
        var realHeight = this.height;//获取图片真实高度
        var imgWidth, imgHeight;
        var scale = 0.8;//缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放

        if (realHeight > windowH * scale) {//判断图片高度
            imgHeight = windowH * scale;//如大于窗口高度，图片高度进行缩放
            imgWidth = imgHeight / realHeight * realWidth;//等比例缩放宽度
            if (imgWidth > windowW * scale) {//如宽度扔大于窗口宽度
                imgWidth = windowW * scale;//再对宽度进行缩放
            }
        } else if (realWidth > windowW * scale) {//如图片高度合适，判断图片宽度
            imgWidth = windowW * scale;//如大于窗口宽度，图片宽度进行缩放
            imgHeight = imgWidth / realWidth * realHeight;//等比例缩放高度
        } else {//如果图片真实高度和宽度都符合要求，高宽不变
            imgWidth = realWidth;
            imgHeight = realHeight;
        }
        $(bigImg).css("width", imgWidth);//以最终的宽度对图片缩放

        var w = (windowW - imgWidth) / 2;//计算图片与窗口左边距
        var h = (windowH - imgHeight) / 2;//计算图片与窗口上边距
        $(innerDiv).css({ "top": h, "left": w });//设置#innerdiv的top和left属性
        $(outerDiv).removeClass("hidden").fadeIn("fast");//淡入显示#outerdiv及.pimg
    });

    $(outerDiv).click(function () {//再次点击淡出消失弹出层
        $(this).fadeOut("fast");
        modal.remove();
    });
}

//打印
function printCode(contentId, hiddenId) {
    var userAgent = navigator.userAgent.toLowerCase(); //取得浏览器的userAgent字符串
    if (~userAgent.indexOf('trident') || ~userAgent.indexOf('msie')) {
        alert('请使用google或者360浏览器打印');
    } else {//其它浏览器使用lodop
        var printData = $(contentId).prop('outerHTML');
        $('body').append('<iframe id="iframe" class="hidden" name="iframe"></iframe>');
        var iframeDom = $('#iframe')[0].contentDocument;
        iframeDom.body.innerHTML = printData;
        //需要隐藏的内容
        if (hiddenId) {
            iframeDom.getElementById(hiddenId).style.display = 'none';
        }
        window.frames['iframe'].print();
        $('#iframe').remove();
    }
}

//打印
function printCode(content) {
    var userAgent = navigator.userAgent.toLowerCase(); //取得浏览器的userAgent字符串
    if (~userAgent.indexOf('trident') || ~userAgent.indexOf('msie')) {
        alert('请使用google或者360浏览器打印');
    } else {//其它浏览器使用lodop
        $('body').append('<iframe id="iframe" class="hidden" name="iframe"></iframe>');
        var iframeDom = $('#iframe')[0].contentDocument;
        iframeDom.body.innerHTML = content;
        window.frames['iframe'].print();
        $('#iframe').remove();
    }
}
//所选时间比较
function comTimeDay(startTime, endTime) {
    //if (exceedTime(startTime)) {
    //    layer.msg("开始时间不能大于当前时间");
    //    return true;
    //}
    if (compareDate(startTime, endTime)) {
        layer.msg("开始时间不能大于结束时间");
        return true;
    }
    return false;
}

//下载文件
function downLoad(content, fileName) {
    var aEle = document.createElement("a");// 创建a标签
    aEle.download = fileName;// 设置下载文件的文件名
    aEle.href = content;// content为后台返回的下载地址
    aEle.click();// 设置点击事件
}

//创建tag
function createTag(params) {
    var term = params.term.trim();
    if (term != '') {
        return {
            id: `tag${term}`,
            text: term
        }
    }
}

//汉字首字母搜索
function matcher(params, data) {
    if ($.trim(params.term) === '') {
        return data;
    }
    if (data.children && data.children.length > 0) {
        var match = $.extend(true, {}, data);
        for (var c = data.children.length - 1; c >= 0; c--) {
            var child = data.children[c];
            var matches = matcher(params, child);
            if (matches == null) {
                match.children.splice(c, 1);
            }
        }
        if (match.children.length > 0) {
            return match;
        }
        return matcher(params, match);
    }
    var original = '';
    var term = params.term ? params.term.toUpperCase().trim() : '';
    if (data.text.toPinYin != undefined) {
        var result = data.text.toPinYin().toUpperCase();
        original = result.indexOf(term);
        if (original == -1) {
            original = data.text.toUpperCase().indexOf(term);
        }
    }
    if (original > -1) {
        return data;
    }
    return null;
}

//浏览器全屏放大
function fullScreen(isShow) {
    $('.fullScreenBtn').toggleClass('show');
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
        if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
    //if (isShow) {
    //    const main = document.body;
    //    (main.requestFullscreen && main.requestFullscreen())
    //        || (main.requestFullscreen && main.mozRequestFullScreen())
    //        || (main.requestFullscreen && main.webkitRequestFullScreen())
    //        || (main.requestFullscreen && main.webkitFullscreenElement());
    //} else {
    //    (document.mozCancelFullScreen && document.mozCancelFullScreen())
    //        || (document.webkitCancelFullScreen && document.webkitCancelFullScreen())
    //        || (document.msExitFullscreen && document.msExitFullscreen())
    //        || (document.exitFullscreen && document.exitFullscreen());
    //}
}

//假进度条
function addFakeProgress() {
    var op = `<div class="alert alert-info alert-dismissible" style="width: 300px; position: fixed; top: 40%; left: 50%;transform: translateX(-50%);z-index:999999" id="progress_wrap">
                <label class="control-label">正在升级中...</label>
                <div class="progress progress-sm active no-margin">
                    <div id="progress_box" class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="transition:all 0s">
                        <label style="position: absolute; right: 5px;bottom:5px" id="progress_text"></label>
                    </div>
                </div>
            </div>`;
    $('body').append(op);
    var progressText = 0;
    var time = setInterval(() => {
        var flag = `${++progressText}%`;
        $('#progress_text').text(flag);
        $('#progress_box').css('width', flag);
        if (progressText == 95) {
            clearInterval(time);
        }
    }, 100);
    return () => {
        clearInterval(time);
        $('#progress_text').text('100%');
        $('#progress_box').css('width', '100%');
        setTimeout(() => {
            $('#progress_wrap').remove();
        }, 200);
    }
}

//科学计数法
function toNonExponential(num) {
    num = num || 0;
    var m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
}

//options设置
function setOptions(data, name, color = false) {
    return data.reduce((a, b, i) => `${a}<option value="${b.Id}"${(!color ? "" : ` style="color:${optionColors[(i > optionColors.length ? (i % optionColors.length) : i)]}"`)}>${b[name]}</option>`, '');
}

//options设置
function setOptionsArray(data, color = false) {
    return data.reduce((a, b, i) => `${a}<option value="${i}"${(!color ? "" : ` style="color:${optionColors[(i > optionColors.length ? (i % optionColors.length) : i)]}"`)}>${b}</option>`, '');
}

//options设置
function setOptionsWithNames(data, names, separator, color = false) {
    return data.reduce((a, b, i) => `${a}<option value="${b.Id}"${(!color ? "" : ` style="color:${optionColors[(i > optionColors.length ? (i % optionColors.length) : i)]}"`)}>${(names.map(x => b[x]).join(separator))}</option >`, '');
}

//options设置
function setOptionsWithKey(data, id, name, color = false) {
    return data.reduce((a, b, i) => `${a}<option value="${b[id]}"${(!color ? "" : ` style="color:${optionColors[(i > optionColors.length ? (i % optionColors.length) : i)]}"`)}>${b[name]}</option>`, '');
}

//options设置
function setOptionsWithKeyNames(data, id, names, separator, color = false) {
    return data.reduce((a, b, i) => `${a}<option value="${b[id]}"${(!color ? "" : ` style="color:${optionColors[(i > optionColors.length ? (i % optionColors.length) : i)]}"`)}>${(names.map(x => b[x]).join(separator))}</option>`, '');
}

//将数字金额转换为大写人民币汉字
function convertCurrency(money) {
    //汉字的数字
    var cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
    //基本单位
    var cnIntRadice = new Array('', '拾', '佰', '仟');
    //对应整数部分扩展单位
    var cnIntUnits = new Array('', '万', '亿', '兆');
    //对应小数部分单位
    var cnDecUnits = new Array('角', '分', '毫', '厘');
    //整数金额时后面跟的字符
    var cnInteger = '整';
    //整型完以后的单位
    var cnIntLast = '元';
    //最大处理的数字
    var maxNum = 999999999999999.9999;
    //金额整数部分
    var integerNum;
    //金额小数部分
    var decimalNum;
    //输出的中文金额字符串
    var chineseStr = '';
    //分离金额后用的数组，预定义
    var parts;
    if (money == '') { return ''; }
    money = parseFloat(money);
    if (money >= maxNum) {
        //超出最大处理数字
        return '';
    }
    if (money == 0) {
        chineseStr = cnNums[0] + cnIntLast + cnInteger;
        return chineseStr;
    }
    //转换为字符串
    money = money.toString();
    if (money.indexOf('.') == -1) {
        integerNum = money;
        decimalNum = '';
    } else {
        parts = money.split('.');
        integerNum = parts[0];
        decimalNum = parts[1].substr(0, 4);
    }
    //获取整型部分转换
    if (parseInt(integerNum, 10) > 0) {
        var zeroCount = 0;
        var IntLen = integerNum.length;
        for (var i = 0; i < IntLen; i++) {
            var n = integerNum.substr(i, 1);
            var p = IntLen - i - 1;
            var q = p / 4;
            var m = p % 4;
            if (n == '0') {
                zeroCount++;
            } else {
                if (zeroCount > 0) {
                    chineseStr += cnNums[0];
                }
                //归零
                zeroCount = 0;
                chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
            }
            if (m == 0 && zeroCount < 4) {
                chineseStr += cnIntUnits[q];
            }
        }
        chineseStr += cnIntLast;
    }
    //小数部分
    if (decimalNum != '') {
        var decLen = decimalNum.length;
        for (var i = 0; i < decLen; i++) {
            var n = decimalNum.substr(i, 1);
            if (n != '0') {
                chineseStr += cnNums[Number(n)] + cnDecUnits[i];
            }
        }
    }
    if (chineseStr == '') {
        chineseStr += cnNums[0] + cnIntLast + cnInteger;
    } else if (decimalNum == '') {
        chineseStr += cnInteger;
    }
    return chineseStr;
}

//js计算精度丢失解决方案
var floatObj = function () {
    /*
     * 判断obj是否为一个整数
     */
    function isInteger(obj) {
        return Math.floor(obj) === obj;
    }
    /*
     * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
     * @param floatNum {number} 小数
     * @return {object}
     *   {times:100, num: 314}
     */
    function toInteger(floatNum) {
        var ret = { times: 1, num: 0 };
        if (isInteger(floatNum)) {
            ret.num = floatNum;
            return ret;
        }
        var strfi = floatNum + '';
        var dotPos = strfi.indexOf('.');
        var len = strfi.substr(dotPos + 1).length;
        var times = Math.pow(10, len);
        var intNum = parseInt(floatNum * times + 0.5, 10);
        ret.times = times;
        ret.num = intNum;
        return ret;
    }

    /*
     * 核心方法，实现加减乘除运算，确保不丢失精度
     * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
     *
     * @param a {number} 运算数1
     * @param b {number} 运算数2
     * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
     *
     */
    function operation(a, b, op) {
        var o1 = toInteger(a);
        var o2 = toInteger(b);
        var n1 = o1.num;
        var n2 = o2.num;
        var t1 = o1.times;
        var t2 = o2.times;
        var max = t1 > t2 ? t1 : t2;
        var result = null;
        switch (op) {
            case 'add':
                if (t1 === t2) { // 两个小数位数相同
                    result = n1 + n2;
                } else if (t1 > t2) { // o1 小数位 大于 o2
                    result = n1 + n2 * (t1 / t2);
                } else { // o1 小数位 小于 o2
                    result = n1 * (t2 / t1) + n2;
                }
                return result / max;
            case 'subtract':
                if (t1 === t2) {
                    result = n1 - n2;
                } else if (t1 > t2) {
                    result = n1 - n2 * (t1 / t2);
                } else {
                    result = n1 * (t2 / t1) - n2;
                }
                return result / max;
            case 'multiply':
                result = (n1 * n2) / (t1 * t2);
                return result;
            case 'divide':
                result = (n1 / n2) * (t2 / t1);
                return result;
        }
    }

    // 加减乘除的四个接口
    function add(a, b) {
        return operation(a, b, 'add');
    }

    function subtract(a, b) {
        return operation(a, b, 'subtract');
    }

    function multiply(a, b) {
        return operation(a, b, 'multiply');
    }

    function divide(a, b) {
        return operation(a, b, 'divide');
    }

    // exports
    return {
        add: add,
        subtract: subtract,
        multiply: multiply,
        divide: divide
    }
}();


//js计算精度丢失解决方案
var decimalObj = function () {

    /*
     * 核心方法，decimal
     */
    function operation(a, b, op) {
        switch (op) {
            case 'add':
                return new Decimal(a).add(new Decimal(b)).toNumber();
            case 'subtract':
                return new Decimal(a).sub(new Decimal(b)).toNumber();
            case 'multiply':
                return new Decimal(a).mul(new Decimal(b)).toNumber();
            case 'divide':
                return new Decimal(a).div(new Decimal(b)).toNumber();
        }
    }

    // 加减乘除的四个接口
    function add(a, b) {
        return operation(a, b, 'add');
    }

    function subtract(a, b) {
        return operation(a, b, 'subtract');
    }

    function multiply(a, b) {
        return operation(a, b, 'multiply');
    }

    function divide(a, b) {
        return operation(a, b, 'divide');
    }

    // exports
    return {
        add: add,
        subtract: subtract,
        multiply: multiply,
        divide: divide
    }
}();

//对比两个对象是否相等
function deepCompare(x, y) {
    var i, l, leftChain, rightChain;
    function compare2Objects(x, y) {
        var p;

        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
            return true;
        }

        // Compare primitives and functions.     
        // Check if both arguments link to the same object.
        // Especially useful on the step where we compare prototypes
        if (x === y) {
            return true;
        }

        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)) {
            return x.toString() === y.toString();
        }

        // At last checking prototypes as good as we can
        if (!(x instanceof Object && y instanceof Object)) {
            return false;
        }

        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            return false;
        }

        if (x.constructor !== y.constructor) {
            return false;
        }

        if (x.prototype !== y.prototype) {
            return false;
        }

        // Check for infinitive linking loops
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
            return false;
        }

        // Quick checking of one object being a subset of another.
        // todo: cache the structure of arguments[0] for performance
        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            } else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
        }

        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            } else if (typeof y[p] !== typeof x[p]) {
                return false;
            }

            switch (typeof (x[p])) {
                case 'object':
                case 'function':

                    leftChain.push(x);
                    rightChain.push(y);

                    if (!compare2Objects(x[p], y[p])) {
                        return false;
                    }

                    leftChain.pop();
                    rightChain.pop();
                    break;

                default:
                    if (x[p] !== y[p]) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    if (arguments.length < 1) {
        return true; //Die silently? Don't know how to handle such case, please help...
        // throw "Need two or more arguments to compare";
    }
    for (i = 1, l = arguments.length; i < l; i++) {

        leftChain = []; //Todo: this can be cached
        rightChain = [];

        if (!compare2Objects(arguments[0], arguments[i])) {
            return false;
        }
    }

    return true;
}

//判断数据类型
function getClass(o) {
    return Object.prototype.toString.call(o).slice(8, -1);
}

//深度拷贝
function deepCopy(obj) {
    var result, oClass = getClass(obj);

    if (oClass == "Object") result = {}; //判断传入的如果是对象，继续遍历
    else if (oClass == "Array") result = []; //判断传入的如果是数组，继续遍历
    else return obj; //如果是基本数据类型就直接返回

    for (var i in obj) {
        var copy = obj[i];

        if (getClass(copy) == "Object") result[i] = deepCopy(copy); //递归方法 ，如果对象继续变量obj[i],下一级还是对象，就obj[i][i]
        else if (getClass(copy) == "Array") result[i] = deepCopy(copy); //递归方法 ，如果对象继续数组obj[i],下一级还是数组，就obj[i][i]
        else result[i] = copy; //基本数据类型则赋值给属性
    }

    return result;
}

//异步获取数据
function myPromise(opType, opData = undefined, cover = 1, func = undefined, msg = undefined) {
    const data = { opType };
    opData && (data.opData = JSON.stringify(opData));
    return new Promise(resolve => {
        ajaxPost("/Relay/Post", data, ret => {
            let errMsg = ret.errmsg;
            if (ret.errno == 0) {
                if (func != undefined)
                    func();
                resolve(ret);
            } else {
                if (ret.datas && ret.datas.length > 0) {
                    let t = "";
                    t = ret.datas.join();
                    t += ",";
                    errMsg = t + errMsg;
                }
            }
            if ((ret.errno != 0 && errMsg) || cover !== 0) {
                return layer.msg(errMsg);
            }
        }, cover);
    });
}

//dataTable基本参数
function dataTableConfig(d = 0, isCheck = false, checkShow = true, order = 0, ordering = true) {
    const checkColumns = [{ data: null, title: '', render: tableDefault().isEnable, orderable: false, sWidth: 'auto', visible: checkShow }];
    const defaultColumns = [{ data: "XvHao", title: "序号", sWidth: '25px', sClass: 'xvhao' }];
    const chosenColumns = [{ data: "XvHao", title: "序号", sWidth: '25px', sClass: 'xvhao' }];
    const choseAllColumns = [{ data: null, title: "全选<input type='checkbox' class='icb_minimal' id='checkAll'>", render: d => `<input type="checkbox" class="icb_minimal isEnable">`, orderable: false }];

    const obj = {
        dom: '<"pull-left"l><"pull-right"f>rt<"col-sm-5"i><"col-sm-7"p>',
        bAutoWidth: !isCheck || !checkShow,
        destroy: true,
        paging: true,
        searching: true,
        ordering: ordering,
        aaSorting: [[(order === 0 && isCheck ? 1 : order), 'asc']],
        aLengthMenu: [25, 50, 75],
        iDisplayLength: 25,
        language: oLanguage
    };
    if (d !== 0) {
        addOrderData(d);
        obj.data = d;
    }
    isCheck && (!obj.columns && (obj.columns = []),
        obj.columns = obj.columns.concat(checkColumns));
    obj.addColumns = function (columns, xvHao = true) {
        !obj.columns && (obj.columns = []);
        if (xvHao && !~obj.columns.indexOf(defaultColumns)) obj.columns = obj.columns.concat(defaultColumns);
        obj.columns = obj.columns.concat(columns);
    }
    obj.modifyColumns = function (columns, xvHao = true, chose = false) {
        obj.columns = [];
        isCheck && (obj.columns = obj.columns.concat(checkColumns));
        xvHao && (obj.columns = obj.columns.concat(defaultColumns));
        obj.columns = obj.columns.concat(columns);
    }
    obj.clearColumns = function (xvHao = false, chose = false) {
        obj.columns = [];
        !xvHao && (obj.columns = obj.columns.concat(defaultColumns));
    }
    obj.fixedHeaderColumn = function (fixedHeader, leftColumn = -1, rightColumn = -1, scrollX = "100%", scrollY = "600px") {
        obj.ordering = false;
        fixedHeaderColumn(obj, fixedHeader, leftColumn, rightColumn, scrollX, scrollY);
    }
    obj.updateData = function (data) {
        addOrderData(data);
        obj.data = data;
    }
    return obj;
}

function fixedHeaderColumn(obj, fixedHeader, leftColumn = -1, rightColumn = -1, scrollX = "100%", scrollY = "600px") {
    //表头固定
    obj.fixedHeader = fixedHeader;
    //横向滚动
    obj.scrollX = scrollX;
    obj.scrollY = scrollY;
    obj.scrollCollapse = true;
    //固定首列，需要引入相应 dataTables.fixedColumns.min.js
    obj.fixedColumns = {
        leftColumns: leftColumn,
        rightColumns: rightColumn
    };
    return obj;
}

//流程编号选择禁用
function disabledOption(selects, v, tag = true) {
    if (v) {
        selects.find(`option[value='${v}']`).prop('disabled', tag);
    } else {
        const ids = [];
        selects.find('option').prop('disabled', false);
        selects.each((i, item) => {
            const id = $(item).val();
            if (id) ids[id] = 1;
        });
        if (!ids.length) return;
        Object.keys(ids).forEach(item => {
            selects.find(`option[value='${item}']`).prop('disabled', true);
        });
    }
    selects.select2();
}

//更新选项
function updateDataTableTrSelect(id, className, options) {
    const selects = $(id).find(`.${className}`);
    selects.find('option').prop('disabled', false);
    const ids = [];
    selects.each((i, item) => {
        const id = $(item).val();
        ids[i] = id ? id : 0;
    });
    $(selects).html(options);
    if (ids.length) {
        ids.forEach((v, i) => {
            $(selects[i]).val(v).trigger('change');
        });
    };
    Object.values(ids).forEach(item => {
        selects.find(`option[value='${item}']`).prop('disabled', true);
    });
    //const disabled = $(el).find('option[disabled]').prop('disabled', false);
    //const render = () => tableSet.addSelect.bind(null, options, 'taskOrder');
    //getDataTableRow(id).each(item => {
    //    const el = $(item).find(`.${className}`);
    //    const v = $(el).val();
    //    $(el).find('option[disabled]').prop('disabled', true);
    //    $(el).html(options).val(v).trigger('change');
    //});
}

//dataTable渲染标签
function tableDefault() {
    return {
        order: (a, b, c, d) => +d.row + 1,
        isEnable: d => `<input type="checkbox" class="icb_minimal isEnable" value="${d.Id}">`,
        span: (className, d) => `<span class="textOn ${className}">${d}</span>`,
        input: (className, d) => `<span class="textOn">${d}</span><input type="text" class="form-control text-center textIn ${className} hidden" maxlength="20" style="min-width:120px;width:${className === 'remark' ? '100%' : 'auto'}" value=${d}>`,
        addInput: (className, width, d) => `<input type="text" class="form-control text-center ${className}" style="margin:auto;min-width:70px;width:${width}" value="${d}">`,
        emptyInput: (className, param, d) => {
            if (d == undefined && param != undefined)
                d = param;
            if (param == undefined)
                param = "";
            var s = param.split(',');
            return `<span class="textOn"></span>
                        <input type="text" class="form-control text-center textIn ${className} hidden" 
                            maxlength="20" style="min-width:${s[0] || 80}px;width:${s[1] || 80}px;" value=${d}>`;
        },
        numberInput: (className, param, d) => {
            var s = param.split(',');
            return `<span class="textOn">${(s[5] ? "" : d)}</span><input type="text" class="form-control text-center textIn ${className} hidden" 
                        oninput="onInput(this, ${s[1] || 5}, ${s[2] || 0}, ${s[3] || undefined}, ${s[4] || undefined})" 
                            style="margin:auto;min-width:70px;width:${s[0]}" value="${d}">`;
        },
        addNumberInput: (className, param, d) => {
            var s = param.split(',');
            return `<input type="text" class="form-control text-center ${className}" oninput="onInput(this, ${s[1] || 5}, ${s[2] || 0})" style="margin:auto;min-width:70px;width:${s[0]}" value="${d}">`;
        },
        select: (ops, className, d) => `<span class="textOn">${d}</span><select class="form-control mSelect hidden textIn ${className}" style="min-width:120px;">${ops}</select>`,
        addSelect: (ops, className) => `<select class="form-control mSelect ${className}" style="min-width:120px">${ops}</select>`,
        updateBtn: (fn, d) => `<button class="btn btn-success btn-xs" onclick="${fn}.call(this)" value="${d}">修改</button>`,
        delBtn: () => `<button class="btn btn-danger btn-xs" onclick="delDataTableTr.call(this)"><i class="fa fa-minus"></i></button>`,
        addBtn: fn => `<button class="btn btn-success btn-xs" onclick="${fn}.call(this)"><i class="fa fa-plus"></i></button>`,
        setBtn: () => '<button class="btn btn-primary btn-sm set-btn">设置</button>',
        detailBtn: (fn, d) => `<button class="btn btn-info btn-sm" onclick="${fn}.call(this, ${d})" value="${d}">查看</button>`,
        processDetail: d => d.replace(/,/g, ' > '),
        text: (title, d, len = null) => d.length > (len ? len : tdShowLength)
            ? `<span title="${d}" onclick = "showAllContent('${escape(d)}', '${title}')">${d.substring(0, (len ? len : tdShowLength))}...</span>`
            : `<span title="${d}" class="chose1">${d}</span>`,
        isRework: () => '<select class="form-control mSelect isRework" style="width:100px"><option value="0">否</option><option value="1">是</option></select>',
        isReworkText: d => d ? '是' : '否',
        day: (className, d) => `<span class="textOn">${d.split(' ')[0]}</span><input type="text" class="pointer textIn hidden form_date form-control text-center ${className}" style="min-width: 100px">`,
        addDay: (className, d) => `<input type="text" class="pointer form_date form-control text-center ${className}" value="${d ? d.split(' ')[0] : ''}" style="min-width: 100px">`,
        state: d => {
            const colors = ['#CCCCCC', '#ff9933', '#ff33cc', 'black', 'black', '#FF0000'];
            return `<span style="color:${colors[d.State]}">${d.StateStr}</span>`;
        },
        delivery: d => {
            const threeDay = 259200000;
            let color = 'black';
            if (new Date(d) - new Date(getFullTime()) < threeDay) color = 'red';
            return `<span style="color:${color}">${d.split(' ')[0]}</span>`;
        },
        progress: d => `${d}%`,
        endFinishTime: d => d.State === 4 ? d.EndTime : tableDefault().state(d),
        stateOps: '<option value="1">正常</option><option value="2">休息</option>',
        DevStateOps: '<option value="1">正常</option><option value="2">故障</option><option value="3">报废</option>',
        isFinish: d => {
            let icon = 'remove', color = 'red';
            if (d.Id) icon = 'ok', color = 'green';
            return `<span class="glyphicon glyphicon-${icon} text-${color} middle" aria-hidden="true" style="font-size:25px"></span>`;
        },
        isChose: (ok) => {
            let icon = 'remove', color = 'red';
            if (ok) icon = 'ok', color = 'green';
            return `<span class="glyphicon glyphicon-${icon} text-${color} middle" aria-hidden="true" style="font-size:25px"></span>`;
        },
        hms: d => {
            return `<div class="flexStyle" style="justify-content:center">
                        <input type="text" class="form-control text-center hour" style="width:60px" oninput="onInput(this, 5, 0)" value="${d.Hour || 0}"><span style="margin:0 5px">时</span>
                        <input type="text" class="form-control text-center minute" style="width:40px" oninput="onTimeLimitInput(this)" value="${d.Min || 0}"><span style="margin:0 5px">分</span>
                        <input type="text" class="form-control text-center second" style="width:40px" oninput="onTimeLimitInput(this)" value="${d.Sec || 0}"><span style="margin:0 5px">秒</span>
                    </div>`;
        },
        hmsCal: d => {
            var t = convertTime(d);
            return `<div class="flexStyle" style="justify-content:center">
                        <input type="text" class="form-control text-center hour" style="width:60px" oninput="onInput(this, 5, 0)" value="${t.h}"><span style="margin:0 5px">时</span>
                        <input type="text" class="form-control text-center minute" style="width:40px" oninput="onTimeLimitInput(this)" value="${t.m || 0}"><span style="margin:0 5px">分</span>
                        <input type="text" class="form-control text-center second" style="width:40px" oninput="onTimeLimitInput(this)" value="${t.s || 0}"><span style="margin:0 5px">秒</span>
                    </div>`;
        },
        msCal: (className, look, d) => {
            var t = convertTime(d, false);
            return !look ? `<div class="flexStyle" style="justify-content:center">
                        <input type="text" class="form-control text-center minute ${className}" oninput="onInput(this, 5, 0)" style="width:60px" value="${t.m}"><span style="margin:0 5px">分</span>
                        <input type="text" class="form-control text-center second ${className}" oninput="onTimeLimitInput(this)" style="width:40px" value="${t.s}"><span style="margin:0 5px">秒</span>
                    </div>`: `${t.m}<span style="margin:0 5px">分</span>${t.s}<span style="margin:0 5px">秒</span>`;
        },
        showTime: d => d === '0001-01-01 00:00:00' ? '' : d.split(' ')[0]
    }
}

//添加一行
function addDataTableTr(id, obj) {
    obj.XvHao = $(id).DataTable().rows()[0].length + 1;
    //obj.XvHao = '';
    const dataTable = $(id).DataTable();
    dataTable.row.add(obj).draw(false);
    dataTable.column(0).nodes().each((item, i) => {
        //dataTable.data()[i].XvHao = i + 1;
        $(item).text(i + 1);
    });
}

//删除一行
function delDataTableTr() {
    const tr = $(this).parents('tr')[0];
    const tableId = $(tr).parents('table').prop('id');
    const dataTable = $(`#${tableId}`).DataTable();
    dataTable.rows(tr).remove().draw(false);
    dataTable.column(0).nodes().each((item, i) => {
        //dataTable.data()[i].XvHao = i + 1;
        $(item).text(i + 1);
    });
}

//获取dataTable所有row
function getDataTableRow(table) {
    return $(table).DataTable().rows().nodes();
}

//初始化iChick并添加事件
function initCheckboxAddEvent(arr, callback, fn, init = true, event = "Changed") {
    const api = this.api();
    $(this).find(".isEnable").iCheck({
        handle: "checkbox",
        checkboxClass: "icheckbox_minimal-blue",
        increaseArea: "20%"
    });
    if (event == "Changed") {
        $(this).find(".isEnable")
            .off("ifChanged").on("ifChanged",
                function () {
                    const tr = $(this).parents("tr");
                    const trDom = tr[0];
                    if ($(this).is(":checked")) {
                        arr.push(trDom);
                        if (callback) {
                            callback(tr, api.row(trDom).data());
                            tr.find(".textOn").addClass("hidden").siblings(".textIn").removeClass("hidden");
                        }
                    } else {
                        arr.splice(arr.indexOf(trDom), 1);
                        callback && tr.find(".textIn").addClass('hidden').siblings(".textOn").removeClass("hidden");
                        fn && fn(tr, api.row(trDom).data());
                    }
                });
    } else if (event == "Checked") {
        $(this).find(".isEnable")
            .off("ifChecked").on("ifChecked",
                function () {
                    const tr = $(this).parents("tr");
                    const trDom = tr[0];
                    if ($(this).is(":checked")) {
                        arr.push(trDom);
                        if (callback) {
                            callback(tr, api.row(trDom).data());
                            tr.find(".textOn").addClass("hidden").siblings(".textIn").removeClass("hidden");
                        }
                    } else {
                        arr.splice(arr.indexOf(trDom), 1);
                        callback && tr.find(".textIn").addClass('hidden').siblings(".textOn").removeClass("hidden");
                        fn && fn(tr, api.row(trDom).data());
                    }
                })
            .off("ifUnchecked").on("ifUnchecked",
                function () {
                    const tr = $(this).parents("tr");
                    const trDom = tr[0];
                    if ($(this).is(":checked")) {
                        arr.push(trDom);
                        if (callback) {
                            callback(tr, api.row(trDom).data());
                            tr.find(".textOn").addClass("hidden").siblings(".textIn").removeClass("hidden");
                        }
                    } else {
                        arr.splice(arr.indexOf(trDom), 1);
                        callback && tr.find(".textIn").addClass('hidden').siblings(".textOn").removeClass("hidden");
                        fn && fn(tr, api.row(trDom).data());
                    }
                });
    }


    init && $(this).find(".isEnable").iCheck("uncheck");
}

//初始化iChick并添加事件
function initCheckboxAddCheckedEvent(arr, callback, fn, init = true) {
    const api = this.api();
    $(this).find(".isEnable").iCheck({
        handle: "checkbox",
        checkboxClass: "icheckbox_minimal-blue",
        increaseArea: "20%"
    }).off("ifChecked")
        .on("ifChecked", function () {
            const tr = $(this).parents("tr");
            const trDom = tr[0];
            if ($(this).is(":checked")) {
                arr.push(trDom);
                if (callback) {
                    callback(tr, api.row(trDom).data());
                    tr.find(".textOn").addClass("hidden").siblings(".textIn").removeClass("hidden");
                }
            } else {
                arr.splice(arr.indexOf(trDom), 1);
                callback && tr.find(".textIn").addClass('hidden').siblings(".textOn").removeClass("hidden");
                fn && fn(tr, api.row(trDom).data());
            }
        });
    init && $(this).find(".isEnable").iCheck("uncheck");
}

//选择禁用
function disabledTableCheck(table, except = []) {
    $(`#${table}`).find(".isEnable").iCheck("disable");
    if (except.length > 0) {
        except.forEach(t => {
            $(`#${table}`).find(`.isEnable[value=${t}]`).iCheck('enable');
        });
    }
}

//选择启用
function enableTableCheck(table, except = []) {
    $(`#${table}`).find(".isEnable").iCheck("enable");
    if (except.length > 0) {
        except.forEach(t => {
            $(`#${table}`).find(`.isEnable[value=${t}]`).iCheck('disable');
        });
    }
}

//初始化Input change事件
function initInputChangeEvent(callback) {
    const api = this.api();
    $(this).find(".textIn").off("change")
        .on("change", function () {
            const tr = $(this).parents("tr");
            const trDom = tr[0];
            if (callback) {
                callback(tr, api.row(trDom).data());
            }
        });
}

//删除表格数据
function delTableRow(trs, opType, callback) {
    if (!trs || !trs.length) return layer.msg('请选择需要删除的数据');
    const ids = [];
    trs.forEach(item => {
        const el = $(item);
        ids.push(el.find('.isEnable').val() >> 0);
    });
    showConfirm('删除所选项', () => myPromise(opType, { ids }).then(callback));
}

//添加表格数据
function addTableRow(tableId, getTrInfo, opType, callback) {
    const arr = [];
    const trs = getDataTableRow(tableId);
    if (!trs || !trs.length) {
        layer.msg('请先设置数据再添加');
        return;
    }
    for (let i = 0, len = trs.length; i < len; i++) {
        const trInfo = getTrInfo($(trs[i]), true);
        if (!trInfo) return;
        arr.push(trInfo);
    }
    myPromise(opType, arr).then(callback);
}

//修改表格数据
function updateTableRow(trs, getTrInfo, opType, callback) {
    if (!trs || !trs.length) {
        layer.msg('请选择需要修改的数据');
        return;
    }
    const arr = [];
    for (let i = 0, len = trs.length; i < len; i++) {
        const trInfo = getTrInfo($(trs[i]), false);
        if (!trInfo) return;
        arr.push(trInfo);
    }
    myPromise(opType, arr).then(callback);
}

//初始化时间选择器
function initDayTime(el, date = undefined, fnc = undefined) {
    $(el).find('.form_date').attr('readonly', true).datepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd',
        maxViewMode: 2,
        todayBtn: 'linked',
        autoclose: true
    }).on('changeDate', function () {
        if (isStrEmptyOrUndefined($(this).val()) && date) {
            $(this).val(getDate(date)).datepicker('update');
        }
        if (fnc) fnc();
    });
}

//数据增加序号
function addOrderData(data) {
    for (let i = 0; i < data.length; i++) {
        data[i].XvHao = i + 1;
    }
    return data;
}

//更新DataTable数据
function updateTable(table, data) {
    addOrderData(data);
    const newLength = data.length;
    if (newLength == 0) {
        table.clear().draw();
        return;
    }
    const oldLength = table.data().length;
    const trData = table.data().splice(0, oldLength);

    const minLength = newLength > oldLength ? oldLength : newLength;
    var i;
    var newObj;
    const updateArray = [];
    for (i = 0; i < minLength; i++) {
        const oldObj = trData[i];
        newObj = data[i];
        if (!deepCompare(oldObj, newObj)) {
            for (var j in oldObj) {
                if (oldObj.hasOwnProperty(j) && newObj.hasOwnProperty(j)) {
                    table.data()[i][j] = newObj[j];
                }
            }
            updateArray.push(i);
        }
    }
    table.rows(updateArray).invalidate().draw();
    if (newLength < oldLength) {
        const deleteArray = [];
        for (i = oldLength - 1; i >= newLength; i--) {
            //const oldObj = trData[i];
            //table.row.add(oldObj).draw();
            deleteArray.push(i);
        }
        table.rows(deleteArray).remove().draw();
    } else {
        const addArray = [];
        for (i = oldLength; i < newLength; i++) {
            newObj = data[i];
            //newObj.XvHao = i + 1;
            addArray.push(newObj);
        }
        table.rows.add(addArray).draw();
    }
}

//按顺序排序
function sortOrder(a, b, t = 0) {
    if (a.hasOwnProperty("Order"))
        return t == 0 ? a.Order - b.Order : b.Order - a.Order;
    else
        return t == 0 ? a.order - b.order : b.order - a.order;
}

//获取滚动table
function getScrollTable(id, columns) {
    const column = columns && columns.length > 0 ? columns.reduce((a, b, i) => `${a}<th>${b}</th>`, '') : "";
    const table =
        `<div class="tablebox">
            <div class="tbl-header">
                <table border="0" cellspacing="0" cellpadding="0">
                    <thead>
                        <tr>
                            ${column}
                        </tr>
                    </thead>
                    <tbody style="opacity:0;"></tbody>
                </table>
            </div>
            
            <div class="tbl-body">
                <table border="0" cellspacing="0" cellpadding="0" id="${id}">
                    <thead>
                        <tr>
                            ${column}
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>`;

    return table;
}

//获取滚动table
function getTable(id, columns, border = 0) {
    const column = columns && columns.length > 0 ? columns.reduce((a, b, i) => `${a}<th style='width:${b.width ? `${b.width}px` : "auto"}'>${b}</th>`, '') : "";
    const table =
        `<div class="kb_item_tablebox">
        <table border="${border}" cellspacing="0" cellpadding="0" id="${id}">
            <thead>
                <tr>
                    ${column}
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        </div>`;

    return table;
}

//获取滚动table
function getTableW(id, columns, border = 0) {
    const xvHao = columns.filter(x => x.Field == "XvHao");
    if (!xvHao.length)
        columns.unshift({
            Order: 0,
            Column: "序号",
            Field: "XvHao",
            Width: "60"
        });
    const column = columns && columns.length > 0 ? columns.reduce((a, col, i) => {
        var width = col.Width && col.Width !== "auto" ? `width: ${col.Width}px;` : `width: auto;`;
        var color = col.Color ? `color: ${col.Color};` : ``;
        return `${a}<th style='${width}${color}'>${col.Column}</th>`
    }, '') : "";
    const table =
        `<div class="kb_item_tablebox">
            <table border="${border}" cellspacing="0" cellpadding="0" id="${id}" style="table-layout:fixed;">
                <thead>
                    <tr>
                        ${column}
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>`;

    return table;
}

//获取
function getChartW(id) {
    const table =
        `<div class="kb_item_tablebox" id="${id}" >
        </div>`;
    return table;
}

//获取
function getTableT(id) {
    const table =
        `<div class="kb_item_tablebox">
            <table class="table table-hover table-striped" id="${id}" style="table-layout:fixed;">
                <thead>
                    <tr>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>`;

    return table;
}

function autoScroll(tableId) {
    const tb = $(`#${tableId} tbody`);
    const outerHeight = tb.find('tr:first').height();
    // 改变table的margin-top，定时将第一行tr挪至（列表）最后
    tb.animate({ 'marginTop': -outerHeight + 'px' }, 2000, () => {
        tb.css({ margin: 0 }).find('tr:first').appendTo(tb);
    });
}

//滚动table
function scrollTable(obj, timer, tableId) {
    clearInterval(obj[timer]);
    const $this = $(`#${tableId}`); // table或者tablebox的id
    $this.hover(() => {
        clearInterval(obj[timer]);
    }, () => {
        obj[timer] = setInterval(() => {
            //console.log(tableId);
            autoScroll(tableId);
        }, 2000);
    }).trigger('mouseleave');
}

function autoTurn(tableId, trNum) {
    const tb = $(`#${tableId} tbody`);
    const outerHeight = tb.find('tr:first').height();
    // 改变table的margin-top，定时将第一行tr挪至（列表）最后
    tb.animate({ 'marginTop': -outerHeight + 'px' }, 2000, () => {
        tb.css({ margin: 0 }).find('tr:first').appendTo(tb);
    });
}

//翻页table
function turnTable(obj, timer, tableId, trNum) {
    clearInterval(obj[timer]);
    const $this = $(`#${tableId}`); // table或者tablebox的id
    $this.hover(() => {
        clearInterval(obj[timer]);
    }, () => {
        obj[timer] = setInterval(() => {
            //console.log(tableId);
            autoTurn(tableId, trNum);
        }, 2000);
    }).trigger('mouseleave');
}

//停止滚动或翻页table
function stopTableEffect(obj, timer, tableId) {
    //$(`#${tableId}`).off("hover");
    $(`#${tableId}`).unbind('mouseenter mouseleave');
    clearInterval(obj[timer]);
    //obj[timer] = "";
    delete obj[timer];
    return obj;
}

function showPermissions(uiName, list) {
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
    var mOptionStr = `<li><div class="box box-solid noShadow collapsed-box" style="margin-bottom: 0;">
                        <div class="box-header no-padding">
                            <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="on_i fa fa-plus"></i></button>
                            <label class="pointer" style="margin:0;font-weight:inherit">
                                <input type="checkbox" class="on_cb" style="width: 15px" value="{0}">
                                <span class="textOverTop" style="vertical-align: middle;font-size: 16px">{1}</span>
                            </label>
                        </div>
                        <div class="box-body no-padding">
                            <ul class="on_ul nav nav-pills nav-stacked mli" style="margin-left: 20px">{2}</ul>
                        </div>
                    </div></li>`;
    var mNameStr = `<li><div class="box box-solid noShadow" style="margin-bottom: 0;">
                            <div class="box-header no-padding">
                                <a type="button" class="btn btn-box-tool disabled" data-widget="collapse"><i class="fa fa-chevron-right"></i></a>
                                <label class="pointer" style="margin:0;font-weight:inherit">
                                    <input type="checkbox" class="on_cb" style="width: 15px" value="{0}">
                                    <span class="textOverTop" style="vertical-align: middle;font-size: 16px">{1}</span>
                                </label>
                            </div>
                        </div></li>`;
    list.sort((a, b) => a.order - b.order);
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
                ? mOptionStr.format(item.Id, item.Name, childTree(opObj[item.Id]))
                : mNameStr.format(item.Id, item.Name);
            return obj;
        }).join('');
    }
    $(`#${uiName}`).empty().append(opObj.parent.length ? permissionTypes.format(childTree(opObj.parent)) : '');
    $(".on_cb").iCheck({
        checkboxClass: 'icheckbox_minimal',
        increaseArea: '20%'
    });
}

//获取数据 无覆盖层
function getListNoCover(func, callBack = null, qId = 0, table = true, cover = 0) {
    if (func)
        func(null, false, callBack, cover, table, qId);
}

//获取菜单数据 无覆盖层
function getMenuNoCover(func, callBack = null, qId = 0, table = false, cover = 0) {
    if (func)
        func(null, true, callBack, cover, table, qId);
}

function setFieldOptions(func) {
    const fields = FieldFunc[func] ? FieldFunc[func] : [];
    let ops = `<option value="">无</option>`;
    Object.keys(fields).forEach(key => {
        var c = fields[key];
        ops += `<option value="${key}">${c.desc}</option>`;
    })
    return ops;
}

function meetCondition(d, con, conv) {
    //定义于const.js ["大于", "大于等于", "等于", "小于", "小于等于", "不等于"]
    switch (con) {
        case 0: return d > conv;
        case 1: return d >= conv;
        case 2: return d == conv;
        case 3: return d < conv;
        case 4: return d <= conv;
        case 5: return d != conv;
    }
    return false;
}

//es6反单引号模板字符串压缩方法（去除换行和空格）
function minimize(raw) {
    return raw.split('\n').map(i => i.trim()).join('');
    //return raw.join().split('\n').map(i => i.trim()).join('');
}