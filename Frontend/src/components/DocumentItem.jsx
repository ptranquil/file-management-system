import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MoreVertical, ChevronDown, ChevronRight } from 'lucide-react';
import CreateVersionModal from './CreateVersionModal';

const VERSION_API_BASE = import.meta.env.VITE_VERSION_SERVICE_URL;

const DocumentItem = ({ doc, onRefresh }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [versionsVisible, setVersionsVisible] = useState(false);
    const [versions, setVersions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);  // New state for editing
    const [editTitle, setEditTitle] = useState(doc.title || '');  // New state for title
    const [editContent, setEditContent] = useState(doc.content || '');  // New state for content
    const dropdownRef = useRef(null);
    const token = localStorage.getItem('token');

    const fetchVersions = async () => {
        try {
            const response = await axios.get(
                `${VERSION_API_BASE}/documents/${doc._id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setVersions(response.data.data.versions || []);
            setVersionsVisible(true);
        } catch (err) {
            console.error('Fetch Document Error:', err);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(
                `${VERSION_API_BASE}/documents/${doc._id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            onRefresh();
        } catch (err) {
            console.error('Delete Document Error:', err);
        }
    };

    const handleVersionUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('content', 'Uploaded via modal');

        try {
            await axios.post(
                `${VERSION_API_BASE}/documents/${doc._id}/version`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setShowModal(false);
            await fetchVersions();
        } catch (err) {
            console.error('Version Upload Failed:', err);
        }
    };

    const handleDocumentClick = async () => {
        if (versionsVisible) {
            setVersionsVisible(false);
            return;
        }
        await fetchVersions();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEditSubmit = async () => {
        try {
            await axios.put(
                `${VERSION_API_BASE}/documents/${doc._id}`,
                {
                    title: editTitle,
                    content: editContent,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setEditModalOpen(false);
            onRefresh(); // Refresh the list after editing
        } catch (err) {
            console.error('Edit Document Error:', err);
        }
    };

    return (
        <div className="border rounded-xl shadow-sm mb-4 bg-white">
            <div
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer"
                onClick={handleDocumentClick}
            >
                <div className="flex items-center gap-3">
                    {versionsVisible ? (
                        <ChevronDown size={18} className="text-gray-500" />
                    ) : (
                        <ChevronRight size={18} className="text-gray-500" />
                    )}
                    <div>
                        <div className="font-semibold text-gray-800">{doc.title}</div>
                        <div className="text-sm text-gray-500">{doc.content || "No description"}</div>
                    </div>
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen((prev) => !prev);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-8 w-40 bg-white border rounded shadow z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditModalOpen(true);
                                    setDropdownOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                Edit Document
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete();
                                    setDropdownOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                            >
                                Delete
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowModal(true);
                                    setDropdownOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                Add Version
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {versionsVisible && (
                <div className="border-t px-4 py-3 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Versions:</h3>
                    {versions.length === 0 ? (
                        <div className="text-gray-400 text-sm">No versions available.</div>
                    ) : (
                        <ul className="space-y-2">
                            {versions.map((version) => (
                                <li
                                    key={version._id}
                                    className="text-sm text-gray-700 border p-2 rounded bg-white hover:bg-gray-100"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-semibold">v{version.version}</span>
                                            <span className="ml-2 text-gray-500 text-xs">
                                                {new Date(version.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <a
                                            href={version.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 text-xs underline ml-2"
                                        >
                                            View File
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Create Version Modal */}
            <CreateVersionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleVersionUpload}
            />

            {/* Edit Document Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Edit Document</h2>
                        <div className="mb-3">
                            <label className="block text-sm text-gray-600 mb-1">Title</label>
                            <input
                                type="text"
                                className="w-full border px-3 py-2 rounded"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-1">Content</label>
                            <textarea
                                className="w-full border px-3 py-2 rounded"
                                rows={3}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded"
                                onClick={() => setEditModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={handleEditSubmit}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentItem;
