interface IPostErrorProps {
  message: string;
  error?: string;
}

export default function PostError({ error, message }: IPostErrorProps): JSX.Element {
  return (
    <div className="py-2 max-w-md mx-auto text-center">
      <img
        className="inline-block mb-4 w-1/4"
        alt="Document with an Negative mark"
        src="/static/entry-not-found.png"
      />
      <h4 className="text-lg italic">
        {error && error.concat(".")} <br />
        Ummm... something went horribly wrong.
      </h4>
      <p>{message}</p>
    </div>
  );
}
