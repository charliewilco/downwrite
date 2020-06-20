import * as React from "react";
import { AuthContext } from "../components/auth";
import { useRouter } from "next/router";

export default function IndexPage() {
  const [{ authed }] = React.useContext(AuthContext);
  const router = useRouter();

  React.useEffect(() => {
    if (authed) {
      router.replace("/", "/dashboard");
    }
  }, [router]);

  return null;
}
