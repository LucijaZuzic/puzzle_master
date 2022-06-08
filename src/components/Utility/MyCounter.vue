<template>
  <span v-if="!is_zoom">
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
            <span v-if="!is_page_number">{{ min_value }}</span>
            <va-icon v-else size="small" name="compress"></va-icon>
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
            <va-icon
              v-if="!is_page_number"
              size="small"
              name="arrow_left"
            ></va-icon>
            <va-icon v-else size="small" name="unfold_less"></va-icon>
          </va-button>
          <input
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
            <va-icon
              v-if="!is_page_number"
              size="small"
              name="arrow_right"
            ></va-icon>
            <va-icon v-else size="small" name="unfold_more"></va-icon>
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
            <span v-if="!is_page_number">{{ max_value }}</span>
            <va-icon v-else size="small" name="expand"></va-icon>
          </va-button>
        </span>
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
            MIN
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
            -
          </va-button>
          <input
            @input="
              value = Math.max(min_value, Math.min(value, max_value));
              $emit('input', value);
            "
            v-model="value"
            :min="min_value"
            :max="max_value"
            type="number"
          />%
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
            +
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
            MAX
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
  props: [
    "value",
    "some_text",
    "max_value",
    "min_value",
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
  background-color: transparent;
  width: 25px;
  vertical-align: middle;
  text-align: center;
  font-weight: bold;
  color: #767c88;
}
</style>
