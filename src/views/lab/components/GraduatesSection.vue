<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getMembersListApi, type ApiUser } from "@/api/lab/members";

defineOptions({
  name: "GraduatesSection"
});

interface GraduateItem {
  id: number;
  name: string;
  enrollmentYear?: number;
  graduationDest?: string;
}

interface YearGroup {
  enrollmentYear?: number;
  label: string;
  items: GraduateItem[];
}

const loading = ref(false);
const graduates = ref<GraduateItem[]>([]);

const fetchGraduates = async () => {
  loading.value = true;
  try {
    const res = await getMembersListApi();
    if (res.code !== 0 || !res.data?.rows) {
      throw new Error(res.msg || "获取成员数据失败");
    }

    // 仅保留已毕业学生：status === 2 且 identity === 3（学生）
    const rows = res.data.rows as ApiUser[];
    graduates.value = rows
      .filter(user => user.status === 2 && user.identity === 3)
      .map(user => ({
        id: user.id,
        name: user.realName,
        enrollmentYear: user.enrollmentYear,
        graduationDest: user.graduationDest
      }))
      // 没有毕业去向的就不在首页展示
      .filter(item => !!item.graduationDest && item.graduationDest.trim() !== "");
  } catch (error) {
    console.error("获取毕业去向数据失败:", error);
    ElMessage.error("获取毕业去向数据失败");
  } finally {
    loading.value = false;
  }
};

const groupedByEnrollmentYear = computed<YearGroup[]>(() => {
  if (!graduates.value.length) return [];

  const map = new Map<number | "unknown", GraduateItem[]>();

  for (const item of graduates.value) {
    const key = item.enrollmentYear ?? "unknown";
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(item);
  }

  const groups: YearGroup[] = [];

  for (const [key, items] of map.entries()) {
    // 按姓名排序，避免顺序混乱
    items.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));

    if (key === "unknown") {
      groups.push({
        enrollmentYear: undefined,
        label: "其他年份",
        items
      });
    } else {
      groups.push({
        enrollmentYear: key as number,
        label: `${key} 级`,
        items
      });
    }
  }

  // 有年份的从近到远排序，未知年份排在最后
  groups.sort((a, b) => {
    if (!a.enrollmentYear && !b.enrollmentYear) return 0;
    if (!a.enrollmentYear) return 1;
    if (!b.enrollmentYear) return -1;
    return b.enrollmentYear - a.enrollmentYear;
  });

  return groups;
});

onMounted(() => {
  fetchGraduates();
});
</script>

<template>
  <section class="graduates-section">
    <div class="graduates-container">
      <div class="graduates-header">
        <h2 class="graduates-title">毕业去向</h2>
        <p class="graduates-subtitle">GRADUATE DESTINATIONS</p>
      </div>

      <div v-if="loading" class="graduates-loading">
        <div class="loading-spinner" />
        <p>正在加载毕业去向数据...</p>
      </div>

      <div v-else-if="!groupedByEnrollmentYear.length" class="graduates-empty">
        暂无毕业去向数据
      </div>

      <div v-else class="graduates-grid">
        <div
          v-for="group in groupedByEnrollmentYear"
          :key="group.label"
          class="year-card"
        >
          <div class="year-header">
            <span class="year-label">{{ group.label }}</span>
          </div>
          <ul class="graduate-list">
            <li v-for="item in group.items" :key="item.id" class="graduate-item">
              <span class="graduate-name">{{ item.name }}</span>
              <span class="graduate-dest">
                {{ item.graduationDest || "暂未统计" }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.graduates-section {
  padding: 80px 0 100px;
  background: #f8fafc;
}

.graduates-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.graduates-header {
  text-align: center;
  margin-bottom: 60px;
}

.graduates-title {
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

.graduates-title::after {
  content: "";
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

.graduates-subtitle {
  font-size: 1.2rem;
  color: #64748b;
  letter-spacing: 3px;
  margin-top: 25px;
  font-weight: 300;
}

.graduates-loading,
.graduates-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.graduates-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* 响应式调整：与研究方向标题行为保持一致 */
@media (max-width: 1024px) {
  .graduates-section {
    padding: 70px 0;
  }

  .graduates-title {
    font-size: 2.2rem;
  }
}

@media (max-width: 768px) {
  .graduates-section {
    padding: 60px 0;
  }

  .graduates-title {
    font-size: 2rem;
  }
}

.year-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.year-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 10px;
}

.year-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.graduate-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 260px;
  overflow-y: auto;
}

.graduate-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(229, 231, 235, 0.8);

  &:last-child {
    border-bottom: none;
  }
}

.graduate-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #111827;
  margin-right: 12px;
  white-space: nowrap;
}

.graduate-dest {
  font-size: 0.9rem;
  color: #1d4ed8;
  text-align: right;
  flex: 1;
  word-break: break-all;
}
</style>

