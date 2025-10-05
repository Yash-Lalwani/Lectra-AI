import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Clock,
  User,
  Calendar,
  Download,
  FileText,
} from "lucide-react";

const LectureNotes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lecture, setLecture] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user.role !== "student") {
      navigate("/dashboard");
      return;
    }
    fetchLectureNotes();
  }, [id, user.role, navigate]);

  const fetchLectureNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/lectures/${id}/notes`);
      setLecture(response.data.lecture);
      setNotes(response.data.notes);
    } catch (err) {
      console.error("Error fetching lecture notes:", err);
      setError(err.response?.data?.message || "Failed to fetch lecture notes");
      toast.error(
        err.response?.data?.message || "Failed to fetch lecture notes"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadNotes = () => {
    if (notes.length === 0) {
      toast.error("No notes available to download");
      return;
    }

    // Create a text file with all notes
    const notesText = notes
      .map((note, index) => {
        return `Note ${index + 1} (Slide ${note.slideNumber} - ${new Date(
          note.timestamp
        ).toLocaleString()}):\n${note.content}\n\n`;
      })
      .join("");

    const blob = new Blob([notesText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${lecture.title}-lecture-notes.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Notes downloaded successfully!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading lecture notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-700">Lecture not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {lecture.title}
              </h1>
              <p className="text-gray-600">Lecture Notes</p>
            </div>
          </div>
          <button
            onClick={downloadNotes}
            disabled={notes.length === 0}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Notes
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Lecture Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Lecture Information
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Teacher</p>
                <p className="font-medium">
                  {lecture.teacher.firstName} {lecture.teacher.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {new Date(lecture.startTime).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">
                  {lecture.endTime
                    ? `${Math.round(
                        (lecture.endTime - lecture.startTime) / 60000
                      )} minutes`
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="font-medium">
                  {notes.length} note{notes.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Lecture Notes
          </h2>

          {notes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No notes available for this lecture.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Notes may not have been generated during the lecture.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {notes.map((note, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Note {index + 1}
                      </span>
                      <span>Slide {note.slideNumber}</span>
                      <span>{new Date(note.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {note.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LectureNotes;
