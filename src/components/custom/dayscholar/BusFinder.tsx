import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MapPin, Phone, MessageCircle, BusFront } from 'lucide-react';

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

interface BusFinderProps {
  buses: BusRoute[];
}

const BusFinder: React.FC<BusFinderProps> = ({ buses }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuses = buses.filter((bus) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      bus.route.toLowerCase().includes(query) ||
      bus.boardingPoints.some((point) => point.toLowerCase().includes(query))
    );
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mb-4 md:mb-0">
          VIT Bus Finder
        </h1>
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 midnight:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search boarding point or route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBuses.length > 0 ? (
          filteredBuses.map((bus) => (
            <Card key={bus.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-2 ${bus.type === 'AC' ? 'bg-blue-500' : 'bg-green-500'}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BusFront className={bus.type === 'AC' ? 'text-blue-500' : 'text-green-500'} />
                      {bus.route}
                    </CardTitle>
                    <span className={`inline-block px-2 py-1 mt-2 text-xs font-semibold rounded-full ${bus.type === 'AC' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                      {bus.type} Bus
                    </span>
                  </div>
                  {bus.busLocation && (
                    <div className="text-xs text-right bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      <span className="block font-semibold text-gray-500">Campus Location</span>
                      {bus.busLocation}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1">
                    <MapPin size={14} /> Boarding Points
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {bus.boardingPoints.join(', ')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {bus.driverPhone ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Phone size={14} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">{bus.driverPhone}</p>
                        <p className="text-xs text-gray-500">{bus.driverName || 'Driver'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic flex items-center">
                      No driver contact available
                    </div>
                  )}

                  {bus.whatsappGroup && (
                    <a
                      href={bus.whatsappGroup}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-sm bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <MessageCircle size={16} />
                      Join Group
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-10 text-gray-500">
            No buses found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default BusFinder;
