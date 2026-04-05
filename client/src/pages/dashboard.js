'use client';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <div className="text-indigo-600 text-2xl font-bold">0</div>
            <p className="text-slate-600 text-sm mt-2">Files Uploaded</p>
          </div>
          
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-purple-600 text-2xl font-bold">0</div>
            <p className="text-slate-600 text-sm mt-2">Dashboards Created</p>
          </div>
          
          <div className="card bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <div className="text-pink-600 text-2xl font-bold">0</div>
            <p className="text-slate-600 text-sm mt-2">Analyses Run</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Get Started</h2>
          <p className="text-slate-600 mb-6">Upload your first CSV file to begin analyzing data with AI.</p>
          <button className="btn-primary">
            Upload File
          </button>
        </div>
      </div>
    </div>
  );
}
