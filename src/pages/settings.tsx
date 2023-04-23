import useSWR from "swr";
import { useRef, useReducer, useMemo } from "react";
import { useFormik } from "formik";
import { MixedCheckbox } from "@reach/checkbox";

import { CustomMeta } from "@components/custom-meta";
import { UIInput, UIInputError } from "@components/ui-input";
import { Loading } from "@components/loading";
import { SiteFooter } from "@components/footer";

import { useDataSource } from "@hooks/useDataSource";
import type { IUserFormValues } from "@data/base/settings";
import {
	userSettings,
	updatePassword,
	localSettings,
	zodAdapter
} from "@shared/validations";

interface ILocalSettings {
	fileExtension: string;
}

interface IPasswordSettings {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
}

const SettingsPage = () => {
	const adaptedSchemas = useMemo(() => {
		return {
			userSettings: zodAdapter(userSettings),
			updatePassword: zodAdapter(updatePassword),
			localSettings: zodAdapter(localSettings)
		};
	}, []);
	const [isOpen, onToggleOpen] = useReducer((prev: boolean) => !prev, false);
	const dataSource = useDataSource();
	const { error, data } = useSWR(["settings"], () =>
		dataSource.graphql.userDetails()
	);

	const initialMarkdownValues = useRef<() => ILocalSettings>(() => ({
		fileExtension: dataSource.settings.fileExtension || ".md"
	}));

	const markdownForm = useFormik<ILocalSettings>({
		initialValues: initialMarkdownValues.current(),
		validationSchema: adaptedSchemas.localSettings,
		onSubmit(values) {
			dataSource.settings.fileExtension = values.fileExtension;

			dataSource.settings.handleSettingsUpdate(values);
		}
	});

	const passwordForm = useFormik<IPasswordSettings>({
		initialValues: {
			oldPassword: "",
			newPassword: "",
			confirmPassword: ""
		},
		async onSubmit(_: IPasswordSettings, actions) {
			await actions.validateForm();
			await dataSource.settings.changePassword(_);
		},
		validationSchema: adaptedSchemas.updatePassword
	});

	const userForm = useFormik<IUserFormValues>({
		initialValues: { ...data?.settings },
		onSubmit(values) {
			dataSource.settings.update(values);
		},
		validationSchema: adaptedSchemas.userSettings
	});

	const loading = !data;

	if (loading) {
		return <Loading />;
	}

	if (error) {
		return (
			<div>
				<pre>{JSON.stringify(error, null, 2)}</pre>
			</div>
		);
	}

	return (
		<div className="outer" data-testid="SETTINGS_CONTAINER">
			<CustomMeta title="User Settings" path="settings" />
			<header>
				<h1 className="page-title">Settings</h1>
			</header>

			<div className="usage">
				<dl>
					<div className="stat">
						<dt>Total Entries</dt>
						<dd>{data?.me.usage.entryCount}</dd>
					</div>
					<div className="stat">
						<dt>Public Entries</dt>
						<dd>{data?.me.usage.publicEntries}</dd>
					</div>
					<div className="stat">
						<dt>Private Entries</dt>
						<dd>{data?.me.usage.privateEntries}</dd>
					</div>
				</dl>
			</div>

			<section>
				<div className="info">
					<h4>User Settings</h4>
				</div>
				<div className="form">
					<form onSubmit={userForm.handleSubmit}>
						<div>
							<UIInput
								testID="SETTINGS_USERNAME_INPUT"
								placeholder="username"
								label="Username"
								name="username"
								autoComplete="username"
								value={userForm.values.username}
								onChange={userForm.handleChange}
							/>
							{userForm.errors.username && (
								<UIInputError>{userForm.errors.username}</UIInputError>
							)}
						</div>
						<div>
							<UIInput
								testID="SETTINGS_EMAIL_INPUT"
								placeholder="user@email.com"
								label="Email"
								autoComplete="email"
								type="email"
								name="email"
								value={userForm.values.email}
								onChange={userForm.handleChange}
							/>
							{userForm.errors.email && (
								<UIInputError>{userForm.errors.email}</UIInputError>
							)}
						</div>
						<div className="action">
							<button
								className="base-button"
								type="submit"
								disabled={userForm.isSubmitting}>
								Save
							</button>
						</div>
					</form>
				</div>
			</section>

			<section>
				<div className="info">
					<h4>Password</h4>
				</div>
				<div className="form">
					<form onSubmit={passwordForm.handleSubmit}>
						<input type="hidden" name="username" value={data.settings.username} />
						<div>
							<UIInput
								label="Old Password"
								name="oldPassword"
								type={!isOpen ? "password" : "text"}
								placeholder="*********"
								value={passwordForm.values.oldPassword}
								onChange={passwordForm.handleChange}
								autoComplete="current-password"
							/>
							{passwordForm.errors.oldPassword && (
								<UIInputError>{passwordForm.errors.oldPassword}</UIInputError>
							)}
						</div>
						<div>
							<UIInput
								label="New Password"
								name="newPassword"
								type={!isOpen ? "password" : "text"}
								placeholder="*********"
								value={passwordForm.values.newPassword}
								onChange={passwordForm.handleChange}
								autoComplete="new-password"
							/>
							{passwordForm.errors.newPassword && (
								<UIInputError>{passwordForm.errors.newPassword}</UIInputError>
							)}
						</div>

						<div>
							<UIInput
								label="Confirm Your New Password"
								name="confirmPassword"
								type={!isOpen ? "password" : "text"}
								placeholder="*********"
								value={passwordForm.values.confirmPassword}
								onChange={passwordForm.handleChange}
								autoComplete="new-password"
							/>
							{passwordForm.errors.confirmPassword && (
								<UIInputError>{passwordForm.errors.confirmPassword}</UIInputError>
							)}
						</div>

						<div className="action password">
							<div>
								<label className="checkbox-container">
									<MixedCheckbox
										name="Password Hidden"
										checked={isOpen}
										onChange={onToggleOpen}
									/>
									<span className="checkbox-label">
										{!isOpen ? "Values hidden" : "Values shown"}
									</span>
								</label>
							</div>
							<button
								className="base-button"
								type="submit"
								disabled={passwordForm.isSubmitting}>
								Save
							</button>
						</div>
					</form>
				</div>
			</section>

			<section>
				<div className="info">
					<h4>Local Settings</h4>
					<p>
						Settings only saved in your browser and won&apos;t sync across devices.
					</p>
				</div>
				<div className="form">
					<form onSubmit={markdownForm.handleSubmit}>
						<div>
							<UIInput
								label="File Extension"
								{...markdownForm.getFieldProps("fileExtension")}
							/>
							{markdownForm.errors["fileExtension"] && (
								<UIInputError>{markdownForm.errors["fileExtension"]}</UIInputError>
							)}
						</div>
						<div className="action">
							<button
								className="base-button"
								type="submit"
								disabled={markdownForm.isSubmitting}>
								Save
							</button>
						</div>
					</form>
				</div>
			</section>
			<SiteFooter />

			<style jsx>{`
				.outer {
					max-width: 56rem;
					padding: 0 0.5rem;
					margin-left: auto;
					margin-right: auto;
				}

				h4 {
					font-size: 1.25rem;
					margin-bottom: 1rem;
				}

				header {
					margin-top: 4rem;
					margin-bottom: 1rem;
				}

				dl,
				section {
					display: grid;
					gap: 1rem;
					grid-template-columns: repeat(12, minmax(0, 1fr));
				}

				.checkbox-container {
					display: flex;
					align-items: center;
				}

				.checkbox-label {
					margin-left: 1rem;
				}

				.usage,
				section {
					margin-bottom: 1rem;
				}

				section {
					padding: 1rem;
				}

				section,
				.stat {
					box-shadow: 0 2px 6px 0 hsla(0, 0%, 0%, 0.2);
					background: var(--surface);
				}

				dt {
					font-size: 0.875rem;
					letter-spacing: 0.02em;
					margin-bottom: 1rem;
					text-transform: uppercase;
				}

				dd {
					font-family: var(--monospace);
					font-size: 3rem;
					line-height: 1;
					font-weight: 300;
					text-align: right;
				}

				.stat {
					grid-column: span 4 / span 4;
					padding: 1rem;
				}

				.info {
					grid-column: span 12 / span 12;
				}

				.form {
					grid-column: span 12 / span 12;
				}

				p {
					font-size: small;
					font-style: italic;
				}

				.action {
					display: flex;
					justify-content: flex-end;

					align-items: center;
					padding: 1rem 0 0;
				}

				.action.password {
					justify-content: space-between;
				}

				@media (min-width: 40rem) {
					.info {
						grid-column: span 3 / span 3;
					}

					.form {
						grid-column: span 9 / span 9;
					}

					h4 {
						margin-bottom: 1.5rem;
					}
				}
			`}</style>
		</div>
	);
};

export default SettingsPage;
