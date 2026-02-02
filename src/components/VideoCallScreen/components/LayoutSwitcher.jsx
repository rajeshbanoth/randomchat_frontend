import React from 'react';

const LayoutSwitcher = ({ videoLayout, handleLayoutChange }) => {
  const getLayoutIcon = (layout) => {
    switch(layout) {
      case 'pip':
        return (
          <div className="w-full h-full border border-gray-400 rounded relative">
            <div className="absolute top-0 right-0 w-2 h-2 border border-gray-400 rounded-sm"></div>
          </div>
        );
      case 'grid-horizontal':
        return (
          <div className="w-full h-full flex gap-0.5">
            <div className="flex-1 border border-gray-400 rounded"></div>
            <div className="flex-1 border border-gray-400 rounded"></div>
          </div>
        );
      case 'grid-vertical':
        return (
          <div className="w-full h-full flex flex-col gap-0.5">
            <div className="flex-1 border border-gray-400 rounded"></div>
            <div className="flex-1 border border-gray-400 rounded"></div>
          </div>
        );
      case 'side-by-side':
        return (
          <div className="w-full h-full flex gap-0.5">
            <div className="w-2/3 border border-gray-400 rounded"></div>
            <div className="w-1/3 border border-gray-400 rounded"></div>
          </div>
        );
      case 'stack':
        return (
          <div className="w-full h-full relative">
            <div className="absolute inset-0 border border-gray-400 rounded"></div>
            <div className="absolute bottom-0 right-0 w-2/3 h-2/3 border border-gray-400 rounded"></div>
          </div>
        );
      case 'cinema':
        return (
          <div className="w-full h-full border border-gray-400 rounded flex items-center justify-center">
            <div className="w-3/4 h-2/3 border-t border-b border-gray-400"></div>
          </div>
        );
      case 'speaker-view':
        return (
          <div className="w-full h-full flex flex-col gap-0.5">
            <div className="h-3/4 border border-gray-400 rounded"></div>
            <div className="h-1/4 border border-gray-400 rounded"></div>
          </div>
        );
      case 'focus-remote':
        return (
          <div className="w-full h-full relative">
            <div className="absolute inset-0 border border-gray-400 rounded"></div>
            <div className="absolute top-1 right-1 w-1/3 h-1/3 border border-gray-400 rounded-sm"></div>
          </div>
        );
      case 'focus-local':
        return (
          <div className="w-full h-full relative">
            <div className="absolute inset-0 border border-gray-400 rounded"></div>
            <div className="absolute top-1 left-1 w-1/3 h-1/3 border border-gray-400 rounded-sm"></div>
          </div>
        );
      default:
        return <div className="w-full h-full border border-gray-400 rounded"></div>;
    }
  };

  return (
    <div className="hidden sm:flex items-center space-x-1 bg-gray-800/30 rounded-lg p-1 backdrop-blur-sm">
      {['pip', 'grid-horizontal', 'grid-vertical', 'side-by-side', 'stack', 'cinema', 'speaker-view', 'focus-remote', 'focus-local'].map((layout) => (
        <button
          key={layout}
          onClick={() => handleLayoutChange(layout)}
          className={`p-1.5 rounded transition-all duration-300 ${videoLayout === layout ? 'bg-blue-500/30 border border-blue-500/50' : 'hover:bg-gray-700/30 border border-transparent'}`}
          title={layout.replace('-', ' ')}
        >
          <div className="w-4 h-3">
            {getLayoutIcon(layout)}
          </div>
        </button>
      ))}
    </div>
  );
};

export default LayoutSwitcher;