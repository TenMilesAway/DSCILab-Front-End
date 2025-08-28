<template>
  <div class="activity-detail">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button 
        type="primary" 
        :icon="ArrowLeft" 
        @click="handleBack"
        class="back-btn"
      >
        返回新闻列表
      </el-button>
    </div>

    <!-- 新闻详情内容 -->
    <div v-if="newsDetail" class="detail-content">
      <!-- 新闻头部信息 -->
      <div class="detail-header">
        <div class="category-tag">
          <el-tag 
            :type="getCategoryTagType(newsDetail.category)"
            size="large"
          >
            {{ getCategoryLabel(newsDetail.category) }}
          </el-tag>
        </div>
        
        <h1 class="detail-title">{{ newsDetail.title }}</h1>
        
        <div class="detail-meta">
          <div class="meta-item">
            <el-icon><Calendar /></el-icon>
            <span>发布时间：{{ formatPublishTime(newsDetail.publishTime) }}</span>
          </div>
          <div class="meta-item">
            <el-icon><View /></el-icon>
            <span>阅读量：{{ newsDetail.viewCount || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 新闻图片 -->
      <div v-if="newsDetail.image" class="detail-image">
        <img 
          :src="newsDetail.image" 
          :alt="newsDetail.title"
          @error="handleImageError"
        />
      </div>

      <!-- 新闻正文 -->
      <div class="detail-body">
        <div class="content-text" v-html="formatContent(newsDetail.content)"></div>
      </div>

      <!-- 相关新闻推荐 -->
      <div v-if="relatedNews.length > 0" class="related-news">
        <h3>相关新闻</h3>
        <div class="related-list">
          <div 
            v-for="item in relatedNews" 
            :key="item.id"
            class="related-item"
            @click="handleRelatedClick(item)"
          >
            <div class="related-image">
              <img 
                :src="item.image || defaultImage" 
                :alt="item.title"
                @error="handleImageError"
              />
            </div>
            <div class="related-info">
              <h4>{{ item.title }}</h4>
              <p>{{ item.content.substring(0, 100) }}...</p>
              <span class="related-time">{{ formatPublishTime(item.publishTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else class="error">
      <el-empty description="新闻不存在或已被删除" />
      <el-button type="primary" @click="handleBack">返回新闻列表</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ArrowLeft, Calendar, View } from '@element-plus/icons-vue'
import defaultImage from '@/assets/lab/default.jpg'

defineOptions({
  name: "ActivityDetail"
});

// 新闻类型定义
interface News {
  id: number
  title: string
  content: string
  publishTime: string
  image?: string
  category: string
  viewCount?: number
}

interface Props {
  newsId?: number
  allNews?: News[]
}

const props = withDefaults(defineProps<Props>(), {
  newsId: 0,
  allNews: () => []
})

const emit = defineEmits<{
  back: []
  newsClick: [news: News]
}>()

// 响应式数据
const loading = ref(false)
const newsDetail = ref<News | null>(null)

// 计算相关新闻（同类别的其他新闻，最多显示3条）
const relatedNews = computed(() => {
  if (!newsDetail.value || !props.allNews.length) return []
  
  return props.allNews
    .filter(item => 
      item.id !== newsDetail.value!.id && 
      item.category === newsDetail.value!.category
    )
    .slice(0, 3)
})

// 方法
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

const formatContent = (content: string) => {
  // 将换行符转换为段落标签，增强可读性
  return content
    .split('\n')
    .filter(paragraph => paragraph.trim())
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('')
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = defaultImage
}

const handleBack = () => {
  emit('back')
}

const handleRelatedClick = (news: News) => {
  emit('newsClick', news)
}

const loadNewsDetail = () => {
  if (!props.newsId || !props.allNews.length) {
    newsDetail.value = null
    return
  }
  
  loading.value = true
  
  // 模拟异步加载
  setTimeout(() => {
    const found = props.allNews.find(item => item.id === props.newsId)
    newsDetail.value = found || null
    
    // 增加阅读量（模拟）
    if (newsDetail.value) {
      newsDetail.value.viewCount = (newsDetail.value.viewCount || 0) + 1
    }
    
    loading.value = false
  }, 300)
}

// 组件挂载时加载详情
onMounted(() => {
  loadNewsDetail()
})

// 监听 newsId 变化
watch(() => props.newsId, () => {
  loadNewsDetail()
})
</script>

<style scoped lang="scss">
.activity-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 70px);
}

.back-button {
  margin-bottom: 20px;
  
  .back-btn {
    border-radius: 20px;
    padding: 8px 20px;
  }
}

.detail-content {
  .detail-header {
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e4e7ed;
    
    .category-tag {
      margin-bottom: 15px;
    }
    
    .detail-title {
      font-size: 2.2rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 20px 0;
      line-height: 1.4;
    }
    
    .detail-meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      color: #666;
      font-size: 14px;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
        
        .el-icon {
          color: #409eff;
        }
      }
    }
  }
  
  .detail-image {
    text-align: center;
    margin-bottom: 30px;
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
  
  .detail-body {
    .content-text {
      font-size: 16px;
      line-height: 1.8;
      color: #333;
      
      :deep(p) {
        margin-bottom: 16px;
        text-indent: 2em;
      }
      
      :deep(strong) {
        font-weight: 600;
      }
      
      :deep(span) {
        font-weight: inherit;
      }
    }
  }
}

.related-news {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid #e4e7ed;
  
  h3 {
    font-size: 1.5rem;
    color: #2c3e50;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .related-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .related-item {
    display: flex;
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: #e3f2fd;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .related-image {
      width: 80px;
      height: 60px;
      margin-right: 15px;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }
    }
    
    .related-info {
      flex: 1;
      
      h4 {
        font-size: 14px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0 0 8px 0;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      p {
        font-size: 12px;
        color: #666;
        margin: 0 0 8px 0;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .related-time {
        font-size: 11px;
        color: #999;
      }
    }
  }
}

.loading {
  padding: 40px;
}

.error {
  text-align: center;
  padding: 60px 20px;
  
  .el-button {
    margin-top: 20px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .activity-detail {
    padding: 15px;
  }
  
  .detail-content {
    .detail-header {
      .detail-title {
        font-size: 1.8rem;
      }
      
      .detail-meta {
        flex-direction: column;
        gap: 10px;
      }
    }
  }
  
  .related-news {
    .related-list {
      grid-template-columns: 1fr;
    }
    
    .related-item {
      flex-direction: column;
      
      .related-image {
        width: 100%;
        height: 120px;
        margin-right: 0;
        margin-bottom: 10px;
      }
    }
  }
}
</style>