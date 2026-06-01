"""
使用示例：展示如何结合文档管理器和向量存储
"""
from storage.faiss_storage import FaissStorage
from storage.document_manager import DocumentManager


def example_workflow():
    """完整的工作流示例"""
    
    # 1. 初始化组件
    vector_storage = FaissStorage()
    doc_manager = DocumentManager()
    
    # 2. 添加文档
    file_path = "documents/example.pdf"
    
    print(f"正在添加文档: {file_path}")
    
    # 添加到向量库，获取 chunk IDs
    vector_store, chunk_ids = vector_storage.add_chunks(
        file_type="pdf",
        method="default",
        source=file_path,
        chunk_size=512,
        chunk_overlap=50
    )
    
    print(f"生成了 {len(chunk_ids)} 个 chunk IDs")
    print(f"Chunk IDs: {chunk_ids[:3]}...")  # 只显示前3个
    
    # 3. 保存文档信息到文档管理器
    doc_id = doc_manager.add_document(
        file_path=file_path,
        file_type="pdf",
        chunk_ids=chunk_ids
    )
    
    print(f"文档已保存到数据库，文档 ID: {doc_id}")
    
    # 4. 搜索相似内容
    query = "什么是机器学习？"
    results = vector_storage.search(query, k=3)
    
    print(f"\n搜索 '{query}' 的结果:")
    for i, doc in enumerate(results, 1):
        print(f"{i}. {doc.page_content[:100]}...")
    
    # 5. 删除文档
    print(f"\n正在删除文档: {file_path}")
    
    # 从文档管理器获取 chunk IDs
    chunk_ids_to_delete = doc_manager.get_chunk_ids(file_path)
    
    if chunk_ids_to_delete:
        # 从向量库删除
        success = vector_storage.delete_chunks(chunk_ids_to_delete)
        print(f"从向量库删除: {'成功' if success else '失败'}")
        
        # 从文档管理器删除
        doc_manager.delete_document(file_path)
        print("从文档管理器删除: 成功")
    
    # 6. 更新文档
    print(f"\n正在更新文档: {file_path}")
    
    # 添加新版本
    new_vector_store, new_chunk_ids = vector_storage.add_chunks(
        file_type="pdf",
        method="default",
        source=file_path,
        chunk_size=1024,  # 新的分块大小
        chunk_overlap=100
    )
    
    # 更新文档管理器
    doc_manager.update_chunk_ids(file_path, new_chunk_ids)
    print(f"文档已更新，新的 chunk IDs: {new_chunk_ids[:3]}...")


def example_with_existing_chunks():
    """使用已知 chunk IDs 的示例"""
    
    vector_storage = FaissStorage()
    doc_manager = DocumentManager()
    
    # 假设你已经有了一些 chunk IDs（从数据库或其他来源）
    existing_chunk_ids = [
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "b2c3d4e5-f6a7-8901-bcde-f23456789012"
    ]
    
    # 添加新文档
    new_vector_store, new_chunk_ids = vector_storage.add_chunks(
        file_type="markdown",
        method="default",
        source="readme.md"
    )
    
    # 合并旧的和新的 chunk IDs
    all_chunk_ids = existing_chunk_ids + new_chunk_ids
    
    # 更新文档管理器
    doc_manager.add_document(
        file_path="readme.md",
        file_type="markdown",
        chunk_ids=all_chunk_ids
    )
    
    print(f"文档总共有 {len(all_chunk_ids)} 个 chunks")


if __name__ == "__main__":
    print("=" * 60)
    print("完整工作流示例")
    print("=" * 60)
    example_workflow()
    
    print("\n" + "=" * 60)
    print("使用已知 chunk IDs 示例")
    print("=" * 60)
    example_with_existing_chunks()