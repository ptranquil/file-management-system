import React, { useState, useEffect } from 'react'
import axios from 'axios'

const VERSION_API_BASE = import.meta.env.VITE_VERSION_SERVICE_URL;

const DocumentActions = ({ currentFolderId, onRefresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [file, setFile] = useState(null)

    useEffect(() => {
        if (isModalOpen) {
            setTitle('')
            setDescription('')
            setFile(null)
        }
    }, [isModalOpen])

    const handleFileChange = e => setFile(e.target.files[0])

    const handleAddDocument = async () => {
        if (!title.trim() || !description.trim()) {
            alert('Title and description are required.')
            return
        }

        const formData = new FormData()
        if (file) formData.append('file', file)
        formData.append('title', title)
        formData.append('content', description)
        formData.append('folderId', currentFolderId)

        try {
            await axios.post(
                `${VERSION_API_BASE}/documents`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            )
            setIsModalOpen(false)
            onRefresh()
        } catch (err) {
            console.error('Add Document Error:', err)
            alert('Failed to upload document.')
        }
    }

    return (
        <div>
            {currentFolderId && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                    Add Document
                </button>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">New Document</h2>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full border rounded px-3 py-2 mb-3 focus:ring-2 focus:ring-green-400"
                        />
                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full border rounded px-3 py-2 mb-3 focus:ring-2 focus:ring-green-400"
                        />
                        <label className="block mb-2 text-sm text-gray-600"><b style={{color: "red"}}>Optional</b> File Upload</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="mb-6"
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={handleAddDocument} className="bg-green-600 text-white px-4 py-2 rounded">
                                Submit
                            </button>
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DocumentActions
