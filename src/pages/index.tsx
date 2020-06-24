import { useEffect } from "react";
import { useAuthContext } from "../components/auth";
import { useRouter } from "next/router";
// import { GetServerSideProps } from "next";
// import { initializeApollo } from "../lib/apollo";

export default function IndexPage() {
  const [{ authed }] = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    router.replace(authed ? "/dashboard" : "/login");
  }, [router, authed]);

  return null;
}
