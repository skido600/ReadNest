import Image from "next/image";

function MainLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-md">
      <div className="animate-pulse">
        <Image
          src="/logo/white_logo.png"
          alt="Loading"
          width={120}
          height={120}
          className="animate-[pulse_1.5s_ease-in-out_infinite]"
        />
      </div>
    </div>
  );
}

export default MainLoader;
