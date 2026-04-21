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
        <span>时间：{{ formatDate(eventDetail.eventTime) }}</span>
      </div>

      <div
        class="content"
        v-html="normalizeContentImgSrc(eventDetail.content || '')"
      />
    </div>

    <div v-else class="state-wrap">
      <el-empty description="活动不存在或未发布" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import dayjs from "dayjs";
import { ArrowLeft } from "@element-plus/icons-vue";
import { getOpenEventDetailApi, type LabEventDTO } from "@/api/lab/events";

const { VITE_APP_BASE_API } = import.meta.env;

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

const formatDate = (value?: string) => {
  if (!value) return "-";
  return dayjs(value).format("YYYY-MM-DD");
};

const normalizeContentImgSrc = (html: string) => {
  if (!html) return "";
  return html.replace(
    /(<img\b[^>]*\bsrc\s*=\s*["'])([^"']+)(["'][^>]*>)/gi,
    (_, p1, src, p3) => {
      const s = String(src || "").trim();
      if (!s) return `${p1}${s}${p3}`;
      if (s.startsWith("data:")) {
        return `${p1}${s}${p3}`;
      }

      const toProxyUploadPath = (pathValue: string) => {
        return `${p1}${VITE_APP_BASE_API}${pathValue}${p3}`;
      };

      if (/^https?:\/\//i.test(s)) {
        try {
          const url = new URL(s);
          if (url.pathname.startsWith("/profile/upload/")) {
            return toProxyUploadPath(`${url.pathname}${url.search}${url.hash}`);
          }
          if (window.location.protocol === "https:" && /^http:\/\//i.test(s)) {
            return `${p1}${s.replace(/^http:\/\//i, "https://")}${p3}`;
          }
          return `${p1}${s}${p3}`;
        } catch {
          return `${p1}${s}${p3}`;
        }
      }

      if (s.startsWith("/profile/upload/")) {
        return toProxyUploadPath(s);
      }

      if (s.startsWith("/")) {
        return `${p1}${VITE_APP_BASE_API}${s}${p3}`;
      }
      return `${p1}${VITE_APP_BASE_API}/${s}${p3}`;
    }
  );
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
