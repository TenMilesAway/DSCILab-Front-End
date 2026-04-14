import { message } from "@/utils/message";
import editForm from "./form.vue";
import detailDialog from "./detail.vue";
import { type PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h } from "vue";
import { addDialog } from "@/components/ReDialog";
import {
  getAdminEventsApi,
  getAdminEventDetailApi,
  createAdminEventApi,
  updateAdminEventApi,
  deleteAdminEventApi,
  publishAdminEventApi,
  type LabEventDTO,
  type LabEventQuery,
  type LabEventSavePayload
} from "@/api/lab/events";

export type NewsItem = LabEventDTO;

export type SearchParams = LabEventQuery;

export function useHook() {
  const formRef = ref();
  const pageLoading = ref(true);

  const searchFormParams = reactive<SearchParams>({
    keyword: "",
    published: undefined,
    pageNum: 1,
    pageSize: 10
  });

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const dataList = ref<NewsItem[]>([]);

  const columns: TableColumnList = [
    {
      label: "标题",
      prop: "title",
      minWidth: 200,
      showOverflowTooltip: true
    },
    {
      label: "活动时间",
      prop: "eventTime",
      width: 140,
      formatter: ({ eventTime }) => {
        if (!eventTime) return "-";
        return String(eventTime).slice(0, 10);
      }
    },
    {
      label: "作者",
      prop: "authors",
      minWidth: 180,
      showOverflowTooltip: true,
      formatter: ({ authors }) => {
        if (!Array.isArray(authors) || authors.length === 0) return "";
        return authors
          .map(author => author?.name)
          .filter(Boolean)
          .join("、");
      }
    },
    {
      label: "发布状态",
      prop: "published",
      width: 110,
      cellRenderer: ({ row }) => {
        const config = row.published
          ? { text: "已发布", type: "success" }
          : { text: "未发布", type: "info" };
        return (
          <el-tag type={config.type} size="small">
            {config.text}
          </el-tag>
        );
      }
    },
    {
      label: "操作",
      fixed: "right",
      width: 360,
      slot: "operation"
    }
  ];

  const normalizeDateValue = (value?: string | null) => {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;
    return raw.slice(0, 10);
  };

  const normalizeContent = (value?: string | null) => {
    const raw = (value || "").trim();
    if (!raw) return null;
    // If plain text is provided, wrap to html paragraph for display-side consistency.
    if (!/<[a-z][\s\S]*>/i.test(raw)) {
      return `<p>${raw.replace(/\n/g, "<br>")}</p>`;
    }
    return raw;
  };

  const extractErrorMsg = (error: any) => {
    return (
      error?.response?.data?.msg ||
      error?.response?.data?.message ||
      error?.message ||
      "系统内部错误，请联系管理员"
    );
  };

  async function getList() {
    pageLoading.value = true;
    try {
      const params: LabEventQuery = {
        ...searchFormParams,
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      };
      const res = await getAdminEventsApi(params);
      const rows = res.data?.rows || [];
      dataList.value = rows;
      pagination.total = res.data?.total || 0;

      // 列表接口为轻量模式时，补拉详情用于展示作者列。
      const rowsNeedAuthors = rows.filter(
        item => item?.id && (!Array.isArray(item.authors) || item.authors.length === 0)
      );

      if (rowsNeedAuthors.length > 0) {
        const detailResults = await Promise.allSettled(
          rowsNeedAuthors.map(item => getAdminEventDetailApi(item.id))
        );

        const authorMap = new Map<number, NonNullable<LabEventDTO["authors"]>>();
        detailResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const row = rowsNeedAuthors[index];
            authorMap.set(row.id, result.value.data?.authors || []);
          }
        });

        dataList.value = rows.map(item => ({
          ...item,
          authors: authorMap.get(item.id) || item.authors || []
        }));
      }
    } catch (error) {
      message("获取数据失败", { type: "error" });
    } finally {
      pageLoading.value = false;
    }
  }

  function onSearch() {
    pagination.currentPage = 1;
    getList();
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    searchFormParams.keyword = "";
    searchFormParams.published = undefined;
    onSearch();
  }

  async function handleDelete(row: NewsItem) {
    try {
      await deleteAdminEventApi(row.id);
      message(`删除活动"${row.title}"成功`, { type: "success" });
      getList();
    } catch (error) {
      message("删除失败", { type: "error" });
    }
  }

  async function openDialog(title: string, row?: NewsItem) {
    let detailData = row;
    if (row?.id) {
      try {
        const detailRes = await getAdminEventDetailApi(row.id);
        detailData = detailRes.data;
      } catch (error) {
        message("获取活动详情失败，已使用列表数据打开", { type: "warning" });
      }
    }

    addDialog({
      title: `${title}活动`,
      props: {
        formInline: {
          id: detailData?.id ?? 0,
          title: detailData?.title ?? "",
          summary: detailData?.summary ?? "",
          eventTime: detailData?.eventTime
            ? String(detailData.eventTime).slice(0, 10)
            : "",
          content: detailData?.content ?? "",
          tag: detailData?.tag ?? "",
          published: detailData?.published ?? false,
          authors: Array.isArray(detailData?.authors)
            ? detailData.authors.map((author, index) => ({
                userId: author.userId ?? null,
                name: author.name || "",
                nameEn: author.nameEn || "",
                affiliation: author.affiliation || "",
                authorOrder: author.authorOrder || index + 1,
                isCorresponding: !!author.isCorresponding,
                role: author.role || "",
                isVisible:
                  author.isVisible !== undefined
                    ? !!author.isVisible
                    : author.visible !== false
              }))
            : []
        }
      },
      width: "60%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: ({ options }) =>
        h(editForm, {
          ref: formRef,
          ...options.props
        }),
      beforeSure: (done, { options }) => {
        const childRef = formRef.value;
        const formRuleRef = childRef.getFormRuleRef();
        const formData = childRef.getFormData
          ? childRef.getFormData()
          : options.props.formInline;
        const authors = Array.isArray(formData.authors)
          ? formData.authors
              .filter(author => author.name && author.name.trim())
              .map((author, index) => ({
                userId: author.userId ?? null,
                name: author.name.trim(),
                nameEn: author.nameEn?.trim() || null,
                affiliation: author.affiliation?.trim() || null,
                authorOrder: Number(author.authorOrder) > 0 ? Number(author.authorOrder) : index + 1,
                isCorresponding: !!author.isCorresponding,
                role: author.role?.trim() || null,
                isVisible: author.isVisible !== false
              }))
          : [];

        const payload: LabEventSavePayload = {
          title: (formData.title || "").trim(),
          summary: (formData.summary || "").trim() || null,
          eventTime: normalizeDateValue(formData.eventTime),
          content: normalizeContent(formData.content),
          tag: (formData.tag || "").trim() || null,
          published: !!formData.published,
          authors
        };

        formRuleRef.validate(valid => {
          if (valid) {
            if (title === "新增") {
              handleAdd(payload, done);
            } else {
              handleUpdate(formData.id, payload, done);
            }
          }
        });
      }
    });
  }

  async function openDetailDialog(row: NewsItem) {
    if (!row?.id) {
      message("当前活动缺少ID，无法查看详情", { type: "warning" });
      return;
    }
    try {
      const res = await getAdminEventDetailApi(row.id);
      addDialog({
        title: "活动详情",
        props: {
          newsData: res.data
        },
        width: "70%",
        draggable: true,
        fullscreenIcon: true,
        closeOnClickModal: false,
        hideFooter: true,
        contentRenderer: ({ options }) =>
          h(detailDialog, {
            ...options.props
          })
      });
    } catch (error) {
      message("获取活动详情失败，已使用列表数据打开", { type: "warning" });
      addDialog({
        title: "活动详情",
        props: {
          newsData: {
            ...row,
            content: row.content || ""
          }
        },
        width: "70%",
        draggable: true,
        fullscreenIcon: true,
        closeOnClickModal: false,
        hideFooter: true,
        contentRenderer: ({ options }) =>
          h(detailDialog, {
            ...options.props
          })
      });
    }
  }

  async function handleAdd(formData: LabEventSavePayload, done: Function) {
    try {
      await createAdminEventApi(formData);
      message(`新增活动"${formData.title}"成功`, { type: "success" });
      done();
      getList();
    } catch (error: any) {
      message(extractErrorMsg(error), { type: "error" });
    }
  }

  async function handleUpdate(
    id: number,
    formData: LabEventSavePayload,
    done: Function
  ) {
    try {
      await updateAdminEventApi(id, formData);
      message(`更新活动"${formData.title}"成功`, { type: "success" });
      done();
      getList();
    } catch (error: any) {
      message(extractErrorMsg(error), { type: "error" });
    }
  }

  async function togglePublish(row: NewsItem) {
    try {
      const nextPublished = !row.published;
      await publishAdminEventApi(row.id, nextPublished);
      message(nextPublished ? "活动已发布" : "活动已取消发布", {
        type: "success"
      });
      getList();
    } catch (error) {
      message("更新发布状态失败", { type: "error" });
    }
  }

  onMounted(() => {
    getList();
  });

  return {
    searchFormParams,
    pageLoading,
    columns,
    dataList,
    pagination,
    onSearch,
    resetForm,
    handleDelete,
    togglePublish,
    openDialog,
    openDetailDialog,
    getList
  };
}
