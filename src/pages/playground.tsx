import dynamic from "next/dynamic";

const Editor = dynamic(() => import("../components/new-editor"), {
  ssr: false,
  loading: () => <p>...</p>
});

export default function Playground() {
  return <Editor />;
}
