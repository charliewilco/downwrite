import { SET_POSTS, ADD_POST, POST_FETCHED, POST_UPDATED, POST_DELETED } from '../actions'

export default function posts(state = [], action = {}) {
  switch(action.type) {
    case ADD_POST:
      return [...state, action.post]

    case POST_DELETED:
      return state.filter(item => item._id !== action.postId)

    case POST_UPDATED:
      return state.map(item => {
        if (item._id === action.post._id) return action.post
        return item
      })

    case POST_FETCHED:
      const index = state.findIndex(item => item._id === action.post._id)
      if (index > -1) {
        return state.map(item => {
          if (item._id === action.post._id) return action.post
          return item
        })
      } else {
        return [
          ...state,
          action.post
        ]
      }

    case SET_POSTS:
      return action.posts

    default:
      return state
  }
}
