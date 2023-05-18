const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
const jeopardyBoard = $("#jeopardy");
// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

function getCategoryIds(catIds) {
    // selects random categories from list provided
    let randomIds = _.sampleSize(catIds.data, NUM_CATEGORIES);
    let categoryIds = [];
    // push each id into an array
    for (cat of randomIds) {
        categoryIds.push(cat.id);
    }
    return categoryIds;
}

// gets data from each id provided

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

function getCategory(catId) {
    let cat = catId.data;
    // gets the amount of questions needed from the category
    let clues = _.sampleSize(cat, NUM_QUESTIONS_PER_CAT);
    // gets titles from categories
    let catData = {
        title: cat[0].category.title,
        clues: []
    };
    // gets questions and answers from categories
    clues.map((arr) => {
        let cluesArr = {
            question: arr.question,
            answer: arr.answer,
            showing: null
        };
        catData.clues.push(cluesArr);
    });
    // pushes data into categories array
    categories.push(catData);
}

// fills jeoparsy table with data

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

function fillTable() {
    // makes new array of each title
    let titles = categories.map((title) => {
        return title.title;
    });
    // loops through each title and makes table headers of each
    $("thead").add("tr");
    for (let x = 0; x < NUM_CATEGORIES; x++) {
        const catHeader = document.createElement("th");
        catHeader.innerText = titles[x];
        $("thead").append(catHeader);
    }
    //makes the rest of the table and gives each an id of its location
    for (let y = 0; y < NUM_QUESTIONS_PER_CAT; y++) {
        const row = document.createElement("tr");
        for (let x = 0; x < NUM_CATEGORIES; x++) {
            const cell = document.createElement("td");
            cell.innerHTML = `<div id=${x}-${y}>?</div>`;
            row.append(cell);
        }
        jeopardyBoard.append(row);
    }
}
/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    // x and y are used to change the data displayed into the correct questions and answers
    let x = evt.target.id[0];
    let y = evt.target.id[2];
    // if answer is displayed, do nothing
    if (evt.target.classList.contains("answer")) {
        return;
        // if question is displayed, display answer instead
    } else if (evt.target.classList.contains("question")) {
        evt.target.innerText = categories[x].clues[y].answer;
        evt.target.classList.remove("question");
        evt.target.classList.add("answer");
        // if nothing is displayed yet, display question
    } else {
        evt.target.innerText = categories[x].clues[y].question;
        evt.target.classList.add("question");
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

async function setupAndStart() {
    // get 100 categories from jservice.io
    const resCategories = await axios.get("http://jservice.io/api/categories", {
        params: {
            count: 100
        }
    });
    let catIds = getCategoryIds(resCategories);

    for (id of catIds) {
        // for each id, get clue data from jservoce.io
        const resTitles = await axios.get("http://jservice.io/api/clues", {
            params: {
                category: id
            }
        });
        getCategory(resTitles);
    }
    fillTable();
}

// reload page when restart button is pushed
$("#restart").on("click", function () {
    location.reload();
});

// when document is loaded, start game and add event listener for jeopardy board
$(document).ready(function () {
    setupAndStart();
    $("#jeopardy").on("click", "div", handleClick);
});