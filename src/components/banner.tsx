interface IBannerProps {
  variant?: "warning" | "error";
  label: string;
}

export const Banner: React.FC<IBannerProps> = ({ children, label }) => {
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
