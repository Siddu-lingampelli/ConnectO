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
      <main className="flex-1 container mx-auto px-4 py-12">
        <WebsiteReviewForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </main>
      <Footer />
    </div>
  );
};

export default SubmitReview;
