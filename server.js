 
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { searchProduct } = require("./search-product");

const app = express();

const PORT = process.env.PORT || 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());



// ==========================================
// TEST HTML PAGE
// ==========================================

app.get("/test", (req, res) => {

    res.sendFile(
        path.join(__dirname, "test.html")
    );

});



// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {

  res.json({
    success: true,
    message: "Mind Heal API is running"
  });

});


 

// ==========================================
// CHAT API
// ==========================================

app.post("/api/mind-heal/chat", async (req, res) => {

  try {

    const { question } = req.body;


    // Validate question

    if (
      !question ||
      typeof question !== "string" ||
      !question.trim()
    ) {

      return res.status(400).json({

        success: false,

        message: "Question is required"

      });

    }


    console.log(
      "\n\n========================================"
    );

    console.log(
      "NEW API REQUEST"
    );

    console.log(
      "========================================"
    );


    // ==========================================
    // YOUR EXISTING SEARCH
    // ==========================================

    const result =
      await searchProduct(
        question.trim()
      );


    // ==========================================
    // RESPONSE
    // ==========================================

    return res.json({

      success: true,

      question: question.trim(),

      answer: result.answer,

      products: result.products

    });

  }

  catch (error) {
    console.error("\n===== API ERROR =====");
    console.error("MESSAGE:", error.message);
    console.error("STACK:", error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }

});


 

// ==========================================
// START SERVER
// ==========================================

/*app.listen(PORT, () => {

    console.log("\n========================================");

    console.log(
        `Mind Heal API running at http://localhost:${PORT}`
    );

    console.log(
        `Test page: http://localhost:${PORT}/test`
    );

    console.log(
        `Health: http://localhost:${PORT}/api/health`
    );

    console.log(
        `Chat API: POST http://localhost:${PORT}/api/mind-heal/chat`
    );

    console.log("========================================\n");

});
*/


// ==========================================
// START SERVER
// ==========================================

if (require.main === module) {

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {

        console.log("\n========================================");

        console.log(
            `Mind Heal API running at http://localhost:${PORT}`
        );

        console.log(
            `Test page: http://localhost:${PORT}/test`
        );

        console.log(
            `Health: http://localhost:${PORT}/api/health`
        );

        console.log(
            `Chat API: POST http://localhost:${PORT}/api/mind-heal/chat`
        );

        console.log("========================================\n");

    });

}

module.exports = app;


 
 
