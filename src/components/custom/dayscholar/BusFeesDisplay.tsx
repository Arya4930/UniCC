import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IndianRupee, AlertCircle, Info, Calendar } from 'lucide-react';

const BusFeesDisplay = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mb-4 md:mb-0">
        Transport Fees & Info
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-blue-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">❄️</span> AC Bus
            </CardTitle>
            <CardDescription>Academic Year 2026-2027</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
              <IndianRupee size={32} /> 67,150
            </div>
            <p className="text-sm text-gray-500">Non-refundable fee for Fall & Winter semesters (July '26 - April '27)</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💨</span> Non-AC Bus
            </CardTitle>
            <CardDescription>Academic Year 2026-2027</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
              <IndianRupee size={32} /> 49,150
            </div>
            <p className="text-sm text-gray-500">Non-refundable fee for Fall & Winter semesters (July '26 - April '27)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="text-blue-500" /> Application Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <span className="font-bold text-blue-600 dark:text-blue-400">June 4, 2026</span>
              </div>
              <div>
                <p className="font-medium">Fee Payment Portal Opens</p>
                <p className="text-sm text-gray-500">Payment option will be enabled in the VTOP portal.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <span className="font-bold text-red-600 dark:text-red-400">June 17, 2026</span>
              </div>
              <div>
                <p className="font-medium">Last Date for Fee Payment</p>
                <p className="text-sm text-gray-500">Seats are filled on a first-paid, first-allotment basis.</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="text-blue-500" /> Important Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex gap-2">
            <AlertCircle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
            <p><strong>First-paid, First-allotment:</strong> The number of seats in both AC & Non-AC buses will be filled on a first-paid, first-allotment basis.</p>
          </div>
          <div className="flex gap-2">
            <AlertCircle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
            <p><strong>Boarding Point Importance:</strong> Kindly provide importance to your boarding point, since the route may change based on the final strength.</p>
          </div>
          <div className="flex gap-2">
            <AlertCircle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
            <p><strong>Afternoon Shuttles:</strong> Shuttle service buses will be made available till Alandur metro, Velachery, Tambaram & Sholinganallur. AC bus fee paid students will be provided with AC bus shuttle services in the afternoon.</p>
          </div>
          <div className="flex gap-2">
            <AlertCircle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
            <p><strong>Summer Semester:</strong> The summer semester fee (May '27 - June '27) will be shared via a separate mail in April '27.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusFeesDisplay;
