    const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?"

    //Public API key
    const GIPHY_KEY = "fthht6g3CLvkaDdFB7AZyAwrqBmV5Jth";
	
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

	// 3
	function searchButtonClicked(){
        console.log(currentPage);
		console.log("searchButtonClicked() called");

        //parse the user entered term we wish to search
        term = document.querySelector("#searchterm").value;
        displayTerm = term.trim();

        //encode spaces and special characters
        term = encodeURIComponent(term);

        //if theres no term to search then bail out of the function (return does this)
        if(term.length < 1) return;

        //grab the user chosen search 'maxNum' from the <select> and append it to the URL
        limit = document.querySelector("#maxNum").value;

        let url = `${GIPHY_URL}api_key=${GIPHY_KEY}&q=${term}`;
        prevURL = url;

        url += `&offset=${(currentPage - 1) * limit}`;

        // Update the UI
        document.querySelector("#status").innerHTML = `<b>Searching for '${displayTerm}'</b>`;

        //see what the url looks like
        console.log(url);

        //request data
        getData(url);
        
        document.getElementById('results').style.display = "block";
        //Pagination

        // Show the pagination section after searchButton is clicked
        document.getElementById('pagination').style.display = 'block';
	}

    function getData(url){
        console.log("getData called");
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
        //event.target is the xhr object
        let xhr = e.target;
        //xhjr.responseText is the JSON file we just downloaded
        console.log(xhr.responseText);

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

        //show all the page numbers at the bottom as buttons
        //PaginationNumberButtons(totalPages);

        //set the start index and end index for the results of the page
        let startIndex = (currentPage - 1) * limit;
        let endIndex = startIndex + limit;
        //the paginated results will be a slice of the results we received
        let pagResults = results.slice(startIndex, endIndex)
 
        let bigString = "";

        //loop through the array of results
        for (let i=0; i<limit; i++){
            let result = pagResults[i];

            if(result != null){
                //get the URL to the GIF
                let smallURL = result.images.fixed_width_downsampled.url;

                //set the image not found png id not found
                if(!smallURL) smallURL = "images/no-image-found.png";

                //get the URL to the Giphy page
                let url = result.url;

                //set the rating
                let rating = result.rating.toUpperCase();

                //build a <div> to hold each result
                //ES6 string templating
                let line = `<div class='result'><img src='${smallURL}' title='${result.id}'/>`;
                line += `<span><a target = '_blank' href='${url}'>View on Giphy</a><br><p>Rating: ${rating}</p></span></div>`;

                //add the <div> to the 'bigString' and loop
                bigString += line;
            }

        }

        //all donw building the HTML - show it to the user
        document.querySelector("#content").innerHTML = bigString;

        //update the status
        document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here are " + pagResults.length + " results for " + displayTerm + "</i></p>";
    }

    function dataError(e){
        console.log("An error occurred");
    }

    function nextPage() {
        if(currentPage < totalPages){
            console.log("Next Page called");
            currentPage++;
            SearchForMore();
        }  
    }
    
    function prevPage() {
        console.log("Prev Page called");
        if (currentPage > 1) {
            currentPage--;
            SearchForMore();
        }
    }

    function SearchForMore() {
        let updatedUrl = `${prevURL}&offset=${(currentPage - 1) * limit}`;
        console.log(updatedUrl);
        getData(updatedUrl);
    }

    function createPaginationButtons(totalPages) {
        const pagination = document.getElementById('pagination');
      
        // Clear existing buttons except the navigation buttons
        while (pagination.firstChild !== null && pagination.childNodes.length > 2) {
          if (!createdButtons.includes(pagination.firstChild)) {
            pagination.removeChild(pagination.firstChild);
          } else {
            break; // Stop removing nodes if it encounters a created button
          }
        }
      
        // Create buttons for new pages
        for (let i = createdButtons.length + 1; i <= totalPages; i++) {
          const button = document.createElement('button');
          button.textContent = i;
          button.addEventListener('click', () => {
            currentPage = i;
            SearchForMore();
          });
          pagination.insertBefore(button, document.getElementById('nextButton'));
          createdButtons.push(button);
        }
    }

    window.onload = (e) => {
        document.querySelector("#searchButton").onclick = searchButtonClicked;
        document.getElementById('nextButton').addEventListener('click', nextPage);
        document.getElementById('prevButton').addEventListener('click', prevPage);
    };