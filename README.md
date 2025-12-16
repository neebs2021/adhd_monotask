# MonoTask - Focus on One Thing

A minimal, distraction-free web app designed to help you focus on a single task at a time. Perfect for people with ADHD or anyone who struggles with task management overwhelm.

## Features

- **Single Task Focus**: Only one task can be active at a time - complete it before moving on
- **Pure Black Background**: Minimal visual distractions
- **Optional Timer**: Add a countdown timer to your task (optional)
- **Task Persistence**: Your current task is saved locally and survives page refreshes
- **Completed Tasks Log**: Keep track of completed tasks in an unobtrusive corner list
- **Desktop Notifications**: Get notified when your timer runs out
- **Zero Dependencies**: Pure HTML, CSS, and vanilla JavaScript
- **Works Offline**: Functions completely offline after first load

## Usage

1. **Add a Task**: Enter a title (required), description (optional), and timer (optional)
2. **Focus**: The task displays prominently in large text
3. **Use Timer** (if set): Start, pause, or reset the countdown
4. **Complete**: Click "Complete Task" when done to log it and move to the next task

## GitHub Pages Deployment

This app is designed to be hosted on GitHub Pages:

1. Push this repository to GitHub
2. Go to repository Settings → Pages
3. Select "main" branch as source
4. Your app will be live at `https://neebs2021.github.io/adhd_monotask/`

## Local Development

Simply open `index.html` in any modern web browser. No build process or dependencies required.

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- localStorage
- CSS Flexbox
- Notifications API (optional)

## License

Free to use and modify as needed.
