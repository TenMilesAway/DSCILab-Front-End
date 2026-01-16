import { http } from "@/utils/http";

export interface DictItem {
  value: number;
  label: string;
}

export const getProjectTypesDictApi = () => {
  return http.request<ResponseData<DictItem[]>>("get", "/lab/dicts/project-types");
};

