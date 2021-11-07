export function Loading(): JSX.Element {
  return (
    <div role="img">
      <div className="ring" />
      <div className="ring" />
      <div className="ring" />

      <style jsx>{`
        [role="img"] {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 5rem;
          height: 5rem;
          margin: auto;
        }

        [role="img"]:nth-child(1) {
          --size: 2rem;
        }

        [role="img"]:nth-child(2) {
          --size: 3rem;
        }

        [role="img"]:nth-child(3) {
          --size: 4rem;
        }

        .ring {
          position: absolute;
          left: 0;
          right: 0;
          border: 2px solid;
          border-radius: 100%;
          margin: auto;
          width: var(--size);
          height: var(--size);
        }
      `}</style>
    </div>
  );
}
