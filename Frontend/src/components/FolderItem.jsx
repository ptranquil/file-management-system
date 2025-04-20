import React, { useState } from 'react'
import axios from 'axios'
import { MoreVertical } from 'lucide-react'

const FOLDER_API_BASE = import.meta.env.VITE_HEIRARCHY_SERVICE_URL;

const FolderItem = ({ folder, onClick, onRefresh }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [isRenaming, setIsRenaming] = useState(false)
    const [newName, setNewName] = useState(folder.name)

    const handleDelete = async () => {
        try {
            await axios.delete(
                `${FOLDER_API_BASE}/folder/${folder._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            )
            onRefresh()
        } catch (error) {
            console.error('Delete Error:', error)
        }
    }

    const handleRename = async () => {
        if (!newName.trim()) return
        try {
            await axios.put(
                `${FOLDER_API_BASE}/folder/${folder._id}`,
                { newName: newName },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            )
            setIsRenaming(false)
            onRefresh()
        } catch (error) {
            console.error('Rename Error:', error)
        }
    }

    return (
        <div className="relative group border rounded-lg p-4 shadow-sm bg-white hover:bg-gray-50 cursor-pointer">
            {/* Folder Name or Renaming Input */}
            {isRenaming ? (
                <div className="space-y-2">
                    <input
                        className="border rounded px-2 py-1 w-full"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <div className="flex justify-between gap-2">
                        <button
                            className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                            onClick={handleRename}
                        >
                            Save
                        </button>
                        <button
                            className="bg-gray-300 px-2 py-1 rounded text-sm"
                            onClick={() => setIsRenaming(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div onClick={onClick} className="flex justify-between items-center">
                    <span className="font-medium">{folder.name}</span>
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setDropdownOpen((prev) => !prev)
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                        >
                            <MoreVertical size={18} />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 top-8 w-28 bg-white border rounded shadow z-10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsRenaming(true)
                                        setDropdownOpen(false)
                                    }}
                                    className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                                >
                                    Rename
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete()
                                        setDropdownOpen(false)
                                    }}
                                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-500"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default FolderItem
