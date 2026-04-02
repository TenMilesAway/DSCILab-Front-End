<script setup lang="ts">
import { computed, ref } from "vue";
import {
  ElMessage,
  type UploadFile,
  type UploadFiles,
  type UploadInstance,
  type UploadRawFile
} from "element-plus";

const props = defineProps<{
  userName?: string;
}>();

const uploadRef = ref<UploadInstance>();
const selectedFile = ref<File | null>(null);

const uploadTip = computed(() =>
  props.userName ? `将为用户 ${props.userName} 上传头像` : "请选择要上传的头像文件"
);

const handleExceed = () => {
  ElMessage.warning("只能选择 1 张头像图片");
};

const handleChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  const rawFile = uploadFile.raw as UploadRawFile | undefined;
  if (!rawFile) {
    selectedFile.value = null;
    return;
  }

  const isImage = rawFile.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("请上传图片格式文件");
    uploadRef.value?.clearFiles();
    selectedFile.value = null;
    return;
  }

  if (uploadFiles.length > 1) {
    uploadFiles.splice(0, uploadFiles.length - 1);
  }

  selectedFile.value = rawFile;
};

const handleRemove = () => {
  selectedFile.value = null;
};

function submit() {
  if (!selectedFile.value) {
    ElMessage.warning("请先选择头像文件");
    return null;
  }

  const formData = new FormData();
  formData.append("photofile", selectedFile.value);
  return formData;
}

function clearFiles() {
  uploadRef.value?.clearFiles();
  selectedFile.value = null;
}

defineExpose({
  submit,
  clearFiles
});
</script>

<template>
  <div class="avatar-upload-form">
    <el-alert :title="uploadTip" type="info" :closable="false" show-icon />

    <el-upload
      ref="uploadRef"
      class="mt-4 w-full"
      drag
      action="#"
      :auto-upload="false"
      :limit="1"
      accept="image/*"
      :show-file-list="true"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">将图片拖到此处，或<em>点击选择</em></div>
      <template #tip>
        <div class="el-upload__tip">支持常见图片格式，单次仅可上传 1 张头像。</div>
      </template>
    </el-upload>
  </div>
</template>
