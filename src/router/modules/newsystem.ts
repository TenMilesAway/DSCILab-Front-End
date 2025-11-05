const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/newsystem",
    name: "NewSystem",
    component: Layout,
    redirect: "/newsystem/profile",
    meta: {
      title: "个人中心",
      rank: 1
    },
    children: [
      {
        path: "/newsystem/profile",
        name: "NewSystemProfile",
        component: () => import("@/views/newsystem/profile/index.vue"),
        meta: {
          title: "个人中心",
          showLink: true,
          showParent: false
        }
      }
    ]
  },
  {
    path: "/newsystem/user",
    name: "NewSystemUserManagement",
    component: Layout,
    redirect: "/newsystem/user/index",
    meta: {
      title: "用户管理",
      rank: 2
    },
    children: [
      {
        path: "/newsystem/user/index",
        name: "NewSystemUser",
        component: () => import("@/views/newsystem/user/index.vue"),
        meta: {
          title: "用户管理",
          showLink: true,
          showParent: false,
          roles: ["admin"]
        }
      }
    ]
  },
  {
    path: "/newsystem/paper",
    name: "NewSystemPaperManagement",
    component: Layout,
    redirect: "/newsystem/paper/index",
    meta: {
      title: "成果管理",
      rank: 4
    },
    children: [
      {
        path: "/newsystem/paper/index",
        name: "NewSystemPaper",
        component: () => import("@/views/newsystem/paper/index.vue"),
        meta: {
          title: "成果管理",
          showLink: true,
          showParent: false
        }
      }
    ]
  },
  {
    path: "/newsystem/project",
    name: "NewSystemProjectManagement",
    component: Layout,
    redirect: "/newsystem/project/index",
    meta: {
      title: "项目管理",
      rank: 3
    },
    children: [
      {
        path: "/newsystem/project/index",
        name: "NewSystemProject",
        component: () => import("@/views/newsystem/project/index.vue"),
        meta: {
          title: "项目管理",
          showLink: true,
          showParent: false
        }
      }
    ]
  },
  {
    path: "/newsystem/achievement-category",
    name: "NewSystemAchievementCategoryManagement",
    component: Layout,
    redirect: "/newsystem/achievement-category/index",
    meta: {
      title: "成果类型管理",
      rank: 5
    },
    children: [
      {
        path: "/newsystem/achievement-category/index",
        name: "NewSystemAchievementCategory",
        component: () => import("@/views/newsystem/achievement-category/index.vue"),
        meta: {
          title: "成果类型管理",
          showLink: true,
          showParent: false,
          roles: ["admin"]
        }
      }
    ]
  },
  {
    path: "/newsystem/news",
    name: "NewSystemNewsManagement",
    component: Layout,
    redirect: "/newsystem/news/index",
    meta: {
      title: "新闻活动",
      rank: 6,
      showLink: false
    },
    children: [
      {
        path: "/newsystem/news/index",
        name: "NewSystemNews",
        component: () => import("@/views/newsystem/news/index.vue"),
        meta: {
          title: "新闻活动",
          showLink: false,
          showParent: false
        }
      }
    ]
  }
] as RouteConfigsTable[];
