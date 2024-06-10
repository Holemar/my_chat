#!python
# -*- coding:utf-8 -*-

import os
import datetime
import sqlite3
import threading


__all__ = ('set_db', 'get_db_conn', 'add_api_log', 'add_error_log', 'add_file_record', 'add_chat_record')

DB_CONN, DB_CURSOR = None, None  # 数据库连接,游标
G_MUTEX = threading.Lock()  # 全局线程锁(支持多线程用)
FILE_IDS = {}  # 文件ID映射表


def read_sql_file():
    """
    读取 sql 文件内容
    """
    current_dir, _ = os.path.split(os.path.abspath(__file__))  # 当前目录
    sql_file_path = os.path.join(current_dir, 'sqlite3.sql')  # 约定sql文件放在当前目录
    fb = open(sql_file_path, 'r')
    content = fb.read()
    fb.close()
    # 这里约定sql文件以分号;结尾
    return content.split(';')


def set_db(db_path):
    """设置存储数据库"""
    global DB_CONN, DB_CURSOR, G_MUTEX
    DB_CONN = {'db_path': db_path}
    DB_CURSOR = {}
    # 创建目标目录
    db_dir, db_file = os.path.split(os.path.abspath(db_path))
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)

    conn, cursor = get_db_conn()
    G_MUTEX.acquire()  # 线程锁
    sql_list = read_sql_file()
    for sql in sql_list:
        sql = sql.strip()
        if not sql:
            continue
        cursor.execute(sql)
    conn.commit()
    G_MUTEX.release()  # 释放线程锁


def get_db_conn():
    """获取sqlite3数据库连接"""
    global DB_CONN, DB_CURSOR, G_MUTEX
    if DB_CONN is None:
        raise RuntimeError('数据库未设置')
    G_MUTEX.acquire()  # 线程锁
    thread_id = threading.currentThread().ident
    if thread_id not in DB_CONN:
        DB_CONN[thread_id] = sqlite3.connect(DB_CONN['db_path'])
        DB_CURSOR[thread_id] = DB_CONN[thread_id].cursor()
    G_MUTEX.release()  # 释放线程锁
    return DB_CONN[thread_id], DB_CURSOR[thread_id]


def add_api_log(path_name, method, ip, status_code, request_len, response_len, use_times):
    """加api访问日志记录
    :param path_name: 访问路径(不包含域名部分)
    :param method: 访问方式
    :param ip: 访问IP
    :param status_code: 状态码
    :param request_len: 请求长度
    :param response_len: 响应长度
    :param use_times: 接口访问耗时
    :return: 是否新增,已存在则返回False，成功新增则返回True
    """
    conn, cursor = get_db_conn()
    G_MUTEX.acquire()  # 线程锁
    now = datetime.datetime.now()
    sql = "INSERT INTO api_log (path_name, method, ip, status_code, request_len, response_len, use_times, create_dt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    cursor.execute(sql, (path_name, method, ip, status_code, request_len, response_len, use_times, now))
    conn.commit()
    result = cursor.rowcount == 1
    G_MUTEX.release()  # 释放线程锁
    return result


def add_error_log(name, level, message, traceback=None):
    """加错误日志记录
    :param name: 日志名称
    :param level: 日志级别
    :param message: 日志信息
    :param traceback: 异常堆栈
    :return: 是否新增,已存在则返回False，成功新增则返回True
    """
    conn, cursor = get_db_conn()
    G_MUTEX.acquire()  # 线程锁
    now = datetime.datetime.now()
    sql = "INSERT INTO error_log (name, level, message, traceback, create_dt) VALUES (?, ?, ?, ?, ?)"
    cursor.execute(sql, (name, level, message, traceback, now))
    conn.commit()
    result = cursor.rowcount == 1
    G_MUTEX.release()  # 释放线程锁
    return result


def add_file_record(file_name, file_size, ip, user_id, target_id, status_code, response_data, use_times):
    """文件上传记录
    :param file_name: 文件名称
    :param file_size: 文件大小
    :param ip: 访问IP
    :param user_id: 用户ID
    :param target_id: 文件编码(chat对应的文件唯一标识)
    :param status_code: 响应状态码
    :param response_data: 响应值
    :param use_times: 接口访问耗时
    :return: 是否新增,已存在则返回False，成功新增则返回True
    """
    conn, cursor = get_db_conn()
    G_MUTEX.acquire()  # 线程锁
    now = datetime.datetime.now()
    sql = "INSERT INTO files (file_name, file_size, ip, user_id, target_id, status_code, response_data, use_times, create_dt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    cursor.execute(sql, (file_name, file_size, ip, user_id, target_id, status_code, response_data, use_times, now))
    conn.commit()
    result = cursor.rowcount == 1
    G_MUTEX.release()  # 释放线程锁
    return result


def add_chat_record(user_id, target_id, message, ip, status_code, response_data, use_times):
    """聊天记录
    :param user_id: 用户ID
    :param target_id: 聊天对象ID
    :param message: 聊天内容
    :param ip: 访问IP
    :param status_code: 响应状态码
    :param response_data: 响应值
    :param use_times: 接口访问耗时
    :return: 是否新增,已存在则返回False，成功新增则返回True
    """
    global FILE_IDS
    conn, cursor = get_db_conn()
    G_MUTEX.acquire()  # 线程锁
    file_id = FILE_IDS.get(target_id)
    if file_id is None:
        query_sql = "SELECT id FROM files WHERE target_id = ?"
        cursor.execute(query_sql, (target_id,))
        result = cursor.fetchone()
        FILE_IDS[target_id] = result[0] if result else None
    now = datetime.datetime.now()
    sql = "INSERT INTO chat_message (file_id, target_id, user_id, ip, message, status_code, response_data, use_times, create_dt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    cursor.execute(sql, (file_id, target_id, user_id, ip, message, status_code, response_data, use_times, now))
    conn.commit()
    result = cursor.rowcount == 1
    G_MUTEX.release()  # 释放线程锁
    return result

