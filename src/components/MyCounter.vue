<template>
  <va-chip outline>
        <span>
       {{ some_text }} :
        <va-button outline round :rounded="false" style="border:none" :disabled="value == min_value" @click="value = min_value;$emit('input', value)"> 
            <va-icon name="first_page"></va-icon>
        </va-button>
        <va-button outline round :rounded="false" style="border:none" :disabled="value == min_value" @click="value--;$emit('input', value)"> 
            <va-icon name="chevron_left"></va-icon>
        </va-button>
        <input
            style="
            width: 24px;
            border: none;
            vertical-align: middle;
            text-align: center;
            "
            @input="value = Math.max(min_value, Math.min(value, max_value));$emit('input', value)"
            v-model="value"
            :min="min_value"
            :max="max_value"
            type="number"
        />
        <va-button outline round :rounded="false" style="border:none" :disabled="value == max_value" @click="value++;$emit('input', value)">
            <va-icon name="chevron_right"></va-icon> 
        </va-button> 
        <va-button outline round :rounded="false" style="border:none" :disabled="value == max_value" @click="value = max_value;$emit('input', value)">
            <va-icon name="last_page"></va-icon> 
        </va-button> 
        </span>
    </va-chip>
</template>

<script>
export default {
  emits: ['input'],
  props: ['value', "some_text", "max_value", "min_value"],
  components: {},
  data() {
    return { 
      
    };
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
input[type=number] {
  -moz-appearance: textfield;
}
</style>
