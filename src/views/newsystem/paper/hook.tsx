import { message } from "@/utils/message";
import editForm from "./form.vue";
import { type PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h } from "vue";
import { addDialog } from "@/components/ReDialog";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import { useUserStoreHook } from "@/store/modules/user";
import { getDictCategoryTreeApi, type LabAchievementCategoryDTO } from "@/api/newsystem/achievement-category";

import {
  getAchievementListApi,
  getMyAchievementsApi,
  createAchievementApi,
  updateAchievementApi,
  deleteAchievementApi,
  toggleMyAchievementVisibilityApi,
  type AchievementListQuery,
  type MyAchievementQuery,
  type MyAchievementExtendedQuery,
  type LabAchievementDTO,
  type CreateAchievementRequest,
  type UpdateAchievementRequest
} from "@/api/newsystem/paper";

// 使用从paper.ts导入的接口类型
// AchievementListQuery, LabAchievementDTO, CreateAchievementRequest, UpdateAchievementRequest

export function useHook() {
  const searchFormParams = reactive<MyAchievementExtendedQuery>({
    pageNum: 1,
    pageSize: 10,
    keyword: undefined,
    type: undefined,
    paperType: undefined,
    projectType: undefined,
    published: undefined,
    isVerified: undefined,
    dateStart: undefined,
    dateEnd: undefined,
    categoryId: undefined,
    ownerName: undefined,
    authorName: undefined
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

  // 成果类型映射
  const categoryMap = ref<Map<number, string>>(new Map());

  // 获取成果类型映射
  const loadCategoryMap = async () => {
    try {
      const response = await getDictCategoryTreeApi();
      if (response.code === 0) {
        const map = new Map<number, string>();
        response.data.forEach(category => {
          // 添加一级分类
          map.set(category.id, category.categoryName);
          // 添加二级分类
          if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
              map.set(child.id, child.categoryName);
            });
          }
        });
        categoryMap.value = map;
      }
    } catch (error) {
      console.error('获取成果类型映射失败:', error);
    }
  };

  const columns: TableColumnList = [
    {
      label: "成果ID",
      prop: "id",
      width: 90,
      fixed: "left"
    },
    {
      label: "成果名称",
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
        // 优先使用新的categoryId显示类型名称
        if (row.categoryId && categoryMap.value.has(row.categoryId)) {
          return categoryMap.value.get(row.categoryId);
        }

        // 如果没有categoryId，显示基础类型
        if (row.type === 1) {
          return "论文、专利等";
        } else if (row.type === 2) {
          return "项目";
        }

        return "-";
      }
    },
    {
      label: "时间",
      prop: "timeDisplay",
      minWidth: 100,
      cellRenderer: ({ row }) => {
        // 统一逻辑：优先显示publishDate提取的年份，如果没有，使用projectStartDate提取的年份
        if (row.publishDate) {
          const date = new Date(row.publishDate);
          return date.getFullYear().toString();
        } else if (row.projectStartDate) {
          const date = new Date(row.projectStartDate);
          return date.getFullYear().toString();
        }
        return "-";
      }
    },
    {
      label: "操作",
      prop: "visible",
      width: 250,
      fixed: "right",
      cellRenderer: scope => {
        const currentUser = useUserStoreHook().currentUserInfo;
        // 根据调试信息，currentUser对象中identity字段在userInfo中
        const isTeacher = currentUser?.userInfo?.identity === 2;

        return (
          <div
            style={`display: flex; align-items: center; ${!isTeacher ? "justify-content: center;" : ""
              }`}
          >
            <el-button
              link
              type="primary"
              size="default"
              icon={useRenderIcon(EditPen)}
              onClick={() => openDialog("编辑", scope.row)}
              style="margin-right: 3px;"
            >
              修改
            </el-button>
            <el-popconfirm
              title="是否确认删除?"
              onConfirm={() => handleDelete(scope.row)}
            >
              {{
                reference: () => (
                  <el-button
                    link
                    type="danger"
                    size="default"
                    icon={useRenderIcon(Delete)}
                    style={isTeacher ? "margin-right: 12px;" : ""}
                  >
                    删除
                  </el-button>
                )
              }}
            </el-popconfirm>
            {isTeacher && (
              <el-switch
                size={scope.props.size === "small" ? "small" : "default"}
                v-model={scope.row.myVisibility}
                active-value={true}
                inactive-value={false}
                active-text="显示"
                inactive-text="隐藏"
                inline-prompt
                onChange={() => onVisibilityChange(scope as any)}
              />
            )}
          </div>
        );
      }
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

  async function onVisibilityChange({ row }) {
    try {
      await toggleMyAchievementVisibilityApi(row.id, row.myVisibility);
      message(
        `成果《${row.title}》的显示状态已${row.myVisibility ? "开启" : "关闭"}`,
        {
          type: "success"
        }
      );
      // 刷新列表以确保数据同步
      getList();
    } catch (error) {
      // 如果API调用失败，恢复原来的状态
      row.myVisibility = !row.myVisibility;
      message(`更新成果《${row.title}》的显示状态失败`, {
        type: "error"
      });
    }
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
          email: author.email || null,
          authorOrder: index + 1,
          isCorresponding: author.isCorresponding || false,
          visible: author.visible !== false
        }))
        : [
          {
            userId: null,
            name: "",
            email: null,
            authorOrder: 1,
            isCorresponding: true,
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
          // 项目开始日期：统一使用projectStartDate字段
          projectStartDate: row?.projectStartDate
            ? new Date(row.projectStartDate).toISOString().slice(0, 7)
            : "",
          // 发表年份/日期：仅用于论文类型
          publishDate: (() => {
            // 优先使用新类型系统判断
            if (row?.categoryId && categoryMap.value.has(row.categoryId)) {
              const categoryName = categoryMap.value.get(row.categoryId);
              const isProject = categoryName?.includes('项目');

              if (!isProject) {
                // 论文类型：优先使用publishYear，其次使用publishDate提取年份
                if (row?.publishYear) {
                  return row.publishYear.toString();
                } else if (row?.publishDate) {
                  return new Date(row.publishDate).getFullYear().toString();
                }
              }
            }

            // 兜底逻辑：使用旧的type字段判断
            if (row?.type === 1) {
              // 论文类型：优先使用publishYear，其次使用publishDate提取年份
              if (row?.publishYear) {
                return row.publishYear.toString();
              } else if (row?.publishDate) {
                return new Date(row.publishDate).getFullYear().toString();
              }
            }

            return "";
          })(),
          // 项目结束日期：统一使用projectEndDate字段
          projectEndDate: row?.projectEndDate
            ? new Date(row.projectEndDate).toISOString().slice(0, 7)
            : "",
          doi: row?.doi ?? "",
          achievementType: "paper", // 默认值，将通过categoryId的watch自动设置
          paperType: row?.paperType ?? undefined,
          projectType: row?.projectType ?? undefined,
          categoryId: row?.categoryId ?? undefined, // 成果类型ID（v2接口使用叶子节点categoryId）

          githubUrl: row?.type === 1 ? row?.gitUrl ?? "" : "",
          published: row?.published ?? true,
          gitUrl: row?.gitUrl ?? "",
          linkUrl: row?.linkUrl ?? "",
          pdfUrl: row?.pdfUrl ?? "",
          reference: row?.reference ?? "",
          fundingAmount: row?.fundingAmount ?? undefined
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
              authorOrder: index + 1,
              visible: author.visible
            };

            // 所有类型都包含邮箱字段
            return {
              ...baseAuthor,
              email: author.email?.trim() || null,
              isCorresponding: formData.achievementType === "paper" ? author.isCorresponding : false
            };
          });

        const curData: CreateAchievementRequest | UpdateAchievementRequest = {
          title: formData.title,
          // 删除type字段，v2接口不再需要
          paperType:
            formData.achievementType === "paper" ? formData.paperType : null,
          projectType:
            formData.achievementType === "project"
              ? formData.projectType
              : null,
          categoryId: formData.specificCategoryId || null, // 具体类型ID放在categoryId字段
          venue: formData.journal || null,
          publishDate:
            formData.achievementType === "paper" ? formData.publishDate || null : null,
          projectStartDate:
            formData.achievementType === "project"
              ? formData.projectStartDate || null
              : null,
          projectEndDate:
            formData.achievementType === "project"
              ? formData.projectEndDate || null
              : null,
          doi: formData.doi || null,
          linkUrl: formData.linkUrl || null,
          gitUrl: formData.gitUrl || null,
          pdfUrl: formData.pdfUrl || null,
          reference: formData.reference || null,
          fundingAmount: formData.fundingAmount || null,
          published: formData.published,
          authors: authorsData
        };

        // 处理空值，将空字符串转换为null
        Object.keys(curData).forEach(key => {
          if (curData[key] === '' || curData[key] === undefined) {
            curData[key] = null;
          }
        });

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

    // 获取当前用户信息
    const currentUser = useUserStoreHook().currentUserInfo;
    const userIdentity = currentUser?.userInfo?.identity; // 1=管理员, 2=教师, 3=学生

    let data;
    if (userIdentity === 1) {
      // 管理员使用原接口
      const result = await getAchievementListApi({ ...searchFormParams });
      data = result.data;
    } else {
      // 教师和学生使用my-achievements接口
      const myParams: MyAchievementExtendedQuery = {
        pageNum: searchFormParams.pageNum,
        pageSize: searchFormParams.pageSize,
        keyword: searchFormParams.keyword,
        type: searchFormParams.type,
        paperType: searchFormParams.paperType,
        projectType: searchFormParams.projectType,
        categoryId: searchFormParams.type, // 将type字段映射到categoryId参数
        published: searchFormParams.published,
        isVerified: searchFormParams.isVerified,
        dateStart: searchFormParams.dateStart,
        dateEnd: searchFormParams.dateEnd,
        ownerName: searchFormParams.ownerName,
        authorName: searchFormParams.authorName
      };
      const result = await getMyAchievementsApi(myParams);
      data = result.data;
    }

    // 为每个成果初始化myVisibility字段，默认为true（显示）
    dataList.value = data.rows.map(item => ({
      ...item,
      myVisibility: item.myVisibility !== undefined ? item.myVisibility : true
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
    await loadCategoryMap();
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
