import { useContext } from "react";
import { FaPlay, FaPause } from "react-icons/fa";

import { Chip8Context, type Chip8 } from "../Chip8";

function ControlPanel() {
  const { setIsRunning } = useContext(Chip8Context) as Chip8;

  const iconStyle = "text-2xl mx-3 cursor-pointer";

  return (
    <div className="flex justify-center">
      <FaPlay className={iconStyle} onClick={() => setIsRunning(true)} />
      <FaPause className={iconStyle} onClick={() => setIsRunning(false)} />
    </div>
  );
}

export default ControlPanel;
