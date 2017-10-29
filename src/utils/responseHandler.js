import { convertFromRaw } from 'draft-js'

type Handler = {
	json: Function,
	statusText: string,
	ok: boolean
}

export const handleResponse: Function = (response: Handler) => {
	if (response.ok) {
		return response.json()
	} else {
		let error: typeof Error = new Error(response.statusText)
		error.response = response
		throw error
	}
}

type Content = { blocks: array, entityMap: Object }

export const superConverter: Function = (content: Content) => {
	return content.hasOwnProperty('entityMap')
		? convertFromRaw(content)
		: convertFromRaw({ blocks: content.blocks, entityMap: {} })
}
