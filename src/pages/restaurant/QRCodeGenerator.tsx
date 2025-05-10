import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';
import { Download, ExternalLink, Printer, Copy, Check } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const QRCodeGenerator = () => {
  const { user } = useAuthStore();
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  const [downloadQrSize, setDownloadQrSize] = useState(512);
  const [printQrSize, setPrintQrSize] = useState(256);
  const [includeRestaurantName, setIncludeRestaurantName] = useState(false);
  const [includeScanPrompt, setIncludeScanPrompt] = useState(false);
  const [qrColor, setQrColor] = useState('#e0273a'); // primary color

  const menuUrl = `${window.location.origin}/place/${user?.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = downloadQrSize + 80; // Add padding
    canvas.height = downloadQrSize + (includeRestaurantName || includeScanPrompt ? 140 : 80);

    // Fill background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw QR code
    const qrCanvas = qrRef.current.querySelector('canvas');
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, 40, 40, downloadQrSize, downloadQrSize);
    } else {
      // If canvas not available, draw from SVG
      const svgElement = qrRef.current.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 40, 40, downloadQrSize, downloadQrSize);

          // Add text after image is drawn
          addTextToCanvas();

          // Create download link
          const link = document.createElement('a');
          link.download = `${user.name}-menu-qrcode.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        return;
      }
    }

    addTextToCanvas();

    // Create download link
    const link = document.createElement('a');
    link.download = 'menu-qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    function addTextToCanvas() {
      if (!ctx) return;

      let yPosition = qrSize + 340;

      if (includeRestaurantName && user) {
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText(user.name || 'Restaurant Name', canvas.width / 2, yPosition);
        yPosition += 30;
      }

      if (includeScanPrompt) {
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';
        ctx.fillText('Scan to view our menu', canvas.width / 2, yPosition);
      }
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const restaurantName = user?.name || 'Restaurant Menu';

    const qrSnapshot = qrRef.current?.innerHTML || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${restaurantName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 40px;
            }
            .qr-container {
              margin: 0 auto;
              max-width: 700px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
            }
            p {
              font-size: 16px;
              color: #666;
              margin-top: 20px;
            }
            .qrRow{
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              grid-template-rows: repeat(2, 1fr);
              grid-column-gap: 0px;
              grid-row-gap: 0px;
            }
            .qrCell1{
              grid-area: 1 / 1 / 2 / 2;
            }
            .qrCell2{
              grid-area: 1 / 2 / 2 / 3;
            }
            .qrCell3{
              grid-area: 2 / 1 / 3 / 3;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${includeRestaurantName ? `<h1>${restaurantName}</h1>` : ''}
            <div class="qrRow">
              <div class="qrCell1">
                <h1>Size 120px</h1>
                ${qrSnapshot.replace('height="256"', 'height="120"').replace('width="256"', 'width="120"')}
              </div>

              <div class="qrCell2">
                <h1>Size 256px</h1>
                ${qrSnapshot.replace('height="256"', 'height="256"').replace('width="256"', 'width="256"')}
              </div>

              <div class="qrCell3">
                <h1>Size 406</h1>
                ${qrSnapshot.replace('height="256"', 'height="406"').replace('width="256"', 'width="406"')}
              </div>
            </div>
           

            ${includeScanPrompt ? '<p>Scan to view our menu</p>' : ''}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">QR Code Generator</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className=''>
          <div className="flex items-center justify-between">

            <div className="border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">How to Use</h3>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal pl-4">
                <li>Download or print the QR code</li>
                <li>Place it on your tables, menu boards, or entrance</li>
                <li>Customers can scan with their smartphone camera</li>
                <li>They'll be directed to your digital menu!</li>
              </ol>
              <br />
              <h3 className="text-sm font-medium text-gray-700 mb-3">Test Your QR Code</h3>
              <p className="text-sm text-gray-600 mb-3">
                Scan the QR code with your smartphone camera to ensure it works correctly.
              </p>

              <div className="flex gap-5">
                <Button
                  variant="primary"
                  icon={Download}
                  onClick={downloadQRCode}
                  fullWidth
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  icon={Printer}
                  onClick={printQRCode}
                  fullWidth
                >
                  Print
                </Button>
              </div>
            </div>
            <div
              className="bg-white rounded-lg"
            >
              <QRCodeSVG
                value={menuUrl}
                size={qrSize}
                fgColor={qrColor}
                level="H"
                includeMargin={false}
              />
            </div>
            <div
              ref={qrRef}
              className="hidden bg-white rounded-lg"
            >
              <QRCodeSVG
                value={menuUrl}
                size={printQrSize}
                fgColor={qrColor}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
        </Card>

        <Card title="Your Place Link">
          <div className="relative w-full pr-12 px-4 py-2 bg-gray-200 border rounded-md">
            {menuUrl}

            <button
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
            >
              {copied ? <Check className="h-5 w-5 text-success" /> : <Copy className="h-5 w-5" />}
            </button>

            <Link to={`/place/${user?.id}`} target="_blank" className="absolute flex align-center right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary">
              <button>
                <ExternalLink className="h-5 w-5" />
              </button>
            </Link>
          </div>

        </Card>

        {/* <Card title="Download your QR code">
          <div className="space-y-6 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Size
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="32"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{qrSize}px</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="h-10 w-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={() => setQrColor('#7D2027')}
                  className="text-sm text-primary hover:underline"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="include-restaurant-name"
                  type="checkbox"
                  checked={includeRestaurantName}
                  onChange={(e) => setIncludeRestaurantName(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="include-restaurant-name" className="ml-2 block text-sm text-gray-900">
                  Include restaurant name
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="include-scan-prompt"
                  type="checkbox"
                  checked={includeScanPrompt}
                  onChange={(e) => setIncludeScanPrompt(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="include-scan-prompt" className="ml-2 block text-sm text-gray-900">
                  Include "Scan to view menu" text
                </label>
              </div>
            </div>
          </div>
        </Card>  */}
      </div>
    </div>
  );
};

export default QRCodeGenerator;