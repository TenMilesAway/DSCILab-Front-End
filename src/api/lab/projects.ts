import { http } from "@/utils/http";

/**
 * 项目API响应数据结构
 */
export interface ApiProject {
  id: number;
  title: string;
  projectType: number;
  description?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  authors?: Array<{name: string; authorOrder: number}>;
  fundingAmount?: string;
  status?: number;
  url?: string;
}

/**
 * 项目API响应结构
 */
export interface ProjectApiResponse {
  code: number;
  msg: string;
  data: {
    rows: ApiProject[];
    total: number;
  };
}

/**
 * 获取项目列表参数
 */
export interface GetProjectsParams {
  type?: number;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 获取项目列表
 * @param params 查询参数
 * @returns Promise<ProjectApiResponse>
 */
export const getProjectsListApi = (params?: GetProjectsParams) => {
  return http.request<ProjectApiResponse>(
    "get",
    "/open/achievements",
    {
      params
    }
  );
};

/**
 * 获取项目详情
 * @param id 项目ID
 * @returns Promise<ProjectApiResponse>
 */
export const getProjectDetailApi = (id: number) => {
  return http.request<ProjectApiResponse>(
    "get",
    `/open/achievements/${id}`
  );
};