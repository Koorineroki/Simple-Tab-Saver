// Get the saveButton from HTML
document.addEventListener('DOMContentLoaded', function() {
  // Get Buttons
  const saveButton = document.getElementById('save-button');
  const importButton = document.getElementById('import-button');

  // Store all tab URLs in current window
  let tabsList = [];

  // Create a hidden file input for importing .urls files
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.urls';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);


  // Get all tab URLs and display them on the page
  chrome.tabs.query({currentWindow: true}, function(tabs) {
    let tabsUl = document.getElementById('tabs-list');

    // Only process tabs with http/https protocol
    tabs.forEach((tab) => {
      if (tab.url.startsWith('http')) {
        let li = document.createElement('li');
        li.textContent = tab.url;
        tabsUl.appendChild(li);
        tabsList.push(tab.url);
      }
    });
  });


  // Save button click event: save all tab URLs as a .urls file
  saveButton.addEventListener('click', function() {
    if (tabsList.length > 0) {
      let blob = new Blob([tabsList.join('\n')], {type: 'text/plain'});
      let url = URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = url;
      a.download = 'tabs_urls.urls';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert('No URLs to save.');
    }
  });

  // Import button click event: trigger file input
  importButton.addEventListener('click', function() {
    fileInput.click();
  });

  // File input change event: read .urls file and open all URLs
  fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Validate file extension
    if (!file.name.endsWith('.urls')) {
      alert('Please select a valid .urls file containing URLs.');
      fileInput.value = '';
      return;
    }

    // Read file content and open each URL
    const reader = new FileReader();
    reader.onload = function(loadEvent) {
      const fileContent = loadEvent.target.result;
      const urls = fileContent
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.startsWith('http'));

      urls.forEach((url) => {
        chrome.tabs.create({ url: url });
      });
      fileInput.value = '';
    };
    reader.readAsText(file);
  });
});

