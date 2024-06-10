#!/bin/sh

ps aux|grep app.py | grep -v grep|awk '{print$2}'|xargs kill -9
nohup python3 app.py > output.log 2>&1 &
