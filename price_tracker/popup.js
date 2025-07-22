function renderItems(items = []) {
  //saved items init
  const itemsList = document.getElementById('items-list');
  itemsList.innerHTML = '';

  if (items.length > 0) {
    items.forEach((item, index) => {
      const listItem = document.createElement('li');

      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';

      const itemInfo = document.createElement('div');
      itemInfo.className = 'item-info';

      const itemName = document.createElement('span');
      itemName.textContent = item.name;
      
      const itemPrice = document.createElement('span');
      itemPrice.className = 'item-price';
      itemPrice.textContent = `Last Price: $${item.price}`;
      
      itemInfo.appendChild(itemName);
      itemInfo.appendChild(itemPrice);
      link.appendChild(itemInfo);

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.className = 'remove-btn';
      removeBtn.dataset.index = index;

      listItem.appendChild(link);
      listItem.appendChild(removeBtn);
      itemsList.appendChild(listItem);
    });
  } else {
    itemsList.innerHTML = '<li>No items saved yet.</li>';
  }
}

document.getElementById('save-button').addEventListener('click', () => {
  //saving a new item
  const nameInput = document.getElementById('item-name');
  const priceInput = document.getElementById('item-price');

  const itemName = nameInput.value;
  const itemPrice = parseFloat(priceInput.value).toFixed(2);

  if (itemName && itemPrice) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab) {
        const newItem = {
          name: itemName,
          price: itemPrice,
          url: currentTab.url
        };
        chrome.storage.local.get({ items: [] }, (data) => {
          const updatedItems = [...data.items, newItem];
          chrome.storage.local.set({ items: updatedItems }, () => {
            renderItems(updatedItems);
            nameInput.value = ''; // clear inputs
            priceInput.value = '';
          });
        });
      }
    });
  }
});

document.getElementById('items-list').addEventListener('click', (event) => {
  //removal of item
  if (event.target && event.target.classList.contains('remove-btn')) {
    const indexToRemove = parseInt(event.target.dataset.index, 10);
    chrome.storage.local.get({ items: [] }, (data) => {
      data.items.splice(indexToRemove, 1);
      chrome.storage.local.set({ items: data.items }, () => {
        renderItems(data.items);
      });
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // displays items
  chrome.storage.local.get({ items: [] }, (data) => {
    renderItems(data.items);
  });
});