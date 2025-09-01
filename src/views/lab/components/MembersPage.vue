<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { Search } from '@element-plus/icons-vue';
import MemberInfo from './MemberInfo.vue';

defineOptions({
  name: "MembersPage"
});

interface Member {
  id: number;
  name: string;
  title: string;
  graduation?: string; // 毕业去向（可选，仅已毕业学生有）
  category: string; // 新增分类字段
}

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

const defaultMembers: Member[] = [
  {
    id: 1,
    name: '刘秀磊',
    title: '实验室负责人',
    category: 'directors'
  },
  {
    id: 3,
    name: '李宁',
    title: '教授',
    category: 'teachers'
  },
  {
    id: 4,
    name: '佟强',
    title: '副教授',
    category: 'teachers'
  },
  {
    id: 5,
    name: '侯守璐',
    title: '副教授',
    category: 'teachers'
  },
  {
    id: 6,
    name: '李硕',
    title: '2023 级硕士研究生',
    category: 'master_students'
  },
  {
    id: 8,
    name: '邹凌龙',
    title: '2023 级硕士研究生',
    category: 'master_students'
  },
  {
    id: 10,
    name: '褚延浩',
    title: '2022 级硕士毕业生',
    graduation: '美团',
    category: 'graduates'
  },
  {
    id: 11,
    name: '罗迩遐',
    title: '2022 级硕士毕业生',
    graduation: '北京邮电大学',
    category: 'graduates'
  },
  {
    id: 12,
    name: '王博士',
    title: '已毕业博士',
    graduation: '阿里巴巴达摩院',
    category: 'graduates'
  },
  {
    id: 13,
    name: '李硕士',
    title: '已毕业硕士',
    graduation: '华为技术有限公司',
    category: 'graduates'
  },
  {
    id: 14,
    name: '张博士',
    title: '已毕业博士',
    graduation: '百度研究院',
    category: 'graduates'
  },
  {
    id: 15,
    name: '陈硕士',
    title: '已毕业硕士',
    graduation: '美团技术团队',
    category: 'graduates'
  },
  {
    id: 16,
    name: '刘博士',
    title: '已毕业博士',
    graduation: '京东AI研究院',
    category: 'graduates'
  },
  {
    id: 17,
    name: '周硕士',
    title: '已毕业硕士',
    graduation: '滴滴出行',
    category: 'graduates'
  },
  {
    id: 18,
    name: '吴博士',
    title: '已毕业博士',
    graduation: '小米AI实验室',
    category: 'graduates'
  },
  {
    id: 19,
    name: '赵硕士',
    title: '已毕业硕士',
    graduation: '网易有道',
    category: 'graduates'
  },
  {
    id: 20,
    name: '孙博士',
    title: '已毕业博士',
    graduation: '商汤科技',
    category: 'graduates'
  },
  {
    id: 21,
    name: '钱硕士',
    title: '已毕业硕士',
    graduation: '快手科技',
    category: 'graduates'
  },
  {
    id: 22,
    name: '郑博士',
    title: '已毕业博士',
    graduation: '旷视科技',
    category: 'graduates'
  },
  {
    id: 23,
    name: '林硕士',
    title: '已毕业硕士',
    graduation: '拼多多',
    category: 'graduates'
  },
  {
    id: 24,
    name: '何博士',
    title: '已毕业博士',
    graduation: '科大讯飞',
    category: 'graduates'
  },
  {
    id: 25,
    name: '高硕士',
    title: '已毕业硕士',
    graduation: '新浪微博',
    category: 'graduates'
  }
];

const props = withDefaults(defineProps<Props>(), {
  title: '团队成员',
  subtitle: '我们拥有一支专业的研究团队'
});

const activeCategory = ref<string>('directors'); // 默认选中负责人
const searchKeyword = ref<string>(''); // 搜索关键词

// 获取实际使用的成员数据
const actualMembers = computed(() => props.members || defaultMembers);

// 分类配置
const categories = [
  { key: 'directors', name: '负责人'},
  { key: 'teachers', name: '教师'},
  { key: 'phd_students', name: '博士生'},
  { key: 'master_students', name: '硕士生'},
  { key: 'graduates', name: '已毕业学生'}
];

// 获取当前选中分类的成员
const currentCategoryMembers = computed(() => {
  let filteredMembers = actualMembers.value.filter(member => member.category === activeCategory.value);
  
  // 如果有搜索关键词，进行模糊搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase();
    filteredMembers = filteredMembers.filter(member => 
      member.name.toLowerCase().includes(keyword) ||
      member.title.toLowerCase().includes(keyword) ||
      (member.graduation && member.graduation.toLowerCase().includes(keyword))
    );
  }
  
  return filteredMembers;
});

// 按类别分组成员（用于左侧导航显示统计）
const groupedMembers = computed<CategoryGroup[]>(() => {
  return categories.map(category => ({
    name: category.name,
    key: category.key,
    members: actualMembers.value.filter(member => member.category === category.key)
  })).filter(group => group.members.length > 0);
});

// 详情显示状态管理
const showDetailView = ref(false);
const selectedMember = ref<Member | null>(null);
// 滚动位置记忆
const savedScrollPosition = ref(0);

const showMemberDetail = (member: Member) => {
  // 保存当前滚动位置
  savedScrollPosition.value = window.pageYOffset || document.documentElement.scrollTop;
  selectedMember.value = member;
  showDetailView.value = true;
  // 滚动到页面顶部
  nextTick(() => {
    window.scrollTo({ top: 0 });
  });
};

const hideDetailView = () => {
  showDetailView.value = false;
  selectedMember.value = null;
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
  return category?.name || '其他';
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
            <span class="nav-count">({{ actualMembers.filter(m => m.category === category.key).length }})</span>
          </div>
        </div>
      </div>
      
      <!-- 右侧内容区域 -->
      <div class="members-content">
        <div class="category-header">
          <h3>
            {{ getCategoryName(activeCategory) }}
            <span class="category-count">({{ currentCategoryMembers.length }}人)</span>
          </h3>
          <div class="search-container">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索成员姓名、职位或毕业去向"
              :prefix-icon="Search"
              clearable
              class="search-input"
            />
          </div>
        </div>
        
        <div class="members-list">
          <div 
            v-for="member in currentCategoryMembers" 
            :key="member.id" 
            class="member-card"
            @click="showMemberDetail(member)"
          >
            <div class="member-info">
              <span class="member-field member-name">{{ member.name }}</span>
              <span class="member-field member-title">{{ member.title }}</span>
              <span v-if="member.graduation" class="member-field member-graduation">毕业去向：{{ member.graduation }}</span>
            </div>
            <div class="member-action">
              <span class="view-detail">查看详情</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成员详情视图 -->
    <MemberInfo 
      v-else 
      :member="selectedMember" 
      @back="hideDetailView"
    />
  </div>
</template>

<style scoped lang="scss">
.members-page {
  padding: 80px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  min-height: 100vh;
}

.members-header {
  text-align: center;
  margin-bottom: 40px;
  
  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 16px;
    text-shadow: 0 2px 4px rgba(148, 163, 184, 0.3);
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
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  align-items: flex-start;
  padding: 0 20px;
}

/* 左侧导航栏样式 */
.members-sidebar {
  width: 280px;
  position: sticky;
  top: 100px;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(148, 163, 184, 0.15);
  border: 1px solid rgba(226, 232, 240, 0.3);
  
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
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.5);
    
    &:hover {
      background: rgba(59, 130, 246, 0.1);
      transform: translateX(4px);
    }
    
    &.active {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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

@media (max-width: 480px) {
  .members-page {
    padding: 40px 12px;
  }
  
  .members-container {
    padding-left: 0;
  }
  
  .members-sidebar {
    padding: 12px;
    
    .sidebar-header h3 {
      font-size: 1.1rem;
    }
    
    .nav-item {
      padding: 10px 12px;
      font-size: 14px;
      
      .nav-count {
        font-size: 12px;
      }
    }
  }
  
  .members-content {
    .category-header {
      h3 {
        font-size: 1.3rem;
      }
    }
  }
  
  .member-card {
    padding: 12px;
    
    .member-info {
      gap: 6px;
      margin-bottom: 10px;
      
      .member-name {
        font-size: 15px;
      }
      
      .member-title {
        font-size: 13px;
      }
      
      .member-graduation {
        font-size: 12px;
      }
    }
    
    .member-action {
      .view-detail {
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 360px) {
  .members-page {
    padding: 30px 8px;
  }
  
  .members-sidebar {
    .nav-item {
      padding: 8px 10px;
      font-size: 13px;
    }
  }
  
  .members-content {
    .category-header {
      h3 {
        font-size: 1.2rem;
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
      }
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
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    
    h3 {
      display: flex;
      align-items: center;
      font-size: 1.8rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
      
      .category-count {
        font-size: 1rem;
        color: #64748b;
        font-weight: 400;
        margin-left: 8px;
      }
    }
    
    .search-container {
      .search-input {
        width: 280px;
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
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 16px rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(226, 232, 240, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  min-height: 60px;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 8px 24px rgba(148, 163, 184, 0.2);
    background: rgba(255, 255, 255, 0.95);
  }
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0;
  
  .member-field {
    font-size: 14px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    &::before {
      content: attr(class);
      display: none;
    }
  }
  
  .member-name {
    font-weight: 600;
    color: #2c3e50;
    flex: 0 0 25%;
    min-width: 120px;
    padding-right: 15px;
  }
  
  .member-title {
    color: #7f8c8d;
    flex: 1;
    min-width: 150px;
    padding-right: 15px;
  }
  
  .member-graduation {
    color: #27ae60;
    font-size: 13px;
    flex: 0 0 30%;
    min-width: 150px;
    background: rgba(39, 174, 96, 0.1);
    padding: 4px 8px;
    border-radius: 6px;
    text-align: center;
  }
}

.member-action {
  flex: 0 0 auto;
  margin-left: 15px;
  
  .view-detail {
    font-size: 0.9rem;
    color: #64748b;
    opacity: 0.7;
    transition: all 0.3s ease;
    padding: 6px 12px;
    border-radius: 6px;
    background: rgba(100, 116, 139, 0.1);
    white-space: nowrap;
  }
  
  .member-card:hover & .view-detail {
    opacity: 1;
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
}

/* 成员详情相关样式已移至 MemberInfo.vue 组件 */

/* 响应式调整 */
@media (max-width: 1024px) {
  .members-container {
    flex-direction: column;
    gap: 20px;
  }
  
  .members-sidebar {
    width: 100%;
    position: static;
    
    .category-nav {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .nav-item {
      flex: 1;
      min-width: 120px;
      justify-content: center;
      
      .nav-text {
        flex: none;
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

@media (max-width: 768px) {
  .members-page {
    padding: 60px 15px;
  }
  
  .members-container {
    gap: 15px;
  }
  
  .members-sidebar {
    padding: 16px;
    
    .category-nav {
      flex-direction: column;
    }
    
    .nav-item {
      min-width: auto;
      justify-content: flex-start;
    }
  }
  
  .members-content {
    .category-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
      
      h3 {
        font-size: 1.5rem;
      }
      
      .search-container {
        width: 100%;
        
        .search-input {
          width: 100%;
        }
      }
    }
  }
  
  .member-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    
    .member-info {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 12px;
      
      .member-field {
        width: 100%;
        white-space: normal;
        padding-right: 0;
      }
      
      .member-name {
        font-size: 16px;
        margin-bottom: 4px;
      }
      
      .member-title {
        font-size: 14px;
        margin-bottom: 4px;
      }
      
      .member-graduation {
        font-size: 13px;
      }
    }
    
    .member-action {
      align-self: flex-end;
    }
  }
}
</style>