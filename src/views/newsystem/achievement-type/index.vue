<template>
  <div class="achievement-type-management">
    <div class="main-content">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>成果类型管理</span>
          </div>
        </template>
        <div class="empty-content">
          <el-empty description="页面正在开发中..." />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// 页面标题
defineOptions({
  name: "AchievementTypeManagement"
});

onMounted(() => {
  console.log("成果类型管理页面已加载");
});
</script>

<style scoped>
.achievement-type-management {
  padding: 20px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.box-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.empty-content {
  padding: 60px 0;
  text-align: center;
}
</style>