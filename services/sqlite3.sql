
-- api访问日志表
CREATE TABLE IF NOT EXISTS "api_log" (
    "id" integer primary key autoincrement NOT NULL,
    "path_name" varchar(128) NOT NULL, -- 访问路径(不包含域名部分)
    "method" varchar(10) NOT NULL DEFAULT 'GET', -- 访问方式
    "ip" varchar(20) NOT NULL, -- 访问IP
    "status_code" int NOT NULL, -- 响应状态码
    "request_len" int NOT NULL, -- 请求长度
    "response_len" int NOT NULL, -- 响应长度
    "use_times" REAL DEFAULT 0,  -- 接口访问耗时
    "create_dt" DATETIME NOT NULL -- 创建时间
);

-- 错误日志表
CREATE TABLE IF NOT EXISTS "error_log" (
    "id" integer primary key autoincrement NOT NULL,
    "name" varchar(30) NOT NULL, -- 日志名称
    "level" varchar(10) NOT NULL, -- 日志级别
    "message" varchar(255) NOT NULL, -- 日志信息
    "traceback" text DEFAULT NULL, -- 异常堆栈
    "create_dt" DATETIME NOT NULL -- 创建时间
);

-- 文件上传表
CREATE TABLE IF NOT EXISTS "files" (
    "id" integer primary key autoincrement NOT NULL,
    "file_name" varchar(30) NOT NULL, -- 文件名称
    "file_size" int NOT NULL, -- 文件大小
    "ip" varchar(20) NOT NULL, -- 访问IP
    "user_id" int DEFAULT NULL, -- 用户ID
    "target_id" varchar(32) DEFAULT NULL, -- 文件编码(chat对应的文件唯一标识)
    "status_code" int NOT NULL, -- 响应状态码
    "response_data" varchar(255) NOT NULL, -- 响应值
    "use_times" REAL DEFAULT 0,  -- 接口访问耗时
    "create_dt" DATETIME NOT NULL -- 创建时间
);

-- 聊天记录表
CREATE TABLE IF NOT EXISTS "chat_message" (
    "id" integer primary key autoincrement NOT NULL,
    "file_id" int DEFAULT NULL, -- 文件上传表的ID
    "target_id" varchar(32) DEFAULT NULL, -- 文件编码(chat对应的文件唯一标识)
    "user_id" int DEFAULT NULL, -- 用户ID(目前还没有用户表，后续扩展)
    "ip" varchar(20) NOT NULL, -- 访问IP
    "message" text DEFAULT NULL, -- 响应值
    "status_code" int NOT NULL, -- 响应状态码
    "response_data" text DEFAULT NULL, -- 响应值
    "use_times" REAL DEFAULT 0,  -- 接口访问耗时
    "create_dt" DATETIME NOT NULL -- 创建时间
);

-- 用户表
CREATE TABLE IF NOT EXISTS "user_info" (
    "id" integer primary key autoincrement NOT NULL,
    "username" varchar(30) NOT NULL, -- 用户名
    "password" varchar(32) NOT NULL, -- 密码
    "email" varchar(50) DEFAULT NULL, -- 邮箱
    "phone" varchar(13) DEFAULT NULL, -- 手机号
    "ip" varchar(20) NOT NULL, -- 注册IP
    "create_dt" DATETIME NOT NULL, -- 创建时间
    "update_dt" DATETIME NOT NULL -- 更新时间
);
