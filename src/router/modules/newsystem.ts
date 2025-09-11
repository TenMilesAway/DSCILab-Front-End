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
      rank: 3
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
    path: "/newsystem/news",
    name: "NewSystemNewsManagement",
    component: Layout,
    redirect: "/newsystem/news/index",
    meta: {
      title: "新闻活动",
      rank: 4,
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
