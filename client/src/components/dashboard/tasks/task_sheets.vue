<template>
  <div id="task-sheets">
    <table v-if="!has_task" class="table table-sm table-bordered table-striped p-3">
      <tr v-if="!loading" class="mx-3 mb-3 mt-2 py-4 edit-action" @click.prevent="editTask" data-cy="task_row" @mouseup.right="openContextMenu" @contextmenu.prevent="">
        <td class="oneSix">{{task.text}}</td>
        <td class="ten">{{task.taskType}}</td>
        <td class="eight text-center">                          
          <span v-if="task.ongoing && !task.closed && task.startDate == null || undefined">
            <i class="fas fa-retweet text-success"></i>
          </span>
          <span v-else-if="task.ongoing && task.closed && task.startDate == null || undefined">
            <i class="fas fa-retweet text-secondary"></i>
              </span>
          <span v-else>{{
            moment(task.startDate).format("DD MMM YYYY") 
          }}</span>
        </td>
        <td class="eigth text-center">
        <span v-if="task.ongoing == true && !task.closed" v-tooltip="`Ongoing`"><i class="far fa-retweet text-success"></i></span>
        <span v-else-if="task.onHold && task.dueDate == null" v-tooltip="`On Hold (w/no Due Date)`"><i class="fas fa-pause-circle text-primary"></i></span>
        <span v-else>
         {{formatDate(task.dueDate)}}
        </span>      
       </td>
        <td class="fort" >
          <span v-if="(task.responsibleUsers.length > 0) && (task.responsibleUsers[0] !== null)"> <span class="badge mr-1 font-sm badge-secondary badge-pill">R</span>{{task.responsibleUsers[0].name}} <br></span> 
          <span v-if="(task.accountableUsers.length > 0) && (task.accountableUsers[0] !== null)"> <span class="badge mr-1 font-sm badge-secondary badge-pill">A</span>{{task.accountableUsers[0].name}}<br></span>   
          <!-- Consulted Users and Informed Users are toggle values         -->
          <span :class="{'show-all': getToggleRACI }" >             
             <span v-if="(task.consultedUsers.length > 0) && (task.consultedUsers[0] !== null)"> <span class="badge mr-1 font-sm badge-secondary badge-pill">C</span>{{JSON.stringify(task.consultedUsers.map(consultedUsers => (consultedUsers.name))).replace(/]|[['"]/g, ' ')}}<br></span> 
             <span v-if="(task.informedUsers.length > 0) && (task.informedUsers[0] !== null)"> <span class="badge font-sm badge-secondary mr-1 badge-pill">I</span>{{JSON.stringify(task.informedUsers.map(informedUsers => (informedUsers.name))).replace(/]|[['"]/g,' ')}}</span>      
         </span>        
        </td>
        <td class="eight text-center">
         <span v-if="task.ongoing == true && !task.closed" v-tooltip="`Ongoing`"><i class="far fa-retweet text-success"></i></span>  
           
         <span v-else-if="task.ongoing == true && task.closed" v-tooltip="`Ongoing:Closed`"><i class="far fa-retweet text-secondary"></i></span>  
          <span v-else>{{task.progress + "%"}}</span>
     
        </td>
        <td class="ten text-center">
            <span v-if="task.watched == true"  v-tooltip="`On Watch`"><i class="fas fa-eye mr-1"></i></span>
            <span v-if="task.important == true"  v-tooltip="`Important`"> <i class="fas fa-star text-warning mr-1"></i></span>
            <span v-if="task.reportable" v-tooltip="`Briefings`"> <i class="fas fa-presentation mr-1 text-primary"></i></span>
            <span v-if="task.isOverdue" v-tooltip="`Overdue`"><i class="fas fa-calendar text-danger mr-1"></i></span>
            <span v-if="task.completed" v-tooltip="`Completed`"><i class="fas fa-clipboard-check text-success mr-1"></i></span>   
            <span v-if="task.ongoing == true && !task.closed" v-tooltip="`Ongoing`"><i class="far fa-retweet text-success"></i></span>  
            <span v-if="task.closed" v-tooltip="`Ongoing:Closed`"><i class="far fa-retweet text-secondary"></i></span>  
            <span v-if="task.onHold == true" v-tooltip="`On Hold`"> <i class="fas fa-pause-circle mr-1 text-primary"></i></span>   
            <span v-if="task.draft == true" v-tooltip="`Draft`"> <i class="fas fa-pencil-alt text-warning"></i></span>  
            <span v-if="task.planned" v-tooltip="`Planned`">  <i class="fas fa-calendar-check text-info mr-1"></i></span>
            <span v-if="task.inProgress" v-tooltip="`In Progress`">    <i class="far fa-tasks text-primary mr-1"></i></span>
         </td>
        <td class="twentyTwo" v-if="task.notes.length > 0">       
          <span  class="toolTip" v-tooltip="('By: ' + task.lastUpdate.user.fullName)" > 
          {{ moment(task.lastUpdate.createdAt).format('DD MMM YYYY, h:mm a')}} <br>         
          </span> 
          <span class="truncate-line-five">
            {{task.lastUpdate.body}}
          </span>         
        </td>  
         <td class="twentyTwo" v-else >No Updates</td>      
      </tr>

      <!-- The context-menu appears only if table row is right-clicked -->
      <ContextMenu
        :facilities="facilities"
        :facilityGroups="facilityGroups"
        :task="task"
        :display="showContextMenu"
        ref="menu"
        @open-task="editTask">  
      </ContextMenu>
    </table>
    <div v-else class="w-100 action-form-overlay updateForm">
      <task-form
        v-if="Object.entries(DV_edit_task).length"
        :facility="facility"
        :contract="contract"
        :vehicle="vehicle"
        :task="DV_edit_task"
        title="Edit Task"
        @task-updated="updateRelatedTaskIssue"
        @on-close-form="onCloseForm"
        class="form-inside-modal"
      ></task-form>     
    </div>  
  </div>
</template>

<script src="https://kit.fontawesome.com/28fee60001.js" crossorigin="anonymous"></script>
<script>

import { mapGetters, mapMutations, mapActions } from "vuex";
import TaskForm from "./task_form.vue";
import ContextMenu from "../../shared/ContextMenu.vue";
import moment from "moment";
Vue.prototype.moment = moment;

import MessageDialogService from "../../../services/message_dialog_service.js";

export default {
  name: "TaskSheets",
  components: {
    TaskForm,
    ContextMenu,
  },
  props:     
      {
    fromView: {
      type: String,
      default: "map_view",
    },
    task: Object,
    showToggle:Boolean,   
  },
  data() {
    return {
      loading: true,
      now: new Date().toISOString(),
      DV_task: {},       
      showALL:"none",  
      DV_edit_task: {},
      has_task: false,
      showContextMenu: false
    };
  },
  mounted() {
    if (this.task) {
      this.loading = false;
      this.DV_task = this.task;
    }    
  },
  methods: {
    ...mapMutations(["updateTasksHash", "setTaskForManager", "setToggleRACI"]),
    ...mapActions(["taskDeleted", "taskUpdated", "updateWatchedTasks"]),
    openSubTask(subTask) {
      let task = this.currentTasks.find((t) => t.id == subTask.id);
      if (!task) return;
      this.has_task = Object.entries(task).length > 0;
      this.DV_edit_task = task;
      this.$refs.taskFormModal && this.$refs.taskFormModal.open();
    },
    openSubIssue(subIssue) {
      let issue = this.currentIssues.find((t) => t.id == subIssue.id);
      if (!issue) return;
      this.has_task = Object.entries(issue).length > 0;
      this.DV_edit_issue = issue;
      this.$refs.taskFormModal && this.$refs.taskFormModal.open();
    },  
    editTask() {
        this.DV_edit_task = this.DV_task;   
        if (this.$route.params.contractId)  {
           return this.$router.push(`/programs/${this.$route.params.programId}/sheet/contracts/${this.$route.params.contractId}/tasks/${this.DV_edit_task.id}`)
        } else if (this.$route.params.vehicleId)  {
           return this.$router.push(`/programs/${this.$route.params.programId}/sheet/vehicles/${this.$route.params.vehicleId}/tasks/${this.DV_edit_task.id}`)
        } else return this.$router.push(`/programs/${this.$route.params.programId}/sheet/projects/${this.$route.params.projectId}/tasks/${this.DV_edit_task.id}`)
    },
    onCloseForm() {
      this.$refs.taskFormModal && this.$refs.taskFormModal.close();
      this.has_task = false;
      this.DV_edit_task = {};
      this.DV_edit_issue = {};
    },
    toggleWatched() {
        if (this.DV_task.watched) {
          this.$confirm(`Are you sure you want to remove this task from on-watch?`, 'Confirm Remove', {
            confirmButtonText: 'Remove',
            cancelButtonText: 'Cancel',
            type: MessageDialogService.msgTypes.WARNING
          }).then(() => {
            this.DV_task = {...this.DV_task, watched: !this.DV_task.watched}
            this.updateWatchedTasks(this.DV_task)
          });
        }
    },
    updateRelatedTaskIssue(task) {
        this.taskUpdated({facilityId: task.facilityId, projectId: task.projectId})  
    },
    getTask(task) {
      return this.currentTasks.find((t) => t.id == task.id) || {};
    },
    getIssue(issue) {
      return this.currentIssues.find((t) => t.id == issue.id) || {};
    },
    openContextMenu(e) {
      e.preventDefault();
      this.$refs.menu.open(e);
    },
    deleteTask() {
      this.$confirm(`Are you sure you want to delete "${this.DV_task.text}"?`, 'Confirm Delete', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: MessageDialogService.msgTypes.WARNING
      }).then(() => {
        this.taskDeleted(this.DV_task)
      });
    }
  },
  computed: {
    ...mapGetters([
      "facilities",
      "facilityGroups",
      "managerView",
      "currentTasks",
      "currentIssues",
      "viewPermit",
      "getToggleRACI",
      "currentProject",
      "getUnfilteredFacilities"
    ]),
    facility() {
      return this.facilities.find((f) => f.id == this.DV_task.facilityId);
    },
    facilityGroup() {
      return this.facilityGroups.find(
        (f) => f.id == this.facility.facilityGroupId
      );
    },
    C_editForManager() {
      return (
        this.managerView.task && this.managerView.task.id == this.DV_task.id
      );
    }
  },
  watch: {
    task: {
      handler(value) {
        this.DV_task = Object.assign({}, value);
      },
      deep: true,
    },
    filterTree(value) {
      this.$refs.duplicatetree.filter(value);
      this.$refs.movetree.filter(value);
    }
  },
};
</script>

<style lang="scss" scoped>
  .t_actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    span {
      font-size: 13px;
    }
    .empty_box,
    .check_box {
      font-size: 16px;
    }
  }
table {
  table-layout: fixed;
  width: 100%;
  margin-bottom: 0 !important;
  overflow: auto;
}
.eight {
  width: 8%;
}
.ten {
  width: 10%;
}
.fort {
  width: 14%;
}
.oneSix {
  width: 16%;
}
.twenty {
  width: 20%;
}
.twentyTwo {
  width: 26%;
}
.pg-content {
  width: 100%;
  height: 20px;
  font-weight: bold;
}
.action-form-overlay {
  position: absolute;
  top:0;
 } 
td {
  overflow-wrap: break-word;
}
// .task_form_modal.sweet-modal-overlay {
//   z-index: 10000001;
// }
.task_form_modal.sweet-modal-overlay ::v-deep .sweet-modal {
  min-width: 30vw;
  max-height: 80vh;
  .sweet-content {
    padding-top: 30px;
    text-align: unset;
  }
  .badge-pill {
    font-size: .85rem;
  }
  .task_form_modal.sweet-modal-overlay ::v-deep .sweet-modal {
    min-width: 30vw;
    max-height: 80vh;
    .sweet-content {
      padding-top: 30px;
      text-align: unset;
    }
    .modal_close_btn {
      display: flex;
      position: absolute;
      top: 20px;
      right: 30px;
      font-size: 20px;
      cursor: pointer;
    }
    // .show-all {
    //  color: red !important;
    // }
    .fa-long-arrow-alt-right {
      margin-bottom: 1rem !important;
      margin-left: 1rem !important;
      height: .8em !important;
    }
    .onHover:hover {
      cursor: pointer !important;
      background-color: rgba(91, 192, 222, 0.3) !important;
      border-left: solid rgb(91, 192, 222) !important;
    }
    .form-inside-modal {
      form {
        position: inherit !important;
      }
    }
  }
  .fa-long-arrow-alt-right {
    margin-bottom: 1rem !important;
    margin-left: 1rem !important;
    height: 0.8em !important;
  }
  .onHover:hover {
    cursor: pointer !important;
    background-color: rgba(91, 192, 222, 0.3) !important;
    border-left: solid rgb(91, 192, 222) !important;
  }
  .toolTip {
    background-color: #6c757d;
    font-size: .75rem;
    padding:1px;
    color: #fff;
    border-radius: 3px;
  }
  .el-menu-item {
    padding: 10px;
    line-height: unset;
    height: unset;
    text-align: center;
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    &:hover {
      background-color: rgba(91, 192, 222, 0.3);
    }
  }
}
.truncate-line-five
{
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  &:hover
  {
    display: -webkit-box;
    -webkit-line-clamp: unset;
  }
}
</style>