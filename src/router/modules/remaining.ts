const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/welcome",
    name: "Welcome",
    component: () => import("@/views/lab/index.vue"),
    meta: {
      title: "DCSI 实验室",
      showLink: false,
      rank: 100
    },
    children: [
      {
        path: "",
        name: "WelcomeHome",
        component: () => import("@/views/lab/index.vue"),
        meta: {
          title: "实验室主页",
          showLink: false
        }
      },
      {
        path: "members",
        name: "WelcomeMembers",
        component: () => import("@/views/lab/index.vue"),
        meta: {
          title: "成员聚合页",
          showLink: false
        }
      },
      {
        path: "achievements",
        name: "WelcomeAchievements",
        component: () => import("@/views/lab/index.vue"),
        meta: {
          title: "成果页",
          showLink: false
        }
      },
      {
        path: "projects",
        name: "WelcomeProjects",
        component: () => import("@/views/lab/index.vue"),
        meta: {
          title: "项目页",
          showLink: false
        }
      },
      {
        path: "member/:id",
        name: "WelcomeMemberDetail",
        component: () => import("@/views/lab/index.vue"),
        meta: {
          title: "成员详情页",
          showLink: false
        }
      }
    ]
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "DCSI 实验室前台管理系统登录",
      showLink: false,
      rank: 101
    }
  },
  {
    path: "/redirect",
    component: Layout,
    meta: {
      title: "加载中...",
      showLink: false,
      rank: 102
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/redirect.vue")
      }
    ]
  },
  {
    path: "/system/user/profile",
    component: Layout,
    meta: {
      title: "个人中心",
      showLink: false,
      rank: 102
    },
    children: [
      {
        path: "/",
        name: "Redirect",
        component: () => import("@/views/system/user/profile/index.vue")
      }
    ]
  }
] as Array<RouteConfigsTable>;
