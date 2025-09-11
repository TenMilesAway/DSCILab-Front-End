<template>
  <div class="member-info-container">
    <!-- 主要内容区域 -->
    <div v-if="member" class="main-content" :class="{ 'content-visible': isContentVisible }">
      <!-- 左侧信息定位导航 -->
      <div class="info-sidebar animate-slide-left">
        <div class="sidebar-header">
          <button @click="$emit('back')" class="back-button">返回</button>
          <h3>信息定位</h3>
        </div>
        <div class="nav-list">
          <div
            v-for="(item, index) in navigationItems"
            :key="item.key"
            class="nav-item animate-fade-up"
            :class="{ active: activeNavItem === item.key }"
            :style="{ animationDelay: `${0.2 + index * 0.1}s` }"
            @click="scrollToSection(item.id, item.key)"
          >
            <span class="nav-text">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area animate-slide-right">
        <div class="member-detail-card">
          <!-- 头像和基本信息 -->
          <div class="member-header animate-fade-up" style="animation-delay: 0.3s;">
            <div class="avatar-section animate-scale-up" style="animation-delay: 0.4s;">
              <div class="avatar-container">
                <img
                  :src="avatarUrl"
                  :alt="member.name"
                  class="member-avatar"
                  :class="{ 'avatar-loaded': isAvatarLoaded }"
                  @load="handleImageLoad"
                  @error="handleImageError"
                  style="opacity: 0;"
                />
                <div v-if="!isAvatarLoaded" class="avatar-placeholder">
                  <div class="loading-spinner"></div>
                </div>
              </div>
            </div>
            <div class="basic-info animate-fade-up" style="animation-delay: 0.5s;">
              <h1 class="member-name">{{ member.name }}</h1>

              <p class="member-title">
                {{ getAcademicStatusTitle(member.academicStatus) }}
              </p>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="detail-sections animate-fade-up" style="animation-delay: 0.6s;">
            <!-- 个人信息 -->
            <div id="personal-info-section" class="info-section animate-fade-up" style="animation-delay: 0.7s;">
              <h3 class="section-title">个人信息</h3>
              <div class="info-grid">
                <div class="info-item animate-fade-up" style="animation-delay: 0.8s;">
                  <span class="label">姓名:</span>
                  <el-tooltip :content="member.name" placement="top" :disabled="!shouldShowTooltip(member.name)">
                    <span class="value truncated">{{ member.name }}</span>
                  </el-tooltip>
                </div>
                <div class="info-item animate-fade-up" v-if="member.englishName" style="animation-delay: 0.9s;">
                  <span class="label">英文名:</span>
                  <el-tooltip :content="member.englishName" placement="top" :disabled="!shouldShowTooltip(member.englishName)">
                    <span class="value truncated">{{ member.englishName }}</span>
                  </el-tooltip>
                </div>
                <div class="info-item animate-fade-up" v-if="member.gender" style="animation-delay: 1.0s;">
                  <span class="label">性别:</span>
                  <el-tooltip :content="member.gender === 1 ? '男' : member.gender === 2 ? '女' : String(member.gender)" placement="top" :disabled="!shouldShowTooltip(member.gender === 1 ? '男' : member.gender === 2 ? '女' : String(member.gender))">
                    <span class="value truncated">{{
                      member.gender === 1
                        ? "男"
                        : member.gender === 2
                        ? "女"
                        : String(member.gender)
                    }}</span>
                  </el-tooltip>
                </div>
                <div class="info-item animate-fade-up" style="animation-delay: 1.1s;">
                  <span class="label">职位:</span>
                  <el-tooltip :content="getAcademicStatusTitle(member.academicStatus)" placement="top" :disabled="!shouldShowTooltip(getAcademicStatusTitle(member.academicStatus))">
                    <span class="value truncated">{{
                      getAcademicStatusTitle(member.academicStatus)
                    }}</span>
                  </el-tooltip>
                </div>
                <div class="info-item animate-fade-up" v-if="member.email" style="animation-delay: 1.2s;">
                  <span class="label">邮箱:</span>
                  <el-tooltip :content="member.email" placement="top" :disabled="!shouldShowTooltip(member.email)">
                    <span class="value truncated">{{ member.email }}</span>
                  </el-tooltip>
                </div>
                <div class="info-item animate-fade-up" v-if="member.phone" style="animation-delay: 1.3s;">
                  <span class="label">手机号:</span>
                  <el-tooltip :content="member.phone" placement="top" :disabled="!shouldShowTooltip(member.phone)">
                    <span class="value truncated">{{ member.phone }}</span>
                  </el-tooltip>
                </div>
                <div class="info-item animate-fade-up" v-if="member.enrollmentYear" style="animation-delay: 1.4s;">
                  <span class="label">{{ getEnrollmentLabel(member) }}:</span>
                  <el-tooltip :content="member.enrollmentYear?.toString()" placement="top" :disabled="!shouldShowTooltip(member.enrollmentYear?.toString())">
                    <span class="value truncated">{{ member.enrollmentYear }}</span>
                  </el-tooltip>
                </div>
                <div class="info-item animate-fade-up" v-if="member.graduationYear" style="animation-delay: 1.5s;">
                  <span class="label">毕业年份:</span>
                  <el-tooltip :content="member.graduationYear?.toString()" placement="top" :disabled="!shouldShowTooltip(member.graduationYear?.toString())">
                    <span class="value truncated">{{ member.graduationYear }}</span>
                  </el-tooltip>
                </div>
                <div class="info-item animate-fade-up" v-if="member.category === 'graduates'" style="animation-delay: 1.6s;">
                  <span class="label">毕业去向:</span>
                  <el-tooltip :content="member.graduation && member.graduation.trim() ? member.graduation : '暂未统计'" placement="top" :disabled="!shouldShowTooltip(member.graduation && member.graduation.trim() ? member.graduation : '暂未统计')">
                    <span class="value truncated">{{ member.graduation && member.graduation.trim() ? member.graduation : '暂未统计' }}</span>
                  </el-tooltip>
                </div>
                <div class="info-item animate-fade-up" v-if="member.orcid" style="animation-delay: 1.7s;">
                  <span class="label">ORCID:</span>
                  <el-tooltip :content="member.orcid" placement="top" :disabled="!shouldShowTooltip(member.orcid)">
                    <span class="value truncated">{{ member.orcid }}</span>
                  </el-tooltip>
                </div>
              </div>
            </div>

            <!-- 研究方向 -->
            <div id="research-areas-section" class="info-section animate-fade-up" style="animation-delay: 0.8s;">
              <h3 class="section-title">研究方向</h3>
              <div class="research-areas">
                <div v-if="member.researchArea" class="research-tags">
                  <span
                    v-for="(area, index) in member.researchArea
                      .split('，')
                      .map(item => item.trim())
                      .filter(item => item)"
                    :key="index"
                    class="research-tag animate-fade-up"
                    :style="{ animationDelay: `${1.8 + index * 0.1}s` }"
                  >
                    {{ area }}
                  </span>
                </div>
                <div v-else class="research-item animate-fade-up" style="animation-delay: 1.8s;">
                  <p>暂无研究方向信息</p>
                </div>
              </div>
            </div>

            <!-- 个人简述 -->
            <div v-if="member.resume" id="resume-section" class="info-section animate-fade-up" style="animation-delay: 0.9s;">
              <h3 class="section-title">个人简述</h3>
              <div class="resume-content">
                <p class="resume-text animate-fade-up" style="animation-delay: 1.7s;">
                  {{ member.resume.replace(/\\n/g, "\n") }}
                </p>
              </div>
            </div>

            <!-- 项目经历 -->
            <div id="projects-section" class="info-section animate-fade-up" style="animation-delay: 1.0s;">
              <h3 class="section-title">参与项目</h3>
              <div class="projects-list">
                <div
                  v-if="props.projects && props.projects.length > 0"
                  class="projects-list-container"
                >
                  <div
                    v-for="(project, index) in sortedProjects"
                    :key="project.id"
                    class="project-item-member animate-fade-up"
                    :style="{ animationDelay: `${2.2 + index * 0.15}s` }"
                  >
                    <div class="project-main-member">
                      <el-tag
                        :type="getProjectTypeTagType(project.projectType) as '' | 'success' | 'warning' | 'danger' | 'info'"
                        size="small"
                        class="project-type-tag-member"
                      >
                        {{ getProjectTypeLabel(project.projectType) }}
                      </el-tag>
                      <el-tag
                        :type="getProjectStatusTagType(project.published, project.projectType) as '' | 'success' | 'warning' | 'danger' | 'info'"
                        size="small"
                        class="project-status-tag-member"
                      >
                        {{ getProjectStatusLabel(project.published) }}
                      </el-tag>
                      <div class="project-content-member">
                        <span class="project-title-member">{{
                          project.title
                        }}</span>
                        <span class="project-separator-member">,</span>
                        <span class="project-leader-member"
                          >负责人：{{ getProjectLeader(project.authors) }}</span
                        >
                        <span class="project-separator-member">,</span>
                        <span class="project-funding-member"
                          >经费 {{ project.fundingAmount || "0" }} 万元</span
                        >
                        <span class="project-separator-member">,</span>
                        <span class="project-year-member">{{
                          getProjectYear(
                            project.projectStartDate,
                            project.projectEndDate
                          )
                        }}</span>
                        <span class="project-separator-member">.</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="no-data animate-fade-up" style="animation-delay: 2.2s;">
                  <p>暂无参与项目信息</p>
                </div>
              </div>
            </div>

            <!-- 发表论文 -->
            <div id="publications-section" class="info-section animate-fade-up" style="animation-delay: 1.1s;">
              <h3 class="section-title">学术成果</h3>
              <div class="publications-list">
                <div
                  v-if="props.achievements && props.achievements.length > 0"
                  class="achievements-list-container"
                >
                  <div
                    v-for="(achievement, index) in sortedAchievements"
                    :key="achievement.id"
                    class="achievement-item-member animate-fade-up"
                    :style="{ animationDelay: `${2.5 + index * 0.15}s` }"
                  >
                    <div class="achievement-main-member">
                      <el-tag
                        :type="getPaperTypeTagType(achievement.paperType) as '' | 'success' | 'warning' | 'danger' | 'info'"
                        size="small"
                        class="achievement-type-tag-member"
                      >
                        {{ getPaperTypeLabel(achievement.paperType) }}
                      </el-tag>
                      <el-tag
                         :type="getStatusTagType(achievement.paperType, achievement.published) as '' | 'success' | 'warning' | 'danger' | 'info'"
                         size="small"
                         class="achievement-status-tag-member"
                       >
                         {{ getStatusLabel(achievement.paperType, achievement.published) }}
                       </el-tag>
                      <div class="achievement-content-member">
                        <span
                          v-if="
                            achievement.authors &&
                            achievement.authors.length > 0
                          "
                          class="achievement-authors-member"
                        >
                          <span
                            v-for="(author, authorIndex) in getSortedAuthors(
                              achievement.authors
                            )"
                            :key="authorIndex"
                            class="author-name-member"
                            >{{ author.name
                            }}<span
                              v-if="
                                authorIndex <
                                getSortedAuthors(achievement.authors).length - 1
                              "
                              >,
                            </span></span
                          >
                        </span>
                        <span class="achievement-separator-member">.</span>
                        <span class="achievement-title-member">{{
                          achievement.title
                        }}</span>
                        <span class="achievement-separator-member">,</span>
                        <span
                          v-if="achievement.venue"
                          class="achievement-institution-member"
                        >
                          {{ achievement.venue }}
                        </span>
                        <span class="achievement-separator-member">,</span>
                        <span
                          v-if="achievement.publishDate"
                          class="achievement-year-member"
                        >
                          {{ getPublishYear(achievement.publishDate) }}
                        </span>
                        <span class="achievement-separator-member">.</span>
                      </div>
                    </div>
                    <div class="achievement-actions-container-member">
                      <div class="achievement-actions-member">
                        <el-tooltip
                          :content="
                            achievement.gitUrl
                              ? 'Github 仓库'
                              : '暂无 Github 仓库'
                          "
                          placement="top"
                        >
                          <el-button
                            plain
                            size="small"
                            circle
                            class="action-btn-member"
                            :disabled="!achievement.gitUrl"
                            @click="
                              achievement.gitUrl &&
                                handleGithubClick(achievement.gitUrl)
                            "
                          >
                            <GithubIcon />
                          </el-button>
                        </el-tooltip>
                        <el-tooltip
                          :content="
                            achievement.linkUrl ? '项目主页' : '暂无项目主页'
                          "
                          placement="top"
                        >
                          <el-button
                            plain
                            :icon="Link"
                            size="small"
                            circle
                            class="action-btn-member"
                            :disabled="!achievement.linkUrl"
                            @click="
                              achievement.linkUrl &&
                                handleProjectClick(achievement.linkUrl)
                            "
                          />
                        </el-tooltip>
                        <el-tooltip
                          :content="
                            achievement.pdfUrl ? '下载 PDF' : '暂无 PDF 文件'
                          "
                          placement="top"
                        >
                          <el-button
                            plain
                            :icon="Download"
                            size="small"
                            circle
                            class="action-btn-member"
                            :disabled="!achievement.pdfUrl"
                            @click="
                              achievement.pdfUrl &&
                                handlePdfDownload(achievement.pdfUrl)
                            "
                          />
                        </el-tooltip>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="no-data animate-fade-up" style="animation-delay: 2.5s;">
                  <p>暂无学术成果信息</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  defineEmits,
  defineProps,
  ref,
  nextTick,
  onMounted,
  onUnmounted,
  watch,
  h,
  computed
} from "vue";
import { Link, Download } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { type ApiAchievement } from "@/api/lab/achievements";
import { type ApiProject } from "@/api/lab/projects";

// 定义 Github 图标组件
const _Github = {
  name: "Github",
  render() {
    return h(
      "svg",
      {
        viewBox: "0 0 1024 1024",
        width: "1em",
        height: "1em",
        fill: "currentColor"
      },
      [
        h("path", {
          d: "M512 12.64c-282.752 0-512 229.216-512 512 0 226.208 146.688 418.144 350.08 485.824 25.6 4.736 35.008-11.104 35.008-24.64 0-12.192-0.48-52.544-0.704-95.328-142.464 30.976-172.512-60.416-172.512-60.416-23.296-59.168-56.832-74.912-56.832-74.912-46.464-31.776 3.52-31.136 3.52-31.136 51.392 3.616 78.464 52.768 78.464 52.768 45.664 78.272 119.776 55.648 148.992 42.56 4.576-33.088 17.856-55.68 32.512-68.48-113.728-12.928-233.28-56.864-233.28-253.024 0-55.904 19.936-101.568 52.672-137.408-5.312-12.896-22.848-64.96 4.96-135.488 0 0 42.88-13.76 140.8 52.48 40.832-11.36 84.64-17.024 128.16-17.248 43.488 0.192 87.328 5.888 128.256 17.248 97.856-66.24 140.672-52.48 140.672-52.48 27.872 70.528 10.336 122.592 5.024 135.488 32.832 35.84 52.608 81.504 52.608 137.408 0 196.64-119.776 239.936-233.792 252.64 18.368 15.904 34.72 47.04 34.72 94.816 0 68.512-0.608 123.648-0.608 140.512 0 13.632 9.216 29.6 35.168 24.576C877.44 942.592 1024 750.592 1024 524.64c0-282.784-229.248-512-512-512z"
        })
      ]
    );
  }
};

interface Member {
  id: number;
  name: string;
  englishName?: string;
  gender?: number;
  resume?: string;
  phone?: string;
  title: string;
  graduation?: string;
  category: string;
  email?: string;
  photo?: string;
  researchArea?: string;
  enrollmentYear?: number;
  graduationYear?: number;
  homepageUrl?: string;
  orcid?: string;
  identity?: number;
  academicStatus?: number;
}

interface Props {
  member: Member | null;
  achievements?: ApiAchievement[];
  projects?: ApiProject[];
}

const props = defineProps<Props>();
const _emit = defineEmits<{
  back: [];
}>();

// 头像加载状态
const isAvatarLoaded = ref(false);

// 动画控制状态
const isContentVisible = ref(false);

// 监听member变化，重置头像加载状态和动画状态
watch(() => props.member, () => {
  isAvatarLoaded.value = false;
  isContentVisible.value = false;
  // 延迟触发动画，确保组件已渲染
  nextTick(() => {
    setTimeout(() => {
      isContentVisible.value = true;
    }, 100);
  });
}, { immediate: true });

// 计算头像URL
const avatarUrl = computed(() => {
  const userPhoto = props.member?.photo;
  if (userPhoto) {
    // 如果photo已经是完整URL，直接使用
    if (userPhoto.startsWith("http")) {
      return userPhoto;
    }
    // 否则拼接base API
    return import.meta.env.VITE_APP_BASE_API + userPhoto;
  }
  // 默认头像
  return "/src/assets/lab/default_avatar.png";
});

// 按时间排序的项目列表（从新到旧）
const sortedProjects = computed(() => {
  if (!props.projects || props.projects.length === 0) return [];

  // 过滤出当前成员可见的项目
  const visibleProjects = props.projects.filter(project => {
    if (!project.authors || !props.member) return false;
    
    // 查找当前成员在作者列表中的记录
    const currentMemberAuthor = project.authors.find(author => 
      author.name === props.member.name
    );
    
    // 如果找到当前成员且visible为true，则显示该项目
    return currentMemberAuthor && currentMemberAuthor.visible;
  });

  return [...visibleProjects].sort((a, b) => {
    // 优先使用项目开始时间排序
    const aDate = a.projectStartDate
      ? new Date(a.projectStartDate).getTime()
      : 0;
    const bDate = b.projectStartDate
      ? new Date(b.projectStartDate).getTime()
      : 0;
    return bDate - aDate; // 从新到旧排序
  });
});

// 按时间排序的成果列表（从新到旧）
const sortedAchievements = computed(() => {
  if (!props.achievements || props.achievements.length === 0) return [];

  // 过滤出当前成员可见的成果
  const visibleAchievements = props.achievements.filter(achievement => {
    if (!achievement.authors || !props.member) return false;
    
    // 查找当前成员在作者列表中的记录
    const currentMemberAuthor = achievement.authors.find(author => 
      author.name === props.member.name
    );
    
    // 如果找到当前成员且visible为true，则显示该成果
    return currentMemberAuthor && currentMemberAuthor.visible;
  });

  return [...visibleAchievements].sort((a, b) => {
    // 优先使用发表时间排序
    const aDate = a.publishDate ? new Date(a.publishDate).getTime() : 0;
    const bDate = b.publishDate ? new Date(b.publishDate).getTime() : 0;
    return bDate - aDate; // 从新到旧排序
  });
});

// 监听 member 变化 - 移除了加载逻辑
watch(
  () => props.member,
  _newMember => {
    // 直接处理member变化，无需加载动画
  },
  { immediate: true }
);

// 信息定位导航配置
const navigationItems = [
  { key: "personal-info", name: "个人信息", id: "personal-info-section" },
  { key: "education", name: "个人简述", id: "resume-section" },
  { key: "projects", name: "参与项目", id: "projects-section" },
  { key: "publications", name: "学术成果", id: "publications-section" }
];

const activeNavItem = ref("personal-info");

// 滚动到指定部分
const scrollToSection = (sectionId: string, navKey: string) => {
  activeNavItem.value = navKey;
  nextTick(() => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "auto",
        block: "start",
        inline: "nearest"
      });
    }
  });
};

// 分类映射
const categoryMap = {
  professor: "教授",
  associate_professor: "副教授",
  lecturer: "讲师",
  postdoc: "博士后",
  phd: "博士生",
  master: "硕士生",
  undergraduate: "本科生",
  alumni: "校友"
};

// 获取分类名称
const _getCategoryName = (category: string): string => {
  return categoryMap[category as keyof typeof categoryMap] || category;
};

// 根据身份获取入学/入职年份标签
const getEnrollmentLabel = (member: Member): string => {
  // identity=1代表学生，identity=2代表教师
  if (member.identity === 2) {
    return "入职年份";
  }
  return "入学年份";
};

// 根据身份值获取身份标签
const _getIdentityLabel = (identity: string): string => {
  // identity=1代表学生，identity=2代表教师
  if (identity === "1") {
    return "学生";
  } else if (identity === "2") {
    return "教师";
  }
  return "未知";
};

// 根据 academicStatus 获取职位名称
const getAcademicStatusTitle = (academicStatus?: number): string => {
  const statusMap: Record<number, string> = {
    0: "实验室负责人",
    1: "教授",
    2: "副教授",
    3: "讲师",
    4: "博士生",
    5: "硕士生",
    6: "本科生"
  };

  if (academicStatus === undefined || academicStatus === null) {
    return "未知";
  }

  return statusMap[academicStatus] || "未知";
};

// 处理图片加载完成
const handleImageLoad = () => {
  isAvatarLoaded.value = true;
};

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  const defaultAvatar = "/src/assets/lab/default_user_avatar.png";
  // 防止无限循环，只有当前src不是默认头像时才切换
  if (img.src !== window.location.origin + defaultAvatar) {
    img.src = defaultAvatar;
    // 重置加载状态，让默认头像也能触发加载完成事件
    isAvatarLoaded.value = false;
  } else {
    // 如果默认头像也加载失败，直接显示占位符
    isAvatarLoaded.value = true;
    img.removeAttribute("src");
  }
};

// 判断是否需要显示tooltip（始终显示以确保用户能看到完整内容）
const shouldShowTooltip = (text: string | undefined | null): boolean => {
  if (!text) return false;
  const textStr = String(text).trim();
  // 始终显示tooltip，让用户能够看到完整内容
  return textStr.length > 0;
};

// 滚动监听功能
const handleScroll = () => {
  const sections = navigationItems
    .map(item => ({
      id: item.id,
      key: item.key,
      element: document.getElementById(item.id)
    }))
    .filter(section => section.element);

  let currentSection = sections[0]?.key || "personal-info";

  // 从上到下遍历sections，找到第一个在视窗中的section
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    const sectionElement = section.element!;
    // 查找section内的标题元素
    const titleElement = sectionElement.querySelector(".section-title");
    const targetElement = titleElement || sectionElement;

    const rect = targetElement.getBoundingClientRect();
    // 如果标题顶部已经进入视窗上方200px范围内，则认为是当前section
    if (rect.top <= 200) {
      currentSection = section.key;
      break;
    }
  }

  activeNavItem.value = currentSection;
};

// 组件挂载时添加滚动监听
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  // 初始化时检查一次
  handleScroll();
});

// 组件卸载时移除滚动监听
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// 按 authorOrder 排序作者
const getSortedAuthors = (
  authors: Array<{ name: string; authorOrder?: number }>
) => {
  if (!authors || authors.length === 0) return [];

  return [...authors].sort((a, b) => {
    const orderA = a.authorOrder ?? 999; // 如果没有 authorOrder，放到最后
    const orderB = b.authorOrder ?? 999;
    return orderA - orderB;
  });
};

// 从发表日期中提取年份
const getPublishYear = (publishDate: string) => {
  if (!publishDate) return "";
  const date = new Date(publishDate);
  return date.getFullYear().toString();
};

// 获取论文类型标签类型
const getPaperTypeTagType = (paperType?: number) => {
  const typeMap: Record<number, string> = {
    1: "primary", // 期刊
    2: "success", // 会议
    3: "warning", // 预印本
    4: "danger", // 专利
    5: "info", // 软著
    6: "info", // 标准
    7: "primary" // 专著
  };
  return typeMap[paperType || 7] || "info";
};

// 获取论文类型标签文本
const getPaperTypeLabel = (paperType?: number) => {
  const typeMap: Record<number, string> = {
    1: "期刊",
    2: "会议",
    3: "预印本",
    4: "专利",
    5: "软著",
    6: "标准",
    7: "专著"
  };
  return typeMap[paperType || 7] || "其他";
};

// 获取状态标签文本
const getStatusLabel = (paperType?: number, published?: boolean) => {
  const isPublished = published !== false;
  if (isPublished) {
    // published = true 时
    if ([1, 2, 3, 6, 7].includes(paperType || 7)) { // 期刊、会议、预印本、标准、专著
      return '已发表';
    } else if ([4, 5].includes(paperType || 7)) { // 专利、软著
      return '已授权';
    }
  } else {
    // published = false 时
    if ([1, 2, 3, 6, 7].includes(paperType || 7)) { // 期刊、会议、预印本、标准、专著
      return '投递中';
    } else if ([4, 5].includes(paperType || 7)) { // 专利、软著
      return '受理中';
    }
  }
  return '';
};

// 获取状态标签类型
const getStatusTagType = (paperType?: number, published?: boolean) => {
  // 基础类型颜色映射（与getPaperTypeTagType保持一致）
  const baseTypeColors: Record<number, string> = {
    1: "primary", // 期刊
    2: "success", // 会议
    3: "warning", // 预印本
    4: "danger", // 专利
    5: "info", // 软著
    6: "info", // 标准
    7: "primary" // 专著
  };
  
  const isPublished = published !== false;
  
  // 如果未发布，使用稍微不同的色调表示状态
  if (!isPublished) {
    const unpublishedColors: Record<number, string> = {
      1: "primary",  // 期刊：使用默认灰色调
      2: "success",  // 会议：从success变为warning
      3: "warning",  // 预印本：从warning变为info
      4: "danger",  // 专利：从danger变为warning
      5: "info",  // 软著：使用默认灰色调
      6: "info", // 标准
      7: "primary"  // 专著：从primary变为info
    };
    return unpublishedColors[paperType || 7] || "info";
  }
  
  return baseTypeColors[paperType || 7] || "info";
}

// 获取项目类型标签类型
const getProjectTypeTagType = (projectType?: number) => {
  const typeMap: Record<number, string> = {
    1: "warning", // 横向
    2: "danger", // 国自然面上
    3: "primary", // 国自然青年
    4: "success", // 北京市教委科技一般
    5: "success", // 国家级教改
    6: "primary", // 省部级教改
    7: "info", // 其他教改
    8: "info" // 其他纵向
  };
  return typeMap[projectType || 1] || "info";
};

// 获取项目类型标签文本
const getProjectTypeLabel = (projectType?: number) => {
  const typeMap: Record<number, string> = {
    1: "横向",
    2: "国自然面上",
    3: "国自然青年",
    4: "北京市教委科技一般",
    5: "国家级教改",
    6: "省部级教改",
    7: "其他教改",
    8: "其他纵向"
  };
  return typeMap[projectType || 1] || "其他";
};

// 从项目日期中提取年份
const getProjectYear = (startDate?: string, endDate?: string) => {
  const startYear = startDate ? new Date(startDate).getFullYear() : "";
  const endYear = endDate ? new Date(endDate).getFullYear() : "";
  if (startYear && endYear) {
    return `${startYear}-${endYear}`;
  } else if (startYear) {
    return startYear.toString();
  }
  return "";
};

// 获取项目负责人
const getProjectLeader = (
  authors?: Array<{ name: string; authorOrder?: number }>
) => {
  if (!authors || !Array.isArray(authors)) return "未知";
  const leader = authors.find(author => author.authorOrder === 1);
  return leader?.name || "未知";
};

// 获取项目状态标签文本
const getProjectStatusLabel = (published?: boolean) => {
  return published ? "已结项" : "未结项";
};

// 获取项目状态标签类型（与项目类型标签颜色保持一致）
const getProjectStatusTagType = (published?: boolean, projectType?: number) => {
  // 返回与项目类型标签相同的颜色
  return getProjectTypeTagType(projectType);
};

// 操作按钮事件处理
const handleGithubClick = (url: string) => {
  window.open(url, "_blank");
  ElMessage.success("正在跳转到 Github 仓库");
};

const handleProjectClick = (url: string) => {
  window.open(url, "_blank");
  ElMessage.success("正在跳转到项目主页");
};

const handlePdfDownload = (url: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  ElMessage.success("PDF 下载已开始");
};
</script>

<style scoped>
/* 响应式设计 */
@media (width <= 1200px) {
  .main-content {
    gap: 20px;
    padding: 0 15px;
  }

  .info-sidebar {
    width: 260px;
  }
}

@media (width <= 1024px) {
  .main-content {
    flex-direction: column;
    gap: 20px;
    padding: 0 15px;
    align-items: center;
  }

  .info-sidebar {
    position: static;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;

    .sidebar-header {
      h3 {
        text-align: center;
      }
    }

    .nav-list {
      display: flex;
      flex-flow: row wrap;
      gap: 12px;
      justify-content: center;
    }

    .nav-item {
      flex: 1 1 auto;
      justify-content: center;
      min-width: 140px;
      max-width: none;
    }
  }

  /* 中等分辨率优化 */
  @media (width <= 900px) and (width > 768px) {
    .info-sidebar {
      max-width: 700px;
      margin: 0 auto;

      .sidebar-header {
        h3 {
          text-align: center;
        }
      }

      .nav-list {
        gap: 8px;
        justify-content: center;
      }

      .nav-item {
        flex: 1 1 calc(50% - 4px);
        min-width: 0;
        max-width: calc(50% - 4px);
      }
    }
  }

  .info-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
  }
}

@media (width <= 768px) {
  .member-info-container {
    padding: 60px 10px;
  }

  .main-content {
    gap: 15px;
    padding: 0 10px;
    align-items: center;
  }

  .info-sidebar {
    padding: 16px;
    max-width: 600px;
    margin: 0 auto;

    .sidebar-header {
      h3 {
        text-align: center;
      }
    }

    .nav-list {
      flex-direction: column;
      justify-content: center;
    }

    .nav-item {
      justify-content: flex-start;
      min-width: auto;
    }
  }

  .member-header {
    flex-direction: column;
    padding: 30px 20px;
    text-align: center;
  }

  .avatar-section {
    margin-right: 0;
    margin-bottom: 20px;
  }

  .detail-sections {
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px 16px;

    .label {
      min-width: auto;
      margin-right: 0;
      margin-bottom: 6px;
      font-size: 13px;
    }

    .value {
      font-size: 14px;
    }

    .value.truncated {
      max-width: 120px;
    }
  }

  .basic-info h1 {
    font-size: 24px;
  }
}

@media (width <= 480px) {
  .member-info-container {
    padding: 15px 8px;
  }

  .main-content {
    padding: 0 8px;
    align-items: center;
  }

  .info-sidebar {
    padding: 12px;
    max-width: 400px;
    margin: 0 auto;

    .sidebar-header {
      h3 {
        font-size: 1.1rem;
        text-align: center;
      }

      .back-button {
        padding: 6px 10px;
        font-size: 11px;
      }
    }

    .nav-list {
      justify-content: center;
    }

    .nav-item {
      padding: 10px 12px;
      font-size: 14px;
    }
  }

  .member-header {
    padding: 20px 16px;
  }

  .avatar-container {
    width: 100px;
    height: 100px;
  }

  .member-avatar {
    width: 100px;
    height: 100px;
  }

  .avatar-placeholder {
    width: 100px;
    height: 100px;
  }

  .basic-info {
    h1 {
      font-size: 20px;
    }

    p {
      font-size: 14px;
    }
  }

  .detail-sections {
    padding: 16px;
  }

  .section-title {
    margin-bottom: 16px;
    font-size: 1.3rem;
  }

  .info-item {
    padding: 12px 14px;

    .label {
      font-size: 12px;
    }

    .value {
      font-size: 13px;
    }

    .value.truncated {
      max-width: 100px;
    }
  }

  .project-item,
  .publication-item {
    padding: 16px;
  }

  .project-item-member {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    padding: 16px;
  }

  .project-main-member {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    width: 100%;
    margin-right: 0;
  }

  .project-type-tag-member {
    margin-bottom: 8px;
  }

  .project-content-member {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }

  .project-title-member {
    font-size: 14px;
    font-weight: 600;
  }

  .project-leader-member,
  .project-year-member {
    font-size: 12px;
  }

  .project-funding-member {
    font-size: 12px;
    font-weight: 500;
    color: #e67e22;
  }

  .achievement-item-member {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    padding: 16px;
  }

  .achievement-main-member {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    width: 100%;
    margin-right: 0;
  }

  .achievement-actions-container-member {
    align-self: flex-end;
    margin-top: 8px;
  }

  .achievement-actions-member {
    padding: 6px 10px;
  }

  .action-btn-member {
    width: 30px;
    height: 30px;
  }

  .research-tag {
    padding: 6px 12px;
    font-size: 12px;
  }
}

@media (width <= 360px) {
  .member-info-container {
    padding: 10px 6px;
  }

  .main-content {
    padding: 0 6px;
    align-items: center;
  }

  .info-sidebar {
    padding: 10px;
    max-width: 320px;
    margin: 0 auto;

    .sidebar-header {
      h3 {
        text-align: center;
      }

      .back-button {
        padding: 5px 8px;
        font-size: 10px;
      }
    }

    .nav-list {
      justify-content: center;
    }

    .nav-item {
      padding: 8px 10px;
      font-size: 13px;
    }
  }

  .member-header {
    padding: 16px 12px;
  }

  .avatar-container {
    width: 80px;
    height: 80px;
  }

  .member-avatar {
    width: 80px;
    height: 80px;
  }

  .avatar-placeholder {
    width: 80px;
    height: 80px;
  }

  .basic-info {
    h1 {
      font-size: 18px;
    }

    p {
      font-size: 13px;
    }
  }

  .detail-sections {
    padding: 12px;
  }

  .section-title {
    margin-bottom: 14px;
    font-size: 1.2rem;
  }

  .info-item {
    padding: 10px 12px;

    .label {
      font-size: 11px;
    }

    .value {
      font-size: 12px;
    }
  }

  .project-item,
  .publication-item {
    padding: 14px;
  }

  .achievement-item-member {
    padding: 14px;
  }

  .achievement-content-member {
    font-size: 13px;
  }

  .achievement-authors-member,
  .achievement-title-member,
  .achievement-institution-member,
  .achievement-year-member {
    font-size: 13px;
  }

  .research-tag {
    padding: 5px 10px;
    font-size: 11px;
  }
}

.member-info-container {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 0px 20px 20px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
}

.main-content {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  padding: 0 20px;
  margin: 0 auto;
}

.info-sidebar {
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
    position: relative;
    margin-bottom: 20px;

    .back-button {
      position: absolute;
      top: 8px;
      left: 0;
      z-index: 10;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 500;
      color: rgb(255 255 255);
      cursor: pointer;
      background: linear-gradient(135deg, #3c7ce2, #1d4ed8);
      border: none;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgb(59 130 246 / 30%);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgb(59 130 246 / 40%);
        transform: translateY(-1px);
      }
    }

    h3 {
      padding-top: 8px;
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: #1e293b;
      text-align: center;
    }
  }

  .nav-list {
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

    &:hover {
      background: rgb(59 130 246 / 10%);
      transform: translateX(4px);
    }

    &.active {
      color: white;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      box-shadow: 0 4px 12px rgb(59 130 246 / 30%);
    }

    .nav-text {
      font-weight: 500;
    }
  }
}

.content-area {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 0;
}

.member-detail-card {
  width: 100%;
  margin: 0;
  overflow: hidden;
  background: rgb(248 250 252 / 95%);
  backdrop-filter: blur(15px);
  border: 1px solid rgb(226 232 240 / 30%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgb(148 163 184 / 20%);
}

.member-header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 40px;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.member-header::before {
  position: absolute;
  inset: 0;
  content: "";
  background: linear-gradient(
    135deg,
    rgb(59 130 246 / 90%),
    rgb(29 78 216 / 90%)
  );
  backdrop-filter: blur(10px);
}

.member-header > * {
  position: relative;
  z-index: 1;
}

.avatar-section {
  margin-right: 30px;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
}

.member-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  font-size: 12px;
  color: #64748b;
  text-align: center;
  object-fit: cover;
  background: rgb(255 255 255 / 20%);
  backdrop-filter: blur(10px);
  border: 3px solid rgb(255 255 255 / 30%);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
  transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
  transform: scale(0.9);
}

.member-avatar.avatar-loaded {
  opacity: 1 !important;
  transform: scale(1);
  animation: avatarFadeIn 0.8s ease-out;
}

.avatar-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: rgb(255 255 255 / 20%);
  backdrop-filter: blur(10px);
  border: 3px solid rgb(255 255 255 / 30%);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgb(255 255 255 / 30%);
  border-top: 2px solid rgb(255 255 255 / 80%);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes avatarFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  50% {
    transform: scale(1.05) translateY(-2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.basic-info h1 {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.basic-info p {
  margin: 6px 0;
  opacity: 0.95;
}

.member-title {
  font-size: 18px;
  font-weight: 500;
}

.member-status {
  display: inline-block;
  padding: 6px 16px;
  margin-top: 12px;
  font-size: 14px;
  background: rgb(255 255 255 / 20%);
  backdrop-filter: blur(10px);
  border: 1px solid rgb(255 255 255 / 30%);
  border-radius: 20px;
}

.detail-sections {
  padding: 40px;
}

.info-section {
  margin-bottom: 40px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  position: relative;
  padding-bottom: 12px;
  margin-bottom: 24px;
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 2px solid rgb(59 130 246 / 20%);
}

.section-title::after {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  content: "";
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 1px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: rgb(255 255 255 / 60%);
  border: 1px solid rgb(226 232 240 / 50%);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgb(255 255 255 / 80%);
  box-shadow: 0 4px 12px rgb(148 163 184 / 15%);
  transform: translateY(-2px);
}

.info-item .label {
  min-width: 90px;
  margin-right: 16px;
  font-weight: 600;
  color: #475569;
}

.info-item .value {
  font-weight: 500;
  color: #1e293b;
}

.info-item .value.truncated {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  display: inline-block;
}

.info-item .value .link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}

#resume-section .resume-content {
  font-size: 15px;
  line-height: 1.7;
  color: #475569;
}

#resume-section .resume-content p {
  margin: 0;
  text-align: justify;
}

.resume-text {
  white-space: pre-line;
}

.info-item .value .link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.research-areas {
  .research-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .research-tag {
      position: relative;
      display: inline-block;
      padding: 12px 20px;
      margin: 4px;
      overflow: hidden;
      clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
      font-size: 13px;
      font-weight: 600;
      color: #1e40af;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border: none;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgb(59 130 246 / 15%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &::before {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        content: "";
        background: linear-gradient(
          90deg,
          transparent,
          rgb(255 255 255 / 30%),
          transparent
        );
        transition: left 0.5s;
      }

      &:hover {
        box-shadow: 0 8px 25px rgb(0 0 0 / 20%);
        transform: translateY(-3px) scale(1.05);

        &::before {
          left: 100%;
        }
      }

      &:active {
        transform: translateY(-1px) scale(1.02);
      }
    }
  }

  .research-item {
    padding: 16px;
    background: rgb(255 255 255 / 80%);
    border-radius: 12px;

    p {
      margin: 0;
      line-height: 1.6;
      color: #374151;
    }
  }
}

.projects-list,
.publications-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.project-item,
.publication-item {
  padding: 24px;
  background: rgb(255 255 255 / 70%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgb(148 163 184 / 10%);
  transition: all 0.3s ease;
}

.project-item:hover,
.publication-item:hover {
  background: rgb(255 255 255 / 90%);
  box-shadow: 0 8px 24px rgb(148 163 184 / 15%);
  transform: translateY(-2px);
}

/* 成员页面论文样式 */
.achievements-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.achievement-item-member {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  line-height: 1.6;
  background: rgb(255 255 255 / 80%);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgb(148 163 184 / 10%);
  transition: all 0.3s ease;
}

.achievement-item-member:hover {
  background: rgb(255 255 255 / 95%);
  box-shadow: 0 8px 24px rgb(148 163 184 / 15%);
  transform: translateY(-2px);
}

.achievement-main-member {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;
  margin-right: 16px;
}

.achievement-status-tag-member {
  flex-shrink: 0;
  margin-top: 2px;
  margin-right: 8px;
  font-weight: 500;
  border-radius: 6px;
}

.achievement-type-tag-member {
  flex-shrink: 0;
  margin-top: 2px;
  font-weight: 500;
  border-radius: 6px;
}

.achievement-content-member {
  flex: 1;
  gap: 4px;
  align-items: center;
  font-size: 14px;
  line-height: 1.6;
}

.achievement-authors-member {
  font-weight: 600;
  color: #374151;
}

.author-name-member {
  font-weight: normal;
  color: #374151;
}

.achievement-title-member {
  font-weight: 700;
  color: #1e293b;
}

.achievement-institution-member {
  font-style: italic;
  font-weight: 500;
  color: #64748b;
}

.achievement-year-member {
  font-weight: 600;
  color: #374151;
}

.achievement-separator-member {
  margin: 0 2px;
  color: #64748b;
}

.achievement-actions-container-member {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  margin-top: 2px;
}

.achievement-actions-member {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  background-color: #fafbfc;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
}

.action-btn-member {
  width: 28px;
  height: 28px;
  padding: 0;
  color: #6b7280;
  background-color: #fff;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

.action-btn-member:hover {
  color: #374151;
  background-color: #f9fafb;
  border-color: #9ca3af;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  transform: translateY(-1px);
}

.action-btn-member:disabled {
  color: #d1d5db;
  cursor: not-allowed;
  background-color: #f9fafb;
  border-color: #e5e7eb;
  box-shadow: none;
  transform: none;
}

.action-btn-member:disabled:hover {
  color: #d1d5db;
  background-color: #f9fafb;
  border-color: #e5e7eb;
  box-shadow: none;
  transform: none;
}

/* 保留旧样式以防兼容性问题 */
.publication-item-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  margin-bottom: 8px;
  background: rgb(255 255 255 / 70%);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(148 163 184 / 10%);
  transition: all 0.3s ease;
}

.publication-item-compact:hover {
  background: rgb(255 255 255 / 90%);
  box-shadow: 0 4px 12px rgb(148 163 184 / 15%);
  transform: translateY(-1px);
}

.paper-content {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.publication-item-compact .paper-title {
  max-width: 300px;
  margin: 0;
  overflow: hidden;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.publication-item-compact .paper-authors,
.publication-item-compact .paper-date,
.publication-item-compact .paper-journal,
.publication-item-compact .paper-venue {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
}

.paper-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
}

.publication-item-compact .paper-link {
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  color: #3b82f6;
  text-decoration: none;
  white-space: nowrap;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.publication-item-compact .paper-link:hover {
  color: white;
  background: #3b82f6;
  box-shadow: 0 2px 6px rgb(59 130 246 / 30%);
  transform: translateY(-1px);
}

.project-title,
.paper-title {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  color: #1e293b;
}

.project-description,
.paper-authors,
.paper-venue,
.paper-description {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: #64748b;
}

.project-date {
  font-size: 12px;
  font-style: italic;
  font-weight: 500;
  color: #94a3b8;
}

/* 论文专用样式 */
.paper-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;

  span {
    padding: 4px 8px;
    font-size: 13px;
    color: #64748b;
    background: rgb(59 130 246 / 10%);
    border: 1px solid rgb(59 130 246 / 20%);
    border-radius: 6px;
  }
}

.paper-authors {
  margin-bottom: 12px;

  .authors-label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }

  .author-name {
    font-size: 14px;
    color: #64748b;
  }
}

.paper-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.paper-tag {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 20px;
  box-shadow: 0 2px 4px rgb(59 130 246 / 30%);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgb(59 130 246 / 40%);
    transform: translateY(-1px);
  }
}

.paper-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.paper-link {
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #3b82f6;
  text-decoration: none;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: white;
    background: #3b82f6;
    transform: translateY(-1px);
  }
}

/* 项目经历样式 */
.projects-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-item-member {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 10px rgb(0 0 0 / 15%);
    transform: translateY(-2px);
  }
}

.project-main-member {
  display: flex;
  flex: 1;
  gap: 12px;
}

.project-status-tag-member {
  flex-shrink: 0;
  margin-right: 8px;
  margin-top: 2px;
}

.project-type-tag-member {
  flex-shrink: 0;
  margin-right: 0px;
}

.project-number-member {
  min-width: 24px;
  margin-top: 2px;
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
}

.project-type-tag-member {
  margin-top: 2px;
  font-weight: 500;
}

.project-content-member {
  flex: 1;
  font-size: 15px;
  line-height: 1.6;
}

.project-title-member {
  font-weight: 600;
  color: #1f2937;
}

.project-separator-member {
  margin: 0 2px;
  color: #6b7280;
}

.project-leader-member,
.project-year-member {
  color: #4b5563;
}

.project-funding-member {
  font-weight: 500;
  color: #e67e22;
}

.no-data {
  padding: 32px;
  font-style: italic;
  color: #94a3b8;
  text-align: center;
  background: rgb(248 250 252 / 80%);
  border: 2px dashed rgb(148 163 184 / 30%);
  border-radius: 12px;

  p {
    margin: 0;
    font-size: 16px;
  }
}

/* 成员详情视图样式 */

/* 页面进入动画 */
.main-content {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.main-content.content-visible {
  opacity: 1;
}

/* 从左侧滑入动画 */
.animate-slide-left {
  opacity: 0;
  transform: translateX(-50px);
  animation: slideInLeft 0.6s ease-out forwards;
}

@keyframes slideInLeft {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 从右侧滑入动画 */
.animate-slide-right {
  opacity: 0;
  transform: translateX(50px);
  animation: slideInRight 0.6s ease-out 0.1s forwards;
}

@keyframes slideInRight {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 从下方淡入动画 */
.animate-fade-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 缩放淡入动画 */
.animate-scale-up {
  opacity: 0;
  transform: scale(0.8);
  animation: scaleUp 0.6s ease-out forwards;
}

@keyframes scaleUp {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 确保动画只在内容可见时播放 */
.main-content:not(.content-visible) .animate-slide-left,
.main-content:not(.content-visible) .animate-slide-right,
.main-content:not(.content-visible) .animate-fade-up,
.main-content:not(.content-visible) .animate-scale-up {
  animation: none;
}
</style>
