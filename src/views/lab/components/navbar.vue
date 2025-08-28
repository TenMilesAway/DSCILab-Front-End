<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: "LabNavbar"
});

interface Props {
  activeIndex?: string;
}

const props = withDefaults(defineProps<Props>(), {
  activeIndex: '1'
});

const emit = defineEmits<{
  select: [key: string];
}>();

// 处理菜单选择事件
const handleSelect = (key: string) => {
  emit('select', key);
};
</script>

<template>
  <div class="lab-navbar">
    <div class="lab-navbar-logo">
      <img src="@/assets/lab/logo.png" alt="实验室标志" class="lab-logo" />
      <span class="lab-title">数据科学与情报分析实验室</span>
    </div>
    
    <el-menu 
      :default-active="activeIndex" 
      class="lab-menu lab-menu-right" 
      mode="horizontal" 
      @select="handleSelect"
      background-color="transparent"
      text-color="#ffffff"
      active-text-color="#e3f2fd">
      <el-menu-item index="1">首页</el-menu-item>
      <el-menu-item index="2">成员</el-menu-item>
      <el-menu-item index="3">成果</el-menu-item>
      <el-menu-item index="4">项目</el-menu-item>
      <el-menu-item index="5">活动</el-menu-item>
      <el-menu-item index="8">联系我们</el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped lang="scss">
/* 导航栏样式 */
.lab-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 70px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  backdrop-filter: blur(15px);
  box-shadow: 0 2px 15px rgba(148, 163, 184, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
}

.lab-navbar-logo {
  display: flex;
  align-items: center;
}

.lab-logo {
  height: 40px;
  margin-right: 10px;
}

.lab-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.lab-menu {
  flex: 1;
  display: flex;
  justify-content: center;
  border-bottom: none;
}

.lab-menu-right {
  justify-content: flex-end;
}

/* 修复菜单项点击后底色加深的问题 */
:deep(.el-menu-item) {
  &:focus {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
  
  &:focus-visible {
    background-color: rgba(255, 255, 255, 0.1) !important;
    outline: none;
  }
  
  &.is-active:focus {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .lab-navbar {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }
  
  .lab-navbar-logo {
    margin-bottom: 10px;
  }
  
  .lab-menu {
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
  }
}
</style>