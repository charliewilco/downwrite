import * as React from "react";
import Link from "next/link";
import Nib from "./nib";

const Empty: React.FC<{}> = function() {
  return (
    <section className="Wrapper" data-testid="NO_ENTRIES_PROMPT">
      <div className="FlexColumn">
        <div className="EmptyBlockRight">
          <Nib />
        </div>
        <div className="EmptyBlockLeft">
          <h4>Looks like you don't have any entries</h4>
          <Link href="/new">
            <a className="GetStarted">Get Started &rarr;</a>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .Wrapper {
          margin-left: auto;
          margin-right: auto;
          max-width: 1088px;
        }

        .GettingStarted {
          color: #757575;
          cursor: pointer;
        }

        .FlexColumn {
          padding-top: 64px;

          display: flex;
          align-items: center;
          flex-direction: column;
        }

        .EmptyBlockRight {
          width: 100%;
          max-width: 384px;
          margin-bottom: 32px;
          flex: 1;
        }

        .EmptyBlockLeft {
          text-align: center;
          flex: 1;
        }

        h4 {
          font-size: 20px;
          margin-bottom: 16px;
        }
      `}</style>
    </section>
  );
};

export default Empty;
