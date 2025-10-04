const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const puppeteer = require("puppeteer");
const Lecture = require("../models/Lecture");
const geminiService = require("../services/geminiService");
const { requireTeacher } = require("../middleware/auth");

const router = express.Router();

// Generate and download lecture summary PDF
router.post("/lecture/:id/summary", requireTeacher, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (!lecture.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Generate summary using Gemini if not already generated
    let summary = lecture.summary;
    if (!summary) {
      const summaryResult = await geminiService.generateSummary(
        lecture.transcript
      );
      if (summaryResult.success) {
        summary = summaryResult.summary;
        lecture.summary = summary;
        await lecture.save();
      } else {
        summary = "Summary generation failed. Please try again.";
      }
    }

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Lecture Summary: ${lecture.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .lecture-title {
            font-size: 28px;
            color: #007bff;
            margin-bottom: 10px;
          }
          .lecture-info {
            color: #666;
            font-size: 14px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 20px;
            color: #007bff;
            margin-bottom: 15px;
            border-left: 4px solid #007bff;
            padding-left: 15px;
          }
          .notes-content {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .summary-content {
            background-color: #e3f2fd;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .timestamp {
            font-size: 12px;
            color: #666;
            font-style: italic;
          }
          .page-break {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="lecture-title">${lecture.title}</h1>
          <div class="lecture-info">
            <p>Teacher: ${req.user.firstName} ${req.user.lastName}</p>
            <p>Date: ${new Date(lecture.startTime).toLocaleDateString()}</p>
            <p>Duration: ${
              lecture.endTime
                ? Math.round((lecture.endTime - lecture.startTime) / 60000)
                : "N/A"
            } minutes</p>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Lecture Notes</h2>
          <div class="notes-content">
            ${lecture.notes
              .map(
                (note) => `
              <div style="margin-bottom: 15px;">
                ${note.content}
                <div class="timestamp">Slide ${note.slideNumber} - ${new Date(
                  note.timestamp
                ).toLocaleTimeString()}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Summary</h2>
          <div class="summary-content">
            ${summary.replace(/\n/g, "<br>")}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Full Transcript</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
            ${lecture.transcript.replace(/\n/g, "<br>")}
          </div>
        </div>
      </body>
      </html>
    `;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    await browser.close();

    // Save PDF to file system
    const filename = `lecture-${lecture._id}-${Date.now()}.pdf`;
    const pdfPath = path.join(process.env.PDF_PATH || "./pdfs", filename);

    // Ensure directory exists
    await fs.mkdir(path.dirname(pdfPath), { recursive: true });
    await fs.writeFile(pdfPath, pdfBuffer);

    // Update lecture with PDF path
    lecture.pdfPath = `/files/${filename}`;
    await lecture.save();

    res.json({
      message: "PDF generated successfully",
      downloadUrl: lecture.pdfPath,
      filename,
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ message: "Server error generating PDF" });
  }
});

// Generate quiz PDF
router.post("/quiz/:id/pdf", requireTeacher, async (req, res) => {
  try {
    const Quiz = require("../models/Quiz");
    const quiz = await Quiz.findById(req.params.id)
      .populate("lecture", "title")
      .populate("responses.student", "firstName lastName email");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (!quiz.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Create HTML content for quiz PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quiz Results: ${quiz.question}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .quiz-title {
            font-size: 24px;
            color: #007bff;
            margin-bottom: 10px;
          }
          .quiz-info {
            color: #666;
            font-size: 14px;
          }
          .question {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #007bff;
          }
          .options {
            margin: 15px 0;
          }
          .option {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .correct-option {
            background-color: #d4edda;
            color: #155724;
            padding: 5px 10px;
            border-radius: 3px;
          }
          .results {
            background-color: #e3f2fd;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .responses {
            margin-top: 20px;
          }
          .response-item {
            background-color: #f5f5f5;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="quiz-title">Quiz Results</h1>
          <div class="quiz-info">
            <p>Lecture: ${quiz.lecture.title}</p>
            <p>Type: ${quiz.type}</p>
            <p>Created: ${new Date(quiz.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div class="question">
          <h3>Question:</h3>
          <p>${quiz.question}</p>
          
          <div class="options">
            <h4>Options:</h4>
            ${quiz.options
              .map(
                (option, index) => `
              <div class="option">
                ${String.fromCharCode(65 + index)}. ${option.text}
                ${
                  quiz.type === "quiz" && index === quiz.correctAnswer
                    ? '<span class="correct-option">(Correct Answer)</span>'
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="results">
          <h3>Results Summary:</h3>
          <p><strong>Total Responses:</strong> ${
            quiz.results.totalResponses
          }</p>
          ${
            quiz.type === "quiz"
              ? `<p><strong>Correct Responses:</strong> ${quiz.results.correctResponses}</p>`
              : ""
          }
          
          <h4>Response Distribution:</h4>
          ${quiz.results.optionCounts
            .map(
              (count, index) => `
            <p>${String.fromCharCode(65 + index)}: ${count.count} responses</p>
          `
            )
            .join("")}
        </div>

        ${
          quiz.responses.length > 0
            ? `
          <div class="responses">
            <h3>Individual Responses:</h3>
            ${quiz.responses
              .map(
                (response) => `
              <div class="response-item">
                <strong>${response.student.firstName} ${
                  response.student.lastName
                }</strong> 
                - Selected: ${String.fromCharCode(65 + response.selectedOption)}
                <span style="float: right; color: #666; font-size: 12px;">
                  ${new Date(response.timestamp).toLocaleTimeString()}
                </span>
              </div>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }
      </body>
      </html>
    `;

    // Generate PDF
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    await browser.close();

    // Save PDF
    const filename = `quiz-${quiz._id}-${Date.now()}.pdf`;
    const pdfPath = path.join(process.env.PDF_PATH || "./pdfs", filename);

    await fs.mkdir(path.dirname(pdfPath), { recursive: true });
    await fs.writeFile(pdfPath, pdfBuffer);

    res.json({
      message: "Quiz PDF generated successfully",
      downloadUrl: `/files/${filename}`,
      filename,
    });
  } catch (error) {
    console.error("Quiz PDF generation error:", error);
    res.status(500).json({ message: "Server error generating quiz PDF" });
  }
});

// Download file
router.get("/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.env.PDF_PATH || "./pdfs", filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ message: "File not found" });
    }

    // Set appropriate headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    // Stream the file
    const fileStream = require("fs").createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("File download error:", error);
    res.status(500).json({ message: "Server error downloading file" });
  }
});

module.exports = router;
