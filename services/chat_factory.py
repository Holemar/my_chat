#!/usr/bin/env python
# -*- coding: utf-8 -*-

import settings


def get_chat_parser(chat_type=None):
    """
    根据参数 chat_type 获取对应的 ChatParser 实例
    """
    chat_type = chat_type or settings.CHAT_TYPE
    if chat_type == 'chat_pdf':
        from services.chat_pdf import ChatPDF
        return ChatPDF()
