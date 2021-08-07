<template>
  <div :class="['gui-field', {'has-padding': hasPadding}]">
    <div class="gui-field-name" :style="width? 'width:'+ width : ''">{{label?label:'&nbsp;&nbsp;'}}</div>
    <div class="gui-field-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      label: String,
      hasPadding: Boolean,
      width: String
    }
  }
</script>
