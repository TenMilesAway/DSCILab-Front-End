import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { isPhone, isEmail } from "@pureadmin/utils";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  username: [{ required: true, message: "用户名为必填项", trigger: "blur" }],
  realName: [{ required: true, message: "姓名为必填项", trigger: "blur" }],
  email: [
    {
      validator: (rule, value, callback) => {
        if (!value || value.trim() === "") {
          callback(); // 邮箱不是必填项，为空时不检查
        } else if (!isEmail(value)) {
          callback(new Error("请输入正确的邮箱格式"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  phone: [
    {
      validator: (rule, value, callback) => {
        if (!value || value.trim() === "") {
          callback(); // 手机号码不是必填项，为空时不检查
        } else if (!isPhone(value)) {
          callback(new Error("请输入正确的手机号码格式"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  identity: [{ required: true, message: "身份为必填项", trigger: "change" }],
  password: [
    { required: true, message: "密码为必填项", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("密码不能为空"));
        } else if (value.length < 6) {
          callback(new Error("密码长度不能少于6位"));
        } else if (value.length > 20) {
          callback(new Error("密码长度不能超过20位"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});
