# 实验室用户API接口文档

## 📋 接口概览

本文档描述了新增的实验室用户管理相关API接口，这些接口基于你的需求设计，支持三种权限角色（管理员、教师、学生）的个人信息管理。

## 🔐 权限说明

### 角色权限
- **管理员**: 可以查看和修改所有用户信息
- **教师**: 可以查看所有用户信息，只能修改自己的信息
- **学生**: 可以查看所有用户信息，只能修改自己的信息

### 学术身份
- **教师**: 教授(1)、副教授(2)、讲师(3)
- **学生**: 博士(4)、硕士(5)

## 📚 API接口列表

### 1. 获取当前用户个人信息

**接口地址**: `GET /lab/users/profile`

**接口描述**: 获取当前登录用户的详细个人信息

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
    "code": 200,
    "message": "操作成功",
    "data": {
        "id": 1,
        "studentNumber": "2021001",
        "username": "zhangsan",
        "realName": "张三",
        "englishName": "Zhang San",
        "gender": 1,
        "genderDesc": "男",
        "identity": 3,
        "identityDesc": "学生",
        "academicStatus": 4,
        "academicStatusDesc": "博士",
        "researchArea": "人工智能、机器学习",
        "phone": "13800138000",
        "email": "zhangsan@university.edu",
        "status": 1,
        "statusDesc": "在读/在职",
        "enrollmentYear": 2021,
        "graduationYear": null,
        "graduationDest": null,
        "photo": "/uploads/photos/zhangsan.jpg",
        "resume": "个人简历内容...",
        "homepageUrl": "https://zhangsan.github.io",
        "orcid": "0000-0000-0000-0000",
        "isActive": true,
        "createTime": "2023-01-01 10:00:00",
        "updateTime": "2023-12-01 15:30:00"
    }
}
```

### 2. 根据用户ID获取个人信息

**接口地址**: `GET /lab/users/{userId}`

**接口描述**: 根据用户ID获取个人信息（需要权限验证）

**路径参数**:
- `userId` (Long): 用户ID

**权限要求**: 
- 管理员可以查看任何用户
- 普通用户只能查看自己的信息

**请求示例**:
```bash
GET /lab/users/1
Authorization: Bearer <token>
```

**响应**: 同上面的响应格式

### 3. 根据用户名获取个人信息

**接口地址**: `GET /lab/users/username/{username}`

**接口描述**: 根据用户名获取个人信息（需要权限验证）

**路径参数**:
- `username` (String): 用户名

**权限要求**: 
- 管理员可以查看任何用户
- 普通用户只能查看自己的信息

**请求示例**:
```bash
GET /lab/users/username/zhangsan
Authorization: Bearer <token>
```

**响应**: 同上面的响应格式

### 4. 检查用户是否存在

**接口地址**: `GET /lab/users/{userId}/exists`

**接口描述**: 根据用户ID检查用户是否存在

**路径参数**:
- `userId` (Long): 用户ID

**请求示例**:
```bash
GET /lab/users/1/exists
Authorization: Bearer <token>
```

**响应示例**:
```json
{
    "code": 200,
    "message": "操作成功",
    "data": true
}
```

### 5. 检查用户名是否存在

**接口地址**: `GET /lab/users/username/{username}/exists`

**接口描述**: 根据用户名检查用户是否存在

**路径参数**:
- `username` (String): 用户名

**请求示例**:
```bash
GET /lab/users/username/zhangsan/exists
Authorization: Bearer <token>
```

**响应示例**:
```json
{
    "code": 200,
    "message": "操作成功",
    "data": true
}
```

## 🧪 测试示例

### 使用curl测试

```bash
# 1. 获取当前用户信息
curl -X GET "http://localhost:8080/lab/users/profile" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 2. 根据用户ID获取信息
curl -X GET "http://localhost:8080/lab/users/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 3. 根据用户名获取信息
curl -X GET "http://localhost:8080/lab/users/username/zhangsan" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. 检查用户是否存在
curl -X GET "http://localhost:8080/lab/users/1/exists" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 5. 检查用户名是否存在
curl -X GET "http://localhost:8080/lab/users/username/zhangsan/exists" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 使用JavaScript测试

```javascript
// 配置API基础信息
const API_BASE_URL = 'http://localhost:8080';
const token = localStorage.getItem('access_token');

// 实验室用户API封装
const labUserAPI = {
    // 获取当前用户信息
    async getCurrentProfile() {
        const response = await fetch(`${API_BASE_URL}/lab/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    },

    // 根据用户ID获取信息
    async getUserProfile(userId) {
        const response = await fetch(`${API_BASE_URL}/lab/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    },

    // 根据用户名获取信息
    async getUserProfileByUsername(username) {
        const response = await fetch(`${API_BASE_URL}/lab/users/username/${username}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    },

    // 检查用户是否存在
    async userExists(userId) {
        const response = await fetch(`${API_BASE_URL}/lab/users/${userId}/exists`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    },

    // 检查用户名是否存在
    async usernameExists(username) {
        const response = await fetch(`${API_BASE_URL}/lab/users/username/${username}/exists`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }
};

// 使用示例
async function testLabUserAPI() {
    try {
        // 获取当前用户信息
        const currentProfile = await labUserAPI.getCurrentProfile();
        console.log('当前用户信息:', currentProfile);

        // 检查用户是否存在
        const userExists = await labUserAPI.userExists(1);
        console.log('用户1是否存在:', userExists);

    } catch (error) {
        console.error('API调用失败:', error);
    }
}
```

## 🔧 数据库准备

在使用这些接口之前，需要创建对应的数据库表。请参考 `数据库表设计优化建议.md` 文件中的建表语句。

## 📝 注意事项

1. **权限控制**: 所有接口都需要JWT Token认证
2. **数据权限**: 普通用户只能查看自己的详细信息
3. **错误处理**: 接口会返回标准的错误码和错误信息
4. **数据格式**: 所有时间字段都是字符串格式
5. **枚举值**: 性别、身份、学术身份等都有对应的描述字段

## 🚀 扩展建议

基于这个基础接口，你可以继续扩展：

1. **用户信息修改接口**: `PUT /lab/users/profile`
2. **用户列表查询接口**: `GET /lab/users`
3. **用户搜索接口**: `GET /lab/users/search`
4. **用户头像上传接口**: `POST /lab/users/avatar`
5. **密码修改接口**: `PUT /lab/users/password`

这些接口的实现可以参考现有的代码结构，按照相同的模式进行开发。
