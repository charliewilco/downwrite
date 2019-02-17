import * as React from "react";

const searchLocalStorage = () => {
  return localStorage.forEach(
    (item: any, iterator: number) =>
      localStorage.key(iterator).includes("Draft") && item
  );
};

const ListDrafts: React.FC<{}> = function(props) {
  const [drafts] = React.useState<any[]>([]);

  React.useEffect(() => {
    let storage = searchLocalStorage();

    storage.forEach((item: any) => {
      drafts.includes(item);
    });
  }, []);

  return <span>I should be a list and i'm not</span>;
};

export default ListDrafts;
