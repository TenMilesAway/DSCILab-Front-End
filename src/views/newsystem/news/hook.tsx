import { message } from "@/utils/message";
import editForm from "./form.vue";
import detailDialog from "./detail.vue";
import { type PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h } from "vue";
import { addDialog } from "@/components/ReDialog";

// 新闻活动数据类型定义
export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  content: string;
  type: number; // 1-新闻 2-活动 3-通知
  status: number; // 1-已发布 2-草稿
  publishTime: string;
  createTime: string;
  updateTime: string;
  author: string;
  coverImage?: string;
}

// 搜索参数类型
export interface SearchParams {
  title: string;
  type: number | null;
  status: number | null;
  page: number;
  size: number;
}

export function useHook() {
  const formRef = ref();
  const pageLoading = ref(true);

  // 搜索表单参数
  const searchFormParams = reactive<SearchParams>({
    title: "",
    type: null,
    status: null,
    page: 1,
    size: 10
  });

  // 分页配置
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  // 表格数据
  const dataList = ref<NewsItem[]>([]);

  // 表格列定义
  const columns: TableColumnList = [
    {
      label: "标题",
      prop: "title",
      minWidth: 200,
      showOverflowTooltip: true
    },
    {
      label: "概要",
      prop: "summary",
      minWidth: 250,
      showOverflowTooltip: true
    },
    {
      label: "类型",
      prop: "type",
      width: 100,
      cellRenderer: ({ row }) => {
        const typeMap = {
          1: { text: "新闻", type: "primary" },
          2: { text: "活动", type: "success" },
          3: { text: "通知", type: "warning" }
        };
        const config = typeMap[row.type] || { text: "未知", type: "info" };
        return (
          <el-tag type={config.type} size="small">
            {config.text}
          </el-tag>
        );
      }
    },
    {
      label: "状态",
      prop: "status",
      width: 100,
      cellRenderer: ({ row }) => {
        const statusMap = {
          1: { text: "已发布", type: "success" },
          2: { text: "草稿", type: "info" }
        };
        const config = statusMap[row.status] || {
          text: "未知",
          type: "danger"
        };
        return (
          <el-tag type={config.type} size="small">
            {config.text}
          </el-tag>
        );
      }
    },
    {
      label: "作者",
      prop: "author",
      width: 120
    },
    {
      label: "发布时间",
      prop: "publishTime",
      width: 180,
      formatter: ({ publishTime }) => {
        return publishTime ? new Date(publishTime).toLocaleString() : "-";
      }
    },
    {
      label: "操作",
      fixed: "right",
      width: 200,
      slot: "operation"
    }
  ];

  // 模拟数据
  const mockData: NewsItem[] = [
    {
      id: 1,
      title: "实验室在人工智能领域取得重大突破",
      summary:
        "我们的研究团队在深度学习算法优化方面取得了重要进展，相关论文已被顶级会议接收。",
      content: "详细内容...",
      type: 1,
      status: 1,
      publishTime: "2024-01-15 10:00:00",
      createTime: "2024-01-14 15:30:00",
      updateTime: "2024-01-15 09:45:00",
      author: "张教授"
    },
    {
      id: 2,
      title: "学术交流会议通知",
      summary:
        "定于2024年2月20日举办人工智能与机器学习前沿技术研讨会，欢迎各位师生参加。",
      content: "会议详情...",
      type: 2,
      status: 1,
      publishTime: "2024-01-20 14:00:00",
      createTime: "2024-01-19 16:20:00",
      updateTime: "2024-01-20 13:50:00",
      author: "李老师"
    },
    {
      id: 3,
      title: "实验室安全管理规定更新",
      summary:
        "为确保实验室安全，现对相关管理规定进行更新，请全体成员认真学习并严格执行。",
      content: "规定详情...",
      type: 3,
      status: 2,
      publishTime: "",
      createTime: "2024-01-22 11:15:00",
      updateTime: "2024-01-22 11:15:00",
      author: "王老师"
    }
  ];

  // 获取数据列表
  async function getList() {
    pageLoading.value = true;
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 模拟筛选逻辑
      let filteredData = [...mockData];

      if (searchFormParams.title) {
        filteredData = filteredData.filter(item =>
          item.title.includes(searchFormParams.title)
        );
      }

      if (searchFormParams.type !== null) {
        filteredData = filteredData.filter(
          item => item.type === searchFormParams.type
        );
      }

      if (searchFormParams.status !== null) {
        filteredData = filteredData.filter(
          item => item.status === searchFormParams.status
        );
      }

      // 模拟分页
      const start = (pagination.currentPage - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;

      dataList.value = filteredData.slice(start, end);
      pagination.total = filteredData.length;
    } catch (error) {
      message("获取数据失败", { type: "error" });
    } finally {
      pageLoading.value = false;
    }
  }

  // 搜索
  function onSearch() {
    pagination.currentPage = 1;
    getList();
  }

  // 重置表单
  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  // 删除
  async function handleDelete(row: NewsItem) {
    try {
      // 模拟删除API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      message(`删除新闻"${row.title}"成功`, { type: "success" });
      getList();
    } catch (error) {
      message("删除失败", { type: "error" });
    }
  }

  // 打开编辑对话框
  function openDialog(title: string, row?: NewsItem) {
    addDialog({
      title: `${title}新闻`,
      props: {
        formInline: {
          id: row?.id ?? 0,
          title: row?.title ?? "",
          summary: row?.summary ?? "",
          content: row?.content ?? "",
          type: row?.type ?? 1,
          status: row?.status ?? 2,
          coverImage: row?.coverImage ?? "",
          author: row?.author ?? ""
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
        const formRuleRef = formRef.value.getFormRuleRef();
        const formData = options.props.formInline;

        formRuleRef.validate(valid => {
          if (valid) {
            if (title === "新增") {
              handleAdd(formData, done);
            } else {
              handleUpdate(formData, done);
            }
          }
        });
      }
    });
  }

  // 打开详情对话框
  function openDetailDialog(row: NewsItem) {
    addDialog({
      title: "新闻详情",
      props: {
        newsData: row
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

  // 新增
  async function handleAdd(formData: any, done: () => void) {
    try {
      // 模拟新增API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message(`新增新闻"${formData.title}"成功`, { type: "success" });
      done();
      getList();
    } catch (error) {
      message("新增失败", { type: "error" });
    }
  }

  // 更新
  async function handleUpdate(formData: any, done: () => void) {
    try {
      // 模拟更新API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message(`更新新闻"${formData.title}"成功`, { type: "success" });
      done();
      getList();
    } catch (error) {
      message("更新失败", { type: "error" });
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
    openDialog,
    openDetailDialog,
    getList
  };
}
