<script>
import CryptogramTable from "../Table/CryptogramTable.vue";
import NonogramTable from "../Table/NonogramTable.vue";
import IntegramTable from "../Table/IntegramTable.vue";
import EightTable from "../Table/EightTable.vue";
import InitialTable from "../Table/InitialTable.vue";
import NumberCrosswordTable from "../Table/NumberCrosswordTable.vue";
import NumberLetterTable from "../Table/NumberLetterTable.vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
export default {
  props: ["component_name", "title", "icon"],
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user;
        // ...
      } else {
        // User is signed out
        // ...
      }
      return true;
    });
  },
  data() {
    return {
      user: null,
    };
  },
  components: {
    CryptogramTable,
    NonogramTable,
    IntegramTable,
    CryptogramTable,
    EightTable,
    InitialTable,
    NumberCrosswordTable,
    NumberLetterTable,
  },
};
</script>

<template>
  <body class="my_body">
    <h4 class="display-4">
      <va-icon size="large" :name="icon"></va-icon>
      &nbsp; {{ title }}
    </h4>
    <component :is="component_name" selectMode="single" :friend="user">
    </component>
  </body>
</template>

<style scoped></style>
