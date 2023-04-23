import { DownwriteClient } from "@data/client";
import type { IAppState } from "../types";
import type { IAllPostsQuery } from "../../__generated__/client";

export interface IPartialFeedItem {
	id: string;
	title: string;
}

export class DashboardState {
	#client: DownwriteClient;
	#store: IAppState;
	constructor(_graphql: DownwriteClient, store: IAppState) {
		this.#client = _graphql;
		this.#store = store;
	}

	getFeed() {
		return this.#client.allPosts();
	}

	async remove(id: string) {
		try {
			const value = this.#client.removeEntry(id);
			return value;
		} catch (error) {
			this.#store.notifications.error(error.message, true);
		}
	}

	mutateFeedList(data: IAllPostsQuery, selectedId: string): IAllPostsQuery {
		const index = data.feed.findIndex(({ id }) => selectedId === id);

		if (index > -1) {
			data.feed.splice(index, 1);
		}
		return {
			...data
		};
	}
}
