"""
完整示例：展示文档管理器的完整功能
"""
from storage.faiss_storage import FaissStorage
from storage.document_manager import DocumentManager


def example_with_full_metadata():
    """使用完整元数据的示例"""
    
    # 初始化组件
    vector_storage = FaissStorage()
    doc_manager = DocumentManager()
    
    # 添加文档 - 使用完整元数据
    file_path = "documents/technical_report.pdf"
    
    print(f"正在添加文档: {file_path}")
    
    # 1. 添加到向量库
    vector_store, chunk_ids = vector_storage.add_chunks(
        file_type="pdf",
        method="token",  # 使用 token 分块方法
        source=file_path,
        chunk_size=1024,
        chunk_overlap=100
    )
    
    print(f"生成了 {len(chunk_ids)} 个 chunks")
    
    # 2. 保存完整的文档信息
    doc_id = doc_manager.add_document(
        file_path=file_path,
        file_type="pdf",
        chunk_ids=chunk_ids,
        
        # 文件信息
        file_size=1024000,  # 1MB
        
        # 分块信息
        chunk_method="token",
        chunk_size=1024,
        chunk_overlap=100,
        
        # 向量化信息
        embedding_model="dashscope",
        vector_store_type="faiss",
        
        # 业务元数据
        title="技术报告：AI 应用现状",
        author="张三",
        category="技术文档",
        tags=["AI", "机器学习", "深度学习"],
        description="关于人工智能技术应用现状的详细分析报告"
    )
    
    print(f"文档已保存到数据库，文档 ID: {doc_id}")
    
    # 3. 获取文档完整信息
    doc_info = doc_manager.get_document_info(file_path)
    print("\n文档信息:")
    print(f"  标题: {doc_info['title']}")
    print(f"  作者: {doc_info['author']}")
    print(f"  分类: {doc_info['category']}")
    print(f"  标签: {doc_info['tags']}")
    print(f"  状态: {doc_info['status']}")
    print(f"  索引时间: {doc_info['indexed_at']}")
    print(f"  Chunk 数量: {doc_info['chunk_count']}")
    print(f"  分块方法: {doc_info['chunk_method']}")
    print(f"  Embedding 模型: {doc_info['embedding_model']}")


def example_search_by_category():
    """按分类搜索文档的示例"""
    
    doc_manager = DocumentManager()
    
    # 获取所有文档
    all_docs = doc_manager.get_all_documents()
    
    print(f"\n总共有 {len(all_docs)} 个文档")
    
    # 按分类统计
    categories = {}
    for doc in all_docs:
        cat = doc['category'] or '未分类'
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\n按分类统计:")
    for cat, count in categories.items():
        print(f"  {cat}: {count} 个文档")


def example_update_document():
    """更新文档的示例"""
    
    vector_storage = FaissStorage()
    doc_manager = DocumentManager()
    
    file_path = "documents/technical_report.pdf"
    
    # 获取现有文档信息
    existing_doc = doc_manager.get_document_info(file_path)
    
    if existing_doc:
        print(f"\n更新文档: {file_path}")
        
        # 获取旧的 chunk IDs
        old_chunk_ids = existing_doc['chunk_ids']
        
        # 从向量库删除旧 chunks
        vector_storage.delete_chunks(old_chunk_ids)
        
        # 使用新的分块方法重新处理
        new_vector_store, new_chunk_ids = vector_storage.add_chunks(
            file_type="pdf",
            method="semantic",  # 改用语义分块
            source=file_path
        )
        
        # 更新文档信息
        doc_manager.update_document(
            file_path=file_path,
            chunk_ids=new_chunk_ids,
            chunk_method="semantic",
            title="技术报告：AI 应用现状（更新版）",
            tags=["AI", "机器学习", "深度学习", "最新进展"]
        )
        
        print("文档已更新")


def example_bulk_operations():
    """批量操作示例"""
    
    doc_manager = DocumentManager()
    
    # 批量添加多个文档
    documents = [
        {
            "file_path": "docs/readme.md",
            "file_type": "markdown",
            "title": "项目说明",
            "category": "文档",
            "tags": ["readme", "说明"]
        },
        {
            "file_path": "docs/api.md",
            "file_type": "markdown",
            "title": "API 文档",
            "category": "技术文档",
            "tags": ["api", "接口"]
        },
        {
            "file_path": "docs/tutorial.pdf",
            "file_type": "pdf",
            "title": "使用教程",
            "category": "教程",
            "tags": ["tutorial", "教程"]
        }
    ]
    
    vector_storage = FaissStorage()
    
    for doc_info in documents:
        # 添加到向量库
        vector_store, chunk_ids = vector_storage.add_chunks(
            file_type=doc_info["file_type"],
            method="default",
            source=doc_info["file_path"]
        )
        
        # 添加到文档管理器
        doc_manager.add_document(
            file_path=doc_info["file_path"],
            file_type=doc_info["file_type"],
            chunk_ids=chunk_ids,
            title=doc_info["title"],
            category=doc_info["category"],
            tags=doc_info["tags"]
        )
        
        print(f"已添加: {doc_info['title']}")


if __name__ == "__main__":
    print("=" * 70)
    print("完整元数据示例")
    print("=" * 70)
    example_with_full_metadata()
    
    print("\n" + "=" * 70)
    print("按分类搜索示例")
    print("=" * 70)
    example_search_by_category()
    
    print("\n" + "=" * 70)
    print("批量操作示例")
    print("=" * 70)
    example_bulk_operations()