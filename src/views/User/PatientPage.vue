<script setup lang="ts">
import {
  getPatientList,
  addPatient,
  getPatientById,
  editPatientPort,
  deletPatient
} from '@/services/user'
import { ref, computed } from 'vue'
import type { PatientList, Patient } from '@/types/user'
import {
  showSuccessToast,
  showDialog,
  showConfirmDialog,
  showToast,
  type FormInstance
} from 'vant'
import { nameRules, idCardRules } from '@/utils/rules'
import cpNavBar from '@/components/cp-nav-bar.vue'
import cpIcon from '@/components/cp-icon.vue'
import cpRadioBtn from '@/components/cp-radio-btn.vue'
import { useRoute } from 'vue-router'
import { useConsultStore } from '@/stores/modules/consult'
import router from '@/router'
// import { useRouter } from 'vue-router'

// const router = useRouter()

const patientList = ref<PatientList>([])
const options = ref([
  { label: '男', value: 1 },
  { label: '女', value: 0 }
])
//加载患者列表
const loadPatientList = async () => {
  const res = await getPatientList()
  patientList.value = res.data
  // 设置默认选中的ID，当你是选择患者的时候，且有患者信息的时候
  if (isChange.value && patientList.value.length) {
    patientId.value = patientList.value.find((v) => v.defaultFlag === 1)?.id
    if (!patientId.value) patientId.value = patientList.value[0].id
  }
}
loadPatientList()

const show = ref(false) //侧划栏显示数据

//表单初始值：--
const initPatient: Patient = {
  name: '',
  idCard: '',
  gender: 1,
  defaultFlag: 0
}
// 表单绑定数据：--
const patientForm = ref<Patient>({
  name: '',
  idCard: '',
  defaultFlag: 0,
  gender: 1
})
// 打开表单函数--// --打开侧滑栏
const showPopup = () => {
  patientForm.value = { ...initPatient }
  form.value?.resetValidation()
  show.value = true
}
const form = ref<FormInstance>()
// 计算属性：--
const defaultFlag = computed({
  get: () => (patientForm.value.defaultFlag ? true : false),
  set: (newValue) => {
    patientForm.value.defaultFlag = newValue ? 1 : 0
  }
})
//添加患者函数
let adding = false
const savePatient = async () => {
  //1.调用全局验证
  // 判断身份证倒数第二位
  await form.value?.validate()
  const gender = +patientForm.value.idCard.slice(-2, -1) % 2
  if (gender !== patientForm.value.gender) {
    await showDialog({
      title: '温馨提示',
      message: '身份证上的性别信息与您填写不符合'
    })
    return
  }
  // 节流阀：
  if (adding) return
  adding = true

  // 2.验证通过--调用接口添加
  if (patientForm.value.id) {
    await editPatientPort(patientForm.value)
  } else {
    await addPatient(patientForm.value)
  }
  // 3.成功添加弹出信息
  showSuccessToast('添加成功')
  // 4.关闭表单
  show.value = false
  // 5.刷新页面
  await loadPatientList()
  adding = false
}
// 点击编辑
const editPatient = async (id: string) => {
  showPopup()
  const res = await getPatientById(id)
  const { name, idCard, defaultFlag, gender } = res.data
  patientForm.value = { name, idCard, defaultFlag, id, gender }
  console.log(res)
}
// 删除患者
const removePatient = async () => {
  if (patientForm.value.id) {
    await showConfirmDialog({
      title: '温馨提示',
      message: '该操作将永久删除个人信息。您确认吗'
    })
    await deletPatient(patientForm.value.id)
    showSuccessToast('删除成功')
    // 关闭表单
    show.value = false
    // 刷新页面
    await loadPatientList()
  }
}
const route = useRoute()
const isChange = computed(() => {
  return route.query.isChange && route.query.isChange === '1'
})
const patientId = ref()
const selectedPatient = (id: string) => {
  if (!isChange.value) return
  patientId.value = id
}
const store = useConsultStore()
const next = () => {
  if (!patientId.value) return showToast('请选择患者信息')
  store.setPatient(patientId.value)
  router.push('/consult/pay')
}
</script>

<template>
  <div class="patient-page">
    <cp-nav-bar :title="isChange ? '选择患者' : '家庭档案'"></cp-nav-bar>
    <!-- 头部提示 -->
    <div class="patient-change" v-if="isChange">
      <h3>请选择患者信息</h3>
      <p>以便医生给出更准确的治疗，信息仅医生可见</p>
    </div>
    <div class="patient-list">
      <div
        class="patient-item"
        v-for="item in patientList"
        :key="item.id"
        @click="selectedPatient(item.id as string)"
        :class="{ selected: patientId === item.id }"
      >
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <span class="id">{{
            item.idCard.replace(/^(.{6}).+(.{4})$/, '\$1********\$2')
          }}</span>
          <span>{{ item.gender ? '男' : '女' }}</span>
          <span>{{ item.age }}岁</span>
        </div>
        <div class="icon" @click="editPatient(item.id as string)">
          <cp-icon name="user-edit" />
        </div>
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
    <!-- 底部按钮 -->
    <div class="patient-next" v-if="isChange">
      <van-button type="primary" round block @click="next">下一步</van-button>
    </div>
    <!-- 侧边栏 -->
    <van-popup v-model:show="show" position="right">
      <cp-nav-bar
        :title="patientForm.id ? '编辑患者' : '添加患者'"
        right-text="保存"
        :back="() => (show = false)"
        @right-click="savePatient"
      ></cp-nav-bar>
      <van-form ref="form">
        <van-field
          v-model="patientForm.name"
          label="真实姓名"
          placeholder="请输入真实姓名"
          :rules="nameRules"
        />
        <van-field
          v-model="patientForm.idCard"
          label="身份证号"
          placeholder="请输入身份证号"
          :rules="idCardRules"
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
        <van-field label="默认就诊人">
          <template #input>
            <van-checkbox v-model="defaultFlag" :icon-size="18" round />
          </template>
        </van-field>
      </van-form>
      <van-action-bar>
        <van-action-bar-button @click="removePatient"
          >删除</van-action-bar-button
        >
      </van-action-bar>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.patient-page {
  padding: 0 0 80px;
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
// 底部操作栏
.van-action-bar {
  padding: 0 10px;
  margin-bottom: 10px;
  .van-button {
    color: var(--cp-price);
    background-color: var(--cp-bg);
  }
}
.patient-change {
  padding: 15px;
  > h3 {
    font-weight: normal;
    margin-bottom: 5px;
  }
  > p {
    color: var(--cp-text3);
  }
}
.patient-next {
  padding: 15px;
  background-color: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 80px;
  box-sizing: border-box;
  margin-bottom: 50px;
}
</style>
