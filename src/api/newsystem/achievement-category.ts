import { http } from "@/utils/http";

// 成果类型DTO
export interface LabAchievementCategoryDTO {
  id: number;
  parentId?: number | null;
  categoryCode: string;
  categoryName: string;
  categoryNameEn?: string | null;
  description?: string | null;
  sortOrder: number;
  isSystem: boolean;
  isActive: boolean;
  icon?: string | null;
  color?: string | null;
  parentName?: string | null;
  children?: LabAchievementCategoryDTO[];
}

// 创建类型命令
export interface CreateCategoryCommand {
  parentId?: number | null;
  categoryName: string;
  categoryNameEn?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  icon?: string;
  color?: string;
}

// 更新类型命令
export interface UpdateCategoryCommand {
  parentId?: number | null;
  categoryCode?: string;
  categoryName?: string;
  categoryNameEn?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  icon?: string;
  color?: string;
}

// 批量排序命令
export interface BatchUpdateSortCommand {
  items: Array<{
    id: number;
    sortOrder: number;
  }>;
}

// 查询参数
export interface CategoryListQuery {
  keyword?: string;
  parentId?: number | null;
  isActive?: boolean;
  isSystem?: boolean;
  categoryCode?: string;
  includeChildren?: boolean;
  topLevelOnly?: boolean;
  secondLevelOnly?: boolean;
  pageNum?: number;
  pageSize?: number;
}

// 分页结果
export interface PageDTO<T> {
  total: number;
  pageNum: number;
  pageSize: number;
  list: T[];
}

// API 接口

/**
 * 获取类型树
 * @param includeInactive 是否包含未启用的类型
 */
export const getCategoryTreeApi = (includeInactive = false) => {
  return http.request<LabAchievementCategoryDTO[]>(
    "get",
    `/lab/achievement-categories?includeInactive=${includeInactive}`
  );
};

/**
 * 分页查询类型列表
 */
export const getCategoryListApi = (params: CategoryListQuery) => {
  return http.request<PageDTO<LabAchievementCategoryDTO>>(
    "get",
    "/lab/achievement-categories/list",
    { params }
  );
};

/**
 * 获取类型详情
 */
export const getCategoryDetailApi = (id: number) => {
  return http.request<LabAchievementCategoryDTO>(
    "get",
    `/lab/achievement-categories/${id}`
  );
};

/**
 * 创建类型
 */
export const createCategoryApi = (data: CreateCategoryCommand) => {
  return http.request<number>("post", "/lab/achievement-categories", { data });
};

/**
 * 更新类型
 */
export const updateCategoryApi = (id: number, data: UpdateCategoryCommand) => {
  return http.request<void>("put", `/lab/achievement-categories/${id}`, { data });
};

/**
 * 启用/禁用类型
 */
export const toggleCategoryStatusApi = (id: number, active: boolean) => {
  return http.request<void>(
    "put",
    `/lab/achievement-categories/${id}/status?active=${active}`
  );
};

/**
 * 批量更新排序
 */
export const batchUpdateSortApi = (data: BatchUpdateSortCommand) => {
  return http.request<void>("put", "/lab/achievement-categories/batch/sort", { data });
};

/**
 * 删除类型
 */
export const deleteCategoryApi = (id: number) => {
  return http.request<void>("delete", `/lab/achievement-categories/${id}`);
};