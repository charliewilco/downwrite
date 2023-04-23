import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useFormik } from "formik";

import { useDataSource } from "@hooks/useDataSource";
import { CustomMeta } from "@components/custom-meta";
import { UIInput, UIInputError } from "@components/ui-input";
import { SiteFooter } from "@components/footer";
import { ILoginValues } from "@data/base/auth";
import { loginForm, zodAdapter } from "@shared/validations";
import { Routes } from "@shared/routes";

const LoginPage: NextPage = () => {
	const router = useRouter();
	const dataSource = useDataSource();
	const formik = useFormik<ILoginValues>({
		initialValues: {
			user: "",
			password: ""
		},
		validationSchema: zodAdapter(loginForm),
		validateOnChange: false,
		validateOnMount: false,
		onSubmit(values) {
			dataSource.auth.login(values).then(() => router.push(Routes.DASHBOARD));
		}
	});

	return (
		<div data-testid="LOGIN_PAGE_CONTAINER">
			<CustomMeta title="Login" path="login" />
			<article>
				<header>
					<Image
						alt="Downwrite Logo"
						src="/static/landing.png"
						width={128}
						height={128}
					/>

					<h1 data-testid="Login Page Container">Login</h1>
				</header>

				<div className="tabs">
					<header className="form-header">
						<h2 data-testid="LOGIN_TITLE">Welcome Back!</h2>
						<p>
							Don&apos;t have an account?{" "}
							<Link href={Routes.REGISTER} passHref>
								<a>Register</a>
							</Link>
						</p>
					</header>
					<form onSubmit={formik.handleSubmit}>
						<div>
							<UIInput
								testID="LOGIN_USERNAME"
								placeholder="user@email.com"
								label="Username or Email"
								autoComplete="username"
								{...formik.getFieldProps("user")}
							/>
							{formik.errors.user && (
								<UIInputError>{formik.errors.user}</UIInputError>
							)}
						</div>
						<div>
							<UIInput
								testID="LOGIN_PASSWORD"
								placeholder="*********"
								label="Password"
								type="password"
								autoComplete="current-password"
								{...formik.getFieldProps("password")}
							/>
							{formik.errors.password && (
								<UIInputError>{formik.errors.password}</UIInputError>
							)}
						</div>
						<div className="form-footer">
							<button
								className="base-button"
								type="submit"
								id="RELOGIN_BUTTON"
								data-testid="RELOGIN_BUTTON">
								Login
							</button>
						</div>
					</form>
				</div>
			</article>
			<SiteFooter />
			<style jsx>{`
				article {
					max-width: 32rem;
					margin: 2rem auto;
				}

				header {
					text-align: center;
				}

				header p {
					font-family: var(--monospace);
					font-size: 0.875rem;
				}

				h1 {
					font-size: 2rem;
					font-weight: 900;
					margin: 1rem auto 4rem;
					font-family: var(--serif);
				}

				h2 {
					font-size: 1.25rem;
					line-height: 1.1;
					font-weight: 700;
					margin-bottom: 1rem;
				}

				.form-header {
					padding: 2rem 0.5rem;
				}

				form {
					padding: 0 0.5rem 1rem;
				}

				.form-footer {
					display: flex;
					justify-content: flex-end;
				}

				.tabs {
					background: var(--surface);
					box-shadow: 0 2px 6px 0 hsla(0, 0%, 0%, 0.2);
				}
			`}</style>
		</div>
	);
};

export default LoginPage;
