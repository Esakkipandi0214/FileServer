'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/files`);
    const data = await res.json();
    setFiles(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    setFile(null);
    fetchFiles();
    setUploading(false);
  };

  const handleDelete = async (fileName: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName }),
    });
  
    fetchFiles();
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">File Uploader</h1>

        {/* File Input */}
        <label className="w-full h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
          <input type="file" onChange={handleFileChange} className="hidden" />
          <span className="text-gray-600">{file ? file.name : 'Click or drag file here'}</span>
        </label>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`mt-4 w-full bg-blue-500 text-white py-2 rounded-lg transition ${
            uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {/* File List */}
      <div className="mt-8 bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Uploaded Files</h2>
        {files.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet.</p>
        ) : (
          <ul className="space-y-3">
            {files.map((f) => (
              <li key={f.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <a href={f.url} target="_blank" className="text-blue-500 hover:underline truncate w-4/5">
                  {f.name}
                </a>
                <Image src={f.url} alt="Uploaded file" width={300} height={200} />
                <button
                  onClick={() => handleDelete(f.name)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
