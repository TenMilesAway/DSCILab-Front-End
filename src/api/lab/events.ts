import { http } from "@/utils/http";

export interface LabEventAuthorDTO {
  id?: number;
  eventId?: number;
  userId?: number | null;
  name?: string;
  nameEn?: string;
  affiliation?: string;
  authorOrder?: number;
  isCorresponding?: boolean;
  role?: string;
  isVisible?: boolean;
  visible?: boolean;
  isInternal?: boolean;
}

export interface LabEventDTO {
  id: number;
  title: string;
  summary?: string | null;
  eventTime?: string | null;
  content?: string | null;
  tag?: string | null;
  published?: boolean;
  ownerUserId?: number | null;
  ownerUserName?: string | null;
  authors?: LabEventAuthorDTO[];
  createTime?: string;
  updateTime?: string;
}

export interface LabEventPageDTO {
  rows: LabEventDTO[];
  total: number;
}

export interface LabEventQuery {
  keyword?: string;
  tag?: string;
  dateStart?: string;
  dateEnd?: string;
  published?: boolean;
  ownerUserId?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface LabEventSavePayload {
  title: string;
  summary?: string | null;
  eventTime?: string | null;
  content?: string | null;
  tag?: string | null;
  published?: boolean;
  authors?: LabEventAuthorDTO[];
}

export interface UploadFileDTO {
  fileName?: string;
  url?: string;
  [key: string]: any;
}

const normalizeAuthor = (author: LabEventAuthorDTO): LabEventAuthorDTO => {
  const normalized: LabEventAuthorDTO = {
    ...author,
    isCorresponding: !!author.isCorresponding
  };

  if (author.isVisible !== undefined) {
    normalized.visible = !!author.isVisible;
  } else if (author.visible !== undefined) {
    normalized.visible = !!author.visible;
  }

  delete normalized.isVisible;
  return normalized;
};

const normalizeSavePayload = (data: LabEventSavePayload): LabEventSavePayload => {
  return {
    ...data,
    authors: Array.isArray(data.authors)
      ? data.authors.map(item => normalizeAuthor(item))
      : undefined
  };
};

export const getAdminEventsApi = (params?: LabEventQuery) => {
  return http.request<ResponseData<LabEventPageDTO>>("get", "/lab/events", {
    params
  });
};

export const getAdminEventDetailApi = (id: number) => {
  return http.request<ResponseData<LabEventDTO>>("get", `/lab/events/${id}`);
};

export const createAdminEventApi = (data: LabEventSavePayload) => {
  return http.request<ResponseData<number>>("post", "/lab/events", {
    data: normalizeSavePayload(data)
  });
};

export const updateAdminEventApi = (id: number, data: LabEventSavePayload) => {
  return http.request<ResponseData<void>>("put", `/lab/events/${id}`, {
    data: normalizeSavePayload(data)
  });
};

export const deleteAdminEventApi = (id: number) => {
  return http.request<ResponseData<void>>("delete", `/lab/events/${id}`);
};

export const publishAdminEventApi = (id: number, published: boolean) => {
  return http.request<ResponseData<void>>("put", `/lab/events/${id}/publish`, {
    params: { published }
  });
};

export const getOpenEventsApi = (params?: Omit<LabEventQuery, "ownerUserId">) => {
  return http.request<ResponseData<LabEventPageDTO>>("get", "/open/events", {
    params
  });
};

export const getOpenEventDetailApi = (id: number) => {
  return http.request<ResponseData<LabEventDTO>>("get", `/open/events/${id}`);
};

export const uploadEventImageApi = (data: FormData) => {
  return http.request<ResponseData<UploadFileDTO>>("post", "/file/upload", {
    data
  }, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};
