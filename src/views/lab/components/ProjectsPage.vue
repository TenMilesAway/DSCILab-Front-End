<template>
  <div class="projects-page">
    <!-- 左侧项目分类导航 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>项目分类</h3>
      </div>
      <el-menu
        :default-active="activeCategory"
        class="category-menu"
        @select="handleCategorySelect"
      >
        <el-menu-item index="all">
          <span>全部项目</span>
        </el-menu-item>
        <el-menu-item 
          v-for="category in projectCategories" 
          :key="category.id"
          :index="category.categoryCode"
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
          <span class="count">共 {{ filteredProjects.length }} 个项目</span>
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
            placeholder="搜索项目名称或负责人"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 项目列表 -->
      <div class="projects-list">
        <div v-if="loading" class="loading">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else-if="filteredProjects.length === 0" class="empty">
          <el-empty description="暂无相关项目" />
        </div>
        <div v-else>
          <div
            v-for="(project, index) in paginatedProjects"
            :key="project.id"
            class="project-item"
          >
            <div class="project-header">
              <span class="project-number">{{ (currentPage - 1) * pageSize + index + 1 }}.</span>
              <el-tag 
                :type="getTypeTagType(project)" 
                size="small" 
                class="project-type-tag"
              >
                {{ getTypeLabel(project) }}
              </el-tag>
            </div>
            <div class="project-content">
              <span 
                v-if="project.reference" 
                class="project-reference"
              >
                {{ project.reference }}
              </span>
              <span 
                v-else 
                class="project-reference"
              >
                暂无引用信息
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="filteredProjects.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredProjects.length"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getProjectsListApi, type ApiProject } from '@/api/lab/projects'
import { getProjectCategoriesApi, type ProjectCategoryDTO } from '@/api/lab/projectCategory'
import { ElMessage } from 'element-plus'

// 项目类型定义
interface Project {
  id: number
  title: string
  leader: string
  fundingAmount: string
  startYear: number
  endYear: number
  published: boolean
  reference?: string
  categoryId?: number
  categoryName?: string
}

// 数据转换函数
const convertApiDataToProject = (apiData: ApiProject): Project => {
  // 找到 authorOrder 为 1 的负责人
  const leader = apiData.authors?.find(author => author.authorOrder === 1)?.name || '未知'
  
  // 从日期中提取年份
  const startYear = apiData.projectStartDate ? new Date(apiData.projectStartDate).getFullYear() : new Date().getFullYear()
  const endYear = apiData.projectEndDate ? new Date(apiData.projectEndDate).getFullYear() : new Date().getFullYear()
  
  // 动态获取项目分类名称
  let categoryName = ''
  if (apiData.categoryId) {
    const category = projectCategories.value.find(cat => cat.id === apiData.categoryId)
    if (category) {
      categoryName = category.categoryName
    }
  }
  
  return {
    id: apiData.id,
    title: apiData.title,
    leader: leader,
    fundingAmount: apiData.fundingAmount || '0',
    startYear: startYear,
    endYear: endYear,
    published: apiData.published || false,
    reference: apiData.reference || '',
    categoryId: apiData.categoryId, // 添加categoryId字段
    categoryName: categoryName // 添加categoryName字段
  }
}

// 响应式数据
const loading = ref(false)
const activeCategory = ref('all')
const selectedYear = ref<number | null>(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const projects = ref<Project[]>([])

// 项目分类数据
const projectCategories = ref<ProjectCategoryDTO[]>([])

// 加载项目分类数据
const loadProjectCategories = async () => {
  try {
    const response = await getProjectCategoriesApi(2) // 获取parentId=2的项目分类数据
    if (response.code === 0 && response.data && response.data.length > 0) {
      // 按sortOrder排序
      const sortedCategories = [...response.data].sort((a, b) => a.sortOrder - b.sortOrder)
      projectCategories.value = sortedCategories
    }
  } catch (error) {
    console.error('加载项目分类失败:', error)
    ElMessage.error('加载项目分类失败')
  }
}

// 响应式屏幕尺寸检测
const screenWidth = ref(window.innerWidth)
const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}

// 根据屏幕尺寸判断是否为小屏幕
const isSmallScreen = computed(() => screenWidth.value <= 768)

// 根据屏幕尺寸动态调整分页布局
const paginationLayout = computed(() => {
  if (screenWidth.value <= 480) {
    return 'prev, pager, next'
  } else if (screenWidth.value <= 768) {
    return 'total, prev, pager, next'
  } else if (screenWidth.value <= 1024) {
    return 'total, sizes, prev, pager, next'
  } else {
    return 'total, sizes, prev, pager, next, jumper'
  }
})

// 计算属性
const availableYears = computed(() => {
  const years = [...new Set(projects.value.flatMap(item => [item.startYear, item.endYear]))]
  return years.sort((a, b) => b - a)
})

const filteredProjects = computed(() => {
  let filtered = projects.value

  // 按分类筛选
  if (activeCategory.value !== 'all') {
    // 使用categoryId进行筛选，而不是type
    filtered = filtered.filter(item => {
      // 查找对应的分类
      const category = projectCategories.value.find(cat => cat.categoryCode === activeCategory.value)
      return category && item.categoryId === category.id
    })
  }

  // 按年份筛选
  if (selectedYear.value) {
    filtered = filtered.filter(item => 
      item.startYear <= selectedYear.value! && item.endYear >= selectedYear.value!
    )
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.leader.toLowerCase().includes(keyword)
    )
  }

  // 按开始年份从新到旧排序
  return filtered.sort((a, b) => b.startYear - a.startYear)
})

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProjects.value.slice(start, end)
})

// 方法
const getCategoryTitle = (category: string) => {
  if (category === 'all') {
    return '全部项目'
  }
  
  // 查找对应的分类名称，使用 categoryCode 进行匹配
  const foundCategory = projectCategories.value.find(
    item => item.categoryCode === category
  )
  return foundCategory ? foundCategory.categoryName : '全部项目'
}

const getTypeLabel = (project: any) => {
  // 通过 categoryId 查找对应的分类名称
  if (project && project.categoryId) {
    const foundCategory = projectCategories.value.find(
      category => category.id === project.categoryId
    )
    return foundCategory ? foundCategory.categoryName : "其他"
  }
  return "其他"
}

const getTypeTagType = (project: any) => {
  // 通过 categoryId 查找对应的分类颜色
  if (project && project.categoryId) {
    const foundCategory = projectCategories.value.find(
      category => category.id === project.categoryId
    )
    return foundCategory ? foundCategory.color || "info" : "info"
  }
  return "info"
}

const getStatusLabel = (published: boolean) => {
  return published ? '已结项' : '未结项'
}

const getStatusTagType = (published: boolean, projectType: Project['type']) => {
  // 返回与项目类型标签相同的颜色，确保相同项目类型的tag颜色一致
  return getTypeTagType(projectType)
}

const handleCategorySelect = (index: string) => {
  activeCategory.value = index
  currentPage.value = 1
}

const handleYearChange = () => {
  currentPage.value = 1
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// API数据加载
const loadProjects = async () => {
  loading.value = true
  try {
    const response = await getProjectsListApi()
    if (response.code === 0 && response.data?.rows) {
      // 获取有效的分类ID列表
      const validCategoryIds = projectCategories.value.map(category => category.id)
      
      // 先按有效分类ID筛选，再转换数据
      const filteredProjects = response.data.rows.filter(project => {
        // 如果项目有categoryId，检查是否在有效分类列表中
        if (project.categoryId) {
          return validCategoryIds.includes(Number(project.categoryId))
        }
        // 如果没有categoryId，暂时保留（可根据需要调整）
        return true
      })
      
      projects.value = filteredProjects.map(convertApiDataToProject)
    } else {
      ElMessage.error('获取项目数据失败')
      projects.value = []
    }
  } catch (error) {
    console.error('加载项目数据失败:', error)
    ElMessage.error('获取项目数据失败，请稍后重试')
    projects.value = []
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(async () => {
  // 先加载项目分类数据，再加载项目数据
  await loadProjectCategories()
  loadProjects()
  window.addEventListener('resize', updateScreenWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})
</script>

<style scoped>
.projects-page {
  display: flex;
  min-height: calc(100vh - 70px);
  background-color: #f5f7fa;
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
}

.year-select {
  width: 120px;
}

.search-input {
  width: 300px;
}

.projects-list {
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

.project-item {
  padding: 8px 20px;
  border-bottom: 1px solid #e4e7ed;
  transition: background-color 0.3s;
  display: flex;
  align-items: flex-start;
  line-height: 1.6;
}

.project-item:hover {
  background-color: #f8f9fa;
}

.project-item:last-child {
  border-bottom: none;
}

.project-number {
  color: #2c3e50;
  font-weight: 600;
  margin-right: 10px;
  flex-shrink: 0;
  min-width: 25px;
  font-size: 14px;
}

.project-status-tag {
  margin-right: 8px;
  flex-shrink: 0;
  vertical-align: middle;
}

.project-type-tag {
  margin-right: 8px;
  flex-shrink: 0;
  vertical-align: middle;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.project-content {
  flex: 1;
  line-height: 1.8;
  font-size: 14px;
}

.project-title {
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

.project-leader {
  color: #34495e;
  font-weight: 400;
  font-size: 14px;
}

.project-funding {
  color: #e67e22;
  font-weight: 500;
  font-size: 14px;
}

.project-year {
  color: #2c3e50;
  font-weight: 400;
  font-size: 14px;
}

.project-separator {
  color: #2c3e50;
  margin: 0 3px;
  font-weight: 400;
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
  .projects-page {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
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
    min-width: 120px;
    text-align: center;
    height: 40px;
    line-height: 40px;
  }
  
  .main-content {
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
    padding: 15px;
  }
  
  .filter-left {
    text-align: center;
  }
  
  .filter-left h2 {
    font-size: 20px;
    margin-bottom: 5px;
  }
  
  .filter-right {
    flex-direction: column;
    gap: 10px;
  }
  
  .year-select,
  .search-input {
    width: 100%;
  }
  
  .project-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
    gap: 8px;
  }
  
  .project-header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  
  
  .project-type-tag {
    margin-right: 0px;
    margin-bottom: 0;
  }

  .project-number,
  .project-status-tag {
    margin-right: 8px;
    margin-bottom: 0;
  }
  
  .project-content {
    width: 100%;
  }
  
  .project-content {
    line-height: 1.6;
  }
  
  .pagination {
    padding: 15px 10px;
    overflow-x: auto;
  }
  
  .pagination :deep(.el-pagination) {
    flex-wrap: nowrap;
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .projects-page {
    min-height: calc(100vh - 60px);
  }
  
  .sidebar-header {
    padding: 10px 15px;
  }
  
  .sidebar-header h3 {
    font-size: 16px;
  }
  
  .category-menu .el-menu-item {
    min-width: 100px;
    font-size: 13px;
    height: 36px;
    line-height: 36px;
    padding-left: 10px;
    padding-right: 10px;
  }
  
  .main-content {
    padding: 10px;
  }
  
  .filter-bar {
    padding: 12px;
  }
  
  .filter-left h2 {
    font-size: 18px;
  }
  
  .project-item {
    padding: 12px;
  }
  
  .project-content {
    font-size: 13px;
  }
  
  .project-title {
    font-size: 13px;
    font-weight: 600;
  }
  
  .project-leader,
  .project-funding,
  .project-year {
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
}
</style>