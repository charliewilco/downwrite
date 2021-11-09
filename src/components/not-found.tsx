import Image from "next/image";

interface IPostErrorProps {
  message: string;
  error?: string;
}

export function NotFound({ error, message }: IPostErrorProps): JSX.Element {
  return (
    <div>
      <Image
        width={127}
        height={151}
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
