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
    title="Isti broj - isto slovo"
    icon="sync_alt"
    general="NumberLetterGeneralInfo"
    edit="NumberLetterEditInfo"
    solve="NumberLetterSolveInfo"
  ></Info>
</template>

<style scoped>
</style>
