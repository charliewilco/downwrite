const m = require('mongoose')
const Schema = m.Schema

const UserSchema = new Schema({
	username: { type: String, required: true, index: { unique: true } },
	email: { type: String, required: true, index: { unique: true } },
	password: { type: String, required: true },
	admin: { type: Boolean, required: true },
	posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
})

module.exports = m.model('User', UserSchema)
