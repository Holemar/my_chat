#!/bin/sh

ps aux|grep my_chat.py | grep -v grep|awk '{print$2}'|xargs kill -9
nohup python3 my_chat.py > output.log 2>&1 &
