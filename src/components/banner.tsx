interface IBannerProps {
  variant?: "warning" | "error";
  label: string;
}

export const Banner: React.FC<IBannerProps> = (props) => {
  return (
    <div role="banner">
      <p>
        <b>{props.label}:</b> {props.children}
      </p>
      <style jsx>{`
        [role="banner"] {
          max-width: 33rem;
          margin: 1rem auto;
          padding: 0.5rem;
          color: var(--pixieblue-400);
          font-size: 0.875rem;
          border: 1px solid;
          border-radius: 0.25rem;
          width: auto;
        }

        .inner {
        }

        p {
          margin: 0;
          font-size: 100%;
        }
      `}</style>
    </div>
  );
};
