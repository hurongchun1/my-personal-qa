"""
FaissStorage 集成测试
测试添加、删除、更新等核心功能
"""

import os
import sys
import shutil

# 添加项目根目录到 Python 路径
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from storage.faiss_storage import FaissStorage
from config import FAISS_PATH


def test_add_chunks():
    """测试添加分块功能"""
    print("=" * 50)
    print("测试 1: 添加分块")
    print("=" * 50)
    
    # 创建存储实例
    storage = FaissStorage()
    
    # 测试添加 PDF 文档
    pdf_path = os.path.join(PROJECT_ROOT, "doc", "浦发上海浦东发展银行西安分行个金客户经理考核办法.pdf")
    
    if not os.path.exists(pdf_path):
        print(f"[FAIL] 测试文件不存在: {pdf_path}")
        return None, None
    
    print(f"[INFO] 测试文件: {pdf_path}")
    
    # 添加文档
    result, ids = storage.add_chunks("pdf", "default", pdf_path)
    
    if result is not None:
        print(f"[PASS] 添加成功!")
        print(f"   - 生成 ID 数量: {len(ids)}")
        print(f"   - 前3个 ID: {ids[:3]}")
        print(f"   - 向量库实例: {type(result).__name__}")
    else:
        print(f"[FAIL] 添加失败!")
    
    return result, ids


def test_delete_chunks(ids):
    """测试删除分块功能"""
    print("\n" + "=" * 50)
    print("测试 2: 删除分块")
    print("=" * 50)
    
    if not ids:
        print("[FAIL] 没有可删除的 ID")
        return False
    
    storage = FaissStorage()
    
    # 删除前几个 ID
    ids_to_delete = ids[:2]
    print(f"[INFO] 要删除的 ID: {ids_to_delete}")
    
    result = storage.delete_chunks(ids_to_delete)
    
    if result:
        print(f"[PASS] 删除成功!")
    else:
        print(f"[FAIL] 删除失败!")
    
    return result


def test_update_chunks(ids):
    """测试更新分块功能"""
    print("\n" + "=" * 50)
    print("测试 3: 更新分块")
    print("=" * 50)
    
    if not ids or len(ids) < 3:
        print("[FAIL] 没有可更新的 ID")
        return False
    
    storage = FaissStorage()
    
    # 更新一个 ID
    ids_to_update = [ids[2]]
    new_texts = ["这是更新后的测试内容"]
    
    print(f"[INFO] 要更新的 ID: {ids_to_update}")
    print(f"[INFO] 新内容: {new_texts}")
    
    result = storage.update_chunks(ids_to_update, new_texts, None)
    
    if result:
        print(f"[PASS] 更新成功!")
    else:
        print(f"[FAIL] 更新失败!")
    
    return result


def test_search():
    """测试搜索功能（如果实现了）"""
    print("\n" + "=" * 50)
    print("测试 4: 搜索功能")
    print("=" * 50)
    
    storage = FaissStorage()
    
    # 检查是否有 search 方法
    if not hasattr(storage, 'search'):
        print("[WARN] search 方法未实现，跳过测试")
        return None
    
    # 测试搜索
    query = "考核"
    print(f"[INFO] 搜索查询: {query}")
    
    try:
        results = storage.search(query, k=3)
        print(f"[PASS] 搜索成功!")
        print(f"   - 返回结果数量: {len(results)}")
        for i, doc in enumerate(results[:3]):
            print(f"   - 结果 {i+1}: {doc.page_content[:50]}...")
    except Exception as e:
        print(f"[FAIL] 搜索失败: {e}")
        results = None
    
    return results


def cleanup():
    """清理测试数据"""
    print("\n" + "=" * 50)
    print("清理测试数据")
    print("=" * 50)
    
    if os.path.exists(FAISS_PATH):
        try:
            shutil.rmtree(FAISS_PATH)
            print(f"[PASS] 已删除测试数据目录: {FAISS_PATH}")
        except Exception as e:
            print(f"[FAIL] 删除失败: {e}")
    else:
        print(f"[INFO] 测试数据目录不存在: {FAISS_PATH}")


def run_all_tests():
    """运行所有测试"""
    print("[START] FaissStorage 集成测试")
    print("=" * 50)
    
    # 清理旧数据
    cleanup()
    
    # 测试添加
    result, ids = test_add_chunks()
    
    if result is None:
        print("\n[FAIL] 添加测试失败，终止后续测试")
        return
    
    # 测试删除
    test_delete_chunks(ids)
    
    # 测试更新
    test_update_chunks(ids)
    
    # 测试搜索
    test_search()
    
    print("\n" + "=" * 50)
    print("[PASS] 所有测试完成!")
    print("=" * 50)


if __name__ == "__main__":
    run_all_tests()