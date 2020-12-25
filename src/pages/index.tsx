import {} from "react";
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import { useRouter } from "next/router";
import { NormalizedCacheObject } from "@apollo/client";
import { getInitialStateFromCookie } from "@lib/cookie-managment";
import Link from "next/link";
import Head from "next/head";

interface IIndexProps {
  token: string;
  initialApolloState: NormalizedCacheObject;
  redirect?: string;
}

type IndexProps = IIndexProps | {};

export const getServerSideProps: GetServerSideProps<IndexProps> = async (
  context
) => {
  try {
    const initialAppState = await getInitialStateFromCookie(context.req);
    if (initialAppState && initialAppState.me.id) {
      return {
        props: {
          initialAppState,
          initialApolloState: {}
        }
      };
    }
  } catch (error) {
    return { props: {} };
  }
};

const isProps = <K extends any>(props: any): props is K => {
  return !!props && props !== {};
};

const IndexPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (
  props
) => {
  const router = useRouter();

  // useEffect(() => {
  //   if (isProps<IIndexProps>(props)) {
  //     if (props.redirect) {
  //       router.replace(props.redirect);
  //     }
  //   }
  // }, [router, props]);

  return (
    <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
      <div className="text-center">
        <Head>
          <title>Downwrite</title>
        </Head>
        <h1 className="text-4xl tracking-tight font-bold sm:text-5xl md:text-6xl font-mono">
          <span className="block mb-4">Editing Shouldn't Be Hard</span>
          <span className="block text-pixieblue-500">Writing Should Be</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base font-mono text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem
          cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat aliqua.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8 font-sans">
          <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <Link href="/login" passHref>
              <a
                id="HOME_LOGIN_FAKE_BUTTON"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-md text-pixieblue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                Login or Sign up
              </a>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default IndexPage;
