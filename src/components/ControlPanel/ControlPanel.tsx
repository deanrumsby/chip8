import { useContext } from "react";
import {
  VscDebugStart,
  VscDebugPause,
  VscDebugStepOver,
} from "react-icons/vsc";

import { Chip8Context, type Chip8 } from "../Chip8";

function ControlPanel() {
  const { setIsRunning, step } = useContext(Chip8Context) as Chip8;

  const iconStyle = "text-4xl mx-3 cursor-pointer";

  return (
    <div className="flex justify-center">
      <VscDebugStart className={iconStyle} onClick={() => setIsRunning(true)} />
      <VscDebugPause
        className={iconStyle}
        onClick={() => setIsRunning(false)}
      />
      <VscDebugStepOver className={iconStyle} onClick={step} />
    </div>
  );
}

export default ControlPanel;
