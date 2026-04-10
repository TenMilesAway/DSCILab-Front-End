<template>
  <div class="activity-detail">
    <div class="back-wrap">
      <el-button type="primary" :icon="ArrowLeft" @click="$emit('back')">
        返回活动列表
      </el-button>
    </div>

    <div v-if="loading" class="state-wrap">
      <el-skeleton :rows="6" animated />
    </div>

    <div v-else-if="eventDetail" class="content-wrap">
      <h1 class="title">{{ eventDetail.title }}</h1>
      <div class="meta">
        <span>时间：{{ formatDate(eventDetail.eventTime || eventDetail.createTime) }}</span>
        <span v-if="authorText">作者：{{ authorText }}</span>
      </div>

      <div class="content" v-html="eventDetail.content || ''" />
    </div>

    <div v-else class="state-wrap">
      <el-empty description="活动不存在或未发布" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import dayjs from "dayjs";
import { ArrowLeft } from "@element-plus/icons-vue";
import { getOpenEventDetailApi, type LabEventDTO } from "@/api/lab/events";

defineOptions({
  name: "ActivityDetail"
});

interface Props {
  eventId: number;
}

const props = defineProps<Props>();
defineEmits<{ back: [] }>();

const loading = ref(false);
const eventDetail = ref<LabEventDTO | null>(null);

const authorText = computed(() => {
  if (!eventDetail.value?.authors || eventDetail.value.authors.length === 0) {
    return "";
  }
  return eventDetail.value.authors
    .map(item => item?.name)
    .filter(Boolean)
    .join("、");
});

const formatDate = (value?: string) => {
  if (!value) return "-";
  return dayjs(value).format("YYYY-MM-DD");
};

const loadDetail = async () => {
  if (!props.eventId) {
    eventDetail.value = null;
    return;
  }
  loading.value = true;
  try {
    const res = await getOpenEventDetailApi(props.eventId);
    eventDetail.value = res.data || null;
  } catch {
    eventDetail.value = null;
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.eventId,
  () => {
    loadDetail();
  }
);

onMounted(() => {
  loadDetail();
});
</script>

<style scoped lang="scss">
.activity-detail {
  max-width: 1100px;
  margin: 0 auto;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 8%);
}

.back-wrap {
  margin-bottom: 16px;
}

.state-wrap {
  padding: 24px 0;
}

.title {
  margin: 0 0 12px;
  font-size: 30px;
  color: #111827;
}

.meta {
  margin-bottom: 20px;
  color: #6b7280;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.content {
  color: #1f2937;
  line-height: 1.8;

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 10px 0;
  }
}
</style>
