import { createBrowserRouter } from 'react-router';
import { MainPage } from './pages/MainPage';
import { AskQuestionPage } from './pages/AskQuestionPage';
import { ResultsPage } from './pages/ResultsPage';
import { RootLayout } from './layouts/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: MainPage },
      { path: 'ask', Component: AskQuestionPage },
      { path: 'results', Component: ResultsPage },
    ],
  },
]);
