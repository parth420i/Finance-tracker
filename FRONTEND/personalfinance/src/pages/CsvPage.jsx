import { useState, useRef } from 'react';
import { FiUploadCloud, FiDownload, FiCheck, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CsvPage = () => {
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [importedIds, setImportedIds] = useState(null);
    const [fileName, setFileName] = useState(null);
    const fileRef = useRef();

    const handleImport = async (file) => {
        if (!file) return;
        if (!file.name.endsWith('.csv')) { toast.error('Please upload a CSV file'); return; }
        setImporting(true);
        setImportResult(null);
        setImportedIds(null);
        setFileName(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await api.post('/csv/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImportResult({ success: true, ...data });
            setImportedIds(data.insertedIds || []);
            setFileName(file.name);
            toast.success(`${data.imported} transactions imported!`);
        } catch (err) {
            const msg = err.response?.data?.message || 'Import failed';
            setImportResult({ success: false, message: msg });
            toast.error(msg);
        } finally {
            setImporting(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleRemoveImport = async () => {
        if (!importedIds || importedIds.length === 0) {
            toast.error('No imported transactions to remove');
            return;
        }
        if (!window.confirm(`Remove ${importedIds.length} imported transaction(s)? This cannot be undone.`)) return;
        setRemoving(true);
        try {
            const { data } = await api.delete('/csv/rollback', { data: { ids: importedIds } });
            toast.success(data.message);
            setImportResult(null);
            setImportedIds(null);
            setFileName(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove');
        } finally {
            setRemoving(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await api.get('/csv/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'transactions.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('CSV exported!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Export failed');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-8">
            {/* CSV Format info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">CSV Format Requirements</h3>
                <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">Your CSV file must include these columns (in any order):</p>
                <code className="block text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 p-3 rounded-lg font-mono">
                    date, amount, type, category, note<br />
                    2024-01-15, 500.00, expense, Food & Dining, Lunch<br />
                    2024-01-16, 50000.00, income, Salary, January salary
                </code>
            </div>

            {/* Import */}
            <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiUploadCloud className="text-blue-500" /> Import Transactions
                </h3>

                {/* Dropzone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleImport(file); }}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-blue-500 bg-blue-100/30 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-white/30 dark:hover:bg-gray-800'
                        }`}
                >
                    <FiUploadCloud className="text-4xl mx-auto mb-3 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Drop your CSV file here</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => handleImport(e.target.files[0])}
                    />
                </div>

                {importing && (
                    <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Importing...
                    </div>
                )}

                {importResult && (
                    <div className={`mt-4 p-4 rounded-xl ${importResult.success ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        <div className="flex items-start gap-3">
                            {importResult.success ? <FiCheck className="text-emerald-500 flex-shrink-0 mt-0.5" /> : <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" />}
                            <div className="flex-1 text-sm">
                                <p className={`font-medium ${importResult.success ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                                    {importResult.message}
                                </p>
                                {fileName && (
                                    <p className="text-xs text-gray-500 mt-1">File: {fileName}</p>
                                )}
                                {importResult.errors?.length > 0 && (
                                    <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                                        {importResult.errors.map((e, i) => <li key={i}>• {e}</li>)}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Remove imported CSV button */}
                        {importResult.success && importedIds && importedIds.length > 0 && (
                            <button
                                onClick={handleRemoveImport}
                                disabled={removing}
                                className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-red-500/30 disabled:opacity-60"
                            >
                                <FiTrash2 />
                                {removing ? 'Removing...' : `Remove Import (${importedIds.length} transactions)`}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Export */}
            <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FiDownload className="text-emerald-500" /> Export Transactions
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Download all your transactions as a CSV file.</p>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/30 disabled:opacity-60"
                >
                    <FiDownload />
                    {exporting ? 'Exporting...' : 'Download CSV'}
                </button>
            </div>
        </div>
    );
};

export default CsvPage;
