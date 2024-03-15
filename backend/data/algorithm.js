const fs = require('fs');
const { max } = require('heap');
const plotly = require('plotly')('username', 'apiKey'); // Provide your Plotly username and API key

// Read the JSON data from a file
const data = JSON.parse(fs.readFileSync('allPrograms.json', 'utf8'));
const coursesData = JSON.parse(fs.readFileSync('allCourses.json', 'utf8'));

// Define a function to calculate total credits of matched courses
function calculateTotalCredits(courseIds) {
    let totalCredits = 0;
    for (const courseId of courseIds) {
        // Match course ID with the courses data
        for (const course of coursesData) {
            if (course.id.startsWith(courseId.substring(0, 7))) {
                totalCredits += course.credits.numberOfCredits;
                break; // Exit the inner loop after finding the course
            }
        }
    }
    return totalCredits;
}

// Define a function to check if a set of classes fulfills a requirement
function checkRequirement(requirement, classesTaken, progress) {
    const condition = requirement.condition;
    const subRules = requirement.subRules || [];

    if (condition === 'allOf') {
        for (const subRule of subRules) {
            progress = checkRequirement(subRule, classesTaken, progress);
        }
    } else if (condition === 'anyOf') {
        for (const subRule of subRules) {
            progress = checkRequirement(subRule, classesTaken, progress);
            // If any one of the sub_rules is fulfilled, break and consider the anyOf condition fulfilled
            if (progress.count > 0) {
                break;
            }
        }
    } else if (condition === 'completedAnyOf') {
        const courseValues = requirement.value.values || [];
        progress.total += 1;
        for (const courseValue of courseValues) {
            const logic = courseValue.logic;
            const courses = courseValue.value;
            if ((logic === 'or' && courses.some(course => classesTaken.includes(course))) ||
                (logic === 'and' && courses.every(course => classesTaken.includes(course)))) {
                progress.count += 1;
                break; // If any course is taken, break and count it once
            }
        }
    } else if (condition === 'completedAllOf') {
        const courseValues = requirement.value.values || [];
        progress.total += courseValues.length;
        for (const courseValue of courseValues) {
            if (courseValue.value.every(course => classesTaken.includes(course))) {
                progress.count += 1;
            }
        }
    } else if (condition === 'minimumCredits') {
        const courseValues = requirement.value.values || [];
        const technicalElectivesTaken = classesTaken.filter(courseId =>
            courseValues.some(courseValue => courseValue.value.includes(courseId)));
        const totalCredits = calculateTotalCredits(technicalElectivesTaken);
        const a = requirement.minCredits || 0;
        progress.total += Math.round(((a / 4) + (a / 3)) / 2);
        progress.count += Math.min(Math.round(((totalCredits / 4) + (totalCredits / 3)) / 2),
            Math.round(((a / 4) + (a / 3)) / 2));
    } else if (condition === 'completeVariableCoursesAndVariableCredits') {
        const minCourses = requirement.minCourses || 0;
        const minCredits = requirement.minCredits || 0;
        const coursesSpecified = [];
        const courseValues = requirement.value.values || [];
        for (const courseValue of courseValues) {
            coursesSpecified.push(...(courseValue.value || []));
        }
        const numCourses = classesTaken.filter(course => coursesSpecified.includes(course)).length;
        const totalCredits = calculateTotalCredits(classesTaken.filter(course => coursesSpecified.includes(course)));
        progress.total += minCourses;
        progress.count += Math.min(numCourses, minCourses);
    }
    return progress;
}

// Define a function to check which requirements are fulfilled given a list of classes
function checkRequirements(classesTaken, requirements) {
    let progress = { count: 0, total: 0 };
    for (const requisite of requirements) {
        const subRules = requisite.rules || [];
        for (const subRule of subRules) {
            progress = checkRequirement(subRule, classesTaken, progress);
        }
    }
    if (progress.total === 0) {
        return 0;
    }
    return Math.round(progress.count / progress.total * 100) / 100;
}

// Example usage
const classesTaken = ["0036921", "0020711", "0020701", "0036931", "8096661", "0036951", "0016221", "8190811", "8051471", "8191481", "8191471", "8190581", "0064081", "8194571", "7906561", "8194571", "0064081", "0026681", "8263851", "0140901", "7973471", "8175521", "8039561", "0043081", "0064091", "8194611", "8153351", "0134661", "0047121", "8034561", "0043671", "0043091", "0042951"];
//const classesTaken = ["0020701", "0020711"];
//const classesTaken = ["0020701", "0020711", "0020701", "0020711", "8096661", "0016221", "0036721"];

const pq = [];

function push(item, priority) {
    max.push(pq, { priority, item });
}

// Find the relevant requisites (e.g., Data Science program)
let topPrograms = [];
for (const program of data) {
    if (program.college.includes('TIOT') && program.nscClassification.includes('B')) {
        const requisites = program.requisites;
        if (requisites) {
            const score = checkRequirements(classesTaken, requisites.requisitesSimple);
            push(program.longName, score);
        }
    }
}

topPrograms = max(pq, 10); // Get top 10 programs

// Print top programs
console.log(topPrograms);
