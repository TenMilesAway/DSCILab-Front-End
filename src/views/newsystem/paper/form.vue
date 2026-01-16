<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./rule";
import { ElButton, ElIcon } from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";
import { getDictCategoryTreeApi, type LabAchievementCategoryDTO } from "@/api/newsystem/achievement-category";
import { getProjectListApi, type LabProjectDTO } from "@/api/newsystem/project";
import { searchLabUsersByKeywordApi, type LabUserProfileDTO } from "@/api/newsystem/user";

interface FormAuthor {
  userId?: number | null; // 内部作者userId；外部作者为null
  name: string; // 作者姓名
  authorOrder: number; // 作者顺序
  isCorresponding: boolean; // 是否通讯作者
  visible?: boolean; // 是否可见（仅内部作者）
}

interface FormInlineData {
  id?: number;
  title: string;
  authors: FormAuthor[];
  achievementType: string;
  paperType?: number;
  projectType?: number;
  categoryId?: number;
  journal?: string;
  publishDate?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  doi?: string;
  githubUrl?: string;
  published?: boolean;
  gitUrl?: string;
  linkUrl?: string;
  pdfUrl?: string;
  fundingAmount?: number;
  projectIds?: number[];
}

interface FormProps {
  formInline: FormInlineData;
}

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: 0,
    title: "",
    authors: [
      {
        name: "",
        authorOrder: 1,
        isCorresponding: false,
        visible: true,
        userId: null
      }
    ],
    achievementType: "paper",
    paperType: undefined,
    projectType: undefined,
    categoryId: undefined,
    journal: "",
    publishDate: "",
    projectEndDate: "",
    doi: "",
    githubUrl: "",
    published: true,
    gitUrl: "",
    linkUrl: "",
    pdfUrl: "",
    fundingAmount: undefined
  })
});

const newFormInline = ref(props.formInline);
const formRuleRef = ref();

// 成果类型相关数据
const categoryTree = ref<LabAchievementCategoryDTO[]>([]);
const topLevelCategories = ref<LabAchievementCategoryDTO[]>([]);
const secondLevelCategories = ref<LabAchievementCategoryDTO[]>([]);
const defaultParentId = 1;

const projectOptions = ref<{ label: string; value: number }[]>([]);
const projectLoading = ref(false);

const searchProjects = async (query: string) => {
  const q = (query || "").trim();
  if (!q) {
    return;
  }
  projectLoading.value = true;
  try {
    const res = await getProjectListApi({
      pageNum: 1,
      pageSize: 1000,
      keyword: q
    } as any);
    const rows = res.data.rows || [];
    const options = rows.map(p => ({
      label: p.title,
      value: p.id
    }));
    projectOptions.value = options;
  } catch (error) {
    console.error("搜索项目失败:", error);
  } finally {
    projectLoading.value = false;
  }
};

const loadInitialProjectOptions = async () => {
  const ids = newFormInline.value.projectIds;
  if (!Array.isArray(ids) || ids.length === 0) {
    return;
  }
  try {
    const res = await getProjectListApi({
      pageNum: 1,
      pageSize: 1000
    } as any);
    const rows = res.data.rows || [];
    const idSet = new Set(ids);
    const selectedRows = rows.filter(p => idSet.has(p.id));
    projectOptions.value = selectedRows.map(p => ({
      label: p.title,
      value: p.id
    }));
  } catch (error) {
    console.error("初始化关联项目选项失败:", error);
  }
};

// 获取成果类型树
const loadCategoryTree = async () => {
  try {
    const response = await getDictCategoryTreeApi();
    if (response.code === 0) {
      categoryTree.value = response.data;
      // 隐藏“项目”这一项，其余一级成果类型保持显示
      topLevelCategories.value = response.data.filter(
        cat => cat.categoryName !== '项目' && (cat.categoryCode ? cat.categoryCode.toLowerCase() !== 'project' : true)
      );
      const parent = categoryTree.value.find(c => c.id === defaultParentId);
      secondLevelCategories.value = parent?.children || [];
      
      // 数据加载完成后，如果是编辑模式且有categoryId，需要初始化相关字段
      if (newFormInline.value.categoryId) {
        handleCategoryChange(newFormInline.value.categoryId);
      }
    }
  } catch (error) {
    console.error('获取成果类型失败:', error);
  }
};

// 处理成果类型变化
const handleCategoryChange = (categoryId: number) => {
  if (!categoryId) {
    newFormInline.value.achievementType = 'paper';
    return;
  }

  // 查找选中的类型及其父类型
  let selectedCategory: LabAchievementCategoryDTO | undefined;
  let parentCategory: LabAchievementCategoryDTO | undefined;
  
  // 先查找是否为一级类型
  selectedCategory = categoryTree.value.find(cat => cat.id === categoryId);
  
  if (!selectedCategory) {
    // 如果不是一级类型，查找是否为二级类型
    for (const topCategory of categoryTree.value) {
      if (topCategory.children) {
        const foundChild = topCategory.children.find(child => child.id === categoryId);
        if (foundChild) {
          selectedCategory = foundChild;
          parentCategory = topCategory;
          break;
        }
      }
    }
  }
  
  if (selectedCategory) {
    // 确定根类型以设置achievementType
    const rootCategory = parentCategory || selectedCategory;
    const categoryName = rootCategory.categoryName;
    
    if (categoryName === '论文') {
      newFormInline.value.achievementType = 'paper';
    } else if (categoryName === '项目') {
      newFormInline.value.achievementType = 'project';
    } else {
      newFormInline.value.achievementType = 'other';
    }
  }
};

// 监听类型变化
watch(() => newFormInline.value.categoryId, (newCategoryId) => {
  handleCategoryChange(newCategoryId);
});

onMounted(() => {
  loadCategoryTree();
  loadInitialProjectOptions();
});

function getFormRuleRef() {
  return formRuleRef.value;
}

// 作者管理方法
const addAuthor = () => {
  const newOrder = newFormInline.value.authors.length + 1;
  newFormInline.value.authors.push({
    name: "",
    authorOrder: newOrder,
    isCorresponding: false,
    visible: true,
    userId: null
  });
};

const removeAuthor = (index: number) => {
  if (newFormInline.value.authors.length > 1) {
    newFormInline.value.authors.splice(index, 1);
    // 重新排序
    newFormInline.value.authors.forEach((author, idx) => {
      author.authorOrder = idx + 1;
    });
  }
};

const moveAuthorUp = (index: number) => {
  if (index > 0) {
    const authors = newFormInline.value.authors;
    [authors[index], authors[index - 1]] = [authors[index - 1], authors[index]];
    // 重新排序
    authors.forEach((author, idx) => {
      author.authorOrder = idx + 1;
    });
  }
};

const moveAuthorDown = (index: number) => {
  const authors = newFormInline.value.authors;
  if (index < authors.length - 1) {
    [authors[index], authors[index + 1]] = [authors[index + 1], authors[index]];
    // 重新排序
    authors.forEach((author, idx) => {
      author.authorOrder = idx + 1;
    });
  }
};

async function fetchUserSuggest(query: string, cb: (results: Array<{ value: string; id: number; username?: string; englishName?: string | null }>) => void) {
  const q = (query || "").trim();
  if (!q) {
    cb([]);
    return;
  }
  try {
    const res = await searchLabUsersByKeywordApi(q);
    const list: LabUserProfileDTO[] = res.code === 0 ? (res.data || []) : [];
    cb(
      list.map(u => ({
        value: u.realName,
        id: u.id,
        username: u.username,
        englishName: u.englishName
      }))
    );
  } catch {
    cb([]);
  }
}

function onUserSelect(index: number, item: { value: string; id: number }) {
  const a = newFormInline.value.authors[index];
  a.userId = item.id;
  a.name = item.value;
}

function onUserClear(index: number) {
  const a = newFormInline.value.authors[index];
  a.userId = null;
}

defineExpose({ getFormRuleRef });
</script>

<template>
  <el-form
    ref="formRuleRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <!-- 基本信息 -->
      <re-col :value="24">
        <el-form-item label="成果名称" prop="title">
          <el-input
            v-model="newFormInline.title"
            clearable
            placeholder="请输入成果名称"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="成果类型" prop="categoryId">
          <el-select
            class="w-full"
            v-model="newFormInline.categoryId"
            placeholder="请选择成果类型"
            clearable
          >
            <el-option
              v-for="category in secondLevelCategories"
              :key="category.id"
              :label="category.categoryName"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <!-- 作者管理 -->
      <re-col :value="24">
        <el-form-item
          :label="
            newFormInline.achievementType === 'project'
              ? '参与人信息'
              : '作者信息'
          "
          class="author-form-item"
        >
          <div class="authors-container">
            <div
              v-for="(author, index) in newFormInline.authors"
              :key="index"
              class="author-item"
            >
              <div class="author-header">
                <span class="author-order">
                  <span v-if="newFormInline.achievementType === 'project'">
                    {{ index === 0 ? "负责人" : "参与人" }}
                  </span>
                  <span v-else>
                    第{{ index + 1 }}作者
                  </span>
                </span>
                <div class="author-actions">
                  <el-button
                    v-if="index > 0"
                    size="small"
                    type="text"
                    @click="moveAuthorUp(index)"
                  >
                    ↑
                  </el-button>
                  <el-button
                    v-if="index < newFormInline.authors.length - 1"
                    size="small"
                    type="text"
                    @click="moveAuthorDown(index)"
                  >
                    ↓
                  </el-button>
                  <el-button
                    v-if="newFormInline.authors.length > 1"
                    size="small"
                    type="danger"
                    @click="removeAuthor(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="author-fields">
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-form-item
                      :prop="`authors.${index}.name`"
                    >
                      <el-autocomplete
                        v-model="author.name"
                        :fetch-suggestions="fetchUserSuggest"
                        placeholder="作者姓名"
                        class="w-full"
                        clearable
                        @select="item => onUserSelect(index, item)"
                        @clear="onUserClear(index)"
                      />
                    </el-form-item>
                  </el-col>

                </el-row>
                <el-row
                  :gutter="16"
                  v-if="newFormInline.achievementType === 'paper' || newFormInline.achievementType === 'other'"
                >

                  <el-col :span="8">
                    <el-form-item>
                      <el-checkbox v-model="author.isCorresponding">
                        通讯作者
                      </el-checkbox>
                    </el-form-item>
                  </el-col>
                  <!-- <el-col :span="8">
                    <el-form-item>
                      <el-checkbox v-model="author.visible">
                        公开显示
                      </el-checkbox>
                    </el-form-item>
                  </el-col> -->
                </el-row>
              </div>
            </div>
            <el-button
              type="primary"
              plain
              @click="addAuthor"
              class="add-author-btn"
            >
              <el-icon><Plus /></el-icon>
              {{
                newFormInline.achievementType === "project"
                  ? "添加参与人"
                  : "添加作者"
              }}
            </el-button>
          </div>
        </el-form-item>
      </re-col>

      <re-col
        :value="12"
        v-if="newFormInline.achievementType === 'paper' || newFormInline.achievementType === 'other'"
      >
        <el-form-item
          label="机构名称"
          prop="journal"
        >
          <el-input
            v-model="newFormInline.journal"
            clearable
            :placeholder="newFormInline.achievementType === 'paper' ? '请输入例如期刊或会议名称' : '请输入相关机构名称'"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item
          :label="
            newFormInline.achievementType === 'project' ? '开始日期' : '发布时间'
          "
          :prop="newFormInline.achievementType === 'project' ? 'projectStartDate' : 'publishDate'"
        >
          <el-date-picker
            v-if="newFormInline.achievementType === 'paper' || newFormInline.achievementType === 'other'"
            v-model="newFormInline.publishDate"
            type="date"
            placeholder="请选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
          <el-date-picker
            v-else
            v-model="newFormInline.projectStartDate"
            type="month"
            placeholder="请选择年月"
            format="YYYY-MM"
            value-format="YYYY-MM"
            class="w-full"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" v-if="newFormInline.achievementType === 'project'">
        <el-form-item label="结束日期" prop="projectEndDate">
          <el-date-picker
            v-model="newFormInline.projectEndDate"
            type="month"
            placeholder="请选择年月"
            format="YYYY-MM"
            value-format="YYYY-MM"
            class="w-full"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" v-if="newFormInline.achievementType === 'project'">
        <el-form-item label="项目经费（万元）" prop="fundingAmount">
          <el-input-number
            v-model="newFormInline.fundingAmount"
            :min="0"
            :precision="2"
            placeholder="请输入项目经费"
            class="w-full"
          />
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item
          label="编号"
          prop="doi"
        >
          <el-input
            v-model="newFormInline.doi"
            clearable
            placeholder="请输入相关编号（如DOI、专利号、软著登记号、项目编号等）"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="Git链接" prop="gitUrl">
          <el-input
            v-model="newFormInline.gitUrl"
            clearable
            placeholder="请输入Git链接"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="相关链接" prop="linkUrl">
          <el-input
            v-model="newFormInline.linkUrl"
            clearable
            placeholder="请输入相关链接"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="PDF链接" prop="pdfUrl">
          <el-input
            v-model="newFormInline.pdfUrl"
            clearable
            placeholder="请输入PDF链接"
          />
        </el-form-item>
      </re-col>

      <re-col :value="24" v-if="newFormInline.achievementType === 'paper'">
        <el-form-item label="关联项目">
          <el-select
            v-model="newFormInline.projectIds"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词搜索关联项目"
            :remote-method="searchProjects"
            :loading="projectLoading"
            class="w-full"
          >
            <el-option
              v-for="opt in projectOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </re-col>

    </el-row>
  </el-form>
</template>

<style scoped lang="scss">
:deep(.el-input-number) {
  width: 100%;
}

.authors-container {
  width: 100%;
}

.author-item {
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.author-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.author-order {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

.author-actions {
  display: flex;
  gap: 4px;
}

.author-fields {
  margin-top: 12px;
}

.add-author-btn {
  width: 100%;
  margin-top: 8px;
  border-style: dashed;
}

.add-author-btn:hover {
  color: #409eff;
  border-color: #409eff;
}

/* 确保作者信息标签字体加粗，与其他表单标签保持一致 */
.author-form-item :deep(.el-form-item__label) {
  font-weight: 700 !important;
}
</style>
