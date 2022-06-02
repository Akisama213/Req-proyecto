<template>
  <q-parallax :height="80" :speed="0.1">
      <template v-slot:media>
        <q-layout>
          <q-card class="fixed-center">
            <video width="2560" height="1440" poster="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Black_from_a_camera.jpg/1200px-Black_from_a_camera.jpg" autoplay loop muted>
              <source type="video/mp4" src="https://pixabay.com/videos/download/video-49375_medium.mp4?attachment">
            </video>
          </q-card>
        </q-layout>
      </template>

        <q-card class="index-main-card fixed-center">
          <div>
          <form @submit.prevent="pressed">
          <q-input
            square
            standout
            ref="input"
            v-model="search"
            debounce="500"
            label="Buscar en los documentos"
            :rules="[val=>!!val||'Campo necesario']"
          /><q-btn
            :loading="loading"
            :percentage="percentage"
            class="btn-fixed-width"
            icon="search"
            type="submit"
            @click="press()"
          ><template v-slot:loading>
            <q-spinner-gears class="on-left"/>
            Buscando...
          </template>
          </q-btn></form>

          </div>
          <q-uploader
            url="http://localhost:4444/upload"
            label="Elija los documentos a subir"
            color="purple"
            dark
            batch
            multiple
            accept=".txt"
            class="no-margin fit"
            style="max-height: 800px;"
          />
        </q-card>

    </q-parallax>
</template>

<script>
import { defineComponent } from 'vue'
import { QSpinnerFacebook, Loading } from 'quasar'


export default defineComponent({
  data() {
    return {
      search: "",
      searchcopy: ""
    };
  },
  methods: { press() {
    if(this.search) {
      Loading.show({
        spinner: QSpinnerFacebook,
        spinnerColor: 'yellow',
        spinnerSize: 140,
        backgroundColor: 'purple',
        messageColor: 'white',
        message: 'Buscando "' + this.search + '" en los archivos...'})
    }
    this.searchcopy = this.search.replace(/\s\s+/g, ' ');
    this.searchcopy = this.searchcopy.replace(/ /g, "_");
    console.log("Search: " + this.searchcopy);
  },
  chooseFiles() {document.getElementById("fileUpload").click()}},
  name: 'IndexPage',
})
</script>

<style lang="scss">
.index-main-card {
  background-color: #b8adc4;
  height: 85%;
  width: 50%;
}

.index-sub-card-1 {
  background-color: #9b5be0;
  height: 90%;
  width: 40%;
}

.index-card-search {
  width: 100%;
  height: 70%;
  padding: 30px;
}

.btn-fixed-width {
  width: 100%
  }
</style>
