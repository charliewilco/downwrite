import NewEditor from './New'
import PostEditor from './Edit'
import Home from './Home'
import Dashboard from './Dashboard'
import NotFound from './NoMatch'
import SignOut from './SignOut'
import Preview from './Preview'
import Legal from './Legal'

export default [
  {
    path: '/',
    exact: true,
    component: Dashboard,
    defaultComponent: Home,
    home: true
  },
  {
    path: '/new',
    component: NewEditor,
    private: true
  },
  {
    path: '/:id/edit',
    component: PostEditor,
    private: true
  },
  {
    path: '/:id/preview',
    component: Preview
  },
  {
    path: '/legal',
    component: Legal
  },
  {
    path: false,
    component: NotFound
  }
]
