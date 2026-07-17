import { useState, useRef, useEffect, useCallback } from 'react';
import { ScanLine, Camera, CameraOff, Search, Plus, Package, Calendar, AlertTriangle, CheckCircle2, Keyboard } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../lib/types';

interface BarcodeScannerProps {
  storeId: string;
  onAddToCart: (product: Product) => void;
  cartProductIds: string[];
}

type ScanMode = 'camera' | 'manual';

function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
}

export function BarcodeScanner({ storeId, onAddToCart, cartProductIds }: BarcodeScannerProps) {
  const [mode, setMode] = useState<ScanMode>('manual');
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const animFrameRef = useRef<number>(0);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function startCamera() {
    setCameraError('');
    if (!('BarcodeDetector' in window)) {
      setCameraError('Camera scanning is not supported in this browser. Please use manual entry.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      detectorRef.current = new (window as unknown as { BarcodeDetector: new (opts: object) => BarcodeDetector }).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
      });
      setScanning(true);
      scanFrame();
    } catch {
      setCameraError('Camera access denied. Please use manual entry or allow camera access.');
    }
  }

  async function scanFrame() {
    if (!videoRef.current || !detectorRef.current) return;
    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      if (barcodes.length > 0) {
        const detected = barcodes[0].rawValue;
        stopCamera();
        setBarcode(detected);
        lookupBarcode(detected);
        return;
      }
    } catch {
      // continue scanning
    }
    animFrameRef.current = requestAnimationFrame(scanFrame);
  }

  async function lookupBarcode(code: string) {
    setNotFound(false);
    setProduct(null);
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('barcode', code)
      .maybeSingle();
    if (data) {
      setProduct(data);
    } else {
      setNotFound(true);
    }
  }

  function handleManualSearch(e: React.FormEvent) {
    e.preventDefault();
    if (barcode.trim()) lookupBarcode(barcode.trim());
  }

  function handleAddToCart() {
    if (!product) return;
    onAddToCart(product);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  }

  const daysUntilExpiry = product ? getDaysUntilExpiry(product.expiry_date) : null;
  const inCart = product ? cartProductIds.includes(product.id) : false;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-slate-800 text-xl font-bold">Scan Products</h2>
        <p className="text-slate-500 text-sm">Use camera or enter barcode manually to look up products</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setMode('camera'); setProduct(null); setNotFound(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'camera' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'}`}
        >
          <Camera size={16} /> Camera Scan
        </button>
        <button
          onClick={() => { setMode('manual'); stopCamera(); setProduct(null); setNotFound(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'}`}
        >
          <Keyboard size={16} /> Manual Entry
        </button>
      </div>

      {mode === 'camera' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {!scanning ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-emerald-50 rounded-2xl p-6 mb-4">
                <Camera size={40} className="text-emerald-600" />
              </div>
              <h3 className="text-slate-800 font-semibold mb-2">Ready to Scan</h3>
              <p className="text-slate-500 text-sm mb-4">Point your camera at a product barcode</p>
              {cameraError && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{cameraError}</p>}
              <button
                onClick={startCamera}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Camera size={16} /> Start Camera
              </button>
            </div>
          ) : (
            <div className="relative">
              <video ref={videoRef} className="w-full max-h-72 object-cover bg-black" playsInline muted />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-emerald-400 rounded-lg w-48 h-28 animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <button onClick={stopCamera} className="flex items-center gap-2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                  <CameraOff size={14} /> Stop
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'manual' && (
        <form onSubmit={handleManualSearch} className="flex gap-2">
          <div className="relative flex-1">
            <ScanLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode (e.g. 8901234567890)"
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Search size={16} /> Lookup
          </button>
        </form>
      )}

      {notFound && (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center">
          <Package className="mx-auto text-slate-300 mb-2" size={36} />
          <p className="text-slate-500 font-medium">Product not found</p>
          <p className="text-slate-400 text-sm mt-1">No product with barcode <span className="font-mono text-slate-600">{barcode}</span> in this store.</p>
        </div>
      )}

      {product && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 px-5 py-3">
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
              <ScanLine size={16} />
              Product Found
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-slate-800 font-bold text-lg">{product.name}</h3>
                {product.category && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{product.category}</span>}
              </div>
              <p className="text-emerald-600 font-bold text-2xl">${Number(product.price).toFixed(2)}</p>
            </div>

            {product.description && <p className="text-slate-500 text-sm mb-4">{product.description}</p>}

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-0.5">Barcode</p>
                <p className="text-slate-700 font-mono text-sm">{product.barcode}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-0.5">In Stock</p>
                <p className="text-slate-700 text-sm font-medium">{product.stock_quantity} units</p>
              </div>
              {product.manufacturing_date && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-slate-400 text-xs mb-0.5">
                    <Calendar size={11} /> Manufactured
                  </div>
                  <p className="text-slate-700 text-sm">{product.manufacturing_date}</p>
                </div>
              )}
              {product.expiry_date && (
                <div className={`rounded-lg p-3 ${daysUntilExpiry !== null && daysUntilExpiry <= 0 ? 'bg-red-50' : daysUntilExpiry !== null && daysUntilExpiry <= 7 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                  <div className={`flex items-center gap-1 text-xs mb-0.5 ${daysUntilExpiry !== null && daysUntilExpiry <= 0 ? 'text-red-500' : daysUntilExpiry !== null && daysUntilExpiry <= 7 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {daysUntilExpiry !== null && daysUntilExpiry <= 7 ? <AlertTriangle size={11} /> : <Calendar size={11} />}
                    Expires
                  </div>
                  <p className={`text-sm font-medium ${daysUntilExpiry !== null && daysUntilExpiry <= 0 ? 'text-red-600' : daysUntilExpiry !== null && daysUntilExpiry <= 7 ? 'text-amber-600' : 'text-slate-700'}`}>
                    {product.expiry_date}
                    {daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 7 && (
                      <span className="block text-xs font-normal">{daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} left</span>
                    )}
                    {daysUntilExpiry !== null && daysUntilExpiry <= 0 && <span className="block text-xs font-normal">Expired!</span>}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                addedFeedback
                  ? 'bg-emerald-100 text-emerald-700'
                  : inCart
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {addedFeedback ? (
                <><CheckCircle2 size={18} /> Added to Cart!</>
              ) : inCart ? (
                <><Plus size={18} /> Add Again</>
              ) : (
                <><Plus size={18} /> Add to Cart</>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-100 rounded-xl p-4">
        <p className="text-slate-500 text-xs font-medium mb-2">Sample Barcodes to Try:</p>
        <div className="flex flex-wrap gap-2">
          {['8901234567890', '8902345678901', '8903456789012'].map((code) => (
            <button
              key={code}
              onClick={() => { setBarcode(code); lookupBarcode(code); setMode('manual'); }}
              className="bg-white text-slate-600 text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-400 transition-colors"
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
