import {
  VscDebugStart,
  VscDebugPause,
  VscDebugStepOver,
  VscDebugRestart,
} from "react-icons/vsc";

import { useChip8Context } from "../../context/Chip8Context";

function ControlPanel() {
  const { play, pause, reset, step } = useChip8Context();

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
