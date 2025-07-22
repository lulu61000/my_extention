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


document.getElementById('save-button').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab) {
      const newBookmark = {
        title: currentTab.title,
        url: currentTab.url
      };
      chrome.storage.local.get({ bookmarks: [] }, (data) => {
        const updatedBookmarks = [...data.bookmarks, newBookmark];
        chrome.storage.local.set({ bookmarks: updatedBookmarks }, () => {
          newBookmarks(updatedBookmarks);
        });
      });
    }
  });
});


document.getElementById('bookmarks-list').addEventListener('click', (event) => {
  if (event.target && event.target.classList.contains('remove-btn')) {
    const index_to_remove = parseInt(event.target.dataset.index, 10);

    chrome.storage.local.get({ bookmarks: [] }, (data) => {

      data.bookmarks.splice(index_to_remove, 1);
      
      chrome.storage.local.set({ bookmarks: data.bookmarks }, () => {
        newBookmarks(data.bookmarks);
      });
    });
  }
});

//display bookmarks
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get({ bookmarks: [] }, (data) => {
    newBookmarks(data.bookmarks);
  });
});