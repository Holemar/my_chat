/*!
 * LiteWebChat_Frame 2.2.1 (https://lab.morfans.cn/LiteWebChat_Frame)
 * MorFans Lab(c) 2017-2023
 * Licensed under LGPL
 */"use strict";

var TipsType = {
  tipsNormal: 'tips',
  tipsPrimary: 'tips-primary',
  tipsSuccess: 'tips-success',
  tipsInfo: 'tips-info',
  tipsWarning: 'tips-warning',
  tipsDanger: 'tips-danger'
};
var TitleType = {
  admin: 'admin',
  owner: 'owner'
};
function beforeRenderingHTML(data, chatboxClass) {
  var htmlStr = '';
  var chatBox = document.querySelector(chatboxClass);
  for (var i = 0; i < data.length; i++) {
    if (data[i].isRender) {
      continue;
    }
    if (data[i].messageType.indexOf('tips') !== -1) {
      htmlStr += renderTipHtml(data[i].html, TipsType[data[i].messageType] || 'tips');
    } else {
      htmlStr += renderMessageHtml(data[i]);
    }
    data[i].isRender = true;
  }
  chatBox.insertAdjacentHTML('beforeend', htmlStr);
  setTimeout(function () {
    if (chatBox.scrollHeight > chatBox.clientHeight) {
      chatBox.scrollTop = chatBox.scrollHeight;
      chatBox = '';
      htmlStr = '';
    }
  }, 300);
}
function renderMessageHtml(data) {
  var htmlStr = "<div class=\"c".concat(data.position, " cmsg\">\n        ");
  if (data.headIcon) {
    htmlStr += "<img class=\"headIcon ".concat(data.diamond ? '' : 'radius', "\" src=\"").concat(data.headIcon, "\" ondragstart=\"return false;\" oncontextmenu=\"return false;\"/>\n        ");
  }
  var titleStr = renderTitleHtml(data.htitle, TitleType[data.htitleType] || '');
  var value = data.messageType === 'raw' ? data.html : escapeHtml(data.html);
  htmlStr += "<span class=\"name\">\n            ".concat(titleStr, "\n            <span>", escapeHtml(data.name) || '&nbsp;', "</span>\n        </span>\n        <span class=\"content\">", value, "</span>\n    </div>");
  return htmlStr;
}
function renderTitleHtml(content, css) {
  if (!content) return '';
  return "<span class=\"htitle ".concat(css, "\" style=\"margin: 0 4px 0 0;\">").concat(content, "</span>");
}
function renderTipHtml(content, css) {
  if (!content) return '';
  return "<div class=\"tips\"><span class=\"".concat(css, "\" style=\"margin-bottom: 20px;\">").concat(escapeHtml(content), "</span></div>");
}

// 转义 C0 Controls and Basic Latin 中非数字和字母，C1 Controls and Latin-1 Supplement 全部
// https://www.w3schools.com/charsets/ref_html_utf8.asp
function escapeHtml(unsafe) {
  return unsafe === null || unsafe === void 0 ? void 0 : unsafe.replace(/[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00FF]/g, function (c) {
    return '&#' + ('000' + c.charCodeAt(0)).slice(-4) + ';';
  });
}
//# sourceMappingURL=map/litewebchat_render.js.map


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
