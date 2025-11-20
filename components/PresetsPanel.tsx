import React from 'react';
import { PresetCommand } from '../types';
import { Icon } from './Icon';

interface PresetsPanelProps {
  onSelectPreset: (prompt: string) => void;
  disabled: boolean;
}

const PRESETS: PresetCommand[] = [
  {
    id: 'restore',
    label: '老照片修复',
    icon: 'history',
    prompt: '修复这张老照片。去除划痕，修复破损，去噪，锐化细节，并显著改善色彩平衡。',
    description: '修复划痕、噪点和色彩'
  },
  {
    id: 'background',
    label: '智能抠图',
    icon: 'scissors',
    prompt: '移除这张图片的背景，替换为干净的纯白背景。保持主体清晰完整。',
    description: '分离主体，移除背景'
  },
  {
    id: 'face_swap',
    label: 'AI 换脸',
    icon: 'user',
    prompt: '将图片中人物的脸换成一张友好的笑脸，特征清晰，肤色自然融合。',
    description: '生成新的面部特征'
  },
  {
    id: 'avatar',
    label: '生成头像',
    icon: 'image',
    prompt: '将这张图片转换成高质量的3D卡通头像风格，类似皮克斯动画风格。',
    description: '3D卡通/皮克斯风格'
  },
  {
    id: 'watermark',
    label: '去除水印',
    icon: 'eraser',
    prompt: '移除这张图片上的所有水印、Logo和文字覆盖。智能填充并重建被遮挡的纹理，使其看起来自然。',
    description: '清除文字和Logo'
  },
  {
    id: 'mosaic',
    label: '去除马赛克',
    icon: 'layers',
    prompt: '去除图片中的马赛克或模糊，进行超分辨率重建，尽可能恢复原始细节和清晰度。',
    description: '去模糊，锐化细节'
  }
];

export const PresetsPanel: React.FC<PresetsPanelProps> = ({ onSelectPreset, disabled }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 gap-3">
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelectPreset(preset.prompt)}
          disabled={disabled}
          className={`
            relative group p-3 rounded-xl text-left border transition-all duration-200
            ${disabled 
              ? 'bg-slate-800/50 border-slate-800 opacity-50 cursor-not-allowed' 
              : 'bg-slate-800 border-slate-700 hover:border-indigo-500 hover:bg-slate-750 hover:shadow-md hover:shadow-indigo-500/10'
            }
          `}
        >
          <div className="flex items-start justify-between mb-2">
            <div className={`p-2 rounded-lg ${disabled ? 'bg-slate-700' : 'bg-slate-700/50 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'}`}>
              <Icon name={preset.icon} size={20} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-0.5">{preset.label}</h3>
          <p className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</p>
        </button>
      ))}
    </div>
  );
};