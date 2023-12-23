import { useChip8Context } from "../../context/Chip8Context";
import Register from "./Register";

function Registers() {
  const { status, registers, setRegisters } = useChip8Context();

  const { pc, i, sp, dt, st, v } = registers;

  const handleOnChange = (label: string, value: string) => {
    if (label[0] === "v") {
      const index = parseInt(label[1], 16);
      const newValues = [...v];
      newValues[index] = parseInt(value, 16);
      setRegisters({ ...registers, v: newValues });
      return;
    }
    const newValues = {
      ...registers,
      [label]: parseInt(value, 16),
    };
    setRegisters(newValues);
  };

  const isDisabled = status !== "paused";

  return (
    <div className="flex gap-10 h-40">
      <div className="flex flex-col gap-2">
        {[pc, i].map((register, index) => (
          <Register
            key={index}
            label={["PC", "I"][index]}
            size={4}
            disabled={isDisabled}
            value={register.toString(16).padStart(4, "0")}
            onChange={handleOnChange}
          />
        ))}
        {[sp, dt, st].map((register, index) => (
          <Register
            key={index}
            label={["SP", "DT", "ST"][index]}
            size={2}
            disabled={isDisabled}
            value={register.toString(16).padStart(2, "0")}
            onChange={handleOnChange}
          />
        ))}
      </div>
      <div className="flex flex-col gap-2 flex-wrap">
        {(v as number[]).map((register, index) => (
          <Register
            key={index}
            label={`V${index.toString(16).toUpperCase()}`}
            size={2}
            disabled={isDisabled}
            value={register.toString(16).padStart(2, "0")}
            onChange={handleOnChange}
          />
        ))}
      </div>
    </div>
  );
}

export default Registers;
