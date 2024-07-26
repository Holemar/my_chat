
const htmls = [];  // 对话内容
var targetId = null; // 文件编码
var chatboxClass = '.lite-chatbox';  // 聊天框选择器

// 机器人发消息
function setBotMessage(message) {
    let botMessage = {
         "messageType": 'raw',
         "headIcon": '/static/images/A.jpg',
         "name": language.botName,
         "position": 'left',
         "html": language.botBtnHtml + `<br/> <button class="file-btn" onclick="document.getElementById('fileBtn').click();">` + language.botBtnValue + `</button>`
    };
    if (message) {
        botMessage.html = message;
    }
    htmls.push(botMessage);
    beforeRenderingHTML(htmls, chatboxClass);
}

// 清空聊天记录
function clearChat() {
    htmls.length = 0;  // 清空数组
    document.querySelector(chatboxClass).innerHTML = '';  // 清空之前的聊天内容
}

// 发送消息(聊天框点"发送"的事件)
function sendMessage() {
    var message = document.querySelector('.chatinput').innerHTML;
    if (!message) return;
    htmls.push({'messageType': 'raw', 'position': 'right', 'html': message});
    beforeRenderingHTML(htmls, chatboxClass);
    document.querySelector('.chatinput').innerHTML = '';  // 清空输入框
    // 没有上传文件时
    if (!targetId) {
        // htmls.push({'messageType': 'tipsWarning', html: '系统消息：请先上传 PDF 文件'});
        // beforeRenderingHTML(htmls, chatboxClass);
        setBotMessage();
    } else {
        ajax({
             "url": "/api/chat_message",
             "param": "targetId=" + targetId + "&message=" + encodeURIComponent(message),
             "method": "POST",
             "success": function(xmlHttp) {
                var data = JSON.parse(xmlHttp.responseText);
                if (data.status) {
                    setBotMessage(data.message);
                } else {
                    htmls.push({'messageType': 'tipsDanger', html: language.systemError + data.message});
                    beforeRenderingHTML(htmls, chatboxClass);
                }
             }
        });
    }
}

// 上传文件处理
function sendFile(file) {
    let xhr = new XMLHttpRequest();
    xhr.open('post', '/api/add_file', true);
    xhr.onload = function () {
        let data = JSON.parse(xhr.responseText);
        if (data.status) {
            targetId = data.message;
            clearChat();  // 清空之前的聊天内容
            setBotMessage(language.theFile + data.file_name + language.parsedFile);
            // 上传文件后，新增一个菜单项
            let currentTimeStamp = new Date().getTime();  // 当前时间戳，当作新菜单项的ID
            let liNode = document.createElement('li');
            liNode.innerHTML = '<a class="active" id="menu_' + currentTimeStamp + '" href=\'javascript:loadChatRecord("' + targetId + '", "menu_' + currentTimeStamp + '")\'>' + data.file_name + '</a>';
            let newMenu = document.querySelector('.left-menu ul').firstChild;  // "新建文档"菜单项
            newMenu.firstChild.className = 'new';
            insertAfter(liNode, newMenu);
        } else {
            htmls.push({'messageType': 'tipsDanger', html: language.systemError + data.message});
            beforeRenderingHTML(htmls, chatboxClass);
        }
    }

    let form = new FormData();
    form.append('file', file); // 对应 key value
    xhr.send(form);
}

// 加载聊天记录
function loadChatRecord(tId, this_id) {
    var menu_list = document.querySelectorAll('.left-menu ul li a');
    for (var i = 0; i < menu_list.length; i++) {
         menu_list[i].classList.remove('active');
    }
    var this_menu = document.querySelector('#' + this_id);
    this_menu.classList.add('active');
    targetId = tId;
    // 清空之前的聊天内容
    clearChat();
    beforeRenderingHTML([{'messageType': 'tipsWarning', html: language.loading}], chatboxClass);

    // 加载聊天记录
    ajax({"url": "/api/chat_records/" + tId,
         "method": "GET",
         "success": function(xmlHttp) {
            var data = JSON.parse(xmlHttp.responseText);
            if (data.status) {
                clearChat();  // 清空之前的聊天内容
                setBotMessage(language.theFile + this_menu.innerText + language.parsedFile);
                for (var i = 0; i < data.message.length; i++) {
                    let thisMessage = data.message[i];
                    htmls.push({'messageType': 'raw', 'position': 'right', 'html': thisMessage.message});
                    let response_data = JSON.parse(thisMessage.response_data);
                    setBotMessage(response_data.content);
                }
                beforeRenderingHTML(htmls, chatboxClass);
            } else {
                htmls.push({'messageType': 'tipsDanger', html: language.systemError + data.message});
                beforeRenderingHTML(htmls, chatboxClass);
            }
         }
    });
}

// 新建文档
function newDocument() {
    targetId = null;  // 清空之前的 targetId
    clearChat();  // 清空之前的聊天内容
    setBotMessage();  // 加载机器人消息
    // 样式更改
    var active_menu = document.querySelector('.left-menu ul li a.active');
    active_menu.classList.remove('active');
    var new_menu = document.querySelector('.left-menu ul li a.new');
    new_menu.classList.add('active');
}

// 加载左边菜单栏的内容
function loadMenu() {
    ajax({"url": "/api/menu_list",
         "success": function(xmlHttp) {
            var data = JSON.parse(xmlHttp.responseText);
            if (data.status) {
                var menuHtml = '<li><a class="new active" href="javascript:newDocument()">' + language.newDocument + '</a></li>';
                for (var i = 0; i < data.message.length; i++) {
                    var thisMenu = data.message[i];
                    menuHtml += '<li><a id="menu_' + thisMenu.id + '" href=\'javascript:loadChatRecord("' + thisMenu.target_id + '", "menu_' + thisMenu.id + '")\'>' + thisMenu.file_name + '</a></li>';
                }
                document.querySelector('.left-menu ul').innerHTML = menuHtml;
            } else {
                htmls.push({'messageType': 'tipsDanger', html: language.systemError + data.message});
                beforeRenderingHTML(htmls, chatboxClass);
            }
         },
    });
}

document.addEventListener("DOMContentLoaded", function() {
    setBotMessage();  // 加载机器人消息
    loadMenu();  // 加载左边菜单栏内容
    changeLanguage({  // 切换语言
        func: function() {
            document.getElementsByClassName("new")[0].innerHTML = language.newDocument;
        }
    });

    // 设置发送文件
    inputFile({
        enable: true,  // 允许发送文件
        enableDrop: true,  // 允许在输入框处拖拽发送文件
        accept: '.pdf',  // 允许上传的文件类型
        maxImageSize: 1024 * 1024 * 10, // 图片最大 10MB，超过了就要用文件发送，默认为 -1（无限制），可以不设置
        maxImageNumber: 20, // 输入框内最多同时存在 20 张图片，默认为 -1（无限制），可以不设置
        sendFileFunc: sendFile  // 负责发送文件的函数（回调函数），file 为传回的文件信息，与使用 <input> 标签获得的相同
    });
});
