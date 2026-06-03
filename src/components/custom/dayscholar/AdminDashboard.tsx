'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, Save, AlertCircle, RefreshCw } from 'lucide-react';

interface BusRoute {
  id: string;
  type: string;
  route: string;
  boardingPoints: string[];
  driverPhone: string;
  driverName: string;
  whatsappGroup: string;
  busLocation: string;
}

const AdminDashboard: React.FC = () => {
  const [buses, setBuses] = useState<BusRoute[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch('/api/buses')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.buses) {
          setBuses(data.buses);
        }
      })
      .catch(err => console.error("Failed to fetch buses:", err));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].route) {
          setIsUploading(true);
          setErrorMsg('');
          setSuccessMsg('Uploading to database...');
          
          const res = await fetch('/api/admin/buses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed),
          });

          const data = await res.json();
          if (data.success) {
            setBuses(parsed);
            setSuccessMsg(`Successfully imported ${parsed.length} routes to PostgreSQL!`);
          } else {
            throw new Error(data.message || 'Failed to update database');
          }
        } else {
          throw new Error("Invalid JSON structure. Expected an array of bus routes.");
        }
      } catch (err: any) {
        setErrorMsg("Failed to parse/upload JSON file: " + err.message);
        setSuccessMsg('');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(buses, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "buses_template.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Update Bus Database</CardTitle>
          <CardDescription>Upload a JSON file containing the updated bus routes, phone numbers, and WhatsApp links.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {successMsg && (
            <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm border border-green-200">
              {successMsg}
            </div>
          )}
          
          {errorMsg && (
            <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${isUploading ? 'opacity-50' : 'hover:border-blue-500'}`}>
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload updated buses.json
              </p>
              <p className="text-xs text-gray-500 mb-4">
                This will override the database directly.
              </p>
              <label className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isUploading ? 'pointer-events-none' : ''}`}>
                {isUploading ? 'Uploading...' : 'Select File'}
                <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              </label>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Save size={16} /> Need a template?
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Download the current database schema to edit driver details or routes manually.
                </p>
                <button onClick={downloadTemplate} className="text-sm text-blue-600 font-medium hover:underline">
                  Download buses_template.json
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex gap-3 text-sm text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-800/50">
            <AlertCircle className="shrink-0" />
            <div>
              <strong>Note:</strong> Changes made here will immediately reflect in the PostgreSQL database and update for all students.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
