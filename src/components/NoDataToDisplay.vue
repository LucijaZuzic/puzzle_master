<script>
export default {
  props: ["customMessage"],
  data() {
    return { 
    };
  },
  components: {},
  methods: {},
};
</script>

<template> 
  <div class="myrow">
    <span style="font-weight: bold">
      <va-icon name="folder_off"></va-icon>&nbsp; {{ customMessage }}
    </span>
  </div>
</template>

<style scoped></style>
