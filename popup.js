document.addEventListener('DOMContentLoaded', function() {
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save URLs as .urls';
  document.body.appendChild(saveButton);

  let tabsList = [];

  const importButton = document.getElementById('import-button');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.urls';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);


  // Get all tab URLs of the current window
  chrome.tabs.query({currentWindow: true}, function(tabs) {
    let tabsUl = document.getElementById('tabs-list');

    tabs.forEach((tab) => {
      if (tab.url.startsWith('http')) { // Filter out non-http/https tabs
        let li = document.createElement('li');
        li.textContent = tab.url;
        tabsUl.appendChild(li);
        tabsList.push(tab.url); // Adding URLs to array
      }
    });
  });


  // Click the button to save as urls file
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

  importButton.addEventListener('click', function() {
    fileInput.click();
  });

  fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.name.endsWith('.urls')) {
      alert('Please select a valid .urls file containing URLs.');
      fileInput.value = '';
      return;
    }

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
