#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
请求 chatPDF.com 的 API 实现 PDF 文档的自动化聊天功能
"""
import time
import requests
import settings
from services.sqlite3_util import add_error_log, add_file_record, add_chat_record
from services.middleware import get_ip


class ChatPDF:
    HEADER = {'x-api-key': settings.CHATPDF_API_KEY}

    def __init__(self):
        pass

    def upload_pdf(self, file_name, file_size, file_io):
        """
        上传 PDF 文件到 chatPDF.com
        :param file_name: 文件名
        :param file_size: 文件大小
        :param file_io: 文件对象
        :return: 成功返回 (True, sourceId)。 失败返回 (False, 错误信息)
        """
        files = [
            # ('file', ('file', open(file_path, 'rb'), 'application/octet-stream'))
            ('file', (file_name, file_io, 'application/octet-stream'))
        ]
        start_time = time.time()
        response = requests.post('https://api.chatpdf.com/v1/sources/add-file', headers=self.HEADER, files=files)
        use_time = time.time() - start_time
        if response.status_code == 200:
            data = response.json()
            source_id = data.get('sourceId')
            if source_id:
                add_file_record(file_name, file_size, get_ip(), None, source_id,
                                response.status_code, response.text, use_time)
                return True, source_id
        add_file_record(file_name, file_size, get_ip(), None, None, response.status_code, response.text, use_time)
        add_error_log(f'Upload PDF failed', 'ERROR', f"status_code: {response.status_code}, text: {response.text}")
        return False, response.text

    def chat_message(self, source_id, message):
        """ 发送聊天消息
        :param source_id: 对应文件的 sourceId
        :param message: 聊天消息
        :return: 成功返回 (True, 聊天内容)。 失败返回 (False, 错误信息)
        """
        data = {
           'sourceId': source_id,
           'messages': [{'role': "user", 'content': message}]
        }
        start_time = time.time()
        response = requests.post('https://api.chatpdf.com/v1/chats/message', headers=self.HEADER, json=data)
        use_time = time.time() - start_time
        add_chat_record(None, source_id, message, get_ip(), response.status_code, response.text, use_time)
        if response.status_code == 200:
            data = response.json()
            content = data.get('content')
            if content:
                return True, content
        add_error_log(f'Chat PDF failed', 'ERROR', f"status_code: {response.status_code}, text: {response.text}")
        return False, response.text


if __name__ == '__main__':
    chat = ChatPDF()
    # _id = chat.upload_pdf('/Users/holemar/Downloads/handbook.pdf')
    _id = 'src_Z9PGWa7XlRZHdVgElTV5X'
    # print(_id)
    print(chat.chat_message(_id, 'Give me a summary of chapter 7.'))
    # print(chat.chat_message(_id, 'Give me a summary of chapter 7: Designing the Document'))
    # print(chat.chat_message(_id, 'How many kinds of typefaces are mentioned in this document'))
    # print(chat.chat_message(_id, 'How many kinds of typefaces are mentioned in chapter 7 Designing the Document'))







