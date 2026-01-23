<template>
  <div class="achievements-page">
    <!-- 左侧成果分类导航 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>成果分类</h3>
      </div>
      <el-menu
        :default-active="activeCategory"
        class="category-menu"
        @select="handleCategorySelect"
      >
        <el-menu-item index="all">
          <span>全部成果</span>
        </el-menu-item>
        <el-menu-item
          v-for="category in achievementCategories"
          :key="category.id"
          :index="String(category.id)"
        >
          <span>{{ category.categoryName }}</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部筛选栏 -->
      <div class="filter-bar">
        <div class="filter-left">
          <h2>{{ getCategoryTitle(activeCategory) }}</h2>
          <span class="count">共 {{ filteredAchievements.length }} 项成果</span>
        </div>
        <div class="filter-right">
          <!-- 年份筛选 -->
          <el-select
            v-model="selectedYear"
            placeholder="选择年份"
            clearable
            class="year-select"
            @change="handleYearChange"
          >
            <el-option
              v-for="year in availableYears"
              :key="year"
              :label="year + '年'"
              :value="year"
            />
          </el-select>

          <!-- 搜索框 -->
          <el-input
            v-model="searchKeyword"
            placeholder="搜索成果标题或作者"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 成果列表 -->
      <div class="achievements-list">
        <div v-if="loading" class="loading">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else-if="filteredAchievements.length === 0" class="empty">
          <el-empty description="暂无相关成果" />
        </div>
        <div v-else>
          <div
            v-for="(achievement, index) in paginatedAchievements"
            :key="achievement.id"
            class="achievement-item"
          >
            <div class="achievement-main">
              <div class="achievement-header">
                <span class="achievement-number"
                  >{{ (currentPage - 1) * pageSize + index + 1 }}.</span
                >
                <el-tag size="small" class="achievement-type-tag">
                  {{ getTypeLabel(achievement.type) }}
                </el-tag>
              </div>
              <div class="achievement-content">
                <span
                  v-if="achievement.reference"
                  class="achievement-reference"
                >
                  {{ achievement.reference }}
                </span>
                <span v-else class="achievement-reference"> 暂无引用信息 </span>
              </div>
            </div>
            <div class="achievement-actions-container">
              <div class="achievement-actions">
                <el-tooltip
                  :content="
                    achievement.githubUrl ? 'Github 仓库' : '暂无 Github 仓库'
                  "
                  placement="top"
                >
                  <el-button
                    plain
                    size="small"
                    circle
                    class="action-btn"
                    :disabled="!achievement.githubUrl"
                    @click="
                      achievement.githubUrl &&
                        handleGithubClick(achievement.githubUrl)
                    "
                  >
                    <GithubIcon />
                  </el-button>
                </el-tooltip>
                <el-tooltip
                  :content="
                    achievement.projectUrl ? '成果主页' : '暂无成果主页'
                  "
                  placement="top"
                >
                  <el-button
                    plain
                    :icon="Link"
                    size="small"
                    circle
                    class="action-btn"
                    :disabled="!achievement.projectUrl"
                    @click="
                      achievement.projectUrl &&
                        handleProjectClick(achievement.projectUrl)
                    "
                  />
                </el-tooltip>
                <el-tooltip
                  :content="achievement.pdfUrl ? '下载 PDF' : '暂无 PDF 文件'"
                  placement="top"
                >
                  <el-button
                    plain
                    :icon="Download"
                    size="small"
                    circle
                    class="action-btn"
                    :disabled="!achievement.pdfUrl"
                    @click="
                      achievement.pdfUrl &&
                        handlePdfDownload(achievement.pdfUrl)
                    "
                  />
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="filteredAchievements.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredAchievements.length"
          :layout="paginationLayout"
          :small="isSmallScreen"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h } from "vue";
import { Search, Link, House, Download } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  getAchievementsListApi,
  type ApiAchievement
} from "@/api/lab/achievements";
import {
  getAchievementCategoriesApi,
  type AchievementCategoryDTO
} from "@/api/lab/achievementCategory";

// 定义 Github 图标组件
const GithubIcon = {
  name: "Github",
  render() {
    return h(
      "svg",
      {
        viewBox: "0 0 1024 1024",
        width: "1em",
        height: "1em",
        fill: "currentColor"
      },
      [
        h("path", {
          d: "M512 12.64c-282.752 0-512 229.216-512 512 0 226.208 146.688 418.144 350.08 485.824 25.6 4.736 35.008-11.104 35.008-24.64 0-12.192-0.48-52.544-0.704-95.328-142.464 30.976-172.512-60.416-172.512-60.416-23.296-59.168-56.832-74.912-56.832-74.912-46.464-31.776 3.52-31.136 3.52-31.136 51.392 3.616 78.464 52.768 78.464 52.768 45.664 78.272 119.776 55.648 148.992 42.56 4.576-33.088 17.856-55.68 32.512-68.48-113.728-12.928-233.28-56.864-233.28-253.024 0-55.904 19.936-101.568 52.672-137.408-5.312-12.896-22.848-64.96 4.96-135.488 0 0 42.88-13.76 140.8 52.48 40.832-11.36 84.64-17.024 128.16-17.248 43.488 0.192 87.328 5.888 128.256 17.248 97.856-66.24 140.672-52.48 140.672-52.48 27.872 70.528 10.336 122.592 5.024 135.488 32.832 35.84 52.608 81.504 52.608 137.408 0 196.64-119.776 239.936-233.792 252.64 18.368 15.904 34.72 47.04 34.72 94.816 0 68.512-0.608 123.648-0.608 140.512 0 13.632 9.216 29.6 35.168 24.576C877.44 942.592 1024 750.592 1024 524.64c0-282.784-229.248-512-512-512z"
        })
      ]
    );
  }
};

// 成果类型定义
interface Achievement {
  id: number;
  title: string;
  authors: string[];
  type: string;
  year: number | string;
  institution: string;
  githubUrl?: string;
  projectUrl?: string;
  pdfUrl?: string;
  reference?: string;
  categoryId: string | number; // 添加分类ID字段
  categoryName: string; // 添加分类名称字段
}

// 响应式数据
const loading = ref(false);
const activeCategory = ref("all");
const selectedYear = ref<number | null>(null);
const searchKeyword = ref("");
const currentPage = ref(1);
const pageSize = ref(20);
const achievements = ref<Achievement[]>([]);
const achievementCategories = ref<AchievementCategoryDTO[]>([]);
const categoryMap = ref<Record<string, string>>({}); // 分类代码到类型的映射

// 响应式屏幕尺寸检测
const screenWidth = ref(window.innerWidth);
const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

// 根据屏幕尺寸判断是否为小屏幕
const isSmallScreen = computed(() => screenWidth.value <= 768);

// 根据屏幕尺寸动态调整分页布局
const paginationLayout = computed(() => {
  if (screenWidth.value <= 480) {
    return "prev, pager, next";
  } else if (screenWidth.value <= 768) {
    return "total, prev, pager, next";
  } else if (screenWidth.value <= 1024) {
    return "total, sizes, prev, pager, next";
  } else {
    return "total, sizes, prev, pager, next, jumper";
  }
});

// 计算属性
const availableYears = computed(() => {
  const years = [...new Set(achievements.value.map(item => item.year))];
  // 过滤掉非数字年份
  const validYears = years.filter((y): y is number => typeof y === "number");
  return validYears.sort((a, b) => b - a);
});

const filteredAchievements = computed(() => {
  let filtered = achievements.value;

  // 按分类筛选
  if (activeCategory.value !== "all") {
    // 使用categoryId作为筛选条件
    filtered = filtered.filter(item => {
      return String(item.categoryId) === activeCategory.value;
    });
  }

  // 按年份筛选
  if (selectedYear.value) {
    filtered = filtered.filter(item => item.year === selectedYear.value);
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filtered = filtered.filter(
      item =>
        item.title.toLowerCase().includes(keyword) ||
        item.authors.some(author => author.toLowerCase().includes(keyword))
    );
  }

  // 按年份从新到旧排序
  return filtered.sort((a, b) => {
    const yearA = typeof a.year === "number" ? a.year : 0;
    const yearB = typeof b.year === "number" ? b.year : 0;
    return yearB - yearA;
  });
});

const paginatedAchievements = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredAchievements.value.slice(start, end);
});

// 方法
const getCategoryTitle = (category: string) => {
  if (category === "all") {
    return "全部成果";
  }

  // 查找对应的分类名称
  const foundCategory = achievementCategories.value.find(
    item => String(item.id) === category
  );
  return foundCategory ? foundCategory.categoryName : "全部成果";
};

const getTypeLabel = (type: string) => {
  // 查找对应的分类名称
  const foundCategory = achievementCategories.value.find(
    item => item.categoryCode.toLowerCase() === type
  );
  return foundCategory ? foundCategory.categoryName : type;
};

const handleCategorySelect = (index: string) => {
  activeCategory.value = index;
  currentPage.value = 1;
};

const handleYearChange = () => {
  currentPage.value = 1;
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

// 操作按钮事件处理
const handleGithubClick = (url: string) => {
  // 打开Github仓库链接
  window.open(url, "_blank");
  ElMessage.success("正在跳转到 Github 仓库");
};

const handleProjectClick = (url: string) => {
  // 打开项目主页链接
  window.open(url, "_blank");
  ElMessage.success("正在跳转到项目主页");
};

const handlePdfDownload = (url: string) => {
  // 下载PDF文件
  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  ElMessage.success("PDF 下载已开始");
};

// 数据转换函数
const convertApiDataToAchievement = (apiData: ApiAchievement): Achievement => {
  // 论文类型映射
  const paperTypeMap: Record<number, string> = {
    1: "期刊论文",
    2: "会议论文",
    3: "预印本",
    4: "专利",
    5: "软著",
    6: "标准",
    7: "专著"
  };

  // 使用categoryId直接映射到对应的分类
  let type = "other";

  // 优先使用 paperType 进行映射
  if (apiData.paperType && paperTypeMap[apiData.paperType]) {
    type = paperTypeMap[apiData.paperType];
  } else if (apiData.categoryId && categoryMap.value[apiData.categoryId]) {
    // 如果没有 paperType，则尝试使用 categoryId 映射
    type = categoryMap.value[apiData.categoryId];
  } else {
    // 如果都没有，默认为其他
    type = "other";
  }

  // 从 publishDate 中提取年份
  const year = apiData.publishDate
    ? new Date(apiData.publishDate).getFullYear()
    : "";

  // 查找分类名称
  let categoryName = "";
  if (apiData.categoryId) {
    const category = achievementCategories.value.find(
      cat => cat.id === apiData.categoryId
    );
    if (category) {
      categoryName = category.categoryName;
    }
  }

  // 构造引用字符串
  // 格式：作者1,作者2,...,作者x.标题.机构名称.年份.(编号)
  // 强制使用字段拼接，除非关键字段都缺失才考虑使用后端reference作为最后兜底
  let reference = "";

  const authorsList = apiData.authors
    ? [...apiData.authors]
        .sort((a, b) => a.authorOrder - b.authorOrder)
        .map(a => a.name)
        .filter(n => n && n.trim() !== "") // 过滤空名字
        .join(", ")
    : "";

  const title = apiData.title || "";
  // 优先使用 publication (期刊名/会议名)，其次是 venue，最后是 publisher
  //const publisher = (apiData as any).publication || apiData.venue || apiData.publisher || "";
  const publisher = apiData.publisher || "";
  const doi = apiData.doi || "";

  // 检查 title 是否已经以点号结尾，避免双重点号
  const cleanTitle = title.endsWith(".") ? title.slice(0, -1) : title;

  // 检查 publisher 是否已经以点号结尾
  const cleanPublisher = publisher.endsWith(".")
    ? publisher.slice(0, -1)
    : publisher;

  const referenceParts = [
    authorsList,
    cleanTitle,
    cleanPublisher,
    year,
    doi
  ].filter(part => part && String(part).trim() !== "");

  if (referenceParts.length > 0) {
    reference = referenceParts.join(". ");
  } else if (apiData.reference && apiData.reference.trim() !== "") {
    // 只有当所有字段都无法构建时，才使用后端的 reference
    reference = apiData.reference;

    // 检查reference是否已经包含年份
    const hasYearInReference = reference.includes(String(year));

    // 如果后端返回的reference没有包含年份，且年份有效，则追加年份
    if (!hasYearInReference && year) {
      if (reference.endsWith(".")) {
        reference = reference.slice(0, -1);
      }
      reference = `${reference}.${year}`;
    }
  }

  return {
    id: apiData.id,
    title: apiData.title,
    authors: apiData.authors ? apiData.authors.map(author => author.name) : [],
    type: type,
    year: year,
    institution: apiData.venue || "", // venue 字段映射为 institution
    githubUrl: apiData.gitUrl,
    projectUrl: apiData.linkUrl,
    pdfUrl: apiData.pdfUrl,
    reference: reference, // 使用构建的reference
    categoryId: apiData.categoryId || "", // 添加categoryId字段
    categoryName: categoryName // 添加categoryName字段
  };
};

// 加载成果分类
const loadAchievementCategories = async () => {
  try {
    // 从新的接口获取成员分类数据
    // const response = await fetch('http://10.157.134.211:8080/open/achievement-categories/children?parentId=1')
    // const result = await response.json()
    const result = await getAchievementCategoriesApi(1);

    // 检查响应格式并提取数据
    if (
      result &&
      result.code === 0 &&
      result.data &&
      Array.isArray(result.data)
    ) {
      // 保存分类数据，包含 id 和 categoryName
      achievementCategories.value = result.data;

      // 创建分类代码到类型的映射（使用id作为键）
      const newCategoryMap: Record<number, string> = {};
      achievementCategories.value.forEach(category => {
        newCategoryMap[category.id] = category.categoryCode
          ? category.categoryCode.toLowerCase()
          : "other";
      });
      categoryMap.value = newCategoryMap;
    } else {
      console.error("获取成果分类数据格式错误:", result);
      ElMessage.error("获取成果分类数据格式错误");
    }
  } catch (error) {
    console.error("加载成果分类失败:", error);
    ElMessage.error("加载成果分类失败");
  }
};

// 数据加载
const loadAchievements = async () => {
  loading.value = true;
  try {
    const response = await getAchievementsListApi({ pageSize: 1000 });
    if (response.code === 0 && response.data?.rows) {
      // 不再过滤无效分类的数据，确保所有数据都能显示
      const allAchievements = response.data.rows;

      // 转换数据格式
      achievements.value = allAchievements.map(convertApiDataToAchievement);
    } else {
      ElMessage.error("获取成果数据失败");
      achievements.value = [];
    }
  } catch (error) {
    console.error("加载成果数据失败:", error);
    ElMessage.error("网络错误，请稍后重试");
    achievements.value = [];
  } finally {
    loading.value = false;
  }
};

// 生命周期
onMounted(async () => {
  // 先加载成果分类，再加载成果数据
  await loadAchievementCategories();
  await loadAchievements();
  window.addEventListener("resize", updateScreenWidth);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateScreenWidth);
});
</script>

<style scoped>
.achievements-page {
  display: flex;
  min-height: calc(100vh - 70px);
  background-color: #f5f7fa;
  width: 100%;
  box-sizing: border-box;
}

.sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e4e7ed;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.sidebar-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.category-menu {
  border: none;
}

.category-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  padding-left: 20px;
}

.main-content {
  flex: 1;
  padding: 20px;
  min-width: 0;
  width: 100%;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 16px;
}

.filter-left h2 {
  margin: 0 10px 0 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.filter-left .count {
  color: #909399;
  font-size: 14px;
}

.filter-right {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.year-select {
  width: 120px;
}

.search-input {
  width: 300px;
  min-width: 200px;
  flex: 1;
  max-width: 400px;
}

.achievements-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading,
.empty {
  padding: 40px;
  text-align: center;
}

.achievement-item {
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 1.6;
  min-height: 60px;
}

.achievement-item:hover {
  background-color: #f8f9fa;
}

.achievement-item:last-child {
  border-bottom: none;
}

.achievement-main {
  display: flex;
  align-items: center;
  flex: 1;
  margin-right: 16px;
  gap: 12px;
}

.achievement-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.achievement-actions-container {
  background-color: #fafbfc;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 8px 12px;
  margin-left: 16px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.achievement-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  opacity: 1;
}

.action-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid #d1d5db;
  color: #6b7280;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background-color: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  color: #d1d5db;
  border-color: #e5e7eb;
  background-color: #f9fafb;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.action-btn:disabled:hover {
  color: #d1d5db;
  border-color: #e5e7eb;
  background-color: #f9fafb;
  transform: none;
  box-shadow: none;
}

.achievement-number {
  color: #2c3e50;
  font-weight: 600;
  margin-right: 10px;
  flex-shrink: 0;
  min-width: 25px;
  font-size: 14px;
}

.achievement-status-tag {
  flex-shrink: 0;
  margin-right: 8px;
  vertical-align: middle;
}

.achievement-type-tag {
  flex-shrink: 0;
  vertical-align: middle;
}

.achievement-content {
  flex: 1;
  line-height: 1.8;
  font-size: 14px;
}

.achievement-reference {
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar {
    width: 220px;
  }

  .main-content {
    padding: 15px;
  }

  .filter-bar {
    padding: 15px;
  }

  .search-input {
    flex: 1;
    min-width: 200px;
    max-width: none;
  }
}

@media (max-width: 768px) {
  .achievements-page {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }

  .sidebar-header {
    padding: 15px 20px;
  }

  .category-menu {
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
  }

  .category-menu .el-menu-item {
    flex-shrink: 0;
    height: 40px;
    line-height: 40px;
    padding: 0 16px;
    min-width: auto;
  }

  .main-content {
    padding: 10px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    padding: 15px;
    gap: 12px;
  }

  .filter-left {
    text-align: center;
  }

  .filter-left h2 {
    font-size: 20px;
    margin-bottom: 5px;
  }

  .filter-right {
    justify-content: center;
    gap: 10px;
  }

  .search-input {
    width: 100%;
    flex: 1;
  }

  .year-select {
    width: 100px;
  }

  .achievement-item {
    padding: 12px 15px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .achievement-main {
    flex-direction: column;
    margin-right: 0;
    width: 100%;
    align-items: flex-start;
  }

  .achievement-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
  }

  .achievement-content {
    width: 100%;
  }

  .achievement-actions-container {
    margin-left: 0;
    margin-top: 8px;
    align-self: flex-end;
    padding: 6px 10px;
  }

  .achievement-actions {
    opacity: 1;
    justify-content: flex-end;
    align-items: center;
  }

  .action-btn {
    width: 30px;
    height: 30px;
  }

  .achievement-content {
    line-height: 1.6;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .filter-bar {
    padding: 12px;
  }

  .filter-left h2 {
    font-size: 18px;
  }

  .filter-right {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .year-select {
    width: 100%;
  }

  .achievement-item {
    padding: 10px 12px;
  }

  .achievement-content {
    font-size: 13px;
  }

  .achievement-reference {
    font-size: 13px;
  }

  .pagination {
    padding: 15px 10px;
    overflow-x: auto;
  }

  .pagination :deep(.el-pagination) {
    flex-wrap: nowrap;
    white-space: nowrap;
  }

  .sidebar-header h3 {
    font-size: 16px;
  }

  .category-menu .el-menu-item {
    padding: 0 12px;
    font-size: 14px;
  }
}

@media (max-width: 360px) {
  .main-content {
    padding: 6px;
  }

  .filter-bar {
    padding: 10px;
  }

  .filter-left h2 {
    font-size: 16px;
  }

  .achievement-item {
    padding: 8px 10px;
  }

  .achievement-content {
    font-size: 12px;
  }

  .achievement-reference {
    font-size: 12px;
  }

  .achievement-number {
    font-size: 12px;
  }

  .pagination {
    padding: 10px 5px;
    overflow-x: auto;
  }

  .pagination :deep(.el-pagination) {
    justify-content: center;
    min-width: max-content;
  }

  .pagination :deep(.el-pagination .el-pager) {
    margin: 0 2px;
  }

  .pagination :deep(.el-pagination .btn-prev),
  .pagination :deep(.el-pagination .btn-next) {
    margin: 0 2px;
  }

  .sidebar-header {
    padding: 12px 15px;
  }

  .sidebar-header h3 {
    font-size: 14px;
  }

  .category-menu .el-menu-item {
    padding: 0 10px;
    font-size: 13px;
  }
}
</style>
