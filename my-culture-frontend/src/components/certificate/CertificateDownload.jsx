import { useState } from 'react';
import { FaDownload, FaFilePdf, FaImage, FaSpinner } from 'react-icons/fa6';
import axios from 'axios';

const CertificateDownload = ({ certificateId, title = "Certificate" }) => {
  const [downloading, setDownloading] = useState({
    pdf: false,
    png: false
  });

  const downloadFile = async (type) => {
    if (!certificateId) {
      alert('Certificate ID is required');
      return;
    }

    setDownloading(prev => ({ ...prev, [type]: true }));

    try {
      const endpoint = `${import.meta.env.VITE_BACKEND}/api/certificates/${certificateId}/${type}`;
      
      const response = await axios.get(endpoint, {
        responseType: 'blob',
        timeout: 60000 // 60 seconds timeout for PDF generation
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { 
        type: type === 'pdf' ? 'application/pdf' : 'image/png' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${type}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(`Error downloading ${type.toUpperCase()}:`, error);
      
      let errorMessage = `Failed to download ${type.toUpperCase()}`;
      if (error.response?.status === 404) {
        errorMessage = 'Certificate not found';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Download timeout - please try again';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setDownloading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-6">
      <div className="flex gap-3">
        {/* PDF Download Button */}
        <button
          onClick={() => downloadFile('pdf')}
          disabled={downloading.pdf || downloading.png}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
          title="Download as PDF"
        >
          {downloading.pdf ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaFilePdf />
          )}
          <span>
            {downloading.pdf ? 'Generating PDF...' : 'Download PDF'}
          </span>
        </button>

        {/* PNG Download Button */}
        <button
          onClick={() => downloadFile('png')}
          disabled={downloading.pdf || downloading.png}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          title="Download as PNG Image"
        >
          {downloading.png ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaImage />
          )}
          <span>
            {downloading.png ? 'Generating PNG...' : 'Download PNG'}
          </span>
        </button>
      </div>

      {/* Download Info */}
      <div className="text-sm text-gray-600 text-center">
        <p className="flex items-center gap-1">
          <FaDownload className="text-xs" />
          High-quality downloads powered by server-side generation
        </p>
        {(downloading.pdf || downloading.png) && (
          <p className="text-xs mt-1 text-blue-600">
            This may take a few seconds...
          </p>
        )}
      </div>
    </div>
  );
};

export default CertificateDownload;