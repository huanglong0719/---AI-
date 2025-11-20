import React from 'react';
import { Icon } from './Icon';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Icon name="sparkles" className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Magic Lens
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">AI 图像编辑器</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-4">
           <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
             由 Gemini 2.5 Flash 提供支持
           </span>
        </div>
      </div>
    </header>
  );
};