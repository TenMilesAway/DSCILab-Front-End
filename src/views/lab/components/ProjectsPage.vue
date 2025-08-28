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
        <el-menu-item index="horizontal">
          <span>横向</span>
        </el-menu-item>
        <el-menu-item index="nsfc_general">
          <span>国自然而上</span>
        </el-menu-item>
        <el-menu-item index="nsfc_youth">
          <span>国自然青年</span>
        </el-menu-item>
        <el-menu-item index="other_vertical">
          <span>其它纵向</span>
        </el-menu-item>
        <el-menu-item index="beijing_edu">
          <span>北京市教委科技一般</span>
        </el-menu-item>
        <el-menu-item index="national_edu_reform">
          <span>国家级教改</span>
        </el-menu-item>
        <el-menu-item index="provincial_edu_reform">
          <span>省部级教改</span>
        </el-menu-item>
        <el-menu-item index="other_edu_reform">
          <span>其它教改</span>
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
            <span class="project-number">{{ (currentPage - 1) * pageSize + index + 1 }}.</span>
            <el-tag 
              :type="getTypeTagType(project.type)" 
              size="small" 
              class="project-type-tag"
            >
              {{ getTypeLabel(project.type) }}
            </el-tag>
            <div class="project-content">
              <span class="project-title">{{ project.title }}</span>
              <span class="project-separator">,</span>
              <span class="project-leader">负责人：{{ project.leader }}</span>
              <span class="project-separator">,</span>
              <span class="project-funding">经费：{{ project.funding }}万元</span>
              <span class="project-separator">,</span>
              <span class="project-year">{{ project.startYear }}-{{ project.endYear }}</span>
              <span class="project-separator">.</span>
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
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'

// 项目类型定义
interface Project {
  id: number
  title: string
  leader: string
  type: 'horizontal' | 'nsfc_general' | 'nsfc_youth' | 'other_vertical' | 'beijing_edu' | 'national_edu_reform' | 'provincial_edu_reform' | 'other_edu_reform'
  funding: number
  startYear: number
  endYear: number
}

// 响应式数据
const loading = ref(false)
const activeCategory = ref('all')
const selectedYear = ref<number | null>(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const projects = ref<Project[]>([])

// 计算属性
const availableYears = computed(() => {
  const years = [...new Set(projects.value.flatMap(item => [item.startYear, item.endYear]))]
  return years.sort((a, b) => b - a)
})

const filteredProjects = computed(() => {
  let filtered = projects.value

  // 按分类筛选
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.type === activeCategory.value)
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
  const titles = {
    all: '全部项目',
    horizontal: '横向项目',
    nsfc_general: '国自然而上项目',
    nsfc_youth: '国自然青年项目',
    other_vertical: '其它纵向项目',
    beijing_edu: '北京市教委科技一般项目',
    national_edu_reform: '国家级教改项目',
    provincial_edu_reform: '省部级教改项目',
    other_edu_reform: '其它教改项目'
  }
  return titles[category] || '全部项目'
}

const getTypeLabel = (type: string) => {
  const labels = {
    horizontal: '横向',
    nsfc_general: '国自然而上',
    nsfc_youth: '国自然青年',
    other_vertical: '其它纵向',
    beijing_edu: '北京市教委科技一般',
    national_edu_reform: '国家级教改',
    provincial_edu_reform: '省部级教改',
    other_edu_reform: '其它教改'
  }
  return labels[type] || type
}

const getTypeTagType = (type: string) => {
  const types = {
    horizontal: 'warning',
    nsfc_general: 'danger',
    nsfc_youth: 'primary',
    other_vertical: 'info',
    beijing_edu: 'success',
    national_edu_reform: '',
    provincial_edu_reform: 'primary',
    other_edu_reform: 'info'
  }
  return types[type] || ''
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

// 模拟数据加载
const loadProjects = async () => {
  loading.value = true
  try {
    // 这里应该调用API获取数据
    // const response = await projectApi.getList()
    // projects.value = response.data
    
    // 模拟数据
    projects.value = [
      {
        id: 1,
        title: '企业数据挖掘与智能分析平台开发',
        leader: '张伟',
        type: 'horizontal',
        funding: 80,
        startYear: 2023,
        endYear: 2024
      },
      {
        id: 2,
        title: '基于深度学习的多模态情报分析方法研究',
        leader: '李明',
        type: 'nsfc_general',
        funding: 58,
        startYear: 2022,
        endYear: 2025
      },
      {
        id: 3,
        title: '面向开源情报的知识图谱构建与推理技术',
        leader: '王小丽',
        type: 'nsfc_youth',
        funding: 30,
        startYear: 2024,
        endYear: 2026
      },
      {
        id: 4,
        title: '网络空间安全态势感知关键技术研究',
        leader: '陈浩',
        type: 'other_vertical',
        funding: 45,
        startYear: 2023,
        endYear: 2025
      },
      {
        id: 5,
        title: '大数据环境下的隐私保护算法优化',
        leader: '刘建',
        type: 'beijing_edu',
        funding: 15,
        startYear: 2022,
        endYear: 2024
      },
      {
        id: 6,
        title: '数据科学专业课程体系改革与实践',
        leader: '赵云',
        type: 'national_edu_reform',
        funding: 20,
        startYear: 2024,
        endYear: 2026
      },
      {
        id: 7,
        title: '人工智能导论课程教学模式创新研究',
        leader: '马青',
        type: 'provincial_edu_reform',
        funding: 8,
        startYear: 2023,
        endYear: 2025
      },
      {
        id: 8,
        title: '计算机视觉实验教学平台建设',
        leader: '孙雷',
        type: 'other_edu_reform',
        funding: 12,
        startYear: 2024,
        endYear: 2026
      },
      {
        id: 9,
        title: '智能制造企业数字化转型咨询服务',
        leader: '周华',
        type: 'horizontal',
        funding: 120,
        startYear: 2023,
        endYear: 2024
      },
      {
        id: 10,
        title: '复杂网络中的异常检测算法研究',
        leader: '吴强',
        type: 'nsfc_youth',
        funding: 25,
        startYear: 2023,
        endYear: 2025
      },
      {
        id: 11,
        title: '区块链技术在供应链金融中的应用',
        leader: '郑敏',
        type: 'beijing_edu',
        funding: 18,
        startYear: 2022,
        endYear: 2024
      },
      {
         id: 12,
         title: '机器学习课程思政教学改革探索',
         leader: '林涛',
         type: 'other_edu_reform',
         funding: 6,
         startYear: 2023,
         endYear: 2024
       },
       {
         id: 13,
         title: '金融科技风控系统智能化升级',
         leader: '黄志强',
         type: 'horizontal',
         funding: 95,
         startYear: 2024,
         endYear: 2025
       },
       {
         id: 14,
         title: '跨模态信息融合的情报分析理论与方法',
         leader: '陈雪梅',
         type: 'nsfc_general',
         funding: 62,
         startYear: 2023,
         endYear: 2026
       },
       {
         id: 15,
         title: '基于图神经网络的社交网络异常行为检测',
         leader: '刘晓东',
         type: 'nsfc_youth',
         funding: 28,
         startYear: 2024,
         endYear: 2026
       },
       {
         id: 16,
         title: '工业互联网安全态势感知平台研发',
         leader: '张国庆',
         type: 'other_vertical',
         funding: 38,
         startYear: 2022,
         endYear: 2024
       },
       {
         id: 17,
         title: '面向智慧城市的多源数据融合技术研究',
         leader: '王丽华',
         type: 'beijing_edu',
         funding: 22,
         startYear: 2023,
         endYear: 2025
       },
       {
         id: 18,
         title: '新工科背景下计算机专业人才培养模式改革',
         leader: '李文博',
         type: 'national_edu_reform',
         funding: 25,
         startYear: 2023,
         endYear: 2025
       },
       {
         id: 19,
         title: '大数据分析课程虚拟仿真实验教学研究',
         leader: '赵明辉',
         type: 'provincial_edu_reform',
         funding: 12,
         startYear: 2024,
         endYear: 2026
       },
       {
         id: 20,
         title: 'Python程序设计课程线上线下混合式教学改革',
         leader: '孙丽娟',
         type: 'other_edu_reform',
         funding: 8,
         startYear: 2022,
         endYear: 2024
       },
       {
         id: 21,
         title: '电商平台用户行为分析与推荐系统优化',
         leader: '徐建国',
         type: 'horizontal',
         funding: 75,
         startYear: 2023,
         endYear: 2024
       },
       {
         id: 22,
         title: '面向复杂场景的多智能体协同决策机制研究',
         leader: '杨慧敏',
         type: 'nsfc_general',
         funding: 55,
         startYear: 2024,
         endYear: 2027
       },
       {
         id: 23,
         title: '联邦学习中的隐私保护关键技术研究',
         leader: '何志远',
         type: 'nsfc_youth',
         funding: 32,
         startYear: 2023,
         endYear: 2025
       },
       {
         id: 24,
         title: '网络舆情监测与预警系统关键技术研发',
         leader: '冯晓明',
         type: 'other_vertical',
         funding: 42,
         startYear: 2023,
         endYear: 2025
       },
       {
         id: 25,
         title: '基于区块链的数据共享安全机制研究',
         leader: '谢丽萍',
         type: 'beijing_edu',
         funding: 20,
         startYear: 2024,
         endYear: 2026
       },
       {
         id: 26,
         title: '产教融合背景下软件工程专业实践教学体系构建',
         leader: '罗志华',
         type: 'national_edu_reform',
         funding: 18,
         startYear: 2022,
         endYear: 2024
       },
       {
         id: 27,
         title: '人工智能伦理教育融入计算机课程的探索与实践',
         leader: '田雅芳',
         type: 'provincial_edu_reform',
         funding: 10,
         startYear: 2023,
         endYear: 2025
       },
       {
         id: 28,
         title: '基于项目驱动的数据结构与算法教学改革',
         leader: '胡永刚',
         type: 'other_edu_reform',
         funding: 7,
         startYear: 2024,
         endYear: 2025
       }
     ]
  } catch (error) {
    console.error('加载项目数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadProjects()
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

.project-type-tag {
  margin-right: 12px;
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
}
</style>