import Header from './components/Header';
import Hero from './components/Hero';
import ArticlesSection from './components/ArticlesSection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ArticlesSection />
      <Footer />
    </div>
  );
}
