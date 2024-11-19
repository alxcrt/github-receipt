import Image from "next/image";
import React from "react";

import printer from "../../../public/printer/printer.png";
import greenLed from "../../../public/printer/green-led.png";
import redLed from "../../../public/printer/red-led.png";
import topPrinter from "../../../public/printer/top-printer.png";
import Receipt from "../components/Receipt";

// key frame for moving the receipt

interface GithubReceiptProps {
  params: Promise<{ user: string }>;
}

export default async function GithubReceipt({ params }: GithubReceiptProps) {
  const user = (await params).user;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen overflow-x-hidden">
      <div className="relative w-[800px] h-[800px] scale-[0.5] md:scale-[0.6] lg:scale-[0.7] xl:scale-[0.8] 2xl:scale-[1] origin-top">
        <Image
          // width={800}
          // height={800}
          src={printer}
          alt=""
          className="absolute top-0 left-0"
        />

        <Image
          // width={800}
          // height={800}
          src={greenLed}
          alt=""
          className="absolute top-0 right-0 animate-receipt-led"
        />

        {/* Receipt */}
        {/* <Image
          // width={800}
          // height={800}
          src={receipt}
          alt=""
          className="absolute top-0 right-0 animate-receipt-printing z-5 drop-shadow-xl"
        /> */}
        <Receipt user={user} />

        <Image
          // width={800}
          // height={800}
          src={topPrinter}
          alt=""
          className="absolute top-[-0.1rem] right-[-0.7rem] scale-[0.97] z-10"
        />

        <Image
          // width={800}
          // height={800}
          src={redLed}
          alt=""
          className="absolute top-0 right-0 z-20 animate-receipt-led"
        />

        {/* EMpty space */}
        <div className="absolute top-[-25%] right-[50%] translate-x-[50%] w-96 h-96 bg-[#edebe3] z-[9]"></div>
      </div>
    </div>
  );
}
