use std::collections::{HashMap, HashSet};
use std::sync::{Arc, Mutex};
use tokio::time::{sleep, Duration};

// 结构体定义
#[derive(Debug, Clone)]
struct User {
    id: u64,
    name: String,
    email: Option<String>,
    tags: HashSet<String>,
}

// 特征定义
trait DataProcessor {
    async fn process(&self) -> Result<String, Box<dyn std::error::Error>>;
}

// 实现结构体
impl User {
    pub fn new(id: u64, name: &str) -> Self {
        User {
            id,
            name: name.to_string(),
            email: None,
            tags: HashSet::new(),
        }
    }

    pub fn add_tag(&mut self, tag: &str) -> bool {
        self.tags.insert(tag.to_string())
    }
}

// 异步函数
async fn process_data<T: DataProcessor + Send + Sync>(
    processor: Arc<T>,
    data: Vec<String>,
) -> Result<HashMap<String, String>, Box<dyn std::error::Error>> {
    let results = Arc::new(Mutex::new(HashMap::new()));
    let mut handles = vec![];

    for item in data {
        let processor = Arc::clone(&processor);
        let results = Arc::clone(&results);
        
        let handle = tokio::spawn(async move {
            match processor.process().await {
                Ok(result) => {
                    let mut map = results.lock().unwrap();
                    map.insert(item, result);
                }
                Err(e) => eprintln!("处理错误: {}", e),
            }
        });
        
        handles.push(handle);
    }

    for handle in handles {
        handle.await?;
    }

    Ok(Arc::try_unwrap(results)
        .unwrap()
        .into_inner()
        .unwrap())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut user = User::new(1, "测试用户");
    user.add_tag("rust");
    user.add_tag("async");

    println!("用户信息: {:?}", user);
    
    // 模式匹配
    match user.email {
        Some(ref email) => println!("邮箱: {}", email),
        None => println!("未设置邮箱"),
    }

    Ok(())
} 