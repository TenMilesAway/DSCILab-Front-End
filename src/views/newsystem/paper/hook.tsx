import { message } from "@/utils/message";
import editForm from "./form.vue";
import { type PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h } from "vue";
import { addDialog } from "@/components/ReDialog";

// 论文查询参数接口
interface PaperListQuery {
  pageNum: number;
  pageSize: number;
  title?: string; // 论文标题
  author?: string; // 作者
  journal?: string; // 期刊
  status?: number; // 状态：1=已发表,2=待发表,3=审稿中,4=已拒绝
  keyword?: string; // 关键词搜索
}

// 论文列表项接口
interface PaperListItem {
  id: number;
  title: string; // 论文标题
  author: string; // 作者
  coAuthors?: string; // 合作作者
  journal: string; // 期刊名称
  volume?: string; // 卷号
  issue?: string; // 期号
  pages?: string; // 页码
  publishYear: number; // 发表年份
  doi?: string; // DOI
  abstract?: string; // 摘要
  keywords?: string; // 关键词
  status: number; // 状态
  impactFactor?: number; // 影响因子
  citationCount?: number; // 引用次数
  pdfUrl?: string; // PDF链接
  createdAt?: string; // 创建时间
  updatedAt?: string; // 更新时间
}

// 创建论文请求接口
interface CreatePaperRequest {
  title: string;
  author: string;
  coAuthors?: string;
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publishYear: number;
  doi?: string;
  abstract?: string;
  keywords?: string;
  status: number;
  impactFactor?: number;
  citationCount?: number;
  pdfUrl?: string;
}

// 更新论文请求接口
interface UpdatePaperRequest {
  title: string;
  author: string;
  coAuthors?: string;
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publishYear: number;
  doi?: string;
  abstract?: string;
  keywords?: string;
  status: number;
  impactFactor?: number;
  citationCount?: number;
  pdfUrl?: string;
}

export function useHook() {
  const searchFormParams = reactive<PaperListQuery>({
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    author: undefined,
    journal: undefined,
    status: undefined,
    keyword: undefined
  });

  const formRef = ref();
  const dataList = ref([]);
  const pageLoading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      label: "论文ID",
      prop: "id",
      width: 90,
      fixed: "left"
    },
    {
      label: "论文标题",
      prop: "title",
      minWidth: 200,
      showOverflowTooltip: true
    },
    {
      label: "作者",
      prop: "author",
      minWidth: 120
    },
    {
      label: "合作作者",
      prop: "coAuthors",
      minWidth: 150,
      showOverflowTooltip: true
    },
    {
      label: "期刊",
      prop: "journal",
      minWidth: 150,
      showOverflowTooltip: true
    },
    {
      label: "发表年份",
      prop: "publishYear",
      minWidth: 100
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 90,
      cellRenderer: ({ row }) => {
        const statusMap = {
          1: { text: "已发表", type: "success" },
          2: { text: "待发表", type: "warning" },
          3: { text: "审稿中", type: "info" },
          4: { text: "已拒绝", type: "danger" }
        };
        const status = statusMap[row.status] || { text: "未知", type: "info" };
        return (
          <el-tag type={status.type} size="small">
            {status.text}
          </el-tag>
        );
      }
    },
    {
      label: "影响因子",
      prop: "impactFactor",
      minWidth: 100,
      cellRenderer: ({ row }) => row.impactFactor || "-"
    },
    {
      label: "引用次数",
      prop: "citationCount",
      minWidth: 100,
      cellRenderer: ({ row }) => row.citationCount || "0"
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];

  // 模拟API调用 - 获取论文列表
  async function getPaperListApi(params: PaperListQuery) {
    // 模拟数据
    const mockData = [
      {
        id: 1,
        title: "基于深度学习的图像识别算法研究",
        author: "张三",
        coAuthors: "李四, 王五",
        journal: "计算机学报",
        volume: "45",
        issue: "3",
        pages: "123-135",
        publishYear: 2023,
        doi: "10.1234/example.2023.001",
        abstract: "本文提出了一种基于深度学习的图像识别算法...",
        keywords: "深度学习, 图像识别, 神经网络",
        status: 1,
        impactFactor: 3.5,
        citationCount: 15,
        pdfUrl: "https://example.com/paper1.pdf"
      },
      {
        id: 2,
        title: "机器学习在自然语言处理中的应用",
        author: "李四",
        coAuthors: "张三",
        journal: "软件学报",
        volume: "34",
        issue: "2",
        pages: "45-58",
        publishYear: 2023,
        doi: "10.1234/example.2023.002",
        abstract: "本文探讨了机器学习技术在自然语言处理领域的应用...",
        keywords: "机器学习, 自然语言处理, 文本分析",
        status: 2,
        impactFactor: 2.8,
        citationCount: 8,
        pdfUrl: "https://example.com/paper2.pdf"
      }
    ];

    // 模拟分页和筛选
    let filteredData = mockData;
    if (params.title) {
      filteredData = filteredData.filter(item =>
        item.title.includes(params.title!)
      );
    }
    if (params.author) {
      filteredData = filteredData.filter(
        item =>
          item.author.includes(params.author!) ||
          (item.coAuthors && item.coAuthors.includes(params.author!))
      );
    }
    if (params.journal) {
      filteredData = filteredData.filter(item =>
        item.journal.includes(params.journal!)
      );
    }
    if (params.status) {
      filteredData = filteredData.filter(item => item.status === params.status);
    }

    const total = filteredData.length;
    const start = (params.pageNum - 1) * params.pageSize;
    const end = start + params.pageSize;
    const rows = filteredData.slice(start, end);

    return Promise.resolve({
      data: {
        rows,
        total
      }
    });
  }

  // 模拟API调用 - 添加论文
  async function addPaperApi(data: CreatePaperRequest) {
    console.log("添加论文:", data);
    return Promise.resolve({ success: true });
  }

  // 模拟API调用 - 更新论文
  async function updatePaperApi(id: number, data: UpdatePaperRequest) {
    console.log("更新论文:", id, data);
    return Promise.resolve({ success: true });
  }

  // 模拟API调用 - 删除论文
  async function deletePaperApi(id: number) {
    console.log("删除论文:", id);
    return Promise.resolve({ success: true });
  }

  async function handleAdd(row, done) {
    await addPaperApi(row as CreatePaperRequest).then(() => {
      message(`您新增了论文《${row.title}》`, {
        type: "success"
      });
      done();
      getList();
    });
  }

  async function handleUpdate(row, done) {
    await updatePaperApi(row.id, row as UpdatePaperRequest).then(() => {
      message(`您修改了论文《${row.title}》`, {
        type: "success"
      });
      done();
      getList();
    });
  }

  async function handleDelete(row) {
    await deletePaperApi(row.id).then(() => {
      message(`您删除了论文《${row.title}》`, { type: "success" });
      getList();
    });
  }

  async function onSearch() {
    pagination.currentPage = 1;
    getList();
  }

  async function openDialog(title = "新增", row?: PaperListItem) {
    addDialog({
      title: `${title}论文`,
      props: {
        formInline: {
          id: row?.id ?? 0,
          title: row?.title ?? "",
          author: row?.author ?? "",
          coAuthors: row?.coAuthors ?? "",
          journal: row?.journal ?? "",
          volume: row?.volume ?? "",
          issue: row?.issue ?? "",
          pages: row?.pages ?? "",
          publishYear: row?.publishYear ?? new Date().getFullYear(),
          doi: row?.doi ?? "",
          abstract: row?.abstract ?? "",
          keywords: row?.keywords ?? "",
          status: row?.status ?? 2,
          impactFactor: row?.impactFactor ?? undefined,
          citationCount: row?.citationCount ?? 0,
          pdfUrl: row?.pdfUrl ?? ""
        }
      },
      width: "50%",
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

        const curData: CreatePaperRequest | UpdatePaperRequest = {
          title: formData.title,
          author: formData.author,
          coAuthors: formData.coAuthors,
          journal: formData.journal,
          volume: formData.volume,
          issue: formData.issue,
          pages: formData.pages,
          publishYear: formData.publishYear,
          doi: formData.doi,
          abstract: formData.abstract,
          keywords: formData.keywords,
          status: formData.status,
          impactFactor: formData.impactFactor,
          citationCount: formData.citationCount,
          pdfUrl: formData.pdfUrl
        };

        formRuleRef.validate(valid => {
          if (valid) {
            if (title === "新增") {
              handleAdd(curData, done);
            } else {
              const userId = formData.id;
              if (!userId || userId === 0) {
                message("论文ID不能为空", { type: "error" });
                return;
              }
              curData.id = userId;
              handleUpdate(curData, done);
            }
          }
        });
      }
    });
  }

  async function getList() {
    pageLoading.value = true;
    searchFormParams.pageNum = pagination.currentPage;
    searchFormParams.pageSize = pagination.pageSize;

    const { data } = await getPaperListApi({ ...searchFormParams });
    dataList.value = data.rows;
    pagination.total = data.total;

    setTimeout(() => {
      pageLoading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  onMounted(async () => {
    onSearch();
  });

  return {
    searchFormParams,
    pageLoading,
    columns,
    dataList,
    pagination,
    onSearch,
    openDialog,
    resetForm,
    getList,
    handleDelete
  };
}
