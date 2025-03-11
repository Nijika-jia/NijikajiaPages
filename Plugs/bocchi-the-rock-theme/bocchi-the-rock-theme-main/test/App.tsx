import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  BrowserRouter as Router,
  Route,
  Switch,
  Link
} from 'react-router-dom';

// 类型定义
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AppState {
  users: User[];
  loading: boolean;
  error: string | null;
}

// 样式组件
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 4px;
  background-color: ${props => 
    props.variant === 'primary' ? 'var(--primary-color)' : 'var(--secondary-color)'
  };
  color: white;
`;

// 函数组件
const App: React.FC = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state: AppState) => state);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 副作用
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        dispatch({ type: 'SET_USERS', payload: data });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    };

    fetchUsers();
  }, [dispatch]);

  // 事件处理
  const handleUserSelect = useCallback((user: User) => {
    setSelectedUser(user);
  }, []);

  // 条件渲染
  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>错误: {error}</div>;
  }

  return (
    <Router>
      <Container>
        <Header>
          <h1>用户管理</h1>
          <nav>
            <Link to="/">首页</Link>
            <Link to="/users">用户列表</Link>
            <Link to="/settings">设置</Link>
          </nav>
        </Header>

        <Switch>
          <Route exact path="/">
            <div>欢迎页面</div>
          </Route>
          
          <Route path="/users">
            <UserList
              users={users}
              selectedUser={selectedUser}
              onUserSelect={handleUserSelect}
            />
          </Route>
          
          <Route path="/settings">
            <Settings />
          </Route>
        </Switch>
      </Container>
    </Router>
  );
};

// 子组件
const UserList: React.FC<{
  users: User[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
}> = ({ users, selectedUser, onUserSelect }) => {
  return (
    <div>
      {users.map(user => (
        <div
          key={user.id}
          onClick={() => onUserSelect(user)}
          className={selectedUser?.id === user.id ? 'selected' : ''}
        >
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <span>{user.role}</span>
        </div>
      ))}
    </div>
  );
};

export default App; 