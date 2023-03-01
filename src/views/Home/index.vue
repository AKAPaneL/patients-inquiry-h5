<script setup lang="ts">
import cpIcon from '@/components/cp-icon.vue'
import icon from '@/icons/login/eye-off.svg'
</script>

<template>
  <div>
    首页
    <img src="@/icons/login/eye-off.svg" alt="" />
    <cpIcon name="login-eye-on"></cpIcon>
    <van-icon :name="icon" />
  </div>
</template>

<style lang="scss" scoped></style>
