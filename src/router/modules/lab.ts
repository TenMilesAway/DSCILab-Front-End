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
    }
  ]
};

export default labRouter;