import React, { useState } from 'react';
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

interface AdminDashboardProps {
  buses: BusRoute[];
  setBuses: (buses: BusRoute[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ buses, setBuses }) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].route) {
          setBuses(parsed);
          localStorage.setItem('dayscholar_buses_override', JSON.stringify(parsed));
          setSuccessMsg(`Successfully imported ${parsed.length} routes!`);
          setErrorMsg('');
        } else {
          throw new Error("Invalid JSON structure. Expected an array of bus routes.");
        }
      } catch (err: any) {
        setErrorMsg("Failed to parse JSON file: " + err.message);
        setSuccessMsg('');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    localStorage.removeItem('dayscholar_buses_override');
    window.location.reload();
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
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mb-4 md:mb-0">
        Admin Dashboard
      </h1>

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
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors hover:border-blue-500">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload updated buses.json
              </p>
              <p className="text-xs text-gray-500 mb-4">
                This will override the default database locally.
              </p>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Select File
                <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
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

              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                  <RefreshCw size={16} /> Reset to Default
                </h4>
                <p className="text-xs text-red-600/80 mb-3">
                  Revert to the original bus database and clear your uploaded JSON.
                </p>
                <button onClick={handleReset} className="text-sm bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-md font-medium transition-colors">
                  Reset Database
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex gap-3 text-sm text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="shrink-0" />
            <div>
              <strong>Note:</strong> Since we are currently using a local JSON workflow, these changes are stored in your browser's localStorage. In the future, this admin panel will sync directly with Supabase/Firebase.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
