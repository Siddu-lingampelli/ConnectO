import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import WebsiteReviewForm from '../components/WebsiteReviewForm';

const SubmitReview = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">\n        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <WebsiteReviewForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubmitReview;

