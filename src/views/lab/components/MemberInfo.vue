<template>
  <div class="member-info-container">
    <!-- 加载状态 -->
    <Transition name="fade" mode="out-in">
      <div v-if="loading" class="loading-container">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">正在加载成员信息...</p>
        </div>
      </div>
      <!-- 主要内容区域 -->
       <div v-else-if="member" class="main-content" :class="{ 'content-loaded': contentLoaded }">
      <!-- 左侧信息定位导航 -->
        <div class="info-sidebar animate-item">
        <div class="sidebar-header">
          <button 
            @click="$emit('back')"
            class="back-button"
          >
            返回
          </button>
          <h3>信息定位</h3>
        </div>
        <div class="nav-list">
          <div 
            v-for="item in navigationItems" 
            :key="item.key"
            class="nav-item"
            :class="{ active: activeNavItem === item.key }"
            @click="scrollToSection(item.id, item.key)"
          >
            <span class="nav-text">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area animate-item">
        <div class="member-detail-card">
        <!-- 头像和基本信息 -->
        <div class="member-header animate-item">
          <div class="avatar-section">
            <img 
              v-if="member.photo"
              :src="member.photo"
              :alt="member.name"
              class="member-avatar"
              @error="handleImageError"
            />
            <img 
              v-else
              src="/src/assets/lab/avatar.jpg"
              :alt="member.name"
              class="member-avatar"
              @error="handleImageError"
            />
          </div>
          <div class="basic-info">
            <h1 class="member-name">{{ member.name }}</h1>
            <p class="member-title">{{ member.title }}</p>
            <p class="member-status" :class="member.category">
              {{ getCategoryName(member.category) }}
            </p>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="detail-sections animate-item">
          <!-- 个人信息 -->
          <div id="personal-info-section" class="info-section">
            <h3 class="section-title">个人信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">姓名:</span>
                <span class="value">{{ member.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">职位:</span>
                <span class="value">{{ member.title }}</span>
              </div>
              <div class="info-item">
                <span class="label">分类:</span>
                <span class="value">{{ getCategoryName(member.category) }}</span>
              </div>
              <div class="info-item" v-if="member.graduation">
                <span class="label">毕业去向:</span>
                <span class="value">{{ member.graduation }}</span>
              </div>
            </div>
          </div>

          <!-- 研究方向 -->
          <div id="research-areas-section" class="info-section">
            <h3 class="section-title">研究方向</h3>
            <div class="research-areas">
              <span class="research-tag">机器学习</span>
              <span class="research-tag">深度学习</span>
              <span class="research-tag">计算机视觉</span>
            </div>
          </div>

          <!-- 项目经历 -->
          <div id="projects-section" class="info-section">
            <h3 class="section-title">项目经历</h3>
            <div class="projects-list">
              <div class="project-item">
                <h4 class="project-title">基于深度学习的图像识别系统</h4>
                <p class="project-description">开发了一套高精度的图像识别系统，准确率达到95%以上</p>
                <span class="project-date">2023-01 - 2023-12</span>
              </div>
            </div>
          </div>

          <!-- 发表论文 -->
          <div id="publications-section" class="info-section">
            <h3 class="section-title">发表论文</h3>
            <div class="publications-list">
              <div class="publication-item">
                <h4 class="paper-title">Deep Learning for Image Recognition: A Comprehensive Survey</h4>
                <p class="paper-authors">{{ member.name }}, 李四, 王五</p>
                <p class="paper-venue">IEEE Transactions on Pattern Analysis and Machine Intelligence (2023)</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref, nextTick, onMounted, onUnmounted, watch } from 'vue';

interface Member {
  id: number;
  name: string;
  title: string;
  graduation?: string;
  category: string;
  photo?: string;
}

interface Props {
  member: Member | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  back: [];
}>();

// 加载状态
const loading = ref(true);
const contentLoaded = ref(false);

// 模拟数据加载过程
const loadMemberData = async () => {
  loading.value = true;
  contentLoaded.value = false;
  
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  loading.value = false;
  // 延迟一点时间让内容逐步显示
  setTimeout(() => {
    contentLoaded.value = true;
  }, 100);
};

// 监听 member 变化
watch(() => props.member, (newMember) => {
  if (newMember) {
    loadMemberData();
  }
}, { immediate: true });

// 信息定位导航配置
const navigationItems = [
  { key: 'personal-info', name: '个人信息', id: 'personal-info-section' },
  { key: 'research-areas', name: '研究方向', id: 'research-areas-section' },
  { key: 'projects', name: '项目经历', id: 'projects-section' },
  { key: 'publications', name: '发表论文', id: 'publications-section' }
];

const activeNavItem = ref('personal-info');

// 滚动到指定部分
const scrollToSection = (sectionId: string, navKey: string) => {
  activeNavItem.value = navKey;
  nextTick(() => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  });
};

// 分类映射
const categoryMap = {
  'professor': '教授',
  'associate_professor': '副教授',
  'lecturer': '讲师',
  'postdoc': '博士后',
  'phd': '博士生',
  'master': '硕士生',
  'undergraduate': '本科生',
  'alumni': '校友'
};

// 获取分类名称
const getCategoryName = (category: string): string => {
  return categoryMap[category as keyof typeof categoryMap] || category;
};

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  const defaultAvatar = '/src/assets/lab/avatar.jpg';
  // 防止无限循环，只有当前src不是默认头像时才切换
  if (img.src !== window.location.origin + defaultAvatar) {
    img.src = defaultAvatar;
  } else {
    // 如果默认头像也加载失败，移除src属性，显示alt文本
    img.removeAttribute('src');
  }
};

// 滚动监听功能
const handleScroll = () => {
  const sections = navigationItems.map(item => ({
    id: item.id,
    key: item.key,
    element: document.getElementById(item.id)
  })).filter(section => section.element);

  let currentSection = sections[0]?.key || 'personal-info';
  
  // 从上到下遍历sections，找到第一个在视窗中的section
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    const sectionElement = section.element!;
    // 查找section内的标题元素
    const titleElement = sectionElement.querySelector('.section-title');
    const targetElement = titleElement || sectionElement;
    
    const rect = targetElement.getBoundingClientRect();
    // 如果标题顶部已经进入视窗上方200px范围内，则认为是当前section
    if (rect.top <= 200) {
      currentSection = section.key;
      break;
    }
  }
  
  activeNavItem.value = currentSection;
};

// 组件挂载时添加滚动监听
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  // 初始化时检查一次
  handleScroll();
});

// 组件卸载时移除滚动监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* 成员详情视图样式 */
.member-info-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  padding: 80px 20px;
  box-sizing: border-box;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  width: 100%;
  padding-top: 80px;
}

.loading-content {
  text-align: center;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(148, 163, 184, 0.2);
  border: 1px solid rgba(226, 232, 240, 0.3);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.loading-text {
  color: #64748b;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 内容加载动画 */
.animate-item {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content.content-loaded .animate-item {
  opacity: 1;
  transform: translateY(0);
}

.main-content.content-loaded .info-sidebar {
  transition-delay: 0.1s;
}

.main-content.content-loaded .member-header {
  transition-delay: 0.2s;
}

.main-content.content-loaded .detail-sections {
  transition-delay: 0.3s;
}

.main-content.content-loaded .content-area {
  transition-delay: 0.15s;
}



.main-content {
  display: flex;
  gap: 30px;
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  align-items: flex-start;
  padding: 0 20px;
}

.info-sidebar {
  width: 280px;
  position: sticky;
  top: 100px;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(148, 163, 184, 0.15);
  border: 1px solid rgba(226, 232, 240, 0.3);
  
  .sidebar-header {
    margin-bottom: 20px;
    position: relative;
    
    .back-button {
      position: absolute;
      top: 8px;
      left: 0px;
      background: linear-gradient(135deg, #3c7ce2, #1d4ed8);
      color: rgb(255, 255, 255);
      border: none;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      z-index: 10;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }
    }
    
    h3 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #1e293b;
      text-align: center;
      margin: 0;
      padding-top: 8px;
    }
  }
  
  .nav-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.5);
    
    &:hover {
      background: rgba(59, 130, 246, 0.1);
      transform: translateX(4px);
    }
    
    &.active {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    .nav-text {
      font-weight: 500;
    }
  }
}

.content-area {
  flex: 1;
  padding: 0;
  min-width: 0;
  width: 100%;
}

.member-detail-card {
  width: 100%;
  margin: 0;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(148, 163, 184, 0.2);
  border: 1px solid rgba(226, 232, 240, 0.3);
  overflow: hidden;
}

.member-header {
  display: flex;
  align-items: center;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
}

.member-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(29, 78, 216, 0.9));
  backdrop-filter: blur(10px);
}

.member-header > * {
  position: relative;
  z-index: 1;
}

.avatar-section {
  margin-right: 30px;
}

.member-avatar {
  width: 120px;
  height: 150px;
  border-radius: 12px;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 12px;
  text-align: center;
  transition: none; /* 移除过渡效果避免闪烁 */
}

.basic-info h1 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.basic-info p {
  margin: 6px 0;
  opacity: 0.95;
}

.member-title {
  font-size: 18px;
  font-weight: 500;
}

.member-status {
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  display: inline-block;
  margin-top: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.detail-sections {
  padding: 40px;
}

.info-section {
  margin-bottom: 40px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 1px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(148, 163, 184, 0.15);
}

.info-item .label {
  font-weight: 600;
  color: #475569;
  min-width: 90px;
  margin-right: 16px;
}

.info-item .value {
  color: #1e293b;
  font-weight: 500;
}

.research-areas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.research-tag {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.1));
  color: #1d4ed8;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
}

.research-tag:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.2));
  transform: translateY(-1px);
}

.projects-list, .publications-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.project-item, .publication-item {
  padding: 24px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  border-left: 4px solid #3b82f6;
  box-shadow: 0 4px 16px rgba(148, 163, 184, 0.1);
  transition: all 0.3s ease;
}

.project-item:hover, .publication-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(148, 163, 184, 0.15);
  background: rgba(255, 255, 255, 0.9);
}

.project-title, .paper-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  line-height: 1.4;
}

.project-description, .paper-authors, .paper-venue {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.project-date {
  color: #94a3b8;
  font-size: 12px;
  font-style: italic;
  font-weight: 500;
}

.no-data {
  color: #94a3b8;
  font-style: italic;
  text-align: center;
  padding: 32px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 2px dashed rgba(148, 163, 184, 0.3);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    gap: 20px;
    padding: 0 15px;
  }
  
  .info-sidebar {
    width: 260px;
  }
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
    gap: 20px;
    padding: 0 15px;
  }
  
  .info-sidebar {
    width: 100%;
    position: static;
    
    .nav-list {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .nav-item {
      flex: 1;
      min-width: 120px;
      justify-content: center;
    }
  }
  
  .info-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .member-info-container {
    padding: 60px 10px;
  }
  
  .main-content {
    gap: 15px;
    padding: 0 10px;
  }
  
  .info-sidebar {
    padding: 16px;
    
    .nav-list {
      flex-direction: column;
    }
    
    .nav-item {
      min-width: auto;
      justify-content: flex-start;
    }
  }
  
  .member-header {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
  }
  
  .avatar-section {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .detail-sections {
    padding: 20px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px 16px;
    
    .label {
      margin-bottom: 6px;
      margin-right: 0;
      min-width: auto;
      font-size: 13px;
    }
    
    .value {
      font-size: 14px;
    }
  }
  
  .basic-info h1 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .member-info-container {
    padding: 40px 8px;
  }
  
  .main-content {
    padding: 0 8px;
  }
  
  .info-sidebar {
    padding: 12px;
    
    .sidebar-header {
      h3 {
        font-size: 1.1rem;
      }
      
      .back-button {
        font-size: 11px;
        padding: 6px 10px;
      }
    }
    
    .nav-item {
      padding: 10px 12px;
      font-size: 14px;
    }
  }
  
  .member-header {
    padding: 20px 16px;
  }
  
  .member-avatar {
    width: 100px;
    height: 125px;
  }
  
  .basic-info {
    h1 {
      font-size: 20px;
    }
    
    p {
      font-size: 14px;
    }
  }
  
  .detail-sections {
    padding: 16px;
  }
  
  .section-title {
    font-size: 1.3rem;
    margin-bottom: 16px;
  }
  
  .info-item {
    padding: 12px 14px;
    
    .label {
      font-size: 12px;
    }
    
    .value {
      font-size: 13px;
    }
  }
  
  .project-item, .publication-item {
    padding: 16px;
  }
  
  .research-tag {
    font-size: 12px;
    padding: 6px 12px;
  }
}

@media (max-width: 360px) {
  .member-info-container {
    padding: 30px 6px;
  }
  
  .main-content {
    padding: 0 6px;
  }
  
  .info-sidebar {
    padding: 10px;
    
    .sidebar-header {
      .back-button {
        font-size: 10px;
        padding: 5px 8px;
      }
    }
    
    .nav-item {
      padding: 8px 10px;
      font-size: 13px;
    }
  }
  
  .member-header {
    padding: 16px 12px;
  }
  
  .member-avatar {
    width: 80px;
    height: 100px;
  }
  
  .basic-info {
    h1 {
      font-size: 18px;
    }
    
    p {
      font-size: 13px;
    }
  }
  
  .detail-sections {
    padding: 12px;
  }
  
  .section-title {
    font-size: 1.2rem;
    margin-bottom: 14px;
  }
  
  .info-item {
    padding: 10px 12px;
    
    .label {
      font-size: 11px;
    }
    
    .value {
      font-size: 12px;
    }
  }
  
  .project-item, .publication-item {
    padding: 14px;
  }
  
  .research-tag {
    font-size: 11px;
    padding: 5px 10px;
  }
}
</style>