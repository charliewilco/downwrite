// @flow
import Cookies from 'universal-cookie'
const oatmeal: typeof Cookies = new Cookies()

export const TOKEN: string = oatmeal.get('token')
export const USER_ID: string = oatmeal.get('id')


export const signOut: Function = () => {
	oatmeal.remove('token')
	oatmeal.remove('id')
}

export default oatmeal

export const intialState = {
	token: TOKEN,
	user: USER_ID
}
