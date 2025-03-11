package main

import (
    "context"
    "fmt"
    "log"
    "sync"
    "time"
)

// 接口定义
type DataProcessor interface {
    Process(ctx context.Context) (string, error)
}

// 结构体定义
type User struct {
    ID        int64
    Name      string
    Email     string
    CreatedAt time.Time
    Tags      []string
    mu        sync.RWMutex
}

// 方法实现
func (u *User) AddTag(tag string) {
    u.mu.Lock()
    defer u.mu.Unlock()
    u.Tags = append(u.Tags, tag)
}

// 泛型函数
func ProcessItems[T any](items []T, fn func(T) error) error {
    errs := make(chan error, len(items))
    var wg sync.WaitGroup

    for _, item := range items {
        wg.Add(1)
        go func(i T) {
            defer wg.Done()
            if err := fn(i); err != nil {
                errs <- err
            }
        }(item)
    }

    go func() {
        wg.Wait()
        close(errs)
    }()

    for err := range errs {
        if err != nil {
            return fmt.Errorf("处理错误: %w", err)
        }
    }

    return nil
}

// 错误处理
type CustomError struct {
    Code    int
    Message string
}

func (e *CustomError) Error() string {
    return fmt.Sprintf("错误 %d: %s", e.Code, e.Message)
}

func main() {
    ctx := context.Background()
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()

    user := &User{
        ID:        1,
        Name:      "测试用户",
        Email:     "test@example.com",
        CreatedAt: time.Now(),
    }

    // channel 使用
    ch := make(chan string, 10)
    go func() {
        defer close(ch)
        for i := 0; i < 5; i++ {
            select {
            case <-ctx.Done():
                return
            case ch <- fmt.Sprintf("消息 %d", i):
                time.Sleep(100 * time.Millisecond)
            }
        }
    }()

    // 接收消息
    for msg := range ch {
        log.Printf("收到: %s", msg)
    }
} 