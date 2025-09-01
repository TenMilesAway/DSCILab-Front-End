import { RouteRecordRaw } from "vue-router";

const Layout = () => import("@/layout/index.vue");

const labRouter: RouteRecordRaw = {
  path: "/lab",
  name: "Lab",
  component: Layout,
  redirect: "/lab/members",
  meta: {
    icon: "ep:office-building",
    title: "实验室",
    rank: 10
  },
  children: [
    {
      path: "/lab/members",
      name: "Members",
      component: () => import("@/views/lab/components/MembersPage.vue"),
      meta: {
        title: "成员管理",
        showLink: true
      }
    },
    {
      path: "/lab/members/detail/:id",
      name: "MemberDetail",
      component: () => import("@/views/lab/components/MemberDetail.vue"),
      meta: {
        title: "成员详情",
        showLink: false,
        activePath: "/lab/members"
      }
    }
  ]
};

export default labRouter;