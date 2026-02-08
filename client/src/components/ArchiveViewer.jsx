import { useState } from "react";
import toast from "react-hot-toast";

const ArchiveViewer = () => {
  const [archiveData, setArchiveData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast.error("Please upload a valid JSON archive file");
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate archive structure
      if (!data.exportDate || !data.bookings || !Array.isArray(data.bookings)) {
        toast.error("Invalid archive file format");
        return;
      }

      setArchiveData(data);
      toast.success(`Loaded ${data.totalBookings} bookings from archive`);
    } catch (error) {
      toast.error("Failed to parse archive file");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = archiveData?.bookings.filter((booking) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      booking.customerId?.name?.toLowerCase().includes(term) ||
      booking.customerId?.phoneNumber?.includes(term) ||
      booking.driverId?.name?.toLowerCase().includes(term) ||
      booking.pickupLocation?.toLowerCase().includes(term) ||
      booking.dropoffLocation?.toLowerCase().includes(term) ||
      booking.status?.toLowerCase().includes(term)
    );
  });

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="card border-l-4 border-purple-500">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <span className="text-2xl mr-2">📂</span>
        Archive Viewer
      </h3>
      <p className="text-gray-600 mb-4">
        Upload a previously downloaded archive JSON file to view old booking records.
      </p>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block mb-2">
          <span className="sr-only">Choose archive file</span>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            disabled={loading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
          />
        </label>
      </div>

      {/* Archive Metadata */}
      {archiveData && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Export Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(archiveData.exportDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="font-semibold text-gray-800">{archiveData.totalBookings}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cutoff Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(archiveData.cutoffDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            {archiveData.automated && (
              <p className="mt-2 text-sm text-purple-700">
                ⚙️ Automatically archived on {archiveData.monthYear}
              </p>
            )}
          </div>

          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search by customer, driver, location, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-600">
            Showing {filteredBookings.length} of {archiveData.totalBookings} bookings
          </p>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Driver
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Route
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {booking.customerId?.name || "N/A"}
                      </div>
                      <div className="text-gray-500">{booking.customerId?.phoneNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {booking.driverId ? (
                        <>
                          <div className="font-medium text-gray-900">{booking.driverId.name}</div>
                          <div className="text-gray-500">
                            {booking.driverId.carType} - {booking.driverId.carNumber}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="text-gray-900">{booking.pickupLocation}</div>
                      <div className="text-gray-500">→ {booking.dropoffLocation}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ₦{booking.totalAmount?.toLocaleString() || "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && searchTerm && (
            <p className="text-center text-gray-500 py-4">
              No bookings found matching "{searchTerm}"
            </p>
          )}
        </div>
      )}

      {!archiveData && !loading && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <span className="text-4xl mb-2 block">📂</span>
          <p>Upload an archive file to view bookings</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading archive data...</p>
        </div>
      )}
    </div>
  );
};

export default ArchiveViewer;
