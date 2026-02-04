import React, { useState } from 'react';

export default function FilePreviewModal({ file, onClose, onSend, isLoading }) {
    const [message, setMessage] = useState('');

    if (!file) return null;

    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : null;

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl h-[80vh] flex flex-col rounded-lg shadow-xl overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-4 absolute top-0 w-full z-10">
                    <button onClick={onClose} className="p-2 bg-white/80 rounded-full hover:bg-white text-gray-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <span className="text-gray-700 font-medium bg-white/80 px-3 py-1 rounded-full">{file.name}</span>
                    <div className="w-10"></div> {/* Spacer for alignment */}
                </div>

                {/* Preview Area */}
                <div className="flex-1 flex items-center justify-center bg-gray-100 p-8 overflow-auto">
                    {isImage ? (
                        <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain shadow-sm" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <span className="material-symbols-outlined text-[96px] opacity-20">description</span>
                            <div className="mt-4 text-center">
                                <p className="text-lg font-medium text-gray-500">No preview available</p>
                                <p className="text-sm">{formatSize(file.size)} - {file.name.split('.').pop().toUpperCase()}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
                    <div className="p-2 border border-gray-300 rounded-lg">
                        <span className="material-symbols-outlined text-gray-500">description</span>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors">
                        <span className="material-symbols-outlined text-gray-500">add</span>
                    </button>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                        className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 focus:ring-0 text-gray-700 placeholder-gray-400"
                        autoFocus
                    />
                    <button
                        onClick={() => onSend(message)}
                        className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                            <span className="text-gray-700 font-medium">Uploading...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
