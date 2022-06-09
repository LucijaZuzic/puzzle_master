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
  <h4 class="display-4" style="text-align: center; vertical-align: middle">
    <va-icon size="large" name="pattern"></va-icon>&nbsp; Osmosmjerke
  </h4>
  <br />
  <span>
    <span class="tab"></span>Osmosmjerka je vrsta zagonetke u kojoj su sva polja
    pravokutne mreže ispunjena slovima. U toj mreži moguće je pronaći sve riječi
    s popisa pojmova.

    <br />
    <br />

    Više riječi može započinjati na istom slovu. Ista riječ može se pojaviti u
    mreži više puta, ali u tom slučaju ponoviti će se na popisu pojmova onoliko
    puta koliko se pojavljuje i u mreži.

    <br />
    <br />

    Riječi su zapisane u jednom od osam mogućih smjerova od početnog prema
    zadnjem slovu. Smjerovi su gore, dolje, lijevo, desno, gore lijevo, gore
    desno, dolje lijevo i dolje desno. Riječi su razvrstne prema smjeru u kojem
    su zapisane, a onda abecedno sortirane.

    <br />
    <br />

    Zadatak rješavača je otkriti gdje se u mreži nalaze svi pojmovi s popisa
    pojmova. Nakon što su svi pojmovi pronađeni, polja koja nisu bila dio niti
    jednog pojma čine rješenje.

    <br />
    <br />

    <h6 class="display-6">
      <va-icon size="medium" color="#FA8072" name="contrast"></va-icon>&nbsp; Dio
      rješenja
    </h6>
    <br />

    <span class="tab"></span>Polja koja su osjenčana tamnijom ružičastom bojom
    pozadine označavaju rješenje koje je opisano prilikom zadavanja zagonetke.
  </span>
</template>

<style scoped>
.tab {
  display: inline-block;
  margin-left: 40px;
}
</style>
