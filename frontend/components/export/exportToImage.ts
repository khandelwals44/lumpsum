import html2canvas from "html2canvas";

export async function exportToImage(
  element: HTMLElement,
  title: string
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      background: '#ffffff'
    });

    const link = document.createElement('a');
    link.download = `${title}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  } catch (error) {
    console.error('Failed to export image:', error);
    throw error;
  }
}
