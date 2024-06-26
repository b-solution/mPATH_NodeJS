<template>
  <div>
    <table class="table table-sm table-bordered table-striped">
      <tr v-if="!loading" class="issues_show mx-3 mb-3 mt-0 py-4 edit-action" @click.prevent="editIssue" data-cy="issue_row" @mouseup.right="openContextMenu" @contextmenu.prevent="">
        <td class="oneFive">{{issue.title}}</td>
        <td class="ten col-issue_type">{{issue.issueType}}</td>
        <td class="ten col-issue_severity">{{issue.issueSeverity}}</td>
        <td class="eight text-center">{{formatDate(issue.startDate)}}</td>
        <td class="eight text-center">              
         <span v-if="issue.onHold && issue.dueDate == null" v-tooltip="`On Hold (w/no Due Date)`"><i class="fas fa-pause-circle text-primary"></i></span>
          <span v-else>
          {{formatDate(issue.dueDate)}}
          </span>             
        </td>       
         <td class="oneThree" >  
          <span v-if="(issue.responsibleUsers.length > 0) && (issue.responsibleUsers[0] !== null)"> <span class="badge mr-1 badge-secondary font-sm badge-pill">R</span>{{issue.responsibleUsers[0].name}} <br></span> 
          <span v-if="(issue.accountableUsers.length > 0) && (issue.accountableUsers[0] !== null)"> <span class="badge mr-1 font-sm badge-secondary badge-pill">A</span>{{issue.accountableUsers[0].name}}<br></span>   
      <!-- Consulted Users and Informed Users are toggle values         -->
          <span :class="{'show-all': getToggleRACI }" >             
             <span v-if="(issue.consultedUsers.length > 0) &&  (issue.consultedUsers[0] !== null)"> <span class="badge mr-1 font-sm badge-secondary badge-pill">C</span>{{JSON.stringify(issue.consultedUsers.map(consultedUsers => (consultedUsers.name))).replace(/]|[['"]/g, ' ')}}<br></span> 
             <span v-if="(issue.informedUsers.length > 0) &&  (issue.informedUsers[0] !== null)"> <span class="badge font-sm badge-secondary mr-1 badge-pill">I</span>{{JSON.stringify(issue.informedUsers.map(informedUsers => (informedUsers.name))).replace(/]|[['"]/g, ' ')}}</span>      
         </span>        
        </td>
        <td class="eight text-center">{{issue.progress + "%"}}</td>     
        <td class="ten text-center" >
            <span v-if="issue.watched == true"  v-tooltip="`On Watch`"><i class="fas fa-eye mr-1"></i></span>
            <span v-if="issue.important == true"  v-tooltip="`Important`"> <i class="fas fa-star text-warning mr-1"></i></span>
            <span v-if="issue.reportable" v-tooltip="`Briefings`"><i class="fas fa-presentation mr-1 text-primary"></i></span>
            <span v-if="issue.isOverdue" v-tooltip="`Overdue`"> <i class="fas fa-calendar text-danger mr-1"></i></span>
            <span v-if="issue.completed" v-tooltip="`Completed`"><i class="fas fa-clipboard-check text-success mr-1"></i></span>   
            <span v-if="issue.onHold == true" v-tooltip="`On Hold`"><i class="fas fa-pause-circle mr-1 text-primary"></i></span>   
            <span v-if="issue.draft == true" v-tooltip="`Draft`"> <i class="fas fa-pencil-alt text-warning"></i></span>  
            <span v-if="issue.planned" v-tooltip="`Planned`"> <i class="fas fa-calendar-check text-info mr-1"></i></span>
            <span v-if="issue.inProgress" v-tooltip="`In Progress`"> <i class="far fa-tasks text-primary mr-1"></i></span> 
          </td>
       <td class="twenty" v-if="issue.notes.length > 0">       
          <span  class="toolTip" v-tooltip="('By: ' + issue.lastUpdate.user.fullName)" > 
          {{ moment(issue.lastUpdate.createdAt).format('DD MMM YYYY, h:mm a')}} <br>         
          </span> 
          <span class="truncate-line-five">
            {{issue.lastUpdate.body}}
          </span>         
        </td>  
         <td class="twenty" v-else >No Updates</td> 
      </tr>
      <!-- The context-menu appears only if table row is right-clicked -->
      <IssueContextMenu
        :facilities="facilities"
        :facilityGroups="facilityGroups"
        :issue="issue"
        :display="showContextMenu"
        ref="menu"
        @open-issue="editIssue">  
      </IssueContextMenu>
    </table>
      <div v-if="has_issue" class="w-100 action-form-overlay  updateForm">
        <issue-form
          v-if="Object.entries(DV_edit_issue).length"
          :facility="facility"
          :contract="contract"
          :vehicle="vehicle"
          :issue="DV_edit_issue"
          @on-close-form="onCloseForm"
          @issue-updated="updateRelatedTaskIssue"
          class="form-inside-modal"
        ></issue-form>
      </div>

  </div>
</template>

<script>
  import {mapGetters, mapMutations, mapActions} from "vuex"
  import {SweetModal} from 'sweet-modal-vue'
  import IssueForm from "./issue_form.vue"
  import TaskForm from "./../tasks/task_form.vue"
  import IssueContextMenu from "../../shared/IssueContextMenu.vue"
  import moment from 'moment'
  Vue.prototype.moment = moment

  import MessageDialogService from "../../../services/message_dialog_service.js";

export default {
    name: 'IssueSheets',
    components: {
      IssueForm,
      TaskForm,
      SweetModal,
      IssueContextMenu
    },
    props: {
      fromView: {
        type: String,
        default: 'map_view'
      },
      issue: Object
    },
    data() {
      return {
        show: true,
        loading: true,
        DV_issue: {},
        DV_edit_task: {},
        DV_edit_issue: {},
        has_issue: false,
        now: new Date().toISOString(),
        showContextMenu: false
      }
    },
    mounted() {
      if (this.issue) {
        this.loading = false
        this.DV_issue = this.issue
      }
    },
    methods: {
      ...mapMutations([
        'updateIssuesHash',
        'setTaskForManager',
        'setToggleRACI'
      ]),
      ...mapActions([
        'issueDeleted',
        'taskUpdated',
        'updateWatchedIssues'
      ]),
      editIssue() {
          this.DV_edit_issue = this.DV_issue
          if (this.$route.params.contractId)  {
            this.$router.push(`/programs/${this.$route.params.programId}/sheet/contracts/${this.$route.params.contractId}/issues/${this.DV_edit_issue.id}`)
          } else if (this.$route.params.vehicleId)  {
            this.$router.push(`/programs/${this.$route.params.programId}/sheet/vehicles/${this.$route.params.vehicleId}/issues/${this.DV_edit_issue.id}`)
          } else  this.$router.push(`/programs/${this.$route.params.programId}/sheet/projects/${this.$route.params.projectId}/issues/${this.DV_edit_issue.id}`)
      },
      deleteIssue() {
        this.$confirm(`Are you sure you want to delete this issue?`, 'Confirm Delete', {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          type: MessageDialogService.msgTypes.WARNING
        }).then(() => {
          this.issueDeleted(this.DV_issue)
        });
      },
      openSubTask(subTask) {
        let task = this.currentTasks.find(t => t.id == subTask.id)
        if (!task) return
        this.has_issue = Object.entries(task).length > 0
        this.DV_edit_task = task
        this.$refs.issueFormModal && this.$refs.issueFormModal.open()
      },
      openSubIssue(subIssue) {
        let issue = this.currentIssues.find(t => t.id == subIssue.id)
        if (!issue) return
        this.has_issue = Object.entries(issue).length > 0
        this.DV_edit_issue = issue
        this.$refs.issueFormModal && this.$refs.issueFormModal.open()
      },
      onCloseForm() {
        this.$refs.issueFormModal && this.$refs.issueFormModal.close()
        this.has_issue = false
        this.DV_edit_task = {}
        this.DV_edit_issue = {}
      },
      toggleWatched() {
        if (this.DV_issue.watched) {
          this.$confirm(`Are you sure you want to remove this issue from on-watch?`, 'Confirm Remove', {
            confirmButtonText: 'Remove',
            cancelButtonText: 'Cancel',
            type: MessageDialogService.msgTypes.WARNING
          }).then(() => {
            this.DV_issue = {...this.DV_issue, watched: !this.DV_issue.watched}
            this.updateWatchedIssues(this.DV_issue)
          });
        }
      },
      getIssue(issue) {
        return this.currentIssues.find(t => t.id == issue.id) || {}
      },
      openContextMenu(e) {
        e.preventDefault();
        this.$refs.menu.open(e);
      },
    },
    computed: {
      ...mapGetters([
        'facilities',
        'facilityGroups',
        'managerView',
        'currentTasks',
        'currentIssues',
        'viewPermit',
        'getToggleRACI',
      ]),
      is_overdue() {
        return this.DV_issue.progress !== 100 && new Date(this.DV_issue.dueDate).getTime() < new Date().getTime()
      },      
      facility() {
        return this.facilities.find(f => f.id == this.DV_issue.facilityId)
      },
      facilityGroup() {
        return this.facilityGroups.find(f => f.id == this.facility.facilityGroupId)
      },
      C_editForManager() {
        return this.managerView.issue && this.managerView.issue.id == this.DV_issue.id
      }
    },
    watch: {
      issue: {
        handler: function(value) {
          this.DV_issue = Object.assign({}, value)
        }, deep: true
      }
    }
  }
</script>

<style scoped lang="scss">
  table {
    table-layout: fixed;
    width: 100%;
    margin-bottom: 0 !important;
  }
  .eight {
    width: 8%;
  }
  .nine {
    width: 9%;
  }
  .ten {
    width: 10%;
  }
  .elev {
    width: 11%;
  }
  .oneThree {
    width: 13%;
  }
  .fort {
    width: 14%;
  }
  .oneFive {
    width: 15%;
  }
  .twenty {
    width: 20%;
  }
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
  td {
    overflow-wrap: break-word;   
  }
  .issue_form_modal.sweet-modal-overlay {
    z-index: 10000001;
  }
  .toolTip {
    background-color: #6c757d;
    font-size: .75rem;
    padding:1px;
    color: #fff;
    border-radius: 3px;
  }
  .issue_form_modal.sweet-modal-overlay ::v-deep .sweet-modal {
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
    .badges {
      background-color: #fafafa;
      color: #383838;
      border: solid 1px #383838 !important;
    }
    .form-inside-modal {
      form {
        position: inherit !important;
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
