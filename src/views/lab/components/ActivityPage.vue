<template>
  <div class="activities-page">
    <!-- 新闻详情页面 -->
    <ActivityDetail 
      v-if="showDetail"
      :news-id="selectedNewsId"
      :all-news="news"
      @back="handleBackToList"
      @news-click="handleDetailNewsClick"
    />
    
    <!-- 新闻列表页面 -->
    <template v-else>
      <!-- 左侧活动分类导航 -->
      <div class="sidebar">
      <div class="sidebar-header">
        <h3>新闻分类</h3>
      </div>
      <el-menu
        :default-active="activeCategory"
        class="category-menu"
        @select="handleCategorySelect"
      >
        <el-menu-item index="all">
          <span>全部新闻</span>
        </el-menu-item>
        <el-menu-item index="academic">
          <span>学术动态</span>
        </el-menu-item>
        <el-menu-item index="research">
          <span>科研进展</span>
        </el-menu-item>
        <el-menu-item index="achievement">
          <span>成果发布</span>
        </el-menu-item>
        <el-menu-item index="cooperation">
          <span>合作交流</span>
        </el-menu-item>
        <el-menu-item index="activity">
          <span>活动报道</span>
        </el-menu-item>
        <el-menu-item index="notice">
          <span>通知公告</span>
        </el-menu-item>
        <el-menu-item index="other">
          <span>其他新闻</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部筛选栏 -->
      <div class="filter-bar">
        <div class="filter-left">
          <h2>{{ getCategoryTitle(activeCategory) }}</h2>
          <span class="count">共 {{ filteredNews.length }} 条新闻</span>
        </div>
        <div class="filter-right">
          <!-- 时间筛选 -->
          <el-select
            v-model="selectedTime"
            placeholder="发布时间"
            clearable
            class="time-select"
            @change="handleTimeChange"
          >
            <el-option label="最近一周" value="recent" />
            <el-option label="最近一月" value="month" />
            <el-option label="最近一年" value="year" />
          </el-select>
          
          <!-- 搜索框 -->
          <el-input
            v-model="searchKeyword"
            placeholder="搜索新闻标题或内容"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 新闻网格布局 -->
      <div class="news-grid">
        <div v-if="loading" class="loading">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else-if="filteredNews.length === 0" class="empty">
          <el-empty description="暂无相关新闻" />
        </div>
        <div v-else class="grid-container">
          <div
            v-for="newsItem in paginatedNews"
            :key="newsItem.id"
            class="news-card"
            @click="handleNewsClick(newsItem)"
          >
            <!-- 新闻分类标签 -->
            <div class="news-category">
              <el-tag 
                :type="getCategoryTagType(newsItem.category)" 
                size="small"
                class="category-tag"
              >
                {{ getCategoryLabel(newsItem.category) }}
              </el-tag>
            </div>

            <!-- 新闻图片 -->
            <div class="news-image">
              <!-- 图片加载动画 -->
              <div 
                v-if="imageLoadingStates[newsItem.id]" 
                class="image-loading"
              >
                <div class="loading-spinner"></div>
                <span class="loading-text">加载中...</span>
              </div>
              
              <!-- 实际图片 -->
              <img 
                v-show="imageLoadedStates[newsItem.id]" 
                :src="newsItem.image || defaultImage" 
                :alt="newsItem.title" 
                :data-news-id="newsItem.id"
                @load="handleImageLoad"
                @error="handleImageError"
                class="news-img"
              />
              
              <!-- 图片遮罩层 -->
              <div 
                v-show="imageLoadedStates[newsItem.id]" 
                class="image-overlay"
              >
                <el-icon class="view-icon"><View /></el-icon>
              </div>
            </div>

            <!-- 新闻内容 -->
            <div class="news-content">
              <h3 class="news-title">{{ newsItem.title }}</h3>
              <p class="news-description">{{ newsItem.content }}</p>
              
              <div class="news-meta">
                <div class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ formatPublishTime(newsItem.publishTime) }}</span>
                </div>
              </div>
            </div>

            <!-- 新闻操作按钮 -->
            <div class="news-actions">
              <el-button 
                type="primary" 
                size="small"
                @click.stop="handleViewDetails(newsItem)"
              >
                查看详情
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="filteredNews.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48]"
          :total="filteredNews.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Search, View, Calendar, Location, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import defaultImage from '@/assets/lab/default.jpg'
import ActivityDetail from './ActivityDetail.vue'

// 新闻类型定义
interface News {
  id: number
  title: string
  content: string
  publishTime: string
  image: string
  category: string
}

// 响应式数据
const loading = ref(false)
const activeCategory = ref('all')
const selectedTime = ref<string | null>(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const news = ref<News[]>([])
// 详情页面状态管理
const showDetail = ref(false)
const selectedNewsId = ref<number>(0)
// 图片加载状态管理
const imageLoadingStates = ref<Record<number, boolean>>({})
const imageLoadedStates = ref<Record<number, boolean>>({})

// 计算属性
const filteredNews = computed(() => {
  let filtered = news.value

  // 按分类筛选
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.category === activeCategory.value)
  }

  // 按时间筛选
  if (selectedTime.value) {
    const now = new Date()
    filtered = filtered.filter(item => {
      const newsDate = new Date(item.publishTime)
      const diffTime = now.getTime() - newsDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      switch (selectedTime.value) {
        case 'recent':
          return diffDays <= 7
        case 'month':
          return diffDays <= 30
        case 'year':
          return diffDays <= 365
        default:
          return true
      }
    })
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.content.toLowerCase().includes(keyword)
    )
  }

  // 按发布时间排序
  return filtered.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime())
})

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredNews.value.slice(start, end)
})

// 方法
const getCategoryTitle = (category: string) => {
  const titles = {
    all: '全部新闻',
    academic: '学术动态',
    research: '科研进展',
    achievement: '成果发布',
    cooperation: '合作交流',
    activity: '活动报道',
    notice: '通知公告',
    other: '其他新闻'
  }
  return titles[category] || '全部新闻'
}

const getCategoryLabel = (category: string) => {
  const labels = {
    academic: '学术动态',
    research: '科研进展',
    achievement: '成果发布',
    cooperation: '合作交流',
    activity: '活动报道',
    notice: '通知公告',
    other: '其他新闻'
  }
  return labels[category] || category
}

const getCategoryTagType = (category: string) => {
  const types = {
    academic: 'primary',
    research: 'success',
    achievement: 'warning',
    cooperation: 'info',
    activity: 'danger',
    notice: '',
    other: 'info'
  }
  return types[category] || ''
}

const formatPublishTime = (publishTime: string) => {
  const date = new Date(publishTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleCategorySelect = (index: string) => {
  activeCategory.value = index
  currentPage.value = 1
  // 分类切换时预加载图片
  setTimeout(() => {
    preloadCurrentPageImages()
  }, 100)
}

const handleTimeChange = () => {
  currentPage.value = 1
  // 时间筛选时预加载图片
  setTimeout(() => {
    preloadCurrentPageImages()
  }, 100)
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  // 页面大小改变时预加载图片
  setTimeout(() => {
    preloadCurrentPageImages()
  }, 100)
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 页面切换时预加载图片
  setTimeout(() => {
    preloadCurrentPageImages()
  }, 100)
}

const handleNewsClick = (newsItem: News) => {
  // 处理新闻卡片点击事件
  showDetail.value = true
  selectedNewsId.value = newsItem.id
}

const handleViewDetails = (newsItem: News) => {
  // 处理查看详情按钮点击事件
  showDetail.value = true
  selectedNewsId.value = newsItem.id
}

const handleBackToList = () => {
  // 返回新闻列表
  showDetail.value = false
  selectedNewsId.value = 0
}

const handleDetailNewsClick = (newsItem: News) => {
  // 处理详情页面中的相关新闻点击
  selectedNewsId.value = newsItem.id
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  const newsId = parseInt(img.getAttribute('data-news-id') || '0')
  img.src = defaultImage
  // 标记图片加载完成（即使是默认图片）
  imageLoadingStates.value[newsId] = false
  imageLoadedStates.value[newsId] = true
}

// 处理图片开始加载
const handleImageLoadStart = (newsId: number) => {
  imageLoadingStates.value[newsId] = true
  imageLoadedStates.value[newsId] = false
}

// 处理图片加载完成
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  const newsId = parseInt(img.getAttribute('data-news-id') || '0')
  imageLoadingStates.value[newsId] = false
  imageLoadedStates.value[newsId] = true
}

// 预加载图片
const preloadImage = (src: string, newsId: number) => {
  if (!src || src === defaultImage) {
    imageLoadingStates.value[newsId] = false
    imageLoadedStates.value[newsId] = true
    return
  }
  
  handleImageLoadStart(newsId)
  
  const img = new Image()
  img.onload = () => {
    imageLoadingStates.value[newsId] = false
    imageLoadedStates.value[newsId] = true
  }
  img.onerror = () => {
    imageLoadingStates.value[newsId] = false
    imageLoadedStates.value[newsId] = true
  }
  img.src = src
}

// 预加载当前页面的所有图片
const preloadCurrentPageImages = () => {
  paginatedNews.value.forEach(newsItem => {
    if (newsItem.image && !imageLoadedStates.value[newsItem.id]) {
      preloadImage(newsItem.image, newsItem.id)
    } else if (!newsItem.image) {
      // 如果没有图片，直接标记为已加载（将显示默认图片）
      imageLoadingStates.value[newsItem.id] = false
      imageLoadedStates.value[newsItem.id] = true
    }
  })
}

// 模拟数据加载
const loadNews = async () => {
  loading.value = true
  try {
    // 这里应该调用API获取数据
    // const response = await newsApi.getList()
    // news.value = response.data
    
    // 模拟数据
    news.value = [
      {
        id: 1,
        title: '实验室在顶级期刊发表重要研究成果',
        content: '我实验室在人工智能领域取得重大突破，相关研究成果在国际顶级期刊《Nature Machine Intelligence》上发表。该研究提出了一种新的深度学习架构，在多个基准数据集上取得了显著的性能提升。',
        publishTime: '2025-01-15 10:30:00',
        image: '/placeholder-avatar.jpg',
        category: 'achievement'
      },
      {
        id: 2,
        title: '人工智能前沿技术研讨会成功举办',
        content: '1月20日，我实验室成功举办了人工智能前沿技术研讨会，来自国内外的50多位专家学者参加了此次会议。会议围绕深度学习、自然语言处理、计算机视觉等热点话题展开深入讨论。',
        publishTime: '2024-01-21 14:20:00',
        image: '/placeholder-avatar.jpg',
        category: 'activity'
      },
      {
        id: 3,
        title: '与清华大学建立战略合作关系',
        content: '近日，我实验室与清华大学计算机系正式签署战略合作协议，双方将在人工智能、机器学习等领域开展深入合作，共同推进相关技术的研发和应用。',
        publishTime: '2024-01-18 09:15:00',
        image: '/placeholder-avatar.jpg',
        category: 'cooperation'
      },
      {
        id: 4,
        title: '实验室获得国家自然科学基金重点项目资助',
        content: '我实验室申报的"基于深度学习的智能决策系统关键技术研究"项目获得国家自然科学基金重点项目资助，资助金额达300万元，项目执行期为4年。',
        publishTime: '2024-01-12 16:45:00',
        image: '/placeholder-avatar.jpg',
        category: 'academic'
      },
      {
        id: 5,
        title: '博士生张三获得全国优秀博士论文奖',
        content: '我实验室博士生张三的学位论文"多模态深度学习理论与应用研究"荣获2023年度全国优秀博士学位论文奖。该论文在多模态学习领域提出了创新性理论和方法。',
        publishTime: '2024-01-10 11:30:00',
        image: '/placeholder-avatar.jpg',
        category: 'achievement'
      },
      {
        id: 6,
        title: '关于实验室寒假期间安全管理的通知',
        content: '为确保寒假期间实验室安全，现就相关事项通知如下：1. 离校前请关闭所有电源设备；2. 贵重物品请妥善保管；3. 如需进入实验室请提前报备。详细要求请查看附件。',
        publishTime: '2024-01-08 08:00:00',
        image: '/placeholder-avatar.jpg',
        category: 'notice'
      },
      {
        id: 7,
        title: '机器学习算法优化研究取得新进展',
        content: '实验室在机器学习算法优化方面取得重要进展，提出的新型优化算法在收敛速度和精度方面都有显著提升。相关论文已被ICML 2024会议接收。',
        publishTime: '2024-01-25 16:20:00',
        image: '',
        category: 'research'
      },
      {
        id: 8,
        title: '实验室与华为公司签署产学研合作协议',
        content: '1月22日，我实验室与华为技术有限公司正式签署产学研合作协议，双方将在5G通信、边缘计算等前沿技术领域开展深度合作，共同推动技术创新和产业化应用。',
        publishTime: '2024-01-22 10:45:00',
        image: '/placeholder-avatar.jpg',
        category: 'cooperation'
      },
      {
        id: 9,
        title: '第三届国际人工智能学术会议筹备启动',
        content: '由我实验室主办的第三届国际人工智能学术会议筹备工作正式启动。会议将于2024年6月在北京举行，预计将有来自全球30多个国家的500余名专家学者参会。',
        publishTime: '2024-01-19 14:30:00',
        image: '',
        category: 'activity'
      },
      {
        id: 10,
        title: '计算机视觉团队在CVPR发表多篇论文',
        content: '我实验室计算机视觉团队在国际顶级会议CVPR 2024上发表了4篇高质量论文，涉及目标检测、图像分割、三维重建等多个研究方向，展现了团队在计算机视觉领域的强劲实力。',
        publishTime: '2024-01-17 09:20:00',
        image: '/placeholder-avatar.jpg',
        category: 'achievement'
      },
      {
        id: 11,
        title: '实验室开放日活动圆满结束',
        content: '1月13日，实验室举办了面向社会公众的开放日活动。活动期间，近200名参观者深入了解了实验室的研究方向、科研成果和发展历程，增进了公众对人工智能技术的认识和理解。',
        publishTime: '2024-01-13 17:00:00',
        image: '',
        category: 'activity'
      },
      {
        id: 12,
        title: '自然语言处理研究获得重要突破',
        content: '实验室自然语言处理团队在大语言模型训练和优化方面取得重要突破，开发的新型预训练模型在多项NLP任务上刷新了性能记录，相关技术已申请多项发明专利。',
        publishTime: '2024-01-11 11:15:00',
        image: '/placeholder-avatar.jpg',
        category: 'research'
      },
      {
        id: 13,
        title: '关于2024年春季学期研究生招生的通知',
        content: '现将2024年春季学期研究生招生相关事宜通知如下：1. 报名时间：2月1日-2月15日；2. 考试时间：2月20日；3. 招生名额：博士生5名，硕士生15名。详细信息请查看招生简章。',
        publishTime: '2024-01-09 08:30:00',
        image: '',
        category: 'notice'
      },
      {
        id: 14,
        title: '实验室获批建设省级重点实验室',
        content: '经过严格评审，我实验室正式获批建设"人工智能与智能系统省级重点实验室"。这标志着实验室在人工智能领域的研究实力得到了权威认可，为未来发展奠定了坚实基础。',
        publishTime: '2024-01-07 15:40:00',
        image: '/placeholder-avatar.jpg',
        category: 'academic'
      },
      {
        id: 15,
        title: '青年学者论坛成功举办',
        content: '1月6日，实验室成功举办了第二届青年学者论坛。来自国内外知名高校和科研院所的30余名青年学者齐聚一堂，围绕人工智能前沿技术进行了深入交流和讨论。',
        publishTime: '2024-01-06 16:25:00',
        image: '',
        category: 'activity'
      },
      {
        id: 16,
        title: '强化学习算法在机器人控制中的应用研究',
        content: '实验室机器人团队在强化学习算法应用方面取得新进展，开发的智能控制系统能够让机器人在复杂环境中实现自主导航和任务执行，相关成果在Robotics期刊发表。',
        publishTime: '2024-01-05 13:50:00',
        image: '/placeholder-avatar.jpg',
        category: 'research'
      },
      {
        id: 17,
        title: '实验室与MIT建立学术交流合作关系',
        content: '近日，我实验室与美国麻省理工学院(MIT)计算机科学与人工智能实验室正式建立学术交流合作关系，双方将在学者互访、学生交换、联合研究等方面开展全面合作。',
        publishTime: '2024-01-04 10:10:00',
        image: '',
        category: 'cooperation'
      },
      {
        id: 18,
        title: '2023年度实验室年终总结大会召开',
        content: '12月30日，实验室召开了2023年度年终总结大会。会议回顾了一年来的工作成果，表彰了优秀团队和个人，并对2024年的工作进行了全面部署和规划。',
        publishTime: '2023-12-30 14:00:00',
        image: '/placeholder-avatar.jpg',
        category: 'other'
      },
      {
        id: 19,
        title: '深度学习框架优化项目启动',
        content: '实验室正式启动深度学习框架优化项目，旨在开发更高效、更易用的深度学习训练和推理框架。项目预计投入研发资金500万元，研发周期为3年。',
        publishTime: '2023-12-28 09:30:00',
        image: '',
        category: 'research'
      },
      {
        id: 20,
        title: '关于元旦假期实验室管理安排的通知',
        content: '根据学校统一安排，现将元旦假期实验室管理相关事宜通知如下：1. 假期时间：12月30日-1月1日；2. 值班安排：每日安排1名研究生值班；3. 紧急联系方式：实验室主任手机。',
        publishTime: '2023-12-27 16:20:00',
        image: '/placeholder-avatar.jpg',
        category: 'notice'
      }
    ]
  } catch (error) {
    console.error('加载新闻数据失败:', error)
  } finally {
    loading.value = false
    // 数据加载完成后预加载当前页面的图片
    setTimeout(() => {
      preloadCurrentPageImages()
    }, 100)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadNews()
})

// 监听搜索关键词变化
watch(searchKeyword, () => {
  currentPage.value = 1
  // 搜索时预加载图片
  setTimeout(() => {
    preloadCurrentPageImages()
  }, 100)
})

// 监听分页数据变化
watch(paginatedNews, () => {
  // 当分页数据变化时预加载图片
  setTimeout(() => {
    preloadCurrentPageImages()
  }, 50)
}, { flush: 'post' })
</script>

<style scoped lang="scss">
.activities-page {
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

.time-select {
  width: 120px;
}

.search-input {
  width: 300px;
}

.news-grid {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.loading,
.empty {
  padding: 40px;
  text-align: center;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.news-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
}

.news-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}



.news-category {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  display: flex;
  gap: 6px;
}

.category-tag {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9) !important;
}

.news-image {
  position: relative;
  height: 180px;
  overflow: hidden;
  background-color: #f5f7fa;
}

.news-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  z-index: 2;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e4e7ed;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

.loading-text {
  font-size: 12px;
  color: #909399;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.news-card:hover .news-img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.8), rgba(156, 39, 176, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 3;
}

.news-card:hover .image-overlay {
  opacity: 1;
}

.view-icon {
  font-size: 32px;
  color: white;
}

.news-content {
  padding: 20px;
}

.news-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-meta {
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 13px;
  margin-bottom: 6px;
}

.meta-item .el-icon {
  margin-right: 6px;
  font-size: 14px;
}



.news-actions {
  padding: 0 20px 20px;
  display: flex;
  justify-content: center;
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .activities-page {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
  }
  
  .filter-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filter-right {
    justify-content: space-between;
  }
  
  .search-input {
    width: 200px;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>