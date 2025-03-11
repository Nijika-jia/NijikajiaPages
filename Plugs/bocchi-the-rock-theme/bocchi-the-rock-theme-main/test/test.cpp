#include <iostream>
#include <vector>
#include <string>
#include <map>

// 这是一个测试注释
/* 这是多行注释
   用来测试注释的颜色 */

class TestClass {
private:
    std::string name;
    int age;
    std::vector<double> numbers;
    static const int MAX_SIZE = 100;

public:
    TestClass(const std::string& n, int a) : name(n), age(a) {}

    void printInfo() const {
        std::cout << "Name: " << name << std::endl;
        std::cout << "Age: " << age << std::endl;
    }

    template<typename T>
    void processData(const T& data) {
        if (data.empty()) {
            throw std::runtime_error("Empty data!");
        }
    }
};

int main() {
    std::string text = "这是一个字符串";
    const char* raw_string = R"(这是一个原始字符串
可以包含多行)";
    
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    std::map<std::string, int> scores;
    
    auto test = new TestClass("测试", 25);
    test->printInfo();
    
    for (const auto& num : numbers) {
        std::cout << num << " ";
    }
    
    delete test;
    return 0;
} 