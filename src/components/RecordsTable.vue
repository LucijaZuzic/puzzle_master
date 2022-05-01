 
<script>
 
    import { usersRef } from "../main.js"
    export default {  
        props: ["dbRef", "puzzleId", "userId", "start_time", "end_time"],
        data() {
            return { 
                user_records: [], 
                selectedItemsEmitted: [],
                new_item: "",
                new_item_tag: "",
                filterBy: '',
                new_item_exact: false,
                filter: '',
                useCustomFilteringFn: false,
                filters: [],
                filtered: [],
                columns: [],
                sortBy: 'score',
                sortingOrder: 'asc',
                perPage: 10,
                currentPage: 1,
                columns: [ 
                    {key: 'user_display_name', sortable: true},
                    {key: 'user_email', sortable: true},
                    {key: 'score', sortable: true},
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
                this.user_records = []
                let me = this  
                this.$props.dbRef.get().then(function(snapshot) {
                    snapshot.forEach(function(childSnapshot) {  
                        let idPuzzle = childSnapshot.get('puzzleID')
                        let idUser = childSnapshot.get('user')
                        let record = new Date(childSnapshot.get('time').seconds * 1000).toLocaleString()
                        let match = true
                        if (me.$props.puzzleId && idPuzzle != me.$props.puzzleId) {  
                            match = false
                        }
                        if (me.$props.userId && idUser != me.$props.userId) {  
                            match = false
                        } 
                        if (me.$props.start_time && me.$props.end_time && (record < me.$props.start_time || record > me.$props.end_time)) {  
                            match = false
                        }
                        if (match == true) {
                            usersRef.get(idUser).then(function(snapshotUser) {
                                snapshotUser.forEach(function(childSnapshotUser) {
                                    let foundUser = childSnapshotUser.id; 
                                    if (foundUser == idUser) {  
                                        me.user_records.push({
                                            user_display_name: childSnapshotUser.get("displayName"),
                                            user_email: childSnapshotUser.get("email"),
                                            score: me.format(childSnapshot.get("score")),
                                            time: record,
                                        })
                                    }
                                });
                            })  
                        }
                    });
                }) 
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
        :items="user_records"
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
        <template #header(score)>Rezultat</template>
        <template #header(time)>Datum i vrijeme</template> 
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
</template>

<style>

  .table-example--pagination {
    text-align: center;
    text-align: -webkit-center;
  }
</style>
