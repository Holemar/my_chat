
const htmls = [];  // 对话内容
var chatboxClass = '.lite-chatbox';  // 聊天框选择器

// 机器人发消息
function setBotMessage(message) {
    let botMessage = {
         "messageType": 'raw',
         "headIcon": '/static/images/A.jpg',
         "name": 'Converter',
         "position": 'left',
         "html": `Please click the button below to upload the CSV file：<br/> <button class="file-btn" onclick="document.getElementById('fileBtn').click();">Upload File</button>`
    };
    if (message) {
        botMessage.html = message;
    }
    htmls.push(botMessage);
    beforeRenderingHTML(htmls, chatboxClass);
}

// 上传文件处理
function sendFile(file) {
    let xhr = new XMLHttpRequest();
    xhr.open('post', '/api/add_file', true);
    xhr.onload = function () {
        let data = JSON.parse(xhr.responseText);
        if (data.status) {
            let file_name = data.file_name;
            let url_path = data.message;
            let thisMessage = 'The file "' + file_name + '" has been converted.<br/>';
            thisMessage += ' Click the link below to download the converted file:<br/>';
            thisMessage += '<a href="' + url_path + '" target="_blank">"' + file_name + '"</a>';
            htmls.push({'messageType': 'raw', 'position': 'right', 'html': thisMessage});
            setBotMessage();  // 加载机器人消息
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
    setBotMessage();  // 加载机器人消息
    // 设置发送文件
    inputFile({
        enable: true,  // 允许发送文件
        enableDrop: true,  // 允许在输入框处拖拽发送文件
        accept: '.csv',  // 允许上传的文件类型
        maxImageSize: 1024 * 1024 * 10, // 图片最大 10MB，超过了就要用文件发送，默认为 -1（无限制），可以不设置
        maxImageNumber: 20, // 输入框内最多同时存在 20 张图片，默认为 -1（无限制），可以不设置
        sendFileFunc: sendFile  // 负责发送文件的函数（回调函数），file 为传回的文件信息，与使用 <input> 标签获得的相同
    });
});
