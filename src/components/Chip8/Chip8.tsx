import { useState, useEffect, createContext } from "react";
import { Chip8 as Chip8Core, Key, KeyState } from "@deanrumsby/chip8_core";

interface Chip8 {
  chip8: Chip8Core;
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
  const [state, setState] = useState<Chip8State>("initial");
  const [currentProgram, setCurrentProgram] = useState<Uint8Array | null>(null);
  const [, setUpdate] = useState(false);

  const forceRender = () => {
    setUpdate((x) => !x);
  };

  const load = (program: Uint8Array) => {
    chip8.load(program);
    setCurrentProgram(program);
  };

  const play = () => {
    setState("running");
  };

  const pause = () => {
    setState("paused");
  };

  const step = () => {
    chip8.step();
    forceRender();
  };

  const reset = () => {
    setState("reset");
  };

  if (state === "reset") {
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
      previousTimestamp = timestamp;
      forceRender();
      loopId = window.requestAnimationFrame(loop);
    };
    if (state === "running") {
      loopId = window.requestAnimationFrame(loop);
    }
    return () => window.cancelAnimationFrame(loopId);
  }, [state]);

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
    chip8,
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

export default Chip8Provider;
export { Chip8Context, type Chip8 };
