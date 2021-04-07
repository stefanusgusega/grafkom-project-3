export function render(master) {
    master.gl.clear(master.gl.COLOR_BUFFER_BIT || master.gl.DEPTH_BUFFER_BIT);
    master.renderer['giraffe'].render();
}