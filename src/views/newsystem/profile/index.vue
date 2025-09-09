<script setup lang="ts">
import resetPwd from "./resetPwd.vue";
import userInfo from "./userInfo.vue";
import userAvatar from "./userAvatar.vue";
import { reactive, ref, onMounted } from "vue";
import { useUserStoreHook } from "@/store/modules/user";
import { getUserProfileApi, UserProfile } from "@/api/newsystem/user";
import { message } from "@/utils/message";

defineOptions({
  name: "NewSystemProfile"
});

const activeTab = ref("userinfo");
const state = reactive({
  user: {} as UserProfile,
  roleName: {},
  postName: {},
  loading: false
});

/** 用户名 */
const currentUserInfo = useUserStoreHook()?.currentUserInfo;

// 获取用户详细信息
function getUser() {
  state.loading = true;
  getUserProfileApi()
    .then(response => {
      if (response.code === 0) {
        state.user = response.data;
        console.log("获取用户信息成功:", response.data);
      } else {
        message(response.msg || "获取用户信息失败", { type: "error" });
        // 如果接口失败，使用store中的数据作为备用
        state.user = currentUserInfo as any;
      }
    })
    .catch(error => {
      console.error("获取用户信息失败:", error);
      message("获取用户信息失败", { type: "error" });
      // 如果接口失败，使用store中的数据作为备用
      state.user = currentUserInfo as any;
    })
    .finally(() => {
      state.loading = false;
    });
}

onMounted(() => {
  getUser();
});
</script>
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <template v-slot:header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <userAvatar :user="state.user" @refresh="getUser" />
            </div>

            <el-row v-loading="state.loading">
              <el-descriptions :column="1">
                <el-descriptions-item label="姓名">{{
                  state.user.realName
                }}</el-descriptions-item>

                <!-- 学号：仅当身份是student时显示 -->
                <el-descriptions-item
                  v-if="(state.user.identity || currentUserInfo.identity) === 3"
                  label="学号"
                  >{{ state.user.studentNumber }}</el-descriptions-item
                >

                <el-descriptions-item label="身份">{{
                  (state.user.identity || currentUserInfo.identity) === 3
                    ? "学生"
                    : (state.user.identity || currentUserInfo.identity) === 2
                    ? "教师"
                    : (state.user.identity || currentUserInfo.identity) === 1
                    ? "管理员"
                    : state.user.identity
                }}</el-descriptions-item>

                <!-- 职称/攻读学位：student显示攻读学位，teacher显示职称，admin不显示 -->
                <el-descriptions-item
                  v-if="
                    (state.user.identity || currentUserInfo.identity) === 3 ||
                    (state.user.identity || currentUserInfo.identity) === 2
                  "
                  :label="
                    (state.user.identity || currentUserInfo.identity) === 3
                      ? '攻读学位'
                      : '职称'
                  "
                  >{{ state.user.academicStatusDesc }}</el-descriptions-item
                >

                <el-descriptions-item label="研究方向">{{
                  state.user.researchArea
                }}</el-descriptions-item>

                <el-descriptions-item label="手机号码">{{
                  state.user.phone
                }}</el-descriptions-item>

                <el-descriptions-item label="邮箱">{{
                  state.user.email
                }}</el-descriptions-item>

                <el-descriptions-item label="入学年份">{{
                  state.user.enrollmentYear
                }}</el-descriptions-item>

                <!-- 毕业年份：空就不显示 -->
                <el-descriptions-item
                  v-if="state.user.graduationYear"
                  label="毕业年份"
                  >{{ state.user.graduationYear }}</el-descriptions-item
                >

                <!-- 毕业去向：空就不显示 -->
                <el-descriptions-item
                  v-if="state.user.graduationDest"
                  label="毕业去向"
                  >{{ state.user.graduationDest }}</el-descriptions-item
                >
              </el-descriptions>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <template v-slot:header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="state.user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd :user="state.user" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.profile-card {
  display: flex;
  flex-direction: column;
}

.profile-card .el-card__body {
  flex: 1;
}

.el-row {
  display: flex;
  align-items: stretch;
}

.el-col {
  display: flex;
}

.el-col .el-card {
  width: 100%;
}
</style>
