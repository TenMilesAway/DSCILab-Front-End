<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { LabNavbar, LabBanner, LabIntroCard, ResearchSection, BlankPage, MembersPage, AchievementsPage, ProjectsPage, ActivityPage }from '@/components/Lab';
import MemberInfo from './components/MemberInfo.vue';
import { getMemberDetailApi } from '@/api/lab/members';
import { getAchievementsListApi } from '@/api/lab/achievements';
import { getProjectsListApi } from '@/api/lab/projects';
import { ElMessage } from 'element-plus';

defineOptions({
  name: "LabHomepage"
});

// 路由实例
const router = useRouter();
const route = useRoute();

// 当前激活的菜单项
const activeIndex = ref('1');
// 当前显示的页面
const currentPage = ref('home');

// 成员详情相关状态
const showMemberDetail = ref(false);
const memberDetailLoading = ref(false);
const selectedMember = ref(null);
const selectedMemberAchievements = ref([]);
const selectedMemberProjects = ref([]);

// 页面标题映射
const pageTitles: Record<string, { title: string; subtitle: string }> = {
  'home': { title: '首页', subtitle: '实验室主页' },
  'members': { title: '成员', subtitle: '团队成员介绍' },
  'achievements': { title: '成果', subtitle: '学术成果展示' },
  'projects': { title: '项目', subtitle: '研究项目展示' },
  'activities': { title: '活动', subtitle: '学术活动与会议' },

};

// 处理菜单选择事件
const handleSelect = (key: string) => {
  activeIndex.value = key;
  
  // 根据菜单项切换显示的内容并更新路由
  switch(key) {
    case '1': // 首页
      currentPage.value = 'home';
      router.push('/welcome');
      break;
    case '2': // 成员
      currentPage.value = 'members';
      router.push('/welcome/members');
      break;
    case '3': // 成果
      currentPage.value = 'achievements';
      router.push('/welcome/achievements');
      break;
    case '4': // 项目
      currentPage.value = 'projects';
      router.push('/welcome/projects');
      break;
    case '5': // 活动
      currentPage.value = 'activities';
      break;

    default:
      currentPage.value = 'home';
      router.push('/welcome');
  }
  
  // 页面切换后重置滚动位置到顶部
  nextTick(() => {
    window.scrollTo({ top: 0 });
  });
};

// 根据路由路径设置当前页面
const setPageFromRoute = () => {
  const path = route.path;
  
  if (path === '/welcome' || path === '/welcome/') {
    showMemberDetail.value = false;
    currentPage.value = 'home';
    activeIndex.value = '1';
  } else if (path === '/welcome/members') {
    showMemberDetail.value = false;
    currentPage.value = 'members';
    activeIndex.value = '2';
  } else if (path === '/welcome/achievements') {
    showMemberDetail.value = false;
    currentPage.value = 'achievements';
    activeIndex.value = '3';
  } else if (path === '/welcome/projects') {
    showMemberDetail.value = false;
    currentPage.value = 'projects';
    activeIndex.value = '4';
  } else if (path.startsWith('/welcome/member/')) {
    const memberId = route.params.id;
    if (memberId) {
      loadMemberDetail(memberId as string);
    }
  } else {
    showMemberDetail.value = false;
    currentPage.value = 'home';
    activeIndex.value = '1';
  }
};

// 加载成员详情
const loadMemberDetail = async (memberId: string) => {
  try {
    memberDetailLoading.value = true;
    showMemberDetail.value = true;
    
    // 获取成员详情
    const memberResponse = await getMemberDetailApi(Number(memberId));
    if (memberResponse.code === 0) {
      selectedMember.value = {
        id: memberResponse.data.id,
        name: memberResponse.data.realName,
        englishName: memberResponse.data.englishName,
        gender: memberResponse.data.gender,
        resume: memberResponse.data.resume,
        phone: memberResponse.data.phone,
        graduation: memberResponse.data.graduationDest,
        email: memberResponse.data.email,
        photo: memberResponse.data.photo,
        researchArea: memberResponse.data.researchArea,
        enrollmentYear: memberResponse.data.enrollmentYear,
        graduationYear: memberResponse.data.graduationYear,
        homepageUrl: memberResponse.data.homepageUrl,
        orcid: memberResponse.data.orcid,
        identity: memberResponse.data.identity?.toString(),
        academicStatus: memberResponse.data.academicStatus
      };
      
      // 获取成果和项目数据
      const [achievementsResponse, projectsResponse] = await Promise.all([
        getAchievementsListApi(),
        getProjectsListApi()
      ]);
      
      if (achievementsResponse.code === 0 && Array.isArray(achievementsResponse.data)) {
        selectedMemberAchievements.value = achievementsResponse.data
          .filter(achievement => {
            if (achievement.authors && Array.isArray(achievement.authors)) {
              return achievement.authors.some(author => 
                author.name && author.name.includes(memberResponse.data.realName)
              );
            }
            return false;
          })
          .filter(achievement => achievement.status === undefined || achievement.status === 1);
      } else {
        selectedMemberAchievements.value = [];
      }
      
      if (projectsResponse.code === 0 && Array.isArray(projectsResponse.data)) {
        selectedMemberProjects.value = projectsResponse.data
          .filter(project => {
            if (project.authors && Array.isArray(project.authors)) {
              return project.authors.some(author => 
                author.name && author.name.includes(memberResponse.data.realName)
              );
            }
            return false;
          })
          .filter(project => project.status === undefined || project.status === 1);
      } else {
        selectedMemberProjects.value = [];
      }
      
      // 成功加载后确保显示成员详情
      showMemberDetail.value = true;
    } else {
      console.error('获取成员详情失败:', memberResponse.msg);
      ElMessage.error('获取成员详情失败：' + memberResponse.msg);
      showMemberDetail.value = false;
      selectedMember.value = null;
      router.push('/welcome/members');
    }
  } catch (error) {
    console.error('获取成员详情失败:', error);
    ElMessage.error('获取成员详情失败，请稍后重试');
    showMemberDetail.value = false;
    selectedMember.value = null;
    router.push('/welcome/members');
  } finally {
    memberDetailLoading.value = false;
  }
};

// 返回成员列表
const backToMembers = () => {
  // 添加页面切换的过渡效果
  showMemberDetail.value = false;
  
  // 延迟路由跳转，让过渡动画先开始
  setTimeout(() => {
    router.push('/welcome/members');
    // 路由的scrollBehavior已经处理了平滑滚动，这里添加延迟确保更好的用户体验
    nextTick(() => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    });
  }, 50);
};

// 获取当前页面信息
const getCurrentPageInfo = () => {
  return pageTitles[currentPage.value] || pageTitles['home'];
};

// 监听路由变化
watch(
  () => route.path,
  () => {
    setPageFromRoute();
  },
  { immediate: true }
);

// 组件挂载时设置页面
onMounted(() => {
  setPageFromRoute();
});

// 由于移除了登录按钮，以下导航函数暂时不需要
// const navigateTo = (path: string) => {
//   router.push(path);
// };
</script>

<template>
  <div class="lab-container">
    <!-- 成员详情加载状态 -->
    <div v-if="showMemberDetail && memberDetailLoading" class="detail-loading-overlay">
      <div class="detail-loading-container">
        <div class="loading-spinner-detail">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
      </div>
    </div>

    <!-- 成员详情页面 -->
    <transition name="member-detail" mode="out-in">
      <MemberInfo
        v-if="showMemberDetail && !memberDetailLoading && selectedMember"
        :member="{
          ...selectedMember,
          identity: selectedMember?.identity
            ? Number(selectedMember.identity)
            : undefined
        }"
        :achievements="selectedMemberAchievements"
        :projects="selectedMemberProjects"
        @back="backToMembers"
      />
    </transition>

    <!-- 正常页面内容 -->
    <transition name="page-content" mode="out-in">
      <div v-if="!showMemberDetail" class="page-wrapper">
        <!-- 导航栏组件 -->
        <LabNavbar :active-index="activeIndex" @select="handleSelect" />

        <!-- 内容区域 -->
        <div class="lab-content">
          <!-- 首页内容 -->
          <template v-if="currentPage === 'home'">
            <!-- 横幅组件 -->
            <LabBanner />
            
            <!-- 实验室简介卡片组件 -->
            <LabIntroCard />
            
            <!-- 研究方向组件 -->
            <ResearchSection />
          </template>
          
          <!-- 成员页面 -->
          <template v-else-if="currentPage === 'members'">
            <MembersPage />
          </template>
          
          <!-- 成果页面 -->
          <template v-else-if="currentPage === 'achievements'">
            <AchievementsPage />
          </template>
          
          <!-- 项目页面 -->
          <template v-else-if="currentPage === 'projects'">
            <ProjectsPage />
          </template>
          
          <!-- 活动页面 -->
          <template v-else-if="currentPage === 'activities'">
            <ActivityPage />
          </template>
          
          <!-- 其他页面使用空白组件 -->
          <template v-else>
            <BlankPage 
              :title="getCurrentPageInfo().title" 
              :subtitle="getCurrentPageInfo().subtitle" 
            />
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.lab-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

/* 内容区域样式 */
.lab-content {
  flex: 1;
  padding: 0;
}

/* 详情页面加载动画样式 */
.detail-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1));
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

.detail-loading-container {
  text-align: center;
  position: relative;
}

.loading-spinner-detail {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 30px;
}

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.3));
}

.spinner-ring:nth-child(1) {
  width: 120px;
  height: 120px;
  border-image: linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899) 1;
  border-style: solid;
  border-width: 3px;
  border-top: 3px solid transparent;
  border-right: 3px solid transparent;
  animation: rotate 2s linear infinite;
  top: 0;
  left: 0;
}

.spinner-ring:nth-child(2) {
  width: 90px;
  height: 90px;
  border-image: linear-gradient(225deg, #10b981, #06b6d4, #3b82f6) 1;
  border-style: solid;
  border-width: 2px;
  border-top: 2px solid transparent;
  border-left: 2px solid transparent;
  animation: rotate 1.5s linear infinite reverse;
  top: 15px;
  left: 15px;
}

.spinner-ring:nth-child(3) {
  width: 60px;
  height: 60px;
  border-image: linear-gradient(315deg, #f59e0b, #ef4444, #ec4899) 1;
  border-style: solid;
  border-width: 2px;
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  animation: rotate 1s linear infinite;
  top: 30px;
  left: 30px;
}

/* 中心脉冲点 */
.loading-spinner-detail::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  background: linear-gradient(45deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 1.5s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
}

/* 外围装饰点 */
.loading-spinner-detail::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140px;
  height: 140px;
  border: 1px dashed rgba(99, 102, 241, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.8;
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.8);
  }
}

.loading-text-detail {
  font-size: 16px;
  background: linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
}

.loading-text-detail::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #6366f1, #8b5cf6, #ec4899, transparent);
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.loading-char {
  display: inline-block;
  animation: textWave 2s ease-in-out infinite;
  transition: all 0.3s ease;
}

.loading-char:nth-child(1) { animation-delay: 0s; }
.loading-char:nth-child(2) { animation-delay: 0.1s; }
.loading-char:nth-child(3) { animation-delay: 0.2s; }
.loading-char:nth-child(4) { animation-delay: 0.3s; }
.loading-char:nth-child(5) { animation-delay: 0.4s; }
.loading-char:nth-child(6) { animation-delay: 0.5s; }
.loading-char:nth-child(7) { animation-delay: 0.6s; }
.loading-char:nth-child(8) { animation-delay: 0.7s; }
.loading-char:nth-child(9) { animation-delay: 0.8s; }
.loading-char:nth-child(10) { animation-delay: 0.9s; }
.loading-char:nth-child(11) { animation-delay: 1s; }

@keyframes textWave {
  0%, 60%, 100% {
    transform: translateY(0) scale(1);
    filter: brightness(1);
  }
  20% {
    transform: translateY(-10px) scale(1.15);
    filter: brightness(1.3) drop-shadow(0 0 8px rgba(99, 102, 241, 0.5));
  }
}

/* 页面过渡动画 */
.member-detail-enter-active,
.member-detail-leave-active,
.page-content-enter-active,
.page-content-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.member-detail-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.98);
}

.member-detail-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.98);
}

.page-content-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.page-content-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}

/* 为过渡动画添加更平滑的效果 */
.member-detail-enter-active {
  transition-delay: 0.1s;
}

.page-content-enter-active {
  transition-delay: 0.05s;
}

/* 确保过渡期间的层级关系 */
.member-detail-enter-active,
.member-detail-leave-active {
  position: relative;
  z-index: 10;
}

.page-content-enter-active,
.page-content-leave-active {
  position: relative;
  z-index: 5;
}

/* 页面包装器样式 */
.page-wrapper {
  width: 100%;
  height: 100%;
}
</style>
