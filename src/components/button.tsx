import css from "styled-jsx/css";

export const buttons = css.global`
  .base-button {
    background: linear-gradient(
      to bottom right,
      var(--pixieblue-400),
      var(--pixieblue-700)
    );
    font-size: inherit;
    border-radius: 0.5rem;
    color: white;
    cursor: pointer;
    padding: 0.5rem 1.5rem;
    font-weight: 400;
    border: 0;
    font-family: inherit;
    opacity: 1;
    transition: opacity 0.2s ease;
  }

  .base-button:hover {
    opacity: 0.75;
  }

  .alt-button {
    background: none;
    border: 0;
    appearance: none;
    font-size: inherit;
    font-family: inherit;
    color: inherit;
    cursor: pointer;
  }

  .cancel-button {
  }

  @media (prefers-color-scheme: dark) {
    .base-button {
    }
  }
`;
