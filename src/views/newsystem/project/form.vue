<script setup lang="ts">
import { ref, onMounted } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./rule";
import { ElButton, ElIcon } from "element-plus";
import { searchLabUsersByKeywordApi, type LabUserProfileDTO } from "@/api/newsystem/user";
import { Plus, Delete } from "@element-plus/icons-vue";
import { getDictCategoryTreeApi, type LabAchievementCategoryDTO } from "@/api/newsystem/achievement-category";

interface FormAuthor {
  userId?: number | null; // 内部作者userId；外部作者为null
  name: string; // 作者姓名
  authorOrder: number; // 作者顺序
  isCorresponding: boolean; // 是否通讯作者
  isLeader: boolean; // 是否负责人（项目）
  visible?: boolean; // 是否可见（仅内部作者）
}

interface FormInlineData {
  id?: number;
  title: string; // 项目标题
  authors: FormAuthor[]; // 作者列表
  achievementType: string; // 固定为 'project'
  categoryId?: number; // 项目类型ID（新类型系统）
  projectStartDate?: string; // 项目开始日期（项目）
  projectEndDate?: string; // 项目结束日期（项目）
  projectNumber?: string; // 项目编号

  githubUrl?: string; // GitHub链接（项目）
  published?: boolean; // 发表状态：论文是否发表/项目是否结项
  reference?: string; // 前端展示引用
  fundingAmount?: number | string; // 项目经费（万元）
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
        isCorresponding: true,
        isLeader: false,
        visible: true,
        userId: null
      }
    ],
    achievementType: "project",
    categoryId: undefined,
    projectEndDate: "",
    projectNumber: "",
    githubUrl: "",
    published: true,
    reference: "",
    fundingAmount: undefined
  })
});

const newFormInline = ref(props.formInline);
const formRuleRef = ref();

// 项目类型相关数据
const categoryTree = ref<LabAchievementCategoryDTO[]>([]);
const projectCategories = ref<LabAchievementCategoryDTO[]>([]);

// 获取项目类型树（默认获取一级分类为项目的二级分类）
const loadCategoryTree = async () => {
  try {
    const response = await getDictCategoryTreeApi();
    if (response.code === 0) {
      categoryTree.value = response.data;
      // 查找一级分类为“项目”的节点（通常ID为2，或通过名称判断）
      const projectRoot = response.data.find(
        cat => cat.id === 2 || cat.categoryName === '项目' || (cat.categoryCode && cat.categoryCode.toLowerCase() === 'project')
      );
      
      if (projectRoot && projectRoot.children) {
        projectCategories.value = projectRoot.children;
      } else {
        projectCategories.value = [];
      }
    }
  } catch (error) {
    console.error('获取项目类型失败:', error);
  }
};

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
    authorOrder: newOrder,
    isCorresponding: false,
    isLeader: false,
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

// 负责人勾选：确保同一项目仅可选择一位负责人
function onLeaderToggle(selectedIndex: number) {
  if (newFormInline.value.achievementType !== 'project') return;
  const authors = newFormInline.value.authors;
  if (authors[selectedIndex].isLeader) {
    authors.forEach((a, idx) => {
      if (idx !== selectedIndex) a.isLeader = false;
    });
  }
}

// 参与人模糊搜索建议
const fetchUserSuggest = async (
  query: string,
  cb: (results: Array<{ value: string; id: number; username?: string; englishName?: string | null }>) => void
) => {
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
};

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
        <el-form-item label="项目名称" prop="title">
          <el-input
            v-model="newFormInline.title"
            clearable
            placeholder="请输入项目名称"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
      </re-col>

      <!-- 已隐藏：项目类型（一级分类）选择，默认由外层钩子按“项目”传入 categoryId -->

      <re-col :value="12">
        <el-form-item label="项目类型" prop="categoryId">
          <el-select
            class="w-full"
            v-model="newFormInline.categoryId"
            placeholder="请选择项目类型"
          >
            <el-option
              v-for="opt in projectCategories"
              :key="opt.id"
              :label="opt.categoryName"
              :value="opt.id"
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
                    参与人
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
                        :placeholder="newFormInline.achievementType === 'project' ? '姓名' : '作者姓名'"
                        class="w-full"
                        clearable
                        @select="item => onUserSelect(index, item)"
                        @clear="onUserClear(index)"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8" v-if="newFormInline.achievementType === 'project'">
                    <el-form-item>
                      <el-checkbox v-model="author.isLeader" @change="onLeaderToggle(index)">
                        负责人
                      </el-checkbox>
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
      ></re-col>

      <re-col :value="12">
        <el-form-item label="开始日期" prop="projectStartDate">
          <el-date-picker
            v-model="newFormInline.projectStartDate"
            type="date"
            placeholder="请选择年月日"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="结束日期" prop="projectEndDate">
          <el-date-picker
            v-model="newFormInline.projectEndDate"
            type="date"
            placeholder="请选择年月日"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="项目经费" prop="fundingAmount">
          <el-input
            v-model="newFormInline.fundingAmount"
            clearable
            placeholder="请输入项目经费"
            inputmode="decimal"
            class="w-full"
          >
            <template #append>万元</template>
          </el-input>
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item
          label="编号"
          prop="projectNumber"
        >
          <el-input
            v-model="newFormInline.projectNumber"
            clearable
            placeholder="请输入相关编号"
          />
        </el-form-item>
      </re-col>



      <re-col :value="24">
        <el-form-item label="资助声明" prop="reference" style="white-space: nowrap;">
          <el-input
            v-model="newFormInline.reference"
            clearable
            placeholder="请输入资助声明"
          />
        </el-form-item>
      </re-col>


    </el-row>
  </el-form>
</template>

<style scoped lang="scss">
/* 保持输入框宽度样式一致 */

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
// 用户模糊搜索建议
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
