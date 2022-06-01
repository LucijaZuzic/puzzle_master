<template>
  <!--<div  style="white-space: nowrap;">-->
  <span v-if="some_text != 'Povećanje'">
    <span>
      {{ some_text }}
      <br />
      <br />
      <va-chip outline>
        <span style="display: inline-block; overflow-wrap: anywhere !important">
          <va-button
            size="small"
            outline
            round
            style="border: none"
            :rounded="false"
            :disabled="value <= min_value"
            @click="
              value = min_value;
              value = Math.max(min_value, Math.min(value, max_value));
              $emit('input', value);
            "
          >
            <va-icon size="small" name="first_page"></va-icon>
          </va-button>
          <va-button
            size="small"
            outline
            round
            :rounded="false"
            style="border: none"
            :disabled="value <= min_value"
            @click="
              value--;
              value = Math.max(min_value, Math.min(value, max_value));
              $emit('input', value);
            "
          >
            <va-icon size="small" name="chevron_left"></va-icon>
          </va-button>
          <input
            style="
              border: none;
              width: 25px;
              vertical-align: middle;
              text-align: center;
            "
            @input="
              value = Math.max(min_value, Math.min(value, max_value));
              $emit('input', value);
            "
            v-model="value"
            :min="min_value"
            :max="max_value"
            type="number" />
          <va-button
            size="small"
            outline
            round
            :rounded="false"
            style="border: none"
            :disabled="value >= max_value"
            @click="
              value++;
              value = Math.max(min_value, Math.min(value, max_value));
              $emit('input', value);
            "
          >
            <va-icon size="small" name="chevron_right"></va-icon>
          </va-button>
          <va-button
            size="small"
            outline
            round
            :rounded="false"
            style="border: none"
            :disabled="value >= max_value"
            @click="
              value = max_value;
              value = Math.max(min_value, Math.min(value, max_value));
              $emit('input', value);
            "
          >
            <va-icon size="small" name="last_page"></va-icon> </va-button
        ></span>
      </va-chip>
    </span>
  </span>
  <span v-else>
    <span>
      <va-icon size="small" name="search" />&nbsp; {{ some_text }}
      <va-button
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
      <br />
      <br />
      <va-chip outline>
        <span style="display: inline-block; overflow-wrap: anywhere !important">
          <va-button
            size="small"
            outline
            round
            :rounded="false"
            style="border: none"
            :disabled="value <= min_value"
            @click="
              value = min_value;
              value = Math.max(min_value, Math.min(value, max_value));
              $emit('input', value);
            "
          >
            <va-icon size="small" name="first_page"></va-icon>
          </va-button>
          <va-button
            size="small"
            outline
            round
            :rounded="false"
            style="border: none"
            :disabled="value <= min_value"
            @click="
              value--;
              value = Math.max(min_value, Math.min(value, max_value));
              $emit('input', value);
            "
          >
            <va-icon size="small" name="chevron_left"></va-icon>
          </va-button>
          <input
            style="
              border: none;
              width: 25px;
              vertical-align: middle;
              text-align: center;
            "
            @input="
              value = Math.max(min_value, Math.min(value, max_value));
              $emit('input', value);
            "
            v-model="value"
            :min="min_value"
            :max="max_value"
            type="number"
          />
          <va-button
            size="small"
            outline
            round
            :rounded="false"
            style="border: none"
            :disabled="value >= max_value"
            @click="
              value++;
              value = Math.max(min_value, Math.min(value, max_value));
              $emit('input', value);
            "
          >
            <va-icon size="small" name="chevron_right"></va-icon>
          </va-button>
          <va-button
            size="small"
            outline
            round
            :rounded="false"
            style="border: none"
            :disabled="value >= max_value"
            @click="
              value = max_value;
              value = Math.max(min_value, Math.min(value, max_value));
              $emit('input', value);
            "
          >
            <va-icon size="small" name="last_page"></va-icon>
          </va-button>
        </span>
      </va-chip>
    </span>
  </span>
  <!-- </div>-->
</template>

<script>
export default {
  emits: ["input"],
  props: ["value", "some_text", "max_value", "min_value"],
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
}
</style>
