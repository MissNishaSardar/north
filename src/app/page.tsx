import Login from "@/components/Form/Login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Starter Fullstack",
  description: "Production grade Fullstack Next.js starter template",
};

const page = () => {
  return (
    <section className="grid h-dvh place-items-center">
      <Login />
    </section>
  );
};

export default page;
