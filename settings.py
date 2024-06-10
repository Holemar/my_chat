#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""setting."""

import os
import os.path

env = os.environ.get('ENV') or 'develop'

DEBUG = os.environ.get('DEBUG', '').lower() in ('true', '1')

# 启动的端口号
PORT = int(os.getenv('PORT', '8080'))

CURRENT_DIR, _ = os.path.split(os.path.abspath(__file__))
BASE_PATH = CURRENT_DIR or os.getcwd()  # 当前目录，认为是项目源目录

# sqlite 数据文件目录
DATA_DIR = os.path.join(BASE_PATH, 'data')

# chat 相关
CHAT_TYPE = os.getenv('CHAT_TYPE', 'chat_pdf')
CHATPDF_API_KEY = os.getenv('CHATPDF_API_KEY', 'sec_vFKJJT4lt7wHhauaqEopNjQMuT8enzBu')

# 设置代理(交给环境变量)
# os.environ["http_proxy"] = "http://127.0.0.1:1087"
# os.environ["https_proxy"] = "http://127.0.0.1:1087"

