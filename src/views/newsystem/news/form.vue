<script setup lang="ts">
import { ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./rule";

interface FormProps {
  formInline: {
    id: number;
    title: string;
    summary: string;
    content: string;
    type: number;
    status: number;
    coverImage: string;
    author: string;
  };
}

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: 0,
    title: "",
    summary: "",
    content: "",
    type: 1,
    status: 2,
    coverImage: "",
    author: ""
  })
});

const formRuleRef = ref();
const newFormInline = ref(props.formInline);

// 监听props变化
watch(
  () => props.formInline,
  newVal => {
    newFormInline.value = { ...newVal };
  },
  { deep: true, immediate: true }
);

// 图片上传
const handleImageUpload = (file: File) => {
  // 这里应该调用实际的图片上传API
  console.log("上传图片:", file);
  return Promise.resolve("https://via.placeholder.com/400x200");
};

function getFormRuleRef() {
  return formRuleRef.value;
}

defineExpose({ getFormRuleRef });
</script>

<template>
  <el-form
    ref="formRuleRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="100px"
  >
    <el-row :gutter="30">
      <!-- 基本信息 -->
      <re-col :value="24">
        <el-form-item label="新闻标题" prop="title">
          <el-input
            v-model="newFormInline.title"
            clearable
            placeholder="请输入新闻标题"
            type="textarea"
            :rows="2"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="新闻类型" prop="type">
          <el-select
            class="w-full"
            v-model="newFormInline.type"
            placeholder="请选择新闻类型"
          >
            <el-option label="新闻" :value="1" />
            <el-option label="活动" :value="2" />
            <el-option label="通知" :value="3" />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="发布状态" prop="status">
          <el-select
            class="w-full"
            v-model="newFormInline.status"
            placeholder="请选择发布状态"
          >
            <el-option label="草稿" :value="2" />
            <el-option label="已发布" :value="1" />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item label="新闻概要" prop="summary">
          <el-input
            v-model="newFormInline.summary"
            clearable
            placeholder="请输入新闻概要"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item label="封面图片" prop="coverImage">
          <div class="cover-upload">
            <el-input
              v-model="newFormInline.coverImage"
              placeholder="请输入图片URL或上传图片"
              clearable
            >
              <template #append>
                <el-upload
                  :show-file-list="false"
                  :before-upload="handleImageUpload"
                  accept="image/*"
                >
                  <el-button type="primary">上传图片</el-button>
                </el-upload>
              </template>
            </el-input>
            <div v-if="newFormInline.coverImage" class="image-preview">
              <el-image
                :src="newFormInline.coverImage"
                fit="cover"
                style="
                  width: 200px;
                  height: 120px;
                  margin-top: 8px;
                  border-radius: 4px;
                "
                :preview-src-list="[newFormInline.coverImage]"
              />
            </div>
          </div>
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="作者" prop="author">
          <el-input
            v-model="newFormInline.author"
            clearable
            placeholder="请输入作者姓名"
          />
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item label="新闻内容" prop="content">
          <el-input
            v-model="newFormInline.content"
            type="textarea"
            :rows="10"
            placeholder="请输入新闻详细内容..."
            maxlength="5000"
            show-word-limit
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>

<style scoped lang="scss">
.cover-upload {
  width: 100%;

  .image-preview {
    margin-top: 8px;
  }
}

:deep(.el-textarea__inner) {
  resize: vertical;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload .el-button) {
  width: 100%;
  border-radius: 0 4px 4px 0;
}
</style>
