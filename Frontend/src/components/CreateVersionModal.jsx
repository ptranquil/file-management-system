import React, { useRef } from 'react';

const CreateVersionModal = ({ isOpen, onClose, onSubmit }) => {
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const file = fileInputRef.current?.files[0];
        if (file) {
            onSubmit(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
                <h2 className="text-lg font-semibold mb-4">Upload New Version</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        required
                        className="mb-4 w-full"
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Upload
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateVersionModal;
