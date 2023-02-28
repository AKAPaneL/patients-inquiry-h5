<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Button as vantButton } from 'vant'
import { useUserStroe } from './stores/user'
import { request } from './utils/request'
import type { User } from './types/user'

const store = useUserStroe()

const login = async () => {
  const res = await request<User>('/login/password', 'post', {
    mobile: '13211112222',
    password: 'abc12345'
  })
  store.setUser(res.data)
}
</script>

<template>
  <span>用户名：{{ store.user?.account }}</span>
  <span>密码：{{ store.user?.mobile }}</span>
  <vantButton type="primary" @click="login">登录</vantButton>
  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
