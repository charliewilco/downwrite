interface IBannerProps {
  icon: JSX.Element;
}

export const Banner: React.FC<IBannerProps> = (props) => {
  return (
    <div className="bg-pixieblue-300 dark:bg-pixieblue-600 " role="banner">
      <div className="inner">
        <span className="bg-pixieblue-400 dark:bg-pixieblue-800">{props.icon}</span>
        <p>{props.children}</p>
      </div>
      <style jsx>{`
        [role="banner"] {
          width: 100%;
          max-width: 24rem;
          margin: 1rem auto;
          padding: 0.25rem;
          background: var(--pixieblue-600);
        }

        .inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        p {
          margin: 0 0 0 1rem;
        }
      `}</style>
    </div>
  );
};
