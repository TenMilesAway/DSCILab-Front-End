import { message } from "@/utils/message";
import {
  UserListQuery,
  getUserListApi,
  addUserApi,
  updateUserApi,
  exportUserExcelApi,
  deleteUserApi,
  PasswordRequest,
  updateUserPasswordApi,
  UserListItem,
  CreateUserRequest,
  UpdateUserRequest
} from "@/api/newsystem/user";
import editForm from "./form.vue";
import passwordForm from "./passwordForm.vue";
import uploadForm from "./uploadForm.vue";
import { type PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, toRaw, h } from "vue";
import { addDialog } from "@/components/ReDialog";

export function useHook() {
  const searchFormParams = reactive<UserListQuery>({
    pageNum: 1,
    pageSize: 10,
    username: undefined, // 用户名筛选
    realName: undefined, // 真实姓名筛选
    englishName: undefined, // 英文名筛选
    identity: undefined, // 身份筛选：1=管理员,2=教师,3=学生
    academicStatus: undefined, // 学术身份筛选：1=教授,2=副教授,3=讲师,4=博士,5=硕士
    gender: undefined, // 性别筛选：0=未知,1=男,2=女
    status: undefined, // 状态筛选：1=在读/在职,2=毕业/离职
    isActive: undefined, // 是否启用
    keyword: undefined // 关键词搜索（用户名、姓名、邮箱）
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
      label: "用户ID",
      prop: "id",
      width: 90,
      fixed: "left"
    },
    {
      label: "学号/工号",
      prop: "studentNumber",
      minWidth: 120,
      cellRenderer: ({ row }) => {
        // 根据身份显示不同的标签
        const label =
          row.identity === 1
            ? "学号/工号"
            : row.identity === 2
              ? "工号"
              : "学号";
        return row.studentNumber ? (
          <span title={`${label}: ${row.studentNumber}`}>
            {row.studentNumber}
          </span>
        ) : (
          "-"
        );
      }
    },
    {
      label: "用户名",
      prop: "username",
      minWidth: 130
    },
    {
      label: "姓名",
      prop: "realName",
      minWidth: 130
    },

    {
      label: "身份",
      prop: "identity",
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <span>
          {row.identity === 1 ? "管理员" : row.identity === 2 ? "教师" : "学生"}
        </span>
      )
    },
    {
      label: "学术身份",
      prop: "academicStatus",
      minWidth: 100,
      cellRenderer: ({ row }) => {
        const statusMap = {
          0: "实验室负责人",
          1: "教授",
          2: "副教授",
          3: "讲师",
          4: "博士研究生",
          5: "硕士研究生",
          6: "本科生"
        };
        return row.academicStatus ? (
          <span>{statusMap[row.academicStatus] || "未知"}</span>
        ) : (
          "-"
        );
      }
    },
    {
      label: "手机号码",
      prop: "phone",
      minWidth: 120
    },
    {
      label: "邮箱",
      prop: "email",
      minWidth: 150
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 90,
      cellRenderer: ({ row }) => {
        // 根据身份显示不同的状态文本
        let statusText = "";
        if (row.identity === 3) {
          // 学生：在读/毕业
          statusText = row.status === 1 ? "在读" : "毕业";
        } else if (row.identity === 2) {
          // 教师：在职/离职
          statusText = row.status === 1 ? "在职" : "离职";
        } else {
          // 管理员：在读/在职 和 毕业/离职
          statusText = row.status === 1 ? "在读/在职" : "毕业/离职";
        }

        return <span>{statusText}</span>;
      }
    },
    {
      label: "是否启用",
      prop: "isActive",
      minWidth: 90,
      cellRenderer: ({ row }) => <span>{row.isActive ? "启用" : "禁用"}</span>
    },
    {
      label: "操作",
      fixed: "right",
      width: 240,
      slot: "operation"
    }
  ];

  async function exportAllExcel() {
    // 导出时使用当前搜索参数，但不限制分页
    const exportParams = { ...toRaw(searchFormParams) };
    delete exportParams.pageNum;
    delete exportParams.pageSize;
    exportUserExcelApi(exportParams, "用户列表.xls");
  }

  async function handleAdd(row, done) {
    await addUserApi(row as CreateUserRequest).then(() => {
      message(`您新增了用户${row.username}的这条数据`, {
        type: "success"
      });
      // 关闭弹框
      done();
      // 刷新列表
      getList();
    });
  }

  async function handleUpdate(row, done) {
    await updateUserApi(row.id, row as UpdateUserRequest).then(() => {
      message(`您修改了用户${row.username}的这条数据`, {
        type: "success"
      });
      // 关闭弹框
      done();
      // 刷新列表
      getList();
    });
  }

  async function handleUpdateWithId(
    userId: number,
    data: UpdateUserRequest,
    done
  ) {
    await updateUserApi(userId, data).then(() => {
      message(`您修改了用户的数据`, {
        type: "success"
      });
      // 关闭弹框
      done();
      // 刷新列表
      getList();
    });
  }

  async function handleDelete(row) {
    await deleteUserApi(row.id).then(() => {
      message(`您删除了用户${row.username}的这条数据`, { type: "success" });
      // 刷新列表
      getList();
    });
  }

  async function handleResetPassword(row, request, done) {
    await updateUserPasswordApi(request).then(() => {
      message(`您修改了用户${row.username}的密码`, { type: "success" });
      // 刷新列表
      done();
      getList();
    });
  }

  async function onSearch() {
    // 点击搜索的时候 需要重置分页
    pagination.currentPage = 1;
    getList();
  }

  async function openDialog(title = "新增", row?: UserListItem) {
    // TODO 如果是编辑的话  通过获取用户详情接口来获取数据
    addDialog({
      title: `${title}用户`,
      props: {
        formInline: {
          id: row?.id ?? 0,
          studentNumber: row?.studentNumber ?? "",
          username: row?.username ?? "",
          realName: row?.realName ?? "",
          englishName: row?.englishName ?? "",
          gender: row?.gender ?? 0,
          identity: row?.identity ?? 3,
          academicStatus: row?.academicStatus ?? undefined,
          phone: row?.phone ?? "",
          email: row?.email ?? "",
          password: title == "新增" ? "" : undefined,
          status: row?.status ?? 1,
          isActive: row?.isActive ?? true,
          researchArea: row?.researchArea ?? "",
          enrollmentYear: row?.enrollmentYear ?? undefined,
          graduationYear: row?.graduationYear ?? undefined,
          graduationDest: row?.graduationDest ?? "",
          photo: row?.photo ?? "",
          resume: row?.resume ?? "",
          homepageUrl: row?.homepageUrl ?? "",
          orcid: row?.orcid ?? ""
        }
      },

      width: "40%",
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

        // 转换为API所需的格式
        let curData: CreateUserRequest | UpdateUserRequest;

        if (title === "新增") {
          curData = {
            studentNumber: formData.studentNumber,
            username: formData.username,
            realName: formData.realName,
            englishName: formData.englishName,
            password: formData.password,
            gender: formData.gender,
            identity: formData.identity,
            academicStatus: formData.academicStatus,
            researchArea: formData.researchArea,
            phone: formData.phone,
            email: formData.email,
            status: formData.status,
            enrollmentYear: formData.enrollmentYear,
            graduationYear: formData.graduationYear,
            graduationDest: formData.graduationDest,
            resume: formData.resume,
            homepageUrl: formData.homepageUrl,
            orcid: formData.orcid,
            isActive: formData.isActive
          } as CreateUserRequest;
        } else {
          curData = {
            studentNumber: formData.studentNumber,
            realName: formData.realName,
            englishName: formData.englishName,
            gender: formData.gender,
            identity: formData.identity,
            academicStatus: formData.academicStatus,
            status: formData.status,
            isActive: formData.isActive,
            phone: formData.phone,
            email: formData.email,
            researchArea: formData.researchArea,
            enrollmentYear: formData.enrollmentYear,
            graduationYear: formData.graduationYear,
            graduationDest: formData.graduationDest,
            resume: formData.resume,
            homepageUrl: formData.homepageUrl,
            orcid: formData.orcid
          } as UpdateUserRequest;
        }

        formRuleRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            if (title === "新增") {
              handleAdd(curData, done);
            } else {
              // 编辑时需要传递userId
              const userId = formData.id;
              if (!userId || userId === 0) {
                message("用户ID不能为空", { type: "error" });
                return;
              }
              handleUpdateWithId(userId, curData, done);
            }
          }
        });
      }
    });
  }

  async function openResetPasswordDialog(row) {
    const passwordFormRef = ref();
    addDialog({
      title: `重置密码`,
      props: {
        formInline: {
          user_id: row.id ?? 0,
          password: ""
        }
      },
      width: "30%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: ({ options }) =>
        h(passwordForm, {
          ref: passwordFormRef,
          ...options.props
        }),
      beforeSure: (done, { options }) => {
        const formRuleRef = passwordFormRef.value.getFormRuleRef();
        const curData = options.props.formInline as PasswordRequest;

        formRuleRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            handleResetPassword(row, curData, done);
          }
        });
      }
    });
  }

  async function openUploadDialog() {
    const uploadFormRef = ref();
    addDialog({
      title: `导入用户`,
      props: {},
      width: "30%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(uploadForm, { ref: uploadFormRef }),
      beforeSure: done => {
        const uploadRef = uploadFormRef.value.getUploadRef();
        uploadRef.submit();
        done();
      }
    });
  }

  async function getList() {
    pageLoading.value = true;
    // 更新分页参数
    searchFormParams.pageNum = pagination.currentPage;
    searchFormParams.pageSize = pagination.pageSize;

    const { data } = await getUserListApi(toRaw(searchFormParams));
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
    exportAllExcel,
    resetForm,
    handleUpdate,
    getList,
    handleDelete,
    openResetPasswordDialog,
    openUploadDialog
  };
}
