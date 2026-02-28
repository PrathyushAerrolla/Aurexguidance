# Career Guidance Platform - Updated TODO

## New Requirements - Phase 2

### Authentication System
- [ ] Replace OAuth with email/password authentication
- [ ] Create Login page with email and password fields
- [ ] Create Sign Up page with registration form
- [ ] Implement secure password hashing (bcrypt)
- [ ] Add session management with JWT tokens
- [ ] Add "Remember me" functionality
- [ ] Implement password reset functionality
- [ ] Add email verification for new accounts

### Personal Info & Timeline Integration
- [ ] Create personal info page after login
- [ ] Display user profile information
- [ ] Link user input timeline with suggested career plans
- [ ] Show user's input timeline on career plan dashboard
- [ ] Validate timeline input and display on timeline visualization
- [ ] Add timeline editing capability
- [ ] Create milestone tracker based on user timeline

### Skills Checklist
- [ ] Create separate skills checklist component
- [ ] Link skills checklist to career development timeline
- [ ] Add checkbox functionality to mark skills as completed
- [ ] Display progress percentage for skills
- [ ] Add skill completion dates
- [ ] Create skill dependency tracking
- [ ] Show recommended learning order for skills

### Plan Management
- [ ] Implement save career plan functionality
- [ ] Create "My Plans" page to view past saved plans
- [ ] Add plan listing with metadata (created date, status, progress)
- [ ] Implement plan editing functionality
- [ ] Add plan deletion with confirmation
- [ ] Create plan versioning/history
- [ ] Add plan duplication feature
- [ ] Implement plan search and filtering

### Export & Share Features
- [ ] Add "Share Plan" functionality with link generation
- [ ] Implement social media sharing (LinkedIn, Twitter)
- [ ] Add "Export as PDF" feature
- [ ] Add "Export as Image" feature (mindmap + timeline)
- [ ] Create shareable plan links with access control
- [ ] Add email sharing option
- [ ] Implement QR code generation for plan sharing
- [ ] Add export customization options

### Save Progress
- [ ] Add "Save Progress" button on dashboard
- [ ] Implement auto-save functionality
- [ ] Create progress tracking system
- [ ] Display last saved timestamp
- [ ] Add progress history/changelog
- [ ] Implement undo/redo functionality
- [ ] Create progress backup system

### Dark/Light Mode
- [ ] Implement theme switcher component
- [ ] Add dark mode CSS variables
- [ ] Update all components for dark mode
- [ ] Add theme persistence (localStorage)
- [ ] Create smooth theme transitions
- [ ] Add system preference detection
- [ ] Test all pages in both themes
- [ ] Ensure accessibility in both modes

### Edit Plan
- [ ] Create edit plan form
- [ ] Allow editing of career goals
- [ ] Allow editing of education level
- [ ] Allow editing of skills
- [ ] Allow editing of timeline
- [ ] Implement change tracking
- [ ] Add edit history
- [ ] Create comparison view for changes

## Completed Features (Previous)

### Phase 1: Database & Schema
- [x] Create career_plans table
- [x] Create milestones table
- [x] Create skills table
- [x] Create documents table
- [x] Create email_notifications table
- [x] Create database relationships

### Phase 2: Input Form & Landing Page
- [x] Create landing page with hero section
- [x] Build input form with name, education, goals
- [x] Add age field with validation
- [x] Add prior skills multi-select
- [x] Add optional timeline input
- [x] Implement form validation
- [x] Add Scandinavian aesthetic styling

### Phase 3: AI-Powered Career Guidance
- [x] Integrate LLM API for career analysis
- [x] Generate career recommendations
- [x] Generate skill gaps analysis
- [x] Generate career progression steps
- [x] Create tRPC procedures for backend
- [x] Add error handling and validation

### Phase 4: Visualizations
- [x] Create interactive mindmap component
- [x] Create timeline visualization
- [x] Add zoom/pan controls to mindmap
- [x] Fix branch overlapping issues
- [x] Add legend and color coding
- [x] Implement responsive design

### Phase 5: Skills & Resources
- [x] Create skills section component
- [x] Create resources section with links
- [x] Add external resource links (Coursera, Udemy, etc.)
- [x] Implement clickable course links
- [x] Add difficulty levels to resources
- [x] Create quick links panel

### Phase 6: Document Management
- [x] Implement document upload
- [x] Integrate S3 storage
- [x] Create document listing
- [x] Add document deletion
- [x] Implement file type validation

### Phase 7: Notifications
- [x] Create email notification system
- [x] Add notification preferences
- [x] Implement milestone reminders
- [x] Create notification templates

### Bug Fixes (Previous)
- [x] Fixed authentication flow
- [x] Fixed form re-entry issue
- [x] Fixed mindmap overlapping
- [x] Added age field
- [x] Added prior skills field
- [x] Added optional timeline
- [x] Added interactive buttons
- [x] Added resource links
