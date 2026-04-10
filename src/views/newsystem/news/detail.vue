<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";

interface DetailProps {
  newsData: {
    id: number;
    title: string;
    eventTime?: string;
    content: string;
    published?: boolean;
    authors?: Array<{
      name?: string;
      nameEn?: string;
      affiliation?: string;
      authorOrder?: number;
      isCorresponding?: boolean;
    }>;
    createTime: string;
    updateTime: string;
  };
}

const props = withDefaults(defineProps<DetailProps>(), {
  newsData: () => ({
    id: 0,
    title: "",
    eventTime: "",
    content: "",
    published: false,
    authors: [],
    createTime: "",
    updateTime: ""
  })
});

const authorText = computed(() => {
  if (
    !Array.isArray(props.newsData.authors) ||
    props.newsData.authors.length === 0
  ) {
    return "";
  }
  return props.newsData.authors
    .map(author => author?.name)
    .filter(Boolean)
    .join("、");
});

const formatDate = (value?: string) => {
  if (!value) return "-";
  return dayjs(value).format("YYYY-MM-DD");
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
};
</script>

<template>
  <div class="news-detail">
    <div class="detail-header">
      <div class="title-section">
        <h1 class="news-title">{{ newsData.title }}</h1>
        <div class="meta-info">
          <el-tag
            :type="newsData.published ? 'success' : 'info'"
            effect="light"
            size="small"
          >
            {{ newsData.published ? "已发布" : "未发布" }}
          </el-tag>
          <span class="time"
            >活动时间：{{ formatDate(newsData.eventTime) }}</span
          >
          <span v-if="authorText" class="author">作者：{{ authorText }}</span>
          <span class="time"
            >创建时间：{{ formatDateTime(newsData.createTime) }}</span
          >
          <span v-if="newsData.updateTime !== newsData.createTime" class="time">
            更新时间：{{ formatDateTime(newsData.updateTime) }}
          </span>
        </div>
      </div>
    </div>

    <div class="content-section">
      <h3 class="section-title">活动内容</h3>
      <div class="content-body">
        <div
          class="content-text"
          v-html="newsData.content.replace(/\n/g, '<br>')"
        />
      </div>
    </div>

    <div class="detail-footer">
      <el-divider />
      <div class="footer-info">
        <span>活动ID：{{ newsData.id }}</span>
        <span>字数统计：约{{ (newsData.content || "").length }}字</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// 响应式设计
@media (width <= 768px) {
  .news-detail {
    padding: 16px;
    margin: 0 8px;

    .detail-header {
      .title-section {
        .news-title {
          font-size: 24px;
        }

        .meta-info {
          font-size: 13px;
        }
      }
    }

    .section-title {
      font-size: 16px !important;
    }

    .content-text {
      font-size: 15px !important;
    }
  }
}

.news-detail {
  max-width: 800px;
  padding: 24px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);

  .detail-header {
    margin-bottom: 24px;

    .title-section {
      .news-title {
        margin: 0 0 16px;
        font-size: 28px;
        font-weight: 600;
        line-height: 1.4;
        color: #303133;
      }

      .meta-info {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
        font-size: 14px;
        color: #606266;

        .el-tag {
          margin-right: 0;
        }

        .author,
        .time {
          color: #909399;
        }
      }
    }
  }

  .content-section {
    margin-bottom: 24px;

    .section-title {
      padding-bottom: 8px;
      margin: 0 0 12px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      border-bottom: 2px solid #409eff;
    }
  }
  .content-body {
    .content-text {
      font-size: 16px;
      line-height: 1.8;
      color: #303133;

      :deep(p) {
        margin-bottom: 16px;
      }

      :deep(img) {
        max-width: 100%;
        height: auto;
        margin: 12px 0;
        border-radius: 4px;
      }
    }
  }

  .detail-footer {
    margin-top: 32px;

    .footer-info {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #909399;

      @media (width <= 768px) {
        flex-direction: column;
        gap: 4px;
      }
    }
  }
}
</style>
