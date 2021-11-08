import Head from "next/head";
import { NotFound } from "@components/not-found";

interface IErrorViewProps {
  statusCode: number;
}

interface ICustomError extends Error {
  statusCode: number;
}

function StatusCode(props: Partial<ICustomError>) {
  const message = props.statusCode
    ? "An error " + props.statusCode + " occurred on server"
    : "An error occurred on client";
  return <p>{message}</p>;
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
      <h2 className="SuperErrorMessage">404</h2>
      <StatusCode statusCode={props.statusCode} />
      <NotFound message={message} />
      <style jsx>{`
        section {
          padding: 8rem 1rem;
          text-align: center;
        }
      `}</style>
    </section>
  );
}
