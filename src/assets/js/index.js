addEventListener("DOMContentLoaded", () => {
  // Initialize current page and items per page
  let currentPage = 1;
  const itemsPerPage = 9;

  // Function to handle the search by genre
  async function searchByGenre(event) {
    // Prevent the default form submission
    event.preventDefault();
    const genre = document.getElementById("genreInput").value.toLowerCase();

    // Display loading message
    const loadingMessage = document.getElementById("loadingMessage");
    loadingMessage.style.display = "block";

    const paginationContainer = document.getElementById("pagination");

    try {
      // Use Axios to fetch data from the Open Library API based on the genre
      const response = await axios.get(
        `https://openlibrary.org/subjects/${genre}.json?details=true&limit=${itemsPerPage}&offset=${
          currentPage * itemsPerPage
        }`
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
        // Clear the result and hide loading and pagination
        loadingMessage.style.display = "none";
        subjectResult.innerHTML = "";
        paginationContainer.style.display = "none";
      } else {
        // Display pagination and hide loading
        paginationContainer.style.display = "block";
        loadingMessage.style.display = "none";

        // Generate HTML for displaying search results
        const htmlString = data.works
          .map(
            (work, index) => `
                <div class="result-item card mb-3 col-sm-12 col-md-6 col-lg-4 col-xl-4 mx-auto">
                    <div class="card-body">
                        <h3 class="card-title text-dark">${work.title}</h3>
                        <p class="card-text text-dark"><strong>Author:</strong> ${
                          work.authors[0]?.name
                        }</p>
                        <button type="button" class="btn js-show-description description-button" data-key="${
                          work.key
                        }">Show Description</button>">Mostra descrizione</button>
                    </div>
                </div>
                ${index % 3 === 2 ? '</div><div class="row">' : ""}
            `
          )
          .join(" ");

        // Display the search results
        subjectResult.innerHTML = `<div class="row">${htmlString}</div>`;

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

        updatePaginationInfo(data.work_count);
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
      paginationContainer.style.display = "none";
      return;
    }
  }

  // Function to update pagination information
  function updatePaginationInfo(totalWorks) {
    const totalPages = Math.ceil(totalWorks / itemsPerPage);
    const currentPageElement = document.getElementById("currentPage");
    const totalPagesElement = document.getElementById("totalPages");

    currentPageElement.textContent = currentPage;
    totalPagesElement.textContent = totalPages;
  }

  const prevPageButton = document.querySelector(".js-prev-page");
  const nextPageButton = document.querySelector(".js-next-page");

  prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
    }
    searchByGenre(event);
  });

  nextPageButton.addEventListener("click", () => {
    currentPage++;
    searchByGenre(event);
  });

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
          imageUrl: "assets/images/alert-image.jpg",
          imageWidth: 400,
          imageHeight: 200,
          imageAlt: "Custom image",
        });
      } else {
        Swal.fire({
          title: `${data.title}`,
          text: "Oops! Sorry, there is no description available for this book.",
          imageUrl: "assets/images/glasses-alert-image.jpg",
          imageWidth: 400,
          imageHeight: 200,
          imageAlt: "Custom image",
        });
      }
    } catch (error) {
      console.error("Error retrieving book description:", error);
    }
  }

  // Get the search button and add an event listener to trigger the search by genre
  const searchButton = document.querySelector(".js-btn");
  searchButton.addEventListener("click", searchByGenre);
});

/* Per il Coach:
Mi è stato suggerito di rivedere gli "eventListener", sottolineando la necessità di implementare un approccio di "event delegation" con un unico listener centrale. Sono consapevole dell'importanza di questa modifica, ma ammetto di non avere una comprensione completa di come implementare al meglio questa soluzione.
Dunque, vorrei approfittare dell'occasione per chiedere se potesse fornirmi ulteriori indicazioni o risorse specifiche che potrebbero aiutarmi a sviluppare una soluzione efficace in questo contesto.

Grazie anticipatamente
*/
