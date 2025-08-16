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
      
      <div class="research-cards">
        <div class="research-card" v-for="(item, index) in researchAreas" :key="index" :style="{animationDelay: index * 0.1 + 's'}">
          <div class="research-card-inner">
            <div class="research-icon">
              <i :class="item.icon"></i>
            </div>
            <h3 class="research-card-title">{{ item.title }}</h3>
            <p class="research-card-desc">{{ item.description }}</p>
            <div class="research-card-overlay">
              <div class="overlay-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.detailDesc }}</p>
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
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 30%, #94a3b8 70%, #64748b 100%);
  padding: 100px 0;
  margin-top: 80px;
  position: relative;
  overflow: hidden;
}

.research-container {
  max-width: 1200px;
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
  color: #1e293b;
  margin-bottom: 15px;
  position: relative;
  text-shadow: 0 2px 4px rgba(148, 163, 184, 0.3);
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
  background: linear-gradient(90deg, #64748b, rgba(148, 163, 184, 0.6));
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(148, 163, 184, 0.2);
}

.research-subtitle {
  font-size: 1.2rem;
  color: rgba(51, 65, 85, 0.8);
  letter-spacing: 3px;
  margin-top: 25px;
  font-weight: 300;
}

.research-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.research-card {
  perspective: 1000px;
  height: 320px;
  animation: fadeInUp 0.8s ease-out both;
}

.research-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  background: rgba(248, 250, 252, 0.95);
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(148, 163, 184, 0.15);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(226, 232, 240, 0.4);
}

.research-card:hover .research-card-inner {
  transform: rotateY(180deg);
}

.research-card-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1;
}

.research-card:hover .research-card-inner::before {
  opacity: 0.9;
}

.research-icon {
  font-size: 3rem;
  color: #64748b;
  margin: 40px 0 20px;
  transition: all 0.3s ease;
}

.research-card:hover .research-icon {
  transform: scale(1.2) rotateY(360deg);
  color: #f8fafc;
}

.research-card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 15px;
  transition: color 0.3s;
}

.research-card:hover .research-card-title {
  color: #f8fafc;
}

.research-card-desc {
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.6;
  padding: 0 20px;
  transition: color 0.3s;
}

.research-card:hover .research-card-desc {
  color: rgba(248, 250, 252, 0.9);
}

.research-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: rotateY(180deg);
  transition: opacity 0.3s;
  backface-visibility: hidden;
  border-radius: 15px;
}

.research-card:hover .research-card-overlay {
  opacity: 1;
}

.overlay-content {
  padding: 30px;
  text-align: center;
}

.overlay-content h4 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  font-weight: 600;
}

.overlay-content p {
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.9;
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

.research-card:nth-child(even) {
  animation-delay: 0.2s;
}

.research-card:nth-child(3n) {
  animation-delay: 0.4s;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .research-section {
    padding: 70px 0;
  }
  
  .research-title {
    font-size: 2.2rem;
  }
  
  .research-cards {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 25px;
  }
  
  .research-card {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .research-section {
    padding: 60px 0;
  }
  
  .research-title {
    font-size: 2rem;
  }
  
  .research-cards {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .research-card {
    height: 280px;
  }
  
  .research-card-inner {
    padding: 20px;
  }
  
  .research-icon {
    font-size: 2.5rem;
    margin: 30px 0 15px;
  }
  
  .research-card-title {
    font-size: 1.3rem;
  }
  
  .research-card-desc {
    font-size: 0.9rem;
    padding: 0 15px;
  }
}
</style>