<template>
  <div class="tree-view">
    <div class="tree-header">
      <el-button
        type="primary"
        :icon="useRenderIcon(AddFill)"
        @click="openDialog('新增一级类型')"
      >
        新增一级类型
      </el-button>
      <el-button
        type="success"
        :icon="useRenderIcon(AddFill)"
        @click="openDialog('新增二级类型')"
        :disabled="!selectedParentId"
      >
        新增二级类型
      </el-button>
      <el-button
        :icon="useRenderIcon(Refresh)"
        @click="refreshTree"
      >
        刷新
      </el-button>
    </div>

    <div class="tree-content">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        :expand-on-click-node="false"
        :highlight-current="true"
        node-key="id"
        class="category-tree"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <div class="node-content">
              <el-icon v-if="data.icon" class="node-icon">
                <component :is="data.icon" />
              </el-icon>
              <span class="node-label">{{ data.categoryName }}</span>
              <el-tag
                v-if="!data.isActive"
                type="danger"
                size="small"
                class="ml-2"
              >
                禁用
              </el-tag>
              <el-tag
                v-if="data.isSystem"
                type="info"
                size="small"
                class="ml-2"
              >
                系统
              </el-tag>
            </div>
            <div class="node-actions">
              <el-button
                link
                type="primary"
                size="small"
                @click.stop="openDialog('编辑', data)"
                :disabled="data.isSystem"
              >
                编辑
              </el-button>
              <el-button
                link
                :type="data.isActive ? 'warning' : 'success'"
                size="small"
                @click.stop="toggleStatus(data)"
                :disabled="data.isSystem"
              >
                {{ data.isActive ? '禁用' : '启用' }}
              </el-button>
              <el-popconfirm
                title="是否确认删除?"
                @confirm="handleDelete(data)"
                :disabled="data.isSystem"
              >
                <template #reference>
                  <el-button
                    link
                    type="danger"
                    size="small"
                    :disabled="data.isSystem"
                    @click.stop
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dialogFormRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >

        <el-form-item label="类型名称" prop="categoryName">
          <el-input
            v-model="formData.categoryName"
            placeholder="请输入类型名称"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="英文名称" prop="categoryNameEn">
          <el-input
            v-model="formData.categoryNameEn"
            placeholder="请输入英文名称"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item 
          v-if="dialogTitle.includes('二级') || (formData.parentId && formData.parentId > 0)"
          label="父级类型" 
          prop="parentId"
        >
          <el-select
            v-model="formData.parentId"
            placeholder="请选择父级类型"
            class="w-full"
          >
            <el-option
              v-for="category in topLevelCategories"
              :key="category.id"
              :label="category.categoryName"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
            maxlength="500"
          />
        </el-form-item>
        <el-form-item label="排序号" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            :max="9999"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch
            v-model="formData.isActive"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  getCategoryTreeApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  toggleCategoryStatusApi,
  type LabAchievementCategoryDTO,
  type CreateCategoryCommand,
  type UpdateCategoryCommand
} from "@/api/newsystem/achievement-category";

import AddFill from "@iconify-icons/ri/add-circle-line";
import Refresh from "@iconify-icons/ep/refresh";

defineOptions({
  name: "AchievementCategoryTree"
});

// 树形数据
const treeRef = ref();
const treeData = ref<LabAchievementCategoryDTO[]>([]);
const selectedParentId = ref<number | null>(null);

// 树形配置
const treeProps = {
  children: 'children',
  label: 'categoryName'
};

// 对话框状态
const dialogVisible = ref(false);
const dialogTitle = ref("");
const submitLoading = ref(false);
const currentEditId = ref<number | null>(null);
const dialogFormRef = ref();

// 表单数据
const formData = reactive<CreateCategoryCommand & { id?: number }>({
  parentId: null,
  categoryCode: "",
  categoryName: "",
  categoryNameEn: "",
  description: "",
  sortOrder: 0,
  isActive: true,
  icon: "",
  color: ""
});

// 表单验证规则
const formRules = {
  categoryCode: [
    { required: true, message: "请输入类型编码", trigger: "blur" },
    { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" }
  ],
  categoryName: [
    { required: true, message: "请输入类型名称", trigger: "blur" },
    { min: 1, max: 100, message: "长度在 1 到 100 个字符", trigger: "blur" }
  ],
  categoryNameEn: [
    { max: 200, message: "长度不能超过 200 个字符", trigger: "blur" }
  ],
  description: [
    { max: 500, message: "长度不能超过 500 个字符", trigger: "blur" }
  ],
  sortOrder: [
    { required: true, message: "请输入排序号", trigger: "blur" },
    { type: "number", min: 0, max: 9999, message: "排序号范围 0-9999", trigger: "blur" }
  ]
};

// 顶级类型列表
const topLevelCategories = computed(() => {
  return treeData.value.filter(item => !item.parentId);
});

// 获取树形数据
const getTreeData = async () => {
  try {
    const { data } = await getCategoryTreeApi(true);
    treeData.value = data;
  } catch (error) {
    console.error("获取树形数据失败:", error);
    ElMessage.error("获取数据失败");
  }
};

// 刷新树形数据
const refreshTree = () => {
  getTreeData();
};

// 节点点击事件
const handleNodeClick = (data: LabAchievementCategoryDTO) => {
  if (!data.parentId) {
    // 点击一级类型，设置为选中的父级
    selectedParentId.value = data.id;
  } else {
    // 点击二级类型，选中其父级
    selectedParentId.value = data.parentId;
  }
};

// 重置表单数据
const resetFormData = () => {
  Object.assign(formData, {
    parentId: null,
    categoryCode: "",
    categoryName: "",
    categoryNameEn: "",
    description: "",
    sortOrder: 0,
    isActive: true,
    icon: "",
    color: ""
  });
  currentEditId.value = null;
};

// 打开对话框
const openDialog = (title: string, row?: LabAchievementCategoryDTO) => {
  dialogTitle.value = title;
  dialogVisible.value = true;
  
  if (row) {
    // 编辑模式
    currentEditId.value = row.id;
    Object.assign(formData, {
      parentId: row.parentId,
      categoryCode: row.categoryCode,
      categoryName: row.categoryName,
      categoryNameEn: row.categoryNameEn || "",
      description: row.description || "",
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      icon: row.icon || "",
      color: row.color || ""
    });
  } else {
    // 新增模式
    resetFormData();
    if (title.includes("二级")) {
      // 新增二级类型时，使用选中的父级
      formData.parentId = selectedParentId.value;
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!dialogFormRef.value) return;
  
  try {
    await dialogFormRef.value.validate();
    submitLoading.value = true;
    
    if (currentEditId.value) {
      // 编辑
      const updateData: UpdateCategoryCommand = {
        parentId: formData.parentId,
        categoryCode: formData.categoryCode,
        categoryName: formData.categoryName,
        categoryNameEn: formData.categoryNameEn,
        description: formData.description,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
        icon: formData.icon,
        color: formData.color
      };
      await updateCategoryApi(currentEditId.value, updateData);
      ElMessage.success("更新成功");
    } else {
      // 新增
      const createData: CreateCategoryCommand = {
        parentId: formData.parentId,
        categoryCode: formData.categoryCode,
        categoryName: formData.categoryName,
        categoryNameEn: formData.categoryNameEn,
        description: formData.description,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
        icon: formData.icon,
        color: formData.color
      };
      await createCategoryApi(createData);
      ElMessage.success("创建成功");
    }
    
    dialogVisible.value = false;
    getTreeData();
  } catch (error) {
    console.error("提交失败:", error);
    ElMessage.error("操作失败");
  } finally {
    submitLoading.value = false;
  }
};

// 删除
const handleDelete = async (row: LabAchievementCategoryDTO) => {
  try {
    await deleteCategoryApi(row.id);
    ElMessage.success("删除成功");
    getTreeData();
  } catch (error) {
    console.error("删除失败:", error);
    ElMessage.error("删除失败");
  }
};

// 切换状态
const toggleStatus = async (row: LabAchievementCategoryDTO) => {
  try {
    await toggleCategoryStatusApi(row.id, !row.isActive);
    ElMessage.success(`${!row.isActive ? '启用' : '禁用'}成功`);
    getTreeData();
  } catch (error) {
    console.error("状态切换失败:", error);
    ElMessage.error("操作失败");
  }
};

// 初始化
onMounted(() => {
  getTreeData();
});
</script>

<style scoped lang="scss">
.tree-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tree-header {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  gap: 12px;
}

.tree-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.category-tree {
  :deep(.el-tree-node__content) {
    height: auto;
    padding: 8px 0;
  }
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 8px;
  
  &:hover {
    .node-actions {
      opacity: 1;
    }
  }
}

.node-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.node-icon {
  margin-right: 8px;
  color: var(--el-color-primary);
}

.node-label {
  font-weight: 500;
}

.node-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}
</style>