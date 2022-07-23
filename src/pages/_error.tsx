import Head from "next/head";
import { NotFound } from "@components/not-found";

interface IErrorViewProps {
  statusCode: number;
}

export default function ErrorPage(props: IErrorViewProps) {
  const message = props.statusCode
    ? "An error " + props.statusCode + " occurred on server"
    : "An error occurred on client";

  return (
    <section>
      <Head>
        <title>Not Found | Downwrite</title>
      </Head>
      <NotFound message={message} />

      <h2 className="SuperErrorMessage">Error</h2>
      <p>{message}</p>
      <style jsx>{`
        section {
          padding: 8rem 1rem;
          text-align: center;
        }
      `}</style>
    </section>
  );
}
