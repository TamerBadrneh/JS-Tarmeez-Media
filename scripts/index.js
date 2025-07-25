// Global Variables
let currentPage = 1;
let lastPage = 1;
let isLoadingPosts = false;
const baseUrl = "https://tarmeezacademy.com/api/v1/";

// UI Rendering
function displayNavigation() {
  $("#navbar-options").html(`
        <a class="nav-link active" href="#">Home</a>
        <a class="nav-link" href="#">Profile</a>
  `);

  const isAuthenticated = Boolean(localStorage.getItem("token"));

  if (isAuthenticated) {
    $("#navbar-options").append(`
      <a class="nav-link" href="#" onclick="logout()" id="logout-option">Logout</a>
    `);

    const userData = JSON.parse(localStorage.getItem("user"));

    $("#user").html(`
        <img
          src=${userData.profile_image}
          alt="user image"
          width="30px"
          height="30px"
          class="rounded-circle"
          onerror="this.onerror=null;this.src='../assets/images/default_profile_image.webp';"
        />
        ${userData.username}
      `);
  } else {
    $("#navbar-options").append(`
        <span class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">
            Authentication
          </a>
          <ul class="dropdown-menu">
            <li>
              <a
                class="dropdown-item"
                data-bs-toggle="modal"
                data-bs-target="#login-modal"
                href="#"
              >
                Login
              </a>
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                data-bs-toggle="modal"
                data-bs-target="#register-modal"
              >
                Register
              </a>
            </li>
          </ul>
        </span>
      `);

    $("#user").html(`
        <img
          src="./assets/images/App Logo.png"
          alt="App Logo"
          width="30px"
          height="30px"
        />
        Tarmeez Media
      `);
  }
}

function displayButtonSpinner() {
  return `
    Please Wait 
    <div
      class="spinner-border spinner-border-sm"
      role="status"
    >
      <span class="visually-hidden">Loading...</span>
    </div>
  `;
}

function displayPost(post) {
  const postAuthor = post.author;
  const tags = post.tags.map((tag) => `#${tag.name}`).join(" ");

  return `
        <div class="post-card card mb-5" onclick="fetchComments(${post.id})">
            <div class="card-header d-flex align-items-center gap-2">
              <img
                width="40"
                height="40"
                src="${postAuthor.profile_image}"
                onerror="this.onerror=null;this.src='../assets/images/default_profile_image.webp';"
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
               typeof post.image === "string" &&
               post.image.trim() !== "" &&
               post.image.trim() !== "[object Object]"
                 ? `<img
                      src="${post.image}"
                      alt="post-image"
                      class="w-100 rounded-3"
                      style="max-height: 500px;"
                      onerror="this.style.display='none';"
                    />`
                 : ""
             }
            </div>
          </div>
    `;
}

function displayComment(comment) {
  return `
     <div id="comment-${comment.id}" class="d-flex align-items-start mb-3 comment-item">
        <img
            src="${comment.author.profile_image}"
            onerror="this.onerror=null;this.src='../assets/images/default_profile_image.webp';"
            alt="profile"
            class="rounded-circle me-2"
            width="36"
            height="36"
        >
        <div>
            <div class="fw-semibold">${comment.author.username}</div>
            <div>${comment.body}</div>
        </div>
    </div>
  `;
}

function displayToastMessage(
  message = "Successfully Done.",
  toastType = "primary"
) {
  const toastPlaceholder = document.getElementById("toast-placeholder");

  // Inner function to create toast UI...
  const appendToast = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="mx-3 position-fixed bottom-0 left-0 alert alert-${type} alert-dismissible fade show" role="alert" id="toast-message">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    toastPlaceholder.append(wrapper);
  };

  appendToast(message, toastType);
  setTimeout(() => {
    const alertInstance = bootstrap.Alert.getOrCreateInstance(
      $("#toast-message")
    );
    alertInstance.close();
  }, 2500);
}

function toggleShowPassword(formType) {
  let isChecked = $(`#show-${formType}-password`).prop("checked");
  $(`#password-${formType}-input`).attr(
    "type",
    isChecked ? "text" : "password"
  );
}

function displayCreatePost() {
  return `
        <section class="col-12 col-sm-10 col-md-7 mx-auto" >
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Create New Post</h5>
              <h6 class="card-subtitle mb-2 text-body-secondary">
                Inspire the community with your ideas !
              </h6>
              <div class="mb-2">
                <label class="col-form-label">Title</label>
                <input type="text" class="form-control" id="post-title-input" />
              </div>
              <div class="mb-2">
                <label class="col-form-label">Description</label>
                <textarea
                  class="form-control"
                  id="post-body-input"
                  style="height: 100px; resize: none"
                ></textarea>
              </div>
              <div class="mb-2">
                <label class="col-form-label">Add an image</label>
                <input type="file" class="form-control" id="post-image-input" />
              </div>
              <div class="mt-4 mb-1 d-flex justify-content-end">
                <button class="btn btn-primary" onclick="createPost()" id="post-btn">Post</button>
              </div>
            </div>
          </div>
        </section>
  `;
}

function displayErrorModal(message) {
  $("#error-modal-message").html(message);
  const errorModal = new bootstrap.Modal($("#invalid-modal"));
  errorModal.show();
}

// CRUD

// 1. READ
// A. Posts
async function fetchPosts() {
  try {
    const response = await axios.get(
      `${baseUrl}posts?limit=10&page=${currentPage}`
    );

    const posts = response.data.data;

    lastPage = response.data.meta.last_page;

    renderPostsList(posts);
  } catch (error) {
    displayErrorModal(error.response.data.message);
  }
}

// B. Comments
async function fetchComments(postId) {
  try {
    const response = await axios(`${baseUrl}posts/${postId}`);

    let comments = response.data.data.comments;

    renderPostCommentsList(comments);

    const commentsModal = new bootstrap.Modal($("#comments-modal")[0]);
    commentsModal.show();
  } catch (error) {
    displayErrorModal(error.data.response.message);
  }
}

// 2. CREATE
async function createPost() {
  $("#post-btn").html(displayButtonSpinner());
  let isAuthenticated = Boolean(localStorage.getItem("token"));

  if (isAuthenticated) {
    let fields = [
      { id: "image", isFile: true },
      {
        id: "body",
        isFile: false,
      },
      {
        id: "title",
        isFile: false,
      },
    ];

    let payload = new FormData();
    fields.forEach((field) =>
      payload.append(
        field.id,
        field.isFile
          ? $(`#post-${field.id}-input`)[0].files[0]
          : $(`#post-${field.id}-input`).val().trim()
      )
    );

    try {
      let token = localStorage
        .getItem("token")
        .slice(1, localStorage.getItem("token").length - 1);
      await axios.post(`${baseUrl}posts`, payload, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      fetchPosts();

      displayToastMessage("Post Created Successfully", "primary");
    } catch (error) {
      displayErrorModal(error.response.data.message);
    }
  } else {
    let loginModal = new bootstrap.Modal($("#login-modal"));
    loginModal.show();
  }

  $("#post-btn").html("Post");
}

// AUTH
async function login() {
  $("#login-btn").html(displayButtonSpinner());

  const payload = {
    username: $("#username-login-input").val().trim(),
    password: $("#password-login-input").val().trim(),
  };

  // TODO: fields validation...

  try {
    const response = await axios.post(`${baseUrl}login`, payload);

    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("token", JSON.stringify(response.data.token));

    displayToastMessage(
      `Welcome ${response.data.user.username}, It's good to see you today !`
    );
  } catch (error) {
    displayErrorModal(error.response.data.message);
  } finally {
    let modal = bootstrap.Modal.getInstance($("#login-modal"));
    modal.hide();

    $("#username-login-input").val("");
    $("#password-login-input").val("");

    $("#login-btn").html("Login");

    displayNavigation();
  }
}

async function register() {
  // display spinner...
  $("#register-btn").html(displayButtonSpinner());

  // Get Fields
  const payload = new FormData();
  const fields = [
    { id: "image-register-input", key: "image", isFile: true },
    { id: "name-register-input", key: "name" },
    { id: "username-register-input", key: "username" },
    { id: "email-register-input", key: "email" },
    { id: "password-register-input", key: "password" },
  ];
  fields.forEach((field) => {
    if (field.isFile) {
      payload.append(field.key, $(`#${field.id}`)[0].files[0]);
    } else {
      payload.append(field.key, $(`#${field.id}`).val().trim());
    }
  });

  // TODO: fields validation...

  try {
    // API Request
    const response = await axios.post(`${baseUrl}register`, payload);

    // Store the logged in user in local storage
    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("token", JSON.stringify(response.data.token));

    // notify the user.
    displayToastMessage(
      `Welcome ${response.data.user.username}, It's good to see you today !`
    );
  } catch (error) {
    displayErrorModal(error.response.data.message);
  } finally {
    let modal = bootstrap.Modal.getInstance($("#register-modal"));
    modal.hide();

    $("#image-register-input").val("");
    $("#name-register-input").val("");
    $("#username-register-input").val("");
    $("#email-register-input").val("");
    $("#password-register-input").val("");

    $("#register-btn").html("Register");

    displayNavigation();
  }
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  displayNavigation();
  displayToastMessage("Logging out has done successfully !");
}

// Helpers
function renderPostsList(postsList) {
  postsList.forEach(function (post) {
    $("#posts").append(displayPost(post));
  });
}

function renderPostCommentsList(commentsList) {
  $("#comments-list").html("");
  commentsList.forEach(function (comment) {
    $("#comments-list").append(displayComment(comment));
  });
}

// Event Handlers

window.addEventListener("scroll", async function () {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  if (
    docHeight - (scrollTop + windowHeight) < 1400 &&
    currentPage < lastPage &&
    !isLoadingPosts
  ) {
    isLoadingPosts = true;
    currentPage++;
    await fetchPosts();
    isLoadingPosts = false;
  }
});

window.addEventListener("load", () => {
  fetchPosts();
  displayNavigation();
  $("#posts-container").prepend(displayCreatePost());
});
