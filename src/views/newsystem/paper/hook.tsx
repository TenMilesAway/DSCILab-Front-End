import { message } from "@/utils/message";
import editForm from "./form.vue";
import { type PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h } from "vue";
import { addDialog } from "@/components/ReDialog";
import {
  getAchievementListApi,
  createAchievementApi,
  updateAchievementApi,
  deleteAchievementApi,
  type AchievementListQuery,
  type LabAchievementDTO,
  type CreateAchievementRequest,
  type UpdateAchievementRequest
} from "@/api/newsystem/paper";

// 使用从paper.ts导入的接口类型
// AchievementListQuery, LabAchievementDTO, CreateAchievementRequest, UpdateAchievementRequest

export function useHook() {
  const searchFormParams = reactive<AchievementListQuery>({
    pageNum: 1,
    pageSize: 10,
    keyword: undefined,
    type: undefined,
    published: undefined
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
      label: "成果ID",
      prop: "id",
      width: 90,
      fixed: "left"
    },
    {
      label: "成果标题",
      prop: "title",
      minWidth: 200,
      showOverflowTooltip: true
    },
    {
      label: "作者",
      prop: "authors",
      minWidth: 200,
      showOverflowTooltip: true,
      cellRenderer: ({ row }) => {
        if (!row.authors || row.authors.length === 0) return "-";
        return row.authors.map(author => author.name).join(", ");
      }
    },
    {
      label: "类型",
      prop: "combinedType",
      minWidth: 120,
      cellRenderer: ({ row }) => {
        if (row.type === 1 && row.paperType) {
          const paperTypeMap = {
            1: "期刊",
            2: "会议",
            3: "预印本",
            4: "专利",
            5: "软著",
            6: "标准",
            7: "专著"
          };
          const paperTypeName = paperTypeMap[row.paperType];
          if (paperTypeName === "期刊" || paperTypeName === "会议") {
            return `${paperTypeName}论文`;
          }
          return paperTypeName || "-";
        } else if (row.type === 2 && row.projectType) {
          const projectTypeMap = {
            1: "横向",
            2: "国自然面上",
            3: "国自然青年",
            4: "北京市教委科技一般",
            5: "国家级教改",
            6: "省部级教改",
            7: "其他教改",
            8: "其他纵向"
          };
          const projectTypeName = projectTypeMap[row.projectType];
          return projectTypeName ? `${projectTypeName}项目` : "-";
        }
        return "-";
      }
    },
    {
      label: "时间",
      prop: "timeDisplay",
      minWidth: 100,
      cellRenderer: ({ row }) => {
        if (row.type === 2) {
          // 项目显示年月
          if (row.projectStartDate) {
            const date = new Date(row.projectStartDate);
            return `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;
          }
          return "-";
        } else {
          // 论文显示年份
          if (row.publishYear) {
            return row.publishYear;
          } else if (row.publishDate) {
            const date = new Date(row.publishDate);
            return date.getFullYear().toString();
          }
          return "-";
        }
      }
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
      label: "操作",
      width: 180,
      slot: "operation"
    },
    {
      label: "是否显示",
      prop: "visible",
      fixed: "right",
      width: 90,
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          v-model={scope.row.visible}
          active-value={true}
          inactive-value={false}
          active-text="显示"
          inactive-text="隐藏"
          inline-prompt
          onChange={() => onVisibilityChange(scope as any)}
        />
      )
    }
  ];

  // 使用真实的API调用
  // getAchievementListApi, createAchievementApi, updateAchievementApi, deleteAchievementApi 已从 paper.ts 导入

  async function handleAdd(row, done) {
    await createAchievementApi(row as CreateAchievementRequest).then(() => {
      message(`您新增了成果《${row.title}》`, {
        type: "success"
      });
      done();
      getList();
    });
  }

  async function handleUpdate({ id, data }, done) {
    await updateAchievementApi(id, data as UpdateAchievementRequest).then(
      () => {
        message(`您修改了成果《${data.title}》`, {
          type: "success"
        });
        done();
        getList();
      }
    );
  }

  async function handleDelete(row) {
    await deleteAchievementApi(row.id).then(() => {
      message(`您删除了成果《${row.title}》`, { type: "success" });
      getList();
    });
  }

  function onVisibilityChange({ row }) {
    // TODO: 接口还没写好，先空着
    // 这里将来需要调用API来更新成果的显示状态
    message(
      `成果《${row.title}》的显示状态已${row.visible ? "开启" : "关闭"}`,
      {
        type: "success"
      }
    );
  }

  async function onSearch() {
    pagination.currentPage = 1;
    getList();
  }

  async function openDialog(title = "新增", row?: LabAchievementDTO) {
    // 处理作者数据回显
    const authors =
      row?.authors?.length > 0
        ? row.authors.map((author, index) => ({
            userId: author.userId || null,
            name: author.name,
            nameEn: author.nameEn || null,
            affiliation: author.affiliation || null,
            authorOrder: index + 1,
            isCorresponding: author.isCorresponding || false,
            role: author.role || null,
            visible: author.visible !== false
          }))
        : [
            {
              userId: null,
              name: "",
              nameEn: null,
              affiliation: null,
              authorOrder: 1,
              isCorresponding: true,
              role: null,
              visible: true
            }
          ];

    addDialog({
      title: `${title}成果`,
      props: {
        formInline: {
          id: row?.id ?? 0,
          title: row?.title ?? "",
          authors: authors,
          journal: row?.venue ?? "",
          publishDate: row?.publishDate ?? "",
          projectEndDate: row?.projectEndDate ?? "",
          doi: row?.doi ?? "",
          achievementType: row?.type === 1 ? "paper" : "project",
          paperType: row?.paperType ?? undefined,
          projectType: row?.projectType ?? undefined,
          projectUrl: row?.linkUrl ?? "",
          githubUrl: row?.type === 1 ? row?.gitUrl ?? "" : ""
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

        // 处理作者数据提交
        const authorsData = formData.authors
          .filter(author => author.name.trim() !== "")
          .map((author, index) => {
            const baseAuthor = {
              userId: author.userId,
              name: author.name.trim(),
              affiliation: author.affiliation?.trim() || null,
              authorOrder: index + 1,
              visible: author.visible
            };

            // 论文类型包含所有字段，项目类型只包含基础字段
            if (formData.achievementType === "paper") {
              return {
                ...baseAuthor,
                nameEn: author.nameEn?.trim() || null,
                isCorresponding: author.isCorresponding,
                role: author.role?.trim() || null
              };
            } else {
              return {
                ...baseAuthor,
                nameEn: null,
                isCorresponding: false,
                role: null
              };
            }
          });

        const curData: CreateAchievementRequest | UpdateAchievementRequest = {
          title: formData.title,
          type: formData.achievementType === "paper" ? 1 : 2,
          paperType:
            formData.achievementType === "paper" ? formData.paperType : null,
          projectType:
            formData.achievementType === "project"
              ? formData.projectType
              : null,
          venue: formData.journal,
          publishDate:
            formData.achievementType === "paper" ? formData.publishDate : null,
          projectStartDate:
            formData.achievementType === "project"
              ? formData.publishDate
              : null,
          projectEndDate:
            formData.achievementType === "project"
              ? formData.projectEndDate
              : null,
          doi: formData.doi,
          linkUrl: formData.projectUrl,
          gitUrl:
            formData.achievementType === "project" ? null : formData.githubUrl,
          authors: authorsData
        };

        formRuleRef.validate(valid => {
          if (valid) {
            if (title === "新增") {
              handleAdd(curData, done);
            } else {
              const userId = formData.id;
              if (!userId || userId === 0) {
                message("成果ID不能为空", { type: "error" });
                return;
              }
              handleUpdate({ id: userId, data: curData }, done);
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

    const { data } = await getAchievementListApi({ ...searchFormParams });
    // 为每个成果初始化visible字段，默认为true（显示）
    dataList.value = data.rows.map(item => ({
      ...item,
      visible: item.visible !== undefined ? item.visible : true
    }));
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
