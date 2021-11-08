import { FiAlertTriangle } from "react-icons/fi";

export const Banner: React.FC = (props) => {
  return (
    <div role="banner">
      <div className="inner">
        <span>
          <FiAlertTriangle size={20} />
        </span>
        <p>{props.children}</p>
      </div>
      <style jsx>{`
        [role="banner"] {
          width: 100%;
          max-width: 36rem;
          margin: 1rem auto;
          padding: 0.5rem;
          color: var(--pixieblue-600);
          font-family: var(--monospace);
          font-weight: 700;
          font-size: 0.875rem;
          border: 2px solid;
          border-radius: 0.25rem;
        }

        .inner {
          display: flex;
          align-items: center;
        }

        p {
          margin: 0 0 0 1rem;
          font-size: 100%;
        }
      `}</style>
    </div>
  );
};
