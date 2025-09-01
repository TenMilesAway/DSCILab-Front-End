<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./rule";

interface FormInlineData {
  id?: number;
  title: string; // 论文标题
  author: string; // 作者
  coAuthors?: string; // 合作作者
  journal: string; // 期刊名称
  volume?: string; // 卷号
  issue?: string; // 期号
  pages?: string; // 页码
  publishYear: number; // 发表年份
  doi?: string; // DOI
  abstract?: string; // 摘要
  keywords?: string; // 关键词
  status: number; // 状态
  impactFactor?: number; // 影响因子
  citationCount?: number; // 引用次数
  pdfUrl?: string; // PDF链接
}

interface FormProps {
  formInline: FormInlineData;
}

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: 0,
    title: "",
    author: "",
    coAuthors: "",
    journal: "",
    volume: "",
    issue: "",
    pages: "",
    publishYear: new Date().getFullYear(),
    doi: "",
    abstract: "",
    keywords: "",
    status: 2,
    impactFactor: undefined,
    citationCount: 0,
    pdfUrl: ""
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
      <!-- 基本信息 -->
      <re-col :value="24">
        <el-form-item label="论文标题" prop="title">
          <el-input
            v-model="newFormInline.title"
            clearable
            placeholder="请输入论文标题"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="第一作者" prop="author">
          <el-input
            v-model="newFormInline.author"
            clearable
            placeholder="请输入第一作者"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="合作作者" prop="coAuthors">
          <el-input
            v-model="newFormInline.coAuthors"
            clearable
            placeholder="请输入合作作者，多个作者用逗号分隔"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="期刊名称" prop="journal">
          <el-input
            v-model="newFormInline.journal"
            clearable
            placeholder="请输入期刊名称"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="发表年份" prop="publishYear">
          <el-input-number
            v-model="newFormInline.publishYear"
            :min="1900"
            :max="2100"
            placeholder="请输入发表年份"
            class="w-full"
          />
        </el-form-item>
      </re-col>

      <re-col :value="8">
        <el-form-item label="卷号" prop="volume">
          <el-input
            v-model="newFormInline.volume"
            clearable
            placeholder="请输入卷号"
          />
        </el-form-item>
      </re-col>

      <re-col :value="8">
        <el-form-item label="期号" prop="issue">
          <el-input
            v-model="newFormInline.issue"
            clearable
            placeholder="请输入期号"
          />
        </el-form-item>
      </re-col>

      <re-col :value="8">
        <el-form-item label="页码" prop="pages">
          <el-input
            v-model="newFormInline.pages"
            clearable
            placeholder="如：123-135"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="DOI" prop="doi">
          <el-input
            v-model="newFormInline.doi"
            clearable
            placeholder="请输入DOI"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="状态" prop="status">
          <el-select
            class="w-full"
            v-model="newFormInline.status"
            placeholder="请选择论文状态"
          >
            <el-option label="已发表" :value="1" />
            <el-option label="待发表" :value="2" />
            <el-option label="审稿中" :value="3" />
            <el-option label="已拒绝" :value="4" />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="影响因子" prop="impactFactor">
          <el-input-number
            v-model="newFormInline.impactFactor"
            :min="0"
            :precision="3"
            placeholder="请输入影响因子"
            class="w-full"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="引用次数" prop="citationCount">
          <el-input-number
            v-model="newFormInline.citationCount"
            :min="0"
            placeholder="请输入引用次数"
            class="w-full"
          />
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item label="PDF链接" prop="pdfUrl">
          <el-input
            v-model="newFormInline.pdfUrl"
            clearable
            placeholder="请输入PDF文件链接"
          />
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item label="关键词" prop="keywords">
          <el-input
            v-model="newFormInline.keywords"
            clearable
            placeholder="请输入关键词，多个关键词用逗号分隔"
          />
        </el-form-item>
      </re-col>

      <re-col :value="24">
        <el-form-item label="摘要" prop="abstract">
          <el-input
            v-model="newFormInline.abstract"
            clearable
            placeholder="请输入论文摘要"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>

<style scoped lang="scss">
:deep(.el-input-number) {
  width: 100%;
}
</style>
