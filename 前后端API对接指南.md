# 前后端API对接指南

## 🎯 对接概述

作为后端开发者，你需要为前端提供清晰的API接口文档和规范，确保前后端能够顺利协作。

## 📋 1. API基础信息

### 1.1 服务器信息
- **后端服务地址**: `http://localhost:8080`
- **API前缀**: `/dev-api` (开发环境)
- **数据格式**: JSON
- **字符编码**: UTF-8

### 1.2 统一响应格式
所有API接口都遵循统一的响应格式：

```json
{
    "code": 200,           // 状态码：200成功，其他为错误
    "message": "操作成功",  // 响应消息
    "data": {},           // 实际数据，可以是对象、数组或null
    "timestamp": 1234567890 // 时间戳
}
```

### 1.3 状态码说明
- `200`: 操作成功
- `106`: 用户未授权
- `2`: 系统内部错误
- `400`: 请求参数错误
- `401`: 认证失败
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 🔐 2. 认证机制

### 2.1 JWT Token认证
系统使用JWT Token进行用户认证：

1. **获取Token**: 通过登录接口获取
2. **使用Token**: 在请求头中携带
3. **Token格式**: `Authorization: Bearer <token>`

### 2.2 认证流程示例

#### 步骤1: 获取验证码
```bash
GET /captchaImage
```

响应：
```json
{
    "code": 200,
    "data": {
        "uuid": "验证码UUID",
        "img": "base64编码的验证码图片"
    }
}
```

#### 步骤2: 用户登录
```bash
POST /login
Content-Type: application/json

{
    "username": "admin",
    "password": "admin123",
    "code": "验证码",
    "uuid": "验证码UUID"
}
```

响应：
```json
{
    "code": 200,
    "data": {
        "access_token": "eyJhbGciOiJIUzUxMiJ9...",
        "expires_in": 720
    }
}
```

#### 步骤3: 携带Token访问接口
```bash
GET /system/users
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

## 📚 3. 核心API接口

### 3.1 用户管理接口

#### 获取用户列表
```bash
GET /system/users?pageNum=1&pageSize=10&userName=admin
Authorization: Bearer <token>
```

响应：
```json
{
    "code": 200,
    "data": {
        "records": [
            {
                "userId": 1,
                "userName": "admin",
                "nickName": "管理员",
                "email": "admin@example.com",
                "status": "1",
                "createTime": "2023-01-01 00:00:00"
            }
        ],
        "total": 1,
        "pageNum": 1,
        "pageSize": 10
    }
}
```

#### 新增用户
```bash
POST /system/users
Authorization: Bearer <token>
Content-Type: application/json

{
    "userName": "testuser",
    "nickName": "测试用户",
    "email": "test@example.com",
    "password": "123456",
    "status": "1",
    "roleIds": [2]
}
```

#### 更新用户
```bash
PUT /system/users
Authorization: Bearer <token>
Content-Type: application/json

{
    "userId": 1,
    "userName": "admin",
    "nickName": "超级管理员",
    "email": "admin@example.com",
    "status": "1"
}
```

#### 删除用户
```bash
DELETE /system/users/1,2,3
Authorization: Bearer <token>
```

### 3.2 角色管理接口

#### 获取角色列表
```bash
GET /system/role/list?pageNum=1&pageSize=10
Authorization: Bearer <token>
```

#### 新增角色
```bash
POST /system/role
Authorization: Bearer <token>
Content-Type: application/json

{
    "roleName": "测试角色",
    "roleKey": "test",
    "roleSort": 3,
    "status": "1",
    "menuIds": [1, 2, 3]
}
```

### 3.3 菜单管理接口

#### 获取菜单树
```bash
GET /system/menus
Authorization: Bearer <token>
```

#### 获取用户菜单路由
```bash
GET /getRouters
Authorization: Bearer <token>
```

### 3.4 部门管理接口

#### 获取部门树
```bash
GET /system/depts
Authorization: Bearer <token>
```

#### 获取部门下拉树
```bash
GET /system/depts/dropdown
Authorization: Bearer <token>
```

## 🛠️ 4. 前端对接步骤

### 4.1 环境配置
前端需要配置API基础地址：

```javascript
// 开发环境
const API_BASE_URL = 'http://localhost:8080/dev-api'

// 生产环境
const API_BASE_URL = 'https://your-domain.com/api'
```

### 4.2 HTTP请求拦截器
建议前端配置请求和响应拦截器：

```javascript
// 请求拦截器
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

// 响应拦截器
axios.interceptors.response.use(
    response => {
        const { code, message, data } = response.data
        if (code === 200) {
            return data
        } else {
            // 处理业务错误
            console.error(message)
            return Promise.reject(new Error(message))
        }
    },
    error => {
        // 处理HTTP错误
        if (error.response?.status === 401) {
            // 跳转到登录页
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)
```

### 4.3 API封装示例

```javascript
// 用户相关API
export const userAPI = {
    // 获取用户列表
    getUserList: (params) => {
        return axios.get('/system/users', { params })
    },
    
    // 新增用户
    addUser: (data) => {
        return axios.post('/system/users', data)
    },
    
    // 更新用户
    updateUser: (data) => {
        return axios.put('/system/users', data)
    },
    
    // 删除用户
    deleteUser: (userIds) => {
        return axios.delete(`/system/users/${userIds}`)
    }
}

// 认证相关API
export const authAPI = {
    // 获取验证码
    getCaptcha: () => {
        return axios.get('/captchaImage')
    },
    
    // 用户登录
    login: (data) => {
        return axios.post('/login', data)
    },
    
    // 用户登出
    logout: () => {
        return axios.post('/logout')
    },
    
    // 获取用户信息
    getUserInfo: () => {
        return axios.get('/getInfo')
    },
    
    // 获取路由菜单
    getRouters: () => {
        return axios.get('/getRouters')
    }
}
```

## 🔍 5. 调试和测试

### 5.1 使用Postman测试
1. 导入API文档到Postman
2. 配置环境变量
3. 测试各个接口

### 5.2 使用curl测试
```bash
# 测试登录接口
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "code": "1234",
    "uuid": "test-uuid"
  }'

# 测试需要认证的接口
curl -X GET http://localhost:8080/system/users \
  -H "Authorization: Bearer your-token-here"
```

### 5.3 浏览器开发者工具
- 查看Network面板监控API请求
- 检查请求头和响应数据
- 调试认证和权限问题

## 📝 6. 常见问题

### 6.1 跨域问题
如果前后端不在同一域名下，需要配置CORS：

```java
@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class YourController {
    // ...
}
```

### 6.2 Token过期处理
- 前端需要监听401状态码
- 自动跳转到登录页面
- 或者实现Token自动刷新机制

### 6.3 数据格式问题
- 确保请求头设置正确的Content-Type
- 日期格式统一使用ISO 8601格式
- 数字类型注意精度问题

## 🚀 7. 部署注意事项

### 7.1 生产环境配置
- 修改API基础地址
- 配置HTTPS
- 设置合适的超时时间

### 7.2 性能优化
- 实现接口缓存
- 使用分页查询
- 压缩响应数据

---

**总结**: 通过以上指南，前端开发者可以快速理解和对接后端API接口。建议在开发过程中保持密切沟通，及时同步接口变更和问题反馈。
