'use strict';

const m = require('mongoose');
const Schema = m.Schema;

const PostSchema = new Schema({
	id: String,
	title: String,
	author: String,
	content: Object,
	public: Boolean,
	dateAdded: Date,
	dateModified: Date,
	user: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = m.model('Post', PostSchema);