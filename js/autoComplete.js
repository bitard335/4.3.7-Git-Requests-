const input = document.querySelector(".search-box__input");
const suggestionList = document.querySelector(".search-box__autocom");
const gitItem = document.querySelector(".git-item");
const gitList = document.querySelector(".git-list");
let response = [];

const debouncedGetRepos = debounce(getRepos, 400);

function debounce(cb, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      cb.apply(this, args);
    }, delay);
  };
}

function getRepos(q) {
  
  if (!q) {
    clearSuggestions();
    return
  }
  const queryString = "q=" + encodeURIComponent(q);
  return fetch("https://api.github.com/search/repositories?" + queryString)
    .then((response) => response.json())
    .then((data) => {
      for (let i = 1; i < 6; i++) {
        response.push(data.items[i]);
      }
      applySuggestions(data);
    });
}

function applySuggestions(data) {
  clearSuggestions();

  const fragment = new DocumentFragment();
  for (i = 1; i < 6; i++) {
    if (!data.items[i]) {
      return;
    }
    const suggestion = document.createElement("li");
    suggestion.textContent = data.items[i].name;
    suggestion.classList.add("search-box__item");
    fragment.appendChild(suggestion);
  }
  suggestionList.appendChild(fragment);
}

function clearSuggestions() {
  suggestionList.innerHTML = "";
}

function saveRepo(itemName) {
  let gitRepo;
  response.forEach((repo) => {
    if (repo.name == itemName) {
      gitRepo = repo;
    }
  });
  const repo = gitItem.cloneNode(true);
  repo.classList.remove("hidden");
  const repoName = repo.querySelector(".git-name");
  const repoOwner = repo.querySelector(".git-owner");
  const repoStars = repo.querySelector(".git-stars");
  repoName.textContent = "Name: " + gitRepo.name;
  repoOwner.textContent = "Owner: " + gitRepo.owner.login;
  repoStars.textContent = "Stars: " + gitRepo.stargazers_count;

  gitList.appendChild(repo);

  clearSuggestions();
}
function deleteRepo(repo) {
  repo.remove();
}

input.addEventListener("input", (evt) => {

  if (evt.data != " ") {
    debouncedGetRepos(input.value);
  }
});
suggestionList.addEventListener("click", (evt) => {
  if (evt.target && evt.target.matches(".search-box__item")) {
    saveRepo(evt.target.textContent);
  }
});

gitList.addEventListener("click", (evt) => {
  if (evt.target && evt.target.matches(".git-item-close")) {
    const itemToRemove = evt.target.closest(".git-item");
    deleteRepo(itemToRemove);
  }
});
