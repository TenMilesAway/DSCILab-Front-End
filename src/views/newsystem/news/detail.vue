<script setup lang="ts">
import { computed } from "vue";
import { formatDateTime } from "@/utils/formatTime.ts";

interface DetailProps {
  newsData: {
    id: number;
    title: string;
    summary: string;
    content: string;
    type: number;
    status: number;
    coverImage: string;
    author: string;
    createTime: string;
    updateTime: string;
  };
}

const props = withDefaults(defineProps<DetailProps>(), {
  newsData: () => ({
    id: 0,
    title: "",
    summary: "",
    content: "",
    type: 1,
    status: 1,
    coverImage: "",
    author: "",
    createTime: "",
    updateTime: ""
  })
});

// 类型映射
const typeMap = {
  1: { label: "新闻", color: "#409EFF" },
  2: { label: "活动", color: "#67C23A" },
  3: { label: "通知", color: "#E6A23C" }
};

// 状态映射
const statusMap = {
  1: { label: "已发布", color: "success" },
  2: { label: "草稿", color: "info" }
};

// 计算属性
const newsType = computed(
  () => typeMap[props.newsData.type] || { label: "未知", color: "#909399" }
);
const newsStatus = computed(
  () => statusMap[props.newsData.status] || { label: "未知", color: "warning" }
);
</script>

<template>
  <div class="news-detail">
    <!-- 头部信息 -->
    <div class="detail-header">
      <div class="title-section">
        <h1 class="news-title">{{ newsData.title }}</h1>
        <div class="meta-info">
          <el-tag :color="newsType.color" effect="light" size="small">
            {{ newsType.label }}
          </el-tag>
          <el-tag :type="newsStatus.color" effect="light" size="small">
            {{ newsStatus.label }}
          </el-tag>
          <span class="author">作者：{{ newsData.author }}</span>
          <span class="time"
            >发布时间：{{ formatDateTime(newsData.createTime) }}</span
          >
          <span v-if="newsData.updateTime !== newsData.createTime" class="time">
            更新时间：{{ formatDateTime(newsData.updateTime) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 封面图片 -->
    <div v-if="newsData.coverImage" class="cover-section">
      <el-image
        :src="newsData.coverImage"
        fit="cover"
        class="cover-image"
        :preview-src-list="[newsData.coverImage]"
      >
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
            <span>图片加载失败</span>
          </div>
        </template>
      </el-image>
    </div>

    <!-- 概要 -->
    <div class="summary-section">
      <h3 class="section-title">内容概要</h3>
      <div class="summary-content">
        {{ newsData.summary }}
      </div>
    </div>

    <!-- 正文内容 -->
    <div class="content-section">
      <h3 class="section-title">详细内容</h3>
      <div class="content-body">
        <div
          class="content-text"
          v-html="newsData.content.replace(/\n/g, '<br>')"
        />
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="detail-footer">
      <el-divider />
      <div class="footer-info">
        <span>文章ID：{{ newsData.id }}</span>
        <span>字数统计：约{{ newsData.content.length }}字</span>
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

  .cover-section {
    margin-bottom: 24px;
    text-align: center;

    .cover-image {
      max-width: 100%;
      max-height: 400px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    }

    .image-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #909399;
      background: #f5f7fa;
      border-radius: 8px;

      .el-icon {
        margin-bottom: 8px;
        font-size: 48px;
      }
    }
  }

  .summary-section,
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

  .summary-content {
    padding: 16px;
    font-size: 15px;
    line-height: 1.6;
    color: #606266;
    background: #f8f9fa;
    border-left: 4px solid #409eff;
    border-radius: 6px;
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
