"use client";

import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";

export default function Custom404() {
  // const router = useRouter();
  return (
    <>
      <h1>Couldn&apos;t find anything here ...</h1>
      <p>404 - Page Not Found</p>
      {/*<Button onClick={() => router.push("/")}>back</Button>*/}
    </>
  );
}
