import React, { useState, useEffect, useRef } from 'react';
import { getCompanySops, uploadCompanySop, deleteCompanySop, updateCompanySop } from '../../services/api.js';
import {
    FileText, Plus, Trash2, FileBadge, FileArchive,
    Edit3, Save, X, FileDown, Bold, Italic, Code, Link as LinkIcon,
    List, ListOrdered, Maximize2, Minimize2, Paperclip, Clock,
    Smile, Image as ImageIcon, MapPin, Settings
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import MySwal from '../../utils/swal.js';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <FileText className="w-8 h-8 text-rose-500" />;
    if (fileType.includes('word')) return <FileBadge className="w-8 h-8 text-blue-500" />;
    return <FileArchive className="w-8 h-8 text-emerald-500" />;
};

const SOPManagement = () => {
    const [sops, setSops] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [editingSop, setEditingSop] = useState(null);
    const [editContent, setEditContent] = useState('');

    const textareaRef = useRef(null);

    useEffect(() => {
        fetchSops();
    }, []);

    const fetchSops = async () => {
        try {
            setIsLoading(true);
            const res = await getCompanySops();
            setSops(res.data);
        } catch (error) {
            console.error('Failed to fetch SOPs:', error);
            MySwal.fire('Error', 'Failed to load SOPs', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = (sop) => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);

            // Title
            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.text(sop.title.toUpperCase(), margin, 25);

            doc.setDrawColor(79, 70, 229); // Indigo-600
            doc.setLineWidth(0.5);
            doc.line(margin, 28, pageWidth - margin, 28);

            // Metadata
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(`Document ID: ${sop.id}`, margin, 35);
            doc.text(`Exported on: ${new Date().toLocaleDateString()}`, margin, 40);

            // Content
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(0);

            // Simple Markdown rendering for PDF
            const lines = (sop.content || 'No content found.').split('\n');
            let y = 50;
            const lineHeight = 7;

            lines.forEach(line => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }

                let text = line;
                let currentFont = "normal";
                let currentSize = 11;
                let isHeader = false;

                // Handle Headers
                if (line.startsWith('#')) {
                    const match = line.match(/^(#+)\s*(.*)/);
                    if (match) {
                        const level = match[1].length;
                        currentFont = "bold";
                        currentSize = level === 1 ? 16 : level === 2 ? 14 : 12;
                        text = match[2];
                        isHeader = true;
                        y += 3;
                    }
                }
                // Handle Lists (bullet points only for now)
                else if (line.match(/^\s*[-*]\s/)) {
                    text = `•  ${line.replace(/^\s*[-*]\s/, '')}`;
                }

                // Handle inline bold formatting
                if (text.includes('**')) {
                    const fragments = text.split('**');
                    let startX = margin;
                    let isBold = false; // The first fragment is normal, the second is bold, etc.

                    // Check if whole line wraps
                    const fullTextWrap = doc.splitTextToSize(text.replace(/\*\*/g, ''), contentWidth);
                    if (fullTextWrap.length > 1) {
                        // Fallback for wrapped bold lines (complex to calculate perfectly inline)
                        doc.setFont("helvetica", currentFont);
                        doc.setFontSize(currentSize);
                        doc.text(fullTextWrap, margin, y);
                        y += (fullTextWrap.length * lineHeight);
                    } else {
                        fragments.forEach((fragment) => {
                            if (!fragment) {
                                isBold = !isBold;
                                return;
                            }

                            doc.setFont("helvetica", isBold ? "bold" : currentFont);
                            doc.setFontSize(currentSize);
                            doc.text(fragment, startX, y);

                            startX += doc.getTextWidth(fragment);
                            isBold = !isBold;
                        });
                        y += lineHeight;
                    }
                } else {
                    // Normal text rendering without inline formatting
                    doc.setFont("helvetica", currentFont);
                    doc.setFontSize(currentSize);
                    const splitText = doc.splitTextToSize(text, contentWidth);
                    doc.text(splitText, margin, y);
                    y += (splitText.length * lineHeight);
                }

                if (isHeader) {
                    y += 2; // Extra padding after headers
                }

                // Reset fonts for the next line
                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);
            });

            doc.save(`${sop.title.replace(/\s+/g, '_')}_SOP.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            MySwal.fire('Error', 'Failed to generate PDF document', 'error');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (allowedTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx)$/i)) {
                setUploadFile(file);
            } else {
                MySwal.fire('Error', 'Only PDF and Word documents are allowed', 'error');
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadTitle || !uploadFile) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('title', uploadTitle);
            formData.append('file', uploadFile);

            await uploadCompanySop(formData);

            MySwal.fire({
                title: 'Success',
                text: 'SOP Uploaded Successfully',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            setIsUploadModalOpen(false);
            setUploadTitle('');
            setUploadFile(null);
            fetchSops();
        } catch (error) {
            console.error('Failed to upload SOP:', error);
            MySwal.fire('Error', error.response?.data?.message || 'Failed to upload SOP', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id, title) => {
        const result = await MySwal.fire({
            title: `Delete ${title}?`,
            text: "You won't be able to revert this document!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteCompanySop(id);
                MySwal.fire('Deleted!', 'The SOP has been deleted.', 'success');
                fetchSops();
            } catch (error) {
                console.error('Failed to delete SOP:', error);
                MySwal.fire('Error', 'Failed to delete SOP', 'error');
            }
        }
    };

    const handleEdit = (sop) => {
        setEditingSop(sop);
        setEditContent(sop.content || '');
        setIsEditModalOpen(true);
        setIsFullScreen(false);
    };

    const handleSaveEdit = async () => {
        if (!editingSop) return;

        try {
            setIsUpdating(true);
            await updateCompanySop(editingSop.id, { content: editContent });

            MySwal.fire({
                title: 'Updated',
                text: 'SOP content updated successfully',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            setIsEditModalOpen(false);
            setEditingSop(null);
            setEditContent('');
            fetchSops();
        } catch (error) {
            console.error('Failed to update SOP:', error);
            MySwal.fire('Error', 'Failed to update SOP content', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const insertFormatting = (prefix, suffix = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);

        const before = text.substring(0, start);
        const after = text.substring(end);

        const newContent = before + prefix + selected + suffix + after;
        setEditContent(newContent);

        // Reset focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
        }, 0);
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto font-outfit">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">SOP Perusahaan</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage and edit company policies for AI Assistant context.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                >
                    <Plus className="w-4 h-4" />
                    Upload SOP
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : sops.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No SOPs Found</h3>
                    <p className="text-slate-500 mt-2">Get started by uploading your first standard operating procedure.</p>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="mt-6 px-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        Upload Document
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sops.map((sop) => (
                        <div key={sop.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-lg transition-all group flex flex-col h-full">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                                    {getFileIcon(sop.fileType)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleEdit(sop)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100"
                                        title="Edit Text Content"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sop.id, sop.title)}
                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{sop.title}</h3>
                            <p className="text-xs text-slate-500 mb-4 mt-auto">
                                Uploaded on {new Date(sop.createdAt).toLocaleDateString()}
                            </p>

                            <button
                                onClick={() => handleDownloadPDF(sop)}
                                className="flex items-center justify-center gap-2 w-full py-2 bg-slate-50 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            >
                                <FileDown className="w-4 h-4" />
                                Export as PDF
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">Upload New SOP</h2>
                                <p className="text-sm text-slate-500 mt-1">Upload a PDF or Word document outlining the procedure.</p>
                            </div>

                            <form onSubmit={handleUpload} className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Document Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={uploadTitle}
                                            onChange={(e) => setUploadTitle(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                                            placeholder="e.g. Employee Handbook 2024"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">File (PDF, DOC, DOCX)</label>
                                        <div
                                            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                        >
                                            <div className="space-y-2 text-center w-full">
                                                <FileText className={`mx-auto h-10 w-10 transition-colors ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
                                                <div className="flex text-sm text-slate-600 justify-center">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input
                                                            id="file-upload"
                                                            name="file-upload"
                                                            type="file"
                                                            className="sr-only"
                                                            required={!uploadFile}
                                                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                            onChange={(e) => setUploadFile(e.target.files[0])}
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    PDF, DOC, DOCX up to 10MB
                                                </p>
                                                {uploadFile && (
                                                    <div className="pt-3 max-w-[80%] mx-auto">
                                                        <div className="bg-white px-3 py-2 border border-indigo-100 rounded-lg shadow-sm flex items-center justify-between text-left">
                                                            <p className="text-sm font-semibold text-indigo-600 truncate mr-3">
                                                                {uploadFile.name}
                                                            </p>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                                                                className="text-slate-400 hover:text-rose-500 p-1"
                                                                title="Remove file"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-8 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsUploadModalOpen(false);
                                            setUploadTitle('');
                                            setUploadFile(null);
                                        }}
                                        className="flex-1 py-2.5 px-4 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Uploading...
                                            </>
                                        ) : 'Upload'}
                                    </button>
                                </div>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Enhanced Edit Content Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 transition-all duration-300 ${isFullScreen ? 'w-full h-full' : 'w-full max-w-5xl h-[85vh]'}`}
                        >
                            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                                        <Edit3 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                            Peninjauan SOP
                                            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Smart Editor</span>
                                        </h2>
                                        <p className="text-sm text-slate-500 font-medium truncate max-w-[200px] md:max-w-md">{editingSop?.title}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsFullScreen(!isFullScreen)}
                                        className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group"
                                        title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
                                    >
                                        {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5 group-hover:scale-110" />}
                                    </button>
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/20">
                                {/* Toolbar Area */}
                                <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center justify-between shadow-sm">
                                    <div className="flex flex-wrap items-center divide-slate-200 divide-x rtl:divide-x-reverse">
                                        <div className="flex items-center space-x-1 rtl:space-x-reverse pe-3 md:pe-4">
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('**', '**')}
                                                className="p-2 text-slate-500 rounded-lg cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Bold"
                                            >
                                                <Bold className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('_', '_')}
                                                className="p-2 text-slate-500 rounded-lg cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Italic"
                                            >
                                                <Italic className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('[', '](url)')}
                                                className="p-2 text-slate-500 rounded-lg cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Link"
                                            >
                                                <LinkIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('`', '`')}
                                                className="p-2 text-slate-500 rounded-lg cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Code"
                                            >
                                                <Code className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                className="p-2 text-slate-500 rounded-lg cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Icons (Coming Soon)"
                                            >
                                                <Smile className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap items-center space-x-1 rtl:space-x-reverse ps-3 md:ps-4">
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('- ')}
                                                className="p-2 text-slate-500 rounded-lg cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Bulleted List"
                                            >
                                                <List className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('1. ')}
                                                className="p-2 text-slate-500 rounded-lg cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Numbered List"
                                            >
                                                <ListOrdered className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                className="p-2 text-slate-500 rounded-lg cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Timeline (Coming Soon)"
                                            >
                                                <Clock className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                className="p-2 text-slate-500 rounded-lg cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Attachment"
                                            >
                                                <Paperclip className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 border-l border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>Active Editor</span>
                                        </div>
                                        <span>|</span>
                                        <span>{editContent.length} Characters</span>
                                    </div>
                                </div>

                                {/* Textarea Editor */}
                                <div className="flex-1 p-4 md:p-6 overflow-hidden">
                                    <div className="h-full bg-white border border-slate-200 rounded-[1.5rem] shadow-inner flex flex-col overflow-hidden group-focus-within:border-indigo-400 group-focus-within:ring-4 group-focus-within:ring-indigo-50 transition-all">
                                        <label htmlFor="editor" className="sr-only">Edit policy content</label>
                                        <textarea
                                            id="editor"
                                            ref={textareaRef}
                                            rows="8"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="block w-full flex-1 p-6 text-sm text-slate-800 bg-transparent border-0 focus:ring-0 placeholder:text-slate-400 leading-relaxed font-mono resize-none custom-scrollbar"
                                            placeholder="Write your policy rules here... (Markdown supported)"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Actions */}
                            <div className="p-6 md:p-8 border-t border-slate-100 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-all border border-slate-200"
                                    >
                                        Batalkan
                                    </button>
                                    <p className="hidden sm:block text-[10px] text-slate-400 font-medium px-4">
                                        Changes will affect AI responses immediately.
                                    </p>
                                </div>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={isUpdating}
                                    className="px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-3 group active:scale-95"
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            Simpan Aturan Kebijakan
                                        </>
                                    )}
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SOPManagement;
