import { useCallback } from "react";
import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";

import { DialogContent, DialogOverlay } from "@reach/dialog";
import { FiX } from "react-icons/fi";

import { PostList } from "@components/feed";
import { Loading } from "@components/loading";
import { Banner } from "@components/banner";
import { CustomMeta } from "@components/custom-meta";
import { SiteFooter } from "@components/footer";
import { DashboardState, IPartialFeedItem } from "@data/modules/dashboard";
import { useEnhancedReducer, useDataFactory } from "@hooks/index";
import { Routes } from "@shared/routes";

const DashboardUI: NextPage = () => {
	const dataSource = useDataFactory(DashboardState);
	const [{ selected }, dispatch] = useEnhancedReducer<{
		selected: IPartialFeedItem | null;
	}>({
		selected: null
	});
	const { data, error, mutate } = useSWR(["dashboard"], () => dataSource.getFeed());

	const loading = !data;

	const handleDelete = useCallback(() => {
		if (selected !== null) {
			dataSource.remove(selected.id).then((value) => {
				dispatch(null);

				const mutated = dataSource.mutateFeedList(data, value.deleteEntry.id);

				mutate(mutated, false);
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected, data, mutate, dispatch]);

	const handleSelect = useCallback(
		(feedItem: IPartialFeedItem) => {
			dispatch({ selected: feedItem });
		},
		[dispatch]
	);
	const handleCancel = useCallback(
		() =>
			dispatch({
				selected: null
			}),
		[dispatch]
	);

	if (loading || (data === undefined && error === undefined)) {
		return (
			<div className="outer">
				<CustomMeta title="Loading" path="dashboard" />
				<Loading />
				<style jsx>{`
					.outer {
						min-height: 100%;
					}
				`}</style>
			</div>
		);
	}

	if (error) {
		return (
			<div className="outer">
				<CustomMeta title="Error" path="dashboard" />
				<div data-testid="INVALID_TOKEN_CONTAINER">
					<p>{error.message}</p>
					<Link href={Routes.LOGIN} passHref>
						<a>Let&apos;s sign in again.</a>
					</Link>
				</div>
				<style jsx>{`
					.outer {
						min-height: 100%;
					}
				`}</style>
			</div>
		);
	}

	if (data) {
		const titlePrefix =
			data.feed.length > 0
				? data.feed.length.toString().concat(" Entries ")
				: "No Entries ";
		return (
			<section className="outer">
				<CustomMeta title={titlePrefix} path="dashboard" />

				<Banner label="Note">
					This app is currently in a major major beta. Swim at your own risk.
				</Banner>

				{selected !== null && (
					<DialogOverlay>
						<DialogContent>
							<button className="alt-button close" onClick={handleCancel}>
								<FiX />
							</button>
							<div className="content">
								<h6>Delete Post</h6>
								<p>
									Are you sure you want to delete{" "}
									<span>&#8220;{selected.title}&#8221;</span>?
								</p>
							</div>
							<footer>
								<button className="alt-button cancel" onClick={handleCancel}>
									Cancel
								</button>
								<button className="base-button" onClick={handleDelete}>
									Delete
								</button>
							</footer>
						</DialogContent>
					</DialogOverlay>
				)}
				{data.feed.length > 0 ? (
					<PostList onSelect={handleSelect} posts={data.feed} />
				) : (
					<section className="empty" id="NO_ENTRIES_PROMPT">
						<div>
							<div>
								<Image
									width={96}
									height={96}
									src="/static/nib.svg"
									alt="Pen nip hovering over page"
								/>
							</div>
							<div>
								<h4 className="help-title">
									Looks like you don&apos;t have any entries
								</h4>
								<Link href={Routes.NEW}>
									<a data-testid="GET_STARTED_LINK">Get Started &rarr; </a>
								</Link>
							</div>
						</div>
					</section>
				)}

				<SiteFooter />

				<style jsx>{`
					.outer {
						min-height: 100%;
					}

					:global([data-reach-dialog-content]) {
						background: var(--surface);
						padding: 0;
						position: relative;
						max-width: 33rem;
					}

					.cancel {
						margin-right: 1rem;
					}

					h6 {
						font-family: var(--sans-serif);
						font-weight: 400;
						font-size: 1.25rem;
						margin-top: 1rem;
						margin-bottom: 1rem;
					}

					.close,
					.content,
					footer {
						padding: 1rem;
					}

					.close {
						top: 0;
						right: 0;
						margin: 0;
						position: absolute;
					}

					footer {
						display: flex;
						justify-content: flex-end;
						font-size: 0.875rem;
					}

					.empty {
						max-width: 24rem;
						margin: 0 auto;
						text-align: center;
					}

					.help-title {
						font-family: var(--monospace);
					}
				`}</style>
			</section>
		);
	}

	return null;
};

export default DashboardUI;
