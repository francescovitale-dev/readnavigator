import axios from "axios";
import _ from "lodash";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style/style.css";
import "../style/footer.css";

function mainContent() {
  const itemsPerPage = 9;

  // Function to handle the search by genre
  async function searchByGenre(event) {
    // Prevent the default form submission
    event.preventDefault();
    const genre = _.toLower(document.getElementById("genreInput").value);

    // Display loading message
    const loadingMessage = document.getElementById("loadingMessage");
    loadingMessage.style.display = "block";

    try {
      // Use Axios to fetch data from the Open Library API based on the genre
      const response = await axios.get(
        `https://openlibrary.org/subjects/${genre}.json?details=true&limit=${itemsPerPage}`
      );

      if (!response.status === 200) {
        throw new Error("Error");
      }

      const data = response.data;
      const subjectResult = document.getElementById("js-subject-result");

      // Handle case when no works are found for the given genre
      if (!data.works || data.works.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Info",
          text: `Please enter a valid genre.`,
        });
        // Clear the result and hide loading
        loadingMessage.style.display = "none";
        subjectResult.innerHTML = "";
      } else {
        // Hide loading
        loadingMessage.style.display = "none";

        // Generate HTML for displaying search results
        const htmlString = _.map(
          data.works,
          (work, index) => `
            <div class="result-item card mb-3 col-sm-12 col-md-6 col-lg-4 col-xl-4 mx-auto" style="border: solid 10px #d2b48c; width: 250px; position: relative;">
                <div class="card-body">
                    <h3 class="card-title text-dark">${work.title}</h3>
                    <p class="card-text text-dark author"><strong>Author:</strong> ${
                      work.authors[0]?.name
                    }</p>
                    <button type="button" class="btn js-show-description description-button" data-key="${
                      work.key
                    }" style="position: absolute; bottom: 10px; width: 180px; text-align: center; border: solid 1px #d2b48c;">Show Description</button>
                </div>
            </div>
            ${index % 3 === 2 ? '</div><div class="row">' : ""}
          `
        ).join(" ");        

        // Display the search results
        subjectResult.innerHTML = `<div class="row">${htmlString}`;

        const descriptionButtons = document.querySelectorAll(
          ".js-show-description"
        );
        descriptionButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const key = button.getAttribute("data-key");
            const title = button.getAttribute("data-title");
            getBookDescription(key, title);
          });
        });
      }
    } catch (error) {
      loadingMessage.style.display = "none";
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter a valid genre.",
      });

      const subjectResult = document.getElementById("js-subject-result");
      subjectResult.innerHTML = "";
      return;
    }
  }

  // Function to fetch and display book description
  async function getBookDescription(key, title) {
    const descriptionUrl = `https://openlibrary.org${key}.json`;

    try {
      const response = await axios.get(descriptionUrl);
      const data = response.data;

      if (typeof data.description === "string") {
        Swal.fire({
          title: `${data.title}`,
          text: `${data.description}`,
        });
      } else {
        Swal.fire({
          icon: "info",
          title: `${data.title}`,
          text: "Oops! Sorry, there is no description available for this book.",
        });
      }
    } catch (error) {
      console.error("Error retrieving book description:", error);
    }
  }

  // Get the search button and add an event listener to trigger the search by genre
  const searchButton = document.querySelector(".js-btn");
  searchButton.addEventListener("click", searchByGenre);
}

mainContent();
