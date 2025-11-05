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
  getList
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
      paperCategories.value = categoryTree.value.filter(cat => cat.type === 1);
      projectCategories.value = categoryTree.value.filter(cat => cat.type === 2);
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
      <!-- 已隐藏：项目类型筛选（默认在钩子中按“项目”进行筛选） -->
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
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              size="default"
              @click="openDialog('编辑', row)"
              :icon="useRenderIcon(EditPen)"
            >
              修改
            </el-button>
            <el-popconfirm title="是否确认删除?" @confirm="handleDelete(row)">
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="danger"
                  size="default"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
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