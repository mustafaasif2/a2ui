# Testing Guide for A2UI Implementation

This guide helps you test the A2UI implementation, especially the fixes we made for Button, Text, and TextField components.

## Prerequisites

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create `packages/backend/.env`:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   PORT=3001
   ```

## Running the Application

### Start Both Services
```bash
pnpm dev
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### Individual Services
```bash
# Frontend only
pnpm run dev:frontend

# Backend only
pnpm run dev:backend
```

## Available Components

A2UI now supports the following components:

**Layout Components:**
- `Row` - Horizontal layout container
- `Column` - Vertical layout container
- `Card` - Container with shadow and padding
- `List` - List container (static or dynamic with templates)

**Text Components:**
- `Text` - Text display (supports usageHint: "h1", "h2", "h3", "body", "small")
- `Link` - Clickable links

**Form Components:**
- `TextField` - Single-line text input
- `TextArea` - Multi-line text input
- `Select` - Dropdown selection
- `Checkbox` - Checkbox input

**Interactive Components:**
- `Button` - Clickable button with actions

**Display Components:**
- `Image` - Image display
- `Badge` - Status indicators/tags (variants: default, primary, success, warning, error)
- `Divider` - Visual separator (horizontal/vertical)

## Test Scenarios

### 1. Test Button with Children (Fixed Issue)

**Test:** Button should render child components correctly, not cast them to strings.

**Try these prompts:**
```
Create a button with text "Click Me" inside
```

```
Create a button that contains a Text component saying "Submit"
```

**Expected behavior:**
- Button should render the child Text component properly
- Button should display the text content from the child component
- No console errors about invalid children

**Verify in browser console:**
- No warnings about children being cast to strings
- Button renders with proper React children

---

### 2. Test Text Component with Children (Fixed Issue)

**Test:** Text component should render children when provided.

**Try these prompts:**
```
Create a Text component that says "Hello World"
```

```
Create a Column with a Text component inside that says "Welcome"
```

**Expected behavior:**
- Text component displays content correctly
- When used as a child, it renders properly
- No string casting errors

---

### 3. Test TextField Data Binding (Consolidated Update)

**Test:** TextField should update data model once (not twice) and notify server.

**Try these prompts:**
```
Create a form with a name field
```

```
Create a TextField for email input with label "Email"
```

**Test steps:**
1. Type in the TextField
2. Open browser DevTools → Network tab
3. Check that only ONE data model update occurs per keystroke
4. Verify the `inputChange` action is sent to the server

**Expected behavior:**
- TextField updates immediately (optimistic update)
- Only one data model update per change
- `inputChange` action sent to server
- Server can respond with `dataModelUpdate` if needed

**Verify in browser console:**
- Check for any duplicate update warnings
- Network tab shows `inputChange` actions being sent

---

### 4. Test Complex UI Generation

**Test:** Multiple components working together.

**Try these prompts:**
```
Create a card with a title "My Card", a description text, and a submit button
```

```
Create a form with name and email fields, and a submit button at the bottom
```

```
Create a list of items: Apple, Banana, Orange
```

**Expected behavior:**
- All components render correctly
- Children are properly nested
- Actions work when buttons are clicked
- No rendering errors

---

### 5. Test Data Binding and Two-Way Binding

**Test:** TextField value binding and updates.

**Try this prompt:**
```
Create a TextField with label "Name" and a Text component below it that shows the name value
```

**Test steps:**
1. Type in the TextField
2. Verify the Text component below updates in real-time
3. Check that data model is updated correctly

**Expected behavior:**
- TextField value updates immediately
- Text component reflects the value from data model
- Two-way binding works correctly

---

### 6. Test Action Handling

**Test:** Button actions are sent correctly to the server.

**Try this prompt:**
```
Create a button that says "Send Message"
```

**Test steps:**
1. Click the button
2. Open browser DevTools → Network tab
3. Verify `userAction` message is sent with:
   - `name`: action name
   - `sourceComponentId`: button component ID
   - `surfaceId`: surface ID
   - `timestamp`: ISO 8601 timestamp
   - `context`: action context (if any)

**Expected behavior:**
- Action is sent to server
- All required A2UI v0.8 fields are present
- No errors in console

---

### 7. Test New Components - Image

**Try these prompts:**
```
Create a card with an image and a caption
```

```
Show me an image with alt text
```

**Expected behavior:**
- Image displays correctly
- Alt text is set for accessibility
- Image is responsive

---

### 8. Test New Components - Link

**Try these prompts:**
```
Create a link to https://example.com
```

```
Create a card with a title and a "Learn More" link
```

**Expected behavior:**
- Link is clickable
- Opens in correct target (same tab or new tab)
- Proper styling and hover effects

---

### 9. Test New Components - Select Dropdown

**Try these prompts:**
```
Create a form with a country selection dropdown
```

```
Create a select field with options: Red, Green, Blue
```

**Expected behavior:**
- Dropdown shows options
- Selection updates data model
- Label displays correctly

---

### 10. Test New Components - TextArea

**Try these prompts:**
```
Create a form with a comments textarea
```

```
Create a feedback form with name, email, and message fields
```

**Expected behavior:**
- Multi-line input works
- Resizable (vertical)
- Updates data model on change

---

### 11. Test New Components - Checkbox

**Try these prompts:**
```
Create a form with a "I agree to terms" checkbox
```

```
Create a preferences form with multiple checkboxes
```

**Expected behavior:**
- Checkbox toggles correctly
- Updates data model
- Label is clickable

---

### 12. Test New Components - Badge

**Try these prompts:**
```
Create a card with a status badge showing "Active"
```

```
Show me badges with different colors: New, Popular, Featured
```

**Expected behavior:**
- Badge displays with proper styling
- Variants show different colors
- Text is readable

---

### 13. Test New Components - Divider

**Try these prompts:**
```
Create a page with sections separated by dividers
```

```
Create a form with a divider between sections
```

**Expected behavior:**
- Divider displays correctly
- Proper spacing
- Horizontal or vertical orientation

---

### 14. Test Text Headings

**Try these prompts:**
```
Create a page with a main heading and subheadings
```

```
Create a card with a title (h2) and description
```

**Expected behavior:**
- Headings use proper HTML elements (h1, h2, h3)
- Proper font sizes and weights
- Good visual hierarchy

---

### 15. Test Complex UI Combinations

**Try these prompts:**
```
Create a product card with image, title, description, price badge, and buy button
```

```
Create a login form with email field, password field, remember me checkbox, and login button
```

```
Create a dashboard with header, sidebar links, main content cards, and status badges
```

**Expected behavior:**
- All components work together
- Proper layout and spacing
- Form data collected correctly on submit

---

## Comprehensive Examples

### Example 1: Product Card
```
Create a product card with:
- Product image
- Product name as heading
- Description text
- Price badge
- Add to cart button
```

### Example 2: Contact Form
```
Create a contact form with:
- Name field
- Email field
- Subject dropdown (General, Support, Sales)
- Message textarea
- Terms checkbox
- Submit button
```

### Example 3: User Profile
```
Create a user profile card with:
- Profile image
- User name as heading
- Email link
- Status badge (Online/Offline)
- Edit button
```

### Example 4: Navigation Menu
```
Create a navigation menu with:
- Logo image
- Links: Home, About, Services, Contact
- Divider
- Login button
```

### Example 5: Dashboard Layout
```
Create a dashboard with:
- Header with title and user badge
- Sidebar with navigation links
- Main content area with cards
- Each card has title, content, and action button
```

### Example 6: Blog Post
```
Create a blog post layout with:
- Main heading (h1)
- Author info with image and name
- Divider
- Post content text
- Tags as badges
- Share button
```

### Example 7: Settings Form
```
Create a settings form with:
- Section heading (h2)
- Theme select dropdown
- Notifications checkbox
- Email preferences checkbox
- Divider
- Save button
```

### Example 8: Status Card
```
Create a status card showing:
- Status badge (Success/Warning/Error)
- Status title
- Description text
- Action button
```

---

## Manual Testing Checklist

### Component Rendering
- [ ] Button renders with child components (not as strings)
- [ ] Text component renders children correctly
- [ ] TextField updates data model only once per change
- [ ] Image displays with proper src and alt
- [ ] Link navigates correctly
- [ ] Select dropdown shows options
- [ ] TextArea allows multi-line input
- [ ] Checkbox toggles correctly
- [ ] Badge displays with proper variant styling
- [ ] Divider separates sections visually
- [ ] Text headings (h1, h2, h3) render correctly
- [ ] All components render without errors

### Data Binding
- [ ] TextField two-way binding works
- [ ] Data model updates correctly
- [ ] Components reflect data model changes

### Actions
- [ ] Button clicks send proper `userAction` messages
- [ ] TextField changes send `inputChange` actions
- [ ] Actions include all required A2UI v0.8 fields

### Error Handling
- [ ] Invalid components show error UI (not crash)
- [ ] Errors are logged to console
- [ ] Error messages are sent to server

### Performance
- [ ] No duplicate data model updates
- [ ] No unnecessary re-renders
- [ ] Smooth UI updates

## Browser DevTools Tips

### Network Tab
- Filter by "SSE" or "event-stream" to see server events
- Check request/response for action messages
- Verify message format matches A2UI spec

### Console
- Check for warnings about children
- Verify no duplicate update logs
- Look for A2UI error messages

### React DevTools
- Inspect component tree
- Check component props
- Verify children are React nodes (not strings)

## Troubleshooting

### Backend not starting
- Check `.env` file exists in `packages/backend/`
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set
- Check port 3001 is not in use

### Frontend not connecting
- Verify backend is running on port 3001
- Check CORS settings
- Verify `VITE_API_URL` in frontend config

### Components not rendering
- Check browser console for errors
- Verify component registry has all components
- Check A2UI message format in Network tab

### Actions not working
- Verify action handler is connected
- Check Network tab for action messages
- Verify action format matches A2UI v0.8 spec

## Quick Test Commands

```bash
# Type check everything
pnpm type-check

# Build everything
pnpm build

# Run with verbose logging (add console.logs as needed)
```

## Next Steps

After manual testing, consider:
1. Adding unit tests for components
2. Adding integration tests for message flow
3. Adding E2E tests with Playwright/Cypress
4. Performance testing with many components
