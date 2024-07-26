/*!
 * LiteWebChat_Frame 2.2.1 (https://lab.morfans.cn/LiteWebChat_Frame)
 * MorFans Lab(c) 2017-2023
 * Licensed under LGPL
 */"use strict";

// !参考资料来源：
// !https://blog.csdn.net/weixin_40629244/article/details/104642683
// !https://github.com/jrainlau/chat-input-box
// !https://www.zhihu.com/question/20893119/answer/19452676
// !致谢：感谢@jrainlau提供的思路和代码，我在他的富文本编辑器基础上进行了修改，使其能够在聊天输入框中使用
// ————YubaC 2023.1.23


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


/*
  发送 Ajax 请求
  需改变的参数则需写上，使用默认的不用写，所有的参数都可以不写
  @param  {Object} paramObj 参数对象,具体参考下面的用例
  @return {Object} c$ 对象本身，以支持连缀

  ajax({
     url : "submit.html",                         // 需要发送的地址(默认: 当前页地址)
     param : "a=1&b=2",                           // 需要发送的传参字符串，或者json对象
     async : true,                                // 异步或者同步请求(默认: true, 异步请求)。如果需要发送同步请求，请将此选项设置为 false
     cache : true,                                // 是否允许缓存请求(默认: true, 允许缓存)
     method : "GET",                              // 请求方式(默认: "GET"),也可用"POST"
     success : function(xmlHttp){....},           // 请求成功返回的动作
     error : function(xmlHttp, status){....},     // 请求失败时的动作
     complete : function(xmlHttp, status){....}   // 请求返回后的动作(不管成败,且在 success 和 error 之后运行)
  });
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


// 把节点插在另一个节点之后
function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode;
    if (parent.lastChild == targetElement) {
        parent.appendChild(newElement);
    } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
    }
}

// --------------------------------
var upperChild = null;  // 上半部分的聊天区域
var oLine = null;  // 分界线
var downChild = null;  // 下半部分的输入框区域

// 以下为输入框区域的按钮
var emojiBtn = null; // 表情按钮
var imageBtn = null; // 图片按钮
var fileBtn = null; // 文件按钮
var editFullScreen = null; // 全屏按钮
var exitFullScreen = null; // 退出全屏按钮
var emojiMart = null; // 表情面板
var toolMusk = null; // 表情面板遮罩
var sendBtn = null; // 发送按钮
var chatInput = null; // 输入框
var switchLanguage = null; // 切换语言
// --------------------------------

// Emoji Mart（表情面板）设置及唤起
var pickerOptions = {
  "locale": "zh",
  onEmojiSelect: function onEmojiSelect(e) {
    // console.log(e.native);
    emojiMart.style.display = "none";
    toolMusk.style.display = "none";
    insertAtCursor(chatInput, e.native);
    // insertEmoji(e.native);
  }
};

// 负责在光标处插入文字的函数
function insertAtCursor(myField, myValue) {
  var editor = myField;
  var html = myValue;
  editor.focus();
  if (window.getSelection) {
    var selection = window.getSelection();
    if (selection.getRangeAt && selection.rangeCount) {
      var range = selection.getRangeAt(0);
      range.deleteContents();
      var element = document.createElement('div');
      element.innerHTML = html;
      var node;
      var lastNode;
      var fragment = document.createDocumentFragment();
      while (node = element.firstChild) {
        lastNode = fragment.appendChild(node);
      }
      ;
      range.insertNode(fragment);
      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      ;
    }
  } else if (document.selection && document.selection.type != 'Control') {
    editor.focus();
    var range = document.selection.createRange();
    range.pasteHTML(html);
    editor.focus();
  }
}

// 将图片插入到输入框中
function addImage(file) {
  new Promise(function (resolve, reject) {
    // console.log(file);
    // 获取file的src
    var reader = new FileReader();
    reader.onload = function (e) {
      var src = e.target.result;
      var img = new Image();
      img.src = src;

      // *这里的方法已经转移到了css里，暂时弃用
      // // 为了防止图片在输入框内显示过大不好编辑
      // img.style.width = "100px";
      // 将img从HEMLElement转化为字符串
      // 例如，转化结束后为'<img src="">'
      var imgStr = img.outerHTML;
      // 将img字符串插入到输入框中
      insertAtCursor(chatInput, imgStr);
    };
    reader.readAsDataURL(file);
  });
}

// 上传图片、文件
function inputFile(settings) {
  console.log(settings);
  // -----------------设置最大图片大小及数量-----------------
  if (settings.maxImageSize != undefined) {
    var maxImageSize = settings.maxImageSize;
  } else {
    var maxImageSize = -1;
  }
  if (settings.maxImageNumber != undefined) {
    var maxImageNumber = settings.maxImageNumber;
  } else {
    var maxImageNumber = -1;
  }
  if (settings.enable) {
    // -----------------上传图片的按钮-----------------
    imageBtn.onclick = function () {
      var imageInput = document.createElement('input');
      imageInput.type = 'file';
      imageInput.accept = 'image/*';
      imageInput.multiple = true;
      imageInput.style.display = 'none';
      imageInput.onchange = function () {
        // 获取输入框内图片数量
        // 获取文件
        var imgNum = chatInput.getElementsByTagName('img').length;
        for (var i = 0; i < this.files.length; i++) {
          if (maxImageNumber == -1 || imgNum < maxImageNumber) {
            // 如果大小超过限制，改用文件上传
            if (maxImageSize == -1 || this.files[i].size <= maxImageSize) {
              imgNum++;
              addImage(this.files[i]);
            } else {
              sendFile(this.files[i]);
            }
          }
        }
      };
      // 触发点击事件
      imageInput.click();
    };
    // -----------------上传文件的按钮-----------------
    var sendFile = settings.sendFileFunc;
    // 上传文件按钮
    fileBtn.onclick = function () {
      // 创建一个隐藏的上传文件的input，再借助点击这个input来上传文件
      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      // accept属性设置了允许上传的文件类型，值如：".doc, .docx, .xls, .txt, application/msword, image/*"
      if (settings.accept) {
        fileInput.accept = settings.accept;
      }
      fileInput.multiple = true;
      fileInput.style.display = 'none';
      fileInput.onchange = function () {
        // 获取文件
        for (var i = 0; i < this.files.length; i++) {
          var file = this.files[i];
          sendFile(file);
        }
      };
      // 触发点击事件
      fileInput.click();
    };

    // -----------------拖拽上传-----------------
    if (settings.enableDrop) {
      // 当downChild有文件被拖入时，也调用上传文件的函数
      downChild.ondrop = function (e) {
        e.preventDefault();
        // 阻止火狐浏览器默认打开文件的行为
        e.stopPropagation();
        downChild.style.border = "none";
        // 获取被拖拽的文件并上传
        var imgNum = chatInput.getElementsByTagName('img').length;
        for (var i = 0; i < e.dataTransfer.files.length; i++) {
          var file = e.dataTransfer.files[i];
          // 如果是图片，直接插入到输入框中
          if (file.type.indexOf("image") == 0) {
            if (maxImageNumber == -1 || imgNum < maxImageNumber) {
              // 如果大小超过限制，改用文件上传
              if (maxImageSize == -1 || file.size <= maxImageSize) {
                addImage(file);
                imgNum++;
              } else {
                sendFile(file);
              }
            }
          } else {
            sendFile(file);
          }
        }
      };

      // 当downChild有文件被拖入时，改变downChild的边框颜色
      downChild.ondragover = function (e) {
        e.preventDefault();
        downChild.style.border = "3px solid #1E90FF";
      };

      // 当downChild有文件被拖入后离开时，改回downChild的边框颜色
      downChild.ondragleave = function (e) {
        e.preventDefault();
        downChild.style.border = "none";
      };
    }
  } else {
    // 如果不允许上传，那么删除事件
    imageBtn.onclick = null;
    fileBtn.onclick = null;
    // 删除拖拽事件
    downChild.ondrop = null;
    downChild.ondragover = null;
    downChild.ondragleave = null;
  }
}

//格式化粘贴文本方法
function onPaste(event) {
  // 如果粘贴的是文本，就清除格式后粘贴
  if (event.clipboardData && event.clipboardData.getData) {
    var text = event.clipboardData.getData('text/plain');
    if (text) {
      event.preventDefault();
      document.execCommand('insertText', false, text);
    }
  }
}
//# sourceMappingURL=map/litewebchat_input.js.map

// 设置语言
function changeLanguage(settings) {
    switchLanguage.onclick = function () {
        if (language.title === i18n.cn.title) {
            language = i18n["en"];
        } else {
            language = i18n["cn"];
        }
        document.title = language.title;
        emojiBtn.title = language.emo;
        fileBtn.title = language.sendFile;
        switchLanguage.title = language.switchLanguage;
        editFullScreen.title = language.editFullScreen;
        exitFullScreen.title = language.exitFullScreen;
        sendBtn.innerHTML = language.send;
        if (settings && settings.func) {
            settings.func();
        }
    };
}

document.addEventListener("DOMContentLoaded", function() {
    // 聊天区域
    upperChild = document.querySelector('.lite-chatbox');  // 上半部分的聊天区域
    oLine = document.querySelector('.lite-chatinput hr');  // 分界线
    downChild = document.querySelector('.lite-chatinput');  // 下半部分的输入框区域

    // 以下为输入框区域的按钮
    emojiBtn = document.getElementById("emojiBtn"); // 表情按钮
    imageBtn = document.getElementById("imageBtn"); // 图片按钮
    fileBtn = document.getElementById("fileBtn"); // 文件按钮
    editFullScreen = document.getElementById("editFullScreen"); // 全屏按钮
    exitFullScreen = document.getElementById("exitFullScreen"); // 退出全屏按钮
    emojiMart = document.getElementById("emojiMart"); // 表情面板
    toolMusk = document.getElementById("toolMusk"); // 表情面板遮罩
    sendBtn = document.getElementById("sendBtn"); // 发送按钮
    chatInput = document.querySelector('.lite-chatinput>.chatinput'); // 输入框
    switchLanguage = document.getElementById("switchLanguage"); // 切换语言
    changeLanguage();

    // 表情输入框初始化
    var picker = new EmojiMart.Picker(pickerOptions);
    emojiMart.appendChild(picker);

    // 获取聊天区域和输入框区域的高度
    var downHeight = downChild.clientHeight;
    var upperHeight = upperChild.clientHeight;

    // 调整聊天区域和输入框区域比例的函数
    oLine.onmousedown = function (ev) {
      // 更改oLine颜色为蓝色，方便查看分界线
      var olineOriBgColor = oLine.style.backgroundColor;
      oLine.style.backgroundColor = "#1E90FF";
      var iEvent = ev || event;
      var dy = iEvent.clientY; //当你第一次单击的时候，存储y轴的坐标。//相对于浏览器窗口
      upperHeight = upperChild.offsetHeight;
      downHeight = downChild.offsetHeight;
      document.onmousemove = function (ev) {
        var iEvent = ev || event;
        var diff = iEvent.clientY - dy; //移动的距离（向上滑时为负数,下滑时为正数）
        if (100 < upperHeight + diff && 100 < downHeight - diff) {
          //两个div的最小高度均为100px
          upperChild.style.height = "calc(100% - ".concat(downHeight - diff, "px)");
          downChild.style.height = downHeight - diff + 'px';
        }
      };
      document.onmouseup = function () {
        // 更改oLine颜色为原色
        oLine.style.backgroundColor = olineOriBgColor;
        document.onmousedown = null;
        document.onmousemove = null;
      };
      return false;
    };

    // 显示表情输入框
    emojiBtn.onclick = function () {
      emojiMart.style.display = "block";
      toolMusk.style.display = "block";
      var emojiHeight = emojiMart.offsetHeight;
      downHeight = downChild.clientHeight;
      upperHeight = upperChild.clientHeight;
      if (emojiHeight < upperHeight) {
        emojiMart.style.bottom = "".concat(downHeight + 3, "px");
        emojiMart.style.top = '';
      } else {
        emojiMart.style.bottom = '';
        emojiMart.style.top = '10px';
      }
    };

    // 全屏编辑文字
    editFullScreen.onclick = function () {
      downHeight = downChild.clientHeight;
      upperHeight = upperChild.clientHeight;
      downChild.style.height = "100%";
      upperChild.style.height = "0px";
      editFullScreen.style.display = "none";
      exitFullScreen.style.display = "block";
      oLine.style.display = "none";
    };

    // 退出全屏编辑文字
    exitFullScreen.onclick = function () {
      // 防呆不防傻，用于避免上部聊天窗口被压到没有高度后出现异常
      if (upperHeight != 0) {
        downChild.style.height = "".concat(downHeight, "px");
        upperChild.style.height = "calc(100% - ".concat(downHeight, "px)");
      } else {
        upperChild.style.height = "calc(100% - 150px)";
        downChild.style.height = "150px";
      }
      exitFullScreen.style.display = "none";
      editFullScreen.style.display = "block";
      oLine.style.display = "block";
    };

    // 隐藏musk和表情输入框
    toolMusk.onclick = function () {
      emojiMart.style.display = "none";
      toolMusk.style.display = "none";
    };

    // TODO:可能富文本输入框的粘贴部分需要对Chrome浏览器做部分额外适配，以优化体验
    // 无格式粘贴
    chatInput.addEventListener('paste', function (e) {
      onPaste(e);
    });

    chatInput.focus(); // 自动聚焦到输入框
});
