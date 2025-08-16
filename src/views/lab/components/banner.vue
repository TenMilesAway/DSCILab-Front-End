<script setup lang="ts">
defineOptions({
  name: "LabBanner"
});

interface Props {
  title?: string;
  subtitle?: string;
}

withDefaults(defineProps<Props>(), {
  title: '数据科学与情报分析实验室',
  subtitle: 'Data Science & Intelligence Analysis, DSCI'
});
</script>

<template>
  <div class="lab-banner">
    <h1 class="lab-banner-title">{{ title }}</h1>
    <h2 class="lab-banner-subtitle">{{ subtitle }}</h2>
  </div>
</template>

<style scoped lang="scss">
.lab-banner {
  height: 450px;
  background: linear-gradient(135deg, #94a3b8 0%, #cbd5e1 30%, #e2e8f0 70%, #f1f5f9 100%);
  color: #334155;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px;
  position: relative;
  overflow: hidden;
}

.lab-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.8" fill="%23f8fafc" opacity="0.4"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
  opacity: 0.6;
}

.lab-banner-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(148, 163, 184, 0.3);
  color: #1e293b;
}

.lab-banner-subtitle {
  font-size: 1.5rem;
  opacity: 0.8;
  margin-bottom: 30px;
  color: #475569;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .lab-banner {
    height: 300px;
  }
  
  .lab-banner-title {
    font-size: 2rem;
  }
  
  .lab-banner-subtitle {
    font-size: 1.2rem;
  }
}

@media (max-width: 768px) {
  .lab-banner {
    height: 250px;
  }
  
  .lab-banner-title {
    font-size: 1.8rem;
  }
}
</style>