<script>
import Info from "./Info.vue";
export default {
  data() {
    return {};
  },
  components: {
    Info,
  },
  methods: {},
};
</script>

<template>
  <Info
    title="Brojevne križaljke"
    icon="format_list_numbered"
    general="NumberCrosswordGeneralInfo"
    edit="NumberCrosswordEditInfo"
    solve="NumberCrosswordSolveInfo"
  ></Info>
</template>

<style scoped>
</style>
