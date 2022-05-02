 
<script>
import { usersRef } from "../main.js"
    import NoDataToDisplay from './NoDataToDisplay.vue'
    export default {  
        components: { 
            NoDataToDisplay
        },
        props: ["dbRef", "puzzleId", "userId"],
        data() {
            return { 
                already_rated: false,
                documentRated: '',
                sum_ratings: 0, 
                value: 0,
                comment: "",
                user_ratings: [],  
                new_item: "",
                new_item_tag: "",
                filterBy: '',
                new_item_exact: false,
                filter: '',
                useCustomFilteringFn: false,
                filters: [],
                filtered: [],
                columns: [],
                sortBy: 'rating',
                sortingOrder: 'asc',
                perPage: 10,
                currentPage: 1,
                columns: [ 
                    {key: 'user_display_name', sortable: true},
                    {key: 'user_email', sortable: true},
                    {key: 'rating', sortable: true},
                    {key: 'comment', sortable: true},
                    {key: 'time', sortable: true},
                ],
                sortingOrderOptions: [
                    { text: 'Uzlazno', value: 'asc' },
                    { text: 'Silazno', value: 'desc' },
                    { text: 'Bez sortiranja', value: null },
                ], 
            }
        }, 
        methods: {
            filterExact (source) {
                if (this.filter === '') {
                    return true
                }
                return source?.toString?.() === this.filter
            },
            format(time) {
                var hours = Math.floor(time / 3600);
                var minutes = Math.floor((time - hours * 3600) / 60);
                var seconds = time - hours * 3600 - minutes * 60;
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (hours < 10) {
                    hours = "0" + hours;
                }
                return hours + ":" + minutes + ":" + seconds;
            }, 
            fetch_users() {
                this.user_ratings = []
                let me = this  
                this.$props.dbRef.get().then(function(snapshot) {
                    snapshot.forEach(function(childSnapshot) {  
                        let idPuzzle = childSnapshot.get('puzzleID')
                        let idUser = childSnapshot.get('user')
                        let idRating = childSnapshot.id
                        if (me.$props.userId == idUser) {
                            me.already_rated = true
                            me.documentRated = idRating
                        }
                        let record = new Date(childSnapshot.get('time').seconds * 1000)
                        let match = true
                        if (me.$props.puzzleId && idPuzzle != me.$props.puzzleId) {  
                            match = false
                        } 
                        if (match == true) {
                            usersRef.get(idUser).then(function(snapshotUser) {
                                snapshotUser.forEach(function(childSnapshotUser) {
                                    let foundUser = childSnapshotUser.id; 
                                    if (foundUser == idUser) { 
                                        me.sum_ratings += parseFloat(childSnapshot.get("rating")) 
                                        me.user_ratings.push({
                                            user_display_name: childSnapshotUser.get("displayName"),
                                            user_email: childSnapshotUser.get("email"),
                                            rating: parseFloat(childSnapshot.get("rating")),
                                            comment: childSnapshot.get("comment"),
                                            time: record,
                                        })
                                    }
                                });
                            })  
                        }
                    });
                }) 
            },
            submit() {
                if (this.already_rated == false) {
                    let datetime = new Date()
                    this.$props.dbRef.add({  
                        puzzleID: this.$props.puzzleId,
                        user: this.$props.userId,
                        rating: this.value,
                        comment: this.comment,
                        time: datetime,
                    }).then(() => {this.$refs.store_success.show();this.fetch_users()})
                } else {
                    let datetime = new Date()
                    this.$props.dbRef.doc(this.documentRated).update({ 
                        puzzleID: this.$props.puzzleId,
                        user: this.$props.userId,
                        rating: this.value,
                        comment: this.comment,
                        time: datetime,
                    }).then(() => {this.$refs.store_success.show();this.fetch_users()})
                }
            },
            sortByOptions () {
                return this.columns.map(({ key }) => key)
            },
        },
        created() {
            this.fetch_users()
        },
        computed: {
            customFilteringFn () {
                return this.useCustomFilteringFn ? this.filterExact : undefined
            },
            pages () {
                return (this.perPage && this.perPage !== 0)
                    ? Math.ceil(this.filtered.length / this.perPage)
                    : this.filtered.length
            },
        },
    }
</script>

<template>   
    <div class="myrow" v-if="user_ratings.length > 0"> 
        <va-chip>
            Ocjena: {{sum_ratings/user_ratings.length}} 
        </va-chip>
    </div>
    <span v-if="user_ratings.length > 0">
        <div class="myrow">
            <va-input
            class="flex mb-2 md6" style="display: inline-block;margin-left: 2%;margin-top: 2%;width: 25%" 
            placeholder="Unesite pojam za pretragu"
            v-model="filter"
            />  
            <va-checkbox style="display: inline-block;margin-left: 2%;margin-top: 2%" 
            class="flex mb-2 md6"
            label="Traži cijelu riječ"
            v-model="useCustomFilteringFn"
            /> 
            <va-input style="display: inline-block;margin-left: 2%;margin-top: 2%;width: 10%"  
                label="Trenutna stranica"
                class="flex mb-2 md6"
                v-model="currentPage"
                :min="1"
                :max="Math.ceil(this.filtered.length / this.perPage)"
                type="number"
            /> 
            <va-input style="display: inline-block;margin-left: 2%;margin-top: 2%;width: 10%"  
                label="Broj pojmova na stranici"
                class="flex mb-2 md6"
                v-model="perPage"
                :min="1"
                :max="Math.ceil(this.filtered.length)"
                type="number"
            /> 
        </div> 
        <va-data-table 
            :items="user_ratings"
            :filter="filter"
            :columns="columns"
            :hoverable="true"  
            :per-page="perPage"     
            :current-page="currentPage"
            v-model:sort-by="sortBy"
            v-model:sorting-order="sortingOrder"
            @filtered="filtered = $event.items" 
            no-data-filtered-html="Pretraga nije dala rezultate." 
            no-data-html="Nema podataka." 
            :filter-method="customFilteringFn" > 
            <template #header(user_display_name)>Korisnik (ime)</template>
            <template #header(user_email)>Korisnik (email)</template>
            <template #header(rating)>Ocjena</template>
            <template #header(comment)>Komentar</template>
            <template #header(time)>Datum i vrijeme</template> 
            <template #cell(time)="{ source: time }"> 
                {{time.toLocaleString()}} 
            </template> 
            <template #cell(user_email)="{ source: user_email }">
                <router-link v-bind:to="{ name: 'profile', params: { email: user_email }}">
                    {{user_email}}
                </router-link> 
            </template> 
            <template #bodyAppend> 
                <tr>
                    <td colspan="4" class="table-example--pagination">
                        <va-pagination
                        v-model="currentPage"
                        input
                        :pages="pages"
                        />
                    </td>
                </tr>
            </template>
        </va-data-table> 
    </span>  
    <NoDataToDisplay v-if="user_ratings.length <= 0" customMessage="Nema ocjena za odabranu zagonetku"></NoDataToDisplay> 
    <div class="myrow" v-if="$props.userId">
        <va-list-item >
            <va-list-item-section avatar>
                <va-avatar>
                    {{value}}
                </va-avatar>
            </va-list-item-section>
            <va-list-item-section>
                <va-list-item-label caption>
                    <va-rating 
                        style="display:inline-block"
                        v-model="value"
                        halves
                        hover 
                        size="large"
                    />
                </va-list-item-label>
            </va-list-item-section>
        </va-list-item>
    </div>  
    <div class="myrow" v-if="$props.userId">
        <va-input type="textarea" placeholder="Obrazložite ocjenu" label="Komentar" v-model="comment"></va-input>
    </div>  
    <div class="myrow" v-if="$props.userId">
        <va-button @click="submit()">Ocjenite</va-button> 
    </div>  
    <va-modal ref="store_success" hide-default-actions message="Nova ocjena je uspješno spremljena." stateful /> 
    <va-modal ref="update_success" hide-default-actions message="Ocjena je uspješno ažurirana." stateful />
</template>

<style>

  .table-example--pagination {
    text-align: center;
    text-align: -webkit-center;
  }
</style>
