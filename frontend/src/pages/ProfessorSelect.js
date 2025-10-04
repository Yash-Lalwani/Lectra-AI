import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User, BookOpen } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const ProfessorSelect = () => {
  const [professorName, setProfessorName] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if not a student
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "teacher") {
      navigate("/dashboard");
    } else if (user.professorName) {
      // Pre-fill current professor if changing
      setProfessorName(user.professorName);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!professorName.trim()) {
      toast.error("Please enter professor name");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.patch("/api/auth/update-professor", {
        professorName: professorName.trim(),
      });

      if (response.data.success) {
        updateUser({ professorName: professorName.trim() });
        toast.success(user?.professorName ? "Professor changed!" : "Professor saved!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error updating professor:", error);
      toast.error(error.response?.data?.message || "Failed to update professor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <BookOpen className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {user?.professorName ? "Change Your Professor" : "Enter Professor Name"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {user?.professorName
              ? "Enter a different professor name to view their lectures"
              : "Enter your professor's name to view their lectures"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="professorName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Professor Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="professorName"
                name="professorName"
                type="text"
                required
                value={professorName}
                onChange={(e) => setProfessorName(e.target.value)}
                className="input pl-10"
                placeholder="e.g., Dr. Smith or John Smith"
                autoFocus
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              You will only see lectures from this professor
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : user?.professorName ? (
                "Update Professor"
              ) : (
                "Continue to Dashboard"
              )}
            </button>

            {user?.professorName && (
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessorSelect;
