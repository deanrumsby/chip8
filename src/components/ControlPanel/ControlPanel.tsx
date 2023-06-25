import { useContext } from "react";
import {
  VscDebugStart,
  VscDebugPause,
  VscDebugStepOver,
  VscDebugRestart,
} from "react-icons/vsc";

import { Chip8Context, type Chip8 } from "../Chip8";

function ControlPanel() {
  const { play, pause, reset, step } = useContext(Chip8Context) as Chip8;

  const iconStyle = "text-4xl mx-3 cursor-pointer";

  return (
    <div className="flex justify-center border border-black p-2">
      <VscDebugStart className={iconStyle} onClick={play} />
      <VscDebugPause className={iconStyle} onClick={pause} />
      <VscDebugStepOver className={iconStyle} onClick={step} />
      <VscDebugRestart className={iconStyle} onClick={reset} />
    </div>
  );
}

export default ControlPanel;
