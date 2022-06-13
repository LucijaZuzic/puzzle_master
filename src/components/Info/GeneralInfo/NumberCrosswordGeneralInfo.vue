<script>
export default {
  data() {
    return {};
  },
  components: {},
  methods: {},
};
</script>

<template>
  <h6 class="display-6">Uvod</h6>
  <br />
  <span class="tab"></span> Brojevna križaljka je vrsta zagonetke u kojoj su sva
  polja pravokutne mreže ispunjena znamenkama ili barijerama. U toj mreži moguće
  je pronaći sve brojeve s popisa brojeva.
  <br />
  <br />
  <h6 class="display-6">
    <va-icon size="medium" color="#FA8072" name="contrast"></va-icon>&nbsp; Dio
    rješenja
  </h6>
  <br />

  <span class="tab"></span>
  Može se tamnijom ružičastom bojom osjenčati određeno polje te ga tako označiti
  kao dio rješenja, odnosno pojma koji je opisan prilikom zadavanja zagonetke.

  <br />
  <br />

  <h6 class="display-6">
    <va-icon size="medium" color="#000000" name="contrast"></va-icon>&nbsp;
    Barijera
  </h6>
  <br />

  <span class="tab"></span>Prazna polja, odnosno barijere koje označavaju
  granice između uzastopnih pojmova u istom retku ili stupcu, ispunjena su crnom
  bojom.
</template>

<style scoped>
.tab {
  display: inline-block;
  margin-left: 40px;
}
</style>
