import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Home",
  description: "North application",
};

const HomePage = () => {
  redirect("/login");
};

export default HomePage;
