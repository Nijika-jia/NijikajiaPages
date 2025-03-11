package com.example.test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Java文档注释
 * 测试多行注释效果
 */
public class TestClass<T extends Comparable<T>> {
    private String name;
    private int age;
    private List<T> items;
    private static final int MAX_SIZE = 100;

    // 构造函数
    public TestClass(String name, int age) {
        this.name = name;
        this.age = age;
        this.items = new ArrayList<>();
    }

    @Override
    public String toString() {
        return String.format("TestClass{name='%s', age=%d}", name, age);
    }

    public <R> Optional<R> processData(T data) throws Exception {
        if (data == null) {
            throw new IllegalArgumentException("数据不能为空");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("status", true);
        result.put("message", "处理成功");
        
        return Optional.of((R) result);
    }

    public static void main(String[] args) {
        TestClass<String> test = new TestClass<>("测试", 25);
        String text = """
                这是多行文本块
                用来测试新的Java特性
                """;
        
        try {
            test.processData("测试数据")
                .ifPresent(System.out::println);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
} 