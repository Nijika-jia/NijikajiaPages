<?php
declare(strict_types=1);

namespace App\Services;

use PDO;
use RuntimeException;
use App\Interfaces\UserRepositoryInterface;

/**
 * 用户服务类
 */
class UserService implements UserRepositoryInterface
{
    private PDO $db;
    private array $config;

    public function __construct(PDO $db, array $config = [])
    {
        $this->db = $db;
        $this->config = $config;
    }

    /**
     * 获取用户信息
     */
    public function getUserById(int $id): ?array
    {
        try {
            $stmt = $this->db->prepare('SELECT * FROM users WHERE id = :id');
            $stmt->execute(['id' => $id]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
        } catch (\PDOException $e) {
            throw new RuntimeException("数据库错误: {$e->getMessage()}");
        }
    }

    /**
     * 异步处理数据
     */
    public async function processData(array $data): Promise
    {
        $result = [];
        
        foreach ($data as $item) {
            try {
                $processed = await $this->asyncProcess($item);
                $result[] = $processed;
            } catch (\Exception $e) {
                error_log("处理错误: {$e->getMessage()}");
            }
        }
        
        return $result;
    }

    /**
     * 使用生成器
     */
    public function generateItems(int $count): Generator
    {
        for ($i = 0; $i < $count; $i++) {
            yield [
                'id' => $i,
                'name' => "Item {$i}",
                'created_at' => new \DateTime()
            ];
        }
    }
}

// 特性使用
trait Loggable
{
    private function log(string $message): void
    {
        error_log("[" . date('Y-m-d H:i:s') . "] {$message}");
    }
}

// 测试代码
$config = [
    'db' => [
        'host' => 'localhost',
        'name' => 'testdb',
        'user' => 'root'
    ]
];

$pdo = new PDO(
    "mysql:host={$config['db']['host']};dbname={$config['db']['name']}",
    $config['db']['user'],
    ''
);

$service = new UserService($pdo, $config);

try {
    $user = $service->getUserById(1);
    var_dump($user);
} catch (Exception $e) {
    echo "错误: " . $e->getMessage();
}
?> 