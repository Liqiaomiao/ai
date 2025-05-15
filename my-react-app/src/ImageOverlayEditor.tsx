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
      bottomRight: { x: number, y: number },
      clearPos: {x: number, y: number}
    }
  }>({});
  // 添加状态管理缩放和位置
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

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
    const x = node.x();
    const y = node.y();
    const topLeft = { x: x, y:y };
    const topRight = { x: x+ box.width, y: y };
    const bottomLeft = { x: x, y: y + box.height };
    const bottomRight = { x:x+ box.width, y: y+ box.height };
    const clearPos = { x: box.x+ box.width, y: box.y}
  
    setCoordinates(prev => ({
      ...prev,
      [id]: { topLeft, topRight, bottomLeft, bottomRight, clearPos }
    }));
  };
  // 拖拽和缩放限制
  const handleDragMove = (id: string, e: any) => {
    const node = e.target;
    const stage = node.getStage();
    const box = node.getClientRect();
    
    let newX = node.x();
    let newY = node.y();
    
    // 获取Stage容器的尺寸
    const containerWidth = stage.width();
    const containerHeight = stage.height();
  
    // 确保至少有一部分在可视区域内（保留至少50%在可视区域）
    const minVisibleHorizontal = Math.min(box.width, containerWidth) * 1;
    const minVisibleVertical = Math.min(box.width, containerHeight) * 1;
    
    // 限制右边界
    if (box.x + minVisibleHorizontal > containerWidth) {
     
      newX = node.x() - (box.x + minVisibleHorizontal - containerWidth);
    }
    
    // 限制左边界
    if (box.x + box.width - minVisibleHorizontal < 0) {
    
      newX = node.x() - (box.x + box.width - minVisibleHorizontal);
    }
    
    // 限制下边界
    if (box.y + minVisibleVertical > containerHeight) {
   
      newY = node.y() - (box.y + minVisibleVertical - containerHeight);
    }
    
    // 限制上边界
    if (box.y + box.height - minVisibleVertical < 0) {
    
      newY = node.y() - (box.y + box.height - minVisibleVertical);
    }

    node.x(newX);
    node.y(newY);
  };
  
  // 拖拽开始
  const handleDragStart = () => {
    setIsDragging(true);
  };
  // 拖拽结束
  const handleDragEnd = (id: string, e: any) => {
    setIsDragging(false);
    console.log('overlay drag end');
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
    console.log('overlay transform end', scale);
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
    updateCoordinates(id)
  
  };

  // 选中时更新变换器
  useEffect(() => {
    if (selectedId && transformerRef.current && groupRefs.current[selectedId]) {
      transformerRef.current.nodes([groupRefs.current[selectedId]]);
      transformerRef.current.getLayer().batchDraw();
      
      // 只有覆盖层才需要更新坐标
      if (selectedId !== 'baseImage') {
        updateCoordinates(selectedId);
      }
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

  // 底图拖动处理
  const handleStageWheel = (e) => {
    setSelectedId(null);
    e.evt.preventDefault();
    
    // 计算新的缩放值
    const scaleBy = 1.1;
    const oldScale = scale;
    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // 限制缩放范围
    newScale = Math.max(0.5, Math.min(5, newScale));
    
    setScale(newScale);
  };

  // 底图拖拽处理
  const handleStageDragStart = () => {
    setIsDragging(true);
  };

  const handleStageDragEnd = (e) => {
    setIsDragging(false);
    console.log('stage drag');
    if(selectedId=='baseImage'){
      setPosition({ x: e.target.x(), y: e.target.y() });
    }
   
  };

  // 底图拖拽过程中限制
  const handleStageDragMove = (e) => {
    const node = e.target;
    const containerWidth = 800;
    const containerHeight = 533;
    const imageWidth = baseImage ? baseImage.width * scale : containerWidth;
    const imageHeight = baseImage ? baseImage.height * scale : containerHeight;
    
    let newX = node.x();
    let newY = node.y();
    // 防止底图完全移出可视区域，确保用户能找到底图
    // 允许部分移出，但至少保留一部分在可视区域内
    const minVisiblePortion = Math.min(containerWidth, imageWidth) * 0.5; 
    // 确保左边界不会完全移出
    if (newX > containerWidth - minVisiblePortion) {
      newX = containerWidth - minVisiblePortion;
    }
    
    // 确保右边界不会完全移出
    if (newX + imageWidth < minVisiblePortion) {
      newX = minVisiblePortion - imageWidth;
    }
    
    // 确保上边界不会完全移出
    if (newY > containerHeight - minVisiblePortion) {
      newY = containerHeight - minVisiblePortion;
    }
    
    // 确保下边界不会完全移出
    if (newY + imageHeight < minVisiblePortion) {
      newY = minVisiblePortion - imageHeight;
    }
    
    node.x(newX);
    node.y(newY);
  };

  // 保存处理 - 恢复原始尺寸，但保持覆盖图相对位置
  const handleSave = () => {
    if (!baseImage) return;
    
    // 重置缩放和位置
    setScale(1);
    setPosition({ x: 0, y: 0 });

    alert('保存成功！覆盖图位置已根据原始底图尺寸进行调整。');
  };

  return (
    <div className="image-overlay-editor" style={{ display: 'flex', gap: 24, position: 'relative' }}>
      {/* 删除icon，绝对定位在右上角 */}
      {selectedId && coordinates[selectedId] && !isDragging && (
        <div
          style={{
            position: 'absolute',
            left: coordinates[selectedId].clearPos.x   ,
            top: coordinates[selectedId].clearPos.y ,
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
        <div 
          style={{ 
            width: 800, 
            height: 533, 
            border: '2px solid #333', 
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {baseImage && (
            <Stage
              width={800}
              height={533}
              ref={stageRef}
              draggable
              onWheel={handleStageWheel}
              onDragStart={handleStageDragStart}
              onDragEnd={handleStageDragEnd}
              onDragMove={handleStageDragMove}
              style={{ background: '#eee' }}
              x={position.x}
              y={position.y}
              scaleX={scale}
              scaleY={scale}
            >
              <Layer>
                <Image 
                  image={baseImage}
                  id="baseImage"
                  ref={node => (groupRefs.current['baseImage'] = node)}
                  onClick={() => {
                   
                    setSelectedId(null);
                  }} 
                />
                {overlays.map(item => (
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
                    onDragStart={(e)=>{
                      e.cancelBubble = true;
                      handleDragStart()
                    }}
                    onDragMove={e => {
                      e.cancelBubble = true;
                      handleDragMove(item.id, e)
                    }}
                    onDragEnd={e => {
                      e.cancelBubble = true;
                      handleDragEnd(item.id, e)
                    }}
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
                )}
              </Layer>
            </Stage>
          )}
          <div 
            style={{ 
              position: 'absolute', 
              bottom: 10, 
              right: 10, 
              zIndex: 10 
            }}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setScale(prev => Math.min(prev * 1.1, 5))}
                style={{ padding: '5px 10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                放大
              </button>
              <button 
                onClick={() => setScale(prev => Math.max(prev / 1.1, 0.5))}
                style={{ padding: '5px 10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                缩小
              </button>
              <button 
                onClick={handleSave}
                style={{ padding: '5px 10px', background: '#FF5722', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
        {/* 坐标信息 */}
        {selectedId && coordinates[selectedId] && (
          <div className="coordinates-display">
            <h3>覆盖层相对于底图的坐标信息：</h3>
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
            {scale !== 1 && (
              <p style={{ color: 'red' }}>注意：当前底图已缩放，但坐标已转换为相对于原始底图的值。</p>
            )}
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
