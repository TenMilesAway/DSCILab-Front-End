<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

defineOptions({
  name: "ContactPage"
});

// 联系信息数据
const contactInfo = {
  labName: '数据科学与情报分析实验室',
  address: '北京市昌平区中国移动国际信息港G33号楼 - 5层',
};

// 团队成员联系方式
const teamContacts = [
  {
    name: '刘秀磊',
    title: '实验室负责人',
    email: 'liu@bistu.edu.cn',
    phone: '+86-10-6279-5587',
  },
  {
    name: '李宁',
    title: '教授',
    email: 'li@bistu.edu.cn',
    phone: '+86-10-6279-5588',
  },
  {
    name: '佟强',
    title: '副教授',
    email: 'tongq85@bistu.edu.cn',
    phone: '+86-10-6279-5589',
  }
];

// 表单数据
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

// 提交表单
const submitForm = () => {
  // 这里可以添加表单提交逻辑
  console.log('表单提交:', form.value);
  // 显示成功消息
  ElMessage.success('消息已发送，我们会尽快回复您！');
  // 重置表单
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
};
</script>

<template>
  <div class="contact-page">
    <!-- 页面标题 -->
    <div class="contact-header">
      <h1>联系我们</h1>
      <p>我们期待与您的交流合作</p>
    </div>

    <div class="contact-container">
      <!-- 左侧联系信息 -->
      <div class="contact-info">
        <div class="info-card">
          <div class="card-header">
            <h3>实验室信息</h3>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="label">实验室：</span>
              <span class="value">{{ contactInfo.labName }}</span>
            </div>
            <div class="info-item">
              <span class="label">地址：</span>
              <span class="value">{{ contactInfo.address }}</span>
            </div>
          </div>
        </div>

        <!-- 团队联系方式 -->
        <div class="team-contacts">
          <div class="card-header">
            <h3>团队联系方式</h3>
          </div>
          <div class="team-list">
            <div v-for="member in teamContacts" :key="member.name" class="team-member">
              <div class="member-info">
                <h4>{{ member.name }}</h4>
                <p class="title">{{ member.title }}</p>
                <div class="contact-details">
                  <div class="detail-item">
                    <span>{{ member.email }}</span>
                  </div>
                  <div class="detail-item">
                    <span>{{ member.phone }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧联系表单 -->
      <div class="contact-form">
        <div class="form-card">
          <div class="card-header">
            <h3>发送消息</h3>
          </div>
          <el-form :model="form" label-position="top" class="contact-form-content">
            <el-form-item label="姓名">
              <el-input v-model="form.name" placeholder="请输入您的姓名" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="form.email" type="email" placeholder="请输入您的邮箱" />
            </el-form-item>
            <el-form-item label="主题">
              <el-input v-model="form.subject" placeholder="请输入消息主题" />
            </el-form-item>
            <el-form-item label="消息内容">
              <el-input 
                v-model="form.message" 
                type="textarea" 
                :rows="6" 
                placeholder="请输入您想要发送的消息内容..."
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm" class="submit-btn">
                发送消息
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.contact-page {
  padding: 40px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  min-height: calc(100vh - 70px);
}

.contact-header {
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
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

.contact-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto 60px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.info-card,
.team-contacts,
.form-card {
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(148, 163, 184, 0.15);
  border: 1px solid rgba(226, 232, 240, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(148, 163, 184, 0.2);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  
  .icon {
    font-size: 1.5rem;
    filter: drop-shadow(0 2px 4px rgba(148, 163, 184, 0.3));
  }
  
  h3 {
    font-size: 1.4rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  
  .label {
    font-weight: 500;
    color: #475569;
    min-width: 80px;
    flex-shrink: 0;
  }
  
  .value {
    color: #1e293b;
    word-break: break-all;
  }
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.team-member {
  padding: 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 4px 0;
  }
  
  .title {
    font-size: 0.9rem;
    color: #3b82f6;
    margin: 0 0 12px 0;
    font-weight: 500;
  }
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #475569;
  
  .icon {
    font-size: 0.8rem;
  }
}

.contact-form-content {
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .el-form-item__label {
    font-weight: 500;
    color: #374151;
  }
  
  .el-input__wrapper {
    border-radius: 8px;
  }
  
  .submit-btn {
    width: 100%;
    height: 44px;
    border-radius: 8px;
    font-weight: 500;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #2563eb, #1e40af);
    }
  }
}

.map-section {
  max-width: 1200px;
  margin: 0 auto;
}

.map-header {
  text-align: center;
  margin-bottom: 24px;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
  }
  
  p {
    color: #475569;
    margin: 0;
  }
}

.map-placeholder {
  height: 300px;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-content {
  text-align: center;
  
  .map-icon {
    font-size: 3rem;
    margin-bottom: 16px;
    filter: drop-shadow(0 2px 4px rgba(148, 163, 184, 0.3));
  }
  
  p {
    font-size: 1.1rem;
    color: #475569;
    margin-bottom: 8px;
  }
  
  small {
    color: #94a3b8;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .contact-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .contact-header h1 {
    font-size: 2rem;
  }
  
  .info-card,
  .team-contacts,
  .form-card {
    padding: 20px;
  }
}
</style>