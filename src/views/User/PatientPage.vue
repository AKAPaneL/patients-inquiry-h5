<script setup lang="ts">
import { getPatientList } from '@/services/user'
import { ref } from 'vue'
import type { PatientList, Patient } from '@/types/user'
import cpNavBar from '@/components/cp-nav-bar.vue'
import cpRadioBtn from '@/components/cp-radio-btn.vue'

const patientList = ref<PatientList>([])
const options = ref([
  { label: '男', value: 1 },
  { label: '女', value: 0 }
])
const gender = ref(1)
//加载患者列表
const loadPatientList = async () => {
  const res = await getPatientList()
  patientList.value = res.data
}
loadPatientList()

// --打开侧滑栏
const show = ref(false)
const showPopup = () => {
  show.value = true
}
const patientForm = ref<Patient>({
  name: '',
  idCard: '',
  defaultFlag: 0,
  gender: 1
})
</script>

<template>
  <div class="patient-page">
    <cp-nav-bar title="家庭档案"></cp-nav-bar>
    <div class="patient-list">
      <div class="patient-item" v-for="item in patientList" :key="item.id">
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <span class="id">{{ item.idCard }}</span>
          <span>{{ item.gender ? '男' : '女' }}</span>
          <span>{{ item.age }}岁</span>
        </div>
        <div class="icon"><cp-icon name="user-edit" /></div>
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <div
        class="patient-add"
        v-if="patientList.length < 6"
        @click="showPopup()"
      >
        <cp-icon name="user-add" />
        <p>添加患者</p>
      </div>
      <div class="patient-tip">最多可添加 6 人</div>
    </div>
    <!-- 侧边栏 -->
    <van-popup v-model:show="show" position="right">
      <cp-nav-bar
        title="添加患者"
        right-text="保存"
        :back="() => (show = false)"
      ></cp-nav-bar>
      <van-field
        v-model="patientForm.name"
        label="真实姓名"
        placeholder="请输入真实姓名"
      />
      <van-field
        v-model="patientForm.idCard"
        label="身份证号"
        placeholder="请输入身份证号"
      />
      <van-field label="性别" class="pb4">
        <!-- 单选按钮组件 -->
        <template #input>
          <cp-radio-btn
            v-model="patientForm.gender"
            :options="options"
          ></cp-radio-btn>
        </template>
      </van-field>
      {{ patientForm.gender }}
      <van-field label="默认就诊人">
        <template #input>
          <van-checkbox
            v-model="patientForm.defaultFlag"
            :icon-size="18"
            round
          />
        </template>
      </van-field>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.patient-page {
  padding: 46px 0 80px;
  :deep() {
    .van-popup {
      width: 90%;
      height: 100%;
    }
  }
}
.patient-list {
  padding: 15px;
}
.patient-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: var(--cp-bg);
  border-radius: 8px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid var(--cp-bg);
  transition: all 0.3s;
  overflow: hidden;
  .info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    span {
      color: var(--cp-tip);
      margin-right: 20px;
      line-height: 30px;
      &.name {
        font-size: 16px;
        color: var(--cp-text1);
        width: 80px;
        margin-right: 0;
      }
      &.id {
        color: var(--cp-text2);
        width: 180px;
      }
    }
  }
  .icon {
    color: var(--cp-tag);
    width: 20px;
    text-align: center;
  }
  .tag {
    position: absolute;
    right: 60px;
    top: 21px;
    width: 30px;
    height: 16px;
    font-size: 10px;
    color: #fff;
    background-color: var(--cp-primary);
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &.selected {
    border-color: var(--cp-primary);
    background-color: var(--cp-plain);
    .icon {
      color: var(--cp-primary);
    }
  }
}
.patient-add {
  background-color: var(--cp-bg);
  color: var(--cp-primary);
  text-align: center;
  padding: 15px 0;
  border-radius: 8px;
  .cp-icon {
    font-size: 24px;
  }
}
.patient-tip {
  color: var(--cp-tag);
  padding: 12px 0;
}
.pb4 {
  padding-bottom: 4px;
}
</style>
