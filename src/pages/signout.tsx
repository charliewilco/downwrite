import { useEffect } from "react";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { removeTokenCookie } from "@server/cookie-managment";
import { Routes } from "@shared/routes";
import { useDataSource } from "@hooks/useDataSource";

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
	removeTokenCookie(context.res);
	return {
		props: {}
	};
};

const SignOut: NextPage = () => {
	const router = useRouter();
	const dataSource = useDataSource();

	useEffect(() => {
		dataSource.auth.onLogout();
		router.push(Routes.LOGIN);
	}, [dataSource, router]);

	return <h1>Signing out...</h1>;
};

export default SignOut;
