import { http } from "@/utils/http";
import { RouteRecordRaw } from "vue-router";

export type CaptchaDTO = {
  /**  验证码的base64图片 */
  captchaCodeImg: string;
  /** 验证码对应的缓存key */
  captchaCodeKey: string;
};

export type ConfigDTO = {
  /** 验证码开关 */
  isCaptchaOn: boolean;
  /** 系统字典配置（下拉选项之类的） */
  dictionary: Map<String, Array<DictionaryData>>;
};

export type LoginByPasswordDTO = {
  /** 用户名 */
  username: string;
  /**  密码 */
  password: string;
  /** 验证码 */
  captchaCode: string;
  /** 验证码对应的缓存key */
  captchaCodeKey: string;
};

/**
 * 统一登录接口返回的Token信息
 */
export type TokenDTO = {
  /** JWT token */
  token: string;
  /** 当前登录的用户信息 */
  currentUser: CurrentLoginUserDTO;
};

/**
 * 统一登录返回的用户信息（lab-only 模式）
 */
export interface CurrentLoginUserDTO {
  id: number;
  username: string;
  realName: string;
  gender: number; // 0未知 1男 2女
  genderDesc: string;
  identity: number; // 1管理员 2教师 3学生
  email: string;
  phone: string;
  photo: string;
  isActive: boolean;
  createTime: string;
  updateTime: string;
  roleKey: string; // 根据identity映射的角色：lab:admin, lab:teacher, lab:student
}

/**
 * 当前User详细信息（保持兼容性）
 * @deprecated 使用 CurrentLoginUserDTO 替代
 */
export interface CurrentUserInfoDTO {
  student_number?: string;
  real_name?: string;
  gender?: string; // ENUM: 'male', 'female', 'other'
  academic_status?: string; // ENUM
  phone?: string;
  email?: string;
  enrollment_year?: number;
  graduation_year?: number;
  photo?: string;
  graduation_dest?: string;
  research_area?: string;
}

export type DictionaryData = {
  label: string;
  value: number;
  cssTag: string;
};

/** 获取系统配置接口 */
export const getConfig = () => {
  return http.request<ResponseData<ConfigDTO>>("get", "/getConfig");
};

/** 验证码接口 */
export const getCaptchaCode = () => {
  return http.request<ResponseData<CaptchaDTO>>("get", "/captchaImage");
};

/** 登录接口 */
export const loginByPassword = (data: LoginByPasswordDTO) => {
  return http.request<ResponseData<TokenDTO>>("post", "/login", { data });
};

/** 获取当前登录用户接口 */
export const getLoginUserInfo = () => {
  return http.request<ResponseData<TokenDTO>>("get", "/getLoginUserInfo");
};

export interface RouteMeta {
  id: string;
  title: string;
  icon?: string;
  showLink?: boolean;
  showParent?: boolean;
  auths?: string[];
  rank?: number;
  frameSrc?: string;
  isFrameSrcInternal?: boolean;
}

export type RouteItem = RouteRecordRaw & {
  name?: string;
  path: string;
  meta: RouteMeta;
  children?: RouteItem[];
};

type AsyncRoutesResponse = {
  code: number;
  msg: string;
  data: RouteItem[];
};

/**
 * 为后端返回的路由添加唯一id，后面我们在构建菜单树的层级结构时需要用到
 * 这里我们假设 name + path 是唯一的，若日后有 name + path 不唯一的情况，
 * 则需要修改此处的逻辑
 */
const addUniqueId = (routes: RouteItem[]): RouteItem[] => {
  return routes.map(route => {
    const id = `${route.name || ""}${route.path}`;

    if (route.children && route.children.length > 0) {
      route.children = addUniqueId(route.children);
    }

    return {
      ...route,
      meta: {
        ...route.meta,
        id
      }
    };
  });
};

function withId(result: AsyncRoutesResponse) {
  if (result.data) {
    result.data = addUniqueId(result.data);
  }

  return result;
}

/**
 * 获取动态菜单
 * TODO:对于开发环境下此处可以对路由数据做一些校验，比如说 name 是否重复，name+path 是否重复等等
 */
export const getAsyncRoutes = async () => {
  const result = await http.request<AsyncRoutesResponse>("get", "/getRouters");
  return withId(result);
};
