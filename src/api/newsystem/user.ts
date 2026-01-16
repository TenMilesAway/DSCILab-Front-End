import { http } from "@/utils/http";

/**
 * 用户列表查询参数
 */
export interface UserListQuery {
  pageNum?: number; // 页码，默认1
  pageSize?: number; // 每页大小，默认10
  username?: string; // 用户名筛选
  realName?: string; // 真实姓名筛选
  englishName?: string; // 英文名筛选
  identity?: number; // 身份筛选：1=管理员,2=教师,3=学生
  academicStatus?: number; // 学术身份筛选：0=实验室负责人,1=教授,2=副教授,3=讲师,4=博士研究生,5=硕士研究生,6=本科生
  gender?: number; // 性别筛选：0=未知,1=男,2=女
  status?: number; // 状态筛选：1=在读/在职,2=毕业/离职
  isActive?: boolean; // 是否启用
  keyword?: string; // 关键词搜索（用户名、姓名、邮箱）
}

/**
 * 旧版本查询接口，保持兼容性
 */
export interface UserQuery extends BasePageQuery {
  username?: string; // 按用户名模糊查询
  real_name?: string; // 按姓名模糊查询
  identity?: "student" | "teacher"; // 用户身份：'student', 'teacher'
  status?: "active" | "banned"; // 用户状态：'active', 'banned'
}

/**
 * 新版用户列表数据结构
 */
export interface UserListItem {
  id: number;
  studentNumber: string;
  username: string;
  realName: string;
  englishName: string;
  gender: number; // 0=未知,1=男,2=女
  identity: number; // 1=管理员,2=教师,3=学生
  academicStatus: number | null; // 0=实验室负责人,1=教授,2=副教授,3=讲师,4=博士研究生,5=硕士研究生,6=本科生
  researchArea: string;
  phone: string;
  email: string;
  status: number; // 1=在读/在职,2=毕业/离职
  isActive: boolean;
  enrollmentYear?: number; // 入学/入职年份
  graduationYear?: number; // 毕业/离职年份
  graduationDest?: string; // 毕业去向
  photo?: string; // 头像
  resume?: string; // 个人简历
  homepageUrl?: string; // 个人主页
  orcid?: string; // ORCID ID
  createTime: string;
  updateTime: string;
}

// 精简版用户DTO（用于搜索建议）
export interface LabUserProfileDTO {
  id: number;
  username?: string;
  realName: string;
  englishName?: string | null;
}

// 关键词搜索实验室用户（支持姓名/用户名/邮箱模糊匹配）
export const searchLabUsersByKeywordApi = (keyword: string) => {
  return http.request<ResponseData<LabUserProfileDTO[]>>("get", "/lab/users/crud/search", {
    params: { keyword }
  });
};

/**
 * 旧版UserDTO，保持兼容性
 */
export interface UserDTO {
  user_id: number;
  identity: string;
  username: string;
  status: string;
  student_number?: number;
  real_name?: string;
  gender?: string;
  academic_status?: string;
  research_area?: string;
  phone?: number;
  email?: string;
  enrollment_year?: number;
  graduation_year?: number;
  graduation_dest?: string;
  photo?: string;
}

/**
 * CreateUserRequest - 新增用户请求接口
 */
export interface CreateUserRequest {
  studentNumber?: string; // 学号/工号
  username: string; // 用户名（必填，唯一）
  realName: string; // 真实姓名（必填）
  englishName?: string; // 英文名
  password: string; // 密码（必填，6-20位）
  gender?: number; // 性别：0=未知,1=男,2=女
  identity: number; // 身份（必填）：1=管理员,2=教师,3=学生
  academicStatus?: number; // 学术身份：0=实验室负责人,1=教授,2=副教授,3=讲师,4=博士研究生,5=硕士研究生,6=本科生
  researchArea?: string; // 研究方向
  phone?: string; // 手机号
  email?: string; // 邮箱
  status?: number; // 状态：1=在读/在职,2=毕业/离职
  enrollmentYear?: number; // 入学/入职年份
  graduationYear?: number; // 毕业/离职年份
  graduationDest?: string; // 毕业去向
  resume?: string; // 个人简历
  homepageUrl?: string; // 个人主页
  orcid?: string; // ORCID ID
  isActive?: boolean; // 是否启用，默认true
}

/**
 * AddUserCommand - 旧版本接口，保持兼容性
 */
export interface UserRequest {
  identity: "student" | "teacher" | "admin";
  username: string;
  status: "active" | "banned";
  student_number?: number;
  real_name?: string;
  gender?: "male" | "female";
  academic_status?: string;
  research_area?: string;
  phone?: number;
  email?: string;
  enrollment_year?: number;
  graduation_year?: number;
  graduation_dest?: string;
  password?: string;
  photo?: string;
}

/**
 * UpdateUserRequest - 管理员更新用户信息请求接口
 */
export interface UpdateUserRequest {
  // 基本信息
  studentNumber?: string; // 学号/工号
  realName?: string; // 真实姓名
  englishName?: string; // 英文名
  gender?: number; // 性别：0=未知,1=男,2=女

  // 身份和状态（管理员特有权限）
  identity?: number; // 身份：1=管理员,2=教师,3=学生
  academicStatus?: number; // 学术身份：1=教授,2=副教授,3=讲师,4=博士,5=硕士
  status?: number; // 状态：1=在读/在职,2=毕业/离职
  isActive?: boolean; // 账号是否启用

  // 联系方式
  phone?: string; // 手机号
  email?: string; // 邮箱

  // 学术信息
  researchArea?: string; // 研究方向
  enrollmentYear?: number; // 入学/入职年份
  graduationYear?: number; // 毕业/离职年份
  graduationDest?: string; // 毕业去向

  // 个人资料
  resume?: string; // 个人简历
  homepageUrl?: string; // 个人主页
  orcid?: string; // ORCID ID
}

/**
 * UpdateProfileCommand
 */
export interface UpdateProfileRequest {
  realName: string;
  englishName?: string;
  studentNumber?: string; // 学号/工号
  gender?: number;
  academicStatus?: number;
  researchArea?: string;
  phone?: string;
  email?: string;
  status?: number; // 状态：1=在读/在职,2=毕业/离职
  enrollmentYear?: number; // 入学/入职年份
  graduationYear?: number;
  graduationDest?: string;
  resume?: string;
  homepageUrl?: string;
  orcid?: string;
}

/**
 * 旧版本接口，保持兼容性
 */
export interface UserProfileRequest {
  user_id?: number;
  real_name: string; // 姓名（必填）
  student_number?: number; // 学号（学生必填）
  academic_status: string; // 教授副教授，硕士博士（必填）
  research_area?: string; // 研究方向（可选）
  phone?: number; // 手机号（可选）
  email: string; // 邮箱（必填）
  enrollment_year: number; // 入学年份（必填）
  graduation_year?: number; // 毕业年份（可选）
  graduation_dest?: string; // 毕业去向（可选）
}

/**
 * ResetPasswordCommand
 */
export interface ResetPasswordRequest {
  oldPassword: string; // 原密码（必填）
  newPassword: string; // 新密码（必填，6-20位）
  confirmPassword: string; // 确认密码（必填）
}

/**
 * 修改密码
 */
export interface PasswordRequest {
  user_id: number;
  password: string;
}

/**
 * 用户个人信息
 */
export interface UserProfile {
  id: number;
  studentNumber: string;
  username: string;
  realName: string;
  englishName: string;
  gender: number; // 0=未知,1=男,2=女
  genderDesc: string;
  identity: number; // 1=管理员,2=教师,3=学生
  identityDesc: string;
  academicStatus: number; // 0=实验室负责人,1=教授,2=副教授,3=讲师,4=博士研究生,5=硕士研究生,6=本科生
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

/** 获取用户列表 */
export const getUserListApi = (params?: UserListQuery) => {
  return http.request<ResponseData<{ total: number; rows: UserListItem[] }>>(
    "get",
    "/lab/users/crud/list",
    {
      params
    }
  );
};

/** 新增用户 */
export const addUserApi = (data?: CreateUserRequest) => {
  return http.request<ResponseData<void>>("post", "/lab/users/crud", {
    data
  });
};

/** 编辑用户 */
export const updateUserApi = (userId: number, data?: UpdateUserRequest) => {
  return http.request<ResponseData<void>>("put", `/lab/users/crud/${userId}`, {
    data
  });
};

/** 更改用户密码 */
export const updateUserPasswordApi = (data?: PasswordRequest) => {
  return http.request<ResponseData<void>>(
    "put",
    `/lab/users/crud/${data.user_id}/password`,
    {
      data
    }
  );
};

/** 删除用户 */
export const deleteUserApi = (userId: number) => {
  return http.request<ResponseData<void>>(
    "delete",
    `/lab/users/crud/${userId}`
  );
};

/** 批量导出用户 */
export const exportUserExcelApi = (params: UserListQuery, fileName: string) => {
  return http.download("/system/users/excel", fileName, {
    params
  });
};

/** 用户头像上传 */
export const uploadUserAvatarApi = data => {
  return http.request<ResponseData<void>>(
    "post",
    "/lab/users/crud/profile/photo",
    {
      data
    },
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 更改用户资料 */
export const updateUserProfileApi = (data: UpdateProfileRequest) => {
  return http.request<ResponseData<void>>("put", "/lab/users/crud/profile", {
    data
  });
};

/** 更改当前用户密码 */
export const updateCurrentUserPasswordApi = (data?: ResetPasswordRequest) => {
  return http.request<ResponseData<void>>("put", "/lab/users/crud/password", {
    data
  });
};

/** 获取当前用户信息 */
export const getUserProfileApi = () => {
  return http.request<ResponseData<UserProfile>>("get", "/lab/users/profile");
};
