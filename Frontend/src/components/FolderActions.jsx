import React, { useState } from 'react'
import axios from 'axios'

const FOLDER_API_BASE = import.meta.env.VITE_HEIRARCHY_SERVICE_URL;

const FolderActions = ({ currentFolderId, onRefresh }) => {
    const [newFolderName, setNewFolderName] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleAddFolder = async () => {
        if (!newFolderName.trim()) return
        try {
            await axios.post(
                `${FOLDER_API_BASE}/folder`,
                {
                    name: newFolderName,
                    parentFolder: currentFolderId,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            )
            setNewFolderName('')
            onRefresh()
            setIsModalOpen(false)
        } catch (error) {
            console.error('Add Folder Error:', error)
        }
    }

    return (
        <div className="mb-6">
            {/* Button to open modal */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
            >
                Add New Folder
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Folder</h2>
                        <input
                            type="text"
                            placeholder="Enter folder name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={handleAddFolder}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                            >
                                Create Folder
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FolderActions

