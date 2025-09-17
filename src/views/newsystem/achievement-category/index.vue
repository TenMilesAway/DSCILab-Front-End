<template>
  <div class="main">
    <!-- 只显示树形视图 -->
    <AchievementCategoryTree />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "AchievementCategory"
});

import AchievementCategoryTree from "./tree.vue";
</script>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.main {
  padding: 0;
}
</style>