import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { Search, User, BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";

const ProfessorSelection = () => {
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfessors();
  }, []);

  useEffect(() => {
    // Filter professors based on search query
    if (searchQuery.trim() === "") {
      setFilteredProfessors(professors);
    } else {
      const filtered = professors.filter((prof) => {
        const fullName = `${prof.firstName} ${prof.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      });
      setFilteredProfessors(filtered);
    }
  }, [searchQuery, professors]);

  const fetchProfessors = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/auth/professors");
      setProfessors(response.data);
      setFilteredProfessors(response.data);
    } catch (error) {
      console.error("Error fetching professors:", error);
      toast.error("Failed to load professors");
    } finally {
      setLoading(false);
    }
  };

  const selectProfessor = (professorId) => {
    // Navigate to dashboard with selected professor
    navigate(`/dashboard?professorId=${professorId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Lectra
                </h1>
                <p className="text-xs text-gray-600 font-medium">AI-Powered Learning Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
              <div className="bg-primary-100 p-2 rounded-full">
                <User className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-purple-600 rounded-3xl mb-6 shadow-xl">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Select Your Professor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a professor to view their lectures and course materials
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by professor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm text-lg"
            />
          </div>
        </div>

        {/* Professors List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredProfessors.length === 0 ? (
          <div className="text-center py-20">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery ? "No professors found matching your search" : "No professors available"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredProfessors.map((professor) => (
              <button
                key={professor._id}
                onClick={() => selectProfessor(professor._id)}
                className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:border-primary-300 transition-all transform hover:-translate-y-1 text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-primary-100 to-purple-100 p-4 rounded-xl group-hover:from-primary-200 group-hover:to-purple-200 transition-colors">
                      <User className="h-8 w-8 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {professor.firstName} {professor.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {professor.email}
                      </p>
                      {professor.lectureCount !== undefined && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {professor.lectureCount} {professor.lectureCount === 1 ? 'lecture' : 'lectures'}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Lectra. Empowering education with AI technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProfessorSelection;
