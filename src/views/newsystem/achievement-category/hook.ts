import { ref, reactive, onMounted, computed, h } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import {
  getCategoryListApi,
  getCategoryTreeApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  toggleCategoryStatusApi,
  batchUpdateSortApi,
  type LabAchievementCategoryDTO,
  type CategoryListQuery,
  type CreateCategoryCommand,
  type UpdateCategoryCommand
} from "@/api/newsystem/achievement-category";

export function useHook() {
  // 搜索表单参数
  const searchFormParams = reactive<CategoryListQuery>({
    keyword: "",
    parentId: undefined,
    isActive: undefined,
    pageNum: 1,
    pageSize: 10
  });

  // 页面状态
  const pageLoading = ref(false);
  const dataList = ref<LabAchievementCategoryDTO[]>([]);
  const topLevelCategories = ref<LabAchievementCategoryDTO[]>([]);

  // 分页信息
  const pagination = reactive({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  // 对话框状态
  const dialogVisible = ref(false);
  const dialogTitle = ref("");
  const submitLoading = ref(false);
  const currentEditId = ref<number | null>(null);

  // 表单数据
  const formData = reactive<CreateCategoryCommand & { id?: number }>({
    parentId: null,
    categoryName: "",
    categoryNameEn: "",
    description: "",
    sortOrder: 0,
    isActive: true,
    icon: "",
    color: ""
  });

  // 表单验证规则
  const formRules = {
    categoryName: [
      { required: true, message: "请输入类型名称", trigger: "blur" },
      { min: 1, max: 100, message: "长度在 1 到 100 个字符", trigger: "blur" }
    ],
    categoryNameEn: [
      { max: 200, message: "长度不能超过 200 个字符", trigger: "blur" }
    ],
    description: [
      { max: 500, message: "长度不能超过 500 个字符", trigger: "blur" }
    ],
    sortOrder: [
      { required: true, message: "请输入排序号", trigger: "blur" },
      { type: "number", min: 0, max: 9999, message: "排序号范围 0-9999", trigger: "blur" }
    ]
  };

  // 表格列配置
  const columns = ref([
    {
      label: "ID",
      prop: "id",
      width: 80
    },
    {
      label: "类型名称",
      prop: "categoryName",
      minWidth: 150
    },
    {
      label: "英文名称",
      prop: "categoryNameEn",
      minWidth: 150,
      showOverflowTooltip: true
    },
    {
      label: "父级类型",
      prop: "parentName",
      width: 120,
      cellRenderer: ({ row }) => {
        return row.parentName || "一级类型";
      }
    },
    {
      label: "描述",
      prop: "description",
      minWidth: 200,
      showOverflowTooltip: true
    },
    {
      label: "排序号",
      prop: "sortOrder",
      width: 80,
      cellRenderer: ({ row, index }) => {
        return h("el-input-number", {
          modelValue: row.sortOrder,
          "onUpdate:modelValue": (value: number) => {
            row.sortOrder = value;
          },
          size: "small",
          min: 0,
          max: 9999,
          controlsPosition: "right",
          onBlur: () => updateSortOrder(row),
          style: "width: 80px"
        });
      }
    },
    {
      label: "状态",
      prop: "isActive",
      width: 80,
      cellRenderer: ({ row }) => {
        return row.isActive ?
          h("el-tag", { type: "success" }, "启用") :
          h("el-tag", { type: "danger" }, "禁用");
      }
    },
    {
      label: "系统类型",
      prop: "isSystem",
      width: 100,
      cellRenderer: ({ row }) => {
        return row.isSystem ?
          h("el-tag", { type: "info" }, "系统") :
          h("el-tag", {}, "自定义");
      }
    },
    {
      label: "操作",
      fixed: "right",
      width: 200,
      slot: "operation"
    }
  ]);

  // 获取列表数据
  const getList = async () => {
    try {
      pageLoading.value = true;
      const params = {
        ...searchFormParams,
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      };

      const { data } = await getCategoryListApi(params);
      dataList.value = data.list;
      pagination.total = data.total;
    } catch (error) {
      console.error("获取成果类型列表失败:", error);
      ElMessage.error("获取数据失败");
    } finally {
      pageLoading.value = false;
    }
  };

  // 获取顶级类型列表
  const getTopLevelCategories = async () => {
    try {
      const { data } = await getCategoryTreeApi(true);
      topLevelCategories.value = data.filter(item => !item.parentId);
    } catch (error) {
      console.error("获取顶级类型失败:", error);
    }
  };

  // 搜索
  const onSearch = () => {
    pagination.currentPage = 1;
    getList();
  };

  // 重置表单
  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  // 重置表单数据
  const resetFormData = () => {
    Object.assign(formData, {
      parentId: null,
      categoryName: "",
      categoryNameEn: "",
      description: "",
      sortOrder: 0,
      isActive: true,
      icon: "",
      color: ""
    });
    currentEditId.value = null;
  };

  // 打开对话框
  const openDialog = (title: string, row?: LabAchievementCategoryDTO) => {
    dialogTitle.value = title;
    dialogVisible.value = true;

    if (row) {
      // 编辑模式
      currentEditId.value = row.id;
      Object.assign(formData, {
        parentId: row.parentId,
        categoryName: row.categoryName,
        categoryNameEn: row.categoryNameEn || "",
        description: row.description || "",
        sortOrder: row.sortOrder,
        isActive: row.isActive,
        icon: row.icon || "",
        color: row.color || ""
      });
    } else {
      // 新增模式
      resetFormData();
      if (title.includes("二级")) {
        // 新增二级类型时，需要选择父级
        formData.parentId = null;
      }
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      submitLoading.value = true;

      if (currentEditId.value) {
        // 编辑
        const updateData: UpdateCategoryCommand = {
          parentId: formData.parentId,
          categoryName: formData.categoryName,
          categoryNameEn: formData.categoryNameEn,
          description: formData.description,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
          icon: formData.icon,
          color: formData.color
        };
        await updateCategoryApi(currentEditId.value, updateData);
        ElMessage.success("更新成功");
      } else {
        // 新增
        const createData: CreateCategoryCommand = {
          parentId: formData.parentId,
          categoryName: formData.categoryName,
          categoryNameEn: formData.categoryNameEn,
          description: formData.description,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
          icon: formData.icon,
          color: formData.color
        };
        await createCategoryApi(createData);
        ElMessage.success("创建成功");
      }

      dialogVisible.value = false;
      getList();
      getTopLevelCategories();
    } catch (error) {
      console.error("提交失败:", error);
      ElMessage.error("操作失败");
    } finally {
      submitLoading.value = false;
    }
  };

  // 删除
  const handleDelete = async (row: LabAchievementCategoryDTO) => {
    try {
      await deleteCategoryApi(row.id);
      ElMessage.success("删除成功");
      getList();
      getTopLevelCategories();
    } catch (error) {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    }
  };

  // 切换状态
  const toggleStatus = async (row: LabAchievementCategoryDTO) => {
    try {
      await toggleCategoryStatusApi(row.id, !row.isActive);
      ElMessage.success(`${!row.isActive ? '启用' : '禁用'}成功`);
      getList();
    } catch (error) {
      console.error("状态切换失败:", error);
      ElMessage.error("操作失败");
    }
  };

  // 更新排序号
  const updateSortOrder = async (row: LabAchievementCategoryDTO) => {
    try {
      const updateData: UpdateCategoryCommand = {
        sortOrder: row.sortOrder
      };
      await updateCategoryApi(row.id, updateData);
      ElMessage.success("排序更新成功");
    } catch (error) {
      console.error("排序更新失败:", error);
      ElMessage.error("排序更新失败");
      // 恢复原值
      getList();
    }
  };

  // 批量排序
  const batchSort = async (items: Array<{ id: number; sortOrder: number }>) => {
    try {
      await batchUpdateSortApi({ items });
      ElMessage.success("批量排序成功");
      getList();
    } catch (error) {
      console.error("批量排序失败:", error);
      ElMessage.error("批量排序失败");
    }
  };

  // 初始化
  onMounted(() => {
    getList();
    getTopLevelCategories();
  });

  return {
    searchFormParams,
    pageLoading,
    columns,
    dataList,
    pagination,
    topLevelCategories,

    dialogVisible,
    dialogTitle,
    formData,
    formRules,
    submitLoading,

    onSearch,
    resetForm,
    getList,

    openDialog,
    handleSubmit,
    handleDelete,
    toggleStatus,
    updateSortOrder,
    batchSort
  };
}