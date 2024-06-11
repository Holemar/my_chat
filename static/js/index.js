
/**
 * 这是错误调试程序
 * 当页面发生错误时，提示错误讯息；仅测试环境里会提示，正式环境下不提示错误。
 * 注意：仅IE、fiefox有效,w3c标准里面没有此定义, chrome、opera 和 safari 浏览器不支持此事件
 */
window.onerror = function(msg, url, sLine) {
    var hostUrl = window.location.href;
    // 判断网址,测试时可以提示出错信息;正式发布时不提示
    if (hostUrl.indexOf("http://localhost") === 0 || hostUrl.indexOf("http://127.0.0.") === 0 ||
        hostUrl.indexOf("http://192.168.") === 0 || hostUrl.indexOf("file://") === 0 ||
        hostUrl.indexOf("http://0.0.0.0") === 0) {
        var errorMsg = "当前页面的javascript发生错误.\n\n";
        errorMsg += "错误: " + msg + "\n";   // 出错信息
        errorMsg += "URL: " + url + "\n";    // 出错文件的地址
        errorMsg += "行: " + sLine + "\n\n"; // 发生错误的行
        errorMsg += "点击“确定”以继续。\n\n";
        window.alert( errorMsg );
    }
    // 返回true,会消去 IE下那个恼人的“网页上有错误”的提示
    return true;
};


/**
 * 发送 Ajax 请求
 * 需改变的参数则需写上，使用默认的不用写，所有的参数都可以不写
 * @param  {Object} paramObj 参数对象,具体参考下面的用例
 * @return {Object} c$ 对象本身，以支持连缀
 *
 * ajax({
 *    url : "submit.html",                         // 需要发送的地址(默认: 当前页地址)
 *    param : "a=1&b=2",                           // 需要发送的传参字符串，或者json对象
 *    async : true,                                // 异步或者同步请求(默认: true, 异步请求)。如果需要发送同步请求，请将此选项设置为 false
 *    cache : true,                                // 是否允许缓存请求(默认: true, 允许缓存)
 *    method : "GET",                              // 请求方式(默认: "GET"),也可用"POST"
 *    success : function(xmlHttp){....},           // 请求成功返回的动作
 *    error : function(xmlHttp, status){....},     // 请求失败时的动作
 *    complete : function(xmlHttp, status){....}   // 请求返回后的动作(不管成败,且在 success 和 error 之后运行)
 * });
 */
function ajax(paramObj) {
    // 创建 XMLHttpRequest
    var xmlHttp = new XMLHttpRequest();
    // 如果不支缓 Ajax，提示信息
    if (!xmlHttp) {
        alert("您的浏览器不支持 Ajax，部分功能无法使用！");
        return this;
    }

    // 需要发送的地址(默认: 当前页地址)
    paramObj.url = paramObj.url || "#";
    // 异步或者同步请求(默认: true, 异步请求)
    if (typeof paramObj.async == 'undefined') {
        paramObj.async = true;
    }
    // 请求方式(默认: "GET")
    paramObj.method = paramObj.method || "GET";
    // get形式，将参数放到URL上
    if ("GET" == ("" + paramObj.method).toUpperCase() && paramObj.param) {
        paramObj.url += (paramObj.url.indexOf("?") > 0) ? "&" : "?";
        paramObj.url += paramObj.param;
        paramObj.param = null;
    }
    // 发送请求
    xmlHttp.open(paramObj.method, paramObj.url, paramObj.async);
    // 执行回调方法
    xmlHttp.onreadystatechange = function() {
        // XMLHttpRequest对象响应内容解析完成
        if (4 !== xmlHttp.readyState) return;
        var status = xmlHttp.status;
        // 200为正常返回状态, 0是本地直接打开文件(没有使用服务器时)
        if (200 == status || 0 === status) {
            // 请求成功时的动作
            if (paramObj.success) paramObj.success(xmlHttp);
        }
        else {
            // 请求失败时的动作
            if (paramObj.error)  paramObj.error(xmlHttp, status);
            // 默认的出错处理
            else alert("页面发生Ajax错误，请联系管理人员! \n错误类型：" + status + ": “" + location.pathname + "”");
        }
        // 请求返回后的动作(不管成败,且在 success 和 error 之后运行)
        if (paramObj.complete) paramObj.complete(xmlHttp, status);
    };
    // 缓存策略(默认: 缓存)
    if (false === paramObj.cache) {
        xmlHttp.setRequestHeader("If-Modified-Since","0");
        xmlHttp.setRequestHeader("Cache-Control","no-cache");
    }
    // 请求方式("POST")
    if (paramObj.method.toUpperCase() == "POST") xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    xmlHttp.setRequestHeader("Charset", "UTF-8");
    // 发送参数
    xmlHttp.send(paramObj.param);
};


const htmls = [];  // 对话内容
var targetId = null; // 文件编码
var chatboxClass = '.lite-chatbox';  // 聊天框选择器

function sendMessage() {
    var message = document.querySelector('.chatinput').innerHTML;
    htmls.push({
        messageType: 'raw',
        position: 'right',
        html: message
    });
    beforeRenderingHTML(htmls, chatboxClass);
    document.querySelector('.chatinput').innerHTML = '';  // 清空输入框
    // 没有上传文件时
    if (!targetId) {
        // htmls.push({'messageType': 'tipsWarning', html: '系统消息：请先上传 PDF 文件'});
        // beforeRenderingHTML(htmls, chatboxClass);
        htmls.push({
            messageType: 'raw',
            headIcon: '/static/images/A.jpg',
            name: 'PDF智能解析机器人',
            position: 'left',
            html: `请先点击下面按钮选择需要解析的 PDF 文件：<br/> <button class="file-btn" onclick="document.getElementById('fileBtn').click();">文件上传</button>`
        });
        beforeRenderingHTML(htmls, chatboxClass);
    } else {
        ajax({
             "url": "/api/chat_message",
             "param": "targetId=" + targetId + "&message=" + encodeURIComponent(message),
             "method": "POST",
             "success": function(xmlHttp) {
                var data = JSON.parse(xmlHttp.responseText);
                if (data.status) {
                    htmls.push({
                        messageType: 'raw',
                        headIcon: '/static/images/A.jpg',
                        name: 'PDF智能解析机器人',
                        position: 'left',
                        html: data.message
                    });
                    beforeRenderingHTML(htmls, chatboxClass);
                } else {
                    htmls.push({'messageType': 'tipsDanger', html: '系统错误：' + data.message});
                    beforeRenderingHTML(htmls, chatboxClass);
                }
             }
        });
    }
}

function sendFile(file) {
    let xhr = new XMLHttpRequest();
    xhr.open('post', '/api/add_file', true);
    xhr.onload = function () {
        let data = JSON.parse(xhr.responseText);
        if (data.status) {
            targetId = data.message;
            htmls.length = 0;  // 清空数组
            htmls.push({
                messageType: 'raw',
                headIcon: '/static/images/A.jpg',
                name: 'PDF智能解析机器人',
                position: 'left',
                html: '文件已经完成智能解析，请就这文件进行讨论。'
            });
            // 清空之前的聊天内容，避免再次上传文件（此场景暂不考虑）
            document.querySelector(chatboxClass).innerHTML = '';
            beforeRenderingHTML(htmls, chatboxClass);
        } else {
            htmls.push({'messageType': 'tipsDanger', html: '系统错误：' + data.message});
            beforeRenderingHTML(htmls, chatboxClass);
        }
    }

    let form = new FormData();
    form.append('file', file); // 对应 key value
    xhr.send(form);
}

document.addEventListener("DOMContentLoaded", function() {
    htmls.push({
        messageType: 'raw',
        headIcon: '/static/images/A.jpg',
        name: 'PDF智能解析机器人',
        position: 'left',
        html: `请先点击下面按钮选择需要解析的 PDF 文件：<br/> <button class="file-btn" onclick="document.getElementById('fileBtn').click();">文件上传</button>`
    });
    beforeRenderingHTML(htmls, chatboxClass);

    // 设置发送文件
    inputFile({
        // 允许发送文件
        enable: true,
        // 允许在输入框处拖拽发送文件
        enableDrop: true,
        maxImageSize: 1024 * 1024 * 10, // 图片最大 10MB，超过了就要用文件发送，默认为 -1（无限制），可以不设置
        maxImageNumber: 20, // 输入框内最多同时存在 20 张图片，默认为 -1（无限制），可以不设置
        // 负责发送文件的函数（回调函数），file 为传回的文件信息，与使用 <input> 标签获得的相同
        sendFileFunc: sendFile
    });
});
