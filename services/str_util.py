#!python
# -*- coding:utf-8 -*-

import re
import sys
import uuid
import html
import time
import datetime
import decimal
import base64


DECODE_CODING_LIST = ['utf-8', 'gbk', 'big5', 'gb18030']
ENCODE_CODING_LIST = ['big5', 'gb18030', 'utf-8']
default_code = sys.getdefaultencoding()
if default_code not in DECODE_CODING_LIST:
    DECODE_CODING_LIST.append(default_code)
if default_code not in ENCODE_CODING_LIST:
    ENCODE_CODING_LIST[-1:-1] = [default_code]


__all__ = ('to_unicode', 'to_utf8_str', 'encode2bytes', 'to_utf8_bytes', 'base64_decode', 'deep_str', 'remove_html_tag',
           'to_text', 'is_ip')


def to_unicode(content):
    if content is None:
        return None
    if isinstance(content, (bytes, bytearray)):
        try:
            return content.decode()
        # 特殊类型编码，尝试解码
        except UnicodeDecodeError as e:
            return to_utf8_str(content)
    return content


def to_utf8_str(content):
    """change str, bytes or bytearray to utf-8 str"""
    if content is None:
        return None
    if isinstance(content, (bytes, bytearray)):
        # unicode-escape
        if '\\u' in str(content):
            try:
                return content.decode('unicode-escape').encode().decode()
            except (UnicodeEncodeError, UnicodeDecodeError) as e:
                pass
        # try code list
        for encoding in DECODE_CODING_LIST:
            try:
                value = content.decode(encoding)
                if encoding == 'utf-8':
                    return value
                else:
                    return value.encode().decode()  # change to utf-8 string
            except (UnicodeEncodeError, UnicodeDecodeError) as e:
                pass
        # If that fails, ignore error messages
        return content.decode("utf-8", "ignore")
    elif isinstance(content, str):
        # unicode-escape
        try_s = [ord(a) for a in content if ord(a) <= 256]
        if len(try_s) == len(content):
            return bytes(try_s).decode("utf-8")
        # try code list
        for encoding in ENCODE_CODING_LIST:
            try:
                value = content.encode(encoding)
                return value.decode()
            except (UnicodeEncodeError, UnicodeDecodeError) as e:
                pass
        # If that fails, ignore error messages
        return content.encode('utf-8', 'ignore').decode()
    return content


def encode2bytes(content):
    """change str to bytes"""
    if content is None:
        return None
    if isinstance(content, str):
        try:
            return content.encode()
        # 特殊类型编码，尝试解码
        except UnicodeEncodeError as e:
            return to_utf8_bytes(content)
    return content


def to_utf8_bytes(content):
    """change str to utf-8 bytes"""
    if content is None:
        return None
    if isinstance(content, str):
        # unicode-escape
        try_s = [ord(a) for a in content if ord(a) <= 256]
        if len(try_s) == len(content):
            return bytes(try_s)
        # try code list
        for encoding in ENCODE_CODING_LIST:
            try:
                value = content.encode(encoding)
                if encoding == 'utf-8':
                    return value
                else:
                    return value.decode().encode()  # change to utf-8 bytes
            except (UnicodeEncodeError, UnicodeDecodeError) as e:
                pass
        # If that fails, ignore error messages
        content = content.encode('utf-8', 'ignore')
    return content


def base64_decode(s):
    """使用base64解码"""
    if isinstance(s, str):
        try:
            s = s.encode()
        # 特殊类型编码，尝试解码
        except UnicodeEncodeError as e:
            s = s.encode('utf-8', 'ignore')
    res = base64.b64decode(s)
    try:
        return res.decode()
    # 特殊类型编码，尝试解码
    except UnicodeDecodeError as e:
        return to_utf8_str(res)


def deep_str(value):
    """
    将 list,tuple,set,dict 等类型里面的字符转为 unicode 编码
    :param {任意} value: 将要被转码的值,类型可以是:dict,list,tuple,set 等类型
    :return {type(value)}: 返回原本的参数类型(list,tuple,set,dict等类型会保持不变)
    """
    if value is None:
        return ''
    # str/unicode 类型的
    elif isinstance(value, str):
        return to_unicode(value)
    # 考虑是否需要转成字符串的类型
    elif isinstance(value, (bool, int, float, complex)):
        return str(value)
    # time, datetime 类型转成字符串,需要写格式(不能使用 json.dumps,会报错)
    elif isinstance(value, time.struct_time):
        return time.strftime('%Y-%m-%d %H:%M:%S', value)
    elif isinstance(value, datetime.datetime):
        return value.strftime('%Y-%m-%d %H:%M:%S')
    elif isinstance(value, datetime.date):
        return value.strftime('%Y-%m-%d')
    elif isinstance(value, decimal.Decimal):
        return str(value)
    elif isinstance(value, uuid.UUID):
        return str(value).replace('-', '')
    # list,tuple,set 类型,递归转换
    elif isinstance(value, (list, tuple, set)):
        arr = [deep_str(item) for item in value]
        # 尽量不改变原类型
        if isinstance(value, list):  return arr
        if isinstance(value, tuple): return tuple(arr)
        if isinstance(value, set):   return set(arr)
    # dict 类型,递归转换(字典里面的 key 也会转成 unicode 编码)
    elif isinstance(value, dict):
        this_value = {}  # 不能改变原参数
        for key1, value1 in value.iteritems():
            # 字典里面的 key 也转成 unicode 编码
            key1 = deep_str(key1)
            this_value[key1] = deep_str(value1)
        return this_value
    else:
        return to_unicode(value)


def remove_html_tag(text):
    """
    清除HTML标签
    :return {string}:清除标签后的内容
    @example remove_html_tag("<div>haha</div>") 返回: "haha"
    """
    # 清除注释
    text = text.strip().replace("<!--.*?-->", "")
    # 样式 内容删除
    text = re.sub(re.compile('<\s*style[^>]*>[^<]*<\s*/\s*style\s*>', re.I), '', text)
    # java script 内容删除
    text = re.sub(re.compile('<\s*script[^>]*>[^<]*<\s*/\s*script\s*>', re.I), '', text)
    # 标题换行: </title> ==> 换行符
    text = re.sub(r'</[Tt][Ii][Tt][Ll][Ee]>', '\n', text)
    # tr换行: </tr> ==> 换行符
    text = re.sub(r'</[Tt][Rr]>', '\n', text)
    # <p> tr换行
    text = re.sub(r'</[p]>', '\n', text)
    # 转换字符串由 Html 页面上显示的编码变回正常编码
    text = to_text(text)
    # html標籤清除
    text = re.sub(r'<[^>]+>', '', text)
    return text.strip()


def to_text(sour):
    """
    转换字符串由 Html 页面上显示的编码变回正常编码(以上面的方法对应)
    :param sour: 需要转换的字符串
    :return {string}:转换后的字符串
    @example to_text("&nbsp;") 返回: " "
    """
    sour = html.unescape(sour)  # & 符号
    sour = re.sub(r'\n?<[Bb][Rr]\s*/?>\n?', '\r\n', sour)  # 转换换行符号
    return sour


def is_ip(ip):
    """
    检查ip地址是否正确
    :param {string} ip: 要检查的ip地址
    :return {bool}:  如果输入的是正确的ip地址则返回 True, 否则返回 False
    """
    if not ip or not isinstance(ip, (str, bytes)):
        return False
    return len([i for i in ip.split('.') if
                i.isdigit() and (0 <= int(i) <= 255) and (not i.startswith('0') or len(i) == 1)]) == 4
