import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 项目表单校验 */
const formRules = reactive(<FormRules>{
  title: [
    {
      required: true,
      message: "项目名称为必填项",
      trigger: "blur"
    },
    {
      min: 5,
      max: 500,
      message: "项目名称长度应在5到500个字符之间",
      trigger: "blur"
    }
  ],
  // 作者数组验证将在表单组件中单独处理
  // 每个作者的name字段在form.vue中为非必填
  "authors.*.email": [
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "邮箱格式不正确",
      trigger: "blur"
    }
  ],
  achievementType: [
    {
      required: true,
      message: "项目类型为必填项",
      trigger: "change"
    }
  ],
  journal: [
    {
      min: 2,
      max: 300,
      message: "期刊名称长度应在2到300个字符之间",
      trigger: "blur"
    }
  ],
  publishDate: [
    {
      type: "string",
      message: "请选择有效的日期",
      trigger: "change"
    }
  ],
  projectEndDate: [
    {
      type: "string",
      message: "请选择有效的项目结束日期",
      trigger: "change"
    }
  ],

  doi: [
    {
      max: 100,
      message: "编号长度不能超过100个字符",
      trigger: "blur"
    }
  ],
  projectUrl: [
    {
      max: 500,
      message: "项目链接长度不能超过500个字符",
      trigger: "blur"
    },
    {
      pattern: /^(https?:\/\/.+)?$/,
      message: "项目链接格式不正确，应以http://或https://开头",
      trigger: "blur"
    }
  ]
});

export { formRules };