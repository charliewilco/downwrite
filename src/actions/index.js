export const SET_POSTS = 'SET_POSTS'
export const ADD_POST = 'ADD_POST'
export const POST_FETCHED = 'POST_FETCHED'
export const POST_UPDATED = 'POST_UPDATED'
export const POST_DELETED = 'POST_DELETED'

function handleResponse(response) {
  if (response.ok) {
    return response.json()
  } else {
    let error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

export function setPosts(posts) {
  return {
    type: SET_POSTS,
    posts
  }
}

export const addPost = (post) => ({
  type: ADD_POST,
  post
})

export function postFetched(post) {
  return {
    type: POST_FETCHED,
    post
  }
}

export function postUpdated(post) {
  return {
    type: POST_UPDATED,
    post
  }
}

export function postDeleted(postId) {
  return {
    type: POST_DELETED,
    postId
  }
}

export function savePost(data) {
  return dispatch => {
    return fetch('/posts', {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(handleResponse)
    .then(data => dispatch(addPost(data.post)))
  }
}

export function updatePost(data) {
  return dispatch => {
    return fetch(`/posts/v${data._id}`, {
      method: 'put',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(handleResponse)
    .then(data => dispatch(postUpdated(data.post)))
  }
}

export function deletePost(id) {
  return dispatch => {
    return fetch(`/posts/${id}`, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(handleResponse)
    .then(data => dispatch(postDeleted(id)))
  }
}

export function fetchPosts() {
  return dispatch => {
    fetch('/posts')
      .then(res => res.json())
      .then(data => dispatch(setPosts(data)))
  }
}

export function fetchPost(id) {
  return dispatch => {
    fetch(`/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log(data)
        return dispatch(postFetched(data))
      })
  }
}
