import QRCode from 'react-qr-code';
import Modal from '../common/Modal';
import Button from '../common/Button';

const QRCodeModal = ({ open, onClose, value }) => {
  const downloadQr = () => {
    const svg = document.getElementById('qs-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width || 256;
      canvas.height = img.height || 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = 'quickshare-qr.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  };

  return (
    <Modal open={open} onClose={onClose} title="Scan to open share">
      <div className="flex flex-col items-center gap-4">
        <div className="neu-flat rounded-2xl bg-white p-4">
          <QRCode id="qs-qr-code" value={value || ''} size={180} />
        </div>
        <Button onClick={downloadQr} className="w-full">Download QR</Button>
      </div>
    </Modal>
  );
};

export default QRCodeModal;
