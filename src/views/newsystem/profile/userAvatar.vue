<script setup lang="ts">
import ReCropper from "@/components/ReCropper";
import { formatBytes } from "@pureadmin/utils";
import { ref, computed, watch } from "vue";
import { uploadUserAvatarApi } from "@/api/newsystem/user";
import { useUserStoreHook } from "@/store/modules/user";
import { message } from "@/utils/message";

defineOptions({
  name: "NewSystemUserAvatar"
});

const props = defineProps<{
  user?: any;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const currentUser = useUserStoreHook().currentUserInfo;

const infos = ref();
const imgBlob = ref();
const refCropper = ref();
const showPopover = ref(false);
const cropperImg = ref<string>("");

// 计算头像URL
const avatarUrl = computed(() => {
  const userPhoto = props.user?.photo || currentUser.photo;
  if (userPhoto) {
    // 如果photo已经是完整URL，直接使用
    if (userPhoto.startsWith("http")) {
      return userPhoto;
    }
    // 否则拼接base API
    return import.meta.env.VITE_APP_BASE_API + userPhoto;
  }
  // 默认头像
  return "/default-avatar.png";
});

// 初始化cropperImg
cropperImg.value = avatarUrl.value;

// 监听avatarUrl变化
watch(avatarUrl, newUrl => {
  cropperImg.value = newUrl;
});

function onCropper({ base64, blob, info }) {
  console.log(blob);
  infos.value = info;
  imgBlob.value = blob;
  cropperImg.value = base64;
}

const open = ref(false);
const visible = ref(false);

/** 上传图片 */
function uploadImg() {
  const formData = new FormData();
  formData.append("photofile", imgBlob.value);
  uploadUserAvatarApi(formData).then(() => {
    open.value = false;
    message("上传图片成功", {
      type: "success"
    });
    visible.value = false;
    // 通知父组件刷新用户数据
    emit("refresh");
  });
}
</script>
<template>
  <div class="user-info-head" @click="open = true">
    <el-avatar :size="120" :src="avatarUrl" />
  </div>
  <el-dialog
    title="修改头像"
    v-model="open"
    width="900px"
    append-to-body
    @opened="visible = true"
    @close="visible = false"
  >
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-medium"> 右键下面左侧裁剪区开启功能菜单 </span>
        </div>
      </template>
      <el-popover
        :visible="showPopover"
        placement="right"
        width="300px"
        :teleported="false"
      >
        <template #reference>
          <ReCropper
            ref="refCropper"
            class="w-[500px]"
            :src="cropperImg"
            circled
            @cropper="onCropper"
            @readied="showPopover = true"
          />
        </template>
        <div class="flex flex-wrap justify-center items-center text-center">
          <el-image
            v-if="cropperImg"
            :src="cropperImg"
            :preview-src-list="Array.of(cropperImg)"
            fit="cover"
          />
          <div v-if="infos" class="mt-1">
            <p>
              图像大小：{{ parseInt(infos.width) }} ×
              {{ parseInt(infos.height) }}像素
            </p>
            <p>
              文件大小：{{ formatBytes(infos.size) }}（{{ infos.size }} 字节）
            </p>
          </div>
        </div>
      </el-popover>
    </el-card>
    <template #footer>
      <div>
        <el-button @click="open = false">取消</el-button>
        <el-button type="primary" @click="uploadImg">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
}

.user-info-head:hover::after {
  position: absolute;
  inset: 0;
  font-size: 24px;
  font-style: normal;
  line-height: 110px;
  color: #eee;
  cursor: pointer;
  content: "+";
  background: rgb(0 0 0 / 50%);
  border-radius: 50%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
