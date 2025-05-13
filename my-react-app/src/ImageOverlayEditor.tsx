import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image, Transformer,Group } from 'react-konva';
import './ImageOverlayEditor.css';

// 使用本地静态资源
import baseImageSrc from './assets/base-image.jpeg';
import overlayImageSrc from './assets/overlay-image.jpg';
import sinbaImageSrc from './assets/sinba.png';

type OverlayItem = {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  scale: number;
  width: number;
  height: number
};

const ImageOverlayEditor: React.FC = () => {
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null);
  const [sinbaImage, setSinbaImage] = useState<HTMLImageElement | null>(null);
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{
    [id: string]: {
      topLeft: { x: number, y: number },
      topRight: { x: number, y: number },
      bottomLeft: { x: number, y: number },
      bottomRight: { x: number, y: number }
    }
  }>({});

  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const groupRefs = useRef<{ [key: string]: any }>({});

  // 加载图片
  useEffect(() => {
    const baseImg = new window.Image();
    baseImg.src = baseImageSrc;
    baseImg.onload = () => setBaseImage(baseImg);

    const overlayImg = new window.Image();
    overlayImg.src = overlayImageSrc;
    overlayImg.onload = () => setOverlayImage(overlayImg);

    const sinbaImg = new window.Image();
    sinbaImg.src = sinbaImageSrc;
    sinbaImg.onload = () => setSinbaImage(sinbaImg);

    const handleBodyClick = (e) => {
      // 检查点击目标是否在Stage内部
      const stageContainer = stageRef.current?.container();
      
      // 排除是img标签并且data-use是overlay的元素
      if (e.target.tagName === 'IMG' && e.target.getAttribute('data-use') === 'overlay') {
        return;
      }
      
      if (stageContainer && !stageContainer.contains(e.target)) {
        // 只有点击了Stage容器外部的元素才取消选中
        setSelectedId(null);
      }
    };
    document.body.addEventListener('click', handleBodyClick);
    return () => {
      document.body.removeEventListener('click', handleBodyClick);
    };
  }, []);



  // 计算覆盖层四角坐标
  const updateCoordinates = (id: string) => {
    const node = groupRefs.current[id];
    if (!node) return;
    const box = node.getClientRect();
    const absPos = node.absolutePosition();
    const topLeft = { x: absPos.x, y: absPos.y };
    const topRight = { x: absPos.x + box.width, y: absPos.y };
    const bottomLeft = { x: absPos.x, y: absPos.y + box.height };
    const bottomRight = { x: box.x + box.width, y: box.y + box.height };
    setCoordinates(prev => ({
      ...prev,
      [id]: { topLeft, topRight, bottomLeft, bottomRight }
    }));
  };
  // 拖拽和缩放限制
  const handleDragMove = (id: string, e: any) => {
    const node = e.target;
    const stage = node.getStage();
    const box = node.getClientRect();
    const stageWidth = stage.width();
    const stageHeight = stage.height();

    let newX = node.x();
    let newY = node.y();

    // 保证至少有一边在底图内
    if (box.x < 0) newX = node.x() - box.x;
    if (box.y < 0) newY = node.y() - box.y;
    if (box.x + box.width > stageWidth) newX = node.x() - (box.x + box.width - stageWidth);
    if (box.y + box.height > stageHeight) newY = node.y() - (box.y + box.height - stageHeight);

    node.x(newX);
    node.y(newY);
  };
  const [isDragging, setIsDragging] = useState(false);
  // 拖拽开始
  const handleDragStart = () => {
    setIsDragging(true);
  };
  // 拖拽结束
  const handleDragEnd = (id: string, e: any) => {
    setIsDragging(false);
    const node = e.target;
    setOverlays(overlays.map(item =>
      item.id === id
        ? { ...item, x: node.x(), y: node.y() }
        : item
    ));
    updateCoordinates(id);
  };

  const handleTransformEnd = (id: string) => {
    const node = groupRefs.current[id];
    const scale = node.scaleX();
    setOverlays(overlays.map(item =>
      item.id === id
        ? {
            ...item,
            x: node.x(),
            y: node.y(),
            scale,
            width: item.width,
            height: item.height,
          }
        : item
    ));
    node.scaleX(1);
    node.scaleY(1);
    
    setTimeout(() => updateCoordinates(id), 0);
  };

  // 选中时更新变换器
  useEffect(() => {
    if (selectedId && transformerRef.current && groupRefs.current[selectedId]) {
      transformerRef.current.nodes([groupRefs.current[selectedId]]);
      transformerRef.current.getLayer().batchDraw();
      updateCoordinates(selectedId);
    }
  }, [selectedId, overlays.length]);

  const imageOptions = [
    { src: overlayImageSrc, label: 'overlay', image: overlayImage },
    { src: sinbaImageSrc, label: 'sinba', image: sinbaImage }
  ];

  // 添加新覆盖图
  const handleAddOverlay = (img: HTMLImageElement | null) => {
    if (!img || !baseImage) return;
    const id = `${Date.now()}_${Math.random()}`;
    const scaleX = baseImage.width / img.width;
    const scaleY = baseImage.height / img.height;
    const scale = Math.min(1, Math.min(scaleX, scaleY));
    const overlayWidth = img.width * scale;
    const overlayHeight = img.height * scale;
    const x = (baseImage.width - overlayWidth) / 2;
    const y = (baseImage.height - overlayHeight) / 2;
    setOverlays([
      ...overlays,
      {
        id,
        image: img,
        x,
        y,
        scale,
        width: img.width,
        height: img.height,
      },
    ]);
    setSelectedId(id);
    setTimeout(() => updateCoordinates(id), 0);
  };

  return (
    <div className="image-overlay-editor" style={{ display: 'flex', gap: 24, position: 'relative' }}>
      {/* 删除icon，绝对定位在右上角 */}
      {selectedId && coordinates[selectedId] && !isDragging && (
        <div
          style={{
            position: 'absolute',
            left: coordinates[selectedId].topRight.x + 4,
            top: coordinates[selectedId].topRight.y - 4,
            zIndex: 10
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 28,
              height: 28,
              background: '#999',
              color: '#fff',
              borderRadius: '50%',
              textAlign: 'center',
              lineHeight: '28px',
              fontSize: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            title="删除选中覆盖图"
            onClick={() => {
              setOverlays(overlays.filter(item => item.id !== selectedId));
              setSelectedId(null);
              setCoordinates(prev => {
                const newCoords = { ...prev };
                delete newCoords[selectedId!];
                return newCoords;
              });
            }}
          >x</span>
        </div>
      )}
      {/* 左侧底图+多个覆盖层 */}
      <div>
        {baseImage && (
          <Stage
            width={baseImage.width}
            height={baseImage.height}
            ref={stageRef}
            style={{ border: '1px solid #ccc', background: '#eee' }}
           
          >
            <Layer>
              <Image image={baseImage} onClick={()=>{
                setSelectedId(null);
              }} />
              {overlays.map(item => (
                // 在Group组件上加onDragStart
                <Group
                  key={item.id}
                  id={item.id}
                  ref={node => (groupRefs.current[item.id] = node)}
                  x={item.x}
                  y={item.y}
                  scaleX={item.scale}
                  scaleY={item.scale}
                  draggable
                  onClick={e => {
                    e.cancelBubble = true;
            
                    setSelectedId(item.id);
                  }}
                  onTap={e => {
                    e.cancelBubble = true;
                  
                    setSelectedId(item.id);
                  }}
                  onDragStart={handleDragStart}
                  onDragMove={e => handleDragMove(item.id, e)}
                  onDragEnd={e => handleDragEnd(item.id, e)}
                  onTransformEnd={e => handleTransformEnd(item.id, e)}
                >
                  <Image
                    image={item.image}
                    width={item.width}
                    height={item.height}
                  />
                </Group>
              ))}
              {selectedId && overlays.length > 0 && (
                <>
                  <Transformer
                    ref={transformerRef}
                    enabledAnchors={[
                      "top-left",
                      "top-right",
                      "bottom-left",
                      "bottom-right",
                    ]}
                    rotateEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 5 || newBox.height < 5) return oldBox;
                      return newBox;
                    }}
                  />
                 
                </>
              )}
            </Layer>
          </Stage>
        )}
        {/* 坐标信息 */}
        {selectedId && coordinates[selectedId]  && (
          <div className="coordinates-display">
          <h3>覆盖层坐标信息：</h3>
          <table>
            <tbody>
              <tr>
                <td>左上角：</td>
                <td>X: {Math.round(coordinates[selectedId].topLeft.x)}, Y: {Math.round(coordinates[selectedId].topLeft.y)}</td>
              </tr>
              <tr>
                <td>右上角：</td>
                <td>X: {Math.round(coordinates[selectedId].topRight.x)}, Y: {Math.round(coordinates[selectedId].topRight.y)}</td>
              </tr>
              <tr>
                <td>左下角：</td>
                <td>X: {Math.round(coordinates[selectedId].bottomLeft.x)}, Y: {Math.round(coordinates[selectedId].bottomLeft.y)}</td>
              </tr>
              <tr>
                <td>右下角：</td>
                <td>X: {Math.round(coordinates[selectedId].bottomRight.x)}, Y: {Math.round(coordinates[selectedId].bottomRight.y)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        )}
      </div>
      {/* 右侧覆盖图选择区 */}
      <div style={{ minWidth: 200 }}>
        <div style={{ marginBottom: 12 }}>点击图片添加到左侧底图：</div>
        {imageOptions.map(opt => (
          <img
            data-use="overlay"
            key={opt.label}
            src={opt.src}
            alt={opt.label}
            style={{ width: 180, cursor: 'pointer', border: '2px solid #eee', marginBottom: 12 }}
            onClick={() => handleAddOverlay(opt.image)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageOverlayEditor;
