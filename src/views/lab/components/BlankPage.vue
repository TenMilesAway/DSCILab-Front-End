<script setup lang="ts">
defineOptions({
  name: "BlankPage"
});

interface Props {
  title?: string;
  subtitle?: string;
}

withDefaults(defineProps<Props>(), {
  title: '页面标题',
  subtitle: '这是一个空白页面组件'
});
</script>

<template>
  <div class="blank-page">
    <div class="blank-content">
      <div class="blank-icon">📄</div>
      <h2>{{ title }}</h2>
      <p>{{ subtitle }}</p>
      <div class="blank-description">
        <p>该页面正在开发中，敬请期待...</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.blank-page {
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  padding: 40px 20px;
}

.blank-content {
  text-align: center;
  padding: 60px 40px;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(148, 163, 184, 0.2);
  border: 1px solid rgba(226, 232, 240, 0.3);
  max-width: 500px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 48px rgba(148, 163, 184, 0.25);
  }
}

.blank-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  filter: drop-shadow(0 2px 4px rgba(148, 163, 184, 0.3));
}

h2 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(148, 163, 184, 0.3);
}

p {
  font-size: 1.2rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
}

.blank-description {
  padding-top: 20px;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
  
  p {
    font-size: 1rem;
    color: #94a3b8;
    font-style: italic;
    margin-bottom: 0;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .blank-page {
    padding: 20px 15px;
  }
  
  .blank-content {
    padding: 40px 30px;
    margin: 0 10px;
    
    h2 {
      font-size: 1.8rem;
    }
    
    p {
      font-size: 1rem;
    }
    
    .blank-icon {
      font-size: 3rem;
    }
  }
}
</style>