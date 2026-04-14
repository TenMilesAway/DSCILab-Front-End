import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 活动表单校验 */
const formRules = reactive(<FormRules>{
  title: [
    {
      required: true,
      message: "活动标题为必填项",
      trigger: "blur"
    },
    {
      min: 1,
      max: 500,
      message: "标题长度应在1-500个字符之间",
      trigger: "blur"
    }
  ],
  summary: [
    {
      max: 1000,
      message: "摘要最多1000个字符",
      trigger: "blur"
    }
  ],
  tag: [
    {
      max: 100,
      message: "标签最多100个字符",
      trigger: "blur"
    }
  ],
  content: [
    {
      max: 50000,
      message: "活动内容最多50000个字符",
      trigger: "blur"
    }
  ]
});

export { formRules };
