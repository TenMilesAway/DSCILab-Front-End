# 🌐 实验室用户管理系统 - 前端API接口文档

## 📋 接口基础信息

### 基础配置
- **Base URL**: `http://localhost:8080`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **字符编码**: UTF-8

### 认证说明
所有需要认证的接口都需要在请求头中添加：
```
Authorization: Bearer {your_jwt_token}
```

## 🔍 用户查询接口

### 1. 获取当前用户信息
```
GET /lab/users/profile
```
**用途**: 获取当前登录用户的详细信息  
**权限**: 需要登录  
**响应数据**:
```typescript
interface UserProfile {
  id: number;
  studentNumber: string;
  username: string;
  realName: string;
  englishName: string;
  gender: number; // 0=未知,1=男,2=女
  genderDesc: string;
  identity: number; // 1=管理员,2=教师,3=学生
  identityDesc: string;
  academicStatus: number; // 1=教授,2=副教授,3=讲师,4=博士,5=硕士
  academicStatusDesc: string;
  researchArea: string;
  phone: string;
  email: string;
  status: number; // 1=在读/在职,2=毕业/离职
  statusDesc: string;
  enrollmentYear: string;
  graduationYear: string;
  graduationDest: string;
  photo: string;
  resume: string;
  homepageUrl: string;
  orcid: string;
  isActive: boolean;
  createTime: string;
  updateTime: string;
}
```

### 2. 分页查询用户列表
```
GET /lab/users/crud/list
```
**用途**: 管理员查看所有用户列表  
**权限**: 管理员  
**查询参数**:
```typescript
interface UserListQuery {
  pageNum?: number; // 页码，默认1
  pageSize?: number; // 每页大小，默认10
  username?: string; // 用户名筛选
  realName?: string; // 真实姓名筛选
  identity?: number; // 身份筛选
  academicStatus?: number; // 学术身份筛选
  keyword?: string; // 关键词搜索
  isActive?: boolean; // 是否启用
}
```
**响应数据**:
```typescript
interface UserListResponse {
  total: number;
  rows: UserProfile[];
}
```

### 3. 搜索用户
```
GET /lab/users/crud/search?keyword={keyword}
```
**用途**: 根据关键词搜索用户  
**权限**: 无需特殊权限  
**参数**: `keyword` - 搜索关键词  
**响应**: `UserProfile[]`

### 4. 检查用户是否存在
```
GET /lab/users/{userId}/exists
GET /lab/users/username/{username}/exists
```
**用途**: 检查用户ID或用户名是否存在  
**权限**: 需要登录  
**响应**: `boolean`

## ➕ 用户创建接口

### 创建新用户
```
POST /lab/users/crud
```
**用途**: 管理员创建新用户  
**权限**: 管理员  
**请求数据**:
```typescript
interface CreateUserRequest {
  studentNumber?: string; // 学号/工号
  username: string; // 用户名（必填）
  realName: string; // 真实姓名（必填）
  englishName?: string; // 英文名
  password: string; // 密码（必填）
  gender?: number; // 性别
  identity: number; // 身份（必填）
  academicStatus?: number; // 学术身份
  researchArea?: string; // 研究方向
  phone?: string; // 手机号
  email?: string; // 邮箱
  status?: number; // 状态
  enrollmentYear?: number; // 入学年份
  isActive?: boolean; // 是否启用
}
```
**响应**: 返回新用户的ID

## ✏️ 用户更新接口

### 1. 更新个人信息
```
PUT /lab/users/crud/profile
```
**用途**: 用户更新自己的个人信息  
**权限**: 需要登录  
**请求数据**:
```typescript
interface UpdateProfileRequest {
  realName: string;
  englishName?: string;
  gender?: number;
  academicStatus?: number;
  researchArea?: string;
  phone?: string;
  email?: string;
  graduationYear?: number;
  graduationDest?: string;
  resume?: string;
  homepageUrl?: string;
  orcid?: string;
}
```

### 2. 修改密码
```
PUT /lab/users/crud/password
```
**用途**: 用户修改自己的密码  
**权限**: 需要登录  
**请求数据**:
```typescript
interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

### 3. 管理员更新用户信息
```
PUT /lab/users/crud/{userId}
```
**用途**: 管理员更新任意用户信息  
**权限**: 管理员  
**请求数据**: 类似 `CreateUserRequest`，但所有字段都是可选的

## 🗑️ 用户删除接口

### 1. 删除单个用户
```
DELETE /lab/users/crud/{userId}
```
**用途**: 管理员删除用户（软删除）  
**权限**: 管理员

### 2. 批量删除用户
```
DELETE /lab/users/crud/batch
```
**用途**: 管理员批量删除用户  
**权限**: 管理员  
**请求数据**: `number[]` - 用户ID数组

## 📊 统计接口

### 获取用户统计信息
```
GET /lab/users/crud/statistics
```
**用途**: 获取用户统计数据  
**权限**: 管理员

## 🔧 前端集成示例

### React + Axios 示例

```typescript
// api/userApi.ts
import axios from 'axios';

const API_BASE = 'http://localhost:8080';

// 设置默认请求头
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

export const userApi = {
  // 获取当前用户信息
  getCurrentUser: () => 
    axios.get<ApiResponse<UserProfile>>(`${API_BASE}/lab/users/profile`),
  
  // 获取用户列表
  getUserList: (params: UserListQuery) =>
    axios.get<ApiResponse<UserListResponse>>(`${API_BASE}/lab/users/crud/list`, { params }),
  
  // 搜索用户
  searchUsers: (keyword: string) =>
    axios.get<ApiResponse<UserProfile[]>>(`${API_BASE}/lab/users/crud/search`, { 
      params: { keyword } 
    }),
  
  // 创建用户
  createUser: (data: CreateUserRequest) =>
    axios.post<ApiResponse<number>>(`${API_BASE}/lab/users/crud`, data),
  
  // 更新个人信息
  updateProfile: (data: UpdateProfileRequest) =>
    axios.put<ApiResponse<void>>(`${API_BASE}/lab/users/crud/profile`, data),
  
  // 修改密码
  changePassword: (data: ChangePasswordRequest) =>
    axios.put<ApiResponse<void>>(`${API_BASE}/lab/users/crud/password`, data),
  
  // 删除用户
  deleteUser: (userId: number) =>
    axios.delete<ApiResponse<void>>(`${API_BASE}/lab/users/crud/${userId}`),
};

// 通用响应类型
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}
```

### Vue 3 + Composition API 示例

```typescript
// composables/useUser.ts
import { ref, reactive } from 'vue';

export function useUser() {
  const currentUser = ref<UserProfile | null>(null);
  const userList = reactive({
    data: [] as UserProfile[],
    total: 0,
    loading: false
  });

  const getCurrentUser = async () => {
    try {
      const response = await userApi.getCurrentUser();
      currentUser.value = response.data.data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const getUserList = async (params: UserListQuery) => {
    userList.loading = true;
    try {
      const response = await userApi.getUserList(params);
      userList.data = response.data.data.rows;
      userList.total = response.data.data.total;
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      userList.loading = false;
    }
  };

  return {
    currentUser,
    userList,
    getCurrentUser,
    getUserList
  };
}
```

## 🚨 错误处理

### 常见错误码
- `200`: 成功
- `401`: 未授权（Token无效或过期）
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

### 错误响应格式
```typescript
interface ErrorResponse {
  code: number;
  msg: string;
  data: null;
}
```

## 🔐 安全注意事项

1. **Token管理**: 
   - 将Token存储在localStorage或sessionStorage中
   - 定期检查Token有效性
   - Token过期时自动跳转到登录页

2. **权限控制**:
   - 前端也要做权限判断，隐藏无权限的功能
   - 但不能依赖前端权限，后端必须验证

3. **数据验证**:
   - 前端做基础验证提升用户体验
   - 后端会做完整验证确保数据安全

## 📱 移动端适配

接口完全支持移动端调用，只需要：
1. 设置正确的请求头
2. 处理网络异常情况
3. 适配移动端的用户体验

---

**📞 技术支持**: 如有接口问题，请联系后端开发团队
