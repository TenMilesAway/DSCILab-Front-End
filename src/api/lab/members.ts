import { http } from "@/utils/http";

/**
 * 用户API响应数据结构
 */
export interface ApiUser {
  id: number;
  realName: string;
  englishName?: string;
  identity?: string;
  academicStatus: number;
  researchArea?: string;
  enrollmentYear?: number;
  graduationYear?: number;
  graduationDest?: string;
  photo?: string;
  homepageUrl?: string;
  email?: string;
  orcid?: string;
}

/**
 * API响应结构
 */
export interface ApiResponse {
  code: number;
  msg: string;
  data: {
    rows: ApiUser[];
    total: number;
  };
}

/**
 * 获取成员列表
 * @returns Promise<ApiResponse>
 */
export const getMembersListApi = () => {
  return http.request<ApiResponse>(
    "get",
    "/open/users"
  );
};

/**
 * 根据ID获取成员详情
 * @param id 成员ID
 * @returns Promise<ResponseData<ApiUser>>
 */
export const getMemberDetailApi = (id: number) => {
  return http.request<ResponseData<ApiUser>>(
    "get",
    `/open/users/${id}`
  );
};