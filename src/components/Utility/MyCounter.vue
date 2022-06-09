<template>
  <div style="display: inline-block; overflow-wrap: anywhere !important; padding: 10px">
    <span v-if="is_zoom"> <va-icon size="small" name="search" />&nbsp;  </span>
    <va-button
      v-if="is_page_number"
      :disabled="value == min_value"
      size="small"
      outline
      round
      :rounded="false"
      style="border: none"
      @click="
        value = min_value;
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
    >
      <va-icon size="small" name="first_page"></va-icon>
    </va-button>
    {{ some_text }}
    <va-button
      v-if="is_zoom"
      :disabled="value == 100"
      size="small"
      outline
      round
      :rounded="false"
      style="border: none"
      @click="
        value = 100;
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
    >
      <va-icon size="small" name="restart_alt"></va-icon>
    </va-button>
    <va-button
      v-if="is_page_size"
      :disabled="value == min_value"
      size="small"
      outline
      round
      :rounded="false"
      style="border: none"
      @click="
        value = min_value;
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
    >
      <va-icon size="small" name="compress"></va-icon>
    </va-button>
    <va-button
      v-if="is_page_size"
      :disabled="value == max_value"
      size="small"
      outline
      round
      :rounded="false"
      style="border: none"
      @click="
        value = max_value;
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
    >
      <va-icon size="small" name="expand"></va-icon>
    </va-button>
    <va-button
      v-if="is_page_number"
      :disabled="value == max_value"
      size="small"
      outline
      round
      :rounded="false"
      style="border: none"
      @click="
        value = max_value;
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
    >
      <va-icon size="small" name="last_page"></va-icon>
    </va-button> 
    <br /> 
    <br />  
    <span
      v-if="min_value < value"
      style="font-weight: bold; color: #babfc2"
      @click="
        value = value - 1;
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
    >
      {{ value - 1 }} 
    </span>
    <span
      v-if="min_value == value && !is_page_size && !is_page_number"
      style="font-weight: bold; color: #babfc2"
      @click="
        value = max_value;
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
    >
      {{ max_value }} 
    </span> 
    <span
      style="
        width: 25px;
        vertical-align: middle;
        text-align: center;
        font-weight: bold;
        color: #767c88;
      "
    >
      &nbsp;  | <input
        @input="
          value = Math.max(min_value, Math.min(value, max_value));
          $emit('input', value);
        "
        v-model="value"
        :min="min_value"
        :max="max_value"
        type="number"
      />  |  &nbsp; 
    </span>
    <span
      v-if="max_value > value"
      style="font-weight: bold; color: #babfc2"
      @click="
        value = value + 1;
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
    >
        {{ value + 1 }} 
    </span>
    <span
      v-if="max_value == value && !is_page_size && !is_page_number"
      style="font-weight: bold; color: #babfc2"
      @click="
        value = min_value;
        value = Math.max(min_value, Math.min(value, max_value));
        $emit('input', value);
      "
    >
        {{ min_value }} 
    </span>
    <br /> 
  </div>
</template>

<script>
export default {
  emits: ["input"],
  props: [
    "value",
    "some_text",
    "max_value",
    "min_value",
    "is_page_size",
    "is_page_number",
    "is_zoom",
  ],
  components: {},
  data() {
    return {};
  },
};
</script>

<style scoped>
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
  border: none;
  width: 25px;
  background-color: transparent; 
  vertical-align: middle;
  text-align: center;
  font-weight: bold;
  color: #767c88;
  display: inline-block;
  margin: none;
  padding: none;
}
</style>
