interface IBannerProps {
  variant?: "warning" | "error";
  label: string;
  children?: React.ReactNode;
}

export const Banner = ({ children, label }: IBannerProps) => {
  return (
    <div className="banner-container">
      <div role="banner">
        <p>
          <b>{label}:</b> {children}
        </p>
      </div>
      <style jsx>{`
        [role="banner"] {
          padding: 0.5rem;
          color: var(--pixieblue-400);
          font-size: 0.875rem;
          border: 1px solid;
          border-radius: 0.25rem;
          text-align: center;
          display: inline-block;
        }

        .banner-container {
          max-width: 33rem;
          width: 100%;
          margin: 1rem auto;
          display: flex;
          justify-content: center;
        }

        p {
          margin: 0;
          font-size: 100%;
        }
      `}</style>
    </div>
  );
};
