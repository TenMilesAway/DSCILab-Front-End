import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 成果表单校验 */
const formRules = reactive(<FormRules>{
  title: [
    {
      required: true,
      message: "成果名称为必填项",
      trigger: "blur"
    },
    {
      min: 5,
      max: 500,
      message: "成果名称长度应在5到500个字符之间",
      trigger: "blur"
    }
  ],
  achievementType: [
    {
      required: true,
      message: "成果类型为必填项",
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
