import { http } from "@/utils/http";

/**
 * 成果API响应数据结构
 */
export interface ApiAchievement {
  id: number;
  title: string;
  paperType: number;
  description?: string;
  publishDate?: string;
  authors?: Array<{name: string}>;
  journal?: string;
  venue?: string;
  doi?: string;
  tags?: string[];
  status?: number;
  gitUrl?: string;
  linkUrl?: string;
  pdfUrl?: string;
}

/**
 * 成果API响应结构
 */
export interface AchievementApiResponse {
  code: number;
  msg: string;
  data: {
    rows: ApiAchievement[];
    total: number;
  };
}

/**
 * 获取成果列表参数
 */
export interface GetAchievementsParams {
  type?: number;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 获取成果列表
 * @param params 查询参数
 * @returns Promise<AchievementApiResponse>
 */
export const getAchievementsListApi = (params?: GetAchievementsParams) => {
  return http.request<AchievementApiResponse>(
    "get",
    "/open/achievements",
    {
      params
    }
  );
};

/**
 * 根据ID获取成果详情
 * @param id 成果ID
 * @returns Promise<ResponseData<ApiAchievement>>
 */
export const getAchievementDetailApi = (id: number) => {
  return http.request<ResponseData<ApiAchievement>>(
    "get",
    `/open/achievements/${id}`
  );
};