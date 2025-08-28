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
  background: url('@/assets/lab/default.jpg') center/cover no-repeat;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px;
  position: relative;
  overflow: hidden;
  margin-bottom: 0;
}

.lab-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.lab-banner-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 16px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  color: #ffffff;
  position: relative;
  z-index: 2;
}

.lab-banner-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  margin-bottom: 30px;
  color: #ffffff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  position: relative;
  z-index: 2;
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