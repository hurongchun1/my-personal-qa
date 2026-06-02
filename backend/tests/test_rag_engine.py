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


def test_rewritten_query_ask():
    """测试重写问题问答功能"""
    print("\n" + "=" * 50)
    print("测试 3: 重写问题问答")
    print("=" * 50)
    
    engine = RAGEngine()
    
    # 测试用例1：上下文依赖型问题
    test_cases = [
        {
            "query": "还有其他的吗？",
            "conversation_history": "用户：考核办法有哪些？\n助手：考核办法包括绩效考核、项目考核等。",
            "context_info": "公司考核制度文档",
            "description": "上下文依赖型"
        },
        {
            "query": "哪个更好？",
            "conversation_history": "用户：绩效考核和项目考核有什么区别？\n助手：绩效考核侧重个人表现，项目考核侧重项目成果。",
            "context_info": "考核制度对比文档",
            "description": "对比型"
        },
        {
            "query": "它的适用范围是什么？",
            "conversation_history": "用户：什么是绩效考核？\n助手：绩效考核是评估员工工作表现的制度。",
            "context_info": "绩效考核制度文档",
            "description": "模糊指代型"
        },
        {
            "query": "考核办法有哪些，以及如何申请？",
            "conversation_history": "",
            "context_info": "公司管理制度文档",
            "description": "多意图型"
        },
        {
            "query": "难道没有处罚措施吗？",
            "conversation_history": "用户：公司有什么奖励制度？\n助手：公司有绩效奖金、晋升机会等奖励。",
            "context_info": "公司奖惩制度文档",
            "description": "反问型"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n[INFO] 测试用例 {i}: {test_case['description']}")
        print(f"[INFO] 原始问题: {test_case['query']}")
        
        try:
            answer = engine.rewritten_query_ask(
                query=test_case['query'],
                conversation_history=test_case['conversation_history'],
                context_info=test_case['context_info'],
                k=3
            )
            
            if answer:
                print(f"[PASS] 重写问答成功!")
                print(f"[INFO] 答案: {answer[:100]}...")
            else:
                print(f"[FAIL] 返回空答案")
        except Exception as e:
            print(f"[FAIL] 重写问答失败: {e}")
    
    print("\n[INFO] 重写问题问答测试完成")


def run_all_tests():
    """运行所有测试"""
    print("[START] RAGEngine 集成测试")
    print("=" * 50)
    
    # 测试提示词模板
    test_prompt_template()
    
    # 测试简单问答
    test_simple_ask()
    
    # 测试重写问题问答
    test_rewritten_query_ask()
    
    print("\n" + "=" * 50)
    print("[PASS] 所有测试完成!")
    print("=" * 50)


if __name__ == "__main__":
    run_all_tests()
