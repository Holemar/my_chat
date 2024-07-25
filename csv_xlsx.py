#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
a Web Application for CSV to XLSX Converter
https://www.upwork.com/jobs/~01027d1795064f4b2f?referrer_url_path=%2Fbest-matches%2Fdetails%2F~01027d1795064f4b2f
"""

import os
from lib.bottle import get, post, route, run, app, static_file, request
import settings
from services.excel_util import csv_to_excel


@get('')
@get('/')
def index():
    """首页"""
    return static_file('/static/csv.html', root=settings.BASE_PATH)


@get('/static/<filename:re:.+?>')
def static(filename):
    """加载静态文件"""
    return static_file('/static/' + filename, root=settings.BASE_PATH)


@post('/api/add_file')
def add_file():
    """上传csv文件"""
    file = request.files.get('file')
    if not file:
        return {'status': False, 'message': 'file does not exist'}
    file_name = file.raw_filename
    _, file_ext = os.path.splitext(file_name)
    if file_ext.lower() != '.csv':
        return {'status': False, 'message': 'The file format is not supported, only CSV is supported'}
    file_size = request.content_length
    file_io = file.file
    excel_file_name, url_path = csv_to_excel(file_name, file_io)
    return {'status': True, 'message': url_path, 'file_name': file_name, 'excel_file_name': excel_file_name}


if __name__ == '__main__':
    # 启动服务
    run(host='0.0.0.0', port=settings.PORT, debug=settings.DEBUG)

