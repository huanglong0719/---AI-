import React from 'react';
import { 
  Upload, 
  Wand2, 
  Eraser, 
  User, 
  Scissors, 
  RefreshCw, 
  Image as ImageIcon, 
  Download,
  X,
  Loader2,
  Sparkles,
  Layers,
  History
} from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = "" }) => {
  const icons: Record<string, React.FC<any>> = {
    upload: Upload,
    magic: Wand2,
    eraser: Eraser,
    user: User,
    scissors: Scissors,
    refresh: RefreshCw,
    image: ImageIcon,
    download: Download,
    close: X,
    loader: Loader2,
    sparkles: Sparkles,
    layers: Layers,
    history: History
  };

  const LucideIcon = icons[name] || ImageIcon;

  return <LucideIcon size={size} className={className} />;
};