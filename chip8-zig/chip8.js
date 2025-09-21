const wasmPath = new URL('./root.wasm', import.meta.url);

export async function init(screen) {
    const response = await fetch(wasmPath);
    const bytes = await response.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(bytes);

    const {
        memory,
        program_ptr,
        pc,
        i,
        sp,
        dt,
        st,
        v,
        v_len,
        step,
        frame_buffer_ptr,
        frame_buffer_len,
    } = instance.exports;

    return {
        pc,
        i,
        sp,
        dt,
        st,
        v: () => {
            const registers = [];
            for (let i = 0; i < v_len(); i += 1) {
                registers.push(v(i));
            }
            return registers;
        },
        load: (bytes) => {
            const offset = program_ptr();
            const view = new Uint8Array(memory.buffer);
            view.set(bytes, offset);
        },
        step,
        frameBuffer: () => {
            const offset = frame_buffer_ptr();
            const length = frame_buffer_len();
            return new Uint8ClampedArray(memory.buffer, offset, length);
        }
    }
};
