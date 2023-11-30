    const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?"

    //Public API key
    const GIPHY_KEY = "fthht6g3CLvkaDdFB7AZyAwrqBmV5Jth";
	
    let arrayRecSearches = [];

    //array of small urls
    let arrayCopies = [];

	// 2
	let displayTerm = "";

    //variable to track the current page 
    let currentPage = 1;
    //variable for limit of results per page
    let limit = 5;
    //variable fot total amount of pages
    let totalPages = 0;

    let term = null;

    let prevURL = null;

    //array of created buttons
    let createdButtons = [];

    let copiedURLs = [];

	// 3
	function searchButtonClicked(){
        // Update the UI
        AddAndDisplaySpinner();

        DisplayCorrectPaginationButtons();

        //parse the user entered term we wish to search
        term = document.querySelector("#searchterm").value;
        displayTerm = term.trim();

        //create a recent search and add it to the dropdown
        CreateRecentSearch(displayTerm);

        const dropdown = document.getElementById('recentSearches');
        dropdown.addEventListener('change', function() {
            // Get the selected option
            const selectedOption = dropdown.options[dropdown.selectedIndex].textContent;

            // Set the search term to the selected option
            document.querySelector("#searchterm").value = selectedOption;

            // Update the display term
            displayTerm = selectedOption.trim();
        });

        //encode spaces and special characters
        term = encodeURIComponent(term);

        //if theres no term to search then bail out of the function (return does this)
        if(term.length < 1) {
            document.querySelector("#status").innerHTML = "Search Bar is Empty";
            document.getElementById('status').removeChild(document.getElementById('status').firstChild);
            return;
        }


        //grab the user chosen search 'maxNum' from the <select> and append it to the URL
        limit = document.querySelector("#maxNum").value;

        let url = `${GIPHY_URL}api_key=${GIPHY_KEY}&q=${term}`;
        prevURL = url;

        url += `&offset=${(currentPage - 1) * limit}`;

        //request data
        getData(url);
        
	}

    function getData(url){
        //create xhr object
        let xhr = new XMLHttpRequest();
        //set the onload handler
        xhr.onload = dataLoaded;
        //set the onerror handler
        xhr.onerror = dataError;

        //open connection and send the request
        xhr.open("GET",url);
        xhr.send();
    }

    function dataLoaded(e){
        //display the results grid
        document.getElementById('results').style.display = "block";

        //Pagination
        // Show the pagination section after searchButton is clicked
        document.getElementById('pagination').style.display = 'flex';

        //event.target is the xhr object
        let xhr = e.target;

        //turn the text into a parsable JavaScript object
        let obj = JSON.parse(xhr.responseText);

        //if there are no results, print a message and return
        if(!obj.data || obj.data.length === 0){
            document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
            return; // Bail out
        }

        //start building an html string we will display to the user for this page
        let results = obj.data;

        //set the num of total pages
        totalPages = obj.data.length / limit;

        //set the start index and end index for the results of the page
        let startIndex = (currentPage - 1) * limit;
        let endIndex = startIndex + limit;
        //the paginated results will be a slice of the results we received
        let pagResults = results.slice(startIndex, endIndex)
 
        let bigString = "";

        //clear the innerHTML
        document.querySelector("#content").innerHTML = ""; 


        //clear the array
        copiedURLs = [];

        //loop through the array of results
        for (let i=0; i<=limit; i++){
            let result = pagResults[i];

            if(result != null){   
                //get the URL to the GIF
                let smallURL = result.images.fixed_width_downsampled.url;

                //set the image not found png id not found
                if(!smallURL) smallURL = "images/no-image-found.png";

                //push the copied url to the array of copies
                copiedURLs.push(smallURL);

                //set the rating
                let rating = result.rating.toUpperCase();

                //build a <div> to hold each result
                //ES6 string templating replacing view on Giphy with button to copy to Clipboard
                let line = `<div class='result'><img src='${smallURL}' title='${result.id}'/>`;
                line += `<span><button id='copyToClipboard${i}' class='copyToClipboard'>Copy to Clipboard</button><p class = 'rating'>Rating: ${rating}</p></span></div>`;

                //add the <div> to the 'bigString' and loop
                document.querySelector("#content").innerHTML += line;

            }

        }

        //check for copy to clipboard button clicks
        CheckforCopyClick();
        
        //update the status
        document.getElementById('status')?.removeChild(document.getElementById('status').firstElementChild);
    }

    function dataError(e){
        console.log("An error occurred");
    }

    function nextPage() {
        if(currentPage < totalPages){
            currentPage++;
            SearchForMore();
        }  
    }
    
    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            SearchForMore();
        }
    }

    function SearchForMore() {
        DisplayCorrectPaginationButtons();
        let updatedUrl = `${prevURL}&offset=${(currentPage - 1) * limit}`;
        getData(updatedUrl);
    }

    function CheckforCopyClick(){
        for(let i=0; i<= limit; i++){
            //add event listener that when button is clicked copies small url to clipboard
            let button = document.getElementById(`copyToClipboard${i}`);
            if(button == null){
                continue;
            }
            else{
                document.getElementById(`copyToClipboard${i}`).onclick = function() {
                    navigator.clipboard.writeText(copiedURLs[i]);
                    alert("Copied to Clipboard");
                }
            }
        }
    }

    function CreateRecentSearch(term){
        for(let i = 0; i < arrayRecSearches.length; i++){
            if(arrayRecSearches[i] == term){
                return;
            }
        }
        //create a recTerm button 
        const recTerm = document.createElement('option');
        //set the text of the term to the input 
        recTerm.textContent = term;
        recTerm.className = "searchOptions";
        //append the button to the drop down
        document.getElementById('recentSearches').insertBefore(recTerm, document.getElementById('recentSearches').firstChild);
        arrayRecSearches.push(recTerm.value);
    }

    function AddAndDisplaySpinner(){
        //create a const for the spinner and add the src and alt text
        const spinner = document.createElement('img');
        spinner.id = "#spinner";
        spinner.src = "images/spinner.gif";
        spinner.alt = "Searching...";

        //append the spinner to the status
        document.querySelector('#status').appendChild(spinner);

        spinner.onerror = function() {
            console.error("Failed to load spinner image");
            // Optionally, take alternative actions like setting a different image or displaying an error message
        };
    }

    function DisplayCorrectPaginationButtons(){
        if(currentPage === 1){
            document.querySelector("#prevButton").style.display = 'none';
        }
        else if(currentPage === totalPages){
            document.querySelector('#nextButton').style.display = 'none';
        }
        else{
            document.querySelector("#nextButton").style.display = 'block';
            document.querySelector("#prevButton").style.display = 'block';
        }
    }

    window.onload = (e) => {
        document.querySelector("#searchButton").onclick = searchButtonClicked;
        document.getElementById('nextButton').addEventListener('click', nextPage);
        document.getElementById('prevButton').addEventListener('click', prevPage);
    };