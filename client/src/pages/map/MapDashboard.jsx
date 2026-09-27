import { useState, useEffect } from 'react';
import { Map as MapIcon, Filter } from 'lucide-react';
import CrimeMap from '../../components/map/CrimeMap';

const MapDashboard = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <MapIcon className="w-6 h-6 mr-2 text-indigo-500" /> Geospatial Crime Map
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Visual overview of authorized FIR and case locations.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        {/* Render the reusable map component */}
        <CrimeMap height="600px" />
        
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs font-semibold text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2 shadow"></span> Critical Priority
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-orange-500 mr-2 shadow"></span> High Priority
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2 shadow"></span> Medium/Default
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2 shadow"></span> Low Priority
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDashboard;
