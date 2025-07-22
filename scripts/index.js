// POSTS
async function fetchPosts() {
  const response = await axios.get(
    "https://tarmeezacademy.com/api/v1/posts?limit=5"
  );

  const posts = response.data.data;
  viewPosts(posts);
}

function viewPosts(posts) {
  // Clearing
  $("#posts").html("");

  // View Data
  posts.forEach((post) => {
    $("#posts").append(createPostItem(post));
  });
}

function createPostItem(post) {
  const postAuthor = post.author;
  const tags = post.tags.map((tag) => `#${tag.name}`).join(" ");

  return `
        <div class="card mb-5">
            <div class="card-header d-flex align-items-center gap-2">
              <img
                width="40"
                height="40"
                src="${
                  typeof postAuthor.profile_image !== "object"
                    ? postAuthor.profile_image
                    : "././assets/images/default_profile_image.webp"
                } "
                alt="profile image"
                class="rounded-circle border border-2"
                style="border-color: #1aa09f !important"
              />
              <div class="d-flex flex-column">
                <p class="my-0 fw-semibold" style="font-size: 15px">
                  @${postAuthor.username}
                </p>
                <span class="text-muted" style="font-size: 12px"
                  >${post.created_at}</span
                >
              </div>
            </div>
            <div class="card-body">
              <h5 class="card-title">${post.title ?? ""}</h5>
              <p class="card-text">
                ${post.body ?? ""}
              </p>

              <p style="font-size: 15px" class="fw-semibold">
                ${tags ?? ""}
              </p>

              ${
                typeof post.image !== "object"
                  ? `
                    <img
                        src=${post.image}
                        alt="post-image"
                        class="w-100 rounded-3"
                        style="max-height: 500px;"
                    />
                `
                  : ""
              } 
              

              <div class="input-group mt-3">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Add New Comment"
                  aria-label="Recipient’s username"
                  aria-describedby="button-addon2"
                />
                <button
                  class="btn btn-outline-primary"
                  type="button"
                  id="button-addon2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-plus-lg"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
    `;
}

fetchPosts();

// AUTH
async function login() {
  // validation logic here...

  const loginFormPayload = {
    username: $("#username-login-input").val().trim(),
    password: $("#password-login-input").val().trim(),
  };

  try {
    const response = await axios.post(
      `https://tarmeezacademy.com/api/v1/login`,
      loginFormPayload
    );

    // Store the data in local Storage...
    // Soon this storage should be encrypted and decrypted...
    localStorage.setItem("loggedin-user", JSON.stringify(response.data.user));

    let modal = bootstrap.Modal.getInstance($("#login-modal"));
    modal.hide();
  } catch (error) {
    // for now just alert the error...
    alert(error);
  } finally {
    // Clear the fields...
    $("#username-login-input").val("");
    $("#password-login-input").val("");
  }
}
