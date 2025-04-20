import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FolderItem from "./FolderItem";
import FolderActions from "./FolderActions";
import DocumentActions from "./DocumentActions";
import DocumentItem from "./DocumentItem";

const FOLDER_API_BASE = import.meta.env.VITE_HEIRARCHY_SERVICE_URL;
const VERSION_API_BASE = import.meta.env.VITE_VERSION_SERVICE_URL;

const HomePage = () => {
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [path, setPath] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDocId, setOpenDocId] = useState(null);
    const [totalDocs, setTotalDocs] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const token = localStorage.getItem("token");

    const fetchFolderContents = useCallback(
        async (folderId = null, updatedPath = []) => {
            setLoading(true);
            setError(null);

            try {
                const url = folderId
                    ? `${FOLDER_API_BASE}/viewstore/${folderId}`
                    : `${FOLDER_API_BASE}/viewstore`;

                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = res.data.data;

                if (Array.isArray(result)) {
                    setFolders(result);
                    setFiles([]);
                } else {
                    setFolders(result.subfolders || []);
                    setFiles(result.documents || []);
                }

                setPath(updatedPath);
                setCurrentFolderId(folderId);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Failed to load folders");
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/home");
        }
    }, [navigate]);

    const handleFolderClick = useCallback(
        (folder) => {
            const updatedPath = [
                ...path,
                { id: folder._id, name: folder.name },
            ];
            fetchFolderContents(folder._id, updatedPath);
        },
        [path, fetchFolderContents]
    );

    const handleBreadcrumbClick = useCallback(
        (index) => {
            const selected = path[index];
            const newPath = path.slice(0, index + 1);
            fetchFolderContents(selected?.id, newPath);
        },
        [path, fetchFolderContents]
    );

    const handleClickDocument = useCallback(
        async (id) => {
            try {
                const res = await axios.get(
                    `${VERSION_API_BASE}/documents/${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                console.log(res.data);
            } catch (err) {
                console.error("Document Fetch Error:", err);
            }
        },
        [token]
    );

    const handleSearchChange = async (e) => {
        setSearchTerm(e.target.value);
        if (e.target.value) {
            try {
                const res = await axios.get(
                    `${VERSION_API_BASE}/documents/filter?search=${e.target.value}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setSearchResults(res.data.data || []);
            } catch (err) {
                console.error("Search Error:", err);
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }
        fetchFolderContents();
    }, [navigate, token, fetchFolderContents]);

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }
        fetchFolderContents();

        axios
            .get(
                `${VERSION_API_BASE}/documents/total-documents`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            .then((res) => {
                setTotalDocs(res?.data?.data?.totalDocuments || 0); // adjust if the response structure differs
            })
            .catch((err) => {
                console.error("Error fetching total documents:", err);
            });
    }, [navigate, token, fetchFolderContents]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 shadow-md mb-6 rounded">
                <h1 className="text-2xl font-bold text-gray-700">
                    File Management System
                </h1>
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/");
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                >
                    Logout
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search documents"
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </div>

            <div className="flex justify-between items-center mb-6 flex-wrap">
                <div className="text-md md:text-lg text-gray-700 flex gap-2 flex-wrap">
                    <span
                        onClick={() => fetchFolderContents(null, [])}
                        className="cursor-pointer hover:underline font-semibold text-blue-600"
                    >
                        Root
                    </span>
                    {path.map((crumb, i) => (
                        <span key={crumb.id} className="flex items-center">
                            <span className="mx-1">/</span>
                            <span
                                onClick={() => handleBreadcrumbClick(i)}
                                className="cursor-pointer hover:underline text-blue-600"
                            >
                                {crumb.name}
                            </span>
                        </span>
                    ))}
                </div>

                <div className="text-sm md:text-base text-gray-600 font-medium mt-2 md:mt-0">
                    Total Documents:{" "}
                    <span className="text-blue-600 font-semibold">
                        {totalDocs}
                    </span>
                </div>
            </div>

            {/* Loader / Error / Content */}
            {loading ? (
                <div className="text-center text-gray-600">Loading...</div>
            ) : error ? (
                <div className="text-center text-red-600">{error}</div>
            ) : (
                <>
                    {/* Folders */}
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">
                        Folders
                    </h3>
                    <br />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-8">
                        {folders.map((folder) => (
                            <FolderItem
                                key={folder._id}
                                folder={folder}
                                onClick={() => handleFolderClick(folder)}
                                onRefresh={() =>
                                    fetchFolderContents(currentFolderId, path)
                                }
                            />
                        ))}
                    </div>

                    {/* Files */}
                    {files.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-4 text-gray-700">
                                Documents (click on documents to see version)
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {files.map((doc) => (
                                    <DocumentItem
                                        key={doc._id}
                                        doc={doc}
                                        onRefresh={() =>
                                            fetchFolderContents(
                                                currentFolderId,
                                                path
                                            )
                                        }
                                        onClick={() =>
                                            handleClickDocument(doc._id)
                                        }
                                        isOpen={openDocId === doc._id}
                                        onToggleOpen={() =>
                                            setOpenDocId((prevId) =>
                                                prevId === doc._id
                                                    ? null
                                                    : doc._id
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-4 text-gray-700">
                                Search Results
                            </h3>
                            <ul>
                                {searchResults.map((doc) => (
                                    <li
                                        key={doc.id}
                                        className="p-2 border-b border-gray-200"
                                    >
                                        <span className="font-semibold">
                                            {doc.title}
                                        </span>
                                        <span className="text-gray-600 ml-2">
                                            - {doc.folderPath}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/** Empty handler */}
                    {!files.length && !folders.length && (
                        <h3 className="text-xl font-semibold text-red-300">
                            Empty!
                        </h3>
                    )}
                </>
            )}

            {/* Actions */}
            <div className="flex gap-6 mt-12">
                <FolderActions
                    currentFolderId={currentFolderId}
                    onRefresh={() => fetchFolderContents(currentFolderId, path)}
                />
                <DocumentActions
                    currentFolderId={currentFolderId}
                    onRefresh={() => fetchFolderContents(currentFolderId, path)}
                />
            </div>
        </div>
    );
};

export default HomePage;
