import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminPanel() {
  const families = useQuery(api.families.getAllFamilies);
  const weddingDetails = useQuery(api.wedding.getWeddingDetails);
  const createFamily = useMutation(api.families.createFamily);
  const updateWeddingDetails = useMutation(api.wedding.updateWeddingDetails);
  const importFamiliesFromCSV = useMutation(api.families.importFamiliesFromCSV);
  const addGuestToFamily = useMutation(api.families.addGuestToFamily);
  const removeGuestFromFamily = useMutation(api.families.removeGuestFromFamily);

  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [showEditWedding, setShowEditWedding] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showQRExport, setShowQRExport] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [csvData, setCsvData] = useState('');
  const [qrPerPage, setQrPerPage] = useState(6);
  
  const [newFamily, setNewFamily] = useState({
    familyName: '',
    contactEmail: '',
    guests: [{ firstName: '', lastName: '', isChild: false }],
  });

  const [newGuest, setNewGuest] = useState({
    firstName: '',
    lastName: '',
    isChild: false,
  });

  const [editWedding, setEditWedding] = useState({
    brideName: '',
    groomName: '',
    weddingDate: '',
    venue: '',
    venueAddress: '',
    ceremonyTime: '',
    receptionTime: '',
    dressCode: '',
    additionalInfo: '',
  });

  // Initialize edit form when wedding details load
  useState(() => {
    if (weddingDetails && !editWedding.brideName) {
      setEditWedding({
        brideName: weddingDetails.brideName,
        groomName: weddingDetails.groomName,
        weddingDate: weddingDetails.weddingDate,
        venue: weddingDetails.venue,
        venueAddress: weddingDetails.venueAddress,
        ceremonyTime: weddingDetails.ceremonyTime,
        receptionTime: weddingDetails.receptionTime,
        dressCode: weddingDetails.dressCode || '',
        additionalInfo: weddingDetails.additionalInfo || '',
      });
    }
  });

  if (!families || !weddingDetails) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  const totalGuests = families.reduce((sum, family) => sum + family.totalGuests, 0);
  const totalAttending = families.reduce((sum, family) => sum + family.attendingCount, 0);
  const totalNotAttending = families.reduce((sum, family) => sum + family.notAttendingCount, 0);
  const totalPending = families.reduce((sum, family) => sum + family.pendingCount, 0);
  const rsvpSubmitted = families.filter(f => f.rsvpSubmitted).length;

  const addGuest = () => {
    setNewFamily(prev => ({
      ...prev,
      guests: [...prev.guests, { firstName: '', lastName: '', isChild: false }],
    }));
  };

  const removeGuest = (index: number) => {
    setNewFamily(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index),
    }));
  };

  const updateGuest = (index: number, field: string, value: any) => {
    setNewFamily(prev => ({
      ...prev,
      guests: prev.guests.map((guest, i) => 
        i === index ? { ...guest, [field]: value } : guest
      ),
    }));
  };

  const handleCreateFamily = async () => {
    if (!newFamily.familyName || newFamily.guests.some(g => !g.firstName || !g.lastName)) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const result = await createFamily(newFamily);
      toast.success(`Family created with code: ${result.uniqueCode}`);
      setNewFamily({
        familyName: '',
        contactEmail: '',
        guests: [{ firstName: '', lastName: '', isChild: false }],
      });
      setShowCreateFamily(false);
    } catch (error) {
      toast.error("Failed to create family");
    }
  };

  const handleUpdateWedding = async () => {
    try {
      await updateWeddingDetails(editWedding);
      toast.success("Wedding details updated successfully");
      setShowEditWedding(false);
    } catch (error) {
      toast.error("Failed to update wedding details");
    }
  };

  const handleCSVImport = async () => {
    if (!csvData.trim()) {
      toast.error("Please paste CSV data");
      return;
    }

    try {
      const result = await importFamiliesFromCSV({ csvData });
      toast.success(`Successfully imported ${result.familiesCreated} families with ${result.guestsCreated} guests`);
      setCsvData('');
      setShowCSVImport(false);
    } catch (error) {
      toast.error("Failed to import CSV data. Please check the format.");
    }
  };

  const handleAddGuest = async () => {
    if (!newGuest.firstName || !newGuest.lastName || !selectedFamilyId) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addGuestToFamily({
        familyId: selectedFamilyId as any,
        guest: newGuest,
      });
      toast.success("Guest added successfully");
      setNewGuest({ firstName: '', lastName: '', isChild: false });
      setShowAddGuest(false);
      setSelectedFamilyId('');
    } catch (error) {
      toast.error("Failed to add guest");
    }
  };

  const handleRemoveGuest = async (guestId: string) => {
    if (confirm("Are you sure you want to remove this guest?")) {
      try {
        await removeGuestFromFamily({ guestId: guestId as any });
        toast.success("Guest removed successfully");
      } catch (error) {
        toast.error("Failed to remove guest");
      }
    }
  };

  const generateQRUrl = (code: string) => {
    const baseUrl = window.location.origin;
    const repoBase = "/RSVP"; // <-- add your repo name here
    return `${baseUrl}${repoBase}/?family=${code}`;
  };

  const generateQRCode = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
  };

  const handleQRExport = () => {
    // Calculate grid columns based on QR codes per page
    const getGridColumns = (perPage: number) => {
      if (perPage <= 1) return 1;
      if (perPage <= 4) return 2;
      if (perPage <= 9) return 3;
      if (perPage <= 16) return 4;
      return 5;
    };

    const gridCols = getGridColumns(qrPerPage);
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Wedding RSVP QR Codes</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 10px; background: white; }
    .header { text-align: center; margin-bottom: 5px; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
    .qr-grid { display: grid; grid-template-columns: repeat(${gridCols}, 1fr); gap: 5px; }
    .qr-item { text-align: center; border: 1px solid #ddd; padding: 5px; border-radius: 8px; background: white; page-break-inside: avoid; }
    .qr-item h3 { margin: 0 0 10px 0; font-size: ${qrPerPage > 16 ? '12px' : '16px'}; color: #333; }
    .qr-item img { margin: 10px 0; width: 150px; height: 150px; }
    .qr-code { font-size: ${qrPerPage > 16 ? '10px' : '12px'}; color: #666; font-family: monospace; margin-top: 10px; word-break: break-all; }
    @media print { 
      body { margin: 10px; } 
      .qr-grid { gap: 10px; } 
      .qr-item { padding: 10px; } 
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>Wedding RSVP QR Codes</h1>
  </div>
  <div class="qr-grid">
    ${families.map((family) => `
      <div class="qr-item">
        <h3>${family.familyName}</h3>
        <img src="${generateQRCode(generateQRUrl(family.uniqueCode))}" alt="QR Code for ${family.familyName}" />
        <div class="qr-code">${family.uniqueCode}</div>
      </div>
    `).join('')}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 1500);
    };
  </script>
</body>
</html>`;

    // Try to open in new window first
    try {
      const printWindow = window.open('', '_blank', 'width=1000,height=800');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        toast.success('QR codes opened in new window for printing');
      } else {
        throw new Error('Popup blocked');
      }
    } catch (error) {
      // Fallback: create downloadable HTML file
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'wedding-qr-codes.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('QR codes downloaded as HTML file. Open it in your browser to print.');
    }
    
    setShowQRExport(false);
  };

  const csvTemplate = `Family Name,Contact Email,Guest First Name,Guest Last Name,Is Child
The Johnson Family,johnson@email.com,Robert,Johnson,false
The Johnson Family,johnson@email.com,Linda,Johnson,false
The Johnson Family,johnson@email.com,Emma,Johnson,true
The Smith Family,smith@email.com,David,Smith,false
The Smith Family,smith@email.com,Jennifer,Smith,false`;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Total Families</h3>
          <p className="text-2xl sm:text-3xl font-bold text-rose-600">{families.length}</p>
          <p className="text-xs sm:text-sm text-gray-600">{rsvpSubmitted} responded</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Total Guests</h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{totalGuests}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Attending</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{totalAttending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Not Attending</h3>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">{totalNotAttending}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setShowCreateFamily(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Add Family
        </button>
        <button
          onClick={() => setShowCSVImport(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Import CSV
        </button>
        <button
          onClick={() => setShowAddGuest(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Add Guest
        </button>
        <button
          onClick={() => setShowQRExport(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Export QR Codes
        </button>
        <button
          onClick={() => setShowEditWedding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Edit Wedding
        </button>
      </div>

      {/* QR Export Modal */}
      {showQRExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Export QR Codes</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">QR Codes per page</label>
                <select
                  value={qrPerPage}
                  onChange={(e) => setQrPerPage(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value={1}>1 per page</option>
                  <option value={2}>2 per page</option>
                  <option value={4}>4 per page</option>
                  <option value={6}>6 per page</option>
                  <option value={8}>8 per page</option>
                  <option value={9}>9 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={16}>16 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={25}>25 per page</option>
                </select>
              </div>
              
              <p className="text-sm text-gray-600">
                This will generate a printable page with QR codes for all {families.length} families.
                If popups are blocked, it will download an HTML file instead.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button
                onClick={() => setShowQRExport(false)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleQRExport}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
              >
                Generate & Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCSVImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Import Families from CSV</h2>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">CSV Format Required:</h3>
              <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto">
                <pre>{csvTemplate}</pre>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                • Each row represents one guest<br/>
                • Families with the same "Family Name" will be grouped together<br/>
                • "Is Child" should be "true" or "false"<br/>
                • Contact Email is optional but recommended
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Paste your CSV data:</label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                rows={10}
                placeholder="Paste your CSV data here..."
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowCSVImport(false)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCSVImport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
              >
                Import CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Guest to Family</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Family</label>
                <select
                  value={selectedFamilyId}
                  onChange={(e) => setSelectedFamilyId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Choose a family...</option>
                  {families.map((family) => (
                    <option key={family._id} value={family._id}>
                      {family.familyName} ({family.totalGuests} guests)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={newGuest.firstName}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={newGuest.lastName}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              
              <div>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={newGuest.isChild}
                    onChange={(e) => setNewGuest(prev => ({ ...prev, isChild: e.target.checked }))}
                    className="mr-2"
                  />
                  Is Child
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddGuest(false);
                  setSelectedFamilyId('');
                  setNewGuest({ firstName: '', lastName: '', isChild: false });
                }}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGuest}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
              >
                Add Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Family Modal */}
      {showCreateFamily && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Add New Family</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Family Name</label>
                <input
                  type="text"
                  value={newFamily.familyName}
                  onChange={(e) => setNewFamily(prev => ({ ...prev, familyName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                  placeholder="The Smith Family"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <input
                  type="email"
                  value={newFamily.contactEmail}
                  onChange={(e) => setNewFamily(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                  placeholder="smith@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Guests</label>
                {newFamily.guests.map((guest, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2 p-2 border rounded-lg">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={guest.firstName}
                      onChange={(e) => updateGuest(index, 'firstName', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={guest.lastName}
                      onChange={(e) => updateGuest(index, 'lastName', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={guest.isChild}
                          onChange={(e) => updateGuest(index, 'isChild', e.target.checked)}
                          className="mr-1"
                        />
                        Child
                      </label>
                      {newFamily.guests.length > 1 && (
                        <button
                          onClick={() => removeGuest(index)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addGuest}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Guest
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateFamily(false)}
                className="px-4 py-2 border rounded-lg text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFamily}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm sm:text-base"
              >
                Create Family
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Wedding Details Modal */}
      {showEditWedding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Edit Wedding Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bride Name</label>
                <input
                  type="text"
                  value={editWedding.brideName}
                  onChange={(e) => setEditWedding(prev => ({ ...prev, brideName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Groom Name</label>
                <input
                  type="text"
                  value={editWedding.groomName}
                  onChange={(e) => setEditWedding(prev => ({ ...prev, groomName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Wedding Date</label>
                <input
                  type="text"
                  value={editWedding.weddingDate}
                  onChange={(e) => setEditWedding(prev => ({ ...prev, weddingDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Venue</label>
                <input
                  type="text"
                  value={editWedding.venue}
                  onChange={(e) => setEditWedding(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Venue Address</label>
                <input
                  type="text"
                  value={editWedding.venueAddress}
                  onChange={(e) => setEditWedding(prev => ({ ...prev, venueAddress: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ceremony Time</label>
                <input
                  type="text"
                  value={editWedding.ceremonyTime}
                  onChange={(e) => setEditWedding(prev => ({ ...prev, ceremonyTime: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reception Time</label>
                <input
                  type="text"
                  value={editWedding.receptionTime}
                  onChange={(e) => setEditWedding(prev => ({ ...prev, receptionTime: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dress Code</label>
                <input
                  type="text"
                  value={editWedding.dressCode}
                  onChange={(e) => setEditWedding(prev => ({ ...prev, dressCode: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Additional Info</label>
                <textarea
                  value={editWedding.additionalInfo}
                  onChange={(e) => setEditWedding(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEditWedding(false)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWedding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Update Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Families Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b">
          <h2 className="text-lg sm:text-xl font-semibold">Families & RSVPs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Family</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Guests</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {families.map((family) => (
                <tr key={family._id}>
                  <td className="px-3 sm:px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 text-sm sm:text-base">{family.familyName}</div>
                      {family.contactEmail && (
                        <div className="text-xs sm:text-sm text-gray-500 truncate">{family.contactEmail}</div>
                      )}
                      <div className="text-xs text-gray-500 sm:hidden">
                        {family.totalGuests} guests • {family.attendingCount} attending
                      </div>
                      {/* Guest list with remove buttons */}
                      <div className="mt-2 space-y-1">
                        {family.guests.map((guest) => (
                          <div key={guest._id} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            <span>
                              {guest.firstName} {guest.lastName} {guest.isChild ? '(Child)' : ''}
                            </span>
                            <button
                              onClick={() => handleRemoveGuest(guest._id)}
                              className="text-red-500 hover:text-red-700 ml-2"
                              title="Remove guest"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-mono text-gray-900">
                    {family.uniqueCode}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 hidden sm:table-cell">
                    <div className="space-y-1">
                      <div>{family.totalGuests} total</div>
                      <div className="text-xs">
                        <span className="text-green-600">{family.attendingCount}</span> / 
                        <span className="text-red-600">{family.notAttendingCount}</span> / 
                        <span className="text-gray-600">{family.pendingCount}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      family.rsvpSubmitted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {family.rsvpSubmitted ? 'Submitted' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                    <div className="flex flex-col space-y-1">
                      <a
                        href={generateQRUrl(family.uniqueCode)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View RSVP Link
                      </a>
                      <img 
                        src={generateQRCode(generateQRUrl(family.uniqueCode))} 
                        alt={`QR Code for ${family.familyName}`}
                        className="w-16 h-16"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
