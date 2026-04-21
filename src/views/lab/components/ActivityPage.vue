<template>
  <div class="activities-page">
    <ActivityDetail
      v-if="showDetail && selectedEventId"
      :event-id="selectedEventId"
      @back="handleBack"
    />

    <div v-else class="activities-list">
      <div class="header">
        <h2>活动</h2>
        <el-input
          v-model="keyword"
          class="search"
          placeholder="搜索活动标题"
          clearable
        />
      </div>

      <div v-if="loading" class="state-wrap">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="filteredEvents.length === 0" class="state-wrap">
        <el-empty description="暂无活动" />
      </div>
      <ul v-else class="event-list">
        <li v-for="item in filteredEvents" :key="item.id" class="event-item">
          <button class="title-btn" @click="openDetail(item.id)">
            {{ item.title }}
          </button>
          <span class="event-date">{{ formatDate(item.eventTime) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import dayjs from "dayjs";
import ActivityDetail from "./ActivityDetail.vue";
import { getOpenEventsApi, type LabEventDTO } from "@/api/lab/events";

const loading = ref(false);
const keyword = ref("");
const events = ref<LabEventDTO[]>([]);
const showDetail = ref(false);
const selectedEventId = ref<number | null>(null);

const filteredEvents = computed(() => {
  const list = [...events.value].sort((a, b) => {
    const aTime = new Date(a.eventTime || 0).getTime();
    const bTime = new Date(b.eventTime || 0).getTime();
    return bTime - aTime;
  });

  const q = keyword.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(item => (item.title || "").toLowerCase().includes(q));
});

const formatDate = (value?: string) => {
  if (!value) return "-";
  return dayjs(value).format("YYYY-MM-DD");
};

const loadEvents = async () => {
  loading.value = true;
  try {
    const res = await getOpenEventsApi({
      published: true,
      pageNum: 1,
      pageSize: 200
    });
    events.value = res.data?.rows || [];
  } finally {
    loading.value = false;
  }
};

const openDetail = (eventId: number) => {
  selectedEventId.value = eventId;
  showDetail.value = true;
  window.scrollTo({ top: 0 });
};

const handleBack = () => {
  showDetail.value = false;
  selectedEventId.value = null;
};

onMounted(() => {
  loadEvents();
});
</script>

<style scoped lang="scss">
.activities-page {
  min-height: calc(100vh - 70px);
  padding: 24px;
  background: #f5f7fa;
}

.activities-list {
  max-width: 1100px;
  margin: 0 auto;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 8%);
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #1f2937;
  }
}

.search {
  width: 280px;
}

.state-wrap {
  padding: 24px 0;
}

.event-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.event-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding: 14px 0;
}

.title-btn {
  border: none;
  background: transparent;
  color: #1d4ed8;
  text-align: left;
  padding: 0;
  cursor: pointer;
  font-size: 16px;
  min-width: 0;

  &:hover {
    text-decoration: underline;
  }
}

.event-date {
  color: #6b7280;
  white-space: nowrap;
}

@media (width <= 768px) {
  .activities-page {
    padding: 12px;
  }

  .activities-list {
    padding: 14px;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .search {
    width: 100%;
  }

  .event-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
