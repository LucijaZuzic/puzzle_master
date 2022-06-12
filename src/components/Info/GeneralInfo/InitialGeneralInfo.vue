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
  <h6 class="display-6" >
    Uvod
  </h6>
  <br />
  <span>
    <span class="tab"></span>Inicijalna osmosmjerka je vrsta zagonetke u kojoj su u pravokutnoj mreži ispunjena samo početna slova riječi. 
    U toj mreži moguće je smjestiti sve riječi
    s popisa pojmova.

    <br />
    <br />
      <h6 class="display-6"><va-icon size="medium" color="black" name="contrast"></va-icon> &nbsp; Dio osmosmjerke</h6>

    <br />

  <span class="tab"></span>
    Više riječi može započinjati na istom slovu. Ista riječ može se pojaviti u
    mreži više puta, ali u tom slučaju ponovit će se na popisu pojmova onoliko
    puta koliko se pojavljuje i u mreži.

    <br />
    <br />
      <h6 class="display-6"><va-icon size="medium" color="black" name="arrow_forward"></va-icon> &nbsp; Smjer</h6>

    <br />
  <span class="tab"></span>
       Riječi su zapisane u jednom od osam mogućih smjerova od početnog prema
    zadnjem slovu. Smjerovi su gore, dolje, lijevo, desno, gore lijevo, gore
    desno, dolje lijevo i dolje desno. Riječi su razvrstne prema smjeru u kojem
    su zapisane, a onda abecedno sortirane.

    <br />
    <br />
      <h6 class="display-6"><va-icon size="medium" color="#FA8072" name="contrast"></va-icon> &nbsp; Dio rješenja</h6>

    <br />
  <span class="tab"></span>
    Zadatak rješavača je smjestiti u mrežu sve pojmove s popisa
    pojmova. Nakon što su svi pojmovi smješteni, slova u poljima koja su osjenčana tamnijom ružičastom bojom
    pozadine označavaju rješenje koje je opisano prilikom zadavanja zagonetke.
  </span>
</template>

<style scoped>
.tab {
  display: inline-block;
  margin-left: 40px;
}
</style>
