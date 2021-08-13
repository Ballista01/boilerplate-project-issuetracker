'use strict';

const { json } = require('body-parser');

module.exports = function (app) {
  const CRUD = require('../crud.js');
  const crud = new CRUD();
  const errMsgNoProject = 'Unidentified Project!';
  const errMsgIncompleteInput = 'Incomplete Input';
  const errMsgMissingId = 'Missing Id';
  const sucMsgUpdated = 'successfully updated';

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
      const attributes = { project, ...req.query };

      if (project == '') {
        res.send(errMsgNoProject);
      };
      crud.findByAttributes(attributes, (err, issueArr) => {
        if (err) console.error(err);
        // res.json(issueArr);
        res.json(cleanIssueOutput(issueArr));
      });
    })

    .post(function (req, res) {
      let project = req.params.project;
      console.log(req.body);
      if (req.body.issue_title == '' || req.body.issue_text == '' || req.body.created_by == '') {
        res.send(errMsgIncompleteInput);
      } else if (project == '') {
        res.send(errMsgNoProject);
      } else {
        const issueInput = { ...req.body, project };
        crud.createAndSaveIssue(issueInput, (err, savedIssue) => {
          if (err) console.error(err);
          res.json(cleanIssueOutput(savedIssue));
        });
      };
    })

    .put(function (req, res) {
      let project = req.params.project;
      const attributes = req.body;
      if(attributes._id == ''){
        res.send(errMsgMissingId);
      }
      for (let prop in attributes) {
        // console.log(prop);
        if (attributes[prop] == '') {
          delete attributes[prop];
        }
      }
      console.log(attributes);
      crud.updateIssue(attributes, (err, updatedIssue) => {
        if (err) console.error(err);
        res.json({
          result: sucMsgUpdated,
          _id: attributes._id,
        });
        // res.json(updatedIssue);
      });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;
      if(_id == ''){
        res.send(errMsgMissingId);
      }else{
        crud.deleteIssue(_id, (err, deleteMsg) => {
          if (err) console.error(err);
          res.json(deleteMsg);
        })
      }
    });

};

function cleanIssueOutput(issue) {
  let res;
  if (Array.isArray(issue)) {
    res = [];
    for (let i = 0; i < issue.length; i++) {
      const { __v, project, ...resIssue } = issue[i]._doc;
      res.push(resIssue);
    }
  } else if (issue == undefined){
    res = null;
  } else {
    const { __v, project, ...resIssue } = issue._doc;
    res = resIssue;
  }
  return res;
}