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
        <el-menu-item index="journal">
          <span>期刊</span>
        </el-menu-item>
        <el-menu-item index="conference">
          <span>会议</span>
        </el-menu-item>
        <el-menu-item index="preprint">
          <span>预印本</span>
        </el-menu-item>
        <el-menu-item index="patent">
          <span>专利</span>
        </el-menu-item>
        <el-menu-item index="software">
          <span>软著</span>
        </el-menu-item>
        <el-menu-item index="standard">
          <span>标准</span>
        </el-menu-item>
        <el-menu-item index="monograph">
          <span>专著</span>
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
                <span class="achievement-number">{{ (currentPage - 1) * pageSize + index + 1 }}.</span>
                <el-tag 
                  :type="getTypeTagType(achievement.type)" 
                  size="small" 
                  class="achievement-type-tag"
                >
                  {{ getTypeLabel(achievement.type) }}
                </el-tag>
                <el-tag 
                  :type="getStatusTagType(achievement.type, achievement.published) as '' | 'success' | 'warning' | 'info' | 'danger'"
                  size="small" 
                  class="achievement-status-tag"
                >
                  {{ getStatusLabel(achievement.type, achievement.published) }}
                </el-tag>
              </div>
              <div class="achievement-content">
                <span class="achievement-authors">{{ achievement.authors.join(', ') }}</span>
                <span class="achievement-separator">.</span>
                <span class="achievement-title">{{ achievement.title }}</span>
                <template v-if="achievement.institution">
                  <span class="achievement-separator">,</span>
                  <span class="achievement-institution">{{ achievement.institution }}</span>
                </template>
                <span class="achievement-separator">,</span>
                <span class="achievement-year">{{ achievement.year }}</span>
                <span class="achievement-separator">.</span>
              </div>
            </div>
            <div class="achievement-actions-container">
              <div class="achievement-actions">
                <el-tooltip :content="achievement.githubUrl ? 'Github 仓库' : '暂无 Github 仓库'" placement="top">
                  <el-button 
                    plain 
                    :icon="Link" 
                    size="small" 
                    circle 
                    class="action-btn"
                    :disabled="!achievement.githubUrl"
                    @click="achievement.githubUrl && handleGithubClick(achievement.githubUrl)"
                  />
                </el-tooltip>
                <el-tooltip :content="achievement.projectUrl ? '成果主页' : '暂无成果主页'" placement="top">
                  <el-button 
                    plain 
                    :icon="House" 
                    size="small" 
                    circle 
                    class="action-btn"
                    :disabled="!achievement.projectUrl"
                    @click="achievement.projectUrl && handleProjectClick(achievement.projectUrl)"
                  />
                </el-tooltip>
                <el-tooltip :content="achievement.pdfUrl ? '下载 PDF' : '暂无 PDF 文件'" placement="top">
                  <el-button 
                    plain 
                    :icon="Download" 
                    size="small" 
                    circle 
                    class="action-btn"
                    :disabled="!achievement.pdfUrl"
                    @click="achievement.pdfUrl && handlePdfDownload(achievement.pdfUrl)"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, Link, House, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAchievementsListApi, type ApiAchievement } from '@/api/lab/achievements'

// 成果类型定义
interface Achievement {
  id: number
  title: string
  authors: string[]
  type: 'journal' | 'conference' | 'preprint' | 'patent' | 'software' | 'standard' | 'monograph'
  year: number
  institution: string
  published: boolean
  githubUrl?: string
  projectUrl?: string
  pdfUrl?: string
}

// 响应式数据
const loading = ref(false)
const activeCategory = ref('all')
const selectedYear = ref<number | null>(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const achievements = ref<Achievement[]>([])

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
  const years = [...new Set(achievements.value.map(item => item.year))]
  return years.sort((a, b) => b - a)
})

const filteredAchievements = computed(() => {
  let filtered = achievements.value

  // 按分类筛选
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.type === activeCategory.value)
  }

  // 按年份筛选
  if (selectedYear.value) {
    filtered = filtered.filter(item => item.year === selectedYear.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.authors.some(author => author.toLowerCase().includes(keyword))
    )
  }

  // 按年份从新到旧排序
  return filtered.sort((a, b) => b.year - a.year)
})

const paginatedAchievements = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAchievements.value.slice(start, end)
})

// 方法
const getCategoryTitle = (category: string) => {
  const titles = {
    all: '全部成果',
    journal: '期刊论文',
    conference: '会议论文',
    preprint: '预印本',
    patent: '专利',
    software: '软件著作权',
    standard: '标准',
    monograph: '专著'
  }
  return titles[category] || '全部成果'
}

const getTypeLabel = (type: string) => {
  const labels = {
    journal: '期刊',
    conference: '会议',
    preprint: '预印本',
    patent: '专利',
    software: '软著',
    standard: '标准',
    monograph: '专著'
  }
  return labels[type] || type
}

const getTypeTagType = (type: string) => {
  const types = {
    journal: 'primary',
    conference: 'success',
    preprint: 'warning',
    patent: 'danger',
    software: 'info',
    standard: '',
    monograph: 'primary'
  }
  return types[type] || ''
}

// 获取状态标签文本
const getStatusLabel = (type: string, published: boolean) => {
  if (published) {
    // published = true 时
    if (['journal', 'conference', 'standard', 'monograph', 'preprint'].includes(type)) {
      return '已发表'
    } else if (['patent', 'software'].includes(type)) {
      return '已授权'
    }
  } else {
    // published = false 时
    if (['journal', 'conference', 'standard', 'monograph', 'preprint'].includes(type)) {
      return '投递中'
    } else if (['patent', 'software'].includes(type)) {
      return '受理中'
    }
  }
  return ''
}

// 获取状态标签类型
const getStatusTagType = (type: string, published: boolean) => {
  // 将字符串类型映射为数字类型，与MemberInfo.vue保持一致
  const typeToNumberMap = {
    journal: 1,
    conference: 2,
    preprint: 3,
    patent: 4,
    software: 5,
    standard: 6,
    monograph: 7
  }
  
  const paperType = typeToNumberMap[type] || 7
  
  // 基础类型颜色映射（与MemberInfo.vue保持一致）
  const baseTypeColors: Record<number, string> = {
    1: 'primary', // 期刊
    2: 'success', // 会议
    3: 'warning', // 预印本
    4: 'danger',  // 专利
    5: 'info',    // 软著
    6: '',        // 标准
    7: 'primary'  // 专著
  }
  
  // 如果未发布，使用稍微不同的色调表示状态
  if (!published) {
    const unpublishedColors: Record<number, string> = {
      1: 'primary',        // 期刊：使用默认灰色调
      2: 'success', // 会议：从success变为warning
      3: 'warning',    // 预印本：从warning变为info
      4: 'danger', // 专利：从danger变为warning
      5: 'info',        // 软著：使用默认灰色调
      6: '',    // 标准
      7: 'primary'     // 专著：从primary变为info
    }
    return unpublishedColors[paperType] || ''
  }
  
  return baseTypeColors[paperType] || ''
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

// 操作按钮事件处理
const handleGithubClick = (url: string) => {
  // 打开Github仓库链接
  window.open(url, '_blank')
  ElMessage.success('正在跳转到 Github 仓库')
}

const handleProjectClick = (url: string) => {
  // 打开项目主页链接
  window.open(url, '_blank')
  ElMessage.success('正在跳转到项目主页')
}

const handlePdfDownload = (url: string) => {
  // 下载PDF文件
  const link = document.createElement('a')
  link.href = url
  link.download = ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('PDF 下载已开始')
}

// 数据转换函数
const convertApiDataToAchievement = (apiData: ApiAchievement): Achievement => {
  // 根据 paperType 数字映射到字符串类型
  const typeMap: Record<number, Achievement['type']> = {
    1: 'journal',    // 期刊
    2: 'conference', // 会议
    3: 'preprint',   // 预印本
    4: 'patent',     // 专利
    5: 'software',   // 软著
    6: 'standard',   // 标准
    7: 'monograph'   // 专著
  }
  
  // 从 publishDate 中提取年份
  const year = apiData.publishDate ? new Date(apiData.publishDate).getFullYear() : new Date().getFullYear()
  
  return {
    id: apiData.id,
    title: apiData.title,
    authors: apiData.authors ? apiData.authors.map(author => author.name) : [],
    type: typeMap[apiData.paperType],
    year: year,
    institution: apiData.venue || '', // venue 字段映射为 institution
    published: apiData.published !== false, // 处理published字段
    githubUrl: apiData.gitUrl,
    projectUrl: apiData.linkUrl,
    pdfUrl: apiData.pdfUrl
  }
}

// 数据加载
const loadAchievements = async () => {
  loading.value = true
  try {
    const response = await getAchievementsListApi({ type: 1 })
    if (response.code === 0 && response.data) {
      // 显示所有成果
      achievements.value = response.data.rows.map(convertApiDataToAchievement)
    } else {
      ElMessage.error('获取成果数据失败')
      achievements.value = []
    }
  } catch (error) {
     console.error('加载成果数据失败:', error)
     ElMessage.error('网络错误，请稍后重试')
     achievements.value = []
   } finally {
     loading.value = false
   }
}

// 生命周期
onMounted(() => {
  loadAchievements()
  window.addEventListener('resize', updateScreenWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})
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

.achievement-authors {
  color: #2c3e50;
  font-weight: 400;
  font-size: 14px;
}

.achievement-title {
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

.achievement-journal {
  color: #34495e;
  font-style: italic;
  font-weight: 400;
  font-size: 14px;
}

.achievement-year {
  color: #2c3e50;
  font-weight: 400;
  font-size: 14px;
}

.achievement-institution {
  color: #34495e;
  font-style: italic;
  font-weight: 400;
  font-size: 14px;
}

.achievement-separator {
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
  
  .achievement-authors,
  .achievement-title,
  .achievement-institution,
  .achievement-year {
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
  
  .achievement-authors,
  .achievement-title,
  .achievement-institution,
  .achievement-year {
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