import * as Mongoose from 'mongoose';

const PostSchema = new Mongoose.Schema({
  id: String,
  title: String,
  author: String,
  content: Object,
  public: Boolean,
  dateAdded: Date,
  dateModified: Date,
  user: { type: Mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default Mongoose.model('Post', PostSchema);
