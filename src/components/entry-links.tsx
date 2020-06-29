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

function CardLink({
  pathname,
  id,
  ...props
}: ICardLinks & IInitialCardLinkProps): JSX.Element {
  const href = `${pathname}/[id]`;
  const as = `${pathname}/${id}`;
  return (
    <Link href={href} as={as} passHref>
      <a className={props.className} style={props.style}>
        {props.title}
      </a>
    </Link>
  );
}

export function EditLink(props: ICardLinks): JSX.Element {
  return <CardLink title="Edit" {...props} pathname="/edit" />;
}

export function PreviewLink(props: ICardLinks): JSX.Element {
  return <CardLink title="Preview" {...props} pathname="/preview" />;
}
