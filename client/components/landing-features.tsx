import * as React from "react";
import FeatureContent from "../markdown/features.md";

export default () => (
  <section>
    <FeatureContent />
    <style jsx>{`
      section {
        max-width: 33rem;
        margin: 1rem auto 0;
        font-size: 14px;
        text-align: left;
      }

      h2 {
        font-size: 18px;
        margin-bottom: 4px;
      }

      p:not(:last-of-type) {
        margin-bottom: 16px;
      }
    `}</style>
  </section>
);
