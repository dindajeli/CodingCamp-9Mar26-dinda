# Implementation Plan: Productivity Dashboard

## Overview

This implementation plan breaks down the Productivity Dashboard into discrete coding tasks. The dashboard will be built using vanilla JavaScript, HTML, and CSS with a component-based architecture. Each task builds incrementally, starting with the project structure, then implementing core modules (Storage Manager, Greeting, Timer, Tasks, Quick Links), and finally wiring everything together with the App Initializer.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create directory structure: css/, js/, and root index.html
  - Write semantic HTML structure with containers for greeting, timer, tasks, and quick links
  - Include meta tags for viewport and charset
  - Link to css/styles.css and js/app.js
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 2. Implement Storage Manager module
  - [x] 2.1 Create StorageManager with save, load, and remove methods
    - Implement JSON serialization/deserialization
    - Add error handling for quota exceeded and parse errors
    - Return null for missing keys instead of throwing errors
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2_
  
  - [ ]* 2.2 Write property test for storage round-trip
    - **Property 10: Task storage round-trip preserves data**
    - **Property 15: Link storage round-trip preserves data**
    - **Validates: Requirements 3.7, 4.5, 5.6, 6.3**

- [ ] 3. Implement Greeting Module
  - [x] 3.1 Create GreetingModule with init method
    - Implement time and date display using toLocaleTimeString and toLocaleDateString
    - Implement greeting logic based on hour (5-11: morning, 12-16: afternoon, 17-4: evening)
    - Set up setInterval to update display every second
    - Store intervalId for cleanup
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ]* 3.2 Write property test for greeting time-of-day logic
    - **Property 1: Greeting matches time of day**
    - **Validates: Requirements 1.3, 1.4, 1.5**

- [ ] 4. Implement Timer Module
  - [x] 4.1 Create TimerModule with init method and internal state
    - Initialize state with totalSeconds: 1500, remainingSeconds: 1500, isRunning: false
    - Implement formatTime function to display MM:SS with zero-padding
    - Implement start, stop, and reset button event handlers
    - Implement countdown logic that decrements remainingSeconds every second
    - Stop automatically when reaching zero
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ]* 4.2 Write property test for timer reset functionality
    - **Property 2: Timer reset restores initial state**
    - **Validates: Requirements 2.5**
  
  - [ ]* 4.3 Write property test for timer format function
    - **Property 3: Timer format displays MM:SS correctly**
    - **Validates: Requirements 2.7**

- [x] 5. Checkpoint - Verify greeting and timer functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Tasks Module
  - [x] 6.1 Create TasksModule with init method and internal state
    - Define task data model: id, text, completed, createdAt
    - Implement generateId function using timestamp + random number
    - Load tasks from Local Storage on initialization
    - Render empty state message when no tasks exist
    - _Requirements: 3.1, 3.2, 3.7, 3.8, 4.5, 4.6_
  
  - [x] 6.2 Implement add task functionality
    - Create form submit handler to add new task
    - Validate task text (non-empty after trimming, max 500 characters)
    - Add task to internal state array
    - Re-render task list
    - Save to Local Storage
    - _Requirements: 3.1, 4.1_
  
  - [ ]* 6.3 Write property test for adding tasks
    - **Property 4: Adding task increases list size**
    - **Property 5: Tasks maintain creation order**
    - **Validates: Requirements 3.1, 3.2**
  
  - [x] 6.4 Implement edit task functionality
    - Add double-click event listener for inline editing
    - Save changes on blur or enter key
    - Validate edited text
    - Update task in state array
    - Re-render task list
    - Save to Local Storage
    - _Requirements: 3.3, 4.2_
  
  - [ ]* 6.5 Write property test for editing tasks
    - **Property 6: Editing task preserves identity**
    - **Validates: Requirements 3.3**
  
  - [x] 6.6 Implement mark done/undone functionality
    - Add click event listener on checkbox or task element
    - Toggle completed status in state array
    - Apply visual styling for completed tasks
    - Re-render task list
    - Save to Local Storage
    - _Requirements: 3.4, 4.3_
  
  - [ ]* 6.7 Write property test for marking tasks as done
    - **Property 7: Marking task as done updates status**
    - **Validates: Requirements 3.4**
  
  - [x] 6.8 Implement delete task functionality
    - Add delete button click handler
    - Remove task from state array by id
    - Re-render task list
    - Save to Local Storage
    - _Requirements: 3.5, 4.4_
  
  - [ ]* 6.9 Write property test for deleting tasks
    - **Property 8: Deleting task removes it from list**
    - **Validates: Requirements 3.5**
  
  - [ ]* 6.10 Write property test for task persistence
    - **Property 9: Task modifications persist to storage**
    - **Validates: Requirements 3.6, 4.1, 4.2, 4.3, 4.4**

- [ ] 7. Implement Quick Links Module
  - [x] 7.1 Create QuickLinksModule with init method and internal state
    - Define link data model: id, name, url, createdAt
    - Implement generateId function using timestamp + random number
    - Load links from Local Storage on initialization
    - Render empty state message when no links exist
    - _Requirements: 5.2, 5.6, 5.7, 6.3, 6.4_
  
  - [x] 7.2 Implement add link functionality
    - Create form submit handler to add new link
    - Validate link name (non-empty after trimming, max 50 characters)
    - Validate URL format (must start with http:// or https://)
    - Add link to internal state array
    - Re-render link list
    - Save to Local Storage
    - _Requirements: 5.1, 6.1_
  
  - [ ]* 7.3 Write property test for adding links
    - **Property 11: Adding link increases list size**
    - **Validates: Requirements 5.1**
  
  - [x] 7.4 Implement link rendering with click handlers
    - Render each link as a clickable button
    - Add click handler to open URL in new tab with target="_blank" and rel="noopener noreferrer"
    - _Requirements: 5.2, 5.3_
  
  - [ ]* 7.5 Write property test for link rendering
    - **Property 12: All links appear in rendered output**
    - **Validates: Requirements 5.2**
  
  - [x] 7.6 Implement delete link functionality
    - Add delete button click handler
    - Remove link from state array by id
    - Re-render link list
    - Save to Local Storage
    - _Requirements: 5.4, 6.2_
  
  - [ ]* 7.7 Write property test for deleting links
    - **Property 13: Deleting link removes it from list**
    - **Validates: Requirements 5.4**
  
  - [ ]* 7.8 Write property test for link persistence
    - **Property 14: Link modifications persist to storage**
    - **Validates: Requirements 5.5, 6.1, 6.2**

- [x] 8. Checkpoint - Verify tasks and links functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement CSS styling
  - [x] 9.1 Create css/styles.css with base styles
    - Add CSS reset and box-sizing
    - Define color scheme and typography
    - Style body and main container layout
    - _Requirements: 9.1, 9.4_
  
  - [x] 9.2 Style greeting section
    - Style time, date, and greeting text
    - Ensure readable typography and visual hierarchy
    - _Requirements: NFR-3_
  
  - [x] 9.3 Style timer section
    - Style timer display and control buttons
    - Add visual feedback for button interactions
    - _Requirements: NFR-3, 8.1_
  
  - [x] 9.4 Style tasks section
    - Style task list, task items, checkboxes, and delete buttons
    - Add completed task styling (strikethrough, opacity)
    - Style empty state message
    - Style inline editing state
    - _Requirements: NFR-3, 8.1_
  
  - [x] 9.5 Style quick links section
    - Style link buttons and delete buttons
    - Add hover and active states
    - Style empty state message
    - _Requirements: NFR-3, 8.1_
  
  - [x] 9.6 Add responsive design and polish
    - Ensure clean, minimal interface
    - Add spacing and layout adjustments
    - Test visual design across different screen sizes
    - _Requirements: NFR-1, NFR-3_

- [ ] 10. Implement App Initializer and wire components together
  - [x] 10.1 Create App object with init method
    - Wait for DOMContentLoaded event
    - Query DOM for all container elements
    - Call init on GreetingModule with greeting container
    - Call init on TimerModule with timer container
    - Call init on TasksModule with tasks container
    - Call init on QuickLinksModule with links container
    - Add error handling for initialization failures
    - _Requirements: 9.4_
  
  - [x] 10.2 Add input validation and error handling
    - Implement validation messages for invalid task text
    - Implement validation messages for invalid URLs
    - Add character counters for task text and link names
    - Handle Local Storage errors (quota exceeded, parse errors, access denied)
    - _Requirements: 8.1_

- [ ] 11. Final testing and browser compatibility verification
  - [ ]* 11.1 Run all property-based tests with fast-check
    - Verify all 15 properties pass with minimum 100 iterations each
    - _Requirements: All functional requirements_
  
  - [ ]* 11.2 Write unit tests for edge cases
    - Test timer at zero stops counting
    - Test empty Local Storage initializes empty lists
    - Test whitespace-only task text is rejected
    - Test URL without protocol is rejected
    - Test Local Storage error handling
    - _Requirements: 8.1, NFR-2_
  
  - [x] 11.3 Manual browser compatibility testing
    - Test in Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
    - Verify all functionality works across browsers
    - Test performance and responsiveness
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 12. Final checkpoint - Complete verification
  - Ensure all tests pass, verify browser compatibility, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- All modules use the Revealing Module Pattern for encapsulation
- Single CSS file (css/styles.css) and single JavaScript file (js/app.js) as per constraints
- Timer state is NOT persisted to Local Storage (resets on page load)
- All data operations go through StorageManager for consistency
- Checkpoints ensure incremental validation at logical breakpoints
