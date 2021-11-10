export const Loading: React.VFC = () => {
  return (
    <div role="img">
      <div className="ring" />
      <div className="ring" />
      <div className="ring" />

      <style jsx>{`
        @keyframes ripple-effect {
          0% {
            transform: scale(0.1);
            opacity: 1;
          }

          70% {
            transform: scale(1);
            opacity: 0.7;
          }

          100% {
            opacity: 0;
          }
        }

        [role="img"] {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 5rem;
          height: 5rem;
          margin: auto;
          transform: translateY(calc(75px / 2));
        }

        [role="img"]:nth-child(1) {
          --size: 2rem;
          --delay: -0.6s;
        }

        [role="img"]:nth-child(2) {
          --size: 3rem;
          --delay: -0.4s;
        }

        [role="img"]:nth-child(3) {
          --size: 4rem;
          --delay: -0.2s;
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
          animation-delay: var(--delay);
          animation-fill-mode: both;
          animation: ripple-effect 1.25s 0s infinite
            cubic-bezier(0.21, 0.53, 0.56, 0.8);
        }
      `}</style>
    </div>
  );
};
