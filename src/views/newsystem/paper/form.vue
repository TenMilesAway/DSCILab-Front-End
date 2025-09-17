<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./rule";
import { ElButton, ElIcon } from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";
import { getCategoryTreeApi, type LabAchievementCategoryDTO } from "@/api/newsystem/achievement-category";

interface FormAuthor {
  userId?: number | null; // 内部作者userId；外部作者为null
  name: string; // 作者姓名
  nameEn?: string | null; // 英文姓名
  authorOrder: number; // 作者顺序
  isCorresponding: boolean; // 是否通讯作者
  visible?: boolean; // 是否可见（仅内部作者）
}

interface FormInlineData {
  id?: number;
  title: string; // 成果标题
  authors: FormAuthor[]; // 作者列表
  achievementType: string; // 成果类型：paper/project
  paperType?: number; // 论文类型：1=期刊,2=会议,3=预印本,4=专利,5=软著,6=标准,7=专著
  projectType?: number; // 项目类型：1=横向,2=国自然面上,3=国自然青年,4=北京市教委科技一般,5=国家级教改,6=省部级教改,7=其他教改,8=其他纵向
  categoryId?: number; // 成果类型ID（新类型系统）
  journal?: string; // 期刊名称（论文）
  publishDate?: string; // 发表日期
  projectStartDate?: string; // 项目开始日期（项目）
  projectEndDate?: string; // 项目结束日期（项目）
  doi?: string; // DOI

  githubUrl?: string; // GitHub链接（项目）
  published?: boolean; // 发表状态：论文是否发表/项目是否结项
  gitUrl?: string; // Git链接
  linkUrl?: string; // 相关链接
  pdfUrl?: string; // PDF链接
  reference?: string; // 前端展示引用
  fundingAmount?: number; // 项目经费（万元）
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
        nameEn: null,
        authorOrder: 1,
        isCorresponding: true,
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
    reference: "",
    fundingAmount: undefined
  })
});

const newFormInline = ref(props.formInline);
const formRuleRef = ref();

// 成果类型相关数据
const categoryTree = ref<LabAchievementCategoryDTO[]>([]);
const paperCategories = ref<LabAchievementCategoryDTO[]>([]);
const projectCategories = ref<LabAchievementCategoryDTO[]>([]);

// 获取成果类型树
const loadCategoryTree = async () => {
  try {
    const response = await getCategoryTreeApi(false);
    if (response.code === 0) {
      categoryTree.value = response.data;
      
      // 分离论文和项目类型
      categoryTree.value.forEach(category => {
        if (category.categoryCode === 'PAPER' && category.children) {
          paperCategories.value = category.children;
        } else if (category.categoryCode === 'PROJECT' && category.children) {
          projectCategories.value = category.children;
        }
      });
    }
  } catch (error) {
    console.error('获取成果类型失败:', error);
  }
};

// 当前可选的类型列表
const currentCategories = computed(() => {
  return newFormInline.value.achievementType === 'paper' 
    ? paperCategories.value 
    : projectCategories.value;
});

// 监听成果类型变化，重置二级类型选择
watch(() => newFormInline.value.achievementType, (newType, oldType) => {
  if (newType !== oldType && oldType) {
    // 切换成果类型时重置categoryId
    newFormInline.value.categoryId = undefined;
  }
});

onMounted(() => {
  loadCategoryTree();
});

function getFormRuleRef() {
  return formRuleRef.value;
}

// 作者管理方法
const addAuthor = () => {
  const newOrder = newFormInline.value.authors.length + 1;
  newFormInline.value.authors.push({
    name: "",
    nameEn: null,
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
        <el-form-item label="成果类型" prop="achievementType">
          <el-select
            class="w-full"
            v-model="newFormInline.achievementType"
            placeholder="请选择成果类型"
          >
            <el-option label="论文、专利等" value="paper" />
            <el-option label="项目" value="project" />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12" v-if="newFormInline.achievementType === 'paper'">
        <el-form-item label="论文类型" prop="categoryId">
          <el-select
            class="w-full"
            v-model="newFormInline.categoryId"
            placeholder="请选择论文类型"
          >
            <el-option 
              v-for="category in currentCategories" 
              :key="category.id"
              :label="category.categoryName" 
              :value="category.id" 
            />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12" v-if="newFormInline.achievementType === 'project'">
        <el-form-item label="项目类型" prop="categoryId">
          <el-select
            class="w-full"
            v-model="newFormInline.categoryId"
            placeholder="请选择项目类型"
          >
            <el-option 
              v-for="category in currentCategories" 
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
            newFormInline.achievementType === 'paper'
              ? '作者信息'
              : '参与人信息'
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
                  <span v-if="newFormInline.achievementType === 'paper'">
                    第{{ index + 1 }}作者
                  </span>
                  <span v-else>
                    {{ index === 0 ? "负责人" : "参与人" }}
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
                      <el-input
                        v-model="author.name"
                        placeholder="作者姓名"
                        clearable
                      />
                    </el-form-item>
                  </el-col>
                  <el-col
                    :span="8"
                    v-if="newFormInline.achievementType === 'paper'"
                  >
                    <el-form-item>
                      <el-input
                        v-model="author.nameEn"
                        placeholder="英文姓名（可选）"
                        clearable
                      />
                    </el-form-item>
                  </el-col>

                </el-row>
                <el-row
                  :gutter="16"
                  v-if="newFormInline.achievementType === 'paper'"
                >

                  <el-col :span="8">
                    <el-form-item>
                      <el-checkbox v-model="author.isCorresponding">
                        通讯作者
                      </el-checkbox>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item>
                      <el-checkbox v-model="author.visible">
                        公开显示
                      </el-checkbox>
                    </el-form-item>
                  </el-col>
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
                newFormInline.achievementType === "paper"
                  ? "添加作者"
                  : "添加参与人"
              }}
            </el-button>
          </div>
        </el-form-item>
      </re-col>

      <re-col
        :value="12"
        v-if="newFormInline.achievementType === 'paper'"
      >
        <el-form-item
          label="机构名称"
          prop="journal"
        >
          <el-input
            v-model="newFormInline.journal"
            clearable
            placeholder="请输入例如期刊或会议名称"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item
          :label="
            newFormInline.achievementType === 'paper' ? '发表年份' : '开始日期'
          "
          prop="publishDate"
        >
          <el-date-picker
            v-if="newFormInline.achievementType === 'paper'"
            v-model="newFormInline.publishDate"
            type="year"
            placeholder="请选择年份"
            format="YYYY"
            value-format="YYYY"
            class="w-full"
          />
          <el-date-picker
            v-else
            v-model="newFormInline.publishDate"
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

      <re-col :value="12" v-if="newFormInline.achievementType === 'paper'">
        <el-form-item
          label="编号"
          prop="doi"
        >
          <el-input
            v-model="newFormInline.doi"
            clearable
            placeholder="请输入论文doi或专利、软著等编号"
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

      <re-col :value="24">
        <el-form-item label="前端展示引用" prop="reference" style="white-space: nowrap;">
          <el-input
            v-model="newFormInline.reference"
            clearable
            placeholder="请输入用于在前端页面进行展示的成果引用格式"
          />
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
