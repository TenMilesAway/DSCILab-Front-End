import { http } from "@/utils/http";

/**
 * 成果API响应数据结构
 */
export interface ApiAchievement {
  id: number;
  title: string;
  titleEn?: string | null;
  description?: string | null;
  keywords?: string | null;
  type?: 1 | 2;
  typeDesc?: string; // "论文"/"项目"
  paperType?: number | null;
  paperTypeDesc?: string | null;
  projectType?: number | null;
  projectTypeDesc?: string | null;
  categoryId?: number | null;
  categoryDesc?: string | null;
  venue?: string | null;
  publishDate?: string | null; // 论文：YYYY；项目：null
  projectStartDate?: string | null; // 项目：YYYY-MM；论文：null
  projectEndDate?: string | null; // 项目：YYYY-MM；论文：null
  reference?: string | null;
  linkUrl?: string | null;
  gitUrl?: string | null;
  homepageUrl?: string | null;
  pdfUrl?: string | null;
  doi?: string | null;
  fundingAmount?: number | null;
  authors?: Array<{
    name: string;
    nameEn?: string | null;
    affiliation?: string | null;
    authorOrder: number;
    isCorresponding: boolean;
    role?: string | null;
  }>; // 仅详情接口返回
  extra?: string | object | null;
  createTime?: string;
  // 保留原有字段以兼容现有代码
  journal?: string;
  tags?: string[];
  status?: number;
  published?: boolean;
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