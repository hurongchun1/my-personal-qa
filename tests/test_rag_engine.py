"""
RAGEngine 集成测试
测试检索问答功能
"""

import os
import sys

# 添加项目根目录到 Python 路径
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from rag_engine import RAGEngine


def test_prompt_template():
    """测试提示词模板生成"""
    print("=" * 50)
    print("测试 1: 提示词模板")
    print("=" * 50)
    
    engine = RAGEngine()
    
    query = "考核办法有哪些？"
    documents = "文档内容测试"
    
    prompt = engine._RAGEngine__prompt_template(query, documents)
    
    if query in prompt and documents in prompt:
        print("[PASS] 提示词模板生成正确")
        print(f"[INFO] 模板内容:\n{prompt}")
    else:
        print("[FAIL] 提示词模板生成失败")
    
    return prompt


def test_simple_ask():
    """测试简单问答功能"""
    print("\n" + "=" * 50)
    print("测试 2: 简单问答")
    print("=" * 50)
    
    engine = RAGEngine()
    
    query = "考核办法"
    print(f"[INFO] 测试问题: {query}")
    
    try:
        answer = engine.simple_ask(query, k=3)
        
        if answer:
            print(f"[PASS] 问答成功!")
            print(f"[INFO] 答案: {answer[:100]}...")
        else:
            print(f"[FAIL] 返回空答案")
    except Exception as e:
        print(f"[FAIL] 问答失败: {e}")


def run_all_tests():
    """运行所有测试"""
    print("[START] RAGEngine 集成测试")
    print("=" * 50)
    
    # 测试提示词模板
    test_prompt_template()
    
    # 测试简单问答
    test_simple_ask()
    
    print("\n" + "=" * 50)
    print("[PASS] 所有测试完成!")
    print("=" * 50)


if __name__ == "__main__":
    run_all_tests()
