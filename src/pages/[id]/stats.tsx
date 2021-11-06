import { useEffect } from "react";
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { FiAlertTriangle } from "react-icons/fi";
import { getInitialStateFromCookie } from "@lib/cookie-managment";
import { server } from "@lib/server";

import { parser, StringifiedOutput } from "@utils/parser";

import { __IS_PROD__ } from "@utils/dev";
import { EditDocument } from "../../__generated__/client";

interface IStatsPageProps {
  id: string;
  title: string;
  output: StringifiedOutput[][];
}

export const getServerSideProps: GetServerSideProps<
  IStatsPageProps,
  { id: string }
> = async ({ req, res, params }) => {
  const id = params!.id;

  const initialAppState = await getInitialStateFromCookie(req);

  const response = await server.executeOperation(
    {
      query: EditDocument,
      variables: {
        id
      }
    },
    { req, res }
  );

  const { stringified } = parser(response.data.entry.content);

  return {
    props: {
      initialAppState,
      id,
      title: response.data.entry.title,
      output: stringified
    }
  };
};

const StatsEntry: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> =
  (props) => {
    const router = useRouter();

    useEffect(() => {
      if (__IS_PROD__) {
        router.push("/dashboard");
      }
    }, []);

    return (
      <>
        <Head>
          <title>{props.title} | Downwrite</title>
        </Head>
        <div className="max-w-4xl mt-16 mx-auto">
          <header className="mb-8 pt-6 pb-6 xl:pb-10 border-b border-onyx-200">
            <span className="block mb-4 uppercase">Stats from</span>
            <h1
              data-testid="STATS_ENTRTY_TITLE"
              className="text-3xl leading-9 font-serif font-bold tracking-tight sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
              {props.title}
            </h1>
          </header>

          <div className="rounded-md bg-goldar-900 p-4 mb-32">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-5 w-5 text-onyx-900" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-onyx-900">Warning</h3>
                <div className="mt-2 text-sm text-onyx-900">
                  <p>This feature is still a work in progress.</p>
                </div>
              </div>
            </div>
          </div>

          <pre>{JSON.stringify({ output: props.output }, null, 2)}</pre>
        </div>
      </>
    );
  };

export default StatsEntry;
