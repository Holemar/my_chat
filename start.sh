#!/bin/sh

ps aux|grep my_chat.py | grep -v grep|awk '{print$2}'|xargs kill -9
nohup python3 my_chat.py > output.log 2>&1 &

# export PORT=18080
# ps aux|grep csv_xlsx.py | grep -v grep|awk '{print$2}'|xargs kill -9
# nohup python3 csv_xlsx.py > output.log 2>&1 &

