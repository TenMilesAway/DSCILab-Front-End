<script setup lang="ts">
import { ref, reactive } from "vue";
import {
  updateUserProfileApi,
  UpdateProfileRequest,
  UserProfile
} from "@/api/newsystem/user";
import { message } from "@/utils/message";
import type { FormRules } from "element-plus";
import { FormInstance } from "element-plus";

defineOptions({
  name: "NewSystemUserProfile"
});

const userRef = ref<FormInstance>();

const props = defineProps<{
  user: UserProfile | any;
}>();

const userModel = reactive<UpdateProfileRequest>({
  realName: props.user.realName || props.user.real_name || "",
  englishName: props.user.englishName || "",
  gender: props.user.gender || undefined,
  academicStatus: props.user.academicStatus || undefined,
  researchArea: props.user.researchArea || props.user.research_area || "",
  phone: props.user.phone || "",
  email: props.user.email || "",
  graduationYear:
    props.user.graduationYear || props.user.graduation_year || undefined,
  graduationDest: props.user.graduationDest || props.user.graduation_dest || "",
  resume: props.user.resume || "",
  homepageUrl: props.user.homepageUrl || "",
  orcid: props.user.orcid || ""
});

console.log(userModel);
console.log(props.user);

const rules = ref<FormRules>({
  realName: [{ required: true, message: "姓名不能为空", trigger: "blur" }],
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
  homepageUrl: [
    {
      type: "url",
      message: "请输入正确的网址格式",
      trigger: ["blur", "change"]
    }
  ]
});

/** 提交按钮 */
function submit() {
  console.log(userRef.value);
  userRef.value.validate(valid => {
    if (valid) {
      console.log("发送的数据:", userModel);
      updateUserProfileApi(userModel)
        .then(response => {
          console.log("API响应:", response);
          message("修改成功", {
            type: "success"
          });
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
    <el-form-item label="性别">
      <el-select v-model="userModel.gender" placeholder="请选择性别">
        <el-option label="男" :value="1" />
        <el-option label="女" :value="2" />
      </el-select>
    </el-form-item>
    <el-form-item label="学术状态">
      <el-select
        v-model="userModel.academicStatus"
        placeholder="请选择学术状态"
      >
        <!-- 管理员显示所有选项 -->
        <template v-if="props.user.identity === 1">
          <el-option label="硕士" :value="5" />
          <el-option label="博士" :value="4" />
          <el-option label="教授" :value="1" />
          <el-option label="副教授" :value="2" />
          <el-option label="讲师" :value="3" />
        </template>
        <!-- 学生只能选择硕士博士 -->
        <template v-else-if="props.user.identity === 3">
          <el-option label="硕士" :value="5" />
          <el-option label="博士" :value="4" />
        </template>
        <!-- 教师只能选择教授副教授 -->
        <template v-else-if="props.user.identity === 2">
          <el-option label="教授" :value="1" />
          <el-option label="副教授" :value="2" />
          <el-option label="讲师" :value="3" />
        </template>
      </el-select>
    </el-form-item>
    <el-form-item label="研究方向">
      <el-input
        v-model="userModel.researchArea"
        maxlength="100"
        placeholder="请输入研究方向"
      />
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
    <el-form-item label="毕业年份">
      <el-input
        v-model.number="userModel.graduationYear"
        type="number"
        placeholder="请输入毕业年份"
      />
    </el-form-item>
    <el-form-item label="毕业去向">
      <el-input
        v-model="userModel.graduationDest"
        maxlength="100"
        placeholder="请输入毕业去向"
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
      <el-button type="primary" @click="submit">保存</el-button>
    </el-form-item>
  </el-form>
</template>
