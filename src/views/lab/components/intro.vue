<script setup lang="ts">
defineOptions({
  name: "LabIntroCard"
});

interface Props {
  title?: string;
  content?: string[];
}

withDefaults(defineProps<Props>(), {
  title: '实验室简介',
  content: () => [
    '位于<strong style="color: #3b82f6; font-weight: 700;">北京信息科技大学</strong>，中华人民共和国首都北京市的一所全日制公办本科大学，由原机械部所属北京机械工业学院和原电子部所属北京信息工程学院合并组建，是北京市重点支持建设的信息学科较为齐全的高校。',
    '由高校及企业的专家学者共同组建，包括<span style="color: #8b5cf6; font-weight: 600;">清华、中科院、北理、北邮</span>在内的多位老师联合指导，其中60%以上的老师具有海外交流/留学经历（匹兹堡大学、英国萨里大学、CSIRO）。实验室承担多项<strong style="color: #10b981;">国家重点研发计划、国家自然科学基金</strong>及国防科研/工程项目，在TON、TSC等顶级刊物发表论文多篇。同时实验室与中科院煤转化国家重点实验室、北邮网络技术研究院（国家重点实验室）和匹兹堡大学生物信息学系等国内外知名实验室有着长期学术交流合作。',
    '实验室致力于<span style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 600;">情报理论与方法、文本处理、机器视觉处理、机器学习、开源情报、大数据分析</span>等前沿交叉学科技术在政府、产业、企业、军工等领域情报分析决策中的产学研用。实验室紧密跟踪研究国际在计算机科学与情报分析应用领域的前沿技术、热点课题及学科研究发展方向，围绕大数据、人工智能与情报采集、分析、决策等的融合应用等开展项目实践、方法研究、学术交流与人才培养等具体工作，努力将该机构建设成为在国内外情报分析决策应用领域具有重要影响力的<strong style="color: #3b82f6;">智库型研究机构</strong>。'
  ]
});
</script>

<template>
  <div class="lab-intro-section">
    <div class="intro-container">
      <div class="intro-header">
        <div class="header-decoration"></div>
        <h2 class="intro-title">{{ title }}</h2>
        <div class="header-decoration"></div>
      </div>
      
      <div class="intro-content">
        <div class="content-block" v-for="(paragraph, index) in content" :key="index">
          <div class="block-number">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="block-content">
            <p class="paragraph-text" v-html="paragraph"></p>
          </div>
        </div>
      </div>
      
      <div class="intro-footer">
        <div class="footer-highlight">
          <span class="highlight-text">致力于前沿技术研究与产学研用融合</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lab-intro-section {
  max-width: 1200px;
  margin: -60px auto 60px;
  padding: 0 20px;
}

.intro-container {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
  backdrop-filter: blur(20px);
  border-radius: 24px;
  margin-top: 150px;
  padding: 100px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.08),
    0 8px 32px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
    background-size: 300% 100%;
    animation: gradientShift 6s ease-in-out infinite;
  }
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.intro-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  gap: 20px;
}

.header-decoration {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #3b82f6, transparent);
  border-radius: 1px;
}

.intro-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  text-align: center;
  letter-spacing: 0.5px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 2px;
  }
}

.intro-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.content-block {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 24px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.3);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.8);
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, #3b82f6, #8b5cf6);
    border-radius: 0 2px 2px 0;
  }
}

.block-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
}

.block-content {
  flex: 1;
}

.paragraph-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #374151;
  margin: 0;
  text-align: justify;
  font-weight: 400;
  
  &::first-line {
    font-weight: 500;
    color: #1f2937;
  }
}

.intro-footer {
  margin-top: 40px;
  text-align: center;
}

.footer-highlight {
  display: inline-block;
  padding: 16px 32px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 50px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
    animation: shimmer 3s infinite;
  }
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.highlight-text {
  font-size: 1.2rem;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .intro-container {
    padding: 32px 24px;
  }
  
  .intro-title {
    font-size: 2rem;
  }
  
  .content-block {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }
  
  .block-number {
    align-self: flex-start;
  }
  
  .paragraph-text {
    font-size: 1rem;
  }
  
  .highlight-text {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .intro-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .header-decoration {
    width: 40px;
  }
  
  .intro-title {
    font-size: 1.8rem;
  }
}
</style>