//new bookmarks list
function newBookmarks(bookmarks = []) {
  const bookmarksList = document.getElementById('bookmarks-list');
  bookmarksList.innerHTML = '';

  if (bookmarks.length > 0) {
    bookmarks.forEach((bookmark, index) => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = bookmark.url;
      link.textContent = bookmark.title;
      link.title = bookmark.title;
      link.target = '_blank';

      //remove button
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.className = 'remove-btn';
      removeBtn.dataset.index = index;

      listItem.appendChild(link);
      listItem.appendChild(removeBtn);
      bookmarksList.appendChild(listItem);
    });
  } else {
    bookmarksList.innerHTML = '<li>No bookmarks saved yet.</li>';
  }
}

//search results from all Chrome bookmarks
function renderSearchResults(results) {
  const searchResultsList = document.getElementById('search-results-list');
  const searchContainer = document.getElementById('search-results-container');
  searchResultsList.innerHTML = '';

  if (results.length > 0) {
    results.forEach(item => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.url;
      link.textContent = item.title;
      link.title = item.title;
      link.target = '_blank';
      
      const visitCountSpan = document.createElement('span');
      visitCountSpan.className = 'visit-count';
      visitCountSpan.textContent = `Clicked: ${item.visitCount}`;

      listItem.appendChild(link);
      listItem.appendChild(visitCountSpan);
      searchResultsList.appendChild(listItem);
    });
  } else {
    searchResultsList.innerHTML = '<li>No matching bookmarks found.</li>';
  }
  searchContainer.style.display = 'block';
}


// Save current page
document.getElementById('save-button').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab) {
      const newBookmark = { title: currentTab.title, url: currentTab.url };
      chrome.storage.local.get({ bookmarks: [] }, (data) => {
        const updatedBookmarks = [...data.bookmarks, newBookmark];
        chrome.storage.local.set({ bookmarks: updatedBookmarks }, () => {
          newBookmarks(updatedBookmarks);
        });
      });
    }
  });
});

// Remove an item
document.getElementById('bookmarks-list').addEventListener('click', (event) => {
  if (event.target && event.target.classList.contains('remove-btn')) {
    const indexToRemove = parseInt(event.target.dataset.index, 10);
    chrome.storage.local.get({ bookmarks: [] }, (data) => {
      data.bookmarks.splice(indexToRemove, 1);
      chrome.storage.local.set({ bookmarks: data.bookmarks }, () => {
        newBookmarks(data.bookmarks);
      });
    });
  }
});

// Search all Chrome bookmarks
document.getElementById('search-button').addEventListener('click', () => {
  const query = document.getElementById('search-input').value;
  if (!query) return;

  chrome.bookmarks.search(query, (bookmarkResults) => {
    // For each bookmark, create a promise to get its visit count from history
    const historyPromises = bookmarkResults.map(bookmark => 
      new Promise(resolve => {
        chrome.history.getVisits({ url: bookmark.url }, (visitItems) => {
          resolve({
            title: bookmark.title,
            url: bookmark.url,
            visitCount: visitItems.length
          });
        });
      })
    );
    // render result
    Promise.all(historyPromises).then(results => {
      renderSearchResults(results);
    });
  });
});

//display bookmarks
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get({ bookmarks: [] }, (data) => {
    newBookmarks(data.bookmarks);
  });
});