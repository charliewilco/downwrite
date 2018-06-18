import Preview from '../pages/preview'
import { Content } from '../components/content'
import { render, wait } from 'react-testing-library'
import 'dom-testing-library/extend-expect'

const id = '6acebce0-20b6-4015-87fe-951c7bb36481'
const post = {
  content:
    '1. Testing reduces liability.\n\n\n\nAs developers we act as agents of a product team or leadership to deliver an a working an application. How do we validate that our application "works" or the story we delivers the specified feature set? The burden of proof is up in the air. Testing shifts that burden away from the development lifecycle and onto the market.\n\n\n\n2. The value of Components\n\n\n\nComponents should do one thing, some stateless, come classes.\n\n\n\nA components existential crisis, where do i, the component, get my state and where do i get my props? do i get them from the Universe, a HoC\n\n\n\nWho\'s mouth are you in?\n\n\n\n3. Testing components\n\n\n\n- Typechecking can get you very far\n\n- Unit tests can get you a little further\n\n- Acceptance testing is 💸💸💸',
  title: 'React Testing',
  dateAdded: '2017-11-18T05:12:36.265Z'
}
describe('<Preview />', () => {
  it('loads server content', async () => {
    fetch.mockResponse(JSON.stringify(post))
    let FetchContent = render(<Preview entry={post} />)
    await wait(() => FetchContent.getByTestId('PREVIEW_ENTRTY_TITLE'))
    expect(FetchContent.container).toBeTruthy()
    expect(FetchContent.getByTestId('PREVIEW_ENTRTY_TITLE')).toHaveTextContent(
      'React Testing'
    )
    expect(FetchContent.getByTestId('PREVIEW_ENTRTY_BODY')).toBeInTheDOM()
  })
  it('takes static content', () => {
    let StaticContent = render(<Content {...post} />)
    expect(StaticContent.getByTestId('PREVIEW_ENTRTY_TITLE')).toHaveTextContent(
      'React Testing'
    )
  })
})
