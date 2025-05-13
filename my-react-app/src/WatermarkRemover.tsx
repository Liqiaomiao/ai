import React, { useRef, useState } from 'react';

type Method = 'blur' | 'clone' | 'fill';

const WatermarkRemover: React.FC = () => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [rect, setRect] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [method, setMethod] = useState<Method>('blur');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 上传图片
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImgUrl(url);
      setResultUrl(null);
      setRect(null);
    }
  };

  // 鼠标绘制矩形
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRect({ x, y, w: 0, h: 0 });
    setDrawing(true);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !canvasRef.current || !rect) return;
    const bounding = canvasRef.current.getBoundingClientRect();
    const w = (e.clientX - bounding.left) - rect.x;
    const h = (e.clientY - bounding.top) - rect.y;
    setRect({ ...rect, w, h });
  };
  const handleMouseUp = () => setDrawing(false);

  // 绘制图片和选区
  React.useEffect(() => {
    if (!canvasRef.current || !imgUrl) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const img = new window.Image();
    img.src = imgUrl;
    img.onload = () => {
      canvasRef.current!.width = img.width;
      canvasRef.current!.height = img.height;
      ctx.clearRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
      // 只在拖动选区时画红框，不影响最终处理
      if (rect && drawing) {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        ctx.restore();
      }
    };
  }, [imgUrl, rect, drawing]);

  // 执行水印移除
  const handleRemove = () => {
    if (!canvasRef.current || !rect) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const img = new window.Image();
    img.src = imgUrl!;
    img.onload = () => {
      // 先还原原图
      ctx.clearRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
      const x = Math.round(rect.x), y = Math.round(rect.y), w = Math.abs(Math.round(rect.w)), h = Math.abs(Math.round(rect.h));
      if (w < 5 || h < 5) return alert('请框选水印区域');
      if (method === 'blur') blurArea(ctx, x, y, w, h);
      else if (method === 'clone') cloneArea(ctx, x, y, w, h);
      else fillArea(ctx, x, y, w, h);
      setResultUrl(canvasRef.current!.toDataURL('image/png'));
    };
  };

  // 简单模糊算法
  function blurArea(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    const imgData = ctx.getImageData(x, y, w, h);
    const data = imgData.data;
    const blurSize = 6;
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;
        for (let dy = -blurSize; dy <= blurSize; dy++) {
          for (let dx = -blurSize; dx <= blurSize; dx++) {
            const nx = xx + dx, ny = yy + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const idx = (ny * w + nx) * 4;
              r += data[idx];
              g += data[idx + 1];
              b += data[idx + 2];
              a += data[idx + 3];
              count++;
            }
          }
        }
        const idx = (yy * w + xx) * 4;
        data[idx] = r / count;
        data[idx + 1] = g / count;
        data[idx + 2] = b / count;
        data[idx + 3] = a / count;
      }
    }
    ctx.putImageData(imgData, x, y);
  }

  // 克隆上方区域
  function cloneArea(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    const sy = Math.max(0, y - h);
    const src = ctx.getImageData(x, sy, w, h);
    ctx.putImageData(src, x, y);
  }

  // 用边缘平均色填充
  function fillArea(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    const imgData = ctx.getImageData(x, y, w, h);
    let r = 0, g = 0, b = 0, a = 0, count = 0;
    // 取四边像素平均
    for (let i = 0; i < w; i++) {
      let idx1 = i * 4, idx2 = ((h - 1) * w + i) * 4;
      r += imgData.data[idx1] + imgData.data[idx2];
      g += imgData.data[idx1 + 1] + imgData.data[idx2 + 1];
      b += imgData.data[idx1 + 2] + imgData.data[idx2 + 2];
      a += imgData.data[idx1 + 3] + imgData.data[idx2 + 3];
      count += 2;
    }
    for (let j = 0; j < h; j++) {
      let idx1 = j * w * 4, idx2 = (j * w + w - 1) * 4;
      r += imgData.data[idx1] + imgData.data[idx2];
      g += imgData.data[idx1 + 1] + imgData.data[idx2 + 1];
      b += imgData.data[idx1 + 2] + imgData.data[idx2 + 2];
      a += imgData.data[idx1 + 3] + imgData.data[idx2 + 3];
      count += 2;
    }
    r = r / count; g = g / count; b = b / count; a = a / count;
    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = r;
      imgData.data[i + 1] = g;
      imgData.data[i + 2] = b;
      imgData.data[i + 3] = a;
    }
    ctx.putImageData(imgData, x, y);
  }

  return (
    <div style={{maxWidth: 800, margin: '0 auto', padding: 20}}>
      <h2>图片水印移除 Demo</h2>
      <input type="file" accept="image/*" onChange={handleFile} />
      <div style={{margin: '10px 0'}}>
        <label>
          <input type="radio" checked={method==='blur'} onChange={()=>setMethod('blur')} /> 模糊
        </label>
        <label style={{marginLeft: 10}}>
          <input type="radio" checked={method==='clone'} onChange={()=>setMethod('clone')} /> 克隆
        </label>
        <label style={{marginLeft: 10}}>
          <input type="radio" checked={method==='fill'} onChange={()=>setMethod('fill')} /> 填充
        </label>
      </div>
      {imgUrl && (
        <div>
          <p>用鼠标在图片上框选水印区域：</p>
          <canvas
            ref={canvasRef}
            style={{border: '1px solid #ccc', maxWidth: '100%', cursor: 'crosshair'}}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
          <div style={{margin: '10px 0'}}>
            <button onClick={handleRemove}>移除水印</button>
          </div>
        </div>
      )}
      {resultUrl && (
        <div>
          <h4>处理结果：</h4>
          <img src={resultUrl} alt="result" style={{maxWidth: '100%'}} />
          <div>
            <a href={resultUrl} download="result.png">下载图片</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatermarkRemover;