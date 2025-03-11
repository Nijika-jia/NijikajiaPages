from typing import List, Dict, Optional
import datetime
import json

# 这是一个测试注释
class TestClass:
    """这是文档字符串注释
    用于测试多行文档注释的显示效果
    """
    
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age
        self._private_var = "私有变量"
        
    def process_data(self, data: List[int]) -> Dict[str, any]:
        result = {
            "name": self.name,
            "processed": [x * 2 for x in data],
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        try:
            return json.dumps(result)
        except Exception as e:
            print(f"错误: {e}")
            return None

def main():
    # 测试变量定义
    test_string = "这是一个测试字符串"
    test_number = 42
    test_list = [1, 2, 3, 4, 5]
    test_dict = {
        "key1": "value1",
        "key2": "value2"
    }
    
    # 测试条件语句
    if test_number > 0:
        print("正数")
    elif test_number < 0:
        print("负数")
    else:
        print("零")
    
    # 测试循环
    for item in test_list:
        if isinstance(item, int):
            print(f"数字: {item}")
    
    # 测试类实例化
    test_instance = TestClass("测试名称", 25)
    result = test_instance.process_data([1, 2, 3])
    
if __name__ == "__main__":
    main() 