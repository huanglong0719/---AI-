import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Icon } from './components/Icon';
import { PresetsPanel } from './components/PresetsPanel';
import { editImageWithGemini } from './services/geminiService';
import { EditorState } from './types';

type MobileTab = 'original' | 'result';

const App: React.FC = () => {
  const [state, setState] = useState<EditorState>({
    originalImage: null,
    processedImage: null,
    isProcessing: false,
    error: null,
    currentPrompt: '',
  });

  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('original');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Auto-switch tab when processing completes
  useEffect(() => {
    if (state.processedImage) {
      setActiveMobileTab('result');
    }
  }, [state.processedImage]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setState(prev => ({ ...prev, error: '请上传有效的图片文件。' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setState({
        originalImage: e.target?.result as string,
        processedImage: null,
        isProcessing: false,
        error: null,
        currentPrompt: '',
      });
      setActiveMobileTab('original');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!state.originalImage || !state.currentPrompt.trim()) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    // On mobile, switch to result view immediately to show loading state
    setActiveMobileTab('result');

    try {
      const match = state.originalImage.match(/^data:(image\/\w+);base64,/);
      const mimeType = match ? match[1] : 'image/jpeg';

      const result = await editImageWithGemini(state.originalImage, mimeType, state.currentPrompt);

      setState(prev => ({
        ...prev,
        processedImage: result,
        isProcessing: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message || '处理过程中发生意外错误。',
      }));
      setActiveMobileTab('original'); // Switch back on error so they can retry
    }
  };

  const downloadImage = () => {
    if (state.processedImage) {
      const link = document.createElement('a');
      link.href = state.processedImage;
      link.download = `magic-lens-edit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetEditor = () => {
    setState({
      originalImage: null,
      processedImage: null,
      isProcessing: false,
      error: null,
      currentPrompt: '',
    });
    setActiveMobileTab('original');
  };

  const handlePresetSelect = (prompt: string) => {
    setState(prev => ({ ...prev, currentPrompt: prompt }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      <Header />

      {/* Main Layout 
          Mobile: flex-col-reverse (Canvas on top, Controls on bottom)
          Desktop: flex-row (Sidebar left, Canvas right)
      */}
      <main className="flex-grow flex flex-col-reverse lg:flex-row lg:h-[calc(100vh-64px)] h-auto overflow-visible lg:overflow-hidden">
        
        {/* Left Sidebar - Controls */}
        <div className="w-full lg:w-[400px] bg-slate-900/50 border-t lg:border-t-0 lg:border-r border-slate-800 flex flex-col lg:overflow-y-auto custom-scrollbar z-10 flex-shrink-0">
          <div className="p-6 space-y-8 pb-10 lg:pb-6">
            
            {/* Step 1: Upload */}
            {!state.originalImage && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-xs mr-2">1</span>
                  上传图片
                </h2>
                <div 
                  className={`
                    border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
                    ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}
                  `}
                  onDragEnter={handleDrag} 
                  onDragLeave={handleDrag} 
                  onDragOver={handleDrag} 
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept="image/*"
                  />
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-4 bg-slate-800 rounded-full text-indigo-400">
                      <Icon name="upload" size={32} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">点击上传或拖拽图片至此</p>
                      <p className="text-sm text-slate-500 mt-1">支持 JPG, PNG, WEBP</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {state.originalImage && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-xs mr-2">2</span>
                    编辑设置
                  </h2>
                  <button 
                    onClick={resetEditor}
                    className="text-xs text-slate-400 hover:text-white flex items-center hover:underline"
                  >
                    <Icon name="close" size={12} className="mr-1" />
                    重新开始
                  </button>
                </div>

                {/* Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">快捷指令</label>
                  <PresetsPanel onSelectPreset={handlePresetSelect} disabled={state.isProcessing} />
                </div>

                {/* Custom Prompt */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">自定义指令</label>
                  <div className="relative">
                    <textarea
                      value={state.currentPrompt}
                      onChange={(e) => setState(prev => ({ ...prev, currentPrompt: e.target.value }))}
                      placeholder="描述你想如何修改这张图片..."
                      disabled={state.isProcessing}
                      className="w-full bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-xl p-3 min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none resize-none transition-all"
                    />
                    <Icon name="magic" size={16} className="absolute bottom-3 right-3 text-slate-500" />
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={state.isProcessing || !state.currentPrompt.trim()}
                  className={`
                    w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center space-x-2 transition-all duration-300
                    ${state.isProcessing || !state.currentPrompt.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-[1.02] hover:shadow-indigo-500/25'
                    }
                  `}
                >
                  {state.isProcessing ? (
                    <>
                      <Icon name="loader" className="animate-spin" />
                      <span>处理中...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="sparkles" />
                      <span>生成图像</span>
                    </>
                  )}
                </button>
                
                {state.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start space-x-2">
                    <Icon name="close" size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{state.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Area - Image Canvas */}
        {/* Only show if there is an image, OR if we are on desktop (to show placeholder) */}
        <div className={`flex-1 bg-slate-950 relative flex flex-col lg:h-full ${!state.originalImage ? 'hidden lg:flex' : 'flex'}`}>
           {/* Mobile Tabs for Switching View */}
           {state.originalImage && (
             <div className="lg:hidden flex bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
               <button 
                 onClick={() => setActiveMobileTab('original')}
                 className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeMobileTab === 'original' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400'}`}
               >
                 原图
               </button>
               <button 
                 onClick={() => setActiveMobileTab('result')}
                 className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeMobileTab === 'result' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400'}`}
               >
                 效果图 {state.processedImage && <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full ml-1 align-middle"></span>}
               </button>
             </div>
           )}

           {/* Grid Background Pattern */}
           <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ 
                  backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', 
                  backgroundSize: '24px 24px' 
                }} 
           />

           <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex items-center justify-center min-h-[50vh] lg:min-h-0">
             {!state.originalImage ? (
               <div className="text-center text-slate-600 max-w-md">
                 <div className="w-20 h-20 bg-slate-900/50 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-slate-800">
                   <Icon name="image" size={40} className="text-slate-700" />
                 </div>
                 <h3 className="text-xl font-semibold text-slate-400 mb-2">未选择图片</h3>
                 <p className="text-slate-500">请从侧边栏上传图片以开始 AI 编辑。</p>
               </div>
             ) : (
               <div className="w-full max-w-6xl h-full flex flex-col">
                 
                 {/* View Container */}
                 <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
                   
                   {/* Original Image - Hidden on mobile if tab is result */}
                   <div className={`
                      flex-1 flex-col min-h-0 bg-slate-900/30 rounded-2xl border border-slate-800 overflow-hidden relative group
                      ${activeMobileTab === 'original' ? 'flex' : 'hidden lg:flex'}
                   `}>
                     <div className="absolute top-3 left-3 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white z-10">
                       原图
                     </div>
                     <div className="flex-1 flex items-center justify-center p-4 w-full h-full">
                       <img 
                         src={state.originalImage} 
                         alt="Original" 
                         className="max-w-full max-h-[60vh] lg:max-h-full object-contain shadow-xl rounded-lg"
                       />
                     </div>
                   </div>

                   {/* Result Image - Hidden on mobile if tab is original */}
                   <div className={`
                      flex-1 flex-col min-h-0 bg-slate-900/30 rounded-2xl border border-slate-800 overflow-hidden relative
                      ${activeMobileTab === 'result' ? 'flex' : 'hidden lg:flex'}
                   `}>
                      <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white z-10 flex items-center">
                        {state.processedImage ? (
                           <>
                             <Icon name="sparkles" size={12} className="mr-1" /> 结果
                           </>
                        ) : (
                          "预览 / 结果"
                        )}
                      </div>
                      
                      {state.processedImage && (
                        <button 
                          onClick={downloadImage}
                          className="absolute top-3 right-3 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors z-10 shadow-lg"
                          title="下载结果"
                        >
                          <Icon name="download" size={18} />
                        </button>
                      )}

                      <div className="flex-1 flex items-center justify-center p-4 w-full h-full relative bg-slate-900/20">
                        {state.isProcessing ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
                            <div className="relative">
                              <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Icon name="magic" size={20} className="text-indigo-400 animate-pulse" />
                              </div>
                            </div>
                            <p className="mt-4 text-indigo-300 font-medium animate-pulse">AI 正在绘制...</p>
                          </div>
                        ) : null}

                        {state.processedImage ? (
                          <img 
                            src={state.processedImage} 
                            alt="Processed" 
                            className="max-w-full max-h-[60vh] lg:max-h-full object-contain shadow-xl rounded-lg animate-in fade-in zoom-in duration-500"
                          />
                        ) : (
                          <div className="text-slate-700 flex flex-col items-center p-8">
                            <Icon name="magic" size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium text-center">输入指令并点击生成<br/>查看 AI 魔法效果</p>
                          </div>
                        )}
                      </div>
                   </div>
                 </div>
               </div>
             )}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;