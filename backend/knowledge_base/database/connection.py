# 数据库连接方式

from sqlite3 import Connection
import os
import sqlite3

from ...common.config import DATABASE_PATH, DATABASE_DIR, SQL_PATH


def get_connection():
    '''获取数据库连接'''
    # 确保数据库目录存在
    os.makedirs(DATABASE_DIR, exist_ok=True)
    
    conn: Connection = sqlite3.connect(DATABASE_PATH) # 创建数据库连接，如果不存在则创建
    conn.row_factory = sqlite3.Row # 设置行工厂，便于查询结果可以通过列名访问
    return conn

def close_connection(conn: Connection):
    '''关闭数据库'''
    if conn:
        conn.close()

def init_db():
    '''执行 ddl.sql中的SQL语句，创建表'''
    # 检查SQL文件是否存在
    if not os.path.exists(SQL_PATH):
        print(f"警告：DDL文件不存在：{SQL_PATH}")
        return
    
    # 读取SQL文件内容
    with open(SQL_PATH,"r",encoding="utf-8") as f:
        ddl_sql = f.read()

    # 获取数据库连接
    conn = get_connection()
    
    try:
        # 创建游标并执行SQL
        cursor = conn.cursor()
        cursor.executescript(ddl_sql)

        # 提交事务
        conn.commit()
        print("数据库初始化成功")
    except Exception as e:

        # 告诉数据库初始化失败
        print(f"数据库表初始化失败：{e}")
        conn.rollback()
        raise

    finally:
        close_connection(conn)
