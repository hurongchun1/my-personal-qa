"""
文档管理器 - 负责管理文档和 chunk ID 的映射关系
使用 SQLite 保存文档元数据和 chunk IDs
"""
import sqlite3
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from pathlib import Path


class DocumentManager:
    """文档管理器，维护文档与 chunk ID 的映射关系"""
    
    def __init__(self, db_path: str = "documents.db"):
        """初始化文档管理器
        
        Args:
            db_path: SQLite 数据库文件路径
        """
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """初始化数据库表"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 创建文档表 - 包含完整的文档信息
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS documents (
                    -- 基本信息
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    file_path TEXT NOT NULL UNIQUE,
                    file_name TEXT NOT NULL,
                    file_type TEXT NOT NULL,
                    file_size INTEGER,  -- 文件大小（字节）
                    
                    -- 分块信息
                    chunk_ids TEXT NOT NULL,  -- JSON 数组存储 chunk IDs
                    chunk_count INTEGER NOT NULL,
                    chunk_method TEXT,  -- 分块方法: default, token, semantic
                    chunk_size INTEGER,  -- 分块大小
                    chunk_overlap INTEGER,  -- 分块重叠
                    
                    -- 向量化信息
                    embedding_model TEXT,  -- 使用的 embedding 模型
                    vector_store_type TEXT,  -- 向量存储类型: faiss, elasticsearch
                    
                    -- 处理状态
                    status TEXT DEFAULT 'pending',  -- pending, processing, completed, failed
                    indexed_at TIMESTAMP,  -- 索引完成时间
                    error_message TEXT,  -- 错误信息（如果失败）
                    
                    -- 业务元数据
                    title TEXT,  -- 文档标题
                    author TEXT,  -- 作者
                    category TEXT,  -- 分类
                    tags TEXT,  -- 标签（JSON 数组）
                    description TEXT,  -- 描述
                    
                    -- 时间戳
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 创建索引
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_file_path 
                ON documents(file_path)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_status 
                ON documents(status)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_category 
                ON documents(category)
            ''')
            
            conn.commit()
    
    def add_document(
        self, 
        file_path: str, 
        file_type: str, 
        chunk_ids: List[str],
        file_size: Optional[int] = None,
        chunk_method: Optional[str] = None,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
        embedding_model: Optional[str] = None,
        vector_store_type: Optional[str] = None,
        title: Optional[str] = None,
        author: Optional[str] = None,
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
        description: Optional[str] = None
    ) -> int:
        """添加文档记录
        
        Args:
            file_path: 文件路径
            file_type: 文件类型 (pdf, md, html 等)
            chunk_ids: 生成的 chunk ID 列表
            file_size: 文件大小（字节）
            chunk_method: 分块方法
            chunk_size: 分块大小
            chunk_overlap: 分块重叠
            embedding_model: 使用的 embedding 模型
            vector_store_type: 向量存储类型
            title: 文档标题
            author: 作者
            category: 分类
            tags: 标签列表
            description: 描述
            
        Returns:
            int: 文档 ID
        """
        file_name = Path(file_path).name
        chunk_ids_json = json.dumps(chunk_ids)
        tags_json = json.dumps(tags) if tags else None
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 检查是否已存在
            cursor.execute(
                "SELECT id FROM documents WHERE file_path = ?",
                (file_path,)
            )
            existing = cursor.fetchone()
            
            if existing:
                # 更新现有记录
                cursor.execute('''
                    UPDATE documents 
                    SET chunk_ids = ?, chunk_count = ?, file_size = ?, 
                        chunk_method = ?, chunk_size = ?, chunk_overlap = ?,
                        embedding_model = ?, vector_store_type = ?,
                        title = ?, author = ?, category = ?, tags = ?, description = ?,
                        status = 'completed', indexed_at = ?, updated_at = ?
                    WHERE file_path = ?
                ''', (
                    chunk_ids_json, len(chunk_ids), file_size,
                    chunk_method, chunk_size, chunk_overlap,
                    embedding_model, vector_store_type,
                    title, author, category, tags_json, description,
                    datetime.now(), datetime.now(), file_path
                ))
                return existing[0]
            else:
                # 插入新记录
                cursor.execute('''
                    INSERT INTO documents (
                        file_path, file_name, file_type, file_size,
                        chunk_ids, chunk_count, chunk_method, chunk_size, chunk_overlap,
                        embedding_model, vector_store_type,
                        title, author, category, tags, description,
                        status, indexed_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)
                ''', (
                    file_path, file_name, file_type, file_size,
                    chunk_ids_json, len(chunk_ids), chunk_method, chunk_size, chunk_overlap,
                    embedding_model, vector_store_type,
                    title, author, category, tags_json, description,
                    datetime.now()
                ))
                return cursor.lastrowid
    
    def get_chunk_ids(self, file_path: str) -> Optional[List[str]]:
        """获取文档的所有 chunk IDs
        
        Args:
            file_path: 文件路径
            
        Returns:
            List[str] or None: chunk ID 列表
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT chunk_ids FROM documents WHERE file_path = ?",
                (file_path,)
            )
            result = cursor.fetchone()
            
            if result:
                return json.loads(result[0])
            return None
    
    def get_document_info(self, file_path: str) -> Optional[Dict[str, Any]]:
        """获取文档完整信息
        
        Args:
            file_path: 文件路径
            
        Returns:
            dict or None: 文档信息
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM documents WHERE file_path = ?",
                (file_path,)
            )
            result = cursor.fetchone()
            
            if result:
                return dict(result)
            return None
    
    def get_all_documents(self) -> List[Dict[str, Any]]:
        """获取所有文档列表
        
        Returns:
            list: 文档信息列表
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM documents ORDER BY created_at DESC")
            results = cursor.fetchall()
            return [dict(row) for row in results]
    
    def delete_document(self, file_path: str) -> bool:
        """删除文档记录
        
        Args:
            file_path: 文件路径
            
        Returns:
            bool: 是否删除成功
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM documents WHERE file_path = ?",
                (file_path,)
            )
            return cursor.rowcount > 0
    
    def update_chunk_ids(self, file_path: str, new_chunk_ids: List[str]) -> bool:
        """更新文档的 chunk IDs
        
        Args:
            file_path: 文件路径
            new_chunk_ids: 新的 chunk ID 列表
            
        Returns:
            bool: 是否更新成功
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE documents 
                SET chunk_ids = ?, chunk_count = ?, updated_at = ?
                WHERE file_path = ?
            ''', (json.dumps(new_chunk_ids), len(new_chunk_ids), datetime.now(), file_path))
            return cursor.rowcount > 0