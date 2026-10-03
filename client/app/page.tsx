import FQA from "@/component/ClientComponents/FQA";
import Herosectionbg from "@/component/ClientComponents/Herosectionbg";
import Trending from "@/component/ClientComponents/Trending";
import Reasons from "@/component/Reasons";
import ServerStatus from "@/component/ServerStatus";
export default function Home() {
  return (
    <>
      <Herosectionbg />
      <Trending />
      <FQA />
      <Reasons />
    </>
  );
}
