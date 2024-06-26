
<template>
  <div id="notes-show" data-cy="notes">
      <div v-if="permitted('write') && show == false">
        <notes-form           
          title="Edit Note"
          :note="DV_note"
          :facility="facility"
          @close-note-input="show=true"
          @note-updated="noteUpdated"
        />
      
      </div>
    <div v-if="C_editForManager" class="blur_show float-right">
      <div class="text-danger d-flex align-items-center">
        <i class="fas fa-long-arrow-alt-right"></i>
      </div>
    </div>
    <div v-if="!loading" class="notes_show mb-3 p-2 mx-0">
      <div v-if="show">
        <div class="crud-actions mx-3 float-right">
          <span v-if="permitted('write')" class="mr-2 font-sm edit-action" @click.stop="editNoteMode" data-cy="note_edit_icon">
            <i class="fas fa-edit"></i>
          </span>
          <span v-if="permitted('delete')" class="font-sm delete-action" @click.stop="deleteNote" data-cy="note_delete_icon">
            <i class="fas fa-trash-alt"></i>
          </span>
        </div>
        <div class="note_by my-2">
          <!-- <span class="badge badge-secondary">Note by</span> -->
          <span class="text-muted font-sm">{{noteBy}}</span>
        </div>
        <div v-if="DV_note.attachFiles.length > 0" class="note_files">
          <span class="badge badge-secondary mr-3">Note Files</span>
          <span v-for="file in DV_note.attachFiles">
            <span class="file-icon" v-tooltip.bottom="`${file.name}`" @click="downloadFile(file)">
              <i class="fas fa-file-alt"></i>
            </span>
          </span>
        </div>
        <div class="note_body my-2 font-sm">
          {{DV_note.body}}
        </div>
      </div>
    
    </div>

  </div>
</template>


<script>
  import http from './../../../common/http'
  import {mapGetters, mapMutations} from 'vuex'
  import NotesForm from './notes_form.vue'
  import {API_BASE_PATH} from './../../../mixins/utils'

  import MessageDialogService from "../../../services/message_dialog_service.js";

export default {
    props: ['facility', 'note', 'from'],
    components: {
      NotesForm
    },
    data() {
      return {
        show: true,
        loading: true,
        DV_note: null
      }
    },
    mounted() {
      if (!_.isEmpty(this.note)) {
        this.loading = false
        this.DV_note = this.note
      }
    },
    methods: {
      ...mapMutations([
        'setTaskForManager'
      ]),
       _isallowed(salut) {
          return this.checkPrivileges("notes_show", salut, this.$route)

      //  if (this.$route.params.contractId) {
      //     // return this.defaultPrivileges
      //     let fPrivilege = this.$contractPrivileges[this.$route.params.programId][this.$route.params.contractId]    
      //     let permissionHash = {"write": "W", "read": "R", "delete": "D"}
      //     let s = permissionHash[salut]
      //     return fPrivilege.notes.includes(s);
      //   } else {
      //     let fPrivilege = this.$projectPrivileges[this.$route.params.programId][this.$route.params.projectId]    
      //     let permissionHash = {"write": "W", "read": "R", "delete": "D"}
      //     let s = permissionHash[salut]
      //     return fPrivilege.notes.includes(s); 
      //   }
     },
      editNoteMode() {
        this.setTaskForManager({key: 'note', value: this.DV_note})

        this.$router.push(`/programs/${this.$route.params.programId}/map/projects/${this.$route.params.projectId}/notes/${this.DV_note.id}`)
      },
      noteUpdated(note) {
        this.show = true
        this.$emit('note-updated', note)
      },
      deleteNote() {
        this.$confirm(`Are you sure you want to delete this note?`, 'Confirm Delete', {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          type: MessageDialogService.msgTypes.WARNING
        }).then(() => {
          http
            .delete(`${API_BASE_PATH}/programs/${this.currentProject.id}/projects/${this.facility.id}/notes/${this.note.id}.json`)
            .then((res) => {
              this.loading = false
              this.$emit('note-deleted', this.note)
              MessageDialogService.showDialog({
                response: res
              })
            })
            .catch((err) => {
              this.loading = false
              console.error(err)
            })
        });
      },
      downloadFile(file) {
        if (this._isallowed('write')) {
          let url = window.location.origin + file.uri
          window.open(url, '_blank')
        }
      }
    },
    computed: {
      ...mapGetters([
        'currentProject',
        'managerView'
      ]),
      noteBy() {
        if (this.loading) return null
        return `${this.DV_note.user.fullName} at ${new Date(this.DV_note.createdAt).toLocaleString()}`
      },
      permitted() {
        return salut => !this.loading && this.note.userId === this.$currentUser.id && this._isallowed(salut)
      },
      C_editForManager() {
        return this.managerView.note && this.managerView.note.id == this.DV_note.id
      }
    },
    watch: {
      note: {
        handler: function(value) {
          this.DV_note = value
        },
        deep: true
      }
    }
  }
</script>

<style scoped lang="scss">
  .notes_input {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
  }
  .note_body {
    padding-top: 10px;
    word-break: break-word;
    min-height: 80px;
    overflow-y: auto;
    font-size: 1.06rem;
  }
  .file-icon {
    cursor: pointer;
    font-size: 15px;
    color: gray;
    margin-right: 10px;
  }
</style>
