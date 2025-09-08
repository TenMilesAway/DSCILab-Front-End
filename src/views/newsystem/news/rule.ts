import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 新闻表单校验 */
const formRules = reactive(<FormRules>{
  title: [
    {
      required: true,
      message: "新闻标题为必填项",
      trigger: "blur"
    },
    {
      min: 5,
      max: 100,
      message: "标题长度应在5-100个字符之间",
      trigger: "blur"
    }
  ],
  summary: [
    {
      required: true,
      message: "新闻概要为必填项",
      trigger: "blur"
    },
    {
      min: 10,
      max: 200,
      message: "概要长度应在10-200个字符之间",
      trigger: "blur"
    }
  ],
  content: [
    {
      required: true,
      message: "新闻内容为必填项",
      trigger: "blur"
    },
    {
      min: 20,
      message: "内容长度不能少于20个字符",
      trigger: "blur"
    }
  ],
  type: [
    {
      required: true,
      message: "请选择新闻类型",
      trigger: "change"
    }
  ],
  status: [
    {
      required: true,
      message: "请选择发布状态",
      trigger: "change"
    }
  ],
  author: [
    {
      required: true,
      message: "作者为必填项",
      trigger: "blur"
    },
    {
      min: 2,
      max: 20,
      message: "作者姓名长度应在2-20个字符之间",
      trigger: "blur"
    }
  ]
});

export { formRules };
