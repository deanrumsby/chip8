import { useState, useEffect, useRef, useMemo } from "react";

import { useChip8Context } from "../../context/Chip8Context";

function AppBar() {
  const { load } = useChip8Context();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openFileName, setOpenFileName] = useState<string | null>(null);

  const menu = useMemo(
    () => [
      {
        id: 0,
        name: "File",
        items: [
          {
            name: "Open",
            action: () => {
              inputRef.current?.click();
            },
          },
        ],
      },
    ],
    [],
  );

  const handleClickMenu = (event: React.MouseEvent, id: number) => {
    event.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    setOpenMenuId(id);
  };

  const handleCloseMenu = () => {
    setOpenMenuId(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const typedArray = new Uint8Array(fileReader.result as ArrayBufferLike);
      load(typedArray);
    };
    if (!input.files) {
      return;
    }
    fileReader.readAsArrayBuffer(input.files[0]);
    setOpenFileName(input.files[0].name);
  };

  useEffect(() => {
    if (openMenuId === null) {
      return;
    }
    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, [openMenuId]);

  return (
    <div className="flex justify-between items-center bg-gray-800 text-white pl-2">
      {menu.map((item) => (
        <div className="relative" key={item.name}>
          <button
            className="hover:bg-gray-700 px-2 py-1"
            onClick={(event) => handleClickMenu(event, item.id)}
          >
            {item.name}
          </button>
          {openMenuId === item.id && (
            <div
              className="absolute bg-gray-800 text-white"
              style={{ top: "100%", left: 0 }}
            >
              {item.items.map((subItem) => (
                <button
                  className="hover:bg-gray-700 px-2 py-1 w-full text-left"
                  key={subItem.name}
                  onClick={subItem.action}
                >
                  {subItem.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      <span className="text-sm pr-2">{openFileName ? openFileName : ""}</span>
      <input
        className="hidden"
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default AppBar;
