function isPhone(phoneNum) {
    var res = false
    //简单判断下是否是数字
    if (isNaN(phoneNum)) {
        return res
    }
    res = /^1[0-9]{10}$/i.test(phoneNum)
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
function isNumber(num) {
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    //  var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    //  if(regPos.test(num) || regNeg.test(num)){
    if (regPos.test(num)) {
        return true;
    } else {
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

    obj.permissionsList = isStrEmptyOrUndefined(obj.permissions) ? new Array() : obj.permissions.split(",").map(Number);
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
    var tkinfo = getCookieTokenInfo();
    if (tkinfo == null) {
        return false;
    }

    var timestamp = new Date().getTime() / 1000;
    if (timestamp > tkinfo.exp) {
        return false;
    }

    return true;
}

//查看是否有角色是否有权限
function checkPermission(opType) {
    //permissionsList
    var info = getCookieTokenInfo();

    if (info == null || !isTokenValid()) {
        SetCookie(lastLocation, window.location.pathname);
        window.location.href = loginUrl;
        return -1;
    } else {
        return info.permissionsList.indexOf(opType) >= 0;
    }
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
    //window.location.href = loginUrl
    console.log("err");
}

//ajax 包装 data 必须是张表，或者null,带token
function ajaxPost(url, data, func) {
    addCover();
    if (data == null) {
        data = {}
    }

    //var token = GetCookie("token")
    //if (!isStrEmptyOrUndefined(token)) {
    //    data.token = token
    //}
    var funcC = function (e) {
        removeCover();
        func(e);
    }
    $.post(url, data, funcC).error(reLogin);
}

//ajax 包装 data 必须是张表，或者null,带token
function ajaxGet(url, data, func) {
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
    var token = GetCookie("token")
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
    //    SetCookie(lastLocation, window.location.href);
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
    this.creat();

}
//判断数据是否正常
function dataType() {
    var gettype = Object.prototype.toString
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
function creat() {
    var that = this;
    var type = [null, undefined, NaN]
    this.url.forEach(function (value, index, array) {
        var html = document.getElementById(that.id[index]);
        html.innerHTML = '';
        if (type.indexOf(value) >= 0) return false
        value.split(',').forEach(function (val, ind, arr) {
            var img = document.createElement('img'); // 创建img标签
            img.className = 'idePhoto';
            img.setAttribute('src', val)
            html.appendChild(img)
        })

    })
}
ImgCreated.prototype.dataType = dataType;
ImgCreated.prototype.creat = creat;

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

function parseIntStr(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}

function initFileInput(uiEle, type, func = null) {
    var obj = $("#" + uiEle).fileinput({
        language: 'zh', //设置语言 
        uploadUrl: '/Upload/Post',
        //enctype: 'multipart/form-data',
        allowedFileExtensions: ['bin'],//接收的文件后缀
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
    }).on('fileerror', function (event, data, msg) {  //一个文件上传失败
        console.log('文件上传失败！' + msg);
        $(this).fileinput('clear');
    }).on("fileuploaded", function (event, fileRet, previewId, index) {
        console.log("文件上传成功！");
        $(this).fileinput('clear');
        fileCallBack[fileEnum.FirmwareLibrary](fileRet.response);
    });

    return obj;
}

function checkFileExt(file, fileExt) {
    for (var i = 0; i < fileExt.length; i++) {
        if (file.indexOf(fileExt[i]) > -1)
            return true;
    }
    return false;
}

//整数5位  小数4位
function onInput(obj, zs = 5, xs = 4) {
    obj.value = input(obj.value, zs, xs);
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
        if (s.length > 0 && s[0].length > zs) {
            s[0] = s[0].substr(0, zs);
        }
        s = s.join(".");
    }
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
    }
    return s.split("").reverse().join("");
}

function autoCal(obj, ui) {
    if (obj.value == '')
        return;

    var t = 0;
    if (obj.value.indexOf("±") > -1)
        t = 1;
    else if (obj.value.indexOf("～") > -1)
        t = 2;
    else if (obj.value.indexOf("±") > -1)
        t = 3;

    ui = $("#" + ui);
    var num = [];
    var s = obj.value.replace(" ", "").split("");
    s.push(";");
    var n = "";
    for (var i = 0; i < s.length; i++) {
        if (isNumber(s[i]) || s[i] == '.') {
            n += s[i];
        } else {
            if (isNumber(n))
                num[num.length] = parseFloat(n);
            n = "";
        }
    }

    var p;
    switch (t) {
        case 1:
            if (num.length >= 1) {
                p = num[0]; break;
            }
        case 2:
            if (num.length == 1) {
                p = num[0]; break;
            } else if (num.length >= 2) {
                p = (num[0] + num[1]) / 2.0; break;
            }
        default:
            if (num.length >= 1) {
                p = num[0];
                break;
            }
            p = 0; break;
    }

    p = input(p.toString());
    p = inputEnd(p.toString());
    ui.val(p);
}


