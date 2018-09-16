const m = require('mongoose');

const PostSchema = new m.Schema({
  id: String,
  title: String,
  author: String,
  content: Object,
  public: Boolean,
  dateAdded: Date,
  dateModified: Date,
  user: { type: m.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = m.model('Post', PostSchema);
