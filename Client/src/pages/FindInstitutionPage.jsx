import { useState } from 'react';
import { Search, Building2, MapPin, Globe, Calendar, Users, CheckCircle, XCircle, Loader2, Filter } from 'lucide-react';

const FindInstitutionPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock data for demonstration
  const mockInstitutions = [
    {
      id: 1,
      name: "Indian Institute of Technology Delhi",
      type: "Engineering College",
      city: "New Delhi",
      state: "Delhi",
      website: "https://iitd.ac.in",
      establishedYear: 1961,
      studentsCount: 8500,
      isRegistered: true,
      registeredDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Delhi University",
      type: "University",
      city: "New Delhi",
      state: "Delhi",
      website: "https://du.ac.in",
      establishedYear: 1922,
      studentsCount: 132000,
      isRegistered: true,
      registeredDate: "2024-02-08"
    },
    {
      id: 3,
      name: "Mumbai University",
      type: "University",
      city: "Mumbai",
      state: "Maharashtra",
      website: "https://mu.ac.in",
      establishedYear: 1857,
      studentsCount: 549432,
      isRegistered: false,
      registeredDate: null
    },
    {
      id: 4,
      name: "Rajasthan Technical University",
      type: "Technical Institute",
      city: "Kota",
      state: "Rajasthan",
      website: "https://rtu.ac.in",
      establishedYear: 2006,
      studentsCount: 350000,
      isRegistered: true,
      registeredDate: "2024-03-12"
    },
    {
      id: 5,
      name: "Jaipur Engineering College",
      type: "Engineering College",
      city: "Jaipur",
      state: "Rajasthan",
      website: "https://jecjaip.ac.in",
      establishedYear: 2000,
      studentsCount: 4500,
      isRegistered: false,
      registeredDate: null
    }
  ];

  const stateOptions = [
    'All States', 'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const typeOptions = [
    'All Types', 'University', 'Engineering College', 'Business School', 'Medical College', 
    'Arts & Science College', 'Technical Institute', 'Polytechnic', 'Other'
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedState && !selectedType) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Filter mock data based on search criteria
      let filtered = mockInstitutions.filter(institution => {
        const matchesQuery = !searchQuery.trim() || 
          institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          institution.city.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesState = !selectedState || selectedState === 'All States' || 
          institution.state === selectedState;
        
        const matchesType = !selectedType || selectedType === 'All Types' || 
          institution.type === selectedType;
        
        return matchesQuery && matchesState && matchesType;
      });
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedType('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const InstitutionCard = ({ institution }) => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-full ${institution.isRegistered ? 'bg-green-600/20' : 'bg-slate-600/20'}`}>
            <Building2 className={`w-6 h-6 ${institution.isRegistered ? 'text-green-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{institution.name}</h3>
            <p className="text-slate-400 text-sm">{institution.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {institution.isRegistered ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium text-sm">Registered</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium text-sm">Not Registered</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{institution.city}, {institution.state}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm">Est. {institution.establishedYear}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{institution.studentsCount.toLocaleString()} students</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Globe className="w-4 h-4 text-slate-400" />
          <a href={institution.website} target="_blank" rel="noopener noreferrer" 
             className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Visit Website
          </a>
        </div>
      </div>

      {institution.isRegistered ? (
        <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-3">
          <p className="text-green-400 text-sm">
            ✅ This institution is registered on our platform since {new Date(institution.registeredDate).toLocaleDateString()}. 
            Students can apply for placements through their institutional portal.
          </p>
        </div>
      ) : (
        <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3">
          <p className="text-red-400 text-sm mb-2">
            ❌ This institution is not yet registered on our platform.
          </p>
          <p className="text-slate-300 text-sm">
            Institution administrators can <span className="text-blue-400">register here</span> to enable placement services for their students.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="bg-blue-600/20 p-3 rounded-full">
              <Search className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Find Your Institution</h1>
              <p className="text-slate-400">Check if your institution is registered on our placement platform</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Search by Institution Name or City
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., IIT Delhi, Mumbai University, Jaipur..."
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  <Filter className="inline w-4 h-4 mr-1" />
                  Filter by State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {stateOptions.map(state => (
                    <option key={state} value={state === 'All States' ? '' : state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  <Filter className="inline w-4 h-4 mr-1" />
                  Filter by Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {typeOptions.map(type => (
                    <option key={type} value={type === 'All Types' ? '' : type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search Institutions
                  </>
                )}
              </button>
              
              {hasSearched && (
                <button
                  onClick={resetSearch}
                  className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Search Results ({searchResults.length} found)
              </h2>
              
              {searchResults.length > 0 && (
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-slate-300">Registered ({searchResults.filter(i => i.isRegistered).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-slate-300">Not Registered ({searchResults.filter(i => !i.isRegistered).length})</span>
                  </div>
                </div>
              )}
            </div>

            {/* Results List */}
            {searchResults.length > 0 ? (
              <div className="grid gap-6">
                {searchResults.map(institution => (
                  <InstitutionCard key={institution.id} institution={institution} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
                <div className="bg-slate-600/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Institutions Found</h3>
                <p className="text-slate-400 mb-4">
                  We couldn't find any institutions matching your search criteria.
                </p>
                <div className="text-left bg-slate-700/50 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-slate-300 text-sm mb-2">Try:</p>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>• Using different keywords</li>
                    <li>• Checking your spelling</li>
                    <li>• Using broader search terms</li>
                    <li>• Adjusting your filters</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Initial State - Before any search */}
        {!hasSearched && (
          <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
            <div className="bg-blue-600/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Discover Registered Institutions</h3>
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
              Use the search above to find out if your institution is registered on our placement platform. 
              You can search by name, filter by state and type, or browse through our comprehensive database.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <h4 className="font-medium text-white text-sm mb-1">Registered Institutions</h4>
                <p className="text-slate-400 text-xs">Students can apply for placements</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <h4 className="font-medium text-white text-sm mb-1">Not Yet Registered</h4>
                <p className="text-slate-400 text-xs">Institution can register to join</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <Search className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <h4 className="font-medium text-white text-sm mb-1">Easy Search</h4>
                <p className="text-slate-400 text-xs">Find institutions quickly</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindInstitutionPage;