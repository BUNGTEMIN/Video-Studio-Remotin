import React, { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Maximize2, Move, ArrowDownLeft } from 'lucide-react';

interface FloatingPanelModalProps {
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onDockBack: () => void;
  children: React.ReactNode;
  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;
}

export const FloatingPanelModal: React.FC<FloatingPanelModalProps> = ({
  title,
  icon,
  isOpen,
  onClose,
  onDockBack,
  children,
  initialWidth = 560,
  initialHeight = 600,
  initialX = 180,
  initialY = 70,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, startW: 0, startH: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.mouseX;
        const dy = e.clientY - dragStartRef.current.mouseY;
        const newX = Math.max(10, Math.min(window.innerWidth - 100, dragStartRef.current.posX + dx));
        const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.posY + dy));
        setPosition({ x: newX, y: newY });
      } else if (isResizing) {
        const dw = e.clientX - resizeStartRef.current.mouseX;
        const dh = e.clientY - resizeStartRef.current.mouseY;
        const newW = Math.max(340, Math.min(window.innerWidth - position.x - 20, resizeStartRef.current.startW + dw));
        const newH = Math.max(220, Math.min(window.innerHeight - position.y - 20, resizeStartRef.current.startH + dh));
        setSize({ width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, position]);

  if (!isOpen) return null;

  const handleDragStart = (e: React.MouseEvent) => {
    // Only drag from header, ignore buttons
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: size.width,
      startH: size.height,
    };
  };

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: isMinimized ? 'auto' : `${size.height}px`,
      }}
      className="fixed z-50 bg-[#141620] border border-[#2e3346] rounded-2xl shadow-2xl flex flex-col overflow-hidden select-none animate-scale-up"
    >
      {/* Draggable Header Bar */}
      <div
        onMouseDown={handleDragStart}
        className="h-11 bg-[#1a1c28] border-b border-[#292d3e] px-4 flex items-center justify-between cursor-move shrink-0 text-slate-200"
      >
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-cyan-400" />
          {icon}
          <span className="text-xs font-bold text-white tracking-wide truncate">
            {title}
          </span>
          <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.2 rounded">
            Floating Window
          </span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1">
          {/* Minimize */}
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-[#282c3f] text-slate-400 hover:text-white transition-colors"
            title={isMinimized ? 'Perbesar' : 'Perkecil'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Dock Back into Layout */}
          <button
            type="button"
            onClick={onDockBack}
            className="p-1 rounded hover:bg-[#282c3f] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5"
            title="Sematkan Kembali ke Tata Letak (Dock Back)"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">Dock</span>
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors ml-1"
            title="Tutup Jendela"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden relative flex flex-col bg-[#0e1017]">
          {children}

          {/* Bottom-right Resize Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-30 flex items-center justify-center text-slate-500 hover:text-cyan-400"
            title="Tarik untuk mengubah ukuran (Resize)"
          >
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-current">
              <polygon points="10 0, 10 10, 0 10" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
