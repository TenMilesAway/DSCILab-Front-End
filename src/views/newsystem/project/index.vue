<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useHook } from "./hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { getDictCategoryTreeApi, type LabAchievementCategoryDTO } from "@/api/newsystem/achievement-category";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";

defineOptions({
  name: "NewSystemProject"
});

const formRef = ref();
const {
  searchFormParams,
  pageLoading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleDelete,
  openDialog,
  getList,
  isAchievementDialogOpen,
  relatedAchievements
} = useHook();

// 项目类型相关数据
const categoryTree = ref<LabAchievementCategoryDTO[]>([]);
const topLevelCategories = ref<LabAchievementCategoryDTO[]>([]);
const paperCategories = ref<LabAchievementCategoryDTO[]>([]);
const projectCategories = ref<LabAchievementCategoryDTO[]>([]);

// 获取项目类型树
const loadCategoryTree = async () => {
  try {
    const response = await getDictCategoryTreeApi();
    if (response.code === 0) {
      categoryTree.value = response.data;
      topLevelCategories.value = response.data; // 一级项目类型
      
      // 按ID筛选，一级默认是2（项目）
      const paperRoot = categoryTree.value.find(cat => cat.id === 1);
      const projectRoot = categoryTree.value.find(cat => cat.id === 2);
      
      paperCategories.value = paperRoot?.children || [];
      projectCategories.value = projectRoot?.children || [];
    }
  } catch (error) {
    console.error('获取项目类型失败:', error);
  }
};

onMounted(() => {
  loadCategoryTree();
});
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-full pl-8 pt-[12px]"
    >
      <el-form-item label="关键词：" prop="keyword">
        <el-input
          v-model="searchFormParams.keyword"
          placeholder="请输入项目名称关键词"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <!-- 项目类型筛选 -->
      <el-form-item label="项目类型：" prop="categoryId">
        <el-select
          v-model="searchFormParams.categoryId"
          placeholder="请选择项目类型"
          clearable
          class="!w-[200px]"
        >
          <el-option
            v-for="item in projectCategories"
            :key="item.id"
            :label="item.categoryName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="pageLoading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar
      title="项目管理"
      :columns="columns"
      :showDensity="false"
      :showColumnSetting="false"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('新增')"
        >
          新增项目
        </el-button>
      </template>
      <template v-slot="{ dynamicColumns }">
        <pure-table
          border
          adaptive
          align-whole="center"
          table-layout="auto"
          :loading="pageLoading"
          size="default"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="false"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="getList"
          @page-current-change="getList"
        >
        </pure-table>
      </template>
    </PureTableBar>

    <el-dialog
      v-model="isAchievementDialogOpen"
      title="项目关联成果"
      width="800px"
      align-center
    >
      <el-table :data="relatedAchievements" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="成果名称" show-overflow-tooltip />
        <el-table-column label="作者" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.authors?.map((a: any) => a.name).join(', ') || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="类型" width="120" align="center" />
        <el-table-column prop="publishDate" label="时间" width="120" align="center" />
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isAchievementDialogOpen = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>