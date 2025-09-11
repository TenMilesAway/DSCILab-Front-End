<script setup lang="ts">
import { ref, computed } from "vue";
import { useHook } from "./hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useUserStoreHook } from "@/store/modules/user";

import Password from "@iconify-icons/ri/lock-password-line";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";

import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";

defineOptions({
  name: "NewSystemUser"
});

const formRef = ref();
const {
  searchFormParams,
  pageLoading,
  columns,
  dataList,
  pagination,

  onSearch,
  resetForm,

  openResetPasswordDialog,
  handleDelete,
  openDialog,
  getList
} = useHook();

// 获取当前用户信息
const currentUserInfo = useUserStoreHook()?.currentUserInfo;

// 判断当前用户是否为管理员
const isCurrentUserAdmin = computed(() => {
  return currentUserInfo?.identity === 1;
});

// 判断是否为当前用户
const isCurrentUser = (row: any) => {
  return currentUserInfo?.id === row.id;
};

// 判断是否为管理员用户（禁止修改任何管理员信息）
const isAdminUser = (row: any) => {
  return row.identity === 1;
};
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-full pl-8 pt-[12px]"
    >
      <el-form-item label="用户名：" prop="username">
        <el-input
          v-model="searchFormParams.username"
          placeholder="请输入用户名"
          clearable
          class="!w-[160px]"
        />
      </el-form-item>
      <el-form-item label="姓名：" prop="realName">
        <el-input
          v-model="searchFormParams.realName"
          placeholder="请输入姓名"
          clearable
          class="!w-[160px]"
        />
      </el-form-item>
      <el-form-item label="身份：" prop="identity">
        <el-select
          v-model="searchFormParams.identity"
          placeholder="请选择身份"
          clearable
          class="!w-[160px]"
        >
          <el-option label="管理员" :value="1" />
          <el-option label="教师" :value="2" />
          <el-option label="学生" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select
          v-model="searchFormParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-[160px]"
        >
          <el-option label="在读/在职" :value="1" />
          <el-option label="毕业/离职" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="pageLoading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar
      title="用户管理"
      :columns="columns"
      :showDensity="false"
      :showColumnSetting="false"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('新增')"
        >
          新增用户
        </el-button>
      </template>
      <template v-slot="{ dynamicColumns }">
        <pure-table
          border
          adaptive
          align-whole="center"
          table-layout="auto"
          :loading="pageLoading"
          size="default"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="false"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="getList"
          @page-current-change="getList"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              size="default"
              @click="openDialog('编辑', row)"
              :icon="useRenderIcon(EditPen)"
              :disabled="isAdminUser(row)"
            >
              修改
            </el-button>
            <el-popconfirm 
              title="是否确认删除?" 
              @confirm="handleDelete(row)"
              :disabled="isAdminUser(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="danger"
                  size="default"
                  :icon="useRenderIcon(Delete)"
                  :disabled="isAdminUser(row)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
            <el-button
              class="reset-margin"
              link
              type="primary"
              size="default"
              :icon="useRenderIcon(Password)"
              @click="openResetPasswordDialog(row)"
              :disabled="isAdminUser(row)"
            >
              重置密码
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
