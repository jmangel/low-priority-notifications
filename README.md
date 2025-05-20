# Low Priority Notifications App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Google OAuth and Drive API Setup

This application uses Google OAuth to authenticate users and access Google Drive. Users can select which folder they want to use with the application. Follow these steps to set up:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Drive API for your project
4. Enable the Google Picker API for your project
5. Create OAuth 2.0 credentials:
   - Go to "Credentials" in the sidebar
   - Click "Create Credentials" -> "OAuth client ID"
   - Select "Web application" as the application type
   - Add your authorized JavaScript origins (e.g., `http://localhost:3000` for development and `https://johnmangel.github.io` for GitHub Pages)
   - Add your authorized redirect URIs (e.g., `http://localhost:3000` for development and `https://johnmangel.github.io/low-priority-notifications` for GitHub Pages)
   - Click "Create"
6. Create an API Key:
   - Go to "Credentials" in the sidebar
   - Click "Create Credentials" -> "API Key"
   - Optionally restrict the API key to only the Google Drive API and Google Picker API
7. Create a `.env` file in the root directory of your project
8. Add your Google Client ID and API Key to the `.env` file:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
   REACT_APP_GOOGLE_PICKER_API_KEY=YOUR_GOOGLE_API_KEY_HERE
   ```

## Authentication Flow

The authentication flow for this application works as follows:

1. When a user first opens the app, they are prompted to sign in with Google
2. After signing in, they are prompted to select a Google Drive folder
3. The selected folder ID is saved in the browser's localStorage
4. On subsequent visits, if the user is still signed in and a folder has been selected, they will be automatically directed to the main application
5. Users can change the selected folder at any time from within the application

## Deployment to GitHub Pages

This application is set up to be deployed to GitHub Pages. To deploy to GitHub Pages:

1. Make sure you have properly configured your Google Cloud Console:

   - Add `https://johnmangel.github.io` to the authorized JavaScript origins
   - Add `https://johnmangel.github.io/low-priority-notifications` to the authorized redirect URIs

2. Push your changes to GitHub:

   ```
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. Deploy to GitHub Pages:

   ```
   npm run deploy
   ```

4. Your app will be available at: `https://johnmangel.github.io/low-priority-notifications`

5. Note that GitHub Pages uses HashRouter instead of BrowserRouter, so URLs will have a # symbol (e.g., `/#/login`)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run deploy`

Builds the app and deploys it to GitHub Pages using the gh-pages package.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
