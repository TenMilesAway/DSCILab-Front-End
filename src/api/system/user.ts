import { http } from "@/utils/http";

export interface UserQuery extends BasePageQuery {
  deptId?: number;
  phoneNumber?: string;
  status?: number;
  userId?: number;
  username?: string;
  nickname?: string;
  userType?: number;
}

/**
 * UserDTO
 */
export interface UserDTO {
  avatar?: string;
  createTime?: Date;
  creatorId?: number;
  creatorName?: string;
  deptId?: number;
  deptName?: string;
  email?: string;
  loginDate?: Date;
  loginIp?: string;
  nickname?: string;
  phoneNumber?: string;
  postId?: number;
  remark?: string;
  roleId?: number;
  roleName?: string;
  sex?: number;
  status?: number;
  updaterId?: number;
  updaterName?: string;
  updateTime?: Date;
  userId?: number;
  username?: string;
  userType?: number;
}

/**
 * AddUserCommand
 */
export interface UserRequest {
  userId: number;
  avatar?: string;
  deptId?: number;
  email?: string;
  nickname?: string;
  phoneNumber?: string;
  password: string;
  postId?: number;
  remark?: string;
  roleId?: number;
  sex?: number;
  status?: number;
  username?: string;
}

/**
 * UpdateProfileCommand
 */
export interface UserProfileRequest {
  user_id?: number;
  real_name: string;        // 姓名（必填）
  student_number?: number;  // 学号（学生必填）
  academic_status: string;  // 教授副教授，硕士博士（必填）
  research_area?: string;   // 研究方向（可选）
  phone?: number;           // 手机号（可选）
  email: string;            // 邮箱（必填）
  enrollment_year: number;  // 入学年份（必填）
  graduation_year?: number; // 毕业年份（可选）
  graduation_dest?: string; // 毕业去向（可选）
}

/**
 * ResetPasswordCommand
 */
export interface ResetPasswordRequest {
  newPassword?: string;
  oldPassword?: string;
  confirmPassword?: string;
  userId?: number;
}

/**
 * 修改密码
 */
export interface PasswordRequest {
  userId: number;
  password: string;
}

/** 获取用户列表 */
export const getUserListApi = (params?: UserQuery) => {
  return http.request<ResponseData<PageDTO<UserDTO>>>("get", "/system/users", {
    params
  });
};

/** 新增用户 */
export const addUserApi = (data?: UserRequest) => {
  return http.request<ResponseData<void>>("post", "/system/users", {
    data
  });
};

/** 编辑用户 */
export const updateUserApi = (userId: number, data?: UserRequest) => {
  return http.request<ResponseData<void>>("put", `/system/users/${userId}`, {
    data
  });
};

/** 更改用户密码 */
export const updateUserPasswordApi = (data?: PasswordRequest) => {
  return http.request<ResponseData<void>>(
    "put",
    `/system/users/${data.userId}/password`,
    {
      data
    }
  );
};

/** 删除用户 */
export const deleteUserApi = (userId: number) => {
  return http.request<ResponseData<void>>("delete", `/system/users/${userId}`);
};

/** 修改用户状态 */
export const updateUserStatusApi = (userId: number, status: number) => {
  return http.request<ResponseData<PageDTO<UserDTO>>>(
    "put",
    `/system/users/${userId}/status`,
    {
      data: {
        status: status
      }
    }
  );
};

/** 批量导出用户 */
export const exportUserExcelApi = (params: UserQuery, fileName: string) => {
  return http.download("/system/users/excel", fileName, {
    params
  });
};

/** 用户头像上传 */
export const uploadUserAvatarApi = data => {
  return http.request<ResponseData<void>>(
    "post",
    "/system/user/profile/avatar",
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
export const updateUserProfileApi = (data?: UserProfileRequest) => {
  return http.request<ResponseData<void>>("put", "/system/user/profile", {
    data
  });
};

/** 更改当前用户密码 */
export const updateCurrentUserPasswordApi = (data?: ResetPasswordRequest) => {
  return http.request<ResponseData<void>>(
    "put",
    "/system/user/profile/password",
    {
      data
    }
  );
};
