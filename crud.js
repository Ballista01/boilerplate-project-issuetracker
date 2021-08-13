const mongoose = require('mongoose');
const startOfDay = require('date-fns/startOfDay');
const endOfDay = require('date-fns/endOfDay');

function crud() {
	const mongo_uri = process.env.MONGO_URI;
	mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
	const db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error: '));
	db.once('open', () => console.log('Mongoose connected to MongoDB Atlas!'));

	const issueSchema = new mongoose.Schema({
		project: { type: String, required: true },
		issue_title: { type: String, required: true },
		issue_text: { type: String, required: true },
		created_by: { type: String, required: true },
		assigned_to: String,
		status_text: String,
		created_on: Date,
		updated_on: Date,
		open: Boolean,
	});
	const Issue = mongoose.model("Issue", issueSchema);

	this.createAndSaveIssue = (input, done) => {
		const { project, issue_title, issue_text, created_by, assigned_to, status_text } = input;
		const issue = new Issue({
			project,
			issue_title,
			issue_text,
			created_by,
			assigned_to,
			status_text,
			created_on: new Date(),
			updated_on: new Date(),
			open: true,
		});
		issue.save((err, savedIssue) => {
			if (err) return console.error(err);
			done(null, savedIssue);
		});
	};

	this.updateIssue = (input, done) => {
		const { _id, ...attributes } = input;
		console.log(attributes);
		Issue.findByIdAndUpdate( _id, attributes, { new: true }, (err, updatedIssue) => {
			if (err) console.error(err);
			done(null, updatedIssue);
		});
	}

	this.deleteIssue = (_id, done) => {
		Issue.findByIdAndDelete(_id, (err, res) => {
			if (err) console.error(err);
			done(null, res);
		});
	}

	this.findByAttributes = (attributes, done) => {
		if (attributes.created_on != undefined) {
			const exact_co = new Date(attributes.created_on);
			if (attributes.created_on[attributes.created_on.length - 1] != 'Z') {
				attributes.created_on = {
					$gte: startOfDay(exact_co),
					$lte: endOfDay(exact_co),
				}
			} else {
				attributes.created_on = exact_co;
			}
		};
		if (attributes.updated_on != undefined) {
			const exact_uo = new Date(attributes.updated_on);
			if (attributes.updated_on[attributes.updated_on.length - 1] != 'Z') {
				attributes.updated_on = {
					$gte: startOfDay(exact_uo),
					$lte: endOfDay(exact_uo),
				}
			} else {
				attributes.updated_on = exact_uo;
			}
		}
		if (attributes.open != undefined) {
			attributes.open = (attributes.open == 'true' ? true : false);
		}

		Issue.find({ ...attributes }, (err, issueArr) => {
			if (err) console.error(err);
			// const resArr = [];
			// for (let i = 0; i < issueArr.length; i++) {
			// 	const { __v, project, ...resIssue } = issueArr[i]._doc;
			// 	resArr.push(resIssue);
			// }
			// done(null, resArr);
			done(null, issueArr);
		});
	};

	this.filterIssueObjProps = (issue, done) => {
		const { __v, project, ...resIssue } = issue._doc;
		done(null, resIssue);
	}
}

module.exports = crud;