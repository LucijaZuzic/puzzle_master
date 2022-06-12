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
 <h6 class="display-6">Dimenzije</h6>
  <br />
  <span class="tab"></span>
  Incijalnoj osmosmjerci zadajemo broj redaka i stupaca.
  Maksimalni broj redaka je 50, a isto vrijedi i za stupce.  
  <br />
  <br /> 
  <h6 class="display-6">Ispuna mreže</h6>
  <br />
  <span class="tab"></span>
  Mreža se može ispuniti riječima u osam smjerova. Dvoslovi se mogu posebno dodavati u riječ jer većina tipkovica ne podržava njihov 
 direktan unos, a ponekada je potrebno prikazati ih u jednom, a ne dva polja mreže. 
 Može se odjednom izbrisati sve riječi. 

  <br />
  <br /> 
      <h6 class="display-6">  Početno slovo  </h6>
  <br />
  <span class="tab"></span>
   Početna slova riječi su označena plavom bojom pozadine i podebljana. 
   Slovo se može označiti kao dio rješenja tamnijom ružičastom bojom pozadine, ukoliko nije početno slovo riječi. 
  
  <br />
  <br />
  <h6 class="display-6">Zagonetka</h6>
  <br />
  <span class="tab"></span>
  Inicijalna osmosmjerka je predstavljena mrežom unutar koje svako polje moramo ispuniti 
  slovima zadane abecede. 
  Dostupni su znakovi osnovnog latiničnog pisma i hrvatski dijakritički i
  složeni znakovi. Zadnja aktivna pozicija u
  mreži naznačena je iznad mreže radi lakšeg snalaženja. Veličina mreže može se
  prilagoditi radi bolje vidljivosti.
<br />
  <br /> 
  <h6 class="display-6">Rješenje</h6>
  <br />
  <span class="tab"></span> 

  Slova koje su označena kao dio rješenja tvore pojam koji je opisan prilikom zadavanja zagonetke i osjenčana su tamnijom ružičastom bojom.
  <br />
  <br /> 
  <h6 class="display-6">Riječi po smjerovima</h6>
  <br />
  <span class="tab"></span> 

  Prilikom zadavanja riječ se postavlja u zagonetku u jednom od osam smjerova koji
   ukoliko ima dovoljno slobodnih mjesta i ako se slova u
  poljima poklapaju.
  Riječi u svakom od osam smjerova koje su dodane kao dio inicijalne osmosmjerke mogu se pregledati i može se ukloniti samo jedna ili sve riječi u smjeru.
  <br />
  <br />
  <h6 class="display-6">Podaci o zagonetci</h6>
  <br />
  <span class="tab"></span>
  Obvezno je zagonetci navesti naslov zbog identifikacije, opis koji pomaže
  prilikom rješavanja te izvor koji omogućava da se priznaju zasluge originalnom
  autoru ukoliko se prepisuje tuđu zagonetku u sustav. Izborno je uz zagonetku
  dodati i sliku koja uz opis pruža dodatnu pomoć prilikom rješavanja.

  <br />
  <br />
  <h6 class="display-6">Vidljivost</h6>
  <br />
  <span class="tab"></span>
  Prilikom izmjene ili prvog upisa zagonetke, može se dodati suradnika. Ukoliko
  želimo dopustiti bilo kome da uređuje zagonetku, a ne samo suradnicima, možemo
  označiti da je zagonetka javna.

  <br />
  <br />
  <h6 class="display-6">Dozvola uređivanja</h6>
  <br />
  <span class="tab"></span>
  Samo originalni autor može izmijeniti vidljivost zagonetke i dodavati
  suradnike. Ne može se dodati korisnika kao suradnika na zagonetci ukoliko
  niste prijatelji u sustavu.

  <br />
  <br />
  <h6 class="display-6">Udvostručavanje zagonetke</h6>
  <br />
  <span class="tab"></span>
  Ako je zagonetka vidljiva, može ju se udvostručiti i uređivati kopiju bez
  promjene originala. Kao autor kopije biti će upisan onaj tko je izradio
  kopiju, a ne autor originala. Kao vrijeme kreiranja kopije biti će upisano
  vrijeme kada je izrađena kopija, a ne vrijeme kada je izrađen original.
</template>
<style scoped>
.tab {
  display: inline-block;
  margin-left: 40px;
}
</style>
