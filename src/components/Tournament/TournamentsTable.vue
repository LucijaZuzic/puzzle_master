<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { tournamentsRef } from "../../firebase_main.js";

import IntegramTable from "../Table/IntegramTable.vue";
import NonogramTable from "../Table/NonogramTable.vue";
import NumberCrosswordTable from "../Table/NumberCrosswordTable.vue";
import CryptogramTable from "../Table/CryptogramTable.vue";
import NumberLetterTable from "../Table/NumberLetterTable.vue";
import InitialTable from "../Table/InitialTable.vue";
import EightTable from "../Table/EightTable.vue";
import NoDataToDisplay from "../Utility/NoDataToDisplay.vue";
import { usersRef } from "../../firebase_main.js";
import LoadingBar from "../Utility/LoadingBar.vue";
import MyCounter from "../Utility/MyCounter.vue";
export default {
  emits: ["selectedNonograms"],
  props: ["puzzleList", "selectMode", "start_time", "end_time"],
  components: {
    IntegramTable,
    NonogramTable,
    NumberCrosswordTable,
    CryptogramTable,
    EightTable,
    InitialTable,
    NoDataToDisplay,
    NumberLetterTable,
    LoadingBar,
    MyCounter,
    NoDataToDisplay,
  },
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
      fully_loaded: false,
      value: "integram",
      user: null,
      tournaments: [],
      selectedItemsEmitted: [],
      new_item: "",
      new_item_tag: "",
      filterBy: "",
      new_item_exact: false,
      filter: "",
      useCustomFilteringFn: false,
      filters: [],
      filtered: [],
      columns: [],
      sortBy: "username",
      sortingOrder: "asc",
      perPage: 1,
      currentPage: 1,
      columns: [
        {
          key: "organizer_display_name",
          sortable: true,
          classes: "data_table_overflow",
        },
        {
          key: "organizer_email",
          sortable: true,
          classes: "data_table_overflow",
        },
        { key: "start_time", sortable: true, classes: "data_table_overflow" },
        { key: "end_time", sortable: true, classes: "data_table_overflow" },
        {
          key: "selectedIntegrams",
          sortable: true,
          classes: "data_table_overflow",
        },
        {
          key: "selectedNonograms",
          sortable: true,
          classes: "data_table_overflow",
        },
        {
          key: "selectedNumberCrosswords",
          sortable: true,
          classes: "data_table_overflow",
        },
        {
          key: "selectedCryptograms",
          sortable: true,
          classes: "data_table_overflow",
        },
        {
          key: "selectedNumberLetters",
          sortable: true,
          classes: "data_table_overflow",
        },
        {
          key: "selectedInitials",
          sortable: true,
          classes: "data_table_overflow",
        },
        {
          key: "selectedEights",
          sortable: true,
          classes: "data_table_overflow",
        },
        { key: "id", sortable: false, classes: "data_table_overflow" },
      ],
      sortingOrderOptions: [
        { text: "Uzlazno", value: "asc" },
        { text: "Silazno", value: "desc" },
        { text: "Bez sortiranja", value: null },
      ],
    };
  },
  methods: {
    filterExact(source) {
      if (this.filter === "") {
        return true;
      }
      return source?.toString?.() === this.filter;
    },
    string_to_array(array_string) {
      if (!array_string) {
        return [];
      }
      if (array_string[1] == "[") {
        let array = array_string
          .substring(2, array_string.length - 2)
          .split("],[");
        for (let i = 0; i < array.length; i++) {
          array[i] = array[i].split(",");
          for (let j = 0; j < array[i].length; j++) {
            array[i][j] = parseInt(array[i][j]);
          }
        }
        return array;
      } else {
        let array = array_string
          .substring(1, array_string.length - 1)
          .split(",");
        return array;
      }
    },
    fetch_tournaments() {
      this.tournaments = [];
      let me = this;
      tournamentsRef
        .get()
        .then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            usersRef
              .get(childSnapshot.get("organizer"))
              .then(function (snapshotOrganizer) {
                snapshotOrganizer.forEach(function (childSnapshotOrganizer) {
                  let idOrganizer = childSnapshotOrganizer.id;
                  if (idOrganizer == childSnapshot.get("organizer")) {
                    let newId = { granted: false, id: childSnapshot.id };
                    if (me.user) {
                      newId = {
                        granted: childSnapshotOrganizer.id == me.user.uid,
                        id: childSnapshot.id,
                      };
                    }
                    me.tournaments.push({
                      organizer_display_name:
                        childSnapshotOrganizer.get("displayName"),
                      organizer_email: childSnapshotOrganizer.get("email"),
                      start_time: new Date(
                        childSnapshot.get("start").seconds * 1000
                      ).toLocaleString(),
                      end_time: new Date(
                        childSnapshot.get("end").seconds * 1000
                      ).toLocaleString(),
                      selectedIntegrams: childSnapshot.get("selectedIntegrams"),
                      selectedNonograms: childSnapshot.get("selectedNonograms"),
                      selectedNumberCrosswords: childSnapshot.get(
                        "selectedNumberCrosswords"
                      ),
                      selectedCryptograms: childSnapshot.get(
                        "selectedCryptograms"
                      ),
                      selectedNumberLetters: childSnapshot.get(
                        "selectedNumberLetters"
                      ),
                      selectedInitials: childSnapshot.get("selectedInitials"),
                      selectedEights: childSnapshot.get("selectedEights"),
                      id: newId,
                    });
                  }
                });
              })
              .then(() => {
                me.$forceUpdate();
              });
          });
        })
        .then(() => {
          this.fully_loaded = true;
        });
    },
    sortByOptions() {
      return this.columns.map(({ key }) => key);
    },
    deleteTournament(id) {
      tournamentsRef
        .doc(id)
        .delete()
        .then(() => {
          this.fetch_tournaments();
          this.$forceUpdate();
        });
    },
  },
  created() {
    this.fetch_tournaments();
  },
  computed: {
    customFilteringFn() {
      return this.useCustomFilteringFn ? this.filterExact : undefined;
    },
    pages() {
      return this.perPage && this.perPage !== 0
        ? Math.ceil(this.filtered.length / this.perPage)
        : this.filtered.length;
    },
  },
};
</script>

<template>
  <body class="my_body" v-if="!fully_loaded">
    <LoadingBar></LoadingBar>
  </body>
  <span v-else>
    <body class="my_body">
      <div class="my_row">
        <h4 class="display-4">
          <va-icon size="large" name="workspace_premium"> </va-icon>
          &nbsp; Turniri
        </h4>
      </div>
      <div class="my_row">
        <va-button>
          <router-link to="/create-tournament">
            <va-icon class="mr-4" name="add_circle" /> Novi turnir
          </router-link>
        </va-button>
      </div>
      <span v-if="tournaments.length > 0">
        <div class="my_row">
          <va-input
            style="display: inline-block"
            placeholder="Unesite pojam za pretragu"
            v-model="filter"
          />
          &nbsp;
          <va-checkbox
            style="display: inline-block"
            label="Traži cijelu riječ"
            v-model="useCustomFilteringFn"
          />
        </div>
        <div class="my_row">
          <MyCounter
            :min_value="1"
            :max_value="Math.ceil(this.filtered.length)"
            v-bind:value="perPage"
            @input="(n) => (perPage = n)"
            :some_text="'Broj rezultata na stranici'"
          ></MyCounter>
        </div>
        <va-data-table
          :items="tournaments"
          :filter="filter"
          :columns="columns"
          :hoverable="true"
          :per-page="perPage"
          selectable="selectable"
          select-mode="single"
          @selectionChange="
            selectedItemsEmitted = $event.currentSelectedItems;
            $emit('selectedNonograms', selectedItemsEmitted);
          "
          :current-page="currentPage"
          v-model:sort-by="sortBy"
          v-model:sorting-order="sortingOrder"
          @filtered="filtered = $event.items"
          no-data-filtered-html="Pretraga nije dala rezultate."
          no-data-html="Nema podataka."
          :filter-method="customFilteringFn"
        >
          <template #header(organizer_display_name)>Organizator (ime)</template>
          <template #header(organizer_email)>Organizator (email)</template>
          <template #header(start_time)>Početak turnira</template>
          <template #header(end_time)>Kraj turnira</template>
          <template #header(id)>Izbriši</template>
          <template #header(selectedIntegrams)>Broj integrama</template>
          <template #header(selectedNonograms)>Broj nonograma</template>
          <template #header(selectedNumberCrosswords)
            >Broj brojevnih križaljki</template
          >
          <template #header(selectedCryptograms)>Broj kriptograma</template>
          <template #header(selectedNumberLetters)
            >Broj zagonetki tpa "Isti broj - isto slovo"</template
          >
          <template #header(selectedInitials)
            >Broj inicijalnih osmosmjerki</template
          >
          <template #header(selectedEights)>Broj osmosmjerki</template>
          <template #cell(id)="{ source: id }">
            <va-icon
              v-if="id.granted == true"
              @click="deleteTournament(id.id)"
              name="delete"
            />
          </template>
          <template #cell(selectedIntegrams)="{ source: selectedIntegrams }">
            {{ selectedIntegrams.length }}
          </template>
          <template #cell(selectedNonograms)="{ source: selectedNonograms }">
            {{ selectedNonograms.length }}
          </template>
          <template
            #cell(selectedNumberCrosswords)="{
              source: selectedNumberCrosswords,
            }"
          >
            {{ selectedNumberCrosswords.length }}
          </template>
          <template
            #cell(selectedCryptograms)="{ source: selectedCryptograms }"
          >
            {{ selectedCryptograms.length }}
          </template>
          <template
            #cell(selectedNumberLetters)="{ source: selectedNumberLetters }"
          >
            {{ selectedNumberLetters.length }}
          </template>
          <template #cell(selectedInitials)="{ source: selectedInitials }">
            {{ selectedInitials.length }}
          </template>
          <template #cell(selectedEights)="{ source: selectedEights }">
            {{ selectedEights.length }}
          </template>
          <template #bodyAppend>
            <tr>
              <td colspan="12">
                <div style="display: inline-block; margin-top: 10px">
                  <va-pagination v-model="currentPage" input :pages="pages" />
                </div>
              </td>
            </tr>
          </template>
        </va-data-table>
        <div class="my_row">
          <va-tabs
            v-if="selectedItemsEmitted.length > 0"
            v-model="value"
            style="width: 100%"
          >
            <template #tabs>
              <va-tab name="integram"
                ><va-icon name="rule_folder"></va-icon>Integrami</va-tab
              >
              <va-tab name="nonogram"
                ><va-icon name="draw"></va-icon>Nonogrami</va-tab
              >
              <va-tab name="numberCrossword"
                ><va-icon name="format_list_numbered"></va-icon>Brojevne
                križaljke</va-tab
              >
              <va-tab name="cryptogram"
                ><va-icon name="multiple_stop"></va-icon>Kriptogrami</va-tab
              >
              <va-tab name="numberLetter"
                ><va-icon name="sync_alt"></va-icon>Isti broj - isto
                slovo</va-tab
              >
              <va-tab name="initial"
                ><va-icon name="text_rotation_none"></va-icon>Inicijalne
                osmosmjerke</va-tab
              >
              <va-tab name="eight"
                ><va-icon name="pattern"></va-icon>Osmosmjerke</va-tab
              >
            </template>
          </va-tabs>
        </div>
        <div class="my_row" v-for="item in selectedItemsEmitted" :key="item.id">
          <span v-if="value == 'integram' && item.selectedIntegrams.length > 0">
            <IntegramTable
              selectMode="single"
              :puzzleList="item.selectedIntegrams"
              :start_time="item.start_time"
              :end_time="item.end_time"
            >
            </IntegramTable>
          </span>
          <span
            v-if="value == 'integram' && item.selectedIntegrams.length <= 0"
          >
            <NoDataToDisplay customMessage="Na turniru nema integrama">
            </NoDataToDisplay>
          </span>
          <span v-if="value == 'nonogram' && item.selectedNonograms.length > 0">
            <NonogramTable
              selectMode="single"
              :puzzleList="item.selectedNonograms"
              :start_time="item.start_time"
              :end_time="item.end_time"
            >
            </NonogramTable>
          </span>
          <span
            v-if="value == 'nonogram' && item.selectedNonograms.length <= 0"
          >
            <NoDataToDisplay customMessage="Na turniru nema nonograma">
            </NoDataToDisplay>
          </span>
          <span
            v-if="
              value == 'numberCrossword' &&
              item.selectedNumberCrosswords.length > 0
            "
          >
            <NumberCrosswordTable
              selectMode="single"
              :puzzleList="item.selectedNumberCrosswords"
              :start_time="item.start_time"
              :end_time="item.end_time"
            >
            </NumberCrosswordTable>
          </span>
          <span
            v-if="
              value == 'numberCrossword' &&
              item.selectedNumberCrosswords.length <= 0
            "
          >
            <NoDataToDisplay
              customMessage="Na turniru nema brojevnih križaljki"
            >
            </NoDataToDisplay>
          </span>
          <span
            v-if="value == 'cryptogram' && item.selectedCryptograms.length > 0"
          >
            <CryptogramTable
              selectMode="single"
              :puzzleList="item.selectedCryptograms"
              :start_time="item.start_time"
              :end_time="item.end_time"
            >
            </CryptogramTable>
          </span>
          <span
            v-if="value == 'cryptogram' && item.selectedCryptograms.length <= 0"
          >
            <NoDataToDisplay customMessage="Na turniru nema kriptograma">
            </NoDataToDisplay>
          </span>
          <span
            v-if="
              value == 'numberLetter' && item.selectedNumberLetters.length > 0
            "
          >
            <NumberLetterTable
              selectMode="single"
              :puzzleList="item.selectedNumberLetters"
              :start_time="item.start_time"
              :end_time="item.end_time"
            >
            </NumberLetterTable>
          </span>
          <span
            v-if="
              value == 'numberLetter' && item.selectedNumberLetters.length <= 0
            "
          >
            <NoDataToDisplay
              customMessage='Na turniru nema zagonetki tipa "Isti broj - isto slovo'
            >
            </NoDataToDisplay>
          </span>
          <span v-if="value == 'initial' && item.selectedInitials.length > 0">
            <InitialTable
              selectMode="single"
              :puzzleList="item.selectedInitials"
              :start_time="item.start_time"
              :end_time="item.end_time"
            >
            </InitialTable>
          </span>
          <span v-if="value == 'initial' && item.selectedInitials.length <= 0">
            <NoDataToDisplay
              customMessage="Na turniru nema inicijalnih osmosmjerki"
            >
            </NoDataToDisplay>
          </span>
          <span v-if="value == 'eight' && item.selectedEights.length > 0">
            <EightTable
              selectMode="single"
              :puzzleList="item.selectedEights"
              :start_time="item.start_time"
              :end_time="item.end_time"
            >
            </EightTable>
          </span>
          <span v-if="value == 'eight' && item.selectedEights.length <= 0">
            <NoDataToDisplay customMessage="Na turniru nema osmosmjerki">
            </NoDataToDisplay>
          </span>
        </div>
      </span>
      <NoDataToDisplay v-else customMessage="Nema turnira"></NoDataToDisplay>
    </body>
  </span>
</template>

<style scoped></style>
