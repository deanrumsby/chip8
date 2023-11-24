import { useState, useEffect, createContext, useContext } from "react";
import {
  Chip8 as Chip8Core,
  Key,
  KeyState,
  Registers,
} from "@deanrumsby/chip8_core";

interface Chip8 {
  frame: Uint8ClampedArray;
  registers: Registers;
  play: () => void;
  pause: () => void;
  load: (program: Uint8Array) => void;
  step: () => void;
  reset: () => void;
}

type Chip8State = "initial" | "running" | "paused" | "reset";

const Chip8Context = createContext<Chip8 | null>(null);

const createSeed = () => Math.floor(Math.random() * (1 << 32));
const convertTimestamp = (timestamp: number) => timestamp * 1000;

const chip8 = new Chip8Core(createSeed());

const keys: {
  [key: string]: Key;
} = {
  1: Key.Key1,
  2: Key.Key2,
  3: Key.Key3,
  4: Key.KeyC,
  q: Key.Key4,
  w: Key.Key5,
  e: Key.Key6,
  r: Key.KeyD,
  a: Key.Key7,
  s: Key.Key8,
  d: Key.Key9,
  f: Key.KeyE,
  z: Key.KeyA,
  x: Key.Key0,
  c: Key.KeyB,
  v: Key.KeyF,
};

function useChip8() {
  const [status, setStatus] = useState<Chip8State>("initial");
  const [frame, setFrame] = useState(chip8.frame());
  const [registers, setRegisters] = useState(chip8.registers());
  const [currentProgram, setCurrentProgram] = useState<Uint8Array | null>(null);

  const updateState = () => {
    setFrame(chip8.frame());
    setRegisters(chip8.registers());
  };

  const load = (program: Uint8Array) => {
    chip8.load(program);
    setCurrentProgram(program);
  };

  const play = () => {
    setStatus("running");
  };

  const pause = () => {
    setStatus("paused");
  };

  const step = () => {
    chip8.step();
    updateState();
  };

  const reset = () => {
    setStatus("reset");
  };

  if (status === "reset") {
    chip8.reset();
    if (currentProgram) {
      chip8.load(currentProgram);
    }
  }

  useEffect(() => {
    let loopId: number;
    let previousTimestamp: DOMHighResTimeStamp;
    const loop = (timestamp: DOMHighResTimeStamp) => {
      if (!previousTimestamp) {
        previousTimestamp = timestamp;
      }
      const elapsed = timestamp - previousTimestamp;
      // console.log(elapsed);
      const elapsedMicroSeconds = convertTimestamp(elapsed);
      chip8.update(elapsedMicroSeconds);
      updateState();
      previousTimestamp = timestamp;
      loopId = window.requestAnimationFrame(loop);
    };
    if (status === "running") {
      loopId = window.requestAnimationFrame(loop);
    }
    return () => window.cancelAnimationFrame(loopId);
  }, [status]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = keys[event.key];
      if (key) {
        chip8.handle_key_event(key, KeyState.Pressed);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = keys[event.key];
      if (key) {
        chip8.handle_key_event(key, KeyState.Released);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return {
    frame,
    registers,
    play,
    pause,
    load,
    step,
    reset,
  };
}

function Chip8Provider({ children }: { children: React.ReactNode }) {
  const chip8 = useChip8();

  return (
    <Chip8Context.Provider value={chip8}>{children}</Chip8Context.Provider>
  );
}

function useChip8Context() {
  const context = useContext(Chip8Context);
  if (context === null) {
    throw new Error("useChip8Context must be used within a Chip8Provider");
  }
  return context;
}

export default Chip8Provider;
export { useChip8Context };
