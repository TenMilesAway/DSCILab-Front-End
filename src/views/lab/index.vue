<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { LabNavbar, LabBanner, LabIntroCard, ResearchSection, BlankPage, MembersPage, AchievementsPage, ProjectsPage, ActivityPage }from '@/components/Lab';

defineOptions({
  name: "LabHomepage"
});

// 路由实例
const router = useRouter();

// 当前激活的菜单项
const activeIndex = ref('1');
// 当前显示的页面
const currentPage = ref('home');

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
  
  // 根据菜单项切换显示的内容
  switch(key) {
    case '1': // 首页
      currentPage.value = 'home';
      break;
    case '2': // 成员
      currentPage.value = 'members';
      break;
    case '3': // 成果
      currentPage.value = 'achievements';
      break;
    case '4': // 项目
      currentPage.value = 'projects';
      break;
    case '5': // 活动
      currentPage.value = 'activities';
      break;

    default:
      currentPage.value = 'home';
  }
  
  // 页面切换后重置滚动位置到顶部
  nextTick(() => {
    window.scrollTo({ top: 0 });
  });
};

// 获取当前页面信息
const getCurrentPageInfo = () => {
  return pageTitles[currentPage.value] || pageTitles['home'];
};

// 由于移除了登录按钮，以下导航函数暂时不需要
// const navigateTo = (path: string) => {
//   router.push(path);
// };
</script>

<template>
  <div class="lab-container">
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
</style>
