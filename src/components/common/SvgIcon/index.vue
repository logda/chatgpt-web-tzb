<script setup lang='ts'>
import { computed, useAttrs } from 'vue'
import { Icon } from '@iconify/vue'
// import IconMdl from '~icons/mdi-light/home'

interface Props {
  icon?: string
}

defineProps<Props>()

const attrs = useAttrs()

const bindAttrs = computed<{ class: string; style: string }>(() => ({
  class: (attrs.class as string) || '',
  style: (attrs.style as string) || '',
}))
</script>

<template>
  <!-- <Icon :icon="icon" v-bind="bindAttrs" /> -->
  <i :class="'iconfont ' + icon" v-bind="bindAttrs"></i>
  <!-- <IconMdl></IconMdl> -->
  <!-- {{icon}} -->
</template>

<style lang="less" scoped>
.iconfont {
  font-size: 14px;
}
</style>
