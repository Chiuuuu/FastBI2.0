<template>
  <div class="data-model" :style="config.style">
    <div class="title">数据模型</div>

  </div>
</template>

<script>
export default {
  name: 'BoardDataModel',
    props: {
      config: {
        type: Object,
        required: true
      }
    }

}
</script>

<style>

</style>
