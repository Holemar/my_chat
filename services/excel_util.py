#!python
# -*- coding:utf-8 -*-
import io
import os
import csv
import random
import datetime

import openpyxl
import settings


def to_open_file(file_io):
    """将网络传输的文件对象转换为本地文件对象"""
    file_data = file_io.read().decode('UTF-8')
    file_data = io.StringIO(file_data)
    return file_data


def csv_reader(file_data):
    """csv格式的文件读取"""
    reader = csv.reader(file_data)
    null_set = set([''])
    result = [row for row in reader if set(row) != null_set]
    return result


def write_excel(csv_data, excel_file_path):
    """生成Excel文件"""
    workbook = openpyxl.workbook.Workbook()
    worksheet = workbook.active
    for row in csv_data:
        worksheet.append(row)
    workbook.save(excel_file_path)


def csv_to_excel(csv_filename, csv_file_io):
    """csv文件转为excel文件"""
    file_data = to_open_file(csv_file_io)
    csv_data = csv_reader(file_data)
    excel_file_name = csv_filename.replace('.csv', '.xlsx')
    # 拼接网络访问路径
    url_path = os.path.join('static/data', datetime.datetime.now().strftime('%Y%m%d_%H%M%S'),
                            str(random.randint(1000, 9999)), excel_file_name)
    excel_file_path = os.path.join(settings.BASE_PATH, url_path)
    if not os.path.exists(os.path.dirname(excel_file_path)):
        os.makedirs(os.path.dirname(excel_file_path))
    # 生成Excel文件
    write_excel(csv_data, excel_file_path)
    return '/' + url_path

