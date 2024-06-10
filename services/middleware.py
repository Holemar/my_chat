#!/usr/bin/env python
# -*- coding: utf-8 -*-

import time
import json
from lib.bottle import request, response
from services.sqlite3_util import add_api_log


def get_ip():
    """
    获取请求过来的ip地址
    :return {string}: 发请求过来的IP地址
    """
    client_ip = request.environ.get('REMOTE_ADDR')
    if not client_ip:
        client_ip = request.environ.get("HTTP_X_REAL_IP")
    if not client_ip:
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR')
    return client_ip


def log_middleware(callback):
    """日志中间件"""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = callback(*args, **kwargs)
        if isinstance(result, (dict, list)):
            response.content_type = 'application/json'
            result = json.dumps(result, ensure_ascii=True)
        if isinstance(result, (int, float, bool)):
            result = str(result)
        end_time = time.time()
        response_len = len(result) if isinstance(result, str) else response.content_length
        add_api_log(request.path, request.method, get_ip(), response.status_code, request.content_length,
                    response_len, end_time - start_time)
        return result
    return wrapper


