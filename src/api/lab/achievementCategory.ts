import { http } from "@/utils/http";

/**
 * 成果分类数据结构
 */
export interface AchievementCategoryDTO {
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
  children: AchievementCategoryDTO[];
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
 * 获取成果分类列表
 */
export const getAchievementCategoriesApi = (parentId?: number) => {
  return http.request<ResponseData<AchievementCategoryDTO[]>>(
    "get", 
    "/open/achievement-categories/children", 
    { params: parentId ? { parentId } : {} }
  );
};