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
      <img src="/logo.svg" alt="实验室标志" class="lab-logo" />
      <span class="lab-title">数据科学与情报分析实验室</span>
    </div>
    
    <el-menu 
      :default-active="activeIndex" 
      class="lab-menu lab-menu-right" 
      mode="horizontal" 
      @select="handleSelect"
      background-color="rgb(248, 248, 248)"
      text-color="#333333"
      active-text-color="#1976d2">
      <el-menu-item index="1">首页</el-menu-item>
      <el-menu-item index="2">成员</el-menu-item>
      <el-menu-item index="3">论著</el-menu-item>
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
  background: rgb(248, 248, 248);
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
  background: linear-gradient(135deg, #64748b, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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