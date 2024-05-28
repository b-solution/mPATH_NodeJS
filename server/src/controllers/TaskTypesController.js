const { db } = require("../database/models");
const qs = require("qs");

const index = async (req, res) => {
  try {
    let params = qs.parse(req.query);
    let taskTypes = [];
    if (params.project_id) {
      const project = await db.Project.findByPk(params.project_id);
      console.log("Project: ", project);
      const getTaskType = await project.getTaskTypes();
      taskTypes = getTaskType[0].dataValues;
      console.log("Task Types: ", getTaskType);
    } else {
      taskTypes = await db.TaskType.findAll();
    }
    return { task_types: taskTypes };
  } catch (error) {
    res.code(500);
    return { error: "Error fetching task " + error };
  }
};
// const index = async (req, res) => {
//   try {
//     let params = qs.parse(req.query);
//     let taskStages = [];
//     if (params.project_id) {
//       const project = await db.Project.findByPk(req.query.project_id);
//       console.log("Project: ", project);
//       const getTaskStages = await project.getTaskStages();
//       taskStages = getTaskStages[0].dataValues;
//       console.log("TaskStages: ", taskStages);
//     } else {
//       taskStages = await db.TaskStage.findAll();
//       console.log("TaskStages: ", taskStages);
//     }
//     console.log("Params: ", params);
//     return { task_stages: taskStages };
//   } catch (error) {
//     res.code(500);
//     return { error: "Error fetching task " + error };
//   }
// };

module.exports = {
  index,
};
