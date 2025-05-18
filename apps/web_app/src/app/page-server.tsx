import HomePage from './page';

// This is a server component that can export metadata
export const metadata = {
  hideHeader: true
};

export default function HomePageWrapper() {
  return <HomePage />;
}
