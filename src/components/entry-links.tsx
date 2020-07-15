import Link from "next/link";

interface ICardLinks {
  id: string;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}

interface IInitialCardLinkProps {
  pathname: string;
}

function DefaultLink({
  pathname,
  id,
  ...props
}: ICardLinks & IInitialCardLinkProps): JSX.Element {
  const href = `/[id]/${pathname}`;
  const as = `/${id}/${pathname}`;
  return (
    <Link href={href} as={as}>
      <a className={props.className} style={props.style}>
        {props.title}
      </a>
    </Link>
  );
}

export function EditLink(props: ICardLinks): JSX.Element {
  return <DefaultLink title="Edit" {...props} pathname="edit" />;
}

export function PreviewLink(props: ICardLinks): JSX.Element {
  return <DefaultLink title="Preview" {...props} pathname="preview" />;
}
