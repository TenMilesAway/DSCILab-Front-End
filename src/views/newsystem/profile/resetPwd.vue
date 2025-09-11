<script setup lang="ts">
import { reactive, ref, toRaw } from "vue";
import {
  updateCurrentUserPasswordApi,
  ResetPasswordRequest
} from "@/api/newsystem/user";
import { FormInstance, FormRules } from "element-plus";
import { message } from "@/utils/message";
import { removeToken } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { resetRouter } from "@/router";
import { useRouter } from "vue-router";
import { routerArrays } from "@/layout/types";

defineOptions({
  name: "NewSystemResetPwd"
});

const user = reactive<ResetPasswordRequest>({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const pwdRef = ref<FormInstance>();

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};
const rules = ref<FormRules>({
  oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
  newPassword: [
    { required: true, message: "新密码不能为空", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9!@#$%^&*()_+=|[\]{};':"\\,.<>?-]{6,20}$/,
      message: "新密码格式应为6-20位数字、字母、符号",
      trigger: "blur"
    }
  ],
  confirmPassword: [
    { required: true, message: "确认密码不能为空", trigger: "blur" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ]
});

const router = useRouter();

/** 退出登录 */
function logout() {
  useUserStoreHook().SET_USERNAME("");
  useUserStoreHook().SET_ROLES([]);
  removeToken();
  useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
  resetRouter();
  router.push("/login");
}

/** 提交按钮 */
function submit() {
  console.log(user);
  pwdRef.value.validate(valid => {
    if (valid) {
      updateCurrentUserPasswordApi(toRaw(user)).then(() => {
        message("修改成功，请重新登录", {
          type: "success"
        });
        // 延迟1秒后强制退出登录
        setTimeout(() => {
          logout();
        }, 1000);
      });
    }
  });
}
</script>

<template>
  <el-form ref="pwdRef" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input
        v-model="user.oldPassword"
        placeholder="请输入旧密码"
        type="password"
        show-password
      />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input
        v-model="user.newPassword"
        placeholder="请输入新密码"
        type="password"
        show-password
      />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input
        v-model="user.confirmPassword"
        placeholder="请确认密码"
        type="password"
        show-password
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
    </el-form-item>
  </el-form>
</template>
