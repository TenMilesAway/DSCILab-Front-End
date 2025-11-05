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
  getProjectListApi,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
  toggleMyProjectVisibilityApi,
  type ProjectListQuery,
  type LabProjectDTO,
  type CreateProjectRequest,
  type UpdateProjectRequest
} from "@/api/newsystem/project";

// 使用从project.ts导入的接口类型
// ProjectListQuery, LabProjectDTO, CreateProjectRequest, UpdateProjectRequest

export function useHook() {
  const searchFormParams = reactive<ProjectListQuery>({
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
    parentCategoryId: undefined,
    ownerUserId: undefined
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

  // 项目类型映射
  const categoryMap = ref<Map<number, string>>(new Map());
  const defaultProjectTopId = ref<number | undefined>(undefined);

  // 获取项目类型映射
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

        // 设置默认筛选为“项目”一级类型（仅首次加载时）
        const projectTop = response.data.find(category => {
          // 部分环境后端返回`type`字段：1=论文，2=项目；若无则回退按名称匹配
          const isProjectByType = (category as any)?.type === 2;
          const isProjectByName = category.categoryName?.includes("项目");
          return isProjectByType || isProjectByName;
        });
        defaultProjectTopId.value = projectTop?.id;
        if (!searchFormParams.parentCategoryId) {
          if (projectTop) {
            // 选择“项目”一级类型，避免与旧type字段冲突
            searchFormParams.parentCategoryId = projectTop.id;
            searchFormParams.type = undefined;
          } else if (searchFormParams.type === undefined) {
            // 兜底：若无法识别“项目”一级类型，默认按旧type筛选为项目
            searchFormParams.type = 2;
          }
        }
      }
    } catch (error) {
      console.error('获取项目类型映射失败:', error);
    }
  };

  const columns: TableColumnList = [
    {
      label: "项目ID",
      prop: "id",
      width: 90,
      fixed: "left"
    },
    {
      label: "项目名称",
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
  // getProjectListApi, createProjectApi, updateProjectApi, deleteProjectApi 已从 project.ts 导入

  async function handleAdd(row, done) {
    await createProjectApi(row as CreateProjectRequest).then(() => {
      message(`您新增了项目《${row.title}》`, {
        type: "success"
      });
      done();
      getList();
    });
  }

  async function handleUpdate({ id, data }, done) {
    await updateProjectApi(id, data as UpdateProjectRequest).then(
      () => {
        message(`您修改了项目《${data.title}》`, {
          type: "success"
        });
        done();
        getList();
      }
    );
  }

  async function handleDelete(row) {
    await deleteProjectApi(row.id).then(() => {
      message(`您删除了项目《${row.title}》`, { type: "success" });
      getList();
    });
  }

  async function onVisibilityChange({ row }) {
    try {
      await toggleMyProjectVisibilityApi(row.id, row.myVisibility);
      message(
        `项目《${row.title}》的显示状态已${row.myVisibility ? "开启" : "关闭"}`,
        {
          type: "success"
        }
      );
      // 刷新列表以确保数据同步
      getList();
    } catch (error) {
      // 如果API调用失败，恢复原来的状态
      row.myVisibility = !row.myVisibility;
      message(`更新项目《${row.title}》的显示状态失败`, {
        type: "error"
      });
    }
  }

  async function onSearch() {
    pagination.currentPage = 1;
    getList();
  }

  async function openDialog(title = "新增", row?: LabProjectDTO) {
    const isEdit = !!row;
    // 处理作者数据回显
    const authors =
      row?.authors?.length > 0
        ? row.authors.map((author, index) => ({
          userId: author.userId || null,
          name: author.name,
          email: author.email || null,
          authorOrder: index + 1,
          isCorresponding: author.isCorresponding || false,
          // 当 role 为 '负责人' 时标记 isLeader
          isLeader: author.role === '负责人',
          visible: author.visible !== false
        }))
        : [
          {
            userId: null,
            name: "",
            email: null,
            authorOrder: 1,
            isCorresponding: true,
            isLeader: false,
            visible: true
          }
        ];

    addDialog({
      title: `${title}项目`,
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
          achievementType: isEdit ? "paper" : "project", // 新增默认按“项目”，编辑将由categoryId/watcher矫正
          paperType: row?.paperType ?? undefined,
          projectType: row?.projectType ?? undefined,
          // 新增模式默认选择“项目”一级类型
          categoryId: (isEdit ? row?.categoryId : defaultProjectTopId.value) ?? undefined,

          githubUrl: row?.type === 1 ? row?.gitUrl ?? "" : "",
          published: row?.published ?? true,
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
              visible: author.visible,
              email: author.email?.trim() || null
            };

            // 论文和其他类型包含通讯作者字段，项目类型不包含
            if (formData.achievementType !== "project") {
              return {
                ...baseAuthor,
                isCorresponding: author.isCorresponding
              };
            } else {
              return {
                ...baseAuthor,
                isCorresponding: false,
                // 将负责人勾选映射到 role 字段
                role: author.isLeader ? '负责人' : null
              };
            }
          });

        const curData: CreateProjectRequest | UpdateProjectRequest = {
          title: formData.title,
          // v2 严格拒收 legacy 字段（type/paperType/projectType），仅提交 categoryId
          categoryId: formData.specificCategoryId || null, // 具体类型ID放在categoryId字段
          venue: formData.journal || null,
          publishDate:
            formData.achievementType !== "project" ? formData.publishDate || null : null,
          projectStartDate:
            formData.achievementType === "project"
              ? formData.projectStartDate || null
              : null,
          projectEndDate:
            formData.achievementType === "project"
              ? formData.projectEndDate || null
              : null,
          doi: formData.doi || null,
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
                message("项目ID不能为空", { type: "error" });
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

    // 统一使用lab/projects接口
    const result = await getProjectListApi({ ...searchFormParams });
    const data = result.data;

    // 为每个项目初始化myVisibility字段，默认为true（显示）
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
    // 重置后仍默认筛选为“项目”
    if (defaultProjectTopId.value) {
      searchFormParams.parentCategoryId = defaultProjectTopId.value;
      searchFormParams.type = undefined;
    } else if (searchFormParams.type === undefined) {
      searchFormParams.type = 2;
    }
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