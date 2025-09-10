<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

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

// 移动端菜单显示状态
const isMobileMenuOpen = ref(false);

// 处理菜单选择事件
const handleSelect = (key: string) => {
  emit('select', key);
  // 手机端选择菜单项后自动关闭菜单
  isMobileMenuOpen.value = false;
};

// 切换移动端菜单
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// 点击外部区域关闭菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  const navbar = document.querySelector('.lab-navbar');
  
  if (navbar && !navbar.contains(target) && isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false;
  }
};

// 监听点击事件
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="lab-navbar">
    <div class="lab-navbar-logo">
      <img src="@/assets/lab/logo.png" alt="实验室标志" class="lab-logo" />
      <span class="lab-title">数据科学与情报分析实验室</span>
    </div>
    
    <!-- 桌面端菜单 -->
    <el-menu 
      :default-active="activeIndex" 
      class="lab-menu lab-menu-desktop" 
      mode="horizontal" 
      @select="handleSelect"
      background-color="transparent"
      text-color="#ffffff"
      active-text-color="#e3f2fd">
      <el-menu-item index="1">首页</el-menu-item>
      <el-menu-item index="2">成员</el-menu-item>
      <el-menu-item index="3">成果</el-menu-item>
      <el-menu-item index="4">项目</el-menu-item>
      <!-- <el-menu-item index="5">活动</el-menu-item> -->
    </el-menu>
    
    <!-- 移动端汉堡菜单按钮 -->
    <div class="mobile-menu-toggle" @click="toggleMobileMenu">
      <div class="hamburger" :class="{ 'active': isMobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    
    <!-- 移动端下拉菜单 -->
    <div class="mobile-dropdown-menu" :class="{ 'active': isMobileMenuOpen }">
      <div class="mobile-menu-items">
        <div class="mobile-menu-item" 
             :class="{ 'active': activeIndex === '1' }"
             @click="handleSelect('1')">
          首页
        </div>
        <div class="mobile-menu-item" 
             :class="{ 'active': activeIndex === '2' }"
             @click="handleSelect('2')">
          成员
        </div>
        <div class="mobile-menu-item" 
             :class="{ 'active': activeIndex === '3' }"
             @click="handleSelect('3')">
          成果
        </div>
        <div class="mobile-menu-item" 
             :class="{ 'active': activeIndex === '4' }"
             @click="handleSelect('4')">
          项目
        </div>
        <div class="mobile-menu-item" 
             :class="{ 'active': activeIndex === '5' }"
             @click="handleSelect('5')">
          活动
        </div>
      </div>
    </div>
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

.lab-menu-desktop {
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

/* 移动端汉堡菜单按钮 */
.mobile-menu-toggle {
  display: none;
  cursor: pointer;
  padding: 8px;
  z-index: 1001;
}

.hamburger {
  width: 24px;
  height: 18px;
  position: relative;
  transform: rotate(0deg);
  transition: 0.3s ease-in-out;
  
  span {
    display: block;
    position: absolute;
    height: 2px;
    width: 100%;
    background: #ffffff;
    border-radius: 2px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: 0.3s ease-in-out;
    
    &:nth-child(1) {
      top: 0px;
    }
    
    &:nth-child(2) {
      top: 8px;
    }
    
    &:nth-child(3) {
      top: 16px;
    }
  }
  
  &.active {
    span {
      &:nth-child(1) {
        top: 8px;
        transform: rotate(135deg);
      }
      
      &:nth-child(2) {
        opacity: 0;
        left: -60px;
      }
      
      &:nth-child(3) {
        top: 8px;
        transform: rotate(-135deg);
      }
    }
  }
}

/* 移动端下拉菜单 */
.mobile-dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 0 0 12px 12px;
  overflow: hidden;
  transform: translateY(-10px);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 999;
  
  &.active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
}

.mobile-menu-items {
  padding: 8px 0;
}

.mobile-menu-item {
  display: block;
  padding: 16px 24px;
  color: #374151;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: rgba(59, 130, 246, 0.08);
    color: #2563eb;
  }
  
  &.active {
    background: linear-gradient(135deg, rgba(30, 60, 114, 0.1), rgba(42, 82, 152, 0.1));
    color: #1e3c72;
    font-weight: 600;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, #1e3c72, #2a5298);
      border-radius: 0 0 2px 2px;
    }
  }
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .lab-navbar {
    padding: 0 20px;
  }
  
  .lab-title {
    font-size: 1.1rem;
  }
  
  .lab-menu-desktop {
    :deep(.el-menu-item) {
      padding: 0 12px;
      font-size: 0.9rem;
    }
  }
}

@media (max-width: 768px) {
  .lab-navbar {
    padding: 0 15px;
    height: 60px;
    position: relative;
  }
  
  .lab-logo {
    height: 32px;
  }
  
  .lab-title {
    font-size: 1rem;
  }
  
  .lab-menu-desktop {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
  
  .mobile-dropdown-menu {
    display: block;
  }
}

@media (max-width: 480px) {
  .lab-navbar {
    padding: 0 12px;
    height: 56px;
  }
  
  .lab-logo {
    height: 28px;
    margin-right: 8px;
  }
  
  .lab-title {
    font-size: 0.9rem;
    line-height: 1.2;
  }
  
  .mobile-menu-item {
    padding: 14px 20px;
    font-size: 15px;
  }
}

@media (max-width: 360px) {
  .lab-title {
    display: none;
  }
  
  .mobile-menu-item {
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>