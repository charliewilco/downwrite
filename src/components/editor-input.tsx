export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <input type="text" {...props} />
      <style jsx>{`
        input {
          font-family: var(--monospace);
          width: 100%;
          border: 0;
          display: block;
          appearance: none;
          background: transparent;
          outline: none;
          padding: 0.5rem 0;
          font-size: 2.25rem;
          line-height: 2.5rem;
        }
      `}</style>
    </div>
  );
}
