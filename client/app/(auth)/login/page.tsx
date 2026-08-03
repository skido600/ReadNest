import Login from "@/component/ClientComponents/Login";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Login | ReadNest",
  description:
    "Access your ReadNest account to enjoy personalized streaming and manage your subscription.",
};
export default function PageLogin() {
  return <Login />;
}
