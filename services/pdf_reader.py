#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
读取 PDF 的内容
"""
import PyPDF2


def read_pdf(pdf_path):
    """
    读取 PDF 的内容
    :param pdf_path: PDF 文件路径
    :return: PDF 内容
    """
    pdf_file = open(pdf_path, 'rb')
    pdf_document = PyPDF2.PdfReader(pdf_file)
    num_pages = len(pdf_document.pages)
    contents = [pdf_document.pages[i].extract_text() for i in range(num_pages)]
    pdf_file.close()
    return ''.join(contents)


if __name__ == '__main__':
    print(read_pdf('/Users/holemar/Downloads/handbook.pdf'))







