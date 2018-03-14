import { Export } from '../components'

const spy = jest.spyOn(Export.prototype, 'export')

const wrapper = mount(<Export />)

describe('<Export />', () => {
  it('')

  afterEach(() => {
    spy.mockClear()
  })
})
