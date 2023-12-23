import { useState } from "react";

interface RegisterProps {
  label: string;
  value: string;
  size: 2 | 4;
  disabled?: boolean;
  onChange: (label: string, value: string) => void;
}

function Register({ label, value, size, disabled, onChange }: RegisterProps) {
  const [, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState<string | null>(null);

  const isHex = (value: string) => /^[0-9a-fA-F]*$/.test(value);

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleStopEditing = () => {
    setIsEditing(false);
    setNewValue(null);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (isHex(value)) {
      setNewValue(value);
      onChange(label.toLowerCase(), value);
    }
  };

  return (
    <div className="flex items-center gap-5">
      <span className="text-xs w-5 text-right">{label}</span>
      <input
        size={size}
        disabled={disabled}
        maxLength={size}
        className="text-sm"
        value={newValue !== null ? newValue : value}
        onChange={handleOnChange}
        onFocus={handleStartEditing}
        onBlur={handleStopEditing}
      />
    </div>
  );
}

export default Register;
