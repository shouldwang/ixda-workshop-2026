import QRCode from 'qrcode';

export async function renderQrCode(canvas: HTMLCanvasElement, text: string) {
  await QRCode.toCanvas(canvas, text, { width: 160, margin: 1 });
}
