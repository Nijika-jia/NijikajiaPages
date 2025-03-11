import { Observable, Subject } from 'rxjs';
import { map, filter, takeUntil } from 'rxjs/operators';

// 接口定义
interface TestInterface {
    name: string;
    age: number;
    data?: any[];
}

// 类型定义
type ResultType<T> = {
    success: boolean;
    data: T;
    message?: string;
};

// 装饰器
function log(target: any, key: string, descriptor: PropertyDescriptor) {
    console.log(`调用方法: ${key}`);
    return descriptor;
}

// 测试类
class TestClass implements TestInterface {
    private readonly destroy$ = new Subject<void>();
    
    constructor(
        public name: string,
        public age: number,
        private config: Map<string, unknown>
    ) {}

    @log
    async processData<T>(input: T): Promise<ResultType<T>> {
        const result: ResultType<T> = {
            success: true,
            data: input,
            message: '处理成功'
        };

        try {
            // 模板字符串测试
            const message = `处理 ${this.name} 的数据`;
            console.log(message);

            // Observable 测试
            new Observable<number>(observer => {
                observer.next(1);
                observer.complete();
            }).pipe(
                map(x => x * 2),
                filter(x => x > 0),
                takeUntil(this.destroy$)
            ).subscribe(console.log);

            return result;
        } catch (error) {
            console.error(`错误: ${error}`);
            throw error;
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
} 