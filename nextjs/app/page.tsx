import Image from 'next/image'
import React from "react";
import Navbar from "../components/Navbar";
import Planets from "../components/Planets";
import Events from "../components/Events";
import Stats from "../components/Stats";
import Messages from "../components/Messages";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Planets />
      <Events />
      <Stats />
      <Messages />
    </div>
  );
};
