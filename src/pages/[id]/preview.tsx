import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

import { getPreviewEntry } from "@server/preview";
import { toSafeHTML } from "@server/parser";
import { ContentWrapper } from "@components/content";
import { AuthorBlock } from "@components/user-blocks";
import { CustomMeta } from "@components/custom-meta";
import { Routes } from "@shared/routes";
import { AvatarColors } from "@shared/gradients";

import { IPreview } from "../../__generated__/server";
import { useSubjectSubscription, useDataSource } from "@hooks/index";

interface IPreviewProps {
  id: string;
  preview: IPreview;
  result: string;
}

type PreviewPageHandler = GetServerSideProps<IPreviewProps, { id: string }>;

export const getServerSideProps: PreviewPageHandler = async ({ params }) => {
  const id = params!.id;

  try {
    const preview = await getPreviewEntry(id);
    const _ = await toSafeHTML(preview.content);

    return {
      props: {
        id,
        preview,
        result: _
      }
    };
  } catch (error) {
    console.log(error);
    return {
      notFound: true
    };
  }
};

const PreviewEntry: NextPage<IPreviewProps> = (props) => {
  const dataSource = useDataSource();
  const me = useSubjectSubscription(dataSource.auth.state);

  const router = useRouter();

  return (
    <div className="outer">
      <ContentWrapper
        title={props.preview?.title!}
        content={<section dangerouslySetInnerHTML={{ __html: props.result }} />}
        dateAdded={props.preview?.dateAdded!}>
        <CustomMeta
          title={props.preview?.title}
          path={props.id.concat("/preview")}
        />
        <Head>
          <meta
            name="og:description"
            content={props.preview?.content!.substring(0, 75)}
          />
          <meta name="og:url" content={router.pathname} />
          <meta
            name="description"
            content={props.preview?.content!.substring(0, 75)}
          />
        </Head>
        <AuthorBlock name={props.preview?.author?.username!} colors={AvatarColors} />
        {!me.authed && (
          <div>
            <p>
              <span>
                You can write and share on Downwrite, you can sign up or log in{" "}
              </span>
              <Link href={Routes.LOGIN} passHref>
                <a>here</a>
              </Link>
            </p>
          </div>
        )}
      </ContentWrapper>
      <style jsx>{`
        div {
          margin: 1rem 0;
        }
        p {
          font-size: 0.875rem;
          font-family: var(--monospace);
        }

        .outer {
          padding: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default PreviewEntry;
