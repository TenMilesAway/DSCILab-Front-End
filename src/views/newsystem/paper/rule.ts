import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 论文表单校验 */
const formRules = reactive(<FormRules>{
  title: [
    {
      required: true,
      message: "论文标题为必填项",
      trigger: "blur"
    },
    {
      min: 5,
      max: 200,
      message: "论文标题长度应在5到200个字符之间",
      trigger: "blur"
    }
  ],
  author: [
    {
      required: true,
      message: "第一作者为必填项",
      trigger: "blur"
    },
    {
      min: 2,
      max: 50,
      message: "作者姓名长度应在2到50个字符之间",
      trigger: "blur"
    }
  ],
  journal: [
    {
      required: true,
      message: "期刊名称为必填项",
      trigger: "blur"
    },
    {
      min: 2,
      max: 100,
      message: "期刊名称长度应在2到100个字符之间",
      trigger: "blur"
    }
  ],
  publishYear: [
    {
      required: true,
      message: "发表年份为必填项",
      trigger: "blur"
    },
    {
      type: "number",
      min: 1900,
      max: 2100,
      message: "发表年份应在1900到2100之间",
      trigger: "blur"
    }
  ],
  status: [
    {
      required: true,
      message: "论文状态为必填项",
      trigger: "change"
    }
  ],
  coAuthors: [
    {
      max: 200,
      message: "合作作者长度不能超过200个字符",
      trigger: "blur"
    }
  ],
  volume: [
    {
      max: 20,
      message: "卷号长度不能超过20个字符",
      trigger: "blur"
    }
  ],
  issue: [
    {
      max: 20,
      message: "期号长度不能超过20个字符",
      trigger: "blur"
    }
  ],
  pages: [
    {
      max: 50,
      message: "页码长度不能超过50个字符",
      trigger: "blur"
    },
    {
      pattern: /^\d+(-\d+)?$/,
      message: "页码格式不正确，应为数字或数字范围（如：123或123-135）",
      trigger: "blur"
    }
  ],
  doi: [
    {
      max: 100,
      message: "DOI长度不能超过100个字符",
      trigger: "blur"
    },
    {
      pattern: /^(10\.\d{4,}\/.+)?$/,
      message: "DOI格式不正确，应以10.开头",
      trigger: "blur"
    }
  ],
  keywords: [
    {
      max: 200,
      message: "关键词长度不能超过200个字符",
      trigger: "blur"
    }
  ],
  abstract: [
    {
      max: 2000,
      message: "摘要长度不能超过2000个字符",
      trigger: "blur"
    }
  ],
  pdfUrl: [
    {
      max: 500,
      message: "PDF链接长度不能超过500个字符",
      trigger: "blur"
    },
    {
      pattern: /^(https?:\/\/.+)?$/,
      message: "PDF链接格式不正确，应以http://或https://开头",
      trigger: "blur"
    }
  ],
  impactFactor: [
    {
      type: "number",
      min: 0,
      max: 100,
      message: "影响因子应在0到100之间",
      trigger: "blur"
    }
  ],
  citationCount: [
    {
      type: "number",
      min: 0,
      message: "引用次数不能为负数",
      trigger: "blur"
    }
  ]
});

export { formRules };
