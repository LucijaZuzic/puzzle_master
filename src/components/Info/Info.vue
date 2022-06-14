<script>
import CryptogramGeneralInfo from "./GeneralInfo/CryptogramGeneralInfo.vue";
import CryptogramEditInfo from "./EditInfo/CryptogramEditInfo.vue";
import CryptogramSolveInfo from "./SolveInfo/CryptogramSolveInfo.vue";

import EightGeneralInfo from "./GeneralInfo/EightGeneralInfo.vue";
import EightEditInfo from "./EditInfo/EightEditInfo.vue";
import EightSolveInfo from "./SolveInfo/EightSolveInfo.vue";

import InitialGeneralInfo from "./GeneralInfo/InitialGeneralInfo.vue";
import InitialEditInfo from "./EditInfo/InitialEditInfo.vue";
import InitialSolveInfo from "./SolveInfo/InitialSolveInfo.vue";

import IntegramGeneralInfo from "./GeneralInfo/IntegramGeneralInfo.vue";
import IntegramEditInfo from "./EditInfo/IntegramEditInfo.vue";
import IntegramSolveInfo from "./SolveInfo/IntegramSolveInfo.vue";

import NonogramGeneralInfo from "./GeneralInfo/NonogramGeneralInfo.vue";
import NonogramEditInfo from "./EditInfo/NonogramEditInfo.vue";
import NonogramSolveInfo from "./SolveInfo/NonogramSolveInfo.vue";

import NumberCrosswordGeneralInfo from "./GeneralInfo/NumberCrosswordGeneralInfo.vue";
import NumberCrosswordEditInfo from "./EditInfo/NumberCrosswordEditInfo.vue";
import NumberCrosswordSolveInfo from "./SolveInfo/NumberCrosswordSolveInfo.vue";

import NumberLetterGeneralInfo from "./GeneralInfo/NumberLetterGeneralInfo.vue";
import NumberLetterEditInfo from "./EditInfo/NumberLetterEditInfo.vue";
import NumberLetterSolveInfo from "./SolveInfo/NumberLetterSolveInfo.vue";

export default {
  props: ["title", "icon", "general", "edit", "solve"],
  data() {
    return {
      choice: "general",
    };
  },
  components: {
    CryptogramGeneralInfo,
    CryptogramEditInfo,
    CryptogramSolveInfo,
    EightGeneralInfo,
    EightEditInfo,
    EightSolveInfo,
    InitialGeneralInfo,
    InitialEditInfo,
    InitialSolveInfo,
    IntegramGeneralInfo,
    IntegramEditInfo,
    IntegramSolveInfo,
    NonogramGeneralInfo,
    NonogramEditInfo,
    NonogramSolveInfo,
    NumberCrosswordGeneralInfo,
    NumberCrosswordEditInfo,
    NumberCrosswordSolveInfo,
    NumberLetterGeneralInfo,
    NumberLetterEditInfo,
    NumberLetterSolveInfo,
  },
  methods: {},
};
</script>

<template>
  <div style="max-height: 80vh; max-width: 80vw">
  <h4 class="display-4" style="text-align: center; vertical-align: middle">
    <va-icon size="large" :name="icon"></va-icon>&nbsp; {{ title }}
  </h4>
  <br />
  <va-tabs v-model="choice">
    <template #tabs>
      <va-tab name="general">Općenito</va-tab>
      <va-tab name="edit">Zadavanje</va-tab>
      <va-tab name="solve">Rješavanje</va-tab>
    </template>
  </va-tabs>
  <br />
  <div style="overflow-y: scroll; max-height: 50vh">
    <component v-if="choice == 'general'" :is="general" />
    <component v-if="choice == 'edit'" :is="edit" />
    <component v-if="choice == 'solve'" :is="solve" />
  </div>
  </div>
</template>

<style scoped>
</style>
