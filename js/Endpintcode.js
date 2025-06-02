document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');

    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
      });

      sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
      });
    }

    // Get all sidebar navigation items
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    // Add IDs to each card section based on their headings
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      const heading = card.querySelector('h2');
      if (heading) {
        const headingText = heading.textContent.trim();
        const idText = headingText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        card.id = idText;
      }
    });
    // Create a simple mapping between nav items and sections
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        // Set this item as active
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        // Get the text content of the clicked nav item
        const navText = this.textContent.trim();
        // Find a card with a matching heading
        for (let card of cards) {
          const heading = card.querySelector('h2');
          if (heading && heading.textContent.trim() === navText) {
            // Scroll to this card
            card.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            return;
          }
        }
        // Handle special cases by direct text matching
        if (navText === 'Overview') {
          const overviewCard = document.querySelector('.card:first-of-type');
          if (overviewCard) overviewCard.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        } else if (navText === 'Critical Windows Event IDs') {
          const criticalEventsCard = document.querySelector('.card h2:contains("Critical Windows Event IDs")').closest('.card');
          if (criticalEventsCard) criticalEventsCard.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
        // Add other special cases as needed
      });
    });
    // Custom contains selector for more flexibility
    jQuery.expr[':'].contains = function(a, i, m) {
      return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };
  });
  document.addEventListener('DOMContentLoaded', function() {
    // Handle the Copy button functionality
    const copyButtons = document.querySelectorAll('.cmd-copy');
    copyButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Find the command content to copy
        const cmdCard = this.closest('.cmd-card');
        const cmdContent = cmdCard.querySelector('.cmd-line-content').textContent;
        // Copy to clipboard
        navigator.clipboard.writeText(cmdContent.trim()).then(() => {
          // Change button text temporarily
          const originalText = this.innerHTML;
          this.innerHTML = 'Copied!';
          // Reset button text after 2 seconds
          setTimeout(() => {
            this.innerHTML = originalText;
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy: ', err);
        });
      });
    });
    // Add the highlighting script for sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        // Remove active class from all nav items
        navItems.forEach(nav => nav.classList.remove('active'));
        // Add active class to clicked item
        this.classList.add('active');
        // Get corresponding section id based on text content
        const navText = this.textContent.trim();
        if (navText === 'PowerShell Commands') {
          const section = document.querySelector('.card h2:contains("PowerShell Commands")').closest('.card');
          if (section) {
            section.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }
      });
    });
  });
  document.addEventListener('DOMContentLoaded', function() {
  // Get the search input by its placeholder text
  const searchInput = document.querySelector('input[placeholder="Search documentation..."]');
  
  if (!searchInput) return;
  
  // Create a parent container for the search input if needed
  if (!searchInput.parentElement.classList.contains('search-box')) {
    const searchBox = document.createElement('div');
    searchBox.className = 'search-box';
    searchBox.style.position = 'relative';
    
    // Replace the input with the search box containing the input
    searchInput.parentNode.insertBefore(searchBox, searchInput);
    searchBox.appendChild(searchInput);
  }
  
  // Create a search results container if it doesn't exist
  let searchResultsContainer = document.getElementById('search-results-container');
  if (!searchResultsContainer) {
    searchResultsContainer = document.createElement('div');
    searchResultsContainer.id = 'search-results-container';
    searchResultsContainer.className = 'search-results-container';
    searchResultsContainer.style.display = 'none';
    searchResultsContainer.style.position = 'absolute';
    searchResultsContainer.style.top = '60px';
    searchResultsContainer.style.right = '20px';
    searchResultsContainer.style.width = '350px';
    searchResultsContainer.style.maxHeight = '400px';
    searchResultsContainer.style.overflowY = 'auto';
    searchResultsContainer.style.background = 'rgba(0, 0, 0, 0.8)';
    searchResultsContainer.style.borderRadius = '8px';
    searchResultsContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    searchResultsContainer.style.zIndex = '100';
    searchResultsContainer.style.backdropFilter = 'blur(5px)';
    searchResultsContainer.style.border = '1px solid rgba(1, 195, 141, 0.2)';
    
    const searchBox = searchInput.parentElement;
    searchBox.appendChild(searchResultsContainer);
  }
  
  // Function to perform the search
  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    // Clear previous results
    searchResultsContainer.innerHTML = '';
    
    // Remove any existing highlights
    removeAllHighlights();
    
    // If query is empty, hide results and return
    if (query.length < 2) {
      searchResultsContainer.style.display = 'none';
      return;
    }
    
    // Show the container
    searchResultsContainer.style.display = 'block';
    
    // Get all relevant content-containing elements
    const searchableElements = [
      ...document.querySelectorAll('.card p'),
      ...document.querySelectorAll('.card li'),
      ...document.querySelectorAll('.card td'),
      ...document.querySelectorAll('.cmd-line-content'),
      ...document.querySelectorAll('.cmd-output'),
      ...document.querySelectorAll('.practice-content p'),
      ...document.querySelectorAll('.policy-list li'),
      ...document.querySelectorAll('.note-content p')
    ];
    
    // Filter elements that contain the search query
    const matchingElements = searchableElements.filter(element => 
      element.textContent.toLowerCase().includes(query)
    );
    
    // Build search results
    if (matchingElements.length > 0) {
      const resultsHeader = document.createElement('div');
      resultsHeader.className = 'search-results-header';
      resultsHeader.textContent = `Found ${matchingElements.length} results for "${query}"`;
      resultsHeader.style.padding = '12px 15px';
      resultsHeader.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
      resultsHeader.style.color = 'rgba(1, 195, 141, 1)';
      resultsHeader.style.fontWeight = '600';
      searchResultsContainer.appendChild(resultsHeader);
      
      matchingElements.forEach((element, index) => {
        // Create result item
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.style.padding = '12px 15px';
        resultItem.style.borderBottom = index < matchingElements.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none';
        resultItem.style.cursor = 'pointer';
        
        // Find closest heading or title for context
        let contextTitle = '';
        let parent = element;
        while (parent && !contextTitle) {
          const closestCard = parent.closest('.card');
          if (closestCard) {
            const heading = closestCard.querySelector('h2, h3');
            if (heading) contextTitle = heading.textContent;
            break;
          }
          
          const closestCmdCard = parent.closest('.cmd-card');
          if (closestCmdCard) {
            const title = closestCmdCard.querySelector('.cmd-title');
            if (title) contextTitle = title.textContent;
            break;
          }
          
          parent = parent.parentElement;
        }
        
        if (!contextTitle) contextTitle = 'Unlabeled section';
        
        // Create result title
        const resultTitle = document.createElement('div');
        resultTitle.className = 'search-result-title';
        resultTitle.textContent = contextTitle;
        resultTitle.style.fontWeight = '600';
        resultTitle.style.marginBottom = '5px';
        resultTitle.style.color = 'white';
        
        // Create preview text
        const resultPreview = document.createElement('div');
        resultPreview.className = 'search-result-preview';
        resultPreview.textContent = getPreviewText(element.textContent, query);
        resultPreview.style.fontSize = '13px';
        resultPreview.style.color = 'rgba(255, 255, 255, 0.7)';
        
        resultItem.appendChild(resultTitle);
        resultItem.appendChild(resultPreview);
        
        // Handle click to navigate to the result
        resultItem.addEventListener('click', () => {
          // Navigate to and highlight the specific element
          highlightAndScrollTo(element, query);
          searchResultsContainer.style.display = 'none';
        });
        
        resultItem.addEventListener('mouseenter', () => {
          resultItem.style.backgroundColor = 'rgba(1, 195, 141, 0.1)';
        });
        
        resultItem.addEventListener('mouseleave', () => {
          resultItem.style.backgroundColor = 'transparent';
        });
        
        searchResultsContainer.appendChild(resultItem);
      });
    } else {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = `No results found for "${query}"`;
      noResults.style.padding = '20px';
      noResults.style.textAlign = 'center';
      noResults.style.color = 'rgba(255, 255, 255, 0.7)';
      searchResultsContainer.appendChild(noResults);
    }
  }
  
  // Helper function to highlight text within an element
  function highlightAndScrollTo(element, query) {
    // Remove existing highlights
    removeAllHighlights();
    
    // Get the original text
    const originalText = element.textContent;
    const lowerText = originalText.toLowerCase();
    
    // Find the position of the search term
    const startPos = lowerText.indexOf(query.toLowerCase());
    
    if (startPos >= 0) {
      // Create the highlighted HTML
      const beforeMatch = originalText.substring(0, startPos);
      const match = originalText.substring(startPos, startPos + query.length);
      const afterMatch = originalText.substring(startPos + query.length);
      
      // Create a temporary container to hold the text with highlight
      const tempContainer = document.createElement('span');
      
      // Add text before match
      if (beforeMatch) {
        tempContainer.appendChild(document.createTextNode(beforeMatch));
      }
      
      // Add highlighted match
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'text-highlight';
      highlightSpan.style.backgroundColor = 'rgba(1, 195, 141, 0.3)';
      highlightSpan.style.padding = '0 2px';
      highlightSpan.style.borderRadius = '2px';
      highlightSpan.appendChild(document.createTextNode(match));
      tempContainer.appendChild(highlightSpan);
      
      // Add text after match
      if (afterMatch) {
        tempContainer.appendChild(document.createTextNode(afterMatch));
      }
      
      // Replace element content with highlighted version
      element.innerHTML = '';
      element.appendChild(tempContainer);
      
      // Scroll the highlighted text into view
      highlightSpan.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Flash animation
      highlightSpan.style.transition = 'background-color 0.5s ease';
      setTimeout(() => {
        highlightSpan.style.backgroundColor = 'rgba(1, 195, 141, 0.6)';
        setTimeout(() => {
          highlightSpan.style.backgroundColor = 'rgba(1, 195, 141, 0.3)';
        }, 500);
      }, 100);
      
      // Store reference to the element for cleanup later
      currentHighlightedElement = element;
    } else {
      // Fallback: scroll to the element if text not found
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
  
  // Helper function to remove all highlights
  function removeAllHighlights() {
    document.querySelectorAll('.text-highlight').forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        // Replace the highlight span with its text content
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        
        // If this is inside a temporary container, replace with just the text
        if (parent.className === '' && parent.tagName === 'SPAN' && parent.parentNode) {
          const grandparent = parent.parentNode;
          const textContent = parent.textContent;
          grandparent.replaceChild(document.createTextNode(textContent), parent);
        }
      }
    });
  }
  
  // Helper function to get preview text around the query
  function getPreviewText(text, query) {
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(query);
    
    if (index !== -1) {
      const start = Math.max(0, index - 30);
      const end = Math.min(text.length, index + query.length + 30);
      let preview = text.substring(start, end).trim();
      
      if (start > 0) preview = '...' + preview;
      if (end < text.length) preview = preview + '...';
      
      return preview;
    }
    
    // If query not found directly, return first 60 chars
    return text.substring(0, 60).trim() + '...';
  }
  
  // Keep track of currently highlighted element
  let currentHighlightedElement = null;
  
  // Add event listener for input changes
  searchInput.addEventListener('input', performSearch);
  
  // Add event listener for the Enter key
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      performSearch();
      
      // Select the first result if available
      const firstResult = document.querySelector('.search-result-item');
      if (firstResult) {
        firstResult.click();
      }
    }
    
    // Clear results when Escape is pressed
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchResultsContainer.style.display = 'none';
      removeAllHighlights();
    }
  });
  
  // Close search results when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !searchResultsContainer.contains(e.target)) {
      searchResultsContainer.style.display = 'none';
    }
  });
  
  // Add style for the scrollbar
  const style = document.createElement('style');
  style.textContent = `
    .search-results-container::-webkit-scrollbar {
      width: 8px;
    }
    
    .search-results-container::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
    
    .search-results-container::-webkit-scrollbar-thumb {
      background-color: rgba(1, 195, 141, 0.3);
      border-radius: 4px;
    }
    
    .search-results-container::-webkit-scrollbar-thumb:hover {
      background-color: rgba(1, 195, 141, 0.5);
    }
  `;
  document.head.appendChild(style);
});
 // JavaScript for Get navigation and content elements
  document.addEventListener('DOMContentLoaded', function() {
    // Get navigation and content elements
    const tacticNavItems = document.querySelectorAll('.mitre-tactic-nav-item');
    const tacticRows = document.querySelectorAll('.mitre-row');
    const techniques = document.querySelectorAll('.mitre-technique');
    const detailsPanel = document.getElementById('technique-details');
    const closeDetails = document.getElementById('close-details');
    // Handle tactic navigation click
    tacticNavItems.forEach(item => {
      item.addEventListener('click', function() {
        // Update navigation active state
        tacticNavItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        // Show the corresponding tactic row and hide others
        const tacticId = this.getAttribute('data-tactic');
        tacticRows.forEach(row => {
          if (row.id === tacticId) {
            row.style.display = 'flex';
          } else {
            row.style.display = 'none';
          }
        });
        // Hide details panel when switching tactics
        detailsPanel.classList.remove('active');
      });
    });
    // Handle technique click to show details
    techniques.forEach(technique => {
      technique.addEventListener('click', function() {
        const techniqueId = this.getAttribute('data-technique');
        const techniqueName = this.querySelector('.mitre-technique-name').textContent;
        // Update details panel content (simplified for example)
        detailsPanel.querySelector('.mitre-details-title').textContent = techniqueName;
        detailsPanel.querySelector('.mitre-details-id').textContent = techniqueId;
        // Show details panel
        detailsPanel.classList.add('active');
      });
    });
    // Close details panel
    closeDetails.addEventListener('click', function() {
      detailsPanel.classList.remove('active');
    });
    // Initialize to show the first tactic
    tacticRows[0].style.display = 'flex';
  });
  document.addEventListener('DOMContentLoaded', function() {
    const techniques = document.querySelectorAll('.mitre-technique');
    techniques.forEach(technique => {
      technique.addEventListener('click', function() {
        const techniqueId = this.getAttribute('data-technique');
        const detailPanel = document.getElementById(`technique-details-${techniqueId}`);
        if (detailPanel) {
          // Hide all detail panels
          document.querySelectorAll('.mitre-details').forEach(panel => {
            panel.classList.remove('active');
          });
          // Show the specific panel
          detailPanel.classList.add('active');
          // Update the master panel class
          document.getElementById('technique-details').classList.add('active');
        }
      });
    });
    // Handle close buttons for each panel
    document.querySelectorAll('.mitre-close').forEach(closeBtn => {
      closeBtn.addEventListener('click', function() {
        document.querySelectorAll('.mitre-details').forEach(panel => {
          panel.classList.remove('active');
        });
      });
    });
  });
 // Wait for document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Find the install button
  const installButton = document.querySelector('.install-button');
  
  // Check if button exists and add click event listener
  if (installButton) {
    console.log('Install button found, adding click event listener');
    installButton.addEventListener('click', function() {
      console.log('Install button clicked');
      installExcelList();
    });
  } else {
    console.error('Install button not found');
  }
});

// Function to handle Excel list installation
function installExcelList() {
  try {
    console.log('Starting Excel export process');
    
    // Check if XLSX is available
    if (typeof XLSX === 'undefined') {
      console.error('XLSX library not loaded');
      alert('XLSX library not loaded. Please make sure the library is properly included.');
      return;
    }
    
    // Create cover page data
    const coverPageData = [
      ["Critical Windows Event IDs"],
      ["Created By", "Sarah AUaber"],
      ["Website", "hackthelog.com"],
      ["", ""],
      ["", ""] // Empty rows for spacing
    ];
    
    // Get table data from your HTML table
    const table = document.querySelector('.log-table');
    
    if (!table) {
      console.error('Could not find the table with class "log-table"');
      alert('Could not find the table. Please make sure the table has the class "log-table".');
      return;
    }
    
    console.log('Table found, extracting data');
    
    // Extract headers
    const headers = [];
    const headerCells = table.querySelectorAll('thead th');
    headerCells.forEach(cell => {
      headers.push(cell.textContent.trim());
    });
    
    // Extract rows
    const rows = [];
    const rowElements = table.querySelectorAll('tbody tr');
    rowElements.forEach(row => {
      const rowData = [];
      const cells = row.querySelectorAll('td');
      cells.forEach(cell => {
        rowData.push(cell.textContent.trim());
      });
      rows.push(rowData);
    });
    
    // Combine headers and rows
    const tableData = [headers, ...rows];
    
    console.log('Data extracted, creating workbook');
    
    // Create a workbook
    const wb = XLSX.utils.book_new();
    
    // Create and add cover page worksheet
    const wsCover = XLSX.utils.aoa_to_sheet(coverPageData);
    
    // Set column widths for better formatting on cover page
    wsCover['!cols'] = [{ wch: 15 }, { wch: 30 }];
    
    // Add cover page to workbook
    XLSX.utils.book_append_sheet(wb, wsCover, "Cover Page");
    
    // Create and add data worksheet
    const wsData = XLSX.utils.aoa_to_sheet(tableData);
    XLSX.utils.book_append_sheet(wb, wsData, "Event IDs");
    
    console.log('Workbook created, initiating download');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "Critical_Windows_Event_IDs.xlsx");
    
    console.log('Excel export completed successfully');
  } catch (error) {
    console.error('Error generating Excel file:', error);
    alert('There was an error generating the Excel file: ' + error.message);
  }
}

// Fallback in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('Document already loaded, adding event listener directly');
  const installButton = document.querySelector('.install-button');
  
  if (installButton) {
    console.log('Install button found (fallback), adding click event listener');
    installButton.addEventListener('click', function() {
      console.log('Install button clicked (fallback)');
      installExcelList();
    });
  } else {
    console.error('Install button not found (fallback)');
  }
}
