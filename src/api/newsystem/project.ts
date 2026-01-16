import { http } from "@/utils/http";
import { AchievementAuthorDTO } from "./paper";

/**
 * 项目列表查询参数
 */
export interface ProjectListQuery {
  pageNum?: number; // 页码，默认1
  pageSize?: number; // 每页大小，默认100
  keyword?: string; // 关键词
  projectTypeId?: number; // 项目类型字典值
  supporter?: string; // 支持单位/机构
  ownerUserId?: number; // 拥有者用户ID
  published?: boolean; // 是否发布
  verified?: boolean; // 是否审核
  startDateBegin?: string; // 开始日期区间起，YYYY-MM-DD
  startDateEnd?: string; // 开始日期区间止，YYYY-MM-DD
}

/**
 * 创建项目请求参数
 */
export interface CreateProjectRequest {
  title: string; // 必填，<=500
  titleEn?: string | null; // 可选
  description?: string | null; // 可选
  keywords?: string | null; // 可选，<=1000
  type?: 1 | 2;
  projectTypeId?: number | null; // 项目类型字典值 1..8
  projectNumber?: string | null; // 项目编号
  projectStartDate?: string | null; // 项目开始日期；格式：YYYY-MM
  projectEndDate?: string | null; // 项目结束日期；可空或>=开始；格式：YYYY-MM
  reference?: string | null;
  linkUrl?: string | null; // 项目主页/资料链接
  gitUrl?: string | null; // 代码仓库链接
  homepageUrl?: string | null;
  pdfUrl?: string | null;
  fundingAmount?: number | null; // >=0，单位：万元
  published?: boolean | null; // 默认false
  extra?: string | object | null;
  authors?: CreateAuthorRequest[] | null; // 作者列表（至少包含name与authorOrder；可选userId）
}

/**
 * 更新项目请求参数
 */
export interface UpdateProjectRequest {
  title?: string; // <=500
  titleEn?: string | null;
  description?: string | null;
  keywords?: string | null; // <=1000
  type?: 1 | 2;
  projectTypeId?: number | null;
  projectNumber?: string | null;
  projectStartDate?: string | null; // 项目开始日期；格式：YYYY-MM
  projectEndDate?: string | null; // 项目结束日期；可空或>=开始；格式：YYYY-MM
  reference?: string | null;
  linkUrl?: string | null;
  gitUrl?: string | null;
  homepageUrl?: string | null;
  pdfUrl?: string | null;
  fundingAmount?: number | null; // >=0，单位：万元
  published?: boolean | null;
  extra?: string | object | null;
  authors?: CreateAuthorRequest[] | null;
}

export interface RelatedPaperDTO {
  id: number;
  title: string;
  paperTypeId: number;
  paperTypeDesc: string;
  publishDate: string;
  categoryId: number;
  categoryName: string;
  authors?: AchievementAuthorDTO[];
}

/**
 * 项目返回数据结构
 */
export interface LabProjectDTO {
  id: number;
  title: string;
  titleEn: string | null;
  description: string | null;
  keywords: string | null;
  type: 1 | 2;
  typeDesc: string | null;
  paperType: number | null;
  paperTypeDesc: string | null;
  projectType: number | null;
  projectTypeDesc: string | null;
  venue: string | null;
  publishDate: string | null; // 论文：YYYY；项目：null
  projectStartDate: string | null; // 项目：YYYY-MM；论文：null
  projectEndDate: string | null; // 项目：YYYY-MM；论文：null
  reference: string | null;
  linkUrl: string | null;
  gitUrl: string | null;
  homepageUrl: string | null;
  pdfUrl: string | null;
  doi: string | null;
  fundingAmount: number | null;
  ownerUserId: number | null;
  ownerUserName: string | null;
  published: boolean;
  isVerified: boolean;
  myVisibility?: boolean; // 我的项目可见性（仅在my-projects接口中返回）
  authors?: ProjectAuthorDTO[]; // 可选：作者DTO
  relatedPapers?: RelatedPaperDTO[]; // 关联的成果/论文
  extra: string | object | null;
  createTime: string;
  updateTime: string;
}

/**
 * 作者数据结构
 */
export interface ProjectAuthorDTO {
  id: number;
  projectId: number;
  userId: number | null;
  name: string | null;
  email: string | null;
  affiliation: string | null;
  authorOrder: number;
  isCorresponding: boolean;
  role: string | null;
  visible: boolean;
  isInternal: boolean; // userId!=null
  createTime: string;
  updateTime: string;
}

/**
 * 新增作者请求参数
 */
export interface CreateAuthorRequest {
  userId?: number | null; // 内部作者ID（强烈推荐）
  username?: string | null; // 未传userId时用于自动绑定
  email?: string | null; // 未传userId时用于自动绑定
  phone?: string | null; // 未传userId时用于自动绑定
  studentNumber?: string | null; // 未传userId时用于自动绑定
  name?: string | null; // 姓名（外部作者必填；自动绑定失败则作为外部作者保存）
  affiliation?: string | null;
  authorOrder: number; // 作者顺序（>0，同一项目下唯一）
  isCorresponding?: boolean; // 是否通讯作者
  role?: string | null; // 角色
  visible?: boolean; // 仅对内部作者生效
}

/**
 * 更新作者请求参数
 */
export interface UpdateAuthorRequest {
  userId?: number | null; // 内部作者ID
  username?: string | null; // 未传userId时用于自动绑定
  email?: string | null; // 未传userId时用于自动绑定
  phone?: string | null; // 未传userId时用于自动绑定
  studentNumber?: string | null; // 未传userId时用于自动绑定
  name?: string | null; // 姓名
  affiliation?: string | null;
  authorOrder?: number | null; // 作者顺序（传入时需保证唯一）
  isCorresponding?: boolean | null; // 是否通讯作者
  role?: string | null; // 角色
  visible?: boolean | null; // 仅对内部作者生效
}

/**
 * 我的项目查询参数
 */
export interface MyProjectQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  type?: 1 | 2;
  paperType?: number; // 1..7
  projectType?: number; // 1..8
  categoryId?: number; // 二级分类ID（叶子分类）；当传入时服务端忽略type
  parentCategoryId?: number; // 项目类型ID（新类型系统，推荐传二级分类ID）
  published?: boolean;
  isVerified?: boolean;
  dateStart?: string; // yyyy-MM-dd
  dateEnd?: string; // yyyy-MM-dd
}

// 扩展的我的项目查询接口，包含ownerName和authorName参数
export interface MyProjectExtendedQuery extends MyProjectQuery {
  ownerName?: string; // 拥有者姓名（模糊匹配 real_name/english_name；仅在"我的范围"内过滤）
  authorName?: string; // 作者姓名（模糊匹配作者表 name/name_en + 内部作者姓名；仅在"我的范围"内过滤）
}

/**
 * 公开端项目查询参数
 */
export interface PublicProjectQuery {
  pageNum?: number; // 页码，默认1
  pageSize?: number; // 每页大小，默认100
  keyword?: string; // 关键词，匹配 title/keywords
  type?: 1 | 2; // 1=论文, 2=项目
  paperType?: number; // 仅type=1生效，1..7
  projectType?: number; // 仅type=2生效，1..8
  parentCategoryId?: number; // 项目类型ID（新类型系统，推荐传二级分类ID）
  dateStart?: string; // 开始日期 yyyy-MM-dd
  dateEnd?: string; // 结束日期 yyyy-MM-dd
}

/**
 * 公开端作者信息
 */
export interface PublicAuthorDTO {
  name: string;
  email: string | null;
  affiliation: string | null;
  authorOrder: number;
  isCorresponding: boolean;
  role: string | null;
}

/**
 * 公开端项目信息
 */
export interface PublicProjectDTO {
  id: number;
  title: string;
  titleEn: string | null;
  description: string | null;
  keywords: string | null;
  type: 1 | 2;
  typeDesc: string; // "论文"/"项目"
  paperType: number | null;
  paperTypeDesc: string | null;
  projectType: number | null;
  projectTypeDesc: string | null;
  categoryId: number | null;
  categoryDesc: string | null;
  venue: string | null;
  publishDate: string | null; // 论文：YYYY；项目：null
  projectStartDate: string | null; // 项目：YYYY-MM；论文：null
  projectEndDate: string | null; // 项目：YYYY-MM；论文：null
  reference: string | null;
  linkUrl: string | null;
  gitUrl: string | null;
  homepageUrl: string | null;
  pdfUrl: string | null;
  doi: string | null;
  fundingAmount: number | null;
  authors?: PublicAuthorDTO[]; // 仅详情接口返回
  extra: string | object | null;
  createTime: string;
}

// ==================== 项目管理 API ====================

/**
 * 获取项目列表
 */
export const getProjectListApi = (params?: ProjectListQuery) => {
  return http.request<
    ResponseData<{ total: number; rows: LabProjectDTO[] }>
  >("get", "/lab/projects", { params });
};

/**
 * 获取项目详情
 */
export const getProjectDetailApi = (id: number) => {
  return http.request<ResponseData<LabProjectDTO>>("get", `/lab/projects/${id}`);
};

/**
 * 创建项目
 */
export const createProjectApi = (data: CreateProjectRequest) => {
  return http.request<ResponseData<number>>("post", "/lab/projects", {
    data
  });
};

/**
 * 更新项目
 */
export const updateProjectApi = (
  id: number,
  data: UpdateProjectRequest
) => {
  return http.request<ResponseData<void>>("put", `/lab/projects/${id}`, {
    data
  });
};

/**
 * 删除项目（软删除）
 */
export const deleteProjectApi = (id: number) => {
  return http.request<void>("delete", `/lab/projects/${id}`);
};

/**
 * 发布/取消发布项目
 */
export const publishProjectApi = (id: number, published: boolean) => {
  return http.request<void>("put", `/lab/projects/${id}/publish`, {
    params: { published }
  });
};

/**
 * 审核/取消审核项目
 */
export const verifyProjectApi = (id: number, verified: boolean) => {
  return http.request<void>("put", `/lab/projects/${id}/verify`, {
    params: { verified }
  });
};

// ==================== 作者管理 API ====================

/**
 * 获取项目作者列表
 */
export const getProjectAuthorsApi = (projectId: number) => {
  return http.request<ProjectAuthorDTO[]>(
    "get",
    `/lab/achievements/${projectId}/authors`
  );
};

/**
 * 添加项目作者
 */
export const addProjectAuthorApi = (
  projectId: number,
  data: CreateAuthorRequest
) => {
  return http.request<ProjectAuthorDTO>(
    "post",
    `/lab/achievements/${projectId}/authors`,
    { data }
  );
};

/**
 * 更新项目作者
 */
export const updateProjectAuthorApi = (
  projectId: number,
  authorId: number,
  data: UpdateAuthorRequest
) => {
  return http.request<ProjectAuthorDTO>(
    "put",
    `/lab/achievements/${projectId}/authors/${authorId}`,
    { data }
  );
};

/**
 * 删除项目作者（软删除）
 */
export const deleteProjectAuthorApi = (
  projectId: number,
  authorId: number
) => {
  return http.request<void>(
    "delete",
    `/lab/achievements/${projectId}/authors/${authorId}`
  );
};

/**
 * 调整作者顺序
 */
export const reorderAuthorApi = (
  projectId: number,
  authorId: number,
  newOrder: number
) => {
  return http.request<void>(
    "put",
    `/lab/achievements/${projectId}/authors/${authorId}/reorder`,
    { params: { newOrder } }
  );
};

/**
 * 切换作者可见性
 */
export const toggleAuthorVisibilityApi = (
  projectId: number,
  authorId: number,
  visible: boolean
) => {
  return http.request<void>(
    "put",
    `/lab/achievements/${projectId}/authors/${authorId}/visibility`,
    { params: { visible } }
  );
};

// ==================== 用户自助端 API ====================

/**
 * 获取我的项目列表
 */
export const getMyProjectsApi = (params?: MyProjectQuery) => {
  return http.request<
    ResponseData<{ total: number; rows: LabProjectDTO[] }>
  >("get", "/lab/my-achievements", { params });
};

/**
 * 切换我的项目可见性
 */
export const toggleMyProjectVisibilityApi = (
  projectId: number,
  visible: boolean
) => {
  return http.request<void>(
    "put",
    `/lab/my-achievements/${projectId}/visibility`,
    { params: { visible } }
  );
};

// ==================== 公开端 API ====================

/**
 * 获取公开项目列表
 */
export const getPublicProjectsApi = (params?: PublicProjectQuery) => {
  return http.request<
    ResponseData<{ total: number; rows: PublicProjectDTO[] }>
  >("get", "/open/achievements", { params });
};

/**
 * 获取公开项目详情
 */
export const getPublicProjectDetailApi = (id: number) => {
  return http.request<ResponseData<PublicProjectDTO>>(
    "get",
    `/open/achievements/${id}`
  );
};
