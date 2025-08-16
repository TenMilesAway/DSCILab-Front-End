<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: "MembersPage"
});

interface Member {
  id: number;
  name: string;
  title: string;
  position: string;
  avatar: string;
  email: string;
  research: string[];
  description: string;
  education: string;
  achievements: string[];
}

interface Props {
  title?: string;
  subtitle?: string;
  members?: Member[];
}

const defaultMembers: Member[] = [
  {
    id: 1,
    name: '张教授',
    title: '实验室主任',
    position: '教授、博士生导师',
    avatar: '👨‍🏫',
    email: 'zhang@university.edu.cn',
    research: ['数据挖掘', '机器学习', '人工智能'],
    description: '长期从事数据科学与人工智能领域的研究工作，在国际顶级期刊发表论文50余篇。',
    education: '清华大学计算机科学与技术博士',
    achievements: ['国家杰出青年基金获得者', 'IEEE Fellow', '教育部长江学者']
  },
  {
    id: 2,
    name: '李副教授',
    title: '副主任',
    position: '副教授、硕士生导师',
    avatar: '👩‍🏫',
    email: 'li@university.edu.cn',
    research: ['自然语言处理', '知识图谱', '情报分析'],
    description: '专注于自然语言处理和知识图谱技术研究，主持多项国家级科研项目。',
    education: '北京大学计算机应用技术博士',
    achievements: ['优秀青年基金获得者', 'CCF优秀博士论文奖', '省科技进步一等奖']
  },
  {
    id: 3,
    name: '王博士',
    title: '研究员',
    position: '副研究员',
    avatar: '👨‍💼',
    email: 'wang@university.edu.cn',
    research: ['计算机视觉', '深度学习', '模式识别'],
    description: '在计算机视觉和深度学习领域有丰富的研究经验，发表高水平论文30余篇。',
    education: '中科院自动化所模式识别与智能系统博士',
    achievements: ['中科院院长奖', 'CVPR最佳论文奖', '青年科技奖']
  },
  {
    id: 4,
    name: '陈博士',
    title: '助理研究员',
    position: '讲师',
    avatar: '👩‍💼',
    email: 'chen@university.edu.cn',
    research: ['网络安全', '数据隐私', '区块链'],
    description: '专注于网络安全和隐私保护技术研究，在安全领域顶级会议发表多篇论文。',
    education: '上海交通大学网络空间安全博士',
    achievements: ['ACM SIGSAC优秀论文奖', '网络安全优秀青年奖', '创新创业大赛一等奖']
  },
  {
    id: 5,
    name: '刘硕士',
    title: '博士研究生',
    position: '在读博士',
    avatar: '👨‍🎓',
    email: 'liu@student.university.edu.cn',
    research: ['强化学习', '智能决策', '多智能体系统'],
    description: '博士三年级学生，研究方向为强化学习和智能决策，已发表SCI论文5篇。',
    education: '本校计算机科学与技术硕士',
    achievements: ['国家奖学金', '优秀研究生', 'ICML学生论文奖']
  },
  {
    id: 6,
    name: '赵硕士',
    title: '硕士研究生',
    position: '在读硕士',
    avatar: '👩‍🎓',
    email: 'zhao@student.university.edu.cn',
    research: ['数据可视化', '人机交互', '信息检索'],
    description: '硕士二年级学生，专注于数据可视化和人机交互技术研究。',
    education: '本校软件工程学士',
    achievements: ['校级优秀学生', 'CHI学生设计竞赛二等奖', '创新项目负责人']
  }
];

withDefaults(defineProps<Props>(), {
  title: '团队成员',
  subtitle: '我们拥有一支专业的研究团队',
});

const selectedMember = ref<Member | null>(null);

const showMemberDetail = (member: Member) => {
  selectedMember.value = member;
};

const closeMemberDetail = () => {
  selectedMember.value = null;
};
</script>

<template>
  <div class="members-page">
    <div class="members-header">
      <h2>{{ title }}</h2>
      <p>{{ subtitle }}</p>
    </div>
    
    <div class="members-grid">
      <div 
        v-for="member in members" 
        :key="member.id" 
        class="member-card"
        @click="showMemberDetail(member)"
      >
        <div class="member-avatar">{{ member.avatar }}</div>
        <div class="member-info">
          <h3>{{ member.name }}</h3>
          <p class="member-title">{{ member.title }}</p>
          <p class="member-position">{{ member.position }}</p>
          <div class="member-research">
            <span 
              v-for="research in member.research.slice(0, 2)" 
              :key="research" 
              class="research-tag"
            >
              {{ research }}
            </span>
            <span v-if="member.research.length > 2" class="research-more">
              +{{ member.research.length - 2 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 成员详情弹窗 -->
    <el-dialog 
      v-model="selectedMember" 
      :title="selectedMember?.name" 
      width="600px"
      @close="closeMemberDetail"
    >
      <div v-if="selectedMember" class="member-detail">
        <div class="detail-header">
          <div class="detail-avatar">{{ selectedMember.avatar }}</div>
          <div class="detail-basic">
            <h3>{{ selectedMember.name }}</h3>
            <p class="detail-title">{{ selectedMember.title }}</p>
            <p class="detail-position">{{ selectedMember.position }}</p>
            <p class="detail-email">📧 {{ selectedMember.email }}</p>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>教育背景</h4>
          <p>{{ selectedMember.education }}</p>
        </div>
        
        <div class="detail-section">
          <h4>研究方向</h4>
          <div class="research-tags">
            <span 
              v-for="research in selectedMember.research" 
              :key="research" 
              class="research-tag-detail"
            >
              {{ research }}
            </span>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>个人简介</h4>
          <p>{{ selectedMember.description }}</p>
        </div>
        
        <div class="detail-section">
          <h4>主要成就</h4>
          <ul class="achievements-list">
            <li v-for="achievement in selectedMember.achievements" :key="achievement">
              {{ achievement }}
            </li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.members-page {
  padding: 80px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  min-height: 600px;
}

.members-header {
  text-align: center;
  margin-bottom: 60px;
  
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

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.member-card {
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(148, 163, 184, 0.15);
  border: 1px solid rgba(226, 232, 240, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 48px rgba(148, 163, 184, 0.25);
  }
}

.member-avatar {
  font-size: 4rem;
  text-align: center;
  margin-bottom: 20px;
  filter: drop-shadow(0 2px 4px rgba(148, 163, 184, 0.3));
}

.member-info {
  text-align: center;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
  }
  
  .member-title {
    font-size: 1.1rem;
    color: #3b82f6;
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .member-position {
    font-size: 1rem;
    color: #64748b;
    margin-bottom: 15px;
  }
}

.member-research {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.research-tag {
  background: linear-gradient(135deg, #94a3b8, #cbd5e1);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.research-more {
  background: #e2e8f0;
  color: #64748b;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* 弹窗样式 */
.member-detail {
  .detail-header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    
    .detail-avatar {
      font-size: 5rem;
      margin-right: 30px;
    }
    
    .detail-basic {
      flex: 1;
      
      h3 {
        font-size: 2rem;
        color: #1e293b;
        margin-bottom: 8px;
      }
      
      .detail-title {
        font-size: 1.2rem;
        color: #3b82f6;
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .detail-position {
        font-size: 1rem;
        color: #64748b;
        margin-bottom: 8px;
      }
      
      .detail-email {
        font-size: 1rem;
        color: #059669;
      }
    }
  }
  
  .detail-section {
    margin-bottom: 25px;
    
    h4 {
      font-size: 1.2rem;
      color: #1e293b;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    p {
      color: #475569;
      line-height: 1.6;
    }
  }
  
  .research-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .research-tag-detail {
    background: linear-gradient(135deg, #94a3b8, #cbd5e1);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .achievements-list {
    list-style: none;
    padding: 0;
    
    li {
      color: #475569;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
      position: relative;
      padding-left: 20px;
      
      &:before {
        content: '🏆';
        position: absolute;
        left: 0;
      }
      
      &:last-child {
        border-bottom: none;
      }
    }
  }
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .members-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
  }
  
  .members-header h2 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .members-page {
    padding: 60px 15px;
  }
  
  .members-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .member-card {
    padding: 20px;
  }
  
  .member-avatar {
    font-size: 3rem;
  }
  
  .detail-header {
    flex-direction: column;
    text-align: center;
    
    .detail-avatar {
      margin-right: 0;
      margin-bottom: 20px;
    }
  }
}
</style>