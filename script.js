// Global variables to store student data
let studentData = {
    profile: null,
    gpa: null,
    sat: [],
    psat: null,
    nwea: [],
    placement: null,
    previousSchool: null,
    ap: []
};

let activeTab = 'overview';

// Function to search and display student data
async function searchStudent() {
    const studentNumber = document.getElementById("studentNumber").value;
    
    if (!studentNumber) {
        alert("Please enter a student ID number");
        return;
    }
    
    // Reset previous data
    resetStudentData();
    
    try {
        // Load all relevant data
        await Promise.all([
            loadGPAData(studentNumber),
            loadSATData(studentNumber),
            loadPSATData(studentNumber),
            loadAPData(studentNumber),
            loadPlacementExamData(studentNumber),
            loadPreviousSchoolData(studentNumber),
            loadNWEAData(studentNumber)
        ]);
        
        displayStudentInfo(studentNumber);
        
        // Show tabs and default tab content
        document.getElementById("dataTabs").classList.remove("hidden");
        document.getElementById("tabContent").classList.remove("hidden");
        showTab('overview');
    } catch (error) {
        console.error("Error loading student data:", error);
        document.getElementById("studentInfo").innerHTML = `<p>Error loading student data: ${error.message}</p>`;
        document.getElementById("studentInfo").classList.remove("hidden");
    }
}

// Reset all student data
function resetStudentData() {
    studentData = {
        profile: null,
        gpa: null,
        sat: [],
        psat: null,
        nwea: [],
        placement: null,
        previousSchool: null,
        ap: []
    };
    
    document.getElementById("studentInfo").classList.add("hidden");
    document.getElementById("dataTabs").classList.add("hidden");
    document.getElementById("tabContent").classList.add("hidden");
}

// Load GPA data
async function loadGPAData(studentNumber) {
    try {
        const response = await fetch("data_exports/GPAs_data.json");
        const data = await response.json();
        
        // Find the student by student number
        studentData.gpa = data.find(student => student.Student_Number == studentNumber || student.STUDENT_NUMBER == studentNumber);
        
        if (studentData.gpa) {
            studentData.profile = {
                studentNumber: studentData.gpa.Student_Number || studentData.gpa.STUDENT_NUMBER,
                graduationYear: studentData.gpa.Sched_YearOfGraduation || studentData.gpa.SCHED_YEAROFGRADUATION
            };
        }
    } catch (error) {
        console.error("Error loading GPA data:", error);
    }
}

// Load SAT data
async function loadSATData(studentNumber) {
    try {
        const response = await fetch("data_exports/SAT_data.json");
        const data = await response.json();
        
        // Find all SAT scores for this student
        studentData.sat = data.filter(score => score.STUDENT_NUMBER == studentNumber);
        
        // Update profile if not set yet
        if (!studentData.profile && studentData.sat.length > 0) {
            studentData.profile = {
                studentNumber: studentData.sat[0].STUDENT_NUMBER,
                graduationYear: studentData.sat[0].SCHED_YEAROFGRADUATION
            };
        }
    } catch (error) {
        console.error("Error loading SAT data:", error);
    }
}

// Load PSAT data
async function loadPSATData(studentNumber) {
    try {
        const response = await fetch("data_exports/PSAT_data.json");
        const data = await response.json();
        
        // Find the PSAT data for this student
        studentData.psat = data.find(score => score.STUDENT_NUMBER == studentNumber);
        
        // Update profile if not set yet
        if (!studentData.profile && studentData.psat) {
            studentData.profile = {
                studentNumber: studentData.psat.STUDENT_NUMBER,
                graduationYear: null // PSAT data doesn't include graduation year
            };
        }
    } catch (error) {
        console.error("Error loading PSAT data:", error);
    }
}

// Load AP exam data
async function loadAPData(studentNumber) {
    try {
        const response = await fetch("data_exports/APs_data.json");
        const data = await response.json();
        
        // Find all AP scores for this student
        studentData.ap = data.filter(score => score.STUDENT_NUMBER == studentNumber);
        
        // Update profile if not set yet
        if (!studentData.profile && studentData.ap.length > 0) {
            studentData.profile = {
                studentNumber: studentData.ap[0].STUDENT_NUMBER,
                graduationYear: studentData.ap[0].SCHED_YEAROFGRADUATION
            };
        }
    } catch (error) {
        console.error("Error loading AP data:", error);
    }
}

// Load Placement Exam data
async function loadPlacementExamData(studentNumber) {
    try {
        const response = await fetch("data_exports/PlacementExam_data.json");
        const data = await response.json();
        
        // Find the placement exam data for this student
        studentData.placement = data.find(exam => exam.STUDENT_NUMBER == studentNumber);
        
        // Update profile if not set yet
        if (!studentData.profile && studentData.placement) {
            studentData.profile = {
                studentNumber: studentData.placement.STUDENT_NUMBER,
                graduationYear: null // Placement data doesn't include graduation year
            };
        }
    } catch (error) {
        console.error("Error loading Placement Exam data:", error);
    }
}

// Load Previous School data
async function loadPreviousSchoolData(studentNumber) {
    try {
        const response = await fetch("data_exports/PreviousSchool_data.json");
        const data = await response.json();
        
        // Find the previous school data for this student
        studentData.previousSchool = data.find(school => school.STUDENT_NUMBER == studentNumber);
        
        // Update profile if not set yet
        if (!studentData.profile && studentData.previousSchool) {
            studentData.profile = {
                studentNumber: studentData.previousSchool.STUDENT_NUMBER,
                graduationYear: null // Previous school data doesn't include graduation year
            };
        }
    } catch (error) {
        console.error("Error loading Previous School data:", error);
    }
}

// Load NWEA data
async function loadNWEAData(studentNumber) {
    try {
        const response = await fetch("data_exports/NWEA_data.json");
        const data = await response.json();
        
        // Find all NWEA scores for this student
        studentData.nwea = data.filter(score => score.StudentID == studentNumber);
    } catch (error) {
        console.error("Error loading NWEA data:", error);
    }
}

// Display student basic information
function displayStudentInfo(studentNumber) {
    const studentInfoDiv = document.getElementById("studentInfo");
    
    // Check if we have any data for this student
    if (!studentData.profile && !studentData.gpa && studentData.sat.length === 0 && 
        !studentData.psat && studentData.ap.length === 0 && !studentData.placement && 
        !studentData.previousSchool && studentData.nwea.length === 0) {
        
        studentInfoDiv.innerHTML = `<p>No data found for student ID: ${studentNumber}</p>`;
        studentInfoDiv.classList.remove("hidden");
        document.getElementById("dataTabs").classList.add("hidden");
        document.getElementById("tabContent").classList.add("hidden");
        return;
    }
    
    // Basic student info
    let html = `<h2>Student ID: ${studentNumber}</h2>`;
    
    if (studentData.profile && studentData.profile.graduationYear) {
        html += `<p><strong>Year of Graduation:</strong> ${studentData.profile.graduationYear}</p>`;
    }
    
    if (studentData.previousSchool) {
        html += `<p><strong>Previous School:</strong> ${studentData.previousSchool.PREVIOUS_SCHOOL}</p>`;
    }
    
    if (studentData.gpa && studentData.gpa.Cumulative_GPA) {
        html += `<p><strong>Cumulative GPA:</strong> ${studentData.gpa.Cumulative_GPA}</p>`;
        
        // Display the recommendation based on GPA
        const recommendation = getRecommendation(studentData.gpa.Cumulative_GPA);
        html += `<p class="recommendation"><strong>Recommendation:</strong> ${recommendation}</p>`;
    }
    
    studentInfoDiv.innerHTML = html;
    studentInfoDiv.classList.remove("hidden");
}

// Show the selected tab content
function showTab(tabName) {
    // Update active tab button
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.textContent.toLowerCase().includes(tabName.toLowerCase())) {
            button.classList.add('active');
        }
    });
    
    // Set the active tab
    activeTab = tabName;
    
    // Display tab content
    const tabContent = document.getElementById('tabContent');
    
    switch(tabName) {
        case 'overview':
            displayOverviewTab();
            break;
        case 'gpa':
            displayGPATab();
            break;
        case 'standardized':
            displayStandardizedTestsTab();
            break;
        case 'ap':
            displayAPTab();
            break;
        case 'background':
            displayBackgroundTab();
            break;
        default:
            tabContent.innerHTML = '<p>Tab content not available</p>';
    }
}

// Display Overview tab content
function displayOverviewTab() {
    const tabContent = document.getElementById('tabContent');
    let html = `<h3>Student Overview</h3>`;
    
    // GPA Summary
    if (studentData.gpa) {
        html += `
            <div class="test-score">
                <h4>GPA Summary</h4>
                <p><strong>Cumulative GPA:</strong> ${studentData.gpa.Cumulative_GPA}</p>
            </div>
        `;
    }
    
    // SAT Summary
    if (studentData.sat && studentData.sat.length > 0) {
        // Find highest total score
        const highestSAT = studentData.sat.reduce((prev, current) => 
            (prev.TOTAL > current.TOTAL) ? prev : current);
            
        html += `
            <div class="test-score">
                <h4>SAT Summary</h4>
                <p><strong>Best Score:</strong> ${highestSAT.TOTAL}</p>
                <p><strong>Math:</strong> ${highestSAT.MATH}, <strong>Reading/Writing:</strong> ${highestSAT.ERW}</p>
                <p><strong>Test Date:</strong> ${formatDate(highestSAT.TESTDATE)}</p>
            </div>
        `;
    }
    
    // AP Summary
    if (studentData.ap && studentData.ap.length > 0) {
        html += `
            <div class="test-score">
                <h4>AP Summary</h4>
                <p><strong>Number of AP Exams:</strong> ${studentData.ap.length}</p>
                <p><strong>Average Score:</strong> ${calculateAverageAPScore()}</p>
            </div>
        `;
    }
    
    tabContent.innerHTML = html;
}

// Display GPA tab content
function displayGPATab() {
    const tabContent = document.getElementById('tabContent');
    let html = `<h3>GPA Information</h3>`;
    
    if (studentData.gpa) {
        html += `
            <p><strong>Cumulative GPA:</strong> ${studentData.gpa.Cumulative_GPA}</p>
            
            <h4>GPA by Grade Level</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Grade</th>
                        <th>Semester 1</th>
                        <th>Semester 2</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Grade 9</td>
                        <td>${studentData.gpa["S1 grade=9"] || "N/A"}</td>
                        <td>${studentData.gpa["S2 grade=9"] || "N/A"}</td>
                    </tr>
                    <tr>
                        <td>Grade 10</td>
                        <td>${studentData.gpa["S1 grade=10"] || "N/A"}</td>
                        <td>${studentData.gpa["S2 grade=10"] || "N/A"}</td>
                    </tr>
                    <tr>
                        <td>Grade 11</td>
                        <td>${studentData.gpa["S1 grade=11"] || "N/A"}</td>
                        <td>${studentData.gpa["S2 grade=11"] || "N/A"}</td>
                    </tr>
                    <tr>
                        <td>Grade 12</td>
                        <td>${studentData.gpa["S1 grade=12"] || "N/A"}</td>
                        <td>${studentData.gpa["S2 grade=12"] || "N/A"}</td>
                    </tr>
                </tbody>
            </table>
        `;
    } else {
        html += `<div class="no-data">No GPA data available for this student</div>`;
    }
    
    tabContent.innerHTML = html;
}

// Display Standardized Tests tab content
function displayStandardizedTestsTab() {
    const tabContent = document.getElementById('tabContent');
    let html = `<h3>Standardized Test Scores</h3>`;
    let hasData = false;
    
    // SAT Scores
    if (studentData.sat && studentData.sat.length > 0) {
        hasData = true;
        html += `
            <h4>SAT Scores</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Test Date</th>
                        <th>Math</th>
                        <th>Reading/Writing</th>
                        <th>Total</th>
                        <th>Grade Level</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Sort by date, newest first
        const sortedSAT = studentData.sat.sort((a, b) => 
            new Date(b.TESTDATE) - new Date(a.TESTDATE));
            
        sortedSAT.forEach(score => {
            html += `
                <tr>
                    <td>${formatDate(score.TESTDATE)}</td>
                    <td>${score.MATH || "N/A"}</td>
                    <td>${score.ERW || "N/A"}</td>
                    <td>${score.TOTAL || "N/A"}</td>
                    <td>${score["Grade Level"] || "N/A"}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    // PSAT Scores
    if (studentData.psat && hasPSATScores()) {
        hasData = true;
        html += `
            <h4>PSAT Scores</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Test Date</th>
                        <th>Math</th>
                        <th>Reading/Writing</th>
                        <th>Total</th>
                        <th>Grade Level</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Check for 10th grade scores
        if (studentData.psat.NUMSCOREC10) {
            html += `
                <tr>
                    <td>${formatDate(studentData.psat.TESTDATEC10)}</td>
                    <td>${studentData.psat.NUMSCOREW10 || "N/A"}</td>
                    <td>${studentData.psat.NUMSCOREM10 || "N/A"}</td>
                    <td>${studentData.psat.NUMSCOREC10 || "N/A"}</td>
                    <td>${studentData.psat.TESTGRADEC10 || "N/A"}</td>
                </tr>
            `;
        }
        
        // Check for 11th grade scores
        if (studentData.psat.NUMSCOREC11) {
            html += `
                <tr>
                    <td>${formatDate(studentData.psat.TESTDATEC11)}</td>
                    <td>${studentData.psat.NUMSCOREW11 || "N/A"}</td>
                    <td>${studentData.psat.NUMSCOREM11 || "N/A"}</td>
                    <td>${studentData.psat.NUMSCOREC11 || "N/A"}</td>
                    <td>${studentData.psat.TESTGRADEC11 || "N/A"}</td>
                </tr>
            `;
        }
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    // Placement Exam Scores
    if (studentData.placement) {
        hasData = true;
        html += `
            <h4>Placement Exam Scores</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Test Date</th>
                        <th>Verbal</th>
                        <th>Quantitative</th>
                        <th>Reading</th>
                        <th>Math</th>
                        <th>Language</th>
                        <th>Composite</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${formatDate(studentData.placement.TESTDATE)}</td>
                        <td>${studentData.placement.VERBAL || "N/A"}</td>
                        <td>${studentData.placement.QUANT || "N/A"}</td>
                        <td>${studentData.placement.READ || "N/A"}</td>
                        <td>${studentData.placement.MATH || "N/A"}</td>
                        <td>${studentData.placement.LANG || "N/A"}</td>
                        <td>${studentData.placement.COMP || "N/A"}</td>
                    </tr>
                </tbody>
            </table>
        `;
    }
    
    // NWEA Scores
    if (studentData.nwea && studentData.nwea.length > 0) {
        hasData = true;
        html += `
            <h4>NWEA Test Scores</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Test Date</th>
                        <th>Subject</th>
                        <th>RIT Score</th>
                        <th>Percentile</th>
                        <th>Term</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Sort by date, newest first
        const sortedNWEA = studentData.nwea.sort((a, b) => 
            new Date(b.TestStartDate) - new Date(a.TestStartDate));
            
        sortedNWEA.forEach(score => {
            html += `
                <tr>
                    <td>${formatDate(score.TestStartDate)}</td>
                    <td>${score.MeasurementScale || "N/A"}</td>
                    <td>${score.TestRITScore || "N/A"}</td>
                    <td>${score.TestPercentile || "N/A"}</td>
                    <td>${score.TermName} ${score["Term Year"] || ""}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    if (!hasData) {
        html += `<div class="no-data">No standardized test scores available for this student</div>`;
    }
    
    tabContent.innerHTML = html;
}

// Display AP tab content
function displayAPTab() {
    const tabContent = document.getElementById('tabContent');
    let html = `<h3>AP Exam Scores</h3>`;
    
    if (studentData.ap && studentData.ap.length > 0) {
        html += `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Exam Name</th>
                        <th>Score</th>
                        <th>Test Date</th>
                        <th>Grade Level</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Sort by date, newest first
        const sortedAP = studentData.ap.sort((a, b) => 
            new Date(b.TEST_DATE) - new Date(a.TEST_DATE));
            
        sortedAP.forEach(exam => {
            html += `
                <tr>
                    <td>${exam.NAME || "N/A"}</td>
                    <td>${exam.NUMSCORE || "N/A"}</td>
                    <td>${formatDate(exam.TEST_DATE)}</td>
                    <td>${exam.GRADE_LEVEL || "N/A"}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    } else {
        html += `<div class="no-data">No AP exam scores available for this student</div>`;
    }
    
    tabContent.innerHTML = html;
}

// Display Background tab content
function displayBackgroundTab() {
    const tabContent = document.getElementById('tabContent');
    let html = `<h3>Student Background Information</h3>`;
    let hasData = false;
    
    // Previous School Information
    if (studentData.previousSchool) {
        hasData = true;
        html += `
            <div class="info-section">
                <h4>Previous School Information</h4>
                <p><strong>School Name:</strong> ${studentData.previousSchool.PREVIOUS_SCHOOL || "N/A"}</p>
                <p><strong>GPA from Previous School:</strong> ${studentData.previousSchool.PREVIOUS_SCHOOL_GPA || "N/A"}</p>
                <p><strong>Transfer Year:</strong> ${studentData.previousSchool.TRANSFER_YEAR || "N/A"}</p>
                <p><strong>Notes:</strong> ${studentData.previousSchool.NOTES || "None"}</p>
            </div>
        `;
    }
    
    // Placement Test Information
    if (studentData.placement) {
        hasData = true;
        html += `
            <div class="info-section">
                <h4>Placement Test Information</h4>
                <p><strong>Test Date:</strong> ${formatDate(studentData.placement.TESTDATE)}</p>
                <p><strong>Verbal:</strong> ${studentData.placement.VERBAL || "N/A"}</p>
                <p><strong>Quantitative:</strong> ${studentData.placement.QUANT || "N/A"}</p>
                <p><strong>Reading:</strong> ${studentData.placement.READ || "N/A"}</p>
                <p><strong>Math:</strong> ${studentData.placement.MATH || "N/A"}</p>
                <p><strong>Language:</strong> ${studentData.placement.LANG || "N/A"}</p>
                <p><strong>Composite:</strong> ${studentData.placement.COMP || "N/A"}</p>
            </div>
        `;
    }
    
    if (!hasData) {
        html += `<div class="no-data">No background information available for this student</div>`;
    }
    
    tabContent.innerHTML = html;
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return "N/A";
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateString;
    }
}

function calculateAverageAPScore() {
    if (!studentData.ap || studentData.ap.length === 0) return "N/A";
    
    let totalScore = 0;
    let validScoreCount = 0;
    
    studentData.ap.forEach(exam => {
        if (exam.NUMSCORE && !isNaN(exam.NUMSCORE)) {
            totalScore += parseFloat(exam.NUMSCORE);
            validScoreCount++;
        }
    });
    
    if (validScoreCount === 0) return "N/A";
    
    return (totalScore / validScoreCount).toFixed(1);
}

function hasPSATScores() {
    if (!studentData.psat) return false;
    
    return (
        studentData.psat.NUMSCOREC10 || 
        studentData.psat.NUMSCOREC11 ||
        studentData.psat.NUMSCOREW10 ||
        studentData.psat.NUMSCOREW11 ||
        studentData.psat.NUMSCOREM10 ||
        studentData.psat.NUMSCOREM11
    );
}

function getRecommendation(gpa) {
    if (!gpa || isNaN(gpa)) return "Unable to provide recommendation without GPA";
    
    const numGPA = parseFloat(gpa);
    
    if (numGPA >= 3.8) {
        return "Excellent academic standing. Consider advanced placement courses and college applications to selective institutions.";
    } else if (numGPA >= 3.5) {
        return "Strong academic performance. Well-positioned for college applications to competitive schools.";
    } else if (numGPA >= 3.0) {
        return "Good academic standing. Consider tutoring for improvement in challenging subjects.";
    } else if (numGPA >= 2.5) {
        return "Average academic performance. Recommend academic support and study skills development.";
    } else {
        return "Below average academic performance. Immediate academic intervention recommended.";
    }
}

// Event listener for page load
document.addEventListener("DOMContentLoaded", function() {
    // Add event listeners for tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName);
        });
    });
    
    // Add event listener for search button
    document.getElementById("searchButton").addEventListener("click", searchStudent);
    
    // Add event listener for Enter key in search input
    document.getElementById("studentNumber").addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            searchStudent();
        }
    });
});

// Function to export student data to CSV
function exportToCSV() {
    if (!studentData.profile) {
        alert("Please search for a student first");
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add student basic info
    csvContent += "Student Number," + (studentData.profile.studentNumber || "") + "\r\n";
    csvContent += "Graduation Year," + (studentData.profile.graduationYear || "") + "\r\n\r\n";
    
    // Add GPA data
    if (studentData.gpa) {
        csvContent += "GPA Data\r\n";
        csvContent += "Cumulative GPA," + (studentData.gpa.Cumulative_GPA || "") + "\r\n";
        csvContent += "9th Grade S1," + (studentData.gpa["S1 grade=9"] || "") + "\r\n";
        csvContent += "9th Grade S2," + (studentData.gpa["S2 grade=9"] || "") + "\r\n";
        csvContent += "10th Grade S1," + (studentData.gpa["S1 grade=10"] || "") + "\r\n";
        csvContent += "10th Grade S2," + (studentData.gpa["S2 grade=10"] || "") + "\r\n";
        csvContent += "11th Grade S1," + (studentData.gpa["S1 grade=11"] || "") + "\r\n";
        csvContent += "11th Grade S2," + (studentData.gpa["S2 grade=11"] || "") + "\r\n";
        csvContent += "12th Grade S1," + (studentData.gpa["S1 grade=12"] || "") + "\r\n";
        csvContent += "12th Grade S2," + (studentData.gpa["S2 grade=12"] || "") + "\r\n\r\n";
    }
    
    // Add SAT data
    if (studentData.sat && studentData.sat.length > 0) {
        csvContent += "SAT Scores\r\n";
        csvContent += "Test Date,Math,Reading/Writing,Total,Grade Level\r\n";
        
        studentData.sat.forEach(score => {
            csvContent += `${score.TESTDATE || ""},${score.MATH || ""},${score.ERW || ""},${score.TOTAL || ""},${score["Grade Level"] || ""}\r\n`;
        });
        csvContent += "\r\n";
    }
    
    // Add AP data
    if (studentData.ap && studentData.ap.length > 0) {
        csvContent += "AP Exam Scores\r\n";
        csvContent += "Exam Name,Score,Test Date,Grade Level\r\n";
        
        studentData.ap.forEach(exam => {
            csvContent += `${exam.NAME || ""},${exam.NUMSCORE || ""},${exam.TEST_DATE || ""},${exam.GRADE_LEVEL || ""}\r\n`;
        });
    }
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_${studentData.profile.studentNumber}_data.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}

// Add the export button functionality
document.addEventListener("DOMContentLoaded", function() {
    // Add export button if it exists
    const exportButton = document.getElementById("exportButton");
    if (exportButton) {
        exportButton.addEventListener("click", exportToCSV);
    }
});

// Chart objects
let currentChart = null;
let chartData = {};

// Simulated data for charts - you would load this from actual data files
chartData = {
    gpaData: {
        averageByYear: {
            labels: ["Freshman", "Sophomore", "Junior", "Senior"],
            datasets: [
                {
                    label: "Class of 2024",
                    data: [3.25, 3.31, 3.42, 3.51],
                    backgroundColor: "rgba(76, 175, 80, 0.2)",
                    borderColor: "rgba(76, 175, 80, 1)",
                    borderWidth: 2
                },
                {
                    label: "Class of 2025",
                    data: [3.27, 3.36, 3.45, null],
                    backgroundColor: "rgba(33, 150, 243, 0.2)",
                    borderColor: "rgba(33, 150, 243, 1)",
                    borderWidth: 2
                },
                {
                    label: "Class of 2026",
                    data: [3.29, 3.38, null, null],
                    backgroundColor: "rgba(255, 152, 0, 0.2)",
                    borderColor: "rgba(255, 152, 0, 1)",
                    borderWidth: 2
                },
                {
                    label: "Class of 2027",
                    data: [3.32, null, null, null],
                    backgroundColor: "rgba(156, 39, 176, 0.2)",
                    borderColor: "rgba(156, 39, 176, 1)",
                    borderWidth: 2
                }
            ]
        },
        distribution: {
            labels: ["3.75-4.0", "3.5-3.74", "3.0-3.49", "2.5-2.99", "2.0-2.49", "Below 2.0"],
            datasets: [{
                label: "GPA Distribution",
                data: [85, 120, 175, 90, 45, 25],
                backgroundColor: [
                    "rgba(76, 175, 80, 0.8)",
                    "rgba(33, 150, 243, 0.8)",
                    "rgba(255, 235, 59, 0.8)",
                    "rgba(255, 152, 0, 0.8)",
                    "rgba(255, 87, 34, 0.8)",
                    "rgba(244, 67, 54, 0.8)"
                ]
            }]
        }
    },
    satData: {
        averageScores: {
            labels: ["Class of 2024", "Class of 2025", "Class of 2026", "Class of 2027"],
            datasets: [
                {
                    label: "Math",
                    data: [580, 590, 585, 595],
                    backgroundColor: "rgba(33, 150, 243, 0.5)"
                },
                {
                    label: "Reading/Writing",
                    data: [560, 570, 575, 580],
                    backgroundColor: "rgba(76, 175, 80, 0.5)"
                }
            ]
        },
        scoreDistribution: {
            labels: ["1550-1600", "1500-1540", "1400-1490", "1300-1390", "1200-1290", "1100-1190", "1000-1090", "900-990", "Below 900"],
            datasets: [{
                label: "SAT Score Distribution",
                data: [5, 18, 42, 87, 110, 95, 65, 40, 28],
                backgroundColor: "rgba(33, 150, 243, 0.7)",
                borderColor: "rgba(33, 150, 243, 1)",
                borderWidth: 1
            }]
        }
    },
    apData: {
        scoreDistribution: {
            labels: ["Score 5", "Score 4", "Score 3", "Score 2", "Score 1"],
            datasets: [{
                label: "AP Score Distribution",
                data: [78, 124, 210, 95, 43],
                backgroundColor: [
                    "rgba(76, 175, 80, 0.8)",
                    "rgba(33, 150, 243, 0.8)",
                    "rgba(255, 235, 59, 0.8)",
                    "rgba(255, 152, 0, 0.8)",
                    "rgba(244, 67, 54, 0.8)"
                ]
            }]
        },
        subjectPerformance: {
            labels: ["Calculus AB", "Biology", "Chemistry", "Physics", "English Lang", "English Lit", "US History", "World History", "Psychology"],
            datasets: [{
                label: "Average AP Score",
                data: [3.8, 3.5, 3.2, 3.4, 3.6, 3.3, 3.1, 3.4, 3.9],
                backgroundColor: "rgba(76, 175, 80, 0.5)",
                borderColor: "rgba(76, 175, 80, 1)",
                borderWidth: 2
            }]
        }
    },
    collegeReadiness: {
        readinessIndex: {
            labels: ["Class of 2024", "Class of 2025", "Class of 2026", "Class of 2027"],
            datasets: [{
                label: "College Readiness Index",
                data: [85, 87, 82, 79],
                backgroundColor: "rgba(156, 39, 176, 0.5)",
                borderColor: "rgba(156, 39, 176, 1)",
                borderWidth: 2
            }]
        },
        readinessFactors: {
            labels: ["GPA", "SAT Scores", "AP Performance", "Course Rigor", "Extracurriculars"],
            datasets: [{
                label: "College Readiness Factors",
                data: [8.5, 7.9, 8.3, 7.7, 8.1],
                backgroundColor: [
                    "rgba(76, 175, 80, 0.7)",
                    "rgba(33, 150, 243, 0.7)",
                    "rgba(255, 152, 0, 0.7)",
                    "rgba(244, 67, 54, 0.7)",
                    "rgba(156, 39, 176, 0.7)"
                ],
                borderWidth: 1
            }]
        }
    },
    classComparison: {
        gpaComparison: {
            labels: ["2024", "2025", "2026", "2027"],
            datasets: [{
                label: "Average Cumulative GPA",
                data: [3.45, 3.38, 3.33, 3.32],
                backgroundColor: "rgba(76, 175, 80, 0.5)",
                borderColor: "rgba(76, 175, 80, 1)",
                borderWidth: 2
            }]
        },
        satComparison: {
            labels: ["2024", "2025", "2026", "2027"],
            datasets: [{
                label: "Average SAT Score",
                data: [1140, 1160, 1155, 1175],
                backgroundColor: "rgba(33, 150, 243, 0.5)",
                borderColor: "rgba(33, 150, 243, 1)",
                borderWidth: 2
            }]
        },
        apPassRateComparison: {
            labels: ["2024", "2025", "2026", "2027"],
            datasets: [{
                label: "AP Exam Pass Rate (%)",
                data: [78, 81, 76, 75],
                backgroundColor: "rgba(255, 152, 0, 0.5)",
                borderColor: "rgba(255, 152, 0, 1)",
                borderWidth: 2
            }]
        }
    }
};

// Initialize event listeners for general data tab
document.addEventListener("DOMContentLoaded", function() {
    // Main tab switching
    const mainTabButtons = document.querySelectorAll('.main-tab-button');
    mainTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the tab name from data attribute
            const mainTabName = this.getAttribute('data-main-tab');
            showMainTab(mainTabName);
        });
    });
    
    // Data category dropdown
    const dataCategorySelect = document.getElementById('dataCategory');
    if (dataCategorySelect) {
        dataCategorySelect.addEventListener('change', function() {
            const selectedCategory = this.value;
            const gradYearSelect = document.getElementById('gradYear');
            
            // Show/hide grad year select based on category
            if (selectedCategory && selectedCategory !== 'class-comparison') {
                gradYearSelect.classList.remove('hidden');
            } else {
                gradYearSelect.classList.add('hidden');
            }
            
            // Display appropriate data
            if (selectedCategory) {
                displayGeneralData(selectedCategory, gradYearSelect.value);
            } else {
                hideAllGeneralDataContainers();
            }
        });
    }
    
    // Graduation year dropdown
    const gradYearSelect = document.getElementById('gradYear');
    if (gradYearSelect) {
        gradYearSelect.addEventListener('change', function() {
            const selectedCategory = document.getElementById('dataCategory').value;
            if (selectedCategory) {
                displayGeneralData(selectedCategory, this.value);
            }
        });
    }
});

// Function to switch between main tabs
function showMainTab(tabName) {
    // Update active tab button
    const mainTabButtons = document.querySelectorAll('.main-tab-button');
    mainTabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-main-tab') === tabName) {
            button.classList.add('active');
        }
    });
    
    // Hide all main tab content
    const mainTabContents = document.querySelectorAll('.main-tab-content');
    mainTabContents.forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}-content`).classList.remove('hidden');
    
    // If switching to student search, reset the general data selections
    if (tabName === 'student-search') {
        const dataCategorySelect = document.getElementById('dataCategory');
        if (dataCategorySelect) {
            dataCategorySelect.value = '';
        }
        
        const gradYearSelect = document.getElementById('gradYear');
        if (gradYearSelect) {
            gradYearSelect.value = 'all';
            gradYearSelect.classList.add('hidden');
        }
        
        hideAllGeneralDataContainers();
    }
}

// Function to hide all general data containers
function hideAllGeneralDataContainers() {
    document.querySelector('.select-prompt').classList.remove('hidden');
    document.getElementById('chartContainer').classList.add('hidden');
    document.getElementById('dataTableContainer').classList.add('hidden');
    document.getElementById('dataInsights').classList.add('hidden');
    
    // Destroy current chart if exists
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
}

// Function to display general data based on category
function displayGeneralData(category, gradYear) {
    // Hide the prompt and show chart container
    document.querySelector('.select-prompt').classList.add('hidden');
    document.getElementById('chartContainer').classList.remove('hidden');
    document.getElementById('dataInsights').classList.remove('hidden');
    
    // Destroy previous chart if it exists
    if (currentChart) {
        currentChart.destroy();
    }
    
    // Get the canvas context
    const ctx = document.getElementById('dataChart').getContext('2d');
    
    // Display data based on category
    switch(category) {
        case 'gpa-trends':
            displayGPATrends(ctx, gradYear);
            break;
        case 'sat-trends':
            displaySATTrends(ctx, gradYear);
            break;
        case 'ap-distribution':
            displayAPDistribution(ctx, gradYear);
            break;
        case 'college-readiness':
            displayCollegeReadiness(ctx, gradYear);
            break;
        case 'class-comparison':
            displayClassComparison(ctx);
            break;
        default:
            hideAllGeneralDataContainers();
            return;
    }
    
    // Display insights for the selected category
    displayDataInsights(category, gradYear);
}

// Function to display GPA trends
function displayGPATrends(ctx, gradYear) {
    const chartType = (gradYear === 'all') ? 'line' : 'bar';
    
    if (gradYear === 'all') {
        // Show average GPA trend across all years
        currentChart = new Chart(ctx, {
            type: chartType,
            data: chartData.gpaData.averageByYear,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Average GPA by Class Year and Grade Level',
                        font: { size: 16 }
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        min: 2.5,
                        max: 4.0,
                        title: {
                            display: true,
                            text: 'GPA'
                        }
                    }
                }
            }
        });
    } else {
        // Show GPA distribution for selected graduation year
        currentChart = new Chart(ctx, {
            type: 'doughnut',
            data: chartData.gpaData.distribution,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `GPA Distribution for Class of ${gradYear}`,
                        font: { size: 16 }
                    },
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
}

// Function to display SAT trends
function displaySATTrends(ctx, gradYear) {
    if (gradYear === 'all') {
        // Show average SAT scores across years
        currentChart = new Chart(ctx, {
            type: 'bar',
            data: chartData.satData.averageScores,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Average SAT Scores by Class Year',
                        font: { size: 16 }
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        min: 500,
                        max: 650,
                        title: {
                            display: true,
                            text: 'Score'
                        }
                    }
                }
            }
        });
    } else {
        // Show SAT score distribution for selected year
        currentChart = new Chart(ctx, {
            type: 'bar',
            data: chartData.satData.scoreDistribution,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `SAT Score Distribution for Class of ${gradYear}`,
                        font: { size: 16 }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Number of Students'
                        }
                    }
                }
            }
        });
    }
}

// Function to display AP distribution
function displayAPDistribution(ctx, gradYear) {
    if (gradYear === 'all') {
        // Show overall AP score distribution
        currentChart = new Chart(ctx, {
            type: 'pie',
            data: chartData.apData.scoreDistribution,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'AP Score Distribution (All Classes)',
                        font: { size: 16 }
                    },
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    } else {
        // Show AP performance by subject for the selected year
        currentChart = new Chart(ctx, {
            type: 'bar',
            data: chartData.apData.subjectPerformance,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `AP Performance by Subject for Class of ${gradYear}`,
                        font: { size: 16 }
                    }
                },
                scales: {
                    y: {
                        min: 1,
                        max: 5,
                        title: {
                            display: true,
                            text: 'Average Score'
                        }
                    }
                }
            }
        });
    }
}

// Function to display college rea

