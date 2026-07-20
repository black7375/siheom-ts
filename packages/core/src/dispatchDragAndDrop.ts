export function dispatchDragAndDrop(source: HTMLElement, target: HTMLElement) {
  const dataTransfer = new DataTransfer();
  const init = { bubbles: true, cancelable: true, dataTransfer };

  source.dispatchEvent(new DragEvent("dragstart", init));
  target.dispatchEvent(new DragEvent("dragenter", init));
  target.dispatchEvent(new DragEvent("dragover", init));
  target.dispatchEvent(new DragEvent("drop", init));
  source.dispatchEvent(new DragEvent("dragend", init));
}
