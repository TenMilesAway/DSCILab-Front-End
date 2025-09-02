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
              <span class="achievement-number">{{ (currentPage - 1) * pageSize + index + 1 }}.</span>
              <el-tag 
                :type="getTypeTagType(achievement.type)" 
                size="small" 
                class="achievement-type-tag"
              >
                {{ getTypeLabel(achievement.type) }}
              </el-tag>
              <div class="achievement-content">
                <span class="achievement-authors">{{ achievement.authors.join(', ') }}</span>
                <span class="achievement-separator">.</span>
                <span class="achievement-title">{{ achievement.title }}</span>
                <span class="achievement-separator">,</span>
                <span class="achievement-institution">{{ achievement.institution }}</span>
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
                <el-tooltip :content="achievement.projectUrl ? '项目主页' : '暂无项目主页'" placement="top">
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

// 成果类型定义
interface Achievement {
  id: number
  title: string
  authors: string[]
  type: 'journal' | 'conference' | 'preprint' | 'patent' | 'software' | 'standard' | 'monograph'
  year: number
  institution: string
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

// 模拟数据加载
const loadAchievements = async () => {
  loading.value = true
  try {
    // 这里应该调用API获取数据
    // const response = await achievementApi.getList()
    // achievements.value = response.data
    
    // 模拟数据
    achievements.value = [
      // 2024年成果
      {
        id: 1,
        title: 'Attention-Enhanced Graph Neural Networks for Large-Scale Social Network Analysis',
        authors: ['Zhang Wei', 'Li Ming', 'Wang Xiaoli', 'Chen Hao'],
        type: 'journal',
        year: 2024,
        institution: 'IEEE Transactions on Neural Networks',
        githubUrl: 'https://github.com/example/attention-gnn',
        projectUrl: 'https://ai-lab.example.com/projects/attention-gnn',
        pdfUrl: 'https://example.com/papers/attention-gnn-2024.pdf'
      },
      {
        id: 2,
        title: 'Federated Learning with Differential Privacy for Healthcare Data',
        authors: ['Liu Jian', 'Zhao Yun', 'Ma Qing'],
        type: 'conference',
        year: 2024,
        institution: 'ICML 2024',
        githubUrl: 'https://github.com/example/federated-privacy',
        pdfUrl: 'https://example.com/papers/federated-privacy-2024.pdf'
      },
      {
        id: 3,
        title: 'Multimodal Transformer for Cross-Domain Knowledge Transfer',
        authors: ['Sun Lei', 'Xu Ting', 'Yang Feng', 'Zhou Bin'],
        type: 'journal',
        year: 2024,
        institution: 'Nature Machine Intelligence',
        projectUrl: 'https://multimodal-lab.example.com/transformer',
        pdfUrl: 'https://example.com/papers/multimodal-transformer-2024.pdf'
      },
      {
        id: 4,
        title: 'Real-time Object Detection in Autonomous Driving Systems',
        authors: ['Huang Gang', 'Wu Peng', 'Li Xuan'],
        type: 'conference',
        year: 2024,
        institution: 'CVPR 2024',
        githubUrl: 'https://github.com/example/realtime-detection',
        projectUrl: 'https://autonomous-lab.example.com/detection',
        pdfUrl: 'https://example.com/papers/realtime-detection-2024.pdf'
      },
      {
        id: 5,
        title: '基于区块链的分布式数据管理系统',
        authors: ['陈建国', '王丽华', '张明'],
        type: 'patent',
        year: 2024,
        institution: '中国专利局',
        githubUrl: 'https://github.com/example/blockchain-data-management'
      },
      
      // 2023年成果
      {
        id: 6,
        title: 'Deep Reinforcement Learning for Resource Allocation in 5G Networks',
        authors: ['Gao Hui', 'Lin Jie', 'Deng Kai', 'Shi Rui'],
        type: 'journal',
        year: 2023,
        institution: 'IEEE Communications Magazine',
        githubUrl: 'https://github.com/example/5g-resource-allocation',
        pdfUrl: 'https://example.com/papers/5g-resource-2023.pdf'
      },
      {
        id: 7,
        title: 'Quantum Machine Learning: Algorithms and Applications',
        authors: ['Fan Yu', 'Qin Mei', 'Luo Xiang'],
        type: 'conference',
        year: 2023,
        institution: 'NeurIPS 2023',
        projectUrl: 'https://quantum-lab.example.com/ml-algorithms',
        pdfUrl: 'https://example.com/papers/quantum-ml-2023.pdf'
      },
      {
        id: 8,
        title: 'Explainable AI for Medical Image Diagnosis',
        authors: ['Tan Li', 'He Jun', 'Cao Ning', 'Jiang Wei'],
        type: 'journal',
        year: 2023,
        institution: 'Medical Image Analysis',
        githubUrl: 'https://github.com/example/explainable-medical-ai',
        projectUrl: 'https://medical-ai.example.com/explainable',
        pdfUrl: 'https://example.com/papers/explainable-medical-2023.pdf'
      },
      {
        id: 9,
        title: '智能推荐系统软件平台V2.0',
        authors: ['李强', '赵敏', '孙涛'],
        type: 'software',
        year: 2023,
        institution: '国家版权局',
        githubUrl: 'https://github.com/example/recommendation-platform',
        projectUrl: 'https://ai-lab.example.com/recommendation'
      },
      {
        id: 10,
        title: 'Edge Computing Architecture for IoT Applications',
        authors: ['Xu Dan', 'Zhu Hao', 'Song Yan'],
        type: 'conference',
        year: 2023,
        institution: 'INFOCOM 2023',
        githubUrl: 'https://github.com/example/edge-iot-architecture',
        pdfUrl: 'https://example.com/papers/edge-iot-2023.pdf'
      },
      
      // 2022年成果
      {
        id: 11,
        title: 'Adversarial Training for Robust Neural Networks',
        authors: ['Kong Fei', 'Meng Jia', 'Bai Xin', 'Cui Yang'],
        type: 'journal',
        year: 2022,
        institution: 'Journal of Machine Learning Research',
        githubUrl: 'https://github.com/example/adversarial-training',
        pdfUrl: 'https://example.com/papers/adversarial-training-2022.pdf'
      },
      {
        id: 12,
        title: 'Blockchain-based Secure Data Sharing in Healthcare',
        authors: ['Ding Lu', 'Feng Qian', 'Guo Shan'],
        type: 'conference',
        year: 2022,
        institution: 'ICCV 2022',
        projectUrl: 'https://blockchain-health.example.com/secure-sharing',
        pdfUrl: 'https://example.com/papers/blockchain-healthcare-2022.pdf'
      },
      {
        id: 13,
        title: 'Natural Language Processing for Code Generation',
        authors: ['Hu Tao', 'Jin Mei', 'Liang Bo', 'Nie Kun'],
        type: 'journal',
        year: 2022,
        institution: 'ACM Transactions on Software Engineering',
        githubUrl: 'https://github.com/example/nlp-code-generation',
        projectUrl: 'https://nlp-lab.example.com/code-generation',
        pdfUrl: 'https://example.com/papers/nlp-code-2022.pdf'
      },
      {
        id: 14,
        title: '基于人工智能的网络安全防护系统',
        authors: ['王志强', '刘晓东', '张华'],
        type: 'patent',
        year: 2022,
        institution: '中国专利局',
        projectUrl: 'https://security-lab.example.com/ai-protection'
      },
      {
        id: 15,
        title: 'Computer Vision for Autonomous Robotics',
        authors: ['Pan Wei', 'Shi Jing', 'Yu Heng'],
        type: 'conference',
        year: 2022,
        institution: 'IROS 2022',
        githubUrl: 'https://github.com/example/cv-autonomous-robotics',
        pdfUrl: 'https://example.com/papers/cv-robotics-2022.pdf'
      },
      
      // 2021年成果
      {
        id: 16,
        title: 'Distributed Machine Learning with Privacy Preservation',
        authors: ['Yao Ming', 'Qiu Ling', 'Ren Fang', 'Shen Kai'],
        type: 'journal',
        year: 2021,
        institution: 'IEEE Transactions on Parallel and Distributed Systems',
        githubUrl: 'https://github.com/example/distributed-ml-privacy',
        pdfUrl: 'https://example.com/papers/distributed-ml-2021.pdf'
      },
      {
        id: 17,
        title: 'Graph Neural Networks for Social Network Analysis',
        authors: ['Cai Jun', 'Du Xin', 'Huang Ping'],
        type: 'conference',
        year: 2021,
        institution: 'ICLR 2021',
        githubUrl: 'https://github.com/example/gnn-social-analysis',
        projectUrl: 'https://social-lab.example.com/gnn-analysis',
        pdfUrl: 'https://example.com/papers/gnn-social-2021.pdf'
      },
      {
        id: 18,
        title: '云计算资源调度优化算法研究',
        authors: ['郑海涛', '林雅芳', '吴建华'],
        type: 'monograph',
        year: 2021,
        institution: '科学出版社',
        pdfUrl: 'https://example.com/books/cloud-scheduling-2021.pdf'
      },
      {
        id: 19,
        title: 'Time Series Forecasting with Deep Learning',
        authors: ['Zheng Hao', 'Liu Yan', 'Chen Xu'],
        type: 'journal',
        year: 2021,
        institution: 'IEEE Transactions on Neural Networks and Learning Systems',
        githubUrl: 'https://github.com/example/time-series-forecasting',
        pdfUrl: 'https://example.com/papers/time-series-2021.pdf'
      },
      {
        id: 20,
        title: '大数据分析处理软件系统V1.5',
        authors: ['何建军', '苏丽娜', '马志远'],
        type: 'software',
        year: 2025,
        institution: '国家版权局',
        githubUrl: 'https://github.com/example/bigdata-analysis-system',
        projectUrl: 'https://bigdata-lab.example.com/analysis-system'
      },
      
      // 2020年成果
      {
        id: 21,
        title: 'Federated Learning for Mobile Edge Computing',
        authors: ['Xu Lei', 'Wang Jie', 'Zhang Qi', 'Li Nan'],
        type: 'journal',
        year: 2020,
        institution: 'IEEE Transactions on Mobile Computing',
        githubUrl: 'https://github.com/example/federated-edge-computing',
        pdfUrl: 'https://example.com/papers/federated-edge-2020.pdf'
      },
      {
        id: 22,
        title: 'Attention Mechanisms in Natural Language Processing',
        authors: ['Song Mei', 'Zhao Bin', 'Fu Gang'],
        type: 'conference',
        year: 2020,
        institution: 'ACL 2020',
        projectUrl: 'https://nlp-lab.example.com/attention-mechanisms',
        pdfUrl: 'https://example.com/papers/attention-nlp-2020.pdf'
      },
      {
        id: 23,
        title: '物联网数据传输协议标准',
        authors: ['陈志华', '王美玲', '李国强'],
        type: 'standard',
        year: 2020,
        institution: '国家标准化管理委员会',
      },
      {
        id: 24,
        title: 'Deep Learning for Medical Image Segmentation',
        authors: ['Peng Xiao', 'Gu Hua', 'Dai Lin'],
        type: 'journal',
        year: 2020,
        institution: 'Medical Image Analysis',
        githubUrl: 'https://github.com/example/medical-image-segmentation',
        pdfUrl: 'https://example.com/papers/medical-segmentation-2020.pdf'
      },
      {
        id: 25,
        title: '基于机器学习的智能制造系统',
        authors: ['黄志明', '徐丽萍', '周建国'],
        type: 'patent',
        year: 2020,
        institution: '中国专利局',
        projectUrl: 'https://manufacturing-lab.example.com/intelligent-system'
      }
    ]
  } catch (error) {
    console.error('加载成果数据失败:', error)
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

.achievement-type-tag {
  flex-shrink: 0;
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
  
  .achievement-number {
    margin-bottom: 8px;
  }
  
  .achievement-type-tag {
    margin-bottom: 8px;
    margin-right: 0;
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