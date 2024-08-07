const { db } = require("../database/models");
const { _ } = require("lodash");
const qs = require("qs");
const { getCurrentUser } = require("../utils/helpers.js");

const index = async (req, res) => {
  try {
    let user = await getCurrentUser(req.headers["x-token"]);
    const authorizedProgramIds = await user.authorizedProgramIds();
    if (authorizedProgramIds.includes(req.query.project_id)) {
      const projectContracts = await db.ProjectContract.findAll({
        where: { project_id: req.query.project_id },
        include: [{ model: db.ContractProjectDatum }],
      });
      let contracts = [];
      for (const projectContract of projectContracts) {
        console.log("Loop Project Contract: ", projectContract.ContractProjectDatum);
        contracts.push(await projectContract.ContractProjectDatum.toJSON({ project_contract: projectContract }));
      }
      const totalCount = contracts.length;
      return res.send({ contracts: contracts, total_count: totalCount });
      // return { contracts: await contracts[0].toJSON(), total_count: totalCount };
    }
  } catch (error) {
    return {
      error: "You are not authorized to see contracts!" + error,
    };
  }
};

const show = async (req, res) => {
  try {
    params = qs.parse(req.params);
    console.log("Req: ", req.params);
    let user = await getCurrentUser(req.headers["x-token"]);
    console.log;
    const authorizedProgramIds = await user.authorizedProgramIds();
    if (authorizedProgramIds.includes(params.id)) {
      let project_contract = await db.ProjectContract.findOne({ where: { project_id: params.id }, include: [{ model: db.ContractProjectDatum }] });
      return { contract: await project_contract.ContractProjectDatum.toJSON({ project_contract: project_contract }) };
    }
  } catch (error) {
    return {
      error: "You are not authorized to see contract!",
    };
  }
};

module.exports = {
  index,
  show,
};
