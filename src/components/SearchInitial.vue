<script>
import InitialTable from "./InitialTable.vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
export default {
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
    InitialTable,
  },
};
</script>

<template>
  <body class="my_body">
    <div class="my_row">
      <h4 class="display-4">
        <va-icon size="large" name="text_rotation_none"></va-icon>
        &nbsp; Inicijalne osmosmjerke
      </h4>
    </div>
    <InitialTable selectMode="single" :friend="user"></InitialTable>
  </body>
</template>

<style scoped></style>
