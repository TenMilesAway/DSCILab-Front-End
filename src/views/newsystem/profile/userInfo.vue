<script setup lang="ts">
import { ref, reactive, watch, nextTick, computed } from "vue";
import {
  updateUserProfileApi,
  UpdateProfileRequest,
  UserProfile
} from "@/api/newsystem/user";
import { message } from "@/utils/message";
import type { FormRules } from "element-plus";
import { FormInstance } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";

defineOptions({
  name: "NewSystemUserProfile"
});

const userRef = ref<FormInstance>();
const inputRef = ref();

// 研究方向标签相关
const researchAreaTags = ref<string[]>([]);
const inputVisible = ref(false);
const inputValue = ref('');

const props = defineProps<{
  user: UserProfile | any;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

// 获取当前用户信息
const currentUserInfo = useUserStoreHook()?.currentUserInfo;

// 判断当前用户是否为管理员且正在修改自己的信息
const isAdminEditingSelf = computed(() => {
  return currentUserInfo?.userInfo?.identity === 1 && currentUserInfo?.userInfo?.id === props.user.id;
});

const userModel = reactive<UpdateProfileRequest>({
  realName: props.user.realName || props.user.real_name || "",
  englishName: props.user.englishName || "",
  studentNumber: props.user.studentNumber || "",
  gender: props.user.gender || undefined,
  academicStatus: props.user.academicStatus || undefined,
  researchArea: props.user.researchArea || props.user.research_area || "",
  phone: props.user.phone || "",
  email: props.user.email || "",
  enrollmentYear: props.user.enrollmentYear || undefined,
  graduationYear:
    props.user.graduationYear || props.user.graduation_year || undefined,
  graduationDest: props.user.graduationDest || props.user.graduation_dest || "",
  resume: props.user.resume || "",
  homepageUrl: props.user.homepageUrl || "",
  orcid: props.user.orcid || ""
});

// 监听props.user变化，实现数据回显
watch(
  () => props.user,
  newUser => {
    if (newUser && Object.keys(newUser).length > 0) {
      userModel.realName = newUser.realName || newUser.real_name || "";
      userModel.englishName = newUser.englishName || "";
      userModel.studentNumber = newUser.studentNumber || "";
      userModel.gender = newUser.gender || undefined;
      userModel.academicStatus = newUser.academicStatus || undefined;
      userModel.researchArea =
        newUser.researchArea || newUser.research_area || "";
      // 初始化研究方向标签
      const researchArea = newUser.researchArea || newUser.research_area || "";
      researchAreaTags.value = researchArea ? researchArea.split('，').filter(tag => tag.trim()) : [];
      userModel.phone = newUser.phone || "";
      userModel.email = newUser.email || "";
      userModel.enrollmentYear = newUser.enrollmentYear || undefined;
      userModel.graduationYear =
        newUser.graduationYear || newUser.graduation_year || undefined;
      userModel.graduationDest =
        newUser.graduationDest || newUser.graduation_dest || "";
      userModel.resume = newUser.resume || "";
      userModel.homepageUrl = newUser.homepageUrl || "";
      userModel.orcid = newUser.orcid || "";
    }
  },
  { immediate: true, deep: true }
);

console.log(userModel);
console.log(props.user);

const rules = ref<FormRules>({
  realName: [{ required: true, message: "姓名不能为空", trigger: "blur" }],
  englishName: [
    {
      pattern: /^[a-zA-Z\s]+$/,
      message: "英文名只能包含英文字母和空格",
      trigger: "blur"
    }
  ],
  studentNumber: [
    {
      pattern: /^[a-zA-Z0-9]+$/,
      message: "学号/工号只能包含字母和数字",
      trigger: "blur"
    }
  ],
  email: [
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"]
    }
  ],
  phone: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: "请输入正确的手机号码",
      trigger: "blur"
    }
  ],
  enrollmentYear: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value && (value < 1900 || value > new Date().getFullYear() + 10)) {
          callback(new Error('请输入合理的年份'));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  orcid: [
    {
      pattern: /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/,
      message: "请输入正确的ORCID格式（如：0000-0000-0000-0000）",
      trigger: "blur"
    }
  ],
  homepageUrl: [
    {
      type: "url",
      message: "请输入正确的网址格式",
      trigger: ["blur", "change"]
    }
  ]
});

// 研究方向标签操作方法
const removeResearchAreaTag = (index: number) => {
  researchAreaTags.value.splice(index, 1);
  updateResearchAreaString();
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const handleInputConfirm = () => {
  if (inputValue.value && inputValue.value.trim()) {
    const trimmedValue = inputValue.value.trim();
    if (!researchAreaTags.value.includes(trimmedValue)) {
      researchAreaTags.value.push(trimmedValue);
      updateResearchAreaString();
    }
  }
  inputVisible.value = false;
  inputValue.value = '';
};

const updateResearchAreaString = () => {
  userModel.researchArea = researchAreaTags.value.join('，');
};

/** 提交按钮 */
function submit() {
  // 检查管理员是否在修改自己的信息
  if (isAdminEditingSelf.value) {
    message("管理员不能修改自己的信息", {
      type: "warning"
    });
    return;
  }
  
  console.log(userRef.value);
  // 确保提交前更新研究方向字符串
  updateResearchAreaString();
  userRef.value.validate(valid => {
    if (valid) {
      // 处理空值，将空字符串转换为null，但保留数字0
      const submitData = { ...userModel };
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === undefined) {
          submitData[key] = null;
        }
      });
      // 特殊处理academicStatus，确保0值不被转换为null
      if (userModel.academicStatus === 0) {
        submitData.academicStatus = 0;
      }
      
      console.log("发送的数据:", submitData);
      updateUserProfileApi(submitData)
        .then(response => {
          console.log("API响应:", response);
          message("修改成功", {
            type: "success"
          });
          // 通知父组件刷新用户数据
          emit('refresh');
        })
        .catch(error => {
          console.error("API调用失败:", error);
          message(error.message || "修改失败，请稍后重试", {
            type: "error"
          });
        });
    }
  });
}
</script>

<template>
  <el-form ref="userRef" :model="userModel" :rules="rules" label-width="100px">
    <el-form-item label="姓名" prop="realName">
      <el-input v-model="userModel.realName" maxlength="30" />
    </el-form-item>
    <el-form-item label="英文名">
      <el-input v-model="userModel.englishName" maxlength="50" placeholder="请输入英文名" />
    </el-form-item>
    <el-form-item :label="props.user.identity === 2 ? '工号' : '学号'">
      <el-input v-model="userModel.studentNumber" maxlength="20" :placeholder="props.user.identity === 2 ? '请输入工号' : '请输入学号'" />
    </el-form-item>
    <el-form-item label="性别">
      <el-select v-model="userModel.gender" placeholder="请选择性别" clearable>
        <el-option label="男" :value="1" />
        <el-option label="女" :value="2" />
      </el-select>
    </el-form-item>
    <el-form-item label="学术状态">
      <el-select
        v-model="userModel.academicStatus"
        placeholder="请选择学术状态"
        clearable
      >
        <!-- 管理员显示所有选项 -->
        <template v-if="props.user.identity === 1">
          <el-option label="教授" :value="1" />
          <el-option label="副教授" :value="2" />
          <el-option label="讲师" :value="3" />
          <el-option label="博士研究生" :value="4" />
          <el-option label="硕士研究生" :value="5" />
          <el-option label="本科生" :value="6" />
        </template>
        <!-- 学生只能选择硕士博士本科 -->
        <template v-else-if="props.user.identity === 3">
          <el-option label="博士研究生" :value="4" />
          <el-option label="硕士研究生" :value="5" />
          <el-option label="本科生" :value="6" />
        </template>
        <!-- 教师只能选择教授副教授讲师 -->
        <template v-else-if="props.user.identity === 2">
          <el-option label="教授" :value="1" />
          <el-option label="副教授" :value="2" />
          <el-option label="讲师" :value="3" />
        </template>
      </el-select>
    </el-form-item>
    <el-form-item label="研究方向">
      <div class="research-area-tags">
        <el-tag
          v-for="(tag, index) in researchAreaTags"
          :key="index"
          closable
          @close="removeResearchAreaTag(index)"
          style="margin-right: 8px; margin-bottom: 8px;"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="inputRef"
          v-model="inputValue"
          size="small"
          style="width: 120px;"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button
          v-else
          size="small"
          @click="showInput"
        >
          + 添加研究方向
        </el-button>
      </div>
    </el-form-item>
    <el-form-item label="手机号码" prop="phone">
      <el-input
        v-model="userModel.phone"
        maxlength="11"
        placeholder="请输入手机号码"
      />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="userModel.email"
        maxlength="50"
        placeholder="请输入邮箱地址"
      />
    </el-form-item>
    <el-form-item label="个人主页" prop="homepageUrl">
      <el-input
        v-model="userModel.homepageUrl"
        maxlength="200"
        placeholder="请输入个人主页URL"
      />
    </el-form-item>
    <el-form-item label="ORCID">
      <el-input
        v-model="userModel.orcid"
        maxlength="50"
        placeholder="请输入ORCID ID"
      />
    </el-form-item>
    <el-form-item :label="props.user.identity === 2 ? '入职年份' : '入学年份'">
      <el-input
        v-model.number="userModel.enrollmentYear"
        type="number"
        :placeholder="props.user.identity === 2 ? '请输入入职年份' : '请输入入学年份'"
      />
    </el-form-item>
    <el-form-item :label="props.user.identity === 2 ? '离职年份' : '毕业年份'">
      <el-input
        v-model.number="userModel.graduationYear"
        type="number"
        :placeholder="props.user.identity === 2 ? '请输入离职年份' : '请输入毕业年份'"
      />
    </el-form-item>
    <el-form-item :label="props.user.identity === 2 ? '离职去向' : '毕业去向'">
      <el-input
        v-model="userModel.graduationDest"
        maxlength="100"
        :placeholder="props.user.identity === 2 ? '请输入离职去向' : '请输入毕业去向'"
      />
    </el-form-item>
    <el-form-item label="个人简介">
      <el-input
        v-model="userModel.resume"
        type="textarea"
        :rows="4"
        maxlength="500"
        placeholder="请输入个人简介"
      />
    </el-form-item>
    <el-form-item>
      <el-button 
        type="primary" 
        @click="submit"
        :disabled="isAdminEditingSelf"
      >
        保存
      </el-button>
      <el-text v-if="isAdminEditingSelf" type="warning" style="margin-left: 10px;">
        管理员不能修改自己的信息
      </el-text>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.research-area-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.research-area-tags .el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.research-area-tags .el-input {
  margin-right: 8px;
  margin-bottom: 8px;
}

.research-area-tags .el-button {
  margin-bottom: 8px;
}

:deep(.el-form-item__label) {
  font-weight: bold;
}
</style>
