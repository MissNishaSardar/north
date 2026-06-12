import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your account",
};

const page = () => {
  return (
    <section className="grid min-h-dvh place-items-center">
      <div className="space-y-4 text-center">
        <h1 className="text-5xl font-semibold">Register</h1>
        <p className="text-3xl">Create your account</p>
      </div>
    </section>
  );
};

export default page;
