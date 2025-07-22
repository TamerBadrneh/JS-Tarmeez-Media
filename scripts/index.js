// TODO: Refactoring Code
// 1. Clean-Up: Change Some HTML code and remove unnecssary accessibility code + any additional props from all elements.

// 2. HTML: Update:
//    a. view user name and image in the bar if he logged in, else view the default image and guest with random number.
//    b. make the nav bar fixed and make the changes requires.
//    c. make the show hide passwords also to register and add confirm password.
//    d. make some UI spinners so the operations feels dynamic and responsive.
//    e. make the brand name abroad from the options.
//    f. make create post area so the user can create post later on.
//    g. make the secondary color better and change the toast color to be also as primary one.

// 3. JS: Clean the code "don't change the logic"
// 4. JS: Work on Error handling and some field validation "try any library does it asap".


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
    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("token", JSON.stringify(response.data.token));

    createToastMessage(
      `Welcome ${response.data.user.username}, It's good to see you today !`
    );
  } catch (error) {
    // for now just alert the error...
    alert(error);
  } finally {
    let modal = bootstrap.Modal.getInstance($("#login-modal"));
    modal.hide();
    // Clear the fields...
    $("#username-login-input").val("");
    $("#password-login-input").val("");
    updateNavigation();
  }
}

async function register() {
  // validation logic here...

  const formDataPayload = new FormData();

  let profileImage = $("#image-register-input")[0].files[0];
  formDataPayload.append("image", profileImage);
  formDataPayload.append("name", $("#name-register-input").val().trim());
  formDataPayload.append(
    "username",
    $("#username-register-input").val().trim()
  );
  formDataPayload.append("email", $("#email-register-input").val().trim());
  formDataPayload.append(
    "password",
    $("#password-register-input").val().trim()
  );

  console.log("formdata");
  console.log(formDataPayload);

  try {
    const response = await axios.post(
      `https://tarmeezacademy.com/api/v1/register`,
      formDataPayload
    );

    // Store the data in local Storage...
    // Soon this storage should be encrypted and decrypted...
    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("token", JSON.stringify(response.data.token));

    createToastMessage(
      `Welcome ${response.data.user.username}, It's good to see you today !`
    );
  } catch (error) {
    // for now just alert the error...
    alert(error);
  } finally {
    let modal = bootstrap.Modal.getInstance($("#register-modal"));
    modal.hide();
    // Clear the fields...
    $("#image-register-input")[0] = null;
    $("#name-register-input").val("");
    $("#username-register-input").val("");
    $("#email-register-input").val("");
    $("#password-register-input").val("");
    updateNavigation();
  }
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  updateNavigation();
  createToastMessage("Logging out has done successfully !");
}

// UI Code
function updateNavigation() {
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  if (isAuthenticated) {
    $("#auth-options").addClass("d-none");
    $("#logout-option").removeClass("d-none");
  } else {
    $("#auth-options").removeClass("d-none");
    $("#logout-option").addClass("d-none");
  }
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

function createToastMessage(
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

function toggleShowPassword() {
  let isChecked = $("#show-password").prop("checked");
  $("#password-login-input").attr("type", isChecked ? "text" : "password");
}

// loading logic
fetchPosts();
updateNavigation();
