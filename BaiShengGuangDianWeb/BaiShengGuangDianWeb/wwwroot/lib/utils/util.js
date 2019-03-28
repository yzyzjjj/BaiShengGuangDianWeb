function isPhone(phoneNum) {
    var res = false
    //简单判断下是否是数字
    if (isNaN(phoneNum)) {
        return res
    }
    res = /^1[0-9]{10}$/i.test(phoneNum)
    return res
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
        return true
    }
    if (val == null) {
        return true
    }
    return false
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
        return null
    }

    var strarr = token.split(".")
    var info = strarr[1]

    var result2 = Base64.decode(info)
    var obj = JSON.parse(result2);
    
    obj.permissionsList = obj.permissions.split(",").map(Number)
    // console.log( obj )
    return obj
}

//从token中获取jwt信息
function getCookieTokenInfo() {
    var token = GetCookie("token")
    var info = getJwtInfo(token)

    return info
}
//检查token是否过期之类
function isTokenValid() {
    var tkinfo = getCookieTokenInfo()
    if (tkinfo == null) {
        return false
    }

    var timestamp = new Date().getTime() / 1000
    if (timestamp > tkinfo.exp) {
        return false
    }

    return true
}

//查看是否有角色是否有权限
function checkHaveRole(role) {
    var tkinfo = getCookieTokenInfo()
    if (tkinfo == null) {
        return false;
    }
    var accroles = tkinfo.roles
    if (accroles.indexOf("Admin") >= 0) {
        return true;
    }
    if (accroles.indexOf(role) >= 0) {
        return true;
    }
    return false;
}

//ajax 包装 data 必须是张表，或者null,带token
function ajaxPost(url, data, func) {

    if (data == null || data == undefined) {
        data = {}
    }

    var token = GetCookie("token")
    if (!isStrEmptyOrUndefined(token)) {
        data.token = token
    }

    $.post(url, data, func);

}

//ajax 包装 data 必须是张表，或者null,带token
function ajaxGet(url, data, func) {

    if (data == null || data == undefined) {
        data = {}
    }

    var token = GetCookie("token");
    if (!isStrEmptyOrUndefined(token)) {
        data.token = token;
    }

    var paramstr = "";
    for (var key in data) {
        if (paramstr == "") {
            paramstr = "?";
        }
        if (paramstr != "?") {
            paramstr = paramstr + "&";
        }
        paramstr = paramstr + key + "=" + data[key];
    }


    url = url + paramstr;
    $.get(url, func);

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

    //token 有问题，重新登录
    if (ret.errno == ErrorEnum.MissToken || ret.errno == ErrorEnum.TokenError || ret.errno == ErrorEnum.TokenInvalid) {
        window.location.href = const_loginurl;
    }
    return true;
}

/*
 功能：保存cookies函数
 参数：name，cookie名字；value，值
 */
function SetCookie(name, value) {
    var Days = 30 * 12;  //cookie 将被保存一年
    var exp = new Date(); //获得当前时间
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000); //换成毫秒
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
                } else
                {
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
function imgShowBig(id)
{

    var viewer = new Viewer(document.getElementById(id), {
        ready: function ()
        {
            viewer.update();
        },
        show: function ()
        {
            viewer.update();

        },
        shown: function ()
        {
            viewer.update();

        },
        hide: function ()
        {
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



//添加菊花效果
function addCover() {
    var html = '<div id="body-cover"><div class="spinner"> <div class="spinner-container container1"><div class="circle1"></div><div class="circle2"></div> <div class="circle3"></div><div class="circle4"></div>  </div> <div class="spinner-container container2"><div class="circle1"></div> <div class="circle2"></div><div class="circle3"></div> <div class="circle4"></div> </div><div class="spinner-container container3"><div class="circle1"></div> <div class="circle2"></div>  <div class="circle3"></div> <div class="circle4"></div></div></div></div>'
    $('body').append(html);
}
//删除菊花效果
function removeCover() {
    $('#body-cover').remove();
}


//查询统一接口
function CommonTabel(option) {
    this.id = option.id;
    this.value = option.value;
    this.dataId = option.dataId;
    this.state = option.state;
    this.button = option.button ? option.button : '确定'
    this.show = option.show;
    this.fifter = option.fifter;
    this.condition = option.condition;
    this.getData()
}

//同一个借口数据
function getData() {
    var that = this;
    ajaxGet("account/search", {
        value: this.value
    }, function (res) {
        if (res.errmsg === 'success') {
            var data = res.accounts.filter(function (val) {
                return that.condition.indexOf(val[that.fifter]) < 0

            })
            that.createTable(data);
            that.show.modal("show");
        } else {
            that.fail(res.errmsg)
        }
    })
}
//生成表格
function createTable(data) {
    var idKey = this.dataId;
    var state = this.state;
    var button = this.button;
    var accTypeRender = function (data, type, row) {
        return ['', '用户', '商户', '代理'][data.AccountType]
    }
    var opRender = function (data, type, row) {
        return '<button type="button" class="btn btn-primary" onclick="addToList(this)" data-id="' + data[idKey] + '" data-state="' + state + '">' + button + '</button>';
    }
    this.id.DataTable({
        "paging": true,
        "searching": false,
        "aaSorting": [[0, "desc"]],
        "language": { "url": "../content/datatables_language.json" },
        //"dom": 'Bfrtip',
        //"buttons": ['copy', 'csv', 'excel', 'pdf', 'print'],//excel,pdf Chrome需要打开flash，否则不显示
        //"dataSrc": "",
        "destroy": true,
        "columns": [
            { "data": "AccountId", "title": "账号ID" },
            { "data": "Name", "title": "姓名" },
            { "data": null, "title": "身份", "render": accTypeRender },
            { "data": "Phone", "title": "账号" },
            { "data": null, "title": "操作", "render": opRender },
        ],
        "data": data
    });
}
//失败
function fail(e) {
    layer.alert(e)
}

CommonTabel.prototype.getData = getData;
CommonTabel.prototype.fail = fail;
CommonTabel.prototype.createTable = createTable;


//状态判断
var all_status = [{
    text: '',
    color: '',
    index: 0
}, {
    text: '封号',
    color: '',
    index: 1
}, {
    text: '解封',
    color: '',
    index: 2
}, {
    text: '商户入驻请求通过',
    color: '',
    index: 3
}, {
    text: '重新实名',
    color: '',
    index: 4
}, {
    text: '加入提现白名单',
    color: '',
    index: 5
}, {
    text: '加入提现黑名单',
    color: '',
    index: 6
}, {
    text: '删除提现控制，从黑名单或白名单中移除',
    color: '',
    index: 7
}, {
    text: '全服提现控制设置',
    color: '',
    index: 8
}, {
    text: '商户返利设置',
    color: '',
    index: 9
}, {
    text: '资金成本比例设置',
    color: '',
    index: 10
}, {
    text: '手续费比例设置',
    color: '',
    index: 11
}, {
    text: '管理费比例设置',
    color: '',
    index: 12
}, {
    text: '最高管理费比例设置',
    color: '',
    index: 13
}, {
    text: '',
    color: '',
    index: 14
}, {
    text: '',
    color: '',
    index: 15
}, {
    text: '',
    color: '',
    index: 15
}, {
    text: '',
    color: '',
    index: 17
}, {
    text: '退保退款',
    color: '',
    index: 18
}, {
    text: '线下充值确认',
    color: '',
    index: 19
}, {
    text: '线下充值打回',
    color: '',
    index: 20
}, {
    text: '线下充值撤回',
    color: '',
    index: 21
}, {
    text: '滞纳金比例设置',
    color: '',
    index: 22
}, {
    text: '对公用户重新上传营业执照照片',
    color: '',
    index: 23
}, {
    text: '用户提现审核',
    color: '',
    index: 24
}, {
    text: '提现审核通过',
    color: 'green'
}, {
    text: '提现审核打回',
    color: 'red'
}, {
    text: '提现成功',
    color: 'green'
}, {
    text: '提现失败',
    color: 'red'
}, {
    text: '重新提现',
    color: 'rgb(255,166,77)'
}, {
    text: '商户提现审核',
    color: ''
}, {
    text: '分期转不分期申请',
    color: ''
}, {
    text: '分期转不分期重新申请',
    color: ''
}, {
    text: '分期转不分期打回',
    color: ''
}, {
    text: '分期转不分期通过',
    color: ''
}, {
    text: '基础授信额度设置',
    color: ''
}, {
    text: '商家实际授信额度设置',
    color: ''
}, {
    text: '授信天数设置',
    color: ''
}, {
    text: '授信额度警戒线设置',
    color: ''
}, {
    text: '修改账号密码',
    color: ''
}, {
    text: '修改管理账号密码',
    color: ''
}, {
    text: '用户账号私转公',
    color: ''
}, {
    text: '修改开票信息',
    color: ''
}, {
    text: '保险类型设置',
    color: ''
}, {
    text: '删除下级商户',
    color: ''
}, {
    text: '删除上级商户',
    color: ''
}, {
    text: '添加下级商户',
    color: ''
}, {
    text: '添加上级商户',
    color: ''
}, {
    text: '管理账号登录',
    color: ''
}]


//商户账号管理，和用户账号管理，对公账号，公司信息页面中
var account_state = [{
    text: ''
}, {
    text: '对公打款中'
}]