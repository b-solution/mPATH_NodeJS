<template>
  <div>
    <div v-if="!this.isLoggedIn">
      <login-view></login-view>
    </div>
    <div v-else>
      <nav v-if="this.isShowTabsBar()"
        class="navbar navbar-expand-lg blue-gradient navbar-light border-bottom border-muted" id="nav-wrap">
        <a class="navbar-brand pt-0" role='button' @click="backHomeButton">
          <img class="mpathLogoWidth" src="microhealthllc.png" /></a>
        <button aria-controls="navbartoggler" aria-expanded="false" aria-label="Toggle navigation"
          class="navbar-toggler ml-auto" data-target="#navbartoggler" data-toggle="collapse" type="button">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbartoggler">
          <ul class="navbar-nav mr-auto mt-2 mt-lg-0"></ul>
          <ul class="navbar-nav my-2 my-lg-0">
            <li class="nav-item">
              <a class="nav-link" @click="setAdminPanel" :href="adminPanelUrl" data-turbolinks="false"
                data-cy="admin_panel">Admin
                Panel</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" target="_blank" href="https://mpath.atlassian.net/wiki/spaces/MUG/overview">Help</a>
            </li>
            <li class="nav-item mt-2" v-if="this.getCurrentUser">
              <router-link :to="`/profile`">Welcome,{{ this.getCurrentUser.firstName }}</router-link>
            </li>
            <li class="nav-item">
              <a id="__logout" class="nav-link" data-cy="logout" rel="nofollow" data-method="delete"
                @click="logoutClick">Log out</a>
            </li>
          </ul>
        </div>
      </nav>
      <div v-if="!this.isProgramListView() && this.isShowTabsBar()">
        <tabsbar :class="{ 'd-none': isProgramView }"></tabsbar>
        <filter-sidebar v-if="contentLoaded" :class="{ 'd-none': isProgramView }"></filter-sidebar>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import axios from "axios";

import { mapGetters, mapActions, mapMutations } from 'vuex'
import LoginView from './LoginView.vue'
import Tabsbar from './../shared/tabsbar.vue'
import FilterSidebar from './../shared/filter_sidebar.vue'
import SettingsSidebar from '../views/settings/SettingsSidebar.vue'
import AuthorizationService from '../../services/authorization_service'
import { Admin_PANEL_URL, API_BASE_PATH } from '../../mixins/utils'

export default {
  name: 'HomeView',
  data() {
    return {
      mhLogo: 'mpathlogo.png',
      adminPanelUrl: `${Admin_PANEL_URL}/admin`
    }
  },
  components: {
    LoginView,
    Tabsbar,
    FilterSidebar,
    SettingsSidebar
  },
  mounted() {
    if (this.isLoggedIn) {
      this.verifyToken
      // console.log("LoginView Mounted", this.isLoggedIn)
      //this.$router.push({ name: 'ProgramListView' })
      this.fetchCurrentUser
    }
  },
  methods: {
    ...mapMutations(['nullifyLocalStorage']),
    async logoutClick(e) {
      this.nullifyLocalStorage()
      this.$router.push(`/login`)
      await setAdminPanel()
    },
    backHomeButton() {
      this.$router.push('/')
    },
    async setAdminPanel() {
      console.log("Admin------", this.$store)
      axios({
        method: "POST",
        url: `${API_BASE_PATH}/admin`,
        headers: {
          'x-token': this.$store.getters.getToken
        },
      })
        .then((response) => {
          console.log("AuthResponse", response)
        })
        .catch((err) => {
          console.log("Error", err);
          this.errorTrue = true
        })
        .finally(() => {
          this.loading = false;
        });

    },
    isProgramListView() {
      return this.$route.name && this.$route.name.includes('ProgramListView')
    },
    isShowTabsBar() {
      return (this.$route.name && !this.$route.name.includes('PortfolioView') && !this.$route.name.includes('PortfolioContracts'))
    }
  },
  computed: {
    ...mapGetters(['getCurrentUser', 'isLoggedIn', 'contentLoaded', 'facilities', 'getUnfilteredFacilities']),
    ...mapActions([
      'fetchCurrentUser', 'verifyToken'
    ]),
    isProgramView() {
      console.log('HomeView isProgramView', this.$route)
      return (
        this.$route.name &&
        (this.$route.name.includes('ProgramView') ||
          this.$route.name.includes('ProgramTaskForm') ||
          this.$route.name.includes('ProgramRiskForm') ||
          this.$route.name.includes('ProgramIssueForm') ||
          this.$route.name.includes('ProgramContractLessonForm') ||
          this.$route.name.includes('ProgramLessonForm') ||
          this.$route.name.includes('Profile')
        )

      )
    }
  }
}
</script>