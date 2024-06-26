<template>
  <div id="tabbar" data-cy="main_tab"> 
    <router-link v-if="permitted('sheets_view')" :to="routeSheetSwap" tag="div">
      <div class="badge" :class="{ active: isSheetsView }" data-cy="sheets_tab">
        Sheet
      </div>
    </router-link>
    <router-link
      v-if="permitted('kanban_view')"
      :to="routeKanbanSwap"
      tag="div"
    >
      <div v-show="!isContractView && !isVehicleView && !isEffortsView"  class="badge" :class="{ active: isKanbanView }" data-cy="kanban_tab">
        Kanban
      </div>
    </router-link>
    <router-link
      v-if="permitted('calendar_view')"
      :to="routeCalendarSwap"
      tag="div"
    >
      <div class="badge" v-show="!isContractView && !isVehicleView && !isEffortsView" :class="{ active: isCalendarView }" data-cy="calendar_tab">
        Calendar
      </div>
    </router-link>
     <router-link v-if="permitted('map_view')" :to="routeMapSwap" tag="div">
      <div class="badge" :class="{ active: isMapView }" data-cy="map_tab" v-show="!isContractView && !isVehicleView && !isEffortsView">
        Map
      </div>
    </router-link>
    <router-link
      v-if="permitted('gantt_view')"
      :to="`/programs/${this.$route.params.programId}/gantt_chart`"
      tag="div"
    >
      <div class="badge" :class="{ active: isGanttView }" data-cy="gantt_tab">
        Gantt
      </div>
    </router-link>
    <div v-show="false" v-if="permitted('issues')" class="badge disabled">
      Mindmap (Coming Soon)
    </div>
    <div v-show="false" v-if="permitted('documents')" class="badge disabled">
      Documents (Coming Soon)
    </div>
    <router-link
      v-if="permitted('members')"
      :to="`/programs/${this.$route.params.programId}/members`"
      tag="div"
    >
      <div class="badge" :class="{ active: isMembersView }" data-cy="team_tab">
        Team
      </div>
    </router-link>
    <router-link
      v-if="false" :to="routeLessonSwap" tag="div">
      <div class="badge" :class="{ active: isLessonsView }" data-cy="lesson_tab">
        Lessons
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  name: "Tabsbar",
  computed: {
    isSheetsView() {
      return this.$route.name.includes("Sheet") || this.isEffortsView ||
      this.$route.name.includes("Contract") &&  !this.$route.name.includes("SettingsContracts")
      || this.$route.name.includes("Vehicle") &&  !this.$route.name.includes("SettingsVehicles")
    },
    isContractView() {
      return this.$route.name.includes("Contract") && 
      !this.$route.name.includes("SettingsContracts") &&
      !this.$route.name.includes("Program") 
      ;
    },
    isVehicleView() {
      return this.$route.name.includes("Vehicle") && 
      !this.$route.name.includes("SettingsVehicles") &&
      !this.$route.name.includes("Program") 
      ;
    },
    isMapView() {
      return this.$route.name.includes("Map");
    },
    isProgramSettingsView() {
      return this.$route.name.includes("settings");
    },
    isEffortsView() {
      return this.$route.name.includes("effort");
    },
    isGanttView() {
      return this.$route.name === "GanttChartView";
    },
    isSettingsView() {
    return this.$route.name.includes("SettingsView") ||
            this.$route.name.includes("SettingsProjects") ||
            this.$route.name.includes("SettingsContracts") ||
            this.$route.name.includes("SettingsVehicles") ||
            this.$route.name.includes("SettingsGroups") ||
            this.$route.name.includes("SettingsRolesIndex")  ||
            this.$route.name.includes("SettingsUsers")
    },
    isCalendarView() {
      return this.$route.name.includes("Calendar");
    },
    isKanbanView() {
      return this.$route.name.includes("Kanban");
    },
    isMembersView() {
      return this.$route.name === "TeamMembersView";
    },
    isLessonsView() {
      return ["LessonsIndex", "LessonForm"].includes(this.$route.name);
    },
    // isPortfolioView() {
    //   return this.$route.name.includes("PortfolioView");
    // },
    routeSheetSwap() {
      let route = this.$route.path;
      if (this.isMapView) {
        return route.replace("map", "sheet");
      } else if (this.isKanbanView) {
        return route.replace("kanban", "sheet");
      } else if (this.isSettingsView) {
        return `/programs/${this.$route.params.programId}/sheet`;
      } else if (this.isCalendarView) {
        return route.replace("calendar", "sheet");
      } else if (this.isCalendarView) {
        return route.replace("settings", "sheet");
      } else if (this.isGanttView) {
        return route.replace("gantt_chart", "sheet");
      } else if (this.isLessonsView) {
        return `/programs/${this.$route.params.programId}/sheet`;
      }else {
        return route.replace("members", "sheet");
      }
    },
    routeLessonSwap() {
      let route = this.$route.path;
      if (this.isMapView || this.isKanbanView || this.isSheetsView || this.isCalendarView) {
        return `/programs/${this.$route.params.programId}/lessons`;
    
      } else if (this.isGanttView) {
        return route.replace("gantt_chart", "lessons");
     
      } else {
        return route.replace("members", "lessons");
      }
    },
    routeMapSwap() {
      let route = this.$route.path;
      if (this.isSheetsView) {
        return route.replace("sheet", "map");
      } else if (this.isKanbanView) {
        return route.replace("kanban", "map");
      } else if (this.isSettingsView) {
         return `/programs/${this.$route.params.programId}/map`;
      } else if (this.isCalendarView) {
        return route.replace("calendar", "map");
      } else if (this.isGanttView) {
        return route.replace("gantt_chart", "map");
      } else if(this.isLessonsView){
        return `/programs/${this.$route.params.programId}/map`;
      }else {
        return route.replace("members", "map");
      }
    },
    routeKanbanSwap() {
      let route = this.$route.path;
      if (
        this.isSheetsView &&
        (route.includes("tasks") ||
          route.includes("issues") ||
          route.includes("risks"))
      ) {
        return route.replace("sheet", "kanban");
      } else if (this.isSheetsView && this.$route.params.projectId) {
        return `/programs/${this.$route.params.programId}/kanban/projects/${this.$route.params.projectId}/tasks`;
      }  else if (this.isSettingsView) {
         return `/programs/${this.$route.params.programId}/kanban`;
      } else if (this.isSheetsView && !route.includes("notes")) {
        return `/programs/${this.$route.params.programId}/kanban`;
      } else if (this.isCalendarView) {
        return route.replace("calendar", "kanban");
      }
      if (
        this.isMapView &&
        (route.includes("tasks") ||
          route.includes("issues") ||
          route.includes("risks"))
      ) {
        return route.replace("map", "kanban");
      } else if (this.isMapView && this.$route.params.projectId) {
        return `/programs/${this.$route.params.programId}/kanban/projects/${this.$route.params.projectId}/tasks`;
      } else if (this.isMapView && !route.includes("notes")) {
        return `/programs/${this.$route.params.programId}/kanban`;
      } else if (this.isLessonsView) {
        return `/programs/${this.$route.params.programId}/kanban`;
      } else if (this.isGanttView) {
        return route.replace("gantt_chart", "kanban");
      // } else if (this.isLessonsView) {
      //   return route.replace("lessons", "kanban");
      } else {
        return route.replace("members", "kanban");
      }
    },
      routeCalendarSwap() {
      let route = this.$route.path;
      if (
        this.isSheetsView &&
        (route.includes("tasks") ||
          route.includes("issues") ||
          route.includes("risks"))
      ) {
        return route.replace("sheet", "calendar");
      } else if (this.isSheetsView && this.$route.params.projectId) {
        return `/programs/${this.$route.params.programId}/calendar/projects/${this.$route.params.projectId}/tasks`;
      } else if (this.isSettingsView) {
        return `/programs/${this.$route.params.programId}/calendar`;
      } else if (this.isSheetsView && !route.includes("notes")) {
        return `/programs/${this.$route.params.programId}/calendar`;
      } else if (this.isKanbanView) {
        return route.replace("kanban", "calendar");
      }
      if (
        this.isMapView &&
        (route.includes("tasks") ||
          route.includes("issues") ||
          route.includes("risks"))
      ) {
        return route.replace("map", "calendar");
      } else if (this.isMapView && this.$route.params.projectId) {
        return `/programs/${this.$route.params.programId}/calendar/projects/${this.$route.params.projectId}/tasks`;
      } else if (this.isMapView && !route.includes("notes")) {
        return `/programs/${this.$route.params.programId}/calendar`;
      } else if (this.isLessonsView) {
        return `/programs/${this.$route.params.programId}/calendar`;
      } else if (this.isGanttView) {
        return route.replace("gantt_chart", "calendar");
      // } else if (this.isLessonsView) {
      //   return route.replace("lessons", "kanban");
      } else {
        return route.replace("members", "calendar");
      }
    },
    permitted() {
      return (salut) => this.$topNavigationPermissions[salut] && this.$topNavigationPermissions[salut]["read"];
    },
  },
  watch: {
    $route(to, from) {
      this.$store && this.$store.commit("nullifyTasksForManager");
    },
  },
};
</script>

<style scoped lang="scss">
#tabbar {
  padding: 4px 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.02), 0 2px 5px 0 rgba(0, 0, 0, 0.03);
  .badge {
    border-radius: 0.15rem;
    cursor: pointer;
    padding: 5px;
    margin: 2px 10px;
    transition: auto;
    &.active {
      color: #fff;
      font-weight: 200;
      padding: 5px;
      background-color: #17a2b8;
    }
    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      border: 0 !important;
      padding: 5px !important;
    }
    &:hover {
      padding: 4px;
      border: 1px solid #17a2b8;
    }
  }
}
</style>
