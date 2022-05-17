<script>
export default {
  props: ["customMessage"],
  data() {
    return {
      customMessage: this.$props.customMessage,
    };
  },
  components: {},
  methods: {},
};
</script>

<template>
  <div class="myrow">
    <h1 class="display-1">Nema podataka za prikaz</h1>
  </div>
  <div class="myrow">
    <h4 class="display-4">
      {{ customMessage }}
    </h4>
  </div>
</template>

<style></style>
