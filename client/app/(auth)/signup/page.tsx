import Signup from "@/component/ClientComponents/Signup";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sign Up | ReadNest",
  description:
    "Create your ReadNest account to start streaming movies and shows instantly.",
};
export default function PageSignup() {
  return <Signup />;
}
