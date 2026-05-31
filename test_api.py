"""
API 测试脚本
测试 RAG 问答系统 API 的各个端点
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"


def test_health_check():
    """测试健康检查接口"""
    print("=" * 50)
    print("测试 1: 健康检查")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"[PASS] 健康检查成功: {data}")
            return True
        else:
            print(f"[FAIL] 健康检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"[FAIL] 健康检查异常: {e}")
        return False


def test_simple_ask():
    """测试简单问答接口"""
    print("\n" + "=" * 50)
    print("测试 2: 简单问答")
    print("=" * 50)
    
    payload = {
        "query": "考核办法有哪些？",
        "k": 3
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ask",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"[PASS] 简单问答成功")
            print(f"[INFO] 问题: {data.get('query')}")
            print(f"[INFO] 答案: {data.get('answer')[:100]}...")
            return True
        else:
            print(f"[FAIL] 简单问答失败: {response.status_code}")
            print(f"[INFO] 错误: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] 简单问答异常: {e}")
        return False


def test_rewritten_ask():
    """测试重写问答接口"""
    print("\n" + "=" * 50)
    print("测试 3: 重写问答")
    print("=" * 50)
    
    payload = {
        "query": "还有其他的吗？",
        "conversation_history": "用户：考核办法有哪些？\n助手：考核办法包括绩效考核、项目考核等。",
        "context_info": "公司考核制度文档",
        "k": 3
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/rewrite-ask",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"[PASS] 重写问答成功")
            print(f"[INFO] 原始问题: {data.get('query')}")
            print(f"[INFO] 重写问题: {data.get('rewritten_query')}")
            print(f"[INFO] 答案: {data.get('answer')[:100]}...")
            return True
        else:
            print(f"[FAIL] 重写问答失败: {response.status_code}")
            print(f"[INFO] 错误: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] 重写问答异常: {e}")
        return False


def test_classify():
    """测试问题分类接口"""
    print("\n" + "=" * 50)
    print("测试 4: 问题分类")
    print("=" * 50)
    
    payload = {
        "query": "哪个更好？",
        "conversation_history": "用户：绩效考核和项目考核有什么区别？\n助手：绩效考核侧重个人表现，项目考核侧重项目成果。",
        "context_info": "考核制度对比文档"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/classify",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"[PASS] 问题分类成功")
            print(f"[INFO] 原始问题: {data.get('original_query')}")
            print(f"[INFO] 分类结果: {data.get('classification')}")
            return True
        else:
            print(f"[FAIL] 问题分类失败: {response.status_code}")
            print(f"[INFO] 错误: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] 问题分类异常: {e}")
        return False


def run_all_tests():
    """运行所有测试"""
    print("[START] RAG API 测试")
    print("=" * 50)
    
    # 等待服务器启动
    print("[INFO] 等待服务器启动...")
    time.sleep(2)
    
    tests = [
        test_health_check,
        test_simple_ask,
        test_rewritten_ask,
        test_classify
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"[FAIL] 测试异常: {e}")
            failed += 1
    
    print("\n" + "=" * 50)
    print(f"[RESULT] 测试结果: {passed} 通过, {failed} 失败")
    print("=" * 50)
    
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)