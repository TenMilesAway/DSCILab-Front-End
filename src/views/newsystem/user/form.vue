<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./rule";
interface FormInlineData {
  id?: number;
  studentNumber?: string;
  username: string;
  realName: string;
  englishName?: string;
  gender?: number;
  identity?: number;
  academicStatus?: number;
  phone?: string;
  email: string;
  password?: string;
  status?: number;
  isActive?: boolean;
  researchArea?: string;
  enrollmentYear?: number;
  graduationYear?: number;
  graduationDest?: string;
  photo?: string;
  resume?: string;
  homepageUrl?: string;
  orcid?: string;
}

interface FormProps {
  formInline: FormInlineData;
}

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: 0,
    studentNumber: "",
    username: "",
    realName: "",
    englishName: "",
    gender: 0,
    identity: 3,
    academicStatus: undefined,
    phone: "",
    email: "",
    password: "",
    status: 1,
    isActive: true,
    researchArea: "",
    enrollmentYear: undefined,
    graduationYear: undefined,
    graduationDest: "",
    photo: "",
    resume: "",
    homepageUrl: "",
    orcid: ""
  })
});

const newFormInline = ref(props.formInline);

const formRuleRef = ref();

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
    label-width="82px"
  >
    <el-row :gutter="30">
      <!-- 左列字段 -->
      <re-col :value="12">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="newFormInline.username"
            clearable
            placeholder="请输入用户名"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="姓名" prop="realName">
          <el-input
            v-model="newFormInline.realName"
            clearable
            placeholder="请输入姓名"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="英文名" prop="englishName">
          <el-input
            v-model="newFormInline.englishName"
            clearable
            placeholder="请输入英文名"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="身份" prop="identity">
          <el-select
            class="w-full"
            v-model="newFormInline.identity"
            placeholder="请选择身份"
            clearable
          >
            <el-option label="管理员" :value="1" />
            <el-option label="教师" :value="2" />
            <el-option label="学生" :value="3" />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="性别" prop="gender">
          <el-select
            class="w-full"
            v-model="newFormInline.gender"
            placeholder="请选择性别"
            clearable
          >
            <el-option label="未知" :value="0" />
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="手机号码" prop="phone">
          <el-input
            v-model="newFormInline.phone"
            clearable
            placeholder="请输入手机号码"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="newFormInline.email"
            clearable
            placeholder="请输入邮箱"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <!-- 根据身份显示不同的标签 -->
        <el-form-item
          :label="
            newFormInline.identity === 1
              ? '学号/工号'
              : newFormInline.identity === 2
              ? '工号'
              : '学号'
          "
          prop="studentNumber"
          v-if="
            newFormInline.identity === 1 ||
            newFormInline.identity === 2 ||
            newFormInline.identity === 3
          "
        >
          <el-input
            v-model="newFormInline.studentNumber"
            clearable
            :placeholder="
              newFormInline.identity === 1
                ? '请输入学号/工号'
                : newFormInline.identity === 2
                ? '请输入工号'
                : '请输入学号'
            "
          />
        </el-form-item>
      </re-col>

      <!-- 右列字段 -->
      <re-col :value="12">
        <el-form-item label="学术状态" prop="academicStatus">
          <el-select
            class="w-full"
            v-model="newFormInline.academicStatus"
            placeholder="请选择学术状态"
            clearable
          >
            <!-- 根据身份显示不同的学术状态选项 -->
            <template v-if="newFormInline.identity === 2">
              <!-- 教师：实验室负责人、教授、副教授、讲师 -->
              <el-option label="实验室负责人" :value="0" />
              <el-option label="教授" :value="1" />
              <el-option label="副教授" :value="2" />
              <el-option label="讲师" :value="3" />
            </template>
            <template v-else-if="newFormInline.identity === 3">
              <!-- 学生：博士研究生、硕士研究生、本科生 -->
              <el-option label="博士研究生" :value="4" />
              <el-option label="硕士研究生" :value="5" />
              <el-option label="本科生" :value="6" />
            </template>
            <template v-else>
              <!-- 管理员：显示所有选项 -->
              <el-option label="实验室负责人" :value="0" />
              <el-option label="教授" :value="1" />
              <el-option label="副教授" :value="2" />
              <el-option label="讲师" :value="3" />
              <el-option label="博士研究生" :value="4" />
              <el-option label="硕士研究生" :value="5" />
              <el-option label="本科生" :value="6" />
            </template>
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="研究方向" prop="researchArea">
          <el-input
            v-model="newFormInline.researchArea"
            clearable
            placeholder="请输入研究方向"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item
          :label="
            newFormInline.identity === 1
              ? '入学/入职年份'
              : newFormInline.identity === 2
              ? '入职年份'
              : '入学年份'
          "
          prop="enrollmentYear"
        >
          <el-input
            v-model="newFormInline.enrollmentYear"
            clearable
            :placeholder="
              newFormInline.identity === 1
                ? '请输入入学/入职年份'
                : newFormInline.identity === 2
                ? '请输入入职年份'
                : '请输入入学年份'
            "
            type="number"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item
          :label="
            newFormInline.identity === 1
              ? '毕业/离职年份'
              : newFormInline.identity === 2
              ? '离职年份'
              : '毕业年份'
          "
          prop="graduationYear"
        >
          <el-input
            v-model="newFormInline.graduationYear"
            clearable
            :placeholder="
              newFormInline.identity === 1
                ? '请输入毕业/离职年份'
                : newFormInline.identity === 2
                ? '请输入离职年份'
                : '请输入毕业年份'
            "
            type="number"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item
          :label="
            newFormInline.identity === 1
              ? '毕业/离职去向'
              : newFormInline.identity === 2
              ? '离职去向'
              : '毕业去向'
          "
          prop="graduationDest"
        >
          <el-input
            v-model="newFormInline.graduationDest"
            clearable
            :placeholder="
              newFormInline.identity === 1
                ? '请输入毕业/离职去向'
                : newFormInline.identity === 2
                ? '请输入离职去向'
                : '请输入毕业去向'
            "
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="newFormInline.status">
            <!-- 根据身份显示不同的状态选项 -->
            <template v-if="newFormInline.identity === 3">
              <!-- 学生：在读/毕业 -->
              <el-radio :label="1">在读</el-radio>
              <el-radio :label="2">毕业</el-radio>
            </template>
            <template v-else-if="newFormInline.identity === 2">
              <!-- 教师：在职/离职 -->
              <el-radio :label="1">在职</el-radio>
              <el-radio :label="2">离职</el-radio>
            </template>
            <template v-else>
              <!-- 管理员：在读/在职 和 毕业/离职 -->
              <el-radio :label="1">在读/在职</el-radio>
              <el-radio :label="2">毕业/离职</el-radio>
            </template>
          </el-radio-group>
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="是否启用" prop="isActive">
          <el-switch v-model="newFormInline.isActive" />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="个人主页" prop="homepageUrl">
          <el-input
            v-model="newFormInline.homepageUrl"
            clearable
            placeholder="请输入个人主页URL"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="ORCID" prop="orcid">
          <el-input
            v-model="newFormInline.orcid"
            clearable
            placeholder="请输入ORCID"
          />
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item label="个人简历" prop="resume">
          <el-input
            v-model="newFormInline.resume"
            type="textarea"
            :rows="3"
            placeholder="请输入个人简历"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" v-if="newFormInline.password !== undefined">
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="newFormInline.password"
            type="password"
            show-password
            clearable
            placeholder="请输入密码（6-20位）"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
