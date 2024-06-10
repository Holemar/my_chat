# my-chat-pdf
  为了完成[简约思维面试题](https://simplylab.notion.site/pre-interview-7112af7b399149d995f97aee0d4696ee#d0695acb62fc4403afebac61f2f4be7e)  
  推荐运行版本: python3.7

## 启动程序
```bash
python3 app.py
```

## 默认登录
    地址: http://0.0.0.0:8080/

## 环境变量配置
    PORT: 程序启动端口号，默认8080

## 依赖
- wsgi: bottle (因为够简洁，相对于Django、fast_api等框架)  
- 数据库: sqlite3  (因为够轻量，但也因此没有使用ORM)
- 前端: 使用 [LiteWebChat_Frame](https://github.com/MorFansLab/LiteWebChat_Frame)

