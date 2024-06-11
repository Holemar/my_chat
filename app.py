#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
from lib.bottle import get, post, route, run, app, static_file, request
import settings
from services import sqlite3_util
from services.middleware import log_middleware
from services.chat_factory import get_chat_parser


@get('')
@get('/')
def index():
    """首页"""
    return static_file('/static/index.html', root=settings.BASE_PATH)


@get('/static/<filename:re:.+?>')
def static(filename):
    """加载静态文件"""
    return static_file('/static/' + filename, root=settings.BASE_PATH)


@post('/api/add_file')
def add_file():
    """上传PDF文件"""
    file = request.files.get('file')
    if not file:
        return {'status': False, 'message': '文件不存在'}
    file_name = file.raw_filename
    _, file_ext = os.path.splitext(file_name)
    if file_ext.lower() != '.pdf':
        return {'status': False, 'message': '文件格式不支持'}
    file_size = request.content_length
    file_io = file.file
    if settings.DEBUG:
        return {'status': True, 'message': 'src_IdBJejTPiabjomM3UT6bl', 'file_name': file_name}
    result, content = get_chat_parser().upload_pdf(file_name, file_size, file_io)
    return {'status': True, 'message': content, 'file_name': file_name}


@post('/api/chat_message')
def chat_message():
    """聊天"""
    target_id = request.query.targetId or request.forms.get('targetId')
    message = request.query.getunicode('message') or request.forms.getunicode('message')
    if not target_id or not message:
        return {'status': False, 'message': '参数错误'}
    if settings.DEBUG:
        return {'status': True, 'message': message}
    result, content = get_chat_parser().chat_message(target_id, message)
    return {'status': result, 'message': content}


if __name__ == '__main__':
    # 初始化数据库
    sqlite3_util.set_db(db_path=os.path.join(settings.DATA_DIR, 'data.db'))
    # 日志中间件
    app().install(log_middleware)
    # 启动服务
    run(host='0.0.0.0', port=settings.PORT, debug=settings.DEBUG)

