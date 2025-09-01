<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: "ResearchSection"
});

interface ResearchArea {
  icon: string;
  title: string;
  description: string;
  detailDesc: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  researchAreas?: ResearchArea[];
}

const selectedIndex = ref<number | null>(null);

const selectArea = (index: number) => {
  selectedIndex.value = selectedIndex.value === index ? null : index;
};

withDefaults(defineProps<Props>(), {
  title: '研究方向',
  subtitle: 'RESEARCH AREAS',
  researchAreas: () => [
    {
      icon: 'el-icon-data-analysis',
      title: '知识图谱',
      description: '研究知识图谱领域知识本体构建、知识实例抽取、知识关系抽取、知识融合等知识图谱核心关键技术',
      detailDesc: '深度处理各类多源异构数据，构建海量数据并开构建专业领域知识图谱，为各类上层应用（例如智能问答、语义检索、规律挖掘等）提供底层知识图谱数据支撑。'
    },
    {
      icon: 'el-icon-cpu',
      title: '时序数据分析',
      description: '采集并利用海量开源的轨迹数据，通过时序深度学习技术，理解多个不同标记间的运动关系',
      detailDesc: '预测轨迹并进行多角度的分析和预测，为智慧城市建设提供数据支撑和决策依据。'
    },
    {
      icon: 'el-icon-view',
      title: '计算机视觉',
      description: '针对空中拍摄图像，采用图像增强、图像配准等图像处理技术，对于所拍摄的目标物体进行检测',
      detailDesc: '跟踪等任务，实现多任务并行处理，并在此基础上实现对于场景内容的高语义理解。'
    },
    {
      icon: 'el-icon-connection',
      title: '边缘计算',
      description: '针对靠近边缘协作快速发展趋势，探索面向性能优化的多效算力自适应协作机制',
      detailDesc: '实现算力计算任务所需算力的合理分配，使端、边、云点可以进行数据和资源的分布式统一调度。'
    },
    {
      icon: 'el-icon-magic-stick',
      title: '虚拟现实',
      description: '针对虚拟漫游中物理空间有限的问题，通过重新映射用户在虚拟环境中的运动',
      detailDesc: '从而突破空间限制，允许用户在有限的物理空间内实现更大范围的虚拟漫游。'
    }
  ]
});
</script>

<template>
  <div class="research-section">
    <div class="research-container">
      <div class="research-header">
        <h2 class="research-title">{{ title }}</h2>
        <p class="research-subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="research-scroll-container">
        <div 
          v-for="(item, index) in researchAreas" 
          :key="index" 
          class="research-item"
          :class="{ 'expanded': selectedIndex === index, [`research-item-${index}`]: true }"
          @click="selectArea(index)"
        >
          <!-- 折叠状态的标题卡片 -->
          <div class="research-tab">
            <div class="tab-icon">
              <i :class="item.icon"></i>
            </div>
            <h3 class="tab-title">{{ item.title }}</h3>
          </div>
          
          <!-- 展开状态的详细内容 -->
          <div class="research-content">
            <div class="content-inner">
              <div class="content-header">
                <div class="content-icon">
                  <i :class="item.icon"></i>
                </div>
                <h3 class="content-title">{{ item.title }}</h3>
              </div>
              <div class="content-body">
                <p class="content-description">{{ item.description }}</p>
                <p class="content-detail">{{ item.detailDesc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* 研究方向区域样式 */
.research-section {
  background: #f8fafc;
  padding: 100px 0;
  margin-top: 80px;
  position: relative;
  overflow: hidden;
}

.research-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.research-header {
  text-align: center;
  margin-bottom: 60px;
  animation: fadeInUp 1s ease-out;
}

.research-title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
  position: relative;
  text-shadow: 0 2px 4px rgba(30, 58, 138, 0.3);
  letter-spacing: 1px;
}

.research-title::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #1e3a8a);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.research-subtitle {
  font-size: 1.2rem;
  color: #64748b;
  letter-spacing: 3px;
  margin-top: 25px;
  font-weight: 300;
}

/* 横向滚动容器 */
.research-scroll-container {
  display: flex;
  gap: 0;
  margin-top: 40px;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(30, 58, 138, 0.15);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

/* 研究方向项目 */
.research-item {
  position: relative;
  flex: 1;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.3;
    transform: rotate(5deg) scale(1.1);
    transition: all 0.8s ease;
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
  }
  
  &.expanded {
    flex: 3;
    
    &::before {
      opacity: 0.6;
      transform: rotate(0deg) scale(1.05);
    }
  }
  
  &:not(.expanded):hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    
    &::before {
      opacity: 0.5;
      transform: rotate(3deg) scale(1.08);
    }
  }
  
  /* 知识图谱 - 紫色主题 */
  &.research-item-0 {
    &::before {
      background-image: url('@/assets/lab/知识图谱.png');
    }
    
    &::after {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.2));
    }
    
    &.expanded::after {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.1));
    }
    
    &:hover::after {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(168, 85, 247, 0.15));
    }
  }
  
  /* 时序数据分析 - 蓝绿色主题 */
  &.research-item-1 {
    &::before {
      background-image: url('@/assets/lab/时序数据分析.jpg');
    }
    
    &::after {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(14, 165, 233, 0.2));
    }
    
    &.expanded::after {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(14, 165, 233, 0.1));
    }
    
    &:hover::after {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(14, 165, 233, 0.15));
    }
  }
  
  /* 计算机视觉 - 绿色主题 */
  &.research-item-2 {
    &::before {
      background-image: url('@/assets/lab/计算机视觉.png');
    }
    
    &::after {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(34, 197, 94, 0.2));
    }
    
    &.expanded::after {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(34, 197, 94, 0.1));
    }
    
    &:hover::after {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(34, 197, 94, 0.15));
    }
  }
  
  /* 边缘计算 - 橙色主题 */
  &.research-item-3 {
    &::before {
      background-image: url('@/assets/lab/边缘计算.jpg');
    }
    
    &::after {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(251, 146, 60, 0.2));
    }
    
    &.expanded::after {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 146, 60, 0.1));
    }
    
    &:hover::after {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(251, 146, 60, 0.15));
    }
  }
  
  /* 虚拟现实 - 粉红色主题 */
  &.research-item-4 {
    &::before {
      background-image: url('@/assets/lab/虚拟现实.jpeg');
    }
    
    &::after {
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(219, 39, 119, 0.2));
    }
    
    &.expanded::after {
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.1));
    }
    
    &:hover::after {
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(219, 39, 119, 0.15));
    }
  }
}

/* 折叠状态的标题卡片 */
.research-tab {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  color: white;
  transition: all 0.5s ease;
  z-index: 3;
  
  .research-item.expanded & {
    opacity: 0;
    transform: translateX(-100%);
  }
}

.tab-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  
  i {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  
  .research-item:hover & {
    transform: scale(1.1) rotateY(10deg);
  }
}

.tab-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    writing-mode: horizontal-tb;
    font-size: 1rem;
  }
}

/* 展开状态的详细内容 */
.research-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(226, 232, 240, 0.95));
  backdrop-filter: blur(15px);
  z-index: 4;
  
  .research-item.expanded & {
    opacity: 1;
    transform: translateX(0);
  }
}

.content-inner {
  padding: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: slideInContent 0.8s ease-out 0.3s both;
  
  .research-item.expanded & {
    animation: slideInContent 0.8s ease-out 0.3s both;
  }
}

.content-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  
  .content-icon {
    font-size: 2.5rem;
    color: #1e3a8a;
    margin-right: 20px;
    
    i {
      filter: drop-shadow(0 2px 4px rgba(30, 58, 138, 0.3));
    }
  }
  
  .content-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #1e3a8a, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.content-body {
  flex: 1;
  
  .content-description {
    font-size: 1.1rem;
    color: #374151;
    line-height: 1.8;
    margin-bottom: 20px;
    font-weight: 500;
  }
  
  .content-detail {
    font-size: 1rem;
    color: #6b7280;
    line-height: 1.7;
    margin: 0;
    padding: 20px;
    background: rgba(30, 58, 138, 0.05);
    border-radius: 12px;
    border-left: 4px solid #3b82f6;
  }
}

/* 动画定义 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInContent {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .research-section {
    padding: 70px 0;
  }
  
  .research-title {
    font-size: 2.2rem;
  }
  
  .research-scroll-container {
    height: 350px;
  }
  
  .content-inner {
    padding: 30px;
  }
  
  .content-header .content-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 768px) {
  .research-section {
    padding: 60px 0;
  }
  
  .research-title {
    font-size: 2rem;
  }
  
  .research-scroll-container {
    flex-direction: column;
    height: auto;
    gap: 10px;
  }
  
  .research-item {
    flex: none;
    height: 80px;
    border-radius: 12px;
    
    &.expanded {
      height: auto;
      min-height: 350px;
    }
    
    /* 确保点击区域足够大 */
    &:not(.expanded) {
      cursor: pointer;
      
      &:active {
        transform: scale(0.98);
      }
    }
  }
  
  .research-tab {
    flex-direction: row;
    padding: 15px;
    
    .tab-icon {
      font-size: 2rem;
      margin-right: 15px;
      margin-bottom: 0;
    }
    
    .tab-title {
      font-size: 1.1rem;
      font-weight: 600;
    }
  }
  
  /* 展开内容在手机端的优化 */
  .research-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    transform: translateY(100%);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(248, 250, 252, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 12px;
    z-index: 10;
    
    .research-item.expanded & {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .content-inner {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow-y: auto;
  }
  
  .content-header {
    flex-direction: row;
    align-items: center;
    margin-bottom: 20px;
    
    .content-icon {
      margin-right: 15px;
      margin-bottom: 0;
      font-size: 2rem;
    }
    
    .content-title {
      font-size: 1.4rem;
    }
  }
  
  .content-body {
    flex: 1;
    overflow-y: auto;
    
    .content-description {
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 15px;
      color: #374151;
      font-weight: 500;
    }
    
    .content-detail {
      font-size: 0.9rem;
      padding: 15px;
      line-height: 1.6;
      background: rgba(59, 130, 246, 0.08);
      border-radius: 8px;
      border-left: 3px solid #3b82f6;
      color: #4b5563;
      margin: 0;
    }
  }
}

/* 更小屏幕的额外优化 */
@media (max-width: 480px) {
  .research-container {
    padding: 0 15px;
  }
  
  .research-title {
    font-size: 1.8rem;
  }
  
  .research-item {
    height: 70px;
    
    &.expanded {
      height: 280px;
    }
  }
  
  .research-tab {
    padding: 12px;
    
    .tab-icon {
      font-size: 1.8rem;
      margin-right: 12px;
    }
    
    .tab-title {
      font-size: 1rem;
    }
  }
  
  .content-inner {
    padding: 15px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .content-header {
    .content-icon {
      font-size: 1.8rem;
      margin-right: 12px;
    }
    
    .content-title {
      font-size: 1.2rem;
    }
  }
  
  .content-body {
    flex: 1;
    overflow-y: auto;
    
    .content-description {
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 12px;
    }
    
    .content-detail {
      font-size: 0.85rem;
      padding: 12px;
      line-height: 1.5;
      background: rgba(59, 130, 246, 0.06);
      border-radius: 6px;
      border-left: 2px solid #3b82f6;
    }
  }
}
</style>