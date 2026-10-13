import '@testing-library/jest-dom';

// jsdom no implementa HTMLDialogElement.showModal() ni close().
// Stub mínimo: abrir pone el atributo `open` y cerrar lo quita y emite `close`.
// No simula la capa superior, el fondo inerte ni la tecla Escape: en las
// pruebas, Escape se representa disparando el evento `cancel` sobre el <dialog>.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.show = function show() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
