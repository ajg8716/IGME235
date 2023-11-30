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
        console.log(totalPages);

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
        for (let i=0; i < limit; i++){
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
        
        if(document.getElementById('status') != null){
            //update the status
            document.getElementById('status').removeChild(document.getElementById('status').firstElementChild);
        }

        //called to display the proper next and/or prev buttons based on results
        DisplayCorrectPaginationButtons();  
    }

    //function to notify error of data collection
    function dataError(e){
        console.log("An error occurred with data collection");
    }

    //function to handle what happens with clicking on next page button 
    function nextPage() {
        //if the currentPage value is less than the totalPages value
        if(currentPage < totalPages){
            //add to currentPage by 1
            currentPage++;
            //call method to search for more GIFs based on this currentPage
            SearchForMore();
        }  
    }
    
    //function to handle what happens with clicking on next previous button 
    function prevPage() {
        //if the currentPage value is greater than 1
        if (currentPage > 1) {
            //subtract currentPage by 1
            currentPage--;
            //call method to search for more GIFs based on this currentPage
            SearchForMore();
        }
    }

    //function to handle getting data for other pages
    function SearchForMore() {
        // display spinner
        AddAndDisplaySpinner();
        //call method to display the next and/or prev buttons
        DisplayCorrectPaginationButtons();
        //create an update url with new offset based on currentPage
        let updatedUrl = `${prevURL}&offset=${(currentPage-1) * limit}`;
        //get the data of the new url
        getData(updatedUrl);
    }

    //function that handles what to do for copy to clipboard logic when the button is clicked. 
    function CheckforCopyClick(){
        //increment through each button id
        for(let i=0; i < limit; i++){
            //add event listener that when button is clicked copies small url to clipboard
            let button = document.getElementById(`copyToClipboard${i}`);
            //if the button is null
            if(button == null){
                //ignore it
                continue;
            }
            else{
                //set an onclick for this button
                document.getElementById(`copyToClipboard${i}`).onclick = function() {
                    //copy to clipboard
                    navigator.clipboard.writeText(copiedURLs[i]);
                    //alert the browser
                    alert("Copied to Clipboard");
                }
            }
        }
    }

    //function that adds the term of a search to a recent search and ignore duplicates. term is input
    function CreateRecentSearch(term){
        //loop through all current array recent searches
        for(let i = 0; i < arrayRecSearches.length; i++){
            //if there is already a recent search that has the same value as one input
            if(arrayRecSearches[i] == term){
                //ignored and not added to array
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

    //function that creates the spinner and appends it to #status 
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

    //function that handles logic of which prev / next button will or won't be shown
    function DisplayCorrectPaginationButtons(){
        //when the currentPage value is 1
        if(currentPage === 1){
            //hide previous button
            document.querySelector("#prevButton").style.display = 'none';
            document.querySelector("#nextButton").style.display = 'block';
        }
        //when currentPage value is totalPages
        else if(currentPage === totalPages){
            //hide next button
            document.querySelector('#nextButton').style.display = 'none';
            document.querySelector("#prevButton").style.display = 'block';
        }
        else{
            //show them both
            document.querySelector("#nextButton").style.display = 'block';
            document.querySelector("#prevButton").style.display = 'block';
        }
    }

    window.onload = (e) => {
        document.querySelector("#searchButton").onclick = searchButtonClicked;
        document.getElementById('nextButton').addEventListener('click', nextPage);
        document.getElementById('prevButton').addEventListener('click', prevPage);
    };