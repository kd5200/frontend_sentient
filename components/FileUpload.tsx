import React, { useState } from "react";

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/api/upload/", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    console.log(result); // Process sentiment results
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload & Analyze
      </button>
    </div>
  );
};

export default FileUpload;
