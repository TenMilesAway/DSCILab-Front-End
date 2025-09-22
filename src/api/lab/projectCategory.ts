import { http } from "@/utils/http";

/**
 * 项目分类数据结构
 */
export interface ProjectCategoryDTO {
  id: number;
  parentId: number | null;
  categoryCode: string;
  categoryName: string;
  categoryNameEn: string | null;
  description: string | null;
  sortOrder: number;
  isSystem: boolean;
  isActive: boolean;
  icon: string | null;
  color: string | null;
  parentName: string | null;
  createTime: string;
  updateTime: string;
  children: ProjectCategoryDTO[];
  canDelete: boolean;
  canEdit: boolean;
  hasChildren: boolean;
  isUsed: boolean | null;
  topLevel: boolean;
  level: number;
  secondLevel: boolean;
  fullPath: string;
}

/**
 * 获取项目分类列表
 */
export const getProjectCategoriesApi = (parentId?: number) => {
  return http.request<ResponseData<ProjectCategoryDTO[]>>(
    "get", 
    "/open/achievement-categories/children", 
    { params: parentId ? { parentId } : {} }
  );
};