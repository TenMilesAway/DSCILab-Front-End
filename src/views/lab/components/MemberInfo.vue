<template>
  <div class="member-info-container">
    <!-- 主要内容区域 -->
    <div v-if="member" class="main-content">
        <!-- 左侧信息定位导航 -->
      <div class="info-sidebar">
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
      <div class="content-area">
        <div class="member-detail-card">
        <!-- 头像和基本信息 -->
        <div class="member-header">
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
            
            <p class="member-title">{{ getAcademicStatusTitle(member.academicStatus) }}</p>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="detail-sections">
          <!-- 个人信息 -->
          <div id="personal-info-section" class="info-section">
            <h3 class="section-title">个人信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">姓名:</span>
                <span class="value">{{ member.name }}</span>
              </div>
              <div class="info-item" v-if="member.englishName">
                <span class="label">英文名:</span>
                <span class="value">{{ member.englishName }}</span>
              </div>
              <div class="info-item" v-if="member.gender">
                <span class="label">性别:</span>
                <span class="value">{{ member.gender === 1 ? '男' : member.gender === 2 ? '女' : member.gender }}</span>
              </div>
              <div class="info-item">
                <span class="label">职位:</span>
                <span class="value">{{ getAcademicStatusTitle(member.academicStatus) }}</span>
              </div>
              <div class="info-item" v-if="member.email">
                <span class="label">邮箱:</span>
                <span class="value">{{ member.email }}</span>
              </div>
              <div class="info-item" v-if="member.phone">
                <span class="label">手机号:</span>
                <span class="value">{{ member.phone }}</span>
              </div>
              <div class="info-item" v-if="member.enrollmentYear">
                <span class="label">{{ getEnrollmentLabel(member) }}:</span>
                <span class="value">{{ member.enrollmentYear }}</span>
              </div>
              <div class="info-item" v-if="member.graduationYear">
                <span class="label">毕业年份:</span>
                <span class="value">{{ member.graduationYear }}</span>
              </div>
              <div class="info-item" v-if="member.graduation">
                <span class="label">毕业去向:</span>
                <span class="value">{{ member.graduation }}</span>
              </div>
              <div class="info-item" v-if="member.orcid">
                <span class="label">ORCID:</span>
                <span class="value">{{ member.orcid }}</span>
              </div>
            </div>
          </div>

          <!-- 研究方向 -->
          <div id="research-areas-section" class="info-section">
            <h3 class="section-title">研究方向</h3>
            <div class="research-areas">
              <div v-if="member.researchArea" class="research-tags">
                <span 
                  v-for="(area, index) in member.researchArea.split('，').map(item => item.trim()).filter(item => item)" 
                  :key="index" 
                  class="research-tag"
                >
                  {{ area }}
                </span>
              </div>
              <div v-else class="research-item">
                <p>暂无研究方向信息</p>
              </div>
            </div>
          </div>

          <!-- 个人简述 -->
          <div v-if="member.resume" id="resume-section" class="info-section">
            <h3 class="section-title">个人简述</h3>
            <div class="resume-content">
              <p class="resume-text">{{ member.resume.replace(/\\n/g, '\n') }}</p>
            </div>
          </div>

          <!-- 项目经历 -->
          <div id="projects-section" class="info-section">
            <h3 class="section-title">参与项目</h3>
            <div class="projects-list">
              <div v-if="props.projects && props.projects.length > 0" class="projects-list-container">
                <div 
                  v-for="(project, index) in sortedProjects" 
                  :key="project.id" 
                  class="project-item-member"
                >
                  <div class="project-main-member">
                    <el-tag 
                      :type="getProjectTypeTagType(project.projectType)" 
                      size="small" 
                      class="project-type-tag-member"
                    >
                      {{ getProjectTypeLabel(project.projectType) }}
                    </el-tag>
                    <div class="project-content-member">
                      <span class="project-title-member">{{ project.title }}</span>
                      <span class="project-separator-member">,</span>
                      <span class="project-leader-member">负责人：{{ getProjectLeader(project.authors) }}</span>
                      <span class="project-separator-member">,</span>
                      <span class="project-funding-member">经费 {{ project.fundingAmount || '0' }} 万元</span>
                      <span class="project-separator-member">,</span>
                      <span class="project-year-member">{{ getProjectYear(project.projectStartDate, project.projectEndDate) }}</span>
                      <span class="project-separator-member">.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-data">
                <p>暂无参与项目信息</p>
              </div>
            </div>
          </div>

          <!-- 发表论文 -->
          <div id="publications-section" class="info-section">
            <h3 class="section-title">学术成果</h3>
            <div class="publications-list">
              <div v-if="props.achievements && props.achievements.length > 0" class="achievements-list-container">
                <div 
                  v-for="(achievement, index) in sortedAchievements" 
                  :key="achievement.id" 
                  class="achievement-item-member"
                >
                  <div class="achievement-main-member">
                    <el-tag 
                      :type="getPaperTypeTagType(achievement.paperType)" 
                      size="small" 
                      class="achievement-type-tag-member"
                    >
                      {{ getPaperTypeLabel(achievement.paperType) }}
                    </el-tag>
                    <div class="achievement-content-member">
                      <span v-if="achievement.authors && achievement.authors.length > 0" class="achievement-authors-member">
                        <span 
                          v-for="(author, authorIndex) in getSortedAuthors(achievement.authors)" 
                          :key="authorIndex" 
                          class="author-name-member"
                        >{{ author.name }}<span v-if="authorIndex < getSortedAuthors(achievement.authors).length - 1">, </span></span>
                      </span>
                      <span class="achievement-separator-member">.</span>
                      <span class="achievement-title-member">{{ achievement.title }}</span>
                      <span class="achievement-separator-member">,</span>
                      <span v-if="achievement.venue" class="achievement-institution-member">
                        {{ achievement.venue}}
                      </span>
                      <span class="achievement-separator-member">,</span>
                      <span v-if="achievement.publishDate" class="achievement-year-member">
                        {{ getPublishYear(achievement.publishDate) }}
                      </span>
                      <span class="achievement-separator-member">.</span>
                    </div>
                  </div>
                  <div class="achievement-actions-container-member">
                    <div class="achievement-actions-member">
                      <el-tooltip :content="achievement.gitUrl ? 'Github 仓库' : '暂无 Github 仓库'" placement="top">
                        <el-button 
                          plain 
                          size="small" 
                          circle 
                          class="action-btn-member"
                          :disabled="!achievement.gitUrl"
                          @click="achievement.gitUrl && handleGithubClick(achievement.gitUrl)"
                        >
                          <GithubIcon />
                        </el-button>
                      </el-tooltip>
                      <el-tooltip :content="achievement.linkUrl ? '项目主页' : '暂无项目主页'" placement="top">
                        <el-button 
                          plain 
                          :icon="Link" 
                          size="small" 
                          circle 
                          class="action-btn-member"
                          :disabled="!achievement.linkUrl"
                          @click="achievement.linkUrl && handleProjectClick(achievement.linkUrl)"
                        />
                      </el-tooltip>
                      <el-tooltip :content="achievement.pdfUrl ? '下载 PDF' : '暂无 PDF 文件'" placement="top">
                        <el-button 
                          plain 
                          :icon="Download" 
                          size="small" 
                          circle 
                          class="action-btn-member"
                          :disabled="!achievement.pdfUrl"
                          @click="achievement.pdfUrl && handlePdfDownload(achievement.pdfUrl)"
                        />
                      </el-tooltip>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-data">
                <p>暂无学术成果信息</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref, nextTick, onMounted, onUnmounted, watch, h, computed } from 'vue';
import { Link, Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { type ApiAchievement } from '@/api/lab/achievements';

// 定义 Github 图标组件
const Github = {
  name: 'Github',
  render() {
    return h('svg', {
      viewBox: '0 0 1024 1024',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M512 12.64c-282.752 0-512 229.216-512 512 0 226.208 146.688 418.144 350.08 485.824 25.6 4.736 35.008-11.104 35.008-24.64 0-12.192-0.48-52.544-0.704-95.328-142.464 30.976-172.512-60.416-172.512-60.416-23.296-59.168-56.832-74.912-56.832-74.912-46.464-31.776 3.52-31.136 3.52-31.136 51.392 3.616 78.464 52.768 78.464 52.768 45.664 78.272 119.776 55.648 148.992 42.56 4.576-33.088 17.856-55.68 32.512-68.48-113.728-12.928-233.28-56.864-233.28-253.024 0-55.904 19.936-101.568 52.672-137.408-5.312-12.896-22.848-64.96 4.96-135.488 0 0 42.88-13.76 140.8 52.48 40.832-11.36 84.64-17.024 128.16-17.248 43.488 0.192 87.328 5.888 128.256 17.248 97.856-66.24 140.672-52.48 140.672-52.48 27.872 70.528 10.336 122.592 5.024 135.488 32.832 35.84 52.608 81.504 52.608 137.408 0 196.64-119.776 239.936-233.792 252.64 18.368 15.904 34.72 47.04 34.72 94.816 0 68.512-0.608 123.648-0.608 140.512 0 13.632 9.216 29.6 35.168 24.576C877.44 942.592 1024 750.592 1024 524.64c0-282.784-229.248-512-512-512z'
      })
    ]);
  }
};

interface Member {
  id: number;
  name: string;
  englishName?: string;
  gender?: number;
  resume?: string;
  phone?: string;
  title: string;
  graduation?: string;
  category: string;
  email?: string;
  photo?: string;
  researchArea?: string;
  enrollmentYear?: number;
  graduationYear?: number;
  homepageUrl?: string;
  orcid?: string;
  identity?: number;
  academicStatus?: number;
}

interface Props {
  member: Member | null;
  achievements?: ApiAchievement[];
  projects?: ApiAchievement[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  back: [];
}>();

// 按时间排序的项目列表（从新到旧）
const sortedProjects = computed(() => {
  if (!props.projects || props.projects.length === 0) return [];
  
  return [...props.projects].sort((a, b) => {
    // 优先使用项目开始时间排序
    const aDate = a.projectStartDate ? new Date(a.projectStartDate).getTime() : 0;
    const bDate = b.projectStartDate ? new Date(b.projectStartDate).getTime() : 0;
    return bDate - aDate; // 从新到旧排序
  });
});

// 按时间排序的成果列表（从新到旧）
const sortedAchievements = computed(() => {
  if (!props.achievements || props.achievements.length === 0) return [];
  
  return [...props.achievements].sort((a, b) => {
    // 优先使用发表时间排序
    const aDate = a.publishDate ? new Date(a.publishDate).getTime() : 0;
    const bDate = b.publishDate ? new Date(b.publishDate).getTime() : 0;
    return bDate - aDate; // 从新到旧排序
  });
});

// 监听 member 变化 - 移除了加载逻辑
watch(() => props.member, (newMember) => {
  // 直接处理member变化，无需加载动画
}, { immediate: true });

// 信息定位导航配置
const navigationItems = [
  { key: 'personal-info', name: '个人信息', id: 'personal-info-section' },
  { key: 'education', name: '个人简述', id: 'resume-section' },
  { key: 'projects', name: '参与项目', id: 'projects-section' },
  { key: 'publications', name: '学术成果', id: 'publications-section' }
];

const activeNavItem = ref('personal-info');

// 滚动到指定部分
const scrollToSection = (sectionId: string, navKey: string) => {
  activeNavItem.value = navKey;
  nextTick(() => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'auto', 
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

// 根据身份获取入学/入职年份标签
const getEnrollmentLabel = (member: Member): string => {
  // identity=1代表学生，identity=2代表教师
  if (member.identity === 2) {
    return '入职年份';
  }
  return '入学年份';
};

// 根据身份值获取身份标签
const getIdentityLabel = (identity: string): string => {
  // identity=1代表学生，identity=2代表教师
  if (identity === '1') {
    return '学生';
  } else if (identity === '2') {
    return '教师';
  }
  return '未知';
};

// 根据 academicStatus 获取职位名称
const getAcademicStatusTitle = (academicStatus?: number): string => {
  const statusMap: Record<number, string> = {
    0: '实验室负责人',
    1: '教授',
    2: '副教授',
    3: '讲师',
    4: '博士生',
    5: '硕士生',
    6: '本科生'
  };
  
  if (academicStatus === undefined || academicStatus === null) {
    return '未知';
  }
  
  return statusMap[academicStatus] || '未知';
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

// 按 authorOrder 排序作者
const getSortedAuthors = (authors: Array<{name: string, authorOrder?: number}>) => {
  if (!authors || authors.length === 0) return [];
  
  return [...authors].sort((a, b) => {
    const orderA = a.authorOrder ?? 999; // 如果没有 authorOrder，放到最后
    const orderB = b.authorOrder ?? 999;
    return orderA - orderB;
  });
};

// 从发表日期中提取年份
const getPublishYear = (publishDate: string) => {
  if (!publishDate) return '';
  const date = new Date(publishDate);
  return date.getFullYear().toString();
};

// 获取论文类型标签类型
const getPaperTypeTagType = (paperType?: number) => {
  const typeMap: Record<number, string> = {
    1: 'primary',    // 期刊
    2: 'success',    // 会议
    3: 'warning',    // 预印本
    4: 'danger',     // 专利
    5: 'info',       // 软著
    6: '',           // 标准
    7: 'primary'     // 专著
  };
  return typeMap[paperType || 7] || 'info';
};

// 获取论文类型标签文本
const getPaperTypeLabel = (paperType?: number) => {
  const typeMap: Record<number, string> = {
    1: '期刊',
    2: '会议',
    3: '预印本',
    4: '专利',
    5: '软著',
    6: '标准',
    7: '专著'
  };
  return typeMap[paperType || 7] || '其他';
};

// 获取项目类型标签类型
const getProjectTypeTagType = (projectType?: number) => {
  const typeMap: Record<number, string> = {
    1: 'warning',           // 横向
    2: 'danger',            // 国自然面上
    3: 'primary',           // 国自然青年
    4: 'success',           // 北京市教委科技一般
    5: '',                  // 国家级教改
    6: 'primary',           // 省部级教改
    7: 'info',              // 其他教改
    8: 'info'               // 其他纵向
  };
  return typeMap[projectType || 1] || 'info';
};

// 获取项目类型标签文本
const getProjectTypeLabel = (projectType?: number) => {
  const typeMap: Record<number, string> = {
    1: '横向',
    2: '国自然面上',
    3: '国自然青年',
    4: '北京市教委科技一般',
    5: '国家级教改',
    6: '省部级教改',
    7: '其他教改',
    8: '其他纵向'
  };
  return typeMap[projectType || 1] || '其他';
};

// 从项目日期中提取年份
const getProjectYear = (startDate?: string, endDate?: string) => {
  const startYear = startDate ? new Date(startDate).getFullYear() : '';
  const endYear = endDate ? new Date(endDate).getFullYear() : '';
  if (startYear && endYear) {
    return `${startYear}-${endYear}`;
  } else if (startYear) {
    return startYear.toString();
  }
  return '';
};

// 获取项目负责人
const getProjectLeader = (authors?: Array<{name: string; authorOrder: number}>) => {
  if (!authors || !Array.isArray(authors)) return '未知';
  const leader = authors.find(author => author.authorOrder === 1);
  return leader?.name || '未知';
};

// 操作按钮事件处理
const handleGithubClick = (url: string) => {
  window.open(url, '_blank');
  ElMessage.success('正在跳转到 Github 仓库');
};

const handleProjectClick = (url: string) => {
  window.open(url, '_blank');
  ElMessage.success('正在跳转到项目主页');
};

const handlePdfDownload = (url: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = '';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  ElMessage.success('PDF 下载已开始');
};
</script>

<style scoped>
/* 成员详情视图样式 */
.member-info-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  padding: 20px 20px;
  box-sizing: border-box;
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

.info-item .value .link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}

#resume-section .resume-content {
  color: #475569;
  line-height: 1.7;
  font-size: 15px;
}

#resume-section .resume-content p {
  margin: 0;
  text-align: justify;
}

.resume-text {
  white-space: pre-line;
}

.info-item .value .link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.research-areas {
  .research-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .research-tag {
      display: inline-block;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      cursor: pointer;
      margin: 4px;
      position: relative;
      overflow: hidden;
      clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
      
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #1e40af;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15);
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s;
      }
      
      &:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        
        &::before {
          left: 100%;
        }
      }
      
      &:active {
        transform: translateY(-1px) scale(1.02);
      }
    }
  }
  
  .research-item {
    background: rgba(255, 255, 255, 0.8);
    padding: 16px;
    border-radius: 12px;
    
    p {
      margin: 0;
      color: #374151;
      line-height: 1.6;
    }
  }
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
  box-shadow: 0 4px 16px rgba(148, 163, 184, 0.1);
  transition: all 0.3s ease;
}

.project-item:hover, .publication-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(148, 163, 184, 0.15);
  background: rgba(255, 255, 255, 0.9);
}

/* 成员页面论文样式 */
.achievements-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.achievement-item-member {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(148, 163, 184, 0.1);
  transition: all 0.3s ease;
  line-height: 1.6;
}

.achievement-item-member:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(148, 163, 184, 0.15);
  background: rgba(255, 255, 255, 0.95);
}

.achievement-main-member {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 16px;
}

.achievement-type-tag-member {
  margin-top: 2px;
  font-weight: 500;
  border-radius: 6px;
  flex-shrink: 0;
}

.achievement-content-member {
  flex: 1;
  font-size: 14px;
  line-height: 1.6;
  align-items: center;
  gap: 4px;
}

.achievement-authors-member {
  color: #374151;
  font-weight: 600;
}

.author-name-member {
  color: #374151;
  font-weight: normal;
}

.achievement-title-member {
  color: #1e293b;
  font-weight: 700;
}

.achievement-institution-member {
  color: #64748b;
  font-weight: 500;
  font-style: italic;
}

.achievement-year-member {
  color: #374151;
  font-weight: 600;
}

.achievement-separator-member {
  color: #64748b;
  margin: 0 2px;
}

.achievement-actions-container-member {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  margin-top: 2px;
}

.achievement-actions-member {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #fafbfc;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 6px 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.action-btn-member {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #d1d5db;
  color: #6b7280;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.action-btn-member:hover {
  color: #374151;
  border-color: #9ca3af;
  background-color: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn-member:disabled {
  color: #d1d5db;
  border-color: #e5e7eb;
  background-color: #f9fafb;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.action-btn-member:disabled:hover {
  color: #d1d5db;
  border-color: #e5e7eb;
  background-color: #f9fafb;
  transform: none;
  box-shadow: none;
}

/* 保留旧样式以防兼容性问题 */
.publication-item-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(148, 163, 184, 0.1);
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

.publication-item-compact:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(148, 163, 184, 0.15);
  background: rgba(255, 255, 255, 0.9);
}

.paper-content {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.publication-item-compact .paper-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.publication-item-compact .paper-authors,
.publication-item-compact .paper-date,
.publication-item-compact .paper-journal,
.publication-item-compact .paper-venue {
  color: #64748b;
  font-size: 13px;
  margin: 0;
  white-space: nowrap;
}

.paper-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.publication-item-compact .paper-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.publication-item-compact .paper-link:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.project-title, .paper-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  line-height: 1.4;
}

.project-description, .paper-authors, .paper-venue, .paper-description {
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

/* 论文专用样式 */
.paper-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
  
  span {
    color: #64748b;
    font-size: 13px;
    background: rgba(59, 130, 246, 0.1);
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid rgba(59, 130, 246, 0.2);
  }
}

.paper-authors {
  margin-bottom: 12px;
  
  .authors-label {
    color: #374151;
    font-weight: 500;
    font-size: 14px;
  }
  
  .author-name {
    color: #64748b;
    font-size: 14px;
  }
}

.paper-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.paper-tag {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
  }
}

.paper-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.paper-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #3b82f6;
    color: white;
    transform: translateY(-1px);
  }
}

/* 项目经历样式 */
.projects-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-item-member {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: white;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  }
}

.project-main-member {
  display: flex;
  align-items: flex-start;
  flex: 1;
  margin-right: 16px;
  gap: 12px;
}

.project-number-member {
  color: #6b7280;
  font-weight: 600;
  font-size: 16px;
  min-width: 24px;
  margin-top: 2px;
}

.project-type-tag-member {
  margin-top: 2px;
  font-weight: 500;
}

.project-content-member {
  flex: 1;
  line-height: 1.6;
  font-size: 15px;
}

.project-title-member {
  font-weight: 600;
  color: #1f2937;
}

.project-separator-member {
  color: #6b7280;
  margin: 0 2px;
}

.project-leader-member,
.project-year-member {
  color: #4b5563;
}

.project-funding-member {
  color: #e67e22;
  font-weight: 500;
}

.no-data {
   text-align: center;
   padding: 40px 20px;
   color: #9ca3af;
   
   p {
     font-size: 16px;
     margin: 0;
   }
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
    padding: 15px 8px;
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
  
  .project-item-member {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    gap: 12px;
  }
  
  .project-main-member {
    flex-direction: column;
    align-items: flex-start;
    margin-right: 0;
    width: 100%;
    gap: 8px;
  }
  
  .project-type-tag-member {
    margin-bottom: 8px;
  }
  
  .project-content-member {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .project-title-member {
    font-size: 14px;
    font-weight: 600;
  }
  
  .project-leader-member,
  .project-year-member {
    font-size: 12px;
  }
  
  .project-funding-member {
    font-size: 12px;
    color: #e67e22;
    font-weight: 500;
  }
  
  .achievement-item-member {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    gap: 12px;
  }
  
  .achievement-main-member {
    flex-direction: column;
    align-items: flex-start;
    margin-right: 0;
    width: 100%;
    gap: 8px;
  }
  
  .achievement-actions-container-member {
    align-self: flex-end;
    margin-top: 8px;
  }
  
  .achievement-actions-member {
    padding: 6px 10px;
  }
  
  .action-btn-member {
    width: 30px;
    height: 30px;
  }
  
  .research-tag {
    font-size: 12px;
    padding: 6px 12px;
  }
}

@media (max-width: 360px) {
  .member-info-container {
    padding: 10px 6px;
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
  
  .achievement-item-member {
    padding: 14px;
  }
  
  .achievement-content-member {
    font-size: 13px;
  }
  
  .achievement-authors-member,
  .achievement-title-member,
  .achievement-institution-member,
  .achievement-year-member {
    font-size: 13px;
  }
  
  .research-tag {
    font-size: 11px;
    padding: 5px 10px;
  }
}
</style>