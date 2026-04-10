import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 活动表单校验（仅标题必填） */
const formRules = reactive(<FormRules>{
  title: [
    {
      required: true,
      message: "活动标题为必填项",
      trigger: "blur"
    },
    {
      min: 1,
      max: 100,
      message: "标题长度应在1-100个字符之间",
      trigger: "blur"
    }
  ]
});

export { formRules };
