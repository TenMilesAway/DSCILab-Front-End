import { http } from "@/utils/http";

/**
 * 成果列表查询参数
 */
export interface AchievementListQuery {
  pageNum?: number; // 页码，默认1
  pageSize?: number; // 每页大小，默认100
  keyword?: string; // 关键词，匹配 title/keywords
  type?: 1 | 2; // 1=论文, 2=项目
  paperType?: number; // 仅type=1生效，1..7
  projectType?: number; // 仅type=2生效，1..8
  published?: boolean; // 是否发布
  isVerified?: boolean; // 是否审核
  ownerUserId?: number; // 拥有者用户ID
  dateStart?: string; // 开始日期 yyyy-MM-dd
  dateEnd?: string; // 结束日期 yyyy-MM-dd
}

/**
 * 创建成果请求参数
 */
export interface CreateAchievementRequest {
  title: string; // 必填，<=500
  titleEn?: string | null; // 可选
  description?: string | null; // 可选
  keywords?: string | null; // 可选，<=1000
  type: 1 | 2; // 必填：1=论文, 2=项目
  paperType?: number | null; // type=1时必填：1=期刊,2=会议,3=预印本,4=专利,5=软著,6=标准,7=专著；type=2时必须null
  projectType?: number | null; // type=2时必填：1=横向,2=国自然面上,3=国自然青年,4=北京市教委科技一般,5=国家级教改,6=省部级教改,7=其他教改,8=其他纵向；type=1时必须null
  venue?: string | null; // 可选，<=300
  publishDate?: string | null; // 仅论文；type=1必填；type=2必须null；格式：YYYY
  projectStartDate?: string | null; // 仅项目；type=2必填；格式：YYYY-MM
  projectEndDate?: string | null; // 仅项目；可空或>=开始；格式：YYYY-MM
  reference?: string | null;
  linkUrl?: string | null;
  gitUrl?: string | null;
  homepageUrl?: string | null;
  pdfUrl?: string | null;
  doi?: string | null;
  fundingAmount?: number | null; // >=0，单位：万元
  published?: boolean | null; // 默认false
  extra?: string | object | null;
  authors?: CreateAuthorRequest[]; // 可选：创建时批量附带作者
}

/**
 * 更新成果请求参数
 */
export interface UpdateAchievementRequest {
  title?: string; // <=500
  titleEn?: string | null;
  description?: string | null;
  keywords?: string | null; // <=1000
  type?: 1 | 2; // 1=论文, 2=项目
  paperType?: number | null; // type=1时必填：1=期刊,2=会议,3=预印本,4=专利,5=软著,6=标准,7=专著；type=2时必须null
  projectType?: number | null; // type=2时必填：1=横向,2=国自然面上,3=国自然青年,4=北京市教委科技一般,5=国家级教改,6=省部级教改,7=其他教改,8=其他纵向；type=1时必须null
  venue?: string | null; // <=300
  publishDate?: string | null; // 仅论文；type=1必填；type=2必须null；格式：YYYY
  projectStartDate?: string | null; // 仅项目；type=2必填；格式：YYYY-MM
  projectEndDate?: string | null; // 仅项目；可空或>=开始；格式：YYYY-MM
  reference?: string | null;
  linkUrl?: string | null;
  gitUrl?: string | null;
  homepageUrl?: string | null;
  pdfUrl?: string | null;
  doi?: string | null;
  fundingAmount?: number | null; // >=0，单位：万元
  published?: boolean | null;
  extra?: string | object | null;
}

/**
 * 成果返回数据结构
 */
export interface LabAchievementDTO {
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
  myVisibility?: boolean; // 我的成果可见性（仅在my-achievements接口中返回）
  authors?: AchievementAuthorDTO[]; // 可选：作者DTO
  extra: string | object | null;
  createTime: string;
  updateTime: string;
}

/**
 * 作者数据结构
 */
export interface AchievementAuthorDTO {
  id: number;
  achievementId: number;
  userId: number | null;
  name: string | null;
  nameEn: string | null;
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
  nameEn?: string | null; // 英文姓名
  affiliation?: string | null;
  authorOrder: number; // 作者顺序（>0，同一成果下唯一）
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
  nameEn?: string | null; // 英文姓名
  affiliation?: string | null;
  authorOrder?: number | null; // 作者顺序（传入时需保证唯一）
  isCorresponding?: boolean | null; // 是否通讯作者
  role?: string | null; // 角色
  visible?: boolean | null; // 仅对内部作者生效
}

/**
 * 我的成果查询参数
 */
export interface MyAchievementQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  type?: 1 | 2;
  paperType?: number; // 1..7
  projectType?: number; // 1..8
  published?: boolean;
  isVerified?: boolean;
  dateStart?: string; // yyyy-MM-dd
  dateEnd?: string; // yyyy-MM-dd
}

/**
 * 公开端成果查询参数
 */
export interface PublicAchievementQuery {
  pageNum?: number; // 页码，默认1
  pageSize?: number; // 每页大小，默认100
  keyword?: string; // 关键词，匹配 title/keywords
  type?: 1 | 2; // 1=论文, 2=项目
  paperType?: number; // 仅type=1生效，1..7
  projectType?: number; // 仅type=2生效，1..8
  dateStart?: string; // 开始日期 yyyy-MM-dd
  dateEnd?: string; // 结束日期 yyyy-MM-dd
}

/**
 * 公开端作者信息
 */
export interface PublicAuthorDTO {
  name: string;
  nameEn: string | null;
  affiliation: string | null;
  authorOrder: number;
  isCorresponding: boolean;
  role: string | null;
}

/**
 * 公开端成果信息
 */
export interface PublicAchievementDTO {
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

// ==================== 成果管理 API ====================

/**
 * 获取成果列表
 */
export const getAchievementListApi = (params?: AchievementListQuery) => {
  return http.request<
    ResponseData<{ total: number; rows: LabAchievementDTO[] }>
  >("get", "/lab/achievements", { params });
};

/**
 * 获取成果详情
 */
export const getAchievementDetailApi = (id: number) => {
  return http.request<LabAchievementDTO>("get", `/lab/achievements/${id}`);
};

/**
 * 创建成果
 */
export const createAchievementApi = (data: CreateAchievementRequest) => {
  return http.request<LabAchievementDTO>("post", "/lab/achievements", {
    data
  });
};

/**
 * 更新成果
 */
export const updateAchievementApi = (
  id: number,
  data: UpdateAchievementRequest
) => {
  return http.request<LabAchievementDTO>("put", `/lab/achievements/${id}`, {
    data
  });
};

/**
 * 删除成果（软删除）
 */
export const deleteAchievementApi = (id: number) => {
  return http.request<void>("delete", `/lab/achievements/${id}`);
};

/**
 * 发布/取消发布成果
 */
export const publishAchievementApi = (id: number, published: boolean) => {
  return http.request<void>("put", `/lab/achievements/${id}/publish`, {
    params: { published }
  });
};

/**
 * 审核/取消审核成果
 */
export const verifyAchievementApi = (id: number, verified: boolean) => {
  return http.request<void>("put", `/lab/achievements/${id}/verify`, {
    params: { verified }
  });
};

// ==================== 作者管理 API ====================

/**
 * 获取成果作者列表
 */
export const getAchievementAuthorsApi = (achievementId: number) => {
  return http.request<AchievementAuthorDTO[]>(
    "get",
    `/lab/achievements/${achievementId}/authors`
  );
};

/**
 * 添加成果作者
 */
export const addAchievementAuthorApi = (
  achievementId: number,
  data: CreateAuthorRequest
) => {
  return http.request<AchievementAuthorDTO>(
    "post",
    `/lab/achievements/${achievementId}/authors`,
    { data }
  );
};

/**
 * 更新成果作者
 */
export const updateAchievementAuthorApi = (
  achievementId: number,
  authorId: number,
  data: UpdateAuthorRequest
) => {
  return http.request<AchievementAuthorDTO>(
    "put",
    `/lab/achievements/${achievementId}/authors/${authorId}`,
    { data }
  );
};

/**
 * 删除成果作者（软删除）
 */
export const deleteAchievementAuthorApi = (
  achievementId: number,
  authorId: number
) => {
  return http.request<void>(
    "delete",
    `/lab/achievements/${achievementId}/authors/${authorId}`
  );
};

/**
 * 调整作者顺序
 */
export const reorderAuthorApi = (
  achievementId: number,
  authorId: number,
  newOrder: number
) => {
  return http.request<void>(
    "put",
    `/lab/achievements/${achievementId}/authors/${authorId}/reorder`,
    { params: { newOrder } }
  );
};

/**
 * 切换作者可见性
 */
export const toggleAuthorVisibilityApi = (
  achievementId: number,
  authorId: number,
  visible: boolean
) => {
  return http.request<void>(
    "put",
    `/lab/achievements/${achievementId}/authors/${authorId}/visibility`,
    { params: { visible } }
  );
};

// ==================== 用户自助端 API ====================

/**
 * 获取我的成果列表
 */
export const getMyAchievementsApi = (params?: MyAchievementQuery) => {
  return http.request<
    ResponseData<{ total: number; rows: LabAchievementDTO[] }>
  >("get", "/lab/my-achievements", { params });
};

/**
 * 切换我的成果可见性
 */
export const toggleMyAchievementVisibilityApi = (
  achievementId: number,
  visible: boolean
) => {
  return http.request<void>(
    "put",
    `/lab/my-achievements/${achievementId}/visibility`,
    { params: { visible } }
  );
};

// ==================== 公开端 API ====================

/**
 * 获取公开成果列表
 */
export const getPublicAchievementsApi = (params?: PublicAchievementQuery) => {
  return http.request<
    ResponseData<{ total: number; rows: PublicAchievementDTO[] }>
  >("get", "/open/achievements", { params });
};

/**
 * 获取公开成果详情
 */
export const getPublicAchievementDetailApi = (id: number) => {
  return http.request<ResponseData<PublicAchievementDTO>>(
    "get",
    `/open/achievements/${id}`
  );
};
