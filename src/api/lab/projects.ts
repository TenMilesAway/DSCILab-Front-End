import { http } from "@/utils/http";

/**
 * 项目作者信息
 */
export interface LabProjectAuthorDTO {
  name: string;
  organization?: string;
  isCorresponding?: boolean;
  authorOrder?: number;
}

/**
 * 关联论文信息
 */
export interface RelatedPaperDTO {
  id?: number;
  title: string;
  paperType?: string;
  categoryName?: string;
  publishDate?: string;
}

/**
 * 项目API响应数据结构（新格式）
 */
export interface LabProjectDTO {
  id: number;
  title: string;
  titleEn?: string;
  description?: string;
  keywords?: string;
  projectNumber: string;
  supporter: string;
  projectStartDate: string;
  projectEndDate: string;
  fundingAmount: string;
  amountDisplay?: string;
  supportCn?: string;
  supportEn?: string;
  requirement?: string;
  descText?: string;
  reference?: string;
  linkUrl?: string;
  gitUrl?: string;
  homepageUrl?: string;
  pdfUrl?: string;
  authors?: LabProjectAuthorDTO[];
  relatedPapers?: RelatedPaperDTO[];
  categoryId?: number;
  categoryName?: string;
  categoryFullPath?: string;
  projectTypeId?: number;
  published?: boolean;
}

/**
 * 分页数据结构（兼容多种格式）
 */
export interface PageDTO<T> {
  records?: T[];
  rows?: T[];
  list?: T[];
  total: number;
  size?: number;
  current?: number;
}

/**
 * 项目列表查询参数
 */
export interface LabProjectQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  projectTypeId?: number;
  supporter?: string;
  categoryId?: number;
  parentCategoryId?: number;
  startDateBegin?: string;
  startDateEnd?: string;
}

/**
 * 项目API响应结构（新格式）
 */
export interface ProjectApiResponse {
  code: number;
  msg: string;
  data: PageDTO<LabProjectDTO>;
}

/**
 * 获取项目列表（公开接口）
 * @param params 查询参数
 * @returns Promise<ProjectApiResponse>
 */
export const getProjectsListApi = (params?: LabProjectQuery) => {
  return http.request<ProjectApiResponse>("get", "/open/projects", {
    params: {
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 20,
      ...params
    }
  });
};

/**
 * 获取项目详情（公开接口）
 * @param id 项目ID
 * @returns Promise<ProjectApiResponse>
 */
export const getProjectDetailApi = (id: number) => {
  return http.request<ProjectApiResponse>("get", `/open/projects/${id}`);
};
