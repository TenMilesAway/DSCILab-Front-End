<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import MemberInfo from "./MemberInfo.vue";
import { ElMessage } from "element-plus";
import {
  getMembersListApi,
  getMemberDetailApi,
  type ApiUser
} from "@/api/lab/members";
import {
  getAchievementsListApi,
  type ApiAchievement
} from "@/api/lab/achievements";
import {
  getProjectsListApi,
  type ApiProject
} from "@/api/lab/projects";

defineOptions({
  name: "MembersPage"
});

interface Member {
  id: number;
  name: string;
  englishName?: string; // 英文名
  gender?: number; // 性别
  resume?: string; // 个人简述
  phone?: string; // 手机号
  title: string;
  graduation?: string; // 毕业去向（可选，仅已毕业学生有）
  category: string; // 新增分类字段
  email?: string; // 邮箱
  photo?: string; // 头像
  researchArea?: string; // 研究方向
  enrollmentYear?: number; // 入学年份
  graduationYear?: number; // 毕业年份
  homepageUrl?: string; // 个人主页
  orcid?: string; // ORCID
  identity?: string; // 身份标识
  academicStatus?: number; // 学术状态
}

// API相关接口定义已移至 @/api/lab/members

interface Props {
  title?: string;
  subtitle?: string;
  members?: Member[];
}

interface CategoryGroup {
  name: string;
  key: string;
  members: Member[];
}

const props = withDefaults(defineProps<Props>(), {
  title: "团队成员",
  subtitle: "我们拥有一支专业的研究团队"
});

const activeCategory = ref<string>("directors"); // 默认选中负责人
const searchKeyword = ref<string>(""); // 搜索关键词

// 获取实际使用的成员数据
// API获取的成员数据
const apiMembers = ref<Member[]>([]);
const loading = ref(false);
// 模拟加载开关
const simulateLoading = ref(false);


// API获取的成果数据
const apiAchievements = ref<ApiAchievement[]>([]);
// API获取的项目数据
const apiProjects = ref<ApiProject[]>([]);

// 获取实际使用的成员数据
const actualMembers = computed(() => {
  if (apiMembers.value.length > 0) {
    return apiMembers.value;
  }
  return props.members || [];
});

// 学术状态映射
const convertAcademicStatusToCategory = (academicStatus: number): string => {
  const statusMap: Record<number, string> = {
    1: "directors", // 负责人
    2: "teachers", // 教师
    3: "phd_students", // 博士生
    4: "master_students", // 硕士生
    5: "undergraduate_students", // 本科生
    6: "graduates" // 已毕业学生
  };
  return statusMap[academicStatus] || "graduates";
};

// 原有的学术状态映射
const getAcademicStatusTitle = (
  academicStatus: number | null,
  enrollmentYear?: number
): string => {
  const statusMap: Record<number, string> = {
    0: "实验室负责人",
    1: "教授",
    2: "副教授",
    3: "讲师",
    4: "博士生",
    5: "硕士生",
    6: "本科生"
  };

  if (academicStatus === null) return "其他";

  const baseTitle = statusMap[academicStatus] || "其他";

  // 对于学生身份（博士生、硕士生、本科生），如果有入学年份则加上年级
  if (
    (academicStatus === 4 || academicStatus === 5 || academicStatus === 6) &&
    enrollmentYear
  ) {
    return `${enrollmentYear} 级${baseTitle}`;
  }

  return baseTitle;
};

// 根据职称获取颜色
const getTitleColor = (academicStatus: number | null, hasGraduation: boolean): string => {
  // 已毕业学生使用明亮的橙色
  if (hasGraduation) {
    return "#ff6b35"; // 明亮的橙色
  }

  // 根据职级层次设置颜色，从深到浅
  const colorMap: Record<number, string> = {
    0: "#8b0000", // 实验室负责人 - 深红色
    1: "#dc2626", // 教授 - 红色
    2: "#ea580c", // 副教授 - 橙红色
    3: "#d97706", // 讲师 - 橙色
    4: "#059669", // 博士生 - 绿色
    5: "#0891b2", // 硕士生 - 青色
    6: "#7c3aed"  // 本科生 - 紫色
  };

  return colorMap[academicStatus || 6] || "#6b7280"; // 默认灰色
};

// 根据学术状态确定分类
const getCategoryByAcademicStatus = (
  academicStatus: number | null,
  graduationDest: string
): string => {
  // 如果有毕业去向，归类为已毕业学生
  if (graduationDest && graduationDest.trim()) {
    return "graduates";
  }

  if (academicStatus === null) return "teachers";

  switch (academicStatus) {
    case 0:
      return "directors"; // 实验室负责人
    case 1:
    case 2:
    case 3:
      return "teachers"; // 教授、副教授、讲师
    case 4:
      return "phd_students"; // 博士生
    case 5:
      return "master_students"; // 硕士生
    case 6:
      return "undergraduate_students"; // 本科生
  }
};

// 从API获取成员数据
const fetchMembersFromApi = async () => {
  loading.value = true;
  try {
    // 如果开启模拟加载，添加延迟来展示加载动画
    if (simulateLoading.value) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3秒延迟
    }

    const result = await getMembersListApi();

    if (result.code === 0 && result.data && result.data.rows) {
      // 处理所有用户数据，过滤掉教师中身份为"其他"的数据
      const processedMembers = result.data.rows.map((user: ApiUser) => {
        const category = getCategoryByAcademicStatus(
          user.academicStatus,
          user.graduationDest
        );
        const title = getAcademicStatusTitle(
          user.academicStatus,
          user.enrollmentYear
        );

        return {
          id: user.id,
          name: user.realName,
          title:
            user.graduationDest && user.graduationDest.trim()
              ? `${title}`
              : title,
          graduation:
            user.graduationDest && user.graduationDest.trim()
              ? user.graduationDest
              : undefined,
          category,
          originalTitle: title,
          academicStatus: user.academicStatus
        };
      });

      // 过滤掉教师分类中身份为"其他"的数据
      apiMembers.value = processedMembers.filter(
        member =>
          !(member.category === "teachers" && member.originalTitle === "其他")
      );
    } else {
      throw new Error("API返回数据格式错误");
    }
  } catch (error) {
    console.error("获取成员数据失败:", error);
    ElMessage.error("获取成员数据失败");
    // 如果API请求失败，显示空列表
  } finally {
    loading.value = false;
  }
};

// 分类配置
const categories = [
  { key: "directors", name: "负责人" },
  { key: "teachers", name: "教师" },
  { key: "phd_students", name: "博士生" },
  { key: "master_students", name: "硕士生" },
  { key: "undergraduate_students", name: "本科生" },
  { key: "graduates", name: "已毕业学生" }
];

// 组件挂载时获取API数据
// 从API获取成果数据
const fetchAchievementsFromApi = async () => {
  try {
    const result = await getAchievementsListApi({ type: 1 });

    if (result.code === 0 && result.data && result.data.rows) {
      apiAchievements.value = result.data.rows;
      console.log("成果数据获取成功:", apiAchievements.value.length, "条记录");
    } else {
      console.error("获取成果数据失败:", result.msg);
      ElMessage.error("获取成果数据失败：" + result.msg);
    }
  } catch (error) {
    console.error("获取成果数据异常:", error);
    ElMessage.error("获取成果数据失败，请稍后重试");
  }
};

// 从API获取项目数据
const fetchProjectsFromApi = async () => {
  try {
    const result = await getProjectsListApi({ type: 2 });

    if (result.code === 0 && result.data && result.data.rows) {
      apiProjects.value = result.data.rows;
      console.log("项目数据获取成功:", apiProjects.value.length, "条记录");
    } else {
      console.error("获取项目数据失败:", result.msg);
      ElMessage.error("获取项目数据失败：" + result.msg);
    }
  } catch (error) {
    console.error("获取项目数据异常:", error);
    ElMessage.error("获取项目数据失败，请稍后重试");
  }
};

onMounted(() => {
  fetchMembersFromApi();
  fetchAchievementsFromApi();
  fetchProjectsFromApi();
});

// 获取当前选中分类的成员
const currentCategoryMembers = computed(() => {
  let filteredMembers = actualMembers.value.filter(
    member => member.category === activeCategory.value
  );

  // 如果有搜索关键词，进行模糊搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase();
    filteredMembers = filteredMembers.filter(
      member =>
        member.name.toLowerCase().includes(keyword) ||
        member.title.toLowerCase().includes(keyword) ||
        (member.graduation && member.graduation.toLowerCase().includes(keyword))
    );
  }

  return filteredMembers;
});

// 按类别分组成员（用于左侧导航显示统计）
const _groupedMembers = computed<CategoryGroup[]>(() => {
  return categories
    .map(category => ({
      name: category.name,
      key: category.key,
      members: actualMembers.value.filter(
        member => member.category === category.key
      )
    }))
    .filter(group => group.members.length > 0);
});

// 详情显示状态管理
const showDetailView = ref(false);
const detailLoading = ref(false);
const selectedMember = ref<Member | null>(null);
const selectedMemberAchievements = ref<ApiAchievement[]>([]);
const selectedMemberProjects = ref<ApiProject[]>([]);
// 滚动位置记忆
const savedScrollPosition = ref(0);

// 根据用户姓名筛选成果数据
const filterAchievementsByUserName = (userName: string): ApiAchievement[] => {
  return apiAchievements.value
    .filter(achievement => {
      // 检查authors字段中是否有匹配的用户姓名
      if (achievement.authors && Array.isArray(achievement.authors)) {
        return achievement.authors.some(author => {
          // 根据姓名匹配（支持模糊匹配）
          return author.name && author.name.includes(userName);
        });
      }
      return false;
    })
    .filter(achievement => {
      // 根据status字段过滤（假设status=1表示可见）
      return achievement.status === undefined || achievement.status === 1;
    });
};

// 根据用户姓名筛选项目数据
const filterProjectsByUserName = (userName: string): ApiProject[] => {
  return apiProjects.value
    .filter(project => {
      // 检查authors字段中是否有匹配的用户姓名
      if (project.authors && Array.isArray(project.authors)) {
        return project.authors.some(author => {
          // 根据姓名匹配（支持模糊匹配）
          return author.name && author.name.includes(userName);
        });
      }
      return false;
    })
    .filter(project => {
      // 根据status字段过滤（假设status=1表示可见）
      return project.status === undefined || project.status === 1;
    });
};

const showMemberDetail = async (member: Member) => {
  try {
    // 保存当前滚动位置
    savedScrollPosition.value =
      window.pageYOffset || document.documentElement.scrollTop;

    // 开始加载
    detailLoading.value = true;
    showDetailView.value = true;

    // 滚动到页面顶部
    nextTick(() => {
      window.scrollTo({ top: 0 });
    });

    // 调用接口获取完整的成员详情
    const response = await getMemberDetailApi(member.id);

    if (response.code === 0) {
      // 将API返回的数据转换为Member格式
      const detailMember: Member = {
        id: response.data.id,
        name: response.data.realName,
        englishName: response.data.englishName,
        gender: response.data.gender ? Number(response.data.gender) : undefined,
        resume: response.data.resume,
        phone: response.data.phone,
        title: response.data.identity || "未知",
        graduation: response.data.graduationDest,
        category: convertAcademicStatusToCategory(response.data.academicStatus),
        email: response.data.email,
        photo: response.data.photo,
        researchArea: response.data.researchArea,
        enrollmentYear: response.data.enrollmentYear,
        graduationYear: response.data.graduationYear,
        homepageUrl: response.data.homepageUrl,
        orcid: response.data.orcid,
        identity: response.data.identity,
        academicStatus: response.data.academicStatus
      };

      // 筛选该用户相关的成果数据
      const userAchievements = filterAchievementsByUserName(detailMember.name);
      console.log(
        `为用户 ${detailMember.name} 筛选到 ${userAchievements.length} 条成果记录`
      );

      // 筛选该用户相关的项目数据
      const userProjects = filterProjectsByUserName(detailMember.name);
      console.log(
        `为用户 ${detailMember.name} 筛选到 ${userProjects.length} 条项目记录`
      );

      selectedMember.value = detailMember;
      selectedMemberAchievements.value = userAchievements;
      selectedMemberProjects.value = userProjects;
      
      // 加载完成
      detailLoading.value = false;
    } else {
      ElMessage.error("获取成员详情失败：" + response.msg);
      detailLoading.value = false;
    }
  } catch (error) {
    console.error("获取成员详情失败:", error);
    ElMessage.error("获取成员详情失败，请稍后重试");
    detailLoading.value = false;
  }
};

const hideDetailView = () => {
  showDetailView.value = false;
  detailLoading.value = false;
  selectedMember.value = null;
  selectedMemberAchievements.value = [];
  selectedMemberProjects.value = [];
  // 恢复之前的滚动位置
  nextTick(() => {
    window.scrollTo({ top: savedScrollPosition.value });
  });
};

// 选择分类
const selectCategory = (categoryKey: string) => {
  activeCategory.value = categoryKey;
};

// 获取分类名称
const getCategoryName = (categoryKey: string) => {
  const category = categories.find(cat => cat.key === categoryKey);
  return category?.name || "其他";
};
</script>

<template>
  <div class="members-page">
    <!-- 成员列表视图 -->
    <div v-if="!showDetailView" class="members-container">
      <!-- 左侧导航索引 -->
      <div class="members-sidebar">
        <div class="sidebar-header">
          <h3>成员分类</h3>
        </div>
        <div class="category-nav">
          <div
            v-for="category in categories"
            :key="category.key"
            class="nav-item"
            :class="{ active: activeCategory === category.key }"
            @click="selectCategory(category.key)"
          >
            <span class="nav-text">{{ category.name }}</span>
            <span class="nav-count"
              >({{
                actualMembers.filter(m => m.category === category.key).length
              }})</span
            >
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="members-content">
        <div class="category-header">
          <h3>
            {{ getCategoryName(activeCategory) }}
            <span class="category-count"
              >({{ currentCategoryMembers.length }}人)</span
            >
          </h3>
          <div class="search-container">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索成员姓名、身份或毕业去向"
              :prefix-icon="Search"
              clearable
              class="search-input"
            />
            <!-- <div class="loading-switch-container">
              <el-switch
                v-model="simulateLoading"
                active-text="模拟加载"
                inactive-text="正常加载"
                active-color="#409EFF"
                inactive-color="#C0C4CC"
                @change="fetchMembersFromApi"
              />
            </div> -->
          </div>
        </div>

        <div class="members-list">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <div class="loading-animation">
              <div class="loading-dots">
                <div class="dot" />
                <div class="dot" />
                <div class="dot" />
              </div>
              <div class="loading-text">
                <span class="loading-char">正</span>
                <span class="loading-char">在</span>
                <span class="loading-char">加</span>
                <span class="loading-char">载</span>
                <span class="loading-char">成</span>
                <span class="loading-char">员</span>
                <span class="loading-char">数</span>
                <span class="loading-char">据</span>
                <span class="loading-char">.</span>
                <span class="loading-char">.</span>
                <span class="loading-char">.</span>
              </div>
            </div>
            <!-- 骨架屏 -->
            <div class="skeleton-cards">
              <div v-for="i in 6" :key="i" class="skeleton-card">
                <div class="skeleton-avatar" />
                <div class="skeleton-content">
                  <div class="skeleton-line skeleton-name" />
                  <div class="skeleton-line skeleton-title" />
                </div>
              </div>
            </div>
          </div>

          <!-- 成员列表 -->
          <div v-if="!loading" class="member-cards-container">
            <div
              v-for="member in currentCategoryMembers"
              :key="member.id"
              class="member-card"
              @click="showMemberDetail(member)"
            >
              <div class="member-info">
                <span class="member-field member-name">{{ member.name }}</span>
                <span 
                  class="member-field member-title"
                  :style="{ color: getTitleColor(member.academicStatus, !!(member.graduation && member.graduation.trim())) }"
                >{{
                  member.title
                }}</span>
                <span
                  v-if="member.graduation"
                  class="member-field member-graduation"
                  >毕业去向：{{ member.graduation }}</span
                >
              </div>
              <div class="member-action">
                <span class="view-detail">查看详情</span>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div
            v-if="!loading && currentCategoryMembers.length === 0"
            class="empty-state"
          >
            <p>暂无{{ getCategoryName(activeCategory) }}数据</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情页面加载动画 -->
    <div v-else-if="showDetailView && detailLoading" class="detail-loading-overlay">
      <div class="detail-loading-container">
        <div class="loading-spinner-detail">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <div class="loading-text-detail">
          <span class="loading-char">正</span>
          <span class="loading-char">在</span>
          <span class="loading-char">加</span>
          <span class="loading-char">载</span>
          <span class="loading-char">成</span>
          <span class="loading-char">员</span>
          <span class="loading-char">详</span>
          <span class="loading-char">情</span>
          <span class="loading-char">.</span>
          <span class="loading-char">.</span>
          <span class="loading-char">.</span>
        </div>
      </div>
    </div>

    <!-- 成员详情视图 -->
    <MemberInfo
      v-else-if="showDetailView && !detailLoading"
      :member="{
        ...selectedMember,
        identity: selectedMember?.identity
          ? Number(selectedMember.identity)
          : undefined
      }"
      :achievements="selectedMemberAchievements"
      :projects="selectedMemberProjects"
      @back="hideDetailView"
    />
  </div>
</template>

<style scoped lang="scss">
@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0) translateY(0);
  }

  40% {
    transform: scale(1) translateY(-20px);
  }
}

@keyframes wave {
  0%,
  60%,
  100% {
    color: #64748b;
    transform: translateY(0);
  }

  30% {
    color: #3b82f6;
    transform: translateY(-10px);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

@media (width <= 480px) {
  .members-page {
    padding: 20px 8px;
  }

  .members-container {
    padding-left: 0;
    gap: 12px;
    align-items: center;
  }

  .members-sidebar {
    max-width: 400px;
    margin: 0 auto;
    padding: 12px;
    border-radius: 12px;

    .sidebar-header {
      margin-bottom: 12px;
      
      h3 {
        font-size: 1rem;
        text-align: center;
      }
    }

    .category-nav {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      justify-content: center;
    }

    .nav-item {
      padding: 8px 10px;
      font-size: 12px;
      border-radius: 8px;
      min-height: 36px;
      justify-content: center;
      text-align: center;
      
      .nav-text {
        font-weight: 500;
      }

      .nav-count {
        font-size: 10px;
        margin-left: 4px;
      }
      
      &:hover {
        transform: none;
      }
      
      &.active {
        font-size: 12px;
      }
    }
  }

  .members-content {
    .category-header {
      margin-bottom: 16px;
      
      h3 {
        font-size: 1.2rem;
        
        .category-count {
          font-size: 0.9rem;
        }
      }
      
      .search-container {
        .search-input {
          font-size: 14px;
        }
      }
    }
  }

  .member-card {
    padding: 12px;
    border-radius: 10px;
    
    &:hover {
      transform: none;
    }

    .member-info {
      gap: 6px;
      margin-bottom: 8px;

      .member-name {
        font-size: 15px;
        font-weight: 600;
      }

      .member-title {
        font-size: 13px;
      }

      .member-graduation {
        font-size: 12px;
        padding: 3px 6px;
      }
    }

    .member-action {
      .view-detail {
        font-size: 11px;
        padding: 4px 8px;
      }
    }
  }
}

@media (width <= 360px) {
  .members-page {
    padding: 16px 6px;
  }

  .members-sidebar {
    max-width: 320px;
    margin: 0 auto;
    padding: 10px;
    
    .sidebar-header {
      h3 {
        font-size: 0.95rem;
        text-align: center;
      }
    }
    
    .category-nav {
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      justify-content: center;
    }
    
    .nav-item {
      padding: 6px 8px;
      font-size: 11px;
      min-height: 32px;
      
      .nav-count {
        font-size: 9px;
      }
    }
  }

  .members-content {
    .category-header {
      h3 {
        font-size: 1.1rem;
        
        .category-count {
          font-size: 0.85rem;
        }
      }
    }
  }

  .member-card {
    padding: 10px;

    .member-info {
      .member-name {
        font-size: 14px;
      }

      .member-title {
        font-size: 12px;
      }

      .member-graduation {
        font-size: 11px;
        padding: 2px 5px;
      }
    }
    
    .member-action {
      .view-detail {
        font-size: 10px;
        padding: 3px 6px;
      }
    }
  }
}

/* 详情页面加载动画样式 */
.detail-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.detail-loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.loading-spinner-detail {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin-detail 2s linear infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #3b82f6;
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  border-right-color: #8b5cf6;
  animation-delay: -0.4s;
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
}

.spinner-ring:nth-child(3) {
  border-bottom-color: #06b6d4;
  animation-delay: -0.8s;
  width: 40%;
  height: 40%;
  top: 30%;
  left: 30%;
}

.loading-text-detail {
  display: flex;
  gap: 2px;
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
}

.loading-char {
  animation: wave-detail 1.5s ease-in-out infinite;
  animation-fill-mode: both;
}

.loading-char:nth-child(1) { animation-delay: 0.1s; }
.loading-char:nth-child(2) { animation-delay: 0.2s; }
.loading-char:nth-child(3) { animation-delay: 0.3s; }
.loading-char:nth-child(4) { animation-delay: 0.4s; }
.loading-char:nth-child(5) { animation-delay: 0.5s; }
.loading-char:nth-child(6) { animation-delay: 0.6s; }
.loading-char:nth-child(7) { animation-delay: 0.7s; }
.loading-char:nth-child(8) { animation-delay: 0.8s; }
.loading-char:nth-child(9) { animation-delay: 0.9s; }
.loading-char:nth-child(10) { animation-delay: 1.0s; }
.loading-char:nth-child(11) { animation-delay: 1.1s; }

@keyframes spin-detail {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes wave-detail {
  0%, 60%, 100% {
    transform: translateY(0);
    color: #64748b;
  }
  30% {
    transform: translateY(-10px);
    color: #3b82f6;
  }
}

/* 成员详情相关样式已移至 MemberInfo.vue 组件 */

/* 超小屏幕优化 (320px及以下) */
@media (width <= 320px) {
  .members-page {
    padding: 12px 4px;
  }

  .members-sidebar {
    max-width: 280px;
    margin: 0 auto;
    padding: 8px;
    
    .sidebar-header {
      margin-bottom: 8px;
      
      h3 {
        font-size: 0.9rem;
        text-align: center;
      }
    }
    
    .category-nav {
      grid-template-columns: 1fr;
      gap: 4px;
      justify-content: center;
    }
    
    .nav-item {
      padding: 8px 6px;
      font-size: 10px;
      min-height: 28px;
      
      .nav-count {
        font-size: 8px;
      }
    }
  }

  .members-content {
    .category-header {
      h3 {
        font-size: 1rem;
        
        .category-count {
          font-size: 0.8rem;
        }
      }
    }
  }

  .member-card {
    padding: 8px;
    min-height: 50px;

    .member-info {
      .member-name {
        font-size: 13px;
      }

      .member-title {
        font-size: 11px;
      }

      .member-graduation {
        font-size: 10px;
        padding: 2px 4px;
      }
    }
    
    .member-action {
      .view-detail {
        font-size: 9px;
        padding: 2px 4px;
      }
    }
  }
}

/* 响应式调整 */
@media (width <= 1024px) {
  .members-container {
    flex-direction: column;
    gap: 20px;
    padding: 0 15px;
    align-items: center;
  }

  .members-sidebar {
    position: static;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 18px;
    border-radius: 16px;

    .sidebar-header {
      margin-bottom: 18px;
      
      h3 {
        font-size: 1.2rem;
        text-align: center;
      }
    }

    .category-nav {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      justify-content: center;
    }

    .nav-item {
      justify-content: center;
      text-align: center;
      min-width: auto;
      padding: 12px 16px;
      font-size: 14px;
      border-radius: 12px;
      
      .nav-text {
        font-weight: 500;
      }
      
      .nav-count {
        font-size: 12px;
        margin-left: 6px;
      }
      
      &:hover {
        transform: translateY(-2px);
      }
      
      &.active {
        transform: translateY(-1px);
      }
    }
  }

  /* 中等分辨率优化 */
  @media (width <= 900px) and (width > 768px) {
    .members-sidebar {
      .category-nav {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }

      .nav-item {
        justify-content: center;
        text-align: center;
        min-width: auto;
        padding: 12px 10px;
        font-size: 14px;
        
        .nav-text {
          font-weight: 500;
        }
        
        .nav-count {
          font-size: 12px;
          margin-left: 4px;
        }
      }
    }
  }

  .members-content {
    .members-list {
      gap: 10px;
    }
  }

  .members-header h2 {
    font-size: 2rem;
  }
}

@media (width <= 768px) {
  .members-page {
    padding: 40px 12px;
  }

  .members-container {
    gap: 16px;
    align-items: center;
  }

  .members-sidebar {
    max-width: 600px;
    margin: 0 auto;
    padding: 16px;
    border-radius: 14px;

    .sidebar-header {
      margin-bottom: 16px;
      
      h3 {
        font-size: 1.1rem;
        text-align: center;
      }
    }

    .category-nav {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      justify-content: center;
    }

    .nav-item {
      justify-content: center;
      text-align: center;
      min-width: auto;
      padding: 10px 8px;
      font-size: 13px;
      border-radius: 10px;
      
      .nav-text {
        font-weight: 500;
      }
      
      .nav-count {
        font-size: 11px;
        margin-left: 4px;
      }
      
      &:hover {
        transform: translateY(-2px);
      }
    }
  }

  .members-content {
    .category-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 20px;

      h3 {
        font-size: 1.4rem;
        
        .category-count {
          font-size: 1rem;
        }
      }

      .search-container {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
        width: 100%;

        .search-input {
          width: 100%;
          font-size: 15px;
        }

        .loading-switch-container {
          justify-content: center;
        }
      }
    }
  }

  .member-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px;
    border-radius: 12px;
    
    &:hover {
      transform: translateY(-2px);
    }

    .member-info {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
      width: 100%;
      margin-bottom: 10px;

      .member-field {
        width: 100%;
        padding-right: 0;
        white-space: normal;
      }

      .member-name {
        margin-bottom: 4px;
        font-size: 16px;
        font-weight: 600;
      }

      .member-title {
        margin-bottom: 4px;
        font-size: 14px;
      }

      .member-graduation {
        font-size: 13px;
        padding: 4px 8px;
        border-radius: 8px;
        align-self: flex-start;
      }
    }

    .member-action {
      align-self: flex-end;
      
      .view-detail {
        padding: 6px 12px;
        font-size: 13px;
        border-radius: 8px;
      }
    }
  }
}

.members-page {
  min-height: 100vh;
  padding: 80px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
}

.members-header {
  margin-bottom: 40px;
  text-align: center;

  h2 {
    margin-bottom: 16px;
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e293b;
    text-shadow: 0 2px 4px rgb(148 163 184 / 30%);
  }

  p {
    font-size: 1.2rem;
    color: #475569;
    opacity: 0.9;
  }
}

.members-container {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  padding: 0 20px;
  margin: 0 auto;
}

/* 左侧导航栏样式 */
.members-sidebar {
  position: static; /* 彻底移除sticky定位，避免缩放问题 */
  width: 280px;
  padding: 24px;
  background: rgb(248 250 252 / 95%);
  backdrop-filter: blur(15px);
  border: 1px solid rgb(226 232 240 / 30%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgb(148 163 184 / 15%);

  /* 桌面端保持固定定位 */
  @media (width > 1024px) {
    position: sticky;
    top: 100px;
  }

  .sidebar-header {
    margin-bottom: 20px;

    h3 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #1e293b;
      text-align: center;
    }
  }

  .category-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    background: rgb(255 255 255 / 50%);
    border-radius: 12px;
    transition: all 0.3s ease;
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
    user-select: none; /* 防止文本选择 */

    &:hover {
      background: rgb(59 130 246 / 10%);
      transform: translateX(4px);
    }
    
    /* 移动端触摸反馈 */
    @media (hover: none) and (pointer: coarse) {
      &:active {
        background: rgb(59 130 246 / 15%);
        transform: scale(0.98);
      }
      
      &:hover {
        transform: none;
      }
    }

    &.active {
      color: white;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      box-shadow: 0 4px 12px rgb(59 130 246 / 30%);
      
      /* 移动端激活状态优化 */
      @media (hover: none) and (pointer: coarse) {
        &:active {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: scale(0.98);
        }
      }
    }

    .nav-text {
      flex: 1;
      font-weight: 500;
    }

    .nav-count {
      font-size: 0.85rem;
      opacity: 0.8;
    }
  }
}

/* 右侧内容区域样式 */
.members-content {
  flex: 1;
  width: 100%;
  min-width: 0;

  .category-section {
    margin-bottom: 50px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;

    h3 {
      display: flex;
      align-items: center;
      margin: 0;
      font-size: 1.8rem;
      font-weight: 600;
      color: #1e293b;

      .category-count {
        margin-left: 8px;
        font-size: 1rem;
        font-weight: 400;
        color: #64748b;
      }
    }

    .search-container {
      display: flex;
      gap: 20px;
      align-items: center;

      .search-input {
        width: 280px;
      }

      .loading-switch-container {
        display: flex;
        align-items: center;
        white-space: nowrap;
      }
    }
  }

  .members-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: none;
  }
}

.member-card {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 60px;
  padding: 16px 20px;
  cursor: pointer;
  background: rgb(248 250 252 / 95%);
  backdrop-filter: blur(15px);
  border: 1px solid rgb(226 232 240 / 30%);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgb(148 163 184 / 10%);
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
  user-select: none; /* 防止文本选择 */

  &:hover {
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 8px 24px rgb(148 163 184 / 20%);
    transform: translateX(4px);
  }
  
  /* 移动端触摸反馈 */
  @media (hover: none) and (pointer: coarse) {
    &:active {
      background: rgb(255 255 255 / 90%);
      transform: scale(0.98);
      box-shadow: 0 2px 8px rgb(148 163 184 / 15%);
    }
    
    &:hover {
      transform: none;
    }
  }
}

.member-info {
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: 0;
  align-items: center;

  .member-field {
    overflow: hidden;
    font-size: 14px;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;

    &::before {
      display: none;
      content: attr(class);
    }
  }

  .member-name {
    flex: 0 0 25%;
    min-width: 120px;
    padding-right: 15px;
    font-weight: 600;
    color: #2c3e50;
  }

  .member-title {
    flex: 1;
    min-width: 150px;
    padding-right: 15px;
    font-weight: 500;
    /* 颜色由动态样式控制 */
  }

  .member-graduation {
    flex: 0 0 30%;
    min-width: 150px;
    padding: 4px 8px;
    font-size: 13px;
    color: #27ae60;
    text-align: center;
    background: rgb(39 174 96 / 10%);
    border-radius: 6px;
  }
}

.member-action {
  flex: 0 0 auto;
  margin-left: 15px;

  .view-detail {
    padding: 6px 12px;
    font-size: 0.9rem;
    color: #64748b;
    white-space: nowrap;
    background: rgb(100 116 139 / 10%);
    border-radius: 6px;
    opacity: 0.7;
    transition: all 0.3s ease;
  }

  .member-card:hover & .view-detail {
    color: #3b82f6;
    background: rgb(59 130 246 / 10%);
    opacity: 1;
  }
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  p {
    margin-top: 16px;
    font-size: 1rem;
    color: #64748b;
  }
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.loading-dots {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  background: linear-gradient(45deg, #4ecdc4, #44bd87);
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  background: linear-gradient(45deg, #45b7d1, #96ceb4);
  animation-delay: 0s;
}

.loading-text {
  display: flex;
  gap: 2px;
}

.loading-char {
  display: inline-block;
  font-weight: 500;
  color: #64748b;
  animation: wave 2s ease-in-out infinite;
}

.loading-char:nth-child(1) {
  animation-delay: 0s;
}

.loading-char:nth-child(2) {
  animation-delay: 0.1s;
}

.loading-char:nth-child(3) {
  animation-delay: 0.2s;
}

.loading-char:nth-child(4) {
  animation-delay: 0.3s;
}

.loading-char:nth-child(5) {
  animation-delay: 0.4s;
}

.loading-char:nth-child(6) {
  animation-delay: 0.5s;
}

.loading-char:nth-child(7) {
  animation-delay: 0.6s;
}

.loading-char:nth-child(8) {
  animation-delay: 0.7s;
}

.loading-char:nth-child(9) {
  animation-delay: 0.8s;
}

.loading-char:nth-child(10) {
  animation-delay: 0.9s;
}

.loading-char:nth-child(11) {
  animation-delay: 1s;
}

/* 骨架屏样式 */
.skeleton-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 800px;
}

.skeleton-card {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: rgb(248 250 252 / 95%);
  border-radius: 12px;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  margin-right: 16px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  border-radius: 50%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-name {
  width: 80px;
  height: 16px;
}

.skeleton-title {
  width: 120px;
}

/* 成员列表过渡动画 */
.member-cards-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  p {
    font-size: 1rem;
    color: #94a3b8;
    opacity: 0.8;
  }
}
</style>
