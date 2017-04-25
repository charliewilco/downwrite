import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import posts from './reducers/posts'

export default combineReducers({ posts, router: routerReducer })
