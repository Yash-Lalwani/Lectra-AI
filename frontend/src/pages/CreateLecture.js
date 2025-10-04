import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, BookOpen, Calendar, Clock, Save, Plus } from "lucide-react";

const CreateLecture = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
  });
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a lecture title");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/lectures", {
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      toast.success("Lecture created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating lecture:", error);
      toast.error("Failed to create lecture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                Create New Lecture
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="card mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-primary-100">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create a New Lecture
              </h2>
              <p className="text-gray-600">
                Set up your lecture and start engaging with your students in
                real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                Lecture Details
              </h3>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Lecture Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Introduction to Machine Learning"
                  className="input"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Brief description of what this lecture will cover..."
                  className="input resize-none"
                />
              </div>

              {/* Scheduled Date */}
              <div>
                <label
                  htmlFor="scheduledDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Scheduled Date (Optional)
                </label>
                <input
                  type="date"
                  id="scheduledDate"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="input"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Scheduled Time */}
              <div>
                <label
                  htmlFor="scheduledTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Scheduled Time (Optional)
                </label>
                <input
                  type="time"
                  id="scheduledTime"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                What You'll Get
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Real-time Notes</h4>
                  <p className="text-sm text-gray-600">
                    AI-powered note generation from your speech
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Live Polling</h4>
                  <p className="text-sm text-gray-600">
                    Create polls and quizzes with voice commands
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Voice Commands</h4>
                  <p className="text-sm text-gray-600">
                    Control slides and activities with your voice
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Save className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Auto Summary</h4>
                  <p className="text-sm text-gray-600">
                    Generate PDF summaries and quiz questions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Commands Help */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-blue-900">
                Voice Commands
              </h3>
            </div>

            <div className="space-y-3">
              <p className="text-blue-800">
                Once you start your lecture, you can use these voice commands:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="p-2 bg-white rounded border">
                    <code className="text-sm text-blue-900">
                      "AI open a new slide"
                    </code>
                    <p className="text-xs text-blue-700 mt-1">
                      Create a new slide
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <code className="text-sm text-blue-900">
                      "AI create a poll"
                    </code>
                    <p className="text-xs text-blue-700 mt-1">
                      Start a live poll
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-white rounded border">
                    <code className="text-sm text-blue-900">
                      "AI create a quiz"
                    </code>
                    <p className="text-xs text-blue-700 mt-1">
                      Start a quiz question
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <code className="text-sm text-blue-900">
                      "AI end lecture"
                    </code>
                    <p className="text-xs text-blue-700 mt-1">
                      End the lecture
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{loading ? "Creating..." : "Create Lecture"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLecture;
