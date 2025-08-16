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
    '位于北京信息科技大学。北京信息科技大学是中华人民共和国首都北京市的一所全日制公办本科大学。由原机械部所属北京机械工业学院和原电子部所属北京信息工程学院合并组建，是北京市重点支持建设的信息学科较为齐全的高校。',
    '由高校及企业的专家学者共同组建，包括清华、中科院、北理、北邮在内的多位老师联合指导，其中60%以上的老师具有海外交流/留学经历（匹兹堡大学、英国萨里大学、CSIRO）；实验室承担多项国家重点研发计划、国家自然科学基金及国防科研/工程项目，在TON、TSC等顶级刊物发表论文多篇。同时实验室与中科院煤转化国家重点实验室、北邮网络技术研究院（国家重点实验室）和匹兹堡大学生物信息学系等国内外知名实验室有着长期学术交流合作。',
    '实验室致力于情报理论与方法、文本处理、机器视觉处理、机器学习、开源情报、大数据分析等前沿交叉学科技术在政府、产业、企业、军工等领域情报分析决策中的产学研用。实验室紧密跟踪研究国际在计算机科学与情报分析应用领域的前沿技术、热点课题及学科研究发展方向，围绕大数据、人工智能与情报采集、分析、决策等的融合应用等开展项目实践、方法研究、学术交流与人才培养等具体工作，努力将该机构建设成为在国内外情报分析决策应用领域具有重要影响力的智库型研究机构。'
  ]
});
</script>

<template>
  <div class="lab-cards">
    <el-card class="lab-card">
      <template #header>
        <div class="card-header">
          <span>{{ title }}</span>
        </div>
      </template>
      <div class="card-content">
        <p v-for="(paragraph, index) in content" :key="index">{{ paragraph }}</p>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.lab-cards {
  max-width: 1200px;
  margin: -60px auto 40px;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.lab-card {
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(148, 163, 184, 0.15);
  border: 1px solid rgba(226, 232, 240, 0.3);
}

.lab-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 48px rgba(148, 163, 184, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 16px 20px;
  background: linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%);
  color: #1e293b;
}

.card-content {
  text-align: left;
  line-height: 1.8;
  padding: 20px;
  color: #334155;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .lab-cards {
    grid-template-columns: 1fr;
  }
}
</style>